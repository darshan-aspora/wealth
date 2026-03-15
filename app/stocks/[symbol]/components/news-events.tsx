"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AIAnnotation } from "./ai-annotation";
import { NEWS_EVENTS, type NewsItem, type EventItem } from "./mock-data";

interface NewsEventsProps {
  symbol: string;
}

export function NewsEvents({ symbol }: NewsEventsProps) {
  const data = NEWS_EVENTS[symbol];
  if (!data) {
    return (
      <div className="px-5 py-4">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          News & Events
        </h2>
        <p className="text-[14px] italic text-muted-foreground">No recent news available.</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      {/* Events */}
      {data.events.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming Events
          </h2>
          <div className="space-y-2.5">
            {data.events.map((event, i) => (
              <EventRow key={i} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* News */}
      <div>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          Latest News
        </h2>
        <div className="space-y-3">
          {data.news.map((article, i) => (
            <NewsCard key={i} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: EventItem }) {
  const iconMap = {
    earnings: "📊",
    dividend: "💰",
    conference: "🎤",
    split: "✂️",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-3 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/40 text-[18px]">
        {iconMap[event.type]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-foreground">{event.title}</p>
        <p className="text-[13px] text-muted-foreground">{event.date}</p>
      </div>
      <div className="shrink-0 rounded-full bg-secondary/60 px-2.5 py-1">
        <span className="text-[13px] font-medium text-foreground">
          {event.daysAway}d
        </span>
      </div>
    </div>
  );
}

function NewsCard({ article }: { article: NewsItem }) {
  const sentimentConfig = {
    positive: { icon: TrendingUp, color: "text-[hsl(var(--gain))]", border: "border-[hsl(var(--gain))]/10" },
    negative: { icon: TrendingDown, color: "text-[hsl(var(--loss))]", border: "border-[hsl(var(--loss))]/10" },
    neutral: { icon: Minus, color: "text-muted-foreground", border: "border-border/40" },
  }[article.sentiment];

  const SentimentIcon = sentimentConfig.icon;

  return (
    <div className={cn("rounded-xl border bg-card p-3", sentimentConfig.border)}>
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-[15px] font-medium leading-snug text-foreground">
          {article.headline}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-[13px] text-muted-foreground">
          <span>{article.source}</span>
          <span>·</span>
          <span>{article.timeAgo}</span>
          <span>·</span>
          <span>{article.readTime} read</span>
        </div>
      </div>

      {/* AI Impact annotation */}
      <div className="flex items-start gap-2 rounded-lg bg-secondary/20 px-2.5 py-2">
        <SentimentIcon size={14} className={cn("mt-0.5 shrink-0", sentimentConfig.color)} />
        <AIAnnotation className="!text-muted-foreground/80">
          {article.aiImpact}
        </AIAnnotation>
      </div>
    </div>
  );
}
