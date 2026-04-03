"use client";

import { AllocationTable, type AllocationRow } from "./allocation-table";

const rows: AllocationRow[] = [
  { name: "Mega Cap",  subtitle: ">200B",    color: "bg-neutral-800", invested: 18_200, current: 20_840, xirr: 24.2 },
  { name: "Large Cap", subtitle: "10B–200B", color: "bg-neutral-600", invested: 8_600,  current: 9_380,  xirr: 16.8 },
  { name: "Mid Cap",   subtitle: "2B–10B",   color: "bg-neutral-400", invested: 4_350,  current: 4_120,  xirr: -4.2 },
  { name: "Small Cap", subtitle: "<2B",      color: "bg-neutral-300", invested: 1_630,  current: 1_780,  xirr: 8.6 },
];

export function MarketCapBreakdown() {
  return (
    <AllocationTable
      title="Market Cap"
      subtitle="Too concentrated in one size? This helps you spot the imbalance"
      firstColumnLabel="Cap"
      rows={rows}
    />
  );
}
