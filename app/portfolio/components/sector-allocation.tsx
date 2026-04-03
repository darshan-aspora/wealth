"use client";

import { AllocationTable, type AllocationRow } from "./allocation-table";

const rows: AllocationRow[] = [
  { name: "Technology",    subtitle: "4 holdings", color: "bg-neutral-800", invested: 14_800, current: 17_220, xirr: 28.4 },
  { name: "Financials",    subtitle: "2 holdings", color: "bg-neutral-600", invested: 5_200,  current: 5_640,  xirr: 14.2 },
  { name: "Healthcare",    subtitle: "2 holdings", color: "bg-neutral-500", invested: 4_100,  current: 4_380,  xirr: 11.8 },
  { name: "Consumer",      subtitle: "2 holdings", color: "bg-neutral-400", invested: 3_800,  current: 3_520,  xirr: -6.2 },
  { name: "Energy",        subtitle: "1 holding",  color: "bg-neutral-300", invested: 2_400,  current: 2_680,  xirr: 18.6 },
  { name: "Industrials",   subtitle: "1 holding",  color: "bg-neutral-200", invested: 2_480,  current: 2_680,  xirr: 9.4 },
];

export function SectorAllocation() {
  return (
    <AllocationTable
      title="Sector Allocation"
      subtitle="If one sector dips, how exposed are you? Diversify before you need to"
      firstColumnLabel="Sector"
      rows={rows}
    />
  );
}
