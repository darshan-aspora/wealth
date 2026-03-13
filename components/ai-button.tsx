"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAI } from "@/contexts/ai-context";

export function AIFloatingButton() {
  const { isOpen, openAI } = useAI();

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex justify-center">
      <div className="relative w-full max-w-[430px]">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              className="pointer-events-auto absolute"
              style={{
                // Vertically centered, right edge — tab sticks out from the right
                top: "50%",
                right: 0,
                translateY: "-50%",
              }}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <motion.button
                onClick={openAI}
                whileTap={{ scale: 0.93, x: 4 }}
                className="relative flex flex-col items-center justify-center gap-1.5 overflow-hidden"
                style={{
                  width: 32,
                  paddingTop: 14,
                  paddingBottom: 14,
                  borderRadius: "10px 0 0 10px",
                  background: "linear-gradient(160deg, #7c5af5 0%, #5b3fd4 100%)",
                  boxShadow: "-4px 0 20px rgba(124,90,245,0.5), -2px 0 8px rgba(0,0,0,0.25)",
                }}
              >
                {/* Subtle inner highlight */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-tl-[10px]"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />

                {/* Sparkles icon */}
                <Sparkles size={15} className="relative text-white" strokeWidth={1.9} />

                {/* Thin vertical label */}
                <span
                  className="relative select-none font-semibold uppercase leading-none tracking-[0.12em] text-white/80"
                  style={{
                    fontSize: 9,
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                    letterSpacing: "0.15em",
                  }}
                >
                  AI
                </span>

                {/* Ambient glow pulse on right edge */}
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-l-[10px]"
                  style={{ background: "rgba(124,90,245,0.3)" }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
