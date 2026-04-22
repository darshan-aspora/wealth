"use client";

import { Suspense, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Bookmark,
  Check,
  ChevronDown,
} from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import {
  Sheet,
  SheetContent,
  SheetHeader,
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

type MoverType =
  | "gainers"
  | "losers"
  | "most-active"
  | "near-52w-high"
  | "near-52w-low";

type Category = "Broad" | "Sector" | "Bond" | "Intl" | "Thematic" | "Dividend";

/* ------------------------------------------------------------------ */
/*  Tabs & Categories                                                  */
/* ------------------------------------------------------------------ */

const TABS: { id: MoverType; label: string }[] = [
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "most-active", label: "Most Active" },
  { id: "near-52w-high", label: "Near 52W High" },
  { id: "near-52w-low", label: "Near 52W Low" },
];

const CATEGORIES: Category[] = [
  "Broad",
  "Sector",
  "Bond",
  "Intl",
  "Thematic",
  "Dividend",
];

const CATEGORY_LABELS: Record<Category, string> = {
  Broad: "Broad",
  Sector: "Sector",
  Bond: "Bond",
  Intl: "International",
  Thematic: "Thematic",
  Dividend: "Dividend",
};

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const BROAD_ETFS: ETF[] = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", price: 542.18, changePercent: 2.34, aum: "562B", expenseRatio: 0.09, return1y: 28.4, return3y: 12.1, return5y: 14.8, trackingError: 0.02, volume: "78.2M", high52w: 558.0, low52w: 410.3 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: 487.62, changePercent: 3.12, aum: "298B", expenseRatio: 0.20, return1y: 34.7, return3y: 14.8, return5y: 18.2, trackingError: 0.05, volume: "52.1M", high52w: 510.0, low52w: 342.5 },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", price: 224.35, changePercent: 1.87, aum: "72B", expenseRatio: 0.19, return1y: 18.2, return3y: 4.6, return5y: 8.9, trackingError: 0.08, volume: "28.6M", high52w: 240.0, low52w: 162.8 },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", price: 278.91, changePercent: 2.05, aum: "412B", expenseRatio: 0.03, return1y: 27.1, return3y: 11.4, return5y: 14.2, trackingError: 0.01, volume: "4.8M", high52w: 290.0, low52w: 212.4 },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", price: 498.47, changePercent: 2.31, aum: "489B", expenseRatio: 0.03, return1y: 28.2, return3y: 12.0, return5y: 14.7, trackingError: 0.01, volume: "5.1M", high52w: 512.0, low52w: 378.6 },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial Avg", price: 412.83, changePercent: 1.42, aum: "35B", expenseRatio: 0.16, return1y: 20.8, return3y: 9.2, return5y: 11.4, trackingError: 0.04, volume: "3.2M", high52w: 428.0, low52w: 332.8 },
  { symbol: "RSP", name: "Invesco S&P 500 Equal Weight", price: 172.56, changePercent: 1.68, aum: "58B", expenseRatio: 0.20, return1y: 19.5, return3y: 8.8, return5y: 12.1, trackingError: 0.12, volume: "2.9M", high52w: 182.0, low52w: 138.4 },
  { symbol: "MDY", name: "SPDR S&P Midcap 400 ETF Trust", price: 563.21, changePercent: 1.54, aum: "24B", expenseRatio: 0.23, return1y: 16.9, return3y: 6.2, return5y: 10.4, trackingError: 0.06, volume: "1.4M", high52w: 580.0, low52w: 452.8 },
  { symbol: "SCHB", name: "Schwab U.S. Broad Market ETF", price: 61.28, changePercent: 2.08, aum: "28B", expenseRatio: 0.03, return1y: 26.8, return3y: 11.2, return5y: 14.0, trackingError: 0.01, volume: "1.9M", high52w: 64.0, low52w: 48.2 },
  { symbol: "ITOT", name: "iShares Core S&P Total US Stock", price: 114.63, changePercent: 2.01, aum: "52B", expenseRatio: 0.03, return1y: 26.9, return3y: 11.3, return5y: 14.1, trackingError: 0.02, volume: "2.1M", high52w: 118.0, low52w: 88.4 },
  { symbol: "SPLG", name: "SPDR Portfolio S&P 500 ETF", price: 64.75, changePercent: 2.29, aum: "32B", expenseRatio: 0.02, return1y: 28.1, return3y: 11.9, return5y: 14.6, trackingError: 0.01, volume: "6.3M", high52w: 68.0, low52w: 50.2 },
  { symbol: "SPTM", name: "SPDR Portfolio S&P 1500 ETF", price: 68.42, changePercent: 1.95, aum: "8B", expenseRatio: 0.03, return1y: 25.7, return3y: 10.8, return5y: 13.4, trackingError: 0.03, volume: "0.8M", high52w: 72.0, low52w: 54.6 },
  { symbol: "SCHX", name: "Schwab U.S. Large-Cap ETF", price: 63.19, changePercent: 2.22, aum: "39B", expenseRatio: 0.03, return1y: 28.0, return3y: 11.8, return5y: 14.5, trackingError: 0.01, volume: "1.7M", high52w: 66.0, low52w: 49.8 },
  { symbol: "VV", name: "Vanguard Large-Cap ETF", price: 245.38, changePercent: 2.18, aum: "42B", expenseRatio: 0.04, return1y: 27.6, return3y: 11.6, return5y: 14.3, trackingError: 0.02, volume: "0.5M", high52w: 254.0, low52w: 192.4 },
  { symbol: "SPYG", name: "SPDR Portfolio S&P 500 Growth", price: 78.94, changePercent: 2.87, aum: "24B", expenseRatio: 0.04, return1y: 33.2, return3y: 13.4, return5y: 17.1, trackingError: 0.03, volume: "3.4M", high52w: 84.0, low52w: 58.6 },
];

