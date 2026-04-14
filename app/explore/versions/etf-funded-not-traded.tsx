"use client";

import { useState, useMemo } from "react";
import { useTheme } from "@/components/theme-provider";
import {
  Bookmark,
  Coins,
  Layers,
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
  Maximize2,
  Play,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollableTableWidget } from "@/components/scrollable-table-widget";
import { ETFCardLadder, type ETFCardData } from "@/components/etf-card-variants";
import { motion, AnimatePresence } from "framer-motion";
import { StoriesViewer, type Story } from "@/components/stories-viewer";

/* ------------------------------------------------------------------ */
/*  Adapter: PopularETF → ETFCardData (deterministic mock fields)      */
/* ------------------------------------------------------------------ */

function popularETFToCardData(etf: PopularETF): ETFCardData {
  const h = hashStr(etf.symbol);
  const price = 50 + (h % 450) + ((h % 100) / 100); // 50.00 .. 500.99
  const change1d = ((h % 600) - 300) / 100; // -3.00 .. +3.00
  const return1y = etf.return3y + ((h % 800) - 400) / 100; // ±4 from 3Y
  const return5y = etf.return3y + (((h >> 4) % 400) - 200) / 100; // ±2 from 3Y
  return {
    name: etf.name,
    symbol: etf.symbol,
    price,
    change1d,
    return1y,
    return3y: etf.return3y,
    return5y,
    expenseRatio: etf.expenseRatio,
    trackingError: etf.trackingError,
    aum: etf.aum,
  };
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type EtfCategory = "broad" | "sector" | "bond";
export type MoverType = "gainers" | "losers" | "most-active" | "near-52w-high" | "near-52w-low";

export interface ETF {
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
  return1y?: number;
  return3y?: number;
  return5y?: number;
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
  const startV = 30 + (seed % 40);
  const vol = 3 + (seed % 7);
  const drift = isGainer ? 0.08 + (seed % 5) * 0.04 : -(0.08 + (seed % 5) * 0.04);
  let v = startV;
  for (let i = 0; i < 52; i++) {
    const r1 = (Math.sin(seed + i * 127) + 1) / 2;
    const r2 = (Math.cos(seed * 3 + i * 53) + 1) / 2;
    v += ((r1 + r2) / 2 - 0.5 + drift) * vol;
    v = Math.max(5, Math.min(95, v));
    pts.push(v);
  }
  return pts;
}

// Mock returns based on symbol hash
function mockReturns(symbol: string): { r1y: number; r3y: number; r5y: number } {
  const seed = hashStr(symbol);
  return {
    r1y: Math.round(((seed % 40) - 10) * 10) / 10,
    r3y: Math.round(((seed % 30) - 5) * 10) / 10,
    r5y: Math.round(((seed % 35) - 2) * 10) / 10,
  };
}

/* ------------------------------------------------------------------ */
/*  Sparkline SVG                                                      */
/* ------------------------------------------------------------------ */

function Sparkline({
  points,
  color,
  w = 52,
  h = 22,
  autoColor = false,
}: {
  points: number[];
  color?: string;
  w?: number;
  h?: number;
  autoColor?: boolean;
}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const startVal = points[0];
  const endVal = points[points.length - 1];
  const isUp = endVal >= startVal;
  const lineColor = autoColor ? (isUp ? "#10b981" : "#ef4444") : (color ?? "#6366f1");

  const baselineY = h - ((startVal - min) / range) * (h - 2) - 1;

  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <line
        x1={0} y1={baselineY} x2={w} y2={baselineY}
        stroke="currentColor"
        className="text-muted-foreground/20"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <path
        d={d}
        fill="none"
        stroke={lineColor}
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
      <div className="flex justify-between tabular-nums text-[10px] tabular-nums text-muted-foreground">
        <span>{low < 10 ? low.toFixed(1) : low.toFixed(0)}</span>
        <span>{high < 10 ? high.toFixed(1) : high.toFixed(0)}</span>
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
  "most-active": {
    broad: [
      { symbol: "SPY", name: "SPDR S&P 500", price: 478.52, changePercent: 0.82, volume: "112M", aum: "$518B", expenseRatio: 0.09, yield: 1.28, high52w: 485.0, low52w: 388.4, color: "#0033CC" },
      { symbol: "QQQ", name: "Invesco QQQ Trust", price: 442.18, changePercent: 1.24, volume: "52M", aum: "$252B", expenseRatio: 0.20, yield: 0.52, high52w: 460.0, low52w: 352.8, color: "#00CC66" },
      { symbol: "IWM", name: "iShares Russell 2000", price: 198.45, changePercent: -0.68, volume: "38M", aum: "$72B", expenseRatio: 0.19, yield: 1.12, high52w: 215.0, low52w: 168.2, color: "#333333" },
      { symbol: "EEM", name: "iShares MSCI EM", price: 40.23, changePercent: -2.34, volume: "42M", aum: "$18B", expenseRatio: 0.68, yield: 2.45, high52w: 44.8, low52w: 36.2, color: "#333333" },
      { symbol: "VOO", name: "Vanguard S&P 500", price: 438.92, changePercent: 0.78, volume: "8.4M", aum: "$892B", expenseRatio: 0.03, yield: 1.32, high52w: 445.0, low52w: 362.5, color: "#8B1A1A" },
    ],
    sector: [
      { symbol: "XLF", name: "Financial Select SPDR", price: 42.18, changePercent: 1.42, volume: "48M", aum: "$42B", expenseRatio: 0.09, yield: 1.52, high52w: 44.8, low52w: 32.4, color: "#003366" },
      { symbol: "XLE", name: "Energy Select SPDR", price: 88.45, changePercent: -1.82, volume: "22M", aum: "$38B", expenseRatio: 0.09, yield: 3.28, high52w: 98.2, low52w: 72.4, color: "#CC6600" },
      { symbol: "XLK", name: "Technology SPDR", price: 208.34, changePercent: 1.56, volume: "12M", aum: "$62B", expenseRatio: 0.09, yield: 0.68, high52w: 218.0, low52w: 168.4, color: "#6633CC" },
      { symbol: "XLV", name: "Health Care SPDR", price: 142.56, changePercent: 0.42, volume: "8.2M", aum: "$42B", expenseRatio: 0.09, yield: 1.42, high52w: 148.0, low52w: 122.4, color: "#009933" },
      { symbol: "XLI", name: "Industrial SPDR", price: 118.67, changePercent: -1.28, volume: "14M", aum: "$19B", expenseRatio: 0.09, yield: 1.45, high52w: 128.0, low52w: 98.4, color: "#4169E1" },
    ],
    bond: [
      { symbol: "TLT", name: "iShares 20+ Yr Trsy", price: 92.84, changePercent: 0.82, volume: "24M", aum: "$52B", expenseRatio: 0.15, yield: 4.12, high52w: 102.3, low52w: 82.4, color: "#1A5276" },
      { symbol: "HYG", name: "iShares High Yield", price: 78.23, changePercent: 0.56, volume: "15M", aum: "$18B", expenseRatio: 0.49, yield: 5.82, high52w: 80.1, low52w: 72.4, color: "#333333" },
      { symbol: "LQD", name: "iShares IG Corp", price: 108.67, changePercent: 0.42, volume: "12M", aum: "$35B", expenseRatio: 0.14, yield: 4.45, high52w: 114.0, low52w: 100.8, color: "#333333" },
      { symbol: "AGG", name: "iShares Core US Agg", price: 98.12, changePercent: 0.28, volume: "6.7M", aum: "$98B", expenseRatio: 0.03, yield: 3.72, high52w: 101.5, low52w: 93.2, color: "#333333" },
      { symbol: "BND", name: "Vanguard Total Bond", price: 72.45, changePercent: 0.34, volume: "8.2M", aum: "$108B", expenseRatio: 0.03, yield: 3.85, high52w: 75.2, low52w: 68.1, color: "#8B1A1A" },
    ],
  },
  "near-52w-high": {
    broad: [
      { symbol: "VOO", name: "Vanguard S&P 500", price: 438.92, changePercent: 0.78, volume: "8.4M", aum: "$892B", expenseRatio: 0.03, yield: 1.32, high52w: 445.0, low52w: 362.5, color: "#8B1A1A" },
      { symbol: "QQQ", name: "Invesco QQQ Trust", price: 442.18, changePercent: 1.24, volume: "52M", aum: "$252B", expenseRatio: 0.20, yield: 0.52, high52w: 460.0, low52w: 352.8, color: "#00CC66" },
      { symbol: "SPY", name: "SPDR S&P 500", price: 478.52, changePercent: 0.82, volume: "112M", aum: "$518B", expenseRatio: 0.09, yield: 1.28, high52w: 485.0, low52w: 388.4, color: "#0033CC" },
      { symbol: "VTI", name: "Vanguard Total Stock", price: 248.34, changePercent: 0.62, volume: "4.2M", aum: "$384B", expenseRatio: 0.03, yield: 1.24, high52w: 252.0, low52w: 198.4, color: "#8B1A1A" },
      { symbol: "IVV", name: "iShares Core S&P 500", price: 480.12, changePercent: 0.84, volume: "5.8M", aum: "$478B", expenseRatio: 0.03, yield: 1.30, high52w: 486.0, low52w: 390.2, color: "#333333" },
    ],
    sector: [
      { symbol: "XLK", name: "Technology SPDR", price: 208.34, changePercent: 1.56, volume: "12M", aum: "$62B", expenseRatio: 0.09, yield: 0.68, high52w: 218.0, low52w: 168.4, color: "#6633CC" },
      { symbol: "XLF", name: "Financial Select SPDR", price: 42.18, changePercent: 1.42, volume: "48M", aum: "$42B", expenseRatio: 0.09, yield: 1.52, high52w: 44.8, low52w: 32.4, color: "#003366" },
      { symbol: "XLI", name: "Industrial SPDR", price: 118.67, changePercent: 0.92, volume: "14M", aum: "$19B", expenseRatio: 0.09, yield: 1.45, high52w: 128.0, low52w: 98.4, color: "#4169E1" },
      { symbol: "XLV", name: "Health Care SPDR", price: 142.56, changePercent: 0.42, volume: "8.2M", aum: "$42B", expenseRatio: 0.09, yield: 1.42, high52w: 148.0, low52w: 122.4, color: "#009933" },
      { symbol: "XLC", name: "Comm Svcs SPDR", price: 82.34, changePercent: 0.86, volume: "6.8M", aum: "$18B", expenseRatio: 0.09, yield: 0.78, high52w: 92.1, low52w: 68.4, color: "#9400D3" },
    ],
    bond: [
      { symbol: "SHY", name: "iShares 1-3 Yr Trsy", price: 81.45, changePercent: 0.12, volume: "4.2M", aum: "$28B", expenseRatio: 0.15, yield: 4.52, high52w: 82.8, low52w: 79.2, color: "#333333" },
      { symbol: "BND", name: "Vanguard Total Bond", price: 72.45, changePercent: 0.34, volume: "8.2M", aum: "$108B", expenseRatio: 0.03, yield: 3.85, high52w: 75.2, low52w: 68.1, color: "#8B1A1A" },
      { symbol: "AGG", name: "iShares Core US Agg", price: 98.12, changePercent: 0.28, volume: "6.7M", aum: "$98B", expenseRatio: 0.03, yield: 3.72, high52w: 101.5, low52w: 93.2, color: "#333333" },
      { symbol: "TIPS", name: "iShares TIPS Bond", price: 108.23, changePercent: 0.18, volume: "2.8M", aum: "$22B", expenseRatio: 0.19, yield: 3.65, high52w: 112.0, low52w: 102.4, color: "#333333" },
      { symbol: "LQD", name: "iShares IG Corp", price: 108.67, changePercent: 0.42, volume: "12M", aum: "$35B", expenseRatio: 0.14, yield: 4.45, high52w: 114.0, low52w: 100.8, color: "#333333" },
    ],
  },
  "near-52w-low": {
    broad: [
      { symbol: "EEM", name: "iShares MSCI EM", price: 40.23, changePercent: -2.34, volume: "42M", aum: "$18B", expenseRatio: 0.68, yield: 2.45, high52w: 44.8, low52w: 36.2, color: "#333333" },
      { symbol: "EFA", name: "iShares MSCI EAFE", price: 78.56, changePercent: -1.87, volume: "18M", aum: "$52B", expenseRatio: 0.32, yield: 2.82, high52w: 84.2, low52w: 68.5, color: "#333333" },
      { symbol: "VWO", name: "Vanguard FTSE EM", price: 42.18, changePercent: -2.15, volume: "12M", aum: "$82B", expenseRatio: 0.08, yield: 3.12, high52w: 46.5, low52w: 37.8, color: "#8B1A1A" },
      { symbol: "VXUS", name: "Vanguard Total Intl", price: 58.34, changePercent: -1.42, volume: "4.2M", aum: "$65B", expenseRatio: 0.07, yield: 2.95, high52w: 62.8, low52w: 52.1, color: "#8B1A1A" },
      { symbol: "IWM", name: "iShares Russell 2000", price: 198.45, changePercent: -0.68, volume: "38M", aum: "$72B", expenseRatio: 0.19, yield: 1.12, high52w: 215.0, low52w: 168.2, color: "#333333" },
    ],
    sector: [
      { symbol: "XLRE", name: "Real Estate SPDR", price: 38.72, changePercent: -3.24, volume: "8.2M", aum: "$6.8B", expenseRatio: 0.09, yield: 3.45, high52w: 44.2, low52w: 34.8, color: "#8B4513" },
      { symbol: "XLU", name: "Utilities Select SPDR", price: 68.45, changePercent: -2.18, volume: "12M", aum: "$18B", expenseRatio: 0.09, yield: 2.92, high52w: 74.5, low52w: 58.2, color: "#008080" },
      { symbol: "XLE", name: "Energy Select SPDR", price: 88.45, changePercent: -1.82, volume: "22M", aum: "$38B", expenseRatio: 0.09, yield: 3.28, high52w: 98.2, low52w: 72.4, color: "#CC6600" },
      { symbol: "XLP", name: "Consumer Stpl SPDR", price: 78.23, changePercent: -1.56, volume: "9.8M", aum: "$20B", expenseRatio: 0.09, yield: 2.42, high52w: 82.4, low52w: 68.5, color: "#228B22" },
      { symbol: "XLC", name: "Comm Svcs SPDR", price: 82.34, changePercent: -2.72, volume: "6.8M", aum: "$18B", expenseRatio: 0.09, yield: 0.78, high52w: 92.1, low52w: 68.4, color: "#9400D3" },
    ],
    bond: [
      { symbol: "JNK", name: "SPDR High Yield", price: 94.56, changePercent: -0.78, volume: "8.4M", aum: "$8.2B", expenseRatio: 0.40, yield: 5.45, high52w: 98.2, low52w: 88.4, color: "#8B0000" },
      { symbol: "EMB", name: "iShares EM Bond", price: 86.34, changePercent: -1.24, volume: "5.2M", aum: "$14B", expenseRatio: 0.39, yield: 5.12, high52w: 92.4, low52w: 78.6, color: "#333333" },
      { symbol: "BNDX", name: "Vanguard Intl Bond", price: 48.72, changePercent: -0.62, volume: "3.8M", aum: "$48B", expenseRatio: 0.07, yield: 3.28, high52w: 51.2, low52w: 45.8, color: "#8B1A1A" },
      { symbol: "TLT", name: "iShares 20+ Yr Trsy", price: 92.84, changePercent: -0.42, volume: "24M", aum: "$52B", expenseRatio: 0.15, yield: 4.12, high52w: 102.3, low52w: 82.4, color: "#1A5276" },
      { symbol: "HYG", name: "iShares High Yield", price: 78.23, changePercent: -0.56, volume: "15M", aum: "$18B", expenseRatio: 0.49, yield: 5.82, high52w: 80.1, low52w: 72.4, color: "#333333" },
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

const moverTabs = [
  { id: "gainers" as MoverType, label: "Gainers" },
  { id: "losers" as MoverType, label: "Losers" },
  { id: "most-active" as MoverType, label: "Most Active" },
  { id: "near-52w-high" as MoverType, label: "Near 52W High" },
  { id: "near-52w-low" as MoverType, label: "Near 52W Low" },
];

interface TopMoversWidgetProps {
  title?: string;
  description?: string;
  moverData?: Record<MoverType, Record<EtfCategory, ETF[]>>;
  hideCategoryFlipper?: boolean;
}

export function TopMoversWidget({
  title = "Top Movers",
  description = "Today's biggest ETF moves, by category. A quick read on which corners of the market are leading and which are lagging.",
  moverData = data,
  hideCategoryFlipper = false,
}: TopMoversWidgetProps = {}) {
  const [moverType, setMoverType] = useState<MoverType>("gainers");
  const [category, setCategory] = useState<EtfCategory>("broad");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const etfs = moverData[moverType][category];
  const isGainer = moverType === "gainers";

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
      if (n.has(sym)) n.delete(sym); else n.add(sym);
      return n;
    });

  const cycleCategory = () =>
    setCategory((p) => catOrder[(catOrder.indexOf(p) + 1) % catOrder.length]);

  const columns = [
    { header: "ETF", align: "left" as const },
    { header: "Price ($)", align: "right" as const },
    { header: "Chg%", align: "right" as const },
    { header: "1Y", align: "center" as const, minWidth: 64 },
    { header: "1 Year", align: "right" as const, minWidth: 58 },
    { header: "3 Year", align: "right" as const, minWidth: 58 },
    { header: "5 Year", align: "right" as const, minWidth: 58 },
    { header: "AUM", align: "right" as const, minWidth: 72 },
    { header: "Exp%", align: "right" as const, minWidth: 58 },
    { header: "Yield", align: "right" as const, minWidth: 58 },
    { header: "52W Range", align: "center" as const, minWidth: 110 },
    { header: "Watchlist", align: "center" as const, minWidth: 80 },
  ];

  const rows = etfs.map((etf) => {
    const chgColor = etf.changePercent >= 0 ? "text-emerald-500" : "text-red-500";
    return [
      <div key="name" className="flex items-center gap-2.5">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
        <p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">{etf.name}</p>
      </div>,
      <span key="price" className="whitespace-nowrap tabular-nums text-[14px] text-foreground">{etf.price.toFixed(1)}</span>,
      <span key="chg" className={cn("whitespace-nowrap tabular-nums text-[14px] font-semibold", chgColor)}>{etf.changePercent >= 0 ? "+" : ""}{etf.changePercent.toFixed(1)}%</span>,
      <div key="spark" className="flex justify-center"><Sparkline points={sparklines[etf.symbol]} autoColor /></div>,
      ...(() => { const r = mockReturns(etf.symbol); return [
        <span key="r1y" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", r.r1y >= 0 ? "text-emerald-500" : "text-red-500")}>{r.r1y >= 0 ? "+" : ""}{r.r1y.toFixed(1)}%</span>,
        <span key="r3y" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", r.r3y >= 0 ? "text-emerald-500" : "text-red-500")}>{r.r3y >= 0 ? "+" : ""}{r.r3y.toFixed(1)}%</span>,
        <span key="r5y" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", r.r5y >= 0 ? "text-emerald-500" : "text-red-500")}>{r.r5y >= 0 ? "+" : ""}{r.r5y.toFixed(1)}%</span>,
      ]; })(),
      <span key="aum" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.aum}</span>,
      <span key="exp" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.expenseRatio.toFixed(2)}%</span>,
      <span key="yield" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.yield != null ? `${etf.yield.toFixed(2)}%` : "—"}</span>,
      <Range52W key="range" low={etf.low52w} high={etf.high52w} current={etf.price} />,
      <div key="watch" className="flex justify-center">
        <button onClick={() => toggleBookmark(etf.symbol)} className="transition-transform active:scale-90">
          <Bookmark size={20} strokeWidth={1.8} className={cn("transition-colors", bookmarks.has(etf.symbol) ? "fill-foreground text-foreground" : "text-muted-foreground/50")} />
        </button>
      </div>,
    ];
  });

  return (
    <ScrollableTableWidget
      title={title}
      description={description}
      flipper={hideCategoryFlipper ? undefined : {
        label: catLabels[category],
        icon: <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />,
        onFlip: cycleCategory,
      }}
      tabs={moverTabs}
      activeTab={moverType}
      onTabChange={(id) => setMoverType(id as MoverType)}
      pillLayoutId="etf-mover-tab-pill"
      columns={columns}
      rows={rows}
      scrollableMinWidth={620}
      animationKey={`${moverType}-${category}`}
      footer={{ label: "View More" }}
    />
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <span className="tabular-nums text-[11px] font-semibold tabular-nums" style={{ color }}>
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
      <div className="flex h-[37px] items-center px-5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        ETF
      </div>
      {etfs.map((etf) => (
        <div
          key={etf.symbol}
          className="flex h-[56px] items-center border-t border-border/20 px-5"
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
            <div className="min-w-0">
              <p className="max-w-[115px] truncate text-[14px] font-semibold leading-tight">
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RiskAdjustedWidget() {
  const [filter, setFilter] = useState<MorningstarFilter>("5star");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const etfs = morningstarData[filter];

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym); else n.add(sym);
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
                        "whitespace-nowrap px-3 text-right tabular-nums text-[13px] font-semibold tabular-nums",
                        etf.return3y >= 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {etf.return3y >= 0 ? "+" : ""}{etf.return3y.toFixed(1)}%
                      </td>
                      <td className={cn(
                        "whitespace-nowrap px-3 text-right tabular-nums text-[13px] font-semibold tabular-nums",
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
                      <td className="whitespace-nowrap px-3 text-right tabular-nums text-[13px] tabular-nums text-muted-foreground">
                        {etf.expenseRatio.toFixed(2)}%
                      </td>
                      <td className="whitespace-nowrap px-3 text-right tabular-nums text-[13px] tabular-nums text-muted-foreground">
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ForwardLookingWidget() {
  const [filter, setFilter] = useState<CFRAFilter>("overweight");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const etfs = cfraData[filter];

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym); else n.add(sym);
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
                        "whitespace-nowrap px-3 text-right tabular-nums text-[13px] font-semibold tabular-nums",
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

/* ------------------------------------------------------------------ */
/*  Dividend ETFs Widget                                               */
/* ------------------------------------------------------------------ */

type DivETFTab = "high-yield" | "div-growth" | "bond-income";

interface DivETF {
  symbol: string;
  name: string;
  yield: number;
  changePct: number;
  expenseRatio: string;
  aum: string;
  ytd: number;
  frequency: "Monthly" | "Quarterly";
  topHoldings: string;
}

const divETFTabs: { id: DivETFTab; label: string }[] = [
  { id: "high-yield", label: "High Yield" },
  { id: "div-growth", label: "Dividend Growth" },
  { id: "bond-income", label: "Bond & Income" },
];

const divETFData: Record<DivETFTab, DivETF[]> = {
  "high-yield": [
    { symbol: "SCHD", name: "Schwab US Dividend", yield: 3.42, changePct: 0.38, expenseRatio: "0.06%", aum: "63B", ytd: 4.82, frequency: "Quarterly", topHoldings: "AMGN, ABBV, HD" },
    { symbol: "JEPI", name: "JPM Equity Premium", yield: 7.24, changePct: -0.15, expenseRatio: "0.35%", aum: "34B", ytd: 2.18, frequency: "Monthly", topHoldings: "MSFT, AMZN, META" },
    { symbol: "JEPQ", name: "JPM Nasdaq Premium", yield: 9.41, changePct: 0.62, expenseRatio: "0.35%", aum: "18B", ytd: 6.94, frequency: "Monthly", topHoldings: "AAPL, MSFT, NVDA" },
    { symbol: "HDV", name: "iShares High Dividend", yield: 3.81, changePct: 0.22, expenseRatio: "0.08%", aum: "11B", ytd: 3.56, frequency: "Quarterly", topHoldings: "XOM, JNJ, ABBV" },
    { symbol: "VYM", name: "Vanguard High Yield", yield: 2.92, changePct: 0.18, expenseRatio: "0.06%", aum: "55B", ytd: 5.12, frequency: "Quarterly", topHoldings: "JPM, AVGO, XOM" },
  ],
  "div-growth": [
    { symbol: "VIG", name: "Vanguard Div Appreciation", yield: 1.72, changePct: 0.28, expenseRatio: "0.06%", aum: "82B", ytd: 6.48, frequency: "Quarterly", topHoldings: "AAPL, MSFT, JPM" },
    { symbol: "DGRO", name: "iShares Div Growth", yield: 2.31, changePct: 0.14, expenseRatio: "0.08%", aum: "28B", ytd: 5.22, frequency: "Quarterly", topHoldings: "MSFT, AAPL, JPM" },
    { symbol: "NOBL", name: "ProShares Div Aristocrats", yield: 2.08, changePct: -0.12, expenseRatio: "0.35%", aum: "12B", ytd: 3.14, frequency: "Quarterly", topHoldings: "GD, EMR, ATO" },
    { symbol: "DGRW", name: "WisdomTree US Qual Div", yield: 1.82, changePct: 0.34, expenseRatio: "0.28%", aum: "13B", ytd: 7.62, frequency: "Monthly", topHoldings: "MSFT, AAPL, NVDA" },
    { symbol: "SDY", name: "SPDR S&P Div ETF", yield: 2.58, changePct: 0.08, expenseRatio: "0.35%", aum: "22B", ytd: 2.94, frequency: "Quarterly", topHoldings: "KVUE, IBM, T" },
  ],
  "bond-income": [
    { symbol: "BND", name: "Vanguard Total Bond", yield: 3.92, changePct: 0.05, expenseRatio: "0.03%", aum: "108B", ytd: 1.24, frequency: "Monthly", topHoldings: "US Treasury, MBS" },
    { symbol: "HYG", name: "iShares High Yield Corp", yield: 5.81, changePct: -0.08, expenseRatio: "0.49%", aum: "18B", ytd: 2.68, frequency: "Monthly", topHoldings: "CCL, DISH, TMUS" },
    { symbol: "TLT", name: "iShares 20+ Yr Treasury", yield: 4.12, changePct: -0.32, expenseRatio: "0.15%", aum: "52B", ytd: -2.14, frequency: "Monthly", topHoldings: "US Treasury" },
    { symbol: "VCIT", name: "Vanguard Intm Corp Bond", yield: 4.48, changePct: 0.02, expenseRatio: "0.04%", aum: "44B", ytd: 1.82, frequency: "Monthly", topHoldings: "Bank of America, JPM" },
    { symbol: "AGG", name: "iShares Core US Agg", yield: 3.68, changePct: 0.04, expenseRatio: "0.03%", aum: "92B", ytd: 0.94, frequency: "Monthly", topHoldings: "US Treasury, MBS" },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DividendETFsWidget() {
  const [divTab, setDivTab] = useState<DivETFTab>("high-yield");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const etfs = divETFData[divTab];

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym); else n.add(sym);
      return n;
    });

  return (
    <div>
      <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">
        Dividend ETFs
      </h2>
      <p className="mb-2.5 text-[14px] text-muted-foreground">
        Income-focused ETFs sorted by yield
      </p>

      {/* Pill tabs */}
      <div className="mb-2.5 flex gap-2 overflow-x-auto no-scrollbar">
        {divETFTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDivTab(tab.id)}
            className={cn(
              "flex-shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              divTab === tab.id
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
            key={divTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            {/* ---- Frozen left column ---- */}
            <div className="z-10 w-[196px] flex-shrink-0 bg-card shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
              <div className="flex h-[37px] items-center px-5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                ETF
              </div>
              {etfs.map((etf) => (
                <div
                  key={etf.symbol}
                  className="flex h-[56px] items-center border-t border-border/20 px-5"
                >
                  <div className="min-w-0">
                    <p className="max-w-[160px] text-[13px] font-semibold leading-[1.25] line-clamp-2">
                      {etf.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ---- Scrollable right columns ---- */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table style={{ minWidth: 570 }}>
                <thead>
                  <tr className="h-[37px]">
                    <th className="min-w-[64px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Yield
                    </th>
                    <th className="min-w-[64px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      % Chg
                    </th>
                    <th className="min-w-[56px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Exp %
                    </th>
                    <th className="min-w-[52px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      AUM
                    </th>
                    <th className="min-w-[64px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      YTD
                    </th>
                    <th className="min-w-[48px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Freq
                    </th>
                    <th className="min-w-[100px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Top Holdings
                    </th>
                    <th className="min-w-[48px] px-3" />
                  </tr>
                </thead>
                <tbody>
                  {etfs.map((etf) => (
                    <tr key={etf.symbol} className="h-[56px] border-t border-border/20">
                      <td className="whitespace-nowrap px-3 text-right text-[13px] font-bold tabular-nums text-gain">
                        {etf.yield.toFixed(2)}%
                      </td>
                      <td className={cn(
                        "whitespace-nowrap px-3 text-right text-[13px] font-semibold tabular-nums",
                        etf.changePct >= 0 ? "text-gain" : "text-loss"
                      )}>
                        {etf.changePct >= 0 ? "+" : ""}{etf.changePct.toFixed(2)}%
                      </td>
                      <td className="whitespace-nowrap px-3 text-right text-[13px] tabular-nums text-muted-foreground">
                        {etf.expenseRatio}
                      </td>
                      <td className="whitespace-nowrap px-3 text-right text-[13px] tabular-nums text-muted-foreground">
                        {etf.aum}
                      </td>
                      <td className={cn(
                        "whitespace-nowrap px-3 text-right text-[13px] font-semibold tabular-nums",
                        etf.ytd >= 0 ? "text-gain" : "text-loss"
                      )}>
                        {etf.ytd >= 0 ? "+" : ""}{etf.ytd.toFixed(2)}%
                      </td>
                      <td className="whitespace-nowrap px-3 text-right text-[12px] text-muted-foreground">
                        {etf.frequency === "Monthly" ? "Mo" : "Qt"}
                      </td>
                      <td className="whitespace-nowrap px-3 text-right text-[12px] text-muted-foreground">
                        {etf.topHoldings}
                      </td>
                      <td className="px-3">
                        <div className="flex justify-center">
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* View More */}
        <button className="flex w-full items-center justify-center gap-1 border-t border-border/40 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
          View More
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                "flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors active:bg-muted/30",
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
/*  Level Up Widget — Carousel Cards + Stories (ETF)                   */
/* ------------------------------------------------------------------ */

const etfLevelUpCards: { id: string; title: string; subtitle: string; hook: string; gradient: string; duration: string; story: Story }[] = [
  {
    id: "fundamentals", title: "ETF Fundamentals", subtitle: "Getting Started",
    hook: "What ETFs are, how they track indices, and why expense ratios matter more than you think.",
    gradient: "from-zinc-600 to-zinc-900", duration: "4 min",
    story: {
      id: "etf-fundamentals", title: "ETF Fundamentals", subtitle: "Getting started",
      icon: <Layers size={18} />, gradient: "from-zinc-800 to-zinc-950", timestamp: "",
      renderContent: () => (
        <div className="flex flex-col items-center gap-8 px-2 text-center">
          <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
            ETF <span className="text-zinc-300">101.</span>
          </div>
          <div className="h-px w-12 bg-white/15" />
          <div className="w-full space-y-2.5">
            {[
              { label: "ETFs vs Mutual Funds vs Stocks", desc: "One trades like a stock, holds like a fund. The best of both worlds." },
              { label: "How index tracking works", desc: "Replication, sampling, and why tracking error matters" },
              { label: "Expense ratios explained", desc: "0.03% vs 0.75% — small numbers, massive impact over decades" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/8 px-4 py-3 text-left">
                <p className="text-[15px] font-semibold text-white">{item.label}</p>
                <p className="text-[13px] text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  },
  {
    id: "portfolio", title: "Building Your Portfolio", subtitle: "Asset Allocation",
    hook: "Core-satellite strategy, asset allocation by age, and when to rebalance.",
    gradient: "from-neutral-600 to-neutral-900", duration: "5 min",
    story: {
      id: "etf-portfolio", title: "Building Your Portfolio", subtitle: "Asset allocation",
      icon: <Coins size={18} />, gradient: "from-neutral-800 to-neutral-950", timestamp: "",
      renderContent: () => (
        <div className="flex flex-col items-center gap-8 px-2 text-center">
          <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
            Build the <span className="text-neutral-300">core.</span>
          </div>
          <div className="h-px w-12 bg-white/15" />
          <div className="w-full space-y-2.5">
            {[
              { label: "Core-satellite strategy", desc: "80% broad market core + 20% tactical satellites" },
              { label: "Asset allocation by age", desc: "The rule of thumb, when to break it, and why it works" },
              { label: "When & how to rebalance", desc: "Drift happens. Rebalancing keeps your risk in check." },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/8 px-4 py-3 text-left">
                <p className="text-[15px] font-semibold text-white">{item.label}</p>
                <p className="text-[13px] text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  },
  {
    id: "advanced", title: "Advanced ETF Strategies", subtitle: "Pro Moves",
    hook: "Sector rotation, leveraged ETFs, and using ETFs for options strategies.",
    gradient: "from-stone-600 to-stone-900", duration: "5 min",
    story: {
      id: "etf-advanced", title: "Advanced Strategies", subtitle: "Pro moves",
      icon: <Rocket size={18} />, gradient: "from-stone-800 to-stone-950", timestamp: "",
      renderContent: () => (
        <div className="flex flex-col items-center gap-8 px-2 text-center">
          <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
            Go <span className="text-stone-300">deeper.</span>
          </div>
          <div className="h-px w-12 bg-white/15" />
          <div className="w-full space-y-2.5">
            {[
              { label: "Sector rotation with ETFs", desc: "Ride the economic cycle — tech in growth, utilities in recession" },
              { label: "Leveraged & inverse ETFs", desc: "2x, 3x, and inverse — powerful tools with sharp edges" },
              { label: "Options on ETFs", desc: "Covered calls on SPY, protective puts on QQQ — the basics" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/8 px-4 py-3 text-left">
                <p className="text-[15px] font-semibold text-white">{item.label}</p>
                <p className="text-[13px] text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  },
  {
    id: "tax", title: "Tax-Smart Investing", subtitle: "Keep More",
    hook: "Tax-loss harvesting, wash sale rules, and why ETFs are the most tax-efficient wrapper.",
    gradient: "from-gray-600 to-gray-900", duration: "4 min",
    story: {
      id: "etf-tax", title: "Tax-Smart Investing", subtitle: "Keep more",
      icon: <DollarSign size={18} />, gradient: "from-gray-800 to-gray-950", timestamp: "",
      renderContent: () => (
        <div className="flex flex-col items-center gap-8 px-2 text-center">
          <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
            Keep <span className="text-gray-300">more.</span>
          </div>
          <div className="h-px w-12 bg-white/15" />
          <div className="w-full space-y-2.5">
            {[
              { label: "The ETF tax advantage", desc: "In-kind redemptions mean fewer taxable events than mutual funds" },
              { label: "Tax-loss harvesting with ETFs", desc: "Sell the loser, buy a similar ETF, keep the exposure, book the loss" },
              { label: "Avoiding wash sale traps", desc: "30-day rule, substantially identical securities, and how to stay clean" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/8 px-4 py-3 text-left">
                <p className="text-[15px] font-semibold text-white">{item.label}</p>
                <p className="text-[13px] text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LevelUpWidget() {
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  return (
    <div>
      <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">
        Level Up
      </h2>
      <p className="mb-3 text-[14px] text-muted-foreground">
        Master ETF investing from beginner to advanced
      </p>

      <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
        <div className="flex gap-3" style={{ width: "max-content" }}>
          {etfLevelUpCards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => { setStoryIndex(i); setStoryOpen(true); }}
              className="relative flex w-[200px] flex-shrink-0 flex-col justify-between overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.97]"
              style={{ height: 260 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${card.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="relative z-10 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Play size={16} fill="white" className="text-white ml-0.5" />
                </div>
              </div>
              <div className="relative z-10 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-1.5">{card.subtitle}</p>
                <p className="text-[17px] font-bold leading-tight text-white mb-1.5">{card.title}</p>
                <p className="text-[12px] leading-snug text-white/50 line-clamp-2">{card.hook}</p>
                <p className="mt-2 text-[11px] font-medium text-white/30">{card.duration} read</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <StoriesViewer
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        initialIndex={storyIndex}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Market Heatmap — data                                              */
/* ------------------------------------------------------------------ */

type HeatmapView = "etfs" | "categories";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const heatViewOrder: HeatmapView[] = ["etfs", "categories"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
const TM_H = 500;

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

function heatColor(change: number, isDark: boolean): string {
  if (isDark) {
    if (change >= 3) return "#1a3a2a";
    if (change >= 2) return "#1e3d2d";
    if (change >= 1) return "#223f30";
    if (change >= 0.3) return "#2a4436";
    if (change > -0.3) return "#2a2a2e";
    if (change > -1) return "#3d2a2a";
    if (change > -2) return "#422828";
    if (change > -3) return "#482626";
    return "#4e2424";
  }
  if (change >= 3) return "#c1e6d0";
  if (change >= 2) return "#cfeadb";
  if (change >= 1) return "#d9f0e3";
  if (change >= 0.3) return "#e4f5ec";
  if (change > -0.3) return "#ececee";
  if (change > -1) return "#f5e0e0";
  if (change > -2) return "#f0d4d4";
  if (change > -3) return "#eac8c8";
  return "#e4bcbc";
}

/* ------------------------------------------------------------------ */
/*  ETF Heatmap Widget                                                 */
/* ------------------------------------------------------------------ */

function HeatmapWidget() {
  const [basis] = useState<HeatmapBasis>("aum");
  const [view] = useState<HeatmapView>("etfs");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const rawItems = view === "etfs" ? heatmapETFs[basis] : heatmapCategories;

  const rects = useMemo(() => {
    const MIN_DIM = 40;
    let items = rawItems;
    let result: HeatRect[] = [];
    for (let pass = 0; pass < 3; pass++) {
      const allRects = treemapLayout(items);
      const tooSmall = new Set(allRects.filter((r) => Math.min(r.w, r.h) < MIN_DIM).map((r) => r.symbol));
      if (tooSmall.size === 0) {
        result = allRects;
        break;
      }
      items = items.filter((i) => !tooSmall.has(i.symbol));
    }
    if (result.length === 0) result = treemapLayout(items);
    if (result.length > 0) {
      const last = result[result.length - 1];
      result[result.length - 1] = { ...last, symbol: "Others" };
    }
    return result;
  }, [rawItems]);

  return (
    <div>
      <h2 className="mb-1 text-[18px] font-bold tracking-tight">ETF at a Glance</h2>
      <p className="mb-4 text-[13px] text-muted-foreground leading-snug">
        Every ETF category in one frame. Bigger squares hold more money. Color shows today&apos;s move.
      </p>

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
                    className="absolute p-[1px]"
                    style={{
                      left: `${(r.x / TM_W) * 100}%`,
                      top: `${(r.y / TM_H) * 100}%`,
                      width: `${(r.w / TM_W) * 100}%`,
                      height: `${(r.h / TM_H) * 100}%`,
                    }}
                  >
                    <div
                      className="flex h-full w-full flex-col items-center justify-center"
                      style={{ backgroundColor: heatColor(r.change, isDark) }}
                    >
                      {showLabel && (
                        <span
                          className={cn("font-bold leading-none text-center px-1", isDark ? "text-white" : "text-black/80")}
                          style={{ fontSize: isLarge ? 13 : 10 }}
                        >
                          {r.symbol}
                        </span>
                      )}
                      {showChange && r.symbol !== "Others" && (
                        <span
                          className={cn("mt-0.5 leading-none", isDark ? "text-white/80" : "text-black/50")}
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

      <button className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <Maximize2 size={15} />
        View All
      </button>
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
  const [mode, setMode] = useState<BannerMode>("big");

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
        isFull ? "-mx-5 w-[calc(100%+2.5rem)]" : "rounded-2xl"
      )}
    >
      <p className="text-[14px] font-semibold text-muted-foreground">{label}</p>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Popular ETFs Widget                                                */
/* ------------------------------------------------------------------ */

export interface PopularETF {
  name: string;
  symbol: string;
  return3y: number;
  aum: string;
  expenseRatio: number;
  trackingError: number;
}

const defaultPopularETFs: PopularETF[] = [
  { name: "Vanguard S&P 500", symbol: "VOO", return3y: 10.8, aum: "892B", expenseRatio: 0.03, trackingError: 0.01 },
  { name: "Invesco QQQ Trust", symbol: "QQQ", return3y: 14.2, aum: "252B", expenseRatio: 0.20, trackingError: 0.04 },
  { name: "Vanguard Total Stock", symbol: "VTI", return3y: 9.6, aum: "384B", expenseRatio: 0.03, trackingError: 0.02 },
  { name: "iShares Core S&P 500", symbol: "IVV", return3y: 10.7, aum: "478B", expenseRatio: 0.03, trackingError: 0.01 },
  { name: "SPDR S&P 500", symbol: "SPY", return3y: 10.6, aum: "518B", expenseRatio: 0.09, trackingError: 0.02 },
  { name: "Vanguard Growth", symbol: "VUG", return3y: 12.8, aum: "124B", expenseRatio: 0.04, trackingError: 0.03 },
  { name: "Schwab US Large-Cap", symbol: "SCHX", return3y: 10.4, aum: "42B", expenseRatio: 0.03, trackingError: 0.01 },
  { name: "iShares Russell 1000", symbol: "IWB", return3y: 10.1, aum: "34B", expenseRatio: 0.15, trackingError: 0.02 },
];

interface PopularETFsWidgetProps {
  title?: string;
  subtitle?: string;
  etfs?: PopularETF[];
}

export function PopularETFsWidget({
  title = "Popular ETFs",
  subtitle = "What other Aspora members are putting their money into. A starting point for ideas, not a buy signal.",
  etfs: etfsOverride,
}: PopularETFsWidgetProps = {}) {
  const [variant, setVariant] = useState<"grid" | "scroll">("scroll");

  return (
    <div>
      <button onClick={() => setVariant((v) => v === "grid" ? "scroll" : "grid")}>
        <h2 className="text-[18px] font-bold tracking-tight text-foreground">{title}</h2>
      </button>
      <p className="text-[14px] text-muted-foreground mt-0.5 mb-3">{subtitle}</p>

      {(() => {
        const etfs = etfsOverride ?? defaultPopularETFs;
        const row1 = etfs.slice(0, Math.ceil(etfs.length / 2));
        const row2 = etfs.slice(Math.ceil(etfs.length / 2));

        return variant === "grid" ? (
          <div className="grid grid-cols-2 gap-3">
            {etfs.map((etf) => (
              <ETFCardLadder key={etf.symbol} etf={popularETFToCardData(etf)} />
            ))}
          </div>
        ) : (
          <div className="-mx-5 overflow-x-auto no-scrollbar">
            <div className="flex flex-col gap-3 px-5" style={{ width: "max-content" }}>
              <div className="flex gap-3">
                {row1.map((etf) => (
                  <ETFCardLadder
                    key={etf.symbol}
                    etf={popularETFToCardData(etf)}
                    className="shrink-0 w-[280px]"
                  />
                ))}
              </div>
              <div className="flex gap-3">
                {row2.map((etf) => (
                  <ETFCardLadder
                    key={etf.symbol}
                    etf={popularETFToCardData(etf)}
                    className="shrink-0 w-[280px]"
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Explore by Themes Widget                                           */
/* ------------------------------------------------------------------ */

type ThemeId = "ai" | "manufacturing" | "commodities" | "banking" | "emerging" | "healthcare" | "clean-energy";

const themeTabs: { id: ThemeId; label: string }[] = [
  { id: "ai", label: "AI & Tech" },
  { id: "clean-energy", label: "Clean Energy & ESG" },
  { id: "commodities", label: "Niche Commodities" },
  { id: "manufacturing", label: "Manufacturing" },
  { id: "banking", label: "Banking & Finance" },
  { id: "emerging", label: "Emerging Markets" },
  { id: "healthcare", label: "Healthcare" },
];

const themeETFs: Record<ThemeId, PopularETF[]> = {
  ai: [
    { name: "Global X Robotics & AI", symbol: "BOTZ", return3y: 12.4, aum: "2.8B", expenseRatio: 0.68, trackingError: 0.15 },
    { name: "iShares Semiconductor", symbol: "SOXX", return3y: 18.6, aum: "12B", expenseRatio: 0.35, trackingError: 0.08 },
    { name: "ARK Autonomous Tech", symbol: "ARKQ", return3y: 8.2, aum: "1.2B", expenseRatio: 0.75, trackingError: 0.22 },
    { name: "First Trust Cloud Comp", symbol: "SKYY", return3y: 10.8, aum: "3.4B", expenseRatio: 0.60, trackingError: 0.12 },
  ],
  manufacturing: [
    { name: "iShares US Industrials", symbol: "IYJ", return3y: 9.8, aum: "1.8B", expenseRatio: 0.39, trackingError: 0.06 },
    { name: "Industrial Select SPDR", symbol: "XLI", return3y: 10.2, aum: "19B", expenseRatio: 0.09, trackingError: 0.02 },
    { name: "Vanguard Industrials", symbol: "VIS", return3y: 9.6, aum: "5.2B", expenseRatio: 0.10, trackingError: 0.03 },
    { name: "First Trust Indl/Prod", symbol: "FXR", return3y: 8.4, aum: "1.4B", expenseRatio: 0.61, trackingError: 0.10 },
  ],
  commodities: [
    { name: "SPDR Gold Shares", symbol: "GLD", return3y: 8.2, aum: "58B", expenseRatio: 0.40, trackingError: 0.01 },
    { name: "iShares Silver Trust", symbol: "SLV", return3y: 4.8, aum: "12B", expenseRatio: 0.50, trackingError: 0.02 },
    { name: "Invesco DB Commodity", symbol: "DBC", return3y: 12.6, aum: "2.4B", expenseRatio: 0.85, trackingError: 0.18 },
    { name: "United States Oil Fund", symbol: "USO", return3y: -2.4, aum: "2.8B", expenseRatio: 0.60, trackingError: 0.25 },
  ],
  banking: [
    { name: "Financial Select SPDR", symbol: "XLF", return3y: 11.4, aum: "42B", expenseRatio: 0.09, trackingError: 0.02 },
    { name: "iShares US Financials", symbol: "IYF", return3y: 10.8, aum: "2.8B", expenseRatio: 0.39, trackingError: 0.05 },
    { name: "SPDR S&P Bank", symbol: "KBE", return3y: 8.6, aum: "2.2B", expenseRatio: 0.35, trackingError: 0.08 },
    { name: "Invesco KBW Bank", symbol: "KBWB", return3y: 9.2, aum: "1.8B", expenseRatio: 0.35, trackingError: 0.06 },
  ],
  emerging: [
    { name: "Vanguard FTSE EM", symbol: "VWO", return3y: 2.8, aum: "82B", expenseRatio: 0.08, trackingError: 0.04 },
    { name: "iShares MSCI EM", symbol: "EEM", return3y: 2.4, aum: "18B", expenseRatio: 0.68, trackingError: 0.12 },
    { name: "iShares Core EM", symbol: "IEMG", return3y: 3.2, aum: "78B", expenseRatio: 0.09, trackingError: 0.03 },
    { name: "Schwab EM Equity", symbol: "SCHE", return3y: 2.6, aum: "8.4B", expenseRatio: 0.11, trackingError: 0.05 },
  ],
  healthcare: [
    { name: "Health Care Select SPDR", symbol: "XLV", return3y: 8.4, aum: "42B", expenseRatio: 0.09, trackingError: 0.02 },
    { name: "iShares US Healthcare", symbol: "IYH", return3y: 8.8, aum: "3.2B", expenseRatio: 0.39, trackingError: 0.05 },
    { name: "ARK Genomic Revolution", symbol: "ARKG", return3y: -4.2, aum: "2.1B", expenseRatio: 0.75, trackingError: 0.28 },
    { name: "iShares Biotech", symbol: "IBB", return3y: 3.6, aum: "8.4B", expenseRatio: 0.44, trackingError: 0.08 },
  ],
  "clean-energy": [
    { name: "iShares Clean Energy", symbol: "ICLN", return3y: -6.8, aum: "3.2B", expenseRatio: 0.40, trackingError: 0.14 },
    { name: "Invesco Solar", symbol: "TAN", return3y: -8.4, aum: "1.8B", expenseRatio: 0.67, trackingError: 0.22 },
    { name: "First Trust Clean Edge", symbol: "QCLN", return3y: -4.2, aum: "1.2B", expenseRatio: 0.58, trackingError: 0.16 },
    { name: "Global X Clean Tech", symbol: "CTEC", return3y: -5.6, aum: "0.4B", expenseRatio: 0.50, trackingError: 0.18 },
  ],
};

interface ExploreByThemesWidgetProps {
  title?: string;
  subtitle?: string;
  tabs?: { id: string; label: string }[];
  themeData?: Record<string, PopularETF[]>;
}

export function ExploreByThemesWidget({
  title = "Explore by Themes",
  subtitle = "ETFs grouped by the trend behind them — AI, clean energy, banking. Pick the wave first, the ticker second.",
  tabs = themeTabs,
  themeData = themeETFs,
}: ExploreByThemesWidgetProps = {}) {
  const [activeTheme, setActiveTheme] = useState<string>(tabs[0]?.id ?? "");
  const etfs = themeData[activeTheme] ?? [];

  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight text-foreground">{title}</h2>
      <p className="text-[14px] text-muted-foreground mt-0.5 mb-3">{subtitle}</p>

      {/* Theme pills */}
      <div className="-mx-5 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-5 py-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTheme(tab.id)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[14px] font-semibold transition-colors",
                activeTheme === tab.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards — horizontal scroll, 2 rows */}
      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex flex-col gap-3 px-5" style={{ width: "max-content" }}>
          <div className="flex gap-3">
            {etfs.slice(0, 2).map((etf) => (
              <ETFCardLadder
                key={etf.symbol}
                etf={popularETFToCardData(etf)}
                className="shrink-0 w-[280px]"
              />
            ))}
          </div>
          <div className="flex gap-3">
            {etfs.slice(2).map((etf) => (
              <ETFCardLadder
                key={etf.symbol}
                etf={popularETFToCardData(etf)}
                className="shrink-0 w-[280px]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Explore by Asset Class Widget                                      */
/* ------------------------------------------------------------------ */

type AssetClassId = "fixed-income" | "commodities" | "real-estate" | "currency" | "multi-asset" | "balanced";

const assetClassTabs: { id: AssetClassId; label: string }[] = [
  { id: "fixed-income", label: "Fixed Income" },
  { id: "commodities", label: "Commodities" },
  { id: "real-estate", label: "REITs" },
  { id: "currency", label: "Currency" },
  { id: "multi-asset", label: "Multi-Asset" },
  { id: "balanced", label: "Balanced" },
];

const assetClassData: Record<AssetClassId, ETF[]> = {
  "fixed-income": [
    { symbol: "BND", name: "Vanguard Total Bond", price: 72.45, changePercent: 0.34, volume: "8.2M", aum: "$108B", expenseRatio: 0.03, yield: 3.85, high52w: 75.2, low52w: 68.1, color: "#8B1A1A" },
    { symbol: "AGG", name: "iShares Core US Agg", price: 98.12, changePercent: 0.28, volume: "6.7M", aum: "$98B", expenseRatio: 0.03, yield: 3.72, high52w: 101.5, low52w: 93.2, color: "#333333" },
    { symbol: "TLT", name: "iShares 20+ Yr Trsy", price: 92.84, changePercent: 0.82, volume: "24.5M", aum: "$52B", expenseRatio: 0.15, yield: 4.12, high52w: 102.3, low52w: 82.4, color: "#1A5276" },
    { symbol: "LQD", name: "iShares IG Corp", price: 108.67, changePercent: 0.42, volume: "12.3M", aum: "$35B", expenseRatio: 0.14, yield: 4.45, high52w: 114.0, low52w: 100.8, color: "#333333" },
    { symbol: "HYG", name: "iShares High Yield", price: 78.23, changePercent: 0.56, volume: "15.8M", aum: "$18B", expenseRatio: 0.49, yield: 5.82, high52w: 80.1, low52w: 72.4, color: "#333333" },
  ],
  commodities: [
    { symbol: "GLD", name: "SPDR Gold Shares", price: 188.42, changePercent: 1.24, volume: "8.4M", aum: "$58B", expenseRatio: 0.40, yield: null, high52w: 195.0, low52w: 162.4, color: "#FFD700" },
    { symbol: "SLV", name: "iShares Silver Trust", price: 22.84, changePercent: 2.18, volume: "18.2M", aum: "$12B", expenseRatio: 0.50, yield: null, high52w: 26.0, low52w: 18.4, color: "#C0C0C0" },
    { symbol: "DBC", name: "Invesco DB Commodity", price: 24.56, changePercent: -0.82, volume: "2.4M", aum: "$2.4B", expenseRatio: 0.85, yield: null, high52w: 28.0, low52w: 20.8, color: "#8B4513" },
    { symbol: "USO", name: "United States Oil", price: 72.34, changePercent: -1.56, volume: "4.8M", aum: "$2.8B", expenseRatio: 0.60, yield: null, high52w: 84.0, low52w: 58.4, color: "#333333" },
    { symbol: "PDBC", name: "Invesco Optimum Yield", price: 14.28, changePercent: -0.42, volume: "3.2M", aum: "$4.8B", expenseRatio: 0.59, yield: null, high52w: 16.2, low52w: 12.4, color: "#333333" },
  ],
  "real-estate": [
    { symbol: "VNQ", name: "Vanguard Real Estate", price: 82.45, changePercent: -0.68, volume: "5.8M", aum: "$62B", expenseRatio: 0.12, yield: 3.82, high52w: 92.0, low52w: 72.4, color: "#8B4513" },
    { symbol: "IYR", name: "iShares US Real Estate", price: 88.34, changePercent: -0.42, volume: "4.2M", aum: "$4.8B", expenseRatio: 0.39, yield: 2.68, high52w: 96.0, low52w: 78.4, color: "#333333" },
    { symbol: "XLRE", name: "Real Estate SPDR", price: 38.72, changePercent: -1.24, volume: "8.2M", aum: "$6.8B", expenseRatio: 0.09, yield: 3.45, high52w: 44.2, low52w: 34.8, color: "#333333" },
    { symbol: "SCHH", name: "Schwab US REIT", price: 20.18, changePercent: -0.56, volume: "2.4M", aum: "$6.2B", expenseRatio: 0.07, yield: 3.12, high52w: 23.0, low52w: 18.2, color: "#333333" },
    { symbol: "RWR", name: "SPDR DJ Wilshire REIT", price: 98.56, changePercent: -0.82, volume: "0.8M", aum: "$1.8B", expenseRatio: 0.25, yield: 3.24, high52w: 108.0, low52w: 88.4, color: "#333333" },
  ],
  currency: [
    { symbol: "UUP", name: "Invesco DB US Dollar", price: 28.42, changePercent: 0.18, volume: "2.8M", aum: "$2.4B", expenseRatio: 0.75, yield: null, high52w: 30.0, low52w: 26.4, color: "#006400" },
    { symbol: "FXE", name: "Invesco CurrencyShares Euro", price: 92.34, changePercent: -0.24, volume: "0.4M", aum: "$0.2B", expenseRatio: 0.40, yield: null, high52w: 96.0, low52w: 88.4, color: "#003399" },
    { symbol: "FXY", name: "Invesco CurrencyShares Yen", price: 62.18, changePercent: 0.42, volume: "0.2M", aum: "$0.3B", expenseRatio: 0.40, yield: null, high52w: 68.0, low52w: 58.4, color: "#CC0000" },
    { symbol: "FXB", name: "Invesco CurrencyShares GBP", price: 118.56, changePercent: -0.12, volume: "0.1M", aum: "$0.1B", expenseRatio: 0.40, yield: null, high52w: 124.0, low52w: 112.4, color: "#003366" },
    { symbol: "FXA", name: "Invesco CurrencyShares AUD", price: 68.34, changePercent: -0.68, volume: "0.1M", aum: "$0.1B", expenseRatio: 0.40, yield: null, high52w: 74.0, low52w: 62.4, color: "#003366" },
  ],
  "multi-asset": [
    { symbol: "AOR", name: "iShares Core Growth Alloc", price: 54.28, changePercent: 0.42, volume: "0.8M", aum: "$2.4B", expenseRatio: 0.15, yield: 2.12, high52w: 56.0, low52w: 48.4, color: "#333333" },
    { symbol: "AOA", name: "iShares Core Aggressive", price: 62.18, changePercent: 0.68, volume: "0.4M", aum: "$1.8B", expenseRatio: 0.15, yield: 1.82, high52w: 64.0, low52w: 54.4, color: "#333333" },
    { symbol: "AOM", name: "iShares Core Moderate", price: 42.34, changePercent: 0.24, volume: "0.3M", aum: "$1.2B", expenseRatio: 0.15, yield: 2.42, high52w: 44.0, low52w: 38.4, color: "#333333" },
    { symbol: "AOK", name: "iShares Core Conservative", price: 36.56, changePercent: 0.12, volume: "0.2M", aum: "$0.8B", expenseRatio: 0.15, yield: 2.82, high52w: 38.0, low52w: 34.4, color: "#333333" },
    { symbol: "GAL", name: "SPDR SSgA Global Alloc", price: 42.18, changePercent: 0.34, volume: "0.1M", aum: "$0.4B", expenseRatio: 0.35, yield: 2.24, high52w: 44.0, low52w: 38.4, color: "#333333" },
  ],
  balanced: [
    { symbol: "VBIAX", name: "Vanguard Balanced Index", price: 42.56, changePercent: 0.48, volume: "1.2M", aum: "$52B", expenseRatio: 0.07, yield: 2.12, high52w: 44.0, low52w: 38.4, color: "#8B1A1A" },
    { symbol: "FBALX", name: "Fidelity Balanced", price: 28.34, changePercent: 0.32, volume: "0.8M", aum: "$38B", expenseRatio: 0.49, yield: 1.82, high52w: 30.0, low52w: 24.4, color: "#006400" },
    { symbol: "DODBX", name: "Dodge & Cox Balanced", price: 108.42, changePercent: 0.56, volume: "0.4M", aum: "$18B", expenseRatio: 0.52, yield: 2.42, high52w: 112.0, low52w: 96.4, color: "#333333" },
    { symbol: "PRWCX", name: "T. Rowe Price Cap Appr", price: 32.18, changePercent: 0.28, volume: "0.3M", aum: "$24B", expenseRatio: 0.70, yield: 1.62, high52w: 34.0, low52w: 28.4, color: "#003399" },
    { symbol: "OAKBX", name: "Oakmark Equity & Inc", price: 34.56, changePercent: 0.42, volume: "0.2M", aum: "$12B", expenseRatio: 0.78, yield: 2.08, high52w: 36.0, low52w: 30.4, color: "#333333" },
  ],
};

function ExploreByAssetClassWidget() {
  const [activeClass, setActiveClass] = useState<AssetClassId>("fixed-income");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const etfs = assetClassData[activeClass];

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => { const n = new Set(p); if (n.has(sym)) n.delete(sym); else n.add(sym); return n; });

  const sparklines = useMemo(
    () => etfs.reduce<Record<string, number[]>>((acc, e) => { acc[e.symbol] = makeSparkline(e.symbol, true); return acc; }, {}),
    [etfs]
  );

  const columns = [
    { header: "ETF", align: "left" as const },
    { header: "Price ($)", align: "right" as const },
    { header: "Chg%", align: "right" as const },
    { header: "1D", align: "center" as const, minWidth: 64 },
    { header: "AUM", align: "right" as const, minWidth: 72 },
    { header: "Exp%", align: "right" as const, minWidth: 58 },
    { header: "Yield", align: "right" as const, minWidth: 58 },
    { header: "52W Range", align: "center" as const, minWidth: 110 },
    { header: "Watchlist", align: "center" as const, minWidth: 80 },
  ];

  const rows = etfs.map((etf) => [
    <div key="name" className="flex items-center gap-2.5"><div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" /><p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">{etf.name}</p></div>,
    <span key="price" className="whitespace-nowrap tabular-nums text-[14px] text-foreground">{etf.price.toFixed(1)}</span>,
    <span key="chg" className={cn("whitespace-nowrap tabular-nums text-[14px] font-semibold", etf.changePercent >= 0 ? "text-emerald-500" : "text-red-500")}>{etf.changePercent >= 0 ? "+" : ""}{etf.changePercent.toFixed(1)}%</span>,
    <div key="spark" className="flex justify-center"><Sparkline points={sparklines[etf.symbol]} color={etf.changePercent >= 0 ? "#10b981" : "#ef4444"} /></div>,
    <span key="aum" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.aum}</span>,
    <span key="exp" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.expenseRatio.toFixed(2)}%</span>,
    <span key="yield" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.yield != null ? `${etf.yield.toFixed(2)}%` : "\u2014"}</span>,
    <Range52W key="range" low={etf.low52w} high={etf.high52w} current={etf.price} />,
    <div key="watch" className="flex justify-center"><button onClick={() => toggleBookmark(etf.symbol)} className="transition-transform active:scale-90"><Bookmark size={20} strokeWidth={1.8} className={cn("transition-colors", bookmarks.has(etf.symbol) ? "fill-foreground text-foreground" : "text-muted-foreground/50")} /></button></div>,
  ]);

  return (
    <ScrollableTableWidget
      title="Explore by Asset Class"
      description="Stocks aren't the only game. Bonds, gold, real estate — each one moves on its own cycle. Mix to smooth the ride."
      tabs={assetClassTabs}
      activeTab={activeClass}
      onTabChange={(id) => setActiveClass(id as AssetClassId)}
      pillLayoutId="etf-asset-class-pill"
      columns={columns}
      rows={rows}
      scrollableMinWidth={620}
      animationKey={activeClass}
      footer={{ label: "View All" }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Explore by Strategy Widget                                         */
/* ------------------------------------------------------------------ */

type StrategyId = "passive" | "active" | "value" | "growth" | "momentum" | "quality" | "low-vol" | "leveraged";

const strategyTabs: { id: StrategyId; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "passive", label: "Passive" },
  { id: "value", label: "Value" },
  { id: "growth", label: "Growth" },
  { id: "momentum", label: "Momentum" },
  { id: "quality", label: "Quality" },
  { id: "low-vol", label: "Low Volatility" },
  { id: "leveraged", label: "Leveraged" },
];

const strategyData: Record<StrategyId, ETF[]> = {
  passive: [
    { symbol: "VOO", name: "Vanguard S&P 500", price: 438.92, changePercent: 0.78, volume: "8.4M", aum: "$892B", expenseRatio: 0.03, yield: 1.32, high52w: 445.0, low52w: 362.5, color: "#8B1A1A" },
    { symbol: "VTI", name: "Vanguard Total Stock", price: 248.34, changePercent: 0.62, volume: "4.2M", aum: "$384B", expenseRatio: 0.03, yield: 1.24, high52w: 252.0, low52w: 198.4, color: "#8B1A1A" },
    { symbol: "BND", name: "Vanguard Total Bond", price: 72.45, changePercent: 0.34, volume: "8.2M", aum: "$108B", expenseRatio: 0.03, yield: 3.85, high52w: 75.2, low52w: 68.1, color: "#8B1A1A" },
    { symbol: "VXUS", name: "Vanguard Total Intl", price: 58.34, changePercent: -0.42, volume: "4.2M", aum: "$65B", expenseRatio: 0.07, yield: 2.95, high52w: 62.8, low52w: 52.1, color: "#8B1A1A" },
    { symbol: "VT", name: "Vanguard Total World", price: 108.42, changePercent: 0.48, volume: "2.8M", aum: "$38B", expenseRatio: 0.07, yield: 1.82, high52w: 112.0, low52w: 92.4, color: "#8B1A1A" },
  ],
  active: [
    { symbol: "ARKK", name: "ARK Innovation", price: 48.92, changePercent: 4.85, volume: "22.6M", aum: "$8.2B", expenseRatio: 0.75, yield: null, high52w: 56.3, low52w: 32.8, color: "#FF4500" },
    { symbol: "ARKG", name: "ARK Genomic Revolution", price: 32.18, changePercent: 2.42, volume: "4.8M", aum: "$2.1B", expenseRatio: 0.75, yield: null, high52w: 38.0, low52w: 22.4, color: "#FF4500" },
    { symbol: "ARKQ", name: "ARK Autonomous Tech", price: 54.56, changePercent: 3.12, volume: "2.4M", aum: "$1.2B", expenseRatio: 0.75, yield: null, high52w: 62.0, low52w: 38.4, color: "#FF4500" },
    { symbol: "AVUV", name: "Avantis US Small Cap Value", price: 88.42, changePercent: 1.24, volume: "1.8M", aum: "$12B", expenseRatio: 0.25, yield: 1.42, high52w: 92.0, low52w: 72.4, color: "#333333" },
    { symbol: "DFAC", name: "Dimensional US Core Eq", price: 32.18, changePercent: 0.68, volume: "1.2M", aum: "$28B", expenseRatio: 0.19, yield: 1.12, high52w: 34.0, low52w: 26.4, color: "#333333" },
  ],
  value: [
    { symbol: "VTV", name: "Vanguard Value", price: 158.42, changePercent: 0.42, volume: "2.8M", aum: "$118B", expenseRatio: 0.04, yield: 2.42, high52w: 162.0, low52w: 132.4, color: "#8B1A1A" },
    { symbol: "SCHV", name: "Schwab US Large-Cap Value", price: 72.18, changePercent: 0.28, volume: "1.4M", aum: "$12B", expenseRatio: 0.04, yield: 2.28, high52w: 74.0, low52w: 60.4, color: "#333333" },
    { symbol: "IWD", name: "iShares Russell 1000 Value", price: 172.34, changePercent: 0.56, volume: "3.2M", aum: "$58B", expenseRatio: 0.19, yield: 1.92, high52w: 178.0, low52w: 142.4, color: "#333333" },
    { symbol: "RPV", name: "Invesco S&P 500 Pure Value", price: 82.56, changePercent: 0.82, volume: "0.8M", aum: "$3.2B", expenseRatio: 0.35, yield: 2.18, high52w: 86.0, low52w: 68.4, color: "#333333" },
    { symbol: "AVLV", name: "Avantis US Large Cap Value", price: 58.42, changePercent: 0.34, volume: "0.6M", aum: "$8.4B", expenseRatio: 0.15, yield: 1.68, high52w: 60.0, low52w: 48.4, color: "#333333" },
  ],
  growth: [
    { symbol: "VUG", name: "Vanguard Growth", price: 328.42, changePercent: 1.42, volume: "2.4M", aum: "$124B", expenseRatio: 0.04, yield: 0.52, high52w: 340.0, low52w: 262.4, color: "#8B1A1A" },
    { symbol: "QQQ", name: "Invesco QQQ Trust", price: 442.18, changePercent: 1.24, volume: "52M", aum: "$252B", expenseRatio: 0.20, yield: 0.52, high52w: 460.0, low52w: 352.8, color: "#00CC66" },
    { symbol: "IWF", name: "iShares Russell 1000 Growth", price: 308.56, changePercent: 1.18, volume: "2.8M", aum: "$82B", expenseRatio: 0.19, yield: 0.48, high52w: 320.0, low52w: 248.4, color: "#333333" },
    { symbol: "SCHG", name: "Schwab US Large-Cap Growth", price: 88.42, changePercent: 1.34, volume: "1.8M", aum: "$28B", expenseRatio: 0.04, yield: 0.38, high52w: 92.0, low52w: 68.4, color: "#333333" },
    { symbol: "RPG", name: "Invesco S&P 500 Pure Growth", price: 218.34, changePercent: 1.56, volume: "0.4M", aum: "$2.8B", expenseRatio: 0.35, yield: 0.12, high52w: 228.0, low52w: 172.4, color: "#333333" },
  ],
  momentum: [
    { symbol: "MTUM", name: "iShares MSCI USA Momentum", price: 188.42, changePercent: 1.82, volume: "1.2M", aum: "$12B", expenseRatio: 0.15, yield: 0.82, high52w: 195.0, low52w: 152.4, color: "#333333" },
    { symbol: "SPMO", name: "Invesco S&P 500 Momentum", price: 82.18, changePercent: 1.56, volume: "0.8M", aum: "$4.8B", expenseRatio: 0.13, yield: 0.68, high52w: 86.0, low52w: 64.4, color: "#333333" },
    { symbol: "PDP", name: "Invesco DWA Momentum", price: 92.34, changePercent: 2.12, volume: "0.4M", aum: "$1.8B", expenseRatio: 0.62, yield: 0.42, high52w: 96.0, low52w: 72.4, color: "#333333" },
    { symbol: "VFMO", name: "Vanguard US Momentum", price: 142.56, changePercent: 1.68, volume: "0.2M", aum: "$0.8B", expenseRatio: 0.13, yield: 0.58, high52w: 148.0, low52w: 118.4, color: "#333333" },
    { symbol: "DWAS", name: "Invesco DWA SmallCap Mom", price: 82.42, changePercent: 2.42, volume: "0.1M", aum: "$0.6B", expenseRatio: 0.60, yield: 0.22, high52w: 88.0, low52w: 62.4, color: "#333333" },
  ],
  quality: [
    { symbol: "QUAL", name: "iShares MSCI USA Quality", price: 158.42, changePercent: 0.82, volume: "1.8M", aum: "$42B", expenseRatio: 0.15, yield: 1.12, high52w: 162.0, low52w: 128.4, color: "#333333" },
    { symbol: "SPHQ", name: "Invesco S&P 500 Quality", price: 52.18, changePercent: 0.68, volume: "0.8M", aum: "$8.4B", expenseRatio: 0.15, yield: 1.28, high52w: 54.0, low52w: 42.4, color: "#333333" },
    { symbol: "DGRW", name: "WisdomTree US Quality Div", price: 72.34, changePercent: 0.42, volume: "0.6M", aum: "$12B", expenseRatio: 0.28, yield: 1.82, high52w: 74.0, low52w: 60.4, color: "#333333" },
    { symbol: "JQUA", name: "JPMorgan US Quality", price: 52.56, changePercent: 0.56, volume: "0.4M", aum: "$4.2B", expenseRatio: 0.12, yield: 0.92, high52w: 54.0, low52w: 42.4, color: "#333333" },
    { symbol: "VFQY", name: "Vanguard US Quality", price: 128.42, changePercent: 0.72, volume: "0.2M", aum: "$0.8B", expenseRatio: 0.13, yield: 1.08, high52w: 132.0, low52w: 104.4, color: "#333333" },
  ],
  "low-vol": [
    { symbol: "USMV", name: "iShares MSCI USA Min Vol", price: 78.42, changePercent: 0.24, volume: "2.4M", aum: "$28B", expenseRatio: 0.15, yield: 1.68, high52w: 80.0, low52w: 68.4, color: "#333333" },
    { symbol: "SPLV", name: "Invesco S&P 500 Low Vol", price: 62.18, changePercent: 0.18, volume: "1.8M", aum: "$12B", expenseRatio: 0.25, yield: 2.12, high52w: 64.0, low52w: 54.4, color: "#333333" },
    { symbol: "SMMV", name: "iShares MSCI USA SmCap MinVol", price: 38.34, changePercent: 0.12, volume: "0.2M", aum: "$0.8B", expenseRatio: 0.20, yield: 1.42, high52w: 40.0, low52w: 32.4, color: "#333333" },
    { symbol: "LGLV", name: "SPDR SSGA US Large Cap LowVol", price: 148.56, changePercent: 0.28, volume: "0.1M", aum: "$0.4B", expenseRatio: 0.12, yield: 1.92, high52w: 152.0, low52w: 128.4, color: "#333333" },
    { symbol: "XMLV", name: "Invesco S&P MidCap Low Vol", price: 52.42, changePercent: 0.08, volume: "0.1M", aum: "$0.6B", expenseRatio: 0.25, yield: 1.82, high52w: 54.0, low52w: 44.4, color: "#333333" },
  ],
  leveraged: [
    { symbol: "TQQQ", name: "ProShares UltraPro QQQ", price: 58.42, changePercent: 3.72, volume: "82M", aum: "$22B", expenseRatio: 0.86, yield: null, high52w: 68.0, low52w: 32.4, color: "#FF4500" },
    { symbol: "UPRO", name: "ProShares UltraPro S&P", price: 68.18, changePercent: 2.34, volume: "18M", aum: "$4.2B", expenseRatio: 0.91, yield: null, high52w: 74.0, low52w: 38.4, color: "#FF4500" },
    { symbol: "SOXL", name: "Direxion Semiconductor 3X", price: 28.34, changePercent: 5.42, volume: "42M", aum: "$8.4B", expenseRatio: 0.76, yield: null, high52w: 38.0, low52w: 12.4, color: "#FF4500" },
    { symbol: "SPXL", name: "Direxion Daily S&P 500 3X", price: 142.56, changePercent: 2.28, volume: "4.2M", aum: "$3.8B", expenseRatio: 0.97, yield: null, high52w: 152.0, low52w: 82.4, color: "#FF4500" },
    { symbol: "TNA", name: "Direxion Small Cap 3X", price: 32.42, changePercent: -3.82, volume: "12M", aum: "$1.8B", expenseRatio: 1.06, yield: null, high52w: 42.0, low52w: 18.4, color: "#FF4500" },
  ],
};

function ExploreByStrategyWidget() {
  const [activeStrategy, setActiveStrategy] = useState<StrategyId>("active");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const etfs = strategyData[activeStrategy];

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => { const n = new Set(p); if (n.has(sym)) n.delete(sym); else n.add(sym); return n; });

  const sparklines = useMemo(
    () => etfs.reduce<Record<string, number[]>>((acc, e) => { acc[e.symbol] = makeSparkline(e.symbol, e.changePercent >= 0); return acc; }, {}),
    [etfs]
  );

  const columns = [
    { header: "ETF", align: "left" as const },
    { header: "Price ($)", align: "right" as const },
    { header: "Chg%", align: "right" as const },
    { header: "1D", align: "center" as const, minWidth: 64 },
    { header: "AUM", align: "right" as const, minWidth: 72 },
    { header: "Exp%", align: "right" as const, minWidth: 58 },
    { header: "Yield", align: "right" as const, minWidth: 58 },
    { header: "52W Range", align: "center" as const, minWidth: 110 },
    { header: "Watchlist", align: "center" as const, minWidth: 80 },
  ];

  const rows = etfs.map((etf) => [
    <div key="name" className="flex items-center gap-2.5"><div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" /><p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">{etf.name}</p></div>,
    <span key="price" className="whitespace-nowrap tabular-nums text-[14px] text-foreground">{etf.price.toFixed(1)}</span>,
    <span key="chg" className={cn("whitespace-nowrap tabular-nums text-[14px] font-semibold", etf.changePercent >= 0 ? "text-emerald-500" : "text-red-500")}>{etf.changePercent >= 0 ? "+" : ""}{etf.changePercent.toFixed(1)}%</span>,
    <div key="spark" className="flex justify-center"><Sparkline points={sparklines[etf.symbol]} color={etf.changePercent >= 0 ? "#10b981" : "#ef4444"} /></div>,
    <span key="aum" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.aum}</span>,
    <span key="exp" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.expenseRatio.toFixed(2)}%</span>,
    <span key="yield" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.yield != null ? `${etf.yield.toFixed(2)}%` : "\u2014"}</span>,
    <Range52W key="range" low={etf.low52w} high={etf.high52w} current={etf.price} />,
    <div key="watch" className="flex justify-center"><button onClick={() => toggleBookmark(etf.symbol)} className="transition-transform active:scale-90"><Bookmark size={20} strokeWidth={1.8} className={cn("transition-colors", bookmarks.has(etf.symbol) ? "fill-foreground text-foreground" : "text-muted-foreground/50")} /></button></div>,
  ]);

  return (
    <ScrollableTableWidget
      title="Explore by Strategy"
      description="Filter ETFs by how they invest — growth, value, dividends, low-volatility. Pick the approach first, ticker second."
      tabs={strategyTabs}
      activeTab={activeStrategy}
      onTabChange={(id) => setActiveStrategy(id as StrategyId)}
      pillLayoutId="etf-strategy-pill"
      columns={columns}
      rows={rows}
      scrollableMinWidth={620}
      animationKey={activeStrategy}
      footer={{ label: "View All" }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Most Efficient ETFs Widget                                         */
/* ------------------------------------------------------------------ */

type EfficiencyId = "ultra-low-cost" | "low-tracking-error";

const efficiencyTabs: { id: EfficiencyId; label: string }[] = [
  { id: "ultra-low-cost", label: "Ultra Low Cost" },
  { id: "low-tracking-error", label: "Low Tracking Error" },
];

const efficientETFs: Record<EfficiencyId, PopularETF[]> = {
  "ultra-low-cost": [
    { name: "Vanguard S&P 500", symbol: "VOO", return3y: 10.8, aum: "892B", expenseRatio: 0.03, trackingError: 0.01 },
    { name: "Vanguard Total Stock", symbol: "VTI", return3y: 9.6, aum: "384B", expenseRatio: 0.03, trackingError: 0.02 },
    { name: "iShares Core S&P 500", symbol: "IVV", return3y: 10.7, aum: "478B", expenseRatio: 0.03, trackingError: 0.01 },
    { name: "Schwab US Large-Cap", symbol: "SCHX", return3y: 10.4, aum: "42B", expenseRatio: 0.03, trackingError: 0.01 },
    { name: "Vanguard Total Bond", symbol: "BND", return3y: 1.2, aum: "108B", expenseRatio: 0.03, trackingError: 0.01 },
    { name: "Schwab US Broad Mkt", symbol: "SCHB", return3y: 9.8, aum: "28B", expenseRatio: 0.03, trackingError: 0.02 },
    { name: "Vanguard Growth", symbol: "VUG", return3y: 12.8, aum: "124B", expenseRatio: 0.04, trackingError: 0.03 },
    { name: "Vanguard Value", symbol: "VTV", return3y: 8.4, aum: "118B", expenseRatio: 0.04, trackingError: 0.02 },
  ],
  "low-tracking-error": [
    { name: "SPDR S&P 500", symbol: "SPY", return3y: 10.6, aum: "518B", expenseRatio: 0.09, trackingError: 0.01 },
    { name: "SPDR Gold Shares", symbol: "GLD", return3y: 8.2, aum: "58B", expenseRatio: 0.40, trackingError: 0.01 },
    { name: "iShares Core US Agg", symbol: "AGG", return3y: 1.4, aum: "98B", expenseRatio: 0.03, trackingError: 0.01 },
    { name: "iShares MSCI USA Min Vol", symbol: "USMV", return3y: 7.8, aum: "28B", expenseRatio: 0.15, trackingError: 0.01 },
    { name: "Vanguard Dividend Appr", symbol: "VIG", return3y: 9.4, aum: "82B", expenseRatio: 0.06, trackingError: 0.01 },
    { name: "iShares Core S&P Mid", symbol: "IJH", return3y: 7.6, aum: "78B", expenseRatio: 0.05, trackingError: 0.01 },
    { name: "Schwab US Dividend", symbol: "SCHD", return3y: 8.8, aum: "56B", expenseRatio: 0.06, trackingError: 0.01 },
    { name: "iShares Core S&P Small", symbol: "IJR", return3y: 6.2, aum: "82B", expenseRatio: 0.06, trackingError: 0.01 },
  ],
};

function MostEfficientETFsWidget() {
  const [activeTab, setActiveTab] = useState<EfficiencyId>("ultra-low-cost");
  const etfs = efficientETFs[activeTab];
  const row1 = etfs.slice(0, Math.ceil(etfs.length / 2));
  const row2 = etfs.slice(Math.ceil(etfs.length / 2));

  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight text-foreground">Most Efficient ETFs</h2>
      <p className="text-[13px] text-muted-foreground leading-snug mt-1 mb-3">
        Lowest fees, tightest tracking. Two ETFs holding the same thing aren&apos;t equal — costs compound over decades.
      </p>

      <div className="flex gap-2 mb-4">
        {efficiencyTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-3.5 py-2 text-[14px] font-semibold transition-colors",
              activeTab === tab.id ? "bg-foreground text-background" : "text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex flex-col gap-3 px-5" style={{ width: "max-content" }}>
          <div className="flex gap-3">
            {row1.map((etf) => (
              <ETFCardLadder
                key={etf.symbol}
                etf={popularETFToCardData(etf)}
                className="shrink-0 w-[280px]"
              />
            ))}
          </div>
          <div className="flex gap-3">
            {row2.map((etf) => (
              <ETFCardLadder
                key={etf.symbol}
                etf={popularETFToCardData(etf)}
                className="shrink-0 w-[280px]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ETFFundedNotTraded() {
  return (
    <div className="space-y-14 px-5 pt-5 pb-4">
      <PromoBanner />
      <PopularETFsWidget />
      <TopMoversWidget />
      <ExploreByThemesWidget />
      <ExploreByAssetClassWidget />
      <HeatmapWidget />
      <ExploreByStrategyWidget />
      <MostEfficientETFsWidget />
    </div>
  );
}
