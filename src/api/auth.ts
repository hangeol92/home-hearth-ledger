import { supabase } from '@/lib/supabase';

export interface SignUpProfile {
  nickname: string;
  birth_date: string;
  country: string;
}

export async function signUp(email: string, password: string, profile: SignUpProfile): Promise<void> {
  // 프로필 행은 auth.users 트리거(handle_new_user)가 생성.
  // 이메일 확인이 켜져 있으면 signUp 직후 세션이 없어
  // 클라이언트 insert는 RLS에 막히므로 메타데이터로 전달한다.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname: profile.nickname,
        birth_date: profile.birth_date,
        country: profile.country,
      },
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error('User creation failed');
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
