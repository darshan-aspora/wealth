"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketTable, ChangeCell, type TableColumn } from "./market-table";
import { SectionHeader } from "./section-header";

// ---- Data types ----

interface CommodityRow {
  name: string;
  unit: string;
  last: string;
  change: string;
  changePct: string;
  dayRange: string;
  isUp: boolean;
  category: string;
}

// ---- Filter pills ----

const FILTERS = ["Most Popular", "Precious Metals", "Energy", "Agriculture", "Industrial"] as const;
type CommodityFilter = (typeof FILTERS)[number];

// ---- Mock data ----

const COMMODITIES: CommodityRow[] = [
  // Precious Metals
  { name: "Gold",      unit: "/oz",    last: "2,342.50", change: "+18.40", changePct: "+0.79%", dayRange: "2,318.20 — 2,349.80", isUp: true,  category: "Precious Metals" },
  { name: "Silver",    unit: "/oz",    last: "29.14",    change: "+0.36",  changePct: "+1.25%", dayRange: "28.62 — 29.38",       isUp: true,  category: "Precious Metals" },
  { name: "Platinum",  unit: "/oz",    last: "982.40",   change: "-3.10",  changePct: "-0.31%", dayRange: "976.50 — 988.20",     isUp: false, category: "Precious Metals" },
  { name: "Palladium", unit: "/oz",    last: "1,024.80", change: "+18.20", changePct: "+1.81%", dayRange: "1,002.40 — 1,031.60", isUp: true,  category: "Precious Metals" },
  // Energy
  { name: "Crude Oil WTI", unit: "/bbl",   last: "78.42",  change: "-0.91", changePct: "-1.15%", dayRange: "77.84 — 79.56",  isUp: false, category: "Energy" },
  { name: "Brent Crude",   unit: "/bbl",   last: "82.18",  change: "-0.72", changePct: "-0.87%", dayRange: "81.60 — 83.14",  isUp: false, category: "Energy" },
  { name: "Natural Gas",   unit: "/MMBtu", last: "2.184",  change: "+0.072", changePct: "+3.41%", dayRange: "2.098 — 2.210", isUp: true,  category: "Energy" },
  { name: "Heating Oil",   unit: "/gal",   last: "2.614",  change: "-0.018", changePct: "-0.68%", dayRange: "2.592 — 2.648", isUp: false, category: "Energy" },
  // Agriculture
  { name: "Wheat",    unit: "/bu", last: "612.25", change: "-13.50", changePct: "-2.16%", dayRange: "608.00 — 628.75", isUp: false, category: "Agriculture" },
  { name: "Corn",     unit: "/bu", last: "448.50", change: "+4.25",  changePct: "+0.96%", dayRange: "443.00 — 451.25", isUp: true,  category: "Agriculture" },
  { name: "Soybeans", unit: "/bu", last: "1,182.75", change: "+8.50", changePct: "+0.72%", dayRange: "1,170.00 — 1,189.50", isUp: true, category: "Agriculture" },
  { name: "Coffee",   unit: "/lb", last: "228.40",   change: "+6.15",  changePct: "+2.77%", dayRange: "221.80 — 230.60",    isUp: true, category: "Agriculture" },
  // Industrial
  { name: "Copper",   unit: "/lb", last: "4.312", change: "+0.024", changePct: "+0.56%", dayRange: "4.278 — 4.338", isUp: true,  category: "Industrial" },
  { name: "Aluminum", unit: "/MT", last: "2,418.00", change: "-12.00", changePct: "-0.49%", dayRange: "2,402.00 — 2,436.00", isUp: false, category: "Industrial" },
];

// ---- Table columns ----

const commodityColumns: TableColumn<CommodityRow>[] = [
  {
    key: "name",
    label: "Name",
    align: "left",
    frozen: true,
    minWidth: 140,
    render: (r) => (
      <div>
        <div className="text-[14px] font-semibold text-foreground">{r.name}</div>
        <div className="text-[11px] text-muted-foreground">{r.unit}</div>
      </div>
    ),
  },
  {
    key: "last",
    label: "Last Price",
    align: "right",
    render: (r) => <span className="font-mono tabular-nums text-foreground">{r.last}</span>,
  },
  {
    key: "change",
    label: "Change",
    align: "right",
    render: (r) => <ChangeCell value={r.change} isUp={r.isUp} />,
  },
  {
    key: "changePct",
    label: "Change %",
    align: "right",
    render: (r) => <ChangeCell value={r.changePct} isUp={r.isUp} />,
  },
  {
    key: "dayRange",
    label: "Day Range",
    align: "right",
    render: (r) => (
      <span className="text-[12px] text-muted-foreground font-mono tabular-nums">{r.dayRange}</span>
    ),
  },
];

// ---- Component ----

export function CommodityTab() {
  const [filter, setFilter] = useState<CommodityFilter>("Most Popular");

  const filtered =
    filter === "Most Popular"
      ? COMMODITIES
      : COMMODITIES.filter((c) => c.category === filter);

  return (
    <div className="pb-8">
      {/* Section 1 — Commodities Table */}
      <div className="px-5 pt-5">
        <SectionHeader
          title="Commodities"
          subtitle="Live spot prices for major commodities"
        />

        {/* Filter pills */}
        <div className="mb-3 -mx-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5 py-0.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                  filter === f
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
            key={`commodity-${filter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MarketTable columns={commodityColumns} data={filtered} />
          </motion.div>
        </AnimatePresence>

        <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          View All Commodities
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
