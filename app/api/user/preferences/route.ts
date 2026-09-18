import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import {
  parsePreferencesPatch,
  readPreferences,
  updateUserPreferences,
} from '@/lib/api/preferences';
import { readJsonBody } from '@/lib/api/validate';

export async function GET(request: NextRequest) {
  return withAuth(request, async ({ user }) => {
    return NextResponse.json(readPreferences(user.user_metadata, user.email));
  });
}

export async function PATCH(request: NextRequest) {
  return withAuth(request, async (context) => {
    const body = await readJsonBody(request);
    const patch = parsePreferencesPatch(body);
    const preferences = await updateUserPreferences(context, patch);

    return NextResponse.json(preferences);
  });
}
