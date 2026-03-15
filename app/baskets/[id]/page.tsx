"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Share2,
  Shield,
  Clock,
  RefreshCw,
  FileText,
  AlertTriangle,
  Gem,
  Zap,
  Layers,
  Cpu,
  ChevronRight,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

/* ------------------------------------------------------------------ */
/*  Types & Data (mirrored from advisory-baskets)                      */
/* ------------------------------------------------------------------ */

type RiskLevel = 1 | 2 | 3 | 4 | 5;

const riskLabels: Record<RiskLevel, string> = {
  1: "Capital Preservation",
  2: "Conservative",
  3: "Balanced",
  4: "Growth",
  5: "Aggressive",
};

const riskTagColor: Record<RiskLevel, string> = {
  1: "text-emerald-400 bg-emerald-500/15",
  2: "text-sky-400 bg-sky-500/15",
  3: "text-amber-400 bg-amber-500/15",
  4: "text-orange-400 bg-orange-500/15",
  5: "text-rose-400 bg-rose-500/15",
};

interface HoldingItem {
  symbol: string;
  name: string;
  weight: number;
  price: number;
  change: number;
}

interface BasketDetail {
  id: string;
  name: string;
  description: string;
  suitableFor: string;
  minInvestment: string;
  cagr: string;
  cagrYears: number;
  maxDrawdown: string;
  risk: RiskLevel;
  stockCount: number;
  rebalance: "Weekly" | "Monthly" | "Quarterly" | "Yearly";
  lastRebalance: string;
  nextRebalance: string;
  icon: LucideIcon;
  color: string;
  inception: string;
  aum: string;
  holdings: HoldingItem[];
}

/* ------------------------------------------------------------------ */
/*  Mock basket details                                                */
/* ------------------------------------------------------------------ */

