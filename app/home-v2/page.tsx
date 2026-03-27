"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  LayoutGroup,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import {
  X, Bell, Search, ChevronDown, SlidersHorizontal,
  Compass, BarChart3, PieChart, Sparkles, Zap,
  Rocket, Users, FlaskConical, MessageCircle, Gift,
  Settings, Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HomeIndicator } from "@/components/iphone-frame";
import { ALL_TICKERS, formatPrice, isGain, EditSheet, type TickerItem } from "@/components/ticker";
import { SearchPlaceholder } from "@/components/header";
import { StoriesViewer, stories } from "@/components/stories-viewer";
import { ExploreFundedNotTraded } from "@/app/explore/versions/funded-not-traded";
import { ETFFundedNotTraded } from "@/app/explore/versions/etf-funded-not-traded";
import { USMarketsTab } from "@/app/market/components/us-markets-tab";
import { GlobalMarketsTab } from "@/app/market/components/global-markets-tab";
import { IndiaTab } from "@/app/market/components/india-tab";
import { UKTab } from "@/app/market/components/uk-tab";
import { NewsTab } from "@/app/market/components/news-tab";
import { CryptoTab } from "@/app/market/components/crypto-tab";
import { CommodityTab } from "@/app/market/components/commodity-tab";
import { ForexTab } from "@/app/market/components/forex-tab";
import { UAETab } from "@/app/market/components/uae-tab";
import { VixTab } from "@/app/market/components/vix-tab";
import { SettingsTab } from "@/app/market/components/settings-tab";

const DEFAULT_SYMBOLS = ["SPX", "NDX", "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA"];

const spotlightCards = [
  { id: "baskets", title: "Advisory Baskets", subtitle: "Curated by experts", icon: Sparkles },
  { id: "research", title: "Research Group", subtitle: "Join the conversation", icon: Users },
  { id: "options-launch", title: "Options Trading", subtitle: "Now live", icon: Rocket },
  { id: "community", title: "Community", subtitle: "Share your ideas", icon: MessageCircle },
  { id: "pipeline", title: "What's Next", subtitle: "On our roadmap", icon: FlaskConical },
  { id: "referral", title: "Invite Friends", subtitle: "Earn rewards", icon: Gift },
];

// ── Dark-themed ticker with live prices and arrows ──────────────────────
function useLiveTickers(tickers: TickerItem[]) {
  const [livePrices, setLivePrices] = useState<
    Map<string, { price: number; change: number; changePercent: number }>
  >(new Map());
  const baseRef = useRef<Map<string, TickerItem>>(new Map());

  useEffect(() => {
    const map = new Map<string, TickerItem>();
    tickers.forEach((t) => map.set(t.symbol, { ...t }));
    baseRef.current = map;
  }, [tickers]);

  const tick = useCallback(() => {
    setLivePrices((prev) => {
      const next = new Map(prev);
      baseRef.current.forEach((base, symbol) => {
        const current = next.get(symbol);
        const price = current?.price ?? base.price;
        const magnitude = price * (0.0001 + Math.random() * 0.0007);
        const delta = Math.random() > 0.5 ? magnitude : -magnitude;
        const newPrice = Math.max(0.01, price + delta);
        const totalChange = newPrice - (base.price - base.change);
        const totalPct = (totalChange / (base.price - base.change)) * 100;
        next.set(symbol, { price: newPrice, change: totalChange, changePercent: totalPct });
      });
      return next;
    });
  }, []);

  useEffect(() => {
    const initialTimeout = setTimeout(tick, 800);
    let timer: ReturnType<typeof setTimeout>;
    function scheduleTick() {
      const delay = 1500 + Math.random() * 1500;
      timer = setTimeout(() => { tick(); scheduleTick(); }, delay);
    }
    scheduleTick();
    return () => { clearTimeout(initialTimeout); clearTimeout(timer); };
  }, [tick]);

  return tickers.map((t) => {
    const live = livePrices.get(t.symbol);
    if (!live) return t;
    return { ...t, price: live.price, change: live.change, changePercent: live.changePercent };
  });
}

