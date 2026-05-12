import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Transaction, JarId, JarBalance } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTxColorClass(type: Transaction['type']) {
  return type === 'income' ? 'text-green-600' : 'text-red-500';
}

export function filterByMember<T extends { memberId: string }>(items: T[], memberId: string): T[] {
  return memberId === 'all' ? items : items.filter(t => t.memberId === memberId);
}

export function toYearMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return toYearMonth(d);
}

export function computePeriodNet(jarId: JarId, txs: Transaction[], allJars: JarBalance[]): number {
  return txs.reduce((sum, tx) => {
    if (tx.type === 'income') {
      const snap = tx.allocationSnapshot;
      const totalPct = allJars.reduce((s, j) => s + (snap?.[j.id] ?? j.allocationPct), 0) || 100;
      const jarPct = snap?.[jarId] ?? allJars.find(j => j.id === jarId)?.allocationPct ?? 0;
      return sum + tx.amount * (jarPct / totalPct);
    } else if (tx.jar === jarId) {
      return sum - tx.amount;
    }
    return sum;
  }, 0);
}
