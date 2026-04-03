"use client";

import { useState } from "react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AI_ANALYSIS_VARIATIONS } from "../../components/ai-analysis-variations";

export default function AIAnalysisVariations() {
  const [idx, setIdx] = useState(0);
  const total = AI_ANALYSIS_VARIATIONS.length;
  const { name, component: Comp } = AI_ANALYSIS_VARIATIONS[idx];

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pt-4 pb-2">
          <h1 className="text-[20px] font-bold text-foreground">AI Analysis — Variations</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Tap arrows to cycle through layouts</p>
        </div>

        {/* Switcher */}
        <div className="flex items-center justify-between px-5 py-3">
          <button
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 active:bg-muted transition-colors"
          >
            <ChevronLeft size={18} className="text-foreground" />
          </button>

          <div className="text-center">
            <p className="text-[14px] font-semibold text-foreground">{name}</p>
            <p className="text-[12px] text-muted-foreground">{idx + 1} of {total}</p>
          </div>

          <button
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 active:bg-muted transition-colors"
          >
            <ChevronRight size={18} className="text-foreground" />
          </button>
        </div>

        {/* Variation display */}
        <div className="px-5 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Comp />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}
