import { useState } from 'react'; // eslint-disable-line -- period toggle
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTransactions, useMembers, useCurrency, useJars, usePeriodBudgets } from '@/hooks/useStore';
import { JARS, BUDGET_PERIOD_DAYS, getCurrentBudgetPeriod } from '@/types';
import type { JarId, JarBalance, Transaction, BudgetPeriod } from '@/types';
import { JarIcon } from '@/components/JarIcon';
import { useTranslation } from 'react-i18next';
import { getTxColorClass } from '@/lib/utils';
import { useActiveMember } from '@/hooks/useActiveMember';
import MemberSelectSheet from '@/components/member/MemberSelectSheet';

type Period = 'month' | 'year';

function computePeriodNet(
  jarId: JarId,
  txs: Transaction[],
  allJars: JarBalance[]
): number {
  return txs.reduce((sum, tx) => {
    if (tx.type === 'income') {
      const snap = tx.allocationSnapshot;
      const totalPct =
        allJars.reduce((s, j) => s + (snap?.[j.id] ?? j.allocationPct), 0) || 100;
      const jarPct =
        snap?.[jarId] ?? allJars.find(j => j.id === jarId)?.allocationPct ?? 0;
      return sum + tx.amount * (jarPct / totalPct);
    } else if (tx.jar === jarId) {
      return sum - tx.amount;
    }
    return sum;
  }, 0);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { members, getMemberName } = useMembers();
  const { jars } = useJars();
  const { format } = useCurrency();
  const { t } = useTranslation();

  const [period, setPeriod] = useState<Period>('month');
  const { activeMember, setActiveMember } = useActiveMember();
  const [showMemberSheet, setShowMemberSheet] = useState(false);

  const activeJarId: JarId = 'living';

  const now = new Date();
  const yearPrefix = now.getFullYear().toString();
  const monthPrefix = `${yearPrefix}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = period === 'month' ? monthPrefix : yearPrefix;

  // ── 구간 잔여금 계산 ────────────────────────────────────────────────────────
  const currentPeriod: BudgetPeriod = getCurrentBudgetPeriod();
  const { periodBudgets } = usePeriodBudgets(monthPrefix);
  const periodRange = BUDGET_PERIOD_DAYS[currentPeriod];

  const periodStart = `${monthPrefix}-${String(periodRange.start).padStart(2, '0')}`;
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const periodEndDay = Math.min(periodRange.end, lastDayOfMonth);
  const periodEnd = `${monthPrefix}-${String(periodEndDay).padStart(2, '0')}`;

  const daysRemainingInPeriod = periodEndDay - now.getDate();

  const periodLivingBudgets = periodBudgets.filter(pb => pb.period === currentPeriod);
  const totalPeriodTarget = periodLivingBudgets.reduce((s, pb) => s + pb.targetAmount, 0);

  const periodLivingSpent = transactions
    .filter(tx =>
      tx.type === 'expense' &&
      tx.jar === 'living' &&
      tx.date >= periodStart &&
      tx.date <= periodEnd
    )
    .reduce((s, tx) => s + tx.amount, 0);

  const periodUsagePct = totalPeriodTarget > 0
    ? Math.min(100, Math.round((periodLivingSpent / totalPeriodTarget) * 100))
    : 0;

  const periodTxs = transactions.filter(tx => tx.date.startsWith(prefix));
  // 생활비 카드는 항상 이번 달 기준으로 고정
  const monthTxs = transactions.filter(tx => tx.date.startsWith(monthPrefix));
  const totalBalance = jars.reduce((s, j) => s + j.balance, 0);
  const recentTx = transactions.slice(0, 8);

  const periodIncome  = periodTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
  const periodExpense = periodTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);

  const activeJarDef  = JARS.find(j => j.id === activeJarId) ?? JARS[0];
  const activeJarBal  = jars.find(j => j.id === activeJarId);
  const activeBalance = activeJarBal?.balance ?? 0;
  const activePct     = activeJarBal?.allocationPct ?? activeJarDef.defaultPct;
  const activeNet     = computePeriodNet(activeJarId, monthTxs, jars);

  // 이번 달 생활비로 배분된 수입
  const incomeAllocatedThisPeriod = monthTxs
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => {
      const snap = tx.allocationSnapshot;
      const totalPct = jars.reduce((s, j) => s + (snap?.[j.id] ?? j.allocationPct), 0) || 100;
      const jarPct = snap?.[activeJarId] ?? jars.find(j => j.id === activeJarId)?.allocationPct ?? 0;
      return sum + tx.amount * (jarPct / totalPct);
    }, 0);

  // 이번 달 생활비 지출
  const spentThisPeriod = monthTxs
    .filter(tx => tx.type === 'expense' && tx.jar === activeJarId)
    .reduce((s, tx) => s + tx.amount, 0);

  const usagePct = incomeAllocatedThisPeriod > 0
    ? Math.min(100, Math.round((spentThisPeriod / incomeAllocatedThisPeriod) * 100))
    : 0;

  return (
    <div className="min-h-screen pb-safe">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-primary px-5 pb-8" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
        <div className="flex items-center justify-between mb-5">
          {/* Typographic date block */}
          <div>
            <p className="text-[11px] font-medium tracking-[0.2em] text-primary-foreground/60 mb-1 uppercase">
              {now.toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[64px] font-bold leading-none text-primary-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {String(now.getDate()).padStart(2, '0')}
              </span>
              <div className="flex flex-col">
                <span className="text-xl font-bold leading-tight text-primary-foreground uppercase">
                  {now.toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-xl font-bold leading-tight text-primary-foreground/50">
                  {now.getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance card */}
        <div className="rounded-2xl bg-primary-foreground/12 p-4 backdrop-blur">
          <p className="text-primary-foreground/65 text-xs mb-1">
            {t('dashboard.balance')}
          </p>
          <p className="text-primary-foreground text-3xl font-bold tracking-tight">
            {format(totalBalance)}
          </p>
          <div className="flex gap-4 mt-3">
            <p className="text-xs text-primary-foreground/65">
              ↑{' '}
              <span className="text-emerald-300 font-medium">{format(periodIncome)}</span>
              {' '}{t('dashboard.income')}
            </p>
            <p className="text-xs text-primary-foreground/65">
              ↓{' '}
              <span className="text-red-300 font-medium">{format(periodExpense)}</span>
              {' '}{t('dashboard.expenses')}
            </p>
          </div>
        </div>
      </div>

      {/* ── 생활비 + 구간잔여금 통합 카드 ──────────────────────────────────────── */}
      <div className="px-4 pt-5">
        <div className="rounded-2xl bg-card shadow-sm p-4 border border-border">
          {/* 생활비 메인 섹션 */}
          <div className="flex items-center gap-3 mb-3">
            <JarIcon jar={activeJarId} size={26} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base leading-tight">
                {t(`jars.${activeJarId}`)}
              </p>
              <p className="text-xs text-muted-foreground">{activePct}% {t('dashboard.allocation')}</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${activeNet >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                {activeNet >= 0 ? '+' : ''}{format(activeNet)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.balance')} {format(activeBalance)}
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
            {t('dashboard.balanceSpentMonth', { pct: usagePct })}
          </p>

          {/* 구간 잔여금 서브 섹션 */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                {t(`period.${currentPeriod}`)}
                <span className="ml-1 text-muted-foreground/60 normal-case">
                  ({periodRange.start}–{periodEndDay}{t('period.dayUnit')})
                </span>
              </p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                daysRemainingInPeriod <= 2
                  ? 'bg-red-100 text-red-600'
                  : daysRemainingInPeriod <= 5
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-secondary text-muted-foreground'
              }`}>
                D-{daysRemainingInPeriod}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1.5">
              <span className="text-sm font-bold">{format(periodLivingSpent)}</span>
              {totalPeriodTarget > 0 ? (
                <span className="text-xs text-muted-foreground">/ {format(totalPeriodTarget)}</span>
              ) : (
                <button onClick={() => navigate('/budget')} className="text-xs text-primary font-medium">
                  {t('period.setBudget')}
                </button>
              )}
            </div>
            {totalPeriodTarget > 0 && (
              <>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${periodUsagePct}%`,
                      background: periodUsagePct >= 90 ? '#EF4444' : periodUsagePct >= 70 ? '#F59E0B' : '#10B981',
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {t('period.usagePct', { pct: periodUsagePct })}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent transactions ──────────────────────────────────────────────── */}
      <div className="px-4 pt-6 pb-28">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t('dashboard.recent')}
          </h2>
          <button onClick={() => navigate('/history')} className="text-xs text-primary font-medium">
            {t('dashboard.seeAll')}
          </button>
        </div>

        {recentTx.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">{t('dashboard.empty')}</p>
            <p className="text-xs mt-1">{t('dashboard.emptyHint')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentTx.map(tx => (
              <div key={tx.id} onClick={() => navigate(`/edit/${tx.id}`)} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm border border-border active:opacity-70 cursor-pointer">
                <JarIcon jar={tx.jar} size={18} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {tx.type === 'income'
                      ? String(t(`incomeCat.${tx.subCategory}`, { defaultValue: tx.subCategory }))
                      : `${t(`jars.${tx.jar}`)} · ${String(t(`sub.${tx.subCategory}`, { defaultValue: tx.subCategory }))}`}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tx.date.slice(5).replace('-', '/')} · {tx.note || getMemberName(tx.memberId)}
                  </p>
                </div>
                <p className={`font-semibold text-sm ${getTxColorClass(tx.type)}`}>
                  {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FAB ─────────────────────────────────────────────────────────────── */}
      <button
        onClick={() => {
          if (activeMember || members.length === 0) {
            navigate('/add');
          } else {
            setShowMemberSheet(true);
          }
        }}
        className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        style={{ bottom: 'calc(var(--ad-banner-height, 50px) + env(safe-area-inset-bottom, 0px) + 5rem)' }}
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>

      {showMemberSheet && (
        <MemberSelectSheet
          members={members}
          onSelect={m => {
            setActiveMember(m);
            setShowMemberSheet(false);
            navigate('/add');
          }}
          onClose={() => setShowMemberSheet(false)}
        />
      )}
    </div>
  );
}
