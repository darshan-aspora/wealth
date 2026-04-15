"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ================================================================== */
/*  State data                                                          */
/* ================================================================== */

export type MarketStateId =
  | "pre_market_early"
  | "pre_market_active"
  | "opening_soon"
  | "just_opened"
  | "open_steady"
  | "power_hour"
  | "closing_soon"
  | "just_closed"
  | "after_hours_active"
  | "after_hours_ending"
  | "closed_overnight"
  | "weekend"
  | "holiday_full"
  | "holiday_early_close"
  | "holiday_tomorrow"
  | "emergency_closure"
  | "circuit_breaker"
  | "data_delay";

export type PulseMode = "off" | "slow" | "normal" | "fast" | "stutter";
export type Ambience =
  | "dawn"
  | "morning"
  | "midday"
  | "afternoon"
  | "golden"
  | "twilight"
  | "night"
  | "weekend"
  | "festive"
  | "muted";
export type StatusKind =
  | "pre"
  | "live"
  | "closing"
  | "after"
  | "night"
  | "weekend"
  | "holiday"
  | "emergency"
  | "paused"
  | "delay";

export interface MarketState {
  id: MarketStateId;
  name: string;
  eyebrow: string; // small status word e.g. "PRE-MARKET", "LIVE"
  headline: string;
  body: string;
  event: MarketEvent | null;
  dayProgress: number; // 0..1 position in a 24h day (ET)
  isLive: boolean;
  isPaused?: boolean;
  kind: StatusKind;
  pulse: PulseMode;
  ambience: Ambience;
  notice?: string; // shown below the bar for unusual states (holiday, emergency, etc.)
}

// Structured event so we can localize + choose countdown vs absolute time.
export interface MarketEvent {
  verb: string; // e.g. "Opens", "Closes", "Ends", "Resumes", "NY closes"
  minutesAway: number; // simulated minutes until the event
  etHour?: number; // 0..23 (ET) — omit for relative-only events (e.g. circuit breaker)
  etMinute?: number; // 0..59
  dayLabel?: string; // "tomorrow", "Monday" etc. — for events > 1 day away
}

/* Timezone helpers */
function tzOffsetMinutes(tz: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(at);
  const o: Record<string, string> = {};
  for (const p of parts) o[p.type] = p.value;
  let h = parseInt(o.hour, 10);
  if (h === 24) h = 0;
  const asUTC = Date.UTC(
    +o.year,
    +o.month - 1,
    +o.day,
    h,
    +o.minute,
    +o.second
  );
  return (asUTC - at.getTime()) / 60000;
}

function convertETtoTz(
  etHour: number,
  etMinute: number,
  userTz: string
): { hour: number; minute: number } {
  const now = new Date();
  const etOffset = tzOffsetMinutes("America/New_York", now);
  const userOffset = tzOffsetMinutes(userTz, now);
  const delta = userOffset - etOffset;
  const totalEt = etHour * 60 + etMinute;
  const totalUser = totalEt + delta;
  const wrapped = ((totalUser % 1440) + 1440) % 1440;
  return {
    hour: Math.floor(wrapped / 60),
    minute: Math.round(wrapped % 60),
  };
}

