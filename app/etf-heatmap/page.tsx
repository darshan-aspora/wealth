"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LayoutGrid, List, Rows3, ChevronDown, X, Check, TrendingUp, TrendingDown } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Button } from "@/components/ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HeatmapLensSheet } from "@/components/heatmap/lens-sheet";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { LensDef } from "@/components/heatmap/types";
import { DEFAULT_LENS } from "@/components/heatmap/types";

/* ================================================================== */
/*  ETF data                                                            */
/* ================================================================== */

interface ETFItem {
  symbol: string;
  name: string;
  weight: number; // for AUM-based sizing
  change: number; // today's %
  aum: string;
  expenseRatio: number;
}

type BasisId = "aum" | "volume";
const BASIS_OPTIONS: { id: BasisId; label: string }[] = [
  { id: "aum", label: "By AUM" },
  { id: "volume", label: "By Volume" },
];

const ETF_DATA: Record<BasisId, ETFItem[]> = {
  aum: [
    { symbol: "SPY", name: "SPDR S&P 500", weight: 12.8, change: 1.4, aum: "518B", expenseRatio: 0.09 },
    { symbol: "VOO", name: "Vanguard S&P 500", weight: 11.0, change: 1.3, aum: "892B", expenseRatio: 0.03 },
    { symbol: "VTI", name: "Vanguard Total Stock", weight: 9.4, change: 1.2, aum: "384B", expenseRatio: 0.03 },
    { symbol: "QQQ", name: "Invesco QQQ", weight: 6.4, change: 1.9, aum: "242B", expenseRatio: 0.20 },
    { symbol: "BND", name: "Vanguard Total Bond", weight: 4.8, change: 0.3, aum: "108B", expenseRatio: 0.03 },
    { symbol: "AGG", name: "iShares Core US Agg", weight: 4.2, change: 0.2, aum: "98B", expenseRatio: 0.03 },
    { symbol: "IVV", name: "iShares Core S&P 500", weight: 3.8, change: 1.3, aum: "478B", expenseRatio: 0.03 },
    { symbol: "VIG", name: "Vanguard Div Appr", weight: 3.2, change: 0.8, aum: "82B", expenseRatio: 0.06 },
    { symbol: "VXUS", name: "Vanguard Total Intl", weight: 2.8, change: -1.4, aum: "62B", expenseRatio: 0.07 },
    { symbol: "VWO", name: "Vanguard Emerging", weight: 2.4, change: -2.1, aum: "78B", expenseRatio: 0.08 },
    { symbol: "IWM", name: "iShares Russell 2000", weight: 2.2, change: 2.1, aum: "62B", expenseRatio: 0.19 },
    { symbol: "GLD", name: "SPDR Gold Shares", weight: 2.0, change: 0.4, aum: "58B", expenseRatio: 0.40 },
    { symbol: "XLK", name: "Tech Select SPDR", weight: 1.8, change: 2.9, aum: "52B", expenseRatio: 0.09 },
    { symbol: "TLT", name: "iShares 20+ Yr Treas", weight: 1.6, change: 0.8, aum: "42B", expenseRatio: 0.15 },
    { symbol: "SCHD", name: "Schwab US Dividend", weight: 1.5, change: 0.6, aum: "56B", expenseRatio: 0.06 },
    { symbol: "EFA", name: "iShares MSCI EAFE", weight: 1.4, change: -1.9, aum: "48B", expenseRatio: 0.32 },
    { symbol: "VEA", name: "Vanguard Developed", weight: 1.3, change: -0.7, aum: "44B", expenseRatio: 0.05 },
    { symbol: "XLE", name: "Energy Select SPDR", weight: 1.2, change: 3.4, aum: "38B", expenseRatio: 0.09 },
    { symbol: "LQD", name: "iShares IG Corp Bond", weight: 1.0, change: 0.4, aum: "34B", expenseRatio: 0.14 },
    { symbol: "HYG", name: "iShares High Yield", weight: 0.9, change: 0.6, aum: "18B", expenseRatio: 0.49 },
    { symbol: "DIA", name: "SPDR Dow Jones", weight: 0.8, change: -0.9, aum: "32B", expenseRatio: 0.16 },
    { symbol: "SMH", name: "VanEck Semiconductor", weight: 0.7, change: 3.2, aum: "14B", expenseRatio: 0.35 },
    { symbol: "XLF", name: "Financial Select SPDR", weight: 0.7, change: 2.0, aum: "38B", expenseRatio: 0.09 },
    { symbol: "ARKK", name: "ARK Innovation", weight: 0.5, change: 4.9, aum: "6.8B", expenseRatio: 0.75 },
    { symbol: "EEM", name: "iShares Emerging Mkts", weight: 0.5, change: -2.3, aum: "22B", expenseRatio: 0.68 },
  ],
  volume: [
    { symbol: "SPY", name: "SPDR S&P 500", weight: 18.2, change: 1.4, aum: "518B", expenseRatio: 0.09 },
    { symbol: "QQQ", name: "Invesco QQQ", weight: 12.4, change: 1.9, aum: "242B", expenseRatio: 0.20 },
    { symbol: "IWM", name: "iShares Russell 2000", weight: 6.8, change: 2.1, aum: "62B", expenseRatio: 0.19 },
    { symbol: "EEM", name: "iShares Emerging Mkts", weight: 5.2, change: -2.3, aum: "22B", expenseRatio: 0.68 },
    { symbol: "XLE", name: "Energy Select SPDR", weight: 4.8, change: 3.4, aum: "38B", expenseRatio: 0.09 },
    { symbol: "XLF", name: "Financial Select SPDR", weight: 4.2, change: 2.0, aum: "38B", expenseRatio: 0.09 },
    { symbol: "TLT", name: "iShares 20+ Yr Treas", weight: 3.8, change: 0.8, aum: "42B", expenseRatio: 0.15 },
    { symbol: "HYG", name: "iShares High Yield", weight: 3.4, change: 0.6, aum: "18B", expenseRatio: 0.49 },
    { symbol: "ARKK", name: "ARK Innovation", weight: 3.0, change: 4.9, aum: "6.8B", expenseRatio: 0.75 },
    { symbol: "GLD", name: "SPDR Gold Shares", weight: 2.6, change: 0.4, aum: "58B", expenseRatio: 0.40 },
    { symbol: "EFA", name: "iShares MSCI EAFE", weight: 2.4, change: -1.9, aum: "48B", expenseRatio: 0.32 },
    { symbol: "XLK", name: "Tech Select SPDR", weight: 2.2, change: 2.9, aum: "52B", expenseRatio: 0.09 },
    { symbol: "DIA", name: "SPDR Dow Jones", weight: 2.0, change: -0.9, aum: "32B", expenseRatio: 0.16 },
    { symbol: "VOO", name: "Vanguard S&P 500", weight: 1.8, change: 1.3, aum: "892B", expenseRatio: 0.03 },
    { symbol: "SMH", name: "VanEck Semiconductor", weight: 1.6, change: 3.2, aum: "14B", expenseRatio: 0.35 },
    { symbol: "VTI", name: "Vanguard Total Stock", weight: 1.4, change: 1.2, aum: "384B", expenseRatio: 0.03 },
    { symbol: "BND", name: "Vanguard Total Bond", weight: 1.2, change: 0.3, aum: "108B", expenseRatio: 0.03 },
    { symbol: "XLV", name: "Health Care SPDR", weight: 1.0, change: -0.5, aum: "34B", expenseRatio: 0.09 },
    { symbol: "LQD", name: "iShares IG Corp Bond", weight: 0.9, change: 0.4, aum: "34B", expenseRatio: 0.14 },
    { symbol: "VWO", name: "Vanguard Emerging", weight: 0.8, change: -2.1, aum: "78B", expenseRatio: 0.08 },
    { symbol: "SCHD", name: "Schwab US Dividend", weight: 0.7, change: 0.6, aum: "56B", expenseRatio: 0.06 },
    { symbol: "AGG", name: "iShares Core US Agg", weight: 0.6, change: 0.2, aum: "98B", expenseRatio: 0.03 },
    { symbol: "XLRE", name: "Real Estate SPDR", weight: 0.5, change: -3.2, aum: "5.8B", expenseRatio: 0.09 },
    { symbol: "XLU", name: "Utilities SPDR", weight: 0.5, change: -2.2, aum: "14B", expenseRatio: 0.09 },
    { symbol: "BITO", name: "ProShares Bitcoin", weight: 0.4, change: -4.8, aum: "2.2B", expenseRatio: 0.95 },
  ],
};

