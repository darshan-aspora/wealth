"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NewsArticle {
  id: string;
  title: string;
  publisher: string;
  publisherColor: string;
  time: string;
  primaryTicker: string;
  relatedTickers: string[];
  url: string;
  hasImage: boolean;
}

// ─── Mock News Data (8–10 per symbol) ───────────────────────────────────────

const NEWS_BY_SYMBOL: Record<string, NewsArticle[]> = {
  AAPL: [
    {
      id: "aapl-1",
      title: "Apple unveils AI-powered home robot at Spring event, stock edges higher",
      publisher: "The Verge",
      publisherColor: "#E94C2B",
      time: "2h ago",
      primaryTicker: "AAPL",
      relatedTickers: ["MSFT"],
      url: "https://www.theverge.com/apple",
      hasImage: true,
    },
    {
      id: "aapl-2",
      title: "Apple Vision Pro 2 enters mass production ahead of holiday season launch",
      publisher: "Bloomberg",
      publisherColor: "#3B6CC9",
      time: "5h ago",
      primaryTicker: "AAPL",
      relatedTickers: ["MSFT"],
      url: "https://www.bloomberg.com/technology",
      hasImage: true,
    },
    {
      id: "aapl-3",
      title: "Apple Services revenue hits record $26B as iCloud subscriptions surge",
      publisher: "Reuters",
      publisherColor: "#FF8000",
      time: "8h ago",
      primaryTicker: "AAPL",
      relatedTickers: ["GOOGL"],
      url: "https://www.reuters.com/technology/apple",
      hasImage: true,
    },
    {
      id: "aapl-4",
      title: "Apple suppliers in Asia boost production capacity 30% for iPhone 17 cycle",
      publisher: "CNBC",
      publisherColor: "#1E4D8C",
      time: "10h ago",
      primaryTicker: "AAPL",
      relatedTickers: ["TSM"],
      url: "https://www.cnbc.com/technology",
      hasImage: true,
    },
    {
      id: "aapl-5",
      title: "Morgan Stanley raises AAPL target to $230, citing AI monetization upside",
      publisher: "Barron's",
      publisherColor: "#C41230",
      time: "12h ago",
      primaryTicker: "AAPL",
      relatedTickers: [],
      url: "https://www.barrons.com",
      hasImage: false,
    },
    {
      id: "aapl-6",
      title: "EU regulators open new antitrust probe into Apple App Store payment policies",
      publisher: "Financial Times",
      publisherColor: "#F04E23",
      time: "14h ago",
      primaryTicker: "AAPL",
      relatedTickers: ["GOOGL"],
      url: "https://www.ft.com/technology",
      hasImage: true,
    },
    {
      id: "aapl-7",
      title: "Apple Intelligence adoption crosses 40% among iPhone 15 Pro users globally",
      publisher: "Bloomberg",
      publisherColor: "#3B6CC9",
      time: "1d ago",
      primaryTicker: "AAPL",
      relatedTickers: [],
      url: "https://www.bloomberg.com/technology",
      hasImage: false,
    },
    {
      id: "aapl-8",
      title: "Apple quietly acquires AI video startup as competition with Google heats up",
      publisher: "The Verge",
      publisherColor: "#E94C2B",
      time: "1d ago",
      primaryTicker: "AAPL",
      relatedTickers: ["GOOGL"],
      url: "https://www.theverge.com/apple",
      hasImage: true,
    },
    {
      id: "aapl-9",
      title: "Bernstein says Apple's India expansion could add $15B revenue by 2027",
      publisher: "Reuters",
      publisherColor: "#FF8000",
      time: "2d ago",
      primaryTicker: "AAPL",
      relatedTickers: [],
      url: "https://www.reuters.com/technology/apple",
      hasImage: false,
    },
    {
      id: "aapl-10",
      title: "Apple Watch Series 11 health sensors reportedly include blood pressure monitoring",
      publisher: "CNBC",
      publisherColor: "#1E4D8C",
      time: "2d ago",
      primaryTicker: "AAPL",
      relatedTickers: [],
      url: "https://www.cnbc.com/technology",
      hasImage: true,
    },
  ],
  NVDA: [
    {
      id: "nvda-1",
      title: "NVIDIA surges on Saudi AI deal worth $500B, biggest single-day gain in 3 months",
      publisher: "Reuters",
      publisherColor: "#FF8000",
      time: "2h ago",
      primaryTicker: "NVDA",
      relatedTickers: ["AMD"],
      url: "https://www.reuters.com/technology",
      hasImage: true,
    },
    {
      id: "nvda-2",
      title: "NVIDIA Blackwell GPU shipments accelerate, data center demand remains insatiable",
      publisher: "Bloomberg",
      publisherColor: "#3B6CC9",
      time: "4h ago",
      primaryTicker: "NVDA",
      relatedTickers: ["AMD"],
      url: "https://www.bloomberg.com/technology",
      hasImage: true,
    },
    {
      id: "nvda-3",
      title: "CUDA ecosystem moat widens as hyperscalers commit to 5-year NVIDIA roadmap",
      publisher: "The Information",
      publisherColor: "#2B5AA8",
      time: "7h ago",
      primaryTicker: "NVDA",
      relatedTickers: [],
      url: "https://www.theinformation.com",
      hasImage: false,
    },
    {
      id: "nvda-4",
      title: "Jensen Huang signals NVIDIA will enter robotics software market by 2026",
      publisher: "CNBC",
      publisherColor: "#1E4D8C",
      time: "9h ago",
      primaryTicker: "NVDA",
      relatedTickers: ["TSLA"],
      url: "https://www.cnbc.com/technology",
      hasImage: true,
    },
    {
      id: "nvda-5",
      title: "NVIDIA NIM microservices adopted by 500+ enterprise customers in Q1",
      publisher: "Barron's",
      publisherColor: "#C41230",
      time: "11h ago",
      primaryTicker: "NVDA",
      relatedTickers: [],
      url: "https://www.barrons.com",
      hasImage: false,
    },
    {
      id: "nvda-6",
      title: "Taiwan fab partners expanding capacity for NVIDIA's next-gen GB300 series",
      publisher: "Reuters",
      publisherColor: "#FF8000",
      time: "14h ago",
      primaryTicker: "NVDA",
      relatedTickers: ["TSM"],
      url: "https://www.reuters.com/technology",
      hasImage: true,
    },
    {
      id: "nvda-7",
      title: "NVIDIA gaming GPU market share hits 88% as AMD struggles with supply",
      publisher: "The Verge",
      publisherColor: "#E94C2B",
      time: "1d ago",
      primaryTicker: "NVDA",
      relatedTickers: ["AMD"],
      url: "https://www.theverge.com",
      hasImage: true,
    },
    {
      id: "nvda-8",
      title: "Sovereign AI wave: 12 countries announce NVIDIA-based national AI infrastructure",
      publisher: "Bloomberg",
      publisherColor: "#3B6CC9",
      time: "1d ago",
      primaryTicker: "NVDA",
      relatedTickers: [],
      url: "https://www.bloomberg.com/technology",
      hasImage: false,
    },
    {
      id: "nvda-9",
      title: "NVIDIA's automotive revenue could triple by 2028 on DRIVE Thor adoption",
      publisher: "Financial Times",
      publisherColor: "#F04E23",
      time: "2d ago",
      primaryTicker: "NVDA",
      relatedTickers: ["TSLA"],
      url: "https://www.ft.com/technology",
      hasImage: true,
    },
  ],
  INTC: [
    {
      id: "intc-1",
      title: "Intel unveils next-gen Gaudi AI accelerator targeting NVIDIA's enterprise dominance",
      publisher: "The Verge",
      publisherColor: "#E94C2B",
      time: "3h ago",
      primaryTicker: "INTC",
      relatedTickers: ["NVDA"],
      url: "https://www.theverge.com",
      hasImage: true,
    },
    {
      id: "intc-2",
      title: "Intel foundry secures $10B partnership for advanced packaging with TSMC",
      publisher: "CNBC",
      publisherColor: "#1E4D8C",
      time: "6h ago",
      primaryTicker: "INTC",
      relatedTickers: ["TSM"],
      url: "https://www.cnbc.com",
      hasImage: true,
    },
    {
      id: "intc-3",
      title: "Intel CEO outlines 3-year turnaround plan; analysts remain cautious",
      publisher: "Barron's",
      publisherColor: "#C41230",
      time: "11h ago",
      primaryTicker: "INTC",
      relatedTickers: [],
      url: "https://www.barrons.com",
      hasImage: false,
    },
    {
      id: "intc-4",
      title: "Intel receives $8.5B CHIPS Act grant, construction begins at Ohio fab",
      publisher: "Reuters",
      publisherColor: "#FF8000",
      time: "14h ago",
      primaryTicker: "INTC",
      relatedTickers: [],
      url: "https://www.reuters.com/technology",
      hasImage: true,
    },
    {
      id: "intc-5",
      title: "Intel 18A process node yields improving ahead of first customer tape-out",
      publisher: "Bloomberg",
      publisherColor: "#3B6CC9",
      time: "1d ago",
      primaryTicker: "INTC",
      relatedTickers: ["TSM"],
      url: "https://www.bloomberg.com/technology",
      hasImage: false,
    },
    {
      id: "intc-6",
      title: "PC market recovery lifts Intel Core Ultra demand; notebook shipments up 12%",
      publisher: "CNBC",
      publisherColor: "#1E4D8C",
      time: "1d ago",
      primaryTicker: "INTC",
      relatedTickers: [],
      url: "https://www.cnbc.com",
      hasImage: true,
    },
    {
      id: "intc-7",
      title: "Microsoft's Copilot+ PC push drives Intel NPU design wins in 2025 lineup",
      publisher: "The Verge",
      publisherColor: "#E94C2B",
      time: "2d ago",
      primaryTicker: "INTC",
      relatedTickers: ["MSFT"],
      url: "https://www.theverge.com",
      hasImage: true,
    },
    {
      id: "intc-8",
      title: "Citi upgrades Intel to Buy, sees 35% upside on foundry strategy execution",
      publisher: "Barron's",
      publisherColor: "#C41230",
      time: "2d ago",
      primaryTicker: "INTC",
      relatedTickers: [],
      url: "https://www.barrons.com",
      hasImage: false,
    },
  ],
  SNAP: [
    {
      id: "snap-1",
      title: "Snap quarterly DAU growth disappoints; revenue misses estimates by 8%",
      publisher: "Bloomberg",
      publisherColor: "#3B6CC9",
      time: "1h ago",
      primaryTicker: "SNAP",
      relatedTickers: ["META"],
      url: "https://www.bloomberg.com/technology",
      hasImage: true,
    },
    {
      id: "snap-2",
      title: "Snap lays off 10% of workforce as it pivots focus to AR hardware",
      publisher: "The Verge",
      publisherColor: "#E94C2B",
      time: "4h ago",
      primaryTicker: "SNAP",
      relatedTickers: [],
      url: "https://www.theverge.com",
      hasImage: true,
    },
    {
      id: "snap-3",
      title: "Meta's ad targeting upgrades intensify competitive pressure on Snap",
      publisher: "Reuters",
      publisherColor: "#FF8000",
      time: "7h ago",
      primaryTicker: "SNAP",
      relatedTickers: ["META"],
      url: "https://www.reuters.com/technology",
      hasImage: false,
    },
    {
      id: "snap-4",
      title: "Snap Spectacles 5 AR glasses launch with 8-hour battery, priced at $499",
      publisher: "The Verge",
      publisherColor: "#E94C2B",
      time: "10h ago",
      primaryTicker: "SNAP",
      relatedTickers: [],
      url: "https://www.theverge.com",
      hasImage: true,
    },
    {
      id: "snap-5",
      title: "Snap's My AI chatbot hits 300M users; monetization model still unclear",
      publisher: "Bloomberg",
      publisherColor: "#3B6CC9",
      time: "1d ago",
      primaryTicker: "SNAP",
      relatedTickers: [],
      url: "https://www.bloomberg.com/technology",
      hasImage: false,
    },
    {
      id: "snap-6",
      title: "TikTok ban fears send advertisers back to Snap; ad spend up 18% MoM",
      publisher: "CNBC",
      publisherColor: "#1E4D8C",
      time: "1d ago",
      primaryTicker: "SNAP",
      relatedTickers: ["META"],
      url: "https://www.cnbc.com",
      hasImage: true,
    },
    {
      id: "snap-7",
      title: "Goldman initiates Snap at Neutral, questions path to profitability",
      publisher: "Barron's",
      publisherColor: "#C41230",
      time: "2d ago",
      primaryTicker: "SNAP",
      relatedTickers: [],
      url: "https://www.barrons.com",
      hasImage: false,
    },
    {
      id: "snap-8",
      title: "Snap expands Spotlight creator fund to emerging markets in Southeast Asia",
      publisher: "Reuters",
      publisherColor: "#FF8000",
      time: "2d ago",
      primaryTicker: "SNAP",
      relatedTickers: [],
      url: "https://www.reuters.com/technology",
      hasImage: true,
    },
  ],
};

