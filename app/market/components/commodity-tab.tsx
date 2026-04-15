"use client";

import { useState } from "react";
import { ScrollableTableWidget, type STWColumn } from "@/components/scrollable-table-widget";
import { ChangeCell, RangeBar } from "./market-table";

// ---- Data types ----
interface CommodityRow {
  name: string;
  unit: string;
  last: string;
  lastNum: number;
  change: string;
  changePct: string;
  yearRange: [number, number];
  isUp: boolean;
  category: string;
}

// ---- Filter pills ----
const FILTERS = ["Most Popular", "Precious Metals", "Energy", "Agriculture", "Industrial"] as const;
type CommodityFilter = (typeof FILTERS)[number];

// ---- Mock data ----
const COMMODITIES: CommodityRow[] = [
  // Precious Metals
  { name: "Gold",      unit: "/oz",    last: "2,342", lastNum: 2342, change: "+18.40", changePct: "+0.79%", yearRange: [1810, 2450], isUp: true,  category: "Precious Metals" },
  { name: "Silver",    unit: "/oz",    last: "29",    lastNum: 29,   change: "+0.36",  changePct: "+1.25%", yearRange: [22, 32],     isUp: true,  category: "Precious Metals" },
  { name: "Platinum",  unit: "/oz",    last: "982",   lastNum: 982,  change: "-3.10",  changePct: "-0.31%", yearRange: [840, 1080],  isUp: false, category: "Precious Metals" },
  { name: "Palladium", unit: "/oz",    last: "1,024", lastNum: 1024, change: "+18.20", changePct: "+1.81%", yearRange: [880, 1260],  isUp: true,  category: "Precious Metals" },
  { name: "Rhodium",   unit: "/oz",    last: "4,625", lastNum: 4625, change: "+42.00", changePct: "+0.92%", yearRange: [3800, 5200], isUp: true,  category: "Precious Metals" },
  // Energy
  { name: "Crude Oil WTI", unit: "/bbl",   last: "78",  lastNum: 78,   change: "-0.91", changePct: "-1.15%", yearRange: [64, 94],     isUp: false, category: "Energy" },
  { name: "Brent Crude",   unit: "/bbl",   last: "82",  lastNum: 82,   change: "-0.72", changePct: "-0.87%", yearRange: [68, 98],     isUp: false, category: "Energy" },
  { name: "Natural Gas",   unit: "/MMBtu", last: "2",   lastNum: 2,    change: "+0.072",changePct: "+3.41%", yearRange: [1, 4],       isUp: true,  category: "Energy" },
  { name: "Heating Oil",   unit: "/gal",   last: "2",   lastNum: 2,    change: "-0.018",changePct: "-0.68%", yearRange: [2, 3],       isUp: false, category: "Energy" },
  { name: "RBOB Gasoline", unit: "/gal",   last: "2",   lastNum: 2,    change: "+0.024",changePct: "+0.98%", yearRange: [2, 3],       isUp: true,  category: "Energy" },
  { name: "Coal",          unit: "/MT",    last: "128",  lastNum: 128,  change: "-1.80", changePct: "-1.38%", yearRange: [98, 168],    isUp: false, category: "Energy" },
  { name: "Uranium",       unit: "/lb",    last: "82",   lastNum: 82,   change: "+1.20", changePct: "+1.48%", yearRange: [48, 106],    isUp: true,  category: "Energy" },
  // Agriculture
  { name: "Wheat",     unit: "/bu", last: "612",   lastNum: 612,   change: "-13.50", changePct: "-2.16%", yearRange: [520, 780],     isUp: false, category: "Agriculture" },
  { name: "Corn",      unit: "/bu", last: "448",   lastNum: 448,   change: "+4.25",  changePct: "+0.96%", yearRange: [380, 540],     isUp: true,  category: "Agriculture" },
  { name: "Soybeans",  unit: "/bu", last: "1,182", lastNum: 1182,  change: "+8.50",  changePct: "+0.72%", yearRange: [1020, 1380],   isUp: true,  category: "Agriculture" },
  { name: "Coffee",    unit: "/lb", last: "228",   lastNum: 228,   change: "+6.15",  changePct: "+2.77%", yearRange: [142, 260],     isUp: true,  category: "Agriculture" },
  { name: "Cocoa",     unit: "/MT", last: "7,842", lastNum: 7842,  change: "+124.00",changePct: "+1.61%", yearRange: [5200, 8400],   isUp: true,  category: "Agriculture" },
  { name: "Sugar",     unit: "/lb", last: "0",     lastNum: 0,     change: "-0.0032",changePct: "-1.47%", yearRange: [0, 0],         isUp: false, category: "Agriculture" },
  { name: "Cotton",    unit: "/lb", last: "0",     lastNum: 0,     change: "+0.0068",changePct: "+0.81%", yearRange: [0, 1],         isUp: true,  category: "Agriculture" },
  { name: "Live Cattle",unit: "/lb", last: "1",    lastNum: 1,     change: "+0.0142",changePct: "+0.77%", yearRange: [1, 2],         isUp: true,  category: "Agriculture" },
  // Industrial
  { name: "Copper",    unit: "/lb", last: "4",      lastNum: 4,     change: "+0.024",  changePct: "+0.56%", yearRange: [3, 5],         isUp: true,  category: "Industrial" },
  { name: "Aluminum",  unit: "/MT", last: "2,418",  lastNum: 2418,  change: "-12.00",  changePct: "-0.49%", yearRange: [2080, 2680],   isUp: false, category: "Industrial" },
  { name: "Zinc",      unit: "/MT", last: "2,684",  lastNum: 2684,  change: "+18.00",  changePct: "+0.68%", yearRange: [2240, 2920],   isUp: true,  category: "Industrial" },
  { name: "Nickel",    unit: "/MT", last: "16,842", lastNum: 16842, change: "-124.00", changePct: "-0.73%", yearRange: [14200, 19800], isUp: false, category: "Industrial" },
  { name: "Iron Ore",  unit: "/MT", last: "112",    lastNum: 112,   change: "+1.80",   changePct: "+1.63%", yearRange: [88, 138],      isUp: true,  category: "Industrial" },
  { name: "Tin",       unit: "/MT", last: "28,420", lastNum: 28420, change: "+340.00", changePct: "+1.21%", yearRange: [22400, 32600], isUp: true,  category: "Industrial" },
  { name: "Lumber",    unit: "/MBF",last: "542",    lastNum: 542,   change: "-8.40",   changePct: "-1.52%", yearRange: [420, 640],     isUp: false, category: "Industrial" },
];

