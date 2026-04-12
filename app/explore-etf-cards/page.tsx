"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

interface ETF {
  name: string;
  symbol: string;
  return1y: number;
  return3y: number;
  return5y: number;
  returnPeriod: "1Y" | "3Y" | "5Y";
  aum: string;
  expenseRatio: number;
}

const etfs: ETF[] = [
  { name: "Vanguard S&P 500", symbol: "VOO", return1y: 12.4, return3y: 10.8, return5y: 14.2, returnPeriod: "3Y", aum: "892B", expenseRatio: 0.03 },
  { name: "Invesco QQQ Trust", symbol: "QQQ", return1y: 18.6, return3y: 14.2, return5y: 19.8, returnPeriod: "3Y", aum: "252B", expenseRatio: 0.20 },
  { name: "Vanguard Total Stock", symbol: "VTI", return1y: 11.8, return3y: 9.6, return5y: 13.4, returnPeriod: "3Y", aum: "384B", expenseRatio: 0.03 },
  { name: "iShares Core S&P 500", symbol: "IVV", return1y: 12.3, return3y: 10.7, return5y: 14.1, returnPeriod: "3Y", aum: "478B", expenseRatio: 0.03 },
  { name: "SPDR S&P 500", symbol: "SPY", return1y: 12.2, return3y: 10.6, return5y: 14.0, returnPeriod: "3Y", aum: "518B", expenseRatio: 0.09 },
  { name: "Vanguard Growth", symbol: "VUG", return1y: 22.4, return3y: 12.8, return5y: 18.6, returnPeriod: "3Y", aum: "124B", expenseRatio: 0.04 },
];

