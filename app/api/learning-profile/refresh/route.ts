import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import { hasEnoughProfileData } from '@/lib/server/db';
import { ApiError } from '@/lib/server/errors';
import { generateJson } from '@/lib/server/llm';
import { normalizeInsights } from '@/lib/server/normalize';
import { buildLearningProfilePrompt } from '@/lib/server/prompts';
import type { RefreshLearningProfileResponse } from '@/types';

export const maxDuration = 60;

interface TopicRow {
  id: string;
  title: string;
}

interface ProfileEntryRow {
  topic_id: string;
  sub_topic: string;
  score: number;
  note: string | null;
}

interface ProfileHistoryRow {
  topic_id: string;
  sub_topic: string;
  score: number;
  recorded_at: string;
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ supabase, user }) => {
    const enoughData = await hasEnoughProfileData(supabase);

    if (!enoughData) {
      throw new ApiError(
        400,
        "Belum cukup data untuk menganalisis pola belajar. Selesaikan beberapa sesi 'Jelaskan ke Saya' di topik berbeda dulu.",
      );
    }

    const [topicsResult, entriesResult, historyResult] = await Promise.all([
      supabase.from('topics').select('id,title'),
      supabase.from('understanding_map').select('topic_id,sub_topic,score,note'),
      supabase
        .from('score_history')
        .select('topic_id,sub_topic,score,recorded_at')
        .order('recorded_at', { ascending: true }),
    ]);

    if (topicsResult.error || entriesResult.error || historyResult.error) {
      console.error(
        '[api/learning-profile/refresh] gagal mengambil data:',
        topicsResult.error?.message ??
          entriesResult.error?.message ??
          historyResult.error?.message,
      );
      throw new ApiError(500, 'Gagal mengambil data belajar. Coba lagi sebentar lagi.');
    }

    const insights = normalizeInsights(
      await generateJson(
        buildLearningProfilePrompt({
          topics: (topicsResult.data ?? []) as TopicRow[],
          entries: (entriesResult.data ?? []) as ProfileEntryRow[],
          history: (historyResult.data ?? []) as ProfileHistoryRow[],
        }),
      ),
    );

    const generatedAt = new Date().toISOString();

    const { error } = await supabase
      .from('learning_profile')
      .upsert({ user_id: user.id, insights, generated_at: generatedAt }, { onConflict: 'user_id' });

    if (error) {
      console.error('[api/learning-profile/refresh] gagal upsert profil:', error.message);
      throw new ApiError(500, 'Gagal menyimpan profil belajar. Coba lagi sebentar lagi.');
    }

    return NextResponse.json({
      profile: { insights, generatedAt },
    } satisfies RefreshLearningProfileResponse);
  });
}
