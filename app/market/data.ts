// ============================================================
// Markets Page — Mock Data & Interfaces
// ============================================================

// ---- Shared Performance Row (Indices / Sectors) ----
export interface PerformanceRow {
  name: string;
  ticker?: string;
  last: number;
  today: number;
  fiveDays: number;
  oneMonth: number;
  ytd: number;
  oneYear: number;
  threeYears: number;
  dayRange: [number, number];
  weekRange52: [number, number];
}

// ---- Top 10 ----
export interface TopStock {
  symbol: string;
  name: string;
  logo: string;
  logoColor: string;
  price: number;
  change: number;
  changePct: number;
  volume: string;
  marketCap: string;
  high52w: number;
  sparkline: number[];
}

export interface TopETF {
  symbol: string;
  name: string;
  logo: string;
  logoColor: string;
  price: number;
  changePct: number;
  volume: string;
  aum: string;
  expenseRatio: string;
  sparkline: number[];
}

export interface TopMutualFund {
  name: string;
  ticker: string;
  nav: number;
  return1y: number;
  return3y: number;
  aum: string;
  expenseRatio: string;
}

// ---- Economic ----
export interface EconomicIndicator {
  label: string;
  value: string;
  badge: { text: string; direction: "up" | "down" | "neutral" };
  previous: string;
  releasedDate?: string;
  nextDate?: string;
  isLive?: boolean;
}

// ---- News Accordion ----
export interface NewsSource {
  name: string;
  logo: string;
  color: string;
}

export interface NewsItem {
  headline: string;
  summary: string;
  tickers: string[];
  sources: NewsSource[];
  timeAgo: string;
}

// ---- Screener ----
export interface ScreenerItem {
  name: string;
  description: string;
  resultCount: number;
}

// ---- Earnings Calendar ----
export interface EarningsDay {
  day: string;
  date: number;
  count: number;
}

export interface EarningsCompany {
  symbol: string;
  name: string;
  logoColor: string;
  epsEstimate: string;
  timing: "BMO" | "AMC";
}

// ---- Global (Indices, Commodities, Currencies) ----
export interface GlobalRow {
  name: string;
  subtitle: string;
  last: string;
  change: string;
  changePct: string;
  dayRange: string;
  isUp: boolean;
  marketCap?: string;
}

// ============================================================
// US MARKETS — Major Indices
// ============================================================
// — Most Popular (8 benchmark indices every investor watches)
export const US_IDX_POPULAR: PerformanceRow[] = [
  { name: "S&P 500", ticker: "SPX", last: 5638.94, today: 0.88, fiveDays: -1.0, oneMonth: -2.26, ytd: -0.54, oneYear: 17.77, threeYears: 73.22, dayRange: [5504.65, 5648.40], weekRange52: [4953.56, 6147.43] },
  { name: "Dow Jones", ticker: "DJIA", last: 41488.19, today: 0.56, fiveDays: -2.02, oneMonth: -4.66, ytd: -0.56, oneYear: 11.59, threeYears: 47.91, dayRange: [40666.14, 41580.72], weekRange52: [36611.78, 45073.63] },
  { name: "Nasdaq Composite", ticker: "COMP", last: 17754.09, today: 1.22, fiveDays: -0.68, oneMonth: -1.54, ytd: -1.82, oneYear: 21.34, threeYears: 94.18, dayRange: [17322.80, 17798.56], weekRange52: [15222.77, 20204.58] },
  { name: "Russell 2000", ticker: "RUT", last: 2056.14, today: 0.46, fiveDays: -3.49, oneMonth: -5.02, ytd: -5.84, oneYear: 5.29, threeYears: 12.10, dayRange: [1993.38, 2068.76], weekRange52: [1881.28, 2466.49] },
  { name: "Nasdaq 100", ticker: "NDX", last: 19432.48, today: 1.34, fiveDays: -0.49, oneMonth: -1.07, ytd: -1.07, oneYear: 23.58, threeYears: 107.67, dayRange: [18942.68, 19488.12], weekRange52: [16973.94, 22222.61] },
  { name: "S&P MidCap 400", ticker: "MID", last: 2864.32, today: 0.99, fiveDays: -2.74, oneMonth: -4.03, ytd: -4.92, oneYear: 5.20, threeYears: 16.49, dayRange: [2792.56, 2878.44], weekRange52: [2668.14, 3277.95] },
  { name: "NYSE Composite", ticker: "NYA", last: 19248.76, today: 0.62, fiveDays: -1.84, oneMonth: -3.18, ytd: 0.46, oneYear: 12.86, threeYears: 38.24, dayRange: [18890.42, 19302.18], weekRange52: [17066.14, 20540.33] },
  { name: "CBOE Volatility (VIX)", ticker: "VIX", last: 21.77, today: -4.32, fiveDays: 12.68, oneMonth: 28.42, ytd: 36.94, oneYear: 42.18, threeYears: -8.64, dayRange: [20.84, 23.56], weekRange52: [10.62, 65.73] },
];

// — Sectors (8 S&P sector indices)
export const US_IDX_SECTORS: PerformanceRow[] = [
  { name: "S&P 500 Info Tech", ticker: "S5INFT", last: 4012.36, today: 1.80, fiveDays: -0.06, oneMonth: -2.50, ytd: -2.92, oneYear: 27.90, threeYears: 102.26, dayRange: [3896.42, 4028.18], weekRange52: [3214.56, 4402.73] },
  { name: "S&P 500 Healthcare", ticker: "S5HLTH", last: 1724.48, today: 1.02, fiveDays: -1.78, oneMonth: -1.32, ytd: -0.35, oneYear: 3.34, threeYears: 23.34, dayRange: [1695.26, 1733.84], weekRange52: [1498.42, 1802.19] },
  { name: "S&P 500 Financials", ticker: "S5FINL", last: 768.92, today: -0.47, fiveDays: -2.27, oneMonth: -6.69, ytd: -8.11, oneYear: 2.46, threeYears: 50.06, dayRange: [758.14, 778.36], weekRange52: [618.78, 872.44] },
  { name: "S&P 500 Cons Discr", ticker: "S5COND", last: 1648.74, today: 0.13, fiveDays: -1.55, oneMonth: -2.52, ytd: -4.04, oneYear: 11.43, threeYears: 64.18, dayRange: [1607.18, 1664.02], weekRange52: [1382.56, 1814.28] },
  { name: "S&P 500 Industrials", ticker: "S5INDU", last: 1084.28, today: 0.59, fiveDays: -2.86, oneMonth: -1.59, ytd: -3.80, oneYear: 12.33, threeYears: 49.45, dayRange: [1058.36, 1090.72], weekRange52: [928.14, 1192.66] },
  { name: "S&P 500 Energy", ticker: "S5ENRS", last: 672.84, today: -0.44, fiveDays: 0.23, oneMonth: 5.00, ytd: 4.97, oneYear: 8.83, threeYears: 84.58, dayRange: [667.12, 680.48], weekRange52: [558.94, 702.38] },
  { name: "S&P 500 Comm Svcs", ticker: "S5TELS", last: 348.62, today: 0.09, fiveDays: -1.04, oneMonth: 0.58, ytd: -0.14, oneYear: 17.22, threeYears: 121.77, dayRange: [343.48, 350.86], weekRange52: [268.32, 358.44] },
  { name: "S&P 500 Utilities", ticker: "S5UTIL", last: 418.36, today: 0.24, fiveDays: -0.89, oneMonth: 7.75, ytd: 9.74, oneYear: 21.23, threeYears: 43.16, dayRange: [414.02, 422.18], weekRange52: [332.86, 430.72] },
];

// — Style (8 growth/value/blend/momentum indices)
export const US_IDX_STYLE: PerformanceRow[] = [
  { name: "S&P 500 Growth", ticker: "SGX", last: 3842.56, today: 1.42, fiveDays: -0.32, oneMonth: -1.86, ytd: -1.68, oneYear: 24.92, threeYears: 86.42, dayRange: [3768.14, 3858.92], weekRange52: [3012.48, 4186.72] },
  { name: "S&P 500 Value", ticker: "SVX", last: 1748.24, today: 0.38, fiveDays: -1.72, oneMonth: -2.84, ytd: 0.62, oneYear: 10.86, threeYears: 42.18, dayRange: [1716.48, 1756.82], weekRange52: [1488.36, 1864.28] },
  { name: "Russell 1000 Growth", ticker: "RLG", last: 3648.92, today: 1.56, fiveDays: -0.18, oneMonth: -1.42, ytd: -1.24, oneYear: 26.34, threeYears: 92.86, dayRange: [3574.28, 3666.48], weekRange52: [2848.72, 3984.56] },
  { name: "Russell 1000 Value", ticker: "RLV", last: 1842.48, today: 0.28, fiveDays: -1.94, oneMonth: -3.46, ytd: -0.42, oneYear: 8.64, threeYears: 34.28, dayRange: [1808.14, 1850.72], weekRange52: [1612.48, 1968.34] },
  { name: "S&P 500 Momentum", ticker: "SPMO", last: 892.36, today: 0.94, fiveDays: -0.86, oneMonth: -0.42, ytd: 2.48, oneYear: 22.64, threeYears: 68.42, dayRange: [876.48, 896.18], weekRange52: [694.28, 924.56] },
  { name: "S&P 500 Quality", ticker: "SPHQ", last: 62.84, today: 0.78, fiveDays: -0.64, oneMonth: -1.18, ytd: 0.86, oneYear: 18.42, threeYears: 58.24, dayRange: [61.68, 63.12], weekRange52: [48.92, 65.48] },
  { name: "S&P 500 High Beta", ticker: "SPHB", last: 84.26, today: 1.86, fiveDays: -2.48, oneMonth: -4.82, ytd: -6.24, oneYear: 12.48, threeYears: 28.64, dayRange: [81.42, 85.18], weekRange52: [62.14, 98.72] },
  { name: "S&P 500 Pure Growth", ticker: "RPG", last: 248.14, today: 1.64, fiveDays: -0.94, oneMonth: -3.26, ytd: -3.82, oneYear: 18.86, threeYears: 52.48, dayRange: [242.36, 250.28], weekRange52: [192.48, 278.62] },
];

// — Smart Beta (8 factor/strategy indices)
export const US_IDX_SMART_BETA: PerformanceRow[] = [
  { name: "S&P 500 Equal Weight", ticker: "SPXEW", last: 7248.62, today: 0.52, fiveDays: -2.14, oneMonth: -3.86, ytd: -2.48, oneYear: 8.92, threeYears: 28.64, dayRange: [7112.48, 7282.36], weekRange52: [6248.14, 7864.28] },
  { name: "Dow Jones Sel Dividend", ticker: "DVY", last: 128.42, today: 0.18, fiveDays: -1.26, oneMonth: -0.84, ytd: 3.42, oneYear: 8.86, threeYears: 22.48, dayRange: [127.14, 129.08], weekRange52: [108.62, 134.28] },
  { name: "S&P 500 Low Volatility", ticker: "SPLV", last: 78.64, today: 0.14, fiveDays: -0.48, oneMonth: 1.86, ytd: 6.24, oneYear: 14.48, threeYears: 32.86, dayRange: [77.82, 79.12], weekRange52: [64.28, 80.42] },
  { name: "S&P 500 High Dividend", ticker: "SPYD", last: 42.86, today: 0.08, fiveDays: -0.92, oneMonth: -1.24, ytd: 2.86, oneYear: 6.42, threeYears: 18.64, dayRange: [42.28, 43.14], weekRange52: [36.48, 44.86] },
  { name: "S&P 500 Buyback", ticker: "SPYB", last: 98.42, today: 0.34, fiveDays: -1.86, oneMonth: -2.48, ytd: -1.64, oneYear: 12.28, threeYears: 42.86, dayRange: [96.84, 99.08], weekRange52: [82.14, 106.48] },
  { name: "S&P 500 Min Volatility", ticker: "USMV", last: 86.24, today: 0.22, fiveDays: -0.32, oneMonth: 2.42, ytd: 5.86, oneYear: 16.24, threeYears: 36.48, dayRange: [85.48, 86.82], weekRange52: [72.36, 88.64] },
  { name: "MSCI USA ESG Leaders", ticker: "SUSL", last: 48.92, today: 0.68, fiveDays: -0.86, oneMonth: -1.92, ytd: -0.48, oneYear: 16.86, threeYears: 54.28, dayRange: [48.14, 49.28], weekRange52: [38.64, 52.14] },
  { name: "Nasdaq 100 Equal Wt", ticker: "QQQE", last: 92.48, today: 0.82, fiveDays: -1.48, oneMonth: -2.86, ytd: -2.14, oneYear: 14.42, threeYears: 38.64, dayRange: [90.84, 93.12], weekRange52: [74.28, 100.86] },
];

// — Strategy (combined Style + Smart Beta)
export const US_IDX_STRATEGY: PerformanceRow[] = [...US_IDX_STYLE, ...US_IDX_SMART_BETA];

// — Thematic (8 thematic/megatrend indices)
export const US_IDX_THEMATIC: PerformanceRow[] = [
  { name: "S&P Kensho New Econ", ticker: "KOMP", last: 48.62, today: 1.24, fiveDays: -1.68, oneMonth: -3.42, ytd: -4.86, oneYear: 8.42, threeYears: 12.86, dayRange: [47.14, 49.08], weekRange52: [36.48, 56.28] },
  { name: "NYSE FANG+", ticker: "NYFANG", last: 12486.42, today: 1.86, fiveDays: -0.24, oneMonth: -0.86, ytd: -2.48, oneYear: 32.64, threeYears: 128.42, dayRange: [12184.28, 12548.86], weekRange52: [8642.14, 14286.48] },
  { name: "S&P Global Clean Energy", ticker: "SPGTCLEN", last: 968.42, today: 0.86, fiveDays: -2.14, oneMonth: -4.86, ytd: -8.24, oneYear: -12.48, threeYears: -22.86, dayRange: [948.28, 976.14], weekRange52: [842.36, 1248.62] },
  { name: "Indxx Artificial Intel", ticker: "AIEQ", last: 42.86, today: 1.48, fiveDays: -0.92, oneMonth: -2.14, ytd: -3.42, oneYear: 24.86, threeYears: 86.48, dayRange: [41.68, 43.28], weekRange52: [28.42, 48.64] },
  { name: "S&P Biotech Select", ticker: "XBI", last: 94.28, today: 1.12, fiveDays: -2.86, oneMonth: -3.68, ytd: -6.42, oneYear: -2.86, threeYears: -14.48, dayRange: [92.14, 95.48], weekRange52: [78.64, 112.86] },
  { name: "S&P Kensho Cyber Sec", ticker: "HACK", last: 62.48, today: 0.94, fiveDays: -0.48, oneMonth: -1.24, ytd: 1.86, oneYear: 18.42, threeYears: 42.64, dayRange: [61.28, 63.12], weekRange52: [48.86, 66.48] },
  { name: "Solactive Cloud Tech", ticker: "CLOU", last: 24.86, today: 1.32, fiveDays: -1.42, oneMonth: -3.86, ytd: -5.48, oneYear: 8.64, threeYears: 4.28, dayRange: [24.14, 25.18], weekRange52: [18.42, 28.64] },
  { name: "S&P Semiconductor", ticker: "SPSISC", last: 6842.48, today: 2.14, fiveDays: -0.86, oneMonth: -4.28, ytd: -6.82, oneYear: 28.42, threeYears: 118.64, dayRange: [6648.14, 6898.72], weekRange52: [4862.48, 7842.36] },
];

