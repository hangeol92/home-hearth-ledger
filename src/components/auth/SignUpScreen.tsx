import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { signUp } from '@/api/auth';

type Step = 1 | 2;

interface SignUpScreenProps {
  onSuccess: (email: string) => void;
}

export default function SignUpScreen({ onSuccess }: SignUpScreenProps) {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('KR');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isStep1Valid = validateEmail(email) && password.length >= 8;
  const isStep2Valid = nickname.trim().length > 0 && birthDate.length > 0;

  const handleStep1 = async () => {
    if (!isStep1Valid) {
      toast({ title: 'Please check email and password (min 8 chars)', variant: 'destructive' });
      return;
    }
    setStep(2);
  };

  const handleStep2 = async () => {
    if (!isStep2Valid) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, { nickname, birth_date: birthDate, country });
      onSuccess(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      toast({ title: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white px-6 pb-safe pt-safe">
      <div className="w-full max-w-sm">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
              <p className="mt-2 text-sm text-gray-600">Create your account</p>
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
                {email && !validateEmail(email) && (
                  <p className="text-xs text-red-500">Please enter a valid email</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
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
                {password && password.length < 8 && (
                  <p className="text-xs text-red-500">At least 8 characters required</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleStep1}
              disabled={!isStep1Valid}
              className="w-full rounded-xl h-12 bg-black text-white font-medium"
            >
              Next
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Profile Info</h1>
              <p className="mt-2 text-sm text-gray-600">Complete your profile</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nickname</label>
                <Input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value.slice(0, 20))}
                  placeholder="Your name"
                  maxLength={20}
                  className="w-full border-b border-gray-300 rounded-none border-t-0 border-l-0 border-r-0 bg-transparent px-0 py-2 text-base focus:border-black focus:ring-0"
                />
                <p className="text-xs text-gray-500">{nickname.length}/20</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full border-b border-gray-300 rounded-none border-t-0 border-l-0 border-r-0 bg-transparent px-0 py-2 text-base focus:border-black focus:ring-0"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full border-b border-gray-300 rounded-none border-t-0 border-l-0 border-r-0 bg-transparent px-0 py-2 text-base focus:border-black focus:ring-0"
                >
                  <option value="KR">South Korea</option>
                  <option value="JP">Japan</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleStep2}
                disabled={!isStep2Valid || isLoading}
                className="w-full rounded-xl h-12 bg-black text-white font-medium"
              >
                {isLoading ? 'Creating...' : 'Complete'}
              </Button>
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="w-full rounded-xl h-12"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
