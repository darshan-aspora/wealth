"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { generateOptionsChain } from "./mock-data";

const EXPIRY_DATES = ["Mar 14", "Mar 21", "Mar 28", "Apr 4", "Apr 18", "May 16", "Jun 20", "Sep 19"];

interface OptionsChainProps {
  symbol: string;
  currentPrice: number;
}

export function OptionsChain({ symbol, currentPrice }: OptionsChainProps) {
  const [selectedExpiry, setSelectedExpiry] = useState(EXPIRY_DATES[1]); // Mar 21

  const chain = useMemo(
    () => generateOptionsChain(currentPrice, symbol + selectedExpiry),
    [currentPrice, symbol, selectedExpiry],
  );

  return (
    <div className="py-4">
      <div className="px-5">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          Options Chain
        </h2>
      </div>

      {/* Expiry selector */}
      <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto px-5">
        {EXPIRY_DATES.map((date) => {
          const active = date === selectedExpiry;
          return (
            <button
              key={date}
              onClick={() => setSelectedExpiry(date)}
              className={cn(
                "relative shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {active && (
                <motion.div
                  layoutId="expiry-pill"
                  className="absolute inset-0 rounded-lg bg-secondary/60"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {date}
            </button>
          );
        })}
      </div>

      {/* Chain table */}
      <div className="overflow-x-auto">
        {/* Header */}
        <div className="flex items-center border-b border-border/40 px-2 pb-2">
          <div className="flex flex-1 justify-end gap-0">
            <ColHeader label="Last" width="w-[52px]" />
            <ColHeader label="Chg" width="w-[44px]" />
            <ColHeader label="Vol" width="w-[44px]" />
          </div>
          <div className="w-[56px] text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Strike
            </span>
          </div>
          <div className="flex flex-1 gap-0">
            <ColHeader label="Last" width="w-[52px]" />
            <ColHeader label="Chg" width="w-[44px]" />
            <ColHeader label="Vol" width="w-[44px]" />
          </div>
        </div>

        {/* Labels */}
        <div className="flex items-center px-2 py-1.5">
          <div className="flex-1 text-center">
            <span className="text-[12px] font-semibold text-[hsl(var(--gain))]">CALLS</span>
          </div>
          <div className="w-[56px]" />
          <div className="flex-1 text-center">
            <span className="text-[12px] font-semibold text-[hsl(var(--loss))]">PUTS</span>
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-0">
          {chain.map((row) => {
            const isNearPrice = Math.abs(row.strike - currentPrice) / currentPrice < 0.01;
            const callITM = currentPrice > row.strike;
            const putITM = currentPrice < row.strike;

            return (
              <div
                key={row.strike}
                className={cn(
                  "flex items-center px-2 py-2 border-b border-border/20",
                  isNearPrice && "bg-foreground/[0.04]",
                  callITM && !isNearPrice && "bg-[hsl(var(--gain))]/[0.02]",
                  putITM && !isNearPrice && "bg-[hsl(var(--loss))]/[0.02]",
                )}
              >
                {/* Calls side */}
                <div className="flex flex-1 justify-end gap-0">
                  <Cell value={`${row.call.last.toFixed(2)}`} width="w-[52px]" align="right" />
                  <Cell
                    value={`${row.call.change >= 0 ? "+" : ""}${row.call.change.toFixed(2)}`}
                    width="w-[44px]"
                    align="right"
                    color={row.call.change >= 0 ? "gain" : "loss"}
                  />
                  <Cell value={formatVol(row.call.volume)} width="w-[44px]" align="right" muted />
                </div>

                {/* Strike */}
                <div className={cn(
                  "w-[56px] text-center",
                  isNearPrice && "rounded-md bg-foreground/10 py-0.5",
                )}>
                  <span className={cn(
                    "text-[13px] font-semibold tabular-nums",
                    isNearPrice ? "text-foreground" : "text-muted-foreground",
                  )}>
                    {row.strike}
                  </span>
                </div>

                {/* Puts side */}
                <div className="flex flex-1 gap-0">
                  <Cell value={`${row.put.last.toFixed(2)}`} width="w-[52px]" align="left" />
                  <Cell
                    value={`${row.put.change >= 0 ? "+" : ""}${row.put.change.toFixed(2)}`}
                    width="w-[44px]"
                    align="left"
                    color={row.put.change >= 0 ? "gain" : "loss"}
                  />
                  <Cell value={formatVol(row.put.volume)} width="w-[44px]" align="left" muted />
                </div>
              </div>
            );
          })}
        </div>

        {/* Current price indicator */}
        <div className="px-5 py-2 text-center">
          <span className="rounded-full bg-foreground/10 px-3 py-1 text-[13px] font-medium tabular-nums text-foreground">
            Current: ${currentPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ColHeader({ label, width }: { label: string; width: string }) {
  return (
    <div className={cn(width, "text-right")}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </span>
    </div>
  );
}

function Cell({
  value,
  width,
  align,
  color,
  muted,
}: {
  value: string;
  width: string;
  align: "left" | "right";
  color?: "gain" | "loss";
  muted?: boolean;
}) {
  return (
    <div className={cn(width, align === "right" ? "text-right" : "text-left")}>
      <span
        className={cn(
          "text-[12px] tabular-nums",
          color === "gain" && "text-[hsl(var(--gain))]",
          color === "loss" && "text-[hsl(var(--loss))]",
          muted && "text-muted-foreground/60",
          !color && !muted && "text-foreground/80",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function formatVol(vol: number): string {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
  return vol.toString();
}
