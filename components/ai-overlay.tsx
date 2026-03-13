"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAI } from "@/contexts/ai-context";
import { AIHeader } from "./ai/ai-header";
import { AIBody } from "./ai/ai-body";
import { AIInputBar } from "./ai/ai-input-bar";

const BUTTON_SIZE = 44; // visible square tab button
const springConfig = { type: "spring" as const, stiffness: 360, damping: 36, mass: 1 };

export function AIOverlay() {
  const { isOpen, openAI, closeAI, sendMessage } = useAI();
  const containerRef = useRef<HTMLDivElement>(null);

  const [containerW, setContainerW] = useState(390);
  useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => setContainerW(containerRef.current!.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const xClosed = containerW;
  const x = useMotionValue(xClosed);
  const overlayOpacity = useTransform(x, [0, xClosed], [1, 0]);

  useEffect(() => {
    animate(x, isOpen ? 0 : xClosed, springConfig);
  }, [isOpen, xClosed, x]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const cur = x.get();
    const goOpen = info.offset.x < -60 || info.velocity.x < -300 || cur < containerW / 2;
    const snapTo = goOpen ? 0 : xClosed;
    animate(x, snapTo, springConfig);
    if (snapTo === 0) openAI();
    else closeAI();
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex justify-center">
      <div ref={containerRef} className="relative w-full max-w-[430px] overflow-hidden">

        {/* ── Tab button — peeks from right edge when drawer is closed ── */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              className="pointer-events-auto absolute top-1/2 z-30 flex -translate-y-1/2 items-center justify-center"
              style={{
                right: 0,
                width: BUTTON_SIZE,
                height: BUTTON_SIZE,
                background: "linear-gradient(135deg, #7c5af5 0%, #6040e0 100%)",
                borderRadius: "10px 0 0 10px",
                boxShadow: "-3px 0 14px rgba(124,90,245,0.5), -1px 0 4px rgba(0,0,0,0.2)",
              }}
              onClick={openAI}
              initial={{ x: BUTTON_SIZE }}
              animate={{ x: 0 }}
              exit={{ x: BUTTON_SIZE }}
              transition={springConfig}
              whileTap={{ scale: 0.92 }}
            >
              <Sparkles size={16} className="text-white" strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Background scrim ─────────────────────────────────────────── */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            opacity: overlayOpacity,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            pointerEvents: isOpen ? "auto" : "none",
          }}
          onClick={closeAI}
        />

        {/* ── Drawer — slides in from right ───────────────────────────── */}
        <motion.div
          className="absolute inset-0 z-10"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: 0, right: xClosed }}
          dragElastic={0.04}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          {/* Drawer content */}
          <div
            className="pointer-events-auto absolute inset-0 flex flex-col overflow-hidden bg-background"
            style={{ borderLeft: "1px solid hsl(var(--border) / 0.3)" }}
          >
            <div className="h-[44px] flex-shrink-0" />
            <AIHeader />
            <div className="relative flex flex-1 flex-col overflow-hidden">
              <AIBody onSelectSuggestion={(text) => sendMessage(text)} />
            </div>
            <AIInputBar />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
