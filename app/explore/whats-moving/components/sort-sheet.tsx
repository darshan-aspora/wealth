"use client";

import { ArrowDown, ArrowUp, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  sortLabels,
  sortSheetKeys,
  type SortKey,
  type SortDir,
} from "@/app/explore/_data/movers";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onChange: (key: SortKey, dir: SortDir) => void;
}

export function SortSheet({ open, onOpenChange, sortKey, sortDir, onChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-[28px] p-0 border-0 max-h-[80vh] overflow-y-auto"
      >
        <SheetHeader className="px-5 pt-5 pb-3 text-left">
          <SheetTitle className="text-[20px] font-bold tracking-tight">
            Sort
          </SheetTitle>
          <p className="text-[13px] text-muted-foreground">
            Pick a column and direction.
          </p>
        </SheetHeader>

        <div className="px-2 pb-6">
          {sortSheetKeys.map((key) => {
            const selected = sortKey === key;
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-3 py-3",
                  selected ? "bg-foreground/[0.04]" : ""
                )}
              >
                <button
                  onClick={() => onChange(key, selected ? sortDir : "desc")}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      selected
                        ? "bg-foreground border-foreground"
                        : "border-border/60"
                    )}
                  >
                    {selected && <Check size={12} strokeWidth={3} className="text-background" />}
                  </div>
                  <span className="text-[15px] font-semibold text-foreground">
                    {sortLabels[key]}
                  </span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onChange(key, "desc")}
                    aria-label="Descending"
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      selected && sortDir === "desc"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ArrowDown size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => onChange(key, "asc")}
                    aria-label="Ascending"
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      selected && sortDir === "asc"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ArrowUp size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