// — Volatility & Sentiment (8 vol/sentiment/risk gauges)
export const US_IDX_VOL_SENTIMENT: PerformanceRow[] = [
  { name: "CBOE Volatility (VIX)", ticker: "VIX", last: 21.77, today: -4.32, fiveDays: 12.68, oneMonth: 28.42, ytd: 36.94, oneYear: 42.18, threeYears: -8.64, dayRange: [20.84, 23.56], weekRange52: [10.62, 65.73] },
  { name: "VIX 9-Day", ticker: "VIX9D", last: 19.86, today: -5.48, fiveDays: 14.24, oneMonth: 32.86, ytd: 42.18, oneYear: 48.64, threeYears: -4.28, dayRange: [18.92, 21.42], weekRange52: [8.86, 72.48] },
  { name: "VIX 3-Month", ticker: "VIX3M", last: 22.42, today: -2.86, fiveDays: 8.42, oneMonth: 18.64, ytd: 24.86, oneYear: 28.42, threeYears: 2.48, dayRange: [21.68, 23.18], weekRange52: [12.48, 48.62] },
  { name: "CBOE Nasdaq Vol", ticker: "VXN", last: 24.86, today: -3.92, fiveDays: 10.48, oneMonth: 24.86, ytd: 32.42, oneYear: 38.64, threeYears: -2.86, dayRange: [23.84, 26.12], weekRange52: [12.86, 58.42] },
  { name: "CBOE Put/Call Ratio", ticker: "CPC", last: 0.92, today: -2.14, fiveDays: 8.86, oneMonth: 12.48, ytd: 4.28, oneYear: -6.42, threeYears: 2.86, dayRange: [0.86, 0.98], weekRange52: [0.62, 1.42] },
  { name: "CBOE Skew Index", ticker: "SKEW", last: 142.86, today: 0.48, fiveDays: -2.14, oneMonth: -4.86, ytd: -2.48, oneYear: 6.42, threeYears: 8.64, dayRange: [140.28, 144.62], weekRange52: [118.42, 168.86] },
  { name: "S&P 500 Realized Vol", ticker: "RVOL", last: 18.42, today: -1.86, fiveDays: 6.48, oneMonth: 14.28, ytd: 22.86, oneYear: 12.48, threeYears: -4.64, dayRange: [17.86, 19.28], weekRange52: [8.42, 38.64] },
  { name: "AAII Bull-Bear Spread", ticker: "AAII", last: -12.48, today: 0.00, fiveDays: -8.42, oneMonth: -24.86, ytd: -32.48, oneYear: -18.64, threeYears: 4.28, dayRange: [-14.86, -10.42], weekRange52: [-42.86, 28.48] },
];

// — Fixed Income (8 bond/yield indices)
export const US_IDX_FIXED_INCOME: PerformanceRow[] = [
  { name: "US 10-Year Yield", ticker: "TNX", last: 4.28, today: -0.46, fiveDays: -2.86, oneMonth: -4.48, ytd: -6.24, oneYear: 0.94, threeYears: 68.42, dayRange: [4.22, 4.36], weekRange52: [3.62, 4.98] },
  { name: "US 2-Year Yield", ticker: "IRX2", last: 3.96, today: -0.50, fiveDays: -3.42, oneMonth: -6.84, ytd: -8.42, oneYear: -12.86, threeYears: 42.48, dayRange: [3.88, 4.06], weekRange52: [3.42, 5.12] },
  { name: "US 30-Year Yield", ticker: "TYX", last: 4.62, today: -0.22, fiveDays: -1.94, oneMonth: -2.86, ytd: -2.48, oneYear: 4.28, threeYears: 72.86, dayRange: [4.56, 4.68], weekRange52: [3.94, 5.18] },
  { name: "Bloomberg US Agg Bond", ticker: "AGG", last: 98.42, today: 0.12, fiveDays: 0.48, oneMonth: 1.24, ytd: 1.86, oneYear: 4.42, threeYears: -6.48, dayRange: [97.86, 98.68], weekRange52: [92.48, 100.86] },
  { name: "ICE US Treasury 7-10Y", ticker: "IEF", last: 94.86, today: 0.18, fiveDays: 0.64, oneMonth: 1.48, ytd: 2.14, oneYear: 4.86, threeYears: -12.42, dayRange: [94.28, 95.18], weekRange52: [86.42, 98.64] },
  { name: "ICE US Corp Bond", ticker: "LQD", last: 108.42, today: 0.08, fiveDays: 0.28, oneMonth: 0.86, ytd: 1.42, oneYear: 5.86, threeYears: -4.28, dayRange: [107.86, 108.92], weekRange52: [98.64, 112.48] },
  { name: "ICE US High Yield", ticker: "HYG", last: 78.86, today: 0.14, fiveDays: -0.42, oneMonth: -0.68, ytd: 0.86, oneYear: 6.42, threeYears: 2.48, dayRange: [78.28, 79.18], weekRange52: [72.14, 82.48] },
  { name: "Bloomberg US TIPS", ticker: "TIP", last: 108.24, today: 0.10, fiveDays: 0.36, oneMonth: 1.08, ytd: 1.48, oneYear: 4.28, threeYears: -2.86, dayRange: [107.68, 108.62], weekRange52: [100.42, 112.86] },
];

// Legacy alias for backward compat
export const US_INDICES: PerformanceRow[] = US_IDX_POPULAR;

// ============================================================
// US MARKETS — Sectors
// ============================================================
export const US_SECTORS: PerformanceRow[] = [
  { name: "Technology", ticker: "XLK", last: 139.48, today: 1.80, fiveDays: -0.06, oneMonth: -2.50, ytd: -2.92, oneYear: 27.90, threeYears: 102.26, dayRange: [135.46, 140.21], weekRange52: [86.23, 153.00] },
  { name: "Healthcare", ticker: "XLV", last: 153.72, today: 1.02, fiveDays: -1.78, oneMonth: -1.32, ytd: -0.35, oneYear: 3.34, threeYears: 23.34, dayRange: [151.13, 154.55], weekRange52: [127.35, 160.59] },
  { name: "Consumer Staples", ticker: "XLP", last: 85.64, today: 0.22, fiveDays: -1.37, oneMonth: -1.67, ytd: 10.67, oneYear: 3.75, threeYears: 20.31, dayRange: [84.80, 86.16], weekRange52: [75.16, 90.14] },
  { name: "Utilities", ticker: "XLU", last: 46.52, today: 0.24, fiveDays: -0.89, oneMonth: 7.75, ytd: 9.74, oneYear: 21.23, threeYears: 43.16, dayRange: [46.04, 46.95], weekRange52: [35.51, 47.80] },
  { name: "Consumer Discr.", ticker: "XLY", last: 113.86, today: 0.13, fiveDays: -1.55, oneMonth: -2.52, ytd: -4.04, oneYear: 11.43, threeYears: 64.18, dayRange: [110.99, 114.93], weekRange52: [86.55, 125.01] },
  { name: "Comm. Svcs", ticker: "XLC", last: 117.24, today: 0.09, fiveDays: -1.04, oneMonth: 0.58, ytd: -0.14, oneYear: 17.22, threeYears: 121.77, dayRange: [115.50, 117.79], weekRange52: [84.02, 120.41] },
  { name: "Basic Materials", ticker: "XLB", last: 49.82, today: 0.26, fiveDays: -3.72, oneMonth: -4.20, ytd: 10.23, oneYear: 13.85, threeYears: 25.16, dayRange: [48.60, 50.19], weekRange52: [36.56, 54.14] },
  { name: "Financials", ticker: "XLF", last: 49.86, today: -0.47, fiveDays: -2.27, oneMonth: -6.69, ytd: -8.11, oneYear: 2.46, threeYears: 50.06, dayRange: [49.18, 50.52], weekRange52: [42.21, 56.52] },
  { name: "Industrials", ticker: "XLI", last: 170.24, today: 0.59, fiveDays: -2.86, oneMonth: -1.59, ytd: 10.20, oneYear: 27.33, threeYears: 69.45, dayRange: [166.17, 171.40], weekRange52: [112.75, 179.31] },
  { name: "Energy", ticker: "XLE", last: 56.42, today: -0.44, fiveDays: 0.23, oneMonth: 5.00, ytd: 25.97, oneYear: 28.83, threeYears: 34.58, dayRange: [55.94, 57.15], weekRange52: [37.25, 57.88] },
  { name: "Real Estate", ticker: "XLRE", last: 42.86, today: 0.21, fiveDays: -1.78, oneMonth: 1.73, ytd: 6.52, oneYear: 1.20, threeYears: 15.26, dayRange: [41.98, 43.13], weekRange52: [35.76, 44.07] },
];

// ---- Alternative / New-Age Sectors ----
export const US_SECTORS_ALT: PerformanceRow[] = [
  { name: "Semiconductors", ticker: "SMH", last: 234.86, today: 2.42, fiveDays: -1.18, oneMonth: -5.84, ytd: -8.42, oneYear: 34.86, threeYears: 142.48, dayRange: [228.14, 236.92], weekRange52: [162.48, 282.64] },
  { name: "Artificial Intelligence", ticker: "BOTZ", last: 32.48, today: 1.86, fiveDays: -0.92, oneMonth: -3.42, ytd: -4.86, oneYear: 28.42, threeYears: 86.24, dayRange: [31.68, 32.84], weekRange52: [22.14, 38.62] },
  { name: "Clean Energy", ticker: "ICLN", last: 14.26, today: 0.72, fiveDays: -2.48, oneMonth: -6.84, ytd: -12.42, oneYear: -18.64, threeYears: -42.86, dayRange: [13.92, 14.48], weekRange52: [11.42, 22.86] },
  { name: "Electric Vehicles", ticker: "DRIV", last: 28.42, today: 0.94, fiveDays: -1.86, oneMonth: -4.28, ytd: -6.24, oneYear: 8.42, threeYears: 14.86, dayRange: [27.68, 28.72], weekRange52: [22.48, 34.86] },
  { name: "Cybersecurity", ticker: "CIBR", last: 58.64, today: 1.14, fiveDays: -0.48, oneMonth: -1.86, ytd: 2.42, oneYear: 22.86, threeYears: 48.42, dayRange: [57.48, 59.12], weekRange52: [42.86, 62.48] },
  { name: "Blockchain & Crypto", ticker: "BLOK", last: 42.86, today: 2.86, fiveDays: -3.42, oneMonth: -8.64, ytd: -14.28, oneYear: 62.48, threeYears: 24.86, dayRange: [41.28, 43.48], weekRange52: [22.14, 58.42] },
  { name: "Cannabis", ticker: "MSOS", last: 8.42, today: -1.24, fiveDays: -4.86, oneMonth: -12.48, ytd: -18.64, oneYear: -28.42, threeYears: -64.86, dayRange: [8.12, 8.78], weekRange52: [4.86, 14.28] },
  { name: "Space & Aerospace", ticker: "UFO", last: 22.48, today: 0.68, fiveDays: -1.42, oneMonth: -2.86, ytd: -1.24, oneYear: 14.86, threeYears: 8.42, dayRange: [22.08, 22.72], weekRange52: [16.48, 26.42] },
];

// ============================================================
// US MARKETS — Top 10 Stocks
// ============================================================
export const TOP_STOCKS: TopStock[] = [
  { symbol: "NVDA", name: "NVIDIA Corp", logo: "NV", logoColor: "bg-green-600", price: 875.28, change: 18.42, changePct: 2.15, volume: "68.5M", marketCap: "2.16T", high52w: 974.94, sparkline: [780, 810, 790, 830, 860, 840, 870, 875] },
  { symbol: "AAPL", name: "Apple Inc", logo: "AA", logoColor: "bg-zinc-600", price: 227.48, change: -2.34, changePct: -1.02, volume: "52.4M", marketCap: "3.48T", high52w: 237.23, sparkline: [220, 225, 218, 230, 228, 225, 229, 227] },
  { symbol: "MSFT", name: "Microsoft Corp", logo: "MS", logoColor: "bg-blue-600", price: 412.86, change: 5.64, changePct: 1.38, volume: "22.8M", marketCap: "3.07T", high52w: 468.35, sparkline: [380, 390, 395, 400, 408, 405, 410, 413] },
  { symbol: "AMZN", name: "Amazon.com", logo: "AM", logoColor: "bg-amber-600", price: 186.42, change: 3.28, changePct: 1.79, volume: "48.2M", marketCap: "1.94T", high52w: 201.20, sparkline: [165, 170, 175, 172, 180, 183, 185, 186] },
  { symbol: "GOOGL", name: "Alphabet Inc", logo: "GO", logoColor: "bg-red-500", price: 168.24, change: -1.86, changePct: -1.09, volume: "28.6M", marketCap: "2.08T", high52w: 191.75, sparkline: [155, 160, 165, 162, 170, 168, 166, 168] },
  { symbol: "META", name: "Meta Platforms", logo: "ME", logoColor: "bg-blue-500", price: 524.86, change: 8.42, changePct: 1.63, volume: "18.4M", marketCap: "1.34T", high52w: 602.95, sparkline: [470, 490, 500, 495, 510, 518, 522, 525] },
  { symbol: "TSLA", name: "Tesla Inc", logo: "TS", logoColor: "bg-red-600", price: 248.42, change: -6.84, changePct: -2.68, volume: "82.6M", marketCap: "790B", high52w: 488.54, sparkline: [280, 270, 260, 255, 250, 252, 248, 248] },
  { symbol: "BRK.B", name: "Berkshire Hath.", logo: "BH", logoColor: "bg-indigo-600", price: 478.24, change: 2.86, changePct: 0.60, volume: "4.2M", marketCap: "1.04T", high52w: 498.68, sparkline: [440, 450, 455, 460, 470, 475, 477, 478] },
  { symbol: "AVGO", name: "Broadcom Inc", logo: "AV", logoColor: "bg-red-700", price: 186.42, change: 4.28, changePct: 2.35, volume: "32.4M", marketCap: "868B", high52w: 251.88, sparkline: [160, 165, 170, 175, 180, 178, 184, 186] },
  { symbol: "JPM", name: "JPMorgan Chase", logo: "JP", logoColor: "bg-blue-700", price: 242.86, change: -1.42, changePct: -0.58, volume: "8.6M", marketCap: "698B", high52w: 280.25, sparkline: [220, 225, 230, 235, 240, 242, 244, 243] },
];

// ============================================================
// US MARKETS — Top 10 ETFs
// ============================================================
export const TOP_ETFS: TopETF[] = [
  { symbol: "SPY", name: "SPDR S&P 500", logo: "SP", logoColor: "bg-green-600", price: 597.42, changePct: 0.86, volume: "72.4M", aum: "562B", expenseRatio: "0.09%", sparkline: [570, 575, 580, 585, 590, 592, 595, 597] },
  { symbol: "QQQ", name: "Invesco QQQ", logo: "QQ", logoColor: "bg-blue-600", price: 506.84, changePct: 1.32, volume: "48.6M", aum: "286B", expenseRatio: "0.20%", sparkline: [480, 485, 490, 495, 500, 503, 505, 507] },
  { symbol: "VOO", name: "Vanguard S&P 500", logo: "VO", logoColor: "bg-red-600", price: 548.28, changePct: 0.84, volume: "12.8M", aum: "482B", expenseRatio: "0.03%", sparkline: [520, 525, 530, 535, 540, 543, 546, 548] },
  { symbol: "IWM", name: "iShares Russell 2000", logo: "IW", logoColor: "bg-zinc-600", price: 218.42, changePct: -0.42, volume: "28.4M", aum: "68B", expenseRatio: "0.19%", sparkline: [225, 222, 220, 218, 216, 217, 219, 218] },
  { symbol: "GLD", name: "SPDR Gold Shares", logo: "GL", logoColor: "bg-amber-500", price: 272.86, changePct: 0.78, volume: "8.6M", aum: "62B", expenseRatio: "0.40%", sparkline: [255, 258, 260, 264, 268, 270, 271, 273] },
  { symbol: "VTI", name: "Vanguard Total Market", logo: "VT", logoColor: "bg-teal-600", price: 278.42, changePct: 0.72, volume: "6.4M", aum: "412B", expenseRatio: "0.03%", sparkline: [264, 268, 270, 272, 275, 276, 277, 278] },
  { symbol: "ARKK", name: "ARK Innovation", logo: "AK", logoColor: "bg-purple-600", price: 52.84, changePct: -1.86, volume: "14.2M", aum: "6.8B", expenseRatio: "0.75%", sparkline: [58, 56, 55, 54, 53, 53, 53, 53] },
  { symbol: "XLF", name: "Financial Select", logo: "XF", logoColor: "bg-blue-500", price: 46.28, changePct: -0.48, volume: "18.6M", aum: "42B", expenseRatio: "0.09%", sparkline: [48, 47, 47, 46, 46, 46, 46, 46] },
  { symbol: "XLE", name: "Energy Select", logo: "XE", logoColor: "bg-orange-600", price: 86.42, changePct: 0.34, volume: "12.4M", aum: "38B", expenseRatio: "0.09%", sparkline: [82, 83, 84, 85, 85, 86, 86, 86] },
  { symbol: "SCHD", name: "Schwab US Dividend", logo: "SC", logoColor: "bg-cyan-600", price: 82.86, changePct: 0.22, volume: "8.2M", aum: "58B", expenseRatio: "0.06%", sparkline: [79, 80, 80, 81, 81, 82, 82, 83] },
];

