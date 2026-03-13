"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketTable, PctCell, RangeCell, ChangeCell, type TableColumn } from "./market-table";
import { SectionHeader, SectionDivider } from "./section-header";
import { EconomicOverview } from "./economic-overview";
import { NewsAccordion } from "./news-accordion";
import { StockScreener } from "./stock-screener";
import { EarningsCalendar } from "./earnings-calendar";
import { DividendETFsMarket } from "./dividend-etfs-table";
import { DividendCalendar } from "./dividend-calendar";
import { Sparkline } from "./sparkline";
import {
  US_INDICES, US_SECTORS, TOP_STOCKS, TOP_ETFS,
  US_ECONOMIC, US_NEWS,
  type PerformanceRow, type TopStock, type TopETF,
} from "../data";

// ---- Performance table columns (shared by Indices & Sectors) ----
const perfColumns: TableColumn<PerformanceRow>[] = [
  { key: "name", label: "Name", align: "left", frozen: true, minWidth: 140, render: (r) => <span className="text-[14px] font-semibold text-foreground">{r.name}</span> },
  { key: "today", label: "Today", align: "right", render: (r) => <PctCell value={r.today} /> },
  { key: "5d", label: "5 Days", align: "right", render: (r) => <PctCell value={r.fiveDays} /> },
  { key: "1m", label: "1 Month", align: "right", render: (r) => <PctCell value={r.oneMonth} /> },
  { key: "ytd", label: "YTD", align: "right", render: (r) => <PctCell value={r.ytd} /> },
  { key: "1y", label: "1 Year", align: "right", render: (r) => <PctCell value={r.oneYear} /> },
  { key: "3y", label: "3 Years", align: "right", render: (r) => <PctCell value={r.threeYears} /> },
  { key: "dayRange", label: "Day Range", align: "right", render: (r) => <RangeCell low={r.dayRange[0]} high={r.dayRange[1]} /> },
  { key: "52w", label: "52W Range", align: "right", render: (r) => <RangeCell low={r.weekRange52[0]} high={r.weekRange52[1]} /> },
];

// ---- Top 5 Stocks columns ----
const stockColumns: TableColumn<TopStock>[] = [
  {
    key: "stock", label: "Stock", align: "left", frozen: true, minWidth: 160,
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white", r.logoColor)}>
          {r.logo}
        </div>
        <div>
          <div className="text-[14px] font-bold text-foreground">{r.symbol}</div>
          <div className="max-w-[80px] truncate text-[12px] text-muted-foreground">{r.name}</div>
        </div>
      </div>
    ),
  },
  { key: "price", label: "Price", align: "right", render: (r) => <span className="font-mono tabular-nums text-foreground">{r.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> },
  { key: "change", label: "Change", align: "right", render: (r) => <ChangeCell value={(r.change >= 0 ? "+" : "") + r.change.toFixed(2)} isUp={r.change >= 0} /> },
  { key: "pct", label: "% Chg", align: "right", render: (r) => <PctCell value={r.changePct} /> },
  { key: "volume", label: "Volume", align: "right", render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.volume}</span> },
  { key: "mktcap", label: "Mkt Cap", align: "right", render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.marketCap}</span> },
  { key: "chart", label: "Chart", align: "right", render: (r) => <Sparkline data={r.sparkline} /> },
];

// ---- Top 5 ETFs columns ----
const etfColumns: TableColumn<TopETF>[] = [
  {
    key: "etf", label: "ETF", align: "left", frozen: true, minWidth: 160,
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white", r.logoColor)}>
          {r.logo}
        </div>
        <div>
          <div className="text-[14px] font-bold text-foreground">{r.symbol}</div>
          <div className="max-w-[80px] truncate text-[12px] text-muted-foreground">{r.name}</div>
        </div>
      </div>
    ),
  },
  { key: "price", label: "Price", align: "right", render: (r) => <span className="font-mono tabular-nums text-foreground">{r.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> },
  { key: "pct", label: "% Chg", align: "right", render: (r) => <PctCell value={r.changePct} /> },
  { key: "volume", label: "Volume", align: "right", render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.volume}</span> },
  { key: "aum", label: "AUM", align: "right", render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.aum}</span> },
  { key: "exp", label: "Exp. Ratio", align: "right", render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.expenseRatio}</span> },
  { key: "chart", label: "Chart", align: "right", render: (r) => <Sparkline data={r.sparkline} /> },
];

