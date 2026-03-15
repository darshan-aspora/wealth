"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const openPositions = [
  { symbol: "SPY", name: "SPDR S&P 500", qty: 20, entry: 502.30, current: 508.75, pnl: 129.00 },
  { symbol: "QQQ", name: "Invesco QQQ", qty: 15, entry: 438.20, current: 445.60, pnl: 111.00 },
  { symbol: "AAPL", name: "Apple Inc.", qty: 10, entry: 195.00, current: 192.40, pnl: -26.00 },
  { symbol: "IWM", name: "iShares Russell", qty: 30, entry: 198.50, current: 195.10, pnl: -102.00 },
];

const closedPositions = [
  { symbol: "MSFT", name: "Microsoft Corp.", qty: 12, entry: 380.40, exit: 412.85, pnl: 389.40, date: "Feb 28" },
  { symbol: "NVDA", name: "NVIDIA Corp.", qty: 4, entry: 790.00, exit: 878.30, pnl: 353.20, date: "Feb 20" },
  { symbol: "AMZN", name: "Amazon.com Inc.", qty: 8, entry: 186.20, exit: 178.50, pnl: -61.60, date: "Feb 14" },
];

export function PositionsTab() {
  const unrealisedPnl = openPositions.reduce((s, p) => s + p.pnl, 0);
  const realisedPnl = closedPositions.reduce((s, p) => s + p.pnl, 0);

  return (
    <div className="px-5 pb-6">
      {/* Summary */}
      <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl border border-border/40 bg-card/60 px-5 py-3">
        <div>
          <p className="text-[12px] text-muted-foreground">Open</p>
          <p className="text-[18px] font-bold tabular-nums text-foreground">{openPositions.length}</p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Unrealised</p>
          <p className={cn("text-[16px] font-semibold tabular-nums", unrealisedPnl >= 0 ? "text-gain" : "text-loss")}>
            {unrealisedPnl >= 0 ? "+" : ""}{unrealisedPnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Realised</p>
          <p className={cn("text-[16px] font-semibold tabular-nums", realisedPnl >= 0 ? "text-gain" : "text-loss")}>
            {realisedPnl >= 0 ? "+" : ""}{realisedPnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Open positions */}
      <p className="mb-2 text-[14px] font-semibold text-foreground">Open</p>
      <div className="space-y-2">
        {openPositions.map((p) => (
          <div
            key={p.symbol}
            className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-5 py-3.5"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground">{p.symbol}</p>
              <p className="text-[13px] text-muted-foreground truncate">{p.name}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground/60">
                {p.qty} @ {p.entry.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-semibold tabular-nums text-foreground">
                {p.current.toFixed(2)}
              </p>
              <div className={cn("flex items-center justify-end gap-0.5", p.pnl >= 0 ? "text-gain" : "text-loss")}>
                {p.pnl >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                <span className="text-[13px] font-medium tabular-nums">
                  {p.pnl >= 0 ? "+" : ""}{p.pnl.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Closed positions */}
      <p className="mb-2 mt-5 text-[14px] font-semibold text-foreground">Closed</p>
      <div className="space-y-2">
        {closedPositions.map((p) => (
          <div
            key={p.symbol}
            className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-5 py-3.5 opacity-75"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground">{p.symbol}</p>
              <p className="text-[13px] text-muted-foreground truncate">{p.name}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground/60">
                {p.qty} @ {p.entry.toFixed(2)} → {p.exit.toFixed(2)} · {p.date}
              </p>
            </div>
            <div className="text-right">
              <div className={cn("flex items-center justify-end gap-0.5", p.pnl >= 0 ? "text-gain" : "text-loss")}>
                {p.pnl >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                <span className="text-[15px] font-semibold tabular-nums">
                  {p.pnl >= 0 ? "+" : ""}{p.pnl.toFixed(2)}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground">Closed</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
