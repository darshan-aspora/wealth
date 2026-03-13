"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useAI } from "@/contexts/ai-context";

/**
 * Invisible 24px strip on the right edge of the app column.
 * Swipe left (drag x negative) to open AI mode.
 * Only active when AI is closed.
 */
export function AIEdgeGesture() {
  const { isOpen, openAI } = useAI();
  const dragStartX = useRef(0);

  if (isOpen) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex justify-center">
      <div className="relative w-full max-w-[430px]">
        <motion.div
          className="pointer-events-auto absolute bottom-0 right-0 top-0 w-6"
          style={{ background: "transparent", touchAction: "pan-y" }}
          drag="x"
          dragConstraints={{ left: -80, right: 0 }}
          dragElastic={0.15}
          dragMomentum={false}
          onDragStart={(_, info) => {
            dragStartX.current = info.point.x;
          }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -40 && info.velocity.x < -80) {
              openAI();
            }
          }}
        />
      </div>
    </div>
  );
}
