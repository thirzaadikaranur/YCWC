import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import {
  averageScore,
  deriveLabel,
  toTopic,
  type TopicRow,
  type TopicSummaryRow,
} from '@/lib/api/db';
import { ApiError } from '@/lib/api/errors';
import { generateJson } from '@/lib/api/llm';
import { normalizeTopicTitle } from '@/lib/api/normalize';
import { buildTopicTitlePrompt } from '@/lib/api/prompts';
import { readJsonBody, requireNonEmptyString } from '@/lib/api/validate';
import type {
  CreateTopicResponse,
  GetTopicsResponse,
  TopicListItem,
} from '@/types';

interface SessionTopicRow {
  topic_id: string;
}

interface ScoreRow {
  topic_id: string;
  score: number;
}

export async function GET(request: NextRequest) {
  return withAuth(request, async ({ supabase }) => {
    const [topicsResult, sessionsResult, mapResult] = await Promise.all([
      supabase
        .from('topics')
        .select('id,title,last_accessed_at')
        .order('last_accessed_at', { ascending: false }),
      supabase.from('sessions').select('topic_id'),
      supabase.from('understanding_map').select('topic_id,score'),
    ]);

    if (topicsResult.error || sessionsResult.error || mapResult.error) {
      console.error(
        '[api/topics] gagal mengambil data:',
        topicsResult.error?.message ??
          sessionsResult.error?.message ??
          mapResult.error?.message,
      );
      throw new ApiError(500, 'Gagal mengambil daftar topik. Coba lagi sebentar lagi.');
    }

    const sessionCounts = new Map<string, number>();
    for (const row of (sessionsResult.data ?? []) as SessionTopicRow[]) {
      sessionCounts.set(row.topic_id, (sessionCounts.get(row.topic_id) ?? 0) + 1);
    }

    const scoresByTopic = new Map<string, number[]>();
    for (const row of (mapResult.data ?? []) as ScoreRow[]) {
      const scores = scoresByTopic.get(row.topic_id) ?? [];
      scores.push(row.score);
      scoresByTopic.set(row.topic_id, scores);
    }

    const topics: TopicListItem[] = ((topicsResult.data ?? []) as TopicSummaryRow[]).map(
      (row) => {
        const overallScore = averageScore(scoresByTopic.get(row.id) ?? []);

        return {
          id: row.id,
          title: row.title,
          lastAccessedAt: row.last_accessed_at,
          sessionCount: sessionCounts.get(row.id) ?? 0,
          overallScore,
          overallLabel: overallScore === null ? null : deriveLabel(overallScore),
        };
      },
    );

    return NextResponse.json({ topics } satisfies GetTopicsResponse);
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ supabase, user }) => {
    const body = await readJsonBody(request);
    const rawMaterial = requireNonEmptyString(
      body.rawMaterial,
      'Materi belum diisi. Tempel materi sebelum mulai topik baru.',
    );

    const title = await generateTopicTitle(rawMaterial);

    const { data, error } = await supabase
      .from('topics')
      .insert({ user_id: user.id, title, raw_material: rawMaterial })
      .select('id,user_id,title,raw_material,created_at,last_accessed_at')
      .single();

    if (error || !data) {
      console.error('[api/topics] gagal insert topik:', error?.message);
      throw new ApiError(500, 'Gagal menyimpan topik baru. Coba lagi sebentar lagi.');
    }

    return NextResponse.json({
      topic: toTopic(data as TopicRow),
    } satisfies CreateTopicResponse);
  });
}

async function generateTopicTitle(rawMaterial: string): Promise<string> {
  try {
    const raw = await generateJson(buildTopicTitlePrompt(rawMaterial));
    const title = normalizeTopicTitle(raw);

    if (title) {
      return title.slice(0, 60);
    }
  } catch (error) {
    console.error(
      '[api/topics] gagal generate judul lewat LLM:',
      error instanceof Error ? error.message : error,
    );
  }

  const firstLine = rawMaterial.split(/[.!?\n]/)[0]?.trim() ?? '';
  return firstLine.slice(0, 40).trim() || 'Topik Baru';
}
