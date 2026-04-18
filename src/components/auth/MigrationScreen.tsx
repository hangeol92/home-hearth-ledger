import { Check } from 'lucide-react';

interface MigrationScreenProps {
  progress: number;
  isComplete: boolean;
}

export default function MigrationScreen({ progress, isComplete }: MigrationScreenProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white px-6 pb-safe pt-safe">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-6">
          {isComplete ? (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Complete!</h1>
                <p className="text-sm text-gray-600">Your data has been securely migrated</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <div className="relative h-12 w-12">
                  <svg className="h-full w-full" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                    <circle
                      cx="25"
                      cy="25"
                      r="20"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                      strokeDasharray={`${(progress / 100) * 125.6} 125.6`}
                      strokeLinecap="round"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Migrating Data</h1>
                <p className="text-sm text-gray-600">Please wait while we transfer your data</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
