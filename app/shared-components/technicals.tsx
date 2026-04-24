"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

const TIME_PERIODS = ["30M", "1H", "5H", "1D", "1W", "1M"] as const;
type TimePeriod = (typeof TIME_PERIODS)[number];

interface IndicatorRow {
  name: string;
  value: string;
  signal?: string;
}

const MOMENTUM_INDICATORS: IndicatorRow[] = [
  { name: "Relative Strength Index (D)", value: "40.33", signal: "Neutral" },
  { name: "Relative Strength Index (W)", value: "61.33", signal: "Neutral" },
  { name: "Commodity Channel Index", value: "106.96", signal: "Oversold" },
  { name: "Money Flow Index", value: "40.33", signal: "Neutral" },
  { name: "Rate of Change", value: "-12.35", signal: "Negative" },
  { name: "Stochastic %K", value: "40.33", signal: "Bearish" },
  { name: "Williams % R (D)", value: "40.33", signal: "Neutral" },
];

const RELATIVE_STRENGTH_INDICATORS: IndicatorRow[] = [
  { name: "Benchmark Index (21 D)", value: "-0.02", signal: "Negative" },
  { name: "Benchmark Index (55 D)", value: "0.08", signal: "Positive" },
  { name: "Sector Index (55 D)", value: "0.10", signal: "Positive" },
];

const VOLATILITY_INDICATORS: IndicatorRow[] = [
  { name: "Average True Range", value: "21.36" },
  { name: "Bollinger Band Width", value: "0.26" },
  { name: "Bollinger Bands %B", value: "0.18" },
  { name: "Standard Deviation", value: "22.60" },
];

function SummaryGauge({
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
        <svg viewBox="0 0 168 88" className="absolute inset-0 w-full">
          {/* Background arc */}
          <path
            d="M 14 84 A 70 70 0 0 1 154 84"
            fill="none"
            stroke="#e5e5ea"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Active arc segment */}
          <path
            d="M 14 84 A 70 70 0 0 1 84 14"
            fill="none"
            stroke="#1c1c1e"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Needle */}
          <g transform={`rotate(${angle}, 84, 84)`}>
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
          </g>
        </svg>
        <span className="absolute bottom-0 left-0 -translate-x-6 text-[11px] font-semibold text-foreground whitespace-nowrap">
          Strong sell
        </span>
        <span className="absolute bottom-0 right-0 translate-x-6 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
          Strong buy
        </span>
      </div>

      <p className="text-[18px] font-semibold text-foreground">{signal}</p>

      <div className="flex w-[214px] items-center justify-between">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[14px] text-muted-foreground">Sell</span>
          <span className="text-[16px] font-bold text-foreground">{sell}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[14px] text-muted-foreground">Neutral</span>
          <span className="text-[16px] font-bold text-foreground">{neutral}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[14px] text-muted-foreground">Buy</span>
          <span className="text-[16px] font-bold text-foreground">{buy}</span>
        </div>
      </div>
    </div>
  );
}

function IndicatorTable({
  rows,
  showSignal = true,
}: {
  rows: IndicatorRow[];
  showSignal?: boolean;
}) {
  return (
    <div className="flex w-full items-start">
      {/* Name column */}
      <div className="flex flex-col">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center py-[10px]">
            <span className="text-[14px] text-foreground whitespace-nowrap">
              {row.name}
            </span>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Value column */}
      <div className="flex flex-col items-end">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center px-[10px] py-[10px]">
            <span className="text-[14px] font-medium text-foreground uppercase whitespace-nowrap">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Signal column */}
      {showSignal && (
        <div className="flex flex-col" style={{ width: 103 }}>
          {rows.map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between px-[10px] py-[10px]"
            >
              <span className="text-[14px] font-medium text-muted-foreground whitespace-nowrap">
                {row.signal}
              </span>
              <Info size={12} className="text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface TechnicalsProps {
  symbol: string;
}

export function Technicals({ symbol: _symbol }: TechnicalsProps) {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>("1D");

  return (
    <div className="flex flex-col gap-8 px-[18px] py-4">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">
          Technical Analysis
        </h2>
        <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">
          Analyze price trends, indicators, and market momentum. Understand
          potential entry and exit points.
        </p>
      </div>

      {/* Time period selector + Summary */}
      <div className="flex flex-col gap-4">
        {/* Time period tabs */}
        <div className="flex items-center justify-between">
          {TIME_PERIODS.map((period) => {
            const active = period === activePeriod;
            return (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={cn(
                  "flex flex-col items-center justify-center px-[10px] text-[13px] font-medium tracking-[-0.13px] whitespace-nowrap",
                  active
                    ? "rounded-[5px] bg-foreground py-[2px] text-background"
                    : "py-[5px] pt-[6px] text-muted-foreground",
                )}
              >
                {period}
              </button>
            );
          })}
        </div>

        {/* Summary gauge */}
        <div className="flex items-center justify-center py-2">
          <SummaryGauge signal="Sell" sell={14} neutral={10} buy={2} />
        </div>
      </div>

      {/* Momentum */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">
            Momentum
          </h3>
          <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">
            Measures speed &amp; strength of recent price movement
          </p>
        </div>
        <IndicatorTable rows={MOMENTUM_INDICATORS} />
      </div>

      {/* Relative Strength */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">
            Relative Strength
          </h3>
          <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">
            Compares stock performance vs benchmark &amp; sector
          </p>
        </div>
        <IndicatorTable rows={RELATIVE_STRENGTH_INDICATORS} />
      </div>

      {/* Volatility */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">
            Volatility
          </h3>
          <p className="text-[14px] text-muted-foreground leading-[1.4] tracking-[-0.14px]">
            Measures size &amp; frequency of price fluctuations
          </p>
        </div>
        <IndicatorTable rows={VOLATILITY_INDICATORS} showSignal={false} />
      </div>
    </div>
  );
}