const SECTOR_ETFS: ETF[] = [
  { symbol: "XLK", name: "Technology Select Sector SPDR", price: 218.47, changePercent: 3.42, aum: "68B", expenseRatio: 0.09, return1y: 38.1, return3y: 15.2, return5y: 20.4, trackingError: 0.04, volume: "8.7M", high52w: 232.0, low52w: 164.3 },
  { symbol: "XLF", name: "Financial Select Sector SPDR", price: 43.82, changePercent: 1.78, aum: "42B", expenseRatio: 0.09, return1y: 22.4, return3y: 10.1, return5y: 12.8, trackingError: 0.03, volume: "12.1M", high52w: 46.0, low52w: 33.2 },
  { symbol: "XLV", name: "Health Care Select Sector SPDR", price: 147.23, changePercent: -0.82, aum: "39B", expenseRatio: 0.09, return1y: 8.7, return3y: 5.4, return5y: 9.2, trackingError: 0.03, volume: "7.3M", high52w: 158.0, low52w: 124.7 },
  { symbol: "XLE", name: "Energy Select Sector SPDR", price: 89.56, changePercent: -1.24, aum: "38B", expenseRatio: 0.09, return1y: -4.2, return3y: 18.6, return5y: 8.4, trackingError: 0.05, volume: "14.8M", high52w: 102.0, low52w: 72.1 },
  { symbol: "XLY", name: "Consumer Discret. Select SPDR", price: 192.41, changePercent: 2.15, aum: "22B", expenseRatio: 0.09, return1y: 25.3, return3y: 8.4, return5y: 13.6, trackingError: 0.04, volume: "4.2M", high52w: 204.0, low52w: 152.8 },
  { symbol: "XLI", name: "Industrial Select Sector SPDR", price: 128.67, changePercent: 1.34, aum: "20B", expenseRatio: 0.09, return1y: 19.8, return3y: 10.2, return5y: 12.4, trackingError: 0.03, volume: "6.5M", high52w: 136.0, low52w: 98.4 },
  { symbol: "XLP", name: "Consumer Staples Select SPDR", price: 78.92, changePercent: 0.45, aum: "18B", expenseRatio: 0.09, return1y: 7.2, return3y: 4.8, return5y: 8.6, trackingError: 0.02, volume: "5.8M", high52w: 82.0, low52w: 68.5 },
  { symbol: "XLU", name: "Utilities Select Sector SPDR", price: 72.38, changePercent: 0.92, aum: "16B", expenseRatio: 0.09, return1y: 18.4, return3y: 3.2, return5y: 7.8, trackingError: 0.03, volume: "8.2M", high52w: 78.0, low52w: 58.2 },
  { symbol: "XLRE", name: "Real Estate Select Sector SPDR", price: 41.85, changePercent: 1.12, aum: "7B", expenseRatio: 0.09, return1y: 12.6, return3y: -1.4, return5y: 4.2, trackingError: 0.04, volume: "4.1M", high52w: 46.0, low52w: 34.8 },
  { symbol: "XLC", name: "Communication Svcs Select SPDR", price: 87.29, changePercent: 2.68, aum: "19B", expenseRatio: 0.09, return1y: 32.5, return3y: 12.8, return5y: 14.2, trackingError: 0.05, volume: "5.4M", high52w: 94.0, low52w: 68.4 },
  { symbol: "XLB", name: "Materials Select Sector SPDR", price: 89.14, changePercent: 0.67, aum: "6B", expenseRatio: 0.09, return1y: 9.8, return3y: 6.4, return5y: 10.2, trackingError: 0.03, volume: "3.7M", high52w: 96.0, low52w: 74.2 },
  { symbol: "SMH", name: "VanEck Semiconductor ETF", price: 248.72, changePercent: 4.15, aum: "22B", expenseRatio: 0.35, return1y: 52.4, return3y: 22.8, return5y: 28.6, trackingError: 0.18, volume: "9.8M", high52w: 268.0, low52w: 162.4 },
  { symbol: "IBB", name: "iShares Biotechnology ETF", price: 138.45, changePercent: -0.54, aum: "8B", expenseRatio: 0.44, return1y: 5.1, return3y: -2.8, return5y: 4.6, trackingError: 0.22, volume: "2.8M", high52w: 148.0, low52w: 118.2 },
  { symbol: "KRE", name: "SPDR S&P Regional Banking ETF", price: 54.67, changePercent: 1.92, aum: "3B", expenseRatio: 0.35, return1y: 15.7, return3y: -4.2, return5y: 2.8, trackingError: 0.14, volume: "6.1M", high52w: 58.0, low52w: 38.4 },
  { symbol: "XBI", name: "SPDR S&P Biotech ETF", price: 97.31, changePercent: -0.38, aum: "7B", expenseRatio: 0.35, return1y: 3.9, return3y: -6.8, return5y: 2.4, trackingError: 0.28, volume: "5.3M", high52w: 108.0, low52w: 78.6 },
];

