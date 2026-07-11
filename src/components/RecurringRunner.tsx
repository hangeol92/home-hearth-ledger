import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useStore';
import { loadRules, dueDatesFor, markRuleApplied } from '@/hooks/useRecurringRules';
import type { JarId } from '@/types';

// 앱 세션당 1회만 실행 (리마운트 중복 방지)
let hasRun = false;

/** 앱 시작 시 반복 거래 규칙을 확인하고 도래한 거래를 자동 등록 */
export default function RecurringRunner() {
  const { isLoading } = useAuth();
  const { add } = useTransactions();
  const addRef = useRef(add);
  addRef.current = add;

  useEffect(() => {
    // 로그인 상태 확정 전에 실행하면 회원 데이터가 로컬 DB에 저장되므로 대기
    if (isLoading || hasRun) return;
    hasRun = true;

    (async () => {
      const today = new Date().toISOString().split('T')[0];
      for (const rule of loadRules()) {
        for (const date of dueDatesFor(rule, today)) {
          await addRef.current({
            ...rule.template,
            jar: rule.template.jar as JarId,
            id: crypto.randomUUID(),
            date,
            createdAt: new Date().toISOString(),
          });
          // 도중에 앱이 종료돼도 중복 등록되지 않도록 건별로 기록
          markRuleApplied(rule.id, date.slice(0, 7));
        }
      }
    })();
  }, [isLoading]);

  return null;
}
