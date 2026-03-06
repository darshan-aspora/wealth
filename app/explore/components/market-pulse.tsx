"use client";

import { cn } from "@/lib/utils";

const indices = [
  { name: "S&P 500", value: "5,842", change: "+0.3%", positive: true },
  { name: "Nasdaq", value: "18,420", change: "+0.6%", positive: true },
  { name: "Dow Jones", value: "43,210", change: "-0.1%", positive: false },
  { name: "Russell 2000", value: "2,084", change: "+0.4%", positive: true },
];

const movers = [
  { symbol: "NVDA", price: "$891.04", change: "+3.2%", positive: true },
  { symbol: "AAPL", price: "$224.32", change: "+1.2%", positive: true },
  { symbol: "TSLA", price: "$178.50", change: "-2.1%", positive: false },
  { symbol: "MSFT", price: "$428.60", change: "+0.8%", positive: true },
  { symbol: "META", price: "$512.40", change: "+1.5%", positive: true },
];

function IndexItem({
  name,
  value,
  change,
  positive,
}: {
  name: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-4">
      <span className="text-foreground font-sans">{name}</span>
      <span className="text-foreground font-mono">{value}</span>
      <span className={cn("font-mono", positive ? "text-gain" : "text-loss")}>
        {positive ? "\u2191" : "\u2193"}
        {change}
      </span>
      <span className="text-muted-foreground px-2">|</span>
    </span>
  );
}

function MoverItem({
  symbol,
  price,
  change,
  positive,
}: {
  symbol: string;
  price: string;
  change: string;
  positive: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-4">
      <span className="text-foreground font-medium font-sans">{symbol}</span>
      <span className="text-foreground font-mono">{price}</span>
      <span className={cn("font-mono", positive ? "text-gain" : "text-loss")}>
        {positive ? "\u2191" : "\u2193"}
        {change}
      </span>
      <span className="text-muted-foreground px-2">|</span>
    </span>
  );
}

export function MarketPulse() {
  return (
    <section id="market-pulse" className="bg-muted/50 py-6">
      {/* Row 1 — Major Indices */}
      <div className="overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...indices, ...indices].map((item, i) => (
            <IndexItem
              key={`index-${i}`}
              name={item.name}
              value={item.value}
              change={item.change}
              positive={item.positive}
            />
          ))}
        </div>
      </div>

      {/* Row 2 — Top Movers */}
      <div className="overflow-hidden mt-3">
        <div className="flex animate-marquee-fast whitespace-nowrap">
          {[...movers, ...movers].map((item, i) => (
            <MoverItem
              key={`mover-${i}`}
              symbol={item.symbol}
              price={item.price}
              change={item.change}
              positive={item.positive}
            />
          ))}
        </div>
      </div>

      {/* Subtext */}
      <p className="text-muted-foreground text-xs text-center mt-3 px-4">
        Markets are live. Prices update in real-time. Pre-market opens at 4:00
        AM ET.
      </p>
    </section>
  );
}
