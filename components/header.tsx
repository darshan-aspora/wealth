"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Bell, EllipsisVertical, LayoutPanelLeft, BarChart3 } from "lucide-react";
import { useTickerVisibility } from "@/components/ticker-visibility";
import { motion, AnimatePresence } from "framer-motion";

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

function SearchPlaceholder() {
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

function OptionsMenu() {
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
            {!tickerVisible && (
              <>
                <button
                  onClick={() => {
                    showTicker();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-3.5 text-[16px] text-foreground transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <BarChart3 size={18} strokeWidth={1.8} className="text-muted-foreground" />
                  Show Ticker
                </button>
                <div className="h-px bg-border/60" />
              </>
            )}
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-4 py-3.5 text-[16px] text-foreground transition-colors hover:bg-muted/50 active:bg-muted"
            >
              <LayoutPanelLeft size={18} strokeWidth={1.8} className="text-muted-foreground" />
              Customise
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const router = useRouter();

  return (
    <header className="flex items-center gap-2.5 px-4 py-3">
      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        <X size={20} strokeWidth={2} />
      </button>

      <div
        onClick={() => router.push("/search")}
        className="relative flex h-12 min-w-0 flex-1 cursor-pointer items-center rounded-full bg-muted/50 px-4"
      >
        <div className="min-w-0 flex-1 overflow-hidden text-[16px] text-muted-foreground/60">
          <SearchPlaceholder />
        </div>
        <Search size={18} className="ml-2 shrink-0 text-muted-foreground/60" />
      </div>

      <button className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        <Bell size={20} strokeWidth={1.8} />
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-background">
          3
        </span>
      </button>

      <OptionsMenu />
    </header>
  );
}
