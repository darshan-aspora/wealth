"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { generateOptionsChain } from "./mock-data";

const EXPIRY_DATES = ["Mar 14", "Mar 21", "Mar 28", "Apr 4", "Apr 18", "May 16", "Jun 20", "Sep 19"];

// Column widths
const W_LTP = "w-[44px]";
const W_GREEK = "w-[38px]";
const W_IV = "w-[36px]";
const W_STRIKE = "w-[54px]";

interface OptionsChainProps {
  symbol: string;
  currentPrice: number;
}

export function OptionsChain({ symbol, currentPrice }: OptionsChainProps) {
  const [selectedExpiry, setSelectedExpiry] = useState(EXPIRY_DATES[1]);

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
        <div className="min-w-[530px]">

          {/* CALLS / PUTS labels */}
          <div className="flex items-center px-2 pb-1">
            <div className="flex-1 pl-1">
              <span className="text-[12px] font-bold tracking-widest text-[hsl(var(--gain))]">Calls</span>
            </div>
            <div className={W_STRIKE} />
            <div className="flex-1 pr-1 text-right">
              <span className="text-[12px] font-bold tracking-widest text-[hsl(var(--loss))]">Puts</span>
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center border-b border-border/40 px-2 pb-2">
            {/* Calls headers */}
            <div className="flex flex-1 items-center">
              <GH label="LTP" w={W_LTP} align="left" />
              <GH label="Γ" w={W_GREEK} align="center" />
              <GH label="V" w={W_GREEK} align="center" />
              <GH label="Θ" w={W_GREEK} align="center" />
              <GH label="Δ" w={W_GREEK} align="center" />
              <GH label="IV" w={W_IV} align="right" />
            </div>
            {/* Strike */}
            <div className={cn(W_STRIKE, "text-center")}>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Strike
              </span>
            </div>
            {/* Puts headers (mirrored) */}
            <div className="flex flex-1 items-center justify-end">
              <GH label="IV" w={W_IV} align="left" />
              <GH label="Δ" w={W_GREEK} align="center" />
              <GH label="Θ" w={W_GREEK} align="center" />
              <GH label="V" w={W_GREEK} align="center" />
              <GH label="Γ" w={W_GREEK} align="center" />
              <GH label="LTP" w={W_LTP} align="right" />
            </div>
          </div>

          {/* Rows */}
          {chain.map((row) => {
            const isATM = Math.abs(row.strike - currentPrice) / currentPrice < 0.008;
            const callITM = currentPrice > row.strike && !isATM;
            const putITM = currentPrice < row.strike && !isATM;

            return (
              <div
                key={row.strike}
                className={cn(
                  "relative flex items-center border-b border-border/20",
                  isATM && "bg-foreground/[0.04]",
                )}
              >
                {/* ITM zone backgrounds */}
                {callITM && (
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 top-0"
                    style={{ width: "calc(50% - 27px)", background: "hsl(var(--gain) / 0.06)" }}
                  />
                )}
                {putITM && (
                  <div
                    className="pointer-events-none absolute bottom-0 right-0 top-0"
                    style={{ width: "calc(50% - 27px)", background: "hsl(var(--loss) / 0.06)" }}
                  />
                )}

                <div className="relative flex w-full items-center px-2 py-[6px]">
                  {/* Calls side */}
                  <div className="flex flex-1 items-center">
                    <GV value={row.call.last.toFixed(2)} w={W_LTP} align="left" bold />
                    <GV value={row.call.gamma.toFixed(3)} w={W_GREEK} align="center" dim />
                    <GV value={row.call.vega.toFixed(2)} w={W_GREEK} align="center" dim />
                    <GV value={row.call.theta.toFixed(2)} w={W_GREEK} align="center" loss />
                    <GV value={row.call.delta.toFixed(2)} w={W_GREEK} align="center" gain />
                    <GV value={`${row.call.iv.toFixed(1)}%`} w={W_IV} align="right" dim />
                  </div>

                  {/* Strike */}
                  <div className={cn(W_STRIKE, "flex items-center justify-center")}>
                    <span
                      className={cn(
                        "text-[12px] font-semibold tabular-nums",
                        isATM
                          ? "rounded-md bg-foreground/15 px-1.5 py-0.5 text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {row.strike}
                    </span>
                  </div>

                  {/* Puts side */}
                  <div className="flex flex-1 items-center justify-end">
                    <GV value={`${row.put.iv.toFixed(1)}%`} w={W_IV} align="left" dim />
                    <GV value={row.put.delta.toFixed(2)} w={W_GREEK} align="center" loss />
                    <GV value={row.put.theta.toFixed(2)} w={W_GREEK} align="center" loss />
                    <GV value={row.put.vega.toFixed(2)} w={W_GREEK} align="center" dim />
                    <GV value={row.put.gamma.toFixed(3)} w={W_GREEK} align="center" dim />
                    <GV value={row.put.last.toFixed(2)} w={W_LTP} align="right" bold />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Current price pill */}
          <div className="px-5 py-3 text-center">
            <span className="rounded-full bg-foreground/10 px-3 py-1 text-[13px] font-medium tabular-nums text-foreground">
              Current: {currentPrice.toFixed(2)}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

function GH({
  label,
  w,
  align,
}: {
  label: string;
  w: string;
  align: "left" | "center" | "right";
}) {
  return (
    <div className={cn(w, align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right")}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
        {label}
      </span>
    </div>
  );
}

function GV({
  value,
  w,
  align,
  bold,
  dim,
  gain,
  loss,
}: {
  value: string;
  w: string;
  align: "left" | "center" | "right";
  bold?: boolean;
  dim?: boolean;
  gain?: boolean;
  loss?: boolean;
}) {
  return (
    <div className={cn(w, align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right")}>
      <span
        className={cn(
          "text-[11px] tabular-nums",
          bold && "font-semibold text-foreground/90",
          dim && "text-muted-foreground/55",
          gain && "text-[hsl(var(--gain))]",
          loss && "text-[hsl(var(--loss))]",
          !bold && !dim && !gain && !loss && "text-foreground/70",
        )}
      >
        {value}
      </span>
    </div>
  );
}
