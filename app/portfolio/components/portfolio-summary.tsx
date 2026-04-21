"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createChart, ColorType, AreaSeries, LineSeries } from "lightweight-charts";
import { PORTFOLIO_SUMMARY, PERIOD_RETURNS, WEALTH_GROWTH_DATA } from "./portfolio-mock-data";

/* ------------------------------------------------------------------ */
/*  Chart period tabs                                                  */
/* ------------------------------------------------------------------ */

const CHART_PERIODS = ["1M", "3M", "6M", "1Y", "All"] as const;
type ChartPeriod = (typeof CHART_PERIODS)[number];

function daysForPeriod(period: ChartPeriod): number {
  if (period === "1M") return 22;
  if (period === "3M") return 66;
  if (period === "6M") return 132;
  if (period === "1Y") return 252;
  return Infinity; // All
}

/* ------------------------------------------------------------------ */
/*  Wealth Growth Chart                                                */
/* ------------------------------------------------------------------ */

interface CrosshairData {
  value: number;
  invested: number;
  date: string;
}

function WealthGrowthChart({
  onCrosshairMove,
  period,
}: {
  onCrosshairMove?: (data: CrosshairData | null) => void;
  period: ChartPeriod;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const count = daysForPeriod(period);
    const chartData = WEALTH_GROWTH_DATA.slice(-Math.min(count, WEALTH_GROWTH_DATA.length));

    // Determine if portfolio is up or down over selected period
    const firstVal = chartData[0]?.value ?? 0;
    const lastVal = chartData[chartData.length - 1]?.value ?? 0;
    const isGain = lastVal >= firstVal;
    const lineColor = isGain ? "#22c55e" : "#ef4444";
    const areaTop = isGain ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)";
    const areaBottom = isGain ? "rgba(34,197,94,0.01)" : "rgba(239,68,68,0.01)";

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 220,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(150,150,150,0.9)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      timeScale: {
        visible: true,
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: { mouseWheel: false, pressedMouseMove: true },
      handleScale: false,
      crosshair: {
        vertLine: { color: "rgba(150,150,150,0.3)", width: 1, style: 2, labelVisible: false },
        horzLine: { visible: false, labelVisible: false },
      },
    });

    // Invested line — stepped (lineType 0 = simple for step effect with duplicate points)
    const investedSeries = chart.addSeries(LineSeries, {
      color: "rgba(150,150,150,0.4)",
      lineWidth: 1,
      lineStyle: 2, // dashed
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const valueSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTop,
      bottomColor: areaBottom,
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBackgroundColor: lineColor,
      crosshairMarkerBorderColor: lineColor,
      crosshairMarkerBorderWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    valueSeries.setData(chartData.map((d) => ({ time: d.time, value: d.value })));

    // Build stepped invested data: hold value until it changes
    const investedSteps: { time: string; value: number }[] = [];
    for (let i = 0; i < chartData.length; i++) {
      const curr = chartData[i];
      const prev = i > 0 ? chartData[i - 1] : null;
      if (prev && curr.invested !== prev.invested) {
        // Add a point at previous value just before the step
        investedSteps.push({ time: curr.time, value: prev.invested });
      }
      investedSteps.push({ time: curr.time, value: curr.invested });
    }
    // Deduplicate same-time entries, keep last
    const deduped = new Map<string, number>();
    for (const s of investedSteps) deduped.set(s.time, s.value);
    investedSeries.setData(chartData.map((d) => ({ time: d.time, value: deduped.get(d.time) ?? d.invested })));

    chart.timeScale().fitContent();

    chart.subscribeCrosshairMove((param) => {
      if (!onCrosshairMove) return;
      if (!param.time || !param.seriesData.size) {
        onCrosshairMove(null);
        return;
      }
      const vData = param.seriesData.get(valueSeries) as { value?: number } | undefined;
      const iData = param.seriesData.get(investedSeries) as { value?: number } | undefined;
      if (vData?.value != null) {
        onCrosshairMove({
          value: vData.value,
          invested: iData?.value ?? 0,
          date: param.time as string,
        });
      }
    });

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [onCrosshairMove, period]);

  return <div ref={containerRef} className="w-full" />;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MASK = "••••";
const f = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d });
const fs = (n: number, d = 2) => `${n > 0 ? "+" : ""}${f(n, d)}`;

/* ------------------------------------------------------------------ */
/*  Portfolio Summary Card                                             */
/* ------------------------------------------------------------------ */

