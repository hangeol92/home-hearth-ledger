import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginScreen from '@/components/auth/LoginScreen';
import EmailVerifyScreen from '@/components/auth/EmailVerifyScreen';

type AuthState = 'login' | 'verify' | 'success';

export default function LoginPage() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>('login');
  const [verifyEmail, setVerifyEmail] = useState('');

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleVerified = () => {
    navigate('/');
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
