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
  created_at timestamptz default now()
);

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
  new_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  update households set invite_code = new_code where id = h_id;

  return h_id;
end;
$$;
