"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  Coins,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

/* ---------------------------------------------------------------- */
/*  Shared noise texture — matches existing V3 Contrast hero        */
/* ---------------------------------------------------------------- */
const noiseStyle = {
  backgroundImage:
    "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E')",
};

/* ══════════════════════════════════════════════════════════════════ */
/*  V1 — "Dual Rail"                                                  */
/*  Extension of existing V3 Contrast hero. Dark card.                */
/*  Primary CTA = USD, secondary chip = Stablecoin.                   */
/*  Minimal change — closest sibling to the existing two heroes.      */
/* ══════════════════════════════════════════════════════════════════ */

function V1() {
  return (
    <div className="px-5 pt-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-foreground px-6 pt-10 pb-6"
      >
        <div className="absolute inset-0 opacity-[0.03]" style={noiseStyle} />

        <div className="relative flex flex-col items-center text-center">
          {/* Tiny success mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-background/10"
          >
            <Check size={18} strokeWidth={2.5} className="text-background" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-[22px] font-bold text-background leading-[1.2] mb-1.5"
          >
            You&apos;re all set.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-[15px] text-background/55 leading-relaxed mb-6 max-w-[280px]"
          >
            Add funds to place your first trade. Start with as little as 10.
          </motion.p>

          {/* Primary — USD */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="w-full rounded-full bg-background py-3.5 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Plus size={17} strokeWidth={2.5} />
            Add Funds in USD
          </motion.button>

          {/* Secondary — Stablecoin */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-background/60 active:text-background transition-colors"
          >
            <Coins size={14} />
            or pay with stablecoins
            <ArrowRight size={13} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  V2 — "Split Card"                                                 */
/*  Dark hero with two equal-weight choices stacked as tiles.         */
/*  Each tile shows icon + label + perk tag. Parallel paths.          */
/* ══════════════════════════════════════════════════════════════════ */

function V2() {
  return (
    <div className="px-5 pt-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-foreground p-6"
      >
        <div className="absolute inset-0 opacity-[0.03]" style={noiseStyle} />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-background/40" />
            <span className="text-[11px] font-semibold text-background/40 uppercase tracking-[0.18em]">
              Account ready
            </span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-[22px] font-bold text-background leading-[1.2] mb-1.5"
          >
            Fund your account,
            <br />
            your way.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-[14px] text-background/50 leading-relaxed mb-5"
          >
            Pick a rail. Both settle into the same buying power.
          </motion.p>

          {/* Tiles */}
          <div className="space-y-2.5">
            {/* USD tile */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="w-full rounded-2xl bg-background/[0.08] border border-background/10 p-4 text-left active:bg-background/[0.12] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 shrink-0">
                  <Banknote size={18} className="text-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-background">
                      US Dollar
                    </p>
                    <span className="text-[10px] font-semibold text-background/50 uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-background/10">
                      Instant
                    </span>
                  </div>
                  <p className="text-[12px] text-background/45 mt-0.5">
                    ACH · Wire · Debit card
                  </p>
                </div>
                <ArrowRight size={16} className="text-background/40 shrink-0" />
              </div>
            </motion.button>

            {/* Stablecoin tile */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="w-full rounded-2xl bg-background/[0.08] border border-background/10 p-4 text-left active:bg-background/[0.12] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 shrink-0">
                  <Coins size={18} className="text-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-background">
                      Stablecoin
                    </p>
                    <span className="text-[10px] font-semibold text-background/50 uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-background/10">
                      24/7
                    </span>
                  </div>
                  <p className="text-[12px] text-background/45 mt-0.5">
                    USDC · USDT · on 6 chains
                  </p>
                </div>
                <ArrowRight size={16} className="text-background/40 shrink-0" />
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  V3 — "Balance Card"                                               */
/*  Show the 0.00 balance prominently. Bold big number.               */
/*  Two method chips below — symmetrical, tactile.                    */
/*  Feels like the account dashboard already exists.                  */
/* ══════════════════════════════════════════════════════════════════ */

function V3() {
  return (
    <div className="px-5 pt-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-foreground p-6"
      >
        <div className="absolute inset-0 opacity-[0.03]" style={noiseStyle} />

        <div className="relative">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex items-center justify-between mb-3"
          >
            <span className="text-[12px] font-medium text-background/40 uppercase tracking-[0.15em]">
              Buying power
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gain" />
              <span className="text-[11px] font-medium text-background/40">
                Live
              </span>
            </span>
          </motion.div>

          {/* Big number */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-baseline gap-1.5 mb-1"
          >
            <span className="text-[44px] font-bold text-background leading-none tabular-nums tracking-tight">
              0.00
            </span>
            <span className="text-[16px] font-semibold text-background/40">
              USD
            </span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-[14px] text-background/55 leading-relaxed mb-6"
          >
            Fund it once. Trade whenever.
          </motion.p>

          {/* Split action row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="grid grid-cols-2 gap-2.5"
          >
            <button className="rounded-2xl bg-background py-4 px-3 text-foreground active:opacity-90 transition-opacity">
              <div className="flex flex-col items-center gap-1.5">
                <Banknote size={20} strokeWidth={2} />
                <div>
                  <p className="text-[14px] font-semibold leading-none">
                    Add USD
                  </p>
                  <p className="text-[11px] text-foreground/50 mt-1 leading-none">
                    Bank · Card
                  </p>
                </div>
              </div>
            </button>
            <button className="rounded-2xl bg-background/[0.1] border border-background/15 py-4 px-3 text-background active:bg-background/[0.15] transition-colors">
              <div className="flex flex-col items-center gap-1.5">
                <Coins size={20} strokeWidth={2} />
                <div>
                  <p className="text-[14px] font-semibold leading-none">
                    Add Stablecoin
                  </p>
                  <p className="text-[11px] text-background/45 mt-1 leading-none">
                    USDC · USDT
                  </p>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Micro-footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-[11px] text-background/35 text-center mt-4"
          >
            No deposit fees. No minimums.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  V4 — "Two-step Reveal"                                            */
/*  Starts as a compact prompt. Tap reveals both rails with perks.    */
/*  Playful, interactive, rewards the tap.                            */
/* ══════════════════════════════════════════════════════════════════ */

function V4() {
  const [opened, setOpened] = useState(false);

  return (
    <div className="px-5 pt-5">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-foreground cursor-pointer"
        onClick={() => !opened && setOpened(true)}
      >
        <div className="absolute inset-0 opacity-[0.03]" style={noiseStyle} />

        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative px-6 pt-10 pb-7"
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  animate={{
                    rotate: [0, 8, -8, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mb-4"
                >
                  <Zap
                    size={26}
                    strokeWidth={2}
                    className="text-background"
                    fill="hsl(var(--background))"
                  />
                </motion.div>

                <p className="text-[22px] font-bold text-background leading-[1.2] mb-1.5">
                  One last thing —
                  <br />
                  fund your account.
                </p>
                <p className="text-[14px] text-background/55 leading-relaxed max-w-[260px] mb-5">
                  Two ways in. Both land as buying power, ready to trade.
                </p>

                <div className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground inline-flex items-center gap-2">
                  Add funds
                  <ArrowRight size={16} strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Zap
                    size={15}
                    className="text-background"
                    fill="hsl(var(--background))"
                  />
                  <span className="text-[12px] font-semibold text-background uppercase tracking-[0.15em]">
                    Pick your rail
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpened(false);
                  }}
                  className="text-[12px] text-background/40 active:text-background/70 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* USD */}
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded-2xl bg-background p-4 text-left mb-2.5 active:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground/[0.06] shrink-0">
                    <Banknote size={19} className="text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold text-foreground leading-tight">
                      US Dollar
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      Instant with debit. Free ACH in 1 day.
                    </p>
                  </div>
                  <ArrowRight
                    size={17}
                    className="text-muted-foreground shrink-0"
                  />
                </div>
              </motion.button>

              {/* Stablecoin */}
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.35 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded-2xl bg-background p-4 text-left active:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground/[0.06] shrink-0">
                    <Coins size={19} className="text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[16px] font-semibold text-foreground leading-tight">
                        Stablecoin
                      </p>
                      <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-foreground/[0.06]">
                        24/7
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      USDC or USDT on 6 chains. No weekends.
                    </p>
                  </div>
                  <ArrowRight
                    size={17}
                    className="text-muted-foreground shrink-0"
                  />
                </div>
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="text-[11px] text-background/40 text-center mt-4"
              >
                Both routes settle into the same buying power.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  Page                                                              */
/* ══════════════════════════════════════════════════════════════════ */

const versions = [
  {
    name: "V1 — Dual Rail",
    note: "Primary USD button, stablecoin as soft secondary. Minimal step from existing heroes.",
    component: V1,
  },
  {
    name: "V2 — Split Card",
    note: "Two equal-weight tiles. Parallel paths, with perk tags (Instant / 24/7).",
    component: V2,
  },
  {
    name: "V3 — Balance Card",
    note: "Big 0.00 buying power. Treats funding as topping up an account, not onboarding.",
    component: V3,
  },
  {
    name: "V4 — Two-step Reveal",
    note: "Compact prompt → tap reveals both rails with perks. Rewards the tap.",
    component: V4,
  },
];

export default function AddFundsExplore() {
  const [active, setActive] = useState(0);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">
            Add Funds Hero
          </h1>
          <p className="text-[13px] text-muted-foreground">
            KYC complete · 4 versions
          </p>
        </div>
      </div>

      {/* Version picker */}
      <div className="overflow-x-auto no-scrollbar border-b border-border/40">
        <div className="flex gap-0 px-5">
          {versions.map((v, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors",
                active === i
                  ? "text-foreground"
                  : "text-muted-foreground/50"
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

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        <div className="px-5 pt-4">
          <p className="text-[14px] font-semibold text-foreground">
            {versions[active].name}
          </p>
          <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
            {versions[active].note}
          </p>
        </div>

        {(() => {
          const Comp = versions[active].component;
          return <Comp />;
        })()}

        {/* Mock content below to show in-feed context */}
        <div className="px-5 pt-6 space-y-4">
          <div className="h-[60px] rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">
              Popular Stocks widget below
            </span>
          </div>
          <div className="h-[60px] rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">
              Quick Access widget below
            </span>
          </div>
          <div className="h-[200px] rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">
              What&apos;s Moving widget below
            </span>
          </div>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
