"use client";

import Link from "next/link";

/** Mock day-change for every ticker referenced in news */
const TICKER_DAY_CHANGE: Record<string, number> = {
  NVDA: +5.42, AMD: +3.18, PLTR: +7.61, LMT: +1.05,
  CRWD: +4.83, PANW: +2.14, AAPL: +0.92, ASML: +3.47,
  TSM: +2.65, TSLA: -2.81, MSFT: +2.36, AMZN: +1.74,
  LLY: +3.92, NVO: +1.53, JPM: +1.28, SPY: +0.86,
  META: +2.97, SNAP: -1.24, BA: +4.15, UAL: +3.62,
  COIN: +6.38, MSTR: +4.71, WMT: +0.63, V: +1.41,
  MA: +1.18,
};

interface NewsArticle {
  title: string;
  tickers: string[];
  publisher: string;
  time: string;
}

const NEWS_ARTICLES: NewsArticle[] = [
  {
    title: "NVIDIA surges on Saudi AI deal worth 500B, biggest single-day gain in 3 months",
    tickers: ["NVDA", "AMD"],
    publisher: "Reuters",
    time: "2h ago",
  },
  {
    title: "Pentagon awards 1.5B battlefield AI contract to Palantir",
    tickers: ["PLTR", "LMT"],
    publisher: "Defense One",
    time: "4h ago",
  },
  {
    title: "CrowdStrike hits all-time high on record ARR, cybersecurity demand accelerates",
    tickers: ["CRWD", "PANW"],
    publisher: "CNBC",
    time: "5h ago",
  },
  {
    title: "Apple unveils AI-powered home robot at Spring event, stock edges higher",
    tickers: ["AAPL"],
    publisher: "The Verge",
    time: "6h ago",
  },
  {
    title: "ASML record bookings as semiconductor supply crunch intensifies",
    tickers: ["ASML", "TSM"],
    publisher: "Financial Times",
    time: "7h ago",
  },
  {
    title: "Tesla recalls 1.2M vehicles over Autopilot software, shares dip 2.8%",
    tickers: ["TSLA"],
    publisher: "Reuters",
    time: "8h ago",
  },
  {
    title: "Microsoft Azure revenue beats estimates by 8%, cloud growth reaccelerates",
    tickers: ["MSFT", "AMZN"],
    publisher: "Bloomberg",
    time: "9h ago",
  },
  {
    title: "Eli Lilly obesity drug Mounjaro approved for new indications, expanding TAM",
    tickers: ["LLY", "NVO"],
    publisher: "STAT News",
    time: "10h ago",
  },
  {
    title: "JPMorgan raises S&P 500 target to 6,500 citing resilient earnings cycle",
    tickers: ["JPM", "SPY"],
    publisher: "Bloomberg",
    time: "11h ago",
  },
  {
    title: "Meta launches AI-powered ad platform, early adopters report 40% better ROAS",
    tickers: ["META", "SNAP"],
    publisher: "The Verge",
    time: "12h ago",
  },
  {
    title: "Boeing secures record 42B order from United Airlines for 737 MAX and 787",
    tickers: ["BA", "UAL"],
    publisher: "Reuters",
    time: "13h ago",
  },
  {
    title: "Coinbase revenue surges 65% as institutional crypto adoption hits record levels",
    tickers: ["COIN", "MSTR"],
    publisher: "CNBC",
    time: "14h ago",
  },
  {
    title: "Amazon expands same-day delivery to 50 new metros, logistics capex up 25%",
    tickers: ["AMZN", "WMT"],
    publisher: "Reuters",
    time: "15h ago",
  },
  {
    title: "Visa reports 12% payment volume growth, cross-border travel fully recovered",
    tickers: ["V", "MA"],
    publisher: "Bloomberg",
    time: "16h ago",
  },
];

export function NewsTab() {
  return (
    <div className="pb-8 pt-1">
      <div className="flex flex-col">
        {NEWS_ARTICLES.map((article, i) => (
          <article
            key={i}
            className="flex gap-3.5 px-5 py-5"
          >
            {/* Text content */}
            <div className="flex-1 min-w-0">
              {/* Publisher + time */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="flex h-[18px] w-[18px] rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
                <span className="text-[13px] font-medium text-muted-foreground">
                  {article.publisher}
                </span>
                <span className="text-muted-foreground/40">&middot;</span>
                <span className="text-[13px] text-muted-foreground/60">
                  {article.time}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-[14px] font-semibold leading-snug text-foreground line-clamp-2">
                {article.title}
              </h4>

              {/* Ticker badges */}
              {article.tickers.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {article.tickers.map((ticker) => {
                    const pct = TICKER_DAY_CHANGE[ticker] ?? 0;
                    const isGain = pct >= 0;
                    return (
                      <Link
                        key={ticker}
                        href={`/stocks/${ticker}`}
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors active:opacity-70"
                      >
                        <span className="text-muted-foreground">{ticker}</span>
                        <span className={isGain ? "text-gain" : "text-loss"}>
                          {isGain ? "+" : ""}{pct.toFixed(2)}%
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Placeholder image */}
            <div className="h-[72px] w-[72px] shrink-0 rounded-xl self-center bg-zinc-300 dark:bg-zinc-700" />
          </article>
        ))}
      </div>
    </div>
  );
}
