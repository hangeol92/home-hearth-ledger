import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 px-4 py-2 flex items-center justify-center gap-2 border-b border-amber-200 pt-safe">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <span className="text-xs font-medium text-amber-700">
        You're offline
      </span>
    </div>
  );
}
