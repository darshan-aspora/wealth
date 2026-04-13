"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  PopularETFsWidget,
  TopMoversWidget,
  ExploreByThemesWidget,
  type ETF,
  type EtfCategory,
  type MoverType,
  type PopularETF,
} from "@/app/explore/versions/etf-funded-not-traded";

/* ------------------------------------------------------------------ */
/*  Region tabs                                                        */
/* ------------------------------------------------------------------ */

type RegionTabId =
  | "all"
  | "europe"
  | "india"
  | "china"
  | "japan"
  | "emerging"
  | "uk"
  | "latam";

const regionsList: { id: RegionTabId; label: string; short: string; flag: string }[] = [
  { id: "all", label: "All", short: "All", flag: "🌐" },
  { id: "europe", label: "Europe", short: "EU", flag: "🇪🇺" },
  { id: "india", label: "India", short: "IN", flag: "🇮🇳" },
  { id: "china", label: "China", short: "CN", flag: "🇨🇳" },
  { id: "japan", label: "Japan", short: "JP", flag: "🇯🇵" },
  { id: "emerging", label: "Emerging", short: "EM", flag: "🌏" },
  { id: "uk", label: "UK", short: "UK", flag: "🇬🇧" },
  { id: "latam", label: "Latin America", short: "LATAM", flag: "🌎" },
];

