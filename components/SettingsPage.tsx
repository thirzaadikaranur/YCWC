"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { Icon } from "@/components/Icon";
import { AccountSettingsPanel, DeleteAccountDialog } from "@/components/settings/AccountSettingsPanel";
import { GeneralSettingsPanel } from "@/components/settings/GeneralSettingsPanel";
import { LearningSettingsPanel } from "@/components/settings/LearningSettingsPanel";
import { SettingsNav, type SettingsCategory } from "@/components/settings/SettingsNav";
import {
  deleteAccount,
  getPreferences,
  getTopics,
  updatePreferences,
} from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { TopicListItem, UserAccount, UserPreferences } from "@/types";

const fallbackUser: UserAccount = {
  displayName: "Pelajar",
  email: "",
  joinedAt: "—",
};

const PREFERENCES_SAVE_DELAY_MS = 500;

export function SettingsPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [category, setCategory] = useState<SettingsCategory>("general");
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [topics, setTopics] = useState<TopicListItem[]>([]);
  const [summaryEmpty, setSummaryEmpty] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getPreferences(), getTopics()])
      .then(([nextPreferences, topicResponse]) => {
        if (cancelled) return;
        setPreferences(nextPreferences);
        setTopics(topicResponse.topics);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStatus(error instanceof Error ? error.message : "Gagal memuat pengaturan.");
      });

    return () => {
      cancelled = true;
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, []);

  async function persistPreferences(nextPreferences: UserPreferences) {
    const previous = preferences;
    setStatus("");

    try {
      const saved = await updatePreferences(nextPreferences);
      setPreferences(saved);
    } catch (error) {
      setPreferences(previous);
      setStatus(error instanceof Error ? error.message : "Gagal menyimpan preferensi.");
    }
  }

  function queuePreferences(nextPreferences: UserPreferences) {
    setPreferences(nextPreferences);

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void persistPreferences(nextPreferences);
    }, PREFERENCES_SAVE_DELAY_MS);
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function resetPassword() {
    if (!user?.email) return;
    setStatus("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setStatus(
      error
        ? error.message
        : "Link untuk mengganti password sudah dikirim ke email akunmu.",
    );
  }

  async function confirmDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    setStatus("");

    try {
      await deleteAccount();
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal menghapus akun.");
      setIsDeleting(false);
    }
  }

  const displayName = preferences?.displayName ?? user?.displayName ?? fallbackUser.displayName;

  return (
    <AuthGate>
      <main className="relative min-h-dvh overflow-x-hidden bg-bg px-[clamp(16px,5vw,72px)] pb-[72px] pt-[clamp(28px,5vw,62px)] isolate before:absolute before:-right-[19%] before:-top-[28%] before:z-[-1] before:block before:aspect-square before:w-[min(54vw,680px)] before:rounded-full before:border before:border-surface/[0.07] before:content-[''] after:absolute after:-bottom-[20%] after:-left-[16%] after:z-[-1] after:block after:aspect-square after:w-[min(32vw,420px)] after:rounded-full after:border after:border-accent/[0.13] after:content-['']">
        <header className="mx-auto mb-7 flex w-full max-w-[1120px] items-end justify-between gap-7 max-md:items-start max-md:flex-col max-md:gap-5">
          <div>
            <p className="mb-2.5 text-[0.64rem] font-bold tracking-[0.15em] text-surface/[0.48]">PREFERENSI AKUN</p>
            <h1 className="m-0 font-display text-[clamp(2.7rem,6vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-surface">Pengaturan</h1>
          </div>
          <Link className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control border border-surface/[0.19] px-3.5 py-2.5 text-[0.74rem] font-bold text-surface/[0.82] transition-colors hover:bg-surface/[0.08] hover:text-surface max-md:w-full max-md:justify-center" href="/">
            <Icon name="arrow-left" className="size-4" />
            Kembali ke belajar
          </Link>
        </header>

        <section className="mx-auto grid min-h-[650px] w-full max-w-[1120px] grid-cols-[244px_minmax(0,1fr)] overflow-hidden rounded-card border border-surface/[0.17] bg-surface shadow-card max-[850px]:grid-cols-[208px_minmax(0,1fr)] max-md:block max-md:min-h-0" aria-label="Pengaturan ReverseTutor">
          <SettingsNav category={category} setCategory={setCategory} />
          <div className="min-w-0 overflow-hidden bg-surface p-[clamp(27px,5vw,52px)_clamp(20px,5vw,58px)_60px] text-ink max-md:p-[30px_17px_40px]">
            {category === "general" && (
              <GeneralSettingsPanel
                displayName={displayName}
                onDisplayNameChange={(nextDisplayName) => {
                  if (preferences) queuePreferences({ ...preferences, displayName: nextDisplayName });
                }}
              />
            )}
            {category === "learning" && preferences && (
              <LearningSettingsPanel
                preferences={preferences}
                topics={topics}
                summaryEmpty={summaryEmpty}
                onPreferencesChange={queuePreferences}
                onSummaryEmptyChange={setSummaryEmpty}
              />
            )}
            {category === "account" && (
              <AccountSettingsPanel
                user={user ?? fallbackUser}
                onResetPassword={resetPassword}
                onLogout={logout}
                onDelete={() => setDeleteOpen(true)}
              />
            )}
            {status && (
              <p className="mt-3 text-[0.68rem] leading-[1.5] text-ink-muted" role="status">{status}</p>
            )}
          </div>
        </section>

        <DeleteAccountDialog
          open={deleteOpen}
          email={user?.email ?? ""}
          onClose={() => setDeleteOpen(false)}
          onConfirm={confirmDelete}
        />
      </main>
    </AuthGate>
  );
}
