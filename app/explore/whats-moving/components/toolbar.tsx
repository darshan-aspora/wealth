"use client";

import { Search, SlidersHorizontal, ArrowUpDown, Columns3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
  sortLabel: string;
  onOpenSort: () => void;
  onOpenColumns: () => void;
}

export function Toolbar({
  query,
  onQueryChange,
  activeFilterCount,
  onOpenFilters,
  sortLabel,
  onOpenSort,
  onOpenColumns,
}: Props) {
  return (
    <div className="flex items-center gap-2 px-5 py-3">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search
          size={14}
          strokeWidth={2}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search ticker"
          className="h-9 w-full rounded-full border border-border/60 bg-background pl-8 pr-3 text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
        />
      </div>

      {/* Filters */}
      <button
        onClick={onOpenFilters}
        className={cn(
          "flex items-center gap-1.5 h-9 rounded-full border border-border/60 bg-background px-3 text-[13px] font-semibold text-foreground active:scale-[0.97] transition-transform",
          activeFilterCount > 0 && "border-foreground"
        )}
      >
        <SlidersHorizontal size={14} strokeWidth={2} />
        <span className="hidden sm:inline">Filters</span>
        {activeFilterCount > 0 && (
          <span className="inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background tabular-nums">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Sort */}
      <button
        onClick={onOpenSort}
        className="flex items-center gap-1.5 h-9 rounded-full border border-border/60 bg-background px-3 text-[13px] font-semibold text-foreground active:scale-[0.97] transition-transform max-w-[128px]"
      >
        <ArrowUpDown size={14} strokeWidth={2} />
        <span className="truncate">{sortLabel}</span>
      </button>

      {/* Columns (icon-only) */}
      <button
        onClick={onOpenColumns}
        aria-label="Choose columns"
        className="flex items-center justify-center h-9 w-9 rounded-full border border-border/60 bg-background text-foreground active:scale-[0.97] transition-transform"
      >
        <Columns3 size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
