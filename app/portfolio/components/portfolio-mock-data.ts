/* ------------------------------------------------------------------ */
/*  Portfolio Overview — Mock Data                                     */
/* ------------------------------------------------------------------ */

// ── Portfolio Summary ──

export const PORTFOLIO_SUMMARY = {
  currentValue: 48_625.80,
  investedAmount: 45_780.50,
  dayChange: 385.20,
  dayChangePct: 0.80,
  unrealizedPnl: 2_845.30,
  unrealizedPnlPct: 6.21,
  xirr: 18.42,
  buyingPower: 12_485.50,
};

// ── Wealth Growth Chart Data ──

// Each month: invested = cumulative amount put in, value = portfolio market value
export const WEALTH_GROWTH_DATA = [
  { date: "Jan '25", invested: 30_000, value: 30_200 },
  { date: "Feb '25", invested: 31_000, value: 31_620 },
  { date: "Mar '25", invested: 32_000, value: 33_100 },
  { date: "Apr '25", invested: 33_000, value: 33_400 },
  { date: "May '25", invested: 34_000, value: 35_200 },
  { date: "Jun '25", invested: 35_000, value: 37_050 },
  { date: "Jul '25", invested: 36_000, value: 37_900 },
  { date: "Aug '25", invested: 37_500, value: 38_200 },
  { date: "Sep '25", invested: 39_000, value: 40_500 },
  { date: "Oct '25", invested: 40_500, value: 42_100 },
  { date: "Nov '25", invested: 42_000, value: 43_800 },
  { date: "Dec '25", invested: 43_500, value: 45_400 },
  { date: "Jan '26", invested: 44_500, value: 46_200 },
  { date: "Feb '26", invested: 45_200, value: 47_500 },
  { date: "Mar '26", invested: 45_780, value: 48_625 },
];

export const PERIOD_RETURNS = [
  { period: "1 Week", shortPeriod: "1W", value: 0.42 },
  { period: "1 Month", shortPeriod: "1M", value: 2.18 },
  { period: "6 Months", shortPeriod: "6M", value: 8.65 },
  { period: "1 Year", shortPeriod: "1Y", value: 16.30 },
];

// ── Asset Class Performance ──

export interface AssetClass {
  name: string;
  icon: string;
  count: string;
  current: number;
  invested: number;
  xirr: number;
  color: string;
}

export const ASSET_CLASSES: AssetClass[] = [
  { name: "Stocks", icon: "TrendingUp", count: "6 holdings", current: 28_420, invested: 23_150, xirr: 22.8, color: "bg-blue-500" },
  { name: "Collections", icon: "FolderOpen", count: "3 collections", current: 12_850, invested: 11_310, xirr: 13.6, color: "bg-violet-500" },
  { name: "Advisory", icon: "Sparkles", count: "2 baskets", current: 4_180, invested: 3_710, xirr: 12.6, color: "bg-amber-500" },
  { name: "ETFs", icon: "BarChart3", count: "2 holdings", current: 3_175, invested: 3_030, xirr: 4.8, color: "bg-emerald-500" },
];

// ── Investment Style (Lumpsum vs SIP) ──

export interface InvestmentStyle {
  label: string;
  invested: number;
  current: number;
  xirr: number;
  dayChange: number;
}

export const INVESTMENT_STYLES: { lumpsum: InvestmentStyle; sip: InvestmentStyle } = {
  lumpsum: { label: "One-time", invested: 32_450, current: 35_280.40, xirr: 22.8, dayChange: 0.82 },
  sip: { label: "Recurring (SIP)", invested: 13_330.50, current: 13_345.40, xirr: 12.6, dayChange: 0.75 },
};

// ── Top Movers (Portfolio Holdings) ──

export interface PortfolioMover {
  symbol: string;
  name: string;
  ltp: number;
  invested: number;
  current: number;
  pnl: number;
  pnlPct: number;
  dayChangePct: number;
  xirr: number;
  logoColor: string;
}

