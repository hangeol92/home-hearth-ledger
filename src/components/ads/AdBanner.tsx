import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useSubscription } from '@/hooks/useSubscription';
import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
  type BannerAdOptions,
} from '@capacitor-community/admob';

const AD_HEIGHT = 50;
const isNative = Capacitor.isNativePlatform();

// 환경변수 미설정 시 Google 공식 테스트 ID로 fallback
const BANNER_AD_ID =
  (Capacitor.getPlatform() === 'ios'
    ? (import.meta.env.VITE_ADMOB_IOS_BANNER_ID as string | undefined)
    : (import.meta.env.VITE_ADMOB_ANDROID_BANNER_ID as string | undefined))
  ?? (Capacitor.getPlatform() === 'ios'
    ? 'ca-app-pub-3940256099942544/2934735716'
    : 'ca-app-pub-3940256099942544/6300978111');

export default function AdBanner() {
  const { isPremium, loading } = useSubscription();
  const [adReady, setAdReady] = useState(false);

  const shouldShow = isNative && !loading && !isPremium;

  useEffect(() => {
    document.documentElement.style.setProperty('--ad-banner-height', `${AD_HEIGHT}px`);
    return () => document.documentElement.style.setProperty('--ad-banner-height', '0px');
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--ad-banner-height',
      shouldShow ? `${AD_HEIGHT}px` : '0px'
    );
  }, [shouldShow]);

  // AdMob 초기화 (1회)
  useEffect(() => {
    if (!isNative) return;
    AdMob.initialize({ requestTrackingAuthorization: true })
      .then(() => setAdReady(true))
      .catch(console.warn);
  }, []);

  // 배너 표시 / 제거
  useEffect(() => {
    if (!adReady || !shouldShow) return;

    const options: BannerAdOptions = {
      adId: BANNER_AD_ID,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 96,
      isTesting: import.meta.env.DEV as boolean,
    };
    AdMob.showBanner(options).catch(console.warn);

    return () => { AdMob.removeBanner().catch(console.warn); };
  }, [adReady, shouldShow]);

  return null;
}
