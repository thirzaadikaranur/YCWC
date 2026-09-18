import type {
  GetScoreHistoryResponse,
  GetUnderstandingMapResponse,
  UnderstandingLabel,
} from "@/types";
import { Icon } from "@/components/Icon";

interface UnderstandingPanelProps {
  isOpen: boolean;
  map: GetUnderstandingMapResponse | null;
  history: GetScoreHistoryResponse["history"];
  onStartReverse: () => void;
  highlightedSubTopic?: string | null;
}

const statusCopy: Record<UnderstandingLabel, string> = {
  hijau: "Paham",
  kuning: "Perlu diulang",
  merah: "Perlu diperkuat",
};

const statusClasses: Record<UnderstandingLabel, string> = {
  hijau: "border-success/30 bg-success/[0.18] text-[#B3C8B8]",
  kuning: "border-warning/30 bg-warning/[0.17] text-[#E0C985]",
  merah: "border-danger/30 bg-danger/[0.18] text-[#F2B2A8]",
};

const entryClasses: Record<UnderstandingLabel, string> = {
  hijau: "border-surface/10",
  kuning: "border-warning/30",
  merah: "border-danger/30",
};

function sparklinePath(scores: number[]) {
  if (scores.length < 2) return "";
  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = Math.max(1, max - min);
  const width = 82;
  const height = 24;
  return scores
    .map((score, index) => {
      const x = 2 + (index * (width - 4)) / (scores.length - 1);
      const y = height - 3 - ((score - min) / range) * (height - 6);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function UnderstandingPanel({
  isOpen,
  map,
  history,
  onStartReverse,
  highlightedSubTopic,
}: UnderstandingPanelProps) {
  const entries = map?.entries ?? [];

  return (
    <aside
      id="understanding-panel"
      className={`z-30 shrink-0 overflow-hidden border-l border-surface/10 bg-border/[0.34] transition-[width,opacity,transform] duration-[260ms] ease-out max-md:fixed max-md:bottom-0 max-md:right-0 max-md:top-[68px] max-md:w-[min(89vw,360px)] max-md:shadow-[-18px_0_42px_rgba(8,10,28,0.28)] ${isOpen ? "w-[338px] opacity-100 max-md:translate-x-0" : "w-0 border-l-transparent opacity-0 max-md:translate-x-full"}`}
      aria-label="Peta Pemahaman"
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className="h-full w-[338px] overflow-y-auto px-[18px] pb-[34px] pt-6 [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin] max-md:w-full max-md:px-4 max-md:pb-7 max-md:pt-5">
        <div className="flex items-start justify-between gap-[15px] border-b border-surface/10 pb-[18px]">
          <div>
            <p className="mb-1.5 text-[0.65rem] font-bold text-surface/[0.48]">Peta Pemahaman</p>
            <h2 className="max-w-[18ch] font-display text-[1.24rem] font-semibold leading-[1.12] tracking-[-0.035em] text-surface">
              {map?.topicTitle ?? "Memuat topik..."}
            </h2>
          </div>
          <div className="grid shrink-0 justify-items-end gap-[3px]">
            <strong className="font-display text-[1.75rem] font-semibold leading-none tracking-[-0.05em] text-accent">
              {map?.overallScore == null ? "—" : `${map.overallScore}%`}
            </strong>
            <span className="text-right text-[0.58rem] text-surface/[0.45]">
              {entries.length ? `rata-rata ${entries.length} sub-topik` : "belum ada data"}
            </span>
          </div>
        </div>

        {entries.length ? (
          <div className="mt-[17px] grid gap-[9px]">
            {entries.map((entry) => {
              const points = history[entry.subTopic] ?? [];
              const path = sparklinePath(points.map((point) => point.score));
              const isHighlighted = highlightedSubTopic === entry.subTopic;
              return (
                <article
                  key={entry.subTopic}
                  className={`rounded-[13px] border bg-surface/[0.055] p-[13px] ${entryClasses[entry.label]} ${isHighlighted ? "animate-[map-highlight_600ms_ease-out]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <h3 className="m-0 text-[0.75rem] font-bold leading-[1.35] text-surface">
                      {entry.subTopic}
                    </h3>
                    <div className="grid shrink-0 justify-items-end gap-1">
                      <strong className="text-[0.8rem] leading-none text-surface">{entry.score}%</strong>
                      <span className={`rounded-[4px] border px-1.5 py-[3px] text-[0.55rem] font-bold ${statusClasses[entry.label]}`}>
                        {statusCopy[entry.label]}
                      </span>
                    </div>
                  </div>
                  <p className="my-2.5 text-[0.66rem] leading-[1.5] text-surface/[0.55]">
                    {entry.note ?? "Belum ada catatan dari sesi sebelumnya."}
                  </p>
                  <div className="flex min-h-[22px] items-center justify-between gap-2 border-t border-surface/[0.08] pt-[9px]">
                    <span className="text-[0.57rem] text-surface/[0.38]">Tren sesi</span>
                    {path ? (
                      <svg
                        className="h-6 w-[82px] overflow-visible"
                        viewBox="0 0 82 24"
                        fill="none"
                        role="img"
                        aria-label={`Tren skor ${entry.subTopic}`}
                      >
                        <path
                          d={path}
                          fill="none"
                          stroke={`var(--color-${entry.label === "hijau" ? "success" : entry.label === "kuning" ? "warning" : "danger"})`}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    ) : (
                      <span className="text-[0.58rem] text-surface/40">1 titik data</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid place-items-start px-[5px] pb-[15px] pt-[34px]">
            <Icon name="spark" className="mb-4 size-7 text-accent" />
            <h3 className="mb-2.5 max-w-[20ch] font-display text-[1.28rem] font-semibold leading-[1.12] tracking-[-0.035em] text-surface">
              Belum ada data pemahaman untuk topik ini.
            </h3>
            <p className="m-0 text-[0.72rem] leading-[1.6] text-surface/[0.58]">
              Coba mode &quot;Jelaskan ke saya&quot; biar aku tahu bagian mana yang perlu diperkuat.
            </p>
            <button
              className="mt-5 min-h-[38px] rounded-[9px] border border-accent bg-accent px-3 py-2 text-[0.69rem] font-bold text-on-accent transition-colors hover:bg-accent-hover"
              type="button"
              onClick={onStartReverse}
            >
              Jelaskan ke saya
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
