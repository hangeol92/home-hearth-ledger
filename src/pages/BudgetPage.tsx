import { useState } from 'react';
import { useBudgets, useTransactions, useCurrency } from '@/hooks/useStore';
import { EXPENSE_CATEGORIES } from '@/types';
import type { Budget, ExpenseCategory } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Plus, X } from 'lucide-react';

export default function BudgetPage() {
  const { budgets, save, remove } = useBudgets();
  const { transactions } = useTransactions();
  const { format } = useCurrency();
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState<ExpenseCategory>('Food');
  const [newAmount, setNewAmount] = useState('');

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthBudgets = budgets.filter(b => b.month === currentMonth);
  const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));

  const getSpent = (cat: string) =>
    monthExpenses.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);

  const handleAdd = async () => {
    if (!newAmount) return;
    const budget: Budget = {
      id: `${currentMonth}-${newCat}`,
      category: newCat,
      amount: parseFloat(newAmount),
      month: currentMonth,
    };
    await save(budget);
    setAdding(false);
    setNewAmount('');
  };

  const usedCategories = monthBudgets.map(b => b.category);
  const availableCategories = EXPENSE_CATEGORIES.filter(c => !usedCategories.includes(c));

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-14 pb-4 safe-top">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Budget</h1>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {monthBudgets.length === 0 && !adding && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            No budgets set. Tap + to add one.
          </p>
        )}

        {monthBudgets.map(b => {
          const spent = getSpent(b.category);
          const pct = Math.min((spent / b.amount) * 100, 100);
          const over = spent > b.amount;
          return (
            <div key={b.id} className="rounded-xl bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <CategoryIcon category={b.category} size={18} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{b.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(spent)} / {format(b.amount)}
                  </p>
                </div>
                <button onClick={() => remove(b.id)} className="p-1 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Progress value={pct} className={`h-2 ${over ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`} />
              {over && (
                <p className="text-xs text-destructive font-medium mt-1">
                  Over budget by {format(spent - b.amount)}
                </p>
              )}
            </div>
          );
        })}

        {adding && (
          <div className="rounded-xl bg-card p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(c => (
                <button
                  key={c}
                  onClick={() => setNewCat(c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    newCat === c ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Budget amount"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              className="rounded-xl"
              inputMode="decimal"
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm" className="rounded-xl" disabled={!newAmount}>Save</Button>
              <Button onClick={() => setAdding(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        )}

        {!adding && availableCategories.length > 0 && (
          <button
            onClick={() => { setAdding(true); setNewCat(availableCategories[0]); }}
            className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border p-4 w-full text-muted-foreground text-sm"
          >
            <Plus className="h-4 w-4" /> Add budget
          </button>
        )}
      </div>
    </div>
  );
}
