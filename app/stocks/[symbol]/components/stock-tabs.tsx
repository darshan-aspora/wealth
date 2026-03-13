"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const STOCK_TABS = [
  "Overview",
  "Revenue",
  "Financials",
  "Options",
  "Analysis",
  "News",
  "Analyst Rating",
  "Ownership",
  "ETFs",
  "Events",
  "My Orders",
] as const;
export type StockTab = (typeof STOCK_TABS)[number];

interface StockTabsProps {
  activeTab: StockTab;
  onTabChange: (tab: StockTab) => void;
}

export function StockTabs({ activeTab, onTabChange }: StockTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
  }, [activeTab]);

  return (
    <div className="border-b border-border/50">
      <div ref={scrollRef} className="no-scrollbar flex gap-0.5 overflow-x-auto px-3">
        {STOCK_TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              ref={active ? activeRef : undefined}
              onClick={() => onTabChange(tab)}
              className={cn(
                "relative shrink-0 whitespace-nowrap px-3 pb-3 pt-2 text-[14px] font-medium transition-colors",
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
