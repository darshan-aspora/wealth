"use client";

import { useRouter } from "next/navigation";
import { useRef, useCallback, useState } from "react";
import Image from "next/image";
import { X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { TickerMarquee } from "@/components/ticker";
import { SearchPlaceholder } from "@/components/header";
import { BottomNavV2 } from "@/components/bottom-nav";

import { HeaderHiddenContext } from "./header-context";

// ── Shared Layout ─────────────────────────────────────────────────────

export default function HomeV3Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
          <header className="flex items-center gap-1.5 pl-3 pr-3 py-3">
            <button
              onClick={() => router.push("/")}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted/50"
            >
              <X size={20} strokeWidth={2} />
            </button>

            <div
              onClick={() => router.push("/search")}
              className="relative mx-1 flex h-12 min-w-0 flex-1 cursor-pointer items-center rounded-full bg-muted/50 px-4"
            >
              <div className="min-w-0 flex-1 overflow-hidden text-[16px] text-muted-foreground">
                <SearchPlaceholder />
              </div>
            </div>

            <button
              onClick={() => router.push("/notifications")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted/50"
            >
              <Bell size={20} strokeWidth={1.8} />
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:scale-95 transition-transform ml-1"
            >
              <div className="h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src="/profile_dp.png"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
            </button>
          </header>

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