// ============================================================
// US MARKETS — Top 10 Mutual Funds
// ============================================================
export const TOP_MUTUAL_FUNDS: TopMutualFund[] = [
  { name: "Vanguard 500 Index", ticker: "VFIAX", nav: 486.42, return1y: 24.86, return3y: 10.42, aum: "842B", expenseRatio: "0.04%" },
  { name: "Fidelity 500 Index", ticker: "FXAIX", nav: 192.84, return1y: 24.92, return3y: 10.48, aum: "486B", expenseRatio: "0.015%" },
  { name: "Vanguard Total Stock", ticker: "VTSAX", nav: 124.28, return1y: 23.42, return3y: 9.86, aum: "362B", expenseRatio: "0.04%" },
  { name: "Fidelity Contrafund", ticker: "FCNTX", nav: 18.42, return1y: 28.64, return3y: 12.24, aum: "142B", expenseRatio: "0.39%" },
  { name: "T. Rowe Price Growth", ticker: "PRGFX", nav: 86.42, return1y: 32.48, return3y: 8.64, aum: "68B", expenseRatio: "0.52%" },
  { name: "Vanguard Growth Index", ticker: "VIGAX", nav: 186.84, return1y: 30.24, return3y: 11.86, aum: "248B", expenseRatio: "0.05%" },
  { name: "American Funds Growth", ticker: "AGTHX", nav: 72.42, return1y: 26.42, return3y: 9.24, aum: "286B", expenseRatio: "0.62%" },
  { name: "Dodge & Cox Stock", ticker: "DODGX", nav: 248.86, return1y: 18.64, return3y: 12.86, aum: "86B", expenseRatio: "0.51%" },
  { name: "Fidelity Growth Co.", ticker: "FDGRX", nav: 32.24, return1y: 34.86, return3y: 10.42, aum: "62B", expenseRatio: "0.79%" },
  { name: "Vanguard Balanced", ticker: "VBIAX", nav: 48.86, return1y: 14.24, return3y: 6.42, aum: "48B", expenseRatio: "0.06%" },
];

// ============================================================
// US MARKETS — Economic Overview
// ============================================================
export const US_ECONOMIC: EconomicIndicator[] = [
  { label: "Fed Funds Rate", value: "4.50%", badge: { text: "0%", direction: "neutral" }, previous: "4.50%", releasedDate: "Jan 29", nextDate: "Mar 19" },
  { label: "CPI (YoY)", value: "2.8%", badge: { text: "-0.3%", direction: "down" }, previous: "3.1%", releasedDate: "Feb 12", nextDate: "Mar 12" },
  { label: "Core PCE (YoY)", value: "2.6%", badge: { text: "-0.2%", direction: "down" }, previous: "2.8%", releasedDate: "Feb 28", nextDate: "Mar 28" },
  { label: "GDP Growth (QoQ)", value: "2.4%", badge: { text: "-0.7%", direction: "down" }, previous: "3.1%", releasedDate: "Jan 30", nextDate: "Apr 30" },
  { label: "Unemployment Rate", value: "3.9%", badge: { text: "-0.1%", direction: "up" }, previous: "4.0%", releasedDate: "Mar 7", nextDate: "Apr 4" },
  { label: "Nonfarm Payrolls", value: "+275K", badge: { text: "-22.1%", direction: "down" }, previous: "+353K", releasedDate: "Mar 7", nextDate: "Apr 4" },
  { label: "10Y Treasury Yield", value: "4.12%", badge: { text: "-0.96%", direction: "down" }, previous: "4.16%", isLive: true },
  { label: "US Dollar Index (DXY)", value: "103.84", badge: { text: "-0.31%", direction: "down" }, previous: "104.16", isLive: true },
  { label: "Consumer Confidence", value: "106.7", badge: { text: "-3.8%", direction: "down" }, previous: "110.9", releasedDate: "Feb 25", nextDate: "Mar 25" },
  { label: "ISM Manufacturing", value: "50.3", badge: { text: "+2.4%", direction: "up" }, previous: "49.1", releasedDate: "Mar 3", nextDate: "Apr 1" },
];

// ============================================================
// US MARKETS — Market Summary News
// ============================================================
export const US_NEWS: NewsItem[] = [
  {
    headline: "NVIDIA surges on Saudi AI deal worth 500B, biggest single-day gain in 3 months",
    summary: "Saudi Arabia committed 500 billion to AI infrastructure, with NVIDIA positioned as a primary chip supplier. The stock jumped 4% in after-hours trading. Analysts see this as validation of the sustained AI spending cycle through 2026.",
    tickers: ["NVDA", "AMD"],
    sources: [{ name: "Reuters", logo: "R", color: "#ff8200" }, { name: "Bloomberg", logo: "B", color: "#2800d7" }, { name: "CNBC", logo: "C", color: "#005594" }],
    timeAgo: "2h ago",
  },
  {
    headline: "Pentagon awards 1.5B battlefield AI contract to Palantir",
    summary: "Palantir Technologies won a 1.5 billion defense contract for battlefield AI systems, marking the largest single AI defense award. PLTR shares rose 5.2% on the news, extending its 2025 rally to over 40%.",
    tickers: ["PLTR", "LMT"],
    sources: [{ name: "Defense One", logo: "D", color: "#1b3a5c" }, { name: "Reuters", logo: "R", color: "#ff8200" }],
    timeAgo: "4h ago",
  },
  {
    headline: "CrowdStrike hits all-time high on record ARR, cybersecurity demand accelerates",
    summary: "CrowdStrike reported record Annual Recurring Revenue of 3.65B, exceeding estimates by 5%. The cybersecurity firm also raised full-year guidance, citing increased enterprise adoption of its Falcon platform.",
    tickers: ["CRWD", "PANW"],
    sources: [{ name: "CNBC", logo: "C", color: "#005594" }, { name: "Barrons", logo: "B", color: "#336b87" }],
    timeAgo: "5h ago",
  },
  {
    headline: "Apple unveils AI-powered home robot at Spring event, stock edges higher",
    summary: "Apple introduced its first home robotics product powered by Apple Intelligence. The device integrates with the HomeKit ecosystem and features on-device AI processing. Shares rose 1.2% in after-hours trading.",
    tickers: ["AAPL"],
    sources: [{ name: "The Verge", logo: "T", color: "#e6127d" }, { name: "Bloomberg", logo: "B", color: "#2800d7" }],
    timeAgo: "6h ago",
  },
  {
    headline: "ASML record bookings as semiconductor supply crunch intensifies",
    summary: "ASML received record EUV lithography orders as chipmakers race to expand capacity amid surging AI demand. The Dutch firm's backlog now stretches into 2028.",
    tickers: ["ASML", "TSM"],
    sources: [{ name: "Financial Times", logo: "F", color: "#fff1e5" }, { name: "Reuters", logo: "R", color: "#ff8200" }],
    timeAgo: "7h ago",
  },
  {
    headline: "Tesla recalls 1.2M vehicles over Autopilot software, shares dip 2.8%",
    summary: "Tesla announced a voluntary recall affecting 1.2 million vehicles to update Autopilot software after NHTSA raised concerns about driver monitoring. The recall is executed via over-the-air update.",
    tickers: ["TSLA"],
    sources: [{ name: "CNBC", logo: "C", color: "#005594" }, { name: "Reuters", logo: "R", color: "#ff8200" }],
    timeAgo: "8h ago",
  },
  {
    headline: "Microsoft Azure revenue beats estimates by 8%, cloud growth reaccelerates",
    summary: "Microsoft reported Azure revenue growth of 31%, beating consensus of 28.5%. Management credited AI workloads and enterprise migration for the acceleration, guiding for continued momentum through FY26.",
    tickers: ["MSFT", "AMZN"],
    sources: [{ name: "Bloomberg", logo: "B", color: "#2800d7" }, { name: "Barrons", logo: "B", color: "#336b87" }],
    timeAgo: "9h ago",
  },
  {
    headline: "Eli Lilly obesity drug Mounjaro approved for new indications, expanding TAM",
    summary: "FDA approved Mounjaro for sleep apnea treatment alongside obesity, significantly expanding the addressable market. Analysts raised price targets across the board, with some seeing 30%+ upside.",
    tickers: ["LLY", "NVO"],
    sources: [{ name: "Reuters", logo: "R", color: "#ff8200" }, { name: "STAT News", logo: "S", color: "#d32f2f" }],
    timeAgo: "10h ago",
  },
  {
    headline: "JPMorgan raises S&P 500 target to 6,500 citing resilient earnings cycle",
    summary: "JPMorgan strategist Marko Kolanovic raised the year-end S&P 500 target to 6,500 from 5,800, citing better-than-expected Q4 earnings, strong consumer spending, and AI-driven productivity gains.",
    tickers: ["JPM", "SPY"],
    sources: [{ name: "Bloomberg", logo: "B", color: "#2800d7" }, { name: "CNBC", logo: "C", color: "#005594" }],
    timeAgo: "11h ago",
  },
  {
    headline: "Meta launches AI-powered ad platform, early adopters report 40% better ROAS",
    summary: "Meta rolled out its Advantage+ AI creative suite globally, automating ad creation and targeting. Early enterprise adopters report 40% improvement in return on ad spend, boosting advertiser sentiment.",
    tickers: ["META", "SNAP"],
    sources: [{ name: "The Verge", logo: "T", color: "#e6127d" }, { name: "Financial Times", logo: "F", color: "#fff1e5" }],
    timeAgo: "12h ago",
  },
  {
    headline: "Boeing secures record 42B order from United Airlines for 737 MAX and 787",
    summary: "United Airlines placed the largest single aircraft order in aviation history, committing to 200 Boeing 737 MAX and 100 787 Dreamliners. Boeing shares rose 3.1% on the announcement.",
    tickers: ["BA", "UAL"],
    sources: [{ name: "Reuters", logo: "R", color: "#ff8200" }, { name: "Bloomberg", logo: "B", color: "#2800d7" }],
    timeAgo: "13h ago",
  },
  {
    headline: "Coinbase revenue surges 65% as institutional crypto adoption hits record levels",
    summary: "Coinbase reported quarterly revenue of 1.64B, up 65% YoY, driven by institutional trading volume and staking revenue. The exchange now custodies over 180B in assets.",
    tickers: ["COIN", "MSTR"],
    sources: [{ name: "CNBC", logo: "C", color: "#005594" }, { name: "The Block", logo: "T", color: "#1a1a1a" }],
    timeAgo: "14h ago",
  },
  {
    headline: "Amazon expands same-day delivery to 50 new metros, logistics capex up 25%",
    summary: "Amazon announced a major logistics expansion covering 50 additional metro areas for same-day delivery. The company is investing 15B in fulfillment infrastructure this year, intensifying competition with Walmart.",
    tickers: ["AMZN", "WMT"],
    sources: [{ name: "Reuters", logo: "R", color: "#ff8200" }, { name: "CNBC", logo: "C", color: "#005594" }],
    timeAgo: "15h ago",
  },
  {
    headline: "Visa reports 12% payment volume growth, cross-border travel fully recovered",
    summary: "Visa's quarterly results showed payment volume growth of 12%, with cross-border transactions exceeding pre-pandemic levels for the first time. International travel spending was the key driver.",
    tickers: ["V", "MA"],
    sources: [{ name: "Bloomberg", logo: "B", color: "#2800d7" }, { name: "Barrons", logo: "B", color: "#336b87" }],
    timeAgo: "16h ago",
  },
];

// ============================================================
// US MARKETS — Stock Screener
// ============================================================
export const SCREENERS: ScreenerItem[] = [
  { name: "Top Rated Stocks", description: "Strong Buy or Top across Quant, SA Authors and Wall Street", resultCount: 49 },
  { name: "Top Growth Stocks", description: "Revenue growth >25% with a Strong Buy or Buy rating", resultCount: 156 },
  { name: "High Dividend Yield", description: "Dividend yield above 4% with Quant Rating of Strong Buy", resultCount: 28 },
  { name: "Top Value Stocks", description: "Market cap >1B, P/E below 15 with Strong Buy rating", resultCount: 48 },
  { name: "Top Tech Stocks", description: "Top technology stocks ranked by Quant Rating", resultCount: 72 },
];

// ============================================================
// US MARKETS — Earnings Calendar
// ============================================================
export const EARNINGS_DAYS: EarningsDay[] = [
  { day: "MON", date: 10, count: 12 },
  { day: "TUE", date: 11, count: 28 },
  { day: "WED", date: 12, count: 34 },
  { day: "THU", date: 13, count: 22 },
  { day: "FRI", date: 14, count: 8 },
];

export const EARNINGS_COMPANIES: Record<number, EarningsCompany[]> = {
  10: [
    { symbol: "ORCL", name: "Oracle Corp", logoColor: "bg-red-600", epsEstimate: "1.48", timing: "AMC" },
    { symbol: "CASY", name: "Casey's General", logoColor: "bg-green-600", epsEstimate: "3.82", timing: "BMO" },
  ],
  11: [
    { symbol: "ADBE", name: "Adobe Inc", logoColor: "bg-red-500", epsEstimate: "4.97", timing: "AMC" },
    { symbol: "KR", name: "Kroger Co", logoColor: "bg-blue-600", epsEstimate: "1.02", timing: "BMO" },
    { symbol: "S", name: "SentinelOne", logoColor: "bg-purple-600", epsEstimate: "-0.02", timing: "AMC" },
  ],
  12: [
    { symbol: "DG", name: "Dollar General", logoColor: "bg-amber-600", epsEstimate: "1.86", timing: "BMO" },
    { symbol: "ULTA", name: "Ulta Beauty", logoColor: "bg-pink-600", epsEstimate: "5.42", timing: "AMC" },
  ],
  13: [
    { symbol: "AVGO", name: "Broadcom Inc", logoColor: "bg-red-700", epsEstimate: "1.51", timing: "AMC" },
    { symbol: "COST", name: "Costco Wholesale", logoColor: "bg-red-600", epsEstimate: "4.12", timing: "AMC" },
    { symbol: "DOCU", name: "DocuSign", logoColor: "bg-blue-500", epsEstimate: "0.86", timing: "AMC" },
  ],
  14: [
    { symbol: "BJ", name: "BJ's Wholesale", logoColor: "bg-green-700", epsEstimate: "0.92", timing: "BMO" },
  ],
};

