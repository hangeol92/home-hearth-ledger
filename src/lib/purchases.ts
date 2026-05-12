import { Capacitor } from '@capacitor/core';
import type {
  CustomerInfo,
  Offerings,
  PurchasesPackage,
} from '@revenuecat/purchases-capacitor';

export const isNative = Capacitor.isNativePlatform();

export const ENTITLEMENT_ID = 'premium';

// ── Init ────────────────────────────────────────────────────────────────────

export async function initPurchases(): Promise<void> {
  if (!isNative) return;
  const platform = Capacitor.getPlatform();
  const apiKey = (platform === 'ios'
    ? import.meta.env.VITE_REVENUECAT_IOS_KEY
    : import.meta.env.VITE_REVENUECAT_ANDROID_KEY) as string | undefined;
  if (!apiKey) {
    console.warn(`[Purchases] RevenueCat API key not set for platform: ${platform}`);
    return;
  }
  const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
  if (import.meta.env.DEV) {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  }
  await Purchases.configure({ apiKey });
}

// ── User linking ─────────────────────────────────────────────────────────────

export async function loginPurchases(userId: string): Promise<void> {
  if (!isNative) return;
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  await Purchases.logIn({ appUserID: userId });
}

export async function logoutPurchases(): Promise<void> {
  if (!isNative) return;
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  await Purchases.logOut();
}

// ── Customer info ────────────────────────────────────────────────────────────

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isNative) return null;
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch {
    return null;
  }
}

export function isPremiumCustomer(info: CustomerInfo | null): boolean {
  return !!info?.entitlements.active[ENTITLEMENT_ID];
}

// ── Offerings ────────────────────────────────────────────────────────────────

export async function getOfferings(): Promise<Offerings | null> {
  if (!isNative) return null;
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { offerings } = await Purchases.getOfferings();
    return offerings;
  } catch {
    return null;
  }
}

// ── Purchase ──────────────────────────────────────────────────────────────────

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<CustomerInfo> {
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo;
}
