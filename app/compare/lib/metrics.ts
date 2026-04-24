import { ALL_TICKERS, type TickerItem } from "@/components/ticker";
import { KEY_METRICS, PERFORMANCE, ANALYST_RATINGS, SIMILAR_STOCKS } from "@/app/shared-components/mock-data";

/* ------------------------------------------------------------------ */
/*  Format helpers                                                    */
/* ------------------------------------------------------------------ */

export function formatMarketCap(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return n.toLocaleString();
}

export function formatCompactPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(2);
}

export function formatPct(n: number, digits = 1): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

/* ------------------------------------------------------------------ */
/*  Metric extraction per stock                                       */
/* ------------------------------------------------------------------ */

export interface StockCompareData {
  symbol: string;
  name: string;
  ticker: TickerItem | null;
  // Snapshot
  price: string;
  changePct: number | null;
  marketCap: string;
  sector: string;
  // Returns
  return1M: number | null;
  return1Y: number | null;
  return5Y: number | null;
  vsBenchmark: number | null; // stockReturn - benchReturn
  // Valuation
  peRatio: string;
  eps: string;
  revenue: string;
  profitMargin: string;
  divYield: string;
  // Range
  high52W: string;
  low52W: string;
  pctFromHigh: number | null;
  beta: string;
  // Analyst
  analystRating: string; // "Buy" | "Strong Buy" etc
  priceTarget: string;
  upsidePct: number | null;
}

const SECTOR_BY_SYMBOL: Record<string, string> = {
  AAPL: "Technology",
  MSFT: "Technology",
  GOOGL: "Technology",
  AMZN: "Consumer",
  NVDA: "Semis",
  META: "Technology",
  TSLA: "Autos",
  JPM: "Financials",
  V: "Financials",
  UNH: "Healthcare",
  JNJ: "Healthcare",
  WMT: "Retail",
  AVGO: "Semis",
  COST: "Retail",
  NFLX: "Media",
  AMD: "Semis",
  INTC: "Semis",
  RIVN: "Autos",
  LCID: "Autos",
  NIO: "Autos",
  LI: "Autos",
  XPEV: "Autos",
};

function pickMetric(arr: { label: string; value: string }[] | undefined, label: string): string {
  if (!arr) return "—";
  const found = arr.find((m) => m.label.toLowerCase() === label.toLowerCase());
  return found?.value ?? "—";
}

function parsePercent(s: string): number | null {
  const m = s.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  return parseFloat(m[0]);
}

