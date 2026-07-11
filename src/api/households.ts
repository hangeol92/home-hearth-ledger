import { supabase } from '@/lib/supabase';

export async function getMyHousehold() {
  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id, households(*)')
    .single();
  return profile?.households ?? null;
}

export async function createHousehold(name: string) {
  // Server-side RPC: household 생성 + 프로필 연결 + 항아리 시드를 한 트랜잭션으로.
  // profiles RLS가 household_id 직접 변경을 막으므로 반드시 RPC 경유.
  const { data: household, error } = await supabase.rpc('create_household', {
    p_name: name,
  });
  if (error) throw new Error(error.message);
  return household as { id: string; name: string; invite_code: string };
}

export async function generateInviteCode(householdId: string) {
  const code = generateCode();
  const { error } = await supabase
    .from('households')
    .update({ invite_code: code })
    .eq('id', householdId);
  if (error) throw error;
  return code;
}

export async function joinByInviteCode(code: string) {
  // Server-side RPC: atomic lookup + profile update + code rotation (bypasses RLS for lookup)
  const { error } = await supabase.rpc('join_household_by_code', {
    code: code.trim().toUpperCase(),
  });
  if (error) throw new Error('Invalid invite code');
}

function generateCode(): string {
  // 32자 알파벳: 256 % 32 === 0 이라 모듈로 편향 없음
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}
