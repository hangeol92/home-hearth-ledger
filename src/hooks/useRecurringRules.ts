import { useState } from 'react';
import type { RecurringRule } from '@/types';

const STORAGE_KEY = 'hhl_recurring_rules';

export function loadRules(): RecurringRule[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveRules(rules: RecurringRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

/** lastAppliedMonth 이후부터 오늘까지 등록해야 할 날짜들 (YYYY-MM-DD).
 *  말일보다 큰 dayOfMonth는 해당 월의 말일로 조정 (예: 31일 → 2월 28일) */
export function dueDatesFor(rule: RecurringRule, today: string): string[] {
  const dates: string[] = [];
  let [y, m] = rule.lastAppliedMonth.split('-').map(Number);
  // 안전장치: 오래 방치된 앱이 과도하게 소급 등록하지 않도록 최대 24개월
  while (dates.length < 24) {
    m++;
    if (m > 12) { m = 1; y++; }
    const lastDay = new Date(y, m, 0).getDate();
    const day = Math.min(rule.dayOfMonth, lastDay);
    const date = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (date > today) break;
    dates.push(date);
  }
  return dates;
}

export function markRuleApplied(id: string, month: string) {
  saveRules(loadRules().map(r => (r.id === id ? { ...r, lastAppliedMonth: month } : r)));
}

export function useRecurringRules() {
  const [rules, setRules] = useState<RecurringRule[]>(loadRules);

  const add = (rule: RecurringRule) => {
    const next = [...loadRules(), rule];
    saveRules(next);
    setRules(next);
  };

  const remove = (id: string) => {
    const next = loadRules().filter(r => r.id !== id);
    saveRules(next);
    setRules(next);
  };

  return { rules, add, remove };
}
