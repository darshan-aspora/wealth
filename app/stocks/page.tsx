"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Bookmark, Share2, Maximize2, X, AlarmClockPlus, ArrowRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { createChart, AreaSeries, ColorType } from "lightweight-charts";
import type { IChartApi } from "lightweight-charts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Button } from "@/components/ui/button";

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
];

const stock = stocks[0];

const tabs = [
  "Overview",
  "Revenue",
  "Financials",
  "Options",
  "Technical",
  "News",
  "Ownership",
  "ETFs",
  "Events",
  "My Order",
];

// ─── Components ─────────────────────────────────────────────────────────────

function StocksHeader({ compact }: { compact: boolean }) {
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
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-xl bg-muted active:scale-95 transition-transform"
      style={{ width: size, height: size }}
    />
  );
}

function TabBar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <div className="sticky top-0 z-10 bg-background">
      <div className="no-scrollbar flex gap-0.5 overflow-x-auto pl-2 pr-4 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-[14px] font-medium transition-colors whitespace-nowrap",
              activeTab === tab
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="stock-tab"
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

  const [startPrice, endPrice] = priceRanges[symbol]?.[period] ?? [stock.price * 0.9, stock.price];
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

  const data = useMemo(() => generateData(stock.symbol, period), [period]);

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

function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[17px] font-bold text-foreground">{title}</h3>
      {right}
    </div>
  );
}

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
    <div className="px-4 pt-5 pb-2">
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

function KeyNumbers() {
  return (
    <div className="px-4 pt-5 pb-2">
      <SectionHeader title="Key Numbers" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        <div>
          <KVRow label="Today's Range" value="406.8 – 411.8" />
          <p className="text-[11px] text-muted-foreground -mt-1 mb-1">Intraday +1.5% vol surge</p>
        </div>
        <div>
          <KVRow label="Today's Volume" value="67.2 M" />
          <p className="text-[11px] text-gain -mt-1 mb-1">+13% up vs 3M average</p>
        </div>
        <KVRow label="1 Year Range" value="406.8 – 411.8" />
        <KVRow label="Revenue" value="96.7 B" />
        <KVRow label="3 Year's Range" value="406.8 – 411.8" />
        <KVRow label="Profit Margin" value="26.3%" />
        <KVRow label="Dividend Yield" value="N/A" />
        <KVRow label="P/E Ratio" value="233.17" />
      </div>
    </div>
  );
}

// ── Market Depth ──

const buyOrders = [
  { orders: 2, qty: 2, bid: 410.12 },
  { orders: 5, qty: 5, bid: 411.72 },
  { orders: 0, qty: 12, bid: 411.40 },
  { orders: 6, qty: 6, bid: 411.72 },
  { orders: 0, qty: 0, bid: 411.20 },
];

const sellOrders = [
  { ask: 412.03, qty: 12, orders: 1 },
  { ask: 412.03, qty: 5, orders: 1 },
  { ask: 412.03, qty: 16, orders: 0 },
  { ask: 412.03, qty: 2, orders: 0 },
  { ask: 412.03, qty: 8, orders: 0 },
];

