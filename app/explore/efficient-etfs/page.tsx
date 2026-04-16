"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowDown, Bookmark } from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ETF {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  aum: string;
  expenseRatio: number;
  trackingError: number;
  return1y: number;
  return3y: number;
  return5y: number;
  high52w: number;
  low52w: number;
}

/* ------------------------------------------------------------------ */
/*  Mock data — Ultra Low Cost (expense ratios 0.02%–0.08%)            */
/* ------------------------------------------------------------------ */

const ultraLowCostETFs: ETF[] = [
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", price: 476.32, changePercent: 1.24, aum: "412.8B", expenseRatio: 0.03, trackingError: 0.02, return1y: 28.6, return3y: 10.8, return5y: 12.4, high52w: 498.00, low52w: 382.10 },
  { symbol: "VTI", name: "Vanguard Total Stock Market", price: 252.80, changePercent: 1.08, aum: "375.2B", expenseRatio: 0.03, trackingError: 0.02, return1y: 27.4, return3y: 9.6, return5y: 11.8, high52w: 266.00, low52w: 202.50 },
  { symbol: "IVV", name: "iShares Core S&P 500", price: 478.90, changePercent: 1.22, aum: "398.5B", expenseRatio: 0.03, trackingError: 0.01, return1y: 28.5, return3y: 10.7, return5y: 12.3, high52w: 500.20, low52w: 384.40 },
  { symbol: "SCHX", name: "Schwab US Large-Cap", price: 58.92, changePercent: 1.18, aum: "38.7B", expenseRatio: 0.03, trackingError: 0.02, return1y: 28.2, return3y: 10.4, return5y: 12.0, high52w: 62.10, low52w: 47.30 },
  { symbol: "BND", name: "Vanguard Total Bond Market", price: 72.18, changePercent: 0.14, aum: "102.4B", expenseRatio: 0.03, trackingError: 0.02, return1y: 4.8, return3y: 1.2, return5y: 1.6, high52w: 74.50, low52w: 68.20 },
  { symbol: "SCHB", name: "Schwab US Broad Market", price: 57.14, changePercent: 1.05, aum: "27.6B", expenseRatio: 0.03, trackingError: 0.03, return1y: 27.1, return3y: 9.8, return5y: 11.4, high52w: 60.20, low52w: 45.80 },
  { symbol: "VUG", name: "Vanguard Growth ETF", price: 342.56, changePercent: 1.42, aum: "124.0B", expenseRatio: 0.04, trackingError: 0.03, return1y: 34.2, return3y: 12.8, return5y: 16.4, high52w: 360.00, low52w: 268.40 },
  { symbol: "VTV", name: "Vanguard Value ETF", price: 162.40, changePercent: 0.68, aum: "118.0B", expenseRatio: 0.04, trackingError: 0.02, return1y: 18.6, return3y: 8.4, return5y: 9.2, high52w: 170.80, low52w: 134.60 },
  { symbol: "ITOT", name: "iShares Core S&P Total US", price: 109.56, changePercent: 1.06, aum: "52.3B", expenseRatio: 0.03, trackingError: 0.02, return1y: 27.3, return3y: 9.5, return5y: 11.6, high52w: 115.20, low52w: 87.80 },
  { symbol: "SPTM", name: "SPDR Portfolio S&P 1500", price: 61.28, changePercent: 0.98, aum: "8.2B", expenseRatio: 0.03, trackingError: 0.03, return1y: 26.8, return3y: 9.2, return5y: 11.0, high52w: 64.50, low52w: 49.10 },
  { symbol: "VIG", name: "Vanguard Dividend Appreciation", price: 178.60, changePercent: 0.62, aum: "78.4B", expenseRatio: 0.06, trackingError: 0.03, return1y: 18.7, return3y: 9.4, return5y: 10.8, high52w: 186.40, low52w: 148.20 },
  { symbol: "SCHD", name: "Schwab US Dividend Equity", price: 77.28, changePercent: 0.44, aum: "52.8B", expenseRatio: 0.06, trackingError: 0.03, return1y: 12.4, return3y: 8.8, return5y: 10.2, high52w: 82.60, low52w: 65.40 },
  { symbol: "VNQ", name: "Vanguard Real Estate ETF", price: 86.14, changePercent: -0.38, aum: "34.2B", expenseRatio: 0.07, trackingError: 0.04, return1y: 8.2, return3y: 4.6, return5y: 5.8, high52w: 92.80, low52w: 72.60 },
  { symbol: "VXUS", name: "Vanguard Total International", price: 58.42, changePercent: 0.52, aum: "65.0B", expenseRatio: 0.07, trackingError: 0.04, return1y: 14.6, return3y: 6.2, return5y: 7.4, high52w: 62.40, low52w: 48.80 },
  { symbol: "VEA", name: "Vanguard FTSE Developed Mkts", price: 49.72, changePercent: 0.38, aum: "109.3B", expenseRatio: 0.05, trackingError: 0.04, return1y: 14.2, return3y: 6.4, return5y: 7.2, high52w: 53.10, low52w: 41.20 },
];

