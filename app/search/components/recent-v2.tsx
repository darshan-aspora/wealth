"use client";

import { Clock, X } from "lucide-react";

/**
 * Recent V2 — Card List with Clear All
 * Bordered card with clean rows, subtle separators, and a "Clear All" action.
 * Each row: avatar, name + type subtext, price + change.
 */

const recentItems = [
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Stock", price: 134.70, changePct: 5.33 },
  { symbol: "SPX", name: "S&P 500", type: "Index", price: 6021.63, changePct: 0.41 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", type: "ETF", price: 521.87, changePct: 0.60 },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Stock", price: 342.18, changePct: 3.81 },
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", price: 227.63, changePct: 1.53 },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "Stock", price: 213.47, changePct: 2.02 },
];

export function RecentV2() {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted-foreground/50" />
          <h3 className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground/50">
            Recent
          </h3>
        </div>
        <button className="text-[13px] font-medium text-muted-foreground/50 active:text-foreground transition-colors">
          Clear all
        </button>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden divide-y divide-border/30">
        {recentItems.map((item) => {
          const isUp = item.changePct >= 0;
          return (
            <div key={item.symbol} className="flex items-center gap-3 px-4 py-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-foreground leading-tight">
                  {item.name}
                </p>
                <p className="text-[13px] text-muted-foreground/50 leading-tight mt-0.5">
                  {item.type} · {item.symbol}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[15px] font-semibold tabular-nums text-foreground">
                  {item.price}
                </p>
                <p className={`text-[13px] font-medium tabular-nums ${isUp ? "text-gain" : "text-loss"}`}>
                  {isUp ? "+" : ""}{item.changePct.toFixed(2)}%
                </p>
              </div>
              <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-muted/60 transition-colors">
                <X size={14} strokeWidth={2} className="text-muted-foreground/40" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
