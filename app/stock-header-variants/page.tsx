"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, TrendingUp, TrendingDown, Clock, Dot } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { useTheme } from "@/components/theme-provider";

// ─── Types ──────────────────────────────────────────────────────────────────

type MarketState = "open" | "afterHours" | "closed";

interface StockData {
  symbol: string;
  exchange: string;
  name: string;
  price: number;
  dayChange: number;
  dayChangePct: number;
  closePct: number;
  afterHoursPrice: number;
  afterHoursChange: number;
  afterHoursChangePct: number;
  marketCap: string;
  capCategory: string;
  logoLetter: string;
  logoBg: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const stock: StockData = {
  symbol: "AAPL",
  exchange: "NASDAQ",
  name: "Apple Inc.",
  price: 198.11,
  dayChange: 3.24,
  dayChangePct: 1.66,
  closePct: 1.66,
  afterHoursPrice: 198.85,
  afterHoursChange: 0.74,
  afterHoursChangePct: 0.37,
  marketCap: "3.07T",
  capCategory: "Mega Cap",
  logoLetter: "A",
  logoBg: "bg-neutral-800 dark:bg-neutral-700",
};

const tabs = [
  "Overview",
  "Revenue",
  "Financials",
  "Options",
  "Technical",
  "News",
  "Ownership",
  "ETFs",
  "Events",
  "My Order",
];

// ─── Shared Components ──────────────────────────────────────────────────────

function Logo({ letter, size = 40 }: { letter?: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-muted text-muted-foreground font-bold"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {letter || ""}
    </div>
  );
}

function MarketStatusBadge({ state }: { state: MarketState }) {
  if (state === "open") {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-gain">
        <span className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" />
        Market Open
      </span>
    );
  }
  if (state === "afterHours") {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-500">
        <Clock size={12} strokeWidth={2.2} />
        After Hours
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      Market Closed
    </span>
  );
}

function TabBar({ activeTab, onTabChange, id }: { activeTab: string; onTabChange: (tab: string) => void; id: string }) {
  return (
    <div className="relative">
      <div className="no-scrollbar flex gap-0.5 overflow-x-auto px-4 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap",
              activeTab === tab
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId={`tab-${id}`}
                className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="h-px bg-border/60" />
    </div>
  );
}

function StateSwitcher({ state, onChange }: { state: MarketState; onChange: (s: MarketState) => void }) {
  const states: MarketState[] = ["open", "afterHours", "closed"];
  const labels: Record<MarketState, string> = { open: "Open", afterHours: "After Hours", closed: "Closed" };
  return (
    <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
      {states.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
            state === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          {labels[s]}
        </button>
      ))}
    </div>
  );
}

// ─── Variation 1: Classic Stack ─────────────────────────────────────────────
// Name + logo top, price left / market cap right, changes stacked below price

function Variation1({ state }: { state: MarketState }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const isUp = stock.dayChange >= 0;
  const ahUp = stock.afterHoursChange >= 0;

  return (
    <div className="bg-background">
      <div className="px-4 pt-4 pb-3">
        {/* Name + Logo row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-bold text-foreground truncate">{stock.name}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {stock.symbol} : {stock.exchange}
            </p>
          </div>
          <Logo size={44} />
        </div>

        {/* Price + Market Cap row */}
        <div className="mt-4 flex items-start justify-between">
          <div>
            <p className="text-[28px] font-bold tracking-tight tabular-nums text-foreground leading-none">
              {stock.price.toFixed(2)}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className={cn("text-[13px] font-semibold tabular-nums", isUp ? "text-gain" : "text-loss")}>
                {isUp ? "+" : ""}{stock.dayChange.toFixed(2)} ({isUp ? "+" : ""}{stock.dayChangePct.toFixed(2)}%)
              </span>
              <span className="text-[13px] text-muted-foreground">Today</span>
            </div>
            {state === "afterHours" && (
              <div className="mt-1 flex items-center gap-1.5">
                <span className={cn("text-[13px] font-semibold tabular-nums", ahUp ? "text-gain" : "text-loss")}>
                  {ahUp ? "+" : ""}{stock.afterHoursChange.toFixed(2)} ({ahUp ? "+" : ""}{stock.afterHoursChangePct.toFixed(2)}%)
                </span>
                <span className="text-[13px] text-muted-foreground">After Hours</span>
              </div>
            )}
          </div>

          <div className="text-right shrink-0">
            <p className="text-[16px] font-bold tracking-tight tabular-nums text-foreground leading-none">
              {stock.marketCap}
            </p>
            <span className="mt-1.5 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {stock.capCategory}
            </span>
          </div>
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} id="v1" />
    </div>
  );
}

