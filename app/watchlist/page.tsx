"use client";

import { Plus } from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Header } from "@/components/header";
import { TickerMarquee } from "@/components/ticker";
import { BottomNavV2 } from "@/components/bottom-nav";
import { WatchlistContent } from "./watchlist-full";

export default function WatchlistPage() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <Header />
      <TickerMarquee />
      <main className="no-scrollbar flex-1 overflow-y-auto">
        <WatchlistContent />
      </main>
      <button
        onClick={() => window.location.href = "/search"}
        className="absolute bottom-20 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-90"
      >
        <Plus size={22} strokeWidth={2} />
      </button>
      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}
