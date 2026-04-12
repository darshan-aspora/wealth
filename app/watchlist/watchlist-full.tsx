"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAI } from "@/contexts/ai-context";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Bookmark,
  Sparkles,
  RefreshCw,
  AlarmClock,
  Trash2,
  Plus,
  Search,
  Pencil,
  Check,
  X,
  ArrowUpDown,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  ALL_TICKERS,
  formatPrice,
  formatPercent,
  isGain,
  type TickerItem,
} from "@/components/ticker";

/* ------------------------------------------------------------------ */
/*  Watchlist data definitions                                         */
/* ------------------------------------------------------------------ */

interface WatchlistData {
  id: string;
  label: string;
  stocks: TickerItem[];
}

/* Themed watchlist stock data */
const MAG7_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA"];
const AI_SYMBOLS = ["NVDA", "AMD", "AVGO", "MSFT", "GOOGL", "META"];
const EV_SYMBOLS = ["TSLA", "RIVN", "LCID", "NIO", "LI", "XPEV"];

const INITIAL_WATCHLISTS: WatchlistData[] = [
  {
    id: "wl-1",
    label: "Mag 7",
    stocks: ALL_TICKERS.filter((t) => MAG7_SYMBOLS.includes(t.symbol)),
  },
  {
    id: "wl-2",
    label: "AI",
    stocks: ALL_TICKERS.filter((t) => AI_SYMBOLS.includes(t.symbol)),
  },
  {
    id: "wl-3",
    label: "EV",
    stocks: ALL_TICKERS.filter((t) => EV_SYMBOLS.includes(t.symbol)),
  },
  {
    id: "wl-4",
    label: "My Watchlist",
    stocks: [],
  },
];


/* ------------------------------------------------------------------ */
/*  AI Summary section                                                 */
/* ------------------------------------------------------------------ */

type AiPhase = "idle" | "analyzing" | "typing" | "complete";

type SummarySegment =
  | { type: "text"; content: string }
  | { type: "stock"; symbol: string; name: string; changePercent: number };

/* Mock news sources */
function StockBadge({ name, changePercent, onTap }: { symbol: string; name: string; changePercent: number; onTap: () => void }) {
  const gain = changePercent >= 0;
  return (
    <span className="inline whitespace-nowrap">
      <button onClick={onTap} className="font-bold text-foreground active:underline">{name}</button>
      {" "}
      <span className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums align-middle",
        gain ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
      )}>
        <span className="text-[10px]">{gain ? "↗" : "↘"}</span>
        {Math.abs(changePercent).toFixed(2)}%
      </span>
    </span>
  );
}

