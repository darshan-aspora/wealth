"use client";

import { useState, useMemo } from "react";
import {
  Bookmark,
  ChevronRight,
  Globe2,
  ArrowUpDown,
  ArrowDown,
  Landmark,
  Crown,
  Flame,
  Compass,
  Palmtree,
  Play,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StoriesViewer, type Story } from "@/components/stories-viewer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Region =
  | "all"
  | "europe"
  | "asia-pacific"
  | "india"
  | "china-hk"
  | "japan"
  | "uk"
  | "latam"
  | "emerging";

type SortBy = "aum" | "ytd" | "1y" | "expense" | "change";

type MoverType = "gainers" | "losers";

interface GlobalETF {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  aum: string;
  expenseRatio: number;
  ytdReturn: number;
  oneYReturn: number;
  region: Region;
  country: string;
}

/* ------------------------------------------------------------------ */
/*  Sparkline helpers (deterministic per symbol)                       */
/* ------------------------------------------------------------------ */

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function makeSparkline(symbol: string, isGainer: boolean): number[] {
  const seed = hashStr(symbol);
  const pts: number[] = [];
  let v = 50;
  for (let i = 0; i < 52; i++) {
    const r = (Math.sin(seed + i * 127) + 1) / 2;
    v += (r - 0.5 + (isGainer ? 0.12 : -0.12)) * 4;
    v = Math.max(8, Math.min(92, v));
    pts.push(v);
  }
  return pts;
}

