import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
      if (sessionError || !session) {
        navigate('/login');
        return;
      }

      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id, household_id')
          .eq('id', session.user.id)
          .single();

        if (!existing) {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: session.user.id,
            display_name: session.user.user_metadata?.full_name ?? '',
            avatar_url: session.user.user_metadata?.avatar_url ?? '',
          });
          if (insertError) throw insertError;
          navigate('/household/setup');
        } else if (!existing.household_id) {
          navigate('/household/setup');
        } else {
          navigate('/');
        }
      } catch {
        navigate('/login');
      }
    });
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Signing in...</p>
    </div>
  );
}
