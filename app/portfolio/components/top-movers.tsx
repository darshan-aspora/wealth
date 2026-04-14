"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TOP_GAINERS, TOP_LOSERS, NEUTRAL_HOLDINGS, type PortfolioMover } from "./portfolio-mock-data";

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

type Tab = "gainers" | "losers" | "all";
const tabs: { id: Tab; label: string }[] = [
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "all", label: "Neutral" },
];

const tabInsights: Record<Tab, string> = {
  gainers: "Your winners. Consider booking partial profits or letting them run based on conviction",
  losers: "Holdings that need attention. Is the thesis still intact or is it time to cut?",
  all: "Flat performers sitting idle. Re-evaluate or redirect capital to stronger ideas",
};

/* ------------------------------------------------------------------ */
/*  Sort / flipper                                                     */
/* ------------------------------------------------------------------ */

type SortKey = "pnlPct" | "pnl" | "xirr" | "dayChangePct";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "pnlPct", label: "P&L %" },
  { key: "pnl", label: "P&L Abs" },
  { key: "xirr", label: "Est. XIRR" },
  { key: "dayChangePct", label: "1D Change" },
];

/* ------------------------------------------------------------------ */
/*  Column definitions per sort key                                    */
/* ------------------------------------------------------------------ */

interface Col {
  header: string;
  width: number;
  render: (r: PortfolioMover) => { text: string; colored: boolean };
}

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2 });
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
const fmtPct2 = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

function getCols(sortKey: SortKey): Col[] {
  // First two columns are always: Price, then the primary metric
  // Then two secondary columns that rotate based on sort key
  const price: Col = {
    header: "Price ($)",
    width: 80,
    render: (r) => ({ text: r.ltp.toFixed(2), colored: false }),
  };

  const allCols: Record<SortKey, Col> = {
    pnlPct: {
      header: "P&L %",
      width: 76,
      render: (r) => ({ text: fmtPct(r.pnlPct), colored: true }),
    },
    pnl: {
      header: "P&L",
      width: 90,
      render: (r) => ({ text: `${r.pnl >= 0 ? "+" : ""}${fmt(r.pnl)}`, colored: true }),
    },
    xirr: {
      header: "Est. XIRR",
      width: 86,
      render: (r) => ({ text: fmtPct(r.xirr), colored: true }),
    },
    dayChangePct: {
      header: "1D Chg%",
      width: 80,
      render: (r) => ({ text: fmtPct2(r.dayChangePct), colored: true }),
    },
  };

  // Primary sort col first, then the rest, price at the end
  const primary = allCols[sortKey];
  const rest = (Object.keys(allCols) as SortKey[])
    .filter((k) => k !== sortKey)
    .map((k) => allCols[k]);

  return [primary, ...rest, price];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const INITIAL_COUNT = 6;

function getRows(tab: Tab): PortfolioMover[] {
  if (tab === "gainers") return TOP_GAINERS;
  if (tab === "losers") return TOP_LOSERS;
  return NEUTRAL_HOLDINGS;
}

function sortRows(rows: PortfolioMover[], key: SortKey, tab: Tab): PortfolioMover[] {
  return [...rows].sort((a, b) => {
    const asc = tab === "losers";
    const diff = a[key] - b[key];
    return asc ? diff : -diff;
  });
}

/* ------------------------------------------------------------------ */
/*  Widget                                                             */
/* ------------------------------------------------------------------ */

export function TopMovers() {
  const [activeTab, setActiveTab] = useState<Tab>("gainers");
  const [sortIdx, setSortIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const sortKey = sortOptions[sortIdx].key;
  const sortLabel = sortOptions[sortIdx].label;

  const allRows = sortRows(getRows(activeTab), sortKey, activeTab);
  const rows = expanded ? allRows : allRows.slice(0, INITIAL_COUNT);
  const hasMore = allRows.length > INITIAL_COUNT;

  const cols = getCols(sortKey);
  const tableMinWidth = 130 + cols.reduce((s, c) => s + c.width, 0);

  const cycleSortKey = () => {
    setSortIdx((i) => (i + 1) % sortOptions.length);
  };

  return (
    <Card className="border-border/50 shadow-none overflow-hidden">
      <CardContent className="p-5 pb-3">
        {/* Header: title + flipper */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[15px] font-semibold text-foreground">Holdings Performance</p>

          <button
            onClick={cycleSortKey}
            className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border/60 px-3 py-1.5 text-[12px] font-semibold text-foreground transition-all active:opacity-70"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={sortKey}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {sortLabel}
              </motion.span>
            </AnimatePresence>
            <ArrowUpDown size={12} className="flex-shrink-0 text-muted-foreground" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1.5 mb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setExpanded(false); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-muted-foreground mb-3">{tabInsights[activeTab]}</p>

        {/* Scrollable table */}
        <div className="overflow-x-auto no-scrollbar -mx-5">
          <table className="w-full text-sm border-collapse" style={{ minWidth: tableMinWidth }}>
            <colgroup>
              <col style={{ width: 130 }} />
              {cols.map((c) => (
                <col key={c.header} style={{ width: c.width }} />
              ))}
            </colgroup>
            <thead>
              <tr className="text-muted-foreground text-[11px] uppercase tracking-wider">
                <th className="text-left py-2.5 pl-5 pr-3 font-medium sticky left-0 bg-card z-10 shadow-[2px_0_0_0_hsl(var(--border)/0.3)]">Name</th>
                {cols.map((c, i) => (
                  <th
                    key={c.header}
                    className={cn(
                      "text-right py-2.5 px-2 font-medium",
                      i === cols.length - 1 && "pr-5"
                    )}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.symbol}>
                  {/* Sticky name cell with logo */}
                  <td className="py-3 pl-5 pr-3 sticky left-0 bg-card z-10 shadow-[2px_0_0_0_hsl(var(--border)/0.3)]">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-500/20" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{r.name}</p>
                      </div>
                    </div>
                  </td>
                  {cols.map((c, i) => {
                    const { text, colored } = c.render(r);
                    const isNeg = text.startsWith("-");
                    return (
                      <td
                        key={c.header}
                        className={cn(
                          "py-3 px-2 text-right text-[13px] tabular-nums",
                          i === cols.length - 1 && "pr-5",
                          colored
                            ? isNeg ? "text-loss font-medium" : "text-gain font-medium"
                            : "text-foreground"
                        )}
                      >
                        {text}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* View more / View less */}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full pt-3 pb-1 text-[13px] font-medium text-muted-foreground active:opacity-70 transition-opacity"
          >
            {expanded ? "View less" : `View all ${allRows.length} holdings`}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
