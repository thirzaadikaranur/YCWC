"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { InsightCard } from "@/components/InsightCard";
import { getLearningProfile, refreshLearningProfile } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import type { GetLearningProfileResponse, LearningProfile } from "@/types";

export function ProfilePage() {
  const [response, setResponse] = useState<GetLearningProfileResponse | null>(null);
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getLearningProfile()
      .then((result) => {
        if (!cancelled) {
          setResponse(result);
          setProfile(result.profile);
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Gagal memuat profil belajar.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    if (!response?.enoughData || isRefreshing) return;
    setIsRefreshing(true);
    setError("");

    try {
      const result = await refreshLearningProfile();
      setProfile(result.profile);
      setResponse((current) => current ? { ...current, profile: result.profile } : current);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal memperbarui analisis.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  const isEmpty = !response || !response.enoughData || !profile;

  return (
    <AppShell>
      <section className="min-h-0 flex-1 overflow-y-auto px-[clamp(18px,6vw,80px)] pb-[72px] pt-[clamp(30px,6vw,68px)] [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin] max-md:px-4 max-md:pb-[50px] max-md:pt-[30px]" aria-labelledby="profile-title">
        <div className="mx-auto w-full max-w-[980px]">
          <header className="mb-[26px] flex items-end justify-between gap-7 max-md:block">
            <div>
              <h1 id="profile-title" className="mb-[11px] max-w-[12ch] font-display text-[clamp(2.45rem,6vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-surface max-md:text-[3rem]">Profil Belajar</h1>
              <p className="m-0 text-[0.74rem] leading-[1.5] text-surface/[0.55]">
                {profile ? `Terakhir diperbarui: ${formatRelativeTime(profile.generatedAt)}` : "Belum pernah diperbarui"}
              </p>
            </div>
            <button className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-control border border-transparent bg-accent px-4 py-[11px] text-[0.75rem] font-bold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50 max-md:mt-5 max-md:w-full" type="button" disabled={isEmpty || isRefreshing} aria-busy={isRefreshing} onClick={refresh}>
              {isRefreshing && <span className="size-3.5 animate-spin rounded-full border-2 border-on-accent/30 border-t-on-accent" />}
              {isRefreshing ? "Menganalisis..." : "Perbarui Analisis"}
            </button>
          </header>

          {error && (
            <p className="mb-5 rounded-control border border-danger/35 bg-danger/[0.08] px-3.5 py-2.5 text-[0.72rem] font-semibold text-[#F2B2A8]" role="alert">
              {error}
            </p>
          )}

          {isEmpty ? (
            <section className="grid min-h-[390px] place-items-center rounded-[18px] border border-surface/[0.12] bg-surface/[0.055] px-7 py-[42px] text-center" aria-labelledby="profile-empty-title">
              <div className="flex max-w-[43ch] flex-col items-center">
                <Icon name="spark" className="mb-[19px] size-[34px] text-accent" />
                <h2 id="profile-empty-title" className="mb-3 max-w-[17ch] font-display text-[clamp(1.65rem,4vw,2.25rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-surface">Belum ada cukup data untuk profil belajar.</h2>
                <p className="m-0 text-[0.77rem] leading-[1.65] text-surface/[0.58]">Selesaikan beberapa sesi &quot;Jelaskan ke Saya&quot; di topik yang berbeda-beda dulu. Setelah itu, aku bisa menemukan pola belajar yang berulang.</p>
                <button className="mt-[22px] min-h-[43px] rounded-control border border-surface/[0.14] bg-surface/[0.08] px-[15px] py-2.5 text-[0.72rem] font-bold text-surface/[0.43]" type="button" disabled>Perbarui Analisis</button>
              </div>
            </section>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
              {profile.insights.map((insight, index) => <InsightCard key={`${insight.title}-${index}`} insight={insight} index={index} />)}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
