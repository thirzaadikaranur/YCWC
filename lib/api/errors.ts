import { NextResponse } from 'next/server';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class LlmError extends Error {
  readonly detail: unknown;

  constructor(message: string, detail?: unknown) {
    super(message);
    this.name = 'LlmError';
    this.detail = detail;
  }
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof LlmError) {
    console.error('[api] llm error:', error.detail ?? error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.error('[api] unexpected error:', error);
  return NextResponse.json(
    { error: 'Terjadi kesalahan di server. Coba lagi sebentar lagi.' },
    { status: 500 },
  );
}
