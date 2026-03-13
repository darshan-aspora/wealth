"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { type AIMessage } from "@/contexts/ai-context";
import { useAI } from "@/contexts/ai-context";

// Badge syntax: [[SYMBOL:PRICE:CHANGE]] → inline colored chip
interface BadgeToken {
  type: "text" | "badge";
  content: string;
  symbol?: string;
  price?: string;
  change?: string;
  positive?: boolean;
}

function parseBadges(text: string): BadgeToken[] {
  const parts: BadgeToken[] = [];
  const regex = /\[\[([^:]+):([^:]+):([^\]]+)\]\]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    const change = match[3];
    parts.push({ type: "badge", content: match[0], symbol: match[1], price: match[2], change, positive: !change.startsWith("-") });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push({ type: "text", content: text.slice(lastIndex) });
  return parts;
}

function FinancialBadge({ token }: { token: BadgeToken }) {
  return (
    <span
      className="mx-0.5 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[12px] font-semibold tabular-nums"
      style={{
        background: token.positive ? "hsl(var(--gain) / 0.12)" : "hsl(var(--loss) / 0.12)",
        border: `1px solid ${token.positive ? "hsl(var(--gain) / 0.25)" : "hsl(var(--loss) / 0.25)"}`,
        color: token.positive ? "hsl(var(--gain))" : "hsl(var(--loss))",
      }}
    >
      <span className="text-muted-foreground">{token.symbol}</span>
      <span>{token.price}</span>
      <span>{token.change}</span>
    </span>
  );
}

function renderContent(text: string) {
  return parseBadges(text).map((token, i) =>
    token.type === "badge" ? <FinancialBadge key={i} token={token} /> : <span key={i}>{token.content}</span>
  );
}

export function AIMessageBubble({ message, index }: { message: AIMessage; index: number }) {
  const { streamingState } = useAI();
  const isUser = message.role === "user";
  const visibleChars = streamingState.get(message.id);
  const displayContent =
    message.isStreaming && visibleChars !== undefined
      ? message.content.slice(0, visibleChars)
      : message.content;

  return (
    <motion.div
      className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 28, delay: index * 0.03 }}
    >
      {!isUser && (
        <div
          className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: "hsl(var(--primary) / 0.12)", border: "1px solid hsl(var(--primary) / 0.2)" }}
        >
          <Sparkles size={13} style={{ color: "#7c5af5" }} strokeWidth={1.8} />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
        style={
          isUser
            ? { background: "#7c5af5", border: "1px solid rgba(124,90,245,0.4)" }
            : { background: "hsl(var(--secondary) / 0.8)", border: "1px solid hsl(var(--border) / 0.5)" }
        }
      >
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: isUser ? "#ffffff" : "hsl(var(--foreground))" }}
        >
          {!isUser ? renderContent(displayContent) : displayContent}
          {message.isStreaming && (
            <motion.span
              className="ml-0.5 inline-block h-3.5 w-[2px] rounded-full"
              style={{ background: "#7c5af5" }}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </p>
      </div>
    </motion.div>
  );
}

export function AIThinkingBubble() {
  return (
    <motion.div
      className="flex gap-2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <div
        className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: "hsl(var(--primary) / 0.12)", border: "1px solid hsl(var(--primary) / 0.2)" }}
      >
        <Sparkles size={13} style={{ color: "#7c5af5" }} strokeWidth={1.8} />
      </div>
      <div
        className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3.5"
        style={{ background: "hsl(var(--secondary) / 0.8)", border: "1px solid hsl(var(--border) / 0.5)" }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "#7c5af5" }}
            animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
