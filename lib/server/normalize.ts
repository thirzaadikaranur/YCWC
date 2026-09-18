import { LlmError } from '@/lib/server/errors';
import { isChatMode } from '@/lib/server/validate';
import type {
  ChatMode,
  LearningProfileInsight,
  QuizAnswer,
  QuizData,
  ReverseBotDiagnosis,
  SummaryData,
} from '@/types';

const QUIZ_ANSWERS: QuizAnswer[] = ['A', 'B', 'C', 'D'];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function asCleanString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(asCleanString)
    .filter((item): item is string => item !== null);
}

function asScore(value: unknown): number | null {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function invalidOutput(detail: unknown): LlmError {
  return new LlmError(
    'Respons AI tidak sesuai format yang diharapkan. Coba kirim ulang pesanmu.',
    detail,
  );
}

export interface NormalizedIntent {
  intent: ChatMode;
  response: string;
  shouldSuggestDiagnostic: boolean;
}

export function normalizeIntent(raw: unknown): NormalizedIntent {
  const record = asRecord(raw);

  if (!record || !isChatMode(record.intent)) {
    throw invalidOutput(raw);
  }

  const response = asCleanString(record.response);
  if (!response) {
    throw invalidOutput(raw);
  }

  return {
    intent: record.intent,
    response,
    shouldSuggestDiagnostic: record.should_suggest_diagnostic === true,
  };
}

export function normalizeTopicTitle(raw: unknown): string | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }
  return (
    asCleanString(record.topic_title) ??
    asCleanString(record.topicTitle) ??
    asCleanString(record.title)
  );
}

export function normalizeSummary(raw: unknown): SummaryData {
  const record = asRecord(raw);
  const sectionsRaw = record?.sections;

  if (!Array.isArray(sectionsRaw)) {
    throw invalidOutput(raw);
  }

  const sections = sectionsRaw
    .map((item, index) => {
      const entry = asRecord(item);
      const heading =
        asCleanString(entry?.heading) ?? asCleanString(entry?.title) ?? `Bagian ${index + 1}`;
      const points = asStringArray(entry?.points);
      return { heading, points };
    })
    .filter((section) => section.points.length > 0);

  if (sections.length === 0) {
    throw invalidOutput(raw);
  }

  return { sections };
}

export function normalizeQuiz(raw: unknown): QuizData {
  const record = asRecord(raw);
  const questionsRaw = record?.questions;

  if (!Array.isArray(questionsRaw)) {
    throw invalidOutput(raw);
  }

  const questions = questionsRaw
    .map((item) => {
      const entry = asRecord(item);
      if (!entry) {
        return null;
      }

      const question = asCleanString(entry.question);
      const options = asRecord(entry.options);
      if (!question || !options) {
        return null;
      }

      const normalizedOptions = {
        A: asCleanString(options.A),
        B: asCleanString(options.B),
        C: asCleanString(options.C),
        D: asCleanString(options.D),
      };

      if (
        !normalizedOptions.A ||
        !normalizedOptions.B ||
        !normalizedOptions.C ||
        !normalizedOptions.D
      ) {
        return null;
      }

      const correctRaw = asCleanString(entry.correct)?.toUpperCase();
      const correct = QUIZ_ANSWERS.find((answer) => answer === correctRaw);
      if (!correct) {
        return null;
      }

      return {
        question,
        options: normalizedOptions as { A: string; B: string; C: string; D: string },
        correct,
        explanation: asCleanString(entry.explanation) ?? 'Jawaban ini sesuai dengan materi.',
        relatedSubTopic:
          asCleanString(entry.related_sub_topic) ??
          asCleanString(entry.relatedSubTopic) ??
          'Materi umum',
      };
    })
    .filter((question): question is NonNullable<typeof question> => question !== null);

  if (questions.length === 0) {
    throw invalidOutput(raw);
  }

  return { questions };
}

export function normalizeReverseBot(raw: unknown): {
  response: string;
  sessionShouldEnd: boolean;
} {
  const record = asRecord(raw);
  const response = asCleanString(record?.response);

  if (!record || !response) {
    throw invalidOutput(raw);
  }

  return {
    response,
    sessionShouldEnd: record.session_should_end === true,
  };
}

export function normalizeDiagnosis(raw: unknown): ReverseBotDiagnosis[] {
  const record = asRecord(raw);
  const entries = record?.sub_topics;

  if (!Array.isArray(entries)) {
    throw invalidOutput(raw);
  }

  const diagnosis = entries
    .map((item) => {
      const entry = asRecord(item);
      if (!entry) {
        return null;
      }

      const subTopic = asCleanString(entry.sub_topic) ?? asCleanString(entry.subTopic);
      const score = asScore(entry.score);
      if (!subTopic || score === null) {
        return null;
      }

      return {
        subTopic,
        score,
        note: asCleanString(entry.note) ?? 'Belum ada catatan spesifik.',
      };
    })
    .filter((entry): entry is ReverseBotDiagnosis => entry !== null);

  if (diagnosis.length === 0) {
    throw invalidOutput(raw);
  }

  return diagnosis;
}

export function extractDiagnosis(resultSummary: Record<string, unknown> | null): ReverseBotDiagnosis[] {
  if (!resultSummary) {
    return [];
  }

  const candidates: unknown[] = [];
  if (Array.isArray(resultSummary.diagnosis)) {
    candidates.push({ sub_topics: resultSummary.diagnosis });
  }
  if (Array.isArray(resultSummary.sub_topics)) {
    candidates.push(resultSummary);
  }

  for (const candidate of candidates) {
    try {
      return normalizeDiagnosis(candidate);
    } catch {
      continue;
    }
  }

  return [];
}

export function normalizeInsights(raw: unknown): LearningProfileInsight[] {
  const record = asRecord(raw);
  const insightsRaw = record?.insights;

  if (!Array.isArray(insightsRaw)) {
    throw invalidOutput(raw);
  }

  const insights = insightsRaw
    .map((item) => {
      const entry = asRecord(item);
      if (!entry) {
        return null;
      }

      const title = asCleanString(entry.title);
      const description = asCleanString(entry.description);
      if (!title || !description) {
        return null;
      }

      const type: LearningProfileInsight['type'] =
        asCleanString(entry.type) === 'kekuatan' ? 'kekuatan' : 'kelemahan';

      return { title, description, type };
    })
    .filter((entry): entry is LearningProfileInsight => entry !== null)
    .slice(0, 5);

  if (insights.length === 0) {
    throw invalidOutput(raw);
  }

  return insights;
}