// ─── Variation 2: Compact Horizontal ────────────────────────────────────────
// Logo left, name center, market cap right — price + changes side by side

function Variation2({ state }: { state: MarketState }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const isUp = stock.dayChange >= 0;
  const ahUp = stock.afterHoursChange >= 0;

  return (
    <div className="bg-background">
      <div className="px-4 pt-4 pb-3">
        {/* Logo + Name + Market Cap row */}
        <div className="flex items-center gap-3">
          <Logo size={44} />
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-bold text-foreground truncate">{stock.name}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {stock.symbol} : {stock.exchange}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[16px] font-bold tracking-tight tabular-nums text-foreground leading-none">
              {stock.marketCap}
            </p>
            <span className="mt-1.5 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {stock.capCategory}
            </span>
          </div>
        </div>

        {/* Price + Changes side by side */}
        <div className={cn("mt-4 flex gap-3", state === "afterHours" ? "items-center" : "items-baseline")}>
          <p className={cn(
            "font-bold tracking-tight tabular-nums text-foreground leading-none",
            state === "afterHours" ? "text-[34px]" : "text-[28px]"
          )}>
            {stock.price.toFixed(2)}
          </p>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[13px] font-semibold tabular-nums", isUp ? "text-gain" : "text-loss")}>
                {isUp ? "+" : ""}{stock.dayChange.toFixed(2)} ({isUp ? "+" : ""}{stock.dayChangePct.toFixed(2)}%)
              </span>
              <span className="text-[13px] text-muted-foreground">
                {state === "afterHours" ? "At close" : "Today"}
              </span>
            </div>
            {state === "afterHours" && (
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[13px] font-semibold tabular-nums", ahUp ? "text-gain" : "text-loss")}>
                  {ahUp ? "+" : ""}{stock.afterHoursChange.toFixed(2)} ({ahUp ? "+" : ""}{stock.afterHoursChangePct.toFixed(2)}%)
                </span>
                <span className="text-[13px] text-muted-foreground">After Hours</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} id="v2" />
    </div>
  );
}

// ─── Variation 3: Centered Hero ─────────────────────────────────────────────
// Logo centered, price prominent center, everything radiates from center

function Variation3({ state }: { state: MarketState }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const isUp = stock.dayChange >= 0;

  return (
    <div className="bg-background">
      <div className="px-4 pt-5 pb-3">
        {/* Centered logo + ticker */}
        <div className="flex flex-col items-center text-center">
          <Logo letter={stock.logoLetter} size={52} />
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[18px] font-bold text-foreground">{stock.symbol}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {stock.exchange}
            </span>
          </div>
          <p className="mt-0.5 text-[14px] text-muted-foreground">{stock.name}</p>

          {/* Price */}
          <p className="mt-4 text-[38px] font-bold tracking-tight tabular-nums text-foreground leading-none">
            {stock.price.toFixed(2)}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[14px] font-semibold tabular-nums",
              isUp ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
            )}>
              {isUp ? "+" : ""}{stock.dayChange.toFixed(2)} ({isUp ? "+" : ""}{stock.dayChangePct.toFixed(2)}%)
            </span>
          </div>

          {/* After hours */}
          {state === "afterHours" && (
            <div className="mt-2 flex items-center gap-1.5 text-[13px]">
              <Clock size={12} className="text-amber-500" />
              <span className="text-muted-foreground">After Hours</span>
              <span className="font-semibold tabular-nums text-foreground">{stock.afterHoursPrice.toFixed(2)}</span>
              <span className={cn("font-medium tabular-nums", stock.afterHoursChange >= 0 ? "text-gain" : "text-loss")}>
                {stock.afterHoursChange >= 0 ? "+" : ""}{stock.afterHoursChangePct.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Meta row */}
          <div className="mt-3 flex items-center gap-2">
            <MarketStatusBadge state={state} />
            <span className="text-[12px] text-muted-foreground">·</span>
            <span className="text-[12px] text-muted-foreground">{stock.capCategory}</span>
            <span className="text-[12px] text-muted-foreground">·</span>
            <span className="text-[12px] font-medium text-foreground">{stock.marketCap}</span>
          </div>
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} id="v3" />
    </div>
  );
}

