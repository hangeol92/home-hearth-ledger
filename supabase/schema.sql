-- Households: family unit identified by a shared invite code
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

-- Profiles: one row per Supabase Auth user
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid references households(id) on delete set null,
  display_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz default now()
);

-- Backfill column if table already exists
alter table profiles add column if not exists is_admin boolean not null default false;

-- Family members (named slots inside a household, not auth users)
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz default now()
);

-- Transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  jar text not null check (jar in ('giving', 'investing', 'savings', 'living', 'seed')),
  sub_category text not null default '',
  category text,
  note text not null default '',
  date date not null,
  member_id uuid references members(id) on delete set null,
  allocation_snapshot jsonb,
  created_at timestamptz default now()
);

create index if not exists transactions_household_date on transactions(household_id, date desc);
create index if not exists transactions_member on transactions(member_id);

-- Budgets
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  jar text not null,
  amount numeric not null,
  month text not null, -- YYYY-MM
  unique (household_id, jar, month)
);

-- Jars (balance + allocation percentage per household)
create table if not exists jars (
  id text not null check (id in ('giving', 'investing', 'savings', 'living', 'seed')),
  household_id uuid not null references households(id) on delete cascade,
  balance numeric not null default 0,
  allocation_pct numeric not null default 0 check (allocation_pct >= 0 and allocation_pct <= 100),
  primary key (household_id, id)
);

-- Atomic jar balance adjustment (prevents race condition from read-modify-write)
create or replace function adjust_jar_balance(p_household_id uuid, p_jar_id text, p_delta numeric)
returns void language plpgsql security definer as $$
begin
  update jars
  set balance = balance + p_delta
  where household_id = p_household_id and id = p_jar_id;
  if not found then
    raise exception 'Jar % not found in household %', p_jar_id, p_household_id;
  end if;
end;
$$;

-- Subscriptions (managed by RevenueCat webhook → Edge Function)
create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'annual')),
  platform text not null check (platform in ('ios', 'android', 'web')),
  status text not null check (status in ('active', 'cancelled', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function update_subscriptions_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_subscriptions_updated_at();

-- Admin stats: returns aggregated metrics; only accessible to is_admin = true users
create or replace function get_admin_stats()
returns json language plpgsql security definer as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;

  return (
    select json_build_object(
      'total_users',            (select count(*) from profiles),
      'active_subscriptions',   (select count(*) from subscriptions where status = 'active' and expires_at > now()),
      'new_users_7d',           (select count(*) from profiles where created_at > now() - interval '7 days'),
      'total_households',       (select count(*) from households),
      'total_transactions',     (select count(*) from transactions),
      'monthly_subscriptions',  (select count(*) from subscriptions where status = 'active' and plan = 'monthly'),
      'annual_subscriptions',   (select count(*) from subscriptions where status = 'active' and plan = 'annual')
    )
  );
end;
$$;

-- Admin user list: recent signups with subscription status
create or replace function get_admin_users(p_limit int default 30)
returns table (
  id uuid, display_name text, created_at timestamptz,
  household_id uuid, sub_status text, sub_plan text, sub_expires_at timestamptz
) language plpgsql security definer as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Unauthorized';
  end if;

  return query
    select
      p.id, p.display_name, p.created_at, p.household_id,
      s.status, s.plan, s.expires_at
    from profiles p
    left join subscriptions s on s.user_id = p.id
    order by p.created_at desc
    limit p_limit;
end;
$$;

-- Atomic invite code join: lookup (bypasses RLS) + profile update + code rotation
create or replace function join_household_by_code(code text)
returns uuid language plpgsql security definer as $$
declare
  h_id uuid;
  new_code text;
begin
  select id into h_id from households where invite_code = upper(trim(code));
  if h_id is null then
    raise exception 'Invalid invite code';
  end if;

  update profiles set household_id = h_id where id = auth.uid();

  -- Rotate code using pgcrypto-safe random UUID fragment
  new_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  update households set invite_code = new_code where id = h_id;

  return h_id;
end;
$$;
