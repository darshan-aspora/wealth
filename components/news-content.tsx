"use client";

const newsArticles = [
  {
    publisher: "Bloomberg",
    logo: "https://logo.clearbit.com/bloomberg.com",
    timeAgo: "12m",
    title: "S&P 500 Hits Record High as Tech Rally Extends Into Fifth Session",
    url: "https://bloomberg.com",
  },
  {
    publisher: "Reuters",
    logo: "https://logo.clearbit.com/reuters.com",
    timeAgo: "34m",
    title: "Federal Reserve Signals Patience on Rate Cuts Amid Sticky Inflation Data",
    url: "https://reuters.com",
  },
  {
    publisher: "CNBC",
    logo: "https://logo.clearbit.com/cnbc.com",
    timeAgo: "1h",
    title: "Apple Announces $110 Billion Buyback, Largest in Corporate History",
    url: "https://cnbc.com",
  },
  {
    publisher: "Wall Street Journal",
    logo: "https://logo.clearbit.com/wsj.com",
    timeAgo: "2h",
    title: "Nvidia Earnings Crush Estimates as AI Chip Demand Shows No Signs of Slowing",
    url: "https://wsj.com",
  },
  {
    publisher: "MarketWatch",
    logo: "https://logo.clearbit.com/marketwatch.com",
    timeAgo: "3h",
    title: "Treasury Yields Climb After Strong Jobs Report Dampens Rate Cut Hopes",
    url: "https://marketwatch.com",
  },
  {
    publisher: "Financial Times",
    logo: "https://logo.clearbit.com/ft.com",
    timeAgo: "4h",
    title: "Amazon Web Services Revenue Growth Accelerates, Beating Analyst Expectations",
    url: "https://ft.com",
  },
  {
    publisher: "Barron's",
    logo: "https://logo.clearbit.com/barrons.com",
    timeAgo: "5h",
    title: "Tesla Stock Surges on Robotaxi Timeline Update and Strong Delivery Numbers",
    url: "https://barrons.com",
  },
  {
    publisher: "Bloomberg",
    logo: "https://logo.clearbit.com/bloomberg.com",
    timeAgo: "6h",
    title: "Microsoft Azure Growth Tops Forecasts as Enterprise AI Adoption Accelerates",
    url: "https://bloomberg.com",
  },
  {
    publisher: "CNBC",
    logo: "https://logo.clearbit.com/cnbc.com",
    timeAgo: "8h",
    title: "Oil Prices Jump After OPEC+ Agrees to Extend Production Cuts Through Q3",
    url: "https://cnbc.com",
  },
  {
    publisher: "Reuters",
    logo: "https://logo.clearbit.com/reuters.com",
    timeAgo: "1d",
    title: "Meta Platforms Raises Dividend as Ad Revenue Beats Estimates by Wide Margin",
    url: "https://reuters.com",
  },
  {
    publisher: "Wall Street Journal",
    logo: "https://logo.clearbit.com/wsj.com",
    timeAgo: "1d",
    title: "JPMorgan CEO Warns of Elevated Geopolitical Risks Heading Into Second Half",
    url: "https://wsj.com",
  },
  {
    publisher: "MarketWatch",
    logo: "https://logo.clearbit.com/marketwatch.com",
    timeAgo: "2d",
    title: "Gold Rallies to All-Time High as Central Banks Continue Record Buying Spree",
    url: "https://marketwatch.com",
  },
];

function PublisherLogo({ src, name }: { src: string; name: string }) {
  return (
    <div className="flex h-[18px] w-[18px] items-center justify-center overflow-hidden rounded-full bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        width={18}
        height={18}
        className="h-full w-full object-cover"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent && !parent.querySelector("span")) {
            const fallback = document.createElement("span");
            fallback.className = "text-[10px] font-bold text-muted-foreground";
            fallback.textContent = name.charAt(0);
            parent.appendChild(fallback);
          }
        }}
      />
    </div>
  );
}

export function NewsContent() {
  return (
    <div className="divide-y divide-border/40">
      {newsArticles.map((article, i) => (
        <a
          key={i}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-1.5 px-5 py-4 active:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <PublisherLogo src={article.logo} name={article.publisher} />
            <span className="text-[13px] font-medium text-muted-foreground">
              {article.publisher}
            </span>
            <span className="text-[10px] text-muted-foreground/50">•</span>
            <span className="text-[13px] text-muted-foreground/60">
              {article.timeAgo}
            </span>
          </div>
          <p className="text-[15px] font-medium leading-snug text-foreground">
            {article.title}
          </p>
        </a>
      ))}
    </div>
  );
}
