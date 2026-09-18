import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { fetchTopic, toScoreHistoryPoint, type ScoreHistoryRow } from '@/lib/api/db';
import { ApiError } from '@/lib/api/errors';
import type { GetScoreHistoryResponse, ScoreHistoryPoint } from '@/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ topicId: string }> },
) {
  return withAuth(request, async ({ supabase }) => {
    const { topicId } = await context.params;

    const topic = await fetchTopic(supabase, topicId);
    if (!topic) {
      throw new ApiError(404, 'Topik tidak ditemukan.');
    }

    const { data, error } = await supabase
      .from('score_history')
      .select('topic_id,sub_topic,score,recorded_at')
      .eq('topic_id', topicId)
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('[api/score-history] gagal mengambil data:', error.message);
      throw new ApiError(500, 'Gagal mengambil riwayat skor. Coba lagi sebentar lagi.');
    }

    const history: Record<string, ScoreHistoryPoint[]> = {};

    for (const row of (data ?? []) as ScoreHistoryRow[]) {
      const points = history[row.sub_topic] ?? [];
      points.push(toScoreHistoryPoint(row));
      history[row.sub_topic] = points;
    }

    return NextResponse.json({ history } satisfies GetScoreHistoryResponse);
  });
}
