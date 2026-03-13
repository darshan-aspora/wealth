"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Bell, EllipsisVertical, LayoutPanelLeft, BarChart3, ArrowUpDown, Pencil, FolderPlus } from "lucide-react";
import { useTickerVisibility } from "@/components/ticker-visibility";
import { motion, AnimatePresence } from "framer-motion";
import { StoryRing, StoriesViewer, TOTAL_STORIES, AsporaLogo } from "@/components/stories-viewer";

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
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { tickerVisible, showTicker } = useTickerVisibility();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
      >
        <EllipsisVertical size={20} strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-12 z-50 min-w-[180px] overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl"
          >
            {onSortClick ? (
              <>
                <button
                  onClick={() => {
                    onSortClick();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-3.5 text-[15px] text-foreground transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <ArrowUpDown size={18} strokeWidth={1.8} className="text-muted-foreground" />
                  Sort
                </button>
                <div className="h-px bg-border/60" />
                <button
                  onClick={() => {
                    onEditClick?.();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-3.5 text-[15px] text-foreground transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <Pencil size={18} strokeWidth={1.8} className="text-muted-foreground" />
                  Edit
                </button>
                <div className="h-px bg-border/60" />
                <button
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 whitespace-nowrap px-4 py-3.5 text-[15px] text-foreground transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <FolderPlus size={18} strokeWidth={1.8} className="shrink-0 text-muted-foreground" />
                  Create section
                </button>
                {!tickerVisible && (
                  <>
                    <div className="my-1 h-px bg-border/40" />
                    <button
                      onClick={() => {
                        showTicker();
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-3.5 text-[15px] text-foreground transition-colors hover:bg-muted/50 active:bg-muted"
                    >
                      <BarChart3 size={18} strokeWidth={1.8} className="text-muted-foreground" />
                      Show Ticker
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 px-4 py-3.5 text-[15px] text-foreground transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <LayoutPanelLeft size={18} strokeWidth={1.8} className="text-muted-foreground" />
                  Customise
                </button>
                {!tickerVisible && (
                  <>
                    <div className="h-px bg-border/60" />
                    <button
                      onClick={() => {
                        showTicker();
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-3.5 text-[15px] text-foreground transition-colors hover:bg-muted/50 active:bg-muted"
                    >
                      <BarChart3 size={18} strokeWidth={1.8} className="text-muted-foreground" />
                      Show Ticker
                    </button>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const router = useRouter();
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);

  const handleStorySeen = useCallback((index: number) => {
    setReadCount((prev) => Math.max(prev, index + 1));
  }, []);

  return (
    <>
      <header className="flex items-center gap-1.5 pl-3 pr-3 py-3">
        {/* Close button (leftmost) */}
        <button
          onClick={() => router.push("/")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
        >
          <X size={22} strokeWidth={2} />
        </button>

        {/* Search bar */}
        <div
          onClick={() => router.push("/search")}
          className="relative flex h-12 mx-1 min-w-0 flex-1 cursor-pointer items-center rounded-full bg-muted/50 px-4"
        >
          <div className="min-w-0 flex-1 overflow-hidden text-[16px] text-muted-foreground/60">
            <SearchPlaceholder />
          </div>
        </div>

        {/* Notification bell */}
        <button
          onClick={() => router.push("/notifications")}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
        >
          <Bell size={20} strokeWidth={1.8} />
          <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-background">
            3
          </span>
        </button>

        {/* Story ring / co-creation (rightmost) */}
        <StoryRing
          totalStories={TOTAL_STORIES}
          readCount={readCount}
          size={42}
          onClick={() => setStoriesOpen(true)}
        >
          <div className="flex h-full w-full items-center justify-center" style={{ background: "linear-gradient(135deg, #7c5af5 0%, #5b3fd4 100%)" }}>
            <AsporaLogo size={22} className="text-white" />
          </div>
        </StoryRing>
      </header>

      {/* Stories overlay */}
      <StoriesViewer
        isOpen={storiesOpen}
        onClose={() => setStoriesOpen(false)}
        onStorySeen={handleStorySeen}
      />
    </>
  );
}
