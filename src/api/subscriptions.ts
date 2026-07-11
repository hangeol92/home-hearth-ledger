import { supabase } from '@/lib/supabase';

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'monthly' | 'annual';
  platform: 'ios' | 'android' | 'web';
  status: 'active' | 'cancelled' | 'expired';
  expires_at: string;
  created_at: string;
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  try {
    // 'cancelled' = 자동갱신 해제일 뿐, expires_at까지는 이용 가능
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'cancelled'])
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (error || !data) return null;
    return data as Subscription;
  } catch {
    return null;
  }
}

// TODO: invoke from RevenueCat webhook (mobile) or Stripe webhook (web)
export async function upsertSubscription(sub: Partial<Subscription> & { user_id: string }): Promise<void> {
  await supabase.from('subscriptions').upsert(sub, { onConflict: 'user_id' });
}

// TODO: invoke from RevenueCat purchase restore / Stripe customer portal
export async function cancelSubscription(userId: string): Promise<void> {
  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('user_id', userId);
}
