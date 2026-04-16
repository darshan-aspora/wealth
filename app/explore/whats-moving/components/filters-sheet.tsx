"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ALL_SECTORS,
  type AnalystRating,
  type Sector,
} from "@/app/explore/_data/movers";
import { cn } from "@/lib/utils";
import { emptyFilters, type MoversFilters } from "./filter-state";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MoversFilters;
  onApply: (filters: MoversFilters) => void;
  matchCount: (draft: MoversFilters) => number;
}

const RATINGS: AnalystRating[] = ["Buy", "Hold", "Sell"];

export function FiltersSheet({
  open,
  onOpenChange,
  filters,
  onApply,
  matchCount,
}: Props) {
  // Draft state kept local to the sheet; committed on Apply and re-synced
  // whenever the sheet opens (see onOpenChange below).
  const [draft, setDraft] = useState<MoversFilters>(filters);

  const toggleSector = (s: Sector) => {
    setDraft((d) =>
      d.sectors.includes(s)
        ? { ...d, sectors: d.sectors.filter((x) => x !== s) }
        : { ...d, sectors: [...d.sectors, s] }
    );
  };

  const toggleRating = (r: AnalystRating) => {
    setDraft((d) =>
      d.ratings.includes(r)
        ? { ...d, ratings: d.ratings.filter((x) => x !== r) }
        : { ...d, ratings: [...d.ratings, r] }
    );
  };

  const count = matchCount(draft);

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) setDraft(filters); // sync on open
      }}
    >
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-[28px] p-0 border-0 max-h-[88vh] flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-3 text-left shrink-0">
          <SheetTitle className="text-[20px] font-bold tracking-tight">
            Filters
          </SheetTitle>
          <p className="text-[13px] text-muted-foreground">
            Slice the market on your own terms.
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-6">
          {/* Sectors */}
          <section>
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Sector
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SECTORS.map((s) => {
                const on = draft.sectors.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSector(s)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors",
                      on
                        ? "bg-foreground text-background"
                        : "border border-border/60 text-foreground"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </section>

          {/* PE */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                PE Ratio
              </h3>
              <label className="flex items-center gap-2 text-[13px] font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.profitableOnly}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, profitableOnly: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border/60 accent-foreground"
                />
                Profitable only
              </label>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Min
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={draft.peMin ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      peMin: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  placeholder="0"
                  className="w-full h-10 rounded-xl border border-border/60 bg-background px-3 text-[15px] tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/10"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Max
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={draft.peMax ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      peMax: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  placeholder="∞"
                  className="w-full h-10 rounded-xl border border-border/60 bg-background px-3 text-[15px] tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/10"
                />
              </div>
            </div>
          </section>

          {/* Rev Growth */}
          <section>
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Revenue growth ≥
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={draft.revGrowthMin ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    revGrowthMin: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                placeholder="Any"
                className="w-24 h-10 rounded-xl border border-border/60 bg-background px-3 text-[15px] tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/10"
              />
              <span className="text-[15px] text-muted-foreground">%</span>
            </div>
          </section>

          {/* Profit Growth */}
          <section>
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Profit growth ≥
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={draft.profitGrowthMin ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    profitGrowthMin: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                placeholder="Any"
                className="w-24 h-10 rounded-xl border border-border/60 bg-background px-3 text-[15px] tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/10"
              />
              <span className="text-[15px] text-muted-foreground">%</span>
            </div>
          </section>

          {/* Analyst Rating */}
          <section>
            <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Analyst rating
            </h3>
            <div className="flex gap-1.5">
              {RATINGS.map((r) => {
                const on = draft.ratings.includes(r);
                return (
                  <button
                    key={r}
                    onClick={() => toggleRating(r)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors",
                      on
                        ? "bg-foreground text-background"
                        : "border border-border/60 text-foreground"
                    )}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="shrink-0 border-t border-border/40 px-5 py-4 flex items-center gap-2 bg-background">
          <button
            onClick={() => setDraft(emptyFilters)}
            className="flex-1 h-12 rounded-full border border-border/60 text-[15px] font-semibold text-foreground active:scale-[0.98] transition-transform"
          >
            Reset
          </button>
          <button
            onClick={() => {
              onApply(draft);
              onOpenChange(false);
            }}
            className="flex-[2] h-12 rounded-full bg-foreground text-background text-[15px] font-semibold active:scale-[0.98] transition-transform"
          >
            Show {count} {count === 1 ? "stock" : "stocks"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
