"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, LineSeries, LineStyle, ColorType } from "lightweight-charts";
import type { IChartApi, ISeriesApi, SeriesType, UTCTimestamp } from "lightweight-charts";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import {
  ALL_TICKERS,
  TickerLogo,
  formatPrice,
  formatPercent,
  isGain,
  type TickerItem,
} from "@/components/ticker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ─── Mover Config ────────────────────────────────────────────────────────────

interface MoverConfig {
  ticker: TickerItem;
  color: string;
  data: Array<{ time: number; value: number }>;
}

// Colors for chart lines — 10 distinct colors to support adding extras
const LINE_COLORS = [
  "#06b6d4", // cyan
  "#f97316", // orange
  "#eab308", // yellow
  "#a855f7", // purple
  "#f43f5e", // rose
  "#fb923c", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ec4899", // pink
  "#14b8a6", // teal
];

const DEFAULT_SYMBOLS = ["AMZN", "META", "AAPL", "AMD", "INTC", "TSLA"];

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function hashSymbol(symbol: string): number {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) {
    h = (h * 31 + symbol.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ─── Mock Intraday Data ──────────────────────────────────────────────────────

function generateIntradayData(
  finalChangePercent: number,
  seed: number,
): Array<{ time: number; value: number }> {
  const OPEN_TIMESTAMP = 1772803800;
  const INTERVAL = 5 * 60;
  const TOTAL_BARS = 42;

  const rand = seededRandom(seed);
  const data: Array<{ time: number; value: number }> = [];
  let value = 0;

  for (let i = 0; i < TOTAL_BARS; i++) {
    data.push({ time: OPEN_TIMESTAMP + i * INTERVAL, value });

    const progress = (i + 1) / TOTAL_BARS;
    const target = finalChangePercent * progress;
    const drift = (target - value) * 0.25;
    const noise = (rand() - 0.5) * Math.abs(finalChangePercent) * 0.35;
    value += drift + noise;
  }

  data[TOTAL_BARS - 1].value = finalChangePercent;
  return data;
}

// ─── Build mover from symbol ─────────────────────────────────────────────────

function buildMover(symbol: string, colorIndex: number): MoverConfig | null {
  const ticker = ALL_TICKERS.find((t) => t.symbol === symbol);
  if (!ticker) return null;
  return {
    ticker,
    color: LINE_COLORS[colorIndex % LINE_COLORS.length],
    data: generateIntradayData(ticker.changePercent, hashSymbol(symbol)),
  };
}

// ─── Chart Component ─────────────────────────────────────────────────────────

function MoversChart({ movers, isDark }: { movers: MoverConfig[]; isDark: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const textColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)";
    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    const baselineColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)";
    const crosshairColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 220,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      rightPriceScale: {
        borderColor: "transparent",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "transparent",
        fixLeftEdge: true,
        fixRightEdge: true,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: crosshairColor, width: 1 },
        horzLine: { color: crosshairColor, width: 1 },
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    let firstSeries: ISeriesApi<SeriesType> | null = null;
    movers.forEach((mover, idx) => {
      const series = chart.addSeries(LineSeries, {
        color: mover.color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      series.setData(mover.data.map(d => ({ ...d, time: d.time as UTCTimestamp })));
      if (idx === 0) firstSeries = series;
    });

    // 0% dashed baseline
    if (firstSeries) {
      (firstSeries as ISeriesApi<SeriesType>).createPriceLine({
        price: 0,
        color: baselineColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: "",
      });
    }

    chart.timeScale().fitContent();

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [movers, isDark]);

  return <div ref={containerRef} className="w-full" style={{ height: 220 }} />;
}

// ─── Mover Row ───────────────────────────────────────────────────────────────

function MoverRow({
  mover,
  isLast,
  onDismiss,
}: {
  mover: MoverConfig;
  isLast: boolean;
  onDismiss: () => void;
}) {
  const { ticker, color } = mover;
  const gain = isGain(ticker);

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-5 py-3",
        !isLast && "border-b border-border/30"
      )}
    >
      {/* Colored left border */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
        style={{ backgroundColor: color }}
      />

      {/* Logo */}
      <TickerLogo ticker={ticker} size="sm" />

      {/* Name + Symbol */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-foreground truncate leading-tight">
          {ticker.name}
        </p>
        <p className="text-[13px] text-muted-foreground/60 leading-tight mt-0.5">
          {ticker.symbol}
          {ticker.exchange && (
            <span className="text-muted-foreground/40"> · {ticker.exchange}</span>
          )}
        </p>
      </div>

      {/* Price */}
      <p className="shrink-0 text-[15px] font-semibold tabular-nums text-foreground">
        ${formatPrice(ticker.price)}
      </p>

      {/* Change badge */}
      <div
        className={cn(
          "shrink-0 flex items-center gap-0.5 rounded-md px-2 py-1 text-[13px] font-bold tabular-nums",
          gain ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
        )}
      >
        <span className="text-[11px]">{gain ? "↗" : "↘"}</span>
        {Math.abs(ticker.changePercent).toFixed(2)}%
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Add Stock Sheet ─────────────────────────────────────────────────────────

function AddStockSheet({
  open,
  onOpenChange,
  activeSymbols,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSymbols: string[];
  onAdd: (symbol: string) => void;
}) {
  const available = ALL_TICKERS.filter(
    (t) => t.category === "watchlist" && !activeSymbols.includes(t.symbol)
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-2xl border-border/60 bg-background px-0 pb-8"
      >
        <SheetHeader className="px-5 pb-0 border-0">
          <SheetTitle className="text-[17px] font-semibold">
            Add to Movers
          </SheetTitle>
        </SheetHeader>

        <div className="max-h-[50vh] overflow-y-auto no-scrollbar px-1 pt-2">
          {available.length === 0 ? (
            <div className="py-8 text-center text-[14px] text-muted-foreground/40">
              All stocks already added
            </div>
          ) : (
            available.map((ticker) => (
              <button
                key={ticker.symbol}
                onClick={() => {
                  onAdd(ticker.symbol);
                  onOpenChange(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-5 py-3 transition-colors hover:bg-secondary/40 text-left"
              >
                <TickerLogo ticker={ticker} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground leading-tight truncate">
                    {ticker.name}
                  </p>
                  <p className="text-[13px] text-muted-foreground/60 leading-tight mt-0.5">
                    {ticker.symbol}
                    {ticker.exchange && (
                      <span className="text-muted-foreground/40"> · {ticker.exchange}</span>
                    )}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-semibold tabular-nums text-foreground leading-tight">
                    ${formatPrice(ticker.price)}
                  </p>
                  <p
                    className={cn(
                      "text-[13px] font-medium tabular-nums leading-tight mt-0.5",
                      isGain(ticker) ? "text-gain" : "text-loss"
                    )}
                  >
                    {formatPercent(ticker.changePercent)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function MoversContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeSymbols, setActiveSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  // Build movers from active symbols, sorted: gainers desc then losers asc (by loss magnitude)
  const movers = activeSymbols
    .map((sym, idx) => buildMover(sym, idx))
    .filter(Boolean) as MoverConfig[];

  const sortedMovers = [
    ...movers.filter((m) => m.ticker.changePercent >= 0).sort((a, b) => b.ticker.changePercent - a.ticker.changePercent),
    ...movers.filter((m) => m.ticker.changePercent < 0).sort((a, b) => b.ticker.changePercent - a.ticker.changePercent),
  ];

  const handleDismiss = useCallback((symbol: string) => {
    setActiveSymbols((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const handleAdd = useCallback((symbol: string) => {
    setActiveSymbols((prev) => [...prev, symbol]);
  }, []);

  return (
    <div className="pb-4">
      {/* Chart */}
      <div className="mt-2">
        <MoversChart movers={sortedMovers} isDark={isDark} />
      </div>

      {/* Divider */}
      <div className="h-px bg-border/40" />

      {/* Stock list */}
      <div>
        {sortedMovers.length === 0 ? (
          <div className="py-8 text-center text-[14px] text-muted-foreground/40">
            No movers — tap + to add stocks
          </div>
        ) : (
          sortedMovers.map((mover, idx) => (
            <MoverRow
              key={mover.ticker.symbol}
              mover={mover}
              isLast={idx === sortedMovers.length - 1}
              onDismiss={() => handleDismiss(mover.ticker.symbol)}
            />
          ))
        )}
      </div>

      {/* Add stock button */}
      <div className="h-px bg-border/40" />
      <Button
        variant="ghost"
        onClick={() => setAddSheetOpen(true)}
        className="w-full gap-2 py-3 text-[15px] font-medium text-muted-foreground hover:text-foreground"
      >
        <Plus size={16} strokeWidth={2.5} />
        Add Stock
      </Button>

      <AddStockSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        activeSymbols={activeSymbols}
        onAdd={handleAdd}
      />
    </div>
  );
}
