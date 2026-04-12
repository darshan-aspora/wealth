"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

/* V1 — Current: centered text + icon, ghost style */
function V1() {
  return (
    <button className="flex w-full items-center justify-center gap-2 py-8 active:opacity-70">
      <Sparkles size={14} className="text-muted-foreground/30" />
      <span className="text-[13px] font-medium text-muted-foreground/40">Tap for AI summary</span>
    </button>
  );
}

/* V2 — Full-width CTA button, primary */
function V2() {
  return (
    <div className="px-5 py-4">
      <button className="flex w-full items-center justify-center gap-2.5 rounded-full bg-foreground py-3 active:opacity-90 transition-opacity">
        <Sparkles size={16} className="text-background" />
        <span className="text-[15px] font-semibold text-background">Analyze with AI</span>
      </button>
    </div>
  );
}

/* V3 — Card with description */
function V3() {
  return (
    <div className="px-5 py-4">
      <button className="w-full rounded-2xl border border-border/60 p-4 text-left active:scale-[0.98] transition-transform">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <Sparkles size={18} className="text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-foreground">Analyze this watchlist</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Get AI insights on your holdings</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground/40" />
        </div>
      </button>
    </div>
  );
}

/* V4 — Inline pill, left-aligned */
function V4() {
  return (
    <div className="px-5 py-4">
      <button className="flex items-center gap-2 rounded-full bg-muted px-4 py-2.5 active:scale-[0.97] transition-transform">
        <Sparkles size={14} className="text-foreground" />
        <span className="text-[14px] font-semibold text-foreground">AI Summary</span>
      </button>
    </div>
  );
}

/* V5 — Gradient banner, full-width */
function V5() {
  return (
    <div className="px-5 py-4">
      <button className="w-full rounded-2xl bg-gradient-to-r from-foreground/5 to-foreground/10 p-4 text-left active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-foreground" />
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-foreground">What&apos;s happening in your watchlist?</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Tap to get an AI-powered breakdown</p>
          </div>
        </div>
      </button>
    </div>
  );
}

/* V6 — Minimal text link, right-aligned with arrow */
function V6() {
  return (
    <div className="px-5 py-4 flex justify-end">
      <button className="flex items-center gap-1.5 active:opacity-70 transition-opacity">
        <Sparkles size={13} className="text-muted-foreground" />
        <span className="text-[14px] font-medium text-muted-foreground">Analyze</span>
        <ArrowRight size={14} className="text-muted-foreground" />
      </button>
    </div>
  );
}

/* V7 — Animated shimmer bar */
function V7() {
  return (
    <div className="px-5 py-4">
      <button className="relative w-full overflow-hidden rounded-xl bg-muted py-3.5 active:scale-[0.99] transition-transform">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative flex items-center justify-center gap-2">
          <Sparkles size={15} className="text-foreground" />
          <span className="text-[14px] font-semibold text-foreground">Generate AI Summary</span>
        </div>
      </button>
    </div>
  );
}

/* V8 — Icon-first, large centered */
function V8() {
  return (
    <div className="py-8">
      <button className="flex w-full flex-col items-center gap-3 active:opacity-70 transition-opacity">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Sparkles size={24} className="text-foreground" />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-semibold text-foreground">AI Summary</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">Tap to analyze your watchlist</p>
        </div>
      </button>
    </div>
  );
}

/* V9 — Outlined button with sparkle animation */
function V9() {
  return (
    <div className="px-5 py-4">
      <button className="flex w-full items-center justify-center gap-2.5 rounded-full border border-border/60 py-3 active:bg-muted/50 transition-colors">
        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
          <Sparkles size={16} className="text-foreground" />
        </motion.div>
        <span className="text-[15px] font-semibold text-foreground">Analyze with AI</span>
      </button>
    </div>
  );
}

/* V10 — Compact bar, between header and content */
function V10() {
  return (
    <div className="mx-5 my-3 flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-2.5">
      <Sparkles size={14} className="shrink-0 text-foreground" />
      <p className="flex-1 text-[13px] text-muted-foreground">17 stocks in this watchlist</p>
      <button className="flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 active:opacity-90 transition-opacity">
        <span className="text-[12px] font-semibold text-background">Analyze</span>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */

const variations = [
  { name: "V1 — Ghost Text (Current)", component: V1 },
  { name: "V2 — Primary CTA Button", component: V2 },
  { name: "V3 — Card with Description", component: V3 },
  { name: "V4 — Inline Pill", component: V4 },
  { name: "V5 — Gradient Banner", component: V5 },
  { name: "V6 — Minimal Text Link", component: V6 },
  { name: "V7 — Shimmer Bar", component: V7 },
  { name: "V8 — Large Centered Icon", component: V8 },
  { name: "V9 — Outlined + Sparkle", component: V9 },
  { name: "V10 — Compact Bar + Count", component: V10 },
];

export default function AiSummaryExplore() {
  const [active, setActive] = useState(0);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors">
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">AI Summary Entry</h1>
          <p className="text-[13px] text-muted-foreground">10 entry point variations</p>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar border-b border-border/40">
        <div className="flex gap-0 px-5">
          {variations.map((v, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                active === i ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              V{i + 1}
              {active === i && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <p className="px-5 pt-5 text-[13px] text-muted-foreground mb-2">{variations[active].name}</p>
        {(() => { const Comp = variations[active].component; return <Comp />; })()}
      </div>

      <HomeIndicator />
    </div>
  );
}
