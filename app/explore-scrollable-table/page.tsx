"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowDown, ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { ScrollableTableWidget } from "@/components/scrollable-table-widget";

/* ── Sample data ── */

interface SampleStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  pe: number | null;
  marketCap: string;
  revGrowth: number;
  profitGrowth: number;
}

const sampleStocks: SampleStock[] = [
  { symbol: "NVDA", name: "NVIDIA", price: 892.45, changePercent: 3.97, pe: 68, marketCap: "2.2T", revGrowth: 122.4, profitGrowth: 581.3 },
  { symbol: "META", name: "Meta Platforms", price: 523.8, changePercent: 3.69, pe: 34, marketCap: "1.3T", revGrowth: 24.7, profitGrowth: 69.3 },
  { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, pe: 59, marketCap: "1.9T", revGrowth: 12.5, profitGrowth: 229.1 },
  { symbol: "MSFT", name: "Microsoft", price: 428.15, changePercent: 2.71, pe: 37, marketCap: "3.2T", revGrowth: 17.6, profitGrowth: 33.2 },
  { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, pe: 31, marketCap: "3.0T", revGrowth: 2.1, profitGrowth: 10.7 },
];

const tabs = [
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "most-active", label: "Most Active" },
  { id: "near-high", label: "Near 52W High" },
  { id: "near-low", label: "Near 52W Low" },
];

const capLabels = ["Mega Cap", "Large Cap", "Mid Cap", "Small Cap"];

function useColumns() {
  return [
    { header: "Stock", align: "left" as const },
    { header: "Price", align: "right" as const },
    { header: (<span className="inline-flex items-center justify-end gap-1"><ArrowDown size={10} className="text-foreground" />Chg%</span>), align: "right" as const },
    { header: "PE", align: "right" as const, minWidth: 48 },
    { header: "M.Cap", align: "right" as const, minWidth: 68 },
    { header: "Rev Gr.", align: "right" as const, minWidth: 74 },
    { header: "Profit Gr.", align: "right" as const, minWidth: 80 },
    { header: "Watchlist", align: "center" as const, minWidth: 80 },
  ];
}

function useRows(stocks: SampleStock[]) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym); else n.add(sym);
      return n;
    });

  const rows = stocks.map((stock) => {
    const chgColor = stock.changePercent >= 0 ? "text-emerald-500" : "text-red-500";
    return [
      <div key="name" className="flex items-center gap-2.5">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
        <p className="min-w-0 truncate text-[14px] font-semibold leading-tight text-foreground">{stock.name}</p>
      </div>,
      <span key="price" className="whitespace-nowrap tabular-nums text-[14px] text-foreground">{stock.price.toFixed(1)}</span>,
      <span key="chg" className={cn("whitespace-nowrap tabular-nums text-[14px] font-semibold", chgColor)}>{stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%</span>,
      <span key="pe" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{stock.pe != null ? Math.round(stock.pe) : "—"}</span>,
      <span key="mcap" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{stock.marketCap}</span>,
      <span key="rev" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", stock.revGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>{stock.revGrowth >= 0 ? "+" : ""}{Math.round(stock.revGrowth)}%</span>,
      <span key="profit" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", stock.profitGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>{stock.profitGrowth >= 0 ? "+" : ""}{Math.round(stock.profitGrowth)}%</span>,
      <div key="watch" className="flex justify-center">
        <button onClick={() => toggleBookmark(stock.symbol)} className="transition-transform active:scale-90">
          <Bookmark size={20} strokeWidth={1.8} className={cn("transition-colors", bookmarks.has(stock.symbol) ? "fill-foreground text-foreground" : "text-muted-foreground/50")} />
        </button>
      </div>,
    ];
  });

  return rows;
}

export default function ScrollableTableDemo() {
  const [activeTab, setActiveTab] = useState("gainers");
  const [capIdx, setCapIdx] = useState(0);
  const columns = useColumns();
  const rows = useRows(sampleStocks);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">Scrollable Table Widget</h1>
          <p className="text-[13px] text-muted-foreground">Reusable component demo</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-8 space-y-10">
        {/* Demo 1: Full featured */}
        <ScrollableTableWidget
          title="What's Moving"
          description="Top movers across US equities today"
          flipper={{
            label: capLabels[capIdx],
            icon: <ArrowUpDown size={13} className="shrink-0 text-muted-foreground" />,
            onFlip: () => setCapIdx((i) => (i + 1) % capLabels.length),
          }}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabDescription={{ title: "How to read this", body: "Sorted by percentage change, highest first. Scroll right for more data." }}
          pillLayoutId="demo-pill"
          columns={columns}
          rows={rows}
          scrollableMinWidth={500}
          animationKey={`${activeTab}-${capIdx}`}
          footer={{ label: "See All 76 Movers" }}
        />

        {/* Demo 2: Minimal — no flipper, no descriptions, no tabs */}
        <ScrollableTableWidget
          title="Dividend Stocks"
          columns={columns}
          rows={rows.slice(0, 3)}
          scrollableMinWidth={500}
          footer={{ label: "View All" }}
        />
      </div>

      <HomeIndicator />
    </div>
  );
}
