"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Settings2,
  Check,
  Search,
  EyeOff,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

  // ETFs (5)
  { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 601.42, change: 2.48, changePercent: 0.41, category: "watchlist", type: "ETF", logo: "SP", logoColor: "bg-amber-700", exchange: "NYSE Arca", volume: 85_000_000, marketCap: 560_000_000_000 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: 521.87, change: 3.12, changePercent: 0.60, category: "watchlist", type: "ETF", logo: "QQ", logoColor: "bg-teal-600", exchange: "NASDAQ", volume: 42_000_000, marketCap: 280_000_000_000 },
  { symbol: "VOO", name: "Vanguard S&P 500", price: 553.28, change: 2.27, changePercent: 0.41, category: "watchlist", type: "ETF", logo: "VO", logoColor: "bg-red-700", exchange: "NYSE Arca", volume: 5_200_000, marketCap: 480_000_000_000 },
  { symbol: "IWM", name: "iShares Russell 2000", price: 228.56, change: 1.58, changePercent: 0.70, category: "watchlist", type: "ETF", logo: "IW", logoColor: "bg-slate-600", exchange: "NYSE Arca", volume: 28_000_000, marketCap: 72_000_000_000 },
  { symbol: "GLD", name: "SPDR Gold Shares", price: 242.56, change: 1.87, changePercent: 0.78, category: "watchlist", type: "ETF", logo: "GL", logoColor: "bg-yellow-600", exchange: "NYSE Arca", volume: 8_900_000, marketCap: 65_000_000_000 },
];

const DEFAULT_SELECTED = [
  "SPX", "NDX", "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA",
];

const MAX_TICKERS = 10;
const EDIT_TABS = ["Indices", "Watchlist", "Equities", "ETFs", "Options"] as const;
type EditTab = (typeof EDIT_TABS)[number];

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

