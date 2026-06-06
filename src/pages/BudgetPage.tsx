import { useState } from 'react';
import { useTransactions, useCurrency, usePeriodBudgets, useJars } from '@/hooks/useStore';
import { BUDGET_PERIOD_DAYS, getCurrentBudgetPeriod } from '@/types';
import type { BudgetPeriod, PeriodBudget } from '@/types';
import { Input } from '@/components/ui/input';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePeriodGoalSettings } from '@/hooks/usePeriodGoalSettings';

const LIVING_CATEGORIES = ['Food', 'Transport', 'Necessities', 'Other'] as const;
const PERIOD_CAT_ICONS: Record<string, string> = {
  Food: '🍽️', Transport: '🚗', Necessities: '🛒', Other: '•••',
};

export default function BudgetPage() {
  const { transactions } = useTransactions();
  const { format } = useCurrency();
  const { t, i18n } = useTranslation();
  const { jars } = useJars();
  const { settings: goalSettings } = usePeriodGoalSettings();

  const [activePeriod, setActivePeriod] = useState<BudgetPeriod>('early');
  const [editingAmounts, setEditingAmounts] = useState<Record<string, string>>({});
  const [savedCats, setSavedCats] = useState<Set<string>>(new Set());

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const { periodBudgets, save: savePeriodBudget, remove: removePeriodBudget } = usePeriodBudgets(currentMonth);

  const livingBudget = transactions
    .filter(tx => tx.type === 'income' && tx.date.startsWith(currentMonth))
    .reduce((sum, tx) => {
      const snap = tx.allocationSnapshot;
      const totalPct = jars.reduce((s, j) => s + (snap?.[j.id] ?? j.allocationPct), 0) || 100;
      const livingPct = snap?.['living'] ?? jars.find(j => j.id === 'living')?.allocationPct ?? 60;
      return sum + tx.amount * (livingPct / totalPct);
    }, 0);

  const getPeriodSpentAll = (period: BudgetPeriod) => {
    const range = BUDGET_PERIOD_DAYS[period];
    const endDay = Math.min(range.end, lastDayOfMonth);
    const start = `${currentMonth}-${String(range.start).padStart(2, '0')}`;
    const end   = `${currentMonth}-${String(endDay).padStart(2, '0')}`;
    return transactions
      .filter(tx => tx.type === 'expense' && tx.jar === 'living' && tx.date >= start && tx.date <= end)
      .reduce((s, tx) => s + tx.amount, 0);
  };

  const getPeriodSpent = (period: BudgetPeriod, category: string) => {
    const range = BUDGET_PERIOD_DAYS[period];
    const endDay = Math.min(range.end, lastDayOfMonth);
    const start = `${currentMonth}-${String(range.start).padStart(2, '0')}`;
    const end = `${currentMonth}-${String(endDay).padStart(2, '0')}`;
    return transactions
      .filter(tx =>
        tx.type === 'expense' &&
        tx.jar === 'living' &&
        tx.mainCategory === category &&
        tx.date >= start &&
        tx.date <= end
      )
      .reduce((s, tx) => s + tx.amount, 0);
  };

  const getPeriodBudget = (period: BudgetPeriod, category: string) =>
    periodBudgets.find(pb => pb.period === period && pb.category === category);

  const handleSavePeriod = async (period: BudgetPeriod, category: string) => {
    const key = `${period}-${category}`;
    const raw = editingAmounts[key];
    const amount = raw !== undefined ? parseFloat(raw) : NaN;
    if (!Number.isFinite(amount) || amount < 0) return;
    const pb: PeriodBudget = {
      id: `${currentMonth}-${period}-${category}`,
      yearMonth: currentMonth,
      period,
      category,
      targetAmount: amount,
    };
    await savePeriodBudget(pb);
    setSavedCats(prev => new Set(prev).add(key));
    setTimeout(() => setSavedCats(prev => { const s = new Set(prev); s.delete(key); return s; }), 1500);
  };

  const handleRemovePeriod = async (pb: PeriodBudget) => {
    await removePeriodBudget(pb.id);
    const key = `${pb.period}-${pb.category}`;
    setEditingAmounts(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const periodRangeLabel = (p: BudgetPeriod) => {
    const r = BUDGET_PERIOD_DAYS[p];
    const end = p === 'late' ? lastDayOfMonth : r.end;
    return `${r.start}–${end}${t('period.dayUnit')}`;
  };

  return (
    <div className="min-h-screen pb-safe">
      <div className="px-5 pb-4 pt-safe">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('budget.tabPeriod')}</h1>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="px-5 space-y-4">
        <p className="text-xs text-muted-foreground">{t('budget.periodHint')}</p>

        {/* 구간목표 */}
        {goalSettings.enabled && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {t('periodGoal.sectionTitle')}
            </p>
            {([
              { period: 'early' as BudgetPeriod, pct: goalSettings.earlyPct },
              { period: 'mid'   as BudgetPeriod, pct: goalSettings.midPct },
              { period: 'late'  as BudgetPeriod, pct: goalSettings.latePct },
            ]).map(({ period, pct }) => {
              const target  = livingBudget * pct / 100;
              const spent   = getPeriodSpentAll(period);
              const usePct  = target > 0 ? Math.min(100, Math.round(spent / target * 100)) : 0;
              const over    = target > 0 && spent > target;
              const isCurrent = getCurrentBudgetPeriod() === period;
              const barColor  = over ? '#EF4444' : usePct >= 70 ? '#F59E0B' : '#10B981';

              return (
                <div key={period}
                  className={`rounded-xl p-3.5 border ${isCurrent ? 'border-primary/40 bg-primary/5' : 'bg-card border-border shadow-sm'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{t(`period.${period}`)}</span>
                      <span className="text-[10px] text-muted-foreground">{periodRangeLabel(period)}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none">
                          {t('period.current', { defaultValue: '현재' })}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${usePct}%`, background: barColor }} />
                  </div>
                  <div className="flex justify-between text-[10px] mt-1.5">
                    <span className="text-muted-foreground">{format(spent)} {t('budget.spent')}</span>
                    <span className={over ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      {target > 0
                        ? over
                          ? `+${format(spent - target)} ${t('budget.over')}`
                          : `${format(target - spent)} ${t('budget.remaining')} / ${format(target)}`
                        : t('periodGoal.noIncome')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Period selector */}
        <div className="flex gap-2">
          {(['early', 'mid', 'late'] as BudgetPeriod[]).map(p => (
            <button key={p} onClick={() => setActivePeriod(p)}
              className={`flex-1 flex flex-col items-center rounded-xl py-2.5 px-1 transition-all ${
                activePeriod === p ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-muted-foreground'
              }`}>
              <span className="text-xs font-semibold">{t(`period.${p}`)}</span>
              <span className="text-[10px] opacity-70">{periodRangeLabel(p)}</span>
            </button>
          ))}
        </div>

        {/* Category rows */}
        <div className="space-y-2">
          {LIVING_CATEGORIES.map(cat => {
            const key = `${activePeriod}-${cat}`;
            const existing = getPeriodBudget(activePeriod, cat);
            const spent = getPeriodSpent(activePeriod, cat);
            const targetAmount = existing?.targetAmount ?? 0;
            const inputVal = editingAmounts[key] ?? (existing ? String(existing.targetAmount) : '');
            const pct = targetAmount > 0 ? Math.min(100, Math.round((spent / targetAmount) * 100)) : 0;
            const over = targetAmount > 0 && spent > targetAmount;
            const justSaved = savedCats.has(key);

            return (
              <div key={cat} className="rounded-xl bg-card p-3.5 shadow-sm border border-border">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-lg leading-none">{PERIOD_CAT_ICONS[cat]}</span>
                  <span className="text-sm font-medium flex-1">{t(`mainCat.${cat}`, { defaultValue: cat })}</span>
                  {existing && (
                    <button onClick={() => handleRemovePeriod(existing)} className="text-muted-foreground/60 p-1">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder={t('budget.setTarget')}
                    value={inputVal}
                    onChange={e => setEditingAmounts(prev => ({ ...prev, [key]: e.target.value }))}
                    className="h-9 rounded-lg text-sm flex-1"
                  />
                  <button
                    onClick={() => handleSavePeriod(activePeriod, cat)}
                    disabled={!inputVal}
                    className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
                      justSaved ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground disabled:opacity-30'
                    }`}>
                    <Check className="h-4 w-4" />
                  </button>
                </div>

                {existing && targetAmount > 0 && (
                  <div className="mt-2.5 space-y-1">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: over ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#10B981',
                        }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{format(spent)} {t('budget.spent')}</span>
                      <span className={over ? 'text-destructive font-medium' : ''}>
                        {over ? `+${format(spent - targetAmount)} ${t('budget.over')}` : `${format(targetAmount - spent)} ${t('budget.remaining')}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
