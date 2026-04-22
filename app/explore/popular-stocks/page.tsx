"use client";

import { Suspense, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Bookmark,
  Check,
  ChevronDown,
} from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  type Stock,
  type CapSize,
  capOrder,
  capLabels,
  MEGA_CONSENSUS,
  oneYearChange,
  fmtPct1Y,
  fmtVol,
  oneMonthVol,
  monthlyAvgVol,
} from "@/app/explore/_data/movers";
import { RangeBar, ConsensusBadge } from "@/app/explore/components/movers-atoms";

/* ------------------------------------------------------------------ */
/*  Tab config                                                         */
/* ------------------------------------------------------------------ */

type PopularTab = "most-invested" | "popular-sip";

const TABS: { id: PopularTab; label: string }[] = [
  { id: "most-invested", label: "Most Invested" },
  { id: "popular-sip", label: "Popular for SIP" },
];

/* ------------------------------------------------------------------ */
/*  Mock data — ~18 stocks per tab                                     */
/* ------------------------------------------------------------------ */

const mostBought: Stock[] = [
  { symbol: "NVDA", name: "NVIDIA", price: 892.45, changePercent: 3.97, volume: "52.3M", marketCap: "$2.2T", pe: 68, high52w: 974.0, low52w: 392.3, color: "#76B900", revGrowth: 122.4, profitGrowth: 581.3, rating: "Buy" },
  { symbol: "TSLA", name: "Tesla", price: 178.24, changePercent: -6.48, volume: "112.4M", marketCap: "$568B", pe: 48, high52w: 278.0, low52w: 138.8, color: "#CC0000", revGrowth: -5.5, profitGrowth: -45.2, rating: "Hold" },
  { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, volume: "38.9M", marketCap: "$3.0T", pe: 31, high52w: 199.6, low52w: 164.1, color: "#555555", revGrowth: 2.1, profitGrowth: 10.7, rating: "Buy" },
  { symbol: "META", name: "Meta Platforms", price: 523.8, changePercent: 3.69, volume: "28.1M", marketCap: "$1.3T", pe: 34, high52w: 542.8, low52w: 296.4, color: "#0668E1", revGrowth: 24.7, profitGrowth: 69.3, rating: "Buy" },
  { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, volume: "45.7M", marketCap: "$1.9T", pe: 59, high52w: 191.7, low52w: 118.4, color: "#FF9900", revGrowth: 12.5, profitGrowth: 229.1, rating: "Buy" },
  { symbol: "MSFT", name: "Microsoft", price: 428.15, changePercent: 2.71, volume: "22.4M", marketCap: "$3.2T", pe: 37, high52w: 433.0, low52w: 309.5, color: "#00A4EF", revGrowth: 17.6, profitGrowth: 33.2, rating: "Buy" },
  { symbol: "GOOGL", name: "Alphabet", price: 152.67, changePercent: -3.68, volume: "32.8M", marketCap: "$1.9T", pe: 27, high52w: 174.7, low52w: 120.2, color: "#4285F4", revGrowth: 13.6, profitGrowth: 31.4, rating: "Buy" },
  { symbol: "PLTR", name: "Palantir", price: 24.85, changePercent: 12.34, volume: "98.2M", marketCap: "$54B", pe: 242, high52w: 27.5, low52w: 13.7, color: "#1D1D1D", revGrowth: 17.7, profitGrowth: 32.1, rating: "Buy" },
  { symbol: "AMD", name: "AMD", price: 162.58, changePercent: -2.14, volume: "52.6M", marketCap: "$263B", pe: 72, high52w: 227.3, low52w: 132.8, color: "#ED1C24", revGrowth: 9.8, profitGrowth: -18.4, rating: "Buy" },
  { symbol: "COIN", name: "Coinbase", price: 178.42, changePercent: 9.6, volume: "14.3M", marketCap: "$42B", pe: 45, high52w: 185.7, low52w: 78.4, color: "#0052FF", revGrowth: 101.4, profitGrowth: 285.0, rating: "Buy" },
  { symbol: "NFLX", name: "Netflix", price: 628.74, changePercent: 4.21, volume: "7.3M", marketCap: "$272B", pe: 45, high52w: 639.0, low52w: 395.5, color: "#E50914", revGrowth: 15.8, profitGrowth: 54.2, rating: "Buy" },
  { symbol: "SHOP", name: "Shopify", price: 78.35, changePercent: 7.43, volume: "18.7M", marketCap: "$98B", pe: 82, high52w: 81.3, low52w: 45.5, color: "#96BF48", revGrowth: 26.1, profitGrowth: 140.8, rating: "Buy" },
  { symbol: "IONQ", name: "IonQ", price: 12.45, changePercent: 21.24, volume: "42.1M", marketCap: "$2.7B", pe: null, high52w: 15.3, low52w: 5.2, color: "#7C3AED", revGrowth: 89.5, profitGrowth: -42.1, rating: "Hold" },
  { symbol: "SMCI", name: "Super Micro", price: 28.73, changePercent: 15.81, volume: "35.6M", marketCap: "$15B", pe: 12, high52w: 122.9, low52w: 17.3, color: "#0071C5", revGrowth: 110.2, profitGrowth: 88.4, rating: "Buy" },
  { symbol: "CRWD", name: "CrowdStrike", price: 312.8, changePercent: 4.2, volume: "8.4M", marketCap: "$72B", pe: 720, high52w: 365.0, low52w: 135.0, color: "#E11D48", revGrowth: 36.4, profitGrowth: 120.5, rating: "Buy" },
  { symbol: "MARA", name: "Marathon Digi", price: 18.92, changePercent: 10.84, volume: "22.3M", marketCap: "$5.6B", pe: 25, high52w: 31.4, low52w: 8.4, color: "#F59E0B", revGrowth: 229.0, profitGrowth: 350.2, rating: "Buy" },
  { symbol: "SQ", name: "Block Inc", price: 72.18, changePercent: 6.22, volume: "12.5M", marketCap: "$43B", pe: 57, high52w: 78.2, low52w: 39.8, color: "#3E4348", revGrowth: 24.5, profitGrowth: 88.2, rating: "Hold" },
  { symbol: "ABNB", name: "Airbnb", price: 156.73, changePercent: 5.46, volume: "8.9M", marketCap: "$98B", pe: 39, high52w: 170.1, low52w: 110.4, color: "#FF5A5F", revGrowth: 18.3, profitGrowth: 55.7, rating: "Buy" },
];

