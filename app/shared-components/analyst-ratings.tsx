"use client";

import { cn } from "@/lib/utils";
import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import { AIAnnotation } from "./ai-annotation";
import { getAnalystRatings } from "./mock-data";

interface AnalystRatingsProps {
  symbol: string;
}

export function AnalystRatings({ symbol }: AnalystRatingsProps) {
  const data = getAnalystRatings(symbol);
  if (!data) return null;

  const { ratings } = data;
  const total = ratings.strongBuy + ratings.buy + ratings.hold + ratings.sell + ratings.strongSell;

  const segments = [
    { label: "Strong Buy", count: ratings.strongBuy, color: "bg-emerald-500" },
    { label: "Buy", count: ratings.buy, color: "bg-[hsl(var(--gain))]" },
    { label: "Hold", count: ratings.hold, color: "bg-muted-foreground/40" },
    { label: "Sell", count: ratings.sell, color: "bg-orange-500" },
    { label: "Strong Sell", count: ratings.strongSell, color: "bg-[hsl(var(--loss))]" },
  ].filter((s) => s.count > 0);

  return (
    <div className="px-5 py-4">
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        Analyst Consensus
      </h2>

      {/* Total */}
      <p className="mb-3 text-[15px] text-muted-foreground">
        <span className="font-semibold text-foreground">{total} analysts</span> covering this stock
      </p>

      {/* Stacked bar */}
      <div className="mb-3">
        <div className="flex h-4 overflow-hidden rounded-full">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={seg.color}
              style={{ width: `${(seg.count / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <div className={cn("h-2.5 w-2.5 rounded-full", seg.color)} />
              <span className="text-[13px] text-muted-foreground">
                {seg.label} ({seg.count})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Target slider */}
      <div className="mt-5">
        <p className="mb-2 text-[14px] font-medium text-foreground">Price Target</p>
        <PriceTargetSlider
          low={data.priceTarget.low}
          avg={data.priceTarget.avg}
          high={data.priceTarget.high}
          current={data.priceTarget.current}
        />
        <div className="mt-2">
          <AIAnnotation size="md">{data.annotation}</AIAnnotation>
        </div>
      </div>

      {/* Recent Calls */}
      <div className="mt-5">
        <p className="mb-3 text-[14px] font-medium text-foreground">Recent Calls</p>
        <div className="space-y-2.5">
          {data.recentCalls.map((call, i) => {
            const DirectionIcon =
              call.direction === "upgrade" ? ArrowUp :
              call.direction === "downgrade" ? ArrowDown : ArrowRight;
            const dirColor =
              call.direction === "upgrade" ? "text-[hsl(var(--gain))]" :
              call.direction === "downgrade" ? "text-[hsl(var(--loss))]" : "text-muted-foreground";

            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-card px-3 py-2.5 border border-border/30"
              >
                <div className="flex items-center gap-2.5">
                  <DirectionIcon size={14} className={dirColor} />
                  <div>
                    <p className="text-[14px] font-medium text-foreground">{call.firm}</p>
                    <p className="text-[13px] text-muted-foreground">{call.rating}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium tabular-nums text-foreground">
                    ${call.target}
                  </p>
                  <p className="text-[12px] text-muted-foreground">{call.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PriceTargetSlider({
  low,
  avg,
  high,
  current,
}: {
  low: number;
  avg: number;
  high: number;
  current: number;
}) {
  const range = high - low;
  const avgPos = range > 0 ? ((avg - low) / range) * 100 : 50;
  const currentPos = range > 0 ? ((current - low) / range) * 100 : 50;

  return (
    <div>
      <div className="relative mb-1.5 h-2 rounded-full bg-secondary/50">
        {/* Average target marker */}
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500 bg-background"
          style={{ left: `${Math.min(100, Math.max(0, avgPos))}%` }}
        />
        {/* Current price marker */}
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
          style={{ left: `${Math.min(100, Math.max(0, currentPos))}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[13px] tabular-nums text-muted-foreground">${low}</span>
        <span className="text-[13px] font-medium tabular-nums text-blue-500">
          avg ${avg}
        </span>
        <span className="text-[13px] tabular-nums text-muted-foreground">${high}</span>
      </div>
    </div>
  );
}
