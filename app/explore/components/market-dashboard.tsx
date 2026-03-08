"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════
   SECTOR HEATMAP DATA
   ═══════════════════════════════════════════════════════════ */

const sectors = [
  { name: "Technology", weight: 32.4, change: "+0.8%", positive: true },
  { name: "Financials", weight: 13.2, change: "+0.5%", positive: true },
  { name: "Healthcare", weight: 12.1, change: "+0.3%", positive: true },
  { name: "Consumer Disc.", weight: 10.4, change: "-0.2%", positive: false },
  { name: "Comm. Services", weight: 8.8, change: "+1.1%", positive: true },
  { name: "Industrials", weight: 8.6, change: "+0.2%", positive: true },
  { name: "Consumer Staples", weight: 5.8, change: "-0.1%", positive: false },
  { name: "Energy", weight: 3.6, change: "-0.8%", positive: false },
  { name: "Utilities", weight: 2.5, change: "+0.1%", positive: true },
  { name: "Real Estate", weight: 2.3, change: "-0.4%", positive: false },
  { name: "Materials", weight: 2.1, change: "+0.3%", positive: true },
];

/* ═══════════════════════════════════════════════════════════
   TOP MOVERS DATA — RICH TABLE FORMAT
   ═══════════════════════════════════════════════════════════ */

type MoverRow = {
  symbol: string;
  price: number;
  changePct: number;
  sparkline: number[];
  pe: number;
  revGrowth: number;
  profitGrowth: number;
  high1Y: number;
  low1Y: number;
  rating: "Buy" | "Sell" | "Hold";
};

const gainers: MoverRow[] = [
  { symbol: "SMCI", price: 892.4, changePct: 8.4, sparkline: [320, 380, 360, 420, 510, 580, 620, 700, 760, 830, 892], pe: 62, revGrowth: 110.2, profitGrowth: 88.4, high1Y: 1229.0, low1Y: 229.0, rating: "Buy" },
  { symbol: "PLTR", price: 24.8, changePct: 5.6, sparkline: [15, 14, 16, 18, 17, 19, 21, 20, 22, 23, 25], pe: 240, revGrowth: 17.7, profitGrowth: 32.1, high1Y: 27.5, low1Y: 13.7, rating: "Buy" },
  { symbol: "NVDA", price: 891.0, changePct: 3.2, sparkline: [280, 340, 420, 500, 480, 560, 680, 720, 800, 860, 891], pe: 68, revGrowth: 122.4, profitGrowth: 581.3, high1Y: 974.0, low1Y: 262.4, rating: "Buy" },
  { symbol: "META", price: 502.3, changePct: 2.8, sparkline: [240, 280, 310, 350, 380, 400, 420, 460, 480, 495, 502], pe: 34, revGrowth: 24.7, profitGrowth: 69.3, high1Y: 531.5, low1Y: 225.4, rating: "Buy" },
  { symbol: "AVGO", price: 1362.5, changePct: 2.4, sparkline: [620, 680, 740, 820, 900, 980, 1050, 1140, 1240, 1310, 1362], pe: 38, revGrowth: 34.2, profitGrowth: 47.8, high1Y: 1438.0, low1Y: 596.0, rating: "Buy" },
];

