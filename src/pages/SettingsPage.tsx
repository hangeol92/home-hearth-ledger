import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency, useTransactions, useJars } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';
import { clearAllData } from '@/lib/db';
import { CURRENCIES, JARS } from '@/types';
import { Download, Trash2, RotateCcw, Copy, Check, LogOut, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/i18n';
import { JarIcon } from '@/components/JarIcon';
import { getMyHousehold, generateInviteCode } from '@/api/households';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { currency, setCurrency } = useCurrency();
  const { transactions } = useTransactions();
  const { jars, updateAllocation, reset } = useJars();
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [clearPasswordVisible, setClearPasswordVisible] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [clearError, setClearError] = useState('');

  const [household, setHousehold] = useState<{ id: string; name: string; invite_code: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    getMyHousehold().then(h => setHousehold(h as { id: string; name: string; invite_code: string } | null));
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch {
      toast({ title: 'Sign out failed', variant: 'destructive' });
    }
  };

  const handleCopyInviteCode = async () => {
    if (!household) return;
    await navigator.clipboard.writeText(household.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRegenerateCode = async () => {
    if (!household) return;
    try {
      const newCode = await generateInviteCode(household.id);
      setHousehold(h => h ? { ...h, invite_code: newCode } : h);
      toast({ title: '✓ New invite code generated' });
    } catch {
      toast({ title: 'Failed to regenerate code', variant: 'destructive' });
    }
  };

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
      toast({ title: t('settings.invalidTotal'), variant: 'destructive' });
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

  const handleClear = () => {
    setClearPassword('');
    setClearError('');
    setClearPasswordVisible(false);
    setShowClearDialog(true);
  };

  const handleClearConfirm = async () => {
    if (!user) {
      // Guest: no password check needed, just confirm
      setClearLoading(true);
      await clearAllData();
      window.location.reload();
      return;
    }
    if (!clearPassword) {
      setClearError('Please enter your password.');
      return;
    }
    setClearLoading(true);
    setClearError('');
    try {
      const { error } = await import('@/lib/supabase').then(m =>
        m.supabase.auth.signInWithPassword({ email: user.email!, password: clearPassword })
      );
      if (error) {
        setClearError('Incorrect password.');
        setClearLoading(false);
        return;
      }
      await clearAllData();
      window.location.reload();
    } catch {
      setClearError('Verification failed. Try again.');
      setClearLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm(t('settings.confirmReset'))) {
      await reset();
      toast({ title: '✓' });
    }
  };

  return (
    <div className="min-h-screen pb-safe">
      {/* Clear data confirmation dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowClearDialog(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
            </div>

            <h2 className="text-center text-lg font-bold text-gray-900 mb-1">
              {t('settings.clearAll')}
            </h2>
            <p className="text-center text-sm text-gray-500 mb-5">
              This will permanently delete all transactions, budgets, members, and jar data. This action cannot be undone.
            </p>

            {user && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <input
                    type={clearPasswordVisible ? 'text' : 'password'}
                    value={clearPassword}
                    onChange={e => { setClearPassword(e.target.value); setClearError(''); }}
                    placeholder="Password"
                    autoComplete="off"
                    data-1p-ignore
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                    onKeyDown={e => e.key === 'Enter' && handleClearConfirm()}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setClearPasswordVisible(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {clearPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {clearError && (
                  <p className="mt-1.5 text-xs text-red-600">{clearError}</p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowClearDialog(false)}
                className="flex-1 h-12 rounded-xl border border-gray-200 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClearConfirm}
                disabled={clearLoading || (!!user && !clearPassword)}
                className="flex-1 h-12 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-40"
              >
                {clearLoading ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="px-5 pb-4 pt-safe">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </div>

      <div className="px-5 space-y-6">
        {/* Account */}
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="font-semibold text-sm mb-3">Account</h2>
          {user ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Email</p>
                <p className="text-sm font-medium text-gray-700">{user.email}</p>
              </div>
              <Button onClick={handleSignOut} variant="outline" className="w-full rounded-xl h-12 justify-start gap-3 text-destructive hover:text-destructive">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/login')}
                className="w-full rounded-xl h-12 bg-black text-white font-medium"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                variant="outline"
                className="w-full rounded-xl h-12"
              >
                Create Account
              </Button>
            </div>
          )}
        </div>

        {/* Five Jars allocation */}
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-sm">{t('settings.fiveJars')}</h2>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              {t('settings.resetBalances')}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{t('settings.fiveJarsHint')}</p>
          <div className="space-y-2">
            {JARS.map(j => (
              <div key={j.id} className="flex items-center gap-3">
                <JarIcon jar={j.id} size={16} />
                <span className="flex-1 text-sm font-medium">{t(`jars.${j.id}`)}</span>
                <Input
                  type="number"
                  value={allocs[j.id] ?? ''}
                  onChange={e => setAllocs(a => ({ ...a, [j.id]: Math.max(0, parseFloat(e.target.value) || 0) }))}
                  className="w-20 rounded-lg text-right"
                  inputMode="numeric"
                  min="0"
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

        {/* Household invite code */}
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="font-semibold text-sm mb-3">Household</h2>
          {household ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Invite Code</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 font-mono text-2xl font-bold tracking-widest text-center rounded-xl bg-secondary py-3 px-3">
                  {household.invite_code}
                </span>
                <Button size="icon" variant="outline" onClick={handleCopyInviteCode} className="shrink-0 rounded-lg">
                  {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={handleRegenerateCode} variant="outline" size="sm" className="w-full rounded-xl">
                Regenerate Code
              </Button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/household/setup')}
              className="text-sm text-primary underline underline-offset-2"
            >
              Set up a household
            </button>
          )}
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
