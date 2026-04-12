"use client";

import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * Popular V2 — Horizontal Scroll Cards
 * Taller cards that scroll horizontally.
 * Each card: symbol large, name, price, and a colored change badge.
 * Accent bar on top edge color-coded to gain/loss.
 */

const popularItems = [
  { symbol: "AAPL", name: "Apple Inc.", price: 227.63, changePct: 1.53 },
  { symbol: "META", name: "Meta Platforms", price: 612.35, changePct: -1.35 },
  { symbol: "SPY", name: "SPDR S&P 500", price: 601.42, changePct: 0.41 },
  { symbol: "AMD", name: "Adv. Micro Devices", price: 162.87, changePct: 2.48 },
  { symbol: "EUR/USD", name: "Euro / US Dollar", price: 1.0842, changePct: 0.21 },
  { symbol: "VIX", name: "Volatility Index", price: 14.82, changePct: -2.82 },
  { symbol: "ARKK", name: "ARK Innovation", price: 58.42, changePct: 2.15 },
  { symbol: "NFLX", name: "Netflix Inc.", price: 891.24, changePct: -1.25 },
];

export function PopularV2() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-5">
        <TrendingUp size={14} className="text-muted-foreground/50" />
        <h3 className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground/50">
          Popular
        </h3>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
        {popularItems.map((item) => {
          const isUp = item.changePct >= 0;
          return (
            <button
              key={item.symbol}
              className="group relative flex w-[140px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-3.5 text-left active:scale-[0.97] transition-transform"
            >
              {/* Top accent bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-[3px] ${
                  isUp ? "bg-gain/60" : "bg-loss/60"
                }`}
              />
              <div className="h-9 w-9 rounded-full bg-muted mb-2.5" />
              <p className="text-[16px] font-bold text-foreground leading-tight">
                {item.symbol}
              </p>
              <p className="text-[12px] text-muted-foreground/50 leading-tight mt-0.5 truncate">
                {item.name}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[15px] font-semibold tabular-nums text-foreground">
                  {item.price < 10 ? item.price.toFixed(4) : item.price < 100 ? item.price.toFixed(2) : item.price.toFixed(0)}
                </span>
                <span
                  className={`flex items-center gap-0.5 text-[12px] font-semibold ${
                    isUp ? "text-gain" : "text-loss"
                  }`}
                >
                  {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {Math.abs(item.changePct).toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
