"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Pencil, Check, Minus, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TickerLogo, type TickerItem } from "@/components/ticker";
import {
  useWatchlist,
  type WatchlistSection,
} from "@/components/watchlist-context";

// ─── Flat-order helpers (enables cross-section drag) ─────────────────────────

const SEC = "__sec__";

function buildFlatOrder(sections: WatchlistSection[]): string[] {
  const result: string[] = [];
  for (const s of sections) {
    result.push(SEC + s.id);
    for (const t of s.stocks) result.push(t.symbol);
  }
  return result;
}

function reconstructSections(
  flat: string[],
  sections: WatchlistSection[]
): WatchlistSection[] {
  const meta = new Map(sections.map((s) => [s.id, { id: s.id, label: s.label }]));
  const allStocks = new Map(
    sections.flatMap((s) => s.stocks).map((t) => [t.symbol, t])
  );

  const result: WatchlistSection[] = [];
  let cur: WatchlistSection | null = null;

  for (const item of flat) {
    if (item.startsWith(SEC)) {
      const id = item.slice(SEC.length);
      const m = meta.get(id);
      if (m) {
        cur = { ...m, stocks: [] };
        result.push(cur);
      }
    } else if (cur) {
      const stock = allStocks.get(item);
      if (stock) cur.stocks.push(stock);
    }
  }
  return result;
}

// ─── Editable Section Header ────────────────────────────────────────────────

function EditableSectionHeader({
  section,
  value,
  selected,
  allSelected,
  onToggle,
  onRename,
}: {
  section: WatchlistSection;
  value: string;
  selected: Set<string>;
  allSelected: boolean;
  onToggle: () => void;
  onRename: (newLabel: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(section.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  // Keep label in sync when section is renamed externally
  useEffect(() => {
    setLabel(section.label);
  }, [section.label]);

  const save = () => {
    const trimmed = label.trim();
    if (trimmed) onRename(trimmed);
    else setLabel(section.label);
    setEditing(false);
  };

  const someSelected =
    !allSelected && section.stocks.some((s) => selected.has(s.symbol));

  return (
    <Reorder.Item
      value={value}
      dragListener={false}
      className="flex items-center gap-3 bg-background px-5 py-3"
    >
      {/* Checkbox */}
      <button onClick={onToggle} className="flex h-5 w-5 shrink-0 items-center justify-center">
        <div
          className={cn(
            "flex h-[18px] w-[18px] items-center justify-center rounded border-[1.5px] transition-colors",
            allSelected
              ? "border-foreground bg-foreground"
              : someSelected
                ? "border-foreground bg-foreground"
                : "border-muted-foreground/40"
          )}
        >
          {allSelected && (
            <Check size={12} strokeWidth={3} className="text-background" />
          )}
          {someSelected && (
            <Minus size={12} strokeWidth={3} className="text-background" />
          )}
        </div>
      </button>

      {/* Label / Edit input */}
      {editing ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setLabel(section.label);
                setEditing(false);
              }
            }}
            className="min-w-0 flex-1 rounded-none border-0 border-b border-foreground/30 bg-transparent p-0 text-[15px] font-semibold text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button
            onClick={save}
            className="flex h-7 w-7 items-center justify-center rounded-md text-foreground active:bg-muted/40"
          >
            <Check size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => {
              setLabel(section.label);
              setEditing(false);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground active:bg-muted/40"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <>
          <span className="min-w-0 flex-1 text-[15px] font-semibold text-muted-foreground">
            {section.label}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 active:bg-muted/40"
          >
            <Pencil size={14} strokeWidth={1.8} />
          </button>
        </>
      )}
    </Reorder.Item>
  );
}

// ─── Draggable Stock Item ───────────────────────────────────────────────────

