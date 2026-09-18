import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { NextRequest, NextResponse } from 'next/server';
import { ApiError, toErrorResponse } from '@/lib/server/errors';

export const AUTH_ERROR_MESSAGE =
  'Sesi login tidak valid atau kedaluwarsa. Silakan login ulang.';

export interface AuthContext {
  supabase: SupabaseClient;
  user: User;
  token: string;
}

export function readSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new ApiError(
      500,
      'Konfigurasi server belum lengkap (Supabase). Hubungi pengelola aplikasi.',
    );
  }

  return { url, anonKey };
}

export function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (!header) {
    return null;
  }

  const [scheme, ...rest] = header.trim().split(/\s+/);
  const token = rest.join('');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const token = extractBearerToken(request);
  if (!token) {
    throw new ApiError(401, AUTH_ERROR_MESSAGE);
  }

  const { url, anonKey } = readSupabaseEnv();

  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new ApiError(401, AUTH_ERROR_MESSAGE);
  }

  return { supabase, user: data.user, token };
}

export async function withAuth(
  request: NextRequest,
  handler: (context: AuthContext) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const context = await requireAuth(request);
    return await handler(context);
  } catch (error) {
    return toErrorResponse(error);
  }
}
