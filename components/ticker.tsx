"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, Reorder, useDragControls } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Settings2,
  Check,
  ChevronDown,
  X,
  GripVertical,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTickerVisibility } from "@/components/ticker-visibility";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: "index" | "watchlist";
  type: "Index" | "Equity" | "ETF" | "Option";
  logo: string; // 1-2 char abbreviation for avatar
  logoColor: string; // tailwind bg class for avatar
  exchange?: string; // e.g. "NASDAQ", "NYSE"
  volume?: number; // daily volume
  marketCap?: number; // in dollars
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const ALL_TICKERS: TickerItem[] = [
  // Indices (5)
  { symbol: "SPX", name: "S&P 500", price: 5998.74, change: 22.43, changePercent: 0.38, category: "index", type: "Index", logo: "SP", logoColor: "bg-blue-600", volume: 3_120_000_000, marketCap: 0 },
  { symbol: "NDX", name: "Nasdaq 100", price: 21256.15, change: -87.32, changePercent: -0.41, category: "index", type: "Index", logo: "NQ", logoColor: "bg-emerald-600", volume: 1_850_000_000, marketCap: 0 },
  { symbol: "DJI", name: "Dow Jones", price: 43840.91, change: 151.22, changePercent: 0.35, category: "index", type: "Index", logo: "DJ", logoColor: "bg-sky-600", volume: 980_000_000, marketCap: 0 },
  { symbol: "RUT", name: "Russell 2000", price: 2287.43, change: 15.67, changePercent: 0.69, category: "index", type: "Index", logo: "R", logoColor: "bg-orange-600", volume: 450_000_000, marketCap: 0 },
  { symbol: "VIX", name: "CBOE Volatility", price: 14.82, change: -0.43, changePercent: -2.82, category: "index", type: "Index", logo: "VX", logoColor: "bg-purple-600", volume: 0, marketCap: 0 },

  // Equities (17)
  { symbol: "AAPL", name: "Apple Inc.", price: 228.52, change: 3.14, changePercent: 1.39, category: "watchlist", type: "Equity", logo: "A", logoColor: "bg-neutral-600", exchange: "NASDAQ", volume: 52_340_000, marketCap: 3_520_000_000_000 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 432.18, change: -2.87, changePercent: -0.66, category: "watchlist", type: "Equity", logo: "MS", logoColor: "bg-sky-700", exchange: "NASDAQ", volume: 23_180_000, marketCap: 3_210_000_000_000 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 178.95, change: 1.42, changePercent: 0.80, category: "watchlist", type: "Equity", logo: "G", logoColor: "bg-red-600", exchange: "NASDAQ", volume: 28_450_000, marketCap: 2_180_000_000_000 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 207.33, change: 4.56, changePercent: 2.25, category: "watchlist", type: "Equity", logo: "AZ", logoColor: "bg-amber-600", exchange: "NASDAQ", volume: 41_200_000, marketCap: 2_140_000_000_000 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 131.88, change: -3.21, changePercent: -2.38, category: "watchlist", type: "Equity", logo: "NV", logoColor: "bg-green-700", exchange: "NASDAQ", volume: 68_500_000, marketCap: 3_240_000_000_000 },
  { symbol: "META", name: "Meta Platforms", price: 612.77, change: 8.93, changePercent: 1.48, category: "watchlist", type: "Equity", logo: "M", logoColor: "bg-blue-700", exchange: "NASDAQ", volume: 18_900_000, marketCap: 1_560_000_000_000 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.42, change: -11.58, changePercent: -4.46, category: "watchlist", type: "Equity", logo: "T", logoColor: "bg-red-700", exchange: "NASDAQ", volume: 95_700_000, marketCap: 792_000_000_000 },
  { symbol: "JPM", name: "JPMorgan Chase", price: 242.15, change: 1.87, changePercent: 0.78, category: "watchlist", type: "Equity", logo: "JP", logoColor: "bg-slate-700", exchange: "NYSE", volume: 8_420_000, marketCap: 698_000_000_000 },
  { symbol: "V", name: "Visa Inc.", price: 315.44, change: 2.31, changePercent: 0.74, category: "watchlist", type: "Equity", logo: "V", logoColor: "bg-indigo-700", exchange: "NYSE", volume: 6_850_000, marketCap: 580_000_000_000 },
  { symbol: "UNH", name: "UnitedHealth Group", price: 524.88, change: -4.12, changePercent: -0.78, category: "watchlist", type: "Equity", logo: "UH", logoColor: "bg-cyan-700", exchange: "NYSE", volume: 3_210_000, marketCap: 484_000_000_000 },
  { symbol: "JNJ", name: "Johnson & Johnson", price: 155.62, change: 0.89, changePercent: 0.58, category: "watchlist", type: "Equity", logo: "JJ", logoColor: "bg-rose-700", exchange: "NYSE", volume: 7_100_000, marketCap: 374_000_000_000 },
  { symbol: "WMT", name: "Walmart Inc.", price: 92.35, change: 0.67, changePercent: 0.73, category: "watchlist", type: "Equity", logo: "WM", logoColor: "bg-blue-800", exchange: "NYSE", volume: 9_800_000, marketCap: 625_000_000_000 },
  { symbol: "AVGO", name: "Broadcom Inc.", price: 186.54, change: -1.73, changePercent: -0.92, category: "watchlist", type: "Equity", logo: "AV", logoColor: "bg-red-800", exchange: "NASDAQ", volume: 12_400_000, marketCap: 870_000_000_000 },
  { symbol: "COST", name: "Costco Wholesale", price: 922.11, change: 5.44, changePercent: 0.59, category: "watchlist", type: "Equity", logo: "CO", logoColor: "bg-red-600", exchange: "NASDAQ", volume: 2_300_000, marketCap: 409_000_000_000 },
  { symbol: "NFLX", name: "Netflix Inc.", price: 928.84, change: 12.67, changePercent: 1.38, category: "watchlist", type: "Equity", logo: "N", logoColor: "bg-red-700", exchange: "NASDAQ", volume: 5_600_000, marketCap: 401_000_000_000 },
  { symbol: "AMD", name: "AMD Inc.", price: 118.92, change: -2.45, changePercent: -2.02, category: "watchlist", type: "Equity", logo: "AM", logoColor: "bg-neutral-700", exchange: "NASDAQ", volume: 44_200_000, marketCap: 192_000_000_000 },
  { symbol: "INTC", name: "Intel Corp.", price: 22.14, change: -0.68, changePercent: -2.98, category: "watchlist", type: "Equity", logo: "IN", logoColor: "bg-sky-800", exchange: "NASDAQ", volume: 38_900_000, marketCap: 95_000_000_000 },
  { symbol: "RIVN", name: "Rivian Automotive", price: 14.82, change: 0.54, changePercent: 3.78, category: "watchlist", type: "Equity", logo: "RV", logoColor: "bg-muted", exchange: "NASDAQ", volume: 28_400_000, marketCap: 15_200_000_000 },
  { symbol: "LCID", name: "Lucid Group Inc.", price: 2.84, change: -0.12, changePercent: -4.05, category: "watchlist", type: "Equity", logo: "LC", logoColor: "bg-muted", exchange: "NASDAQ", volume: 22_100_000, marketCap: 6_500_000_000 },
  { symbol: "NIO", name: "NIO Inc.", price: 5.62, change: 0.28, changePercent: 5.24, category: "watchlist", type: "Equity", logo: "NI", logoColor: "bg-muted", exchange: "NYSE", volume: 35_800_000, marketCap: 11_200_000_000 },
  { symbol: "LI", name: "Li Auto Inc.", price: 28.45, change: 1.12, changePercent: 4.10, category: "watchlist", type: "Equity", logo: "LI", logoColor: "bg-muted", exchange: "NASDAQ", volume: 12_600_000, marketCap: 30_800_000_000 },
  { symbol: "XPEV", name: "XPeng Inc.", price: 18.34, change: -0.67, changePercent: -3.52, category: "watchlist", type: "Equity", logo: "XP", logoColor: "bg-muted", exchange: "NYSE", volume: 9_400_000, marketCap: 17_500_000_000 },

  // ETFs (5)
  { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 601.42, change: 2.48, changePercent: 0.41, category: "watchlist", type: "ETF", logo: "SP", logoColor: "bg-amber-700", exchange: "NYSE Arca", volume: 85_000_000, marketCap: 560_000_000_000 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: 521.87, change: 3.12, changePercent: 0.60, category: "watchlist", type: "ETF", logo: "QQ", logoColor: "bg-teal-600", exchange: "NASDAQ", volume: 42_000_000, marketCap: 280_000_000_000 },
  { symbol: "VOO", name: "Vanguard S&P 500", price: 553.28, change: 2.27, changePercent: 0.41, category: "watchlist", type: "ETF", logo: "VO", logoColor: "bg-red-700", exchange: "NYSE Arca", volume: 5_200_000, marketCap: 480_000_000_000 },
  { symbol: "IWM", name: "iShares Russell 2000", price: 228.56, change: 1.58, changePercent: 0.70, category: "watchlist", type: "ETF", logo: "IW", logoColor: "bg-slate-600", exchange: "NYSE Arca", volume: 28_000_000, marketCap: 72_000_000_000 },
  { symbol: "GLD", name: "SPDR Gold Shares", price: 242.56, change: 1.87, changePercent: 0.78, category: "watchlist", type: "ETF", logo: "GL", logoColor: "bg-yellow-600", exchange: "NYSE Arca", volume: 8_900_000, marketCap: 65_000_000_000 },
];

