"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SavedComparison {
  id: string;
  name: string;
  symbols: string[];
  createdAt: number;
  updatedAt: number;
}

type CompareCtx = {
  // Active session
  activeSymbols: string[];
  addStock: (symbol: string) => void;
  removeStock: (symbol: string) => void;
  clearAll: () => void;
  setActiveSymbols: (symbols: string[]) => void;
  reorderStock: (symbol: string, toIndex: number) => void;

  // Saved lists
  saved: SavedComparison[];
  saveCurrent: (name: string) => SavedComparison;
  renameSaved: (id: string, name: string) => void;
  deleteSaved: (id: string) => void;
  duplicateSaved: (id: string) => void;
  loadSaved: (id: string) => void;
  restoreSaved: (comparison: SavedComparison) => void;

  // Active session link to a saved list (so we know when to "Save" vs "Saved ✓")
  activeSavedId: string | null;

  // Toast system
  toast: { message: string; undo?: () => void } | null;
  showToast: (message: string, undo?: () => void) => void;
  dismissToast: () => void;
};

const STORAGE_KEY_ACTIVE = "aspora-compare-active";
const STORAGE_KEY_SAVED = "aspora-compare-saved";
const STORAGE_KEY_ACTIVE_ID = "aspora-compare-active-id";

const Ctx = createContext<CompareCtx | null>(null);

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function CompareProvider({ children }: { children: ReactNode }) {
  const [activeSymbols, setActiveSymbolsState] = useState<string[]>([]);
  const [saved, setSaved] = useState<SavedComparison[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [toast, setToast] = useState<CompareCtx["toast"]>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setActiveSymbolsState(loadFromStorage<string[]>(STORAGE_KEY_ACTIVE, []));
    setSaved(loadFromStorage<SavedComparison[]>(STORAGE_KEY_SAVED, []));
    setActiveSavedId(loadFromStorage<string | null>(STORAGE_KEY_ACTIVE_ID, null));
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (hydrated) saveToStorage(STORAGE_KEY_ACTIVE, activeSymbols);
  }, [activeSymbols, hydrated]);
  useEffect(() => {
    if (hydrated) saveToStorage(STORAGE_KEY_SAVED, saved);
  }, [saved, hydrated]);
  useEffect(() => {
    if (hydrated) saveToStorage(STORAGE_KEY_ACTIVE_ID, activeSavedId);
  }, [activeSavedId, hydrated]);

  const setActiveSymbols = useCallback((symbols: string[]) => {
    setActiveSymbolsState(symbols);
    setActiveSavedId(null); // manual change = unsaved state
  }, []);

  const addStock = useCallback((symbol: string) => {
    setActiveSymbolsState((prev) => {
      const sym = symbol.toUpperCase();
      if (prev.includes(sym)) return prev;
      return [...prev, sym];
    });
    setActiveSavedId(null);
  }, []);

  const removeStock = useCallback((symbol: string) => {
    setActiveSymbolsState((prev) => prev.filter((s) => s !== symbol.toUpperCase()));
    setActiveSavedId(null);
  }, []);

  const clearAll = useCallback(() => {
    setActiveSymbolsState([]);
    setActiveSavedId(null);
  }, []);

  const reorderStock = useCallback((symbol: string, toIndex: number) => {
    setActiveSymbolsState((prev) => {
      const sym = symbol.toUpperCase();
      const from = prev.indexOf(sym);
      if (from === -1 || from === toIndex) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(toIndex, 0, sym);
      return next;
    });
  }, []);

  const saveCurrent = useCallback(
    (name: string): SavedComparison => {
      const now = Date.now();
      const trimmed = name.trim() || `Untitled`;
      const comparison: SavedComparison = {
        id: `cmp-${now}-${Math.random().toString(36).slice(2, 8)}`,
        name: trimmed,
        symbols: [...activeSymbols],
        createdAt: now,
        updatedAt: now,
      };
      setSaved((prev) => [comparison, ...prev]);
      setActiveSavedId(comparison.id);
      return comparison;
    },
    [activeSymbols],
  );

  const renameSaved = useCallback((id: string, name: string) => {
    setSaved((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: name.trim() || c.name, updatedAt: Date.now() } : c)),
    );
  }, []);

  const deleteSaved = useCallback((id: string) => {
    setSaved((prev) => prev.filter((c) => c.id !== id));
    setActiveSavedId((curr) => (curr === id ? null : curr));
  }, []);

  const duplicateSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;
      const now = Date.now();
      const copy: SavedComparison = {
        ...target,
        id: `cmp-${now}-${Math.random().toString(36).slice(2, 8)}`,
        name: `${target.name} (copy)`,
        createdAt: now,
        updatedAt: now,
      };
      return [copy, ...prev];
    });
  }, []);

  const loadSaved = useCallback(
    (id: string) => {
      const target = saved.find((c) => c.id === id);
      if (!target) return;
      setActiveSymbolsState([...target.symbols]);
      setActiveSavedId(id);
    },
    [saved],
  );

  const restoreSaved = useCallback((comparison: SavedComparison) => {
    setSaved((prev) => {
      if (prev.some((c) => c.id === comparison.id)) return prev;
      return [comparison, ...prev];
    });
  }, []);

  const showToast = useCallback((message: string, undo?: () => void) => {
    setToast({ message, undo });
    window.setTimeout(() => {
      setToast((curr) => (curr && curr.message === message ? null : curr));
    }, 4000);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <Ctx.Provider
      value={{
        activeSymbols,
        addStock,
        removeStock,
        clearAll,
        setActiveSymbols,
        reorderStock,
        saved,
        saveCurrent,
        renameSaved,
        deleteSaved,
        duplicateSaved,
        loadSaved,
        restoreSaved,
        activeSavedId,
        toast,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return ctx;
}
