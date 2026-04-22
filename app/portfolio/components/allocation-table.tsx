"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/*  Shared types                                                       */
/* ------------------------------------------------------------------ */

export interface AllocationRow {
  name: string;
  subtitle?: string;
  color: string;        // Tailwind bg-* class
  invested: number;
  current: number;
  xirr: number;
}

interface AllocationTableProps {
  title: string;
  subtitle: string;
  rows: AllocationRow[];
  /** Label for the sticky first column header (default: "Asset") */
  firstColumnLabel?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 0 });

function computeRows(rows: AllocationRow[]) {
  const totalCurrent = rows.reduce((s, r) => s + r.current, 0);
  return rows.map((r) => {
    const pnl = r.current - r.invested;
    const pnlPct = r.invested > 0 ? (pnl / r.invested) * 100 : 0;
    const allocation = totalCurrent > 0 ? (r.current / totalCurrent) * 100 : 0;
    return { ...r, pnl, pnlPct, allocation };
  });
}

function computeTotal(rows: AllocationRow[]) {
  const totalCurrent = rows.reduce((s, r) => s + r.current, 0);
  const totalInvested = rows.reduce((s, r) => s + r.invested, 0);
  const pnl = totalCurrent - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
  return { current: totalCurrent, invested: totalInvested, pnl, pnlPct };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AllocationTable({
  title,
  subtitle,
  rows: rawRows,
  firstColumnLabel = "Asset",
}: AllocationTableProps) {
  const rows = computeRows(rawRows);
  const total = computeTotal(rawRows);

  return (
    <Card className="border-border/50 shadow-none overflow-hidden">
      <CardContent className="p-5 pb-3">
        <p className="text-[15px] font-semibold text-foreground mb-1">{title}</p>
        {subtitle && <p className="text-[13px] text-muted-foreground mb-4">{subtitle}</p>}

        {/* Stacked allocation bar */}
        <div className="flex h-3 rounded-full overflow-hidden mb-2">
          {rows.map((r) => (
            <div
              key={r.name}
              className={cn("first:rounded-l-full last:rounded-r-full", r.color)}
              style={{ width: `${r.allocation}%` }}
            />
          ))}
        </div>

        {/* Scrollable table */}
        <div className="overflow-x-auto no-scrollbar -mx-5">
          <table className="w-full text-sm border-collapse" style={{ minWidth: 560 }}>
            <colgroup>
              <col style={{ width: 140 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 72 }} />
              <col style={{ width: 90 }} />
            </colgroup>
            <thead>
              <tr className="text-muted-foreground text-[11px] uppercase tracking-wider">
                <th className="text-left py-2.5 pl-5 pr-2 font-medium sticky left-0 bg-card z-10 whitespace-nowrap">{firstColumnLabel}</th>
                <th className="text-right py-2.5 px-2 font-medium whitespace-nowrap">Current</th>
                <th className="text-right py-2.5 px-2 font-medium whitespace-nowrap">Invested</th>
                <th className="text-right py-2.5 px-2 font-medium whitespace-nowrap">P&L</th>
                <th className="text-right py-2.5 px-2 font-medium whitespace-nowrap">Alloc.</th>
                <th className="text-right py-2.5 pr-5 pl-2 font-medium whitespace-nowrap">Est. XIRR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-t border-border/30">
                  <td className="py-3.5 pl-5 pr-2 sticky left-0 bg-card z-10">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-[3px] h-8 rounded-full shrink-0", r.color)} />
                      <div>
                        <p className="text-[13px] font-semibold text-foreground leading-tight whitespace-nowrap">{r.name}</p>
                        {r.subtitle && (
                          <p className="text-[11px] text-muted-foreground leading-tight">{r.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-right text-[13px] tabular-nums text-foreground">
                    {fmt(r.current)}
                  </td>
                  <td className="py-3.5 px-2 text-right text-[13px] tabular-nums text-foreground">
                    {fmt(r.invested)}
                  </td>
                  <td className={cn(
                    "py-3.5 px-2 text-right text-[13px] tabular-nums font-medium whitespace-nowrap",
                    r.pnl >= 0 ? "text-gain" : "text-loss"
                  )}>
                    {r.pnl >= 0 ? "+" : ""}{fmt(r.pnl)} ({r.pnlPct >= 0 ? "+" : ""}{r.pnlPct.toFixed(1)}%)
                  </td>
                  <td className="py-3.5 px-2 text-right text-[13px] tabular-nums text-foreground">
                    {r.allocation.toFixed(1)}%
                  </td>
                  <td className={cn(
                    "py-3.5 pr-5 pl-2 text-right text-[13px] tabular-nums font-medium",
                    r.xirr >= 0 ? "text-gain" : "text-loss"
                  )}>
                    {r.xirr >= 0 ? "+" : ""}{r.xirr}%
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="border-t-2 border-border/60">
                <td className="py-3.5 pl-5 pr-2 sticky left-0 bg-card z-10">
                  <p className="text-[13px] font-bold text-foreground">Total</p>
                </td>
                <td className="py-3.5 px-2 text-right text-[13px] tabular-nums font-semibold text-foreground">{fmt(total.current)}</td>
                <td className="py-3.5 px-2 text-right text-[13px] tabular-nums font-semibold text-foreground">{fmt(total.invested)}</td>
                <td className={cn("py-3.5 px-2 text-right text-[13px] tabular-nums font-bold whitespace-nowrap", total.pnl >= 0 ? "text-gain" : "text-loss")}>
                  {total.pnl >= 0 ? "+" : ""}{fmt(total.pnl)} ({total.pnl >= 0 ? "+" : ""}{total.pnlPct.toFixed(1)}%)
                </td>
                <td className="py-3.5 px-2 text-right text-[13px] tabular-nums text-foreground">100%</td>
                <td className="py-3.5 pr-5 pl-2 text-right text-[13px] tabular-nums text-foreground">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
