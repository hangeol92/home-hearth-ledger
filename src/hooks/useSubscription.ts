import { createContext, useContext } from 'react';

export interface SubscriptionCtx {
  isPremium: boolean;
  loading: boolean;
  showPaywall: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  refresh: () => Promise<void>;
}

export const SubscriptionContext = createContext<SubscriptionCtx>({
  isPremium: false,
  loading: true,
  showPaywall: false,
  openPaywall: () => {},
  closePaywall: () => {},
  refresh: async () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}
