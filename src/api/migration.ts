import { supabase } from '@/lib/supabase';
import * as localDb from '@/lib/db';

async function getHouseholdId(): Promise<string> {
  const { data } = await supabase.from('profiles').select('household_id').single();
  if (!data?.household_id) throw new Error('No household');
  return data.household_id;
}

export async function migrateLocalToCloud(
  onProgress?: (progress: number) => void,
): Promise<boolean> {
  try {
    onProgress?.(0);

    const [transactions, members, budgets, jars] = await Promise.all([
      localDb.getAllTransactions(),
      localDb.getAllMembers(),
      localDb.getAllBudgets(),
      localDb.getAllJars(),
    ]);

    onProgress?.(10);

    const householdId = await getHouseholdId();
    onProgress?.(15);

    const total = members.length + transactions.length + budgets.length + jars.length;
    let done = 0;

    const tick = () => {
      done++;
      onProgress?.(15 + Math.floor((done / Math.max(total, 1)) * 80));
    };

    // Members
    if (members.length > 0) {
      const rows = members.map(m => ({ id: m.id, household_id: householdId, name: m.name, color: m.color }));
      const { error } = await supabase.from('members').upsert(rows);
      if (error) throw error;
      members.forEach(tick);
    }

    // Jars
    if (jars.length > 0) {
      const rows = jars.map(j => ({
        id: j.id,
        household_id: householdId,
        balance: j.balance,
        allocation_pct: j.allocationPct,
      }));
      const { error } = await supabase.from('jars').upsert(rows);
      if (error) throw error;
      jars.forEach(tick);
    }

    // Budgets
    if (budgets.length > 0) {
      const rows = budgets.map(b => ({
        id: b.id,
        household_id: householdId,
        jar: b.jar,
        amount: b.amount,
        month: b.month,
      }));
      const { error } = await supabase.from('budgets').upsert(rows);
      if (error) throw error;
      budgets.forEach(tick);
    }

    // Transactions (upload in batches to avoid request size limits)
    const BATCH = 100;
    for (let i = 0; i < transactions.length; i += BATCH) {
      const batch = transactions.slice(i, i + BATCH);
      const rows = batch.map(tx => ({
        id: tx.id,
        household_id: householdId,
        type: tx.type,
        amount: tx.amount,
        jar: tx.jar,
        sub_category: tx.subCategory,
        category: tx.category ?? null,
        note: tx.note,
        date: tx.date,
        member_id: tx.memberId || null,
        allocation_snapshot: tx.allocationSnapshot ?? null,
        created_at: tx.createdAt,
      }));
      const { error } = await supabase.from('transactions').upsert(rows);
      if (error) throw error;
      batch.forEach(tick);
    }

    onProgress?.(95);
    await localDb.clearAllData();
    onProgress?.(100);

    return true;
  } catch {
    // IndexedDB data is preserved on failure
    return false;
  }
}
