"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisPage } from "@/app/portfolio/components/analysis-page";
import { PortfolioOverview } from "@/app/portfolio/tabs/portfolio-overview";
import { HoldingsTab } from "@/app/portfolio/tabs/holdings";
import { PositionsTab } from "@/app/portfolio/tabs/positions";
import { OrdersTab } from "@/app/portfolio/tabs/orders";
import { BuyingPowerTab } from "@/app/portfolio/tabs/buying-power";
import { SipsTab } from "@/app/portfolio/tabs/sips";
import { AdvisoryTab } from "@/app/portfolio/tabs/advisory";
import { PnlTab } from "@/app/portfolio/tabs/pnl";
import { ReportsTab } from "@/app/portfolio/tabs/reports";

const tabs = ["Overview", "Holdings", "Positions", "Orders", "Buying Power", "SIPs", "Advisory", "P&L", "Reports"] as const;
type Tab = (typeof tabs)[number];

export default function HomeV3Portfolio() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [analysisOpen, setAnalysisOpen] = useState(false);

  return (
    <>
      {/* Tab bar — sticky on scroll */}
      <div className="sticky top-0 z-20 relative border-b border-border/40 bg-background">
        <div className="no-scrollbar flex overflow-x-auto px-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative whitespace-nowrap px-3.5 py-3 text-[15px] font-medium transition-colors",
                activeTab === tab ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="v3-portfolio-tab-indicator"
                  className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="pt-4 pb-20">
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

      {/* Floating Analyze Portfolio pill — Overview tab only */}
      {activeTab === "Overview" && <div className="sticky bottom-4 z-20 flex justify-center pb-2">
        <div
          onClick={() => setAnalysisOpen(true)}
          className="relative overflow-hidden rounded-full cursor-pointer active:scale-[0.97] transition-transform bg-foreground shadow-lg"
        >
          <div
            className="absolute inset-0 -translate-x-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
              animation: "shimmer 2.5s ease-in-out infinite",
            }}
          />
          <div className="relative flex items-center gap-2 py-2.5 px-5">
            <Sparkles size={14} strokeWidth={2} className="text-background" />
            <span className="text-[13px] font-semibold text-background">Analyze Portfolio</span>
          </div>
        </div>
      </div>}

      {/* Analysis overlay */}
      <AnimatePresence>
        {analysisOpen && <AnalysisPage onClose={() => setAnalysisOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
