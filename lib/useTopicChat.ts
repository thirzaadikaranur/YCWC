"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  chat,
  getScoreHistory,
  getUnderstandingMap,
  saveSession,
} from "@/lib/api";
import type {
  ChatData,
  ChatMode,
  ConversationEntry,
  GetScoreHistoryResponse,
  GetUnderstandingMapResponse,
  ReverseBotData,
  TranscriptMessage,
} from "@/types";

interface QuizStats {
  correct: number;
  total: number;
}

function isReverseBotData(data: ChatData | undefined): data is ReverseBotData {
  return Boolean(data && "sessionShouldEnd" in data);
}

export function useTopicChat(topicId: string) {
  const [map, setMap] = useState<GetUnderstandingMapResponse | null>(null);
  const [history, setHistory] = useState<GetScoreHistoryResponse["history"]>({});
  const [entries, setEntries] = useState<ConversationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingMode, setPendingMode] = useState<ChatMode | null>(null);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [error, setError] = useState("");
  const [highlightedSubTopic, setHighlightedSubTopic] = useState<string | null>(null);
  const quizStatsRef = useRef<QuizStats>({ correct: 0, total: 0 });

  const refreshUnderstanding = useCallback(async () => {
    const [nextMap, nextHistory] = await Promise.all([
      getUnderstandingMap(topicId),
      getScoreHistory(topicId),
    ]);
    setMap(nextMap);
    setHistory(nextHistory.history);
  }, [topicId]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getUnderstandingMap(topicId), getScoreHistory(topicId)])
      .then(([nextMap, nextHistory]) => {
        if (cancelled) return;
        setMap(nextMap);
        setHistory(nextHistory.history);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Gagal memuat data topik.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [topicId]);

  function highlightSubTopic(subTopic: string) {
    setHighlightedSubTopic(subTopic);
    window.setTimeout(() => setHighlightedSubTopic(null), 1200);
  }

  async function persistSession(
    mode: ChatMode,
    transcriptEntries: ConversationEntry[],
    resultSummary: Record<string, unknown> | null,
  ) {
    setIsSaving(true);

    try {
      const transcript: TranscriptMessage[] = transcriptEntries.map((entry) => ({
        role: entry.role,
        content: entry.content,
        timestamp: entry.timestamp,
      }));

      await saveSession({ topicId, mode, transcript, resultSummary });
      setPendingMode(null);
      setHasSavedSession(true);
      quizStatsRef.current = { correct: 0, total: 0 };
      await refreshUnderstanding();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal menyimpan sesi. Coba lagi sebentar lagi.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    const userEntry: ConversationEntry = {
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const historyPayload = entries.map(({ role, content }) => ({ role, content }));
    const nextEntries = [...entries, userEntry];

    setEntries(nextEntries);
    setIsSending(true);
    setError("");
    setHasSavedSession(false);

    try {
      const result = await chat({ topicId, message: trimmed, history: historyPayload });

      const assistantEntry: ConversationEntry = {
        role: "assistant",
        content: result.response,
        timestamp: new Date().toISOString(),
        intent: result.intent,
        data: result.data ?? null,
        shouldSuggestDiagnostic: result.shouldSuggestDiagnostic,
      };

      setEntries([...nextEntries, assistantEntry]);
      setPendingMode(result.intent);

      if (result.intent === "reverse_bot" && isReverseBotData(result.data) && result.data.sessionShouldEnd) {
        const weakest = result.data.diagnosis
          ?.slice()
          .sort((left, right) => left.score - right.score)[0];

        if (weakest) highlightSubTopic(weakest.subTopic);

        await persistSession("reverse_bot", [...nextEntries, assistantEntry], {
          diagnosis: result.data.diagnosis,
        });
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Pesanmu belum bisa diproses. Coba lagi sebentar lagi.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function saveCurrentSession() {
    const mode = pendingMode ?? "qa";
    let resultSummary: Record<string, unknown> | null = null;

    if (mode === "kuis" && quizStatsRef.current.total > 0) {
      resultSummary = { ...quizStatsRef.current };
    }

    if (mode === "reverse_bot") {
      const latestReverseBot = entries
        .slice()
        .reverse()
        .find((entry) => entry.role === "assistant" && isReverseBotData(entry.data));

      if (latestReverseBot && isReverseBotData(latestReverseBot.data)) {
        resultSummary = { diagnosis: latestReverseBot.data.diagnosis };
      }
    }

    void persistSession(mode, entries, resultSummary);
  }

  function handleQuizAnswered(isCorrect: boolean) {
    quizStatsRef.current.total += 1;
    if (isCorrect) quizStatsRef.current.correct += 1;
  }

  return {
    map,
    history,
    entries,
    isLoading,
    isSending,
    isSaving,
    pendingMode,
    hasSavedSession,
    error,
    highlightedSubTopic,
    send,
    saveCurrentSession,
    handleQuizAnswered,
  };
}
