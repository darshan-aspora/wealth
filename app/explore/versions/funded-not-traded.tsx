"use client";

import { useState, useMemo } from "react";
import {
  Bookmark,
  Brain,
  Zap,
  Coins,
  Dna,
  Layers,
  Cpu,
  CreditCard,
  Cloud,
  TrendingUp,
  Shield,
  HeartPulse,
  ShoppingCart,
  ArrowUpDown,
  ChevronRight,
  Target,
  Plus,
  Filter,
  TrendingDown,
  BarChart3,
  Gem,
  Rocket,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
// pills used instead of shadcn Tabs

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CapSize = "mega" | "large" | "small";
type MoverType = "gainers" | "losers";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  pe: number | null;
  high52w: number;
  low52w: number;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Sparkline generator (deterministic per symbol)                     */
/* ------------------------------------------------------------------ */

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function makeSparkline(symbol: string, isGainer: boolean): number[] {
  const seed = hashStr(symbol);
  const pts: number[] = [];
  let v = 50;
  for (let i = 0; i < 24; i++) {
    const r = (Math.sin(seed + i * 127) + 1) / 2;
    v += (r - 0.5 + (isGainer ? 0.15 : -0.15)) * 6;
    v = Math.max(12, Math.min(88, v));
    pts.push(v);
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/*  Sparkline SVG                                                      */
/* ------------------------------------------------------------------ */

function Sparkline({
  points,
  color,
  w = 52,
  h = 22,
}: {
  points: number[];
  color: string;
  w?: number;
  h?: number;
}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  52-Week Range Bar                                                  */
/* ------------------------------------------------------------------ */

function Range52W({
  low,
  high,
  current,
}: {
  low: number;
  high: number;
  current: number;
}) {
  const range = high - low || 1;
  const pct = Math.min(Math.max(((current - low) / range) * 100, 4), 96);

  return (
    <div className="flex w-[90px] flex-col gap-1">
      <div className="relative h-[5px] w-full rounded-full bg-muted">
        <div
          className="absolute top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-foreground ring-2 ring-card"
          style={{ left: `${pct}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>
      <div className="flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
        <span>${low < 10 ? low.toFixed(1) : low.toFixed(0)}</span>
        <span>${high < 10 ? high.toFixed(1) : high.toFixed(0)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Analyst Ratings Bar (mega cap only)                                */
/* ------------------------------------------------------------------ */

function AnalystBar({
  buy,
  hold,
  sell,
}: {
  buy: number;
  hold: number;
  sell: number;
}) {
  const total = buy + hold + sell;
  const buyPct = (buy / total) * 100;
  const holdPct = (hold / total) * 100;

  return (
    <div className="flex w-[100px] flex-col items-center gap-1">
      <div className="flex h-[5px] w-full overflow-hidden rounded-full">
        <div className="bg-emerald-500" style={{ width: `${buyPct}%` }} />
        <div className="bg-muted-foreground/40" style={{ width: `${holdPct}%` }} />
        {sell > 0 && <div className="flex-1 bg-red-500" />}
      </div>
      <div className="flex gap-2.5 font-mono text-[10px] tabular-nums">
        <span className="text-emerald-500">{buy}</span>
        <span className="text-muted-foreground">{hold}</span>
        <span className="text-red-500">{sell}</span>
      </div>
    </div>
  );
}

const analystRatings: Record<string, { buy: number; hold: number; sell: number }> = {
  NVDA: { buy: 18, hold: 1, sell: 1 },
  META: { buy: 17, hold: 2, sell: 1 },
  AMZN: { buy: 19, hold: 1, sell: 0 },
  MSFT: { buy: 18, hold: 2, sell: 0 },
  AAPL: { buy: 16, hold: 3, sell: 1 },
  TSLA: { buy: 12, hold: 5, sell: 3 },
  GOOGL: { buy: 17, hold: 2, sell: 1 },
  "BRK.B": { buy: 10, hold: 8, sell: 2 },
  JPM: { buy: 15, hold: 4, sell: 1 },
  V: { buy: 18, hold: 1, sell: 1 },
};

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const data: Record<MoverType, Record<CapSize, Stock[]>> = {
  gainers: {
    mega: [
      { symbol: "NVDA", name: "NVIDIA", price: 892.45, changePercent: 3.97, volume: "52.3M", marketCap: "$2.2T", pe: 68.4, high52w: 974.0, low52w: 392.3, color: "#76B900" },
      { symbol: "META", name: "Meta Platforms", price: 523.8, changePercent: 3.69, volume: "28.1M", marketCap: "$1.3T", pe: 34.2, high52w: 542.81, low52w: 296.4, color: "#0668E1" },
      { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, volume: "45.7M", marketCap: "$1.9T", pe: 58.6, high52w: 191.7, low52w: 118.35, color: "#FF9900" },
      { symbol: "MSFT", name: "Microsoft", price: 428.15, changePercent: 2.71, volume: "22.4M", marketCap: "$3.2T", pe: 36.8, high52w: 432.98, low52w: 309.45, color: "#00A4EF" },
      { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, volume: "38.9M", marketCap: "$3.0T", pe: 31.2, high52w: 199.62, low52w: 164.08, color: "#555555" },
    ],
    large: [
      { symbol: "PLTR", name: "Palantir", price: 24.85, changePercent: 12.34, volume: "98.2M", marketCap: "$54B", pe: 242.0, high52w: 27.5, low52w: 13.68, color: "#1D1D1D" },
      { symbol: "COIN", name: "Coinbase", price: 178.42, changePercent: 9.6, volume: "14.3M", marketCap: "$42B", pe: 45.3, high52w: 185.67, low52w: 78.43, color: "#0052FF" },
      { symbol: "SHOP", name: "Shopify", price: 78.35, changePercent: 7.43, volume: "18.7M", marketCap: "$98B", pe: 82.1, high52w: 81.28, low52w: 45.5, color: "#96BF48" },
      { symbol: "SQ", name: "Block Inc", price: 72.18, changePercent: 6.22, volume: "12.5M", marketCap: "$43B", pe: 56.7, high52w: 78.24, low52w: 39.78, color: "#3E4348" },
      { symbol: "ABNB", name: "Airbnb", price: 156.73, changePercent: 5.46, volume: "8.9M", marketCap: "$98B", pe: 38.5, high52w: 170.1, low52w: 110.4, color: "#FF5A5F" },
    ],
    small: [
      { symbol: "IONQ", name: "IonQ", price: 12.45, changePercent: 21.24, volume: "42.1M", marketCap: "$2.7B", pe: null, high52w: 15.28, low52w: 5.18, color: "#7C3AED" },
      { symbol: "SMCI", name: "Super Micro", price: 28.73, changePercent: 15.81, volume: "35.6M", marketCap: "$15B", pe: 12.3, high52w: 122.9, low52w: 17.25, color: "#0071C5" },
      { symbol: "SOUN", name: "SoundHound", price: 5.42, changePercent: 14.35, volume: "28.4M", marketCap: "$1.8B", pe: null, high52w: 10.25, low52w: 1.49, color: "#8B5CF6" },
      { symbol: "JOBY", name: "Joby Aviation", price: 6.78, changePercent: 12.07, volume: "15.8M", marketCap: "$4.5B", pe: null, high52w: 8.42, low52w: 3.68, color: "#14B8A6" },
      { symbol: "MARA", name: "Marathon Digi", price: 18.92, changePercent: 10.84, volume: "22.3M", marketCap: "$5.6B", pe: 24.8, high52w: 31.42, low52w: 8.43, color: "#F59E0B" },
    ],
  },
  losers: {
    mega: [
      { symbol: "TSLA", name: "Tesla", price: 178.24, changePercent: -6.48, volume: "112.4M", marketCap: "$568B", pe: 48.2, high52w: 299.29, low52w: 152.37, color: "#CC0000" },
      { symbol: "GOOGL", name: "Alphabet", price: 152.67, changePercent: -3.68, volume: "32.8M", marketCap: "$1.9T", pe: 27.4, high52w: 174.72, low52w: 120.21, color: "#4285F4" },
      { symbol: "BRK.B", name: "Berkshire", price: 412.5, changePercent: -2.12, volume: "4.2M", marketCap: "$882B", pe: 10.8, high52w: 445.18, low52w: 344.62, color: "#3E2F84" },
      { symbol: "JPM", name: "JPMorgan", price: 198.73, changePercent: -1.71, volume: "9.8M", marketCap: "$572B", pe: 11.6, high52w: 210.48, low52w: 162.35, color: "#003087" },
      { symbol: "V", name: "Visa", price: 285.6, changePercent: -1.42, volume: "7.1M", marketCap: "$588B", pe: 32.4, high52w: 296.35, low52w: 248.67, color: "#1A1F71" },
    ],
    large: [
      { symbol: "SNAP", name: "Snap Inc", price: 11.24, changePercent: -14.27, volume: "45.2M", marketCap: "$18B", pe: null, high52w: 17.89, low52w: 8.28, color: "#EAAB00" },
      { symbol: "RIVN", name: "Rivian", price: 15.63, changePercent: -8.33, volume: "38.7M", marketCap: "$16B", pe: null, high52w: 28.06, low52w: 8.26, color: "#2D6A4F" },
      { symbol: "HOOD", name: "Robinhood", price: 18.45, changePercent: -6.25, volume: "22.1M", marketCap: "$16B", pe: 62.4, high52w: 23.78, low52w: 7.91, color: "#00C805" },
      { symbol: "LYFT", name: "Lyft", price: 14.82, changePercent: -5.54, volume: "16.8M", marketCap: "$5.8B", pe: null, high52w: 20.82, low52w: 8.85, color: "#EA39E8" },
      { symbol: "DKNG", name: "DraftKings", price: 35.67, changePercent: -4.75, volume: "12.4M", marketCap: "$34B", pe: null, high52w: 49.57, low52w: 26.18, color: "#61B729" },
    ],
    small: [
      { symbol: "WKHS", name: "Workhorse", price: 1.23, changePercent: -20.65, volume: "18.9M", marketCap: "$245M", pe: null, high52w: 3.82, low52w: 0.38, color: "#E97C37" },
      { symbol: "SPCE", name: "Virgin Galactic", price: 2.45, changePercent: -15.52, volume: "24.6M", marketCap: "$712M", pe: null, high52w: 5.6, low52w: 0.87, color: "#0ABAB5" },
      { symbol: "NKLA", name: "Nikola", price: 0.87, changePercent: -12.12, volume: "32.1M", marketCap: "$418M", pe: null, high52w: 2.83, low52w: 0.52, color: "#2563EB" },
      { symbol: "MVST", name: "Microvast", price: 1.56, changePercent: -10.34, volume: "8.4M", marketCap: "$478M", pe: null, high52w: 3.12, low52w: 0.82, color: "#DC2626" },
      { symbol: "QS", name: "QuantumScape", price: 6.78, changePercent: -8.99, volume: "11.2M", marketCap: "$3.2B", pe: null, high52w: 11.56, low52w: 4.02, color: "#0EA5E9" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Cap-size cycle config                                              */
/* ------------------------------------------------------------------ */

const capOrder: CapSize[] = ["mega", "large", "small"];
const capLabels: Record<CapSize, string> = {
  mega: "Mega Cap",
  large: "Large Cap",
  small: "Small Cap",
};

/* ------------------------------------------------------------------ */
/*  Top Movers Widget                                                  */
/* ------------------------------------------------------------------ */

function TopMoversWidget() {
  const [moverType, setMoverType] = useState<MoverType>("gainers");
  const [capSize, setCapSize] = useState<CapSize>("mega");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const stocks = data[moverType][capSize];
  const isGainer = moverType === "gainers";
  const isMega = capSize === "mega";
  const sparkColor = isGainer ? "#10b981" : "#ef4444";

  const sparklines = useMemo(
    () =>
      stocks.reduce<Record<string, number[]>>((acc, s) => {
        acc[s.symbol] = makeSparkline(s.symbol, isGainer);
        return acc;
      }, {}),
    [stocks, isGainer]
  );

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      n.has(sym) ? n.delete(sym) : n.add(sym);
      return n;
    });

  const cycleCapSize = () =>
    setCapSize((p) => capOrder[(capOrder.indexOf(p) + 1) % capOrder.length]);

  return (
    <div>
      {/* Title outside the card */}
      <h2 className="mb-2 text-[18px] font-bold tracking-tight">
        Top Movers
      </h2>

      {/* Controls row: shadcn Tabs + cap-size cycler — outside the card */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex gap-2">
          {(["gainers", "losers"] as MoverType[]).map((t) => (
            <button
              key={t}
              onClick={() => setMoverType(t)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                moverType === t
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {t === "gainers" ? "Gainers" : "Losers"}
            </button>
          ))}
        </div>

        <button
          onClick={cycleCapSize}
          className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border/60 px-3 py-1 text-[13px] font-medium text-foreground transition-all active:scale-95"
        >
          <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={capSize}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {capLabels[capSize]}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {/* Table: two-panel layout — frozen column never moves */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${moverType}-${capSize}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex border-t border-border/40"
          >
            {/* ---- Frozen left column ---- */}
            <div className="z-10 w-[170px] flex-shrink-0 bg-card shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
              {/* Header */}
              <div className="flex h-[37px] items-center px-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Stock
              </div>
              {/* Rows */}
              {stocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex h-[56px] items-center border-t border-border/20 px-4"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleBookmark(stock.symbol)}
                      className="flex-shrink-0 transition-transform active:scale-90"
                    >
                      <Bookmark
                        size={16}
                        strokeWidth={1.8}
                        className={cn(
                          "transition-colors",
                          bookmarks.has(stock.symbol)
                            ? "fill-foreground text-foreground"
                            : "text-muted-foreground/60"
                        )}
                      />
                    </button>
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground"
                    >
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-[85px] truncate text-[14px] font-semibold leading-tight">
                        {stock.name}
                      </p>
                      <p className="text-[12px] leading-tight text-muted-foreground">
                        {stock.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ---- Scrollable right columns ---- */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table style={{ minWidth: isMega ? 690 : 570 }}>
                <thead>
                  <tr className="h-[37px]">
                    <th className="min-w-[80px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Price
                    </th>
                    <th className="min-w-[72px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      % Chg
                    </th>
                    <th className="min-w-[64px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      1D
                    </th>
                    <th className="min-w-[68px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Vol
                    </th>
                    <th className="min-w-[72px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Mkt Cap
                    </th>
                    <th className="min-w-[58px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      P/E
                    </th>
                    <th className="min-w-[110px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      52W Range
                    </th>
                    {isMega && (
                      <th className="min-w-[120px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Rating
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="h-[56px] border-t border-border/20"
                    >
                      {/* Price */}
                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-foreground">
                        $
                        {stock.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* % Change */}
                      <td
                        className={cn(
                          "whitespace-nowrap px-3 text-right font-mono text-[13px] font-semibold tabular-nums",
                          isGainer ? "text-emerald-500" : "text-red-500"
                        )}
                      >
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </td>

                      {/* 1D Sparkline */}
                      <td className="px-3">
                        <div className="flex justify-center">
                          <Sparkline
                            points={sparklines[stock.symbol]}
                            color={sparkColor}
                          />
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {stock.volume}
                      </td>

                      {/* Market Cap */}
                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {stock.marketCap}
                      </td>

                      {/* P/E */}
                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {stock.pe != null ? stock.pe.toFixed(1) : "—"}
                      </td>

                      {/* 52W Range */}
                      <td className="px-3">
                        <div className="flex justify-center">
                          <Range52W
                            low={stock.low52w}
                            high={stock.high52w}
                            current={stock.price}
                          />
                        </div>
                      </td>

                      {/* Analyst Rating (mega cap only) */}
                      {isMega && analystRatings[stock.symbol] && (
                        <td className="px-3">
                          <div className="flex justify-center">
                            <AnalystBar
                              buy={analystRatings[stock.symbol].buy}
                              hold={analystRatings[stock.symbol].hold}
                              sell={analystRatings[stock.symbol].sell}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* View More — connected to card */}
        <button className="flex w-full items-center justify-center gap-1 border-t border-border/40 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
          View More
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recurring Baskets — data                                           */
/* ------------------------------------------------------------------ */

type Volatility = "high" | "mid" | "low";

const volStyle: Record<Volatility, { label: string; bg: string; text: string }> = {
  high: { label: "High Volatility", bg: "bg-red-500/10", text: "text-red-500" },
  mid: { label: "Mid Volatility", bg: "bg-amber-500/10", text: "text-amber-500" },
  low: { label: "Low Volatility", bg: "bg-emerald-500/10", text: "text-emerald-500" },
};

interface Basket {
  name: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  stocks: number;
  minInvestment: number;
  cagr3y: number;
  volatility: Volatility;
}

const recurringBaskets: Basket[] = [
  { name: "AI & Robotics", subtitle: "Leading AI & automation companies", icon: Brain, color: "#8B5CF6", stocks: 12, minInvestment: 10, cagr3y: 42.8, volatility: "high" },
  { name: "FAANG+", subtitle: "Big tech & digital platforms", icon: Layers, color: "#3B82F6", stocks: 7, minInvestment: 15, cagr3y: 22.4, volatility: "mid" },
  { name: "Clean Energy & EV", subtitle: "Solar, wind & EV ecosystem", icon: Zap, color: "#22C55E", stocks: 10, minInvestment: 10, cagr3y: 28.5, volatility: "high" },
];

/* ------------------------------------------------------------------ */
/*  Recurring Baskets Widget                                           */
/* ------------------------------------------------------------------ */

function BasketCard({ basket }: { basket: Basket }) {
  const vol = volStyle[basket.volatility];
  return (
    <button className="w-full rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors active:scale-[0.98]">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-muted"
        >
          <basket.icon size={22} strokeWidth={1.7} className="text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-bold">{basket.name}</p>
          <p className="text-[13px] text-muted-foreground">{basket.subtitle}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-[17px] font-bold tabular-nums text-emerald-500">+{basket.cagr3y}%</p>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">3Y CAGR</p>
        </div>
      </div>
      <div className="border-t border-border/40 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[13px]">
          <div>
            <p className="text-[11px] text-muted-foreground">Minimum</p>
            <p className="font-medium text-foreground">${basket.minInvestment}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Volatility</p>
            <p className={cn("font-medium", vol.text)}>{vol.label.replace(" Volatility", "")}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Rebalanced</p>
            <p className="font-medium text-foreground">Weekly</p>
          </div>
        </div>
        <span className="rounded-full bg-foreground px-3.5 py-1.5 text-[13px] font-semibold text-background">
          Explore
        </span>
      </div>
    </button>
  );
}

function RecurringBasketsWidget() {
  return (
    <div>
      {/* Title + subtext outside the card */}
      <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">
        Recurring Baskets
      </h2>
      <p className="mb-3 text-[14px] text-muted-foreground">
        Auto-invest daily, weekly, or monthly into curated baskets
      </p>

      <div className="space-y-2.5">
        {recurringBaskets.map((basket) => (
          <BasketCard key={basket.name} basket={basket} />
        ))}
      </div>

      <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-border/60 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
        View More
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trending Collections                                               */
/* ------------------------------------------------------------------ */

const trendingCollections: { name: string; icon: LucideIcon; color: string }[] = [
  { name: "AI & Machine Learning", icon: Brain, color: "#8B5CF6" },
  { name: "Defense & Aerospace", icon: Shield, color: "#3B82F6" },
  { name: "Gold & Silver", icon: Coins, color: "#F59E0B" },
  { name: "Cloud Computing", icon: Cloud, color: "#06B6D4" },
  { name: "Healthcare & Biotech", icon: HeartPulse, color: "#EF4444" },
  { name: "Consumer & Retail", icon: ShoppingCart, color: "#10B981" },
];

function TrendingCollectionsWidget() {
  return (
    <div>
      <h2 className="mb-3 text-[18px] font-bold tracking-tight">
        Trending Collections
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {trendingCollections.map((col) => (
          <button
            key={col.name}
            className="flex items-center gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5 text-left transition-colors active:scale-[0.98]"
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted"
            >
              <col.icon size={18} strokeWidth={1.7} className="text-foreground" />
            </div>
            <p className="text-[13px] font-semibold leading-tight text-foreground">
              {col.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stocks by Analyst Ratings — types & data                           */
/* ------------------------------------------------------------------ */

type RatingTab = "strong-buy" | "buy" | "hold" | "sell";

const ratingTabs: { id: RatingTab; label: string }[] = [
  { id: "strong-buy", label: "Strong Buy" },
  { id: "buy", label: "Buy" },
  { id: "hold", label: "Hold" },
  { id: "sell", label: "Sell" },
];

interface RatedStock {
  symbol: string;
  name: string;
  price: number;
  targetPrice: number;
  upside: number;
  analystCount: number;
  buy: number;
  hold: number;
  sell: number;
  avgVolume: string;
  marketCap: string;
  sector: string;
  color: string;
}

const ratedStocks: Record<RatingTab, RatedStock[]> = {
  "strong-buy": [
    { symbol: "NVDA", name: "NVIDIA", price: 892.45, targetPrice: 1050.0, upside: 17.7, analystCount: 42, buy: 38, hold: 3, sell: 1, avgVolume: "52M", marketCap: "$2.2T", sector: "Tech", color: "#76B900" },
    { symbol: "AMZN", name: "Amazon", price: 186.42, targetPrice: 225.0, upside: 20.7, analystCount: 48, buy: 44, hold: 3, sell: 1, avgVolume: "46M", marketCap: "$1.9T", sector: "Consumer", color: "#FF9900" },
    { symbol: "META", name: "Meta Platforms", price: 523.80, targetPrice: 610.0, upside: 16.5, analystCount: 40, buy: 36, hold: 3, sell: 1, avgVolume: "28M", marketCap: "$1.3T", sector: "Tech", color: "#0668E1" },
    { symbol: "LLY", name: "Eli Lilly", price: 782.35, targetPrice: 920.0, upside: 17.6, analystCount: 28, buy: 25, hold: 2, sell: 1, avgVolume: "3.2M", marketCap: "$742B", sector: "Health", color: "#D42B2B" },
    { symbol: "AVGO", name: "Broadcom", price: 1320.60, targetPrice: 1580.0, upside: 19.6, analystCount: 30, buy: 27, hold: 2, sell: 1, avgVolume: "5.1M", marketCap: "$614B", sector: "Tech", color: "#CC0000" },
  ],
  buy: [
    { symbol: "MSFT", name: "Microsoft", price: 428.15, targetPrice: 480.0, upside: 12.1, analystCount: 44, buy: 35, hold: 8, sell: 1, avgVolume: "22M", marketCap: "$3.2T", sector: "Tech", color: "#00A4EF" },
    { symbol: "AAPL", name: "Apple", price: 198.36, targetPrice: 220.0, upside: 10.9, analystCount: 40, buy: 30, hold: 8, sell: 2, avgVolume: "39M", marketCap: "$3.0T", sector: "Tech", color: "#555555" },
    { symbol: "GOOGL", name: "Alphabet", price: 152.67, targetPrice: 175.0, upside: 14.6, analystCount: 42, buy: 33, hold: 7, sell: 2, avgVolume: "33M", marketCap: "$1.9T", sector: "Tech", color: "#4285F4" },
    { symbol: "V", name: "Visa", price: 285.60, targetPrice: 320.0, upside: 12.1, analystCount: 34, buy: 28, hold: 5, sell: 1, avgVolume: "7.1M", marketCap: "$588B", sector: "Finance", color: "#1A1F71" },
    { symbol: "UNH", name: "UnitedHealth", price: 524.30, targetPrice: 590.0, upside: 12.5, analystCount: 28, buy: 22, hold: 5, sell: 1, avgVolume: "4.3M", marketCap: "$484B", sector: "Health", color: "#002677" },
  ],
  hold: [
    { symbol: "KO", name: "Coca-Cola", price: 62.45, targetPrice: 64.0, upside: 2.5, analystCount: 24, buy: 8, hold: 14, sell: 2, avgVolume: "12M", marketCap: "$270B", sector: "Consumer", color: "#F40000" },
    { symbol: "PEP", name: "PepsiCo", price: 172.30, targetPrice: 178.0, upside: 3.3, analystCount: 22, buy: 7, hold: 13, sell: 2, avgVolume: "5.6M", marketCap: "$237B", sector: "Consumer", color: "#004B93" },
    { symbol: "PG", name: "Procter & Gamble", price: 168.90, targetPrice: 172.0, upside: 1.8, analystCount: 22, buy: 6, hold: 14, sell: 2, avgVolume: "6.8M", marketCap: "$398B", sector: "Consumer", color: "#003DA5" },
    { symbol: "VZ", name: "Verizon", price: 42.15, targetPrice: 44.0, upside: 4.4, analystCount: 26, buy: 6, hold: 18, sell: 2, avgVolume: "15M", marketCap: "$177B", sector: "Telecom", color: "#CD040B" },
    { symbol: "IBM", name: "IBM", price: 188.72, targetPrice: 192.0, upside: 1.7, analystCount: 20, buy: 5, hold: 12, sell: 3, avgVolume: "4.2M", marketCap: "$172B", sector: "Tech", color: "#054ADA" },
  ],
  sell: [
    { symbol: "TSLA", name: "Tesla", price: 178.24, targetPrice: 152.0, upside: -14.7, analystCount: 40, buy: 12, hold: 14, sell: 14, avgVolume: "112M", marketCap: "$568B", sector: "Auto", color: "#CC0000" },
    { symbol: "SNAP", name: "Snap Inc", price: 11.24, targetPrice: 9.50, upside: -15.5, analystCount: 32, buy: 4, hold: 14, sell: 14, avgVolume: "45M", marketCap: "$18B", sector: "Tech", color: "#EAAB00" },
    { symbol: "RIVN", name: "Rivian", price: 15.63, targetPrice: 12.0, upside: -23.2, analystCount: 24, buy: 3, hold: 8, sell: 13, avgVolume: "39M", marketCap: "$16B", sector: "Auto", color: "#2D6A4F" },
    { symbol: "NKLA", name: "Nikola", price: 0.87, targetPrice: 0.50, upside: -42.5, analystCount: 8, buy: 0, hold: 2, sell: 6, avgVolume: "32M", marketCap: "$418M", sector: "Auto", color: "#2563EB" },
    { symbol: "BYND", name: "Beyond Meat", price: 7.82, targetPrice: 5.50, upside: -29.7, analystCount: 14, buy: 1, hold: 4, sell: 9, avgVolume: "4.8M", marketCap: "$501M", sector: "Consumer", color: "#00A14B" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Consensus Badge                                                    */
/* ------------------------------------------------------------------ */

function ConsensusBadge({ buy, hold, sell }: { buy: number; hold: number; sell: number }) {
  const total = buy + hold + sell;
  const buyPct = (buy / total) * 100;
  const holdPct = (hold / total) * 100;

  return (
    <div className="flex w-[100px] flex-col items-center gap-1">
      <div className="flex h-[5px] w-full overflow-hidden rounded-full">
        <div className="bg-emerald-500" style={{ width: `${buyPct}%` }} />
        <div className="bg-muted-foreground/40" style={{ width: `${holdPct}%` }} />
        {sell > 0 && <div className="flex-1 bg-red-500" />}
      </div>
      <div className="flex gap-2.5 font-mono text-[10px] tabular-nums">
        <span className="text-emerald-500">{buy}</span>
        <span className="text-muted-foreground">{hold}</span>
        <span className="text-red-500">{sell}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stocks by Analyst Ratings Widget                                   */
/* ------------------------------------------------------------------ */

function AnalystRatingsWidget() {
  const [ratingTab, setRatingTab] = useState<RatingTab>("strong-buy");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const stocks = ratedStocks[ratingTab];
  const isBullish = ratingTab === "strong-buy" || ratingTab === "buy";

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      n.has(sym) ? n.delete(sym) : n.add(sym);
      return n;
    });

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold tracking-tight">
        Stocks by Analyst Ratings
      </h2>

      {/* Rating pills */}
      <div className="mb-2.5 flex gap-2">
        {ratingTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRatingTab(tab.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              ratingTab === tab.id
                ? "bg-foreground text-background"
                : "border border-border/60 text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={ratingTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            {/* ---- Frozen left column ---- */}
            <div className="z-10 w-[170px] flex-shrink-0 bg-card shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
              <div className="flex h-[37px] items-center px-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Stock
              </div>
              {stocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex h-[56px] items-center border-t border-border/20 px-4"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleBookmark(stock.symbol)}
                      className="flex-shrink-0 transition-transform active:scale-90"
                    >
                      <Bookmark
                        size={16}
                        strokeWidth={1.8}
                        className={cn(
                          "transition-colors",
                          bookmarks.has(stock.symbol)
                            ? "fill-foreground text-foreground"
                            : "text-muted-foreground/60"
                        )}
                      />
                    </button>
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground"
                    >
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-[85px] truncate text-[14px] font-semibold leading-tight">
                        {stock.name}
                      </p>
                      <p className="text-[12px] leading-tight text-muted-foreground">
                        {stock.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ---- Scrollable right columns ---- */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table style={{ minWidth: 560 }}>
                <thead>
                  <tr className="h-[37px]">
                    <th className="min-w-[72px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Upside
                    </th>
                    <th className="min-w-[120px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Consensus
                    </th>
                    <th className="min-w-[80px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Price
                    </th>
                    <th className="min-w-[80px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Target
                    </th>
                    <th className="min-w-[68px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Avg Vol
                    </th>
                    <th className="min-w-[72px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Mkt Cap
                    </th>
                    <th className="min-w-[64px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Sector
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="h-[56px] border-t border-border/20"
                    >
                      {/* Upside % */}
                      <td
                        className={cn(
                          "whitespace-nowrap px-3 text-right font-mono text-[13px] font-semibold tabular-nums",
                          stock.upside >= 0 ? "text-emerald-500" : "text-red-500"
                        )}
                      >
                        {stock.upside >= 0 ? "+" : ""}{stock.upside.toFixed(1)}%
                      </td>

                      {/* Consensus Bar */}
                      <td className="px-3">
                        <div className="flex justify-center">
                          <ConsensusBadge buy={stock.buy} hold={stock.hold} sell={stock.sell} />
                        </div>
                      </td>

                      {/* Price */}
                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-foreground">
                        ${stock.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Target Price */}
                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        ${stock.targetPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Avg Volume */}
                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {stock.avgVolume}
                      </td>

                      {/* Market Cap */}
                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {stock.marketCap}
                      </td>

                      {/* Sector */}
                      <td className="whitespace-nowrap px-3 text-right text-[13px] text-muted-foreground">
                        {stock.sector}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* View More — connected to card */}
        <button className="flex w-full items-center justify-center gap-1 border-t border-border/40 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
          View More
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Level Up Widget                                                    */
/* ------------------------------------------------------------------ */

const levelUpStages = [
  {
    title: "The Confident Investor",
    body: "Read earnings reports. Understand P/E ratios. Spot sector rotation.",
    videos: [
      { title: "How to read earnings", duration: "5 min" },
      { title: "P/E ratios explained", duration: "4 min" },
      { title: "Sector rotation strategies", duration: "5 min" },
    ],
  },
  {
    title: "The Strategic Investor",
    body: "Read charts. Spot patterns. Make your first swing trade.",
    videos: [
      { title: "Reading a stock chart", duration: "5 min" },
      { title: "Support & resistance", duration: "4 min" },
      { title: "Volume: the hidden signal", duration: "3 min" },
    ],
  },
  {
    title: "The Options Explorer",
    body: "Calls, puts, covered calls. Trade options with confidence.",
    videos: [
      { title: "Options 101: Calls", duration: "3 min" },
      { title: "Options 102: Puts", duration: "4 min" },
      { title: "Covered calls for income", duration: "5 min" },
    ],
  },
  {
    title: "Power Mode",
    body: "Algo strategies. Advanced orders. Extended-hours trading.",
    videos: [
      { title: "How algo trading works", duration: "4 min" },
      { title: "Bracket & OCO orders", duration: "5 min" },
      { title: "From investor to trader", duration: "6 min" },
    ],
  },
];

function LevelUpWidget() {
  const [expanded, setExpanded] = useState(0);

  return (
    <div>
      <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">
        Level Up
      </h2>
      <p className="mb-3 text-[14px] text-muted-foreground">
        Every great trader started as a curious investor. Here&apos;s the path.
      </p>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {levelUpStages.map((stage, i) => {
          const isOpen = expanded === i;
          return (
            <div
              key={stage.title}
              className={cn(i > 0 && "border-t border-border/40")}
            >
              <button
                onClick={() => setExpanded(isOpen ? -1 : i)}
                className="flex w-full items-center gap-3 p-3.5 text-left"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-[13px] font-bold text-foreground">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-foreground">{stage.title}</p>
                  {!isOpen && (
                    <p className="text-[12px] text-muted-foreground truncate">{stage.body}</p>
                  )}
                </div>
                <ChevronRight
                  size={16}
                  className={cn(
                    "flex-shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-90"
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-3.5 pt-0">
                      <p className="text-[13px] text-muted-foreground mb-3">{stage.body}</p>
                      <div className="space-y-2">
                        {stage.videos.map((v) => (
                          <div key={v.title} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-foreground ml-0.5">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                            <p className="text-[13px] font-medium text-foreground flex-1">{v.title}</p>
                            <span className="text-[12px] text-muted-foreground">{v.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stock Screeners Widget                                             */
/* ------------------------------------------------------------------ */

type ScreenerTab = "basic" | "premium" | "saved";

const screenerTabs: { id: ScreenerTab; label: string; disabled?: boolean }[] = [
  { id: "basic", label: "Basic" },
  { id: "premium", label: "Premium" },
  { id: "saved", label: "Saved", disabled: true },
];

interface Screener {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  matchCount: number;
}

const basicScreeners: Screener[] = [
  { name: "High Margin", description: "Stocks with >30% profit margins", icon: TrendingUp, color: "#10B981", matchCount: 48 },
  { name: "Penny Stocks", description: "Under $5 with high volume", icon: Coins, color: "#F59E0B", matchCount: 124 },
  { name: "Value with Momentum", description: "Low P/E + positive price trend", icon: Rocket, color: "#8B5CF6", matchCount: 35 },
  { name: "Nearing Breakout", description: "Within 5% of 52-week high", icon: TrendingUp, color: "#3B82F6", matchCount: 62 },
  { name: "Capex Expanders", description: "YoY capital spending growth >20%", icon: BarChart3, color: "#06B6D4", matchCount: 41 },
  { name: "Dividend Aristocrats", description: "25+ years of dividend growth", icon: Gem, color: "#EC4899", matchCount: 67 },
];

const premiumScreeners: Screener[] = [
  { name: "Insider Accumulation", description: "Heavy insider buying last 90 days", icon: Target, color: "#EF4444", matchCount: 23 },
  { name: "Short Squeeze Setup", description: "High short interest + rising price", icon: Zap, color: "#F97316", matchCount: 18 },
  { name: "Earnings Momentum", description: "3+ consecutive earnings beats", icon: TrendingUp, color: "#10B981", matchCount: 52 },
  { name: "Institutional Inflow", description: "Rising fund ownership + volume", icon: BarChart3, color: "#6366F1", matchCount: 37 },
  { name: "Cash Rich & Undervalued", description: "Cash > market cap, low EV/EBITDA", icon: Gem, color: "#14B8A6", matchCount: 14 },
  { name: "Technical Reversal", description: "Oversold RSI + bullish divergence", icon: Rocket, color: "#8B5CF6", matchCount: 29 },
];

function ScreenerWidget() {
  const [activeTab, setActiveTab] = useState<ScreenerTab>("basic");
  const screeners = activeTab === "basic" ? basicScreeners : premiumScreeners;

  return (
    <div>
      <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">
        Stock Screeners
      </h2>
      <p className="mb-3 text-[14px] text-muted-foreground">
        Find stocks that match your criteria
      </p>

      {/* Tabs */}
      <div className="mb-3 flex gap-2">
        {screenerTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              tab.disabled
                ? "border border-border/30 text-muted-foreground/40 cursor-not-allowed"
                : activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Screener list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="rounded-2xl border border-border/60 bg-card overflow-hidden"
        >
          {screeners.map((screener, i) => (
            <button
              key={screener.name}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/30",
                i > 0 && "border-t border-border/30"
              )}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted"
              >
                <screener.icon size={20} strokeWidth={1.7} className="text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground">{screener.name}</p>
                <p className="text-[12px] text-muted-foreground truncate">{screener.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[12px] font-medium text-muted-foreground tabular-nums">
                  {screener.matchCount} stocks
                </span>
                <ChevronRight size={14} className="text-muted-foreground/60" />
              </div>
            </button>
          ))}

          {/* Create New Screener — connected to card */}
          <button className="flex w-full items-center justify-center gap-2 border-t border-dashed border-border/40 py-3 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
            <Plus size={16} />
            Create New Screener
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Market Heatmap — data                                              */
/* ------------------------------------------------------------------ */

type HeatmapIndex = "sp500" | "nasdaq100";

const heatmapStocks: Record<HeatmapIndex, { symbol: string; weight: number; change: number }[]> = {
  sp500: [
    { symbol: "AAPL", weight: 7.1, change: 1.2 },
    { symbol: "MSFT", weight: 6.8, change: -0.4 },
    { symbol: "NVDA", weight: 6.2, change: 2.8 },
    { symbol: "AMZN", weight: 3.8, change: 0.9 },
    { symbol: "GOOGL", weight: 3.6, change: -1.1 },
    { symbol: "META", weight: 2.8, change: 1.5 },
    { symbol: "TSLA", weight: 2.1, change: -2.3 },
    { symbol: "BRK.B", weight: 1.9, change: 0.3 },
    { symbol: "AVGO", weight: 1.7, change: 1.8 },
    { symbol: "LLY", weight: 1.6, change: -0.7 },
    { symbol: "JPM", weight: 1.4, change: 0.5 },
    { symbol: "V", weight: 1.3, change: 0.2 },
    { symbol: "UNH", weight: 1.2, change: -0.9 },
    { symbol: "MA", weight: 1.1, change: 0.4 },
    { symbol: "XOM", weight: 1.0, change: -1.5 },
    { symbol: "HD", weight: 0.9, change: 0.6 },
    { symbol: "PG", weight: 0.9, change: 0.1 },
    { symbol: "COST", weight: 0.8, change: 0.8 },
    { symbol: "JNJ", weight: 0.8, change: -0.3 },
    { symbol: "ABBV", weight: 0.7, change: 1.1 },
    { symbol: "CRM", weight: 0.7, change: -1.8 },
    { symbol: "BAC", weight: 0.6, change: 0.7 },
    { symbol: "NFLX", weight: 0.6, change: 2.1 },
    { symbol: "AMD", weight: 0.6, change: 3.2 },
    { symbol: "KO", weight: 0.5, change: -0.2 },
  ],
  nasdaq100: [
    { symbol: "AAPL", weight: 11.2, change: 1.2 },
    { symbol: "MSFT", weight: 10.5, change: -0.4 },
    { symbol: "NVDA", weight: 9.8, change: 2.8 },
    { symbol: "AMZN", weight: 5.8, change: 0.9 },
    { symbol: "META", weight: 4.8, change: 1.5 },
    { symbol: "GOOGL", weight: 4.2, change: -1.1 },
    { symbol: "AVGO", weight: 3.5, change: 1.8 },
    { symbol: "TSLA", weight: 3.2, change: -2.3 },
    { symbol: "COST", weight: 2.4, change: 0.8 },
    { symbol: "NFLX", weight: 2.1, change: 2.1 },
    { symbol: "AMD", weight: 1.9, change: 3.2 },
    { symbol: "ADBE", weight: 1.7, change: -0.6 },
    { symbol: "CRM", weight: 1.5, change: -1.8 },
    { symbol: "QCOM", weight: 1.4, change: 1.3 },
    { symbol: "INTC", weight: 1.2, change: -2.7 },
    { symbol: "INTU", weight: 1.1, change: 0.4 },
    { symbol: "AMAT", weight: 1.0, change: 2.4 },
    { symbol: "PYPL", weight: 0.9, change: -0.8 },
    { symbol: "BKNG", weight: 0.8, change: 0.6 },
    { symbol: "MU", weight: 0.7, change: 1.9 },
    { symbol: "ISRG", weight: 0.7, change: 0.3 },
    { symbol: "LRCX", weight: 0.6, change: 2.0 },
    { symbol: "PANW", weight: 0.5, change: -1.2 },
    { symbol: "SNPS", weight: 0.5, change: 0.7 },
    { symbol: "KLAC", weight: 0.5, change: 1.6 },
  ],
};

const heatmapSectors: Record<HeatmapIndex, { symbol: string; weight: number; change: number }[]> = {
  sp500: [
    { symbol: "Tech", weight: 31.5, change: 1.4 },
    { symbol: "Health", weight: 12.2, change: -0.5 },
    { symbol: "Finance", weight: 11.8, change: 0.6 },
    { symbol: "Consumer Disc.", weight: 10.4, change: -0.8 },
    { symbol: "Comm. Svcs", weight: 8.9, change: 0.9 },
    { symbol: "Industrials", weight: 7.6, change: 0.3 },
    { symbol: "Consumer Stpl.", weight: 5.8, change: -0.2 },
    { symbol: "Energy", weight: 3.9, change: -1.3 },
    { symbol: "Utilities", weight: 2.8, change: 0.1 },
    { symbol: "Real Estate", weight: 2.6, change: -0.4 },
    { symbol: "Materials", weight: 2.5, change: 0.7 },
  ],
  nasdaq100: [
    { symbol: "Tech", weight: 49.2, change: 1.6 },
    { symbol: "Comm. Svcs", weight: 15.8, change: 0.7 },
    { symbol: "Consumer Disc.", weight: 14.6, change: -0.9 },
    { symbol: "Health", weight: 6.8, change: -0.3 },
    { symbol: "Consumer Stpl.", weight: 5.2, change: 0.4 },
    { symbol: "Industrials", weight: 4.1, change: 0.2 },
    { symbol: "Utilities", weight: 2.4, change: -0.1 },
    { symbol: "Energy", weight: 1.9, change: -1.1 },
  ],
};

type HeatmapView = "stocks" | "sectors";
const heatViewOrder: HeatmapView[] = ["stocks", "sectors"];
const heatViewLabels: Record<HeatmapView, string> = { stocks: "Stocks", sectors: "Sectors" };

/* ------------------------------------------------------------------ */
/*  Squarified treemap layout                                          */
/* ------------------------------------------------------------------ */

const TM_W = 400;
const TM_H = 300;

interface HeatRect {
  x: number; y: number; w: number; h: number;
  symbol: string; change: number;
}

function treemapLayout(
  items: { symbol: string; weight: number; change: number }[],
): HeatRect[] {
  if (!items.length) return [];

  const sorted = [...items].sort((a, b) => b.weight - a.weight);
  const totalWeight = sorted.reduce((s, i) => s + i.weight, 0);
  const totalArea = TM_W * TM_H;
  const areas = sorted.map((i) => (i.weight / totalWeight) * totalArea);
  const rects: HeatRect[] = [];

  function worst(cellAreas: number[], side: number): number {
    const total = cellAreas.reduce((s, a) => s + a, 0);
    const rowOther = total / side;
    let max = 0;
    for (const a of cellAreas) {
      const cellSide = a / rowOther;
      const r = Math.max(rowOther / cellSide, cellSide / rowOther);
      if (r > max) max = r;
    }
    return max;
  }

  function process(
    idxs: number[],
    bx: number, by: number, bw: number, bh: number,
  ) {
    if (!idxs.length) return;
    if (idxs.length === 1) {
      const i = idxs[0];
      rects.push({ x: bx, y: by, w: bw, h: bh, symbol: sorted[i].symbol, change: sorted[i].change });
      return;
    }

    const isWide = bw >= bh;
    const side = isWide ? bh : bw;

    let bestEnd = 0;
    let rowAreas: number[] = [];
    let bestWorst = Infinity;

    for (let i = 0; i < idxs.length; i++) {
      const test = [...rowAreas, areas[idxs[i]]];
      const w = worst(test, side);
      if (w <= bestWorst) {
        bestWorst = w;
        bestEnd = i;
        rowAreas = test;
      } else break;
    }

    const rowTotal = rowAreas.reduce((s, a) => s + a, 0);

    if (isWide) {
      const rw = rowTotal / bh;
      let py = by;
      for (let i = 0; i <= bestEnd; i++) {
        const ch = areas[idxs[i]] / rw;
        rects.push({ x: bx, y: py, w: rw, h: ch, symbol: sorted[idxs[i]].symbol, change: sorted[idxs[i]].change });
        py += ch;
      }
      process(idxs.slice(bestEnd + 1), bx + rw, by, bw - rw, bh);
    } else {
      const rh = rowTotal / bw;
      let px = bx;
      for (let i = 0; i <= bestEnd; i++) {
        const cw = areas[idxs[i]] / rh;
        rects.push({ x: px, y: by, w: cw, h: rh, symbol: sorted[idxs[i]].symbol, change: sorted[idxs[i]].change });
        px += cw;
      }
      process(idxs.slice(bestEnd + 1), bx, by + rh, bw, bh - rh);
    }
  }

  process(sorted.map((_, i) => i), 0, 0, TM_W, TM_H);
  return rects;
}

function heatColor(change: number): string {
  if (change >= 3) return "#166534";
  if (change >= 2) return "#15803d";
  if (change >= 1) return "#16a34a";
  if (change >= 0.3) return "#22863a";
  if (change > -0.3) return "#3f3f46";
  if (change > -1) return "#c53030";
  if (change > -2) return "#dc2626";
  if (change > -3) return "#b91c1c";
  return "#991b1b";
}

/* ------------------------------------------------------------------ */
/*  Market Heatmap Widget                                              */
/* ------------------------------------------------------------------ */

function HeatmapWidget() {
  const [index, setIndex] = useState<HeatmapIndex>("sp500");
  const [view, setView] = useState<HeatmapView>("stocks");

  const items = view === "stocks" ? heatmapStocks[index] : heatmapSectors[index];
  const rects = useMemo(() => treemapLayout(items), [items]);

  const cycleView = () =>
    setView((p) => heatViewOrder[(heatViewOrder.indexOf(p) + 1) % heatViewOrder.length]);

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold tracking-tight">Market Heatmap</h2>

      {/* Index pills + view flipper */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex gap-2">
          {(["sp500", "nasdaq100"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setIndex(id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                index === id
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {id === "sp500" ? "S&P 500" : "NASDAQ 100"}
            </button>
          ))}
        </div>

        <button
          onClick={cycleView}
          className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border/60 px-3 py-1 text-[13px] font-medium text-foreground transition-all active:scale-95"
        >
          <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={view}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {heatViewLabels[view]}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      {/* Treemap */}
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: `${TM_W} / ${TM_H}` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${index}-${view}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
          >
            {rects.map((r) => {
              const showLabel = r.w > 28 && r.h > 24;
              const showChange = r.w > 42 && r.h > 32;
              const isLarge = r.w > 65 && r.h > 50;
              return (
                <div
                  key={r.symbol}
                  className="absolute p-[0.75px]"
                  style={{
                    left: `${(r.x / TM_W) * 100}%`,
                    top: `${(r.y / TM_H) * 100}%`,
                    width: `${(r.w / TM_W) * 100}%`,
                    height: `${(r.h / TM_H) * 100}%`,
                  }}
                >
                  <div
                    className="flex h-full w-full flex-col items-center justify-center rounded-[3px]"
                    style={{ backgroundColor: heatColor(r.change) }}
                  >
                    {showLabel && (
                      <span
                        className="font-bold leading-none text-white text-center px-1"
                        style={{ fontSize: isLarge ? 13 : 10 }}
                      >
                        {r.symbol}
                      </span>
                    )}
                    {showChange && (
                      <span
                        className="mt-0.5 leading-none text-white/80"
                        style={{ fontSize: isLarge ? 11 : 9 }}
                      >
                        {r.change > 0 ? "+" : ""}{r.change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Promo Banner Widget (tap to cycle: strip → big → hero)             */
/* ------------------------------------------------------------------ */

type BannerMode = "strip" | "strip-full" | "big" | "big-full" | "hero" | "hero-full";
const bannerOrder: BannerMode[] = ["strip", "strip-full", "big", "big-full", "hero", "hero-full"];

const bannerLabels: Record<BannerMode, string> = {
  strip: "Thin Banner",
  "strip-full": "Thin Banner · End to End",
  big: "Big Banner",
  "big-full": "Big Banner · End to End",
  hero: "Hero Banner",
  "hero-full": "Hero Banner · End to End",
};

function PromoBanner() {
  const [mode, setMode] = useState<BannerMode>("strip");

  const cycle = () =>
    setMode((p) => bannerOrder[(bannerOrder.indexOf(p) + 1) % bannerOrder.length]);

  const label = bannerLabels[mode];
  const isFull = mode.endsWith("-full");

  const heights: Record<string, string> = {
    strip: "py-3.5",
    "strip-full": "py-3.5",
    big: "py-16",
    "big-full": "py-16",
    hero: "py-40",
    "hero-full": "py-40",
  };

  return (
    <button
      onClick={cycle}
      className={cn(
        "flex w-full items-center justify-center bg-muted transition-all active:scale-[0.99]",
        heights[mode],
        isFull ? "-mx-4 w-[calc(100%+2rem)]" : "rounded-2xl"
      )}
    >
      <p className="text-[14px] font-semibold text-muted-foreground">{label}</p>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function ExploreFundedNotTraded() {
  return (
    <div className="space-y-8 px-4 pt-5 pb-4">
      <PromoBanner />
      <TopMoversWidget />
      <HeatmapWidget />
      <RecurringBasketsWidget />
      <TrendingCollectionsWidget />
      <AnalystRatingsWidget />
      <ScreenerWidget />
      <LevelUpWidget />
    </div>
  );
}
