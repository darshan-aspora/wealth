"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { cn } from "@/lib/utils";

// ─── Shared mock data (mix of Stock / Index / ETF / Option) ──────────
type ResultType = "Stock" | "Index" | "ETF" | "Option";

type ResultItem = {
  symbol: string;
  name: string;
  type: ResultType;
  price: number;
  changePct: number;
  exchange?: string;
  capSize?: string;
  pe?: number;
  sector?: string;
  ytd?: number;
  return1Y?: number;
  aum?: string;
  expenseRatio?: string;
  iv?: number;
  volume?: string;
  expiry?: string;
};

const items: ResultItem[] = [
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", price: 227.63, changePct: 1.53, exchange: "NASDAQ", capSize: "Mega Cap", pe: 29.4, sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Stock", price: 134.70, changePct: 5.33, exchange: "NASDAQ", capSize: "Mega Cap", pe: 64.3, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", type: "Stock", price: 441.28, changePct: -0.48, exchange: "NASDAQ", capSize: "Mega Cap", pe: 35.2, sector: "Technology" },
  { symbol: "SPX", name: "S&P 500", type: "Index", price: 6021.63, changePct: 0.41, ytd: 4.2, return1Y: 22.8 },
  { symbol: "NDX", name: "NASDAQ 100", type: "Index", price: 21432.15, changePct: 0.60, ytd: 5.8, return1Y: 28.4 },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", type: "ETF", price: 601.42, changePct: 0.41, aum: "560B", expenseRatio: "0.09%" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", type: "ETF", price: 521.87, changePct: 0.60, aum: "280B", expenseRatio: "0.20%" },
  { symbol: "AAPL 250321C230", name: "AAPL Mar 21 230 Call", type: "Option", price: 4.85, changePct: 17.43, iv: 28.4, volume: "12.4K", expiry: "Mar 21" },
  { symbol: "NVDA 250404C140", name: "NVDA Apr 4 140 Call", type: "Option", price: 6.42, changePct: 39.87, iv: 51.3, volume: "24.1K", expiry: "Apr 4" },
];

const typeColor: Record<ResultType, string> = {
  Stock: "bg-sky-500",
  Index: "bg-amber-500",
  ETF: "bg-violet-500",
  Option: "bg-pink-500",
};

const typePillBg: Record<ResultType, string> = {
  Stock: "bg-sky-500/15 text-sky-400 ring-1 ring-inset ring-sky-500/25",
  Index: "bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/25",
  ETF: "bg-violet-500/15 text-violet-400 ring-1 ring-inset ring-violet-500/25",
  Option: "bg-pink-500/15 text-pink-400 ring-1 ring-inset ring-pink-500/25",
};

