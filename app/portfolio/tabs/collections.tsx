"use client";

import { FolderOpen, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const collectionsData = [
  { name: "Tech Giants", count: 5, color: "bg-blue-500", current: 18_420.50, pnl: 2_180.30, pnlPct: 13.42, xirr: 26.8 },
  { name: "Dividend Kings", count: 8, color: "bg-emerald-500", current: 12_850.00, pnl: 1_540.20, pnlPct: 13.62, xirr: 18.4 },
  { name: "High Growth", count: 4, color: "bg-violet-500", current: 8_960.40, pnl: -620.80, pnlPct: -6.48, xirr: -8.2 },
  { name: "Value Picks", count: 6, color: "bg-amber-500", current: 6_210.30, pnl: 480.60, pnlPct: 8.39, xirr: 14.1 },
  { name: "ETF Portfolio", count: 3, color: "bg-rose-500", current: 4_580.90, pnl: 310.50, pnlPct: 7.27, xirr: 12.3 },
];

export function CollectionsTab() {
  const totalCurrent = collectionsData.reduce((s, c) => s + c.current, 0);
  const totalPnl = collectionsData.reduce((s, c) => s + c.pnl, 0);
  const totalPnlPct = totalCurrent > 0 ? (totalPnl / (totalCurrent - totalPnl)) * 100 : 0;

  return (
    <div className="px-5 pb-6">
      {/* Summary */}
      <div className="mb-4 rounded-xl border border-border/40 bg-card/60 px-5 py-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[13px] text-muted-foreground">Total Value</p>
            <p className="text-[20px] font-bold tabular-nums text-foreground">
              {totalCurrent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-muted-foreground">{collectionsData.length} Collections · {collectionsData.reduce((s, c) => s + c.count, 0)} Stocks</p>
            <div className={cn("flex items-center justify-end gap-0.5", totalPnl >= 0 ? "text-gain" : "text-loss")}>
              {totalPnl >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              <span className="text-[15px] font-semibold tabular-nums">
                {totalPnl >= 0 ? "+" : ""}{totalPnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[13px] font-medium tabular-nums">
                ({totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Collections list */}
      <div className="space-y-2">
        {collectionsData.map((c) => (
          <button
            key={c.name}
            className="flex w-full items-center gap-3.5 rounded-xl border border-border/40 bg-card/60 px-5 py-3.5 text-left active:scale-[0.98] transition-transform"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.color}/15`}>
              <FolderOpen size={20} className={`${c.color.replace("bg-", "text-")}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground">{c.name}</p>
              <p className="text-[12px] text-muted-foreground/60">
                {c.count} stocks · Est. XIRR <span className={cn(c.xirr >= 0 ? "text-gain/70" : "text-loss/70")}>{c.xirr > 0 ? "+" : ""}{c.xirr}%</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[15px] font-semibold tabular-nums text-foreground">
                {c.current.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <div className={cn("flex items-center justify-end gap-0.5", c.pnl >= 0 ? "text-gain" : "text-loss")}>
                {c.pnl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span className="text-[13px] font-medium tabular-nums">
                  {c.pnl >= 0 ? "+" : ""}{c.pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className={cn("text-[11px] tabular-nums", c.pnlPct >= 0 ? "text-gain/70" : "text-loss/70")}>
                {c.pnlPct >= 0 ? "+" : ""}{c.pnlPct.toFixed(2)}%
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Add new collection */}
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-3.5 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-border">
        <Plus size={16} />
        Create Collection
      </button>
    </div>
  );
}
