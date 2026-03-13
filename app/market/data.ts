// ============================================================
// Markets Page — Mock Data & Interfaces
// ============================================================

// ---- Shared Performance Row (Indices / Sectors) ----
export interface PerformanceRow {
  name: string;
  ticker?: string;
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
export const US_INDICES: PerformanceRow[] = [
  { name: "S&P 500", ticker: "SPY", today: 0.88, fiveDays: -1.0, oneMonth: -2.26, ytd: -0.54, oneYear: 17.77, threeYears: 73.22, dayRange: [662.39, 679.92], weekRange52: [481.80, 697.84] },
  { name: "DJIA", ticker: "DIA", today: 0.56, fiveDays: -2.02, oneMonth: -4.66, ytd: -0.56, oneYear: 11.59, threeYears: 47.91, dayRange: [466.68, 479.38], weekRange52: [366.32, 505.30] },
  { name: "NASDAQ 100", ticker: "QQQ", today: 1.34, fiveDays: -0.49, oneMonth: -1.07, ytd: -1.07, oneYear: 23.58, threeYears: 107.67, dayRange: [591.33, 609.27], weekRange52: [402.39, 637.01] },
  { name: "Mid Cap", ticker: "MDY", today: 0.99, fiveDays: -2.74, oneMonth: -4.03, ytd: 4.30, oneYear: 15.20, threeYears: 36.49, dayRange: [608.92, 630.68], weekRange52: [458.82, 662.65] },
  { name: "Small Cap", ticker: "IJR", today: 0.46, fiveDays: -3.49, oneMonth: -5.02, ytd: 4.32, oneYear: 16.29, threeYears: 27.10, dayRange: [120.98, 125.76], weekRange52: [89.22, 133.52] },
  { name: "Micro Cap", ticker: "IWC", today: 0.90, fiveDays: -3.08, oneMonth: -3.90, ytd: 4.27, oneYear: 40.53, threeYears: 49.64, dayRange: [159.14, 165.02], weekRange52: [95.25, 176.74] },
];

// ============================================================
// US MARKETS — Sectors
// ============================================================
export const US_SECTORS: PerformanceRow[] = [
  { name: "Technology", ticker: "XLK", today: 1.80, fiveDays: -0.06, oneMonth: -2.50, ytd: -2.92, oneYear: 27.90, threeYears: 102.26, dayRange: [135.46, 140.21], weekRange52: [86.23, 153.00] },
  { name: "Healthcare", ticker: "XLV", today: 1.02, fiveDays: -1.78, oneMonth: -1.32, ytd: -0.35, oneYear: 3.34, threeYears: 23.34, dayRange: [151.13, 154.55], weekRange52: [127.35, 160.59] },
  { name: "Consumer Staples", ticker: "XLP", today: 0.22, fiveDays: -1.37, oneMonth: -1.67, ytd: 10.67, oneYear: 3.75, threeYears: 20.31, dayRange: [84.80, 86.16], weekRange52: [75.16, 90.14] },
  { name: "Utilities", ticker: "XLU", today: 0.24, fiveDays: -0.89, oneMonth: 7.75, ytd: 9.74, oneYear: 21.23, threeYears: 43.16, dayRange: [46.04, 46.95], weekRange52: [35.51, 47.80] },
  { name: "Consumer Discr.", ticker: "XLY", today: 0.13, fiveDays: -1.55, oneMonth: -2.52, ytd: -4.04, oneYear: 11.43, threeYears: 64.18, dayRange: [110.99, 114.93], weekRange52: [86.55, 125.01] },
  { name: "Comm. Svcs", ticker: "XLC", today: 0.09, fiveDays: -1.04, oneMonth: 0.58, ytd: -0.14, oneYear: 17.22, threeYears: 121.77, dayRange: [115.50, 117.79], weekRange52: [84.02, 120.41] },
  { name: "Basic Materials", ticker: "XLB", today: 0.26, fiveDays: -3.72, oneMonth: -4.20, ytd: 10.23, oneYear: 13.85, threeYears: 25.16, dayRange: [48.60, 50.19], weekRange52: [36.56, 54.14] },
  { name: "Financials", ticker: "XLF", today: -0.47, fiveDays: -2.27, oneMonth: -6.69, ytd: -8.11, oneYear: 2.46, threeYears: 50.06, dayRange: [49.18, 50.52], weekRange52: [42.21, 56.52] },
  { name: "Industrials", ticker: "XLI", today: 0.59, fiveDays: -2.86, oneMonth: -1.59, ytd: 10.20, oneYear: 27.33, threeYears: 69.45, dayRange: [166.17, 171.40], weekRange52: [112.75, 179.31] },
  { name: "Energy", ticker: "XLE", today: -0.44, fiveDays: 0.23, oneMonth: 5.00, ytd: 25.97, oneYear: 28.83, threeYears: 34.58, dayRange: [55.94, 57.15], weekRange52: [37.25, 57.88] },
  { name: "Real Estate", ticker: "XLRE", today: 0.21, fiveDays: -1.78, oneMonth: 1.73, ytd: 6.52, oneYear: 1.20, threeYears: 15.26, dayRange: [41.98, 43.13], weekRange52: [35.76, 44.07] },
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
  { label: "Fed Funds Rate", value: "4.50%", badge: { text: "— 0 bps", direction: "neutral" }, previous: "4.50%", releasedDate: "Jan 29", nextDate: "Mar 19" },
  { label: "CPI (YoY)", value: "2.8%", badge: { text: "↓ -0.3%", direction: "down" }, previous: "3.1%", releasedDate: "Feb 12", nextDate: "Mar 12" },
  { label: "Core PCE (YoY)", value: "2.6%", badge: { text: "↓ -0.2%", direction: "down" }, previous: "2.8%", releasedDate: "Feb 28", nextDate: "Mar 28" },
  { label: "GDP Growth (QoQ)", value: "2.4%", badge: { text: "↓ -0.7%", direction: "down" }, previous: "3.1%", releasedDate: "Jan 30", nextDate: "Apr 30" },
  { label: "Unemployment Rate", value: "3.9%", badge: { text: "↓ -0.1%", direction: "up" }, previous: "4.0%", releasedDate: "Mar 7", nextDate: "Apr 4" },
  { label: "Nonfarm Payrolls", value: "+275K", badge: { text: "↓ from 353K", direction: "down" }, previous: "+353K", releasedDate: "Mar 7", nextDate: "Apr 4" },
  { label: "10Y Treasury Yield", value: "4.12%", badge: { text: "↓ -0.04", direction: "down" }, previous: "4.16%", isLive: true },
  { label: "US Dollar Index (DXY)", value: "103.84", badge: { text: "↓ -0.32%", direction: "down" }, previous: "104.16", isLive: true },
  { label: "Consumer Confidence", value: "106.7", badge: { text: "↓ -4.2", direction: "down" }, previous: "110.9", releasedDate: "Feb 25", nextDate: "Mar 25" },
  { label: "ISM Manufacturing", value: "50.3", badge: { text: "↑ +1.2", direction: "up" }, previous: "49.1", releasedDate: "Mar 3", nextDate: "Apr 1" },
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
export const GLOBAL_INDICES: Record<string, GlobalRow[]> = {
  "Most Popular": [
    { name: "S&P 500", subtitle: "United States", last: "6,003.63", change: "+27.34", changePct: "+0.46%", dayRange: "5,952 — 6,018", isUp: true },
    { name: "NASDAQ", subtitle: "United States", last: "19,643.86", change: "-78.24", changePct: "-0.40%", dayRange: "19,520 — 19,748", isUp: false },
    { name: "FTSE 100", subtitle: "United Kingdom", last: "8,412.30", change: "+23.46", changePct: "+0.28%", dayRange: "8,368 — 8,430", isUp: true },
    { name: "DAX", subtitle: "Germany", last: "18,892.14", change: "+95.80", changePct: "+0.51%", dayRange: "18,742 — 18,920", isUp: true },
    { name: "Nikkei 225", subtitle: "Japan", last: "39,412.80", change: "+445.62", changePct: "+1.14%", dayRange: "38,840 — 39,480", isUp: true },
    { name: "Hang Seng", subtitle: "Hong Kong", last: "19,845.30", change: "-124.20", changePct: "-0.62%", dayRange: "19,720 — 19,940", isUp: false },
    { name: "SENSEX", subtitle: "India", last: "82,648.40", change: "+386.20", changePct: "+0.47%", dayRange: "82,120 — 82,780", isUp: true },
    { name: "Shanghai Comp.", subtitle: "China", last: "3,086.42", change: "+18.64", changePct: "+0.61%", dayRange: "3,052 — 3,094", isUp: true },
  ],
  Americas: [
    { name: "S&P 500", subtitle: "United States", last: "6,003.63", change: "+27.34", changePct: "+0.46%", dayRange: "5,952 — 6,018", isUp: true },
    { name: "Dow Jones", subtitle: "United States", last: "44,128.50", change: "+316.02", changePct: "+0.72%", dayRange: "43,684 — 44,185", isUp: true },
    { name: "NASDAQ", subtitle: "United States", last: "19,643.86", change: "-78.24", changePct: "-0.40%", dayRange: "19,520 — 19,748", isUp: false },
    { name: "S&P/TSX", subtitle: "Canada", last: "24,862.40", change: "+112.60", changePct: "+0.45%", dayRange: "24,710 — 24,890", isUp: true },
    { name: "Bovespa", subtitle: "Brazil", last: "128,450.00", change: "-440.28", changePct: "-0.34%", dayRange: "127,820 — 129,100", isUp: false },
    { name: "IPC Mexico", subtitle: "Mexico", last: "54,286.40", change: "+186.20", changePct: "+0.34%", dayRange: "53,980 — 54,420", isUp: true },
    { name: "Merval", subtitle: "Argentina", last: "1,842,560", change: "+24,680", changePct: "+1.36%", dayRange: "1,810,400 — 1,848,200", isUp: true },
  ],
  Europe: [
    { name: "FTSE 100", subtitle: "United Kingdom", last: "8,412.30", change: "+23.46", changePct: "+0.28%", dayRange: "8,368 — 8,430", isUp: true },
    { name: "DAX", subtitle: "Germany", last: "18,892.14", change: "+95.80", changePct: "+0.51%", dayRange: "18,742 — 18,920", isUp: true },
    { name: "CAC 40", subtitle: "France", last: "8,124.68", change: "-14.62", changePct: "-0.18%", dayRange: "8,086 — 8,152", isUp: false },
    { name: "IBEX 35", subtitle: "Spain", last: "11,486.20", change: "+42.80", changePct: "+0.37%", dayRange: "11,410 — 11,510", isUp: true },
    { name: "SMI", subtitle: "Switzerland", last: "12,284.60", change: "+28.40", changePct: "+0.23%", dayRange: "12,230 — 12,310", isUp: true },
    { name: "AEX", subtitle: "Netherlands", last: "896.42", change: "-3.18", changePct: "-0.35%", dayRange: "892 — 901", isUp: false },
    { name: "STOXX 600", subtitle: "Pan-European", last: "524.86", change: "+1.42", changePct: "+0.27%", dayRange: "522 — 526", isUp: true },
  ],
  "Asia Pacific": [
    { name: "Nikkei 225", subtitle: "Japan", last: "39,412.80", change: "+445.62", changePct: "+1.14%", dayRange: "38,840 — 39,480", isUp: true },
    { name: "Hang Seng", subtitle: "Hong Kong", last: "19,845.30", change: "-124.20", changePct: "-0.62%", dayRange: "19,720 — 19,940", isUp: false },
    { name: "Shanghai Comp.", subtitle: "China", last: "3,086.42", change: "+18.64", changePct: "+0.61%", dayRange: "3,052 — 3,094", isUp: true },
    { name: "ASX 200", subtitle: "Australia", last: "8,102.40", change: "+26.60", changePct: "+0.33%", dayRange: "8,058 — 8,120", isUp: true },
    { name: "KOSPI", subtitle: "South Korea", last: "2,684.20", change: "-12.40", changePct: "-0.46%", dayRange: "2,668 — 2,698", isUp: false },
    { name: "SENSEX", subtitle: "India", last: "82,648.40", change: "+386.20", changePct: "+0.47%", dayRange: "82,120 — 82,780", isUp: true },
    { name: "STI", subtitle: "Singapore", last: "3,842.60", change: "+14.80", changePct: "+0.39%", dayRange: "3,818 — 3,850", isUp: true },
  ],
  "Middle East": [
    { name: "Tadawul", subtitle: "Saudi Arabia", last: "12,148.50", change: "+50.80", changePct: "+0.42%", dayRange: "12,060 — 12,180", isUp: true },
    { name: "ADX General", subtitle: "Abu Dhabi", last: "9,856.20", change: "+17.60", changePct: "+0.18%", dayRange: "9,812 — 9,878", isUp: true },
    { name: "DFM General", subtitle: "Dubai", last: "4,284.50", change: "+32.40", changePct: "+0.76%", dayRange: "4,228 — 4,296", isUp: true },
    { name: "QE Index", subtitle: "Qatar", last: "10,486.80", change: "-28.40", changePct: "-0.27%", dayRange: "10,440 — 10,520", isUp: false },
    { name: "Muscat MSM30", subtitle: "Oman", last: "4,682.40", change: "+12.20", changePct: "+0.26%", dayRange: "4,662 — 4,694", isUp: true },
  ],
  Africa: [
    { name: "JSE Top 40", subtitle: "South Africa", last: "74,286.40", change: "+342.80", changePct: "+0.46%", dayRange: "73,810 — 74,420", isUp: true },
    { name: "EGX 30", subtitle: "Egypt", last: "28,642.80", change: "-186.40", changePct: "-0.65%", dayRange: "28,480 — 28,860", isUp: false },
    { name: "NSE All-Share", subtitle: "Nigeria", last: "102,486.20", change: "+864.40", changePct: "+0.85%", dayRange: "101,420 — 102,680", isUp: true },
    { name: "NSE 20", subtitle: "Kenya", last: "1,842.60", change: "+8.40", changePct: "+0.46%", dayRange: "1,828 — 1,848", isUp: true },
    { name: "Casablanca MASI", subtitle: "Morocco", last: "14,286.80", change: "-42.20", changePct: "-0.29%", dayRange: "14,220 — 14,340", isUp: false },
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

export const INDIA_INDICES: IndiaIndex[] = [
  { name: "SENSEX", last: "81,245.30", change: "+412.50", changePct: "+0.51%", dayRange: "80,620 — 81,380", isUp: true },
  { name: "NIFTY 50", last: "24,682.10", change: "+128.40", changePct: "+0.52%", dayRange: "24,480 — 24,720", isUp: true },
  { name: "NIFTY Bank", last: "52,148.60", change: "-186.20", changePct: "-0.36%", dayRange: "51,840 — 52,460", isUp: false },
  { name: "NIFTY IT", last: "38,924.50", change: "+482.30", changePct: "+1.25%", dayRange: "38,340 — 39,010", isUp: true },
  { name: "NIFTY Midcap 100", last: "56,842.00", change: "+224.80", changePct: "+0.40%", dayRange: "56,480 — 56,920", isUp: true },
  { name: "NIFTY Smallcap 100", last: "18,246.40", change: "-82.60", changePct: "-0.45%", dayRange: "18,120 — 18,380", isUp: false },
];

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
export const UAE_INDICES: GlobalRow[] = [
  { name: "ADX General", subtitle: "Abu Dhabi", last: "9,856.20", change: "+17.60", changePct: "+0.18%", dayRange: "9,812 — 9,878", isUp: true },
  { name: "DFM General", subtitle: "Dubai", last: "4,284.50", change: "+32.40", changePct: "+0.76%", dayRange: "4,228 — 4,296", isUp: true },
  { name: "FTSE ADX 15", subtitle: "Abu Dhabi", last: "5,842.60", change: "+24.80", changePct: "+0.43%", dayRange: "5,806 — 5,860", isUp: true },
  { name: "DFM Real Estate", subtitle: "Dubai", last: "6,124.30", change: "-18.40", changePct: "-0.30%", dayRange: "6,086 — 6,180", isUp: false },
  { name: "ADX Banks", subtitle: "Abu Dhabi", last: "4,486.80", change: "+12.60", changePct: "+0.28%", dayRange: "4,462 — 4,502", isUp: true },
];

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
export const UK_INDICES: GlobalRow[] = [
  { name: "FTSE 100", subtitle: "London", last: "8,412.30", change: "+23.46", changePct: "+0.28%", dayRange: "8,368 — 8,430", isUp: true },
  { name: "FTSE 250", subtitle: "London", last: "20,486.40", change: "-42.80", changePct: "-0.21%", dayRange: "20,380 — 20,560", isUp: false },
  { name: "FTSE All-Share", subtitle: "London", last: "4,624.80", change: "+8.40", changePct: "+0.18%", dayRange: "4,608 — 4,638", isUp: true },
  { name: "FTSE AIM", subtitle: "London", last: "742.60", change: "+4.20", changePct: "+0.57%", dayRange: "736 — 746", isUp: true },
  { name: "FTSE 350", subtitle: "London", last: "4,286.40", change: "-6.80", changePct: "-0.16%", dayRange: "4,274 — 4,302", isUp: false },
];

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
