"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const STOCK_TABS = ["Overview", "Financials", "Analysis", "News", "Options"] as const;
export type StockTab = (typeof STOCK_TABS)[number];

interface StockTabsProps {
  activeTab: StockTab;
  onTabChange: (tab: StockTab) => void;
}

export function StockTabs({ activeTab, onTabChange }: StockTabsProps) {
  return (
    <div className="border-b border-border/50 px-4">
      <div className="no-scrollbar flex gap-1 overflow-x-auto">
        {STOCK_TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                "relative shrink-0 px-3 pb-3 pt-2 text-[15px] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {tab}
              {active && (
                <motion.div
                  layoutId="stock-tab-underline"
                  className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
