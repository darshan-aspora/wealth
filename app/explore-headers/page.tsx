"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, Search, SlidersHorizontal, Settings2, Grid2x2, LayoutDashboard, Grip, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Shared: animated search keywords ────────────────────────────────
const keywords = ["stocks", "etf", "options", "index", "news", "advisory"];

function useRotatingKeyword(interval = 2400) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % keywords.length);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);
  return keywords[index];
}

function RotatingText({ prefix = "Search " }: { prefix?: string }) {
  const keyword = useRotatingKeyword();
  return (
    <span className="flex items-center gap-0">
      <span>{prefix}</span>
      <span className="relative inline-flex w-[84px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={keyword}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute left-0"
          >
            {keyword}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

// ─── Variation 1: Clean pill ─────────────────────────────────────────
// Rounded-full pill search bar — iOS-inspired, soft and approachable
function HeaderV1() {
  return (
    <header className="flex items-center gap-2.5 px-4 py-3">
      <button className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        <ChevronLeft size={24} strokeWidth={2} />
      </button>

      <div className="relative flex h-12 flex-1 items-center rounded-full bg-muted/50 px-4">
        <Search size={18} className="shrink-0 text-muted-foreground/60" />
        <div className="ml-2 text-[16px] text-muted-foreground/60">
          <RotatingText />
        </div>
      </div>

      <button className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        <SlidersHorizontal size={20} strokeWidth={1.8} />
      </button>
    </header>
  );
}

// ─── Variation 2: Underline minimal ──────────────────────────────────
// No background on search — just a bottom border, editorial/magazine feel
function HeaderV2() {
  return (
    <header className="flex items-center gap-3 px-4 py-3">
      <button className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft size={22} strokeWidth={1.8} />
      </button>

      <div className="relative flex h-12 flex-1 items-center border-b border-border/80 px-0.5">
        <Search size={17} className="shrink-0 text-muted-foreground/50" />
        <div className="ml-2.5 text-[16px] font-light tracking-wide text-muted-foreground/50">
          <RotatingText />
        </div>
      </div>

      <button className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground">
        <Grid2x2 size={20} strokeWidth={1.6} />
      </button>
    </header>
  );
}

// ─── Variation 3: Glassmorphic ───────────────────────────────────────
// Frosted glass search bar with border glow — dark, premium feel
function HeaderV3() {
  return (
    <header className="flex items-center gap-2.5 px-4 py-3">
      <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/40 bg-card/60 text-muted-foreground transition-colors hover:text-foreground hover:border-border">
        <ChevronLeft size={22} strokeWidth={2} />
      </button>

      <div className="relative flex h-12 flex-1 items-center rounded-xl border border-border/40 bg-card/40 px-3.5 backdrop-blur-sm">
        <Search size={18} className="shrink-0 text-muted-foreground/50" />
        <div className="ml-2 text-[16px] text-muted-foreground/50">
          <RotatingText />
        </div>
        {/* Subtle top-edge highlight */}
        <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/40 bg-card/60 text-muted-foreground transition-colors hover:text-foreground hover:border-border">
        <Settings2 size={20} strokeWidth={1.6} />
      </button>
    </header>
  );
}

// ─── Variation 4: Wide search, compact actions ───────────────────────
// Search takes full width, action buttons are tight and small — Zerodha-density
function HeaderV4() {
  return (
    <header className="px-4 py-3">
      <div className="flex items-center gap-2">
        <button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground active:bg-muted/30">
          <ArrowLeft size={20} strokeWidth={2} />
        </button>

        <div className="relative flex h-11 flex-1 items-center rounded-lg bg-muted/40 px-3">
          <Search size={16} className="shrink-0 text-muted-foreground/50" />
          <div className="ml-2 text-[15px] text-muted-foreground/50">
            <RotatingText />
          </div>
        </div>

        <button className="flex h-10 items-center gap-1 rounded-md border border-border/50 bg-card/50 px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-border">
          <LayoutDashboard size={15} strokeWidth={1.6} />
          <span>Edit</span>
        </button>
      </div>
    </header>
  );
}

// ─── Variation 5: Bold display ───────────────────────────────────────
// Large search presence, icon-heavy, confident trading-app energy
function HeaderV5() {
  return (
    <header className="flex items-center gap-3 px-4 py-3.5">
      <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40 text-foreground transition-colors hover:bg-muted/60 active:scale-95">
        <ChevronLeft size={24} strokeWidth={2.2} />
      </button>

      <div className="relative flex h-12 flex-1 items-center rounded-xl bg-muted/30 ring-1 ring-border/50 px-4">
        <Search size={19} className="shrink-0 text-foreground/40" />
        <div className="ml-2.5 text-[17px] font-medium text-foreground/30">
          <RotatingText />
        </div>
      </div>

      <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40 text-foreground transition-colors hover:bg-muted/60 active:scale-95">
        <Grip size={22} strokeWidth={1.8} />
      </button>
    </header>
  );
}

// ─── Variation 6: Search + Bell + Profile ───────────────────────────
// Current production header — X back, pill search, bell with badge, profile avatar
function HeaderV6() {
  return (
    <header className="flex items-center gap-3 px-4 py-3">
      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        <X size={20} strokeWidth={2} />
      </button>

      <div className="relative flex h-12 min-w-0 flex-1 cursor-pointer items-center rounded-full bg-muted/50 px-4">
        <div className="min-w-0 flex-1 overflow-hidden text-[16px] text-muted-foreground/60">
          <RotatingText />
        </div>
      </div>

      <button className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        <Bell size={20} strokeWidth={1.8} />
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-background">
          3
        </span>
      </button>

      <button className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full transition-opacity hover:opacity-90 active:opacity-80">
        <img src="/profile.png" alt="Profile" className="h-full w-full object-cover" />
      </button>
    </header>
  );
}

// ─── Page ────────────────────────────────────────────────────────────
const variations = [
  { id: 1, label: "Clean Pill", sublabel: "Rounded, iOS-inspired", component: HeaderV1 },
  { id: 2, label: "Underline Minimal", sublabel: "Editorial, bottom-border only", component: HeaderV2 },
  { id: 3, label: "Glassmorphic", sublabel: "Frosted glass, bordered", component: HeaderV3 },
  { id: 4, label: "Compact Dense", sublabel: "Tight, Zerodha-style density", component: HeaderV4 },
  { id: 5, label: "Bold Display", sublabel: "Large, confident, ring-accented", component: HeaderV5 },
  { id: 6, label: "Search + Bell + Profile", sublabel: "X back, pill, bell badge, avatar", component: HeaderV6 },
];

export default function ExploreHeaders() {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* Page header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-5">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[19px] font-semibold text-foreground">
            Header Design
          </h1>
          <p className="text-[14px] text-muted-foreground">
            6 variations — search, nav, customise
          </p>
        </div>
      </div>

      <div className="mx-5 h-px bg-border/60" />

      {/* Variations */}
      <div className="flex-1 space-y-5 px-5 pt-5 pb-10">
        {variations.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
          >
            {/* Label */}
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-[13px] tabular-nums font-semibold text-muted-foreground/50 tabular-nums">
                {String(v.id).padStart(2, "0")}
              </span>
              <span className="text-[15px] font-semibold text-foreground/80">
                {v.label}
              </span>
              <span className="text-[13px] text-muted-foreground/40">
                {v.sublabel}
              </span>
            </div>

            {/* Header preview */}
            <div className="overflow-hidden rounded-xl border border-border/50 bg-card/40">
              <v.component />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
