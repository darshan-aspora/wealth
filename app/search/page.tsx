"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, X, Bookmark, Clock, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { useRotatingSuffix } from "@/components/header";
import { Button } from "@/components/ui/button";


// ─── Mock search data ────────────────────────────────────────────────
type SearchItem = {
  symbol: string;
  name: string;
  type: "Stock" | "Index" | "ETF" | "Option" | "Forex";
  price: number;
  change: number;
  changePct: number;
  exchange?: string;
  keywords?: string[];
  // Stock-specific
  marketCap?: string;
  capSize?: string;         // "Mega Cap" | "Large Cap" | "Mid Cap" | "Small Cap"
  pe?: number;
  sector?: string;
  divYield?: string;
  week52High?: number;
  week52Low?: number;
  // Index-specific
  components?: number;
  ytd?: number;
  return1Y?: number;
  return3Y?: number;
  // ETF-specific
  expenseRatio?: string;
  trackingError?: string;
  exitLoad?: string;
  aum?: string;
  // Option-specific
  iv?: number;
  volume?: string;
  openInterest?: string;
  expiry?: string;
  delta?: number;
  theta?: number;
  // Forex-specific
  bid?: number;
  ask?: number;
  spread?: string;
  session?: string;
};

const mockData: SearchItem[] = [
  // ─── Stocks ────────────────────────────────────────────────
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", price: 227.63, change: 3.42, changePct: 1.53, exchange: "NASDAQ", marketCap: "3.52T", capSize: "Mega Cap", pe: 29.4, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "Stock", price: 441.28, change: -2.15, changePct: -0.48, exchange: "NASDAQ", marketCap: "3.21T", capSize: "Mega Cap", pe: 35.2, sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "Stock", price: 178.92, change: 1.87, changePct: 1.06, exchange: "NASDAQ", marketCap: "2.18T", capSize: "Mega Cap", pe: 24.1, sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "Stock", price: 213.47, change: 4.23, changePct: 2.02, exchange: "NASDAQ", marketCap: "2.14T", capSize: "Mega Cap", pe: 58.7, sector: "Consumer Cyclical" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Stock", price: 134.70, change: 6.82, changePct: 5.33, exchange: "NASDAQ", marketCap: "3.24T", capSize: "Mega Cap", pe: 64.3, sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", type: "Stock", price: 612.35, change: -8.41, changePct: -1.35, exchange: "NASDAQ", marketCap: "1.56T", capSize: "Mega Cap", pe: 26.8, sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Stock", price: 342.18, change: 12.56, changePct: 3.81, exchange: "NASDAQ", marketCap: "792B", capSize: "Large Cap", pe: 112.5, sector: "Consumer Cyclical" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", type: "Stock", price: 248.90, change: 1.23, changePct: 0.50, exchange: "NYSE", marketCap: "698B", capSize: "Large Cap", pe: 12.4, sector: "Financial" },
  { symbol: "V", name: "Visa Inc.", type: "Stock", price: 312.45, change: -0.87, changePct: -0.28, exchange: "NYSE", marketCap: "580B", capSize: "Large Cap", pe: 31.2, sector: "Financial" },
  { symbol: "WMT", name: "Walmart Inc.", type: "Stock", price: 93.12, change: 0.64, changePct: 0.69, exchange: "NYSE", marketCap: "625B", capSize: "Large Cap", pe: 28.6, sector: "Consumer Defensive" },
  { symbol: "UNH", name: "UnitedHealth Group", type: "Stock", price: 524.80, change: -3.21, changePct: -0.61, exchange: "NYSE", marketCap: "484B", capSize: "Large Cap", pe: 21.3, sector: "Healthcare" },
  { symbol: "AVGO", name: "Broadcom Inc.", type: "Stock", price: 186.43, change: 5.17, changePct: 2.85, exchange: "NASDAQ", marketCap: "870B", capSize: "Large Cap", pe: 38.9, sector: "Technology" },
  { symbol: "COST", name: "Costco Wholesale", type: "Stock", price: 928.15, change: 4.32, changePct: 0.47, exchange: "NASDAQ", marketCap: "409B", capSize: "Large Cap", pe: 52.1, sector: "Consumer Defensive" },
  { symbol: "AMD", name: "Advanced Micro Devices", type: "Stock", price: 162.87, change: 3.94, changePct: 2.48, exchange: "NASDAQ", marketCap: "192B", capSize: "Large Cap", pe: 42.7, sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", type: "Stock", price: 891.24, change: -11.32, changePct: -1.25, exchange: "NASDAQ", marketCap: "401B", capSize: "Large Cap", pe: 46.3, sector: "Communication" },

  // ─── Indices ───────────────────────────────────────────────
  { symbol: "SPX", name: "S&P 500", type: "Index", price: 6021.63, change: 24.82, changePct: 0.41, ytd: 4.2, return1Y: 22.8, return3Y: 31.4, keywords: ["sp500", "s&p", "large cap", "aapl", "apple", "msft", "nvda"] },
  { symbol: "NDX", name: "NASDAQ 100", type: "Index", price: 21432.15, change: 127.56, changePct: 0.60, ytd: 5.8, return1Y: 28.4, return3Y: 38.2, keywords: ["nasdaq", "tech", "aapl", "apple", "msft", "nvda", "googl", "amzn", "meta"] },
  { symbol: "IXIC", name: "NASDAQ Composite", type: "Index", price: 19654.02, change: 98.44, changePct: 0.50, ytd: 4.9, return1Y: 26.1, return3Y: 33.5, keywords: ["nasdaq", "composite", "tech", "aapl", "apple"] },
  { symbol: "DJI", name: "Dow Jones Industrial", type: "Index", price: 44287.50, change: -82.34, changePct: -0.19, ytd: 2.1, return1Y: 16.3, return3Y: 22.8, keywords: ["dow", "blue chip", "aapl", "apple"] },
  { symbol: "RUT", name: "Russell 2000", type: "Index", price: 2287.43, change: 15.67, changePct: 0.69, ytd: 1.8, return1Y: 12.4, return3Y: 8.6, keywords: ["small cap", "russell"] },
  { symbol: "VIX", name: "CBOE Volatility Index", type: "Index", price: 14.82, change: -0.43, changePct: -2.82, keywords: ["volatility", "fear", "vix"] },
  { symbol: "SOX", name: "PHLX Semiconductor", type: "Index", price: 5284.31, change: 87.12, changePct: 1.68, ytd: 7.3, return1Y: 34.6, return3Y: 52.1, keywords: ["semiconductor", "chips", "nvda", "amd", "avgo"] },

  // ─── ETFs ──────────────────────────────────────────────────
  { symbol: "SPY", name: "SPDR S&P 500 ETF", type: "ETF", price: 601.42, change: 2.48, changePct: 0.41, exchange: "NYSE Arca", expenseRatio: "0.09%", trackingError: "0.01%", exitLoad: "Nil", aum: "560B", keywords: ["s&p", "sp500", "large cap", "aapl", "apple"] },
  { symbol: "QQQ", name: "Invesco QQQ Trust", type: "ETF", price: 521.87, change: 3.12, changePct: 0.60, exchange: "NASDAQ", expenseRatio: "0.20%", trackingError: "0.03%", exitLoad: "Nil", aum: "280B", keywords: ["nasdaq", "tech", "aapl", "apple", "nasdaq100"] },
  { symbol: "QQQM", name: "Invesco NASDAQ 100 ETF", type: "ETF", price: 214.35, change: 1.28, changePct: 0.60, exchange: "NASDAQ", expenseRatio: "0.15%", trackingError: "0.02%", exitLoad: "Nil", aum: "32B", keywords: ["nasdaq", "tech", "aapl", "apple", "nasdaq100"] },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", type: "ETF", price: 553.28, change: 2.27, changePct: 0.41, exchange: "NYSE Arca", expenseRatio: "0.03%", trackingError: "0.01%", exitLoad: "Nil", aum: "480B", keywords: ["s&p", "vanguard", "aapl", "apple"] },
  { symbol: "VTI", name: "Vanguard Total Stock Mkt", type: "ETF", price: 293.14, change: 1.35, changePct: 0.46, exchange: "NYSE Arca", expenseRatio: "0.03%", trackingError: "0.02%", exitLoad: "Nil", aum: "390B", keywords: ["total market", "vanguard", "aapl", "apple"] },
  { symbol: "XLK", name: "Technology Select Sector", type: "ETF", price: 228.47, change: 2.84, changePct: 1.26, exchange: "NYSE Arca", expenseRatio: "0.09%", trackingError: "0.02%", exitLoad: "Nil", aum: "72B", keywords: ["tech", "technology", "aapl", "apple", "msft"] },
  { symbol: "VGT", name: "Vanguard Information Tech", type: "ETF", price: 586.12, change: 7.24, changePct: 1.25, exchange: "NYSE Arca", expenseRatio: "0.10%", trackingError: "0.03%", exitLoad: "Nil", aum: "58B", keywords: ["tech", "vanguard", "aapl", "apple", "msft"] },
  { symbol: "IWM", name: "iShares Russell 2000", type: "ETF", price: 228.56, change: 1.58, changePct: 0.70, exchange: "NYSE Arca", expenseRatio: "0.19%", trackingError: "0.04%", exitLoad: "Nil", aum: "72B", keywords: ["small cap", "russell"] },
  { symbol: "DIA", name: "SPDR Dow Jones ETF", type: "ETF", price: 442.73, change: -0.82, changePct: -0.19, exchange: "NYSE Arca", expenseRatio: "0.16%", trackingError: "0.02%", exitLoad: "Nil", aum: "36B", keywords: ["dow", "blue chip", "aapl", "apple"] },
  { symbol: "ARKK", name: "ARK Innovation ETF", type: "ETF", price: 58.42, change: 1.23, changePct: 2.15, exchange: "NYSE Arca", expenseRatio: "0.75%", trackingError: "N/A", exitLoad: "Nil", aum: "6.8B", keywords: ["innovation", "disruptive", "ark"] },
  { symbol: "XLF", name: "Financial Select Sector", type: "ETF", price: 47.83, change: 0.31, changePct: 0.65, exchange: "NYSE Arca", expenseRatio: "0.09%", trackingError: "0.02%", exitLoad: "Nil", aum: "42B", keywords: ["financial", "banks"] },
  { symbol: "XLE", name: "Energy Select Sector", type: "ETF", price: 86.21, change: -0.94, changePct: -1.08, exchange: "NYSE Arca", expenseRatio: "0.09%", trackingError: "0.03%", exitLoad: "Nil", aum: "38B", keywords: ["energy", "oil", "gas"] },
  { symbol: "GLD", name: "SPDR Gold Shares", type: "ETF", price: 242.56, change: 1.87, changePct: 0.78, exchange: "NYSE Arca", expenseRatio: "0.40%", trackingError: "0.05%", exitLoad: "Nil", aum: "65B", keywords: ["gold", "commodity", "precious metals"] },
  { symbol: "ONEQ", name: "Fidelity NASDAQ Composite", type: "ETF", price: 68.92, change: 0.34, changePct: 0.50, exchange: "NASDAQ", expenseRatio: "0.21%", trackingError: "0.04%", exitLoad: "Nil", aum: "6.2B", keywords: ["nasdaq", "composite", "fidelity"] },

  // ─── Options ───────────────────────────────────────────────
  { symbol: "AAPL 250321C230", name: "AAPL Mar 21 230 Call", type: "Option", price: 4.85, change: 0.72, changePct: 17.43, exchange: "CBOE", iv: 28.4, volume: "12.4K", openInterest: "84.2K", expiry: "Mar 21", delta: 0.42, theta: -0.08, keywords: ["aapl", "apple", "call"] },
  { symbol: "AAPL 250321P220", name: "AAPL Mar 21 220 Put", type: "Option", price: 2.18, change: -0.54, changePct: -19.85, exchange: "CBOE", iv: 26.8, volume: "9.8K", openInterest: "62.1K", expiry: "Mar 21", delta: -0.35, theta: -0.07, keywords: ["aapl", "apple", "put"] },
  { symbol: "AAPL 250404C235", name: "AAPL Apr 4 235 Call", type: "Option", price: 6.12, change: 0.94, changePct: 18.15, exchange: "CBOE", iv: 30.1, volume: "8.2K", openInterest: "45.8K", expiry: "Apr 4", delta: 0.38, theta: -0.05, keywords: ["aapl", "apple", "call"] },
  { symbol: "AAPL 250404P215", name: "AAPL Apr 4 215 Put", type: "Option", price: 3.45, change: -0.62, changePct: -15.23, exchange: "CBOE", iv: 29.5, volume: "5.6K", openInterest: "38.4K", expiry: "Apr 4", delta: -0.30, theta: -0.04, keywords: ["aapl", "apple", "put"] },
  { symbol: "AAPL 250418C240", name: "AAPL Apr 18 240 Call", type: "Option", price: 7.84, change: 1.12, changePct: 16.67, exchange: "CBOE", iv: 31.2, volume: "6.4K", openInterest: "32.1K", expiry: "Apr 18", delta: 0.35, theta: -0.04, keywords: ["aapl", "apple", "call"] },
  { symbol: "TSLA 250328P340", name: "TSLA Mar 28 340 Put", type: "Option", price: 12.30, change: -2.15, changePct: -14.88, exchange: "CBOE", iv: 62.1, volume: "8.7K", openInterest: "42.5K", expiry: "Mar 28", delta: -0.48, theta: -0.15, keywords: ["tsla", "tesla", "put"] },
  { symbol: "NVDA 250404C140", name: "NVDA Apr 4 140 Call", type: "Option", price: 6.42, change: 1.83, changePct: 39.87, exchange: "CBOE", iv: 51.3, volume: "24.1K", openInterest: "112K", expiry: "Apr 4", delta: 0.45, theta: -0.10, keywords: ["nvda", "nvidia", "call"] },
  { symbol: "SPY 250321P600", name: "SPY Mar 21 600 Put", type: "Option", price: 3.18, change: -0.47, changePct: -12.88, exchange: "CBOE", iv: 15.2, volume: "45.8K", openInterest: "210K", expiry: "Mar 21", delta: -0.40, theta: -0.06, keywords: ["spy", "s&p", "put"] },
  { symbol: "META 250411C620", name: "META Apr 11 620 Call", type: "Option", price: 18.75, change: 3.24, changePct: 20.89, exchange: "CBOE", iv: 34.7, volume: "6.2K", openInterest: "28.9K", expiry: "Apr 11", delta: 0.50, theta: -0.12, keywords: ["meta", "call"] },
  { symbol: "QQQ 250328C525", name: "QQQ Mar 28 525 Call", type: "Option", price: 8.42, change: 1.15, changePct: 15.84, exchange: "CBOE", iv: 18.4, volume: "32.5K", openInterest: "156K", expiry: "Mar 28", delta: 0.48, theta: -0.08, keywords: ["qqq", "nasdaq", "call"] },
  { symbol: "QQQ 250328P515", name: "QQQ Mar 28 515 Put", type: "Option", price: 5.68, change: -0.82, changePct: -12.62, exchange: "CBOE", iv: 17.8, volume: "28.1K", openInterest: "142K", expiry: "Mar 28", delta: -0.38, theta: -0.07, keywords: ["qqq", "nasdaq", "put"] },

  // ─── Forex ─────────────────────────────────────────────────
  { symbol: "EUR/USD", name: "Euro / US Dollar", type: "Forex", price: 1.0842, change: 0.0023, changePct: 0.21, exchange: "FX", bid: 1.0841, ask: 1.0843, spread: "0.2 pip", session: "London", keywords: ["euro", "dollar", "eurusd", "eur", "usd", "forex", "fx"] },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", type: "Forex", price: 1.2715, change: -0.0018, changePct: -0.14, exchange: "FX", bid: 1.2714, ask: 1.2717, spread: "0.3 pip", session: "London", keywords: ["pound", "sterling", "cable", "gbp", "usd", "gbpusd", "forex", "fx"] },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", type: "Forex", price: 149.32, change: 0.45, changePct: 0.30, exchange: "FX", bid: 149.31, ask: 149.33, spread: "0.2 pip", session: "Tokyo", keywords: ["yen", "dollar", "usdjpy", "jpy", "usd", "forex", "fx"] },
  { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", type: "Forex", price: 0.8824, change: -0.0012, changePct: -0.14, exchange: "FX", bid: 0.8823, ask: 0.8826, spread: "0.3 pip", session: "Zurich", keywords: ["swiss", "franc", "usdchf", "chf", "usd", "forex", "fx"] },
  { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", type: "Forex", price: 0.6542, change: 0.0031, changePct: 0.48, exchange: "FX", bid: 0.6541, ask: 0.6543, spread: "0.2 pip", session: "Sydney", keywords: ["aussie", "australian", "audusd", "aud", "usd", "forex", "fx"] },
  { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", type: "Forex", price: 1.3578, change: -0.0024, changePct: -0.18, exchange: "FX", bid: 1.3577, ask: 1.3580, spread: "0.3 pip", session: "New York", keywords: ["loonie", "canadian", "usdcad", "cad", "usd", "forex", "fx"] },
  { symbol: "NZD/USD", name: "New Zealand Dollar / US Dollar", type: "Forex", price: 0.6128, change: 0.0015, changePct: 0.25, exchange: "FX", bid: 0.6127, ask: 0.6130, spread: "0.3 pip", session: "Wellington", keywords: ["kiwi", "new zealand", "nzdusd", "nzd", "usd", "forex", "fx"] },
  { symbol: "USD/INR", name: "US Dollar / Indian Rupee", type: "Forex", price: 82.84, change: -0.12, changePct: -0.14, exchange: "FX", bid: 82.83, ask: 82.86, spread: "3.0 pip", session: "Mumbai", keywords: ["rupee", "india", "usdinr", "inr", "usd", "forex", "fx"] },
];

// ─── Recently visited mock data ──────────────────────────────────────
const recentlyVisited: SearchItem[] = [
  mockData.find((i) => i.symbol === "NVDA")!,
  mockData.find((i) => i.symbol === "SPX")!,
  mockData.find((i) => i.symbol === "QQQ")!,
  mockData.find((i) => i.symbol === "TSLA")!,
  mockData.find((i) => i.symbol === "AAPL 250321C230")!,
  mockData.find((i) => i.symbol === "AMZN")!,
];

// ─── Popular / trending searches ─────────────────────────────────────
const popularSearches: SearchItem[] = [
  mockData.find((i) => i.symbol === "AAPL")!,
  mockData.find((i) => i.symbol === "META")!,
  mockData.find((i) => i.symbol === "SPY")!,
  mockData.find((i) => i.symbol === "AMD")!,
  mockData.find((i) => i.symbol === "EUR/USD")!,
  mockData.find((i) => i.symbol === "VIX")!,
  mockData.find((i) => i.symbol === "ARKK")!,
  mockData.find((i) => i.symbol === "NFLX")!,
];

// Map tab names to data types
const tabTypeMap: Record<string, string | null> = {
  All: null,
  Stocks: "Stock",
  Indices: "Index",
  ETFs: "ETF",
  Options: "Option",
  Forex: "Forex",
};

function filterResults(query: string, tab: string): SearchItem[] {
  const typeFilter = tabTypeMap[tab];
  const q = query.toLowerCase().trim();

  let results = mockData;

  if (typeFilter) {
    results = results.filter((item) => item.type === typeFilter);
  }

  if (q) {
    results = results.filter(
      (item) =>
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.exchange?.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.includes(q))
    );
  }

  return results;
}

// ─── Helpers ─────────────────────────────────────────────────────────
function typeLabel(type: SearchItem["type"]) {
  switch (type) {
    case "Stock": return "STOCK";
    case "Index": return "INDEX";
    case "ETF": return "ETF";
    case "Option": return "OPT";
    case "Forex": return "FX";
  }
}

// ─── Rotating placeholder — matches home header structure exactly ─────
function SearchPagePlaceholder() {
  const suffix = useRotatingSuffix();
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center text-[16px] text-muted-foreground/35">
      <span className="flex items-center leading-none">
        <span>Search</span>
        <span className="relative ml-[5px] inline-flex h-6 w-[170px] items-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={suffix}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="absolute left-0"
            >
              {suffix}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </span>
  );
}

// ─── Search Header ───────────────────────────────────────────────────
function SearchHeader({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="flex items-center gap-1.5 pl-3 pr-3 py-3">
      <Button
        variant="ghost"
        className="h-[42px] w-[42px] shrink-0 rounded-full text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft size={20} strokeWidth={2} />
      </Button>

      <div className="relative mx-1 flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-full bg-muted/50 px-4">
        <div className="relative h-full flex-1">
          {!query && <SearchPagePlaceholder />}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="relative z-10 h-full w-full bg-transparent text-[16px] text-foreground outline-none"
          />
        </div>

        {query && (
          <motion.button
            key="clear"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              onQueryChange("");
              inputRef.current?.focus();
            }}
            className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted-foreground/30"
          >
            <X size={14} strokeWidth={2.5} className="text-background" />
          </motion.button>
        )}
      </div>
    </header>
  );
}

