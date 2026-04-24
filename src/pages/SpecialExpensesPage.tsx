import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useSpecialExpenses, useCurrency } from '@/hooks/useStore';
import type { SpecialExpense, SpecialExpensePayment, SpecialExpenseFunding } from '@/types';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

const FUNDING_ICONS: Record<SpecialExpenseFunding, string> = {
  bonus:   '🎁',
  reserve: '🏦',
  monthly: '📅',
};

export default function SpecialExpensesPage() {
  const navigate = useNavigate();
  const { specialExpenses, save, remove, addPayment, removePayment } = useSpecialExpenses();
  const { format } = useCurrency();
  const { t } = useTranslation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addPaymentForId, setAddPaymentForId] = useState<string | null>(null);

  // New expense form
  const [newName, setNewName] = useState('');
  const [newTotal, setNewTotal] = useState('');
  const [newFunding, setNewFunding] = useState<SpecialExpenseFunding>('bonus');
  const [newMemo, setNewMemo] = useState('');

  // New payment form
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payAmount, setPayAmount] = useState('');
  const [payMemo, setPayMemo] = useState('');

  const handleAddExpense = async () => {
    if (!newName.trim() || !newTotal) return;
    const expense: SpecialExpense = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      totalAmount: parseFloat(newTotal),
      fundingSource: newFunding,
      payments: [],
      createdAt: new Date().toISOString(),
      memo: newMemo.trim() || undefined,
    };
    await save(expense);
    setShowAddForm(false);
    setNewName('');
    setNewTotal('');
    setNewMemo('');
  };

  const handleAddPayment = async (expenseId: string) => {
    const amount = parseFloat(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const payment: SpecialExpensePayment = {
      id: crypto.randomUUID(),
      date: payDate,
      amount,
      memo: payMemo.trim() || undefined,
    };
    await addPayment(expenseId, payment);
    setAddPaymentForId(null);
    setPayAmount('');
    setPayMemo('');
    setPayDate(new Date().toISOString().split('T')[0]);
  };

  const totalPaid = (expense: SpecialExpense) =>
    expense.payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen pb-safe bg-background">
      <div className="flex items-center gap-2 px-3 pb-4 pt-safe">
        <button onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-lg active:bg-secondary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold flex-1">{t('special.title')}</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 space-y-3">
        {specialExpenses.length === 0 && !showAddForm && (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-2xl mb-2">💎</p>
            <p className="text-sm">{t('special.empty')}</p>
            <p className="text-xs mt-1 text-muted-foreground/60">{t('special.emptyHint')}</p>
          </div>
        )}

        {/* Add expense form */}
        {showAddForm && (
          <div className="rounded-2xl bg-card border border-border p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">{t('special.addTitle')}</p>
              <button onClick={() => setShowAddForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <Input placeholder={t('special.namePlaceholder')} value={newName}
              onChange={e => setNewName(e.target.value)} className="rounded-xl" />
            <Input type="number" inputMode="decimal" min="0" placeholder={t('special.totalPlaceholder')}
              value={newTotal} onChange={e => setNewTotal(e.target.value)} className="rounded-xl" />
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t('special.funding')}</p>
              <div className="flex gap-2">
                {(['bonus', 'reserve', 'monthly'] as SpecialExpenseFunding[]).map(f => (
                  <button key={f} onClick={() => setNewFunding(f)}
                    className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium transition-all ${
                      newFunding === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}>
                    <span>{FUNDING_ICONS[f]}</span>
                    <span>{t(`special.fund_${f}`)}</span>
                  </button>
                ))}
              </div>
            </div>
            <Input placeholder={t('special.memoPlaceholder')} value={newMemo}
              onChange={e => setNewMemo(e.target.value)} className="rounded-xl" />
            <button onClick={handleAddExpense} disabled={!newName.trim() || !newTotal}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-30">
              {t('special.save')}
            </button>
          </div>
        )}

        {/* Expense list */}
        {specialExpenses.map(expense => {
          const paid = totalPaid(expense);
          const remaining = expense.totalAmount - paid;
          const pct = expense.totalAmount > 0 ? Math.min(100, Math.round((paid / expense.totalAmount) * 100)) : 0;
          const isExpanded = expandedId === expense.id;
          const isAddingPayment = addPaymentForId === expense.id;

          return (
            <div key={expense.id} className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              {/* Header row */}
              <div className="p-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-lg leading-none mt-0.5">{FUNDING_ICONS[expense.fundingSource]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight">{expense.name}</p>
                    {expense.memo && <p className="text-xs text-muted-foreground mt-0.5 truncate">{expense.memo}</p>}
                  </div>
                  <button onClick={() => remove(expense.id)} className="p-1 text-muted-foreground/50 shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{format(paid)} / {format(expense.totalAmount)}</span>
                    <span className={remaining < 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      {remaining >= 0 ? `${format(remaining)} ${t('special.remaining')}` : `+${format(-remaining)} ${t('special.over')}`}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: pct >= 100 ? '#10B981' : '#3B82F6' }} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setAddPaymentForId(isAddingPayment ? null : expense.id)}
                    className="flex-1 h-9 rounded-xl bg-primary/10 text-primary text-xs font-semibold">
                    + {t('special.addPayment')}
                  </button>
                  <button onClick={() => setExpandedId(isExpanded ? null : expense.id)}
                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Add payment form */}
              {isAddingPayment && (
                <div className="px-4 pb-4 pt-0 space-y-2 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground pt-3">{t('special.paymentDetails')}</p>
                  <div className="flex gap-2">
                    <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                      className="rounded-xl flex-1 h-9 text-sm" />
                    <Input type="number" inputMode="decimal" min="0" placeholder={t('special.amount')}
                      value={payAmount} onChange={e => setPayAmount(e.target.value)}
                      className="rounded-xl flex-1 h-9 text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder={t('special.memoPlaceholder')} value={payMemo}
                      onChange={e => setPayMemo(e.target.value)} className="rounded-xl flex-1 h-9 text-sm" />
                    <button onClick={() => handleAddPayment(expense.id)} disabled={!payAmount}
                      className="h-9 w-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-30 shrink-0">
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Payment history */}
              {isExpanded && expense.payments.length > 0 && (
                <div className="border-t border-border/50">
                  {[...expense.payments].sort((a, b) => b.date.localeCompare(a.date)).map(p => (
                    <div key={p.id} className="flex items-center gap-2 px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{p.date}</p>
                        {p.memo && <p className="text-xs text-muted-foreground/70 truncate">{p.memo}</p>}
                      </div>
                      <p className="text-sm font-semibold">{format(p.amount)}</p>
                      <button onClick={() => removePayment(expense.id, p.id)} className="p-1 text-muted-foreground/40">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
