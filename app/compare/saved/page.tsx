"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, MoreHorizontal, GitCompareArrows, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { useCompare, type SavedComparison } from "@/contexts/compare-context";
import { CompareToast } from "../components/compare-toast";
import { RenameSheet } from "../components/rename-sheet";

function formatUpdated(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SavedCard({
  comparison,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: {
  comparison: SavedComparison;
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl bg-muted/50 border border-border/30 p-4"
    >
      <button type="button" onClick={onOpen} className="w-full text-left active:opacity-70 transition-opacity">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 pr-10">
            <p className="text-[17px] font-bold text-foreground truncate">{comparison.name}</p>
            <p className="mt-1 text-[14px] text-muted-foreground truncate">
              {comparison.symbols.join(" · ")}
            </p>
            <p className="mt-2 text-[12px] text-muted-foreground/60">
              Updated {formatUpdated(comparison.updatedAt)} · {comparison.symbols.length} {comparison.symbols.length === 1 ? "stock" : "stocks"}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground">
            <ChevronRight size={18} strokeWidth={2.25} />
          </div>
        </div>
      </button>

      <div className="absolute top-3 right-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More options"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
            >
              <MoreHorizontal size={18} strokeWidth={2} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-2xl">
            <DropdownMenuItem onSelect={onRename} className="text-[14px] py-2.5">
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDuplicate} className="text-[14px] py-2.5">
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-[14px] py-2.5 text-[hsl(var(--loss))] focus:text-[hsl(var(--loss))]"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

export default function SavedComparisonsPage() {
  const router = useRouter();
  const { saved, loadSaved, renameSaved, duplicateSaved, deleteSaved, restoreSaved, showToast } = useCompare();

  const [renameTarget, setRenameTarget] = useState<SavedComparison | null>(null);

  const handleOpen = (id: string) => {
    loadSaved(id);
    router.push("/compare");
  };

  const handleDelete = (c: SavedComparison) => {
    const snapshot = { ...c };
    deleteSaved(c.id);
    showToast(`Deleted "${c.name}"`, () => {
      restoreSaved(snapshot);
    });
  };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <header className="flex items-center gap-2 px-3 py-3 border-b border-border/30">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground active:bg-muted transition-colors"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div className="flex-1 px-1">
          <p className="text-[17px] font-bold text-foreground">Your comparisons</p>
          {saved.length > 0 && (
            <p className="text-[12px] text-muted-foreground">
              {saved.length} saved
            </p>
          )}
        </div>
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
        {saved.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-12">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <GitCompareArrows size={24} strokeWidth={1.75} className="text-foreground" />
            </div>
            <h1 className="text-center text-[20px] font-bold leading-tight text-foreground max-w-[280px]">
              You haven&rsquo;t saved any comparisons yet.
            </h1>
            <p className="mt-3 text-center text-[15px] leading-relaxed text-muted-foreground max-w-[300px]">
              Build one, then tap Save. They&rsquo;ll live here.
            </p>
            <button
              type="button"
              onClick={() => router.push("/compare")}
              className="mt-6 flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-background active:scale-[0.97] transition-transform"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="text-[15px] font-bold">Start comparing</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {saved.map((c) => (
                <SavedCard
                  key={c.id}
                  comparison={c}
                  onOpen={() => handleOpen(c.id)}
                  onRename={() => setRenameTarget(c)}
                  onDuplicate={() => {
                    duplicateSaved(c.id);
                    showToast("Duplicated");
                  }}
                  onDelete={() => handleDelete(c)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <RenameSheet
        open={Boolean(renameTarget)}
        onOpenChange={(o) => !o && setRenameTarget(null)}
        currentName={renameTarget?.name ?? ""}
        onRename={(name) => {
          if (renameTarget) renameSaved(renameTarget.id, name);
          showToast("Renamed");
        }}
      />

      <CompareToast />
      <HomeIndicator />
    </div>
  );
}
