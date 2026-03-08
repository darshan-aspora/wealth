"use client";

import { useState, useMemo } from "react";
import {
  Bookmark,
  Brain,
  Coins,
  Layers,
  TrendingUp,
  Shield,
  Landmark,
  Leaf,
  ArrowUpDown,
  ChevronRight,
  Target,
  Plus,
  TrendingDown,
  BarChart3,
  Gem,
  Rocket,
  DollarSign,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type EtfCategory = "broad" | "sector" | "bond";
type MoverType = "gainers" | "losers";

interface ETF {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: string;
  aum: string;
  expenseRatio: number;
  yield: number | null;
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
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const data: Record<MoverType, Record<EtfCategory, ETF[]>> = {
  gainers: {
    broad: [
      { symbol: "SPY", name: "SPDR S&P 500", price: 512.34, changePercent: 1.42, volume: "78.2M", aum: "$562B", expenseRatio: 0.09, yield: 1.32, high52w: 524.0, low52w: 410.3, color: "#1A5276" },
      { symbol: "QQQ", name: "Invesco QQQ", price: 438.67, changePercent: 1.85, volume: "52.1M", aum: "$280B", expenseRatio: 0.20, yield: 0.55, high52w: 452.0, low52w: 342.5, color: "#00A86B" },
      { symbol: "VTI", name: "Vanguard Total Mkt", price: 262.18, changePercent: 1.28, volume: "4.8M", aum: "$410B", expenseRatio: 0.03, yield: 1.35, high52w: 270.0, low52w: 212.4, color: "#8B1A1A" },
      { symbol: "IWM", name: "iShares Russell 2K", price: 198.45, changePercent: 2.14, volume: "28.3M", aum: "$72B", expenseRatio: 0.19, yield: 1.18, high52w: 212.0, low52w: 162.8, color: "#4A148C" },
      { symbol: "VOO", name: "Vanguard S&P 500", price: 471.82, changePercent: 1.38, volume: "5.2M", aum: "$482B", expenseRatio: 0.03, yield: 1.34, high52w: 482.0, low52w: 378.6, color: "#8B1A1A" },
    ],
    sector: [
      { symbol: "XLK", name: "Tech Select SPDR", price: 212.45, changePercent: 2.87, volume: "12.4M", aum: "$68B", expenseRatio: 0.09, yield: 0.62, high52w: 222.0, low52w: 164.3, color: "#0066CC" },
      { symbol: "XLE", name: "Energy Select SPDR", price: 89.73, changePercent: 3.42, volume: "18.7M", aum: "$38B", expenseRatio: 0.09, yield: 3.28, high52w: 98.5, low52w: 72.1, color: "#FF6600" },
      { symbol: "XLF", name: "Financial Select SPDR", price: 42.56, changePercent: 1.95, volume: "32.1M", aum: "$42B", expenseRatio: 0.09, yield: 1.52, high52w: 44.8, low52w: 33.2, color: "#003087" },
      { symbol: "XLV", name: "Health Care SPDR", price: 148.32, changePercent: 1.63, volume: "8.9M", aum: "$41B", expenseRatio: 0.09, yield: 1.38, high52w: 155.0, low52w: 124.7, color: "#CC0066" },
      { symbol: "ARKK", name: "ARK Innovation", price: 48.92, changePercent: 4.85, volume: "22.6M", aum: "$8.2B", expenseRatio: 0.75, yield: null, high52w: 56.3, low52w: 32.8, color: "#FF4500" },
    ],
    bond: [
      { symbol: "TLT", name: "iShares 20+ Yr Trsy", price: 92.84, changePercent: 0.82, volume: "24.5M", aum: "$52B", expenseRatio: 0.15, yield: 4.12, high52w: 102.3, low52w: 82.4, color: "#1A5276" },
      { symbol: "BND", name: "Vanguard Total Bond", price: 72.45, changePercent: 0.34, volume: "8.2M", aum: "$108B", expenseRatio: 0.03, yield: 3.85, high52w: 75.2, low52w: 68.1, color: "#8B1A1A" },
      { symbol: "HYG", name: "iShares High Yield", price: 78.23, changePercent: 0.56, volume: "15.8M", aum: "$18B", expenseRatio: 0.49, yield: 5.82, high52w: 80.1, low52w: 72.4, color: "#333333" },
      { symbol: "LQD", name: "iShares IG Corp", price: 108.67, changePercent: 0.42, volume: "12.3M", aum: "$35B", expenseRatio: 0.14, yield: 4.45, high52w: 114.0, low52w: 100.8, color: "#333333" },
      { symbol: "AGG", name: "iShares Core US Agg", price: 98.12, changePercent: 0.28, volume: "6.7M", aum: "$98B", expenseRatio: 0.03, yield: 3.72, high52w: 101.5, low52w: 93.2, color: "#333333" },
    ],
  },
  losers: {
    broad: [
      { symbol: "EEM", name: "iShares MSCI EM", price: 40.23, changePercent: -2.34, volume: "42.8M", aum: "$18B", expenseRatio: 0.68, yield: 2.45, high52w: 44.8, low52w: 36.2, color: "#333333" },
      { symbol: "EFA", name: "iShares MSCI EAFE", price: 78.56, changePercent: -1.87, volume: "18.4M", aum: "$52B", expenseRatio: 0.32, yield: 2.82, high52w: 84.2, low52w: 68.5, color: "#333333" },
      { symbol: "DIA", name: "SPDR Dow Jones", price: 388.42, changePercent: -0.92, volume: "3.8M", aum: "$35B", expenseRatio: 0.16, yield: 1.68, high52w: 405.0, low52w: 332.8, color: "#0033CC" },
      { symbol: "VWO", name: "Vanguard FTSE EM", price: 42.18, changePercent: -2.15, volume: "12.6M", aum: "$82B", expenseRatio: 0.08, yield: 3.12, high52w: 46.5, low52w: 37.8, color: "#8B1A1A" },
      { symbol: "VXUS", name: "Vanguard Total Intl", price: 58.34, changePercent: -1.42, volume: "4.2M", aum: "$65B", expenseRatio: 0.07, yield: 2.95, high52w: 62.8, low52w: 52.1, color: "#8B1A1A" },
    ],
    sector: [
      { symbol: "XLRE", name: "Real Estate SPDR", price: 38.72, changePercent: -3.24, volume: "8.2M", aum: "$6.8B", expenseRatio: 0.09, yield: 3.45, high52w: 44.2, low52w: 34.8, color: "#8B4513" },
      { symbol: "XLU", name: "Utilities Select SPDR", price: 68.45, changePercent: -2.18, volume: "12.4M", aum: "$18B", expenseRatio: 0.09, yield: 2.92, high52w: 74.5, low52w: 58.2, color: "#008080" },
      { symbol: "XLP", name: "Consumer Stpl SPDR", price: 78.23, changePercent: -1.56, volume: "9.8M", aum: "$20B", expenseRatio: 0.09, yield: 2.42, high52w: 82.4, low52w: 68.5, color: "#228B22" },
      { symbol: "XLI", name: "Industrial SPDR", price: 118.67, changePercent: -1.28, volume: "14.2M", aum: "$19B", expenseRatio: 0.09, yield: 1.45, high52w: 128.0, low52w: 98.4, color: "#4169E1" },
      { symbol: "XLC", name: "Comm Svcs SPDR", price: 82.34, changePercent: -2.72, volume: "6.8M", aum: "$18B", expenseRatio: 0.09, yield: 0.78, high52w: 92.1, low52w: 68.4, color: "#9400D3" },
    ],
    bond: [
      { symbol: "JNK", name: "SPDR High Yield", price: 94.56, changePercent: -0.78, volume: "8.4M", aum: "$8.2B", expenseRatio: 0.40, yield: 5.45, high52w: 98.2, low52w: 88.4, color: "#8B0000" },
      { symbol: "EMB", name: "iShares EM Bond", price: 86.34, changePercent: -1.24, volume: "5.2M", aum: "$14B", expenseRatio: 0.39, yield: 5.12, high52w: 92.4, low52w: 78.6, color: "#333333" },
      { symbol: "BNDX", name: "Vanguard Intl Bond", price: 48.72, changePercent: -0.62, volume: "3.8M", aum: "$48B", expenseRatio: 0.07, yield: 3.28, high52w: 51.2, low52w: 45.8, color: "#8B1A1A" },
      { symbol: "SHY", name: "iShares 1-3 Yr Trsy", price: 81.45, changePercent: -0.18, volume: "4.2M", aum: "$28B", expenseRatio: 0.15, yield: 4.52, high52w: 82.8, low52w: 79.2, color: "#333333" },
      { symbol: "TIPS", name: "iShares TIPS Bond", price: 108.23, changePercent: -0.45, volume: "2.8M", aum: "$22B", expenseRatio: 0.19, yield: 3.65, high52w: 112.0, low52w: 102.4, color: "#333333" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Category cycle config                                              */
/* ------------------------------------------------------------------ */

const catOrder: EtfCategory[] = ["broad", "sector", "bond"];
const catLabels: Record<EtfCategory, string> = {
  broad: "Broad Market",
  sector: "Sector",
  bond: "Bond & Fixed Income",
};

/* ------------------------------------------------------------------ */
/*  Top Movers Widget                                                  */
/* ------------------------------------------------------------------ */

function TopMoversWidget() {
  const [moverType, setMoverType] = useState<MoverType>("gainers");
  const [category, setCategory] = useState<EtfCategory>("broad");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const etfs = data[moverType][category];
  const isGainer = moverType === "gainers";
  const sparkColor = isGainer ? "#10b981" : "#ef4444";

  const sparklines = useMemo(
    () =>
      etfs.reduce<Record<string, number[]>>((acc, e) => {
        acc[e.symbol] = makeSparkline(e.symbol, isGainer);
        return acc;
      }, {}),
    [etfs, isGainer]
  );

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      n.has(sym) ? n.delete(sym) : n.add(sym);
      return n;
    });

  const cycleCategory = () =>
    setCategory((p) => catOrder[(catOrder.indexOf(p) + 1) % catOrder.length]);

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold tracking-tight">
        Top Movers
      </h2>

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
          onClick={cycleCategory}
          className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border/60 px-3 py-1 text-[13px] font-medium text-foreground transition-all active:scale-95"
        >
          <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={category}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {catLabels[category]}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${moverType}-${category}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex border-t border-border/40"
          >
            {/* ---- Frozen left column ---- */}
            <div className="z-10 w-[170px] flex-shrink-0 bg-card shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
              <div className="flex h-[37px] items-center px-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                ETF
              </div>
              {etfs.map((etf) => (
                <div
                  key={etf.symbol}
                  className="flex h-[56px] items-center border-t border-border/20 px-4"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleBookmark(etf.symbol)}
                      className="flex-shrink-0 transition-transform active:scale-90"
                    >
                      <Bookmark
                        size={16}
                        strokeWidth={1.8}
                        className={cn(
                          "transition-colors",
                          bookmarks.has(etf.symbol)
                            ? "fill-foreground text-foreground"
                            : "text-muted-foreground/60"
                        )}
                      />
                    </button>
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground"
                    >
                      {etf.symbol.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-[85px] truncate text-[14px] font-semibold leading-tight">
                        {etf.name}
                      </p>
                      <p className="text-[12px] leading-tight text-muted-foreground">
                        {etf.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ---- Scrollable right columns ---- */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table style={{ minWidth: 620 }}>
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
                      AUM
                    </th>
                    <th className="min-w-[58px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Exp %
                    </th>
                    <th className="min-w-[58px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Yield
                    </th>
                    <th className="min-w-[110px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      52W Range
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {etfs.map((etf) => (
                    <tr
                      key={etf.symbol}
                      className="h-[56px] border-t border-border/20"
                    >
                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-foreground">
                        $
                        {etf.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td
                        className={cn(
                          "whitespace-nowrap px-3 text-right font-mono text-[13px] font-semibold tabular-nums",
                          isGainer ? "text-emerald-500" : "text-red-500"
                        )}
                      >
                        {etf.changePercent >= 0 ? "+" : ""}
                        {etf.changePercent.toFixed(2)}%
                      </td>

                      <td className="px-3">
                        <div className="flex justify-center">
                          <Sparkline
                            points={sparklines[etf.symbol]}
                            color={sparkColor}
                          />
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {etf.volume}
                      </td>

                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {etf.aum}
                      </td>

                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {etf.expenseRatio.toFixed(2)}%
                      </td>

                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {etf.yield != null ? `${etf.yield.toFixed(2)}%` : "—"}
                      </td>

                      <td className="px-3">
                        <div className="flex justify-center">
                          <Range52W
                            low={etf.low52w}
                            high={etf.high52w}
                            current={etf.price}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>

        <button className="flex w-full items-center justify-center gap-1 border-t border-border/40 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
          View More
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trending ETF Categories                                            */
/* ------------------------------------------------------------------ */

const trendingCategories: { name: string; icon: LucideIcon; color: string }[] = [
  { name: "Bond & Fixed Income", icon: Landmark, color: "#3B82F6" },
  { name: "Dividend & Income", icon: DollarSign, color: "#10B981" },
  { name: "Growth & Momentum", icon: Rocket, color: "#8B5CF6" },
  { name: "ESG & Sustainability", icon: Leaf, color: "#22C55E" },
  { name: "Commodity & Real Assets", icon: Coins, color: "#F59E0B" },
  { name: "Leveraged & Inverse", icon: Scale, color: "#EF4444" },
];

function TrendingCategoriesWidget() {
  return (
    <div>
      <h2 className="mb-3 text-[18px] font-bold tracking-tight">
        Trending Categories
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {trendingCategories.map((col) => (
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
/*  ETF Ratings — Morningstar (Risk-Adjusted) + CFRA (Forward-Looking) */
/* ------------------------------------------------------------------ */

type MorningstarFilter = "5star" | "4star" | "3star";
type CFRAFilter = "overweight" | "marketweight" | "underweight";

/* — Morningstar risk-adjusted performance data — */

type MorningstarRisk = "Low" | "Below Avg" | "Average" | "Above Avg" | "High";
type MorningstarReturn = "Low" | "Below Avg" | "Average" | "Above Avg" | "High";

interface MorningstarETF {
  symbol: string;
  name: string;
  stars: number;
  return3y: number;
  return5y: number;
  risk: MorningstarRisk;
  returnRating: MorningstarReturn;
  expenseRatio: number;
  aum: string;
  category: string;
}

const morningstarData: Record<MorningstarFilter, MorningstarETF[]> = {
  "5star": [
    { symbol: "VOO", name: "Vanguard S&P 500", stars: 5, return3y: 12.8, return5y: 14.2, risk: "Average", returnRating: "High", expenseRatio: 0.03, aum: "$482B", category: "Large Blend" },
    { symbol: "SCHD", name: "Schwab US Dividend", stars: 5, return3y: 10.4, return5y: 12.8, risk: "Below Avg", returnRating: "High", expenseRatio: 0.06, aum: "$52B", category: "Large Value" },
    { symbol: "QQQ", name: "Invesco QQQ", stars: 5, return3y: 14.6, return5y: 18.2, risk: "Above Avg", returnRating: "High", expenseRatio: 0.20, aum: "$280B", category: "Large Growth" },
    { symbol: "VTI", name: "Vanguard Total Mkt", stars: 5, return3y: 12.2, return5y: 13.8, risk: "Average", returnRating: "High", expenseRatio: 0.03, aum: "$410B", category: "Large Blend" },
    { symbol: "VIG", name: "Vanguard Div Apprec", stars: 5, return3y: 10.8, return5y: 12.4, risk: "Below Avg", returnRating: "Above Avg", expenseRatio: 0.06, aum: "$82B", category: "Large Blend" },
  ],
  "4star": [
    { symbol: "SPY", name: "SPDR S&P 500", stars: 4, return3y: 12.6, return5y: 14.0, risk: "Average", returnRating: "Above Avg", expenseRatio: 0.09, aum: "$562B", category: "Large Blend" },
    { symbol: "IWM", name: "iShares Russell 2K", stars: 4, return3y: 6.8, return5y: 8.4, risk: "Above Avg", returnRating: "Above Avg", expenseRatio: 0.19, aum: "$72B", category: "Small Blend" },
    { symbol: "XLK", name: "Tech Select SPDR", stars: 4, return3y: 16.2, return5y: 20.4, risk: "Above Avg", returnRating: "High", expenseRatio: 0.09, aum: "$68B", category: "Technology" },
    { symbol: "VEA", name: "Vanguard FTSE Dev Mkt", stars: 4, return3y: 5.4, return5y: 7.2, risk: "Average", returnRating: "Above Avg", expenseRatio: 0.05, aum: "$118B", category: "Foreign Lg Blend" },
    { symbol: "AGG", name: "iShares Core US Agg", stars: 4, return3y: 1.8, return5y: 1.2, risk: "Low", returnRating: "Above Avg", expenseRatio: 0.03, aum: "$98B", category: "Interm Core Bond" },
  ],
  "3star": [
    { symbol: "EFA", name: "iShares MSCI EAFE", stars: 3, return3y: 4.8, return5y: 6.2, risk: "Average", returnRating: "Average", expenseRatio: 0.32, aum: "$52B", category: "Foreign Lg Blend" },
    { symbol: "GLD", name: "SPDR Gold Shares", stars: 3, return3y: 8.2, return5y: 10.4, risk: "Average", returnRating: "Average", expenseRatio: 0.40, aum: "$62B", category: "Commodities" },
    { symbol: "TLT", name: "iShares 20+ Yr Trsy", stars: 3, return3y: -4.2, return5y: -2.8, risk: "Above Avg", returnRating: "Below Avg", expenseRatio: 0.15, aum: "$52B", category: "Long-Term Bond" },
    { symbol: "EEM", name: "iShares MSCI EM", stars: 3, return3y: 1.2, return5y: 2.8, risk: "Above Avg", returnRating: "Average", expenseRatio: 0.68, aum: "$18B", category: "Diversified EM" },
    { symbol: "XLU", name: "Utilities SPDR", stars: 3, return3y: 3.8, return5y: 6.4, risk: "Below Avg", returnRating: "Average", expenseRatio: 0.09, aum: "$18B", category: "Utilities" },
  ],
};

const mstarFilterTabs: { id: MorningstarFilter; label: string }[] = [
  { id: "5star", label: "★★★★★" },
  { id: "4star", label: "★★★★" },
  { id: "3star", label: "★★★" },
];

const riskColor: Record<MorningstarRisk, string> = {
  Low: "text-emerald-500",
  "Below Avg": "text-emerald-400",
  Average: "text-muted-foreground",
  "Above Avg": "text-amber-500",
  High: "text-red-500",
};

const returnColor: Record<MorningstarReturn, string> = {
  High: "text-emerald-500",
  "Above Avg": "text-emerald-400",
  Average: "text-muted-foreground",
  "Below Avg": "text-amber-500",
  Low: "text-red-500",
};

/* — CFRA forward-looking analysis data — */

type CFRARating = "Overweight" | "Marketweight" | "Underweight";
type LetterGrade = "A" | "B" | "C" | "D";

interface CFRAETF {
  symbol: string;
  name: string;
  rating: CFRARating;
  score: number;
  holdingsGrade: LetterGrade;
  costGrade: LetterGrade;
  riskGrade: LetterGrade;
  ytdReturn: number;
  category: string;
}

const cfraData: Record<CFRAFilter, CFRAETF[]> = {
  overweight: [
    { symbol: "QQQ", name: "Invesco QQQ", rating: "Overweight", score: 9.2, holdingsGrade: "A", costGrade: "B", riskGrade: "B", ytdReturn: 8.4, category: "Large Growth" },
    { symbol: "SMH", name: "VanEck Semiconductor", rating: "Overweight", score: 9.0, holdingsGrade: "A", costGrade: "B", riskGrade: "C", ytdReturn: 12.6, category: "Technology" },
    { symbol: "VTI", name: "Vanguard Total Mkt", rating: "Overweight", score: 8.8, holdingsGrade: "A", costGrade: "A", riskGrade: "B", ytdReturn: 6.2, category: "Large Blend" },
    { symbol: "XLE", name: "Energy Select SPDR", rating: "Overweight", score: 8.5, holdingsGrade: "B", costGrade: "A", riskGrade: "C", ytdReturn: 10.8, category: "Energy" },
    { symbol: "SCHD", name: "Schwab US Dividend", rating: "Overweight", score: 8.4, holdingsGrade: "A", costGrade: "A", riskGrade: "A", ytdReturn: 4.8, category: "Large Value" },
  ],
  marketweight: [
    { symbol: "SPY", name: "SPDR S&P 500", rating: "Marketweight", score: 7.2, holdingsGrade: "A", costGrade: "A", riskGrade: "B", ytdReturn: 5.8, category: "Large Blend" },
    { symbol: "BND", name: "Vanguard Total Bond", rating: "Marketweight", score: 6.8, holdingsGrade: "B", costGrade: "A", riskGrade: "A", ytdReturn: 1.2, category: "Interm Core Bond" },
    { symbol: "GLD", name: "SPDR Gold Shares", rating: "Marketweight", score: 6.5, holdingsGrade: "B", costGrade: "C", riskGrade: "B", ytdReturn: 4.2, category: "Commodities" },
    { symbol: "EFA", name: "iShares MSCI EAFE", rating: "Marketweight", score: 6.2, holdingsGrade: "B", costGrade: "C", riskGrade: "B", ytdReturn: 3.4, category: "Foreign Lg Blend" },
    { symbol: "XLU", name: "Utilities SPDR", rating: "Marketweight", score: 6.0, holdingsGrade: "B", costGrade: "A", riskGrade: "A", ytdReturn: 2.8, category: "Utilities" },
  ],
  underweight: [
    { symbol: "ARKK", name: "ARK Innovation", rating: "Underweight", score: 3.2, holdingsGrade: "C", costGrade: "D", riskGrade: "D", ytdReturn: -8.4, category: "Mid-Cap Growth" },
    { symbol: "BITO", name: "ProShares Bitcoin", rating: "Underweight", score: 2.8, holdingsGrade: "D", costGrade: "D", riskGrade: "D", ytdReturn: -12.6, category: "Digital Assets" },
    { symbol: "TLT", name: "iShares 20+ Yr Trsy", rating: "Underweight", score: 4.2, holdingsGrade: "B", costGrade: "B", riskGrade: "D", ytdReturn: -4.8, category: "Long-Term Bond" },
    { symbol: "EEM", name: "iShares MSCI EM", rating: "Underweight", score: 4.0, holdingsGrade: "C", costGrade: "D", riskGrade: "C", ytdReturn: -2.4, category: "Diversified EM" },
    { symbol: "TQQQ", name: "ProShares UltraPro QQQ", rating: "Underweight", score: 2.4, holdingsGrade: "C", costGrade: "D", riskGrade: "D", ytdReturn: 22.8, category: "Leveraged" },
  ],
};

const cfraFilterTabs: { id: CFRAFilter; label: string }[] = [
  { id: "overweight", label: "Overweight" },
  { id: "marketweight", label: "Marketweight" },
  { id: "underweight", label: "Underweight" },
];

const gradeColor: Record<LetterGrade, string> = {
  A: "text-emerald-500",
  B: "text-emerald-400",
  C: "text-amber-500",
  D: "text-red-500",
};

/* ------------------------------------------------------------------ */
/*  Stars visual component                                             */
/* ------------------------------------------------------------------ */

function Stars({ count }: { count: number }) {
  return (
    <span className="text-amber-400 text-[12px] tracking-tight">
      {"★".repeat(count)}
      <span className="text-muted-foreground/30">{"★".repeat(5 - count)}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Score bar (CFRA 0-10)                                              */
/* ------------------------------------------------------------------ */

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? "#10b981" : score >= 5 ? "#a1a1aa" : "#ef4444";

  return (
    <div className="flex w-[72px] flex-col items-center gap-0.5">
      <div className="flex h-[4px] w-full overflow-hidden rounded-full bg-muted">
        <div className="rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-[11px] font-semibold tabular-nums" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ETF Ratings Widget                                                 */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Frozen-left ETF row (shared by both widgets)                       */
/* ------------------------------------------------------------------ */

function FrozenETFColumn({
  etfs,
  bookmarks,
  toggleBookmark,
}: {
  etfs: { symbol: string; name: string }[];
  bookmarks: Set<string>;
  toggleBookmark: (sym: string) => void;
}) {
  return (
    <div className="z-10 w-[170px] flex-shrink-0 bg-card shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
      <div className="flex h-[37px] items-center px-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        ETF
      </div>
      {etfs.map((etf) => (
        <div
          key={etf.symbol}
          className="flex h-[56px] items-center border-t border-border/20 px-4"
        >
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => toggleBookmark(etf.symbol)}
              className="flex-shrink-0 transition-transform active:scale-90"
            >
              <Bookmark
                size={16}
                strokeWidth={1.8}
                className={cn(
                  "transition-colors",
                  bookmarks.has(etf.symbol)
                    ? "fill-foreground text-foreground"
                    : "text-muted-foreground/60"
                )}
              />
            </button>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground">
              {etf.symbol.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="max-w-[85px] truncate text-[14px] font-semibold leading-tight">
                {etf.name}
              </p>
              <p className="text-[12px] leading-tight text-muted-foreground">
                {etf.symbol}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Risk-Adjusted Performance Widget (Morningstar)                     */
/* ------------------------------------------------------------------ */

function RiskAdjustedWidget() {
  const [filter, setFilter] = useState<MorningstarFilter>("5star");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const etfs = morningstarData[filter];

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      n.has(sym) ? n.delete(sym) : n.add(sym);
      return n;
    });

  return (
    <div>
      <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">
        Risk-Adjusted Performance
      </h2>
      <p className="mb-2.5 text-[14px] text-muted-foreground">
        Morningstar ratings based on historical risk-adjusted returns
      </p>

      {/* Star filter pills */}
      <div className="mb-2.5 flex gap-2">
        {mstarFilterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              filter === tab.id
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
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            <FrozenETFColumn etfs={etfs} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />

            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table style={{ minWidth: 620 }}>
                <thead>
                  <tr className="h-[37px]">
                    <th className="min-w-[72px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Rating
                    </th>
                    <th className="min-w-[64px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      3Y Ret
                    </th>
                    <th className="min-w-[64px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      5Y Ret
                    </th>
                    <th className="min-w-[72px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Risk
                    </th>
                    <th className="min-w-[72px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Return
                    </th>
                    <th className="min-w-[52px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Exp %
                    </th>
                    <th className="min-w-[68px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      AUM
                    </th>
                    <th className="min-w-[90px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {etfs.map((etf) => (
                    <tr key={etf.symbol} className="h-[56px] border-t border-border/20">
                      <td className="px-3 text-center">
                        <Stars count={etf.stars} />
                      </td>
                      <td className={cn(
                        "whitespace-nowrap px-3 text-right font-mono text-[13px] font-semibold tabular-nums",
                        etf.return3y >= 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {etf.return3y >= 0 ? "+" : ""}{etf.return3y.toFixed(1)}%
                      </td>
                      <td className={cn(
                        "whitespace-nowrap px-3 text-right font-mono text-[13px] font-semibold tabular-nums",
                        etf.return5y >= 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {etf.return5y >= 0 ? "+" : ""}{etf.return5y.toFixed(1)}%
                      </td>
                      <td className={cn("whitespace-nowrap px-3 text-center text-[12px] font-medium", riskColor[etf.risk])}>
                        {etf.risk}
                      </td>
                      <td className={cn("whitespace-nowrap px-3 text-center text-[12px] font-medium", returnColor[etf.returnRating])}>
                        {etf.returnRating}
                      </td>
                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {etf.expenseRatio.toFixed(2)}%
                      </td>
                      <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                        {etf.aum}
                      </td>
                      <td className="whitespace-nowrap px-3 text-right text-[12px] text-muted-foreground">
                        {etf.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>

        <button className="flex w-full items-center justify-center gap-1 border-t border-border/40 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
          View More
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Forward-Looking Analysis Widget (CFRA)                             */
/* ------------------------------------------------------------------ */

function ForwardLookingWidget() {
  const [filter, setFilter] = useState<CFRAFilter>("overweight");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const etfs = cfraData[filter];

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      n.has(sym) ? n.delete(sym) : n.add(sym);
      return n;
    });

  return (
    <div>
      <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">
        Forward-Looking Analysis
      </h2>
      <p className="mb-2.5 text-[14px] text-muted-foreground">
        CFRA ratings based on expected future performance
      </p>

      {/* CFRA filter pills */}
      <div className="mb-2.5 flex gap-2">
        {cfraFilterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              filter === tab.id
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
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            <FrozenETFColumn etfs={etfs} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />

            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table style={{ minWidth: 540 }}>
                <thead>
                  <tr className="h-[37px]">
                    <th className="min-w-[90px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Score
                    </th>
                    <th className="min-w-[60px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Holdings
                    </th>
                    <th className="min-w-[48px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Cost
                    </th>
                    <th className="min-w-[48px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Risk
                    </th>
                    <th className="min-w-[68px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      YTD Ret
                    </th>
                    <th className="min-w-[90px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {etfs.map((etf) => (
                    <tr key={etf.symbol} className="h-[56px] border-t border-border/20">
                      <td className="px-3">
                        <div className="flex justify-center">
                          <ScoreBar score={etf.score} />
                        </div>
                      </td>
                      <td className={cn("whitespace-nowrap px-3 text-center text-[14px] font-bold", gradeColor[etf.holdingsGrade])}>
                        {etf.holdingsGrade}
                      </td>
                      <td className={cn("whitespace-nowrap px-3 text-center text-[14px] font-bold", gradeColor[etf.costGrade])}>
                        {etf.costGrade}
                      </td>
                      <td className={cn("whitespace-nowrap px-3 text-center text-[14px] font-bold", gradeColor[etf.riskGrade])}>
                        {etf.riskGrade}
                      </td>
                      <td className={cn(
                        "whitespace-nowrap px-3 text-right font-mono text-[13px] font-semibold tabular-nums",
                        etf.ytdReturn >= 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {etf.ytdReturn >= 0 ? "+" : ""}{etf.ytdReturn.toFixed(1)}%
                      </td>
                      <td className="whitespace-nowrap px-3 text-right text-[12px] text-muted-foreground">
                        {etf.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>

        <button className="flex w-full items-center justify-center gap-1 border-t border-border/40 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
          View More
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ETF Screeners Widget                                               */
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
  { name: "Low Cost Leaders", description: "Expense ratio under 0.10%", icon: DollarSign, color: "#10B981", matchCount: 86 },
  { name: "High Dividend Yield", description: "Trailing 12M yield above 4%", icon: Gem, color: "#F59E0B", matchCount: 54 },
  { name: "Largest by AUM", description: "Top ETFs by assets under management", icon: BarChart3, color: "#3B82F6", matchCount: 50 },
];

const premiumScreeners: Screener[] = [
  { name: "Tax-Loss Harvest", description: "Similar ETFs with no wash sale risk", icon: Target, color: "#EF4444", matchCount: 28 },
  { name: "Factor Tilt", description: "Value, momentum, quality, or size tilt", icon: Layers, color: "#F97316", matchCount: 36 },
  { name: "Premium / Discount", description: "Trading at significant NAV discount", icon: TrendingDown, color: "#6366F1", matchCount: 18 },
];

function ScreenerWidget() {
  const [activeTab, setActiveTab] = useState<ScreenerTab>("basic");
  const screeners = activeTab === "basic" ? basicScreeners : premiumScreeners;

  return (
    <div>
      <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">
        ETF Screeners
      </h2>
      <p className="mb-3 text-[14px] text-muted-foreground">
        Find ETFs that match your criteria
      </p>

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
                  {screener.matchCount} ETFs
                </span>
                <ChevronRight size={14} className="text-muted-foreground/60" />
              </div>
            </button>
          ))}

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
/*  Level Up Widget (ETF-specific education)                           */
/* ------------------------------------------------------------------ */

const levelUpStages = [
  {
    title: "ETF Fundamentals",
    body: "Understand what ETFs are, how they track indices, and why expense ratios matter.",
    videos: [
      { title: "ETFs vs Mutual Funds vs Stocks", duration: "4 min" },
      { title: "How index tracking works", duration: "5 min" },
      { title: "Expense ratios explained", duration: "3 min" },
    ],
  },
  {
    title: "Building Your Portfolio",
    body: "Learn asset allocation, core-satellite strategy, and when to rebalance.",
    videos: [
      { title: "Core-satellite portfolio strategy", duration: "5 min" },
      { title: "Asset allocation by age", duration: "4 min" },
      { title: "When & how to rebalance", duration: "4 min" },
    ],
  },
  {
    title: "Advanced ETF Strategies",
    body: "Sector rotation, leveraged ETFs, and using ETFs for options strategies.",
    videos: [
      { title: "Sector rotation with ETFs", duration: "5 min" },
      { title: "Leveraged & inverse ETFs", duration: "4 min" },
      { title: "Options on ETFs (basics)", duration: "5 min" },
    ],
  },
  {
    title: "Tax-Smart Investing",
    body: "Tax-loss harvesting, wash sale rules, and the ETF tax advantage.",
    videos: [
      { title: "The ETF tax advantage", duration: "4 min" },
      { title: "Tax-loss harvesting with ETFs", duration: "5 min" },
      { title: "Avoiding wash sale traps", duration: "3 min" },
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
        Master ETF investing from beginner to advanced. Here&apos;s the path.
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
/*  Market Heatmap — data                                              */
/* ------------------------------------------------------------------ */

type HeatmapView = "etfs" | "categories";
const heatViewOrder: HeatmapView[] = ["etfs", "categories"];
const heatViewLabels: Record<HeatmapView, string> = { etfs: "ETFs", categories: "Categories" };

type HeatmapBasis = "aum" | "volume";

const heatmapETFs: Record<HeatmapBasis, { symbol: string; weight: number; change: number }[]> = {
  aum: [
    { symbol: "SPY", weight: 12.8, change: 1.4 },
    { symbol: "VOO", weight: 11.0, change: 1.3 },
    { symbol: "VTI", weight: 9.4, change: 1.2 },
    { symbol: "QQQ", weight: 6.4, change: 1.9 },
    { symbol: "BND", weight: 4.8, change: 0.3 },
    { symbol: "AGG", weight: 4.2, change: 0.2 },
    { symbol: "IVV", weight: 3.8, change: 1.3 },
    { symbol: "VIG", weight: 3.2, change: 0.8 },
    { symbol: "VXUS", weight: 2.8, change: -1.4 },
    { symbol: "VWO", weight: 2.4, change: -2.1 },
    { symbol: "IWM", weight: 2.2, change: 2.1 },
    { symbol: "GLD", weight: 2.0, change: 0.4 },
    { symbol: "XLK", weight: 1.8, change: 2.9 },
    { symbol: "TLT", weight: 1.6, change: 0.8 },
    { symbol: "SCHD", weight: 1.5, change: 0.6 },
    { symbol: "EFA", weight: 1.4, change: -1.9 },
    { symbol: "VEA", weight: 1.3, change: -0.7 },
    { symbol: "XLE", weight: 1.2, change: 3.4 },
    { symbol: "LQD", weight: 1.0, change: 0.4 },
    { symbol: "HYG", weight: 0.9, change: 0.6 },
    { symbol: "DIA", weight: 0.8, change: -0.9 },
    { symbol: "SMH", weight: 0.7, change: 3.2 },
    { symbol: "XLF", weight: 0.7, change: 2.0 },
    { symbol: "ARKK", weight: 0.5, change: 4.9 },
    { symbol: "EEM", weight: 0.5, change: -2.3 },
  ],
  volume: [
    { symbol: "SPY", weight: 18.2, change: 1.4 },
    { symbol: "QQQ", weight: 12.4, change: 1.9 },
    { symbol: "IWM", weight: 6.8, change: 2.1 },
    { symbol: "EEM", weight: 5.2, change: -2.3 },
    { symbol: "XLE", weight: 4.8, change: 3.4 },
    { symbol: "XLF", weight: 4.2, change: 2.0 },
    { symbol: "TLT", weight: 3.8, change: 0.8 },
    { symbol: "HYG", weight: 3.4, change: 0.6 },
    { symbol: "ARKK", weight: 3.0, change: 4.9 },
    { symbol: "GLD", weight: 2.6, change: 0.4 },
    { symbol: "EFA", weight: 2.4, change: -1.9 },
    { symbol: "XLK", weight: 2.2, change: 2.9 },
    { symbol: "DIA", weight: 2.0, change: -0.9 },
    { symbol: "VOO", weight: 1.8, change: 1.3 },
    { symbol: "SMH", weight: 1.6, change: 3.2 },
    { symbol: "VTI", weight: 1.4, change: 1.2 },
    { symbol: "BND", weight: 1.2, change: 0.3 },
    { symbol: "XLV", weight: 1.0, change: -0.5 },
    { symbol: "LQD", weight: 0.9, change: 0.4 },
    { symbol: "VWO", weight: 0.8, change: -2.1 },
    { symbol: "SCHD", weight: 0.7, change: 0.6 },
    { symbol: "AGG", weight: 0.6, change: 0.2 },
    { symbol: "XLRE", weight: 0.5, change: -3.2 },
    { symbol: "XLU", weight: 0.5, change: -2.2 },
    { symbol: "BITO", weight: 0.4, change: -4.8 },
  ],
};

const heatmapCategories: { symbol: string; weight: number; change: number }[] = [
  { symbol: "US Equity", weight: 38.2, change: 1.4 },
  { symbol: "Bond", weight: 18.5, change: 0.3 },
  { symbol: "Intl Equity", weight: 12.8, change: -1.2 },
  { symbol: "Sector", weight: 10.4, change: 1.8 },
  { symbol: "Commodity", weight: 5.8, change: 0.5 },
  { symbol: "Dividend", weight: 4.2, change: 0.7 },
  { symbol: "Thematic", weight: 3.8, change: 2.4 },
  { symbol: "Leveraged", weight: 2.6, change: -1.8 },
  { symbol: "Real Estate", weight: 2.1, change: -2.4 },
  { symbol: "Crypto", weight: 1.6, change: -3.2 },
];

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
/*  ETF Heatmap Widget                                                 */
/* ------------------------------------------------------------------ */

function HeatmapWidget() {
  const [basis, setBasis] = useState<HeatmapBasis>("aum");
  const [view, setView] = useState<HeatmapView>("etfs");

  const items = view === "etfs" ? heatmapETFs[basis] : heatmapCategories;
  const rects = useMemo(() => treemapLayout(items), [items]);

  const cycleView = () =>
    setView((p) => heatViewOrder[(heatViewOrder.indexOf(p) + 1) % heatViewOrder.length]);

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold tracking-tight">ETF Heatmap</h2>

      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex gap-2">
          {(["aum", "volume"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setBasis(id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                basis === id
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {id === "aum" ? "By AUM" : "By Volume"}
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

      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: `${TM_W} / ${TM_H}` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${basis}-${view}`}
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

export function ETFFundedNotTraded() {
  return (
    <div className="space-y-8 px-4 pt-5 pb-4">
      <PromoBanner />
      <TopMoversWidget />
      <HeatmapWidget />
      <TrendingCategoriesWidget />
      <RiskAdjustedWidget />
      <ForwardLookingWidget />
      <ScreenerWidget />
      <LevelUpWidget />
    </div>
  );
}
