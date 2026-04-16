"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Bookmark,
  GitCompareArrows,
  Newspaper,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ================================================================== */
/*  Shared — Row 1 items and phrase pools                              */
/* ================================================================== */

type Row1Item = { label: string; icon: LucideIcon; href?: string };

const row1Items: Row1Item[] = [
  { label: "My Watchlist", icon: Bookmark, href: "/watchlist" },
  { label: "Compare Stocks", icon: GitCompareArrows, href: "/compare" },
  { label: "News", icon: Newspaper },
];

// Templated (for V1 "Ask Aspora to [X]" and V5 typewriter)
const askFragments = [
  "summarize today's market in 30 seconds",
  "scan my watchlist for anything worth a look",
  "tell me what's changed in my portfolio",
  "turn today's news into 3 things that matter",
  "compare two stocks side by side",
  "explain what's moving the S&P today",
];

// First-person "I noticed..." friend voice (V2 Orb)
const friendPhrases = [
  "I can summarize today's market in 30 seconds.",
  "I noticed 3 things about your portfolio today.",
  "Your watchlist just got more interesting.",
  "I turned today's news into 3 things that matter.",
  "Nvidia reports earnings in 2 days — want a brief?",
  "Let me explain what's moving the S&P right now.",
];

// Complete value-prop sentences for hero banner (V3)
const heroPhrases = [
  "Summarize today's market in 30 seconds.",
  "Turn 12 news stories into 3 that matter.",
  "Understand what's moving your portfolio.",
  "Spot risk before it shows up in the numbers.",
  "Compare two stocks in plain English.",
];

// Short chip labels for marquee (V4)
const marqueeChips = [
  "Summarize today's market",
  "Scan my watchlist",
  "Review my portfolio",
  "3 things that matter today",
  "Why is tech up today?",
  "Compare NVDA vs AMD",
  "Earnings this week",
  "Explain options to me",
];

/* ================================================================== */
/*  Shared hooks                                                        */
/* ================================================================== */

function usePhraseRotation(phrases: string[], intervalMs = 4500) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, phrases.length, intervalMs]);

  return {
    phrase: phrases[index],
    index,
    setPaused,
  };
}

function useTypewriter(text: string, speed = 32) {
  const [displayed, setDisplayed] = useState("");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      if (i > text.length) {
        window.clearInterval(id);
        return;
      }
      setDisplayed(text.slice(0, i));
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed, reduceMotion]);

  return displayed;
}

/* ================================================================== */
/*  Shared transitions                                                  */
/* ================================================================== */

const softExpo = [0.16, 1, 0.3, 1] as const;

const slideVariants = {
  initial: { y: 14, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -14, opacity: 0 },
};

/* ================================================================== */
/*  V1 — The Whisper                                                    */
/*  Minimal, single-line. "Ask Aspora to [rotating phrase]"            */
/* ================================================================== */

export function QuickAccessV1Whisper() {
  const { phrase, setPaused } = usePhraseRotation(askFragments, 4200);

  return (
    <div className="space-y-3">
      {/* Row 1 — clean bordered pills */}
      <div className="flex gap-2.5">
        {row1Items.map((item) => {
          const Icon = item.icon;
          const inner = (
            <>
              <Icon size={17} strokeWidth={1.8} className="text-foreground shrink-0" />
              <span className="text-[14px] font-semibold text-foreground whitespace-nowrap">
                {item.label}
              </span>
            </>
          );
          const cls =
            "flex flex-1 items-center justify-center gap-2 rounded-full border border-border/70 px-3 py-2.5 active:scale-[0.97] transition-transform";
          return item.href ? (
            <Link key={item.label} href={item.href} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={item.label} className={cls}>
              {inner}
            </button>
          );
        })}
      </div>

      {/* Row 2 — two-line whisper */}
      <button
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="group relative w-full rounded-2xl bg-muted px-4 py-3.5 text-left active:scale-[0.99] transition-transform overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="shrink-0"
            >
              <Sparkles size={14} strokeWidth={2} className="text-muted-foreground" />
            </motion.div>
            <span className="text-[12px] font-extrabold tracking-[0.12em] text-muted-foreground/50 uppercase">
              Ask Aspora to
            </span>
          </div>
          <ArrowRight
            size={15}
            strokeWidth={2.25}
            className="shrink-0 text-muted-foreground/50 group-active:translate-x-0.5 transition-transform"
          />
        </div>

        <div className="relative h-[20px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={phrase}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: softExpo }}
              className="absolute inset-0 text-[15px] font-semibold text-foreground"
            >
              {phrase}
            </motion.p>
          </AnimatePresence>
        </div>
      </button>
    </div>
  );
}

