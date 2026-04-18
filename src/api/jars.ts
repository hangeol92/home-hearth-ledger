import { supabase } from '@/lib/supabase';
import type { JarBalance, JarId } from '@/types';
import { JARS } from '@/types';

function fromRow(row: Record<string, unknown>): JarBalance {
  return {
    id: row.id as JarId,
    balance: row.balance as number,
    allocationPct: row.allocation_pct as number,
  };
}

async function getHouseholdId(): Promise<string> {
  const { data } = await supabase.from('profiles').select('household_id').single();
  if (!data?.household_id) throw new Error('No household');
  return data.household_id;
}

export async function getAllJars(): Promise<JarBalance[]> {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('jars')
    .select('*')
    .eq('household_id', householdId);
  if (error) throw error;

  if (!data || data.length === 0) {
    // Seed defaults on first access
    const defaults = JARS.map(j => ({
      id: j.id,
      household_id: householdId,
      balance: 0,
      allocation_pct: j.defaultPct,
    }));
    await supabase.from('jars').insert(defaults);
    return JARS.map(j => ({ id: j.id, balance: 0, allocationPct: j.defaultPct }));
  }

  return data.map(fromRow);
}

export async function saveJar(jar: JarBalance): Promise<void> {
  const householdId = await getHouseholdId();
  const { error } = await supabase.from('jars').upsert({
    id: jar.id,
    household_id: householdId,
    balance: jar.balance,
    allocation_pct: jar.allocationPct,
  });
  if (error) throw error;
}

export async function adjustJarBalance(id: JarId, delta: number): Promise<void> {
  const householdId = await getHouseholdId();
  // Use a raw RPC to do atomic increment to avoid race conditions
  const { error } = await supabase.rpc('adjust_jar_balance', {
    p_household_id: householdId,
    p_jar_id: id,
    p_delta: delta,
  });
  if (error) throw error;
}

export async function resetJarBalances(): Promise<void> {
  const householdId = await getHouseholdId();
  const { error } = await supabase
    .from('jars')
    .update({ balance: 0 })
    .eq('household_id', householdId);
  if (error) throw error;
}