function getReturn(etf: ETF) {
  if (etf.returnPeriod === "1Y") return etf.return1y;
  if (etf.returnPeriod === "3Y") return etf.return3y;
  return etf.return5y;
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V1 — Clean Stack                                                    */
/*  Name bold on top, symbol muted, return prominent, meta below         */
/* ══════════════════════════════════════════════════════════════════════ */

function V1() {
  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {etfs.map((etf) => (
        <button key={etf.symbol} className="rounded-2xl border border-border/50 p-4 text-left active:scale-[0.98] transition-transform">
          <p className="text-[15px] font-semibold text-foreground leading-tight">{etf.name}</p>
          <p className="text-[13px] text-muted-foreground mt-0.5 mb-3">{etf.symbol}</p>
          <p className={cn("text-[22px] font-bold tabular-nums", getReturn(etf) >= 0 ? "text-gain" : "text-loss")}>
            {getReturn(etf) >= 0 ? "+" : ""}{getReturn(etf).toFixed(1)}%
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5 mb-3">{etf.returnPeriod} return</p>
          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <span>AUM {etf.aum}</span>
            <span>ER {etf.expenseRatio.toFixed(2)}%</span>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V2 — Return Hero                                                    */
/*  Giant return number dominates. Everything else is secondary.         */
/* ══════════════════════════════════════════════════════════════════════ */

function V2() {
  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {etfs.map((etf) => {
        const ret = getReturn(etf);
        return (
          <button key={etf.symbol} className="rounded-2xl border border-border/50 p-4 text-left active:scale-[0.98] transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[14px] font-semibold text-foreground leading-tight">{etf.name}</p>
              </div>
            </div>
            <p className={cn("text-[28px] font-bold tabular-nums leading-none", ret >= 0 ? "text-gain" : "text-loss")}>
              {ret >= 0 ? "+" : ""}{ret.toFixed(1)}%
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 mb-4">{etf.returnPeriod} annualized</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{etf.aum}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{etf.expenseRatio.toFixed(2)}%</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V3 — Filled Cards                                                   */
/*  bg-muted, no border. Return + period inline. Compact.                */
/* ══════════════════════════════════════════════════════════════════════ */

function V3() {
  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {etfs.map((etf) => {
        const ret = getReturn(etf);
        return (
          <button key={etf.symbol} className="rounded-2xl bg-muted p-4 text-left active:scale-[0.98] transition-transform">
            <p className="text-[15px] font-semibold text-foreground leading-tight mb-1">{etf.name}</p>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className={cn("text-[18px] font-bold tabular-nums", ret >= 0 ? "text-gain" : "text-loss")}>
                {ret >= 0 ? "+" : ""}{ret.toFixed(1)}%
              </span>
              <span className="text-[12px] text-muted-foreground">{etf.returnPeriod}</span>
            </div>
            <div className="space-y-1 text-[12px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">AUM</span>
                <span className="text-foreground font-medium">{etf.aum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expense</span>
                <span className="text-foreground font-medium">{etf.expenseRatio.toFixed(2)}%</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V4 — Color Accent                                                   */
/*  Subtle green/red tint based on return. Visual signal at a glance.    */
/* ══════════════════════════════════════════════════════════════════════ */

function V4() {
  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      {etfs.map((etf) => {
        const ret = getReturn(etf);
        const gain = ret >= 0;
        return (
          <button key={etf.symbol} className={cn("rounded-2xl p-4 text-left active:scale-[0.98] transition-transform", gain ? "bg-gain/[0.06]" : "bg-loss/[0.06]")}>
            <p className="text-[15px] font-semibold text-foreground leading-tight">{etf.name}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5 mb-3">{etf.symbol}</p>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className={cn("text-[20px] font-bold tabular-nums", gain ? "text-gain" : "text-loss")}>
                {gain ? "+" : ""}{ret.toFixed(1)}%
              </span>
              <span className="text-[12px] text-muted-foreground">{etf.returnPeriod}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{etf.aum} AUM</span>
              <span>·</span>
              <span>{etf.expenseRatio.toFixed(2)}% ER</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V5 — Minimal Typography                                             */
/*  No cards. Just a clean grid of text blocks. Borders between.         */
/* ══════════════════════════════════════════════════════════════════════ */

function V5() {
  return (
    <div className="px-5">
      <div className="grid grid-cols-2 gap-0 border border-border/40 rounded-2xl overflow-hidden">
        {etfs.map((etf, i) => {
          const ret = getReturn(etf);
          return (
            <button
              key={etf.symbol}
              className={cn(
                "p-4 text-left active:bg-muted/30 transition-colors",
                i % 2 === 0 && "border-r border-border/40",
                i < etfs.length - 2 && "border-b border-border/40"
              )}
            >
              <p className="text-[14px] font-semibold text-foreground leading-tight mb-0.5">{etf.name}</p>
              <p className="text-[12px] text-muted-foreground mb-2">{etf.symbol}</p>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className={cn("text-[18px] font-bold tabular-nums", ret >= 0 ? "text-gain" : "text-loss")}>
                  {ret >= 0 ? "+" : ""}{ret.toFixed(1)}%
                </span>
                <span className="text-[11px] text-muted-foreground">{etf.returnPeriod}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {etf.aum} AUM · {etf.expenseRatio.toFixed(2)}% ER
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  Page                                                                */
/* ══════════════════════════════════════════════════════════════════════ */

const variations = [
  { name: "V1 — Clean Stack", component: V1 },
  { name: "V2 — Return Hero", component: V2 },
  { name: "V3 — Filled Cards", component: V3 },
  { name: "V4 — Color Accent", component: V4 },
  { name: "V5 — Grid Table", component: V5 },
];

export default function ETFCardsExplore() {
  const [active, setActive] = useState(0);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors">
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">ETF Cards</h1>
          <p className="text-[13px] text-muted-foreground">5 layout variations</p>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar border-b border-border/40">
        <div className="flex gap-0 px-5">
          {variations.map((v, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                active === i ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              V{i + 1}
              {active === i && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="pt-5 pb-10">
          <div className="px-5 mb-4">
            <h2 className="text-[18px] font-bold tracking-tight text-foreground">Popular ETFs</h2>
            <p className="text-[14px] text-muted-foreground mt-0.5">Most invested ETFs by Aspora members</p>
          </div>
          <p className="px-5 text-[13px] text-muted-foreground mb-4">{variations[active].name}</p>
          {(() => { const Comp = variations[active].component; return <Comp />; })()}
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
