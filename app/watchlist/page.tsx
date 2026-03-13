"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAI } from "@/contexts/ai-context";
import { motion, AnimatePresence, Reorder, useMotionValue, useAnimation, type PanInfo } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  ChevronRight,
  Bell,
  Trash2,
  Plus,
  Bookmark,
  Settings,
  Pencil,
  Check,
  X,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownAZ,
  BarChart3,
  TrendingUp,
  ArrowUpDown,
  Zap,
  Building2,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Header } from "@/components/header";
import { TickerMarquee } from "@/components/ticker";
import { BottomNavV2 } from "@/components/bottom-nav";
import {
  ALL_TICKERS,
  TickerLogo,
  formatPrice,
  formatChange,
  formatPercent,
  isGain,
  type TickerItem,
} from "@/components/ticker";
import { NewsAccordion } from "@/app/market/components/news-accordion";
import type { NewsItem } from "@/app/market/data";

/* ------------------------------------------------------------------ */
/*  Watchlist data definitions                                         */
/* ------------------------------------------------------------------ */

interface WatchlistData {
  id: string;
  label: string;
  stocks: TickerItem[];
}

const INITIAL_WATCHLISTS: WatchlistData[] = [
  {
    id: "wl-1",
    label: "Watchlist 1",
    stocks: [
      ...ALL_TICKERS.filter((t) => t.type === "Index").slice(0, 3),
      ...ALL_TICKERS.filter((t) => t.type === "Equity").slice(0, 6),
      ...ALL_TICKERS.filter((t) => t.type === "ETF").slice(0, 2),
    ],
  },
  {
    id: "wl-2",
    label: "Watchlist 2",
    stocks: [
      ...ALL_TICKERS.filter((t) => t.type === "Equity").slice(6, 13),
      ...ALL_TICKERS.filter((t) => t.type === "ETF").slice(2, 5),
    ],
  },
  {
    id: "wl-3",
    label: "Watchlist 3",
    stocks: [
      ...ALL_TICKERS.filter((t) => t.type === "Index").slice(3),
      ...ALL_TICKERS.filter((t) => t.type === "Equity").slice(13),
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  News data                                                          */
/* ------------------------------------------------------------------ */

const WATCHLIST_NEWS: NewsItem[] = [
  {
    headline: "S&P 500 hits record high as tech rally extends into fifth session",
    summary: "The S&P 500 closed at a fresh all-time high, powered by sustained momentum in mega-cap tech names. Breadth improved with 320 advancers, though volume remained below the 20-day average. Analysts point to strong earnings revisions as the key driver.",
    tickers: ["SPY", "QQQ", "AAPL"],
    sources: [
      { name: "Bloomberg", logo: "B", color: "#2800d7" },
      { name: "Reuters", logo: "R", color: "#ff8200" },
    ],
    timeAgo: "12m ago",
  },
  {
    headline: "Federal Reserve signals patience on rate cuts amid sticky inflation",
    summary: "Fed Chair Powell reiterated a data-dependent approach, noting that recent CPI prints remain above the 2% target. Markets now price in only one cut for 2025, down from three at the start of the year. Bond yields rose across the curve.",
    tickers: ["TLT", "SHY"],
    sources: [
      { name: "Reuters", logo: "R", color: "#ff8200" },
      { name: "CNBC", logo: "C", color: "#005594" },
    ],
    timeAgo: "34m ago",
  },
  {
    headline: "Apple announces record 110B buyback as services revenue surges",
    summary: "Apple unveiled the largest share repurchase in corporate history alongside a 4% dividend increase. Services revenue hit 24.2B, up 14% YoY, reinforcing the company's shift toward recurring revenue streams.",
    tickers: ["AAPL"],
    sources: [
      { name: "CNBC", logo: "C", color: "#005594" },
      { name: "Bloomberg", logo: "B", color: "#2800d7" },
    ],
    timeAgo: "1h ago",
  },
  {
    headline: "Nvidia earnings crush estimates as AI chip demand shows no slowdown",
    summary: "Nvidia reported EPS of 6.12 vs 5.59 expected, with data center revenue doubling YoY to 26.3B. Management guided for even stronger demand in the next quarter as hyperscaler capex continues accelerating.",
    tickers: ["NVDA", "AMD", "AVGO"],
    sources: [
      { name: "Wall Street Journal", logo: "W", color: "#0080c3" },
      { name: "Barrons", logo: "B", color: "#336b87" },
    ],
    timeAgo: "2h ago",
  },
  {
    headline: "Treasury yields climb after strong jobs report dampens rate cut hopes",
    summary: "The 10-year yield rose 8bps to 4.52% after non-farm payrolls came in at 272K, well above the 190K consensus. Average hourly earnings also surprised to the upside, complicating the Fed's path to easing.",
    tickers: ["TLT", "IEF"],
    sources: [
      { name: "MarketWatch", logo: "M", color: "#367c2b" },
      { name: "Financial Times", logo: "F", color: "#fff1e5" },
    ],
    timeAgo: "3h ago",
  },
];

/* ------------------------------------------------------------------ */
/*  AI Summary section                                                 */
/* ------------------------------------------------------------------ */

type AiPhase = "idle" | "analyzing" | "typing" | "complete";

function AiSummaryCard({ watchlist }: { watchlist: WatchlistData }) {
  const [phase, setPhase] = useState<AiPhase>("idle");
  const [visibleChars, setVisibleChars] = useState(0);
  const completedRef = useRef(false);

  const gainers = watchlist.stocks.filter((s) => isGain(s));
  const losers = watchlist.stocks.filter((s) => !isGain(s));
  const topGainer = [...gainers].sort((a, b) => b.changePercent - a.changePercent)[0];
  const topLoser = [...losers].sort((a, b) => a.changePercent - b.changePercent)[0];

  const summaryText = useMemo(() => {
    const parts: string[] = [];
    parts.push(
      `Your ${watchlist.label} has ${watchlist.stocks.length} instruments today. ${gainers.length} are up, ${losers.length} are down.`
    );
    if (topGainer) {
      parts.push(
        `Leading the pack, ${topGainer.name} (${topGainer.symbol}) is up ${formatPercent(topGainer.changePercent)} on strong momentum.`
      );
    }
    if (topLoser) {
      parts.push(
        `On the downside, ${topLoser.name} (${topLoser.symbol}) is down ${topLoser.changePercent.toFixed(1)}% — worth watching for potential entry or exit.`
      );
    }
    parts.push(
      "Overall, market breadth is mixed with rotation into value names. Keep an eye on Treasury yields which may impact growth multiples this week."
    );
    return parts.join(" ");
  }, [watchlist, gainers.length, losers.length, topGainer, topLoser]);

  // Analyzing → typing
  useEffect(() => {
    if (phase !== "analyzing") return;
    const t = setTimeout(() => setPhase("typing"), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  // Typing effect
  useEffect(() => {
    if (phase !== "typing") return;
    completedRef.current = false;
    const interval = setInterval(() => {
      setVisibleChars((prev) => {
        const step = Math.random() > 0.6 ? 3 : 2;
        const next = Math.min(prev + step, summaryText.length);
        if (next >= summaryText.length && !completedRef.current) {
          completedRef.current = true;
          clearInterval(interval);
          setTimeout(() => setPhase("complete"), 200);
        }
        return next;
      });
    }, 18);
    return () => clearInterval(interval);
  }, [phase, summaryText]);

  const handleGenerate = () => {
    setVisibleChars(0);
    completedRef.current = false;
    setPhase("analyzing");
  };

  if (phase === "idle") {
    return (
      <button
        onClick={handleGenerate}
        className="mx-4 mt-2 mb-2 flex w-[calc(100%-32px)] items-center gap-3 rounded-2xl border border-border/50 bg-card/60 px-4 py-4 text-left transition-all active:scale-[0.98]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
          <Sparkles size={20} className="text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-foreground">AI Summary</p>
          <p className="text-[13px] text-muted-foreground/70">Get insights for this watchlist</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground/40" />
      </button>
    );
  }

  return (
    <div className="mx-4 mt-2 mb-2 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-violet-400" />
        <span className="text-[14px] font-semibold text-violet-400">AI Summary</span>
        {phase === "analyzing" && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="ml-auto"
          >
            <RefreshCw size={14} className="text-violet-400/60" />
          </motion.div>
        )}
      </div>

      {/* Analyzing state */}
      {phase === "analyzing" && (
        <div className="flex items-center gap-2 py-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-violet-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="text-[14px] text-muted-foreground/60">
            Analyzing {watchlist.stocks.length} instruments...
          </span>
        </div>
      )}

      {/* Typing / Complete */}
      {(phase === "typing" || phase === "complete") && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-[15px] leading-relaxed text-foreground/85">
            {summaryText.slice(0, visibleChars)}
            {phase === "typing" && (
              <motion.span
                className="inline-block w-[2px] h-[16px] ml-0.5 align-text-bottom bg-violet-400"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </p>
        </motion.div>
      )}

      {/* Reanalyze */}
      {phase === "complete" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleGenerate}
          className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-violet-400/80 transition-colors hover:text-violet-400"
        >
          <RefreshCw size={13} />
          Reanalyze
        </motion.button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stock Row                                                          */
/* ------------------------------------------------------------------ */

function StockRow({ ticker }: { ticker: TickerItem }) {
  const gain = isGain(ticker);
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <TickerLogo ticker={ticker} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
          {ticker.name}
        </p>
        <p className="mt-0.5 text-[14px] leading-tight text-muted-foreground">
          {ticker.symbol}
          {ticker.type !== "Index" && ticker.exchange && (
            <span className="text-muted-foreground/40"> · {ticker.exchange}</span>
          )}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[15px] font-semibold tabular-nums leading-tight text-foreground">
          {formatPrice(ticker.price)}
        </p>
        <p
          className={cn(
            "mt-0.5 text-[14px] font-medium tabular-nums leading-tight",
            gain ? "text-gain" : "text-loss"
          )}
        >
          {formatChange(ticker.change)} ({formatPercent(ticker.changePercent)})
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Swipeable Row (Flag / Alert / Delete)                              */
/* ------------------------------------------------------------------ */

const ACTION_WIDTH = 128; // 2 buttons x 64

function SwipeableRow({
  ticker,
  onDelete,
  isOpen,
  onOpen,
}: {
  ticker: TickerItem;
  onDelete: () => void;
  isOpen: boolean;
  onOpen: () => void;
}) {
  const router = useRouter();
  const x = useMotionValue(0);
  const controls = useAnimation();

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) {
      onOpen();
      controls.start({ x: -ACTION_WIDTH, transition: { type: "spring", stiffness: 400, damping: 35 } });
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 35 } });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 35 } });
    }
  }, [isOpen, controls]);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute bottom-0 right-0 top-0 flex items-stretch">
        <button className="flex w-16 flex-col items-center justify-center gap-1 border-r border-border/40 bg-muted/40 text-muted-foreground">
          <Bell size={16} strokeWidth={1.8} />
          <span className="text-[11px] font-medium">Alert</span>
        </button>
        <button
          onClick={onDelete}
          className="flex w-16 flex-col items-center justify-center gap-1 bg-red-500/90 text-white"
        >
          <Trash2 size={16} strokeWidth={1.8} />
          <span className="text-[11px] font-medium">Delete</span>
        </button>
      </div>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        animate={controls}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (ticker.type !== "Index") {
            router.push(`/stocks/${ticker.symbol}`);
          }
        }}
        className="relative z-10 bg-background cursor-pointer"
      >
        <StockRow ticker={ticker} />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  News section (inline, not a separate tab)                          */
