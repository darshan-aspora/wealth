"use client";

import { motion } from "framer-motion";
import { PanelRightClose, Plus, ChevronDown } from "lucide-react";
import { useAI } from "@/contexts/ai-context";

export function AIHeader() {
  const { closeAI, newChat, currentConversation, view, setView } = useAI();

  const isNewChat = !currentConversation || currentConversation.title === "New Chat";
  const title = isNewChat ? "New Chat" : currentConversation.title;
  const isHistoryView = view === "history";

  return (
    <div className="flex items-center gap-2 border-b border-border/30 px-3 pb-3 pt-2">
      {/* Collapse / close button */}
      <motion.button
        onClick={closeAI}
        whileTap={{ scale: 0.85 }}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/60"
      >
        <PanelRightClose size={17} className="text-muted-foreground" strokeWidth={1.8} />
      </motion.button>

      {/* Chat title — clickable dropdown to toggle history */}
      <motion.button
        onClick={() => setView(isHistoryView ? "chat" : "history")}
        whileTap={{ scale: 0.97 }}
        className="flex min-w-0 flex-1 items-center gap-1.5"
      >
        <span
          className="truncate text-[15px] font-semibold"
          style={{
            color: isHistoryView ? "#7c5af5" : "hsl(var(--foreground))",
            opacity: isNewChat && !isHistoryView ? 0.4 : 1,
          }}
        >
          {isHistoryView ? "History" : title}
        </span>
        <motion.div
          animate={{ rotate: isHistoryView ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <ChevronDown
            size={14}
            strokeWidth={2}
            style={{
              color: isHistoryView ? "#7c5af5" : "hsl(var(--muted-foreground))",
            }}
          />
        </motion.div>
      </motion.button>

      {/* New chat button */}
      <motion.button
        onClick={newChat}
        whileTap={{ scale: 0.85 }}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: "hsl(var(--secondary) / 0.6)" }}
      >
        <Plus size={17} strokeWidth={1.8} className="text-muted-foreground" />
      </motion.button>
    </div>
  );
}