const BOND_ETFS: ETF[] = [
  { symbol: "BND", name: "Vanguard Total Bond Market ETF", price: 72.48, changePercent: 0.12, aum: "112B", expenseRatio: 0.03, return1y: 2.8, return3y: -2.4, return5y: 0.6, trackingError: 0.02, volume: "6.4M", high52w: 76.0, low52w: 68.1 },
  { symbol: "AGG", name: "iShares Core US Aggregate Bond", price: 99.34, changePercent: 0.08, aum: "108B", expenseRatio: 0.03, return1y: 2.6, return3y: -2.6, return5y: 0.4, trackingError: 0.02, volume: "5.8M", high52w: 104.0, low52w: 93.2 },
  { symbol: "TLT", name: "iShares 20+ Year Treasury Bond", price: 92.17, changePercent: -0.45, aum: "52B", expenseRatio: 0.15, return1y: -3.2, return3y: -12.8, return5y: -6.4, trackingError: 0.06, volume: "18.4M", high52w: 108.0, low52w: 82.4 },
  { symbol: "SHY", name: "iShares 1-3 Year Treasury Bond", price: 81.92, changePercent: 0.03, aum: "28B", expenseRatio: 0.15, return1y: 4.1, return3y: 1.8, return5y: 1.2, trackingError: 0.01, volume: "3.2M", high52w: 83.0, low52w: 79.2 },
  { symbol: "IEF", name: "iShares 7-10 Year Treasury Bond", price: 95.63, changePercent: -0.18, aum: "32B", expenseRatio: 0.15, return1y: 0.8, return3y: -5.4, return5y: -1.8, trackingError: 0.03, volume: "4.7M", high52w: 102.0, low52w: 88.4 },
  { symbol: "LQD", name: "iShares iBoxx IG Corp Bond", price: 112.85, changePercent: 0.22, aum: "35B", expenseRatio: 0.14, return1y: 4.5, return3y: -1.2, return5y: 1.4, trackingError: 0.04, volume: "8.1M", high52w: 118.0, low52w: 100.8 },
  { symbol: "HYG", name: "iShares iBoxx HY Corp Bond", price: 78.42, changePercent: 0.35, aum: "18B", expenseRatio: 0.49, return1y: 8.2, return3y: 2.4, return5y: 3.6, trackingError: 0.08, volume: "12.3M", high52w: 82.0, low52w: 72.4 },
  { symbol: "VCSH", name: "Vanguard Short-Term Corp Bond", price: 78.16, changePercent: 0.06, aum: "42B", expenseRatio: 0.04, return1y: 4.8, return3y: 1.6, return5y: 1.8, trackingError: 0.02, volume: "2.4M", high52w: 80.0, low52w: 74.8 },
  { symbol: "VCIT", name: "Vanguard Interm-Term Corp Bond", price: 82.73, changePercent: 0.15, aum: "48B", expenseRatio: 0.04, return1y: 3.9, return3y: -0.8, return5y: 1.2, trackingError: 0.03, volume: "3.1M", high52w: 88.0, low52w: 76.4 },
  { symbol: "VGSH", name: "Vanguard Short-Term Treasury", price: 58.27, changePercent: 0.02, aum: "24B", expenseRatio: 0.04, return1y: 4.2, return3y: 1.4, return5y: 1.0, trackingError: 0.01, volume: "1.8M", high52w: 60.0, low52w: 56.2 },
  { symbol: "MUB", name: "iShares National Muni Bond ETF", price: 108.54, changePercent: 0.09, aum: "38B", expenseRatio: 0.07, return1y: 3.1, return3y: -1.8, return5y: 0.8, trackingError: 0.04, volume: "2.6M", high52w: 112.0, low52w: 102.4 },
  { symbol: "TIP", name: "iShares TIPS Bond ETF", price: 108.91, changePercent: 0.14, aum: "22B", expenseRatio: 0.19, return1y: 2.2, return3y: -1.2, return5y: 2.4, trackingError: 0.03, volume: "3.4M", high52w: 114.0, low52w: 102.8 },
  { symbol: "EMB", name: "iShares JP Morgan EM Bond", price: 88.32, changePercent: 0.28, aum: "16B", expenseRatio: 0.39, return1y: 6.4, return3y: -2.4, return5y: 0.2, trackingError: 0.12, volume: "4.2M", high52w: 94.0, low52w: 78.6 },
  { symbol: "BNDX", name: "Vanguard Total Intl Bond ETF", price: 49.18, changePercent: 0.11, aum: "52B", expenseRatio: 0.07, return1y: 1.8, return3y: -3.2, return5y: -0.4, trackingError: 0.06, volume: "2.8M", high52w: 52.0, low52w: 45.8 },
  { symbol: "SCHZ", name: "Schwab U.S. Aggregate Bond ETF", price: 47.63, changePercent: 0.07, aum: "9B", expenseRatio: 0.03, return1y: 2.7, return3y: -2.5, return5y: 0.5, trackingError: 0.02, volume: "1.5M", high52w: 50.0, low52w: 44.2 },
];

