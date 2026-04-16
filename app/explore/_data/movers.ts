/**
 * Shared data module for the "What's Moving" widget AND the power-user
 * full page at /explore/whats-moving. Single source of truth.
 *
 * Pure TypeScript (no JSX). UI atoms that consume this data live in
 * `app/explore/components/movers-atoms.tsx`.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type BaseCapSize = "mega" | "large" | "midcap" | "small";
export type CapSize = BaseCapSize | "all";
export type MoverType =
  | "gainers"
  | "losers"
  | "most-active"
  | "near-52w-high"
  | "near-52w-low";

export type Sector =
  | "Tech"
  | "Consumer"
  | "Finance"
  | "Energy"
  | "Healthcare"
  | "Industrial"
  | "Comms"
  | "Utilities";

export type AnalystRating = "Buy" | "Hold" | "Sell";

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  pe: number | null;
  high52w: number;
  low52w: number;
  color: string;
  revGrowth: number;
  profitGrowth: number;
  rating: AnalystRating;
}

/* ------------------------------------------------------------------ */
/*  Deterministic helpers (seeded by symbol)                           */
/* ------------------------------------------------------------------ */

export function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// 1Y price change % per symbol — range roughly -45% to +85%
export function oneYearChange(symbol: string): number {
  const seed = hashStr(symbol);
  const v = (seed % 1300) / 10 - 45;
  return Math.round(v * 10) / 10;
}

