"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useAI } from "@/contexts/ai-context";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { type TickerItem } from "@/components/ticker";
import { getETFInfo } from "../../shared-components/mock-data";
import { cn } from "@/lib/utils";

import { StockHeader } from "../../shared-components/stock-header";
import { StockHero } from "../../shared-components/stock-hero";
import { BuySellBar } from "../../shared-components/buy-sell-bar";
import { type StockTab } from "../../shared-components/stock-tabs";

// Tab: Overview
import { PositionCard } from "../../shared-components/position-card";
import { AIBriefingSection } from "../../shared-components/ai-briefing";
import { Performance } from "../../shared-components/performance";
import { KeyMetrics } from "../../shared-components/key-metrics";
import { SimilarStocks } from "../../shared-components/similar-stocks";
import AboutSection from "../../shared-components/about";
import { MarketDepth } from "../../shared-components/market-depth";

// Tab: Revenue
import RevenueTab from "../../shared-components/revenue";

// Tab: Technicals
import { Technicals } from "../../shared-components/technicals";

// Tab: News
import { NewsEvents } from "../../shared-components/news-events";

// Tab: Ownership
import { Ownership } from "../../shared-components/ownership";

// Tab: Options (data only — no separate component imports needed)

// Analyst Ratings
import { AnalystRatings } from "../../shared-components/analyst-ratings";

// Tab: My Orders
import MyOrdersTab from "../../shared-components/my-orders";

// ─── ETF-specific tab list ────────────────────────────────────────────────────

const ETF_TABS = [
  "Overview",
  "Revenue",
  "Technicals",
  "Ownership",
  "News",
  "Options",
  "My Orders",
] as const satisfies readonly StockTab[];

type ETFTab = (typeof ETF_TABS)[number];

function ETFTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ETFTab;
  onTabChange: (tab: ETFTab) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
  }, [activeTab]);

  return (
    <div className="border-b border-border/50">
      <div ref={scrollRef} className="no-scrollbar flex gap-0.5 overflow-x-auto px-3">
        {ETF_TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              ref={active ? activeRef : undefined}
              onClick={() => onTabChange(tab)}
              className={cn(
                "relative shrink-0 whitespace-nowrap px-3 pb-3 pt-2 text-[14px] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {tab}
              {active && (
                <motion.div
                  layoutId="etf-tab-underline"
                  className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── ETF About: AboutSection + fund metadata grid ────────────────────────────

function ETFAbout({ symbol, name }: { symbol: string; name: string }) {
  const meta = getETFInfo(symbol);
  return (
    <div>
      <AboutSection symbol={symbol} name={name} />
      <div className="px-5 pb-5 -mt-1">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border/30 pt-4">
          <div>
            <p className="text-[12px] text-muted-foreground">Index Tracked</p>
            <p className="mt-0.5 text-[15px] font-semibold text-foreground">{meta.indexTracked}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">Issuer</p>
            <p className="mt-0.5 text-[15px] font-semibold text-foreground">{meta.issuer}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">Number of Holdings</p>
            <p className="mt-0.5 text-[15px] font-semibold text-foreground">{meta.holdings.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">Inception Date</p>
            <p className="mt-0.5 text-[15px] font-semibold text-foreground">{meta.inceptionYear}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ETF ticker data ─────────────────────────────────────────────────────────

function etfToTickerItem(symbol: string): TickerItem {
  const e = getETFInfo(symbol);
  return {
    symbol,
    name: e.name,
    price: e.price,
    change: e.change,
    changePercent: e.changePercent,
    category: "watchlist",
    type: "ETF",
    logo: e.logoAbbr,
    logoColor: e.logoColor,
    exchange: e.exchange,
  };
}

// ─── ETF Options Tab ─────────────────────────────────────────────────────────

type OptionExpiryFilter = "Daily Expiry" | "Weekly" | "Monthly" | "Quarterly";
const OPTION_EXPIRY_FILTERS: OptionExpiryFilter[] = ["Daily Expiry", "Weekly", "Monthly", "Quarterly"];

interface PopularOptionTemplate {
  strikeFactor: number;
  callOrPut: "CALL" | "PUT";
  oi: number;
  priceFactor: number;
  changePct: number;
}

const POPULAR_OPTION_TEMPLATES: Record<OptionExpiryFilter, PopularOptionTemplate[]> = {
  "Daily Expiry": [
    { strikeFactor: 1.01, callOrPut: "CALL", oi: 1_210_000, priceFactor: 0.052, changePct: 18.1 },
    { strikeFactor: 0.99, callOrPut: "PUT",  oi: 895_000,   priceFactor: 0.047, changePct: 14.6 },
    { strikeFactor: 1.03, callOrPut: "CALL", oi: 750_000,   priceFactor: 0.039, changePct: 22.6 },
    { strikeFactor: 0.97, callOrPut: "PUT",  oi: 620_000,   priceFactor: 0.034, changePct: -10.8 },
    { strikeFactor: 1.05, callOrPut: "CALL", oi: 290_000,   priceFactor: 0.026, changePct: 17.2 },
    { strikeFactor: 0.95, callOrPut: "PUT",  oi: 190_000,   priceFactor: 0.024, changePct: -7.4 },
    { strikeFactor: 1.08, callOrPut: "CALL", oi: 250_000,   priceFactor: 0.029, changePct: 13.1 },
  ],
  Weekly: [
    { strikeFactor: 1.02, callOrPut: "CALL", oi: 990_000, priceFactor: 0.061, changePct: 12.8 },
    { strikeFactor: 0.98, callOrPut: "PUT",  oi: 840_000, priceFactor: 0.056, changePct: 9.4 },
    { strikeFactor: 1.05, callOrPut: "CALL", oi: 610_000, priceFactor: 0.045, changePct: 16.2 },
    { strikeFactor: 0.95, callOrPut: "PUT",  oi: 530_000, priceFactor: 0.041, changePct: -6.8 },
    { strikeFactor: 1.08, callOrPut: "CALL", oi: 355_000, priceFactor: 0.036, changePct: 11.3 },
  ],
  Monthly: [
    { strikeFactor: 1.03, callOrPut: "CALL", oi: 780_000, priceFactor: 0.074, changePct: 8.7 },
    { strikeFactor: 0.97, callOrPut: "PUT",  oi: 690_000, priceFactor: 0.070, changePct: 6.1 },
    { strikeFactor: 1.10, callOrPut: "CALL", oi: 470_000, priceFactor: 0.054, changePct: 9.9 },
    { strikeFactor: 0.90, callOrPut: "PUT",  oi: 410_000, priceFactor: 0.051, changePct: -4.4 },
    { strikeFactor: 1.15, callOrPut: "CALL", oi: 305_000, priceFactor: 0.043, changePct: 7.6 },
  ],
  Quarterly: [
    { strikeFactor: 1.05, callOrPut: "CALL", oi: 620_000, priceFactor: 0.092, changePct: 7.1 },
    { strikeFactor: 0.95, callOrPut: "PUT",  oi: 560_000, priceFactor: 0.087, changePct: 5.2 },
    { strikeFactor: 1.12, callOrPut: "CALL", oi: 380_000, priceFactor: 0.063, changePct: 8.6 },
    { strikeFactor: 0.88, callOrPut: "PUT",  oi: 335_000, priceFactor: 0.058, changePct: -3.8 },
  ],
};

function formatOptionOI(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `${value}`;
}

function mockOI(price: number, sym: string) {
  let h = 0;
  for (let i = 0; i < sym.length; i++) h = (Math.imul(31, h) + sym.charCodeAt(i)) | 0;
  let s = Math.abs(h) % 2147483647 || 1;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const base = Math.round(price * 80);
  const callOI = base + Math.round(rand() * base * 0.6);
  const putOI  = Math.round(callOI * (0.4 + rand() * 0.35));
  return { callOI, putOI, pcr: +(putOI / callOI).toFixed(2) };
}
function fmtOI(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return n.toLocaleString();
  return String(n);
}
function mockFutures(price: number, sym: string) {
  let h = 0;
  for (let i = 0; i < sym.length; i++) h = (Math.imul(17, h) + sym.charCodeAt(i)) | 0;
  let s = Math.abs(h) % 2147483647 || 1;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  return [
    { expiry: "28 Apr '26", price: +(price * (1 + (rand() - 0.48) * 0.006)).toFixed(2), pct: +((rand() - 0.45) * 6).toFixed(2) },
    { expiry: "26 May '26", price: +(price * (1 + (rand() - 0.46) * 0.008)).toFixed(2), pct: +((rand() - 0.44) * 6).toFixed(2) },
    { expiry: "25 Jun '26", price: +(price * (1 + (rand() - 0.44) * 0.01)).toFixed(2),  pct: +((rand() - 0.43) * 6).toFixed(2) },
  ];
}

function OIInfoDrawer({ open, onClose, putOI, callOI, pcr }: { open: boolean; onClose: () => void; putOI: number; callOI: number; pcr: number }) {
  const fmtN = (n: number) => n.toLocaleString("en-US");
  const sentiment = pcr > 1 ? "bearish" : pcr < 0.7 ? "bullish" : "neutral";
  const sentimentColor = sentiment === "bullish" ? "text-emerald-500" : sentiment === "bearish" ? "text-red-500" : "text-amber-500";
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[85dvh] flex flex-col inset-x-0 mx-auto max-w-[430px]">
        <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 rounded-full bg-border" /></div>
        <div className="px-5 pt-3 pb-4 border-b border-border/40 shrink-0 flex items-start justify-between gap-3">
          <p className="text-[18px] font-bold text-foreground">Open Interest (OI)</p>
          <button onClick={onClose} className="rounded-full p-1 -mr-1 -mt-0.5 active:bg-muted/50 shrink-0"><X size={20} className="text-foreground" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          <p className="text-[14px] text-muted-foreground leading-relaxed">Open Interest is the total number of outstanding option contracts that have not been settled. Higher OI means more market participation and liquidity in that strike.</p>
          <div className="rounded-2xl bg-muted/40 p-4 space-y-3">
            <div className="flex items-center justify-between"><p className="text-[13px] text-muted-foreground">Total Call OI</p><p className="text-[15px] font-bold text-foreground tabular-nums">{fmtN(callOI)}</p></div>
            <div className="h-px bg-border/40" />
            <div className="flex items-center justify-between"><p className="text-[13px] text-muted-foreground">Total Put OI</p><p className="text-[15px] font-bold text-foreground tabular-nums">{fmtN(putOI)}</p></div>
            <div className="h-px bg-border/40" />
            <div className="flex items-center justify-between"><p className="text-[13px] text-muted-foreground">Put:Call Ratio</p><p className={cn("text-[15px] font-bold tabular-nums", sentimentColor)}>{pcr} · {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</p></div>
          </div>
          <div className="space-y-3">
            <p className="text-[13px] font-semibold text-foreground uppercase tracking-wide">How to read this</p>
            {[
              { label: "PCR > 1", desc: "More puts than calls — market participants are buying more downside protection. Often seen as bearish." },
              { label: "PCR < 0.7", desc: "More calls than puts — market participants are positioned for upside. Often seen as bullish." },
              { label: "PCR ≈ 0.7–1", desc: "Roughly balanced. Market has no strong directional bias." },
            ].map((row) => (
              <div key={row.label} className="rounded-xl bg-muted/30 px-4 py-3">
                <p className="text-[13px] font-semibold text-foreground mb-0.5">{row.label}</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{row.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ETFOptionsTab({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const router = useRouter();
  const [expiryFilter, setExpiryFilter] = useState<OptionExpiryFilter>("Daily Expiry");
  const [oiDrawerOpen, setOiDrawerOpen] = useState(false);

  const rows = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const baseDate =
      expiryFilter === "Daily Expiry" ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : expiryFilter === "Weekly" ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + (5 - now.getDay()))
      : expiryFilter === "Monthly" ? new Date(now.getFullYear(), now.getMonth() + 1, 0)
      : new Date(now.getFullYear(), now.getMonth() + 3, 0);

    return POPULAR_OPTION_TEMPLATES[expiryFilter].map((t, i) => {
      const strike = Math.round(price * t.strikeFactor * 2) / 2;
      const optionPrice = +(price * t.priceFactor).toFixed(2);
      const changeAbs = +(optionPrice * t.changePct / 100).toFixed(2);
      const expiryLabel = `${months[baseDate.getMonth()]} ${pad(baseDate.getDate())}`;
      const expiryDate = `${baseDate.getFullYear()}-${pad(baseDate.getMonth() + 1)}-${pad(baseDate.getDate())}`;
      return {
        id: `${expiryFilter}-${i}`,
        underlyingLabel: price.toFixed(2),
        optionLabel: `${expiryLabel} ${strike} ${t.callOrPut}`,
        oiLabel: formatOptionOI(t.oi),
        optionPriceLabel: `$${optionPrice.toFixed(2)}`,
        changeLabel: `${changeAbs >= 0 ? "+" : ""}$${Math.abs(changeAbs).toFixed(2)} (${t.changePct >= 0 ? "+" : ""}${t.changePct.toFixed(1)}%)`,
        positive: t.changePct >= 0,
        strikeValue: strike,
        side: t.callOrPut.toLowerCase(),
        expiryDate,
        ltp: optionPrice,
      };
    });
  }, [expiryFilter, price]);

  const shortName = name.replace(/\b(ETF|Trust|Fund|Inc\.?|Corp\.?)\b/gi, "").replace(/\s+/g, " ").trim().split(" ").slice(0, 2).join(" ");
  const oi = useMemo(() => mockOI(price, symbol), [price, symbol]);
  const futures = useMemo(() => mockFutures(price, symbol), [price, symbol]);

  return (
    <div className="flex min-h-full flex-col pb-6">
      {/* Header */}
      <div className="border-b border-border/60 px-4 pb-5 pt-4">
        <h2 className="text-[20px] font-semibold tracking-[-0.3px] text-foreground">Option Chain and Prices</h2>
        <p className="mt-2 max-w-[360px] text-[14px] leading-[1.38] text-muted-foreground">
          Explore options data like calls, puts, and strike prices. Understand market expectations for future price movements.
        </p>
        <Button
          onClick={() => router.push(`/options-chain/${encodeURIComponent(symbol)}`)}
          className="mt-4 h-12 w-full rounded-[10px] bg-black text-[16px] font-medium text-white hover:bg-black/95"
        >
          Option Chain
        </Button>
      </div>

      {/* OI Summary */}
      <div className="border-b border-border/60 px-4 py-5">
        <h3 className="mb-4 flex items-center gap-2 text-[17px] font-semibold tracking-[-0.3px] text-foreground">
          Open Interest (OI)
          <button onClick={() => setOiDrawerOpen(true)} className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground active:opacity-60">i</button>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[13px] text-muted-foreground">Total Put OI</p>
            <p className="mt-1 text-[20px] font-semibold tracking-[-0.4px]">{fmtOI(oi.putOI)}</p>
          </div>
          <div className="text-center">
            <p className="text-[13px] text-muted-foreground">Put:Call ratio</p>
            <p className="mt-1 text-[20px] font-semibold tracking-[-0.4px]">{oi.pcr}</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-muted-foreground">Total Call OI</p>
            <p className="mt-1 text-[20px] font-semibold tracking-[-0.4px]">{fmtOI(oi.callOI)}</p>
          </div>
        </div>
      </div>
      <OIInfoDrawer open={oiDrawerOpen} onClose={() => setOiDrawerOpen(false)} putOI={oi.putOI} callOI={oi.callOI} pcr={oi.pcr} />

      {/* Top Futures */}
      <div className="border-b border-border/60 px-4 py-5">
        <h3 className="mb-4 text-[17px] font-semibold tracking-[-0.3px] text-foreground">Futures Contracts</h3>
        <div className="grid grid-cols-2 gap-3">
          {futures.map((fut) => (
            <div key={fut.expiry} className="rounded-2xl border border-border/60 p-4">
              <p className="text-[15px] font-semibold tracking-[-0.3px]">
                {shortName} <span className="font-bold">Fut</span>
              </p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{fut.expiry}</p>
              <p className="mt-4 text-[18px] font-semibold tracking-[-0.4px]">
                ${fut.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={cn("mt-0.5 text-[13px] font-medium", fut.pct >= 0 ? "text-gain" : "text-loss")}>
                {fut.pct >= 0 ? "+" : ""}{fut.pct.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular options section */}
      <div className="px-4 pt-5">
        <h3 className="text-[20px] font-semibold tracking-[-0.4px] text-foreground">Popular {shortName} Options</h3>
      </div>

      {/* Expiry filter pills */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 pt-4">
        {OPTION_EXPIRY_FILTERS.map((filter) => {
          const active = filter === expiryFilter;
          return (
            <button
              key={filter}
              onClick={() => setExpiryFilter(filter)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold tracking-[-0.26px] transition-colors",
                active ? "bg-[#2a2a2a] text-white" : "bg-muted text-foreground",
              )}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Options rows */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[360px] px-4">
          <div className="grid grid-cols-[minmax(0,1fr)_72px_132px] border-b border-border/70 pb-3 text-[12px] uppercase tracking-[0.04em] text-muted-foreground">
            <span>Options</span>
            <span className="text-right">OI</span>
            <span className="text-right">Opt. Price</span>
          </div>

          {rows.map((row) => (
            <button
              key={row.id}
              onClick={() => {
                const params = new URLSearchParams({
                  strike: row.strikeValue.toFixed(1),
                  side: row.side,
                  expiry: row.expiryDate,
                  ltp: row.ltp.toFixed(2),
                });
                router.push(`/options-chain/${encodeURIComponent(symbol)}/leg?${params.toString()}`);
              }}
              className="grid w-full grid-cols-[minmax(0,1fr)_72px_132px] items-center border-b border-border/60 py-4 text-left text-[14px] tracking-[-0.28px] text-foreground transition-opacity active:opacity-70"
            >
              <div className="flex min-w-0 items-center gap-3 pr-3">
                <div className="h-12 w-1 shrink-0 rounded-full bg-foreground/80" />
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                    Underlying {row.underlyingLabel}
                  </p>
                  <p className="truncate text-[17px] font-semibold tracking-[-0.34px] text-foreground">
                    {row.optionLabel}
                  </p>
                </div>
              </div>
              <span className="whitespace-nowrap text-right text-[15px] font-medium">{row.oiLabel}</span>
              <span className="whitespace-nowrap text-right text-[15px] font-medium">
                {row.optionPriceLabel}
                <br />
                <span className={cn("text-[13px]", row.positive ? "text-gain" : "text-loss")}>
                  {row.changeLabel}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ETFPage() {
  const router = useRouter();
  const params = useParams();
  const SYMBOL = (typeof params?.symbol === "string" ? params.symbol : "QQQ").toUpperCase();
  const { setAISource } = useAI();

  const ticker: TickerItem = etfToTickerItem(SYMBOL);

  useEffect(() => {
    setAISource({ type: "stock-detail", symbol: SYMBOL, name: ticker.name });
  }, [setAISource, ticker.name, SYMBOL]);

  const [activeTab, setActiveTab] = useState<ETFTab>("Overview");
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const progress = Math.min(1, scrollTop / 200);
    setScrollProgress(progress);
  }, []);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <StockHeader
        ticker={ticker}
        scrollProgress={scrollProgress}
        isWatchlisted={isWatchlisted}
        onToggleWatchlist={() => setIsWatchlisted(!isWatchlisted)}
        onShare={() => {
          if (navigator.share) {
            navigator.share({ title: `${ticker.name} (${ticker.symbol})`, url: window.location.href });
          }
        }}
        onCompare={() => router.push(`/compare?symbols=${SYMBOL}`)}
        onSetAlert={() => router.push(`/stocks/${SYMBOL}/alerts`)}
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar flex-1 overflow-y-auto"
      >
        <StockHero ticker={ticker} />

        <ETFTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="min-h-[400px]">
          {activeTab === "Overview" && (
            <div>
              <PositionCard symbol={SYMBOL} />
              <Divider />
              <KeyMetrics symbol={SYMBOL} />
              <Divider />
              <Performance symbol={SYMBOL} />
              <Divider />
              <ETFAbout symbol={SYMBOL} name={ticker.name} />
              <Divider />
              <SimilarStocks symbol={SYMBOL} />
              <Divider />
              <AIBriefingSection symbol={SYMBOL} />
              <Divider />
              <AnalystRatings symbol={SYMBOL} />
              <Divider />
              <MarketDepth symbol={SYMBOL} currentPrice={ticker.price} />
            </div>
          )}

          {activeTab === "Revenue" && (
            <div>
              <RevenueTab symbol={SYMBOL} />
            </div>
          )}

          {activeTab === "Technicals" && (
            <div>
              <Technicals symbol={SYMBOL} />
            </div>
          )}

          {activeTab === "Ownership" && (
            <div>
              <Ownership symbol={SYMBOL} />
            </div>
          )}

          {activeTab === "News" && (
            <div>
              <NewsEvents symbol={SYMBOL} />
            </div>
          )}

          {activeTab === "Options" && (
            <ETFOptionsTab symbol={SYMBOL} name={ticker.name} price={ticker.price} />
          )}

          {activeTab === "My Orders" && (
            <div>
              <MyOrdersTab symbol={SYMBOL} />
            </div>
          )}

          <div className="h-20" />
        </div>
      </div>

      <BuySellBar
        symbol={SYMBOL}
        onBuy={() => {}}
        onSell={() => {}}
      />

      <HomeIndicator />
    </div>
  );
}

function Divider() {
  return <div className="mx-4 border-t border-border/30" />;
}
