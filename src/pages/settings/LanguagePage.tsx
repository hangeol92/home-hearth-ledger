import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n';

export default function LanguagePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center gap-2 px-3 pb-4 pt-2">
        <button onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-lg active:bg-secondary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">{t('settings.language')}</h1>
      </div>

      <div className="px-5">
        <div className="rounded-xl bg-card shadow-sm overflow-hidden">
          {LANGUAGES.map((l, i) => {
            const active = i18n.language === l.code || i18n.language.startsWith(l.code);
            return (
              <button
                key={l.code}
                onClick={() => { i18n.changeLanguage(l.code); navigate(-1); }}
                className={`flex items-center justify-between w-full px-4 py-4 text-sm font-medium active:bg-secondary ${i < LANGUAGES.length - 1 ? 'border-b border-border' : ''}`}
              >
                <span>{l.name}</span>
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
