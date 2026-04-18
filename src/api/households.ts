import { supabase } from '@/lib/supabase';
import { JARS } from '@/types';

export async function getMyHousehold() {
  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id, households(*)')
    .single();
  return profile?.households ?? null;
}

export async function createHousehold(name: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to create a household.');

  const inviteCode = generateCode();
  const { data: household, error: hErr } = await supabase
    .from('households')
    .insert({ name, invite_code: inviteCode })
    .select()
    .single();
  if (hErr) throw new Error(hErr.message);

  // Link profile to new household
  const { error: pErr } = await supabase
    .from('profiles')
    .update({ household_id: household.id })
    .eq('id', user.id);
  if (pErr) throw new Error(`Profile update failed: ${pErr.message}`);

  // Seed default jar rows
  const { error: jErr } = await supabase.from('jars').insert(
    JARS.map(j => ({
      id: j.id,
      household_id: household.id,
      balance: 0,
      allocation_pct: j.defaultPct,
    }))
  );
  if (jErr) throw new Error(`Jar setup failed: ${jErr.message}`);

  return household;
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
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}
