import { supabase } from '@/lib/supabase';
import type { FamilyMember } from '@/types';

function fromRow(row: Record<string, unknown>): FamilyMember {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
  };
}

async function getHouseholdId(): Promise<string> {
  const { data } = await supabase.from('profiles').select('household_id').single();
  if (!data?.household_id) throw new Error('No household');
  return data.household_id;
}

export async function getAllMembers(): Promise<FamilyMember[]> {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('household_id', householdId);
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function saveMember(m: FamilyMember): Promise<void> {
  const householdId = await getHouseholdId();
  const { error } = await supabase.from('members').upsert({
    id: m.id,
    household_id: householdId,
    name: m.name,
    color: m.color,
  });
  if (error) throw error;
}

export async function deleteMember(id: string): Promise<void> {
  const householdId = await getHouseholdId();
  const { error } = await supabase.from('members').delete().eq('id', id).eq('household_id', householdId);
  if (error) throw error;
}
