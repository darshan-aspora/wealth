"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sliders, LayoutGrid, List, Rows3, ChevronDown, X, Check } from "lucide-react";
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
import type { HeatmapIndexId, ColorAxis, LensDef } from "@/components/heatmap/types";
import { DEFAULT_LENS } from "@/components/heatmap/types";
import { HeatmapLensSheet } from "@/components/heatmap/lens-sheet";

const TM_W = 400;
const TM_H = 640;

export default function HeatmapPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [indexId, setIndexId] = useState<HeatmapIndexId>("sp500");
  const [lens, setLens] = useState<LensDef>(DEFAULT_LENS);
  const [lensOpen, setLensOpen] = useState(false);
  const [marketSheetOpen, setMarketSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewMode, setViewMode] = useState<"heatmap" | "list" | "grid">("heatmap");

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
        {/* Fixed header + pills */}
        <div className={cn("shrink-0 transition-colors", isScrolled && viewMode !== "heatmap" && "border-b border-border/50")}>
          <StatusBar />

          {/* Header — ← title 🔍 */}
          <header className="flex items-center justify-between px-3 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </Button>
            <h1 className="flex-1 text-[17px] font-bold tracking-tight text-foreground ml-1">
              Market at a Glance
            </h1>
          </header>

          {/* Pills row — Market selector · Lens · View flipper */}
          <div className="flex items-center gap-2 px-4 pb-3">
            {/* 1. Market selector with chevron */}
            <button
              onClick={() => setMarketSheetOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-foreground text-background px-3.5 py-1.5 text-[13px] font-semibold active:scale-[0.97] transition-transform"
            >
              {HEATMAP_INDICES.find((i) => i.id === indexId)!.shortLabel}
              <ChevronDown size={14} strokeWidth={2.4} />
            </button>

            {/* 2. Lens pill */}
            <button
              onClick={() => setLensOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-[13px] font-semibold text-foreground active:scale-[0.97] transition-transform"
            >
              <Sliders size={13} strokeWidth={2.2} />
              Lens
            </button>

            <div className="flex-1" />

            {/* 3. View flipper */}
            <button
              onClick={cycleViewMode}
              className="flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-[13px] font-semibold text-foreground active:scale-[0.97] transition-transform"
            >
              <currentView.Icon size={14} strokeWidth={2.2} />
              {currentView.label}
            </button>
          </div>
        </div>

        {/* Main body — switches between heatmap / grid / list */}
        {viewMode === "heatmap" && (
          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0 overflow-hidden">
              {tiles.map((r) => {
                const showLabel = r.w > 28 && r.h > 24;
                const showValue = r.w > 42 && r.h > 32;
                const isLarge = r.w > 65 && r.h > 50;
                const color = heatColor(r.value, lens.color, isDark);
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
            onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 0)}
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
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {viewMode === "list" && (
          <div
            className="flex-1 min-h-0 overflow-y-auto"
            onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 0)}
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
                    <div className="text-right">
                      <p className="text-[14px] font-semibold tabular-nums text-foreground">{s.price.toFixed(2)}</p>
                      <p className={cn("text-[12px] font-semibold tabular-nums", v >= 0 ? "text-gain" : "text-loss")}>
                        {formatColorValue(v, lens.color)}
                      </p>
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

      {/* Lens sheet */}
      <HeatmapLensSheet
        open={lensOpen}
        lens={lens}
        onChange={setLens}
        onClose={() => setLensOpen(false)}
      />

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