// ---- Mover tabs (matching explore page) ----
const MOVER_TABS = ["Gainers", "Losers", "Most Active", "Near 52W High", "Near 52W Low"] as const;
type MoverType = (typeof MOVER_TABS)[number];

const CAP_SIZES = ["Mega Cap", "Large Cap", "Mid Cap", "Small Cap"] as const;
type CapSize = (typeof CAP_SIZES)[number];

// ---- ETF tabs ----
const ETF_TABS = ["Most Active", "Top Inflows", "Equity", "Bond", "Sector", "Thematic"] as const;
type ETFFilter = (typeof ETF_TABS)[number];

export function USMarketsTab() {
  const [moverType, setMoverType] = useState<MoverType>("Gainers");
  const [capSize, setCapSize] = useState<CapSize>("Mega Cap");
  const [etfFilter, setEtfFilter] = useState<ETFFilter>("Most Active");

  const cycleCapSize = () =>
    setCapSize((p) => CAP_SIZES[(CAP_SIZES.indexOf(p) + 1) % CAP_SIZES.length]);

  const top5Stocks = TOP_STOCKS.slice(0, 5);
  const top5ETFs = TOP_ETFS.slice(0, 5);

  return (
    <div className="pb-8">
      {/* Major Indices */}
      <div className="px-5 pt-5">
        <SectionHeader
          title="Major Indices"
          subtitle="Real-time US equity index performance"
        />
        <MarketTable columns={perfColumns} data={US_INDICES} />
      </div>

      <SectionDivider />

      {/* Sectors */}
      <div className="px-5">
        <SectionHeader
          title="Sectors"
          subtitle="Sector ETF performance across US markets"
        />
        <MarketTable columns={perfColumns} data={US_SECTORS} />
      </div>

      <SectionDivider />

      {/* Top 5 Stocks — What's Moving style */}
      <div className="px-5">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-[18px] font-bold tracking-tight">Top 5 Stocks</h2>
          <button
            onClick={cycleCapSize}
            className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border/60 px-3.5 py-1.5 text-[13px] font-semibold text-foreground transition-all"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={capSize}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {capSize}
              </motion.span>
            </AnimatePresence>
            <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />
          </button>
        </div>

        {/* Mover-type tabs */}
        <div className="mb-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-0.5">
            {MOVER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setMoverType(tab)}
                className={cn(
                  "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                  moverType === tab
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
            key={`stocks-${moverType}-${capSize}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MarketTable columns={stockColumns} data={top5Stocks} />
          </motion.div>
        </AnimatePresence>
      </div>

      <SectionDivider />

      {/* Top 5 ETFs */}
      <div className="px-5">
        <h2 className="mb-1 text-[18px] font-bold tracking-tight">Top 5 ETFs</h2>
        <p className="mb-3 text-[14px] text-muted-foreground">Filter by category or activity</p>

        {/* ETF filter tabs */}
        <div className="mb-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-0.5">
            {ETF_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setEtfFilter(tab)}
                className={cn(
                  "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                  etfFilter === tab
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
            key={`etfs-${etfFilter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MarketTable columns={etfColumns} data={top5ETFs} />
          </motion.div>
        </AnimatePresence>
      </div>

      <SectionDivider />

      {/* Dividend ETFs */}
      <div className="px-5">
        <SectionHeader
          title="Dividend ETFs"
          subtitle="Income-focused ETFs sorted by yield"
        />
        <DividendETFsMarket />
      </div>

      <SectionDivider />

      {/* Economic Overview */}
      <div className="px-5">
        <SectionHeader
          title="Economic Overview"
          subtitle="Key macroeconomic indicators for the US economy"
          action={{ label: "More →", onClick: () => {} }}
        />
        <EconomicOverview data={US_ECONOMIC} />
      </div>

      <SectionDivider />

      {/* Market Summary */}
      <div className="px-5">
        <NewsAccordion
          title="Market Summary"
          subtitle="AI-curated headlines with expandable summaries"
          items={US_NEWS}
          sourceCount={47}
        />
      </div>

      <SectionDivider />

      {/* Stock Screener */}
      <div className="px-5">
        <SectionHeader
          title="Stock Screener"
          subtitle="Find stocks matching your investment criteria"
        />
        <StockScreener />
      </div>

      <SectionDivider />

      {/* Earnings Calendar */}
      <div className="px-5">
        <EarningsCalendar />
      </div>

      <SectionDivider />

      {/* Dividend Calendar */}
      <div className="px-5">
        <DividendCalendar />
      </div>
    </div>
  );
}
