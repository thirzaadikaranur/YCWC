import type { AuthContext } from '@/lib/server/auth';
import { readSupabaseEnv } from '@/lib/server/auth';
import { ApiError } from '@/lib/server/errors';
import type { UserPreferences } from '@/types';

const DEFAULT_QUIZ_QUESTION_COUNT = 10;
const MIN_QUIZ_QUESTION_COUNT = 1;
const MAX_QUIZ_QUESTION_COUNT = 20;
const DISPLAY_NAME_MAX_LENGTH = 60;

function firstNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function deriveDisplayName(email: string | undefined): string {
  const prefix = email?.split('@')[0]?.trim();
  return prefix ? prefix : 'Pelajar';
}

function clampQuestionCount(value: number): number {
  return Math.min(
    MAX_QUIZ_QUESTION_COUNT,
    Math.max(MIN_QUIZ_QUESTION_COUNT, Math.round(value)),
  );
}

export function readPreferences(
  metadata: Record<string, unknown> | undefined,
  email: string | undefined,
): UserPreferences {
  const data = metadata ?? {};

  const displayName =
    firstNonEmptyString(data.displayName, data.display_name, data.full_name, data.name) ??
    deriveDisplayName(email);

  const showDiagnosticPrompt =
    typeof data.showDiagnosticPrompt === 'boolean' ? data.showDiagnosticPrompt : true;

  const rawCount = data.defaultQuizQuestionCount;
  const defaultQuizQuestionCount =
    typeof rawCount === 'number' && Number.isFinite(rawCount)
      ? clampQuestionCount(rawCount)
      : DEFAULT_QUIZ_QUESTION_COUNT;

  return { displayName, showDiagnosticPrompt, defaultQuizQuestionCount };
}

export function parsePreferencesPatch(body: Record<string, unknown>): Partial<UserPreferences> {
  const patch: Partial<UserPreferences> = {};

  if ('displayName' in body) {
    if (typeof body.displayName !== 'string' || !body.displayName.trim()) {
      throw new ApiError(400, 'Nama tampilan tidak boleh kosong.');
    }
    patch.displayName = body.displayName.trim().slice(0, DISPLAY_NAME_MAX_LENGTH);
  }

  if ('showDiagnosticPrompt' in body) {
    if (typeof body.showDiagnosticPrompt !== 'boolean') {
      throw new ApiError(400, 'Preferensi ajakan "Jelaskan ke Saya" harus bernilai true atau false.');
    }
    patch.showDiagnosticPrompt = body.showDiagnosticPrompt;
  }

  if ('defaultQuizQuestionCount' in body) {
    const numeric =
      typeof body.defaultQuizQuestionCount === 'number'
        ? body.defaultQuizQuestionCount
        : Number(body.defaultQuizQuestionCount);

    if (
      !Number.isInteger(numeric) ||
      numeric < MIN_QUIZ_QUESTION_COUNT ||
      numeric > MAX_QUIZ_QUESTION_COUNT
    ) {
      throw new ApiError(
        400,
        `Jumlah soal default harus angka bulat ${MIN_QUIZ_QUESTION_COUNT}-${MAX_QUIZ_QUESTION_COUNT}.`,
      );
    }

    patch.defaultQuizQuestionCount = numeric;
  }

  if (Object.keys(patch).length === 0) {
    throw new ApiError(400, 'Tidak ada preferensi yang dikirim untuk diupdate.');
  }

  return patch;
}

export async function updateUserPreferences(
  context: AuthContext,
  patch: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const { url, anonKey } = readSupabaseEnv();
  const mergedMetadata = { ...(context.user.user_metadata ?? {}), ...patch };

  const response = await fetch(`${url}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${context.token}`,
    },
    body: JSON.stringify({ data: mergedMetadata }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('[api] gagal update user_metadata:', response.status, detail.slice(0, 300));
    throw new ApiError(500, 'Gagal menyimpan preferensi. Coba lagi sebentar lagi.');
  }

  const payload = (await response.json()) as { user_metadata?: Record<string, unknown> };
  return readPreferences(payload.user_metadata ?? mergedMetadata, context.user.email);
}
