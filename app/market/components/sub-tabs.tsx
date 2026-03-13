"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SubTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  layoutId: string;
}

export function SubTabs({ tabs, activeTab, onTabChange, layoutId }: SubTabsProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "relative shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors",
            activeTab === tab
              ? "text-background"
              : "text-muted-foreground bg-muted/40"
          )}
        >
          {activeTab === tab && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-full bg-foreground"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
}
