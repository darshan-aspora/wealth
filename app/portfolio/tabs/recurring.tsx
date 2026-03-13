"use client";

import { RefreshCw, XCircle, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const activeData = [
  { symbol: "VOO", name: "Vanguard S&P 500", amount: 500, frequency: "Monthly", nextDate: "Mar 15" },
  { symbol: "QQQ", name: "Invesco QQQ", amount: 300, frequency: "Monthly", nextDate: "Mar 15" },
  { symbol: "VTI", name: "Vanguard Total", amount: 200, frequency: "Bi-weekly", nextDate: "Mar 12" },
  { symbol: "AAPL", name: "Apple Inc.", amount: 250, frequency: "Monthly", nextDate: "Mar 15" },
  { symbol: "Tech Giants", name: "Tech Giants Collection", amount: 400, frequency: "Monthly", nextDate: "Mar 15", isCollection: true },
];

const cancelledData = [
  { symbol: "SCHD", name: "Schwab Dividend", amount: 150, frequency: "Monthly", cancelledOn: "Feb 10" },
  { symbol: "ARKK", name: "ARK Innovation", amount: 100, frequency: "Monthly", cancelledOn: "Jan 22" },
];

export function RecurringTab() {
  const totalMonthly = activeData.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="px-4 pb-6">
      {/* Summary */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-4 py-3">
        <div>
          <p className="text-[13px] text-muted-foreground">Active</p>
          <p className="text-[20px] font-bold tabular-nums text-foreground">{activeData.length}</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] text-muted-foreground">Monthly Total</p>
          <p className="text-[17px] font-semibold tabular-nums text-foreground">
            {totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Active recurring */}
      <p className="mb-2 text-[14px] font-semibold text-foreground">Active</p>
      <div className="space-y-2">
        {activeData.map((r) => (
          <div
            key={r.symbol}
            className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-4 py-3.5"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {r.isCollection && <FolderOpen size={14} className="text-blue-500" />}
                <p className="text-[15px] font-semibold text-foreground">{r.symbol}</p>
                <RefreshCw size={12} className="text-muted-foreground" />
              </div>
              <p className="text-[13px] text-muted-foreground truncate">{r.name}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground/60">
                {r.frequency} · Next: {r.nextDate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-semibold tabular-nums text-foreground">
                {r.amount.toFixed(2)}
              </p>
              <span className="text-[12px] font-medium text-gain">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add new button */}
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-3.5 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-border">
        + Add Recurring Investment
      </button>

      {/* Cancelled recurring */}
      <p className="mb-2 mt-6 text-[14px] font-semibold text-foreground">Cancelled</p>
      <div className="space-y-2">
        {cancelledData.map((r) => (
          <div
            key={r.symbol}
            className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-4 py-3.5 opacity-60"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-foreground">{r.symbol}</p>
                <XCircle size={12} className="text-muted-foreground" />
              </div>
              <p className="text-[13px] text-muted-foreground truncate">{r.name}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground/60">
                Was {r.frequency} · {r.amount.toFixed(2)}/mo
              </p>
            </div>
            <div className="text-right">
              <span className="text-[12px] font-medium text-muted-foreground">Cancelled</span>
              <p className="text-[11px] text-muted-foreground/60">{r.cancelledOn}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