/* Deterministic intraday-direction signal — some ETFs trend opposite to their daily move */
function getEtfTrend(symbol: string, change: number): number {
  const hash = Array.from(symbol).reduce((a, c) => a + c.charCodeAt(0), 0);
  const flipSign = hash % 4 === 0;
  const magnitude = ((hash % 7) + 1) / 10;
  return (flipSign ? -1 : 1) * Math.sign(change || 1) * magnitude * Math.abs(change);
}

/* ================================================================== */
/*  Squarified treemap (self-contained)                                 */
/* ================================================================== */

const TM_W = 400;
const TM_H = 1100;

interface Tile { x: number; y: number; w: number; h: number; symbol: string; change: number }

function treemap(items: { symbol: string; weight: number; change: number }[]): Tile[] {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => b.weight - a.weight);
  const total = sorted.reduce((s, i) => s + i.weight, 0);
  const area = TM_W * TM_H;
  const areas = sorted.map((i) => (i.weight / total) * area);
  const rects: Tile[] = [];

  function worst(cells: number[], side: number) {
    const sum = cells.reduce((s, a) => s + a, 0);
    const other = sum / side;
    let max = 0;
    for (const a of cells) {
      const r = Math.max(other / (a / other), (a / other) / other);
      if (r > max) max = r;
    }
    return max;
  }

  function process(idxs: number[], bx: number, by: number, bw: number, bh: number) {
    if (!idxs.length) return;
    if (idxs.length === 1) {
      const i = idxs[0];
      rects.push({ x: bx, y: by, w: bw, h: bh, symbol: sorted[i].symbol, change: sorted[i].change });
      return;
    }
    const isWide = bw >= bh;
    const side = isWide ? bh : bw;
    let bestEnd = 0;
    let rowAreas: number[] = [];
    let bestW = Infinity;
    for (let i = 0; i < idxs.length; i++) {
      const test = [...rowAreas, areas[idxs[i]]];
      const w = worst(test, side);
      if (w <= bestW) { bestW = w; bestEnd = i; rowAreas = test; }
      else break;
    }
    const rowTotal = rowAreas.reduce((s, a) => s + a, 0);
    if (isWide) {
      const rw = rowTotal / bh;
      let py = by;
      for (let i = 0; i <= bestEnd; i++) {
        const ch = areas[idxs[i]] / rw;
        rects.push({ x: bx, y: py, w: rw, h: ch, symbol: sorted[idxs[i]].symbol, change: sorted[idxs[i]].change });
        py += ch;
      }
      process(idxs.slice(bestEnd + 1), bx + rw, by, bw - rw, bh);
    } else {
      const rh = rowTotal / bw;
      let px = bx;
      for (let i = 0; i <= bestEnd; i++) {
        const cw = areas[idxs[i]] / rh;
        rects.push({ x: px, y: by, w: cw, h: rh, symbol: sorted[idxs[i]].symbol, change: sorted[idxs[i]].change });
        px += cw;
      }
      process(idxs.slice(bestEnd + 1), bx, by + rh, bw, bh - rh);
    }
  }

  process(sorted.map((_, i) => i), 0, 0, TM_W, TM_H);
  return rects;
}