function fmtPct(pct: number) {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

function LogoCircle({ size = 36 }: { size?: number }) {
  return (
    <div
      className="shrink-0 rounded-full bg-muted"
      style={{ height: size, width: size }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// V1 — Dense Minimal
// Two-line compact row. Stats rendered as a plain dot-separated muted
// micro-line beneath the ticker row — data-table/terminal aesthetic.
// ─────────────────────────────────────────────────────────────────────
function V1Dense() {
  return (
    <div className="divide-y divide-border/40">
      {items.map((item) => {
        const up = item.changePct >= 0;
        const stats = getQuickStats(item);
        const statsText = stats
          .map((s) => (s.label ? `${s.label} ${s.value}` : s.value))
          .join(" · ");
        return (
          <div key={item.symbol} className="pl-4 pr-3 py-2.5">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  typeColor[item.type]
                )}
              />
              <span className="shrink-0 text-[14px] font-semibold text-foreground tracking-tight">
                {item.symbol.length > 14
                  ? item.symbol.slice(0, 14) + "…"
                  : item.symbol}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground/70">
                {item.name}
              </span>
              <span className="shrink-0 text-[14px] font-semibold tabular-nums text-foreground">
                {item.price}
              </span>
              <span
                className={cn(
                  "w-16 shrink-0 text-right text-[12px] font-semibold tabular-nums",
                  up ? "text-emerald-500" : "text-red-500"
                )}
              >
                {fmtPct(item.changePct)}
              </span>
            </div>
            {statsText && (
              <div className="mt-0.5 pl-[18px] truncate text-[11px] text-muted-foreground/50">
                {statsText}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// V2 — Gradient Cards
// Full-width cards, subtle gain/loss gradient, stat chips underneath
// ─────────────────────────────────────────────────────────────────────
function V2Cards() {
  return (
    <div className="space-y-2.5 p-3">
      {items.slice(0, 6).map((item) => {
        const up = item.changePct >= 0;
        const stats = getQuickStats(item);
        return (
          <div
            key={item.symbol}
            className={cn(
              "relative overflow-hidden rounded-xl border border-border/60 bg-card px-4 py-3",
              "bg-gradient-to-r",
              up ? "from-emerald-500/[0.06] to-transparent" : "from-red-500/[0.06] to-transparent"
            )}
          >
            <div className="flex items-center gap-3">
              <LogoCircle size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="truncate text-[14px] font-semibold text-foreground">
                    {item.name}
                  </p>
                </div>
                <p className="text-[11.5px] text-muted-foreground/70 mt-0.5">
                  {item.type} · {item.symbol}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[14px] font-semibold tabular-nums text-foreground">
                  {item.price}
                </p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded-md px-1.5 py-[1px] text-[11px] font-semibold tabular-nums",
                    up
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-red-500/15 text-red-500"
                  )}
                >
                  {fmtPct(item.changePct)}
                </span>
              </div>
            </div>
            {stats.length > 0 && (
              <div className="mt-2.5 ml-[52px] flex flex-wrap gap-1.5">
                {stats.map((s) => (
                  <span
                    key={s.label + s.value}
                    className="rounded-md bg-muted/60 px-2 py-[2px] text-[10.5px] font-medium text-muted-foreground"
                  >
                    {s.label && <span className="opacity-60">{s.label} </span>}
                    <span className="text-foreground/80">{s.value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// V3 — Grouped by Type
// Typed section headers with count chips, plain rows beneath
// ─────────────────────────────────────────────────────────────────────
function V3Grouped() {
  const groups: { type: ResultType; label: string }[] = [
    { type: "Stock", label: "Stocks" },
    { type: "ETF", label: "ETFs" },
    { type: "Index", label: "Indices" },
    { type: "Option", label: "Options" },
  ];
  return (
    <div>
      {groups.map((g) => {
        const entries = items.filter((i) => i.type === g.type);
        if (entries.length === 0) return null;
        return (
          <div key={g.type}>
            <div className="flex items-center gap-2 px-4 pt-3.5 pb-1.5">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", typeColor[g.type])}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {g.label}
              </span>
              <span className="rounded-full bg-secondary/70 px-1.5 py-[1px] text-[10.5px] font-semibold text-muted-foreground">
                {entries.length}
              </span>
              <div className="flex-1 h-px bg-border/40 ml-1" />
            </div>
            <div>
              {entries.map((item) => {
                const up = item.changePct >= 0;
                const stats = getQuickStats(item);
                return (
                  <div
                    key={item.symbol}
                    className="pl-4 pr-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-foreground leading-tight">
                          {item.symbol}
                        </p>
                        <p className="truncate text-[12px] text-muted-foreground/70 leading-tight mt-0.5">
                          {item.name}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[14px] font-semibold tabular-nums text-foreground leading-tight">
                          {item.price}
                        </p>
                        <p
                          className={cn(
                            "text-[12px] font-medium tabular-nums leading-tight mt-0.5",
                            up ? "text-emerald-500" : "text-red-500"
                          )}
                        >
                          {fmtPct(item.changePct)}
                        </p>
                      </div>
                    </div>
                    {stats.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                        {stats.map((s, idx) => (
                          <span
                            key={s.label + s.value + idx}
                            className="tabular-nums"
                          >
                            {s.label && (
                              <span className="text-muted-foreground/60">
                                {s.label}{" "}
                              </span>
                            )}
                            <span className="font-semibold text-foreground/80">
                              {s.value}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// V4 — Type Badge Pill
// Colored type pill replaces the logo, outlined stat tags under the name
// ─────────────────────────────────────────────────────────────────────
function V4Badge() {
  return (
    <div className="divide-y divide-border/40">
      {items.map((item) => {
        const up = item.changePct >= 0;
        const stats = getQuickStats(item);
        return (
          <div
            key={item.symbol}
            className="pl-4 pr-3 py-3"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "shrink-0 rounded-md px-1.5 py-[3px] text-[10px] font-bold uppercase tracking-wider",
                  typePillBg[item.type]
                )}
              >
                {item.type}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-foreground leading-tight">
                  {item.symbol.length > 16
                    ? item.symbol.slice(0, 16) + "…"
                    : item.symbol}
                </p>
                <p className="truncate text-[12px] text-muted-foreground/70 leading-tight mt-0.5">
                  {item.name}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[14px] font-semibold tabular-nums text-foreground leading-tight">
                  {item.price}
                </p>
                <p
                  className={cn(
                    "text-[12px] font-medium tabular-nums leading-tight mt-0.5",
                    up ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {fmtPct(item.changePct)}
                </p>
              </div>
            </div>
            {stats.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {stats.map((s, idx) => (
                  <span
                    key={s.label + s.value + idx}
                    className="rounded-md px-2 py-[2px] text-[10.5px] font-medium ring-1 ring-inset ring-border/70 text-foreground/75"
                  >
                    {s.label && (
                      <span className="text-muted-foreground/70">
                        {s.label}{" "}
                      </span>
                    )}
                    <span className="tabular-nums">{s.value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// V5 — Inline Sparkline
// Row includes a mini SVG sparkline trend between name and price
// ─────────────────────────────────────────────────────────────────────
function Sparkline({ seed, up }: { seed: number; up: boolean }) {
  // Generate a deterministic fake sparkline path from the seed
  const points = Array.from({ length: 20 }, (_, i) => {
    const noise = Math.sin(seed * (i + 1.2) * 0.9) * 3.2;
    const drift = up ? i * 0.8 : -i * 0.8;
    return 10 - drift + noise;
  });
  // Normalize to 0..16 height
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 44;
      const y = 16 - ((p - min) / range) * 16;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width="44" height="18" viewBox="0 0 44 18" fill="none" className="shrink-0">
      <path
        d={d}
        stroke={up ? "rgb(16 185 129)" : "rgb(239 68 68)"}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function V5Sparkline() {
  const typeChip: Record<ResultType, string> = {
    Stock: "bg-sky-500/10 text-sky-400/90",
    Index: "bg-amber-500/10 text-amber-400/90",
    ETF: "bg-violet-500/10 text-violet-400/90",
    Option: "bg-pink-500/10 text-pink-400/90",
  };
  return (
    <div className="divide-y divide-border/40">
      {items.map((item, idx) => {
        const up = item.changePct >= 0;
        const stats = getQuickStats(item);
        return (
          <div key={item.symbol} className="pl-4 pr-3 py-2.5">
            <div className="flex items-center gap-3">
              <LogoCircle size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-foreground leading-tight">
                  {item.symbol}
                </p>
                <p className="truncate text-[12px] text-muted-foreground/70 leading-tight mt-0.5">
                  {item.name}
                </p>
              </div>
              <Sparkline seed={idx + 1} up={up} />
              <div className="shrink-0 text-right w-[66px]">
                <p className="text-[14px] font-semibold tabular-nums text-foreground leading-tight">
                  {item.price}
                </p>
                <p
                  className={cn(
                    "text-[12px] font-medium tabular-nums leading-tight mt-0.5",
                    up ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {fmtPct(item.changePct)}
                </p>
              </div>
            </div>
            {stats.length > 0 && (
              <div className="mt-1.5 ml-[46px] flex flex-wrap gap-1">
                {stats.map((s, i) => (
                  <span
                    key={s.label + s.value + i}
                    className={cn(
                      "rounded-sm px-1.5 py-[1px] text-[10.5px] font-medium tabular-nums",
                      typeChip[item.type]
                    )}
                  >
                    {s.label && (
                      <span className="opacity-70">{s.label} </span>
                    )}
                    {s.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat helper for V2 ─────────────────────────────────────────────
function getQuickStats(item: ResultItem) {
  const out: { label: string; value: string }[] = [];
  if (item.type === "Stock") {
    if (item.capSize) out.push({ label: "", value: item.capSize });
    if (item.pe != null) out.push({ label: "PE", value: String(item.pe) });
    if (item.sector) out.push({ label: "", value: item.sector });
  } else if (item.type === "Index") {
    if (item.ytd != null) out.push({ label: "YTD", value: `${item.ytd > 0 ? "+" : ""}${item.ytd}%` });
    if (item.return1Y != null) out.push({ label: "1Y", value: `${item.return1Y > 0 ? "+" : ""}${item.return1Y}%` });
  } else if (item.type === "ETF") {
    if (item.aum) out.push({ label: "AUM", value: item.aum });
    if (item.expenseRatio) out.push({ label: "Exp", value: item.expenseRatio });
  } else if (item.type === "Option") {
    if (item.iv != null) out.push({ label: "IV", value: `${item.iv}%` });
    if (item.volume) out.push({ label: "Vol", value: item.volume });
    if (item.expiry) out.push({ label: "Exp", value: item.expiry });
  }
  return out;
}

// ─── Page ────────────────────────────────────────────────────────────
const variations = [
  {
    title: "Dense Minimal",
    description: "Terminal row + stats as muted dot-separated micro-line",
    component: V1Dense,
  },
  {
    title: "Gradient Cards",
    description: "Gain/loss gradient card + filled muted stat chips",
    component: V2Cards,
  },
  {
    title: "Grouped by Type",
    description: "Typed sections + inline labeled stats (bold values)",
    component: V3Grouped,
  },
  {
    title: "Type Badge",
    description: "Colored type pill + outlined ring stat tags",
    component: V4Badge,
  },
  {
    title: "Inline Sparkline",
    description: "Sparkline + type-tinted mini stat chips below name",
    component: V5Sparkline,
  },
];

export default function ExploreSearchResultsPage() {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-2 pb-3">
        <Link
          href="/?tab=components"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/60 transition-colors hover:bg-secondary"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </Link>
        <div>
          <h1 className="text-[19px] font-bold text-foreground leading-tight">
            Search Result Row
          </h1>
          <p className="text-[13px] text-muted-foreground">
            5 variations — stocks, indices, ETFs, options
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border/60" />

      {/* All variations stacked */}
      <div className="flex-1 px-5 pt-5 pb-6 space-y-7">
        {variations.map((v, i) => {
          const Component = v.component;
          return (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-[12px] font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="text-[15px] font-semibold text-foreground">
                  {v.title}
                </span>
                <ChevronRight
                  size={14}
                  className="text-muted-foreground/40"
                />
                <span className="text-[12px] text-muted-foreground truncate">
                  {v.description}
                </span>
              </div>
              <div className="rounded-xl border border-border/40 overflow-hidden bg-card/20">
                <Component />
              </div>
            </motion.div>
          );
        })}
      </div>

      <HomeIndicator />
    </div>
  );
}