const mostHeld: Stock[] = [
  { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, volume: "38.9M", marketCap: "$3.0T", pe: 31, high52w: 199.6, low52w: 164.1, color: "#555555", revGrowth: 2.1, profitGrowth: 10.7, rating: "Buy" },
  { symbol: "MSFT", name: "Microsoft", price: 428.15, changePercent: 2.71, volume: "22.4M", marketCap: "$3.2T", pe: 37, high52w: 433.0, low52w: 309.5, color: "#00A4EF", revGrowth: 17.6, profitGrowth: 33.2, rating: "Buy" },
  { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, volume: "45.7M", marketCap: "$1.9T", pe: 59, high52w: 191.7, low52w: 118.4, color: "#FF9900", revGrowth: 12.5, profitGrowth: 229.1, rating: "Buy" },
  { symbol: "GOOGL", name: "Alphabet", price: 152.67, changePercent: -3.68, volume: "32.8M", marketCap: "$1.9T", pe: 27, high52w: 174.7, low52w: 120.2, color: "#4285F4", revGrowth: 13.6, profitGrowth: 31.4, rating: "Buy" },
  { symbol: "NVDA", name: "NVIDIA", price: 892.45, changePercent: 3.97, volume: "52.3M", marketCap: "$2.2T", pe: 68, high52w: 974.0, low52w: 392.3, color: "#76B900", revGrowth: 122.4, profitGrowth: 581.3, rating: "Buy" },
  { symbol: "TSLA", name: "Tesla", price: 178.24, changePercent: -6.48, volume: "112.4M", marketCap: "$568B", pe: 48, high52w: 278.0, low52w: 138.8, color: "#CC0000", revGrowth: -5.5, profitGrowth: -45.2, rating: "Hold" },
  { symbol: "META", name: "Meta Platforms", price: 523.8, changePercent: 3.69, volume: "28.1M", marketCap: "$1.3T", pe: 34, high52w: 542.8, low52w: 296.4, color: "#0668E1", revGrowth: 24.7, profitGrowth: 69.3, rating: "Buy" },
  { symbol: "JPM", name: "JPMorgan", price: 198.73, changePercent: 0.95, volume: "9.8M", marketCap: "$572B", pe: 12, high52w: 210.5, low52w: 162.4, color: "#003087", revGrowth: 9.4, profitGrowth: 25.3, rating: "Buy" },
  { symbol: "V", name: "Visa", price: 285.6, changePercent: 0.67, volume: "7.1M", marketCap: "$588B", pe: 32, high52w: 296.4, low52w: 248.7, color: "#1A1F71", revGrowth: 10.2, profitGrowth: 17.4, rating: "Buy" },
  { symbol: "BRK.B", name: "Berkshire", price: 412.5, changePercent: 0.42, volume: "4.2M", marketCap: "$882B", pe: 11, high52w: 445.2, low52w: 344.6, color: "#3E2F84", revGrowth: 20.8, profitGrowth: 42.1, rating: "Hold" },
  { symbol: "WMT", name: "Walmart", price: 168.9, changePercent: 0.58, volume: "8.4M", marketCap: "$455B", pe: 30, high52w: 173.4, low52w: 150.2, color: "#0071CE", revGrowth: 5.8, profitGrowth: 12.4, rating: "Hold" },
  { symbol: "UNH", name: "UnitedHealth", price: 527.4, changePercent: -1.23, volume: "4.1M", marketCap: "$486B", pe: 22, high52w: 554.7, low52w: 436.4, color: "#002B5C", revGrowth: 14.2, profitGrowth: 11.8, rating: "Buy" },
  { symbol: "KO", name: "Coca-Cola", price: 62.15, changePercent: 0.24, volume: "12.1M", marketCap: "$269B", pe: 25, high52w: 64.8, low52w: 55.2, color: "#F40009", revGrowth: 3.2, profitGrowth: 7.8, rating: "Hold" },
  { symbol: "PG", name: "Procter & Gamble", price: 165.22, changePercent: 0.31, volume: "7.5M", marketCap: "$389B", pe: 27, high52w: 172.0, low52w: 147.3, color: "#003DA5", revGrowth: 4.1, profitGrowth: 8.2, rating: "Hold" },
  { symbol: "JNJ", name: "Johnson & Johnson", price: 156.74, changePercent: -0.38, volume: "8.9M", marketCap: "$378B", pe: 20, high52w: 175.0, low52w: 144.6, color: "#D51900", revGrowth: 1.8, profitGrowth: -5.4, rating: "Hold" },
  { symbol: "MA", name: "Mastercard", price: 458.92, changePercent: 0.83, volume: "3.6M", marketCap: "$428B", pe: 36, high52w: 476.0, low52w: 380.2, color: "#EB001B", revGrowth: 12.8, profitGrowth: 18.6, rating: "Buy" },
  { symbol: "HD", name: "Home Depot", price: 362.1, changePercent: 1.47, volume: "4.3M", marketCap: "$361B", pe: 25, high52w: 395.6, low52w: 296.3, color: "#F96302", revGrowth: 3.4, profitGrowth: 6.2, rating: "Buy" },
];