const losers: MoverRow[] = [
  { symbol: "PFE", price: 26.2, changePct: -4.1, sparkline: [42, 38, 35, 33, 30, 28, 27, 26, 25, 26, 26], pe: 48, revGrowth: -41.8, profitGrowth: -93.2, high1Y: 43.4, low1Y: 24.5, rating: "Hold" },
  { symbol: "BA", price: 178.4, changePct: -3.2, sparkline: [220, 210, 195, 200, 185, 180, 175, 170, 178, 180, 178], pe: 0, revGrowth: -3.4, profitGrowth: -120.5, high1Y: 267.5, low1Y: 159.7, rating: "Hold" },
  { symbol: "TSLA", price: 178.5, changePct: -2.1, sparkline: [260, 240, 200, 180, 170, 160, 175, 190, 185, 180, 178], pe: 46, revGrowth: 8.5, profitGrowth: -23.1, high1Y: 299.3, low1Y: 138.8, rating: "Sell" },
  { symbol: "MRNA", price: 94.6, changePct: -1.9, sparkline: [180, 160, 140, 130, 120, 110, 100, 95, 92, 93, 95], pe: 0, revGrowth: -64.2, profitGrowth: -142.0, high1Y: 170.5, low1Y: 79.8, rating: "Hold" },
  { symbol: "NKE", price: 92.4, changePct: -1.6, sparkline: [125, 118, 110, 108, 100, 96, 94, 92, 90, 91, 92], pe: 28, revGrowth: -1.7, profitGrowth: -5.4, high1Y: 128.7, low1Y: 88.9, rating: "Hold" },
];

const midcap: MoverRow[] = [
  { symbol: "CRWD", price: 312.8, changePct: 4.2, sparkline: [140, 160, 180, 200, 230, 250, 270, 285, 295, 305, 313], pe: 720, revGrowth: 36.4, profitGrowth: 120.5, high1Y: 365.0, low1Y: 135.0, rating: "Buy" },
  { symbol: "DDOG", price: 124.6, changePct: 3.1, sparkline: [80, 85, 90, 95, 100, 108, 112, 118, 120, 122, 125], pe: 320, revGrowth: 26.8, profitGrowth: 45.2, high1Y: 135.5, low1Y: 75.0, rating: "Buy" },
  { symbol: "ZS", price: 218.4, changePct: 2.7, sparkline: [145, 155, 160, 170, 180, 190, 195, 200, 210, 215, 218], pe: 520, revGrowth: 34.8, profitGrowth: 88.1, high1Y: 259.6, low1Y: 140.0, rating: "Buy" },
  { symbol: "SNAP", price: 11.2, changePct: -3.8, sparkline: [15, 14, 13, 12, 11, 10, 10, 11, 11, 11, 11], pe: 0, revGrowth: 5.1, profitGrowth: -12.4, high1Y: 17.9, low1Y: 8.3, rating: "Hold" },
  { symbol: "ROKU", price: 62.4, changePct: -2.5, sparkline: [90, 85, 80, 75, 70, 68, 65, 63, 62, 62, 62], pe: 0, revGrowth: 14.2, profitGrowth: -35.6, high1Y: 106.8, low1Y: 51.2, rating: "Hold" },
];

const mostActive: MoverRow[] = [
  { symbol: "NVDA", price: 891.0, changePct: 3.2, sparkline: [280, 340, 420, 500, 480, 560, 680, 720, 800, 860, 891], pe: 68, revGrowth: 122.4, profitGrowth: 581.3, high1Y: 974.0, low1Y: 262.4, rating: "Buy" },
  { symbol: "TSLA", price: 178.5, changePct: -2.1, sparkline: [260, 240, 200, 180, 170, 160, 175, 190, 185, 180, 178], pe: 46, revGrowth: 8.5, profitGrowth: -23.1, high1Y: 299.3, low1Y: 138.8, rating: "Sell" },
  { symbol: "AAPL", price: 224.3, changePct: 0.6, sparkline: [165, 170, 175, 180, 190, 195, 200, 210, 218, 222, 224], pe: 29, revGrowth: 2.1, profitGrowth: 10.7, high1Y: 237.5, low1Y: 164.1, rating: "Buy" },
  { symbol: "AMD", price: 162.8, changePct: 1.4, sparkline: [100, 110, 120, 130, 140, 145, 150, 155, 158, 160, 163], pe: 48, revGrowth: 10.2, profitGrowth: 353.4, high1Y: 227.3, low1Y: 93.1, rating: "Buy" },
  { symbol: "AMZN", price: 186.4, changePct: 1.1, sparkline: [105, 115, 125, 140, 150, 160, 170, 175, 180, 184, 186], pe: 58, revGrowth: 12.5, profitGrowth: 229.1, high1Y: 201.2, low1Y: 101.2, rating: "Buy" },
];

