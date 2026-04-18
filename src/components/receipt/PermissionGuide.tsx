import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface PermissionGuideProps {
  onClose: () => void;
}

export default function PermissionGuide({ onClose }: PermissionGuideProps) {
  const { t } = useTranslation();

  const handleOpenSettings = () => {
    const cap = (window as Window & { Capacitor?: { Plugins?: { App?: { openUrl?: (o: object) => void } } } }).Capacitor;
    if (cap?.Plugins?.App?.openUrl) {
      cap.Plugins.App.openUrl({ url: 'app-settings:' });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl px-5 py-8"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}>
        <div className="flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-amber-500 mb-4" />
          <h2 className="font-bold text-gray-900 text-center mb-3">{t('receipt.permissionTitle')}</h2>
          <p className="text-sm text-gray-500 text-center mb-6 whitespace-pre-line">
            {t('receipt.permissionDesc')}
          </p>
          <button onClick={handleOpenSettings}
            className="w-full h-12 rounded-xl bg-gray-900 text-white font-semibold mb-3">
            {t('receipt.openSettings')}
          </button>
          <button onClick={onClose}
            className="w-full h-12 rounded-xl border border-gray-200 text-gray-600 font-semibold">
            {t('receipt.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
