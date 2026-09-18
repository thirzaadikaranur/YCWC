"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { getTopics, TOPICS_CHANGED_EVENT } from "@/lib/api";
import { formatRelativeTime, initials } from "@/lib/format";
import type { UnderstandingLabel, TopicListItem } from "@/types";
import { Icon } from "@/components/Icon";

interface SidebarProps {
  isOpen: boolean;
  desktopOpen: boolean;
  activeTopicId?: string;
  onClose: () => void;
}

const indicatorClasses: Record<UnderstandingLabel | "none", string> = {
  hijau: "bg-success shadow-[0_0_0_3px_rgba(124,152,133,0.13)]",
  kuning: "bg-warning shadow-[0_0_0_3px_rgba(201,169,89,0.13)]",
  merah: "bg-danger shadow-[0_0_0_3px_rgba(193,68,60,0.13)]",
  none: "bg-surface/30 shadow-[0_0_0_3px_rgba(245,243,238,0.035)]",
};

export function Sidebar({ isOpen, desktopOpen, activeTopicId, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [topics, setTopics] = useState<TopicListItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    function loadTopics() {
      getTopics()
        .then((response) => {
          if (!cancelled) setTopics(response.topics);
        })
        .catch(() => {
          if (!cancelled) setTopics([]);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }

    loadTopics();
    window.addEventListener(TOPICS_CHANGED_EVENT, loadTopics);

    return () => {
      cancelled = true;
      window.removeEventListener(TOPICS_CHANGED_EVENT, loadTopics);
    };
  }, []);

  const filteredTopics = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return topics;
    return topics.filter((topic) => topic.title.toLowerCase().includes(term));
  }, [search, topics]);

  const profileActive = pathname.startsWith("/profil-belajar");

  return (
    <aside
      id="app-sidebar"
      className={`fixed bottom-0 left-0 top-[68px] z-40 flex w-[min(86vw,320px)] -translate-x-full flex-col border-r border-surface/10 bg-bg transition-transform duration-[220ms] ease-out md:w-[286px] ${isOpen ? "translate-x-0 shadow-[18px_0_42px_rgba(8,10,28,0.28)]" : ""} ${desktopOpen ? "md:translate-x-0" : "md:-translate-x-full"}`}
      aria-label="Navigasi ReverseTutor"
    >
      <div className="shrink-0 p-4 pb-3 pt-5">
        <Link
          href="/"
          onClick={onClose}
          className="flex min-h-[46px] items-center justify-center gap-2 rounded-control border border-transparent bg-accent px-3.5 py-2.5 text-[0.82rem] font-bold text-on-accent transition-colors hover:bg-accent-hover"
        >
          <Icon name="plus" className="size-[17px]" />
          <span>Topik Baru</span>
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin]">
        <nav
          className="mx-4 mb-[15px] grid grid-cols-2 gap-1 rounded-control border border-surface/10 bg-surface/[0.05] p-1"
          aria-label="Navigasi belajar"
        >
          <Link
            href="/"
            onClick={onClose}
            className={`min-h-[37px] rounded-control border border-transparent px-2 py-2 text-center text-[0.71rem] font-semibold transition-colors ${!profileActive ? "bg-surface/[0.11] text-surface" : "text-surface/60 hover:text-surface"}`}
            aria-current={!profileActive ? "page" : undefined}
          >
            Topik
          </Link>
          <Link
            href="/profil-belajar"
            onClick={onClose}
            className={`min-h-[37px] rounded-control border border-transparent px-2 py-2 text-center text-[0.71rem] font-semibold transition-colors ${profileActive ? "bg-surface/[0.11] text-surface" : "text-surface/60 hover:text-surface"}`}
            aria-current={profileActive ? "page" : undefined}
          >
            Profil Belajar
          </Link>
        </nav>

        <div className="mb-[21px] px-4">
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-surface/55" />
            <label className="sr-only" htmlFor="topic-search">
              Cari topik
            </label>
            <input
              className="min-h-[38px] w-full rounded-full border border-surface/[0.13] bg-surface/[0.055] py-2 pl-9 pr-3 text-[0.74rem] text-surface outline-none transition-colors placeholder:text-surface/[0.46] hover:border-surface/25 focus:border-accent focus:bg-surface/[0.08] focus:ring-4 focus:ring-accent/15"
              id="topic-search"
              type="search"
              placeholder="Cari topik"
              autoComplete="off"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <section className="px-2.5 pb-5" aria-labelledby="recent-topics-label">
          <span id="recent-topics-label" className="mb-2 block px-2 text-[0.66rem] font-semibold text-surface/[0.43]">
            Terbaru
          </span>
          {isLoading ? (
            <div className="space-y-2 px-2 py-2" aria-label="Memuat daftar topik">
              <div className="h-10 animate-pulse rounded-[13px] bg-surface/[0.06]" />
              <div className="h-10 animate-pulse rounded-[13px] bg-surface/[0.06]" />
            </div>
          ) : filteredTopics.length ? (
            <div className="grid gap-[3px]">
              {filteredTopics.map((topic) => {
                const isActive = topic.id === activeTopicId;
                const label = topic.overallLabel ?? "none";
                return (
                  <Link
                    key={topic.id}
                    href={`/topik/${topic.id}`}
                    onClick={onClose}
                    className={`grid w-full grid-cols-[8px_minmax(0,1fr)] gap-2.5 rounded-[13px] border px-2.5 py-2.5 text-left text-surface transition-colors ${isActive ? "border-surface/[0.08] bg-surface/[0.11]" : "border-transparent hover:border-surface/[0.08] hover:bg-surface/[0.07]"}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      className={`mt-[5px] size-[7px] rounded-full ${indicatorClasses[label]}`}
                      aria-label={
                        topic.overallLabel
                          ? `Pemahaman ${topic.overallLabel}`
                          : "Belum ada data pemahaman"
                      }
                    />
                    <span className="grid min-w-0 gap-[5px]">
                      <span className="truncate text-[0.76rem] font-semibold leading-[1.35]">
                        {topic.title}
                      </span>
                      <span className="flex items-center gap-[7px] text-[0.64rem] leading-none text-surface/[0.45]">
                        <span className="rounded-[5px] border border-surface/10 bg-surface/[0.055] px-1.5 py-1 text-[0.6rem] font-semibold text-surface/[0.66]">
                          {topic.sessionCount} sesi
                        </span>
                        <span>{formatRelativeTime(topic.lastAccessedAt)}</span>
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mx-2 text-[0.7rem] leading-[1.5] text-surface/[0.52]">
              Nggak ketemu. Coba kata kunci lain, atau mulai topik baru.
            </p>
          )}
        </section>

        {profileActive && (
          <div className="mx-4 rounded-control border border-surface/10 bg-surface/[0.055] p-3.5">
            <h2 className="mb-2 font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-surface">
              Profil Belajar
            </h2>
            <p className="m-0 text-[0.7rem] leading-[1.55] text-surface/[0.56]">
              Temuan lintas topik dirangkum di halaman ini supaya kamu bisa melihat pola belajarmu.
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-surface/[0.12] p-3.5 pb-4">
        <Link
          href="/settings"
          onClick={onClose}
          className="grid grid-cols-[32px_minmax(0,1fr)_20px] items-center gap-2.5 rounded-[13px] border border-transparent px-2 py-2.5 transition-colors hover:border-surface/[0.08] hover:bg-surface/[0.07]"
          aria-label="Buka pengaturan"
        >
          <span className="grid size-8 place-items-center rounded-full bg-accent text-[0.64rem] font-extrabold tracking-[0.02em] text-on-accent">
            {initials(user?.displayName ?? "Pelajar")}
          </span>
          <span className="grid min-w-0 gap-[3px]">
            <span className="truncate text-[0.72rem] font-bold leading-tight text-surface">
              {user?.displayName ?? "Pelajar"}
            </span>
            <span className="truncate text-[0.63rem] leading-tight text-surface/[0.48]">
              {user?.email ?? "Memuat akun..."}
            </span>
          </span>
          <Icon name="settings" className="size-[17px] text-surface/[0.57]" />
        </Link>
      </div>
    </aside>
  );
}