// ============================================================
// GLOBAL MARKETS — Indices by Region
// ============================================================
export const GLOBAL_INDICES: Record<string, PerformanceRow[]> = {
  Popular: [
    { name: "S&P 500", last: 6004, today: 0.46, fiveDays: 1.12, oneMonth: 2.84, ytd: 4.62, oneYear: 12.48, threeYears: 28.64, dayRange: [5952, 6018], weekRange52: [4954, 6088] },
    { name: "NASDAQ Composite", last: 19644, today: -0.40, fiveDays: -0.82, oneMonth: 1.96, ytd: 3.18, oneYear: 18.24, threeYears: 32.10, dayRange: [19520, 19748], weekRange52: [15480, 20210] },
    { name: "FTSE 100", last: 8412, today: 0.28, fiveDays: 0.64, oneMonth: 1.42, ytd: 2.86, oneYear: 8.24, threeYears: 18.46, dayRange: [8368, 8430], weekRange52: [7410, 8540] },
    { name: "DAX 40", last: 18892, today: 0.51, fiveDays: 1.28, oneMonth: 3.16, ytd: 6.42, oneYear: 14.86, threeYears: 34.20, dayRange: [18742, 18920], weekRange52: [15480, 19240] },
    { name: "Nikkei 225", last: 39413, today: 1.14, fiveDays: 2.46, oneMonth: 4.82, ytd: 8.24, oneYear: 22.68, threeYears: 42.16, dayRange: [38840, 39480], weekRange52: [30480, 40280] },
    { name: "Hang Seng", last: 19845, today: -0.62, fiveDays: -1.84, oneMonth: -3.42, ytd: -5.86, oneYear: -8.24, threeYears: -22.40, dayRange: [19720, 19940], weekRange52: [16280, 22480] },
    { name: "SENSEX", last: 82648, today: 0.47, fiveDays: 0.92, oneMonth: 2.18, ytd: 3.86, oneYear: 10.42, threeYears: 32.80, dayRange: [82120, 82780], weekRange52: [70240, 84620] },
    { name: "Shanghai Composite", last: 3086, today: 0.61, fiveDays: 1.46, oneMonth: 2.84, ytd: 4.12, oneYear: 6.48, threeYears: -2.86, dayRange: [3052, 3094], weekRange52: [2820, 3280] },
    { name: "EURO STOXX 50", last: 5124, today: 0.34, fiveDays: 0.86, oneMonth: 2.48, ytd: 5.14, oneYear: 12.86, threeYears: 28.42, dayRange: [5088, 5142], weekRange52: [4320, 5240] },
    { name: "Tadawul All Share", last: 12149, today: 0.42, fiveDays: 0.86, oneMonth: 1.92, ytd: 3.48, oneYear: 8.64, threeYears: 22.40, dayRange: [12060, 12180], weekRange52: [10480, 12640] },
    { name: "Bovespa", last: 128450, today: -0.34, fiveDays: -1.26, oneMonth: -2.48, ytd: -4.12, oneYear: 6.84, threeYears: 14.62, dayRange: [127820, 129100], weekRange52: [112640, 136480] },
    { name: "ASX 200", last: 8102, today: 0.33, fiveDays: 0.74, oneMonth: 1.86, ytd: 3.42, oneYear: 9.64, threeYears: 20.18, dayRange: [8058, 8120], weekRange52: [7040, 8280] },
  ],
  Europe: [
    { name: "EURO STOXX 50", last: 5124, today: 0.34, fiveDays: 0.86, oneMonth: 2.48, ytd: 5.14, oneYear: 12.86, threeYears: 28.42, dayRange: [5088, 5142], weekRange52: [4320, 5240] },
    { name: "STOXX 600", last: 525, today: 0.27, fiveDays: 0.62, oneMonth: 1.48, ytd: 3.14, oneYear: 9.86, threeYears: 22.40, dayRange: [522, 526], weekRange52: [460, 534] },
    { name: "DAX 40", last: 18892, today: 0.51, fiveDays: 1.28, oneMonth: 3.16, ytd: 6.42, oneYear: 14.86, threeYears: 34.20, dayRange: [18742, 18920], weekRange52: [15480, 19240] },
    { name: "CAC 40", last: 8125, today: -0.18, fiveDays: -0.54, oneMonth: -1.28, ytd: -2.46, oneYear: 4.86, threeYears: 16.42, dayRange: [8086, 8152], weekRange52: [7240, 8480] },
    { name: "IBEX 35", last: 11486, today: 0.37, fiveDays: 0.84, oneMonth: 2.46, ytd: 4.82, oneYear: 12.64, threeYears: 28.40, dayRange: [11410, 11510], weekRange52: [9680, 11840] },
    { name: "SMI", last: 12285, today: 0.23, fiveDays: 0.52, oneMonth: 1.18, ytd: 2.64, oneYear: 7.42, threeYears: 14.86, dayRange: [12230, 12310], weekRange52: [10840, 12520] },
    { name: "AEX", last: 896, today: -0.35, fiveDays: -0.72, oneMonth: -1.46, ytd: -2.18, oneYear: 6.84, threeYears: 18.24, dayRange: [892, 901], weekRange52: [780, 924] },
    { name: "FTSE MIB", last: 34286, today: 0.42, fiveDays: 1.14, oneMonth: 2.86, ytd: 5.86, oneYear: 14.42, threeYears: 42.86, dayRange: [34042, 34348], weekRange52: [28420, 35120] },
    { name: "OMX Stockholm 30", last: 2548, today: -0.28, fiveDays: -0.86, oneMonth: -1.64, ytd: -0.42, oneYear: 8.86, threeYears: 12.48, dayRange: [2532, 2562], weekRange52: [2180, 2680] },
    { name: "PSI 20", last: 6842, today: 0.32, fiveDays: 0.74, oneMonth: 1.86, ytd: 4.24, oneYear: 10.86, threeYears: 32.48, dayRange: [6804, 6870], weekRange52: [5840, 7120] },
    { name: "WIG 20", last: 2486, today: 0.56, fiveDays: 1.42, oneMonth: 3.86, ytd: 8.42, oneYear: 18.64, threeYears: 28.42, dayRange: [2462, 2502], weekRange52: [1940, 2640] },
    { name: "ATX", last: 3648, today: 0.38, fiveDays: 0.92, oneMonth: 2.14, ytd: 4.86, oneYear: 12.48, threeYears: 22.86, dayRange: [3620, 3668], weekRange52: [3080, 3780] },
  ],
  "Middle East": [
    { name: "Tadawul All Share", last: 12149, today: 0.42, fiveDays: 0.86, oneMonth: 1.92, ytd: 3.48, oneYear: 8.64, threeYears: 22.40, dayRange: [12060, 12180], weekRange52: [10480, 12640] },
    { name: "ADX General", last: 9856, today: 0.18, fiveDays: 0.42, oneMonth: 1.14, ytd: 2.26, oneYear: 6.42, threeYears: 18.86, dayRange: [9812, 9878], weekRange52: [8640, 10240] },
    { name: "DFM General", last: 4285, today: 0.76, fiveDays: 1.64, oneMonth: 3.42, ytd: 6.18, oneYear: 14.86, threeYears: 36.42, dayRange: [4228, 4296], weekRange52: [3480, 4420] },
    { name: "QE Index", last: 10487, today: -0.27, fiveDays: -0.64, oneMonth: -1.42, ytd: -2.86, oneYear: 4.24, threeYears: 12.80, dayRange: [10440, 10520], weekRange52: [9240, 11080] },
    { name: "Muscat MSM 30", last: 4682, today: 0.26, fiveDays: 0.54, oneMonth: 1.28, ytd: 2.42, oneYear: 6.86, threeYears: 16.24, dayRange: [4662, 4694], weekRange52: [4120, 4840] },
    { name: "Kuwait Premier", last: 8248, today: 0.35, fiveDays: 0.76, oneMonth: 2.18, ytd: 4.42, oneYear: 10.86, threeYears: 28.42, dayRange: [8204, 8272], weekRange52: [7120, 8680] },
    { name: "Bahrain All Share", last: 2085, today: 0.20, fiveDays: 0.42, oneMonth: 1.24, ytd: 2.86, oneYear: 7.42, threeYears: 18.86, dayRange: [2074, 2092], weekRange52: [1840, 2200] },
    { name: "EGX 30", last: 28643, today: -0.65, fiveDays: -1.42, oneMonth: -3.18, ytd: -5.42, oneYear: 18.64, threeYears: 62.40, dayRange: [28480, 28860], weekRange52: [22840, 32480] },
    { name: "Amman ASE", last: 2486, today: 0.14, fiveDays: 0.32, oneMonth: 0.86, ytd: 1.64, oneYear: 4.86, threeYears: 10.42, dayRange: [2478, 2498], weekRange52: [2240, 2580] },
    { name: "Tel Aviv 125", last: 2148, today: -0.42, fiveDays: -1.24, oneMonth: -2.86, ytd: -4.42, oneYear: 2.86, threeYears: 8.64, dayRange: [2128, 2168], weekRange52: [1820, 2340] },
    { name: "Casablanca MASI", last: 14287, today: -0.29, fiveDays: -0.64, oneMonth: -1.42, ytd: -2.18, oneYear: 6.84, threeYears: 18.42, dayRange: [14220, 14340], weekRange52: [12240, 14860] },
    { name: "S&P Pan Arab", last: 1249, today: 0.52, fiveDays: 1.14, oneMonth: 2.86, ytd: 5.28, oneYear: 12.64, threeYears: 32.80, dayRange: [1238, 1254], weekRange52: [1060, 1320] },
  ],
  UK: [
    { name: "FTSE 100", last: 8412, today: 0.28, fiveDays: 0.64, oneMonth: 1.42, ytd: 2.86, oneYear: 8.24, threeYears: 18.46, dayRange: [8368, 8430], weekRange52: [7410, 8540] },
    { name: "FTSE 250", last: 20486, today: -0.21, fiveDays: -0.68, oneMonth: 0.94, ytd: 3.86, oneYear: 12.40, threeYears: 14.20, dayRange: [20380, 20560], weekRange52: [17840, 21200] },
    { name: "FTSE All-Share", last: 4625, today: 0.18, fiveDays: 0.72, oneMonth: 1.48, ytd: 5.12, oneYear: 9.86, threeYears: 17.40, dayRange: [4608, 4638], weekRange52: [4120, 4720] },
    { name: "FTSE 350", last: 4286, today: -0.16, fiveDays: 0.42, oneMonth: 1.24, ytd: 4.68, oneYear: 9.42, threeYears: 16.80, dayRange: [4274, 4302], weekRange52: [3840, 4380] },
    { name: "FTSE AIM All-Share", last: 743, today: 0.57, fiveDays: 1.24, oneMonth: 2.86, ytd: 8.42, oneYear: 16.80, threeYears: -4.20, dayRange: [736, 746], weekRange52: [620, 780] },
    { name: "FTSE SmallCap", last: 6842, today: 0.27, fiveDays: 0.92, oneMonth: 2.14, ytd: 6.80, oneYear: 14.60, threeYears: 12.40, dayRange: [6812, 6868], weekRange52: [5980, 7040] },
    { name: "FTSE AIM 100", last: 4249, today: 0.67, fiveDays: 1.48, oneMonth: 3.24, ytd: 9.60, oneYear: 18.40, threeYears: -2.80, dayRange: [4208, 4262], weekRange52: [3560, 4420] },
    { name: "FTSE 100 ESG Select", last: 8149, today: 0.23, fiveDays: 0.68, oneMonth: 1.42, ytd: 5.12, oneYear: 10.20, threeYears: 19.80, dayRange: [8118, 8168], weekRange52: [7240, 8340] },
    { name: "FTSE 350 Financials", last: 6248, today: -0.30, fiveDays: -1.12, oneMonth: 0.86, ytd: 4.24, oneYear: 12.80, threeYears: 22.40, dayRange: [6212, 6284], weekRange52: [5480, 6520] },
    { name: "FTSE 350 Technology", last: 3249, today: 1.33, fiveDays: 2.86, oneMonth: 4.68, ytd: 14.20, oneYear: 28.40, threeYears: 42.80, dayRange: [3198, 3268], weekRange52: [2640, 3480] },
    { name: "VFTSE", last: 16, today: -4.98, fiveDays: -8.42, oneMonth: -12.60, ytd: -18.40, oneYear: -24.80, threeYears: -32.60, dayRange: [16, 17], weekRange52: [12, 24] },
  ],
  "Asia (X China)": [
    { name: "Nikkei 225", last: 39413, today: 1.14, fiveDays: 2.46, oneMonth: 4.82, ytd: 8.24, oneYear: 22.68, threeYears: 42.16, dayRange: [38840, 39480], weekRange52: [30480, 40280] },
    { name: "TOPIX", last: 2748, today: 0.86, fiveDays: 1.92, oneMonth: 3.64, ytd: 6.42, oneYear: 18.86, threeYears: 36.48, dayRange: [2720, 2758], weekRange52: [2280, 2840] },
    { name: "KOSPI", last: 2684, today: -0.46, fiveDays: -1.24, oneMonth: -2.86, ytd: -4.42, oneYear: -2.18, threeYears: -8.64, dayRange: [2668, 2698], weekRange52: [2340, 2860] },
    { name: "SENSEX", last: 82648, today: 0.47, fiveDays: 0.92, oneMonth: 2.18, ytd: 3.86, oneYear: 10.42, threeYears: 32.80, dayRange: [82120, 82780], weekRange52: [70240, 84620] },
    { name: "NIFTY 50", last: 24862, today: 0.52, fiveDays: 1.06, oneMonth: 2.42, ytd: 4.12, oneYear: 11.86, threeYears: 36.42, dayRange: [24680, 24920], weekRange52: [21240, 25480] },
    { name: "ASX 200", last: 8102, today: 0.33, fiveDays: 0.74, oneMonth: 1.86, ytd: 3.42, oneYear: 9.64, threeYears: 20.18, dayRange: [8058, 8120], weekRange52: [7040, 8280] },
    { name: "STI", last: 3843, today: 0.39, fiveDays: 0.82, oneMonth: 1.64, ytd: 2.86, oneYear: 7.84, threeYears: 14.26, dayRange: [3818, 3850], weekRange52: [3320, 3920] },
    { name: "TAIEX", last: 22486, today: 0.68, fiveDays: 1.42, oneMonth: 3.24, ytd: 6.86, oneYear: 24.42, threeYears: 48.86, dayRange: [22280, 22540], weekRange52: [18240, 23480] },
    { name: "SET Index", last: 1386, today: -0.34, fiveDays: -0.86, oneMonth: -2.14, ytd: -3.86, oneYear: -6.42, threeYears: -14.86, dayRange: [1378, 1394], weekRange52: [1240, 1520] },
    { name: "Jakarta Composite", last: 7248, today: 0.24, fiveDays: 0.58, oneMonth: 1.42, ytd: 2.86, oneYear: 6.42, threeYears: 12.48, dayRange: [7210, 7268], weekRange52: [6440, 7520] },
    { name: "PSEi", last: 6842, today: -0.52, fiveDays: -1.48, oneMonth: -3.24, ytd: -5.86, oneYear: -2.42, threeYears: -8.86, dayRange: [6808, 6880], weekRange52: [6040, 7280] },
    { name: "NZX 50", last: 12486, today: 0.18, fiveDays: 0.42, oneMonth: 0.86, ytd: 1.64, oneYear: 4.86, threeYears: 8.42, dayRange: [12448, 12520], weekRange52: [11240, 12840] },
  ],
  China: [
    { name: "Shanghai Composite", last: 3086, today: 0.61, fiveDays: 1.46, oneMonth: 2.84, ytd: 4.12, oneYear: 6.48, threeYears: -2.86, dayRange: [3052, 3094], weekRange52: [2820, 3280] },
    { name: "Shenzhen Component", last: 9486, today: 0.78, fiveDays: 1.86, oneMonth: 3.42, ytd: 5.86, oneYear: 8.42, threeYears: -8.64, dayRange: [9380, 9520], weekRange52: [8240, 10480] },
    { name: "CSI 300", last: 3648, today: 0.52, fiveDays: 1.24, oneMonth: 2.86, ytd: 4.42, oneYear: 5.86, threeYears: -6.42, dayRange: [3612, 3668], weekRange52: [3240, 3920] },
    { name: "Hang Seng", last: 19845, today: -0.62, fiveDays: -1.84, oneMonth: -3.42, ytd: -5.86, oneYear: -8.24, threeYears: -22.40, dayRange: [19720, 19940], weekRange52: [16280, 22480] },
    { name: "Hang Seng Tech", last: 4286, today: -1.24, fiveDays: -3.42, oneMonth: -6.86, ytd: -10.42, oneYear: -14.86, threeYears: -42.48, dayRange: [4228, 4348], weekRange52: [3480, 5640] },
    { name: "STAR 50", last: 986, today: 0.92, fiveDays: 2.14, oneMonth: 4.86, ytd: 8.42, oneYear: 12.64, threeYears: -18.42, dayRange: [972, 992], weekRange52: [780, 1140] },
    { name: "ChiNext", last: 1948, today: 0.86, fiveDays: 2.48, oneMonth: 5.24, ytd: 9.86, oneYear: 14.42, threeYears: -12.86, dayRange: [1918, 1962], weekRange52: [1580, 2240] },
    { name: "CSI 500", last: 5486, today: 0.64, fiveDays: 1.48, oneMonth: 3.24, ytd: 5.42, oneYear: 4.86, threeYears: -14.42, dayRange: [5432, 5512], weekRange52: [4840, 5920] },
    { name: "CSI 1000", last: 6248, today: 0.72, fiveDays: 1.86, oneMonth: 4.42, ytd: 7.86, oneYear: 6.42, threeYears: -18.86, dayRange: [6178, 6284], weekRange52: [5320, 6840] },
    { name: "MSCI China", last: 58, today: -0.48, fiveDays: -1.64, oneMonth: -3.86, ytd: -6.42, oneYear: -10.24, threeYears: -28.64, dayRange: [57, 59], weekRange52: [48, 68] },
    { name: "FTSE China A50", last: 12486, today: 0.56, fiveDays: 1.32, oneMonth: 2.86, ytd: 4.64, oneYear: 6.24, threeYears: -4.86, dayRange: [12380, 12540], weekRange52: [10840, 13280] },
    { name: "Hang Seng China Ent.", last: 6842, today: -0.86, fiveDays: -2.42, oneMonth: -4.86, ytd: -8.24, oneYear: -12.48, threeYears: -32.86, dayRange: [6784, 6920], weekRange52: [5680, 7840] },
  ],
  "Latin America": [
    { name: "Bovespa", last: 128450, today: -0.34, fiveDays: -1.26, oneMonth: -2.48, ytd: -4.12, oneYear: 6.84, threeYears: 14.62, dayRange: [127820, 129100], weekRange52: [112640, 136480] },
    { name: "IPC Mexico", last: 54286, today: 0.34, fiveDays: 0.72, oneMonth: 1.86, ytd: 2.48, oneYear: 8.42, threeYears: 16.84, dayRange: [53980, 54420], weekRange52: [48240, 56120] },
    { name: "Merval", last: 1842560, today: 1.36, fiveDays: 3.84, oneMonth: 12.46, ytd: 28.64, oneYear: 142.80, threeYears: 486.20, dayRange: [1810400, 1848200], weekRange52: [684200, 1920400] },
    { name: "S&P/CLX IPSA", last: 6842, today: 0.28, fiveDays: 0.64, oneMonth: 1.48, ytd: 3.86, oneYear: 12.42, threeYears: 24.86, dayRange: [6808, 6868], weekRange52: [5840, 7120] },
    { name: "COLCAP", last: 1486, today: 0.42, fiveDays: 0.86, oneMonth: 2.14, ytd: 4.42, oneYear: 18.86, threeYears: 28.42, dayRange: [1472, 1498], weekRange52: [1180, 1560] },
    { name: "S&P/BVL Peru General", last: 24862, today: 0.18, fiveDays: 0.42, oneMonth: 1.24, ytd: 2.86, oneYear: 8.42, threeYears: 14.86, dayRange: [24780, 24920], weekRange52: [21480, 25640] },
    { name: "BVPSI Panama", last: 486, today: 0.12, fiveDays: 0.28, oneMonth: 0.64, ytd: 1.42, oneYear: 4.86, threeYears: 8.42, dayRange: [484, 488], weekRange52: [440, 508] },
    { name: "MSCI LatAm", last: 2248, today: -0.24, fiveDays: -0.86, oneMonth: -1.64, ytd: -2.86, oneYear: 8.42, threeYears: 16.86, dayRange: [2232, 2264], weekRange52: [1920, 2420] },
    { name: "S&P Latin America 40", last: 2648, today: -0.18, fiveDays: -0.72, oneMonth: -1.42, ytd: -2.48, oneYear: 6.86, threeYears: 12.42, dayRange: [2632, 2668], weekRange52: [2280, 2840] },
    { name: "BVC Ecuador", last: 1842, today: 0.08, fiveDays: 0.24, oneMonth: 0.56, ytd: 1.24, oneYear: 3.86, threeYears: 6.42, dayRange: [1838, 1848], weekRange52: [1680, 1920] },
    { name: "Bolsa de Valores CR", last: 36248, today: 0.14, fiveDays: 0.36, oneMonth: 0.82, ytd: 1.86, oneYear: 5.42, threeYears: 10.86, dayRange: [36180, 36320], weekRange52: [32480, 37640] },
  ],
};