const INTL_ETFS: ETF[] = [
  { symbol: "VEA", name: "Vanguard FTSE Developed Mkts", price: 52.34, changePercent: 1.45, aum: "142B", expenseRatio: 0.05, return1y: 12.8, return3y: 5.4, return5y: 7.2, trackingError: 0.04, volume: "8.7M", high52w: 56.0, low52w: 42.8 },
  { symbol: "IEFA", name: "iShares Core MSCI EAFE ETF", price: 78.92, changePercent: 1.38, aum: "118B", expenseRatio: 0.07, return1y: 12.4, return3y: 5.2, return5y: 7.0, trackingError: 0.05, volume: "9.2M", high52w: 84.0, low52w: 64.2 },
  { symbol: "VWO", name: "Vanguard FTSE Emerging Markets", price: 44.28, changePercent: 0.92, aum: "82B", expenseRatio: 0.08, return1y: 8.7, return3y: -1.2, return5y: 2.8, trackingError: 0.08, volume: "7.4M", high52w: 48.0, low52w: 37.8 },
  { symbol: "EEM", name: "iShares MSCI Emerging Markets", price: 43.15, changePercent: 0.87, aum: "22B", expenseRatio: 0.68, return1y: 8.2, return3y: -1.8, return5y: 2.4, trackingError: 0.12, volume: "28.4M", high52w: 46.0, low52w: 36.2 },
  { symbol: "VXUS", name: "Vanguard Total Intl Stock ETF", price: 62.47, changePercent: 1.28, aum: "68B", expenseRatio: 0.07, return1y: 11.4, return3y: 3.8, return5y: 5.8, trackingError: 0.05, volume: "3.8M", high52w: 66.0, low52w: 52.1 },
  { symbol: "EFA", name: "iShares MSCI EAFE ETF", price: 82.63, changePercent: 1.35, aum: "58B", expenseRatio: 0.32, return1y: 12.1, return3y: 5.0, return5y: 6.8, trackingError: 0.06, volume: "12.6M", high52w: 88.0, low52w: 68.5 },
  { symbol: "FXI", name: "iShares China Large-Cap ETF", price: 28.94, changePercent: 2.84, aum: "7B", expenseRatio: 0.74, return1y: 18.9, return3y: -8.4, return5y: -2.6, trackingError: 0.24, volume: "24.7M", high52w: 34.0, low52w: 22.4 },
  { symbol: "EWJ", name: "iShares MSCI Japan ETF", price: 72.18, changePercent: 0.65, aum: "15B", expenseRatio: 0.50, return1y: 14.2, return3y: 8.4, return5y: 6.2, trackingError: 0.10, volume: "4.8M", high52w: 78.0, low52w: 58.4 },
  { symbol: "INDA", name: "iShares MSCI India ETF", price: 54.82, changePercent: 1.72, aum: "9B", expenseRatio: 0.64, return1y: 22.4, return3y: 14.2, return5y: 12.8, trackingError: 0.18, volume: "5.1M", high52w: 58.0, low52w: 42.6 },
  { symbol: "EWZ", name: "iShares MSCI Brazil ETF", price: 32.47, changePercent: -0.82, aum: "5B", expenseRatio: 0.58, return1y: -6.8, return3y: 4.2, return5y: -2.4, trackingError: 0.22, volume: "16.2M", high52w: 38.0, low52w: 26.4 },
  { symbol: "EWG", name: "iShares MSCI Germany ETF", price: 31.56, changePercent: 1.24, aum: "3B", expenseRatio: 0.50, return1y: 15.7, return3y: 4.8, return5y: 5.4, trackingError: 0.12, volume: "2.4M", high52w: 34.0, low52w: 24.8 },
  { symbol: "EWT", name: "iShares MSCI Taiwan ETF", price: 52.83, changePercent: 2.15, aum: "5B", expenseRatio: 0.57, return1y: 24.8, return3y: 8.6, return5y: 14.2, trackingError: 0.16, volume: "3.6M", high52w: 58.0, low52w: 40.2 },
  { symbol: "EWY", name: "iShares MSCI South Korea ETF", price: 62.41, changePercent: 1.48, aum: "4B", expenseRatio: 0.57, return1y: 11.2, return3y: -2.4, return5y: 3.8, trackingError: 0.14, volume: "2.8M", high52w: 68.0, low52w: 52.4 },
  { symbol: "KWEB", name: "KraneShares CSI China Internet", price: 28.17, changePercent: 3.12, aum: "6B", expenseRatio: 0.69, return1y: 21.5, return3y: -12.4, return5y: -6.8, trackingError: 0.32, volume: "12.4M", high52w: 36.0, low52w: 20.8 },
  { symbol: "MCHI", name: "iShares MSCI China ETF", price: 48.92, changePercent: 2.56, aum: "7B", expenseRatio: 0.59, return1y: 19.2, return3y: -6.8, return5y: -1.4, trackingError: 0.20, volume: "4.7M", high52w: 54.0, low52w: 38.2 },
];