function RegionFlagTiles({
  active,
  onChange,
}: {
  active: RegionTabId;
  onChange: (id: RegionTabId) => void;
}) {
  return (
    <div className="-mx-5 overflow-x-auto no-scrollbar">
      <div className="flex gap-2.5 px-5 py-1">
        {regionsList.map((r) => (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            className={cn(
              "shrink-0 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all",
              "w-[76px] h-[76px]",
              active === r.id
                ? "bg-foreground text-background shadow-[0_6px_20px_-6px_rgba(0,0,0,0.25)] scale-[1.03]"
                : "bg-muted/50 text-muted-foreground active:bg-muted"
            )}
          >
            <span className="text-[22px] leading-none">{r.flag}</span>
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider",
                active === r.id ? "text-background" : "text-foreground/60"
              )}
            >
              {r.short}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Promo Banner (tap to cycle mode)                                   */
/* ------------------------------------------------------------------ */

type BannerMode = "strip" | "strip-full" | "big" | "big-full" | "hero" | "hero-full";
const bannerOrder: BannerMode[] = ["strip", "strip-full", "big", "big-full", "hero", "hero-full"];

const bannerLabels: Record<BannerMode, string> = {
  strip: "Thin Banner",
  "strip-full": "Thin Banner · End to End",
  big: "Big Banner",
  "big-full": "Big Banner · End to End",
  hero: "Hero Banner",
  "hero-full": "Hero Banner · End to End",
};

function PromoBanner() {
  const [mode, setMode] = useState<BannerMode>("big");

  const cycle = () =>
    setMode((p) => bannerOrder[(bannerOrder.indexOf(p) + 1) % bannerOrder.length]);

  const label = bannerLabels[mode];
  const isFull = mode.endsWith("-full");

  const heights: Record<string, string> = {
    strip: "py-3.5",
    "strip-full": "py-3.5",
    big: "py-16",
    "big-full": "py-16",
    hero: "py-40",
    "hero-full": "py-40",
  };

  return (
    <button
      onClick={cycle}
      className={cn(
        "flex w-full items-center justify-center bg-muted transition-all active:scale-[0.99]",
        heights[mode],
        isFull ? "-mx-5 w-[calc(100%+2.5rem)]" : "rounded-2xl"
      )}
    >
      <p className="text-[14px] font-semibold text-muted-foreground">{label}</p>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Popular ETF data per region                                        */
/* ------------------------------------------------------------------ */

const regionPopularETFs: Record<RegionTabId, PopularETF[]> = {
  all: [
    { name: "Vanguard Total World", symbol: "VT", return3y: 8.2, aum: "38B", expenseRatio: 0.07, trackingError: 0.03 },
    { name: "Vanguard FTSE All-World ex-US", symbol: "VEU", return3y: 6.4, aum: "62B", expenseRatio: 0.07, trackingError: 0.04 },
    { name: "iShares MSCI ACWI ex U.S.", symbol: "ACWX", return3y: 5.8, aum: "5.2B", expenseRatio: 0.32, trackingError: 0.08 },
    { name: "Vanguard Total Intl Stock", symbol: "VXUS", return3y: 6.2, aum: "65B", expenseRatio: 0.07, trackingError: 0.03 },
    { name: "iShares Core MSCI EAFE", symbol: "IEFA", return3y: 7.1, aum: "112B", expenseRatio: 0.07, trackingError: 0.02 },
    { name: "SPDR Portfolio Developed ex-US", symbol: "SPDW", return3y: 6.8, aum: "18B", expenseRatio: 0.03, trackingError: 0.03 },
  ],
  europe: [
    { name: "Vanguard FTSE Europe", symbol: "VGK", return3y: 7.2, aum: "20B", expenseRatio: 0.09, trackingError: 0.04 },
    { name: "iShares Core MSCI Europe", symbol: "IEUR", return3y: 7.4, aum: "6.2B", expenseRatio: 0.09, trackingError: 0.03 },
    { name: "iShares MSCI EMU", symbol: "EZU", return3y: 6.8, aum: "8B", expenseRatio: 0.51, trackingError: 0.06 },
    { name: "SPDR Euro STOXX 50", symbol: "FEZ", return3y: 6.1, aum: "4B", expenseRatio: 0.29, trackingError: 0.05 },
    { name: "WisdomTree Europe Hedged", symbol: "HEDJ", return3y: 9.2, aum: "1.8B", expenseRatio: 0.58, trackingError: 0.12 },
    { name: "iShares MSCI Germany", symbol: "EWG", return3y: 5.4, aum: "1.6B", expenseRatio: 0.50, trackingError: 0.08 },
  ],
  india: [
    { name: "iShares MSCI India", symbol: "INDA", return3y: 11.8, aum: "9B", expenseRatio: 0.64, trackingError: 0.14 },
    { name: "WisdomTree India Earnings", symbol: "EPI", return3y: 13.2, aum: "3.4B", expenseRatio: 0.85, trackingError: 0.22 },
    { name: "Franklin FTSE India", symbol: "FLIN", return3y: 12.4, aum: "1.8B", expenseRatio: 0.19, trackingError: 0.08 },
    { name: "iShares India 50", symbol: "INDY", return3y: 10.2, aum: "1.2B", expenseRatio: 0.93, trackingError: 0.18 },
    { name: "Columbia India Consumer", symbol: "INCO", return3y: 14.6, aum: "0.3B", expenseRatio: 0.75, trackingError: 0.24 },
    { name: "iShares MSCI India Small-Cap", symbol: "SMIN", return3y: 15.8, aum: "0.9B", expenseRatio: 0.76, trackingError: 0.28 },
  ],
  china: [
    { name: "iShares MSCI China", symbol: "MCHI", return3y: -3.2, aum: "5B", expenseRatio: 0.58, trackingError: 0.18 },
    { name: "iShares China Large-Cap", symbol: "FXI", return3y: -4.4, aum: "6.2B", expenseRatio: 0.74, trackingError: 0.24 },
    { name: "Xtrackers CSI 300", symbol: "ASHR", return3y: -1.8, aum: "2.8B", expenseRatio: 0.65, trackingError: 0.22 },
    { name: "KraneShares CSI Internet", symbol: "KWEB", return3y: -8.6, aum: "4.4B", expenseRatio: 0.69, trackingError: 0.32 },
    { name: "Invesco China Technology", symbol: "CQQQ", return3y: -5.2, aum: "0.6B", expenseRatio: 0.70, trackingError: 0.28 },
    { name: "KraneShares MSCI China A", symbol: "KBA", return3y: -2.4, aum: "0.4B", expenseRatio: 0.60, trackingError: 0.20 },
  ],
  japan: [
    { name: "iShares MSCI Japan", symbol: "EWJ", return3y: 8.4, aum: "14B", expenseRatio: 0.50, trackingError: 0.06 },
    { name: "WisdomTree Japan Hedged", symbol: "DXJ", return3y: 12.6, aum: "5.2B", expenseRatio: 0.48, trackingError: 0.14 },
    { name: "JPMorgan BetaBuilders Japan", symbol: "BBJP", return3y: 8.2, aum: "8.4B", expenseRatio: 0.19, trackingError: 0.04 },
    { name: "Franklin FTSE Japan", symbol: "FLJP", return3y: 8.1, aum: "1.4B", expenseRatio: 0.09, trackingError: 0.03 },
    { name: "iShares Currency Hedged Japan", symbol: "HEWJ", return3y: 11.4, aum: "1.8B", expenseRatio: 0.50, trackingError: 0.10 },
    { name: "iShares MSCI Japan Small-Cap", symbol: "SCJ", return3y: 6.2, aum: "0.3B", expenseRatio: 0.49, trackingError: 0.09 },
  ],
  emerging: [
    { name: "Vanguard FTSE Emerging", symbol: "VWO", return3y: 2.8, aum: "82B", expenseRatio: 0.08, trackingError: 0.04 },
    { name: "iShares MSCI Emerging", symbol: "EEM", return3y: 2.4, aum: "18B", expenseRatio: 0.68, trackingError: 0.12 },
    { name: "iShares Core MSCI EM", symbol: "IEMG", return3y: 3.2, aum: "78B", expenseRatio: 0.09, trackingError: 0.03 },
    { name: "Schwab EM Equity", symbol: "SCHE", return3y: 2.6, aum: "8.4B", expenseRatio: 0.11, trackingError: 0.05 },
    { name: "iShares MSCI EM ex China", symbol: "EMXC", return3y: 6.8, aum: "12B", expenseRatio: 0.25, trackingError: 0.08 },
    { name: "iShares MSCI EM Min Vol", symbol: "EEMV", return3y: 4.4, aum: "4.2B", expenseRatio: 0.25, trackingError: 0.06 },
  ],
  uk: [
    { name: "iShares MSCI United Kingdom", symbol: "EWU", return3y: 6.4, aum: "2.8B", expenseRatio: 0.50, trackingError: 0.08 },
    { name: "Franklin FTSE UK", symbol: "FLGB", return3y: 6.8, aum: "0.5B", expenseRatio: 0.09, trackingError: 0.04 },
    { name: "First Trust UK AlphaDEX", symbol: "FKU", return3y: 5.2, aum: "0.3B", expenseRatio: 0.80, trackingError: 0.14 },
    { name: "iShares Currency Hedged UK", symbol: "HEWU", return3y: 8.1, aum: "0.1B", expenseRatio: 0.50, trackingError: 0.10 },
    { name: "iShares MSCI UK Small-Cap", symbol: "EWUS", return3y: 3.8, aum: "0.3B", expenseRatio: 0.59, trackingError: 0.12 },
    { name: "SPDR Portfolio Developed World", symbol: "SPDW", return3y: 6.8, aum: "18B", expenseRatio: 0.03, trackingError: 0.03 },
  ],
  latam: [
    { name: "iShares Latin America 40", symbol: "ILF", return3y: 4.2, aum: "2.1B", expenseRatio: 0.48, trackingError: 0.14 },
    { name: "iShares MSCI Brazil", symbol: "EWZ", return3y: 3.4, aum: "4.2B", expenseRatio: 0.58, trackingError: 0.22 },
    { name: "iShares MSCI Mexico", symbol: "EWW", return3y: 8.6, aum: "2.4B", expenseRatio: 0.50, trackingError: 0.12 },
    { name: "Global X MSCI Argentina", symbol: "ARGT", return3y: 18.4, aum: "0.6B", expenseRatio: 0.59, trackingError: 0.32 },
    { name: "iShares MSCI Chile", symbol: "ECH", return3y: 2.2, aum: "0.4B", expenseRatio: 0.58, trackingError: 0.16 },
    { name: "Global X MSCI Colombia", symbol: "GXG", return3y: -1.4, aum: "0.1B", expenseRatio: 0.61, trackingError: 0.24 },
  ],
};

/* ------------------------------------------------------------------ */
/*  Mover data per region — derived from a flat list of region ETFs   */
/* ------------------------------------------------------------------ */

const regionETFPool: Record<RegionTabId, ETF[]> = {
  all: [
    { symbol: "VT", name: "Vanguard Total World", price: 118.45, changePercent: 0.82, volume: "4.2M", aum: "$38B", expenseRatio: 0.07, yield: 2.20, high52w: 122.0, low52w: 98.4, color: "#1A5276" },
    { symbol: "VEU", name: "Vanguard FTSE All-World ex-US", price: 62.18, changePercent: 0.62, volume: "3.8M", aum: "$62B", expenseRatio: 0.07, yield: 3.10, high52w: 64.5, low52w: 52.8, color: "#8B1A1A" },
    { symbol: "ACWX", name: "iShares MSCI ACWI ex U.S.", price: 58.32, changePercent: 0.41, volume: "2.4M", aum: "$5.2B", expenseRatio: 0.32, yield: 2.80, high52w: 60.2, low52w: 52.4, color: "#333333" },
    { symbol: "VXUS", name: "Vanguard Total Intl Stock", price: 58.34, changePercent: -0.42, volume: "4.2M", aum: "$65B", expenseRatio: 0.07, yield: 2.95, high52w: 62.8, low52w: 52.1, color: "#8B1A1A" },
    { symbol: "IEFA", name: "iShares Core MSCI EAFE", price: 72.56, changePercent: 1.24, volume: "8.2M", aum: "$112B", expenseRatio: 0.07, yield: 2.82, high52w: 76.2, low52w: 62.5, color: "#333333" },
    { symbol: "SPDW", name: "SPDR Portfolio Developed ex-US", price: 38.72, changePercent: -1.14, volume: "1.8M", aum: "$18B", expenseRatio: 0.03, yield: 3.20, high52w: 42.0, low52w: 32.4, color: "#CC0000" },
    { symbol: "VEA", name: "Vanguard FTSE Developed", price: 52.18, changePercent: 0.68, volume: "4.8M", aum: "$118B", expenseRatio: 0.05, yield: 2.90, high52w: 54.2, low52w: 44.5, color: "#8B1A1A" },
    { symbol: "EFA", name: "iShares MSCI EAFE", price: 78.56, changePercent: -1.87, volume: "18.4M", aum: "$52B", expenseRatio: 0.32, yield: 2.82, high52w: 84.2, low52w: 68.5, color: "#333333" },
  ],
  europe: [
    { symbol: "VGK", name: "Vanguard FTSE Europe", price: 68.45, changePercent: 1.24, volume: "4.2M", aum: "$20B", expenseRatio: 0.09, yield: 3.20, high52w: 72.0, low52w: 58.5, color: "#1A5276" },
    { symbol: "IEUR", name: "iShares Core MSCI Europe", price: 58.12, changePercent: 1.42, volume: "2.1M", aum: "$6.2B", expenseRatio: 0.09, yield: 3.10, high52w: 60.5, low52w: 48.2, color: "#333333" },
    { symbol: "EZU", name: "iShares MSCI EMU", price: 52.34, changePercent: 0.82, volume: "3.8M", aum: "$8B", expenseRatio: 0.51, yield: 2.90, high52w: 55.2, low52w: 42.6, color: "#0033CC" },
    { symbol: "FEZ", name: "SPDR Euro STOXX 50", price: 48.22, changePercent: -0.54, volume: "1.8M", aum: "$4B", expenseRatio: 0.29, yield: 3.40, high52w: 52.0, low52w: 40.4, color: "#333333" },
    { symbol: "EUFN", name: "iShares MSCI Europe Financials", price: 25.34, changePercent: -1.82, volume: "0.9M", aum: "$2B", expenseRatio: 0.48, yield: 4.10, high52w: 27.5, low52w: 20.1, color: "#003087" },
    { symbol: "HEDJ", name: "WisdomTree Europe Hedged", price: 82.45, changePercent: 2.14, volume: "1.2M", aum: "$1.8B", expenseRatio: 0.58, yield: 2.80, high52w: 85.0, low52w: 72.8, color: "#008080" },
    { symbol: "EWG", name: "iShares MSCI Germany", price: 32.18, changePercent: -0.92, volume: "2.4M", aum: "$1.6B", expenseRatio: 0.50, yield: 3.30, high52w: 34.5, low52w: 28.2, color: "#CC0000" },
    { symbol: "EWQ", name: "iShares MSCI France", price: 42.28, changePercent: 1.68, volume: "0.8M", aum: "$0.9B", expenseRatio: 0.50, yield: 2.80, high52w: 44.5, low52w: 36.2, color: "#0055A4" },
  ],
  india: [
    { symbol: "INDA", name: "iShares MSCI India", price: 52.32, changePercent: 2.41, volume: "5.8M", aum: "$9B", expenseRatio: 0.64, yield: 0.80, high52w: 55.2, low52w: 42.8, color: "#FF9933" },
    { symbol: "EPI", name: "WisdomTree India Earnings", price: 42.18, changePercent: 3.12, volume: "3.2M", aum: "$3.4B", expenseRatio: 0.85, yield: 1.20, high52w: 44.5, low52w: 32.8, color: "#138808" },
    { symbol: "FLIN", name: "Franklin FTSE India", price: 44.32, changePercent: 2.18, volume: "1.5M", aum: "$1.8B", expenseRatio: 0.19, yield: 0.90, high52w: 46.2, low52w: 35.8, color: "#000080" },
    { symbol: "INDY", name: "iShares India 50", price: 48.72, changePercent: 1.82, volume: "1.8M", aum: "$1.2B", expenseRatio: 0.93, yield: 1.00, high52w: 51.0, low52w: 38.4, color: "#FF6600" },
    { symbol: "SMIN", name: "iShares MSCI India Small-Cap", price: 68.45, changePercent: -1.42, volume: "0.6M", aum: "$0.9B", expenseRatio: 0.76, yield: 0.50, high52w: 78.2, low52w: 52.4, color: "#8B4513" },
    { symbol: "INCO", name: "Columbia India Consumer", price: 58.22, changePercent: 1.64, volume: "0.3M", aum: "$0.3B", expenseRatio: 0.75, yield: 0.80, high52w: 62.0, low52w: 46.8, color: "#B8860B" },
    { symbol: "INDL", name: "Direxion Daily India Bull 2X", price: 128.45, changePercent: 4.82, volume: "2.4M", aum: "$0.4B", expenseRatio: 1.24, yield: 0.20, high52w: 142.0, low52w: 82.4, color: "#8B1A1A" },
    { symbol: "GLIN", name: "VanEck India Growth", price: 38.72, changePercent: 2.12, volume: "0.2M", aum: "$0.1B", expenseRatio: 0.78, yield: 0.60, high52w: 42.0, low52w: 28.4, color: "#006400" },
  ],
  china: [
    { symbol: "MCHI", name: "iShares MSCI China", price: 48.34, changePercent: -2.82, volume: "12.4M", aum: "$5B", expenseRatio: 0.58, yield: 1.80, high52w: 58.2, low52w: 38.4, color: "#DE2910" },
    { symbol: "FXI", name: "iShares China Large-Cap", price: 28.45, changePercent: -3.24, volume: "18.6M", aum: "$6.2B", expenseRatio: 0.74, yield: 2.40, high52w: 34.5, low52w: 22.8, color: "#CC0000" },
    { symbol: "ASHR", name: "Xtrackers CSI 300", price: 32.18, changePercent: 1.22, volume: "4.2M", aum: "$2.8B", expenseRatio: 0.65, yield: 2.20, high52w: 38.4, low52w: 26.5, color: "#FF6600" },
    { symbol: "KWEB", name: "KraneShares CSI Internet", price: 32.45, changePercent: 3.42, volume: "15.6M", aum: "$4.4B", expenseRatio: 0.69, yield: 0.80, high52w: 38.2, low52w: 22.4, color: "#FFB800" },
    { symbol: "CQQQ", name: "Invesco China Technology", price: 38.72, changePercent: 2.84, volume: "1.8M", aum: "$0.6B", expenseRatio: 0.70, yield: 0.60, high52w: 42.0, low52w: 28.4, color: "#9400D3" },
    { symbol: "YINN", name: "Direxion Daily FTSE China Bull 3X", price: 22.34, changePercent: -8.42, volume: "6.8M", aum: "$0.8B", expenseRatio: 1.38, yield: 0.40, high52w: 38.4, low52w: 14.2, color: "#8B0000" },
    { symbol: "KBA", name: "KraneShares MSCI China A", price: 24.18, changePercent: 0.84, volume: "0.4M", aum: "$0.4B", expenseRatio: 0.60, yield: 1.60, high52w: 28.0, low52w: 20.2, color: "#8B4513" },
    { symbol: "PGJ", name: "Invesco Golden Dragon China", price: 32.45, changePercent: -1.48, volume: "0.6M", aum: "$0.2B", expenseRatio: 0.70, yield: 0.90, high52w: 38.4, low52w: 24.2, color: "#DAA520" },
  ],
  japan: [
    { symbol: "EWJ", name: "iShares MSCI Japan", price: 72.34, changePercent: 0.82, volume: "14.2M", aum: "$14B", expenseRatio: 0.50, yield: 1.80, high52w: 76.0, low52w: 62.4, color: "#BC002D" },
    { symbol: "DXJ", name: "WisdomTree Japan Hedged", price: 112.45, changePercent: 2.44, volume: "3.8M", aum: "$5.2B", expenseRatio: 0.48, yield: 2.20, high52w: 118.0, low52w: 88.4, color: "#333333" },
    { symbol: "BBJP", name: "JPMorgan BetaBuilders Japan", price: 62.18, changePercent: 0.64, volume: "1.2M", aum: "$8.4B", expenseRatio: 0.19, yield: 1.60, high52w: 65.0, low52w: 52.4, color: "#0033CC" },
    { symbol: "HEWJ", name: "iShares Currency Hedged Japan", price: 42.45, changePercent: 1.42, volume: "2.4M", aum: "$1.8B", expenseRatio: 0.50, yield: 1.90, high52w: 44.8, low52w: 36.2, color: "#8B1A1A" },
    { symbol: "FLJP", name: "Franklin FTSE Japan", price: 32.34, changePercent: 0.92, volume: "0.8M", aum: "$1.4B", expenseRatio: 0.09, yield: 2.10, high52w: 34.2, low52w: 27.8, color: "#228B22" },
    { symbol: "SCJ", name: "iShares MSCI Japan Small-Cap", price: 48.72, changePercent: -0.62, volume: "0.4M", aum: "$0.3B", expenseRatio: 0.49, yield: 2.40, high52w: 52.0, low52w: 42.4, color: "#8B4513" },
    { symbol: "EWV", name: "ProShares Ultra MSCI Japan", price: 68.45, changePercent: 1.84, volume: "0.2M", aum: "$0.2B", expenseRatio: 0.95, yield: 0.80, high52w: 72.0, low52w: 56.4, color: "#6B3410" },
    { symbol: "GSJY", name: "Goldman Sachs ActiveBeta Japan", price: 58.22, changePercent: -1.22, volume: "0.1M", aum: "$0.1B", expenseRatio: 0.25, yield: 1.70, high52w: 62.0, low52w: 50.4, color: "#4B0082" },
  ],
  emerging: [
    { symbol: "VWO", name: "Vanguard FTSE EM", price: 42.18, changePercent: -1.22, volume: "18.4M", aum: "$82B", expenseRatio: 0.08, yield: 3.10, high52w: 46.5, low52w: 37.8, color: "#8B1A1A" },
    { symbol: "EEM", name: "iShares MSCI EM", price: 40.23, changePercent: -1.44, volume: "42.6M", aum: "$18B", expenseRatio: 0.68, yield: 2.40, high52w: 44.8, low52w: 36.2, color: "#333333" },
    { symbol: "IEMG", name: "iShares Core MSCI EM", price: 52.45, changePercent: -1.12, volume: "12.8M", aum: "$78B", expenseRatio: 0.09, yield: 2.80, high52w: 56.2, low52w: 46.8, color: "#003087" },
    { symbol: "SCHE", name: "Schwab EM Equity", price: 28.34, changePercent: -1.32, volume: "2.4M", aum: "$8.4B", expenseRatio: 0.11, yield: 3.20, high52w: 30.8, low52w: 25.4, color: "#1A5276" },
    { symbol: "EMXC", name: "iShares MSCI EM ex China", price: 58.72, changePercent: 1.82, volume: "1.8M", aum: "$12B", expenseRatio: 0.25, yield: 2.90, high52w: 62.0, low52w: 48.4, color: "#006400" },
    { symbol: "FM", name: "iShares MSCI Frontier 100", price: 32.18, changePercent: 2.12, volume: "0.2M", aum: "$0.6B", expenseRatio: 0.79, yield: 4.80, high52w: 34.0, low52w: 26.8, color: "#B8860B" },
    { symbol: "EEMV", name: "iShares MSCI EM Min Vol", price: 58.32, changePercent: 0.42, volume: "0.8M", aum: "$4.2B", expenseRatio: 0.25, yield: 3.40, high52w: 62.0, low52w: 52.4, color: "#4169E1" },
    { symbol: "ASHS", name: "Xtrackers Harvest CSI 500 China A", price: 22.18, changePercent: -2.84, volume: "0.4M", aum: "$0.2B", expenseRatio: 0.65, yield: 1.40, high52w: 28.0, low52w: 18.4, color: "#8B0000" },
  ],
  uk: [
    { symbol: "EWU", name: "iShares MSCI United Kingdom", price: 34.12, changePercent: 1.24, volume: "4.8M", aum: "$2.8B", expenseRatio: 0.50, yield: 3.80, high52w: 36.2, low52w: 28.4, color: "#012169" },
    { symbol: "FLGB", name: "Franklin FTSE UK", price: 32.45, changePercent: 0.84, volume: "0.4M", aum: "$0.5B", expenseRatio: 0.09, yield: 3.60, high52w: 34.8, low52w: 27.8, color: "#C8102E" },
    { symbol: "FKU", name: "First Trust UK AlphaDEX", price: 48.72, changePercent: 0.42, volume: "0.2M", aum: "$0.3B", expenseRatio: 0.80, yield: 2.90, high52w: 52.0, low52w: 42.8, color: "#800020" },
    { symbol: "HEWU", name: "iShares Currency Hedged UK", price: 28.34, changePercent: 1.82, volume: "0.2M", aum: "$0.1B", expenseRatio: 0.50, yield: 3.50, high52w: 30.2, low52w: 24.6, color: "#003366" },
    { symbol: "EWUS", name: "iShares MSCI UK Small-Cap", price: 42.18, changePercent: -1.44, volume: "0.1M", aum: "$0.3B", expenseRatio: 0.59, yield: 4.20, high52w: 46.8, low52w: 36.4, color: "#8B4513" },
    { symbol: "DGT", name: "SPDR Global Dow", price: 148.45, changePercent: 0.62, volume: "0.3M", aum: "$0.5B", expenseRatio: 0.50, yield: 2.10, high52w: 152.0, low52w: 128.4, color: "#333333" },
    { symbol: "URNM", name: "Sprott Uranium Miners", price: 48.72, changePercent: -0.54, volume: "0.4M", aum: "$1.8B", expenseRatio: 0.83, yield: 0.30, high52w: 58.0, low52w: 40.2, color: "#FFD700" },
    { symbol: "GWX", name: "SPDR Intl Small Cap", price: 32.45, changePercent: 1.12, volume: "0.2M", aum: "$0.4B", expenseRatio: 0.40, yield: 2.80, high52w: 34.8, low52w: 28.2, color: "#4B0082" },
  ],
  latam: [
    { symbol: "ILF", name: "iShares Latin America 40", price: 24.32, changePercent: -2.42, volume: "4.8M", aum: "$2.1B", expenseRatio: 0.48, yield: 4.20, high52w: 28.2, low52w: 20.4, color: "#009B3A" },
    { symbol: "EWZ", name: "iShares MSCI Brazil", price: 28.45, changePercent: -2.84, volume: "12.6M", aum: "$4.2B", expenseRatio: 0.58, yield: 5.40, high52w: 34.2, low52w: 24.6, color: "#FFDF00" },
    { symbol: "EWW", name: "iShares MSCI Mexico", price: 58.32, changePercent: 1.42, volume: "4.2M", aum: "$2.4B", expenseRatio: 0.50, yield: 2.10, high52w: 62.0, low52w: 48.4, color: "#006847" },
    { symbol: "ECH", name: "iShares MSCI Chile", price: 28.72, changePercent: -1.82, volume: "0.4M", aum: "$0.4B", expenseRatio: 0.58, yield: 3.20, high52w: 32.4, low52w: 24.8, color: "#D52B1E" },
    { symbol: "ARGT", name: "Global X MSCI Argentina", price: 68.34, changePercent: 4.82, volume: "0.6M", aum: "$0.6B", expenseRatio: 0.59, yield: 0.80, high52w: 72.0, low52w: 38.4, color: "#75AADB" },
    { symbol: "GXG", name: "Global X MSCI Colombia", price: 22.45, changePercent: -2.14, volume: "0.1M", aum: "$0.1B", expenseRatio: 0.61, yield: 4.80, high52w: 26.2, low52w: 18.4, color: "#FCD116" },
    { symbol: "EPU", name: "iShares MSCI Peru", price: 32.18, changePercent: 2.12, volume: "0.2M", aum: "$0.1B", expenseRatio: 0.58, yield: 3.10, high52w: 34.0, low52w: 26.4, color: "#D91023" },
    { symbol: "EWZS", name: "iShares MSCI Brazil Small-Cap", price: 18.34, changePercent: -3.22, volume: "0.2M", aum: "$0.1B", expenseRatio: 0.58, yield: 4.60, high52w: 22.8, low52w: 14.6, color: "#8B4513" },
  ],
};

function parseVol(v: string): number {
  const n = parseFloat(v);
  if (v.toUpperCase().includes("M")) return n * 1e6;
  if (v.toUpperCase().includes("K")) return n * 1e3;
  return n;
}

function buildMoverData(pool: ETF[]): Record<MoverType, Record<EtfCategory, ETF[]>> {
  const gainers = [...pool].sort((a, b) => b.changePercent - a.changePercent);
  const losers = [...pool].sort((a, b) => a.changePercent - b.changePercent);
  const mostActive = [...pool].sort((a, b) => parseVol(b.volume) - parseVol(a.volume));
  const nearHigh = [...pool].sort((a, b) => b.price / b.high52w - a.price / a.high52w);
  const nearLow = [...pool].sort((a, b) => a.price / a.low52w - b.price / b.low52w);

  const fanOut = (list: ETF[]): Record<EtfCategory, ETF[]> => ({
    broad: list,
    sector: list,
    bond: list,
  });

  return {
    gainers: fanOut(gainers),
    losers: fanOut(losers),
    "most-active": fanOut(mostActive),
    "near-52w-high": fanOut(nearHigh),
    "near-52w-low": fanOut(nearLow),
  };
}

/* ------------------------------------------------------------------ */
/*  Unique themes per region                                          */
/* ------------------------------------------------------------------ */

const regionThemes: Record<
  RegionTabId,
  { tabs: { id: string; label: string }[]; data: Record<string, PopularETF[]> }
> = {
  all: {
    tabs: [
      { id: "global-tech", label: "Global Tech" },
      { id: "frontier", label: "Frontier Markets" },
      { id: "dollar-hedged", label: "Dollar-Hedged" },
    ],
    data: {
      "global-tech": [
        { name: "First Trust Nasdaq Cybersecurity", symbol: "CIBR", return3y: 11.4, aum: "6.8B", expenseRatio: 0.60, trackingError: 0.12 },
        { name: "Global X Cloud Computing", symbol: "CLOU", return3y: 6.8, aum: "0.7B", expenseRatio: 0.68, trackingError: 0.14 },
        { name: "iShares Global Tech", symbol: "IXN", return3y: 14.8, aum: "4.2B", expenseRatio: 0.41, trackingError: 0.08 },
        { name: "Invesco S&P Global Info Tech", symbol: "IPK", return3y: 12.8, aum: "1.4B", expenseRatio: 0.40, trackingError: 0.10 },
      ],
      frontier: [
        { name: "iShares MSCI Frontier 100", symbol: "FM", return3y: 3.8, aum: "0.6B", expenseRatio: 0.79, trackingError: 0.22 },
        { name: "Global X Nigeria", symbol: "NGE", return3y: 1.2, aum: "0.1B", expenseRatio: 0.78, trackingError: 0.28 },
        { name: "VanEck Africa Index", symbol: "AFK", return3y: 2.4, aum: "0.1B", expenseRatio: 0.79, trackingError: 0.24 },
        { name: "Global X MSCI Pakistan", symbol: "PAK", return3y: -5.4, aum: "0.02B", expenseRatio: 0.89, trackingError: 0.36 },
      ],
      "dollar-hedged": [
        { name: "WisdomTree Europe Hedged", symbol: "HEDJ", return3y: 9.2, aum: "1.8B", expenseRatio: 0.58, trackingError: 0.12 },
        { name: "WisdomTree Japan Hedged", symbol: "DXJ", return3y: 12.6, aum: "5.2B", expenseRatio: 0.48, trackingError: 0.14 },
        { name: "iShares Currency Hedged EAFE", symbol: "HEFA", return3y: 10.4, aum: "3.2B", expenseRatio: 0.35, trackingError: 0.10 },
        { name: "iShares Currency Hedged EM", symbol: "HEEM", return3y: 4.8, aum: "0.6B", expenseRatio: 0.70, trackingError: 0.18 },
      ],
    },
  },
  europe: {
    tabs: [
      { id: "german-exporters", label: "German Exporters" },
      { id: "nordic-esg", label: "Nordic ESG" },
      { id: "luxury", label: "European Luxury" },
    ],
    data: {
      "german-exporters": [
        { name: "iShares MSCI Germany", symbol: "EWG", return3y: 5.4, aum: "1.6B", expenseRatio: 0.50, trackingError: 0.08 },
        { name: "iShares Currency Hedged Germany", symbol: "HEWG", return3y: 7.8, aum: "0.2B", expenseRatio: 0.53, trackingError: 0.12 },
        { name: "First Trust Germany AlphaDEX", symbol: "FGM", return3y: 4.8, aum: "0.1B", expenseRatio: 0.80, trackingError: 0.14 },
        { name: "Franklin FTSE Germany", symbol: "FLGR", return3y: 5.2, aum: "0.2B", expenseRatio: 0.09, trackingError: 0.06 },
      ],
      "nordic-esg": [
        { name: "iShares MSCI Sweden", symbol: "EWD", return3y: 4.8, aum: "0.4B", expenseRatio: 0.50, trackingError: 0.10 },
        { name: "iShares MSCI Denmark", symbol: "EDEN", return3y: 9.4, aum: "0.2B", expenseRatio: 0.53, trackingError: 0.12 },
        { name: "iShares MSCI Norway", symbol: "ENOR", return3y: 3.2, aum: "0.1B", expenseRatio: 0.53, trackingError: 0.14 },
        { name: "iShares MSCI Finland", symbol: "EFNL", return3y: 2.4, aum: "0.08B", expenseRatio: 0.53, trackingError: 0.16 },
      ],
      luxury: [
        { name: "Tema Luxury", symbol: "LUX", return3y: 6.8, aum: "0.1B", expenseRatio: 0.75, trackingError: 0.22 },
        { name: "iShares MSCI France", symbol: "EWQ", return3y: 7.2, aum: "0.9B", expenseRatio: 0.50, trackingError: 0.08 },
        { name: "iShares MSCI Italy", symbol: "EWI", return3y: 9.8, aum: "0.5B", expenseRatio: 0.50, trackingError: 0.10 },
        { name: "iShares MSCI Switzerland", symbol: "EWL", return3y: 6.4, aum: "1.6B", expenseRatio: 0.50, trackingError: 0.07 },
      ],
    },
  },
  india: {
    tabs: [
      { id: "consumer", label: "Consumer Rising" },
      { id: "midcap", label: "Mid & Small Cap" },
      { id: "banking", label: "Banking" },
    ],
    data: {
      consumer: [
        { name: "Columbia India Consumer", symbol: "INCO", return3y: 14.6, aum: "0.3B", expenseRatio: 0.75, trackingError: 0.24 },
        { name: "WisdomTree India Earnings", symbol: "EPI", return3y: 13.2, aum: "3.4B", expenseRatio: 0.85, trackingError: 0.22 },
        { name: "VanEck India Growth", symbol: "GLIN", return3y: 12.8, aum: "0.1B", expenseRatio: 0.78, trackingError: 0.26 },
        { name: "iShares MSCI India", symbol: "INDA", return3y: 11.8, aum: "9B", expenseRatio: 0.64, trackingError: 0.14 },
      ],
      midcap: [
        { name: "iShares MSCI India Small-Cap", symbol: "SMIN", return3y: 15.8, aum: "0.9B", expenseRatio: 0.76, trackingError: 0.28 },
        { name: "iShares MSCI India Mid-Cap", symbol: "INDY", return3y: 13.4, aum: "0.6B", expenseRatio: 0.65, trackingError: 0.20 },
        { name: "Franklin FTSE India", symbol: "FLIN", return3y: 12.4, aum: "1.8B", expenseRatio: 0.19, trackingError: 0.08 },
        { name: "iShares Core MSCI EM", symbol: "IEMG", return3y: 3.2, aum: "78B", expenseRatio: 0.09, trackingError: 0.03 },
      ],
      banking: [
        { name: "iShares MSCI India", symbol: "INDA", return3y: 11.8, aum: "9B", expenseRatio: 0.64, trackingError: 0.14 },
        { name: "WisdomTree India Earnings", symbol: "EPI", return3y: 13.2, aum: "3.4B", expenseRatio: 0.85, trackingError: 0.22 },
        { name: "Columbia India Consumer", symbol: "INCO", return3y: 14.6, aum: "0.3B", expenseRatio: 0.75, trackingError: 0.24 },
        { name: "iShares India 50", symbol: "INDY", return3y: 10.2, aum: "1.2B", expenseRatio: 0.93, trackingError: 0.18 },
      ],
    },
  },
  china: {
    tabs: [
      { id: "internet", label: "Internet Giants" },
      { id: "a-shares", label: "A-Shares" },
      { id: "policy", label: "Policy Plays" },
    ],
    data: {
      internet: [
        { name: "KraneShares CSI Internet", symbol: "KWEB", return3y: -8.6, aum: "4.4B", expenseRatio: 0.69, trackingError: 0.32 },
        { name: "Invesco China Technology", symbol: "CQQQ", return3y: -5.2, aum: "0.6B", expenseRatio: 0.70, trackingError: 0.28 },
        { name: "Invesco Golden Dragon China", symbol: "PGJ", return3y: -7.2, aum: "0.2B", expenseRatio: 0.70, trackingError: 0.32 },
        { name: "Global X MSCI China Consumer", symbol: "CHIQ", return3y: -6.4, aum: "0.2B", expenseRatio: 0.65, trackingError: 0.30 },
      ],
      "a-shares": [
        { name: "Xtrackers CSI 300", symbol: "ASHR", return3y: -1.8, aum: "2.8B", expenseRatio: 0.65, trackingError: 0.22 },
        { name: "KraneShares MSCI China A", symbol: "KBA", return3y: -2.4, aum: "0.4B", expenseRatio: 0.60, trackingError: 0.20 },
        { name: "Xtrackers CSI 500 Small Cap", symbol: "ASHS", return3y: -3.8, aum: "0.2B", expenseRatio: 0.65, trackingError: 0.26 },
        { name: "Franklin FTSE China", symbol: "FLCH", return3y: -4.2, aum: "0.2B", expenseRatio: 0.19, trackingError: 0.18 },
      ],
      policy: [
        { name: "iShares China Large-Cap", symbol: "FXI", return3y: -4.4, aum: "6.2B", expenseRatio: 0.74, trackingError: 0.24 },
        { name: "iShares MSCI China", symbol: "MCHI", return3y: -3.2, aum: "5B", expenseRatio: 0.58, trackingError: 0.18 },
        { name: "Global X MSCI China Financials", symbol: "CHIX", return3y: -1.8, aum: "0.05B", expenseRatio: 0.65, trackingError: 0.20 },
        { name: "Global X MSCI China Energy", symbol: "CHIE", return3y: 2.8, aum: "0.02B", expenseRatio: 0.65, trackingError: 0.24 },
      ],
    },
  },
  japan: {
    tabs: [
      { id: "governance", label: "Corporate Governance" },
      { id: "currency-hedged", label: "Currency Hedged" },
      { id: "dividend", label: "Dividend Aristocrats" },
    ],
    data: {
      governance: [
        { name: "WisdomTree Japan Hedged", symbol: "DXJ", return3y: 12.6, aum: "5.2B", expenseRatio: 0.48, trackingError: 0.14 },
        { name: "iShares MSCI Japan", symbol: "EWJ", return3y: 8.4, aum: "14B", expenseRatio: 0.50, trackingError: 0.06 },
        { name: "JPMorgan BetaBuilders Japan", symbol: "BBJP", return3y: 8.2, aum: "8.4B", expenseRatio: 0.19, trackingError: 0.04 },
        { name: "Franklin FTSE Japan", symbol: "FLJP", return3y: 8.1, aum: "1.4B", expenseRatio: 0.09, trackingError: 0.03 },
      ],
      "currency-hedged": [
        { name: "iShares Currency Hedged Japan", symbol: "HEWJ", return3y: 11.4, aum: "1.8B", expenseRatio: 0.50, trackingError: 0.10 },
        { name: "WisdomTree Japan Hedged", symbol: "DXJ", return3y: 12.6, aum: "5.2B", expenseRatio: 0.48, trackingError: 0.14 },
        { name: "WisdomTree Japan Hedged SmallCap", symbol: "DXJS", return3y: 6.8, aum: "0.3B", expenseRatio: 0.58, trackingError: 0.18 },
        { name: "WisdomTree Japan Hedged Capital Goods", symbol: "DXJC", return3y: 9.4, aum: "0.08B", expenseRatio: 0.43, trackingError: 0.14 },
      ],
      dividend: [
        { name: "WisdomTree Japan Hedged SmallCap", symbol: "DXJS", return3y: 6.8, aum: "0.3B", expenseRatio: 0.58, trackingError: 0.18 },
        { name: "iShares MSCI Japan", symbol: "EWJ", return3y: 8.4, aum: "14B", expenseRatio: 0.50, trackingError: 0.06 },
        { name: "WisdomTree Japan Hedged", symbol: "DXJ", return3y: 12.6, aum: "5.2B", expenseRatio: 0.48, trackingError: 0.14 },
        { name: "iShares MSCI Japan Small-Cap", symbol: "SCJ", return3y: 6.2, aum: "0.3B", expenseRatio: 0.49, trackingError: 0.09 },
      ],
    },
  },
  emerging: {
    tabs: [
      { id: "ex-china", label: "EM ex China" },
      { id: "min-vol", label: "Minimum Volatility" },
      { id: "frontier", label: "Frontier" },
    ],
    data: {
      "ex-china": [
        { name: "iShares MSCI EM ex China", symbol: "EMXC", return3y: 6.8, aum: "12B", expenseRatio: 0.25, trackingError: 0.08 },
        { name: "Columbia EM Consumer", symbol: "ECON", return3y: 5.2, aum: "0.1B", expenseRatio: 0.59, trackingError: 0.14 },
        { name: "iShares Core MSCI EM", symbol: "IEMG", return3y: 3.2, aum: "78B", expenseRatio: 0.09, trackingError: 0.03 },
        { name: "Schwab EM Equity", symbol: "SCHE", return3y: 2.6, aum: "8.4B", expenseRatio: 0.11, trackingError: 0.05 },
      ],
      "min-vol": [
        { name: "iShares MSCI EM Min Vol", symbol: "EEMV", return3y: 4.4, aum: "4.2B", expenseRatio: 0.25, trackingError: 0.06 },
        { name: "Invesco S&P EM Low Vol", symbol: "EELV", return3y: 3.8, aum: "0.3B", expenseRatio: 0.29, trackingError: 0.08 },
        { name: "Vanguard FTSE EM", symbol: "VWO", return3y: 2.8, aum: "82B", expenseRatio: 0.08, trackingError: 0.04 },
        { name: "iShares MSCI EM", symbol: "EEM", return3y: 2.4, aum: "18B", expenseRatio: 0.68, trackingError: 0.12 },
      ],
      frontier: [
        { name: "iShares MSCI Frontier 100", symbol: "FM", return3y: 3.8, aum: "0.6B", expenseRatio: 0.79, trackingError: 0.22 },
        { name: "Global X Nigeria", symbol: "NGE", return3y: 1.2, aum: "0.1B", expenseRatio: 0.78, trackingError: 0.28 },
        { name: "Global X MSCI Pakistan", symbol: "PAK", return3y: -5.4, aum: "0.02B", expenseRatio: 0.89, trackingError: 0.36 },
        { name: "VanEck Vietnam", symbol: "VNM", return3y: 4.2, aum: "0.4B", expenseRatio: 0.66, trackingError: 0.24 },
      ],
    },
  },
  uk: {
    tabs: [
      { id: "ftse-100", label: "FTSE 100 Dividend" },
      { id: "smallcap", label: "UK Small Cap" },
      { id: "resources", label: "Resources & Energy" },
    ],
    data: {
      "ftse-100": [
        { name: "iShares MSCI United Kingdom", symbol: "EWU", return3y: 6.4, aum: "2.8B", expenseRatio: 0.50, trackingError: 0.08 },
        { name: "Franklin FTSE UK", symbol: "FLGB", return3y: 6.8, aum: "0.5B", expenseRatio: 0.09, trackingError: 0.04 },
        { name: "iShares Currency Hedged UK", symbol: "HEWU", return3y: 8.1, aum: "0.1B", expenseRatio: 0.50, trackingError: 0.10 },
        { name: "First Trust UK AlphaDEX", symbol: "FKU", return3y: 5.2, aum: "0.3B", expenseRatio: 0.80, trackingError: 0.14 },
      ],
      smallcap: [
        { name: "iShares MSCI UK Small-Cap", symbol: "EWUS", return3y: 3.8, aum: "0.3B", expenseRatio: 0.59, trackingError: 0.12 },
        { name: "SPDR Intl Small Cap", symbol: "GWX", return3y: 5.4, aum: "0.4B", expenseRatio: 0.40, trackingError: 0.10 },
        { name: "Vanguard FTSE Developed", symbol: "VEA", return3y: 6.4, aum: "118B", expenseRatio: 0.05, trackingError: 0.03 },
        { name: "iShares MSCI EAFE Small-Cap", symbol: "SCZ", return3y: 4.8, aum: "10B", expenseRatio: 0.39, trackingError: 0.08 },
      ],
      resources: [
        { name: "Sprott Uranium Miners", symbol: "URNM", return3y: 8.2, aum: "1.8B", expenseRatio: 0.83, trackingError: 0.24 },
        { name: "iShares MSCI United Kingdom", symbol: "EWU", return3y: 6.4, aum: "2.8B", expenseRatio: 0.50, trackingError: 0.08 },
        { name: "First Trust UK AlphaDEX", symbol: "FKU", return3y: 5.2, aum: "0.3B", expenseRatio: 0.80, trackingError: 0.14 },
        { name: "SPDR Global Dow", symbol: "DGT", return3y: 6.2, aum: "0.5B", expenseRatio: 0.50, trackingError: 0.08 },
      ],
    },
  },
  latam: {
    tabs: [
      { id: "brazil", label: "Brazil Commodities" },
      { id: "mexico", label: "Mexico Nearshoring" },
      { id: "andean", label: "Andean Mining" },
    ],
    data: {
      brazil: [
        { name: "iShares MSCI Brazil", symbol: "EWZ", return3y: 3.4, aum: "4.2B", expenseRatio: 0.58, trackingError: 0.22 },
        { name: "iShares MSCI Brazil Small-Cap", symbol: "EWZS", return3y: 1.8, aum: "0.1B", expenseRatio: 0.58, trackingError: 0.26 },
        { name: "VanEck Brazil Small-Cap", symbol: "BRF", return3y: 2.2, aum: "0.06B", expenseRatio: 0.60, trackingError: 0.28 },
        { name: "iShares Latin America 40", symbol: "ILF", return3y: 4.2, aum: "2.1B", expenseRatio: 0.48, trackingError: 0.14 },
      ],
      mexico: [
        { name: "iShares MSCI Mexico", symbol: "EWW", return3y: 8.6, aum: "2.4B", expenseRatio: 0.50, trackingError: 0.12 },
        { name: "Franklin FTSE Mexico", symbol: "FLMX", return3y: 9.2, aum: "0.2B", expenseRatio: 0.19, trackingError: 0.08 },
        { name: "iShares Currency Hedged Mexico", symbol: "HEWW", return3y: 7.8, aum: "0.05B", expenseRatio: 0.54, trackingError: 0.14 },
        { name: "iShares Latin America 40", symbol: "ILF", return3y: 4.2, aum: "2.1B", expenseRatio: 0.48, trackingError: 0.14 },
      ],
      andean: [
        { name: "iShares MSCI Chile", symbol: "ECH", return3y: 2.2, aum: "0.4B", expenseRatio: 0.58, trackingError: 0.16 },
        { name: "iShares MSCI Peru", symbol: "EPU", return3y: 1.8, aum: "0.1B", expenseRatio: 0.58, trackingError: 0.18 },
        { name: "Global X MSCI Colombia", symbol: "GXG", return3y: -1.4, aum: "0.1B", expenseRatio: 0.61, trackingError: 0.24 },
        { name: "Global X MSCI Argentina", symbol: "ARGT", return3y: 18.4, aum: "0.6B", expenseRatio: 0.59, trackingError: 0.32 },
      ],
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Page Export                                                         */
/* ------------------------------------------------------------------ */

const regionTitle: Record<RegionTabId, string> = {
  all: "Global",
  europe: "European",
  india: "Indian",
  china: "Chinese",
  japan: "Japanese",
  emerging: "Emerging Market",
  uk: "UK",
  latam: "Latin American",
};

export function GlobalETFFundedNotTraded() {
  const [region, setRegion] = useState<RegionTabId>("all");

  const popularEtfs = regionPopularETFs[region];
  const moverData = useMemo(() => buildMoverData(regionETFPool[region]), [region]);
  const themes = regionThemes[region];
  const label = regionTitle[region];

  return (
    <div className="space-y-8 px-5 pt-5 pb-4">
      <PromoBanner />
      <RegionFlagTiles active={region} onChange={setRegion} />
      <PopularETFsWidget
        title={`Popular ${label} ETFs`}
        subtitle={`Most invested ${label} ETFs by Aspora members`}
        etfs={popularEtfs}
        showInvestTypePills={false}
      />
      <TopMoversWidget
        title={`${label} Top Movers`}
        moverData={moverData}
        hideCategoryFlipper
      />
      <ExploreByThemesWidget
        title="Explore by Unique Themes"
        subtitle={`Stand-out narratives from ${label} markets`}
        tabs={themes.tabs}
        themeData={themes.data}
      />
    </div>
  );
}
