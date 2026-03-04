"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Bell, EllipsisVertical, LayoutPanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Rotating search placeholder ─────────────────────────────────────
const searchSuffixes = [
  "ETF",
  "Stocks",
  "Options",
  "News",
  "Advisory",
  "Advisory Baskets",
  "1-Click Algo Strategies",
];

function useRotatingSuffix(interval = 2200) {
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
  return (
    <span className="flex items-center">
      <span>Search</span>
      <span className="relative ml-[5px] inline-flex h-5 w-[160px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={suffix}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="absolute left-0 top-0"
          >
            {suffix}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

function OptionsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
      >
        <EllipsisVertical size={18} strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-11 z-50 min-w-[160px] overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl"
          >
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-[14px] text-foreground transition-colors hover:bg-muted/50 active:bg-muted"
            >
              <LayoutPanelLeft size={16} strokeWidth={1.8} className="text-muted-foreground" />
              Customise
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  return (
    <header className="flex items-center gap-2.5 px-4 py-3">
      <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        <X size={18} strokeWidth={2} />
      </button>

      <div className="relative flex h-10 flex-1 items-center rounded-full bg-muted/50 px-3.5">
        <Search size={16} className="shrink-0 text-muted-foreground/60" />
        <div className="ml-2 text-[14px] text-muted-foreground/60">
          <SearchPlaceholder />
        </div>
      </div>

      <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        <Bell size={18} strokeWidth={1.8} />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-[3px] text-[9px] font-bold leading-none text-white ring-2 ring-background">
          3
        </span>
      </button>

      <OptionsMenu />
    </header>
  );
}
