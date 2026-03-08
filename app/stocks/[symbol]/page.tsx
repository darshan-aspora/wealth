"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { ALL_TICKERS, type TickerItem } from "@/components/ticker";

import { StockHeader } from "./components/stock-header";
import { StockHero } from "./components/stock-hero";
import { StockTabs, type StockTab } from "./components/stock-tabs";
import { BuySellBar } from "./components/buy-sell-bar";

// Tab 1: Overview
import { PositionCard } from "./components/position-card";
import { AIBriefingSection } from "./components/ai-briefing";
import { Performance } from "./components/performance";
import { KeyMetrics } from "./components/key-metrics";
import { SimilarStocks } from "./components/similar-stocks";

// Tab 2: Financials
import { Financials } from "./components/financials";
import { Ownership } from "./components/ownership";
import { ETFHoldings } from "./components/etf-holdings";

// Tab 3: Analysis
import { AnalystRatings } from "./components/analyst-ratings";
import { Technicals } from "./components/technicals";
import { MarketDepth } from "./components/market-depth";

// Tab 4: News
import { NewsEvents } from "./components/news-events";

// Tab 5: Options
import { OptionsPulse } from "./components/options-pulse";
import { OptionsChain } from "./components/options-chain";

export default function StockDetailPage() {
  const params = useParams();
  const symbol = (params.symbol as string)?.toUpperCase() || "AAPL";

  // Find ticker data
  const ticker: TickerItem = ALL_TICKERS.find((t) => t.symbol === symbol) || {
    symbol,
    name: symbol,
    price: 100,
    change: 0,
    changePercent: 0,
    category: "watchlist",
    type: "Equity",
    logo: symbol.slice(0, 2),
    logoColor: "bg-neutral-600",
    exchange: "NASDAQ",
  };

  // State
  const [activeTab, setActiveTab] = useState<StockTab>("Overview");
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll tracking for header transformation
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const progress = Math.min(1, scrollTop / 200);
    setScrollProgress(progress);
  }, []);

  // Reset scroll when switching tabs
  useEffect(() => {
    // Don't reset main scroll — just the tab content
  }, [activeTab]);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <StockHeader
        ticker={ticker}
        scrollProgress={scrollProgress}
        isWatchlisted={isWatchlisted}
        onToggleWatchlist={() => setIsWatchlisted(!isWatchlisted)}
        onShare={() => {
          if (navigator.share) {
            navigator.share({ title: `${ticker.name} (${ticker.symbol})`, url: window.location.href });
          }
        }}
        onCompare={() => {/* TODO: Compare sheet */}}
        onSetAlert={() => {/* TODO: Alert sheet */}}
      />

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar flex-1 overflow-y-auto"
      >
        {/* Hero — always visible above tabs */}
        <StockHero ticker={ticker} />

        {/* Tabs */}
        <StockTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "Overview" && (
            <div>
              <PositionCard symbol={symbol} />
              <Divider />
              <AIBriefingSection symbol={symbol} />
              <Divider />
              <Performance symbol={symbol} />
              <Divider />
              <KeyMetrics symbol={symbol} />
              <Divider />
              <SimilarStocks symbol={symbol} />
            </div>
          )}

          {activeTab === "Financials" && (
            <div>
              <Financials symbol={symbol} />
              <Divider />
              <Ownership symbol={symbol} />
              <Divider />
              <ETFHoldings symbol={symbol} />
            </div>
          )}

          {activeTab === "Analysis" && (
            <div>
              <AnalystRatings symbol={symbol} />
              <Divider />
              <Technicals symbol={symbol} />
              <Divider />
              <MarketDepth symbol={symbol} currentPrice={ticker.price} />
            </div>
          )}

          {activeTab === "News" && (
            <div>
              <NewsEvents symbol={symbol} />
            </div>
          )}

          {activeTab === "Options" && (
            <div>
              <OptionsPulse symbol={symbol} />
              <Divider />
              <OptionsChain symbol={symbol} currentPrice={ticker.price} />
            </div>
          )}

          {/* Bottom padding for buy/sell bar */}
          <div className="h-20" />
        </div>
      </div>

      {/* Sticky Buy/Sell Bar */}
      <BuySellBar
        symbol={symbol}
        onBuy={() => {/* TODO: Buy sheet */}}
        onSell={() => {/* TODO: Sell sheet */}}
      />

      <HomeIndicator />
    </div>
  );
}

function Divider() {
  return <div className="mx-4 border-t border-border/30" />;
}
