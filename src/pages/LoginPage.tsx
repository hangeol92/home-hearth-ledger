import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginScreen from '@/components/auth/LoginScreen';
import EmailVerifyScreen from '@/components/auth/EmailVerifyScreen';

type AuthState = 'login' | 'verify' | 'success';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';

  const [authState, setAuthState] = useState<AuthState>('login');
  const [verifyEmail, setVerifyEmail] = useState('');

  const handleLoginSuccess = () => {
    navigate(redirect);
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleVerified = () => {
    navigate(redirect);
  };

  const handleResend = () => {
    // API call to resend verification email would go here
  };

  return (
    <>
      {authState === 'login' && (
        <LoginScreen onSuccess={handleLoginSuccess} onSignUp={handleSignUp} />
      )}
      {authState === 'verify' && (
        <EmailVerifyScreen email={verifyEmail} onVerified={handleVerified} onResend={handleResend} />
      )}
    </>
  );
}
