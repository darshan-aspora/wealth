"use client";

import { AllocationTable, type AllocationRow } from "./allocation-table";

const rows: AllocationRow[] = [
  { name: "Self-managed",              color: "bg-neutral-700", invested: 29_210, current: 31_775, xirr: 19.8 },
  { name: "Advisory (Expert-managed)", color: "bg-neutral-400", invested: 3_710,  current: 4_180,  xirr: 12.6 },
];

export function InvestmentStyleBreakdown() {
  return (
    <AllocationTable
      title="Investment Style"
      subtitle="Compare what you pick vs what experts pick to know where you add alpha"
      firstColumnLabel="Style"
      rows={rows}
    />
  );
}