// ---- STW columns ----
const commodityColumns: STWColumn[] = [
  { header: "Name", align: "left" },
  { header: "Last Price", align: "right", minWidth: 90 },
  { header: "Change", align: "right", minWidth: 80 },
  { header: "Change %", align: "right", minWidth: 80 },
  { header: "1Y Range", align: "center", minWidth: 160 },
];

function commodityRows(data: CommodityRow[]): React.ReactNode[][] {
  return data.map((r) => [
    <div key="name">
      <div className="text-[14px] font-semibold text-foreground whitespace-normal leading-tight">{r.name}</div>
      <div className="text-[12px] text-muted-foreground">{r.unit}</div>
    </div>,
    <span key="last" className="text-[14px] tabular-nums font-medium text-foreground">{r.last}</span>,
    <ChangeCell key="chg" value={r.change} isUp={r.isUp} />,
    <ChangeCell key="pct" value={r.changePct} isUp={r.isUp} />,
    <RangeBar key="yr" low={r.yearRange[0]} high={r.yearRange[1]} current={r.lastNum} />,
  ]);
}

// ---- Component ----
export function CommodityTab() {
  const [filter, setFilter] = useState<CommodityFilter>("Most Popular");

  const filtered =
    filter === "Most Popular"
      ? COMMODITIES
      : COMMODITIES.filter((c) => c.category === filter);

  return (
    <div className="pb-8">
      <div className="px-5 pt-5">
        <ScrollableTableWidget
          title="Commodities"
          description="Live spot prices for major commodities"
          tabs={FILTERS.map((f) => ({ id: f, label: f }))}
          activeTab={filter}
          onTabChange={(id) => setFilter(id as CommodityFilter)}
          pillLayoutId="commodity-pill"
          columns={commodityColumns}
          rows={commodityRows(filtered)}
          visibleDataCols={2}
          scrollableMinWidth={390}
          rowHeight="h-[58px]"
          animationKey={`commodity-${filter}`}
          footer={{ label: "View All Commodities" }}
        />
      </div>
    </div>
  );
}
