"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, ChevronRight, X, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

// ─── Mock Data ──────────────────────────────────────────────────────────────

interface ETF {
  symbol: string;
  name: string;
  price: number;
  change1d: number;
  return3y: number;
  return1y: number;
  return5y: number;
  aum: string;
  expenseRatio: number;
  trackingError: number;
  high52w: number;
  low52w: number;
}

const etfs: ETF[] = [
  { symbol: "VOO", name: "Vanguard S&P 500", price: 438.92, change1d: 0.78, return3y: 10.8, return1y: 24.8, return5y: 14.2, aum: "892B", expenseRatio: 0.03, trackingError: 0.01, high52w: 445.0, low52w: 362.5 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: 389.45, change1d: -1.24, return3y: 8.6, return1y: 28.3, return5y: 18.7, aum: "245B", expenseRatio: 0.20, trackingError: 0.04, high52w: 405.0, low52w: 310.2 },
  { symbol: "VTI", name: "Vanguard Total Market", price: 242.18, change1d: 0.42, return3y: 9.2, return1y: 22.1, return5y: 13.8, aum: "382B", expenseRatio: 0.03, trackingError: 0.02, high52w: 248.0, low52w: 198.5 },
  { symbol: "IVV", name: "iShares Core S&P 500", price: 441.30, change1d: 0.65, return3y: 10.7, return1y: 24.6, return5y: 14.1, aum: "458B", expenseRatio: 0.03, trackingError: 0.01, high52w: 448.0, low52w: 365.0 },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 436.58, change1d: -0.32, return3y: 10.5, return1y: 24.2, return5y: 13.9, aum: "510B", expenseRatio: 0.09, trackingError: 0.02, high52w: 443.0, low52w: 360.0 },
  { symbol: "VUG", name: "Vanguard Growth ETF", price: 318.74, change1d: 1.56, return3y: 11.4, return1y: 32.1, return5y: 19.2, aum: "118B", expenseRatio: 0.04, trackingError: 0.03, high52w: 325.0, low52w: 252.0 },
];

function getGainersLosers(mode: "gainers" | "losers") {
  const sorted = [...etfs].sort((a, b) =>
    mode === "gainers" ? b.change1d - a.change1d : a.change1d - b.change1d
  );
  return sorted;
}

// ─── Shared Helpers ─────────────────────────────────────────────────────────

function ChangeText({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span className={cn("text-[14px] font-semibold tabular-nums", isPositive ? "text-emerald-500" : "text-red-500")}>
      {isPositive ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
}

function ReturnBadge({ label, value }: { label: string; value: number }) {
  const isPositive = value >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[12px] font-medium tabular-nums",
      isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
    )}>
      {label} {isPositive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const pct = Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <span className="text-[12px] text-muted-foreground tabular-nums">{low.toFixed(0)}</span>
      <div className="relative flex-1 flex items-center">
        <div className="h-[3px] w-full rounded-full bg-muted" />
        <div
          className="absolute h-[12px] w-[2px] rounded-full bg-foreground"
          style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
        />
      </div>
      <span className="text-[12px] text-muted-foreground tabular-nums">{high.toFixed(0)}</span>
    </div>
  );
}

function WatchlistBtn() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
      className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <Bookmark size={16} className={cn(saved ? "fill-foreground text-foreground" : "text-muted-foreground")} />
    </button>
  );
}

