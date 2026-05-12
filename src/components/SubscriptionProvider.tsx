import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getActiveSubscription } from '@/api/subscriptions';
import { SubscriptionContext } from '@/hooks/useSubscription';
import {
  isNative,
  getCustomerInfo,
  isPremiumCustomer,
  loginPurchases,
  logoutPurchases,
} from '@/lib/purchases';

const CACHE_KEY = 'hhl_premium';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'false'); }
    catch { return false; }
  });
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  const setAndCache = (active: boolean) => {
    setIsPremium(active);
    localStorage.setItem(CACHE_KEY, JSON.stringify(active));
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Native: RevenueCat が正
      if (isNative) {
        const info = await getCustomerInfo();
        setAndCache(isPremiumCustomer(info));
        return;
      }
      // Web fallback: Supabase subscriptions 테이블
      if (user) {
        const sub = await getActiveSubscription(user.id);
        setAndCache(sub !== null);
      } else {
        setIsPremium(false);
        localStorage.removeItem(CACHE_KEY);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 사용자 변경 시 RevenueCat user ID 동기화
  useEffect(() => {
    if (user) {
      loginPurchases(user.id).catch(console.warn);
    } else {
      logoutPurchases().catch(console.warn);
    }
    refresh();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SubscriptionContext.Provider value={{
      isPremium, loading, showPaywall,
      openPaywall:  () => setShowPaywall(true),
      closePaywall: () => setShowPaywall(false),
      refresh,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
