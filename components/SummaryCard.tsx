import type { SummaryData } from "@/types";

interface SummaryCardProps {
  title: string;
  data: SummaryData;
  onCreateQuiz: () => void;
  onStartReverse: () => void;
}

export function SummaryCard({
  title,
  data,
  onCreateQuiz,
  onStartReverse,
}: SummaryCardProps) {
  return (
    <article className="rounded-[18px] border border-surface/[0.14] bg-surface p-[clamp(19px,3vw,27px)] text-ink shadow-[0_18px_42px_rgba(8,10,28,0.16)]">
      <p className="mb-1.5 text-[0.63rem] font-bold text-accent">Ringkasan materi</p>
      <h2 className="m-0 font-display text-[1.55rem] font-semibold leading-[1.12] tracking-[-0.03em]">
        {title}
      </h2>
      {data.sections.map((section) => (
        <section key={section.heading} className="mt-[21px]">
          <h3 className="mb-1.5 font-display text-[0.97rem] font-semibold tracking-[-0.03em]">
            {section.heading}
          </h3>
          <ul className="m-0 grid gap-1.5 pl-[19px] text-[0.76rem] leading-[1.55] text-ink-muted">
            {section.points.map((point) => (
              <li key={point} className="marker:text-accent">
                {point}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <div className="mt-6 flex flex-wrap gap-2 border-t border-ink/[0.12] pt-[19px]">
        <button
          className="min-h-9 rounded-full border border-accent/45 bg-transparent px-3 py-2 text-[0.68rem] font-bold text-accent transition-colors hover:bg-accent hover:text-on-accent"
          type="button"
          onClick={onCreateQuiz}
        >
          Buat kuis dari ini
        </button>
        <button
          className="min-h-9 rounded-full border border-accent/45 bg-transparent px-3 py-2 text-[0.68rem] font-bold text-accent transition-colors hover:bg-accent hover:text-on-accent"
          type="button"
          onClick={onStartReverse}
        >
          Uji pemahamanku
        </button>
      </div>
    </article>
  );
}
