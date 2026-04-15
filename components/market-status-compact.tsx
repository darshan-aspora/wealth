"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  formatEvent,
  MARKET_OPEN,
  MARKET_CLOSE,
  AFTER_HOURS_END,
  PRE_MARKET_START,
  type MarketState,
  type PulseMode,
} from "@/components/market-status-widget-v2";

/* ==================================================================== */
/*  Compact Market Status Widgets                                       */
/*                                                                      */
/*  Goal: horizontal-first layouts, half the vertical footprint of the  */
/*  existing widgets. Each variant targets ~36–48px of height.          */
/* ==================================================================== */

/* Shared helpers ----------------------------------------------------- */

function pulseDuration(mode: PulseMode) {
  switch (mode) {
    case "fast": return 1.4;
    case "normal": return 2.4;
    case "slow": return 3.6;
    default: return 0;
  }
}

// Full status word — no truncation.
function compactStatusWord(state: MarketState): string {
  switch (state.kind) {
    case "live": return "LIVE";
    case "pre": return "PRE-MARKET";
    case "closing": return "LIVE";
    case "after": return "AFTER-HOURS";
    case "night": return "CLOSED";
    case "weekend": return "WEEKEND";
    case "holiday": return "HOLIDAY";
    case "emergency": return "CLOSED";
    case "paused": return "PAUSED";
    case "delay": return "DELAYED";
  }
}

// Colored dot for the status kind
function kindDotClass(state: MarketState): string {
  if (state.isPaused) return "bg-amber-500";
  switch (state.kind) {
    case "live": return "bg-red-500";
    case "pre": return "bg-sky-500";
    case "closing": return "bg-orange-500";
    case "after": return "bg-violet-500";
    case "night": return "bg-slate-500";
    case "weekend": return "bg-slate-400";
    case "holiday": return "bg-emerald-500";
    case "emergency": return "bg-rose-600";
    case "paused": return "bg-amber-500";
    case "delay": return "bg-yellow-500";
  }
}

/* ==================================================================== */
/*  V1 — Inline Strip                                                   */
/*  Single row: status word (left) + countdown (right). Live-only dot.   */
/*  Amber notice below for unusual states (holiday, emergency, etc.).    */
/* ==================================================================== */

