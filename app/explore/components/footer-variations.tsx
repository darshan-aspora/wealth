"use client";

import {
  ChevronRight,
  MessageCircle,
  Phone,
  Mail,
  ArrowUpRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Shared content — structure is identical across all variants        */
/* ------------------------------------------------------------------ */

const CO_CREATE = [
  { title: "Vote on what we build", sub: "1,247 votes this week", accent: true },
  { title: "Share your feedback", sub: "What works, what doesn\u2019t" },
  { title: "Join a research session", sub: "Help us understand you better" },
];

const CONTACT: { icon: LucideIcon; label: string; tat: string }[] = [
  { icon: MessageCircle, label: "Chat", tat: "Instant" },
  { icon: Phone, label: "Schedule a Call", tat: "Pick a time" },
  { icon: Mail, label: "Write to CEO", tat: "Usually 48h" },
];

const TRUST_BADGES = ["SIPC insured", "Segregated accounts", "Alpaca Securities", "256-bit encryption"];

/* ==================================================================== */
/*  V1 — EDITORIAL                                                       */
/*  Left-aligned hero, large index numerals (01/02/03), thin rules,      */
/*  outlined contact circles. Feels like a magazine back-page.           */
/* ==================================================================== */

export function ExploreFooterV1() {
  return (
    <div className="relative -mx-5 mt-4 bg-background">
      <div className="px-6 pt-14 pb-10">
        {/* Hero */}
        <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-muted-foreground/60">
          The Exchange
        </p>
        <h2 className="mt-3 text-[34px] font-bold text-foreground leading-[1.05] tracking-tight">
          We answer<br />to you.
        </h2>
        <p className="mt-4 text-[16px] text-muted-foreground leading-relaxed max-w-[280px]">
          Built around how you invest. Tell us how to make it better.
        </p>

        {/* Co-create — numbered index list */}
        <div className="mt-10 border-t border-border/50">
          {CO_CREATE.map((item, i) => (
            <button
              key={item.title}
              className="group flex w-full items-start gap-5 border-b border-border/50 py-5 text-left active:bg-foreground/[0.03] transition-colors"
            >
              <span className="text-[24px] font-bold text-muted-foreground/30 leading-none tabular-nums w-10 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <p className="text-[17px] font-semibold text-foreground leading-tight">{item.title}</p>
                <p className="mt-1 text-[14px] text-muted-foreground">{item.sub}</p>
              </div>
              <ArrowUpRight size={18} className="text-muted-foreground/40 mt-1 group-active:translate-x-0.5 group-active:-translate-y-0.5 transition-transform" />
            </button>
          ))}
        </div>

        {/* Divider */}
        <p className="mt-10 text-[11px] font-semibold tracking-[0.24em] uppercase text-muted-foreground/60">
          Need a human?
        </p>

        {/* Contact — outlined circles, left-aligned row */}
        <div className="mt-5 flex items-center gap-3">
          {CONTACT.map((item) => (
            <button
              key={item.label}
              className="flex-1 flex flex-col items-start gap-3 rounded-2xl border border-border/60 px-4 py-4 active:bg-foreground/[0.03] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border">
                <item.icon size={16} strokeWidth={1.8} className="text-foreground" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground leading-tight">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.tat}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Trust — tight single-line */}
        <div className="mt-10 pt-6 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-gain animate-ping opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-gain" />
            </span>
            <span className="text-[11px] text-muted-foreground/70">Operational</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <span>SIPC</span>
            <span className="text-muted-foreground/30">·</span>
            <span>Segregated</span>
            <span className="text-muted-foreground/30">·</span>
            <span>Alpaca</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  V2 — TACTILE CARDS                                                   */
/*  Soft gradient background, elevated cards with left accent bars,      */
/*  grid-style contacts, chip-style trust badges.                        */
/* ==================================================================== */

export function ExploreFooterV2() {
  return (
    <div className="relative -mx-5 mt-4">
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.04] via-foreground/[0.02] to-transparent rounded-t-[36px]" />
      <div className="relative px-5 pt-14 pb-10">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 rounded-full bg-foreground/[0.06] px-3 py-1">
            <Sparkles size={12} className="text-foreground/70" />
            <span className="text-[11px] font-semibold tracking-wide text-foreground/70">Built with you</span>
          </div>
          <h2 className="mt-4 text-[30px] font-bold text-foreground leading-[1.1] tracking-tight">
            We answer to you
          </h2>
          <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed max-w-[300px]">
            Built around how you invest.<br />Tell us how to make it better.
          </p>
        </div>

        {/* Co-create — cards with accent strip */}
        <div className="mt-8 space-y-3">
          {CO_CREATE.map((item, i) => (
            <button
              key={item.title}
              className="group relative flex w-full items-center overflow-hidden rounded-2xl bg-background border border-border/50 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-transform"
            >
              <span
                className={cn(
                  "h-full w-1 self-stretch shrink-0",
                  i === 0 ? "bg-gain" : i === 1 ? "bg-foreground/30" : "bg-foreground/15"
                )}
              />
              <div className="flex-1 flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[16px] font-semibold text-foreground">{item.title}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{item.sub}</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground/40 group-active:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.2em]">Need a human?</span>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {/* Contact — grid of 3 cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {CONTACT.map((item) => (
            <button
              key={item.label}
              className="flex flex-col items-center gap-2.5 rounded-2xl bg-background border border-border/50 px-2 py-4 active:scale-[0.97] transition-transform shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground/[0.05]">
                <item.icon size={20} strokeWidth={1.8} className="text-foreground" />
              </div>
              <div className="text-center">
                <p className="text-[12px] font-semibold text-foreground leading-tight">{item.label}</p>
                <p className="text-[10.5px] text-muted-foreground mt-0.5">{item.tat}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Trust — chip badges */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-gain/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gain" />
            <span className="text-[11px] font-medium text-gain">All systems operational</span>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {TRUST_BADGES.map((b) => (
              <span key={b} className="text-[10.5px] font-medium text-muted-foreground/60 rounded-full border border-border/50 px-2.5 py-1">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  V3 — SWISS GRID                                                      */
/*  Monochrome, hairline rules, big negative space, left-aligned labels, */
/*  no cards, no rounding. Strict and calm.                              */
/* ==================================================================== */

export function ExploreFooterV3() {
  return (
    <div className="relative -mx-5 mt-4 bg-background border-t border-border">
      <div className="px-6 pt-12 pb-10">
        {/* Hero */}
        <div className="grid grid-cols-12 gap-3 pb-10 border-b border-border">
          <p className="col-span-3 text-[11px] font-semibold text-muted-foreground tabular-nums pt-2">01 —</p>
          <div className="col-span-9">
            <h2 className="text-[28px] font-bold text-foreground leading-[1.1] tracking-tight">
              We answer to you
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
              Built around how you invest. Tell us how to make it better.
            </p>
          </div>
        </div>

        {/* Co-create — hairline rows, grid-aligned */}
        <div>
          {CO_CREATE.map((item, i) => (
            <button
              key={item.title}
              className="group grid grid-cols-12 gap-3 w-full py-5 border-b border-border text-left active:bg-foreground/[0.02] transition-colors"
            >
              <span className="col-span-3 text-[11px] font-semibold text-muted-foreground tabular-nums pt-1">
                {String(i + 1).padStart(2, "0")} —
              </span>
              <div className="col-span-8">
                <p className="text-[17px] font-semibold text-foreground leading-tight">{item.title}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="col-span-1 text-muted-foreground/50 mt-1.5 justify-self-end" />
            </button>
          ))}
        </div>

        {/* Divider — inline */}
        <div className="grid grid-cols-12 gap-3 pt-10 pb-5">
          <p className="col-span-3 text-[11px] font-semibold text-muted-foreground tabular-nums">02 —</p>
          <p className="col-span-9 text-[11px] font-semibold tracking-[0.18em] uppercase text-foreground">
            Need a human?
          </p>
        </div>

        {/* Contact — 3 stacked hairline rows */}
        <div className="border-t border-border">
          {CONTACT.map((item) => (
            <button
              key={item.label}
              className="group grid grid-cols-12 gap-3 w-full items-center py-4 border-b border-border text-left active:bg-foreground/[0.02] transition-colors"
            >
              <div className="col-span-3 flex items-center">
                <item.icon size={18} strokeWidth={1.6} className="text-foreground" />
              </div>
              <p className="col-span-6 text-[15px] font-semibold text-foreground">{item.label}</p>
              <p className="col-span-3 text-[12px] text-muted-foreground text-right tabular-nums">{item.tat}</p>
            </button>
          ))}
        </div>

        {/* Trust — minimal strip */}
        <div className="grid grid-cols-12 gap-3 pt-8">
          <p className="col-span-3 text-[11px] font-semibold text-muted-foreground tabular-nums">03 —</p>
          <div className="col-span-9 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gain" />
              <span className="text-[11px] font-medium text-foreground">All systems operational</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              SIPC insured · Segregated accounts · Alpaca Securities · 256-bit encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  V4 — INVERTED HERO                                                   */
/*  Dark hero block sits above, actions float below as clean light rows, */
/*  contact is a horizontal ribbon. Premium, high-contrast.              */
/* ==================================================================== */

export function ExploreFooterV4() {
  return (
    <div className="relative -mx-5 mt-4">
      <div className="px-5 pb-10">
        {/* Hero — inverted dark block */}
        <div className="relative overflow-hidden rounded-3xl bg-foreground hero-invert px-6 pt-12 pb-10">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gain" />
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-background/50">
                Always on
              </span>
            </div>
            <h2 className="mt-4 text-[32px] font-bold text-background leading-[1.08] tracking-tight">
              We answer<br />to you.
            </h2>
            <p className="mt-3 text-[15px] text-background/60 leading-relaxed max-w-[300px]">
              Built around how you invest. Tell us how to make it better.
            </p>
          </div>
        </div>

        {/* Co-create — light rows */}
        <div className="mt-5 space-y-2">
          {CO_CREATE.map((item) => (
            <button
              key={item.title}
              className="group flex w-full items-center justify-between rounded-2xl bg-foreground/[0.03] px-5 py-4 text-left active:bg-foreground/[0.06] transition-colors"
            >
              <div>
                <p className="text-[16px] font-semibold text-foreground">{item.title}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border/60 group-active:translate-x-0.5 transition-transform">
                <ChevronRight size={15} className="text-foreground" />
              </div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-7">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            Need a human?
          </span>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {/* Contact — horizontal ribbon with dividers */}
        <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
          <div className="flex divide-x divide-border/60">
            {CONTACT.map((item) => (
              <button
                key={item.label}
                className="flex-1 flex flex-col items-center gap-2 px-2 py-5 active:bg-foreground/[0.03] transition-colors"
              >
                <item.icon size={20} strokeWidth={1.8} className="text-foreground" />
                <div className="text-center">
                  <p className="text-[12.5px] font-semibold text-foreground leading-tight">{item.label}</p>
                  <p className="text-[10.5px] text-muted-foreground mt-0.5">{item.tat}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trust */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gain" />
            <span className="text-[12px] text-muted-foreground">All systems operational</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground/50">
            {TRUST_BADGES.map((b, i) => (
              <span key={b} className="flex items-center gap-2">
                {i > 0 && <span>·</span>}
                <span>{b}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  V5 — WARM CONVERSATIONAL                                             */
/*  Rounded, soft, pill-heavy. Primary CTA emphasized. Feels like        */
/*  talking to a friend rather than a company.                           */
/* ==================================================================== */

export function ExploreFooterV5() {
  return (
    <div className="relative -mx-5 mt-4 bg-gradient-to-b from-foreground/[0.03] via-transparent to-transparent">
      <div className="px-6 pt-14 pb-10">
        {/* Hero — asymmetric, warm */}
        <div className="flex flex-col items-start">
          <h2 className="text-[32px] font-bold text-foreground leading-[1.08] tracking-tight">
            We answer<br />
            <span className="text-foreground/50">to you.</span>
          </h2>
          <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed">
            Built around how you invest. Tell us how to make it better — we&apos;re listening.
          </p>
        </div>

        {/* Co-create — first one hero, next two compact pills */}
        <div className="mt-8">
          <button className="group relative flex w-full items-center justify-between overflow-hidden rounded-[28px] bg-foreground px-6 py-5 text-left active:scale-[0.99] transition-transform">
            <div className="relative">
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-background/50">
                This week
              </p>
              <p className="mt-1 text-[18px] font-semibold text-background">Vote on what we build</p>
              <p className="text-[13px] text-background/60 mt-0.5">1,247 votes · closes Sunday</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
              <ArrowUpRight size={18} className="text-foreground" />
            </div>
          </button>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {CO_CREATE.slice(1).map((item) => (
              <button
                key={item.title}
                className="flex flex-col items-start gap-2 rounded-3xl border border-border/60 bg-background px-4 py-4 text-left active:bg-foreground/[0.03] transition-colors"
              >
                <p className="text-[14px] font-semibold text-foreground leading-tight">{item.title}</p>
                <p className="text-[11.5px] text-muted-foreground leading-snug">{item.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Divider — soft inline badge */}
        <div className="flex items-center justify-center my-8">
          <span className="rounded-full border border-border/60 bg-background px-4 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
            or, need a human?
          </span>
        </div>

        {/* Contact — pill-shaped rows */}
        <div className="space-y-2.5">
          {CONTACT.map((item) => (
            <button
              key={item.label}
              className="group flex w-full items-center gap-4 rounded-full border border-border/60 bg-background px-3 py-2.5 pr-5 text-left active:bg-foreground/[0.03] transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/[0.05] shrink-0">
                <item.icon size={18} strokeWidth={1.8} className="text-foreground" />
              </div>
              <p className="flex-1 text-[15px] font-semibold text-foreground">{item.label}</p>
              <p className="text-[12px] text-muted-foreground">{item.tat}</p>
              <ChevronRight size={16} className="text-muted-foreground/50 group-active:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>

        {/* Trust */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-gain/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gain" />
            <span className="text-[11px] font-medium text-gain">All systems operational</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground/50">
            {TRUST_BADGES.map((b, i) => (
              <span key={b} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted-foreground/30">·</span>}
                <span>{b}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
