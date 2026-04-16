"use client";

import { type ReactNode, useRef, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { WidgetHeader, type WHTab, type WHFlipper } from "@/components/widget-header";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface STWColumn {
  header: ReactNode;
  minWidth?: number;
  align?: "left" | "center" | "right";
  className?: string;
}

export interface STWFooter {
  label: string;
  onPress?: () => void;
  href?: string;
}

export interface ScrollableTableWidgetProps {
  title: string;
  description?: string;
  flipper?: WHFlipper;
  tabs?: WHTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  tabDescription?: { title: string; body: ReactNode };
  pillLayoutId?: string;
  columns: STWColumn[];
  rows: ReactNode[][];
  visibleDataCols?: number;
  minFrozenWidth?: number;
  scrollableMinWidth?: number;
  rowHeight?: string;
  headerHeight?: string;
  animationKey?: string;
  footer?: STWFooter;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ScrollableTableWidget({
  title,
  description,
  flipper,
  tabs,
  activeTab,
  onTabChange,
  tabDescription,
  pillLayoutId = "stw-pill",
  columns,
  rows,
  visibleDataCols = 2,
  minFrozenWidth = 120,
  scrollableMinWidth = 780,
  rowHeight = "h-[64px]",
  headerHeight = "h-[40px]",
  animationKey,
  footer,
  className,
}: ScrollableTableWidgetProps) {
  const alignCls = (align?: "left" | "center" | "right") =>
    align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right";

  /* ── Measure data column widths → derive frozen width ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [frozenW, setFrozenW] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrolled(el.scrollLeft > 0);
  }, []);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const table = tableRef.current;
    if (!container || !table) return;

    const ths = table.querySelectorAll("thead th");
    if (ths.length < visibleDataCols) return;

    let visibleSum = 0;
    for (let i = 0; i < visibleDataCols; i++) {
      visibleSum += ths[i].getBoundingClientRect().width;
    }

    const containerW = container.getBoundingClientRect().width;
    setFrozenW(Math.max(minFrozenWidth, containerW - visibleSum));
  }, [visibleDataCols, minFrozenWidth]);

  useEffect(() => { measure(); }, [measure, rows, animationKey]);
  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  const frozenCol = columns[0];
  const scrollCols = columns.slice(1);

  return (
    <WidgetHeader
      title={title}
      description={description}
      flipper={flipper}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabDescription={tabDescription}
      pillLayoutId={pillLayoutId}
      className={className}
    >
      {/* ── Table: frozen column + scrollable area ── */}
      <div ref={containerRef} className="-mx-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={animationKey ?? "default"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            {/* Frozen first column */}
            <div
              className={cn("shrink-0 border-r transition-colors duration-200", isScrolled ? "border-border/40" : "border-transparent")}
              style={{ width: frozenW ?? minFrozenWidth }}
            >
              <div className={cn(headerHeight, "flex items-center pl-5 pr-3 text-[14px] font-medium text-muted-foreground", alignCls(frozenCol?.align))}>
                {frozenCol?.header}
              </div>
              {rows.map((row, i) => (
                <div key={i} className={cn(rowHeight, "flex items-center pl-5 pr-3")}>
                  {row[0]}
                </div>
              ))}
            </div>

            {/* Scrollable columns */}
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-x-auto no-scrollbar min-w-0">
              <table ref={tableRef} style={{ minWidth: scrollableMinWidth }}>
                <thead>
                  <tr className={headerHeight}>
                    {scrollCols.map((col, i) => (
                      <th
                        key={i}
                        className={cn(
                          "text-[14px] font-medium text-muted-foreground whitespace-nowrap px-3",
                          alignCls(col.align),
                          col.className
                        )}
                        style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowHeight}>
                      {row.slice(1).map((cell, colIdx) => (
                        <td
                          key={colIdx}
                          className={cn(
                            "px-3 whitespace-nowrap",
                            alignCls(scrollCols[colIdx]?.align),
                            scrollCols[colIdx]?.className
                          )}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Footer CTA ── */}
      {footer && (
        footer.href ? (
          <Link
            href={footer.href}
            className="mt-3 flex w-full items-center justify-center gap-1 py-3 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {footer.label}
            <ChevronRight size={16} />
          </Link>
        ) : (
          <button
            onClick={footer.onPress}
            className="mt-3 flex w-full items-center justify-center gap-1 py-3 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {footer.label}
            <ChevronRight size={16} />
          </button>
        )
      )}
    </WidgetHeader>
  );
}