// ============================================================
// GLOBAL MARKETS — Commodities
// ============================================================
export const COMMODITIES: Record<string, GlobalRow[]> = {
  Popular: [
    { name: "Gold", subtitle: "XAU/USD", last: "2,934.50", change: "+24.80", changePct: "+0.85%", dayRange: "2,906 — 2,942", isUp: true },
    { name: "Crude Oil WTI", subtitle: "NYMEX", last: "76.42", change: "-0.72", changePct: "-0.94%", dayRange: "75.80 — 77.24", isUp: false },
    { name: "Silver", subtitle: "XAG/USD", last: "32.84", change: "+0.40", changePct: "+1.22%", dayRange: "32.28 — 33.02", isUp: true },
    { name: "Brent Crude", subtitle: "ICE", last: "80.86", change: "-0.58", changePct: "-0.71%", dayRange: "80.12 — 81.48", isUp: false },
    { name: "Natural Gas", subtitle: "NYMEX", last: "3.84", change: "+0.08", changePct: "+2.14%", dayRange: "3.72 — 3.88", isUp: true },
    { name: "Copper", subtitle: "COMEX", last: "4.28", change: "+0.02", changePct: "+0.47%", dayRange: "4.24 — 4.30", isUp: true },
  ],
  "Precious Metals": [
    { name: "Gold", subtitle: "XAU/USD", last: "2,934.50", change: "+24.80", changePct: "+0.85%", dayRange: "2,906 — 2,942", isUp: true },
    { name: "Silver", subtitle: "XAG/USD", last: "32.84", change: "+0.40", changePct: "+1.22%", dayRange: "32.28 — 33.02", isUp: true },
    { name: "Platinum", subtitle: "XPT/USD", last: "1,024.80", change: "+8.40", changePct: "+0.83%", dayRange: "1,012 — 1,028", isUp: true },
    { name: "Palladium", subtitle: "XPD/USD", last: "986.40", change: "-12.60", changePct: "-1.26%", dayRange: "978 — 1,002", isUp: false },
  ],
  Energy: [
    { name: "Crude Oil WTI", subtitle: "NYMEX", last: "76.42", change: "-0.72", changePct: "-0.94%", dayRange: "75.80 — 77.24", isUp: false },
    { name: "Brent Crude", subtitle: "ICE", last: "80.86", change: "-0.58", changePct: "-0.71%", dayRange: "80.12 — 81.48", isUp: false },
    { name: "Natural Gas", subtitle: "NYMEX", last: "3.84", change: "+0.08", changePct: "+2.14%", dayRange: "3.72 — 3.88", isUp: true },
    { name: "Heating Oil", subtitle: "NYMEX", last: "2.642", change: "-0.018", changePct: "-0.68%", dayRange: "2.618 — 2.668", isUp: false },
    { name: "Gasoline RBOB", subtitle: "NYMEX", last: "2.284", change: "+0.012", changePct: "+0.53%", dayRange: "2.264 — 2.296", isUp: true },
  ],
  Industrial: [
    { name: "Copper", subtitle: "COMEX", last: "4.28", change: "+0.02", changePct: "+0.47%", dayRange: "4.24 — 4.30", isUp: true },
    { name: "Aluminum", subtitle: "LME", last: "2,486.00", change: "-18.40", changePct: "-0.73%", dayRange: "2,462 — 2,508", isUp: false },
    { name: "Zinc", subtitle: "LME", last: "2,842.60", change: "+24.80", changePct: "+0.88%", dayRange: "2,810 — 2,856", isUp: true },
    { name: "Nickel", subtitle: "LME", last: "16,284.00", change: "+142.00", changePct: "+0.88%", dayRange: "16,080 — 16,340", isUp: true },
    { name: "Iron Ore", subtitle: "SGX", last: "108.42", change: "-1.86", changePct: "-1.69%", dayRange: "107.20 — 110.40", isUp: false },
  ],
  Agriculture: [
    { name: "Corn", subtitle: "CBOT", last: "456.25", change: "+3.50", changePct: "+0.77%", dayRange: "451 — 458", isUp: true },
    { name: "Wheat", subtitle: "CBOT", last: "584.80", change: "-4.20", changePct: "-0.71%", dayRange: "580 — 592", isUp: false },
    { name: "Soybeans", subtitle: "CBOT", last: "1,186.40", change: "+8.80", changePct: "+0.75%", dayRange: "1,174 — 1,192", isUp: true },
    { name: "Coffee", subtitle: "ICE", last: "186.42", change: "+2.86", changePct: "+1.56%", dayRange: "182.80 — 187.40", isUp: true },
    { name: "Sugar", subtitle: "ICE", last: "21.84", change: "-0.28", changePct: "-1.27%", dayRange: "21.60 — 22.18", isUp: false },
  ],
};

// ============================================================
// GLOBAL MARKETS — Currencies
// ============================================================
export const CURRENCIES: Record<string, GlobalRow[]> = {
  "Major Pairs": [
    { name: "EUR/USD", subtitle: "Euro / US Dollar", last: "1.0847", change: "-0.0013", changePct: "-0.12%", dayRange: "1.0828 — 1.0872", isUp: false },
    { name: "GBP/USD", subtitle: "British Pound / US Dollar", last: "1.2684", change: "+0.0010", changePct: "+0.08%", dayRange: "1.2658 — 1.2712", isUp: true },
    { name: "USD/JPY", subtitle: "US Dollar / Japanese Yen", last: "149.82", change: "+0.36", changePct: "+0.24%", dayRange: "149.28 — 150.14", isUp: true },
    { name: "USD/CHF", subtitle: "US Dollar / Swiss Franc", last: "0.8842", change: "+0.0018", changePct: "+0.20%", dayRange: "0.8816 — 0.8862", isUp: true },
    { name: "AUD/USD", subtitle: "Australian Dollar / US Dollar", last: "0.6548", change: "-0.0022", changePct: "-0.33%", dayRange: "0.6524 — 0.6578", isUp: false },
  ],
  "USD vs All": [
    { name: "USD/EUR", subtitle: "Euro", last: "0.9219", change: "+0.0011", changePct: "+0.12%", dayRange: "0.9204 — 0.9238", isUp: true },
    { name: "USD/GBP", subtitle: "British Pound", last: "0.7884", change: "-0.0006", changePct: "-0.08%", dayRange: "0.7868 — 0.7902", isUp: false },
    { name: "USD/JPY", subtitle: "Japanese Yen", last: "149.82", change: "+0.36", changePct: "+0.24%", dayRange: "149.28 — 150.14", isUp: true },
    { name: "USD/CHF", subtitle: "Swiss Franc", last: "0.8842", change: "+0.0018", changePct: "+0.20%", dayRange: "0.8816 — 0.8862", isUp: true },
    { name: "USD/CAD", subtitle: "Canadian Dollar", last: "1.3582", change: "+0.0024", changePct: "+0.18%", dayRange: "1.3548 — 1.3608", isUp: true },
    { name: "USD/INR", subtitle: "Indian Rupee", last: "82.94", change: "-0.05", changePct: "-0.06%", dayRange: "82.82 — 83.08", isUp: false },
    { name: "USD/CNY", subtitle: "Chinese Yuan", last: "7.2486", change: "+0.0042", changePct: "+0.06%", dayRange: "7.2418 — 7.2548", isUp: true },
    { name: "USD/KRW", subtitle: "South Korean Won", last: "1,342.80", change: "+2.40", changePct: "+0.18%", dayRange: "1,338 — 1,346", isUp: true },
    { name: "USD/SGD", subtitle: "Singapore Dollar", last: "1.3448", change: "+0.0012", changePct: "+0.09%", dayRange: "1.3428 — 1.3468", isUp: true },
    { name: "USD/MXN", subtitle: "Mexican Peso", last: "17.284", change: "-0.042", changePct: "-0.24%", dayRange: "17.218 — 17.348", isUp: false },
    { name: "USD/BRL", subtitle: "Brazilian Real", last: "4.9842", change: "+0.0186", changePct: "+0.37%", dayRange: "4.9624 — 4.9986", isUp: true },
    { name: "USD/ZAR", subtitle: "South African Rand", last: "18.486", change: "+0.064", changePct: "+0.35%", dayRange: "18.384 — 18.542", isUp: true },
  ],
  Crypto: [
    { name: "Bitcoin", subtitle: "BTC", last: "67,842.00", change: "+1,446.80", changePct: "+2.18%", dayRange: "66,200 — 68,400", isUp: true, marketCap: "1.33T" },
    { name: "Ethereum", subtitle: "ETH", last: "3,486.40", change: "+82.60", changePct: "+2.43%", dayRange: "3,380 — 3,520", isUp: true, marketCap: "418.4B" },
    { name: "Solana", subtitle: "SOL", last: "148.62", change: "+6.84", changePct: "+4.83%", dayRange: "140 — 150", isUp: true, marketCap: "66.8B" },
    { name: "BNB", subtitle: "BNB", last: "586.40", change: "-8.20", changePct: "-1.38%", dayRange: "578 — 596", isUp: false, marketCap: "87.6B" },
    { name: "XRP", subtitle: "XRP", last: "0.6284", change: "+0.0186", changePct: "+3.05%", dayRange: "0.608 — 0.632", isUp: true, marketCap: "34.2B" },
    { name: "Cardano", subtitle: "ADA", last: "0.4842", change: "+0.0124", changePct: "+2.63%", dayRange: "0.468 — 0.488", isUp: true, marketCap: "17.1B" },
    { name: "Dogecoin", subtitle: "DOGE", last: "0.1284", change: "-0.0042", changePct: "-3.17%", dayRange: "0.124 — 0.134", isUp: false, marketCap: "18.4B" },
    { name: "Polkadot", subtitle: "DOT", last: "7.486", change: "+0.186", changePct: "+2.55%", dayRange: "7.28 — 7.52", isUp: true, marketCap: "9.8B" },
  ],
  "Cross Rates": [
    { name: "EUR/GBP", subtitle: "Euro / British Pound", last: "0.8552", change: "-0.0018", changePct: "-0.21%", dayRange: "0.8536 — 0.8574", isUp: false },
    { name: "EUR/JPY", subtitle: "Euro / Japanese Yen", last: "162.48", change: "+0.18", changePct: "+0.11%", dayRange: "162.12 — 162.84", isUp: true },
    { name: "GBP/JPY", subtitle: "British Pound / Japanese Yen", last: "190.04", change: "+0.58", changePct: "+0.31%", dayRange: "189.28 — 190.42", isUp: true },
    { name: "AUD/JPY", subtitle: "Australian Dollar / Japanese Yen", last: "98.12", change: "-0.14", changePct: "-0.14%", dayRange: "97.84 — 98.38", isUp: false },
    { name: "EUR/CHF", subtitle: "Euro / Swiss Franc", last: "0.9586", change: "+0.0008", changePct: "+0.08%", dayRange: "0.9568 — 0.9604", isUp: true },
  ],
};

// ============================================================
// GLOBAL MARKETS — News
// ============================================================
export const GLOBAL_NEWS: NewsItem[] = [
  {
    headline: "TSMC beats earnings as AI chip demand surges, stock jumps 6%",
    summary: "TSMC reported earnings beating estimates as AI chip demand continues to surge. Revenue grew 35% year-over-year driven by advanced node production for leading AI chip designers.",
    tickers: ["TSM", "NVDA"],
    sources: [{ name: "Reuters", logo: "R", color: "#ff8200" }, { name: "Nikkei Asia", logo: "N", color: "#c0202f" }],
    timeAgo: "1h ago",
  },
  {
    headline: "ECB holds rates steady as eurozone inflation cools to 2.4%",
    summary: "The European Central Bank held interest rates steady as eurozone inflation eased to 2.4%. European equities rallied on the decision, with German stocks leading gains.",
    tickers: ["EWG"],
    sources: [{ name: "Bloomberg", logo: "B", color: "#2800d7" }, { name: "Reuters", logo: "R", color: "#ff8200" }],
    timeAgo: "3h ago",
  },
  {
    headline: "Toyota announces 15B EV factory investment in Japan",
    summary: "Toyota announced a 15B investment to build a new EV battery and assembly plant in Japan, accelerating its electrification roadmap. Shares surged on the news.",
    tickers: ["TM"],
    sources: [{ name: "Nikkei Asia", logo: "N", color: "#c0202f" }, { name: "Bloomberg", logo: "B", color: "#2800d7" }],
    timeAgo: "4h ago",
  },
  {
    headline: "Shell reports record LNG trading profit, hits 52-week high",
    summary: "Shell reported record quarterly LNG trading profits as global natural gas demand remains elevated. Stock reached its 52-week high on the announcement.",
    tickers: ["SHEL"],
    sources: [{ name: "Financial Times", logo: "F", color: "#fff1e5" }, { name: "Reuters", logo: "R", color: "#ff8200" }],
    timeAgo: "5h ago",
  },
  {
    headline: "China cuts reserve requirements by 50bps to boost growth",
    summary: "China's central bank cut reserve requirements by 50 basis points to stimulate economic growth. Chinese tech stocks rallied broadly with Alibaba jumping 4%.",
    tickers: ["BABA", "JD", "PDD"],
    sources: [{ name: "SCMP", logo: "S", color: "#8b0000" }, { name: "Reuters", logo: "R", color: "#ff8200" }],
    timeAgo: "6h ago",
  },
];

// ============================================================
// INDIA — Key Market Data (Indices)
// ============================================================
export interface IndiaIndex {
  name: string;
  last: string;
  change: string;
  changePct: string;
  dayRange: string;
  isUp: boolean;
}

