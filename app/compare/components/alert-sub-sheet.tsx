"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ALL_TICKERS } from "@/components/ticker";

interface AlertSubSheetProps {
  symbol: string | null;
  onOpenChange: (open: boolean) => void;
  onAlertSet: (message: string) => void;
}

type AlertMode = "price" | "percent";

export function AlertSubSheet({ symbol, onOpenChange, onAlertSet }: AlertSubSheetProps) {
  const [mode, setMode] = useState<AlertMode>("price");
  const [priceValue, setPriceValue] = useState("");
  const [selectedPercent, setSelectedPercent] = useState<number | null>(null);

  const ticker = symbol ? ALL_TICKERS.find((t) => t.symbol === symbol) : null;

  // Reset when symbol changes
  useEffect(() => {
    if (symbol) {
      setMode("price");
      setPriceValue("");
      setSelectedPercent(null);
    }
  }, [symbol]);

  const percentChips = [-10, -5, -2.5, 2.5, 5, 10];

  const canSubmit =
    mode === "price" ? priceValue !== "" && Number(priceValue) > 0 : selectedPercent !== null;

  const handleSubmit = () => {
    if (!symbol || !canSubmit) return;
    const message =
      mode === "price"
        ? `Alert set. We'll tell you when ${symbol} crosses ${Number(priceValue).toFixed(2)}.`
        : `Alert set. We'll tell you when ${symbol} moves by ${selectedPercent! > 0 ? "+" : ""}${selectedPercent}%.`;
    onAlertSet(message);
    onOpenChange(false);
  };

  return (
    <Sheet open={Boolean(symbol)} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-3xl border-t-0 px-5 pb-8 pt-5"
      >
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="text-[20px] font-bold">Set alert for {symbol}</SheetTitle>
          <SheetDescription className="text-[14px] text-muted-foreground">
            {ticker ? `Current price ${ticker.price.toFixed(2)}` : "We'll notify you when it triggers."}
          </SheetDescription>
        </SheetHeader>

        {/* Mode toggle */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("price")}
            className={cn(
              "rounded-lg py-2.5 text-[14px] font-semibold transition-colors",
              mode === "price" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            Price
          </button>
          <button
            type="button"
            onClick={() => setMode("percent")}
            className={cn(
              "rounded-lg py-2.5 text-[14px] font-semibold transition-colors",
              mode === "percent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            % move
          </button>
        </div>

        {/* Input body */}
        <div className="mt-6">
          {mode === "price" ? (
            <div className="flex flex-col items-center">
              <Input
                type="number"
                inputMode="decimal"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                placeholder={ticker ? ticker.price.toFixed(2) : "0.00"}
                autoFocus
                className="h-auto border-0 bg-transparent text-center text-[36px] font-bold tabular-nums text-foreground shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <Separator className="w-48 my-2 bg-border/50" />
              <p className="text-center text-[13px] text-muted-foreground/60">
                Alert when price crosses this level
              </p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-2">
                {percentChips.map((v) => {
                  const isActive = selectedPercent === v;
                  const isPositive = v > 0;
                  return (
                    <Badge
                      key={v}
                      variant="outline"
                      onClick={() => setSelectedPercent(v)}
                      className={cn(
                        "justify-center cursor-pointer rounded-xl py-3 text-[15px] font-bold tabular-nums transition-all border",
                        isActive
                          ? isPositive
                            ? "border-[hsl(var(--gain))]/30 bg-[hsl(var(--gain))]/10 text-[hsl(var(--gain))]"
                            : "border-[hsl(var(--loss))]/30 bg-[hsl(var(--loss))]/10 text-[hsl(var(--loss))]"
                          : "border-transparent bg-muted/60 text-foreground/70",
                      )}
                    >
                      {v > 0 ? "+" : ""}
                      {v}%
                    </Badge>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-[13px] text-muted-foreground/60">
                Alert when {symbol} moves by this much in a day
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-6 w-full rounded-2xl py-4 text-[16px] font-bold active:scale-[0.98]"
        >
          Set alert
        </Button>
      </SheetContent>
    </Sheet>
  );
}
