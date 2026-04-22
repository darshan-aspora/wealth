"use client";

import { Suspense, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bookmark,
} from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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
  return1y: number;
  return3y: number;
  return5y: number;
  trackingError: number;
  volume: string;
  high52w: number;
  low52w: number;
}

/* ------------------------------------------------------------------ */
/*  Asset-class tabs                                                   */
/* ------------------------------------------------------------------ */

const ASSET_CLASSES = [
  "Fixed Income",
  "Commodities",
  "Real Estate",
  "Currency",
  "Multi-Asset",
  "Balanced",
] as const;

type AssetClass = (typeof ASSET_CLASSES)[number];

const TAB_PARAM_MAP: Record<string, AssetClass> = {
  "fixed-income": "Fixed Income",
  "commodities": "Commodities",
  "real-estate": "Real Estate",
  "currency": "Currency",
  "multi-asset": "Multi-Asset",
  "balanced": "Balanced",
};

/* ------------------------------------------------------------------ */
/*  Range bar                                                          */
/* ------------------------------------------------------------------ */

function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const pct = Math.max(0, Math.min(100, ((current - low) / (high - low || 1)) * 100));
  return (
    <div className="flex items-center gap-1.5 w-full">
      <span className="text-[14px] tabular-nums text-muted-foreground whitespace-nowrap">{low.toFixed(0)}</span>
      <div className="relative flex-1 h-[3px] rounded-full bg-muted">
        <div className="absolute top-1/2 -translate-y-1/2 h-[12px] w-[2px] bg-foreground" style={{ left: `${pct}%` }} />
      </div>
      <span className="text-[14px] tabular-nums text-muted-foreground whitespace-nowrap">{high.toFixed(0)}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock data — ~12 ETFs per asset class                               */
/* ------------------------------------------------------------------ */

const MOCK_DATA: Record<AssetClass, ETF[]> = {
  "Fixed Income": [
    { symbol: "BND", name: "Vanguard Total Bond Market ETF", price: 72.34, changePercent: 0.12, aum: "106.2B", expenseRatio: 0.03, return1y: 2.8, return3y: 1.2, return5y: 1.5, trackingError: 0.09, volume: "8.2M", high52w: 75, low52w: 68 },
    { symbol: "AGG", name: "iShares Core US Aggregate Bond ETF", price: 98.17, changePercent: -0.08, aum: "94.1B", expenseRatio: 0.03, return1y: 2.5, return3y: 1.4, return5y: 1.3, trackingError: 0.08, volume: "6.7M", high52w: 102, low52w: 93 },
    { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF", price: 91.56, changePercent: -0.67, aum: "53.8B", expenseRatio: 0.15, return1y: -3.2, return3y: -8.4, return5y: -4.1, trackingError: 0.45, volume: "24.5M", high52w: 102, low52w: 82 },
    { symbol: "VCIT", name: "Vanguard Intermediate-Term Corp Bond ETF", price: 80.23, changePercent: 0.22, aum: "48.5B", expenseRatio: 0.04, return1y: 4.1, return3y: 2.3, return5y: 2.8, trackingError: 0.12, volume: "4.8M", high52w: 84, low52w: 76 },
    { symbol: "LQD", name: "iShares iBoxx Investment Grade Corp Bond ETF", price: 108.41, changePercent: -0.14, aum: "35.2B", expenseRatio: 0.14, return1y: 4.8, return3y: 1.8, return5y: 2.4, trackingError: 0.11, volume: "12.3M", high52w: 114, low52w: 101 },
    { symbol: "VCSH", name: "Vanguard Short-Term Corp Bond ETF", price: 76.89, changePercent: 0.05, aum: "32.7B", expenseRatio: 0.04, return1y: 4.2, return3y: 2.6, return5y: 2.3, trackingError: 0.06, volume: "3.4M", high52w: 78, low52w: 74 },
    { symbol: "SHY", name: "iShares 1-3 Year Treasury Bond ETF", price: 81.92, changePercent: 0.03, aum: "28.4B", expenseRatio: 0.15, return1y: 3.8, return3y: 2.1, return5y: 1.8, trackingError: 0.05, volume: "5.1M", high52w: 83, low52w: 80 },
    { symbol: "IEF", name: "iShares 7-10 Year Treasury Bond ETF", price: 94.05, changePercent: -0.31, aum: "25.1B", expenseRatio: 0.15, return1y: -0.8, return3y: -3.2, return5y: -1.4, trackingError: 0.22, volume: "8.8M", high52w: 100, low52w: 88 },
    { symbol: "HYG", name: "iShares iBoxx High Yield Corp Bond ETF", price: 76.18, changePercent: 0.41, aum: "18.3B", expenseRatio: 0.49, return1y: 8.2, return3y: 3.8, return5y: 3.4, trackingError: 0.38, volume: "15.8M", high52w: 80, low52w: 72 },
    { symbol: "MUB", name: "iShares National Muni Bond ETF", price: 107.52, changePercent: 0.09, aum: "28.9B", expenseRatio: 0.07, return1y: 2.4, return3y: 0.8, return5y: 1.6, trackingError: 0.14, volume: "2.8M", high52w: 110, low52w: 103 },
    { symbol: "BNDX", name: "Vanguard Total Intl Bond ETF", price: 49.23, changePercent: -0.18, aum: "42.6B", expenseRatio: 0.07, return1y: 5.1, return3y: -1.2, return5y: 0.4, trackingError: 0.18, volume: "4.2M", high52w: 52, low52w: 46 },
    { symbol: "TIP", name: "iShares TIPS Bond ETF", price: 108.92, changePercent: 0.15, aum: "19.7B", expenseRatio: 0.19, return1y: 1.6, return3y: 0.2, return5y: 2.8, trackingError: 0.15, volume: "3.6M", high52w: 112, low52w: 104 },
  ],
  "Commodities": [
    { symbol: "GLD", name: "SPDR Gold Shares", price: 218.45, changePercent: 1.23, aum: "62.4B", expenseRatio: 0.40, return1y: 14.2, return3y: 8.2, return5y: 9.4, trackingError: 0.40, volume: "8.4M", high52w: 225, low52w: 162 },
    { symbol: "IAU", name: "iShares Gold Trust", price: 44.87, changePercent: 1.18, aum: "28.9B", expenseRatio: 0.25, return1y: 14.0, return3y: 8.0, return5y: 9.2, trackingError: 0.25, volume: "12.1M", high52w: 46, low52w: 34 },
    { symbol: "SLV", name: "iShares Silver Trust", price: 26.31, changePercent: 2.14, aum: "11.3B", expenseRatio: 0.50, return1y: 18.4, return3y: 4.2, return5y: 6.8, trackingError: 0.52, volume: "18.2M", high52w: 30, low52w: 18 },
    { symbol: "USO", name: "United States Oil Fund", price: 72.56, changePercent: -1.42, aum: "2.8B", expenseRatio: 0.60, return1y: -8.4, return3y: 12.6, return5y: -2.8, trackingError: 1.82, volume: "4.8M", high52w: 84, low52w: 58 },
    { symbol: "DBC", name: "Invesco DB Commodity Index Tracking Fund", price: 22.18, changePercent: -0.73, aum: "3.1B", expenseRatio: 0.85, return1y: -4.2, return3y: 8.4, return5y: 5.6, trackingError: 0.68, volume: "2.4M", high52w: 28, low52w: 21 },
    { symbol: "PDBC", name: "Invesco Optimum Yield Diversified Cmdty ETF", price: 13.94, changePercent: -0.56, aum: "5.2B", expenseRatio: 0.59, return1y: -3.8, return3y: 6.2, return5y: 4.8, trackingError: 0.48, volume: "3.2M", high52w: 16, low52w: 12 },
    { symbol: "GLDM", name: "SPDR Gold MiniShares Trust", price: 45.62, changePercent: 1.21, aum: "8.7B", expenseRatio: 0.10, return1y: 14.4, return3y: 8.4, return5y: 9.6, trackingError: 0.10, volume: "6.8M", high52w: 47, low52w: 34 },
    { symbol: "BCI", name: "abrdn Bloomberg All Cmdty Strategy ETF", price: 24.53, changePercent: -0.38, aum: "1.4B", expenseRatio: 0.25, return1y: -2.4, return3y: 5.8, return5y: 4.2, trackingError: 0.32, volume: "0.8M", high52w: 28, low52w: 22 },
    { symbol: "CPER", name: "United States Copper Index Fund", price: 28.76, changePercent: 0.87, aum: "0.3B", expenseRatio: 0.65, return1y: 22.6, return3y: 6.4, return5y: 8.2, trackingError: 1.24, volume: "0.4M", high52w: 32, low52w: 22 },
    { symbol: "WEAT", name: "Teucrium Wheat Fund", price: 5.42, changePercent: -2.31, aum: "0.2B", expenseRatio: 0.22, return1y: -18.4, return3y: -8.6, return5y: -4.2, trackingError: 2.14, volume: "0.6M", high52w: 8, low52w: 5 },
    { symbol: "CORN", name: "Teucrium Corn Fund", price: 19.87, changePercent: -0.94, aum: "0.1B", expenseRatio: 0.22, return1y: -12.2, return3y: -4.8, return5y: -2.4, trackingError: 1.86, volume: "0.3M", high52w: 24, low52w: 18 },
    { symbol: "PPLT", name: "abrdn Physical Platinum Shares ETF", price: 88.14, changePercent: 0.63, aum: "0.8B", expenseRatio: 0.60, return1y: -2.8, return3y: 4.2, return5y: 2.6, trackingError: 0.62, volume: "0.2M", high52w: 96, low52w: 78 },
  ],
  "Real Estate": [
    { symbol: "VNQ", name: "Vanguard Real Estate ETF", price: 82.73, changePercent: -0.45, aum: "34.2B", expenseRatio: 0.12, return1y: 4.2, return3y: -2.4, return5y: 3.8, trackingError: 0.12, volume: "5.8M", high52w: 92, low52w: 72 },
    { symbol: "SCHH", name: "Schwab US REIT ETF", price: 19.84, changePercent: -0.52, aum: "6.8B", expenseRatio: 0.07, return1y: 3.8, return3y: -2.8, return5y: 3.4, trackingError: 0.08, volume: "2.4M", high52w: 23, low52w: 18 },
    { symbol: "IYR", name: "iShares US Real Estate ETF", price: 85.61, changePercent: -0.39, aum: "4.1B", expenseRatio: 0.39, return1y: 4.6, return3y: -1.8, return5y: 4.2, trackingError: 0.34, volume: "4.2M", high52w: 96, low52w: 78 },
    { symbol: "XLRE", name: "Real Estate Select Sector SPDR Fund", price: 38.47, changePercent: -0.28, aum: "5.9B", expenseRatio: 0.09, return1y: 5.2, return3y: -1.2, return5y: 4.8, trackingError: 0.09, volume: "8.2M", high52w: 44, low52w: 35 },
    { symbol: "VNQI", name: "Vanguard Global ex-US Real Estate ETF", price: 42.15, changePercent: 0.34, aum: "4.7B", expenseRatio: 0.12, return1y: 2.8, return3y: -4.6, return5y: 1.2, trackingError: 0.18, volume: "1.2M", high52w: 46, low52w: 38 },
    { symbol: "RWR", name: "SPDR Dow Jones REIT ETF", price: 96.82, changePercent: -0.61, aum: "1.6B", expenseRatio: 0.25, return1y: 3.4, return3y: -3.2, return5y: 2.8, trackingError: 0.22, volume: "0.8M", high52w: 108, low52w: 88 },
    { symbol: "USRT", name: "iShares Core US REIT ETF", price: 51.28, changePercent: -0.43, aum: "2.3B", expenseRatio: 0.08, return1y: 4.4, return3y: -2.2, return5y: 3.6, trackingError: 0.10, volume: "1.4M", high52w: 56, low52w: 46 },
    { symbol: "REM", name: "iShares Mortgage Real Estate ETF", price: 22.74, changePercent: 0.82, aum: "1.1B", expenseRatio: 0.48, return1y: 8.6, return3y: -6.4, return5y: -2.8, trackingError: 0.52, volume: "2.8M", high52w: 26, low52w: 18 },
    { symbol: "REET", name: "iShares Global REIT ETF", price: 24.36, changePercent: -0.17, aum: "3.4B", expenseRatio: 0.14, return1y: 3.2, return3y: -3.8, return5y: 2.4, trackingError: 0.16, volume: "0.6M", high52w: 28, low52w: 22 },
    { symbol: "MORT", name: "VanEck Mortgage REIT Income ETF", price: 12.45, changePercent: 0.56, aum: "0.3B", expenseRatio: 0.43, return1y: 12.4, return3y: -8.2, return5y: -4.6, trackingError: 0.68, volume: "0.4M", high52w: 14, low52w: 10 },
    { symbol: "HOMZ", name: "Hoya Capital Housing ETF", price: 38.92, changePercent: -0.23, aum: "0.1B", expenseRatio: 0.30, return1y: 6.8, return3y: -0.4, return5y: 5.2, trackingError: 0.42, volume: "0.1M", high52w: 42, low52w: 34 },
    { symbol: "INDS", name: "Pacer Industrial Real Estate ETF", price: 34.17, changePercent: 0.14, aum: "0.2B", expenseRatio: 0.60, return1y: 8.2, return3y: 1.4, return5y: 6.4, trackingError: 0.56, volume: "0.1M", high52w: 38, low52w: 30 },
  ],
  "Currency": [
    { symbol: "UUP", name: "Invesco DB US Dollar Index Bullish Fund", price: 27.82, changePercent: 0.31, aum: "2.1B", expenseRatio: 0.75, return1y: 3.4, return3y: 4.8, return5y: 2.6, trackingError: 0.82, volume: "2.8M", high52w: 30, low52w: 26 },
    { symbol: "FXE", name: "Invesco CurrencyShares Euro Trust", price: 97.45, changePercent: -0.42, aum: "0.3B", expenseRatio: 0.40, return1y: -2.8, return3y: -4.2, return5y: -2.4, trackingError: 0.04, volume: "0.4M", high52w: 102, low52w: 88 },
    { symbol: "FXY", name: "Invesco CurrencyShares Japanese Yen Trust", price: 62.18, changePercent: 0.67, aum: "0.4B", expenseRatio: 0.40, return1y: -8.4, return3y: -12.6, return5y: -6.8, trackingError: 0.04, volume: "0.2M", high52w: 68, low52w: 58 },
    { symbol: "FXB", name: "Invesco CurrencyShares British Pound Trust", price: 118.72, changePercent: -0.19, aum: "0.1B", expenseRatio: 0.40, return1y: 1.2, return3y: -2.4, return5y: -0.8, trackingError: 0.04, volume: "0.1M", high52w: 124, low52w: 112 },
    { symbol: "FXA", name: "Invesco CurrencyShares Australian Dollar Trust", price: 65.34, changePercent: 0.53, aum: "0.1B", expenseRatio: 0.40, return1y: -4.2, return3y: -6.8, return5y: -3.4, trackingError: 0.04, volume: "0.1M", high52w: 74, low52w: 62 },
    { symbol: "FXC", name: "Invesco CurrencyShares Canadian Dollar Trust", price: 73.21, changePercent: 0.12, aum: "0.1B", expenseRatio: 0.40, return1y: -1.8, return3y: -3.2, return5y: -1.4, trackingError: 0.04, volume: "0.1M", high52w: 78, low52w: 68 },
    { symbol: "FXF", name: "Invesco CurrencyShares Swiss Franc Trust", price: 102.87, changePercent: 0.28, aum: "0.2B", expenseRatio: 0.40, return1y: 2.4, return3y: 0.8, return5y: 1.2, trackingError: 0.04, volume: "0.1M", high52w: 108, low52w: 96 },
    { symbol: "UDN", name: "Invesco DB US Dollar Index Bearish Fund", price: 18.93, changePercent: -0.34, aum: "0.1B", expenseRatio: 0.75, return1y: -3.2, return3y: -4.6, return5y: -2.4, trackingError: 0.78, volume: "0.2M", high52w: 22, low52w: 17 },
    { symbol: "CEW", name: "WisdomTree Emerging Currency Strategy Fund", price: 17.45, changePercent: -0.58, aum: "0.05B", expenseRatio: 0.55, return1y: -1.4, return3y: -2.8, return5y: -1.8, trackingError: 0.62, volume: "0.1M", high52w: 20, low52w: 16 },
    { symbol: "USDU", name: "WisdomTree Bloomberg US Dollar Bullish Fund", price: 25.68, changePercent: 0.44, aum: "0.2B", expenseRatio: 0.50, return1y: 4.2, return3y: 5.4, return5y: 3.2, trackingError: 0.54, volume: "0.3M", high52w: 28, low52w: 24 },
    { symbol: "FXS", name: "Invesco CurrencyShares Swedish Krona Trust", price: 88.54, changePercent: -0.72, aum: "0.01B", expenseRatio: 0.40, return1y: -5.6, return3y: -8.4, return5y: -4.2, trackingError: 0.04, volume: "0.01M", high52w: 96, low52w: 82 },
    { symbol: "CYB", name: "WisdomTree Chinese Yuan Strategy Fund", price: 24.12, changePercent: -0.15, aum: "0.04B", expenseRatio: 0.45, return1y: -2.2, return3y: -3.8, return5y: -2.6, trackingError: 0.48, volume: "0.02M", high52w: 28, low52w: 22 },
  ],
  "Multi-Asset": [
    { symbol: "AOR", name: "iShares Core Growth Allocation ETF", price: 56.24, changePercent: 0.18, aum: "2.1B", expenseRatio: 0.15, return1y: 8.4, return3y: 4.2, return5y: 6.8, trackingError: 0.18, volume: "0.8M", high52w: 58, low52w: 48 },
    { symbol: "AOM", name: "iShares Core Moderate Allocation ETF", price: 39.87, changePercent: 0.09, aum: "1.4B", expenseRatio: 0.15, return1y: 5.8, return3y: 2.4, return5y: 4.6, trackingError: 0.14, volume: "0.3M", high52w: 42, low52w: 36 },
    { symbol: "AOA", name: "iShares Core Aggressive Allocation ETF", price: 67.92, changePercent: 0.34, aum: "1.8B", expenseRatio: 0.15, return1y: 12.4, return3y: 6.8, return5y: 8.4, trackingError: 0.22, volume: "0.4M", high52w: 70, low52w: 56 },
    { symbol: "AOK", name: "iShares Core Conservative Allocation ETF", price: 34.15, changePercent: 0.05, aum: "0.9B", expenseRatio: 0.15, return1y: 3.8, return3y: 1.4, return5y: 3.2, trackingError: 0.10, volume: "0.2M", high52w: 36, low52w: 32 },
    { symbol: "GAL", name: "SPDR SSgA Global Allocation ETF", price: 42.78, changePercent: 0.22, aum: "0.3B", expenseRatio: 0.35, return1y: 7.2, return3y: 3.8, return5y: 5.4, trackingError: 0.38, volume: "0.1M", high52w: 46, low52w: 38 },
    { symbol: "IYLD", name: "iShares Morningstar Multi-Asset Income ETF", price: 22.64, changePercent: -0.13, aum: "0.2B", expenseRatio: 0.60, return1y: 6.4, return3y: 0.8, return5y: 2.8, trackingError: 0.58, volume: "0.1M", high52w: 26, low52w: 20 },
    { symbol: "MDIV", name: "First Trust Multi-Asset Diversified Income ETF", price: 15.31, changePercent: 0.41, aum: "0.4B", expenseRatio: 0.69, return1y: 8.8, return3y: 2.4, return5y: 4.2, trackingError: 0.72, volume: "0.2M", high52w: 18, low52w: 14 },
    { symbol: "DALI", name: "First Trust Dorsey Wright DALI 1 ETF", price: 28.94, changePercent: 0.56, aum: "0.2B", expenseRatio: 0.88, return1y: 10.2, return3y: 5.4, return5y: 7.2, trackingError: 0.92, volume: "0.1M", high52w: 32, low52w: 24 },
    { symbol: "RPAR", name: "RPAR Risk Parity ETF", price: 18.72, changePercent: -0.27, aum: "0.8B", expenseRatio: 0.50, return1y: 4.8, return3y: -0.4, return5y: 3.6, trackingError: 0.54, volume: "0.3M", high52w: 22, low52w: 16 },
    { symbol: "GDE", name: "WisdomTree Efficient Gold Plus Equity ETF", price: 22.85, changePercent: 0.93, aum: "0.1B", expenseRatio: 0.20, return1y: 16.4, return3y: 8.2, return5y: 10.4, trackingError: 0.28, volume: "0.1M", high52w: 26, low52w: 18 },
    { symbol: "NTSX", name: "WisdomTree US Efficient Core Fund", price: 34.67, changePercent: 0.28, aum: "0.9B", expenseRatio: 0.20, return1y: 14.2, return3y: 7.8, return5y: 9.8, trackingError: 0.24, volume: "0.2M", high52w: 38, low52w: 28 },
    { symbol: "PSMC", name: "Pacer Swan SOS Moderate Conservative ETF", price: 21.43, changePercent: 0.07, aum: "0.05B", expenseRatio: 0.77, return1y: 4.2, return3y: 2.8, return5y: 3.4, trackingError: 0.82, volume: "0.02M", high52w: 24, low52w: 20 },
  ],
  "Balanced": [
    { symbol: "VBIAX", name: "Vanguard Balanced Index Fund ETF Shares", price: 45.82, changePercent: 0.14, aum: "18.2B", expenseRatio: 0.07, return1y: 10.4, return3y: 5.6, return5y: 7.8, trackingError: 0.08, volume: "1.2M", high52w: 48, low52w: 40 },
    { symbol: "BAGPX", name: "BlackRock 60/40 Target Allocation ETF", price: 32.47, changePercent: 0.08, aum: "1.2B", expenseRatio: 0.12, return1y: 8.8, return3y: 4.2, return5y: 6.4, trackingError: 0.14, volume: "0.4M", high52w: 34, low52w: 28 },
    { symbol: "VGSTX", name: "Vanguard STAR Fund ETF Shares", price: 28.93, changePercent: 0.21, aum: "3.4B", expenseRatio: 0.31, return1y: 9.2, return3y: 4.8, return5y: 7.2, trackingError: 0.34, volume: "0.6M", high52w: 32, low52w: 26 },
    { symbol: "DGSIX", name: "DFA Global Stock/Bond 60/40 ETF", price: 19.65, changePercent: 0.17, aum: "0.8B", expenseRatio: 0.24, return1y: 7.6, return3y: 3.4, return5y: 5.8, trackingError: 0.28, volume: "0.2M", high52w: 22, low52w: 18 },
    { symbol: "SWAN", name: "Amplify BlackSwan Growth & Treasury Core ETF", price: 28.14, changePercent: 0.09, aum: "0.4B", expenseRatio: 0.49, return1y: 6.4, return3y: 2.8, return5y: 5.2, trackingError: 0.52, volume: "0.1M", high52w: 30, low52w: 24 },
    { symbol: "RISN", name: "Inspire Tactical Balanced ETF", price: 24.73, changePercent: -0.32, aum: "0.1B", expenseRatio: 0.65, return1y: 5.2, return3y: 1.4, return5y: 3.8, trackingError: 0.68, volume: "0.04M", high52w: 28, low52w: 22 },
    { symbol: "TAFL", name: "Themes Tactical Allocation ETF", price: 26.58, changePercent: 0.44, aum: "0.05B", expenseRatio: 0.50, return1y: 8.4, return3y: 4.6, return5y: 6.2, trackingError: 0.54, volume: "0.02M", high52w: 30, low52w: 24 },
    { symbol: "GAA", name: "Cambria Global Asset Allocation ETF", price: 28.92, changePercent: 0.11, aum: "0.2B", expenseRatio: 0.26, return1y: 6.8, return3y: 2.4, return5y: 4.8, trackingError: 0.32, volume: "0.1M", high52w: 32, low52w: 26 },
    { symbol: "OCIO", name: "ClearShares OCIO ETF", price: 31.47, changePercent: -0.18, aum: "0.1B", expenseRatio: 0.65, return1y: 7.4, return3y: 3.2, return5y: 5.6, trackingError: 0.68, volume: "0.05M", high52w: 34, low52w: 28 },
    { symbol: "PSMR", name: "Pacer Swan SOS Moderate ETF", price: 23.84, changePercent: 0.25, aum: "0.08B", expenseRatio: 0.75, return1y: 5.8, return3y: 3.8, return5y: 4.4, trackingError: 0.78, volume: "0.03M", high52w: 26, low52w: 22 },
    { symbol: "DWFI", name: "DWA Focused Balanced ETF", price: 17.56, changePercent: -0.41, aum: "0.03B", expenseRatio: 0.80, return1y: 4.6, return3y: 1.2, return5y: 3.2, trackingError: 0.84, volume: "0.01M", high52w: 20, low52w: 16 },
    { symbol: "RAA", name: "Brookstone Real Asset Allocation ETF", price: 30.21, changePercent: 0.37, aum: "0.04B", expenseRatio: 0.67, return1y: 9.4, return3y: 4.8, return5y: 6.8, trackingError: 0.72, volume: "0.02M", high52w: 34, low52w: 28 },
  ],
};

/* ------------------------------------------------------------------ */
/*  Sort config                                                        */
/* ------------------------------------------------------------------ */

type SortKey =
  | "changePercent"
  | "aum"
  | "expenseRatio"
  | "return1y"
  | "return3y"
  | "return5y"
  | "trackingError";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "changePercent", label: "Change %" },
  { key: "return1y", label: "1Y Return" },
  { key: "return3y", label: "3Y Return" },
  { key: "return5y", label: "5Y Return" },
  { key: "aum", label: "AUM" },
  { key: "expenseRatio", label: "Expense Ratio" },
  { key: "trackingError", label: "Tracking Error" },
];