function MarketDepth() {
  return (
    <div className="px-4 pt-5 pb-2">
      <SectionHeader
        title="Market Depth"
        right={
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-gain">
            <span className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" />
            Live
          </span>
        }
      />
      <p className="text-[12px] text-muted-foreground mb-3">Real-time: 12:30:33 PM</p>

      <div className="grid grid-cols-2 gap-4">
        {/* Buy side */}
        <div>
          <p className="text-[13px] font-semibold text-foreground mb-2">Buy Orders</p>
          <div className="space-y-0.5">
            <div className="grid grid-cols-3 text-[11px] text-muted-foreground pb-1">
              <span>ORDERS</span><span className="text-center">QTY</span><span className="text-right">BID</span>
            </div>
            {buyOrders.map((row, i) => (
              <div key={i} className="grid grid-cols-3 text-[13px] tabular-nums text-foreground py-0.5">
                <span>{row.orders}</span>
                <span className="text-center">{row.qty}</span>
                <span className="text-right text-gain font-medium">{row.bid.toFixed(2)}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 text-[13px] font-semibold tabular-nums text-foreground pt-1 border-t border-border/40">
              <span>Total</span><span className="text-center">31</span><span />
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
            {sellOrders.map((row, i) => (
              <div key={i} className="grid grid-cols-3 text-[13px] tabular-nums text-foreground py-0.5">
                <span className="text-loss font-medium">{row.ask.toFixed(2)}</span>
                <span className="text-center">{row.qty}</span>
                <span className="text-right">{row.orders}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 text-[13px] font-semibold tabular-nums text-foreground pt-1 border-t border-border/40">
              <span /><span className="text-center">42</span><span className="text-right">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bid/Offer bar */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[13px] font-semibold text-gain tabular-nums">Bids 23%</span>
        <div className="flex-1 h-2 rounded-full bg-loss/20 overflow-hidden">
          <div className="h-full rounded-full bg-gain" style={{ width: "23%" }} />
        </div>
        <span className="text-[13px] font-semibold text-loss tabular-nums">77% Offers</span>
      </div>
    </div>
  );
}

// ── About Section ──

function AboutSection() {
  const [expanded, setExpanded] = useState(false);

  const description = "Apple Inc. engages in the design, development, manufacture, and sale of electric vehicles and energy generation and storage systems. The company operates through Automotive and Energy Generation and Storage. The Automotive segment includes the design, development, manufacture, sale, and lease of electric vehicles as well as sales of automotive regulatory credits.";

  return (
    <div className="px-4 pt-5 pb-2">
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

const peers = [
  { symbol: "MSFT", name: "Microsoft Corp", price: 415.8, change: -0.21, tags: ["Software", "Cloud"] },
  { symbol: "GOOGL", name: "Alphabet Inc", price: 178.2, change: -0.01, tags: ["Search", "Cloud"] },
  { symbol: "AMZN", name: "Amazon.com Inc", price: 192.5, change: 1.01, tags: ["E-comm", "Cloud"] },
];

function PeersSection() {
  return (
    <div className="px-4 pt-5 pb-2">
      <SectionHeader title="Peers" />
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
        {peers.map((peer) => {
          const isUp = peer.change >= 0;
          return (
            <div key={peer.symbol} className="shrink-0 w-[130px] rounded-xl border border-border/60 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-muted" />
                <span className="text-[13px] font-bold text-foreground">{peer.symbol}</span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate mb-2">{peer.name}</p>
              <p className="text-[15px] font-bold tabular-nums text-foreground">{peer.price.toFixed(1)}</p>
              <p className={cn("text-[12px] font-semibold tabular-nums", isUp ? "text-gain" : "text-loss")}>
                {isUp ? "+" : ""}{peer.change.toFixed(2)}% 1D
              </p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {peer.tags.map((tag) => (
                  <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-2 py-2.5 rounded-xl border border-border/60 text-[14px] font-semibold text-foreground active:scale-[0.99] transition-transform">
        Compare
      </button>
    </div>
  );
}

// ── Analyst Rating ──

function AnalystRating() {
  const buy = 12;
  const sell = 1;
  const hold = 22;
  const total = buy + sell + hold;
  const buyPct = Math.round((buy / total) * 100);
  const sellPct = Math.round((sell / total) * 100);
  const holdPct = Math.round((hold / total) * 100);

  return (
    <div className="px-4 pt-5 pb-6">
      <SectionHeader title="Analyst Rating" />
      <p className="text-[13px] text-muted-foreground mb-4">
        Analyst ratings reflect the opinions of market experts based on company performance, industry trends, and future expectations.
      </p>

      {/* Gauge */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-48 h-24 overflow-hidden">
          {/* Gauge arc */}
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path d="M 10 95 A 85 85 0 0 1 190 95" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" strokeLinecap="round" />
            {/* Green (buy) arc */}
            <path d="M 10 95 A 85 85 0 0 1 40 30" fill="none" stroke="hsl(0, 72%, 51%)" strokeWidth="10" strokeLinecap="round" />
            {/* Neutral center */}
            <path d="M 40 30 A 85 85 0 0 1 160 30" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" strokeLinecap="round" />
            {/* Red (sell) arc */}
            <path d="M 160 30 A 85 85 0 0 1 190 95" fill="none" stroke="hsl(142, 71%, 45%)" strokeWidth="10" strokeLinecap="round" />
            {/* Needle */}
            <line x1="100" y1="95" x2="100" y2="25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-foreground" />
            <circle cx="100" cy="95" r="5" fill="currentColor" className="text-foreground" />
          </svg>
        </div>
        <div className="flex items-center gap-4 -mt-2">
          <span className="text-[12px] text-muted-foreground">{sellPct}%<br/>Sell</span>
          <div className="text-center">
            <p className="text-[20px] font-bold text-foreground">{holdPct}%</p>
            <p className="text-[13px] text-muted-foreground">Neutral</p>
          </div>
          <span className="text-[12px] text-muted-foreground">{buyPct}%<br/>Buy</span>
        </div>
        <p className="mt-2 text-[16px] font-bold text-foreground">Neutral</p>
      </div>

      {/* Bar breakdown */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-8 text-[13px] font-medium text-foreground">Buy</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gain" style={{ width: `${buyPct}%` }} />
          </div>
          <span className="w-6 text-right text-[13px] font-semibold tabular-nums text-foreground">{buy}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-8 text-[13px] font-medium text-foreground">Sell</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-loss" style={{ width: `${sellPct}%` }} />
          </div>
          <span className="w-6 text-right text-[13px] font-semibold tabular-nums text-foreground">{sell}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-8 text-[13px] font-medium text-foreground">Hold</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-muted-foreground/40" style={{ width: `${holdPct}%` }} />
          </div>
          <span className="w-6 text-right text-[13px] font-semibold tabular-nums text-foreground">{hold}</span>
        </div>
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
              className="w-full"
              style={{
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
              className="w-full"
              style={{
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

function TabContent({ tab, period, onPeriodChange }: { tab: string; period: ChartPeriod; onPeriodChange: (p: ChartPeriod) => void }) {
  if (tab === "Overview") return <OverviewTab period={period} onPeriodChange={onPeriodChange} />;
  if (tab === "Revenue") return <RevenueTab />;
  return (
    <div className="px-4 py-16 flex flex-col items-center justify-center min-h-[400px]">
      <p className="text-[16px] font-semibold text-foreground">{tab}</p>
      <p className="mt-1 text-[13px] text-muted-foreground">Coming soon</p>
    </div>
  );
}

function MarketCap() {
  return (
    <div className="shrink-0 rounded-xl bg-muted/50 px-3 py-2 text-right">
      <p className="text-[11px] font-medium text-muted-foreground">{stock.capCategory}</p>
      <p className="mt-1 text-[14px] font-bold tracking-tight tabular-nums text-foreground leading-none">
        {stock.marketCap}
      </p>
    </div>
  );
}

// ─── Stock Info ─────────────────────────────────────────────────────────────

const periodLabels: Record<ChartPeriod, string> = {
  "1D": "Today", "1W": "Past Week", "1M": "Past Month", "3M": "Past 3 Months",
  "6M": "Past 6 Months", "1Y": "Past Year", "5Y": "Past 5 Years", "All": "All Time",
};

function usePeriodChange(period: ChartPeriod) {
  return useMemo(() => {
    const ranges = priceRanges[stock.symbol]?.[period];
    if (!ranges) return { change: stock.dayChange, changePct: stock.dayChangePct };
    const [start, end] = ranges;
    const change = +(end - start).toFixed(2);
    const changePct = +((change / start) * 100).toFixed(2);
    return { change, changePct };
  }, [period]);
}

function StockInfo({ marketState, onLogoTap, priceRef, chartPeriod }: {
  marketState: MarketState;
  onLogoTap: () => void;
  priceRef: React.RefObject<HTMLDivElement>;
  chartPeriod: ChartPeriod;
}) {
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

      {/* Sticky bottom bar */}
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

      <HomeIndicator />
    </div>
  );
}
