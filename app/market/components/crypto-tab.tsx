"use client";

import { useState } from "react";


import { ScrollableTableWidget, type STWColumn } from "@/components/scrollable-table-widget";
import { ChangeCell } from "./market-table";

// ---- Types ----
interface CryptoRow {
  name: string;
  symbol: string;
  price: string;
  change: string;
  changePct: string;
  isUp: boolean;
  marketCap: string;
  volume: string;
  category: string[];
}

// ---- Filter config ----
const FILTERS = ["Most Popular", "Layer 1", "DeFi", "Meme"] as const;
type CryptoFilter = (typeof FILTERS)[number];

// ---- Mock data ----
const CRYPTO_DATA: CryptoRow[] = [
  { name: "Bitcoin",    symbol: "BTC",  price: "67,842", change: "+1,432", changePct: "+2.14%",  isUp: true,  marketCap: "1.33T",  volume: "38.2B",  category: ["Layer 1"] },
  { name: "Ethereum",   symbol: "ETH",  price: "3,521",  change: "+64",    changePct: "+1.87%",  isUp: true,  marketCap: "423.1B", volume: "18.7B",  category: ["Layer 1"] },
  { name: "Solana",     symbol: "SOL",  price: "172",    change: "+8",     changePct: "+5.32%",  isUp: true,  marketCap: "76.8B",  volume: "4.1B",   category: ["Layer 1"] },
  { name: "BNB",        symbol: "BNB",  price: "584",    change: "-2",     changePct: "-0.43%",  isUp: false, marketCap: "87.2B",  volume: "2.3B",   category: [] },
  { name: "XRP",        symbol: "XRP",  price: "0.62",   change: "-0.007", changePct: "-1.12%",  isUp: false, marketCap: "34.1B",  volume: "1.8B",   category: [] },
  { name: "Cardano",    symbol: "ADA",  price: "0.45",   change: "+0.013", changePct: "+3.08%",  isUp: true,  marketCap: "16.0B",  volume: "892M",   category: ["Layer 1"] },
  { name: "Avalanche",  symbol: "AVAX", price: "38",     change: "+1",     changePct: "+4.21%",  isUp: true,  marketCap: "14.6B",  volume: "743M",   category: ["Layer 1"] },
  { name: "Dogecoin",   symbol: "DOGE", price: "0.15",   change: "-0.003", changePct: "-2.34%",  isUp: false, marketCap: "22.1B",  volume: "1.4B",   category: ["Meme"] },
  { name: "Chainlink",  symbol: "LINK", price: "14",     change: "+0.42",  changePct: "+2.91%",  isUp: true,  marketCap: "8.7B",   volume: "612M",   category: ["DeFi"] },
  { name: "Polkadot",   symbol: "DOT",  price: "7",      change: "+0.18",  changePct: "+2.51%",  isUp: true,  marketCap: "10.2B",  volume: "421M",   category: ["Layer 1"] },
  { name: "Uniswap",    symbol: "UNI",  price: "12",     change: "+0.63",  changePct: "+5.32%",  isUp: true,  marketCap: "7.5B",   volume: "318M",   category: ["DeFi"] },
  { name: "Aave",       symbol: "AAVE", price: "92",     change: "-1",     changePct: "-1.96%",  isUp: false, marketCap: "1.4B",   volume: "187M",   category: ["DeFi"] },
  { name: "Shiba Inu",  symbol: "SHIB", price: "0.00002",change: "+0.000001",changePct: "+3.54%", isUp: true,  marketCap: "13.8B",  volume: "982M",   category: ["Meme"] },
];

// ---- STW columns ----
const cryptoColumns: STWColumn[] = [
  { header: "Name", align: "left" },
  { header: "Price", align: "right", minWidth: 90 },
  { header: "% Chg", align: "right", minWidth: 80 },
  { header: "Change", align: "right", minWidth: 80 },
  { header: "Mkt Cap", align: "right", minWidth: 80 },
  { header: "Vol (24h)", align: "right", minWidth: 80 },
];

function cryptoRows(data: CryptoRow[]): React.ReactNode[][] {
  return data.map((r) => [
    <div key="name" className="flex items-center gap-2.5">
      <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
      <div className="text-[14px] font-semibold text-foreground">{r.name}</div>
    </div>,
    <span key="price" className="text-[14px] tabular-nums font-medium text-foreground">{r.price}</span>,
    <ChangeCell key="pct" value={r.changePct} isUp={r.isUp} />,
    <ChangeCell key="chg" value={r.change} isUp={r.isUp} />,
    <span key="mcap" className="text-[14px] tabular-nums font-medium text-muted-foreground">{r.marketCap}</span>,
    <span key="vol" className="text-[14px] tabular-nums font-medium text-muted-foreground">{r.volume}</span>,
  ]);
}

// ---- Component ----
export function CryptoTab() {
  const [filter, setFilter] = useState<CryptoFilter>("Most Popular");

  const filteredData =
    filter === "Most Popular"
      ? CRYPTO_DATA
      : CRYPTO_DATA.filter((row) => row.category.includes(filter));

  return (
    <div className="pb-8">
      {/* Top Cryptocurrencies */}
      <div className="px-5 pt-5">
        <ScrollableTableWidget
          title="Top Cryptocurrencies"
          description="Real-time prices across major crypto assets"
          tabs={FILTERS.map((f) => ({ id: f, label: f }))}
          activeTab={filter}
          onTabChange={(id) => setFilter(id as CryptoFilter)}
          pillLayoutId="crypto-pill"
          columns={cryptoColumns}
          rows={cryptoRows(filteredData)}
          visibleDataCols={2}
          scrollableMinWidth={420}
          rowHeight="h-[64px]"
          animationKey={`crypto-${filter}`}
          footer={{ label: "View All Crypto" }}
        />
      </div>
    </div>
  );
}
