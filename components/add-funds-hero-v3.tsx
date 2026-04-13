"use client";

/**
 * V3 — "Aperture"
 * Cinematic dark card with a breathing circular aperture.
 * The opening pulses, calling for a deposit. Premium, photographic.
 */

import { motion } from "framer-motion";
import { ArrowRight, Banknote, Coins } from "lucide-react";

const noiseStyle = {
  backgroundImage:
    "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E')",
};

export function AddFundsHeroV3() {
  return (
    <div className="px-5 pt-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[28px] bg-black"
      >
        <div className="absolute inset-0 opacity-[0.05]" style={noiseStyle} />

        {/* Ambient radial glow */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative px-6 pt-8 pb-6">
          {/* Tiny caption */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-white"
              />
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em]">
                Awaiting capital
              </span>
            </div>
            <span className="text-[10px] font-medium text-white/30 tracking-[0.2em]">
              EST. 2026
            </span>
          </div>

          {/* The aperture */}
          <div className="flex items-center justify-center my-6">
            <div className="relative w-[200px] h-[200px]">
              {/* Outer ring — rotating */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.4) 90deg, transparent 180deg, rgba(255,255,255,0.2) 270deg, transparent 360deg)",
                  maskImage:
                    "radial-gradient(circle, transparent 55%, black 56%, black 100%)",
                  WebkitMaskImage:
                    "radial-gradient(circle, transparent 55%, black 56%, black 100%)",
                }}
              />

              {/* Mid ring — static */}
              <div
                className="absolute inset-[14px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, transparent 58%, rgba(255,255,255,0.08) 60%, transparent 64%)",
                }}
              />

              {/* Breathing inner pulse */}
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-[28px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
                }}
              />

              {/* Core — the number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-1">
                  Balance
                </span>
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-[64px] font-black text-white leading-none tracking-[-0.05em] tabular-nums"
                >
                  0
                </motion.span>
                <span className="text-[11px] font-semibold text-white/40 tracking-[0.1em] mt-1">
                  USD · READY
                </span>
              </div>
            </div>
          </div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center mb-7 px-4"
          >
            <p className="text-[22px] font-bold text-white leading-[1.2] tracking-[-0.02em]">
              Open the aperture.
            </p>
            <p className="text-[14px] text-white/50 leading-relaxed mt-1.5">
              Pick a rail. Let light in.
            </p>
          </motion.div>

          {/* Two rails */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="space-y-2"
          >
            <button className="group w-full rounded-2xl bg-white text-black py-3.5 px-5 flex items-center gap-3 active:opacity-90 transition-opacity">
              <Banknote size={18} strokeWidth={2.2} />
              <span className="text-[15px] font-semibold flex-1 text-left tracking-tight">
                Deposit in Dollars
              </span>
              <span className="text-[11px] font-bold text-black/40 uppercase tracking-wider">
                Instant
              </span>
              <ArrowRight size={15} className="text-black/50" />
            </button>

            <button className="group w-full rounded-2xl bg-white/[0.06] border border-white/10 text-white py-3.5 px-5 flex items-center gap-3 active:bg-white/[0.1] transition-colors backdrop-blur-sm">
              <Coins size={18} strokeWidth={2.2} />
              <span className="text-[15px] font-semibold flex-1 text-left tracking-tight">
                Deposit in Stablecoin
              </span>
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                24/7
              </span>
              <ArrowRight size={15} className="text-white/50" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
