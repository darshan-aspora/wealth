"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CollectionStock {
  name: string;
  ticker: string;
  invested: number;
  current: number;
}

interface Collection {
  id: number;
  name: string;
  theme: string;
  sip?: { amount: number; frequency: string };
  invested: number;
  current: number;
  stocks: CollectionStock[];
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const COLLECTIONS: Collection[] = [
  {
    id: 1,
    name: "Tech Giants",
    theme: "Large-cap US technology leaders driving global innovation. Concentrated in the companies setting the pace for AI, cloud, and consumer hardware.",
    sip: { amount: 150, frequency: "Monthly on 12th" },
    invested: 16_240,
    current: 18_420,
    stocks: [
      { name: "Apple Inc.",      ticker: "AAPL", invested: 4_800, current: 5_620 },
      { name: "Microsoft Corp.", ticker: "MSFT", invested: 4_200, current: 4_910 },
      { name: "Nvidia Corp.",    ticker: "NVDA", invested: 3_800, current: 4_980 },
      { name: "Alphabet Inc.",   ticker: "GOOGL",invested: 2_240, current: 2_310 },
      { name: "Meta Platforms",  ticker: "META", invested: 1_200, current:   600 },
    ],
  },
  {
    id: 2,
    name: "Dividend Kings",
    theme: "Consistent dividend payers with decades of uninterrupted payouts and strong balance sheets. Built for income and stability.",
    sip: { amount: 100, frequency: "Monthly on 12th" },
    invested: 11_310,
    current: 12_850,
    stocks: [
      { name: "Johnson & Johnson", ticker: "JNJ", invested: 2_500, current: 2_720 },
      { name: "Procter & Gamble",  ticker: "PG",  invested: 2_100, current: 2_380 },
      { name: "Coca-Cola Co.",     ticker: "KO",  invested: 1_900, current: 2_050 },
      { name: "Realty Income",     ticker: "O",   invested: 1_600, current: 1_870 },
      { name: "JPMorgan Chase",    ticker: "JPM", invested: 1_800, current: 2_200 },
      { name: "Verizon Comms.",    ticker: "VZ",  invested:   910, current:   930 },
      { name: "3M Company",        ticker: "MMM", invested:   500, current:   700 },
    ],
  },
  {
    id: 3,
    name: "High Growth",
    theme: "Emerging disruptors with high upside and higher volatility. Best suited for long horizons and investors comfortable with drawdowns.",
    invested:  9_581,
    current:   8_960,
    stocks: [
      { name: "Tesla, Inc.",    ticker: "TSLA", invested: 3_200, current: 2_940 },
      { name: "Palantir Tech.", ticker: "PLTR", invested: 2_800, current: 2_700 },
      { name: "CrowdStrike",    ticker: "CRWD", invested: 2_081, current: 1_920 },
      { name: "Snowflake Inc.", ticker: "SNOW", invested: 1_500, current: 1_400 },
    ],
  },
  {
    id: 4,
    name: "Stable Compounders",
    theme: "Quality businesses with durable moats compounding steadily over the long term. Low drama, high conviction.",
    sip: { amount: 50, frequency: "Monthly on 12th" },
    invested:  5_730,
    current:   6_210,
    stocks: [
      { name: "Visa Inc.",     ticker: "V",    invested: 2_100, current: 2_380 },
      { name: "Mastercard",    ticker: "MA",   invested: 1_800, current: 1_960 },
      { name: "S&P Global",    ticker: "SPGI", invested: 1_030, current: 1_100 },
      { name: "Moody's Corp.", ticker: "MCO",  invested:   800, current:   770 },
    ],
  },
  {
    id: 5,
    name: "Global ETF Mix",
    theme: "Broad international exposure through diversified ETFs spanning the US, developed markets, and emerging economies.",
    invested:  4_270,
    current:   4_581,
    stocks: [
      { name: "Invesco QQQ Trust",  ticker: "QQQ",  invested: 1_800, current: 1_980 },
      { name: "iShares MSCI ACWI",  ticker: "ACWI", invested: 1_470, current: 1_601 },
      { name: "Vanguard S&P 500",   ticker: "VOO",  invested: 1_000, current: 1_000 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function gainStr(g: number, pctVal: number) {
  return `${g >= 0 ? "+" : "−"}$${fmt(Math.abs(g))} (${g >= 0 ? "+" : ""}${pctVal.toFixed(1)}%)`;
}

/* ------------------------------------------------------------------ */
/*  Collection card                                                    */
/* ------------------------------------------------------------------ */

function CollectionCard({ col, index }: { col: Collection; index: number }) {
  const [open, setOpen] = useState(false);
  const gain    = col.current - col.invested;
  const gainPct = (gain / col.invested) * 100;
  const isUp    = gain >= 0;

  return (
    <div className="rounded-2xl border border-border/50 bg-white overflow-hidden">

      {/* Collapsed row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 pt-5 pb-5 active:opacity-70 transition-opacity"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-foreground" style={{ opacity: 0.15 + index * 0.17 }} />
              <p className="text-[16px] font-bold text-foreground leading-tight">{col.name}</p>
            </div>
            <p className="text-[13px] text-muted-foreground">
              {col.stocks.length} holdings
              {col.sip ? ` · $${col.sip.amount}/mo SIP` : " · One-time"}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[18px] font-bold text-foreground tabular-nums">${fmt(col.current)}</p>
            <div className={cn("flex items-center justify-end gap-0.5 mt-0.5", isUp ? "text-emerald-500" : "text-red-500")}>
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span className="text-[12px] tabular-nums">{gainStr(gain, gainPct)}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-border/40">
          <div className="px-5 pt-4 pb-4 space-y-5">

            {/* Blurb */}
            <p className="text-[13px] text-muted-foreground leading-relaxed">{col.theme}</p>

            {/* Invested + SIP details */}
            <div className="flex items-stretch gap-3">
              <div className="flex-1 rounded-xl bg-muted/50 px-4 py-3">
                <p className="text-[11px] text-muted-foreground mb-1">Invested</p>
                <p className="text-[15px] font-semibold text-foreground tabular-nums">${fmt(col.invested)}</p>
              </div>
              {col.sip ? (
                <div className="flex-1 rounded-xl bg-muted/50 px-4 py-3">
                  <p className="text-[11px] text-muted-foreground mb-1">SIP</p>
                  <p className="text-[15px] font-semibold text-foreground">${col.sip.amount}/mo</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{col.sip.frequency}</p>
                </div>
              ) : (
                <div className="flex-1 rounded-xl bg-muted/50 px-4 py-3">
                  <p className="text-[11px] text-muted-foreground mb-1">Investment type</p>
                  <p className="text-[15px] font-semibold text-foreground">One-time</p>
                </div>
              )}
            </div>

            {/* Holdings */}
            <div className="space-y-3">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Holdings</p>
              {col.stocks.map((s) => {
                return (
                  <div key={s.ticker} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold bg-muted text-foreground shrink-0">
                        {s.ticker.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] text-foreground truncate">{s.name}</p>
                        <p className="text-[12px] text-muted-foreground">{s.ticker}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-medium text-foreground tabular-nums">${fmt(s.current)}</p>
                      <p className="text-[12px] text-muted-foreground tabular-nums">Invested ${fmt(s.invested)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border/40 flex divide-x divide-border/40">
            <button className="flex-1 flex items-center justify-center py-4 text-[14px] text-foreground active:bg-muted/30 transition-colors">
              Invest more
            </button>
            {col.sip ? (
              <button className="flex-1 flex items-center justify-center py-4 text-[14px] text-foreground active:bg-muted/30 transition-colors">
                Edit SIP
              </button>
            ) : (
              <button className="flex-1 flex items-center justify-center py-4 text-[14px] text-foreground active:bg-muted/30 transition-colors">
                Set up SIP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main tab                                                           */
/* ------------------------------------------------------------------ */

const PREVIEW_CARDS = [
  { name: "Tech Giants",    tickers: ["AAPL", "NVDA", "MSFT", "GOOGL"], rotate: -10, zIndex: 0 },
  { name: "Dividend Kings", tickers: ["JNJ",  "KO",   "PG",   "JPM"],   rotate:   0, zIndex: 2 },
  { name: "High Growth",    tickers: ["TSLA", "PLTR", "CRWD", "SNOW"],  rotate:  10, zIndex: 0 },
];

export function CollectionsTab({ empty }: { empty?: boolean }) {
  const router = useRouter();

  if (empty) {
    return (
      <div className="pb-24 px-5 pt-8">
        {/* Fanned card deck — horizontal spread */}
        <div className="relative flex justify-center mb-10" style={{ height: 180 }}>
          <div className="relative" style={{ width: 310 }}>
          {PREVIEW_CARDS.map((card, i) => (
            <motion.div
              key={card.name}
              className="absolute bg-white rounded-3xl px-5 py-5 border border-border/40"
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: card.rotate }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 190,
                left: i * 60,
                top: 0,
                transformOrigin: "bottom center",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                zIndex: card.zIndex,
              }}
            >
              <p className="text-[15px] font-bold text-foreground mb-3">{card.name}</p>
              <div className="flex gap-1.5 flex-wrap">
                {card.tickers.map((t) => (
                  <span key={t} className="rounded-lg bg-muted px-2.5 py-1 text-[12px] font-semibold text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
          </div>
        </div>

        <p className="text-[22px] font-bold text-foreground mb-1">No collections yet</p>
        <p className="text-[14px] text-muted-foreground mb-6">
          Curated baskets of stocks and ETFs built around themes — invest in all of them with a single SIP.
        </p>
        <button
          onClick={() => router.push("/home-v3")}
          className="w-full rounded-2xl bg-foreground py-4 text-[15px] font-bold text-background active:opacity-75 transition-opacity"
        >
          Explore Collections
        </button>
      </div>
    );
  }

  const totalInvested = COLLECTIONS.reduce((s, c) => s + c.invested, 0);
  const totalCurrent  = COLLECTIONS.reduce((s, c) => s + c.current, 0);
  const totalGain     = totalCurrent - totalInvested;
  const totalGainPct  = (totalGain / totalInvested) * 100;

  return (
    <div className="pb-24">

      {/* ── Summary card ── */}
      <div className="mx-5 mb-5 rounded-2xl border border-border/50 bg-white px-5 py-5">

        {/* Row 1: current value | profit */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] text-muted-foreground mb-1">Current value</p>
            <p className="text-[28px] font-bold text-foreground tabular-nums leading-none">${fmt(totalCurrent)}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-muted-foreground mb-1">Total profit</p>
            <p className={cn("text-[28px] font-bold tabular-nums leading-none", totalGain >= 0 ? "text-emerald-500" : "text-red-500")}>
              {totalGain >= 0 ? "+" : "−"}${fmt(Math.abs(totalGain))}
            </p>
            <p className={cn("text-[13px] tabular-nums mt-0.5", totalGain >= 0 ? "text-emerald-500" : "text-red-500")}>
              {totalGain >= 0 ? "+" : ""}{totalGainPct.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40 my-4" />

        {/* Row 2: invested | collections count */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-muted-foreground mb-0.5">Total invested</p>
            <p className="text-[15px] font-semibold text-foreground tabular-nums">${fmt(totalInvested)}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-muted-foreground mb-0.5">Collections</p>
            <p className="text-[15px] font-semibold text-foreground">{COLLECTIONS.length}</p>
          </div>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="px-5 mb-2">
        <p className="text-[16px] text-foreground">Your Collections ({COLLECTIONS.length})</p>
      </div>
      <div className="mx-5 flex flex-col gap-3">
        {COLLECTIONS.map((c, i) => (
          <CollectionCard key={c.id} col={c} index={i} />
        ))}
      </div>

    </div>
  );
}
