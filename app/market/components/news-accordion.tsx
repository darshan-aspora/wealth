"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NewsItem } from "../data";
import Link from "next/link";

interface NewsAccordionProps {
  title: string;
  subtitle?: string;
  items: NewsItem[];
  sourceCount?: number;
}

export function NewsAccordion({ title, subtitle, items, sourceCount }: NewsAccordionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div>
      <h3 className="text-[17px] font-bold text-foreground">{title}</h3>
      {subtitle && (
        <p className="mt-0.5 mb-3 text-[13px] text-muted-foreground">{subtitle}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "px-4",
              i < items.length - 1 && "border-b border-border/30"
            )}
          >
            {/* Header */}
            <button
              onClick={() => toggle(i)}
              className="flex w-full items-start justify-between gap-3 py-3.5 text-left"
            >
              <span className="text-[15px] font-semibold leading-snug text-foreground">
                {item.headline}
              </span>
              <motion.div
                animate={{ rotate: expandedIndex === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="mt-0.5 shrink-0 text-muted-foreground"
              >
                <ChevronDown size={16} />
              </motion.div>
            </button>

            {/* Body */}
            <AnimatePresence initial={false}>
              {expandedIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 pr-4">
                    <p className="text-[14px] leading-relaxed text-muted-foreground">
                      {item.summary}
                    </p>

                    {/* Ticker Tags */}
                    {item.tickers.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {item.tickers.map((ticker) => (
                          <Link
                            key={ticker}
                            href={`/stocks/${ticker}`}
                            className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-[12px] font-semibold text-foreground transition-colors active:bg-muted"
                          >
                            {ticker}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                              <path d="M7 17L17 7M17 7H7M17 7v10" />
                            </svg>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Sources + time */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground/60">
                      {item.sources.map((src) => (
                        <div key={src.name} className="flex items-center gap-1">
                          <span
                            className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold text-white"
                            style={{
                              backgroundColor: src.color,
                              color: src.color === "#fff1e5" ? "#1a1a1a" : "#fff",
                            }}
                          >
                            {src.logo}
                          </span>
                          <span>{src.name}</span>
                        </div>
                      ))}
                      <span className="text-muted-foreground/30">&middot;</span>
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {sourceCount && (
          <div className="flex items-center gap-1.5 border-t border-border/30 px-4 py-2.5 text-[12px] font-medium text-muted-foreground/50">
            <Info size={14} />
            {sourceCount} sources
          </div>
        )}
      </div>
    </div>
  );
}
