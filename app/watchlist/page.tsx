"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAI } from "@/contexts/ai-context";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  AlarmClock,
  Trash2,
  Plus,
  SlidersHorizontal,
  Pencil,
  Check,
  X,
  ArrowUpDown,
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
    label: "My Watchlist",
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
  }, [watchlist.stocks, topGainer, topLoser, secondMover]);

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
      <button
        onClick={handleGenerate}
        className="flex w-full items-center justify-center gap-2 py-8 active:opacity-70"
      >
        <Sparkles size={14} className="text-muted-foreground/30" />
        <span className="text-[13px] font-medium text-muted-foreground/40">Tap for AI summary</span>
      </button>
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

const ROW_H = "h-[56px]";
const HDR_H = "h-[36px]";
const FROZEN_W = 195;
const thCls = "whitespace-nowrap px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";
const tdCls = "whitespace-nowrap px-5 text-[13px] tabular-nums text-right";

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

  return (
    <div className="mx-4 overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="flex">
        {/* ── Frozen left column ── */}
        <div
          className="z-10 flex-shrink-0 border-r border-border/20 bg-card"
          style={{ width: FROZEN_W }}
        >
          {/* Header */}
          <div className={cn(HDR_H, "flex items-center pl-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground")}>
            STOCK
          </div>
          {/* Rows */}
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => onTapStock(stock.symbol)}
              className={cn(
                ROW_H,
                "flex items-center gap-2.5 pl-5 pr-3 border-t border-border/10 cursor-pointer active:bg-muted/20 transition-colors"
              )}
            >
              <div className="grayscale shrink-0">
                <TickerLogo ticker={stock} size="sm" />
              </div>
              <p className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-tight text-foreground">
                {stock.name}
              </p>
            </div>
          ))}
        </div>

        {/* ── Scrollable right columns ── */}
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <table className="w-max min-w-full border-collapse" style={{ minWidth: 780 }}>
            <thead>
              <tr className={HDR_H}>
                {/* Price action — visible in viewport */}
                <th className={cn(thCls, "text-right w-[90px]")}>Price</th>
                <th className={cn(thCls, "text-right w-[68px]")}>Chg%</th>
                <th className={cn(thCls, "text-right min-w-[68px]")}>Ext Hrs</th>
                {/* Trading activity */}
                <th className={cn(thCls, "text-right min-w-[60px]")}>Volume</th>
                <th className={cn(thCls, "text-right min-w-[68px]")}>Mkt Cap</th>
                {/* Valuation */}
                <th className={cn(thCls, "text-right min-w-[52px]")}>PE</th>
                <th className={cn(thCls, "text-right min-w-[56px]")}>EPS</th>
                {/* Growth */}
                <th className={cn(thCls, "text-right min-w-[64px]")}>Rev Gr.</th>
                <th className={cn(thCls, "text-right min-w-[68px]")}>Earn Gr.</th>
                {/* Income & Range */}
                <th className={cn(thCls, "text-right min-w-[56px]")}>Div %</th>
                <th className={cn(thCls, "text-center min-w-[120px]")}>52W Range</th>
                {/* Actions */}
                <th className={cn(thCls, "text-center w-[44px]")}>ALERT</th>
                <th className={cn(thCls, "text-center w-[44px]")}>DEL</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => {
                const f = getFundamentals(stock.symbol);
                const gain = isGain(stock);
                const pct52 = range52wPct(stock.price, f.low52w, f.high52w);

                return (
                  <tr key={stock.symbol} className={cn(ROW_H, "border-t border-border/10")}>
                    {/* Price + change */}
                    <td className={cn(tdCls, "text-right")}>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{formatPrice(stock.price)}</p>
                        <p className={cn("text-[11px] font-medium", gain ? "text-gain" : "text-loss")}>
                          {formatChange(stock.change)}
                        </p>
                      </div>
                    </td>
                    {/* Change % */}
                    <td className={tdCls}>
                      <span className={cn("text-[13px] font-semibold", gain ? "text-gain" : "text-loss")}>
                        {formatPercent(stock.changePercent)}
                      </span>
                    </td>
                    {/* Extended Hours Change */}
                    <td className={tdCls}>
                      <span className={cn("text-[13px] font-medium", f.extHoursChg >= 0 ? "text-gain" : "text-loss")}>
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
                      <span className={cn("text-[13px] font-medium", f.revGrowth >= 0 ? "text-gain" : "text-loss")}>
                        {f.revGrowth >= 0 ? "+" : ""}{f.revGrowth.toFixed(1)}%
                      </span>
                    </td>
                    {/* Earnings Growth */}
                    <td className={tdCls}>
                      <span className={cn("text-[13px] font-medium", f.earnGrowth >= 0 ? "text-gain" : "text-loss")}>
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
          className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border/60 px-3.5 py-2 text-[13px] font-semibold text-foreground transition-all"
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
  onAdd,
  onReorder,
}: {
  watchlists: WatchlistData[];
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onReorder: (reordered: WatchlistData[]) => void;
}) {
  return (
    <div className="pb-6 pt-2">
      {/* ── Manage Watchlists ── */}
      <div className="px-5">
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

      {/* Add new watchlist */}
      <div className="px-5">
        <button
          onClick={onAdd}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-3 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-border active:scale-[0.98]"
        >
          <Plus size={16} />
          Create Watchlist
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

// ── Shared watchlist content (no shell) ──────────────────────────────
export function WatchlistContent() {
  const [watchlists, setWatchlists] = useState<WatchlistData[]>(INITIAL_WATCHLISTS);
  const [activeTabId, setActiveTabId] = useState("wl-1");
  const tabs = useMemo(() => {
    return [
      ...watchlists.map((wl) => ({ id: wl.id, label: wl.label })),
      { id: "settings", label: "Customize" },
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


  return (
    <>
      {/* Tab Bar */}
      <div className="relative flex items-center border-b border-border/40">
        <div className="no-scrollbar flex-1 flex overflow-x-auto pl-1 gap-0.5">
          {tabs.filter((t) => t.id !== "settings").map((tab) => (
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
                {tab.label}
                <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-muted px-1 text-[11px] font-semibold tabular-nums leading-none text-muted-foreground">
                  {watchlists.find((w) => w.id === tab.id)?.stocks.length ?? 0}
                </span>
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
          <button
            onClick={handleAddWatchlist}
            className="shrink-0 px-2 py-2.5 text-muted-foreground/40 active:text-muted-foreground transition-colors"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>
        <button
          onClick={() => setActiveTabId("settings")}
          className={cn(
            "shrink-0 px-4 py-2.5 transition-colors",
            activeTabId === "settings" ? "text-foreground" : "text-muted-foreground/50"
          )}
        >
          <SlidersHorizontal size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTabId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {activeTabId === "settings" ? (
            <CustomizeTab
              watchlists={watchlists}
              onRename={handleRenameWatchlist}
              onDelete={handleDeleteWatchlist}
              onAdd={handleAddWatchlist}
              onReorder={handleReorderWatchlist}
            />
          ) : activeWatchlist ? (
            <WatchlistTabContent
              watchlist={activeWatchlist}
              onDeleteStock={(symbol) => handleDeleteStock(activeWatchlist.id, symbol)}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

    </>
  );
}

// ── Page (with shell) ────────────────────────────────────────────────
export default function WatchlistPage() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <Header />
      <TickerMarquee />
      <main className="no-scrollbar flex-1 overflow-y-auto">
        <WatchlistContent />
      </main>
      {/* Floating add button */}
      <button
        onClick={() => window.location.href = "/search"}
        className="absolute bottom-20 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-90"
      >
        <Plus size={22} strokeWidth={2} />
      </button>
      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}
