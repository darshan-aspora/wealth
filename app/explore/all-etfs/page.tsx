"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Bookmark,
} from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ETF {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  aum: string;
  expenseRatio: number;
  yield: number | null;
  return1y: number;
  return3y: number;
  return5y: number;
  volume: string;
  high52w: number;
  low52w: number;
}

/* ------------------------------------------------------------------ */
/*  Sort config                                                        */
/* ------------------------------------------------------------------ */

type SortKey =
  | "changePercent"
  | "return1y"
  | "return3y"
  | "return5y"
  | "aum"
  | "expenseRatio"
  | "volume";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "return1y", label: "1Y Return" },
  { key: "return3y", label: "3Y Return" },
  { key: "return5y", label: "5Y Return" },
  { key: "aum", label: "AUM" },
  { key: "expenseRatio", label: "Expense Ratio" },
  { key: "volume", label: "Volume" },
];

const DEFAULT_SORT: { key: SortKey; dir: SortDir } = {
  key: "return1y",
  dir: "desc",
};

/* ------------------------------------------------------------------ */
/*  Region tabs                                                        */
/* ------------------------------------------------------------------ */

const REGIONS = [
  "Europe",
  "Asia Pacific",
  "Emerging",
  "Americas",
  "Middle East",
] as const;
type Region = (typeof REGIONS)[number];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseAum(s: string): number {
  const n = parseFloat(s.replace("$", ""));
  if (s.includes("T")) return n * 1e12;
  if (s.includes("B")) return n * 1e9;
  if (s.includes("M")) return n * 1e6;
  return n;
}

function parseVol(v: string): number {
  const n = parseFloat(v);
  if (v.toUpperCase().includes("M")) return n * 1e6;
  if (v.toUpperCase().includes("K")) return n * 1e3;
  return n;
}

function applySort(list: ETF[], key: SortKey, dir: SortDir): ETF[] {
  const mul = dir === "asc" ? 1 : -1;
  const val = (e: ETF): number => {
    switch (key) {
      case "changePercent":
        return e.changePercent;
      case "return1y":
        return e.return1y;
      case "return3y":
        return e.return3y;
      case "return5y":
        return e.return5y;
      case "aum":
        return parseAum(e.aum);
      case "expenseRatio":
        return e.expenseRatio;
      case "volume":
        return parseVol(e.volume);
    }
  };
  return [...list].sort((a, b) => (val(a) - val(b)) * mul);
}

/* ------------------------------------------------------------------ */
/*  RangeBar                                                           */
/* ------------------------------------------------------------------ */