// ─── Variation 4: Split Card ────────────────────────────────────────────────
// Two-column feel — left has identity, right has numbers, in a subtle card

function Variation4({ state }: { state: MarketState }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const isUp = stock.dayChange >= 0;

  return (
    <div className="bg-background">
      <div className="px-4 pt-4 pb-3">
        {/* Identity row */}
        <div className="flex items-center gap-3">
          <Logo letter={stock.logoLetter} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-foreground truncate">{stock.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-muted-foreground">{stock.symbol}</span>
              <span className="text-[11px] text-muted-foreground/60">·</span>
              <span className="text-[12px] text-muted-foreground">{stock.exchange}</span>
            </div>
          </div>
          <MarketStatusBadge state={state} />
        </div>

        {/* Price card */}
        <div className="mt-3 rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {state === "closed" ? "Close Price" : "Current Price"}
              </p>
              <p className="mt-1 text-[32px] font-bold tracking-tight tabular-nums text-foreground leading-none">
                {stock.price.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <div className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5",
                isUp ? "bg-gain/10" : "bg-loss/10"
              )}>
                {isUp ? <TrendingUp size={14} className="text-gain" /> : <TrendingDown size={14} className="text-loss" />}
                <span className={cn("text-[15px] font-bold tabular-nums", isUp ? "text-gain" : "text-loss")}>
                  {isUp ? "+" : ""}{stock.dayChangePct.toFixed(2)}%
                </span>
              </div>
              <p className={cn("mt-1 text-[13px] font-medium tabular-nums text-right", isUp ? "text-gain" : "text-loss")}>
                {isUp ? "+" : ""}{stock.dayChange.toFixed(2)}
              </p>
            </div>
          </div>

          {/* After hours inside card */}
          {state === "afterHours" && (
            <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
              <Clock size={13} className="text-amber-500 shrink-0" />
              <span className="text-[12px] text-muted-foreground">After Hours</span>
              <span className="text-[14px] font-semibold tabular-nums text-foreground">{stock.afterHoursPrice.toFixed(2)}</span>
              <span className={cn(
                "text-[13px] font-medium tabular-nums",
                stock.afterHoursChange >= 0 ? "text-gain" : "text-loss"
              )}>
                {stock.afterHoursChange >= 0 ? "+" : ""}{stock.afterHoursChange.toFixed(2)} ({stock.afterHoursChange >= 0 ? "+" : ""}{stock.afterHoursChangePct.toFixed(2)}%)
              </span>
            </div>
          )}

          {/* Bottom meta */}
          <div className="mt-3 flex items-center gap-3 border-t border-border/40 pt-3">
            <div>
              <p className="text-[11px] text-muted-foreground">Market Cap</p>
              <p className="text-[14px] font-semibold text-foreground">{stock.marketCap}</p>
            </div>
            <div className="h-6 w-px bg-border/60" />
            <div>
              <p className="text-[11px] text-muted-foreground">Category</p>
              <p className="text-[14px] font-semibold text-foreground">{stock.capCategory}</p>
            </div>
          </div>
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} id="v4" />
    </div>
  );
}

// ─── Variation 5: Dense Bloomberg ───────────────────────────────────────────
// Info-dense, everything visible at once, minimal vertical space

