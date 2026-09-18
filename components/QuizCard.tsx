"use client";

import { useState } from "react";
import type { QuizAnswer, QuizQuestion } from "@/types";

interface QuizQuestionCardProps {
  question: QuizQuestion;
  number: number;
  total: number;
  initialAnswer?: QuizAnswer;
  onAnswered?: (isCorrect: boolean) => void;
}

interface QuizResultCardProps {
  correct: number;
  total: number;
  mistake: string;
}

type QuizCardProps =
  | ({ variant?: "question" } & QuizQuestionCardProps)
  | ({ variant: "result" } & QuizResultCardProps);

export function QuizCard(props: QuizCardProps) {
  if (props.variant === "result") {
    return <QuizResultCard {...props} />;
  }
  return <QuizQuestionCard {...props} />;
}

function QuizQuestionCard({
  question,
  number,
  total,
  initialAnswer,
  onAnswered,
}: QuizQuestionCardProps) {
  const [selected, setSelected] = useState<QuizAnswer | null>(initialAnswer ?? null);
  const [isAnswered, setIsAnswered] = useState(Boolean(initialAnswer));
  const options = Object.entries(question.options) as [QuizAnswer, string][];

  function submitAnswer() {
    if (!selected || isAnswered) return;
    setIsAnswered(true);
    onAnswered?.(selected === question.correct);
  }

  return (
    <article className={`rounded-[18px] border bg-surface p-[clamp(18px,3vw,24px)] text-ink shadow-[0_18px_42px_rgba(8,10,28,0.16)] ${isAnswered ? "border-success/55" : "border-ink/[0.14]"}`}>
      <div className="mb-[17px] flex items-center justify-between gap-3 text-[0.66rem] font-bold text-ink-muted">
        <span>{isAnswered ? "Feedback instan" : "Kuis materi ini"}</span>
        <span className="text-accent">Soal {number} dari {total}</span>
      </div>
      <h3 className="mb-[17px] max-w-[54ch] font-display text-[1.12rem] font-semibold leading-[1.3] tracking-[-0.03em]">
        {question.question}
      </h3>
      <div className="grid gap-2">
        {options.map(([letter, option]) => {
          const isCorrect = isAnswered && letter === question.correct;
          const isWrong = isAnswered && selected === letter && letter !== question.correct;
          return (
            <button
              key={letter}
              className={`grid w-full grid-cols-[26px_minmax(0,1fr)] items-center gap-2.5 rounded-[10px] border bg-surface-bright px-2.5 py-2.5 text-left text-[0.73rem] leading-[1.45] transition-colors ${isCorrect ? "border-success/70 bg-success/15" : isWrong ? "border-danger/65 bg-danger/10" : selected === letter ? "border-accent bg-accent/10" : "border-ink/[0.17] hover:border-accent hover:bg-accent/[0.08]"}`}
              type="button"
              disabled={isAnswered}
              aria-pressed={selected === letter}
              onClick={() => setSelected(letter)}
            >
              <span className={`grid size-[25px] place-items-center rounded-full border text-[0.66rem] font-bold ${isCorrect ? "border-success bg-success text-on-accent" : isWrong ? "border-danger bg-danger text-surface" : "border-ink/20 text-ink-muted"}`}>
                {letter}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
      {!isAnswered ? (
        <button
          className="mt-[17px] min-h-[37px] rounded-[9px] bg-bg px-[13px] py-2 text-[0.7rem] font-bold text-surface disabled:opacity-50"
          type="button"
          disabled={!selected}
          onClick={submitAnswer}
        >
          Jawab
        </button>
      ) : (
        <div className="mt-[17px] rounded-[10px] bg-success/15 px-[13px] py-3 text-[0.72rem] leading-[1.55] text-[#42644D]">
          <strong className="mb-[3px] block text-[0.74rem]">
            {selected === question.correct ? "Jawabanmu benar." : "Belum tepat, coba perhatikan pembahasannya."}
          </strong>
          {question.explanation}
        </div>
      )}
    </article>
  );
}

function QuizResultCard({ correct, total, mistake }: QuizResultCardProps) {
  return (
    <article className="rounded-[18px] border border-warning/55 bg-surface p-[clamp(18px,3vw,24px)] text-ink shadow-[0_18px_42px_rgba(8,10,28,0.16)]">
      <p className="mb-1.5 text-[0.63rem] font-bold text-accent">Sesi selesai</p>
      <h3 className="m-0 font-display text-[1.12rem] font-semibold tracking-[-0.03em]">Hasil kuis</h3>
      <div className="my-[5px] mb-[17px] flex items-baseline gap-2">
        <strong className="font-display text-[2.75rem] font-semibold leading-none tracking-[-0.06em] text-accent">
          {correct}/{total}
        </strong>
        <span className="text-[0.7rem] text-ink-muted">jawaban benar</span>
      </div>
      <ol className="m-0 grid list-none gap-2 p-0">
        <li className="grid grid-cols-[22px_minmax(0,1fr)] items-start gap-[9px] text-[0.72rem] leading-[1.45] text-ink-muted">
          <span className="grid size-[21px] place-items-center rounded-full bg-danger/12 text-[0.62rem] font-bold text-danger">1</span>
          <span><strong>Soal 4:</strong> {mistake}</span>
        </li>
      </ol>
    </article>
  );
}