// — Popular (8 benchmark indices)
export const INDIA_IDX_POPULAR: PerformanceRow[] = [
  { name: "Nifty 50", last: 24682, today: 0.52, fiveDays: 1.18, oneMonth: 2.34, ytd: 4.82, oneYear: 12.46, threeYears: 38.24, dayRange: [24480, 24720], weekRange52: [20980, 25340] },
  { name: "S&P BSE Sensex", last: 81245, today: 0.51, fiveDays: 1.12, oneMonth: 2.28, ytd: 4.64, oneYear: 11.82, threeYears: 36.48, dayRange: [80620, 81380], weekRange52: [69060, 83480] },
  { name: "Nifty Bank", last: 52148, today: -0.36, fiveDays: -0.84, oneMonth: 1.46, ytd: 3.12, oneYear: 8.64, threeYears: 28.92, dayRange: [51840, 52460], weekRange52: [43520, 54680] },
  { name: "Nifty IT", last: 38924, today: 1.25, fiveDays: 2.48, oneMonth: 4.82, ytd: 8.36, oneYear: 18.24, threeYears: 22.64, dayRange: [38340, 39010], weekRange52: [31140, 41280] },
  { name: "Nifty Midcap 150", last: 21486, today: 0.44, fiveDays: 0.92, oneMonth: 3.18, ytd: 6.84, oneYear: 24.62, threeYears: 68.42, dayRange: [21280, 21540], weekRange52: [17190, 23640] },
  { name: "Nifty Smallcap 250", last: 16842, today: -0.37, fiveDays: -0.62, oneMonth: 2.84, ytd: 5.46, oneYear: 28.34, threeYears: 72.86, dayRange: [16710, 16920], weekRange52: [13470, 18940] },
  { name: "Nifty Financial Svcs", last: 24386, today: 0.28, fiveDays: 0.64, oneMonth: 1.82, ytd: 3.48, oneYear: 10.24, threeYears: 32.68, dayRange: [24180, 24440], weekRange52: [20240, 25620] },
  { name: "India VIX", last: 15, today: -4.14, fiveDays: -8.42, oneMonth: -12.64, ytd: -18.36, oneYear: -22.48, threeYears: -34.82, dayRange: [14, 16], weekRange52: [11, 22] },
];

// — Sectors (8 key sectoral indices)
export const INDIA_IDX_SECTORS: PerformanceRow[] = [
  { name: "Nifty Auto", last: 26842, today: 0.84, fiveDays: 1.62, oneMonth: 3.48, ytd: 7.24, oneYear: 22.86, threeYears: 64.28, dayRange: [26520, 26920], weekRange52: [21470, 28640] },
  { name: "Nifty Pharma", last: 22148, today: 1.22, fiveDays: 2.84, oneMonth: 5.42, ytd: 9.86, oneYear: 26.48, threeYears: 52.64, dayRange: [21840, 22210], weekRange52: [17720, 24360] },
  { name: "Nifty Healthcare", last: 14682, today: 1.02, fiveDays: 2.36, oneMonth: 4.84, ytd: 8.62, oneYear: 24.36, threeYears: 48.92, dayRange: [14480, 14740], weekRange52: [11750, 16150] },
  { name: "Nifty FMCG", last: 56924, today: -0.32, fiveDays: -0.68, oneMonth: 0.84, ytd: 2.46, oneYear: 6.82, threeYears: 18.64, dayRange: [56640, 57120], weekRange52: [48390, 59480] },
  { name: "Nifty Metal", last: 9486, today: 1.64, fiveDays: 3.42, oneMonth: 6.84, ytd: 12.48, oneYear: 32.64, threeYears: 86.42, dayRange: [9280, 9520], weekRange52: [7110, 10920] },
  { name: "Nifty Realty", last: 1084, today: 0.92, fiveDays: 1.84, oneMonth: 4.28, ytd: 8.64, oneYear: 36.42, threeYears: 124.86, dayRange: [1068, 1092], weekRange52: [812, 1248] },
  { name: "Nifty Energy", last: 38246, today: -0.48, fiveDays: -1.24, oneMonth: 0.62, ytd: 2.84, oneYear: 8.46, threeYears: 42.68, dayRange: [37960, 38480], weekRange52: [31640, 41280] },
  { name: "Nifty PSU Bank", last: 7648, today: 0.56, fiveDays: 1.28, oneMonth: 3.64, ytd: 6.42, oneYear: 18.86, threeYears: 142.48, dayRange: [7580, 7690], weekRange52: [5960, 8640] },
];

// — Thematic (8 thematic/megatrend indices)
export const INDIA_IDX_THEMATIC: PerformanceRow[] = [
  { name: "Nifty India Digital", last: 8486, today: 1.49, fiveDays: 2.86, oneMonth: 5.64, ytd: 11.42, oneYear: 34.86, threeYears: 82.46, dayRange: [8320, 8520], weekRange52: [6360, 9840] },
  { name: "Nifty India Defence", last: 6942, today: 1.20, fiveDays: 2.48, oneMonth: 6.24, ytd: 14.86, oneYear: 42.64, threeYears: 186.42, dayRange: [6820, 6980], weekRange52: [5210, 8240] },
  { name: "Nifty Consumption", last: 12248, today: -0.35, fiveDays: -0.72, oneMonth: 1.24, ytd: 3.46, oneYear: 8.82, threeYears: 24.64, dayRange: [12140, 12320], weekRange52: [10410, 13480] },
  { name: "Nifty Mobility", last: 4286, today: 1.14, fiveDays: 2.36, oneMonth: 4.82, ytd: 9.64, oneYear: 28.46, threeYears: 74.82, dayRange: [4218, 4310], weekRange52: [3430, 4940] },
  { name: "Nifty India Mfg", last: 14842, today: 0.58, fiveDays: 1.24, oneMonth: 3.48, ytd: 7.86, oneYear: 22.64, threeYears: 68.42, dayRange: [14680, 14890], weekRange52: [11870, 16330] },
  { name: "Nifty MNC", last: 28462, today: 0.50, fiveDays: 0.98, oneMonth: 2.64, ytd: 5.42, oneYear: 14.86, threeYears: 36.28, dayRange: [28240, 28520], weekRange52: [24190, 31310] },
  { name: "Nifty Infra", last: 8924, today: 0.38, fiveDays: 0.84, oneMonth: 2.46, ytd: 5.82, oneYear: 16.48, threeYears: 52.86, dayRange: [8842, 8960], weekRange52: [7140, 9820] },
  { name: "Nifty EV & New Energy", last: 2148, today: -1.31, fiveDays: -2.64, oneMonth: -0.48, ytd: 4.86, oneYear: 18.42, threeYears: 62.84, dayRange: [2108, 2186], weekRange52: [1720, 2580] },
];

// — Strategy / Factor (8 factor-based indices)
export const INDIA_IDX_STRATEGY: PerformanceRow[] = [
  { name: "Nifty Alpha 50", last: 48642, today: 0.59, fiveDays: 1.36, oneMonth: 3.84, ytd: 8.42, oneYear: 28.64, threeYears: 82.46, dayRange: [48280, 48780], weekRange52: [38910, 54960] },
  { name: "Nifty High Beta 50", last: 14286, today: 1.31, fiveDays: 2.84, oneMonth: 5.62, ytd: 12.48, oneYear: 36.84, threeYears: 94.62, dayRange: [14040, 14340], weekRange52: [10710, 16430] },
  { name: "Nifty Quality 30", last: 5842, today: 0.56, fiveDays: 1.08, oneMonth: 2.42, ytd: 4.86, oneYear: 12.64, threeYears: 34.28, dayRange: [5784, 5868], weekRange52: [4960, 6430] },
  { name: "Nifty200 Momentum 30", last: 24486, today: 0.61, fiveDays: 1.42, oneMonth: 3.64, ytd: 8.24, oneYear: 32.48, threeYears: 96.84, dayRange: [24280, 24540], weekRange52: [19590, 27420] },
  { name: "Nifty Low Volatility 50", last: 20842, today: 0.30, fiveDays: 0.68, oneMonth: 1.84, ytd: 3.62, oneYear: 10.48, threeYears: 28.64, dayRange: [20720, 20890], weekRange52: [17720, 22930] },
  { name: "Nifty Div Opp 50", last: 4682, today: 0.39, fiveDays: 0.82, oneMonth: 2.24, ytd: 4.64, oneYear: 14.82, threeYears: 42.86, dayRange: [4648, 4710], weekRange52: [3980, 5150] },
  { name: "Nifty100 Equal Weight", last: 28248, today: 0.33, fiveDays: 0.74, oneMonth: 2.18, ytd: 4.82, oneYear: 14.24, threeYears: 38.62, dayRange: [28080, 28320], weekRange52: [24010, 31070] },
  { name: "Nifty200 Value 30", last: 12486, today: -0.38, fiveDays: -0.86, oneMonth: 1.64, ytd: 3.82, oneYear: 16.48, threeYears: 54.62, dayRange: [12380, 12540], weekRange52: [10610, 14360] },
];

// Legacy alias
export const INDIA_INDICES = INDIA_IDX_POPULAR;

// India Sectors
export interface IndiaSector {
  name: string;
  today: number;
  oneMonth: number;
  ytd: number;
  oneYear: number;
}

export const INDIA_SECTORS: IndiaSector[] = [
  { name: "NIFTY Auto", today: 0.84, oneMonth: -2.12, ytd: 8.42, oneYear: 32.60 },
  { name: "NIFTY Pharma", today: 1.22, oneMonth: 3.40, ytd: 12.80, oneYear: 28.40 },
  { name: "NIFTY FMCG", today: -0.32, oneMonth: -1.80, ytd: -4.20, oneYear: 6.80 },
  { name: "NIFTY Metal", today: 1.64, oneMonth: 5.20, ytd: 18.40, oneYear: 42.20 },
  { name: "NIFTY Realty", today: 0.92, oneMonth: -3.40, ytd: 6.20, oneYear: 48.60 },
  { name: "NIFTY Energy", today: -0.48, oneMonth: 2.80, ytd: 14.60, oneYear: 36.80 },
  { name: "NIFTY PSU Bank", today: 0.56, oneMonth: -4.20, ytd: -8.60, oneYear: 18.20 },
  { name: "NIFTY Infra", today: 0.38, oneMonth: -1.60, ytd: 4.80, oneYear: 24.40 },
];

// ---- India Alternative / New-Age Sectors ----
export const INDIA_SECTORS_ALT: PerformanceRow[] = [
  { name: "Nifty India Digital", ticker: "DIGITAL", last: 8486, today: 1.49, fiveDays: 2.86, oneMonth: 5.64, ytd: 11.42, oneYear: 34.86, threeYears: 82.46, dayRange: [8320, 8520], weekRange52: [6360, 9840] },
  { name: "Nifty India Defence", ticker: "DEFENCE", last: 6942, today: 1.20, fiveDays: 2.48, oneMonth: 6.24, ytd: 14.86, oneYear: 42.64, threeYears: 186.42, dayRange: [6820, 6980], weekRange52: [5210, 8240] },
  { name: "Nifty EV & New Energy", ticker: "EVNEWENRG", last: 2148, today: -1.31, fiveDays: -2.64, oneMonth: -0.48, ytd: 4.86, oneYear: 18.42, threeYears: 62.84, dayRange: [2108, 2186], weekRange52: [1720, 2580] },
  { name: "Nifty IT", ticker: "NIFTYIT", last: 34286, today: 0.92, fiveDays: 1.68, oneMonth: 3.42, ytd: 8.64, oneYear: 24.86, threeYears: 42.68, dayRange: [33980, 34420], weekRange52: [28460, 38240] },
  { name: "Nifty India Mfg", ticker: "INDIAMFG", last: 14842, today: 0.58, fiveDays: 1.24, oneMonth: 3.48, ytd: 7.86, oneYear: 22.64, threeYears: 68.42, dayRange: [14680, 14890], weekRange52: [11870, 16330] },
  { name: "Nifty Mobility", ticker: "MOBILITY", last: 4286, today: 1.14, fiveDays: 2.36, oneMonth: 4.82, ytd: 9.64, oneYear: 28.46, threeYears: 74.82, dayRange: [4218, 4310], weekRange52: [3430, 4940] },
  { name: "Nifty Consumption", ticker: "CONSUMPTION", last: 12248, today: -0.35, fiveDays: -0.72, oneMonth: 1.24, ytd: 3.46, oneYear: 8.82, threeYears: 24.64, dayRange: [12140, 12320], weekRange52: [10410, 13480] },
  { name: "Nifty MNC", ticker: "MNC", last: 28462, today: 0.50, fiveDays: 0.98, oneMonth: 2.64, ytd: 5.42, oneYear: 14.86, threeYears: 36.28, dayRange: [28240, 28520], weekRange52: [24190, 31310] },
];

// India Top 10 Stocks
export interface IndiaStock {
  symbol: string;
  name: string;
  logo: string;
  logoColor: string;
  price: string;
  change: string;
  changePct: string;
  volume: string;
  marketCap: string;
  isUp: boolean;
}

export const INDIA_TOP_STOCKS: IndiaStock[] = [
  { symbol: "RELIANCE", name: "Reliance", logo: "RL", logoColor: "bg-blue-600", price: "2,948.50", change: "+36.20", changePct: "+1.24%", volume: "12.8M", marketCap: "20.0L Cr", isUp: true },
  { symbol: "TCS", name: "TCS", logo: "TC", logoColor: "bg-blue-500", price: "4,128.30", change: "+33.60", changePct: "+0.82%", volume: "4.2M", marketCap: "14.9L Cr", isUp: true },
  { symbol: "HDFCBANK", name: "HDFC Bank", logo: "HB", logoColor: "bg-blue-700", price: "1,684.20", change: "-7.42", changePct: "-0.44%", volume: "8.6M", marketCap: "12.8L Cr", isUp: false },
  { symbol: "INFY", name: "Infosys", logo: "IN", logoColor: "bg-blue-400", price: "1,892.40", change: "+20.28", changePct: "+1.08%", volume: "6.4M", marketCap: "7.8L Cr", isUp: true },
  { symbol: "ICICIBANK", name: "ICICI Bank", logo: "IC", logoColor: "bg-orange-600", price: "1,245.80", change: "+7.68", changePct: "+0.62%", volume: "10.2M", marketCap: "8.7L Cr", isUp: true },
  { symbol: "ITC", name: "ITC", logo: "IT", logoColor: "bg-blue-800", price: "462.80", change: "+8.42", changePct: "+1.85%", volume: "18.4M", marketCap: "5.7L Cr", isUp: true },
  { symbol: "SBIN", name: "SBI", logo: "SB", logoColor: "bg-blue-600", price: "824.60", change: "-4.20", changePct: "-0.51%", volume: "14.2M", marketCap: "7.4L Cr", isUp: false },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", logo: "BJ", logoColor: "bg-teal-600", price: "7,284.50", change: "+92.40", changePct: "+1.28%", volume: "2.8M", marketCap: "4.5L Cr", isUp: true },
  { symbol: "LT", name: "L&T", logo: "LT", logoColor: "bg-blue-900", price: "3,642.80", change: "+18.60", changePct: "+0.51%", volume: "3.6M", marketCap: "5.0L Cr", isUp: true },
  { symbol: "HINDUNILVR", name: "HUL", logo: "HU", logoColor: "bg-blue-500", price: "2,486.40", change: "-12.80", changePct: "-0.51%", volume: "4.8M", marketCap: "5.8L Cr", isUp: false },
];

// India News
export const INDIA_NEWS: NewsItem[] = [
  {
    headline: "RBI cuts repo rate by 25 bps to 6.25%, signals accommodative stance",
    summary: "The Reserve Bank of India cut the repo rate by 25 basis points to 6.25%, the first cut since 2020. Governor Das cited easing inflation and signaled further accommodation to support growth amid global uncertainty.",
    tickers: ["HDFCBANK", "SBIN", "ICICIBANK"],
    sources: [{ name: "Mint", logo: "M", color: "#2e7d32" }, { name: "Reuters", logo: "R", color: "#ff8200" }],
    timeAgo: "3h ago",
  },
  {
    headline: "Reliance Industries Q3 profit surges 18% on Jio and retail strength",
    summary: "Reliance Industries reported an 18% jump in quarterly net profit driven by strong performance in Jio Platforms and Reliance Retail. O2C margins improved despite lower refining cracks.",
    tickers: ["RELIANCE"],
    sources: [{ name: "Economic Times", logo: "E", color: "#1a73e8" }, { name: "Moneycontrol", logo: "M", color: "#5b2c8f" }],
    timeAgo: "5h ago",
  },
  {
    headline: "FII outflows cross 8,400 Cr in March as rupee weakens further",
    summary: "Foreign institutional investors pulled out over 8,400 crore from Indian equities in March amid a stronger dollar and rising US yields. The rupee hit a new low of 86.42 against the dollar.",
    tickers: ["NIFTY", "SENSEX"],
    sources: [{ name: "Bloomberg", logo: "B", color: "#2800d7" }, { name: "Mint", logo: "M", color: "#2e7d32" }],
    timeAgo: "6h ago",
  },
  {
    headline: "Tata Motors Jaguar Land Rover posts record quarter, EV bookings surge",
    summary: "Tata Motors reported JLR's best-ever quarter with revenues of 8.2B. The luxury carmaker saw EV orders double, led by strong Range Rover Electric demand across global markets.",
    tickers: ["TATAMOTORS"],
    sources: [{ name: "Economic Times", logo: "E", color: "#1a73e8" }, { name: "Reuters", logo: "R", color: "#ff8200" }],
    timeAgo: "8h ago",
  },
];