export function CompactInlineStrip({
  state,
  userTz,
  onToggle,
}: {
  state: MarketState;
  userTz: string;
  onToggle?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const countdown = formatEvent(state.event, userTz);
  const duration = pulseDuration(state.pulse);
  const animateDot = state.isLive && !reduceMotion && duration > 0;

  const cardInner = (
    <>
      {/* Live dot (live-only) on the left, then status word */}
      <div className="flex items-center gap-2">
        {state.isLive && (
          <span className="relative flex h-[8px] w-[8px]">
            {animateDot && (
              <motion.span
                className="absolute inset-0 rounded-full bg-red-500"
                animate={{ scale: [1, 2.2, 1], opacity: [0.55, 0, 0.55] }}
                transition={{ duration, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <span className="relative h-[8px] w-[8px] rounded-full bg-red-500" />
          </span>
        )}
        <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-foreground">
          {compactStatusWord(state)}
        </span>
      </div>

      {/* Countdown — right-aligned */}
      <span className="ml-auto shrink-0 text-[14px] font-normal tabular-nums text-foreground">
        {countdown || "—"}
      </span>
    </>
  );

  const cardClass =
    "flex items-center w-full rounded-xl bg-muted/60 border border-border/50 px-3.5 py-2.5";

  return (
    <div>
      {onToggle ? (
        <button
          onClick={onToggle}
          className={cn(cardClass, "text-left active:opacity-80 transition-opacity")}
        >
          {cardInner}
        </button>
      ) : (
        <div className={cardClass}>{cardInner}</div>
      )}

      {/* Notice — plain centered text below the card for unusual states */}
      {state.notice && (
        <p className="mt-2 px-3.5 text-center text-[13px] font-medium leading-snug text-amber-700 dark:text-amber-300">
          {state.notice}
        </p>
      )}
    </div>
  );
}

/* ==================================================================== */
/*  V2 — Segmented Capsule                                              */
/*  Pill with two halves: tinted status | neutral countdown.            */
/* ==================================================================== */

export function CompactSegmentedCapsule({
  state,
  userTz,
}: {
  state: MarketState;
  userTz: string;
}) {
  const countdown = formatEvent(state.event, userTz);

  return (
    <div className="flex items-stretch rounded-full border border-border/60 overflow-hidden bg-background h-[36px]">
      {/* Status segment */}
      <div className="flex items-center gap-1.5 px-3.5 bg-foreground text-background">
        <span className={cn("h-[7px] w-[7px] rounded-full", kindDotClass(state))} />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
          {compactStatusWord(state)}
        </span>
      </div>
      {/* Countdown segment */}
      <div className="flex-1 flex items-center px-3.5 min-w-0">
        <AnimatePresence mode="wait">
          <motion.span
            key={state.id}
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -4, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[12px] font-semibold tabular-nums text-foreground truncate"
          >
            {countdown || state.headline}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  V3 — Status + Day Progress                                          */
/*  Chip on the left, thin 24h timeline showing position in the day.    */
/* ==================================================================== */

export function CompactDayProgress({
  state,
  userTz,
}: {
  state: MarketState;
  userTz: string;
}) {
  const reduceMotion = useReducedMotion();
  const openPct = MARKET_OPEN * 100;
  const closePct = MARKET_CLOSE * 100;
  const afterPct = AFTER_HOURS_END * 100;
  const prePct = PRE_MARKET_START * 100;
  const posPct = Math.max(0, Math.min(1, state.dayProgress)) * 100;
  const countdown = formatEvent(state.event, userTz);

  return (
    <div className="rounded-xl bg-muted/60 border border-border/50 px-3.5 py-2.5">
      <div className="flex items-center gap-3">
        {/* Status chip */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("h-[7px] w-[7px] rounded-full", kindDotClass(state))} />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
            {compactStatusWord(state)}
          </span>
        </div>

        {/* Timeline */}
        <div className="relative flex-1 h-[12px]">
          <div className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-border" />
          <div
            className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-foreground/20"
            style={{ left: `${prePct}%`, right: `${100 - openPct}%` }}
          />
          <div
            className="absolute top-1/2 h-[2.5px] -translate-y-1/2 rounded-full bg-foreground/85"
            style={{ left: `${openPct}%`, right: `${100 - closePct}%` }}
          />
          <div
            className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-foreground/20"
            style={{ left: `${closePct}%`, right: `${100 - afterPct}%` }}
          />
          <motion.div
            className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background ring-[1.5px] ring-foreground"
            animate={{ left: `${posPct}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
          >
            {state.isLive && !reduceMotion && (
              <motion.span
                className="absolute inset-0 rounded-full bg-foreground"
                animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </motion.div>
        </div>

        {/* Countdown */}
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground min-w-[64px] text-right">
          {countdown || "—"}
        </span>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  V4 — Triple Cell Row                                                */
/*  Three divided cells: status | headline | countdown.                  */
/* ==================================================================== */

export function CompactTripleCell({
  state,
  userTz,
}: {
  state: MarketState;
  userTz: string;
}) {
  const countdown = formatEvent(state.event, userTz);

  return (
    <div className="flex items-center rounded-xl bg-muted/50 border border-border/50 overflow-hidden h-[44px]">
      {/* Cell 1 — status */}
      <div className="flex items-center gap-1.5 px-3.5 shrink-0">
        <span className={cn("h-[7px] w-[7px] rounded-full", kindDotClass(state))} />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
          {compactStatusWord(state)}
        </span>
      </div>
      <div className="h-5 w-px bg-border/70 shrink-0" />

      {/* Cell 2 — headline (flex) */}
      <div className="flex-1 min-w-0 px-3.5">
        <p className="text-[12px] font-medium text-muted-foreground truncate leading-tight">
          {state.headline}
        </p>
      </div>
      <div className="h-5 w-px bg-border/70 shrink-0" />

      {/* Cell 3 — countdown */}
      <div className="px-3.5 shrink-0">
        <span className="text-[12px] font-semibold tabular-nums text-foreground">
          {countdown || "—"}
        </span>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  V5 — Minimal Marquee                                                */
/*  Ultra-thin strip. Chain of `status · headline · countdown`           */
/*  A subtle pulse line hints the tempo without taking height.           */
/* ==================================================================== */

export function CompactMinimalMarquee({
  state,
  userTz,
}: {
  state: MarketState;
  userTz: string;
}) {
  const reduceMotion = useReducedMotion();
  const duration = pulseDuration(state.pulse);
  const runPulse = !reduceMotion && duration > 0 && state.pulse !== "stutter";
  const countdown = formatEvent(state.event, userTz);

  const parts = [state.headline, countdown].filter(Boolean);

  return (
    <div className="relative rounded-xl bg-muted/40 border border-border/50 px-3.5 py-2 overflow-hidden">
      <div className="flex items-center gap-2">
        <span className={cn("h-[6px] w-[6px] rounded-full shrink-0", kindDotClass(state))} />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground shrink-0">
          {compactStatusWord(state)}
        </span>
        <span className="text-[11px] text-muted-foreground/60 shrink-0">·</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={state.id}
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -4, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="flex-1 min-w-0 text-[12px] font-medium text-muted-foreground truncate"
          >
            {parts.join(" · ")}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Subtle tempo line at the bottom */}
      <div className="relative mt-1 h-[1px]">
        <div className="absolute inset-0 bg-border/60" />
        {runPulse && (
          <motion.div
            className="absolute top-0 h-[1px] w-[28%] rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, hsl(var(--foreground) / 0.85) 50%, transparent 100%)",
            }}
            initial={{ x: "-40%" }}
            animate={{ x: "340%" }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: duration * 0.15,
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  Directions registry — feeds the showcase page                        */
/* ==================================================================== */

export interface CompactDirectionDef {
  id: string;
  label: string;
  tagline: string;
  approxHeight: string;
  Component: React.ComponentType<{ state: MarketState; userTz: string }>;
}

export const compactDirections: CompactDirectionDef[] = [
  {
    id: "inline-strip",
    label: "V1 — Inline Strip",
    tagline: "Single row. Dot + status + headline left, countdown right.",
    approxHeight: "~40px",
    Component: CompactInlineStrip,
  },
  {
    id: "segmented-capsule",
    label: "V2 — Segmented Capsule",
    tagline: "Pill with two halves: inverted status chip meets countdown.",
    approxHeight: "36px",
    Component: CompactSegmentedCapsule,
  },
  {
    id: "day-progress",
    label: "V3 — Day Progress",
    tagline: "Status chip plus a thin 24-hour timeline of where we are.",
    approxHeight: "~42px",
    Component: CompactDayProgress,
  },
  {
    id: "triple-cell",
    label: "V4 — Triple Cell",
    tagline: "Three divided cells: status | headline | countdown.",
    approxHeight: "44px",
    Component: CompactTripleCell,
  },
  {
    id: "minimal-marquee",
    label: "V5 — Minimal Marquee",
    tagline: "Ultra-thin chain of status · headline · countdown with a pulse line.",
    approxHeight: "~36px",
    Component: CompactMinimalMarquee,
  },
];