const THEMATIC_ETFS: ETF[] = [
  { symbol: "ARKK", name: "ARK Innovation ETF", price: 48.92, changePercent: 4.85, aum: "8.2B", expenseRatio: 0.75, return1y: 32.4, return3y: -18.2, return5y: -4.8, trackingError: 2.42, volume: "22.6M", high52w: 56.0, low52w: 32.8 },
  { symbol: "BOTZ", name: "Global X Robotics & AI ETF", price: 32.45, changePercent: 2.92, aum: "2.8B", expenseRatio: 0.68, return1y: 28.6, return3y: 4.2, return5y: 8.4, trackingError: 1.84, volume: "1.2M", high52w: 36.0, low52w: 24.2 },
  { symbol: "LIT", name: "Global X Lithium & Battery ETF", price: 42.18, changePercent: -1.45, aum: "4.2B", expenseRatio: 0.75, return1y: -12.4, return3y: -22.8, return5y: 2.6, trackingError: 2.18, volume: "3.4M", high52w: 56.0, low52w: 36.4 },
  { symbol: "TAN", name: "Invesco Solar ETF", price: 38.56, changePercent: -2.18, aum: "1.8B", expenseRatio: 0.67, return1y: -18.2, return3y: -28.4, return5y: -4.2, trackingError: 2.84, volume: "2.8M", high52w: 52.0, low52w: 32.8 },
  { symbol: "HACK", name: "ETFMG Prime Cyber Security ETF", price: 62.34, changePercent: 1.82, aum: "2.4B", expenseRatio: 0.60, return1y: 22.8, return3y: 8.4, return5y: 14.2, trackingError: 1.24, volume: "0.8M", high52w: 68.0, low52w: 48.6 },
  { symbol: "QCLN", name: "First Trust NASDAQ Clean Edge", price: 34.67, changePercent: -1.68, aum: "1.2B", expenseRatio: 0.58, return1y: -8.4, return3y: -16.2, return5y: 2.8, trackingError: 2.06, volume: "0.6M", high52w: 44.0, low52w: 28.4 },
  { symbol: "ARKG", name: "ARK Genomic Revolution ETF", price: 28.45, changePercent: 3.24, aum: "2.1B", expenseRatio: 0.75, return1y: 18.6, return3y: -24.8, return5y: -8.4, trackingError: 2.68, volume: "4.2M", high52w: 34.0, low52w: 22.6 },
  { symbol: "ICLN", name: "iShares Global Clean Energy ETF", price: 12.84, changePercent: -1.92, aum: "3.4B", expenseRatio: 0.40, return1y: -14.8, return3y: -24.2, return5y: -2.8, trackingError: 1.92, volume: "5.8M", high52w: 18.0, low52w: 10.8 },
  { symbol: "BLOK", name: "Amplify Transformational Data ETF", price: 28.92, changePercent: 3.48, aum: "0.8B", expenseRatio: 0.71, return1y: 42.8, return3y: -8.4, return5y: 6.2, trackingError: 2.14, volume: "1.4M", high52w: 34.0, low52w: 18.4 },
  { symbol: "ROBO", name: "Robo Global Robotics & Auto ETF", price: 54.23, changePercent: 1.56, aum: "1.6B", expenseRatio: 0.95, return1y: 18.4, return3y: 2.8, return5y: 8.8, trackingError: 1.48, volume: "0.4M", high52w: 58.0, low52w: 42.8 },
  { symbol: "ARKW", name: "ARK Next Gen Internet ETF", price: 72.45, changePercent: 3.82, aum: "1.8B", expenseRatio: 0.75, return1y: 38.2, return3y: -12.4, return5y: 4.2, trackingError: 2.36, volume: "2.2M", high52w: 82.0, low52w: 48.6 },
  { symbol: "SKYY", name: "First Trust Cloud Computing ETF", price: 78.34, changePercent: 2.14, aum: "3.2B", expenseRatio: 0.60, return1y: 24.6, return3y: 6.8, return5y: 12.4, trackingError: 1.12, volume: "0.6M", high52w: 84.0, low52w: 58.2 },
  { symbol: "DRIV", name: "Global X Autonomous & EV ETF", price: 24.56, changePercent: 1.28, aum: "1.4B", expenseRatio: 0.68, return1y: 14.2, return3y: -8.6, return5y: 4.8, trackingError: 1.76, volume: "0.8M", high52w: 28.0, low52w: 18.4 },
  { symbol: "FINX", name: "Global X FinTech ETF", price: 22.18, changePercent: 2.42, aum: "0.6B", expenseRatio: 0.68, return1y: 28.4, return3y: -14.8, return5y: -2.4, trackingError: 1.98, volume: "0.3M", high52w: 26.0, low52w: 16.8 },
  { symbol: "MOON", name: "Direxion Moonshot Innovators ETF", price: 8.42, changePercent: 4.28, aum: "0.1B", expenseRatio: 0.65, return1y: 34.8, return3y: -32.4, return5y: -18.2, trackingError: 3.42, volume: "0.2M", high52w: 12.0, low52w: 5.8 },
];

