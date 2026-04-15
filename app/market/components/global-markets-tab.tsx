"use client";

import { useState } from "react";
import { ScrollableTableWidget, type STWColumn } from "@/components/scrollable-table-widget";
import { PctCell, RangeBar, AlertButton } from "./market-table";
import { GLOBAL_INDICES, type PerformanceRow } from "../data";

const INDEX_TABS = Object.keys(GLOBAL_INDICES);

const perfColumns: STWColumn[] = [
  { header: "Name", align: "left" },
  { header: "Level", align: "right", minWidth: 90 },
  { header: "Today", align: "right", minWidth: 80 },
  { header: "5 Days", align: "right", minWidth: 80 },
  { header: "1 Month", align: "right", minWidth: 80 },
  { header: "YTD", align: "right", minWidth: 80 },
  { header: "1 Year", align: "right", minWidth: 80 },
  { header: "3 Years", align: "right", minWidth: 80 },
  { header: "Day Range", align: "center", minWidth: 160 },
  { header: "1Y Range", align: "center", minWidth: 160 },
  { header: "Set Alert", align: "center", minWidth: 70 },
];

function perfRows(data: PerformanceRow[]): React.ReactNode[][] {
  return data.map((r) => [
    <span key="name" className="text-[14px] font-semibold text-foreground whitespace-normal leading-tight">{r.name}</span>,
    <span key="last" className="text-[14px] tabular-nums font-medium text-foreground">{r.last.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>,
    <PctCell key="today" value={r.today} />,
    <PctCell key="5d" value={r.fiveDays} />,
    <PctCell key="1m" value={r.oneMonth} />,
    <PctCell key="ytd" value={r.ytd} />,
    <PctCell key="1y" value={r.oneYear} />,
    <PctCell key="3y" value={r.threeYears} />,
    <RangeBar key="dr" low={r.dayRange[0]} high={r.dayRange[1]} current={r.last} />,
    <RangeBar key="yr" low={r.weekRange52[0]} high={r.weekRange52[1]} current={r.last} />,
    <AlertButton key="alert" />,
  ]);
}

export function GlobalMarketsTab() {
  const [idxTab, setIdxTab] = useState(INDEX_TABS[0]);

  return (
    <div className="pb-8">
      <div className="px-5 pt-5">
        <ScrollableTableWidget
          title="Indices"
          description="Real-time index performance"
          tabs={INDEX_TABS.map((f) => ({ id: f, label: f }))}
          activeTab={idxTab}
          onTabChange={setIdxTab}
          pillLayoutId="global-idx-pill"
          columns={perfColumns}
          rows={perfRows(GLOBAL_INDICES[idxTab])}
          visibleDataCols={2}
          rowHeight="h-[48px]"
          animationKey={`gidx-${idxTab}`}
          footer={{ label: "View All Indices" }}
        />
      </div>
    </div>
  );
}
