"use client";

import { ChevronRight } from "lucide-react";
import { AIAnnotation } from "./ai-annotation";
import { ETF_HOLDINGS } from "./mock-data";

interface ETFHoldingsProps {
  symbol: string;
}

export function ETFHoldings({ symbol }: ETFHoldingsProps) {
  const data = ETF_HOLDINGS[symbol];
  if (!data) return null;

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          ETFs Holding {symbol}
        </h2>
        <span className="text-[13px] text-muted-foreground">
          Found in {data.count} ETFs
        </span>
      </div>

      <div className="space-y-3">
        {data.top.map((etf) => (
          <div
            key={etf.symbol}
            className="flex items-center justify-between rounded-xl border border-border/40 bg-card px-3 py-3"
          >
            <div>
              <p className="text-[15px] font-semibold text-foreground">{etf.symbol}</p>
              <p className="text-[13px] text-muted-foreground">{etf.name}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[15px] font-medium tabular-nums text-foreground">
                {etf.weight}%
              </p>
              <p className="text-[12px] text-muted-foreground">weight</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <AIAnnotation size="md">{data.aiSuggestion}</AIAnnotation>
      </div>

      <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-border/60 py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        See all {data.count} ETFs
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
