"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Check, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* ================================================================== */
/*  Shared                                                              */
/* ================================================================== */

const noiseStyle = {
  backgroundImage:
    "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')",
};

function HeroShell({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-3xl bg-foreground cursor-pointer",
        className
      )}
    >
      <div className="absolute inset-0 opacity-[0.03]" style={noiseStyle} />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/* ================================================================== */
/*  STATE 1 — Video Banner                                              */
/* ================================================================== */

/* 1A — Ambient Background Loop */
export function Video1AAmbient() {
  return (
    <HeroShell className="px-6 pb-6 pt-48">
      {/* Simulated ambient video — animated gradient mesh */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-20 opacity-20"
          style={{
            background:
              "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3), transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2), transparent 50%)",
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <p className="text-[20px] font-bold text-background leading-[1.3] mb-1">
          No rush. Explore all you want.
        </p>
        <p className="text-[15px] text-background/50 leading-relaxed mb-6">
          When you&apos;re ready to invest, we&apos;re here.
        </p>
        <button className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity">
          Start Investing
        </button>
      </div>
    </HeroShell>
  );
}

/* 1B — Spotlight Single Video */
export function Video1BSpotlight() {
  return (
    <HeroShell className="p-0">
      {/* Video placeholder */}
      <div className="relative aspect-[4/5] bg-foreground flex items-center justify-center">
        {/* Play button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative h-16 w-16 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center ring-1 ring-background/30"
        >
          <Play
            size={24}
            strokeWidth={2}
            className="text-background ml-1"
            fill="hsl(var(--background))"
          />
        </motion.div>

      </div>
    </HeroShell>
  );
}

/* 1C — Story-style Swipeable */
export function Video1CStories() {
  const stories = [
    {
      title: "Why people invest in US stocks",
      subtitle: "The world's largest market, accessible to you.",
    },
    {
      title: "Meet Aspora",
      subtitle: "Built for investors who think globally.",
    },
    {
      title: "Your money, your pace",
      subtitle: "No rush. No minimums. No pressure.",
    },
  ];
  const [idx, setIdx] = useState(0);
  const current = stories[idx];

  return (
    <HeroShell
      className="px-6 pb-6 pt-44"
      onClick={() => setIdx((i) => (i + 1) % stories.length)}
    >
      {/* Progress dots */}
      <div className="absolute top-4 inset-x-0 flex justify-center gap-1.5">
        {stories.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-[3px] rounded-full transition-all duration-300",
              i === idx
                ? "w-6 bg-background/80"
                : "w-6 bg-background/25"
            )}
          />
        ))}
      </div>

      {/* Play icon centered */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-8">
        <div className="h-14 w-14 rounded-full bg-background/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-background/20">
          <Play
            size={20}
            strokeWidth={2}
            className="text-background ml-0.5"
            fill="hsl(var(--background))"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center"
        >
          <p className="text-[20px] font-bold text-background leading-[1.3] mb-1">
            {current.title}
          </p>
          <p className="text-[15px] text-background/50 leading-relaxed">
            {current.subtitle}
          </p>
        </motion.div>
      </AnimatePresence>
    </HeroShell>
  );
}

/* 1D — Thumbnail Grid below hero text */
export function Video1DThumbnails() {
  const videos = [
    { title: "US Markets 101", duration: "3 min" },
    { title: "How Aspora works", duration: "2 min" },
    { title: "Your first trade", duration: "4 min" },
  ];

  return (
    <HeroShell className="px-6 pb-5 pt-36">
      <div className="flex flex-col items-center text-center mb-5">
        <p className="text-[20px] font-bold text-background leading-[1.3] mb-1">
          No rush. Explore all you want.
        </p>
        <p className="text-[15px] text-background/50 leading-relaxed">
          When you&apos;re ready to invest, we&apos;re here.
        </p>
      </div>

      {/* Video thumbnails */}
      <div className="flex gap-2">
        {videos.map((v) => (
          <button
            key={v.title}
            className="flex-1 rounded-xl bg-background/10 backdrop-blur-sm border border-background/10 p-3 text-left active:scale-[0.97] transition-transform"
          >
            <div className="flex items-center justify-center h-10 mb-2">
              <Play
                size={16}
                strokeWidth={2}
                className="text-background/60"
                fill="hsl(var(--background) / 0.6)"
              />
            </div>
            <p className="text-[12px] font-semibold text-background leading-tight">
              {v.title}
            </p>
            <p className="text-[10px] text-background/40 mt-0.5">{v.duration}</p>
          </button>
        ))}
      </div>
    </HeroShell>
  );
}

/* ================================================================== */
/*  STATE 2 — KYC Done, Add Funds                                      */
/* ================================================================== */

/* 2A — Achievement + Gentle Nudge */
export function Funds2AAchievement() {
  return (
    <HeroShell className="px-6 py-8">
      <div className="flex flex-col items-center text-center">
        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="h-14 w-14 rounded-full bg-background/15 flex items-center justify-center mb-5"
        >
          <Check size={28} strokeWidth={2.5} className="text-background" />
        </motion.div>

        <p className="text-[20px] font-bold text-background leading-tight mb-1">
          Account approved. You&apos;re in.
        </p>
        <p className="text-[15px] text-background/50 leading-relaxed mb-6">
          Fund it whenever you&apos;re ready. No minimums.
        </p>
        <button className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity">
          Add Funds
        </button>
      </div>
    </HeroShell>
  );
}

/* 2B — Transparency Card */
export function Funds2BTransparency() {
  return (
    <HeroShell className="px-6 py-8">
      <div className="flex flex-col items-center text-center">
        <p className="text-[20px] font-bold text-background leading-tight mb-1">
          Your account is ready.
        </p>
        <p className="text-[15px] text-background/50 leading-relaxed mb-5">
          When you fund, we convert your currency to USD at the live rate. No hidden fees.
        </p>

        {/* Currency preview */}
        <div className="w-full max-w-[260px] rounded-2xl bg-background/10 border border-background/10 px-4 py-3 mb-6">
          <div className="flex items-center justify-between text-[14px] text-background/70">
            <span>10,000 INR</span>
            <ArrowRight size={14} className="text-background/30" />
            <span className="font-semibold text-background">119.88 USD</span>
          </div>
          <p className="text-[11px] text-background/35 mt-1 text-center">
            Live rate. What you see is what you get.
          </p>
        </div>

        <button className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity">
          Add Funds
        </button>
      </div>
    </HeroShell>
  );
}

/* 2C — Progress Path */
export function Funds2CProgress() {
  const steps = [
    { label: "Account", done: true },
    { label: "Fund", done: false, active: true },
    { label: "First Trade", done: false },
  ];

  return (
    <HeroShell className="px-6 py-8">
      <div className="flex flex-col items-center text-center">
        {/* Step indicators */}
        <div className="flex items-center gap-0 mb-6 w-full max-w-[240px]">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold mb-1.5",
                    step.done
                      ? "bg-background text-foreground"
                      : step.active
                        ? "bg-background/30 text-background ring-2 ring-background/50"
                        : "bg-background/10 text-background/40"
                  )}
                >
                  {step.done ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    step.done || step.active
                      ? "text-background/80"
                      : "text-background/35"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 -mt-5",
                    step.done ? "bg-background/50" : "bg-background/15"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <p className="text-[20px] font-bold text-background leading-tight mb-1">
          Step one, done.
        </p>
        <p className="text-[15px] text-background/50 leading-relaxed mb-6">
          Add funds to unlock trading. Start with any amount.
        </p>
        <button className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity">
          Add Funds
        </button>
      </div>
    </HeroShell>
  );
}

/* 2D — Warm Handoff */
export function Funds2DWarmHandoff() {
  return (
    <HeroShell className="px-6 pb-6 pt-48">
      <div className="flex flex-col items-center text-center">
        <p className="text-[20px] font-bold text-background leading-tight mb-1">
          You&apos;re all set up.
        </p>
        <p className="text-[15px] text-background/50 leading-relaxed mb-6 max-w-[300px]">
          Whenever you feel like it, move some funds over and you&apos;ll be ready to go.
        </p>
        <button className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity mb-3">
          Add Funds
        </button>
        <button className="text-[13px] font-medium text-background/40 active:text-background/60 transition-colors">
          How funding works
        </button>
      </div>
    </HeroShell>
  );
}

/* ================================================================== */
/*  STATE 3 — Funded, Learn Before First Trade                          */
/* ================================================================== */

/* 3A — The Honest Pause */
export function Learn3AHonestPause() {
  return (
    <HeroShell className="px-6 py-8">
      <div className="flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-background/15 flex items-center justify-center mb-5">
          <BookOpen size={22} strokeWidth={1.8} className="text-background" />
        </div>

        <p className="text-[20px] font-bold text-background leading-tight mb-1">
          You&apos;re funded.
        </p>
        <p className="text-[15px] text-background/50 leading-relaxed mb-6 max-w-[300px]">
          Before your first trade, we&apos;d love for you to know what you&apos;re buying. Not a gate. You can skip this. But understanding beats guessing.
        </p>
        <button className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity mb-3">
          Learn Before You Invest
        </button>
        <button className="text-[13px] font-medium text-background/40 active:text-background/60 transition-colors">
          I already understand investing
        </button>
      </div>
    </HeroShell>
  );
}

/* 3B — The Single Lesson */
export function Learn3BSingleLesson() {
  return (
    <HeroShell className="px-6 py-8">
      <div className="flex flex-col items-center text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-background/40 mb-4">
          Your first read
        </p>
        <p className="text-[20px] font-bold text-background leading-tight mb-1">
          How US markets work
        </p>
        <p className="text-[15px] text-background/50 leading-relaxed mb-6">
          3 minutes. Worth it before your first trade.
        </p>
        <button className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity mb-3">
          Read Now
        </button>
        <button className="text-[13px] font-medium text-background/40 active:text-background/60 transition-colors">
          Skip for now
        </button>
      </div>
    </HeroShell>
  );
}

/* 3C — The Respect Card */
export function Learn3CRespect() {
  return (
    <HeroShell className="px-6 py-8">
      <div className="flex flex-col items-center text-center">
        <Sparkles size={24} strokeWidth={1.8} className="text-background/60 mb-4" />

        <p className="text-[20px] font-bold text-background leading-tight mb-1">
          You&apos;re ready to trade.
        </p>
        <p className="text-[15px] text-background/50 leading-relaxed mb-6 max-w-[300px]">
          If this is new, we built quick lessons for exactly this moment. If you already know your way around, go for it.
        </p>
        <div className="flex gap-3">
          <Link
            href="/learn"
            className="rounded-full bg-background px-5 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity"
          >
            Level Up
          </Link>
          <button className="rounded-full bg-background/15 px-5 py-3 text-[15px] font-semibold text-background active:opacity-80 transition-opacity">
            Start Exploring
          </button>
        </div>
      </div>
    </HeroShell>
  );
}

/* 3D — The Friend Voice */
export function Learn3DFriendVoice() {
  return (
    <HeroShell className="px-6 pb-6 pt-48">
      <div className="flex flex-col items-center text-center">
        <p className="text-[20px] font-bold text-background leading-tight mb-1">
          You&apos;re ready to trade.
        </p>
        <p className="text-[20px] font-bold text-background/50 leading-tight mb-3">
          But learn before you invest.
        </p>
        <p className="text-[15px] text-background/50 leading-relaxed mb-6 max-w-[300px]">
          Markets will still be here tomorrow. Spend some time learning first.
        </p>
        <button className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity mb-3">
          Let&apos;s Learn
        </button>
        <button className="text-[13px] font-medium text-background/40 active:text-background/60 transition-colors">
          I already understand investing
        </button>
      </div>
    </HeroShell>
  );
}

/* ================================================================== */
/*  Showcase                                                            */
/* ================================================================== */

interface VariantGroup {
  state: string;
  description: string;
  variants: { label: string; subtitle: string; Component: React.ComponentType }[];
}

const groups: VariantGroup[] = [
  {
    state: "State 1 — Video Banner",
    description:
      "User is browsing. Low intent, high openness. Show something beautiful or educational.",
    variants: [
      {
        label: "1A — Ambient Loop",
        subtitle: "Muted motion behind hero text. Video as texture.",
        Component: Video1AAmbient,
      },
      {
        label: "1B — Spotlight Video",
        subtitle: "One featured video. Play button. Title + duration.",
        Component: Video1BSpotlight,
      },
      {
        label: "1C — Story Swipeable",
        subtitle: "Tap to advance. Progress dots. Multiple short stories.",
        Component: Video1CStories,
      },
      {
        label: "1D — Thumbnails",
        subtitle: "Hero text on top. Video thumbnail pills below.",
        Component: Video1DThumbnails,
      },
    ],
  },
  {
    state: "State 2 — KYC Done, Add Funds",
    description:
      "KYC complete. Highest-anxiety moment: real money about to move.",
    variants: [
      {
        label: "2A — Achievement",
        subtitle: "Celebrate the milestone. Gentle nudge to fund.",
        Component: Funds2AAchievement,
      },
      {
        label: "2B — Transparency",
        subtitle: "Show currency conversion inline. Address the anxiety.",
        Component: Funds2BTransparency,
      },
      {
        label: "2C — Progress Path",
        subtitle: "Three-step visual. First step checked. Motivating.",
        Component: Funds2CProgress,
      },
      {
        label: "2D — Warm Handoff",
        subtitle: "No pressure copy. Secondary link to explainer.",
        Component: Funds2DWarmHandoff,
      },
    ],
  },
  {
    state: "State 3 — Funded, Learn First",
    description:
      "Money is in the account. Aspora holds them and suggests learning.",
    variants: [
      {
        label: "3A — Honest Pause",
        subtitle: "Direct, warm, slightly bold. Secondary skip.",
        Component: Learn3AHonestPause,
      },
      {
        label: "3B — Single Lesson",
        subtitle: "One specific read. 3 minutes. Concrete ask.",
        Component: Learn3BSingleLesson,
      },
      {
        label: "3C — Respect Card",
        subtitle: "Two equal CTAs. Doesn't assume ignorance.",
        Component: Learn3CRespect,
      },
      {
        label: "3D — Friend Voice",
        subtitle: "Maximum personality. Future you will be glad.",
        Component: Learn3DFriendVoice,
      },
    ],
  },
];

export function HeroWidgetV2Showcase() {
  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <div key={group.state}>
          <div className="mb-5">
            <p className="text-[13px] font-bold tracking-wider text-muted-foreground uppercase">
              {group.state}
            </p>
            <p className="text-[13px] text-muted-foreground/80 mt-0.5 leading-snug">
              {group.description}
            </p>
          </div>

          <div className="space-y-6">
            {group.variants.map(({ label, subtitle, Component }) => (
              <div key={label}>
                <div className="mb-2 px-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    {subtitle}
                  </p>
                </div>
                <Component />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
