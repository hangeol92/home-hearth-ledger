import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUtilityBills, useCurrency } from '@/hooks/useStore';
import type { UtilityBill } from '@/types';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

export default function UtilityBillsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { save, getByMonth } = useUtilityBills();
  const { format } = useCurrency();

  const [month, setMonth] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  });
  const [fields, setFields] = useState<Partial<Record<keyof Omit<UtilityBill, 'yearMonth'>, string>>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getByMonth(month).then(bill => {
      setFields({
        water:       bill?.water       != null ? String(bill.water)       : '',
        electricity: bill?.electricity != null ? String(bill.electricity) : '',
        gas:         bill?.gas         != null ? String(bill.gas)         : '',
        internet:    bill?.internet    != null ? String(bill.internet)    : '',
        telecom:     bill?.telecom     != null ? String(bill.telecom)     : '',
      });
    });
  }, [month]); // eslint-disable-line react-hooks/exhaustive-deps

  const shift = (delta: number) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const parse = (v: string | undefined) => { const n = parseFloat(v ?? ''); return Number.isFinite(n) ? n : undefined; };

  const monthlyAvg = (() => {
    return ((parse(fields.water) ?? 0) / 2)
      + (parse(fields.electricity) ?? 0)
      + (parse(fields.gas) ?? 0)
      + (parse(fields.internet) ?? 0)
      + (parse(fields.telecom) ?? 0);
  })();

  const handleSave = async () => {
    const bill: UtilityBill = {
      yearMonth: month,
      water: parse(fields.water), electricity: parse(fields.electricity),
      gas: parse(fields.gas), internet: parse(fields.internet), telecom: parse(fields.telecom),
    };
    await save(bill);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const rows: { key: keyof Omit<UtilityBill, 'yearMonth'>; label: string; bimonthly: boolean }[] = [
    { key: 'water',       label: t('utility.water'),       bimonthly: true  },
    { key: 'electricity', label: t('utility.electricity'),  bimonthly: false },
    { key: 'gas',         label: t('utility.gas'),          bimonthly: false },
    { key: 'internet',    label: t('utility.internet'),     bimonthly: false },
    { key: 'telecom',     label: t('utility.telecom'),      bimonthly: false },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center gap-2 px-3 pb-4 pt-2">
        <button onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-lg active:bg-secondary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold flex-1">{t('utility.title')}</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => shift(-1)} className="p-1 text-muted-foreground"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm font-medium tabular-nums w-16 text-center">{month}</span>
          <button onClick={() => shift(1)} className="p-1 text-muted-foreground"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="px-5 space-y-4">
        <div className="rounded-xl bg-card shadow-sm overflow-hidden">
          {rows.map(({ key, label, bimonthly }, i) => (
            <div key={key} className={`flex items-center gap-3 px-4 py-3 ${i < rows.length - 1 ? 'border-b border-border' : ''}`}>
              <span className="text-sm font-medium flex-1">{label}</span>
              {bimonthly && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 shrink-0">
                  {t('utility.bimonthly')}
                </span>
              )}
              <Input
                type="text" inputMode="decimal" min="0" placeholder="0"
                value={fields[key] ?? ''}
                onChange={e => setFields(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-28 rounded-lg text-right h-9 text-sm"
              />
            </div>
          ))}
        </div>

        {monthlyAvg > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-muted-foreground">{t('utility.monthlyAvg')}</span>
            <span className="text-sm font-bold">{format(monthlyAvg)}</span>
          </div>
        )}

        <button
          onClick={handleSave}
          className={`w-full h-12 rounded-xl text-sm font-semibold transition-colors ${
            saved ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground'
          }`}
        >
          {saved ? '✓ Saved' : t('utility.save')}
        </button>
      </div>
    </div>
  );
}