/* ------------------------------------------------------------------ */

function NewsSection() {
  return (
    <div className="mt-4 px-4">
      <NewsAccordion
        title="News"
        subtitle="Headlines relevant to your watchlist"
        items={WATCHLIST_NEWS}
        sourceCount={12}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sort options                                                       */
/* ------------------------------------------------------------------ */

type SortKey = "change" | "symbol" | "price" | "volume";

const SORT_OPTIONS: { key: SortKey; label: string; icon: typeof TrendingUp }[] = [
  { key: "change", label: "% Change", icon: TrendingUp },
  { key: "symbol", label: "Name A–Z", icon: ArrowDownAZ },
  { key: "price", label: "Price", icon: BarChart3 },
];

function sortStocks(stocks: TickerItem[], sortKey: SortKey): TickerItem[] {
  return [...stocks].sort((a, b) => {
    switch (sortKey) {
      case "change":
        return b.changePercent - a.changePercent;
      case "symbol":
        return a.symbol.localeCompare(b.symbol);
      case "price":
        return b.price - a.price;
      case "volume":
        return (b.volume ?? 0) - (a.volume ?? 0);
      default:
        return 0;
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Watchlist Tab Content                                              */
/* ------------------------------------------------------------------ */

function WatchlistTabContent({
  watchlist,
  onDeleteStock,
}: {
  watchlist: WatchlistData;
  onDeleteStock: (symbol: string) => void;
}) {
  const router = useRouter();
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("change");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const totalGainers = watchlist.stocks.filter((s) => isGain(s)).length;
  const totalLosers = watchlist.stocks.length - totalGainers;

  const sortedStocks = useMemo(
    () => sortStocks(watchlist.stocks, sortKey),
    [watchlist.stocks, sortKey]
  );

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "Sort";

  return (
    <div className="pb-6">
      {/* Stats bar + sort */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-muted-foreground">
            {watchlist.stocks.length} items
          </span>
          <span className="text-[11px] text-muted-foreground/30">·</span>
          <span className="flex items-center gap-1 text-[14px] text-gain">
            <ArrowUpRight size={13} />
            {totalGainers} up
          </span>
          <span className="flex items-center gap-1 text-[14px] text-loss">
            <ArrowDownRight size={13} />
            {totalLosers} down
          </span>
        </div>

        {/* Sort button */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu((v) => !v)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors active:bg-muted/40 border border-border/40"
          >
            <ArrowUpDown size={13} strokeWidth={2} />
            {currentSortLabel}
          </button>

          {/* Sort dropdown */}
          <AnimatePresence>
            {showSortMenu && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSortMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setSortKey(opt.key);
                        setShowSortMenu(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3.5 py-3 text-[14px] font-medium transition-colors active:bg-muted/40",
                        sortKey === opt.key
                          ? "text-foreground bg-muted/30"
                          : "text-muted-foreground"
                      )}
                    >
                      <opt.icon size={15} strokeWidth={1.8} />
                      {opt.label}
                      {sortKey === opt.key && (
                        <Check size={14} strokeWidth={2.5} className="ml-auto text-foreground" />
                      )}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stock list */}
      <div className="divide-y divide-border/20">
        {sortedStocks.map((stock) => (
          <SwipeableRow
            key={stock.symbol}
            ticker={stock}
            onDelete={() => onDeleteStock(stock.symbol)}
            isOpen={openRow === stock.symbol}
            onOpen={() => setOpenRow(stock.symbol)}
          />
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={() => router.push("/search")}
        className="mx-4 mt-3 flex w-[calc(100%-32px)] items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-3 text-[15px] font-medium text-muted-foreground transition-colors active:bg-muted/40"
      >
        <Plus size={16} />
        Add to {watchlist.label}
      </button>

      {/* AI Summary */}
      <div className="mt-4">
        <AiSummaryCard watchlist={watchlist} />
      </div>

      {/* News */}
      <NewsSection />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle Row (Paytm Money–style config toggle)                       */
/* ------------------------------------------------------------------ */

function ToggleRow({
  icon: Icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: typeof TrendingUp;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-muted/30 transition-colors"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
        <Icon size={18} strokeWidth={1.6} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-foreground">{label}</p>
        <p className="text-[13px] text-muted-foreground/60 leading-tight">{description}</p>
      </div>
      <div
        className={cn(
          "relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors",
          enabled ? "bg-gain" : "bg-muted-foreground/25"
        )}
      >
        <motion.div
          className="absolute top-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-sm"
          animate={{ left: enabled ? 23 : 3 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings Tab                                                       */
/* ------------------------------------------------------------------ */

interface WatchlistConfig {
  showPerformanceSinceAdded: boolean;
  showBreakoutTags: boolean;
  showCorporateActions: boolean;
}

function WatchlistReorderItem({
  wl,
  onRename,
  onDelete,
  canDelete,
}: {
  wl: WatchlistData;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(wl.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const saveEdit = () => {
    if (editLabel.trim()) onRename(wl.id, editLabel.trim());
    setEditing(false);
  };

  return (
    <Reorder.Item
      value={wl}
      className="flex items-center gap-2 border-b border-border/30 bg-card px-3 py-3.5 last:border-b-0"
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.3)", zIndex: 50 }}
    >
      <GripVertical size={18} strokeWidth={1.5} className="flex-shrink-0 cursor-grab text-muted-foreground/40 active:cursor-grabbing" />

      {editing ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <input
            ref={inputRef}
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="min-w-0 flex-1 border-b border-foreground/30 bg-transparent text-[15px] font-semibold text-foreground outline-none"
          />
          <button onClick={saveEdit} className="flex h-8 w-8 items-center justify-center rounded-md text-foreground active:bg-muted/40">
            <Check size={16} strokeWidth={2} />
          </button>
          <button onClick={() => setEditing(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground active:bg-muted/40">
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <>
          <Bookmark size={17} className="shrink-0 text-muted-foreground/50" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-foreground">{wl.label}</p>
            <p className="text-[13px] text-muted-foreground/60">{wl.stocks.length} items</p>
          </div>
          <button
            onClick={() => { setEditLabel(wl.label); setEditing(true); }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/50 active:bg-muted/40"
          >
            <Pencil size={15} strokeWidth={1.8} />
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(wl.id)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-red-400/60 active:bg-muted/40"
            >
              <Trash2 size={15} strokeWidth={1.8} />
            </button>
          )}
        </>
      )}
    </Reorder.Item>
  );
}

function SettingsTab({
  watchlists,
  onRename,
  onDelete,
  onAdd,
  onReorder,
  config,
  onConfigChange,
}: {
  watchlists: WatchlistData[];
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onReorder: (reordered: WatchlistData[]) => void;
  config: WatchlistConfig;
  onConfigChange: (key: keyof WatchlistConfig) => void;
}) {
  return (
    <div className="pb-6 pt-2">
      {/* ── Manage Watchlists ── */}
      <div className="px-4">
        <h3 className="mb-1 text-[17px] font-bold text-foreground">Manage Watchlists</h3>
        <p className="text-[13px] text-muted-foreground/50 mb-3">
          Drag to reorder. {watchlists.length} watchlist{watchlists.length !== 1 ? "s" : ""}.
        </p>
      </div>

      <div className="mx-4 overflow-hidden rounded-2xl border border-border/60 bg-card">
        <Reorder.Group axis="y" values={watchlists} onReorder={onReorder} className="overflow-hidden">
          {watchlists.map((wl) => (
            <WatchlistReorderItem
              key={wl.id}
              wl={wl}
              onRename={onRename}
              onDelete={onDelete}
              canDelete={watchlists.length > 1}
            />
          ))}
        </Reorder.Group>
      </div>

      <div className="px-4 mt-1">
        <p className="text-[12px] text-muted-foreground/50">
          Tab order matches the list above. Hold and drag to reorder.
        </p>
      </div>

      {/* Add new watchlist */}
      <div className="px-4">
        <button
          onClick={onAdd}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-3 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-border active:scale-[0.98]"
        >
          <Plus size={16} />
          Create Watchlist
        </button>
      </div>

      {/* ── Watchlist Configuration ── */}
      <div className="mt-6 px-4">
        <h3 className="mb-1 text-[17px] font-bold text-foreground">Watchlist Configuration</h3>
        <p className="text-[13px] text-muted-foreground/50 mb-3">Customize what you see on each watchlist</p>
      </div>

      <div className="divide-y divide-border/30">
        <ToggleRow
          icon={TrendingUp}
          label="Performance Since Added"
          description="Show P&L % from when you added each stock"
          enabled={config.showPerformanceSinceAdded}
          onToggle={() => onConfigChange("showPerformanceSinceAdded")}
        />
        <ToggleRow
          icon={Zap}
          label="Breakout Tags"
          description="Highlight stocks near 52W high/low or volume spikes"
          enabled={config.showBreakoutTags}
          onToggle={() => onConfigChange("showBreakoutTags")}
        />
        <ToggleRow
          icon={Building2}
          label="Corporate Actions"
          description="Show dividends, splits, bonus, and rights info"
          enabled={config.showCorporateActions}
          onToggle={() => onConfigChange("showCorporateActions")}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<WatchlistData[]>(INITIAL_WATCHLISTS);
  const [activeTabId, setActiveTabId] = useState("wl-1");

  const tabs = useMemo(() => {
    return [
      ...watchlists.map((wl) => ({ id: wl.id, label: wl.label })),
      { id: "settings", label: "Settings" },
    ];
  }, [watchlists]);

  const activeWatchlist = watchlists.find((w) => w.id === activeTabId);

  const { setAISource } = useAI();
  useEffect(() => {
    if (!activeWatchlist) return;
    const topGainer = [...activeWatchlist.stocks]
      .filter((s) => s.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)[0];
    setAISource({ type: "watchlist", topGainer: topGainer?.symbol });
  }, [activeWatchlist, setAISource]);

  const handleDeleteStock = useCallback(
    (watchlistId: string, symbol: string) => {
      setWatchlists((prev) =>
        prev.map((wl) =>
          wl.id === watchlistId
            ? { ...wl, stocks: wl.stocks.filter((s) => s.symbol !== symbol) }
            : wl
        )
      );
    },
    []
  );

  const handleRenameWatchlist = useCallback((id: string, label: string) => {
    setWatchlists((prev) =>
      prev.map((wl) => (wl.id === id ? { ...wl, label } : wl))
    );
  }, []);

  const handleDeleteWatchlist = useCallback(
    (id: string) => {
      setWatchlists((prev) => prev.filter((wl) => wl.id !== id));
      if (activeTabId === id) {
        setActiveTabId(watchlists[0]?.id === id ? watchlists[1]?.id || "settings" : watchlists[0]?.id || "settings");
      }
    },
    [activeTabId, watchlists]
  );

  const handleAddWatchlist = useCallback(() => {
    const newId = `wl-${Date.now()}`;
    setWatchlists((prev) => [
      ...prev,
      { id: newId, label: `Watchlist ${prev.length + 1}`, stocks: [] },
    ]);
    setActiveTabId(newId);
  }, []);

  const handleReorderWatchlist = useCallback((reordered: WatchlistData[]) => {
    setWatchlists(reordered);
  }, []);

  const [config, setConfig] = useState<WatchlistConfig>({
    showPerformanceSinceAdded: true,
    showBreakoutTags: false,
    showCorporateActions: true,
  });

  const handleConfigChange = useCallback((key: keyof WatchlistConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <Header />
      <TickerMarquee />

      {/* Tab Bar */}
      <div className="relative border-b border-border/40">
        <div className="no-scrollbar flex overflow-x-auto pl-1 pr-4 gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-[15px] font-medium transition-colors",
                activeTabId === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground/60"
              )}
            >
              <span className="flex items-center gap-1.5">
                {tab.id === "settings" ? (
                  <Settings size={16} strokeWidth={1.8} />
                ) : null}
                {tab.label}
                {tab.id !== "settings" && (
                  <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-muted px-1 text-[11px] font-semibold tabular-nums leading-none text-muted-foreground">
                    {watchlists.find((w) => w.id === tab.id)?.stocks.length ?? 0}
                  </span>
                )}
              </span>
              {activeTabId === tab.id && (
                <motion.div
                  layoutId="watchlist-tab-underline"
                  className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <main className="no-scrollbar flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {activeTabId === "settings" ? (
              <SettingsTab
                watchlists={watchlists}
                onRename={handleRenameWatchlist}
                onDelete={handleDeleteWatchlist}
                onAdd={handleAddWatchlist}
                onReorder={handleReorderWatchlist}
                config={config}
                onConfigChange={handleConfigChange}
              />
            ) : activeWatchlist ? (
              <WatchlistTabContent
                watchlist={activeWatchlist}
                onDeleteStock={(symbol) => handleDeleteStock(activeWatchlist.id, symbol)}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}
