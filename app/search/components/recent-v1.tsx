"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Recent — Plain rows, no card wrapper. Progressive "View More" loads 3 at a time.
 */

const recentItems = [
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Stock", price: 134.70, changePct: 5.33 },
  { symbol: "SPX", name: "S&P 500", type: "Index", price: 6021.63, changePct: 0.41 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", type: "ETF", price: 521.87, changePct: 0.60 },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Stock", price: 342.18, changePct: 3.81 },
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", price: 227.63, changePct: 1.53 },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "Stock", price: 213.47, changePct: 2.02 },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "Stock", price: 441.28, changePct: -0.48 },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "Stock", price: 178.92, changePct: 1.06 },
  { symbol: "META", name: "Meta Platforms Inc.", type: "Stock", price: 612.35, changePct: -1.35 },
];

const PAGE_SIZE = 3;

export function RecentWidget() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = recentItems.slice(0, visibleCount);
  const hasMore = visibleCount < recentItems.length;

  return (
    <div className="px-5">
      <h3 className="text-[16px] font-bold text-foreground mb-2 px-1">
        Recent
      </h3>

      <AnimatePresence initial={false}>
        {visible.map((item) => {
          const isUp = item.changePct >= 0;
          return (
            <motion.div
              key={item.symbol}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3 py-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-foreground leading-tight">
                    {item.name}
                  </p>
                  <p className="text-[13px] text-muted-foreground/50 leading-tight mt-0.5">
                    {item.type} · {item.symbol}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-semibold tabular-nums text-foreground">
                    {item.price}
                  </p>
                  <p
                    className={`text-[13px] font-medium tabular-nums ${
                      isUp ? "text-gain" : "text-loss"
                    }`}
                  >
                    {isUp ? "+" : ""}
                    {item.changePct.toFixed(2)}%
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {hasMore && (
        <button
          onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          className="flex w-full items-center justify-center gap-1.5 pt-1 pb-1 text-[13px] font-medium text-muted-foreground/50 active:text-foreground transition-colors"
        >
          View more <ChevronDown size={14} />
        </button>
      )}
    </div>
  );
}
