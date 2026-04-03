"use client";

import { AllocationTable, type AllocationRow } from "./allocation-table";
import { ASSET_CLASSES } from "./portfolio-mock-data";

const NEUTRAL_COLORS = ["bg-neutral-800", "bg-neutral-500", "bg-neutral-400"];

const rows: AllocationRow[] = ASSET_CLASSES
  .filter((a) => a.name !== "Collections")
  .map((a, i) => ({
    name: a.name,
    subtitle: a.count,
    color: NEUTRAL_COLORS[i] ?? "bg-neutral-300",
    invested: a.invested,
    current: a.current,
    xirr: a.xirr,
  }));

export function AssetClassPerformance() {
  return (
    <AllocationTable
      title="Asset Allocation"
      subtitle="See which asset types are pulling their weight and which aren't"
      rows={rows}
    />
  );
}