const tabData: Record<PopularTab, Stock[]> = {
  "most-invested": mostBought,
  "popular-sip": mostHeld,
};

/* ------------------------------------------------------------------ */
/*  Sort config                                                        */
/* ------------------------------------------------------------------ */

type SortKey =
  | "changePercent"
  | "oneYear"
  | "pe"
  | "revGrowth"
  | "profitGrowth";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "changePercent", label: "Change %" },
  { key: "oneYear", label: "1Y Change" },
  { key: "pe", label: "PE" },
  { key: "revGrowth", label: "Revenue growth" },
  { key: "profitGrowth", label: "Profit growth" },
];

const applySort = (stocks: Stock[], key: SortKey, dir: SortDir) => {
  const mul = dir === "asc" ? 1 : -1;
  const val = (s: Stock): number => {
    switch (key) {
      case "changePercent": return s.changePercent;
      case "oneYear": return oneYearChange(s.symbol);
      case "pe": return s.pe ?? Number.POSITIVE_INFINITY;
      case "revGrowth": return s.revGrowth;
      case "profitGrowth": return s.profitGrowth;
    }
  };
  return [...stocks].sort((a, b) => (val(a) - val(b)) * mul);
};

/* ------------------------------------------------------------------ */
/*  Column config (same as home widget)                                */
/* ------------------------------------------------------------------ */

