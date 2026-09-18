"use client";

import type { ChatMode } from "@/types";
import { Icon } from "@/components/Icon";

interface WelcomeScreenProps {
  selectedMode: ChatMode | null;
  onSelectMode: (mode: ChatMode) => void;
}

const modes: { mode: ChatMode; label: string; featured?: boolean }[] = [
  { mode: "ringkasan", label: "Ringkas materi" },
  { mode: "kuis", label: "Buat kuis" },
  { mode: "reverse_bot", label: "Jelaskan ke saya", featured: true },
  { mode: "qa", label: "Tanya bebas" },
];

export function WelcomeScreen({ selectedMode, onSelectMode }: WelcomeScreenProps) {
  return (
    <section className="grid min-h-[calc(100dvh-68px)] place-items-center px-6 pb-[194px] pt-[30px] max-md:min-h-[calc(100dvh-68px)] max-md:px-[18px] max-md:pb-[190px] max-md:pt-6" aria-labelledby="welcome-title">
      <div className="flex w-full max-w-[720px] -translate-y-[2vh] flex-col items-center text-center max-md:-translate-y-[1vh]">
        <Icon name="spark" className="mb-[19px] size-[30px] text-accent" />
        <h1 id="welcome-title" className="m-0 max-w-[17ch] font-display text-[clamp(2.1rem,5vw,3.35rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-surface max-md:max-w-[14ch] max-md:text-[clamp(2rem,10vw,2.7rem)]">
          Ada yang mau kamu pelajari hari ini?
        </h1>
        <p className="mb-[27px] mt-[17px] max-w-[42ch] text-[0.83rem] leading-[1.55] text-surface/[0.56] max-md:mb-[23px] max-md:mt-[15px] max-md:text-[0.76rem]">
          Mulai dari materi, pertanyaan, atau cara menjelaskan versimu.
        </p>
        <div className="flex max-w-[620px] flex-wrap justify-center gap-2" role="group" aria-label="Mulai belajar dengan cepat">
          {modes.map((item) => {
            const selected = selectedMode === item.mode;
            const defaultStyle = item.featured
              ? "border-surface/30 bg-surface/[0.08] text-surface"
              : "border-surface/[0.16] bg-surface/[0.055] text-surface/80 hover:border-surface/30 hover:bg-surface/[0.11] hover:text-surface";
            const selectedStyle = selected
              ? "-translate-y-px border-accent bg-accent/10 text-[#F3AD9B] hover:bg-accent/18"
              : "";
            return (
              <button
                key={item.mode}
                className={`min-h-10 rounded-full border px-3.5 py-2 text-[0.74rem] font-semibold transition-colors ${defaultStyle} ${selectedStyle}`}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectMode(item.mode)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