function GainersLosersToggle({ mode, setMode }: { mode: "gainers" | "losers"; setMode: (m: "gainers" | "losers") => void }) {
  return (
    <div className="flex gap-1 bg-muted/40 rounded-lg p-0.5 mb-4">
      {(["gainers", "losers"] as const).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={cn(
            "flex-1 rounded-md py-1.5 text-[13px] font-medium transition-all capitalize",
            mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

// ─── V1: Frozen-6 Table ─────────────────────────────────────────────────────

function V1FrozenTable() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const data = getGainersLosers(mode);

  return (
    <div>
      <GainersLosersToggle mode={mode} setMode={setMode} />
      <div className="border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex bg-muted/30 border-b">
          <div className="flex-shrink-0 w-[220px] px-3 py-2.5 border-r border-border/50">
            <span className="text-[12px] font-medium text-muted-foreground">ETF Details</span>
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-[400px]">
              {["1Y Return", "5Y Return", "52W Range", "Track Err", ""].map((h, i) => (
                <div key={i} className={cn("px-3 py-2.5 text-[12px] font-medium text-muted-foreground", i < 4 ? "w-[90px]" : "w-[50px]")}>
                  {h}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rows */}
        {data.map((etf) => (
          <div key={etf.symbol} className="flex border-b last:border-b-0 hover:bg-muted/20 transition-colors">
            {/* Frozen left */}
            <div className="flex-shrink-0 w-[220px] px-3 py-3 border-r border-border/50">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold">
                  {etf.symbol.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold truncate">{etf.symbol}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{etf.name}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] tabular-nums">
                <span className="font-medium">{etf.price.toFixed(2)}</span>
                <span className={etf.change1d >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {etf.change1d >= 0 ? "+" : ""}{etf.change1d.toFixed(2)}%
                </span>
                <span className="text-muted-foreground">3Y <span className={etf.return3y >= 0 ? "text-emerald-500" : "text-red-500"}>{etf.return3y >= 0 ? "+" : ""}{etf.return3y}%</span></span>
                <span className="text-muted-foreground">AUM {etf.aum}</span>
                <span className="text-muted-foreground">Exp {etf.expenseRatio}%</span>
              </div>
            </div>
            {/* Scrollable right */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex items-center min-w-[400px] h-full">
                <div className="w-[90px] px-3">
                  <span className={cn("text-[13px] font-medium tabular-nums", etf.return1y >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {etf.return1y >= 0 ? "+" : ""}{etf.return1y}%
                  </span>
                </div>
                <div className="w-[90px] px-3">
                  <span className={cn("text-[13px] font-medium tabular-nums", etf.return5y >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {etf.return5y >= 0 ? "+" : ""}{etf.return5y}%
                  </span>
                </div>
                <div className="w-[90px] px-3">
                  <RangeBar low={etf.low52w} high={etf.high52w} current={etf.price} />
                </div>
                <div className="w-[90px] px-3">
                  <span className="text-[13px] text-muted-foreground tabular-nums">{etf.trackingError}%</span>
                </div>
                <div className="w-[50px] px-3 flex justify-center">
                  <WatchlistBtn />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── V2: Two-Tier Row ───────────────────────────────────────────────────────

function V2TwoTierRow() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const data = getGainersLosers(mode);

  return (
    <div>
      <GainersLosersToggle mode={mode} setMode={setMode} />
      <div className="space-y-0">
        {data.map((etf) => (
          <div key={etf.symbol} className="border-b border-border/50 last:border-b-0">
            <div className="overflow-x-auto">
              <div className="min-w-[500px] px-3 py-3">
                {/* Line 1 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[12px] font-bold">
                      {etf.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold">{etf.symbol}</p>
                      <p className="text-[11px] text-muted-foreground">{etf.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-semibold tabular-nums">{etf.price.toFixed(2)}</p>
                    <ChangeText value={etf.change1d} />
                  </div>
                </div>
                {/* Line 2: Stat chips */}
                <div className="flex items-center gap-2">
                  <ReturnBadge label="3Y" value={etf.return3y} />
                  <span className="rounded-md px-2 py-0.5 text-[12px] font-medium bg-muted/60 text-muted-foreground">AUM {etf.aum}</span>
                  <span className="rounded-md px-2 py-0.5 text-[12px] font-medium bg-muted/60 text-muted-foreground">Exp {etf.expenseRatio}%</span>
                  {/* Extra fields on scroll */}
                  <div className="w-2" />
                  <ReturnBadge label="1Y" value={etf.return1y} />
                  <ReturnBadge label="5Y" value={etf.return5y} />
                  <div className="flex items-center gap-2">
                    <RangeBar low={etf.low52w} high={etf.high52w} current={etf.price} />
                  </div>
                  <span className="rounded-md px-2 py-0.5 text-[12px] font-medium bg-muted/60 text-muted-foreground">TE {etf.trackingError}%</span>
                  <WatchlistBtn />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── V3: Card + Swipe Reveal ────────────────────────────────────────────────

function V3CardSwipe() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const data = getGainersLosers(mode);

  return (
    <div>
      <GainersLosersToggle mode={mode} setMode={setMode} />
      <div className="space-y-3">
        {data.map((etf) => (
          <div key={etf.symbol} className="rounded-2xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <div className="flex min-w-[620px]">
                {/* Frozen card content */}
                <div className="flex-shrink-0 w-[310px] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-[12px] font-bold">
                        {etf.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold">{etf.symbol}</p>
                        <p className="text-[12px] text-muted-foreground">{etf.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[17px] font-bold tabular-nums">{etf.price.toFixed(2)}</p>
                      <ChangeText value={etf.change1d} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg bg-muted/40 px-2.5 py-1.5 text-center">
                      <p className="text-[10px] text-muted-foreground">3Y Return</p>
                      <p className={cn("text-[13px] font-semibold tabular-nums", etf.return3y >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {etf.return3y >= 0 ? "+" : ""}{etf.return3y}%
                      </p>
                    </div>
                    <div className="flex-1 rounded-lg bg-muted/40 px-2.5 py-1.5 text-center">
                      <p className="text-[10px] text-muted-foreground">AUM</p>
                      <p className="text-[13px] font-semibold">{etf.aum}</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-muted/40 px-2.5 py-1.5 text-center">
                      <p className="text-[10px] text-muted-foreground">Expense</p>
                      <p className="text-[13px] font-semibold tabular-nums">{etf.expenseRatio}%</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 mt-2 text-right">swipe for more →</p>
                </div>

                {/* Revealed on scroll */}
                <div className="flex-shrink-0 w-[310px] p-4 border-l border-border/30 bg-muted/10">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="rounded-lg bg-background px-2.5 py-1.5">
                      <p className="text-[10px] text-muted-foreground">1Y Return</p>
                      <p className={cn("text-[14px] font-semibold tabular-nums", etf.return1y >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {etf.return1y >= 0 ? "+" : ""}{etf.return1y}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-background px-2.5 py-1.5">
                      <p className="text-[10px] text-muted-foreground">5Y Return</p>
                      <p className={cn("text-[14px] font-semibold tabular-nums", etf.return5y >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {etf.return5y >= 0 ? "+" : ""}{etf.return5y}%
                      </p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-[10px] text-muted-foreground mb-1">52W Range</p>
                    <RangeBar low={etf.low52w} high={etf.high52w} current={etf.price} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Tracking Error</p>
                      <p className="text-[13px] font-medium tabular-nums">{etf.trackingError}%</p>
                    </div>
                    <WatchlistBtn />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── V4: Tap-to-Expand Accordion ────────────────────────────────────────────

function V4Accordion() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const [expanded, setExpanded] = useState<string | null>(null);
  const data = getGainersLosers(mode);

  return (
    <div>
      <GainersLosersToggle mode={mode} setMode={setMode} />
      <div className="border rounded-xl overflow-hidden divide-y divide-border/50">
        {data.map((etf) => (
          <div key={etf.symbol}>
            <button
              onClick={() => setExpanded(expanded === etf.symbol ? null : etf.symbol)}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/20 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold shrink-0">
                {etf.symbol.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-semibold">{etf.symbol}</p>
                  <p className="text-[15px] font-semibold tabular-nums">{etf.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground tabular-nums">
                    <span>3Y {etf.return3y >= 0 ? "+" : ""}{etf.return3y}%</span>
                    <span>·</span>
                    <span>AUM {etf.aum}</span>
                    <span>·</span>
                    <span>Exp {etf.expenseRatio}%</span>
                  </div>
                  <ChangeText value={etf.change1d} />
                </div>
              </div>
              <ChevronRight
                size={16}
                className={cn(
                  "text-muted-foreground/50 transition-transform shrink-0",
                  expanded === etf.symbol && "rotate-90"
                )}
              />
            </button>
            <AnimatePresence>
              {expanded === etf.symbol && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="rounded-xl bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground mb-0.5">1Y Return</p>
                        <p className={cn("text-[16px] font-bold tabular-nums", etf.return1y >= 0 ? "text-emerald-500" : "text-red-500")}>
                          {etf.return1y >= 0 ? "+" : ""}{etf.return1y}%
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground mb-0.5">5Y Return</p>
                        <p className={cn("text-[16px] font-bold tabular-nums", etf.return5y >= 0 ? "text-emerald-500" : "text-red-500")}>
                          {etf.return5y >= 0 ? "+" : ""}{etf.return5y}%
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-3 mb-3">
                      <p className="text-[11px] text-muted-foreground mb-1.5">52-Week Range</p>
                      <RangeBar low={etf.low52w} high={etf.high52w} current={etf.price} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-muted/30 px-3 py-2">
                        <p className="text-[11px] text-muted-foreground">Tracking Error</p>
                        <p className="text-[14px] font-semibold tabular-nums">{etf.trackingError}%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-muted-foreground">Watchlist</span>
                        <WatchlistBtn />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── V5: Summary Card + Data Strip ──────────────────────────────────────────

function V5SummaryStrip() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const data = getGainersLosers(mode);

  return (
    <div>
      <GainersLosersToggle mode={mode} setMode={setMode} />
      <div className="space-y-4">
        {data.map((etf) => (
          <div key={etf.symbol}>
            {/* Ticker card */}
            <div className="rounded-xl border bg-card p-4 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-[13px] font-bold">
                    {etf.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-[16px] font-bold">{etf.symbol}</p>
                    <p className="text-[12px] text-muted-foreground">{etf.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-bold tabular-nums">{etf.price.toFixed(2)}</p>
                  <ChangeText value={etf.change1d} />
                </div>
              </div>
            </div>
            {/* Scrollable strip */}
            <div className="overflow-x-auto pb-1 -mx-1">
              <div className="flex gap-2 px-1 min-w-max">
                <ReturnBadge label="3Y" value={etf.return3y} />
                <span className="rounded-md px-2 py-0.5 text-[12px] font-medium bg-muted/60 text-muted-foreground">AUM {etf.aum}</span>
                <span className="rounded-md px-2 py-0.5 text-[12px] font-medium bg-muted/60 text-muted-foreground tabular-nums">Exp {etf.expenseRatio}%</span>
                <ReturnBadge label="1Y" value={etf.return1y} />
                <ReturnBadge label="5Y" value={etf.return5y} />
                <div className="flex items-center rounded-md px-2 py-0.5 bg-muted/60">
                  <RangeBar low={etf.low52w} high={etf.high52w} current={etf.price} />
                </div>
                <span className="rounded-md px-2 py-0.5 text-[12px] font-medium bg-muted/60 text-muted-foreground tabular-nums">TE {etf.trackingError}%</span>
                <WatchlistBtn />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── V6: Side-by-side Cards (2-col grid) ────────────────────────────────────

function V6GridCards() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const [selectedEtf, setSelectedEtf] = useState<ETF | null>(null);
  const data = getGainersLosers(mode);

  return (
    <div>
      <GainersLosersToggle mode={mode} setMode={setMode} />
      <div className="grid grid-cols-2 gap-3">
        {data.map((etf) => (
          <button
            key={etf.symbol}
            onClick={() => setSelectedEtf(etf)}
            className="rounded-2xl border bg-card p-3.5 text-left hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[14px] font-bold">{etf.symbol}</p>
              <span className={cn(
                "rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                etf.change1d >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              )}>
                {etf.change1d >= 0 ? "+" : ""}{etf.change1d.toFixed(2)}%
              </span>
            </div>
            <p className="text-[18px] font-bold tabular-nums mb-0.5">{etf.price.toFixed(2)}</p>
            <p className={cn("text-[13px] font-medium tabular-nums mb-2", etf.return3y >= 0 ? "text-emerald-500" : "text-red-500")}>
              3Y {etf.return3y >= 0 ? "+" : ""}{etf.return3y}%
            </p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{etf.aum}</span>
              <span>·</span>
              <span tabular-nums="true">{etf.expenseRatio}%</span>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom sheet */}
      <AnimatePresence>
        {selectedEtf && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelectedEtf(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[430px]"
            >
              <div className="rounded-t-2xl border-t bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[17px] font-bold">{selectedEtf.symbol}</p>
                    <p className="text-[13px] text-muted-foreground">{selectedEtf.name}</p>
                  </div>
                  <button onClick={() => setSelectedEtf(null)} className="p-1.5 rounded-lg hover:bg-muted">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl bg-muted/30 p-3">
                    <p className="text-[11px] text-muted-foreground mb-0.5">1Y Return</p>
                    <p className={cn("text-[17px] font-bold tabular-nums", selectedEtf.return1y >= 0 ? "text-emerald-500" : "text-red-500")}>
                      {selectedEtf.return1y >= 0 ? "+" : ""}{selectedEtf.return1y}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/30 p-3">
                    <p className="text-[11px] text-muted-foreground mb-0.5">5Y Return</p>
                    <p className={cn("text-[17px] font-bold tabular-nums", selectedEtf.return5y >= 0 ? "text-emerald-500" : "text-red-500")}>
                      {selectedEtf.return5y >= 0 ? "+" : ""}{selectedEtf.return5y}%
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-muted/30 p-3 mb-4">
                  <p className="text-[11px] text-muted-foreground mb-1.5">52-Week Range</p>
                  <RangeBar low={selectedEtf.low52w} high={selectedEtf.high52w} current={selectedEtf.price} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Tracking Error</p>
                    <p className="text-[15px] font-semibold tabular-nums">{selectedEtf.trackingError}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-muted-foreground">Add to Watchlist</span>
                    <WatchlistBtn />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── V7: Magazine Row ───────────────────────────────────────────────────────

function V7MagazineRow() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const data = getGainersLosers(mode);

  return (
    <div>
      <GainersLosersToggle mode={mode} setMode={setMode} />
      <div className="divide-y divide-border/40">
        {data.map((etf) => (
          <div key={etf.symbol} className="py-4 first:pt-0 last:pb-0">
            <div className="overflow-x-auto">
              <div className="min-w-[550px]">
                <div className="flex items-start gap-4 px-1">
                  {/* Hero 3Y */}
                  <div className="flex-shrink-0 w-[100px]">
                    <p className={cn(
                      "text-[28px] font-black leading-none tabular-nums",
                      etf.return3y >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                      {etf.return3y >= 0 ? "+" : ""}{etf.return3y}%
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">3Y return</p>
                  </div>
                  {/* Details */}
                  <div className="flex-1">
                    <p className="text-[16px] font-bold">{etf.symbol} <span className="text-[13px] font-normal text-muted-foreground">{etf.name}</span></p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[15px] font-semibold tabular-nums">{etf.price.toFixed(2)}</span>
                      <ChangeText value={etf.change1d} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[12px] text-muted-foreground">
                      <span>AUM {etf.aum}</span>
                      <span>Exp {etf.expenseRatio}%</span>
                    </div>
                  </div>
                  {/* Extra fields on scroll */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground">1Y</p>
                      <p className={cn("text-[14px] font-semibold tabular-nums", etf.return1y >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {etf.return1y >= 0 ? "+" : ""}{etf.return1y}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground">5Y</p>
                      <p className={cn("text-[14px] font-semibold tabular-nums", etf.return5y >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {etf.return5y >= 0 ? "+" : ""}{etf.return5y}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Range</p>
                      <RangeBar low={etf.low52w} high={etf.high52w} current={etf.price} />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground">TE</p>
                      <p className="text-[13px] font-medium tabular-nums">{etf.trackingError}%</p>
                    </div>
                    <WatchlistBtn />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── V8: Stat Dashboard Cards ───────────────────────────────────────────────

function V8StatDashboard() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const data = getGainersLosers(mode);

  return (
    <div>
      <GainersLosersToggle mode={mode} setMode={setMode} />
      <div className="space-y-3">
        {data.map((etf) => (
          <div key={etf.symbol} className="rounded-2xl border bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold">
                  {etf.symbol.slice(0, 2)}
                </div>
                <p className="text-[15px] font-bold">{etf.symbol}</p>
                <p className="text-[12px] text-muted-foreground">{etf.name}</p>
              </div>
            </div>
            {/* 3x2 Grid */}
            <div className="grid grid-cols-3 border-t border-border/30">
              <div className="px-3 py-2.5 border-r border-b border-border/30">
                <p className="text-[10px] text-muted-foreground">Price</p>
                <p className="text-[15px] font-bold tabular-nums">{etf.price.toFixed(2)}</p>
              </div>
              <div className="px-3 py-2.5 border-r border-b border-border/30">
                <p className="text-[10px] text-muted-foreground">1D Change</p>
                <p className={cn("text-[15px] font-bold tabular-nums", etf.change1d >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {etf.change1d >= 0 ? "+" : ""}{etf.change1d.toFixed(2)}%
                </p>
              </div>
              <div className="px-3 py-2.5 border-b border-border/30">
                <p className="text-[10px] text-muted-foreground">3Y Return</p>
                <p className={cn("text-[15px] font-bold tabular-nums", etf.return3y >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {etf.return3y >= 0 ? "+" : ""}{etf.return3y}%
                </p>
              </div>
              <div className="px-3 py-2.5 border-r border-border/30">
                <p className="text-[10px] text-muted-foreground">AUM</p>
                <p className="text-[15px] font-bold">{etf.aum}</p>
              </div>
              <div className="px-3 py-2.5 border-r border-border/30">
                <p className="text-[10px] text-muted-foreground">Expense</p>
                <p className="text-[15px] font-bold tabular-nums">{etf.expenseRatio}%</p>
              </div>
              <div className="px-3 py-2.5" />
            </div>
            {/* Scrollable strip */}
            <div className="overflow-x-auto border-t border-border/30">
              <div className="flex items-center gap-3 px-3 py-2.5 min-w-max">
                <ReturnBadge label="1Y" value={etf.return1y} />
                <ReturnBadge label="5Y" value={etf.return5y} />
                <RangeBar low={etf.low52w} high={etf.high52w} current={etf.price} />
                <span className="rounded-md px-2 py-0.5 text-[12px] font-medium bg-muted/60 text-muted-foreground tabular-nums">TE {etf.trackingError}%</span>
                <WatchlistBtn />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── V9: Hero Selector ──────────────────────────────────────────────────────

function V9HeroSelector() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const data = getGainersLosers(mode);
  const etf = data[selectedIndex];

  return (
    <div>
      <GainersLosersToggle mode={mode} setMode={setMode} />

      {/* Hero card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={etf.symbol}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border bg-card p-5 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[20px] font-black">{etf.symbol}</p>
              <p className="text-[13px] text-muted-foreground">{etf.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-bold tabular-nums">{etf.price.toFixed(2)}</p>
              <ChangeText value={etf.change1d} />
            </div>
          </div>

          {/* All 11 fields */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-muted/30 p-2.5">
              <p className="text-[10px] text-muted-foreground">3Y Return</p>
              <p className={cn("text-[16px] font-bold tabular-nums", etf.return3y >= 0 ? "text-emerald-500" : "text-red-500")}>
                {etf.return3y >= 0 ? "+" : ""}{etf.return3y}%
              </p>
            </div>
            <div className="rounded-xl bg-muted/30 p-2.5">
              <p className="text-[10px] text-muted-foreground">1Y Return</p>
              <p className={cn("text-[16px] font-bold tabular-nums", etf.return1y >= 0 ? "text-emerald-500" : "text-red-500")}>
                {etf.return1y >= 0 ? "+" : ""}{etf.return1y}%
              </p>
            </div>
            <div className="rounded-xl bg-muted/30 p-2.5">
              <p className="text-[10px] text-muted-foreground">5Y Return</p>
              <p className={cn("text-[16px] font-bold tabular-nums", etf.return5y >= 0 ? "text-emerald-500" : "text-red-500")}>
                {etf.return5y >= 0 ? "+" : ""}{etf.return5y}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-muted/30 p-2.5">
              <p className="text-[10px] text-muted-foreground">AUM</p>
              <p className="text-[15px] font-bold">{etf.aum}</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-2.5">
              <p className="text-[10px] text-muted-foreground">Expense</p>
              <p className="text-[15px] font-bold tabular-nums">{etf.expenseRatio}%</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-2.5">
              <p className="text-[10px] text-muted-foreground">Track Error</p>
              <p className="text-[15px] font-bold tabular-nums">{etf.trackingError}%</p>
            </div>
          </div>

          <div className="rounded-xl bg-muted/30 p-3 mb-4">
            <p className="text-[11px] text-muted-foreground mb-2">52-Week Range</p>
            <RangeBar low={etf.low52w} high={etf.high52w} current={etf.price} />
          </div>

          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-muted-foreground">Add to Watchlist</span>
              <WatchlistBtn />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Selector chips */}
      <div className="overflow-x-auto -mx-1">
        <div className="flex gap-2 px-1">
          {data.map((e, i) => (
            <button
              key={e.symbol}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "flex-shrink-0 rounded-xl px-4 py-2.5 border transition-all",
                selectedIndex === i
                  ? "border-foreground bg-foreground/5"
                  : "border-border/50 hover:border-border"
              )}
            >
              <p className="text-[13px] font-semibold">{e.symbol}</p>
              <p className={cn("text-[12px] font-medium tabular-nums", e.change1d >= 0 ? "text-emerald-500" : "text-red-500")}>
                {e.change1d >= 0 ? "+" : ""}{e.change1d.toFixed(2)}%
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── V10: Inline Peek ───────────────────────────────────────────────────────

function V10InlinePeek() {
  const [mode, setMode] = useState<"gainers" | "losers">("gainers");
  const data = getGainersLosers(mode);

  return (
    <div>
      <GainersLosersToggle mode={mode} setMode={setMode} />
      <div className="border rounded-xl overflow-hidden divide-y divide-border/50">
        {data.map((etf) => (
          <V10Row key={etf.symbol} etf={etf} />
        ))}
      </div>
    </div>
  );
}

function V10Row({ etf }: { etf: ETF }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      <div className="overflow-x-auto">
        <div className="flex min-w-[650px]">
          {/* Primary layer */}
          <div className="flex-shrink-0 w-[calc(100vw-32px)] max-w-[398px] flex items-center gap-3 px-3 py-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold shrink-0">
              {etf.symbol.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold">{etf.symbol}</p>
              <p className="text-[11px] text-muted-foreground truncate">{etf.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[14px] font-semibold tabular-nums">{etf.price.toFixed(2)}</p>
              <ChangeText value={etf.change1d} />
            </div>
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground shrink-0 tabular-nums">
              <span>3Y {etf.return3y >= 0 ? "+" : ""}{etf.return3y}%</span>
            </div>
            <div className="shrink-0 flex items-center">
              <GripVertical size={14} className="text-muted-foreground/30" />
            </div>
          </div>

          {/* Hidden fields revealed by scroll */}
          <div className="flex-shrink-0 flex items-center gap-4 px-4 py-3 bg-muted/10 border-l border-border/30">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">AUM</p>
              <p className="text-[13px] font-semibold">{etf.aum}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Exp</p>
              <p className="text-[13px] font-semibold tabular-nums">{etf.expenseRatio}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">1Y</p>
              <p className={cn("text-[13px] font-semibold tabular-nums", etf.return1y >= 0 ? "text-emerald-500" : "text-red-500")}>
                {etf.return1y >= 0 ? "+" : ""}{etf.return1y}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">5Y</p>
              <p className={cn("text-[13px] font-semibold tabular-nums", etf.return5y >= 0 ? "text-emerald-500" : "text-red-500")}>
                {etf.return5y >= 0 ? "+" : ""}{etf.return5y}%
              </p>
            </div>
            <RangeBar low={etf.low52w} high={etf.high52w} current={etf.price} />
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">TE</p>
              <p className="text-[13px] font-medium tabular-nums">{etf.trackingError}%</p>
            </div>
            <WatchlistBtn />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Variations Array ───────────────────────────────────────────────────────

const variations = [
  { id: "V1", label: "Frozen-6 Table", component: V1FrozenTable },
  { id: "V2", label: "Two-Tier Row", component: V2TwoTierRow },
  { id: "V3", label: "Card + Swipe", component: V3CardSwipe },
  { id: "V4", label: "Accordion", component: V4Accordion },
  { id: "V5", label: "Summary Strip", component: V5SummaryStrip },
  { id: "V6", label: "Grid Cards", component: V6GridCards },
  { id: "V7", label: "Magazine Row", component: V7MagazineRow },
  { id: "V8", label: "Stat Dashboard", component: V8StatDashboard },
  { id: "V9", label: "Hero Selector", component: V9HeroSelector },
  { id: "V10", label: "Inline Peek", component: V10InlinePeek },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ETFTopMoversV2() {
  const [activeVariation, setActiveVariation] = useState("V1");
  const ActiveComponent = variations.find((v) => v.id === activeVariation)!.component;

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      <StatusBar />

      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/?tab=components" className="p-1 -ml-1 rounded-lg hover:bg-muted/50 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-[17px] font-bold tracking-tight">ETF Top Movers · v2</h1>
            <p className="text-[12px] text-muted-foreground">10 layout directions · frozen 6 + scroll 5</p>
          </div>
        </div>
      </div>

      {/* Variation tabs */}
      <div className="px-4 mb-4">
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-1 min-w-max">
            {variations.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVariation(v.id)}
                className={cn(
                  "relative px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors whitespace-nowrap",
                  activeVariation === v.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/70"
                )}
              >
                {activeVariation === v.id && (
                  <motion.div
                    layoutId="etf-movers-tab"
                    className="absolute inset-0 rounded-lg bg-secondary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{v.id}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="text-[12px] text-muted-foreground mt-2">
          {variations.find((v) => v.id === activeVariation)?.label}
        </p>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border/60 mb-4" />

      {/* Active variation */}
      <div className="flex-1 px-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeVariation}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      <HomeIndicator />
    </div>
  );
}
