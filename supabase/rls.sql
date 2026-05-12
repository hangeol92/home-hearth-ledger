-- Enable RLS on all tables
alter table households      enable row level security;
alter table profiles        enable row level security;
alter table members         enable row level security;
alter table transactions    enable row level security;
alter table budgets         enable row level security;
alter table jars            enable row level security;

-- Helper: return household_id for the current auth user
create or replace function current_household_id()
returns uuid language sql stable security definer as $$
  select household_id from profiles where id = auth.uid()
$$;

-- Households: members of the same household can read; owner (creator) manages
create policy "household members can read their household"
  on households for select
  using (id = current_household_id());

create policy "authenticated users can create a household"
  on households for insert
  with check (auth.uid() is not null);

-- Household members can update their own household (e.g. rotate invite code)
create policy "household members can update their household"
  on households for update
  using (id = current_household_id())
  with check (id = current_household_id());

-- Note: invite code lookup for joining uses join_household_by_code() RPC (security definer),
-- which bypasses RLS intentionally. Direct SELECT by invite_code from client is blocked.

-- Profiles: users manage their own profile
create policy "users read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "users insert own profile"
  on profiles for insert
  with check (id = auth.uid());

create policy "users update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and is_admin = (select is_admin from profiles where id = auth.uid())
  );

-- Members: scoped to household
create policy "household members read members"
  on members for select
  using (household_id = current_household_id());

create policy "household members write members"
  on members for all
  using (household_id = current_household_id())
  with check (household_id = current_household_id());

-- Transactions: scoped to household
create policy "household members read transactions"
  on transactions for select
  using (household_id = current_household_id());

create policy "household members write transactions"
  on transactions for all
  using (household_id = current_household_id())
  with check (household_id = current_household_id());

-- Budgets: scoped to household
create policy "household members read budgets"
  on budgets for select
  using (household_id = current_household_id());

create policy "household members write budgets"
  on budgets for all
  using (household_id = current_household_id())
  with check (household_id = current_household_id());

-- Jars: scoped to household
create policy "household members read jars"
  on jars for select
  using (household_id = current_household_id());

create policy "household members write jars"
  on jars for all
  using (household_id = current_household_id())
  with check (household_id = current_household_id());

-- Subscriptions: users read own row only; writes done via service-role Edge Function
alter table subscriptions enable row level security;

create policy "users read own subscription"
  on subscriptions for select
  using (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE from client — only the Edge Function (service role) can write
