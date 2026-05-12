import { useState } from 'react';
import { useTransactions, useCurrency, useJars } from '@/hooks/useStore';
import { JARS } from '@/types';
import type { JarId } from '@/types';
import { JarIcon } from '@/components/JarIcon';
import { useTranslation } from 'react-i18next';
import { toYearMonth, computePeriodNet } from '@/lib/utils';

type Period = 'month' | 'year';

export default function JarsPage() {
  const { transactions } = useTransactions();
  const { jars } = useJars();
  const { format } = useCurrency();
  const { t } = useTranslation();

  const [period, setPeriod] = useState<Period>('month');

  const [activeJarId, setActiveJarId] = useState<JarId>(JARS[0].id);

  const now = new Date();
  const yearPrefix = now.getFullYear().toString();
  const monthPrefix = toYearMonth(now);
  const prefix = period === 'month' ? monthPrefix : yearPrefix;
  const periodTxs = transactions.filter(tx => tx.date.startsWith(prefix));

  const activeJarDef = JARS.find(j => j.id === activeJarId) ?? JARS[0];
  const activeJarBal = jars.find(j => j.id === activeJarId);
  const activeBalance = activeJarBal?.balance ?? 0;
  const activePct = activeJarBal?.allocationPct ?? activeJarDef.defaultPct;
  const activeNet = computePeriodNet(activeJarId, periodTxs, jars);

  const incomeAllocatedThisPeriod = periodTxs
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => {
      const snap = tx.allocationSnapshot;
      const totalPct = jars.reduce((s, j) => s + (snap?.[j.id] ?? j.allocationPct), 0) || 100;
      const jarPct = snap?.[activeJarId] ?? jars.find(j => j.id === activeJarId)?.allocationPct ?? 0;
      return sum + tx.amount * (jarPct / totalPct);
    }, 0);

  const spentThisPeriod = periodTxs
    .filter(tx => tx.type === 'expense' && tx.jar === activeJarId)
    .reduce((s, tx) => s + tx.amount, 0);

  const usagePct = incomeAllocatedThisPeriod > 0
    ? Math.min(100, Math.round((spentThisPeriod / incomeAllocatedThisPeriod) * 100))
    : 0;

  return (
    <div className="min-h-screen pb-safe">
      {/* Header */}
      <div className="px-5 pt-safe pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('nav.jars')}</h1>
        <div className="flex bg-muted rounded-lg p-0.5 text-xs">
          {(['month', 'year'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                period === p ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              {t(`dashboard.${p === 'month' ? 'thisMonth' : 'thisYear'}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Active jar detail card */}
      <div className="px-4 pb-4">
        <div className="rounded-2xl bg-card shadow-sm p-4 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <JarIcon jar={activeJarId} size={26} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base leading-tight">{t(`jars.${activeJarId}`)}</p>
              <p className="text-xs text-muted-foreground">{activePct}% {t('dashboard.allocation')}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: activeJarDef.color }}>
                {format(activeBalance)}
              </p>
              <p className={`text-xs ${activeNet >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                {activeNet >= 0 ? '+' : ''}{format(activeNet)} {period === 'month' ? t('dashboard.thisMonth') : t('dashboard.thisYear')}
              </p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${usagePct}%`, background: activeJarDef.color }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {t(period === 'month' ? 'dashboard.balanceSpentMonth' : 'dashboard.balanceSpentYear', { pct: usagePct })}
          </p>
        </div>
      </div>

      {/* Jar list */}
      <div className="px-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t('dashboard.yourJars')}
        </h2>
        <div className="flex flex-col gap-2">
          {JARS.map(def => {
            const j = jars.find(x => x.id === def.id);
            const pct = j?.allocationPct ?? def.defaultPct;
            const net = computePeriodNet(def.id, periodTxs, jars);
            const isActive = activeJarId === def.id;

            return (
              <button
                key={def.id}
                onClick={() => setActiveJarId(def.id)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                style={{
                  background: isActive ? `${def.color}12` : 'var(--card)',
                  border: `1px solid ${isActive ? def.color + '44' : 'var(--border)'}`,
                  boxShadow: isActive ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <JarIcon jar={def.id} size={20} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">{t(`jars.${def.id}`)}</p>
                  <p className="text-[10px] text-muted-foreground">{pct}%</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{format(j?.balance ?? 0)}</p>
                  <p className={`text-[10px] ${net < 0 ? 'text-destructive' : net > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {net > 0 ? '+' : ''}{format(net)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
