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
import { PositionsTab } from "./tabs/positions";
import { OrdersTab } from "./tabs/orders";
import { BuyingPowerTab } from "./tabs/buying-power";
import { SipsTab } from "./tabs/sips";
import { AdvisoryTab } from "./tabs/advisory";
import { PnlTab } from "./tabs/pnl";
import { ReportsTab } from "./tabs/reports";

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const tabs = ["Overview", "Holdings", "Positions", "Orders", "Buying Power", "SIPs", "Advisory", "P&L", "Reports"] as const;
type Tab = (typeof tabs)[number];

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const { setAISource } = useAI();
  useEffect(() => { setAISource({ type: "portfolio" }); }, [setAISource]);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Scrollable area — header & ticker scroll away, tabs stick */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Header />
        <TickerMarquee />

        {/* Sticky tab bar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/40">
          <div className="no-scrollbar flex overflow-x-auto px-5">
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
              {activeTab === "Advisory" && <AdvisoryTab />}
              {activeTab === "P&L" && <PnlTab />}
              {activeTab === "Reports" && <ReportsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}
