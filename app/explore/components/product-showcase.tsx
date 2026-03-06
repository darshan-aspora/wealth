"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════
   TAB DATA
   ═══════════════════════════════════════════════════════════ */

const tabs = [
  { id: "stocks", label: "Stocks" },
  { id: "etfs", label: "ETFs" },
  { id: "options", label: "Options" },
  { id: "advisory", label: "Advisory Baskets" },
  { id: "algo", label: "Algo Strategies" },
];

/* ═══════════════════════════════════════════════════════════
   STOCKS DATA
   ═══════════════════════════════════════════════════════════ */

const stockCategories: Record<string, { symbol: string; name: string; price: string; change: string; positive: boolean }[]> = {
  "Magnificent 7": [
    { symbol: "AAPL", name: "Apple", price: "$224.32", change: "+1.2%", positive: true },
    { symbol: "NVDA", name: "NVIDIA", price: "$891.04", change: "+3.2%", positive: true },
    { symbol: "MSFT", name: "Microsoft", price: "$428.60", change: "+0.8%", positive: true },
    { symbol: "AMZN", name: "Amazon", price: "$186.40", change: "+1.6%", positive: true },
    { symbol: "GOOG", name: "Alphabet", price: "$175.20", change: "+0.5%", positive: true },
    { symbol: "META", name: "Meta", price: "$502.30", change: "+2.4%", positive: true },
  ],
  "AI": [
    { symbol: "NVDA", name: "NVIDIA", price: "$891.04", change: "+3.2%", positive: true },
    { symbol: "MSFT", name: "Microsoft", price: "$428.60", change: "+0.8%", positive: true },
    { symbol: "PLTR", name: "Palantir", price: "$72.40", change: "+4.1%", positive: true },
    { symbol: "AMD", name: "AMD", price: "$168.20", change: "+1.8%", positive: true },
    { symbol: "SNOW", name: "Snowflake", price: "$162.50", change: "-1.4%", positive: false },
    { symbol: "SMCI", name: "Super Micro", price: "$842.10", change: "+5.6%", positive: true },
  ],
  "EV": [
    { symbol: "TSLA", name: "Tesla", price: "$178.50", change: "-2.1%", positive: false },
    { symbol: "RIVN", name: "Rivian", price: "$18.20", change: "+3.8%", positive: true },
    { symbol: "LCID", name: "Lucid", price: "$4.82", change: "-1.6%", positive: false },
    { symbol: "NIO", name: "NIO", price: "$7.40", change: "+2.2%", positive: true },
    { symbol: "LI", name: "Li Auto", price: "$32.60", change: "+1.4%", positive: true },
    { symbol: "XPEV", name: "XPeng", price: "$12.80", change: "+0.9%", positive: true },
  ],
  "Energy": [
    { symbol: "XOM", name: "Exxon Mobil", price: "$118.40", change: "+0.6%", positive: true },
    { symbol: "CVX", name: "Chevron", price: "$162.80", change: "+0.4%", positive: true },
    { symbol: "COP", name: "ConocoPhillips", price: "$128.60", change: "-0.8%", positive: false },
    { symbol: "SLB", name: "Schlumberger", price: "$52.40", change: "+1.2%", positive: true },
    { symbol: "EOG", name: "EOG Resources", price: "$134.20", change: "+0.3%", positive: true },
    { symbol: "OXY", name: "Occidental", price: "$68.40", change: "-0.5%", positive: false },
  ],
};

const stockCategoryKeys = Object.keys(stockCategories);

const stockProps = [
  "Fractional shares from $1",
  "24\u00d75 extended-hours trading",
  "Real-time prices, zero delay",
];

/* ═══════════════════════════════════════════════════════════
   ETF DATA
   ═══════════════════════════════════════════════════════════ */

