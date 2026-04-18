import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { useTransactions, useMembers, useCurrency, useJars } from '@/hooks/useStore';
import { JARS } from '@/types';
import type { JarId, JarBalance, Transaction } from '@/types';
import { JarIcon } from '@/components/JarIcon';
import { useTranslation } from 'react-i18next';
import { getTxColorClass } from '@/lib/utils';
import { useActiveMember } from '@/hooks/useActiveMember';
import MemberSelectSheet from '@/components/member/MemberSelectSheet';

type Period = 'month' | 'year';

function computePeriodNet(jarId: JarId, txs: Transaction[], allJars: JarBalance[]): number {
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { members, getMemberName } = useMembers();
  const { jars } = useJars();
  const { format } = useCurrency();
  const { t, i18n } = useTranslation();

  const [period, setPeriod] = useState<Period>('month');
  const { activeMember, setActiveMember } = useActiveMember();
  const [showMemberSheet, setShowMemberSheet] = useState(false);

  const now = new Date();
  const yearPrefix = now.getFullYear().toString();
  const monthPrefix = `${yearPrefix}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = period === 'month' ? monthPrefix : yearPrefix;

  const periodTxs = transactions.filter(tx => tx.date.startsWith(prefix));
  const totalBalance = jars.reduce((s, j) => s + j.balance, 0);
  const recentTx = transactions.slice(0, 8);

  return (
    <div className="min-h-screen pb-safe">
      {/* Header */}
      <div className="bg-primary px-5 pb-8 pt-safe">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">
              {now.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-primary-foreground text-3xl font-bold leading-tight">
              {now.toLocaleDateString(i18n.language, { day: 'numeric', weekday: 'short' })}
            </h1>
          </div>
          <button
            onClick={() => navigate('/members')}
            className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-primary-foreground/20 px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Users className="h-4 w-4" />
            {members.length || 0}
          </button>
        </div>

        <div className="rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur">
          <p className="text-primary-foreground/70 text-xs mb-1">{t('dashboard.balance')}</p>
          <p className="text-primary-foreground text-3xl font-bold">{format(totalBalance)}</p>
        </div>
      </div>

      {/* Jars */}
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{t('dashboard.yourJars')}</h2>
        </div>

        {/* Period toggle */}
        <div className="flex bg-muted rounded-xl p-1 mb-3">
          {(['month', 'year'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-all ${
                period === p
                  ? 'bg-white shadow-sm text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {t(`dashboard.${p === 'month' ? 'thisMonth' : 'thisYear'}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {JARS.map(def => {
            const j = jars.find(x => x.id === def.id);
            const pct = j?.allocationPct ?? def.defaultPct;
            const net = computePeriodNet(def.id, periodTxs, jars);
            const negative = net < 0;
            return (
              <div
                key={def.id}
                className="rounded-2xl bg-card p-4 shadow-sm"
                style={{ borderLeft: `4px solid ${def.color}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <JarIcon jar={def.id} size={16} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{t(`jars.${def.id}`)}</p>
                    <p className="text-[10px] text-muted-foreground">{pct}% • {t(`jars.${def.id}Desc`)}</p>
                  </div>
                </div>
                <p className={`text-lg font-bold ${negative ? 'text-destructive' : net > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  {net > 0 ? '+' : ''}{format(net)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {t('dashboard.balance')}: {format(j?.balance ?? 0)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('dashboard.recent')}</h2>
          <button onClick={() => navigate('/history')} className="text-sm text-primary font-medium">
            {t('dashboard.seeAll')}
          </button>
        </div>

        {recentTx.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">{t('dashboard.empty')}</p>
            <p className="text-xs mt-1">{t('dashboard.emptyHint')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTx.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
                <JarIcon jar={tx.jar} size={18} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {t(`jars.${tx.jar}`)} · {String(t(`sub.${tx.subCategory}`, { defaultValue: tx.subCategory }))}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tx.note || getMemberName(tx.memberId)}
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

      {/* FAB */}
      <button
        onClick={() => {
          if (activeMember || members.length === 0) {
            navigate('/add');
          } else {
            setShowMemberSheet(true);
          }
        }}
        className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>
      {showMemberSheet && (
        <MemberSelectSheet
          members={members}
          onSelect={(m) => {
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