function Variation5({ state }: { state: MarketState }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const isUp = stock.dayChange >= 0;

  return (
    <div className="bg-background">
      <div className="px-4 pt-3 pb-3">
        {/* Row 1: Logo, ticker, name, price all in one line */}
        <div className="flex items-center gap-2.5">
          <Logo letter={stock.logoLetter} size={34} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[16px] font-bold text-foreground">{stock.symbol}</span>
              <span className="text-[12px] text-muted-foreground">{stock.exchange}</span>
              <Dot size={12} className="text-muted-foreground/40" />
              <span className="text-[12px] text-muted-foreground truncate">{stock.name}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Price + change + market cap — all inline */}
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[30px] font-bold tracking-tight tabular-nums text-foreground leading-none">
              {stock.price.toFixed(2)}
            </span>
            <span className={cn("text-[15px] font-semibold tabular-nums", isUp ? "text-gain" : "text-loss")}>
              {isUp ? "+" : ""}{stock.dayChange.toFixed(2)}
            </span>
            <span className={cn(
              "rounded-md px-1.5 py-0.5 text-[13px] font-semibold tabular-nums",
              isUp ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
            )}>
              {isUp ? "+" : ""}{stock.dayChangePct.toFixed(2)}%
            </span>
          </div>
          <MarketStatusBadge state={state} />
        </div>

        {/* Row 3: After hours or market cap row */}
        <div className="mt-2 flex items-center justify-between">
          {state === "afterHours" ? (
            <div className="flex items-center gap-1.5 text-[13px]">
              <Clock size={12} className="text-amber-500" />
              <span className="text-muted-foreground">AH</span>
              <span className="font-semibold tabular-nums text-foreground">{stock.afterHoursPrice.toFixed(2)}</span>
              <span className={cn("font-medium tabular-nums", stock.afterHoursChange >= 0 ? "text-gain" : "text-loss")}>
                {stock.afterHoursChange >= 0 ? "+" : ""}{stock.afterHoursChange.toFixed(2)} ({stock.afterHoursChange >= 0 ? "+" : ""}{stock.afterHoursChangePct.toFixed(2)}%)
              </span>
            </div>
          ) : (
            <div className="text-[13px] text-muted-foreground">
              {state === "closed" ? "At close" : "Today"}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-muted-foreground">{stock.capCategory}</span>
            <span className="font-semibold text-foreground">{stock.marketCap}</span>
          </div>
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} id="v5" />
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

const variations = [
  { label: "V1 · Classic Stack", description: "Name + logo top, price left / market cap right, changes below", Component: Variation1 },
  { label: "V2 · Inline Changes", description: "Logo left, market cap right — price + changes side by side", Component: Variation2 },
  { label: "V3 · Centered Hero", description: "Centered logo + price, radiating layout", Component: Variation3 },
  { label: "V4 · Split Card", description: "Identity row + price card with metrics", Component: Variation4 },
  { label: "V5 · Dense Info", description: "Bloomberg-style, everything on minimal lines", Component: Variation5 },
];

export default function StockHeaderVariantsPage() {
  const { theme, toggleTheme } = useTheme();
  const [marketState, setMarketState] = useState<MarketState>("open");

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-[430px] pb-16">
        <StatusBar />

        {/* Page header */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/40">
          <div className="flex items-center gap-2 px-4 pt-2 pb-3">
            <Link
              href="/?tab=components"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
            >
              <ArrowLeft size={18} strokeWidth={2.2} />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[18px] font-bold tracking-tight text-foreground truncate">
                Stock Header
              </h1>
              <p className="text-[12px] text-muted-foreground">
                5 variations · 3 market states
              </p>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 active:scale-95 transition-transform"
            >
              {theme === "dark" ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* State switcher */}
        <div className="px-4 pt-4 pb-2">
          <StateSwitcher state={marketState} onChange={setMarketState} />
        </div>

        {/* Variations */}
        <div className="space-y-6 px-4 pt-4 pb-8">
          {variations.map(({ label, description, Component }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              {/* Variation label */}
              <div className="mb-2">
                <p className="text-[14px] font-bold text-foreground">{label}</p>
                <p className="text-[12px] text-muted-foreground">{description}</p>
              </div>
              {/* Variation card */}
              <div className="rounded-2xl border border-border/60 overflow-hidden">
                <Component state={marketState} />
              </div>
            </motion.div>
          ))}
        </div>

        <HomeIndicator />
      </div>
    </div>
  );
}
