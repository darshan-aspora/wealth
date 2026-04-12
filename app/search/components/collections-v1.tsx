"use client";

/**
 * Collections — Horizontal scroll cards using the explore stock page card design.
 * Each card: rounded-2xl border, icon square, name + count, description, footer stats.
 * Adapted from CollectionCardAlt in funded-not-traded.tsx.
 */

interface Collection {
  name: string;
  description: string;
  stocks: number;
  etfs?: number;
  type: "Stocks" | "ETFs" | "Mixed";
  return1y: number;
  minAmount: number;
  weighting: "Equal" | "Market Cap" | "Custom";
}

const collections: Collection[] = [
  {
    name: "Tech Giants",
    description: "High-growth silicon leaders dominating the global digital infrastructure and AI sector.",
    stocks: 15, type: "Stocks", return1y: 4.2, minAmount: 1234, weighting: "Market Cap",
  },
  {
    name: "AI & Robotics",
    description: "Top AI, automation & chip companies driving the next wave of computing.",
    stocks: 10, type: "Stocks", return1y: 12.8, minAmount: 500, weighting: "Equal",
  },
  {
    name: "Clean Energy",
    description: "Solar, wind & EV ecosystem shaping the future of sustainable infrastructure.",
    stocks: 12, type: "Stocks", return1y: -2.4, minAmount: 750, weighting: "Equal",
  },
  {
    name: "Global ETF Pack",
    description: "Broad exposure across US, Europe, and emerging markets through top ETFs.",
    stocks: 0, etfs: 8, type: "ETFs", return1y: 8.1, minAmount: 250, weighting: "Custom",
  },
  {
    name: "Dividend Machines",
    description: "Stocks that pay you to hold them. 25+ years of consecutive dividend increases.",
    stocks: 10, type: "Stocks", return1y: 6.8, minAmount: 500, weighting: "Market Cap",
  },
  {
    name: "Cybersecurity",
    description: "The companies protecting the digital world. Every breach makes this sector more essential.",
    stocks: 8, type: "Stocks", return1y: 11.4, minAmount: 400, weighting: "Custom",
  },
];

export function CollectionsWidget() {
  return (
    <div>
      <h3 className="text-[16px] font-bold text-foreground mb-3 px-5">
        Collections
      </h3>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
        {collections.map((c) => {
          const isUp = c.return1y >= 0;
          return (
            <button
              key={c.name}
              className="flex w-[260px] shrink-0 flex-col rounded-2xl border border-border/60 p-5 text-left active:scale-[0.98] transition-transform"
            >
              {/* Header: icon + name + count */}
              <div className="flex items-start gap-3 mb-2">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-muted-foreground/20 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] font-bold text-foreground leading-tight">
                    {c.name}
                  </h3>
                  <p className="text-[14px] text-muted-foreground">
                    {c.type === "Stocks" && `${c.stocks} Stocks`}
                    {c.type === "ETFs" && `${c.etfs} ETFs`}
                    {c.type === "Mixed" && `${c.stocks} Stocks · ${c.etfs} ETFs`}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                {c.description}
              </p>

              {/* Footer stats */}
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-[12px] text-muted-foreground/50">1Y Return</p>
                  <p
                    className={`text-[14px] font-medium tabular-nums ${
                      isUp ? "text-gain" : "text-loss"
                    }`}
                  >
                    {isUp ? "+" : ""}
                    {c.return1y}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-muted-foreground/50">Minimum</p>
                  <p className="text-[14px] font-medium text-foreground tabular-nums">
                    {c.minAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
