-- ============================================================
-- Security fixes — 2026-07-11
-- Supabase 대시보드 SQL Editor에서 전체를 한 번에 실행하세요.
-- 적용 후 canonical 파일(schema.sql / rls.sql / profiles.sql)과 동일한 상태가 됩니다.
-- ============================================================

-- gen_random_bytes 사용 (Supabase 기본 제공 확장)
create extension if not exists pgcrypto with schema extensions;

-- ------------------------------------------------------------
-- [1] adjust_jar_balance: security definer가 RLS를 우회하므로
--     호출자가 자기 가구인지 함수 내부에서 직접 검증
-- [4] 모든 security definer 함수에 search_path 고정
-- ------------------------------------------------------------
create or replace function current_household_id()
returns uuid language sql stable security definer
set search_path = public
as $$
  select household_id from profiles where id = auth.uid()
$$;

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

-- ------------------------------------------------------------
-- [2] profiles 중복 정책 제거 (profiles.sql 구버전 정책)
--     permissive 정책은 OR 결합이라 WITH CHECK 없는 구정책이
--     is_admin 자기 승격을 허용할 수 있음
-- [3] household_id 임의 변경 차단: 유지 또는 탈퇴(null)만 허용,
--     합류는 join_household_by_code RPC로만
-- ------------------------------------------------------------
drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_insert_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;

drop policy if exists "users read own profile" on profiles;
create policy "users read own profile"
  on profiles for select
  using (id = auth.uid());

drop policy if exists "users insert own profile" on profiles;
create policy "users insert own profile"
  on profiles for insert
  with check (id = auth.uid());

drop policy if exists "users update own profile" on profiles;
create policy "users update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- is_admin은 본인이 변경 불가
    and is_admin = (select is_admin from profiles where id = auth.uid())
    -- household_id는 유지 또는 탈퇴(null)만; 합류/생성은 RPC 경유
    and (
      household_id is null
      or household_id = (select household_id from profiles where id = auth.uid())
    )
  );

-- ------------------------------------------------------------
-- [5] 초대 코드 강화
--     - 엔트로피: 32비트(hex 8자) → 40비트(32자 알파벳 8자, 모듈로 편향 없음)
--     - 무차별 대입 방지: 시간당 5회 시도 제한
-- ------------------------------------------------------------
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

-- 시도 기록: RLS 활성화 + 정책 없음 → security definer 함수만 접근 가능
create table if not exists invite_join_attempts (
  user_id uuid not null,
  attempted_at timestamptz not null default now()
);
create index if not exists invite_join_attempts_user_time
  on invite_join_attempts (user_id, attempted_at desc);
alter table invite_join_attempts enable row level security;

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

  -- 사용된 코드는 즉시 회전
  update households set invite_code = generate_invite_code() where id = h_id;

  delete from invite_join_attempts where user_id = auth.uid();
  return h_id;
end;
$$;

-- ------------------------------------------------------------
-- 가구 생성 원자화: household 생성 + 프로필 연결 + 항아리 시드를
-- 한 트랜잭션으로 (기존 클라이언트 3단계 호출 대체,
-- [3]의 household_id 직접 변경 차단과 호환)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- [4] admin 함수 search_path 고정 (로직 동일)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 가입 시 프로필 자동 생성 (auth.users 트리거)
-- 이메일 확인이 켜져 있으면 signUp 직후 세션이 없어
-- 클라이언트의 profiles insert가 RLS에 막혀 조용히 실패하던 버그 수정.
-- 클라이언트는 signUp options.data로 메타데이터만 전달.
-- ------------------------------------------------------------
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  -- 앱 가입 플로우가 아닌 경우(대시보드 생성 등) 메타데이터가 없으면 건너뜀
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

-- ------------------------------------------------------------
-- 수입 거래는 jar 없이 저장됨(항아리에 비율 분배) — NOT NULL 제약과 충돌 수정
-- ------------------------------------------------------------
alter table transactions alter column jar drop not null;
alter table transactions drop constraint if exists transactions_jar_check;
alter table transactions add constraint transactions_jar_check check (
  jar in ('giving', 'investing', 'savings', 'living', 'seed')
  or (type = 'income' and jar is null)
);
