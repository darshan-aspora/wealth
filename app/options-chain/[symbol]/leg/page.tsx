"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Info, TrendingDown, TrendingUp } from "lucide-react";

import { HomeIndicator, StatusBar } from "@/components/iphone-frame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildChain, formatExpiryShort, getExpiryGroups, hashStr, STOCK_PRICES } from "@/lib/options-chain";

const DETAIL_TABS = ["Overview", "Candle Chart"] as const;
type DetailTab = (typeof DETAIL_TABS)[number];
type OptionSide = "call" | "put";
type TradeMode = "buy" | "sell";

function StatPill({ label, value, tone = "neutral", noBorder = false }: { label: string; value: string; tone?: "positive" | "negative" | "neutral"; noBorder?: boolean }) {
  return (
    <div className={cn("bg-muted/50 px-3 py-2", !noBorder && "rounded-2xl border border-border/50 bg-background")}>
      <p className="text-[0.6875em] text-muted-foreground">{label}</p>
      <p className={cn(
        "mt-1 text-[0.875em] font-semibold tracking-[-0.28px]",
        tone === "positive" && "text-gain",
        tone === "negative" && "text-loss",
        tone === "neutral" && "text-foreground",
      )}>
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
  bgClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "positive" | "negative";
  bgClass: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-background px-3 py-3">
      <div className={cn("flex size-10 items-center justify-center rounded-xl", bgClass)}>{icon}</div>
      <div>
        <p className="text-[0.75em] text-muted-foreground">{label}</p>
        <p className={cn("text-base font-semibold tracking-[-0.32px]", tone === "positive" ? "text-gain" : "text-loss")}>
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailTabs({ activeTab, onChange }: { activeTab: DetailTab; onChange: (tab: DetailTab) => void }) {
  return (
    <div className="border-b border-border/60 bg-background px-4">
      <div className="no-scrollbar flex overflow-x-auto">
        {DETAIL_TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-3 text-[0.875em] transition-colors",
                active ? "border-foreground font-bold text-foreground" : "border-transparent text-muted-foreground",
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatCurrency(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatShortNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${Math.round(value)}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildPayoffBars(count: number, side: OptionSide, mode: TradeMode) {
  return Array.from({ length: count }, (_, index) => {
    const pivot = Math.floor(count * 0.58);
    const distance = Math.abs(index - pivot);
    const base = Math.max(10, 94 - distance * 7);
    const buyingCall = mode === "buy" && side === "call";
    const positive = buyingCall ? index >= pivot : index <= pivot;
    return {
      key: `${mode}-${side}-${index}`,
      height: Math.max(12, base),
      positive,
    };
  });
}

function formatStrikeLabel(strike: number) {
  return Number.isInteger(strike) ? `${strike}` : strike.toFixed(1);
}





// ─── Candle chart ─────────────────────────────────────────────────────────────

const PERIODS = ["1D", "1W", "1M", "3M"] as const;
type Period = (typeof PERIODS)[number];

function buildCandles(basePrice: number, seed: number, count: number) {
  let price = basePrice;
  const rand = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };
  return Array.from({ length: count }, (_, i) => {
    const move = (rand(i * 3) - 0.48) * price * 0.06;
    const open = price;
    const close = Math.max(0.05, price + move);
    const high = Math.max(open, close) + rand(i * 3 + 1) * price * 0.025;
    const low = Math.min(open, close) - rand(i * 3 + 2) * price * 0.025;
    price = close;
    return { open, close, high, low };
  });
}

function buildXLabels(period: Period, count: number): string[] {
  const now = new Date("2026-04-24");
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now);
    if (period === "1D") { d.setHours(9 + Math.round((i / (count - 1)) * 7)); return `${d.getHours()}:00`; }
    if (period === "1W") { d.setDate(d.getDate() - (count - 1 - i)); return d.toLocaleDateString("en-US", { weekday: "short" }); }
    if (period === "1M") { d.setDate(d.getDate() - (count - 1 - i)); return `${d.getDate()}/${d.getMonth() + 1}`; }
    d.setDate(d.getDate() - (count - 1 - i) * 1.5); return `${d.getDate()}/${d.getMonth() + 1}`;
  });
}

function CandleChart({ ltp, seed }: { ltp: number; seed: number }) {
  const [period, setPeriod] = useState<Period>("1M");
  const counts: Record<Period, number> = useMemo(() => ({ "1D": 24, "1W": 7, "1M": 30, "3M": 60 }), []);
  const candles = useMemo(() => buildCandles(ltp * 0.82, seed, counts[period]), [ltp, seed, counts, period]);

  const chartRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [crosshairFrac, setCrosshairFrac] = useState<number | null>(null);

  const W = 300;
  const PAD_TOP = 12;
  const PAD_BOT = 28;
  const PAD_RIGHT = 42;
  const chartW = W - PAD_RIGHT;

  const allHighs = candles.map((c) => c.high);
  const allLows = candles.map((c) => c.low);
  const maxP = Math.max(...allHighs) * 1.015;
  const minP = Math.min(...allLows) * 0.985;
  const pRange = maxP - minP;

  // toY is parameterised by the rendered SVG height — computed inside render using viewBox
  const makeToY = (svgH: number) => {
    const cH = svgH - PAD_TOP - PAD_BOT;
    return (p: number) => PAD_TOP + ((maxP - p) / pRange) * cH;
  };
  const candleW = chartW / candles.length;

  const yLabels = [maxP, maxP * 0.67 + minP * 0.33, maxP * 0.33 + minP * 0.67, minP];
  const xLabels = useMemo(() => buildXLabels(period, candles.length), [period, candles.length]);
  const xLabelStep = Math.ceil(candles.length / 5);

  const firstClose = candles[0]?.close ?? ltp;
  const lastClose = candles[candles.length - 1]?.close ?? ltp;
  const overallChange = ((lastClose - firstClose) / firstClose) * 100;

  const hoveredIdx = crosshairFrac !== null ? Math.max(0, Math.min(candles.length - 1, Math.floor(crosshairFrac * candles.length))) : null;
  const hoveredCandle = hoveredIdx !== null ? candles[hoveredIdx] : null;
  const crosshairX = hoveredIdx !== null ? (hoveredIdx + 0.5) * candleW : null;

  const handlePointer = (clientX: number) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const usableW = rect.width * (chartW / W);
    const frac = Math.max(0, Math.min(0.999, (clientX - rect.left) / usableW));
    setCrosshairFrac(frac);
  };

  const allHighPrice = Math.max(...candles.map((c) => c.high));
  const allLowPrice = Math.min(...candles.map((c) => c.low));

  const keyStats = [
    { label: "Period High", value: formatCurrency(allHighPrice), tone: "positive" as const },
    { label: "Period Low", value: formatCurrency(allLowPrice), tone: "negative" as const },
    { label: "Open", value: formatCurrency(candles[0]?.open ?? 0), tone: "neutral" as const },
    { label: "OI Change", value: "+4.2%", tone: "positive" as const },
    { label: "IV Rank", value: "62%", tone: "neutral" as const },
    { label: "Days to Exp", value: "22", tone: "neutral" as const },
  ];

  // Fixed SVG viewBox height; chart fills flex-1 div which sizes via CSS
  const SVG_VH = 300; // viewBox height — scales with preserveAspectRatio="none"
  const toY = makeToY(SVG_VH);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Period pills */}
      <div className="flex shrink-0 items-center gap-2 px-4 pt-4 pb-3">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => { setPeriod(p); setCrosshairFrac(null); }}
            className={cn(
              "rounded-full px-5 py-1.5 text-[0.8125em] font-semibold transition-colors",
              period === p ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* OHLC info row */}
      <div className="shrink-0 px-4 pb-3">
        {hoveredCandle ? (
          <div className="flex items-center gap-5">
            {[
              { label: "O", value: formatCurrency(hoveredCandle.open), cls: "text-foreground" },
              { label: "H", value: formatCurrency(hoveredCandle.high), cls: "text-gain" },
              { label: "L", value: formatCurrency(hoveredCandle.low), cls: "text-loss" },
              { label: "C", value: formatCurrency(hoveredCandle.close), cls: hoveredCandle.close >= hoveredCandle.open ? "text-gain" : "text-loss" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[0.625em] text-muted-foreground">{s.label}</p>
                <p className={cn("text-[0.8125em] font-semibold", s.cls)}>{s.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="text-[1.375em] font-bold tracking-[-0.5px] text-foreground">{formatCurrency(lastClose)}</p>
            <p className={cn("text-[0.8125em] font-medium", overallChange >= 0 ? "text-gain" : "text-loss")}>
              {overallChange >= 0 ? "+" : ""}{overallChange.toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* Chart — flex-1 fills remaining height */}
      <div
        ref={chartRef}
        className="relative min-h-0 flex-1 touch-none select-none"
        onPointerDown={(e) => {
          isDragging.current = true;
          handlePointer(e.clientX);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => { if (isDragging.current) handlePointer(e.clientX); }}
        onPointerUp={() => { isDragging.current = false; }}
        onPointerCancel={() => { isDragging.current = false; setCrosshairFrac(null); }}
      >
        {/* SVG — geometry only, no text (avoids preserveAspectRatio="none" text distortion) */}
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${SVG_VH}`} preserveAspectRatio="none">
          {/* Y grid lines */}
          {yLabels.map((p, i) => (
            <line key={i} x1="0" y1={toY(p)} x2={chartW} y2={toY(p)} stroke="#e5e7eb" strokeWidth="0.7" strokeDasharray="3 3" />
          ))}

          {/* X tick marks */}
          {candles.map((_, i) => {
            if (i % xLabelStep !== 0) return null;
            const cx = (i + 0.5) * candleW;
            return <line key={i} x1={cx} y1={SVG_VH - PAD_BOT} x2={cx} y2={SVG_VH - PAD_BOT + 4} stroke="#d1d5db" strokeWidth="0.8" />;
          })}

          <line x1="0" y1={SVG_VH - PAD_BOT} x2={chartW} y2={SVG_VH - PAD_BOT} stroke="#e5e7eb" strokeWidth="0.8" />

          {candles.map((c, i) => {
            const bullish = c.close >= c.open;
            const color = bullish ? "#22c55e" : "#ef4444";
            const cx = (i + 0.5) * candleW;
            const bodyTop = toY(Math.max(c.open, c.close));
            const bodyBot = toY(Math.min(c.open, c.close));
            const bodyH = Math.max(1, bodyBot - bodyTop);
            const bW = Math.max(1.5, candleW * 0.6);
            return (
              <g key={i}>
                <line x1={cx} y1={toY(c.high)} x2={cx} y2={toY(c.low)} stroke={color} strokeWidth="1" />
                <rect x={cx - bW / 2} y={bodyTop} width={bW} height={bodyH} fill={color} rx="1" />
              </g>
            );
          })}

          {crosshairX !== null && (
            <>
              <line x1={crosshairX} y1={PAD_TOP} x2={crosshairX} y2={SVG_VH - PAD_BOT} stroke="#374151" strokeWidth="1" strokeDasharray="4 3" opacity="0.55" />
              {hoveredCandle && (
                <line x1="0" y1={toY(hoveredCandle.close)} x2={chartW} y2={toY(hoveredCandle.close)} stroke="#374151" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35" />
              )}
            </>
          )}
        </svg>

        {/* Y-axis labels — HTML overlay so text isn't distorted */}
        <div className="pointer-events-none absolute inset-0" style={{ right: 0 }}>
          {/* Candlestick area width as % */}
          {yLabels.map((p, i) => {
            const pct = ((toY(p) / SVG_VH) * 100).toFixed(2);
            return (
              <div key={i} className="absolute right-0 flex items-center" style={{ top: `${pct}%`, width: `${(PAD_RIGHT / W) * 100}%` }}>
                <span className="w-full text-center text-[0.5625em] text-muted-foreground">{formatCurrency(p)}</span>
              </div>
            );
          })}

          {/* Crosshair price badge on y-axis */}
          {hoveredCandle && crosshairX !== null && (() => {
            const pct = ((toY(hoveredCandle.close) / SVG_VH) * 100).toFixed(2);
            return (
              <div className="absolute right-0 flex items-center" style={{ top: `${pct}%`, width: `${(PAD_RIGHT / W) * 100}%`, transform: "translateY(-50%)" }}>
                <span className="w-full rounded bg-foreground text-center text-[0.5625em] font-semibold text-background py-0.5">{formatCurrency(hoveredCandle.close)}</span>
              </div>
            );
          })()}
        </div>

        {/* X-axis labels — HTML overlay pinned to bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0" style={{ right: `${(PAD_RIGHT / W) * 100}%`, height: `${(PAD_BOT / SVG_VH) * 100}%` }}>
          {candles.map((_, i) => {
            if (i % xLabelStep !== 0) return null;
            return (
              <div key={i} className="absolute -translate-x-1/2" style={{ left: `${((i + 0.5) / candles.length * 100).toFixed(2)}%`, bottom: 2 }}>
                <span className="text-[0.5625em] text-muted-foreground whitespace-nowrap">{xLabels[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key stats grid */}
      <div className="shrink-0 grid grid-cols-3 gap-2 px-4 py-3">
        {keyStats.map((s) => (
          <div key={s.label} className="rounded-xl bg-muted/50 px-3 py-2.5">
            <p className="text-[0.625em] text-muted-foreground">{s.label}</p>
            <p className={cn(
              "mt-0.5 text-[0.8125em] font-semibold tracking-[-0.2px]",
              s.tone === "positive" ? "text-gain" : s.tone === "negative" ? "text-loss" : "text-foreground",
            )}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Full-page Payoff tab ──────────────────────────────────────────────────────

function PayoffFull({
  side,
  tradeMode,
  onTradeChange,
  stockPrice,
  breakEven,
  entryCost,
  daysToExpiry,
}: {
  side: OptionSide;
  tradeMode: TradeMode;
  onTradeChange: (m: TradeMode) => void;
  stockPrice: number;
  breakEven: number;
  entryCost: number;
  daysToExpiry: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const halfRange = stockPrice * 0.22;
  const minPrice = breakEven - halfRange;
  const maxPrice = breakEven + halfRange;
  const priceRange = maxPrice - minPrice;

  const defaultFrac = Math.max(0.55, Math.min(0.9, (stockPrice * (side === "call" ? 1.12 : 0.88) - minPrice) / priceRange));
  const [sliderFrac, setSliderFrac] = useState(defaultFrac);

  const pnlAt = (p: number): number => {
    if (tradeMode === "buy") {
      if (side === "call") return Math.max(-entryCost, (p - breakEven) * 100);
      return Math.max(-entryCost, (breakEven - p) * 100);
    } else {
      if (side === "call") return Math.min(entryCost, -(p - breakEven) * 100);
      return Math.min(entryCost, -(breakEven - p) * 100);
    }
  };

  const sliderPrice = minPrice + sliderFrac * priceRange;
  const sliderPnL = pnlAt(sliderPrice);
  const pricePctChange = ((sliderPrice - stockPrice) / stockPrice) * 100;
  const isProfit = sliderPnL >= 0;

  const handlePointerMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSliderFrac(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  };

  const SVG_W2 = 300;
  const SVG_H2 = 220;
  const ZERO_Y2 = SVG_H2 / 2;
  const maxPnlMag = Math.max(entryCost, halfRange * 100) * 1.05;

  const toX2 = (p: number) => ((p - minPrice) / priceRange) * SVG_W2;
  const toY2 = (pnl: number) => ZERO_Y2 - (pnl / maxPnlMag) * (ZERO_Y2 - 10);

  const N = 100;
  const points = Array.from({ length: N }, (_, i) => {
    const p = minPrice + (i / (N - 1)) * priceRange;
    return { price: p, pnl: pnlAt(p) };
  });
  const polyPts = points.map((pt) => `${toX2(pt.price).toFixed(1)},${toY2(pt.pnl).toFixed(1)}`).join(" ");

  const BAR_COUNT = 26;
  const barW2 = SVG_W2 / BAR_COUNT;
  const barHeights2 = Array.from({ length: BAR_COUNT }, (_, i) => {
    const center = BAR_COUNT / 2;
    const dist = Math.abs(i + 0.5 - center);
    return Math.max(8, 52 - dist * 3.5 + Math.sin(i * 1.7) * 7);
  });

  const sliderX2 = sliderFrac * SVG_W2;
  const sliderY2 = toY2(sliderPnL);

  // Scenario price steps along the bottom
  const scenarioPrices = Array.from({ length: 5 }, (_, i) => minPrice + (i / 4) * priceRange);

  const svgContainerH = SVG_H2 + 56;

  return (
    <div className="flex flex-col gap-0 bg-background">
      {/* Header row: P&L hero + Buy/Sell toggle */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.6875em] font-medium uppercase tracking-[0.05em] text-muted-foreground mb-1">Expected P&amp;L</p>
          <p className={cn("text-[2em] font-extrabold leading-none tracking-[-1.5px]", isProfit ? "text-gain" : "text-loss")}>
            {isProfit ? "+" : ""}{formatCurrency(sliderPnL, 0)}
          </p>
          <p className="mt-1.5 text-[0.75em] text-muted-foreground">
            If stock reaches{" "}
            <span className="font-semibold text-foreground">{formatCurrency(sliderPrice, 0)}</span>
            <span className={cn("ml-1 font-medium", pricePctChange >= 0 ? "text-gain" : "text-loss")}>
              ({pricePctChange >= 0 ? "+" : ""}{pricePctChange.toFixed(1)}%)
            </span>
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0 mt-0.5">
          {(["buy", "sell"] as TradeMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onTradeChange(m)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[0.75em] font-semibold transition-colors",
                tradeMode === m
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground bg-background",
              )}
            >
              {m === "buy" ? "Buy" : "Sell"}
            </button>
          ))}
        </div>
      </div>

      {/* Full payoff chart — edge to edge */}
      <div
        ref={containerRef}
        className="relative touch-none select-none bg-[#fafafa]"
        style={{ height: svgContainerH }}
        onPointerDown={(e) => {
          isDragging.current = true;
          handlePointerMove(e.clientX);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => { if (isDragging.current) handlePointerMove(e.clientX); }}
        onPointerUp={() => { isDragging.current = false; }}
        onPointerCancel={() => { isDragging.current = false; }}
      >
        <svg width="100%" height={SVG_H2} viewBox={`0 0 ${SVG_W2} ${SVG_H2}`} preserveAspectRatio="none" overflow="visible">
          <defs>
            <clipPath id="full-clip-loss">
              <rect x="0" y={ZERO_Y2} width={SVG_W2} height={SVG_H2 - ZERO_Y2} />
            </clipPath>
            <clipPath id="full-clip-profit">
              <rect x="0" y="0" width={SVG_W2} height={ZERO_Y2} />
            </clipPath>
          </defs>

          {barHeights2.map((h, i) => (
            <rect key={i} x={i * barW2 + 1} y={SVG_H2 - h} width={Math.max(1.5, barW2 - 2)} height={h} fill="#e5e7eb" rx="2" />
          ))}

          <line x1="0" y1={ZERO_Y2} x2={SVG_W2} y2={ZERO_Y2} stroke="#d1d5db" strokeWidth="1" strokeDasharray="6 4" />
          <text x={SVG_W2 / 2} y={ZERO_Y2 - 5} textAnchor="middle" fontSize="7" fill="#9ca3af">BREAK-EVEN {formatCurrency(breakEven, 0)}</text>

          <polyline points={polyPts} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#full-clip-loss)" />
          <polyline points={polyPts} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#full-clip-profit)" />

          <line x1={sliderX2} y1="0" x2={sliderX2} y2={SVG_H2} stroke={isProfit ? "#22c55e" : "#ef4444"} strokeWidth="1.5" opacity="0.8" />
        </svg>

        {/* Dot — use px for top so it's relative to SVG height, not container height */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{
            left: `${sliderFrac * 100}%`,
            top: sliderY2,
            width: 14,
            height: 14,
            backgroundColor: isProfit ? "#22c55e" : "#ef4444",
          }}
        />

        {/* Draggable grip — top edge sits exactly at the SVG bottom, touching the line */}
        <div
          className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${sliderFrac * 100}%`, top: SVG_H2 }}
        >
          <div className={cn("flex items-center gap-[3px] rounded-full px-3 py-2 shadow-md", isProfit ? "bg-gain" : "bg-loss")}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3 w-[2.5px] rounded-full bg-white/70" />
            ))}
          </div>
        </div>

        <div className="absolute bottom-1 left-0 right-0 flex items-center justify-between px-3">
          {scenarioPrices.map((p, i) => (
            <span key={i} className="text-[0.5625em] text-muted-foreground">{formatCurrency(p, 0)}</span>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2 bg-background px-4 pb-4 pt-4">
        <StatPill label="Break-even" value={formatCurrency(breakEven, 0)} />
        <StatPill label="Entry Cost" value={formatCurrency(entryCost, 0)} />
        <StatPill label="Time left" value={`${daysToExpiry} Days`} />
      </div>
    </div>
  );
}

const INDEX_SYMBOLS = new Set(["SPX", "NDX", "RUT", "DJIA", "VIX", "RUI", "MID", "R1000", "R2000", "DJI"]);
const ETF_SYMBOLS = new Set([
  "SPY", "QQQ", "IWM", "DIA", "GLD", "SLV", "USO", "TLT", "HYG", "EEM",
  "VXX", "UVXY", "SQQQ", "TQQQ", "SPXL", "SPXS", "ACWI", "EFA", "VTI",
]);

function underlyingRoute(sym: string) {
  if (INDEX_SYMBOLS.has(sym)) return `/indices/${encodeURIComponent(sym)}`;
  if (ETF_SYMBOLS.has(sym))   return `/etf/${encodeURIComponent(sym)}`;
  return `/stocks/${encodeURIComponent(sym)}`;
}

export default function OptionLegDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbol = decodeURIComponent(params.symbol as string);

  const initialStrike = Number(searchParams.get("strike") ?? "0");
  const initialSide = (searchParams.get("side") === "put" ? "put" : "call") as OptionSide;
  const initialExpiry = searchParams.get("expiry") ?? getExpiryGroups(symbol)[0].items[0].date;
  const initialLtp = Number(searchParams.get("ltp") ?? "0");

  const [activeTab, setActiveTab] = useState<DetailTab>("Overview");
  const [greeksSheetMounted, setGreeksSheetMounted] = useState(false);
  const [greeksSheetVisible, setGreeksSheetVisible] = useState(false);
  const openGreeksSheet = () => { setGreeksSheetMounted(true); requestAnimationFrame(() => setGreeksSheetVisible(true)); };
  const closeGreeksSheet = () => { setGreeksSheetVisible(false); setTimeout(() => setGreeksSheetMounted(false), 300); };
  const [side] = useState<OptionSide>(initialSide);
  const [tradeMode, setTradeMode] = useState<TradeMode>("buy");
  const [expiry] = useState(initialExpiry);
  const [selectedStrike] = useState(initialStrike);


  const stock = STOCK_PRICES[symbol] ?? { price: 200, pct: 0 };
  const chain = useMemo(() => buildChain(stock.price, hashStr(symbol + expiry)), [expiry, stock.price, symbol]);
  const candleSeed = hashStr(symbol + expiry + String(initialStrike) + initialSide);

  const selectedRow = useMemo(() => {
    const closest = chain.reduce((best, row) => {
      return Math.abs(row.strike - selectedStrike) < Math.abs(best.strike - selectedStrike) ? row : best;
    }, chain[0]);
    return chain.find((row) => row.strike === closest.strike) ?? chain[0];
  }, [chain, selectedStrike]);

  const leg = side === "call" ? selectedRow.call : selectedRow.put;
  const strike = selectedRow.strike;
  const ltp = initialLtp > 0 ? initialLtp : leg.ltp;
  const changePct = leg.ltpChgPct;
  const changeAbs = +(ltp * Math.abs(changePct) / 100).toFixed(2);
  const daysToExpiry = Math.max(1, Math.round((new Date(expiry).getTime() - new Date("2026-04-24").getTime()) / (1000 * 60 * 60 * 24)));
  const breakEven = side === "call" ? strike + ltp : strike - ltp;
  const entryCost = ltp * 100;
  const maxLoss = tradeMode === "buy" ? -entryCost : -(entryCost * 2.1);
  const maxProfit = tradeMode === "buy"
    ? (side === "call" ? "Unlimited" : formatCurrency(Math.max(0, (strike - ltp) * 100), 0))
    : formatCurrency(entryCost, 0);
  const expiryShort = formatExpiryShort(expiry);

  const greekRows = [
    { label: "Delta", value: leg.delta.toFixed(2), note: side === "call" ? "Bullish sensitivity" : "Bearish sensitivity" },
    { label: "Theta", value: leg.theta.toFixed(2), note: "$/day decay" },
    { label: "Gamma", value: leg.gamma.toFixed(4), note: "Delta acceleration" },
    { label: "Vega", value: leg.vega.toFixed(2), note: "Volatility impact" },
  ];


  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background text-base">
      <StatusBar />

      <div className="shrink-0 bg-background px-4 pb-3 pt-3">
        {/* Row 1: back | leg name (centered) */}
        <div className="relative flex items-center">
          <button onClick={() => router.back()} className="rounded-full p-2 active:bg-muted/60">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <p className="absolute left-0 right-0 text-center text-[0.9375em] font-semibold tracking-[-0.3px] text-foreground pointer-events-none">
            {symbol}&nbsp;·&nbsp;{expiryShort}&nbsp;·&nbsp;{formatStrikeLabel(strike)}&nbsp;{side === "call" ? "CE" : "PE"}
          </p>
        </div>

        {/* Row 2: price (left) + toggles (right) */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div>
            <p className={cn("text-[1.375em] font-bold tracking-[-0.5px]", changePct >= 0 ? "text-gain" : "text-loss")}>
              {formatCurrency(ltp)}
            </p>
            <p className={cn("text-[0.8125em] font-medium", changePct >= 0 ? "text-gain" : "text-loss")}>
              {changePct >= 0 ? "+" : ""}{formatCurrency(changeAbs)}&nbsp;({changePct >= 0 ? "+" : ""}{changePct.toFixed(1)}%)
            </p>
          </div>

        </div>
      </div>

      <DetailTabs activeTab={activeTab} onChange={setActiveTab} />


      <main className={cn("no-scrollbar flex-1", activeTab === "Candle Chart" ? "overflow-y-hidden" : "overflow-y-auto")}>
        <div className={cn(activeTab === "Candle Chart" ? "h-full" : "space-y-2")}>
          {activeTab === "Candle Chart" && (
            <CandleChart ltp={ltp} seed={candleSeed} />
          )}

          {activeTab === "Overview" && (
            <>
              {/* Max Profit / Max Loss */}
              <div className="grid grid-cols-2 gap-3 bg-background px-4 py-3">
                <MetricCard icon={<TrendingUp size={20} className="text-gain" />} label="Max Profit" value={maxProfit} tone="positive" bgClass="bg-muted" />
                <MetricCard icon={<TrendingDown size={20} className="text-loss" />} label="Max Loss" value={formatCurrency(maxLoss, 0)} tone="negative" bgClass="bg-muted" />
              </div>

              {/* Payoff chart (merged widget) */}
              <PayoffFull
                side={side}
                tradeMode={tradeMode}
                onTradeChange={setTradeMode}
                stockPrice={stock.price}
                breakEven={breakEven}
                entryCost={entryCost}
                daysToExpiry={daysToExpiry}
              />

              {/* Redirect links — combined single row */}
              {(() => {
                const STOCK_NAMES: Record<string, string> = {
                  AAPL: "Apple Inc.", NVDA: "NVIDIA Corp.", INTC: "Intel Corp.", SNAP: "Snap Inc.",
                  MSFT: "Microsoft Corp.", AMZN: "Amazon.com Inc.", META: "Meta Platforms Inc.",
                  GOOGL: "Alphabet Inc.", TSLA: "Tesla Inc.", PLTR: "Palantir Technologies Inc.",
                  COIN: "Coinbase Global Inc.", SHOP: "Shopify Inc.", SQ: "Block Inc.",
                  ABNB: "Airbnb Inc.", CRWD: "CrowdStrike Holdings Inc.",
                };
                const fullName = STOCK_NAMES[symbol] ?? symbol;
                return (
                  <div className="bg-background px-4 py-2">
                    <div className="flex items-center justify-between py-3 border-b border-border/40">
                      <div>
                        <p className="text-[0.75em] text-muted-foreground">Underlying stock</p>
                        <p className="text-[0.9375em] font-semibold text-foreground mt-0.5">{fullName} <span className="text-muted-foreground font-normal">({symbol})</span></p>
                      </div>
                      <button onClick={() => router.push(underlyingRoute(symbol))} className="text-[0.75em] font-semibold text-foreground active:opacity-60 shrink-0 ml-3">
                        View underlying ›
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-[0.75em] text-muted-foreground">Options chain</p>
                        <p className="text-[0.9375em] font-semibold text-foreground mt-0.5">{symbol} · {expiryShort}</p>
                      </div>
                      <button onClick={() => router.push(`/options-chain/${symbol}`)} className="text-[0.75em] font-semibold text-foreground active:opacity-60 shrink-0 ml-3">
                        View chain ›
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Positions widget — OpenCard style */}
              <div className="bg-background px-4 py-4">
                <p className="text-[0.875em] font-semibold text-foreground mb-3">Your Position</p>
                <div className="rounded-2xl border border-border/40 overflow-hidden divide-y divide-border/30">
                  {[
                    { qty: 2, avgPrice: ltp * 0.91, side: "buy" as const },
                    { qty: 1, avgPrice: ltp * 1.06, side: "sell" as const },
                  ].map((pos, i) => {
                    const pnl = pos.side === "buy"
                      ? (ltp - pos.avgPrice) * pos.qty * 100
                      : (pos.avgPrice - ltp) * pos.qty * 100;
                    const isGain = pnl >= 0;
                    return (
                      <div key={i} className="px-4 py-3.5">
                        {/* Row 1: side badge + instrument label */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className={cn(
                            "text-[0.6875em] font-bold rounded-md px-1.5 py-0.5 uppercase",
                            pos.side === "buy" ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground"
                          )}>
                            {pos.side}
                          </span>
                          <p className="text-[0.9375em] font-bold text-foreground tracking-tight">
                            {symbol} · {expiryShort} · {formatStrikeLabel(strike)} {side === "call" ? "CE" : "PE"}
                          </p>
                        </div>
                        {/* Row 2: qty / avg / ltp + P&L */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 text-[0.875em]">
                            <div className="flex flex-col">
                              <span className="text-[0.75em] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Qty</span>
                              <span className="font-semibold text-foreground">{pos.qty}</span>
                            </div>
                            <div className="w-px h-5 bg-border/50" />
                            <div className="flex flex-col">
                              <span className="text-[0.75em] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Avg</span>
                              <span className="font-semibold text-foreground">{formatCurrency(pos.avgPrice)}</span>
                            </div>
                            <div className="w-px h-5 bg-border/50" />
                            <div className="flex flex-col">
                              <span className="text-[0.75em] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">LTP</span>
                              <span className="font-semibold text-foreground">{formatCurrency(ltp)}</span>
                            </div>
                          </div>
                          <p className={cn("text-[1em] font-bold tabular-nums shrink-0", isGain ? "text-gain" : "text-loss")}>
                            {isGain ? "+" : ""}{formatCurrency(pnl, 0)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance — 52W high/low + LTP */}
              <div className="bg-background px-4 py-4">
                <p className="text-[0.875em] font-semibold text-foreground mb-3">Performance</p>
                <div className="rounded-2xl border border-border/40 px-4 py-4">
                  {(() => {
                    const low52 = ltp * 0.52;
                    const high52 = ltp * 1.68;
                    const ltpFrac = Math.max(0.02, Math.min(0.98, (ltp - low52) / (high52 - low52)));
                    return (
                      <>
                        <div className="relative h-1.5 rounded-full bg-muted mb-3">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-loss via-muted-foreground/30 to-gain" />
                          <div
                            className="absolute -top-1 w-3.5 h-3.5 rounded-full bg-foreground border-2 border-background shadow"
                            style={{ left: `calc(${ltpFrac * 100}% - 7px)` }}
                          />
                        </div>
                        <div className="flex justify-between text-[0.6875em] text-muted-foreground mb-3">
                          <span>52W Low {formatCurrency(low52, 0)}</span>
                          <span>LTP {formatCurrency(ltp)}</span>
                          <span>52W High {formatCurrency(high52, 0)}</span>
                        </div>
                        <div className="grid grid-cols-3 divide-x divide-border/40 border-t border-border/40 pt-3">
                          {[
                            { label: "Day High", value: formatCurrency(ltp * 1.04, 0) },
                            { label: "Day Low", value: formatCurrency(ltp * 0.96, 0) },
                            { label: "Open", value: formatCurrency(ltp * 0.99, 0) },
                          ].map((s) => (
                            <div key={s.label} className="text-center px-2">
                              <p className="text-[0.6875em] text-muted-foreground">{s.label}</p>
                              <p className="text-[0.8125em] font-semibold text-foreground mt-0.5">{s.value}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Greeks — compact horizontal strip */}
              <div className="bg-background px-4 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[0.875em] font-semibold text-foreground">Greeks</p>
                  <button onClick={openGreeksSheet}><Info size={13} className="text-muted-foreground" /></button>
                </div>
                <div className="rounded-2xl border border-border/40 divide-y divide-border/30">
                  {greekRows.map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <p className="text-[0.8125em] text-muted-foreground w-12">{item.label}</p>
                        <p className="text-[0.6875em] text-muted-foreground/60">{item.note}</p>
                      </div>
                      <p className="text-[0.9375em] font-semibold text-foreground tabular-nums">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Depth — hidden, re-enable when ready */}
            </>
          )}
        </div>
      </main>

      <div className="shrink-0 border-t border-border/50 bg-background px-4 pb-7 pt-3">
        <div className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5 mb-3">
          <Info size={13} className="text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[0.75em] text-muted-foreground leading-snug">
            {side === "call"
              ? "Covered calls require you to already own shares of this stock. The call is sold against your existing position."
              : "Protective puts require you to already own shares of this stock. The put is bought to hedge your long position."}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="h-11 rounded-xl border-black/10 text-[0.875em] font-semibold text-foreground"
          >
            Set Alert
          </Button>
          <Button
            className="h-11 rounded-xl bg-foreground text-[0.875em] font-semibold text-background hover:bg-foreground/90 active:opacity-80"
          >
            Sell
          </Button>
          <Button
            className="h-11 rounded-xl bg-foreground text-[0.875em] font-semibold text-background hover:bg-foreground/90 active:opacity-80"
          >
            Buy
          </Button>
        </div>
      </div>

      {/* Greeks info bottom sheet */}
      {greeksSheetMounted && (
        <div
          className={cn("absolute inset-0 z-50 flex flex-col justify-end transition-all duration-300", greeksSheetVisible ? "opacity-100" : "opacity-0")}
          onClick={closeGreeksSheet}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className={cn("relative rounded-t-3xl bg-background px-5 pb-10 pt-5 transition-transform duration-300", greeksSheetVisible ? "translate-y-0" : "translate-y-full")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted-foreground/30" />
            <p className="text-[1.125em] font-bold tracking-[-0.4px] text-foreground">Understanding Greeks</p>
            <p className="mt-1 text-[0.8125em] text-muted-foreground">Options Greeks measure sensitivity of the option price to various factors.</p>
            <div className="mt-5 space-y-4">
              {[
                { name: "Delta (Δ)", desc: "How much the option price moves per $1 move in the underlying stock. Call delta ranges 0–1; put delta ranges −1–0." },
                { name: "Theta (Θ)", desc: "Time decay — the amount the option loses in value each day as expiration approaches. Always negative for long options." },
                { name: "Gamma (Γ)", desc: "Rate of change of Delta per $1 move in the stock. High gamma means delta changes quickly — more sensitivity near expiry." },
                { name: "Vega (ν)", desc: "How much the option price changes for every 1% change in implied volatility. Higher vega = more sensitive to volatility swings." },
              ].map((g) => (
                <div key={g.name} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <p className="text-[0.9375em] font-semibold text-foreground">{g.name}</p>
                  <p className="mt-1 text-[0.8125em] leading-relaxed text-muted-foreground">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <HomeIndicator />
    </div>
  );
}