interface Column {
  header: string;
  align: "left" | "center" | "right";
  minWidth?: number;
  sortKey?: SortKey;
}

function getColumns(showConsensus: boolean): Column[] {
  return [
    { header: "Stock", align: "left" },
    { header: "Price", align: "right", sortKey: "changePercent" },
    { header: "1Y", align: "right", minWidth: 80, sortKey: "oneYear" },
    ...(showConsensus ? [{ header: "Consensus", align: "center" as const, minWidth: 120 }] : []),
    { header: "PE", align: "right", minWidth: 48, sortKey: "pe" },
    { header: "M.Cap", align: "right", minWidth: 68 },
    { header: "Rev Gr.", align: "right", minWidth: 74, sortKey: "revGrowth" },
    { header: "Profit Gr.", align: "right", minWidth: 80, sortKey: "profitGrowth" },
    { header: "1M Volume", align: "right", minWidth: 80 },
    { header: "Monthly Avg Vol", align: "right", minWidth: 110 },
    { header: "1Y Range", align: "center", minWidth: 136 },
    { header: "Watchlist", align: "center", minWidth: 80 },
  ];
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PopularStocksPage() {
  return (
    <Suspense>
      <PopularStocksContent />
    </Suspense>
  );
}

function PopularStocksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<PopularTab>(() => {
    const p = searchParams.get("tab");
    return p === "most-invested" || p === "popular-sip" ? p : "most-invested";
  });
  const [capSize, setCapSize] = useState<CapSize>("mega");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  /* Sort + Cap sheet state */
  const [sortKey, setSortKey] = useState<SortKey>("changePercent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [capOpen, setCapOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  /* Header click: switch sort key (default desc), or flip direction if already active */
  const handleHeaderSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
    } else {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    }
  };

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym);
      else n.add(sym);
      return n;
    });

  const allStocks = tabData[tab];
  const stocks = useMemo(
    () => applySort(allStocks, sortKey, sortDir),
    [allStocks, sortKey, sortDir],
  );
  const showConsensus = capSize === "mega";
  const columns = getColumns(showConsensus);
  const frozenCol = columns[0];
  const scrollCols = columns.slice(1);

  const alignCls = (align?: "left" | "center" | "right") =>
    align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right";

  /* Frozen column width measurement */
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [frozenW, setFrozenW] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  /* Collapsing header on vertical scroll */
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const handleMainScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setHeaderCollapsed(e.currentTarget.scrollTop > 40);
  }, []);

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
    if (ths.length < 2) return;
    let visibleSum = 0;
    for (let i = 0; i < 2; i++) {
      visibleSum += ths[i].getBoundingClientRect().width;
    }
    const containerW = container.getBoundingClientRect().width;
    setFrozenW(Math.max(120, containerW - visibleSum));
  }, []);

  useEffect(() => {
    measure();
  }, [measure, stocks, capSize]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  /* Build row data (matching widget exactly) */
  const rows = stocks.map((stock) => {
    const chgColor = stock.changePercent >= 0 ? "text-emerald-500" : "text-red-500";
    const oneY = oneYearChange(stock.symbol);
    return [
      /* Frozen: stock name + logo */
      <div key="name" className="flex items-center gap-2.5">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
        <p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">
          {stock.name}
        </p>
      </div>,
      /* Price + Chg% stacked */
      <div key="price" className="flex flex-col items-end">
        <span className="whitespace-nowrap tabular-nums text-[14px] text-foreground">
          {stock.price.toFixed(1)}
        </span>
        <span className={cn("whitespace-nowrap tabular-nums text-[12px] font-semibold", chgColor)}>
          {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%
        </span>
      </div>,
      /* 1Y Change */
      <span key="1y" className={cn("whitespace-nowrap tabular-nums text-[14px] font-semibold", oneY >= 0 ? "text-emerald-500" : "text-red-500")}>
        {fmtPct1Y(stock.symbol)}
      </span>,
      /* Consensus (only mega) */
      ...(showConsensus
        ? [
            <div key="consensus" className="flex justify-center">
              <ConsensusBadge {...(MEGA_CONSENSUS[stock.symbol] ?? { buy: 10, hold: 10, sell: 5 })} />
            </div>,
          ]
        : []),
      /* PE */
      <span key="pe" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
        {stock.pe != null ? Math.round(stock.pe) : "\u2014"}
      </span>,
      /* M.Cap */
      <span key="mcap" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
        {stock.marketCap.replace("$", "")}
      </span>,
      /* Rev Gr. */
      <span key="rev" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", stock.revGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>
        {stock.revGrowth >= 0 ? "+" : ""}{Math.round(stock.revGrowth)}%
      </span>,
      /* Profit Gr. */
      <span key="profit" className={cn("whitespace-nowrap tabular-nums text-[14px] font-medium", stock.profitGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>
        {stock.profitGrowth >= 0 ? "+" : ""}{Math.round(stock.profitGrowth)}%
      </span>,
      /* 1M Volume */
      <span key="mvol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
        {fmtVol(oneMonthVol(stock.symbol))}
      </span>,
      /* Monthly Avg Vol */
      <span key="mavol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
        {fmtVol(monthlyAvgVol(stock.symbol))}
      </span>,
      /* 1Y Range */
      <RangeBar key="range" low={stock.low52w} high={stock.high52w} current={stock.price} />,
      /* Watchlist */
      <div key="watch" className="flex justify-center">
        <button onClick={() => toggleBookmark(stock.symbol)} className="transition-transform active:scale-90">
          <Bookmark
            size={20}
            strokeWidth={1.8}
            className={cn(
              "transition-colors",
              bookmarks.has(stock.symbol) ? "fill-foreground text-foreground" : "text-muted-foreground/50",
            )}
          />
        </button>
      </div>,
    ];
  });

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Grey header section — expands on top, collapses on scroll */}
      <div className="shrink-0 bg-muted/50 border-b border-border/50">
        {/* Top bar */}
        <header className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <motion.h1
            initial={false}
            animate={{ opacity: headerCollapsed ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 text-[17px] font-bold tracking-tight text-foreground ml-1"
          >
            Popular Stocks
          </motion.h1>
          {/* Cap size selector */}
          <button
            onClick={() => setCapOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-[14px] font-semibold text-foreground active:scale-[0.97] transition-transform"
          >
            <span className="leading-none">{capLabels[capSize]}</span>
            <ChevronDown size={15} className="flex-shrink-0 text-muted-foreground" />
          </button>
        </header>

        {/* Expanded title + description — collapses on scroll */}
        <motion.div
          initial={false}
          animate={{
            maxHeight: headerCollapsed ? 0 : 160,
            opacity: headerCollapsed ? 0 : 1,
          }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden"
        >
          <div className="px-5 pt-1 pb-4">
            <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight">
              Popular Stocks
            </h1>
            <p className="mt-1.5 text-[14px] leading-snug text-muted-foreground">
              What other Aspora members are buying and holding.
              <br />
              A pulse check on the crowd, not a green light.
            </p>
          </div>
        </motion.div>

        {/* Sticky tabs */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5">
            {TABS.map((t, i) => {
              const active = tab === t.id;
              const count = tabData[t.id].length;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative whitespace-nowrap pt-2 pb-3 text-[14px] font-semibold transition-colors flex items-center gap-1.5",
                    i === 0 ? "pr-3" : "px-3",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span>{t.label}</span>
                  <span
                    className={cn(
                      "inline-flex min-w-[20px] justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "bg-muted-foreground/15 text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="popular-stocks-tab-underline"
                      className={cn(
                        "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                        i === 0 ? "left-0" : "left-3",
                      )}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable table */}
      <main
        className="no-scrollbar flex-1 overflow-y-auto"
        onScroll={handleMainScroll}
      >
        <div ref={containerRef} className="pt-2 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${capSize}`}
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
                  isScrolled ? "border-border/40" : "border-transparent",
                )}
                style={{ width: frozenW ?? 120 }}
              >
                <div className={cn("h-[40px] flex items-center pl-5 pr-3 text-[14px] font-medium text-muted-foreground", alignCls(frozenCol?.align))}>
                  {frozenCol?.header}
                </div>
                {rows.map((row, i) => (
                  <div key={i} className="h-[64px] flex items-center pl-5 pr-3">
                    {row[0]}
                  </div>
                ))}
              </div>

              {/* Scrollable columns */}
              <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-x-auto no-scrollbar min-w-0">
                <table ref={tableRef} style={{ minWidth: 500 }}>
                  <thead>
                    <tr className="h-[40px]">
                      {scrollCols.map((col, i) => {
                        const sortable = !!col.sortKey;
                        const active = sortable && sortKey === col.sortKey;
                        return (
                          <th
                            key={i}
                            className={cn(
                              "text-[14px] font-medium text-muted-foreground whitespace-nowrap px-3",
                              alignCls(col.align),
                            )}
                            style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                          >
                            {sortable ? (
                              <button
                                onClick={() => handleHeaderSort(col.sortKey as SortKey)}
                                className={cn(
                                  "inline-flex items-center gap-1 transition-colors",
                                  active ? "text-foreground" : "hover:text-foreground",
                                )}
                              >
                                {active && (
                                  sortDir === "desc"
                                    ? <ArrowDown size={12} strokeWidth={2.5} />
                                    : <ArrowUp size={12} strokeWidth={2.5} />
                                )}
                                <span>{col.header}</span>
                              </button>
                            ) : (
                              col.header
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="h-[64px]">
                        {row.slice(1).map((cell, colIdx) => (
                          <td
                            key={colIdx}
                            className={cn(
                              "px-3 whitespace-nowrap",
                              alignCls(scrollCols[colIdx]?.align),
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
      </main>

      {/* Floating Sort FAB */}
      <button
        onClick={() => setSortOpen(true)}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 h-11 pl-4 pr-5 rounded-full flex items-center gap-2 text-[14px] font-semibold bg-foreground text-background shadow-lg shadow-foreground/20 active:scale-[0.97] transition-transform"
      >
        <ArrowUpDown size={15} strokeWidth={2.5} />
        <span>Sort</span>
      </button>

      <HomeIndicator />

      {/* Cap size sheet */}
      <CapSheet
        open={capOpen}
        onOpenChange={setCapOpen}
        capSize={capSize}
        onChange={(c) => {
          setCapSize(c);
          setCapOpen(false);
        }}
      />

      {/* Sort sheet */}
      <SortSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        sortKey={sortKey}
        sortDir={sortDir}
        onChange={(k, d) => {
          setSortKey(k);
          setSortDir(d);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cap size sheet                                                     */
/* ------------------------------------------------------------------ */

function CapSheet({
  open,
  onOpenChange,
  capSize,
  onChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  capSize: CapSize;
  onChange: (c: CapSize) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-[28px] p-0 border-0 max-h-[80vh] overflow-y-auto"
      >
        <SheetHeader className="px-5 pt-5 pb-3 text-center sm:text-center">
          <SheetTitle className="text-[20px] font-bold tracking-tight">
            Market cap
          </SheetTitle>
        </SheetHeader>
        <div className="px-2 pb-6">
          {capOrder.map((c) => {
            const selected = c === capSize;
            return (
              <button
                key={c}
                onClick={() => onChange(c)}
                className={cn(
                  "w-full flex items-center justify-between rounded-2xl px-3 py-3.5 transition-colors",
                  selected ? "bg-foreground/[0.05]" : "active:bg-muted/40",
                )}
              >
                <span className="text-[16px] font-semibold text-foreground">
                  {capLabels[c]}
                </span>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    selected ? "bg-foreground border-foreground" : "border-border/60",
                  )}
                >
                  {selected && (
                    <Check size={12} strokeWidth={3} className="text-background" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Sort sheet                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_SORT: { key: SortKey; dir: SortDir } = { key: "changePercent", dir: "desc" };

function SortSheet({
  open,
  onOpenChange,
  sortKey,
  sortDir,
  onChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onChange: (k: SortKey, d: SortDir) => void;
}) {
  const [draftKey, setDraftKey] = useState<SortKey>(sortKey);
  const [draftDir, setDraftDir] = useState<SortDir>(sortDir);

  const selectKey = (k: SortKey) => {
    if (k !== draftKey) {
      setDraftKey(k);
      setDraftDir("desc");
    }
  };

  const toggleDir = () =>
    setDraftDir((d) => (d === "desc" ? "asc" : "desc"));

  const reset = () => {
    setDraftKey(DEFAULT_SORT.key);
    setDraftDir(DEFAULT_SORT.dir);
  };

  const apply = () => {
    onChange(draftKey, draftDir);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) {
          setDraftKey(sortKey);
          setDraftDir(sortDir);
        }
      }}
    >
      <SheetContent
        hideClose
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-[28px] p-0 border-0 max-h-[85vh] flex flex-col"
      >
        {/* Header row: title + Reset */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <SheetTitle className="text-[20px] font-bold tracking-tight">
            Sort By
          </SheetTitle>
          <button
            onClick={reset}
            className="text-[15px] font-semibold text-foreground active:opacity-60 transition-opacity"
          >
            Reset
          </button>
        </div>

        {/* Options list with row separators */}
        <div className="flex-1 overflow-y-auto px-5">
          {SORT_OPTIONS.map(({ key, label }, idx) => {
            const selected = draftKey === key;
            return (
              <div key={key}>
                <div className="flex items-center justify-between py-4 min-h-[56px]">
                  <button
                    onClick={() => selectKey(key)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 transition-colors",
                        selected ? "border-foreground" : "border-muted-foreground/40",
                      )}
                    >
                      {selected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[16px] transition-colors",
                        selected
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </button>
                  {selected && (
                    <button
                      onClick={toggleDir}
                      className="flex items-center gap-1.5 text-foreground text-[15px] font-semibold active:opacity-60 transition-opacity"
                    >
                      <span>
                        {draftDir === "asc" ? "Low to High" : "High to Low"}
                      </span>
                      {draftDir === "asc" ? (
                        <ArrowUp size={16} strokeWidth={2.5} />
                      ) : (
                        <ArrowDown size={16} strokeWidth={2.5} />
                      )}
                    </button>
                  )}
                </div>
                {idx < SORT_OPTIONS.length - 1 && (
                  <div className="h-px bg-border/60" />
                )}
              </div>
            );
          })}
        </div>

        {/* Apply button */}
        <div className="shrink-0 px-5 pt-3 pb-5">
          <button
            onClick={apply}
            className="w-full h-14 rounded-2xl bg-foreground text-background text-[16px] font-semibold active:scale-[0.98] transition-transform"
          >
            Apply
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

