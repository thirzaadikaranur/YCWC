"use client";

import Image from "next/image";
import { Icon } from "@/components/Icon";

interface AppHeaderProps {
  title?: string;
  panelOpen?: boolean;
  onTogglePanel?: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function AppHeader({
  title,
  panelOpen = true,
  onTogglePanel,
  sidebarOpen,
  onToggleSidebar,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-surface/10 bg-bg px-4 sm:px-7">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          className="grid size-[34px] shrink-0 place-items-center rounded-[9px] text-surface/80 transition-colors hover:bg-surface/[0.08] hover:text-surface"
          type="button"
          aria-label={sidebarOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-controls="app-sidebar"
          aria-expanded={sidebarOpen}
          onClick={onToggleSidebar}
        >
          <Icon name="menu" className="size-[19px]" />
        </button>
        <Image
          className="size-[27px] rounded-[8px] border border-surface/10 object-cover"
          src="/Logo.png"
          alt=""
          width={27}
          height={27}
          priority
        />
        <span className="truncate font-display text-[1.02rem] font-semibold tracking-[-0.02em] text-surface/90">
          ReverseTutor
        </span>
      </div>

      {title && (
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="grid min-w-0 gap-0.5 text-right">
            <span className="hidden text-[0.59rem] leading-tight text-surface/45 sm:block">
              Topik aktif
            </span>
            <span className="max-w-[18ch] truncate font-display text-[0.82rem] font-semibold leading-tight tracking-[-0.025em] text-surface sm:max-w-[34ch] sm:text-base">
              {title}
            </span>
          </div>
          {onTogglePanel && (
            <button
              className="grid size-[34px] shrink-0 place-items-center rounded-[9px] text-surface/70 transition-colors hover:bg-surface/[0.06] hover:text-surface"
              type="button"
              aria-label={panelOpen ? "Tutup Peta Pemahaman" : "Buka Peta Pemahaman"}
              aria-controls="understanding-panel"
              aria-expanded={panelOpen}
              onClick={onTogglePanel}
            >
              <Icon name="panel" className="size-[17px]" />
            </button>
          )}
        </div>
      )}
    </header>
  );
}
