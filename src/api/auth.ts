import { supabase } from '@/lib/supabase';

export interface SignUpProfile {
  nickname: string;
  birth_date: string;
  country: string;
}

export async function signUp(email: string, password: string, profile: SignUpProfile): Promise<void> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('User creation failed');

  await supabase.from('profiles').insert({
    id: data.user.id,
    nickname: profile.nickname,
    birth_date: profile.birth_date,
    country: profile.country,
  });
}

export async function signIn(email: string, password: string): Promise<void> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Block unverified users
  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    throw new Error('EMAIL_NOT_VERIFIED');
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
}
