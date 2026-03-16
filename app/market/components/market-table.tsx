"use client";

import { AlarmClock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  frozen?: boolean;
  minWidth?: number;
  width?: number;
  render: (row: T, index: number) => React.ReactNode;
}

interface MarketTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export function MarketTable<T>({ columns, data, onRowClick }: MarketTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-max min-w-full border-collapse">
          <thead>
            <tr className="h-[40px]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-3 text-[11px] font-semibold text-muted-foreground",
                    col.frozen
                      ? "sticky left-0 z-[2] bg-card shadow-[2px_0_8px_rgba(0,0,0,0.12)]"
                      : "",
                    col.align === "left" ? "text-left" : col.align === "center" ? "text-center" : "text-right"
                  )}
                  style={{
                    ...(col.minWidth ? { minWidth: col.minWidth } : {}),
                    ...(col.width ? { width: col.width, maxWidth: col.width } : {}),
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "h-[56px] transition-colors",
                  onRowClick && "cursor-pointer active:bg-muted/30"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "whitespace-nowrap px-3 text-[13px] font-medium",
                      col.frozen
                        ? "sticky left-0 z-[2] bg-card shadow-[2px_0_8px_rgba(0,0,0,0.12)]"
                        : "",
                      col.align === "left" ? "text-left" : col.align === "center" ? "text-center" : "text-right font-mono tabular-nums"
                    )}
                    style={{
                      ...(col.minWidth ? { minWidth: col.minWidth } : {}),
                      ...(col.width ? { width: col.width, maxWidth: col.width } : {}),
                    }}
                  >
                    {col.render(row, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper: render a percentage cell with gain/loss color
export function PctCell({ value }: { value: number }) {
  return (
    <span className={cn("font-mono tabular-nums", value >= 0 ? "text-gain" : "text-loss")}>
      {value >= 0 ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

// Helper: render a range cell (text fallback)
export function RangeCell({ low, high }: { low: number; high: number }) {
  return (
    <span className="text-[12px] text-muted-foreground font-mono tabular-nums">
      {low.toLocaleString()} <span className="text-muted-foreground/40">—</span> {high.toLocaleString()}
    </span>
  );
}

// Helper: visual range bar with low/high labels and tick indicator
export function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const range = high - low || 1;
  const pct = Math.max(0, Math.min(100, ((current - low) / range) * 100));

  return (
    <div className="flex items-baseline gap-1.5 w-full min-w-[140px]">
      <span className="text-[11px] tabular-nums text-muted-foreground whitespace-nowrap leading-none font-mono">
        {low.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </span>
      <div className="relative flex-1 h-[3px] rounded-full bg-muted" style={{ marginBottom: 3 }}>
        <div
          className="absolute h-[10px] bg-foreground rounded-sm"
          style={{ left: `${pct}%`, width: 2, bottom: 0 }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground whitespace-nowrap leading-none font-mono">
        {high.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </span>
    </div>
  );
}

// Helper: render a change cell with color
export function ChangeCell({ value, isUp }: { value: string; isUp: boolean }) {
  return (
    <span className={cn("font-mono tabular-nums", isUp ? "text-gain" : "text-loss")}>
      {value}
    </span>
  );
}

// Helper: alert bell button for index rows
export function AlertButton() {
  return (
    <button
      className="text-muted-foreground/50 transition-colors hover:text-foreground active:text-foreground"
      onClick={(e) => { e.stopPropagation(); }}
    >
      <AlarmClock size={18} />
    </button>
  );
}
