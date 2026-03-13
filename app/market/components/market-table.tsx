"use client";

import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  frozen?: boolean;
  minWidth?: number;
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
                    "whitespace-nowrap px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground",
                    col.frozen
                      ? "sticky left-0 z-[2] bg-card shadow-[2px_0_8px_rgba(0,0,0,0.12)]"
                      : "",
                    col.align === "left" ? "text-left" : "text-right"
                  )}
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
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
                  "h-[56px] border-t border-border/30 transition-colors",
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
                    style={col.minWidth ? { minWidth: col.minWidth } : undefined}
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

// Helper: render a range cell
export function RangeCell({ low, high }: { low: number; high: number }) {
  return (
    <span className="text-[12px] text-muted-foreground font-mono tabular-nums">
      {low.toLocaleString()} <span className="text-muted-foreground/40">—</span> {high.toLocaleString()}
    </span>
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
