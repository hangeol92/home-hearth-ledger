import { ShieldAlert } from 'lucide-react';

export interface PermissionGuideProps {
  onClose: () => void;
}

export default function PermissionGuide({ onClose }: PermissionGuideProps) {
  const handleOpenSettings = () => {
    // For native apps, this would open system settings
    // For web, just close the sheet
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-white rounded-t-3xl px-5 py-8"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}
      >
        <div className="flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-amber-500 mb-4" />
          <h2 className="font-bold text-gray-900 text-center mb-3">카메라 권한이 필요해요</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            영수증 스캔을 위해 카메라와 사진 라이브러리 접근 권한이 필요합니다.
            <br />
            설정 앱에서 권한을 허용해 주세요.
          </p>

          <button
            onClick={handleOpenSettings}
            className="w-full h-12 rounded-xl bg-gray-900 text-white font-semibold mb-3"
          >
            설정에서 허용하기
          </button>

          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl border border-gray-200 text-gray-600 font-semibold"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
