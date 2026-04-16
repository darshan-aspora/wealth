"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCompare } from "@/contexts/compare-context";

export function CompareToast() {
  const { toast, dismissToast } = useCompare();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[min(360px,calc(100%-32px))]"
        >
          <div className="flex items-center gap-2 rounded-2xl bg-foreground px-4 py-3 shadow-xl">
            <span className="flex-1 text-[14px] font-medium text-background">{toast.message}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  dismissToast();
                }}
                className="text-[14px] font-bold text-background active:opacity-60 transition-opacity"
              >
                Undo
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
