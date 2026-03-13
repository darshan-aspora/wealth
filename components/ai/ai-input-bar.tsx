"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useAI } from "@/contexts/ai-context";

export function AIInputBar() {
  const [inputValue, setInputValue] = useState("");
  const { sendMessage, isGenerating, view, setView } = useAI();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isGenerating) return;
    if (view === "history") setView("chat");
    sendMessage(text);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = inputValue.trim().length > 0 && !isGenerating;

  return (
    <div className="flex-shrink-0 border-t border-border/30 px-3 pb-8 pt-3">
      <div
        className="flex items-end gap-2 rounded-2xl p-2"
        style={{
          background: "hsl(var(--secondary) / 0.6)",
          border: "1px solid hsl(var(--border) / 0.5)",
        }}
      >
        {/* Textarea */}
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (view === "history") setView("chat"); }}
          placeholder="Ask anything about markets..."
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
          style={{ maxHeight: 120, scrollbarWidth: "none" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 120) + "px";
          }}
        />

        <div className="flex items-center pb-0.5">
          <motion.button
            onClick={handleSend}
            whileTap={canSend ? { scale: 0.85 } : {}}
            disabled={!canSend}
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: canSend ? "#7c5af5" : "hsl(var(--secondary))",
            }}
          >
            {isGenerating ? (
              <motion.div
                className="h-3.5 w-3.5 rounded-full border-2"
                style={{ borderColor: "rgba(124,90,245,0.3)", borderTopColor: "#7c5af5" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Send
                size={16}
                strokeWidth={2}
                style={{ color: canSend ? "#fff" : "hsl(var(--muted-foreground))", opacity: canSend ? 1 : 0.6 }}
              />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
