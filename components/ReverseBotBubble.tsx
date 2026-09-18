import type { ReverseBotData } from "@/types";

interface ReverseBotBubbleProps {
  prompt: string;
  answer: string;
  data: ReverseBotData;
}

export function ReverseBotBubble({ prompt, answer, data }: ReverseBotBubbleProps) {
  return (
    <div className="grid gap-[13px]">
      <p className="m-0 max-w-[88%] rounded-[5px_17px_17px_17px] border border-accent bg-accent/10 px-[17px] py-[15px] text-[0.79rem] leading-[1.65] text-surface/90">
        <strong className="mb-[5px] block text-[0.68rem] text-[#F3AD9B]">AI sedang menjadi murid</strong>
        {prompt}
      </p>
      <p className="m-0 ml-auto max-w-[82%] rounded-[15px_5px_15px_15px] bg-surface px-[15px] py-[13px] text-[0.78rem] leading-[1.6] text-ink">
        {answer}
      </p>
      {data.diagnosis && (
        <article className="rounded-[18px] border border-accent/50 bg-surface p-5 text-ink shadow-[0_18px_42px_rgba(8,10,28,0.16)]">
          <p className="mb-1.5 text-[0.63rem] font-bold text-accent">Diagnosis sesi</p>
          <h3 className="mb-1 font-display text-[1.2rem] font-semibold tracking-[-0.03em]">Ada bagian yang mulai jelas.</h3>
          <p className="mb-[17px] mt-0 text-[0.72rem] leading-[1.5] text-ink-muted">
            Dari cara kamu menjelaskan, ini bagian yang sudah kuat dan yang masih bisa diperdalam.
          </p>
          <div className="grid gap-2">
            {data.diagnosis.map((item) => {
              const strong = item.score >= 70;
              return (
                <div key={item.subTopic} className="grid grid-cols-[9px_minmax(0,1fr)_auto] items-center gap-[9px] border-t border-ink/10 py-[9px]">
                  <span className={`size-2 rounded-full ${strong ? "bg-success" : "bg-danger"}`} />
                  <span className="grid gap-[3px]">
                    <strong className="text-[0.73rem]">{item.subTopic}</strong>
                    <span className="text-[0.67rem] leading-[1.4] text-ink-muted">{item.note}</span>
                  </span>
                  <span className={`text-[0.75rem] font-extrabold ${strong ? "text-[#557961]" : "text-danger"}`}>
                    {item.score}%
                  </span>
                </div>
              );
            })}
          </div>
        </article>
      )}
    </div>
  );
}
