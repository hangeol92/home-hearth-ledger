import { openDB, DBSchema } from 'idb';
import type { Transaction, Budget, FamilyMember, JarBalance, JarId } from '@/types';
import { JARS, LEGACY_CATEGORY_TO_JAR } from '@/types';

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
  jars: {
    key: JarId;
    value: JarBalance;
  };
  settings: {
    key: string;
    value: { key: string; value: string };
  };
}

const DB_NAME = 'household-account-book';
const DB_VERSION = 3;

export async function getDB() {
  return openDB<AccountBookDB>(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, _newVersion, tx) {
      if (oldVersion < 1) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('by-date', 'date');
        txStore.createIndex('by-member', 'memberId');

        const budgetStore = db.createObjectStore('budgets', { keyPath: 'id' });
        budgetStore.createIndex('by-month', 'month');

        db.createObjectStore('members', { keyPath: 'id' });
      }

      if (oldVersion < 2) {
        // New jars store
        db.createObjectStore('jars', { keyPath: 'id' });

        // Seed default jar balances
        const jarStore = tx.objectStore('jars');
        for (const j of JARS) {
          await jarStore.put({ id: j.id, balance: 0, allocationPct: j.defaultPct });
        }

        // Migrate existing transactions: add jar + subCategory
        const txStore = tx.objectStore('transactions');
        const all = await txStore.getAll();
        for (const t of all) {
          if (!t.jar) {
            const oldCat = (t as any).category || 'Other';
            t.jar = LEGACY_CATEGORY_TO_JAR[oldCat] || 'living';
            t.subCategory = oldCat;
            await txStore.put(t);
          }
        }

        // Migrate budgets: from category-based to jar-based (best effort)
        const bStore = tx.objectStore('budgets');
        const allB = await bStore.getAll();
        for (const b of allB) {
          if (!b.jar) {
            const oldCat = (b as any).category || 'Other';
            b.jar = LEGACY_CATEGORY_TO_JAR[oldCat] || 'living';
            b.id = `${b.month}-${b.jar}`;
            await bStore.put(b);
          }
        }
      }

      if (oldVersion < 3) {
        db.createObjectStore('settings', { keyPath: 'key' });
        // Migrate currency from localStorage if present
        const saved = localStorage.getItem('currency');
        if (saved) {
          const sStore = tx.objectStore('settings');
          await sStore.put({ key: 'currency', value: saved });
          localStorage.removeItem('currency');
        }
      }
    },
  });
}

// Transactions
export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDB();
  return db.getAll('transactions');
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  const db = await getDB();
  return db.get('transactions', id);
}

export async function addTransaction(tx: Transaction) {
  const db = await getDB();
  await db.put('transactions', tx);
}

export async function updateTransaction(tx: Transaction) {
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

// Jars
export async function getAllJars(): Promise<JarBalance[]> {
  const db = await getDB();
  const existing = await db.getAll('jars');
  if (existing.length === 0) {
    for (const j of JARS) {
      await db.put('jars', { id: j.id, balance: 0, allocationPct: j.defaultPct });
    }
    return db.getAll('jars');
  }
  return existing;
}

export async function saveJar(jar: JarBalance) {
  const db = await getDB();
  await db.put('jars', jar);
}

export async function adjustJarBalance(id: JarId, delta: number) {
  const db = await getDB();
  const j = await db.get('jars', id);
  if (!j) {
    throw new Error(`adjustJarBalance: jar "${id}" not found`);
  }
  j.balance += delta;
  await db.put('jars', j);
}

export async function resetJarBalances() {
  const db = await getDB();
  const all = await db.getAll('jars');
  for (const j of all) {
    j.balance = 0;
    await db.put('jars', j);
  }
}

// Settings
export async function getSetting(key: string): Promise<string | undefined> {
  const db = await getDB();
  const row = await db.get('settings', key);
  return row?.value;
}

export async function setSetting(key: string, value: string) {
  const db = await getDB();
  await db.put('settings', { key, value });
}

// Clear all
export async function clearAllData() {
  const db = await getDB();
  await db.clear('transactions');
  await db.clear('budgets');
  await db.clear('members');
  await db.clear('jars');
  await db.clear('settings');
}
