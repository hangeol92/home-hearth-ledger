import * as Sentry from '@sentry/capacitor';
import * as SentryReact from '@sentry/react';
import { Capacitor } from '@capacitor/core';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  Sentry.init(
    {
      dsn,
      environment: import.meta.env.MODE,
      // 네이티브 앱은 모든 에러 캡처, 웹은 10% 샘플링
      tracesSampleRate: Capacitor.isNativePlatform() ? 1.0 : 0.1,
      // 개발 환경에서는 콘솔 출력만 (Sentry 전송 안 함)
      enabled: import.meta.env.PROD,
    },
    SentryReact.init,
  );
}

export { Sentry };
