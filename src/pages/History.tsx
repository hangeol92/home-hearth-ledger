import { useState } from 'react';
import { useTransactions, useMembers, useCurrency } from '@/hooks/useStore';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function History() {
  const { transactions, remove } = useTransactions();
  const { members } = useMembers();
  const { format } = useCurrency();
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.memberId === filter);

  const grouped = filtered.reduce<Record<string, typeof transactions>>((acc, tx) => {
    const month = tx.date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(tx);
    return acc;
  }, {});

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '';

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-14 pb-4 safe-top">
        <h1 className="text-2xl font-bold">{t('history.title')}</h1>
      </div>

      {members.length > 0 && (
        <div className="px-5 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
                filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {t('history.all')}
            </button>
            {members.map(m => (
              <button
                key={m.id}
                onClick={() => setFilter(m.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${
                  filter === m.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-5">
        {Object.keys(grouped).length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">{t('history.empty')}</p>
        ) : (
          Object.entries(grouped).map(([month, txs]) => (
            <div key={month} className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                {new Date(month + '-01').toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
              </p>
              <div className="space-y-2">
                {txs.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
                    <CategoryIcon category={tx.category} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{String(t(`categories.${tx.category}`, { defaultValue: tx.category }))}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.date.slice(5)} · {tx.note || getMemberName(tx.memberId)}
                      </p>
                    </div>
                    <p className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                    </p>
                    <button onClick={() => remove(tx.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
