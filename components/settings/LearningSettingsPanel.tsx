"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { PanelHeading, SettingCopy } from "@/components/settings/SettingsPrimitives";
import type { TopicListItem, UserPreferences } from "@/types";

interface LearningSettingsPanelProps {
  preferences: UserPreferences;
  topics: TopicListItem[];
  onPreferencesChange: (preferences: UserPreferences) => void | Promise<void>;
}

const PRESET_QUESTION_COUNTS = [5, 10, 15, 20];
const CUSTOM_QUESTION_COUNT = "custom";
const MIN_QUESTION_COUNT = 1;
const MAX_QUESTION_COUNT = 20;

export function LearningSettingsPanel({
  preferences,
  topics,
  onPreferencesChange,
}: LearningSettingsPanelProps) {
  const [isCustomCount, setIsCustomCount] = useState(
    () => !PRESET_QUESTION_COUNTS.includes(preferences.defaultQuizQuestionCount),
  );

  const scoredTopics = topics.filter((topic) => topic.overallScore !== null);
  const averageScore = scoredTopics.length
    ? Math.round(
        scoredTopics.reduce((sum, topic) => sum + (topic.overallScore ?? 0), 0) /
          scoredTopics.length,
      )
    : null;

  function selectQuestionCount(value: string) {
    if (value === CUSTOM_QUESTION_COUNT) {
      setIsCustomCount(true);
      return;
    }

    setIsCustomCount(false);
    void onPreferencesChange({
      ...preferences,
      defaultQuizQuestionCount: Number(value),
    });
  }

  function changeCustomQuestionCount(value: string) {
    const parsed = Number(value);

    if (
      !Number.isInteger(parsed) ||
      parsed < MIN_QUESTION_COUNT ||
      parsed > MAX_QUESTION_COUNT
    ) {
      return;
    }

    void onPreferencesChange({ ...preferences, defaultQuizQuestionCount: parsed });
  }

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

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(230px,0.93fr)] items-center gap-[27px] border-b border-ink/[0.11] p-6 max-[850px]:grid-cols-1 max-[850px]:gap-[17px] max-md:p-[24px_17px]">
          <SettingCopy title="Jumlah soal per kuis" description="Pilih jumlah soal yang dipakai saat kamu memulai kuis baru." />
          <div className="grid w-full max-w-[220px] justify-self-end gap-2 max-[850px]:max-w-full max-[850px]:justify-self-start">
            <div className="relative">
              <select className="min-h-12 w-full appearance-none rounded-control border border-ink/25 bg-surface-bright px-[13px] py-[11px] pr-10 text-[0.8rem] text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/15" value={isCustomCount ? CUSTOM_QUESTION_COUNT : String(preferences.defaultQuizQuestionCount)} onChange={(event) => selectQuestionCount(event.target.value)}>
                {PRESET_QUESTION_COUNTS.map((count) => (
                  <option key={count} value={count}>{count} soal</option>
                ))}
                <option value={CUSTOM_QUESTION_COUNT}>Jumlah lain...</option>
              </select>
              <Icon name="chevron-down" className="pointer-events-none absolute right-3.5 top-1/2 size-[15px] -translate-y-1/2 text-ink-muted" />
            </div>
            {isCustomCount && (
              <div className="grid gap-1.5">
                <input
                  className="min-h-12 w-full rounded-control border border-ink/25 bg-surface-bright px-[13px] py-[11px] text-[0.8rem] text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
                  type="number"
                  min={MIN_QUESTION_COUNT}
                  max={MAX_QUESTION_COUNT}
                  inputMode="numeric"
                  aria-label="Jumlah soal custom"
                  value={preferences.defaultQuizQuestionCount}
                  onChange={(event) => changeCustomQuestionCount(event.target.value)}
                />
                <span className="text-[0.62rem] leading-[1.4] text-ink-muted">
                  Isi angka {MIN_QUESTION_COUNT}–{MAX_QUESTION_COUNT} soal.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-success/[0.08] px-6 py-4 max-md:px-[17px]">
          <span className="grid size-[29px] shrink-0 place-items-center rounded-[9px] border border-success/35 bg-success/15 text-[0.66rem] font-extrabold text-[#557961]">{topics.length}</span>
          <p className="m-0 text-[0.72rem] leading-[1.45] text-ink-muted">
            {topics.length === 0
              ? "Belum ada topik yang dipelajari."
              : averageScore === null
                ? `${topics.length} topik dipelajari, belum ada data pemahaman.`
                : `${topics.length} topik dipelajari, rata-rata pemahaman ${averageScore}% dari ${scoredTopics.length} topik yang sudah punya peta.`}
          </p>
        </div>
      </div>
    </section>
  );
}
