import { Icon } from "@/components/Icon";
import { PanelHeading, SettingCopy } from "@/components/settings/SettingsPrimitives";
import type { TopicListItem, UserPreferences } from "@/types";

interface LearningSettingsPanelProps {
  preferences: UserPreferences;
  topics: TopicListItem[];
  summaryEmpty: boolean;
  onPreferencesChange: (preferences: UserPreferences) => void | Promise<void>;
  onSummaryEmptyChange: (isEmpty: boolean) => void;
}

export function LearningSettingsPanel({
  preferences,
  topics,
  summaryEmpty,
  onPreferencesChange,
  onSummaryEmptyChange,
}: LearningSettingsPanelProps) {
  const averageScore = topics.length
    ? Math.round(topics.reduce((sum, topic) => sum + (topic.overallScore ?? 0), 0) / topics.length)
    : 0;

  return (
    <section role="tabpanel" aria-labelledby="learning-tab">
      <PanelHeading title="Kebiasaan belajar" description="Atur beberapa hal kecil agar sesi belajarmu terasa lebih pas." />
      <div className="overflow-hidden rounded-[17px] border border-ink/[0.15] bg-surface-bright shadow-[0_14px_30px_rgba(27,31,59,0.07)]">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(230px,0.93fr)] items-center gap-[27px] border-b border-ink/[0.11] p-6 max-[850px]:grid-cols-1 max-[850px]:gap-[17px] max-md:p-[24px_17px]">
          <SettingCopy title={'Tampilkan ajakan "Jelaskan ke Saya" untuk topik baru'} description="Kalau aktif, ReverseTutor akan mengajakmu menjelaskan topik baru dengan kata-katamu sendiri." />
          <label className="flex items-center justify-self-end gap-2.5 max-[850px]:justify-self-start">
            <input className="peer sr-only" type="checkbox" checked={preferences.showDiagnosticPrompt} onChange={(event) => void onPreferencesChange({ ...preferences, showDiagnosticPrompt: event.target.checked })} />
            <span className="relative block h-6 w-11 rounded-full border border-ink/[0.23] bg-[#D3D2CC] transition-colors peer-checked:border-accent peer-checked:bg-accent after:absolute after:left-px after:top-px after:size-5 after:rounded-full after:bg-surface-bright after:shadow-[0_1px_3px_rgba(27,31,59,0.25)] after:transition-transform peer-checked:after:translate-x-5" />
            <span className={`min-w-[53px] text-[0.68rem] font-bold ${preferences.showDiagnosticPrompt ? "text-[#557961]" : "text-ink-muted"}`}>{preferences.showDiagnosticPrompt ? "Aktif" : "Nonaktif"}</span>
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5 border-b border-ink/[0.11] bg-surface-muted/40 px-6 py-[13px] max-md:flex-col max-md:items-start max-md:px-[17px]">
          <span className="mr-auto text-[0.6rem] font-bold text-ink/50">Contoh state switch</span>
          <span className="inline-flex items-center gap-[7px] text-[0.6rem] font-bold text-ink-muted"><span className="relative block h-6 w-11 rounded-full border border-accent bg-accent after:absolute after:left-[21px] after:top-px after:size-5 after:rounded-full after:bg-surface-bright" /> ON</span>
          <span className="inline-flex items-center gap-[7px] text-[0.6rem] font-bold text-ink-muted"><span className="relative block h-6 w-11 rounded-full border border-ink/[0.23] bg-[#D3D2CC] after:absolute after:left-px after:top-px after:size-5 after:rounded-full after:bg-surface-bright" /> OFF</span>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(230px,0.93fr)] items-center gap-[27px] border-b border-ink/[0.11] p-6 max-[850px]:grid-cols-1 max-[850px]:gap-[17px] max-md:p-[24px_17px]">
          <SettingCopy title="Jumlah soal per kuis" description="Pilih jumlah soal yang dipakai saat kamu memulai kuis baru." />
          <div className="relative w-full max-w-[220px] justify-self-end max-[850px]:max-w-full max-[850px]:justify-self-start">
            <select className="min-h-12 w-full appearance-none rounded-control border border-ink/25 bg-surface-bright px-[13px] py-[11px] pr-10 text-[0.8rem] text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/15" value={preferences.defaultQuizQuestionCount} onChange={(event) => void onPreferencesChange({ ...preferences, defaultQuizQuestionCount: Number(event.target.value) })}>
              <option value={5}>5 soal</option><option value={10}>10 soal</option>
            </select>
            <Icon name="chevron-down" className="pointer-events-none absolute right-3.5 top-1/2 size-[15px] -translate-y-1/2 text-ink-muted" />
          </div>
        </div>
        <div className="flex items-center gap-3 border-b border-ink/[0.11] bg-success/[0.08] px-6 py-4 max-md:px-[17px]">
          <span className="grid size-[29px] shrink-0 place-items-center rounded-[9px] border border-success/35 bg-success/15 text-[0.66rem] font-extrabold text-[#557961]">{summaryEmpty ? "" : topics.length}</span>
          <p className="m-0 text-[0.72rem] leading-[1.45] text-ink-muted">{summaryEmpty ? "Belum ada topik yang dipelajari." : `${topics.length} topik dipelajari, rata-rata pemahaman ${averageScore}%`}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-ink/20 bg-surface-muted/55 px-6 py-3 max-md:flex-col max-md:items-start max-md:px-[17px]">
          <span className="text-[0.6rem] font-bold text-ink/55">Pratinjau ringkasan</span>
          <span className="inline-flex gap-[5px]">
            <button className={`min-h-[27px] rounded-[7px] border px-2 py-1 text-[0.59rem] font-bold ${!summaryEmpty ? "border-accent/60 bg-accent/10 text-ink" : "border-ink/20 text-ink-muted"}`} type="button" onClick={() => onSummaryEmptyChange(false)} aria-pressed={!summaryEmpty}>Berisi</button>
            <button className={`min-h-[27px] rounded-[7px] border px-2 py-1 text-[0.59rem] font-bold ${summaryEmpty ? "border-accent/60 bg-accent/10 text-ink" : "border-ink/20 text-ink-muted"}`} type="button" onClick={() => onSummaryEmptyChange(true)} aria-pressed={summaryEmpty}>Kosong</button>
          </span>
        </div>
      </div>
    </section>
  );
}
