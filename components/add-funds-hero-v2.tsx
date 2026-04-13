"use client";

/**
 * V2 — "Duet"
 * Two tiles, two personalities. USD feels like warm linen paper.
 * Stablecoin feels chromed & iridescent. Parallel rails, opposite worlds.
 */

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function AddFundsHeroV2() {
  return (
    <div className="px-5 pt-5 space-y-3">
      {/* Intro caption */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-baseline justify-between"
      >
        <div>
          <p className="text-[26px] font-bold text-foreground leading-[1.05] tracking-[-0.02em]">
            Two rails in.
            <br />
            <span className="text-muted-foreground">
              One buying power out.
            </span>
          </p>
        </div>
      </motion.div>

      {/* USD tile — warm, paper-like */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        whileTap={{ scale: 0.985 }}
        className="relative w-full overflow-hidden rounded-3xl text-left active:brightness-95 transition-all"
        style={{
          background:
            "linear-gradient(135deg, #F5F0E6 0%, #EDE4D1 50%, #E8DCC4 100%)",
        }}
      >
        {/* Paper grain */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-multiply"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.75%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')",
          }}
        />

        {/* Embossed border ring */}
        <div className="absolute inset-[6px] rounded-[22px] border border-[#8B7355]/20 pointer-events-none" />

        <div className="relative p-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-bold text-[#6B5840] uppercase tracking-[0.3em]">
              Federal Reserve Note
            </span>
            <span className="text-[10px] font-bold text-[#6B5840]/70 tracking-[0.2em]">
              № 01
            </span>
          </div>

          {/* Big numeric */}
          <div className="flex items-baseline gap-2 mb-4">
            <span
              className="text-[56px] font-black text-[#2A2418] leading-none tracking-[-0.04em] tabular-nums"
              style={{ fontVariationSettings: "'wght' 900" }}
            >
              USD
            </span>
            <span className="text-[14px] font-semibold text-[#6B5840]/70 tracking-wide">
              Dollar
            </span>
          </div>

          <p className="text-[13px] text-[#4A3F2A] leading-relaxed mb-5 max-w-[250px]">
            Instant with debit. Free ACH in a day. The old-school rail, still
            the fastest in a pinch.
          </p>

          {/* Footer row */}
          <div className="flex items-center justify-between pt-3 border-t border-[#8B7355]/20">
            <div className="flex items-center gap-1.5">
              {["Bank", "ACH", "Wire", "Card"].map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-bold text-[#6B5840] uppercase tracking-[0.1em] px-2 py-1 rounded-md bg-[#2A2418]/[0.06]"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A2418] text-[#F5F0E6]">
              <ArrowRight size={15} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </motion.button>

      {/* Stablecoin tile — chrome, iridescent */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        whileTap={{ scale: 0.985 }}
        className="relative w-full overflow-hidden rounded-3xl text-left active:brightness-110 transition-all"
        style={{
          background:
            "linear-gradient(135deg, #0A0A0F 0%, #1A1230 40%, #0A0A0F 100%)",
        }}
      >
        {/* Iridescent sweep */}
        <motion.div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, rgba(180,120,255,0.25) 45%, rgba(100,220,255,0.2) 55%, transparent 70%)",
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-screen"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%273%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')",
          }}
        />

        {/* Glow ring */}
        <div className="absolute inset-[6px] rounded-[22px] border border-white/10 pointer-events-none" />

        <div className="relative p-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] bg-gradient-to-r from-[#C4B5FD] via-[#93C5FD] to-[#C4B5FD] bg-clip-text text-transparent">
              Always on-chain
            </span>
            <span className="text-[10px] font-bold text-white/40 tracking-[0.2em]">
              № 02
            </span>
          </div>

          {/* Big numeric */}
          <div className="flex items-baseline gap-2 mb-4">
            <span
              className="text-[56px] font-black leading-none tracking-[-0.04em] tabular-nums bg-gradient-to-br from-white via-white to-[#C4B5FD] bg-clip-text text-transparent"
            >
              USDC
            </span>
            <span className="text-[14px] font-semibold text-white/50 tracking-wide">
              Stablecoin
            </span>
          </div>

          <p className="text-[13px] text-white/60 leading-relaxed mb-5 max-w-[250px]">
            Works on weekends. Works at 3am. Six chains supported, one-tap
            conversion to buying power.
          </p>

          {/* Footer row */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              {["USDC", "USDT", "ETH", "Base"].map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-bold text-white/80 uppercase tracking-[0.1em] px-2 py-1 rounded-md bg-white/[0.08]"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0A0A0F]">
              <ArrowRight size={15} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  );
}
