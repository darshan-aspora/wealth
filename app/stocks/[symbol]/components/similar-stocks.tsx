"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AIAnnotation } from "./ai-annotation";
import { SIMILAR_STOCKS } from "./mock-data";
import { ALL_TICKERS, TickerLogo, formatPrice, formatPercent, isGain, type TickerItem } from "@/components/ticker";

interface SimilarStocksProps {
  symbol: string;
}

export function SimilarStocks({ symbol }: SimilarStocksProps) {
  const similar = SIMILAR_STOCKS[symbol];
  if (!similar) return null;

  const tickers = similar
    .map((s) => ALL_TICKERS.find((t) => t.symbol === s))
    .filter(Boolean) as TickerItem[];

  if (tickers.length === 0) return null;

  return (
    <div className="px-4 py-4">
      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        Similar Stocks
      </h2>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {tickers.map((t) => {
          const gain = isGain(t);
          return (
            <Link
              key={t.symbol}
              href={`/stocks/${t.symbol}`}
              className="flex min-w-[100px] shrink-0 flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-3 transition-colors active:bg-muted/40"
            >
              <TickerLogo ticker={t} size="sm" />
              <span className="text-[14px] font-semibold text-foreground">{t.symbol}</span>
              <span className="font-mono text-[14px] tabular-nums text-foreground">
                ${formatPrice(t.price)}
              </span>
              <span
                className={cn(
                  "font-mono text-[13px] tabular-nums",
                  gain ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]",
                )}
              >
                {formatPercent(t.changePercent)}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-2">
        <AIAnnotation>Based on sector, market cap, and price correlation.</AIAnnotation>
      </div>
    </div>
  );
}
