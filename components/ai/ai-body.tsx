"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAI } from "@/contexts/ai-context";
import { AIWelcome } from "./ai-welcome";
import { AIMessageBubble, AIThinkingBubble } from "./ai-message";
import { AIHistoryList } from "./ai-history-panel";

interface AIBodyProps {
  onSelectSuggestion: (text: string) => void;
}

export function AIBody({ onSelectSuggestion }: AIBodyProps) {
  const { currentConversation, isGenerating, view } = useAI();
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = currentConversation?.messages ?? [];
  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (hasMessages) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, hasMessages]);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {view === "history" ? (
          <motion.div
            key="history"
            className="flex flex-1 flex-col overflow-hidden"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <AIHistoryList />
          </motion.div>
        ) : !hasMessages ? (
          <motion.div
            key="welcome"
            className="flex flex-1 flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <AIWelcome onSelectSuggestion={onSelectSuggestion} />
          </motion.div>
        ) : (
          <motion.div
            key="messages"
            className="flex flex-1 flex-col overflow-y-auto px-3 py-3"
            style={{ scrollbarWidth: "none" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex flex-col gap-3">
              {messages.map((msg, i) => (
                <AIMessageBubble key={msg.id} message={msg} index={i} />
              ))}
              <AnimatePresence>
                {isGenerating && messages[messages.length - 1]?.role === "user" && (
                  <AIThinkingBubble key="thinking" />
                )}
              </AnimatePresence>
              <div ref={bottomRef} className="h-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
