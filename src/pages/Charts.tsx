import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useTransactions, useMembers, useCurrency } from '@/hooks/useStore';
import { getCategoryColor } from '@/components/CategoryIcon';

export default function Charts() {
  const { transactions } = useTransactions();
  const { members } = useMembers();
  const { format } = useCurrency();
  const [memberFilter, setMemberFilter] = useState('all');

  const filtered = memberFilter === 'all'
    ? transactions
    : transactions.filter(t => t.memberId === memberFilter);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Pie chart: spending by category this month
  const monthExpenses = filtered.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
  const byCat = monthExpenses.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const pieData = Object.entries(byCat).map(([name, value]) => ({ name, value }));

  // Bar chart: last 6 months
  const barData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const mTx = filtered.filter(t => t.date.startsWith(m));
    barData.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      income: mTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: mTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    });
  }

  const totalExpense = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-14 pb-4 safe-top">
        <h1 className="text-2xl font-bold">Charts</h1>
      </div>

      {/* Member filter */}
      {members.length > 0 && (
        <div className="px-5 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setMemberFilter('all')}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
                memberFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >All</button>
            {members.map(m => (
              <button
                key={m.id}
                onClick={() => setMemberFilter(m.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
                  memberFilter === m.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >{m.name}</button>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 space-y-6">
        {/* Pie */}
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="font-semibold text-sm mb-1">Spending by Category</h2>
          <p className="text-xs text-muted-foreground mb-4">This month</p>
          {pieData.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">No data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={getCategoryColor(d.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => format(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(d.name) }} />
                    <span>{d.name}</span>
                    <span className="text-muted-foreground">{Math.round(d.value / totalExpense * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar */}
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="font-semibold text-sm mb-1">Monthly Trend</h2>
          <p className="text-xs text-muted-foreground mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value: number) => format(value)} />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
