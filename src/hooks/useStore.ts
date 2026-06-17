import { useState, useEffect, useCallback, useRef } from 'react';
import * as localDb from '@/lib/db';
import { useStorage } from '@/hooks/useStorage';
import { supabase } from '@/lib/supabase';
import type { Transaction, Budget, FamilyMember, JarBalance, JarId, PeriodBudget, UtilityBill, SpecialExpense, SpecialExpensePayment } from '@/types';

export function useTransactions() {
  const storage = useStorage();
  const storageRef = useRef(storage);
  storageRef.current = storage;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await storageRef.current.getAllTransactions();
    setTransactions(data.sort((a, b) => b.date.localeCompare(a.date)));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        refresh();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  const snapshotAllocations = (jars: JarBalance[]): Partial<Record<JarId, number>> => {
    const snap: Partial<Record<JarId, number>> = {};
    for (const j of jars) snap[j.id] = j.allocationPct;
    return snap;
  };

  const applyIncomeSplit = async (tx: Transaction, sign: 1 | -1) => {
    const jars = await storageRef.current.getAllJars();
    const snap = tx.allocationSnapshot;
    const pctFor = (id: JarId) =>
      snap?.[id] ?? jars.find(j => j.id === id)?.allocationPct ?? 0;
    const totalPct = jars.reduce((s, j) => s + pctFor(j.id), 0) || 100;
    for (const j of jars) {
      const share = tx.amount * (pctFor(j.id) / totalPct);
      await storageRef.current.adjustJarBalance(j.id, sign * share);
    }
  };

  const add = async (tx: Transaction) => {
    const today = new Date().toISOString().split('T')[0];
    if (tx.type === 'income') {
      const jars = await storageRef.current.getAllJars();
      const txWithSnap: Transaction = { ...tx, allocationSnapshot: snapshotAllocations(jars) };
      await storageRef.current.addTransaction(txWithSnap);
      if (tx.date <= today) await applyIncomeSplit(txWithSnap, 1);
    } else {
      await storageRef.current.addTransaction(tx);
      if (tx.date <= today) await storageRef.current.adjustJarBalance(tx.jar, -tx.amount);
    }
    await refresh();
  };

  const remove = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tx = await storageRef.current.getTransactionById(id);
    if (tx && tx.date <= today) {
      if (tx.type === 'income') {
        await applyIncomeSplit(tx, -1);
      } else {
        await storageRef.current.adjustJarBalance(tx.jar, tx.amount);
      }
    }
    await storageRef.current.deleteTransaction(id);
    await refresh();
  };

  const update = async (updated: Transaction) => {
    const today = new Date().toISOString().split('T')[0];
    const old = await storageRef.current.getTransactionById(updated.id);
    if (!old) return;

    if (old.date <= today) {
      if (old.type === 'income') {
        await applyIncomeSplit(old, -1);
      } else {
        await storageRef.current.adjustJarBalance(old.jar, old.amount);
      }
    }

    let toSave: Transaction = updated;
    if (updated.type === 'income') {
      const jars = await storageRef.current.getAllJars();
      toSave = { ...updated, allocationSnapshot: snapshotAllocations(jars) };
      if (updated.date <= today) await applyIncomeSplit(toSave, 1);
    } else {
      if (updated.date <= today) await storageRef.current.adjustJarBalance(updated.jar, -updated.amount);
    }

    await storageRef.current.updateTransaction(toSave);
    await refresh();
  };

  return { transactions, loading, add, update, remove, refresh };
}

