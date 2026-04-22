"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Bookmark, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fmtPct1Y,
  fmtVol,
  oneMonthVol,
  monthlyAvgVol,
  oneYearChange,
  MEGA_CONSENSUS,
  type Stock,
  type SortKey,
  type SortDir,
} from "@/app/explore/_data/movers";
import { RangeBar, ConsensusBadge } from "@/app/explore/components/movers-atoms";
import type { ColumnId } from "./columns-sheet";

interface Props {
  stocks: Stock[];
  columns: ColumnId[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey, dir: SortDir) => void;
  bookmarkedSymbols: Set<string>;
  onToggleBookmark: (sym: string) => void;
}

/* Column descriptors — labels, alignment, minWidths mirror the
 * What's Moving widget (`TopMoversCardless`). */
interface ColDef {
  id: ColumnId;
  label: string;
  align: "left" | "center" | "right";
  minWidth?: number;
  sortKey?: SortKey;
}

const COL_DEFS: Record<ColumnId, ColDef> = {
  price: { id: "price", label: "Price ($)", align: "right", sortKey: "price" },
  changePercent: { id: "changePercent", label: "Chg%", align: "right", sortKey: "changePercent" },
  oneYearChange: { id: "oneYearChange", label: "1Y Change", align: "right", minWidth: 80 },
  consensus: { id: "consensus", label: "Consensus", align: "center", minWidth: 120 },
  pe: { id: "pe", label: "PE", align: "right", minWidth: 48, sortKey: "pe" },
  marketCap: { id: "marketCap", label: "M.Cap", align: "right", minWidth: 68, sortKey: "marketCap" },
  revGrowth: { id: "revGrowth", label: "Rev Gr.", align: "right", minWidth: 74, sortKey: "revGrowth" },
  profitGrowth: { id: "profitGrowth", label: "Profit Gr.", align: "right", minWidth: 80, sortKey: "profitGrowth" },
  oneMonthVolume: { id: "oneMonthVolume", label: "1M Volume", align: "right", minWidth: 80, sortKey: "volume" },
  avgMonthlyVolume: { id: "avgMonthlyVolume", label: "Monthly Avg Vol", align: "right", minWidth: 110 },
  yearRange: { id: "yearRange", label: "1Y Range", align: "center", minWidth: 136 },
  bookmark: { id: "bookmark", label: "Watchlist", align: "center", minWidth: 80 },
};

// Match the widget's ScrollableTableWidget defaults so the table looks and
// behaves identically: 2 data cols visible at once, 120px min frozen width,
// 780px scrollable min-width.
const VISIBLE_DATA_COLS = 2;
const MIN_FROZEN_WIDTH = 120;
const SCROLLABLE_MIN_WIDTH = 780;

