import type { Dispatch, SetStateAction } from "react";

export type SettingsCategory = "general" | "learning" | "account";

interface SettingsNavProps {
  category: SettingsCategory;
  setCategory: Dispatch<SetStateAction<SettingsCategory>>;
}

const categories: { id: SettingsCategory; name: string; note: string }[] = [
  { id: "general", name: "Umum", note: "Profil dasar" },
  { id: "learning", name: "Belajar", note: "Kebiasaan belajar" },
  { id: "account", name: "Akun", note: "Akses dan keamanan" },
];

export function SettingsNav({ category, setCategory }: SettingsNavProps) {
  return (
    <aside className="flex min-w-0 flex-col bg-bg p-[27px_17px_22px] text-surface max-md:border-b max-md:border-r-0 max-md:border-surface/[0.12] max-md:p-[22px_14px_14px]">
      <div>
        <p className="mx-2 mb-2 text-[0.61rem] font-bold tracking-[0.12em] text-surface/[0.43]">REVERSETUTOR</p>
        <h2 className="mx-2 font-display text-[1.35rem] font-semibold tracking-[-0.04em]">Preferensi</h2>
        <p className="mx-2 mt-[9px] text-[0.7rem] leading-[1.55] text-surface/50 max-md:hidden">Pilih bagian yang ingin kamu atur.</p>
      </div>
      <nav className="mt-[30px] grid gap-[5px] max-md:mt-0 max-md:flex max-md:gap-[5px] max-md:overflow-x-auto max-md:pb-0" role="tablist" aria-label="Kategori pengaturan">
        {categories.map((item, index) => {
          const active = category === item.id;
          return (
            <button
              key={item.id}
              className={`grid min-h-16 w-full grid-cols-[31px_minmax(0,1fr)] items-center gap-[9px] rounded-[13px] border px-[11px] py-2.5 text-left transition-colors max-md:min-w-[145px] max-md:min-h-[54px] max-md:grid-cols-[27px_minmax(0,1fr)] max-md:px-[9px] max-md:py-2 ${active ? "border-surface/[0.12] bg-surface/10 text-surface" : "border-transparent text-surface/[0.57] hover:border-surface/10 hover:bg-surface/[0.055] hover:text-surface"}`}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(item.id)}
            >
              <span className={`grid size-[29px] place-items-center rounded-[9px] border text-[0.6rem] font-bold max-md:size-[26px] ${active ? "border-accent/55 bg-accent/15 text-[#F3AD9B]" : "border-surface/[0.13] text-surface/[0.45]"}`}>
                0{index + 1}
              </span>
              <span className="grid min-w-0 gap-1">
                <span className="text-[0.75rem] font-bold leading-tight">{item.name}</span>
                <span className="text-[0.62rem] leading-tight text-surface/40 max-md:hidden">{item.note}</span>
              </span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-surface/[0.11] px-2.5 pt-[19px] max-md:hidden">
        <p className="m-0 text-[0.63rem] leading-[1.55] text-surface/[0.42]">Preferensi kecil bisa membuat sesi belajar terasa lebih pas.</p>
      </div>
    </aside>
  );
}
