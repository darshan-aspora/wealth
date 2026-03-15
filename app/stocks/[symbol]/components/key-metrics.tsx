"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KEY_METRICS } from "./mock-data";

interface KeyMetricsProps {
  symbol: string;
}

export function KeyMetrics({ symbol }: KeyMetricsProps) {
  const metrics = KEY_METRICS[symbol];
  if (!metrics) return null;

  return (
    <div className="px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-foreground">Performance Metrics</h2>
        <Button
          variant="ghost"
          size="icon-xs"
          className="rounded-full text-muted-foreground/50"
        >
          <Info size={18} />
        </Button>
      </div>

      {/* 2-column grid matching PDF layout */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        {metrics.primary.map((metric) => (
          <div key={metric.label}>
            <p className="text-[13px] text-muted-foreground">{metric.label}</p>
            <p className="mt-0.5 text-[20px] font-bold tabular-nums text-foreground">
              {metric.value}
            </p>
            {metric.annotation && (
              <p className="mt-0.5 text-[12px] text-muted-foreground/60 leading-tight">
                {metric.annotation}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Secondary metrics horizontal scroll */}
      <div className="no-scrollbar mt-5 flex gap-5 overflow-x-auto border-t border-border/40 pt-4">
        {metrics.secondary.map((metric) => (
          <div key={metric.label} className="shrink-0">
            <p className="text-[12px] text-muted-foreground">{metric.label}</p>
            <p className="mt-0.5 text-[15px] font-medium tabular-nums text-foreground">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
