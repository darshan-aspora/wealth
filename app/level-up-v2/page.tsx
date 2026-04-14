"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, Play, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { StoryRing } from "@/components/stories-viewer";

/* ── Shared module data (same as ETF page) ── */

const modules = [
  { id: "m1", title: "What's an ETF?", stories: 6, desc: "The absolute starting point" },
  { id: "m2", title: "Why ETFs?", stories: 6, desc: "Why they exist, why now" },
  { id: "m3", title: "ETF vs Mutual Fund", stories: 7, desc: "Settle the debate" },
  { id: "m4", title: "Reading the Label", stories: 7, desc: "Expense ratio, AUM, tracking" },
  { id: "m5", title: "Power of Low Fees", stories: 6, desc: "The one thing guaranteed" },
  { id: "m6", title: "Your First ETF", stories: 7, desc: "Practical, no theory" },
  { id: "m7", title: "Beyond Basics", stories: 8, desc: "Sectors, bonds, international" },
];

/* ══════════════════════════════════════════════════════════════════════ */
/*  V1 — "Story Rings" (current — baseline)                              */
/*  Instagram-style circles in a horizontal scroll.                       */
/* ══════════════════════════════════════════════════════════════════════ */

function V1() {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="text-[18px] font-bold tracking-tight text-foreground">Level Up</h2>
          <p className="text-[14px] text-muted-foreground mt-0.5">Pick a topic. Start from your level.</p>
        </div>
      </div>

      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 px-5 py-1">
          {modules.map((mod, i) => (
            <div key={mod.id} className="flex flex-col items-center gap-1.5 shrink-0">
              <StoryRing totalStories={mod.stories} readCount={0} size={64}>
                <div className="h-full w-full bg-neutral-800 flex items-center justify-center">
                  <span className="text-[16px] font-bold text-white/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </StoryRing>
              <p className="text-[13px] font-semibold text-muted-foreground text-center leading-tight w-[64px]">
                {mod.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V2 — "Horizontal Cards"                                               */
/*  Each module is a compact card with title + story count + progress.    */
/*  Horizontal scroll, 2-row stacked layout.                              */
/* ══════════════════════════════════════════════════════════════════════ */

function V2() {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="text-[18px] font-bold tracking-tight text-foreground">Level Up</h2>
          <p className="text-[14px] text-muted-foreground mt-0.5">Pick a topic. Start from your level.</p>
        </div>
      </div>

      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex gap-2.5 px-5">
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              className="shrink-0 w-[160px] rounded-2xl bg-muted p-4 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-muted-foreground tracking-[0.2em]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {mod.stories} stories
                </span>
              </div>
              <p className="text-[14px] font-bold text-foreground leading-tight mb-1.5">
                {mod.title}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {mod.desc}
              </p>
              {/* Progress bar */}
              <div className="mt-3 h-[3px] rounded-full bg-border/60 overflow-hidden">
                <div className="h-full bg-foreground rounded-full" style={{ width: "0%" }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V3 — "Numbered List"                                                  */
/*  Vertical list with big index numbers, title + description.            */
/*  Feels like a chapter index in a book. Tap any row.                    */
/* ══════════════════════════════════════════════════════════════════════ */

function V3() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-[18px] font-bold tracking-tight text-foreground">Level Up</h2>
        <p className="text-[14px] text-muted-foreground mt-0.5">Pick a topic. Start from your level.</p>
      </div>

      <div className="space-y-0">
        {modules.map((mod, i) => (
          <button
            key={mod.id}
            className="flex items-center gap-4 w-full py-3.5 text-left active:bg-muted/30 transition-colors border-b border-border/30 last:border-0"
          >
            <span className="text-[28px] font-black text-muted-foreground/25 tabular-nums leading-none w-[36px] text-right shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground leading-tight">
                {mod.title}
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {mod.desc} · {mod.stories} stories
              </p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/40 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V4 — "Dark Module Cards"                                              */
/*  Full-width stacked dark cards with play icon, like Netflix episodes.  */
/*  Each card has a progress bar and story count.                          */
/* ══════════════════════════════════════════════════════════════════════ */

const noiseStyle = {
  backgroundImage:
    "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')",
};

function V4() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-[18px] font-bold tracking-tight text-foreground">Level Up</h2>
        <p className="text-[14px] text-muted-foreground mt-0.5">Pick a topic. Start from your level.</p>
      </div>

      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-5">
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              className="shrink-0 w-[200px] relative overflow-hidden rounded-2xl bg-foreground text-left active:scale-[0.98] transition-transform"
            >
              <div className="absolute inset-0 opacity-[0.04]" style={noiseStyle} />
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-bold text-background/40 uppercase tracking-[0.25em]">
                    Module {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background/15">
                    <Play size={12} className="text-background/70" fill="hsl(var(--background) / 0.7)" />
                  </div>
                </div>
                <p className="text-[16px] font-bold text-background leading-tight mb-1">
                  {mod.title}
                </p>
                <p className="text-[11px] text-background/45 leading-snug mb-4">
                  {mod.desc}
                </p>
                {/* Segmented progress */}
                <div className="flex gap-1">
                  {Array.from({ length: mod.stories }).map((_, j) => (
                    <div key={j} className="flex-1 h-[2px] rounded-full bg-background/15" />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  V5 — "Compact Chips + Hero"                                           */
/*  First module highlighted as a hero card. Remaining modules as small   */
/*  inline chips. Hero rotates or is the "suggested next."                 */
/* ══════════════════════════════════════════════════════════════════════ */

function V5() {
  const [heroIdx, setHeroIdx] = useState(0);
  const hero = modules[heroIdx];
  const rest = modules.filter((_, i) => i !== heroIdx);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-[18px] font-bold tracking-tight text-foreground">Level Up</h2>
        <p className="text-[14px] text-muted-foreground mt-0.5">Pick a topic. Start from your level.</p>
      </div>

      {/* Hero card */}
      <motion.button
        key={hero.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full relative overflow-hidden rounded-3xl bg-foreground text-left active:scale-[0.99] transition-transform mb-4"
      >
        <div className="absolute inset-0 opacity-[0.04]" style={noiseStyle} />
        <div className="relative px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-background/50" />
            <span className="text-[10px] font-bold text-background/50 uppercase tracking-[0.3em]">
              Up next
            </span>
          </div>
          <p className="text-[22px] font-bold text-background leading-[1.15] tracking-tight mb-1">
            {hero.title}
          </p>
          <p className="text-[14px] text-background/50 leading-relaxed mb-4">
            {hero.desc}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-background/40">
              {hero.stories} stories
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-foreground">
              <ArrowRight size={14} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </motion.button>

      {/* Remaining as chips */}
      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-5">
          {rest.map((mod) => {
            const origIdx = modules.indexOf(mod);
            return (
              <button
                key={mod.id}
                onClick={() => setHeroIdx(origIdx)}
                className="shrink-0 flex items-center gap-2.5 rounded-full border border-border/60 px-4 py-2.5 active:scale-[0.97] transition-transform"
              >
                <span className="text-[11px] font-bold text-muted-foreground/50 tabular-nums">
                  {String(origIdx + 1).padStart(2, "0")}
                </span>
                <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">
                  {mod.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  Page                                                                 */
/* ══════════════════════════════════════════════════════════════════════ */

const variations = [
  { name: "V1 · Story Rings", note: "Instagram-style circles. Compact, familiar.", Comp: V1 },
  { name: "V2 · Horizontal Cards", note: "Scrollable cards with title, description, progress bar.", Comp: V2 },
  { name: "V3 · Numbered List", note: "Vertical chapter index. Book-like, scannable.", Comp: V3 },
  { name: "V4 · Dark Module Cards", note: "Inverted cards with play icon. Netflix-episode energy.", Comp: V4 },
  { name: "V5 · Hero + Chips", note: "Featured module as hero card. Rest as inline chips.", Comp: V5 },
];

export default function LevelUpV2Page() {
  const [active, setActive] = useState(0);

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
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">
            Level Up Widget
          </h1>
          <p className="text-[12px] text-muted-foreground">
            5 entry-point variations · same stories inside
          </p>
        </div>
      </div>

      {/* Version picker */}
      <div className="overflow-x-auto no-scrollbar border-b border-border/40">
        <div className="flex gap-0 px-5">
          {variations.map((v, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors",
                active === i ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              V{i + 1}
              {active === i && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="px-5 pt-5">
          <p className="text-[14px] font-semibold text-foreground">
            {variations[active].name}
          </p>
          <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed mb-5">
            {variations[active].note}
          </p>
        </div>

        <div className="px-5">
          {(() => {
            const Comp = variations[active].Comp;
            return <Comp />;
          })()}
        </div>

        {/* Placeholder content below to show context */}
        <div className="px-5 pt-8 space-y-4">
          <div className="h-[60px] rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">Footer / trust section below</span>
          </div>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
