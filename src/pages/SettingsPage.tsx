import { useCurrency } from '@/hooks/useStore';
import { clearAllData } from '@/lib/db';
import { CURRENCIES } from '@/types';
import { useTransactions } from '@/hooks/useStore';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n';

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency();
  const { transactions } = useTransactions();
  const { t, i18n } = useTranslation();

  const handleExport = () => {
    if (transactions.length === 0) {
      toast({ title: t('settings.noData') });
      return;
    }
    const header = 'Date,Type,Category,Amount,Note,Member\n';
    const rows = transactions.map(tx =>
      `${tx.date},${tx.type},${tx.category},${tx.amount},"${tx.note}",${tx.memberId}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `household-accounts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    if (window.confirm(t('settings.confirmClear'))) {
      await clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-14 pb-4 safe-top">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </div>

      <div className="px-5 space-y-6">
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

        <Button onClick={handleClear} variant="outline" className="w-full rounded-xl h-12 justify-start gap-3 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          {t('settings.clearAll')}
        </Button>
      </div>
    </div>
  );
}
