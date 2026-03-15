"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ALL_TICKERS,
  formatPercent,
  isGain,
  type TickerItem,
} from "@/components/ticker";
import { useWatchlist } from "@/components/watchlist-context";

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase = "analyzing" | "typing" | "complete";

type TextSegment = { type: "text"; value: string };
type StockSegment = { type: "stock"; symbol: string };
type BreakSegment = { type: "break" };
type Segment = TextSegment | StockSegment | BreakSegment;

// ─── Stock Badge (inline in prose) ──────────────────────────────────────────

function StockBadge({ ticker }: { ticker: TickerItem }) {
  const gain = isGain(ticker);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 mx-0.5 text-[13px] font-semibold tabular-nums",
        "align-baseline whitespace-nowrap",
        gain ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
      )}
    >
      <span className="font-bold">{ticker.symbol}</span>
      <span className="text-[12px]">{formatPercent(ticker.changePercent)}</span>
    </motion.span>
  );
}

// ─── Mock Analysis Builder ──────────────────────────────────────────────────

function buildAnalysis(): Segment[] {
  return [
    {
      type: "text",
      value: "Markets are showing mixed signals today. The ",
    },
    { type: "stock", symbol: "SPX" },
    {
      type: "text",
      value: " is edging higher while the tech-heavy ",
    },
    { type: "stock", symbol: "NDX" },
    {
      type: "text",
      value:
        " trails behind, reflecting a rotation out of high-growth names into value and cyclicals. Breadth is narrowing with only 48% of S&P constituents trading above their 20-day moving average.",
    },
    { type: "break" },

    {
      type: "text",
      value: "Leading your watchlist, ",
    },
    { type: "stock", symbol: "AMZN" },
    {
      type: "text",
      value:
        " is rallying on strong AWS revenue expectations ahead of earnings, while ",
    },
    { type: "stock", symbol: "META" },
    {
      type: "text",
      value:
        " continues its momentum from robust ad spend data and AI monetization optimism. ",
    },
    { type: "stock", symbol: "AAPL" },
    {
      type: "text",
      value:
        " is climbing after analysts raised price targets citing iPhone cycle strength and services growth hitting new records.",
    },
    { type: "break" },

    {
      type: "text",
      value: "On the downside, ",
    },
    { type: "stock", symbol: "TSLA" },
    {
      type: "text",
      value:
        " is under significant pressure following delivery miss reports and margin compression concerns. Semiconductor names are also weak\u2014",
    },
    { type: "stock", symbol: "NVDA" },
    { type: "text", value: ", " },
    { type: "stock", symbol: "AMD" },
    { type: "text", value: ", and " },
    { type: "stock", symbol: "INTC" },
    {
      type: "text",
      value:
        " are all retreating as investors take profits after the extended AI-driven rally. Export restriction concerns are adding to the selling pressure.",
    },
    { type: "break" },

    {
      type: "text",
      value: "Financials are holding steady. ",
    },
    { type: "stock", symbol: "JPM" },
    { type: "text", value: " and " },
    { type: "stock", symbol: "V" },
    {
      type: "text",
      value:
        " are posting modest gains, benefiting from rising rate expectations and strong consumer spending data. ",
    },
    { type: "stock", symbol: "UNH" },
    {
      type: "text",
      value:
        " is dipping slightly on regulatory noise around Medicare Advantage reimbursement rates.",
    },
    { type: "break" },

    {
      type: "text",
      value:
        "Keep an eye on Treasury yields today\u2014the 10-year is testing 4.5% which has historically put pressure on growth multiples. The VIX remains subdued at 14.2, suggesting the market isn\u2019t pricing in significant near-term risk despite the sector rotation. Earnings season kicks off next week with major banks reporting first.",
    },
  ];
}

// ─── Flatten segments into word-level tokens for faster streaming ───────────

type Token =
  | { type: "word"; text: string }
  | { type: "stock"; symbol: string }
  | { type: "break" };

function segmentsToTokens(segments: Segment[]): Token[] {
  const tokens: Token[] = [];
  for (const seg of segments) {
    if (seg.type === "text") {
      // Split on word boundaries but keep whitespace attached to preceding word
      const words = seg.value.match(/\S+\s*/g);
      if (words) {
        for (const w of words) {
          tokens.push({ type: "word", text: w });
        }
      }
    } else if (seg.type === "stock") {
      tokens.push({ type: "stock", symbol: seg.symbol });
    } else {
      tokens.push({ type: "break" });
    }
  }
  return tokens;
}

function renderTokens(
  tokens: Token[],
  visibleCount: number
): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const show = Math.min(visibleCount, tokens.length);

  for (let i = 0; i < show; i++) {
    const tok = tokens[i];
    if (tok.type === "word") {
      elements.push(<span key={`w-${i}`}>{tok.text}</span>);
    } else if (tok.type === "stock") {
      const ticker = ALL_TICKERS.find((t) => t.symbol === tok.symbol);
      if (ticker) {
        elements.push(<StockBadge key={`s-${i}`} ticker={ticker} />);
      }
    } else {
      elements.push(<span key={`br-${i}`} className="block h-4" />);
    }
  }

  return elements;
}

