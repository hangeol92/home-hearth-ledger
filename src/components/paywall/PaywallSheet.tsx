import { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';

const PLANS = [
  { id: 'annual',  labelKey: 'paywall.annual',  priceKey: 'paywall.priceAnnual',  badgeKey: 'paywall.bestValue' },
  { id: 'monthly', labelKey: 'paywall.monthly', priceKey: 'paywall.priceMonthly', badgeKey: null },
] as const;

const BENEFITS = [
  { icon: '🚫', labelKey: 'paywall.benefit1' },
  { icon: '👨‍👩‍👧‍👦', labelKey: 'paywall.benefit2' },
  { icon: '☁️', labelKey: 'paywall.benefit3' },
] as const;

export default function PaywallSheet() {
  const { closePaywall } = useSubscription();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      // TODO: 로그인 유도
      closePaywall();
      return;
    }
    setLoading(true);
    try {
      // TODO: 플랫폼 감지 후 분기
      // - iOS/Android: RevenueCat SDK 호출
      //   import Purchases from '@revenuecat/purchases-capacitor';
      //   await Purchases.purchasePackage({ aPackage: ... });
      // - Web: Stripe Checkout 세션 생성
      //   const { url } = await createStripeCheckoutSession(selectedPlan);
      //   window.location.href = url;
      alert('결제 연동 준비 중입니다. (RevenueCat / Stripe)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={closePaywall} />
      <div className="relative bg-white rounded-t-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* 핸들 + 닫기 */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full absolute top-2 left-1/2 -translate-x-1/2" />
          <button onClick={closePaywall} className="mt-2 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-8 flex-1">
          {/* 헤더 */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-bold">{t('paywall.title')}</h2>
            </div>
            <p className="text-sm text-gray-500">{t('paywall.subtitle')}</p>
          </div>

          {/* 혜택 */}
          <div className="space-y-3 mb-6">
            {BENEFITS.map(b => (
              <div key={b.labelKey} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{b.icon}</span>
                <span className="text-sm font-medium text-gray-800">{t(b.labelKey)}</span>
                <Check className="ml-auto h-4 w-4 text-emerald-500 shrink-0" />
              </div>
            ))}
          </div>

          {/* 플랜 선택 */}
          <div className="space-y-2 mb-6">
            {PLANS.map(plan => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full rounded-2xl p-4 text-left transition-all border-2 ${
                  selectedPlan === plan.id
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{t(plan.labelKey)}</span>
                      {plan.badgeKey && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedPlan === plan.id ? 'bg-amber-400 text-gray-900' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {t(plan.badgeKey)}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${selectedPlan === plan.id ? 'text-white/70' : 'text-gray-400'}`}>
                      {t(plan.priceKey)}
                    </p>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedPlan === plan.id ? 'border-white' : 'border-gray-300'
                  }`}>
                    {selectedPlan === plan.id && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-gray-900 text-white font-bold text-base disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {loading ? '처리 중...' : t('paywall.cta')}
          </button>
          <p className="text-center text-[11px] text-gray-400 mt-3">
            {t('paywall.legal')}
          </p>
        </div>
      </div>
    </div>
  );
}
