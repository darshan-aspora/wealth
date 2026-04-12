"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { WatchlistContent } from "./watchlist-full";

export default function WatchlistPage() {
  const router = useRouter();
  const settingsRef = useRef<() => void>(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollTop = useRef(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const st = e.currentTarget.scrollTop;
    if (st > 60 && st > lastScrollTop.current) {
      setHeaderHidden(true);
    } else if (st < lastScrollTop.current) {
      setHeaderHidden(false);
    }
    lastScrollTop.current = st;
  }, []);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className={cn(
        "transition-all duration-200 ease-in-out overflow-hidden",
        headerHidden ? "max-h-0 opacity-0" : "max-h-[60px] opacity-100"
      )}>
        <header className="flex items-center px-3 py-3 gap-1">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-[17px] font-semibold text-foreground">Watchlist</h1>
          <button
            onClick={() => settingsRef.current?.()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
          >
            <SlidersHorizontal size={18} strokeWidth={1.8} />
          </button>
        </header>
      </div>

      <main className="no-scrollbar flex-1 overflow-y-auto" onScroll={handleScroll}>
        <WatchlistContent onSettingsRef={settingsRef} />
      </main>
      <HomeIndicator />
    </div>
  );
}
