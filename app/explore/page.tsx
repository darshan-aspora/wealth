"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAI } from "@/contexts/ai-context";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Header } from "@/components/header";
import { TickerMarquee } from "@/components/ticker";
import { BottomNavV2 } from "@/components/bottom-nav";
import {
  ExploreVersionProvider,
  useExploreVersion,
} from "./explore-version-context";
import { ExploreFTUX } from "./versions/ftux";
import { ExploreFundedNotTraded, ExploreFooter } from "./versions/funded-not-traded";
import { ETFFundedNotTraded } from "./versions/etf-funded-not-traded";
import { AdvisoryBaskets } from "./versions/advisory-baskets";
import { AlgoStrategies } from "./versions/algo-strategies";
import { cn } from "@/lib/utils";

type ExploreTab = "equity" | "etf" | "options" | "advisory" | "algo";

const exploreTabs: { id: ExploreTab; label: string }[] = [
  { id: "equity", label: "Stocks" },
  { id: "etf", label: "ETF" },
  { id: "options", label: "Options" },
  { id: "advisory", label: "Baskets" },
  { id: "algo", label: "Algo Strategies" },
];

function ExploreContent() {
  const { currentVersion } = useExploreVersion()!;

  const [activeTab, setActiveTab] = useState<ExploreTab>("equity");
  const prevTabRef = useRef<ExploreTab>("equity");
  const { setAISource } = useAI();

  useEffect(() => {
    const sourceMap: Record<ExploreTab, Parameters<typeof setAISource>[0]> = {
      equity: { type: "explore-stocks" },
      etf: { type: "explore-etf" },
      options: { type: "explore-options" },
      advisory: { type: "explore-baskets" },
      algo: { type: "explore-stocks" },
    };
    setAISource(sourceMap[activeTab]);
  }, [activeTab, setAISource]);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollThreshold = 8;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const st = el.scrollTop;
      const delta = st - lastScrollTop.current;

      if (delta > scrollThreshold && st > 60) {
        // scrolling down past 60px — hide header
        setHeaderHidden(true);
      } else if (delta < -scrollThreshold) {
        // scrolling up — show header
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

      {/* Sticky overflowing tabs */}
      <div className="border-b border-border/40 bg-background">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5">
            {exploreTabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "advisory") prevTabRef.current = activeTab;
                  setActiveTab(tab.id);
                }}
                className={cn(
                  "relative whitespace-nowrap py-2.5 text-[16px] font-semibold transition-colors",
                  i === 0 ? "pr-3" : "px-3",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="tab-underline"
                    className={cn(
                      "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                      i === 0 ? "left-0" : "left-3"
                    )}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="no-scrollbar flex-1 overflow-y-auto" onScroll={handleScroll}>
        {activeTab === "equity" && (
          <>
            {currentVersion === "ftux" && <ExploreFTUX />}
            {currentVersion === "not-funded" && (
              <div className="flex flex-1 items-center justify-center px-6 py-20">
                <p className="text-[16px] text-muted-foreground">Not Funded — coming soon</p>
              </div>
            )}
            {currentVersion === "funded-not-traded" && <ExploreFundedNotTraded />}
            <div className="px-5">
              <ExploreFooter />
            </div>
          </>
        )}
        {activeTab === "etf" && (
          <>
            {currentVersion === "ftux" && (
              <div className="flex flex-1 items-center justify-center px-6 py-20">
                <p className="text-[16px] text-muted-foreground">ETF FTUX — coming soon</p>
              </div>
            )}
            {currentVersion === "not-funded" && (
              <div className="flex flex-1 items-center justify-center px-6 py-20">
                <p className="text-[16px] text-muted-foreground">ETF Not Funded — coming soon</p>
              </div>
            )}
            {currentVersion === "funded-not-traded" && <ETFFundedNotTraded />}
          </>
        )}
        {activeTab === "options" && (
          <div className="flex flex-1 items-center justify-center px-6 py-20">
            <p className="text-[16px] text-muted-foreground">Options — coming soon</p>
          </div>
        )}
        {activeTab === "advisory" && (
          <AdvisoryBaskets onDismiss={() => setActiveTab(prevTabRef.current)} />
        )}
        {activeTab === "algo" && (
          <AlgoStrategies />
        )}
      </main>

      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <ExploreVersionProvider>
      <ExploreContent />
    </ExploreVersionProvider>
  );
}