export const ALL_HOLDINGS: PortfolioMover[] = [
  // Gainers (>5%)
  { symbol: "AAPL 195C", name: "AAPL Mar 28 Call",  ltp: 5.85,   invested: 1_260, current: 1_755, pnl: 495.00,  pnlPct: 39.29, dayChangePct: 8.33,  xirr: 142.0, logoColor: "bg-neutral-500" },
  { symbol: "NVDA",      name: "NVIDIA Corp.",      ltp: 878.30, invested: 4_103, current: 4_392, pnl: 289.00,  pnlPct: 7.04,  dayChangePct: 0.97,  xirr: 32.1,  logoColor: "bg-neutral-500" },
  { symbol: "GOOGL",     name: "Alphabet Inc.",     ltp: 155.20, invested: 1_713, current: 1_862, pnl: 148.80,  pnlPct: 8.68,  dayChangePct: 0.84,  xirr: 21.8,  logoColor: "bg-neutral-500" },
  { symbol: "AAPL",      name: "Apple Inc.",        ltp: 192.40, invested: 2_674, current: 2_886, pnl: 212.25,  pnlPct: 7.94,  dayChangePct: 0.99,  xirr: 24.5,  logoColor: "bg-neutral-500" },
  { symbol: "MSFT",      name: "Microsoft Corp.",   ltp: 412.85, invested: 3_081, current: 3_303, pnl: 222.00,  pnlPct: 7.21,  dayChangePct: 0.56,  xirr: 19.2,  logoColor: "bg-neutral-500" },
  { symbol: "AMD",       name: "Advanced Micro Devices", ltp: 164.50, invested: 2_140, current: 2_468, pnl: 328.00, pnlPct: 15.33, dayChangePct: 1.42, xirr: 38.6, logoColor: "bg-neutral-500" },
  { symbol: "AMZN",      name: "Amazon.com Inc.",   ltp: 186.40, invested: 2_798, current: 3_166, pnl: 368.40,  pnlPct: 13.17, dayChangePct: 0.72,  xirr: 26.4,  logoColor: "bg-neutral-500" },
  { symbol: "CRM",       name: "Salesforce Inc.",   ltp: 284.60, invested: 1_990, current: 2_277, pnl: 286.80,  pnlPct: 14.41, dayChangePct: 1.18,  xirr: 29.2,  logoColor: "bg-neutral-500" },
  { symbol: "NFLX",      name: "Netflix Inc.",      ltp: 628.90, invested: 1_886, current: 2_075, pnl: 188.70,  pnlPct: 10.01, dayChangePct: 0.64,  xirr: 22.4,  logoColor: "bg-neutral-500" },

  // Losers (<-5%)
  { symbol: "TSLA",      name: "Tesla Inc.",        ltp: 231.10, invested: 1_490, current: 1_387, pnl: -103.20, pnlPct: -6.92,  dayChangePct: -1.62, xirr: -8.4,  logoColor: "bg-neutral-500" },
  { symbol: "SPY 510P",  name: "SPY Apr 18 Put",    ltp: 2.90,  invested: 1_900, current: 1_450, pnl: -450.00, pnlPct: -23.68, dayChangePct: -7.95, xirr: -52.3, logoColor: "bg-neutral-500" },
  { symbol: "SNAP",      name: "Snap Inc.",         ltp: 11.20,  invested: 1_680, current: 1_344, pnl: -336.00, pnlPct: -20.00, dayChangePct: -3.10, xirr: -28.4, logoColor: "bg-neutral-500" },
  { symbol: "PYPL",      name: "PayPal Holdings",   ltp: 64.80,  invested: 2_590, current: 2_268, pnl: -322.00, pnlPct: -12.43, dayChangePct: -1.85, xirr: -15.6, logoColor: "bg-neutral-500" },
  { symbol: "RIVN",      name: "Rivian Automotive",  ltp: 12.40, invested: 1_240, current: 1_116, pnl: -124.00, pnlPct: -10.00, dayChangePct: -2.40, xirr: -18.2, logoColor: "bg-neutral-500" },
  { symbol: "INTC",      name: "Intel Corp.",       ltp: 31.20,  invested: 1_872, current: 1_685, pnl: -187.20, pnlPct: -10.00, dayChangePct: -0.95, xirr: -14.8, logoColor: "bg-neutral-500" },
  { symbol: "BA",        name: "Boeing Co.",        ltp: 178.40, invested: 2_140, current: 1_962, pnl: -178.40, pnlPct: -8.34,  dayChangePct: -2.10, xirr: -11.2, logoColor: "bg-neutral-500" },
  { symbol: "DIS",       name: "Walt Disney Co.",   ltp: 98.60,  invested: 1_972, current: 1_774, pnl: -197.20, pnlPct: -10.00, dayChangePct: -1.30, xirr: -13.6, logoColor: "bg-neutral-500" },

  // Neutral (-5% to 5%)
  { symbol: "META",      name: "Meta Platforms",     ltp: 512.40, invested: 3_431, current: 3_587, pnl: 155.40, pnlPct: 4.53,  dayChangePct: 0.55,  xirr: 18.9,  logoColor: "bg-neutral-500" },
  { symbol: "VOO",       name: "Vanguard S&P 500",  ltp: 462.10, invested: 8_906, current: 9_242, pnl: 336.00, pnlPct: 3.77,  dayChangePct: 0.59,  xirr: 14.6,  logoColor: "bg-neutral-500" },
  { symbol: "JNJ",       name: "Johnson & Johnson", ltp: 158.40, invested: 3_160, current: 3_168, pnl: 8.00,   pnlPct: 0.25,  dayChangePct: 0.12,  xirr: 1.2,   logoColor: "bg-neutral-500" },
  { symbol: "KO",        name: "Coca-Cola Co.",     ltp: 62.30,  invested: 1_870, current: 1_869, pnl: -1.00,  pnlPct: -0.05, dayChangePct: -0.08, xirr: -0.3,  logoColor: "bg-neutral-500" },
  { symbol: "PG",        name: "Procter & Gamble",  ltp: 168.90, invested: 2_534, current: 2_560, pnl: 26.40,  pnlPct: 1.04,  dayChangePct: 0.22,  xirr: 2.8,   logoColor: "bg-neutral-500" },
  { symbol: "PEP",       name: "PepsiCo Inc.",      ltp: 172.15, invested: 1_722, current: 1_738, pnl: 16.50,  pnlPct: 0.96,  dayChangePct: -0.14, xirr: 2.1,   logoColor: "bg-neutral-500" },
  { symbol: "WMT",       name: "Walmart Inc.",      ltp: 168.20, invested: 2_523, current: 2_580, pnl: 57.00,  pnlPct: 2.26,  dayChangePct: 0.32,  xirr: 5.4,   logoColor: "bg-neutral-500" },
  { symbol: "XOM",       name: "Exxon Mobil Corp.", ltp: 108.40, invested: 2_168, current: 2_114, pnl: -54.00, pnlPct: -2.49, dayChangePct: -0.42, xirr: -3.8,  logoColor: "bg-neutral-500" },
  { symbol: "CSCO",      name: "Cisco Systems",     ltp: 48.90,  invested: 1_467, current: 1_492, pnl: 24.50,  pnlPct: 1.67,  dayChangePct: 0.18,  xirr: 3.2,   logoColor: "bg-neutral-500" },
];

