import { Home, List, PieChart, Wallet, Settings } from 'lucide-react';
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
    { path: '/budget', icon: Wallet, label: t('nav.budget') },
    { path: '/charts', icon: PieChart, label: t('nav.charts') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  if (location.pathname === '/add') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
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
