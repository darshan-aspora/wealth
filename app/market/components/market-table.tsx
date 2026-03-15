"use client";

import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right";
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
                    col.align === "left" ? "text-left" : "text-right"
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
                      col.align === "left" ? "text-left" : "text-right font-mono tabular-nums"
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

// Helper: visual range bar with dot indicator (day range / 1Y range)
export function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const range = high - low;
  const pct = range > 0 ? ((current - low) / range) * 100 : 50;
  const clamped = Math.max(4, Math.min(96, pct));

  return (
    <div className="w-[56px] flex-shrink-0">
      <div className="relative h-[4px] rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-foreground/20"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="relative h-[6px]">
        <div
          className="absolute top-0 w-[6px] h-[6px] rounded-full bg-foreground -translate-x-1/2"
          style={{ left: `${clamped}%` }}
        />
      </div>
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