export const TOP_GAINERS = ALL_HOLDINGS.filter((h) => h.pnlPct > 5).sort((a, b) => b.pnlPct - a.pnlPct);
export const TOP_LOSERS = ALL_HOLDINGS.filter((h) => h.pnlPct < -5).sort((a, b) => a.pnlPct - b.pnlPct);
export const NEUTRAL_HOLDINGS = ALL_HOLDINGS.filter((h) => h.pnlPct >= -5 && h.pnlPct <= 5).sort((a, b) => Math.abs(a.pnlPct) - Math.abs(b.pnlPct));

// ── P&L Calendar ──

export interface DayPnL {
  date: number;
  pnl: number;
  trades: number;
  isTrading: boolean;
}

function generateMonthPnL(year: number, month: number): DayPnL[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: DayPnL[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month, d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (isWeekend) {
      days.push({ date: d, pnl: 0, trades: 0, isTrading: false });
    } else {
      const seed = Math.sin(d * 47.3 + month * 13.1) * 10000;
      const frac = seed - Math.floor(seed);
      const pnl = Math.round((frac * 500 - 180) * 100) / 100;
      const trades = Math.floor(frac * 3) + 1;
      days.push({ date: d, pnl, trades, isTrading: true });
    }
  }
  return days;
}

export interface MonthPnLData {
  days: DayPnL[];
  daysInMonth: number;
  // 0=Mon based: day-of-week the 1st falls on (0=Mon, 4=Fri)
  firstWeekday: number;
}

