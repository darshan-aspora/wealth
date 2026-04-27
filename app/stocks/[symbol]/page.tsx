"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Search, Bookmark, Share2, Maximize2, X, AlarmClockPlus, ArrowRight, ChevronDown, Info } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { createChart, AreaSeries, ColorType } from "lightweight-charts";
import type { IChartApi } from "lightweight-charts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Button } from "@/components/ui/button";
import { ScrollablePillTabs } from "@/components/ui/scrollable-pill-tabs";
import { useAI } from "@/contexts/ai-context";
import { StockTabs } from "@/app/shared-components/stock-tabs";
import { StockNewsTab } from "../stock-news-tab";
import { StockEventsTab } from "../stock-events-tab";
import { StockOwnershipTab } from "../stock-ownership-tab";
import { StockMyOrdersTab } from "../stock-my-orders-tab";
import { StockMySipTab } from "../stock-my-sip-tab";

// ─── Types ──────────────────────────────────────────────────────────────────

type MarketState = "open" | "afterHours" | "closed";

// ─── Mock Data ──────────────────────────────────────────────────────────────

interface StockInfo {
  symbol: string;
  exchange: string;
  name: string;
  price: number;
  dayChange: number;
  dayChangePct: number;
  afterHoursChange: number;
  afterHoursChangePct: number;
  marketCap: string;
  capCategory: string;
}

const stocks: StockInfo[] = [
  {
    symbol: "AAPL", exchange: "NASDAQ", name: "Apple Inc.",
    price: 198.11, dayChange: 3.24, dayChangePct: 1.66,
    afterHoursChange: 0.74, afterHoursChangePct: 0.37,
    marketCap: "3.07T", capCategory: "Mega Cap",
  },
  {
    symbol: "NVDA", exchange: "NASDAQ", name: "NVIDIA Corp.",
    price: 124.92, dayChange: 5.87, dayChangePct: 4.93,
    afterHoursChange: 1.12, afterHoursChangePct: 0.90,
    marketCap: "3.09T", capCategory: "Mega Cap",
  },
  {
    symbol: "INTC", exchange: "NASDAQ", name: "Intel Corp.",
    price: 22.14, dayChange: -1.38, dayChangePct: -5.87,
    afterHoursChange: -0.42, afterHoursChangePct: -1.90,
    marketCap: "95.2B", capCategory: "Large Cap",
  },
  {
    symbol: "SNAP", exchange: "NYSE", name: "Snap Inc.",
    price: 8.72, dayChange: -0.64, dayChangePct: -6.84,
    afterHoursChange: -0.18, afterHoursChangePct: -2.06,
    marketCap: "14.1B", capCategory: "Mid Cap",
  },
  {
    symbol: "MSFT", exchange: "NASDAQ", name: "Microsoft Corp.",
    price: 428.15, dayChange: 11.32, dayChangePct: 2.71,
    afterHoursChange: 1.84, afterHoursChangePct: 0.43,
    marketCap: "3.18T", capCategory: "Mega Cap",
  },
  {
    symbol: "AMZN", exchange: "NASDAQ", name: "Amazon.com Inc.",
    price: 186.42, dayChange: 5.72, dayChangePct: 3.17,
    afterHoursChange: 0.92, afterHoursChangePct: 0.49,
    marketCap: "1.96T", capCategory: "Mega Cap",
  },
  {
    symbol: "META", exchange: "NASDAQ", name: "Meta Platforms Inc.",
    price: 523.80, dayChange: 18.54, dayChangePct: 3.69,
    afterHoursChange: 2.12, afterHoursChangePct: 0.40,
    marketCap: "1.34T", capCategory: "Mega Cap",
  },
  {
    symbol: "GOOGL", exchange: "NASDAQ", name: "Alphabet Inc.",
    price: 152.67, dayChange: -5.84, dayChangePct: -3.68,
    afterHoursChange: -0.62, afterHoursChangePct: -0.41,
    marketCap: "1.91T", capCategory: "Mega Cap",
  },
  {
    symbol: "TSLA", exchange: "NASDAQ", name: "Tesla Inc.",
    price: 178.24, dayChange: -12.38, dayChangePct: -6.48,
    afterHoursChange: -1.44, afterHoursChangePct: -0.81,
    marketCap: "568B", capCategory: "Large Cap",
  },
  {
    symbol: "PLTR", exchange: "NYSE", name: "Palantir Technologies Inc.",
    price: 24.85, dayChange: 2.76, dayChangePct: 12.46,
    afterHoursChange: 0.38, afterHoursChangePct: 1.53,
    marketCap: "54B", capCategory: "Mid Cap",
  },
  {
    symbol: "COIN", exchange: "NASDAQ", name: "Coinbase Global Inc.",
    price: 178.42, dayChange: 15.56, dayChangePct: 9.57,
    afterHoursChange: 1.82, afterHoursChangePct: 1.02,
    marketCap: "42B", capCategory: "Mid Cap",
  },
  {
    symbol: "SHOP", exchange: "NYSE", name: "Shopify Inc.",
    price: 78.35, dayChange: 5.43, dayChangePct: 7.43,
    afterHoursChange: 0.64, afterHoursChangePct: 0.82,
    marketCap: "98B", capCategory: "Large Cap",
  },
  {
    symbol: "SQ", exchange: "NYSE", name: "Block Inc.",
    price: 72.18, dayChange: 4.22, dayChangePct: 6.21,
    afterHoursChange: 0.58, afterHoursChangePct: 0.80,
    marketCap: "43B", capCategory: "Mid Cap",
  },
  {
    symbol: "ABNB", exchange: "NASDAQ", name: "Airbnb Inc.",
    price: 156.73, dayChange: 8.14, dayChangePct: 5.48,
    afterHoursChange: 0.72, afterHoursChangePct: 0.46,
    marketCap: "98B", capCategory: "Large Cap",
  },
  {
    symbol: "CRWD", exchange: "NASDAQ", name: "CrowdStrike Holdings Inc.",
    price: 312.80, dayChange: 12.62, dayChangePct: 4.20,
    afterHoursChange: 1.44, afterHoursChangePct: 0.46,
    marketCap: "72B", capCategory: "Large Cap",
  },
  {
    symbol: "DDOG", exchange: "NASDAQ", name: "Datadog Inc.",
    price: 124.60, dayChange: 3.74, dayChangePct: 3.10,
    afterHoursChange: 0.52, afterHoursChangePct: 0.42,
    marketCap: "39B", capCategory: "Mid Cap",
  },
  {
    symbol: "ZS", exchange: "NASDAQ", name: "Zscaler Inc.",
    price: 218.40, dayChange: 5.74, dayChangePct: 2.70,
    afterHoursChange: 0.88, afterHoursChangePct: 0.40,
    marketCap: "31B", capCategory: "Mid Cap",
  },
  {
    symbol: "HUBS", exchange: "NYSE", name: "HubSpot Inc.",
    price: 582.40, dayChange: 13.58, dayChangePct: 2.39,
    afterHoursChange: 2.24, afterHoursChangePct: 0.38,
    marketCap: "30B", capCategory: "Mid Cap",
  },
  {
    symbol: "VEEV", exchange: "NYSE", name: "Veeva Systems Inc.",
    price: 198.50, dayChange: 3.68, dayChangePct: 1.89,
    afterHoursChange: 0.76, afterHoursChangePct: 0.38,
    marketCap: "32B", capCategory: "Mid Cap",
  },
  {
    symbol: "IONQ", exchange: "NYSE", name: "IonQ Inc.",
    price: 12.45, dayChange: 2.14, dayChangePct: 20.76,
    afterHoursChange: 0.24, afterHoursChangePct: 1.93,
    marketCap: "2.7B", capCategory: "Small Cap",
  },
  {
    symbol: "SMCI", exchange: "NASDAQ", name: "Super Micro Computer Inc.",
    price: 28.73, dayChange: 3.88, dayChangePct: 15.62,
    afterHoursChange: 0.42, afterHoursChangePct: 1.46,
    marketCap: "15B", capCategory: "Mid Cap",
  },
  {
    symbol: "SOUN", exchange: "NASDAQ", name: "SoundHound AI Inc.",
    price: 5.42, dayChange: 0.68, dayChangePct: 14.35,
    afterHoursChange: 0.08, afterHoursChangePct: 1.48,
    marketCap: "1.8B", capCategory: "Small Cap",
  },
  {
    symbol: "JOBY", exchange: "NYSE", name: "Joby Aviation Inc.",
    price: 6.78, dayChange: 0.74, dayChangePct: 12.24,
    afterHoursChange: 0.12, afterHoursChangePct: 1.77,
    marketCap: "4.5B", capCategory: "Small Cap",
  },
  {
    symbol: "MARA", exchange: "NASDAQ", name: "Marathon Digital Holdings Inc.",
    price: 18.92, dayChange: 1.84, dayChangePct: 10.77,
    afterHoursChange: 0.28, afterHoursChangePct: 1.48,
    marketCap: "5.6B", capCategory: "Small Cap",
  },
  {
    symbol: "JPM", exchange: "NYSE", name: "JPMorgan Chase & Co.",
    price: 198.73, dayChange: -3.44, dayChangePct: -1.70,
    afterHoursChange: -0.52, afterHoursChangePct: -0.26,
    marketCap: "572B", capCategory: "Large Cap",
  },
  {
    symbol: "RIVN", exchange: "NASDAQ", name: "Rivian Automotive Inc.",
    price: 15.63, dayChange: -1.42, dayChangePct: -8.33,
    afterHoursChange: -0.28, afterHoursChangePct: -1.79,
    marketCap: "16B", capCategory: "Mid Cap",
  },
  {
    symbol: "HOOD", exchange: "NASDAQ", name: "Robinhood Markets Inc.",
    price: 18.45, dayChange: -1.24, dayChangePct: -6.30,
    afterHoursChange: -0.34, afterHoursChangePct: -1.84,
    marketCap: "16B", capCategory: "Mid Cap",
  },
  {
    symbol: "LYFT", exchange: "NASDAQ", name: "Lyft Inc.",
    price: 14.82, dayChange: -0.87, dayChangePct: -5.55,
    afterHoursChange: -0.18, afterHoursChangePct: -1.21,
    marketCap: "5.8B", capCategory: "Small Cap",
  },
  {
    symbol: "DKNG", exchange: "NASDAQ", name: "DraftKings Inc.",
    price: 35.67, dayChange: -1.78, dayChangePct: -4.76,
    afterHoursChange: -0.42, afterHoursChangePct: -1.18,
    marketCap: "34B", capCategory: "Mid Cap",
  },
  {
    symbol: "ROKU", exchange: "NASDAQ", name: "Roku Inc.",
    price: 62.40, dayChange: -2.94, dayChangePct: -4.50,
    afterHoursChange: -0.62, afterHoursChangePct: -0.99,
    marketCap: "9B", capCategory: "Small Cap",
  },
  {
    symbol: "AVGO", exchange: "NASDAQ", name: "Broadcom Inc.",
    price: 168.42, dayChange: 3.82, dayChangePct: 2.32,
    afterHoursChange: 0.72, afterHoursChangePct: 0.43,
    marketCap: "788B", capCategory: "Large Cap",
  },
  {
    symbol: "LLY", exchange: "NYSE", name: "Eli Lilly and Company",
    price: 748.32, dayChange: 12.44, dayChangePct: 1.69,
    afterHoursChange: 2.84, afterHoursChangePct: 0.38,
    marketCap: "712B", capCategory: "Large Cap",
  },
  {
    symbol: "UNH", exchange: "NYSE", name: "UnitedHealth Group Inc.",
    price: 528.44, dayChange: -4.82, dayChangePct: -0.90,
    afterHoursChange: -0.98, afterHoursChangePct: -0.19,
    marketCap: "486B", capCategory: "Large Cap",
  },
  {
    symbol: "ABBV", exchange: "NYSE", name: "AbbVie Inc.",
    price: 168.84, dayChange: 1.42, dayChangePct: 0.85,
    afterHoursChange: 0.38, afterHoursChangePct: 0.23,
    marketCap: "296B", capCategory: "Large Cap",
  },
  {
    symbol: "COST", exchange: "NASDAQ", name: "Costco Wholesale Corp.",
    price: 862.44, dayChange: 8.24, dayChangePct: 0.96,
    afterHoursChange: 1.64, afterHoursChangePct: 0.19,
    marketCap: "384B", capCategory: "Large Cap",
  },
  {
    symbol: "WMT", exchange: "NYSE", name: "Walmart Inc.",
    price: 58.90, dayChange: -0.54, dayChangePct: -0.91,
    afterHoursChange: -0.12, afterHoursChangePct: -0.20,
    marketCap: "474B", capCategory: "Large Cap",
  },
  {
    symbol: "HD", exchange: "NYSE", name: "The Home Depot Inc.",
    price: 342.18, dayChange: 2.84, dayChangePct: 0.84,
    afterHoursChange: 0.62, afterHoursChangePct: 0.18,
    marketCap: "339B", capCategory: "Large Cap",
  },
  {
    symbol: "XOM", exchange: "NYSE", name: "Exxon Mobil Corp.",
    price: 104.20, dayChange: -1.28, dayChangePct: -1.22,
    afterHoursChange: -0.24, afterHoursChangePct: -0.23,
    marketCap: "422B", capCategory: "Large Cap",
  },
  {
    symbol: "MA", exchange: "NYSE", name: "Mastercard Inc.",
    price: 482.64, dayChange: 5.82, dayChangePct: 1.22,
    afterHoursChange: 1.24, afterHoursChangePct: 0.26,
    marketCap: "447B", capCategory: "Large Cap",
  },
  {
    symbol: "PG", exchange: "NYSE", name: "Procter & Gamble Co.",
    price: 158.34, dayChange: 0.92, dayChangePct: 0.58,
    afterHoursChange: 0.22, afterHoursChangePct: 0.14,
    marketCap: "372B", capCategory: "Large Cap",
  },
  {
    symbol: "MNST", exchange: "NASDAQ", name: "Monster Beverage Corp.",
    price: 48.62, dayChange: 0.58, dayChangePct: 1.21,
    afterHoursChange: 0.12, afterHoursChangePct: 0.25,
    marketCap: "48B", capCategory: "Mid Cap",
  },
  {
    symbol: "MRVL", exchange: "NASDAQ", name: "Marvell Technology Inc.",
    price: 62.84, dayChange: 1.44, dayChangePct: 2.34,
    afterHoursChange: 0.32, afterHoursChangePct: 0.51,
    marketCap: "55B", capCategory: "Mid Cap",
  },
  {
    symbol: "NET", exchange: "NYSE", name: "Cloudflare Inc.",
    price: 94.28, dayChange: 2.14, dayChangePct: 2.32,
    afterHoursChange: 0.42, afterHoursChangePct: 0.45,
    marketCap: "31B", capCategory: "Mid Cap",
  },
  {
    symbol: "OKTA", exchange: "NASDAQ", name: "Okta Inc.",
    price: 88.40, dayChange: -2.64, dayChangePct: -2.90,
    afterHoursChange: -0.44, afterHoursChangePct: -0.50,
    marketCap: "15B", capCategory: "Mid Cap",
  },
  {
    symbol: "PANW", exchange: "NASDAQ", name: "Palo Alto Networks Inc.",
    price: 322.44, dayChange: 4.82, dayChangePct: 1.52,
    afterHoursChange: 0.94, afterHoursChangePct: 0.29,
    marketCap: "108B", capCategory: "Large Cap",
  },
  {
    symbol: "FTNT", exchange: "NASDAQ", name: "Fortinet Inc.",
    price: 72.84, dayChange: 1.24, dayChangePct: 1.73,
    afterHoursChange: 0.28, afterHoursChangePct: 0.38,
    marketCap: "56B", capCategory: "Mid Cap",
  },
  {
    symbol: "TTD", exchange: "NASDAQ", name: "The Trade Desk Inc.",
    price: 68.42, dayChange: 1.84, dayChangePct: 2.76,
    afterHoursChange: 0.32, afterHoursChangePct: 0.47,
    marketCap: "34B", capCategory: "Mid Cap",
  },
  {
    symbol: "UBER", exchange: "NYSE", name: "Uber Technologies Inc.",
    price: 71.40, dayChange: 1.34, dayChangePct: 1.91,
    afterHoursChange: 0.28, afterHoursChangePct: 0.39,
    marketCap: "151B", capCategory: "Large Cap",
  },
  {
    symbol: "UPST", exchange: "NASDAQ", name: "Upstart Holdings Inc.",
    price: 38.42, dayChange: 1.22, dayChangePct: 3.28,
    afterHoursChange: 0.24, afterHoursChangePct: 0.62,
    marketCap: "3.2B", capCategory: "Small Cap",
  },
  {
    symbol: "MDB", exchange: "NASDAQ", name: "MongoDB Inc.",
    price: 248.64, dayChange: 5.44, dayChangePct: 2.24,
    afterHoursChange: 0.98, afterHoursChangePct: 0.39,
    marketCap: "18B", capCategory: "Mid Cap",
  },
  {
    symbol: "SNOW", exchange: "NYSE", name: "Snowflake Inc.",
    price: 148.28, dayChange: 3.12, dayChangePct: 2.15,
    afterHoursChange: 0.64, afterHoursChangePct: 0.43,
    marketCap: "51B", capCategory: "Mid Cap",
  },
  {
    symbol: "WDAY", exchange: "NASDAQ", name: "Workday Inc.",
    price: 234.82, dayChange: 3.84, dayChangePct: 1.66,
    afterHoursChange: 0.84, afterHoursChangePct: 0.36,
    marketCap: "49B", capCategory: "Mid Cap",
  },
  {
    symbol: "CRM", exchange: "NYSE", name: "Salesforce Inc.",
    price: 298.44, dayChange: 4.24, dayChangePct: 1.44,
    afterHoursChange: 0.98, afterHoursChangePct: 0.33,
    marketCap: "290B", capCategory: "Large Cap",
  },
  {
    symbol: "APP", exchange: "NASDAQ", name: "AppLovin Corp.",
    price: 91.40, dayChange: 3.34, dayChangePct: 3.79,
    afterHoursChange: 0.54, afterHoursChangePct: 0.59,
    marketCap: "31B", capCategory: "Mid Cap",
  },
  {
    symbol: "ASTS", exchange: "NASDAQ", name: "AST SpaceMobile Inc.",
    price: 18.84, dayChange: 0.84, dayChangePct: 4.67,
    afterHoursChange: 0.22, afterHoursChangePct: 1.17,
    marketCap: "4.2B", capCategory: "Small Cap",
  },
  {
    symbol: "RKLB", exchange: "NASDAQ", name: "Rocket Lab USA Inc.",
    price: 7.82, dayChange: 0.16, dayChangePct: 2.09,
    afterHoursChange: 0.08, afterHoursChangePct: 1.02,
    marketCap: "3.9B", capCategory: "Small Cap",
  },
  {
    symbol: "DUOL", exchange: "NASDAQ", name: "Duolingo Inc.",
    price: 248.64, dayChange: 6.84, dayChangePct: 2.83,
    afterHoursChange: 0.98, afterHoursChangePct: 0.39,
    marketCap: "11B", capCategory: "Mid Cap",
  },
  {
    symbol: "MELI", exchange: "NASDAQ", name: "MercadoLibre Inc.",
    price: 1842.50, dayChange: 21.82, dayChangePct: 1.20,
    afterHoursChange: 6.44, afterHoursChangePct: 0.35,
    marketCap: "93B", capCategory: "Large Cap",
  },
  {
    symbol: "LULU", exchange: "NASDAQ", name: "Lululemon Athletica Inc.",
    price: 282.44, dayChange: -4.84, dayChangePct: -1.68,
    afterHoursChange: -0.82, afterHoursChangePct: -0.29,
    marketCap: "34B", capCategory: "Mid Cap",
  },
];

