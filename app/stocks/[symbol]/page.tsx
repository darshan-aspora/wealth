"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAI } from "@/contexts/ai-context";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { ALL_TICKERS, type TickerItem } from "@/components/ticker";

import { StockHeader } from "./components/stock-header";
import { StockHero } from "./components/stock-hero";
import { StockTabs, type StockTab } from "./components/stock-tabs";
import { BuySellBar } from "./components/buy-sell-bar";

// Tab: Overview
import { PositionCard } from "./components/position-card";
import { AIBriefingSection } from "./components/ai-briefing";
import { Performance } from "./components/performance";
import { KeyMetrics } from "./components/key-metrics";
import { SimilarStocks } from "./components/similar-stocks";
import AboutSection from "./components/about";
import { MarketDepth } from "./components/market-depth";

// Tab: Revenue
import RevenueTab from "./components/revenue";

// Tab: Financials
import { Financials } from "./components/financials";

// Tab: Options
import { OptionsPulse } from "./components/options-pulse";
import { OptionsChain } from "./components/options-chain";

// Tab: Analysis (Technical)
import { Technicals } from "./components/technicals";

// Tab: News
import { NewsEvents } from "./components/news-events";

// Tab: Analyst Rating
import { AnalystRatings } from "./components/analyst-ratings";

// Tab: Ownership
import { Ownership } from "./components/ownership";

// Tab: ETFs
import { ETFHoldings } from "./components/etf-holdings";

// Tab: Events
import EventsTab from "./components/events";

// Tab: My Orders
import MyOrdersTab from "./components/my-orders";

export default function StockDetailPage() {
  const router = useRouter();
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

  const { setAISource } = useAI();
  useEffect(() => {
    setAISource({ type: "stock-detail", symbol, name: ticker.name });
  }, [symbol, ticker.name, setAISource]);

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
        onCompare={() => {}}
        onSetAlert={() => router.push(`/stocks/${symbol}/alerts`)}
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
              <KeyMetrics symbol={symbol} />
              <Divider />
              <Performance symbol={symbol} />
              <Divider />
              <AboutSection symbol={symbol} name={ticker.name} />
              <Divider />
              <SimilarStocks symbol={symbol} />
              <Divider />
              <AIBriefingSection symbol={symbol} />
              <Divider />
              <MarketDepth symbol={symbol} currentPrice={ticker.price} />
            </div>
          )}

          {activeTab === "Revenue" && (
            <div>
              <RevenueTab symbol={symbol} />
            </div>
          )}

          {activeTab === "Financials" && (
            <div>
              <Financials symbol={symbol} />
            </div>
          )}

          {activeTab === "Options" && (
            <div>
              <OptionsPulse symbol={symbol} />
              <Divider />
              <OptionsChain symbol={symbol} currentPrice={ticker.price} />
            </div>
          )}

          {activeTab === "Analysis" && (
            <div>
              <Technicals symbol={symbol} />
            </div>
          )}

          {activeTab === "News" && (
            <div>
              <NewsEvents symbol={symbol} />
            </div>
          )}

          {activeTab === "Analyst Rating" && (
            <div>
              <AnalystRatings symbol={symbol} />
            </div>
          )}

          {activeTab === "Ownership" && (
            <div>
              <Ownership symbol={symbol} />
            </div>
          )}

          {activeTab === "ETFs" && (
            <div>
              <ETFHoldings symbol={symbol} />
            </div>
          )}

          {activeTab === "Events" && (
            <div>
              <EventsTab symbol={symbol} />
            </div>
          )}

          {activeTab === "My Orders" && (
            <div>
              <MyOrdersTab symbol={symbol} />
            </div>
          )}

          {/* Bottom padding for buy/sell bar */}
          <div className="h-20" />
        </div>
      </div>

      {/* Sticky Buy/Sell Bar */}
      <BuySellBar
        symbol={symbol}
        onBuy={() => {}}
        onSell={() => {}}
      />

      <HomeIndicator />
    </div>
  );
}

function Divider() {
  return <div className="mx-4 border-t border-border/30" />;
}
