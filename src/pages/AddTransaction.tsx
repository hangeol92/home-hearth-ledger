import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTransactions, useMembers, useCurrency } from '@/hooks/useStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';
import type { Transaction, TransactionType, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

export default function AddTransaction() {
  const navigate = useNavigate();
  const { add } = useTransactions();
  const { members } = useMembers();
  const { symbol } = useCurrency();
  const { t } = useTranslation();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memberId, setMemberId] = useState(members[0]?.id || '');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSave = async () => {
    if (!amount || !category) return;
    const tx: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount: parseFloat(amount),
      category,
      note,
      date,
      memberId,
      createdAt: new Date().toISOString(),
    };
    await add(tx);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 safe-top">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">{t('add.title')}</h1>
      </div>

      <div className="px-5 space-y-6">
        <div className="flex rounded-xl bg-secondary p-1">
          {(['expense', 'income'] as const).map(tp => (
            <button
              key={tp}
              onClick={() => { setType(tp); setCategory(tp === 'expense' ? 'Food' : 'Salary'); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                type === tp ? 'bg-card shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {tp === 'expense' ? t('add.expense') : t('add.income')}
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.amount')}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
              {symbol}
            </span>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="pl-8 text-2xl font-bold h-14 rounded-xl"
              inputMode="decimal"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.category')}</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === c
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {String(t(`categories.${c}`, { defaultValue: c }))}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.date')}</label>
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="rounded-xl"
          />
        </div>

        {members.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.member')}</label>
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMemberId(m.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    memberId === m.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.note')}</label>
          <Input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={t('add.notePlaceholder')}
            className="rounded-xl"
          />
        </div>

        <Button onClick={handleSave} className="w-full h-12 rounded-xl text-base font-semibold" disabled={!amount}>
          {t('add.save')}
        </Button>
      </div>
    </div>
  );
}
