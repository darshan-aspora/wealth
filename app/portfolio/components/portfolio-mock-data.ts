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
  realizedPnl: 2_842.30,
  realizedPnlPct: 8.21,
  xirr: 18.42,
  buyingPower: 12_485.50,
};

// ── Wealth Growth Chart Data (daily) ──
// Generated with realistic daily volatility. Invested line steps up on SIP dates (1st of month).

export interface WealthDataPoint {
  /** YYYY-MM-DD */
  time: string;
  /** Cumulative amount deposited */
  invested: number;
  /** Portfolio market value */
  value: number;
}

function generateDailyWealthData(): WealthDataPoint[] {
  const points: WealthDataPoint[] = [];

  // Initial lump sum on Jan 2, 2025
  const startDate = new Date(2025, 0, 2);
  const endDate = new Date(2026, 2, 31); // Mar 31, 2026

  let invested = 30_000; // initial lump sum
  let value = 30_000;
  const monthlySip = 1_200; // SIP on 1st of each month starting Feb 2025
  let sipStarted = false;

  const d = new Date(startDate);
  let dayIndex = 0;

  while (d <= endDate) {
    const dow = d.getDay();
    // Skip weekends
    if (dow !== 0 && dow !== 6) {
      const month = d.getMonth();
      const date = d.getDate();

      // SIP on the 1st trading day of each month (or first weekday after 1st)
      if (date <= 3 && !sipStarted && d > startDate) {
        invested += monthlySip;
        value += monthlySip; // new money added at market value
        sipStarted = true;
      }

      // Daily market movement: slight upward bias with realistic volatility
      // Use seeded pseudo-random based on day index for consistency
      const seed = Math.sin(dayIndex * 127.1 + month * 311.7) * 43758.5453;
      const rand = seed - Math.floor(seed); // 0–1
      const dailyReturn = (rand - 0.47) * 0.015; // slight positive bias, ~1.5% max daily swing
      value = value * (1 + dailyReturn);

      // Occasional larger moves
      const seed2 = Math.sin(dayIndex * 53.7 + 7.3) * 10000;
      const rand2 = seed2 - Math.floor(seed2);
      if (rand2 > 0.93) {
        // ~7% of days have a bigger move
        const bigMove = (rand - 0.45) * 0.025;
        value = value * (1 + bigMove);
      }

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      points.push({
        time: `${yyyy}-${mm}-${dd}`,
        invested: Math.round(invested * 100) / 100,
        value: Math.round(value * 100) / 100,
      });

      dayIndex++;
    }

    // Reset SIP flag at end of month
    if (d.getDate() >= 4) sipStarted = false;

    d.setDate(d.getDate() + 1);
  }

  // Normalize final value to match PORTFOLIO_SUMMARY.currentValue
  const lastPoint = points[points.length - 1];
  const scale = 48_625.80 / lastPoint.value;
  const investedScale = 45_780.50 / lastPoint.invested;
  for (const p of points) {
    p.value = Math.round(p.value * scale * 100) / 100;
    p.invested = Math.round(p.invested * investedScale * 100) / 100;
  }

  return points;
}

export const WEALTH_GROWTH_DATA: WealthDataPoint[] = generateDailyWealthData();

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
  { name: "Stocks",      icon: "TrendingUp", count: "8 holdings",  current: 34_250, invested: 41_580, xirr: 21.4, color: "bg-neutral-800" },
  { name: "ETFs",        icon: "BarChart3",  count: "3 holdings",  current:  4_550, invested:  4_785, xirr:  5.2, color: "bg-neutral-500" },
  { name: "Global ETFs", icon: "Globe",      count: "3 holdings",  current:  4_550, invested:  4_785, xirr:  5.2, color: "bg-neutral-400" },
  { name: "Advisory",   icon: "Sparkles",   count: "3 baskets",   current:  5_560, invested:  6_270, xirr: 12.8, color: "bg-neutral-300" },
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

export type MoverCategory = "Stocks" | "ETF" | "Global ETF" | "Collections";

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
  dailyPnl: number;
  weeklyPnl: number;
  monthlyPnl: number;
  yearlyPnl: number;
  allocationPct: number;
  category: MoverCategory;
}

