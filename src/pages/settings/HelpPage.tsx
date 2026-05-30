import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const FAQ = [
  {
    q: '데이터는 어디에 저장되나요?',
    a: '로그인 없이 사용하면 기기 내 저장소(IndexedDB)에만 저장됩니다. 회원가입 후 로그인하면 클라우드에 자동 동기화됩니다.',
  },
  {
    q: '5개 항아리는 무엇인가요?',
    a: '수입을 기부·투자·저축·생활·씨앗 5개로 나눠 관리하는 시스템입니다. 설정에서 각 항아리의 배분 비율을 조정할 수 있습니다.',
  },
  {
    q: '거래는 어떻게 추가하나요?',
    a: '+버튼을 눌러 수동 입력하거나, 영수증 촬영으로 자동 입력할 수 있습니다.',
  },
  {
    q: '가족과 공유하려면 어떻게 하나요?',
    a: '로그인 후 설정 → 공유 가계부에서 초대 코드를 공유하면 가족이 같은 가계부를 함께 사용할 수 있습니다. (프리미엄 기능)',
  },
  {
    q: '구독을 해지하려면 어떻게 하나요?',
    a: 'iOS: 설정 → Apple ID → 구독에서 해지할 수 있습니다. 웹: 설정 → 구독 관리에서 해지할 수 있습니다.',
  },
];

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center gap-2 px-3 pb-4 pt-2">
        <button onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-lg active:bg-secondary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">도움말</h1>
      </div>

      <div className="px-5 space-y-3 pb-safe">
        {FAQ.map((item, i) => (
          <div key={i} className="rounded-xl bg-card shadow-sm p-4">
            <p className="text-sm font-semibold mb-1.5">Q. {item.q}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
          </div>
        ))}

        <div className="rounded-xl bg-card shadow-sm p-4">
          <p className="text-sm font-semibold mb-1.5">추가 문의</p>
          <p className="text-sm text-muted-foreground">
            해결되지 않은 문제가 있으시면{' '}
            <button
              onClick={() => window.open('mailto:support@fivejars.app?subject=Five Onggis 문의', '_blank')}
              className="text-primary font-medium underline underline-offset-2"
            >
              support@fivejars.app
            </button>
            으로 문의해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
