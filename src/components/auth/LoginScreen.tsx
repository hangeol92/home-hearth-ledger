import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { signIn } from '@/api/auth';

interface LoginScreenProps {
  onSuccess: () => void;
  onSignUp: () => void;
}

export default function LoginScreen({ onSuccess, onSignUp }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValid = validateEmail(email) && password.length > 0;

  const handleLogin = async () => {
    if (!isValid) {
      toast({ title: 'Please enter valid email and password', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
      (document.activeElement as HTMLElement)?.blur();
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message === 'EMAIL_NOT_VERIFIED') {
        toast({ title: 'Please verify your email before signing in.', variant: 'destructive' });
      } else {
        toast({ title: message, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white px-6 pb-safe pt-safe">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg mx-auto">
            <span className="text-2xl font-bold text-white">H</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Home Hearth</h1>
          <p className="mt-2 text-sm text-gray-600">Family finance tracker</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border-b border-gray-300 rounded-none border-t-0 border-l-0 border-r-0 bg-transparent px-0 py-2 text-base focus:border-black focus:ring-0"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border-b border-gray-300 rounded-none border-t-0 border-l-0 border-r-0 bg-transparent px-0 py-2 text-base focus:border-black focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-2 text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <Button
          onClick={handleLogin}
          disabled={!isValid || isLoading}
          className="w-full rounded-xl h-12 bg-black text-white font-medium"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="flex gap-2 text-sm justify-center">
          <button
            onClick={onSignUp}
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            Sign Up
          </button>
          <span className="text-gray-400">•</span>
          <button className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
