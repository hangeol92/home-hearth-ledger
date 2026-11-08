import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Self-service account deletion. The caller's identity comes only from their
// own Supabase session JWT (verified via auth.getUser) — never trusted from
// the request body — then the service role performs the actual deletion.
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(jwt);
  if (userError || !userData.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = userData.user.id;

  // Service role bypasses RLS — safe only inside this Edge Function (server-side)
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: profile } = await admin
    .from('profiles')
    .select('household_id')
    .eq('id', userId)
    .single();

  // If this user is the household's only member, delete the household too —
  // it cascades to transactions/budgets/jars/members. Otherwise leave the
  // shared household data intact for the remaining members.
  if (profile?.household_id) {
    const { count } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', profile.household_id);
    if (count === 1) {
      await admin.from('households').delete().eq('id', profile.household_id);
    }
  }

  // Deleting the auth user cascades to profiles + subscriptions (ON DELETE CASCADE)
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error('[delete-account] failed:', deleteError.message);
    return new Response('Internal Server Error', { status: 500 });
  }

  return new Response('OK', { status: 200 });
});
