"use client";

import { Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type ColumnId =
  | "price"
  | "changePercent"
  | "oneYearChange"
  | "consensus"
  | "pe"
  | "marketCap"
  | "revGrowth"
  | "profitGrowth"
  | "oneMonthVolume"
  | "avgMonthlyVolume"
  | "yearRange"
  | "bookmark";

export const COLUMN_LABEL: Record<ColumnId, string> = {
  price: "Price",
  changePercent: "Change %",
  oneYearChange: "1Y Change",
  consensus: "Consensus (Mega only)",
  pe: "PE",
  marketCap: "Market Cap",
  revGrowth: "Revenue Growth",
  profitGrowth: "Profit Growth",
  oneMonthVolume: "1M Volume",
  avgMonthlyVolume: "Monthly Avg Vol",
  yearRange: "52W Range",
  bookmark: "Watchlist",
};

export const ALL_COLUMNS: ColumnId[] = [
  "price",
  "changePercent",
  "oneYearChange",
  "consensus",
  "pe",
  "marketCap",
  "revGrowth",
  "profitGrowth",
  "oneMonthVolume",
  "avgMonthlyVolume",
  "yearRange",
  "bookmark",
];

export const DEFAULT_COLUMNS: ColumnId[] = ALL_COLUMNS;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: ColumnId[];
  onChange: (next: ColumnId[]) => void;
}

export function ColumnsSheet({ open, onOpenChange, selected, onChange }: Props) {
  const toggle = (c: ColumnId) => {
    onChange(
      selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c]
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-[28px] p-0 border-0 max-h-[80vh] overflow-y-auto"
      >
        <SheetHeader className="px-5 pt-5 pb-3 text-left">
          <SheetTitle className="text-[20px] font-bold tracking-tight">
            Columns
          </SheetTitle>
          <p className="text-[13px] text-muted-foreground">
            Choose what to show. Name stays pinned.
          </p>
        </SheetHeader>

        <div className="px-2 pb-6">
          {ALL_COLUMNS.map((c) => {
            const on = selected.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors active:bg-foreground/[0.03]"
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                    on ? "bg-foreground border-foreground" : "border-border/60"
                  )}
                >
                  {on && <Check size={12} strokeWidth={3} className="text-background" />}
                </div>
                <span className="text-[15px] font-semibold text-foreground">
                  {COLUMN_LABEL[c]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-border/40 px-5 py-4 flex items-center gap-2 bg-background">
          <button
            onClick={() => onChange(DEFAULT_COLUMNS)}
            className="flex-1 h-11 rounded-full border border-border/60 text-[14px] font-semibold text-foreground active:scale-[0.98] transition-transform"
          >
            Reset
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 rounded-full bg-foreground text-background text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            Done
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
