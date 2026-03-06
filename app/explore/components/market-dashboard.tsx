"use client";

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
   TOP MOVERS DATA
   ═══════════════════════════════════════════════════════════ */

const gainers = [
  { symbol: "SMCI", price: "$892.40", change: "+8.4%" },
  { symbol: "PLTR", price: "$24.80", change: "+5.6%" },
  { symbol: "NVDA", price: "$891.04", change: "+3.2%" },
];

const losers = [
  { symbol: "PFE", price: "$26.20", change: "-4.1%" },
  { symbol: "BA", price: "$178.40", change: "-3.2%" },
  { symbol: "TSLA", price: "$178.50", change: "-2.1%" },
];

const mostActive = [
  { symbol: "NVDA", volume: "48.2M", price: "$891.04" },
  { symbol: "TSLA", volume: "32.6M", price: "$178.50" },
  { symbol: "AAPL", volume: "28.4M", price: "$224.32" },
];

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
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-3">Top Movers Today</p>
            <div className="space-y-4">
              {/* Gainers */}
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-2">
                  Gainers
                </p>
                <div className="space-y-2">
                  {gainers.map((g) => (
                    <div key={g.symbol} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">
                        {g.symbol}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">
                          {g.price}
                        </span>
                        <span className="font-mono text-sm text-gain">
                          {g.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Losers */}
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-2">
                  Losers
                </p>
                <div className="space-y-2">
                  {losers.map((l) => (
                    <div key={l.symbol} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">
                        {l.symbol}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">
                          {l.price}
                        </span>
                        <span className="font-mono text-sm text-loss">
                          {l.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Active */}
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-2">
                  Most Active
                </p>
                <div className="space-y-2">
                  {mostActive.map((m) => (
                    <div key={m.symbol} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">
                        {m.symbol}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {m.volume}
                        </span>
                        <span className="font-mono text-sm text-foreground">
                          {m.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

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
                      <td className="py-2.5 pr-3 text-right font-mono text-foreground">
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
                      "font-mono text-lg font-bold mt-2",
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