function Sparkline({
  points,
  color,
  w = 52,
  h = 22,
}: {
  points: number[];
  color: string;
  w?: number;
  h?: number;
}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Region & Sort config                                               */
/* ------------------------------------------------------------------ */

const regions: { id: Region; label: string }[] = [
  { id: "all", label: "All" },
  { id: "europe", label: "Europe" },
  { id: "asia-pacific", label: "Asia Pacific" },
  { id: "india", label: "India" },
  { id: "china-hk", label: "China/HK" },
  { id: "japan", label: "Japan" },
  { id: "uk", label: "UK" },
  { id: "latam", label: "Latin America" },
  { id: "emerging", label: "Emerging Mkts" },
];

const sortOrder: SortBy[] = ["aum", "ytd", "1y", "expense", "change"];
const sortLabels: Record<SortBy, string> = {
  aum: "By AUM",
  ytd: "By YTD Return",
  "1y": "By 1Y Return",
  expense: "By Expense Ratio",
  change: "By Day Change",
};

/* ------------------------------------------------------------------ */
/*  Mock data — Global ETFs                                            */
/* ------------------------------------------------------------------ */

const globalEtfs: GlobalETF[] = [
  // Europe
  { symbol: "VGK", name: "Vanguard FTSE Europe", price: 68.42, changePercent: 0.85, aum: "22B", expenseRatio: 0.08, ytdReturn: 12.4, oneYReturn: 18.2, region: "europe", country: "Europe" },
  { symbol: "EZU", name: "iShares MSCI Eurozone", price: 51.23, changePercent: 0.62, aum: "7.8B", expenseRatio: 0.49, ytdReturn: 10.8, oneYReturn: 15.6, region: "europe", country: "Eurozone" },
  { symbol: "HEDJ", name: "WisdomTree Europe Hdg", price: 82.15, changePercent: -0.34, aum: "3.2B", expenseRatio: 0.58, ytdReturn: 8.2, oneYReturn: 12.4, region: "europe", country: "Europe" },
  { symbol: "FEZ", name: "SPDR Euro STOXX 50", price: 48.67, changePercent: 0.48, aum: "4.1B", expenseRatio: 0.29, ytdReturn: 11.2, oneYReturn: 16.8, region: "europe", country: "Eurozone" },
  { symbol: "IEUR", name: "iShares Core MSCI EUR", price: 58.34, changePercent: 0.72, aum: "5.6B", expenseRatio: 0.09, ytdReturn: 11.8, oneYReturn: 17.4, region: "europe", country: "Europe" },

  // Asia Pacific
  { symbol: "VPL", name: "Vanguard FTSE Pacific", price: 74.56, changePercent: 0.42, aum: "8.4B", expenseRatio: 0.08, ytdReturn: 7.8, oneYReturn: 11.2, region: "asia-pacific", country: "Asia Pacific" },
  { symbol: "AAXJ", name: "iShares MSCI Asia ex-JP", price: 72.34, changePercent: -0.68, aum: "5.2B", expenseRatio: 0.68, ytdReturn: 4.2, oneYReturn: 8.6, region: "asia-pacific", country: "Asia ex-Japan" },
  { symbol: "EPP", name: "iShares MSCI Pacific", price: 48.92, changePercent: 0.28, aum: "2.8B", expenseRatio: 0.48, ytdReturn: 6.4, oneYReturn: 10.8, region: "asia-pacific", country: "Pacific" },
  { symbol: "IPAC", name: "iShares Core Pacific", price: 62.18, changePercent: 0.36, aum: "4.2B", expenseRatio: 0.09, ytdReturn: 8.2, oneYReturn: 12.4, region: "asia-pacific", country: "Pacific" },

  // India
  { symbol: "INDA", name: "iShares MSCI India", price: 52.78, changePercent: 1.24, aum: "10.2B", expenseRatio: 0.64, ytdReturn: 8.6, oneYReturn: 22.4, region: "india", country: "India" },
  { symbol: "INDY", name: "iShares India 50", price: 48.34, changePercent: 1.08, aum: "1.2B", expenseRatio: 0.89, ytdReturn: 7.2, oneYReturn: 20.8, region: "india", country: "India" },
  { symbol: "SMIN", name: "iShares MSCI India SC", price: 72.45, changePercent: 1.56, aum: "0.8B", expenseRatio: 0.74, ytdReturn: 12.4, oneYReturn: 28.6, region: "india", country: "India" },
  { symbol: "PIN", name: "Invesco India", price: 28.12, changePercent: 0.92, aum: "0.4B", expenseRatio: 0.78, ytdReturn: 6.8, oneYReturn: 18.2, region: "india", country: "India" },
  { symbol: "FLIN", name: "Franklin FTSE India", price: 32.56, changePercent: 1.12, aum: "1.8B", expenseRatio: 0.19, ytdReturn: 9.2, oneYReturn: 24.2, region: "india", country: "India" },

  // China/HK
  { symbol: "FXI", name: "iShares China Large-Cap", price: 28.45, changePercent: -1.24, aum: "6.8B", expenseRatio: 0.74, ytdReturn: -2.4, oneYReturn: 4.2, region: "china-hk", country: "China" },
  { symbol: "MCHI", name: "iShares MSCI China", price: 46.72, changePercent: -0.86, aum: "5.4B", expenseRatio: 0.59, ytdReturn: -1.8, oneYReturn: 6.8, region: "china-hk", country: "China" },
  { symbol: "KWEB", name: "KraneShares China Int", price: 28.34, changePercent: -1.56, aum: "7.2B", expenseRatio: 0.68, ytdReturn: -4.2, oneYReturn: 2.4, region: "china-hk", country: "China" },
  { symbol: "CQQQ", name: "Invesco China Tech", price: 42.18, changePercent: -0.92, aum: "1.8B", expenseRatio: 0.65, ytdReturn: -3.6, oneYReturn: 5.2, region: "china-hk", country: "China" },
  { symbol: "ASHR", name: "Xtrackers CSI 300 China", price: 24.86, changePercent: -0.48, aum: "2.4B", expenseRatio: 0.65, ytdReturn: -0.8, oneYReturn: 8.4, region: "china-hk", country: "China" },

  // Japan
  { symbol: "EWJ", name: "iShares MSCI Japan", price: 72.84, changePercent: 0.68, aum: "14.2B", expenseRatio: 0.50, ytdReturn: 14.2, oneYReturn: 24.6, region: "japan", country: "Japan" },
  { symbol: "DXJ", name: "WisdomTree Japan Hdg", price: 98.56, changePercent: 0.92, aum: "4.8B", expenseRatio: 0.48, ytdReturn: 16.8, oneYReturn: 28.4, region: "japan", country: "Japan" },
  { symbol: "BBJP", name: "JPMorgan BetaBldrs JP", price: 58.42, changePercent: 0.54, aum: "12.6B", expenseRatio: 0.19, ytdReturn: 13.6, oneYReturn: 22.8, region: "japan", country: "Japan" },
  { symbol: "DBJP", name: "Xtrackers MSCI Japan", price: 52.78, changePercent: 0.62, aum: "3.2B", expenseRatio: 0.09, ytdReturn: 14.8, oneYReturn: 25.2, region: "japan", country: "Japan" },
  { symbol: "FLJP", name: "Franklin FTSE Japan", price: 34.18, changePercent: 0.48, aum: "2.6B", expenseRatio: 0.09, ytdReturn: 13.2, oneYReturn: 23.4, region: "japan", country: "Japan" },

  // UK
  { symbol: "EWU", name: "iShares MSCI UK", price: 38.72, changePercent: 0.48, aum: "3.8B", expenseRatio: 0.50, ytdReturn: 8.4, oneYReturn: 12.6, region: "uk", country: "United Kingdom" },
  { symbol: "FLGB", name: "Franklin FTSE UK", price: 28.34, changePercent: 0.34, aum: "0.6B", expenseRatio: 0.09, ytdReturn: 7.8, oneYReturn: 11.2, region: "uk", country: "United Kingdom" },
  { symbol: "FKU", name: "First Trust UK AlphaDEX", price: 42.56, changePercent: 0.58, aum: "0.2B", expenseRatio: 0.80, ytdReturn: 9.2, oneYReturn: 14.8, region: "uk", country: "United Kingdom" },

  // Latin America
  { symbol: "ILF", name: "iShares Latin America", price: 24.56, changePercent: 1.84, aum: "1.4B", expenseRatio: 0.48, ytdReturn: 6.2, oneYReturn: 14.8, region: "latam", country: "Latin America" },
  { symbol: "EWZ", name: "iShares MSCI Brazil", price: 32.18, changePercent: 2.12, aum: "4.2B", expenseRatio: 0.58, ytdReturn: 8.4, oneYReturn: 18.2, region: "latam", country: "Brazil" },
  { symbol: "EWW", name: "iShares MSCI Mexico", price: 52.45, changePercent: 0.68, aum: "1.8B", expenseRatio: 0.50, ytdReturn: -2.8, oneYReturn: 4.6, region: "latam", country: "Mexico" },
  { symbol: "ECH", name: "iShares MSCI Chile", price: 28.92, changePercent: 1.42, aum: "0.5B", expenseRatio: 0.58, ytdReturn: 4.8, oneYReturn: 12.2, region: "latam", country: "Chile" },
  { symbol: "ARGT", name: "Global X MSCI Argentina", price: 58.34, changePercent: 3.24, aum: "0.3B", expenseRatio: 0.59, ytdReturn: 18.6, oneYReturn: 42.8, region: "latam", country: "Argentina" },

  // Emerging Markets
  { symbol: "VWO", name: "Vanguard FTSE EM", price: 44.82, changePercent: -0.42, aum: "82B", expenseRatio: 0.08, ytdReturn: 3.8, oneYReturn: 8.4, region: "emerging", country: "Emerging Mkts" },
  { symbol: "EEM", name: "iShares MSCI EM", price: 42.56, changePercent: -0.68, aum: "18B", expenseRatio: 0.68, ytdReturn: 2.4, oneYReturn: 6.8, region: "emerging", country: "Emerging Mkts" },
  { symbol: "IEMG", name: "iShares Core MSCI EM", price: 54.72, changePercent: -0.34, aum: "78B", expenseRatio: 0.09, ytdReturn: 4.2, oneYReturn: 9.2, region: "emerging", country: "Emerging Mkts" },
  { symbol: "EMQQ", name: "EMQQ EM Internet", price: 32.18, changePercent: -1.12, aum: "0.8B", expenseRatio: 0.86, ytdReturn: -1.8, oneYReturn: 4.6, region: "emerging", country: "Emerging Mkts" },
  { symbol: "SPEM", name: "SPDR Portfolio EM", price: 38.94, changePercent: -0.28, aum: "8.6B", expenseRatio: 0.07, ytdReturn: 4.6, oneYReturn: 9.8, region: "emerging", country: "Emerging Mkts" },
];

/* ------------------------------------------------------------------ */
/*  Sort helper                                                        */
/* ------------------------------------------------------------------ */

function parseAum(s: string): number {
  const n = parseFloat(s);
  return s.includes("B") ? n * 1000 : n;
}

function sortEtfs(etfs: GlobalETF[], sortBy: SortBy): GlobalETF[] {
  const sorted = [...etfs];
  switch (sortBy) {
    case "aum":
      return sorted.sort((a, b) => parseAum(b.aum) - parseAum(a.aum));
    case "ytd":
      return sorted.sort((a, b) => b.ytdReturn - a.ytdReturn);
    case "1y":
      return sorted.sort((a, b) => b.oneYReturn - a.oneYReturn);
    case "expense":
      return sorted.sort((a, b) => a.expenseRatio - b.expenseRatio);
    case "change":
      return sorted.sort((a, b) => b.changePercent - a.changePercent);
    default:
      return sorted;
  }
}

/* ------------------------------------------------------------------ */
/*  Global ETF Movers Widget                                           */
/* ------------------------------------------------------------------ */

const moverRegionLabels: Record<Region, string> = {
  all: "All Regions",
  europe: "Europe",
  "asia-pacific": "Asia Pacific",
  india: "India",
  "china-hk": "China/HK",
  japan: "Japan",
  uk: "UK",
  latam: "Latin America",
  emerging: "Emerging Mkts",
};

const moverRegionOrder: Region[] = ["all", "europe", "asia-pacific", "india", "china-hk", "japan", "uk", "latam", "emerging"];

function GlobalMoversWidget() {
  const [moverType, setMoverType] = useState<MoverType>("gainers");
  const [regionIdx, setRegionIdx] = useState(0);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const currentRegion = moverRegionOrder[regionIdx];

  const etfs = useMemo(() => {
    const filtered = currentRegion === "all"
      ? [...globalEtfs]
      : globalEtfs.filter((e) => e.region === currentRegion);
    return moverType === "gainers"
      ? filtered.sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
      : filtered.sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  }, [moverType, currentRegion]);

  const sparklines = useMemo(
    () =>
      etfs.reduce<Record<string, number[]>>((acc, e) => {
        acc[e.symbol] = makeSparkline(e.symbol, e.changePercent >= 0);
        return acc;
      }, {}),
    [etfs]
  );

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym);
      else n.add(sym);
      return n;
    });

  const cycleRegion = () =>
    setRegionIdx((p) => (p + 1) % moverRegionOrder.length);

  const isGainer = moverType === "gainers";
  const sparkColor = isGainer ? "hsl(var(--gain))" : "hsl(var(--loss))";

  return (
    <div>
      <h2 className="mb-2 text-[18px] font-bold tracking-tight">
        Top Movers
      </h2>

      <div className="flex items-center justify-between mb-2.5">
        <div className="flex gap-2">
          {(["gainers", "losers"] as MoverType[]).map((t) => (
            <button
              key={t}
              onClick={() => setMoverType(t)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                moverType === t
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {t === "gainers" ? "Gainers" : "Losers"}
            </button>
          ))}
        </div>

        <button
          onClick={cycleRegion}
          className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border/60 px-3.5 py-1.5 text-[13px] font-semibold text-foreground transition-all"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={currentRegion}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {moverRegionLabels[currentRegion]}
            </motion.span>
          </AnimatePresence>
          <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />
        </button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${moverType}-${currentRegion}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex border-t border-border/40"
          >
            {/* ---- Frozen left column ---- */}
            <div className="z-10 w-[170px] flex-shrink-0 bg-card shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
              <div className="flex h-[37px] items-center px-5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                ETF
              </div>
              {etfs.map((etf) => (
                <div
                  key={etf.symbol}
                  className="flex h-[56px] items-center border-t border-border/20 px-5"
                >
                  <div className="min-w-0">
                    <p className="max-w-[130px] text-[13px] font-semibold leading-[1.25] line-clamp-1">
                      {etf.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {etf.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ---- Scrollable right columns ---- */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <table style={{ minWidth: 480 }}>
                <thead>
                  <tr className="h-[37px]">
                    <th className="min-w-[80px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Price
                    </th>
                    <th className="min-w-[72px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      % Chg
                    </th>
                    <th className="min-w-[64px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      1D
                    </th>
                    <th className="min-w-[72px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      AUM
                    </th>
                    <th className="min-w-[58px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Exp %
                    </th>
                    <th className="min-w-[72px] px-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      YTD
                    </th>
                    <th className="min-w-[52px] px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {etfs.map((etf) => {
                    const isUp = etf.changePercent >= 0;
                    return (
                      <tr key={etf.symbol} className="h-[56px] border-t border-border/20">
                        <td className="whitespace-nowrap px-3 text-right tabular-nums text-[13px] text-foreground">
                          {etf.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        <td
                          className={cn(
                            "whitespace-nowrap px-3 text-right tabular-nums text-[13px] font-semibold",
                            isUp ? "text-gain" : "text-loss"
                          )}
                        >
                          {isUp ? "+" : ""}
                          {etf.changePercent.toFixed(2)}%
                        </td>

                        <td className="px-3">
                          <div className="flex justify-center">
                            <Sparkline
                              points={sparklines[etf.symbol]}
                              color={sparkColor}
                            />
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-3 text-right tabular-nums text-[13px] text-muted-foreground">
                          {etf.aum}
                        </td>

                        <td className="whitespace-nowrap px-3 text-right tabular-nums text-[13px] text-muted-foreground">
                          {etf.expenseRatio.toFixed(2)}%
                        </td>

                        <td
                          className={cn(
                            "whitespace-nowrap px-3 text-right tabular-nums text-[13px] font-semibold",
                            etf.ytdReturn >= 0 ? "text-gain" : "text-loss"
                          )}
                        >
                          {etf.ytdReturn >= 0 ? "+" : ""}
                          {etf.ytdReturn.toFixed(1)}%
                        </td>

                        <td className="px-3">
                          <div className="flex justify-center">
                            <button
                              onClick={() => toggleBookmark(etf.symbol)}
                              className="flex-shrink-0 transition-transform active:scale-90"
                            >
                              <Bookmark
                                size={16}
                                strokeWidth={1.8}
                                className={cn(
                                  "transition-colors",
                                  bookmarks.has(etf.symbol)
                                    ? "fill-foreground text-foreground"
                                    : "text-muted-foreground/60"
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

        <button className="flex w-full items-center justify-center gap-1 border-t border-border/40 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
          View More
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Top Global ETFs Widget                                             */
/* ------------------------------------------------------------------ */

const MAX_VISIBLE = 10;

function TopGlobalETFsWidget() {
  const [selectedRegion, setSelectedRegion] = useState<Region>("all");
  const [sortBy, setSortBy] = useState<SortBy>("aum");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const etfs = useMemo(() => {
    const filtered =
      selectedRegion === "all"
        ? [...globalEtfs]
        : globalEtfs.filter((e) => e.region === selectedRegion);
    return sortEtfs(filtered, sortBy).slice(0, MAX_VISIBLE);
  }, [selectedRegion, sortBy]);

  const sparklines = useMemo(
    () =>
      etfs.reduce<Record<string, number[]>>((acc, e) => {
        acc[e.symbol] = makeSparkline(e.symbol, e.changePercent >= 0);
        return acc;
      }, {}),
    [etfs]
  );

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym);
      else n.add(sym);
      return n;
    });

  const cycleSortBy = () =>
    setSortBy((p) => sortOrder[(sortOrder.indexOf(p) + 1) % sortOrder.length]);

  const thCls = "px-3 text-[14px] font-medium text-muted-foreground";
  const colW = "w-[calc((min(430px,100vw)-40px-196px-48px)/2)]";

  return (
    <div>
      {/* Title row: title + sort flipper */}
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-[18px] font-bold tracking-tight">
          Top Global ETFs
        </h2>
        <button
          onClick={cycleSortBy}
          className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border/60 px-3.5 py-2 text-[13px] font-semibold text-foreground transition-all"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={sortBy}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {sortLabels[sortBy]}
            </motion.span>
          </AnimatePresence>
          <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />
        </button>
      </div>

      {/* Region pill tabs — scrollable */}
      <div className="-mx-5 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-5 py-0.5">
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r.id)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors",
                selectedRegion === r.id
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {etfs.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card py-16">
          <p className="text-[15px] text-muted-foreground">No ETFs in this region</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden pt-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedRegion}-${sortBy}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              {/* ---- Frozen left column ---- */}
              <div className="z-10 w-[196px] flex-shrink-0 border-r border-border/20 bg-card">
                <div className="flex h-[40px] items-center pl-5 text-[14px] font-medium text-muted-foreground">
                  ETF
                </div>
                {etfs.map((etf) => (
                  <div
                    key={etf.symbol}
                    className="flex h-[64px] items-center gap-2.5 pl-5 pr-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold leading-tight text-foreground">
                        {etf.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {etf.country}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ---- Scrollable right columns ---- */}
              <div className="flex-1 overflow-x-auto no-scrollbar">
                <table className="w-full" style={{ minWidth: 680 }}>
                  <thead>
                    <tr className="h-[40px]">
                      <th className={cn(thCls, colW, "text-right")}>Price</th>
                      <th className={cn(thCls, colW, "text-right")}>
                        <span className="inline-flex items-center justify-end gap-1">
                          {sortBy === "change" && <ArrowDown size={10} className="text-foreground" />}
                          Chg%
                        </span>
                      </th>
                      <th className={cn(thCls, "min-w-[64px] text-center")}>1Y</th>
                      <th className={cn(thCls, "min-w-[72px] text-right")}>
                        <span className="inline-flex items-center justify-end gap-1">
                          {sortBy === "aum" && <ArrowDown size={10} className="text-foreground" />}
                          AUM
                        </span>
                      </th>
                      <th className={cn(thCls, "min-w-[64px] text-right")}>
                        <span className="inline-flex items-center justify-end gap-1">
                          {sortBy === "expense" && <ArrowDown size={10} className="text-foreground" />}
                          Exp%
                        </span>
                      </th>
                      <th className={cn(thCls, "min-w-[72px] text-right")}>
                        <span className="inline-flex items-center justify-end gap-1">
                          {sortBy === "ytd" && <ArrowDown size={10} className="text-foreground" />}
                          YTD
                        </span>
                      </th>
                      <th className={cn(thCls, "min-w-[72px] text-right")}>
                        <span className="inline-flex items-center justify-end gap-1">
                          {sortBy === "1y" && <ArrowDown size={10} className="text-foreground" />}
                          1Y Ret
                        </span>
                      </th>
                      <th className={cn(thCls, "min-w-[48px]")} />
                    </tr>
                  </thead>
                  <tbody>
                    {etfs.map((etf) => {
                      const isUp = etf.changePercent >= 0;
                      return (
                        <tr key={etf.symbol} className="h-[64px] border-t border-border/10">
                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-foreground">
                            {etf.price.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          <td
                            className={cn(
                              "whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-semibold",
                              isUp ? "text-gain" : "text-loss"
                            )}
                          >
                            {isUp ? "+" : ""}
                            {etf.changePercent.toFixed(2)}%
                          </td>

                          <td className="px-3">
                            <div className="flex justify-center">
                              <Sparkline
                                points={sparklines[etf.symbol]}
                                color={isUp ? "hsl(var(--gain))" : "hsl(var(--loss))"}
                              />
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                            {etf.aum}
                          </td>

                          <td className="whitespace-nowrap px-3 text-right tabular-nums text-[14px] text-muted-foreground">
                            {etf.expenseRatio.toFixed(2)}%
                          </td>

                          <td
                            className={cn(
                              "whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-semibold",
                              etf.ytdReturn >= 0 ? "text-gain" : "text-loss"
                            )}
                          >
                            {etf.ytdReturn >= 0 ? "+" : ""}
                            {etf.ytdReturn.toFixed(1)}%
                          </td>

                          <td
                            className={cn(
                              "whitespace-nowrap px-3 text-right tabular-nums text-[14px] font-semibold",
                              etf.oneYReturn >= 0 ? "text-gain" : "text-loss"
                            )}
                          >
                            {etf.oneYReturn >= 0 ? "+" : ""}
                            {etf.oneYReturn.toFixed(1)}%
                          </td>

                          <td className="px-3">
                            <div className="flex justify-center">
                              <button
                                onClick={() => toggleBookmark(etf.symbol)}
                                className="flex-shrink-0 transition-transform active:scale-90"
                              >
                                <Bookmark
                                  size={16}
                                  strokeWidth={1.8}
                                  className={cn(
                                    "transition-colors",
                                    bookmarks.has(etf.symbol)
                                      ? "fill-foreground text-foreground"
                                      : "text-muted-foreground/60"
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

          <button className="flex w-full items-center justify-center gap-1 border-t border-border/40 py-3 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
            View More
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Country Spotlight Cards                                            */
/* ------------------------------------------------------------------ */

interface CountrySpotlight {
  flag: string;
  country: string;
  hook: string;
  stat: string;
  statLabel: string;
  etfs: { symbol: string; name: string; ytd: number }[];
}

const spotlights: CountrySpotlight[] = [
  {
    flag: "🇮🇳",
    country: "India",
    hook: "Fastest growing large economy",
    stat: "+22.4%",
    statLabel: "1Y Return (INDA)",
    etfs: [
      { symbol: "INDA", name: "iShares MSCI India", ytd: 8.6 },
      { symbol: "SMIN", name: "iShares India Small-Cap", ytd: 12.4 },
      { symbol: "INDY", name: "iShares India 50", ytd: 7.2 },
    ],
  },
  {
    flag: "🇧🇷",
    country: "Brazil",
    hook: "Commodity-driven recovery play",
    stat: "+18.2%",
    statLabel: "1Y Return (EWZ)",
    etfs: [
      { symbol: "EWZ", name: "iShares MSCI Brazil", ytd: 8.4 },
      { symbol: "ILF", name: "iShares Latin America 40", ytd: 6.2 },
      { symbol: "FLBR", name: "Franklin FTSE Brazil", ytd: 7.8 },
    ],
  },
  {
    flag: "🇯🇵",
    country: "Japan",
    hook: "Corporate governance reform driving returns",
    stat: "+24.6%",
    statLabel: "1Y Return (EWJ)",
    etfs: [
      { symbol: "EWJ", name: "iShares MSCI Japan", ytd: 14.2 },
      { symbol: "DXJ", name: "WisdomTree Japan Hedged", ytd: 16.8 },
      { symbol: "BBJP", name: "JPMorgan BetaBuilders JP", ytd: 13.6 },
    ],
  },
];

function CountrySpotlightWidget() {
  return (
    <div>
      <h2 className="mb-3 text-[18px] font-bold tracking-tight">
        Country Spotlight
      </h2>
      <div className="space-y-3">
        {spotlights.map((spot) => (
          <div
            key={spot.country}
            className="rounded-2xl border border-border/60 bg-card px-4 py-4 transition-colors active:bg-muted/30"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[24px]">{spot.flag}</span>
                <div>
                  <p className="text-[16px] font-bold text-foreground">
                    {spot.country}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {spot.hook}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[17px] font-bold tabular-nums text-gain">
                  {spot.stat}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {spot.statLabel}
                </p>
              </div>
            </div>

            <div className="space-y-0">
              {spot.etfs.map((etf, i) => (
                <div
                  key={etf.symbol}
                  className={cn(
                    "flex items-center justify-between py-2.5",
                    i < spot.etfs.length - 1 && "border-b border-border/20"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-foreground">
                      {etf.symbol}
                    </span>
                    <span className="text-[13px] text-muted-foreground truncate max-w-[160px]">
                      {etf.name}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[13px] font-semibold tabular-nums",
                      etf.ytd >= 0 ? "text-gain" : "text-loss"
                    )}
                  >
                    {etf.ytd >= 0 ? "+" : ""}
                    {etf.ytd.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Thematic Global Collections                                        */
/* ------------------------------------------------------------------ */

const thematicCollections: { name: string; icon: LucideIcon; color: string; count: number }[] = [
  { name: "Emerging Markets", icon: Flame, color: "#F59E0B", count: 24 },
  { name: "Frontier Markets", icon: Compass, color: "#8B5CF6", count: 8 },
  { name: "Global ex-US", icon: Globe2, color: "#3B82F6", count: 18 },
  { name: "BRICS Nations", icon: Crown, color: "#EF4444", count: 12 },
  { name: "Developed Europe", icon: Landmark, color: "#10B981", count: 15 },
  { name: "Pacific Tigers", icon: Palmtree, color: "#EC4899", count: 10 },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ThematicCollectionsWidget() {
  return (
    <div>
      <h2 className="mb-3 text-[18px] font-bold tracking-tight">
        Thematic Collections
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {thematicCollections.map((col) => (
          <button
            key={col.name}
            className="flex items-center gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5 text-left transition-colors active:scale-[0.98]"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
              <col.icon size={18} strokeWidth={1.7} className="text-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-tight text-foreground">
                {col.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {col.count} ETFs
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Why Go Global? — Carousel Cards + Stories                          */
/* ------------------------------------------------------------------ */

interface GlobalStoryCard {
  id: string;
  title: string;
  subtitle: string;
  hook: string;
  gradient: string;
  textGradient: string;
  duration: string;
  story: Story;
}

const globalStoryCards: GlobalStoryCard[] = [
  {
    id: "diversification",
    title: "The 40% You\u2019re Missing",
    subtitle: "Diversification",
    hook: "US stocks are only 60% of the world. The rest could be your edge.",
    gradient: "from-zinc-600 to-zinc-900",
    textGradient: "text-zinc-300",
    duration: "2 min",
    story: {
      id: "global-diversification",
      title: "Diversification",
      subtitle: "Why go global",
      icon: <Globe2 size={18} />,
      gradient: "from-zinc-800 to-zinc-950",
      timestamp: "",
      renderContent: () => (
        <div className="flex flex-col items-center gap-8 px-2 text-center">
          <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
            The other <span className="text-zinc-300">40%.</span>
          </div>
          <div className="h-px w-12 bg-white/15" />
          <div className="flex items-baseline gap-2">
            <span className="text-[56px] font-bold tracking-tight text-zinc-300">40%</span>
            <span className="text-[15px] text-white/40">of global market cap</span>
          </div>
          <p className="text-[16px] leading-relaxed text-white/50">
            US stocks dominate your portfolio. But 40% of the world&apos;s market cap sits outside America &mdash; Europe, Asia, Latin America, emerging markets.
          </p>
          <div className="w-full space-y-2.5">
            {[
              { label: "Different cycles", desc: "When the US dips, other economies often rise" },
              { label: "Currency diversification", desc: "Not all your eggs in the dollar basket" },
              { label: "Valuation gaps", desc: "International stocks often trade cheaper than US peers" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/8 px-4 py-3 text-left">
                <p className="text-[15px] font-semibold text-white">{item.label}</p>
                <p className="text-[13px] text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  },
  {
    id: "currency",
    title: "The Dollar Effect",
    subtitle: "Currency & FX",
    hook: "When the dollar moves, your global returns move with it. Here\u2019s how.",
    gradient: "from-neutral-600 to-neutral-900",
    textGradient: "text-neutral-300",
    duration: "3 min",
    story: {
      id: "global-currency",
      title: "Currency & FX",
      subtitle: "Understanding risk",
      icon: <Landmark size={18} />,
      gradient: "from-neutral-800 to-neutral-950",
      timestamp: "",
      renderContent: () => (
        <div className="flex flex-col items-center gap-8 px-2 text-center">
          <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
            The <span className="text-neutral-300">dollar</span> effect.
          </div>
          <div className="h-px w-12 bg-white/15" />
          <p className="text-[16px] leading-relaxed text-white/50">
            A strong dollar eats into international returns. A weak dollar amplifies them. It&apos;s the invisible force behind every global trade.
          </p>
          <div className="w-full space-y-2.5">
            {[
              { icon: "\u2191", label: "Dollar strengthens", effect: "Your international ETFs lose value in USD terms" },
              { icon: "\u2193", label: "Dollar weakens", effect: "Your international ETFs gain an extra tailwind" },
              { icon: "\u2194", label: "Want to neutralize?", effect: "Use hedged ETFs like HEDJ, DXJ, DBEU" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3 text-left">
                <span className="text-[20px] font-bold mt-0.5 text-white/60">{item.icon}</span>
                <div>
                  <p className="text-[15px] font-semibold text-white">{item.label}</p>
                  <p className="text-[13px] text-white/40">{item.effect}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[14px] text-white/30">Long-term? Currency effects tend to wash out. Short-term? They matter a lot.</p>
        </div>
      ),
    },
  },
  {
    id: "timezone",
    title: "Markets Never Sleep",
    subtitle: "Time Zones",
    hook: "While you sleep, Asian and European markets are pricing in the next move.",
    gradient: "from-stone-600 to-stone-900",
    textGradient: "text-stone-300",
    duration: "2 min",
    story: {
      id: "global-timezone",
      title: "Time Zones",
      subtitle: "24/5 markets",
      icon: <Compass size={18} />,
      gradient: "from-stone-800 to-stone-950",
      timestamp: "",
      renderContent: () => (
        <div className="flex flex-col items-center gap-8 px-2 text-center">
          <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
            Markets <span className="text-stone-300">never</span> sleep.
          </div>
          <div className="h-px w-12 bg-white/15" />
          <div className="w-full space-y-1.5">
            {[
              { market: "Tokyo / Shanghai", hours: "7:00 PM \u2013 4:00 AM ET", flag: "\ud83c\uddef\ud83c\uddf5 \ud83c\udde8\ud83c\uddf3" },
              { market: "Mumbai", hours: "11:15 PM \u2013 5:45 AM ET", flag: "\ud83c\uddee\ud83c\uddf3" },
              { market: "London / Frankfurt", hours: "3:00 AM \u2013 11:30 AM ET", flag: "\ud83c\uddec\ud83c\udde7 \ud83c\udde9\ud83c\uddea" },
              { market: "S\u00e3o Paulo", hours: "10:00 AM \u2013 4:00 PM ET", flag: "\ud83c\udde7\ud83c\uddf7" },
              { market: "New York", hours: "9:30 AM \u2013 4:00 PM ET", flag: "\ud83c\uddfa\ud83c\uddf8" },
            ].map((item) => (
              <div key={item.market} className="flex items-center justify-between rounded-xl bg-white/8 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[16px]">{item.flag}</span>
                  <span className="text-[15px] font-semibold text-white">{item.market}</span>
                </div>
                <span className="text-[13px] tabular-nums text-white/50">{item.hours}</span>
              </div>
            ))}
          </div>
          <p className="text-[15px] leading-relaxed text-white/45">
            Global events get priced in before the US opens. International ETFs let you be there when it happens.
          </p>
        </div>
      ),
    },
  },
  {
    id: "em-vs-dm",
    title: "Risk vs Reward",
    subtitle: "EM vs Developed",
    hook: "India and Japan are both \u201cinternational\u201d but they\u2019re nothing alike. Know the spectrum.",
    gradient: "from-gray-600 to-gray-900",
    textGradient: "text-gray-300",
    duration: "3 min",
    story: {
      id: "global-em-dm",
      title: "EM vs Developed",
      subtitle: "Risk spectrum",
      icon: <Flame size={18} />,
      gradient: "from-gray-800 to-gray-950",
      timestamp: "",
      renderContent: () => (
        <div className="flex flex-col items-center gap-8 px-2 text-center">
          <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
            Risk <span className="text-gray-300">&amp;</span> reward.
          </div>
          <div className="h-px w-12 bg-white/15" />
          <div className="w-full space-y-3">
            <div className="rounded-2xl bg-white/8 px-4 py-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2.5 w-2.5 rounded-full bg-white/70" />
                <span className="text-[14px] font-bold text-white/70">Developed Markets</span>
              </div>
              <p className="text-[14px] text-white/50">Europe, Japan, UK, Australia. Lower growth, more stability, better corporate governance. The steady hand.</p>
              <p className="mt-2 text-[13px] text-white/30">ETFs: VGK, EWJ, EWU, VPL</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2.5 w-2.5 rounded-full bg-white/50" />
                <span className="text-[14px] font-bold text-white/50">Emerging Markets</span>
              </div>
              <p className="text-[14px] text-white/50">India, Brazil, China, Mexico. Higher growth potential, more volatility, currency risk. The growth engine.</p>
              <p className="mt-2 text-[13px] text-white/30">ETFs: INDA, EWZ, FXI, VWO</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2.5 w-2.5 rounded-full bg-white/30" />
                <span className="text-[14px] font-bold text-white/30">Frontier Markets</span>
              </div>
              <p className="text-[14px] text-white/50">Vietnam, Nigeria, Kenya. Earliest stage, highest risk, smallest allocation. The long shot with asymmetric upside.</p>
              <p className="mt-2 text-[13px] text-white/30">ETFs: FM, FRN, VNM</p>
            </div>
          </div>
        </div>
      ),
    },
  },
  {
    id: "india-deep-dive",
    title: "India: The Decade Ahead",
    subtitle: "Country Deep Dive",
    hook: "1.4B people, a booming middle class, and the world\u2019s fastest GDP growth. Here\u2019s the case.",
    gradient: "from-zinc-500 to-zinc-900",
    textGradient: "text-zinc-300",
    duration: "3 min",
    story: {
      id: "global-india",
      title: "India Deep Dive",
      subtitle: "Country spotlight",
      icon: <Flame size={18} />,
      gradient: "from-zinc-800 to-zinc-950",
      timestamp: "",
      renderContent: () => (
        <div className="flex flex-col items-center gap-8 px-2 text-center">
          <div className="text-[48px]">{"\ud83c\uddee\ud83c\uddf3"}</div>
          <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
            The <span className="text-zinc-300">India</span> decade.
          </div>
          <div className="h-px w-12 bg-white/15" />
          <div className="flex gap-6">
            <div>
              <p className="text-[28px] font-bold text-white/80">7.2%</p>
              <p className="text-[12px] text-white/40">GDP growth</p>
            </div>
            <div>
              <p className="text-[28px] font-bold text-white/80">1.4B</p>
              <p className="text-[12px] text-white/40">Population</p>
            </div>
            <div>
              <p className="text-[28px] font-bold text-white/80">28</p>
              <p className="text-[12px] text-white/40">Median age</p>
            </div>
          </div>
          <p className="text-[16px] leading-relaxed text-white/50">
            Young demographics. Digital-first economy. Manufacturing shifting from China. India is where China was 15 years ago &mdash; but with smartphones.
          </p>
          <div className="w-full space-y-2">
            {[
              { symbol: "INDA", name: "iShares MSCI India", ret: "+22.4% 1Y" },
              { symbol: "SMIN", name: "iShares India Small-Cap", ret: "+28.6% 1Y" },
              { symbol: "FLIN", name: "Franklin FTSE India", ret: "+24.2% 1Y" },
            ].map((etf) => (
              <div key={etf.symbol} className="flex items-center justify-between rounded-xl bg-white/8 px-4 py-3">
                <div className="text-left">
                  <p className="text-[14px] font-bold text-white">{etf.symbol}</p>
                  <p className="text-[12px] text-white/35">{etf.name}</p>
                </div>
                <span className="text-[14px] font-semibold text-white/60">{etf.ret}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  },
  {
    id: "japan-revival",
    title: "Japan\u2019s Quiet Revival",
    subtitle: "Country Deep Dive",
    hook: "Corporate reforms, Warren Buffett\u2019s bet, and a weak yen powering exports. Japan is back.",
    gradient: "from-neutral-500 to-neutral-900",
    textGradient: "text-neutral-300",
    duration: "3 min",
    story: {
      id: "global-japan",
      title: "Japan Revival",
      subtitle: "Country spotlight",
      icon: <Crown size={18} />,
      gradient: "from-neutral-800 to-neutral-950",
      timestamp: "",
      renderContent: () => (
        <div className="flex flex-col items-center gap-8 px-2 text-center">
          <div className="text-[48px]">{"\ud83c\uddef\ud83c\uddf5"}</div>
          <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
            Japan is <span className="text-neutral-300">back.</span>
          </div>
          <div className="h-px w-12 bg-white/15" />
          <div className="flex gap-6">
            <div>
              <p className="text-[28px] font-bold text-white/80">+28%</p>
              <p className="text-[12px] text-white/40">Nikkei 1Y</p>
            </div>
            <div>
              <p className="text-[28px] font-bold text-white/80">34Y</p>
              <p className="text-[12px] text-white/40">New all-time high</p>
            </div>
          </div>
          <p className="text-[16px] leading-relaxed text-white/50">
            After decades of stagnation, Japan&apos;s corporate governance revolution is unlocking shareholder value. Buffett bought in. The Nikkei hit all-time highs. Exports are booming on a weak yen.
          </p>
          <div className="w-full space-y-2">
            {[
              { symbol: "EWJ", name: "iShares MSCI Japan", ret: "+24.6% 1Y" },
              { symbol: "DXJ", name: "WisdomTree Japan Hedged", ret: "+28.4% 1Y" },
              { symbol: "BBJP", name: "JPMorgan BetaBuilders", ret: "+22.8% 1Y" },
            ].map((etf) => (
              <div key={etf.symbol} className="flex items-center justify-between rounded-xl bg-white/8 px-4 py-3">
                <div className="text-left">
                  <p className="text-[14px] font-bold text-white">{etf.symbol}</p>
                  <p className="text-[12px] text-white/35">{etf.name}</p>
                </div>
                <span className="text-[14px] font-semibold text-white/60">{etf.ret}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  },
];

function WhyGoGlobalWidget() {
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const storyList: Story[] = globalStoryCards.map((c) => c.story);

  return (
    <div>
      <h2 className="mb-1 text-[18px] font-bold tracking-tight">
        Why Go Global?
      </h2>
      <p className="mb-3 text-[14px] text-muted-foreground">
        Stories to help you think beyond the S&P 500
      </p>

      <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
        <div className="flex gap-3" style={{ width: "max-content" }}>
          {globalStoryCards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => {
                setStoryIndex(i);
                setStoryOpen(true);
              }}
              className="relative flex w-[200px] flex-shrink-0 flex-col justify-between overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.97]"
              style={{ height: 260 }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-b ${card.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Play button */}
              <div className="relative z-10 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Play size={16} fill="white" className="text-white ml-0.5" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-1.5">
                  {card.subtitle}
                </p>
                <p className="text-[17px] font-bold leading-tight text-white mb-1.5">
                  {card.title}
                </p>
                <p className="text-[12px] leading-snug text-white/50 line-clamp-2">
                  {card.hook}
                </p>
                <p className="mt-2 text-[11px] font-medium text-white/30">
                  {card.duration} read
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <StoriesViewer
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        initialIndex={storyIndex}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Export                                                         */
/* ------------------------------------------------------------------ */

export function GlobalETFFundedNotTraded() {
  return (
    <div className="space-y-8 px-5 pt-5 pb-4">
      <GlobalMoversWidget />
      <WhyGoGlobalWidget />
      <TopGlobalETFsWidget />
      <CountrySpotlightWidget />
    </div>
  );
}
