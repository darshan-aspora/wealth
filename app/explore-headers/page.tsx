"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, Search, Grip, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Shared: animated search keywords ────────────────────────────────
const keywords = ["stocks", "etf", "options", "index", "news", "advisory"];

function useRotatingKeyword(interval = 2400) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % keywords.length);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);
  return keywords[index];
}

function RotatingText({ prefix = "Search " }: { prefix?: string }) {
  const keyword = useRotatingKeyword();
  return (
    <span className="flex items-center gap-0">
      <span>{prefix}</span>
      <span className="relative inline-flex w-[84px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={keyword}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute left-0"
          >
            {keyword}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

// ─── Variation 1: Bold display ───────────────────────────────────────
// Large search presence, icon-heavy, confident trading-app energy
function HeaderV5() {
  return (
    <header className="flex items-center gap-3 px-5 py-3.5">
      <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40 text-foreground transition-colors hover:bg-muted/60 active:scale-95">
        <ChevronLeft size={24} strokeWidth={2.2} />
      </button>

      <div className="relative flex h-12 flex-1 items-center rounded-xl bg-muted/30 ring-1 ring-border/50 px-5">
        <Search size={19} className="shrink-0 text-foreground/40" />
        <div className="ml-2.5 text-[17px] font-medium text-foreground/30">
          <RotatingText />
        </div>
      </div>

      <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40 text-foreground transition-colors hover:bg-muted/60 active:scale-95">
        <Grip size={22} strokeWidth={1.8} />
      </button>
    </header>
  );
}

// ─── Shared: v3-style header bar ────────────────────────────────────
function V3Header() {
  return (
    <header className="flex items-center gap-1.5 pl-3 pr-3 py-3">
      <button className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted/50">
        <X size={20} strokeWidth={2} />
      </button>
      <div className="relative mx-1 flex h-12 min-w-0 flex-1 items-center rounded-full bg-muted/50 px-4">
        <div className="min-w-0 flex-1 overflow-hidden text-[16px] text-muted-foreground">
          <RotatingText />
        </div>
      </div>
      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted/50">
        <Bell size={20} strokeWidth={1.8} />
      </button>
      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:scale-95 transition-transform ml-1">
        <div className="h-8 w-8 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/profile_dp.png" alt="Profile" className="h-full w-full object-cover" />
        </div>
      </button>
    </header>
  );
}

// ─── Market status subtexts ─────────────────────────────────────────
const MARKET_SUBTEXTS = [
  { text: "Market Open", color: "text-gain", closed: false },
  { text: "Market closing in 15:00", color: "text-amber-500", closed: false },
  { text: "After Hours", color: "text-amber-500", closed: false },
  { text: "After hours closing in 15:00", color: "text-amber-500", closed: false },
  { text: "Market Closed", color: "text-loss", closed: true },
  { text: "Market opening in 15:00", color: "text-muted-foreground/50", closed: true },
];

// ─── V2 Header: Title + status + icons ──────────────────────────────
function V2Header({ onStatusChange }: { onStatusChange?: (closed: boolean) => void }) {
  const [statusIdx, setStatusIdx] = useState(0);
  const status = MARKET_SUBTEXTS[statusIdx];

  const cycle = () => {
    const next = (statusIdx + 1) % MARKET_SUBTEXTS.length;
    setStatusIdx(next);
    onStatusChange?.(MARKET_SUBTEXTS[next].closed);
  };

  return (
    <header className="flex items-center gap-2 pl-3 pr-3 py-3">
      <button className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted/50">
        <X size={20} strokeWidth={2} />
      </button>

      <div className="flex-1 min-w-0 ml-0.5">
        <p className="text-[17px] font-bold text-foreground leading-none">US Stocks</p>
        <button onClick={cycle} className="mt-0.5 active:opacity-70">
          <span className={`text-[12px] font-medium leading-none ${status.color}`}>
            {status.text}
          </span>
        </button>
      </div>

      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted/50">
        <Search size={20} strokeWidth={1.8} />
      </button>
      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted/50">
        <Bell size={20} strokeWidth={1.8} />
      </button>
      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:scale-95 transition-transform">
        <div className="h-8 w-8 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/profile_dp.png" alt="Profile" className="h-full w-full object-cover" />
        </div>
      </button>
    </header>
  );
}

// ─── Variation 2: Header + Ticker Tape ──────────────────────────────

const DEMO_TICKERS = [
  { symbol: "SPX", price: "5,999", change: "+0.4%" , gain: true },
  { symbol: "NDX", price: "21,256", change: "-0.4%", gain: false },
  { symbol: "AAPL", price: "229", change: "+1.4%", gain: true },
  { symbol: "MSFT", price: "432", change: "-0.7%", gain: false },
  { symbol: "GOOGL", price: "179", change: "+0.8%", gain: true },
  { symbol: "NVDA", price: "132", change: "-2.4%", gain: false },
];

function TickerTapeV1() {
  const [closed, setClosed] = useState(false);

  return (
    <div>
      <V2Header onStatusChange={setClosed} />
      <div className={`border-b border-border/40 transition-opacity duration-300 ${closed ? "opacity-30" : ""}`}>
        <div className="flex items-center">
        <div className="overflow-x-auto no-scrollbar flex-1">
          <div className="flex items-baseline gap-5 whitespace-nowrap px-5 pt-1 pb-3">
            {DEMO_TICKERS.map((t) => (
              <span key={t.symbol} className="shrink-0 text-[14px] leading-none">
                <span className={`font-semibold ${closed ? "text-muted-foreground" : "text-foreground"}`}>{t.symbol}</span>
                {" "}
                <span className="tabular-nums font-medium text-muted-foreground">{t.price}</span>
                {" "}
                <span className={`tabular-nums font-semibold ${closed ? "text-muted-foreground" : t.gain ? "text-gain" : "text-loss"}`}>
                  {t.change}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="shrink-0 pr-4 pl-2 pb-2 pt-1 text-muted-foreground/40">
          <ChevronLeft size={16} strokeWidth={2} className="-rotate-90" />
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── Variation 8: Header + Ticker Tape (with market status) ─────────
// Same as V7 but with sticky market status label on left. Click to cycle.

function TickerTapeV2() {
  const [idx, setIdx] = useState(0);
  const states = ["open", "after-hours", "closed"] as const;
  const status = states[idx];
  const label = status === "open" ? null
    : status === "after-hours" ? { text: "After Hours", color: "text-amber-500" }
    : { text: "Closed", color: "text-loss" };

  return (
    <div>
      <V3Header />
      <div className="border-b border-border/40">
        <div className="flex items-center">
          {label && (
          <div className="shrink-0 pl-5 flex items-baseline pt-1 pb-3">
            <span className={`text-[14px] font-semibold leading-none ${label.color}`}>
              {label.text}
            </span>
          </div>
        )}
        <div
          className="overflow-x-auto no-scrollbar flex-1"
          onClick={() => setIdx((i) => (i + 1) % states.length)}
        >
          <div className={`flex items-baseline gap-5 whitespace-nowrap pr-5 pt-1 pb-3 ${label ? "pl-4" : "pl-5"}`}>
            {DEMO_TICKERS.map((t) => (
              <span key={t.symbol} className="shrink-0 text-[14px] leading-none">
                <span className="font-semibold text-foreground">{t.symbol}</span>
                {" "}
                <span className="tabular-nums font-medium text-muted-foreground">{t.price}</span>
                {" "}
                <span className={`tabular-nums font-semibold ${t.gain ? "text-gain" : "text-loss"}`}>
                  {t.change}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="shrink-0 pr-4 pl-2 pb-2 pt-1 text-muted-foreground/40">
          <ChevronLeft size={16} strokeWidth={2} className="-rotate-90" />
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────
const variations = [
  { id: 1, label: "Bold Display", sublabel: "Large, confident, ring-accented", component: HeaderV5, fullWidth: false },
  { id: 2, label: "Header + Ticker Tape", sublabel: "Scrollable prices, expand chevron", component: TickerTapeV1, fullWidth: true },
  { id: 3, label: "Header + Ticker + Status", sublabel: "Market open / after-hours / closed", component: TickerTapeV2, fullWidth: true },
];

export default function ExploreHeaders() {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* Page header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-5">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[19px] font-semibold text-foreground">
            Header Design
          </h1>
          <p className="text-[14px] text-muted-foreground">
            3 variations — header, ticker tape
          </p>
        </div>
      </div>

      <div className="mx-5 h-px bg-border/60" />

      {/* Variations */}
      <div className="flex-1 space-y-10 pt-5 pb-10">
        {variations.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
          >
            {/* Label */}
            <div className="mb-2 flex items-baseline gap-2 px-5">
              <span className="text-[13px] tabular-nums font-semibold text-muted-foreground/50">
                {String(v.id).padStart(2, "0")}
              </span>
              <span className="text-[15px] font-semibold text-foreground/80">
                {v.label}
              </span>
              <span className="text-[13px] text-muted-foreground/40">
                {v.sublabel}
              </span>
            </div>

            {/* Header preview */}
            {v.fullWidth ? (
              <div className="border-y border-border/50">
                <v.component />
              </div>
            ) : (
              <div className="mx-5 overflow-hidden rounded-xl border border-border/50 bg-card/40">
                <v.component />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
