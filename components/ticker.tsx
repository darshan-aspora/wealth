"use client";

import { useState, useMemo } from "react";
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
  logo: string; // 1-2 char abbreviation for avatar
  logoColor: string; // tailwind bg class for avatar
  exchange?: string; // e.g. "NASDAQ", "NYSE"
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const ALL_TICKERS: TickerItem[] = [
  // Indices
  { symbol: "SPX", name: "S&P 500", price: 5998.74, change: 22.43, changePercent: 0.38, category: "index", logo: "SP", logoColor: "bg-blue-600" },
  { symbol: "NDX", name: "Nasdaq 100", price: 21256.15, change: -87.32, changePercent: -0.41, category: "index", logo: "NQ", logoColor: "bg-emerald-600" },
  { symbol: "DJI", name: "Dow Jones", price: 43840.91, change: 151.22, changePercent: 0.35, category: "index", logo: "DJ", logoColor: "bg-sky-600" },

  // Watchlist (user's stocks — Mag 7 + popular picks)
  { symbol: "AAPL", name: "Apple Inc.", price: 228.52, change: 3.14, changePercent: 1.39, category: "watchlist", logo: "A", logoColor: "bg-neutral-600", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 432.18, change: -2.87, changePercent: -0.66, category: "watchlist", logo: "MS", logoColor: "bg-sky-700", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 178.95, change: 1.42, changePercent: 0.80, category: "watchlist", logo: "G", logoColor: "bg-red-600", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 207.33, change: 4.56, changePercent: 2.25, category: "watchlist", logo: "AZ", logoColor: "bg-amber-600", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 131.88, change: -3.21, changePercent: -2.38, category: "watchlist", logo: "NV", logoColor: "bg-green-700", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms", price: 612.77, change: 8.93, changePercent: 1.48, category: "watchlist", logo: "M", logoColor: "bg-blue-700", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.42, change: -11.58, changePercent: -4.46, category: "watchlist", logo: "T", logoColor: "bg-red-700", exchange: "NASDAQ" },
  { symbol: "JPM", name: "JPMorgan Chase", price: 242.15, change: 1.87, changePercent: 0.78, category: "watchlist", logo: "JP", logoColor: "bg-slate-700", exchange: "NYSE" },
  { symbol: "V", name: "Visa Inc.", price: 315.44, change: 2.31, changePercent: 0.74, category: "watchlist", logo: "V", logoColor: "bg-indigo-700", exchange: "NYSE" },
  { symbol: "UNH", name: "UnitedHealth Group", price: 524.88, change: -4.12, changePercent: -0.78, category: "watchlist", logo: "UH", logoColor: "bg-cyan-700", exchange: "NYSE" },
  { symbol: "JNJ", name: "Johnson & Johnson", price: 155.62, change: 0.89, changePercent: 0.58, category: "watchlist", logo: "JJ", logoColor: "bg-rose-700", exchange: "NYSE" },
  { symbol: "WMT", name: "Walmart Inc.", price: 92.35, change: 0.67, changePercent: 0.73, category: "watchlist", logo: "WM", logoColor: "bg-blue-800", exchange: "NYSE" },
  { symbol: "AVGO", name: "Broadcom Inc.", price: 186.54, change: -1.73, changePercent: -0.92, category: "watchlist", logo: "AV", logoColor: "bg-red-800", exchange: "NASDAQ" },
  { symbol: "COST", name: "Costco Wholesale", price: 922.11, change: 5.44, changePercent: 0.59, category: "watchlist", logo: "CO", logoColor: "bg-red-600", exchange: "NASDAQ" },
  { symbol: "NFLX", name: "Netflix Inc.", price: 928.84, change: 12.67, changePercent: 1.38, category: "watchlist", logo: "N", logoColor: "bg-red-700", exchange: "NASDAQ" },
  { symbol: "AMD", name: "AMD Inc.", price: 118.92, change: -2.45, changePercent: -2.02, category: "watchlist", logo: "AM", logoColor: "bg-neutral-700", exchange: "NASDAQ" },
  { symbol: "INTC", name: "Intel Corp.", price: 22.14, change: -0.68, changePercent: -2.98, category: "watchlist", logo: "IN", logoColor: "bg-sky-800", exchange: "NASDAQ" },
];

const DEFAULT_SELECTED = [
  "SPX", "NDX", "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA",
];

const CATEGORY_LABELS: Record<TickerItem["category"], string> = {
  index: "Indices",
  watchlist: "Watchlist",
};

const CATEGORY_ORDER: TickerItem["category"][] = ["index", "watchlist"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return price >= 1000
    ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : price.toFixed(2);
}

function formatChange(change: number) {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}`;
}

function formatPercent(pct: number) {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

const isGain = (t: TickerItem) => t.change >= 0;

// ─── Logo Avatar ─────────────────────────────────────────────────────────────

function TickerLogo({ ticker, size = "md" }: { ticker: TickerItem; size?: "sm" | "md" }) {
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
  const { hideTicker } = useTickerVisibility();

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setLocal(selected);
      setQuery("");
    }
    setOpen(isOpen);
  };

  const toggle = (symbol: string) => {
    setLocal((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const selectAll = (category: TickerItem["category"]) => {
    const syms = ALL_TICKERS.filter((t) => t.category === category).map((t) => t.symbol);
    setLocal((prev) => Array.from(new Set([...prev, ...syms])));
  };

  const deselectAll = (category: TickerItem["category"]) => {
    const syms = ALL_TICKERS.filter((t) => t.category === category).map((t) => t.symbol);
    setLocal((prev) => prev.filter((s) => !syms.includes(s)));
  };

  const save = () => {
    onSave(local);
    setOpen(false);
  };

  const lowerQuery = query.toLowerCase().trim();

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map((cat) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        items: ALL_TICKERS.filter((t) => {
          if (t.category !== cat) return false;
          if (!lowerQuery) return true;
          return (
            t.symbol.toLowerCase().includes(lowerQuery) ||
            t.name.toLowerCase().includes(lowerQuery)
          );
        }),
      })).filter((g) => g.items.length > 0),
    [lowerQuery]
  );

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
        </SheetHeader>

        {/* Search */}
        <div className="px-5 pt-3 pb-3">
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

        <div className="h-px bg-border/60 relative z-10" />

        <div className="max-h-[55vh] overflow-y-auto no-scrollbar px-5">
          {grouped.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-[15px] text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {grouped.map((group) => {
            const allInGroup = ALL_TICKERS.filter((t) => t.category === group.category);
            const allSelected = allInGroup.every((t) =>
              local.includes(t.symbol)
            );

            return (
              <div key={group.category}>
                <div className="flex items-center justify-between sticky -top-px z-10 bg-background pt-3 pb-2 -mx-5 px-5 border-b border-border/30 shadow-[0_-1px_0_0_hsl(var(--background))]">
                  <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </h3>
                  {!lowerQuery && (
                    <button
                      onClick={() =>
                        allSelected
                          ? deselectAll(group.category)
                          : selectAll(group.category)
                      }
                      className="text-[13px] font-medium text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      {allSelected ? "Deselect all" : "Select all"}
                    </button>
                  )}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((ticker) => {
                    const checked = local.includes(ticker.symbol);
                    return (
                      <button
                        key={ticker.symbol}
                        onClick={() => toggle(ticker.symbol)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors text-left",
                          checked ? "bg-secondary/50" : "hover:bg-secondary/25"
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
            );
          })}
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
            Save ({local.length})
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
        <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/70 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Settings2 size={15} />
        </button>
      }
    />
  );
}

// ─── VARIATION 1: Marquee Tape ───────────────────────────────────────────────
// Auto-scrolling infinite loop with an inline edit button pinned to the right.

export function TickerMarquee() {
  const { tickerVisible } = useTickerVisibility();
  const { selected, setSelected, tickers } = useTickerState();

  if (!tickerVisible) return null;

  if (tickers.length === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-y border-border/40">
        <span className="text-[14px] text-muted-foreground">No tickers selected</span>
        <EditButton selected={selected} onSave={setSelected} />
      </div>
    );
  }

  const doubled = [...tickers, ...tickers];

  return (
    <div className="relative flex items-center border-y border-border/40">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-[40px] z-10 w-8 bg-gradient-to-l from-background to-transparent" />

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
              <span className="text-[15px] font-semibold text-foreground">
                {t.symbol}
              </span>
              <span className="text-[14px] font-medium text-muted-foreground tabular-nums">
                {formatPrice(t.price)}
              </span>
              <span
                className={cn(
                  "text-[14px] font-semibold tabular-nums",
                  isGain(t) ? "text-gain" : "text-loss"
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
      <div className="flex items-center justify-between px-4 py-2.5 border-y border-border/40">
        <span className="text-[13px] text-muted-foreground">No tickers selected</span>
        <EditButton selected={selected} onSave={setSelected} />
      </div>
    );
  }

  const doubled = [...tickers, ...tickers];

  return (
    <div className="relative flex items-center border-y border-border/40">
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
