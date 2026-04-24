import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useStore';
import type { Transaction } from '@/types';

export function useCalendar() {
  const { transactions } = useTransactions();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  const monthTxs = useMemo(
    () => transactions.filter(tx => tx.date.startsWith(monthPrefix)),
    [transactions, monthPrefix]
  );

  const byDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of monthTxs) {
      const list = map.get(tx.date) ?? [];
      list.push(tx);
      map.set(tx.date, list);
    }
    return map;
  }, [monthTxs]);

  const expenseByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const [date, txs] of byDate) {
      map.set(date, txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
    }
    return map;
  }, [byDate]);

  const totalIncome = useMemo(() => monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTxs]);
  const totalExpense = useMemo(() => monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTxs]);

  const selectedTxs = useMemo(
    () => (selectedDate ? (byDate.get(selectedDate) ?? []) : []),
    [selectedDate, byDate]
  );

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }
  function selectDate(date: string) {
    setSelectedDate(prev => prev === date ? null : date);
  }
  function goToMonth(y: number, m: number) {
    setYear(y);
    setMonth(m);
    setSelectedDate(null);
  }

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return {
    year, month, selectedDate,
    monthTxs, byDate, expenseByDate,
    totalIncome, totalExpense,
    selectedTxs,
    prevMonth, nextMonth, selectDate, goToMonth,
    firstDayOfWeek, daysInMonth,
  };
}
