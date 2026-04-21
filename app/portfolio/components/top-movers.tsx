"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TOP_GAINERS, TOP_LOSERS, NEUTRAL_HOLDINGS, type PortfolioMover } from "./portfolio-mock-data";

type Tab = "gainers" | "losers" | "neutral";
const tabs: { id: Tab; label: string }[] = [
  { id: "gainers", label: "Gainers" },
  { id: "losers",  label: "Losers" },
  { id: "neutral", label: "Neutral" },
];

const INITIAL_COUNT = 6;
const fmt = (n: number) => (n >= 0 ? "+" : "") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${Math.abs(n).toFixed(1)}%`;

function getRows(tab: Tab): PortfolioMover[] {
  if (tab === "gainers") return TOP_GAINERS;
  if (tab === "losers")  return TOP_LOSERS;
  return NEUTRAL_HOLDINGS;
}

interface ColDef {
  header: string;
  width: number;
  render: (r: PortfolioMover) => { text: string; colored: boolean };
}

const COLS: ColDef[] = [
  { header: "Current",     width: 80,  render: (r) => ({ text: r.current.toLocaleString("en-US", { minimumFractionDigits: 0 }), colored: false }) },
  { header: "Invested",    width: 80,  render: (r) => ({ text: r.invested.toLocaleString("en-US", { minimumFractionDigits: 0 }), colored: false }) },
  { header: "P&L",         width: 130, render: (r) => ({ text: `${fmt(r.pnl)} (${fmtPct(r.pnlPct)})`, colored: true }) },
  { header: "Alloc.",      width: 72,  render: (r) => ({ text: `+${r.allocationPct.toFixed(1)}%`, colored: false }) },
  { header: "Est. XIRR",  width: 86,  render: (r) => ({ text: fmtPct(r.xirr), colored: true }) },
  { header: "Daily P&L",  width: 86,  render: (r) => ({ text: fmt(r.dailyPnl), colored: true }) },
  { header: "Weekly P&L", width: 86,  render: (r) => ({ text: fmt(r.weeklyPnl), colored: true }) },
  { header: "Monthly P&L",width: 92,  render: (r) => ({ text: fmt(r.monthlyPnl), colored: true }) },
  { header: "Yearly P&L", width: 86,  render: (r) => ({ text: fmt(r.yearlyPnl), colored: true }) },
];

const TABLE_MIN_WIDTH = 160 + COLS.reduce((s, c) => s + c.width, 0);

export function TopMovers() {
  const [activeTab, setActiveTab] = useState<Tab>("gainers");
  const [expanded, setExpanded] = useState(false);

  const allRows = getRows(activeTab);
  const rows = expanded ? allRows : allRows.slice(0, INITIAL_COUNT);
  const hasMore = allRows.length > INITIAL_COUNT;

  return (
    <Card className="border-border/50 shadow-none overflow-hidden">
      <CardContent className="p-5 pb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[15px] font-semibold text-foreground">Top Movers</p>
          <button className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[12px] font-semibold text-foreground active:opacity-70">
            Stocks <ArrowUpDown size={12} className="text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setExpanded(false); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable table */}
        <div className="overflow-x-auto no-scrollbar -mx-5">
          <table className="w-full text-sm border-collapse" style={{ minWidth: TABLE_MIN_WIDTH }}>
            <colgroup>
              <col style={{ width: 160 }} />
              {COLS.map((c) => <col key={c.header} style={{ width: c.width }} />)}
            </colgroup>
            <thead>
              <tr className="text-muted-foreground text-[11px] uppercase tracking-wider">
                <th className="text-left py-2.5 pl-5 pr-3 font-medium sticky left-0 bg-card z-10">Name</th>
                {COLS.map((c, i) => (
                  <th key={c.header} className={cn("text-right py-2.5 px-2 font-medium whitespace-nowrap", i === COLS.length - 1 && "pr-5")}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.symbol} className="border-t border-border/30">
                  {/* Sticky name cell */}
                  <td className="py-3 pl-5 pr-3 sticky left-0 bg-card z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-muted/60" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-foreground leading-tight">{r.name}</p>
                        <p className="text-[12px] text-muted-foreground leading-tight">
                          ${r.ltp.toFixed(2)}{" "}
                          <span className={cn("font-medium", r.dayChangePct >= 0 ? "text-gain" : "text-loss")}>
                            {r.dayChangePct >= 0 ? "+" : ""}{r.dayChangePct.toFixed(1)}%
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>
                  {COLS.map((c, i) => {
                    const { text, colored } = c.render(r);
                    const isNeg = text.startsWith("-");
                    return (
                      <td
                        key={c.header}
                        className={cn(
                          "py-3 px-2 text-right text-[13px] tabular-nums whitespace-nowrap",
                          i === COLS.length - 1 && "pr-5",
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

        {/* View more / less */}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full pt-3 pb-1 text-[13px] font-medium text-muted-foreground active:opacity-70"
          >
            {expanded ? "View less" : `View all ${allRows.length} holdings`}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