export const ALL_HOLDINGS: PortfolioMover[] = [
  // Stocks — Gainers
  { category: "Stocks", symbol: "NVDA",  name: "NVIDIA",    ltp: 924.80, invested: 41_580, current: 34_250, pnl: 7_330, pnlPct: 21.4, dayChangePct: 3.8,  xirr: 21.4, logoColor: "bg-neutral-500", dailyPnl: 733,  weeklyPnl: 733,  monthlyPnl: 733,  yearlyPnl: 733,  allocationPct: 81.2 },
  { category: "Stocks", symbol: "AAPL",  name: "Apple",     ltp: 198.50, invested: 41_580, current: 34_250, pnl: 7_330, pnlPct: 21.4, dayChangePct: 2.9,  xirr: 21.4, logoColor: "bg-neutral-500", dailyPnl: 733,  weeklyPnl: 733,  monthlyPnl: 733,  yearlyPnl: 733,  allocationPct: 81.2 },
  { category: "Stocks", symbol: "MSFT",  name: "Microsoft", ltp: 425.30, invested: 41_580, current: 34_250, pnl: 7_330, pnlPct: 21.4, dayChangePct: 2.2,  xirr: 21.4, logoColor: "bg-neutral-500", dailyPnl: 733,  weeklyPnl: 733,  monthlyPnl: 733,  yearlyPnl: 733,  allocationPct: 81.2 },
  { category: "Stocks", symbol: "GOOGL", name: "Alphabet",  ltp: 176.80, invested: 41_580, current: 34_250, pnl: 7_330, pnlPct: 21.4, dayChangePct: 1.7,  xirr: 21.4, logoColor: "bg-neutral-500", dailyPnl: 733,  weeklyPnl: 733,  monthlyPnl: 733,  yearlyPnl: 733,  allocationPct: 81.2 },
  { category: "Stocks", symbol: "META",  name: "Meta",      ltp: 502.40, invested: 41_580, current: 34_250, pnl: 7_330, pnlPct: 21.4, dayChangePct: 1.5,  xirr: 21.4, logoColor: "bg-neutral-500", dailyPnl: 733,  weeklyPnl: 733,  monthlyPnl: 733,  yearlyPnl: 733,  allocationPct: 81.2 },
  { category: "Stocks", symbol: "JPM",   name: "JPMorgan",  ltp: 198.20, invested: 41_580, current: 34_250, pnl: 7_330, pnlPct: 21.4, dayChangePct: 0.6,  xirr: 21.4, logoColor: "bg-neutral-500", dailyPnl: 733,  weeklyPnl: 733,  monthlyPnl: 733,  yearlyPnl: 733,  allocationPct: 81.2 },
  { category: "Stocks", symbol: "AMZN",  name: "Amazon",    ltp: 186.40, invested: 41_580, current: 34_250, pnl: 7_330, pnlPct: 21.4, dayChangePct: 0.9,  xirr: 21.4, logoColor: "bg-neutral-500", dailyPnl: 733,  weeklyPnl: 733,  monthlyPnl: 733,  yearlyPnl: 733,  allocationPct: 81.2 },
  // Stocks — Losers
  { category: "Stocks", symbol: "TSLA",  name: "Tesla",     ltp: 231.10, invested: 1_490,  current: 1_387,  pnl: -103, pnlPct: -6.92,  dayChangePct: -1.62, xirr: -8.4,  logoColor: "bg-neutral-500", dailyPnl: -103, weeklyPnl: -210, monthlyPnl: -320, yearlyPnl: -450, allocationPct: 3.2 },
  { category: "Stocks", symbol: "SNAP",  name: "Snap",      ltp: 11.20,  invested: 1_680,  current: 1_344,  pnl: -336, pnlPct: -20.00, dayChangePct: -3.10, xirr: -28.4, logoColor: "bg-neutral-500", dailyPnl: -85,  weeklyPnl: -180, monthlyPnl: -280, yearlyPnl: -336, allocationPct: 2.5 },
  { category: "Stocks", symbol: "PYPL",  name: "PayPal",    ltp: 64.80,  invested: 2_590,  current: 2_268,  pnl: -322, pnlPct: -12.43, dayChangePct: -1.85, xirr: -15.6, logoColor: "bg-neutral-500", dailyPnl: -62,  weeklyPnl: -140, monthlyPnl: -220, yearlyPnl: -322, allocationPct: 4.2 },
  { category: "Stocks", symbol: "INTC",  name: "Intel",     ltp: 31.20,  invested: 1_872,  current: 1_685,  pnl: -187, pnlPct: -10.00, dayChangePct: -0.95, xirr: -14.8, logoColor: "bg-neutral-500", dailyPnl: -42,  weeklyPnl: -95,  monthlyPnl: -150, yearlyPnl: -187, allocationPct: 3.1 },
  { category: "Stocks", symbol: "BA",    name: "Boeing",    ltp: 178.40, invested: 2_140,  current: 1_962,  pnl: -178, pnlPct: -8.34,  dayChangePct: -2.10, xirr: -11.2, logoColor: "bg-neutral-500", dailyPnl: -55,  weeklyPnl: -110, monthlyPnl: -165, yearlyPnl: -178, allocationPct: 3.6 },
  // Stocks — Neutral
  { category: "Stocks", symbol: "JNJ",   name: "J&J",       ltp: 158.40, invested: 3_160,  current: 3_168,  pnl: 8,   pnlPct: 0.25,  dayChangePct: 0.12,  xirr: 1.2,  logoColor: "bg-neutral-500", dailyPnl: 4,   weeklyPnl: 6,   monthlyPnl: 8,   yearlyPnl: 8,   allocationPct: 5.8 },
  { category: "Stocks", symbol: "WMT",   name: "Walmart",   ltp: 168.20, invested: 2_523,  current: 2_580,  pnl: 57,  pnlPct: 2.26,  dayChangePct: 0.32,  xirr: 5.4,  logoColor: "bg-neutral-500", dailyPnl: 12,  weeklyPnl: 28,  monthlyPnl: 42,  yearlyPnl: 57,  allocationPct: 4.7 },

  // ETF — Gainers
  { category: "ETF", symbol: "VOO",  name: "Vanguard S&P 500",  ltp: 462.10, invested: 8_906, current: 9_242, pnl: 336,  pnlPct: 3.77,  dayChangePct: 0.59,  xirr: 14.6, logoColor: "bg-neutral-500", dailyPnl: 54,  weeklyPnl: 120,  monthlyPnl: 210,  yearlyPnl: 336,  allocationPct: 17.0 },
  { category: "ETF", symbol: "QQQ",  name: "Invesco QQQ",       ltp: 438.20, invested: 6_200, current: 7_030, pnl: 830,  pnlPct: 13.39, dayChangePct: 1.10,  xirr: 16.2, logoColor: "bg-neutral-500", dailyPnl: 95,  weeklyPnl: 210,  monthlyPnl: 380,  yearlyPnl: 830,  allocationPct: 13.0 },
  { category: "ETF", symbol: "SPY",  name: "SPDR S&P 500",      ltp: 518.40, invested: 5_100, current: 5_700, pnl: 600,  pnlPct: 11.76, dayChangePct: 0.82,  xirr: 13.8, logoColor: "bg-neutral-500", dailyPnl: 72,  weeklyPnl: 160,  monthlyPnl: 290,  yearlyPnl: 600,  allocationPct: 10.5 },
  // ETF — Losers
  { category: "ETF", symbol: "ARKK", name: "ARK Innovation",    ltp: 44.60,  invested: 3_200, current: 2_676, pnl: -524, pnlPct: -16.38, dayChangePct: -2.40, xirr: -19.2, logoColor: "bg-neutral-500", dailyPnl: -88, weeklyPnl: -190, monthlyPnl: -300, yearlyPnl: -524, allocationPct: 4.9 },
  { category: "ETF", symbol: "GLD",  name: "SPDR Gold Shares",  ltp: 218.30, invested: 2_800, current: 2_548, pnl: -252, pnlPct: -9.00,  dayChangePct: -0.85, xirr: -10.4, logoColor: "bg-neutral-500", dailyPnl: -30, weeklyPnl: -80,  monthlyPnl: -130, yearlyPnl: -252, allocationPct: 4.7 },
  // ETF — Neutral
  { category: "ETF", symbol: "IWM",  name: "iShares Russell 2000", ltp: 198.40, invested: 4_100, current: 4_182, pnl: 82, pnlPct: 2.00, dayChangePct: 0.25, xirr: 4.8, logoColor: "bg-neutral-500", dailyPnl: 18, weeklyPnl: 40, monthlyPnl: 60, yearlyPnl: 82, allocationPct: 7.7 },

  // Global ETF — Gainers
  { category: "Global ETF", symbol: "EEM",  name: "iShares MSCI EM",    ltp: 41.80,  invested: 3_500, current: 4_060, pnl: 560,  pnlPct: 16.00, dayChangePct: 1.80,  xirr: 18.4, logoColor: "bg-neutral-500", dailyPnl: 88,  weeklyPnl: 200, monthlyPnl: 320, yearlyPnl: 560, allocationPct: 7.5 },
  { category: "Global ETF", symbol: "VEA",  name: "Vanguard Dev Markets", ltp: 50.20, invested: 4_200, current: 4_620, pnl: 420,  pnlPct: 10.00, dayChangePct: 0.95,  xirr: 12.2, logoColor: "bg-neutral-500", dailyPnl: 55,  weeklyPnl: 130, monthlyPnl: 230, yearlyPnl: 420, allocationPct: 8.5 },
  // Global ETF — Losers
  { category: "Global ETF", symbol: "FXI",  name: "iShares China Large", ltp: 28.60,  invested: 2_600, current: 2_288, pnl: -312, pnlPct: -12.00, dayChangePct: -1.50, xirr: -14.8, logoColor: "bg-neutral-500", dailyPnl: -48, weeklyPnl: -110, monthlyPnl: -180, yearlyPnl: -312, allocationPct: 4.2 },
  // Global ETF — Neutral
  { category: "Global ETF", symbol: "IEFA", name: "iShares Core MSCI EAFE", ltp: 72.40, invested: 3_800, current: 3_876, pnl: 76, pnlPct: 2.00, dayChangePct: 0.18, xirr: 4.2, logoColor: "bg-neutral-500", dailyPnl: 10, weeklyPnl: 24, monthlyPnl: 42, yearlyPnl: 76, allocationPct: 7.1 },

  // Collections — Gainers
  { category: "Collections", symbol: "TECH5", name: "Tech Top 5",      ltp: 0, invested: 5_000, current: 6_200, pnl: 1_200, pnlPct: 24.00, dayChangePct: 2.10, xirr: 28.4, logoColor: "bg-neutral-500", dailyPnl: 180, weeklyPnl: 400, monthlyPnl: 700, yearlyPnl: 1_200, allocationPct: 11.4 },
  { category: "Collections", symbol: "DIV10", name: "Dividend 10",     ltp: 0, invested: 3_200, current: 3_712, pnl: 512,   pnlPct: 16.00, dayChangePct: 0.70, xirr: 18.2, logoColor: "bg-neutral-500", dailyPnl: 38,  weeklyPnl: 90,  monthlyPnl: 160, yearlyPnl: 512,   allocationPct: 6.8 },
  // Collections — Losers
  { category: "Collections", symbol: "GRWTH", name: "Growth Bundle",   ltp: 0, invested: 2_800, current: 2_380, pnl: -420,  pnlPct: -15.00, dayChangePct: -1.80, xirr: -18.0, logoColor: "bg-neutral-500", dailyPnl: -65, weeklyPnl: -150, monthlyPnl: -240, yearlyPnl: -420, allocationPct: 4.4 },
  // Collections — Neutral
  { category: "Collections", symbol: "BLCHP", name: "Blue Chips",      ltp: 0, invested: 4_500, current: 4_590, pnl: 90,    pnlPct: 2.00,  dayChangePct: 0.22,  xirr: 4.6,  logoColor: "bg-neutral-500", dailyPnl: 14,  weeklyPnl: 32,  monthlyPnl: 55,  yearlyPnl: 90,   allocationPct: 8.4 },
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
