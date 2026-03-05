"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ALL_TICKERS, type TickerItem } from "@/components/ticker";

export type SortOption = "symbol" | "change" | "volume" | "marketCap" | "flag" | null;

export interface WatchlistSection {
  id: string;
  label: string;
  stocks: TickerItem[];
}

const INITIAL_SECTIONS: WatchlistSection[] = [
  {
    id: "indices",
    label: "Indices",
    stocks: ALL_TICKERS.filter((t) => t.category === "index"),
  },
  {
    id: "us-stocks",
    label: "US Stocks",
    stocks: ALL_TICKERS.filter((t) => t.category === "watchlist").slice(0, 10),
  },
  {
    id: "interested",
    label: "Interested",
    stocks: ALL_TICKERS.filter((t) => t.category === "watchlist").slice(10),
  },
];

type WatchlistCtx = {
  // Sections (mutable via edit sheet)
  sections: WatchlistSection[];
  setSections: (sections: WatchlistSection[]) => void;
  // Sort
  sortSheetOpen: boolean;
  openSortSheet: () => void;
  closeSortSheet: () => void;
  currentSort: SortOption;
  setSort: (sort: SortOption) => void;
  // Edit sheet
  editSheetOpen: boolean;
  openEditSheet: () => void;
  closeEditSheet: () => void;
  // Flags
  flaggedSymbols: Set<string>;
  toggleFlag: (symbol: string) => void;
  // Deletes (swipe delete)
  deletedSymbols: Set<string>;
  deleteSymbol: (symbol: string) => void;
  deletedSections: Set<string>;
  deleteSection: (sectionId: string) => void;
  // Collapse
  collapsedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
};

const Ctx = createContext<WatchlistCtx>({
  sections: INITIAL_SECTIONS,
  setSections: () => {},
  sortSheetOpen: false,
  openSortSheet: () => {},
  closeSortSheet: () => {},
  currentSort: null,
  setSort: () => {},
  editSheetOpen: false,
  openEditSheet: () => {},
  closeEditSheet: () => {},
  flaggedSymbols: new Set(),
  toggleFlag: () => {},
  deletedSymbols: new Set(),
  deleteSymbol: () => {},
  deletedSections: new Set(),
  deleteSection: () => {},
  collapsedSections: new Set(),
  toggleSection: () => {},
});

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<WatchlistSection[]>(INITIAL_SECTIONS);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>(null);
  const [flaggedSymbols, setFlagged] = useState<Set<string>>(new Set());
  const [deletedSymbols, setDeleted] = useState<Set<string>>(new Set());
  const [deletedSections, setDeletedSections] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsed] = useState<Set<string>>(new Set());

  const toggleFlag = (symbol: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };

  const deleteSymbol = (symbol: string) => {
    setDeleted((prev) => new Set(prev).add(symbol));
  };

  const deleteSection = (sectionId: string) => {
    setDeletedSections((prev) => new Set(prev).add(sectionId));
  };

  const toggleSection = (sectionId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  return (
    <Ctx.Provider
      value={{
        sections,
        setSections,
        sortSheetOpen,
        openSortSheet: () => setSortSheetOpen(true),
        closeSortSheet: () => setSortSheetOpen(false),
        currentSort,
        setSort: setCurrentSort,
        editSheetOpen,
        openEditSheet: () => setEditSheetOpen(true),
        closeEditSheet: () => setEditSheetOpen(false),
        flaggedSymbols,
        toggleFlag,
        deletedSymbols,
        deleteSymbol,
        deletedSections,
        deleteSection,
        collapsedSections,
        toggleSection,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useWatchlist() {
  return useContext(Ctx);
}
