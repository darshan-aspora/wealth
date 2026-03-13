"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MarketTable, PctCell, type TableColumn } from "./market-table";
import { Sparkline } from "./sparkline";

// ---- Types ----
interface DividendETF {
  symbol: string;
  name: string;
  logoColor: string;
  price: number;
  yield: number;
  changePct: number;
  expenseRatio: string;
  aum: string;
  ytd: number;
  frequency: "Monthly" | "Quarterly";
  sparkline: number[];
}

// ---- Tab definitions ----
const DIV_ETF_TABS = ["High Yield", "Dividend Growth", "Bond & Income"] as const;
type DivETFTab = (typeof DIV_ETF_TABS)[number];

// ---- Mock Data ----
const HIGH_YIELD: DividendETF[] = [
  { symbol: "SCHD", name: "Schwab US Dividend", logoColor: "bg-blue-600", price: 82.45, yield: 3.42, changePct: 0.38, expenseRatio: "0.06%", aum: "63B", ytd: 4.82, frequency: "Quarterly", sparkline: [78, 79, 80, 79, 81, 82, 81, 82, 83, 82] },
  { symbol: "JEPI", name: "JPM Equity Premium", logoColor: "bg-slate-700", price: 56.12, yield: 7.24, changePct: -0.15, expenseRatio: "0.35%", aum: "34B", ytd: 2.18, frequency: "Monthly", sparkline: [55, 56, 55, 56, 57, 56, 55, 56, 56, 56] },
  { symbol: "JEPQ", name: "JPM Nasdaq Premium", logoColor: "bg-slate-700", price: 52.88, yield: 9.41, changePct: 0.62, expenseRatio: "0.35%", aum: "18B", ytd: 6.94, frequency: "Monthly", sparkline: [49, 50, 51, 50, 52, 51, 52, 53, 52, 53] },
  { symbol: "HDV", name: "iShares High Dividend", logoColor: "bg-black", price: 112.30, yield: 3.81, changePct: 0.22, expenseRatio: "0.08%", aum: "11B", ytd: 3.56, frequency: "Quarterly", sparkline: [108, 109, 110, 111, 110, 111, 112, 111, 112, 112] },
  { symbol: "VYM", name: "Vanguard High Yield", logoColor: "bg-red-700", price: 120.56, yield: 2.92, changePct: 0.18, expenseRatio: "0.06%", aum: "55B", ytd: 5.12, frequency: "Quarterly", sparkline: [115, 116, 117, 118, 119, 118, 119, 120, 120, 121] },
];

const DIV_GROWTH: DividendETF[] = [
  { symbol: "VIG", name: "Vanguard Div Appreciation", logoColor: "bg-red-700", price: 185.22, yield: 1.72, changePct: 0.28, expenseRatio: "0.06%", aum: "82B", ytd: 6.48, frequency: "Quarterly", sparkline: [178, 179, 181, 180, 182, 183, 184, 183, 185, 185] },
  { symbol: "DGRO", name: "iShares Div Growth", logoColor: "bg-black", price: 58.74, yield: 2.31, changePct: 0.14, expenseRatio: "0.08%", aum: "28B", ytd: 5.22, frequency: "Quarterly", sparkline: [55, 56, 57, 56, 57, 58, 57, 58, 59, 59] },
  { symbol: "NOBL", name: "ProShares Div Aristocrats", logoColor: "bg-purple-600", price: 98.10, yield: 2.08, changePct: -0.12, expenseRatio: "0.35%", aum: "12B", ytd: 3.14, frequency: "Quarterly", sparkline: [95, 96, 97, 96, 97, 98, 97, 98, 98, 98] },
  { symbol: "DGRW", name: "WisdomTree US Qual Div", logoColor: "bg-amber-600", price: 74.38, yield: 1.82, changePct: 0.34, expenseRatio: "0.28%", aum: "13B", ytd: 7.62, frequency: "Monthly", sparkline: [70, 71, 72, 71, 73, 72, 73, 74, 74, 74] },
  { symbol: "SDY", name: "SPDR S&P Div ETF", logoColor: "bg-green-700", price: 132.44, yield: 2.58, changePct: 0.08, expenseRatio: "0.35%", aum: "22B", ytd: 2.94, frequency: "Quarterly", sparkline: [129, 130, 131, 130, 131, 132, 131, 132, 132, 132] },
];