type MoverTab = "gainers" | "losers" | "midcap" | "active";

const moverTabs: { id: MoverTab; label: string }[] = [
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "midcap", label: "Midcap" },
  { id: "active", label: "Most Active" },
];

const moverDataMap: Record<MoverTab, MoverRow[]> = {
  gainers,
  losers,
  midcap,
  active: mostActive,
};

/* ── Sparkline SVG ── */
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "var(--gain)" : "var(--loss)"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Rating Badge ── */
function RatingBadge({ rating }: { rating: "Buy" | "Sell" | "Hold" }) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
        rating === "Buy" && "bg-gain/15 text-gain",
        rating === "Sell" && "bg-loss/15 text-loss",
        rating === "Hold" && "bg-muted text-muted-foreground"
      )}
    >
      {rating}
    </span>
  );
}

/* ── Rating Gauge ── */
function RatingGauge({ rating }: { rating: "Buy" | "Sell" | "Hold" }) {
  const position = rating === "Sell" ? 15 : rating === "Hold" ? 50 : 85;

  return (
    <div className="w-[56px] flex-shrink-0">
      <div className="relative h-[6px] rounded-full overflow-hidden flex">
        <div className="flex-1 bg-loss/30" />
        <div className="flex-1 bg-muted" />
        <div className="flex-1 bg-gain/30" />
      </div>
      <div className="relative h-2 mt-0.5">
        <div
          className={cn(
            "absolute top-0 w-2 h-2 rounded-full -translate-x-1/2",
            rating === "Buy" && "bg-gain",
            rating === "Sell" && "bg-loss",
            rating === "Hold" && "bg-muted-foreground"
          )}
          style={{ left: `${position}%` }}
        />
      </div>
    </div>
  );
}

/* ── Scroll Hint Indicator ── */
function ScrollHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex items-center justify-end gap-1.5 mb-2 animate-pulse">
      <span className="text-[11px] text-muted-foreground">Scroll</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="text-muted-foreground"
      >
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANALYST DATA
   ═══════════════════════════════════════════════════════════ */

const analystData = [
  { stock: "NVDA", analyst: "Morgan Stanley", rating: "Strong Buy", target: "$1,000", change: "\u2191 from $880" },
  { stock: "AMZN", analyst: "Barclays", rating: "Outperform", target: "$220", change: "\u2191 from $200" },
  { stock: "AAPL", analyst: "JP Morgan", rating: "Overweight", target: "$250", change: "\u2014" },
  { stock: "GOOG", analyst: "BofA", rating: "Buy", target: "$200", change: "\u2191 from $185" },
  { stock: "PFE", analyst: "Goldman Sachs", rating: "Hold", target: "$28", change: "\u2193 from $32" },
];

/* ═══════════════════════════════════════════════════════════
   TRENDING COLLECTIONS DATA
   ═══════════════════════════════════════════════════════════ */