export function MoversTable({
  stocks,
  columns,
  sortKey,
  sortDir,
  onSort,
  bookmarkedSymbols,
  onToggleBookmark,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [frozenW, setFrozenW] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrolled(el.scrollLeft > 0);
  }, []);

  // Replicates ScrollableTableWidget.measure() — frozen = containerW minus
  // the summed width of the first N data columns. Ensures exactly
  // `VISIBLE_DATA_COLS` data columns fit next to the frozen Name column.
  const measure = useCallback(() => {
    const container = containerRef.current;
    const table = tableRef.current;
    if (!container || !table) return;

    const ths = table.querySelectorAll("thead th");
    if (ths.length < VISIBLE_DATA_COLS) return;

    let visibleSum = 0;
    for (let i = 0; i < VISIBLE_DATA_COLS; i++) {
      visibleSum += ths[i].getBoundingClientRect().width;
    }

    const containerW = container.getBoundingClientRect().width;
    setFrozenW(Math.max(MIN_FROZEN_WIDTH, containerW - visibleSum));
  }, []);

  useEffect(() => {
    measure();
  }, [measure, stocks, columns]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  const alignCls = (a: ColDef["align"]) =>
    a === "left" ? "text-left" : a === "center" ? "text-center" : "text-right";

  const handleHeaderClick = (def: ColDef) => {
    if (!def.sortKey) return;
    const nextDir: SortDir =
      sortKey === def.sortKey ? (sortDir === "desc" ? "asc" : "desc") : "desc";
    onSort(def.sortKey, nextDir);
  };

  // Reset horizontal scroll marker when visible columns change
  useEffect(() => {
    if (scrollRef.current) setIsScrolled(scrollRef.current.scrollLeft > 0);
  }, [columns]);

  // When both Price and Change% are selected, merge them into a stacked cell
  // rendered in the Price column. The separate Change% column is hidden.
  const mergePriceAndChg =
    columns.includes("price") && columns.includes("changePercent");
  const visibleColumns = mergePriceAndChg
    ? columns.filter((c) => c !== "changePercent")
    : columns;

  return (
    <div ref={containerRef} className="flex">
      {/* Frozen Name column — matches widget's frozen col exactly */}
      <div
        className={cn(
          "shrink-0 border-r transition-colors duration-200",
          isScrolled ? "border-border/40" : "border-transparent"
        )}
        style={{ width: frozenW ?? MIN_FROZEN_WIDTH }}
      >
        <div className="h-[40px] flex items-center pl-5 pr-3 text-[14px] font-medium text-muted-foreground">
          Stock
        </div>
        {stocks.map((s) => (
          <div key={s.symbol} className="h-[64px] flex items-center pl-5 pr-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
              <p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">
                {s.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable data columns */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-x-auto no-scrollbar min-w-0"
      >
        <table ref={tableRef} style={{ minWidth: SCROLLABLE_MIN_WIDTH }}>
          <thead>
            <tr className="h-[40px]">
              {visibleColumns.map((id) => {
                const def = COL_DEFS[id];
                const sortActive = def.sortKey === sortKey;
                const label =
                  mergePriceAndChg && id === "price" ? "Price" : def.label;
                return (
                  <th
                    key={id}
                    className={cn(
                      "px-3 text-[14px] font-medium text-muted-foreground whitespace-nowrap",
                      alignCls(def.align)
                    )}
                    style={def.minWidth ? { minWidth: def.minWidth } : undefined}
                  >
                    {def.sortKey ? (
                      <button
                        onClick={() => handleHeaderClick(def)}
                        className={cn(
                          "inline-flex items-center gap-1 transition-colors",
                          sortActive ? "text-foreground" : "hover:text-foreground"
                        )}
                      >
                        {sortActive &&
                          (sortDir === "desc" ? (
                            <ArrowDown size={12} strokeWidth={2.5} className="text-foreground" />
                          ) : (
                            <ArrowUp size={12} strokeWidth={2.5} className="text-foreground" />
                          ))}
                        <span>{label}</span>
                      </button>
                    ) : (
                      <span>{label}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {stocks.map((s) => {
              const chgColor = s.changePercent >= 0 ? "text-emerald-500" : "text-red-500";
              const oneY = oneYearChange(s.symbol);
              return (
                <tr key={s.symbol} className="h-[64px]">
                  {visibleColumns.map((id) => {
                    const def = COL_DEFS[id];
                    const renderMerged = mergePriceAndChg && id === "price";
                    return (
                      <td
                        key={id}
                        className={cn("px-3 whitespace-nowrap", alignCls(def.align))}
                      >
                        {renderMerged
                          ? renderPriceWithChange(s, chgColor)
                          : renderCell(
                              id,
                              s,
                              chgColor,
                              oneY,
                              bookmarkedSymbols,
                              onToggleBookmark
                            )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderPriceWithChange(s: Stock, chgColor: string) {
  return (
    <div className="flex flex-col items-end">
      <span className="whitespace-nowrap tabular-nums text-[14px] text-foreground">
        {s.price.toFixed(1)}
      </span>
      <span
        className={cn(
          "whitespace-nowrap tabular-nums text-[12px] font-semibold",
          chgColor
        )}
      >
        {s.changePercent >= 0 ? "+" : ""}
        {s.changePercent.toFixed(1)}%
      </span>
    </div>
  );
}

function renderCell(
  id: ColumnId,
  s: Stock,
  chgColor: string,
  oneY: number,
  bookmarks: Set<string>,
  toggle: (sym: string) => void
) {
  switch (id) {
    case "price":
      return (
        <span className="whitespace-nowrap tabular-nums text-[14px] text-foreground">
          {s.price.toFixed(1)}
        </span>
      );
    case "changePercent":
      return (
        <span
          className={cn(
            "whitespace-nowrap tabular-nums text-[14px] font-semibold",
            chgColor
          )}
        >
          {s.changePercent >= 0 ? "+" : ""}
          {s.changePercent.toFixed(1)}%
        </span>
      );
    case "oneYearChange":
      return (
        <span
          className={cn(
            "whitespace-nowrap tabular-nums text-[14px] font-semibold",
            oneY >= 0 ? "text-emerald-500" : "text-red-500"
          )}
        >
          {fmtPct1Y(s.symbol)}
        </span>
      );
    case "consensus": {
      const c = MEGA_CONSENSUS[s.symbol];
      return (
        <div className="flex justify-center">
          <ConsensusBadge {...(c ?? { buy: 10, hold: 10, sell: 5 })} />
        </div>
      );
    }
    case "pe":
      return (
        <span className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
          {s.pe != null ? Math.round(s.pe) : "—"}
        </span>
      );
    case "marketCap":
      return (
        <span className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
          {s.marketCap.replace("$", "")}
        </span>
      );
    case "revGrowth":
      return (
        <span
          className={cn(
            "whitespace-nowrap tabular-nums text-[14px] font-medium",
            s.revGrowth >= 0 ? "text-emerald-500" : "text-red-500"
          )}
        >
          {s.revGrowth >= 0 ? "+" : ""}
          {Math.round(s.revGrowth)}%
        </span>
      );
    case "profitGrowth":
      return (
        <span
          className={cn(
            "whitespace-nowrap tabular-nums text-[14px] font-medium",
            s.profitGrowth >= 0 ? "text-emerald-500" : "text-red-500"
          )}
        >
          {s.profitGrowth >= 0 ? "+" : ""}
          {Math.round(s.profitGrowth)}%
        </span>
      );
    case "oneMonthVolume":
      return (
        <span className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
          {fmtVol(oneMonthVol(s.symbol))}
        </span>
      );
    case "avgMonthlyVolume":
      return (
        <span className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
          {fmtVol(monthlyAvgVol(s.symbol))}
        </span>
      );
    case "yearRange":
      return <RangeBar low={s.low52w} high={s.high52w} current={s.price} />;
    case "bookmark":
      return (
        <div className="flex justify-center">
          <button
            onClick={() => toggle(s.symbol)}
            className="transition-transform active:scale-90"
          >
            <Bookmark
              size={20}
              strokeWidth={1.8}
              className={cn(
                "transition-colors",
                bookmarks.has(s.symbol)
                  ? "fill-foreground text-foreground"
                  : "text-muted-foreground/50"
              )}
            />
          </button>
        </div>
      );
  }
}
