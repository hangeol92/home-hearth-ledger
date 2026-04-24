// src/components/BottomNav.tsx
// Drop-in replacement — thinner strokes (1.3 inactive / 1.8 active).
// Same routing logic, same tabs.

import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import AdBanner from '@/components/ads/AdBanner';

// ─── Thin line-art nav icons ─────────────────────────────────────────────────
const S = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function HomeIcon({ active }: { active: boolean }) {
  const sw = active ? 1.8 : 1.3;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path {...S} stroke="currentColor" strokeWidth={sw} d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path {...S} stroke="currentColor" strokeWidth={sw} d="M9 21v-9h6v9" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  const sw = active ? 1.8 : 1.3;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      {[6, 12, 18].map(y => (
        <line key={y} {...S} stroke="currentColor" strokeWidth={sw} x1="3" y1={y} x2="21" y2={y} />
      ))}
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  const sw = active ? 1.8 : 1.3;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect {...S} stroke="currentColor" strokeWidth={sw} x="3" y="4" width="18" height="18" rx="2" />
      <line {...S} stroke="currentColor" strokeWidth={sw} x1="3" y1="9" x2="21" y2="9" />
      <line {...S} stroke="currentColor" strokeWidth={sw} x1="8" y1="2" x2="8" y2="6" />
      <line {...S} stroke="currentColor" strokeWidth={sw} x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}

function JarNavIcon({ active }: { active: boolean }) {
  const sw = active ? 1.8 : 1.3;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect {...S} stroke="currentColor" strokeWidth={sw} x="8" y="2" width="8" height="2.5" rx="1.25" />
      <rect {...S} stroke="currentColor" strokeWidth={sw} x="9" y="4.5" width="6" height="2" />
      <path {...S} stroke="currentColor" strokeWidth={sw}
        d="M7 6.5 C5 7.5 4.5 9.5 4.5 12 L4.5 18 Q4.5 21.5 8 21.5 L16 21.5 Q19.5 21.5 19.5 18 L19.5 12 C19.5 9.5 19 7.5 17 6.5 Z" />
    </svg>
  );
}

function MoreIcon({ active }: { active: boolean }) {
  const sw = active ? 1.8 : 1.3;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <circle cx="5"  cy="12" r="1.3" stroke="currentColor" strokeWidth={sw} fill="none" />
      <circle cx="12" cy="12" r="1.3" stroke="currentColor" strokeWidth={sw} fill="none" />
      <circle cx="19" cy="12" r="1.3" stroke="currentColor" strokeWidth={sw} fill="none" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tabs = [
    { path: '/',              Icon: HomeIcon,     label: t('nav.home')          },
    { path: '/history',       Icon: ListIcon,     label: t('nav.history')       },
    { path: '/calendar',      Icon: CalendarIcon, label: t('nav.calendar')      },
    { path: '/jars',          Icon: JarNavIcon,   label: t('nav.jars')          },
    { path: '/settings',      Icon: MoreIcon,     label: t('nav.settings')      },
  ];

  if (location.pathname === '/add' || location.pathname.startsWith('/edit/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg">
      <AdBanner />
      <div className="border-t border-border mx-auto flex max-w-lg items-center justify-around py-1 safe-bottom">
        {tabs.map(({ path, Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon active={active} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
