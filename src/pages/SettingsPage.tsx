import { useState, useEffect } from 'react';
import { useCurrency, useTransactions, useJars } from '@/hooks/useStore';
import { clearAllData } from '@/lib/db';
import { CURRENCIES, JARS } from '@/types';
import { Download, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n';
import { JarIcon } from '@/components/JarIcon';

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency();
  const { transactions } = useTransactions();
  const { jars, updateAllocation, reset } = useJars();
  const { t, i18n } = useTranslation();

  // Local editable allocations
  const [allocs, setAllocs] = useState<Record<string, number>>({});
  useEffect(() => {
    const next: Record<string, number> = {};
    jars.forEach(j => { next[j.id] = j.allocationPct; });
    setAllocs(next);
  }, [jars]);

  const total = Object.values(allocs).reduce((s, n) => s + (Number.isFinite(n) ? n : 0), 0);

  const handleSaveAllocs = async () => {
    if (Math.round(total) !== 100) {
      toast({ title: t('settings.invalidTotal'), variant: 'destructive' as any });
      return;
    }
    for (const j of jars) {
      if (allocs[j.id] !== j.allocationPct) {
        await updateAllocation(j.id, allocs[j.id]);
      }
    }
    toast({ title: '✓' });
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      toast({ title: t('settings.noData') });
      return;
    }
    const header = 'Date,Type,Jar,SubCategory,Amount,Note,Member\n';
    const rows = transactions.map(tx =>
      `${tx.date},${tx.type},${tx.jar},${tx.subCategory},${tx.amount},"${tx.note}",${tx.memberId}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `five-jars-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    if (window.confirm(t('settings.confirmClear'))) {
      await clearAllData();
      window.location.reload();
    }
  };

  const handleReset = async () => {
    if (window.confirm(t('settings.confirmReset'))) {
      await reset();
      toast({ title: '✓' });
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-14 pb-4 safe-top">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </div>

      <div className="px-5 space-y-6">
        {/* Five Jars allocation */}
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="font-semibold text-sm mb-1">{t('settings.fiveJars')}</h2>
          <p className="text-xs text-muted-foreground mb-3">{t('settings.fiveJarsHint')}</p>
          <div className="space-y-2">
            {JARS.map(j => (
              <div key={j.id} className="flex items-center gap-3">
                <JarIcon jar={j.id} size={16} />
                <span className="flex-1 text-sm font-medium">{t(`jars.${j.id}`)}</span>
                <Input
                  type="number"
                  value={allocs[j.id] ?? ''}
                  onChange={e => setAllocs(a => ({ ...a, [j.id]: parseFloat(e.target.value) || 0 }))}
                  className="w-20 rounded-lg text-right"
                  inputMode="numeric"
                />
                <span className="text-sm text-muted-foreground w-4">%</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <span className="text-sm font-semibold">{t('settings.totalPct')}</span>
            <span className={`text-sm font-bold ${Math.round(total) === 100 ? 'text-green-600' : 'text-destructive'}`}>
              {Math.round(total)}%
            </span>
          </div>
          <Button onClick={handleSaveAllocs} size="sm" className="w-full mt-3 rounded-xl">
            {t('budget.save')}
          </Button>
        </div>

        {/* Language */}
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="font-semibold text-sm mb-3">{t('settings.language')}</h2>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => i18n.changeLanguage(l.code)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  i18n.language === l.code || i18n.language.startsWith(l.code)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="font-semibold text-sm mb-3">{t('settings.currency')}</h2>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  currency === c.code
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleExport} variant="outline" className="w-full rounded-xl h-12 justify-start gap-3">
          <Download className="h-4 w-4" />
          {t('settings.exportCsv')}
        </Button>

        <Button onClick={handleReset} variant="outline" className="w-full rounded-xl h-12 justify-start gap-3">
          <RotateCcw className="h-4 w-4" />
          {t('settings.resetBalances')}
        </Button>

        <Button onClick={handleClear} variant="outline" className="w-full rounded-xl h-12 justify-start gap-3 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          {t('settings.clearAll')}
        </Button>
      </div>
    </div>
  );
}
