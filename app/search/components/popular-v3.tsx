"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * Popular — 3 rows of pills that scroll horizontally together.
 * Grey borders, pills overflow to the right, swipe to see all.
 */

const popularItems = [
  { symbol: "AAPL", changePct: 1.53 },
  { symbol: "META", changePct: -1.35 },
  { symbol: "SPY", changePct: 0.41 },
  { symbol: "AMD", changePct: 2.48 },
  { symbol: "EUR/USD", changePct: 0.21 },
  { symbol: "VIX", changePct: -2.82 },
  { symbol: "ARKK", changePct: 2.15 },
  { symbol: "NFLX", changePct: -1.25 },
  { symbol: "NVDA", changePct: 5.33 },
  { symbol: "TSLA", changePct: 3.81 },
  { symbol: "GOOGL", changePct: 1.06 },
  { symbol: "MSFT", changePct: -0.48 },
  { symbol: "JPM", changePct: 0.50 },
  { symbol: "AMZN", changePct: 2.02 },
  { symbol: "QQQ", changePct: 0.60 },
  { symbol: "COST", changePct: 0.47 },
  { symbol: "AVGO", changePct: 2.85 },
  { symbol: "GLD", changePct: 0.78 },
];

// Split into 3 rows
const ROW_COUNT = 3;
const rows: (typeof popularItems)[] = [[], [], []];
popularItems.forEach((item, i) => rows[i % ROW_COUNT].push(item));

function Pill({ item }: { item: (typeof popularItems)[number] }) {
  const isUp = item.changePct >= 0;
  return (
    <button className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/50 bg-card/60 px-3.5 py-2 text-left active:scale-[0.95] transition-transform">
      <span className="text-[14px] font-semibold text-foreground whitespace-nowrap">
        {item.symbol}
      </span>
      <span
        className={`flex items-center gap-0.5 text-[12px] font-semibold whitespace-nowrap ${
          isUp ? "text-gain" : "text-loss"
        }`}
      >
        {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {Math.abs(item.changePct).toFixed(1)}%
      </span>
    </button>
  );
}

export function PopularWidget() {
  return (
    <div>
      <h3 className="text-[16px] font-bold text-foreground mb-3 px-5">
        Popular
      </h3>
      {/* All 3 rows scroll horizontally together */}
      <div className="no-scrollbar overflow-x-auto px-5">
        <div className="flex w-max flex-col gap-2">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-2">
              {row.map((item) => (
                <Pill key={item.symbol} item={item} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
