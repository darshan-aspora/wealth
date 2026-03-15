"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAI } from "@/contexts/ai-context";
import { getSuggestions } from "@/lib/ai-suggestions";

interface AIWelcomeProps {
  onSelectSuggestion: (text: string) => void;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 26 },
  },
};

export function AIWelcome({ onSelectSuggestion }: AIWelcomeProps) {
  const { currentConversation, currentSource, lastConversation, switchConversation } = useAI();
  const source = currentConversation?.sourcePage ?? currentSource;
  const suggestions = getSuggestions(source);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "none" }}>

      {/* Last conversation resume card */}
      {lastConversation && lastConversation.messages.length > 0 && (
        <motion.button
          onClick={() => switchConversation(lastConversation.id)}
          className="mb-4 flex w-full items-center gap-3 rounded-2xl p-3.5 text-left"
          style={{
            background: "hsl(var(--secondary) / 0.6)",
            border: "1px solid hsl(var(--border) / 0.5)",
          }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(124,90,245,0.12)" }}
          >
            <Sparkles size={16} style={{ color: "#7c5af5" }} strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
              Continue last chat
            </p>
            <p className="truncate text-[14px] font-semibold text-foreground">
              {lastConversation.title}
            </p>
          </div>
          <ArrowRight size={16} className="flex-shrink-0 text-muted-foreground/50" strokeWidth={1.8} />
        </motion.button>
      )}

      {/* Spacer — pushes branding + suggestions toward bottom */}
      <div className="flex-1" />

      {/* Centered ARIA branding */}
      <motion.div
        className="mb-6 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 320, damping: 28 }}
      >
        {/* Big logo */}
        <div
          className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-[22px]"
          style={{
            background: "linear-gradient(145deg, #8b6af8 0%, #7c5af5 40%, #5b3fd4 100%)",
            boxShadow: "0 8px 32px rgba(124,90,245,0.35), 0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Sparkles size={32} className="text-white" strokeWidth={1.8} />
        </div>

        <p className="text-[26px] font-bold tracking-tight text-foreground">ARIA</p>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Ask anything about markets, stocks, or your portfolio.
        </p>
      </motion.div>

      {/* Suggestion pills */}
      <motion.div
        className="flex flex-col gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {suggestions.map((suggestion, i) => (
          <motion.button
            key={i}
            variants={itemVariants}
            onClick={() => onSelectSuggestion(suggestion)}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-2xl px-4 py-3 text-left text-[14px] font-medium"
            style={{
              background: "hsl(var(--secondary) / 0.7)",
              border: "1px solid hsl(var(--border) / 0.5)",
              color: "hsl(var(--foreground) / 0.85)",
            }}
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