function buildMonth(year: number, month: number): MonthPnLData {
  const jsDay = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert to Mon-based: Mon=0, Tue=1, ... Fri=4, Sat=5, Sun=6
  const firstWeekday = jsDay === 0 ? 6 : jsDay - 1;
  return {
    days: generateMonthPnL(year, month),
    daysInMonth: new Date(year, month + 1, 0).getDate(),
    firstWeekday,
  };
}

// Generate calendar data for 2024, 2025, and 2026 (up to March)
function buildAllMonths(): Record<string, MonthPnLData> {
  const result: Record<string, MonthPnLData> = {};
  // 2024: all 12 months
  for (let m = 0; m < 12; m++) {
    result[`2024-${String(m + 1).padStart(2, "0")}`] = buildMonth(2024, m);
  }
  // 2025: all 12 months
  for (let m = 0; m < 12; m++) {
    result[`2025-${String(m + 1).padStart(2, "0")}`] = buildMonth(2025, m);
  }
  // 2026: Jan–Mar
  for (let m = 0; m < 3; m++) {
    result[`2026-${String(m + 1).padStart(2, "0")}`] = buildMonth(2026, m);
  }
  return result;
}

export const PNL_CALENDAR: Record<string, MonthPnLData> = buildAllMonths();

export const PNL_MONTHLY_GOAL = 3_000;

// ── Portfolio vs Benchmark ──

export interface BenchmarkMetric {
  label: string;
  portfolio: number;
  benchmark: number;
  unit: string;
}

export const BENCHMARK_DATA = {
  benchmarkName: "S&P 500",
  period: "1Y",
  metrics: [
    { label: "Return", portfolio: 16.30, benchmark: 14.80, unit: "%" },
    { label: "Alpha", portfolio: 1.50, benchmark: 0, unit: "%" },
    { label: "Volatility", portfolio: 18.2, benchmark: 15.4, unit: "%" },
    { label: "Sharpe Ratio", portfolio: 1.24, benchmark: 1.08, unit: "" },
    { label: "Max Drawdown", portfolio: -8.6, benchmark: -7.2, unit: "%" },
  ] as BenchmarkMetric[],
};

// ── Tax Lot Awareness ──

export interface TaxLot {
  type: "short-term" | "long-term";
  label: string;
  sublabel: string;
  gains: number;
  positions: number;
  holdingPeriod: string;
}

export const TAX_LOTS: TaxLot[] = [
  {
    type: "short-term",
    label: "Short-term Gains",
    sublabel: "Taxed at income rate",
    gains: 1_240.60,
    positions: 3,
    holdingPeriod: "< 1 year",
  },
  {
    type: "long-term",
    label: "Long-term Gains",
    sublabel: "Taxed at capital gains rate",
    gains: 4_820.30,
    positions: 5,
    holdingPeriod: "> 1 year",
  },
];

export const TAX_SUMMARY = {
  totalUnrealized: 6_060.90,
  estimatedTax: 1_485.20,
  harvestable: 820.40,
  harvestablePositions: 2,
};
