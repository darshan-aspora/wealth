"use client";

import { useState } from "react";
import { X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type ChangeRange = "1M" | "3M" | "6M" | "1Y" | "Max";
type ChangeType = "Percentage" | "Absolute";
const CHANGE_RANGES: ChangeRange[] = ["1M", "3M", "6M", "1Y", "Max"];

/* ------------------------------------------------------------------ */
/*  Types & data                                                       */
/* ------------------------------------------------------------------ */

type Category = "All" | "Stocks" | "ETF" | "Global ETF";
type ValueMode = "Change" | "Value";

interface Holding {
  name: string;
  tag?: "ETF" | "Global ETF";
  qty: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  dayChangePct: number;
  xirr: number;
  category: "Stocks" | "ETF" | "Global ETF";
}

const HOLDINGS: Holding[] = [
  // Stocks (9)
  { name: "Apple Inc.",                  category: "Stocks",  xirr: 22.1, qty: 15,       avgPrice: 178.25, currentPrice: 211.50, currentValue: 3_172, pnl:   499, pnlPct:  18.7, dayChangePct:  1.2  },
  { name: "Microsoft Corporation",       category: "Stocks",  xirr: 10.4, qty: 8,        avgPrice: 385.10, currentPrice: 415.80, currentValue: 3_326, pnl:   245, pnlPct:   7.9, dayChangePct:  0.6  },
  { name: "NVIDIA Corporation",          category: "Stocks",  xirr: 18.9, qty: 5,        avgPrice: 820.50, currentPrice: 875.20, currentValue: 4_376, pnl:   273, pnlPct:   6.7, dayChangePct:  2.1  },
  { name: "Alphabet Inc.",               category: "Stocks",  xirr: 24.3, qty: 12,       avgPrice: 142.80, currentPrice: 172.40, currentValue: 2_068, pnl:   355, pnlPct:  20.7, dayChangePct:  0.9  },
  { name: "Meta Platforms, Inc.",        category: "Stocks",  xirr:  9.6, qty: 3.02584,  avgPrice: 490.20, currentPrice: 528.60, currentValue: 1_599, pnl:   116, pnlPct:   7.8, dayChangePct: -0.4  },
  { name: "Tesla, Inc.",                 category: "Stocks",  xirr:-31.2, qty: 6,        avgPrice: 248.30, currentPrice: 178.90, currentValue: 1_073, pnl:  -416, pnlPct: -27.9, dayChangePct: -3.2  },
  { name: "Amazon.com, Inc.",            category: "Stocks",  xirr: 13.8, qty: 10,       avgPrice: 178.40, currentPrice: 196.80, currentValue: 1_968, pnl:   184, pnlPct:  10.3, dayChangePct:  0.7  },
  { name: "Netflix, Inc.",               category: "Stocks",  xirr: 11.2, qty: 4,        avgPrice: 580.00, currentPrice: 628.40, currentValue: 2_513, pnl:   193, pnlPct:   8.3, dayChangePct:  1.5  },
  { name: "Super Micro Computer, Inc.",  category: "Stocks",  xirr:-18.6, qty: 20,       avgPrice:  42.10, currentPrice:  35.60, currentValue:   712, pnl:  -130, pnlPct: -15.4, dayChangePct: -2.8  },
  // ETFs (5)
  { name: "SPDR S&P 500 ETF Trust",      category: "ETF",    xirr: 20.1, qty: 20,       avgPrice: 445.30, currentPrice: 528.40, currentValue: 10_568, pnl: 1_662, pnlPct:  18.7, dayChangePct:  0.5,  tag: "ETF" },
  { name: "Invesco QQQ Trust",           category: "ETF",    xirr: 14.2, qty: 10,       avgPrice: 425.60, currentPrice: 471.20, currentValue:  4_712, pnl:   456, pnlPct:  10.7, dayChangePct:  0.8,  tag: "ETF" },
  { name: "SPDR Gold Shares",            category: "ETF",    xirr: 12.8, qty: 8,        avgPrice: 184.20, currentPrice: 218.60, currentValue:  1_748, pnl:   275, pnlPct:  18.7, dayChangePct:  0.3,  tag: "ETF" },
  { name: "iShares Core S&P 500 ETF",   category: "ETF",    xirr: 19.4, qty: 15,       avgPrice: 448.10, currentPrice: 527.80, currentValue:  7_917, pnl: 1_195, pnlPct:  17.8, dayChangePct:  0.5,  tag: "ETF" },
  { name: "Vanguard Total Stock Market", category: "ETF",    xirr: 15.6, qty: 12,       avgPrice: 220.40, currentPrice: 248.30, currentValue:  2_979, pnl:   334, pnlPct:  12.7, dayChangePct:  0.4,  tag: "ETF" },
  // Global ETFs (4)
  { name: "iShares MSCI World ETF",              category: "Global ETF", xirr: 11.0, qty: 25, avgPrice:  88.20, currentPrice:  96.40, currentValue: 2_410, pnl:  205, pnlPct:   9.3, dayChangePct:  0.3, tag: "Global ETF" },
  { name: "Vanguard FTSE All-World ETF",         category: "Global ETF", xirr: 10.2, qty: 18, avgPrice:  98.50, currentPrice: 106.80, currentValue: 1_922, pnl:  149, pnlPct:   8.4, dayChangePct:  0.2, tag: "Global ETF" },
  { name: "iShares MSCI Emerging Markets ETF",   category: "Global ETF", xirr: -4.1, qty: 30, avgPrice:  40.10, currentPrice:  38.60, currentValue: 1_158, pnl:  -45, pnlPct:  -3.7, dayChangePct: -0.6, tag: "Global ETF" },
  { name: "SPDR MSCI ACWI ex-US ETF",            category: "Global ETF", xirr:  9.8, qty: 22, avgPrice:  82.30, currentPrice:  89.10, currentValue: 1_960, pnl:  149, pnlPct:   8.3, dayChangePct:  0.4, tag: "Global ETF" },
];

const CATEGORIES: Category[] = ["All", "Stocks", "ETF", "Global ETF"];


const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function HoldingsTab() {
  const [category, setCategory] = useState<Category>("All");
  const [valueMode, setValueMode] = useState<ValueMode>("Value");
  const [advisoryDismissed, setAdvisoryDismissed] = useState(false);
  const [pnlExpanded, setPnlExpanded] = useState(false);
  const [changeSheetOpen, setChangeSheetOpen] = useState(false);
  const [changeRange, setChangeRange] = useState<ChangeRange>("Max");
  const [changeType, setChangeType] = useState<ChangeType>("Percentage");

  const filtered =
    category === "All" ? HOLDINGS : HOLDINGS.filter((h) => h.category === category);

  const heroInvested = filtered.reduce((s, h) => s + h.qty * h.avgPrice, 0);
  const heroCurrentValue = filtered.reduce((s, h) => s + h.currentValue, 0);
  const heroPnl = heroCurrentValue - heroInvested;
  const heroPnlPct = heroInvested > 0 ? (heroPnl / heroInvested) * 100 : 0;
  const heroTodayPnl = filtered.reduce((s, h) => s + h.currentValue * (h.dayChangePct / 100), 0);
  const heroTodayPnlPct = heroCurrentValue > 0 ? (heroTodayPnl / heroCurrentValue) * 100 : 0;
  // Unrealised = open positions P&L (pnl from holdings with positive currentValue)
  const heroUnrealisedPnl = filtered.filter((h) => h.pnl > 0).reduce((s, h) => s + h.pnl, 0);
  const heroUnrealisedPct = heroInvested > 0 ? (heroUnrealisedPnl / heroInvested) * 100 : 0;
  const heroRealisedPnl = heroPnl - heroUnrealisedPnl;
  const heroRealisedPct = heroInvested > 0 ? (heroRealisedPnl / heroInvested) * 100 : 0;
  // Weighted average XIRR by current value
  const heroXirr = heroCurrentValue > 0
    ? filtered.reduce((s, h) => s + h.xirr * h.currentValue, 0) / heroCurrentValue
    : 0;

  return (
    <div className="pb-24">

      {/* Advisory banner — top */}
      {!advisoryDismissed && (
        <div className="mx-5 mb-4 flex items-center justify-between rounded-xl bg-[#F2F2F2] px-4 py-3">
          <p className="text-[14px] text-muted-foreground">Advisory holding won&apos;t be visible here</p>
          <button onClick={() => setAdvisoryDismissed(true)} className="ml-3 shrink-0 active:opacity-60">
            <X size={17} className="text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Segmented filter */}
      <div className="px-5 mb-5">
        <div className="flex rounded-2xl bg-[#F0F3FF] p-1 gap-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPnlExpanded(false); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-[16px] font-semibold transition-all whitespace-nowrap",
                category === cat
                  ? "bg-white text-foreground shadow-sm"
                  : "text-[#41484B]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hero card — white card stacked above gray Today's P&L strip */}
      <div className="mx-5 mb-5">
        {/* Front card */}
        <div className="rounded-2xl border border-border/40 bg-white px-4 py-4 shadow-sm">
          {/* Invested + Current value */}
          <div className="flex gap-10 mb-3.5">
            <div>
              <p className="text-[16px] text-muted-foreground mb-1">Invested</p>
              <p className="text-[18px] font-bold text-foreground">${fmtMoney(heroInvested)}</p>
            </div>
            <div>
              <p className="text-[16px] text-muted-foreground mb-1">Current value</p>
              <p className="text-[18px] font-bold text-foreground">${fmtMoney(heroCurrentValue)}</p>
            </div>
          </div>

          <div className="h-px bg-border/40 mb-3.5" />

          {/* P&L row — tappable to expand */}
          <button
            className="w-full flex items-center justify-between mb-2.5 active:opacity-70 transition-opacity"
            onClick={() => setPnlExpanded((v) => !v)}
          >
            <span className="text-[16px] text-muted-foreground">P&L</span>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[16px] font-semibold", heroPnl >= 0 ? "text-[#10B981]" : "text-red-500")}>
                {heroPnl >= 0 ? "+" : ""}${fmtMoney(Math.abs(heroPnl))} ({heroPnlPct >= 0 ? "+" : ""}{heroPnlPct.toFixed(1)}%)
              </span>
              <ChevronDown
                size={16}
                className={cn("text-[#10B981] transition-transform duration-200", pnlExpanded && "rotate-180")}
              />
            </div>
          </button>

          {/* Expanded: Unrealised + Realised */}
          {pnlExpanded && (
            <>
              <div className="flex items-center justify-between mb-2.5 pl-2">
                <span className="text-[16px] text-muted-foreground">Unrealised P&L</span>
                <span className={cn("text-[16px] font-semibold", heroUnrealisedPnl >= 0 ? "text-[#10B981]" : "text-red-500")}>
                  {heroUnrealisedPnl >= 0 ? "+" : ""}${fmtMoney(Math.abs(heroUnrealisedPnl))} ({heroUnrealisedPct >= 0 ? "+" : ""}{heroUnrealisedPct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between mb-2.5 pl-2">
                <span className="text-[16px] text-muted-foreground">Realised P&L</span>
                <span className={cn("text-[16px] font-semibold", heroRealisedPnl >= 0 ? "text-[#10B981]" : "text-red-500")}>
                  {heroRealisedPnl >= 0 ? "+" : ""}${fmtMoney(Math.abs(heroRealisedPnl))} ({heroRealisedPct >= 0 ? "+" : ""}{heroRealisedPct.toFixed(1)}%)
                </span>
              </div>
            </>
          )}

          {/* Estimated XIRR row */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-muted-foreground">Estimated XIRR</span>
            <span className={cn("text-[16px] font-semibold", heroXirr >= 0 ? "text-[#10B981]" : "text-red-500")}>
              {heroXirr >= 0 ? "+" : ""}{heroXirr.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Gray strip — Today's P&L, peeks below the white card */}
        <div className="bg-[#F2F3F7] rounded-b-2xl px-4 pt-2 pb-2.5 -mt-3">
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-muted-foreground">Today&apos;s P&L</span>
            <span className={cn("text-[16px] font-semibold", heroTodayPnl >= 0 ? "text-[#10B981]" : "text-red-500")}>
                {heroTodayPnl >= 0 ? "+" : ""}${fmtMoney(Math.abs(heroTodayPnl))} ({heroTodayPnlPct >= 0 ? "+" : ""}{heroTodayPnlPct.toFixed(1)}%)
              </span>
          </div>
        </div>
      </div>

      {/* Holdings count + Change/Value toggle */}
      <div className="mx-5 mb-3 flex items-center justify-between">
        <p className="text-[16px] font-semibold text-foreground">{filtered.length} Holdings</p>
        <div className="flex items-center gap-2">
          {/* Settings button — only shown when "Change" is active */}
          {valueMode === "Change" && (
            <button
              onClick={() => setChangeSheetOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F5F5F5] active:opacity-60 transition-opacity"
            >
              <SlidersHorizontal size={16} className="text-foreground" />
            </button>
          )}
          <div className="flex rounded-full bg-[#F5F5F5] p-0.5">
            {(["Change", "Value"] as ValueMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setValueMode(mode)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[16px] font-semibold transition-all",
                  valueMode === mode ? "bg-black text-white" : "text-muted-foreground"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Change data bottom sheet */}
      <Sheet open={changeSheetOpen} onOpenChange={setChangeSheetOpen}>
        <SheetContent side="bottom" className="max-w-[430px] mx-auto rounded-t-2xl px-5 pb-10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[18px] font-bold text-foreground text-left pl-8">Change data</SheetTitle>
          </SheetHeader>

          {/* Range row */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[16px] text-muted-foreground">Range</span>
            <div className="flex items-center gap-1.5">
              {CHANGE_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setChangeRange(r)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[16px] font-semibold border transition-all",
                    changeRange === r
                      ? "bg-foreground text-background border-foreground"
                      : "border-border/60 text-foreground bg-transparent"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Change type row */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-muted-foreground">Change</span>
            <div className="flex rounded-xl border border-border/50 overflow-hidden">
              {(["Percentage", "Absolute"] as ChangeType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setChangeType(t)}
                  className={cn(
                    "px-4 py-2 text-[16px] font-semibold transition-all",
                    changeType === t
                      ? "bg-foreground text-background"
                      : "text-foreground bg-background"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Holdings list */}
      <div className="px-5 space-y-2.5">
        {filtered.map((h) => {
          const isGain = h.pnl >= 0;
          const sign = isGain ? "+" : "-";
          const absPnl = `${sign}$${fmtInt(Math.abs(h.pnl))}`;
          const pctPnl = `${sign}${Math.abs(h.pnlPct).toFixed(1)}%`;

          const rightTop =
            valueMode === "Value"
              ? `$${fmtInt(h.currentValue)}`
              : changeType === "Percentage"
              ? pctPnl
              : absPnl;

          const rightSub = absPnl;

          return (
            <div
              key={h.name}
              className="rounded-2xl border border-[#E9E9E9] bg-white px-5 py-5 active:opacity-75 transition-opacity"
            >
              {/* Top row: name + current value */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <p className="text-[16px] font-bold text-foreground leading-snug truncate">{h.name}</p>
                  {h.tag && (
                    <span className="shrink-0 rounded-md bg-[#E3E3E3] px-1.5 py-0.5 text-[12px] font-bold text-foreground">
                      {h.tag}
                    </span>
                  )}
                </div>
                <p className="text-[20px] font-bold text-foreground leading-tight shrink-0">{rightTop}</p>
              </div>

              {/* Bottom row: labeled columns + P&L */}
              <div className="flex items-center justify-between gap-2 text-[14px]">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[12px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Qty</span>
                    <span className="font-normal text-foreground">{h.qty % 1 === 0 ? h.qty : h.qty.toFixed(5).replace(/\.?0+$/, "")}</span>
                  </div>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="flex flex-col">
                    <span className="text-[12px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Avg</span>
                    <span className="font-normal text-foreground">${h.avgPrice}</span>
                  </div>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="flex flex-col">
                    <span className="text-[12px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">LTP</span>
                    <span className="font-normal text-foreground">
                      ${h.currentPrice}
                      <span className="ml-1 text-[14px] font-medium text-muted-foreground">
                        ({h.dayChangePct > 0 ? "+" : ""}{h.dayChangePct.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                </div>
                <p className="text-[16px] font-bold tabular-nums shrink-0 text-foreground">{rightSub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
