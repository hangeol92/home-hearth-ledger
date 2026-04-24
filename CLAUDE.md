# Home Hearth Ledger — CLAUDE.md

## 프로젝트 개요
가족 가계부 앱. React + TypeScript + Vite + Capacitor (iOS/Android).  
비회원(IndexedDB)과 회원(Supabase) 모두 지원. 모바일 375px 기준, iOS 스타일 UI.

## 커맨드
```bash
npm run dev          # 개발 서버 (port 8080)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npm run test         # Vitest 단발 실행
npx cap sync ios     # 빌드 후 iOS 동기화
```

## 기술 스택
- React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix UI)
- React Hook Form + Zod, TanStack Query, React Router v6
- IndexedDB (idb) — 비회원 로컬 저장
- Supabase — 회원 클라우드 저장 및 실시간 동기화
- Capacitor 7.x (iOS/Android 빌드)
- i18next — 한국어/영어/일본어 (`src/i18n/locales/`)

---

## 아키텍처

### 데이터 레이어
- `src/lib/db.ts` — IndexedDB 래퍼. 4개 오브젝트 스토어: `transactions`, `budgets`, `members`, `jars`
- `src/hooks/useStorage.ts` — 로그인 상태에 따라 IndexedDB 또는 Supabase 자동 선택
- `src/hooks/useStore.ts` — `useTransactions`, `useBudgets`, `useMembers`, `useJars`, `useCurrency` 훅 제공. **db.ts를 직접 호출하는 유일한 레이어**

### 라우팅
- 페이지 컴포넌트는 `src/pages/`에 위치, `src/App.tsx`의 라우트와 1:1 대응
- 하단 탭: 홈(`/`) / 내역(`/history`) / 달력(`/calendar`) / 알림 / 壺(`/jars`)
- 설정 하위 페이지: `/settings/jars`, `/settings/utility`, `/settings/language`, `/settings/currency`, `/settings/help`

### 핵심 도메인 — Five Jars 시스템
- 수입 거래: 5개 壺(giving/investing/savings/living/seed)에 설정 비율로 자동 분배
- 지출 거래: 특정 壺에서 차감
- 壺 잔액 변경은 반드시 `useStore.ts`의 훅을 통해서만 수행

---

## 거래 등록 (AddTransaction.tsx)

### 지출 카테고리 구조
- **壺 선택** → 壺가 `living`이면 2단계 카테고리, 나머지는 1단계
- **생활비(living) 2단계**: 대분류(`LivingMainCategory`, 11개) → 세부항목
  - 대분류: `LIVING_MAIN_CATEGORY_ICONS` (types/index.ts)
  - 세부항목: `LIVING_SUBCATEGORIES` (types/index.ts)
- **그 외 壺**: `JAR_SUBCATEGORIES[jar]` 사용

### 수입 카테고리
- `INCOME_MAIN_CATEGORIES = ['Salary', 'Bonus', 'Asset Adjustment', 'Other']`
- 수입 거래는 `jar: undefined`로 저장됨 — **표시 시 `t('jars.undefined')` 방지 필요**
  - Dashboard, History에서 `tx.type === 'income'`이면 `t('incomeCat.${tx.subCategory}')` 사용

### 커스텀 카테고리
- `src/hooks/useCustomCategories.ts` — localStorage에 저장 (`hhl_custom_main_cats`, `hhl_custom_sub_cats`)
- 대분류와 세부항목 모두 유저가 직접 추가 가능
- 이모지 선택 UI: `CATEGORY_EMOJI_OPTIONS` (types/index.ts, 96개)

### iOS 주의사항
- 숫자 입력 필드: `type="text" inputMode="decimal" pattern="[0-9]*"` 사용 (`type="number"`는 WKWebView에서 키보드 미표시)
- JARS.find() 결과에 `!` 단언 금지 → `?? JARS[0]` fallback 사용 (비정상 jar id로 크래시 방지)

---

## i18n 키 네임스페이스
| 키 | 용도 |
|----|------|
| `jars.*` | 壺 이름 (giving/investing/savings/living/seed) |
| `mainCat.*` | 생활비 대분류 (Food/Transport/…/Other) |
| `livingSub.*` | 생활비 세부항목 |
| `incomeCat.*` | 수입 대분류 (Salary/Bonus/Asset Adjustment/Other) |
| `sub.*` | 비생활비 壺 세부항목 |

---

## 사용자 유형별 동작

| 구분 | 저장 위치 | 공유 가계부 | 데이터 백업 |
|------|-----------|------------|------------|
| 비회원 (게스트) | 기기 내 IndexedDB | 불가 | 불가 |
| 회원 (로그인) | Supabase 클라우드 | 가능 | 가능 |

- 앱 실행 시 로그인 화면 없이 바로 진입 (게스트 모드)
- 공유/백업 기능 접근 시 회원가입 유도
- 게스트 → 회원 전환 시 IndexedDB 데이터를 Supabase로 마이그레이션

## 인증 시스템
- 이메일 + 비밀번호 (Supabase Auth)
- Google 소셜 로그인 미구현
- 가입 시 닉네임, 생년월일, 국가 추가 입력 필요

## Supabase 스키마
- `profiles`: 사용자 계정 (닉네임, 생년월일, 국가)
- `households`: 가구 단위 (6자리 초대 코드로 멤버 초대)
- `members`: 가족 구성원
- `transactions`: 수입/지출 내역
- `settings`: 사용자별 앱 설정

---

## 주요 컴포넌트
- `src/components/ErrorBoundary.tsx` — 앱 전체를 감싸 흰 화면 방지
- `src/components/SubscriptionProvider.tsx` — 구독 상태 Context 제공
- `src/components/ads/AdBanner.tsx` — 광고 배너. CSS 변수 `--ad-banner-height` 설정
- `src/components/paywall/PaywallSheet.tsx` — 프리미엄 업그레이드 시트
- `src/components/JarIcon.tsx` — `getJarDef(id)` 반드시 `?? JARS[0]` fallback 유지

## Safe Area (iOS)
- 기본 패딩: `src/index.css`의 `.pt-safe` = `env(safe-area-inset-top, 0px)` (헤더 없는 페이지용)
- 헤더 있는 페이지: 헤더에 `style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}` 인라인
- 하단 패딩: `.pb-safe` = `calc(env(safe-area-inset-bottom, 0px) + 6rem + var(--ad-banner-height, 0px))`
- 플로팅 버튼: `bottom: calc(var(--ad-banner-height, 50px) + env(safe-area-inset-bottom, 0px) + 5rem)` (기본값 50px로 배너 로딩 전 가림 방지)