export function TickerLogo({ ticker, size = "md" }: { ticker: TickerItem; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text = size === "sm" ? "text-[11px]" : "text-[12px]";

  return (
    <div
      className={cn(
        dim,
        "shrink-0 rounded-full flex items-center justify-center",
        ticker.logoColor
      )}
    >
      <span className={cn(text, "font-bold text-white leading-none")}>
        {ticker.logo}
      </span>
    </div>
  );
}

// ─── Edit Sheet (inline, self-triggering) ────────────────────────────────────

function getTabItems(tab: EditTab, localSelected: string[], query: string): TickerItem[] {
  const q = query.toLowerCase().trim();
  let items: TickerItem[];

  switch (tab) {
    case "Indices":
      items = ALL_TICKERS.filter((t) => t.type === "Index");
      break;
    case "Watchlist":
      items = ALL_TICKERS.filter((t) => localSelected.includes(t.symbol));
      break;
    case "Equities":
      items = ALL_TICKERS.filter((t) => t.type === "Equity");
      break;
    case "ETFs":
      items = ALL_TICKERS.filter((t) => t.type === "ETF");
      break;
    case "Options":
      items = ALL_TICKERS.filter((t) => t.type === "Option");
      break;
    default:
      items = [];
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

function EditSheet({
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
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<EditTab>("Indices");
  const { hideTicker } = useTickerVisibility();

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setLocal(selected);
      setQuery("");
      setActiveTab("Indices");
    }
    setOpen(isOpen);
  };

  const atLimit = local.length >= MAX_TICKERS;

  const toggle = (symbol: string) => {
    setLocal((prev) => {
      if (prev.includes(symbol)) return prev.filter((s) => s !== symbol);
      if (prev.length >= MAX_TICKERS) return prev;
      return [...prev, symbol];
    });
  };

  const selectAllForTab = () => {
    const tabItems = getTabItems(activeTab, local, "");
    setLocal((prev) => {
      const remaining = MAX_TICKERS - prev.length;
      const toAdd = tabItems
        .map((t) => t.symbol)
        .filter((s) => !prev.includes(s))
        .slice(0, remaining);
      return [...prev, ...toAdd];
    });
  };

  const deselectAllForTab = () => {
    const tabItems = getTabItems(activeTab, local, "");
    const syms = new Set(tabItems.map((t) => t.symbol));
    setLocal((prev) => prev.filter((s) => !syms.has(s)));
  };

  const save = () => {
    onSave(local);
    setOpen(false);
  };

  const items = useMemo(
    () => getTabItems(activeTab, local, query),
    [activeTab, local, query]
  );

  const tabAllSelected = useMemo(() => {
    if (activeTab === "Watchlist") return false;
    const tabItems = getTabItems(activeTab, local, "");
    return tabItems.length > 0 && tabItems.every((t) => local.includes(t.symbol));
  }, [activeTab, local]);

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-2xl border-border/60 bg-background px-0 pb-8"
      >
        <SheetHeader className="flex-row items-center justify-between px-5 pb-0 border-0">
          <SheetTitle className="text-[18px] font-semibold">
            Edit Ticker
          </SheetTitle>
          {local.length > 0 && (
            <button
              onClick={() => setLocal([])}
              className="text-[14px] font-medium text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              Unselect all
            </button>
          )}
        </SheetHeader>

        {/* Search */}
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2.5 transition-colors focus-within:border-muted-foreground/40 focus-within:bg-secondary/60">
            <Search
              size={17}
              className="shrink-0 text-muted-foreground/60"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stocks, ETFs..."
              className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 pb-2">
          {EDIT_TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative shrink-0 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/70"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="edit-sheet-tab"
                    className="absolute inset-0 rounded-full bg-muted/70"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            );
          })}
        </div>

        <div className="h-px bg-border/60 relative z-10" />

        {/* Tab header — select/deselect all for non-Watchlist tabs */}
        {activeTab !== "Watchlist" && items.length > 0 && !query && (
          <div className="flex items-center justify-between px-5 pt-2.5 pb-1">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              {activeTab}
            </span>
            <button
              onClick={() => (tabAllSelected ? deselectAllForTab() : selectAllForTab())}
              className="text-[13px] font-medium text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              {tabAllSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
        )}

        <div className="max-h-[45vh] overflow-y-auto no-scrollbar px-5">
          {items.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-[15px] text-muted-foreground">
                {query
                  ? <>No results for &ldquo;{query}&rdquo;</>
                  : activeTab === "Watchlist"
                    ? "No tickers selected yet"
                    : activeTab === "Options"
                      ? "Coming soon"
                      : "No items"}
              </p>
            </div>
          )}

          <div className="space-y-0.5">
            {items.map((ticker) => {
              const checked = local.includes(ticker.symbol);
              const disabled = !checked && atLimit;
              return (
                <button
                  key={ticker.symbol}
                  onClick={() => toggle(ticker.symbol)}
                  disabled={disabled}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors text-left",
                    checked
                      ? "bg-secondary/50"
                      : disabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-secondary/25"
                  )}
                >
                  {/* Checkbox */}
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

                  {/* Logo */}
                  <TickerLogo ticker={ticker} />

                  {/* Name + Symbol:Exchange */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-foreground leading-tight truncate">
                      {ticker.name}
                    </p>
                    <p className="text-[13px] text-muted-foreground leading-tight truncate mt-0.5">
                      {ticker.symbol}
                      {ticker.exchange && (
                        <span className="text-muted-foreground/40"> : {ticker.exchange}</span>
                      )}
                    </p>
                  </div>

                  {/* Price + Change */}
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-semibold text-foreground tabular-nums leading-tight">
                      {formatPrice(ticker.price)}
                    </p>
                    <p
                      className={cn(
                        "text-[13px] font-medium tabular-nums leading-tight mt-0.5",
                        isGain(ticker) ? "text-gain" : "text-loss"
                      )}
                    >
                      {formatPercent(ticker.changePercent)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 px-5 pt-4">
          <button
            onClick={() => {
              hideTicker();
              setOpen(false);
            }}
            className="shrink-0 flex items-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground active:scale-[0.98]"
          >
            <EyeOff size={16} />
            Hide
          </button>
          <button
            onClick={save}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-[16px] font-semibold text-background transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            <Save size={16} />
            Save {local.length} of {MAX_TICKERS}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Shared hook: manages selected state + filtered tickers ──────────────────

function useTickerState() {
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const tickers = ALL_TICKERS.filter((t) => selected.includes(t.symbol));
  return { selected, setSelected, tickers };
}

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
      <div className="-mt-px flex items-center justify-between bg-[#0f0f11] px-4 py-3">
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

export function TickerMarquee() {
  const { tickerVisible } = useTickerVisibility();
  const { selected, setSelected, tickers } = useTickerState();
  const liveTickers = useLiveTickers(tickers);

  if (!tickerVisible) return null;

  if (liveTickers.length === 0) {
    return (
      <div className="border-b border-border/40">
        <div className="flex items-center justify-between bg-background px-4 py-3">
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
    <div className="border-b border-border/40">
      <div className="relative flex items-center">
        {/* Scrollable ticker items */}
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-5 whitespace-nowrap pl-3 pr-2 pt-0.5 pb-2.5">
            {liveTickers.map((t) => (
              <div key={t.symbol} className="flex items-center gap-1.5 shrink-0">
                <span className="text-[15px] font-semibold text-foreground">
                  {t.symbol}
                </span>
                <span className="tnum inline-block min-w-[48px] text-right text-[14px] font-medium text-muted-foreground transition-colors">
                  {formatPrice(t.price)}
                </span>
                <span
                  className={cn(
                    "tnum inline-block min-w-[52px] text-right text-[14px] font-semibold transition-colors",
                    isGain(t) ? "text-gain" : "text-loss"
                  )}
                >
                  {formatPercent(t.changePercent)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fade edge before edit button */}
        <div className="pointer-events-none absolute right-[56px] inset-y-0 w-12 bg-gradient-to-l from-background via-background/40 to-transparent z-10" />

        {/* Edit button — always visible, pinned right */}
        <div className="relative z-20 shrink-0 pr-3 pl-1 pb-1">
          <EditSheet
            selected={selected}
            onSave={setSelected}
            trigger={
              <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
                <Settings2 size={20} strokeWidth={1.8} />
              </button>
            }
          />
        </div>
      </div>
    </div>
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

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5">
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

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 py-2.5">
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
      <div className="flex items-center justify-between px-4 py-2.5 ">
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
              className="shrink-0 flex flex-col items-center px-4 border-r border-border/30 last:border-r-0"
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

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3">
        {tickers.map((t) => (
          <div
            key={t.symbol}
            className={cn(
              "relative shrink-0 rounded-2xl border px-4 py-3 min-w-[156px] overflow-hidden",
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
