"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Sliders,
  LayoutGrid,
  List,
  Rows3,
  X as XIcon,
  ChevronDown,
  Check,
  PieChart,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import {
  HEATMAP_INDICES,
  HEATMAP_WATCHLIST,
  SECTORS,
  heatmapSectorsByIndex,
  heatmapStocksByIndex,
  FILTERS,
} from "@/components/heatmap/data";
import {
  colorAxisLabel,
  colorScaleForAxis,
  formatColorValue,
  getColorValue,
  getSizeValue,
  heatColor,
  treemapLayout,
  type TreemapInput,
} from "@/components/heatmap/treemap";
import type {
  ColorAxis,
  FilterId,
  GroupBy,
  HeatmapIndexId,
  HeatmapStock,
  LensDef,
  SectorId,
  SectorSlice,
  ViewMode,
} from "@/components/heatmap/types";
import { DEFAULT_LENS } from "@/components/heatmap/types";
import { HeatmapTile } from "@/components/heatmap/tile";
import { HeatmapDetailSheet } from "@/components/heatmap/detail-sheet";
import { HeatmapLensSheet } from "@/components/heatmap/lens-sheet";
import { HeatmapSearchOverlay } from "@/components/heatmap/search-overlay";

const STORAGE_KEY = "heatmap.pref.v2";

interface Persisted {
  indexId: HeatmapIndexId;
  groupBy: GroupBy;
  viewMode: ViewMode;
  lens: LensDef;
}

const PERIOD_COLOR_AXES: ColorAxis[] = [
  "chg1d",
  "perfW",
  "perfM",
  "perf3M",
  "perf6M",
  "perfYTD",
  "perfY",
];

const PERIOD_SHORT: Record<ColorAxis, string> = {
  chg1h: "1h",
  chg4h: "4h",
  chg1d: "1D",
  perfW: "1W",
  perfM: "1M",
  perf3M: "3M",
  perf6M: "6M",
  perfYTD: "YTD",
  perfY: "1Y",
  preMarket: "Pre",
  postMarket: "Post",
  relVolume: "RV",
  volatilityD: "Vol",
  gap: "Gap",
};

const GROUP_BY_OPTIONS: { id: GroupBy; label: string }[] = [
  { id: "none", label: "No group" },
  { id: "sector", label: "Sector" },
];

const TM_W = 400;
const TM_H = 500;
const SECTOR_HEADER_H = 18; // pixels reserved at top of each sector block for its label
const SECTOR_INNER_PAD = 2; // inner padding inside each sector block