const etfByCategory: Record<string, { symbol: string; name: string; price: string; change: string; positive: boolean }[]> = {
  "Index": [
    { symbol: "VOO", name: "S&P 500", price: "$532.40", change: "+22.4%", positive: true },
    { symbol: "QQQ", name: "Nasdaq 100", price: "$498.20", change: "+31.2%", positive: true },
    { symbol: "VTI", name: "Total Market", price: "$268.50", change: "+20.8%", positive: true },
    { symbol: "DIA", name: "Dow Jones", price: "$412.60", change: "+16.4%", positive: true },
  ],
  "Thematic": [
    { symbol: "ARKK", name: "Innovation", price: "$52.40", change: "+18.4%", positive: true },
    { symbol: "ICLN", name: "Clean Energy", price: "$14.80", change: "+6.2%", positive: true },
    { symbol: "BOTZ", name: "AI & Robotics", price: "$32.40", change: "+24.6%", positive: true },
    { symbol: "LIT", name: "Lithium", price: "$48.20", change: "-4.2%", positive: false },
  ],
  "Dividend": [
    { symbol: "SCHD", name: "US Dividend", price: "$82.30", change: "+8.6%", positive: true },
    { symbol: "VYM", name: "High Yield", price: "$118.40", change: "+10.2%", positive: true },
    { symbol: "DGRO", name: "Div Growth", price: "$58.60", change: "+12.8%", positive: true },
    { symbol: "HDV", name: "High Dividend", price: "$108.20", change: "+7.4%", positive: true },
  ],
  "Sector": [
    { symbol: "SOXX", name: "Semiconductors", price: "$248.60", change: "+28.4%", positive: true },
    { symbol: "XLF", name: "Financials", price: "$42.80", change: "+14.2%", positive: true },
    { symbol: "XLE", name: "Energy", price: "$88.40", change: "+8.6%", positive: true },
    { symbol: "XLK", name: "Technology", price: "$212.40", change: "+26.8%", positive: true },
  ],
};

const etfCategoryKeys = Object.keys(etfByCategory);

const etfProps = [
  "Thematic ETFs \u2014 AI, EV, Dividends, more",
  "Perfect for SIPs \u2014 automate monthly",
  "Lower risk than individual stocks",
];

/* ═══════════════════════════════════════════════════════════
   OPTIONS DATA
   ═══════════════════════════════════════════════════════════ */

const optionsByUnderlying: Record<string, { contract: string; type: string; premium: string; change: string; positive: boolean; volume: string }[]> = {
  "AAPL": [
    { contract: "$220 Call", type: "Call", premium: "$6.40", change: "+12.4%", positive: true, volume: "12.8K" },
    { contract: "$225 Call", type: "Call", premium: "$3.80", change: "+8.2%", positive: true, volume: "18.6K" },
    { contract: "$230 Call", type: "Call", premium: "$1.90", change: "-4.6%", positive: false, volume: "24.3K" },
    { contract: "$220 Put", type: "Put", premium: "$2.10", change: "-6.8%", positive: false, volume: "8.4K" },
  ],
  "TSLA": [
    { contract: "$180 Call", type: "Call", premium: "$8.20", change: "+18.6%", positive: true, volume: "32.1K" },
    { contract: "$175 Call", type: "Call", premium: "$11.40", change: "+14.2%", positive: true, volume: "28.4K" },
    { contract: "$185 Call", type: "Call", premium: "$5.60", change: "+22.8%", positive: true, volume: "16.8K" },
    { contract: "$170 Put", type: "Put", premium: "$3.40", change: "-8.4%", positive: false, volume: "12.2K" },
  ],
  "NVDA": [
    { contract: "$900 Call", type: "Call", premium: "$24.80", change: "+16.2%", positive: true, volume: "42.6K" },
    { contract: "$880 Call", type: "Call", premium: "$38.60", change: "+12.8%", positive: true, volume: "36.2K" },
    { contract: "$920 Call", type: "Call", premium: "$14.20", change: "+24.6%", positive: true, volume: "28.8K" },
    { contract: "$850 Put", type: "Put", premium: "$12.40", change: "-5.2%", positive: false, volume: "18.4K" },
  ],
  "SPY": [
    { contract: "$520 Call", type: "Call", premium: "$8.60", change: "+6.4%", positive: true, volume: "86.2K" },
    { contract: "$530 Call", type: "Call", premium: "$4.20", change: "+10.8%", positive: true, volume: "64.8K" },
    { contract: "$510 Put", type: "Put", premium: "$3.80", change: "-4.2%", positive: false, volume: "52.4K" },
    { contract: "$525 Call", type: "Call", premium: "$6.40", change: "+8.6%", positive: true, volume: "48.6K" },
  ],
};