function DraggableStockItem({
  ticker,
  isSelected,
  onToggle,
}: {
  ticker: TickerItem;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={ticker.symbol}
      className="flex items-center gap-3 bg-background px-5 py-2.5"
      dragListener={false}
      dragControls={dragControls}
    >
      {/* Checkbox */}
      <button onClick={onToggle} className="flex h-5 w-5 shrink-0 items-center justify-center">
        <div
          className={cn(
            "flex h-[18px] w-[18px] items-center justify-center rounded border-[1.5px] transition-colors",
            isSelected
              ? "border-foreground bg-foreground"
              : "border-muted-foreground/40"
          )}
        >
          {isSelected && (
            <Check size={12} strokeWidth={3} className="text-background" />
          )}
        </div>
      </button>

      {/* Logo */}
      <TickerLogo ticker={ticker} size="sm" />

      {/* Name + Symbol */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold leading-tight text-foreground">
          {ticker.name}
        </p>
        <p className="mt-0.5 text-[13px] leading-tight text-muted-foreground">
          {ticker.symbol}
        </p>
      </div>

      {/* Drag handle */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex h-8 w-8 cursor-grab items-center justify-center touch-none text-muted-foreground/40 active:cursor-grabbing"
      >
        <GripVertical size={18} strokeWidth={1.5} />
      </div>
    </Reorder.Item>
  );
}

// ─── Main Edit Sheet ────────────────────────────────────────────────────────

export function EditSheet() {
  const { editSheetOpen, closeEditSheet, sections, setSections } =
    useWatchlist();

  const [localSections, setLocalSections] = useState<WatchlistSection[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [flatOrder, setFlatOrder] = useState<string[]>([]);

  // Sync when sheet opens
  useEffect(() => {
    if (editSheetOpen) {
      const secs = sections.map((s) => ({ ...s, stocks: [...s.stocks] }));
      setLocalSections(secs);
      setFlatOrder(buildFlatOrder(secs));
      setSelected(new Set());
    }
  }, [editSheetOpen, sections]);

  // Lookup maps (derived from localSections)
  const stockMap = useMemo(() => {
    const map = new Map<string, TickerItem>();
    localSections.forEach((s) => s.stocks.forEach((t) => map.set(t.symbol, t)));
    return map;
  }, [localSections]);

  const sectionMap = useMemo(
    () => new Map(localSections.map((s) => [s.id, s])),
    [localSections]
  );

  const handleReorder = (newOrder: string[]) => {
    setFlatOrder(newOrder);
    setLocalSections(reconstructSections(newOrder, localSections));
  };

  const toggleStock = (symbol: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    const section = localSections.find((s) => s.id === sectionId);
    if (!section) return;
    const allSel = section.stocks.every((s) => selected.has(s.symbol));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSel) {
        section.stocks.forEach((s) => next.delete(s.symbol));
      } else {
        section.stocks.forEach((s) => next.add(s.symbol));
      }
      return next;
    });
  };

  const renameSection = (sectionId: string, newLabel: string) => {
    setLocalSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, label: newLabel } : s))
    );
  };

  const deleteSelected = () => {
    if (selected.size === 0) return;
    const newSections = localSections.map((s) => ({
      ...s,
      stocks: s.stocks.filter((t) => !selected.has(t.symbol)),
    }));
    setLocalSections(newSections);
    setFlatOrder(buildFlatOrder(newSections));
    setSelected(new Set());
  };

  const handleDone = () => {
    setSections(localSections);
    closeEditSheet();
  };

  const selectedCount = selected.size;

  return (
    <Sheet
      open={editSheetOpen}
      onOpenChange={(open) => !open && closeEditSheet()}
    >
      <SheetContent
        side="bottom"
        className="mx-auto flex max-h-[85dvh] max-w-[430px] flex-col gap-0 rounded-t-2xl border-border/60 bg-background px-0 pb-0 pt-4 [&>button]:hidden"
      >
        {/* Header: Delete (when selected) | Title | Done */}
        <SheetHeader className="flex-row items-center justify-between border-0 px-5 pb-2">
          {selectedCount > 0 ? (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-1.5 text-[15px] font-medium text-red-400"
            >
              <Trash2 size={16} strokeWidth={1.8} />
              Delete ({selectedCount})
            </button>
          ) : (
            <div className="w-20" />
          )}
          <SheetTitle className="text-[17px] font-semibold">
            Edit Watchlist
          </SheetTitle>
          <button
            onClick={handleDone}
            className="text-[15px] font-semibold text-foreground"
          >
            Done
          </button>
        </SheetHeader>

        <div className="h-px bg-border/40" />

        {/* Scrollable — single Reorder.Group for cross-section drag */}
        <div className="no-scrollbar flex-1 overflow-y-auto pb-8">
          <Reorder.Group
            axis="y"
            values={flatOrder}
            onReorder={handleReorder}
            className="relative"
          >
            {flatOrder.map((item) => {
              if (item.startsWith(SEC)) {
                const sectionId = item.slice(SEC.length);
                const section = sectionMap.get(sectionId);
                if (!section) return null;

                const allSel =
                  section.stocks.length > 0 &&
                  section.stocks.every((s) => selected.has(s.symbol));

                return (
                  <EditableSectionHeader
                    key={item}
                    section={section}
                    value={item}
                    selected={selected}
                    allSelected={allSel}
                    onToggle={() => toggleSection(sectionId)}
                    onRename={(label) => renameSection(sectionId, label)}
                  />
                );
              }

              const ticker = stockMap.get(item);
              if (!ticker) return null;

              return (
                <DraggableStockItem
                  key={item}
                  ticker={ticker}
                  isSelected={selected.has(item)}
                  onToggle={() => toggleStock(item)}
                />
              );
            })}
          </Reorder.Group>
        </div>
      </SheetContent>
    </Sheet>
  );
}
