"use client";

import { POSITIONS } from "./mock-data";
import { formatPrice } from "@/components/ticker";
import { Button } from "@/components/ui/button";

interface BuySellBarProps {
  symbol: string;
  onBuy: () => void;
  onSell: () => void;
}

export function BuySellBar({ symbol, onBuy, onSell }: BuySellBarProps) {
  const position = POSITIONS[symbol];
  const buyingPower = 12485.0;

  return (
    <div className="border-t border-border/50 bg-background/80 px-5 pb-1 pt-2.5 backdrop-blur-xl">
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
          <Button
            variant="outline"
            onClick={onSell}
            className="rounded-xl border-[hsl(var(--loss))]/40 px-5 py-2.5 text-[15px] font-semibold text-[hsl(var(--loss))] hover:bg-[hsl(var(--loss))]/10 active:bg-[hsl(var(--loss))]/10"
          >
            {position ? "SELL" : "SELL"}
          </Button>
          <Button
            onClick={onBuy}
            className="rounded-xl bg-[hsl(var(--gain))] px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-[hsl(var(--gain))]/90 active:bg-[hsl(var(--gain))]/90"
          >
            {position ? "BUY MORE" : "BUY"}
          </Button>
        </div>
      </div>
    </div>
  );
}
