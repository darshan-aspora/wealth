"use client";

import { useState, useRef, useCallback, useEffect, useMemo, createContext, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Search, Bookmark, Share2, Maximize2, X, AlarmClockPlus, ArrowRight, Info } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { createChart, AreaSeries, ColorType } from "lightweight-charts";
import type { IChartApi } from "lightweight-charts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAI } from "@/contexts/ai-context";
import { StockNewsTab } from "../../stocks/stock-news-tab";


// ─── Types ──────────────────────────────────────────────────────────────────

type MarketState = "open" | "afterHours" | "closed";

// ─── Data Model ─────────────────────────────────────────────────────────────

interface IndexInfo {
  symbol: string;
  exchange: string;
  name: string;
  level: number;
  change: number;
  changePct: number;
  afterHoursChange: number;
  afterHoursChangePct: number;
  pe: string;
  ytdChangePct: number;
  constituents: number;
  marketCap: string;
  volume: string;
  description: string;
  indexProvider: string;
  baseYear: string;
  inceptionDate: string;
  rebalancing: string;
}

const indices: IndexInfo[] = [
  {
    symbol: "SPX",
    exchange: "NYSE",
    name: "S&P 500",
    level: 5234.18,
    change: 38.42,
    changePct: 0.74,
    afterHoursChange: 12.14,
    afterHoursChangePct: 0.23,
    pe: "22.4x",
    ytdChangePct: 9.83,
    constituents: 503,
    marketCap: "42.1T",
    volume: "3.2B",
    description:
      "The S&P 500 is a stock market index tracking the stock performance of 500 of the largest companies listed on stock exchanges in the United States. It is one of the most commonly followed equity indices and is considered the best single gauge of large-cap U.S. equities. The index covers approximately 80% of available U.S. market capitalization.",
    indexProvider: "S&P Dow Jones Indices",
    baseYear: "1957",
    inceptionDate: "Mar 4, 1957",
    rebalancing: "Quarterly",
  },
  {
    symbol: "NDX",
    exchange: "NASDAQ",
    name: "NASDAQ 100",
    level: 18247.09,
    change: -92.34,
    changePct: -0.5,
    afterHoursChange: -24.11,
    afterHoursChangePct: -0.13,
    pe: "29.1x",
    ytdChangePct: 7.21,
    constituents: 100,
    marketCap: "22.8T",
    volume: "4.1B",
    description:
      "The Nasdaq-100 is a stock market index made up of 101 equity securities issued by 100 of the largest non-financial companies listed on the Nasdaq. It is a modified capitalization-weighted index, with its components representing the technology, consumer discretionary, healthcare, industrials, telecommunications, and utilities sectors.",
    indexProvider: "Nasdaq",
    baseYear: "1985",
    inceptionDate: "Jan 31, 1985",
    rebalancing: "Annual",
  },
  {
    symbol: "DJI",
    exchange: "NYSE",
    name: "Dow Jones",
    level: 38996.39,
    change: 125.08,
    changePct: 0.32,
    afterHoursChange: 18.44,
    afterHoursChangePct: 0.05,
    pe: "20.1x",
    ytdChangePct: 3.14,
    constituents: 30,
    marketCap: "12.3T",
    volume: "310M",
    description:
      "The Dow Jones Industrial Average (DJIA) is a price-weighted average of 30 significant stocks traded on the New York Stock Exchange (NYSE) and the Nasdaq. It is one of the oldest and most closely watched stock market indices and serves as a barometer for the overall performance of the U.S. economy.",
    indexProvider: "S&P Dow Jones Indices",
    baseYear: "1896",
    inceptionDate: "May 26, 1896",
    rebalancing: "Ad hoc",
  },
  {
    symbol: "RUT",
    exchange: "NYSE",
    name: "Russell 2000",
    level: 2063.47,
    change: -18.93,
    changePct: -0.91,
    afterHoursChange: -5.22,
    afterHoursChangePct: -0.25,
    pe: "15.8x",
    ytdChangePct: -1.44,
    constituents: 2000,
    marketCap: "3.1T",
    volume: "1.8B",
    description:
      "The Russell 2000 Index measures the performance of the small-cap segment of the U.S. equity universe. It is a subset of the Russell 3000 Index representing approximately 10% of the total market capitalization of that index. The Russell 2000 includes approximately 2000 of the smallest securities based on a combination of market cap and current index membership.",
    indexProvider: "FTSE Russell",
    baseYear: "1984",
    inceptionDate: "Jan 1, 1984",
    rebalancing: "Annual",
  },
];

const IndexContext = createContext<IndexInfo>(indices[0]);
const useIndex = () => useContext(IndexContext);

const tabs = ["Overview", "Constituents", "ETFs", "Options", "Technicals", "News"];

// ─── Constituents Data ───────────────────────────────────────────────────────

const spxConstituents = [
  { rank: 1,  name: "Apple Inc.",        symbol: "AAPL",  weight: 7.0,  ytd:  16.2 },
  { rank: 2,  name: "Microsoft Corp.",   symbol: "MSFT",  weight: 6.8,  ytd:  12.4 },
  { rank: 3,  name: "NVIDIA Corp.",      symbol: "NVDA",  weight: 6.2,  ytd:  52.8 },
  { rank: 4,  name: "Amazon.com Inc.",   symbol: "AMZN",  weight: 3.8,  ytd:  18.4 },
  { rank: 5,  name: "Meta Platforms",    symbol: "META",  weight: 2.8,  ytd:  38.6 },
  { rank: 6,  name: "Alphabet Inc. A",   symbol: "GOOGL", weight: 2.4,  ytd:  14.2 },
  { rank: 7,  name: "Alphabet Inc. C",   symbol: "GOOG",  weight: 2.1,  ytd:  14.0 },
  { rank: 8,  name: "Tesla Inc.",        symbol: "TSLA",  weight: 1.8,  ytd: -14.2 },
  { rank: 9,  name: "Berkshire Hath. B", symbol: "BRK.B", weight: 1.7,  ytd:   6.8 },
  { rank: 10, name: "UnitedHealth Grp.", symbol: "UNH",   weight: 1.4,  ytd:  -2.4 },
];

// ─── Components ─────────────────────────────────────────────────────────────

function IndicesHeader({ compact }: { compact: boolean }) {
  const router = useRouter();
  const index = useIndex();
  const isUp = index.change >= 0;

  return (
    <header
      className={cn(
        "px-4 py-3 transition-all duration-200",
        compact && "bg-background/80 backdrop-blur-xl"
      )}
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Button>

        <AnimatePresence>
          {compact && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1 mx-3 min-w-0"
            >
              <p className="text-[15px] font-bold text-foreground truncate">{index.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold tabular-nums text-foreground">
                  {index.level.toFixed(2)}
                </span>
                <span
                  className={cn(
                    "text-[13px] font-semibold tabular-nums",
                    isUp ? "text-gain" : "text-loss"
                  )}
                >
                  {isUp ? "+" : ""}
                  {index.change.toFixed(2)} ({isUp ? "+" : ""}
                  {index.changePct.toFixed(2)}%)
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
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full bg-muted active:scale-95 transition-transform overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span className="text-[18px] font-bold text-foreground select-none">S</span>
    </button>
  );
}

function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-background">
      <div className="no-scrollbar flex gap-0.5 overflow-x-auto pl-2 pr-4 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-[14px] font-medium transition-colors whitespace-nowrap",
              activeTab === tab ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="index-tab"
                className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="h-px bg-border/60" />
    </div>
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

function gaussNoise(rand: () => number) {
  const u1 = rand();
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(Math.max(u1, 0.0001))) * Math.cos(2 * Math.PI * u2);
}

const priceRanges: Record<string, Record<ChartPeriod, [number, number]>> = {
  SPX: {
    "1D":  [5195.76, 5234.18],
    "1W":  [5108.42, 5234.18],
    "1M":  [4980.31, 5234.18],
    "3M":  [4720.55, 5234.18],
    "6M":  [4380.22, 5234.18],
    "1Y":  [4109.84, 5234.18],
    "5Y":  [2870.11, 5234.18],
    "All": [1420.00, 5234.18],
  },
  NDX: {
    "1D":  [18339.43, 18247.09],
    "1W":  [18050.77, 18247.09],
    "1M":  [17620.33, 18247.09],
    "3M":  [16410.88, 18247.09],
    "6M":  [15180.54, 18247.09],
    "1Y":  [13580.20, 18247.09],
    "5Y":  [7220.45,  18247.09],
    "All": [800.00,   18247.09],
  },
  DJI: {
    "1D":  [38871.31, 38996.39],
    "1W":  [38540.22, 38996.39],
    "1M":  [37820.64, 38996.39],
    "3M":  [36110.43, 38996.39],
    "6M":  [33850.88, 38996.39],
    "1Y":  [31880.32, 38996.39],
    "5Y":  [22640.21, 38996.39],
    "All": [8000.00,  38996.39],
  },
  RUT: {
    "1D":  [2082.40, 2063.47],
    "1W":  [2110.14, 2063.47],
    "1M":  [2155.82, 2063.47],
    "3M":  [2220.30, 2063.47],
    "6M":  [2090.11, 2063.47],
    "1Y":  [1900.54, 2063.47],
    "5Y":  [1200.42, 2063.47],
    "All": [400.00,  2063.47],
  },
};

const periodVolatility: Record<ChartPeriod, number> = {
  "1D": 0.0015,
  "1W": 0.004,
  "1M": 0.010,
  "3M": 0.014,
  "6M": 0.018,
  "1Y": 0.022,
  "5Y": 0.030,
  "All": 0.035,
};

function generateData(symbol: string, period: ChartPeriod, fallbackLevel: number) {
  const configs: Record<ChartPeriod, { bars: number; interval: number }> = {
    "1D":  { bars: 78,  interval: 5 * 60 },
    "1W":  { bars: 39,  interval: 60 * 60 },
    "1M":  { bars: 22,  interval: 24 * 60 * 60 },
    "3M":  { bars: 65,  interval: 24 * 60 * 60 },
    "6M":  { bars: 130, interval: 24 * 60 * 60 },
    "1Y":  { bars: 252, interval: 24 * 60 * 60 },
    "5Y":  { bars: 260, interval: 7 * 24 * 60 * 60 },
    "All": { bars: 300, interval: 30 * 24 * 60 * 60 },
  };

  const [startPrice, endPrice] =
    priceRanges[symbol]?.[period] ?? [fallbackLevel * 0.9, fallbackLevel];
  const { bars, interval } = configs[period];
  const vol = periodVolatility[period];
  const baseTime = 1772803800;

  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i) * (i + 1) * 137;
  seed += period.charCodeAt(0) * 997 + period.length * 31;
  const rand = seededRandom(seed);

  const totalReturn = Math.log(endPrice / startPrice);
  const driftPerBar = totalReturn / bars;

  const data: { time: number; value: number }[] = [];
  let price = startPrice;

  for (let i = 0; i < bars; i++) {
    data.push({ time: baseTime + i * interval, value: +price.toFixed(2) });
    const noise = gaussNoise(rand) * vol * price;
    const jump = rand() < 0.06 ? gaussNoise(rand) * vol * price * 2.5 : 0;
    const meanRevert =
      (startPrice + (endPrice - startPrice) * (i / bars) - price) * 0.03;
    price = price * Math.exp(driftPerBar) + noise + jump + meanRevert;
    price = Math.max(price, startPrice * 0.15);
  }

  if (data.length > 0) data[data.length - 1].value = endPrice;
  return data;
}