const basketDetails: Record<string, BasketDetail> = {
  b1: {
    id: "b1", name: "Blue Chip Leaders", description: "Large-cap US equities with proven track records and consistent dividends", suitableFor: "Ideal for long-term investors seeking stable, reliable growth", minInvestment: "5,000", cagr: "14.2%", cagrYears: 10, maxDrawdown: "-8.3%", risk: 2, stockCount: 15, rebalance: "Quarterly", lastRebalance: "Jan 15, 2026", nextRebalance: "Apr 15, 2026", icon: Shield, color: "bg-blue-500/15 text-blue-400", inception: "Mar 2016", aum: "42.8M",
    holdings: [
      { symbol: "AAPL", name: "Apple Inc.", weight: 12.5, price: 198.4, change: 1.24 },
      { symbol: "MSFT", name: "Microsoft Corp.", weight: 11.8, price: 432.1, change: 0.87 },
      { symbol: "JNJ", name: "Johnson & Johnson", weight: 8.2, price: 158.7, change: -0.34 },
      { symbol: "PG", name: "Procter & Gamble", weight: 7.9, price: 172.3, change: 0.56 },
      { symbol: "UNH", name: "UnitedHealth Group", weight: 7.4, price: 524.8, change: -1.12 },
      { symbol: "V", name: "Visa Inc.", weight: 7.1, price: 287.9, change: 0.93 },
      { symbol: "HD", name: "Home Depot", weight: 6.8, price: 392.4, change: 1.47 },
      { symbol: "MA", name: "Mastercard Inc.", weight: 6.5, price: 478.2, change: 0.68 },
      { symbol: "PEP", name: "PepsiCo Inc.", weight: 6.2, price: 176.8, change: -0.21 },
      { symbol: "COST", name: "Costco Wholesale", weight: 5.8, price: 892.4, change: 0.45 },
      { symbol: "ABBV", name: "AbbVie Inc.", weight: 5.4, price: 184.2, change: 1.89 },
      { symbol: "MRK", name: "Merck & Co.", weight: 4.9, price: 128.6, change: -0.67 },
      { symbol: "KO", name: "Coca-Cola Co.", weight: 3.8, price: 62.4, change: 0.32 },
      { symbol: "WMT", name: "Walmart Inc.", weight: 3.2, price: 178.9, change: 0.78 },
      { symbol: "CSCO", name: "Cisco Systems", weight: 2.5, price: 52.8, change: -0.45 },
    ],
  },
  b2: {
    id: "b2", name: "Growth Accelerator", description: "High-growth companies disrupting industries with strong revenue momentum", suitableFor: "For aggressive investors comfortable with higher volatility", minInvestment: "10,000", cagr: "22.8%", cagrYears: 5, maxDrawdown: "-28.4%", risk: 5, stockCount: 12, rebalance: "Monthly", lastRebalance: "Feb 28, 2026", nextRebalance: "Mar 31, 2026", icon: Zap, color: "bg-emerald-500/15 text-emerald-400", inception: "Jun 2021", aum: "28.3M",
    holdings: [
      { symbol: "TSLA", name: "Tesla Inc.", weight: 14.2, price: 248.6, change: 3.24 },
      { symbol: "SHOP", name: "Shopify Inc.", weight: 12.1, price: 94.3, change: 2.18 },
      { symbol: "SQ", name: "Block Inc.", weight: 10.8, price: 82.7, change: -1.45 },
      { symbol: "PLTR", name: "Palantir Technologies", weight: 10.4, price: 24.8, change: 4.67 },
      { symbol: "CRWD", name: "CrowdStrike Holdings", weight: 9.7, price: 312.5, change: 1.89 },
      { symbol: "DDOG", name: "Datadog Inc.", weight: 8.9, price: 128.4, change: -0.76 },
      { symbol: "NET", name: "Cloudflare Inc.", weight: 8.2, price: 92.1, change: 2.34 },
      { symbol: "SNOW", name: "Snowflake Inc.", weight: 7.4, price: 168.9, change: -1.23 },
      { symbol: "MELI", name: "MercadoLibre Inc.", weight: 6.8, price: 1724.3, change: 0.98 },
      { symbol: "TTD", name: "The Trade Desk", weight: 5.2, price: 88.4, change: 1.56 },
      { symbol: "ROKU", name: "Roku Inc.", weight: 3.8, price: 68.2, change: -2.34 },
      { symbol: "ABNB", name: "Airbnb Inc.", weight: 2.5, price: 156.7, change: 0.87 },
    ],
  },
  b3: {
    id: "b3", name: "Dividend Compounder", description: "Steady income generators with 10+ years of consecutive dividend growth", suitableFor: "Perfect for income-focused investors nearing or in retirement", minInvestment: "5,000", cagr: "11.6%", cagrYears: 15, maxDrawdown: "-5.1%", risk: 1, stockCount: 20, rebalance: "Yearly", lastRebalance: "Jan 1, 2026", nextRebalance: "Jan 1, 2027", icon: Gem, color: "bg-amber-500/15 text-amber-400", inception: "Jan 2011", aum: "67.2M",
    holdings: [
      { symbol: "KO", name: "Coca-Cola Co.", weight: 8.4, price: 62.4, change: 0.32 },
      { symbol: "PEP", name: "PepsiCo Inc.", weight: 7.9, price: 176.8, change: -0.21 },
      { symbol: "MMM", name: "3M Company", weight: 6.5, price: 112.4, change: 1.12 },
      { symbol: "XOM", name: "Exxon Mobil Corp.", weight: 6.2, price: 108.9, change: -0.89 },
      { symbol: "JNJ", name: "Johnson & Johnson", weight: 5.8, price: 158.7, change: -0.34 },
      { symbol: "PG", name: "Procter & Gamble", weight: 5.6, price: 172.3, change: 0.56 },
      { symbol: "T", name: "AT&T Inc.", weight: 5.4, price: 18.9, change: 0.23 },
      { symbol: "VZ", name: "Verizon Comm.", weight: 5.2, price: 42.6, change: -0.45 },
      { symbol: "ABBV", name: "AbbVie Inc.", weight: 5.0, price: 184.2, change: 1.89 },
      { symbol: "CVX", name: "Chevron Corp.", weight: 4.8, price: 162.8, change: -0.67 },
      { symbol: "MO", name: "Altria Group", weight: 4.5, price: 48.2, change: 0.34 },
      { symbol: "IBM", name: "IBM Corp.", weight: 4.2, price: 192.4, change: 0.78 },
      { symbol: "MCD", name: "McDonald's Corp.", weight: 3.8, price: 298.7, change: 0.45 },
      { symbol: "WBA", name: "Walgreens Boots", weight: 3.5, price: 24.8, change: -1.23 },
      { symbol: "CAT", name: "Caterpillar Inc.", weight: 3.2, price: 312.5, change: 1.56 },
      { symbol: "EMR", name: "Emerson Electric", weight: 3.0, price: 108.4, change: 0.67 },
      { symbol: "SWK", name: "Stanley B&D", weight: 2.8, price: 94.6, change: -0.89 },
      { symbol: "FRT", name: "Federal Realty", weight: 2.5, price: 108.9, change: 0.34 },
      { symbol: "ED", name: "Con Edison", weight: 2.2, price: 98.4, change: 0.12 },
      { symbol: "ITW", name: "Illinois Tool Works", weight: 1.5, price: 262.8, change: 0.45 },
    ],
  },
  b4: {
    id: "b4", name: "AI & Tech Frontier", description: "Companies leading the AI revolution across semiconductors, cloud, and software", suitableFor: "For tech-savvy investors who believe in the AI megatrend", minInvestment: "10,000", cagr: "28.4%", cagrYears: 3, maxDrawdown: "-31.2%", risk: 5, stockCount: 10, rebalance: "Monthly", lastRebalance: "Feb 28, 2026", nextRebalance: "Mar 31, 2026", icon: Cpu, color: "bg-purple-500/15 text-purple-400", inception: "Mar 2023", aum: "54.1M",
    holdings: [
      { symbol: "NVDA", name: "NVIDIA Corp.", weight: 18.4, price: 892.4, change: 2.34 },
      { symbol: "AMD", name: "Advanced Micro Devices", weight: 14.2, price: 178.6, change: 1.89 },
      { symbol: "GOOGL", name: "Alphabet Inc.", weight: 12.8, price: 156.2, change: 0.67 },
      { symbol: "META", name: "Meta Platforms", weight: 11.5, price: 512.4, change: 1.23 },
      { symbol: "MSFT", name: "Microsoft Corp.", weight: 10.2, price: 432.1, change: 0.87 },
      { symbol: "AVGO", name: "Broadcom Inc.", weight: 8.9, price: 1324.8, change: -0.45 },
      { symbol: "TSM", name: "TSMC", weight: 7.6, price: 148.9, change: 1.56 },
      { symbol: "ORCL", name: "Oracle Corp.", weight: 6.4, price: 128.4, change: 0.78 },
      { symbol: "CRM", name: "Salesforce Inc.", weight: 5.2, price: 268.7, change: -0.34 },
      { symbol: "PANW", name: "Palo Alto Networks", weight: 4.8, price: 312.5, change: 2.12 },
    ],
  },
};

