import { Home, List, CalendarDays, Bell, MoreHorizontal } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tabs = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/history', icon: List, label: t('nav.history') },
    { path: '/calendar', icon: CalendarDays, label: t('nav.calendar') },
    { path: '/notifications', icon: Bell, label: t('nav.notifications') },
    { path: '/settings', icon: MoreHorizontal, label: t('nav.settings') },
  ];

  if (location.pathname === '/add' || location.pathname.startsWith('/edit/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-1">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors',
                active ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.5} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
