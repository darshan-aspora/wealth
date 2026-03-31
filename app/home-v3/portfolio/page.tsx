"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PortfolioOverview } from "@/app/portfolio/tabs/portfolio-overview";
import { HoldingsTab } from "@/app/portfolio/tabs/holdings";
import { OrdersTab } from "@/app/portfolio/tabs/orders";
import { PositionsTab } from "@/app/portfolio/tabs/positions";
import { RecurringTab } from "@/app/portfolio/tabs/recurring";
import { CollectionsTab } from "@/app/portfolio/tabs/collections";

const tabs = ["Portfolio", "Holdings", "Orders", "Positions", "Manage Recurring", "My Collections"] as const;
type Tab = (typeof tabs)[number];

export default function HomeV3Portfolio() {
  const [activeTab, setActiveTab] = useState<Tab>("Portfolio");

  return (
    <>
      {/* Tab bar */}
      <div className="relative border-b border-border/40">
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
      <div className="pt-4">
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
      </div>
    </>
  );
}
