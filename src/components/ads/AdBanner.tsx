import { useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

const AD_HEIGHT = 50;

export default function AdBanner() {
  const { isPremium, loading } = useSubscription();

  // 로딩 중에는 광고 있는 것으로 간주 (레이아웃 shift 방지)
  const hidden = !loading && isPremium;

  useEffect(() => {
    document.documentElement.style.setProperty('--ad-banner-height', `${AD_HEIGHT}px`);
    return () => document.documentElement.style.setProperty('--ad-banner-height', '0px');
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--ad-banner-height',
      hidden ? '0px' : `${AD_HEIGHT}px`
    );
  }, [hidden]);

  if (hidden) return null;

  // TODO: 실제 광고로 교체
  // - 모바일: @capacitor-community/admob 배너
  // - 웹: Google AdSense 스크립트
  return (
    <div
      className="w-full flex items-center gap-3 px-3 bg-white border-t border-gray-100"
      style={{ height: AD_HEIGHT }}
    >
      {/* 광고주 로고 자리 */}
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">AD</span>
      </div>

      {/* 광고 텍스트 */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-900 leading-tight truncate">
          가계부 관리, 더 스마트하게
        </p>
        <p className="text-[10px] text-gray-400 leading-tight truncate">
          지금 무료로 시작하세요 · sponsored
        </p>
      </div>

      {/* CTA */}
      <button className="shrink-0 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white">
        더 보기
      </button>
    </div>
  );
}
