"use client";

import { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types & data                                                       */
/* ------------------------------------------------------------------ */

type Category = "All" | "Stocks" | "ETFs" | "Options";
type SortKey = "current" | "invested" | "dayChange" | "xirr";

interface Holding {
  symbol: string;
  name: string;
  qty: number;
  avg: number;
  ltp: number;
  pnl: number;
  pnlPct: number;
  dayChange: number;
  dayChangePct: number;
  category: "Stocks" | "ETFs" | "Options";
  xirr: number;
  logoColor: string;
  strike?: number;
}

const holdingsData: Holding[] = [
  { symbol: "AAPL", name: "Apple Inc.", qty: 15, avg: 178.25, ltp: 192.40, pnl: 212.25, pnlPct: 7.94, dayChange: 28.50, dayChangePct: 0.99, category: "Stocks", xirr: 24.5, logoColor: "bg-neutral-600" },
  { symbol: "MSFT", name: "Microsoft Corp.", qty: 8, avg: 385.10, ltp: 412.85, pnl: 222.00, pnlPct: 7.21, dayChange: 18.40, dayChangePct: 0.56, category: "Stocks", xirr: 19.2, logoColor: "bg-blue-600" },
  { symbol: "NVDA", name: "NVIDIA Corp.", qty: 5, avg: 820.50, ltp: 878.30, pnl: 289.00, pnlPct: 7.04, dayChange: 42.50, dayChangePct: 0.97, category: "Stocks", xirr: 32.1, logoColor: "bg-green-600" },
  { symbol: "GOOGL", name: "Alphabet Inc.", qty: 12, avg: 142.80, ltp: 155.20, pnl: 148.80, pnlPct: 8.68, dayChange: 15.60, dayChangePct: 0.84, category: "Stocks", xirr: 21.8, logoColor: "bg-red-500" },
  { symbol: "VOO", name: "Vanguard S&P 500", qty: 20, avg: 445.30, ltp: 462.10, pnl: 336.00, pnlPct: 3.77, dayChange: 54.00, dayChangePct: 0.59, category: "ETFs", xirr: 14.6, logoColor: "bg-rose-700" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", qty: 10, avg: 425.60, ltp: 445.80, pnl: 202.00, pnlPct: 4.75, dayChange: 32.00, dayChangePct: 0.72, category: "ETFs", xirr: 16.8, logoColor: "bg-indigo-600" },
  { symbol: "TSLA", name: "Tesla Inc.", qty: 6, avg: 248.30, ltp: 231.10, pnl: -103.20, pnlPct: -6.92, dayChange: -22.80, dayChangePct: -1.62, category: "Stocks", xirr: -8.4, logoColor: "bg-red-600" },
  { symbol: "META", name: "Meta Platforms", qty: 7, avg: 490.20, ltp: 512.40, pnl: 155.40, pnlPct: 4.53, dayChange: 19.60, dayChangePct: 0.55, category: "Stocks", xirr: 18.9, logoColor: "bg-blue-500" },
  { symbol: "AAPL 195C", name: "AAPL Mar 28 Call", qty: 3, avg: 4.20, ltp: 5.85, pnl: 4.95, pnlPct: 39.29, dayChange: 1.35, dayChangePct: 8.33, category: "Options", xirr: 142.0, logoColor: "bg-amber-600", strike: 195 },
  { symbol: "SPY 510P", name: "SPY Apr 18 Put", qty: 5, avg: 3.80, ltp: 2.90, pnl: -4.50, pnlPct: -23.68, dayChange: -1.25, dayChangePct: -7.95, category: "Options", xirr: -52.3, logoColor: "bg-violet-600", strike: 510 },
];

const categories: Category[] = ["All", "Stocks", "ETFs", "Options"];
const sortOptions: { key: SortKey; label: string }[] = [
  { key: "xirr", label: "XIRR" },
  { key: "current", label: "Current Value" },
  { key: "invested", label: "Invested Amount" },
  { key: "dayChange", label: "1D Change %" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function HoldingsTab() {
  const [filter, setFilter] = useState<Category>("All");
  const [sortIdx, setSortIdx] = useState(0);
  const sortBy = sortOptions[sortIdx].key;

  const filtered = useMemo(() => {
    let list = filter === "All" ? [...holdingsData] : holdingsData.filter((h) => h.category === filter);

    const getValue = (h: Holding) => {
      switch (sortBy) {
        case "current": return h.ltp * h.qty;
        case "invested": return h.avg * h.qty;
        case "dayChange": return h.dayChangePct;
        case "xirr": return h.xirr;
      }
    };

    list.sort((a, b) => getValue(b) - getValue(a));
    return list;
  }, [filter, sortBy]);

  const totalCurrent = filtered.reduce((s, h) => s + h.ltp * h.qty, 0);
  const totalInvested = filtered.reduce((s, h) => s + h.avg * h.qty, 0);
  const totalDayChange = filtered.reduce((s, h) => s + h.dayChange, 0);
  const totalDayChangePct = totalCurrent > 0 ? (totalDayChange / (totalCurrent - totalDayChange)) * 100 : 0;
  const totalXirr = 18.42;

  return (
    <div className="px-4 pb-6">
      {/* Summary card */}
      <div className="mb-4 rounded-xl border border-border/40 bg-card/60 px-4 py-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[20px] font-bold tabular-nums text-foreground">
            {totalCurrent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <div className={cn("flex items-center gap-1", totalDayChange >= 0 ? "text-gain" : "text-loss")}>
            {totalDayChange >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span className="text-[13px] font-semibold tabular-nums">
              {totalDayChange >= 0 ? "+" : ""}{totalDayChange.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[12px] font-medium tabular-nums">
              ({totalDayChangePct >= 0 ? "+" : ""}{totalDayChangePct.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-4 text-[12px] text-muted-foreground">
          <span>Invested <span className="font-medium tabular-nums text-foreground/80">{totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></span>
          <span>·</span>
          <span>XIRR <span className={cn("font-medium tabular-nums", totalXirr >= 0 ? "text-gain" : "text-loss")}>{totalXirr >= 0 ? "+" : ""}{totalXirr}%</span></span>
        </div>
      </div>

      {/* Filter pills + Sort */}
      <div className="mb-4 flex items-center gap-2">
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                filter === cat
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort flipper */}
        <button
          onClick={() => setSortIdx((i) => (i + 1) % sortOptions.length)}
          className="flex shrink-0 items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-[13px] font-medium text-background transition-colors active:scale-95"
        >
          <ArrowUpDown size={13} />
          {sortOptions[sortIdx].label}
        </button>
      </div>

      {/* Holdings list */}
      <div className="space-y-2">
        {filtered.map((h) => {
          const invested = h.avg * h.qty;
          return (
            <div
              key={h.symbol}
              className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 px-4 py-3.5 active:scale-[0.98] transition-transform"
            >
              {/* Logo */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white",
                  h.logoColor
                )}
              >
                {h.symbol.slice(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground truncate">
                  {h.name}{h.strike ? ` · ${h.strike} Strike` : ""}
                </p>
                <div className="mt-0.5 flex items-center gap-3 text-[12px] text-muted-foreground/60">
                  <span>Avg {h.avg.toFixed(2)}</span>
                  <span>·</span>
                  <span>Inv {invested.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  {h.xirr !== 0 && (
                    <>
                      <span>·</span>
                      <span className={cn(h.xirr >= 0 ? "text-gain/70" : "text-loss/70")}>
                        XIRR {h.xirr > 0 ? "+" : ""}{h.xirr}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Price + P&L */}
              <div className="text-right shrink-0">
                <p className="text-[15px] font-semibold tabular-nums text-foreground">
                  {h.ltp.toFixed(2)}
                </p>
                <div className={cn("flex items-center justify-end gap-0.5", h.pnl >= 0 ? "text-gain" : "text-loss")}>
                  {h.pnl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span className="text-[13px] font-medium tabular-nums">
                    {h.pnl >= 0 ? "+" : ""}{h.pnl.toFixed(2)}
                  </span>
                </div>
                <p className={cn("text-[11px] tabular-nums", h.pnlPct >= 0 ? "text-gain/70" : "text-loss/70")}>
                  {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct.toFixed(2)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-[15px] text-muted-foreground/50">No {filter.toLowerCase()} holdings</p>
        </div>
      )}
    </div>
  );
}
