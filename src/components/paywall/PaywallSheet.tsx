import { useState, useEffect } from 'react';
import { X, Check, Sparkles, RotateCcw } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  isNative,
  getOfferings,
  purchasePackage,
  restorePurchases,
  isPremiumCustomer,
} from '@/lib/purchases';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { useToast } from '@/hooks/use-toast';

const BENEFITS = [
  { icon: '🚫', labelKey: 'paywall.benefit1' },
  { icon: '👨‍👩‍👧‍👦', labelKey: 'paywall.benefit2' },
  { icon: '☁️', labelKey: 'paywall.benefit3' },
] as const;

type PlanId = 'monthly' | 'annual';

interface PlanOption {
  id: PlanId;
  labelKey: string;
  badgeKey: string | null;
  pkg: PurchasesPackage | null;
  priceString: string;
}

export default function PaywallSheet() {
  const { closePaywall, refresh } = useSubscription();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [plans, setPlans] = useState<PlanOption[]>([
    { id: 'annual',  labelKey: 'paywall.annual',  badgeKey: 'paywall.bestValue', pkg: null, priceString: t('paywall.priceAnnual') },
    { id: 'monthly', labelKey: 'paywall.monthly', badgeKey: null,                pkg: null, priceString: t('paywall.priceMonthly') },
  ]);

  // RevenueCat에서 실제 상품 정보 로드
  useEffect(() => {
    if (!isNative) return;
    getOfferings().then(offerings => {
      const current = offerings?.current;
      if (!current) return;
      setPlans(prev => prev.map(p => {
        const pkg = p.id === 'annual' ? current.annual : current.monthly;
        if (!pkg) return p;
        return { ...p, pkg, priceString: pkg.product.priceString };
      }));
    });
  }, []);

  const handleSubscribe = async () => {
    if (!user) {
      closePaywall();
      navigate('/login');
      return;
    }
    if (!isNative) {
      // 웹: 실제 결제 없음 (향후 Stripe 연동 예정)
      toast({ description: '모바일 앱에서 구독해 주세요.', duration: 3000 });
      return;
    }
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan?.pkg) {
      toast({ description: '상품 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.', variant: 'destructive', duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      await purchasePackage(plan.pkg);
      await refresh();
      closePaywall();
      toast({ description: '🎉 프리미엄 구독이 시작됐습니다!' });
    } catch (e: any) {
      // USER_CANCELLED는 에러 아님
      if (e?.code !== 'USER_CANCELLED' && e?.userCancelled !== true) {
        toast({ description: '결제 중 오류가 발생했습니다.', variant: 'destructive', duration: 3000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!isNative) return;
    setRestoring(true);
    try {
      const info = await restorePurchases();
      const active = isPremiumCustomer(info);
      await refresh();
      if (active) {
        toast({ description: '✓ 구독이 복원됐습니다.' });
        closePaywall();
      } else {
        toast({ description: '복원할 구독 내역이 없습니다.', duration: 3000 });
      }
    } catch {
      toast({ description: '복원 중 오류가 발생했습니다.', variant: 'destructive', duration: 3000 });
    } finally {
      setRestoring(false);
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
            {plans.map(plan => (
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
                      {plan.priceString}
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
            disabled={loading || restoring}
            className="w-full h-14 rounded-2xl bg-gray-900 text-white font-bold text-base disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {loading ? t('settings.clearing') : t('paywall.cta')}
          </button>

          <p className="text-center text-[11px] text-gray-400 mt-3">
            {t('paywall.legal')}
          </p>

          {/* 구매 복원 (App Store 필수 요건) */}
          {isNative && (
            <button
              onClick={handleRestore}
              disabled={loading || restoring}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 active:opacity-60 disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" />
              {restoring ? '복원 중...' : t('paywall.manage')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
