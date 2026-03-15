"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketTable, PctCell, RangeBar, type TableColumn } from "./market-table";
import { SectionHeader } from "./section-header";
import { EconomicOverview } from "./economic-overview";
import { NewsAccordion } from "./news-accordion";
import {
  US_IDX_POPULAR, US_IDX_STRATEGY,
  US_IDX_THEMATIC, US_IDX_VOL_SENTIMENT, US_IDX_FIXED_INCOME,
  US_SECTORS, US_SECTORS_ALT, US_ECONOMIC, US_NEWS,
  type PerformanceRow,
} from "../data";

// ---- Performance table columns (shared by Indices & Sectors) ----
const perfColumns: TableColumn<PerformanceRow>[] = [
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
      {/* Major Indices */}
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
          <motion.div key={`idx-${indexFilter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <MarketTable columns={perfColumns} data={filteredIndices} />
          </motion.div>
        </AnimatePresence>
        <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          View All Indices
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="h-6" />

      {/* Sectors */}
      <div className="px-5">
        <SectionHeader
          title="Sectors"
          subtitle="Sector ETF performance"
        />
        <div className="mb-3 -mx-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5 py-0.5">
            {SECTOR_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setSectorFilter(f)}
                className={cn(
                  "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                  sectorFilter === f
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
          <motion.div key={`sec-${sectorFilter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <MarketTable columns={perfColumns} data={filteredSectors} />
          </motion.div>
        </AnimatePresence>
        <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          View All Sectors
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="h-6" />

      {/* Economic Overview */}
      <div className="px-5">
        <SectionHeader
          title="Economic Overview"
          subtitle="Key macroeconomic indicators for the US economy"
        />
        <EconomicOverview data={US_ECONOMIC} />
        <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          View More
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="h-6" />

      {/* Market Summary */}
      <div className="px-5">
        <NewsAccordion
          title="Market Summary"
          subtitle="AI-curated headlines with expandable summaries"
          items={US_NEWS}
          sourceCount={47}
        />
      </div>

    </div>
  );
}
