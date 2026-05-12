import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Lang = 'ko' | 'en' | 'ja';

interface SectionData {
  title: string;
  items: string[];
}

interface PrivacyContent {
  effectiveDate: string;
  sections: SectionData[];
}

const CONTENT: Record<Lang, PrivacyContent> = {
  ko: {
    effectiveDate: '시행일: 2025년 1월 1일 · 최종 수정: 2026년 5월 1일',
    sections: [
      {
        title: '1. 개인정보처리자',
        items: [
          'Five Jars(이하 "앱")는 개인 개발자가 운영하는 가계부 서비스입니다.',
          '문의: support@fivejars.app',
        ],
      },
      {
        title: '2. 수집하는 개인정보',
        items: [
          '■ 필수 수집 항목',
          '· 이메일 주소 (회원가입 시)',
          '· 닉네임, 생년월일, 국가 (회원가입 시)',
          '■ 서비스 이용 중 생성되는 정보',
          '· 가계부 데이터: 거래 날짜, 금액, 카테고리, 메모',
          '· 가구 정보: 가구 이름, 구성원 이름 및 색상',
          '· 구독 정보: 구독 상태, 만료일, 결제 플랫폼',
          '■ 수집하지 않는 정보',
          '· 위치 정보, 연락처, 금융 계좌 정보, 주민등록번호',
        ],
      },
      {
        title: '3. 수집 목적',
        items: [
          '· 회원 계정 생성 및 관리',
          '· 가계부 데이터 클라우드 동기화',
          '· 가족 공유 가계부 기능 제공',
          '· 구독 상태 확인 및 유료 기능 제공',
        ],
      },
      {
        title: '4. 개인정보 보유 및 파기',
        items: [
          '회원 탈퇴 요청 시 30일 이내에 모든 개인정보를 파기합니다.',
          '앱 내 설정 → 데이터 → 모든 데이터 삭제를 통해 즉시 삭제할 수 있습니다.',
          '관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관 후 파기합니다.',
          '· 전자상거래 거래 기록: 5년 (전자상거래법)',
        ],
      },
      {
        title: '5. 개인정보의 제3자 제공',
        items: [
          '이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 서비스 제공을 위해 다음 업체에 위탁합니다.',
          '· Supabase Inc. (미국) — 데이터베이스 저장 및 인증',
          '· RevenueCat Inc. (미국) — 구독 및 결제 관리',
          '위탁 업체는 위탁 목적 이외의 용도로 개인정보를 처리하지 않습니다.',
        ],
      },
      {
        title: '6. 이용자 권리',
        items: [
          '이용자는 언제든지 다음 권리를 행사할 수 있습니다.',
          '· 개인정보 열람 요청',
          '· 오류 정정 요청',
          '· 삭제 요청 (탈퇴 또는 앱 내 삭제 기능)',
          '· 처리 정지 요청',
          '권리 행사는 support@fivejars.app으로 이메일 요청해 주세요.',
        ],
      },
      {
        title: '7. 개인정보 안전성 확보',
        items: [
          '· 통신 구간 암호화 (HTTPS/TLS)',
          '· 비밀번호 단방향 해시 처리',
          '· 행 수준 보안(RLS)으로 타인의 데이터 접근 차단',
          '· 결제 정보는 앱 서버에 저장하지 않음',
        ],
      },
      {
        title: '8. 개인정보보호 책임자',
        items: [
          '개인정보보호 관련 문의, 불만 처리에 관한 사항은 아래로 연락해 주세요.',
          '이메일: support@fivejars.app',
        ],
      },
      {
        title: '9. 개인정보처리방침 변경',
        items: [
          '개인정보처리방침 변경 시 앱 내 공지 또는 이메일로 사전 안내합니다.',
        ],
      },
    ],
  },

  en: {
    effectiveDate: 'Effective: January 1, 2025 · Last updated: May 1, 2026',
    sections: [
      {
        title: '1. Data Controller',
        items: [
          'Five Jars ("the App") is a personal finance service operated by an independent developer.',
          'Contact: support@fivejars.app',
        ],
      },
      {
        title: '2. Data We Collect',
        items: [
          '■ Required at sign-up',
          '· Email address',
          '· Display name, date of birth, country',
          '■ Generated during use',
          '· Ledger data: transaction dates, amounts, categories, notes',
          '· Household info: household name, member names and colors',
          '· Subscription info: status, expiry date, payment platform',
          '■ Data we do NOT collect',
          '· Location, contacts, bank account details, government ID numbers',
        ],
      },
      {
        title: '3. Purpose of Collection',
        items: [
          '· Creating and managing your account',
          '· Cloud sync of your ledger data',
          '· Shared household ledger feature',
          '· Verifying subscription status and enabling premium features',
        ],
      },
      {
        title: '4. Retention and Deletion',
        items: [
          'All personal data is deleted within 30 days of an account deletion request.',
          'You can delete your data immediately via Settings → Data → Delete All Data.',
          'Where required by law, certain records may be retained for the mandated period before deletion.',
          '· E-commerce transaction records: 5 years',
        ],
      },
      {
        title: '5. Third-Party Processors',
        items: [
          'We do not sell or share your data with third parties. We use the following processors solely to deliver the service:',
          '· Supabase Inc. (USA) — database storage and authentication',
          '· RevenueCat Inc. (USA) — subscription and payment management',
          'These processors may only use your data for the stated purpose.',
        ],
      },
      {
        title: '6. Your Rights',
        items: [
          'You may exercise the following rights at any time:',
          '· Access your personal data',
          '· Request correction of inaccurate data',
          '· Request deletion (account deletion or in-app delete)',
          '· Request restriction of processing',
          'To exercise these rights, email support@fivejars.app.',
        ],
      },
      {
        title: '7. Data Security',
        items: [
          '· All data in transit is encrypted (HTTPS/TLS)',
          '· Passwords are stored as one-way hashes',
          '· Row-Level Security (RLS) prevents access to other users\' data',
          '· Payment information is never stored on our servers',
        ],
      },
      {
        title: '8. Privacy Contact',
        items: [
          'For privacy-related inquiries or complaints, contact:',
          'Email: support@fivejars.app',
        ],
      },
      {
        title: '9. Changes to This Policy',
        items: [
          'We will notify you of material changes via in-app notice or email before they take effect.',
        ],
      },
    ],
  },

  ja: {
    effectiveDate: '施行日：2025年1月1日 · 最終更新：2026年5月1日',
    sections: [
      {
        title: '1. 個人情報取扱事業者',
        items: [
          'Five Jars（以下「本アプリ」）は、個人開発者が運営する家計簿サービスです。',
          'お問い合わせ: support@fivejars.app',
        ],
      },
      {
        title: '2. 収集する個人情報',
        items: [
          '■ 登録時の必須項目',
          '· メールアドレス',
          '· 表示名、生年月日、国',
          '■ サービス利用中に生成される情報',
          '· 家計簿データ：取引日、金額、カテゴリ、メモ',
          '· 世帯情報：世帯名、メンバー名・カラー',
          '· サブスクリプション情報：ステータス、有効期限、決済プラットフォーム',
          '■ 収集しない情報',
          '· 位置情報、連絡先、金融口座情報、マイナンバー等',
        ],
      },
      {
        title: '3. 収集目的',
        items: [
          '· アカウントの作成・管理',
          '· 家計簿データのクラウド同期',
          '· 家族共有家計簿機能の提供',
          '· サブスクリプション確認およびプレミアム機能の提供',
        ],
      },
      {
        title: '4. 保管期間および削除',
        items: [
          '退会申請後30日以内に全ての個人情報を削除します。',
          '設定 → データ → 全データ削除 から即時削除することも可能です。',
          '法令により保存が義務付けられている場合は、所定期間保管後に削除します。',
          '· 電子商取引の記録：5年',
        ],
      },
      {
        title: '5. 第三者提供',
        items: [
          'ご同意なく個人情報を第三者へ提供することはありません。サービス提供のために以下の業者に委託しています。',
          '· Supabase Inc.（米国）— データベース保管・認証',
          '· RevenueCat Inc.（米国）— サブスクリプション・決済管理',
          '委託先は委託目的以外に個人情報を利用しません。',
        ],
      },
      {
        title: '6. ユーザーの権利',
        items: [
          'いつでも以下の権利を行使できます。',
          '· 個人情報の開示請求',
          '· 誤りの訂正請求',
          '· 削除請求（退会またはアプリ内削除機能）',
          '· 処理の停止請求',
          '権利の行使は support@fivejars.app までご連絡ください。',
        ],
      },
      {
        title: '7. 安全管理措置',
        items: [
          '· 通信経路の暗号化（HTTPS/TLS）',
          '· パスワードの一方向ハッシュ処理',
          '· 行レベルセキュリティ（RLS）による他ユーザーのデータアクセス遮断',
          '· 決済情報はアプリサーバーに保存しない',
        ],
      },
      {
        title: '8. 個人情報保護責任者',
        items: [
          '個人情報に関するお問い合わせ・苦情は下記までご連絡ください。',
          'メール: support@fivejars.app',
        ],
      },
      {
        title: '9. プライバシーポリシーの変更',
        items: [
          'ポリシーに重要な変更がある場合は、施行前にアプリ内通知またはメールでお知らせします。',
        ],
      },
    ],
  },
};

function Section({ title, items }: SectionData) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-foreground mb-2">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
        {items.map((item, i) => (
          <p key={i}>{item}</p>
        ))}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const lang: Lang = i18n.language.startsWith('ja') ? 'ja' : i18n.language.startsWith('ko') ? 'ko' : 'en';
  const content = CONTENT[lang];

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">{t('legal.privacyTitle')}</h1>
      </div>

      <div className="px-5 py-6 pb-safe max-w-prose">
        <p className="text-xs text-muted-foreground mb-6">{content.effectiveDate}</p>
        {content.sections.map((section) => (
          <Section key={section.title} {...section} />
        ))}
      </div>
    </div>
  );
}
