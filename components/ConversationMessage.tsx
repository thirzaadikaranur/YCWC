"use client";

import { useState } from "react";
import { ChatBubble } from "@/components/ChatBubble";
import { QuizCard } from "@/components/QuizCard";
import { ReverseBotBubble } from "@/components/ReverseBotBubble";
import { SummaryCard } from "@/components/SummaryCard";
import type { ConversationEntry, ReverseBotData, SummaryData, QuizData } from "@/types";

interface ConversationMessageProps {
  entry: ConversationEntry;
  topicTitle: string;
  previousUserMessage?: string;
  onCreateQuiz: () => void;
  onStartReverse: () => void;
  onSuggestDiagnostic: () => void;
  onQuizAnswered: (isCorrect: boolean) => void;
}

function isSummaryData(data: ConversationEntry["data"]): data is SummaryData {
  return Boolean(data && "sections" in data);
}

function isQuizData(data: ConversationEntry["data"]): data is QuizData {
  return Boolean(data && "questions" in data);
}

function isReverseBotData(data: ConversationEntry["data"]): data is ReverseBotData {
  return Boolean(data && "sessionShouldEnd" in data);
}

interface QuizProgress {
  answered: number;
  correct: number;
  lastMistake: string | null;
}

export function ConversationMessage({
  entry,
  topicTitle,
  previousUserMessage,
  onCreateQuiz,
  onStartReverse,
  onSuggestDiagnostic,
  onQuizAnswered,
}: ConversationMessageProps) {
  const [quizProgress, setQuizProgress] = useState<QuizProgress>({
    answered: 0,
    correct: 0,
    lastMistake: null,
  });

  if (entry.role === "user") {
    return <ChatBubble message={entry} />;
  }

  const { data } = entry;

  function handleQuizAnswer(question: string, isCorrect: boolean) {
    setQuizProgress((current) => ({
      answered: current.answered + 1,
      correct: current.correct + (isCorrect ? 1 : 0),
      lastMistake: isCorrect ? current.lastMistake : question,
    }));
    onQuizAnswered(isCorrect);
  }

  return (
    <div className="grid gap-3">
      {isSummaryData(data) ? (
        <SummaryCard
          title={`Ringkasan ${topicTitle}`}
          data={data}
          onCreateQuiz={onCreateQuiz}
          onStartReverse={onStartReverse}
        />
      ) : isQuizData(data) ? (
        <div className="grid gap-3.5">
          <ChatBubble message={entry} />
          {data.questions.map((question, index) => (
            <QuizCard
              key={`${question.question}-${index}`}
              question={question}
              number={index + 1}
              total={data.questions.length}
              onAnswered={(isCorrect) => handleQuizAnswer(question.question, isCorrect)}
            />
          ))}
          {quizProgress.answered === data.questions.length && (
            <QuizCard
              variant="result"
              correct={quizProgress.correct}
              total={data.questions.length}
              mistake={
                quizProgress.lastMistake ??
                "Semua soal terjawab dengan benar. Pertahankan!"
              }
            />
          )}
        </div>
      ) : isReverseBotData(data) ? (
        <ReverseBotBubble
          prompt={entry.content}
          answer={previousUserMessage ?? ""}
          data={data}
        />
      ) : (
        <ChatBubble message={entry} />
      )}

      {entry.shouldSuggestDiagnostic && (
        <button
          className="justify-self-start rounded-full border border-accent/45 bg-accent/10 px-3 py-2 text-[0.68rem] font-bold text-[#F3AD9B] transition-colors hover:bg-accent/20"
          type="button"
          onClick={onSuggestDiagnostic}
        >
          Coba &quot;Jelaskan ke saya&quot;
        </button>
      )}
    </div>
  );
}
