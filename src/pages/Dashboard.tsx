import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { useTransactions, useMembers, useCurrency, useJars } from '@/hooks/useStore';
import { JARS } from '@/types';
import { JarIcon } from '@/components/JarIcon';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { members } = useMembers();
  const { jars } = useJars();
  const { format } = useCurrency();
  const { t, i18n } = useTranslation();

  const now = new Date();
  const totalBalance = jars.reduce((s, j) => s + j.balance, 0);
  const recentTx = transactions.slice(0, 8);

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '';

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-primary px-5 pb-8 pt-14 safe-top">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">
              {now.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-primary-foreground text-2xl font-bold">{t('app.title')}</h1>
          </div>
          <button
            onClick={() => navigate('/members')}
            className="flex items-center gap-1 rounded-full bg-primary-foreground/20 px-3 py-1.5 text-xs text-primary-foreground"
          >
            <Users className="h-3.5 w-3.5" />
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
        <h2 className="text-lg font-semibold mb-3">{t('dashboard.yourJars')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {JARS.map(def => {
            const j = jars.find(x => x.id === def.id);
            const balance = j?.balance ?? 0;
            const pct = j?.allocationPct ?? def.defaultPct;
            const negative = balance < 0;
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
                <p className={`text-lg font-bold ${negative ? 'text-destructive' : ''}`}>
                  {format(balance)}
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
                <p className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/add')}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>
    </div>
  );
}
