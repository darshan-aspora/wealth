"use client";

import { cn } from "@/lib/utils";
import { PERIOD_RETURNS } from "./portfolio-mock-data";

export function PortfolioPerformance() {
  const maxVal = Math.max(...PERIOD_RETURNS.map((r) => Math.abs(r.value)));

  return (
    <div className="px-1 py-4">
      <p className="text-[15px] font-semibold text-foreground mb-5">Portfolio Performance</p>
      <div className="flex items-end justify-between gap-3">
        {PERIOD_RETURNS.map((r) => {
          const heightPct = (Math.abs(r.value) / maxVal) * 100;
          const isGain = r.value >= 0;
          return (
            <div key={r.shortPeriod} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end justify-center" style={{ height: 72 }}>
                <div
                  className={cn(
                    "w-full rounded-md",
                    isGain ? "bg-gain/80" : "bg-loss/80"
                  )}
                  style={{ height: `${heightPct}%`, minHeight: 8 }}
                />
              </div>
              <span className="text-[12px] text-muted-foreground">{r.shortPeriod.replace(/(\d)([A-Z])/, "$1 $2")}</span>
              <span className={cn("text-[13px] font-semibold", isGain ? "text-gain" : "text-loss")}>
                {isGain ? "+" : ""}{r.value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
