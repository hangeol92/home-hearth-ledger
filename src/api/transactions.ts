import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/types';

function toRow(tx: Transaction, householdId: string) {
  return {
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
  };
}

function fromRow(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    type: row.type as Transaction['type'],
    amount: row.amount as number,
    jar: row.jar as Transaction['jar'],
    subCategory: row.sub_category as string,
    category: row.category as Transaction['category'],
    note: row.note as string,
    date: row.date as string,
    memberId: row.member_id as string,
    allocationSnapshot: row.allocation_snapshot as Transaction['allocationSnapshot'],
    createdAt: row.created_at as string,
  };
}

async function getHouseholdId(): Promise<string> {
  const { data } = await supabase.from('profiles').select('household_id').single();
  if (!data?.household_id) throw new Error('No household');
  return data.household_id;
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('household_id', householdId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('household_id', householdId)
    .single();
  if (error) return undefined;
  return fromRow(data);
}

export async function addTransaction(tx: Transaction): Promise<void> {
  const householdId = await getHouseholdId();
  const { error } = await supabase.from('transactions').insert(toRow(tx, householdId));
  if (error) throw error;
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  const householdId = await getHouseholdId();
  const { error } = await supabase
    .from('transactions')
    .update(toRow(tx, householdId))
    .eq('id', tx.id);
  if (error) throw error;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}
