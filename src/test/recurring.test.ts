import { describe, it, expect } from 'vitest';
import { dueDatesFor } from '@/hooks/useRecurringRules';
import type { RecurringRule } from '@/types';

function rule(dayOfMonth: number, lastAppliedMonth: string): RecurringRule {
  return {
    id: 'r1',
    dayOfMonth,
    lastAppliedMonth,
    template: {
      type: 'expense',
      amount: 1000,
      jar: 'living',
      subCategory: 'Rent',
      note: '',
      memberId: '',
    },
  };
}

describe('dueDatesFor', () => {
  it('returns nothing when this month is already applied', () => {
    expect(dueDatesFor(rule(15, '2026-07'), '2026-07-20')).toEqual([]);
  });

  it('returns nothing before the due day', () => {
    expect(dueDatesFor(rule(15, '2026-06'), '2026-07-10')).toEqual([]);
  });

  it('returns the due date on or after the due day', () => {
    expect(dueDatesFor(rule(15, '2026-06'), '2026-07-15')).toEqual(['2026-07-15']);
    expect(dueDatesFor(rule(15, '2026-06'), '2026-07-20')).toEqual(['2026-07-15']);
  });

  it('catches up multiple missed months', () => {
    expect(dueDatesFor(rule(10, '2026-03'), '2026-07-12')).toEqual([
      '2026-04-10', '2026-05-10', '2026-06-10', '2026-07-10',
    ]);
  });

  it('clamps day 31 to the last day of shorter months', () => {
    expect(dueDatesFor(rule(31, '2026-01'), '2026-02-28')).toEqual(['2026-02-28']);
    expect(dueDatesFor(rule(31, '2026-03'), '2026-04-30')).toEqual(['2026-04-30']);
  });

  it('crosses year boundaries', () => {
    expect(dueDatesFor(rule(5, '2025-12'), '2026-01-05')).toEqual(['2026-01-05']);
  });

  it('caps catch-up at 24 months', () => {
    expect(dueDatesFor(rule(1, '2020-01'), '2026-07-12')).toHaveLength(24);
  });
});
