"use client";

import { useState, useMemo } from "react";
import { EarningsCalendar } from "@/app/market/components/earnings-calendar";
import { DividendCalendar } from "@/app/market/components/dividend-calendar";
import { useTheme } from "@/components/theme-provider";
import {
  Bookmark,
  Brain,
  Zap,
  Coins,
  Layers,
  TrendingUp,
  ArrowUpDown,
  ChevronRight,
  Target,
  Plus,
  ArrowDown,
  BarChart3,
  Gem,
  Rocket,
  Maximize2,
  Play,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StoriesViewer, type Story } from "@/components/stories-viewer";
// pills used instead of shadcn Tabs

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CapSize = "mega" | "large" | "midcap" | "small";
type MoverType = "gainers" | "losers" | "most-active" | "near-52w-high" | "near-52w-low";

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
  revGrowth: number;
  profitGrowth: number;
  rating: "Buy" | "Sell" | "Hold";
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
  // 52 points ≈ weekly over 1 year
  for (let i = 0; i < 52; i++) {
    const r = (Math.sin(seed + i * 127) + 1) / 2;
    v += (r - 0.5 + (isGainer ? 0.12 : -0.12)) * 4;
    v = Math.max(8, Math.min(92, v));
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
/*  52W Range Bar                                                      */
/* ------------------------------------------------------------------ */

function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const range = high - low || 1;
  const pct = Math.max(0, Math.min(100, ((current - low) / range) * 100));

  return (
    <div className="flex items-baseline gap-1.5 w-full">
      <span className="text-[14px] tabular-nums text-muted-foreground whitespace-nowrap leading-none">
        {low.toFixed(0)}
      </span>
      <div className="relative flex-1 h-[3px] rounded-full bg-muted" style={{ marginBottom: 3 }}>
        <div
          className="absolute h-[12px] bg-foreground"
          style={{ left: `${pct}%`, width: 2, bottom: 0 }}
        />
      </div>
      <span className="text-[14px] tabular-nums text-muted-foreground whitespace-nowrap leading-none">
        {high.toFixed(0)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Rating Badge                                                       */
/* ------------------------------------------------------------------ */

function RatingBadge({ rating }: { rating: "Buy" | "Sell" | "Hold" }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-[14px] font-semibold whitespace-nowrap",
        rating === "Buy" && "bg-emerald-500/15 text-emerald-500",
        rating === "Sell" && "bg-red-500/15 text-red-500",
        rating === "Hold" && "bg-muted text-muted-foreground"
      )}
    >
      {rating}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const data: Record<MoverType, Record<CapSize, Stock[]>> = {
  gainers: {
    mega: [
      { symbol: "NVDA", name: "NVIDIA", price: 892.45, changePercent: 3.97, volume: "52.3M", marketCap: "$2.2T", pe: 68, high52w: 974.0, low52w: 392.3, color: "#76B900", revGrowth: 122.4, profitGrowth: 581.3, rating: "Buy" },
      { symbol: "META", name: "Meta Platforms", price: 523.8, changePercent: 3.69, volume: "28.1M", marketCap: "$1.3T", pe: 34, high52w: 542.8, low52w: 296.4, color: "#0668E1", revGrowth: 24.7, profitGrowth: 69.3, rating: "Buy" },
      { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, volume: "45.7M", marketCap: "$1.9T", pe: 59, high52w: 191.7, low52w: 118.4, color: "#FF9900", revGrowth: 12.5, profitGrowth: 229.1, rating: "Buy" },
      { symbol: "MSFT", name: "Microsoft", price: 428.15, changePercent: 2.71, volume: "22.4M", marketCap: "$3.2T", pe: 37, high52w: 433.0, low52w: 309.5, color: "#00A4EF", revGrowth: 17.6, profitGrowth: 33.2, rating: "Buy" },
      { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, volume: "38.9M", marketCap: "$3.0T", pe: 31, high52w: 199.6, low52w: 164.1, color: "#555555", revGrowth: 2.1, profitGrowth: 10.7, rating: "Buy" },
    ],
    large: [
      { symbol: "PLTR", name: "Palantir", price: 24.85, changePercent: 12.34, volume: "98.2M", marketCap: "$54B", pe: 242, high52w: 27.5, low52w: 13.7, color: "#1D1D1D", revGrowth: 17.7, profitGrowth: 32.1, rating: "Buy" },
      { symbol: "COIN", name: "Coinbase", price: 178.42, changePercent: 9.6, volume: "14.3M", marketCap: "$42B", pe: 45, high52w: 185.7, low52w: 78.4, color: "#0052FF", revGrowth: 101.4, profitGrowth: 285.0, rating: "Buy" },
      { symbol: "SHOP", name: "Shopify", price: 78.35, changePercent: 7.43, volume: "18.7M", marketCap: "$98B", pe: 82, high52w: 81.3, low52w: 45.5, color: "#96BF48", revGrowth: 26.1, profitGrowth: 140.8, rating: "Buy" },
      { symbol: "SQ", name: "Block Inc", price: 72.18, changePercent: 6.22, volume: "12.5M", marketCap: "$43B", pe: 57, high52w: 78.2, low52w: 39.8, color: "#3E4348", revGrowth: 24.5, profitGrowth: 88.2, rating: "Hold" },
      { symbol: "ABNB", name: "Airbnb", price: 156.73, changePercent: 5.46, volume: "8.9M", marketCap: "$98B", pe: 39, high52w: 170.1, low52w: 110.4, color: "#FF5A5F", revGrowth: 18.3, profitGrowth: 55.7, rating: "Buy" },
    ],
    midcap: [
      { symbol: "CRWD", name: "CrowdStrike", price: 312.8, changePercent: 4.2, volume: "8.4M", marketCap: "$72B", pe: 720, high52w: 365.0, low52w: 135.0, color: "#E11D48", revGrowth: 36.4, profitGrowth: 120.5, rating: "Buy" },
      { symbol: "DDOG", name: "Datadog", price: 124.6, changePercent: 3.1, volume: "6.2M", marketCap: "$39B", pe: 320, high52w: 135.5, low52w: 75.0, color: "#7C3AED", revGrowth: 26.8, profitGrowth: 45.2, rating: "Buy" },
      { symbol: "ZS", name: "Zscaler", price: 218.4, changePercent: 2.7, volume: "3.8M", marketCap: "$31B", pe: 520, high52w: 259.6, low52w: 140.0, color: "#0EA5E9", revGrowth: 34.8, profitGrowth: 88.1, rating: "Buy" },
      { symbol: "HUBS", name: "HubSpot", price: 582.4, changePercent: 2.4, volume: "1.2M", marketCap: "$30B", pe: 480, high52w: 668.2, low52w: 392.1, color: "#FF7A59", revGrowth: 23.1, profitGrowth: 72.4, rating: "Buy" },
      { symbol: "VEEV", name: "Veeva Systems", price: 198.5, changePercent: 1.9, volume: "2.1M", marketCap: "$32B", pe: 56, high52w: 235.4, low52w: 155.8, color: "#FF6B00", revGrowth: 12.8, profitGrowth: 28.6, rating: "Hold" },
    ],
    small: [
      { symbol: "IONQ", name: "IonQ", price: 12.45, changePercent: 21.24, volume: "42.1M", marketCap: "$2.7B", pe: null, high52w: 15.3, low52w: 5.2, color: "#7C3AED", revGrowth: 89.5, profitGrowth: -42.1, rating: "Hold" },
      { symbol: "SMCI", name: "Super Micro", price: 28.73, changePercent: 15.81, volume: "35.6M", marketCap: "$15B", pe: 12, high52w: 122.9, low52w: 17.3, color: "#0071C5", revGrowth: 110.2, profitGrowth: 88.4, rating: "Buy" },
      { symbol: "SOUN", name: "SoundHound", price: 5.42, changePercent: 14.35, volume: "28.4M", marketCap: "$1.8B", pe: null, high52w: 10.3, low52w: 1.5, color: "#8B5CF6", revGrowth: 52.3, profitGrowth: -68.4, rating: "Hold" },
      { symbol: "JOBY", name: "Joby Aviation", price: 6.78, changePercent: 12.07, volume: "15.8M", marketCap: "$4.5B", pe: null, high52w: 8.4, low52w: 3.7, color: "#14B8A6", revGrowth: -100.0, profitGrowth: -100.0, rating: "Hold" },
      { symbol: "MARA", name: "Marathon Digi", price: 18.92, changePercent: 10.84, volume: "22.3M", marketCap: "$5.6B", pe: 25, high52w: 31.4, low52w: 8.4, color: "#F59E0B", revGrowth: 229.0, profitGrowth: 350.2, rating: "Buy" },
    ],
  },
  losers: {
    mega: [
      { symbol: "TSLA", name: "Tesla", price: 178.24, changePercent: -6.48, volume: "112.4M", marketCap: "$568B", pe: 48, high52w: 299.3, low52w: 152.4, color: "#CC0000", revGrowth: 8.5, profitGrowth: -23.1, rating: "Sell" },
      { symbol: "GOOGL", name: "Alphabet", price: 152.67, changePercent: -3.68, volume: "32.8M", marketCap: "$1.9T", pe: 27, high52w: 174.7, low52w: 120.2, color: "#4285F4", revGrowth: 13.6, profitGrowth: 31.4, rating: "Buy" },
      { symbol: "BRK.B", name: "Berkshire", price: 412.5, changePercent: -2.12, volume: "4.2M", marketCap: "$882B", pe: 11, high52w: 445.2, low52w: 344.6, color: "#3E2F84", revGrowth: 20.8, profitGrowth: 42.1, rating: "Hold" },
      { symbol: "JPM", name: "JPMorgan", price: 198.73, changePercent: -1.71, volume: "9.8M", marketCap: "$572B", pe: 12, high52w: 210.5, low52w: 162.4, color: "#003087", revGrowth: 9.4, profitGrowth: 25.3, rating: "Buy" },
      { symbol: "V", name: "Visa", price: 285.6, changePercent: -1.42, volume: "7.1M", marketCap: "$588B", pe: 32, high52w: 296.4, low52w: 248.7, color: "#1A1F71", revGrowth: 10.2, profitGrowth: 17.4, rating: "Buy" },
    ],
    large: [
      { symbol: "SNAP", name: "Snap Inc", price: 11.24, changePercent: -14.27, volume: "45.2M", marketCap: "$18B", pe: null, high52w: 17.9, low52w: 8.3, color: "#EAAB00", revGrowth: 5.1, profitGrowth: -12.4, rating: "Hold" },
      { symbol: "RIVN", name: "Rivian", price: 15.63, changePercent: -8.33, volume: "38.7M", marketCap: "$16B", pe: null, high52w: 28.1, low52w: 8.3, color: "#2D6A4F", revGrowth: 167.4, profitGrowth: -45.2, rating: "Hold" },
      { symbol: "HOOD", name: "Robinhood", price: 18.45, changePercent: -6.25, volume: "22.1M", marketCap: "$16B", pe: 62, high52w: 23.8, low52w: 7.9, color: "#00C805", revGrowth: 29.4, profitGrowth: 120.8, rating: "Hold" },
      { symbol: "LYFT", name: "Lyft", price: 14.82, changePercent: -5.54, volume: "16.8M", marketCap: "$5.8B", pe: null, high52w: 20.8, low52w: 8.9, color: "#EA39E8", revGrowth: 3.2, profitGrowth: -88.4, rating: "Sell" },
      { symbol: "DKNG", name: "DraftKings", price: 35.67, changePercent: -4.75, volume: "12.4M", marketCap: "$34B", pe: null, high52w: 49.6, low52w: 26.2, color: "#61B729", revGrowth: 44.2, profitGrowth: 62.1, rating: "Hold" },
    ],
    midcap: [
      { symbol: "SNAP", name: "Snap Inc", price: 11.24, changePercent: -5.8, volume: "45.2M", marketCap: "$18B", pe: null, high52w: 17.9, low52w: 8.3, color: "#EAAB00", revGrowth: 5.1, profitGrowth: -12.4, rating: "Hold" },
      { symbol: "ROKU", name: "Roku", price: 62.4, changePercent: -4.5, volume: "8.1M", marketCap: "$9B", pe: null, high52w: 106.8, low52w: 51.2, color: "#6C3A97", revGrowth: 14.2, profitGrowth: -35.6, rating: "Hold" },
      { symbol: "PINS", name: "Pinterest", price: 28.6, changePercent: -3.8, volume: "12.4M", marketCap: "$19B", pe: 42, high52w: 40.2, low52w: 22.8, color: "#E60023", revGrowth: 11.8, profitGrowth: -8.4, rating: "Hold" },
      { symbol: "BILL", name: "BILL Holdings", price: 58.2, changePercent: -3.2, volume: "4.2M", marketCap: "$6.2B", pe: null, high52w: 88.5, low52w: 44.3, color: "#00C4CC", revGrowth: -4.2, profitGrowth: -68.5, rating: "Sell" },
      { symbol: "OKTA", name: "Okta", price: 88.4, changePercent: -2.9, volume: "5.8M", marketCap: "$15B", pe: null, high52w: 115.2, low52w: 65.8, color: "#007DC1", revGrowth: 18.4, profitGrowth: 42.1, rating: "Hold" },
    ],
    small: [
      { symbol: "WKHS", name: "Workhorse", price: 1.23, changePercent: -20.65, volume: "18.9M", marketCap: "$245M", pe: null, high52w: 3.8, low52w: 0.4, color: "#E97C37", revGrowth: -72.4, profitGrowth: -180.5, rating: "Sell" },
      { symbol: "SPCE", name: "Virgin Galactic", price: 2.45, changePercent: -15.52, volume: "24.6M", marketCap: "$712M", pe: null, high52w: 5.6, low52w: 0.9, color: "#0ABAB5", revGrowth: -95.4, profitGrowth: -210.3, rating: "Sell" },
      { symbol: "NKLA", name: "Nikola", price: 0.87, changePercent: -12.12, volume: "32.1M", marketCap: "$418M", pe: null, high52w: 2.8, low52w: 0.5, color: "#2563EB", revGrowth: -42.1, profitGrowth: -150.2, rating: "Sell" },
      { symbol: "MVST", name: "Microvast", price: 1.56, changePercent: -10.34, volume: "8.4M", marketCap: "$478M", pe: null, high52w: 3.1, low52w: 0.8, color: "#DC2626", revGrowth: 12.4, profitGrowth: -88.2, rating: "Sell" },
      { symbol: "QS", name: "QuantumScape", price: 6.78, changePercent: -8.99, volume: "11.2M", marketCap: "$3.2B", pe: null, high52w: 11.6, low52w: 4.0, color: "#0EA5E9", revGrowth: -100.0, profitGrowth: -100.0, rating: "Hold" },
    ],
  },
  "most-active": {
    mega: [
      { symbol: "TSLA", name: "Tesla", price: 178.24, changePercent: -6.48, volume: "112.4M", marketCap: "$568B", pe: 48, high52w: 299.3, low52w: 152.4, color: "#CC0000", revGrowth: 8.5, profitGrowth: -23.1, rating: "Sell" },
      { symbol: "NVDA", name: "NVIDIA", price: 892.45, changePercent: 3.97, volume: "52.3M", marketCap: "$2.2T", pe: 68, high52w: 974.0, low52w: 392.3, color: "#76B900", revGrowth: 122.4, profitGrowth: 581.3, rating: "Buy" },
      { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, volume: "45.7M", marketCap: "$1.9T", pe: 59, high52w: 191.7, low52w: 118.4, color: "#FF9900", revGrowth: 12.5, profitGrowth: 229.1, rating: "Buy" },
      { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, volume: "38.9M", marketCap: "$3.0T", pe: 31, high52w: 199.6, low52w: 164.1, color: "#555555", revGrowth: 2.1, profitGrowth: 10.7, rating: "Buy" },
      { symbol: "GOOGL", name: "Alphabet", price: 152.67, changePercent: -3.68, volume: "32.8M", marketCap: "$1.9T", pe: 27, high52w: 174.7, low52w: 120.2, color: "#4285F4", revGrowth: 13.6, profitGrowth: 31.4, rating: "Buy" },
    ],
    large: [
      { symbol: "PLTR", name: "Palantir", price: 24.85, changePercent: 12.34, volume: "98.2M", marketCap: "$54B", pe: 242, high52w: 27.5, low52w: 13.7, color: "#1D1D1D", revGrowth: 17.7, profitGrowth: 32.1, rating: "Buy" },
      { symbol: "SNAP", name: "Snap Inc", price: 11.24, changePercent: -14.27, volume: "45.2M", marketCap: "$18B", pe: null, high52w: 17.9, low52w: 8.3, color: "#EAAB00", revGrowth: 5.1, profitGrowth: -12.4, rating: "Hold" },
      { symbol: "RIVN", name: "Rivian", price: 15.63, changePercent: -8.33, volume: "38.7M", marketCap: "$16B", pe: null, high52w: 28.1, low52w: 8.3, color: "#2D6A4F", revGrowth: 167.4, profitGrowth: -45.2, rating: "Hold" },
      { symbol: "HOOD", name: "Robinhood", price: 18.45, changePercent: -6.25, volume: "22.1M", marketCap: "$16B", pe: 62, high52w: 23.8, low52w: 7.9, color: "#00C805", revGrowth: 29.4, profitGrowth: 120.8, rating: "Hold" },
      { symbol: "COIN", name: "Coinbase", price: 178.42, changePercent: 9.6, volume: "14.3M", marketCap: "$42B", pe: 45, high52w: 185.7, low52w: 78.4, color: "#0052FF", revGrowth: 101.4, profitGrowth: 285.0, rating: "Buy" },
    ],
    midcap: [
      { symbol: "SOUN", name: "SoundHound", price: 5.42, changePercent: 14.35, volume: "28.4M", marketCap: "$1.8B", pe: null, high52w: 10.3, low52w: 1.5, color: "#8B5CF6", revGrowth: 52.3, profitGrowth: -68.4, rating: "Hold" },
      { symbol: "PINS", name: "Pinterest", price: 28.6, changePercent: -3.8, volume: "12.4M", marketCap: "$19B", pe: 42, high52w: 40.2, low52w: 22.8, color: "#E60023", revGrowth: 11.8, profitGrowth: -8.4, rating: "Hold" },
      { symbol: "CRWD", name: "CrowdStrike", price: 312.8, changePercent: 4.2, volume: "8.4M", marketCap: "$72B", pe: 720, high52w: 365.0, low52w: 135.0, color: "#E11D48", revGrowth: 36.4, profitGrowth: 120.5, rating: "Buy" },
      { symbol: "ROKU", name: "Roku", price: 62.4, changePercent: -4.5, volume: "8.1M", marketCap: "$9B", pe: null, high52w: 106.8, low52w: 51.2, color: "#6C3A97", revGrowth: 14.2, profitGrowth: -35.6, rating: "Hold" },
      { symbol: "DDOG", name: "Datadog", price: 124.6, changePercent: 3.1, volume: "6.2M", marketCap: "$39B", pe: 320, high52w: 135.5, low52w: 75.0, color: "#7C3AED", revGrowth: 26.8, profitGrowth: 45.2, rating: "Buy" },
    ],
    small: [
      { symbol: "IONQ", name: "IonQ", price: 12.45, changePercent: 21.24, volume: "42.1M", marketCap: "$2.7B", pe: null, high52w: 15.3, low52w: 5.2, color: "#7C3AED", revGrowth: 89.5, profitGrowth: -42.1, rating: "Hold" },
      { symbol: "NKLA", name: "Nikola", price: 0.87, changePercent: -12.12, volume: "32.1M", marketCap: "$418M", pe: null, high52w: 2.8, low52w: 0.5, color: "#2563EB", revGrowth: -42.1, profitGrowth: -150.2, rating: "Sell" },
      { symbol: "MARA", name: "Marathon Digi", price: 18.92, changePercent: 10.84, volume: "22.3M", marketCap: "$5.6B", pe: 25, high52w: 31.4, low52w: 8.4, color: "#F59E0B", revGrowth: 229.0, profitGrowth: 350.2, rating: "Buy" },
      { symbol: "WKHS", name: "Workhorse", price: 1.23, changePercent: -20.65, volume: "18.9M", marketCap: "$245M", pe: null, high52w: 3.8, low52w: 0.4, color: "#E97C37", revGrowth: -72.4, profitGrowth: -180.5, rating: "Sell" },
      { symbol: "SMCI", name: "Super Micro", price: 28.73, changePercent: 15.81, volume: "15.6M", marketCap: "$15B", pe: 12, high52w: 122.9, low52w: 17.3, color: "#0071C5", revGrowth: 110.2, profitGrowth: 88.4, rating: "Buy" },
    ],
  },
  "near-52w-high": {
    mega: [
      { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, volume: "38.9M", marketCap: "$3.0T", pe: 31, high52w: 199.6, low52w: 164.1, color: "#555555", revGrowth: 2.1, profitGrowth: 10.7, rating: "Buy" },
      { symbol: "MSFT", name: "Microsoft", price: 428.15, changePercent: 2.71, volume: "22.4M", marketCap: "$3.2T", pe: 37, high52w: 433.0, low52w: 309.5, color: "#00A4EF", revGrowth: 17.6, profitGrowth: 33.2, rating: "Buy" },
      { symbol: "META", name: "Meta Platforms", price: 523.8, changePercent: 3.69, volume: "28.1M", marketCap: "$1.3T", pe: 34, high52w: 542.8, low52w: 296.4, color: "#0668E1", revGrowth: 24.7, profitGrowth: 69.3, rating: "Buy" },
      { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, volume: "45.7M", marketCap: "$1.9T", pe: 59, high52w: 191.7, low52w: 118.4, color: "#FF9900", revGrowth: 12.5, profitGrowth: 229.1, rating: "Buy" },
      { symbol: "JPM", name: "JPMorgan", price: 208.3, changePercent: 1.42, volume: "9.8M", marketCap: "$600B", pe: 12, high52w: 211.5, low52w: 162.4, color: "#003087", revGrowth: 9.4, profitGrowth: 25.3, rating: "Buy" },
    ],
    large: [
      { symbol: "COIN", name: "Coinbase", price: 178.42, changePercent: 9.6, volume: "14.3M", marketCap: "$42B", pe: 45, high52w: 185.7, low52w: 78.4, color: "#0052FF", revGrowth: 101.4, profitGrowth: 285.0, rating: "Buy" },
      { symbol: "SHOP", name: "Shopify", price: 78.35, changePercent: 7.43, volume: "18.7M", marketCap: "$98B", pe: 82, high52w: 81.3, low52w: 45.5, color: "#96BF48", revGrowth: 26.1, profitGrowth: 140.8, rating: "Buy" },
      { symbol: "PLTR", name: "Palantir", price: 26.48, changePercent: 3.2, volume: "98.2M", marketCap: "$54B", pe: 242, high52w: 27.5, low52w: 13.7, color: "#1D1D1D", revGrowth: 17.7, profitGrowth: 32.1, rating: "Buy" },
      { symbol: "ABNB", name: "Airbnb", price: 162.3, changePercent: 2.8, volume: "8.9M", marketCap: "$98B", pe: 39, high52w: 170.1, low52w: 110.4, color: "#FF5A5F", revGrowth: 18.3, profitGrowth: 55.7, rating: "Buy" },
      { symbol: "UBER", name: "Uber", price: 71.4, changePercent: 1.9, volume: "11.2M", marketCap: "$151B", pe: 38, high52w: 74.8, low52w: 46.2, color: "#000000", revGrowth: 16.2, profitGrowth: 82.5, rating: "Buy" },
    ],
    midcap: [
      { symbol: "CRWD", name: "CrowdStrike", price: 348.2, changePercent: 2.1, volume: "8.4M", marketCap: "$72B", pe: 720, high52w: 365.0, low52w: 135.0, color: "#E11D48", revGrowth: 36.4, profitGrowth: 120.5, rating: "Buy" },
      { symbol: "DDOG", name: "Datadog", price: 129.8, changePercent: 1.8, volume: "6.2M", marketCap: "$39B", pe: 320, high52w: 135.5, low52w: 75.0, color: "#7C3AED", revGrowth: 26.8, profitGrowth: 45.2, rating: "Buy" },
      { symbol: "HUBS", name: "HubSpot", price: 642.8, changePercent: 1.4, volume: "1.2M", marketCap: "$30B", pe: 480, high52w: 668.2, low52w: 392.1, color: "#FF7A59", revGrowth: 23.1, profitGrowth: 72.4, rating: "Buy" },
      { symbol: "APP", name: "AppLovin", price: 91.4, changePercent: 3.8, volume: "4.2M", marketCap: "$31B", pe: 48, high52w: 94.8, low52w: 28.5, color: "#FF5500", revGrowth: 44.2, profitGrowth: 132.5, rating: "Buy" },
      { symbol: "MELI", name: "MercadoLibre", price: 1842.5, changePercent: 1.2, volume: "0.9M", marketCap: "$93B", pe: 82, high52w: 1890.0, low52w: 1142.4, color: "#FFE600", revGrowth: 36.8, profitGrowth: 94.2, rating: "Buy" },
    ],
    small: [
      { symbol: "IONQ", name: "IonQ", price: 14.62, changePercent: 5.2, volume: "42.1M", marketCap: "$2.7B", pe: null, high52w: 15.3, low52w: 5.2, color: "#7C3AED", revGrowth: 89.5, profitGrowth: -42.1, rating: "Hold" },
      { symbol: "MARA", name: "Marathon Digi", price: 30.1, changePercent: 4.8, volume: "22.3M", marketCap: "$5.6B", pe: 25, high52w: 31.4, low52w: 8.4, color: "#F59E0B", revGrowth: 229.0, profitGrowth: 350.2, rating: "Buy" },
      { symbol: "SMCI", name: "Super Micro", price: 117.4, changePercent: 3.2, volume: "35.6M", marketCap: "$15B", pe: 12, high52w: 122.9, low52w: 17.3, color: "#0071C5", revGrowth: 110.2, profitGrowth: 88.4, rating: "Buy" },
      { symbol: "RKLB", name: "Rocket Lab", price: 7.82, changePercent: 2.1, volume: "12.4M", marketCap: "$3.9B", pe: null, high52w: 8.15, low52w: 3.12, color: "#FF4400", revGrowth: 68.4, profitGrowth: -82.1, rating: "Buy" },
      { symbol: "AI", name: "C3.ai", price: 28.6, changePercent: 2.8, volume: "8.4M", marketCap: "$3.6B", pe: null, high52w: 29.8, low52w: 16.2, color: "#0052CC", revGrowth: 22.8, profitGrowth: -45.2, rating: "Hold" },
    ],
  },
  "near-52w-low": {
    mega: [
      { symbol: "TSLA", name: "Tesla", price: 158.7, changePercent: -2.8, volume: "112.4M", marketCap: "$505B", pe: 42, high52w: 299.3, low52w: 152.4, color: "#CC0000", revGrowth: 8.5, profitGrowth: -23.1, rating: "Sell" },
      { symbol: "GOOGL", name: "Alphabet", price: 124.8, changePercent: -1.9, volume: "32.8M", marketCap: "$1.56T", pe: 22, high52w: 174.7, low52w: 120.2, color: "#4285F4", revGrowth: 13.6, profitGrowth: 31.4, rating: "Buy" },
      { symbol: "V", name: "Visa", price: 254.2, changePercent: -1.4, volume: "7.1M", marketCap: "$524B", pe: 28, high52w: 296.4, low52w: 248.7, color: "#1A1F71", revGrowth: 10.2, profitGrowth: 17.4, rating: "Buy" },
      { symbol: "WMT", name: "Walmart", price: 58.9, changePercent: -0.9, volume: "14.2M", marketCap: "$474B", pe: 32, high52w: 84.2, low52w: 57.1, color: "#0071CE", revGrowth: 5.8, profitGrowth: 12.4, rating: "Hold" },
      { symbol: "XOM", name: "ExxonMobil", price: 104.2, changePercent: -1.2, volume: "18.6M", marketCap: "$422B", pe: 14, high52w: 123.8, low52w: 101.2, color: "#FF0000", revGrowth: -4.2, profitGrowth: -18.4, rating: "Hold" },
    ],
    large: [
      { symbol: "RIVN", name: "Rivian", price: 8.82, changePercent: -3.4, volume: "38.7M", marketCap: "$9.1B", pe: null, high52w: 28.1, low52w: 8.3, color: "#2D6A4F", revGrowth: 167.4, profitGrowth: -45.2, rating: "Hold" },
      { symbol: "SNAP", name: "Snap Inc", price: 8.72, changePercent: -4.2, volume: "45.2M", marketCap: "$13.8B", pe: null, high52w: 17.9, low52w: 8.3, color: "#EAAB00", revGrowth: 5.1, profitGrowth: -12.4, rating: "Hold" },
      { symbol: "LYFT", name: "Lyft", price: 9.32, changePercent: -2.8, volume: "16.8M", marketCap: "$3.6B", pe: null, high52w: 20.8, low52w: 8.9, color: "#EA39E8", revGrowth: 3.2, profitGrowth: -88.4, rating: "Sell" },
      { symbol: "HOOD", name: "Robinhood", price: 8.42, changePercent: -2.4, volume: "22.1M", marketCap: "$7.2B", pe: null, high52w: 23.8, low52w: 7.9, color: "#00C805", revGrowth: 29.4, profitGrowth: 120.8, rating: "Hold" },
      { symbol: "LCID", name: "Lucid Group", price: 3.28, changePercent: -3.1, volume: "22.4M", marketCap: "$7.2B", pe: null, high52w: 7.82, low52w: 3.12, color: "#00A3CC", revGrowth: 218.4, profitGrowth: -182.4, rating: "Sell" },
    ],
    midcap: [
      { symbol: "ROKU", name: "Roku", price: 53.8, changePercent: -3.2, volume: "8.1M", marketCap: "$7.8B", pe: null, high52w: 106.8, low52w: 51.2, color: "#6C3A97", revGrowth: 14.2, profitGrowth: -35.6, rating: "Hold" },
      { symbol: "BILL", name: "BILL Holdings", price: 46.4, changePercent: -2.8, volume: "4.2M", marketCap: "$4.9B", pe: null, high52w: 88.5, low52w: 44.3, color: "#00C4CC", revGrowth: -4.2, profitGrowth: -68.5, rating: "Sell" },
      { symbol: "PINS", name: "Pinterest", price: 23.9, changePercent: -2.2, volume: "12.4M", marketCap: "$16B", pe: 35, high52w: 40.2, low52w: 22.8, color: "#E60023", revGrowth: 11.8, profitGrowth: -8.4, rating: "Hold" },
      { symbol: "OKTA", name: "Okta", price: 68.4, changePercent: -1.8, volume: "5.8M", marketCap: "$11.6B", pe: null, high52w: 115.2, low52w: 65.8, color: "#007DC1", revGrowth: 18.4, profitGrowth: 42.1, rating: "Hold" },
      { symbol: "U", name: "Unity Software", price: 22.4, changePercent: -2.4, volume: "9.2M", marketCap: "$7.8B", pe: null, high52w: 48.6, low52w: 21.4, color: "#000000", revGrowth: -8.4, profitGrowth: -112.4, rating: "Sell" },
    ],
    small: [
      { symbol: "WKHS", name: "Workhorse", price: 0.42, changePercent: -8.7, volume: "18.9M", marketCap: "$84M", pe: null, high52w: 3.8, low52w: 0.4, color: "#E97C37", revGrowth: -72.4, profitGrowth: -180.5, rating: "Sell" },
      { symbol: "SPCE", name: "Virgin Galactic", price: 0.96, changePercent: -6.2, volume: "24.6M", marketCap: "$279M", pe: null, high52w: 5.6, low52w: 0.9, color: "#0ABAB5", revGrowth: -95.4, profitGrowth: -210.3, rating: "Sell" },
      { symbol: "NKLA", name: "Nikola", price: 0.54, changePercent: -5.8, volume: "32.1M", marketCap: "$260M", pe: null, high52w: 2.8, low52w: 0.5, color: "#2563EB", revGrowth: -42.1, profitGrowth: -150.2, rating: "Sell" },
      { symbol: "MVST", name: "Microvast", price: 0.85, changePercent: -4.8, volume: "8.4M", marketCap: "$260M", pe: null, high52w: 3.1, low52w: 0.8, color: "#DC2626", revGrowth: 12.4, profitGrowth: -88.2, rating: "Sell" },
      { symbol: "QS", name: "QuantumScape", price: 4.22, changePercent: -3.8, volume: "11.2M", marketCap: "$2.0B", pe: null, high52w: 11.6, low52w: 4.0, color: "#0EA5E9", revGrowth: -100.0, profitGrowth: -100.0, rating: "Hold" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Cap-size cycle config                                              */
/* ------------------------------------------------------------------ */

const capOrder: CapSize[] = ["mega", "large", "midcap", "small"];
const capLabels: Record<CapSize, string> = {
  mega: "Mega Cap",
  large: "Large Cap",
  midcap: "Mid Cap",
  small: "Small Cap",
};

const moverTabs: { id: MoverType; label: string }[] = [
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "most-active", label: "Most Active" },
  { id: "near-52w-high", label: "Near 52W High" },
  { id: "near-52w-low", label: "Near 52W Low" },
];

/* ------------------------------------------------------------------ */
/*  Top Movers Widget                                                  */
/* ------------------------------------------------------------------ */

function TopMoversWidget() {
  const [moverType, setMoverType] = useState<MoverType>("gainers");
  const [capSize, setCapSize] = useState<CapSize>("mega");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const stocks = data[moverType][capSize];
  const isGainersLosers = moverType === "gainers" || moverType === "losers";
  const isGainer = moverType === "gainers";
  const sparkColor = moverType === "gainers" ? "#10b981" : moverType === "losers" ? "#ef4444" : "#6366f1";
  const showRating = isGainersLosers && (capSize === "mega" || capSize === "large");

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
      if (n.has(sym)) n.delete(sym); else n.add(sym);
      return n;
    });

  const cycleCapSize = () =>
    setCapSize((p) => capOrder[(capOrder.indexOf(p) + 1) % capOrder.length]);

  const thCls = "px-3 text-[14px] font-medium text-muted-foreground";
  // 2 visible cols: (viewport − padding − border − frozenCol − watchCol) / 2
  const colW = "w-[calc((min(430px,100vw)-40px-196px-48px)/2)]";

  return (
    <div>
      {/* Title row: title + cap-size flipper inline */}
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-[18px] font-bold tracking-tight">
          What&apos;s Moving
        </h2>
        <button
          onClick={cycleCapSize}
          className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border/60 px-3.5 py-2 text-[13px] font-semibold text-foreground transition-all"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={capSize}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {capLabels[capSize]}
            </motion.span>
          </AnimatePresence>
          <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />
        </button>
      </div>

      {/* Mover-type tabs — scrollable pills */}
      <div className="-mx-5 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-5 py-0.5">
          {moverTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMoverType(tab.id)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors",
                moverType === tab.id
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden pt-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${moverType}-${capSize}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            {/* ---- Frozen left column: name only ---- */}
            <div className="z-10 w-[196px] flex-shrink-0 border-r border-border/20 bg-card">
              <div className="flex h-[40px] items-center pl-5 text-[14px] font-medium text-muted-foreground">Stock</div>
              {stocks.map((stock) => (
                <div key={stock.symbol} className="flex h-[64px] items-center gap-2.5 pl-5 pr-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted" />
                  <p className="min-w-0 truncate text-[14px] font-bold leading-tight text-foreground">{stock.name}</p>
                </div>
              ))}
            </div>

            {/* ---- Scrollable right columns (first 2 visible by default) ---- */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table className="w-full" style={{ minWidth: isGainersLosers ? 780 : 560 }}>
                <thead>
                  <tr className="h-[40px]">

                    {isGainersLosers && (<>
                      <th className={cn(thCls, colW, "text-right")}>Price</th>
                      <th className={cn(thCls, colW, "text-right")}>
                        <span className="inline-flex items-center justify-end gap-1">
                          <ArrowDown size={10} className="text-foreground" />Chg%
                        </span>
                      </th>
                      <th className={cn(thCls, "min-w-[64px] text-center")}>1Y</th>
                      <th className={cn(thCls, "min-w-[48px] text-right")}>PE</th>
                      <th className={cn(thCls, "min-w-[68px] text-right")}>M.Cap</th>
                      <th className={cn(thCls, "min-w-[74px] text-right")}>Rev Gr.</th>
                      <th className={cn(thCls, "min-w-[80px] text-right")}>Profit Gr.</th>
                      <th className={cn(thCls, "min-w-[136px] text-center")}>1Y Range</th>
                      {showRating && <th className={cn(thCls, "min-w-[60px] text-center")}>Rating</th>}
                    </>)}

                    {moverType === "most-active" && (<>
                      <th className={cn(thCls, colW, "text-right")}>Volume</th>
                      <th className={cn(thCls, colW, "text-right")}>Price</th>
                      <th className={cn(thCls, "min-w-[72px] text-right")}>Chg%</th>
                      <th className={cn(thCls, "min-w-[64px] text-center")}>1Y</th>
                      <th className={cn(thCls, "min-w-[68px] text-right")}>M.Cap</th>
                      <th className={cn(thCls, "min-w-[48px] text-right")}>PE</th>
                    </>)}

                    {moverType === "near-52w-high" && (<>
                      <th className={cn(thCls, colW, "text-right")}>From High</th>
                      <th className={cn(thCls, colW, "text-right")}>Price</th>
                      <th className={cn(thCls, "min-w-[72px] text-right")}>Chg%</th>
                      <th className={cn(thCls, "min-w-[136px] text-center")}>1Y Range</th>
                      <th className={cn(thCls, "min-w-[68px] text-right")}>Volume</th>
                      <th className={cn(thCls, "min-w-[68px] text-right")}>M.Cap</th>
                    </>)}

                    {moverType === "near-52w-low" && (<>
                      <th className={cn(thCls, colW, "text-right")}>From Low</th>
                      <th className={cn(thCls, colW, "text-right")}>Price</th>
                      <th className={cn(thCls, "min-w-[72px] text-right")}>Chg%</th>
                      <th className={cn(thCls, "min-w-[136px] text-center")}>1Y Range</th>
                      <th className={cn(thCls, "min-w-[68px] text-right")}>Volume</th>
                      <th className={cn(thCls, "min-w-[68px] text-right")}>M.Cap</th>
                    </>)}

                    {/* Watchlist — always rightmost */}
                    <th className={cn(thCls, "w-[48px] min-w-[48px] text-center")}>Watchlist</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => {
                    const fromHigh = (stock.high52w - stock.price) / stock.high52w * 100;
                    const fromLow = (stock.price - stock.low52w) / stock.low52w * 100;
                    const chgColor = stock.changePercent >= 0 ? "text-emerald-500" : "text-red-500";
                    return (
                      <tr key={stock.symbol} className="h-[64px]">

                        {isGainersLosers && (<>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-foreground">
                            {stock.price.toFixed(1)}
                          </td>
                          <td className={cn("whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-semibold", chgColor)}>
                            {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%
                          </td>
                          <td className="px-3">
                            <div className="flex justify-center">
                              <Sparkline points={sparklines[stock.symbol]} color={sparkColor} />
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                            {stock.pe != null ? Math.round(stock.pe) : "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                            {stock.marketCap.replace("$", "")}
                          </td>
                          <td className={cn("whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-medium", stock.revGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>
                            {stock.revGrowth >= 0 ? "+" : ""}{stock.revGrowth.toFixed(1)}%
                          </td>
                          <td className={cn("whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-medium", stock.profitGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>
                            {stock.profitGrowth >= 0 ? "+" : ""}{stock.profitGrowth.toFixed(1)}%
                          </td>
                          <td className="min-w-[136px] px-3">
                            <RangeBar low={stock.low52w} high={stock.high52w} current={stock.price} />
                          </td>
                          {showRating && (
                            <td className="px-3">
                              <div className="flex justify-center">
                                <RatingBadge rating={stock.rating} />
                              </div>
                            </td>
                          )}
                        </>)}

                        {moverType === "most-active" && (<>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-semibold text-foreground">
                            {stock.volume}
                          </td>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-foreground">
                            {stock.price.toFixed(1)}
                          </td>
                          <td className={cn("whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-semibold", chgColor)}>
                            {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%
                          </td>
                          <td className="px-3">
                            <div className="flex justify-center">
                              <Sparkline points={sparklines[stock.symbol]} color={sparkColor} />
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                            {stock.marketCap.replace("$", "")}
                          </td>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                            {stock.pe != null ? Math.round(stock.pe) : "—"}
                          </td>
                        </>)}

                        {moverType === "near-52w-high" && (<>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-semibold text-amber-500">
                            -{fromHigh.toFixed(1)}%
                          </td>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-foreground">
                            {stock.price.toFixed(1)}
                          </td>
                          <td className={cn("whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-semibold", chgColor)}>
                            {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%
                          </td>
                          <td className="min-w-[136px] px-3">
                            <RangeBar low={stock.low52w} high={stock.high52w} current={stock.price} />
                          </td>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                            {stock.volume}
                          </td>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                            {stock.marketCap.replace("$", "")}
                          </td>
                        </>)}

                        {moverType === "near-52w-low" && (<>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-semibold text-sky-500">
                            +{fromLow.toFixed(1)}%
                          </td>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-foreground">
                            {stock.price.toFixed(1)}
                          </td>
                          <td className={cn("whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-semibold", chgColor)}>
                            {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%
                          </td>
                          <td className="min-w-[136px] px-3">
                            <RangeBar low={stock.low52w} high={stock.high52w} current={stock.price} />
                          </td>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                            {stock.volume}
                          </td>
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                            {stock.marketCap.replace("$", "")}
                          </td>
                        </>)}

                        {/* Watchlist — always rightmost */}
                        <td className="w-[48px] px-3">
                          <div className="flex justify-center">
                            <button
                              onClick={() => toggleBookmark(stock.symbol)}
                              className="transition-transform active:scale-90"
                            >
                              <Bookmark
                                size={20}
                                strokeWidth={1.8}
                                className={cn(
                                  "transition-colors",
                                  bookmarks.has(stock.symbol)
                                    ? "fill-foreground text-foreground"
                                    : "text-muted-foreground/50"
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

      <button className="mt-3 flex w-full items-center justify-center gap-1 py-3 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
        See All 76 Movers
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Smart Collections — data                                           */
/* ------------------------------------------------------------------ */

interface Collection {
  name: string;
  description: string;
  return1y: number;
  return3y: number;
  return5y: number;
  stocks: number;
  logos: string[];  // bg colors for logo circles
  minAmount: number;
  customisable?: boolean;
}

const smartCollections: Collection[] = [
  {
    name: "Tech Giants",
    description: "High-growth silicon leaders dominating the global digital infrastructure and AI sector.",
    return1y: 4.2, return3y: 18.7, return5y: 32.4,
    stocks: 15, logos: ["bg-muted", "bg-muted", "bg-muted"],
    minAmount: 1234, customisable: true,
  },
  {
    name: "AI & Robotics",
    description: "Top AI, automation & chip companies driving the next wave of computing.",
    return1y: 12.8, return3y: 42.1, return5y: 68.3,
    stocks: 10, logos: ["bg-muted", "bg-muted", "bg-muted"],
    minAmount: 500,
  },
  {
    name: "Clean Energy",
    description: "Solar, wind & EV ecosystem shaping the future of sustainable infrastructure.",
    return1y: -2.4, return3y: 8.9, return5y: 24.1,
    stocks: 12, logos: ["bg-muted", "bg-muted", "bg-muted"],
    minAmount: 750, customisable: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Smart Collections — card                                           */
/* ------------------------------------------------------------------ */

function CollectionCard({ c }: { c: Collection }) {
  const moreCount = c.stocks - c.logos.length;

  return (
    <button className="w-full rounded-2xl border border-border/60 bg-card p-5 text-left transition-colors active:scale-[0.98]">
      {/* Title + badge */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-[17px] font-bold text-foreground leading-tight">{c.name}</h3>
        {c.customisable && (
          <span className="shrink-0 ml-3 rounded-full border border-border/60 px-3 py-1 text-[12px] font-medium text-muted-foreground">
            Customisable
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">{c.description}</p>

      {/* Returns */}
      <div className="border-t border-border/40 pt-3 grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "1Y", value: c.return1y },
          { label: "3Y", value: c.return3y },
          { label: "5Y", value: c.return5y },
        ].map((r) => (
          <div key={r.label}>
            <p className="text-[12px] text-muted-foreground/50 mb-0.5">{r.label}</p>
            <p className={cn("text-[17px] font-bold tabular-nums", r.value >= 0 ? "text-gain" : "text-loss")}>
              {r.value >= 0 ? "+" : ""}{r.value}%
            </p>
          </div>
        ))}
      </div>

      {/* Logos + Min amount */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {c.logos.map((bg, i) => (
              <div key={i} className={cn("h-8 w-8 rounded-full border-2 border-card", bg)} />
            ))}
          </div>
          {moreCount > 0 && (
            <span className="text-[13px] text-muted-foreground">+{moreCount} more</span>
          )}
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground/50 uppercase tracking-wide">Min Amount</p>
          <p className="text-[15px] font-bold tabular-nums text-foreground">{c.minAmount.toLocaleString()}</p>
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Smart Collections Widget                                           */
/* ------------------------------------------------------------------ */

function RecurringBasketsWidget() {
  return (
    <div>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">
            Smart Collections
          </h2>
          <p className="text-[14px] text-muted-foreground">
            One tap, any amount. Start with $1 or go all in, we recommend starting small.
          </p>
        </div>
        <button className="flex-shrink-0 ml-3 flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors active:scale-[0.97]">
          <Plus size={14} />
          Create
        </button>
      </div>

      <div className="space-y-2.5">
        {smartCollections.map((c) => (
          <CollectionCard key={c.name} c={c} />
        ))}
      </div>

      {/* View more */}
      <button className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl border border-border/60 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
        View 12 Other Collections
        <ChevronRight size={16} />
      </button>
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
      <div className="flex gap-2.5 tabular-nums text-[10px] tabular-nums">
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

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym); else n.add(sym);
      return n;
    });

  return (
    <div>
      <div className="mb-3.5">
        <h2 className="text-[18px] font-bold tracking-tight">
          Stocks by Analyst Ratings
        </h2>
      </div>

      {/* Rating pills */}
      <div className="-mx-5 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-5 py-0.5">
          {ratingTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRatingTab(tab.id)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors",
                ratingTab === tab.id
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
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
            <div className="z-10 w-[196px] flex-shrink-0 border-r border-border/20 bg-card">
              <div className="flex h-[40px] items-center pl-5 text-[14px] font-medium text-muted-foreground">Stock</div>
              {stocks.map((stock) => (
                <div key={stock.symbol} className="flex h-[64px] items-center gap-2.5 pl-5 pr-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted" />
                  <p className="min-w-0 truncate text-[14px] font-bold leading-tight text-foreground">{stock.name}</p>
                </div>
              ))}
            </div>

            {/* ---- Scrollable right columns ---- */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table style={{ minWidth: 620 }}>
                <thead>
                  <tr className="h-[40px]">
                    <th className="min-w-[72px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      Upside
                    </th>
                    <th className="min-w-[120px] px-3 text-center text-[14px] font-medium text-muted-foreground">
                      Consensus
                    </th>
                    <th className="min-w-[80px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      Price
                    </th>
                    <th className="min-w-[80px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      Target
                    </th>
                    <th className="min-w-[68px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      Avg Vol
                    </th>
                    <th className="min-w-[72px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      Mkt Cap
                    </th>
                    <th className="min-w-[64px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      Sector
                    </th>
                    <th className="min-w-[48px] px-3" />
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="h-[64px] border-t border-border/10"
                    >
                      <td
                        className={cn(
                          "whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-semibold",
                          stock.upside >= 0 ? "text-gain" : "text-loss"
                        )}
                      >
                        {stock.upside >= 0 ? "+" : ""}{stock.upside.toFixed(1)}%
                      </td>

                      <td className="px-3">
                        <div className="flex justify-center">
                          <ConsensusBadge buy={stock.buy} hold={stock.hold} sell={stock.sell} />
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-foreground">
                        {stock.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                        {stock.targetPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                        {stock.avgVolume}
                      </td>

                      <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                        {stock.marketCap}
                      </td>

                      <td className="whitespace-nowrap px-3 text-right text-[14px] text-muted-foreground">
                        {stock.sector}
                      </td>

                      <td className="px-3">
                        <div className="flex justify-center">
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
                        </div>
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
/*  Dividend Stocks Widget                                             */
/* ------------------------------------------------------------------ */

type DividendTab = "high-yield" | "aristocrats" | "growth" | "monthly";

interface DividendStock {
  symbol: string;
  name: string;
  price: number;
  yield: number;
  annualDiv: number;
  payoutRatio: number;
  growth5Y: number;
  streak: number;
  nextExDate: string;
}

const divTabs: { id: DividendTab; label: string }[] = [
  { id: "high-yield", label: "High Yield" },
  { id: "aristocrats", label: "Aristocrats" },
  { id: "growth", label: "Growth" },
  { id: "monthly", label: "Monthly" },
];

const dividendStocks: Record<DividendTab, DividendStock[]> = {
  "high-yield": [
    { symbol: "MO", name: "Altria Group", price: 48.52, yield: 8.41, annualDiv: 4.08, payoutRatio: 80, growth5Y: 4.2, streak: 54, nextExDate: "Mar 24" },
    { symbol: "MPLX", name: "MPLX LP", price: 41.28, yield: 8.18, annualDiv: 3.38, payoutRatio: 85, growth5Y: 5.8, streak: 10, nextExDate: "Apr 8" },
    { symbol: "ET", name: "Energy Transfer", price: 15.84, yield: 7.92, annualDiv: 1.25, payoutRatio: 72, growth5Y: 3.1, streak: 3, nextExDate: "Apr 15" },
    { symbol: "VZ", name: "Verizon", price: 39.12, yield: 6.78, annualDiv: 2.65, payoutRatio: 57, growth5Y: 2.0, streak: 19, nextExDate: "Apr 1" },
    { symbol: "T", name: "AT&T", price: 17.08, yield: 6.52, annualDiv: 1.11, payoutRatio: 48, growth5Y: -4.2, streak: 2, nextExDate: "Apr 1" },
  ],
  "aristocrats": [
    { symbol: "PG", name: "Procter & Gamble", price: 168.42, yield: 2.38, annualDiv: 4.03, payoutRatio: 62, growth5Y: 6.1, streak: 68, nextExDate: "Apr 18" },
    { symbol: "JNJ", name: "Johnson & Johnson", price: 160.88, yield: 3.08, annualDiv: 4.96, payoutRatio: 44, growth5Y: 5.8, streak: 62, nextExDate: "Mar 24" },
    { symbol: "KO", name: "Coca-Cola", price: 62.14, yield: 3.12, annualDiv: 1.94, payoutRatio: 68, growth5Y: 3.8, streak: 62, nextExDate: "Mar 28" },
    { symbol: "PEP", name: "PepsiCo", price: 172.34, yield: 2.72, annualDiv: 5.42, payoutRatio: 66, growth5Y: 7.1, streak: 52, nextExDate: "Mar 31" },
    { symbol: "MMM", name: "3M Company", price: 102.14, yield: 5.82, annualDiv: 6.00, payoutRatio: 92, growth5Y: 1.2, streak: 66, nextExDate: "Apr 11" },
  ],
  "growth": [
    { symbol: "V", name: "Visa", price: 282.50, yield: 0.78, annualDiv: 2.08, payoutRatio: 22, growth5Y: 17.4, streak: 16, nextExDate: "Apr 28" },
    { symbol: "AVGO", name: "Broadcom", price: 168.24, yield: 1.82, annualDiv: 21.00, payoutRatio: 48, growth5Y: 14.2, streak: 14, nextExDate: "Apr 18" },
    { symbol: "HD", name: "Home Depot", price: 362.18, yield: 2.48, annualDiv: 9.00, payoutRatio: 52, growth5Y: 10.8, streak: 15, nextExDate: "Mar 19" },
    { symbol: "MSFT", name: "Microsoft", price: 415.80, yield: 0.72, annualDiv: 3.00, payoutRatio: 26, growth5Y: 10.2, streak: 22, nextExDate: "Apr 15" },
    { symbol: "ABBV", name: "AbbVie", price: 166.52, yield: 3.72, annualDiv: 6.20, payoutRatio: 54, growth5Y: 8.5, streak: 52, nextExDate: "Apr 14" },
  ],
  "monthly": [
    { symbol: "AGNC", name: "AGNC Investment", price: 9.72, yield: 14.82, annualDiv: 1.44, payoutRatio: 95, growth5Y: -2.1, streak: 14, nextExDate: "Mar 28" },
    { symbol: "O", name: "Realty Income", price: 58.24, yield: 5.42, annualDiv: 3.16, payoutRatio: 74, growth5Y: 3.4, streak: 30, nextExDate: "Mar 31" },
    { symbol: "MAIN", name: "Main Street Capital", price: 45.62, yield: 6.18, annualDiv: 2.82, payoutRatio: 68, growth5Y: 4.2, streak: 14, nextExDate: "Apr 15" },
    { symbol: "STAG", name: "STAG Industrial", price: 35.88, yield: 4.12, annualDiv: 1.48, payoutRatio: 72, growth5Y: 2.8, streak: 13, nextExDate: "Mar 28" },
    { symbol: "JEPI", name: "JPM Equity Premium", price: 56.12, yield: 7.24, annualDiv: 4.06, payoutRatio: 0, growth5Y: 0, streak: 3, nextExDate: "Apr 1" },
  ],
};

function PayoutBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-[12px] text-muted-foreground/40">—</span>;
  const color =
    value < 75
      ? "bg-emerald-500/15 text-emerald-500"
      : value < 90
        ? "bg-amber-500/15 text-amber-500"
        : "bg-red-500/15 text-red-500";
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums", color)}>
      {value}%
    </span>
  );
}

function DividendStocksWidget() {
  const [divTab, setDivTab] = useState<DividendTab>("high-yield");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const stocks = dividendStocks[divTab];

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym); else n.add(sym);
      return n;
    });

  return (
    <div>
      <div className="mb-3.5">
        <h2 className="text-[18px] font-bold tracking-tight">
          Dividend Stocks
        </h2>
      </div>

      {/* Pill tabs */}
      <div className="-mx-5 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-5 py-0.5">
          {divTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDivTab(tab.id)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors",
                divTab === tab.id
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
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
            <div className="z-10 w-[196px] flex-shrink-0 border-r border-border/20 bg-card">
              <div className="flex h-[40px] items-center pl-5 text-[14px] font-medium text-muted-foreground">Stock</div>
              {stocks.map((stock) => (
                <div key={stock.symbol} className="flex h-[64px] items-center gap-2.5 pl-5 pr-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted" />
                  <p className="min-w-0 truncate text-[14px] font-bold leading-tight text-foreground">{stock.name}</p>
                </div>
              ))}
            </div>

            {/* ---- Scrollable right columns ---- */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table style={{ minWidth: 580 }}>
                <thead>
                  <tr className="h-[40px]">
                    <th className="min-w-[64px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      Yield
                    </th>
                    <th className="min-w-[72px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      Div/Yr
                    </th>
                    <th className="min-w-[80px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      Payout
                    </th>
                    <th className="min-w-[72px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      5Y CAGR
                    </th>
                    <th className="min-w-[56px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      Streak
                    </th>
                    <th className="min-w-[72px] px-3 text-right text-[14px] font-medium text-muted-foreground">
                      Ex-Date
                    </th>
                    <th className="min-w-[48px] px-3" />
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="h-[64px] border-t border-border/10"
                    >
                      <td className="whitespace-nowrap px-3 text-right text-[14px] font-bold tabular-nums text-gain">
                        {stock.yield.toFixed(2)}%
                      </td>
                      <td className="whitespace-nowrap px-3 text-right text-[14px] tabular-nums text-foreground">
                        {stock.annualDiv.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 text-right">
                        <PayoutBadge value={stock.payoutRatio} />
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-3 text-right text-[14px] font-semibold tabular-nums",
                          stock.growth5Y >= 0 ? "text-gain" : "text-loss"
                        )}
                      >
                        {stock.growth5Y >= 0 ? "+" : ""}{stock.growth5Y.toFixed(1)}%
                      </td>
                      <td className="whitespace-nowrap px-3 text-right text-[14px] font-semibold tabular-nums text-foreground">
                        {stock.streak}yr
                      </td>
                      <td className="whitespace-nowrap px-3 text-right text-[14px] text-muted-foreground">
                        {stock.nextExDate}
                      </td>
                      <td className="px-3">
                        <div className="flex justify-center">
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

/* ------------------------------------------------------------------ */
/*  Level Up Widget — Tabbed Bite-Sized Stories                        */
/* ------------------------------------------------------------------ */

type StockLevelUpTab = "strategies" | "insights";

interface LevelUpCard {
  id: string;
  title: string;
  hook: string;
  gradient: string;
  story: Story;
}

const stockLevelUpTabs: { id: StockLevelUpTab; label: string }[] = [
  { id: "strategies", label: "Strategies" },
  { id: "insights", label: "Insights" },
];

const stockLevelUpData: Record<StockLevelUpTab, LevelUpCard[]> = {
  strategies: [
    {
      id: "pe-trick", title: "What P/E Actually Tells You",
      hook: "It\u2019s not just \u201ccheap vs expensive.\u201d One number, decoded.",
      gradient: "from-zinc-600 to-zinc-900",
      story: { id: "s-pe", title: "P/E Decoded", subtitle: "Strategy", icon: <TrendingUp size={18} />, gradient: "from-zinc-800 to-zinc-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">P/E <span className="text-zinc-300">decoded.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <p className="text-[48px] font-bold text-white/80">25x</p>
            <p className="text-[16px] leading-relaxed text-white/50">A P/E of 25 means you pay 25 for every 1 of earnings. But high P/E isn&apos;t always bad \u2014 it can mean the market expects growth. Low P/E isn&apos;t always good \u2014 it can mean the market expects decline.</p>
            <div className="w-full rounded-2xl bg-white/8 px-4 py-3 text-left">
              <p className="text-[15px] font-semibold text-white">The one-liner</p>
              <p className="text-[13px] text-white/40">Compare P/E to the sector average, not the market. A tech stock at 30x and a bank at 30x are very different stories.</p>
            </div>
          </div>
        ),
      },
    },
    {
      id: "earnings-check", title: "The 10-Second Earnings Check",
      hook: "Revenue, EPS, guidance. Three numbers. That\u2019s it.",
      gradient: "from-neutral-600 to-neutral-900",
      story: { id: "s-earnings", title: "Earnings in 10s", subtitle: "Strategy", icon: <BarChart3 size={18} />, gradient: "from-neutral-800 to-neutral-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">3 numbers. <span className="text-neutral-300">10 seconds.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <div className="w-full space-y-2.5">
              {[
                { num: "1", label: "Revenue", desc: "Did the company sell more than expected? Top-line growth = demand." },
                { num: "2", label: "EPS", desc: "Earnings per share \u2014 beat or miss? This moves the stock after hours." },
                { num: "3", label: "Guidance", desc: "What management expects next quarter. This matters more than the beat." },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3 text-left">
                  <span className="text-[20px] font-bold text-white/60">{item.num}</span>
                  <div><p className="text-[15px] font-semibold text-white">{item.label}</p><p className="text-[13px] text-white/40">{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    },
    {
      id: "dca-power", title: "DCA: The Lazy Genius Move",
      hook: "Same amount, same day, every month. Why it beats timing.",
      gradient: "from-stone-600 to-stone-900",
      story: { id: "s-dca", title: "DCA Power", subtitle: "Strategy", icon: <Target size={18} />, gradient: "from-stone-800 to-stone-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">The lazy <span className="text-stone-300">genius</span> move.</div>
            <div className="h-px w-12 bg-white/15" />
            <p className="text-[16px] leading-relaxed text-white/50">Dollar-cost averaging means investing a fixed amount at regular intervals. You buy more shares when prices are low, fewer when they\u2019re high.</p>
            <div className="w-full rounded-2xl bg-white/8 px-4 py-3 text-left">
              <p className="text-[15px] font-semibold text-white">The math</p>
              <p className="text-[13px] text-white/40">500/month into the S&P 500 since 2014 \u2192 you\u2019d have invested 60,000 and it would be worth ~112,000. No timing required.</p>
            </div>
          </div>
        ),
      },
    },
    {
      id: "sell-winner", title: "When to Sell a Winner",
      hook: "The hardest decision in investing. Here\u2019s a framework.",
      gradient: "from-gray-600 to-gray-900",
      story: { id: "s-sell", title: "Selling Winners", subtitle: "Strategy", icon: <Zap size={18} />, gradient: "from-gray-800 to-gray-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">When to <span className="text-gray-300">let go.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <div className="w-full space-y-2.5">
              {[
                { label: "The thesis broke", desc: "You bought for a reason. If that reason no longer holds, sell." },
                { label: "It\u2019s now 40%+ of your portfolio", desc: "Concentration risk. Take some off the table." },
                { label: "You need the money", desc: "Investing has a purpose. If the purpose arrived, it\u2019s not \u201cselling early.\u201d" },
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
      id: "covered-call", title: "Covered Calls in 30 Seconds",
      hook: "Own the stock. Sell the upside. Collect the premium.",
      gradient: "from-zinc-500 to-zinc-900",
      story: { id: "s-cc", title: "Covered Calls", subtitle: "Strategy", icon: <Gem size={18} />, gradient: "from-zinc-800 to-zinc-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">Income from <span className="text-zinc-300">stocks you own.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <div className="w-full space-y-2.5">
              {[
                { num: "1", desc: "You own 100 shares of AAPL at 185" },
                { num: "2", desc: "You sell a call at 195 strike, expiring in 30 days" },
                { num: "3", desc: "You collect ~3.50 per share = 350 premium, instantly" },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3 text-left">
                  <span className="text-[20px] font-bold text-white/60">{item.num}</span>
                  <p className="text-[14px] text-white/50">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-[14px] text-white/30">If AAPL stays below 195, you keep the shares + the premium. If it goes above, you sell at 195 + keep the premium. Win-win.</p>
          </div>
        ),
      },
    },
  ],
  insights: [
    {
      id: "time-vs-timing", title: "Why Time Beats Timing",
      hook: "Miss the 10 best days in 20 years and your returns get cut in half.",
      gradient: "from-neutral-500 to-neutral-900",
      story: { id: "i-time", title: "Time > Timing", subtitle: "Insight", icon: <TrendingUp size={18} />, gradient: "from-neutral-800 to-neutral-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">Time <span className="text-neutral-300">always</span> wins.</div>
            <div className="h-px w-12 bg-white/15" />
            <div className="flex gap-6">
              <div><p className="text-[28px] font-bold text-white/80">9.8%</p><p className="text-[12px] text-white/40">Stayed invested</p></div>
              <div><p className="text-[28px] font-bold text-white/40">5.6%</p><p className="text-[12px] text-white/40">Missed 10 best days</p></div>
            </div>
            <p className="text-[16px] leading-relaxed text-white/50">S&P 500 over 20 years. The 10 best days often come right after the worst. If you panicked and sold, you missed the recovery. Staying invested is the strategy.</p>
          </div>
        ),
      },
    },
    {
      id: "compounding", title: "The Power of Compounding",
      hook: "1,000 growing at 10% becomes 17,449 in 30 years. No extra effort.",
      gradient: "from-stone-500 to-stone-900",
      story: { id: "i-compound", title: "Compounding", subtitle: "Insight", icon: <Rocket size={18} />, gradient: "from-stone-800 to-stone-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">The 8th <span className="text-stone-300">wonder.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <div className="flex gap-4">
              <div><p className="text-[24px] font-bold text-white/80">1,000</p><p className="text-[12px] text-white/40">Year 0</p></div>
              <div><p className="text-[24px] font-bold text-white/80">6,727</p><p className="text-[12px] text-white/40">Year 20</p></div>
              <div><p className="text-[24px] font-bold text-white/80">17,449</p><p className="text-[12px] text-white/40">Year 30</p></div>
            </div>
            <p className="text-[16px] leading-relaxed text-white/50">That last 10 years added more than the first 20. Compounding is exponential \u2014 the longer you stay, the harder your money works.</p>
          </div>
        ),
      },
    },
    {
      id: "good-news-drop", title: "Why Stocks Drop on Good News",
      hook: "\u201cBeat earnings by 20%\u201d \u2014 stock drops 8%. Here\u2019s why.",
      gradient: "from-gray-500 to-gray-900",
      story: { id: "i-drop", title: "Good News, Bad Price", subtitle: "Insight", icon: <BarChart3 size={18} />, gradient: "from-gray-800 to-gray-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">Buy the <span className="text-gray-300">rumor.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <p className="text-[16px] leading-relaxed text-white/50">Markets are forward-looking. By the time earnings drop, the stock already moved on expectations. A \u201cbeat\u201d that was already priced in is actually a non-event.</p>
            <div className="w-full space-y-2.5">
              {[
                { label: "Priced in", desc: "Stock ran up 15% into earnings. The beat was expected." },
                { label: "Sell the news", desc: "Traders who bought the rumor take profits on the event." },
                { label: "Guidance matters more", desc: "The beat was great. But management lowered next quarter." },
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
      id: "loss-aversion", title: "Why Losses Hurt 2x More",
      hook: "Losing 100 feels worse than gaining 100 feels good. Your brain is wired this way.",
      gradient: "from-zinc-500 to-zinc-900",
      story: { id: "i-loss", title: "Loss Aversion", subtitle: "Insight", icon: <Brain size={18} />, gradient: "from-zinc-800 to-zinc-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">Your brain <span className="text-zinc-300">lies.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <div className="flex gap-6">
              <div><p className="text-[28px] font-bold text-white/80">+100</p><p className="text-[12px] text-white/40">Feels good</p></div>
              <div><p className="text-[28px] font-bold text-white/80">-100</p><p className="text-[12px] text-white/40">Feels 2x worse</p></div>
            </div>
            <p className="text-[16px] leading-relaxed text-white/50">This is loss aversion. It makes you hold losers too long (hoping to break even) and sell winners too early (locking in the good feeling). Knowing this is half the battle.</p>
          </div>
        ),
      },
    },
    {
      id: "diversification-myth", title: "Diversification \u2260 Owning 50 Stocks",
      hook: "You can hold 50 tech stocks and still be wildly concentrated.",
      gradient: "from-neutral-600 to-neutral-900",
      story: { id: "i-div", title: "Real Diversification", subtitle: "Insight", icon: <Layers size={18} />, gradient: "from-neutral-800 to-neutral-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">50 stocks. <span className="text-neutral-300">Zero</span> diversification.</div>
            <div className="h-px w-12 bg-white/15" />
            <p className="text-[16px] leading-relaxed text-white/50">Diversification isn&apos;t about counting holdings. It&apos;s about owning things that don&apos;t move together. 50 tech stocks all drop when rates rise.</p>
            <div className="w-full rounded-2xl bg-white/8 px-4 py-3 text-left">
              <p className="text-[15px] font-semibold text-white">Real diversification</p>
              <p className="text-[13px] text-white/40">Different sectors, different geographies, different asset classes (stocks, bonds, commodities). When one zigs, the other zags.</p>
            </div>
          </div>
        ),
      },
    },
  ],
};

function LevelUpCarousel({ cards }: { cards: LevelUpCard[] }) {
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  return (
    <>
      <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
        <div className="flex gap-3" style={{ width: "max-content" }}>
          {cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => { setStoryIndex(i); setStoryOpen(true); }}
              className="relative flex w-[200px] flex-shrink-0 flex-col justify-between overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.97]"
              style={{ height: 240 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${card.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="relative z-10 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Play size={16} fill="white" className="text-white ml-0.5" />
                </div>
              </div>
              <div className="relative z-10 p-3.5">
                <p className="text-[17px] font-bold leading-tight text-white mb-1.5">{card.title}</p>
                <p className="text-[12px] leading-snug text-white/50 line-clamp-2">{card.hook}</p>
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
    </>
  );
}

function LevelUpWidget() {
  const [activeTab, setActiveTab] = useState<StockLevelUpTab>("strategies");

  return (
    <div>
      <h2 className="mb-2.5 text-[18px] font-bold tracking-tight">
        Level Up
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {stockLevelUpTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              activeTab === tab.id
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
        >
          <LevelUpCarousel cards={stockLevelUpData[activeTab]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stock Screeners Widget                                             */
/* ------------------------------------------------------------------ */

type ScreenerTab = "basic" | "premium" | "saved";

const screenerTabs: { id: ScreenerTab; label: string; disabled?: boolean }[] = [
  { id: "basic", label: "Popular" },
  { id: "premium", label: "Advanced" },
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
      <div className="mb-3.5">
        <h2 className="text-[18px] font-bold tracking-tight">
          Stock Screeners
        </h2>
        <p className="mt-0.5 text-[14px] text-muted-foreground">
          Find stocks that match your criteria
        </p>
      </div>

      {/* Tabs */}
      <div className="-mx-5 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-5 py-0.5">
          {screenerTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors",
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
/*  Market Heatmap Widget                                              */
/* ------------------------------------------------------------------ */

function HeatmapWidget() {
  const [index, setIndex] = useState<HeatmapIndex>("sp500");
  const [view, setView] = useState<HeatmapView>("stocks");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const items = view === "stocks" ? heatmapStocks[index] : heatmapSectors[index];
  const rects = useMemo(() => treemapLayout(items), [items]);

  const cycleView = () =>
    setView((p) => heatViewOrder[(heatViewOrder.indexOf(p) + 1) % heatViewOrder.length]);

  return (
    <div>
      {/* Title row: title + view flipper */}
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-[18px] font-bold tracking-tight">Market at a Glance</h2>
        <button
          onClick={cycleView}
          className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border/60 px-3.5 py-2 text-[13px] font-semibold text-foreground transition-all"
        >
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
          <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />
        </button>
      </div>

      {/* Index pills */}
      <div className="-mx-5 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-5 py-0.5">
          {(["sp500", "nasdaq100"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setIndex(id)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors",
                index === id
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {id === "sp500" ? "S&P 500" : "NASDAQ 100"}
            </button>
          ))}
        </div>
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
                    {showChange && (
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
        Open in Fullscreen
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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function ExploreFundedNotTraded() {
  return (
    <div className="space-y-8 px-5 pt-5 pb-4">
      <PromoBanner />
      <TopMoversWidget />
      <HeatmapWidget />
      <LevelUpWidget />
      <RecurringBasketsWidget />
      <AnalystRatingsWidget />
      <DividendStocksWidget />
      <ScreenerWidget />
      <EarningsCalendar />
      <DividendCalendar />
    </div>
  );
}