// India Economic
export const INDIA_ECONOMIC: EconomicIndicator[] = [
  { label: "GDP Growth (YoY)", value: "8.2%", badge: { text: "↑ +0.6%", direction: "up" }, previous: "7.6%", releasedDate: "Feb 28", nextDate: "May 31" },
  { label: "CPI Inflation (YoY)", value: "5.1%", badge: { text: "↓ -0.2%", direction: "down" }, previous: "5.3%", releasedDate: "Mar 12", nextDate: "Apr 12" },
  { label: "Repo Rate", value: "6.25%", badge: { text: "↓ -25 bps", direction: "down" }, previous: "6.50%", releasedDate: "Feb 7", nextDate: "Apr 9" },
  { label: "Industrial Production", value: "5.8%", badge: { text: "↑ +1.4%", direction: "up" }, previous: "4.4%", releasedDate: "Mar 12", nextDate: "Apr 11" },
  { label: "Trade Deficit", value: "-24.6B", badge: { text: "↓ narrowing", direction: "up" }, previous: "-27.8B", releasedDate: "Mar 15", nextDate: "Apr 15" },
  { label: "Forex Reserves", value: "624.8B", badge: { text: "↑ +2.4B", direction: "up" }, previous: "622.4B", releasedDate: "Mar 8", nextDate: "Mar 15" },
];

// India Currencies
export const INDIA_CURRENCIES: GlobalRow[] = [
  { name: "USD/INR", subtitle: "US Dollar", last: "86.42", change: "+0.12", changePct: "+0.14%", dayRange: "86.28 — 86.58", isUp: true },
  { name: "EUR/INR", subtitle: "Euro", last: "93.68", change: "+0.24", changePct: "+0.26%", dayRange: "93.40 — 93.82", isUp: true },
  { name: "GBP/INR", subtitle: "British Pound", last: "109.24", change: "-0.18", changePct: "-0.16%", dayRange: "108.92 — 109.48", isUp: false },
  { name: "JPY/INR", subtitle: "Japanese Yen", last: "0.5782", change: "-0.0012", changePct: "-0.21%", dayRange: "0.5768 — 0.5798", isUp: false },
];

// India Commodities
export const INDIA_COMMODITIES: GlobalRow[] = [
  { name: "Gold (MCX)", subtitle: "INR/10g", last: "87,420", change: "+580", changePct: "+0.67%", dayRange: "86,800 — 87,520", isUp: true },
  { name: "Silver (MCX)", subtitle: "INR/kg", last: "96,840", change: "+1,240", changePct: "+1.30%", dayRange: "95,400 — 97,100", isUp: true },
  { name: "Crude Oil (MCX)", subtitle: "INR/bbl", last: "5,648", change: "-86", changePct: "-1.50%", dayRange: "5,580 — 5,740", isUp: false },
  { name: "Natural Gas (MCX)", subtitle: "INR/mmBtu", last: "342.60", change: "-6.40", changePct: "-1.83%", dayRange: "338 — 350", isUp: false },
  { name: "Copper (MCX)", subtitle: "INR/kg", last: "842.50", change: "+8.60", changePct: "+1.03%", dayRange: "832 — 846", isUp: true },
];

// ============================================================
// UAE — Key Market Data (Indices)
// ============================================================
// — UAE Popular (8 key UAE indices)
export const UAE_IDX_POPULAR: PerformanceRow[] = [
  { name: "ADX General", last: 9856, today: 0.18, fiveDays: 0.62, oneMonth: 1.84, ytd: 8.42, oneYear: 14.26, threeYears: 38.50, dayRange: [9812, 9878], weekRange52: [8520, 10240] },
  { name: "DFM General", last: 4285, today: 0.76, fiveDays: 1.24, oneMonth: 3.18, ytd: 12.86, oneYear: 22.40, threeYears: 58.20, dayRange: [4228, 4296], weekRange52: [3480, 4520] },
  { name: "FTSE ADX 15", last: 5843, today: 0.43, fiveDays: 0.88, oneMonth: 2.14, ytd: 9.68, oneYear: 16.82, threeYears: 42.60, dayRange: [5806, 5860], weekRange52: [5020, 6080] },
  { name: "DFM Real Estate", last: 6124, today: -0.30, fiveDays: -0.86, oneMonth: 1.42, ytd: 14.52, oneYear: 28.64, threeYears: 72.40, dayRange: [6086, 6180], weekRange52: [4760, 6480] },
  { name: "ADX Banks", last: 4487, today: 0.28, fiveDays: 0.54, oneMonth: 1.68, ytd: 7.24, oneYear: 12.86, threeYears: 34.20, dayRange: [4462, 4502], weekRange52: [3920, 4680] },
  { name: "DFM Insurance", last: 2148, today: 0.38, fiveDays: 0.72, oneMonth: 2.46, ytd: 6.84, oneYear: 10.28, threeYears: 24.60, dayRange: [2128, 2156], weekRange52: [1880, 2320] },
  { name: "ADX Telecom", last: 3249, today: -0.45, fiveDays: -1.12, oneMonth: -0.68, ytd: 3.42, oneYear: 8.64, threeYears: 18.40, dayRange: [3218, 3272], weekRange52: [2860, 3480] },
  { name: "FTSE NASDAQ Dubai", last: 4086, today: 0.56, fiveDays: 1.08, oneMonth: 2.86, ytd: 10.42, oneYear: 18.24, threeYears: 46.80, dayRange: [4048, 4102], weekRange52: [3440, 4280] },
];

// — UAE Sectors (8 sector indices)
export const UAE_IDX_SECTORS: PerformanceRow[] = [
  { name: "ADX Banks", last: 4487, today: 0.28, fiveDays: 0.54, oneMonth: 1.68, ytd: 7.24, oneYear: 12.86, threeYears: 34.20, dayRange: [4462, 4502], weekRange52: [3920, 4680] },
  { name: "DFM Real Estate", last: 6124, today: -0.30, fiveDays: -0.86, oneMonth: 1.42, ytd: 14.52, oneYear: 28.64, threeYears: 72.40, dayRange: [6086, 6180], weekRange52: [4760, 6480] },
  { name: "ADX Energy", last: 8462, today: 0.51, fiveDays: 1.36, oneMonth: 3.42, ytd: 11.28, oneYear: 19.86, threeYears: 52.40, dayRange: [8398, 8486], weekRange52: [7080, 8840] },
  { name: "ADX Telecom", last: 3249, today: -0.45, fiveDays: -1.12, oneMonth: -0.68, ytd: 3.42, oneYear: 8.64, threeYears: 18.40, dayRange: [3218, 3272], weekRange52: [2860, 3480] },
  { name: "DFM Insurance", last: 2148, today: 0.38, fiveDays: 0.72, oneMonth: 2.46, ytd: 6.84, oneYear: 10.28, threeYears: 24.60, dayRange: [2128, 2156], weekRange52: [1880, 2320] },
  { name: "ADX Industrial", last: 1843, today: 0.35, fiveDays: 0.68, oneMonth: 1.92, ytd: 5.86, oneYear: 9.42, threeYears: 22.80, dayRange: [1828, 1856], weekRange52: [1620, 1940] },
  { name: "DFM Services", last: 2486, today: -0.34, fiveDays: -0.78, oneMonth: 0.86, ytd: 4.28, oneYear: 7.64, threeYears: 16.40, dayRange: [2468, 2502], weekRange52: [2180, 2640] },
  { name: "ADX Consumer Staples", last: 1648, today: 0.29, fiveDays: 0.48, oneMonth: 1.56, ytd: 4.86, oneYear: 8.24, threeYears: 20.60, dayRange: [1636, 1658], weekRange52: [1440, 1740] },
];

// — UAE GCC Peers (8 regional indices)
export const UAE_IDX_GCC: PerformanceRow[] = [
  { name: "Tadawul All Share", last: 12486, today: 0.34, fiveDays: 0.82, oneMonth: 2.46, ytd: 9.84, oneYear: 16.42, threeYears: 44.20, dayRange: [12418, 12520], weekRange52: [10640, 13120] },
  { name: "S&P Pan Arab", last: 1249, today: 0.52, fiveDays: 1.14, oneMonth: 2.86, ytd: 10.28, oneYear: 17.64, threeYears: 46.80, dayRange: [1238, 1254], weekRange52: [1060, 1320] },
  { name: "MSM 30", last: 4843, today: -0.26, fiveDays: -0.64, oneMonth: 0.42, ytd: 3.86, oneYear: 6.24, threeYears: 14.80, dayRange: [4818, 4868], weekRange52: [4380, 5120] },
  { name: "Bahrain All Share", last: 2085, today: 0.20, fiveDays: 0.42, oneMonth: 1.24, ytd: 4.62, oneYear: 7.86, threeYears: 18.40, dayRange: [2074, 2092], weekRange52: [1840, 2200] },
  { name: "Kuwait Premier Market", last: 8248, today: 0.35, fiveDays: 0.76, oneMonth: 2.18, ytd: 8.42, oneYear: 14.86, threeYears: 40.20, dayRange: [8204, 8272], weekRange52: [7120, 8680] },
  { name: "QE 20", last: 10486, today: -0.24, fiveDays: -0.58, oneMonth: 0.64, ytd: 5.28, oneYear: 8.42, threeYears: 22.60, dayRange: [10442, 10520], weekRange52: [9240, 11040] },
  { name: "EGX 30", last: 28643, today: 0.65, fiveDays: 1.48, oneMonth: 4.26, ytd: 18.64, oneYear: 32.48, threeYears: 86.40, dayRange: [28420, 28780], weekRange52: [21640, 30280] },
  { name: "Casablanca MASI", last: 14249, today: 0.34, fiveDays: 0.78, oneMonth: 2.14, ytd: 8.86, oneYear: 15.42, threeYears: 42.60, dayRange: [14180, 14286], weekRange52: [12080, 14960] },
];

// ---- UAE Alternative / New-Age Sectors ----
export const UAE_SECTORS_ALT: PerformanceRow[] = [
  { name: "PropTech & Smart Cities", ticker: "PROP", last: 3486, today: 0.86, fiveDays: 1.48, oneMonth: 3.86, ytd: 12.42, oneYear: 28.86, threeYears: 64.42, dayRange: [3442, 3508], weekRange52: [2680, 3840] },
  { name: "Fintech", ticker: "FNTK", last: 2842, today: 1.24, fiveDays: 2.48, oneMonth: 5.86, ytd: 16.42, oneYear: 36.86, threeYears: 82.48, dayRange: [2788, 2868], weekRange52: [2040, 3240] },
  { name: "Renewable Energy", ticker: "RENW", last: 1648, today: 0.48, fiveDays: -0.86, oneMonth: -2.42, ytd: -4.86, oneYear: 8.42, threeYears: 24.86, dayRange: [1628, 1668], weekRange52: [1320, 1940] },
  { name: "Tourism & Hospitality", ticker: "TOUR", last: 4248, today: 0.62, fiveDays: 1.24, oneMonth: 3.42, ytd: 10.86, oneYear: 22.48, threeYears: 58.42, dayRange: [4204, 4272], weekRange52: [3440, 4580] },
  { name: "Logistics & Free Zones", ticker: "LOGZ", last: 5842, today: 0.38, fiveDays: 0.86, oneMonth: 2.48, ytd: 8.64, oneYear: 18.42, threeYears: 42.86, dayRange: [5798, 5870], weekRange52: [4840, 6240] },
  { name: "Healthcare & Pharma", ticker: "HLTH", last: 2248, today: 0.56, fiveDays: 1.14, oneMonth: 2.86, ytd: 7.42, oneYear: 14.86, threeYears: 32.48, dayRange: [2228, 2268], weekRange52: [1880, 2480] },
  { name: "Education & EdTech", ticker: "EDTK", last: 1486, today: 0.34, fiveDays: 0.72, oneMonth: 1.86, ytd: 5.42, oneYear: 12.86, threeYears: 28.42, dayRange: [1472, 1498], weekRange52: [1240, 1640] },
  { name: "Food & Agritech", ticker: "FOOD", last: 1842, today: -0.24, fiveDays: -0.48, oneMonth: 0.86, ytd: 3.42, oneYear: 8.86, threeYears: 18.42, dayRange: [1828, 1858], weekRange52: [1580, 2040] },
];

// Legacy alias
export const UAE_INDICES = UAE_IDX_POPULAR;

export const UAE_TOP_STOCKS: IndiaStock[] = [
  { symbol: "FAB", name: "First Abu Dhabi Bank", logo: "FA", logoColor: "bg-blue-600", price: "14.82", change: "+0.18", changePct: "+1.23%", volume: "28.4M", marketCap: "164.2B AED", isUp: true },
  { symbol: "ADNOC", name: "ADNOC Distribution", logo: "AD", logoColor: "bg-green-600", price: "3.48", change: "+0.04", changePct: "+1.16%", volume: "18.6M", marketCap: "43.4B AED", isUp: true },
  { symbol: "EMAAR", name: "Emaar Properties", logo: "EM", logoColor: "bg-amber-600", price: "8.24", change: "-0.12", changePct: "-1.44%", volume: "22.8M", marketCap: "72.8B AED", isUp: false },
  { symbol: "IHC", name: "Intl Holding Co", logo: "IH", logoColor: "bg-indigo-600", price: "412.60", change: "+6.80", changePct: "+1.68%", volume: "2.4M", marketCap: "928B AED", isUp: true },
  { symbol: "ETISALAT", name: "e& (Etisalat)", logo: "ET", logoColor: "bg-teal-600", price: "24.86", change: "-0.24", changePct: "-0.96%", volume: "8.2M", marketCap: "216.4B AED", isUp: false },
];

export const UAE_NEWS: NewsItem[] = [
  {
    headline: "ADNOC announces 6.2B expansion of Ruwais refinery complex",
    summary: "ADNOC announced a major expansion of its Ruwais refinery to increase processing capacity by 600,000 barrels per day. The project will create over 10,000 jobs and strengthen Abu Dhabi's position as a global energy hub.",
    tickers: ["ADNOC"],
    sources: [{ name: "Gulf News", logo: "G", color: "#c41e3a" }, { name: "Reuters", logo: "R", color: "#ff8200" }],
    timeAgo: "2h ago",
  },
  {
    headline: "Emaar reports record Q4 revenue driven by Dubai real estate boom",
    summary: "Emaar Properties posted record quarterly revenue of 8.4B AED as Dubai's property market continues its unprecedented growth. Off-plan sales surged 42% year-over-year.",
    tickers: ["EMAAR"],
    sources: [{ name: "Arabian Business", logo: "A", color: "#1a1a2e" }, { name: "Bloomberg", logo: "B", color: "#2800d7" }],
    timeAgo: "4h ago",
  },
  {
    headline: "UAE Central Bank raises reserve requirements, dirham strengthens",
    summary: "The UAE Central Bank increased reserve requirements by 100 basis points to curb lending growth. Banking stocks dipped initially but recovered as analysts view the move as positive for long-term stability.",
    tickers: ["FAB", "ADCB"],
    sources: [{ name: "Gulf News", logo: "G", color: "#c41e3a" }, { name: "Reuters", logo: "R", color: "#ff8200" }],
    timeAgo: "6h ago",
  },
];

export const UAE_ECONOMIC: EconomicIndicator[] = [
  { label: "GDP Growth (YoY)", value: "3.6%", badge: { text: "↑ +0.4%", direction: "up" }, previous: "3.2%", releasedDate: "Feb 15", nextDate: "May 15" },
  { label: "CPI Inflation (YoY)", value: "2.1%", badge: { text: "↓ -0.3%", direction: "down" }, previous: "2.4%", releasedDate: "Mar 10", nextDate: "Apr 10" },
  { label: "CBUAE Rate", value: "5.40%", badge: { text: "— 0 bps", direction: "neutral" }, previous: "5.40%", releasedDate: "Jan 31", nextDate: "Mar 20" },
  { label: "Oil Production", value: "3.2M bpd", badge: { text: "↑ +50K", direction: "up" }, previous: "3.15M", releasedDate: "Mar 1", nextDate: "Apr 1" },
  { label: "Trade Balance", value: "+42.8B AED", badge: { text: "↑ surplus", direction: "up" }, previous: "+38.6B AED", releasedDate: "Feb 28", nextDate: "May 31" },
];

