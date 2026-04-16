"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { METRIC_SECTIONS, type StockCompareData, type MetricRow } from "../lib/metrics";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CompareTableProps {
  data: StockCompareData[];
  onAddStock: () => void;
  onRemoveStock: (symbol: string) => void;
  onHeaderTap: (symbol: string) => void;
}

const METRIC_COL_W = 128;
const STOCK_COL_W = 128;
const ADD_COL_W = 80;

/* ------------------------------------------------------------------ */
/*  Highlighting logic for best/worst                                  */
/* ------------------------------------------------------------------ */

function pickBest(row: MetricRow, data: StockCompareData[]): { bestIdx: number; worstIdx: number } {
  if (row.kind === "plain") return { bestIdx: -1, worstIdx: -1 };
  const values = data.map((d) => row.getValue(d).numeric);
  const withIdx = values
    .map((v, i) => ({ v, i }))
    .filter((x) => x.v != null && Number.isFinite(x.v as number)) as { v: number; i: number }[];

  if (withIdx.length < 2) return { bestIdx: -1, worstIdx: -1 };

  let bestIdx = -1;
  let worstIdx = -1;

  if (row.kind === "best-low") {
    bestIdx = withIdx.reduce((a, b) => (b.v < a.v ? b : a)).i;
    worstIdx = withIdx.reduce((a, b) => (b.v > a.v ? b : a)).i;
  } else {
    // best-high, change, percent-signed
    bestIdx = withIdx.reduce((a, b) => (b.v > a.v ? b : a)).i;
    worstIdx = withIdx.reduce((a, b) => (b.v < a.v ? b : a)).i;
  }

  // For change/percent-signed, only highlight if spread is meaningful
  if ((row.kind === "change" || row.kind === "percent-signed") && bestIdx !== -1) {
    const spread = Math.abs(withIdx[0].v - withIdx[withIdx.length - 1].v);
    if (spread < 0.01) return { bestIdx: -1, worstIdx: -1 };
  }

  return { bestIdx, worstIdx };
}

function renderCell(
  row: MetricRow,
  d: StockCompareData,
  index: number,
  bestIdx: number,
  worstIdx: number,
) {
  const { display, numeric } = row.getValue(d);

  if (row.kind === "change" || row.kind === "percent-signed") {
    const isGain = (numeric ?? 0) >= 0;
    return (
      <span
        className={cn(
          "text-[15px] font-semibold tabular-nums",
          numeric == null
            ? "text-muted-foreground/40"
            : isGain
              ? "text-[hsl(var(--gain))]"
              : "text-[hsl(var(--loss))]",
        )}
      >
        {display}
      </span>
    );
  }

  const isBest = index === bestIdx;
  const isWorst = index === worstIdx;

  return (
    <span
      className={cn(
        "text-[15px] tabular-nums",
        isBest
          ? "font-bold text-foreground"
          : isWorst
            ? "font-medium text-muted-foreground/55"
            : "font-medium text-foreground",
      )}
    >
      {display}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Stock column header                                                */
/* ------------------------------------------------------------------ */

function StockColumnHeader({
  data,
  onTap,
  onRemove,
}: {
  data: StockCompareData;
  onTap: () => void;
  onRemove: () => void;
}) {
  const gain = (data.changePct ?? 0) >= 0;

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-2 text-center">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${data.symbol}`}
        className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-90 transition-transform"
      >
        <X size={12} strokeWidth={2.5} />
      </button>

      <button type="button" onClick={onTap} className="flex w-full flex-col items-center gap-0.5 active:opacity-70 transition-opacity">
        <span className="text-[15px] font-bold text-foreground leading-tight">{data.symbol}</span>
        <span className="text-[15px] font-semibold tabular-nums text-foreground leading-tight">
          {data.price}
        </span>
        <span
          className={cn(
            "text-[12px] font-semibold tabular-nums leading-tight",
            data.changePct == null
              ? "text-muted-foreground/40"
              : gain
                ? "text-[hsl(var(--gain))]"
                : "text-[hsl(var(--loss))]",
          )}
        >
          {data.changePct != null ? (gain ? "+" : "") + data.changePct.toFixed(2) + "%" : "—"}
        </span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main table                                                         */
/* ------------------------------------------------------------------ */

export function CompareTable({ data, onAddStock, onRemoveStock, onHeaderTap }: CompareTableProps) {
  const stockCount = data.length;
  const totalWidth = METRIC_COL_W + stockCount * STOCK_COL_W + ADD_COL_W;

  return (
    <div className="relative">
      <div className="overflow-x-auto no-scrollbar">
        <div style={{ width: totalWidth }} className="relative">
          {/* ── Sticky stock column header row ── */}
          <div className="sticky top-0 z-20 flex h-[96px] items-stretch border-b border-border/60 bg-background">
            {/* Metric label spacer (frozen left) */}
            <div
              className="sticky left-0 z-10 flex items-end justify-start bg-background pl-5 pb-3"
              style={{ width: METRIC_COL_W }}
            >
              <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Compare
              </span>
            </div>

            {/* Stock columns */}
            <AnimatePresence initial={false}>
              {data.map((d) => (
                <motion.div
                  key={d.symbol}
                  layout
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="shrink-0 border-l border-border/40"
                  style={{ width: STOCK_COL_W }}
                >
                  <StockColumnHeader
                    data={d}
                    onTap={() => onHeaderTap(d.symbol)}
                    onRemove={() => onRemoveStock(d.symbol)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add stock column */}
            <div
              className="shrink-0 border-l border-border/40 flex items-center justify-center"
              style={{ width: ADD_COL_W }}
            >
              <button
                type="button"
                onClick={onAddStock}
                aria-label="Add stock to compare"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground active:scale-90 active:bg-muted transition-all"
              >
                <Plus size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* ── Metric sections ── */}
          {METRIC_SECTIONS.map((section) => (
            <div key={section.id}>
              {/* Section header band */}
              <div className="flex h-[36px] items-end bg-muted/30">
                <div
                  className="sticky left-0 z-10 bg-muted/30 pl-5 pb-1.5"
                  style={{ width: METRIC_COL_W }}
                >
                  <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </span>
                </div>
                <div className="flex-1" />
              </div>

              {/* Section rows */}
              {section.rows.map((row) => {
                const { bestIdx, worstIdx } = pickBest(row, data);
                return (
                  <div
                    key={row.key}
                    className="flex h-[52px] items-center border-b border-border/20"
                  >
                    <div
                      className="sticky left-0 z-10 bg-background pl-5 pr-3"
                      style={{ width: METRIC_COL_W }}
                    >
                      <span className="text-[14px] text-muted-foreground leading-snug">
                        {row.label}
                      </span>
                    </div>
                    {data.map((d, i) => (
                      <div
                        key={d.symbol}
                        className="shrink-0 flex items-center justify-center px-2"
                        style={{ width: STOCK_COL_W }}
                      >
                        {renderCell(row, d, i, bestIdx, worstIdx)}
                      </div>
                    ))}
                    <div className="shrink-0" style={{ width: ADD_COL_W }} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
