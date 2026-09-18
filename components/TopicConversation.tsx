"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ConversationMessage } from "@/components/ConversationMessage";
import { Icon } from "@/components/Icon";
import type { ConversationEntry } from "@/types";

interface TopicConversationProps {
  topicTitle: string;
  entries: ConversationEntry[];
  isLoading: boolean;
  isSending: boolean;
  isSaving: boolean;
  canSaveSession: boolean;
  hasSavedSession: boolean;
  error: string;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onSend: (message: string) => void;
  onSaveSession: () => void;
  onCreateQuiz: () => void;
  onStartReverse: () => void;
  onSuggestDiagnostic: () => void;
  onQuizAnswered: (isCorrect: boolean) => void;
}

const starterPrompts = [
  { label: "Ringkas materi ini", message: "Ringkas materi ini." },
  { label: "Buat kuis", message: "Buat kuis dari materi ini." },
  { label: "Jelaskan ke saya", message: "Jelaskan ke saya." },
  { label: "Tanya bebas", message: "Apa poin penting dari materi ini?" },
];

export function TopicConversation({
  topicTitle,
  entries,
  isLoading,
  isSending,
  isSaving,
  canSaveSession,
  hasSavedSession,
  error,
  scrollContainerRef,
  onSend,
  onSaveSession,
  onCreateQuiz,
  onStartReverse,
  onSuggestDiagnostic,
  onQuizAnswered,
}: TopicConversationProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length, isSending]);

  function previousUserMessage(index: number): string | undefined {
    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      if (entries[cursor].role === "user") {
        return entries[cursor].content;
      }
    }
    return undefined;
  }

  return (
    <section className="min-w-0 flex-1 overflow-hidden" aria-labelledby="conversation-title">
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto px-[clamp(17px,4vw,62px)] pb-[150px] pt-[30px] [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin] max-md:pb-[140px] max-md:pt-6"
      >
        <div className="mx-auto w-full max-w-[760px]">
          <div className="mb-7 flex items-start justify-between gap-5 border-b border-surface/[0.09] pb-[18px] max-md:block max-md:mb-6">
            <h1 id="conversation-title" className="m-0 max-w-[16ch] font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[1.04] tracking-[-0.05em] text-surface max-md:max-w-[13ch] max-md:text-[2rem]">
              Memahami {topicTitle.toLowerCase()}
            </h1>
            <p className="m-1 max-w-[23ch] text-right text-[0.73rem] leading-[1.55] text-surface/50 max-md:mt-2.5 max-md:max-w-[32ch] max-md:text-left">
              Ajukan pertanyaan, minta ringkasan atau kuis, atau jelaskan materinya dengan kata-katamu sendiri.
            </p>
          </div>

          {error && (
            <p className="mb-5 flex items-start gap-2 rounded-control border border-danger/40 bg-danger/[0.08] px-3.5 py-3 text-[0.73rem] font-semibold leading-[1.5] text-[#F2B2A8]" role="alert">
              <Icon name="alert" className="mt-px size-[17px] shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {isLoading ? (
            <div className="grid gap-3.5" aria-label="Memuat percakapan">
              <div className="h-16 animate-pulse rounded-[15px] bg-surface/[0.06]" />
              <div className="h-24 animate-pulse rounded-[18px] bg-surface/[0.06]" />
            </div>
          ) : entries.length === 0 ? (
            <div className="grid place-items-start rounded-[18px] border border-surface/[0.12] bg-surface/[0.04] p-[clamp(20px,4vw,30px)]">
              <Icon name="spark" className="mb-4 size-7 text-accent" />
              <h2 className="mb-2.5 max-w-[22ch] font-display text-[1.35rem] font-semibold leading-[1.12] tracking-[-0.035em] text-surface">
                Mulai dari mana?
              </h2>
              <p className="m-0 max-w-[52ch] text-[0.75rem] leading-[1.6] text-surface/[0.58]">
                Semua mode belajar bisa dipicu dari sini. Coba salah satu, atau tulis pesanmu sendiri di kolom bawah.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    className="min-h-10 rounded-full border border-surface/[0.18] bg-surface/[0.055] px-3.5 py-2 text-[0.72rem] font-semibold text-surface/85 transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-surface"
                    type="button"
                    disabled={isSending}
                    onClick={() => onSend(prompt.message)}
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {entries.map((entry, index) => (
                <ConversationMessage
                  key={`${entry.role}-${index}-${entry.timestamp}`}
                  entry={entry}
                  topicTitle={topicTitle}
                  previousUserMessage={
                    entry.role === "assistant" ? previousUserMessage(index) : undefined
                  }
                  onCreateQuiz={onCreateQuiz}
                  onStartReverse={onStartReverse}
                  onSuggestDiagnostic={onSuggestDiagnostic}
                  onQuizAnswered={onQuizAnswered}
                />
              ))}
            </div>
          )}

          {isSending && (
            <p className="mt-4 flex items-center gap-2 text-[0.7rem] font-semibold text-surface/50" role="status">
              <span className="size-3.5 animate-spin rounded-full border-2 border-surface/20 border-t-accent" />
              ReverseTutor sedang menyusun respons...
            </p>
          )}

          {!isLoading && (canSaveSession || hasSavedSession) && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[13px] border border-surface/[0.12] bg-surface/[0.045] px-4 py-3">
              <span className="text-[0.7rem] leading-[1.45] text-surface/60">
                {canSaveSession
                  ? "Sesi ini belum disimpan ke riwayat belajar."
                  : "Sesi terakhir sudah tersimpan di riwayat belajar."}
              </span>
              {canSaveSession && (
                <button
                  className="min-h-[36px] rounded-[9px] border border-transparent bg-accent px-3.5 py-2 text-[0.68rem] font-bold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
                  type="button"
                  disabled={isSaving}
                  onClick={onSaveSession}
                >
                  {isSaving ? "Menyimpan..." : "Simpan sesi"}
                </button>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </section>
  );
}
