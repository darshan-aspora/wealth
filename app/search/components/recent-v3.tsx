"use client";

import { Clock } from "lucide-react";

/**
 * Recent V3 — 2-Column Compact Grid
 * Small grid cards, symbol large, name truncated below, change badge.
 */

const recentItems = [
  { symbol: "NVDA", name: "NVIDIA", price: 134.70, changePct: 5.33 },
  { symbol: "SPX", name: "S&P 500", price: 6021.63, changePct: 0.41 },
  { symbol: "QQQ", name: "Invesco QQQ", price: 521.87, changePct: 0.60 },
  { symbol: "TSLA", name: "Tesla", price: 342.18, changePct: 3.81 },
  { symbol: "AAPL", name: "Apple", price: 227.63, changePct: 1.53 },
  { symbol: "AMZN", name: "Amazon", price: 213.47, changePct: 2.02 },
];

export function RecentV3() {
  return (
    <div className="px-5">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Clock size={14} className="text-muted-foreground/50" />
        <h3 className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground/50">
          Recent
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {recentItems.map((item) => {
          const isUp = item.changePct >= 0;
          return (
            <button
              key={item.symbol}
              className="flex flex-col rounded-2xl border border-border/40 bg-card/60 p-3.5 text-left active:scale-[0.97] transition-transform"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {item.symbol.slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-foreground leading-tight truncate">
                    {item.symbol}
                  </p>
                  <p className="text-[12px] text-muted-foreground/50 leading-tight truncate">
                    {item.name}
                  </p>
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-[16px] font-semibold tabular-nums text-foreground">
                  {item.price < 100 ? item.price.toFixed(2) : item.price.toFixed(0)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums ${
                    isUp
                      ? "bg-gain/10 text-gain"
                      : "bg-loss/10 text-loss"
                  }`}
                >
                  {isUp ? "+" : ""}{item.changePct.toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