/* ------------------------------------------------------------------ */
/*  Mock data — Low Tracking Error (tracking error 0.01%–0.04%)        */
/* ------------------------------------------------------------------ */

const lowTrackingErrorETFs: ETF[] = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", price: 475.68, changePercent: 1.21, aum: "502.3B", expenseRatio: 0.09, trackingError: 0.01, return1y: 28.4, return3y: 10.6, return5y: 12.2, high52w: 497.80, low52w: 381.20 },
  { symbol: "GLD", name: "SPDR Gold Shares", price: 218.40, changePercent: 0.86, aum: "62.0B", expenseRatio: 0.40, trackingError: 0.01, return1y: 22.8, return3y: 8.2, return5y: 9.6, high52w: 228.60, low52w: 172.40 },
  { symbol: "AGG", name: "iShares Core US Aggregate Bond", price: 98.76, changePercent: 0.12, aum: "98.0B", expenseRatio: 0.03, trackingError: 0.01, return1y: 5.2, return3y: 1.4, return5y: 1.8, high52w: 101.40, low52w: 93.20 },
  { symbol: "USMV", name: "iShares MSCI USA Min Vol", price: 82.34, changePercent: 0.46, aum: "28.0B", expenseRatio: 0.15, trackingError: 0.01, return1y: 16.4, return3y: 7.8, return5y: 9.0, high52w: 86.80, low52w: 68.40 },
  { symbol: "VIG", name: "Vanguard Dividend Appreciation", price: 178.60, changePercent: 0.62, aum: "78.4B", expenseRatio: 0.06, trackingError: 0.01, return1y: 18.7, return3y: 9.4, return5y: 10.8, high52w: 186.40, low52w: 148.20 },
  { symbol: "IJH", name: "iShares Core S&P Mid-Cap", price: 278.50, changePercent: 0.88, aum: "78.0B", expenseRatio: 0.05, trackingError: 0.02, return1y: 18.2, return3y: 7.6, return5y: 9.4, high52w: 292.60, low52w: 226.80 },
  { symbol: "SCHD", name: "Schwab US Dividend Equity", price: 77.28, changePercent: 0.44, aum: "52.8B", expenseRatio: 0.06, trackingError: 0.02, return1y: 12.4, return3y: 8.8, return5y: 10.2, high52w: 82.60, low52w: 65.40 },
  { symbol: "IJR", name: "iShares Core S&P Small-Cap", price: 108.24, changePercent: 0.72, aum: "82.0B", expenseRatio: 0.06, trackingError: 0.02, return1y: 14.8, return3y: 6.2, return5y: 8.4, high52w: 116.40, low52w: 88.60 },
  { symbol: "IVV", name: "iShares Core S&P 500", price: 478.90, changePercent: 1.22, aum: "398.5B", expenseRatio: 0.03, trackingError: 0.02, return1y: 28.5, return3y: 10.7, return5y: 12.3, high52w: 500.20, low52w: 384.40 },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", price: 476.32, changePercent: 1.24, aum: "412.8B", expenseRatio: 0.03, trackingError: 0.02, return1y: 28.6, return3y: 10.8, return5y: 12.4, high52w: 498.00, low52w: 382.10 },
  { symbol: "VTI", name: "Vanguard Total Stock Market", price: 252.80, changePercent: 1.08, aum: "375.2B", expenseRatio: 0.03, trackingError: 0.02, return1y: 27.4, return3y: 9.6, return5y: 11.8, high52w: 266.00, low52w: 202.50 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: 438.24, changePercent: 1.56, aum: "244.6B", expenseRatio: 0.20, trackingError: 0.02, return1y: 32.4, return3y: 14.2, return5y: 18.6, high52w: 460.20, low52w: 348.80 },
  { symbol: "EFA", name: "iShares MSCI EAFE ETF", price: 78.46, changePercent: 0.34, aum: "56.0B", expenseRatio: 0.32, trackingError: 0.03, return1y: 12.8, return3y: 5.6, return5y: 6.4, high52w: 82.40, low52w: 64.80 },
  { symbol: "VWO", name: "Vanguard FTSE Emerging Mkts", price: 42.36, changePercent: -0.52, aum: "72.6B", expenseRatio: 0.08, trackingError: 0.03, return1y: 8.7, return3y: 2.4, return5y: 3.8, high52w: 46.20, low52w: 36.40 },
  { symbol: "BND", name: "Vanguard Total Bond Market", price: 72.18, changePercent: 0.14, aum: "102.4B", expenseRatio: 0.03, trackingError: 0.04, return1y: 4.8, return3y: 1.2, return5y: 1.6, high52w: 74.50, low52w: 68.20 },
];

