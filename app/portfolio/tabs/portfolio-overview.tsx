"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, ArrowDownRight, ChevronRight, Wallet, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Mini sparkline chart (SVG)                                         */
/* ------------------------------------------------------------------ */

function generatePortfolioCurve(): number[] {
  const pts: number[] = [];
  let v = 38_000;
  for (let i = 0; i < 90; i++) {
    const noise = Math.sin(i * 0.7) * 400 + Math.cos(i * 0.3) * 250;
    v += 80 + noise * 0.15;
    v = Math.max(36_000, Math.min(50_000, v));
    pts.push(v);
  }
  return pts;
}

const chartData = generatePortfolioCurve();

function PortfolioChart() {
  const w = 382;
  const h = 120;
  const padY = 8;
  const min = Math.min(...chartData);
  const max = Math.max(...chartData);
  const range = max - min || 1;

  const points = chartData
    .map((v, i) => {
      const x = (i / (chartData.length - 1)) * w;
      const y = padY + (1 - (v - min) / range) * (h - padY * 2);
      return `${x},${y}`;
    })
    .join(" ");

  // gradient fill path
  const fillPath = `M0,${padY + (1 - (chartData[0] - min) / range) * (h - padY * 2)} ${chartData
    .map((v, i) => {
      const x = (i / (chartData.length - 1)) * w;
      const y = padY + (1 - (v - min) / range) * (h - padY * 2);
      return `L${x},${y}`;
    })
    .join(" ")} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--gain))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--gain))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#chartFill)" />
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--gain))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Comparison row helper                                              */
/* ------------------------------------------------------------------ */

function ComparisonRow({
  label,
  diy,
  advisory,
  isPercentage,
  isChange,
}: {
  label: string;
  diy: string;
  advisory: string;
  isPercentage?: boolean;
  isChange?: boolean;
}) {
  const diyPositive = diy.startsWith("+");
  const advPositive = advisory.startsWith("+");

  return (
    <div className="flex items-center py-2.5">
      <p className="w-[100px] shrink-0 text-[13px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "flex-1 text-right text-[15px] font-semibold tabular-nums",
          isChange ? (diyPositive ? "text-gain" : "text-loss") : "text-foreground"
        )}
      >
        {diy}
        {isPercentage && "%"}
      </p>
      <p
        className={cn(
          "flex-1 text-right text-[15px] font-semibold tabular-nums",
          isChange ? (advPositive ? "text-gain" : "text-loss") : "text-foreground"
        )}
      >
        {advisory}
        {isPercentage && "%"}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function PortfolioOverview() {
  const currentValue = 48_625.80;
  const investedAmount = 45_780.50;
  const dayChange = 385.20;
  const dayChangePct = 0.80;
  const xirr = 18.42;
  const buyingPower = 12_485.50;

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* ── Widget 1: Portfolio Summary + Chart ── */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="p-5 pb-3">
          <p className="text-[13px] text-muted-foreground">Current Value</p>
          <p className="mt-0.5 text-[32px] font-bold tabular-nums tracking-tight text-foreground leading-tight">
            {currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>

          {/* Day change */}
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-gain/12 px-2 py-1">
              <ArrowUpRight size={14} className="text-gain" />
              <span className="text-[14px] font-semibold tabular-nums text-gain">
                {dayChange.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[13px] font-medium tabular-nums text-gain">
                ({dayChangePct > 0 ? "+" : ""}{dayChangePct}%)
              </span>
            </div>
            <span className="text-[13px] text-muted-foreground">Today</span>
          </div>

          {/* Invested + XIRR row */}
          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-[12px] text-muted-foreground">Invested</p>
              <p className="text-[16px] font-semibold tabular-nums text-foreground">
                {investedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-muted-foreground">XIRR</p>
              <p className="text-[16px] font-semibold tabular-nums text-gain">
                {xirr}%
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="px-2 pb-2">
          <PortfolioChart />
        </div>
      </div>

      {/* ── Widget 2: Buying Power ── */}
      <button className="flex w-full items-center gap-4 rounded-2xl border border-border/50 bg-card px-5 py-4 text-left active:scale-[0.98] transition-transform">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/12">
          <Wallet size={22} strokeWidth={1.6} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-muted-foreground">Buying Power</p>
          <p className="text-[20px] font-bold tabular-nums text-foreground leading-tight">
            {buyingPower.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <ChevronRight size={20} className="shrink-0 text-muted-foreground/40" />
      </button>

      {/* ── Widget 3: DIY vs Advisory Comparison ── */}
      <div className="rounded-2xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[15px] font-semibold text-foreground">Portfolio Comparison</p>
        </div>
        <p className="text-[12px] text-muted-foreground mb-4">
          DIY vs Advisory performance side-by-side
        </p>

        {/* Column headers */}
        <div className="flex items-center pb-2 border-b border-border/40">
          <div className="w-[100px] shrink-0" />
          <p className="flex-1 text-right text-[13px] font-medium text-muted-foreground">DIY</p>
          <div className="flex flex-1 items-center justify-end gap-1.5">
            <Sparkles size={12} className="text-amber-500" />
            <p className="text-[13px] font-medium text-muted-foreground">Advisory</p>
          </div>
        </div>

        {/* Comparison rows */}
        <ComparisonRow
          label="Invested"
          diy="32,450.00"
          advisory="13,330.50"
        />
        <div className="h-px bg-border/30" />
        <ComparisonRow
          label="Current"
          diy="35,280.40"
          advisory="13,345.40"
        />
        <div className="h-px bg-border/30" />
        <ComparisonRow
          label="XIRR"
          diy="+22.8"
          advisory="+12.6"
          isPercentage
          isChange
        />
        <div className="h-px bg-border/30" />
        <ComparisonRow
          label="1D Change"
          diy="+0.82"
          advisory="+0.75"
          isPercentage
          isChange
        />
      </div>
    </div>
  );
}
