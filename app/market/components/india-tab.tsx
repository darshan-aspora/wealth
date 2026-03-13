"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MarketTable, ChangeCell, PctCell, type TableColumn } from "./market-table";
import { SubTabs } from "./sub-tabs";
import { SectionHeader, SectionDivider } from "./section-header";
import { EconomicOverview } from "./economic-overview";
import { NewsAccordion } from "./news-accordion";
import {
  INDIA_INDICES, INDIA_SECTORS, INDIA_TOP_STOCKS, INDIA_NEWS, INDIA_ECONOMIC,
  INDIA_CURRENCIES, INDIA_COMMODITIES,
  type IndiaIndex, type IndiaSector, type IndiaStock, type GlobalRow,
} from "../data";

// ---- India Indices columns ----
const indexColumns: TableColumn<IndiaIndex>[] = [
  { key: "name", label: "Name", align: "left", frozen: true, minWidth: 150, render: (r) => <span className="text-[14px] font-semibold text-foreground">{r.name}</span> },
  { key: "last", label: "Last", align: "right", render: (r) => <span className="font-mono tabular-nums font-semibold text-foreground">{r.last}</span> },
  { key: "change", label: "Change", align: "right", render: (r) => <ChangeCell value={r.change} isUp={r.isUp} /> },
  { key: "changePct", label: "Change %", align: "right", render: (r) => <ChangeCell value={r.changePct} isUp={r.isUp} /> },
  { key: "dayRange", label: "Day Range", align: "right", render: (r) => <span className="text-[12px] font-mono tabular-nums text-muted-foreground">{r.dayRange}</span> },
];

// ---- India Sectors columns ----
const sectorColumns: TableColumn<IndiaSector>[] = [
  { key: "name", label: "Name", align: "left", frozen: true, minWidth: 150, render: (r) => <span className="text-[14px] font-semibold text-foreground">{r.name}</span> },
  { key: "today", label: "Today", align: "right", render: (r) => <PctCell value={r.today} /> },
  { key: "1m", label: "1 Month", align: "right", render: (r) => <PctCell value={r.oneMonth} /> },
  { key: "ytd", label: "YTD", align: "right", render: (r) => <PctCell value={r.ytd} /> },
  { key: "1y", label: "1 Year", align: "right", render: (r) => <PctCell value={r.oneYear} /> },
];

// ---- India Currencies & Commodities columns ----
const currCommColumns: TableColumn<GlobalRow>[] = [
  {
    key: "name", label: "Name", align: "left", frozen: true, minWidth: 140,
    render: (r) => (
      <div>
        <div className="text-[14px] font-semibold text-foreground">{r.name}</div>
        {r.subtitle && <div className="text-[12px] text-muted-foreground">{r.subtitle}</div>}
      </div>
    ),
  },
  { key: "last", label: "Last", align: "right", render: (r) => <span className="font-mono tabular-nums font-semibold text-foreground">{r.last}</span> },
  { key: "change", label: "Change", align: "right", render: (r) => <ChangeCell value={r.change} isUp={r.isUp} /> },
  { key: "changePct", label: "Change %", align: "right", render: (r) => <ChangeCell value={r.changePct} isUp={r.isUp} /> },
  { key: "dayRange", label: "Day Range", align: "right", render: (r) => <span className="text-[12px] font-mono tabular-nums text-muted-foreground">{r.dayRange}</span> },
];

// ---- India Top 5 Stocks columns ----
const stockColumns: TableColumn<IndiaStock>[] = [
  {
    key: "stock", label: "Stock", align: "left", frozen: true, minWidth: 150,
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white", r.logoColor)}>
          {r.logo}
        </div>
        <div>
          <div className="text-[14px] font-bold text-foreground">{r.symbol}</div>
          <div className="max-w-[80px] truncate text-[12px] text-muted-foreground">{r.name}</div>
        </div>
      </div>
    ),
  },
  { key: "price", label: "Price", align: "right", render: (r) => <span className="font-mono tabular-nums font-semibold text-foreground">{r.price}</span> },
  { key: "change", label: "Change", align: "right", render: (r) => <ChangeCell value={r.change} isUp={r.isUp} /> },
  { key: "changePct", label: "% Chg", align: "right", render: (r) => <ChangeCell value={r.changePct} isUp={r.isUp} /> },
  { key: "volume", label: "Volume", align: "right", render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.volume}</span> },
  { key: "mktcap", label: "Mkt Cap", align: "right", render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.marketCap}</span> },
];

const KMD_TABS = ["Indices", "Sectors", "Currencies", "Commodities"];

export function IndiaTab() {
  const [kmdTab, setKmdTab] = useState("Indices");

  return (
    <div className="pb-8">
      {/* Key Market Data */}
      <div className="px-5 pt-5">
        <SectionHeader
          title="Key Market Data"
          subtitle="Real-time prices, performance & trends across Indian markets"
        />
        <SubTabs tabs={KMD_TABS} activeTab={kmdTab} onTabChange={setKmdTab} layoutId="india-kmd" />
        {kmdTab === "Indices" && <MarketTable columns={indexColumns} data={INDIA_INDICES} />}
        {kmdTab === "Sectors" && <MarketTable columns={sectorColumns} data={INDIA_SECTORS} />}
        {kmdTab === "Currencies" && <MarketTable columns={currCommColumns} data={INDIA_CURRENCIES} />}
        {kmdTab === "Commodities" && <MarketTable columns={currCommColumns} data={INDIA_COMMODITIES} />}
      </div>

      <SectionDivider />

      {/* Top 5 Stocks */}
      <div className="px-5">
        <SectionHeader
          title="Top 5 Stocks"
          subtitle="Most traded on NSE today"
        />
        <MarketTable columns={stockColumns} data={INDIA_TOP_STOCKS.slice(0, 5)} />
      </div>

      <SectionDivider />

      {/* Market Summary */}
      <div className="px-5">
        <NewsAccordion
          title="Market Summary"
          subtitle="AI-curated headlines for Indian markets"
          items={INDIA_NEWS}
          sourceCount={32}
        />
      </div>

      <SectionDivider />

      {/* Economic Overview */}
      <div className="px-5">
        <SectionHeader
          title="Economic Overview"
          subtitle="Key macroeconomic indicators for the Indian economy"
        />
        <EconomicOverview data={INDIA_ECONOMIC} />
      </div>
    </div>
  );
}
