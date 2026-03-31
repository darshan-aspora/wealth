"use client";

import { MarketTable, PctCell, RangeBar, AlertButton, type TableColumn } from "./market-table";
import { SectionHeader } from "./section-header";
import { ChevronRight } from "lucide-react";
import { UK_TOP_INDICES, type PerformanceRow } from "../data";

const indexColumns: TableColumn<PerformanceRow>[] = [
  { key: "name", label: "Name", align: "left", frozen: true, width: 200, render: (r) => <span className="text-[14px] font-semibold text-foreground whitespace-normal leading-tight">{r.name}</span> },
  { key: "last", label: "Level", align: "right", render: (r) => <span className="tabular-nums font-semibold text-foreground">{r.last.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> },
  { key: "today", label: "Today", align: "right", render: (r) => <PctCell value={r.today} /> },
  { key: "5d", label: "5 Days", align: "right", render: (r) => <PctCell value={r.fiveDays} /> },
  { key: "1m", label: "1 Month", align: "right", render: (r) => <PctCell value={r.oneMonth} /> },
  { key: "ytd", label: "YTD", align: "right", render: (r) => <PctCell value={r.ytd} /> },
  { key: "1y", label: "1 Year", align: "right", render: (r) => <PctCell value={r.oneYear} /> },
  { key: "3y", label: "3 Years", align: "right", render: (r) => <PctCell value={r.threeYears} /> },
  { key: "dayRange", label: "Day Range", align: "center", render: (r) => <RangeBar low={r.dayRange[0]} high={r.dayRange[1]} current={r.last} /> },
  { key: "1yRange", label: "1Y Range", align: "center", render: (r) => <RangeBar low={r.weekRange52[0]} high={r.weekRange52[1]} current={r.last} /> },
  { key: "alert", label: "Set Alert", align: "center", render: () => <AlertButton /> },
];

export function UKTab() {
  return (
    <div className="pb-8">
      <div className="px-5 pt-5">
        <SectionHeader
          title="Indices"
          subtitle="Real-time index performance"
        />
        <MarketTable columns={indexColumns} data={UK_TOP_INDICES} />
        <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          View All Indices
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
