"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LayoutGrid, List, Rows3, ChevronDown, X, Check, TrendingUp, TrendingDown } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Button } from "@/components/ui/button";
import {
  HEATMAP_INDICES,
  heatmapStocksByIndex,
} from "@/components/heatmap/data";
import {
  colorScaleForAxis,
  formatColorValue,
  getColorValue,
  getSizeValue,
  heatColor,
  treemapLayout,
  type TreemapInput,
} from "@/components/heatmap/treemap";
import type { HeatmapIndexId, ColorAxis, LensDef } from "@/components/heatmap/types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { DEFAULT_LENS } from "@/components/heatmap/types";
import { HeatmapLensSheet } from "@/components/heatmap/lens-sheet"; // eslint-disable-line @typescript-eslint/no-unused-vars

const TM_W = 400;
const TM_H = 1100;

export default function HeatmapPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [indexId, setIndexId] = useState<HeatmapIndexId>("sp500");
  // Lens is locked to DEFAULT for MVP1 — UI to change it is hidden below.
  const lens = DEFAULT_LENS;
  // const [lens, setLens] = useState<LensDef>(DEFAULT_LENS);
  // const [lensOpen, setLensOpen] = useState(false);
  const [marketSheetOpen, setMarketSheetOpen] = useState(false);
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

  const stocks = useMemo(() => heatmapStocksByIndex[indexId], [indexId]);
  const stocksById = useMemo(
    () => Object.fromEntries(stocks.map((s) => [s.symbol, s])),
    [stocks],
  );

  const tiles = useMemo(() => {
    const input: TreemapInput[] = stocks.map((s) => ({
      id: s.symbol,
      size: getSizeValue(s, lens.size),
      value: getColorValue(s, lens.color),
    }));
    return treemapLayout(input, TM_W, TM_H);
  }, [stocks, lens.size, lens.color]);

  return (
    <div className="h-dvh bg-background flex flex-col">
      <div className="mx-auto flex h-dvh max-w-[430px] flex-col w-full">
        {/* Grey header section — expanded on top, collapses on scroll */}
        <div className="shrink-0 bg-muted/50 border-b border-border/50">
          <StatusBar />

          {/* Top bar — ← [compact title] Learn */}
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
              Market at a Glance
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
                Market at a Glance
              </h1>
              <p className="mt-1.5 text-[14px] leading-snug text-muted-foreground">
                Every stock in the index, on one screen.
                <br />
                Size maps to weight. Color maps to today&apos;s move.{" "}
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

          {/* Pills row — Market selector · Trend · View flipper */}
          <div className="flex items-center gap-2 px-4 pb-3">
            {/* 1. Market selector with chevron */}
            <button
              onClick={() => setMarketSheetOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-full bg-foreground text-background px-3.5 text-[13px] font-semibold active:scale-[0.97] transition-transform"
            >
              {HEATMAP_INDICES.find((i) => i.id === indexId)!.shortLabel}
              <ChevronDown size={14} strokeWidth={2.4} />
            </button>

            {/* 1b. Trend toggle — shows/hides intraday-direction arrows */}
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

            {/* 2. Lens pill — hidden for MVP1 */}
            {/* <button
              onClick={() => setLensOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-[13px] font-semibold text-foreground active:scale-[0.97] transition-transform"
            >
              <Sliders size={13} strokeWidth={2.2} />
              Lens
            </button> */}

            <div className="flex-1" />

            {/* 3. View flipper */}
            <button
              onClick={cycleViewMode}
              className="flex h-8 items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3.5 text-[13px] font-semibold text-foreground active:scale-[0.97] transition-transform"
            >
              <currentView.Icon size={14} strokeWidth={2.2} />
              {currentView.label}
            </button>
          </div>
        </div>

        {/* Main body — switches between heatmap / grid / list */}
        {viewMode === "heatmap" && (
          <div
            className="flex-1 min-h-0 overflow-y-auto no-scrollbar"
            onScroll={handleViewScroll}
          >
            <div className="relative w-full" style={{ height: TM_H }}>
              {tiles.map((r) => {
                const showLabel = r.w > 28 && r.h > 24;
                const showValue = r.w > 42 && r.h > 32;
                const isLarge = r.w > 65 && r.h > 50;
                const showTrend = r.w > 42 && r.h > 48;
                const color = heatColor(r.value, lens.color, isDark);
                const stock = stocksById[r.id];
                const trend = stock?.chg1h ?? 0;
                return (
                  <div
                    key={r.id}
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
                      style={{ backgroundColor: color }}
                    >
                      {showLabel && (
                        <span
                          className={cn(
                            "font-bold leading-none text-center px-1",
                            isDark ? "text-white" : "text-black/80",
                          )}
                          style={{ fontSize: isLarge ? 14 : 11 }}
                        >
                          {r.id}
                        </span>
                      )}
                      {showValue && (
                        <span
                          className={cn(
                            "mt-0.5 leading-none tabular-nums",
                            isDark ? "text-white/80" : "text-black/50",
                          )}
                          style={{ fontSize: isLarge ? 12 : 9 }}
                        >
                          {formatColorValue(r.value, lens.color)}
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

        {viewMode === "grid" && (
          <div
            className="flex-1 min-h-0 overflow-y-auto px-3 pt-2 pb-4"
            onScroll={handleViewScroll}
          >
            <div className="grid grid-cols-4 gap-1.5">
              {[...stocks]
                .sort((a, b) => getColorValue(b, lens.color) - getColorValue(a, lens.color))
                .map((s) => {
                  const v = getColorValue(s, lens.color);
                  const color = heatColor(v, lens.color, isDark);
                  return (
                    <div
                      key={s.symbol}
                      className="flex aspect-square flex-col items-center justify-center rounded-xl p-1"
                      style={{ backgroundColor: color }}
                    >
                      <span className={cn("text-[12px] font-bold leading-none", isDark ? "text-white" : "text-black/85")}>
                        {s.symbol}
                      </span>
                      <span className={cn("mt-1 text-[11px] tabular-nums leading-none", isDark ? "text-white/80" : "text-black/55")}>
                        {formatColorValue(v, lens.color)}
                      </span>
                      {trendEnabled && s.chg1h !== 0 && (
                        s.chg1h > 0 ? (
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

        {viewMode === "list" && (
          <div
            className="flex-1 min-h-0 overflow-y-auto"
            onScroll={handleViewScroll}
          >
            {[...stocks]
              .sort((a, b) => getColorValue(b, lens.color) - getColorValue(a, lens.color))
              .map((s, i) => {
                const v = getColorValue(s, lens.color);
                return (
                  <div
                    key={s.symbol}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3",
                      i < stocks.length - 1 && "border-b border-border/40",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-foreground">{s.symbol}</p>
                      <p className="text-[12px] text-muted-foreground truncate leading-tight">{s.name}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-[14px] font-semibold tabular-nums text-foreground">{s.price.toFixed(2)}</p>
                      <p className={cn("text-[12px] font-semibold tabular-nums", v >= 0 ? "text-gain" : "text-loss")}>
                        {formatColorValue(v, lens.color)}
                      </p>
                      {trendEnabled && s.chg1h !== 0 && (
                        s.chg1h > 0 ? (
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

        {/* Bottom bar — fixed at bottom */}
        <div className="shrink-0 border-t border-border/40 bg-background/92 backdrop-blur-md">
          <div className="flex items-center gap-3 px-5 py-3">
            <LegendBar axis={lens.color} isDark={isDark} />
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

      {/* Market selector sheet */}
      <MarketSelectorSheet
        open={marketSheetOpen}
        activeId={indexId}
        onSelect={(id) => {
          setIndexId(id);
          setMarketSheetOpen(false);
        }}
        onClose={() => setMarketSheetOpen(false)}
      />

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
/*  Market selector bottom sheet                                        */
/* ================================================================== */

function MarketSelectorSheet({
  open,
  activeId,
  onSelect,
  onClose,
}: {
  open: boolean;
  activeId: HeatmapIndexId;
  onSelect: (id: HeatmapIndexId) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-[430px] rounded-t-3xl border-t border-border/60 bg-background pt-3 pb-8 shadow-xl"
          >
            <div className="mt-4 flex items-start justify-between gap-3 px-5">
              <div>
                <p className="text-[20px] font-bold tracking-tight text-foreground">Select Market</p>
                <p className="text-[14px] text-muted-foreground leading-tight mt-0.5">
                  Choose an index to explore.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>
            <div className="mt-5 px-5">
              <div className="overflow-hidden rounded-xl border border-border/60">
                {HEATMAP_INDICES.map((idx, i) => {
                  const active = idx.id === activeId;
                  return (
                    <button
                      key={idx.id}
                      onClick={() => onSelect(idx.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors",
                        active ? "bg-foreground/5" : "active:bg-muted",
                        i < HEATMAP_INDICES.length - 1 && "border-b border-border/60",
                      )}
                    >
                      <div>
                        <p className="text-[15px] font-semibold text-foreground">{idx.label}</p>
                      </div>
                      {active && (
                        <Check size={18} strokeWidth={2.4} className="text-foreground shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ================================================================== */
/*  Onboarding help sheet — carousel explaining the heatmap             */
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
      title: "Every box is a stock",
      body: "Bigger boxes are bigger companies. Greener is up, redder is down. Size and color each map to data you pick.",
      visual: (
        <div className="flex h-72 w-full items-stretch gap-1.5 p-3" style={{ backgroundColor: isDark ? "#0f1419" : "#f1f5f9" }}>
          <div className="flex-[3] rounded-xl bg-emerald-500/90 flex items-end justify-start p-2">
            <span className={cn("text-[13px] font-bold", isDark ? "text-white" : "text-black/80")}>AAPL<br/><span className="text-[11px] font-semibold opacity-80">+1.2%</span></span>
          </div>
          <div className="flex flex-[2] flex-col gap-1.5">
            <div className="flex-[3] rounded-xl bg-red-500/85 flex items-end justify-start p-2">
              <span className={cn("text-[11px] font-bold", isDark ? "text-white" : "text-black/80")}>TSLA<br/><span className="text-[10px] font-semibold opacity-80">−3.4%</span></span>
            </div>
            <div className="flex-[2] rounded-xl bg-emerald-400/80 flex items-end justify-start p-2">
              <span className={cn("text-[10px] font-bold", isDark ? "text-white" : "text-black/80")}>NVDA<br/><span className="text-[9px] font-semibold opacity-80">+0.8%</span></span>
            </div>
            <div className="flex-[1] rounded-xl bg-red-400/70" />
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
      body: "A stock at +1.2% could be cooling off from +5%, or rebounding from −2%. The arrow shows which way it's headed right now.",
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
      body: "Heatmap gives you the forest at a glance. Grid shows equal-weight tiles. List ranks the whole index by your chosen lens.",
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
