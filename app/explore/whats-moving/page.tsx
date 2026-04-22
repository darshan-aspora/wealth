"use client";

import {
  Suspense,
  useState,
  useMemo,
  useEffect,
  useDeferredValue,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useWatchlist } from "@/components/watchlist-context";
import { cn } from "@/lib/utils";
import {
  baseCapOrder,
  data,
  defaultSortFor,
  moverTabs,
  sortLabels,
  sortValue,
  sectorOf,
  type BaseCapSize,
  type MoverType,
  type SortDir,
  type SortKey,
  type Stock,
} from "@/app/explore/_data/movers";
import { SortSheet } from "./components/sort-sheet";
import { FiltersSheet } from "./components/filters-sheet";
import {
  ColumnsSheet,
  DEFAULT_COLUMNS,
  ALL_COLUMNS,
  type ColumnId,
} from "./components/columns-sheet";
import { MoversTable } from "./components/movers-table";
import {
  emptyFilters,
  type MoversFilters,
} from "./components/filter-state";

const COLUMN_STORAGE_KEY = "whats-moving:cols";

/* Cap sheet options — single-select pill (All + 4 caps) */
type CapPick = "all" | BaseCapSize;
const CAP_OPTIONS: { id: CapPick; label: string }[] = [
  { id: "all", label: "All Caps" },
  { id: "mega", label: "Mega Cap" },
  { id: "large", label: "Large Cap" },
  { id: "midcap", label: "Mid Cap" },
  { id: "small", label: "Small Cap" },
];
const CAP_SHORT_LABEL: Record<CapPick, string> = {
  all: "All Caps",
  mega: "Mega",
  large: "Large",
  midcap: "Mid",
  small: "Small",
};

const VALID_MOVER_TYPES: MoverType[] = [
  "gainers",
  "losers",
  "most-active",
  "near-52w-high",
  "near-52w-low",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseCapsParam(raw: string | null): Set<BaseCapSize> {
  if (!raw || raw === "all") return new Set(baseCapOrder);
  const caps = raw
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter((x): x is BaseCapSize =>
      (baseCapOrder as string[]).includes(x)
    );
  return caps.length ? new Set(caps) : new Set(baseCapOrder);
}

function capsToPick(caps: Set<BaseCapSize>): CapPick {
  if (caps.size === baseCapOrder.length) return "all";
  if (caps.size === 1) {
    const [only] = Array.from(caps);
    return only;
  }
  // Fallback: if some unusual multi-select, treat as All for the pill label.
  return "all";
}

function parseSortParam(raw: string | null): { key: SortKey; dir: SortDir } | null {
  if (!raw) return null;
  const [k, d] = raw.split(":");
  if (!(k in sortLabels)) return null;
  if (d !== "asc" && d !== "desc") return null;
  return { key: k as SortKey, dir: d };
}

function loadColumns(): ColumnId[] {
  if (typeof window === "undefined") return DEFAULT_COLUMNS;
  try {
    const raw = window.localStorage.getItem(COLUMN_STORAGE_KEY);
    if (!raw) return DEFAULT_COLUMNS;
    const parsed = JSON.parse(raw) as string[];
    const valid = parsed.filter((c): c is ColumnId =>
      (ALL_COLUMNS as string[]).includes(c)
    );
    return valid.length ? valid : DEFAULT_COLUMNS;
  } catch {
    return DEFAULT_COLUMNS;
  }
}

function applyFilters(stocks: Stock[], f: MoversFilters): Stock[] {
  return stocks.filter((s) => {
    if (f.sectors.length && !f.sectors.includes(sectorOf(s.symbol))) return false;
    if (f.profitableOnly && s.pe == null) return false;
    if (f.peMin != null && (s.pe == null || s.pe < f.peMin)) return false;
    if (f.peMax != null && (s.pe == null || s.pe > f.peMax)) return false;
    if (f.revGrowthMin != null && s.revGrowth < f.revGrowthMin) return false;
    if (f.profitGrowthMin != null && s.profitGrowth < f.profitGrowthMin) return false;
    if (f.ratings.length && !f.ratings.includes(s.rating)) return false;
    return true;
  });
}

function applySearch(stocks: Stock[], q: string): Stock[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return stocks;
  return stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(needle) ||
      s.name.toLowerCase().includes(needle)
  );
}

function applySort(stocks: Stock[], key: SortKey, dir: SortDir): Stock[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...stocks].sort((a, b) => sign * (sortValue(a, key) - sortValue(b, key)));
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function WhatsMovingPage() {
  return (
    <Suspense>
      <WhatsMovingContent />
    </Suspense>
  );
}

function WhatsMovingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { bookmarkedSymbols, toggleBookmark } = useWatchlist();

  // URL-seeded state
  const initialType = (params?.get("type") ?? "gainers") as MoverType;
  const [moverType, setMoverType] = useState<MoverType>(
    VALID_MOVER_TYPES.includes(initialType) ? initialType : "gainers"
  );
  const [caps, setCaps] = useState<Set<BaseCapSize>>(
    parseCapsParam(params?.get("cap") ?? null)
  );
  const initialSort = parseSortParam(params?.get("sort") ?? null);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>(
    initialSort ?? defaultSortFor[
      VALID_MOVER_TYPES.includes(initialType) ? initialType : "gainers"
    ]
  );
  const [query] = useState(params?.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);

  const [filters, setFilters] = useState<MoversFilters>(emptyFilters);
  const [columns, setColumns] = useState<ColumnId[]>(DEFAULT_COLUMNS);

  // Sheet open state
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [capOpen, setCapOpen] = useState(false);

  // Collapsing grey header on scroll
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const handleMainScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setHeaderCollapsed(e.currentTarget.scrollTop > 40);
  }, []);

  // Load columns from localStorage on mount
  useEffect(() => {
    setColumns(loadColumns());
  }, []);

  // Persist column choice
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(columns));
    } catch {
      /* ignore */
    }
  }, [columns]);

  // Sync URL when filter-bearing state changes (shallow, no scroll jump).
  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set("type", moverType);
    const capList = Array.from(caps);
    if (capList.length && capList.length !== baseCapOrder.length) {
      sp.set("cap", capList.join(","));
    }
    sp.set("sort", `${sort.key}:${sort.dir}`);
    if (deferredQuery.trim()) sp.set("q", deferredQuery.trim());
    router.replace(`/explore/whats-moving?${sp.toString()}`, { scroll: false });
  }, [moverType, caps, sort, deferredQuery, router]);

  // Base aggregate for the selected caps
  const baseStocks = useMemo(() => {
    const capList = caps.size === 0 ? baseCapOrder : Array.from(caps);
    const seen = new Set<string>();
    const out: Stock[] = [];
    for (const cap of capList) {
      for (const s of data[moverType][cap]) {
        if (!seen.has(s.symbol)) {
          seen.add(s.symbol);
          out.push(s);
        }
      }
    }
    return out;
  }, [moverType, caps]);

  const filteredStocks = useMemo(
    () => applyFilters(baseStocks, filters),
    [baseStocks, filters]
  );

  const visibleStocks = useMemo(() => {
    const searched = applySearch(filteredStocks, deferredQuery);
    return applySort(searched, sort.key, sort.dir);
  }, [filteredStocks, deferredQuery, sort]);

  // For the Filters-sheet live count
  const matchCount = (draft: MoversFilters) =>
    applySearch(applyFilters(baseStocks, draft), deferredQuery).length;

  // Tab count — number of rows that match the current filter+type combo
  // for each tab (ignoring the per-tab sort; counts are purely about what
  // would be visible after filters+search+cap are applied).
  const tabCounts = useMemo(() => {
    const capList = caps.size === 0 ? baseCapOrder : Array.from(caps);
    return moverTabs.reduce<Record<MoverType, number>>((acc, t) => {
      const seen = new Set<string>();
      const rows: Stock[] = [];
      for (const cap of capList) {
        for (const s of data[t.id][cap]) {
          if (!seen.has(s.symbol)) {
            seen.add(s.symbol);
            rows.push(s);
          }
        }
      }
      acc[t.id] = applySearch(applyFilters(rows, filters), deferredQuery).length;
      return acc;
    }, {
      gainers: 0,
      losers: 0,
      "most-active": 0,
      "near-52w-high": 0,
      "near-52w-low": 0,
    });
  }, [caps, filters, deferredQuery]);

  const currentCap = capsToPick(caps);
  const applyCapPick = (pick: CapPick) => {
    setCaps(pick === "all" ? new Set(baseCapOrder) : new Set([pick]));
  };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Grey header section — expands on top, collapses on scroll */}
      <div className="shrink-0 bg-muted/50 border-b border-border/50">
        {/* Top bar */}
        <header className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <motion.h1
            initial={false}
            animate={{ opacity: headerCollapsed ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 text-[17px] font-bold tracking-tight text-foreground ml-1"
          >
            What&apos;s Moving
          </motion.h1>
          {/* Cap size selector */}
          <button
            onClick={() => setCapOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-[14px] font-semibold text-foreground active:scale-[0.97] transition-transform"
          >
            <span className="leading-none">{CAP_SHORT_LABEL[currentCap]}</span>
            <ChevronDown size={15} className="flex-shrink-0 text-muted-foreground" />
          </button>
        </header>

        {/* Expanded title + description — collapses on scroll */}
        <motion.div
          initial={false}
          animate={{
            maxHeight: headerCollapsed ? 0 : 160,
            opacity: headerCollapsed ? 0 : 1,
          }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden"
        >
          <div className="px-5 pt-1 pb-4">
            <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight">
              What&apos;s Moving
            </h1>
            <p className="mt-1.5 text-[14px] leading-snug text-muted-foreground">
              Biggest gainers, losers, and busiest tickers today.
              <br />
              Hot moves aren&apos;t always good moves.
            </p>
          </div>
        </motion.div>

        {/* Sticky tabs */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5">
            {moverTabs.map((t, i) => {
              const active = moverType === t.id;
              const count = tabCounts[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => setMoverType(t.id)}
                  className={cn(
                    "relative whitespace-nowrap pt-2 pb-3 text-[14px] font-semibold transition-colors flex items-center gap-1.5",
                    i === 0 ? "pr-3" : "px-3",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span>{t.label}</span>
                  <span
                    className={cn(
                      "inline-flex min-w-[20px] justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "bg-muted-foreground/15 text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="whats-moving-tab-underline"
                      className={cn(
                        "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                        i === 0 ? "left-0" : "left-3",
                      )}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main
        className="no-scrollbar flex-1 overflow-y-auto"
        onScroll={handleMainScroll}
      >
        {/* Table */}
        {visibleStocks.length > 0 ? (
          <div className="pt-2 pb-8">
            <MoversTable
              stocks={visibleStocks}
              columns={columns}
              sortKey={sort.key}
              sortDir={sort.dir}
              onSort={(key, dir) => setSort({ key, dir })}
              bookmarkedSymbols={bookmarkedSymbols}
              onToggleBookmark={toggleBookmark}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-[16px] font-semibold text-foreground mb-1">
              No stocks match
            </p>
            <p className="text-[13px] text-muted-foreground max-w-[260px]">
              Try loosening your filters or clearing the search.
            </p>
          </div>
        )}

        <HomeIndicator />
      </main>

      {/* Floating Sort FAB */}
      <button
        onClick={() => setSortOpen(true)}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 h-11 pl-4 pr-5 rounded-full flex items-center gap-2 text-[14px] font-semibold bg-foreground text-background shadow-lg shadow-foreground/20 active:scale-[0.97] transition-transform"
      >
        <ArrowUpDown size={15} strokeWidth={2.5} />
        <span>Sort</span>
      </button>

      {/* Sheets */}
      <CapSheet
        open={capOpen}
        onOpenChange={setCapOpen}
        current={currentCap}
        onChange={(c) => {
          applyCapPick(c);
          setCapOpen(false);
        }}
      />
      <SortSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        sortKey={sort.key}
        sortDir={sort.dir}
        onChange={(key, dir) => {
          setSort({ key, dir });
        }}
      />
      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApply={setFilters}
        matchCount={matchCount}
      />
      <ColumnsSheet
        open={columnsOpen}
        onOpenChange={setColumnsOpen}
        selected={columns}
        onChange={setColumns}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cap size sheet                                                     */
/* ------------------------------------------------------------------ */

function CapSheet({
  open,
  onOpenChange,
  current,
  onChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  current: CapPick;
  onChange: (c: CapPick) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-[28px] p-0 border-0 max-h-[80vh] overflow-y-auto"
      >
        <SheetHeader className="px-5 pt-5 pb-3 text-center sm:text-center">
          <SheetTitle className="text-[20px] font-bold tracking-tight">
            Market cap
          </SheetTitle>
        </SheetHeader>
        <div className="px-2 pb-6">
          {CAP_OPTIONS.map(({ id, label }) => {
            const selected = id === current;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={cn(
                  "w-full flex items-center justify-between rounded-2xl px-3 py-3.5 transition-colors",
                  selected ? "bg-foreground/[0.05]" : "active:bg-muted/40",
                )}
              >
                <span className="text-[16px] font-semibold text-foreground">
                  {label}
                </span>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    selected ? "bg-foreground border-foreground" : "border-border/60",
                  )}
                >
                  {selected && (
                    <Check size={12} strokeWidth={3} className="text-background" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
