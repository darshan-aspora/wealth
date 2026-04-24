"use client";

import { ScrollablePillTabs } from "@/components/ui/scrollable-pill-tabs";

export const STOCK_TABS = [
  "Overview",
  "Revenue",
  "Financials",
  "Options",
  "Technicals",
  "News",
  "Analyst Rating",
  "Ownership",
  "ETFs",
  "Events",
  "My Orders",
] as const;
export type StockTab = (typeof STOCK_TABS)[number];

interface StockTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs?: readonly string[];
  className?: string;
}

export function StockTabs({ activeTab, onTabChange, tabs = STOCK_TABS, className }: StockTabsProps) {
  return (
    <div className={className}>
      <ScrollablePillTabs
        items={tabs.map((tab) => ({ id: tab, label: tab }))}
        activeId={activeTab}
        onChange={onTabChange}
        layoutId="stock-tabs-pill"
        className="border-b border-border/60 bg-background"
        scrollerClassName="px-3 pb-3"
        itemClassName="min-h-[32px]"
        activeItemClassName="text-foreground"
        inactiveItemClassName="text-muted-foreground"
        activePillClassName="bg-[#e8e6e7]"
      />
    </div>
  );
}
