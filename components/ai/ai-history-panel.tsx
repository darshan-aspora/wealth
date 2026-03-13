"use client";

import { motion } from "framer-motion";
import { Sparkles, MessageSquare } from "lucide-react";
import { useAI } from "@/contexts/ai-context";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function AIHistoryList() {
  const { conversations, switchConversation, currentConversation } = useAI();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/60">
          <MessageSquare size={24} className="text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <span className="text-[15px] text-muted-foreground">No conversations yet</span>
        <span className="text-[13px] text-muted-foreground/60">Start chatting to see history here</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-3 pb-4 pt-2">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
          Recent
        </p>
        <div className="flex flex-col gap-1.5">
          {conversations.slice(0, 20).map((conv, i) => {
            const isActive = conv.id === currentConversation?.id;
            return (
              <motion.button
                key={conv.id}
                onClick={() => switchConversation(conv.id)}
                className="flex w-full flex-col gap-1 rounded-2xl px-3.5 py-3 text-left"
                style={{
                  background: isActive
                    ? "rgba(124,90,245,0.1)"
                    : "hsl(var(--secondary) / 0.5)",
                  border: isActive
                    ? "1px solid rgba(124,90,245,0.2)"
                    : "1px solid transparent",
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-lg px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      background: "hsl(var(--secondary))",
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    {conv.sourceLabel}
                  </span>
                  <span className="flex-shrink-0 text-[11px] text-muted-foreground/60">
                    {formatRelativeTime(conv.updatedAt)}
                  </span>
                </div>
                <span
                  className="line-clamp-1 text-[15px] font-medium"
                  style={{ color: isActive ? "#7c5af5" : "hsl(var(--foreground))" }}
                >
                  {conv.title}
                </span>
                {conv.messages.length > 0 && (
                  <span className="line-clamp-1 text-[13px] text-muted-foreground/70">
                    {conv.messages[conv.messages.length - 1].content.slice(0, 60)}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
