import { supabase } from '@/lib/supabase';

export interface AgeBracketJarStat {
  jar: string;
  avg_allocation_pct: number;
  household_count: number;
}

// 동년대(10살 단위) 평균 항아리 배분 비율. 표본이 20가구 미만인 연령대는
// 서버에서 결과 자체를 제외하므로(k-익명성) 빈 배열이 돌아올 수 있다.
export async function getAgeBracketJarStats(): Promise<AgeBracketJarStat[]> {
  const { data, error } = await supabase.rpc('get_age_bracket_jar_stats');
  if (error) throw new Error(error.message);
  return (data ?? []) as AgeBracketJarStat[];
}

export interface AgeBracketSpendingTrendPoint {
  month: string;        // 'YYYY-MM'
  jar: string;
  sub_category: string;
  avg_amount: number;   // 가구당 월평균 지출
  household_count: number;
}

// 동년대 월별 카테고리 지출 트렌드 (최근 12개월, 기본 제공 카테고리만).
// 표본이 30가구 미만인 (월, 카테고리) 조합은 서버에서 제외된다(k-익명성).
export async function getAgeBracketSpendingTrend(): Promise<AgeBracketSpendingTrendPoint[]> {
  const { data, error } = await supabase.rpc('get_age_bracket_spending_trend');
  if (error) throw new Error(error.message);
  return (data ?? []) as AgeBracketSpendingTrendPoint[];
}
