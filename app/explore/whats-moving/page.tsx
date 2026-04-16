"use client";

import { Suspense, useState, useMemo, useEffect, useDeferredValue } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
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
import { Toolbar } from "./components/toolbar";
import { SortSheet } from "./components/sort-sheet";
import { FiltersSheet } from "./components/filters-sheet";
import {
  ColumnsSheet,
  DEFAULT_COLUMNS,
  ALL_COLUMNS,
  type ColumnId,
} from "./components/columns-sheet";
import { ActiveFilters } from "./components/active-filters";
import { MoversTable } from "./components/movers-table";
import {
  activeFilterCount,
  emptyFilters,
  type MoversFilters,
} from "./components/filter-state";

const COLUMN_STORAGE_KEY = "whats-moving:cols";

const CAP_CHIPS: { id: "all" | BaseCapSize; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mega", label: "Mega" },
  { id: "large", label: "Large" },
  { id: "midcap", label: "Mid" },
  { id: "small", label: "Small" },
];

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
  const [query, setQuery] = useState(params?.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);

  const [filters, setFilters] = useState<MoversFilters>(emptyFilters);
  const [columns, setColumns] = useState<ColumnId[]>(DEFAULT_COLUMNS);

  // Sheet open state
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);

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

  // When the mover type changes and there's no explicit sort override in URL,
  // we leave `sort` where it is — user-selected sort persists across tabs.
  // (If they want the natural order back they can pick it in the sort sheet.)

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

  const activeCount = activeFilterCount(filters);
  const sortLabel =
    sort.key in sortLabels
      ? `${sortLabels[sort.key]} ${sort.dir === "desc" ? "↓" : "↑"}`
      : "Sort";

  // Cap chip toggle — "all" is mutually exclusive with individual caps.
  const toggleCap = (id: "all" | BaseCapSize) => {
    setCaps((prev) => {
      if (id === "all") return new Set(baseCapOrder);
      const next = new Set(prev);
      // If we're coming from "all" (== full set), start fresh with just this one.
      if (next.size === baseCapOrder.length) return new Set([id]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      // Never leave an empty selection — snap back to all.
      if (next.size === 0) return new Set(baseCapOrder);
      return next;
    });
  };

  const capChipActive = (id: "all" | BaseCapSize): boolean => {
    if (id === "all") return caps.size === baseCapOrder.length;
    return caps.has(id) && caps.size < baseCapOrder.length;
  };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-3 pb-3 border-b border-border/40">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center -ml-2 rounded-full active:bg-foreground/[0.06] transition-colors"
        >
          <ChevronLeft size={22} strokeWidth={2} className="text-foreground" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold tracking-tight text-foreground leading-tight">
            What&apos;s Moving
          </h1>
          <p className="text-[12px] text-muted-foreground leading-tight">
            Slice the market. Your rules.
          </p>
        </div>
      </div>

      <main className="no-scrollbar flex-1 overflow-y-auto">
        {/* Mover type tabs — horizontally scrollable pill strip */}
        <div className="sticky top-0 z-20 bg-background border-b border-border/40">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-1 px-5 py-3">
              {moverTabs.map((tab) => {
                const active = moverType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMoverType(tab.id)}
                    className={cn(
                      "relative whitespace-nowrap px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors",
                      active
                        ? "text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="whats-moving-pill"
                        className="absolute inset-0 rounded-full bg-foreground"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cap size multi-select chips */}
          <div className="overflow-x-auto no-scrollbar border-t border-border/30">
            <div className="flex gap-1.5 px-5 py-2.5">
              {CAP_CHIPS.map((c) => {
                const on = capChipActive(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCap(c.id)}
                    className={cn(
                      "whitespace-nowrap px-3 py-1 rounded-full text-[12px] font-semibold transition-colors",
                      on
                        ? "bg-foreground text-background"
                        : "border border-border/60 text-foreground"
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toolbar */}
          <div className="border-t border-border/30">
            <Toolbar
              query={query}
              onQueryChange={setQuery}
              activeFilterCount={activeCount}
              onOpenFilters={() => setFiltersOpen(true)}
              sortLabel={sortLabel}
              onOpenSort={() => setSortOpen(true)}
              onOpenColumns={() => setColumnsOpen(true)}
            />
          </div>

          {/* Active-filters chip row (only when present) */}
          <ActiveFilters filters={filters} onChange={setFilters} />

          {/* Result strip */}
          <div className="px-5 pb-2 flex items-center justify-between">
            <p className="text-[12px] text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">
                {visibleStocks.length}
              </span>{" "}
              {visibleStocks.length === 1 ? "stock" : "stocks"}
              <span className="text-muted-foreground/40 mx-1.5">·</span>
              sorted by {sortLabels[sort.key]}{" "}
              {sort.dir === "desc" ? "↓" : "↑"}
            </p>
          </div>
        </div>

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

      {/* Sheets */}
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