function DarkTicker({ selected, onSave }: { selected: string[]; onSave: (next: string[]) => void }) {
  const tickers = ALL_TICKERS.filter((t) => selected.includes(t.symbol));
  const liveTickers = useLiveTickers(tickers);

  if (tickers.length === 0) {
    return (
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="text-[14px] text-gray-400">No tickers selected</span>
        <EditSheet
          selected={selected}
          onSave={onSave}
          trigger={
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-gray-500 transition-colors active:bg-black/10">
              <Settings2 size={15} />
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      <div className="flex-1 overflow-x-auto no-scrollbar">
        <div className="flex items-baseline gap-5 whitespace-nowrap px-5 pt-4 pb-3 font-mono">
          {liveTickers.map((t) => {
            const gain = isGain(t);
            return (
              <span key={t.symbol} className="shrink-0 text-[14px] leading-none">
                <span className="font-semibold text-gray-800">{t.symbol}</span>
                {" "}
                <span className="tabular-nums font-medium text-gray-500">
                  {formatPrice(t.price)}
                </span>
                {" "}
                <span className={`tabular-nums font-semibold ${gain ? "text-gain" : "text-loss"}`}>
                  {gain ? "+" : "-"}{Math.abs(t.changePercent).toFixed(1)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 pr-4">
        <EditSheet
          selected={selected}
          onSave={onSave}
          trigger={
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-gray-500 transition-colors active:bg-black/10">
              <Settings2 size={15} />
            </button>
          }
        />
      </div>
    </div>
  );
}

// ── Bottom Nav (Home V2 — in-page tabs, not route links) ────────────────

type BottomTab = "explore" | "market" | "portfolio" | "advisory" | "levelup";

const homeV2Tabs: { id: BottomTab; label: string; icon: typeof Compass }[] = [
  { id: "explore", label: "Explore", icon: Compass },
  { id: "market", label: "Market", icon: BarChart3 },
  { id: "portfolio", label: "Portfolio", icon: PieChart },
  { id: "advisory", label: "Advisory", icon: Sparkles },
  { id: "levelup", label: "Level Up", icon: Zap },
];

// ── Explore sub-tabs (mirrors v1 explore) ───────────────────────────────

type ExploreTab = "equity" | "etf" | "options";

const exploreTabs: { id: ExploreTab; label: string }[] = [
  { id: "equity", label: "Stocks" },
  { id: "etf", label: "ETF" },
  { id: "options", label: "Options" },
];

// ── Market sub-tabs (mirrors standalone market page) ─────────────────

const MARKET_TABS = ["US", "Global", "VIX", "India", "UK", "News", "Crypto", "Commodity", "Forex", "UAE", "Customize"] as const;
type MarketTab = (typeof MARKET_TABS)[number];

function MarketView() {
  const [activeTab, setActiveTab] = useState<MarketTab>("US");

  return (
    <>
      {/* Market sub-tabs — sticky */}
      <div className="sticky top-0 z-20 border-b border-border/40 bg-background">
        <div className="no-scrollbar overflow-x-auto">
          <div className="flex gap-0.5 px-5">
            {MARKET_TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative whitespace-nowrap py-2.5 text-[16px] font-semibold transition-colors",
                  i === 0 ? "pr-3" : "px-3",
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {tab === "Customize" ? (
                  <span className="inline-flex items-center gap-1">
                    <Settings size={14} />
                    {tab}
                  </span>
                ) : tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="market-tab-indicator-v2"
                    className={cn(
                      "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                      i === 0 ? "left-0" : "left-3"
                    )}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "US" && <USMarketsTab />}
      {activeTab === "Global" && <GlobalMarketsTab />}
      {activeTab === "VIX" && <VixTab />}
      {activeTab === "India" && <IndiaTab />}
      {activeTab === "UK" && <UKTab />}
      {activeTab === "News" && <NewsTab />}
      {activeTab === "Crypto" && <CryptoTab />}
      {activeTab === "Commodity" && <CommodityTab />}
      {activeTab === "Forex" && <ForexTab />}
      {activeTab === "UAE" && <UAETab />}
      {activeTab === "Customize" && <SettingsTab />}
    </>
  );
}

function HomeV2BottomNav({ active, onSelect }: { active: BottomTab; onSelect: (tab: BottomTab) => void }) {
  return (
    <nav className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
      <LayoutGroup id="bnav-home-v2">
        <div className="flex items-center justify-around px-2 pb-2 pt-1.5">
          {homeV2Tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelect(tab.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-1.5 text-[13px] font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-pill-v2"
                    className="absolute inset-0 rounded-xl bg-muted/50"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <motion.div
                  className="relative z-10"
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                >
                  <tab.icon size={24} strokeWidth={1.6} />
                </motion.div>
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </nav>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────

export default function HomeV2() {
  const router = useRouter();
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>("explore");
  const [activeExploreTab, setActiveExploreTab] = useState<ExploreTab>("equity");
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [storiesInitialIndex, setStoriesInitialIndex] = useState(0);
  const [storiesRevealed, setStoriesRevealed] = useState(false);
  const [tabsSticky, setTabsSticky] = useState(false);
  const [tickerSymbols, setTickerSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const mainRef = useRef<HTMLDivElement>(null);
  const headerEndRef = useRef<HTMLDivElement>(null);

  const toggleStories = () => setStoriesRevealed((prev) => !prev);

  // Track when the grey header has scrolled away (tabs become sticky)
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const onScroll = () => {
      const el = headerEndRef.current;
      if (!el) return;
      // headerEnd is the sentinel at the bottom of the grey header section
      setTabsSticky(el.getBoundingClientRect().top <= main.getBoundingClientRect().top);
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []);

  const openStory = (index: number) => {
    setStoriesInitialIndex(index);
    setStoriesOpen(true);
  };

  const handleStorySeen = useCallback(() => {}, []);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-[#e8e8ed]">
      {/* ── iPhone Status Bar (always sticky) ─────────────────────────── */}
      <div
        className="flex-shrink-0 relative flex items-center justify-between px-6 pt-3 pb-1.5 select-none z-30 transition-colors duration-300"
        style={{ backgroundColor: tabsSticky ? "#ffffff" : "#e8e8ed" }}
      >
        <span className="text-[17px] font-semibold leading-none text-gray-800">9:41</span>
        <div className="absolute left-1/2 top-2 -translate-x-1/2">
          <div className="h-[28px] w-[100px] rounded-full bg-black" />
        </div>
        <div className="flex items-center gap-1.5 text-gray-800">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/></svg>
        </div>
      </div>

      {/* ── Single scroll container ─────────────────────────────────── */}
      <main
        ref={mainRef}
        className="no-scrollbar flex-1 overflow-y-auto"
      >
        {/* ── Dark header (scrolls away naturally) ──────────────────── */}
        <div className="bg-[#e8e8ed]">
          {/* Ticker */}
          <DarkTicker selected={tickerSymbols} onSave={setTickerSymbols} />

          {/* Header row */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full text-gray-700 hover:bg-black/5"
              onClick={() => router.push("/")}
            >
              <X size={22} strokeWidth={2} />
            </Button>

            <button
              onClick={toggleStories}
              className="flex-1 text-left active:opacity-70"
            >
              <p className="text-[18px] font-bold text-gray-900 leading-tight">US Equity</p>
              <p className="flex items-center gap-0.5 text-[13px] text-gray-500 mt-0.5">
                See What&apos;s New
                <motion.span
                  animate={{ rotate: storiesRevealed ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="inline-flex"
                >
                  <ChevronDown size={14} strokeWidth={2} />
                </motion.span>
              </p>
            </button>

            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 shrink-0 rounded-full text-gray-700 hover:bg-black/5"
              onClick={() => router.push("/notifications")}
            >
              <Bell size={22} strokeWidth={1.8} />
              <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white">
                3
              </span>
            </Button>

            <button
              onClick={() => router.push("/profile")}
              className="h-10 w-10 shrink-0 overflow-hidden rounded-full active:scale-95 transition-transform"
            >
              <Image
                src="/profile_dp.png"
                alt="Profile"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </button>
          </div>

          {/* Story cards — collapsed by default, revealed on pull-down */}
          <AnimatePresence initial={false}>
            {storiesRevealed && (
              <motion.div
                key="stories"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto no-scrollbar">
                  <div className="flex gap-3 px-4 pb-4 pt-1">
                    {spotlightCards.map((card, i) => (
                      <button
                        key={card.id}
                        onClick={() => openStory(i)}
                        className="shrink-0 flex h-[120px] w-[96px] flex-col items-center justify-center gap-2.5 rounded-2xl bg-white/70 border border-black/[0.06] active:opacity-80 transition-opacity"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                          <card.icon size={18} strokeWidth={1.8} />
                        </div>
                        <div className="text-center px-2">
                          <p className="text-[12px] font-semibold text-gray-800 leading-tight">{card.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{card.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={headerEndRef} />
        </div>

        {/* ── Body section (white bg) ───────────────────────────────── */}
        <div className="bg-background rounded-t-2xl">
          {/* Drag handle — pull down to reveal stories */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.y > 30 || info.velocity.y > 200) setStoriesRevealed(true);
              else if (info.offset.y < -30 || info.velocity.y < -200) setStoriesRevealed(false);
            }}
            className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="h-[5px] w-10 rounded-full bg-muted-foreground/25" />
          </motion.div>

          {/* Search bar + customize */}
          <div className="flex items-center gap-2 px-4 pb-4">
            <div
              onClick={() => router.push("/search")}
              className="flex h-12 min-w-0 flex-1 cursor-pointer items-center rounded-[16px] bg-muted/80 px-4"
            >
              <Search
                size={18}
                strokeWidth={2}
                className="mr-2.5 shrink-0 text-muted-foreground/50"
              />
              <div className="min-w-0 flex-1 overflow-hidden text-[16px] text-muted-foreground/60">
                <SearchPlaceholder />
              </div>
            </div>
            <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-muted/80 text-muted-foreground transition-colors active:bg-muted">
              <SlidersHorizontal size={20} strokeWidth={1.8} />
            </button>
          </div>

          {/* Explore sub-tabs — sticky */}
          {activeBottomTab === "explore" && (
            <div className="sticky top-0 z-20 border-b border-border/40 bg-background">
              <div className="overflow-x-auto no-scrollbar">
                <div className="flex gap-2 px-5">
                  {exploreTabs.map((tab, i) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveExploreTab(tab.id);
                      }}
                      className={cn(
                        "relative whitespace-nowrap py-2.5 text-[16px] font-semibold transition-colors",
                        i === 0 ? "pr-3" : "px-3",
                        activeExploreTab === tab.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {tab.label}
                      {activeExploreTab === tab.id && (
                        <motion.span
                          layoutId="explore-tab-underline"
                          className={cn(
                            "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                            i === 0 ? "left-0" : "left-3"
                          )}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab content */}
          {activeBottomTab === "explore" && (
            <>
              {activeExploreTab === "equity" && <ExploreFundedNotTraded />}
              {activeExploreTab === "etf" && <ETFFundedNotTraded />}
              {activeExploreTab === "options" && (
                <div className="flex items-center justify-center px-6 py-20">
                  <p className="text-[16px] text-muted-foreground">Options — coming soon</p>
                </div>
              )}
            </>
          )}

          {activeBottomTab === "market" && <MarketView />}

          {activeBottomTab !== "explore" && activeBottomTab !== "market" && (
            <div className="flex items-center justify-center px-6 py-20">
              <p className="text-[15px] text-muted-foreground/40 capitalize">
                {activeBottomTab === "levelup" ? "Level Up" : activeBottomTab} — coming soon
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ── Bottom Nav ────────────────────────────────────────────────── */}
      <div className="relative z-20 flex-shrink-0 bg-background">
        <HomeV2BottomNav active={activeBottomTab} onSelect={setActiveBottomTab} />
        <HomeIndicator />
      </div>

      {/* ── Stories Viewer Overlay ─────────────────────────────────────── */}
      <StoriesViewer
        isOpen={storiesOpen}
        onClose={() => setStoriesOpen(false)}
        initialIndex={storiesInitialIndex}
        onStorySeen={handleStorySeen}
      />
    </div>
  );
}
