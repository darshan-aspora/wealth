"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Zap, CalendarDays, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeatmapStock, SectorSlice } from "./types";

interface Props {
  stock: HeatmapStock | null;
  sector: SectorSlice | null;
  onClose: () => void;
}

function pctClass(v: number) {
  return v >= 0 ? "text-gain" : "text-loss";
}

function fmtPct(v: number, digits = 1) {
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

function fmtVol(v: number) {
  if (v >= 1) return `${v.toFixed(1)}M`;
  return `${(v * 1000).toFixed(0)}K`;
}

function fmtMarketCap(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}T`;
  return `${v.toFixed(1)}B`;
}

/** Cheap, evocative sparkline using deterministic mock points */
function Sparkline({ chg1m, chg1d }: { chg1m: number; chg1d: number }) {
  // 24 points, drift roughly to chg1m, with wobble
  const pts: number[] = [];
  const target = chg1m;
  for (let i = 0; i < 24; i++) {
    const progress = i / 23;
    const base = target * progress;
    const wobble = Math.sin(i * 1.7 + chg1d) * Math.max(1.5, Math.abs(chg1m) * 0.25);
    pts.push(base + wobble);
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = Math.max(0.5, max - min);
  const W = 320;
  const H = 48;
  const path = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * W;
      const y = H - ((p - min) / range) * (H - 4) - 2;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const isUp = chg1m >= 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[48px]" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={isUp ? "hsl(var(--gain))" : "hsl(var(--loss))"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeatmapDetailSheet({ stock, sector, onClose }: Props) {
  const isOpen = stock !== null || sector !== null;

  // Share a uniform grid of period returns
  const entity = stock ?? sector;
  const returnsRow = entity
    ? [
        { label: "1D", value: entity.chg1d },
        { label: "1W", value: entity.chg1w },
        { label: "1M", value: entity.chg1m },
        { label: "3M", value: entity.chg3m },
        { label: "YTD", value: entity.chgYtd },
        { label: "1Y", value: entity.chg1y },
      ]
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-[430px] rounded-t-3xl border-t border-border/60 bg-background px-5 pb-8 pt-3 shadow-xl"
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30" />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {stock ? (
                  <>
                    <p className="text-[20px] font-bold tracking-tight text-foreground">{stock.symbol}</p>
                    <p className="text-[14px] text-muted-foreground leading-tight">{stock.name}</p>
                  </>
                ) : sector ? (
                  <>
                    <p className="text-[20px] font-bold tracking-tight text-foreground">{sector.label}</p>
                    <p className="text-[14px] text-muted-foreground leading-tight">
                      {sector.weight.toFixed(1)}% of index
                    </p>
                  </>
                ) : null}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            {/* Price / change */}
            {stock && (
              <div className="mt-3 flex items-baseline gap-3">
                <p className="text-[28px] font-bold tabular-nums text-foreground leading-none">
                  {stock.price.toFixed(2)}
                </p>
                <p className={cn("text-[16px] font-semibold tabular-nums", pctClass(stock.chg1d))}>
                  {fmtPct(stock.chg1d, 2)} today
                </p>
              </div>
            )}

            {/* Sparkline */}
            {entity && (
              <div className="mt-4">
                <Sparkline chg1m={entity.chg1m} chg1d={entity.chg1d} />
              </div>
            )}

            {/* Returns grid */}
            <div className="mt-4 grid grid-cols-6 gap-1 rounded-2xl border border-border/50 p-2">
              {returnsRow.map((r) => (
                <div key={r.label} className="flex flex-col items-center py-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {r.label}
                  </p>
                  <p className={cn("text-[13px] font-semibold tabular-nums mt-0.5", pctClass(r.value))}>
                    {fmtPct(r.value, 1)}
                  </p>
                </div>
              ))}
            </div>

            {/* Secondary stats */}
            {stock && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Market cap</p>
                  <p className="text-[15px] font-semibold text-foreground tabular-nums mt-0.5">
                    {fmtMarketCap(stock.marketCap)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Volume</p>
                  <p className="text-[15px] font-semibold text-foreground tabular-nums mt-0.5">
                    {fmtVol(stock.volume)}
                    <span className="text-muted-foreground font-medium text-[12px] ml-1.5">
                      {(stock.volume / stock.avgVolume30d).toFixed(1)}×
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">52W range</p>
                  <p className="text-[13px] font-semibold text-foreground tabular-nums mt-0.5">
                    {stock.low52w.toFixed(0)}<span className="text-muted-foreground"> — </span>{stock.high52w.toFixed(0)}
                  </p>
                </div>
              </div>
            )}

            {/* Badges inline */}
            {stock && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {stock.earningsSoon && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[12px] font-semibold text-foreground">
                    <CalendarDays size={12} strokeWidth={2.2} /> Earnings this week
                  </span>
                )}
                {stock.volume / stock.avgVolume30d > 1.5 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[12px] font-semibold text-foreground">
                    <Zap size={12} strokeWidth={2.2} /> Unusual volume
                  </span>
                )}
                {stock.newHigh52w && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[12px] font-semibold text-foreground">
                    <ChevronUp size={13} strokeWidth={2.4} /> 52W high
                  </span>
                )}
                {stock.newLow52w && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[12px] font-semibold text-foreground">
                    <ChevronDown size={13} strokeWidth={2.4} /> 52W low
                  </span>
                )}
              </div>
            )}

            {/* Headline */}
            {stock?.headline && (
              <div className="mt-4 rounded-2xl bg-muted/60 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">What&apos;s moving it</p>
                <p className="text-[14px] text-foreground leading-snug mt-1">{stock.headline}</p>
              </div>
            )}

            {/* CTA */}
            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-[15px] font-semibold text-background active:scale-[0.99] transition-transform">
              {stock ? `Open ${stock.symbol}` : "See stocks in this sector"}
              <ArrowRight size={16} strokeWidth={2.4} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
