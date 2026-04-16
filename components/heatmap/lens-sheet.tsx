"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColorAxis, LensDef, SizeAxis } from "./types";
import { DEFAULT_LENS } from "./types";
import { colorAxisLabel, sizeAxisLabel } from "./treemap";

interface Props {
  open: boolean;
  lens: LensDef;
  onChange: (next: LensDef) => void;
  onClose: () => void;
}

type LensTab = "size" | "color";

const SIZE_SECTIONS: { id: SizeAxis }[][] = [
  [{ id: "marketCap" }],
  [{ id: "volume1d" }, { id: "volume1w" }, { id: "volume1m" }],
  [{ id: "turnover1d" }, { id: "turnover1w" }, { id: "turnover1m" }],
];

const COLOR_SECTIONS: { id: ColorAxis }[][] = [
  [{ id: "chg1h" }, { id: "chg4h" }, { id: "chg1d" }],
  [
    { id: "perfW" },
    { id: "perfM" },
    { id: "perf3M" },
    { id: "perf6M" },
    { id: "perfYTD" },
    { id: "perfY" },
  ],
  [{ id: "preMarket" }, { id: "postMarket" }],
  [{ id: "relVolume" }, { id: "volatilityD" }, { id: "gap" }],
];

export function HeatmapLensSheet({ open, lens, onChange, onClose }: Props) {
  const [tab, setTab] = useState<LensTab>("size");

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
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-[430px] rounded-t-3xl border-t border-border/60 bg-background pt-3 pb-8 shadow-xl"
          >
            {/* Header — Close · Lens · Reset */}
            <div className="mt-4 flex items-center justify-between px-5">
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
              <p className="text-[17px] font-bold tracking-tight text-foreground">Lens</p>
              <button
                onClick={() => onChange({ ...DEFAULT_LENS })}
                className="text-[14px] font-semibold text-muted-foreground active:text-foreground transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex gap-0 mx-5 rounded-xl bg-muted/60 p-1">
              {(["size", "color"] as LensTab[]).map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-[14px] font-semibold transition-colors",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground",
                    )}
                  >
                    {t === "size" ? "Size by" : "Color by"}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="mt-4 max-h-[55vh] overflow-y-auto px-5">
              {tab === "size" && (
                <div className="overflow-hidden rounded-xl border border-border/60">
                  {SIZE_SECTIONS.map((section, secIdx) => (
                    <div
                      key={secIdx}
                      className={cn(secIdx > 0 && "border-t border-border/60")}
                    >
                      {section.map((opt) => {
                        const active = lens.size === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => onChange({ ...lens, size: opt.id })}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
                              active ? "bg-foreground/5" : "active:bg-muted",
                            )}
                          >
                            <p className="text-[15px] font-semibold text-foreground">
                              {sizeAxisLabel(opt.id)}
                            </p>
                            {active && (
                              <Check size={18} strokeWidth={2.4} className="text-foreground shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {tab === "color" && (
                <div className="overflow-hidden rounded-xl border border-border/60">
                  {COLOR_SECTIONS.map((section, secIdx) => (
                    <div
                      key={secIdx}
                      className={cn(secIdx > 0 && "border-t border-border/60")}
                    >
                      {section.map((opt) => {
                        const active = lens.color === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => onChange({ ...lens, color: opt.id })}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
                              active ? "bg-foreground/5" : "active:bg-muted",
                            )}
                          >
                            <p className="text-[15px] font-semibold text-foreground">
                              {colorAxisLabel(opt.id)}
                            </p>
                            {active && (
                              <Check size={18} strokeWidth={2.4} className="text-foreground shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
