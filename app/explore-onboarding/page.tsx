"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

/* ── Shared types ── */
type UserState = "fresh" | "dropoff";
const steps = ["Email", "Phone", "Identity", "Funding", "Review"];
const currentStep = 2; // 0-indexed, means step 3 of 5

/* ══════════════════════════════════════════════════════════════════════ */
/*  VERSION 1 — "Warm Minimal"                                          */
/*  Generous space. Soft fade-ins. Icon as a gentle companion.           */
/* ══════════════════════════════════════════════════════════════════════ */

function V1({ state }: { state: UserState }) {
  if (state === "fresh") {
    return (
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-start gap-3.5">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] mt-0.5"
          >
            <Sparkles size={18} className="text-foreground/60" />
          </motion.div>
          <div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-[16px] text-foreground leading-relaxed"
            >
              No rush. Explore all you want.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-[16px] text-muted-foreground leading-relaxed"
            >
              When you&apos;re ready to invest, we&apos;re here.
            </motion.p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mt-4 rounded-full bg-foreground px-5 py-2.5 text-[14px] font-semibold text-background active:opacity-90 transition-opacity"
            >
              Start Investing
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Drop-off state
  return (
    <div className="px-6 pt-8 pb-6">
      <div className="flex items-start gap-3.5">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] mt-0.5"
        >
          <Sparkles size={18} className="text-foreground/60" />
        </motion.div>
        <div>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-[17px] font-semibold text-foreground"
          >
            Welcome back
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-[15px] text-muted-foreground mt-1 leading-relaxed"
          >
            Your setup is almost done.
          </motion.p>

          {/* Progress dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center gap-2 mt-3"
          >
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  animate={i <= currentStep ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    i <= currentStep ? "bg-foreground" : "bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>
            <span className="text-[13px] text-muted-foreground ml-1">Step {currentStep + 1} of {steps.length}</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="mt-4 rounded-full bg-foreground px-5 py-2.5 text-[14px] font-semibold text-background active:opacity-90 transition-opacity"
          >
            Continue — about 2 min left
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  VERSION 2 — "The Card"                                              */
/*  Contained card with subtle gradient wash. More visual presence.      */
/*  The icon breathes. Progress dots are prominent.                      */
/* ══════════════════════════════════════════════════════════════════════ */

function V2({ state }: { state: UserState }) {
  if (state === "fresh") {
    return (
      <div className="px-5 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-border/40 p-6"
        >
          {/* Subtle gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] via-transparent to-foreground/[0.02]" />

          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4"
            >
              <Sparkles size={24} className="text-foreground/50" />
            </motion.div>

            <h3 className="text-[18px] font-bold text-foreground leading-tight mb-1">
              No rush. Explore all you want.
            </h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-5">
              When you&apos;re ready to invest, we&apos;re here. No minimums. No pressure.
            </p>

            <button className="rounded-full bg-foreground px-6 py-3 text-[15px] font-semibold text-background active:opacity-90 transition-opacity">
              Start Investing
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-border/40 p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] via-transparent to-foreground/[0.02]" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={24} className="text-foreground/50" />
            </motion.div>
            <span className="text-[13px] font-medium text-muted-foreground">~2 min left</span>
          </div>

          <h3 className="text-[18px] font-bold text-foreground leading-tight mb-1">
            Welcome back
          </h3>
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-5">
            We kept everything where you left it.
          </p>

          {/* Progress bar with dots */}
          <div className="mb-5">
            <div className="flex items-center gap-1">
              {steps.map((step, i) => (
                <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full h-[4px] rounded-full overflow-hidden bg-muted-foreground/10">
                    {i <= currentStep && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="h-full bg-foreground rounded-full"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-muted-foreground mt-2">Step {currentStep + 1} of {steps.length} — {steps[currentStep + 1]}</p>
          </div>

          <button className="w-full rounded-full bg-foreground py-3 text-[15px] font-semibold text-background active:opacity-90 transition-opacity">
            Continue Setup
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  VERSION 3 — "The Contrast"                                          */
/*  Dark card on light page (or inverted). Cinematic. Bold.              */
/*  Fresh state is poetic. Drop-off is action-dense.                     */
/* ══════════════════════════════════════════════════════════════════════ */

function V3({ state }: { state: UserState }) {
  if (state === "fresh") {
    return (
      <div className="px-5 pt-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-foreground hero-invert p-6"
        >
          {/* Subtle grain texture effect */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E')" }} />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex items-center gap-2 mb-5"
            >
              <Sparkles size={16} className="text-background/40" />
              <span className="text-[12px] font-medium text-background/40 uppercase tracking-[0.15em]">For you</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-[20px] font-bold text-background leading-[1.3] mb-2"
            >
              No rush.<br />Explore all you want.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="text-[15px] text-background/50 leading-relaxed mb-6"
            >
              When you&apos;re ready to invest, we&apos;re here.
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="rounded-full bg-background px-6 py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity"
            >
              Start Investing
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-foreground hero-invert p-6"
      >
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E')" }} />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-background/40" />
              <span className="text-[12px] font-medium text-background/40 uppercase tracking-[0.15em]">Welcome back</span>
            </div>
            <span className="text-[13px] font-medium text-background/30">~2 min</span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-[18px] font-bold text-background leading-tight mb-4"
          >
            Your account is almost ready
          </motion.p>

          {/* Segmented progress */}
          <div className="flex items-center gap-1.5 mb-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-[5px] rounded-full transition-all",
                  i <= currentStep ? "bg-background" : "bg-background/15"
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mb-5">
            <span className="text-[13px] text-background/40">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-[13px] text-background/40">Next: {steps[currentStep + 1]}</span>
          </div>

          <button className="w-full rounded-full bg-background py-3 text-[15px] font-semibold text-foreground active:opacity-90 transition-opacity">
            Continue Setup
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  Page                                                                */
/* ══════════════════════════════════════════════════════════════════════ */

const versions = [
  { name: "V1 — Warm Minimal", component: V1 },
  { name: "V2 — The Card", component: V2 },
  { name: "V3 — The Contrast", component: V3 },
];

export default function OnboardingExplore() {
  const [active, setActive] = useState(0);
  const [userState, setUserState] = useState<UserState>("fresh");

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors">
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">Onboarding Widget</h1>
          <p className="text-[13px] text-muted-foreground">3 versions × 2 states</p>
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

      {/* State toggle */}
      <div className="flex items-center gap-2 px-5 pt-4">
        {(["fresh", "dropoff"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setUserState(s)}
            className={cn(
              "rounded-full px-4 py-2 text-[14px] font-semibold transition-colors",
              userState === s ? "bg-foreground text-background" : "text-muted-foreground"
            )}
          >
            {s === "fresh" ? "Fresh User" : "KYC Drop-off"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <p className="px-5 pt-4 text-[13px] text-muted-foreground">{versions[active].name}</p>
        {(() => { const Comp = versions[active].component; return <Comp state={userState} />; })()}

        {/* Mock content below to show context */}
        <div className="px-5 pt-6 space-y-4">
          <div className="h-[60px] rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">Popular Stocks widget below</span>
          </div>
          <div className="h-[60px] rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">Quick Access widget below</span>
          </div>
          <div className="h-[200px] rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">What&apos;s Moving widget below</span>
          </div>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
