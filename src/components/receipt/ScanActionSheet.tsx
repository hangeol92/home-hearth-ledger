import { Camera, Image, PenLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ScanActionSheetProps {
  onCamera: () => void;
  onGallery: () => void;
  onManual: () => void;
  onClose: () => void;
}

export default function ScanActionSheet({ onCamera, onGallery, onManual, onClose }: ScanActionSheetProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl px-5 pt-5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <button onClick={onCamera} className="flex items-center gap-4 w-full py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-900">{t('receipt.camera')}</div>
            <div className="text-sm text-gray-500">{t('receipt.cameraDesc')}</div>
          </div>
        </button>

        <button onClick={onGallery} className="flex items-center gap-4 w-full py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Image className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-900">{t('receipt.gallery')}</div>
            <div className="text-sm text-gray-500">{t('receipt.galleryDesc')}</div>
          </div>
        </button>

        <button onClick={onManual} className="flex items-center gap-4 w-full py-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <PenLine className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-900">{t('receipt.manual')}</div>
            <div className="text-sm text-gray-500">{t('receipt.manualDesc')}</div>
          </div>
        </button>

        <button onClick={onClose}
          className="w-full h-12 rounded-xl border border-gray-200 text-gray-600 font-semibold">
          {t('receipt.cancel')}
        </button>
      </div>
    </div>
  );
}
