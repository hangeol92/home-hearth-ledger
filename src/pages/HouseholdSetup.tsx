import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createHousehold, joinByInviteCode } from '@/api/households';
import { Copy, Check, ArrowLeft } from 'lucide-react';

export default function HouseholdSetup() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choose' | 'create' | 'join' | 'created'>('choose');
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const household = await createHousehold(name.trim());
      setInviteCode(household.invite_code);
      setMode('created');
    } catch (e) {
      setError(e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'Failed to create household');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      await joinByInviteCode(code.trim().toUpperCase());
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (codeToCopy: string) => {
    await navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-white px-6 pb-safe pt-safe">
      <div className="w-full max-w-xs">
        {/* Header */}
        {mode !== 'choose' && mode !== 'created' && (
          <button
            onClick={() => setMode('choose')}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'choose' && 'Household Setup'}
          {mode === 'create' && 'Create Household'}
          {mode === 'join' && 'Join Household'}
          {mode === 'created' && 'Household Created!'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {mode === 'choose' && 'Create a new household or join an existing one'}
          {mode === 'create' && 'Give your household a name'}
          {mode === 'join' && 'Enter the 6-letter invite code'}
          {mode === 'created' && 'Share this invite code with your family members'}
        </p>
      </div>

      {mode === 'choose' && (
        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            onClick={() => setMode('create')}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-emerald-600 active:scale-95"
          >
            Create a new household
          </button>
          <button
            onClick={() => setMode('join')}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-900 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
          >
            Join with invite code
          </button>
        </div>
      )}

      {mode === 'create' && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Household Name
            </label>
            <Input
              placeholder="e.g. My Family"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-12 rounded-lg border-gray-300 text-base"
              autoFocus
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-emerald-600 disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Creating...' : 'Create Household'}
          </button>
        </div>
      )}

      {mode === 'created' && (
        <div className="w-full max-w-xs flex flex-col gap-4 items-center">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 px-8 py-8 text-center w-full shadow-sm">
            <p className="text-xs text-emerald-600 font-medium mb-3 uppercase tracking-widest">Invite Code</p>
            <p className="text-5xl font-mono font-bold tracking-widest text-emerald-700 mb-2">{inviteCode}</p>
            <p className="text-xs text-emerald-600">Share with family members</p>
          </div>
          <button
            onClick={() => handleCopyCode(inviteCode)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-900 shadow-sm transition-all hover:bg-gray-50 active:scale-95 w-full justify-center"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-emerald-600 active:scale-95 w-full"
          >
            Get Started
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Code
            </label>
            <Input
              placeholder="AB12CD"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="h-12 rounded-lg border-gray-300 text-base font-mono text-center text-xl tracking-widest"
              autoFocus
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            onClick={handleJoin}
            disabled={loading || !code.trim()}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-emerald-600 disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Joining...' : 'Join Household'}
          </button>
        </div>
      )}
    </div>
  );
}
