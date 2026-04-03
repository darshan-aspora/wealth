"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Scissors } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TAX_LOTS, TAX_SUMMARY, type TaxLot } from "./portfolio-mock-data";

function TaxLotRow({ lot }: { lot: TaxLot }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[14px] font-medium text-foreground">{lot.label}</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {lot.positions} position{lot.positions !== 1 ? "s" : ""} · {lot.holdingPeriod}
        </p>
      </div>
      <p
        className={cn(
          "text-[15px] font-semibold",
          lot.gains >= 0 ? "text-gain" : "text-loss"
        )}
      >
        {lot.gains >= 0 ? "+" : ""}
        {lot.gains.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export function TaxLotAwareness() {
  const [open, setOpen] = useState(false);
  const shortPct = (TAX_LOTS.find((l) => l.type === "short-term")?.gains ?? 0) / TAX_SUMMARY.totalUnrealized * 100;

  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        {/* Accordion header — always visible */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full text-left"
        >
          <div>
            <p className="text-[15px] font-semibold text-foreground">Tax Lot Breakdown</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Unrealized: <span className="text-gain font-medium">+{TAX_SUMMARY.totalUnrealized.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={18} className="text-muted-foreground" />
          </motion.div>
        </button>

        {/* Accordion content */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                {/* Summary row */}
                <div className="flex gap-6 mb-4">
                  <div>
                    <p className="text-[12px] text-muted-foreground">Total Unrealized</p>
                    <p className="text-[16px] font-semibold text-gain">
                      +{TAX_SUMMARY.totalUnrealized.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-muted-foreground">Est. Tax</p>
                    <p className="text-[16px] font-semibold text-foreground">
                      {TAX_SUMMARY.estimatedTax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Stacked bar */}
                <div className="h-2 rounded-full bg-muted/30 overflow-hidden flex mb-1">
                  <div className="h-full bg-foreground/25 rounded-l-full" style={{ width: `${shortPct}%` }} />
                  <div className="h-full bg-foreground/10 rounded-r-full" style={{ width: `${100 - shortPct}%` }} />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-foreground/25" />
                    <span>Short-term</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-foreground/10" />
                    <span>Long-term</span>
                  </div>
                </div>

                {/* Tax lots */}
                {TAX_LOTS.map((lot, i) => (
                  <div key={lot.type}>
                    {i > 0 && <Separator className="bg-border/30" />}
                    <TaxLotRow lot={lot} />
                  </div>
                ))}

                {/* Tax-loss harvesting hint */}
                {TAX_SUMMARY.harvestable > 0 && (
                  <>
                    <Separator className="bg-border/30" />
                    <div className="flex items-start gap-2.5 pt-3">
                      <Scissors size={15} className="text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[13px] font-medium text-foreground">
                          {TAX_SUMMARY.harvestablePositions} positions with harvestable losses
                        </p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          {TAX_SUMMARY.harvestable.toLocaleString("en-US", { minimumFractionDigits: 2 })} available to offset gains
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
