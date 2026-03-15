"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Bell, EllipsisVertical, LayoutPanelLeft, BarChart3, ArrowUpDown, Pencil, FolderPlus } from "lucide-react";
import { useTickerVisibility } from "@/components/ticker-visibility";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// ─── Rotating search placeholder ─────────────────────────────────────
export const searchSuffixes = [
  "ETF",
  "Stocks",
  "Options",
  "Indices",
  "News",
  "Baskets",
  "Strategies",
];

export function useRotatingSuffix(interval = 2200) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % searchSuffixes.length);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);
  return searchSuffixes[index];
}

export function SearchPlaceholder() {
  const suffix = useRotatingSuffix();
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    // Force-restart CSS animation: remove → reflow → re-add
    el.style.animation = "none";
    void el.offsetHeight;
    el.style.animation = "";
  }, [suffix]);

  return (
    <span className="flex items-center">
      <span>Search</span>
      <span className="relative ml-[5px] inline-flex h-6 w-[170px] items-center overflow-hidden">
        <span
          ref={spanRef}
          className="absolute left-0 animate-slide-up-in"
        >
          {suffix}
        </span>
      </span>
    </span>
  );
}

export function OptionsMenu({ onSortClick, onEditClick }: { onSortClick?: () => void; onEditClick?: () => void } = {}) {
  const { tickerVisible, showTicker } = useTickerVisibility();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground">
          <EllipsisVertical size={20} strokeWidth={1.8} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {onSortClick ? (
          <>
            <DropdownMenuItem onSelect={onSortClick}>
              <ArrowUpDown size={18} strokeWidth={1.8} />
              Sort
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onEditClick?.()}>
              <Pencil size={18} strokeWidth={1.8} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FolderPlus size={18} strokeWidth={1.8} />
              Create section
            </DropdownMenuItem>
            {!tickerVisible && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={showTicker}>
                  <BarChart3 size={18} strokeWidth={1.8} />
                  Show Ticker
                </DropdownMenuItem>
              </>
            )}
          </>
        ) : (
          <>
            <DropdownMenuItem>
              <LayoutPanelLeft size={18} strokeWidth={1.8} />
              Customise
            </DropdownMenuItem>
            {!tickerVisible && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={showTicker}>
                  <BarChart3 size={18} strokeWidth={1.8} />
                  Show Ticker
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Header V1 — Original layout: [X close] [search] [bell] [profile avatar] */
export function HeaderV1() {
  const router = useRouter();

  return (
    <header className="flex items-center gap-1.5 pl-3 pr-4 py-3">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full text-muted-foreground"
        onClick={() => router.push("/")}
      >
        <X size={22} strokeWidth={2} />
      </Button>

      <div
        onClick={() => router.push("/search")}
        className="relative flex h-12 mr-1.5 min-w-0 flex-1 cursor-pointer items-center rounded-full bg-muted/50 px-4"
      >
        <div className="min-w-0 flex-1 overflow-hidden text-[16px] text-muted-foreground/60">
          <SearchPlaceholder />
        </div>
      </div>

      {/* Notification bell */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative rounded-full text-muted-foreground"
        onClick={() => router.push("/notifications")}
      >
        <Bell size={20} strokeWidth={1.8} />
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-background">
          3
        </span>
      </Button>

      {/* Profile avatar */}
      <button className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-visible rounded-full transition-opacity hover:opacity-90 active:opacity-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/profile.png" alt="Profile" className="h-full w-full rounded-full object-cover" />
      </button>
    </header>
  );
}