const StockContext = createContext<StockInfo>(stocks[0]);
const useStock = () => useContext(StockContext);

const tabs = [
  "Overview",
  "Revenue",
  "Financials",
  "Options",
  "Technical",
  "News",
  "Ownership",
  "Events",
  "My Orders",
  "My SIP",
];

// ─── Components ─────────────────────────────────────────────────────────────

function StocksHeader({ compact }: { compact: boolean }) {
  const stock = useStock();
  const router = useRouter();
  const isUp = stock.dayChange >= 0;

  return (
    <header className={cn(
      "px-4 py-3 transition-all duration-200",
      compact && "bg-background/80 backdrop-blur-xl"
    )}>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Button>

        {/* Compact info — visible on scroll */}
        <AnimatePresence>
          {compact && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1 mx-3 min-w-0"
            >
              <p className="text-[15px] font-bold text-foreground truncate">{stock.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold tabular-nums text-foreground">
                  {stock.price.toFixed(2)}
                </span>
                <span className={cn("text-[13px] font-semibold tabular-nums", isUp ? "text-gain" : "text-loss")}>
                  {isUp ? "+" : ""}{stock.dayChange.toFixed(2)} ({isUp ? "+" : ""}{stock.dayChangePct.toFixed(2)}%)
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground"
          >
            <Search size={18} strokeWidth={1.8} />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground"
          >
            <Bookmark size={18} strokeWidth={1.8} />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground"
          >
            <Share2 size={18} strokeWidth={1.8} />
          </Button>
        </div>
      </div>
    </header>
  );
}

function Logo({ size = 44, onClick }: { size?: number; onClick?: () => void }) {
  const stock = useStock();
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full bg-muted active:scale-95 transition-transform overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://s3-symbol-logo.tradingview.com/${stock.symbol.toLowerCase()}--big.svg`}
        alt={stock.name}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </button>
  );
}

function TabBar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <StockTabs
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabs={tabs}
      className="sticky top-0 z-10"
    />
  );
}

// ─── Chart Data Generation ──────────────────────────────────────────────────

type ChartPeriod = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "All";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Gaussian-ish noise from uniform random (Box-Muller lite)
function gaussNoise(rand: () => number) {
  const u1 = rand();
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(Math.max(u1, 0.0001))) * Math.cos(2 * Math.PI * u2);
}

// Price ranges per stock per period: [startPrice, endPrice]
const priceRanges: Record<string, Record<ChartPeriod, [number, number]>> = {
  AAPL: {
    "1D": [194.87, 198.11], "1W": [191.50, 198.11], "1M": [185.20, 198.11], "3M": [178.40, 198.11],
    "6M": [168.40, 198.11], "1Y": [152.30, 198.11], "5Y": [72.50, 198.11], "All": [28.00, 198.11],
  },
  NVDA: {
    "1D": [119.05, 124.92], "1W": [112.80, 124.92], "1M": [98.50, 124.92], "3M": [82.30, 124.92],
    "6M": [65.20, 124.92], "1Y": [42.80, 124.92], "5Y": [14.50, 124.92], "All": [4.20, 124.92],
  },
  INTC: {
    "1D": [23.52, 22.14], "1W": [25.80, 22.14], "1M": [28.40, 22.14], "3M": [31.20, 22.14],
    "6M": [35.60, 22.14], "1Y": [42.80, 22.14], "5Y": [58.20, 22.14], "All": [68.00, 22.14],
  },
  SNAP: {
    "1D": [9.36, 8.72], "1W": [11.20, 8.72], "1M": [13.80, 8.72], "3M": [15.60, 8.72],
    "6M": [18.50, 8.72], "1Y": [22.40, 8.72], "5Y": [48.00, 8.72], "All": [72.00, 8.72],
  },
};

// Volatility per period — shorter periods have tighter moves, longer ones have bigger swings
const periodVolatility: Record<ChartPeriod, number> = {
  "1D": 0.0015, "1W": 0.004, "1M": 0.010, "3M": 0.014, "6M": 0.018,
  "1Y": 0.022, "5Y": 0.030, "All": 0.035,
};

function generateData(symbol: string, period: ChartPeriod) {
  const configs: Record<ChartPeriod, { bars: number; interval: number }> = {
    "1D": { bars: 78, interval: 5 * 60 },
    "1W": { bars: 39, interval: 60 * 60 },
    "1M": { bars: 22, interval: 24 * 60 * 60 },
    "3M": { bars: 65, interval: 24 * 60 * 60 },
    "6M": { bars: 130, interval: 24 * 60 * 60 },
    "1Y": { bars: 252, interval: 24 * 60 * 60 },
    "5Y": { bars: 260, interval: 7 * 24 * 60 * 60 },
    "All": { bars: 300, interval: 30 * 24 * 60 * 60 },
  };

  const fallbackStock = stocks.find((item) => item.symbol === symbol) ?? stocks[0];
  const [startPrice, endPrice] = priceRanges[symbol]?.[period] ?? [fallbackStock.price * 0.9, fallbackStock.price];
  const { bars, interval } = configs[period];
  const vol = periodVolatility[period];
  const baseTime = 1772803800;

  // Seed from symbol + period for deterministic results
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i) * (i + 1) * 137;
  seed += period.charCodeAt(0) * 997 + period.length * 31;
  const rand = seededRandom(seed);

  // Target drift per bar to reach endPrice from startPrice
  const totalReturn = Math.log(endPrice / startPrice);
  const driftPerBar = totalReturn / bars;

  const data: { time: number; value: number }[] = [];
  let price = startPrice;

  // Generate random walk with drift
  for (let i = 0; i < bars; i++) {
    data.push({ time: baseTime + i * interval, value: +price.toFixed(2) });

    // Mean-reverting random walk: drift + noise + occasional jumps
    const noise = gaussNoise(rand) * vol * price;
    const jump = rand() < 0.06 ? gaussNoise(rand) * vol * price * 2.5 : 0; // ~6% chance of a gap/spike
    const meanRevert = (startPrice + (endPrice - startPrice) * (i / bars) - price) * 0.03;

    price = price * Math.exp(driftPerBar) + noise + jump + meanRevert;
    price = Math.max(price, startPrice * 0.15); // floor to prevent going to 0
  }

  // Snap last point to exact end price
  if (data.length > 0) data[data.length - 1].value = endPrice;

  return data;
}

// ─── Chart Component ────────────────────────────────────────────────────────

const periods: ChartPeriod[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y", "All"];

// ─── AI Typing Hooks ────────────────────────────────────────────────────────

const aiPhrases = [
  "Summarise AAPL earnings",
  "Why is this stock moving?",
  "Compare with MSFT",
  "Show me key financials",
  "Is this a good entry point?",
  "Explain the P/E ratio",
];

function usePhraseRotation(phrases: string[], intervalMs = 5000) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % phrases.length), intervalMs);
    return () => clearInterval(id);
  }, [reduceMotion, phrases.length, intervalMs]);
  return phrases[index];
}

function useTypewriter(text: string, speed = 35) {
  const [displayed, setDisplayed] = useState("");
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) { setDisplayed(text); return; }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i > text.length) { clearInterval(id); return; }
      setDisplayed(text.slice(0, i));
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduceMotion]);
  return displayed;
}

function AiTypingText() {
  const phrase = usePhraseRotation(aiPhrases);
  const typed = useTypewriter(phrase);
  const done = typed.length >= phrase.length;

  return (
    <>
      <span className="font-semibold">{typed}</span>
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          className="inline-block w-[2px] h-[14px] bg-foreground align-[-2px] ml-0.5"
        />
      )}
    </>
  );
}