// Fallback generator for baskets not in the detail map
function generateFallbackBasket(id: string): BasketDetail {
  return {
    id, name: "Basket", description: "Advisory basket", suitableFor: "For all investors", minInvestment: "5,000", cagr: "12.0%", cagrYears: 5, maxDrawdown: "-10.0%", risk: 3, stockCount: 10, rebalance: "Quarterly", lastRebalance: "Jan 15, 2026", nextRebalance: "Apr 15, 2026", icon: Layers, color: "bg-cyan-500/15 text-cyan-400", inception: "Jan 2021", aum: "15.0M",
    holdings: [
      { symbol: "AAPL", name: "Apple Inc.", weight: 15.0, price: 198.4, change: 1.24 },
      { symbol: "MSFT", name: "Microsoft Corp.", weight: 12.0, price: 432.1, change: 0.87 },
      { symbol: "GOOGL", name: "Alphabet Inc.", weight: 10.0, price: 156.2, change: 0.67 },
      { symbol: "AMZN", name: "Amazon.com", weight: 10.0, price: 186.4, change: -0.45 },
      { symbol: "NVDA", name: "NVIDIA Corp.", weight: 8.0, price: 892.4, change: 2.34 },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Performance chart mock data                                        */
/* ------------------------------------------------------------------ */

type ChartPeriod = "1D" | "1W" | "1M" | "3M" | "1Y" | "2Y" | "3Y" | "5Y";

const CHART_PERIODS: ChartPeriod[] = ["1D", "1W", "1M", "3M", "1Y", "2Y", "3Y", "5Y"];

function generatePerformanceData(period: ChartPeriod, baseReturn: number): { time: string; value: number }[] {
  const points: { time: string; value: number }[] = [];
  let count = 0;
  switch (period) {
    case "1D": count = 78; break;
    case "1W": count = 35; break;
    case "1M": count = 22; break;
    case "3M": count = 65; break;
    case "1Y": count = 52; break;
    case "2Y": count = 104; break;
    case "3Y": count = 156; break;
    case "5Y": count = 260; break;
  }

  let value = 10000;
  const periodMultiplier = period === "1D" ? 0.001 : period === "1W" ? 0.003 : period === "1M" ? 0.008 : period === "3M" ? 0.02 : period === "1Y" ? 0.05 : period === "2Y" ? 0.04 : period === "3Y" ? 0.035 : 0.03;
  const trend = baseReturn > 15 ? 0.004 : baseReturn > 10 ? 0.002 : 0.001;

  for (let i = 0; i < count; i++) {
    const noise = (Math.random() - 0.48) * periodMultiplier * value;
    value = value + noise + trend * value * 0.01;
    points.push({ time: `${i}`, value: Math.round(value * 100) / 100 });
  }
  return points;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MiniChart({ data, isPositive }: { data: { time: string; value: number }[]; isPositive: boolean }) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 360;
  const height = 160;
  const padding = 4;

  const pathPoints = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const linePath = `M${pathPoints.join(" L")}`;
  const areaPath = `${linePath} L${width - padding},${height} L${padding},${height} Z`;

  const color = isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)";
  const gradientId = isPositive ? "gainGrad" : "lossGrad";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[160px]">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[18px] font-bold text-foreground px-5 mb-3">{children}</h3>;
}

function HoldingRow({ holding, index }: { holding: HoldingItem; index: number }) {
  const isPositive = holding.change >= 0;
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div className="w-7 text-center">
        <span className="text-[13px] text-muted-foreground font-medium">{index + 1}</span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <span className="text-[12px] font-bold text-muted-foreground">{holding.symbol.slice(0, 3)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-foreground">{holding.symbol}</p>
        <p className="text-[13px] text-muted-foreground truncate">{holding.name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[15px] font-semibold text-foreground tabular-nums">{holding.price.toFixed(1)}</p>
        <p className={cn("text-[13px] font-medium tabular-nums", isPositive ? "text-gain" : "text-loss")}>
          {isPositive ? "+" : ""}{holding.change.toFixed(2)}%
        </p>
      </div>
      <div className="w-14 text-right shrink-0">
        <p className="text-[13px] font-semibold text-foreground tabular-nums">{holding.weight}%</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function BasketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params.id as string) || "b1";

  const basket = basketDetails[id] || generateFallbackBasket(id);
  const Icon = basket.icon;

  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("1Y");
  const [headerCompact, setHeaderCompact] = useState(false);
  const lastScrollTop = useRef(0);

  const chartData = useMemo(
    () => generatePerformanceData(chartPeriod, parseFloat(basket.cagr)),
    [chartPeriod, basket.cagr],
  );

  const periodReturn = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    return ((last - first) / first) * 100;
  }, [chartData]);

  const isPositive = periodReturn >= 0;

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const st = e.currentTarget.scrollTop;
    setHeaderCompact(st > 120);
    lastScrollTop.current = st;
  }, []);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/40">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center -ml-2 active:opacity-60">
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <div className="flex-1 text-center">
          {headerCompact ? (
            <div>
              <p className="text-[15px] font-semibold text-foreground">{basket.name}</p>
              <p className={cn("text-[13px] font-medium", isPositive ? "text-gain" : "text-loss")}>
                {isPositive ? "+" : ""}{periodReturn.toFixed(2)}% · {chartPeriod}
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">Powered by <span className="font-semibold text-foreground">Atom Privé</span></p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 flex items-center justify-center active:opacity-60">
            <Share2 size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar" onScroll={handleScroll}>

        {/* Hero */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-start gap-3 mb-2">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", basket.color)}>
              <Icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <span className={cn("text-[12px] font-semibold px-2 py-0.5 rounded-md inline-block mb-1", riskTagColor[basket.risk])}>
                {riskLabels[basket.risk]}
              </span>
              <h1 className="text-[22px] font-bold text-foreground leading-tight">{basket.name}</h1>
            </div>
          </div>
          <p className="text-[14px] text-muted-foreground leading-snug">{basket.description}</p>
          <p className="text-[13px] text-foreground/60 mt-1.5 italic">{basket.suitableFor}</p>
        </div>

        {/* Key stats row */}
        <div className="flex items-center justify-between px-5 py-3 mt-1">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">CAGR</p>
            <p className="text-[20px] font-bold text-gain">{basket.cagr}</p>
            <p className="text-[12px] text-muted-foreground">{basket.cagrYears}Y track record</p>
          </div>
          <div className="w-px h-10 bg-border/40" />
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Max DD</p>
            <p className="text-[20px] font-bold text-loss">{basket.maxDrawdown}</p>
            <p className="text-[12px] text-muted-foreground">1Y period</p>
          </div>
          <div className="w-px h-10 bg-border/40" />
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Min.</p>
            <p className="text-[20px] font-bold text-foreground">{basket.minInvestment}</p>
            <p className="text-[12px] text-muted-foreground">to invest</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40 mx-5 my-2" />

        {/* ============================================================ */}
        {/*  PERFORMANCE CHART                                            */}
        {/* ============================================================ */}
        <section className="mt-3">
          <div className="px-5 flex items-baseline justify-between mb-1">
            <div>
              <p className="text-[12px] text-muted-foreground">Performance · {chartPeriod}</p>
              <p className={cn("text-[24px] font-bold tabular-nums", isPositive ? "text-gain" : "text-loss")}>
                {isPositive ? "+" : ""}{periodReturn.toFixed(2)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-muted-foreground">Inception</p>
              <p className="text-[14px] font-semibold text-foreground">{basket.inception}</p>
            </div>
          </div>

          <div className="px-3">
            <MiniChart data={chartData} isPositive={isPositive} />
          </div>

          {/* Period pills */}
          <div className="flex gap-1 px-5 mt-2">
            {CHART_PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={cn(
                  "flex-1 h-[32px] rounded-lg text-[13px] font-medium transition-colors",
                  chartPeriod === p
                    ? "bg-foreground text-background"
                    : "text-muted-foreground active:bg-muted/50"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-2 bg-muted/50 my-5" />

        {/* ============================================================ */}
        {/*  BASKET DETAILS                                               */}
        {/* ============================================================ */}
        <section>
          <SectionTitle>Basket Details</SectionTitle>
          <div className="mx-5 rounded-2xl bg-card border border-border/40 divide-y divide-border/40">
            {[
              { label: "Strategy", value: basket.name },
              { label: "Risk Profile", value: riskLabels[basket.risk] },
              { label: "Holdings", value: `${basket.stockCount} stocks` },
              { label: "AUM", value: basket.aum },
              { label: "Inception", value: basket.inception },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between px-5 py-3">
                <span className="text-[14px] text-muted-foreground">{item.label}</span>
                <span className="text-[14px] font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-2 bg-muted/50 my-5" />

        {/* ============================================================ */}
        {/*  REBALANCE SCHEDULE                                           */}
        {/* ============================================================ */}
        <section>
          <SectionTitle>Rebalance Schedule</SectionTitle>
          <div className="mx-5 rounded-2xl bg-card border border-border/40 divide-y divide-border/40">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                <RefreshCw size={16} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-foreground">Frequency</p>
                <p className="text-[13px] text-muted-foreground">{basket.rebalance}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CalendarDays size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-foreground">Last Rebalance</p>
                <p className="text-[13px] text-muted-foreground">{basket.lastRebalance}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <Clock size={16} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-foreground">Next Rebalance</p>
                <p className="text-[13px] text-muted-foreground">{basket.nextRebalance}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-2 bg-muted/50 my-5" />

        {/* ============================================================ */}
        {/*  FEE STRUCTURE                                                */}
        {/* ============================================================ */}
        <section>
          <SectionTitle>Fee Structure</SectionTitle>
          <div className="mx-5 rounded-2xl bg-card border border-border/40 divide-y divide-border/40">
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <FileText size={15} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">Management Fee</p>
                  <p className="text-[12px] text-muted-foreground">Charged daily on portfolio value</p>
                </div>
              </div>
              <p className="text-[17px] font-bold text-foreground">0.6%<span className="text-[12px] font-normal text-muted-foreground">/yr</span></p>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <AlertTriangle size={15} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">Exit Load</p>
                  <p className="text-[12px] text-muted-foreground">Early withdrawal only</p>
                </div>
              </div>
              <p className="text-[17px] font-bold text-foreground">0.5%</p>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Shield size={15} className="text-emerald-400" />
              </div>
              <p className="text-[15px] font-semibold text-foreground">No Aspera charges</p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-2 bg-muted/50 my-5" />

        {/* ============================================================ */}
        {/*  HOLDINGS                                                     */}
        {/* ============================================================ */}
        <section>
          <div className="flex items-center justify-between px-5 mb-3">
            <h3 className="text-[18px] font-bold text-foreground">Holdings ({basket.holdings.length})</h3>
            <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
              <span>Price</span>
              <span>Weight</span>
            </div>
          </div>

          <div className="divide-y divide-border/30">
            {basket.holdings.map((h, i) => (
              <HoldingRow key={h.symbol} holding={h} index={i} />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-2 bg-muted/50 my-5" />

        {/* ============================================================ */}
        {/*  DOWNLOAD & DOCUMENTS                                         */}
        {/* ============================================================ */}
        <section className="px-5 mb-6">
          <SectionTitle>Documents</SectionTitle>
          <div className="space-y-2 mt-3">
            <button className="w-full flex items-center gap-3 rounded-xl bg-card border border-border/40 px-5 py-3.5 active:scale-[0.98] transition-transform">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                <Download size={16} className="text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px] font-semibold text-foreground">Basket Factsheet</p>
                <p className="text-[13px] text-muted-foreground">Full details, methodology & performance</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
            <button className="w-full flex items-center gap-3 rounded-xl bg-card border border-border/40 px-5 py-3.5 active:scale-[0.98] transition-transform">
              <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-violet-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px] font-semibold text-foreground">Risk Disclosure</p>
                <p className="text-[13px] text-muted-foreground">Important investor information</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          </div>
        </section>

        {/* Powered by footer */}
        <div className="text-center pb-8 px-5">
          <p className="text-[12px] text-muted-foreground">
            Advisory services by <span className="font-semibold text-foreground">Atom Privé Ltd</span> · DFSA Regulated
          </p>
        </div>
      </div>

      {/* Sticky bottom: Invest Now */}
      <div className="border-t border-border/40 bg-background px-5 py-3">
        <button className="w-full h-[50px] rounded-xl bg-foreground text-background font-semibold text-[16px] active:opacity-80 transition-opacity flex items-center justify-center gap-2">
          Invest Now
        </button>
      </div>

      <HomeIndicator />
    </div>
  );
}
