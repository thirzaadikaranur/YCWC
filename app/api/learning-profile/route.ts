import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import {
  hasEnoughProfileData,
  toLearningProfile,
  type LearningProfileRow,
} from '@/lib/api/db';
import { ApiError } from '@/lib/api/errors';
import type { GetLearningProfileResponse } from '@/types';

export async function GET(request: NextRequest) {
  return withAuth(request, async ({ supabase }) => {
    const [profileResult, enoughData] = await Promise.all([
      supabase.from('learning_profile').select('insights,generated_at').maybeSingle(),
      hasEnoughProfileData(supabase),
    ]);

    if (profileResult.error) {
      console.error('[api/learning-profile] gagal mengambil profil:', profileResult.error.message);
      throw new ApiError(500, 'Gagal mengambil profil belajar. Coba lagi sebentar lagi.');
    }

    const profile = profileResult.data
      ? toLearningProfile(profileResult.data as LearningProfileRow)
      : null;

    return NextResponse.json({ profile, enoughData } satisfies GetLearningProfileResponse);
  });
}