// ─── AI Typing ──────────────────────────────────────────────────────────────

const periods: ChartPeriod[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y", "All"];

const aiPhrases = [
  "What is driving SPX today?",
  "Compare SPX vs NDX",
  "Show top sector weights",
  "Explain P/E expansion",
  "Best ETF to track S&P 500?",
  "Historical SPX correction data",
];

function usePhraseRotation(phrases: string[], intervalMs = 5000) {
  const [idx, setIdx] = useState(0);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % phrases.length), intervalMs);
    return () => clearInterval(id);
  }, [reduceMotion, phrases.length, intervalMs]);
  return phrases[idx];
}

function useTypewriter(text: string, speed = 35) {
  const [displayed, setDisplayed] = useState("");
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i > text.length) {
        clearInterval(id);
        return;
      }
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
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (period === "1W") {
    return (
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      ", " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    );
  }
  if (period === "1M" || period === "3M") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface SelectionPoint {
  price: number;
  time: number;
  x: number;
  y: number;
  index: number;
}

function StockChart({
  height = 360,
  onExpand,
  period,
  onPeriodChange,
}: {
  height?: number;
  onExpand?: () => void;
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
}) {
  const index = useIndex();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const highlightRef = useRef<any>(null);
  const crosshairRef = useRef<SelectionPoint | null>(null);
  const [crosshairData, setCrosshairData] = useState<{
    price: number;
    time: number;
    x: number;
  } | null>(null);
  const [lastPricePos, setLastPricePos] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<SelectionPoint[]>([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isGain = index.change >= 0;
  const lineColor = isGain ? "hsl(142, 71%, 45%)" : "hsl(0, 72%, 51%)";
  const mutedLineColor = isDark ? "hsl(240, 5%, 35%)" : "hsl(240, 5%, 75%)";
  const mutedGradient = isDark
    ? "rgba(150, 150, 150, 0.08)"
    : "rgba(150, 150, 150, 0.06)";
  const gainColor = "hsl(142, 71%, 45%)";
  const lossColor = "hsl(0, 72%, 51%)";

  const data = useMemo(() => generateData(index.symbol, period, index.level), [index.symbol, index.level, period]);

  const { minPrice, maxPrice } = useMemo(() => {
    let min = Infinity,
      max = -Infinity;
    for (const d of data) {
      if (d.value < min) min = d.value;
      if (d.value > max) max = d.value;
    }
    return { minPrice: min, maxPrice: max };
  }, [data]);

  const [minMaxY, setMinMaxY] = useState<{
    minY: number | null;
    maxY: number | null;
  }>({ minY: null, maxY: null });

  useEffect(() => {
    setSelection([]);
  }, [period]);

  const delta = useMemo(() => {
    if (selection.length !== 2) return null;
    const [a, b] =
      selection[0].time <= selection[1].time
        ? [selection[0], selection[1]]
        : [selection[1], selection[0]];
    const change = +(b.price - a.price).toFixed(2);
    const changePct = +((change / a.price) * 100).toFixed(2);
    return { a, b, change, changePct, isUp: change >= 0 };
  }, [selection]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
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
        ? isDark
          ? "rgba(34, 197, 94, 0.30)"
          : "rgba(34, 197, 94, 0.22)"
        : isDark
        ? "rgba(239, 68, 68, 0.30)"
        : "rgba(239, 68, 68, 0.22)";
      const hlSeries = chart.addSeries(AreaSeries, {
        lineColor: hlColor,
        lineWidth: 3,
        topColor: hlGradient,
        bottomColor: "transparent",
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      hlSeries.setData(
        segmentData.map((d) => ({
          time: d.time as import("lightweight-charts").Time,
          value: d.value,
        }))
      );
      highlightRef.current = hlSeries;
      if (seriesRef.current) {
        seriesRef.current.applyOptions({
          lineColor: mutedLineColor,
          topColor: mutedGradient,
        });
      }
    } else {
      const topGradient = isGain
        ? isDark
          ? "rgba(34, 197, 94, 0.25)"
          : "rgba(34, 197, 94, 0.18)"
        : isDark
        ? "rgba(239, 68, 68, 0.25)"
        : "rgba(239, 68, 68, 0.18)";
      if (seriesRef.current) {
        seriesRef.current.applyOptions({
          lineColor: lineColor,
          topColor: topGradient,
        });
      }
    }
  }, [delta, data, isDark, isGain, lineColor, mutedLineColor, mutedGradient]);

  const updateSelectionCoords = useCallback(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;
    setSelection((prev) =>
      prev.map((pt) => {
        const y = series.priceToCoordinate(pt.price);
        const tc = chart
          .timeScale()
          .timeToCoordinate(pt.time as import("lightweight-charts").Time);
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
      rightPriceScale: { visible: false, borderVisible: false },
      leftPriceScale: { visible: false, borderVisible: false },
      timeScale: {
        visible: false,
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 2,
      },
      crosshair: {
        horzLine: { visible: false, labelVisible: false },
        vertLine: {
          visible: true,
          labelVisible: false,
          style: 3,
          color: isDark ? "hsl(240, 5%, 30%)" : "hsl(240, 5%, 70%)",
        },
      },
      handleScroll: false,
      handleScale: false,
    });

    const topGradient = isGain
      ? isDark
        ? "rgba(34, 197, 94, 0.25)"
        : "rgba(34, 197, 94, 0.18)"
      : isDark
      ? "rgba(239, 68, 68, 0.25)"
      : "rgba(239, 68, 68, 0.18)";

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

    series.setData(
      data.map((d) => ({
        time: d.time as import("lightweight-charts").Time,
        value: d.value,
      }))
    );
    chart.timeScale().fitContent();
    seriesRef.current = series;

    const lastPoint = data[data.length - 1];
    const updateOverlayPositions = () => {
      if (lastPoint) {
        const y = series.priceToCoordinate(lastPoint.value);
        const x = chart
          .timeScale()
          .timeToCoordinate(lastPoint.time as import("lightweight-charts").Time);
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

    let dragStart: SelectionPoint | null = null;
    let isDragging = false;
    const pointFromCrosshair = () => crosshairRef.current;
    const el = containerRef.current;

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
      const idx = data.findIndex((d) => d.time === time);
      const pt = { price, time, x, y, index: idx };
      crosshairRef.current = pt;
      setCrosshairData({ price: pt.price, time: pt.time, x: pt.x });
      if (isDragging && dragStart && pt.time !== dragStart.time) {
        setSelection([dragStart, pt]);
      }
    });

    chart.subscribeClick(() => {
      if (isDragging) return;
      const pt = pointFromCrosshair();
      if (!pt) return;
      setSelection((prev) => {
        if (prev.length < 2) return [...prev, pt];
        return [pt];
      });
    });

    const onMouseDown = () => {
      isDragging = false;
      const pt = pointFromCrosshair();
      if (pt) dragStart = pt;
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
      setTimeout(() => {
        isDragging = false;
      }, 50);
    };

    el?.addEventListener("mousedown", onMouseDown);
    el?.addEventListener("mousemove", onMouseMove);
    el?.addEventListener("mouseup", onMouseUp);

    return () => {
      el?.removeEventListener("mousedown", onMouseDown);
      el?.removeEventListener("mousemove", onMouseMove);
      el?.removeEventListener("mouseup", onMouseUp);
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

      {delta &&
        (() => {
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
            <div
              className={cn(
                "rounded-lg border shadow-sm px-2 py-1 flex flex-col items-center",
                fill && "flex-1 min-w-0",
                delta.isUp ? "bg-gain/10 border-gain/20" : "bg-loss/10 border-loss/20"
              )}
            >
              <p
                className={cn(
                  "text-[13px] font-bold tabular-nums leading-none whitespace-nowrap",
                  delta.isUp ? "text-gain" : "text-loss"
                )}
              >
                {delta.isUp ? "+" : ""}
                {delta.change.toFixed(2)}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-[12px] font-semibold tabular-nums whitespace-nowrap",
                  delta.isUp ? "text-gain" : "text-loss"
                )}
              >
                {delta.isUp ? "+" : ""}
                {delta.changePct.toFixed(2)}%
              </p>
            </div>
          );

          if (!useAbsolute) {
            const center = leftPt.x + gap / 2;
            return (
              <div
                className="absolute top-2 left-0 right-0 z-10 pointer-events-none"
                style={{ height: 40 }}
              >
                <div
                  className="absolute -translate-x-1/2 flex items-stretch gap-1.5"
                  style={{ left: center }}
                >
                  <PricePill pt={leftPt} />
                  <DeltaPill fill={false} />
                  <PricePill pt={rightPt} />
                </div>
              </div>
            );
          }

          const pillHalf = 42;
          const gapPx = 6;
          const deltaLeft = leftPt.x + pillHalf + gapPx;
          const deltaWidth = rightPt.x - pillHalf - gapPx - deltaLeft;

          return (
            <div
              className="absolute top-2 left-0 right-0 z-10 pointer-events-none"
              style={{ height: 40 }}
            >
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

      {(() => {
        if (minMaxY.maxY == null || minMaxY.minY == null) return null;
        const maxIdx = data.findIndex((d) => d.value === maxPrice);
        const minIdx = data.findIndex((d) => d.value === minPrice);
        const maxOnRight = maxIdx > data.length / 2;
        const minOnRight = minIdx > data.length / 2;

        const HLine = ({
          y,
          price,
          labelLeft,
          prefix,
        }: {
          y: number;
          price: number;
          labelLeft: boolean;
          prefix: string;
        }) => (
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
              {prefix}
              {price.toFixed(2)}
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

      {selection.map((pt, i) => (
        <div
          key={i}
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: pt.x, top: pt.y }}
        >
          <span
            className="block h-[10px] w-[10px] rounded-full border-2 border-background"
            style={{
              backgroundColor: delta ? (delta.isUp ? gainColor : lossColor) : lineColor,
            }}
          />
        </div>
      ))}

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

      <div className="flex items-center justify-center px-4 pt-2">
        <div className="flex items-center gap-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[14px] font-semibold transition-colors",
                period === p ? "bg-foreground text-background" : "text-muted-foreground"
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

// ─── Fullscreen Chart ────────────────────────────────────────────────────────

function FullscreenChart({
  onClose,
  period,
  onPeriodChange,
}: {
  onClose: () => void;
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
}) {
  const index = useIndex();
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
          <p className="text-[16px] font-bold text-foreground">{index.name}</p>
          <p className="text-[13px] text-muted-foreground">
            {index.symbol} : {index.exchange}
          </p>
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

function SectionHeader({
  title,
  right,
  className,
}: {
  title: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      <h3 className="text-[17px] font-bold text-foreground">{title}</h3>
      {right}
    </div>
  );
}

// ── Your Holding ──

function YourHolding() {
  return (
    <div className="px-4 pt-5 pb-5">
      <SectionHeader
        title="Your Holding"
        right={
          <button className="text-[13px] font-medium text-muted-foreground">
            Details &rsaquo;
          </button>
        }
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
          <p className="text-[12px] text-muted-foreground">Units</p>
          <p className="text-[15px] font-bold text-foreground tabular-nums">0.102134</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Today&apos;s Return</p>
          <p className="text-[15px] font-bold text-gain tabular-nums">03.4 +0.7%</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Est. XIRR</p>
          <p className="text-[15px] font-bold text-foreground tabular-nums">14.2%</p>
        </div>
      </div>
    </div>
  );
}

// ── Key Numbers ──

function RangeBarInline({
  low,
  high,
  current,
}: {
  low: number;
  high: number;
  current: number;
}) {
  const pct = Math.max(0, Math.min(100, ((current - low) / (high - low || 1)) * 100));
  return (
    <div className="relative h-[4px] w-[98px] rounded-full bg-[rgba(14,15,17,0.12)]">
      <div
        className="absolute left-0 top-0 h-full rounded-full bg-[#22C55E]"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[10px] bg-[#22C55E] rounded-sm"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}

function RangeStat({
  label,
  value,
  low,
  high,
  current,
  sub,
}: {
  label: string;
  value: string;
  low: number;
  high: number;
  current: number;
  sub?: string;
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

function StatItem({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="text-[14px] text-muted-foreground">{label}</p>
      <p className="text-[16px] font-medium text-foreground tabular-nums">{value}</p>
      {sub && <p className="text-[12px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function KeyNumbers() {
  const index = useIndex();
  const current = index.level;
  const todayLow = priceRanges[index.symbol]["1D"][0];
  const todayHigh = priceRanges[index.symbol]["1D"][1];
  const yearLow = priceRanges[index.symbol]["1Y"][0];
  const yearHigh = priceRanges[index.symbol]["1Y"][1];

  return (
    <div className="px-4 pt-5 pb-5">
      <SectionHeader title="Key Numbers" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        <RangeStat
          label="Today's Range"
          value={`${todayLow.toFixed(2)} - ${todayHigh.toFixed(2)}`}
          low={todayLow}
          high={todayHigh}
          current={current}
          sub="Intraday +1.5% vol surge"
        />
        <StatItem
          label="Today's Volume"
          value={index.volume}
          sub="+13% up vs 3M average"
        />
        <RangeStat
          label="1 Year Range"
          value={`${yearLow.toFixed(2)} - ${yearHigh.toFixed(2)}`}
          low={yearLow}
          high={yearHigh}
          current={current}
        />
        <StatItem label="P/E Ratio" value={index.pe} />
      </div>
    </div>
  );
}

// ── Market Depth ──

type BidRow = { orders: number; qty: number; bid: number };
type AskRow = { ask: number; qty: number; orders: number };

function generateDepth(midPrice: number): { bids: BidRow[]; asks: AskRow[] } {
  const spread = 0.5;
  const bids: BidRow[] = Array.from({ length: 5 }, (_, i) => ({
    bid: parseFloat((midPrice - spread * (i + 1) - Math.random() * 0.3).toFixed(2)),
    qty: Math.floor(Math.random() * 18) + 1,
    orders: Math.floor(Math.random() * 6),
  }));
  const asks: AskRow[] = Array.from({ length: 5 }, (_, i) => ({
    ask: parseFloat((midPrice + spread * (i + 1) + Math.random() * 0.3).toFixed(2)),
    qty: Math.floor(Math.random() * 18) + 1,
    orders: Math.floor(Math.random() * 6),
  }));
  return { bids, asks };
}

function MarketDepth() {
  const index = useIndex();
  const midPrice = index.level;
  const [depth, setDepth] = useState(() => generateDepth(midPrice));
  const [hoveredBid, setHoveredBid] = useState<number | null>(null);
  const [hoveredAsk, setHoveredAsk] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setDepth(generateDepth(midPrice));
    }, 1500);
    return () => clearInterval(id);
  }, [midPrice]);

  const bidCum = depth.bids.map((_, i) =>
    depth.bids.slice(0, i + 1).reduce((s, o) => s + o.qty, 0)
  );
  const askCum = depth.asks.map((_, i) =>
    depth.asks.slice(0, i + 1).reduce((s, o) => s + o.qty, 0)
  );
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
        <div>
          <p className="text-[13px] font-semibold text-foreground mb-2">Buy Orders</p>
          <div className="space-y-0.5">
            <div className="grid grid-cols-3 text-[11px] text-muted-foreground pb-1">
              <span>ORDERS</span>
              <span className="text-center">QTY</span>
              <span className="text-right">BID</span>
            </div>
            {depth.bids.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-3 text-[13px] tabular-nums text-foreground py-0.5 transition-all duration-300"
              >
                <span>{row.orders}</span>
                <span className="text-center">{row.qty}</span>
                <span className="text-right text-gain font-medium">{row.bid.toFixed(2)}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 text-[13px] font-semibold tabular-nums text-foreground pt-1 border-t border-border/40">
              <span>Total</span>
              <span className="text-center">{totalBid}</span>
              <span />
            </div>
          </div>
        </div>

        <div>
          <p className="text-[13px] font-semibold text-foreground mb-2">Sell Orders</p>
          <div className="space-y-0.5">
            <div className="grid grid-cols-3 text-[11px] text-muted-foreground pb-1">
              <span>ASK</span>
              <span className="text-center">QTY</span>
              <span className="text-right">ORDERS</span>
            </div>
            {depth.asks.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-3 text-[13px] tabular-nums text-foreground py-0.5 transition-all duration-300"
              >
                <span className="text-loss font-medium">{row.ask.toFixed(2)}</span>
                <span className="text-center">{row.qty}</span>
                <span className="text-right">{row.orders}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 text-[13px] font-semibold tabular-nums text-foreground pt-1 border-t border-border/40">
              <span />
              <span className="text-center">{totalAsk}</span>
              <span className="text-right">Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-[8px]">
        <div className="flex items-center justify-between text-[16px]">
          <span className="text-muted-foreground">
            Bids <span className="font-semibold text-foreground">{bidPct}%</span>
          </span>
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{askPct}%</span> Offers
          </span>
        </div>
        <div className="flex gap-[6px] w-full">
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

const INDEX_TAGS: Record<string, string[]> = {
  SPX: ["#Diversified", "#LargeCap"],
  NDX: ["#TechHeavy", "#LargeCap"],
  DJI: ["#BluChip", "#PriceWeighted"],
  RUT: ["#SmallCap", "#DomesticGrowth"],
};

function AboutSection() {
  const index = useIndex();
  const [expanded, setExpanded] = useState(false);
  const tags = INDEX_TAGS[index.symbol] ?? [];

  return (
    <div className="px-4 pt-5 pb-5">
      <SectionHeader title={`About ${index.name}`} />

      {tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[4px] bg-muted px-[6px] py-[2px] text-[12px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p
        className={cn(
          "text-[14px] text-muted-foreground leading-relaxed",
          !expanded && "line-clamp-3"
        )}
      >
        {index.description}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-1 text-[13px] font-medium text-foreground"
      >
        {expanded ? "Show less" : "Read more"}
      </button>

      <div className="grid grid-cols-2 gap-y-3 mt-4">
        <div>
          <p className="text-[12px] text-muted-foreground">Index Provider</p>
          <p className="text-[14px] font-semibold text-foreground">{index.indexProvider}</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Base Year</p>
          <p className="text-[14px] font-semibold text-foreground">{index.baseYear}</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Inception Date</p>
          <p className="text-[14px] font-semibold text-foreground">{index.inceptionDate}</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Rebalancing</p>
          <p className="text-[14px] font-semibold text-foreground">{index.rebalancing}</p>
        </div>
      </div>
    </div>
  );
}

// ── Analyst Rating ──

function AnalystRating() {
  const sell = 2, hold = 12, buy = 8;
  const total = sell + hold + buy; // 22

  const score = Math.round((buy * 100 + hold * 50) / total);
  const zone = score >= 71 ? "Buy" : score >= 31 ? "Neutral" : "Sell";

  const cx = 165, cy = 162, r = 112;
  const N = 90;
  const arcSegments = Array.from({ length: N }, (_, i) => {
    const t0 = i / N;
    const t1 = (i + 1) / N;
    const a0 = Math.PI * (1 - t0);
    const a1 = Math.PI * (1 - t1);
    const x0 = +(cx + r * Math.cos(a0)).toFixed(2);
    const y0 = +(cy - r * Math.sin(a0)).toFixed(2);
    const x1 = +(cx + r * Math.cos(a1)).toFixed(2);
    const y1 = +(cy - r * Math.sin(a1)).toFixed(2);
    const hue = t0 * 120;
    const sat = 88;
    const lig = hue > 15 && hue < 105 ? 52 : 48;
    return {
      d: `M ${x0},${y0} A ${r},${r} 0 0,0 ${x1},${y1}`,
      color: `hsl(${hue.toFixed(1)},${sat}%,${lig}%)`,
      first: i === 0,
      last: i === N - 1,
    };
  });

  const needleAngleDeg = (score / 100) * 180 - 90;
  const θ = (needleAngleDeg * Math.PI) / 180;
  const needleLen = 90;
  const nx = +(cx + needleLen * Math.sin(θ)).toFixed(2);
  const ny = +(cy - needleLen * Math.cos(θ)).toFixed(2);

  return (
    <div className="px-4 pt-5 pb-6">
      <SectionHeader title="Analyst Rating" />
      <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
        Analyst ratings reflect the opinions of market experts based on index constituents&apos;
        performance, macro trends, and valuation expectations.
      </p>

      <div className="relative w-full" style={{ aspectRatio: "330/175" }}>
        <svg viewBox="0 0 330 175" fill="none" className="absolute inset-0 w-full h-full">
          {arcSegments.map((seg, i) => (
            <path
              key={i}
              d={seg.d}
              stroke={seg.color}
              strokeWidth="17"
              strokeLinecap={seg.first || seg.last ? "round" : "butt"}
            />
          ))}
          <motion.line
            x1={cx}
            y1={cy}
            animate={{ x2: nx, y2: ny }}
            initial={{ x2: cx, y2: cy - needleLen }}
            transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.35 }}
            stroke="rgba(0,0,0,0.07)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <motion.line
            x1={cx}
            y1={cy}
            animate={{ x2: nx, y2: ny }}
            initial={{ x2: cx, y2: cy - needleLen }}
            transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.35 }}
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx={cx}
            cy={cy}
            r="9"
            className="fill-background"
            stroke="#1a1a1a"
            strokeWidth="2"
          />
        </svg>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute" style={{ left: "1%", bottom: "8%" }}>
            <p className="text-[13px] font-bold text-foreground leading-none">{sell}</p>
            <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">Sell</p>
          </div>
          <div
            className="absolute text-center"
            style={{ left: "50%", top: "3%", transform: "translateX(-50%)" }}
          >
            <p className="text-[13px] font-bold text-foreground leading-none">{hold}</p>
            <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">Neutral</p>
          </div>
          <div className="absolute text-right" style={{ right: "1%", bottom: "8%" }}>
            <p className="text-[13px] font-bold text-foreground leading-none">{buy}</p>
            <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">Buy</p>
          </div>
        </div>
      </div>

      <p className="text-center text-[20px] font-bold text-foreground mt-1 mb-4">{zone}</p>

      <div className="space-y-2">
        {[
          { label: "Buy", count: buy, color: "bg-gain", pct: (buy / total) * 100 },
          { label: "Hold", count: hold, color: "bg-amber-400", pct: (hold / total) * 100 },
          { label: "Sell", count: sell, color: "bg-loss", pct: (sell / total) * 100 },
        ].map(({ label, count, color, pct }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-8 text-[13px] font-medium text-foreground">{label}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-6 text-right text-[13px] font-semibold tabular-nums text-foreground">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Technical Tab Data ──────────────────────────────────────────────────────

const TECH_TIME_PERIODS = ["30M", "1H", "5H", "1D", "1W", "1M"] as const;
type TechTimePeriod = (typeof TECH_TIME_PERIODS)[number];

interface TechIndicatorRow {
  name: string;
  value: string;
  signal?: string;
}

const TECH_PERIOD_DATA: Record<
  TechTimePeriod,
  { signal: string; sell: number; neutral: number; buy: number }
> = {
  "30M": { signal: "Strong Buy", sell: 2,  neutral: 6,  buy: 18 },
  "1H":  { signal: "Neutral",    sell: 4,  neutral: 12, buy: 10 },
  "5H":  { signal: "Sell",       sell: 11, neutral: 10, buy: 5  },
  "1D":  { signal: "Sell",       sell: 14, neutral: 10, buy: 2  },
  "1W":  { signal: "Neutral",    sell: 4,  neutral: 14, buy: 8  },
  "1M":  { signal: "Buy",        sell: 3,  neutral: 7,  buy: 16 },
};

const TECH_MOMENTUM: Record<TechTimePeriod, TechIndicatorRow[]> = {
  "30M": [
    { name: "Relative Strength Index (D)", value: "68.12",  signal: "Neutral"    },
    { name: "Relative Strength Index (W)", value: "72.40",  signal: "Overbought" },
    { name: "Commodity Channel Index",     value: "142.10", signal: "Overbought" },
    { name: "Money Flow Index",            value: "63.20",  signal: "Neutral"    },
    { name: "Rate of Change",             value: "4.82",   signal: "Positive"   },
    { name: "Stochastic %K",              value: "78.50",  signal: "Bullish"    },
    { name: "Williams % R (D)",           value: "-18.40", signal: "Bullish"    },
  ],
  "1H": [
    { name: "Relative Strength Index (D)", value: "55.20",  signal: "Neutral"  },
    { name: "Relative Strength Index (W)", value: "61.33",  signal: "Neutral"  },
    { name: "Commodity Channel Index",     value: "89.30",  signal: "Neutral"  },
    { name: "Money Flow Index",            value: "52.10",  signal: "Neutral"  },
    { name: "Rate of Change",             value: "1.24",   signal: "Positive" },
    { name: "Stochastic %K",              value: "55.80",  signal: "Neutral"  },
    { name: "Williams % R (D)",           value: "-42.10", signal: "Neutral"  },
  ],
  "5H": [
    { name: "Relative Strength Index (D)", value: "44.80",  signal: "Neutral"  },
    { name: "Relative Strength Index (W)", value: "58.90",  signal: "Neutral"  },
    { name: "Commodity Channel Index",     value: "110.40", signal: "Oversold" },
    { name: "Money Flow Index",            value: "43.60",  signal: "Neutral"  },
    { name: "Rate of Change",             value: "-8.14",  signal: "Negative" },
    { name: "Stochastic %K",              value: "38.20",  signal: "Bearish"  },
    { name: "Williams % R (D)",           value: "-61.30", signal: "Neutral"  },
  ],
  "1D": [
    { name: "Relative Strength Index (D)", value: "40.33",  signal: "Neutral"  },
    { name: "Relative Strength Index (W)", value: "61.33",  signal: "Neutral"  },
    { name: "Commodity Channel Index",     value: "106.96", signal: "Oversold" },
    { name: "Money Flow Index",            value: "40.33",  signal: "Neutral"  },
    { name: "Rate of Change",             value: "-12.35", signal: "Negative" },
    { name: "Stochastic %K",              value: "40.33",  signal: "Bearish"  },
    { name: "Williams % R (D)",           value: "40.33",  signal: "Neutral"  },
  ],
  "1W": [
    { name: "Relative Strength Index (D)", value: "51.70",  signal: "Neutral"  },
    { name: "Relative Strength Index (W)", value: "56.80",  signal: "Neutral"  },
    { name: "Commodity Channel Index",     value: "74.20",  signal: "Neutral"  },
    { name: "Money Flow Index",            value: "54.90",  signal: "Neutral"  },
    { name: "Rate of Change",             value: "-2.60",  signal: "Negative" },
    { name: "Stochastic %K",              value: "51.40",  signal: "Neutral"  },
    { name: "Williams % R (D)",           value: "-50.20", signal: "Neutral"  },
  ],
  "1M": [
    { name: "Relative Strength Index (D)", value: "64.50",  signal: "Neutral"    },
    { name: "Relative Strength Index (W)", value: "68.90",  signal: "Neutral"    },
    { name: "Commodity Channel Index",     value: "128.30", signal: "Overbought" },
    { name: "Money Flow Index",            value: "62.70",  signal: "Neutral"    },
    { name: "Rate of Change",             value: "6.44",   signal: "Positive"   },
    { name: "Stochastic %K",              value: "70.60",  signal: "Bullish"    },
    { name: "Williams % R (D)",           value: "-24.80", signal: "Bullish"    },
  ],
};

const TECH_RELATIVE_STRENGTH: TechIndicatorRow[] = [
  { name: "Benchmark Index (21 D)", value: "-0.02", signal: "Negative" },
  { name: "Benchmark Index (55 D)", value: "0.08",  signal: "Positive" },
  { name: "Sector Index (55 D)",    value: "0.10",  signal: "Positive" },
];

const TECH_VOLATILITY: TechIndicatorRow[] = [
  { name: "Average True Range",   value: "21.36" },
  { name: "Bollinger Band Width", value: "0.26"  },
  { name: "Bollinger Bands %B",   value: "0.18"  },
  { name: "Standard Deviation",   value: "22.60" },
];

const INDICATOR_INFO: Record<string, string> = {
  "Relative Strength Index (D)":
    "Measures momentum on a scale of 0–100. Values above 70 indicate overbought conditions, below 30 suggest oversold. Useful for spotting trend reversals on a daily timeframe.",
  "Relative Strength Index (W)":
    "Weekly RSI provides a longer-term momentum view. A reading above 70 signals overbought territory on the weekly chart, which can precede a pullback.",
  "Commodity Channel Index":
    "Compares the current price to an average price over a set period. Readings above +100 suggest overbought; below -100 suggest oversold conditions.",
  "Money Flow Index":
    "Combines price and volume to measure buying and selling pressure. Values above 80 indicate overbought; below 20 suggest oversold. Sometimes called the volume-weighted RSI.",
  "Rate of Change":
    "Shows the percentage change in price over a specific period. Positive values indicate upward momentum; negative values indicate downward momentum.",
  "Stochastic %K":
    "Compares the closing price to the price range over a period. Readings below 20 suggest oversold; above 80 suggest overbought. Often used to spot divergence.",
  "Williams % R (D)":
    "Identifies overbought and oversold levels on a scale of 0 to -100. Readings above -20 indicate overbought; below -80 indicate oversold.",
  "Benchmark Index (21 D)":
    "Measures how the index has performed relative to a global benchmark over the past 21 trading days. Negative values mean underperformance.",
  "Benchmark Index (55 D)":
    "Tracks relative performance vs. the benchmark over 55 days. A positive value means the index outperformed the broader market.",
  "Sector Index (55 D)":
    "Compares the index to its sector over 55 days. Positive readings show outperformance relative to sector peers.",
  "Average True Range":
    "Measures market volatility by calculating the average range between high and low prices. Higher ATR means higher volatility and wider expected price swings.",
  "Bollinger Band Width":
    "Measures the distance between upper and lower Bollinger Bands. Low width signals low volatility (potential breakout); high width signals high volatility.",
  "Bollinger Bands %B":
    "Shows where price is relative to the Bollinger Bands. A value of 1 means price is at the upper band; 0 means it's at the lower band.",
  "Standard Deviation":
    "Measures how much the price deviates from its average. Higher standard deviation means more volatility and less predictable price movement.",
};

function TechSummaryGauge({
  signal,
  sell,
  neutral,
  buy,
}: {
  signal: string;
  sell: number;
  neutral: number;
  buy: number;
}) {
  const total = sell + neutral + buy;
  const angle = ((buy - sell) / total) * 85;
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[16px] font-semibold text-foreground">Summary</p>
      <div className="relative h-[84px] w-[168px]">
        <svg viewBox="0 0 168 88" className="absolute inset-0 w-full" overflow="visible">
          <path
            d="M 14 84 A 70 70 0 0 1 154 84"
            fill="none"
            stroke="#e5e5ea"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 14 84 A 70 70 0 0 1 84 14"
            fill="none"
            stroke="#1c1c1e"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <motion.g
            animate={{ rotate: angle }}
            initial={false}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{ originX: "84px", originY: "84px" }}
          >
            <line
              x1="84"
              y1="84"
              x2="84"
              y2="22"
              stroke="#1c1c1e"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="84" cy="84" r="5" fill="#1c1c1e" />
          </motion.g>
        </svg>
        <span className="absolute bottom-0 left-0 -translate-x-6 text-[11px] font-semibold text-foreground whitespace-nowrap">
          Strong sell
        </span>
        <span className="absolute bottom-0 right-0 translate-x-6 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
          Strong buy
        </span>
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
        {[
          { label: "Sell", val: sell },
          { label: "Neutral", val: neutral },
          { label: "Buy", val: buy },
        ].map(({ label, val }) => (
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

interface TechInfoSheetProps {
  row: TechIndicatorRow | null;
  onClose: () => void;
  onAIClick: (row: TechIndicatorRow) => void;
}

function TechInfoSheet({ row, onClose, onAIClick }: TechInfoSheetProps) {
  const description = row
    ? INDICATOR_INFO[row.name] ?? "No additional information available."
    : "";
  return (
    <AnimatePresence>
      {row && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="w-full max-w-[430px] rounded-t-[20px] bg-background px-5 pb-8 pt-4 shadow-xl pointer-events-auto"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[18px] font-semibold text-foreground">{row.name}</p>
                <button
                  onClick={onClose}
                  className="flex size-[28px] items-center justify-center rounded-full bg-muted transition-colors active:bg-muted/70"
                >
                  <X size={14} className="text-foreground" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <span className="text-[28px] font-bold tabular-nums text-foreground">
                  {row.value}
                </span>
                {row.signal && (
                  <span className="rounded-md bg-muted px-2.5 py-1 text-[13px] font-medium text-muted-foreground">
                    {row.signal}
                  </span>
                )}
              </div>

              <p className="mt-4 text-[14px] leading-[1.55] text-muted-foreground">
                {description}
              </p>

              <button
                onClick={() => {
                  onClose();
                  onAIClick(row);
                }}
                className="mt-6 flex w-full items-center justify-center gap-[11px] rounded-full py-[15px] active:opacity-80 transition-opacity"
                style={{
                  background: "linear-gradient(165.64deg, #4312D6 33.68%, #DD5927 95.98%)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 2L11.5 7.5L17 9L11.5 10.5L10 16L8.5 10.5L3 9L8.5 7.5L10 2Z"
                    fill="white"
                  />
                  <path
                    d="M16 2L16.8 4.2L19 5L16.8 5.8L16 8L15.2 5.8L13 5L15.2 4.2L16 2Z"
                    fill="white"
                    opacity="0.7"
                  />
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
            <span className="text-[14px] font-medium text-foreground uppercase whitespace-nowrap">
              {row.value}
            </span>
          </div>
        ))}
      </div>
      {showSignal && (
        <div className="flex flex-col" style={{ width: 103 }}>
          {rows.map((row) => (
            <div key={row.name} className="flex items-center justify-between px-[10px] py-[10px]">
              <span className="text-[14px] font-medium text-muted-foreground whitespace-nowrap">
                {row.signal}
              </span>
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

function TechAISheet({
  indicator,
  onClose,
}: {
  indicator: TechIndicatorRow | null;
  onClose: () => void;
}) {
  const { sendMessage, currentConversation, isGenerating, streamingState, newChat } = useAI();
  const [followUp, setFollowUp] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef<string | null>(null);

  const prompt = indicator
    ? `I didn't understand the ${indicator.name} indicator${
        indicator.signal ? ` showing a "${indicator.signal}" signal` : ""
      }. Can you explain what this means in simple terms and give me a real-world example?`
    : "";

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
          <motion.div
            key="ai-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
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
              <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-5 pb-4 pt-5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex size-7 items-center justify-center rounded-full"
                    style={{ background: "linear-gradient(135deg, #4312D6, #DD5927)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 2L11.5 7.5L17 9L11.5 10.5L10 16L8.5 10.5L3 9L8.5 7.5L10 2Z"
                        fill="white"
                      />
                      <path
                        d="M16 2L16.8 4.2L19 5L16.8 5.8L16 8L15.2 5.8L13 5L15.2 4.2L16 2Z"
                        fill="white"
                        opacity="0.7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground leading-tight">
                      AI Explanation
                    </p>
                    <p className="text-[12px] text-muted-foreground leading-tight">
                      {indicator?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex size-[28px] items-center justify-center rounded-full bg-muted transition-colors active:bg-muted/70"
                >
                  <X size={14} className="text-foreground" />
                </button>
              </div>

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
                      <path
                        d="M6 11V1M6 1L1.5 5.5M6 1L10.5 5.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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
        <div className="flex flex-col gap-2">
          <h2 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">
            Technical Analysis
          </h2>
          <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">
            Analyze price trends, indicators, and market momentum. Understand potential entry and
            exit points.
          </p>
        </div>

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
                    active
                      ? "rounded-[5px] bg-foreground py-[2px] text-background"
                      : "py-[5px] pt-[6px] text-muted-foreground"
                  )}
                >
                  {period}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-center py-2">
            <TechSummaryGauge
              signal={gauge.signal}
              sell={gauge.sell}
              neutral={gauge.neutral}
              buy={gauge.buy}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">
              Momentum
            </h3>
            <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">
              Measures speed &amp; strength of recent price movement
            </p>
          </div>
          <TechIndicatorTable rows={momentumRows} onInfoClick={setActiveSheet} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">
              Relative Strength
            </h3>
            <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">
              Compares index performance vs benchmark &amp; global peers
            </p>
          </div>
          <TechIndicatorTable rows={TECH_RELATIVE_STRENGTH} onInfoClick={setActiveSheet} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">
              Volatility
            </h3>
            <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">
              Measures size &amp; frequency of price fluctuations
            </p>
          </div>
          <TechIndicatorTable rows={TECH_VOLATILITY} showSignal={false} />
        </div>
      </div>

      <TechInfoSheet
        row={activeSheet}
        onClose={() => setActiveSheet(null)}
        onAIClick={(row) => {
          setActiveSheet(null);
          setAiSheet(row);
        }}
      />
      <TechAISheet indicator={aiSheet} onClose={() => setAiSheet(null)} />
    </>
  );
}

// ─── Constituents Tab ────────────────────────────────────────────────────────

function ConstituentsTab() {
  const index = useIndex();
  return (
    <div className="px-4 py-5">
      <SectionHeader title="Top Constituents" />

      {/* Table header */}
      <div className="flex items-center bg-muted/50 rounded-t-[6px]">
        <div className="flex-1 p-[10px]">
          <p className="text-[14px] font-medium text-foreground/60">Constituents</p>
        </div>
        <div className="w-[80px] p-[10px] text-right">
          <p className="text-[14px] font-medium text-foreground/60">Weight</p>
        </div>
      </div>

      {/* Table rows */}
      <div className="border border-t-0 border-border/30 rounded-b-[6px] divide-y divide-border/30">
        {spxConstituents.map((c) => (
          <div key={c.symbol} className="flex items-center">
            <div className="flex-1 p-[10px] flex flex-col gap-[4px]">
              <p className="text-[14px] font-medium text-foreground">{c.symbol}</p>
              <p className="text-[14px] text-foreground/70">{c.name}</p>
            </div>
            <div className="w-[80px] p-[10px] text-right">
              <p className="text-[14px] font-medium text-foreground tabular-nums uppercase">
                {c.weight.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full py-3 rounded-xl border border-border/60 text-[14px] font-medium text-foreground active:scale-[0.99] transition-transform">
        View All {index.constituents} Companies
      </button>
    </div>
  );
}

// ── Peers ──

const INDEX_PEERS: Record<string, { name: string; level: string; change: string; changePct: string; isUp: boolean; tag: string }[]> = {
  SPX: [
    { name: "NASDAQ 100", level: "18247", change: "-92.3", changePct: "-0.50%", isUp: false, tag: "Tech-heavy" },
    { name: "Dow Jones",  level: "38996", change: "+125.1", changePct: "+0.32%", isUp: true,  tag: "Blue-chip" },
    { name: "Russell 2000", level: "2063", change: "-18.9", changePct: "-0.91%", isUp: false, tag: "Small-cap" },
  ],
  NDX: [
    { name: "S&P 500",    level: "5234",  change: "+38.4", changePct: "+0.74%", isUp: true,  tag: "Diversified" },
    { name: "Dow Jones",  level: "38996", change: "+125.1", changePct: "+0.32%", isUp: true,  tag: "Blue-chip" },
    { name: "Russell 1000", level: "2847", change: "+15.5", changePct: "+1.01%", isUp: true, tag: "Tech-heavy" },
  ],
  DJI: [
    { name: "S&P 500",    level: "5234",  change: "+38.4", changePct: "+0.74%", isUp: true,  tag: "Diversified" },
    { name: "NASDAQ 100", level: "18247", change: "-92.3", changePct: "-0.50%", isUp: false, tag: "Tech-heavy" },
    { name: "Russell 2000", level: "2063", change: "-18.9", changePct: "-0.91%", isUp: false, tag: "Small-cap" },
  ],
  RUT: [
    { name: "S&P 500",    level: "5234",  change: "+38.4", changePct: "+0.74%", isUp: true,  tag: "Diversified" },
    { name: "NASDAQ 100", level: "18247", change: "-92.3", changePct: "-0.50%", isUp: false, tag: "Tech-heavy" },
    { name: "Dow Jones",  level: "38996", change: "+125.1", changePct: "+0.32%", isUp: true,  tag: "Blue-chip" },
  ],
};

function PeersSection() {
  const index = useIndex();
  const peers = INDEX_PEERS[index.symbol] ?? [];
  return (
    <div className="px-4 pt-5 pb-5">
      <SectionHeader title="Peers" />
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {peers.map((peer) => (
          <button
            key={peer.name}
            className="shrink-0 w-[118px] flex flex-col gap-3 items-center p-[10px] rounded-[8px] border border-border/50 bg-background active:scale-[0.97] transition-transform"
          >
            <div className="flex flex-col gap-2 items-center w-full">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <span className="text-[13px] font-bold text-foreground">{peer.name.slice(0, 2)}</span>
              </div>
              <p className="text-[14px] text-foreground text-center leading-tight">{peer.name}</p>
            </div>
            <div className="flex flex-col gap-1 items-center w-full">
              <p className="text-[14px] font-semibold text-foreground tabular-nums">{peer.level}</p>
              <p className={cn("text-[12px] font-medium tabular-nums", peer.isUp ? "text-gain" : "text-loss")}>
                {peer.changePct} <span className="text-muted-foreground/60">1D</span>
              </p>
            </div>
            <span className="rounded-[4px] bg-muted px-[6px] py-[2px] text-[10px] font-medium text-muted-foreground">
              {peer.tag}
            </span>
          </button>
        ))}
      </div>
      <button className="mt-3 w-full py-2.5 rounded-[8px] border border-border/60 text-[14px] font-medium text-foreground active:scale-[0.99] transition-transform">
        Compare
      </button>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({
  period,
  onPeriodChange,
}: {
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div>
      <StockChart
        onExpand={() => setFullscreen(true)}
        period={period}
        onPeriodChange={onPeriodChange}
      />

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

      <YourHolding />
      <KeyNumbers />
      <AboutSection />
      <PeersSection />
      <AnalystRating />
      <MarketDepth />

      <AnimatePresence>
        {fullscreen && (
          <FullscreenChart
            onClose={() => setFullscreen(false)}
            period={period}
            onPeriodChange={onPeriodChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Options Tab ─────────────────────────────────────────────────────────────

type OptionExpiryFilter = "Daily Expiry" | "Weekly" | "Monthly" | "Quarterly";
const OPTION_EXPIRY_FILTERS: OptionExpiryFilter[] = ["Daily Expiry", "Weekly", "Monthly", "Quarterly"];

interface PopularOptionTemplate {
  strikeFactor: number;
  callOrPut: "CALL" | "PUT";
  oi: number;
  priceFactor: number;
  changePct: number;
}

const POPULAR_OPTION_TEMPLATES: Record<OptionExpiryFilter, PopularOptionTemplate[]> = {
  "Daily Expiry": [
    { strikeFactor: 1.01, callOrPut: "CALL", oi: 1_210_000, priceFactor: 0.052, changePct: 18.1 },
    { strikeFactor: 0.99, callOrPut: "PUT",  oi: 895_000,   priceFactor: 0.047, changePct: 14.6 },
    { strikeFactor: 1.03, callOrPut: "CALL", oi: 750_000,   priceFactor: 0.039, changePct: 22.6 },
    { strikeFactor: 0.97, callOrPut: "PUT",  oi: 620_000,   priceFactor: 0.034, changePct: -10.8 },
    { strikeFactor: 1.05, callOrPut: "CALL", oi: 290_000,   priceFactor: 0.026, changePct: 17.2 },
    { strikeFactor: 0.95, callOrPut: "PUT",  oi: 190_000,   priceFactor: 0.024, changePct: -7.4 },
    { strikeFactor: 1.08, callOrPut: "CALL", oi: 250_000,   priceFactor: 0.029, changePct: 13.1 },
  ],
  Weekly: [
    { strikeFactor: 1.02, callOrPut: "CALL", oi: 990_000, priceFactor: 0.061, changePct: 12.8 },
    { strikeFactor: 0.98, callOrPut: "PUT",  oi: 840_000, priceFactor: 0.056, changePct: 9.4 },
    { strikeFactor: 1.05, callOrPut: "CALL", oi: 610_000, priceFactor: 0.045, changePct: 16.2 },
    { strikeFactor: 0.95, callOrPut: "PUT",  oi: 530_000, priceFactor: 0.041, changePct: -6.8 },
    { strikeFactor: 1.08, callOrPut: "CALL", oi: 355_000, priceFactor: 0.036, changePct: 11.3 },
  ],
  Monthly: [
    { strikeFactor: 1.03, callOrPut: "CALL", oi: 780_000, priceFactor: 0.074, changePct: 8.7 },
    { strikeFactor: 0.97, callOrPut: "PUT",  oi: 690_000, priceFactor: 0.070, changePct: 6.1 },
    { strikeFactor: 1.10, callOrPut: "CALL", oi: 470_000, priceFactor: 0.054, changePct: 9.9 },
    { strikeFactor: 0.90, callOrPut: "PUT",  oi: 410_000, priceFactor: 0.051, changePct: -4.4 },
    { strikeFactor: 1.15, callOrPut: "CALL", oi: 305_000, priceFactor: 0.043, changePct: 7.6 },
  ],
  Quarterly: [
    { strikeFactor: 1.05, callOrPut: "CALL", oi: 620_000, priceFactor: 0.092, changePct: 7.1 },
    { strikeFactor: 0.95, callOrPut: "PUT",  oi: 560_000, priceFactor: 0.087, changePct: 5.2 },
    { strikeFactor: 1.12, callOrPut: "CALL", oi: 380_000, priceFactor: 0.063, changePct: 8.6 },
    { strikeFactor: 0.88, callOrPut: "PUT",  oi: 335_000, priceFactor: 0.058, changePct: -3.8 },
  ],
};

function formatOptionOI(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `${value}`;
}

function mockOI(price: number, sym: string) {
  let h = 0;
  for (let i = 0; i < sym.length; i++) h = (Math.imul(31, h) + sym.charCodeAt(i)) | 0;
  let s = Math.abs(h) % 2147483647 || 1;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const base = Math.round(price * 80);
  const callOI = base + Math.round(rand() * base * 0.6);
  const putOI  = Math.round(callOI * (0.4 + rand() * 0.35));
  return { callOI, putOI, pcr: +(putOI / callOI).toFixed(2) };
}
function fmtOI(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return n.toLocaleString();
  return String(n);
}
function mockFutures(price: number, sym: string) {
  let h = 0;
  for (let i = 0; i < sym.length; i++) h = (Math.imul(17, h) + sym.charCodeAt(i)) | 0;
  let s = Math.abs(h) % 2147483647 || 1;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  return [
    { expiry: "28 Apr '26", price: +(price * (1 + (rand() - 0.48) * 0.006)).toFixed(2), pct: +((rand() - 0.45) * 6).toFixed(2) },
    { expiry: "26 May '26", price: +(price * (1 + (rand() - 0.46) * 0.008)).toFixed(2), pct: +((rand() - 0.44) * 6).toFixed(2) },
    { expiry: "25 Jun '26", price: +(price * (1 + (rand() - 0.44) * 0.01)).toFixed(2),  pct: +((rand() - 0.43) * 6).toFixed(2) },
  ];
}

function OIInfoDrawer({ open, onClose, putOI, callOI, pcr }: { open: boolean; onClose: () => void; putOI: number; callOI: number; pcr: number }) {
  const fmtN = (n: number) => n.toLocaleString("en-US");
  const sentiment = pcr > 1 ? "bearish" : pcr < 0.7 ? "bullish" : "neutral";
  const sentimentColor = sentiment === "bullish" ? "text-emerald-500" : sentiment === "bearish" ? "text-red-500" : "text-amber-500";
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[85dvh] flex flex-col inset-x-0 mx-auto max-w-[430px]">
        <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 rounded-full bg-border" /></div>
        <div className="px-5 pt-3 pb-4 border-b border-border/40 shrink-0 flex items-start justify-between gap-3">
          <p className="text-[18px] font-bold text-foreground">Open Interest (OI)</p>
          <button onClick={onClose} className="rounded-full p-1 -mr-1 -mt-0.5 active:bg-muted/50 shrink-0"><X size={20} className="text-foreground" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          <p className="text-[14px] text-muted-foreground leading-relaxed">Open Interest is the total number of outstanding option contracts that have not been settled. Higher OI means more market participation and liquidity in that strike.</p>
          <div className="rounded-2xl bg-muted/40 p-4 space-y-3">
            <div className="flex items-center justify-between"><p className="text-[13px] text-muted-foreground">Total Call OI</p><p className="text-[15px] font-bold text-foreground tabular-nums">{fmtN(callOI)}</p></div>
            <div className="h-px bg-border/40" />
            <div className="flex items-center justify-between"><p className="text-[13px] text-muted-foreground">Total Put OI</p><p className="text-[15px] font-bold text-foreground tabular-nums">{fmtN(putOI)}</p></div>
            <div className="h-px bg-border/40" />
            <div className="flex items-center justify-between"><p className="text-[13px] text-muted-foreground">Put:Call Ratio</p><p className={cn("text-[15px] font-bold tabular-nums", sentimentColor)}>{pcr} · {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</p></div>
          </div>
          <div className="space-y-3">
            <p className="text-[13px] font-semibold text-foreground uppercase tracking-wide">How to read this</p>
            {[
              { label: "PCR > 1", desc: "More puts than calls — market participants are buying more downside protection. Often seen as bearish." },
              { label: "PCR < 0.7", desc: "More calls than puts — market participants are positioned for upside. Often seen as bullish." },
              { label: "PCR ≈ 0.7–1", desc: "Roughly balanced. Market has no strong directional bias." },
            ].map((row) => (
              <div key={row.label} className="rounded-xl bg-muted/30 px-4 py-3">
                <p className="text-[13px] font-semibold text-foreground mb-0.5">{row.label}</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{row.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function IndexOptionsTab() {
  const index = useIndex();
  const router = useRouter();
  const [expiryFilter, setExpiryFilter] = useState<OptionExpiryFilter>("Daily Expiry");
  const [oiDrawerOpen, setOiDrawerOpen] = useState(false);

  const rows = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const baseDate =
      expiryFilter === "Daily Expiry" ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : expiryFilter === "Weekly" ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + (5 - now.getDay()))
      : expiryFilter === "Monthly" ? new Date(now.getFullYear(), now.getMonth() + 1, 0)
      : new Date(now.getFullYear(), now.getMonth() + 3, 0);

    return POPULAR_OPTION_TEMPLATES[expiryFilter].map((t, i) => {
      const strike = Math.round(index.level * t.strikeFactor * 2) / 2;
      const optionPrice = +(index.level * t.priceFactor).toFixed(2);
      const changeAbs = +(optionPrice * t.changePct / 100).toFixed(2);
      const expiryLabel = `${months[baseDate.getMonth()]} ${pad(baseDate.getDate())}`;
      const expiryDate = `${baseDate.getFullYear()}-${pad(baseDate.getMonth() + 1)}-${pad(baseDate.getDate())}`;
      return {
        id: `${expiryFilter}-${i}`,
        underlyingLabel: index.level.toFixed(2),
        optionLabel: `${expiryLabel} ${strike} ${t.callOrPut === "CALL" ? "Call" : "Put"}`,
        oiLabel: formatOptionOI(t.oi),
        optionPriceLabel: `$${optionPrice.toFixed(2)}`,
        changeLabel: `${changeAbs >= 0 ? "+" : ""}$${Math.abs(changeAbs).toFixed(2)} (${t.changePct >= 0 ? "+" : ""}${t.changePct.toFixed(1)}%)`,
        positive: t.changePct >= 0,
        strikeValue: strike,
        side: t.callOrPut.toLowerCase(),
        expiryDate,
        ltp: optionPrice,
      };
    });
  }, [expiryFilter, index]);

  const oi = useMemo(() => mockOI(index.level, index.symbol), [index]);
  const futures = useMemo(() => mockFutures(index.level, index.symbol), [index]);
  const shortName = index.name.split(" ").slice(0, 2).join(" ");

  return (
    <div className="flex min-h-full flex-col pb-6">
      {/* Key Information */}
      <div className="border-b border-border/60 px-4 py-5">
        <p className="text-[17px] font-semibold tracking-[-0.3px] text-foreground mb-4">Key Information</p>

        <div className="flex items-center gap-2 mb-4">
          <p className="text-[13px] font-medium text-foreground">Open Interest (OI)</p>
          <button onClick={() => setOiDrawerOpen(true)} className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground active:opacity-60">i</button>
        </div>
        {(() => {
          const total = oi.callOI + oi.putOI;
          const callPct = Math.round((oi.callOI / total) * 100);
          const putPct = 100 - callPct;
          return (
            <div className="mb-5">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <p className="text-[12px] text-muted-foreground">Total Call OI</p>
                  <p className="mt-0.5 text-[16px] font-semibold tracking-[-0.3px] text-emerald-600">{fmtOI(oi.callOI)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] text-muted-foreground">Put:Call ratio</p>
                  <p className="mt-0.5 text-[16px] font-semibold tracking-[-0.3px]">{oi.pcr}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-muted-foreground">Total Put OI</p>
                  <p className="mt-0.5 text-[16px] font-semibold tracking-[-0.3px] text-red-500">{fmtOI(oi.putOI)}</p>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex gap-px">
                <div className="h-full rounded-l-full bg-emerald-500" style={{ width: `${callPct}%` }} />
                <div className="h-full rounded-r-full bg-red-400" style={{ width: `${putPct}%` }} />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] text-emerald-600 font-medium">Calls {callPct}%</span>
                <span className="text-[11px] text-red-500 font-medium">Puts {putPct}%</span>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-3 divide-x divide-border/60 rounded-xl bg-muted/40 overflow-hidden mb-5">
          <div className="px-3 py-3 text-center">
            <p className="text-[11px] text-muted-foreground">Lot Size</p>
            <p className="mt-0.5 text-[13px] font-bold tracking-[-0.2px]">1 Lot = 100</p>
          </div>
          <div className="px-3 py-3 text-center">
            <p className="text-[11px] text-muted-foreground">Buy Price</p>
            <p className="mt-0.5 text-[13px] font-bold tracking-[-0.2px]">Premium × 100</p>
          </div>
          <div className="px-3 py-3 text-center">
            <p className="text-[11px] text-muted-foreground">Sell Margin</p>
            <p className="mt-0.5 text-[13px] font-bold tracking-[-0.2px]">~${Math.round(index.level * 100 * 0.124).toLocaleString()} / Lot</p>
          </div>
        </div>

        <Button
          onClick={() => router.push(`/options-chain/${encodeURIComponent(index.symbol)}`)}
          className="h-12 w-full rounded-[10px] bg-black text-[16px] font-medium text-white hover:bg-black/95"
        >
          Option Chain
        </Button>
      </div>
      <OIInfoDrawer open={oiDrawerOpen} onClose={() => setOiDrawerOpen(false)} putOI={oi.putOI} callOI={oi.callOI} pcr={oi.pcr} />


      {/* Popular options section */}
      <div className="px-4 pt-5">
        <h3 className="text-[20px] font-semibold tracking-[-0.4px] text-foreground">Popular {index.name} Options</h3>
      </div>

      {/* Expiry filter pills */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 pt-4">
        {OPTION_EXPIRY_FILTERS.map((filter) => {
          const active = filter === expiryFilter;
          return (
            <button
              key={filter}
              onClick={() => setExpiryFilter(filter)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold tracking-[-0.26px] transition-colors",
                active ? "bg-[#2a2a2a] text-white" : "bg-muted text-foreground",
              )}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Options rows */}
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
                  ltp: row.ltp.toFixed(2),
                });
                router.push(`/options-chain/${encodeURIComponent(index.symbol)}/leg?${params.toString()}`);
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

// ─── Tab Content ─────────────────────────────────────────────────────────────

function TabContent({
  tab,
  period,
  onPeriodChange,
}: {
  tab: string;
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
}) {
  const index = useIndex();
  if (tab === "Overview")     return <OverviewTab period={period} onPeriodChange={onPeriodChange} />;
  if (tab === "Constituents") return <ConstituentsTab />;
  if (tab === "Options")      return <IndexOptionsTab />;
  if (tab === "Technicals")   return <TechnicalTab />;
  if (tab === "News")         return <StockNewsTab symbol={index.symbol} />;
  return (
    <div className="px-4 py-16 flex flex-col items-center justify-center min-h-[400px]">
      <p className="text-[16px] font-semibold text-foreground">{tab}</p>
      <p className="mt-1 text-[13px] text-muted-foreground">Coming soon</p>
    </div>
  );
}

// ─── Index PE Widget ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function IndexPEWidget() {
  const index = useIndex();
  return (
    <div className="shrink-0 text-right">
      <div className="flex items-baseline justify-end gap-1.5">
        <span className="text-[12px] font-medium text-muted-foreground leading-none">P/E</span>
        <span className="text-[15px] font-bold tracking-tight tabular-nums text-foreground leading-none">
          {index.pe}
        </span>
      </div>
      <div className="mt-1.5 flex justify-end">
        <span className="inline-block text-[11px] font-medium text-foreground bg-muted px-2 py-[3px] rounded-md leading-none">
          {index.constituents} Constituents
        </span>
      </div>
    </div>
  );
}

// ─── Index Info ──────────────────────────────────────────────────────────────

const periodLabels: Record<ChartPeriod, string> = {
  "1D": "Today",
  "1W": "Past Week",
  "1M": "Past Month",
  "3M": "Past 3 Months",
  "6M": "Past 6 Months",
  "1Y": "Past Year",
  "5Y": "Past 5 Years",
  "All": "All Time",
};

function usePeriodChange(period: ChartPeriod) {
  const index = useIndex();
  return useMemo(() => {
    const ranges = priceRanges[index.symbol]?.[period];
    if (!ranges) return { change: index.change, changePct: index.changePct };
    const [start, end] = ranges;
    const change = +(end - start).toFixed(2);
    const changePct = +((change / start) * 100).toFixed(2);
    return { change, changePct };
  }, [index, period]);
}

function IndexInfoWidget({
  marketState,
  onLogoTap,
  priceRef,
  chartPeriod,
}: {
  marketState: MarketState;
  onLogoTap: () => void;
  priceRef: React.RefObject<HTMLDivElement>;
  chartPeriod: ChartPeriod;
}) {
  const index = useIndex();
  const { change, changePct } = usePeriodChange(chartPeriod);
  const isUp = change >= 0;
  const ahUp = index.afterHoursChange >= 0;
  const showAfterHours = marketState === "afterHours" && chartPeriod === "1D";

  return (
    <div className="px-4 pt-4 pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-[-0.14px]">
            {index.symbol} : {index.exchange}
          </p>
          <p className="text-[22px] font-bold text-foreground tracking-tight truncate">{index.name}</p>
        </div>
        <Logo size={36} onClick={onLogoTap} />
      </div>

      <div ref={priceRef} className="mt-3 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[28px] font-bold tracking-tight tabular-nums text-foreground leading-none">
            {index.level.toFixed(2)}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "text-[14px] font-semibold tabular-nums",
                isUp ? "text-gain" : "text-loss"
              )}
            >
              {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)} ({isUp ? "+" : ""}{changePct.toFixed(2)}%)
            </span>
            <span className="text-[14px] text-muted-foreground">{periodLabels[chartPeriod]}</span>
          </div>
          {showAfterHours && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className={cn("text-[13px] font-semibold tabular-nums", ahUp ? "text-gain" : "text-loss")}>
                {ahUp ? "+" : ""}{index.afterHoursChange.toFixed(2)} ({ahUp ? "+" : ""}{index.afterHoursChangePct.toFixed(2)}%)
              </span>
              <span className="text-[13px] text-muted-foreground">After Hours</span>
            </div>
          )}
          {/* Extended Hours badge */}
          <div className="mt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf8e5] px-2.5 py-1 text-[12px] font-medium text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d4a017] animate-pulse" />
              Option Extended Hours · Open until 5:00 PM ET
            </span>
          </div>
        </div>

        {/* Market Cap + P/E */}
        <div className="shrink-0 text-right ml-3">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-[12px] text-muted-foreground">Market Cap:</span>
            <span className="text-[14px] font-bold text-foreground tabular-nums">{index.marketCap}</span>
          </div>
          <div className="mt-1.5 flex justify-end">
            <span className="inline-block text-[11px] font-medium text-foreground bg-muted px-2 py-[3px] rounded-md leading-none">
              P/E {index.pe}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const states: MarketState[] = ["open", "afterHours"];

export default function IndicesPage() {
  const params = useParams();
  const symbol = (typeof params?.symbol === "string" ? params.symbol : "SPX").toUpperCase();
  const selectedIndex = indices.find(i => i.symbol === symbol) ?? indices[0];

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
    window.location.hash = tab.toLowerCase().replace(/\s+/g, "-");
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
    <IndexContext.Provider value={selectedIndex}>
      <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
        <StatusBar />
        <IndicesHeader compact={headerCompact} />

        <main className="no-scrollbar flex-1 overflow-y-auto" onScroll={handleScroll}>
          <IndexInfoWidget
            marketState={marketState}
            onLogoTap={cycleMarketState}
            priceRef={priceRef}
            chartPeriod={chartPeriod}
          />
          <div className="sticky top-0 z-10 bg-background">
            <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          <TabContent tab={activeTab} period={chartPeriod} onPeriodChange={setChartPeriod} />
        </main>

        {/* Sticky bottom bar */}
        <div className="border-t border-border/40 bg-background px-4 py-3">
          <button className="w-full rounded-[8px] bg-foreground py-3.5 text-[16px] font-medium text-background active:scale-95 transition-transform">
            Trade Options
          </button>
        </div>

        <HomeIndicator />
      </div>
    </IndexContext.Provider>
  );
}
