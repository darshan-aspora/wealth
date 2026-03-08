"use client";

import { ChevronRight } from "lucide-react";
import { AIAnnotation } from "./ai-annotation";
import { KEY_METRICS } from "./mock-data";

interface KeyMetricsProps {
  symbol: string;
}

export function KeyMetrics({ symbol }: KeyMetricsProps) {
  const metrics = KEY_METRICS[symbol];
  if (!metrics) return null;

  return (
    <div className="px-4 py-4">
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        Key Metrics
      </h2>

      {/* Primary metrics grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        {metrics.primary.map((metric) => (
          <div key={metric.label}>
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-0.5 font-mono text-[20px] font-bold tabular-nums text-foreground">
              {metric.value}
            </p>
            {metric.annotation && (
              <div className="mt-1">
                <AIAnnotation>{metric.annotation}</AIAnnotation>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Secondary metrics row */}
      <div className="no-scrollbar mt-5 flex gap-5 overflow-x-auto border-t border-border/40 pt-4">
        {metrics.secondary.map((metric) => (
          <div key={metric.label} className="shrink-0">
            <p className="text-[12px] text-muted-foreground">{metric.label}</p>
            <p className="mt-0.5 font-mono text-[15px] font-medium tabular-nums text-foreground">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* See all metrics */}
      <button className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-border/60 py-3 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        See all 20+ metrics
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