const DIVIDEND_ETFS: ETF[] = [
  { symbol: "VYM", name: "Vanguard High Dividend Yield ETF", price: 118.42, changePercent: 0.82, aum: "62B", expenseRatio: 0.06, return1y: 14.8, return3y: 8.4, return5y: 10.2, trackingError: 0.04, volume: "2.8M", high52w: 124.0, low52w: 98.4 },
  { symbol: "SCHD", name: "Schwab U.S. Dividend Equity ETF", price: 78.56, changePercent: 0.68, aum: "58B", expenseRatio: 0.06, return1y: 12.4, return3y: 8.8, return5y: 12.6, trackingError: 0.06, volume: "4.2M", high52w: 82.0, low52w: 68.2 },
  { symbol: "DVY", name: "iShares Select Dividend ETF", price: 124.34, changePercent: 0.54, aum: "22B", expenseRatio: 0.38, return1y: 10.2, return3y: 6.4, return5y: 8.8, trackingError: 0.08, volume: "1.4M", high52w: 130.0, low52w: 108.4 },
  { symbol: "HDV", name: "iShares Core High Dividend ETF", price: 108.67, changePercent: 0.42, aum: "12B", expenseRatio: 0.08, return1y: 8.6, return3y: 7.2, return5y: 8.4, trackingError: 0.06, volume: "0.8M", high52w: 114.0, low52w: 92.8 },
  { symbol: "DGRO", name: "iShares Core Dividend Growth ETF", price: 58.23, changePercent: 1.12, aum: "28B", expenseRatio: 0.08, return1y: 18.2, return3y: 10.4, return5y: 12.8, trackingError: 0.04, volume: "2.2M", high52w: 62.0, low52w: 48.6 },
  { symbol: "NOBL", name: "ProShares S&P 500 Dividend Arist.", price: 98.45, changePercent: 0.72, aum: "12B", expenseRatio: 0.35, return1y: 12.8, return3y: 7.8, return5y: 10.4, trackingError: 0.08, volume: "0.6M", high52w: 104.0, low52w: 84.2 },
  { symbol: "SPYD", name: "SPDR Portfolio S&P 500 High Div", price: 42.18, changePercent: 0.48, aum: "8B", expenseRatio: 0.07, return1y: 8.4, return3y: 5.6, return5y: 7.2, trackingError: 0.06, volume: "3.4M", high52w: 44.0, low52w: 36.8 },
  { symbol: "VIG", name: "Vanguard Dividend Appreciation ETF", price: 182.34, changePercent: 1.24, aum: "82B", expenseRatio: 0.06, return1y: 20.4, return3y: 10.8, return5y: 13.2, trackingError: 0.03, volume: "1.8M", high52w: 190.0, low52w: 152.4 },
  { symbol: "SDY", name: "SPDR S&P Dividend ETF", price: 134.56, changePercent: 0.62, aum: "22B", expenseRatio: 0.35, return1y: 11.8, return3y: 7.2, return5y: 9.6, trackingError: 0.08, volume: "0.8M", high52w: 140.0, low52w: 114.8 },
  { symbol: "DGRW", name: "WisdomTree U.S. Quality Div Growth", price: 72.84, changePercent: 1.08, aum: "14B", expenseRatio: 0.28, return1y: 22.4, return3y: 12.2, return5y: 14.8, trackingError: 0.10, volume: "0.6M", high52w: 76.0, low52w: 58.4 },
  { symbol: "RDIV", name: "Invesco S&P Ultra Dividend Rev ETF", price: 42.67, changePercent: 0.34, aum: "1.2B", expenseRatio: 0.39, return1y: 6.8, return3y: 4.2, return5y: 6.4, trackingError: 0.14, volume: "0.2M", high52w: 46.0, low52w: 36.4 },
  { symbol: "FDL", name: "First Trust Morningstar Div Leaders", price: 38.92, changePercent: 0.58, aum: "4.8B", expenseRatio: 0.45, return1y: 10.4, return3y: 6.8, return5y: 8.2, trackingError: 0.12, volume: "0.4M", high52w: 42.0, low52w: 32.8 },
  { symbol: "SPHD", name: "Invesco S&P 500 High Div Low Vol", price: 48.23, changePercent: 0.42, aum: "3.6B", expenseRatio: 0.30, return1y: 8.2, return3y: 5.4, return5y: 7.8, trackingError: 0.08, volume: "0.6M", high52w: 52.0, low52w: 40.4 },
  { symbol: "JEPI", name: "JPMorgan Equity Premium Income", price: 56.78, changePercent: 0.28, aum: "34B", expenseRatio: 0.35, return1y: 9.8, return3y: 8.2, return5y: 0.0, trackingError: 0.18, volume: "4.8M", high52w: 58.0, low52w: 48.2 },
  { symbol: "JEPQ", name: "JPMorgan Nasdaq Equity Premium", price: 52.34, changePercent: 1.42, aum: "16B", expenseRatio: 0.35, return1y: 24.8, return3y: 0.0, return5y: 0.0, trackingError: 0.22, volume: "3.2M", high52w: 56.0, low52w: 42.8 },
];

const ETF_DATA: Record<Category, ETF[]> = {
  Broad: BROAD_ETFS,
  Sector: SECTOR_ETFS,
  Bond: BOND_ETFS,
  Intl: INTL_ETFS,
  Thematic: THEMATIC_ETFS,
  Dividend: DIVIDEND_ETFS,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function applyMoverType(etfs: ETF[], moverType: MoverType): ETF[] {
  const list = [...etfs];
  switch (moverType) {
    case "gainers":
      return list
        .map((e, i) => ({
          ...e,
          changePercent: Math.abs(e.changePercent) + (i * 0.12),
        }))
        .sort((a, b) => b.changePercent - a.changePercent);
    case "losers":
      return list
        .map((e, i) => ({
          ...e,
          changePercent: -(Math.abs(e.changePercent) + (i * 0.14)),
        }))
        .sort((a, b) => a.changePercent - b.changePercent);
    case "most-active":
      return list.sort((a, b) => {
        const parseVol = (v: string) => parseFloat(v.replace("M", ""));
        return parseVol(b.volume) - parseVol(a.volume);
      });
    case "near-52w-high":
      return list
        .map((e) => ({
          ...e,
          price: e.high52w * 0.97,
          changePercent: Math.abs(e.changePercent) * 0.5,
        }))
        .sort((a, b) => {
          const aPct = (a.high52w - a.price) / a.high52w;
          const bPct = (b.high52w - b.price) / b.high52w;
          return aPct - bPct;
        });
    case "near-52w-low":
      return list
        .map((e) => ({
          ...e,
          price: e.low52w * 1.03,
          changePercent: -(Math.abs(e.changePercent) * 0.8),
        }))
        .sort((a, b) => {
          const aPct = (a.price - a.low52w) / a.low52w;
          const bPct = (b.price - b.low52w) / b.low52w;
          return aPct - bPct;
        });
    default:
      return list;
  }
}

// Cache to keep stable across re-renders
const DATA_CACHE: Record<string, ETF[]> = {};

function getETFs(category: Category, moverType: MoverType): ETF[] {
  const key = `${category}-${moverType}`;
  if (!DATA_CACHE[key]) {
    DATA_CACHE[key] = applyMoverType(ETF_DATA[category], moverType);
  }
  return DATA_CACHE[key];
}

function parseAUM(aum: string): number {
  // Convert "562B" / "2.8B" / "0.1B" to numeric billions
  return parseFloat(aum.replace(/[^0-9.]/g, ""));
}

function parseVolume(v: string): number {
  return parseFloat(v.replace("M", ""));
}

/* ------------------------------------------------------------------ */
/*  Sort config                                                        */
/* ------------------------------------------------------------------ */

type SortKey =
  | "changePercent"
  | "return1y"
  | "aum"
  | "expenseRatio"
  | "volume";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "changePercent", label: "Change %" },
  { key: "return1y", label: "1Y Return" },
  { key: "aum", label: "AUM" },
  { key: "expenseRatio", label: "Expense Ratio" },
  { key: "volume", label: "Volume" },
];

