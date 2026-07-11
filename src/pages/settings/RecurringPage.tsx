import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Repeat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRecurringRules } from '@/hooks/useRecurringRules';
import { useCurrency } from '@/hooks/useStore';
import type { RecurringRule } from '@/types';

export default function RecurringPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { rules, remove } = useRecurringRules();
  const { format } = useCurrency();

  const ruleLabel = (rule: RecurringRule) => {
    const { template } = rule;
    if (template.note) return template.note;
    if (template.type === 'income') {
      return t(`incomeCat.${template.subCategory}`, { defaultValue: template.subCategory });
    }
    if (template.jar === 'living') {
      return t(`livingSub.${template.subCategory}`, { defaultValue: template.subCategory });
    }
    return t(`sub.${template.subCategory}`, { defaultValue: template.subCategory });
  };

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center gap-2 px-3 pb-4 pt-2">
        <button onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-lg active:bg-secondary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">{t('settings.recurring')}</h1>
      </div>

      <div className="px-5">
        {rules.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-card shadow-sm px-6 py-10 text-center">
            <Repeat className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t('recurring.empty')}</p>
          </div>
        ) : (
          <div className="rounded-xl bg-card shadow-sm overflow-hidden">
            {rules.map((rule, i) => (
              <div
                key={rule.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < rules.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ruleLabel(rule)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('recurring.monthlyOn', { day: rule.dayOfMonth })}
                  </p>
                </div>
                <span className={`text-sm font-semibold shrink-0 ${rule.template.type === 'income' ? 'text-emerald-600' : ''}`}>
                  {rule.template.type === 'income' ? '+' : '-'}{format(rule.template.amount)}
                </span>
                <button
                  onClick={() => remove(rule.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-destructive active:bg-secondary shrink-0"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 px-1 text-xs text-muted-foreground">{t('recurring.hint')}</p>
      </div>
    </div>
  );
}