const optionsUnderlyingKeys = Object.keys(optionsByUnderlying);

const optionsProps = [
  "Levels 1\u20133 \u2014 grow at your pace",
  "In-app Options Academy \u2014 7 chapters",
  "$0.20 per contract",
];

/* ═══════════════════════════════════════════════════════════
   ADVISORY BASKETS DATA
   ═══════════════════════════════════════════════════════════ */

const advisoryByRisk: Record<string, { name: string; strategy: string; cagr: string; drawdown: string; min: string }[]> = {
  "Conservative": [
    { name: "Steady Compounder", strategy: "Large-cap quality + dividends", cagr: "+14.2%", drawdown: "-8.4%", min: "$100" },
    { name: "Dividend Shield", strategy: "High-yield defensive picks", cagr: "+11.8%", drawdown: "-6.2%", min: "$100" },
  ],
  "Moderate": [
    { name: "Balanced Alpha", strategy: "Multi-factor, sector-rotated", cagr: "+21.8%", drawdown: "-12.6%", min: "$100" },
    { name: "Sector Rotation", strategy: "Momentum across sectors", cagr: "+18.4%", drawdown: "-10.8%", min: "$250" },
  ],
  "Aggressive": [
    { name: "High Conviction", strategy: "Concentrated growth picks", cagr: "+34.1%", drawdown: "-18.2%", min: "$250" },
    { name: "Performance Plus", strategy: "High-alpha, perf-fee only", cagr: "+28.6%", drawdown: "-15.4%", min: "$500" },
  ],
};

const advisoryRiskKeys = Object.keys(advisoryByRisk);

const advisoryProps = [
  "DIFC Regulated",
  "Bloomberg-powered data",
  "Auto-rebalanced quarterly",
];

/* ═══════════════════════════════════════════════════════════
   ALGO STRATEGIES DATA
   ═══════════════════════════════════════════════════════════ */

const algoByType: Record<string, { name: string; backtest: string; drawdown: string; fee: string; users: number }[]> = {
  "Momentum": [
    { name: "Momentum Capture", backtest: "+22.4%", drawdown: "-6.1%", fee: "$25/mo", users: 342 },
    { name: "Trend Follower", backtest: "+16.2%", drawdown: "-9.4%", fee: "$20/mo", users: 456 },
  ],
  "Volatility": [
    { name: "Volatility Harvest", backtest: "+18.8%", drawdown: "-4.8%", fee: "$30/mo", users: 218 },
    { name: "Mean Reversion", backtest: "+14.6%", drawdown: "-5.2%", fee: "$20/mo", users: 189 },
  ],
  "Income": [
    { name: "Dividend Capture", backtest: "+11.4%", drawdown: "-3.8%", fee: "$20/mo", users: 624 },
    { name: "Covered Call Income", backtest: "+13.2%", drawdown: "-4.4%", fee: "$25/mo", users: 312 },
  ],
  "Event-Driven": [
    { name: "Earnings Momentum", backtest: "+26.1%", drawdown: "-11.2%", fee: "$30/mo", users: 156 },
    { name: "IPO Alpha", backtest: "+32.4%", drawdown: "-14.8%", fee: "$35/mo", users: 98 },
  ],
};

const algoTypeKeys = Object.keys(algoByType);

const algoProps = [
  "10+ hedged strategies",
  "Flat fee from $20 \u2014 no profit sharing",
  "1-tap activate/deactivate",
];

