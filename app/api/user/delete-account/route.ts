import { NextResponse, type NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { withAuth } from '@/lib/server/auth';
import { ApiError } from '@/lib/server/errors';
import { createAdminClient } from '@/lib/supabase/admin';

async function deleteUserRows(supabase: SupabaseClient, userId: string): Promise<void> {
  const results = await Promise.all([
    supabase.from('understanding_map').delete().eq('user_id', userId),
    supabase.from('score_history').delete().eq('user_id', userId),
    supabase.from('sessions').delete().eq('user_id', userId),
    supabase.from('learning_profile').delete().eq('user_id', userId),
  ]);

  const failed = results.find((result) => result.error);

  if (failed?.error) {
    console.error('[api/user/delete-account] gagal menghapus data terkait:', failed.error.message);
    throw new ApiError(500, 'Gagal menghapus data akun. Coba lagi sebentar lagi.');
  }

  const { error: topicsError } = await supabase.from('topics').delete().eq('user_id', userId);

  if (topicsError) {
    console.error('[api/user/delete-account] gagal menghapus topik:', topicsError.message);
    throw new ApiError(500, 'Gagal menghapus data akun. Coba lagi sebentar lagi.');
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ supabase, user }) => {
    const admin = createAdminClient();

    if (!admin) {
      throw new ApiError(
        500,
        'Fitur hapus akun belum dikonfigurasi di server. Hubungi pengelola aplikasi.',
      );
    }

    await deleteUserRows(supabase, user.id);

    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      console.error('[api/user/delete-account] gagal menghapus akun auth:', error.message);
      throw new ApiError(
        500,
        'Data belajar sudah dihapus, tapi akun login gagal dihapus. Coba lagi sebentar lagi.',
      );
    }

    return NextResponse.json({ success: true });
  });
}