function parseDollar(s: string): number | null {
  const cleaned = s.replace(/[$,]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function consensusRating(r: {
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}): string {
  const bullish = r.strongBuy * 2 + r.buy;
  const bearish = r.strongSell * 2 + r.sell;
  const diff = bullish - bearish;
  const total = r.strongBuy + r.buy + r.hold + r.sell + r.strongSell;
  if (total === 0) return "—";
  if (diff / total > 0.6) return "Strong Buy";
  if (diff / total > 0.15) return "Buy";
  if (diff / total > -0.15) return "Hold";
  if (diff / total > -0.6) return "Sell";
  return "Strong Sell";
}

export function getCompareData(symbol: string): StockCompareData {
  const sym = symbol.toUpperCase();
  const ticker = ALL_TICKERS.find((t) => t.symbol === sym) ?? null;
  const metrics = KEY_METRICS[sym];
  const perf = PERFORMANCE[sym];
  const analyst = ANALYST_RATINGS[sym];

  const name = ticker?.name ?? sym;
  const price = ticker ? formatCompactPrice(ticker.price) : "—";

  // Returns
  const ret = (p: string) => perf?.returns.find((r) => r.period === p)?.value ?? null;

  // 52W calcs
  let pctFromHigh: number | null = null;
  if (perf && ticker) {
    pctFromHigh = ((ticker.price - perf.weekRange.high) / perf.weekRange.high) * 100;
  }

  // Upside
  let upsidePct: number | null = null;
  if (analyst && ticker) {
    upsidePct = ((analyst.priceTarget.avg - ticker.price) / ticker.price) * 100;
  }

  return {
    symbol: sym,
    name,
    ticker,
    // Snapshot
    price,
    changePct: ticker?.changePercent ?? null,
    marketCap: ticker?.marketCap ? formatMarketCap(ticker.marketCap) : pickMetric(metrics?.primary, "Market Cap").replace("$", ""),
    sector: SECTOR_BY_SYMBOL[sym] ?? ticker?.type ?? "—",
    // Returns
    return1M: ret("1M"),
    return1Y: ret("1Y"),
    return5Y: ret("5Y"),
    vsBenchmark: perf ? perf.benchmark.stockReturn - perf.benchmark.benchReturn : null,
    // Valuation
    peRatio: pickMetric(metrics?.primary, "P/E Ratio"),
    eps: pickMetric(metrics?.primary, "EPS (TTM)"),
    revenue: pickMetric(metrics?.primary, "Revenue (TTM)").replace("$", ""),
    profitMargin: pickMetric(metrics?.primary, "Profit Margin"),
    divYield: pickMetric(metrics?.primary, "Dividend Yield"),
    // Range
    high52W: pickMetric(metrics?.secondary, "52W High").replace("$", ""),
    low52W: pickMetric(metrics?.secondary, "52W Low").replace("$", ""),
    pctFromHigh,
    beta: pickMetric(metrics?.secondary, "Beta"),
    // Analyst
    analystRating: analyst ? consensusRating(analyst.ratings) : "—",
    priceTarget: analyst ? formatCompactPrice(analyst.priceTarget.avg) : "—",
    upsidePct,
  };
}

/* ------------------------------------------------------------------ */
/*  Metric row definitions                                            */
/* ------------------------------------------------------------------ */

export type CompareCellKind = "plain" | "change" | "percent-signed" | "best-high" | "best-low";

export interface MetricRow {
  key: string;
  label: string;
  kind: CompareCellKind;
  getValue: (d: StockCompareData) => { display: string; numeric: number | null };
}

export interface MetricSection {
  id: string;
  title: string;
  rows: MetricRow[];
}

const num = (display: string, numeric: number | null) => ({ display, numeric });

export const METRIC_SECTIONS: MetricSection[] = [
  {
    id: "snapshot",
    title: "Snapshot",
    rows: [
      {
        key: "price",
        label: "Price",
        kind: "plain",
        getValue: (d) => num(d.price, d.ticker?.price ?? null),
      },
      {
        key: "change",
        label: "Today",
        kind: "change",
        getValue: (d) => num(d.changePct != null ? formatPct(d.changePct) : "—", d.changePct),
      },
      {
        key: "mcap",
        label: "Market Cap",
        kind: "best-high",
        getValue: (d) => num(d.marketCap, d.ticker?.marketCap ?? null),
      },
      {
        key: "sector",
        label: "Sector",
        kind: "plain",
        getValue: (d) => num(d.sector, null),
      },
    ],
  },
  {
    id: "returns",
    title: "Returns",
    rows: [
      {
        key: "ret1m",
        label: "1 Month",
        kind: "percent-signed",
        getValue: (d) => num(d.return1M != null ? formatPct(d.return1M) : "—", d.return1M),
      },
      {
        key: "ret1y",
        label: "1 Year",
        kind: "percent-signed",
        getValue: (d) => num(d.return1Y != null ? formatPct(d.return1Y) : "—", d.return1Y),
      },
      {
        key: "ret5y",
        label: "5 Year",
        kind: "percent-signed",
        getValue: (d) => num(d.return5Y != null ? formatPct(d.return5Y) : "—", d.return5Y),
      },
      {
        key: "vsbench",
        label: "vs S&P 500 (1Y)",
        kind: "percent-signed",
        getValue: (d) =>
          num(d.vsBenchmark != null ? formatPct(d.vsBenchmark) : "—", d.vsBenchmark),
      },
    ],
  },
  {
    id: "valuation",
    title: "Valuation",
    rows: [
      {
        key: "pe",
        label: "P/E Ratio",
        kind: "best-low",
        getValue: (d) => num(d.peRatio, parsePercent(d.peRatio)),
      },
      {
        key: "eps",
        label: "EPS (TTM)",
        kind: "best-high",
        getValue: (d) => num(d.eps, parseDollar(d.eps)),
      },
      {
        key: "revenue",
        label: "Revenue",
        kind: "best-high",
        getValue: (d) => num(d.revenue, parseDollar(d.revenue.replace(/[BTM]/, ""))),
      },
      {
        key: "margin",
        label: "Profit Margin",
        kind: "best-high",
        getValue: (d) => num(d.profitMargin, parsePercent(d.profitMargin)),
      },
      {
        key: "divyield",
        label: "Div Yield",
        kind: "best-high",
        getValue: (d) => num(d.divYield, parsePercent(d.divYield)),
      },
    ],
  },
  {
    id: "range",
    title: "Range",
    rows: [
      {
        key: "high52",
        label: "52W High",
        kind: "plain",
        getValue: (d) => num(d.high52W, parseDollar(d.high52W)),
      },
      {
        key: "low52",
        label: "52W Low",
        kind: "plain",
        getValue: (d) => num(d.low52W, parseDollar(d.low52W)),
      },
      {
        key: "pctfromhigh",
        label: "% from high",
        kind: "percent-signed",
        getValue: (d) =>
          num(d.pctFromHigh != null ? formatPct(d.pctFromHigh) : "—", d.pctFromHigh),
      },
      {
        key: "beta",
        label: "Beta",
        kind: "plain",
        getValue: (d) => num(d.beta, parsePercent(d.beta)),
      },
    ],
  },
  {
    id: "analyst",
    title: "Analyst",
    rows: [
      {
        key: "rating",
        label: "Rating",
        kind: "plain",
        getValue: (d) => num(d.analystRating, null),
      },
      {
        key: "target",
        label: "Avg Target",
        kind: "plain",
        getValue: (d) => num(d.priceTarget, parseDollar(d.priceTarget)),
      },
      {
        key: "upside",
        label: "Upside",
        kind: "percent-signed",
        getValue: (d) => num(d.upsidePct != null ? formatPct(d.upsidePct) : "—", d.upsidePct),
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Suggestions from similar stocks                                   */
/* ------------------------------------------------------------------ */

export function getSuggestedSymbols(activeSymbols: string[], limit = 6): string[] {
  const active = new Set(activeSymbols.map((s) => s.toUpperCase()));
  const scores = new Map<string, number>();

  activeSymbols.forEach((s) => {
    const sym = s.toUpperCase();
    const similars = SIMILAR_STOCKS[sym] ?? [];
    similars.forEach((sim, i) => {
      if (active.has(sim)) return;
      // inverse rank + existence boost
      scores.set(sim, (scores.get(sim) ?? 0) + (similars.length - i));
    });
  });

  const sorted = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([s]) => s);

  return sorted.slice(0, limit);
}

export function getPopularSymbols(exclude: string[], limit = 8): string[] {
  const ex = new Set(exclude.map((s) => s.toUpperCase()));
  return ALL_TICKERS.filter((t) => t.type === "Equity" && !ex.has(t.symbol))
    .slice(0, limit)
    .map((t) => t.symbol);
}
