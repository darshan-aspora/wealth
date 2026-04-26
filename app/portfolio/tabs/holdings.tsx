"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, SlidersHorizontal, TrendingUp, Globe, BarChart2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type ChangeRange = "1D" | "1M" | "3M" | "6M" | "1Y" | "Max";
const CHANGE_RANGES: ChangeRange[] = ["1D", "1M", "3M", "6M", "1Y", "Max"];

/* ------------------------------------------------------------------ */
/*  Types & data                                                       */
/* ------------------------------------------------------------------ */

type Category = "All" | "Stocks" | "ETF" | "Global ETF";
type ValueMode = "Change" | "Value";

interface Transaction {
  date: string;          // "DD MMM YYYY"
  qty: number;
  price: number;
  side: "buy" | "sell";
}

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
  transactions: Transaction[];
}

export type { Holding, Transaction };
export const HOLDINGS: Holding[] = [
  // Stocks (9)
  {
    name: "Apple Inc.", category: "Stocks", xirr: 22.1, qty: 15, avgPrice: 178.25,
    currentPrice: 211.50, currentValue: 3_172, pnl: 499, pnlPct: 18.7, dayChangePct: 1.2,
    transactions: [
      { date: "14 Jun 2023", qty: 12,  price: 168.50, side: "buy"  },
      { date: "05 Jan 2024", qty: 4,   price: 185.20, side: "sell" },
      { date: "12 Apr 2024", qty: 3.5, price: 172.40, side: "buy"  },
      { date: "08 Jul 2024", qty: 3.5, price: 190.00, side: "buy"  },
    ],
  },
  {
    name: "Microsoft Corporation", category: "Stocks", xirr: 10.4, qty: 8, avgPrice: 385.10,
    currentPrice: 415.80, currentValue: 3_326, pnl: 245, pnlPct: 7.9, dayChangePct: 0.6,
    transactions: [
      { date: "03 Mar 2024", qty: 5,   price: 378.20, side: "buy"  },
      { date: "22 Aug 2024", qty: 2,   price: 408.10, side: "sell" },
      { date: "15 Nov 2024", qty: 5,   price: 396.50, side: "buy"  },
    ],
  },
  {
    name: "NVIDIA Corporation", category: "Stocks", xirr: 18.9, qty: 5, avgPrice: 820.50,
    currentPrice: 875.20, currentValue: 4_376, pnl: 273, pnlPct: 6.7, dayChangePct: 2.1,
    transactions: [
      { date: "20 Feb 2024", qty: 4,    price: 790.00, side: "buy"  },
      { date: "14 May 2024", qty: 1,    price: 850.00, side: "sell" },
      { date: "10 Sep 2024", qty: 2,    price: 862.00, side: "buy"  },
    ],
  },
  {
    name: "Alphabet Inc.", category: "Stocks", xirr: 24.3, qty: 12, avgPrice: 142.80,
    currentPrice: 172.40, currentValue: 2_068, pnl: 355, pnlPct: 20.7, dayChangePct: 0.9,
    transactions: [
      { date: "05 Jun 2023", qty: 8,    price: 135.60, side: "buy"  },
      { date: "18 Jan 2024", qty: 4,    price: 157.20, side: "buy"  },
    ],
  },
  {
    name: "Meta Platforms, Inc.", category: "Stocks", xirr: 9.6, qty: 3.02584, avgPrice: 490.20,
    currentPrice: 528.60, currentValue: 1_599, pnl: 116, pnlPct: 7.8, dayChangePct: -0.4,
    transactions: [
      { date: "10 Feb 2024", qty: 1.52584, price: 487.30, side: "buy"  },
      { date: "22 Apr 2024", qty: 1.50000, price: 492.80, side: "buy"  },
    ],
  },
  {
    name: "Tesla, Inc.", category: "Stocks", xirr: -31.2, qty: 6, avgPrice: 248.30,
    currentPrice: 178.90, currentValue: 1_073, pnl: -416, pnlPct: -27.9, dayChangePct: -3.2,
    transactions: [
      { date: "14 Aug 2023", qty: 8,    price: 240.00, side: "buy"  },
      { date: "12 Nov 2023", qty: 2,    price: 254.50, side: "sell" },
      { date: "02 Jan 2024", qty: 2,    price: 264.90, side: "buy"  },
      { date: "18 Mar 2024", qty: 1,    price: 218.40, side: "sell" },
      { date: "07 Jun 2024", qty: 0.75, price: 195.20, side: "buy"  },
      { date: "29 Aug 2024", qty: 0.75, price: 205.80, side: "sell" },
      { date: "05 Nov 2024", qty: 1.25, price: 212.50, side: "buy"  },
    ],
  },
  {
    name: "Amazon.com, Inc.", category: "Stocks", xirr: 13.8, qty: 10, avgPrice: 178.40,
    currentPrice: 196.80, currentValue: 1_968, pnl: 184, pnlPct: 10.3, dayChangePct: 0.7,
    transactions: [
      { date: "30 Oct 2023", qty: 6,    price: 172.10, side: "buy"  },
      { date: "11 Mar 2024", qty: 4,    price: 187.00, side: "buy"  },
    ],
  },
  {
    name: "Netflix, Inc.", category: "Stocks", xirr: 11.2, qty: 4, avgPrice: 580.00,
    currentPrice: 628.40, currentValue: 2_513, pnl: 193, pnlPct: 8.3, dayChangePct: 1.5,
    transactions: [
      { date: "19 May 2024", qty: 6,    price: 575.00, side: "buy"  },
      { date: "02 Aug 2024", qty: 2,    price: 620.00, side: "sell" },
    ],
  },
  {
    name: "Super Micro Computer, Inc.", category: "Stocks", xirr: -18.6, qty: 20, avgPrice: 42.10,
    currentPrice: 35.60, currentValue: 712, pnl: -130, pnlPct: -15.4, dayChangePct: -2.8,
    transactions: [
      { date: "19 Sep 2022", qty: 15,   price: 38.60, side: "buy"  },
      { date: "04 Jan 2023", qty: 5,    price: 52.40, side: "sell" },
      { date: "07 Apr 2023", qty: 12,   price: 44.50, side: "buy"  },
      { date: "11 Oct 2023", qty: 2,    price: 29.80, side: "sell" },
    ],
  },
  // ETFs (5)
  {
    name: "SPDR S&P 500 ETF Trust", category: "ETF", tag: "ETF", xirr: 20.1, qty: 20,
    avgPrice: 445.30, currentPrice: 528.40, currentValue: 10_568, pnl: 1_662, pnlPct: 18.7, dayChangePct: 0.5,
    transactions: [
      { date: "10 Jan 2023", qty: 12,   price: 428.00, side: "buy"  },
      { date: "25 Jun 2023", qty: 5,    price: 462.00, side: "buy"  },
      { date: "14 Oct 2023", qty: 2,    price: 418.50, side: "sell" },
      { date: "08 Mar 2024", qty: 5,    price: 487.20, side: "buy"  },
    ],
  },
  {
    name: "Invesco QQQ Trust", category: "ETF", tag: "ETF", xirr: 14.2, qty: 10,
    avgPrice: 425.60, currentPrice: 471.20, currentValue: 4_712, pnl: 456, pnlPct: 10.7, dayChangePct: 0.8,
    transactions: [
      { date: "14 Feb 2024", qty: 10,   price: 425.60, side: "buy"  },
    ],
  },
  {
    name: "SPDR Gold Shares", category: "ETF", tag: "ETF", xirr: 12.8, qty: 8,
    avgPrice: 184.20, currentPrice: 218.60, currentValue: 1_748, pnl: 275, pnlPct: 18.7, dayChangePct: 0.3,
    transactions: [
      { date: "08 Aug 2023", qty: 5,    price: 178.00, side: "buy"  },
      { date: "03 Dec 2023", qty: 3,    price: 194.60, side: "buy"  },
    ],
  },
  {
    name: "iShares Core S&P 500 ETF", category: "ETF", tag: "ETF", xirr: 19.4, qty: 15,
    avgPrice: 448.10, currentPrice: 527.80, currentValue: 7_917, pnl: 1_195, pnlPct: 17.8, dayChangePct: 0.5,
    transactions: [
      { date: "22 Mar 2023", qty: 10,   price: 435.20, side: "buy"  },
      { date: "17 Jul 2024", qty: 5,    price: 474.00, side: "buy"  },
    ],
  },
  {
    name: "Vanguard Total Stock Market", category: "ETF", tag: "ETF", xirr: 15.6, qty: 12,
    avgPrice: 220.40, currentPrice: 248.30, currentValue: 2_979, pnl: 334, pnlPct: 12.7, dayChangePct: 0.4,
    transactions: [
      { date: "01 Nov 2023", qty: 15,   price: 218.50, side: "buy"  },
      { date: "09 Apr 2024", qty: 3,    price: 238.10, side: "sell" },
    ],
  },
  // Global ETFs (4)
  {
    name: "iShares MSCI World ETF", category: "Global ETF", tag: "Global ETF", xirr: 11.0, qty: 25,
    avgPrice: 88.20, currentPrice: 96.40, currentValue: 2_410, pnl: 205, pnlPct: 9.3, dayChangePct: 0.3,
    transactions: [
      { date: "09 Sep 2023", qty: 15,   price: 85.40, side: "buy"  },
      { date: "14 Feb 2024", qty: 10,   price: 92.30, side: "buy"  },
    ],
  },
  {
    name: "Vanguard FTSE All-World ETF", category: "Global ETF", tag: "Global ETF", xirr: 10.2, qty: 18,
    avgPrice: 98.50, currentPrice: 106.80, currentValue: 1_922, pnl: 149, pnlPct: 8.4, dayChangePct: 0.2,
    transactions: [
      { date: "27 Apr 2024", qty: 20,   price: 97.80, side: "buy"  },
      { date: "15 Aug 2024", qty: 2,    price: 104.20, side: "sell" },
    ],
  },
  {
    name: "iShares MSCI Emerging Markets ETF", category: "Global ETF", tag: "Global ETF", xirr: -4.1, qty: 30,
    avgPrice: 40.10, currentPrice: 38.60, currentValue: 1_158, pnl: -45, pnlPct: -3.7, dayChangePct: -0.6,
    transactions: [
      { date: "12 Jun 2023", qty: 20,   price: 41.20, side: "buy"  },
      { date: "05 Jan 2024", qty: 10,   price: 37.90, side: "buy"  },
    ],
  },
  {
    name: "SPDR MSCI ACWI ex-US ETF", category: "Global ETF", tag: "Global ETF", xirr: 9.8, qty: 22,
    avgPrice: 82.30, currentPrice: 89.10, currentValue: 1_960, pnl: 149, pnlPct: 8.3, dayChangePct: 0.4,
    transactions: [
      { date: "18 Oct 2023", qty: 22,   price: 82.30, side: "buy"  },
    ],
  },
];

