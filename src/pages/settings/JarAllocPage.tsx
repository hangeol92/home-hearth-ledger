import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { useJars, useCurrency } from '@/hooks/useStore';
import { JARS } from '@/types';
import { Input } from '@/components/ui/input';
import { JarIcon } from '@/components/JarIcon';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function JarAllocPage() {
  const navigate = useNavigate();
  const { jars, updateAllocation, reset } = useJars();
  const { symbol, format } = useCurrency();
  const { t } = useTranslation();

  const [allocMode, setAllocMode] = useState<'pct' | 'fixed'>('pct');
  const [allocs, setAllocs] = useState<Record<string, number>>({});
  const [fixedAllocs, setFixedAllocs] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    jars.forEach(j => { next[j.id] = j.allocationPct; });
    setAllocs(next);
  }, [jars]);

  const total = Object.values(allocs).reduce((s, n) => s + (Number.isFinite(n) ? n : 0), 0);
  const fixedTotal = Object.values(fixedAllocs).reduce((s, n) => s + (Number.isFinite(n) ? n : 0), 0);

  const handleSave = async () => {
    let pctsToSave: Record<string, number>;
    if (allocMode === 'pct') {
      if (Math.round(total) !== 100) {
        toast({ title: t('settings.invalidTotal'), variant: 'destructive' });
        return;
      }
      pctsToSave = allocs;
    } else {
      if (fixedTotal <= 0) {
        toast({ title: t('settings.invalidTotal'), variant: 'destructive' });
        return;
      }
      pctsToSave = {};
      JARS.forEach(j => {
        pctsToSave[j.id] = Math.round((fixedAllocs[j.id] ?? 0) / fixedTotal * 100 * 10) / 10;
      });
    }
    for (const j of jars) {
      await updateAllocation(j.id, pctsToSave[j.id] ?? 0);
    }
    toast({ title: '✓' });
    navigate(-1);
  };

  const handleReset = async () => {
    if (window.confirm(t('settings.confirmReset'))) {
      await reset();
      toast({ title: '✓' });
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center gap-2 px-3 pb-4 pt-2">
        <button onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-lg active:bg-secondary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold flex-1">{t('settings.fiveJars')}</h1>
        <button onClick={handleReset} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5" />
          {t('settings.resetBalances')}
        </button>
      </div>

      <div className="px-5 space-y-5">
        {/* Mode toggle */}
        <div className="flex bg-muted rounded-xl p-1 text-sm">
          <button
            onClick={() => setAllocMode('pct')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${allocMode === 'pct' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            % {t('settings.fiveJarsHint', { defaultValue: '비율' }).split(' ')[0]}
          </button>
          <button
            onClick={() => setAllocMode('fixed')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${allocMode === 'fixed' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            {symbol} 고정금액
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {allocMode === 'pct' ? t('settings.fiveJarsHint') : t('settings.fiveJarsHintFixed', { defaultValue: '매월 배분할 고정 금액을 입력하세요. 비율로 자동 변환됩니다.' })}
        </p>

        <div className="rounded-xl bg-card shadow-sm overflow-hidden">
          {JARS.map((j, i) => (
            <div key={j.id} className={`flex items-center gap-3 px-4 py-3 ${i < JARS.length - 1 ? 'border-b border-border' : ''}`}>
              <JarIcon jar={j.id} size={16} />
              <span className="flex-1 text-sm font-medium">{t(`jars.${j.id}`)}</span>
              {allocMode === 'pct' ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="text" inputMode="decimal"
                    value={allocs[j.id] ?? ''}
                    onChange={e => setAllocs(a => ({ ...a, [j.id]: Math.max(0, parseFloat(e.target.value) || 0) }))}
                    className="w-20 rounded-lg text-right"
                  />
                  <span className="text-sm text-muted-foreground w-4">%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">{symbol}</span>
                  <Input
                    type="text" inputMode="decimal"
                    value={fixedAllocs[j.id] ?? ''}
                    onChange={e => setFixedAllocs(a => ({ ...a, [j.id]: Math.max(0, parseFloat(e.target.value) || 0) }))}
                    className="w-28 rounded-lg text-right"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-semibold">{t('settings.totalPct')}</span>
          {allocMode === 'pct' ? (
            <span className={`text-sm font-bold ${Math.round(total) === 100 ? 'text-green-600' : 'text-destructive'}`}>
              {Math.round(total)}%
            </span>
          ) : (
            <span className={`text-sm font-bold ${fixedTotal > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
              {format(fixedTotal)}
            </span>
          )}
        </div>

        <Button onClick={handleSave} className="w-full h-12 rounded-xl">
          {t('budget.save')}
        </Button>
      </div>
    </div>
  );
}
