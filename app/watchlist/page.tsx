"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Header } from "@/components/header";
import { TickerMarquee } from "@/components/ticker";
import { BottomNavV2 } from "@/components/bottom-nav";
import { WatchlistProvider, useWatchlist } from "@/components/watchlist-context";
import { WatchlistContent, useWatchlistTotalCount } from "@/components/watchlist-content";
import { SortSheet } from "@/components/sort-sheet";
import { EditSheet } from "@/components/edit-sheet";
import { MoversContent } from "@/components/movers-content";
import { NewsContent } from "@/components/news-content";
import { AiInsightsContent } from "@/components/ai-insights-content";

const tabs = ["Watchlist", "AI Insights", "Movers", "News"] as const;
type Tab = (typeof tabs)[number];

function WatchlistPageInner() {
  const [activeTab, setActiveTab] = useState<Tab>("Watchlist");
  const { openSortSheet, openEditSheet } = useWatchlist();
  const totalCount = useWatchlistTotalCount();

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <Header />
      <TickerMarquee />

      {/* Tab Bar */}
      <div className="relative border-b border-border/40">
        <div className="no-scrollbar flex overflow-x-auto pl-1 pr-4 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative shrink-0 px-3 py-2.5 text-[15px] font-medium transition-colors ${
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground/60"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {tab}
                {tab === "Watchlist" && (
                  <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-muted px-1 text-[11px] font-semibold tabular-nums leading-none text-muted-foreground">
                    {totalCount}
                  </span>
                )}
              </span>
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <main className="no-scrollbar flex-1 overflow-y-auto">
        {activeTab === "Watchlist" ? (
          <WatchlistContent />
        ) : activeTab === "Movers" ? (
          <MoversContent />
        ) : activeTab === "News" ? (
          <NewsContent />
        ) : activeTab === "AI Insights" ? (
          <AiInsightsContent />
        ) : null}
      </main>

      <SortSheet />
      <EditSheet />
      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <WatchlistProvider>
      <WatchlistPageInner />
    </WatchlistProvider>
  );
}
