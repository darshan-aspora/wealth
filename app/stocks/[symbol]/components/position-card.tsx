"use client";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { POSITIONS } from "./mock-data";
import { formatPrice } from "@/components/ticker";

interface PositionCardProps {
  symbol: string;
}

export function PositionCard({ symbol }: PositionCardProps) {
  const position = POSITIONS[symbol];
  if (!position) return null;

  const totalGain = position.totalReturn >= 0;
  const todayGain = position.todayPnL >= 0;

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          Your Position
        </h3>
        <button className="flex items-center gap-0.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
          View Orders <ChevronRight size={14} />
        </button>
      </div>

      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <span className="text-[20px] font-bold text-foreground">{position.shares} shares</span>
          <span className="ml-2 text-[14px] text-muted-foreground">
            Avg. ${formatPrice(position.avgCost)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-wider text-muted-foreground">Market Value</p>
          <p className="font-mono text-[17px] font-semibold tabular-nums text-foreground">
            ${formatPrice(position.marketValue)}
          </p>
        </div>
        <div>
          <p className="text-[12px] uppercase tracking-wider text-muted-foreground">Total Return</p>
          <p
            className={cn(
              "font-mono text-[17px] font-semibold tabular-nums",
              totalGain ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]",
            )}
          >
            {totalGain ? "+" : ""}${formatPrice(Math.abs(position.totalReturn))}
            <span className="ml-1 text-[14px]">
              ({totalGain ? "+" : ""}{position.totalReturnPercent.toFixed(1)}%)
            </span>
          </p>
        </div>
      </div>

      {/* Today's P&L — the differentiator */}
      <div
        className={cn(
          "mt-3 rounded-xl px-3 py-2",
          todayGain ? "bg-[hsl(var(--gain))]/[0.06]" : "bg-[hsl(var(--loss))]/[0.06]",
        )}
      >
        <p className="text-[13px] text-muted-foreground">Today&apos;s P&L</p>
        <p
          className={cn(
            "font-mono text-[16px] font-semibold tabular-nums",
            todayGain ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]",
          )}
        >
          {todayGain ? "+" : ""}${formatPrice(Math.abs(position.todayPnL))}
        </p>
      </div>
    </div>
  );
}
