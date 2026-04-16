"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Check, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL_TICKERS, type TickerItem } from "@/components/ticker";
import { getSuggestedSymbols, getPopularSymbols } from "../lib/metrics";

interface AddStockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSymbols: string[];
  onAdd: (symbol: string) => void;
}

function StockRow({
  ticker,
  inCompare,
  onAdd,
}: {
  ticker: TickerItem;
  inCompare: boolean;
  onAdd: () => void;
}) {
  const gain = ticker.changePercent >= 0;
  return (
    <button
      type="button"
      onClick={inCompare ? undefined : onAdd}
      disabled={inCompare}
      className={cn(
        "w-full flex items-center gap-3 py-3 text-left transition-opacity",
        inCompare ? "opacity-50" : "active:opacity-60",
      )}
    >
      <div className={cn("h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold text-white", ticker.logoColor)}>
        {ticker.logo}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-foreground truncate">{ticker.symbol}</span>
          <span className="text-[13px] text-muted-foreground truncate">{ticker.name}</span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-[13px] tabular-nums text-muted-foreground">
            {ticker.price.toFixed(2)}
          </span>
          <span
            className={cn(
              "text-[13px] font-semibold tabular-nums",
              gain ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]",
            )}
          >
            {gain ? "+" : ""}
            {ticker.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          inCompare ? "bg-muted/40 text-muted-foreground" : "bg-foreground text-background",
        )}
      >
        {inCompare ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
      </div>
    </button>
  );
}

export function AddStockSheet({ open, onOpenChange, activeSymbols, onAdd }: AddStockSheetProps) {
  const [query, setQuery] = useState("");
  const activeSet = useMemo(() => new Set(activeSymbols.map((s) => s.toUpperCase())), [activeSymbols]);

  const q = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!q) return [];
    return ALL_TICKERS.filter((t) => {
      if (t.type !== "Equity" && t.type !== "ETF") return false;
      return t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
    }).slice(0, 12);
  }, [q]);

  const suggestedSymbols = useMemo(() => getSuggestedSymbols(activeSymbols, 6), [activeSymbols]);
  const suggested = useMemo(
    () =>
      suggestedSymbols
        .map((s) => ALL_TICKERS.find((t) => t.symbol === s))
        .filter((t): t is TickerItem => Boolean(t)),
    [suggestedSymbols],
  );

  const popular = useMemo(() => {
    const exclude = [...activeSymbols, ...suggestedSymbols];
    return getPopularSymbols(exclude, 8)
      .map((s) => ALL_TICKERS.find((t) => t.symbol === s))
      .filter((t): t is TickerItem => Boolean(t));
  }, [activeSymbols, suggestedSymbols]);

  const atSoftCap = activeSymbols.length >= 4;

  const handleAdd = (symbol: string) => {
    onAdd(symbol);
    // Don't close — let them batch-add
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] h-[85vh] rounded-t-3xl border-t-0 px-0 pb-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-1 pb-3 text-left">
          <SheetTitle className="text-[20px] font-bold">Add to compare</SheetTitle>
        </SheetHeader>

        {/* Search input */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search
              size={17}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search stocks or ETFs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 rounded-xl border-0 bg-muted pl-10 pr-10 text-[15px] placeholder:text-muted-foreground/60 focus-visible:ring-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-muted-foreground active:scale-90 transition-transform"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {atSoftCap && (
            <p className="mt-2.5 text-[13px] text-muted-foreground">
              Comparisons work best with 2–4 stocks. Adding more keeps working — you may just need to scroll.
            </p>
          )}
        </div>

        {/* Results */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
          {q ? (
            searchResults.length > 0 ? (
              <div>
                <SectionLabel>Results</SectionLabel>
                {searchResults.map((t) => (
                  <StockRow
                    key={t.symbol}
                    ticker={t}
                    inCompare={activeSet.has(t.symbol)}
                    onAdd={() => handleAdd(t.symbol)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <p className="text-[15px] font-semibold text-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[14px] text-muted-foreground max-w-[260px]">
                  We support US-listed stocks and ETFs — try a symbol or company name.
                </p>
              </div>
            )
          ) : (
            <>
              {activeSymbols.length > 0 && (
                <div className="mb-4">
                  <SectionLabel>Already comparing</SectionLabel>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeSymbols.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[13px] font-semibold text-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {suggested.length > 0 && (
                <div>
                  <SectionLabel>Suggested based on your picks</SectionLabel>
                  {suggested.map((t) => (
                    <StockRow
                      key={t.symbol}
                      ticker={t}
                      inCompare={activeSet.has(t.symbol)}
                      onAdd={() => handleAdd(t.symbol)}
                    />
                  ))}
                </div>
              )}

              <div className="mt-4">
                <SectionLabel>Popular</SectionLabel>
                {popular.map((t) => (
                  <StockRow
                    key={t.symbol}
                    ticker={t}
                    inCompare={activeSet.has(t.symbol)}
                    onAdd={() => handleAdd(t.symbol)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/60 pb-1">
      {children}
    </p>
  );
}