/* ================================================================== */
/*  V2 — The Orb                                                        */
/*  Ambient glowing AI entity with rotating companion text.            */
/* ================================================================== */

export function QuickAccessV2Orb() {
  const { phrase, setPaused } = usePhraseRotation(friendPhrases, 5000);

  return (
    <div className="space-y-3">
      {/* Row 1 — soft-filled pills */}
      <div className="flex gap-2">
        {row1Items.map((item) => {
          const Icon = item.icon;
          const inner = (
            <>
              <Icon size={17} strokeWidth={1.8} className="text-muted-foreground shrink-0" />
              <span className="text-[14px] font-semibold text-foreground whitespace-nowrap">
                {item.label}
              </span>
            </>
          );
          const cls =
            "flex flex-1 items-center justify-center gap-2 rounded-2xl bg-muted px-3 py-3 active:scale-[0.97] transition-transform";
          return item.href ? (
            <Link key={item.label} href={item.href} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={item.label} className={cls}>
              {inner}
            </button>
          );
        })}
      </div>

      {/* Row 2 — night-surface orb */}
      <button
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="relative w-full flex items-center gap-4 rounded-3xl px-5 py-5 text-left overflow-hidden active:scale-[0.995] transition-transform"
        style={{
          background:
            "linear-gradient(135deg, #0b0b14 0%, #141428 50%, #0b0b14 100%)",
        }}
      >
        {/* Ambient starfield */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          {[...Array(14)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-white"
              style={{
                left: `${(i * 37 + 7) % 100}%`,
                top: `${(i * 53 + 13) % 100}%`,
              }}
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{
                duration: 2 + (i % 3),
                delay: (i % 5) * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Orb */}
        <div className="relative shrink-0 h-14 w-14">
          {/* Outer glow */}
          <motion.div
            animate={{ scale: [0.9, 1.18, 0.9], opacity: [0.5, 0.95, 0.5] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background:
                "radial-gradient(circle, rgba(167,139,250,0.95) 0%, rgba(56,189,248,0.55) 55%, transparent 80%)",
            }}
          />
          {/* Inner core */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[10px] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 30%, #ffffff 0%, #dbe4ff 35%, #8b8ffe 78%, #5850ec 100%)",
              boxShadow: "0 0 24px rgba(139,143,254,0.45)",
            }}
          />
          {/* Rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.3) 25%, transparent 50%)",
              mask: "radial-gradient(circle, transparent 60%, black 62%, black 100%)",
              WebkitMask:
                "radial-gradient(circle, transparent 60%, black 62%, black 100%)",
            }}
          />
        </div>

        {/* Phrase */}
        <div className="relative flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/55 mb-1.5">
            Aspora AI
          </p>
          <div className="relative h-[22px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={phrase}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.36, ease: softExpo }}
                className="absolute inset-0 text-[15px] font-semibold text-white leading-tight truncate"
              >
                {phrase}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <ArrowRight size={18} strokeWidth={2.25} className="relative shrink-0 text-white/70" />
      </button>
    </div>
  );
}

/* ================================================================== */
/*  V3 — The Shimmer Banner                                             */
/*  Cinematic hero with animated gradient mesh + shimmer sweep.        */
/* ================================================================== */

export function QuickAccessV3Shimmer() {
  const { phrase, setPaused } = usePhraseRotation(heroPhrases, 5800);

  return (
    <div className="space-y-4">
      {/* Row 1 — icon tiles with labels below */}
      <div className="flex justify-around">
        {row1Items.map((item) => {
          const Icon = item.icon;
          const inner = (
            <>
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center ring-1 ring-border/40">
                <Icon size={20} strokeWidth={1.8} className="text-foreground" />
              </div>
              <span className="text-[12px] font-semibold text-foreground whitespace-nowrap">
                {item.label}
              </span>
            </>
          );
          const cls =
            "flex flex-col items-center gap-2 active:scale-[0.95] transition-transform";
          return item.href ? (
            <Link key={item.label} href={item.href} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={item.label} className={cls}>
              {inner}
            </button>
          );
        })}
      </div>

      {/* Row 2 — cinematic banner */}
      <button
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="relative w-full rounded-3xl overflow-hidden active:scale-[0.995] transition-transform ring-1 ring-border/40"
      >
        {/* Base surface */}
        <div className="absolute inset-0 bg-muted" />

        {/* Animated gradient mesh */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 15% 50%, rgba(168,85,247,0.22), transparent 55%), radial-gradient(circle at 85% 50%, rgba(56,189,248,0.22), transparent 55%), radial-gradient(circle at 50% 100%, rgba(244,114,182,0.18), transparent 60%)",
          }}
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "300%" }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            repeatDelay: 1.8,
            ease: "easeInOut",
          }}
        />

        <div className="relative px-6 py-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={{ rotate: [0, 10, -6, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={14} strokeWidth={2.2} className="text-foreground" />
            </motion.div>
            <span className="text-[10px] font-bold tracking-[0.24em] uppercase text-muted-foreground">
              Aspora AI
            </span>
          </div>

          <div className="relative h-[56px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={phrase}
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -28, opacity: 0 }}
                transition={{ duration: 0.44, ease: softExpo }}
                className="absolute inset-x-0 top-0 text-[20px] font-bold text-foreground leading-[1.2] tracking-tight"
              >
                {phrase}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-5">
            <span className="text-[12px] text-muted-foreground">
              Tap to ask anything
            </span>
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-foreground">
              Try it
              <ArrowRight size={14} strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}

