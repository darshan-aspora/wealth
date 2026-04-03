"use client";

import { ArrowUpRight, TrendingUp, Eye, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PORTFOLIO_SUMMARY, PERIOD_RETURNS } from "./portfolio-mock-data";

const S = PORTFOLIO_SUMMARY;
const R = PERIOD_RETURNS;

const f = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d });
const fs = (n: number, d = 2) => `${n > 0 ? "+" : ""}${f(n, d)}`;

/* ================================================================== */
/*  V1 — Minimal Stack                                                 */
/*  Everything centered, breathes, big value, stacked vertically       */
/* ================================================================== */

function V1() {
  return (
    <Card className="border-border/50 shadow-none overflow-hidden">
      <CardContent className="p-6">
        {/* Top row */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] text-muted-foreground tracking-wide uppercase">Portfolio</span>
          <div className="flex items-center gap-1.5">
            <Eye size={16} className="text-muted-foreground" />
            <LineChart size={16} className="text-muted-foreground" />
          </div>
        </div>

        {/* Big value — centered */}
        <div className="text-center py-5">
          <p className="text-[38px] font-bold tracking-tight text-foreground leading-none">
            {f(S.currentValue)}
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-gain/10 px-3 py-1">
            <ArrowUpRight size={14} className="text-gain" />
            <span className="text-[14px] font-semibold text-gain">{f(S.dayChange)} ({fs(S.dayChangePct, 2)}%)</span>
            <span className="text-[12px] text-gain/60 ml-0.5">today</span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* Metrics — stacked rows */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-muted-foreground">Invested</span>
            <span className="text-[16px] font-semibold text-foreground">{f(S.investedAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-muted-foreground">Unrealized P&L</span>
            <div className="text-right">
              <span className="text-[16px] font-semibold text-gain">{fs(S.unrealizedPnl)}</span>
              <span className="text-[13px] text-gain/70 ml-1.5">+{S.unrealizedPnlPct}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-muted-foreground">Est. XIRR</span>
            <span className="text-[16px] font-semibold text-gain">{S.xirr}%</span>
          </div>
        </div>

        <Separator className="mt-4 mb-3 bg-border/30" />

        {/* Returns */}
        <p className="text-[12px] font-medium text-muted-foreground mb-2.5">Returns</p>
        <div className="grid grid-cols-4 gap-2">
          {R.map((r) => (
            <div key={r.period} className="text-center">
              <p className="text-[12px] text-muted-foreground mb-1">{r.period}</p>
              <p className={cn("text-[15px] font-semibold", r.value >= 0 ? "text-gain" : "text-loss")}>
                {r.value >= 0 ? "+" : ""}{r.value}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  V2 — Two-Column Split                                              */
/*  Left: big value + day change. Right: metrics stacked               */
/* ================================================================== */

function V2() {
  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] text-muted-foreground">Current Value</span>
          <div className="flex items-center gap-1.5">
            <Eye size={16} className="text-muted-foreground" />
            <LineChart size={16} className="text-muted-foreground" />
          </div>
        </div>

        <div className="flex gap-5">
          {/* Left — value */}
          <div className="flex-1">
            <p className="text-[34px] font-bold tracking-tight text-foreground leading-none">
              {f(S.currentValue)}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <ArrowUpRight size={13} className="text-gain" />
              <span className="text-[13px] font-semibold text-gain">{f(S.dayChange)}</span>
              <span className="text-[12px] text-gain/70">({fs(S.dayChangePct, 2)}%)</span>
              <span className="text-[12px] text-muted-foreground ml-0.5">Today</span>
            </div>
          </div>

          {/* Right — metrics column */}
          <div className="w-[1px] bg-border/30 self-stretch" />
          <div className="space-y-2.5 min-w-[120px]">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Invested</p>
              <p className="text-[15px] font-semibold text-foreground">{f(S.investedAmount)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">P&L</p>
              <p className="text-[15px] font-semibold text-gain">{fs(S.unrealizedPnl)} <span className="text-[12px] font-medium">({S.unrealizedPnlPct}%)</span></p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Est. XIRR</p>
              <p className="text-[15px] font-semibold text-gain">{S.xirr}%</p>
            </div>
          </div>
        </div>

        <Separator className="mt-4 mb-3 bg-border/30" />
        <p className="text-[12px] font-medium text-muted-foreground mb-2.5">Returns</p>
        <div className="grid grid-cols-4 gap-2">
          {R.map((r) => (
            <div key={r.period} className="text-center">
              <p className="text-[12px] text-muted-foreground mb-1">{r.period}</p>
              <p className={cn("text-[15px] font-semibold", r.value >= 0 ? "text-gain" : "text-loss")}>
                {r.value >= 0 ? "+" : ""}{r.value}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  V3 — Progress Bar Visual                                           */
/*  Shows invested→current as a visual progress bar                    */
/* ================================================================== */

function V3() {
  const investedPct = (S.investedAmount / S.currentValue) * 100;

  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] text-muted-foreground">Current Value</span>
          <div className="flex items-center gap-1.5">
            <Eye size={16} className="text-muted-foreground" />
            <LineChart size={16} className="text-muted-foreground" />
          </div>
        </div>

        {/* Value + day change inline */}
        <div className="flex items-baseline gap-3">
          <p className="text-[32px] font-bold tracking-tight text-foreground leading-tight">
            {f(S.currentValue)}
          </p>
          <div className="flex items-center gap-1">
            <ArrowUpRight size={13} className="text-gain" />
            <span className="text-[13px] font-semibold text-gain">{fs(S.dayChangePct, 2)}%</span>
          </div>
        </div>

        {/* Visual bar: invested vs gains */}
        <div className="mt-4 mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>Invested {f(S.investedAmount, 0)}</span>
          <span className="ml-auto text-gain">Gain {fs(S.unrealizedPnl, 0)}</span>
        </div>
        <div className="h-[8px] w-full rounded-full bg-muted/50 overflow-hidden flex">
          <div
            className="h-full rounded-l-full bg-foreground/25 transition-all"
            style={{ width: `${investedPct}%` }}
          />
          <div
            className="h-full rounded-r-full bg-gain transition-all"
            style={{ width: `${100 - investedPct}%` }}
          />
        </div>

        {/* Metrics row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground mb-0.5">P&L</p>
            <p className="text-[16px] font-bold text-gain">{fs(S.unrealizedPnl)}</p>
            <p className="text-[12px] text-gain/70">+{S.unrealizedPnlPct}%</p>
          </div>
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground mb-0.5">Est. XIRR</p>
            <p className="text-[16px] font-bold text-gain">{S.xirr}%</p>
            <p className="text-[12px] text-muted-foreground">annualized</p>
          </div>
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground mb-0.5">Today</p>
            <p className="text-[16px] font-bold text-gain">{fs(S.dayChange)}</p>
            <p className="text-[12px] text-gain/70">+{S.dayChangePct}%</p>
          </div>
        </div>

        {/* Returns as pills */}
        <Separator className="mt-4 mb-3 bg-border/30" />
        <p className="text-[12px] font-medium text-muted-foreground mb-2.5">Returns</p>
        <div className="flex gap-2">
          {R.map((r) => (
            <div
              key={r.period}
              className={cn(
                "flex-1 rounded-lg py-2 text-center",
                r.value >= 0 ? "bg-gain/8" : "bg-loss/8"
              )}
            >
              <p className="text-[11px] text-muted-foreground">{r.period}</p>
              <p className={cn("text-[14px] font-bold mt-0.5", r.value >= 0 ? "text-gain" : "text-loss")}>
                {r.value >= 0 ? "+" : ""}{r.value}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  V4 — Dark Gradient Hero                                            */
/*  Gradient bg, value big and centered, metrics in bottom tray        */
/* ================================================================== */

function V4() {
  return (
    <Card className="border-border/50 shadow-none overflow-hidden">
      <div className="bg-gradient-to-br from-foreground/[0.06] via-gain/[0.04] to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gain/15 flex items-center justify-center">
                <TrendingUp size={14} className="text-gain" />
              </div>
              <span className="text-[14px] font-medium text-foreground">Your Portfolio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye size={16} className="text-muted-foreground" />
              <LineChart size={16} className="text-muted-foreground" />
            </div>
          </div>

          {/* Centered value block */}
          <div className="text-center mb-5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-1">Current Value</p>
            <p className="text-[40px] font-extrabold tracking-tight text-foreground leading-none">
              {f(S.currentValue)}
            </p>
            <div className="mt-2 inline-flex items-center gap-1">
              <ArrowUpRight size={14} className="text-gain" />
              <span className="text-[14px] font-semibold text-gain">{f(S.dayChange)} ({fs(S.dayChangePct, 2)}%)</span>
              <span className="text-[12px] text-muted-foreground ml-1">today</span>
            </div>
          </div>

          {/* Bottom tray — 3 columns */}
          <div className="rounded-xl bg-background/60 border border-border/30 p-3.5 grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">Invested</p>
              <p className="text-[15px] font-bold text-foreground mt-0.5">{f(S.investedAmount, 0)}</p>
            </div>
            <div className="text-center border-x border-border/30">
              <p className="text-[11px] text-muted-foreground">Unrealized P&L</p>
              <p className="text-[15px] font-bold text-gain mt-0.5">{fs(S.unrealizedPnl, 0)}</p>
              <p className="text-[11px] text-gain/70">+{S.unrealizedPnlPct}%</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">Est. XIRR</p>
              <p className="text-[15px] font-bold text-gain mt-0.5">{S.xirr}%</p>
            </div>
          </div>

          {/* Returns */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {R.map((r) => (
              <div key={r.period} className="text-center">
                <p className="text-[11px] text-muted-foreground mb-1">{r.period}</p>
                <p className={cn("text-[15px] font-bold", r.value >= 0 ? "text-gain" : "text-loss")}>
                  {r.value >= 0 ? "+" : ""}{r.value}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  V5 — Compact Inline                                                */
/*  Dense, no wasted space, value left-aligned, everything flows       */
/* ================================================================== */

function V5() {
  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] text-muted-foreground mb-0.5">Current Value</p>
            <p className="text-[30px] font-bold tracking-tight text-foreground leading-none">
              {f(S.currentValue)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Eye size={16} className="text-muted-foreground" />
            <LineChart size={16} className="text-muted-foreground" />
          </div>
        </div>

        {/* Day change + P&L inline */}
        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ArrowUpRight size={12} className="text-gain" />
            <span className="text-[13px] font-semibold text-gain">{f(S.dayChange)} ({fs(S.dayChangePct, 2)}%)</span>
            <span className="text-[12px] text-muted-foreground">today</span>
          </div>
        </div>

        {/* Two-row grid: Invested/P&L top, Est. XIRR + returns bottom */}
        <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Invested</p>
            <p className="text-[16px] font-semibold text-foreground">{f(S.investedAmount)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Unrealized P&L</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-[16px] font-semibold text-gain">{fs(S.unrealizedPnl)}</p>
              <p className="text-[12px] font-medium text-gain/70">+{S.unrealizedPnlPct}%</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Est. XIRR</p>
            <p className="text-[16px] font-semibold text-gain">{S.xirr}%</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Day Change</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-[16px] font-semibold text-gain">{fs(S.dayChange)}</p>
              <p className="text-[12px] font-medium text-gain/70">+{S.dayChangePct}%</p>
            </div>
          </div>
        </div>

        {/* Returns — horizontal with separator dots */}
        <div className="mt-4 pt-3 border-t border-border/30">
          <p className="text-[12px] font-medium text-muted-foreground mb-2">Returns</p>
          <div className="flex items-center justify-between">
            {R.map((r, i) => (
              <div key={r.period} className="flex items-center gap-2">
                {i > 0 && <div className="h-3 w-[1px] bg-border/40" />}
                <div className="text-center">
                  <p className="text-[11px] text-muted-foreground">{r.period}</p>
                  <p className={cn("text-[14px] font-bold", r.value >= 0 ? "text-gain" : "text-loss")}>
                    {r.value >= 0 ? "+" : ""}{r.value}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  Export all variations                                               */
/* ================================================================== */

export const VARIATIONS = [
  { name: "V1 — Minimal Stack", component: V1 },
  { name: "V2 — Two-Column Split", component: V2 },
  { name: "V3 — Progress Bar", component: V3 },
  { name: "V4 — Gradient Hero", component: V4 },
  { name: "V5 — Compact Inline", component: V5 },
];
