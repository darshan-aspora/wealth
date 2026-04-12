"use client";

import { Flame } from "lucide-react";

/**
 * Popular V1 — Numbered Ranking List
 * Bold rank numbers (1-8), leaderboard aesthetic, fire icon header.
 * Each row: large rank number, avatar, symbol+name, price+change.
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

export function PopularV1() {
  return (
    <div className="px-5">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Flame size={14} className="text-orange-400/70" />
        <h3 className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground/50">
          Trending Now
        </h3>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
        {popularItems.map((item, idx) => {
          const isUp = item.changePct >= 0;
          return (
            <div
              key={item.symbol}
              className={`flex items-center gap-3 px-4 py-3 ${
                idx < popularItems.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              <span className="w-6 shrink-0 text-center text-[17px] font-bold tabular-nums text-muted-foreground/30">
                {idx + 1}
              </span>
              <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-foreground leading-tight">
                  {item.symbol}
                </p>
                <p className="truncate text-[13px] text-muted-foreground/50 leading-tight mt-0.5">
                  {item.name}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[15px] font-semibold tabular-nums text-foreground">
                  {item.price}
                </p>
                <p className={`text-[12px] font-semibold tabular-nums ${isUp ? "text-gain" : "text-loss"}`}>
                  {isUp ? "+" : ""}{item.changePct.toFixed(2)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
