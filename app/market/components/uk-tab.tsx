"use client";

import { cn } from "@/lib/utils";
import { MarketTable, ChangeCell, PctCell, type TableColumn } from "./market-table";
import { SectionHeader, SectionDivider } from "./section-header";
import { EconomicOverview } from "./economic-overview";
import { NewsAccordion } from "./news-accordion";
import {
  UK_INDICES, UK_TOP_STOCKS, UK_SECTORS, UK_NEWS, UK_ECONOMIC,
  type GlobalRow, type UKStock, type IndiaSector,
} from "../data";

const indexColumns: TableColumn<GlobalRow>[] = [
  {
    key: "name", label: "Name", align: "left", frozen: true, minWidth: 150,
    render: (r) => (
      <div>
        <div className="text-[14px] font-semibold text-foreground">{r.name}</div>
        <div className="text-[12px] text-muted-foreground">{r.subtitle}</div>
      </div>
    ),
  },
  { key: "last", label: "Last", align: "right", render: (r) => <span className="font-mono tabular-nums font-semibold text-foreground">{r.last}</span> },
  { key: "change", label: "Change", align: "right", render: (r) => <ChangeCell value={r.change} isUp={r.isUp} /> },
  { key: "changePct", label: "Change %", align: "right", render: (r) => <ChangeCell value={r.changePct} isUp={r.isUp} /> },
  { key: "dayRange", label: "Day Range", align: "right", render: (r) => <span className="text-[12px] font-mono tabular-nums text-muted-foreground">{r.dayRange}</span> },
];

const sectorColumns: TableColumn<IndiaSector>[] = [
  { key: "name", label: "Name", align: "left", frozen: true, minWidth: 140, render: (r) => <span className="text-[14px] font-semibold text-foreground">{r.name}</span> },
  { key: "today", label: "Today", align: "right", render: (r) => <PctCell value={r.today} /> },
  { key: "1m", label: "1 Month", align: "right", render: (r) => <PctCell value={r.oneMonth} /> },
  { key: "ytd", label: "YTD", align: "right", render: (r) => <PctCell value={r.ytd} /> },
  { key: "1y", label: "1 Year", align: "right", render: (r) => <PctCell value={r.oneYear} /> },
];

const stockColumns: TableColumn<UKStock>[] = [
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

export function UKTab() {
  return (
    <div className="pb-8">
      {/* Key Indices */}
      <div className="px-5 pt-5">
        <SectionHeader
          title="Key Indices"
          subtitle="Real-time FTSE index performance"
        />
        <MarketTable columns={indexColumns} data={UK_INDICES} />
      </div>

      <SectionDivider />

      {/* Sectors */}
      <div className="px-5">
        <SectionHeader
          title="Sectors"
          subtitle="Sector performance across UK markets"
        />
        <MarketTable columns={sectorColumns} data={UK_SECTORS} />
      </div>

      <SectionDivider />

      {/* Top 5 Stocks */}
      <div className="px-5">
        <SectionHeader
          title="Top 5 Stocks"
          subtitle="Most traded on LSE today"
        />
        <MarketTable columns={stockColumns} data={UK_TOP_STOCKS} />
      </div>

      <SectionDivider />

      {/* Market Summary */}
      <div className="px-5">
        <NewsAccordion
          title="Market Summary"
          subtitle="AI-curated headlines for UK markets"
          items={UK_NEWS}
          sourceCount={24}
        />
      </div>

      <SectionDivider />

      {/* Economic Overview */}
      <div className="px-5">
        <SectionHeader
          title="Economic Overview"
          subtitle="Key macroeconomic indicators for the UK economy"
        />
        <EconomicOverview data={UK_ECONOMIC} />
      </div>
    </div>
  );
}
