import { LlmError } from '@/lib/server/errors';

const GEMINI_DEFAULT_MODEL = 'gemini-3.5-flash';
const GROQ_DEFAULT_MODEL = 'openai/gpt-oss-120b';
const REQUEST_TIMEOUT_MS = 25_000;
const RETRY_DELAY_MS = 1_500;

interface LlmPrompt {
  system: string;
  user: string;
}

interface LlmProvider {
  name: string;
  run: (prompt: LlmPrompt) => Promise<string>;
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
  }[];
  promptFeedback?: { blockReason?: string };
}

interface GroqResponse {
  choices?: { message?: { content?: string } }[];
}

function stripCodeFence(text: string): string {
  const fenced = text.match(/^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/i);
  if (fenced?.[1]) {
    return fenced[1];
  }
  return text;
}

function extractJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return text.slice(start, end + 1);
}

export function parseJsonLoose(text: string): unknown {
  const cleaned = stripCodeFence(text).trim();
  const candidates = [cleaned, extractJsonObject(cleaned)].filter(
    (candidate): candidate is string => Boolean(candidate),
  );

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }

  throw new LlmError(
    'Respons AI tidak bisa dibaca sebagai JSON. Coba kirim ulang pesanmu.',
    text.slice(0, 500),
  );
}

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 300);
  } catch {
    return '';
  }
}

async function callGemini(prompt: LlmPrompt): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum diisi');
  }

  const model = process.env.GEMINI_MODEL || GEMINI_DEFAULT_MODEL;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: prompt.system }] },
        contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${await readErrorDetail(response)}`.trim());
  }

  const payload = (await response.json()) as GeminiResponse;
  const text =
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('') ?? '';

  if (!text.trim()) {
    const reason = payload.promptFeedback?.blockReason;
    throw new Error(reason ? `respons diblokir (${reason})` : 'respons kosong');
  }

  return text;
}

async function callGroq(prompt: LlmPrompt): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY belum diisi');
  }

  const model = process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${await readErrorDetail(response)}`.trim());
  }

  const payload = (await response.json()) as GroqResponse;
  const text = payload.choices?.[0]?.message?.content ?? '';

  if (!text.trim()) {
    throw new Error('respons kosong');
  }

  return text;
}

function buildProviders(): LlmProvider[] {
  const providers: LlmProvider[] = [];

  if (process.env.GEMINI_API_KEY) {
    providers.push({ name: 'Gemini', run: callGemini });
  }
  if (process.env.GROQ_API_KEY) {
    providers.push({ name: 'Groq', run: callGroq });
  }

  return providers;
}

const RETRYABLE_STATUS = /\bHTTP (429|500|502|503|504)\b/;

function isRetryable(error: unknown): boolean {
  if (error instanceof LlmError) {
    return false;
  }
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name === 'TimeoutError' || error.name === 'AbortError') {
    return false;
  }
  if (error instanceof TypeError) {
    return true;
  }
  return RETRYABLE_STATUS.test(error.message);
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function generateJson(prompt: LlmPrompt): Promise<unknown> {
  const providers = buildProviders();

  if (providers.length === 0) {
    throw new LlmError(
      'Layanan AI belum dikonfigurasi di server. Hubungi pengelola aplikasi.',
    );
  }

  let parseFailed = false;

  for (const provider of providers) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const text = await provider.run(prompt);
        return parseJsonLoose(text);
      } catch (error) {
        if (error instanceof LlmError) {
          parseFailed = true;
        }

        console.error(
          `[llm] ${provider.name} gagal (percobaan ${attempt}):`,
          error instanceof Error ? error.message : error,
        );

        if (attempt === 1 && isRetryable(error)) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }

        break;
      }
    }
  }

  if (parseFailed) {
    throw new LlmError(
      'Respons AI tidak bisa dibaca sebagai JSON. Coba kirim ulang pesanmu.',
    );
  }

  throw new LlmError(
    'Layanan AI sedang tidak bisa dihubungi. Coba lagi sebentar lagi.',
  );
}
