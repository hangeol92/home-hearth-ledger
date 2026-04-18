import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpScreen from '@/components/auth/SignUpScreen';
import EmailVerifyScreen from '@/components/auth/EmailVerifyScreen';
import { resendVerificationEmail } from '@/api/auth';

type SignUpState = 'form' | 'verify' | 'success';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [signUpState, setSignUpState] = useState<SignUpState>('form');
  const [email, setEmail] = useState('');

  const handleSignUpSuccess = (userEmail: string) => {
    setEmail(userEmail);
    setSignUpState('verify');
  };

  const handleVerified = () => {
    navigate('/');
  };

  const handleResend = async () => {
    if (email) await resendVerificationEmail(email);
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <>
      {signUpState === 'form' && (
        <SignUpScreen onSuccess={handleSignUpSuccess} />
      )}
      {signUpState === 'verify' && (
        <EmailVerifyScreen email={email} onVerified={handleVerified} onResend={handleResend} />
      )}
    </>
  );
}
