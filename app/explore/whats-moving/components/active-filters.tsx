"use client";

import { X } from "lucide-react";
import type { MoversFilters } from "./filter-state";

interface Chip {
  id: string;
  label: string;
  clear: (f: MoversFilters) => MoversFilters;
}

function buildChips(f: MoversFilters): Chip[] {
  const chips: Chip[] = [];

  for (const s of f.sectors) {
    chips.push({
      id: `sector:${s}`,
      label: s,
      clear: (prev) => ({ ...prev, sectors: prev.sectors.filter((x) => x !== s) }),
    });
  }

  if (f.peMin != null || f.peMax != null) {
    const lo = f.peMin ?? "";
    const hi = f.peMax ?? "";
    chips.push({
      id: "pe",
      label: `PE ${lo}${lo !== "" || hi !== "" ? "–" : ""}${hi}`,
      clear: (prev) => ({ ...prev, peMin: null, peMax: null }),
    });
  }

  if (f.profitableOnly) {
    chips.push({
      id: "profitable",
      label: "Profitable only",
      clear: (prev) => ({ ...prev, profitableOnly: false }),
    });
  }

  if (f.revGrowthMin != null) {
    chips.push({
      id: "rev",
      label: `Rev ≥ ${f.revGrowthMin}%`,
      clear: (prev) => ({ ...prev, revGrowthMin: null }),
    });
  }

  if (f.profitGrowthMin != null) {
    chips.push({
      id: "profit",
      label: `Profit ≥ ${f.profitGrowthMin}%`,
      clear: (prev) => ({ ...prev, profitGrowthMin: null }),
    });
  }

  for (const r of f.ratings) {
    chips.push({
      id: `rating:${r}`,
      label: r,
      clear: (prev) => ({ ...prev, ratings: prev.ratings.filter((x) => x !== r) }),
    });
  }

  return chips;
}

interface Props {
  filters: MoversFilters;
  onChange: (next: MoversFilters) => void;
}

export function ActiveFilters({ filters, onChange }: Props) {
  const chips = buildChips(filters);
  if (chips.length === 0) return null;

  return (
    <div className="px-5 pb-3 flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.clear(filters))}
          className="inline-flex items-center gap-1.5 h-7 rounded-full bg-foreground/[0.06] px-2.5 text-[12px] font-semibold text-foreground active:bg-foreground/[0.1] transition-colors"
        >
          <span>{c.label}</span>
          <X size={12} strokeWidth={2.5} className="text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