function AiSummaryCard({ watchlist }: { watchlist: WatchlistData }) {
  const router = useRouter();
  const [phase, setPhase] = useState<AiPhase>("idle");
  const [visibleChars, setVisibleChars] = useState(0);
  const completedRef = useRef(false);

  const sorted = useMemo(() => [...watchlist.stocks].sort((a, b) => b.changePercent - a.changePercent), [watchlist.stocks]);
  const topGainer = sorted[0];
  const topLoser = sorted[sorted.length - 1];
  const secondMover = sorted.length > 2 ? (sorted[1].changePercent > 0 ? sorted[1] : sorted[sorted.length - 2]) : null;

  const segments = useMemo(() => {
    const segs: SummarySegment[] = [];

    if (topGainer && topGainer.changePercent > 0) {
      segs.push({ type: "text", content: "Leading today's session, " });
      segs.push({ type: "stock", symbol: topGainer.symbol, name: topGainer.name, changePercent: topGainer.changePercent });
      segs.push({ type: "text", content: " is showing strong upside momentum on elevated volume — institutional flows appear supportive heading into the week. " });
    }

    if (secondMover && secondMover.symbol !== topGainer?.symbol && secondMover.symbol !== topLoser?.symbol) {
      segs.push({ type: "stock", symbol: secondMover.symbol, name: secondMover.name, changePercent: secondMover.changePercent });
      segs.push({ type: "text", content: ` ${secondMover.changePercent >= 0 ? "is also catching a bid as analysts raise near-term estimates" : "has pulled back on profit-taking after recent strength"}. ` });
    }

    if (topLoser && topLoser.changePercent < 0) {
      segs.push({ type: "text", content: "On the downside, " });
      segs.push({ type: "stock", symbol: topLoser.symbol, name: topLoser.name, changePercent: topLoser.changePercent });
      segs.push({ type: "text", content: " faces pressure — worth monitoring for potential entry if the selloff is technically driven rather than fundamental. " });
    }

    segs.push({ type: "text", content: "Overall, rotation within the group suggests mixed conviction; keep an eye on Treasury yields which may impact growth multiples this week." });
    return segs;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topGainer, topLoser, secondMover]);

  /* Total character length for typing effect — stock badges count as their label length */
  const segmentLengths = useMemo(() => segments.map((s) => s.type === "text" ? s.content.length : s.name.length), [segments]);
  const totalChars = useMemo(() => segmentLengths.reduce((a, b) => a + b, 0), [segmentLengths]);

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
        const next = Math.min(prev + step, totalChars);
        if (next >= totalChars && !completedRef.current) {
          completedRef.current = true;
          clearInterval(interval);
          setTimeout(() => setPhase("complete"), 200);
        }
        return next;
      });
    }, 18);
    return () => clearInterval(interval);
  }, [phase, totalChars]);

  const handleGenerate = () => {
    setVisibleChars(0);
    completedRef.current = false;
    setPhase("analyzing");
  };

  if (phase === "idle") {
    return (
      <div className="px-5 py-4">
        <button
          onClick={handleGenerate}
          className="relative w-full overflow-hidden rounded-2xl border border-border/40 p-5 active:scale-[0.99] transition-transform"
        >
          {/* Breathing gradient border */}
          <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none">
            <motion.div
              className="absolute inset-[-2px] rounded-2xl"
              style={{
                background: "conic-gradient(from 0deg, transparent, hsl(var(--foreground) / 0.08), transparent, hsl(var(--foreground) / 0.04), transparent)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="relative flex items-center justify-center gap-2.5">
            <Sparkles size={16} className="text-foreground/60" />
            <p className="text-[15px] font-semibold text-foreground">Analyze with AI</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-2">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={14} className="text-muted-foreground/50" />
        <span className="text-[13px] font-medium text-muted-foreground/50">AI Summary</span>
        {phase === "analyzing" && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="ml-auto"
          >
            <RefreshCw size={14} className="text-muted-foreground/30" />
          </motion.div>
        )}
        {phase === "complete" && (
          <span className="ml-auto text-[11px] text-muted-foreground/30">Updated now</span>
        )}
      </div>

      {/* Analyzing state */}
      {phase === "analyzing" && (
        <div className="flex items-center gap-2 py-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
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
          <p className="text-[15px] leading-[1.8] text-foreground/85">
            {(() => {
              let consumed = 0;
              return segments.map((seg, i) => {
                const segLen = segmentLengths[i];
                const remaining = visibleChars - consumed;
                consumed += segLen;
                if (remaining <= 0) return null;

                if (seg.type === "stock") {
                  if (remaining < segLen) return null;
                  return (
                    <StockBadge
                      key={i}
                      symbol={seg.symbol}
                      name={seg.name}
                      changePercent={seg.changePercent}
                      onTap={() => router.push(`/stocks/${seg.symbol}`)}
                    />
                  );
                }

                const visible = seg.content.slice(0, Math.min(remaining, segLen));
                return <span key={i}>{visible}</span>;
              });
            })()}
            {phase === "typing" && (
              <motion.span
                className="inline-block w-[2px] h-[16px] ml-0.5 align-text-bottom bg-foreground/60"
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
          transition={{ delay: 0.4 }}
          onClick={handleGenerate}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/40 py-2.5 text-[13px] font-medium text-muted-foreground/70 transition-colors active:bg-muted/30"
        >
          <RefreshCw size={13} />
          Reanalyze
        </motion.button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Fundamental data (mock)                                            */
/* ------------------------------------------------------------------ */

interface Fundamentals {
  pe: number | null;
  eps: number;
  revGrowth: number;    // YoY %
  earnGrowth: number;   // YoY %
  divYield: number;     // %
  high52w: number;
  low52w: number;
  extHoursChg: number;  // extended hours price change %
}

const FUNDAMENTALS: Record<string, Fundamentals> = {
  // MAG7
  AAPL:  { pe: 33.2,  eps: 6.88,  revGrowth: 4.8,   earnGrowth: 10.2,  divYield: 0.44, high52w: 237.49, low52w: 164.08, extHoursChg: 0.18 },
  MSFT:  { pe: 36.8,  eps: 11.74, revGrowth: 16.4,  earnGrowth: 21.8,  divYield: 0.72, high52w: 468.35, low52w: 366.50, extHoursChg: -0.12 },
  GOOGL: { pe: 24.1,  eps: 7.42,  revGrowth: 13.6,  earnGrowth: 31.4,  divYield: 0.45, high52w: 191.75, low52w: 130.67, extHoursChg: 0.34 },
  AMZN:  { pe: 42.5,  eps: 4.88,  revGrowth: 12.5,  earnGrowth: 55.2,  divYield: 0,    high52w: 220.76, low52w: 151.61, extHoursChg: -0.45 },
  NVDA:  { pe: 58.4,  eps: 2.26,  revGrowth: 122.4, earnGrowth: 168.0, divYield: 0.02, high52w: 152.89, low52w: 75.61,  extHoursChg: 1.22 },
  META:  { pe: 27.6,  eps: 22.20, revGrowth: 24.3,  earnGrowth: 73.1,  divYield: 0.33, high52w: 638.40, low52w: 414.50, extHoursChg: -0.67 },
  TSLA:  { pe: 68.2,  eps: 3.64,  revGrowth: -8.7,  earnGrowth: -45.2, divYield: 0,    high52w: 488.54, low52w: 138.80, extHoursChg: 2.14 },
  // AI Infra
  AMD:   { pe: 44.8,  eps: 2.65,  revGrowth: 10.2,  earnGrowth: 25.6,  divYield: 0,    high52w: 164.46, low52w: 94.01,  extHoursChg: -0.38 },
  AVGO:  { pe: 32.1,  eps: 5.81,  revGrowth: 44.0,  earnGrowth: 28.3,  divYield: 1.24, high52w: 251.88, low52w: 122.34, extHoursChg: 0.52 },
  TSM:   { pe: 28.4,  eps: 6.28,  revGrowth: 33.9,  earnGrowth: 40.1,  divYield: 1.12, high52w: 212.60, low52w: 126.40, extHoursChg: 0.08 },
  ARM:   { pe: 198.0, eps: 0.83,  revGrowth: 23.1,  earnGrowth: 54.8,  divYield: 0,    high52w: 188.75, low52w: 98.56,  extHoursChg: -1.05 },
  SMCI:  { pe: 12.4,  eps: 3.10,  revGrowth: 54.9,  earnGrowth: 42.5,  divYield: 0,    high52w: 122.90, low52w: 17.25,  extHoursChg: 0.76 },
  MRVL:  { pe: 62.3,  eps: 1.41,  revGrowth: 27.4,  earnGrowth: 38.2,  divYield: 0.28, high52w: 120.38, low52w: 60.14,  extHoursChg: -0.22 },
  ANET:  { pe: 48.6,  eps: 7.05,  revGrowth: 19.8,  earnGrowth: 32.6,  divYield: 0,    high52w: 422.73, low52w: 232.87, extHoursChg: 0.41 },
};

function getFundamentals(symbol: string): Fundamentals {
  return FUNDAMENTALS[symbol] ?? { pe: null, eps: 0, revGrowth: 0, earnGrowth: 0, divYield: 0, high52w: 0, low52w: 0, extHoursChg: 0 };
}

function formatMktCap(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(0)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  return n.toFixed(0);
}

function formatVol(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toFixed(0);
}

/* ------------------------------------------------------------------ */
/*  Sort options                                                       */
/* ------------------------------------------------------------------ */

type SortKey = "change" | "symbol" | "price" | "volume";

const SORT_CYCLE: { key: SortKey; label: string }[] = [
  { key: "change", label: "% Change" },
  { key: "volume", label: "Volume" },
  { key: "symbol", label: "A–Z" },
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
/*  Watchlist Table                                                     */
/* ------------------------------------------------------------------ */

const ROW_H = "h-[64px]";
const HDR_H = "h-[40px]";
const thCls = "whitespace-nowrap px-4 text-[14px] font-medium text-muted-foreground";
const tdCls = "whitespace-nowrap px-4 text-[14px] tabular-nums text-right";

function WatchlistTable({
  stocks,
  onDeleteStock,
  onTapStock,
}: {
  stocks: TickerItem[];
  onDeleteStock: (symbol: string) => void;
  onTapStock: (symbol: string) => void;
}) {
  /* 52w range bar helper */
  const range52wPct = (price: number, low: number, high: number) => {
    if (high === low) return 50;
    return Math.max(0, Math.min(100, ((price - low) / (high - low)) * 100));
  };

  /* Measure first 2 data column widths → derive frozen width */
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [frozenW, setFrozenW] = useState<number | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const table = tableRef.current;
    if (!container || !table) return;
    const ths = table.querySelectorAll("thead th");
    if (ths.length < 2) return;
    const col2 = ths[0].getBoundingClientRect().width;
    const col3 = ths[1].getBoundingClientRect().width;
    const containerW = container.getBoundingClientRect().width;
    setFrozenW(Math.max(120, containerW - col2 - col3));
  }, []);

  useEffect(() => { measure(); }, [measure, stocks]);
  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const handleTableScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrolled(el.scrollLeft > 0);
  }, []);

  return (
    <div ref={containerRef}>
      <div className="flex">
        {/* ── Frozen left column — dynamic width ── */}
        <div className={cn("z-10 shrink-0 bg-background border-r transition-colors duration-200", isScrolled ? "border-border/40" : "border-transparent")} style={{ width: frozenW ?? 160 }}>
          {/* Header */}
          <div className={cn(HDR_H, "flex items-center pl-5 pr-3 text-[14px] font-medium text-muted-foreground")}>
            Stock
          </div>
          {/* Rows */}
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => onTapStock(stock.symbol)}
              className={cn(
                ROW_H,
                "flex items-center gap-2.5 pl-5 pr-3 cursor-pointer active:bg-muted/20 transition-colors"
              )}
            >
              <div className="h-8 w-8 shrink-0 rounded-full bg-muted-foreground/25" />
              <p className="min-w-0 flex-1 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">
                {stock.name}
              </p>
            </div>
          ))}
        </div>

        {/* ── Scrollable right columns — content-sized ── */}
        <div ref={scrollRef} onScroll={handleTableScroll} className="flex-1 overflow-x-auto no-scrollbar min-w-0">
          <table ref={tableRef} style={{ minWidth: 780 }}>
            <thead>
              <tr className={HDR_H}>
                <th className={cn(thCls, "text-right")}>Price</th>
                <th className={cn(thCls, "text-right")}>Chg%</th>
                <th className={cn(thCls, "text-right")}>Ext Hrs</th>
                <th className={cn(thCls, "text-right")}>Volume</th>
                <th className={cn(thCls, "text-right")}>Mkt Cap</th>
                <th className={cn(thCls, "text-right")}>PE</th>
                <th className={cn(thCls, "text-right")}>EPS</th>
                <th className={cn(thCls, "text-right")}>Rev Gr.</th>
                <th className={cn(thCls, "text-right")}>Earn Gr.</th>
                <th className={cn(thCls, "text-right")}>Div %</th>
                <th className={cn(thCls, "text-center min-w-[120px]")}>52W Range</th>
                <th className={cn(thCls, "text-center")}>Alert</th>
                <th className={cn(thCls, "text-center")}>Del</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => {
                const f = getFundamentals(stock.symbol);
                const gain = isGain(stock);
                const pct52 = range52wPct(stock.price, f.low52w, f.high52w);

                return (
                  <tr key={stock.symbol} className={cn(ROW_H, "border-t border-border/10")}>
                    {/* Price */}
                    <td className={cn(tdCls, "text-right")}>
                      <span className="text-[14px] font-semibold text-foreground">{stock.price.toFixed(1)}</span>
                    </td>
                    {/* Change % */}
                    <td className={tdCls}>
                      <span className={cn("text-[14px] font-semibold", gain ? "text-gain" : "text-loss")}>
                        {formatPercent(stock.changePercent)}
                      </span>
                    </td>
                    {/* Extended Hours Change */}
                    <td className={tdCls}>
                      <span className={cn("text-[14px] font-medium", f.extHoursChg >= 0 ? "text-gain" : "text-loss")}>
                        {f.extHoursChg >= 0 ? "+" : ""}{f.extHoursChg.toFixed(2)}%
                      </span>
                    </td>
                    {/* Volume */}
                    <td className={cn(tdCls, "text-foreground/60")}>
                      {formatVol(stock.volume ?? 0)}
                    </td>
                    {/* Mkt Cap */}
                    <td className={cn(tdCls, "text-foreground/80")}>
                      {formatMktCap(stock.marketCap ?? 0)}
                    </td>
                    {/* PE */}
                    <td className={cn(tdCls, "text-foreground/80")}>
                      {f.pe !== null ? f.pe.toFixed(1) : "—"}
                    </td>
                    {/* EPS */}
                    <td className={cn(tdCls, f.eps >= 0 ? "text-foreground/80" : "text-loss/70")}>
                      {f.eps.toFixed(2)}
                    </td>
                    {/* Rev Growth */}
                    <td className={tdCls}>
                      <span className={cn("text-[14px] font-medium", f.revGrowth >= 0 ? "text-gain" : "text-loss")}>
                        {f.revGrowth >= 0 ? "+" : ""}{f.revGrowth.toFixed(1)}%
                      </span>
                    </td>
                    {/* Earnings Growth */}
                    <td className={tdCls}>
                      <span className={cn("text-[14px] font-medium", f.earnGrowth >= 0 ? "text-gain" : "text-loss")}>
                        {f.earnGrowth === 0 && f.eps < 0 ? "—" : `${f.earnGrowth >= 0 ? "+" : ""}${f.earnGrowth.toFixed(1)}%`}
                      </span>
                    </td>
                    {/* Div Yield */}
                    <td className={cn(tdCls, "text-foreground/80")}>
                      {f.divYield > 0 ? `${f.divYield.toFixed(2)}%` : "—"}
                    </td>
                    {/* 52W Range Bar */}
                    <td className="whitespace-nowrap px-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="relative h-[4px] w-full rounded-full bg-muted/60">
                          <div
                            className="absolute top-[-2px] h-[8px] w-[8px] rounded-full bg-foreground/70"
                            style={{ left: `calc(${pct52}% - 4px)` }}
                          />
                        </div>
                        <div className="flex w-full justify-between">
                          <span className="text-[10px] text-muted-foreground/50 tabular-nums">{f.low52w.toFixed(0)}</span>
                          <span className="text-[10px] text-muted-foreground/50 tabular-nums">{f.high52w.toFixed(0)}</span>
                        </div>
                      </div>
                    </td>
                    {/* Alert */}
                    <td className="whitespace-nowrap px-1">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground active:bg-muted/50 transition-colors"
                      >
                        <AlarmClock size={17} strokeWidth={1.8} />
                      </button>
                    </td>
                    {/* Delete */}
                    <td className="whitespace-nowrap px-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteStock(stock.symbol); }}
                        className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-red-400 hover:text-red-300 active:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={17} strokeWidth={1.8} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
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
  const [sortIdx, setSortIdx] = useState(0);

  const sortKey = SORT_CYCLE[sortIdx].key;
  const sortLabel = SORT_CYCLE[sortIdx].label;

  const flipSort = () => setSortIdx((i) => (i + 1) % SORT_CYCLE.length);


  const sortedStocks = useMemo(
    () => sortStocks(watchlist.stocks, sortKey),
    [watchlist.stocks, sortKey]
  );

  return (
    <div className="pb-6">
      {/* AI Summary — top of watchlist */}
      <div className="mt-1">
        <AiSummaryCard watchlist={watchlist} />
      </div>

      {/* Stats bar + flipper sort */}
      <div className="flex items-center justify-between px-5 py-2.5">
        <span className="text-[14px] text-muted-foreground">
          {watchlist.stocks.length} items
        </span>

        {/* Sort flipper — cycles on tap */}
        <button
          onClick={flipSort}
          className="flex items-center gap-1.5 overflow-hidden text-[14px] font-semibold text-muted-foreground active:opacity-70 transition-opacity"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={sortKey}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {sortLabel}
            </motion.span>
          </AnimatePresence>
          <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />
        </button>
      </div>

      {/* Stock table */}
      <WatchlistTable
        stocks={sortedStocks}
        onDeleteStock={onDeleteStock}
        onTapStock={(symbol) => router.push(`/stocks/${symbol}`)}
      />

    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

const RECOMMENDED_STOCKS = ALL_TICKERS.filter((t) =>
  ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "TSLA", "META", "AVGO"].includes(t.symbol)
);

function WatchlistEmptyState({ watchlist }: { watchlist: WatchlistData }) {
  return (
    <div className="pt-6 pb-10">
      {/* Empty message */}
      <div className="flex flex-col items-center px-8 text-center mb-8">
        <div className="h-14 w-14 rounded-full bg-muted mb-4" />
        <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
          Use the search bar above to add stocks, ETFs, or options to {watchlist.label}.
        </p>
        <button
          onClick={() => window.location.href = `/search?from=watchlist&wl=${watchlist.id}&wlName=${encodeURIComponent(watchlist.label)}`}
          className="rounded-full bg-foreground px-6 py-2.5 text-[14px] font-semibold text-background active:opacity-90 transition-opacity"
        >
          Search and Add
        </button>
      </div>

      {/* Recommended */}
      <div className="px-5">
        <p className="text-[14px] font-semibold text-muted-foreground mb-3">Based on &quot;{watchlist.label}&quot;</p>
        <div className="space-y-0">
          {RECOMMENDED_STOCKS.map((stock) => {
            const gain = stock.changePercent >= 0;
            return (
              <button
                key={stock.symbol}
                className="flex w-full items-center gap-3 py-3 text-left active:bg-muted/30 transition-colors"
              >
                <div className="h-9 w-9 shrink-0 rounded-full bg-muted-foreground/25" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground">{stock.name}</p>
                </div>
                <div className="text-right mr-1">
                  <p className="text-[14px] tabular-nums text-foreground">{formatPrice(stock.price)}</p>
                  <p className={cn("text-[13px] tabular-nums font-medium", gain ? "text-gain" : "text-loss")}>
                    {formatPercent(stock.changePercent)}
                  </p>
                </div>
                <Bookmark size={20} strokeWidth={1.8} className="shrink-0 text-muted-foreground/50 active:text-foreground transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Customize Tab                                                      */
/* ------------------------------------------------------------------ */

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
      className="flex items-center gap-2 px-5 py-3.5 bg-background"
      whileDrag={{ scale: 1.02, zIndex: 50 }}
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

function CustomizeTab({
  watchlists,
  onRename,
  onDelete,
  onReorder,
}: {
  watchlists: WatchlistData[];
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onReorder: (reordered: WatchlistData[]) => void;
}) {
  return (
    <div className="pt-1 pb-2">
      <Reorder.Group axis="y" values={watchlists} onReorder={onReorder} className="bg-background">
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
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

// ── Shared watchlist content (no shell) ──────────────────────────────
export function WatchlistContent({ onSettingsRef }: { onSettingsRef?: React.MutableRefObject<(() => void) | null> }) {
  const [watchlists, setWatchlists] = useState<WatchlistData[]>(INITIAL_WATCHLISTS);
  const [activeTabId, setActiveTabId] = useState("wl-1");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const tabs = useMemo(() => {
    return watchlists.map((wl) => ({ id: wl.id, label: wl.label }));
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


  const [deleteToast, setDeleteToast] = useState<{ symbol: string; name: string; watchlistId: string; stock: TickerItem; index: number } | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDeleteStock = useCallback(
    (watchlistId: string, symbol: string) => {
      // Find the stock before removing
      const wl = watchlists.find((w) => w.id === watchlistId);
      const stockIdx = wl?.stocks.findIndex((s) => s.symbol === symbol) ?? -1;
      const stock = wl?.stocks[stockIdx];

      setWatchlists((prev) =>
        prev.map((w) =>
          w.id === watchlistId
            ? { ...w, stocks: w.stocks.filter((s) => s.symbol !== symbol) }
            : w
        )
      );

      if (stock) {
        if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
        setDeleteToast({ symbol, name: stock.name, watchlistId, stock, index: stockIdx });
        deleteTimerRef.current = setTimeout(() => setDeleteToast(null), 4000);
      }
    },
    [watchlists]
  );

  const undoDelete = useCallback(() => {
    if (!deleteToast) return;
    const { watchlistId, stock, index } = deleteToast;
    setWatchlists((prev) =>
      prev.map((wl) => {
        if (wl.id !== watchlistId) return wl;
        const newStocks = [...wl.stocks];
        newStocks.splice(Math.min(index, newStocks.length), 0, stock);
        return { ...wl, stocks: newStocks };
      })
    );
    setDeleteToast(null);
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
  }, [deleteToast]);

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

  const [newWlSheetOpen, setNewWlSheetOpen] = useState(false);
  const [newWlName, setNewWlName] = useState("");
  const newWlInputRef = useRef<HTMLInputElement>(null);

  const handleAddWatchlist = useCallback(() => {
    setNewWlName("");
    setNewWlSheetOpen(true);
  }, []);

  const handleConfirmNewWatchlist = useCallback(() => {
    const label = newWlName.trim() || `Watchlist ${watchlists.length + 1}`;
    const newId = `wl-${Date.now()}`;
    setWatchlists((prev) => [
      ...prev,
      { id: newId, label, stocks: [] },
    ]);
    setActiveTabId(newId);
    setNewWlSheetOpen(false);
  }, [newWlName, watchlists.length]);

  const handleReorderWatchlist = useCallback((reordered: WatchlistData[]) => {
    setWatchlists(reordered);
  }, []);


  // Wire settings ref so parent header can open customize
  useEffect(() => {
    if (onSettingsRef) onSettingsRef.current = () => setCustomizeOpen(true);
  }, [onSettingsRef]);

  return (
    <>
      {/* Tab Bar */}
      <div className="relative flex items-center border-b border-border/40">
        <div className="no-scrollbar flex-1 flex overflow-x-auto px-5 gap-0">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(
                "relative whitespace-nowrap py-2.5 text-[16px] font-semibold transition-colors",
                i === 0 ? "pr-3" : "px-3",
                activeTabId === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
              {activeTabId === tab.id && (
                <motion.div
                  layoutId="watchlist-tab-underline"
                  className={cn(
                    "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                    i === 0 ? "left-0" : "left-3"
                  )}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
        <button
          onClick={handleAddWatchlist}
          className="shrink-0 px-4 py-2.5 text-muted-foreground/50 active:text-muted-foreground transition-colors"
        >
          <Plus size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Search box — below tabs */}
      {(
        <div className="px-5 pt-3 pb-1" onClick={() => window.location.href = "/search"}>
          <div className="flex items-center h-11 rounded-xl bg-muted/50 px-4 cursor-pointer active:bg-muted transition-colors">
            <Search size={16} strokeWidth={1.8} className="shrink-0 text-muted-foreground/50 mr-2.5" />
            <span className="text-[15px] text-muted-foreground/40">Search and add</span>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTabId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {activeWatchlist ? (
            activeWatchlist.stocks.length > 0 ? (
              <WatchlistTabContent
                watchlist={activeWatchlist}
                onDeleteStock={(symbol) => handleDeleteStock(activeWatchlist.id, symbol)}
              />
            ) : (
              <WatchlistEmptyState watchlist={activeWatchlist} />
            )
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Customize Sheet */}
      <Sheet open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85dvh] flex flex-col p-0" hideClose>
          {/* Header */}
          <div className="flex items-center justify-center px-5 pt-5 pb-3">
            <h3 className="text-[17px] font-semibold text-foreground">Manage Watchlists</h3>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            <CustomizeTab
              watchlists={watchlists}
              onRename={handleRenameWatchlist}
              onDelete={handleDeleteWatchlist}
              onReorder={handleReorderWatchlist}
            />
          </div>

          {/* Done button */}
          <div className="px-5 pt-3 pb-6 bg-background">
            <button
              onClick={() => setCustomizeOpen(false)}
              className="w-full rounded-full bg-foreground py-3.5 text-[15px] font-semibold text-background active:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* New Watchlist Sheet */}
      <Sheet open={newWlSheetOpen} onOpenChange={setNewWlSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-5 pb-10"
          hideClose
          onOpenAutoFocus={() => setTimeout(() => newWlInputRef.current?.focus(), 100)}
        >
          <div className="pt-2">
            <h3 className="text-[17px] font-semibold text-foreground mb-4">New Watchlist</h3>
            <input
              ref={newWlInputRef}
              value={newWlName}
              onChange={(e) => setNewWlName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirmNewWatchlist(); }}
              placeholder="Watchlist name"
              className="w-full rounded-xl bg-muted/50 px-4 py-3 text-[16px] text-foreground placeholder:text-muted-foreground/40 outline-none mb-5"
            />
            <button
              onClick={handleConfirmNewWatchlist}
              className="w-full rounded-full bg-foreground py-3 text-[15px] font-semibold text-background active:opacity-90 transition-opacity"
            >
              Create
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete toast with undo */}
      <AnimatePresence>
        {deleteToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-0 right-0 z-50 mx-auto w-fit"
          >
            <div className="flex items-center gap-3 rounded-full bg-foreground px-5 py-2.5 shadow-lg">
              <p className="text-[14px] font-medium text-background">
                {deleteToast.name} removed
              </p>
              <button
                onClick={undoDelete}
                className="text-[14px] font-bold text-background/70 active:text-background transition-colors"
              >
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