export function useBudgets() {
  const storage = useStorage();
  const storageRef = useRef(storage);
  storageRef.current = storage;
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const refresh = useCallback(async () => {
    setBudgets(await storageRef.current.getAllBudgets());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = async (b: Budget) => {
    await storageRef.current.saveBudget(b);
    await refresh();
  };

  const remove = async (id: string) => {
    await storageRef.current.deleteBudget(id);
    await refresh();
  };

  return { budgets, save, remove, refresh };
}

export function useMembers() {
  const storage = useStorage();
  const storageRef = useRef(storage);
  storageRef.current = storage;
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const refresh = useCallback(async () => {
    setMembers(await storageRef.current.getAllMembers());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = async (m: FamilyMember) => {
    await storageRef.current.saveMember(m);
    await refresh();
  };

  const remove = async (id: string) => {
    await storageRef.current.deleteMember(id);
    await refresh();
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '';

  return { members, save, remove, refresh, getMemberName };
}

export function useJars() {
  const storage = useStorage();
  const storageRef = useRef(storage);
  storageRef.current = storage;
  const [jars, setJars] = useState<JarBalance[]>([]);

  const refresh = useCallback(async () => {
    setJars(await storageRef.current.getAllJars());
  }, []);

  useEffect(() => {
    storageRef.current.reconcileJarBalances().then(() => refresh());
  }, [refresh]);

  const updateAllocation = async (id: JarId, pct: number) => {
    const j = jars.find(x => x.id === id);
    if (!j) return;
    await storageRef.current.saveJar({ ...j, allocationPct: pct });
    await refresh();
  };

  return { jars, updateAllocation, refresh };
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState('JPY');
  const [currencyLoading, setCurrencyLoading] = useState(true);

  useEffect(() => {
    localDb.getSetting('currency')
      .then(val => {
        if (val) setCurrencyState(val);
      })
      .finally(() => setCurrencyLoading(false));
  }, []);

  const setCurrency = async (code: string) => {
    await localDb.setSetting('currency', code);
    setCurrencyState(code);
  };

  const symbol = { JPY: '¥', USD: '$', EUR: '€', GBP: '£', CNY: '¥', KRW: '₩' }[currency] || '¥';

  const format = (amount: number) => {
    if (currency === 'JPY' || currency === 'KRW') {
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
    return `${symbol}${amount.toFixed(2)}`;
  };

  return { currency, setCurrency, symbol, format, currencyLoading };
}

// ── 3구간 예산 ────────────────────────────────────────────────────────────────
export function usePeriodBudgets(yearMonth?: string) {
  const [periodBudgets, setPeriodBudgets] = useState<PeriodBudget[]>([]);

  const refresh = useCallback(async () => {
    const all = yearMonth
      ? await localDb.getPeriodBudgetsByMonth(yearMonth)
      : await localDb.getAllPeriodBudgets();
    setPeriodBudgets(all);
  }, [yearMonth]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = async (pb: PeriodBudget) => {
    await localDb.savePeriodBudget(pb);
    await refresh();
  };

  const remove = async (id: string) => {
    await localDb.deletePeriodBudget(id);
    await refresh();
  };

  return { periodBudgets, save, remove, refresh };
}

// ── 공과금 ────────────────────────────────────────────────────────────────────
export function useUtilityBills() {
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);

  const refresh = useCallback(async () => {
    setUtilityBills(await localDb.getAllUtilityBills());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = async (bill: UtilityBill) => {
    await localDb.saveUtilityBill(bill);
    await refresh();
  };

  const getByMonth = async (yearMonth: string): Promise<UtilityBill | undefined> => {
    return localDb.getUtilityBill(yearMonth);
  };

  return { utilityBills, save, getByMonth, refresh };
}

// ── 특별지출 ──────────────────────────────────────────────────────────────────
export function useSpecialExpenses() {
  const [specialExpenses, setSpecialExpenses] = useState<SpecialExpense[]>([]);

  const refresh = useCallback(async () => {
    setSpecialExpenses(await localDb.getAllSpecialExpenses());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = async (expense: SpecialExpense) => {
    await localDb.saveSpecialExpense(expense);
    await refresh();
  };

  const remove = async (id: string) => {
    await localDb.deleteSpecialExpense(id);
    await refresh();
  };

  const addPayment = async (expenseId: string, payment: SpecialExpensePayment) => {
    const expense = specialExpenses.find(e => e.id === expenseId);
    if (!expense) return;
    await localDb.saveSpecialExpense({
      ...expense,
      payments: [...expense.payments, payment],
    });
    await refresh();
  };

  const removePayment = async (expenseId: string, paymentId: string) => {
    const expense = specialExpenses.find(e => e.id === expenseId);
    if (!expense) return;
    await localDb.saveSpecialExpense({
      ...expense,
      payments: expense.payments.filter(p => p.id !== paymentId),
    });
    await refresh();
  };

  return { specialExpenses, save, remove, addPayment, removePayment, refresh };
}
