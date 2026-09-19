"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { TopicConversation } from "@/components/TopicConversation";
import { UnderstandingPanel } from "@/components/UnderstandingPanel";
import { useTopicChat } from "@/lib/useTopicChat";

interface TopicPageProps {
  topicId: string;
}

export function TopicPage({ topicId }: TopicPageProps) {
  const [panelOpen, setPanelOpen] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
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
  } = useTopicChat(topicId);

  const topicTitle = map?.topicTitle ?? "topik ini";
  const startReverse = () => void send("Jelaskan ke saya.");

  return (
    <AppShell
      activeTopicId={topicId}
      headerTitle={map?.topicTitle}
      panelOpen={panelOpen}
      onTogglePanel={() => setPanelOpen((current) => !current)}
    >
      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{ "--panel-offset": panelOpen ? "338px" : "0px" } as CSSProperties}
      >
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <TopicConversation
            topicTitle={topicTitle}
            entries={entries}
            isLoading={isLoading}
            isSending={isSending}
            isSaving={isSaving}
            canSaveSession={pendingMode !== null}
            hasSavedSession={hasSavedSession}
            error={error}
            scrollContainerRef={scrollContainerRef}
            onSend={(message) => void send(message)}
            onSaveSession={saveCurrentSession}
            onCreateQuiz={() => void send("Buat kuis dari materi ini.")}
            onStartReverse={startReverse}
            onSuggestDiagnostic={startReverse}
            onQuizAnswered={handleQuizAnswered}
          />
          <UnderstandingPanel
            isOpen={panelOpen}
            map={map}
            history={history}
            onStartReverse={startReverse}
            highlightedSubTopic={highlightedSubTopic}
          />
        </div>
        <Composer
          placeholder="Tulis pesan atau minta mode belajar..."
          isSubmitting={isSending}
          onSubmit={(message) => void send(message)}
        />
      </div>
    </AppShell>
  );
}