const CATEGORIES: Category[] = ["All", "Stocks", "ETF", "Global ETF"];


const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Main tab                                                           */
/* ------------------------------------------------------------------ */

export function HoldingsTab({ empty }: { empty?: boolean }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("All");
  const [valueMode, setValueMode] = useState<ValueMode>("Value");
  const [advisoryDismissed, setAdvisoryDismissed] = useState(false);
  const [changeSheetOpen, setChangeSheetOpen] = useState(false);
  const [changeRange, setChangeRange] = useState<ChangeRange>("Max");

  if (empty) {
    const categories = [
      {
        label: "US Stocks",
        sub: "NYSE & NASDAQ",
        tickers: ["AAPL", "TSLA", "NVDA", "MSFT"],
        icon: TrendingUp,
      },
      {
        label: "ETFs",
        sub: "S&P 500, Sector funds",
        tickers: ["SPY", "QQQ", "VTI", "IVV"],
        icon: BarChart2,
      },
      {
        label: "Global ETFs",
        sub: "Europe, Asia & Emerging",
        tickers: ["ACWI", "VEA", "EEM", "VXUS"],
        icon: Globe,
      },
    ];
    return (
      <div className="pb-24 px-5 pt-5">
        <p className="text-[22px] font-bold text-foreground mb-1">Build your portfolio</p>
        <p className="text-[14px] text-muted-foreground mb-5">Choose what you want to invest in</p>
        <div className="space-y-3">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.label}
                onClick={() => router.push("/home-v3")}
                className="w-full rounded-3xl border border-border/40 bg-background px-5 py-5 text-left active:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <CatIcon size={17} className="text-foreground" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-foreground">{cat.label}</p>
                      <p className="text-[12px] text-muted-foreground">{cat.sub}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground/40 text-xl">›</span>
                </div>
                <div className="flex gap-2">
                  {cat.tickers.map((t) => (
                    <span key={t} className="rounded-lg bg-muted px-2.5 py-1 text-[12px] font-semibold text-muted-foreground">{t}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-muted/40 px-4 py-3">
          <Shield size={13} className="text-muted-foreground shrink-0" />
          <p className="text-[12px] text-muted-foreground">Fractional shares available from $1</p>
        </div>
      </div>
    );
  }

  const filtered =
    category === "All" ? HOLDINGS : HOLDINGS.filter((h) => h.category === category);

  const heroInvested = filtered.reduce((s, h) => s + h.qty * h.avgPrice, 0);
  const heroCurrentValue = filtered.reduce((s, h) => s + h.currentValue, 0);
  const heroPnl = heroCurrentValue - heroInvested;
  const heroPnlPct = heroInvested > 0 ? (heroPnl / heroInvested) * 100 : 0;
  const heroTodayPnl = filtered.reduce((s, h) => s + h.currentValue * (h.dayChangePct / 100), 0);
  const heroTodayPnlPct = heroCurrentValue > 0 ? (heroTodayPnl / heroCurrentValue) * 100 : 0;
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

      {/* Filter chips */}
      <div className="px-5 pt-1 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap shrink-0 transition-colors",
                category === cat
                  ? "bg-foreground text-background"
                  : "border border-border/50 text-muted-foreground"
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

          {/* P&L row */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[16px] text-muted-foreground">P&L</span>
            <span className={cn("text-[16px] font-semibold", heroPnl >= 0 ? "text-[#10B981]" : "text-red-500")}>
              {heroPnl >= 0 ? "+" : ""}${fmtMoney(Math.abs(heroPnl))} ({heroPnlPct >= 0 ? "+" : ""}{heroPnlPct.toFixed(1)}%)
            </span>
          </div>

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
        <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[85dvh] flex flex-col inset-x-0 mx-auto max-w-[430px]">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="px-5 pt-2 pb-4 border-b border-border/40 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[18px] font-bold text-foreground leading-tight">Change data</p>
                <p className="text-[14px] text-muted-foreground mt-1">Select a time range for the % change shown on each holding</p>
              </div>
              <button onClick={() => setChangeSheetOpen(false)} className="rounded-full p-1 -mr-1 -mt-0.5 active:bg-muted/50 shrink-0">
                <X size={20} className="text-foreground" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-6">
            <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Range</p>
            <div className="grid grid-cols-3 gap-2.5">
              {CHANGE_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setChangeRange(r)}
                  className={cn(
                    "py-3.5 rounded-2xl text-[16px] font-semibold border transition-all",
                    changeRange === r
                      ? "bg-foreground text-background border-foreground"
                      : "border-border/50 text-foreground bg-white"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Holdings list */}
      <div className="px-5 divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40">
        {filtered.map((h) => {
          const isGain = h.pnl >= 0;
          const sign = isGain ? "+" : "-";
          const absPnl = `${sign}$${fmtInt(Math.abs(h.pnl))}`;
          const pctPnl = `${sign}${Math.abs(h.pnlPct).toFixed(1)}%`;

          const rightTop =
            valueMode === "Value"
              ? `$${fmtInt(h.currentValue)}`
              : pctPnl;

          const rightSub = absPnl;

          return (
            <button
              key={h.name}
              onClick={() => router.push(`/holding-detail/${encodeURIComponent(h.name)}`)}
              className="w-full text-left py-4 active:opacity-75 transition-opacity"
            >
              {/* Top row: name + current value */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <p className="text-[16px] font-bold text-foreground leading-snug truncate">{h.name}</p>
                  {h.tag && (
                    <span className="shrink-0 rounded-md bg-[#E3E3E3] px-1.5 py-0.5 text-[12px] font-bold text-foreground">
                      {h.tag}
                    </span>
                  )}
                </div>
                <p className="text-[18px] font-bold text-foreground leading-tight shrink-0">{rightTop}</p>
              </div>

              {/* Bottom row: labeled columns + P&L */}
              <div className="flex items-center justify-between gap-2 text-[14px]">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Qty</span>
                    <span className="font-normal text-foreground">{h.qty % 1 === 0 ? h.qty : h.qty.toFixed(5).replace(/\.?0+$/, "")}</span>
                  </div>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Avg</span>
                    <span className="font-normal text-foreground">${h.avgPrice}</span>
                  </div>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">LTP</span>
                    <span className="font-normal text-foreground">
                      ${h.currentPrice}
                      <span className="ml-1 text-[13px] font-medium text-muted-foreground">
                        ({h.dayChangePct > 0 ? "+" : ""}{h.dayChangePct.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                </div>
                <p className="text-[15px] font-bold tabular-nums shrink-0 text-foreground">{rightSub}</p>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