/* ═══════════════════════════════════════════════════════════
   SHARED: Gradient ticker card
   ═══════════════════════════════════════════════════════════ */

function GradientCard({ top, sub, value, change, positive }: { top: string; sub: string; value: string; change: string; positive: boolean }) {
  return (
    <div
      className={cn(
        "relative shrink-0 rounded-2xl border px-3.5 py-3 w-[140px] overflow-hidden bg-background",
        positive ? "border-gain/20" : "border-loss/20"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-[0.04]",
          positive
            ? "bg-gradient-to-br from-gain via-gain/50 to-transparent"
            : "bg-gradient-to-br from-loss via-loss/50 to-transparent"
        )}
      />
      <div className="relative">
        <p className="font-bold text-foreground text-sm">{top}</p>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">{sub}</p>
        <p className="font-mono text-foreground text-sm mt-2">{value}</p>
        <p className={cn("font-mono text-sm font-medium mt-0.5", positive ? "text-gain" : "text-loss")}>
          {change}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED: Value prop bullet list
   ═══════════════════════════════════════════════════════════ */

function ValueProps({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((item) => (
        <li key={item} className="text-muted-foreground text-[15px] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED: Category pill bar
   ═══════════════════════════════════════════════════════════ */

function PillBar({ keys, active, onSelect }: { keys: string[]; active: string; onSelect: (k: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => onSelect(k)}
          className={cn(
            "text-sm py-1.5 px-3.5 rounded-full whitespace-nowrap border transition-colors",
            active === k
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground bg-background"
          )}
        >
          {k}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD 1 — STOCKS
   ═══════════════════════════════════════════════════════════ */

function StockCard({ sectionRef }: { sectionRef: (el: HTMLDivElement | null) => void }) {
  const [activeCat, setActiveCat] = useState(stockCategoryKeys[0]);
  const stocks = stockCategories[activeCat];

  return (
    <div id="stocks" ref={sectionRef} className="border border-border rounded-xl overflow-hidden bg-background scroll-mt-14">
      <div className="bg-muted p-4 pb-5">
        <PillBar keys={stockCategoryKeys} active={activeCat} onSelect={setActiveCat} />
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar mt-3 -mx-1 px-1">
          {stocks.map((s) => (
            <GradientCard key={s.symbol} top={s.symbol} sub={s.name} value={s.price} change={s.change} positive={s.positive} />
          ))}
        </div>
      </div>
      <div className="p-4">
        <p className="text-muted-foreground text-xs font-medium">Stocks</p>
        <h3 className="text-xl font-bold text-foreground mt-2">Own a piece of the world&apos;s biggest companies</h3>
        <ValueProps items={stockProps} />
        <button className="border border-primary text-primary py-2.5 rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors mt-4 w-full">
          Browse Stocks
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD 2 — ETFs
   ═══════════════════════════════════════════════════════════ */

function ETFCard({ sectionRef }: { sectionRef: (el: HTMLDivElement | null) => void }) {
  const [activeCat, setActiveCat] = useState(etfCategoryKeys[0]);
  const etfs = etfByCategory[activeCat];

  return (
    <div id="etfs" ref={sectionRef} className="border border-border rounded-xl overflow-hidden bg-background scroll-mt-14">
      <div className="bg-muted p-4 pb-5">
        <PillBar keys={etfCategoryKeys} active={activeCat} onSelect={setActiveCat} />
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar mt-3 -mx-1 px-1">
          {etfs.map((e) => (
            <GradientCard key={e.symbol} top={e.symbol} sub={e.name} value={e.price} change={e.change} positive={e.positive} />
          ))}
        </div>
      </div>
      <div className="p-4">
        <p className="text-muted-foreground text-xs font-medium">ETFs</p>
        <h3 className="text-xl font-bold text-foreground mt-2">One tap. Entire markets.</h3>
        <ValueProps items={etfProps} />
        <button className="border border-primary text-primary py-2.5 rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors mt-4 w-full">
          Explore ETFs
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD 3 — OPTIONS
   ═══════════════════════════════════════════════════════════ */

function OptionsCard({ sectionRef }: { sectionRef: (el: HTMLDivElement | null) => void }) {
  const [activeUnderlying, setActiveUnderlying] = useState(optionsUnderlyingKeys[0]);
  const contracts = optionsByUnderlying[activeUnderlying];

  return (
    <div id="options" ref={sectionRef} className="border border-border rounded-xl overflow-hidden bg-background scroll-mt-14">
      <div className="bg-muted p-4 pb-5">
        <PillBar keys={optionsUnderlyingKeys} active={activeUnderlying} onSelect={setActiveUnderlying} />
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar mt-3 -mx-1 px-1">
          {contracts.map((c) => (
            <div
              key={c.contract}
              className={cn(
                "relative shrink-0 rounded-2xl border px-3.5 py-3 w-[140px] overflow-hidden bg-background",
                c.positive ? "border-gain/20" : "border-loss/20"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-[0.04]",
                  c.positive
                    ? "bg-gradient-to-br from-gain via-gain/50 to-transparent"
                    : "bg-gradient-to-br from-loss via-loss/50 to-transparent"
                )}
              />
              <div className="relative">
                <p className="font-bold text-foreground text-sm">{c.contract}</p>
                <p className={cn("text-xs mt-0.5 font-medium", c.type === "Call" ? "text-gain" : "text-loss")}>{c.type}</p>
                <p className="font-mono text-foreground text-sm mt-2">{c.premium}</p>
                <p className={cn("font-mono text-sm font-medium mt-0.5", c.positive ? "text-gain" : "text-loss")}>{c.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4">
        <p className="text-muted-foreground text-xs font-medium">Options</p>
        <h3 className="text-xl font-bold text-foreground mt-2">Amplify. Protect. Strategize.</h3>
        <ValueProps items={optionsProps} />
        <button className="border border-primary text-primary py-2.5 rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors mt-4 w-full">
          Learn &amp; Trade Options
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD 4 — ADVISORY BASKETS
   ═══════════════════════════════════════════════════════════ */

function AdvisoryCard({ sectionRef }: { sectionRef: (el: HTMLDivElement | null) => void }) {
  const [activeRisk, setActiveRisk] = useState(advisoryRiskKeys[0]);
  const baskets = advisoryByRisk[activeRisk];

  return (
    <div id="advisory" ref={sectionRef} className="border border-border rounded-xl overflow-hidden bg-background scroll-mt-14">
      <div className="bg-muted p-4 pb-5">
        <PillBar keys={advisoryRiskKeys} active={activeRisk} onSelect={setActiveRisk} />
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar mt-3 -mx-1 px-1">
          {baskets.map((b) => (
            <div key={b.name} className="relative shrink-0 rounded-2xl border border-gain/20 px-3.5 py-3 w-[160px] overflow-hidden bg-background">
              <div className="absolute inset-0 opacity-[0.04] bg-gradient-to-br from-gain via-gain/50 to-transparent" />
              <div className="relative">
                <p className="font-bold text-foreground text-sm">{b.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5 truncate">{b.strategy}</p>
                <p className="font-mono text-gain text-sm font-bold mt-2">{b.cagr} CAGR</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">Min {b.min}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4">
        <p className="text-muted-foreground text-xs font-medium">Advisory Baskets</p>
        <h3 className="text-xl font-bold text-foreground mt-2">Your fund manager. Your rules.</h3>
        <ValueProps items={advisoryProps} />
        <button className="border border-primary text-primary py-2.5 rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors mt-4 w-full">
          See All Baskets
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD 5 — ALGO STRATEGIES
   ═══════════════════════════════════════════════════════════ */

function AlgoCard({ sectionRef }: { sectionRef: (el: HTMLDivElement | null) => void }) {
  const [activeType, setActiveType] = useState(algoTypeKeys[0]);
  const strategies = algoByType[activeType];

  return (
    <div id="algo" ref={sectionRef} className="border border-border rounded-xl overflow-hidden bg-background scroll-mt-14">
      <div className="bg-muted p-4 pb-5">
        <PillBar keys={algoTypeKeys} active={activeType} onSelect={setActiveType} />
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar mt-3 -mx-1 px-1">
          {strategies.map((s) => (
            <div key={s.name} className="relative shrink-0 rounded-2xl border border-gain/20 px-3.5 py-3 w-[160px] overflow-hidden bg-background">
              <div className="absolute inset-0 opacity-[0.04] bg-gradient-to-br from-gain via-gain/50 to-transparent" />
              <div className="relative">
                <p className="font-bold text-foreground text-sm">{s.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{s.fee}</p>
                <p className="font-mono text-gain text-sm font-bold mt-2">{s.backtest}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">{s.users.toLocaleString()} users</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4">
        <p className="text-muted-foreground text-xs font-medium">Algo Strategies</p>
        <h3 className="text-xl font-bold text-foreground mt-2">The smartest way to trade</h3>
        <ValueProps items={algoProps} />
        <button className="border border-primary text-primary py-2.5 rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors mt-4 w-full">
          Explore All Strategies
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState("stocks");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isClickScrolling = useRef(false);

  /* ─── Intersection Observer — deferred to ensure refs are ready ─── */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const firstEl = sectionRefs.current[tabs[0].id];
    const scrollContainer = firstEl?.closest("main") as HTMLElement | null;
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        }
      },
      { root: scrollContainer, rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    tabs.forEach((t) => {
      const el = sectionRefs.current[t.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mounted]);

  /* ─── Center active tab in tab bar (horizontal only, no scrollIntoView) ─── */
  useEffect(() => {
    const btn = tabRefs.current[activeTab];
    const bar = tabBarRef.current;
    if (!btn || !bar) return;
    const scrollArea = bar.querySelector(".overflow-x-auto") as HTMLElement | null;
    if (!scrollArea) return;
    const scrollLeft = btn.offsetLeft - scrollArea.clientWidth / 2 + btn.offsetWidth / 2;
    scrollArea.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
  }, [activeTab]);

  /* ─── Click handler: scroll to section ─── */
  const handleTabClick = useCallback((id: string) => {
    setActiveTab(id);
    isClickScrolling.current = true;
    const el = document.getElementById(id);
    const scrollContainer = el?.closest("main") as HTMLElement | null;
    if (el && scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = elRect.top - containerRect.top + scrollContainer.scrollTop;
      const tabBarHeight = tabBarRef.current?.offsetHeight ?? 48;
      scrollContainer.scrollTo({
        top: offset - tabBarHeight,
        behavior: "smooth",
      });
      setTimeout(() => {
        isClickScrolling.current = false;
      }, 1000);
    }
  }, []);

  /* ─── Ref setter helper ─── */
  const setSectionRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      sectionRefs.current[id] = el;
    },
    []
  );

  const setTabRef = useCallback(
    (id: string) => (el: HTMLButtonElement | null) => {
      tabRefs.current[id] = el;
    },
    []
  );

  return (
    <section>
      {/* STICKY TAB BAR */}
      <div ref={tabBarRef} className="sticky top-0 z-40 bg-background border-b border-border">
        <div>
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                ref={setTabRef(tab.id)}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "py-3 px-4 whitespace-nowrap text-sm font-medium transition-colors flex items-center shrink-0",
                  activeTab === tab.id
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div className="py-6 space-y-4">
        <div className="px-4 space-y-4">
          <StockCard sectionRef={setSectionRef("stocks")} />
          <ETFCard sectionRef={setSectionRef("etfs")} />
          <OptionsCard sectionRef={setSectionRef("options")} />
          <AdvisoryCard sectionRef={setSectionRef("advisory")} />
          <AlgoCard sectionRef={setSectionRef("algo")} />
        </div>
      </div>
    </section>
  );
}
