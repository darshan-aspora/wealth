"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  { name: "Rhodium",   unit: "/oz",    last: "4,625.00", change: "+42.00", changePct: "+0.92%", dayRange: "4,568.00 — 4,642.00", isUp: true,  category: "Precious Metals" },
  // Energy
  { name: "Crude Oil WTI", unit: "/bbl",   last: "78.42",  change: "-0.91", changePct: "-1.15%", dayRange: "77.84 — 79.56",  isUp: false, category: "Energy" },
  { name: "Brent Crude",   unit: "/bbl",   last: "82.18",  change: "-0.72", changePct: "-0.87%", dayRange: "81.60 — 83.14",  isUp: false, category: "Energy" },
  { name: "Natural Gas",   unit: "/MMBtu", last: "2.184",  change: "+0.072", changePct: "+3.41%", dayRange: "2.098 — 2.210", isUp: true,  category: "Energy" },
  { name: "Heating Oil",   unit: "/gal",   last: "2.614",  change: "-0.018", changePct: "-0.68%", dayRange: "2.592 — 2.648", isUp: false, category: "Energy" },
  { name: "RBOB Gasoline", unit: "/gal",   last: "2.482",  change: "+0.024", changePct: "+0.98%", dayRange: "2.452 — 2.498", isUp: true,  category: "Energy" },
  { name: "Coal",          unit: "/MT",    last: "128.40",  change: "-1.80",  changePct: "-1.38%", dayRange: "127.20 — 130.80", isUp: false, category: "Energy" },
  { name: "Uranium",       unit: "/lb",    last: "82.50",   change: "+1.20",  changePct: "+1.48%", dayRange: "80.80 — 83.20",  isUp: true,  category: "Energy" },
  // Agriculture
  { name: "Wheat",     unit: "/bu", last: "612.25",   change: "-13.50", changePct: "-2.16%", dayRange: "608.00 — 628.75",     isUp: false, category: "Agriculture" },
  { name: "Corn",      unit: "/bu", last: "448.50",   change: "+4.25",  changePct: "+0.96%", dayRange: "443.00 — 451.25",     isUp: true,  category: "Agriculture" },
  { name: "Soybeans",  unit: "/bu", last: "1,182.75", change: "+8.50",  changePct: "+0.72%", dayRange: "1,170.00 — 1,189.50", isUp: true,  category: "Agriculture" },
  { name: "Coffee",    unit: "/lb", last: "228.40",   change: "+6.15",  changePct: "+2.77%", dayRange: "221.80 — 230.60",     isUp: true,  category: "Agriculture" },
  { name: "Cocoa",     unit: "/MT", last: "7,842.00", change: "+124.00",changePct: "+1.61%", dayRange: "7,680.00 — 7,868.00", isUp: true,  category: "Agriculture" },
  { name: "Sugar",     unit: "/lb", last: "0.2148",   change: "-0.0032",changePct: "-1.47%", dayRange: "0.2124 — 0.2186",     isUp: false, category: "Agriculture" },
  { name: "Cotton",    unit: "/lb", last: "0.8412",   change: "+0.0068",changePct: "+0.81%", dayRange: "0.8332 — 0.8448",     isUp: true,  category: "Agriculture" },
  { name: "Live Cattle",unit: "/lb", last: "1.8624",  change: "+0.0142",changePct: "+0.77%", dayRange: "1.8462 — 1.8680",     isUp: true,  category: "Agriculture" },
  // Industrial
  { name: "Copper",    unit: "/lb", last: "4.312",    change: "+0.024",  changePct: "+0.56%", dayRange: "4.278 — 4.338",       isUp: true,  category: "Industrial" },
  { name: "Aluminum",  unit: "/MT", last: "2,418.00", change: "-12.00",  changePct: "-0.49%", dayRange: "2,402.00 — 2,436.00", isUp: false, category: "Industrial" },
  { name: "Zinc",      unit: "/MT", last: "2,684.00", change: "+18.00",  changePct: "+0.68%", dayRange: "2,658.00 — 2,698.00", isUp: true,  category: "Industrial" },
  { name: "Nickel",    unit: "/MT", last: "16,842.00",change: "-124.00", changePct: "-0.73%", dayRange: "16,720.00 — 16,980.00", isUp: false, category: "Industrial" },
  { name: "Iron Ore",  unit: "/MT", last: "112.40",   change: "+1.80",   changePct: "+1.63%", dayRange: "110.20 — 113.40",     isUp: true,  category: "Industrial" },
  { name: "Tin",       unit: "/MT", last: "28,420.00", change: "+340.00", changePct: "+1.21%", dayRange: "28,040.00 — 28,520.00", isUp: true, category: "Industrial" },
  { name: "Lumber",    unit: "/MBF",last: "542.80",   change: "-8.40",   changePct: "-1.52%", dayRange: "538.20 — 554.60",     isUp: false, category: "Industrial" },
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
    render: (r) => <span className="tabular-nums text-foreground">{r.last}</span>,
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
      <span className="text-[12px] text-muted-foreground tabular-nums">{r.dayRange}</span>
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

      </div>
    </div>
  );
}