function getNewsForSymbol(symbol: string): NewsArticle[] {
  return NEWS_BY_SYMBOL[symbol] ?? NEWS_BY_SYMBOL["AAPL"];
}

// ─── Simulated live prices ───────────────────────────────────────────────────

const BASE_CHANGES: Record<string, number> = {
  AAPL: 1.66,  NVDA: 4.93,  INTC: -5.87, SNAP: -6.84,
  MSFT: 2.36,  AMZN: 1.74,  GOOGL: 0.85, META: 2.97,
  AMD:  3.18,  ASML: 3.47,  TSM:  2.65,  TSLA: -2.81,
};

function useLivePrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    symbols.forEach((s) => { init[s] = BASE_CHANGES[s] ?? 0; });
    return init;
  });

  const key = symbols.join(",");
  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        symbols.forEach((s) => {
          const base = BASE_CHANGES[s] ?? 0;
          next[s] = +(base + (Math.random() - 0.5) * 0.1).toFixed(2);
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return prices;
}

// ─── WebView Overlay ─────────────────────────────────────────────────────────

function NewsWebView({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className="fixed inset-0 z-50 flex flex-col bg-background max-w-[430px] mx-auto"
    >
      <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3 shrink-0">
        <button
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <p className="flex-1 min-w-0 truncate text-[13px] font-medium text-muted-foreground">
          {title}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
        >
          <ExternalLink size={16} strokeWidth={2} />
        </a>
      </div>
      <iframe
        src={url}
        className="flex-1 w-full border-none"
        title={title}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </motion.div>
  );
}

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsCard({
  article,
  livePrices,
  onOpen,
}: {
  article: NewsArticle;
  livePrices: Record<string, number>;
  onOpen: (a: NewsArticle) => void;
}) {
  // max 2 tickers shown
  const displayTickers = [article.primaryTicker, ...article.relatedTickers].slice(0, 2);

  return (
    <button
      className="flex w-full gap-4 px-5 py-5 text-left active:bg-muted/40 transition-colors"
      onClick={() => onOpen(article)}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Publisher + time */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <div
            className="h-[14px] w-[14px] shrink-0 rounded-full"
            style={{ backgroundColor: article.publisherColor + "33" }}
          />
          <span className="text-[12px] text-muted-foreground">{article.publisher}</span>
          <span className="h-[2px] w-[2px] rounded-full bg-muted-foreground/40 shrink-0" />
          <span className="text-[12px] text-muted-foreground/60">{article.time}</span>
        </div>

        {/* Headline */}
        <p className="text-[14px] font-medium leading-snug text-foreground">
          {article.title}
        </p>

        {/* Live ticker badges — max 2 */}
        <div className="mt-1 flex items-center gap-x-3">
          {displayTickers.map((ticker, i) => {
            const pct = livePrices[ticker] ?? 0;
            const isGain = pct >= 0;
            return (
              <span key={ticker} className="inline-flex items-center gap-1.5">
                {i > 0 && (
                  <span className="h-[4px] w-[4px] rounded-full bg-muted-foreground/40 shrink-0" />
                )}
                <Link
                  href={`/stocks/${ticker}`}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium active:opacity-70 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-foreground">{ticker}</span>
                  <span className={cn("tabular-nums transition-colors duration-500", isGain ? "text-gain" : "text-loss")}>
                    {isGain ? "+" : ""}{pct.toFixed(2)}%
                  </span>
                </Link>
              </span>
            );
          })}
        </div>
      </div>

      {/* Thumbnail */}
      {article.hasImage && (
        <div className="h-[66px] w-[66px] shrink-0 self-center rounded-[8px] bg-zinc-200 dark:bg-zinc-700" />
      )}
    </button>
  );
}

// ─── Infinite-scroll hook ────────────────────────────────────────────────────

const PAGE_SIZE = 4;

function useInfiniteNews(all: NewsArticle[]) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (loading || visible >= all.length) return;
    setLoading(true);
    // simulate network delay
    setTimeout(() => {
      setVisible((v) => Math.min(v + PAGE_SIZE, all.length));
      setLoading(false);
    }, 600);
  }, [loading, visible, all.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return { articles: all.slice(0, visible), hasMore: visible < all.length, loading, sentinelRef };
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function StockNewsTab({ symbol }: { symbol: string }) {
  const all = getNewsForSymbol(symbol);
  const allTickers = Array.from(new Set(all.flatMap((a) => [a.primaryTicker, ...a.relatedTickers])));
  const livePrices = useLivePrices(allTickers);
  const [openArticle, setOpenArticle] = useState<NewsArticle | null>(null);
  const { articles, hasMore, loading, sentinelRef } = useInfiniteNews(all);

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <h2 className="text-[20px] font-bold text-foreground tracking-tight">
          News &amp; Updates
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Stay updated with earnings, events, and company news. Know what&apos;s
          moving {symbol} before it impacts the price.
        </p>
      </div>

      {/* Article list */}
      <div className="divide-y divide-border/40 mt-3">
        {articles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            livePrices={livePrices}
            onOpen={setOpenArticle}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-px" />

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {/* End of list */}
      {!hasMore && !loading && articles.length > PAGE_SIZE && (
        <p className="py-6 text-center text-[12px] text-muted-foreground">
          You&apos;re all caught up
        </p>
      )}

      {/* Webview slide-up */}
      <AnimatePresence>
        {openArticle && (
          <NewsWebView
            url={openArticle.url}
            title={openArticle.title}
            onClose={() => setOpenArticle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
