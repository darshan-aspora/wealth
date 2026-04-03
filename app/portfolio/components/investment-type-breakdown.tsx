"use client";

import { AllocationTable, type AllocationRow } from "./allocation-table";

const rows: AllocationRow[] = [
  { name: "Lumpsum",   color: "bg-neutral-700", invested: 32_450, current: 35_280, xirr: 22.8 },
  { name: "SIP",       color: "bg-neutral-400", invested: 13_330, current: 13_345, xirr: 12.6 },
];

export function InvestmentTypeBreakdown() {
  return (
    <AllocationTable
      title="Investment Type"
      subtitle="Is your SIP doing better than your lumpsum bets? Find out here"
      firstColumnLabel="Type"
      rows={rows}
    />
  );
}