const DEFAULT_SORT: { key: SortKey; dir: SortDir } = { key: "changePercent", dir: "desc" };

/* Parse AUM string like "106.2B" / "0.05B" into a number (billions). */
const parseAUM = (aum: string): number => {
  const m = aum.match(/^([\d.]+)([BMK]?)$/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = m[2].toUpperCase();
  if (unit === "B") return n;
  if (unit === "M") return n / 1000;
  if (unit === "K") return n / 1_000_000;
  return n;
};

const applySort = (etfs: ETF[], key: SortKey, dir: SortDir) => {
  const mul = dir === "asc" ? 1 : -1;
  const val = (e: ETF): number => {
    switch (key) {
      case "changePercent": return e.changePercent;
      case "aum": return parseAUM(e.aum);
      case "expenseRatio": return e.expenseRatio;
      case "return1y": return e.return1y;
      case "return3y": return e.return3y;
      case "return5y": return e.return5y;
      case "trackingError": return e.trackingError;
    }
  };
  return [...etfs].sort((a, b) => (val(a) - val(b)) * mul);
};

/* ------------------------------------------------------------------ */
/*  Column definitions                                                 */
/* ------------------------------------------------------------------ */

interface ColDef {
  header: string;
  align: "left" | "center" | "right";
  minWidth: number;
  sortKey?: SortKey;
}

const DATA_COLUMNS: ColDef[] = [
  { header: "Price", align: "right", minWidth: 80, sortKey: "changePercent" },
  { header: "AUM", align: "right", minWidth: 72, sortKey: "aum" },
  { header: "Exp%", align: "right", minWidth: 62, sortKey: "expenseRatio" },
  { header: "1Y", align: "right", minWidth: 72, sortKey: "return1y" },
  { header: "3Y", align: "right", minWidth: 72, sortKey: "return3y" },
  { header: "5Y", align: "right", minWidth: 72, sortKey: "return5y" },
  { header: "Track Err", align: "right", minWidth: 76, sortKey: "trackingError" },
  { header: "1Y Range", align: "center", minWidth: 110 },
  { header: "Volume", align: "right", minWidth: 72 },
  { header: "Watchlist", align: "center", minWidth: 80 },
];

const VISIBLE_DATA_COLS = 2;
const SCROLLABLE_MIN_WIDTH = 480;
const MIN_FROZEN_WIDTH = 120;

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function ETFAssetClassPage() {
  return (
    <Suspense>
      <ETFAssetClassContent />
    </Suspense>
  );
}

function ETFAssetClassContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AssetClass>(() => {
    const p = searchParams.get("tab");
    return p ? (TAB_PARAM_MAP[p] ?? "Fixed Income") : "Fixed Income";
  });
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  /* Sort state */
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_SORT.key);
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_SORT.dir);
  const [sortOpen, setSortOpen] = useState(false);

  const handleHeaderSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
    } else {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    }
  };

  const toggleBookmark = (sym: string) =>
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(sym)) next.delete(sym);
      else next.add(sym);
      return next;
    });

  const allEtfs = MOCK_DATA[activeTab];
  const etfs = useMemo(
    () => applySort(allEtfs, sortKey, sortDir),
    [allEtfs, sortKey, sortDir],
  );

  /* ── Frozen column measurement ── */
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
    setFrozenW(Math.max(MIN_FROZEN_WIDTH, containerW - visibleSum));
  }, []);

  useEffect(() => {
    measure();
  }, [measure, activeTab, etfs]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  const alignCls = (align: "left" | "center" | "right") =>
    align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right";

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background text-foreground">
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
            Explore by Asset Class
          </motion.h1>
          {/* Right side intentionally empty — tabs already cover asset classes */}
          <div className="h-10 w-10" aria-hidden />
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
              Explore by Asset Class
            </h1>
            <p className="mt-1.5 text-[14px] leading-snug text-muted-foreground">
              Slice ETFs by what they actually hold.
              <br />
              Equities are just one flavor.
            </p>
          </div>
        </motion.div>

        {/* Sticky tabs */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5">
            {ASSET_CLASSES.map((tab, i) => {
              const active = activeTab === tab;
              const count = MOCK_DATA[tab].length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative whitespace-nowrap pt-2 pb-3 text-[14px] font-semibold transition-colors flex items-center gap-1.5",
                    i === 0 ? "pr-3" : "px-3",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span>{tab}</span>
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
                      layoutId="etf-asset-class-tab-underline"
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

      {/* Table */}
      <main
        className="no-scrollbar flex-1 overflow-y-auto"
        onScroll={handleMainScroll}
      >
        <div ref={containerRef} className="pt-2 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              {/* Frozen first column */}
              <div
                className={cn(
                  "shrink-0 border-r transition-colors duration-200",
                  isScrolled ? "border-border/40" : "border-transparent"
                )}
                style={{ width: frozenW ?? MIN_FROZEN_WIDTH }}
              >
                {/* Header cell */}
                <div className="h-[40px] flex items-center pl-5 pr-3 text-[14px] font-medium text-muted-foreground">
                  ETF
                </div>
                {/* Data rows */}
                {etfs.map((etf) => (
                  <div key={etf.symbol} className="h-[80px] flex items-center pl-5 pr-3">
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
                <table ref={tableRef} style={{ minWidth: SCROLLABLE_MIN_WIDTH }}>
                  <thead>
                    <tr className="h-[40px]">
                      {DATA_COLUMNS.map((col, i) => {
                        const sortable = !!col.sortKey;
                        const active = sortable && sortKey === col.sortKey;
                        return (
                          <th
                            key={i}
                            className={cn(
                              "text-[14px] font-medium text-muted-foreground whitespace-nowrap px-3",
                              alignCls(col.align),
                            )}
                            style={{ minWidth: col.minWidth }}
                          >
                            {sortable ? (
                              <button
                                onClick={() => handleHeaderSort(col.sortKey as SortKey)}
                                className={cn(
                                  "inline-flex items-center gap-1 transition-colors",
                                  active ? "text-foreground" : "hover:text-foreground",
                                )}
                              >
                                {active && (
                                  sortDir === "desc"
                                    ? <ArrowDown size={12} strokeWidth={2.5} />
                                    : <ArrowUp size={12} strokeWidth={2.5} />
                                )}
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
                    {etfs.map((etf) => (
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
                                etf.changePercent >= 0 ? "text-gain" : "text-loss"
                              )}
                            >
                              {etf.changePercent >= 0 ? "+" : ""}
                              {etf.changePercent.toFixed(1)}%
                            </span>
                          </div>
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
                        {/* 1Y */}
                        <td className="px-3 whitespace-nowrap text-right">
                          <span
                            className={cn(
                              "tabular-nums text-[14px] font-medium",
                              etf.return1y >= 0 ? "text-gain" : "text-loss"
                            )}
                          >
                            {etf.return1y >= 0 ? "+" : ""}
                            {etf.return1y.toFixed(1)}%
                          </span>
                        </td>
                        {/* 3Y */}
                        <td className="px-3 whitespace-nowrap text-right">
                          <span
                            className={cn(
                              "tabular-nums text-[14px] font-medium",
                              etf.return3y >= 0 ? "text-gain" : "text-loss"
                            )}
                          >
                            {etf.return3y >= 0 ? "+" : ""}
                            {etf.return3y.toFixed(1)}%
                          </span>
                        </td>
                        {/* 5Y */}
                        <td className="px-3 whitespace-nowrap text-right">
                          <span
                            className={cn(
                              "tabular-nums text-[14px] font-medium",
                              etf.return5y >= 0 ? "text-gain" : "text-loss"
                            )}
                          >
                            {etf.return5y >= 0 ? "+" : ""}
                            {etf.return5y.toFixed(1)}%
                          </span>
                        </td>
                        {/* Track Err */}
                        <td className="px-3 whitespace-nowrap text-right">
                          <span className="tabular-nums text-[14px] text-muted-foreground">
                            {etf.trackingError.toFixed(2)}%
                          </span>
                        </td>
                        {/* 1Y Range */}
                        <td className="px-3">
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
                        <td className="px-3">
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
                                    : "text-muted-foreground/50"
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
                        selected ? "border-foreground" : "border-muted-foreground/40",
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
