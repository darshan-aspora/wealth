"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeatmapStock } from "./types";

interface Props {
  open: boolean;
  stocks: HeatmapStock[];
  onClose: () => void;
  onPick: (symbol: string) => void;
}

export function HeatmapSearchOverlay({ open, stocks, onClose, onPick }: Props) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  const needle = q.trim().toLowerCase();
  const results = !needle
    ? stocks.slice(0, 10)
    : stocks
        .filter(
          (s) =>
            s.symbol.toLowerCase().includes(needle) ||
            s.name.toLowerCase().includes(needle),
        )
        .slice(0, 30);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 top-0 z-[90] mx-auto w-full max-w-[430px] pt-4"
          >
            <div className="mx-5 flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3 py-2 shadow-lg">
              <Search size={16} strokeWidth={2.2} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Jump to a ticker or company"
                className="flex-1 min-w-0 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={onClose}
                aria-label="Close search"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* Results */}
            <div className="mx-5 mt-2 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-lg">
              <div className="max-h-[60vh] overflow-y-auto">
                {results.length === 0 ? (
                  <p className="px-4 py-6 text-center text-[14px] text-muted-foreground">
                    No matches for &ldquo;{q}&rdquo;
                  </p>
                ) : (
                  results.map((r) => {
                    const chgColor = r.chg1d >= 0 ? "text-gain" : "text-loss";
                    return (
                      <button
                        key={r.symbol}
                        onClick={() => {
                          onPick(r.symbol);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between gap-3 border-b border-border/40 px-4 py-2.5 text-left last:border-b-0 active:bg-muted"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold text-foreground">{r.symbol}</p>
                          <p className="text-[12px] text-muted-foreground truncate leading-tight">{r.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[14px] font-semibold tabular-nums text-foreground">
                            {r.price.toFixed(2)}
                          </p>
                          <p className={cn("text-[12px] font-semibold tabular-nums", chgColor)}>
                            {r.chg1d >= 0 ? "+" : ""}{r.chg1d.toFixed(2)}%
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
