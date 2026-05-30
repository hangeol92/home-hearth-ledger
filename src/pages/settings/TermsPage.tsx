import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Lang = 'ko' | 'en' | 'ja';

interface SectionData {
  title: string;
  items: string[];
}

interface TermsContent {
  effectiveDate: string;
  sections: SectionData[];
  contact: string;
}

const CONTENT: Record<Lang, TermsContent> = {
  ko: {
    effectiveDate: '시행일: 2025년 1월 1일 · 최종 수정: 2026년 5월 1일',
    contact: '문의: support@fivejars.app',
    sections: [
      {
        title: '제1조 목적',
        items: [
          '이 약관은 Five Onggis(이하 "앱")가 제공하는 가계부 서비스의 이용 조건 및 절차, 이용자와 앱 간의 권리·의무를 규정합니다.',
        ],
      },
      {
        title: '제2조 이용 자격',
        items: [
          '만 14세 이상 누구나 이용할 수 있습니다.',
          '만 14세 미만은 법정대리인의 동의가 필요합니다.',
        ],
      },
      {
        title: '제3조 서비스 내용',
        items: [
          '앱은 다음 서비스를 제공합니다.',
          '· 개인 및 가족 가계부 기록·관리',
          '· 가족 공유 가계부 (초대 코드를 통한 가구 공유)',
          '· 다섯 항아리(Five Onggis) 방식의 수입 자동 배분',
          '· 유료 구독: 클라우드 동기화, CSV 내보내기 등 프리미엄 기능',
          '비회원(게스트)은 기기 내 저장 방식으로 서비스를 이용할 수 있으나, 클라우드 동기화 및 공유 기능은 회원 전용입니다.',
        ],
      },
      {
        title: '제4조 구독 및 결제',
        items: [
          '프리미엄 구독은 월간 및 연간 플랜으로 제공됩니다.',
          '구독은 각 플랫폼(App Store, Google Play)의 결제 시스템을 통해 처리됩니다.',
          '구독은 자동 갱신되며, 갱신 24시간 전까지 취소할 수 있습니다.',
          '취소 후에도 구독 기간 만료일까지 프리미엄 기능을 이용할 수 있습니다.',
          '환불은 각 플랫폼의 환불 정책을 따릅니다.',
        ],
      },
      {
        title: '제5조 이용자 의무',
        items: [
          '이용자는 다음 행위를 해서는 안 됩니다.',
          '· 타인의 계정 무단 접근',
          '· 서비스의 정상적인 운영을 방해하는 행위',
          '· 허위 정보 입력',
          '· 관련 법령 위반',
        ],
      },
      {
        title: '제6조 책임의 한계',
        items: [
          '앱이 제공하는 정보는 가계부 기록을 위한 것이며, 금융·투자·세무 조언이 아닙니다.',
          '이용자 귀책 사유로 인한 데이터 손실에 대해 책임지지 않습니다.',
          '천재지변, 서비스 점검, 외부 서비스 장애로 인한 서비스 중단에 대해 책임을 제한합니다.',
        ],
      },
      {
        title: '제7조 계정 해지 및 데이터 파기',
        items: [
          '이용자는 언제든지 회원 탈퇴를 요청할 수 있습니다.',
          '탈퇴 시 개인정보 및 가계부 데이터는 30일 이내에 파기됩니다.',
          '앱 내 설정 → 데이터 → 모든 데이터 삭제를 통해 즉시 삭제할 수도 있습니다.',
        ],
      },
      {
        title: '제8조 서비스 변경 및 종료',
        items: [
          '서비스 내용 변경 시 30일 전에 앱 내 공지 또는 이메일로 안내합니다.',
          '서비스 종료 시 이용자가 데이터를 내보낼 수 있도록 30일 이상의 유예 기간을 제공합니다.',
        ],
      },
      {
        title: '제9조 분쟁 해결',
        items: [
          '이 약관은 대한민국 법률에 따라 해석됩니다.',
          '서비스 이용 관련 분쟁 발생 시 상호 협의를 통해 해결하며, 합의되지 않을 경우 관할 법원에 제소합니다.',
        ],
      },
    ],
  },

  en: {
    effectiveDate: 'Effective: January 1, 2025 · Last updated: May 1, 2026',
    contact: 'Contact: support@fivejars.app',
    sections: [
      {
        title: 'Article 1 — Purpose',
        items: [
          'These Terms govern the conditions of use and the rights and obligations between Five Onggis ("the App") and its users.',
        ],
      },
      {
        title: 'Article 2 — Eligibility',
        items: [
          'Anyone aged 14 or older may use the App.',
          'Users under 14 require consent from a legal guardian.',
        ],
      },
      {
        title: 'Article 3 — Service Description',
        items: [
          'The App provides the following services:',
          '· Personal and family expense tracking',
          '· Shared household ledger (via invite code)',
          '· Automatic income allocation using the Five Onggis method',
          '· Premium subscription: cloud sync, CSV export, and more',
          'Guest users may use the App with on-device storage. Cloud sync and sharing require an account.',
        ],
      },
      {
        title: 'Article 4 — Subscription and Payment',
        items: [
          'Premium subscriptions are available as monthly or annual plans.',
          'Payments are processed through the platform\'s billing system (App Store or Google Play).',
          'Subscriptions auto-renew. You may cancel up to 24 hours before the renewal date.',
          'After cancellation, premium features remain available until the end of the billing period.',
          'Refunds follow each platform\'s refund policy.',
        ],
      },
      {
        title: 'Article 5 — User Obligations',
        items: [
          'Users must not:',
          '· Access another user\'s account without authorization',
          '· Interfere with the normal operation of the service',
          '· Provide false information',
          '· Violate applicable laws',
        ],
      },
      {
        title: 'Article 6 — Limitation of Liability',
        items: [
          'The App is a personal finance tracking tool and does not constitute financial, investment, or tax advice.',
          'The App is not liable for data loss caused by user actions.',
          'Liability is limited for service interruptions due to force majeure, maintenance, or third-party service failures.',
        ],
      },
      {
        title: 'Article 7 — Account Termination and Data Deletion',
        items: [
          'You may request account deletion at any time.',
          'Your personal data and ledger data will be deleted within 30 days of the request.',
          'You may also delete data immediately via Settings → Data → Delete All Data.',
        ],
      },
      {
        title: 'Article 8 — Service Changes and Termination',
        items: [
          'We will notify users of material service changes at least 30 days in advance via in-app notice or email.',
          'If the service is discontinued, users will be given at least 30 days to export their data.',
        ],
      },
      {
        title: 'Article 9 — Governing Law and Disputes',
        items: [
          'These Terms are governed by the laws of the Republic of Korea.',
          'Disputes will be resolved through mutual agreement. If unresolved, they will be submitted to the competent court.',
        ],
      },
    ],
  },

  ja: {
    effectiveDate: '施行日：2025年1月1日 · 最終更新：2026年5月1日',
    contact: 'お問い合わせ: support@fivejars.app',
    sections: [
      {
        title: '第1条 目的',
        items: [
          'この利用規約は、Five Onggis（以下「本アプリ」）が提供する家計簿サービスの利用条件および手続き、ユーザーと本アプリ間の権利・義務を定めるものです。',
        ],
      },
      {
        title: '第2条 利用資格',
        items: [
          '14歳以上であればどなたでもご利用いただけます。',
          '14歳未満の方は、法定代理人の同意が必要です。',
        ],
      },
      {
        title: '第3条 サービス内容',
        items: [
          '本アプリは以下のサービスを提供します。',
          '· 個人・家族の家計管理',
          '· 家族共有家計簿（招待コードによる世帯共有）',
          '· Five Onggis方式による収入の自動振り分け',
          '· プレミアムサブスクリプション：クラウド同期、CSVエクスポートなど',
          'ゲストユーザーは端末内保存でご利用いただけますが、クラウド同期・共有機能はアカウント登録が必要です。',
        ],
      },
      {
        title: '第4条 サブスクリプションと決済',
        items: [
          'プレミアムサブスクリプションは月額・年額プランをご用意しています。',
          '決済は各プラットフォーム（App Store・Google Play）の決済システムを通じて行われます。',
          'サブスクリプションは自動更新されます。更新の24時間前までにキャンセルできます。',
          'キャンセル後も、購読期間の終了日までプレミアム機能をご利用いただけます。',
          '返金は各プラットフォームの返金ポリシーに従います。',
        ],
      },
      {
        title: '第5条 ユーザーの義務',
        items: [
          '以下の行為を禁止します。',
          '· 他のユーザーのアカウントへの不正アクセス',
          '· サービスの正常な運営を妨害する行為',
          '· 虚偽情報の入力',
          '· 関連法令の違反',
        ],
      },
      {
        title: '第6条 責任の制限',
        items: [
          '本アプリが提供する情報は家計の記録を目的としており、金融・投資・税務上のアドバイスではありません。',
          'ユーザーの責に帰すべき事由によるデータ損失については責任を負いません。',
          '天災、サービスメンテナンス、外部サービスの障害によるサービス中断について責任を制限します。',
        ],
      },
      {
        title: '第7条 アカウント解約とデータ削除',
        items: [
          'いつでも退会をリクエストできます。',
          '退会後30日以内に個人情報および家計簿データを削除します。',
          '設定 → データ → 全データ削除 から即時削除することも可能です。',
        ],
      },
      {
        title: '第8条 サービスの変更・終了',
        items: [
          'サービス内容の重要な変更は、30日前までにアプリ内通知またはメールでお知らせします。',
          'サービス終了の際は、データのエクスポートができるよう30日以上の猶予期間を設けます。',
        ],
      },
      {
        title: '第9条 準拠法と紛争解決',
        items: [
          'この規約は大韓民国の法律に準拠して解釈されます。',
          'サービスに関する紛争は相互協議により解決し、合意できない場合は管轄裁判所に提起します。',
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

export default function TermsPage() {
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
        <h1 className="text-base font-semibold">{t('legal.termsTitle')}</h1>
      </div>

      <div className="px-5 py-6 pb-safe max-w-prose">
        <p className="text-xs text-muted-foreground mb-6">{content.effectiveDate}</p>
        {content.sections.map((section) => (
          <Section key={section.title} {...section} />
        ))}
        <p className="text-xs text-muted-foreground mt-8">{content.contact}</p>
      </div>
    </div>
  );
}
