import type { LearningProfileInsight } from "@/types";

interface InsightCardProps {
  insight: LearningProfileInsight;
  index: number;
}

export function InsightCard({ insight, index }: InsightCardProps) {
  const strength = insight.type === "kekuatan";
  const warning = !strength && index % 2 === 1;
  return (
    <article className={`min-h-[205px] rounded-2xl border border-t-4 bg-surface p-[23px_23px_21px] text-ink shadow-[0_16px_38px_rgba(8,10,28,0.16)] ${strength ? "border-success" : warning ? "border-warning" : "border-danger"}`}>
      <span className={`inline-flex min-h-6 items-center rounded-md px-2 py-1 text-[0.59rem] font-extrabold ${strength ? "bg-success/15 text-[#557961]" : warning ? "bg-warning/15 text-[#826A2B]" : "bg-danger/12 text-[#963E38]"}`}>
        {strength ? "Kekuatan" : warning ? "Perlu dilatih" : "Perlu diperkuat"}
      </span>
      <h2 className="mb-[9px] mt-5 max-w-[20ch] font-display text-[1.38rem] font-semibold leading-[1.08] tracking-[-0.035em]">{insight.title}</h2>
      <p className="m-0 max-w-[47ch] text-[0.76rem] leading-[1.6] text-ink-muted">{insight.description}</p>
      <span className="mt-5 block text-[0.61rem] font-semibold text-ink/50">Dari sesi reverse teaching</span>
    </article>
  );
}