const DEFAULT_SELECTED = [
  "SPX", "NDX", "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META",
];

const MAX_TICKERS = 8;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPrice(price: number) {
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (price >= 1) return price.toFixed(0);
  return price.toFixed(2);
}

export function formatChange(change: number) {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}`;
}

export function formatPercent(pct: number) {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export const isGain = (t: TickerItem) => t.change >= 0;

// ─── Logo Avatar ─────────────────────────────────────────────────────────────

export function TickerLogo({ size = "md" }: { ticker: TickerItem; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <div
      className={cn(
        dim,
        "shrink-0 rounded-full bg-muted"
      )}
    />
  );
}

// ─── Edit Ticker (full-page overlay) ────────────────────────────────────────

type SearchTab = "All" | "Indices" | "Stocks" | "ETFs" | "Watchlist";
const SEARCH_TABS: SearchTab[] = ["All", "Indices", "Stocks", "ETFs", "Watchlist"];

function getSearchItems(tab: SearchTab, localSelected: string[], query: string): TickerItem[] {
  const q = query.toLowerCase().trim();
  let items: TickerItem[];

  switch (tab) {
    case "Indices":
      items = ALL_TICKERS.filter((t) => t.type === "Index");
      break;
    case "Stocks":
      items = ALL_TICKERS.filter((t) => t.type === "Equity");
      break;
    case "ETFs":
      items = ALL_TICKERS.filter((t) => t.type === "ETF");
      break;
    case "Watchlist":
      items = ALL_TICKERS.filter((t) => localSelected.includes(t.symbol));
      break;
    default:
      items = ALL_TICKERS;
  }

  if (q) {
    items = items.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q)
    );
  }

  return items;
}

function TickerRow({ ticker, checked, disabled, onToggle }: {
  ticker: TickerItem;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 px-5 py-3 transition-colors text-left",
        disabled && !checked && "opacity-40 cursor-not-allowed"
      )}
    >
      <TickerLogo ticker={ticker} />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-foreground leading-tight truncate">
          {ticker.name}
        </p>
        <p className="text-[13px] text-muted-foreground/50 leading-tight truncate mt-0.5">
          {ticker.symbol}
        </p>
      </div>
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 transition-all",
          checked
            ? "border-foreground bg-foreground"
            : "border-muted-foreground/25 bg-transparent"
        )}
      >
        {checked && (
          <Check size={12} className="text-background" strokeWidth={3.5} />
        )}
      </div>
    </button>
  );
}

function DraggableTickerRow({
  symbol,
  ticker,
  onRemove,
}: {
  symbol: string;
  ticker: TickerItem;
  onRemove: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={symbol}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center gap-3 bg-background px-5 py-3"
    >
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex h-8 w-8 cursor-grab items-center justify-center touch-none text-muted-foreground/30 active:cursor-grabbing"
      >
        <GripVertical size={18} strokeWidth={1.5} />
      </div>
      <TickerLogo ticker={ticker} />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-foreground leading-tight truncate">{ticker.name}</p>
        <p className="text-[13px] text-muted-foreground/50 leading-tight truncate mt-0.5">{ticker.symbol}</p>
      </div>
      <button onClick={onRemove} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/40 active:text-foreground active:bg-muted/50 transition-colors">
        <X size={16} strokeWidth={2} />
      </button>
    </Reorder.Item>
  );
}

export function EditSheet({
  selected,
  onSave,
  trigger,
}: {
  selected: string[];
  onSave: (next: string[]) => void;
  trigger: React.ReactNode;
}) {
  const [local, setLocal] = useState<string[]>(selected);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("All");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setLocal(selected);
    setSearching(false);
    setQuery("");
    setOpen(true);
  };

  const atLimit = local.length >= MAX_TICKERS;

  const toggle = (symbol: string) => {
    setLocal((prev) => {
      if (prev.includes(symbol)) return prev.filter((s) => s !== symbol);
      if (prev.length >= MAX_TICKERS) return prev;
      return [...prev, symbol];
    });
  };

  const save = () => {
    onSave(local);
    setOpen(false);
  };

  const startSearch = () => {
    setSearching(true);
    setQuery("");
    setActiveTab("All");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelSearch = () => {
    setSearching(false);
    setQuery("");
  };

  const selectedTickers = useMemo(
    () => ALL_TICKERS.filter((t) => local.includes(t.symbol)),
    [local]
  );

  const searchItems = useMemo(
    () => getSearchItems(activeTab, local, query),
    [activeTab, local, query]
  );

  if (!open) {
    return <div onClick={handleOpen}>{trigger}</div>;
  }

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex h-dvh max-w-[430px] flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <button
          onClick={() => setOpen(false)}
          className="text-[15px] font-medium text-muted-foreground"
        >
          Cancel
        </button>
        <h2 className="text-[17px] font-semibold text-foreground">Edit Ticker</h2>
        <button
          onClick={startSearch}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground active:bg-muted/50 transition-colors"
        >
          <Plus size={20} strokeWidth={2} />
        </button>
      </div>


      {/* Search overlay */}
      {searching && (
        <div className="absolute inset-0 z-30 flex flex-col">
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={cancelSearch} />

          {/* Search panel — positioned to align search bar with dummy button */}
          <div className="relative flex flex-col max-h-[70vh] rounded-2xl bg-background shadow-xl overflow-hidden" style={{ marginTop: 20, marginLeft: 20, marginRight: 20 }}>
            {/* Limit message */}
            {atLimit && (
              <div className="px-5 pt-3 pb-0 shrink-0">
                <p className="text-[13px] text-muted-foreground/50">{local.length} of {MAX_TICKERS} selected</p>
              </div>
            )}

            {/* Search input */}
            <div className="flex items-center gap-2 px-5 pt-3 pb-2 shrink-0">
              <div className="flex-1 flex items-center rounded-full bg-muted/50 px-4 py-2.5">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stocks, indices, ETFs..."
                  className="flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/40"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                    className="ml-2 text-muted-foreground/40"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
              <button
                onClick={cancelSearch}
                className="shrink-0 text-[14px] font-medium text-muted-foreground active:text-foreground"
              >
                Cancel
              </button>
            </div>

            {query ? (
              <>
                {/* Tabs — only when searching */}
                <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-2 shrink-0">
                  {SEARCH_TABS.map((tab) => {
                    const isActive = tab === activeTab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "relative shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="edit-search-tab"
                            className="absolute inset-0 rounded-full bg-muted/70"
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          />
                        )}
                        <span className="relative z-10">{tab}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="h-px bg-border/30 shrink-0" />

                {/* Search results */}
                <div className="no-scrollbar overflow-y-auto">
                  {searchItems.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-[14px] text-muted-foreground/40">
                        No results for &ldquo;{query}&rdquo;
                      </p>
                    </div>
                  ) : (
                    searchItems.slice(0, 8).map((ticker) => {
                      const checked = local.includes(ticker.symbol);
                      return (
                        <TickerRow
                          key={ticker.symbol}
                          ticker={ticker}
                          checked={checked}
                          disabled={!checked && atLimit}
                          onToggle={() => toggle(ticker.symbol)}
                        />
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Empty state — Popular Indices */}
                <div className="px-5 pt-3 pb-1 shrink-0">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground/40">Popular Indices</span>
                </div>
                <div className="no-scrollbar overflow-y-auto">
                  {ALL_TICKERS.filter((t) => t.type === "Index").map((ticker) => {
                    const checked = local.includes(ticker.symbol);
                    return (
                      <TickerRow
                        key={ticker.symbol}
                        ticker={ticker}
                        checked={checked}
                        disabled={!checked && atLimit}
                        onToggle={() => toggle(ticker.symbol)}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="h-px bg-border/40 shrink-0" />

      {/* Selected tickers — draggable */}
      <div className="flex-1 no-scrollbar overflow-y-auto">
        {selectedTickers.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-[15px] text-muted-foreground/40">No tickers selected</p>
          </div>
        ) : (
          <>
            <Reorder.Group axis="y" values={local} onReorder={setLocal}>
              {local.map((symbol) => {
                const ticker = selectedTickers.find((t) => t.symbol === symbol);
                if (!ticker) return null;
                return (
                  <DraggableTickerRow
                    key={symbol}
                    symbol={symbol}
                    ticker={ticker}
                    onRemove={() => toggle(symbol)}
                  />
                );
              })}
            </Reorder.Group>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border/40 shrink-0">
        <button
          onClick={save}
          className="w-full flex items-center justify-center rounded-xl bg-foreground py-3 text-[15px] font-semibold text-background transition-opacity active:opacity-80"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Shared hook: manages selected state + filtered tickers ──────────────────

function useTickerState() {
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const tickers = ALL_TICKERS.filter((t) => selected.includes(t.symbol));
  return { selected, setSelected, tickers };
}

// ─── Market status (mock — cycles every 20s for demo) ────────────────────────

type MarketStatus = "open" | "after-hours" | "closed";
const MARKET_STATES: MarketStatus[] = ["open", "after-hours", "closed"];

const STATUS_LABEL: Record<MarketStatus, { text: string; color: string } | null> = {
  open: null,
  "after-hours": { text: "After Hours", color: "text-amber-500" },
  closed: { text: "Closed", color: "text-loss" },
};

// ─── Live price fluctuation hook ──────────────────────────────────────────────
// Simulates tiny random price ticks every 1.5–3s for a "live" feel.

function useLiveTickers(tickers: TickerItem[]) {
  const [livePrices, setLivePrices] = useState<
    Map<string, { price: number; change: number; changePercent: number }>
  >(new Map());

  const baseRef = useRef<Map<string, TickerItem>>(new Map());

  // Sync base prices when tickers change
  useEffect(() => {
    const map = new Map<string, TickerItem>();
    tickers.forEach((t) => map.set(t.symbol, { ...t }));
    baseRef.current = map;
  }, [tickers]);

  const tick = useCallback(() => {
    setLivePrices((prev) => {
      const next = new Map(prev);
      baseRef.current.forEach((base, symbol) => {
        const current = next.get(symbol);
        const price = current?.price ?? base.price;
        // Random walk: ±0.01% to ±0.08% of price
        const magnitude = price * (0.0001 + Math.random() * 0.0007);
        const delta = Math.random() > 0.5 ? magnitude : -magnitude;
        const newPrice = Math.max(0.01, price + delta);
        const totalChange = newPrice - (base.price - base.change); // change from prev close
        const totalPct = (totalChange / (base.price - base.change)) * 100;
        next.set(symbol, {
          price: newPrice,
          change: totalChange,
          changePercent: totalPct,
        });
      });
      return next;
    });
  }, []);

  useEffect(() => {
    // Initial tick
    const initialTimeout = setTimeout(tick, 800);

    // Recurring ticks at random intervals
    let timer: ReturnType<typeof setTimeout>;
    function scheduleTick() {
      const delay = 1500 + Math.random() * 1500; // 1.5–3s
      timer = setTimeout(() => {
        tick();
        scheduleTick();
      }, delay);
    }
    scheduleTick();

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(timer);
    };
  }, [tick]);

  // Merge live prices onto tickers
  return tickers.map((t) => {
    const live = livePrices.get(t.symbol);
    if (!live) return t;
    return { ...t, price: live.price, change: live.change, changePercent: live.changePercent };
  });
}

// Inline edit button used inside each ticker variation
function EditButton({
  selected,
  onSave,
}: {
  selected: string[];
  onSave: (next: string[]) => void;
}) {
  return (
    <EditSheet
      selected={selected}
      onSave={onSave}
      trigger={
        <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/15 hover:text-white">
          <Settings2 size={15} />
        </button>
      }
    />
  );
}

// ─── VARIATION 1a: Marquee Tape (AUTO-SCROLL — BACKUP) ──────────────────────
// Auto-scrolling infinite loop with an inline edit button pinned to the right.
// Kept as backup. To restore: swap TickerMarqueeAuto → TickerMarquee in pages.

export function TickerMarqueeAuto() {
  const { tickerVisible } = useTickerVisibility();
  const { selected, setSelected, tickers } = useTickerState();

  if (!tickerVisible) return null;

  if (tickers.length === 0) {
    return (
      <div className="-mt-px flex items-center justify-between bg-[#0f0f11] px-5 py-3">
        <span className="text-[14px] text-white/50">No tickers selected</span>
        <EditButton selected={selected} onSave={setSelected} />
      </div>
    );
  }

  const doubled = [...tickers, ...tickers];

  return (
    <div className="relative -mt-px flex items-center bg-[#0f0f11]">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#0f0f11] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-[40px] z-10 w-8 bg-gradient-to-l from-[#0f0f11] to-transparent" />

      {/* Scrolling content */}
      <div className="flex-1 overflow-hidden py-2.5">
        <motion.div
          className="flex gap-6 whitespace-nowrap"
          animate={{ x: [0, -(tickers.length * 160)] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: tickers.length * 4,
              ease: "linear",
            },
          }}
        >
          {doubled.map((t, i) => (
            <div key={`${t.symbol}-${i}`} className="flex items-center gap-2 shrink-0">
              <span className="text-[15px] font-semibold text-white">
                {t.symbol}
              </span>
              <span className="text-[14px] font-medium text-white/50 tabular-nums">
                {formatPrice(t.price)}
              </span>
              <span
                className={cn(
                  "text-[14px] font-semibold tabular-nums",
                  isGain(t) ? "text-emerald-400" : "text-red-400"
                )}
              >
                {formatPercent(t.changePercent)}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Edit button pinned right */}
      <div className="relative z-20 shrink-0 pl-2 pr-3">
        <EditButton selected={selected} onSave={setSelected} />
      </div>
    </div>
  );
}

// ─── VARIATION 1b: Draggable Tape (ACTIVE) ──────────────────────────────────
// User drags left/right. Background matches current theme (white/black).

// ── Ticker Expand Sheet (top sheet with full list) ────────────────────────────

function TickerExpandSheet({
  tickers,
  selected,
  onSave,
  open,
  onClose,
}: {
  tickers: TickerItem[];
  selected: string[];
  onSave: (next: string[]) => void;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[430px]">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Content — auto height */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        exit={{ y: "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex flex-col rounded-b-2xl bg-background shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted/50"
          >
            <X size={20} strokeWidth={2} />
          </button>
          <h2 className="text-[17px] font-semibold text-foreground">My Ticker</h2>
          <EditSheet
            selected={selected}
            onSave={onSave}
            trigger={
              <button className="text-[14px] font-medium text-muted-foreground active:text-foreground transition-colors">
                Customise
              </button>
            }
          />
        </div>

        <div className="h-px bg-border/40 shrink-0" />

        {/* Ticker list */}
        <div>
          {tickers.map((t) => {
            const gain = isGain(t);
            return (
              <div key={t.symbol} className="flex items-center gap-3 px-5 py-3.5">
                <TickerLogo ticker={t} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground leading-tight truncate">{t.name}</p>
                  <p className="text-[13px] text-muted-foreground/50 leading-tight mt-0.5">{t.symbol}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-semibold tabular-nums text-foreground leading-tight">
                    {formatPrice(t.price)}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className={cn("text-[13px] tabular-nums font-medium", gain ? "text-gain" : "text-loss")}>
                      {formatChange(t.change)}
                    </span>
                    <span className={cn("text-[13px] tabular-nums font-medium", gain ? "text-gain" : "text-loss")}>
                      ({formatPercent(t.changePercent)})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom padding + rounded corner */}
        <div className="h-3 shrink-0" />
      </motion.div>
    </div>
  );
}

export function TickerMarquee() {
  const { tickerVisible } = useTickerVisibility();
  const { selected, setSelected, tickers } = useTickerState();
  const liveTickers = useLiveTickers(tickers);
  const [expanded, setExpanded] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const marketStatus = MARKET_STATES[statusIdx];
  const statusLabel = STATUS_LABEL[marketStatus];

  if (!tickerVisible) return null;

  if (liveTickers.length === 0) {
    return (
      <div className="border-b border-border/40">
        <div className="flex items-center justify-between bg-background px-5 py-3">
          <span className="text-[14px] text-muted-foreground">No tickers selected</span>
          <EditSheet
            selected={selected}
            onSave={setSelected}
            trigger={
              <button className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <Settings2 size={14} />
                <span className="text-[13px] font-medium">Edit</span>
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-border/40">
        <div className="flex items-center">
          {/* Status label — sticky left */}
          {statusLabel && (
            <div className="shrink-0 pl-5 flex items-baseline pt-1 pb-4">
              <span className={cn("text-[14px] font-semibold leading-none", statusLabel.color)}>
                {statusLabel.text}
              </span>
            </div>
          )}

          <div
            className="overflow-x-auto no-scrollbar flex-1"
            onClick={() => setStatusIdx((i) => (i + 1) % MARKET_STATES.length)}
          >
            <div className={cn(
              "flex items-baseline gap-5 whitespace-nowrap pr-5 pt-1 pb-4",
              statusLabel ? "pl-4" : "pl-5"
            )}>
              {liveTickers.map((t) => (
                <span key={t.symbol} className="shrink-0 text-[14px] leading-none">
                  <span className="font-semibold text-foreground">{t.symbol}</span>
                  {" "}
                  <span className="tabular-nums font-medium text-muted-foreground">
                    {formatPrice(t.price)}
                  </span>
                  {" "}
                  <span
                    className={cn(
                      "tabular-nums font-semibold",
                      isGain(t) ? "text-gain" : "text-loss"
                    )}
                  >
                    {formatPercent(t.changePercent)}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Expand button */}
          <button
            onClick={() => setExpanded(true)}
            className="shrink-0 pr-4 pl-2 pb-3 pt-1 text-muted-foreground/40 active:text-muted-foreground transition-colors"
          >
            <ChevronDown size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Expand sheet */}
      <TickerExpandSheet
        tickers={liveTickers}
        selected={selected}
        onSave={setSelected}
        open={expanded}
        onClose={() => setExpanded(false)}
      />
    </>
  );
}

// ─── VARIATION 2: Pill Strip ─────────────────────────────────────────────────
// Scrollable compact pills. Edit button is the last pill in the row.

export function TickerPills() {
  const { tickerVisible } = useTickerVisibility();
  const { selected, setSelected, tickers } = useTickerState();

  if (!tickerVisible) return null;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent" />

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-2.5">
        {tickers.map((t) => (
          <div
            key={t.symbol}
            className={cn(
              "flex items-center gap-1.5 shrink-0 rounded-full border px-3.5 py-2",
              isGain(t)
                ? "border-gain/20 bg-gain/[0.06]"
                : "border-loss/20 bg-loss/[0.06]"
            )}
          >
            <span className="text-[14px] font-semibold text-foreground">
              {t.symbol}
            </span>
            <span
              className={cn(
                "text-[13px] font-semibold tabular-nums",
                isGain(t) ? "text-gain" : "text-loss"
              )}
            >
              {formatPercent(t.changePercent)}
            </span>
          </div>
        ))}

        {/* Edit pill at end */}
        <EditSheet
          selected={selected}
          onSave={setSelected}
          trigger={
            <button className="flex items-center gap-1 shrink-0 rounded-full border border-border/60 bg-secondary/40 px-3.5 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <Settings2 size={14} />
              <span className="text-[13px] font-medium">Edit</span>
            </button>
          }
        />
      </div>
    </div>
  );
}

// ─── VARIATION 3: Mini Cards ─────────────────────────────────────────────────
// Scrollable cards with price + change + intensity bar. Edit card at the end.

export function TickerCards() {
  const { tickerVisible } = useTickerVisibility();
  const { selected, setSelected, tickers } = useTickerState();

  if (!tickerVisible) return null;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent" />

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-5 py-2.5">
        {tickers.map((t) => (
          <div
            key={t.symbol}
            className="shrink-0 w-[136px] rounded-xl border border-border/60 bg-card p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-foreground">
                {t.symbol}
              </span>
              {isGain(t) ? (
                <TrendingUp size={15} className="text-gain" />
              ) : (
                <TrendingDown size={15} className="text-loss" />
              )}
            </div>
            <div>
              <p className="text-[17px] font-semibold text-foreground tabular-nums leading-tight">
                {formatPrice(t.price)}
              </p>
              <p
                className={cn(
                  "text-[13px] font-medium tabular-nums mt-0.5",
                  isGain(t) ? "text-gain" : "text-loss"
                )}
              >
                {formatChange(t.change)} ({formatPercent(t.changePercent)})
              </p>
            </div>
            <div className="h-1 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  isGain(t) ? "bg-gain" : "bg-loss"
                )}
                style={{ width: `${Math.min(Math.abs(t.changePercent) * 15, 100)}%` }}
              />
            </div>
          </div>
        ))}

        {/* Edit card at end */}
        <EditSheet
          selected={selected}
          onSave={setSelected}
          trigger={
            <button className="shrink-0 w-[84px] rounded-xl border border-dashed border-border/60 bg-card/50 flex flex-col items-center justify-center gap-1.5 transition-colors hover:bg-card hover:border-border">
              <Settings2 size={18} className="text-muted-foreground" />
              <span className="text-[12px] font-medium text-muted-foreground">Edit</span>
            </button>
          }
        />
      </div>
    </div>
  );
}

// ─── VARIATION 4: Dense Tape ─────────────────────────────────────────────────
// Auto-scrolling two-line layout. Edit button pinned left as a label.

export function TickerDense() {
  const { tickerVisible } = useTickerVisibility();
  const { selected, setSelected, tickers } = useTickerState();

  if (!tickerVisible) return null;

  if (tickers.length === 0) {
    return (
      <div className="flex items-center justify-between px-5 py-2.5 ">
        <span className="text-[13px] text-muted-foreground">No tickers selected</span>
        <EditButton selected={selected} onSave={setSelected} />
      </div>
    );
  }

  const doubled = [...tickers, ...tickers];

  return (
    <div className="relative flex items-center ">
      {/* Edit button pinned left */}
      <div className="relative z-20 shrink-0 pl-3 pr-2">
        <EditSheet
          selected={selected}
          onSave={setSelected}
          trigger={
            <button className="flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <Settings2 size={13} />
              <span className="text-[12px] font-semibold uppercase tracking-wider">Ticker</span>
            </button>
          }
        />
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-[72px] z-10 w-6 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background to-transparent" />

      <div className="flex-1 overflow-hidden py-2">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: [0, -(tickers.length * 100)] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: tickers.length * 5,
              ease: "linear",
            },
          }}
        >
          {doubled.map((t, i) => (
            <div
              key={`${t.symbol}-${i}`}
              className="shrink-0 flex flex-col items-center px-5 border-r border-border/30 last:border-r-0"
            >
              <span className="text-[13px] font-bold text-foreground tracking-wide">
                {t.symbol}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[13px] text-muted-foreground tabular-nums">
                  {formatPrice(t.price)}
                </span>
                <span
                  className={cn(
                    "text-[12px] font-semibold tabular-nums",
                    isGain(t) ? "text-gain" : "text-loss"
                  )}
                >
                  {formatPercent(t.changePercent)}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── VARIATION 5: Gradient Glow ──────────────────────────────────────────────
// Premium cards with gain/loss gradient. Edit card at end, matching style.

export function TickerGlow() {
  const { tickerVisible } = useTickerVisibility();
  const { selected, setSelected, tickers } = useTickerState();

  if (!tickerVisible) return null;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-3">
        {tickers.map((t) => (
          <div
            key={t.symbol}
            className={cn(
              "relative shrink-0 rounded-2xl border px-5 py-3 min-w-[156px] overflow-hidden",
              isGain(t) ? "border-gain/20" : "border-loss/20"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 opacity-[0.04]",
                isGain(t)
                  ? "bg-gradient-to-br from-gain via-gain/50 to-transparent"
                  : "bg-gradient-to-br from-loss via-loss/50 to-transparent"
              )}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[16px] font-bold text-foreground">
                  {t.symbol}
                </span>
                <div
                  className={cn(
                    "flex items-center gap-0.5 rounded-md px-1.5 py-0.5",
                    isGain(t) ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                  )}
                >
                  {isGain(t) ? (
                    <TrendingUp size={13} strokeWidth={2.5} />
                  ) : (
                    <TrendingDown size={13} strokeWidth={2.5} />
                  )}
                  <span className="text-[12px] font-bold tabular-nums">
                    {formatPercent(t.changePercent)}
                  </span>
                </div>
              </div>
              <p className="text-[12px] text-muted-foreground leading-none mb-1">
                {t.name}
              </p>
              <p className="text-[19px] font-bold text-foreground tabular-nums leading-tight">
                {formatPrice(t.price)}
              </p>
            </div>
          </div>
        ))}

        {/* Edit card, matching glow style */}
        <EditSheet
          selected={selected}
          onSave={setSelected}
          trigger={
            <button className="relative shrink-0 rounded-2xl border border-dashed border-border/40 px-5 py-3 min-w-[92px] flex flex-col items-center justify-center gap-1.5 transition-colors hover:border-border/60 hover:bg-card/30">
              <Settings2 size={20} className="text-muted-foreground" />
              <span className="text-[12px] font-semibold text-muted-foreground">Edit</span>
            </button>
          }
        />
      </div>
    </div>
  );
}
