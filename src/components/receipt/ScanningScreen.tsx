import { ScanLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ScanningScreenProps {
  status: 'scanning' | 'processing';
}

export default function ScanningScreen({ status }: ScanningScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="h-3/5 flex items-center justify-center relative bg-gray-900 overflow-hidden">
        <ScanLine className="w-16 h-16 text-gray-600" />
        <div className="absolute left-0 right-0 h-0.5 bg-teal-400"
          style={{ animation: 'scanLine 2s ease-in-out infinite' }} />
        <style>{`
          @keyframes scanLine {
            0%   { top: 20%; }
            50%  { top: 75%; }
            100% { top: 20%; }
          }
        `}</style>
      </div>

      <div className="h-2/5 bg-white rounded-t-3xl flex flex-col items-center justify-center px-5">
        <p className="text-lg font-semibold text-gray-900 mb-3">
          {status === 'scanning' ? t('receipt.scanning') : t('receipt.processing')}
        </p>
        <div className="flex gap-1 justify-center mb-3">
          {[0, 0.2, 0.4].map(delay => (
            <span key={delay} className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"
              style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>
        <p className="text-xs text-gray-400">{t('receipt.pleaseWait')}</p>
      </div>
    </div>
  );
}
