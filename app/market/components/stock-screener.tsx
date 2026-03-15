"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Coins, Rocket, BarChart3, Gem, Target, Zap, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type ScreenerTab = "basic" | "premium" | "saved";

const screenerTabs: { id: ScreenerTab; label: string; disabled?: boolean }[] = [
  { id: "basic", label: "Popular" },
  { id: "premium", label: "Advanced" },
  { id: "saved", label: "Saved", disabled: true },
];

interface Screener {
  name: string;
  description: string;
  icon: LucideIcon;
  matchCount: number;
}

const basicScreeners: Screener[] = [
  { name: "High Margin", description: "Stocks with >30% profit margins", icon: TrendingUp, matchCount: 48 },
  { name: "Penny Stocks", description: "Under 5 with high volume", icon: Coins, matchCount: 124 },
  { name: "Value with Momentum", description: "Low P/E + positive price trend", icon: Rocket, matchCount: 35 },
  { name: "Nearing Breakout", description: "Within 5% of 52-week high", icon: TrendingUp, matchCount: 62 },
  { name: "Capex Expanders", description: "YoY capital spending growth >20%", icon: BarChart3, matchCount: 41 },
  { name: "Dividend Aristocrats", description: "25+ years of dividend growth", icon: Gem, matchCount: 67 },
];

const premiumScreeners: Screener[] = [
  { name: "Insider Accumulation", description: "Heavy insider buying last 90 days", icon: Target, matchCount: 23 },
  { name: "Short Squeeze Setup", description: "High short interest + rising price", icon: Zap, matchCount: 18 },
  { name: "Earnings Momentum", description: "3+ consecutive earnings beats", icon: TrendingUp, matchCount: 52 },
  { name: "Institutional Inflow", description: "Rising fund ownership + volume", icon: BarChart3, matchCount: 37 },
  { name: "Cash Rich & Undervalued", description: "Cash > market cap, low EV/EBITDA", icon: Gem, matchCount: 14 },
  { name: "Technical Reversal", description: "Oversold RSI + bullish divergence", icon: Rocket, matchCount: 29 },
];

export function StockScreener() {
  const [activeTab, setActiveTab] = useState<ScreenerTab>("basic");
  const screeners = activeTab === "basic" ? basicScreeners : premiumScreeners;

  return (
    <div>
      {/* Tabs */}
      <div className="mb-3 flex gap-2">
        {screenerTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              tab.disabled
                ? "border border-border/30 text-muted-foreground/40 cursor-not-allowed"
                : activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Screener list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="rounded-2xl border border-border/60 bg-card overflow-hidden"
        >
          {screeners.map((screener, i) => (
            <button
              key={screener.name}
              className={cn(
                "flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors active:bg-muted/30",
                i > 0 && "border-t border-border/30"
              )}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
                <screener.icon size={20} strokeWidth={1.7} className="text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground">{screener.name}</p>
                <p className="text-[12px] text-muted-foreground truncate">{screener.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[12px] font-medium text-muted-foreground tabular-nums">
                  {screener.matchCount} stocks
                </span>
                <ChevronRight size={14} className="text-muted-foreground/60" />
              </div>
            </button>
          ))}

          {/* Create New Screener */}
          <button className="flex w-full items-center justify-center gap-2 border-t border-dashed border-border/40 py-3 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
            <Plus size={16} />
            Create New Screener
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
