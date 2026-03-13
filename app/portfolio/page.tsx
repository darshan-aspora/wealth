"use client";

import { useState, useEffect } from "react";
import { useAI } from "@/contexts/ai-context";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Header } from "@/components/header";
import { TickerMarquee } from "@/components/ticker";
import { BottomNavV2 } from "@/components/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PortfolioOverview } from "./tabs/portfolio-overview";
import { HoldingsTab } from "./tabs/holdings";
import { OrdersTab } from "./tabs/orders";
import { PositionsTab } from "./tabs/positions";
import { RecurringTab } from "./tabs/recurring";
import { CollectionsTab } from "./tabs/collections";

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const tabs = ["Portfolio", "Holdings", "Orders", "Positions", "Manage Recurring", "My Collections"] as const;
type Tab = (typeof tabs)[number];

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Portfolio");
  const { setAISource } = useAI();
  useEffect(() => { setAISource({ type: "portfolio" }); }, [setAISource]);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <Header />
      <TickerMarquee />

      {/* Tab bar */}
      <div className="relative border-b border-border/40">
        <div className="no-scrollbar flex overflow-x-auto px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative whitespace-nowrap px-3.5 py-3 text-[15px] font-medium transition-colors",
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="portfolio-tab-indicator"
                  className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <main className="no-scrollbar flex-1 overflow-y-auto pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "Portfolio" && <PortfolioOverview />}
            {activeTab === "Holdings" && <HoldingsTab />}
            {activeTab === "Orders" && <OrdersTab />}
            {activeTab === "Positions" && <PositionsTab />}
            {activeTab === "Manage Recurring" && <RecurringTab />}
            {activeTab === "My Collections" && <CollectionsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}
