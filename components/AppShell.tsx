"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AuthGate } from "@/components/AuthGate";
import { Sidebar } from "@/components/Sidebar";

interface AppShellProps {
  children: ReactNode;
  activeTopicId?: string;
  headerTitle?: string;
  panelOpen?: boolean;
  onTogglePanel?: () => void;
}

export function AppShell({
  children,
  activeTopicId,
  headerTitle,
  panelOpen,
  onTogglePanel,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = (matches: boolean) => setIsDesktop(matches);

    update(query.matches);
    const handleChange = (event: MediaQueryListEvent) => update(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  function toggleSidebar() {
    if (isDesktop) {
      setDesktopSidebarOpen((open) => !open);
      return;
    }
    setSidebarOpen((open) => !open);
  }

  return (
    <AuthGate>
      <div
        className="min-h-dvh bg-bg"
        style={{ "--sidebar-offset": desktopSidebarOpen ? "286px" : "0px" } as CSSProperties}
      >
        <AppHeader
          title={headerTitle}
          panelOpen={panelOpen}
          onTogglePanel={onTogglePanel}
          sidebarOpen={isDesktop ? desktopSidebarOpen : sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
        <Sidebar
          isOpen={sidebarOpen}
          desktopOpen={desktopSidebarOpen}
          activeTopicId={activeTopicId}
          onClose={() => setSidebarOpen(false)}
        />
        {sidebarOpen && (
          <button
            className="fixed inset-x-0 bottom-0 top-[68px] z-30 bg-[rgba(8,10,28,0.58)] md:hidden"
            type="button"
            aria-label="Tutup menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="relative flex min-h-[calc(100dvh-68px)] min-w-0 flex-col transition-[margin-left] duration-[220ms] ease-out md:ml-[var(--sidebar-offset)]">
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        </div>
      </div>
    </AuthGate>
  );
}