function formatClockTime(hour: number, minute: number): string {
  const h12 = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

/**
 * Formats an event for a given user timezone.
 * - If minutesAway > 60 AND we have an ET time → show absolute clock time in user TZ
 * - Otherwise → show the countdown in minutes
 */
export function formatEvent(
  event: MarketEvent | null | undefined,
  userTz: string
): string {
  if (!event) return "";
  const useAbsolute = event.minutesAway > 60 && event.etHour !== undefined;
  if (useAbsolute) {
    if (event.dayLabel) {
      return `${event.verb} ${event.dayLabel}`;
    }
    const { hour, minute } = convertETtoTz(
      event.etHour!,
      event.etMinute ?? 0,
      userTz
    );
    return `${event.verb} at ${formatClockTime(hour, minute)}`;
  }
  return `${event.verb} in ${event.minutesAway}m`;
}

// NYSE hours mapped to day progress (ET).
// 9:30 AM = 9.5/24 ≈ 0.3958
// 4:00 PM = 16/24 ≈ 0.6667
export const MARKET_OPEN = 9.5 / 24;
export const MARKET_CLOSE = 16 / 24;
export const AFTER_HOURS_END = 20 / 24;
export const PRE_MARKET_START = 4 / 24;

export const marketStates: MarketState[] = [
  {
    id: "pre_market_early",
    name: "Pre-market (early)",
    eyebrow: "Pre-market",
    headline: "Quiet before the bell",
    body: "Thin volume. Prices are noisy.",
    event: { verb: "Opens", minutesAway: 272, etHour: 9, etMinute: 30 },
    dayProgress: 5 / 24,
    isLive: false,
    kind: "pre",
    pulse: "slow",
    ambience: "dawn",
  },
  {
    id: "pre_market_active",
    name: "Pre-market (active)",
    eyebrow: "Pre-market",
    headline: "Warming up",
    body: "NVDA up 2.1% on earnings. Open soon.",
    event: { verb: "Opens", minutesAway: 47, etHour: 9, etMinute: 30 },
    dayProgress: 8.72 / 24,
    isLive: false,
    kind: "pre",
    pulse: "normal",
    ambience: "dawn",
  },
  {
    id: "opening_soon",
    name: "Opening soon",
    eyebrow: "Opening bell",
    headline: "Opens in 14 minutes",
    body: "Market orders fire at 9:30. Limit orders queue.",
    event: { verb: "Opens", minutesAway: 14, etHour: 9, etMinute: 30 },
    dayProgress: 9.26 / 24,
    isLive: false,
    kind: "pre",
    pulse: "fast",
    ambience: "dawn",
  },
  {
    id: "just_opened",
    name: "Just opened",
    eyebrow: "Live",
    headline: "Opening minutes",
    body: "First 30 min can whipsaw. Spreads widen.",
    event: { verb: "Closes", minutesAway: 379, etHour: 16, etMinute: 0 },
    dayProgress: 9.68 / 24,
    isLive: true,
    kind: "live",
    pulse: "fast",
    ambience: "morning",
  },
  {
    id: "open_steady",
    name: "Open (steady)",
    eyebrow: "Live",
    headline: "Markets open",
    body: "Trading through 4:00 PM ET.",
    event: { verb: "Closes", minutesAway: 201, etHour: 16, etMinute: 0 },
    dayProgress: 12.65 / 24,
    isLive: true,
    kind: "live",
    pulse: "normal",
    ambience: "midday",
  },
  {
    id: "power_hour",
    name: "Power hour",
    eyebrow: "Live",
    headline: "Power hour",
    body: "Volume picks up into the close.",
    event: { verb: "Closes", minutesAway: 42, etHour: 16, etMinute: 0 },
    dayProgress: 15.3 / 24,
    isLive: true,
    kind: "live",
    pulse: "normal",
    ambience: "afternoon",
  },
  {
    id: "closing_soon",
    name: "Closing soon",
    eyebrow: "Closing bell",
    headline: "Closes in 9 minutes",
    body: "Closing auction settles final prices.",
    event: { verb: "Closes", minutesAway: 9, etHour: 16, etMinute: 0 },
    dayProgress: 15.85 / 24,
    isLive: true,
    kind: "closing",
    pulse: "fast",
    ambience: "golden",
  },
  {
    id: "just_closed",
    name: "Just closed",
    eyebrow: "Closed",
    headline: "Settling",
    body: "Regular session over. After-hours warming up.",
    event: { verb: "Ends", minutesAway: 225, etHour: 20, etMinute: 0 },
    dayProgress: 16.25 / 24,
    isLive: false,
    kind: "after",
    pulse: "slow",
    ambience: "golden",
  },
  {
    id: "after_hours_active",
    name: "After-hours (active)",
    eyebrow: "After-hours",
    headline: "Lighter volume",
    body: "Bid-ask spreads wider than usual.",
    event: { verb: "Ends", minutesAway: 74, etHour: 20, etMinute: 0 },
    dayProgress: 18.77 / 24,
    isLive: false,
    kind: "after",
    pulse: "slow",
    ambience: "twilight",
  },
  {
    id: "after_hours_ending",
    name: "After-hours (ending)",
    eyebrow: "After-hours",
    headline: "Last call",
    body: "Final 30 minutes, then dark till morning.",
    event: { verb: "Ends", minutesAway: 28, etHour: 20, etMinute: 0 },
    dayProgress: 19.53 / 24,
    isLive: false,
    kind: "after",
    pulse: "slow",
    ambience: "twilight",
  },
  {
    id: "closed_overnight",
    name: "Closed (overnight)",
    eyebrow: "Closed",
    headline: "Overnight",
    body: "Good time to plan. We'll wake you at the bell.",
    event: {
      verb: "Opens",
      minutesAway: 642,
      etHour: 9,
      etMinute: 30,
      dayLabel: "tomorrow",
    },
    dayProgress: 22.8 / 24,
    isLive: false,
    kind: "night",
    pulse: "off",
    ambience: "night",
  },
  {
    id: "weekend",
    name: "Weekend",
    eyebrow: "Weekend",
    headline: "Markets are off",
    body: "Closed Saturday and Sunday. Good time to read.",
    event: {
      verb: "Opens",
      minutesAway: 99999,
      etHour: 9,
      etMinute: 30,
      dayLabel: "Monday",
    },
    dayProgress: 13 / 24,
    isLive: false,
    kind: "weekend",
    pulse: "off",
    ambience: "weekend",
  },
  {
    id: "holiday_full",
    name: "Holiday",
    eyebrow: "Holiday",
    headline: "Closed for Juneteenth",
    body: "US markets closed in observance.",
    event: {
      verb: "Opens",
      minutesAway: 1080,
      etHour: 9,
      etMinute: 30,
      dayLabel: "tomorrow",
    },
    dayProgress: 12 / 24,
    isLive: false,
    kind: "holiday",
    pulse: "off",
    ambience: "festive",
    notice: "US markets are closed today in observance of Juneteenth.",
  },
  {
    id: "holiday_early_close",
    name: "Early close day",
    eyebrow: "Live (early close)",
    headline: "Closing early today",
    body: "Markets close at 1:00 PM ET for Thanksgiving eve.",
    event: { verb: "Closes", minutesAway: 134, etHour: 13, etMinute: 0 },
    dayProgress: 10.77 / 24,
    isLive: true,
    kind: "live",
    pulse: "slow",
    ambience: "golden",
    notice: "Early close today. Markets shut early for Thanksgiving eve.",
  },
  {
    id: "holiday_tomorrow",
    name: "Holiday heads-up",
    eyebrow: "Live",
    headline: "Closed tomorrow",
    body: "US markets closed tomorrow for Independence Day.",
    event: { verb: "Closes", minutesAway: 82, etHour: 16, etMinute: 0 },
    dayProgress: 14.63 / 24,
    isLive: true,
    kind: "live",
    pulse: "normal",
    ambience: "afternoon",
    notice: "Heads up. US markets are closed tomorrow for Independence Day.",
  },
  {
    id: "emergency_closure",
    name: "Emergency closure",
    eyebrow: "Closed",
    headline: "Special observance",
    body: "Markets closed today. Regular sessions resume soon.",
    event: {
      verb: "Opens",
      minutesAway: 99999,
      etHour: 9,
      etMinute: 30,
      dayLabel: "Monday",
    },
    dayProgress: 12 / 24,
    isLive: false,
    kind: "emergency",
    pulse: "off",
    ambience: "muted",
    notice: "Markets closed today by exchange order. Regular sessions resume Monday.",
  },
  {
    id: "circuit_breaker",
    name: "Circuit breaker",
    eyebrow: "Paused",
    headline: "Market-wide halt",
    body: "Trading paused for volatility. Resume expected in ~15 min.",
    event: { verb: "Resumes", minutesAway: 12 },
    dayProgress: 11.5 / 24,
    isLive: false,
    isPaused: true,
    kind: "paused",
    pulse: "stutter",
    ambience: "muted",
    notice: "Trading paused across all US exchanges due to a volatility circuit breaker.",
  },
  {
    id: "data_delay",
    name: "Data delay",
    eyebrow: "Delayed",
    headline: "Status is a bit behind",
    body: "Our feed is a few minutes behind. Working on it.",
    event: null,
    dayProgress: 12 / 24,
    isLive: false,
    kind: "delay",
    pulse: "off",
    ambience: "muted",
    notice: "Our market data feed is running a few minutes behind. Working on it.",
  },
];

/* ================================================================== */
/*  Shared utilities                                                    */
/* ================================================================== */

function pulseDuration(mode: PulseMode) {
  switch (mode) {
    case "fast":
      return 1.4;
    case "normal":
      return 2.4;
    case "slow":
      return 3.6;
    default:
      return 0;
  }
}

/* ================================================================== */
/*  V1 — Pulse Bar                                                      */
/*  The pulse IS the hero. A single travelling glow along a thin line.  */
/* ================================================================== */

export function MarketStatusPulseBar({
  state,
  userTz,
}: {
  state: MarketState;
  userTz: string;
}) {
  const reduceMotion = useReducedMotion();
  const duration = pulseDuration(state.pulse);
  const runPulse = !reduceMotion && duration > 0 && state.pulse !== "stutter";

  return (
    <div className="rounded-2xl bg-muted/60 border border-border/50 px-4 py-3.5">
      {/* Row 1 — status + pulse line + countdown */}
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.22em] text-foreground">
          {state.eyebrow}
        </span>

        <div className="relative flex-1 h-[2px] min-w-[60px]">
          <div className="absolute inset-0 my-auto h-[1px] bg-border" />
          {runPulse && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 h-[3px] w-[28%] rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, hsl(var(--foreground) / 0.9) 50%, transparent 100%)",
                filter: "blur(0.3px)",
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
          {state.pulse === "stutter" && !reduceMotion && (
            <motion.div
              className="absolute inset-y-[-1px] inset-x-[30%] rounded-full bg-foreground/70"
              animate={{ opacity: [0, 1, 0, 0.4, 0, 1, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.12, 0.22, 0.35, 0.5, 0.65, 0.85] }}
            />
          )}
        </div>

        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-muted-foreground min-w-[64px] text-right">
          {formatEvent(state.event, userTz) || "—"}
        </span>
      </div>

      {/* Row 2 — headline */}
      <p className="mt-1.5 text-[12px] font-semibold text-foreground leading-snug">
        {state.headline}
      </p>
    </div>
  );
}

