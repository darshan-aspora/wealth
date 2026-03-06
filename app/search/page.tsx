"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Search, X, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { TickerMarquee } from "@/components/ticker";
import { useRotatingSuffix } from "@/components/header";

// ─── Mock search data ────────────────────────────────────────────────
type SearchItem = {
  symbol: string;
  name: string;
  type: "Stock" | "Index" | "ETF" | "Option" | "Forex";
  price: number;
  change: number;
  changePct: number;
  exchange?: string;
};

const mockData: SearchItem[] = [
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", price: 227.63, change: 3.42, changePct: 1.53, exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "Stock", price: 441.28, change: -2.15, changePct: -0.48, exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "Stock", price: 178.92, change: 1.87, changePct: 1.06, exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "Stock", price: 213.47, change: 4.23, changePct: 2.02, exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Stock", price: 134.70, change: 6.82, changePct: 5.33, exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms Inc.", type: "Stock", price: 612.35, change: -8.41, changePct: -1.35, exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Stock", price: 342.18, change: 12.56, changePct: 3.81, exchange: "NASDAQ" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", type: "Stock", price: 248.90, change: 1.23, changePct: 0.50, exchange: "NYSE" },
  { symbol: "V", name: "Visa Inc.", type: "Stock", price: 312.45, change: -0.87, changePct: -0.28, exchange: "NYSE" },
  { symbol: "WMT", name: "Walmart Inc.", type: "Stock", price: 93.12, change: 0.64, changePct: 0.69, exchange: "NYSE" },
  { symbol: "UNH", name: "UnitedHealth Group", type: "Stock", price: 524.80, change: -3.21, changePct: -0.61, exchange: "NYSE" },
  { symbol: "AVGO", name: "Broadcom Inc.", type: "Stock", price: 186.43, change: 5.17, changePct: 2.85, exchange: "NASDAQ" },
  { symbol: "COST", name: "Costco Wholesale", type: "Stock", price: 928.15, change: 4.32, changePct: 0.47, exchange: "NASDAQ" },
  { symbol: "AMD", name: "Advanced Micro Devices", type: "Stock", price: 162.87, change: 3.94, changePct: 2.48, exchange: "NASDAQ" },
  { symbol: "NFLX", name: "Netflix Inc.", type: "Stock", price: 891.24, change: -11.32, changePct: -1.25, exchange: "NASDAQ" },

  // Indices
  { symbol: "SPX", name: "S&P 500", type: "Index", price: 6021.63, change: 24.82, changePct: 0.41 },
  { symbol: "NDX", name: "NASDAQ 100", type: "Index", price: 21432.15, change: 127.56, changePct: 0.60 },
  { symbol: "DJI", name: "Dow Jones Industrial", type: "Index", price: 44287.50, change: -82.34, changePct: -0.19 },
  { symbol: "RUT", name: "Russell 2000", type: "Index", price: 2287.43, change: 15.67, changePct: 0.69 },
  { symbol: "VIX", name: "CBOE Volatility Index", type: "Index", price: 14.82, change: -0.43, changePct: -2.82 },

  // ETFs
  { symbol: "SPY", name: "SPDR S&P 500 ETF", type: "ETF", price: 601.42, change: 2.48, changePct: 0.41, exchange: "NYSE Arca" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", type: "ETF", price: 521.87, change: 3.12, changePct: 0.60, exchange: "NASDAQ" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", type: "ETF", price: 553.28, change: 2.27, changePct: 0.41, exchange: "NYSE Arca" },
  { symbol: "VTI", name: "Vanguard Total Stock Mkt", type: "ETF", price: 293.14, change: 1.35, changePct: 0.46, exchange: "NYSE Arca" },
  { symbol: "IWM", name: "iShares Russell 2000", type: "ETF", price: 228.56, change: 1.58, changePct: 0.70, exchange: "NYSE Arca" },
  { symbol: "DIA", name: "SPDR Dow Jones ETF", type: "ETF", price: 442.73, change: -0.82, changePct: -0.19, exchange: "NYSE Arca" },
  { symbol: "ARKK", name: "ARK Innovation ETF", type: "ETF", price: 58.42, change: 1.23, changePct: 2.15, exchange: "NYSE Arca" },
  { symbol: "XLF", name: "Financial Select Sector", type: "ETF", price: 47.83, change: 0.31, changePct: 0.65, exchange: "NYSE Arca" },
  { symbol: "XLE", name: "Energy Select Sector", type: "ETF", price: 86.21, change: -0.94, changePct: -1.08, exchange: "NYSE Arca" },
  { symbol: "GLD", name: "SPDR Gold Shares", type: "ETF", price: 242.56, change: 1.87, changePct: 0.78, exchange: "NYSE Arca" },
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
    <header className="flex items-center gap-2.5 px-4 py-3">
      <button
        onClick={() => router.back()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
      >
        <ArrowLeft size={20} strokeWidth={2} />
      </button>

      <div className="relative flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-full bg-muted/50 px-4">
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

        <AnimatePresence mode="wait">
          {query ? (
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
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="ml-2 shrink-0"
            >
              <Search size={18} className="text-muted-foreground/60" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        <Bell size={20} strokeWidth={1.8} />
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-background">
          3
        </span>
      </button>
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
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2">
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
    <div className="flex items-center gap-3 px-4 py-4">
      {/* Logo circle */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted/70">
        <span className="text-[15px] font-semibold text-foreground/80">
          {item.symbol.slice(0, 2)}
        </span>
      </div>

      {/* Name + Symbol:Exchange — left aligned */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-left text-[16px] font-medium text-foreground">
          {item.name}
        </p>
        <p className="text-left text-[14px] text-muted-foreground">
          {item.symbol}
          {item.exchange && (
            <span className="text-muted-foreground/40"> : {item.exchange}</span>
          )}
        </p>
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
      <TickerMarquee />
      <SearchTabs active={activeTab} onChange={setActiveTab} />

      <main className="no-scrollbar flex-1 overflow-y-auto">
        {results.length > 0 ? (
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
