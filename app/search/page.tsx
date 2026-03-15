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
  // Stock-specific
  marketCap?: string;   // e.g. "3.52T"
  pe?: number;          // P/E ratio
  sector?: string;
  // ETF-specific
  expenseRatio?: string; // e.g. "0.09%"
  trackingError?: string; // e.g. "0.02%"
  aum?: string;          // Assets under management, e.g. "560B"
  // Option-specific
  iv?: number;           // implied volatility %
  volume?: string;       // e.g. "12.4K"
  openInterest?: string; // e.g. "84.2K"
  expiry?: string;       // e.g. "Mar 21"
};

const mockData: SearchItem[] = [
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", price: 227.63, change: 3.42, changePct: 1.53, exchange: "NASDAQ", marketCap: "3.52T", pe: 29.4, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "Stock", price: 441.28, change: -2.15, changePct: -0.48, exchange: "NASDAQ", marketCap: "3.21T", pe: 35.2, sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "Stock", price: 178.92, change: 1.87, changePct: 1.06, exchange: "NASDAQ", marketCap: "2.18T", pe: 24.1, sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "Stock", price: 213.47, change: 4.23, changePct: 2.02, exchange: "NASDAQ", marketCap: "2.14T", pe: 58.7, sector: "Consumer Cyclical" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Stock", price: 134.70, change: 6.82, changePct: 5.33, exchange: "NASDAQ", marketCap: "3.24T", pe: 64.3, sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", type: "Stock", price: 612.35, change: -8.41, changePct: -1.35, exchange: "NASDAQ", marketCap: "1.56T", pe: 26.8, sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Stock", price: 342.18, change: 12.56, changePct: 3.81, exchange: "NASDAQ", marketCap: "792B", pe: 112.5, sector: "Consumer Cyclical" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", type: "Stock", price: 248.90, change: 1.23, changePct: 0.50, exchange: "NYSE", marketCap: "698B", pe: 12.4, sector: "Financial" },
  { symbol: "V", name: "Visa Inc.", type: "Stock", price: 312.45, change: -0.87, changePct: -0.28, exchange: "NYSE", marketCap: "580B", pe: 31.2, sector: "Financial" },
  { symbol: "WMT", name: "Walmart Inc.", type: "Stock", price: 93.12, change: 0.64, changePct: 0.69, exchange: "NYSE", marketCap: "625B", pe: 28.6, sector: "Consumer Defensive" },
  { symbol: "UNH", name: "UnitedHealth Group", type: "Stock", price: 524.80, change: -3.21, changePct: -0.61, exchange: "NYSE", marketCap: "484B", pe: 21.3, sector: "Healthcare" },
  { symbol: "AVGO", name: "Broadcom Inc.", type: "Stock", price: 186.43, change: 5.17, changePct: 2.85, exchange: "NASDAQ", marketCap: "870B", pe: 38.9, sector: "Technology" },
  { symbol: "COST", name: "Costco Wholesale", type: "Stock", price: 928.15, change: 4.32, changePct: 0.47, exchange: "NASDAQ", marketCap: "409B", pe: 52.1, sector: "Consumer Defensive" },
  { symbol: "AMD", name: "Advanced Micro Devices", type: "Stock", price: 162.87, change: 3.94, changePct: 2.48, exchange: "NASDAQ", marketCap: "192B", pe: 42.7, sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", type: "Stock", price: 891.24, change: -11.32, changePct: -1.25, exchange: "NASDAQ", marketCap: "401B", pe: 46.3, sector: "Communication" },

  // Indices
  { symbol: "SPX", name: "S&P 500", type: "Index", price: 6021.63, change: 24.82, changePct: 0.41 },
  { symbol: "NDX", name: "NASDAQ 100", type: "Index", price: 21432.15, change: 127.56, changePct: 0.60 },
  { symbol: "DJI", name: "Dow Jones Industrial", type: "Index", price: 44287.50, change: -82.34, changePct: -0.19 },
  { symbol: "RUT", name: "Russell 2000", type: "Index", price: 2287.43, change: 15.67, changePct: 0.69 },
  { symbol: "VIX", name: "CBOE Volatility Index", type: "Index", price: 14.82, change: -0.43, changePct: -2.82 },

  // ETFs
  { symbol: "SPY", name: "SPDR S&P 500 ETF", type: "ETF", price: 601.42, change: 2.48, changePct: 0.41, exchange: "NYSE Arca", expenseRatio: "0.09%", trackingError: "0.01%", aum: "560B" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", type: "ETF", price: 521.87, change: 3.12, changePct: 0.60, exchange: "NASDAQ", expenseRatio: "0.20%", trackingError: "0.03%", aum: "280B" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", type: "ETF", price: 553.28, change: 2.27, changePct: 0.41, exchange: "NYSE Arca", expenseRatio: "0.03%", trackingError: "0.01%", aum: "480B" },
  { symbol: "VTI", name: "Vanguard Total Stock Mkt", type: "ETF", price: 293.14, change: 1.35, changePct: 0.46, exchange: "NYSE Arca", expenseRatio: "0.03%", trackingError: "0.02%", aum: "390B" },
  { symbol: "IWM", name: "iShares Russell 2000", type: "ETF", price: 228.56, change: 1.58, changePct: 0.70, exchange: "NYSE Arca", expenseRatio: "0.19%", trackingError: "0.04%", aum: "72B" },
  { symbol: "DIA", name: "SPDR Dow Jones ETF", type: "ETF", price: 442.73, change: -0.82, changePct: -0.19, exchange: "NYSE Arca", expenseRatio: "0.16%", trackingError: "0.02%", aum: "36B" },
  { symbol: "ARKK", name: "ARK Innovation ETF", type: "ETF", price: 58.42, change: 1.23, changePct: 2.15, exchange: "NYSE Arca", expenseRatio: "0.75%", trackingError: "N/A", aum: "6.8B" },
  { symbol: "XLF", name: "Financial Select Sector", type: "ETF", price: 47.83, change: 0.31, changePct: 0.65, exchange: "NYSE Arca", expenseRatio: "0.09%", trackingError: "0.02%", aum: "42B" },
  { symbol: "XLE", name: "Energy Select Sector", type: "ETF", price: 86.21, change: -0.94, changePct: -1.08, exchange: "NYSE Arca", expenseRatio: "0.09%", trackingError: "0.03%", aum: "38B" },
  { symbol: "GLD", name: "SPDR Gold Shares", type: "ETF", price: 242.56, change: 1.87, changePct: 0.78, exchange: "NYSE Arca", expenseRatio: "0.40%", trackingError: "0.05%", aum: "65B" },

  // Options
  { symbol: "AAPL 250321C230", name: "AAPL Mar 21 230 Call", type: "Option", price: 4.85, change: 0.72, changePct: 17.43, exchange: "CBOE", iv: 28.4, volume: "12.4K", openInterest: "84.2K", expiry: "Mar 21" },
  { symbol: "TSLA 250328P340", name: "TSLA Mar 28 340 Put", type: "Option", price: 12.30, change: -2.15, changePct: -14.88, exchange: "CBOE", iv: 62.1, volume: "8.7K", openInterest: "42.5K", expiry: "Mar 28" },
  { symbol: "NVDA 250404C140", name: "NVDA Apr 4 140 Call", type: "Option", price: 6.42, change: 1.83, changePct: 39.87, exchange: "CBOE", iv: 51.3, volume: "24.1K", openInterest: "112K", expiry: "Apr 4" },
  { symbol: "SPY 250321P600", name: "SPY Mar 21 600 Put", type: "Option", price: 3.18, change: -0.47, changePct: -12.88, exchange: "CBOE", iv: 15.2, volume: "45.8K", openInterest: "210K", expiry: "Mar 21" },
  { symbol: "META 250411C620", name: "META Apr 11 620 Call", type: "Option", price: 18.75, change: 3.24, changePct: 20.89, exchange: "CBOE", iv: 34.7, volume: "6.2K", openInterest: "28.9K", expiry: "Apr 11" },
  { symbol: "AMZN 250328C220", name: "AMZN Mar 28 220 Call", type: "Option", price: 5.60, change: 0.95, changePct: 20.43, exchange: "CBOE", iv: 32.8, volume: "9.4K", openInterest: "55.1K", expiry: "Mar 28" },
  { symbol: "GOOGL 250404P175", name: "GOOGL Apr 4 175 Put", type: "Option", price: 4.12, change: -0.68, changePct: -14.17, exchange: "CBOE", iv: 29.6, volume: "5.1K", openInterest: "38.7K", expiry: "Apr 4" },
  { symbol: "AMD 250321C170", name: "AMD Mar 21 170 Call", type: "Option", price: 2.94, change: 0.51, changePct: 20.99, exchange: "CBOE", iv: 48.2, volume: "18.3K", openInterest: "92.4K", expiry: "Mar 21" },
];

// ─── Recently visited mock data (6 items) ────────────────────────────
const recentlyVisited: SearchItem[] = [
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Stock", price: 134.70, change: 6.82, changePct: 5.33, exchange: "NASDAQ", marketCap: "3.24T", pe: 64.3, sector: "Technology" },
  { symbol: "SPX", name: "S&P 500", type: "Index", price: 6021.63, change: 24.82, changePct: 0.41 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", type: "ETF", price: 521.87, change: 3.12, changePct: 0.60, exchange: "NASDAQ", expenseRatio: "0.20%", trackingError: "0.03%", aum: "280B" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Stock", price: 342.18, change: 12.56, changePct: 3.81, exchange: "NASDAQ", marketCap: "792B", pe: 112.5, sector: "Consumer Cyclical" },
  { symbol: "AAPL 250321C230", name: "AAPL Mar 21 230 Call", type: "Option", price: 4.85, change: 0.72, changePct: 17.43, exchange: "CBOE", iv: 28.4, volume: "12.4K", openInterest: "84.2K", expiry: "Mar 21" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "Stock", price: 213.47, change: 4.23, changePct: 2.02, exchange: "NASDAQ", marketCap: "2.14T", pe: 58.7, sector: "Consumer Cyclical" },
];

// ─── Popular / trending searches ─────────────────────────────────────
const popularSearches: SearchItem[] = [
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", price: 227.63, change: 3.42, changePct: 1.53, exchange: "NASDAQ", marketCap: "3.52T", pe: 29.4, sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", type: "Stock", price: 612.35, change: -8.41, changePct: -1.35, exchange: "NASDAQ", marketCap: "1.56T", pe: 26.8, sector: "Technology" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", type: "ETF", price: 601.42, change: 2.48, changePct: 0.41, exchange: "NYSE Arca", expenseRatio: "0.09%", trackingError: "0.01%", aum: "560B" },
  { symbol: "AMD", name: "Advanced Micro Devices", type: "Stock", price: 162.87, change: 3.94, changePct: 2.48, exchange: "NASDAQ", marketCap: "192B", pe: 42.7, sector: "Technology" },
  { symbol: "TSLA 250328P340", name: "TSLA Mar 28 340 Put", type: "Option", price: 12.30, change: -2.15, changePct: -14.88, exchange: "CBOE", iv: 62.1, volume: "8.7K", openInterest: "42.5K", expiry: "Mar 28" },
  { symbol: "VIX", name: "CBOE Volatility Index", type: "Index", price: 14.82, change: -0.43, changePct: -2.82 },
  { symbol: "ARKK", name: "ARK Innovation ETF", type: "ETF", price: 58.42, change: 1.23, changePct: 2.15, exchange: "NYSE Arca", expenseRatio: "0.75%", trackingError: "N/A", aum: "6.8B" },
  { symbol: "NFLX", name: "Netflix Inc.", type: "Stock", price: 891.24, change: -11.32, changePct: -1.25, exchange: "NASDAQ", marketCap: "401B", pe: 46.3, sector: "Communication" },
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
        item.name.toLowerCase().includes(q)
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
    <header className="flex items-center gap-2.5 px-5 py-3">
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft size={20} strokeWidth={2} />
      </Button>

      <div className="relative flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-full bg-muted/50 px-5">
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
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 py-2">
      {searchTabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="search-tab"
                className="absolute inset-0 rounded-full bg-muted/70"
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

// ─── Type-specific meta line ─────────────────────────────────────────
function MetaLine({ item }: { item: SearchItem }) {
  const dot = <span className="text-muted-foreground/30 mx-0.5">&middot;</span>;

  if (item.type === "Stock" && (item.marketCap || item.pe || item.sector)) {
    return (
      <p className="flex items-center text-[12px] text-muted-foreground/60 mt-0.5 leading-tight">
        {item.marketCap && <span>MCap {item.marketCap}</span>}
        {item.pe && <>{item.marketCap && dot}<span>PE {item.pe}</span></>}
        {item.sector && <>{(item.marketCap || item.pe) && dot}<span>{item.sector}</span></>}
      </p>
    );
  }

  if (item.type === "ETF" && (item.expenseRatio || item.trackingError || item.aum)) {
    return (
      <p className="flex items-center text-[12px] text-muted-foreground/60 mt-0.5 leading-tight">
        {item.expenseRatio && <span>ER {item.expenseRatio}</span>}
        {item.trackingError && <>{item.expenseRatio && dot}<span>TE {item.trackingError}</span></>}
        {item.aum && <>{(item.expenseRatio || item.trackingError) && dot}<span>AUM {item.aum}</span></>}
      </p>
    );
  }

  if (item.type === "Option" && (item.iv || item.volume || item.openInterest)) {
    return (
      <p className="flex items-center text-[12px] text-muted-foreground/60 mt-0.5 leading-tight">
        {item.iv != null && <span>IV {item.iv}%</span>}
        {item.volume && <>{item.iv != null && dot}<span>Vol {item.volume}</span></>}
        {item.openInterest && <>{(item.iv != null || item.volume) && dot}<span>OI {item.openInterest}</span></>}
      </p>
    );
  }

  return null;
}

// ─── Result Row ──────────────────────────────────────────────────────
function ResultRow({
  item,
  isWatchlisted,
  onToggleWatchlist,
}: {
  item: SearchItem;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      {/* Logo circle */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted/70">
        <span className="text-[15px] font-semibold text-foreground/80">
          {item.symbol.slice(0, 2)}
        </span>
      </div>

      {/* Name + Symbol:Exchange + Meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-left text-[16px] font-medium text-foreground leading-tight">
          {item.name}
        </p>
        <p className="text-left text-[14px] text-muted-foreground leading-tight mt-0.5">
          {item.symbol}
          {item.exchange && (
            <span className="text-muted-foreground/40"> : {item.exchange}</span>
          )}
        </p>
        <MetaLine item={item} />
      </div>

      {/* Type badge */}
      <span className="shrink-0 rounded bg-muted/70 px-2 py-1 text-[12px] font-medium leading-none text-muted-foreground">
        {typeLabel(item.type)}
      </span>

      {/* Watchlist toggle */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onToggleWatchlist(item.symbol)}
        className="flex h-10 w-10 shrink-0 items-center justify-center"
      >
        <motion.div
          animate={isWatchlisted ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {isWatchlisted ? (
            <Bookmark
              size={20}
              strokeWidth={0}
              fill="currentColor"
              className="text-foreground"
            />
          ) : (
            <Bookmark
              size={20}
              strokeWidth={1.8}
              className="text-muted-foreground/50"
            />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}

// ─── Empty state: Recent + Popular widgets ──────────────────────────
function SearchEmptyState({
  watchlist,
  onToggleWatchlist,
}: {
  watchlist: Set<string>;
  onToggleWatchlist: (symbol: string) => void;
}) {
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
              isWatchlisted={watchlist.has(item.symbol)}
              onToggleWatchlist={onToggleWatchlist}
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
              isWatchlisted={watchlist.has(item.symbol)}
              onToggleWatchlist={onToggleWatchlist}
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

  const results = filterResults(query, activeTab);

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
      {query.trim() && <SearchTabs active={activeTab} onChange={setActiveTab} />}

      <main className="no-scrollbar flex-1 overflow-y-auto">
        {!query.trim() ? (
          <SearchEmptyState watchlist={watchlist} onToggleWatchlist={toggleWatchlist} />
        ) : results.length > 0 ? (
          <div className="divide-y divide-border/40">
            {results.map((item) => (
              <ResultRow
                key={item.symbol}
                item={item}
                isWatchlisted={watchlist.has(item.symbol)}
                onToggleWatchlist={toggleWatchlist}
              />
            ))}
          </div>
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
