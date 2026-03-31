"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { USMarketsTab } from "@/app/market/components/us-markets-tab";
import { GlobalMarketsTab } from "@/app/market/components/global-markets-tab";
import { IndiaTab } from "@/app/market/components/india-tab";
import { UKTab } from "@/app/market/components/uk-tab";
import { NewsTab } from "@/app/market/components/news-tab";
import { CryptoTab } from "@/app/market/components/crypto-tab";
import { CommodityTab } from "@/app/market/components/commodity-tab";
import { ForexTab } from "@/app/market/components/forex-tab";
import { UAETab } from "@/app/market/components/uae-tab";
import { VixTab } from "@/app/market/components/vix-tab";
import { SettingsTab } from "@/app/market/components/settings-tab";

const MARKET_TABS = ["US", "Global", "VIX", "India", "UK", "News", "Crypto", "Commodity", "Forex", "UAE", "Customize"] as const;
type MarketTab = (typeof MARKET_TABS)[number];

export default function HomeV3Market() {
  const [activeTab, setActiveTab] = useState<MarketTab>("US");

  return (
    <>
      {/* Tabs */}
      <div className="border-b border-border/40 bg-background">
        <div className="no-scrollbar overflow-x-auto">
          <div className="flex gap-0.5 px-5">
            {MARKET_TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative whitespace-nowrap py-2.5 text-[16px] font-semibold transition-colors",
                  i === 0 ? "pr-3" : "px-3",
                  activeTab === tab ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {tab === "Customize" ? (
                  <span className="inline-flex items-center gap-1">
                    <Settings size={14} />
                    {tab}
                  </span>
                ) : tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="v3-market-tab-indicator"
                    className={cn(
                      "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                      i === 0 ? "left-0" : "left-3"
                    )}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === "US" && <USMarketsTab />}
      {activeTab === "Global" && <GlobalMarketsTab />}
      {activeTab === "VIX" && <VixTab />}
      {activeTab === "India" && <IndiaTab />}
      {activeTab === "UK" && <UKTab />}
      {activeTab === "News" && <NewsTab />}
      {activeTab === "Crypto" && <CryptoTab />}
      {activeTab === "Commodity" && <CommodityTab />}
      {activeTab === "Forex" && <ForexTab />}
      {activeTab === "UAE" && <UAETab />}
      {activeTab === "Customize" && <SettingsTab />}
    </>
  );
}