export default function HeatmapPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [indexId, setIndexId] = useState<HeatmapIndexId>("sp500");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [viewMode, setViewMode] = useState<ViewMode>("treemap");
  const [lens, setLens] = useState<LensDef>(DEFAULT_LENS);
  const [activeFilter, setActiveFilter] = useState<FilterId>("none");
  const [sectorDrillId, setSectorDrillId] = useState<SectorId | null>(null);

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<SectorId | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [lensOpen, setLensOpen] = useState(false);
  const [groupByOpen, setGroupByOpen] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);

  /* -------------------- Persistence -------------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const p: Partial<Persisted> = JSON.parse(raw);
      if (p.indexId) setIndexId(p.indexId);
      if (p.groupBy) setGroupBy(p.groupBy);
      if (p.viewMode) setViewMode(p.viewMode);
      if (p.lens) setLens({ ...DEFAULT_LENS, ...p.lens });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const payload: Persisted = { indexId, groupBy, viewMode, lens };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [indexId, groupBy, viewMode, lens]);

  /* -------------------- Derived data -------------------- */
  const stocks = useMemo(() => heatmapStocksByIndex[indexId], [indexId]);
  const sectorsInIndex = useMemo(() => heatmapSectorsByIndex[indexId], [indexId]);

  const stocksInView = useMemo(() => {
    if (sectorDrillId) return stocks.filter((s) => s.sector === sectorDrillId);
    return stocks;
  }, [stocks, sectorDrillId]);

  const matchesFilter = useCallback(
    (s: HeatmapStock) => {
      switch (activeFilter) {
        case "none": return true;
        case "gainers": return s.chg1d >= 1;
        case "losers": return s.chg1d <= -1;
        case "volume-spike": return s.volume / Math.max(0.01, s.avgVolume30d) >= 1.5;
        case "watchlist": return HEATMAP_WATCHLIST.has(s.symbol);
        case "near-high-52w": return (s.high52w - s.price) / s.high52w <= 0.03;
        case "near-low-52w": return (s.price - s.low52w) / s.low52w <= 0.05;
        case "earnings-soon": return s.earningsSoon;
      }
    },
    [activeFilter],
  );

  /* Flat layout — used when groupBy === "none" OR a sector is being drilled */
  const flatTiles = useMemo(() => {
    const input: TreemapInput[] = stocksInView.map((s) => ({
      id: s.symbol,
      size: getSizeValue(s, lens.size),
      value: getColorValue(s, lens.color),
    }));
    return treemapLayout(input, TM_W, TM_H);
  }, [stocksInView, lens.size, lens.color]);

  /* Nested layout — when groupBy === "sector" AND no drill */
  const nestedLayout = useMemo(() => {
    if (groupBy !== "sector" || sectorDrillId) return null;

    // 1) Group stocks by sector (skip empty sectors for this index)
    const bySector = new Map<SectorId, HeatmapStock[]>();
    for (const s of stocks) {
      const arr = bySector.get(s.sector) ?? [];
      arr.push(s);
      bySector.set(s.sector, arr);
    }

    // 2) Outer treemap — sectors sized by sum of their stocks' size values
    const outerInput: TreemapInput[] = [];
    bySector.forEach((list, id) => {
      const sum = list.reduce((acc, s) => acc + getSizeValue(s, lens.size), 0);
      const sectorSlice = sectorsInIndex.find((x) => x.id === id);
      const colorVal = sectorSlice ? getColorValue(sectorSlice, lens.color) : 0;
      outerInput.push({ id, size: Math.max(0.01, sum), value: colorVal });
    });
    const outerTiles = treemapLayout(outerInput, TM_W, TM_H);

    // 3) For each sector, lay out its inner stocks within bounds (minus header strip)
    const innerBySector = new Map<
      SectorId,
      Array<{ x: number; y: number; w: number; h: number; id: string; value: number }>
    >();
    for (const o of outerTiles) {
      const sectorId = o.id as SectorId;
      const list = bySector.get(sectorId) ?? [];
      if (list.length === 0) continue;
      const innerW = Math.max(1, o.w - SECTOR_INNER_PAD * 2);
      const innerH = Math.max(1, o.h - SECTOR_HEADER_H - SECTOR_INNER_PAD);
      if (innerW <= 0 || innerH <= 0) continue;
      const input: TreemapInput[] = list.map((s) => ({
        id: s.symbol,
        size: getSizeValue(s, lens.size),
        value: getColorValue(s, lens.color),
      }));
      const inner = treemapLayout(input, innerW, innerH);
      const offsetX = o.x + SECTOR_INNER_PAD;
      const offsetY = o.y + SECTOR_HEADER_H;
      innerBySector.set(
        sectorId,
        inner.map((t) => ({
          id: t.id,
          value: t.value,
          x: t.x + offsetX,
          y: t.y + offsetY,
          w: t.w,
          h: t.h,
        })),
      );
    }

    return { outerTiles, innerBySector };
  }, [groupBy, sectorDrillId, stocks, sectorsInIndex, lens.size, lens.color]);

  const stocksBySymbol = useMemo(() => {
    const m = new Map<string, HeatmapStock>();
    for (const s of stocks) m.set(s.symbol, s);
    return m;
  }, [stocks]);

  const sectorsById = useMemo(() => {
    const m = new Map<SectorId, SectorSlice>();
    for (const s of sectorsInIndex) m.set(s.id, s);
    return m;
  }, [sectorsInIndex]);

  const breadth = useMemo(() => {
    const up = stocksInView.filter((s) => s.chg1d >= 0).length;
    return { up, down: stocksInView.length - up };
  }, [stocksInView]);

  /* -------------------- Handlers -------------------- */
  const cyclePeriod = () => {
    const idx = PERIOD_COLOR_AXES.indexOf(lens.color);
    if (idx === -1) {
      setLens({ ...lens, color: "chg1d" });
      return;
    }
    const next = PERIOD_COLOR_AXES[(idx + 1) % PERIOD_COLOR_AXES.length];
    setLens({ ...lens, color: next });
  };

  const onStockTileClick = (id: string) => {
    if (id === "Others") return;
    setSelectedSymbol(id);
  };

  const onSectorHeaderClick = (id: SectorId) => {
    // Group-by sector's primary interaction: clicking a sector header filters to only that sector
    setSectorDrillId(id);
  };

  const onSearchPick = (symbol: string) => {
    setActiveFilter("none");
    setSectorDrillId(null);
    setGroupBy("none");
    setHighlight(symbol);
    setTimeout(() => setHighlight(null), 1100);
    if (!stocks.some((s) => s.symbol === symbol)) {
      for (const idx of HEATMAP_INDICES) {
        if (heatmapStocksByIndex[idx.id].some((s) => s.symbol === symbol)) {
          setIndexId(idx.id);
          break;
        }
      }
    }
  };

  const allStocksForSearch = useMemo(() => {
    const all: HeatmapStock[] = [];
    const seen = new Set<string>();
    for (const idx of HEATMAP_INDICES) {
      for (const s of heatmapStocksByIndex[idx.id]) {
        if (seen.has(s.symbol)) continue;
        seen.add(s.symbol);
        all.push(s);
      }
    }
    return all;
  }, []);

  /* -------------------- Render helpers -------------------- */
  const activeIndexDef = HEATMAP_INDICES.find((i) => i.id === indexId)!;
  const currentSector = sectorDrillId ? SECTORS[sectorDrillId] : null;

  const cycleViewMode = () => {
    const order: ViewMode[] = ["treemap", "grid", "list"];
    const idx = order.indexOf(viewMode);
    setViewMode(order[(idx + 1) % order.length]);
  };

  const ViewModeIcon = viewMode === "treemap" ? Rows3 : viewMode === "grid" ? LayoutGrid : List;

  const groupByLabel = GROUP_BY_OPTIONS.find((o) => o.id === groupBy)!.label;

  // Helper: build badge props for a stock
  const badgesFor = (stk: HeatmapStock) => ({
    earningsSoon: stk.earningsSoon,
    newHigh52w: stk.newHigh52w,
    newLow52w: stk.newLow52w,
    volumeSpike: stk.volume / Math.max(0.01, stk.avgVolume30d) >= 1.5,
    upgradeOrDowngrade: stk.upgradeOrDowngrade,
  });

  const useNested = viewMode === "treemap" && groupBy === "sector" && !sectorDrillId && nestedLayout;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col">
        {/* Sticky chrome */}
        <div className="sticky top-0 z-40 bg-background/92 backdrop-blur-md">
          <StatusBar />

          {/* Header row */}
          <div className="flex items-center gap-2 px-5 pt-2 pb-2">
            <Link
              href="/?tab=equity"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
              aria-label="Back"
            >
              <ArrowLeft size={18} strokeWidth={2.2} />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[18px] font-bold tracking-tight text-foreground truncate">
                Market at a Glance
              </h1>
              <p className="text-[12px] text-muted-foreground truncate">
                {activeIndexDef.label}
                {currentSector && ` · ${currentSector.label}`}
              </p>
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
            >
              <Search size={17} strokeWidth={2.2} />
            </button>
            <button
              onClick={cycleViewMode}
              aria-label={`View mode: ${viewMode}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
            >
              <ViewModeIcon size={17} strokeWidth={2.2} />
            </button>
          </div>

          {/* Index tabs */}
          <div className="overflow-x-auto no-scrollbar border-b border-border/40">
            <div className="flex items-center gap-1 px-4 pb-2">
              {HEATMAP_INDICES.map((idx) => {
                const isActive = idx.id === indexId;
                return (
                  <button
                    key={idx.id}
                    onClick={() => {
                      setIndexId(idx.id);
                      setSectorDrillId(null);
                    }}
                    className={cn(
                      "relative shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors whitespace-nowrap",
                      isActive ? "text-background" : "text-muted-foreground",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="heatmap-index-pill"
                        className="absolute inset-0 rounded-full bg-foreground"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{idx.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Breadth + Group-by + Period */}
          <div className="flex items-center gap-2 px-5 py-2">
            <p className="text-[12px] font-semibold text-muted-foreground min-w-0">
              <span className="text-gain tabular-nums">{breadth.up} ▲</span>
              <span className="mx-1.5 text-muted-foreground/40">·</span>
              <span className="text-loss tabular-nums">{breadth.down} ▼</span>
            </p>
            <div className="flex-1" />

            {/* Group-by pill with dropdown */}
            <div className="relative">
              <button
                onClick={() => setGroupByOpen((o) => !o)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition-transform active:scale-[0.97]",
                  groupBy === "sector"
                    ? "bg-foreground text-background"
                    : "border border-border/60 text-foreground",
                )}
              >
                <PieChart size={12} strokeWidth={2.4} />
                {groupByLabel}
                <ChevronDown size={12} strokeWidth={2.4} />
              </button>
              <AnimatePresence>
                {groupByOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setGroupByOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-50 mt-2 w-[160px] overflow-hidden rounded-xl border border-border/60 bg-background shadow-lg"
                    >
                      <p className="border-b border-border/60 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Group by
                      </p>
                      {GROUP_BY_OPTIONS.map((opt) => {
                        const active = opt.id === groupBy;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setGroupBy(opt.id);
                              setGroupByOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors",
                              active ? "bg-foreground/5" : "active:bg-muted",
                            )}
                          >
                            <span className="text-[13px] font-semibold text-foreground">
                              {opt.label}
                            </span>
                            {active && <Check size={14} strokeWidth={2.4} />}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Period flipper */}
            <button
              onClick={cyclePeriod}
              className="rounded-full border border-border/60 px-3 py-1 text-[12px] font-semibold text-foreground active:scale-[0.97] transition-transform tabular-nums"
              title={colorAxisLabel(lens.color)}
            >
              {PERIOD_SHORT[lens.color]}
            </button>
          </div>

          {/* Filter chips */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 px-5 pb-3">
              {FILTERS.map((f) => {
                const active = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter((cur) => (cur === f.id ? "none" : f.id))}
                    title={f.hint}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors active:scale-[0.97]",
                      active
                        ? "bg-foreground text-background"
                        : "border border-border/60 text-muted-foreground",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
              {activeFilter !== "none" && (
                <button
                  onClick={() => setActiveFilter("none")}
                  className="shrink-0 ml-1 flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5 text-[12px] font-semibold text-muted-foreground active:scale-[0.97]"
                  aria-label="Clear filter"
                >
                  <XIcon size={12} strokeWidth={2.4} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Breadcrumb for sector drill */}
          {sectorDrillId && currentSector && (
            <div className="flex items-center gap-2 border-t border-border/40 bg-muted/40 px-5 py-2">
              <p className="text-[12px] text-muted-foreground">
                <span className="text-foreground font-semibold">{currentSector.label}</span>
                <span className="mx-1.5 text-muted-foreground/50">·</span>
                {stocksInView.length} names
              </p>
              <button
                onClick={() => setSectorDrillId(null)}
                className="ml-auto flex items-center gap-1 text-[12px] font-semibold text-foreground active:opacity-80"
              >
                <XIcon size={12} strokeWidth={2.4} /> Exit
              </button>
            </div>
          )}
        </div>

        {/* Main body */}
        <div className="relative flex-1">
          <AnimatePresence mode="wait">
            {viewMode === "treemap" && (
              <motion.div
                key={`tm-${indexId}-${groupBy}-${sectorDrillId ?? "root"}-${lens.size}-${lens.color}-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="relative px-5 pt-3"
              >
                <div
                  className="relative w-full overflow-hidden rounded-2xl"
                  style={{ aspectRatio: `${TM_W} / ${TM_H}` }}
                >
                  {useNested && nestedLayout ? (
                    <>
                      {/* Sector partitions */}
                      {nestedLayout.outerTiles.map((outer) => {
                        const sectorId = outer.id as SectorId;
                        const sectorDef = SECTORS[sectorId];
                        const slice = sectorsById.get(sectorId);
                        const headerColor = slice
                          ? heatColor(getColorValue(slice, lens.color), lens.color, isDark)
                          : "transparent";
                        const sectorValue = slice ? getColorValue(slice, lens.color) : 0;
                        return (
                          <div
                            key={`sec-${sectorId}`}
                            className="absolute"
                            style={{
                              left: `${(outer.x / TM_W) * 100}%`,
                              top: `${(outer.y / TM_H) * 100}%`,
                              width: `${(outer.w / TM_W) * 100}%`,
                              height: `${(outer.h / TM_H) * 100}%`,
                            }}
                          >
                            {/* Sector header strip — tap to drill */}
                            <button
                              onClick={() => onSectorHeaderClick(sectorId)}
                              className="absolute left-0 top-0 right-0 flex items-center justify-between gap-2 px-1.5"
                              style={{
                                height: `${(SECTOR_HEADER_H / outer.h) * 100}%`,
                                backgroundColor: headerColor,
                              }}
                            >
                              <span
                                className={cn(
                                  "text-[9px] font-bold uppercase tracking-[0.08em] truncate",
                                  isDark ? "text-white" : "text-black/85",
                                )}
                              >
                                {sectorDef.shortLabel}
                              </span>
                              {slice && outer.w > 80 && (
                                <span
                                  className={cn(
                                    "text-[9px] tabular-nums shrink-0",
                                    isDark ? "text-white/80" : "text-black/60",
                                  )}
                                >
                                  {formatColorValue(sectorValue, lens.color)}
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })}

                      {/* Inner stock tiles — rendered at outer container scope so they animate smoothly */}
                      {Array.from(nestedLayout.innerBySector.entries()).flatMap(([sectorId, tiles]) =>
                        tiles.map((t) => {
                          const stk = stocksBySymbol.get(t.id);
                          if (!stk) return null;
                          const dim = activeFilter !== "none" ? !matchesFilter(stk) : false;
                          return (
                            <HeatmapTile
                              key={`${sectorId}-${t.id}`}
                              id={t.id}
                              label={stk.symbol}
                              x={(t.x / TM_W) * 100}
                              y={(t.y / TM_H) * 100}
                              w={(t.w / TM_W) * 100}
                              h={(t.h / TM_H) * 100}
                              color={heatColor(t.value, lens.color, isDark)}
                              value={t.value}
                              colorAxis={lens.color}
                              dim={dim}
                              highlight={highlight === t.id}
                              isDark={isDark}
                              inWatchlist={HEATMAP_WATCHLIST.has(stk.symbol)}
                              showWatchlistRing={lens.showWatchlistRing}
                              showBadges={lens.showBadges}
                              badges={badgesFor(stk)}
                              onClick={() => onStockTileClick(t.id)}
                            />
                          );
                        }),
                      )}
                    </>
                  ) : (
                    // Flat stock treemap (or drilled sector)
                    flatTiles.map((r) => {
                      const stk = stocksBySymbol.get(r.id);
                      const label = stk?.symbol ?? r.id;
                      const inWatchlist = stk ? HEATMAP_WATCHLIST.has(stk.symbol) : false;
                      const badges = stk ? badgesFor(stk) : undefined;
                      const dim = stk && activeFilter !== "none" ? !matchesFilter(stk) : false;
                      return (
                        <HeatmapTile
                          key={r.id}
                          id={r.id}
                          label={label}
                          x={(r.x / TM_W) * 100}
                          y={(r.y / TM_H) * 100}
                          w={(r.w / TM_W) * 100}
                          h={(r.h / TM_H) * 100}
                          color={heatColor(r.value, lens.color, isDark)}
                          value={r.value}
                          colorAxis={lens.color}
                          dim={dim}
                          highlight={highlight === r.id}
                          isDark={isDark}
                          inWatchlist={inWatchlist}
                          showWatchlistRing={lens.showWatchlistRing}
                          showBadges={lens.showBadges}
                          badges={badges}
                          onClick={() => onStockTileClick(r.id)}
                        />
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {viewMode === "grid" && (
              <motion.div
                key={`grid-${indexId}-${groupBy}-${sectorDrillId ?? "root"}-${lens.color}-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="px-5 pt-3"
              >
                <GridView
                  stocks={stocksInView}
                  groupBy={sectorDrillId ? "none" : groupBy}
                  sectorsById={sectorsById}
                  lens={lens}
                  isDark={isDark}
                  matchesFilter={matchesFilter}
                  activeFilter={activeFilter}
                  onPickStock={(sym) => setSelectedSymbol(sym)}
                  onPickSector={(id) => onSectorHeaderClick(id)}
                />
              </motion.div>
            )}

            {viewMode === "list" && (
              <motion.div
                key={`list-${indexId}-${groupBy}-${sectorDrillId ?? "root"}-${lens.color}-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="px-5 pt-3"
              >
                <ListView
                  stocks={stocksInView}
                  groupBy={sectorDrillId ? "none" : groupBy}
                  sectorsById={sectorsById}
                  lens={lens}
                  matchesFilter={matchesFilter}
                  activeFilter={activeFilter}
                  onPickStock={(sym) => setSelectedSymbol(sym)}
                  onPickSector={(id) => onSectorHeaderClick(id)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom legend + lens button */}
        <div className="sticky bottom-0 z-40 border-t border-border/40 bg-background/92 backdrop-blur-md">
          <div className="flex items-center gap-3 px-5 py-3">
            <LegendBar axis={lens.color} isDark={isDark} />
            <button
              onClick={() => setLensOpen(true)}
              className="shrink-0 flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[12px] font-semibold text-foreground active:scale-[0.97] transition-transform"
            >
              <Sliders size={13} strokeWidth={2.2} />
              Lens
            </button>
          </div>
          <HomeIndicator />
        </div>
      </div>

      {/* Overlays */}
      <HeatmapSearchOverlay
        open={searchOpen}
        stocks={allStocksForSearch}
        onClose={() => setSearchOpen(false)}
        onPick={onSearchPick}
      />
      <HeatmapLensSheet
        open={lensOpen}
        lens={lens}
        onChange={setLens}
        onClose={() => setLensOpen(false)}
      />
      <HeatmapDetailSheet
        stock={selectedSymbol ? (stocksBySymbol.get(selectedSymbol) ?? null) : null}
        sector={selectedSectorId ? (sectorsById.get(selectedSectorId) ?? null) : null}
        onClose={() => {
          setSelectedSymbol(null);
          setSelectedSectorId(null);
        }}
      />
    </div>
  );
}

/* ================================================================== */
/*  Legend bar                                                          */
/* ================================================================== */

function LegendBar({ axis, isDark }: { axis: ColorAxis; isDark: boolean }) {
  const { min, max } = colorScaleForAxis(axis);
  const steps = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const v = min + t * (max - min);
    return { v, color: heatColor(v, axis, isDark) };
  });
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className="text-[11px] font-semibold tabular-nums text-muted-foreground shrink-0">
        {formatColorValue(min, axis)}
      </span>
      <div className="flex h-[10px] flex-1 overflow-hidden rounded-full">
        {steps.map((s, i) => (
          <div key={i} className="h-full flex-1" style={{ backgroundColor: s.color }} />
        ))}
      </div>
      <span className="text-[11px] font-semibold tabular-nums text-muted-foreground shrink-0">
        {formatColorValue(max, axis)}
      </span>
    </div>
  );
}

/* ================================================================== */
/*  Grid view — respects groupBy                                        */
/* ================================================================== */

function GridView({
  stocks,
  groupBy,
  sectorsById,
  lens,
  isDark,
  matchesFilter,
  activeFilter,
  onPickStock,
  onPickSector,
}: {
  stocks: HeatmapStock[];
  groupBy: GroupBy;
  sectorsById: Map<SectorId, SectorSlice>;
  lens: LensDef;
  isDark: boolean;
  matchesFilter: (s: HeatmapStock) => boolean;
  activeFilter: FilterId;
  onPickStock: (sym: string) => void;
  onPickSector: (id: SectorId) => void;
}) {
  const filtered = activeFilter === "none" ? stocks : stocks.filter(matchesFilter);

  const renderStockTile = (s: HeatmapStock) => {
    const v = getColorValue(s, lens.color);
    const color = heatColor(v, lens.color, isDark);
    const inWatchlist = HEATMAP_WATCHLIST.has(s.symbol);
    return (
      <button
        key={s.symbol}
        onClick={() => onPickStock(s.symbol)}
        className={cn(
          "flex aspect-square flex-col items-center justify-center rounded-xl p-1",
          lens.showWatchlistRing && inWatchlist && "ring-2 ring-foreground ring-inset",
        )}
        style={{ backgroundColor: color }}
      >
        <span className={cn("text-[12px] font-bold leading-none", isDark ? "text-white" : "text-black/85")}>
          {s.symbol}
        </span>
        <span className={cn("mt-1 text-[11px] tabular-nums leading-none", isDark ? "text-white/80" : "text-black/55")}>
          {formatColorValue(v, lens.color)}
        </span>
      </button>
    );
  };

  if (groupBy === "sector") {
    const bySector = new Map<SectorId, HeatmapStock[]>();
    for (const s of filtered) {
      const arr = bySector.get(s.sector) ?? [];
      arr.push(s);
      bySector.set(s.sector, arr);
    }
    const ordered = Array.from(bySector.entries()).sort((a, b) => {
      const wa = sectorsById.get(a[0])?.weight ?? 0;
      const wb = sectorsById.get(b[0])?.weight ?? 0;
      return wb - wa;
    });
    return (
      <div className="space-y-4">
        {ordered.map(([sid, list]) => {
          const slice = sectorsById.get(sid);
          const sectorValue = slice ? getColorValue(slice, lens.color) : 0;
          return (
            <div key={sid}>
              <button
                onClick={() => onPickSector(sid)}
                className="mb-1.5 flex w-full items-baseline justify-between gap-2 text-left active:opacity-80"
              >
                <p className="text-[13px] font-semibold text-foreground">{SECTORS[sid].label}</p>
                <p
                  className={cn(
                    "text-[12px] font-semibold tabular-nums",
                    sectorValue >= 0 ? "text-gain" : "text-loss",
                  )}
                >
                  {formatColorValue(sectorValue, lens.color)}
                </p>
              </button>
              <div className="grid grid-cols-4 gap-1.5">
                {list
                  .sort((a, b) => getColorValue(b, lens.color) - getColorValue(a, lens.color))
                  .map(renderStockTile)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const sorted = [...filtered].sort((a, b) => getColorValue(b, lens.color) - getColorValue(a, lens.color));
  return <div className="grid grid-cols-4 gap-1.5">{sorted.map(renderStockTile)}</div>;
}

/* ================================================================== */
/*  List view — respects groupBy                                        */
/* ================================================================== */

function ListView({
  stocks,
  groupBy,
  sectorsById,
  lens,
  matchesFilter,
  activeFilter,
  onPickStock,
  onPickSector,
}: {
  stocks: HeatmapStock[];
  groupBy: GroupBy;
  sectorsById: Map<SectorId, SectorSlice>;
  lens: LensDef;
  matchesFilter: (s: HeatmapStock) => boolean;
  activeFilter: FilterId;
  onPickStock: (sym: string) => void;
  onPickSector: (id: SectorId) => void;
}) {
  const filtered = activeFilter === "none" ? stocks : stocks.filter(matchesFilter);

  const stockRow = (s: HeatmapStock, i: number, last: number) => (
    <button
      key={s.symbol}
      onClick={() => onPickStock(s.symbol)}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left active:bg-muted",
        i < last && "border-b border-border/40",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[14px] font-semibold text-foreground">{s.symbol}</p>
          {HEATMAP_WATCHLIST.has(s.symbol) && lens.showWatchlistRing && (
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" aria-hidden />
          )}
        </div>
        <p className="text-[12px] text-muted-foreground truncate leading-tight">{s.name}</p>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-semibold tabular-nums text-foreground">{s.price.toFixed(2)}</p>
        <p
          className={cn(
            "text-[12px] font-semibold tabular-nums",
            getColorValue(s, lens.color) >= 0 ? "text-gain" : "text-loss",
          )}
        >
          {formatColorValue(getColorValue(s, lens.color), lens.color)}
        </p>
      </div>
    </button>
  );

  if (groupBy === "sector") {
    const bySector = new Map<SectorId, HeatmapStock[]>();
    for (const s of filtered) {
      const arr = bySector.get(s.sector) ?? [];
      arr.push(s);
      bySector.set(s.sector, arr);
    }
    const ordered = Array.from(bySector.entries()).sort((a, b) => {
      const wa = sectorsById.get(a[0])?.weight ?? 0;
      const wb = sectorsById.get(b[0])?.weight ?? 0;
      return wb - wa;
    });
    return (
      <div className="space-y-4">
        {ordered.map(([sid, list]) => {
          const slice = sectorsById.get(sid);
          const sectorValue = slice ? getColorValue(slice, lens.color) : 0;
          const sortedList = [...list].sort(
            (a, b) => getColorValue(b, lens.color) - getColorValue(a, lens.color),
          );
          return (
            <div key={sid} className="overflow-hidden rounded-2xl border border-border/60">
              <button
                onClick={() => onPickSector(sid)}
                className="flex w-full items-center justify-between gap-2 border-b border-border/60 bg-muted/50 px-4 py-2.5 text-left active:bg-muted"
              >
                <p className="text-[13px] font-semibold text-foreground">{SECTORS[sid].label}</p>
                <p
                  className={cn(
                    "text-[12px] font-semibold tabular-nums",
                    sectorValue >= 0 ? "text-gain" : "text-loss",
                  )}
                >
                  {formatColorValue(sectorValue, lens.color)}
                </p>
              </button>
              {sortedList.map((s, i) => stockRow(s, i, sortedList.length - 1))}
            </div>
          );
        })}
      </div>
    );
  }

  const sorted = [...filtered].sort(
    (a, b) => getColorValue(b, lens.color) - getColorValue(a, lens.color),
  );
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      {sorted.map((s, i) => stockRow(s, i, sorted.length - 1))}
    </div>
  );
}
