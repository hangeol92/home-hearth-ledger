CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  birth_date date NOT NULL,
  country text NOT NULL,
  household_id uuid REFERENCES households(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies live in rls.sql ("users read/insert/update own profile").
-- The old profiles_*_own policies were removed: the UPDATE one had no WITH CHECK,
-- and permissive policies OR together, which allowed is_admin self-escalation.