function formatCrosshairTime(timestamp: number, period: ChartPeriod) {
  const d = new Date(timestamp * 1000);
  if (period === "1D") {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  if (period === "1W") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  if (period === "1M" || period === "3M") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface SelectionPoint { price: number; time: number; x: number; y: number; index: number }

function StockChart({ height = 360, onExpand, period, onPeriodChange }: {
  height?: number;
  onExpand?: () => void;
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
}) {
  const stock = useStock();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const highlightRef = useRef<any>(null);
  const crosshairRef = useRef<SelectionPoint | null>(null);
  const [crosshairData, setCrosshairData] = useState<{ price: number; time: number; x: number } | null>(null);
  const [lastPricePos, setLastPricePos] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<SelectionPoint[]>([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isGain = stock.dayChange >= 0;
  const lineColor = isGain ? "hsl(142, 71%, 45%)" : "hsl(0, 72%, 51%)";
  const mutedLineColor = isDark ? "hsl(240, 5%, 35%)" : "hsl(240, 5%, 75%)";
  const mutedGradient = isDark ? "rgba(150, 150, 150, 0.08)" : "rgba(150, 150, 150, 0.06)";
  const gainColor = "hsl(142, 71%, 45%)";
  const lossColor = "hsl(0, 72%, 51%)";

  const data = useMemo(() => generateData(stock.symbol, period), [period, stock.symbol]);

  const { minPrice, maxPrice } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (const d of data) {
      if (d.value < min) min = d.value;
      if (d.value > max) max = d.value;
    }
    return { minPrice: min, maxPrice: max };
  }, [data]);

  const [minMaxY, setMinMaxY] = useState<{ minY: number | null; maxY: number | null }>({ minY: null, maxY: null });

  // Reset selection when period changes
  useEffect(() => { setSelection([]); }, [period]);

  // Compute delta between two selected points
  const delta = useMemo(() => {
    if (selection.length !== 2) return null;
    const [a, b] = selection[0].time <= selection[1].time ? [selection[0], selection[1]] : [selection[1], selection[0]];
    const change = +(b.price - a.price).toFixed(2);
    const changePct = +((change / a.price) * 100).toFixed(2);
    return { a, b, change, changePct, isUp: change >= 0 };
  }, [selection]);

  // Apply or remove highlight series when selection changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Remove old highlight
    if (highlightRef.current) {
      chart.removeSeries(highlightRef.current);
      highlightRef.current = null;
    }

    if (delta) {
      const { a, b } = delta;
      const startIdx = Math.min(a.index, b.index);
      const endIdx = Math.max(a.index, b.index);
      const segmentData = data.slice(startIdx, endIdx + 1);

      const hlColor = delta.isUp ? gainColor : lossColor;
      const hlGradient = delta.isUp
        ? (isDark ? "rgba(34, 197, 94, 0.30)" : "rgba(34, 197, 94, 0.22)")
        : (isDark ? "rgba(239, 68, 68, 0.30)" : "rgba(239, 68, 68, 0.22)");

      const hlSeries = chart.addSeries(AreaSeries, {
        lineColor: hlColor,
        lineWidth: 3,
        topColor: hlGradient,
        bottomColor: "transparent",
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });

      hlSeries.setData(segmentData.map((d) => ({
        time: d.time as import("lightweight-charts").Time,
        value: d.value,
      })));

      highlightRef.current = hlSeries;

      // Make base series muted
      if (seriesRef.current) {
        seriesRef.current.applyOptions({
          lineColor: mutedLineColor,
          topColor: mutedGradient,
        });
      }
    } else {
      // Restore base series colors
      const topGradient = isGain
        ? (isDark ? "rgba(34, 197, 94, 0.25)" : "rgba(34, 197, 94, 0.18)")
        : (isDark ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.18)");

      if (seriesRef.current) {
        seriesRef.current.applyOptions({
          lineColor: lineColor,
          topColor: topGradient,
        });
      }
    }
  }, [delta, data, isDark, isGain, lineColor, mutedLineColor, mutedGradient]);

  // Update selection dot positions on scroll/resize
  const updateSelectionCoords = useCallback(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;

    setSelection((prev) =>
      prev.map((pt) => {
        const y = series.priceToCoordinate(pt.price);
        const tc = chart.timeScale().timeToCoordinate(pt.time as import("lightweight-charts").Time);
        return { ...pt, x: tc ?? pt.x, y: y ?? pt.y };
      })
    );
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "hsl(240, 5%, 55%)" : "hsl(240, 3.8%, 46.1%)",
        fontFamily: "system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        visible: false,
        borderVisible: false,
      },
      leftPriceScale: {
        visible: false,
        borderVisible: false,
      },
      timeScale: {
        visible: false,
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 2,
      },
      crosshair: {
        horzLine: { visible: false, labelVisible: false },
        vertLine: { visible: true, labelVisible: false, style: 3, color: isDark ? "hsl(240, 5%, 30%)" : "hsl(240, 5%, 70%)" },
      },
      handleScroll: false,
      handleScale: false,
    });

    const topGradient = isGain
      ? (isDark ? "rgba(34, 197, 94, 0.25)" : "rgba(34, 197, 94, 0.18)")
      : (isDark ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.18)");

    const series = chart.addSeries(AreaSeries, {
      lineColor: lineColor,
      lineWidth: 2,
      topColor: topGradient,
      bottomColor: "transparent",
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBackgroundColor: lineColor,
    });

    series.setData(data.map((d) => ({ time: d.time as import("lightweight-charts").Time, value: d.value })));
    chart.timeScale().fitContent();

    seriesRef.current = series;

    // Track Y position of last price for dot overlay
    const lastPoint = data[data.length - 1];
    const updateOverlayPositions = () => {
      if (lastPoint) {
        const y = series.priceToCoordinate(lastPoint.value);
        const x = chart.timeScale().timeToCoordinate(lastPoint.time as import("lightweight-charts").Time);
        if (y != null && x != null) {
          setLastPricePos({ x, y });
        } else {
          setLastPricePos(null);
        }
      }
      const minY = series.priceToCoordinate(minPrice);
      const maxY = series.priceToCoordinate(maxPrice);
      setMinMaxY({ minY: minY ?? null, maxY: maxY ?? null });
    };
    updateOverlayPositions();
    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      updateOverlayPositions();
      updateSelectionCoords();
    });

    chartRef.current = chart;

    // Selection — click (mobile) + drag (desktop)
    let dragStart: SelectionPoint | null = null;
    let isDragging = false;

    const pointFromCrosshair = () => crosshairRef.current;

    const el = containerRef.current;

    // Crosshair move — tooltip + track position for drag
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData.size || !param.point) {
        setCrosshairData(null);
        return;
      }
      const val = param.seriesData.get(series);
      if (!val || !("value" in val)) return;
      const price = (val as { value: number }).value;
      const time = param.time as number;
      const x = param.point.x;
      const y = series.priceToCoordinate(price) ?? param.point.y;
      const index = data.findIndex((d) => d.time === time);
      const pt = { price, time, x, y, index };

      crosshairRef.current = pt;
      setCrosshairData({ price: pt.price, time: pt.time, x: pt.x });

      // Live update during drag
      if (isDragging && dragStart && pt.time !== dragStart.time) {
        setSelection([dragStart, pt]);
      }
    });

    // Click — for mobile tap selection
    chart.subscribeClick(() => {
      if (isDragging) return; // Ignore click if it was a drag
      const pt = pointFromCrosshair();
      if (!pt) return;
      setSelection((prev) => {
        if (prev.length < 2) return [...prev, pt];
        return [pt]; // Reset on third tap
      });
    });

    // Drag — for desktop
    const onMouseDown = () => {
      isDragging = false;
      const pt = pointFromCrosshair();
      if (pt) {
        dragStart = pt;
      }
    };

    const onMouseMove = () => {
      if (dragStart) isDragging = true;
    };

    const onMouseUp = () => {
      if (isDragging && dragStart && crosshairRef.current) {
        const end = crosshairRef.current;
        if (end.time !== dragStart.time) {
          setSelection([dragStart, end]);
        }
      }
      dragStart = null;
      // Reset isDragging after a tick so click handler can check it
      setTimeout(() => { isDragging = false; }, 50);
    };

    el?.addEventListener("mousedown", onMouseDown);
    el?.addEventListener("mousemove", onMouseMove);
    el?.addEventListener("mouseup", onMouseUp);

    const cleanup = () => {
      el?.removeEventListener("mousedown", onMouseDown);
      el?.removeEventListener("mousemove", onMouseMove);
      el?.removeEventListener("mouseup", onMouseUp);
    };

    return () => {
      cleanup();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
        highlightRef.current = null;
      }
    };
  }, [data, isDark, lineColor, height, updateSelectionCoords, isGain, maxPrice, minPrice]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && chartRef.current) {
        chartRef.current.applyOptions({ width: entry.contentRect.width });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative">
      {!delta && (
        <div className="absolute top-2 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <button
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80 active:scale-95 transition-transform"
            aria-label="Set alert"
          >
            <AlarmClockPlus size={18} strokeWidth={2} />
          </button>
          {onExpand && (
            <button
              onClick={onExpand}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80 active:scale-95 transition-transform"
              aria-label="Expand chart"
            >
              <Maximize2 size={18} strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      {/* Delta pills — positioned at selection points, or centered when too close */}
      {delta && (() => {
        const leftPt = delta.a.x <= delta.b.x ? delta.a : delta.b;
        const rightPt = delta.a.x <= delta.b.x ? delta.b : delta.a;
        const gap = rightPt.x - leftPt.x;
        const useAbsolute = gap > 180;

        const PricePill = ({ pt }: { pt: SelectionPoint }) => (
          <div className="rounded-lg bg-background border border-border/60 shadow-sm px-2 py-1 flex flex-col items-center">
            <p className="text-[13px] font-bold tabular-nums text-foreground leading-none whitespace-nowrap">
              {pt.price.toFixed(2)}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground whitespace-nowrap">
              {formatCrosshairTime(pt.time, period)}
            </p>
          </div>
        );

        const DeltaPill = ({ fill }: { fill?: boolean }) => (
          <div className={cn(
            "rounded-lg border shadow-sm px-2 py-1 flex flex-col items-center",
            fill && "flex-1 min-w-0",
            delta.isUp ? "bg-gain/10 border-gain/20" : "bg-loss/10 border-loss/20"
          )}>
            <p className={cn("text-[13px] font-bold tabular-nums leading-none whitespace-nowrap", delta.isUp ? "text-gain" : "text-loss")}>
              {delta.isUp ? "+" : ""}{delta.change.toFixed(2)}
            </p>
            <p className={cn("mt-0.5 text-[12px] font-semibold tabular-nums whitespace-nowrap", delta.isUp ? "text-gain" : "text-loss")}>
              {delta.isUp ? "+" : ""}{delta.changePct.toFixed(2)}%
            </p>
          </div>
        );

        if (!useAbsolute) {
          // Compact: centered flex row, all content-sized
          const center = leftPt.x + gap / 2;
          return (
            <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none" style={{ height: 40 }}>
              <div className="absolute -translate-x-1/2 flex items-stretch gap-1.5" style={{ left: center }}>
                <PricePill pt={leftPt} />
                <DeltaPill fill={false} />
                <PricePill pt={rightPt} />
              </div>
            </div>
          );
        }

        // Spread: each price pill centered on its line, delta fills the gap
        // Measure from pill centers: left pill right edge = leftPt.x + halfPill
        // right pill left edge = rightPt.x - halfPill, 6px gap on each side
        const pillHalf = 42;
        const gapPx = 6;
        const deltaLeft = leftPt.x + pillHalf + gapPx;
        const deltaWidth = rightPt.x - pillHalf - gapPx - deltaLeft;

        return (
          <div className="absolute top-2 left-0 right-0 z-10 pointer-events-none" style={{ height: 40 }}>
            <div className="absolute -translate-x-1/2" style={{ left: leftPt.x }}>
              <PricePill pt={leftPt} />
            </div>
            {deltaWidth > 0 && (
              <div className="absolute top-0" style={{ left: deltaLeft, width: deltaWidth }}>
                <DeltaPill fill />
              </div>
            )}
            <div className="absolute -translate-x-1/2" style={{ left: rightPt.x }}>
              <PricePill pt={rightPt} />
            </div>
          </div>
        );
      })()}

      {/* Crosshair tooltip — follows vertical line, hidden when delta shown */}
      {crosshairData && !delta && (
        <div
          className="absolute top-2 z-10 pointer-events-none -translate-x-1/2"
          style={{ left: crosshairData.x }}
        >
          <div className="rounded-lg bg-background border border-border/60 shadow-sm px-2.5 py-1.5 flex flex-col items-center">
            <p className="text-[13px] font-bold tabular-nums text-foreground leading-none whitespace-nowrap">
              {crosshairData.price.toFixed(2)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground whitespace-nowrap">
              {formatCrosshairTime(crosshairData.time, period)}
            </p>
          </div>
        </div>
      )}

      <div ref={containerRef} className="w-full" />

      {/* Min/Max horizontal lines */}
      {(() => {
        if (minMaxY.maxY == null || minMaxY.minY == null) return null;

        const maxIdx = data.findIndex((d) => d.value === maxPrice);
        const minIdx = data.findIndex((d) => d.value === minPrice);
        const maxOnRight = maxIdx > data.length / 2;
        const minOnRight = minIdx > data.length / 2;

        const HLine = ({ y, price, labelLeft, prefix }: { y: number; price: number; labelLeft: boolean; prefix: string }) => (
          <>
            <div
              className="absolute left-0 right-0 pointer-events-none border-t border-dashed border-muted-foreground/25"
              style={{ top: y }}
            />
            <span
              className={cn(
                "absolute pointer-events-none text-[11px] tabular-nums font-medium text-muted-foreground/60 whitespace-nowrap -translate-y-1/2",
                labelLeft ? "left-2" : "right-2"
              )}
              style={{ top: y }}
            >
              {prefix}{price.toFixed(2)}
            </span>
          </>
        );

        return (
          <>
            <HLine y={minMaxY.maxY} price={maxPrice} labelLeft={maxOnRight} prefix="H: " />
            <HLine y={minMaxY.minY} price={minPrice} labelLeft={minOnRight} prefix="L: " />
          </>
        );
      })()}

      {/* Selection dots */}
      {selection.map((pt, i) => (
        <div
          key={i}
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: pt.x, top: pt.y }}
        >
          <span
            className="block h-[10px] w-[10px] rounded-full border-2 border-background"
            style={{ backgroundColor: delta ? (delta.isUp ? gainColor : lossColor) : lineColor }}
          />
        </div>
      ))}

      {/* Last price dot — hidden during selection */}
      {lastPricePos && selection.length === 0 && (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: lastPricePos.x, top: lastPricePos.y }}
        >
          <span
            className="block h-[8px] w-[8px] rounded-full animate-pulse"
            style={{ backgroundColor: lineColor }}
          />
        </div>
      )}

      {/* Period selector */}
      <div className="flex items-center justify-center px-4 pt-2">
        <div className="flex items-center gap-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[14px] font-semibold transition-colors",
                period === p
                  ? "bg-foreground text-background"
                  : "text-muted-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Fullscreen Chart ───────────────────────────────────────────────────────

function FullscreenChart({ onClose, period, onPeriodChange }: { onClose: () => void; period: ChartPeriod; onPeriodChange: (p: ChartPeriod) => void }) {
  const stock = useStock();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-background flex flex-col max-w-[430px] mx-auto"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-[16px] font-bold text-foreground">{stock.name}</p>
          <p className="text-[13px] text-muted-foreground">{stock.symbol} : {stock.exchange}</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
      <div className="flex-1 px-0">
        <StockChart height={400} period={period} onPeriodChange={onPeriodChange} />
      </div>
    </motion.div>
  );
}

// ─── Overview Widgets ────────────────────────────────────────────────────────

function SectionHeader({ title, right, className }: { title: string; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      <h3 className="text-[17px] font-bold text-foreground">{title}</h3>
      {right}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function KVRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[14px] text-muted-foreground">{label}</span>
      <span className={cn("text-[14px] font-semibold tabular-nums", valueColor || "text-foreground")}>{value}</span>
    </div>
  );
}

// ── Your Holding ──

function YourHolding() {
  return (
    <div className="px-4 pt-5 pb-5">
      <SectionHeader
        title="Your Holding"
        right={<button className="text-[13px] font-medium text-muted-foreground">Details &rsaquo;</button>}
      />
      <div className="grid grid-cols-3 gap-y-3">
        <div>
          <p className="text-[12px] text-muted-foreground">Invested Amt</p>
          <p className="text-[15px] font-bold text-foreground tabular-nums">500</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Current Value</p>
          <p className="text-[15px] font-bold text-foreground tabular-nums">680.5</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Total Return</p>
          <p className="text-[15px] font-bold text-gain tabular-nums">180.5 +35%</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Shares</p>
          <p className="text-[15px] font-bold text-foreground tabular-nums">1.002134</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Today&apos;s Return</p>
          <p className="text-[15px] font-bold text-gain tabular-nums">03.4 -0.5%</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Est. XIRR</p>
          <p className="text-[15px] font-bold text-foreground tabular-nums">12.4%</p>
        </div>
      </div>
    </div>
  );
}

// ── Key Numbers ──

function RangeBarInline({ low, high, current }: { low: number; high: number; current: number }) {
  const pct = Math.max(0, Math.min(100, ((current - low) / (high - low || 1)) * 100));
  return (
    <div className="relative h-[4px] w-[98px] rounded-full bg-[rgba(14,15,17,0.12)]">
      {/* green fill from start to current position */}
      <div
        className="absolute left-0 top-0 h-full rounded-full bg-[#22C55E]"
        style={{ width: `${pct}%` }}
      />
      {/* marker at current position */}
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[10px] bg-[#22C55E] rounded-sm"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}

function RangeStat({
  label, value, low, high, current, sub,
}: {
  label: string; value: string; low: number; high: number; current: number; sub?: string;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="text-[14px] text-muted-foreground">{label}</p>
      <p className="text-[16px] font-medium text-foreground tabular-nums">{value}</p>
      <RangeBarInline low={low} high={high} current={current} />
      {sub && <p className="text-[12px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function StatItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="text-[14px] text-muted-foreground">{label}</p>
      <p className="text-[16px] font-medium text-foreground tabular-nums">{value}</p>
      {sub && <p className="text-[12px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function KeyNumbers() {
  const current = 211.40;
  return (
    <div className="px-4 pt-5 pb-5">
      <SectionHeader title="Key Numbers" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <RangeStat label="Today's Range" value="208.50 - 214.20" low={208.50} high={214.20} current={current} sub="Intraday +1.5% vol surge" />
          <RangeStat label="1 Year Range" value="164.08 - 237.23" low={164.08} high={237.23} current={current} />
          <RangeStat label="3 Year's Range" value="124.17 - 237.23" low={124.17} high={237.23} current={current} />
          <StatItem label="Dividend Yield" value="0.52%" />
        </div>
        {/* Right column */}
        <div className="flex flex-col gap-6">
          <StatItem label="Today's Volume" value="68.4 M" sub="+13% up vs 3M average" />
          <StatItem label="Revenue" value="$391.0 B" sub="+4% YoY growth" />
          <StatItem label="Profit Margin" value="26.4%" />
          <StatItem label="P/E Ratio" value="33.42" />
        </div>
      </div>
    </div>
  );
}

// ── Market Depth ──

type BidRow = { orders: number; qty: number; bid: number };
type AskRow = { ask: number; qty: number; orders: number };

function generateDepth(midPrice: number): { bids: BidRow[]; asks: AskRow[] } {
  const spread = 0.05;
  const bids: BidRow[] = Array.from({ length: 5 }, (_, i) => ({
    bid: parseFloat((midPrice - spread * (i + 1) - Math.random() * 0.03).toFixed(2)),
    qty: Math.floor(Math.random() * 18) + 1,
    orders: Math.floor(Math.random() * 6),
  }));
  const asks: AskRow[] = Array.from({ length: 5 }, (_, i) => ({
    ask: parseFloat((midPrice + spread * (i + 1) + Math.random() * 0.03).toFixed(2)),
    qty: Math.floor(Math.random() * 18) + 1,
    orders: Math.floor(Math.random() * 6),
  }));
  return { bids, asks };
}

function MarketDepth() {
  const midPrice = 211.40;
  const [depth, setDepth] = useState(() => generateDepth(midPrice));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [time, setTime] = useState(() => new Date());
  const [hoveredBid, setHoveredBid] = useState<number | null>(null);
  const [hoveredAsk, setHoveredAsk] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setDepth(generateDepth(midPrice));
      setTime(new Date());
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const bidCum = depth.bids.map((_, i) => depth.bids.slice(0, i + 1).reduce((s, o) => s + o.qty, 0));
  const askCum = depth.asks.map((_, i) => depth.asks.slice(0, i + 1).reduce((s, o) => s + o.qty, 0));
  const totalBid = bidCum[bidCum.length - 1];
  const totalAsk = askCum[askCum.length - 1];
  const maxQty = Math.max(totalBid, totalAsk) || 1;
  const bidPct = Math.round((totalBid / (totalBid + totalAsk)) * 100);
  const askPct = 100 - bidPct;

  return (
    <div className="px-4 pt-5 pb-5">
      <SectionHeader
        title="Market Depth"
        right={
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-gain">
            <span className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" />
            Live
          </span>
        }
      />
      <div className="grid grid-cols-2 gap-4">
        {/* Buy side */}
        <div>
          <p className="text-[13px] font-semibold text-foreground mb-2">Buy Orders</p>
          <div className="space-y-0.5">
            <div className="grid grid-cols-3 text-[11px] text-muted-foreground pb-1">
              <span>ORDERS</span><span className="text-center">QTY</span><span className="text-right">BID</span>
            </div>
            {depth.bids.map((row, i) => (
              <div key={i} className="grid grid-cols-3 text-[13px] tabular-nums text-foreground py-0.5 transition-all duration-300">
                <span>{row.orders}</span>
                <span className="text-center">{row.qty}</span>
                <span className="text-right text-gain font-medium">{row.bid.toFixed(2)}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 text-[13px] font-semibold tabular-nums text-foreground pt-1 border-t border-border/40">
              <span>Total</span><span className="text-center">{totalBid}</span><span />
            </div>
          </div>
        </div>

        {/* Sell side */}
        <div>
          <p className="text-[13px] font-semibold text-foreground mb-2">Sell Orders</p>
          <div className="space-y-0.5">
            <div className="grid grid-cols-3 text-[11px] text-muted-foreground pb-1">
              <span>ASK</span><span className="text-center">QTY</span><span className="text-right">ORDERS</span>
            </div>
            {depth.asks.map((row, i) => (
              <div key={i} className="grid grid-cols-3 text-[13px] tabular-nums text-foreground py-0.5 transition-all duration-300">
                <span className="text-loss font-medium">{row.ask.toFixed(2)}</span>
                <span className="text-center">{row.qty}</span>
                <span className="text-right">{row.orders}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 text-[13px] font-semibold tabular-nums text-foreground pt-1 border-t border-border/40">
              <span /><span className="text-center">{totalAsk}</span><span className="text-right">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bid/Ask depth graph */}
      <div className="mt-4 flex flex-col gap-[8px]">
        <div className="flex items-center justify-between text-[16px]">
          <span className="text-muted-foreground">Bids <span className="font-semibold text-foreground">{bidPct}%</span></span>
          <span className="text-muted-foreground"><span className="font-semibold text-foreground">{askPct}%</span> Offers</span>
        </div>
        <div className="flex gap-[6px] w-full">
          {/* Bid bars */}
          <div className="flex flex-col flex-1 gap-[2px]">
            {bidCum.map((cum, i) => (
              <div
                key={i}
                className="relative h-[4px] rounded-sm cursor-pointer"
                style={{
                  width: `${(cum / maxQty) * 100}%`,
                  backgroundColor: hoveredBid === i ? "#16a34a" : "#1bc534",
                  transition: "width 0.4s ease, background-color 0.15s",
                }}
                onMouseEnter={() => setHoveredBid(i)}
                onMouseLeave={() => setHoveredBid(null)}
              >
                {hoveredBid === i && (
                  <div className="absolute bottom-6 left-0 z-10 bg-foreground text-background text-[11px] rounded px-2 py-1 whitespace-nowrap shadow-md">
                    Bid {depth.bids[i].bid.toFixed(2)} · Qty {cum}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Ask bars */}
          <div className="flex flex-col flex-1 gap-[2px] items-end">
            {askCum.map((cum, i) => (
              <div
                key={i}
                className="relative h-[4px] rounded-sm cursor-pointer"
                style={{
                  width: `${(cum / maxQty) * 100}%`,
                  backgroundColor: hoveredAsk === i ? "#c0392b" : "#ee3d30",
                  transition: "width 0.4s ease, background-color 0.15s",
                }}
                onMouseEnter={() => setHoveredAsk(i)}
                onMouseLeave={() => setHoveredAsk(null)}
              >
                {hoveredAsk === i && (
                  <div className="absolute bottom-6 right-0 z-10 bg-foreground text-background text-[11px] rounded px-2 py-1 whitespace-nowrap shadow-md">
                    Ask {depth.asks[i].ask.toFixed(2)} · Qty {cum}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── About Section ──

function AboutSection() {
  const stock = useStock();
  const [expanded, setExpanded] = useState(false);

  const description = "Apple Inc. engages in the design, development, manufacture, and sale of electric vehicles and energy generation and storage systems. The company operates through Automotive and Energy Generation and Storage. The Automotive segment includes the design, development, manufacture, sale, and lease of electric vehicles as well as sales of automotive regulatory credits.";

  return (
    <div className="px-4 pt-5 pb-5">
      <SectionHeader title={`About ${stock.name}`} />
      <div className="flex gap-2 mb-3">
        <span className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground">#ConsumerDiscretionary</span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground">#Automobiles</span>
      </div>
      <p className={cn("text-[14px] text-muted-foreground leading-relaxed", !expanded && "line-clamp-3")}>
        {description}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-1 text-[13px] font-medium text-foreground"
      >
        {expanded ? "Show less" : "Read more"}
      </button>

      <div className="grid grid-cols-2 gap-y-3 mt-4">
        <div>
          <p className="text-[12px] text-muted-foreground">CEO</p>
          <p className="text-[14px] font-semibold text-foreground">Tim Cook</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Founded</p>
          <p className="text-[14px] font-semibold text-foreground">1976</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Employees</p>
          <p className="text-[14px] font-semibold text-foreground">164,000+</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Headquarters</p>
          <p className="text-[14px] font-semibold text-foreground">Cupertino, CA</p>
        </div>
      </div>
    </div>
  );
}

// ── Peers Section ──

const peersData = [
  { symbol: "MSFT", name: "Microsoft", fullName: "Corporation", price: 415.8, change: -0.21, tags: ["Software", "Cloud"], logoBg: "#00a4ef", logoText: "MS" },
  { symbol: "GOOGL", name: "Alphabet", fullName: "Inc.", price: 178.2, change: -0.01, tags: ["Search", "Cloud"], logoBg: "#4285F4", logoText: "G" },
  { symbol: "AMZN", name: "Amazon.com", fullName: "Inc.", price: 192.5, change: 1.01, tags: ["E-comm", "Cloud"], logoBg: "#FF9900", logoText: "A" },
  { symbol: "META", name: "Meta", fullName: "Platforms", price: 582.3, change: 0.74, tags: ["Social", "AI"], logoBg: "#1877F2", logoText: "M" },
  { symbol: "NFLX", name: "Netflix", fullName: "Inc.", price: 634.7, change: -1.12, tags: ["Media", "Stream"], logoBg: "#E50914", logoText: "N" },
  { symbol: "NVDA", name: "NVIDIA", fullName: "Corporation", price: 875.4, change: 2.34, tags: ["GPU", "AI"], logoBg: "#76B900", logoText: "NV" },
];

function PeersSection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(symbol: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  }

  return (
    <div className="px-4 pt-5 pb-5">
      <SectionHeader title="Peers" className="mb-5" />
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 py-3">
        {peersData.map((peer) => {
          const isSelected = selected.has(peer.symbol);
          const isUp = peer.change >= 0;
          return (
            <button
              key={peer.symbol}
              onClick={() => toggle(peer.symbol)}
              className={cn(
                "relative shrink-0 w-[156px] rounded-xl border-2 p-[14px] flex flex-col items-center gap-3 bg-background transition-all duration-150 active:scale-[0.97]",
                isSelected ? "border-foreground" : "border-border/50"
              )}
            >
              {/* Checkbox top-left */}
              <div className={cn(
                "absolute top-[10px] left-[10px] w-[17px] h-[17px] rounded-[5px] flex items-center justify-center transition-all duration-150",
                isSelected ? "bg-foreground" : "border border-foreground/30"
              )}>
                {isSelected && (
                  <svg width="10" height="8" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Logo */}
              <div
                className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-white text-[13px] font-bold border border-white/20 mt-1"
                style={{ backgroundColor: peer.logoBg }}
              >
                {peer.logoText}
              </div>

              {/* Name — single truncated line */}
              <p className="w-full text-center text-[15px] font-normal text-foreground leading-snug truncate px-1">
                {peer.name} {peer.fullName}
              </p>

              {/* Price + change */}
              <div className="flex flex-col items-center gap-[5px]">
                <p className="text-[16px] font-semibold tabular-nums text-foreground">{peer.price.toFixed(1)}</p>
                <div className="flex items-center gap-[3px] text-[15px] font-medium">
                  <span className={isUp ? "text-gain" : "text-loss"}>{isUp ? "+" : ""}{peer.change.toFixed(2)}%</span>
                  <span className="text-foreground">1D</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Compare CTA — outline always, active when something selected */}
      <button
        disabled={selected.size === 0}
        className={cn(
          "w-full mt-3 py-3.5 rounded-xl text-[15px] font-semibold border-2 transition-all duration-200",
          selected.size > 0
            ? "border-foreground/70 text-foreground active:scale-[0.99]"
            : "border-border/40 text-foreground/25 cursor-not-allowed"
        )}
      >
        Compare{selected.size > 0 ? ` (${selected.size})` : ""}
      </button>
    </div>
  );
}

// ── Analyst Rating ──

function AnalystRating() {
  const sell = 3, hold = 22, buy = 15;
  const total = sell + hold + buy; // 40

  // Weighted score 0–100: buy=100, hold=50, sell=0
  const score = Math.round((buy * 100 + hold * 50) / total); // ≈65
  const zone  = score >= 71 ? "Buy" : score >= 31 ? "Neutral" : "Sell";

  // SVG geometry
  const cx = 165, cy = 162, r = 112;

  // Smooth gradient arc — 90 thin segments, hue 0°(red) → 120°(green)
  const N = 90;
  const arcSegments = Array.from({ length: N }, (_, i) => {
    const t0 = i / N;
    const t1 = (i + 1) / N;
    const a0 = Math.PI * (1 - t0); // 180° → 0° left-to-right
    const a1 = Math.PI * (1 - t1);
    const x0 = +(cx + r * Math.cos(a0)).toFixed(2);
    const y0 = +(cy - r * Math.sin(a0)).toFixed(2);
    const x1 = +(cx + r * Math.cos(a1)).toFixed(2);
    const y1 = +(cy - r * Math.sin(a1)).toFixed(2);
    const hue = t0 * 120; // 0=red, 60=yellow, 120=green
    const sat = 88;
    const lig = hue > 15 && hue < 105 ? 52 : 48;
    return {
      d: `M ${x0},${y0} A ${r},${r} 0 0,0 ${x1},${y1}`,
      color: `hsl(${hue.toFixed(1)},${sat}%,${lig}%)`,
      first: i === 0,
      last: i === N - 1,
    };
  });

  // Needle tip coordinates
  const needleAngleDeg = (score / 100) * 180 - 90; // −90°(left) 0°(up) +90°(right)
  const θ = (needleAngleDeg * Math.PI) / 180;
  const needleLen = 90;
  const nx = +(cx + needleLen * Math.sin(θ)).toFixed(2);
  const ny = +(cy - needleLen * Math.cos(θ)).toFixed(2);

  return (
    <div className="px-4 pt-5 pb-6">
      <SectionHeader title="Analyst Rating" />
      <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
        Analyst ratings reflect the opinions of market experts based on company performance, industry trends, and future expectations.
      </p>

      {/* Gauge — SVG + absolute label overlay */}
      <div className="relative w-full" style={{ aspectRatio: "330/175" }}>
        <svg viewBox="0 0 330 175" fill="none" className="absolute inset-0 w-full h-full">
          {/* Gradient arc */}
          {arcSegments.map((seg, i) => (
            <path
              key={i}
              d={seg.d}
              stroke={seg.color}
              strokeWidth="17"
              strokeLinecap={seg.first || seg.last ? "round" : "butt"}
            />
          ))}

          {/* Needle shadow */}
          <motion.line
            x1={cx} y1={cy}
            animate={{ x2: nx, y2: ny }}
            initial={{ x2: cx, y2: cy - needleLen }}
            transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.35 }}
            stroke="rgba(0,0,0,0.07)" strokeWidth="5" strokeLinecap="round"
          />
          {/* Needle */}
          <motion.line
            x1={cx} y1={cy}
            animate={{ x2: nx, y2: ny }}
            initial={{ x2: cx, y2: cy - needleLen }}
            transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.35 }}
            stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"
          />

          {/* Hollow pivot circle */}
          <circle cx={cx} cy={cy} r="9" className="fill-background" stroke="#1a1a1a" strokeWidth="2" />
        </svg>

        {/* Labels overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Sell — bottom left */}
          <div className="absolute" style={{ left: "1%", bottom: "8%" }}>
            <p className="text-[13px] font-bold text-foreground leading-none">{sell}%</p>
            <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">Sell</p>
          </div>
          {/* Neutral — top center */}
          <div className="absolute text-center" style={{ left: "50%", top: "3%", transform: "translateX(-50%)" }}>
            <p className="text-[13px] font-bold text-foreground leading-none">{hold}%</p>
            <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">Neutral</p>
          </div>
          {/* Buy — bottom right */}
          <div className="absolute text-right" style={{ right: "1%", bottom: "8%" }}>
            <p className="text-[13px] font-bold text-foreground leading-none">{buy}%</p>
            <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">Buy</p>
          </div>
        </div>
      </div>

      {/* Consensus zone text below gauge */}
      <p className="text-center text-[20px] font-bold text-foreground mt-1 mb-4">{zone}</p>

      {/* Bar breakdown */}
      <div className="space-y-2">
        {[
          { label: "Buy",  count: buy,  color: "bg-gain",      pct: (buy  / total) * 100 },
          { label: "Hold", count: hold, color: "bg-amber-400", pct: (hold / total) * 100 },
          { label: "Sell", count: sell, color: "bg-loss",      pct: (sell / total) * 100 },
        ].map(({ label, count, color, pct }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-8 text-[13px] font-medium text-foreground">{label}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-6 text-right text-[13px] font-semibold tabular-nums text-foreground">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab Content ────────────────────────────────────────────────────────────

function OverviewTab({ period, onPeriodChange }: { period: ChartPeriod; onPeriodChange: (p: ChartPeriod) => void }) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div>
      <StockChart onExpand={() => setFullscreen(true)} period={period} onPeriodChange={onPeriodChange} />

      {/* Aspora AI card */}
      <div className="px-4 pt-3 pb-2">
        <button className="w-full rounded-2xl border border-border/60 bg-background px-4 py-3 text-left active:scale-[0.99] transition-transform">
          <p className="text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground/50 uppercase mb-1.5">
            Aspora AI
          </p>
          <div className="flex items-center gap-3">
            <p className="flex-1 min-w-0 text-[14px] text-foreground leading-snug">
              <span className="text-muted-foreground">Ask me to </span>
              <AiTypingText />
            </p>
            <ArrowRight size={15} strokeWidth={2.25} className="shrink-0 text-muted-foreground/40" />
          </div>
        </button>
      </div>

      {/* ── Your Holding ── */}
      <YourHolding />

      {/* ── Key Numbers ── */}
      <KeyNumbers />

      {/* ── Market Depth ── */}
      <MarketDepth />

      {/* ── About ── */}
      <AboutSection />

      {/* ── Peers ── */}
      <PeersSection />

      {/* ── Analyst Rating ── */}
      <AnalystRating />

      <AnimatePresence>
        {fullscreen && <FullscreenChart onClose={() => setFullscreen(false)} period={period} onPeriodChange={onPeriodChange} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Revenue Tab ───────────────────────────────────────────────────────────

type RevPeriodMode = "Yearly" | "Quarterly";

interface BarDataPoint {
  label: string;
  value: number;
  isQuarter?: boolean;
}

const revenueYearly: BarDataPoint[] = [
  { label: "2016", value: 7.0 },
  { label: "2017", value: 11.8 },
  { label: "2018", value: 21.5 },
  { label: "2019", value: 24.6 },
  { label: "2020", value: 31.5 },
  { label: "2021", value: 53.8 },
  { label: "2022", value: 31.5 },
  { label: "2023", value: 53.5 },
  { label: "2024", value: 81.5 },
  { label: "2025", value: 96.7 },
  { label: "Q1 2026", value: 31.5, isQuarter: true },
  { label: "Q2 2026", value: 31.5, isQuarter: true },
];

const revenueQuarterly: BarDataPoint[] = [
  { label: "Q1 '22", value: 6.3 },
  { label: "Q2 '22", value: 7.1 },
  { label: "Q3 '22", value: 8.8 },
  { label: "Q4 '22", value: 9.3 },
  { label: "Q1 '23", value: 10.2 },
  { label: "Q2 '23", value: 12.4 },
  { label: "Q3 '23", value: 14.7 },
  { label: "Q4 '23", value: 16.2 },
  { label: "Q1 '24", value: 17.6 },
  { label: "Q2 '24", value: 19.8 },
  { label: "Q3 '24", value: 21.3 },
  { label: "Q4 '24", value: 22.8 },
  { label: "Q1 '25", value: 23.1 },
  { label: "Q2 '25", value: 24.5 },
  { label: "Q3 '25", value: 24.2 },
  { label: "Q4 '25", value: 24.9 },
  { label: "Q1 '26", value: 31.5 },
  { label: "Q2 '26", value: 31.5 },
];

const profitYearly: BarDataPoint[] = [
  { label: "2016", value: -0.7 },
  { label: "2017", value: -1.9 },
  { label: "2018", value: -0.9 },
  { label: "2019", value: -0.8 },
  { label: "2020", value: 0.7 },
  { label: "2021", value: 5.5 },
  { label: "2022", value: 2.7 },
  { label: "2023", value: 8.2 },
  { label: "2024", value: 12.3 },
  { label: "2025", value: 15.4 },
  { label: "Q1 2026", value: 1.7, isQuarter: true },
  { label: "Q2 2026", value: 1.4, isQuarter: true },
];

const profitQuarterly: BarDataPoint[] = [
  { label: "Q1 '22", value: -0.1 },
  { label: "Q2 '22", value: 0.4 },
  { label: "Q3 '22", value: 1.0 },
  { label: "Q4 '22", value: 1.4 },
  { label: "Q1 '23", value: 1.5 },
  { label: "Q2 '23", value: 1.8 },
  { label: "Q3 '23", value: 2.2 },
  { label: "Q4 '23", value: 2.7 },
  { label: "Q1 '24", value: 2.5 },
  { label: "Q2 '24", value: 3.1 },
  { label: "Q3 '24", value: 3.2 },
  { label: "Q4 '24", value: 3.5 },
  { label: "Q1 '25", value: 3.6 },
  { label: "Q2 '25", value: 3.9 },
  { label: "Q3 '25", value: 3.8 },
  { label: "Q4 '25", value: 4.1 },
  { label: "Q1 '26", value: 1.7 },
  { label: "Q2 '26", value: 1.4 },
];

// ─── Financials Table Data (Apple AAPL — USD Billions) ───────────────────────

const FIN_COLS = ["Q1 '25", "FY24", "FY23", "FY22", "FY21", "YoY%"] as const;

interface FinRow {
  label: string;
  indent?: boolean;
  values: string[];
  yoyPositive?: boolean;
  isGroupHeader?: boolean;     // section label row (ASSETS, LIABILITIES…) — not collapsible
  collapsibleKey?: string;     // this row IS a collapsible parent with this key
  parentKey?: string;          // this row is a child of the collapsible with this key
  bold?: boolean;              // semi-bold text
}

const incomeRows: FinRow[] = [
  { label: "Total Revenue",    values: ["124.3", "391.0", "383.3", "394.3", "365.8", "+2.0%"],  yoyPositive: true  },
  { label: "Gross Profit",     values: ["58.3",  "180.7", "169.1", "170.8", "152.8", "+6.9%"],  yoyPositive: true  },
  { label: "Operating Income", values: ["43.9",  "123.2", "114.3", "119.4", "109.0", "+7.8%"],  yoyPositive: true  },
  { label: "EBITDA",           values: ["46.2",  "134.0", "125.8", "131.7", "119.4", "+6.5%"],  yoyPositive: true  },
  { label: "Net Income",       values: ["36.3",   "93.7",  "97.0",  "99.8",  "94.7", "-3.4%"],  yoyPositive: false, bold: true },
];

const balanceRows: FinRow[] = [
  { label: "ASSETS", isGroupHeader: true, values: [] },
  { label: "Total Assets",         values: ["344.9", "365.0", "352.6", "352.8", "351.0", "+3.5%"],  yoyPositive: true,  collapsibleKey: "assets" },
  { label: "Current Assets",       values: ["152.9", "153.0", "143.7", "135.4", "134.8", "+6.5%"],  yoyPositive: true,  indent: true, parentKey: "assets" },
  { label: "Net Receivables",      values: ["30.2",   "33.4",  "29.5",  "28.9",  "26.3", "+13.2%"], yoyPositive: true,  indent: true, parentKey: "assets" },
  { label: "Inventory",            values: ["7.8",    "7.3",   "6.3",   "4.9",   "6.6",  "+15.9%"], yoyPositive: true,  indent: true, parentKey: "assets" },
  { label: "Other Curr. Assets",   values: ["114.9", "112.3", "107.9", "101.6", "101.9", "+4.1%"],  yoyPositive: true,  indent: true, parentKey: "assets" },
  { label: "LIABILITIES", isGroupHeader: true, values: [] },
  { label: "Total Liabilities",    values: ["307.0", "308.0", "290.4", "302.1", "287.9", "+6.1%"],  yoyPositive: false, collapsibleKey: "liabilities" },
  { label: "Current Liabilities",  values: ["177.4", "176.4", "145.3", "153.9", "125.5", "+21.4%"], yoyPositive: false, indent: true, parentKey: "liabilities" },
  { label: "Accounts Payable",     values: ["62.3",   "68.9",  "62.6",  "64.1",  "54.8", "+10.1%"], yoyPositive: false, indent: true, parentKey: "liabilities" },
  { label: "Short-Term Debt",      values: ["10.9",   "10.9",  "9.8",   "11.0",  "6.0",  "+11.2%"], yoyPositive: false, indent: true, parentKey: "liabilities" },
  { label: "Total Non-Current",    values: ["129.6", "131.6", "145.1", "148.2", "162.4", "-9.3%"],  yoyPositive: true,  indent: true, parentKey: "liabilities", collapsibleKey: "noncurrent" },
  { label: "Long-Term Debt",       values: ["85.7",   "85.7",  "95.3",  "98.9",  "109.1","-10.1%"], yoyPositive: true,  indent: true, parentKey: "noncurrent" },
  { label: "Deferred Rev. (NC)",   values: ["2.4",    "2.3",   "2.5",   "3.5",   "7.4",  "-8.0%"],  yoyPositive: true,  indent: true, parentKey: "noncurrent" },
  { label: "Other NC Liabilities", values: ["41.5",   "43.6",  "47.3",  "45.8",  "45.9", "-7.8%"],  yoyPositive: true,  indent: true, parentKey: "noncurrent" },
  { label: "EQUITY", isGroupHeader: true, values: [] },
  { label: "Stockholders' Equity", values: ["56.4",   "57.0",  "62.1",  "50.7",  "63.1", "-8.2%"],  yoyPositive: false },
  { label: "Cash & Investments",   values: ["53.8",   "53.8",  "61.6",  "48.3",  "62.6", "-12.7%"], yoyPositive: false },
];

const cashFlowRows: FinRow[] = [
  { label: "Free Cash Flow",  values: ["30.1",  "108.8",  "99.6",  "111.4",  "92.9",  "+9.2%"],  yoyPositive: true  },
  { label: "Operating Cash",  values: ["32.9",  "118.3",  "110.5", "122.2",  "104.0", "+7.1%"],  yoyPositive: true  },
  { label: "Investing Cash",  values: ["-3.5",  "-5.0",   "3.7",   "-22.4",  "-14.5", "–"],      yoyPositive: undefined },
  { label: "Financing Cash",  values: ["-31.4", "-121.9", "-108.5","-110.7", "-93.4", "-12.3%"], yoyPositive: false },
];

const ratioRows: FinRow[] = [
  { label: "VALUATION",        isGroupHeader: true, values: [], collapsibleKey: "valuation" },
  { label: "P/E Ratio",        values: ["38.2",  "33.5",  "30.1",  "23.9",  "28.5",  "+11.3%"], yoyPositive: undefined, parentKey: "valuation" },
  { label: "Forward P/E",      values: ["35.8",  "31.2",  "27.4",  "22.1",  "25.3",  "–"],      yoyPositive: undefined, parentKey: "valuation" },
  { label: "P/S",              values: ["9.2",   "8.6",   "7.9",   "6.0",   "7.8",   "+8.9%"],  yoyPositive: undefined, parentKey: "valuation" },
  { label: "P/B",              values: ["54.1",  "51.8",  "48.3",  "47.0",  "36.0",  "+7.2%"],  yoyPositive: undefined, parentKey: "valuation" },
  { label: "EV/EBITDA",        values: ["28.3",  "26.4",  "23.9",  "18.2",  "22.1",  "+10.5%"], yoyPositive: undefined, parentKey: "valuation" },
  { label: "PROFITABILITY",    isGroupHeader: true, values: [], collapsibleKey: "profitability" },
  { label: "Gross Margin",     values: ["46.9%", "46.2%", "44.1%", "43.3%", "41.8%", "+2.1pp"], yoyPositive: true,  parentKey: "profitability" },
  { label: "Operating Margin", values: ["35.3%", "31.5%", "29.8%", "30.3%", "29.8%", "+1.7pp"], yoyPositive: true,  parentKey: "profitability" },
  { label: "Net Margin",       values: ["29.2%", "24.0%", "25.3%", "25.3%", "25.9%", "-1.3pp"], yoyPositive: false, parentKey: "profitability" },
  { label: "ROE",              values: ["258.1%","164.5%","156.1%","196.9%","150.1%", "+8.4pp"], yoyPositive: true,  parentKey: "profitability" },
  { label: "ROA",              values: ["26.5%", "25.7%", "27.5%", "28.3%", "26.9%", "-1.8pp"], yoyPositive: false, parentKey: "profitability" },
  { label: "LIQUIDITY",        isGroupHeader: true, values: [], collapsibleKey: "liquidity" },
  { label: "Current Ratio",    values: ["0.86",  "0.87",  "0.99",  "0.88",  "1.07",  "-0.12"],  yoyPositive: false, parentKey: "liquidity" },
  { label: "Debt-to-Equity",   values: ["5.44",  "5.41",  "4.67",  "5.96",  "4.56",  "+0.74"],  yoyPositive: undefined, parentKey: "liquidity" },
  { label: "Interest Coverage",values: ["31.2x", "29.3x", "26.7x", "35.9x", "31.3x", "+2.6x"],  yoyPositive: true,  parentKey: "liquidity" },
];

interface IncomeDataPoint { label: string; revenue: number; expenses: number; }

const incomeStatementYearly: IncomeDataPoint[] = [
  { label: "2019", revenue: 24.6, expenses: 18.2 },
  { label: "2020", revenue: 31.5, expenses: 23.8 },
  { label: "2021", revenue: 53.8, expenses: 38.2 },
  { label: "2022", revenue: 31.5, expenses: 27.4 },
  { label: "2023", revenue: 53.5, expenses: 43.1 },
  { label: "2024", revenue: 81.5, expenses: 63.2 },
  { label: "2025", revenue: 96.7, expenses: 75.1 },
];

const incomeStatementQuarterly: IncomeDataPoint[] = [
  { label: "Q1 '22", revenue: 6.3,  expenses: 5.1  },
  { label: "Q2 '22", revenue: 7.1,  expenses: 5.8  },
  { label: "Q3 '22", revenue: 8.8,  expenses: 7.2  },
  { label: "Q4 '22", revenue: 9.3,  expenses: 7.6  },
  { label: "Q1 '23", revenue: 10.2, expenses: 8.3  },
  { label: "Q2 '23", revenue: 12.4, expenses: 10.0 },
  { label: "Q3 '23", revenue: 14.7, expenses: 11.8 },
  { label: "Q4 '23", revenue: 16.2, expenses: 13.0 },
  { label: "Q1 '24", revenue: 17.6, expenses: 13.9 },
  { label: "Q2 '24", revenue: 19.8, expenses: 15.5 },
  { label: "Q3 '24", revenue: 21.3, expenses: 16.6 },
  { label: "Q4 '24", revenue: 22.8, expenses: 17.8 },
  { label: "Q1 '25", revenue: 23.1, expenses: 17.9 },
  { label: "Q2 '25", revenue: 24.5, expenses: 19.0 },
  { label: "Q3 '25", revenue: 24.2, expenses: 18.8 },
  { label: "Q4 '25", revenue: 24.9, expenses: 19.4 },
  { label: "Q1 '26", revenue: 31.5, expenses: 24.8 },
];

interface BalanceDataPoint { label: string; assets: number; liabilities: number; }

const balanceYearly: BalanceDataPoint[] = [
  { label: "2019", assets: 29.8, liabilities: 17.2 },
  { label: "2020", assets: 35.1, liabilities: 21.5 },
  { label: "2021", assets: 48.3, liabilities: 27.4 },
  { label: "2022", assets: 52.1, liabilities: 31.8 },
  { label: "2023", assets: 61.5, liabilities: 38.2 },
  { label: "2024", assets: 78.9, liabilities: 46.7 },
  { label: "2025", assets: 94.2, liabilities: 57.3 },
];

const balanceQuarterly: BalanceDataPoint[] = [
  { label: "Q1 '22", assets: 49.1, liabilities: 30.2 },
  { label: "Q2 '22", assets: 50.4, liabilities: 30.9 },
  { label: "Q3 '22", assets: 51.3, liabilities: 31.4 },
  { label: "Q4 '22", assets: 52.1, liabilities: 31.8 },
  { label: "Q1 '23", assets: 54.8, liabilities: 33.5 },
  { label: "Q2 '23", assets: 57.2, liabilities: 35.1 },
  { label: "Q3 '23", assets: 59.4, liabilities: 36.8 },
  { label: "Q4 '23", assets: 61.5, liabilities: 38.2 },
  { label: "Q1 '24", assets: 65.3, liabilities: 40.1 },
  { label: "Q2 '24", assets: 69.7, liabilities: 42.5 },
  { label: "Q3 '24", assets: 74.1, liabilities: 44.8 },
  { label: "Q4 '24", assets: 78.9, liabilities: 46.7 },
  { label: "Q1 '25", assets: 82.4, liabilities: 49.2 },
  { label: "Q2 '25", assets: 86.1, liabilities: 51.8 },
  { label: "Q3 '25", assets: 90.5, liabilities: 54.6 },
  { label: "Q4 '25", assets: 94.2, liabilities: 57.3 },
];

interface CashFlowDataPoint { label: string; operating: number; investing: number; financing: number; }

const cashFlowYearly: CashFlowDataPoint[] = [
  { label: "2019", operating: 4.4,  investing: -3.2,  financing: -0.9 },
  { label: "2020", operating: 7.2,  investing: -5.1,  financing: -1.5 },
  { label: "2021", operating: 12.4, investing: -7.3,  financing: -3.2 },
  { label: "2022", operating: 8.7,  investing: -6.8,  financing: 1.2  },
  { label: "2023", operating: 14.5, investing: -8.2,  financing: -4.7 },
  { label: "2024", operating: 18.3, investing: -11.5, financing: -5.8 },
  { label: "2025", operating: 22.1, investing: -13.2, financing: -7.4 },
];

const cashFlowQuarterly: CashFlowDataPoint[] = [
  { label: "Q1 '22", operating: 1.8,  investing: -1.5, financing: 0.3  },
  { label: "Q2 '22", operating: 2.1,  investing: -1.7, financing: 0.4  },
  { label: "Q3 '22", operating: 2.4,  investing: -1.9, financing: -0.8 },
  { label: "Q4 '22", operating: 2.4,  investing: -1.7, financing: -0.5 },
  { label: "Q1 '23", operating: 3.1,  investing: -2.0, financing: -1.1 },
  { label: "Q2 '23", operating: 3.5,  investing: -2.1, financing: -1.2 },
  { label: "Q3 '23", operating: 3.8,  investing: -2.0, financing: -1.2 },
  { label: "Q4 '23", operating: 4.1,  investing: -2.1, financing: -1.2 },
  { label: "Q1 '24", operating: 4.3,  investing: -2.7, financing: -1.4 },
  { label: "Q2 '24", operating: 4.6,  investing: -2.9, financing: -1.5 },
  { label: "Q3 '24", operating: 4.7,  investing: -2.9, financing: -1.5 },
  { label: "Q4 '24", operating: 4.7,  investing: -3.0, financing: -1.4 },
  { label: "Q1 '25", operating: 5.3,  investing: -3.2, financing: -1.8 },
  { label: "Q2 '25", operating: 5.5,  investing: -3.3, financing: -1.8 },
  { label: "Q3 '25", operating: 5.6,  investing: -3.3, financing: -1.9 },
  { label: "Q4 '25", operating: 5.7,  investing: -3.4, financing: -1.9 },
];

interface SegmentData {
  name: string;
  value: number;
  pct: number;
  color: string;
}

const segments: SegmentData[] = [
  { name: "Automotive", value: 69.53, pct: 75, color: "hsl(217, 80%, 56%)" },
  { name: "Energy & Storage", value: 12.77, pct: 13, color: "hsl(152, 60%, 45%)" },
  { name: "Services & Ecosystem", value: 12.53, pct: 12, color: "hsl(38, 85%, 52%)" },
  { name: "AI & Autonomous Driving", value: 1.0, pct: 0.1, color: "hsl(270, 55%, 58%)" },
  { name: "Robotics & Future Tech", value: 1.0, pct: 0.1, color: "hsl(340, 65%, 55%)" },
];

interface RatioDataPoint {
  label: string;
  revenue: number;
  netProfit: number;
  profitMargin: number;
}

const ratioYearly: RatioDataPoint[] = [
  { label: "2016", revenue: 7.0, netProfit: -0.7, profitMargin: -10.0 },
  { label: "2017", revenue: 11.8, netProfit: -1.9, profitMargin: -16.1 },
  { label: "2018", revenue: 21.5, netProfit: -0.9, profitMargin: -4.2 },
  { label: "2019", revenue: 24.6, netProfit: -0.8, profitMargin: -3.3 },
  { label: "2020", revenue: 31.5, netProfit: 0.7, profitMargin: 2.2 },
  { label: "2021", revenue: 53.8, netProfit: 5.5, profitMargin: 10.2 },
  { label: "2022", revenue: 31.5, netProfit: 2.7, profitMargin: 8.6 },
  { label: "2023", revenue: 53.5, netProfit: 8.2, profitMargin: 15.3 },
  { label: "2024", revenue: 81.5, netProfit: 12.3, profitMargin: 15.1 },
  { label: "2025", revenue: 96.7, netProfit: 15.4, profitMargin: 15.9 },
  { label: "Q1 '26", revenue: 31.5, netProfit: 1.7, profitMargin: 5.4 },
];

const ratioQuarterly: RatioDataPoint[] = [
  { label: "Q1 '22", revenue: 6.3, netProfit: -0.1, profitMargin: -1.6 },
  { label: "Q2 '22", revenue: 7.1, netProfit: 0.4, profitMargin: 5.6 },
  { label: "Q3 '22", revenue: 8.8, netProfit: 1.0, profitMargin: 11.4 },
  { label: "Q4 '22", revenue: 9.3, netProfit: 1.4, profitMargin: 15.1 },
  { label: "Q1 '23", revenue: 10.2, netProfit: 1.5, profitMargin: 14.7 },
  { label: "Q2 '23", revenue: 12.4, netProfit: 1.8, profitMargin: 14.5 },
  { label: "Q3 '23", revenue: 14.7, netProfit: 2.2, profitMargin: 15.0 },
  { label: "Q4 '23", revenue: 16.2, netProfit: 2.7, profitMargin: 16.7 },
  { label: "Q1 '24", revenue: 17.6, netProfit: 2.5, profitMargin: 14.2 },
  { label: "Q2 '24", revenue: 19.8, netProfit: 3.1, profitMargin: 15.7 },
  { label: "Q3 '24", revenue: 21.3, netProfit: 3.2, profitMargin: 15.0 },
  { label: "Q4 '24", revenue: 22.8, netProfit: 3.5, profitMargin: 15.4 },
  { label: "Q1 '25", revenue: 23.1, netProfit: 3.6, profitMargin: 15.6 },
  { label: "Q2 '25", revenue: 24.5, netProfit: 3.9, profitMargin: 15.9 },
  { label: "Q3 '25", revenue: 24.2, netProfit: 3.8, profitMargin: 15.7 },
  { label: "Q4 '25", revenue: 24.9, netProfit: 4.1, profitMargin: 16.5 },
  { label: "Q1 '26", revenue: 31.5, netProfit: 1.7, profitMargin: 5.4 },
];

// Chart colors
const BAR_BLUE = "hsl(217, 80%, 56%)";
const BAR_BLUE_Q = "hsl(217, 55%, 72%)";
const RATIO_REV_CLR = "hsl(217, 85%, 58%)";
const RATIO_PROF_CLR = "hsl(152, 69%, 40%)";
const RATIO_MARG_CLR = "hsl(38, 85%, 52%)";

function PeriodToggle({ mode, onChange }: { mode: RevPeriodMode; onChange: (m: RevPeriodMode) => void }) {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex rounded-lg border border-border/60 overflow-hidden">
        {(["Yearly", "Quarterly"] as RevPeriodMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={cn(
              "px-5 py-2 text-[14px] font-semibold transition-colors",
              mode === m ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScrollableBarChart({
  data,
  barColor,
  quarterBarColor,
}: {
  data: BarDataPoint[];
  barColor: string;
  quarterBarColor: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const absMax = Math.max(...data.map((d) => Math.abs(d.value)));
  const hasNeg = data.some((d) => d.value < 0);
  const maxBarH = 160;
  const negZone = hasNeg ? 40 : 0; // extra space below baseline for negative bars
  const firstQIdx = data.findIndex((d) => d.isQuarter);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
    setActiveIdx(null);
  }, [data]);

  const items: React.ReactNode[] = [];
  data.forEach((d, i) => {
    if (firstQIdx >= 0 && i === firstQIdx) {
      items.push(
        <div key="__sep__" className="shrink-0 self-stretch flex items-center py-6">
          <div className="w-px h-full border-l border-dashed border-muted-foreground/25" />
        </div>
      );
    }

    const isNeg = d.value < 0;
    const h = Math.max((Math.abs(d.value) / absMax) * maxBarH, 6);
    const isActive = activeIdx === i;
    const color = d.isQuarter ? quarterBarColor : barColor;
    const negColor = "hsl(0, 72%, 51%)";

    items.push(
      <div
        key={d.label}
        className="flex flex-col items-center shrink-0 relative cursor-pointer"
        style={{ width: 52 }}
        onClick={() => setActiveIdx(isActive ? null : i)}
      >
        {/* Value + positive bar stacked above baseline */}
        <div className="flex flex-col items-center gap-1.5 justify-end w-full" style={{ height: maxBarH + 24 }}>
          {isActive ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="rounded-md px-2 py-1"
              style={{ backgroundColor: isNeg ? negColor : color }}
            >
              <p className="text-[12px] font-bold tabular-nums text-white leading-none whitespace-nowrap">
                {d.value}
              </p>
            </motion.div>
          ) : (
            <span className={cn(
              "text-[12px] font-semibold tabular-nums leading-none py-0.5",
              isNeg ? "text-loss" : "text-foreground"
            )}>
              {d.value}
            </span>
          )}

          {!isNeg && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
              style={{
                width: "60%",
                backgroundColor: color,
                borderRadius: "4px 4px 0 0",
                transformOrigin: "bottom",
              }}
            />
          )}
        </div>

        {/* Negative bar below baseline */}
        <div className="w-full" style={{ height: negZone }}>
          {isNeg && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: Math.max((Math.abs(d.value) / absMax) * negZone, 4) }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
              style={{
                width: "60%",
                margin: "0 auto",
                backgroundColor: negColor,
                borderRadius: "0 0 4px 4px",
                transformOrigin: "top",
              }}
            />
          )}
        </div>

        <span
          className={cn(
            "text-[11px] tabular-nums leading-none mt-1.5",
            d.isQuarter ? "text-muted-foreground/60" : "text-muted-foreground"
          )}
        >
          {d.label}
        </span>
      </div>
    );
  });

  return (
    <div ref={scrollRef} className="overflow-x-auto no-scrollbar -mx-4 px-4">
      <div className="flex items-end gap-2.5 w-fit min-w-full justify-center">
        {items}
      </div>
    </div>
  );
}

function RevenueWidget() {
  const [mode, setMode] = useState<RevPeriodMode>("Yearly");
  const data = mode === "Yearly" ? revenueYearly : revenueQuarterly;

  return (
    <div className="px-4 py-5">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-[20px] font-bold text-foreground">Revenues</h3>
        <span className="text-[12px] text-muted-foreground mt-1">(Value in USD millions)</span>
      </div>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
        How fast is the top line growing? Track total revenue year-over-year to spot acceleration or slowdowns.
      </p>
      <PeriodToggle mode={mode} onChange={setMode} />
      <div className="mt-6" key={mode}>
        <ScrollableBarChart data={data} barColor={BAR_BLUE} quarterBarColor={BAR_BLUE_Q} />
      </div>
    </div>
  );
}

function SegmentBreakUpWidget() {
  return (
    <div className="px-4 py-5">
      <h3 className="text-[20px] font-bold text-foreground mb-1">Revenue by Segment</h3>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
        Where does the money actually come from? See which business lines drive the most revenue.
      </p>

      {/* Stacked bar */}
      <div className="flex h-[28px] rounded-[3px] overflow-hidden mb-6">
        {segments.map((seg) => (
          <motion.div
            key={seg.name}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(seg.pct, 1.5)}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
            style={{ backgroundColor: seg.color }}
          />
        ))}
      </div>

      {/* Segment list */}
      <div className="space-y-0">
        {segments.map((seg, i) => (
          <div key={seg.name}>
            <div className="flex items-center gap-3 py-3.5">
              <div
                className="w-[4px] h-[22px] rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="flex-1 text-[15px] font-medium text-foreground">{seg.name}</span>
              <span className="text-[15px] font-semibold tabular-nums text-foreground">{seg.value.toFixed(2)}</span>
              <span className="text-[15px] tabular-nums text-muted-foreground w-[48px] text-right">
                {seg.pct}%
              </span>
            </div>
            {i < segments.length - 1 && <div className="h-px bg-border/40 ml-7" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfitsWidget() {
  const [mode, setMode] = useState<RevPeriodMode>("Yearly");
  const data = mode === "Yearly" ? profitYearly : profitQuarterly;

  return (
    <div className="px-4 py-5">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-[20px] font-bold text-foreground">Profits</h3>
        <span className="text-[12px] text-muted-foreground mt-1">(Value in USD millions)</span>
      </div>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
        Revenue is vanity, profit is sanity. See what&apos;s left after all costs are paid.
      </p>
      <PeriodToggle mode={mode} onChange={setMode} />
      <div className="mt-6" key={mode}>
        <ScrollableBarChart data={data} barColor={BAR_BLUE} quarterBarColor={BAR_BLUE_Q} />
      </div>
    </div>
  );
}

function RevenuesProfitRatiosWidget() {
  const [mode, setMode] = useState<RevPeriodMode>("Yearly");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const data = mode === "Yearly" ? ratioYearly : ratioQuarterly;
  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.netProfit, d.profitMargin)));
  const maxBarH = 160;
  const ratioScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ratioScrollRef.current) {
      ratioScrollRef.current.scrollLeft = ratioScrollRef.current.scrollWidth;
    }
    setActiveIdx(null);
  }, [data]);

  return (
    <div className="px-4 py-5">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-[20px] font-bold text-foreground">Revenue vs Profit</h3>
        <span className="text-[12px] text-muted-foreground mt-1">(Value in USD millions)</span>
      </div>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
        Big revenue means nothing if margins are thin. Compare top-line growth against what actually drops to the bottom line.
      </p>
      <PeriodToggle mode={mode} onChange={setMode} />

      <div className="mt-6 relative" key={mode}>
        <div ref={ratioScrollRef} className="overflow-x-auto no-scrollbar -mx-4 px-4">
          <div
            className="flex items-end gap-4 w-fit min-w-full justify-center"
            style={{ height: maxBarH + 50 }}
          >
            {data.map((d, i) => {
              const revH = Math.max((d.revenue / maxVal) * maxBarH, 6);
              const profH = Math.max((d.netProfit / maxVal) * maxBarH, 6);
              const marginH = Math.max((d.profitMargin / maxVal) * maxBarH, 6);
              const isActive = activeIdx === i;

              return (
                <div
                  key={d.label}
                  className="flex flex-col items-center gap-1.5 shrink-0 relative cursor-pointer"
                  style={{ width: 62 }}
                  onClick={() => setActiveIdx(isActive ? null : i)}
                >
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 rounded-lg bg-background border border-border/60 shadow-md px-2.5 py-2 min-w-[80px]"
                    >
                      <p className="text-[13px] font-bold tabular-nums text-foreground leading-tight">{d.netProfit}</p>
                      <p className="text-[12px] font-semibold tabular-nums leading-tight" style={{ color: RATIO_MARG_CLR }}>
                        +{d.profitMargin}%
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-tight">Net Profit</p>
                    </motion.div>
                  )}
                  <div className="flex items-end gap-[3px] w-full justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: revH }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                      className="flex-1 max-w-[16px]"
                      style={{
                        backgroundColor: RATIO_REV_CLR,
                        borderRadius: "4px 4px 0 0",
                        transformOrigin: "bottom",
                      }}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: profH }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 + 0.06 }}
                      className="flex-1 max-w-[16px]"
                      style={{
                        backgroundColor: RATIO_PROF_CLR,
                        borderRadius: "4px 4px 0 0",
                        transformOrigin: "bottom",
                      }}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: marginH }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 + 0.12 }}
                      className="flex-1 max-w-[16px]"
                      style={{
                        backgroundColor: RATIO_MARG_CLR,
                        borderRadius: "4px 4px 0 0",
                        transformOrigin: "bottom",
                      }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground leading-none mt-1 truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-4">
          {[
            { label: "Revenue", color: RATIO_REV_CLR },
            { label: "Net Profit", color: RATIO_PROF_CLR },
            { label: "Profit Margin", color: RATIO_MARG_CLR },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[12px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinancialTableSection({ title, subtitle, rows, defaultOpen = [] }: {
  title: string;
  subtitle: string;
  rows: FinRow[];
  defaultOpen?: string[];
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(defaultOpen));
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setScrolled(el.scrollLeft > 2);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const toggle = (key: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const isVisible = (row: FinRow) => {
    if (!row.parentKey) return true;
    if (!openGroups.has(row.parentKey)) return false;
    const parentRow = rows.find(r => r.collapsibleKey === row.parentKey);
    if (parentRow?.parentKey && !openGroups.has(parentRow.parentKey)) return false;
    return true;
  };

  // sticky class: always shows right border, shadow only when scrolled
  const stickyClass = cn(
    "sticky left-0 z-10 transition-shadow duration-150",
    "border-r border-border/25",
    scrolled ? "shadow-[4px_0_10px_-2px_rgba(0,0,0,0.07)]" : ""
  );

  return (
    <div className="py-5">
      <div className="px-4 mb-4">
        <h3 className="text-[18px] font-bold text-foreground">{title}</h3>
        <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">{subtitle}</p>
      </div>

      <div ref={scrollRef} className="overflow-x-auto fin-table-scroll">
        <table style={{ minWidth: 520, borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th className={cn(stickyClass, "bg-background min-w-[148px] w-[148px] pl-4 pr-3 pb-3 pt-1 text-left border-b border-border/20")} />
              {FIN_COLS.map((col, i) => (
                <th
                  key={col}
                  className={cn(
                    "pb-3 pt-1 text-right text-[13px] font-semibold border-b border-border/20",
                    i < FIN_COLS.length - 1
                      ? "min-w-[72px] px-3 text-muted-foreground whitespace-nowrap"
                      : "min-w-[72px] pl-3 pr-4 text-foreground/65 whitespace-nowrap"
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              if (!isVisible(row)) return null;
              const isOpen = row.collapsibleKey ? openGroups.has(row.collapsibleKey) : false;
              const isCollapsible = !!row.collapsibleKey;

              if (row.isGroupHeader) {
                // always: sticky first cell + empty scrollable cells so label never scrolls
                const labelColor = isCollapsible
                  ? "text-foreground/60"          // ratio headers — darker
                  : "text-muted-foreground/50";   // balance sheet labels — lighter
                return (
                  <tr key={ri} className={cn("bg-muted/20", isCollapsible && "cursor-pointer hover:bg-muted/30 transition-colors")}>
                    <td
                      className={cn(stickyClass, "bg-muted/20 pl-4 pr-3 py-[9px] text-[11px] font-bold uppercase tracking-[0.08em] whitespace-nowrap", labelColor)}
                      onClick={isCollapsible ? () => toggle(row.collapsibleKey!) : undefined}
                    >
                      <div className="flex items-center gap-1.5">
                        {row.label}
                        {isCollapsible && (
                          <ChevronDown size={11} className={cn("transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
                        )}
                      </div>
                    </td>
                    {Array.from({ length: FIN_COLS.length }, (_, j) => (
                      <td key={j} className="bg-muted/20 py-[9px]" onClick={isCollapsible ? () => toggle(row.collapsibleKey!) : undefined} />
                    ))}
                  </tr>
                );
              }

              return (
                <tr
                  key={ri}
                  className={cn(
                    "border-t border-border/[0.11] transition-colors duration-100",
                    isCollapsible ? "cursor-pointer hover:bg-muted/20" : "hover:bg-muted/10"
                  )}
                  onClick={isCollapsible ? () => toggle(row.collapsibleKey!) : undefined}
                >
                  <td
                    className={cn(
                      stickyClass, "bg-background py-[11px] pr-3 text-[13px] text-foreground whitespace-nowrap",
                      row.indent ? "pl-8 font-normal text-foreground/68" : "pl-4 font-medium",
                      row.bold && "font-semibold"
                    )}
                  >
                    <div className={cn("flex items-center gap-1.5", isCollapsible && "justify-between")}>
                      <span>{row.label}</span>
                      {isCollapsible && (
                        <ChevronDown size={13} className={cn("shrink-0 text-muted-foreground/45 transition-transform duration-200", isOpen && "rotate-180")} />
                      )}
                    </div>
                  </td>
                  {row.values.map((val, vi) => {
                    const isYoy = vi === FIN_COLS.length - 1;
                    return (
                      <td
                        key={vi}
                        className={cn(
                          "py-[11px] text-right text-[13px] tabular-nums whitespace-nowrap",
                          vi < FIN_COLS.length - 1 ? "px-3 text-foreground" : "pl-3 pr-4",
                          row.bold && "font-semibold",
                          isYoy && row.yoyPositive === true  && "text-green-500 font-semibold",
                          isYoy && row.yoyPositive === false && "text-red-500 font-semibold",
                          isYoy && row.yoyPositive === undefined && "text-muted-foreground font-medium"
                        )}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const INCOME_REV_CLR = "hsl(217, 80%, 56%)";
const INCOME_EXP_CLR = "hsl(0, 68%, 57%)";
const BAL_ASSETS_CLR = "hsl(217, 80%, 56%)";
const BAL_LIAB_CLR   = "hsl(25, 80%, 55%)";
const CF_OP_CLR      = "hsl(152, 69%, 40%)";
const CF_INV_CLR     = "hsl(38, 85%, 52%)";
const CF_FIN_CLR     = "hsl(270, 55%, 58%)";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FinancialSummaryWidget() {
  const metrics = [
    { label: "Revenue",       value: "$96.7B", change: "+18.6%", positive: true  },
    { label: "Total Cost",    value: "$75.1B", change: "+14.2%", positive: false },
    { label: "Net Profit",    value: "$15.4B", change: "+25.2%", positive: true  },
    { label: "Profit Margin", value: "15.9%",  change: "+0.8pp", positive: true  },
  ];
  return (
    <div className="px-4 py-5">
      <h3 className="text-[20px] font-bold text-foreground mb-1">Financial Summary</h3>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
        A snapshot of the company&apos;s latest annual financial performance.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-muted/40 px-4 py-4">
            <p className="text-[13px] text-muted-foreground mb-2">{m.label}</p>
            <p className="text-[22px] font-bold tracking-tight text-foreground leading-none mb-2">{m.value}</p>
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold",
              m.positive ? "bg-green-500/12 text-green-600" : "bg-red-500/10 text-red-500"
            )}>
              {m.change} YoY
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function IncomeStatementWidget() {
  const [mode, setMode] = useState<RevPeriodMode>("Yearly");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const data = mode === "Yearly" ? incomeStatementYearly : incomeStatementQuarterly;
  const maxVal = Math.max(...data.map((d) => d.revenue));
  const maxBarH = 140;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    setActiveIdx(null);
  }, [data]);

  return (
    <div className="px-4 py-5">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-[20px] font-bold text-foreground">Income Statement</h3>
        <span className="text-[12px] text-muted-foreground mt-1">(USD billions)</span>
      </div>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
        Revenue versus operating expenses — the bigger the gap, the more efficient the business.
      </p>
      <PeriodToggle mode={mode} onChange={setMode} />
      <div className="mt-6 relative" key={mode}>
        <div ref={scrollRef} className="overflow-x-auto no-scrollbar -mx-4 px-4">
          <div className="flex items-end gap-4 w-fit min-w-full justify-center" style={{ height: maxBarH + 50 }}>
            {data.map((d, i) => {
              const revH = Math.max((d.revenue / maxVal) * maxBarH, 6);
              const expH = Math.max((d.expenses / maxVal) * maxBarH, 6);
              const isActive = activeIdx === i;
              return (
                <div
                  key={d.label}
                  className="flex flex-col items-center gap-1.5 shrink-0 relative cursor-pointer"
                  style={{ width: 52 }}
                  onClick={() => setActiveIdx(isActive ? null : i)}
                >
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 rounded-lg bg-background border border-border/60 shadow-md px-2.5 py-2 min-w-[90px]"
                    >
                      <p className="text-[12px] font-bold tabular-nums" style={{ color: INCOME_REV_CLR }}>${d.revenue}B</p>
                      <p className="text-[12px] font-bold tabular-nums" style={{ color: INCOME_EXP_CLR }}>${d.expenses}B</p>
                      <p className="text-[11px] text-muted-foreground">Rev / Exp</p>
                    </motion.div>
                  )}
                  <div className="flex items-end gap-[3px] w-full justify-center">
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: revH }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                      className="flex-1 max-w-[18px]"
                      style={{ backgroundColor: INCOME_REV_CLR, borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }}
                    />
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: expH }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 + 0.06 }}
                      className="flex-1 max-w-[18px]"
                      style={{ backgroundColor: INCOME_EXP_CLR, borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground leading-none mt-1 truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5 mt-4">
          {[{ label: "Revenue", color: INCOME_REV_CLR }, { label: "Expenses", color: INCOME_EXP_CLR }].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[12px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BalanceSheetWidget() {
  const [mode, setMode] = useState<RevPeriodMode>("Yearly");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const data = mode === "Yearly" ? balanceYearly : balanceQuarterly;
  const maxVal = Math.max(...data.map((d) => d.assets));
  const maxBarH = 140;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    setActiveIdx(null);
  }, [data]);

  return (
    <div className="px-4 py-5">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-[20px] font-bold text-foreground">Balance Sheet</h3>
        <span className="text-[12px] text-muted-foreground mt-1">(USD billions)</span>
      </div>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
        What the company owns versus what it owes. Healthy companies grow assets faster than liabilities.
      </p>
      <PeriodToggle mode={mode} onChange={setMode} />
      <div className="mt-6 relative" key={mode}>
        <div ref={scrollRef} className="overflow-x-auto no-scrollbar -mx-4 px-4">
          <div className="flex items-end gap-4 w-fit min-w-full justify-center" style={{ height: maxBarH + 50 }}>
            {data.map((d, i) => {
              const assetsH = Math.max((d.assets / maxVal) * maxBarH, 6);
              const liabH   = Math.max((d.liabilities / maxVal) * maxBarH, 6);
              const isActive = activeIdx === i;
              return (
                <div
                  key={d.label}
                  className="flex flex-col items-center gap-1.5 shrink-0 relative cursor-pointer"
                  style={{ width: 52 }}
                  onClick={() => setActiveIdx(isActive ? null : i)}
                >
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 rounded-lg bg-background border border-border/60 shadow-md px-2.5 py-2 min-w-[95px]"
                    >
                      <p className="text-[12px] font-bold tabular-nums" style={{ color: BAL_ASSETS_CLR }}>${d.assets}B</p>
                      <p className="text-[12px] font-bold tabular-nums" style={{ color: BAL_LIAB_CLR }}>${d.liabilities}B</p>
                      <p className="text-[11px] text-muted-foreground">Assets / Liab.</p>
                    </motion.div>
                  )}
                  <div className="flex items-end gap-[3px] w-full justify-center">
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: assetsH }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                      className="flex-1 max-w-[18px]"
                      style={{ backgroundColor: BAL_ASSETS_CLR, borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }}
                    />
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: liabH }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 + 0.06 }}
                      className="flex-1 max-w-[18px]"
                      style={{ backgroundColor: BAL_LIAB_CLR, borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground leading-none mt-1 truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5 mt-4">
          {[{ label: "Total Assets", color: BAL_ASSETS_CLR }, { label: "Total Liabilities", color: BAL_LIAB_CLR }].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[12px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CashFlowWidget() {
  const [mode, setMode] = useState<RevPeriodMode>("Yearly");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const data = mode === "Yearly" ? cashFlowYearly : cashFlowQuarterly;
  const maxVal = Math.max(...data.map((d) => Math.max(d.operating, Math.abs(d.investing), Math.abs(d.financing))));
  const maxBarH = 140;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    setActiveIdx(null);
  }, [data]);

  return (
    <div className="px-4 py-5">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-[20px] font-bold text-foreground">Cash Flow</h3>
        <span className="text-[12px] text-muted-foreground mt-1">(USD billions)</span>
      </div>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-5">
        Cash is king. Strong operating cash flow means the business funds itself without relying on debt or dilution.
      </p>
      <PeriodToggle mode={mode} onChange={setMode} />
      <div className="mt-6 relative" key={mode}>
        <div ref={scrollRef} className="overflow-x-auto no-scrollbar -mx-4 px-4">
          <div className="flex items-end gap-3 w-fit min-w-full justify-center" style={{ height: maxBarH + 50 }}>
            {data.map((d, i) => {
              const opH  = Math.max((d.operating / maxVal) * maxBarH, 6);
              const invH = Math.max((Math.abs(d.investing) / maxVal) * maxBarH, 6);
              const finH = Math.max((Math.abs(d.financing) / maxVal) * maxBarH, 6);
              const isActive = activeIdx === i;
              return (
                <div
                  key={d.label}
                  className="flex flex-col items-center gap-1.5 shrink-0 relative cursor-pointer"
                  style={{ width: 58 }}
                  onClick={() => setActiveIdx(isActive ? null : i)}
                >
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 rounded-lg bg-background border border-border/60 shadow-md px-2.5 py-2 min-w-[110px]"
                    >
                      <p className="text-[12px] font-bold tabular-nums" style={{ color: CF_OP_CLR }}>+${d.operating}B</p>
                      <p className="text-[12px] font-bold tabular-nums" style={{ color: CF_INV_CLR }}>{d.investing}B</p>
                      <p className="text-[12px] font-bold tabular-nums" style={{ color: CF_FIN_CLR }}>{d.financing}B</p>
                      <p className="text-[11px] text-muted-foreground">Op / Inv / Fin</p>
                    </motion.div>
                  )}
                  <div className="flex items-end gap-[3px] w-full justify-center">
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: opH }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                      className="flex-1 max-w-[14px]"
                      style={{ backgroundColor: CF_OP_CLR, borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }}
                    />
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: invH }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 + 0.06 }}
                      className="flex-1 max-w-[14px]"
                      style={{ backgroundColor: CF_INV_CLR, borderRadius: "4px 4px 0 0", transformOrigin: "bottom", opacity: 0.85 }}
                    />
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: finH }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 + 0.12 }}
                      className="flex-1 max-w-[14px]"
                      style={{ backgroundColor: CF_FIN_CLR, borderRadius: "4px 4px 0 0", transformOrigin: "bottom", opacity: 0.85 }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground leading-none mt-1 truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5 mt-4">
          {[
            { label: "Operating", color: CF_OP_CLR },
            { label: "Investing", color: CF_INV_CLR },
            { label: "Financing", color: CF_FIN_CLR },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[12px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueTab() {
  return (
    <div className="divide-y divide-border/40">
      <RevenueWidget />
      <SegmentBreakUpWidget />
      <ProfitsWidget />
      <RevenuesProfitRatiosWidget />
    </div>
  );
}

function FinancialsTab() {
  return (
    <div>
      {/* Section header — title + description + single USD note */}
      <div className="px-4 pt-5 pb-4 flex items-start justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-[22px] font-bold text-foreground leading-tight">Financials</h2>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
            View revenue, profit, and growth over time. Understand the company&apos;s financial performance and health.
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground/70 mt-1 shrink-0 whitespace-nowrap">(USD Billions)</span>
      </div>

      <FinancialTableSection
        title="Income Statement"
        subtitle="What the company earned & spent over a period"
        rows={incomeRows}
        defaultOpen={[]}
      />
      <FinancialTableSection
        title="Balance Sheet"
        subtitle="What the company owns, owes & is worth"
        rows={balanceRows}
        defaultOpen={["assets", "liabilities"]}
      />
      <FinancialTableSection
        title="Cash Flow"
        subtitle="How cash moves in and out of the business"
        rows={cashFlowRows}
        defaultOpen={[]}
      />
      <FinancialTableSection
        title="Ratios"
        subtitle="Valuation, profitability & liquidity at a glance"
        rows={ratioRows}
        defaultOpen={["valuation", "profitability", "liquidity"]}
      />
    </div>
  );
}

// ─── Technical Tab ──────────────────────────────────────────────────────────

const TECH_TIME_PERIODS = ["30M", "1H", "5H", "1D", "1W", "1M"] as const;
type TechTimePeriod = (typeof TECH_TIME_PERIODS)[number];

interface TechIndicatorRow { name: string; value: string; signal?: string; }

// Per-period gauge data — needle & counts change on each tap
const TECH_PERIOD_DATA: Record<TechTimePeriod, { signal: string; sell: number; neutral: number; buy: number }> = {
  "30M": { signal: "Strong Buy", sell: 2,  neutral: 6,  buy: 18 },
  "1H":  { signal: "Neutral",    sell: 4,  neutral: 12, buy: 10 },
  "5H":  { signal: "Sell",       sell: 11, neutral: 10, buy: 5  },
  "1D":  { signal: "Sell",       sell: 14, neutral: 10, buy: 2  },
  "1W":  { signal: "Neutral",    sell: 4,  neutral: 14, buy: 8  },
  "1M":  { signal: "Buy",        sell: 3,  neutral: 7,  buy: 16 },
};

// Per-period indicator values
const TECH_MOMENTUM: Record<TechTimePeriod, TechIndicatorRow[]> = {
  "30M": [
    { name: "Relative Strength Index (D)", value: "68.12", signal: "Neutral"  },
    { name: "Relative Strength Index (W)", value: "72.40", signal: "Overbought" },
    { name: "Commodity Channel Index",     value: "142.10", signal: "Overbought" },
    { name: "Money Flow Index",            value: "63.20", signal: "Neutral"  },
    { name: "Rate of Change",             value: "4.82",  signal: "Positive" },
    { name: "Stochastic %K",              value: "78.50", signal: "Bullish"  },
    { name: "Williams % R (D)",           value: "-18.40", signal: "Bullish"  },
  ],
  "1H": [
    { name: "Relative Strength Index (D)", value: "55.20", signal: "Neutral"  },
    { name: "Relative Strength Index (W)", value: "61.33", signal: "Neutral"  },
    { name: "Commodity Channel Index",     value: "89.30", signal: "Neutral"  },
    { name: "Money Flow Index",            value: "52.10", signal: "Neutral"  },
    { name: "Rate of Change",             value: "1.24",  signal: "Positive" },
    { name: "Stochastic %K",              value: "55.80", signal: "Neutral"  },
    { name: "Williams % R (D)",           value: "-42.10", signal: "Neutral"  },
  ],
  "5H": [
    { name: "Relative Strength Index (D)", value: "44.80", signal: "Neutral"  },
    { name: "Relative Strength Index (W)", value: "58.90", signal: "Neutral"  },
    { name: "Commodity Channel Index",     value: "110.40", signal: "Oversold" },
    { name: "Money Flow Index",            value: "43.60", signal: "Neutral"  },
    { name: "Rate of Change",             value: "-8.14",  signal: "Negative" },
    { name: "Stochastic %K",              value: "38.20", signal: "Bearish"  },
    { name: "Williams % R (D)",           value: "-61.30", signal: "Neutral"  },
  ],
  "1D": [
    { name: "Relative Strength Index (D)", value: "40.33", signal: "Neutral"  },
    { name: "Relative Strength Index (W)", value: "61.33", signal: "Neutral"  },
    { name: "Commodity Channel Index",     value: "106.96", signal: "Oversold" },
    { name: "Money Flow Index",            value: "40.33", signal: "Neutral"  },
    { name: "Rate of Change",             value: "-12.35", signal: "Negative" },
    { name: "Stochastic %K",              value: "40.33", signal: "Bearish"  },
    { name: "Williams % R (D)",           value: "40.33", signal: "Neutral"  },
  ],
  "1W": [
    { name: "Relative Strength Index (D)", value: "51.70", signal: "Neutral"  },
    { name: "Relative Strength Index (W)", value: "56.80", signal: "Neutral"  },
    { name: "Commodity Channel Index",     value: "74.20", signal: "Neutral"  },
    { name: "Money Flow Index",            value: "54.90", signal: "Neutral"  },
    { name: "Rate of Change",             value: "-2.60",  signal: "Negative" },
    { name: "Stochastic %K",              value: "51.40", signal: "Neutral"  },
    { name: "Williams % R (D)",           value: "-50.20", signal: "Neutral"  },
  ],
  "1M": [
    { name: "Relative Strength Index (D)", value: "64.50", signal: "Neutral"  },
    { name: "Relative Strength Index (W)", value: "68.90", signal: "Neutral"  },
    { name: "Commodity Channel Index",     value: "128.30", signal: "Overbought" },
    { name: "Money Flow Index",            value: "62.70", signal: "Neutral"  },
    { name: "Rate of Change",             value: "6.44",  signal: "Positive" },
    { name: "Stochastic %K",              value: "70.60", signal: "Bullish"  },
    { name: "Williams % R (D)",           value: "-24.80", signal: "Bullish"  },
  ],
};

const TECH_RELATIVE_STRENGTH: TechIndicatorRow[] = [
  { name: "Benchmark Index (21 D)", value: "-0.02", signal: "Negative" },
  { name: "Benchmark Index (55 D)", value: "0.08",  signal: "Positive" },
  { name: "Sector Index (55 D)",    value: "0.10",  signal: "Positive" },
];

const TECH_VOLATILITY: TechIndicatorRow[] = [
  { name: "Average True Range",    value: "21.36" },
  { name: "Bollinger Band Width",  value: "0.26"  },
  { name: "Bollinger Bands %B",    value: "0.18"  },
  { name: "Standard Deviation",    value: "22.60" },
];

// Descriptions shown in the info bottom sheet
const INDICATOR_INFO: Record<string, string> = {
  "Relative Strength Index (D)": "Measures momentum on a scale of 0–100. Values above 70 indicate overbought conditions, below 30 suggest oversold. Useful for spotting trend reversals on a daily timeframe.",
  "Relative Strength Index (W)": "Weekly RSI provides a longer-term momentum view. A reading above 70 signals overbought territory on the weekly chart, which can precede a pullback.",
  "Commodity Channel Index": "Compares the current price to an average price over a set period. Readings above +100 suggest overbought; below -100 suggest oversold conditions.",
  "Money Flow Index": "Combines price and volume to measure buying and selling pressure. Values above 80 indicate overbought; below 20 suggest oversold. Sometimes called the volume-weighted RSI.",
  "Rate of Change": "Shows the percentage change in price over a specific period. Positive values indicate upward momentum; negative values indicate downward momentum.",
  "Stochastic %K": "Compares the closing price to the price range over a period. Readings below 20 suggest oversold; above 80 suggest overbought. Often used to spot divergence.",
  "Williams % R (D)": "Identifies overbought and oversold levels on a scale of 0 to -100. Readings above -20 indicate overbought; below -80 indicate oversold.",
  "Benchmark Index (21 D)": "Measures how the stock has performed relative to the benchmark index over the past 21 trading days. Negative values mean the stock underperformed the index.",
  "Benchmark Index (55 D)": "Tracks relative performance vs. the benchmark over 55 days. A positive value means the stock outperformed the broader market.",
  "Sector Index (55 D)": "Compares the stock to its sector index over 55 days. Positive readings show the stock is outperforming its sector peers.",
  "Average True Range": "Measures market volatility by calculating the average range between high and low prices. Higher ATR means higher volatility and wider expected price swings.",
  "Bollinger Band Width": "Measures the distance between upper and lower Bollinger Bands. Low width signals low volatility (potential breakout); high width signals high volatility.",
  "Bollinger Bands %B": "Shows where price is relative to the Bollinger Bands. A value of 1 means price is at the upper band; 0 means it's at the lower band.",
  "Standard Deviation": "Measures how much the price deviates from its average. Higher standard deviation means more volatility and less predictable price movement.",
};

// Animated gauge needle using motion.g
function TechSummaryGauge({ signal, sell, neutral, buy }: { signal: string; sell: number; neutral: number; buy: number }) {
  const total = sell + neutral + buy;
  const angle = ((buy - sell) / total) * 85;
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[16px] font-semibold text-foreground">Summary</p>
      <div className="relative h-[84px] w-[168px]">
        <svg viewBox="0 0 168 88" className="absolute inset-0 w-full" overflow="visible">
          {/* Track */}
          <path d="M 14 84 A 70 70 0 0 1 154 84" fill="none" stroke="#e5e5ea" strokeWidth="10" strokeLinecap="round" />
          {/* Filled arc */}
          <path d="M 14 84 A 70 70 0 0 1 84 14" fill="none" stroke="#1c1c1e" strokeWidth="10" strokeLinecap="round" />
          {/* Animated needle */}
          <motion.g
            animate={{ rotate: angle }}
            initial={false}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{ originX: "84px", originY: "84px" }}
          >
            <line x1="84" y1="84" x2="84" y2="22" stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="84" cy="84" r="5" fill="#1c1c1e" />
          </motion.g>
        </svg>
        <span className="absolute bottom-0 left-0 -translate-x-6 text-[11px] font-semibold text-foreground whitespace-nowrap">Strong sell</span>
        <span className="absolute bottom-0 right-0 translate-x-6 text-[11px] font-medium text-muted-foreground whitespace-nowrap">Strong buy</span>
      </div>
      <motion.p
        key={signal}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="text-[18px] font-semibold text-foreground"
      >
        {signal}
      </motion.p>
      <div className="flex w-[214px] items-center justify-between">
        {[{ label: "Sell", val: sell }, { label: "Neutral", val: neutral }, { label: "Buy", val: buy }].map(({ label, val }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-[14px] text-muted-foreground">{label}</span>
            <motion.span
              key={`${label}-${val}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-[16px] font-bold text-foreground"
            >
              {val}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Info bottom sheet
interface TechInfoSheetProps {
  row: TechIndicatorRow | null;
  onClose: () => void;
  onAIClick: (row: TechIndicatorRow) => void;
}
function TechInfoSheet({ row, onClose, onAIClick }: TechInfoSheetProps) {
  const description = row ? (INDICATOR_INFO[row.name] ?? "No additional information available.") : "";
  return (
    <AnimatePresence>
      {row && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />
          {/* Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="w-full max-w-[430px] rounded-t-[20px] bg-background px-5 pb-8 pt-4 shadow-xl pointer-events-auto"
          >
            {/* Header row: title + close */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[18px] font-semibold text-foreground">{row.name}</p>
              <button
                onClick={onClose}
                className="flex size-[28px] items-center justify-center rounded-full bg-muted transition-colors active:bg-muted/70"
              >
                <X size={14} className="text-foreground" />
              </button>
            </div>

            {/* Value + Signal row */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[28px] font-bold tabular-nums text-foreground">{row.value}</span>
              {row.signal && (
                <span className="rounded-md bg-muted px-2.5 py-1 text-[13px] font-medium text-muted-foreground">
                  {row.signal}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-4 text-[14px] leading-[1.55] text-muted-foreground">{description}</p>

            {/* AI CTA */}
            <button
              onClick={() => { onClose(); onAIClick(row); }}
              className="mt-6 flex w-full items-center justify-center gap-[11px] rounded-full py-[15px] active:opacity-80 transition-opacity"
              style={{ background: "linear-gradient(165.64deg, #4312D6 33.68%, #DD5927 95.98%)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L11.5 7.5L17 9L11.5 10.5L10 16L8.5 10.5L3 9L8.5 7.5L10 2Z" fill="white" />
                <path d="M16 2L16.8 4.2L19 5L16.8 5.8L16 8L15.2 5.8L13 5L15.2 4.2L16 2Z" fill="white" opacity="0.7" />
              </svg>
              <span className="text-[16px] font-semibold text-white tracking-[-0.24px]">
                Didn&apos;t understand? Simplify with AI
              </span>
            </button>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function TechIndicatorTable({
  rows,
  showSignal = true,
  onInfoClick,
}: {
  rows: TechIndicatorRow[];
  showSignal?: boolean;
  onInfoClick?: (row: TechIndicatorRow) => void;
}) {
  return (
    <div className="flex w-full items-start">
      <div className="flex flex-col">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center py-[10px]">
            <span className="text-[14px] text-foreground whitespace-nowrap">{row.name}</span>
          </div>
        ))}
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-end">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center px-[10px] py-[10px]">
            <span className="text-[14px] font-medium text-foreground uppercase whitespace-nowrap">{row.value}</span>
          </div>
        ))}
      </div>
      {showSignal && (
        <div className="flex flex-col" style={{ width: 103 }}>
          {rows.map((row) => (
            <div key={row.name} className="flex items-center justify-between px-[10px] py-[10px]">
              <span className="text-[14px] font-medium text-muted-foreground whitespace-nowrap">{row.signal}</span>
              <button
                onClick={() => onInfoClick?.(row)}
                className="shrink-0 rounded-full p-0.5 transition-colors active:bg-muted"
              >
                <Info size={12} className="text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AI Explanation Sheet (70% height) ──────────────────────────────────────

function TechAISheet({ indicator, onClose }: { indicator: TechIndicatorRow | null; onClose: () => void }) {
  const { sendMessage, currentConversation, isGenerating, streamingState, newChat } = useAI();
  const [followUp, setFollowUp] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef<string | null>(null);

  const prompt = indicator
    ? `I didn't understand the ${indicator.name} indicator${indicator.signal ? ` showing a "${indicator.signal}" signal` : ""}. Can you explain what this means in simple terms and give me a real-world example?`
    : "";

  // Auto-send the pre-filled prompt when a new indicator is opened
  useEffect(() => {
    if (indicator && lastSentRef.current !== indicator.name) {
      lastSentRef.current = indicator.name;
      newChat();
      const t = setTimeout(() => sendMessage(prompt), 80);
      return () => clearTimeout(t);
    }
    if (!indicator) lastSentRef.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicator?.name]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages.length, streamingState.size]);

  const messages = currentConversation?.messages ?? [];

  const handleSend = () => {
    if (!followUp.trim() || isGenerating) return;
    sendMessage(followUp.trim());
    setFollowUp("");
  };

  return (
    <AnimatePresence>
      {indicator && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ai-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />

          {/* Sheet — 70% height */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
          <motion.div
            key="ai-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="flex w-full max-w-[430px] flex-col rounded-t-[20px] bg-background shadow-2xl pointer-events-auto"
            style={{ height: "70dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-5 pb-4 pt-5">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex size-7 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #4312D6, #DD5927)" }}
                >
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L11.5 7.5L17 9L11.5 10.5L10 16L8.5 10.5L3 9L8.5 7.5L10 2Z" fill="white" />
                    <path d="M16 2L16.8 4.2L19 5L16.8 5.8L16 8L15.2 5.8L13 5L15.2 4.2L16 2Z" fill="white" opacity="0.7" />
                  </svg>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground leading-tight">AI Explanation</p>
                  <p className="text-[12px] text-muted-foreground leading-tight">{indicator?.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex size-[28px] items-center justify-center rounded-full bg-muted transition-colors active:bg-muted/70"
              >
                <X size={14} className="text-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg) => {
                const visibleChars = streamingState.get(msg.id);
                const content =
                  msg.isStreaming && visibleChars !== undefined
                    ? msg.content.slice(0, visibleChars)
                    : msg.content;

                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[82%] rounded-[16px] rounded-tr-[4px] bg-foreground px-4 py-3">
                        <p className="text-[14px] leading-[1.5] text-background">{content}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-[88%] rounded-[16px] rounded-tl-[4px] bg-muted px-4 py-3">
                      <p className="text-[14px] leading-[1.6] text-foreground">
                        {content}
                        {msg.isStreaming && (
                          <span className="ml-0.5 inline-block h-[14px] w-[2px] animate-pulse rounded-full bg-foreground/60 align-middle" />
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Thinking dots — shown while waiting for AI to start responding */}
              {isGenerating && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="rounded-[16px] rounded-tl-[4px] bg-muted px-4 py-3.5">
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                          style={{ animationDelay: `${i * 140}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Follow-up input */}
            <div className="shrink-0 border-t border-border/40 px-4 py-3 pb-6">
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2.5">
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask a follow-up question…"
                  className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!followUp.trim() || isGenerating}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground transition-opacity disabled:opacity-30"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 11V1M6 1L1.5 5.5M6 1L10.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function TechnicalTab() {
  const [activePeriod, setActivePeriod] = useState<TechTimePeriod>("1D");
  const [activeSheet, setActiveSheet] = useState<TechIndicatorRow | null>(null);
  const [aiSheet, setAiSheet] = useState<TechIndicatorRow | null>(null);

  const gauge = TECH_PERIOD_DATA[activePeriod];
  const momentumRows = TECH_MOMENTUM[activePeriod];

  return (
    <>
      <div className="flex flex-col gap-8 px-[18px] py-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">Technical Analysis</h2>
          <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">
            Analyze price trends, indicators, and market momentum. Understand potential entry and exit points.
          </p>
        </div>

        {/* Time period selector + Summary */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {TECH_TIME_PERIODS.map((period) => {
              const active = period === activePeriod;
              return (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={cn(
                    "flex flex-col items-center justify-center px-[10px] text-[13px] font-medium tracking-[-0.13px] whitespace-nowrap transition-colors",
                    active ? "rounded-[5px] bg-foreground py-[2px] text-background" : "py-[5px] pt-[6px] text-muted-foreground",
                  )}
                >
                  {period}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-center py-2">
            <TechSummaryGauge signal={gauge.signal} sell={gauge.sell} neutral={gauge.neutral} buy={gauge.buy} />
          </div>
        </div>

        {/* Momentum */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">Momentum</h3>
            <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">Measures speed &amp; strength of recent price movement</p>
          </div>
          <TechIndicatorTable rows={momentumRows} onInfoClick={setActiveSheet} />
        </div>

        {/* Relative Strength */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">Relative Strength</h3>
            <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">Compares stock performance vs benchmark &amp; sector</p>
          </div>
          <TechIndicatorTable rows={TECH_RELATIVE_STRENGTH} onInfoClick={setActiveSheet} />
        </div>

        {/* Volatility */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">Volatility</h3>
            <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">Measures size &amp; frequency of price fluctuations</p>
          </div>
          <TechIndicatorTable rows={TECH_VOLATILITY} showSignal={false} />
        </div>
      </div>

      <TechInfoSheet
        row={activeSheet}
        onClose={() => setActiveSheet(null)}
        onAIClick={(row) => { setActiveSheet(null); setAiSheet(row); }}
      />
      <TechAISheet indicator={aiSheet} onClose={() => setAiSheet(null)} />
    </>
  );
}

// ─── Options Tab ─────────────────────────────────────────────────────────────

type OptionExpiryFilter = "Weekly" | "Monthly" | "Yearly (LEAP)";

const OPTION_EXPIRY_FILTERS: OptionExpiryFilter[] = [
  "Weekly",
  "Monthly",
  "Yearly (LEAP)",
];

interface PopularOptionTemplate {
  underlyingFactor: number;
  strikeFactor: number;
  callOrPut: "CALL" | "PUT";
  oi: number;
  priceFactor: number;
  changePct: number;
}

const POPULAR_OPTION_TEMPLATES: Record<OptionExpiryFilter, PopularOptionTemplate[]> = {
  Weekly: [
    { underlyingFactor: 1.0, strikeFactor: 1.02, callOrPut: "CALL", oi: 990_000, priceFactor: 0.061, changePct: 12.8 },
    { underlyingFactor: 1.0, strikeFactor: 0.98, callOrPut: "PUT", oi: 840_000, priceFactor: 0.056, changePct: 9.4 },
    { underlyingFactor: 1.0, strikeFactor: 1.05, callOrPut: "CALL", oi: 610_000, priceFactor: 0.045, changePct: 16.2 },
    { underlyingFactor: 1.0, strikeFactor: 0.95, callOrPut: "PUT", oi: 530_000, priceFactor: 0.041, changePct: -6.8 },
    { underlyingFactor: 1.0, strikeFactor: 1.08, callOrPut: "CALL", oi: 355_000, priceFactor: 0.036, changePct: 11.3 },
  ],
  Monthly: [
    { underlyingFactor: 1.0, strikeFactor: 1.03, callOrPut: "CALL", oi: 780_000, priceFactor: 0.074, changePct: 8.7 },
    { underlyingFactor: 1.0, strikeFactor: 0.97, callOrPut: "PUT", oi: 690_000, priceFactor: 0.07, changePct: 6.1 },
    { underlyingFactor: 1.0, strikeFactor: 1.1, callOrPut: "CALL", oi: 470_000, priceFactor: 0.054, changePct: 9.9 },
    { underlyingFactor: 1.0, strikeFactor: 0.9, callOrPut: "PUT", oi: 410_000, priceFactor: 0.051, changePct: -4.4 },
    { underlyingFactor: 1.0, strikeFactor: 1.15, callOrPut: "CALL", oi: 305_000, priceFactor: 0.043, changePct: 7.6 },
  ],
  "Yearly (LEAP)": [
    { underlyingFactor: 1.0, strikeFactor: 1.1, callOrPut: "CALL", oi: 420_000, priceFactor: 0.14, changePct: 5.3 },
    { underlyingFactor: 1.0, strikeFactor: 0.9, callOrPut: "PUT", oi: 360_000, priceFactor: 0.13, changePct: 3.8 },
    { underlyingFactor: 1.0, strikeFactor: 1.2, callOrPut: "CALL", oi: 280_000, priceFactor: 0.11, changePct: 6.1 },
    { underlyingFactor: 1.0, strikeFactor: 0.8, callOrPut: "PUT", oi: 230_000, priceFactor: 0.10, changePct: -2.9 },
    { underlyingFactor: 1.0, strikeFactor: 1.3, callOrPut: "CALL", oi: 160_000, priceFactor: 0.085, changePct: 4.7 },
  ],
};

function formatOptionOI(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `${value}`;
}

function formatCompactPrice(value: number) {
  return value >= 1000 ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value.toFixed(2);
}

function getShortStockName(name: string) {
  return name
    .replace(/\b(Inc\.?|Corp\.?|Corporation|Class A|Class C|Holdings|Technologies|Group|Ltd\.?)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")[0] || name;
}

function OptionsTab() {
  const stock = useStock();
  const router = useRouter();
  const [expiryFilter, setExpiryFilter] = useState<OptionExpiryFilter>("Weekly");
  const shortName = getShortStockName(stock.name);

  const rows = useMemo(() => {
    const baseDate = expiryFilter === "Weekly"
      ? "May 2"
      : expiryFilter === "Monthly"
        ? "May 16"
        : "Jan 15 '27";

    return POPULAR_OPTION_TEMPLATES[expiryFilter].map((template, index) => {
      const underlying = +(stock.price * template.underlyingFactor).toFixed(2);
      const strike = Math.max(1, Math.round(stock.price * template.strikeFactor));
      const optionPrice = +(stock.price * template.priceFactor).toFixed(2);
      const change = +(optionPrice * (template.changePct / 100)).toFixed(2);
      const expiryDate = expiryFilter === "Weekly"
        ? "2 May 2026"
        : expiryFilter === "Monthly"
          ? "16 May 2026"
          : "15 Jan 2027";

      return {
        id: `${expiryFilter}-${index}`,
        indexLabel: stock.exchange,
        optionLabel: `${baseDate} ${strike} ${template.callOrPut}`,
        expiryDate,
        strikeValue: strike,
        side: template.callOrPut === "CALL" ? "call" as const : "put" as const,
        underlyingLabel: formatCompactPrice(underlying),
        oiLabel: formatOptionOI(template.oi),
        optionPriceValue: optionPrice,
        optionPriceLabel: `$${optionPrice.toFixed(2)}`,
        changeLabel: `${change >= 0 ? "+" : "-"}$${Math.abs(change).toFixed(2)} (${change >= 0 ? "+" : ""}${template.changePct.toFixed(1)}%)`,
        positive: template.changePct >= 0,
      };
    });
  }, [expiryFilter, stock.exchange, stock.price]);

  return (
    <div className="flex min-h-full flex-col pb-6">
      <div className="border-b border-border/60 px-4 pb-5 pt-4">
        <h2 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">Option Chain and Prices</h2>
        <p className="mt-2 max-w-[360px] text-[14px] leading-[1.38] text-muted-foreground">
          Explore options data like calls, puts, and strike prices. Understand market expectations for future price movements.
        </p>
        <Button
          onClick={() => router.push(`/options-chain/${encodeURIComponent(stock.symbol)}`)}
          className="mt-4 h-12 w-full rounded-[10px] bg-black text-[16px] font-medium text-white hover:bg-black/95"
        >
          Option Chain
        </Button>
      </div>

      <div className="px-4 pt-5">
        <h3 className="text-[20px] font-semibold tracking-[-0.4px] text-foreground">Popular {shortName} Options</h3>
      </div>

      <ScrollablePillTabs
        items={OPTION_EXPIRY_FILTERS.map((item) => ({ id: item, label: item }))}
        activeId={expiryFilter}
        onChange={(value) => setExpiryFilter(value as OptionExpiryFilter)}
        layoutId="options-expiry-pill"
        className="pt-4"
        scrollerClassName="px-4 pb-3"
        itemClassName="rounded-full px-3 py-1.5 text-[13px] font-semibold tracking-[-0.26px]"
        activeItemClassName="text-white"
        inactiveItemClassName="bg-muted text-foreground"
        activePillClassName="rounded-full bg-[#2a2a2a]"
      />

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[360px] px-4">
          <div className="grid grid-cols-[minmax(0,1fr)_72px_132px] border-b border-border/70 pb-3 text-[12px] uppercase tracking-[0.04em] text-muted-foreground">
            <span>Options</span>
            <span className="text-right">OI</span>
            <span className="text-right">Opt. Price</span>
          </div>

          {rows.map((row) => (
            <button
              key={row.id}
              onClick={() => {
                const params = new URLSearchParams({
                  strike: row.strikeValue.toFixed(1),
                  side: row.side,
                  expiry: row.expiryDate,
                  ltp: row.optionPriceValue.toFixed(2),
                });
                router.push(`/options-chain/${encodeURIComponent(stock.symbol)}/leg?${params.toString()}`);
              }}
              className="grid w-full grid-cols-[minmax(0,1fr)_72px_132px] items-center border-b border-border/60 py-4 text-left text-[14px] tracking-[-0.28px] text-foreground transition-opacity active:opacity-70"
            >
              <div className="flex min-w-0 items-center gap-3 pr-3">
                <div className="h-12 w-1 shrink-0 rounded-full bg-foreground/80" />
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                    Underlying {row.underlyingLabel}
                  </p>
                  <p className="truncate text-[17px] font-semibold tracking-[-0.34px] text-foreground">
                    {row.optionLabel}
                  </p>
                </div>
              </div>
              <span className="whitespace-nowrap text-right text-[15px] font-medium">{row.oiLabel}</span>
              <span className="whitespace-nowrap text-right text-[15px] font-medium">
                {row.optionPriceLabel}
                <br />
                <span className={cn("text-[13px]", row.positive ? "text-gain" : "text-loss")}>
                  {row.changeLabel}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

function TabContent({ tab, period, onPeriodChange }: { tab: string; period: ChartPeriod; onPeriodChange: (p: ChartPeriod) => void }) {
  const stock = useStock();
  if (tab === "Overview") return <OverviewTab period={period} onPeriodChange={onPeriodChange} />;
  if (tab === "Revenue") return <RevenueTab />;
  if (tab === "Financials") return <FinancialsTab />;
  if (tab === "Options")   return <OptionsTab />;
  if (tab === "Technical") return <TechnicalTab />;
  if (tab === "News") return <StockNewsTab symbol={stock.symbol} />;
  if (tab === "Events") return <StockEventsTab symbol={stock.symbol} />;
  if (tab === "Ownership") return <StockOwnershipTab symbol={stock.symbol} />;
  if (tab === "My Orders") return <StockMyOrdersTab symbol={stock.symbol} ltp={stock.price} />;
  if (tab === "My SIP") return <StockMySipTab symbol={stock.symbol} />;
  return (
    <div className="px-4 py-16 flex flex-col items-center justify-center min-h-[400px]">
      <p className="text-[16px] font-semibold text-foreground">{tab}</p>
      <p className="mt-1 text-[13px] text-muted-foreground">Coming soon</p>
    </div>
  );
}

function MarketCap() {
  const stock = useStock();
  return (
    <div className="shrink-0 text-right">
      <div className="flex items-baseline justify-end gap-1.5">
        <span className="text-[12px] font-medium text-muted-foreground leading-none">Market Cap</span>
        <span className="text-[15px] font-bold tracking-tight tabular-nums text-foreground leading-none">
          {stock.marketCap}
        </span>
      </div>
      <div className="mt-1.5 flex justify-end">
        <span className="inline-block text-[11px] font-medium text-foreground bg-muted px-2 py-[3px] rounded-md leading-none">
          {stock.capCategory}
        </span>
      </div>
    </div>
  );
}

// ─── Stock Info ─────────────────────────────────────────────────────────────

const periodLabels: Record<ChartPeriod, string> = {
  "1D": "Today", "1W": "Past Week", "1M": "Past Month", "3M": "Past 3 Months",
  "6M": "Past 6 Months", "1Y": "Past Year", "5Y": "Past 5 Years", "All": "All Time",
};

function usePeriodChange(period: ChartPeriod) {
  const stock = useStock();
  return useMemo(() => {
    const ranges = priceRanges[stock.symbol]?.[period];
    if (!ranges) return { change: stock.dayChange, changePct: stock.dayChangePct };
    const [start, end] = ranges;
    const change = +(end - start).toFixed(2);
    const changePct = +((change / start) * 100).toFixed(2);
    return { change, changePct };
  }, [period, stock.dayChange, stock.dayChangePct, stock.symbol]);
}

function StockInfo({ marketState, onLogoTap, priceRef, chartPeriod }: {
  marketState: MarketState;
  onLogoTap: () => void;
  priceRef: React.RefObject<HTMLDivElement>;
  chartPeriod: ChartPeriod;
}) {
  const stock = useStock();
  const { change, changePct } = usePeriodChange(chartPeriod);
  const isUp = change >= 0;
  const ahUp = stock.afterHoursChange >= 0;
  const showAfterHours = marketState === "afterHours" && chartPeriod === "1D";

  return (
    <div className="px-4 pt-4 pb-3">
      {/* Name + Logo row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-bold text-foreground truncate">{stock.name}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {stock.symbol} : {stock.exchange}
          </p>
        </div>
        <Logo size={44} onClick={onLogoTap} />
      </div>

      {/* Price + Market Cap row */}
      <div ref={priceRef} className="mt-4 flex items-start justify-between">
        {/* Left: price + changes */}
        <div>
          <p className="text-[28px] font-bold tracking-tight tabular-nums text-foreground leading-none">
            {stock.price.toFixed(2)}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className={cn("text-[13px] font-semibold tabular-nums", isUp ? "text-gain" : "text-loss")}>
              {isUp ? "+" : ""}{change.toFixed(2)} ({isUp ? "+" : ""}{changePct.toFixed(2)}%)
            </span>
            <span className="text-[13px] text-muted-foreground">
              {periodLabels[chartPeriod]}
            </span>
          </div>
          {showAfterHours && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className={cn("text-[13px] font-semibold tabular-nums", ahUp ? "text-gain" : "text-loss")}>
                {ahUp ? "+" : ""}{stock.afterHoursChange.toFixed(2)} ({ahUp ? "+" : ""}{stock.afterHoursChangePct.toFixed(2)}%)
              </span>
              <span className="text-[13px] text-muted-foreground">After Hours</span>
            </div>
          )}
        </div>

        {/* Right: market cap */}
        <MarketCap />
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

const states: MarketState[] = ["open", "afterHours"];

export default function StocksPage() {
  const params = useParams();
  const symbol = typeof params?.symbol === "string" ? params.symbol.toUpperCase() : "AAPL";
  const selectedStock = stocks.find(s => s.symbol === symbol) ?? stocks[0];
  const [marketState, setMarketState] = useState<MarketState>("open");
  const [headerCompact, setHeaderCompact] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "Overview";
    const hash = window.location.hash.replace("#", "").replace(/-/g, " ");
    const match = tabs.find((t) => t.toLowerCase() === hash.toLowerCase());
    return match || "Overview";
  });
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("1D");

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab !== "Overview") setChartPeriod("1D");
    const nextHash = tab.toLowerCase().replace(/\s+/g, "-");
    window.history.replaceState(null, "", `${window.location.pathname}#${nextHash}`);
  }, []);
  const priceRef = useRef<HTMLDivElement>(null);

  function cycleMarketState() {
    setMarketState((prev) => {
      const idx = states.indexOf(prev);
      return states[(idx + 1) % states.length];
    });
  }

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    if (!priceRef.current) return;
    const rect = priceRef.current.getBoundingClientRect();
    const mainTop = e.currentTarget.getBoundingClientRect().top;
    setHeaderCompact(rect.bottom < mainTop);
  }, []);

  return (
    <StockContext.Provider value={selectedStock}>
      <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
        <StatusBar />
        <StocksHeader compact={headerCompact} />

        <main className="no-scrollbar flex-1 overflow-y-auto" onScroll={handleScroll}>
          <StockInfo marketState={marketState} onLogoTap={cycleMarketState} priceRef={priceRef} chartPeriod={chartPeriod} />
          <div className="sticky top-0 z-10 bg-background">
            <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          <TabContent tab={activeTab} period={chartPeriod} onPeriodChange={setChartPeriod} />
        </main>

        {/* Sticky bottom bar — hidden on Options tab */}
        {activeTab !== "Options" && (
          <div className="border-t border-border/40 bg-background px-4 py-3">
            <div className="flex items-center gap-2">
              <button className="shrink-0 rounded-xl border border-border/60 px-4 py-3.5 text-[15px] font-semibold text-foreground active:scale-95 transition-transform">
                SIP
              </button>
              <button className="flex-1 rounded-xl bg-foreground py-3.5 text-[15px] font-semibold text-background active:scale-95 transition-transform">
                Buy
              </button>
              <button className="flex-1 rounded-xl bg-loss py-3.5 text-[15px] font-semibold text-white active:scale-95 transition-transform">
                Sell
              </button>
            </div>
          </div>
        )}

        <HomeIndicator />
      </div>
    </StockContext.Provider>
  );
}
