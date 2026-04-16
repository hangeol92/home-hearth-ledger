import { openDB, DBSchema } from 'idb';
import type { Transaction, Budget, FamilyMember } from '@/types';

interface AccountBookDB extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'by-date': string; 'by-member': string };
  };
  budgets: {
    key: string;
    value: Budget;
    indexes: { 'by-month': string };
  };
  members: {
    key: string;
    value: FamilyMember;
  };
}

const DB_NAME = 'household-account-book';
const DB_VERSION = 1;

export async function getDB() {
  return openDB<AccountBookDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
      txStore.createIndex('by-date', 'date');
      txStore.createIndex('by-member', 'memberId');

      const budgetStore = db.createObjectStore('budgets', { keyPath: 'id' });
      budgetStore.createIndex('by-month', 'month');

      db.createObjectStore('members', { keyPath: 'id' });
    },
  });
}

// Transactions
export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDB();
  return db.getAll('transactions');
}

export async function addTransaction(tx: Transaction) {
  const db = await getDB();
  await db.put('transactions', tx);
}

export async function deleteTransaction(id: string) {
  const db = await getDB();
  await db.delete('transactions', id);
}

// Budgets
export async function getAllBudgets(): Promise<Budget[]> {
  const db = await getDB();
  return db.getAll('budgets');
}

export async function saveBudget(budget: Budget) {
  const db = await getDB();
  await db.put('budgets', budget);
}

export async function deleteBudget(id: string) {
  const db = await getDB();
  await db.delete('budgets', id);
}

// Members
export async function getAllMembers(): Promise<FamilyMember[]> {
  const db = await getDB();
  return db.getAll('members');
}

export async function saveMember(member: FamilyMember) {
  const db = await getDB();
  await db.put('members', member);
}

export async function deleteMember(id: string) {
  const db = await getDB();
  await db.delete('members', id);
}

// Clear all
export async function clearAllData() {
  const db = await getDB();
  await db.clear('transactions');
  await db.clear('budgets');
  await db.clear('members');
}
