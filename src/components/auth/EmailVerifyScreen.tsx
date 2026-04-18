import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailVerifyScreenProps {
  email: string;
  onVerified: () => void;
  onResend: () => void;
}

export default function EmailVerifyScreen({ email, onVerified, onResend }: EmailVerifyScreenProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white px-6 pb-safe pt-safe">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Mail className="h-10 w-10 text-gray-600" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Check Your Email</h1>
            <p className="text-sm text-gray-600">We sent a verification link to</p>
            <p className="text-sm font-medium text-gray-700">{email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onVerified}
            className="w-full rounded-xl h-12 bg-black text-white font-medium"
          >
            Verified
          </Button>
          <button
            onClick={onResend}
            className="w-full text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            Resend verification email
          </button>
        </div>
      </div>
    </div>
  );
}
