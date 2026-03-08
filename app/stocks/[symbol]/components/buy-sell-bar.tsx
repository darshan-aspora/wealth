"use client";

import { cn } from "@/lib/utils";
import { POSITIONS } from "./mock-data";
import { formatPrice } from "@/components/ticker";

interface BuySellBarProps {
  symbol: string;
  onBuy: () => void;
  onSell: () => void;
}

export function BuySellBar({ symbol, onBuy, onSell }: BuySellBarProps) {
  const position = POSITIONS[symbol];
  const buyingPower = 12485.0;

  return (
    <div className="border-t border-border/50 bg-background/80 px-4 pb-1 pt-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Left: Buying power or position */}
        <div className="min-w-0 flex-1">
          {position ? (
            <p className="truncate text-[14px] text-muted-foreground">
              <span className="font-medium text-foreground">{position.shares} shares</span>
              {" · "}
              <span className="font-mono tabular-nums">${formatPrice(position.marketValue)}</span>
            </p>
          ) : (
            <p className="text-[14px] text-muted-foreground">
              Buying Power:{" "}
              <span className="font-mono tabular-nums text-foreground">
                ${buyingPower.toLocaleString("en-US", { minimumFractionDigits: 0 })}
              </span>
            </p>
          )}
        </div>

        {/* Right: Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onSell}
            className={cn(
              "rounded-xl border border-[hsl(var(--loss))]/40 px-5 py-2.5 text-[15px] font-semibold",
              "text-[hsl(var(--loss))] transition-colors active:bg-[hsl(var(--loss))]/10",
            )}
          >
            {position ? "SELL" : "SELL"}
          </button>
          <button
            onClick={onBuy}
            className={cn(
              "rounded-xl bg-[hsl(var(--gain))] px-5 py-2.5 text-[15px] font-semibold text-white",
              "transition-colors active:bg-[hsl(var(--gain))]/90",
            )}
          >
            {position ? "BUY MORE" : "BUY"}
          </button>
        </div>
      </div>
    </div>
  );
}
