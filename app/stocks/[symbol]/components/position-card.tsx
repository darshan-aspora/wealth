"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Wallet } from "lucide-react";
import { POSITIONS } from "./mock-data";

interface PositionCardProps {
  symbol: string;
}

export function PositionCard({ symbol }: PositionCardProps) {
  const position = POSITIONS[symbol];
  if (!position) return null;

  const totalGain = position.totalReturn >= 0;

  return (
    <div className="px-5 py-4">
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-foreground">Investment</h2>
        <button className="flex items-center gap-0.5 text-[14px] text-muted-foreground transition-colors hover:text-foreground">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Holdings row */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-[12px] text-muted-foreground">Total Holdings</p>
          <p className="text-[17px] font-bold text-foreground tabular-nums mt-0.5">
            {position.marketValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">P&L</p>
          <p className={cn(
            "text-[17px] font-bold tabular-nums mt-0.5",
            totalGain ? "text-gain" : "text-loss"
          )}>
            {totalGain ? "+" : ""}{Math.abs(position.totalReturn).toFixed(1)}
            <span className="text-[13px] ml-0.5">({totalGain ? "+" : ""}{position.totalReturnPercent.toFixed(1)}%)</span>
          </p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Share</p>
          <p className="text-[17px] font-bold text-foreground tabular-nums mt-0.5">
            {position.shares}
          </p>
        </div>
      </div>

      {/* Pending orders */}
      <button className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-5 py-3 mb-2 transition-colors active:bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[12px] font-bold text-background">
            3
          </span>
          <span className="text-[15px] font-medium text-foreground">Pending Orders</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[15px] font-semibold text-foreground tabular-nums">250</span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      </button>

      {/* Buying power */}
      <button className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-5 py-3 transition-colors active:bg-muted/50">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-muted-foreground" />
          <span className="text-[15px] font-medium text-foreground">Buying Power</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[15px] font-semibold text-foreground tabular-nums">54.10</span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      </button>
    </div>
  );
}