const collections = [
  { name: "AI & Machine Learning", stocks: "NVDA, MSFT, GOOG, PLTR, SNOW", return1m: "+6.2%", positive: true },
  { name: "Electric Vehicles", stocks: "TSLA, RIVN, LI, NIO, LCID", return1m: "-1.4%", positive: false },
  { name: "Healthcare Innovation", stocks: "LLY, UNH, ABBV, JNJ, MRK", return1m: "+2.8%", positive: true },
  { name: "Dividend Kings", stocks: "JNJ, KO, PG, PEP, MMM", return1m: "+1.2%", positive: true },
  { name: "Infrastructure Boom", stocks: "CAT, DE, VMC, MLM, URI", return1m: "+3.4%", positive: true },
  { name: "Magnificent 7", stocks: "AAPL, MSFT, GOOG, AMZN, NVDA, META, TSLA", return1m: "+4.8%", positive: true },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   TOP MOVERS WIDGET
   ═══════════════════════════════════════════════════════════ */

function TopMoversWidget() {
  const [activeTab, setActiveTab] = useState<MoverTab>("gainers");
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = moverDataMap[activeTab];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-sm text-muted-foreground mb-3">Top Movers Today</p>

      {/* Tab Switcher */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        {moverTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "bg-foreground text-background"
                : "bg-muted/50 text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scroll Hint */}
      <ScrollHint />

      {/* Scrollable Table — Symbol is sticky, Price + Chg% visible in default view */}
      <div ref={scrollRef} className="overflow-x-auto no-scrollbar -mx-4">
        <table className="text-sm border-collapse" style={{ minWidth: 940 }}>
          <colgroup>
            {/* Symbol: sticky */}
            <col style={{ width: 72 }} />
            {/* Price */}
            <col style={{ width: 90 }} />
            {/* Chg% */}
            <col style={{ width: 76 }} />
            {/* 1Y Chart */}
            <col style={{ width: 100 }} />
            {/* PE */}
            <col style={{ width: 60 }} />
            {/* Rev Growth */}
            <col style={{ width: 96 }} />
            {/* Profit Growth */}
            <col style={{ width: 104 }} />
            {/* 1Y High */}
            <col style={{ width: 86 }} />
            {/* 1Y Low */}
            <col style={{ width: 82 }} />
            {/* Rating badge */}
            <col style={{ width: 72 }} />
            {/* Signal gauge */}
            <col style={{ width: 72 }} />
          </colgroup>
          <thead>
            <tr className="text-muted-foreground text-[11px] uppercase tracking-wider">
              <th className="text-left py-2 pl-4 pr-2 font-medium sticky left-0 bg-card z-10">Symbol</th>
              <th className="text-right py-2 px-2 font-medium">Price</th>
              <th className="text-right py-2 px-2 font-medium">Chg%</th>
              <th className="text-center py-2 px-2 font-medium">1Y Chart</th>
              <th className="text-right py-2 px-2 font-medium">PE</th>
              <th className="text-right py-2 px-2 font-medium">Rev Gr.</th>
              <th className="text-right py-2 px-2 font-medium">Profit Gr.</th>
              <th className="text-right py-2 px-2 font-medium">1Y High</th>
              <th className="text-right py-2 px-2 font-medium">1Y Low</th>
              <th className="text-center py-2 px-2 font-medium">Rating</th>
              <th className="text-center py-2 pr-4 pl-2 font-medium">Signal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const positive = row.changePct >= 0;
              return (
                <tr key={row.symbol} className="border-t border-border">
                  <td className="py-4 pl-4 pr-2 font-bold text-foreground sticky left-0 bg-card z-10">
                    {row.symbol}
                  </td>
                  <td className="py-4 px-2 text-right tabular-nums text-foreground">
                    ${row.price.toFixed(1)}
                  </td>
                  <td
                    className={cn(
                      "py-4 px-2 text-right tabular-nums font-medium",
                      positive ? "text-gain" : "text-loss"
                    )}
                  >
                    {positive ? "+" : ""}{row.changePct.toFixed(1)}%
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex justify-center">
                      <Sparkline data={row.sparkline} positive={positive} />
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right tabular-nums text-foreground">
                    {row.pe > 0 ? Math.round(row.pe) : "—"}
                  </td>
                  <td
                    className={cn(
                      "py-4 px-2 text-right tabular-nums font-medium",
                      row.revGrowth >= 0 ? "text-gain" : "text-loss"
                    )}
                  >
                    {row.revGrowth >= 0 ? "+" : ""}{row.revGrowth.toFixed(1)}%
                  </td>
                  <td
                    className={cn(
                      "py-4 px-2 text-right tabular-nums font-medium",
                      row.profitGrowth >= 0 ? "text-gain" : "text-loss"
                    )}
                  >
                    {row.profitGrowth >= 0 ? "+" : ""}{row.profitGrowth.toFixed(1)}%
                  </td>
                  <td className="py-4 px-2 text-right tabular-nums text-foreground">
                    ${row.high1Y.toFixed(1)}
                  </td>
                  <td className="py-4 px-2 text-right tabular-nums text-foreground">
                    ${row.low1Y.toFixed(1)}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex justify-center">
                      <RatingBadge rating={row.rating} />
                    </div>
                  </td>
                  <td className="py-4 pr-4 pl-2">
                    <div className="flex justify-center">
                      <RatingGauge rating={row.rating} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MarketDashboard() {
  return (
    <section className="bg-background py-12">
      <div className="px-4">
        {/* ──── Header ──── */}
        <h2 className="text-2xl font-bold text-foreground">
          Your Market Dashboard &mdash; Live
        </h2>
        <p className="text-muted-foreground text-sm mt-2">
          This isn&apos;t a brochure. This is your market. Right now.
        </p>

        {/* ──── Widget Grid ──── */}
        <div className="space-y-4 mt-6">
          {/* ════════════════════════════════════════════════
              WIDGET 1 — Sector Heatmap
              ════════════════════════════════════════════════ */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-3">Sector Heatmap</p>
            <div className="flex flex-wrap gap-1.5">
              {sectors.map((s) => (
                <div
                  key={s.name}
                  style={{
                    width: `${Math.max(s.weight * 2.8, 60)}px`,
                    minHeight: `${Math.max(s.weight * 2, 50)}px`,
                  }}
                  className={cn(
                    "rounded-lg p-2 flex flex-col justify-between",
                    s.positive ? "bg-gain/10" : "bg-loss/10"
                  )}
                >
                  <span className="text-xs text-foreground font-medium truncate">
                    {s.name}
                  </span>
                  <div>
                    <span className="text-xs text-muted-foreground">{s.weight}%</span>
                    <span
                      className={cn(
                        "text-xs ml-1",
                        s.positive ? "text-gain" : "text-loss"
                      )}
                    >
                      {s.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              WIDGET 2 — Top Movers Today
              ════════════════════════════════════════════════ */}
          <TopMoversWidget />

          {/* ════════════════════════════════════════════════
              WIDGET 3 — Analyst Spotlight
              ════════════════════════════════════════════════ */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase mb-3">
              What Wall Street is saying today
            </p>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs uppercase">
                    <th className="text-left py-2 pr-3 font-medium">Stock</th>
                    <th className="text-left py-2 pr-3 font-medium">Rating</th>
                    <th className="text-right py-2 pr-3 font-medium">Target</th>
                    <th className="text-right py-2 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {analystData.map((row) => (
                    <tr key={row.stock} className="border-t border-border">
                      <td className="py-2.5 pr-3 font-bold text-foreground">
                        {row.stock}
                      </td>
                      <td
                        className={cn(
                          "py-2.5 pr-3 font-medium",
                          row.rating === "Hold"
                            ? "text-foreground"
                            : "text-gain"
                        )}
                      >
                        {row.rating}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-foreground">
                        {row.target}
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground text-xs">
                        {row.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-xs mt-3">
              Analyst ratings are informational, not investment advice. See full
              ratings in-app.
            </p>
          </div>

          {/* ════════════════════════════════════════════════
              WIDGET 4 — Trending Collections
              ════════════════════════════════════════════════ */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-3">
              Trending Collections
            </p>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {collections.map((c) => (
                <div
                  key={c.name}
                  className="min-w-[180px] border border-border rounded-xl p-3 flex-shrink-0"
                >
                  <p className="text-sm font-bold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.stocks}</p>
                  <p
                    className={cn(
                      "tabular-nums text-lg font-bold mt-2",
                      c.positive ? "text-gain" : "text-loss"
                    )}
                  >
                    {c.return1m}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs mt-3">
              Each collection is an in-app watchlist. Tap to explore, or invest in
              the theme via advisory baskets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
