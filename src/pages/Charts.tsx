import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useTransactions, useMembers, useCurrency } from '@/hooks/useStore';
import { JARS } from '@/types';
import { useTranslation } from 'react-i18next';
import { filterByMember } from '@/lib/utils';

export default function Charts() {
  const { transactions } = useTransactions();
  const { members } = useMembers();
  const { format } = useCurrency();
  const { t, i18n } = useTranslation();
  const [memberFilter, setMemberFilter] = useState('all');

  const filtered = filterByMember(transactions, memberFilter);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthExpenses = filtered.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
  const byJar = monthExpenses.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.jar] = (acc[tx.jar] || 0) + tx.amount;
    return acc;
  }, {});
  const pieData = JARS
    .filter(j => byJar[j.id])
    .map(j => ({
      id: j.id,
      label: t(`jars.${j.id}`),
      value: byJar[j.id],
      color: j.color,
    }));

  const barData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const mTx = filtered.filter(tx => tx.date.startsWith(m));
    barData.push({
      month: d.toLocaleDateString(i18n.language, { month: 'short' }),
      income: mTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0),
      expense: mTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0),
    });
  }

  const totalExpense = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="min-h-screen pb-safe">
      <div className="px-5 pb-4 pt-safe">
        <h1 className="text-2xl font-bold">{t('charts.title')}</h1>
      </div>

      {members.length > 0 && (
        <div className="px-5 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setMemberFilter('all')}
              className={`shrink-0 min-h-[40px] rounded-full px-4 py-2 text-sm font-medium ${
                memberFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >{t('history.all')}</button>
            {members.map(m => (
              <button
                key={m.id}
                onClick={() => setMemberFilter(m.id)}
                className={`shrink-0 min-h-[40px] rounded-full px-4 py-2 text-sm font-medium ${
                  memberFilter === m.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >{m.name}</button>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 space-y-6">
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="font-semibold text-sm mb-4">{t('charts.byJar')}</h2>
          {pieData.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">{t('charts.noData')}</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => format(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                {pieData.map(d => (
                  <div key={d.id} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.label}</span>
                    <span className="text-muted-foreground">{Math.round(d.value / totalExpense * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="font-semibold text-sm mb-4">{t('charts.monthlyTrend')}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value: number) => format(value)} />
              <Bar dataKey="income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
