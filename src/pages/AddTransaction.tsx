import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTransactions, useMembers, useCurrency } from '@/hooks/useStore';
import { JARS, JAR_SUBCATEGORIES } from '@/types';
import type { Transaction, TransactionType, JarId } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JarIcon, getJarColor } from '@/components/JarIcon';
import { useTranslation } from 'react-i18next';

export default function AddTransaction() {
  const navigate = useNavigate();
  const { add } = useTransactions();
  const { members } = useMembers();
  const { symbol } = useCurrency();
  const { t } = useTranslation();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [jar, setJar] = useState<JarId>('living');
  const [subCategory, setSubCategory] = useState<string>(JAR_SUBCATEGORIES.living[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memberId, setMemberId] = useState(members[0]?.id || '');

  const subCats = JAR_SUBCATEGORIES[jar];

  const handleSave = async () => {
    if (!amount) return;
    const tx: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount: parseFloat(amount),
      jar,
      subCategory,
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
        {/* Type toggle */}
        <div className="flex rounded-xl bg-secondary p-1">
          {(['expense', 'income'] as const).map(tp => (
            <button
              key={tp}
              onClick={() => setType(tp)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                type === tp ? 'bg-card shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {tp === 'expense' ? t('add.expense') : t('add.income')}
            </button>
          ))}
        </div>

        {/* Amount */}
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

        {/* Jar selector — only for expense */}
        {type === 'expense' ? (
          <>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.jar')}</label>
              <div className="grid grid-cols-5 gap-2">
                {JARS.map(j => {
                  const active = jar === j.id;
                  return (
                    <button
                      key={j.id}
                      onClick={() => {
                        setJar(j.id);
                        setSubCategory(JAR_SUBCATEGORIES[j.id][0]);
                      }}
                      className="flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all"
                      style={{
                        backgroundColor: active ? `${j.color}25` : 'hsl(var(--secondary))',
                        outline: active ? `2px solid ${j.color}` : 'none',
                      }}
                    >
                      <JarIcon jar={j.id} size={18} />
                      <span className="text-[10px] font-medium leading-tight text-center">
                        {t(`jars.${j.id}`)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.subCategory')}</label>
              <div className="flex flex-wrap gap-2">
                {subCats.map(c => {
                  const active = subCategory === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setSubCategory(c)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        active ? 'text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}
                      style={active ? { backgroundColor: getJarColor(jar) } : undefined}
                    >
                      {t(`sub.${c}`, { defaultValue: c })}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground">
            {t('add.incomeHint')}
          </div>
        )}

        {/* Date */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.date')}</label>
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="rounded-xl"
          />
        </div>

        {/* Member */}
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

        {/* Note */}
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
