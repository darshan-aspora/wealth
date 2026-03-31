"use client";

import { cn } from "@/lib/utils";
import { AIAnnotation } from "./ai-annotation";
import { PERFORMANCE } from "./mock-data";
import { formatPrice } from "@/components/ticker";

interface PerformanceProps {
  symbol: string;
}

export function Performance({ symbol }: PerformanceProps) {
  const perf = PERFORMANCE[symbol];
  if (!perf) return null;

  const benchDelta = perf.benchmark.stockReturn - perf.benchmark.benchReturn;
  const beatBench = benchDelta > 0;

  return (
    <div className="px-5 py-4">
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        Performance
      </h2>

      {/* Today's Range */}
      <RangeSlider
        label="Today's Range"
        low={perf.todayRange.low}
        high={perf.todayRange.high}
        current={perf.todayRange.current}
      />

      {/* 52-Week Range */}
      <div className="mt-4">
        <RangeSlider
          label="52-Week Range"
          low={perf.weekRange.low}
          high={perf.weekRange.high}
          current={perf.weekRange.current}
        />
        <div className="mt-1.5">
          <AIAnnotation>{perf.rangeAnnotation}</AIAnnotation>
        </div>
      </div>

      {/* Returns */}
      <div className="mt-5">
        <p className="mb-3 text-[13px] font-medium text-muted-foreground">Returns</p>
        <div className="flex gap-2">
          {perf.returns.map((r) => {
            const positive = r.value >= 0;
            const maxAbs = Math.max(...perf.returns.map((v) => Math.abs(v.value)));
            const barHeight = Math.max(4, (Math.abs(r.value) / maxAbs) * 40);

            return (
              <div key={r.period} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={cn(
                    "text-[13px] font-medium tabular-nums",
                    positive ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]",
                  )}
                >
                  {positive ? "+" : ""}{r.value > 100 ? Math.round(r.value) : r.value.toFixed(1)}%
                </span>
                <div
                  className={cn(
                    "w-full max-w-[28px] rounded-sm",
                    positive ? "bg-[hsl(var(--gain))]/30" : "bg-[hsl(var(--loss))]/30",
                  )}
                  style={{ height: barHeight }}
                />
                <span className="text-[12px] text-muted-foreground">{r.period}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div
        className={cn(
          "mt-4 rounded-xl px-3 py-2.5",
          beatBench ? "bg-[hsl(var(--gain))]/[0.05]" : "bg-[hsl(var(--loss))]/[0.05]",
        )}
      >
        <p className="text-[14px] text-muted-foreground">
          vs {perf.benchmark.label} ({perf.benchmark.period}):{" "}
          <span
            className={cn(
              "font-semibold",
              beatBench ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]",
            )}
          >
            {beatBench ? "beat" : "lagged"} by{" "}
            {Math.abs(benchDelta).toFixed(1)}%
          </span>
        </p>
      </div>
    </div>
  );
}

function RangeSlider({
  label,
  low,
  high,
  current,
}: {
  label: string;
  low: number;
  high: number;
  current: number;
}) {
  const range = high - low;
  const position = range > 0 ? ((current - low) / range) * 100 : 50;

  return (
    <div>
      <p className="mb-2 text-[13px] font-medium text-muted-foreground">{label}</p>
      <div className="relative mb-1.5 h-1.5 rounded-full bg-secondary/50">
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-sm"
          style={{ left: `${Math.min(100, Math.max(0, position))}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[13px] tabular-nums text-muted-foreground">
          {formatPrice(low)}
        </span>
        <span className="text-[13px] tabular-nums text-muted-foreground">
          {formatPrice(high)}
        </span>
      </div>
    </div>
  );
}