export function fmtPct1Y(symbol: string): string {
  const v = oneYearChange(symbol);
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

// Format a raw share count as "12.4M" / "842K"
export function fmtVol(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return `${Math.round(n)}`;
}

// 1-month traded volume per symbol (10M – 1.8B range)
export function oneMonthVol(symbol: string): number {
  const seed = hashStr(symbol);
  return 10e6 + (seed % 180) * 10e6;
}

// Monthly avg volume — roughly ±25% of the 1M volume
export function monthlyAvgVol(symbol: string): number {
  const seed = hashStr(symbol);
  const bias = (seed % 50) / 100 - 0.25;
  return Math.max(5e6, oneMonthVol(symbol) * (1 + bias));
}

// Convert a marketCap display string ("$2.2T" / "$54B" / "$245M") to a number.
export function marketCapToNum(mc: string): number {
  const m = mc.replace(/[$,]/g, "").trim();
  const unit = m.slice(-1).toUpperCase();
  const val = parseFloat(m.slice(0, -1));
  if (Number.isNaN(val)) return 0;
  if (unit === "T") return val * 1e12;
  if (unit === "B") return val * 1e9;
  if (unit === "M") return val * 1e6;
  return val;
}

// Convert a short volume string ("112.4M" / "22.3B") to a number.
export function volumeStrToNum(v: string): number {
  const unit = v.slice(-1).toUpperCase();
  const val = parseFloat(v.slice(0, -1));
  if (Number.isNaN(val)) return 0;
  if (unit === "B") return val * 1e9;
  if (unit === "M") return val * 1e6;
  if (unit === "K") return val * 1e3;
  return val;
}

/* ------------------------------------------------------------------ */
/*  Module-level mega consensus map                                    */
/* ------------------------------------------------------------------ */

export const MEGA_CONSENSUS: Record<
  string,
  { buy: number; hold: number; sell: number }
> = {
  NVDA: { buy: 38, hold: 5, sell: 1 },
  META: { buy: 42, hold: 4, sell: 2 },
  AMZN: { buy: 45, hold: 3, sell: 0 },
  MSFT: { buy: 40, hold: 6, sell: 1 },
  AAPL: { buy: 28, hold: 12, sell: 4 },
  TSLA: { buy: 12, hold: 14, sell: 18 },
  GOOGL: { buy: 36, hold: 8, sell: 2 },
  "BRK.B": { buy: 8, hold: 18, sell: 2 },
  JPM: { buy: 18, hold: 10, sell: 1 },
  V: { buy: 32, hold: 6, sell: 0 },
};

/* ------------------------------------------------------------------ */
/*  Sector tagging (hand-mapped per symbol)                            */
/* ------------------------------------------------------------------ */

export const SECTOR_BY_SYMBOL: Record<string, Sector> = {
  // Mega
  NVDA: "Tech", META: "Comms", AMZN: "Consumer", MSFT: "Tech", AAPL: "Tech",
  TSLA: "Consumer", GOOGL: "Comms", "BRK.B": "Finance", JPM: "Finance",
  V: "Finance", WMT: "Consumer", XOM: "Energy",
  // Large
  PLTR: "Tech", COIN: "Finance", SHOP: "Tech", SQ: "Finance", ABNB: "Consumer",
  SNAP: "Comms", RIVN: "Consumer", HOOD: "Finance", LYFT: "Consumer",
  DKNG: "Consumer", LCID: "Consumer", UBER: "Consumer",
  // Midcap
  CRWD: "Tech", DDOG: "Tech", ZS: "Tech", HUBS: "Tech", VEEV: "Tech",
  PINS: "Comms", BILL: "Tech", OKTA: "Tech", ROKU: "Comms", U: "Tech",
  APP: "Tech", MELI: "Consumer",
  // Small
  IONQ: "Tech", SMCI: "Tech", SOUN: "Tech", JOBY: "Industrial", MARA: "Finance",
  WKHS: "Industrial", SPCE: "Industrial", NKLA: "Industrial", MVST: "Industrial",
  QS: "Industrial", RKLB: "Industrial", AI: "Tech",
};

export function sectorOf(symbol: string): Sector {
  return SECTOR_BY_SYMBOL[symbol] ?? "Tech";
}

export const ALL_SECTORS: Sector[] = [
  "Tech", "Consumer", "Finance", "Energy",
  "Industrial", "Healthcare", "Comms", "Utilities",
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

export const data: Record<MoverType, Record<BaseCapSize, Stock[]>> = {
  gainers: {
    mega: [
      { symbol: "NVDA", name: "NVIDIA", price: 892.45, changePercent: 3.97, volume: "52.3M", marketCap: "$2.2T", pe: 68, high52w: 974.0, low52w: 392.3, color: "#76B900", revGrowth: 122.4, profitGrowth: 581.3, rating: "Buy" },
      { symbol: "META", name: "Meta Platforms", price: 523.8, changePercent: 3.69, volume: "28.1M", marketCap: "$1.3T", pe: 34, high52w: 542.8, low52w: 296.4, color: "#0668E1", revGrowth: 24.7, profitGrowth: 69.3, rating: "Buy" },
      { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, volume: "45.7M", marketCap: "$1.9T", pe: 59, high52w: 191.7, low52w: 118.4, color: "#FF9900", revGrowth: 12.5, profitGrowth: 229.1, rating: "Buy" },
      { symbol: "MSFT", name: "Microsoft", price: 428.15, changePercent: 2.71, volume: "22.4M", marketCap: "$3.2T", pe: 37, high52w: 433.0, low52w: 309.5, color: "#00A4EF", revGrowth: 17.6, profitGrowth: 33.2, rating: "Buy" },
      { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, volume: "38.9M", marketCap: "$3.0T", pe: 31, high52w: 199.6, low52w: 164.1, color: "#555555", revGrowth: 2.1, profitGrowth: 10.7, rating: "Buy" },
    ],
    large: [
      { symbol: "PLTR", name: "Palantir", price: 24.85, changePercent: 12.34, volume: "98.2M", marketCap: "$54B", pe: 242, high52w: 27.5, low52w: 13.7, color: "#1D1D1D", revGrowth: 17.7, profitGrowth: 32.1, rating: "Buy" },
      { symbol: "COIN", name: "Coinbase", price: 178.42, changePercent: 9.6, volume: "14.3M", marketCap: "$42B", pe: 45, high52w: 185.7, low52w: 78.4, color: "#0052FF", revGrowth: 101.4, profitGrowth: 285.0, rating: "Buy" },
      { symbol: "SHOP", name: "Shopify", price: 78.35, changePercent: 7.43, volume: "18.7M", marketCap: "$98B", pe: 82, high52w: 81.3, low52w: 45.5, color: "#96BF48", revGrowth: 26.1, profitGrowth: 140.8, rating: "Buy" },
      { symbol: "SQ", name: "Block Inc", price: 72.18, changePercent: 6.22, volume: "12.5M", marketCap: "$43B", pe: 57, high52w: 78.2, low52w: 39.8, color: "#3E4348", revGrowth: 24.5, profitGrowth: 88.2, rating: "Hold" },
      { symbol: "ABNB", name: "Airbnb", price: 156.73, changePercent: 5.46, volume: "8.9M", marketCap: "$98B", pe: 39, high52w: 170.1, low52w: 110.4, color: "#FF5A5F", revGrowth: 18.3, profitGrowth: 55.7, rating: "Buy" },
    ],
    midcap: [
      { symbol: "CRWD", name: "CrowdStrike", price: 312.8, changePercent: 4.2, volume: "8.4M", marketCap: "$72B", pe: 720, high52w: 365.0, low52w: 135.0, color: "#E11D48", revGrowth: 36.4, profitGrowth: 120.5, rating: "Buy" },
      { symbol: "DDOG", name: "Datadog", price: 124.6, changePercent: 3.1, volume: "6.2M", marketCap: "$39B", pe: 320, high52w: 135.5, low52w: 75.0, color: "#7C3AED", revGrowth: 26.8, profitGrowth: 45.2, rating: "Buy" },
      { symbol: "ZS", name: "Zscaler", price: 218.4, changePercent: 2.7, volume: "3.8M", marketCap: "$31B", pe: 520, high52w: 259.6, low52w: 140.0, color: "#0EA5E9", revGrowth: 34.8, profitGrowth: 88.1, rating: "Buy" },
      { symbol: "HUBS", name: "HubSpot", price: 582.4, changePercent: 2.4, volume: "1.2M", marketCap: "$30B", pe: 480, high52w: 668.2, low52w: 392.1, color: "#FF7A59", revGrowth: 23.1, profitGrowth: 72.4, rating: "Buy" },
      { symbol: "VEEV", name: "Veeva Systems", price: 198.5, changePercent: 1.9, volume: "2.1M", marketCap: "$32B", pe: 56, high52w: 235.4, low52w: 155.8, color: "#FF6B00", revGrowth: 12.8, profitGrowth: 28.6, rating: "Hold" },
    ],
    small: [
      { symbol: "IONQ", name: "IonQ", price: 12.45, changePercent: 21.24, volume: "42.1M", marketCap: "$2.7B", pe: null, high52w: 15.3, low52w: 5.2, color: "#7C3AED", revGrowth: 89.5, profitGrowth: -42.1, rating: "Hold" },
      { symbol: "SMCI", name: "Super Micro", price: 28.73, changePercent: 15.81, volume: "35.6M", marketCap: "$15B", pe: 12, high52w: 122.9, low52w: 17.3, color: "#0071C5", revGrowth: 110.2, profitGrowth: 88.4, rating: "Buy" },
      { symbol: "SOUN", name: "SoundHound", price: 5.42, changePercent: 14.35, volume: "28.4M", marketCap: "$1.8B", pe: null, high52w: 10.3, low52w: 1.5, color: "#8B5CF6", revGrowth: 52.3, profitGrowth: -68.4, rating: "Hold" },
      { symbol: "JOBY", name: "Joby Aviation", price: 6.78, changePercent: 12.07, volume: "15.8M", marketCap: "$4.5B", pe: null, high52w: 8.4, low52w: 3.7, color: "#14B8A6", revGrowth: -100.0, profitGrowth: -100.0, rating: "Hold" },
      { symbol: "MARA", name: "Marathon Digi", price: 18.92, changePercent: 10.84, volume: "22.3M", marketCap: "$5.6B", pe: 25, high52w: 31.4, low52w: 8.4, color: "#F59E0B", revGrowth: 229.0, profitGrowth: 350.2, rating: "Buy" },
    ],
  },
  losers: {
    mega: [
      { symbol: "TSLA", name: "Tesla", price: 178.24, changePercent: -6.48, volume: "112.4M", marketCap: "$568B", pe: 48, high52w: 299.3, low52w: 152.4, color: "#CC0000", revGrowth: 8.5, profitGrowth: -23.1, rating: "Sell" },
      { symbol: "GOOGL", name: "Alphabet", price: 152.67, changePercent: -3.68, volume: "32.8M", marketCap: "$1.9T", pe: 27, high52w: 174.7, low52w: 120.2, color: "#4285F4", revGrowth: 13.6, profitGrowth: 31.4, rating: "Buy" },
      { symbol: "BRK.B", name: "Berkshire", price: 412.5, changePercent: -2.12, volume: "4.2M", marketCap: "$882B", pe: 11, high52w: 445.2, low52w: 344.6, color: "#3E2F84", revGrowth: 20.8, profitGrowth: 42.1, rating: "Hold" },
      { symbol: "JPM", name: "JPMorgan", price: 198.73, changePercent: -1.71, volume: "9.8M", marketCap: "$572B", pe: 12, high52w: 210.5, low52w: 162.4, color: "#003087", revGrowth: 9.4, profitGrowth: 25.3, rating: "Buy" },
      { symbol: "V", name: "Visa", price: 285.6, changePercent: -1.42, volume: "7.1M", marketCap: "$588B", pe: 32, high52w: 296.4, low52w: 248.7, color: "#1A1F71", revGrowth: 10.2, profitGrowth: 17.4, rating: "Buy" },
    ],
    large: [
      { symbol: "SNAP", name: "Snap Inc", price: 11.24, changePercent: -14.27, volume: "45.2M", marketCap: "$18B", pe: null, high52w: 17.9, low52w: 8.3, color: "#EAAB00", revGrowth: 5.1, profitGrowth: -12.4, rating: "Hold" },
      { symbol: "RIVN", name: "Rivian", price: 15.63, changePercent: -8.33, volume: "38.7M", marketCap: "$16B", pe: null, high52w: 28.1, low52w: 8.3, color: "#2D6A4F", revGrowth: 167.4, profitGrowth: -45.2, rating: "Hold" },
      { symbol: "HOOD", name: "Robinhood", price: 18.45, changePercent: -6.25, volume: "22.1M", marketCap: "$16B", pe: 62, high52w: 23.8, low52w: 7.9, color: "#00C805", revGrowth: 29.4, profitGrowth: 120.8, rating: "Hold" },
      { symbol: "LYFT", name: "Lyft", price: 14.82, changePercent: -5.54, volume: "16.8M", marketCap: "$5.8B", pe: null, high52w: 20.8, low52w: 8.9, color: "#EA39E8", revGrowth: 3.2, profitGrowth: -88.4, rating: "Sell" },
      { symbol: "DKNG", name: "DraftKings", price: 35.67, changePercent: -4.75, volume: "12.4M", marketCap: "$34B", pe: null, high52w: 49.6, low52w: 26.2, color: "#61B729", revGrowth: 44.2, profitGrowth: 62.1, rating: "Hold" },
    ],
    midcap: [
      { symbol: "SNAP", name: "Snap Inc", price: 11.24, changePercent: -5.8, volume: "45.2M", marketCap: "$18B", pe: null, high52w: 17.9, low52w: 8.3, color: "#EAAB00", revGrowth: 5.1, profitGrowth: -12.4, rating: "Hold" },
      { symbol: "ROKU", name: "Roku", price: 62.4, changePercent: -4.5, volume: "8.1M", marketCap: "$9B", pe: null, high52w: 106.8, low52w: 51.2, color: "#6C3A97", revGrowth: 14.2, profitGrowth: -35.6, rating: "Hold" },
      { symbol: "PINS", name: "Pinterest", price: 28.6, changePercent: -3.8, volume: "12.4M", marketCap: "$19B", pe: 42, high52w: 40.2, low52w: 22.8, color: "#E60023", revGrowth: 11.8, profitGrowth: -8.4, rating: "Hold" },
      { symbol: "BILL", name: "BILL Holdings", price: 58.2, changePercent: -3.2, volume: "4.2M", marketCap: "$6.2B", pe: null, high52w: 88.5, low52w: 44.3, color: "#00C4CC", revGrowth: -4.2, profitGrowth: -68.5, rating: "Sell" },
      { symbol: "OKTA", name: "Okta", price: 88.4, changePercent: -2.9, volume: "5.8M", marketCap: "$15B", pe: null, high52w: 115.2, low52w: 65.8, color: "#007DC1", revGrowth: 18.4, profitGrowth: 42.1, rating: "Hold" },
    ],
    small: [
      { symbol: "WKHS", name: "Workhorse", price: 1.23, changePercent: -20.65, volume: "18.9M", marketCap: "$245M", pe: null, high52w: 3.8, low52w: 0.4, color: "#E97C37", revGrowth: -72.4, profitGrowth: -180.5, rating: "Sell" },
      { symbol: "SPCE", name: "Virgin Galactic", price: 2.45, changePercent: -15.52, volume: "24.6M", marketCap: "$712M", pe: null, high52w: 5.6, low52w: 0.9, color: "#0ABAB5", revGrowth: -95.4, profitGrowth: -210.3, rating: "Sell" },
      { symbol: "NKLA", name: "Nikola", price: 0.87, changePercent: -12.12, volume: "32.1M", marketCap: "$418M", pe: null, high52w: 2.8, low52w: 0.5, color: "#2563EB", revGrowth: -42.1, profitGrowth: -150.2, rating: "Sell" },
      { symbol: "MVST", name: "Microvast", price: 1.56, changePercent: -10.34, volume: "8.4M", marketCap: "$478M", pe: null, high52w: 3.1, low52w: 0.8, color: "#DC2626", revGrowth: 12.4, profitGrowth: -88.2, rating: "Sell" },
      { symbol: "QS", name: "QuantumScape", price: 6.78, changePercent: -8.99, volume: "11.2M", marketCap: "$3.2B", pe: null, high52w: 11.6, low52w: 4.0, color: "#0EA5E9", revGrowth: -100.0, profitGrowth: -100.0, rating: "Hold" },
    ],
  },
  "most-active": {
    mega: [
      { symbol: "TSLA", name: "Tesla", price: 178.24, changePercent: -6.48, volume: "112.4M", marketCap: "$568B", pe: 48, high52w: 299.3, low52w: 152.4, color: "#CC0000", revGrowth: 8.5, profitGrowth: -23.1, rating: "Sell" },
      { symbol: "NVDA", name: "NVIDIA", price: 892.45, changePercent: 3.97, volume: "52.3M", marketCap: "$2.2T", pe: 68, high52w: 974.0, low52w: 392.3, color: "#76B900", revGrowth: 122.4, profitGrowth: 581.3, rating: "Buy" },
      { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, volume: "45.7M", marketCap: "$1.9T", pe: 59, high52w: 191.7, low52w: 118.4, color: "#FF9900", revGrowth: 12.5, profitGrowth: 229.1, rating: "Buy" },
      { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, volume: "38.9M", marketCap: "$3.0T", pe: 31, high52w: 199.6, low52w: 164.1, color: "#555555", revGrowth: 2.1, profitGrowth: 10.7, rating: "Buy" },
      { symbol: "GOOGL", name: "Alphabet", price: 152.67, changePercent: -3.68, volume: "32.8M", marketCap: "$1.9T", pe: 27, high52w: 174.7, low52w: 120.2, color: "#4285F4", revGrowth: 13.6, profitGrowth: 31.4, rating: "Buy" },
    ],
    large: [
      { symbol: "PLTR", name: "Palantir", price: 24.85, changePercent: 12.34, volume: "98.2M", marketCap: "$54B", pe: 242, high52w: 27.5, low52w: 13.7, color: "#1D1D1D", revGrowth: 17.7, profitGrowth: 32.1, rating: "Buy" },
      { symbol: "SNAP", name: "Snap Inc", price: 11.24, changePercent: -14.27, volume: "45.2M", marketCap: "$18B", pe: null, high52w: 17.9, low52w: 8.3, color: "#EAAB00", revGrowth: 5.1, profitGrowth: -12.4, rating: "Hold" },
      { symbol: "RIVN", name: "Rivian", price: 15.63, changePercent: -8.33, volume: "38.7M", marketCap: "$16B", pe: null, high52w: 28.1, low52w: 8.3, color: "#2D6A4F", revGrowth: 167.4, profitGrowth: -45.2, rating: "Hold" },
      { symbol: "HOOD", name: "Robinhood", price: 18.45, changePercent: -6.25, volume: "22.1M", marketCap: "$16B", pe: 62, high52w: 23.8, low52w: 7.9, color: "#00C805", revGrowth: 29.4, profitGrowth: 120.8, rating: "Hold" },
      { symbol: "COIN", name: "Coinbase", price: 178.42, changePercent: 9.6, volume: "14.3M", marketCap: "$42B", pe: 45, high52w: 185.7, low52w: 78.4, color: "#0052FF", revGrowth: 101.4, profitGrowth: 285.0, rating: "Buy" },
    ],
    midcap: [
      { symbol: "SOUN", name: "SoundHound", price: 5.42, changePercent: 14.35, volume: "28.4M", marketCap: "$1.8B", pe: null, high52w: 10.3, low52w: 1.5, color: "#8B5CF6", revGrowth: 52.3, profitGrowth: -68.4, rating: "Hold" },
      { symbol: "PINS", name: "Pinterest", price: 28.6, changePercent: -3.8, volume: "12.4M", marketCap: "$19B", pe: 42, high52w: 40.2, low52w: 22.8, color: "#E60023", revGrowth: 11.8, profitGrowth: -8.4, rating: "Hold" },
      { symbol: "CRWD", name: "CrowdStrike", price: 312.8, changePercent: 4.2, volume: "8.4M", marketCap: "$72B", pe: 720, high52w: 365.0, low52w: 135.0, color: "#E11D48", revGrowth: 36.4, profitGrowth: 120.5, rating: "Buy" },
      { symbol: "ROKU", name: "Roku", price: 62.4, changePercent: -4.5, volume: "8.1M", marketCap: "$9B", pe: null, high52w: 106.8, low52w: 51.2, color: "#6C3A97", revGrowth: 14.2, profitGrowth: -35.6, rating: "Hold" },
      { symbol: "DDOG", name: "Datadog", price: 124.6, changePercent: 3.1, volume: "6.2M", marketCap: "$39B", pe: 320, high52w: 135.5, low52w: 75.0, color: "#7C3AED", revGrowth: 26.8, profitGrowth: 45.2, rating: "Buy" },
    ],
    small: [
      { symbol: "IONQ", name: "IonQ", price: 12.45, changePercent: 21.24, volume: "42.1M", marketCap: "$2.7B", pe: null, high52w: 15.3, low52w: 5.2, color: "#7C3AED", revGrowth: 89.5, profitGrowth: -42.1, rating: "Hold" },
      { symbol: "NKLA", name: "Nikola", price: 0.87, changePercent: -12.12, volume: "32.1M", marketCap: "$418M", pe: null, high52w: 2.8, low52w: 0.5, color: "#2563EB", revGrowth: -42.1, profitGrowth: -150.2, rating: "Sell" },
      { symbol: "MARA", name: "Marathon Digi", price: 18.92, changePercent: 10.84, volume: "22.3M", marketCap: "$5.6B", pe: 25, high52w: 31.4, low52w: 8.4, color: "#F59E0B", revGrowth: 229.0, profitGrowth: 350.2, rating: "Buy" },
      { symbol: "WKHS", name: "Workhorse", price: 1.23, changePercent: -20.65, volume: "18.9M", marketCap: "$245M", pe: null, high52w: 3.8, low52w: 0.4, color: "#E97C37", revGrowth: -72.4, profitGrowth: -180.5, rating: "Sell" },
      { symbol: "SMCI", name: "Super Micro", price: 28.73, changePercent: 15.81, volume: "15.6M", marketCap: "$15B", pe: 12, high52w: 122.9, low52w: 17.3, color: "#0071C5", revGrowth: 110.2, profitGrowth: 88.4, rating: "Buy" },
    ],
  },
  "near-52w-high": {
    mega: [
      { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 2.33, volume: "38.9M", marketCap: "$3.0T", pe: 31, high52w: 199.6, low52w: 164.1, color: "#555555", revGrowth: 2.1, profitGrowth: 10.7, rating: "Buy" },
      { symbol: "MSFT", name: "Microsoft", price: 428.15, changePercent: 2.71, volume: "22.4M", marketCap: "$3.2T", pe: 37, high52w: 433.0, low52w: 309.5, color: "#00A4EF", revGrowth: 17.6, profitGrowth: 33.2, rating: "Buy" },
      { symbol: "META", name: "Meta Platforms", price: 523.8, changePercent: 3.69, volume: "28.1M", marketCap: "$1.3T", pe: 34, high52w: 542.8, low52w: 296.4, color: "#0668E1", revGrowth: 24.7, profitGrowth: 69.3, rating: "Buy" },
      { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 3.17, volume: "45.7M", marketCap: "$1.9T", pe: 59, high52w: 191.7, low52w: 118.4, color: "#FF9900", revGrowth: 12.5, profitGrowth: 229.1, rating: "Buy" },
      { symbol: "JPM", name: "JPMorgan", price: 208.3, changePercent: 1.42, volume: "9.8M", marketCap: "$600B", pe: 12, high52w: 211.5, low52w: 162.4, color: "#003087", revGrowth: 9.4, profitGrowth: 25.3, rating: "Buy" },
    ],
    large: [
      { symbol: "COIN", name: "Coinbase", price: 178.42, changePercent: 9.6, volume: "14.3M", marketCap: "$42B", pe: 45, high52w: 185.7, low52w: 78.4, color: "#0052FF", revGrowth: 101.4, profitGrowth: 285.0, rating: "Buy" },
      { symbol: "SHOP", name: "Shopify", price: 78.35, changePercent: 7.43, volume: "18.7M", marketCap: "$98B", pe: 82, high52w: 81.3, low52w: 45.5, color: "#96BF48", revGrowth: 26.1, profitGrowth: 140.8, rating: "Buy" },
      { symbol: "PLTR", name: "Palantir", price: 26.48, changePercent: 3.2, volume: "98.2M", marketCap: "$54B", pe: 242, high52w: 27.5, low52w: 13.7, color: "#1D1D1D", revGrowth: 17.7, profitGrowth: 32.1, rating: "Buy" },
      { symbol: "ABNB", name: "Airbnb", price: 162.3, changePercent: 2.8, volume: "8.9M", marketCap: "$98B", pe: 39, high52w: 170.1, low52w: 110.4, color: "#FF5A5F", revGrowth: 18.3, profitGrowth: 55.7, rating: "Buy" },
      { symbol: "UBER", name: "Uber", price: 71.4, changePercent: 1.9, volume: "11.2M", marketCap: "$151B", pe: 38, high52w: 74.8, low52w: 46.2, color: "#000000", revGrowth: 16.2, profitGrowth: 82.5, rating: "Buy" },
    ],
    midcap: [
      { symbol: "CRWD", name: "CrowdStrike", price: 348.2, changePercent: 2.1, volume: "8.4M", marketCap: "$72B", pe: 720, high52w: 365.0, low52w: 135.0, color: "#E11D48", revGrowth: 36.4, profitGrowth: 120.5, rating: "Buy" },
      { symbol: "DDOG", name: "Datadog", price: 129.8, changePercent: 1.8, volume: "6.2M", marketCap: "$39B", pe: 320, high52w: 135.5, low52w: 75.0, color: "#7C3AED", revGrowth: 26.8, profitGrowth: 45.2, rating: "Buy" },
      { symbol: "HUBS", name: "HubSpot", price: 642.8, changePercent: 1.4, volume: "1.2M", marketCap: "$30B", pe: 480, high52w: 668.2, low52w: 392.1, color: "#FF7A59", revGrowth: 23.1, profitGrowth: 72.4, rating: "Buy" },
      { symbol: "APP", name: "AppLovin", price: 91.4, changePercent: 3.8, volume: "4.2M", marketCap: "$31B", pe: 48, high52w: 94.8, low52w: 28.5, color: "#FF5500", revGrowth: 44.2, profitGrowth: 132.5, rating: "Buy" },
      { symbol: "MELI", name: "MercadoLibre", price: 1842.5, changePercent: 1.2, volume: "0.9M", marketCap: "$93B", pe: 82, high52w: 1890.0, low52w: 1142.4, color: "#FFE600", revGrowth: 36.8, profitGrowth: 94.2, rating: "Buy" },
    ],
    small: [
      { symbol: "IONQ", name: "IonQ", price: 14.62, changePercent: 5.2, volume: "42.1M", marketCap: "$2.7B", pe: null, high52w: 15.3, low52w: 5.2, color: "#7C3AED", revGrowth: 89.5, profitGrowth: -42.1, rating: "Hold" },
      { symbol: "MARA", name: "Marathon Digi", price: 30.1, changePercent: 4.8, volume: "22.3M", marketCap: "$5.6B", pe: 25, high52w: 31.4, low52w: 8.4, color: "#F59E0B", revGrowth: 229.0, profitGrowth: 350.2, rating: "Buy" },
      { symbol: "SMCI", name: "Super Micro", price: 117.4, changePercent: 3.2, volume: "35.6M", marketCap: "$15B", pe: 12, high52w: 122.9, low52w: 17.3, color: "#0071C5", revGrowth: 110.2, profitGrowth: 88.4, rating: "Buy" },
      { symbol: "RKLB", name: "Rocket Lab", price: 7.82, changePercent: 2.1, volume: "12.4M", marketCap: "$3.9B", pe: null, high52w: 8.15, low52w: 3.12, color: "#FF4400", revGrowth: 68.4, profitGrowth: -82.1, rating: "Buy" },
      { symbol: "AI", name: "C3.ai", price: 28.6, changePercent: 2.8, volume: "8.4M", marketCap: "$3.6B", pe: null, high52w: 29.8, low52w: 16.2, color: "#0052CC", revGrowth: 22.8, profitGrowth: -45.2, rating: "Hold" },
    ],
  },
  "near-52w-low": {
    mega: [
      { symbol: "TSLA", name: "Tesla", price: 158.7, changePercent: -2.8, volume: "112.4M", marketCap: "$505B", pe: 42, high52w: 299.3, low52w: 152.4, color: "#CC0000", revGrowth: 8.5, profitGrowth: -23.1, rating: "Sell" },
      { symbol: "GOOGL", name: "Alphabet", price: 124.8, changePercent: -1.9, volume: "32.8M", marketCap: "$1.56T", pe: 22, high52w: 174.7, low52w: 120.2, color: "#4285F4", revGrowth: 13.6, profitGrowth: 31.4, rating: "Buy" },
      { symbol: "V", name: "Visa", price: 254.2, changePercent: -1.4, volume: "7.1M", marketCap: "$524B", pe: 28, high52w: 296.4, low52w: 248.7, color: "#1A1F71", revGrowth: 10.2, profitGrowth: 17.4, rating: "Buy" },
      { symbol: "WMT", name: "Walmart", price: 58.9, changePercent: -0.9, volume: "14.2M", marketCap: "$474B", pe: 32, high52w: 84.2, low52w: 57.1, color: "#0071CE", revGrowth: 5.8, profitGrowth: 12.4, rating: "Hold" },
      { symbol: "XOM", name: "ExxonMobil", price: 104.2, changePercent: -1.2, volume: "18.6M", marketCap: "$422B", pe: 14, high52w: 123.8, low52w: 101.2, color: "#FF0000", revGrowth: -4.2, profitGrowth: -18.4, rating: "Hold" },
    ],
    large: [
      { symbol: "RIVN", name: "Rivian", price: 8.82, changePercent: -3.4, volume: "38.7M", marketCap: "$9.1B", pe: null, high52w: 28.1, low52w: 8.3, color: "#2D6A4F", revGrowth: 167.4, profitGrowth: -45.2, rating: "Hold" },
      { symbol: "SNAP", name: "Snap Inc", price: 8.72, changePercent: -4.2, volume: "45.2M", marketCap: "$13.8B", pe: null, high52w: 17.9, low52w: 8.3, color: "#EAAB00", revGrowth: 5.1, profitGrowth: -12.4, rating: "Hold" },
      { symbol: "LYFT", name: "Lyft", price: 9.32, changePercent: -2.8, volume: "16.8M", marketCap: "$3.6B", pe: null, high52w: 20.8, low52w: 8.9, color: "#EA39E8", revGrowth: 3.2, profitGrowth: -88.4, rating: "Sell" },
      { symbol: "HOOD", name: "Robinhood", price: 8.42, changePercent: -2.4, volume: "22.1M", marketCap: "$7.2B", pe: null, high52w: 23.8, low52w: 7.9, color: "#00C805", revGrowth: 29.4, profitGrowth: 120.8, rating: "Hold" },
      { symbol: "LCID", name: "Lucid Group", price: 3.28, changePercent: -3.1, volume: "22.4M", marketCap: "$7.2B", pe: null, high52w: 7.82, low52w: 3.12, color: "#00A3CC", revGrowth: 218.4, profitGrowth: -182.4, rating: "Sell" },
    ],
    midcap: [
      { symbol: "ROKU", name: "Roku", price: 53.8, changePercent: -3.2, volume: "8.1M", marketCap: "$7.8B", pe: null, high52w: 106.8, low52w: 51.2, color: "#6C3A97", revGrowth: 14.2, profitGrowth: -35.6, rating: "Hold" },
      { symbol: "BILL", name: "BILL Holdings", price: 46.4, changePercent: -2.8, volume: "4.2M", marketCap: "$4.9B", pe: null, high52w: 88.5, low52w: 44.3, color: "#00C4CC", revGrowth: -4.2, profitGrowth: -68.5, rating: "Sell" },
      { symbol: "PINS", name: "Pinterest", price: 23.9, changePercent: -2.2, volume: "12.4M", marketCap: "$16B", pe: 35, high52w: 40.2, low52w: 22.8, color: "#E60023", revGrowth: 11.8, profitGrowth: -8.4, rating: "Hold" },
      { symbol: "OKTA", name: "Okta", price: 68.4, changePercent: -1.8, volume: "5.8M", marketCap: "$11.6B", pe: null, high52w: 115.2, low52w: 65.8, color: "#007DC1", revGrowth: 18.4, profitGrowth: 42.1, rating: "Hold" },
      { symbol: "U", name: "Unity Software", price: 22.4, changePercent: -2.4, volume: "9.2M", marketCap: "$7.8B", pe: null, high52w: 48.6, low52w: 21.4, color: "#000000", revGrowth: -8.4, profitGrowth: -112.4, rating: "Sell" },
    ],
    small: [
      { symbol: "WKHS", name: "Workhorse", price: 0.42, changePercent: -8.7, volume: "18.9M", marketCap: "$84M", pe: null, high52w: 3.8, low52w: 0.4, color: "#E97C37", revGrowth: -72.4, profitGrowth: -180.5, rating: "Sell" },
      { symbol: "SPCE", name: "Virgin Galactic", price: 0.96, changePercent: -6.2, volume: "24.6M", marketCap: "$279M", pe: null, high52w: 5.6, low52w: 0.9, color: "#0ABAB5", revGrowth: -95.4, profitGrowth: -210.3, rating: "Sell" },
      { symbol: "NKLA", name: "Nikola", price: 0.64, changePercent: -4.8, volume: "32.1M", marketCap: "$308M", pe: null, high52w: 2.8, low52w: 0.5, color: "#2563EB", revGrowth: -42.1, profitGrowth: -150.2, rating: "Sell" },
      { symbol: "MVST", name: "Microvast", price: 1.02, changePercent: -3.8, volume: "8.4M", marketCap: "$312M", pe: null, high52w: 3.1, low52w: 0.8, color: "#DC2626", revGrowth: 12.4, profitGrowth: -88.2, rating: "Sell" },
      { symbol: "QS", name: "QuantumScape", price: 4.28, changePercent: -2.9, volume: "11.2M", marketCap: "$2.1B", pe: null, high52w: 11.6, low52w: 4.0, color: "#0EA5E9", revGrowth: -100.0, profitGrowth: -100.0, rating: "Hold" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Pad every list to ~15 stocks using deterministic generation         */
/* ------------------------------------------------------------------ */

const EXTRA_SYMBOLS: Record<BaseCapSize, { symbol: string; name: string; color: string }[]> = {
  mega: [
    { symbol: "UNH", name: "UnitedHealth", color: "#002B5C" },
    { symbol: "LLY", name: "Eli Lilly", color: "#D52B1E" },
    { symbol: "AVGO", name: "Broadcom", color: "#CC0000" },
    { symbol: "HD", name: "Home Depot", color: "#F96302" },
    { symbol: "PG", name: "Procter & Gamble", color: "#003DA5" },
    { symbol: "MA", name: "Mastercard", color: "#EB001B" },
    { symbol: "COST", name: "Costco", color: "#E31837" },
    { symbol: "ABBV", name: "AbbVie", color: "#071D49" },
    { symbol: "WMT", name: "Walmart", color: "#0071CE" },
    { symbol: "CRM", name: "Salesforce", color: "#00A1E0" },
  ],
  large: [
    { symbol: "MRVL", name: "Marvell Tech", color: "#8C1D40" },
    { symbol: "SNPS", name: "Synopsys", color: "#A020F0" },
    { symbol: "PANW", name: "Palo Alto", color: "#FA582D" },
    { symbol: "FTNT", name: "Fortinet", color: "#EE3124" },
    { symbol: "LULU", name: "Lululemon", color: "#D31334" },
    { symbol: "ROP", name: "Roper Tech", color: "#003E7E" },
    { symbol: "MNST", name: "Monster Beverage", color: "#95C11F" },
    { symbol: "DASH", name: "DoorDash", color: "#FF3008" },
    { symbol: "TTD", name: "Trade Desk", color: "#2ACA4E" },
    { symbol: "WDAY", name: "Workday", color: "#0075C9" },
  ],
  midcap: [
    { symbol: "NET", name: "Cloudflare", color: "#F48120" },
    { symbol: "MDB", name: "MongoDB", color: "#13AA52" },
    { symbol: "SNOW", name: "Snowflake", color: "#29B5E8" },
    { symbol: "S", name: "SentinelOne", color: "#5F2DE1" },
    { symbol: "PATH", name: "UiPath", color: "#FA4616" },
    { symbol: "TOST", name: "Toast", color: "#FF4C00" },
    { symbol: "DUOL", name: "Duolingo", color: "#58CC02" },
    { symbol: "CELH", name: "Celsius", color: "#FF6600" },
    { symbol: "GLBE", name: "Global-e", color: "#3559E0" },
    { symbol: "DOCS", name: "Doximity", color: "#1D8DCB" },
  ],
  small: [
    { symbol: "UPST", name: "Upstart", color: "#5A3FE1" },
    { symbol: "ASTS", name: "AST SpaceMobile", color: "#1E3A5F" },
    { symbol: "RKLB", name: "Rocket Lab", color: "#FF4400" },
    { symbol: "AI", name: "C3.ai", color: "#0052CC" },
    { symbol: "STEM", name: "Stem Inc", color: "#00B894" },
    { symbol: "DM", name: "Desktop Metal", color: "#333333" },
    { symbol: "PRCH", name: "Porch Group", color: "#00B388" },
    { symbol: "BIRD", name: "Allbirds", color: "#333333" },
    { symbol: "DNA", name: "Ginkgo Bioworks", color: "#4CAF50" },
    { symbol: "GSAT", name: "Globalstar", color: "#FF6600" },
  ],
};

const MCAP_RANGE: Record<BaseCapSize, [string, string]> = {
  mega: ["$500B", "$3.2T"],
  large: ["$20B", "$150B"],
  midcap: ["$5B", "$40B"],
  small: ["$200M", "$8B"],
};

const PE_RANGE: Record<BaseCapSize, [number | null, number | null]> = {
  mega: [18, 65],
  large: [25, 180],
  midcap: [null, 400],
  small: [null, null],
};

function generateStock(
  sym: { symbol: string; name: string; color: string },
  cap: BaseCapSize,
  moverType: MoverType,
  idx: number,
): Stock {
  const h = hashStr(sym.symbol + moverType + idx);
  const sign = moverType === "losers" || moverType === "near-52w-low" ? -1 : 1;
  const baseChg = ((h % 800) / 100) + 0.5;
  const chg = +(sign * baseChg).toFixed(2);
  const price = +((h % 900) + 10 + idx * 7.3).toFixed(2);
  const vol = `${((h % 80) + 2).toFixed(1)}M`;
  const mcRange = MCAP_RANGE[cap];
  const mc = idx % 2 === 0 ? mcRange[0] : mcRange[1];
  const peRange = PE_RANGE[cap];
  const pe = peRange[0] === null ? (idx % 3 === 0 ? null : +(((h % 400) + 10).toFixed(0))) : +(((h % (peRange[1]! - peRange[0]!)) + peRange[0]!).toFixed(0));
  const high52w = +(price * (1 + (h % 40) / 100 + 0.1)).toFixed(1);
  const low52w = +(price * (1 - (h % 35) / 100 - 0.1)).toFixed(1);
  const revGr = +((h % 120) - 30 + sign * 15).toFixed(1);
  const profGr = +((h % 200) - 60 + sign * 20).toFixed(1);
  const ratings: AnalystRating[] = ["Buy", "Hold", "Sell"];
  const rating = moverType === "losers" ? ratings[(h + idx) % 3] : ratings[h % 2 === 0 ? 0 : 1];
  return {
    symbol: sym.symbol,
    name: sym.name,
    price,
    changePercent: chg,
    volume: vol,
    marketCap: mc,
    pe,
    high52w,
    low52w,
    color: sym.color,
    revGrowth: revGr,
    profitGrowth: profGr,
    rating,
  };
}

// Pad each list to ~15 stocks
for (const moverType of Object.keys(data) as MoverType[]) {
  for (const cap of Object.keys(data[moverType]) as BaseCapSize[]) {
    const list = data[moverType][cap];
    const existing = new Set(list.map((s) => s.symbol));
    const extras = EXTRA_SYMBOLS[cap];
    let added = 0;
    for (let i = 0; i < extras.length && list.length < 15; i++) {
      if (existing.has(extras[i].symbol)) continue;
      list.push(generateStock(extras[i], cap, moverType, added));
      added++;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Cap-size config                                                    */
/* ------------------------------------------------------------------ */

export const capOrder: CapSize[] = ["all", "mega", "large", "midcap", "small"];

export const capLabels: Record<CapSize, string> = {
  all: "All Caps",
  mega: "Mega Cap",
  large: "Large Cap",
  midcap: "Mid Cap",
  small: "Small Cap",
};

export const baseCapOrder: BaseCapSize[] = ["mega", "large", "midcap", "small"];

export function getStocksForCap(moverType: MoverType, capSize: CapSize): Stock[] {
  if (capSize === "all") {
    return baseCapOrder.flatMap((k) => data[moverType][k]);
  }
  return data[moverType][capSize];
}

// Aggregate across a user-chosen set of cap sizes; de-duplicates by symbol.
export function getStocksForCaps(
  moverType: MoverType,
  caps: BaseCapSize[]
): Stock[] {
  const seen = new Set<string>();
  const out: Stock[] = [];
  for (const cap of caps) {
    for (const s of data[moverType][cap]) {
      if (!seen.has(s.symbol)) {
        seen.add(s.symbol);
        out.push(s);
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Mover tab config                                                   */
/* ------------------------------------------------------------------ */

export interface MoverTab {
  id: MoverType;
  label: string;
}

export const moverTabs: MoverTab[] = [
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "most-active", label: "Most Active" },
  { id: "near-52w-high", label: "Near 52W High" },
  { id: "near-52w-low", label: "Near 52W Low" },
];

/* ------------------------------------------------------------------ */
/*  Sort keys                                                          */
/* ------------------------------------------------------------------ */

export type SortKey =
  | "changePercent"
  | "price"
  | "marketCap"
  | "volume"
  | "revGrowth"
  | "profitGrowth"
  | "pe"
  | "pctTo52wHigh"
  | "pctAbove52wLow";

export type SortDir = "asc" | "desc";

// "natural" default sort per mover type.
export const defaultSortFor: Record<MoverType, { key: SortKey; dir: SortDir }> = {
  gainers: { key: "changePercent", dir: "desc" },
  losers: { key: "changePercent", dir: "asc" },
  "most-active": { key: "volume", dir: "desc" },
  "near-52w-high": { key: "pctTo52wHigh", dir: "asc" },
  "near-52w-low": { key: "pctAbove52wLow", dir: "asc" },
};

export const sortLabels: Record<SortKey, string> = {
  changePercent: "Change %",
  price: "Price",
  marketCap: "Market Cap",
  volume: "1M Volume",
  revGrowth: "Revenue Growth",
  profitGrowth: "Profit Growth",
  pe: "PE",
  pctTo52wHigh: "Distance to 52W High",
  pctAbove52wLow: "Distance from 52W Low",
};

// Sort keys exposed in the sort sheet.
export const sortSheetKeys: SortKey[] = [
  "changePercent",
  "price",
  "marketCap",
  "volume",
  "revGrowth",
  "profitGrowth",
  "pe",
];

export function sortValue(s: Stock, key: SortKey): number {
  switch (key) {
    case "changePercent": return s.changePercent;
    case "price": return s.price;
    case "marketCap": return marketCapToNum(s.marketCap);
    case "volume": return volumeStrToNum(s.volume);
    case "revGrowth": return s.revGrowth;
    case "profitGrowth": return s.profitGrowth;
    case "pe": return s.pe ?? Number.POSITIVE_INFINITY;
    case "pctTo52wHigh":
      return (s.high52w - s.price) / (s.high52w || 1);
    case "pctAbove52wLow":
      return (s.price - s.low52w) / (s.low52w || 1);
  }
}
