import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface AdminStats {
  total_users: number;
  active_subscriptions: number;
  new_users_7d: number;
  total_households: number;
  total_transactions: number;
  monthly_subscriptions: number;
  annual_subscriptions: number;
}

interface AdminUser {
  id: string;
  display_name: string | null;
  created_at: string;
  household_id: string | null;
  sub_status: string | null;
  sub_plan: string | null;
  sub_expires_at: string | null;
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login?redirect=/admin'); return; }
    load();
  }, [user, authLoading]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        supabase.rpc('get_admin_stats'),
        supabase.rpc('get_admin_users', { p_limit: 30 }),
      ]);
      if (statsRes.error) throw statsRes.error;
      if (usersRes.error) throw usersRes.error;
      setStats(statsRes.data as AdminStats);
      setUsers(usersRes.data as AdminUser[]);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message :
        (e as { message?: string })?.message ?? String(e);
      setError(msg.includes('Unauthorized') ? '관리자 권한이 없습니다.' : `오류: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6">
        <p className="text-destructive text-sm font-medium">{error}</p>
        <button onClick={() => navigate(-1)} className="text-xs text-muted-foreground underline">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-5 py-3 flex items-center justify-between z-10">
        <div>
          <h1 className="text-base font-bold">Admin</h1>
          <p className="text-[11px] text-muted-foreground">{user?.email}</p>
        </div>
        <button onClick={load} className="text-xs text-primary font-medium px-3 py-1.5 rounded-lg active:bg-secondary">
          새로고침
        </button>
      </div>

      <div className="px-4 pt-5 space-y-6">
        {/* Stats grid */}
        {stats && (
          <>
            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">사용자</p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="전체 유저" value={stats.total_users} />
                <StatCard label="최근 7일 신규" value={stats.new_users_7d} />
                <StatCard label="활성 가구" value={stats.total_households} />
                <StatCard label="총 거래 수" value={stats.total_transactions} />
              </div>
            </section>

            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">구독</p>
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="전체 활성" value={stats.active_subscriptions} />
                <StatCard label="월간" value={stats.monthly_subscriptions} />
                <StatCard label="연간" value={stats.annual_subscriptions} />
              </div>
            </section>
          </>
        )}

        {/* Recent users table */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            최근 가입 유저 (최대 30명)
          </p>
          <div className="rounded-xl border border-border overflow-hidden">
            {users.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 px-4 py-3 text-sm ${i < users.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{u.display_name ?? '—'}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString('ko-KR')}
                    {u.household_id ? ' · 가구 있음' : ''}
                  </p>
                </div>
                {u.sub_status && (
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    u.sub_status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {u.sub_plan ?? u.sub_status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
