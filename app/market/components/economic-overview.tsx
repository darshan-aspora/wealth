"use client";

import { cn } from "@/lib/utils";
import type { EconomicIndicator } from "../data";

interface EconomicOverviewProps {
  data: EconomicIndicator[];
}

export function EconomicOverview({ data }: EconomicOverviewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-max min-w-full border-collapse">
          <thead>
            <tr className="h-[40px]">
              <th className="sticky left-0 z-[2] bg-card shadow-[2px_0_8px_rgba(0,0,0,0.12)] whitespace-nowrap px-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ minWidth: 150 }}>
                Indicator
              </th>
              <th className="whitespace-nowrap px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ minWidth: 80 }}>
                Value
              </th>
              <th className="whitespace-nowrap px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ minWidth: 80 }}>
                Change
              </th>
              <th className="whitespace-nowrap px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ minWidth: 70 }}>
                Previous
              </th>
              <th className="whitespace-nowrap px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ minWidth: 80 }}>
                Released
              </th>
              <th className="whitespace-nowrap px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ minWidth: 80 }}>
                Next
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label} className="h-[44px] border-t border-border/30">
                <td className="sticky left-0 z-[2] bg-card shadow-[2px_0_8px_rgba(0,0,0,0.12)] whitespace-nowrap px-3 text-[13px] font-semibold text-foreground" style={{ minWidth: 150 }}>
                  <div className="flex items-center gap-2">
                    {item.isLive && (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-gain" />
                      </span>
                    )}
                    {item.label}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] font-bold tabular-nums text-foreground">
                  {item.value}
                </td>
                <td className="whitespace-nowrap px-3 text-right">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums",
                      item.badge.direction === "up" && "bg-gain/15 text-gain",
                      item.badge.direction === "down" && "bg-loss/15 text-loss",
                      item.badge.direction === "neutral" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.badge.text}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                  {item.previous}
                </td>
                <td className="whitespace-nowrap px-3 text-right text-[12px] text-muted-foreground">
                  {item.isLive ? "Live" : item.releasedDate || "—"}
                </td>
                <td className="whitespace-nowrap px-3 text-right text-[12px] text-muted-foreground">
                  {item.isLive ? "—" : item.nextDate || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
