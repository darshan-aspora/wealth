"use client";

/**
 * V1 — "Editorial"
 * Magazine-cover aesthetic. Oversized typographic hierarchy.
 * The number is the hero. Labels rotate. Treat the screen like a print spread.
 */

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const noiseStyle = {
  backgroundImage:
    "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E')",
};

export function AddFundsHeroV1() {
  return (
    <div className="px-5 pt-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[28px] bg-foreground"
        style={{ aspectRatio: "0.92" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={noiseStyle} />

        {/* Top masthead */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <span className="text-[10px] font-bold text-background/50 uppercase tracking-[0.3em]">
            Aspora
          </span>
          <span className="text-[10px] font-medium text-background/40 tracking-[0.2em]">
            Vol. 01 · Fund
          </span>
        </div>

        {/* Left edge rotated label */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          <span className="text-[10px] font-bold text-background/40 uppercase tracking-[0.35em]">
            Ready — Not Yet Funded
          </span>
        </div>

        {/* Hero — oversized zero as the star */}
        <div className="absolute inset-0 flex flex-col items-start justify-center pl-16 pr-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative"
          >
            {/* USD tag top-right of number */}
            <span className="absolute -top-1 -right-5 text-[11px] font-bold text-background/50 uppercase tracking-[0.15em]">
              USD
            </span>
            <span className="text-[180px] font-black text-background leading-[0.85] tracking-[-0.06em] tabular-nums">
              00
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4 text-[26px] font-bold text-background leading-[1.05] tracking-[-0.02em] max-w-[280px]"
          >
            A clean account.
            <br />
            <span className="text-background/40">A waiting market.</span>
          </motion.p>
        </div>

        {/* Bottom actions — editorial footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="border-t border-background/15 pt-4">
            <div className="flex items-end justify-between gap-4">
              {/* USD */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="flex-1 text-left active:opacity-70 transition-opacity"
              >
                <p className="text-[9px] font-bold text-background/40 uppercase tracking-[0.25em]">
                  01 / Dollar
                </p>
                <p className="mt-1 text-[17px] font-bold text-background leading-tight tracking-tight">
                  Add USD
                </p>
                <p className="text-[11px] text-background/45 mt-0.5">
                  Bank · Card
                </p>
              </motion.button>

              <div className="w-px h-12 bg-background/20 mb-1" />

              {/* Stablecoin */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.4 }}
                className="flex-1 text-left active:opacity-70 transition-opacity"
              >
                <p className="text-[9px] font-bold text-background/40 uppercase tracking-[0.25em]">
                  02 / Crypto
                </p>
                <p className="mt-1 text-[17px] font-bold text-background leading-tight tracking-tight">
                  Stablecoin
                </p>
                <p className="text-[11px] text-background/45 mt-0.5">
                  USDC · USDT
                </p>
              </motion.button>

              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75, duration: 0.4 }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-foreground shrink-0 mb-0.5"
              >
                <ArrowUpRight size={18} strokeWidth={2.5} />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
