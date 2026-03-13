"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Header } from "@/components/header";
import { TickerMarquee } from "@/components/ticker";
import { BottomNavV2 } from "@/components/bottom-nav";
import { cn } from "@/lib/utils";
import { USMarketsTab } from "./components/us-markets-tab";
import { GlobalMarketsTab } from "./components/global-markets-tab";
import { NewsTab } from "./components/news-tab";
import { IndiaTab } from "./components/india-tab";
import { UAETab } from "./components/uae-tab";
import { UKTab } from "./components/uk-tab";
import { SettingsTab } from "./components/settings-tab";

const MARKET_TABS = ["US Markets", "Global", "News", "India", "UAE", "UK", "Settings"] as const;
type MarketTab = (typeof MARKET_TABS)[number];

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<MarketTab>("US Markets");

  // Collapsible header on scroll
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollThreshold = 8;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const st = el.scrollTop;
      const delta = st - lastScrollTop.current;

      if (delta > scrollThreshold && st > 60) {
        setHeaderHidden(true);
      } else if (delta < -scrollThreshold) {
        setHeaderHidden(false);
      }

      lastScrollTop.current = st;
    },
    []
  );

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Collapsible header + ticker */}
      <div
        className={cn(
          "transition-all duration-200 ease-in-out overflow-hidden",
          headerHidden ? "max-h-0 opacity-0" : "max-h-[200px] opacity-100"
        )}
      >
        <Header />
        <TickerMarquee />
      </div>

      {/* Sticky top-level tabs */}
      <div className="border-b border-border/40 bg-background">
        <div className="no-scrollbar overflow-x-auto">
          <div className="flex gap-0.5 px-4">
            {MARKET_TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative whitespace-nowrap py-2.5 text-[16px] font-semibold transition-colors",
                  i === 0 ? "pr-3" : "px-3",
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="market-tab-indicator"
                    className={cn(
                      "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                      i === 0 ? "left-0" : "left-3"
                    )}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main
        className="no-scrollbar flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {activeTab === "US Markets" && <USMarketsTab />}
        {activeTab === "Global" && <GlobalMarketsTab />}
        {activeTab === "News" && <NewsTab />}
        {activeTab === "India" && <IndiaTab />}
        {activeTab === "UAE" && <UAETab />}
        {activeTab === "UK" && <UKTab />}
        {activeTab === "Settings" && <SettingsTab />}
      </main>

      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}
