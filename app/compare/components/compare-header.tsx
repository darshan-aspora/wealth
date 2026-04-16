"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Share2, MoreHorizontal, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CompareHeaderProps {
  symbolCount: number;
  isSaved: boolean;
  listName: string | null;
  canSave: boolean;
  onSave: () => void;
  onShare: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onClearAll: () => void;
  onViewSaved: () => void;
}

export function CompareHeader({
  symbolCount,
  isSaved,
  listName,
  canSave,
  onSave,
  onShare,
  onRename,
  onDuplicate,
  onClearAll,
  onViewSaved,
}: CompareHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-1 px-3 py-3 border-b border-border/30">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Back"
        className="flex h-10 w-10 items-center justify-center rounded-full text-foreground active:bg-muted transition-colors"
      >
        <ArrowLeft size={22} strokeWidth={2} />
      </button>

      <div className="flex-1 min-w-0 px-1">
        <p className="text-[17px] font-bold text-foreground truncate">
          {listName ?? "Compare"}
          {symbolCount > 0 && !listName && (
            <span className="ml-1.5 text-muted-foreground/60 font-semibold">· {symbolCount}</span>
          )}
        </p>
        {listName && (
          <p className="text-[12px] text-muted-foreground">
            {symbolCount} {symbolCount === 1 ? "stock" : "stocks"}
          </p>
        )}
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={canSave ? onSave : undefined}
        disabled={!canSave}
        aria-label={isSaved ? "Saved" : "Save"}
        className={cn(
          "flex h-10 items-center gap-1.5 rounded-full px-3 transition-colors",
          isSaved
            ? "bg-muted text-muted-foreground"
            : canSave
              ? "text-foreground active:bg-muted"
              : "text-muted-foreground/40",
        )}
      >
        {isSaved ? (
          <>
            <Check size={16} strokeWidth={2.5} />
            <span className="text-[13px] font-semibold">Saved</span>
          </>
        ) : (
          <>
            <Bookmark size={18} strokeWidth={2} />
            <span className="text-[13px] font-semibold">Save</span>
          </>
        )}
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={symbolCount > 0 ? onShare : undefined}
        disabled={symbolCount === 0}
        aria-label="Share"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          symbolCount > 0 ? "text-foreground active:bg-muted" : "text-muted-foreground/40",
        )}
      >
        <Share2 size={18} strokeWidth={2} />
      </button>

      {/* Overflow */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="More"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground active:bg-muted transition-colors"
          >
            <MoreHorizontal size={20} strokeWidth={2} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-2xl">
          <DropdownMenuItem onSelect={onViewSaved} className="text-[14px] py-2.5">
            Saved comparisons
          </DropdownMenuItem>
          {isSaved && (
            <>
              <DropdownMenuItem onSelect={onRename} className="text-[14px] py-2.5">
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onDuplicate} className="text-[14px] py-2.5">
                Duplicate
              </DropdownMenuItem>
            </>
          )}
          {symbolCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={onClearAll}
                className="text-[14px] py-2.5 text-[hsl(var(--loss))] focus:text-[hsl(var(--loss))]"
              >
                Clear all stocks
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