/* ================================================================== */
/*  V4 — The Marquee                                                    */
/*  Continuous flow of AI prompts — premium scroll.                    */
/* ================================================================== */

export function QuickAccessV4Marquee() {
  const doubled = [...marqueeChips, ...marqueeChips];

  return (
    <div className="space-y-3">
      {/* Row 1 — minimal line pills */}
      <div className="flex gap-2">
        {row1Items.map((item) => {
          const Icon = item.icon;
          const inner = (
            <>
              <Icon size={16} strokeWidth={1.9} className="text-foreground shrink-0" />
              <span className="text-[14px] font-semibold text-foreground whitespace-nowrap">
                {item.label}
              </span>
            </>
          );
          const cls =
            "flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2.5 active:scale-[0.97] transition-transform";
          return item.href ? (
            <Link key={item.label} href={item.href} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={item.label} className={cls}>
              {inner}
            </button>
          );
        })}
      </div>

      {/* Row 2 — marquee rail */}
      <div className="relative rounded-3xl bg-muted overflow-hidden py-4">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-muted to-transparent z-10" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-muted to-transparent z-10" />

        {/* Section label */}
        <div className="absolute left-0 top-0 z-20 px-4 py-2 flex items-center gap-1.5">
          <motion.div
            animate={{ scale: [1, 1.18, 1], rotate: [0, 8, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={11} strokeWidth={2.5} className="text-foreground" />
          </motion.div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Aspora AI
          </span>
        </div>

        <div className="h-5" />

        {/* Marquee track */}
        <div className="flex w-max animate-marquee gap-2.5 pl-10 pr-10 group-hover:[animation-play-state:paused]">
          {doubled.map((chip, i) => (
            <button
              key={`${chip}-${i}`}
              className="flex items-center gap-1.5 shrink-0 rounded-full bg-background border border-border/60 pl-3 pr-4 py-2 text-[13px] font-medium text-foreground active:scale-[0.97] transition-transform whitespace-nowrap"
            >
              <Sparkles size={12} strokeWidth={2} className="text-muted-foreground" />
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Shared Row 1 for V5 variants                                        */
/* ================================================================== */

function V5Row1() {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
      {row1Items.map((item) => {
        const Icon = item.icon;
        const inner = (
          <>
            <Icon size={17} strokeWidth={1.8} className="text-foreground shrink-0" />
            <span className="text-[14px] font-semibold text-foreground whitespace-nowrap">
              {item.label}
            </span>
          </>
        );
        const cls =
          "flex shrink-0 items-center gap-2 rounded-full border border-border/60 px-4 py-2.5 active:scale-[0.97] transition-transform";
        return item.href ? (
          <Link key={item.label} href={item.href} className={cls}>
            {inner}
          </Link>
        ) : (
          <button key={item.label} className={cls}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  V5A — Clean Direct                                                  */
/*  No nesting. Typing text on a flat muted card. Nothing else.         */
/* ================================================================== */

export function QuickAccessV5A() {
  const { phrase } = usePhraseRotation(askFragments, 6500);
  const typed = useTypewriter(phrase, 38);
  const done = typed.length >= phrase.length;

  return (
    <div className="space-y-3">
      <V5Row1 />
      <button className="w-full rounded-2xl bg-muted px-4 py-4 text-left active:scale-[0.99] transition-transform">
        <p className="text-[15px] text-foreground leading-snug">
          <Sparkles
            size={14}
            strokeWidth={2}
            className="inline-block text-muted-foreground/60 mr-1.5 align-[-1px]"
          />
          <span className="text-muted-foreground">Ask me to </span>
          <span className="font-semibold">{typed}</span>
          {!done && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              className="inline-block w-[2px] h-[16px] bg-foreground align-[-2px] ml-0.5"
            />
          )}
        </p>
      </button>
    </div>
  );
}

/* ================================================================== */
/*  V5B — Input Field                                                   */
/*  Looks like a search bar. Typing appears inside.                     */
/* ================================================================== */

const shortFragments = [
  "summarize portfolio",
  "analyze stocks",
  "scan watchlist",
];

export function QuickAccessV5B() {
  const { phrase } = usePhraseRotation(shortFragments, 5500);
  const typed = useTypewriter(phrase, 40);
  const done = typed.length >= phrase.length;

  return (
    <div className="space-y-3">
      <h2 className="text-[18px] font-bold tracking-tight text-foreground">Quick Access</h2>
      <V5Row1 />
      <button className="w-full rounded-2xl border border-border/60 bg-background px-4 py-3.5 text-left active:scale-[0.99] transition-transform">
        <p className="text-[12px] font-extrabold tracking-[0.12em] text-muted-foreground/50 uppercase mb-2">
          Aspora AI
        </p>
        <div className="flex items-center gap-3">
        <p className="flex-1 min-w-0 text-[15px] text-foreground leading-snug">
          <span className="text-muted-foreground">Ask me to </span>
          <span className="font-semibold">{typed}</span>
          {!done && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              className="inline-block w-[2px] h-[15px] bg-foreground align-[-2px] ml-0.5"
            />
          )}
        </p>
          <ArrowRight
            size={15}
            strokeWidth={2.25}
            className="shrink-0 text-muted-foreground/40"
          />
        </div>
      </button>
    </div>
  );
}

/* ================================================================== */
/*  V5C — Eyebrow + Typewriter                                          */
/*  Tiny label on top, full-width typing below. No container.           */
/* ================================================================== */

export function QuickAccessV5C() {
  const { phrase } = usePhraseRotation(askFragments, 6500);
  const typed = useTypewriter(phrase, 38);
  const done = typed.length >= phrase.length;

  return (
    <div className="space-y-3">
      <V5Row1 />
      <button className="w-full px-1 py-2 text-left active:opacity-80 transition-opacity">
        <p className="text-[12px] font-extrabold tracking-[0.12em] text-muted-foreground/50 uppercase flex items-center gap-2 mb-1.5">
          <Sparkles size={12} strokeWidth={2.5} className="text-muted-foreground/40" />
          Ask me to
        </p>
        <p className="text-[17px] font-semibold text-foreground leading-snug min-h-[26px]">
          {typed}
          {!done && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              className="inline-block w-[2px] h-[18px] bg-foreground align-[-2px] ml-0.5"
            />
          )}
        </p>
      </button>
    </div>
  );
}

/* ================================================================== */
/*  V5D — Dot + Bubble                                                  */
/*  Tiny dot avatar on left, speech bubble on right. No labels.         */
/* ================================================================== */

export function QuickAccessV5D() {
  const { phrase } = usePhraseRotation(askFragments, 6500);
  const typed = useTypewriter(phrase, 38);
  const done = typed.length >= phrase.length;

  return (
    <div className="space-y-3">
      <V5Row1 />
      <button className="w-full flex items-start gap-2.5 text-left active:scale-[0.99] transition-transform">
        {/* Dot avatar */}
        <div className="shrink-0 mt-3">
          <motion.div
            animate={done ? {} : { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-[10px] w-[10px] rounded-full bg-foreground"
          />
        </div>

        {/* Bubble */}
        <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm border border-border/60 px-4 py-3">
          <p className="text-[15px] text-foreground leading-snug min-h-[44px]">
            <span className="text-muted-foreground">Ask me to </span>
            <span className="font-semibold">{typed}</span>
            {!done && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="inline-block w-[2px] h-[15px] bg-foreground align-[-2px] ml-0.5"
              />
            )}
          </p>
        </div>
      </button>
    </div>
  );
}

/* ================================================================== */
/*  Showcase                                                            */
/* ================================================================== */

export function QuickAccessV3Showcase() {
  const variants: {
    label: string;
    subtitle: string;
    Component: React.ComponentType;
  }[] = [
    {
      label: "V1 — The Whisper",
      subtitle: "Single-line. Templated rotation. Minimal utility.",
      Component: QuickAccessV1Whisper,
    },
    {
      label: "V2 — The Orb",
      subtitle: "Ambient AI presence on a night surface. Breathing glow.",
      Component: QuickAccessV2Orb,
    },
    {
      label: "V3 — The Shimmer Banner",
      subtitle: "Cinematic hero. Animated mesh + shimmer sweep.",
      Component: QuickAccessV3Shimmer,
    },
    {
      label: "V4 — The Marquee",
      subtitle: "Continuous flow of prompts. Premium scroll rail.",
      Component: QuickAccessV4Marquee,
    },
    {
      label: "V5A — Clean Direct",
      subtitle: "Flat muted card. Typing inline. Nothing else.",
      Component: QuickAccessV5A,
    },
    {
      label: "V5B — Input Field",
      subtitle: "Looks like a search bar. Typing fills the field.",
      Component: QuickAccessV5B,
    },
    {
      label: "V5C — Eyebrow + Typewriter",
      subtitle: "Tiny label on top, big typing text below. No container.",
      Component: QuickAccessV5C,
    },
    {
      label: "V5D — Dot + Bubble",
      subtitle: "Tiny dot avatar. Speech bubble. No labels.",
      Component: QuickAccessV5D,
    },
  ];

  return (
    <div className="space-y-10">
      {variants.map(({ label, subtitle, Component }) => (
        <div key={label}>
          <div className="mb-4 px-1">
            <p className="text-[13px] font-bold tracking-wider text-muted-foreground uppercase">
              {label}
            </p>
            <p className={cn("text-[13px] text-muted-foreground/80 mt-0.5")}>
              {subtitle}
            </p>
          </div>
          <Component />
        </div>
      ))}
    </div>
  );
}
