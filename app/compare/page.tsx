"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { useCompare } from "@/contexts/compare-context";
import { CompareHeader } from "./components/compare-header";
import { CompareTable } from "./components/compare-table";
import { InsightCard } from "./components/insight-card";
import { EmptyState } from "./components/empty-state";
import { AddStockSheet } from "./components/add-stock-sheet";
import { StockActionsSheet } from "./components/stock-actions-sheet";
import { AlertSubSheet } from "./components/alert-sub-sheet";
import { SaveSheet } from "./components/save-sheet";
import { ShareSheet } from "./components/share-sheet";
import { RenameSheet } from "./components/rename-sheet";
import { CompareToast } from "./components/compare-toast";
import { getCompareData } from "./lib/metrics";
import { getInsight } from "./lib/insights";

function ComparePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    activeSymbols,
    setActiveSymbols,
    addStock,
    removeStock,
    clearAll,
    saved,
    activeSavedId,
    saveCurrent,
    renameSaved,
    duplicateSaved,
    showToast,
  } = useCompare();

  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [actionsSymbol, setActionsSymbol] = useState<string | null>(null);
  const [alertSymbol, setAlertSymbol] = useState<string | null>(null);
  const [saveSheetOpen, setSaveSheetOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [renameSheetOpen, setRenameSheetOpen] = useState(false);

  // Deep-link: /compare?symbols=AAPL,NVDA — load a session from URL
  useEffect(() => {
    const param = searchParams.get("symbols");
    if (param) {
      const incoming = param
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      if (incoming.length > 0) {
        setActiveSymbols(incoming);
        // clear the query param without re-navigation
        window.history.replaceState({}, "", "/compare");
      }
    }
  }, [searchParams, setActiveSymbols]);

  const data = useMemo(() => activeSymbols.map(getCompareData), [activeSymbols]);
  const insight = useMemo(() => getInsight(data), [data]);

  const activeSavedList = useMemo(
    () => (activeSavedId ? saved.find((c) => c.id === activeSavedId) ?? null : null),
    [activeSavedId, saved],
  );

  const handleRemove = (symbol: string) => {
    // Snapshot the pre-remove state so the undo closure has a stable value
    const snapshot = [...activeSymbols];
    removeStock(symbol);
    showToast(`Removed ${symbol}`, () => {
      setActiveSymbols(snapshot);
    });
  };

  const handleClearAll = () => {
    const snapshot = [...activeSymbols];
    clearAll();
    showToast("Cleared all stocks", () => setActiveSymbols(snapshot));
  };

  const handleSave = (name: string) => {
    saveCurrent(name);
    showToast(`Saved as "${name}"`);
  };

  const handleRename = (name: string) => {
    if (!activeSavedId) return;
    renameSaved(activeSavedId, name);
    showToast("Renamed");
  };

  const handleDuplicate = () => {
    if (!activeSavedId) return;
    duplicateSaved(activeSavedId);
    showToast("Duplicated — find it in Saved");
  };

  const isEmpty = activeSymbols.length === 0;
  const isSaved = Boolean(activeSavedId);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <CompareHeader
        symbolCount={activeSymbols.length}
        isSaved={isSaved}
        listName={activeSavedList?.name ?? null}
        canSave={activeSymbols.length > 0 && !isSaved}
        onSave={() => setSaveSheetOpen(true)}
        onShare={() => setShareSheetOpen(true)}
        onRename={() => setRenameSheetOpen(true)}
        onDuplicate={handleDuplicate}
        onClearAll={handleClearAll}
        onViewSaved={() => router.push("/compare/saved")}
      />

      <main className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden">
        {isEmpty ? (
          <EmptyState
            onAddStock={() => setAddSheetOpen(true)}
            onQuickStart={(symbols) => setActiveSymbols(symbols)}
          />
        ) : (
          <>
            <CompareTable
              data={data}
              onAddStock={() => setAddSheetOpen(true)}
              onRemoveStock={handleRemove}
              onHeaderTap={(symbol) => setActionsSymbol(symbol)}
            />
            <InsightCard insight={insight} />
            <div className="h-8" />
          </>
        )}
      </main>

      {/* Sheets */}
      <AddStockSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        activeSymbols={activeSymbols}
        onAdd={addStock}
      />
      <StockActionsSheet
        symbol={actionsSymbol}
        onOpenChange={(o) => !o && setActionsSymbol(null)}
        onRemove={() => {
          if (actionsSymbol) handleRemove(actionsSymbol);
        }}
        onSetAlert={() => {
          const s = actionsSymbol;
          setActionsSymbol(null);
          // small delay so the previous sheet fully closes
          window.setTimeout(() => setAlertSymbol(s), 200);
        }}
      />
      <AlertSubSheet
        symbol={alertSymbol}
        onOpenChange={(o) => !o && setAlertSymbol(null)}
        onAlertSet={(msg) => showToast(msg)}
      />
      <SaveSheet
        open={saveSheetOpen}
        onOpenChange={setSaveSheetOpen}
        symbols={activeSymbols}
        onSave={handleSave}
      />
      <ShareSheet
        open={shareSheetOpen}
        onOpenChange={setShareSheetOpen}
        symbols={activeSymbols}
        listName={activeSavedList?.name ?? null}
        insight={insight}
      />
      <RenameSheet
        open={renameSheetOpen}
        onOpenChange={setRenameSheetOpen}
        currentName={activeSavedList?.name ?? ""}
        onRename={handleRename}
      />

      <CompareToast />
      <HomeIndicator />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="mx-auto h-dvh max-w-[430px] bg-background" />}>
      <ComparePageInner />
    </Suspense>
  );
}
