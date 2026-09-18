import { NextResponse, type NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withAuth } from '@/lib/server/auth';
import { deriveLabel, fetchTopic, touchTopic } from '@/lib/server/db';
import { ApiError } from '@/lib/server/errors';
import { extractDiagnosis } from '@/lib/server/normalize';
import {
  isChatMode,
  readJsonBody,
  requireNonEmptyString,
  validateResultSummary,
  validateTranscript,
} from '@/lib/server/validate';
import type { ReverseBotDiagnosis, SaveSessionResponse } from '@/types';

async function saveDiagnosis(
  supabase: SupabaseClient,
  input: {
    userId: string;
    topicId: string;
    sessionId: string;
    diagnosis: ReverseBotDiagnosis[];
  },
): Promise<void> {
  const mapRows = input.diagnosis.map((entry) => ({
    topic_id: input.topicId,
    user_id: input.userId,
    sub_topic: entry.subTopic,
    score: entry.score,
    label: deriveLabel(entry.score),
    note: entry.note,
    updated_at: new Date().toISOString(),
  }));

  const { error: mapError } = await supabase
    .from('understanding_map')
    .upsert(mapRows, { onConflict: 'topic_id,sub_topic' });

  if (mapError) {
    console.error('[api/sessions] gagal upsert understanding_map:', mapError.message);
    throw new ApiError(
      500,
      'Sesi sudah tersimpan, tapi peta pemahaman gagal diperbarui. Coba simpan ulang sesinya.',
    );
  }

  const historyRows = input.diagnosis.map((entry) => ({
    topic_id: input.topicId,
    user_id: input.userId,
    sub_topic: entry.subTopic,
    score: entry.score,
    session_id: input.sessionId,
  }));

  const { error: historyError } = await supabase
    .from('score_history')
    .insert(historyRows);

  if (historyError) {
    console.error('[api/sessions] gagal insert score_history:', historyError.message);
    throw new ApiError(
      500,
      'Peta pemahaman sudah diperbarui, tapi riwayat skor gagal disimpan. Coba simpan ulang sesinya.',
    );
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ supabase, user }) => {
    const body = await readJsonBody(request);
    const topicId = requireNonEmptyString(body.topicId, 'Topik tidak valid.');

    if (!isChatMode(body.mode)) {
      throw new ApiError(400, 'Mode sesi tidak valid.');
    }
    const mode = body.mode;

    const transcript = validateTranscript(body.transcript);
    const resultSummary = validateResultSummary(body.resultSummary);

    const topic = await fetchTopic(supabase, topicId);
    if (!topic) {
      throw new ApiError(404, 'Topik tidak ditemukan.');
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        topic_id: topicId,
        user_id: user.id,
        mode,
        transcript,
        result_summary: resultSummary,
      })
      .select('id,created_at')
      .single();

    if (error || !data) {
      console.error('[api/sessions] gagal insert sesi:', error?.message);
      throw new ApiError(500, 'Gagal menyimpan sesi. Coba lagi sebentar lagi.');
    }

    const session = data as { id: string; created_at: string };

    if (mode === 'reverse_bot') {
      const diagnosis = extractDiagnosis(resultSummary);

      if (diagnosis.length > 0) {
        await saveDiagnosis(supabase, {
          userId: user.id,
          topicId,
          sessionId: session.id,
          diagnosis,
        });
      }
    }

    await touchTopic(supabase, topicId);

    return NextResponse.json({
      session: { id: session.id, createdAt: session.created_at },
    } satisfies SaveSessionResponse);
  });
}
