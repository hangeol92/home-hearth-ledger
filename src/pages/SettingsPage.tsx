import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency, useTransactions, useJars } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { clearAllData } from '@/lib/db';
import { JARS } from '@/types';
import {
  Download, Trash2, LogOut, AlertTriangle, Eye, EyeOff,
  ChevronRight, Users, Gem, Globe, DollarSign, Home, Star,
  HelpCircle, Mail, Info, Shield, FileText,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n';
import { getMyHousehold } from '@/api/households';

const APP_VERSION = '1.0.0';

function SettingsRow({
  icon, label, value, onPress, danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onPress}
      className={`flex items-center gap-3 w-full px-4 py-3.5 text-sm active:bg-secondary ${danger ? 'text-destructive' : ''}`}
    >
      <span className={`shrink-0 ${danger ? 'text-destructive' : 'text-muted-foreground'}`}>{icon}</span>
      <span className="flex-1 text-left font-medium">{label}</span>
      {value && <span className="text-muted-foreground text-xs mr-1">{value}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="px-4 pt-6 pb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {label}
    </p>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-5 rounded-xl bg-card shadow-sm overflow-hidden divide-y divide-border">
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const { transactions } = useTransactions();
  const { jars, updateAllocation } = useJars();
  const { t, i18n } = useTranslation();
  const { signOut, user } = useAuth();
  const { isPremium, openPaywall } = useSubscription();

  const [household, setHousehold] = useState<{ id: string; name: string; invite_code: string } | null>(null);
  useEffect(() => {
    getMyHousehold().then(h => setHousehold(h as typeof household));
  }, []);

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [clearPasswordVisible, setClearPasswordVisible] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [clearError, setClearError] = useState('');

  const handleSignOut = async () => {
    try { await signOut(); navigate('/login'); }
    catch { toast({ title: 'Sign out failed', variant: 'destructive' }); }
  };

  const handleExport = () => {
    if (!isPremium) { openPaywall(); return; }
    if (transactions.length === 0) { toast({ title: t('settings.noData') }); return; }
    const header = 'Date,Type,Jar,SubCategory,Amount,Note,Member\n';
    const rows = transactions.map(tx =>
      `${tx.date},${tx.type},${tx.jar},${tx.subCategory},${tx.amount},"${tx.note}",${tx.memberId}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `five-jars-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleClearConfirm = async () => {
    if (!user) {
      setClearLoading(true);
      await clearAllData(); window.location.reload(); return;
    }
    if (!clearPassword) { setClearError('Please enter your password.'); return; }
    setClearLoading(true); setClearError('');
    try {
      const { error } = await import('@/lib/supabase').then(m =>
        m.supabase.auth.signInWithPassword({ email: user.email!, password: clearPassword })
      );
      if (error) { setClearError('Incorrect password.'); setClearLoading(false); return; }
      await clearAllData(); window.location.reload();
    } catch {
      setClearError('Verification failed. Try again.'); setClearLoading(false);
    }
  };

  const currentLang = LANGUAGES.find(l => i18n.language === l.code || i18n.language.startsWith(l.code))?.name ?? '';

  return (
    <div className="min-h-screen bg-background pb-safe" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>

      {/* Clear dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowClearDialog(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
            </div>
            <h2 className="text-center text-lg font-bold mb-1">{t('settings.clearAll')}</h2>
            <p className="text-center text-sm text-gray-500 mb-5">
              {t('settings.clearDialogDesc')}
            </p>
            {user && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.passwordConfirm')}</label>
                <div className="relative">
                  <input
                    type={clearPasswordVisible ? 'text' : 'password'}
                    value={clearPassword}
                    onChange={e => { setClearPassword(e.target.value); setClearError(''); }}
                    placeholder="Password"
                    autoComplete="off" data-1p-ignore
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                    onKeyDown={e => e.key === 'Enter' && handleClearConfirm()}
                    autoFocus
                  />
                  <button type="button" onClick={() => setClearPasswordVisible(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {clearPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {clearError && <p className="mt-1.5 text-xs text-red-600">{clearError}</p>}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowClearDialog(false)}
                className="flex-1 h-12 rounded-xl border border-gray-200 text-sm font-medium">{t('actions.cancel')}</button>
              <button onClick={handleClearConfirm}
                disabled={clearLoading || (!!user && !clearPassword)}
                className="flex-1 h-12 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-40">
                {clearLoading ? t('settings.clearing') : t('settings.confirmClearBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-2 pb-4">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </div>

      {/* 구독 */}
      <div className="mx-5 rounded-xl overflow-hidden shadow-sm">
        {isPremium ? (
          <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl px-4 py-4">
            <Star className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-700">{t('paywall.active')}</p>
              <p className="text-xs text-amber-500">{t('paywall.legal')}</p>
            </div>
          </div>
        ) : (
          <button onClick={openPaywall}
            className="flex items-center gap-3 w-full bg-gray-900 rounded-xl px-4 py-4 active:opacity-80">
            <Gem className="h-5 w-5 text-white shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">{t('subscription.upgrade')}</p>
              <p className="text-xs text-gray-400">{t('paywall.tagline')}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
          </button>
        )}
      </div>

      {/* Account */}
      <SectionHeader label={t('settings.account')} />
      <SectionCard>
        {user ? (
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="text-muted-foreground shrink-0"><LogOut className="h-4 w-4" /></span>
            <span className="flex-1 text-sm font-medium text-left truncate text-muted-foreground">{user.email}</span>
            <button onClick={handleSignOut} className="shrink-0 text-xs font-semibold text-destructive px-2 py-1 rounded-lg active:bg-destructive/10">
              {t('settings.logout')}
            </button>
          </div>
        ) : (
          <>
            <SettingsRow icon={<LogOut className="h-4 w-4" />} label={t('settings.login')} onPress={() => navigate('/login')} />
            <SettingsRow icon={<Users className="h-4 w-4" />} label={t('settings.signup')} onPress={() => navigate('/signup')} />
          </>
        )}
      </SectionCard>

      {/* Ledger */}
      <SectionHeader label={t('settings.ledger')} />
      <SectionCard>
        <SettingsRow icon={<Users className="h-4 w-4" />} label={t('members.title')} onPress={() => navigate('/members')} />
        <SettingsRow icon={<Home className="h-4 w-4" />} label={t('settings.fiveJars')} onPress={() => navigate('/settings/jars')} />
      </SectionCard>

      {/* 앱 설정 */}
      <SectionHeader label={t('settings.language') + ' / ' + t('settings.currency')} />
      <SectionCard>
        <SettingsRow icon={<Globe className="h-4 w-4" />} label={t('settings.language')} value={currentLang} onPress={() => navigate('/settings/language')} />
        <SettingsRow icon={<DollarSign className="h-4 w-4" />} label={t('settings.currency')} value={currency} onPress={() => navigate('/settings/currency')} />
      </SectionCard>

      {/* Shared Ledger */}
      <SectionHeader label={t('settings.sharedLedger')} />
      <SectionCard>
        <SettingsRow
          icon={<Users className="h-4 w-4" />}
          label="Household"
          value={household?.name ?? (user ? t('settings.householdSetup') : t('settings.loginRequired'))}
          onPress={() => navigate('/household/setup')}
        />
      </SectionCard>

      {/* Data */}
      <SectionHeader label={t('settings.data')} />
      <SectionCard>
        <SettingsRow icon={<Download className="h-4 w-4" />} label={t('settings.exportCsv')} onPress={handleExport} />
        <SettingsRow icon={<Trash2 className="h-4 w-4" />} label={t('settings.clearAll')} onPress={() => { setClearPassword(''); setClearError(''); setShowClearDialog(true); }} danger />
      </SectionCard>

      {/* App Info */}
      <SectionHeader label={t('settings.appInfo')} />
      <SectionCard>
        <SettingsRow icon={<HelpCircle className="h-4 w-4" />} label={t('settings.help')} onPress={() => navigate('/settings/help')} />
        <SettingsRow icon={<Mail className="h-4 w-4" />} label={t('settings.contact')} onPress={() => { window.open('mailto:support@fivejars.app?subject=Five Jars', '_blank'); }} />
        <SettingsRow icon={<Shield className="h-4 w-4" />} label={t('settings.privacy')} onPress={() => navigate('/settings/privacy')} />
        <SettingsRow icon={<FileText className="h-4 w-4" />} label={t('settings.terms')} onPress={() => navigate('/settings/terms')} />
        <button className="flex items-center gap-3 w-full px-4 py-3.5 text-sm">
          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="flex-1 text-left font-medium">{t('settings.version')}</span>
          <span className="text-muted-foreground text-xs">v{APP_VERSION}</span>
        </button>
      </SectionCard>

      <div className="h-8" />
    </div>
  );
}
