"use client";

import { type ReactNode, useRef, useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Info } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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

export interface STWTab {
  id: string;
  label: string;
}

export interface STWFlipper {
  label: string;
  icon: ReactNode;
  onFlip: () => void;
}

export interface STWFooter {
  label: string;
  onPress?: () => void;
}

export interface ScrollableTableWidgetProps {
  title: string;
  description?: string;
  flipper?: STWFlipper;
  tabs?: STWTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  tabDescription?: { title: string; body: ReactNode };
  pillLayoutId?: string;
  columns: STWColumn[];
  rows: ReactNode[][];
  /** Number of visible data columns (default 2). Frozen col = viewport − sum of these. */
  visibleDataCols?: number;
  /** Minimum frozen column width in px (default 120) */
  minFrozenWidth?: number;
  /** Min-width for the full scrollable table in px (default 780) */
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

  /* ── Tab scroll-to-center ── */
  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollTabToCenter = useCallback((el: HTMLButtonElement) => {
    requestAnimationFrame(() => {
      const container = tabsRef.current;
      if (!container) return;
      const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
    });
  }, []);

  /* ── Measure data column widths → derive frozen width ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [frozenW, setFrozenW] = useState<number | null>(null);

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

  useEffect(() => {
    measure();
  }, [measure, rows, animationKey]);

  // Re-measure on resize
  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showTabDesc, setShowTabDesc] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrolled(el.scrollLeft > 0);
  }, []);

  const frozenCol = columns[0];
  const scrollCols = columns.slice(1);

  return (
    <div className={className}>
      {/* ── Title row ── */}
      <div className={cn("flex items-center justify-between", description ? "mb-1" : "mb-3.5")}>
        <h2 className="text-[18px] font-bold tracking-tight">{title}</h2>
        {flipper && (
          <button
            onClick={flipper.onFlip}
            className="flex items-center gap-1.5 overflow-hidden rounded-full bg-muted pl-5 pr-3.5 py-2 text-[14px] font-semibold text-foreground transition-all"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={flipper.label}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {flipper.label}
              </motion.span>
            </AnimatePresence>
            {flipper.icon}
          </button>
        )}
      </div>

      {description && (
        <p className="mb-3.5 text-[13px] text-muted-foreground leading-snug">{description}</p>
      )}

      {/* ── Tab pills ── */}
      {tabs && tabs.length > 0 && (
        <div ref={tabsRef} className="-mx-5 mb-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 px-5 py-0.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    if (isActive && tabDescription) {
                      setShowTabDesc((v) => !v);
                    } else {
                      setShowTabDesc(false);
                      onTabChange?.(tab.id);
                      scrollTabToCenter(e.currentTarget);
                    }
                  }}
                  className={cn(
                    "relative flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[14px] font-semibold transition-colors duration-200",
                    isActive ? "text-background" : "text-muted-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId={pillLayoutId}
                      className="absolute inset-0 rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    {tab.label}
                    {isActive && tabDescription && (
                      <Info size={14} strokeWidth={2} className="text-background" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
            {/* Frozen first column — never scrolls */}
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

            {/* Scrollable columns — auto-sized to content */}
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-x-auto no-scrollbar min-w-0">
              <table ref={tableRef} style={{ minWidth: scrollableMinWidth }}>
                <thead>
                  <tr className={headerHeight}>
                    {scrollCols.map((col, i) => (
                      <th
                        key={i}
                        className={cn(
                          "text-[14px] font-medium text-muted-foreground whitespace-nowrap px-4",
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
                            "px-4 whitespace-nowrap",
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
        <button
          onClick={footer.onPress}
          className="mt-3 flex w-full items-center justify-center gap-1 py-3 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          {footer.label}
          <ChevronRight size={16} />
        </button>
      )}

      {/* ── Info Sheet ── */}
      <Sheet open={showTabDesc} onOpenChange={setShowTabDesc}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-10 max-h-[85dvh] overflow-y-auto" hideClose>
          <div className="pt-2">
            <div className="flex flex-col items-center mb-5">
              <div className="h-[100px] w-[100px] rounded-2xl bg-muted mb-4" />
              <h3 className="text-[20px] font-bold text-foreground text-center">
                {tabDescription?.title}
              </h3>
            </div>
            <div className="mb-6">
              {tabDescription?.body}
            </div>
            <button
              onClick={() => setShowTabDesc(false)}
              className="w-full rounded-full bg-foreground py-3.5 text-[15px] font-semibold text-background active:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
