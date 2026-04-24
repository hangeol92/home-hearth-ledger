import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getActiveSubscription } from '@/api/subscriptions';
import { SubscriptionContext } from '@/hooks/useSubscription';

const CACHE_KEY = 'hhl_premium';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'false'); }
    catch { return false; }
  });
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      localStorage.removeItem(CACHE_KEY);
      setLoading(false);
      return;
    }
    const sub = await getActiveSubscription(user.id);
    const active = sub !== null;
    setIsPremium(active);
    localStorage.setItem(CACHE_KEY, JSON.stringify(active));
    setLoading(false);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <SubscriptionContext.Provider value={{
      isPremium, loading, showPaywall,
      openPaywall: () => setShowPaywall(true),
      closePaywall: () => setShowPaywall(false),
      refresh,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
