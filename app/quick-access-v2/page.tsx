"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  GitCompareArrows,
  Newspaper,
  Sparkles,
  Brain,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

/* ------------------------------------------------------------------ */
/*  Shared row-1 items                                                 */
/* ------------------------------------------------------------------ */

type Row1Item = {
  label: string;
  short: string;
  icon: LucideIcon;
  hint: string;
};

const row1: Row1Item[] = [
  { label: "My Watchlist", short: "Watchlist", icon: Bookmark, hint: "12 saved" },
  { label: "Compare Stocks", short: "Compare", icon: GitCompareArrows, hint: "side by side" },
  { label: "News", short: "News", icon: Newspaper, hint: "live feed" },
];

const noiseStyle = {
  backgroundImage:
    "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')",
};

/* ══════════════════════════════════════════════════════════════════════ */
/*  V1 — "Studio"                                                        */
/*  Editorial monochrome. Index numbers, masthead labels, hairline        */
/*  dividers. AI card carries a single oversized headline.                */
/* ══════════════════════════════════════════════════════════════════════ */

function V1() {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 mb-3">
        Quick Access · No. 01
      </p>

      {/* Row 1 — three columns separated by hairlines */}
      <div className="grid grid-cols-3 rounded-[20px] border border-border/60 overflow-hidden">
        {row1.map((it, i) => {
          const Icon = it.icon;
          return (
            <button
              key={it.label}
              className={cn(
                "relative flex flex-col items-start gap-2.5 py-4 px-3.5 text-left active:bg-muted/30 transition-colors",
                i !== 0 && "border-l border-border/60"
              )}
            >
              <span className="text-[9px] font-bold text-muted-foreground/40 tracking-[0.25em]">
                0{i + 1}
              </span>
              <Icon size={18} strokeWidth={1.6} className="text-foreground" />
              <div>
                <p className="text-[13px] font-bold text-foreground leading-tight">
                  {it.short}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">
                  {it.hint}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Row 2 — AI Summary card */}
      <button className="mt-2.5 group relative w-full overflow-hidden rounded-[20px] bg-foreground p-6 text-left active:scale-[0.99] transition-transform">
        <div className="absolute inset-0 opacity-[0.03]" style={noiseStyle} />
        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-background/60" />
              <span className="text-[10px] font-bold text-background/60 uppercase tracking-[0.3em]">
                AI Summary
              </span>
            </div>
            <span className="text-[10px] font-medium text-background/40 tracking-wide">
              Updated 2m ago
            </span>
          </div>

          <p className="text-[26px] font-bold text-background leading-[1.15] tracking-[-0.025em]">
            <span className="text-background">3 things</span>{" "}
            <span className="text-background/45">moved your watchlist today.</span>
          </p>

          <div className="mt-5 pt-4 border-t border-background/15 flex items-center justify-between">
            <p className="text-[11px] font-bold text-background/40 uppercase tracking-[0.2em]">
              Read the brief
            </p>
            <ArrowRight size={15} className="text-background/60" />
          </div>
        </div>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V2 — "Aurora"                                                        */
/*  Iridescent / holographic. AI card has a slow-rotating conic gradient  */
/*  + a breathing pulse. Top row icons get individual gradient halos.     */
/* ══════════════════════════════════════════════════════════════════════ */

function V2() {
  return (
    <div>
      {/* Row 1 — square tiles, monochrome */}
      <div className="grid grid-cols-3 gap-2">
        {row1.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.label}
              className="group relative aspect-[1/1.1] rounded-2xl border border-border/50 bg-muted/30 overflow-hidden flex flex-col items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-background border border-border/40">
                <Icon size={18} strokeWidth={1.8} className="text-foreground" />
              </div>
              <div className="relative text-center">
                <p className="text-[12px] font-semibold text-foreground leading-tight">
                  {it.short}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {it.hint}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Row 2 — Aurora AI card */}
      <button className="mt-2.5 relative w-full overflow-hidden rounded-3xl bg-[#0A0A0F] p-6 text-left active:scale-[0.99] transition-transform">
        {/* Slow rotating conic aurora */}
        <motion.div
          className="absolute inset-[-50%]"
          style={{
            background:
              "conic-gradient(from 0deg, #ec4899, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ec4899)",
            filter: "blur(60px)",
            opacity: 0.55,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
        {/* Breathing inner darkness for legibility */}
        <div className="absolute inset-2 rounded-[22px] bg-[#0A0A0F]/85 backdrop-blur-2xl" />

        <div className="relative px-2 py-1">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles
              size={14}
              className="text-white"
              fill="white"
            />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.3em] bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-amber-200 bg-clip-text text-transparent"
            >
              AI Summary
            </span>
          </div>

          <p className="text-[20px] font-bold text-white leading-[1.25] mb-4 tracking-[-0.01em]">
            Tech rallied 2.3% — <span className="text-white/60">your NVDA position
            led the charge.</span>
          </p>

          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-1.5">
              {["bg-fuchsia-400", "bg-cyan-400", "bg-amber-300"].map((c, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-5 w-5 rounded-full ring-2 ring-[#0A0A0F]",
                    c
                  )}
                />
              ))}
            </div>
            <span className="text-[12px] font-medium text-white/55">
              3 insights · live
            </span>
            <ArrowUpRight
              size={14}
              className="ml-auto text-white"
              strokeWidth={2.2}
            />
          </div>
        </div>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V3 — "Brutalist"                                                     */
/*  Sharp corners, no rounded. Black/white blocks, oversized labels,      */
/*  thick rule lines. AI card is a stamp.                                 */
/* ══════════════════════════════════════════════════════════════════════ */

function V3() {
  return (
    <div className="border-2 border-foreground">
      {/* Row 1 — three black-on-white tiles */}
      <div className="grid grid-cols-3 divide-x-2 divide-foreground border-b-2 border-foreground">
        {row1.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.label}
              className="flex flex-col items-start gap-3 p-4 text-left active:bg-foreground active:text-background transition-colors"
            >
              <Icon size={22} strokeWidth={2.5} />
              <div>
                <p className="text-[13px] font-black uppercase tracking-tight leading-none">
                  {it.short}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] mt-1.5 opacity-50">
                  {it.hint}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Row 2 — AI card as inverted stamp */}
      <button className="block w-full bg-foreground text-background p-5 text-left active:opacity-90 transition-opacity">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-background" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              AI / Summary
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
            04 / 14
          </span>
        </div>

        <p className="text-[24px] font-black uppercase leading-[1.05] tracking-tight">
          Markets up.<br />
          Your bets up <span className="text-emerald-400">more</span>.
        </p>

        <div className="mt-4 pt-3 border-t-2 border-background/30 flex items-center justify-between">
          <ul className="text-[11px] font-bold uppercase tracking-[0.1em] space-y-0.5 opacity-80">
            <li>● NVDA +3.97%</li>
            <li>● AAPL +2.33%</li>
            <li>● TSLA −6.48%</li>
          </ul>
          <ArrowRight size={20} strokeWidth={3} />
        </div>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V4 — "Glass"                                                         */
/*  Frosted backdrop-blur tiles on a colored mesh. AI card breathes      */
/*  with an animated mesh gradient behind heavy frosted glass.            */
/* ══════════════════════════════════════════════════════════════════════ */

function V4() {
  return (
    <div className="relative -mx-3 px-3 py-3 rounded-[28px] overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0">
        <div className="absolute -top-10 -left-10 h-44 w-44 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute top-10 right-0 h-52 w-52 rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute -bottom-10 left-1/3 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl" />
      </div>

      <div className="relative">
        {/* Row 1 — frosted tiles */}
        <div className="grid grid-cols-3 gap-2">
          {row1.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.label}
                className="relative rounded-2xl bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/15 p-3.5 text-left active:scale-[0.97] transition-transform"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={18} strokeWidth={1.6} className="text-foreground" />
                  <ArrowUpRight
                    size={13}
                    className="text-foreground/40"
                    strokeWidth={2}
                  />
                </div>
                <p className="text-[13px] font-semibold text-foreground leading-tight">
                  {it.short}
                </p>
                <p className="text-[10px] text-foreground/55 mt-0.5">{it.hint}</p>
              </button>
            );
          })}
        </div>

        {/* Row 2 — Glass AI card with breathing */}
        <button className="mt-2.5 relative w-full overflow-hidden rounded-3xl text-left active:scale-[0.99] transition-transform">
          {/* Inner mesh */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute -inset-10 rounded-full bg-violet-500/40 blur-3xl"
              animate={{ x: [0, 40, -20, 0], y: [0, 20, -10, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-0 -top-20 h-72 w-72 rounded-full bg-cyan-400/40 blur-3xl"
              animate={{ x: [0, -30, 20, 0], y: [0, 40, -10, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Frosted layer */}
          <div className="relative bg-white/30 dark:bg-white/10 backdrop-blur-2xl border border-white/40 dark:border-white/15 p-5">
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-foreground"
              />
              <Sparkles size={13} className="text-foreground/70" />
              <span className="text-[11px] font-bold text-foreground/70 uppercase tracking-[0.25em]">
                AI Summary
              </span>
            </div>

            <p className="text-[19px] font-bold text-foreground leading-[1.25] tracking-[-0.01em]">
              Quiet day for indices —{" "}
              <span className="text-foreground/55">
                but two of your stocks broke 52W highs.
              </span>
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-foreground/60">
                AAPL · MSFT
              </span>
              <span className="text-[11px] font-semibold text-foreground/80 inline-flex items-center gap-1">
                Open brief
                <ArrowRight size={13} />
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V5 — "Ribbon"                                                        */
/*  Top row are tilted ticket-stub chips. AI card is a wide "ribbon"     */
/*  with a horizontally scrolling marquee of insights.                    */
/* ══════════════════════════════════════════════════════════════════════ */

function V5() {
  const ticks = [
    "● NVDA +3.97%",
    "● AAPL +2.33%",
    "● TSLA −6.48%",
    "● AMZN +3.17%",
    "● Tech sector +2.10%",
    "● 2 watchlist hits 52W high",
  ];
  // Duplicate for seamless marquee
  const marquee = [...ticks, ...ticks];

  return (
    <div>
      {/* Row 1 — tilted ticket-stub chips */}
      <div className="flex items-center justify-center gap-3 py-3">
        {row1.map((it, i) => {
          const Icon = it.icon;
          const tilt = i === 0 ? "-rotate-3" : i === 1 ? "rotate-1" : "-rotate-2";
          const offset = i === 1 ? "-translate-y-1" : "translate-y-1";
          return (
            <button
              key={it.label}
              className={cn(
                "relative flex-1 max-w-[110px] rounded-2xl bg-card border border-border/60 px-3 py-3.5 text-left transition-all active:scale-95 hover:rotate-0 hover:translate-y-0",
                "shadow-[0_4px_18px_-4px_rgba(0,0,0,0.15)]",
                tilt,
                offset
              )}
            >
              {/* Perforated edge */}
              <div className="absolute -top-1 left-0 right-0 flex justify-around">
                {Array.from({ length: 6 }).map((_, j) => (
                  <span
                    key={j}
                    className="h-2 w-2 rounded-full bg-background border border-border/60 -translate-y-1"
                  />
                ))}
              </div>
              <Icon size={16} strokeWidth={1.8} className="text-foreground mb-1.5" />
              <p className="text-[12px] font-bold text-foreground leading-tight">
                {it.short}
              </p>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mt-1">
                {it.hint}
              </p>
            </button>
          );
        })}
      </div>

      {/* Row 2 — AI ribbon with marquee */}
      <div className="relative mt-1 overflow-hidden rounded-3xl bg-foreground">
        <div className="absolute inset-0 opacity-[0.04]" style={noiseStyle} />

        <div className="relative">
          {/* Top label */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Brain size={14} className="text-background" />
              <span className="text-[11px] font-bold text-background uppercase tracking-[0.3em]">
                AI Wire
              </span>
            </div>
            <span className="text-[10px] font-medium text-background/50 tracking-wide flex items-center gap-1.5">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              LIVE
            </span>
          </div>

          {/* Headline */}
          <p className="px-5 text-[18px] font-bold text-background leading-[1.25] tracking-[-0.01em]">
            Markets are{" "}
            <span className="text-emerald-400">leaning bullish</span>.
            <br />
            <span className="text-background/50">
              Your portfolio is up 1.4% today.
            </span>
          </p>

          {/* Marquee ribbon */}
          <div className="relative mt-4 mb-4 overflow-hidden border-y border-background/15 py-2.5 bg-background/[0.04]">
            <motion.div
              className="flex gap-8 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            >
              {marquee.map((t, i) => (
                <span
                  key={i}
                  className="text-[12px] font-semibold text-background/65 tabular-nums tracking-tight"
                >
                  {t}
                </span>
              ))}
            </motion.div>
            {/* Edge gradients to fade marquee in/out */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-foreground to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-foreground to-transparent" />
          </div>

          {/* Footer CTA */}
          <button className="w-full px-5 pb-4 flex items-center justify-between text-left active:opacity-80 transition-opacity">
            <span className="text-[11px] font-bold text-background/55 uppercase tracking-[0.2em]">
              Tap for full brief
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground">
              <ArrowRight size={13} strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  Page                                                                 */
/* ══════════════════════════════════════════════════════════════════════ */

const variations = [
  {
    name: "V1 · Studio",
    note: "Editorial monochrome. Index numbers, hairline dividers, oversized AI headline.",
    Comp: V1,
  },
  {
    name: "V2 · Aurora",
    note: "Iridescent halos on tiles. AI card has a slow-rotating conic aurora behind frosted glass.",
    Comp: V2,
  },
  {
    name: "V3 · Brutalist",
    note: "Sharp corners, thick rules, ALL CAPS. AI card is an inverted stamp with a punch list.",
    Comp: V3,
  },
  {
    name: "V4 · Glass",
    note: "Frosted glass tiles on a colour mesh. AI card breathes with animated gradients.",
    Comp: V4,
  },
  {
    name: "V5 · Ribbon",
    note: "Tilted ticket-stub chips. AI card is a horizontal ticker with marquee insights.",
    Comp: V5,
  },
];

export default function QuickAccessV2Page() {
  // Force a re-render of motion components each time we mount (helps with HMR consistency)
  const [, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-border/40">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold tracking-tight text-foreground flex items-center gap-2">
            Quick Access 2.0
            <Zap size={16} className="text-foreground/60" fill="currentColor" />
          </h1>
          <p className="text-[12px] text-muted-foreground">
            2 rows · 3 shortcuts + AI Summary · 5 variations
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {variations.map(({ name, note, Comp }) => (
          <section key={name} className="px-5 pt-7">
            <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-border/30">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-foreground">
                {name}
              </p>
              <p className="text-[10px] text-muted-foreground/70 tracking-wide">
                Variation
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
              {note}
            </p>
            <Comp />
          </section>
        ))}
      </div>

      <HomeIndicator />
    </div>
  );
}
