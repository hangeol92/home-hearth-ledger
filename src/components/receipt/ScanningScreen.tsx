import { ScanLine } from 'lucide-react';

export interface ScanningScreenProps {
  status: 'scanning' | 'processing';
}

export default function ScanningScreen({ status }: ScanningScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="h-3/5 flex items-center justify-center relative bg-gray-900">
        <ScanLine className="w-16 h-16 text-gray-600" />
        <div
          className="absolute top-1/3 left-0 right-0 h-0.5 bg-teal-400"
          style={{
            animation: 'scanLine 2s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes scanLine {
            0% {
              top: 20%;
            }
            50% {
              top: 60%;
            }
            100% {
              top: 20%;
            }
          }
        `}</style>
      </div>

      <div className="h-2/5 bg-white rounded-t-3xl flex flex-col items-center justify-center px-5">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-3">
            {status === 'scanning' ? '카메라를 열고 있어요...' : '영수증을 읽고 있어요...'}
          </p>
          <div className="flex gap-1 justify-center mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-xs text-gray-400">잠시만 기다려 주세요</p>
        </div>
      </div>
    </div>
  );
}
