"use client";

import { cn } from "@/lib/utils";
import { MarketTable, ChangeCell, type TableColumn } from "./market-table";
import { SectionHeader, SectionDivider } from "./section-header";
import { EconomicOverview } from "./economic-overview";
import { NewsAccordion } from "./news-accordion";
import {
  UAE_INDICES, UAE_TOP_STOCKS, UAE_NEWS, UAE_ECONOMIC,
  type GlobalRow, type IndiaStock,
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

export function UAETab() {
  return (
    <div className="pb-8">
      {/* Key Market Data */}
      <div className="px-5 pt-5">
        <SectionHeader
          title="Key Indices"
          subtitle="Real-time prices from ADX & DFM exchanges"
        />
        <MarketTable columns={indexColumns} data={UAE_INDICES} />
      </div>

      <SectionDivider />

      {/* Top 5 Stocks */}
      <div className="px-5">
        <SectionHeader
          title="Top 5 Stocks"
          subtitle="Most traded on ADX & DFM today"
        />
        <MarketTable columns={stockColumns} data={UAE_TOP_STOCKS} />
      </div>

      <SectionDivider />

      {/* Market Summary */}
      <div className="px-5">
        <NewsAccordion
          title="Market Summary"
          subtitle="AI-curated headlines for UAE markets"
          items={UAE_NEWS}
          sourceCount={18}
        />
      </div>

      <SectionDivider />

      {/* Economic Overview */}
      <div className="px-5">
        <SectionHeader
          title="Economic Overview"
          subtitle="Key macroeconomic indicators for the UAE"
        />
        <EconomicOverview data={UAE_ECONOMIC} />
      </div>
    </div>
  );
}
