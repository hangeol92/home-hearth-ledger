import { useState, useEffect, useCallback } from 'react';
import * as db from '@/lib/db';
import type { Transaction, Budget, FamilyMember } from '@/types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await db.getAllTransactions();
    setTransactions(data.sort((a, b) => b.date.localeCompare(a.date)));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async (tx: Transaction) => {
    await db.addTransaction(tx);
    await refresh();
  };

  const remove = async (id: string) => {
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
