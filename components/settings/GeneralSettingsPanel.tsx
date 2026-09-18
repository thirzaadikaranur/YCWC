import { initials } from "@/lib/format";
import { PanelHeading, SettingCopy } from "@/components/settings/SettingsPrimitives";

interface GeneralSettingsPanelProps {
  displayName: string;
  onDisplayNameChange: (displayName: string) => void;
}

export function GeneralSettingsPanel({ displayName, onDisplayNameChange }: GeneralSettingsPanelProps) {
  return (
    <section role="tabpanel" aria-labelledby="general-tab">
      <PanelHeading title="Umum" description="Atur nama dan bahasa yang dipakai ReverseTutor untuk menyapamu." />
      <div className="overflow-hidden rounded-[17px] border border-ink/[0.15] bg-surface-bright shadow-[0_14px_30px_rgba(27,31,59,0.07)]">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(230px,0.93fr)] items-center gap-[27px] p-6 max-[850px]:grid-cols-1 max-[850px]:gap-[17px] max-md:p-[24px_17px]">
          <SettingCopy title="Nama tampilan" description="Nama ini akan dipakai saat ReverseTutor menyapamu di ruang belajar." />
          <div className="grid w-full max-w-[480px] grid-cols-[48px_minmax(0,1fr)] items-center gap-3 justify-self-end max-[850px]:max-w-full max-[850px]:justify-self-start">
            <span className="grid size-12 place-items-center rounded-full bg-accent text-base font-extrabold tracking-[0.02em] text-on-accent shadow-[0_7px_16px_rgba(232,84,46,0.18)]">{initials(displayName)}</span>
            <input className="min-h-12 w-full rounded-control border border-ink/25 bg-surface-bright px-[13px] py-[11px] text-[0.82rem] text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/15" type="text" maxLength={60} value={displayName} onChange={(event) => onDisplayNameChange(event.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(230px,0.93fr)] items-center gap-[27px] border-t border-ink/[0.11] p-6 max-[850px]:grid-cols-1 max-[850px]:gap-[17px] max-md:p-[24px_17px]">
          <SettingCopy title="Bahasa antarmuka" description="Bahasa ReverseTutor saat ini tidak dapat diubah." />
          <div className="flex min-h-12 w-full max-w-[290px] items-center justify-self-end rounded-control border border-ink/[0.12] bg-surface-muted px-[13px] py-[11px] text-[0.8rem] text-ink-muted max-[850px]:max-w-full max-[850px]:justify-self-start">Bahasa Indonesia</div>
        </div>
      </div>
    </section>
  );
}
