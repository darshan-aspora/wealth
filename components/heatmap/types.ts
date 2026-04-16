/* ================================================================== */
/*  Shared types for the full-screen heatmap page                       */
/* ================================================================== */

export type HeatmapIndexId =
  | "sp500"
  | "nasdaq100"
  | "dow30"
  | "russell2000";

export interface HeatmapIndexDef {
  id: HeatmapIndexId;
  label: string;
  shortLabel: string; // compact tab label
}

export type SectorId =
  | "tech"
  | "finance"
  | "health"
  | "consumer-disc"
  | "consumer-stpl"
  | "comm-svcs"
  | "industrials"
  | "energy"
  | "utilities"
  | "real-estate"
  | "materials";

export interface SectorDef {
  id: SectorId;
  label: string;
  shortLabel: string;
}

/** Rich mock data — every field needed by every lens */
export interface HeatmapStock {
  symbol: string;
  name: string;
  price: number;
  marketCap: number; // in billions — used as a weighting basis
  weight: number; // weight in its parent index (0..100)
  sector: SectorId;

  // Intraday
  chg1h: number; // past hour %
  chg4h: number; // past 4 hours %
  preMarket: number; // pre-market change %
  postMarket: number; // after-hours change %
  gap: number; // opening gap from prior close %

  // Period returns (pct)
  chg1d: number; // today
  chg1w: number; // 1 week
  chg1m: number; // 1 month
  chg3m: number; // 3 months
  chg6m: number; // 6 months
  chgYtd: number; // YTD
  chg1y: number; // 1 year

  // Volume (shares in millions)
  volume: number; // today
  volume1w: number; // aggregate past week
  volume1m: number; // aggregate past month
  avgVolume30d: number; // 30-day avg per day

  // 52w
  high52w: number;
  low52w: number;

  // Volatility (realized, annualized pct)
  volatility: number;

  // RSI (14d)
  rsi: number;

  // Sector-relative strength: stock's 1M return minus its sector's 1M return
  relStrength: number;

  // Boolean flags
  earningsSoon: boolean;
  newHigh52w: boolean;
  newLow52w: boolean;
  upgradeOrDowngrade: boolean;

  // Light context (for the peek sheet)
  headline: string;
}

export interface SectorSlice {
  id: SectorId;
  label: string;
  weight: number; // aggregate weight in parent index
  chg1h: number;
  chg4h: number;
  preMarket: number;
  postMarket: number;
  gap: number;
  chg1d: number;
  chg1w: number;
  chg1m: number;
  chg3m: number;
  chg6m: number;
  chgYtd: number;
  chg1y: number;
  avgVolume30d: number;
  volume: number;
  volume1w: number;
  volume1m: number;
  volatility: number;
  rsi: number;
  relStrength: number;
  marketCap: number;
}

/* ================================================================== */
/*  Lens — what drives size and color                                   */
/* ================================================================== */

export type SizeAxis =
  | "marketCap"
  | "volume1d"
  | "volume1w"
  | "volume1m"
  | "turnover1d"
  | "turnover1w"
  | "turnover1m"
  | "mono";

export type ColorAxis =
  | "chg1h"
  | "chg4h"
  | "chg1d"
  | "perfW"
  | "perfM"
  | "perf3M"
  | "perf6M"
  | "perfYTD"
  | "perfY"
  | "preMarket"
  | "postMarket"
  | "relVolume"
  | "volatilityD"
  | "gap";

export type GroupBy = "none" | "sector";

export interface LensDef {
  size: SizeAxis;
  color: ColorAxis;
  showWatchlistRing: boolean;
  showBadges: boolean;
}

export const DEFAULT_LENS: LensDef = {
  size: "marketCap",
  color: "chg1d",
  showWatchlistRing: true,
  showBadges: true,
};

/* ================================================================== */
/*  Filter chips                                                        */
/* ================================================================== */

export type FilterId =
  | "none"
  | "gainers"
  | "losers"
  | "volume-spike"
  | "near-high-52w"
  | "near-low-52w"
  | "watchlist"
  | "earnings-soon";

export interface FilterDef {
  id: FilterId;
  label: string;
  /** Warm, cheeky voice — used on chips */
  hint?: string;
}

/* ================================================================== */
/*  View modes                                                          */
/* ================================================================== */

export type ViewMode = "treemap" | "grid" | "list";

/* ================================================================== */
/*  Drilldown                                                           */
/* ================================================================== */

export type DrillLevel =
  | { kind: "root"; view: "stocks" | "sectors" }
  | { kind: "sector"; sectorId: SectorId };
