import { useState, useEffect, useCallback } from 'react';
import * as db from '@/lib/db';
import type { Transaction, Budget, FamilyMember, JarBalance, JarId } from '@/types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await db.getAllTransactions();
    setTransactions(data.sort((a, b) => b.date.localeCompare(a.date)));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  /**
   * Add a transaction.
   * - Income: full amount auto-splits across all 5 jars by their allocationPct.
   * - Expense: deducts the amount from the chosen jar.
   */
  const add = async (tx: Transaction) => {
    await db.addTransaction(tx);

    if (tx.type === 'income') {
      const jars = await db.getAllJars();
      const totalPct = jars.reduce((s, j) => s + j.allocationPct, 0) || 100;
      for (const j of jars) {
        const share = tx.amount * (j.allocationPct / totalPct);
        await db.adjustJarBalance(j.id, share);
      }
    } else {
      await db.adjustJarBalance(tx.jar, -tx.amount);
    }
    await refresh();
  };

  const remove = async (id: string) => {
    // Reverse jar effects
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      if (tx.type === 'income') {
        const jars = await db.getAllJars();
        const totalPct = jars.reduce((s, j) => s + j.allocationPct, 0) || 100;
        for (const j of jars) {
          await db.adjustJarBalance(j.id, -(tx.amount * (j.allocationPct / totalPct)));
        }
      } else {
        await db.adjustJarBalance(tx.jar, tx.amount);
      }
    }
    await db.deleteTransaction(id);
    await refresh();
  };

  return { transactions, loading, add, remove, refresh };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const refresh = useCallback(async () => {
    setBudgets(await db.getAllBudgets());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = async (b: Budget) => {
    await db.saveBudget(b);
    await refresh();
  };

  const remove = async (id: string) => {
    await db.deleteBudget(id);
    await refresh();
  };

  return { budgets, save, remove, refresh };
}

export function useMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const refresh = useCallback(async () => {
    setMembers(await db.getAllMembers());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = async (m: FamilyMember) => {
    await db.saveMember(m);
    await refresh();
  };

  const remove = async (id: string) => {
    await db.deleteMember(id);
    await refresh();
  };

  return { members, save, remove, refresh };
}

export function useJars() {
  const [jars, setJars] = useState<JarBalance[]>([]);

  const refresh = useCallback(async () => {
    setJars(await db.getAllJars());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const updateAllocation = async (id: JarId, pct: number) => {
    const j = jars.find(x => x.id === id);
    if (!j) return;
    await db.saveJar({ ...j, allocationPct: pct });
    await refresh();
  };

  const reset = async () => {
    await db.resetJarBalances();
    await refresh();
  };

  return { jars, updateAllocation, reset, refresh };
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('currency') || 'JPY';
  });

  const setCurrency = (code: string) => {
    localStorage.setItem('currency', code);
    setCurrencyState(code);
  };

  const symbol = { JPY: '¥', USD: '$', EUR: '€', GBP: '£', CNY: '¥', KRW: '₩' }[currency] || '¥';

  const format = (amount: number) => {
    if (currency === 'JPY' || currency === 'KRW') {
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
    return `${symbol}${amount.toFixed(2)}`;
  };

  return { currency, setCurrency, symbol, format };
}