function etfHeatColor(change: number, isDark: boolean): string {
  if (isDark) {
    if (change >= 3) return "#1a3a2a";
    if (change >= 2) return "#1e3d2d";
    if (change >= 1) return "#223f30";
    if (change >= 0.3) return "#2a4436";
    if (change > -0.3) return "#2a2a2e";
    if (change > -1) return "#3d2a2a";
    if (change > -2) return "#422828";
    if (change > -3) return "#482626";
    return "#4e2424";
  }
  if (change >= 3) return "#c1e6d0";
  if (change >= 2) return "#cfeadb";
  if (change >= 1) return "#d9f0e3";
  if (change >= 0.3) return "#e4f5ec";
  if (change > -0.3) return "#ececee";
  if (change > -1) return "#f5e0e0";
  if (change > -2) return "#f0d4d4";
  if (change > -3) return "#eac8c8";
  return "#e4bcbc";
}

/* ================================================================== */
/*  Page                                                                */
/* ================================================================== */

export default function ETFHeatmapPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [basis, setBasis] = useState<BasisId>("aum");
  const [basisSheetOpen, setBasisSheetOpen] = useState(false);
  // Lens is locked to DEFAULT for MVP1 — UI to change it is hidden below.
  const lens = DEFAULT_LENS; // eslint-disable-line @typescript-eslint/no-unused-vars
  // const [lens, setLens] = useState<LensDef>(DEFAULT_LENS);
  // const [lensOpen, setLensOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewMode, setViewMode] = useState<"heatmap" | "list" | "grid">("heatmap");
  const [helpOpen, setHelpOpen] = useState(true);
  const [helpWithBackdrop, setHelpWithBackdrop] = useState(true);
  const [trendEnabled, setTrendEnabled] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const handleViewScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const st = e.currentTarget.scrollTop;
    setIsScrolled(st > 0);
    setHeaderCollapsed(st > 40);
  }, []);

  const VIEW_MODES = [
    { id: "heatmap" as const, label: "Heatmap", Icon: Rows3 },
    { id: "list" as const, label: "List", Icon: List },
    { id: "grid" as const, label: "Grid", Icon: LayoutGrid },
  ];
  const cycleViewMode = () => {
    const order = VIEW_MODES.map((v) => v.id);
    setViewMode((v) => order[(order.indexOf(v) + 1) % order.length]);
    setIsScrolled(false);
  };
  const currentView = VIEW_MODES.find((v) => v.id === viewMode)!;

  const etfs = ETF_DATA[basis];

  const tiles = useMemo(
    () => treemap(etfs.map((e) => ({ symbol: e.symbol, weight: e.weight, change: e.change }))),
    [etfs],
  );

  return (
    <div className="h-dvh bg-background flex flex-col">
      <div className="mx-auto flex h-dvh max-w-[430px] flex-col w-full">
        {/* Grey header section — expanded on top, collapses on scroll */}
        <div className="shrink-0 bg-muted/50 border-b border-border/50">
          <StatusBar />

          <header className="flex items-center justify-between px-3 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </Button>
            <motion.h1
              initial={false}
              animate={{ opacity: headerCollapsed ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 text-[17px] font-bold tracking-tight text-foreground ml-1"
            >
              ETF at a Glance
            </motion.h1>
          </header>

          {/* Expanded title + subtext — collapses on scroll */}
          <motion.div
            initial={false}
            animate={{
              maxHeight: headerCollapsed ? 0 : 160,
              opacity: headerCollapsed ? 0 : 1,
            }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pt-1 pb-4">
              <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight">
                ETF at a Glance
              </h1>
              <p className="mt-1.5 text-[14px] leading-snug text-muted-foreground">
                Every major ETF, on one screen.
                <br />
                Size maps to AUM or volume. Color maps to today&apos;s move.{" "}
                <button
                  onClick={() => {
                    setHelpWithBackdrop(false);
                    setHelpOpen(true);
                  }}
                  className="font-semibold text-foreground underline underline-offset-2 active:opacity-60 transition-opacity"
                >
                  Learn more
                </button>
              </p>
            </div>
          </motion.div>

          {/* Pills row */}
          <div className="flex items-center gap-2 px-4 pb-3">
            {/* Basis selector */}
            <button
              onClick={() => setBasisSheetOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-full bg-foreground text-background px-3.5 text-[13px] font-semibold active:scale-[0.97] transition-transform"
            >
              {BASIS_OPTIONS.find((b) => b.id === basis)!.label}
              <ChevronDown size={14} strokeWidth={2.4} />
            </button>

            {/* Trend toggle — shows/hides intraday-direction arrows */}
            <button
              onClick={() => setTrendEnabled((v) => !v)}
              aria-label={trendEnabled ? "Hide trend arrows" : "Show trend arrows"}
              aria-pressed={trendEnabled}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors active:scale-[0.97]",
                trendEnabled
                  ? "bg-foreground text-background"
                  : "border border-border/60 bg-background/60 text-foreground",
              )}
            >
              <TrendingUp size={14} strokeWidth={2.2} />
            </button>

            {/* Lens pill — hidden for MVP1 */}
            {/* <button
              onClick={() => setLensOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-[13px] font-semibold text-foreground active:scale-[0.97] transition-transform"
            >
              <Sliders size={13} strokeWidth={2.2} />
              Lens
            </button> */}

            <div className="flex-1" />

            {/* View flipper */}
            <button
              onClick={cycleViewMode}
              className="flex h-8 items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3.5 text-[13px] font-semibold text-foreground active:scale-[0.97] transition-transform"
            >
              <currentView.Icon size={14} strokeWidth={2.2} />
              {currentView.label}
            </button>
          </div>
        </div>

        {/* Heatmap view */}
        {viewMode === "heatmap" && (
          <div
            className="flex-1 min-h-0 overflow-y-auto no-scrollbar"
            onScroll={handleViewScroll}
          >
            <div className="relative w-full" style={{ height: TM_H }}>
              {tiles.map((r) => {
                const showLabel = r.w > 28 && r.h > 24;
                const showChange = r.w > 42 && r.h > 32;
                const isLarge = r.w > 65 && r.h > 50;
                const showTrend = r.w > 42 && r.h > 48;
                const trend = getEtfTrend(r.symbol, r.change);
                return (
                  <div
                    key={r.symbol}
                    className="absolute p-[1px]"
                    style={{
                      left: `${(r.x / TM_W) * 100}%`,
                      top: `${(r.y / TM_H) * 100}%`,
                      width: `${(r.w / TM_W) * 100}%`,
                      height: `${(r.h / TM_H) * 100}%`,
                    }}
                  >
                    <div
                      className="flex h-full w-full flex-col items-center justify-center"
                      style={{ backgroundColor: etfHeatColor(r.change, isDark) }}
                    >
                      {showLabel && (
                        <span
                          className={cn("font-bold leading-none text-center px-1", isDark ? "text-white" : "text-black/80")}
                          style={{ fontSize: isLarge ? 14 : 11 }}
                        >
                          {r.symbol}
                        </span>
                      )}
                      {showChange && (
                        <span
                          className={cn("mt-0.5 leading-none tabular-nums", isDark ? "text-white/80" : "text-black/50")}
                          style={{ fontSize: isLarge ? 12 : 9 }}
                        >
                          {r.change > 0 ? "+" : ""}{r.change.toFixed(1)}%
                        </span>
                      )}
                      {trendEnabled && showTrend && trend !== 0 && (
                        trend > 0 ? (
                          <TrendingUp
                            size={isLarge ? 12 : 10}
                            strokeWidth={2.5}
                            className={cn("mt-0.5", isDark ? "text-white/90" : "text-black/70")}
                          />
                        ) : (
                          <TrendingDown
                            size={isLarge ? 12 : 10}
                            strokeWidth={2.5}
                            className={cn("mt-0.5", isDark ? "text-white/90" : "text-black/70")}
                          />
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid view */}
        {viewMode === "grid" && (
          <div
            className="flex-1 min-h-0 overflow-y-auto px-3 pt-2 pb-4"
            onScroll={handleViewScroll}
          >
            <div className="grid grid-cols-4 gap-1.5">
              {[...etfs]
                .sort((a, b) => b.change - a.change)
                .map((e) => {
                  const trend = getEtfTrend(e.symbol, e.change);
                  return (
                    <div
                      key={e.symbol}
                      className="flex aspect-square flex-col items-center justify-center rounded-xl p-1"
                      style={{ backgroundColor: etfHeatColor(e.change, isDark) }}
                    >
                      <span className={cn("text-[12px] font-bold leading-none", isDark ? "text-white" : "text-black/85")}>
                        {e.symbol}
                      </span>
                      <span className={cn("mt-1 text-[11px] tabular-nums leading-none", isDark ? "text-white/80" : "text-black/55")}>
                        {e.change > 0 ? "+" : ""}{e.change.toFixed(1)}%
                      </span>
                      {trendEnabled && trend !== 0 && (
                        trend > 0 ? (
                          <TrendingUp
                            size={11}
                            strokeWidth={2.5}
                            className={cn("mt-1", isDark ? "text-white/90" : "text-black/70")}
                          />
                        ) : (
                          <TrendingDown
                            size={11}
                            strokeWidth={2.5}
                            className={cn("mt-1", isDark ? "text-white/90" : "text-black/70")}
                          />
                        )
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* List view */}
        {viewMode === "list" && (
          <div
            className="flex-1 min-h-0 overflow-y-auto"
            onScroll={handleViewScroll}
          >
            {[...etfs]
              .sort((a, b) => b.change - a.change)
              .map((e, i) => {
                const trend = getEtfTrend(e.symbol, e.change);
                return (
                  <div
                    key={e.symbol}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3",
                      i < etfs.length - 1 && "border-b border-border/40",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-foreground">{e.symbol}</p>
                      <p className="text-[12px] text-muted-foreground truncate leading-tight">{e.name}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-[14px] font-semibold tabular-nums text-muted-foreground">{e.aum}</p>
                      <p className={cn("text-[12px] font-semibold tabular-nums", e.change >= 0 ? "text-gain" : "text-loss")}>
                        {e.change >= 0 ? "+" : ""}{e.change.toFixed(1)}%
                      </p>
                      {trendEnabled && trend !== 0 && (
                        trend > 0 ? (
                          <TrendingUp size={12} strokeWidth={2.5} className="text-gain mt-0.5" />
                        ) : (
                          <TrendingDown size={12} strokeWidth={2.5} className="text-loss mt-0.5" />
                        )
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Bottom bar */}
        <div className="shrink-0 border-t border-border/40 bg-background/92 backdrop-blur-md">
          <div className="flex items-center gap-3 px-5 py-3">
            <LegendBar isDark={isDark} />
          </div>
          <HomeIndicator />
        </div>
      </div>

      {/* Lens sheet — hidden for MVP1 */}
      {/* <HeatmapLensSheet
        open={lensOpen}
        lens={lens}
        onChange={setLens}
        onClose={() => setLensOpen(false)}
      /> */}

      {/* Basis selector sheet */}
      <AnimatePresence>
        {basisSheetOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[60] bg-black/50"
              onClick={() => setBasisSheetOpen(false)}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-[430px] rounded-t-3xl border-t border-border/60 bg-background pt-4 pb-8 shadow-xl"
            >
              <div className="flex items-start justify-between gap-3 px-5">
                <div>
                  <p className="text-[20px] font-bold tracking-tight text-foreground">Size by</p>
                  <p className="text-[14px] text-muted-foreground leading-tight mt-0.5">
                    What determines tile size.
                  </p>
                </div>
                <button
                  onClick={() => setBasisSheetOpen(false)}
                  aria-label="Close"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>
              <div className="mt-5 px-5">
                <div className="overflow-hidden rounded-xl border border-border/60">
                  {BASIS_OPTIONS.map((opt, i) => {
                    const active = opt.id === basis;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setBasis(opt.id);
                          setBasisSheetOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors",
                          active ? "bg-foreground/5" : "active:bg-muted",
                          i < BASIS_OPTIONS.length - 1 && "border-b border-border/60",
                        )}
                      >
                        <p className="text-[15px] font-semibold text-foreground">{opt.label}</p>
                        {active && <Check size={18} strokeWidth={2.4} className="text-foreground shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Onboarding sheet — opens on every page visit */}
      <HeatmapHelpSheet
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        isDark={isDark}
        withBackdrop={helpWithBackdrop}
      />
    </div>
  );
}

/* ================================================================== */
/*  Legend bar                                                          */
/* ================================================================== */

function LegendBar({ isDark }: { isDark: boolean }) {
  const steps = [-3, -2, -1, -0.3, 0, 0.3, 1, 2, 3];
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className="text-[11px] font-semibold tabular-nums text-muted-foreground shrink-0">-3%</span>
      <div className="flex h-[10px] flex-1 overflow-hidden rounded-full">
        {steps.map((v, i) => (
          <div key={i} className="h-full flex-1" style={{ backgroundColor: etfHeatColor(v, isDark) }} />
        ))}
      </div>
      <span className="text-[11px] font-semibold tabular-nums text-muted-foreground shrink-0">+3%</span>
    </div>
  );
}

/* ================================================================== */
/*  Onboarding help sheet — carousel explaining the ETF heatmap         */
/* ================================================================== */

interface HelpSlide {
  title: string;
  body: string;
  visual: React.ReactNode;
}

function HeatmapHelpSheet({
  open,
  onClose,
  isDark,
  withBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  withBackdrop?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const slides: HelpSlide[] = [
    {
      title: "Every box is an ETF",
      body: "Bigger boxes are bigger funds (by AUM or volume). Greener is up, redder is down.",
      visual: (
        <div className="flex h-72 w-full items-stretch gap-1.5 p-3" style={{ backgroundColor: isDark ? "#0f1419" : "#f1f5f9" }}>
          <div className="flex-[3] rounded-xl bg-emerald-500/90 flex items-end justify-start p-2">
            <span className={cn("text-[13px] font-bold", isDark ? "text-white" : "text-black/80")}>SPY<br/><span className="text-[11px] font-semibold opacity-80">+1.4%</span></span>
          </div>
          <div className="flex flex-[2] flex-col gap-1.5">
            <div className="flex-[3] rounded-xl bg-emerald-400/80 flex items-end justify-start p-2">
              <span className={cn("text-[11px] font-bold", isDark ? "text-white" : "text-black/80")}>QQQ<br/><span className="text-[10px] font-semibold opacity-80">+1.9%</span></span>
            </div>
            <div className="flex-[2] rounded-xl bg-red-500/85 flex items-end justify-start p-2">
              <span className={cn("text-[10px] font-bold", isDark ? "text-white" : "text-black/80")}>TLT<br/><span className="text-[9px] font-semibold opacity-80">−0.8%</span></span>
            </div>
            <div className="flex-[1] rounded-xl bg-emerald-400/70" />
          </div>
        </div>
      ),
    },
    // Lens slide — hidden for MVP1
    // {
    //   title: "Swap what's measured",
    //   body: "Tap Lens to change what size and color mean — volume, volatility, 1-week return, pre-market move, and more.",
    //   visual: ( ... ),
    // },
    {
      title: "Arrows show the trend",
      body: "An ETF at +1.2% could be cooling off from +3%, or rebounding from −1%. The arrow shows which way it's headed right now.",
      visual: (
        <div className="flex h-72 w-full items-center justify-center gap-5" style={{ backgroundColor: isDark ? "#0f1419" : "#f1f5f9" }}>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gain/15">
              <TrendingUp size={36} strokeWidth={2.5} className="text-gain" />
            </div>
            <span className="text-[12px] font-semibold text-foreground">Climbing</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-loss/15">
              <TrendingDown size={36} strokeWidth={2.5} className="text-loss" />
            </div>
            <span className="text-[12px] font-semibold text-foreground">Pulling back</span>
          </div>
        </div>
      ),
    },
    {
      title: "Three ways to read it",
      body: "Heatmap gives you the forest at a glance. Grid shows equal-weight tiles. List ranks every ETF by today's move.",
      visual: (
        <div className="flex h-72 w-full items-center justify-center gap-3" style={{ backgroundColor: isDark ? "#0f1419" : "#f1f5f9" }}>
          {[
            { Icon: Rows3, label: "Heatmap" },
            { Icon: LayoutGrid, label: "Grid" },
            { Icon: List, label: "List" },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-background">
                <Icon size={26} strokeWidth={2} className="text-foreground" />
              </div>
              <span className="text-[12px] font-semibold text-foreground">{label}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const isLast = step === slides.length - 1;
  const current = slides[step];

  /* Auto-advance every 3s, stopping on the last slide */
  useEffect(() => {
    if (!open || isLast) return;
    const timer = setTimeout(() => {
      setDirection(1);
      setStep((s) => s + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [open, step, isLast]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="help-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed inset-0 z-[80]",
              withBackdrop ? "bg-black/60" : "bg-transparent",
            )}
            onClick={onClose}
          />
          <motion.div
            key="help-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="fixed inset-x-0 bottom-0 z-[90] mx-auto w-full max-w-[430px] overflow-hidden rounded-t-3xl bg-background pb-6 shadow-xl"
          >
            {/* Slide content — visual is edge-to-edge, text is padded */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                >
                  {current.visual}
                  <div className="px-5">
                    <h2 className="mt-5 text-[22px] font-bold tracking-tight text-foreground text-center">
                      {current.title}
                    </h2>
                    <p className="mt-2 text-[15px] leading-snug text-muted-foreground text-center">
                      {current.body}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots — below the subtext */}
            <div className="flex justify-center gap-1.5 mt-5">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === step ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/25",
                  )}
                />
              ))}
            </div>

            {/* Single CTA — ghost Skip on non-last slides, solid Done on last */}
            <div className="mt-5 px-5">
              <button
                onClick={onClose}
                className={cn(
                  "w-full h-12 rounded-full text-[15px] font-semibold active:scale-[0.98] transition-transform",
                  isLast
                    ? "bg-foreground text-background"
                    : "text-muted-foreground active:bg-muted/40",
                )}
              >
                {isLast ? "Done" : "Skip"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