/* ------------------------------------------------------------------ */
/*  Tab config                                                         */
/* ------------------------------------------------------------------ */

const tabs = [
  { id: "ultra-low-cost" as const, label: "Ultra Low Cost", data: ultraLowCostETFs },
  { id: "low-tracking-error" as const, label: "Low Tracking Error", data: lowTrackingErrorETFs },
];

type TabId = (typeof tabs)[number]["id"];

/* ------------------------------------------------------------------ */
/*  RangeBar component (matches widget's RangeBarInline)               */
/* ------------------------------------------------------------------ */

function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const range = high - low || 1;
  const pct = Math.max(0, Math.min(100, ((current - low) / range) * 100));

  return (
    <div className="flex items-center gap-1.5 w-full">
      <span className="text-[12px] tabular-nums text-muted-foreground whitespace-nowrap leading-none">
        {low.toFixed(0)}
      </span>
      <div className="relative flex-1 h-[3px] rounded-full bg-muted">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[12px] w-[2px] bg-foreground"
          style={{ left: `${pct}%` }}
        />
      </div>
      <span className="text-[12px] tabular-nums text-muted-foreground whitespace-nowrap leading-none">
        {high.toFixed(0)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Column config (matches widget exactly)                             */
/* ------------------------------------------------------------------ */

const columnDefs = [
  { header: "ETF", align: "left" as const },
  { header: "Price", align: "right" as const, minWidth: 72 },
  { header: "chg-icon" as const, align: "right" as const, minWidth: 72 },
  { header: "AUM", align: "right" as const, minWidth: 72 },
  { header: "Exp%", align: "right" as const, minWidth: 58 },
  { header: "1Y", align: "right" as const, minWidth: 72 },
  { header: "3Y", align: "right" as const, minWidth: 72 },
  { header: "5Y", align: "right" as const, minWidth: 72 },
  { header: "Track Err", align: "right" as const, minWidth: 72 },
  { header: "1Y Range", align: "center" as const, minWidth: 110 },
  { header: "Watchlist", align: "center" as const, minWidth: 80 },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EfficientETFsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("ultra-low-cost");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const toggleBookmark = (sym: string) =>
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(sym)) next.delete(sym);
      else next.add(sym);
      return next;
    });

  const activeData = tabs.find((t) => t.id === activeTab)!.data;

  /* ── Frozen-col width calculation (mirrors ScrollableTableWidget) ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [frozenW, setFrozenW] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const VISIBLE_DATA_COLS = 2;
  const MIN_FROZEN = 120;
  const SCROLLABLE_MIN_WIDTH = 480;

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
    if (ths.length < VISIBLE_DATA_COLS) return;
    let visibleSum = 0;
    for (let i = 0; i < VISIBLE_DATA_COLS; i++) {
      visibleSum += ths[i].getBoundingClientRect().width;
    }
    const containerW = container.getBoundingClientRect().width;
    setFrozenW(Math.max(MIN_FROZEN, containerW - visibleSum));
  }, []);

  useEffect(() => { measure(); }, [measure, activeTab]);
  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  const alignCls = (align?: "left" | "center" | "right") =>
    align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right";

  const frozenCol = columnDefs[0];
  const scrollCols = columnDefs.slice(1);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Header */}
      <header className="flex items-center px-3 py-2">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-[17px] font-bold tracking-tight text-foreground ml-1">
          Most Efficient ETFs
        </h1>
      </header>

      {/* Sticky tabs with animated underline */}
      <div className="shrink-0 border-b border-border/60 bg-background">
        <div className="flex px-5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative py-1.5 px-1 mr-6 text-[14px] font-semibold transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="efficient-etf-tab-underline"
                    className="absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-foreground"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable table area */}
      <main className="no-scrollbar flex-1 overflow-y-auto">
        <div ref={containerRef} className="pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              {/* Frozen first column */}
              <div
                className={cn(
                  "shrink-0 border-r transition-colors duration-200",
                  isScrolled ? "border-border/40" : "border-transparent"
                )}
                style={{ width: frozenW ?? MIN_FROZEN }}
              >
                {/* Frozen header */}
                <div className="h-[40px] flex items-center pl-5 pr-3 text-[14px] font-medium text-muted-foreground text-left">
                  {frozenCol.header}
                </div>
                {/* Frozen rows */}
                {activeData.map((etf) => (
                  <div key={etf.symbol} className="h-[80px] flex items-center pl-5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
                      <p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">
                        {etf.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scrollable columns */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-x-auto no-scrollbar min-w-0"
              >
                <table ref={tableRef} style={{ minWidth: SCROLLABLE_MIN_WIDTH }}>
                  <thead>
                    <tr className="h-[40px]">
                      {scrollCols.map((col, i) => (
                        <th
                          key={i}
                          className={cn(
                            "text-[14px] font-medium text-muted-foreground whitespace-nowrap px-3",
                            alignCls(col.align)
                          )}
                          style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                        >
                          {col.header === "chg-icon" ? (
                            <span className="inline-flex items-center justify-end gap-1">
                              <ArrowDown size={10} className="text-foreground" />
                              Chg%
                            </span>
                          ) : (
                            col.header
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeData.map((etf) => {
                      const chgColor = etf.changePercent >= 0 ? "text-gain" : "text-loss";
                      return (
                        <tr key={etf.symbol} className="h-[80px]">
                          {/* Price */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className="tabular-nums text-[14px] text-foreground">
                              {etf.price.toFixed(2)}
                            </span>
                          </td>
                          {/* Chg% */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className={cn("tabular-nums text-[14px] font-semibold", chgColor)}>
                              {etf.changePercent >= 0 ? "+" : ""}{etf.changePercent.toFixed(2)}%
                            </span>
                          </td>
                          {/* AUM */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className="tabular-nums text-[14px] text-muted-foreground">
                              {etf.aum}
                            </span>
                          </td>
                          {/* Exp% */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className="tabular-nums text-[14px] text-muted-foreground">
                              {etf.expenseRatio.toFixed(2)}%
                            </span>
                          </td>
                          {/* 1Y */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className={cn("tabular-nums text-[14px] font-medium", etf.return1y >= 0 ? "text-gain" : "text-loss")}>
                              {etf.return1y >= 0 ? "+" : ""}{etf.return1y.toFixed(1)}%
                            </span>
                          </td>
                          {/* 3Y */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className={cn("tabular-nums text-[14px] font-medium", etf.return3y >= 0 ? "text-gain" : "text-loss")}>
                              {etf.return3y >= 0 ? "+" : ""}{etf.return3y.toFixed(1)}%
                            </span>
                          </td>
                          {/* 5Y */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className={cn("tabular-nums text-[14px] font-medium", etf.return5y >= 0 ? "text-gain" : "text-loss")}>
                              {etf.return5y >= 0 ? "+" : ""}{etf.return5y.toFixed(1)}%
                            </span>
                          </td>
                          {/* Track Err */}
                          <td className="px-3 whitespace-nowrap text-right">
                            <span className="tabular-nums text-[14px] text-muted-foreground">
                              {etf.trackingError.toFixed(2)}%
                            </span>
                          </td>
                          {/* 1Y Range */}
                          <td className="px-3 whitespace-nowrap text-center">
                            <RangeBar low={etf.low52w} high={etf.high52w} current={etf.price} />
                          </td>
                          {/* Watchlist */}
                          <td className="px-3 whitespace-nowrap text-center">
                            <div className="flex justify-center">
                              <button
                                onClick={() => toggleBookmark(etf.symbol)}
                                className="transition-transform active:scale-90"
                              >
                                <Bookmark
                                  size={20}
                                  strokeWidth={1.8}
                                  className={cn(
                                    "transition-colors",
                                    bookmarks.has(etf.symbol)
                                      ? "fill-foreground text-foreground"
                                      : "text-muted-foreground/50"
                                  )}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom spacing */}
        <div className="h-8" />
        <HomeIndicator />
      </main>
    </div>
  );
}
