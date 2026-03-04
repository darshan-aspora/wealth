"use client";

import {
  ArrowDownAZ,
  TrendingUp,
  BarChart3,
  Building2,
  Flag,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useWatchlist, type SortOption } from "@/components/watchlist-context";

const SORT_OPTIONS: { key: SortOption; label: string; icon: typeof Flag }[] = [
  { key: "symbol", label: "Symbol A–Z", icon: ArrowDownAZ },
  { key: "change", label: "% Change", icon: TrendingUp },
  { key: "volume", label: "Volume", icon: BarChart3 },
  { key: "marketCap", label: "Market Cap", icon: Building2 },
  { key: "flag", label: "Flagged", icon: Flag },
];

export function SortSheet() {
  const { sortSheetOpen, closeSortSheet, currentSort, setSort } =
    useWatchlist();

  return (
    <Sheet
      open={sortSheetOpen}
      onOpenChange={(open) => !open && closeSortSheet()}
    >
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-2xl border-border/60 bg-background px-0 pb-8"
      >
        <SheetHeader className="border-0 px-5 pb-2">
          <SheetTitle className="text-[18px] font-semibold">
            Sort by
          </SheetTitle>
        </SheetHeader>

        <div>
          {SORT_OPTIONS.map((opt, i) => {
            const active = currentSort === opt.key;
            return (
              <div key={opt.key}>
                <button
                  onClick={() => {
                    setSort(active ? null : (opt.key as SortOption));
                    closeSortSheet();
                  }}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-[15px] transition-colors active:bg-muted/40"
                >
                  <opt.icon
                    size={18}
                    strokeWidth={1.8}
                    className="text-muted-foreground"
                  />
                  <span
                    className={cn(
                      "flex-1 text-left font-medium",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {opt.label}
                  </span>
                  {active && (
                    <Check
                      size={18}
                      strokeWidth={2}
                      className="text-foreground"
                    />
                  )}
                </button>
                {i < SORT_OPTIONS.length - 1 && (
                  <div className="mx-5 h-px bg-border/30" />
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
