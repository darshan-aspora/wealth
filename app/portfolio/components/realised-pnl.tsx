"use client";

import { PORTFOLIO_SUMMARY } from "./portfolio-mock-data";

const f = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2 });

export function RealisedPnl() {
  const { realizedPnl, realizedPnlPct } = PORTFOLIO_SUMMARY;

  return (
    <div className="flex items-center justify-between px-1 py-1">
      <span className="text-[14px] text-muted-foreground">Realised P&L</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[16px] font-semibold text-gain">+{f(realizedPnl)}</span>
        <span className="text-[13px] text-gain/70">+{realizedPnlPct}%</span>
      </div>
    </div>
  );
}
