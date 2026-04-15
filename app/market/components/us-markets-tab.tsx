"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollableTableWidget, type STWColumn } from "@/components/scrollable-table-widget";
import { PctCell, RangeBar, AlertButton } from "./market-table";
import {
  US_IDX_POPULAR, US_IDX_STRATEGY,
  US_IDX_THEMATIC, US_IDX_VOL_SENTIMENT, US_IDX_FIXED_INCOME,
  US_SECTORS, US_SECTORS_ALT, US_ECONOMIC,
  type PerformanceRow, type EconomicIndicator,
} from "../data";

// ---- Index filter pills ----
const INDEX_FILTERS = ["Popular", "Strategy", "Thematic", "Vol & Sentiment", "Fixed Income"] as const;
type IndexFilter = (typeof INDEX_FILTERS)[number];

const INDEX_DATA: Record<IndexFilter, PerformanceRow[]> = {
  "Popular": US_IDX_POPULAR,
  "Strategy": US_IDX_STRATEGY,
  "Thematic": US_IDX_THEMATIC,
  "Vol & Sentiment": US_IDX_VOL_SENTIMENT,
  "Fixed Income": US_IDX_FIXED_INCOME,
};

// ---- Sector filter pills ----
const SECTOR_FILTERS = ["Conventional", "Alternative", "Cyclical", "Defensive", "Growth"] as const;
type SectorFilter = (typeof SECTOR_FILTERS)[number];

const CYCLICAL_SECTORS = ["Technology", "Consumer Discr.", "Financials", "Industrials", "Basic Materials", "Real Estate"];
const DEFENSIVE_SECTORS = ["Healthcare", "Consumer Staples", "Utilities", "Comm. Svcs"];
const GROWTH_SECTORS = ["Technology", "Consumer Discr.", "Comm. Svcs"];

// ---- Performance table STW columns ----
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

// ---- Economic STW columns ----
const econColumns: STWColumn[] = [
  { header: "Indicator", align: "left" },
  { header: "Value", align: "right", minWidth: 80 },
  { header: "Change", align: "right", minWidth: 80 },
  { header: "Previous", align: "right", minWidth: 80 },
  { header: "Released", align: "right", minWidth: 90 },
  { header: "Next", align: "right", minWidth: 90 },
];

function econRows(data: EconomicIndicator[]): React.ReactNode[][] {
  return data.map((item) => [
    <span key="label" className="text-[14px] font-semibold text-foreground">{item.label}</span>,
    <span key="value" className="text-[14px] font-medium tabular-nums text-foreground">{item.value}</span>,
    <span
      key="change"
      className={cn(
        "text-[14px] font-medium tabular-nums",
        item.badge.direction === "up" && "text-gain",
        item.badge.direction === "down" && "text-loss",
        item.badge.direction === "neutral" && "text-muted-foreground"
      )}
    >
      {item.badge.text}
    </span>,
    <span key="prev" className="text-[14px] font-medium tabular-nums text-muted-foreground">{item.previous}</span>,
    <span key="released" className="text-[14px] font-medium text-muted-foreground">{item.releasedDate || "—"}</span>,
    <span key="next" className="text-[14px] font-medium text-muted-foreground">{item.nextDate || "—"}</span>,
  ]);
}

// ---- Main component ----
export function USMarketsTab() {
  const [indexFilter, setIndexFilter] = useState<IndexFilter>("Popular");
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>("Conventional");

  const filteredIndices = INDEX_DATA[indexFilter];

  const filteredSectors = sectorFilter === "Conventional" ? US_SECTORS
    : sectorFilter === "Alternative" ? US_SECTORS_ALT
    : sectorFilter === "Cyclical" ? US_SECTORS.filter(r => CYCLICAL_SECTORS.includes(r.name))
    : sectorFilter === "Defensive" ? US_SECTORS.filter(r => DEFENSIVE_SECTORS.includes(r.name))
    : US_SECTORS.filter(r => GROWTH_SECTORS.includes(r.name));

  return (
    <div className="pb-8">
      {/* Indices */}
      <div className="px-5 pt-5">
        <ScrollableTableWidget
          title="Indices"
          description="Real-time index performance"
          tabs={INDEX_FILTERS.map((f) => ({ id: f, label: f }))}
          activeTab={indexFilter}
          onTabChange={(id) => setIndexFilter(id as IndexFilter)}
          pillLayoutId="us-idx-pill"
          columns={perfColumns}
          rows={perfRows(filteredIndices)}
          visibleDataCols={2}
          rowHeight="h-[48px]"
          animationKey={`idx-${indexFilter}`}
          footer={{ label: "View All Indices" }}
        />
      </div>

      <div className="h-6" />

      {/* Sectors */}
      <div className="px-5">
        <ScrollableTableWidget
          title="Sectors"
          description="Sector ETF performance"
          tabs={SECTOR_FILTERS.map((f) => ({ id: f, label: f }))}
          activeTab={sectorFilter}
          onTabChange={(id) => setSectorFilter(id as SectorFilter)}
          pillLayoutId="us-sec-pill"
          columns={perfColumns}
          rows={perfRows(filteredSectors)}
          visibleDataCols={2}
          rowHeight="h-[48px]"
          animationKey={`sec-${sectorFilter}`}
          footer={{ label: "View All Sectors" }}
        />
      </div>

      <div className="h-6" />

      {/* Economic Overview */}
      <div className="px-5">
        <ScrollableTableWidget
          title="Economic Overview"
          description="Key macroeconomic indicators for the US economy"
          pillLayoutId="us-econ-pill"
          columns={econColumns}
          rows={econRows(US_ECONOMIC)}
          visibleDataCols={2}
          rowHeight="h-[48px]"
          scrollableMinWidth={420}
          footer={{ label: "View More" }}
        />
      </div>
    </div>
  );
}
