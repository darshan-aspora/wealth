"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketTable, ChangeCell, type TableColumn } from "./market-table";
import { SectionHeader } from "./section-header";

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

interface TrendingCoin {
  name: string;
  symbol: string;
  price: string;
  changePct: string;
  isUp: boolean;
}

// ---- Filter config ----
const FILTERS = ["Most Popular", "Layer 1", "DeFi", "Meme"] as const;
type CryptoFilter = (typeof FILTERS)[number];

// ---- Mock data ----
const CRYPTO_DATA: CryptoRow[] = [
  { name: "Bitcoin",    symbol: "BTC",  price: "67,842.30", change: "+1,432.10", changePct: "+2.14%",  isUp: true,  marketCap: "1.33T",  volume: "38.2B",  category: ["Layer 1"] },
  { name: "Ethereum",   symbol: "ETH",  price: "3,521.18",  change: "+64.82",    changePct: "+1.87%",  isUp: true,  marketCap: "423.1B", volume: "18.7B",  category: ["Layer 1"] },
  { name: "Solana",     symbol: "SOL",  price: "172.45",    change: "+8.71",     changePct: "+5.32%",  isUp: true,  marketCap: "76.8B",  volume: "4.1B",   category: ["Layer 1"] },
  { name: "BNB",        symbol: "BNB",  price: "584.20",    change: "-2.52",     changePct: "-0.43%",  isUp: false, marketCap: "87.2B",  volume: "2.3B",   category: [] },
  { name: "XRP",        symbol: "XRP",  price: "0.6234",    change: "-0.0071",   changePct: "-1.12%",  isUp: false, marketCap: "34.1B",  volume: "1.8B",   category: [] },
  { name: "Cardano",    symbol: "ADA",  price: "0.4521",    change: "+0.0135",   changePct: "+3.08%",  isUp: true,  marketCap: "16.0B",  volume: "892M",   category: ["Layer 1"] },
  { name: "Avalanche",  symbol: "AVAX", price: "38.72",     change: "+1.56",     changePct: "+4.21%",  isUp: true,  marketCap: "14.6B",  volume: "743M",   category: ["Layer 1"] },
  { name: "Dogecoin",   symbol: "DOGE", price: "0.1542",    change: "-0.0037",   changePct: "-2.34%",  isUp: false, marketCap: "22.1B",  volume: "1.4B",   category: ["Meme"] },
  { name: "Chainlink",  symbol: "LINK", price: "14.82",     change: "+0.42",     changePct: "+2.91%",  isUp: true,  marketCap: "8.7B",   volume: "612M",   category: ["DeFi"] },
  { name: "Polkadot",   symbol: "DOT",  price: "7.34",      change: "+0.18",     changePct: "+2.51%",  isUp: true,  marketCap: "10.2B",  volume: "421M",   category: ["Layer 1"] },
  { name: "Uniswap",    symbol: "UNI",  price: "12.47",     change: "+0.63",     changePct: "+5.32%",  isUp: true,  marketCap: "7.5B",   volume: "318M",   category: ["DeFi"] },
  { name: "Aave",       symbol: "AAVE", price: "92.18",     change: "-1.84",     changePct: "-1.96%",  isUp: false, marketCap: "1.4B",   volume: "187M",   category: ["DeFi"] },
  { name: "Shiba Inu",  symbol: "SHIB", price: "0.00002341",change: "+0.0000008",changePct: "+3.54%",  isUp: true,  marketCap: "13.8B",  volume: "982M",   category: ["Meme"] },
];

const TRENDING_COINS: TrendingCoin[] = [
  { name: "Solana",    symbol: "SOL",  price: "172.45",    changePct: "+5.32%", isUp: true },
  { name: "Uniswap",   symbol: "UNI",  price: "12.47",     changePct: "+5.32%", isUp: true },
  { name: "Avalanche", symbol: "AVAX", price: "38.72",     changePct: "+4.21%", isUp: true },
  { name: "Shiba Inu", symbol: "SHIB", price: "0.00002341",changePct: "+3.54%", isUp: true },
  { name: "Cardano",   symbol: "ADA",  price: "0.4521",    changePct: "+3.08%", isUp: true },
];

// ---- Table columns ----
const cryptoColumns: TableColumn<CryptoRow>[] = [
  {
    key: "name",
    label: "Name",
    align: "left",
    frozen: true,
    minWidth: 150,
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold">
          {r.symbol.slice(0, 2)}
        </div>
        <div>
          <div className="text-[14px] font-bold text-foreground">{r.name}</div>
          <div className="text-[12px] text-muted-foreground">{r.symbol}</div>
        </div>
      </div>
    ),
  },
  {
    key: "price",
    label: "Price",
    align: "right",
    render: (r) => (
      <span className="font-mono tabular-nums text-foreground">{r.price}</span>
    ),
  },
  {
    key: "change",
    label: "Change",
    align: "right",
    render: (r) => <ChangeCell value={r.change} isUp={r.isUp} />,
  },
  {
    key: "changePct",
    label: "% Chg",
    align: "right",
    render: (r) => <ChangeCell value={r.changePct} isUp={r.isUp} />,
  },
  {
    key: "marketCap",
    label: "Mkt Cap",
    align: "right",
    render: (r) => (
      <span className="font-mono tabular-nums text-muted-foreground">{r.marketCap}</span>
    ),
  },
  {
    key: "volume",
    label: "Vol (24h)",
    align: "right",
    render: (r) => (
      <span className="font-mono tabular-nums text-muted-foreground">{r.volume}</span>
    ),
  },
];

// ---- Component ----
export function CryptoTab() {
  const [filter, setFilter] = useState<CryptoFilter>("Most Popular");

  const filteredData =
    filter === "Most Popular"
      ? CRYPTO_DATA
      : CRYPTO_DATA.filter((row) => row.category.includes(filter));

  return (
    <div className="pb-8">
      {/* ── Top Cryptocurrencies ── */}
      <div className="px-5 pt-5">
        <SectionHeader
          title="Top Cryptocurrencies"
          subtitle="Real-time prices across major crypto assets"
        />

        {/* Filter pills */}
        <div className="mb-3 -mx-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5 py-0.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                  filter === f
                    ? "bg-foreground text-background"
                    : "border border-border/60 text-muted-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`crypto-${filter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MarketTable columns={cryptoColumns} data={filteredData} />
          </motion.div>
        </AnimatePresence>

        <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          View All Crypto
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="h-6" />

      {/* ── Trending ── */}
      <div className="px-5">
        <SectionHeader
          title="Trending"
          subtitle="Most searched coins in the last 24 hours"
        />

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          {TRENDING_COINS.map((coin, i) => (
            <div
              key={coin.symbol}
              className={cn(
                "flex items-center justify-between px-4 py-3.5 transition-colors active:bg-muted/30",
                i > 0 && "border-t border-border/30"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-[13px] font-bold text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold">
                  {coin.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">
                    {coin.name}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {coin.symbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-[14px] font-semibold tabular-nums text-foreground">
                  {coin.price}
                </p>
                <p
                  className={cn(
                    "font-mono text-[13px] font-medium tabular-nums",
                    coin.isUp ? "text-gain" : "text-loss"
                  )}
                >
                  {coin.changePct}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
