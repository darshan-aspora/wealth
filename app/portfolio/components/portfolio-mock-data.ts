/* ------------------------------------------------------------------ */
/*  Portfolio Overview — Mock Data                                     */
/* ------------------------------------------------------------------ */

// ── Portfolio Summary ──

export const PORTFOLIO_SUMMARY = {
  currentValue: 48_625.80,
  investedAmount: 45_780.50,
  dayChange: 385.20,
  dayChangePct: 0.80,
  xirr: 18.42,
  buyingPower: 12_485.50,
};

export const PERIOD_RETURNS = [
  { period: "1W", value: 0.42 },
  { period: "1M", value: 2.18 },
  { period: "6M", value: 8.65 },
  { period: "1Y", value: 16.30 },
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
  pnlPct: number;
  dayChangePct: number;
  logoColor: string;
}

export const TOP_GAINERS: PortfolioMover[] = [
  { symbol: "AAPL 195C", name: "AAPL Mar 28 Call", ltp: 5.85, pnlPct: 39.29, dayChangePct: 8.33, logoColor: "bg-amber-600" },
  { symbol: "GOOGL", name: "Alphabet Inc.", ltp: 155.20, pnlPct: 8.68, dayChangePct: 0.84, logoColor: "bg-red-500" },
  { symbol: "AAPL", name: "Apple Inc.", ltp: 192.40, pnlPct: 7.94, dayChangePct: 0.99, logoColor: "bg-neutral-600" },
  { symbol: "MSFT", name: "Microsoft Corp.", ltp: 412.85, pnlPct: 7.21, dayChangePct: 0.56, logoColor: "bg-blue-600" },
];

export const TOP_LOSERS: PortfolioMover[] = [
  { symbol: "SPY 510P", name: "SPY Apr 18 Put", ltp: 2.90, pnlPct: -23.68, dayChangePct: -7.95, logoColor: "bg-violet-600" },
  { symbol: "TSLA", name: "Tesla Inc.", ltp: 231.10, pnlPct: -6.92, dayChangePct: -1.62, logoColor: "bg-red-600" },
];

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

export const PNL_CALENDAR: Record<string, MonthPnLData> = {
  "2026-03": buildMonth(2026, 2),
  "2026-02": buildMonth(2026, 1),
};

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
