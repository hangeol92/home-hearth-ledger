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
  -- 수입 거래는 jar 없이 저장(항아리에 비율 분배), 지출은 특정 jar에서 차감
  jar text check (
    jar in ('giving', 'investing', 'savings', 'living', 'seed')
    or (type = 'income' and jar is null)
  ),
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
-- security definer bypasses RLS, so the caller's household is verified explicitly
create or replace function adjust_jar_balance(p_household_id uuid, p_jar_id text, p_delta numeric)
returns void language plpgsql security definer
set search_path = public
as $$
begin
  if current_household_id() is null
     or p_household_id is distinct from current_household_id() then
    raise exception 'Unauthorized';
  end if;
  update jars
  set balance = balance + p_delta
  where household_id = p_household_id and id = p_jar_id;
  if not found then
    raise exception 'Jar % not found in household %', p_jar_id, p_household_id;
  end if;
end;
$$;

-- Realtime: publish household tables so family members see each other's
-- changes live (client subscribes via postgres_changes; RLS still applies)
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'transactions') then
    alter publication supabase_realtime add table transactions, jars, budgets, members;
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

-- Age-bracket jar allocation stats: aggregated & k-anonymized only — never
-- returns household- or user-level rows, only per-jar averages across
-- households whose account holder shares the caller's 10-year age bracket.
-- Suppressed (row omitted) unless at least `min_households` contribute, so
-- a small bracket can't be de-anonymized. Backs a future "see how people
-- your age allocate their jars" feature; disclosed in the privacy policy's
-- "Purpose of Collection" section.
create or replace function get_age_bracket_jar_stats()
returns table (jar text, avg_allocation_pct numeric, household_count bigint)
language plpgsql security definer
set search_path = public
as $$
declare
  my_bracket int;
  min_households constant int := 20;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select (extract(year from age(current_date, birth_date))::int / 10) * 10
  into my_bracket
  from profiles
  where id = auth.uid();

  if my_bracket is null then
    raise exception 'Profile not found';
  end if;

  return query
    with bracket_households as (
      select distinct p.household_id
      from profiles p
      where p.household_id is not null
        and (extract(year from age(current_date, p.birth_date))::int / 10) * 10 = my_bracket
    ),
    agg as (
      select
        j.id as jar,
        avg(j.allocation_pct) as avg_allocation_pct,
        count(distinct j.household_id) as household_count
      from jars j
      join bracket_households bh on bh.household_id = j.household_id
      group by j.id
    )
    select agg.jar, round(agg.avg_allocation_pct, 1), agg.household_count
    from agg
    where agg.household_count >= min_households;
end;
$$;

-- Admin stats: returns aggregated metrics; only accessible to is_admin = true users
create or replace function get_admin_stats()
returns json language plpgsql security definer
set search_path = public
as $$
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
) language plpgsql security definer
set search_path = public
as $$
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

-- Invite code generator: 8 chars from a 32-char alphabet (40 bits, no modulo bias)
create or replace function generate_invite_code()
returns text language plpgsql volatile
set search_path = public
as $$
declare
  bytes bytea := extensions.gen_random_bytes(8);
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
begin
  for i in 0..7 loop
    result := result || substr(alphabet, get_byte(bytes, i) % 32 + 1, 1);
  end loop;
  return result;
end;
$$;

-- Join attempt log for brute-force rate limiting.
-- RLS enabled with no policies: only security definer functions can touch it.
create table if not exists invite_join_attempts (
  user_id uuid not null,
  attempted_at timestamptz not null default now()
);
create index if not exists invite_join_attempts_user_time
  on invite_join_attempts (user_id, attempted_at desc);
alter table invite_join_attempts enable row level security;

-- Atomic invite code join: rate limit + lookup (bypasses RLS) + profile update + code rotation
create or replace function join_household_by_code(code text)
returns uuid language plpgsql security definer
set search_path = public
as $$
declare
  h_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if (select count(*) from invite_join_attempts
      where user_id = auth.uid()
        and attempted_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many attempts';
  end if;
  insert into invite_join_attempts (user_id) values (auth.uid());

  select id into h_id from households where invite_code = upper(trim(code));
  if h_id is null then
    raise exception 'Invalid invite code';
  end if;

  update profiles set household_id = h_id where id = auth.uid();

  update households set invite_code = generate_invite_code() where id = h_id;

  delete from invite_join_attempts where user_id = auth.uid();
  return h_id;
end;
$$;

-- Atomic household creation: household + profile link + jar seeding in one transaction.
-- Required because the profiles RLS policy blocks direct household_id changes.
create or replace function create_household(p_name text)
returns json language plpgsql security definer
set search_path = public
as $$
declare
  h households;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  insert into households (name, invite_code)
  values (p_name, generate_invite_code())
  returning * into h;

  update profiles set household_id = h.id where id = auth.uid();

  insert into jars (id, household_id, balance, allocation_pct)
  values
    ('giving',    h.id, 0, 10),
    ('investing', h.id, 0, 10),
    ('savings',   h.id, 0, 10),
    ('living',    h.id, 0, 60),
    ('seed',      h.id, 0, 10);

  return row_to_json(h);
end;
$$;

-- Auto-create profile on signup (metadata passed via signUp options.data).
-- With email confirmation enabled there is no session right after signUp,
-- so a client-side profiles insert would silently fail RLS.
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data ? 'nickname' then
    insert into profiles (id, nickname, birth_date, country)
    values (
      new.id,
      new.raw_user_meta_data->>'nickname',
      (new.raw_user_meta_data->>'birth_date')::date,
      new.raw_user_meta_data->>'country'
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