const applySort = (etfs: ETF[], key: SortKey, dir: SortDir) => {
  const mul = dir === "asc" ? 1 : -1;
  const val = (e: ETF): number => {
    switch (key) {
      case "changePercent": return e.changePercent;
      case "return1y": return e.return1y;
      case "aum": return parseAUM(e.aum);
      case "expenseRatio": return e.expenseRatio;
      case "volume": return parseVolume(e.volume);
    }
  };
  return [...etfs].sort((a, b) => (val(a) - val(b)) * mul);
};

/* ------------------------------------------------------------------ */
/*  Column config                                                      */
/* ------------------------------------------------------------------ */

interface Column {
  header: string;
  align: "left" | "center" | "right";
  minWidth?: number;
  sortKey?: SortKey;
}

const COLUMNS: Column[] = [
  { header: "ETF", align: "left" },
  { header: "Price", align: "right", minWidth: 80, sortKey: "changePercent" },
  { header: "AUM", align: "right", minWidth: 72, sortKey: "aum" },
  { header: "Exp%", align: "right", minWidth: 58, sortKey: "expenseRatio" },
  { header: "1Y", align: "right", minWidth: 72, sortKey: "return1y" },
  { header: "3Y", align: "right", minWidth: 72 },
  { header: "5Y", align: "right", minWidth: 72 },
  { header: "Track Err", align: "right", minWidth: 78 },
  { header: "1Y Range", align: "center", minWidth: 136 },
  { header: "Volume", align: "right", minWidth: 78, sortKey: "volume" },
  { header: "Watchlist", align: "center", minWidth: 80 },
];

/* ------------------------------------------------------------------ */
/*  Range Bar                                                          */
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
    <div className="flex items-center gap-1.5 w-full min-w-[100px]">
      <span className="text-[12px] tabular-nums text-muted-foreground whitespace-nowrap leading-none">
        {low.toFixed(0)}
      </span>
      <div className="relative flex-1 h-[3px] rounded-full bg-muted">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[12px] w-[2px] bg-foreground rounded-full"
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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ETFTopMoversPage() {
  return (
    <Suspense>
      <ETFTopMoversContent />
    </Suspense>
  );
}

function ETFTopMoversContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<MoverType>(() => {
    const p = searchParams.get("tab");
    return TABS.some((t) => t.id === p) ? (p as MoverType) : "gainers";
  });
  const [category, setCategory] = useState<Category>("Broad");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  /* Sort + sheet state */
  const [sortKey, setSortKey] = useState<SortKey>("changePercent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [categoryOpen, setCategoryOpen] = useState(false);
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
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym);
      else n.add(sym);
      return n;
    });

  const rawETFs = getETFs(category, activeTab);
  const etfs = useMemo(
    () => applySort(rawETFs, sortKey, sortDir),
    [rawETFs, sortKey, sortDir],
  );

  const frozenCol = COLUMNS[0];
  const scrollCols = COLUMNS.slice(1);

  const alignCls = (align?: "left" | "center" | "right") =>
    align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right";

  /* Frozen column width measurement */
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
    if (ths.length < 2) return;
    let visibleSum = 0;
    for (let i = 0; i < 2; i++) {
      visibleSum += ths[i].getBoundingClientRect().width;
    }
    const containerW = container.getBoundingClientRect().width;
    setFrozenW(Math.max(120, containerW - visibleSum));
  }, []);

  useEffect(() => {
    measure();
  }, [measure, etfs, category]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  /* Build row data */
  const rows = etfs.map((etf) => {
    const chgPositive = etf.changePercent >= 0;
    const chgColor = chgPositive ? "text-emerald-500" : "text-red-500";
    return [
      /* Frozen: ETF name + logo */
      <div key="name" className="flex items-center gap-2.5">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
        <p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">
          {etf.name}
        </p>
      </div>,
      /* Price + Chg% stacked */
      <div key="price" className="flex flex-col items-end">
        <span className="whitespace-nowrap tabular-nums text-[14px] text-foreground">
          {etf.price.toFixed(1)}
        </span>
        <span className={cn("whitespace-nowrap tabular-nums text-[12px] font-semibold", chgColor)}>
          {chgPositive ? "+" : ""}{etf.changePercent.toFixed(1)}%
        </span>
      </div>,
      /* AUM */
      <span key="aum" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
        {etf.aum}
      </span>,
      /* Expense Ratio */
      <span key="exp" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
        {etf.expenseRatio.toFixed(2)}%
      </span>,
      /* 1Y Return */
      <span key="1y" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", etf.return1y >= 0 ? "text-emerald-500" : "text-red-500")}>
        {etf.return1y >= 0 ? "+" : ""}{etf.return1y.toFixed(1)}%
      </span>,
      /* 3Y Return */
      <span key="3y" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", etf.return3y >= 0 ? "text-emerald-500" : "text-red-500")}>
        {etf.return3y >= 0 ? "+" : ""}{etf.return3y.toFixed(1)}%
      </span>,
      /* 5Y Return */
      <span key="5y" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", etf.return5y >= 0 ? "text-emerald-500" : "text-red-500")}>
        {etf.return5y >= 0 ? "+" : ""}{etf.return5y.toFixed(1)}%
      </span>,
      /* Tracking Error */
      <span key="trackerr" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
        {etf.trackingError.toFixed(2)}%
      </span>,
      /* 1Y Range */
      <RangeBar key="range" low={etf.low52w} high={etf.high52w} current={etf.price} />,
      /* Volume */
      <span key="vol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
        {etf.volume}
      </span>,
      /* Watchlist */
      <div key="watch" className="flex justify-center">
        <button onClick={() => toggleBookmark(etf.symbol)} className="transition-transform active:scale-90">
          <Bookmark
            size={20}
            strokeWidth={1.8}
            className={cn(
              "transition-colors",
              bookmarks.has(etf.symbol) ? "fill-foreground text-foreground" : "text-muted-foreground/50",
            )}
          />
        </button>
      </div>,
    ];
  });

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
            ETF Top Movers
          </motion.h1>
          {/* Category selector */}
          <button
            onClick={() => setCategoryOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-[14px] font-semibold text-foreground active:scale-[0.97] transition-transform"
          >
            <span className="leading-none">{CATEGORY_LABELS[category]}</span>
            <ChevronDown size={15} className="flex-shrink-0 text-muted-foreground" />
          </button>
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
              ETF Top Movers
            </h1>
            <p className="mt-1.5 text-[14px] leading-snug text-muted-foreground">
              Biggest ETF gainers, losers, and busiest funds today.
              <br />
              Diversified baskets still swing — know what&apos;s driving them.
            </p>
          </div>
        </motion.div>

        {/* Sticky tabs */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5">
            {TABS.map((t, i) => {
              const active = t.id === activeTab;
              const count = getETFs(category, t.id).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "relative whitespace-nowrap pt-2 pb-3 text-[14px] font-semibold transition-colors flex items-center gap-1.5",
                    i === 0 ? "pr-3" : "px-3",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span>{t.label}</span>
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
                      layoutId="etf-movers-tab-underline"
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

      {/* Scrollable Table */}
      <main
        className="no-scrollbar flex-1 overflow-y-auto"
        onScroll={handleMainScroll}
      >
        <div ref={containerRef} className="pt-2 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${category}`}
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
                  isScrolled ? "border-border/40" : "border-transparent",
                )}
                style={{ width: frozenW ?? 120 }}
              >
                <div className={cn("h-[40px] flex items-center pl-5 pr-3 text-[14px] font-medium text-muted-foreground", alignCls(frozenCol?.align))}>
                  {frozenCol?.header}
                </div>
                {rows.map((row, i) => (
                  <div key={i} className="h-[64px] flex items-center pl-5 pr-3">
                    {row[0]}
                  </div>
                ))}
              </div>

              {/* Scrollable columns */}
              <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-x-auto no-scrollbar min-w-0">
                <table ref={tableRef} style={{ minWidth: 820 }}>
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
                            style={col.minWidth ? { minWidth: col.minWidth } : undefined}
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
                    {rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="h-[64px]">
                        {row.slice(1).map((cell, colIdx) => (
                          <td
                            key={colIdx}
                            className={cn(
                              "px-3 whitespace-nowrap",
                              alignCls(scrollCols[colIdx]?.align),
                            )}
                          >
                            {cell}
                          </td>
                        ))}
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

      {/* Category sheet */}
      <CategorySheet
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        category={category}
        onChange={(c) => {
          setCategory(c);
          setCategoryOpen(false);
        }}
      />

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
/*  Category sheet                                                     */
/* ------------------------------------------------------------------ */

function CategorySheet({
  open,
  onOpenChange,
  category,
  onChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  category: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-[28px] p-0 border-0 max-h-[80vh] overflow-y-auto"
      >
        <SheetHeader className="px-5 pt-5 pb-3 text-center sm:text-center">
          <SheetTitle className="text-[20px] font-bold tracking-tight">
            Category
          </SheetTitle>
        </SheetHeader>
        <div className="px-2 pb-6">
          {CATEGORIES.map((c) => {
            const selected = c === category;
            return (
              <button
                key={c}
                onClick={() => onChange(c)}
                className={cn(
                  "w-full flex items-center justify-between rounded-2xl px-3 py-3.5 transition-colors",
                  selected ? "bg-foreground/[0.05]" : "active:bg-muted/40",
                )}
              >
                <span className="text-[16px] font-semibold text-foreground">
                  {CATEGORY_LABELS[c]}
                </span>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    selected ? "bg-foreground border-foreground" : "border-border/60",
                  )}
                >
                  {selected && (
                    <Check size={12} strokeWidth={3} className="text-background" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Sort sheet                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_SORT: { key: SortKey; dir: SortDir } = { key: "changePercent", dir: "desc" };

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