export function PortfolioSummary() {
  const {
    currentValue,
    investedAmount,
    dayChange,
    dayChangePct,
    unrealizedPnl,
    unrealizedPnlPct,
  } = PORTFOLIO_SUMMARY;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("1Y");
  const [crosshairData, setCrosshairData] = useState<CrosshairData | null>(null);

  const handleCrosshairMove = useCallback((data: CrosshairData | null) => {
    setCrosshairData(data);
  }, []);

  const val = (n: number, d = 2) => f(n, d);

  return (
    <Card className="border-border/50 shadow-none overflow-hidden">
      <CardContent className="p-6">
        {/* Top row */}
        <div className="flex items-center justify-center mb-1">
          <span className="text-[13px] text-muted-foreground">Current Value</span>
          <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) setCrosshairData(null); }}>
              <SheetTrigger asChild>
                <span /></SheetTrigger>
              <SheetContent side="bottom" className="max-w-[430px] mx-auto rounded-t-2xl px-5 pb-8">
                <SheetHeader className="pb-1">
                  <SheetTitle className="text-[17px] font-semibold text-foreground">Wealth Growth</SheetTitle>
                </SheetHeader>

                {/* Hero numbers — crosshair-reactive */}
                {(() => {
                  const latest = WEALTH_GROWTH_DATA[WEALTH_GROWTH_DATA.length - 1];
                  const displayVal = crosshairData?.value ?? latest.value;
                  const displayInv = crosshairData?.invested ?? latest.invested;

                  // Total gain from invested
                  const totalGain = displayVal - displayInv;
                  const totalGainPct = displayInv > 0 ? (totalGain / displayInv) * 100 : 0;
                  const isTotalGain = totalGain >= 0;

                  // XIRR (use stored value)
                  const xirrVal = PORTFOLIO_SUMMARY.xirr;

                  // Format date for display
                  const dateLabel = crosshairData
                    ? (() => {
                        const d = new Date(crosshairData.date);
                        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                      })()
                    : "Today";

                  return (
                    <div className="mb-2">
                      {/* Current value + date */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-[28px] font-bold tracking-tight text-foreground">
                          {displayVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[13px] text-muted-foreground">{dateLabel}</span>
                      </div>

                      {/* Metrics row */}
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        {/* Total gain */}
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">Total Gain</p>
                          <span className={cn("text-[14px] font-semibold", isTotalGain ? "text-gain" : "text-loss")}>
                            {isTotalGain ? "+" : ""}{totalGain.toFixed(0)} ({isTotalGain ? "+" : ""}{totalGainPct.toFixed(1)}%)
                          </span>
                        </div>
                        {/* Annualized return */}
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">XIRR</p>
                          {crosshairData ? (
                            <span className="text-[14px] font-semibold text-muted-foreground">—</span>
                          ) : (
                            <span className={cn("text-[14px] font-semibold", xirrVal >= 0 ? "text-gain" : "text-loss")}>
                              {xirrVal >= 0 ? "+" : ""}{xirrVal}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <WealthGrowthChart onCrosshairMove={handleCrosshairMove} period={chartPeriod} />

                {/* Period selector + legend row */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {CHART_PERIODS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors",
                          chartPeriod === p
                            ? "bg-foreground/10 text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="h-[2px] w-2.5 rounded-full bg-gain" />
                      <span>Value</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-[2px] w-2.5 rounded-full bg-muted-foreground/40" style={{ borderTop: "1px dashed" }} />
                      <span>Invested</span>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
        </div>

        {/* Big value — centered */}
        <div className="text-center py-5">
          <p className="text-[38px] font-bold tracking-tight text-foreground leading-none">
            {val(currentValue)}
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-gain/10 px-3 py-1">
            <ArrowUpRight size={14} className="text-gain" />
            <span className="text-[14px] font-semibold text-gain">{f(dayChange)}</span>
            <span className="text-[13px] font-medium text-gain/80">({dayChangePct > 0 ? "+" : ""}{dayChangePct}%)</span>
            <span className="text-[12px] text-gain/50 ml-0.5">today</span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* Metrics — stacked rows */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-muted-foreground">Invested</span>
            <span className="text-[16px] font-semibold text-foreground">{val(investedAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-muted-foreground">Unrealized P&L</span>
            <div className="text-right">
              <span className="text-[16px] font-semibold text-gain">{fs(unrealizedPnl)}</span>
              <span className="text-[13px] text-gain/70 ml-1.5">+{unrealizedPnlPct}%</span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
