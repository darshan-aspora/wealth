"use client";

import { Suspense, useState, useMemo, useEffect, useDeferredValue } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpDown } from "lucide-react";
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
  const [query] = useState(params?.get("q") ?? "");
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


  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-[17px] font-bold tracking-tight text-foreground ml-1">
          What&apos;s Moving
        </h1>
        {/* Cap size flipper */}
        <button
          onClick={() => {
            const order = CAP_CHIPS.map((c) => c.id);
            const currentIdx = order.findIndex((id) =>
              id === "all"
                ? caps.size === baseCapOrder.length
                : caps.has(id) && caps.size === 1,
            );
            const nextIdx = (currentIdx + 1) % order.length;
            const next = order[nextIdx];
            setCaps(next === "all" ? new Set(baseCapOrder) : new Set([next]));
          }}
          className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[13px] font-semibold text-foreground active:scale-[0.97] transition-transform"
        >
          <span className="leading-none">
            {caps.size === baseCapOrder.length
              ? "All"
              : CAP_CHIPS.find((c) => c.id !== "all" && caps.has(c.id as BaseCapSize))?.label ?? "All"}
          </span>
          <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />
        </button>
      </header>

      {/* Mover type tabs — fixed between header and scrollable content */}
      <div className="shrink-0 border-b border-border/40 bg-background">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5">
            {moverTabs.map((tab, i) => {
              const active = moverType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMoverType(tab.id)}
                  className={cn(
                    "relative whitespace-nowrap py-1.5 text-[14px] font-semibold transition-colors",
                    i === 0 ? "pr-3" : "px-3",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {tab.label}
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

      <main className="no-scrollbar flex-1 overflow-y-auto">
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
