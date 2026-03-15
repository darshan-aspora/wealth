"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MarketTable, PctCell, RangeBar, type TableColumn } from "./market-table";
import { SectionHeader } from "./section-header";
import { ChevronRight } from "lucide-react";
import {
  UK_IDX_POPULAR, UK_IDX_SECTORS, UK_IDX_STYLE, UK_IDX_DIVIDEND,
  type PerformanceRow,
} from "../data";

const INDEX_FILTERS = ["Popular", "Sectors", "Strategy", "Dividend"] as const;
type IndexFilter = (typeof INDEX_FILTERS)[number];

const INDEX_DATA: Record<IndexFilter, PerformanceRow[]> = {
  "Popular": UK_IDX_POPULAR,
  "Sectors": UK_IDX_SECTORS,
  "Strategy": UK_IDX_STYLE,
  "Dividend": UK_IDX_DIVIDEND,
};

const indexColumns: TableColumn<PerformanceRow>[] = [
  { key: "name", label: "Name", align: "left", frozen: true, width: 200, render: (r) => <span className="text-[14px] font-semibold text-foreground whitespace-normal leading-tight">{r.name}</span> },
  { key: "last", label: "Level", align: "right", render: (r) => <span className="font-mono tabular-nums font-semibold text-foreground">{r.last.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> },
  { key: "today", label: "Today", align: "right", render: (r) => <PctCell value={r.today} /> },
  { key: "5d", label: "5 Days", align: "right", render: (r) => <PctCell value={r.fiveDays} /> },
  { key: "1m", label: "1 Month", align: "right", render: (r) => <PctCell value={r.oneMonth} /> },
  { key: "ytd", label: "YTD", align: "right", render: (r) => <PctCell value={r.ytd} /> },
  { key: "1y", label: "1 Year", align: "right", render: (r) => <PctCell value={r.oneYear} /> },
  { key: "3y", label: "3 Years", align: "right", render: (r) => <PctCell value={r.threeYears} /> },
  { key: "dayRange", label: "Day Range", align: "right", render: (r) => <RangeBar low={r.dayRange[0]} high={r.dayRange[1]} current={r.last} /> },
  { key: "1yRange", label: "1Y Range", align: "right", render: (r) => <RangeBar low={r.weekRange52[0]} high={r.weekRange52[1]} current={r.last} /> },
];

export function UKTab() {
  const [indexFilter, setIndexFilter] = useState<IndexFilter>("Popular");

  return (
    <div className="pb-8">
      {/* Key Indices */}
      <div className="px-5 pt-5">
        <SectionHeader
          title="Indices"
          subtitle="Real-time index performance"
        />
        <div className="mb-3 -mx-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5 py-0.5">
            {INDEX_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setIndexFilter(f)}
                className={cn(
                  "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                  indexFilter === f
                    ? "bg-foreground text-background"
                    : "border border-border/60 text-muted-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={indexFilter}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <MarketTable columns={indexColumns} data={INDEX_DATA[indexFilter]} />
          </motion.div>
        </AnimatePresence>
        <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          View All Indices
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
