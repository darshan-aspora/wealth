"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Shared data shape                                                  */
/* ------------------------------------------------------------------ */

export interface ETFCardData {
  name: string;
  symbol: string;
  price: number;
  change1d: number;
  return1y: number;
  return3y: number;
  return5y: number;
  expenseRatio: number;
  trackingError: number;
  aum: string;
}

export const sampleETF: ETFCardData = {
  name: "Vanguard S&P 500",
  symbol: "VOO",
  price: 512.34,
  change1d: 0.86,
  return1y: 18.2,
  return3y: 10.8,
  return5y: 13.4,
  expenseRatio: 0.03,
  trackingError: 0.01,
  aum: "892B",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtPct(v: number, digits = 1) {
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

function fmtPrice(v: number) {
  return v.toFixed(2);
}

function returnClass(v: number) {
  return v >= 0 ? "text-gain" : "text-loss";
}

/* ================================================================== */
/*  V1 — Hero Return Card                                              */
/*  The 3Y return dominates as the visual anchor. Price sits below.    */
/* ================================================================== */

export function ETFCardHero({ etf = sampleETF }: { etf?: ETFCardData }) {
  return (
    <div className="rounded-2xl bg-muted p-5">
      {/* Name */}
      <div className="mb-5">
        <p className="text-[16px] font-bold text-foreground truncate">{etf.name}</p>
      </div>

      {/* Hero 3Y return */}
      <div className="mb-4">
        <p
          className={cn(
            "text-[32px] leading-none font-bold tracking-tight tabular-nums",
            returnClass(etf.return3y),
          )}
        >
          {fmtPct(etf.return3y)}
        </p>
        <p className="text-[13px] text-muted-foreground mt-1">3-year annualized return</p>
      </div>

      {/* Price + today */}
      <div className="flex items-baseline justify-between pb-4 border-b border-border/50">
        <p className="text-[17px] font-bold tabular-nums text-foreground">{fmtPrice(etf.price)}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[13px] font-semibold tabular-nums",
            returnClass(etf.change1d),
          )}
        >
          {etf.change1d >= 0 ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
          {fmtPct(etf.change1d, 2)} today
        </span>
      </div>

      {/* Secondary returns */}
      <div className="grid grid-cols-2 gap-3 pt-4 pb-4">
        <div>
          <p className="text-[12px] text-muted-foreground">1Y</p>
          <p className={cn("text-[14px] font-bold tabular-nums", returnClass(etf.return1y))}>
            {fmtPct(etf.return1y)}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">5Y</p>
          <p className={cn("text-[14px] font-bold tabular-nums", returnClass(etf.return5y))}>
            {fmtPct(etf.return5y)}
          </p>
        </div>
      </div>

      {/* Footer metadata */}
      <div className="flex items-center justify-between text-[13px] text-muted-foreground pt-3 border-t border-border/50">
        <span>AUM <span className="text-foreground font-semibold">{etf.aum}</span></span>
        <span>ER <span className="text-foreground font-semibold">{etf.expenseRatio.toFixed(2)}%</span></span>
        <span>TE <span className="text-foreground font-semibold">{etf.trackingError.toFixed(2)}%</span></span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  V2 — Return Ladder Card                                            */
/*  Three return windows laid out as stepped pills. Scannable.         */
/* ================================================================== */

export function ETFCardLadder({
  etf = sampleETF,
  className,
}: {
  etf?: ETFCardData;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-muted p-4 flex flex-col", className)}>
      {/* Header — logo + (title stacked over price/day %) */}
      <div className="flex items-start gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-full bg-muted-foreground/20 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-foreground leading-tight line-clamp-2">
            {etf.name}
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <p className="text-[14px] font-semibold tabular-nums text-foreground leading-none">
              {fmtPrice(etf.price)}
            </p>
            <p className={cn("text-[12px] font-semibold tabular-nums leading-none", returnClass(etf.change1d))}>
              {fmtPct(etf.change1d, 2)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row — pinned to bottom so 1Y/AUM/Expense stay aligned
          across cards in the same row even when names wrap */}
      <div className="grid grid-cols-3 text-[13px] mt-auto">
        <div>
          <p className="text-muted-foreground text-[12px]">1Y</p>
          <p className={cn("font-bold tabular-nums", returnClass(etf.return1y))}>
            {fmtPct(etf.return1y)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-[12px]">AUM</p>
          <p className="text-foreground font-semibold">{etf.aum}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[12px]">Expense</p>
          <p className="text-foreground font-semibold">{etf.expenseRatio.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  V3 — Data Grid Card                                                */
/*  Dense, info-heavy: every metric labelled in a grid. Zerodha vibe.  */
/* ================================================================== */

export function ETFCardGrid({ etf = sampleETF }: { etf?: ETFCardData }) {
  const cells: { label: string; value: string; tone?: "gain" | "loss" | "neutral" }[] = [
    { label: "Price", value: fmtPrice(etf.price), tone: "neutral" },
    {
      label: "1D",
      value: fmtPct(etf.change1d, 2),
      tone: etf.change1d >= 0 ? "gain" : "loss",
    },
    {
      label: "1Y Return",
      value: fmtPct(etf.return1y),
      tone: etf.return1y >= 0 ? "gain" : "loss",
    },
    {
      label: "3Y Return",
      value: fmtPct(etf.return3y),
      tone: etf.return3y >= 0 ? "gain" : "loss",
    },
    {
      label: "5Y Return",
      value: fmtPct(etf.return5y),
      tone: etf.return5y >= 0 ? "gain" : "loss",
    },
    { label: "AUM", value: etf.aum, tone: "neutral" },
    { label: "Expense Ratio", value: `${etf.expenseRatio.toFixed(2)}%`, tone: "neutral" },
    { label: "Tracking Error", value: `${etf.trackingError.toFixed(2)}%`, tone: "neutral" },
  ];

  const toneClass = (tone?: "gain" | "loss" | "neutral") =>
    tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "text-foreground";

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
      {/* Header band */}
      <div className="px-4 py-3 bg-muted/50 border-b border-border/60">
        <p className="text-[15px] font-bold text-foreground truncate">{etf.name}</p>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border/60 border-b border-border/60">
        {cells.map((c) => (
          <div key={c.label} className="px-4 py-2.5">
            <p className="text-[11px] text-muted-foreground tracking-wide uppercase">{c.label}</p>
            <p className={cn("text-[15px] font-bold tabular-nums mt-0.5", toneClass(c.tone))}>
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  V4 — Return Timeline Card                                          */
/*  Returns plotted on a visual timeline — 1Y → 3Y → 5Y as nodes.      */
/* ================================================================== */

export function ETFCardTimeline({ etf = sampleETF }: { etf?: ETFCardData }) {
  const nodes = [
    { label: "1Y", value: etf.return1y },
    { label: "3Y", value: etf.return3y },
    { label: "5Y", value: etf.return5y },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-b from-muted/80 to-muted p-5">
      {/* Name + price stack */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-[16px] font-bold text-foreground leading-tight min-w-0">{etf.name}</p>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-[13px] font-semibold tabular-nums shrink-0",
            returnClass(etf.change1d),
          )}
        >
          {etf.change1d >= 0 ? <ArrowUpRight size={13} strokeWidth={2.5} /> : <ArrowDownRight size={13} strokeWidth={2.5} />}
          {fmtPct(etf.change1d, 2)}
        </span>
      </div>
      <p className="text-[20px] font-bold tabular-nums text-foreground leading-none mb-5">{fmtPrice(etf.price)}</p>

      {/* Timeline */}
      <div className="relative mb-5">
        {/* Values above */}
        <div className="flex justify-between mb-2">
          {nodes.map((n) => (
            <div key={n.label} className="flex flex-col items-center">
              <span className={cn("text-[15px] font-bold tabular-nums leading-none", returnClass(n.value))}>
                {fmtPct(n.value)}
              </span>
            </div>
          ))}
        </div>

        {/* Line + nodes */}
        <div className="relative flex items-center justify-between px-1.5">
          <div className="absolute left-1.5 right-1.5 top-1/2 h-px -translate-y-1/2 bg-border" />
          {nodes.map((n) => (
            <div
              key={n.label}
              className={cn(
                "relative h-3 w-3 rounded-full ring-4 ring-muted",
                n.value >= 0 ? "bg-gain" : "bg-loss",
              )}
            />
          ))}
        </div>

        {/* Period labels */}
        <div className="flex justify-between mt-2">
          {nodes.map((n) => (
            <span key={n.label} className="text-[12px] font-semibold tracking-wide text-muted-foreground">
              {n.label}
            </span>
          ))}
        </div>
      </div>

      {/* Footer metadata */}
      <div className="flex items-center justify-between text-[12px] pt-3 border-t border-border/50">
        <div>
          <p className="text-muted-foreground">AUM</p>
          <p className="text-foreground font-semibold text-[14px]">{etf.aum}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Expense</p>
          <p className="text-foreground font-semibold text-[14px]">{etf.expenseRatio.toFixed(2)}%</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Tracking</p>
          <p className="text-foreground font-semibold text-[14px]">{etf.trackingError.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  V5 — Editorial Card                                                */
/*  Magazine-style. Oversized return as pull quote; stats as caption.  */
/* ================================================================== */

export function ETFCardEditorial({ etf = sampleETF }: { etf?: ETFCardData }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 relative overflow-hidden">
      {/* Header */}
      <div className="mb-4 relative">
        <p className="text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">
          ETF
        </p>
        <p className="text-[18px] font-bold tracking-tight text-foreground leading-tight">
          {etf.name}
        </p>
      </div>

      {/* Pull quote — 3Y return */}
      <div className="relative flex items-baseline gap-3 mb-1">
        <p
          className={cn(
            "text-[48px] leading-none font-black tabular-nums tracking-tight",
            returnClass(etf.return3y),
          )}
        >
          {fmtPct(etf.return3y)}
        </p>
      </div>
      <p className="text-[13px] text-muted-foreground italic mb-5">
        three-year annualized, per year
      </p>

      {/* Body copy */}
      <p className="text-[14px] text-foreground leading-relaxed mb-4">
        Trading at <span className="font-bold tabular-nums">{fmtPrice(etf.price)}</span>,{" "}
        <span className={cn("font-semibold tabular-nums", returnClass(etf.change1d))}>
          {fmtPct(etf.change1d, 2)}
        </span>{" "}
        today.{" "}
        <span className="text-muted-foreground">
          One-year{" "}
          <span className={cn("font-semibold tabular-nums", returnClass(etf.return1y))}>
            {fmtPct(etf.return1y)}
          </span>
          , five-year{" "}
          <span className={cn("font-semibold tabular-nums", returnClass(etf.return5y))}>
            {fmtPct(etf.return5y)}
          </span>
          .
        </span>
      </p>

      {/* Caption */}
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground tracking-wide pt-3 border-t border-border/60">
        <span className="font-semibold text-foreground tabular-nums">{etf.aum}</span>
        <span>AUM</span>
        <span className="text-border">·</span>
        <span className="font-semibold text-foreground tabular-nums">{etf.expenseRatio.toFixed(2)}%</span>
        <span>ER</span>
        <span className="text-border">·</span>
        <span className="font-semibold text-foreground tabular-nums">{etf.trackingError.toFixed(2)}%</span>
        <span>TE</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Showcase — renders all 5 variants stacked for preview              */
/* ================================================================== */

export function ETFCardVariantsShowcase({ etf = sampleETF }: { etf?: ETFCardData }) {
  const variants: { label: string; Component: React.ComponentType<{ etf?: ETFCardData }> }[] = [
    { label: "V1 — Hero Return", Component: ETFCardHero },
    { label: "V2 — Return Ladder", Component: ETFCardLadder },
    { label: "V3 — Data Grid", Component: ETFCardGrid },
    { label: "V4 — Return Timeline", Component: ETFCardTimeline },
    { label: "V5 — Editorial", Component: ETFCardEditorial },
  ];

  return (
    <div className="space-y-6">
      {variants.map(({ label, Component }) => (
        <div key={label} className="space-y-2">
          <p className="text-[13px] font-bold tracking-wider text-muted-foreground uppercase px-1">
            {label}
          </p>
          <Component etf={etf} />
        </div>
      ))}
    </div>
  );
}
