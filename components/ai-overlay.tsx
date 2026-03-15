"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { useAI } from "@/contexts/ai-context";
import { AIBuddy } from "./ai/ai-buddy";
import { AIHeader } from "./ai/ai-header";
import { AIBody } from "./ai/ai-body";
import { AIInputBar } from "./ai/ai-input-bar";

const FAB_SIZE = 52;
const PEEK = 10; // how much peeks outside container
const EDGE_MARGIN = 16;
const springConfig = { type: "spring" as const, stiffness: 360, damping: 36, mass: 1 };
const snapSpring = { type: "spring" as const, stiffness: 400, damping: 32 };

export function AIOverlay() {
  const { isOpen, openAI, closeAI, sendMessage } = useAI();
  const containerRef = useRef<HTMLDivElement>(null);

  const [containerW, setContainerW] = useState(390);
  const [containerH, setContainerH] = useState(800);
  useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      setContainerW(containerRef.current!.offsetWidth);
      setContainerH(containerRef.current!.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Drawer x position
  const xClosed = containerW;
  const drawerX = useMotionValue(xClosed);
  const overlayOpacity = useTransform(drawerX, [0, xClosed], [1, 0]);

  useEffect(() => {
    animate(drawerX, isOpen ? 0 : xClosed, springConfig);
  }, [isOpen, xClosed, drawerX]);

  const handleDrawerDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const cur = drawerX.get();
    const goOpen = info.offset.x < -60 || info.velocity.x < -300 || cur < containerW / 2;
    const snapTo = goOpen ? 0 : xClosed;
    animate(drawerX, snapTo, springConfig);
    if (snapTo === 0) openAI();
    else closeAI();
  };

  // ── FAB drag state ──────────────────────────────────────────────────
  const fabX = useMotionValue(containerW - FAB_SIZE + PEEK);
  const fabY = useMotionValue(containerH * 0.5 - FAB_SIZE / 2);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Update FAB position when container size changes
  const fabInitialized = useRef(false);
  useEffect(() => {
    if (!fabInitialized.current) {
      fabX.set(containerW - FAB_SIZE + PEEK);
      fabY.set(containerH * 0.5 - FAB_SIZE / 2);
      fabInitialized.current = true;
    }
  }, [containerW, containerH, fabX, fabY]);

  const snapToEdge = useCallback(
    (cx: number, cy: number) => {
      const maxX = containerW - FAB_SIZE + PEEK;
      const minX = -PEEK;
      const maxY = containerH - FAB_SIZE - EDGE_MARGIN;
      const minY = EDGE_MARGIN;

      // Clamp Y
      const clampedY = Math.max(minY, Math.min(maxY, cy));

      // Snap to nearest horizontal edge
      const snapX = cx < containerW / 2 ? minX : maxX;

      animate(fabX, snapX, snapSpring);
      animate(fabY, clampedY, snapSpring);
    },
    [containerW, containerH, fabX, fabY]
  );

  // ── Eye tracking — eyes follow taps on screen ─────────────────────
  const [lookAt, setLookAt] = useState<{ x: number; y: number } | null>(null);
  const lookAtTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) return;

    const handleTap = (e: PointerEvent) => {
      // Get FAB center in viewport coords
      const fabCenterX = fabX.get() + FAB_SIZE / 2;
      const fabCenterY = fabY.get() + FAB_SIZE / 2;

      // Tap position relative to the container
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const tapX = e.clientX - rect.left;
      const tapY = e.clientY - rect.top;

      // Direction from FAB to tap, normalized to -1..1
      const dx = tapX - fabCenterX;
      const dy = tapY - fabCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 30) return; // ignore taps on the FAB itself

      const nx = Math.max(-1, Math.min(1, dx / 200));
      const ny = Math.max(-1, Math.min(1, dy / 200));
      setLookAt({ x: nx, y: ny });

      // Reset after 2s
      if (lookAtTimer.current) clearTimeout(lookAtTimer.current);
      lookAtTimer.current = setTimeout(() => setLookAt(null), 2000);
    };

    document.addEventListener("pointerdown", handleTap, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", handleTap);
      if (lookAtTimer.current) clearTimeout(lookAtTimer.current);
    };
  }, [isOpen, fabX, fabY]);

  const handleFabDragStart = () => {
    setIsDragging(true);
    dragStartPos.current = { x: fabX.get(), y: fabY.get() };
  };

  const handleFabDragEnd = () => {
    setIsDragging(false);
    const cx = fabX.get();
    const cy = fabY.get();

    // If barely moved, treat as a click
    const dx = Math.abs(cx - dragStartPos.current.x);
    const dy = Math.abs(cy - dragStartPos.current.y);
    if (dx < 4 && dy < 4) {
      openAI();
      return;
    }

    snapToEdge(cx + FAB_SIZE / 2, cy);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex justify-center">
      <div ref={containerRef} className="relative w-full max-w-[430px] overflow-visible">

        {/* ── Floating AI Button — draggable to any edge ── */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              className="pointer-events-auto absolute z-30"
              style={{
                x: fabX,
                y: fabY,
                width: FAB_SIZE,
                height: FAB_SIZE,
              }}
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={handleFabDragStart}
              onDragEnd={handleFabDragEnd}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={snapSpring}
            >
              <motion.div
                className="flex h-full w-full cursor-grab items-center justify-center rounded-full text-foreground active:cursor-grabbing"
                style={{
                  background: "hsl(var(--background))",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.25), 0 1px 6px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
                }}
                whileTap={{ scale: isDragging ? 1 : 0.9 }}
              >
                <AIBuddy size={34} lookAt={lookAt} />
              </motion.div>
            </motion.div>
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
          style={{ x: drawerX }}
          drag="x"
          dragConstraints={{ left: 0, right: xClosed }}
          dragElastic={0.04}
          dragMomentum={false}
          onDragEnd={handleDrawerDragEnd}
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
