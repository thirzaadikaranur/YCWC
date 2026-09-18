import { ApiError } from '@/lib/server/errors';
import type { ChatMessage, ChatMode, TranscriptMessage } from '@/types';

export const CHAT_MODES = ['ringkasan', 'kuis', 'reverse_bot', 'qa'] as const;

export const MAX_RAW_MATERIAL_LENGTH = 30_000;
export const MAX_CHAT_MESSAGE_LENGTH = 4_000;

const MAX_HISTORY_ITEMS = 40;
const MAX_TRANSCRIPT_ITEMS = 500;

export function isChatMode(value: unknown): value is ChatMode {
  return typeof value === 'string' && (CHAT_MODES as readonly string[]).includes(value);
}

export function requireNonEmptyString(
  value: unknown,
  message: string,
  maxLength?: number,
): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, message);
  }

  const trimmed = value.trim();

  if (maxLength !== undefined && trimmed.length > maxLength) {
    throw new ApiError(
      400,
      `Teks terlalu panjang (maksimal ${maxLength.toLocaleString('id-ID')} karakter).`,
    );
  }

  return trimmed;
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    throw new ApiError(400, 'Format request tidak valid. Kirim body JSON.');
  }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new ApiError(400, 'Format request tidak valid. Kirim body JSON.');
  }

  return raw as Record<string, unknown>;
}

export function validateChatHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    throw new ApiError(400, 'Riwayat percakapan tidak valid.');
  }

  return value.slice(-MAX_HISTORY_ITEMS).map((item) => {
    if (typeof item !== 'object' || item === null) {
      throw new ApiError(400, 'Riwayat percakapan tidak valid.');
    }

    const record = item as Record<string, unknown>;
    if (
      (record.role !== 'user' && record.role !== 'assistant') ||
      typeof record.content !== 'string'
    ) {
      throw new ApiError(400, 'Riwayat percakapan tidak valid.');
    }

    return { role: record.role, content: record.content };
  });
}

export function validateTranscript(value: unknown): TranscriptMessage[] {
  if (!Array.isArray(value)) {
    throw new ApiError(400, 'Transkrip sesi tidak valid.');
  }

  if (value.length > MAX_TRANSCRIPT_ITEMS) {
    throw new ApiError(400, 'Transkrip sesi terlalu panjang untuk disimpan.');
  }

  return value.map((item) => {
    if (typeof item !== 'object' || item === null) {
      throw new ApiError(400, 'Transkrip sesi tidak valid.');
    }

    const record = item as Record<string, unknown>;
    if (
      (record.role !== 'user' && record.role !== 'assistant') ||
      typeof record.content !== 'string'
    ) {
      throw new ApiError(400, 'Transkrip sesi tidak valid.');
    }

    const timestamp =
      typeof record.timestamp === 'string' && record.timestamp.trim()
        ? record.timestamp
        : new Date().toISOString();

    return { role: record.role, content: record.content, timestamp };
  });
}

export function validateResultSummary(value: unknown): Record<string, unknown> | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, 'resultSummary harus berupa objek.');
  }

  return value as Record<string, unknown>;
}