// ─── Analyzing Phase ────────────────────────────────────────────────────────

function AnalyzingPhase({ stockCount }: { stockCount: number }) {
  const messages = [
    `Scanning ${stockCount} positions...`,
    "Analyzing market signals...",
    "Correlating price movements...",
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1100);
    return () => clearInterval(id);
  }, [messages.length]);

  // Orbiting dot positions (3 dots, 120deg apart)
  const dots = [0, 120, 240];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-24 gap-8"
    >
      {/* Orbiting ring */}
      <div className="relative h-[72px] w-[72px]">
        {/* Rotating dots */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          {dots.map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const r = 39; // percentage radius
            const top = 50 - r * Math.cos(rad);
            const left = 50 + r * Math.sin(rad);
            return (
              <div
                key={deg}
                className="absolute h-1.5 w-1.5 rounded-full bg-gain"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  opacity: 1 - i * 0.3,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}
        </motion.div>

        {/* Faint orbit ring */}
        <div className="absolute inset-[8px] rounded-full border border-dashed border-muted-foreground/10" />

        {/* Central icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={22} className="text-foreground/70" />
          </motion.div>
        </div>
      </div>

      {/* Cycling message */}
      <div className="h-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-[15px] text-muted-foreground/70 font-medium"
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Typing Content ─────────────────────────────────────────────────────────

function TypingContent({
  tokens,
  onComplete,
}: {
  tokens: Token[];
  onComplete: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const totalTokens = tokens.length;
  const completedRef = useRef(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Word-by-word streaming — much faster than char-by-char
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        // Show 1-3 tokens per tick for natural pacing
        const step = tokens[prev]?.type === "break" ? 1 : Math.random() > 0.7 ? 2 : 1;
        const next = Math.min(prev + step, totalTokens);
        if (next >= totalTokens) {
          clearInterval(interval);
          if (!completedRef.current) {
            completedRef.current = true;
            setTimeout(onComplete, 200);
          }
          return totalTokens;
        }
        return next;
      });
    }, 55); // ~55ms per word = fast, natural feel

    return () => clearInterval(interval);
  }, [totalTokens, tokens, onComplete]);

  // Blinking cursor via plain interval (no Framer easing needed)
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  const isTyping = visibleCount < totalTokens;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="px-5 pb-4"
    >
      <div className="text-[15px] leading-[1.75] text-foreground/90">
        {renderTokens(tokens, visibleCount)}

        {/* Blinking cursor */}
        {isTyping && (
          <span
            className="inline-block w-[2px] h-[18px] ml-0.5 align-text-bottom transition-opacity duration-100"
            style={{ opacity: cursorVisible ? 0.7 : 0, backgroundColor: "hsl(var(--foreground))" }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

function AiInsightsInner({ onReanalyze }: { onReanalyze: () => void }) {
  const { sections } = useWatchlist();
  const [phase, setPhase] = useState<Phase>("analyzing");
  const segments = buildAnalysis();
  const tokens = segmentsToTokens(segments);

  // Count all stocks across sections
  const stockCount = sections.reduce(
    (sum, s) => sum + s.stocks.length,
    0
  );

  // Analyzing → typing transition
  useEffect(() => {
    if (phase !== "analyzing") return;
    const timeout = setTimeout(() => setPhase("typing"), 3500);
    return () => clearTimeout(timeout);
  }, [phase]);

  const handleComplete = useCallback(() => {
    setPhase("complete");
  }, []);

  return (
    <div className="pb-6">
      {/* Minimal top padding — tab already labels this section */}
      <div className="h-3" />

      {/* Phase content */}
      <AnimatePresence mode="wait">
        {phase === "analyzing" ? (
          <AnalyzingPhase key="analyzing" stockCount={stockCount} />
        ) : (
          <TypingContent
            key="typing"
            tokens={tokens}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>

      {/* Timestamp + Reanalyze button */}
      <AnimatePresence>
        {phase === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="px-5 pt-4 flex flex-col items-center gap-3"
          >
            <span className="text-[12px] text-muted-foreground/50 font-medium">
              Analyzed just now
            </span>
            <Button
              variant="outline"
              onClick={onReanalyze}
              className="w-full gap-2.5 rounded-xl bg-secondary/30 px-5 py-3 text-[15px] font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground active:scale-[0.98]"
            >
              <RefreshCw size={16} />
              Reanalyze
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AiInsightsContent() {
  const [runKey, setRunKey] = useState(0);

  return (
    <AiInsightsInner
      key={runKey}
      onReanalyze={() => setRunKey((k) => k + 1)}
    />
  );
}
