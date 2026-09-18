import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import {
  averageScore,
  fetchTopic,
  fetchUnderstandingMap,
  toUnderstandingMapEntry,
  touchTopic,
} from '@/lib/api/db';
import { ApiError } from '@/lib/api/errors';
import type { GetUnderstandingMapResponse } from '@/types';

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

    const rows = await fetchUnderstandingMap(supabase, topicId);
    const entries = rows.map(toUnderstandingMapEntry);
    const overallScore = averageScore(entries.map((entry) => entry.score));

    await touchTopic(supabase, topicId);

    return NextResponse.json({
      topicTitle: topic.title,
      overallScore,
      entries,
    } satisfies GetUnderstandingMapResponse);
  });
}
