"use client";

import { useMemo } from "react";
import { AIAnnotation } from "./ai-annotation";
import { generateMarketDepth } from "./mock-data";

interface MarketDepthProps {
  symbol: string;
  currentPrice: number;
}

export function MarketDepth({ symbol, currentPrice }: MarketDepthProps) {
  const depth = useMemo(() => generateMarketDepth(currentPrice, symbol), [currentPrice, symbol]);
  const maxSize = Math.max(...depth.bids.map((b) => b.size), ...depth.asks.map((a) => a.size));

  return (
    <div className="px-5 py-4">
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        Market Depth
      </h2>

      {/* Depth visualization */}
      <div className="space-y-1.5">
        {depth.bids.map((bid, i) => {
          const ask = depth.asks[i];
          const bidWidth = (bid.size / maxSize) * 100;
          const askWidth = (ask.size / maxSize) * 100;

          return (
            <div key={i} className="flex items-center gap-2">
              {/* Bid bar (right-aligned) */}
              <div className="flex flex-1 items-center justify-end">
                <span className="mr-2 font-mono text-[12px] tabular-nums text-muted-foreground">
                  {bid.size.toLocaleString()}
                </span>
                <div
                  className="h-5 rounded-l-sm bg-[hsl(var(--gain))]/20"
                  style={{ width: `${bidWidth}%` }}
                />
              </div>

              {/* Price column */}
              <div className="w-[52px] text-center">
                <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                  {bid.price.toFixed(2)}
                </span>
              </div>
              <div className="w-[52px] text-center">
                <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                  {ask.price.toFixed(2)}
                </span>
              </div>

              {/* Ask bar (left-aligned) */}
              <div className="flex flex-1 items-center">
                <div
                  className="h-5 rounded-r-sm bg-[hsl(var(--loss))]/20"
                  style={{ width: `${askWidth}%` }}
                />
                <span className="ml-2 font-mono text-[12px] tabular-nums text-muted-foreground">
                  {ask.size.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="mt-2 flex justify-between px-5">
        <span className="text-[12px] font-medium text-[hsl(var(--gain))]">BIDS</span>
        <span className="text-[12px] font-medium text-[hsl(var(--loss))]">ASKS</span>
      </div>

      {/* Spread Info */}
      <div className="mt-4 rounded-xl border border-border/40 bg-card p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[14px] text-muted-foreground">Bid / Ask</span>
          <span className="font-mono text-[14px] tabular-nums text-foreground">
            ${depth.bids[0].price.toFixed(2)} / ${depth.asks[0].price.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[14px] text-muted-foreground">Spread</span>
          <span className="font-mono text-[14px] tabular-nums text-foreground">
            ${depth.spread.toFixed(2)} ({depth.spreadPercent}%)
          </span>
        </div>
        <AIAnnotation>{depth.annotation}</AIAnnotation>
      </div>
    </div>
  );
}
