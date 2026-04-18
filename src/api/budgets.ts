import { supabase } from '@/lib/supabase';
import type { Budget } from '@/types';

function toRow(b: Budget, householdId: string) {
  return {
    id: b.id,
    household_id: householdId,
    jar: b.jar,
    amount: b.amount,
    month: b.month,
  };
}

function fromRow(row: Record<string, unknown>): Budget {
  return {
    id: row.id as string,
    jar: row.jar as Budget['jar'],
    amount: row.amount as number,
    month: row.month as string,
  };
}

async function getHouseholdId(): Promise<string> {
  const { data } = await supabase.from('profiles').select('household_id').single();
  if (!data?.household_id) throw new Error('No household');
  return data.household_id;
}

export async function getAllBudgets(): Promise<Budget[]> {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('household_id', householdId);
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function saveBudget(b: Budget): Promise<void> {
  const householdId = await getHouseholdId();
  const { error } = await supabase
    .from('budgets')
    .upsert(toRow(b, householdId), { onConflict: 'household_id,jar,month' });
  if (error) throw error;
}

export async function deleteBudget(id: string): Promise<void> {
  const householdId = await getHouseholdId();
  const { error } = await supabase.from('budgets').delete().eq('id', id).eq('household_id', householdId);
  if (error) throw error;
}
