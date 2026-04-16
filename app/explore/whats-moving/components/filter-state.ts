/**
 * Shared filter-state type for the What's Moving power-user page.
 */

import type { AnalystRating, Sector } from "@/app/explore/_data/movers";

export interface MoversFilters {
  sectors: Sector[];
  peMin: number | null; // null = no lower bound
  peMax: number | null; // null = no upper bound
  profitableOnly: boolean; // excludes null-PE stocks
  revGrowthMin: number | null;
  profitGrowthMin: number | null;
  ratings: AnalystRating[];
}

export const emptyFilters: MoversFilters = {
  sectors: [],
  peMin: null,
  peMax: null,
  profitableOnly: false,
  revGrowthMin: null,
  profitGrowthMin: null,
  ratings: [],
};

export function activeFilterCount(f: MoversFilters): number {
  let n = 0;
  if (f.sectors.length > 0) n += 1;
  if (f.peMin != null || f.peMax != null) n += 1;
  if (f.profitableOnly) n += 1;
  if (f.revGrowthMin != null) n += 1;
  if (f.profitGrowthMin != null) n += 1;
  if (f.ratings.length > 0) n += 1;
  return n;
}
