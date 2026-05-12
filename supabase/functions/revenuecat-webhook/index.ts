import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// RevenueCat event types → subscription status mapping
const ACTIVE_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'NON_SUBSCRIPTION_PURCHASE',
]);
const INACTIVE_EVENTS = new Set([
  'CANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
]);

type SubscriptionStatus = 'active' | 'cancelled' | 'expired';
type Platform = 'ios' | 'android' | 'web';
type Plan = 'monthly' | 'annual';

interface RCEvent {
  type: string;
  app_user_id: string;
  original_app_user_id: string;
  product_id: string;
  expiration_at_ms: number | null;
  purchased_at_ms: number;
  store: string;
  environment: string;
}

interface RCWebhookPayload {
  event: RCEvent;
}

function resolveStatus(eventType: string): SubscriptionStatus | null {
  if (ACTIVE_EVENTS.has(eventType)) return 'active';
  if (eventType === 'CANCELLATION') return 'cancelled';
  if (INACTIVE_EVENTS.has(eventType)) return 'expired';
  return null;
}

function resolvePlan(productId: string): Plan {
  return productId.includes('annual') ? 'annual' : 'monthly';
}

function resolvePlatform(store: string): Platform {
  if (store === 'APP_STORE' || store === 'MAC_APP_STORE') return 'ios';
  if (store === 'PLAY_STORE' || store === 'AMAZON') return 'android';
  return 'web';
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Verify shared secret — must be configured; reject all requests if missing
  const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (!secret) {
    console.error('[RC] REVENUECAT_WEBHOOK_SECRET is not configured');
    return new Response('Internal Server Error', { status: 500 });
  }
  const authHeader = req.headers.get('Authorization') ?? '';
  if (authHeader !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: RCWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const { event } = payload;
  if (!event?.type || !event?.app_user_id) {
    return new Response('Bad Request: missing event fields', { status: 400 });
  }

  // Ignore sandbox events in production
  if (event.environment === 'SANDBOX') {
    console.log(`[RC] Skipping sandbox event: ${event.type}`);
    return new Response('OK', { status: 200 });
  }

  const status = resolveStatus(event.type);
  if (!status) {
    // Unknown event type — ignore gracefully
    console.log(`[RC] Unknown event type, ignoring: ${event.type}`);
    return new Response('OK', { status: 200 });
  }

  // app_user_id = Supabase user UUID (set via loginPurchases in the app)
  const userId = event.original_app_user_id || event.app_user_id;

  // Service role key bypasses RLS — safe only in Edge Function (server-side)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const expiresAt = event.expiration_at_ms
    ? new Date(event.expiration_at_ms).toISOString()
    : new Date(Date.now() + 1000 * 60 * 60 * 24 * 400).toISOString(); // 400일 (lifetime 대비)

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      plan: resolvePlan(event.product_id),
      platform: resolvePlatform(event.store),
      status,
      expires_at: expiresAt,
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('[RC] DB upsert failed:', error.message);
    return new Response('Internal Server Error', { status: 500 });
  }

  console.log(`[RC] ${event.type} → user=${userId} status=${status}`);
  return new Response('OK', { status: 200 });
});
