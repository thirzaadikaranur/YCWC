import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '@/lib/server/auth';
import {
  fetchTopic,
  fetchUnderstandingMap,
  toTopic,
  touchTopic,
  type UnderstandingMapRow,
} from '@/lib/server/db';
import { ApiError } from '@/lib/server/errors';
import { generateJson } from '@/lib/server/llm';
import {
  normalizeDiagnosis,
  normalizeIntent,
  normalizeQuiz,
  normalizeReverseBot,
  normalizeSummary,
  type NormalizedIntent,
} from '@/lib/server/normalize';
import { readPreferences } from '@/lib/server/preferences';
import {
  buildIntentPrompt,
  buildQuizPrompt,
  buildReverseBotAnalysisPrompt,
  buildReverseBotPrompt,
  buildSummaryPrompt,
} from '@/lib/server/prompts';
import { readJsonBody, requireNonEmptyString, validateChatHistory, MAX_CHAT_MESSAGE_LENGTH } from '@/lib/server/validate';
import type { ChatData, ChatMessage, ChatResponse, Topic, UserPreferences } from '@/types';

export const maxDuration = 60;

interface ModeInput {
  topic: Topic;
  history: ChatMessage[];
  message: string;
  understandingMap: UnderstandingMapRow[];
  preferences: UserPreferences;
}

function removeDuplicateLatest(history: ChatMessage[], message: string): ChatMessage[] {
  const last = history.at(-1);

  if (last && last.role === 'user' && last.content.trim() === message.trim()) {
    return history.slice(0, -1);
  }

  return history;
}

async function buildModePayload(
  intent: NormalizedIntent,
  input: ModeInput,
): Promise<{ response: string; data: ChatData }> {
  switch (intent.intent) {
    case 'ringkasan': {
      const data = normalizeSummary(await generateJson(buildSummaryPrompt(input.topic.rawMaterial)));
      return { response: intent.response, data };
    }

    case 'kuis': {
      const data = normalizeQuiz(
        await generateJson(
          buildQuizPrompt({
            rawMaterial: input.topic.rawMaterial,
            understandingMap: input.understandingMap,
            questionCount: input.preferences.defaultQuizQuestionCount,
          }),
        ),
      );
      return { response: intent.response, data };
    }

    case 'reverse_bot': {
      const turn = normalizeReverseBot(
        await generateJson(
          buildReverseBotPrompt({
            rawMaterial: input.topic.rawMaterial,
            history: input.history,
            understandingMap: input.understandingMap,
            message: input.message,
          }),
        ),
      );

      let diagnosis = null;
      if (turn.sessionShouldEnd) {
        diagnosis = normalizeDiagnosis(
          await generateJson(
            buildReverseBotAnalysisPrompt({
              rawMaterial: input.topic.rawMaterial,
              transcript: [...input.history, { role: 'user', content: input.message }],
              understandingMap: input.understandingMap,
            }),
          ),
        );
      }

      return {
        response: turn.response,
        data: { sessionShouldEnd: turn.sessionShouldEnd, diagnosis },
      };
    }

    case 'qa':
    default:
      return { response: intent.response, data: null };
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ supabase, user }) => {
    const body = await readJsonBody(request);
    const topicId = requireNonEmptyString(body.topicId, 'Topik tidak valid.');
    const message = requireNonEmptyString(
      body.message,
      'Pesan tidak boleh kosong.',
      MAX_CHAT_MESSAGE_LENGTH,
    );
    const history = removeDuplicateLatest(validateChatHistory(body.history), message);

    const topicRow = await fetchTopic(supabase, topicId);
    if (!topicRow) {
      throw new ApiError(404, 'Topik tidak ditemukan.');
    }

    const topic = toTopic(topicRow);

    const understandingMap = await fetchUnderstandingMap(supabase, topicId);
    const preferences = readPreferences(user.user_metadata, user.email);
    const allowDiagnosticSuggestion =
      preferences.showDiagnosticPrompt && understandingMap.length === 0;

    const intent = normalizeIntent(
      await generateJson(
        buildIntentPrompt({
          rawMaterial: topic.rawMaterial,
          history,
          understandingMap,
          message,
          allowDiagnosticSuggestion,
        }),
      ),
    );

    const { response, data } = await buildModePayload(intent, {
      topic,
      history,
      message,
      understandingMap,
      preferences,
    });

    await touchTopic(supabase, topicId);

    const shouldSuggestDiagnostic =
      intent.shouldSuggestDiagnostic &&
      allowDiagnosticSuggestion &&
      (intent.intent === 'ringkasan' || intent.intent === 'kuis');

    return NextResponse.json({
      intent: intent.intent,
      response,
      shouldSuggestDiagnostic,
      data,
    } satisfies ChatResponse);
  });
}