// ============================================================
// UK — Key Market Data (Indices)
// ============================================================
// — UK Popular (8 benchmark indices)
export const UK_IDX_POPULAR: PerformanceRow[] = [
  { name: "FTSE 100", last: 8412, today: 0.28, fiveDays: 0.84, oneMonth: 1.62, ytd: 5.48, oneYear: 9.24, threeYears: 18.60, dayRange: [8368, 8430], weekRange52: [7580, 8540] },
  { name: "FTSE 250", last: 20486, today: -0.21, fiveDays: -0.68, oneMonth: 0.94, ytd: 3.86, oneYear: 12.40, threeYears: 14.20, dayRange: [20380, 20560], weekRange52: [17840, 21200] },
  { name: "FTSE All-Share", last: 4625, today: 0.18, fiveDays: 0.72, oneMonth: 1.48, ytd: 5.12, oneYear: 9.86, threeYears: 17.40, dayRange: [4608, 4638], weekRange52: [4120, 4720] },
  { name: "FTSE 350", last: 4286, today: -0.16, fiveDays: 0.42, oneMonth: 1.24, ytd: 4.68, oneYear: 9.42, threeYears: 16.80, dayRange: [4274, 4302], weekRange52: [3840, 4380] },
  { name: "FTSE AIM All-Share", last: 743, today: 0.57, fiveDays: 1.24, oneMonth: 2.86, ytd: 8.42, oneYear: 16.80, threeYears: -4.20, dayRange: [736, 746], weekRange52: [620, 780] },
  { name: "FTSE SmallCap", last: 6842, today: 0.27, fiveDays: 0.92, oneMonth: 2.14, ytd: 6.80, oneYear: 14.60, threeYears: 12.40, dayRange: [6812, 6868], weekRange52: [5980, 7040] },
  { name: "FTSE AIM 100", last: 4249, today: 0.67, fiveDays: 1.48, oneMonth: 3.24, ytd: 9.60, oneYear: 18.40, threeYears: -2.80, dayRange: [4208, 4262], weekRange52: [3560, 4420] },
  { name: "VFTSE", last: 16, today: -4.98, fiveDays: -8.42, oneMonth: -12.60, ytd: -18.40, oneYear: -24.80, threeYears: -32.60, dayRange: [16, 17], weekRange52: [12, 24] },
];

// — UK Sectors (8 FTSE sector supersector indices)
export const UK_IDX_SECTORS: PerformanceRow[] = [
  { name: "FTSE 350 Financials", last: 6248, today: -0.30, fiveDays: -1.12, oneMonth: 0.86, ytd: 4.24, oneYear: 12.80, threeYears: 22.40, dayRange: [6212, 6284], weekRange52: [5480, 6520] },
  { name: "FTSE 350 Industrials", last: 8486, today: 0.29, fiveDays: 0.68, oneMonth: 1.86, ytd: 6.42, oneYear: 14.20, threeYears: 24.80, dayRange: [8442, 8512], weekRange52: [7280, 8740] },
  { name: "FTSE 350 Healthcare", last: 12843, today: 0.68, fiveDays: 1.42, oneMonth: 3.24, ytd: 8.86, oneYear: 16.40, threeYears: 28.60, dayRange: [12740, 12886], weekRange52: [10840, 13200] },
  { name: "FTSE 350 Technology", last: 3249, today: 1.33, fiveDays: 2.86, oneMonth: 4.68, ytd: 14.20, oneYear: 28.40, threeYears: 42.80, dayRange: [3198, 3268], weekRange52: [2640, 3480] },
  { name: "FTSE 350 Consumer Staples", last: 14486, today: -0.17, fiveDays: -0.42, oneMonth: 0.68, ytd: 2.86, oneYear: 6.40, threeYears: 12.20, dayRange: [14442, 14528], weekRange52: [13240, 14880] },
  { name: "FTSE 350 Energy", last: 9843, today: -0.43, fiveDays: -1.86, oneMonth: -0.92, ytd: 1.48, oneYear: 8.60, threeYears: 36.40, dayRange: [9784, 9898], weekRange52: [8480, 10640] },
  { name: "FTSE 350 Mining", last: 18248, today: 0.69, fiveDays: 2.14, oneMonth: 4.86, ytd: 12.40, oneYear: 24.80, threeYears: 38.60, dayRange: [18086, 18312], weekRange52: [14800, 19200] },
  { name: "FTSE 350 Real Estate", last: 2843, today: 0.44, fiveDays: 0.86, oneMonth: 2.42, ytd: 6.80, oneYear: 10.40, threeYears: -8.60, dayRange: [2824, 2858], weekRange52: [2380, 2960] },
];

// — UK Style (8 style/factor indices)
export const UK_IDX_STYLE: PerformanceRow[] = [
  { name: "FTSE UK Dividend+", last: 3486, today: 0.24, fiveDays: 0.62, oneMonth: 1.48, ytd: 4.86, oneYear: 10.40, threeYears: 18.20, dayRange: [3468, 3498], weekRange52: [3040, 3580] },
  { name: "FTSE 100 Equal Weight", last: 12843, today: 0.25, fiveDays: 0.74, oneMonth: 1.56, ytd: 5.24, oneYear: 10.80, threeYears: 20.40, dayRange: [12784, 12876], weekRange52: [11280, 13120] },
  { name: "FTSE UK High Dividend", last: 4248, today: 0.16, fiveDays: 0.48, oneMonth: 1.24, ytd: 4.42, oneYear: 9.60, threeYears: 16.80, dayRange: [4232, 4264], weekRange52: [3720, 4380] },
  { name: "FTSE UK Low Volatility", last: 2487, today: 0.17, fiveDays: 0.36, oneMonth: 0.86, ytd: 3.24, oneYear: 7.80, threeYears: 14.60, dayRange: [2478, 2498], weekRange52: [2240, 2560] },
  { name: "FTSE UK Quality Income", last: 1842, today: 0.47, fiveDays: 0.92, oneMonth: 2.14, ytd: 6.42, oneYear: 12.80, threeYears: 22.40, dayRange: [1828, 1852], weekRange52: [1580, 1920] },
  { name: "FTSE 100 ESG Select", last: 8149, today: 0.23, fiveDays: 0.68, oneMonth: 1.42, ytd: 5.12, oneYear: 10.20, threeYears: 19.80, dayRange: [8118, 8168], weekRange52: [7240, 8340] },
  { name: "FTSE UK Momentum", last: 5842, today: -0.22, fiveDays: -0.86, oneMonth: -1.42, ytd: 2.86, oneYear: 14.60, threeYears: 26.40, dayRange: [5818, 5876], weekRange52: [4840, 6120] },
  { name: "FTSE UK Value", last: 3149, today: -0.27, fiveDays: -0.68, oneMonth: -0.42, ytd: 1.86, oneYear: 6.40, threeYears: 10.80, dayRange: [3128, 3168], weekRange52: [2780, 3280] },
];

// — UK Dividend (8 income-focused indices)
export const UK_IDX_DIVIDEND: PerformanceRow[] = [
  { name: "FTSE UK Dividend+", last: 3486, today: 0.24, fiveDays: 0.62, oneMonth: 1.48, ytd: 4.86, oneYear: 10.40, threeYears: 18.20, dayRange: [3468, 3498], weekRange52: [3040, 3580] },
  { name: "FTSE UK High Dividend", last: 4248, today: 0.16, fiveDays: 0.48, oneMonth: 1.24, ytd: 4.42, oneYear: 9.60, threeYears: 16.80, dayRange: [4232, 4264], weekRange52: [3720, 4380] },
  { name: "FTSE UK Quality Income", last: 1842, today: 0.47, fiveDays: 0.92, oneMonth: 2.14, ytd: 6.42, oneYear: 12.80, threeYears: 22.40, dayRange: [1828, 1852], weekRange52: [1580, 1920] },
  { name: "FTSE 100 Yield Weighted", last: 6249, today: 0.23, fiveDays: 0.56, oneMonth: 1.36, ytd: 4.68, oneYear: 9.80, threeYears: 17.40, dayRange: [6224, 6268], weekRange52: [5520, 6440] },
  { name: "FTSE EPRA Nareit UK", last: 2149, today: 0.60, fiveDays: 1.24, oneMonth: 2.86, ytd: 7.42, oneYear: 12.60, threeYears: -6.40, dayRange: [2128, 2164], weekRange52: [1840, 2280] },
  { name: "FTSE Gilts All Stocks", last: 243, today: 0.20, fiveDays: 0.42, oneMonth: 0.86, ytd: 1.24, oneYear: 2.80, threeYears: -8.40, dayRange: [242, 243], weekRange52: [228, 252] },
  { name: "FTSE A Index-Linked", last: 3842, today: 0.16, fiveDays: 0.38, oneMonth: 0.74, ytd: 1.86, oneYear: 3.40, threeYears: -6.80, dayRange: [3828, 3856], weekRange52: [3540, 4020] },
  { name: "FTSE Actuaries UK Conv Gilts", last: 185, today: 0.17, fiveDays: 0.34, oneMonth: 0.68, ytd: 1.12, oneYear: 2.40, threeYears: -10.20, dayRange: [184, 185], weekRange52: [168, 196] },
];

// Legacy alias
export const UK_INDICES = UK_IDX_POPULAR;

export interface UKStock {
  symbol: string;
  name: string;
  logo: string;
  logoColor: string;
  price: string;
  change: string;
  changePct: string;
  volume: string;
  marketCap: string;
  isUp: boolean;
}

export const UK_TOP_STOCKS: UKStock[] = [
  { symbol: "SHEL", name: "Shell PLC", logo: "SH", logoColor: "bg-amber-600", price: "2,648.50", change: "+28.40", changePct: "+1.08%", volume: "12.4M", marketCap: "162.4B", isUp: true },
  { symbol: "AZN", name: "AstraZeneca", logo: "AZ", logoColor: "bg-purple-600", price: "11,842.00", change: "+186.00", changePct: "+1.60%", volume: "4.8M", marketCap: "184.6B", isUp: true },
  { symbol: "HSBA", name: "HSBC Holdings", logo: "HS", logoColor: "bg-red-600", price: "742.80", change: "-8.40", changePct: "-1.12%", volume: "18.6M", marketCap: "142.8B", isUp: false },
  { symbol: "ULVR", name: "Unilever PLC", logo: "UL", logoColor: "bg-blue-600", price: "4,286.50", change: "+42.80", changePct: "+1.01%", volume: "6.2M", marketCap: "108.4B", isUp: true },
  { symbol: "GSK", name: "GSK PLC", logo: "GK", logoColor: "bg-orange-600", price: "1,486.20", change: "-12.40", changePct: "-0.83%", volume: "8.4M", marketCap: "68.2B", isUp: false },
];

export const UK_SECTORS: IndiaSector[] = [
  { name: "Financials", today: 0.42, oneMonth: -1.86, ytd: 6.24, oneYear: 18.40 },
  { name: "Energy", today: -0.28, oneMonth: 3.42, ytd: 12.80, oneYear: 24.60 },
  { name: "Healthcare", today: 1.14, oneMonth: 2.86, ytd: 8.42, oneYear: 14.20 },
  { name: "Consumer Staples", today: 0.36, oneMonth: -0.92, ytd: 2.86, oneYear: 8.60 },
  { name: "Mining", today: 1.68, oneMonth: 4.24, ytd: 16.40, oneYear: 32.80 },
  { name: "Technology", today: 0.92, oneMonth: -2.48, ytd: -4.20, oneYear: 22.40 },
  { name: "Real Estate", today: -0.56, oneMonth: -3.84, ytd: -2.40, oneYear: 4.80 },
];

// ---- UK Alternative / New-Age Sectors ----
export const UK_SECTORS_ALT: PerformanceRow[] = [
  { name: "Fintech & Digital Banks", ticker: "FTEK", last: 4248, today: 1.42, fiveDays: 2.86, oneMonth: 5.42, ytd: 14.86, oneYear: 32.48, threeYears: 68.42, dayRange: [4182, 4268], weekRange52: [3240, 4680] },
  { name: "Life Sciences", ticker: "LSCI", last: 8642, today: 0.86, fiveDays: 1.64, oneMonth: 3.86, ytd: 9.42, oneYear: 22.86, threeYears: 42.64, dayRange: [8548, 8680], weekRange52: [6840, 9420] },
  { name: "Clean Energy", ticker: "CLEN", last: 2486, today: 0.68, fiveDays: -1.42, oneMonth: -3.86, ytd: -6.24, oneYear: -12.48, threeYears: -24.86, dayRange: [2448, 2508], weekRange52: [1940, 3280] },
  { name: "Luxury & Premium", ticker: "LUXU", last: 6842, today: 0.34, fiveDays: 0.72, oneMonth: 1.86, ytd: 5.42, oneYear: 12.86, threeYears: 28.42, dayRange: [6804, 6870], weekRange52: [5840, 7240] },
  { name: "Cybersecurity", ticker: "CYBE", last: 3148, today: 1.24, fiveDays: 2.48, oneMonth: 4.86, ytd: 12.64, oneYear: 28.42, threeYears: 56.84, dayRange: [3098, 3168], weekRange52: [2440, 3480] },
  { name: "Gaming & Betting", ticker: "GAME", last: 5486, today: -0.48, fiveDays: -1.86, oneMonth: -2.42, ytd: 2.86, oneYear: 8.42, threeYears: 14.86, dayRange: [5442, 5520], weekRange52: [4680, 5840] },
  { name: "Space & Defence", ticker: "SPDF", last: 4842, today: 0.92, fiveDays: 1.86, oneMonth: 4.24, ytd: 10.86, oneYear: 24.42, threeYears: 48.86, dayRange: [4788, 4868], weekRange52: [3840, 5240] },
  { name: "Green Hydrogen", ticker: "GRNH", last: 1248, today: -0.86, fiveDays: -2.48, oneMonth: -6.42, ytd: -10.86, oneYear: -22.48, threeYears: -38.42, dayRange: [1228, 1268], weekRange52: [980, 1820] },
];

export const UK_NEWS: NewsItem[] = [
  {
    headline: "Bank of England holds rates at 5.25% amid sticky services inflation",
    summary: "The BoE voted 7-2 to hold rates, citing persistent services inflation at 6.1%. Markets now price the first cut for August, later than previously expected.",
    tickers: ["HSBA", "LLOY", "BARC"],
    sources: [{ name: "Financial Times", logo: "F", color: "#fff1e5" }, { name: "Reuters", logo: "R", color: "#ff8200" }],
    timeAgo: "1h ago",
  },
  {
    headline: "AstraZeneca wins FDA approval for next-gen cancer therapy",
    summary: "AstraZeneca received FDA breakthrough therapy approval for its targeted cancer drug. Shares jumped 2.4% in London trading as analysts raised price targets.",
    tickers: ["AZN"],
    sources: [{ name: "Bloomberg", logo: "B", color: "#2800d7" }, { name: "The Times", logo: "T", color: "#1a1a2e" }],
    timeAgo: "3h ago",
  },
  {
    headline: "UK GDP grows 0.6% in Q4, recession officially over",
    summary: "UK economy expanded 0.6% in Q4, confirming exit from a shallow technical recession. Consumer spending and services led the recovery. Sterling strengthened against major pairs.",
    tickers: ["FTSE"],
    sources: [{ name: "Reuters", logo: "R", color: "#ff8200" }, { name: "Financial Times", logo: "F", color: "#fff1e5" }],
    timeAgo: "5h ago",
  },
];

export const UK_ECONOMIC: EconomicIndicator[] = [
  { label: "GDP Growth (QoQ)", value: "0.6%", badge: { text: "↑ +0.8%", direction: "up" }, previous: "-0.2%", releasedDate: "Feb 15", nextDate: "May 15" },
  { label: "CPI Inflation (YoY)", value: "3.4%", badge: { text: "↓ -0.6%", direction: "down" }, previous: "4.0%", releasedDate: "Mar 20", nextDate: "Apr 17" },
  { label: "Bank Rate", value: "5.25%", badge: { text: "— 0 bps", direction: "neutral" }, previous: "5.25%", releasedDate: "Mar 21", nextDate: "May 9" },
  { label: "Unemployment Rate", value: "3.8%", badge: { text: "↓ -0.1%", direction: "up" }, previous: "3.9%", releasedDate: "Mar 12", nextDate: "Apr 16" },
  { label: "Retail Sales (MoM)", value: "+3.4%", badge: { text: "↑ +2.6%", direction: "up" }, previous: "+0.8%", releasedDate: "Mar 22", nextDate: "Apr 19" },
  { label: "PMI Manufacturing", value: "47.5", badge: { text: "↑ +1.3", direction: "up" }, previous: "46.2", releasedDate: "Mar 1", nextDate: "Apr 1" },
];
