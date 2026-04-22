"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAI } from "@/contexts/ai-context";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { HeaderV3 } from "@/components/header";
import { TickerMarquee } from "@/components/ticker";
import { BottomNavV2 } from "@/components/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PortfolioOverview } from "./tabs/portfolio-overview";
import { HoldingsTab } from "./tabs/holdings";
import { PositionsTab } from "./tabs/positions";
import { OrdersTab } from "./tabs/orders";
import { BuyingPowerTab } from "./tabs/buying-power";
import { SipsTab } from "./tabs/sips";
import { CollectionsTab } from "./tabs/collections";
import { PnlTab } from "./tabs/pnl";
import { ReportsTab } from "./tabs/reports";

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const tabs = ["Overview", "Holdings", "Positions", "Orders", "Buying Power", "SIPs", "Collections", "P&L", "Reports"] as const;
type Tab = (typeof tabs)[number];

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const { setAISource } = useAI();
  useEffect(() => { setAISource({ type: "portfolio" }); }, [setAISource]);

  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAnalyse, setShowAnalyse] = useState(false);

  const scrollTabToCenter = useCallback((el: HTMLButtonElement) => {
    requestAnimationFrame(() => {
      const container = tabsRef.current;
      if (!container) return;
      const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowAnalyse(el.scrollTop > 80);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Reset button visibility when switching away from Overview
  useEffect(() => {
    if (activeTab !== "Overview") setShowAnalyse(false);
  }, [activeTab]);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Scrollable area — header & ticker scroll away, tabs stick */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar">
        <HeaderV3 />
        <TickerMarquee />

        {/* Sticky tab bar */}
        <div className="sticky top-0 z-20 border-b border-border/40 bg-background">
          <div ref={tabsRef} className="overflow-x-auto no-scrollbar">
            <div className="flex gap-2 px-5">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={(e) => { setActiveTab(tab); scrollTabToCenter(e.currentTarget); }}
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
                    <motion.span
                      layoutId="portfolio-tab-indicator"
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

        {/* Tab content */}
        <div className="pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "Overview" && <PortfolioOverview />}
              {activeTab === "Holdings" && <HoldingsTab />}
              {activeTab === "Positions" && <PositionsTab />}
              {activeTab === "Orders" && <OrdersTab />}
              {activeTab === "Buying Power" && <BuyingPowerTab />}
              {activeTab === "SIPs" && <SipsTab />}
              {activeTab === "Collections" && <CollectionsTab />}
              {activeTab === "P&L" && <PnlTab />}
              {activeTab === "Reports" && <ReportsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Analyse Portfolio button — Overview tab only */}
      <div
        className="absolute bottom-[calc(56px+env(safe-area-inset-bottom,0px)+30px)] left-0 right-0 flex justify-center pb-3 pointer-events-none z-30 transition-all duration-300"
        style={{ opacity: showAnalyse && activeTab === "Overview" ? 1 : 0, transform: showAnalyse && activeTab === "Overview" ? "translateY(0)" : "translateY(10px)" }}
      >
        <button className="pointer-events-auto flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-[15px] font-semibold text-background shadow-lg active:opacity-80 transition-opacity">
          Analyse Portfolio
        </button>
      </div>

      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}