/* ================================================================== */
/*  V2 — Day Arc                                                        */
/*  24-hour horizontal line; market hours highlighted; indicator dot.   */
/* ================================================================== */

export function MarketStatusDayArc({
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

  return (
    <div className="rounded-2xl bg-muted/60 border border-border/50 px-4 py-3.5">
      {/* Header row */}
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-foreground">
            {state.eyebrow}
          </span>
          <span className="text-[12px] font-medium text-muted-foreground truncate">
            {state.headline}
          </span>
        </div>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">
          {formatEvent(state.event, userTz) || "—"}
        </span>
      </div>

      {/* Arc */}
      <div className="relative h-[18px]">
        {/* Base full-day line */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-border" />

        {/* Pre-market band */}
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-foreground/15"
          style={{ left: `${prePct}%`, right: `${100 - openPct}%` }}
        />
        {/* Market-hours band */}
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-foreground/85"
          style={{ left: `${openPct}%`, right: `${100 - closePct}%` }}
        />
        {/* After-hours band */}
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-foreground/15"
          style={{ left: `${closePct}%`, right: `${100 - afterPct}%` }}
        />

        {/* Current position marker */}
        <motion.div
          className="absolute top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background ring-[2px] ring-foreground"
          animate={{ left: `${posPct}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
        >
          {state.isLive && !reduceMotion && (
            <motion.span
              className="absolute inset-0 rounded-full bg-foreground"
              animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </motion.div>
      </div>

      {/* Scale labels */}
      <div className="relative mt-1.5 h-[10px] text-[9px] font-semibold tabular-nums text-muted-foreground/70">
        <span className="absolute left-0 -translate-x-0">12a</span>
        <span className="absolute" style={{ left: `${openPct}%`, transform: "translateX(-50%)" }}>
          9:30
        </span>
        <span className="absolute" style={{ left: `${closePct}%`, transform: "translateX(-50%)" }}>
          4p
        </span>
        <span className="absolute right-0 translate-x-0">12a</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  V3 — Dial                                                           */
/*  Small circular 24-hour dial with market-hours arc and hour hand.    */
/* ================================================================== */

export function MarketStatusDial({
  state,
  userTz,
}: {
  state: MarketState;
  userTz: string;
}) {
  const reduceMotion = useReducedMotion();

  const R = 20;
  const C = 24;
  const circumference = 2 * Math.PI * R;
  const openFrac = MARKET_CLOSE - MARKET_OPEN;
  const arcLen = openFrac * circumference;

  // Hand angle — 0 deg = top (midnight)
  const handAngle = state.dayProgress * 360 - 90; // -90 to put midnight at top
  const handX = C + R * 0.9 * Math.cos((handAngle * Math.PI) / 180);
  const handY = C + R * 0.9 * Math.sin((handAngle * Math.PI) / 180);

  // Arc offset — start at 9:30 which is 9.5/24 of full circle
  const arcOffset = -MARKET_OPEN * circumference;

  return (
    <div className="rounded-2xl bg-muted/60 border border-border/50 px-4 py-3.5 flex items-center gap-3.5">
      {/* Dial */}
      <div className="relative shrink-0 h-12 w-12">
        <svg viewBox={`0 0 ${2 * C} ${2 * C}`} className="h-full w-full -rotate-90">
          {/* Base ring */}
          <circle
            cx={C}
            cy={C}
            r={R}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
          />
          {/* Market-hours arc */}
          <circle
            cx={C}
            cy={C}
            r={R}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${circumference - arcLen}`}
            strokeDashoffset={arcOffset}
          />
        </svg>
        {/* Hand */}
        <svg viewBox={`0 0 ${2 * C} ${2 * C}`} className="absolute inset-0 h-full w-full">
          <motion.line
            x1={C}
            y1={C}
            x2={handX}
            y2={handY}
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={false}
            animate={{ x2: handX, y2: handY }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
          />
          <circle cx={C} cy={C} r="2" fill="hsl(var(--foreground))" />
          <motion.circle
            cx={handX}
            cy={handY}
            r="2.5"
            fill="hsl(var(--foreground))"
            initial={false}
            animate={{ cx: handX, cy: handY }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
          />
          {state.isLive && !reduceMotion && (
            <motion.circle
              cx={handX}
              cy={handY}
              r="2.5"
              fill="hsl(var(--foreground))"
              animate={{ r: [2.5, 6, 2.5], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-foreground shrink-0">
              {state.eyebrow}
            </span>
            <span className="text-[13px] font-semibold text-foreground truncate">
              · {state.headline}
            </span>
          </div>
          <span className="shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">
            {formatEvent(state.event, userTz)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  V4 — Typographic                                                    */
/*  Big bold status verb. Letter-cascade morph on state change.         */
/* ================================================================== */

function bigStatusWord(state: MarketState): string {
  switch (state.kind) {
    case "live":
      return "LIVE";
    case "pre":
      return state.id === "opening_soon" ? "OPENING" : "PRE-MARKET";
    case "closing":
      return "CLOSING";
    case "after":
      return "AFTER-HOURS";
    case "night":
      return "CLOSED";
    case "weekend":
      return "WEEKEND";
    case "holiday":
      return "HOLIDAY";
    case "emergency":
      return "OBSERVANCE";
    case "paused":
      return "PAUSED";
    case "delay":
      return "DELAYED";
  }
}

export function MarketStatusTypographic({
  state,
  userTz,
}: {
  state: MarketState;
  userTz: string;
}) {
  const word = bigStatusWord(state);

  return (
    <div className="rounded-2xl bg-background border border-border/50 px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="relative h-[18px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={word}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 text-[12px] font-extrabold tracking-[0.12em] text-muted-foreground/50 whitespace-nowrap"
              >
                {word}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="mt-1 text-[14px] font-normal tabular-nums text-foreground">
            {formatEvent(state.event, userTz) || "—"}
          </p>
        </div>

        {/* Right side — reserved */}
        <div className="shrink-0" />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  V5 — Atmospheric                                                    */
/*  Background shifts per state. Minimal color, mostly tonal.           */
/* ================================================================== */

type AmbienceStyle = { light: string; dark: string };

const ambienceStyles: Record<Ambience, AmbienceStyle> = {
  dawn: {
    light:
      "linear-gradient(160deg, hsl(24 40% 96%) 0%, hsl(210 30% 97%) 100%)",
    dark:
      "linear-gradient(160deg, hsl(260 20% 10%) 0%, hsl(220 25% 13%) 100%)",
  },
  morning: {
    light: "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(210 20% 98%) 100%)",
    dark: "linear-gradient(180deg, hsl(220 20% 12%) 0%, hsl(220 15% 10%) 100%)",
  },
  midday: {
    light: "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 99%) 100%)",
    dark: "linear-gradient(180deg, hsl(220 10% 14%) 0%, hsl(220 10% 12%) 100%)",
  },
  afternoon: {
    light: "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(30 20% 98%) 100%)",
    dark: "linear-gradient(180deg, hsl(220 10% 13%) 0%, hsl(30 10% 11%) 100%)",
  },
  golden: {
    light:
      "linear-gradient(180deg, hsl(35 40% 97%) 0%, hsl(24 45% 94%) 100%)",
    dark:
      "linear-gradient(180deg, hsl(25 20% 14%) 0%, hsl(15 25% 11%) 100%)",
  },
  twilight: {
    light:
      "linear-gradient(180deg, hsl(220 25% 95%) 0%, hsl(245 20% 93%) 100%)",
    dark:
      "linear-gradient(180deg, hsl(230 25% 13%) 0%, hsl(250 25% 10%) 100%)",
  },
  night: {
    light:
      "linear-gradient(180deg, hsl(230 15% 95%) 0%, hsl(230 20% 91%) 100%)",
    dark:
      "linear-gradient(180deg, hsl(230 25% 8%) 0%, hsl(230 30% 6%) 100%)",
  },
  weekend: {
    light:
      "linear-gradient(180deg, hsl(30 25% 97%) 0%, hsl(25 35% 94%) 100%)",
    dark:
      "linear-gradient(180deg, hsl(30 10% 12%) 0%, hsl(25 12% 10%) 100%)",
  },
  festive: {
    light:
      "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(45 30% 96%) 100%)",
    dark:
      "linear-gradient(180deg, hsl(220 15% 12%) 0%, hsl(45 10% 11%) 100%)",
  },
  muted: {
    light: "linear-gradient(180deg, hsl(0 0% 97%) 0%, hsl(0 0% 95%) 100%)",
    dark: "linear-gradient(180deg, hsl(220 5% 12%) 0%, hsl(220 5% 10%) 100%)",
  },
};

export function MarketStatusAtmospheric({
  state,
  theme,
  userTz,
}: {
  state: MarketState;
  theme: "light" | "dark";
  userTz: string;
}) {
  const reduceMotion = useReducedMotion();
  const bg = ambienceStyles[state.ambience][theme];

  // Tiny starfield only for "night" ambience
  const showStars = state.ambience === "night";

  return (
    <div className="relative rounded-2xl border border-border/50 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.ambience + theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ background: bg }}
        />
      </AnimatePresence>

      {showStars && !reduceMotion && (
        <div className="pointer-events-none absolute inset-0 opacity-60">
          {[...Array(10)].map((_, i) => (
            <motion.span
              key={i}
              className={cn(
                "absolute h-[1.5px] w-[1.5px] rounded-full",
                theme === "dark" ? "bg-white" : "bg-foreground/60"
              )}
              style={{
                left: `${(i * 41 + 7) % 100}%`,
                top: `${(i * 29 + 11) % 100}%`,
              }}
              animate={{ opacity: [0.15, 0.7, 0.15] }}
              transition={{
                duration: 2 + (i % 4),
                delay: (i % 5) * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      <div className="relative px-4 py-3.5">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            {/* Live dot */}
            <motion.span
              className={cn(
                "h-[7px] w-[7px] rounded-full shrink-0",
                state.isLive ? "bg-foreground" : "bg-foreground/30"
              )}
              animate={
                state.isLive && !reduceMotion
                  ? { scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }
                  : {}
              }
              transition={{
                duration: pulseDuration(state.pulse) || 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-foreground truncate">
              {state.eyebrow}
            </span>
          </div>
          <span className="shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">
            {formatEvent(state.event, userTz) || "—"}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={state.id}
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -6, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-[15px] font-bold text-foreground leading-tight tracking-tight"
          >
            {state.headline}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Directions registry                                                 */
/* ================================================================== */

export interface DirectionDef {
  id: string;
  label: string;
  tagline: string;
  Component: React.ComponentType<{
    state: MarketState;
    theme: "light" | "dark";
    userTz: string;
  }>;
}

export const marketStatusDirections: DirectionDef[] = [
  {
    id: "pulse-bar",
    label: "V1 — Pulse Bar",
    tagline: "A single travelling glow is the heartbeat.",
    Component: ({ state, userTz }) => (
      <MarketStatusPulseBar state={state} userTz={userTz} />
    ),
  },
  {
    id: "day-arc",
    label: "V2 — Day Arc",
    tagline: "24-hour line. Market hours emphasized. Position marker moves.",
    Component: ({ state, userTz }) => (
      <MarketStatusDayArc state={state} userTz={userTz} />
    ),
  },
  {
    id: "dial",
    label: "V3 — Dial",
    tagline: "Small clock face with market-hour arc and live hand.",
    Component: ({ state, userTz }) => (
      <MarketStatusDial state={state} userTz={userTz} />
    ),
  },
  {
    id: "typographic",
    label: "V4 — Typographic",
    tagline: "Status word is the hero. Letters cascade on change.",
    Component: ({ state, userTz }) => (
      <MarketStatusTypographic state={state} userTz={userTz} />
    ),
  },
  {
    id: "atmospheric",
    label: "V5 — Atmospheric",
    tagline: "Background carries the mood. Foreground stays clean.",
    Component: ({ state, theme, userTz }) => (
      <MarketStatusAtmospheric state={state} theme={theme} userTz={userTz} />
    ),
  },
];

/* ================================================================== */
/*  Market Sentiment Gauge                                              */
/* ================================================================== */

export type Sentiment = "extreme-fear" | "fear" | "greed" | "extreme-greed";

export const sentimentOrder: Sentiment[] = [
  "extreme-fear",
  "fear",
  "greed",
  "extreme-greed",
];

const sentimentLabels: Record<Sentiment, string> = {
  "extreme-fear": "Extreme Fear",
  fear: "Fear",
  greed: "Greed",
  "extreme-greed": "Extreme Greed",
};

const sentimentColors: Record<Sentiment, string> = {
  "extreme-fear": "#10b981", // emerald-500 — be greedy when others are fearful
  fear: "#eab308", // yellow-500
  greed: "#f97316", // orange-500
  "extreme-greed": "#ef4444", // red-500 — danger, overheated
};

export function MarketSentimentWidget({
  sentiment,
  onToggle,
}: {
  sentiment: Sentiment;
  onToggle?: () => void;
}) {
  // SVG arc geometry
  const cx = 32;
  const cy = 30;
  const r = 24;
  const gapDeg = 6;
  const segDeg = (180 - 3 * gapDeg) / 4;

  const segments = sentimentOrder.map((s, i) => {
    const startDeg = 180 - i * (segDeg + gapDeg);
    const endDeg = startDeg - segDeg;
    const sRad = (startDeg * Math.PI) / 180;
    const eRad = (endDeg * Math.PI) / 180;
    const sx = (cx + r * Math.cos(sRad)).toFixed(2);
    const sy = (cy - r * Math.sin(sRad)).toFixed(2);
    const ex = (cx + r * Math.cos(eRad)).toFixed(2);
    const ey = (cy - r * Math.sin(eRad)).toFixed(2);
    return {
      id: s,
      d: `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`,
      color: sentimentColors[s],
    };
  });

  const activeIdx = sentimentOrder.indexOf(sentiment);
  const needleDeg = 180 - activeIdx * (segDeg + gapDeg) - segDeg / 2;
  const needleRad = (needleDeg * Math.PI) / 180;
  const nx = cx + (r - 4) * Math.cos(needleRad);
  const ny = cy - (r - 4) * Math.sin(needleRad);

  return (
    <button
      onClick={onToggle}
      className="relative h-full w-full rounded-2xl bg-background border border-border/50 px-4 py-3.5 text-left active:scale-[0.99] transition-transform"
    >
      <p className="text-[12px] font-extrabold tracking-[0.12em] text-muted-foreground/50 uppercase whitespace-nowrap">
        Market Mood
      </p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-[14px] font-normal text-foreground whitespace-nowrap truncate min-w-0">
          {sentimentLabels[sentiment]}
        </p>

        <svg
          viewBox="0 0 64 34"
          className="shrink-0 w-[56px] h-[28px]"
          aria-hidden
        >
          {segments.map((seg) => (
            <path
              key={seg.id}
              d={seg.d}
              stroke={seg.color}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity={seg.id === sentiment ? 1 : 0.25}
            />
          ))}
          <motion.line
            x1={cx}
            y1={cy}
            initial={false}
            animate={{ x2: nx, y2: ny }}
            stroke="hsl(var(--foreground))"
            strokeWidth="1.4"
            strokeLinecap="round"
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
          />
          <circle cx={cx} cy={cy} r="1.6" fill="hsl(var(--foreground))" />
        </svg>
      </div>
    </button>
  );
}

/* ================================================================== */
/*  Combined Status + Mood Bar (single full-bleed strip)                */
/* ================================================================== */

export function MarketStatusCombinedBar({
  state,
  userTz,
  onToggleStatus,
}: {
  state: MarketState;
  userTz: string;
  onToggleStatus?: () => void;
}) {
  const word = bigStatusWord(state);
  const countdownText = formatEvent(state.event, userTz);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <button
        onClick={onToggleStatus}
        className="w-full px-5 py-5 text-left active:opacity-80 transition-opacity"
      >
        <p className="text-[12px] font-extrabold tracking-[0.12em] text-zinc-500 uppercase flex items-center gap-2">
          {word}
          {state.isLive && (
            <span className="relative flex h-[7px] w-[7px]">
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              <span className="relative rounded-full h-[7px] w-[7px] bg-red-500" />
            </span>
          )}
        </p>
        <p className="mt-1 text-[14px] font-normal tabular-nums text-zinc-900">
          {countdownText || "—"}
        </p>
      </button>

      {/* Notice — for unusual states */}
      {state.notice && (
        <p className="px-5 py-2 text-[12px] font-medium text-amber-800 leading-snug bg-amber-50 border-t border-zinc-200">
          {state.notice}
        </p>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Region options + helpers                                            */
/* ================================================================== */

export interface RegionOption {
  id: string;
  label: string;
  tz: string | null; // null = use browser
}

export const regionOptions: RegionOption[] = [
  { id: "auto", label: "Auto (device)", tz: null },
  { id: "ny", label: "New York", tz: "America/New_York" },
  { id: "london", label: "London", tz: "Europe/London" },
  { id: "mumbai", label: "Mumbai", tz: "Asia/Kolkata" },
  { id: "singapore", label: "Singapore", tz: "Asia/Singapore" },
  { id: "dubai", label: "Dubai", tz: "Asia/Dubai" },
  { id: "sydney", label: "Sydney", tz: "Australia/Sydney" },
];

export function getBrowserTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "America/New_York";
  }
}
