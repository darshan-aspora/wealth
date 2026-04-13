"use client";

/**
 * V4 — "Totem"
 * A stack of coins rendered with CSS 3D. Tap to switch between USD & Stablecoin.
 * Playful but premium. Physical metaphor for funding.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Rail = "usd" | "stable";

const rails: Record<
  Rail,
  {
    label: string;
    title: string;
    subtitle: string;
    headline: string;
    bg: string;
    rim: string;
    text: string;
    soft: string;
    chips: string[];
    perk: string;
  }
> = {
  usd: {
    label: "USD",
    title: "United States Dollar",
    subtitle: "The rail every market speaks.",
    headline: "Put dollars to work.",
    bg: "linear-gradient(145deg, #E8F0D8 0%, #C8DBA5 50%, #9CB675 100%)",
    rim: "#4F6B2B",
    text: "#1C2A0F",
    soft: "#4F6B2B",
    chips: ["Bank", "ACH", "Card", "Wire"],
    perk: "Instant with debit",
  },
  stable: {
    label: "USDC",
    title: "Stablecoin · USDC",
    subtitle: "Dollar parity, chain-native.",
    headline: "Bridge from crypto.",
    bg: "linear-gradient(145deg, #DCE9FF 0%, #A7C1FF 50%, #6E8FFF 100%)",
    rim: "#2B3D8A",
    text: "#0F1A3D",
    soft: "#2B3D8A",
    chips: ["USDC", "USDT", "Base", "Solana"],
    perk: "Runs 24 / 7",
  },
};

export function AddFundsHeroV4() {
  const [rail, setRail] = useState<Rail>("usd");
  const r = rails[rail];

  return (
    <div className="px-5 pt-5">
      {/* Header row */}
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.25em]">
            Fund your account
          </p>
          <p className="text-[22px] font-bold text-foreground leading-tight tracking-[-0.02em] mt-1">
            {r.headline}
          </p>
        </div>

        {/* Segmented toggle */}
        <div className="flex items-center rounded-full bg-muted/60 p-1">
          {(Object.keys(rails) as Rail[]).map((k) => (
            <button
              key={k}
              onClick={() => setRail(k)}
              className="relative px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider"
            >
              {rail === k && (
                <motion.div
                  layoutId="rail-pill"
                  className="absolute inset-0 rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span
                className={
                  rail === k
                    ? "relative text-background"
                    : "relative text-muted-foreground"
                }
              >
                {rails[k].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* The coin stack */}
      <div
        className="relative h-[280px] flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={rail}
            initial={{ rotateY: -35, opacity: 0, scale: 0.9 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: 35, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Stack depth — shadow coins */}
            {[4, 3, 2, 1].map((n) => (
              <div
                key={n}
                className="absolute left-1/2 rounded-full"
                style={{
                  width: 220 - n * 2,
                  height: 220 - n * 2,
                  transform: `translate(-50%, ${n * 4}px) translateZ(-${n * 6}px)`,
                  background: r.bg,
                  filter: `brightness(${1 - n * 0.09})`,
                  boxShadow: `0 ${n * 3}px ${n * 6}px rgba(0,0,0,0.08)`,
                }}
              />
            ))}

            {/* Top coin */}
            <motion.div
              animate={{ rotateZ: [0, 1.2, 0, -1.2, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[220px] h-[220px] rounded-full flex items-center justify-center"
              style={{
                background: r.bg,
                boxShadow: `
                  inset 0 2px 3px rgba(255,255,255,0.6),
                  inset 0 -4px 8px rgba(0,0,0,0.12),
                  0 16px 40px rgba(0,0,0,0.12)
                `,
              }}
            >
              {/* Rim */}
              <div
                className="absolute inset-[6px] rounded-full border-2"
                style={{ borderColor: `${r.rim}30` }}
              />
              <div
                className="absolute inset-[12px] rounded-full border"
                style={{ borderColor: `${r.rim}20` }}
              />

              {/* Engraved top text */}
              <div
                className="absolute top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-[0.3em]"
                style={{ color: r.soft, opacity: 0.7 }}
              >
                Aspora · Mint
              </div>

              {/* Engraved bottom text */}
              <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-[0.3em]"
                style={{ color: r.soft, opacity: 0.7 }}
              >
                {r.perk}
              </div>

              {/* Center numeral */}
              <div className="flex flex-col items-center leading-none">
                <span
                  className="text-[84px] font-black tracking-[-0.06em] tabular-nums"
                  style={{ color: r.text }}
                >
                  1
                </span>
                <span
                  className="text-[13px] font-bold uppercase tracking-[0.25em] mt-1"
                  style={{ color: r.soft }}
                >
                  {r.label}
                </span>
              </div>

              {/* Highlight arc */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 200deg, transparent 0deg, rgba(255,255,255,0.35) 60deg, transparent 140deg)",
                  mixBlendMode: "overlay",
                }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Info + CTA */}
      <AnimatePresence mode="wait">
        <motion.div
          key={rail}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="mt-6"
        >
          <div className="text-center mb-4">
            <p className="text-[17px] font-bold text-foreground leading-tight tracking-tight">
              {r.title}
            </p>
            <p className="text-[14px] text-muted-foreground mt-1">
              {r.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 flex-wrap mb-5">
            {r.chips.map((c) => (
              <span
                key={c}
                className="text-[11px] font-bold text-foreground/70 uppercase tracking-[0.1em] px-2.5 py-1 rounded-md bg-muted"
              >
                {c}
              </span>
            ))}
          </div>

          <button className="w-full rounded-full bg-foreground py-3.5 text-[15px] font-semibold text-background active:opacity-90 transition-opacity flex items-center justify-center gap-2">
            Add {r.label}
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