function RangeBar({
  low,
  high,
  current,
}: {
  low: number;
  high: number;
  current: number;
}) {
  const range = high - low || 1;
  const pct = Math.max(0, Math.min(100, ((current - low) / range) * 100));
  return (
    <div className="flex items-center gap-1.5 w-full">
      <span className="text-[12px] tabular-nums text-muted-foreground whitespace-nowrap leading-none">
        {low.toFixed(0)}
      </span>
      <div className="relative flex-1 h-[3px] rounded-full bg-muted">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[12px] w-[2px] bg-foreground"
          style={{ left: `${pct}%` }}
        />
      </div>
      <span className="text-[12px] tabular-nums text-muted-foreground whitespace-nowrap leading-none">
        {high.toFixed(0)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock data — 5 regions x ~20 ETFs                                   */
/* ------------------------------------------------------------------ */

const EUROPE_ETFS: ETF[] = [
  { symbol: "VGK", name: "Vanguard FTSE Europe", price: 66.42, changePercent: 1.24, aum: "22.1B", expenseRatio: 0.08, yield: 3.1, return1y: 14.8, return3y: 8.2, return5y: 7.6, volume: "4.8M", high52w: 68.9, low52w: 55.3 },
  { symbol: "EZU", name: "iShares MSCI Eurozone", price: 49.87, changePercent: 0.92, aum: "7.3B", expenseRatio: 0.51, yield: 2.4, return1y: 13.6, return3y: 7.5, return5y: 6.9, volume: "3.2M", high52w: 51.2, low52w: 40.1 },
  { symbol: "HEDJ", name: "WisdomTree Europe Hedged Eq", price: 78.34, changePercent: -0.38, aum: "2.9B", expenseRatio: 0.58, yield: 2.8, return1y: 11.2, return3y: 6.1, return5y: 5.4, volume: "1.1M", high52w: 82.0, low52w: 64.5 },
  { symbol: "FEZ", name: "SPDR EURO STOXX 50", price: 50.18, changePercent: 1.56, aum: "3.8B", expenseRatio: 0.29, yield: 2.7, return1y: 15.3, return3y: 9.0, return5y: 8.1, volume: "2.5M", high52w: 52.4, low52w: 40.8 },
  { symbol: "EWG", name: "iShares MSCI Germany", price: 30.25, changePercent: 2.14, aum: "2.1B", expenseRatio: 0.50, yield: 2.2, return1y: 18.7, return3y: 5.8, return5y: 4.2, volume: "3.7M", high52w: 32.1, low52w: 23.4 },
  { symbol: "EWU", name: "iShares MSCI United Kingdom", price: 35.60, changePercent: 0.73, aum: "2.6B", expenseRatio: 0.50, yield: 3.8, return1y: 12.1, return3y: 7.0, return5y: 5.8, volume: "2.9M", high52w: 37.0, low52w: 28.9 },
  { symbol: "EWQ", name: "iShares MSCI France", price: 38.72, changePercent: -0.64, aum: "0.8B", expenseRatio: 0.50, yield: 2.5, return1y: 10.4, return3y: 6.3, return5y: 5.9, volume: "0.6M", high52w: 41.2, low52w: 31.5 },
  { symbol: "EWI", name: "iShares MSCI Italy", price: 34.15, changePercent: 1.88, aum: "0.5B", expenseRatio: 0.50, yield: 3.2, return1y: 22.4, return3y: 11.8, return5y: 7.3, volume: "0.4M", high52w: 35.8, low52w: 24.6 },
  { symbol: "EWP", name: "iShares MSCI Spain", price: 31.40, changePercent: 0.96, aum: "0.4B", expenseRatio: 0.50, yield: 3.5, return1y: 19.2, return3y: 10.1, return5y: 4.8, volume: "0.3M", high52w: 33.0, low52w: 23.8 },
  { symbol: "EWD", name: "iShares MSCI Sweden", price: 38.90, changePercent: -1.12, aum: "0.5B", expenseRatio: 0.50, yield: 2.9, return1y: 8.6, return3y: 2.4, return5y: 3.1, volume: "0.2M", high52w: 42.3, low52w: 31.7 },
  { symbol: "NORW", name: "Global X MSCI Norway", price: 25.64, changePercent: 0.48, aum: "0.1B", expenseRatio: 0.50, yield: 4.1, return1y: 6.3, return3y: 4.7, return5y: 5.2, volume: "0.1M", high52w: 28.1, low52w: 21.3 },
  { symbol: "EIRL", name: "Global X MSCI Ireland", price: 52.30, changePercent: 1.35, aum: "0.1B", expenseRatio: 0.50, yield: 1.1, return1y: 16.5, return3y: 9.4, return5y: 8.7, volume: "0.05M", high52w: 54.8, low52w: 42.1 },
  { symbol: "GREK", name: "Global X MSCI Greece", price: 38.74, changePercent: 2.68, aum: "0.3B", expenseRatio: 0.57, yield: 1.8, return1y: 28.4, return3y: 18.2, return5y: 9.6, volume: "0.2M", high52w: 40.1, low52w: 26.8 },
  { symbol: "EWN", name: "iShares MSCI Netherlands", price: 45.82, changePercent: 0.55, aum: "0.3B", expenseRatio: 0.50, yield: 1.6, return1y: 17.1, return3y: 10.6, return5y: 11.2, volume: "0.1M", high52w: 48.0, low52w: 36.4 },
  { symbol: "EWL", name: "iShares MSCI Switzerland", price: 48.16, changePercent: 0.32, aum: "1.3B", expenseRatio: 0.50, yield: 2.3, return1y: 9.8, return3y: 5.5, return5y: 7.4, volume: "0.4M", high52w: 50.2, low52w: 41.0 },
  { symbol: "EPOL", name: "iShares MSCI Poland", price: 22.50, changePercent: 3.41, aum: "0.3B", expenseRatio: 0.58, yield: 1.4, return1y: 32.1, return3y: 14.3, return5y: 6.2, volume: "0.3M", high52w: 23.8, low52w: 14.7 },
  { symbol: "EDEN", name: "iShares MSCI Denmark", price: 88.42, changePercent: -0.81, aum: "0.2B", expenseRatio: 0.53, yield: 1.2, return1y: 7.2, return3y: 3.8, return5y: 12.4, volume: "0.05M", high52w: 96.4, low52w: 74.3 },
  { symbol: "EFNL", name: "iShares MSCI Finland", price: 32.80, changePercent: -1.56, aum: "0.04B", expenseRatio: 0.53, yield: 3.4, return1y: -2.8, return3y: -4.1, return5y: 1.2, volume: "0.02M", high52w: 38.1, low52w: 29.4 },
  { symbol: "PGAL", name: "Global X MSCI Portugal", price: 10.84, changePercent: 1.78, aum: "0.02B", expenseRatio: 0.55, yield: 2.6, return1y: 14.6, return3y: 8.9, return5y: 3.5, volume: "0.01M", high52w: 11.5, low52w: 8.2 },
  { symbol: "EUFN", name: "iShares MSCI Europe Financials", price: 23.17, changePercent: 2.04, aum: "1.8B", expenseRatio: 0.48, yield: 3.6, return1y: 24.8, return3y: 16.2, return5y: 8.9, volume: "1.4M", high52w: 24.0, low52w: 16.5 },
];

const ASIA_PACIFIC_ETFS: ETF[] = [
  { symbol: "VPL", name: "Vanguard FTSE Pacific", price: 72.58, changePercent: 0.84, aum: "7.4B", expenseRatio: 0.08, yield: 2.4, return1y: 11.3, return3y: 3.2, return5y: 4.8, volume: "1.2M", high52w: 74.6, low52w: 61.2 },
  { symbol: "EWJ", name: "iShares MSCI Japan", price: 68.94, changePercent: 1.57, aum: "14.2B", expenseRatio: 0.50, yield: 1.6, return1y: 16.8, return3y: 6.4, return5y: 5.2, volume: "5.8M", high52w: 71.3, low52w: 56.8 },
  { symbol: "EWA", name: "iShares MSCI Australia", price: 24.32, changePercent: 0.62, aum: "2.1B", expenseRatio: 0.50, yield: 3.9, return1y: 8.4, return3y: 5.1, return5y: 5.7, volume: "1.4M", high52w: 25.8, low52w: 20.1 },
  { symbol: "EWH", name: "iShares MSCI Hong Kong", price: 19.74, changePercent: -1.28, aum: "1.0B", expenseRatio: 0.50, yield: 2.8, return1y: 4.2, return3y: -8.4, return5y: -5.2, volume: "2.8M", high52w: 22.1, low52w: 15.6 },
  { symbol: "EWS", name: "iShares MSCI Singapore", price: 21.56, changePercent: 0.37, aum: "0.5B", expenseRatio: 0.50, yield: 3.7, return1y: 5.8, return3y: 2.9, return5y: 1.4, volume: "0.4M", high52w: 23.0, low52w: 18.4 },
  { symbol: "EWY", name: "iShares MSCI South Korea", price: 63.42, changePercent: -2.14, aum: "4.8B", expenseRatio: 0.59, yield: 1.2, return1y: 6.2, return3y: -1.8, return5y: 2.1, volume: "3.6M", high52w: 72.4, low52w: 54.8 },
  { symbol: "EWT", name: "iShares MSCI Taiwan", price: 52.80, changePercent: 1.92, aum: "5.6B", expenseRatio: 0.59, yield: 1.9, return1y: 18.4, return3y: 8.6, return5y: 12.8, volume: "8.4M", high52w: 55.2, low52w: 40.3 },
  { symbol: "INDA", name: "iShares MSCI India", price: 49.68, changePercent: 0.74, aum: "8.2B", expenseRatio: 0.65, yield: 0.6, return1y: 20.6, return3y: 12.4, return5y: 10.8, volume: "6.2M", high52w: 52.4, low52w: 38.1 },
  { symbol: "INDY", name: "iShares India 50", price: 52.14, changePercent: 0.91, aum: "2.4B", expenseRatio: 0.89, yield: 0.5, return1y: 18.2, return3y: 11.8, return5y: 9.4, volume: "0.8M", high52w: 54.8, low52w: 40.6 },
  { symbol: "PIN", name: "Invesco India", price: 28.36, changePercent: 1.12, aum: "0.3B", expenseRatio: 0.78, yield: 0.8, return1y: 22.8, return3y: 14.2, return5y: 11.6, volume: "0.2M", high52w: 30.1, low52w: 21.4 },
  { symbol: "DXJS", name: "WisdomTree Japan Hedged SmCap", price: 44.72, changePercent: 2.34, aum: "0.2B", expenseRatio: 0.58, yield: 1.4, return1y: 24.6, return3y: 8.2, return5y: 6.8, volume: "0.1M", high52w: 46.8, low52w: 34.2 },
  { symbol: "DFJ", name: "WisdomTree Japan SmallCap Div", price: 62.18, changePercent: 0.48, aum: "0.4B", expenseRatio: 0.58, yield: 2.6, return1y: 12.4, return3y: 4.8, return5y: 3.2, volume: "0.1M", high52w: 65.2, low52w: 52.4 },
  { symbol: "ENZL", name: "iShares MSCI New Zealand", price: 42.86, changePercent: -0.92, aum: "0.1B", expenseRatio: 0.50, yield: 3.2, return1y: 2.4, return3y: -3.6, return5y: -1.8, volume: "0.03M", high52w: 48.2, low52w: 38.6 },
  { symbol: "HEWJ", name: "iShares Currency Hedged Japan", price: 40.58, changePercent: 1.84, aum: "1.2B", expenseRatio: 0.50, yield: 1.5, return1y: 21.8, return3y: 12.6, return5y: 9.4, volume: "0.6M", high52w: 42.4, low52w: 30.8 },
  { symbol: "FLKR", name: "Franklin FTSE South Korea", price: 24.92, changePercent: -1.76, aum: "0.2B", expenseRatio: 0.09, yield: 1.8, return1y: 7.4, return3y: -0.8, return5y: 2.6, volume: "0.1M", high52w: 28.6, low52w: 21.4 },
  { symbol: "FLJP", name: "Franklin FTSE Japan", price: 30.14, changePercent: 1.42, aum: "1.4B", expenseRatio: 0.09, yield: 1.7, return1y: 17.2, return3y: 6.8, return5y: 5.6, volume: "0.8M", high52w: 31.8, low52w: 24.2 },
  { symbol: "IPAC", name: "iShares Core MSCI Pacific", price: 64.30, changePercent: 0.96, aum: "3.8B", expenseRatio: 0.09, yield: 2.1, return1y: 12.6, return3y: 4.2, return5y: 5.4, volume: "0.4M", high52w: 66.8, low52w: 54.1 },
  { symbol: "SMIN", name: "iShares MSCI India Small-Cap", price: 68.42, changePercent: 1.64, aum: "0.8B", expenseRatio: 0.74, yield: 0.3, return1y: 28.4, return3y: 18.6, return5y: 14.2, volume: "0.3M", high52w: 72.4, low52w: 46.8 },
  { symbol: "FLAU", name: "Franklin FTSE Australia", price: 26.84, changePercent: 0.52, aum: "0.3B", expenseRatio: 0.09, yield: 3.6, return1y: 9.2, return3y: 5.8, return5y: 6.1, volume: "0.1M", high52w: 28.2, low52w: 22.6 },
  { symbol: "JPXN", name: "iShares JPX-Nikkei 400", price: 74.56, changePercent: 1.68, aum: "0.2B", expenseRatio: 0.48, yield: 1.4, return1y: 19.4, return3y: 7.6, return5y: 6.2, volume: "0.05M", high52w: 76.8, low52w: 58.4 },
];

const EMERGING_ETFS: ETF[] = [
  { symbol: "VWO", name: "Vanguard FTSE Emerging Markets", price: 42.86, changePercent: 0.64, aum: "72.4B", expenseRatio: 0.08, yield: 2.8, return1y: 8.4, return3y: -2.1, return5y: 2.4, volume: "12.8M", high52w: 44.2, low52w: 36.8 },
  { symbol: "EEM", name: "iShares MSCI Emerging Markets", price: 43.12, changePercent: 0.72, aum: "18.6B", expenseRatio: 0.68, yield: 2.4, return1y: 9.2, return3y: -1.4, return5y: 2.8, volume: "28.4M", high52w: 45.1, low52w: 36.2 },
  { symbol: "IEMG", name: "iShares Core MSCI Emerging Mkts", price: 52.48, changePercent: 0.58, aum: "68.2B", expenseRatio: 0.09, yield: 2.6, return1y: 9.8, return3y: -0.8, return5y: 3.2, volume: "14.6M", high52w: 54.6, low52w: 44.8 },
  { symbol: "FXI", name: "iShares China Large-Cap", price: 28.64, changePercent: -1.84, aum: "5.8B", expenseRatio: 0.74, yield: 2.1, return1y: 2.4, return3y: -12.6, return5y: -6.8, volume: "32.4M", high52w: 34.2, low52w: 22.8 },
  { symbol: "MCHI", name: "iShares MSCI China", price: 48.92, changePercent: -1.42, aum: "6.4B", expenseRatio: 0.59, yield: 1.8, return1y: 4.8, return3y: -10.2, return5y: -4.6, volume: "4.8M", high52w: 56.4, low52w: 38.6 },
  { symbol: "EWZ", name: "iShares MSCI Brazil", price: 32.74, changePercent: 2.36, aum: "4.2B", expenseRatio: 0.59, yield: 5.4, return1y: 18.6, return3y: 8.4, return5y: -2.4, volume: "18.2M", high52w: 35.8, low52w: 24.6 },
  { symbol: "EWW", name: "iShares MSCI Mexico", price: 52.18, changePercent: -0.86, aum: "1.4B", expenseRatio: 0.50, yield: 2.8, return1y: 12.4, return3y: 14.2, return5y: 6.8, volume: "2.4M", high52w: 58.6, low52w: 42.1 },
  { symbol: "ECH", name: "iShares MSCI Chile", price: 28.92, changePercent: 1.14, aum: "0.4B", expenseRatio: 0.59, yield: 3.2, return1y: 15.8, return3y: 4.6, return5y: -1.2, volume: "0.3M", high52w: 30.4, low52w: 22.8 },
  { symbol: "TUR", name: "iShares MSCI Turkey", price: 42.56, changePercent: 3.84, aum: "0.3B", expenseRatio: 0.59, yield: 1.4, return1y: 38.2, return3y: 22.4, return5y: -4.8, volume: "0.8M", high52w: 44.2, low52w: 26.4 },
  { symbol: "THD", name: "iShares MSCI Thailand", price: 68.42, changePercent: -0.58, aum: "0.3B", expenseRatio: 0.59, yield: 2.6, return1y: -4.2, return3y: -8.6, return5y: -6.4, volume: "0.2M", high52w: 78.4, low52w: 62.1 },
  { symbol: "EIDO", name: "iShares MSCI Indonesia", price: 22.48, changePercent: -0.92, aum: "0.4B", expenseRatio: 0.59, yield: 2.2, return1y: -6.8, return3y: -4.2, return5y: -3.6, volume: "0.3M", high52w: 26.4, low52w: 20.1 },
  { symbol: "EPU", name: "iShares MSCI Peru", price: 38.64, changePercent: 1.48, aum: "0.1B", expenseRatio: 0.59, yield: 3.8, return1y: 22.4, return3y: 12.8, return5y: 4.2, volume: "0.04M", high52w: 40.2, low52w: 28.6 },
  { symbol: "GXG", name: "Global X MSCI Colombia", price: 25.18, changePercent: 0.84, aum: "0.06B", expenseRatio: 0.61, yield: 4.2, return1y: 14.6, return3y: 6.8, return5y: -8.4, volume: "0.02M", high52w: 28.4, low52w: 19.8 },
  { symbol: "KWEB", name: "KraneShares CSI China Internet", price: 28.42, changePercent: -2.64, aum: "5.2B", expenseRatio: 0.68, yield: null, return1y: -8.4, return3y: -22.6, return5y: -14.8, volume: "12.6M", high52w: 38.4, low52w: 22.1 },
  { symbol: "CNYA", name: "iShares MSCI China A", price: 25.84, changePercent: -0.72, aum: "0.4B", expenseRatio: 0.60, yield: 1.6, return1y: 6.2, return3y: -4.8, return5y: -2.4, volume: "0.2M", high52w: 28.6, low52w: 22.4 },
  { symbol: "EPHE", name: "iShares MSCI Philippines", price: 28.16, changePercent: 0.48, aum: "0.1B", expenseRatio: 0.59, yield: 1.4, return1y: -2.4, return3y: -6.8, return5y: -8.2, volume: "0.1M", high52w: 32.4, low52w: 24.8 },
  { symbol: "VNM", name: "VanEck Vietnam", price: 12.84, changePercent: 1.26, aum: "0.4B", expenseRatio: 0.66, yield: 0.8, return1y: 8.6, return3y: -2.4, return5y: 1.2, volume: "0.5M", high52w: 14.8, low52w: 10.2 },
  { symbol: "ARGT", name: "Global X MSCI Argentina", price: 52.86, changePercent: 4.12, aum: "0.2B", expenseRatio: 0.59, yield: 0.4, return1y: 48.6, return3y: 32.4, return5y: 12.8, volume: "0.3M", high52w: 54.8, low52w: 28.6 },
  { symbol: "PAK", name: "Global X MSCI Pakistan", price: 8.42, changePercent: 2.18, aum: "0.02B", expenseRatio: 0.68, yield: 4.8, return1y: 42.4, return3y: 8.6, return5y: -12.4, volume: "0.01M", high52w: 9.2, low52w: 4.8 },
  { symbol: "NGE", name: "Global X MSCI Nigeria", price: 9.56, changePercent: -3.24, aum: "0.03B", expenseRatio: 0.83, yield: 6.2, return1y: -18.4, return3y: -22.8, return5y: -28.6, volume: "0.01M", high52w: 14.2, low52w: 8.4 },
];

const AMERICAS_ETFS: ETF[] = [
  { symbol: "VTI", name: "Vanguard Total Stock Market", price: 264.82, changePercent: 1.84, aum: "382.4B", expenseRatio: 0.03, yield: 1.3, return1y: 24.6, return3y: 10.8, return5y: 14.2, volume: "4.2M", high52w: 268.4, low52w: 208.6 },
  { symbol: "SPY", name: "SPDR S&P 500", price: 518.64, changePercent: 1.72, aum: "526.8B", expenseRatio: 0.09, yield: 1.2, return1y: 26.8, return3y: 11.4, return5y: 14.8, volume: "68.4M", high52w: 524.6, low52w: 410.2 },
  { symbol: "IVV", name: "iShares Core S&P 500", price: 520.48, changePercent: 1.74, aum: "448.2B", expenseRatio: 0.03, yield: 1.2, return1y: 26.6, return3y: 11.2, return5y: 14.6, volume: "5.8M", high52w: 526.2, low52w: 412.4 },
  { symbol: "VOO", name: "Vanguard S&P 500", price: 476.92, changePercent: 1.76, aum: "428.6B", expenseRatio: 0.03, yield: 1.3, return1y: 26.4, return3y: 11.0, return5y: 14.4, volume: "4.6M", high52w: 482.4, low52w: 378.8 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: 438.56, changePercent: 2.14, aum: "242.8B", expenseRatio: 0.20, yield: 0.5, return1y: 32.4, return3y: 12.8, return5y: 18.6, volume: "42.6M", high52w: 445.2, low52w: 340.8 },
  { symbol: "IWM", name: "iShares Russell 2000", price: 202.84, changePercent: 1.42, aum: "62.4B", expenseRatio: 0.19, yield: 1.1, return1y: 14.6, return3y: 2.4, return5y: 8.2, volume: "24.8M", high52w: 218.6, low52w: 168.4 },
  { symbol: "DIA", name: "SPDR Dow Jones", price: 392.16, changePercent: 0.84, aum: "32.8B", expenseRatio: 0.16, yield: 1.6, return1y: 18.2, return3y: 8.6, return5y: 10.4, volume: "3.2M", high52w: 398.4, low52w: 324.6 },
  { symbol: "VIG", name: "Vanguard Dividend Appreciation", price: 182.46, changePercent: 0.68, aum: "78.4B", expenseRatio: 0.06, yield: 1.7, return1y: 16.8, return3y: 9.2, return5y: 11.4, volume: "1.8M", high52w: 186.2, low52w: 156.4 },
  { symbol: "SCHD", name: "Schwab US Dividend Equity", price: 78.24, changePercent: 0.52, aum: "52.6B", expenseRatio: 0.06, yield: 3.4, return1y: 12.8, return3y: 8.4, return5y: 10.2, volume: "6.4M", high52w: 82.4, low52w: 68.2 },
  { symbol: "VUG", name: "Vanguard Growth", price: 342.18, changePercent: 2.28, aum: "112.4B", expenseRatio: 0.04, yield: 0.5, return1y: 34.2, return3y: 12.6, return5y: 18.4, volume: "1.4M", high52w: 348.6, low52w: 262.4 },
  { symbol: "XBI", name: "SPDR S&P Biotech", price: 94.52, changePercent: -1.24, aum: "6.8B", expenseRatio: 0.35, yield: null, return1y: 8.2, return3y: -4.6, return5y: 2.8, volume: "8.4M", high52w: 108.6, low52w: 72.4 },
  { symbol: "XLE", name: "Energy Select Sector SPDR", price: 88.64, changePercent: -0.42, aum: "38.4B", expenseRatio: 0.09, yield: 3.2, return1y: 4.8, return3y: 18.4, return5y: 12.6, volume: "14.2M", high52w: 98.6, low52w: 76.4 },
  { symbol: "XLF", name: "Financial Select Sector SPDR", price: 42.18, changePercent: 1.12, aum: "36.2B", expenseRatio: 0.09, yield: 1.4, return1y: 22.4, return3y: 10.8, return5y: 12.2, volume: "32.6M", high52w: 43.8, low52w: 32.4 },
  { symbol: "XLK", name: "Technology Select Sector SPDR", price: 208.42, changePercent: 2.36, aum: "58.6B", expenseRatio: 0.09, yield: 0.6, return1y: 34.8, return3y: 14.2, return5y: 20.4, volume: "8.2M", high52w: 212.4, low52w: 158.6 },
  { symbol: "ARKK", name: "ARK Innovation", price: 48.62, changePercent: 3.84, aum: "8.4B", expenseRatio: 0.75, yield: null, return1y: 18.4, return3y: -14.8, return5y: -8.6, volume: "12.4M", high52w: 52.8, low52w: 34.2 },
  { symbol: "EWC", name: "iShares MSCI Canada", price: 38.84, changePercent: 0.62, aum: "3.4B", expenseRatio: 0.50, yield: 2.1, return1y: 10.4, return3y: 6.8, return5y: 8.2, volume: "2.6M", high52w: 40.2, low52w: 32.6 },
  { symbol: "VTV", name: "Vanguard Value", price: 162.84, changePercent: 0.48, aum: "108.2B", expenseRatio: 0.04, yield: 2.2, return1y: 14.6, return3y: 9.8, return5y: 10.8, volume: "2.4M", high52w: 168.4, low52w: 138.6 },
  { symbol: "SOXX", name: "iShares Semiconductor", price: 224.68, changePercent: 3.42, aum: "12.4B", expenseRatio: 0.35, yield: 0.6, return1y: 42.6, return3y: 18.4, return5y: 28.2, volume: "4.8M", high52w: 232.4, low52w: 148.6 },
  { symbol: "XLV", name: "Health Care Select Sector SPDR", price: 142.38, changePercent: 0.34, aum: "38.6B", expenseRatio: 0.09, yield: 1.4, return1y: 8.6, return3y: 6.2, return5y: 9.4, volume: "8.6M", high52w: 148.2, low52w: 126.4 },
  { symbol: "IJR", name: "iShares Core S&P Small-Cap", price: 108.24, changePercent: 1.56, aum: "72.4B", expenseRatio: 0.06, yield: 1.2, return1y: 12.4, return3y: 4.8, return5y: 9.6, volume: "4.2M", high52w: 114.8, low52w: 92.6 },
];

const MIDDLE_EAST_ETFS: ETF[] = [
  { symbol: "KSA", name: "iShares MSCI Saudi Arabia", price: 42.86, changePercent: 0.72, aum: "1.2B", expenseRatio: 0.74, yield: 2.4, return1y: 6.8, return3y: 4.2, return5y: 8.6, volume: "0.4M", high52w: 46.2, low52w: 36.4 },
  { symbol: "UAE", name: "iShares MSCI UAE", price: 14.28, changePercent: 1.14, aum: "0.04B", expenseRatio: 0.59, yield: 2.8, return1y: 12.4, return3y: 8.6, return5y: 4.2, volume: "0.02M", high52w: 15.6, low52w: 11.2 },
  { symbol: "QAT", name: "iShares MSCI Qatar", price: 16.42, changePercent: -0.84, aum: "0.05B", expenseRatio: 0.59, yield: 3.6, return1y: -4.2, return3y: -8.6, return5y: -6.4, volume: "0.01M", high52w: 19.8, low52w: 14.6 },
  { symbol: "GULF", name: "WisdomTree Middle East Dividend", price: 24.86, changePercent: 0.52, aum: "0.03B", expenseRatio: 0.88, yield: 3.2, return1y: 8.4, return3y: 6.2, return5y: 5.8, volume: "0.01M", high52w: 26.4, low52w: 20.8 },
  { symbol: "EIS", name: "iShares MSCI Israel", price: 68.42, changePercent: -1.62, aum: "0.2B", expenseRatio: 0.59, yield: 1.2, return1y: 14.8, return3y: 4.6, return5y: 8.4, volume: "0.1M", high52w: 74.6, low52w: 52.4 },
  { symbol: "FLSA", name: "Franklin FTSE Saudi Arabia", price: 32.18, changePercent: 0.84, aum: "0.1B", expenseRatio: 0.39, yield: 2.6, return1y: 7.2, return3y: 4.8, return5y: 9.2, volume: "0.05M", high52w: 34.8, low52w: 26.4 },
  { symbol: "ISRA", name: "VanEck Israel", price: 38.56, changePercent: -1.28, aum: "0.06B", expenseRatio: 0.59, yield: 0.8, return1y: 16.4, return3y: 6.2, return5y: 10.8, volume: "0.02M", high52w: 42.4, low52w: 28.6 },
  { symbol: "FMQQ", name: "FMQQ Next Frontier Internet", price: 18.24, changePercent: 2.48, aum: "0.02B", expenseRatio: 0.86, yield: null, return1y: 24.6, return3y: -4.8, return5y: -2.4, volume: "0.01M", high52w: 22.4, low52w: 12.8 },
  { symbol: "KSAI", name: "KraneShares Saudi Arabia", price: 28.64, changePercent: 0.38, aum: "0.01B", expenseRatio: 0.69, yield: 2.2, return1y: 5.8, return3y: 3.4, return5y: 7.6, volume: "0.005M", high52w: 30.8, low52w: 24.2 },
  { symbol: "KWAT", name: "KraneShares MSCI Kuwait", price: 22.14, changePercent: -0.42, aum: "0.01B", expenseRatio: 0.79, yield: 3.4, return1y: 2.4, return3y: 1.8, return5y: 4.2, volume: "0.003M", high52w: 24.6, low52w: 18.8 },
  { symbol: "EMQQ", name: "EMQQ Emerging Mkts Internet", price: 32.48, changePercent: -1.14, aum: "0.4B", expenseRatio: 0.86, yield: null, return1y: 4.2, return3y: -14.6, return5y: -8.4, volume: "0.2M", high52w: 38.6, low52w: 24.8 },
  { symbol: "MES", name: "WisdomTree Middle East ex-SA", price: 18.72, changePercent: 0.64, aum: "0.005B", expenseRatio: 0.92, yield: 2.8, return1y: 10.2, return3y: 5.4, return5y: 3.6, volume: "0.002M", high52w: 20.4, low52w: 15.2 },
  { symbol: "EGAL", name: "Tidal ETF Eagle Point", price: 26.84, changePercent: 1.42, aum: "0.03B", expenseRatio: 0.75, yield: 6.8, return1y: 18.4, return3y: 12.2, return5y: 8.6, volume: "0.01M", high52w: 28.2, low52w: 22.4 },
  { symbol: "AMDS", name: "GX MSCI Abu Dhabi Select", price: 16.48, changePercent: 0.92, aum: "0.008B", expenseRatio: 0.65, yield: 3.1, return1y: 8.6, return3y: 6.4, return5y: 5.2, volume: "0.002M", high52w: 18.2, low52w: 13.6 },
  { symbol: "OMAF", name: "Invest Oman Fund", price: 12.36, changePercent: -0.68, aum: "0.003B", expenseRatio: 0.95, yield: 4.2, return1y: 4.8, return3y: 2.6, return5y: 1.8, volume: "0.001M", high52w: 14.8, low52w: 10.2 },
  { symbol: "BHRN", name: "Invest Bahrain Fund", price: 14.82, changePercent: 0.28, aum: "0.002B", expenseRatio: 0.98, yield: 3.8, return1y: 6.2, return3y: 3.8, return5y: 2.4, volume: "0.001M", high52w: 16.4, low52w: 12.8 },
  { symbol: "JRDN", name: "iPath Jordan Index", price: 8.64, changePercent: 1.56, aum: "0.001B", expenseRatio: 0.89, yield: 2.4, return1y: 12.8, return3y: 4.2, return5y: -1.6, volume: "0.001M", high52w: 9.8, low52w: 6.4 },
  { symbol: "LBNN", name: "iPath Lebanon Index", price: 2.84, changePercent: -4.82, aum: "0.001B", expenseRatio: 0.95, yield: null, return1y: -42.6, return3y: -58.4, return5y: -72.8, volume: "0.001M", high52w: 6.8, low52w: 2.2 },
  { symbol: "EGYP", name: "VanEck Egypt", price: 18.42, changePercent: 2.86, aum: "0.02B", expenseRatio: 0.68, yield: 2.8, return1y: 28.4, return3y: -2.4, return5y: -8.6, volume: "0.01M", high52w: 20.4, low52w: 12.6 },
  { symbol: "IRQF", name: "AFC Iraq Fund", price: 6.48, changePercent: 0.94, aum: "0.004B", expenseRatio: 1.20, yield: 1.6, return1y: 14.2, return3y: 8.6, return5y: 2.4, volume: "0.001M", high52w: 7.8, low52w: 4.6 },
];

const DATA_BY_REGION: Record<Region, ETF[]> = {
  Europe: EUROPE_ETFS,
  "Asia Pacific": ASIA_PACIFIC_ETFS,
  Emerging: EMERGING_ETFS,
  Americas: AMERICAS_ETFS,
  "Middle East": MIDDLE_EAST_ETFS,
};

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

interface Column {
  header: string;
  align: "left" | "center" | "right";
  minWidth?: number;
  sortKey?: SortKey;
}

const COLUMNS: Column[] = [
  { header: "ETF", align: "left" },
  { header: "Price", align: "right", sortKey: "changePercent" },
  { header: "1Y", align: "right", minWidth: 68, sortKey: "return1y" },
  { header: "3Y", align: "right", minWidth: 68, sortKey: "return3y" },
  { header: "5Y", align: "right", minWidth: 68, sortKey: "return5y" },
  { header: "AUM", align: "right", minWidth: 72, sortKey: "aum" },
  { header: "Exp%", align: "right", minWidth: 58, sortKey: "expenseRatio" },
  { header: "Yield", align: "right", minWidth: 58 },
  { header: "1Y Range", align: "center", minWidth: 110 },
  { header: "Volume", align: "right", minWidth: 72, sortKey: "volume" },
  { header: "Watchlist", align: "center", minWidth: 80 },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AllEtfsPage() {
  const router = useRouter();
  const [activeRegion, setActiveRegion] = useState<Region>("Europe");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  /* Sort state */
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_SORT.key);
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_SORT.dir);
  const [sortOpen, setSortOpen] = useState(false);

  /* Header click: switch sort key (default desc), or flip direction if already active */
  const handleHeaderSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
    } else {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    }
  };

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym);
      else n.add(sym);
      return n;
    });

  const sorted = useMemo(
    () => applySort(DATA_BY_REGION[activeRegion], sortKey, sortDir),
    [activeRegion, sortKey, sortDir],
  );

  const frozenCol = COLUMNS[0];
  const scrollCols = COLUMNS.slice(1);

  const alignCls = (align?: "left" | "center" | "right") =>
    align === "left"
      ? "text-left"
      : align === "center"
        ? "text-center"
        : "text-right";

  /* ── Frozen column width measurement ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [frozenW, setFrozenW] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  /* Collapsing header on vertical scroll */
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const handleMainScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setHeaderCollapsed(e.currentTarget.scrollTop > 40);
  }, []);

  const VISIBLE_DATA_COLS = 2;
  const MIN_FROZEN_W = 120;
  const SCROLLABLE_MIN_W = 500;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrolled(el.scrollLeft > 0);
  }, []);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const table = tableRef.current;
    if (!container || !table) return;

    const ths = table.querySelectorAll("thead th");
    if (ths.length < VISIBLE_DATA_COLS) return;

    let visibleSum = 0;
    for (let i = 0; i < VISIBLE_DATA_COLS; i++) {
      visibleSum += ths[i].getBoundingClientRect().width;
    }

    const containerW = container.getBoundingClientRect().width;
    setFrozenW(Math.max(MIN_FROZEN_W, containerW - visibleSum));
  }, []);

  useEffect(() => {
    measure();
  }, [measure, sorted]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Grey header section — expands on top, collapses on scroll */}
      <div className="shrink-0 bg-muted/50 border-b border-border/50">
        {/* Top bar */}
        <header className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <motion.h1
            initial={false}
            animate={{ opacity: headerCollapsed ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 text-[17px] font-bold tracking-tight text-foreground ml-1"
          >
            Global ETFs
          </motion.h1>
          <div className="h-10 w-10" />
        </header>

        {/* Expanded title + description — collapses on scroll */}
        <motion.div
          initial={false}
          animate={{
            maxHeight: headerCollapsed ? 0 : 160,
            opacity: headerCollapsed ? 0 : 1,
          }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden"
        >
          <div className="px-5 pt-1 pb-4">
            <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight">
              Global ETFs
            </h1>
            <p className="mt-1.5 text-[14px] leading-snug text-muted-foreground">
              ETFs across every major region — one list.
              <br />
              Find where the world is putting money.
            </p>
          </div>
        </motion.div>

        {/* Sticky region tabs */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5">
            {REGIONS.map((region, i) => {
              const active = region === activeRegion;
              const count = DATA_BY_REGION[region].length;
              return (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={cn(
                    "relative whitespace-nowrap pt-2 pb-3 text-[14px] font-semibold transition-colors flex items-center gap-1.5",
                    i === 0 ? "pr-3" : "px-3",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span>{region}</span>
                  <span
                    className={cn(
                      "inline-flex min-w-[20px] justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "bg-muted-foreground/15 text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="all-etf-tab-underline"
                      className={cn(
                        "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                        i === 0 ? "left-0" : "left-3",
                      )}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable table */}
      <main
        className="no-scrollbar flex-1 overflow-y-auto"
        onScroll={handleMainScroll}
      >
        <div ref={containerRef} className="pt-2 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRegion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              {/* Frozen first column — ETF name */}
              <div
                className={cn(
                  "shrink-0 border-r transition-colors duration-200",
                  isScrolled ? "border-border/40" : "border-transparent",
                )}
                style={{ width: frozenW ?? MIN_FROZEN_W }}
              >
                <div
                  className={cn(
                    "h-[40px] flex items-center pl-5 pr-3 text-[14px] font-medium text-muted-foreground",
                    alignCls(frozenCol.align),
                  )}
                >
                  {frozenCol.header}
                </div>
                {sorted.map((etf) => (
                  <div
                    key={etf.symbol}
                    className="h-[80px] flex items-center pl-5 pr-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
                      <p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">
                        {etf.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scrollable columns */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-x-auto no-scrollbar min-w-0"
              >
                <table ref={tableRef} style={{ minWidth: SCROLLABLE_MIN_W }}>
                  <thead>
                    <tr className="h-[40px]">
                      {scrollCols.map((col, i) => {
                        const sortable = !!col.sortKey;
                        const active = sortable && sortKey === col.sortKey;
                        return (
                          <th
                            key={i}
                            className={cn(
                              "text-[14px] font-medium text-muted-foreground whitespace-nowrap px-3",
                              alignCls(col.align),
                            )}
                            style={
                              col.minWidth ? { minWidth: col.minWidth } : undefined
                            }
                          >
                            {sortable ? (
                              <button
                                onClick={() =>
                                  handleHeaderSort(col.sortKey as SortKey)
                                }
                                className={cn(
                                  "inline-flex items-center gap-1 transition-colors",
                                  active
                                    ? "text-foreground"
                                    : "hover:text-foreground",
                                )}
                              >
                                {active &&
                                  (sortDir === "desc" ? (
                                    <ArrowDown size={12} strokeWidth={2.5} />
                                  ) : (
                                    <ArrowUp size={12} strokeWidth={2.5} />
                                  ))}
                                <span>{col.header}</span>
                              </button>
                            ) : (
                              col.header
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((etf) => {
                      const chgColor =
                        etf.changePercent >= 0 ? "text-gain" : "text-loss";
                      return (
                        <tr key={etf.symbol} className="h-[80px]">
                          {/* Price + Chg% stacked */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <div className="flex flex-col items-end">
                              <span className="whitespace-nowrap tabular-nums text-[14px] text-foreground">
                                {etf.price.toFixed(1)}
                              </span>
                              <span
                                className={cn(
                                  "whitespace-nowrap tabular-nums text-[12px] font-semibold",
                                  chgColor,
                                )}
                              >
                                {etf.changePercent >= 0 ? "+" : ""}
                                {etf.changePercent.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          {/* 1Y Return */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span
                              className={cn(
                                "tabular-nums text-[14px] font-semibold",
                                etf.return1y >= 0 ? "text-gain" : "text-loss",
                              )}
                            >
                              {etf.return1y >= 0 ? "+" : ""}
                              {etf.return1y.toFixed(1)}%
                            </span>
                          </td>
                          {/* 3Y Return */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span
                              className={cn(
                                "tabular-nums text-[14px] font-medium",
                                etf.return3y >= 0 ? "text-gain" : "text-loss",
                              )}
                            >
                              {etf.return3y >= 0 ? "+" : ""}
                              {etf.return3y.toFixed(1)}%
                            </span>
                          </td>
                          {/* 5Y Return */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span
                              className={cn(
                                "tabular-nums text-[14px] font-medium",
                                etf.return5y >= 0 ? "text-gain" : "text-loss",
                              )}
                            >
                              {etf.return5y >= 0 ? "+" : ""}
                              {etf.return5y.toFixed(1)}%
                            </span>
                          </td>
                          {/* AUM */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className="tabular-nums text-[14px] text-muted-foreground">
                              {etf.aum}
                            </span>
                          </td>
                          {/* Exp% */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className="tabular-nums text-[14px] text-muted-foreground">
                              {etf.expenseRatio.toFixed(2)}%
                            </span>
                          </td>
                          {/* Yield */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className="tabular-nums text-[14px] text-muted-foreground">
                              {etf.yield != null
                                ? `${etf.yield.toFixed(2)}%`
                                : "\u2014"}
                            </span>
                          </td>
                          {/* 1Y Range */}
                          <td className="px-3 whitespace-nowrap text-center">
                            <RangeBar
                              low={etf.low52w}
                              high={etf.high52w}
                              current={etf.price}
                            />
                          </td>
                          {/* Volume */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className="tabular-nums text-[14px] text-muted-foreground">
                              {etf.volume}
                            </span>
                          </td>
                          {/* Watchlist */}
                          <td className="px-3 whitespace-nowrap text-center">
                            <div className="flex justify-center">
                              <button
                                onClick={() => toggleBookmark(etf.symbol)}
                                className="transition-transform active:scale-90"
                              >
                                <Bookmark
                                  size={20}
                                  strokeWidth={1.8}
                                  className={cn(
                                    "transition-colors",
                                    bookmarks.has(etf.symbol)
                                      ? "fill-foreground text-foreground"
                                      : "text-muted-foreground/50",
                                  )}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Sort FAB */}
      <button
        onClick={() => setSortOpen(true)}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 h-11 pl-4 pr-5 rounded-full flex items-center gap-2 text-[14px] font-semibold bg-foreground text-background shadow-lg shadow-foreground/20 active:scale-[0.97] transition-transform"
      >
        <ArrowUpDown size={15} strokeWidth={2.5} />
        <span>Sort</span>
      </button>

      <HomeIndicator />

      {/* Sort sheet */}
      <SortSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        sortKey={sortKey}
        sortDir={sortDir}
        onChange={(k, d) => {
          setSortKey(k);
          setSortDir(d);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sort sheet                                                         */
/* ------------------------------------------------------------------ */

function SortSheet({
  open,
  onOpenChange,
  sortKey,
  sortDir,
  onChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onChange: (k: SortKey, d: SortDir) => void;
}) {
  const [draftKey, setDraftKey] = useState<SortKey>(sortKey);
  const [draftDir, setDraftDir] = useState<SortDir>(sortDir);

  const selectKey = (k: SortKey) => {
    if (k !== draftKey) {
      setDraftKey(k);
      setDraftDir("desc");
    }
  };

  const toggleDir = () =>
    setDraftDir((d) => (d === "desc" ? "asc" : "desc"));

  const reset = () => {
    setDraftKey(DEFAULT_SORT.key);
    setDraftDir(DEFAULT_SORT.dir);
  };

  const apply = () => {
    onChange(draftKey, draftDir);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) {
          setDraftKey(sortKey);
          setDraftDir(sortDir);
        }
      }}
    >
      <SheetContent
        hideClose
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-[28px] p-0 border-0 max-h-[85vh] flex flex-col"
      >
        {/* Header row: title + Reset */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <SheetTitle className="text-[20px] font-bold tracking-tight">
            Sort By
          </SheetTitle>
          <button
            onClick={reset}
            className="text-[15px] font-semibold text-foreground active:opacity-60 transition-opacity"
          >
            Reset
          </button>
        </div>

        {/* Options list with row separators */}
        <div className="flex-1 overflow-y-auto px-5">
          {SORT_OPTIONS.map(({ key, label }, idx) => {
            const selected = draftKey === key;
            return (
              <div key={key}>
                <div className="flex items-center justify-between py-4 min-h-[56px]">
                  <button
                    onClick={() => selectKey(key)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 transition-colors",
                        selected
                          ? "border-foreground"
                          : "border-muted-foreground/40",
                      )}
                    >
                      {selected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[16px] transition-colors",
                        selected
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </button>
                  {selected && (
                    <button
                      onClick={toggleDir}
                      className="flex items-center gap-1.5 text-foreground text-[15px] font-semibold active:opacity-60 transition-opacity"
                    >
                      <span>
                        {draftDir === "asc" ? "Low to High" : "High to Low"}
                      </span>
                      {draftDir === "asc" ? (
                        <ArrowUp size={16} strokeWidth={2.5} />
                      ) : (
                        <ArrowDown size={16} strokeWidth={2.5} />
                      )}
                    </button>
                  )}
                </div>
                {idx < SORT_OPTIONS.length - 1 && (
                  <div className="h-px bg-border/60" />
                )}
              </div>
            );
          })}
        </div>

        {/* Apply button */}
        <div className="shrink-0 px-5 pt-3 pb-5">
          <button
            onClick={apply}
            className="w-full h-14 rounded-2xl bg-foreground text-background text-[16px] font-semibold active:scale-[0.98] transition-transform"
          >
            Apply
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
