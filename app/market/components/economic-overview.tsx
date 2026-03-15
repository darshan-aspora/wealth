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
              <th className="sticky left-0 z-[2] bg-card shadow-[2px_0_8px_rgba(0,0,0,0.12)] whitespace-nowrap px-3 text-left text-[11px] font-semibold text-muted-foreground" style={{ minWidth: 150 }}>
                Indicator
              </th>
              <th className="whitespace-nowrap px-3 text-right text-[11px] font-semibold text-muted-foreground" style={{ minWidth: 70 }}>
                Value
              </th>
              <th className="whitespace-nowrap px-3 text-right text-[11px] font-semibold text-muted-foreground" style={{ minWidth: 70 }}>
                Change
              </th>
              <th className="whitespace-nowrap px-3 text-right text-[11px] font-semibold text-muted-foreground" style={{ minWidth: 70 }}>
                Previous
              </th>
              <th className="whitespace-nowrap px-3 text-right text-[11px] font-semibold text-muted-foreground" style={{ minWidth: 80 }}>
                Released
              </th>
              <th className="whitespace-nowrap px-3 text-right text-[11px] font-semibold text-muted-foreground" style={{ minWidth: 80 }}>
                Next
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label} className="h-[56px]">
                <td className="sticky left-0 z-[2] bg-card shadow-[2px_0_8px_rgba(0,0,0,0.12)] whitespace-nowrap px-3 text-[14px] font-semibold text-foreground" style={{ minWidth: 150 }}>
                  {item.label}
                </td>
                <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] font-semibold tabular-nums text-foreground">
                  {item.value}
                </td>
                <td className="whitespace-nowrap px-3 text-right">
                  <span
                    className={cn(
                      "font-mono text-[13px] font-medium tabular-nums",
                      item.badge.direction === "up" && "text-gain",
                      item.badge.direction === "down" && "text-loss",
                      item.badge.direction === "neutral" && "text-muted-foreground"
                    )}
                  >
                    {item.badge.text}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                  {item.previous}
                </td>
                <td className="whitespace-nowrap px-3 text-right text-[13px] text-muted-foreground">
                  {item.releasedDate || "—"}
                </td>
                <td className="whitespace-nowrap px-3 text-right text-[13px] text-muted-foreground">
                  {item.nextDate || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
