"use client";

import { useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { TickerMarquee } from "@/components/ticker";
import { HeaderV3 } from "@/components/header";
import { BottomNavV2 } from "@/components/bottom-nav";

import { HeaderHiddenContext } from "./header-context";

// ── Shared Layout ─────────────────────────────────────────────────────

export default function HomeV3Layout({ children }: { children: React.ReactNode }) {
  const { toggleTheme } = useTheme();
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollThreshold = 8;

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const st = e.currentTarget.scrollTop;
    const delta = st - lastScrollTop.current;

    if (delta > scrollThreshold && st > 60) {
      setHeaderHidden(true);
    } else if (delta < -scrollThreshold) {
      setHeaderHidden(false);
    }

    lastScrollTop.current = st;
  }, []);

  return (
    <HeaderHiddenContext.Provider value={headerHidden}>
      <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
        <StatusBar />

        {/* Hidden theme toggle — floating 12px tap zone, doesn't affect layout */}
        <div
          className="absolute top-0 left-0 right-0 h-3 z-50"
          onClick={toggleTheme}
          aria-hidden
        />

        {/* ── Collapsible Header + Ticker ────────────────────────────── */}
        <div
          className={cn(
            "transition-all duration-200 ease-in-out overflow-hidden",
            headerHidden ? "max-h-0 opacity-0" : "max-h-[200px] opacity-100"
          )}
        >
          <HeaderV3 />
          <TickerMarquee />
        </div>

        {/* ── Page Content ────────────────────────────────────────────── */}
        <main className="no-scrollbar flex-1 overflow-y-auto" onScroll={handleScroll}>
          {children}
        </main>

        {/* ── Bottom Nav ──────────────────────────────────────────────── */}
        <BottomNavV2 />
        <HomeIndicator />
      </div>
    </HeaderHiddenContext.Provider>
  );
}