// ─── Search Tabs ─────────────────────────────────────────────────────
const searchTabs = ["All", "Stocks", "Indices", "ETFs", "Options", "Forex"] as const;

function SearchTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto pl-5 py-3">
      {searchTabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`relative shrink-0 rounded-full px-4 py-2.5 text-[15px] font-medium transition-colors ${
              isActive
                ? "text-background"
                : "text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="search-tab"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Stats helper ────────────────────────────────────────────────────
function getStats(item: SearchItem): { label: string; value: string }[] {
  const s: { label: string; value: string }[] = [];
  if (item.type === "Stock") {
    if (item.capSize) s.push({ label: "", value: item.capSize });
    if (item.pe != null) s.push({ label: "PE", value: String(item.pe) });
    if (item.sector) s.push({ label: "", value: item.sector });
  } else if (item.type === "Index") {
    if (item.ytd != null) s.push({ label: "YTD", value: `${item.ytd > 0 ? "+" : ""}${item.ytd}%` });
    if (item.return1Y != null) s.push({ label: "1Y", value: `${item.return1Y > 0 ? "+" : ""}${item.return1Y}%` });
    if (item.return3Y != null) s.push({ label: "3Y", value: `${item.return3Y > 0 ? "+" : ""}${item.return3Y}%` });
  } else if (item.type === "ETF") {
    if (item.expenseRatio) s.push({ label: "ER", value: item.expenseRatio });
    if (item.trackingError) s.push({ label: "TE", value: item.trackingError });
    if (item.aum) s.push({ label: "AUM", value: item.aum });
  } else if (item.type === "Option") {
    if (item.iv != null) s.push({ label: "IV", value: `${item.iv}%` });
    if (item.delta != null) s.push({ label: "Delta", value: `${item.delta > 0 ? "+" : ""}${item.delta}` });
    if (item.theta != null) s.push({ label: "Theta", value: String(item.theta) });
    if (item.volume) s.push({ label: "Vol", value: item.volume });
    if (item.openInterest) s.push({ label: "OI", value: item.openInterest });
  } else if (item.type === "Forex") {
    if (item.bid != null) s.push({ label: "Bid", value: String(item.bid) });
    if (item.ask != null) s.push({ label: "Ask", value: String(item.ask) });
    if (item.spread) s.push({ label: "Spread", value: item.spread });
  }
  return s;
}

// ─── Shared sub-components ───────────────────────────────────────────
function LogoCircle({ symbol }: { symbol: string }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted/70">
      <span className="text-[15px] font-semibold text-foreground/80">
        {symbol.slice(0, 2)}
      </span>
    </div>
  );
}

function BookmarkBtn({
  symbol,
  isWatchlisted,
  onToggle,
}: {
  symbol: string;
  isWatchlisted: boolean;
  onToggle: (s: string) => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => onToggle(symbol)}
      className="flex h-10 w-10 shrink-0 items-center justify-center"
    >
      <motion.div
        animate={isWatchlisted ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {isWatchlisted ? (
          <Bookmark size={20} strokeWidth={0} fill="currentColor" className="text-foreground" />
        ) : (
          <Bookmark size={20} strokeWidth={1.8} className="text-muted-foreground/50" />
        )}
      </motion.div>
    </motion.button>
  );
}

function TypeBadge({ type }: { type: SearchItem["type"] }) {
  return (
    <span className="shrink-0 rounded bg-muted/70 px-2 py-1 text-[12px] font-medium leading-none text-muted-foreground">
      {typeLabel(type)}
    </span>
  );
}

function PriceBlock({ item }: { item: SearchItem }) {
  const changeColor = item.change >= 0 ? "text-emerald-500" : "text-red-500";
  return (
    <div className="shrink-0 text-right">
      <p className="text-[16px] font-semibold tabular-nums text-foreground">{item.price}</p>
      <p className={`text-[13px] font-medium tabular-nums ${changeColor}`}>
        {item.change >= 0 ? "+" : ""}{item.changePct.toFixed(2)}%
      </p>
    </div>
  );
}

// ─── Simple Result Row (All tab + empty state) ──────────────────────
function ResultRow({
  item,
  isWatchlisted,
  onToggleWatchlist,
  hideBookmark = false,
}: {
  item: SearchItem;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  hideBookmark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <LogoCircle symbol={item.symbol} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-left text-[16px] font-medium text-foreground leading-tight">{item.name}</p>
        <p className="text-left text-[14px] text-muted-foreground leading-tight mt-0.5">
          {item.symbol}
          {item.exchange && <span className="text-muted-foreground/40"> : {item.exchange}</span>}
        </p>
      </div>
      <PriceBlock item={item} />
      {!hideBookmark && <BookmarkBtn symbol={item.symbol} isWatchlisted={isWatchlisted} onToggle={onToggleWatchlist} />}
    </div>
  );
}

// ─── Detail Result Row (dedicated tabs — pill tags layout) ───────────
function DetailResultRow({
  item,
  isWatchlisted,
  onToggleWatchlist,
}: {
  item: SearchItem;
  isWatchlisted: boolean;
  onToggleWatchlist: (s: string) => void;
}) {
  const stats = getStats(item);
  return (
    <div className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        <LogoCircle symbol={item.symbol} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-medium text-foreground leading-tight">{item.name}</p>
          <p className="text-[14px] text-muted-foreground leading-tight mt-0.5">
            {item.symbol}
            {item.exchange && <span className="text-muted-foreground/40"> : {item.exchange}</span>}
          </p>
        </div>
        <PriceBlock item={item} />
        <BookmarkBtn symbol={item.symbol} isWatchlisted={isWatchlisted} onToggle={onToggleWatchlist} />
      </div>
      {stats.length > 0 && (
        <div className="mt-2 ml-[60px] flex flex-wrap gap-1.5">
          {stats.map((s) => (
            <span
              key={s.label + s.value}
              className="rounded-full border border-border/40 bg-muted/40 px-2.5 py-[3px] text-[11px] font-medium text-muted-foreground"
            >
              {s.label ? <>{s.label} <span className="text-foreground/70">{s.value}</span></> : <span className="text-foreground/70">{s.value}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Empty state: Recent + Popular widgets ──────────────────────────
function SearchEmptyState() {
  return (
    <div className="space-y-5 pt-3 pb-8">
      {/* Recent searches */}
      <div className="px-5">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Clock size={15} className="text-muted-foreground/50" />
          <h3 className="text-[14px] font-semibold tracking-wide uppercase text-muted-foreground/60">
            Recent
          </h3>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden divide-y divide-border/30">
          {recentlyVisited.map((item) => (
            <ResultRow
              key={item.symbol}
              item={item}
              isWatchlisted={false}
              onToggleWatchlist={() => {}}
              hideBookmark
            />
          ))}
        </div>
      </div>

      {/* Popular searches */}
      <div className="px-5">
        <div className="flex items-center gap-2 mb-2 px-1">
          <TrendingUp size={15} className="text-muted-foreground/50" />
          <h3 className="text-[14px] font-semibold tracking-wide uppercase text-muted-foreground/60">
            Popular
          </h3>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden divide-y divide-border/30">
          {popularSearches.map((item) => (
            <ResultRow
              key={item.symbol}
              item={item}
              isWatchlisted={false}
              onToggleWatchlist={() => {}}
              hideBookmark
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────
function WatchlistToast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed bottom-20 left-0 right-0 z-50 mx-auto w-fit rounded-full bg-foreground px-5 py-2.5 shadow-lg"
    >
      <p className="whitespace-nowrap text-[15px] font-medium text-background">
        {message}
      </p>
    </motion.div>
  );
}

// ─── Search Page ─────────────────────────────────────────────────────
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const results = filterResults(query, activeTab);
  const isDedicatedTab = activeTab !== "All";

  function handleTabChange(tab: string) {
    const oldIdx = searchTabs.indexOf(activeTab as (typeof searchTabs)[number]);
    const newIdx = searchTabs.indexOf(tab as (typeof searchTabs)[number]);
    setSwipeDirection(newIdx > oldIdx ? 1 : -1);
    setActiveTab(tab);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!touchRef.current || !query.trim()) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    const dt = Date.now() - touchRef.current.t;
    touchRef.current = null;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && dt < 400) {
      const idx = searchTabs.indexOf(activeTab as (typeof searchTabs)[number]);
      if (dx < 0 && idx < searchTabs.length - 1) {
        setSwipeDirection(1);
        setActiveTab(searchTabs[idx + 1]);
      } else if (dx > 0 && idx > 0) {
        setSwipeDirection(-1);
        setActiveTab(searchTabs[idx - 1]);
      }
    }
  }

  function toggleWatchlist(symbol: string) {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
        setToast(`${symbol} removed from watchlist`);
      } else {
        next.add(symbol);
        setToast(`${symbol} added to watchlist`);
      }
      return next;
    });

    setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <SearchHeader query={query} onQueryChange={setQuery} />
      {query.trim() && <SearchTabs active={activeTab} onChange={handleTabChange} />}
      <main
        className="no-scrollbar flex-1 overflow-y-auto"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {!query.trim() ? (
          <SearchEmptyState />
        ) : results.length > 0 ? (
          <motion.div
            key={activeTab}
            initial={{ x: swipeDirection * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="divide-y divide-border/40"
          >
            {results.map((item) =>
              isDedicatedTab ? (
                <DetailResultRow
                  key={item.symbol}
                  item={item}
                  isWatchlisted={watchlist.has(item.symbol)}
                  onToggleWatchlist={toggleWatchlist}
                />
              ) : (
                <ResultRow
                  key={item.symbol}
                  item={item}
                  isWatchlisted={watchlist.has(item.symbol)}
                  onToggleWatchlist={toggleWatchlist}
                />
              )
            )}
          </motion.div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6">
            <Search size={36} className="text-muted-foreground/20" />
            <p className="text-[15px] text-muted-foreground/50">
              No results found
            </p>
          </div>
        )}
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && <WatchlistToast message={toast} />}
      </AnimatePresence>

      <HomeIndicator />
    </div>
  );
}