const BOND_INCOME: DividendETF[] = [
  { symbol: "BND", name: "Vanguard Total Bond", logoColor: "bg-red-700", price: 72.18, yield: 3.92, changePct: 0.05, expenseRatio: "0.03%", aum: "108B", ytd: 1.24, frequency: "Monthly", sparkline: [71, 72, 71, 72, 72, 72, 72, 72, 72, 72] },
  { symbol: "HYG", name: "iShares High Yield Corp", logoColor: "bg-black", price: 78.42, yield: 5.81, changePct: -0.08, expenseRatio: "0.49%", aum: "18B", ytd: 2.68, frequency: "Monthly", sparkline: [77, 78, 77, 78, 78, 78, 79, 78, 78, 78] },
  { symbol: "TLT", name: "iShares 20+ Yr Treasury", logoColor: "bg-black", price: 88.56, yield: 4.12, changePct: -0.32, expenseRatio: "0.15%", aum: "52B", ytd: -2.14, frequency: "Monthly", sparkline: [91, 90, 89, 90, 89, 88, 89, 88, 89, 89] },
  { symbol: "VCIT", name: "Vanguard Intm Corp Bond", logoColor: "bg-red-700", price: 80.94, yield: 4.48, changePct: 0.02, expenseRatio: "0.04%", aum: "44B", ytd: 1.82, frequency: "Monthly", sparkline: [80, 80, 81, 80, 81, 81, 81, 81, 81, 81] },
  { symbol: "AGG", name: "iShares Core US Aggregate", logoColor: "bg-black", price: 98.22, yield: 3.68, changePct: 0.04, expenseRatio: "0.03%", aum: "92B", ytd: 0.94, frequency: "Monthly", sparkline: [97, 98, 97, 98, 98, 98, 98, 98, 98, 98] },
];

const TAB_DATA: Record<DivETFTab, DividendETF[]> = {
  "High Yield": HIGH_YIELD,
  "Dividend Growth": DIV_GROWTH,
  "Bond & Income": BOND_INCOME,
};

// ---- Columns ----
const divEtfColumns: TableColumn<DividendETF>[] = [
  {
    key: "etf", label: "ETF", align: "left", frozen: true, minWidth: 160,
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white", r.logoColor)}>
          {r.symbol.slice(0, 2)}
        </div>
        <div>
          <div className="text-[14px] font-bold text-foreground">{r.symbol}</div>
          <div className="max-w-[80px] truncate text-[12px] text-muted-foreground">{r.name}</div>
        </div>
      </div>
    ),
  },
  {
    key: "yield", label: "Yield", align: "right",
    render: (r) => <span className="font-mono text-[13px] font-bold tabular-nums text-gain">{r.yield.toFixed(2)}%</span>,
  },
  {
    key: "pct", label: "% Chg", align: "right",
    render: (r) => <PctCell value={r.changePct} />,
  },
  {
    key: "exp", label: "Exp. Ratio", align: "right",
    render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.expenseRatio}</span>,
  },
  {
    key: "aum", label: "AUM", align: "right",
    render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.aum}</span>,
  },
  {
    key: "ytd", label: "YTD", align: "right",
    render: (r) => <PctCell value={r.ytd} />,
  },
  {
    key: "freq", label: "Freq", align: "right",
    render: (r) => <span className="text-[12px] text-muted-foreground">{r.frequency === "Monthly" ? "Mo" : "Qt"}</span>,
  },
  {
    key: "chart", label: "Chart", align: "right",
    render: (r) => <Sparkline data={r.sparkline} />,
  },
];

export function DividendETFsMarket() {
  const [activeTab, setActiveTab] = useState<DivETFTab>("High Yield");

  return (
    <div>
      {/* Pill tabs */}
      <div className="mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-0.5">
          {DIV_ETF_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                activeTab === tab
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <MarketTable columns={divEtfColumns} data={TAB_DATA[activeTab]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
