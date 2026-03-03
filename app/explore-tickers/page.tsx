"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import {
  TickerMarquee,
  TickerPills,
  TickerCards,
  TickerDense,
  TickerGlow,
} from "@/components/ticker";

const variations = [
  { title: "Marquee Tape", description: "Auto-scrolling infinite loop, broadcast feel", component: TickerMarquee },
  { title: "Pill Strip", description: "Compact swipeable pills, color-coded gain/loss", component: TickerPills },
  { title: "Mini Cards", description: "Rich cards with price, change, and intensity bar", component: TickerCards },
  { title: "Dense Tape", description: "Two-line auto-scroll, symbol + price stacked", component: TickerDense },
  { title: "Gradient Glow", description: "Premium cards with gain/loss gradient backgrounds", component: TickerGlow },
];

export default function ExploreTickersPage() {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-3">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/60 transition-colors hover:bg-secondary"
        >
          <ArrowLeft size={16} className="text-foreground" />
        </Link>
        <div>
          <h1 className="text-[17px] font-bold text-foreground leading-tight">
            Ticker
          </h1>
          <p className="text-[11px] text-muted-foreground">
            5 variations — edit is built into each ticker
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border/60" />

      {/* All variations */}
      <div className="flex-1 px-4 pt-5 pb-4 space-y-6">
        {variations.map((v, i) => {
          const Component = v.component;
          return (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-secondary text-[10px] font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="text-[13px] font-semibold text-foreground">
                  {v.title}
                </span>
                <span className="text-[11px] text-muted-foreground ml-auto">
                  {v.description}
                </span>
              </div>
              <div className="rounded-xl border border-border/40 overflow-hidden bg-card/20">
                <Component />
              </div>
            </motion.div>
          );
        })}
      </div>

      <HomeIndicator />
    </div>
  );
}
