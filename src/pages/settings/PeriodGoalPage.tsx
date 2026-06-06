import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { usePeriodGoalSettings } from '@/hooks/usePeriodGoalSettings';
import { useTranslation } from 'react-i18next';

const now = new Date();
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

const PERIODS = [
  { key: 'early' as const, start: 1,  end: 10 },
  { key: 'mid'   as const, start: 11, end: 20 },
  { key: 'late'  as const, start: 21, end: lastDay },
];

export default function PeriodGoalPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings, save } = usePeriodGoalSettings();

  const [pcts, setPcts] = useState({
    early: String(settings.earlyPct),
    mid:   String(settings.midPct),
    late:  String(settings.latePct),
  });

  const vals = {
    early: Number(pcts.early) || 0,
    mid:   Number(pcts.mid)   || 0,
    late:  Number(pcts.late)  || 0,
  };
  const total = vals.early + vals.mid + vals.late;
  const isValid = total === 100;

  const commit = (next: typeof pcts) => {
    const e = Number(next.early) || 0;
    const m = Number(next.mid)   || 0;
    const l = Number(next.late)  || 0;
    if (e + m + l === 100) {
      save({ ...settings, earlyPct: e, midPct: m, latePct: l });
    }
  };

  const setPct = (key: 'early' | 'mid' | 'late', val: string) => {
    const next = { ...pcts, [key]: val };
    setPcts(next);
    commit(next);
  };

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">{t('periodGoal.title')}</h1>
      </div>

      <div className="px-5 py-6 space-y-4">
        {/* Toggle */}
        <div className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3.5">
          <div>
            <p className="text-sm font-medium">{t('periodGoal.enable')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('periodGoal.enableHint')}</p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={enabled => save({ ...settings, enabled })}
          />
        </div>

        {settings.enabled && (
          <>
            <p className="text-xs text-muted-foreground px-1">{t('periodGoal.pctHint')}</p>

            {PERIODS.map(({ key, start, end }) => (
              <div key={key} className="flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{t(`period.${key}`)}</p>
                  <p className="text-xs text-muted-foreground">
                    {start}–{end}{t('period.dayUnit')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={pcts[key]}
                    onChange={e => setPct(key, e.target.value)}
                    className="w-16 h-9 text-right rounded-lg text-sm"
                  />
                  <span className="text-sm text-muted-foreground w-4">%</span>
                </div>
              </div>
            ))}

            <div className={`flex justify-between text-sm px-1 font-medium ${isValid ? 'text-emerald-600' : 'text-destructive'}`}>
              <span>{t('settings.totalPct')}</span>
              <span>{total}%</span>
            </div>
            {!isValid && (
              <p className="text-xs text-destructive px-1">{t('periodGoal.totalError')}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
