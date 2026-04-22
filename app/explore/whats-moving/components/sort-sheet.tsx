"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
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

const DEFAULT_SORT: { key: SortKey; dir: SortDir } = {
  key: "changePercent",
  dir: "desc",
};

export function SortSheet({
  open,
  onOpenChange,
  sortKey,
  sortDir,
  onChange,
}: Props) {
  const [draftKey, setDraftKey] = useState<SortKey>(sortKey);
  const [draftDir, setDraftDir] = useState<SortDir>(sortDir);

  const selectKey = (k: SortKey) => {
    if (k !== draftKey) {
      setDraftKey(k);
      setDraftDir("desc");
    }
  };

  const toggleDir = () =>
    setDraftDir((d) => (d === "desc" ? "asc" : "desc"));

  const reset = () => {
    setDraftKey(DEFAULT_SORT.key);
    setDraftDir(DEFAULT_SORT.dir);
  };

  const apply = () => {
    onChange(draftKey, draftDir);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) {
          setDraftKey(sortKey);
          setDraftDir(sortDir);
        }
      }}
    >
      <SheetContent
        hideClose
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-[28px] p-0 border-0 max-h-[85vh] flex flex-col"
      >
        {/* Header row: title + Reset */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <SheetTitle className="text-[20px] font-bold tracking-tight">
            Sort By
          </SheetTitle>
          <button
            onClick={reset}
            className="text-[15px] font-semibold text-foreground active:opacity-60 transition-opacity"
          >
            Reset
          </button>
        </div>

        {/* Options list with row separators */}
        <div className="flex-1 overflow-y-auto px-5">
          {sortSheetKeys.map((key, idx) => {
            const selected = draftKey === key;
            return (
              <div key={key}>
                <div className="flex items-center justify-between py-4 min-h-[56px]">
                  <button
                    onClick={() => selectKey(key)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 transition-colors",
                        selected
                          ? "border-foreground"
                          : "border-muted-foreground/40",
                      )}
                    >
                      {selected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[16px] transition-colors",
                        selected
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted-foreground",
                      )}
                    >
                      {sortLabels[key]}
                    </span>
                  </button>
                  {selected && (
                    <button
                      onClick={toggleDir}
                      className="flex items-center gap-1.5 text-foreground text-[15px] font-semibold active:opacity-60 transition-opacity"
                    >
                      <span>
                        {draftDir === "asc" ? "Low to High" : "High to Low"}
                      </span>
                      {draftDir === "asc" ? (
                        <ArrowUp size={16} strokeWidth={2.5} />
                      ) : (
                        <ArrowDown size={16} strokeWidth={2.5} />
                      )}
                    </button>
                  )}
                </div>
                {idx < sortSheetKeys.length - 1 && (
                  <div className="h-px bg-border/60" />
                )}
              </div>
            );
          })}
        </div>

        {/* Apply button */}
        <div className="shrink-0 px-5 pt-3 pb-5">
          <button
            onClick={apply}
            className="w-full h-14 rounded-2xl bg-foreground text-background text-[16px] font-semibold active:scale-[0.98] transition-transform"
          >
            Apply
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
