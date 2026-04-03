"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronLeft, MoreVertical, Send, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Stock Badge                                                        */
/* ------------------------------------------------------------------ */

function StockBadge({ name, changePercent, onTap }: {
  symbol: string; name: string; changePercent: number; onTap: () => void;
}) {
  const gain = changePercent >= 0;
  return (
    <span className="inline whitespace-nowrap">
      <button onClick={onTap} className="font-bold text-foreground active:underline">{name}</button>
      {" "}
      <span className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums align-middle",
        gain ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
      )}>
        <span className="text-[10px]">{gain ? "↗" : "↘"}</span>
        {Math.abs(changePercent).toFixed(2)}%
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Segment =
  | { type: "text"; content: string }
  | { type: "stock"; symbol: string; name: string; changePercent: number };

interface ContentBlock {
  kind: "paragraph" | "heading" | "bullet";
  segments: Segment[];
}

interface ChatMessage {
  role: "ai" | "user";
  blocks?: ContentBlock[];
  text?: string;
  showScore?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Score data                                                         */
/* ------------------------------------------------------------------ */

const SCORE_PREV = 68;
const SCORE_CURR = 74;
const SCORE_LABEL = "Good";

/* ------------------------------------------------------------------ */
/*  Suggested questions                                                */
/* ------------------------------------------------------------------ */

const SUGGESTED_QUESTIONS = [
  "Should I sell my losing positions?",
  "How can I reduce tech concentration?",
  "What sectors should I invest in next?",
];

/* ------------------------------------------------------------------ */
/*  Initial analysis blocks                                            */
/* ------------------------------------------------------------------ */

const INITIAL_BLOCKS: ContentBlock[] = [
  { kind: "paragraph", segments: [{ type: "text", content: "Your health score improved from 68 to 74. Here's the breakdown." }] },
  { kind: "heading", segments: [{ type: "text", content: "Winners" }] },
  { kind: "bullet", segments: [
    { type: "stock", symbol: "AAPL", name: "Apple", changePercent: 7.94 },
    { type: "text", content: " continues to show resilience with strong momentum" },
  ]},
  { kind: "bullet", segments: [
    { type: "stock", symbol: "NVDA", name: "NVIDIA", changePercent: 7.04 },
    { type: "text", content: " riding the AI hardware wave" },
  ]},
  { kind: "bullet", segments: [
    { type: "stock", symbol: "AMD", name: "AMD", changePercent: 15.33 },
    { type: "text", content: " and " },
    { type: "stock", symbol: "CRM", name: "Salesforce", changePercent: 14.41 },
    { type: "text", content: " also pulling their weight" },
  ]},
  { kind: "heading", segments: [{ type: "text", content: "Needs attention" }] },
  { kind: "bullet", segments: [
    { type: "stock", symbol: "SNAP", name: "Snap", changePercent: -20.0 },
    { type: "text", content: " down 20% — is the thesis still intact?" },
  ]},
  { kind: "bullet", segments: [
    { type: "stock", symbol: "PYPL", name: "PayPal", changePercent: -12.43 },
    { type: "text", content: " and " },
    { type: "stock", symbol: "RIVN", name: "Rivian", changePercent: -10.0 },
    { type: "text", content: " declining steadily" },
  ]},
  { kind: "heading", segments: [{ type: "text", content: "Concentration risk" }] },
  { kind: "bullet", segments: [{ type: "text", content: "62% in tech — a 10% sector dip means ~6% portfolio hit" }] },
  { kind: "bullet", segments: [{ type: "text", content: "83% in mega/large cap — missing mid and small cap growth" }] },
  { kind: "heading", segments: [{ type: "text", content: "What's working" }] },
  { kind: "bullet", segments: [{ type: "text", content: "Beating S&P 500 by +3.6%" }] },
  { kind: "bullet", segments: [{ type: "text", content: "Lumpsum picks return 22.8% vs SIP at 12.6%" }] },
];

/* ------------------------------------------------------------------ */
/*  Mock follow-up responses                                           */
/* ------------------------------------------------------------------ */

const FOLLOWUP_RESPONSES: Record<string, ContentBlock[]> = {
  "Should I sell my losing positions?": [
    { kind: "paragraph", segments: [{ type: "text", content: "Here's how I'd think about each one:" }] },
    { kind: "bullet", segments: [
      { type: "stock", symbol: "SNAP", name: "Snap", changePercent: -20.0 },
      { type: "text", content: " — ad market recovery is uncertain. Consider trimming" },
    ]},
    { kind: "bullet", segments: [
      { type: "stock", symbol: "PYPL", name: "PayPal", changePercent: -12.43 },
      { type: "text", content: " — new CEO strategy is showing early signs. Could hold" },
    ]},
    { kind: "bullet", segments: [
      { type: "stock", symbol: "RIVN", name: "Rivian", changePercent: -10.0 },
      { type: "text", content: " — cash burn is high. Set a stop-loss if you haven't" },
    ]},
    { kind: "paragraph", segments: [{ type: "text", content: "Rule of thumb: if you wouldn't buy it today at this price, it's probably time to let go." }] },
  ],
  "How can I reduce tech concentration?": [
    { kind: "paragraph", segments: [{ type: "text", content: "You don't have to sell everything. Small shifts make a big difference:" }] },
    { kind: "bullet", segments: [{ type: "text", content: "Trim 10-15% from your largest tech positions" }] },
    { kind: "bullet", segments: [{ type: "text", content: "Redirect into Healthcare (LLY, UNH) or Industrials (CAT, DE)" }] },
    { kind: "bullet", segments: [{ type: "text", content: "An ETF like XLV or XLI gives instant diversification" }] },
    { kind: "paragraph", segments: [{ type: "text", content: "This would bring tech from 62% down to roughly 50% — still bullish, but less exposed." }] },
  ],
  "What sectors should I invest in next?": [
    { kind: "paragraph", segments: [{ type: "text", content: "Based on your current gaps and market conditions:" }] },
    { kind: "heading", segments: [{ type: "text", content: "Strong picks right now" }] },
    { kind: "bullet", segments: [{ type: "text", content: "Healthcare — aging demographics, strong pipelines" }] },
    { kind: "bullet", segments: [{ type: "text", content: "Energy — cash flow machines, undervalued relative to earnings" }] },
    { kind: "heading", segments: [{ type: "text", content: "Defensive diversifiers" }] },
    { kind: "bullet", segments: [{ type: "text", content: "Consumer Staples — low correlation with your current tech-heavy mix" }] },
    { kind: "bullet", segments: [{ type: "text", content: "Utilities — steady dividends, inflation hedge" }] },
  ],
  default: [
    { kind: "paragraph", segments: [{ type: "text", content: "Good question. Looking at your portfolio context:" }] },
    { kind: "bullet", segments: [{ type: "text", content: "Your allocation is heavily growth-oriented" }] },
    { kind: "bullet", segments: [{ type: "text", content: "Adding value stocks could reduce volatility without hurting returns" }] },
    { kind: "paragraph", segments: [{ type: "text", content: "Want me to suggest specific moves?" }] },
  ],
};

/* ------------------------------------------------------------------ */
/*  Past analyses (for history bottom sheet)                           */
/* ------------------------------------------------------------------ */

const PAST_SESSIONS = [
  { date: "Mar 28, 2026", score: 68, summary: "Tech heavy, 3 losers flagged" },
  { date: "Mar 15, 2026", score: 71, summary: "Improved diversification" },
  { date: "Feb 28, 2026", score: 64, summary: "High concentration risk" },
];

/* ------------------------------------------------------------------ */
/*  Score Ring                                                         */
/* ------------------------------------------------------------------ */

function ScoreRing() {
  const [displayScore, setDisplayScore] = useState(SCORE_PREV);
  const diff = SCORE_CURR - SCORE_PREV;
  const improved = diff >= 0;

  useEffect(() => {
    const duration = 1200;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(SCORE_PREV + (SCORE_CURR - SCORE_PREV) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(animate, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center py-5">
      <div className="relative flex items-center justify-center h-28 w-28 mb-3">
        <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
          <motion.circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round"
            initial={{ strokeDasharray: `${SCORE_PREV} ${100 - SCORE_PREV}` }}
            animate={{ strokeDasharray: `${SCORE_CURR} ${100 - SCORE_CURR}` }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[32px] font-bold text-foreground leading-none">{displayScore}</span>
          <span className="text-[12px] text-muted-foreground mt-1">{SCORE_LABEL}</span>
        </div>
      </div>
      <div className={cn("flex items-center gap-1 rounded-full px-3 py-1", improved ? "bg-gain/10" : "bg-loss/10")}>
        {improved ? <ArrowUp size={12} className="text-gain" /> : <ArrowDown size={12} className="text-loss" />}
        <span className={cn("text-[12px] font-semibold", improved ? "text-gain" : "text-loss")}>
          {improved ? "+" : ""}{diff} from last analysis
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sticky collapsed score bar                                         */
/* ------------------------------------------------------------------ */

function StickyScoreBar({ visible }: { visible: boolean }) {
  const diff = SCORE_CURR - SCORE_PREV;
  const improved = diff >= 0;
  if (!visible) return null;

  return (
    <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border/30 px-5 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center h-7 w-7">
          <svg viewBox="0 0 36 36" className="h-7 w-7 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--foreground))" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${SCORE_CURR} ${100 - SCORE_CURR}`} />
          </svg>
          <span className="absolute text-[9px] font-bold text-foreground">{SCORE_CURR}</span>
        </div>
        <span className="text-[13px] font-semibold text-foreground">Health Score</span>
      </div>
      <div className={cn("flex items-center gap-1 rounded-full px-2 py-0.5", improved ? "bg-gain/10" : "bg-loss/10")}>
        {improved ? <ArrowUp size={10} className="text-gain" /> : <ArrowDown size={10} className="text-loss" />}
        <span className={cn("text-[11px] font-semibold", improved ? "text-gain" : "text-loss")}>{improved ? "+" : ""}{diff}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Typing block (faster: step 4-6 chars, interval 10ms)               */
/* ------------------------------------------------------------------ */

function TypingBlock({ block, onComplete, startTyping }: {
  block: ContentBlock; onComplete: () => void; startTyping: boolean;
}) {
  const router = useRouter();
  const [visibleChars, setVisibleChars] = useState(0);
  const [done, setDone] = useState(false);
  const completedRef = useRef(false);

  const segLengths = useMemo(() => block.segments.map((s) => (s.type === "text" ? s.content.length : s.name.length)), [block.segments]);
  const totalChars = useMemo(() => segLengths.reduce((a, b) => a + b, 0), [segLengths]);

  useEffect(() => {
    if (!startTyping || done) return;
    completedRef.current = false;
    const interval = setInterval(() => {
      setVisibleChars((prev) => {
        const step = 4 + Math.floor(Math.random() * 3);
        const next = Math.min(prev + step, totalChars);
        if (next >= totalChars && !completedRef.current) {
          completedRef.current = true;
          clearInterval(interval);
          setTimeout(() => { setDone(true); onComplete(); }, 40);
        }
        return next;
      });
    }, 10);
    return () => clearInterval(interval);
  }, [startTyping, totalChars, done, onComplete]);

  if (!startTyping && visibleChars === 0) return null;

  let consumed = 0;
  const rendered = block.segments.map((seg, i) => {
    const segLen = segLengths[i];
    const remaining = visibleChars - consumed;
    consumed += segLen;
    if (remaining <= 0) return null;
    if (seg.type === "stock") {
      if (remaining < segLen) return null;
      return <StockBadge key={i} symbol={seg.symbol} name={seg.name} changePercent={seg.changePercent} onTap={() => router.push(`/stocks/${seg.symbol}`)} />;
    }
    return <span key={i}>{seg.content.slice(0, Math.min(remaining, segLen))}</span>;
  });

  const cursor = !done && startTyping && (
    <motion.span className="inline-block w-[2px] h-[14px] ml-0.5 align-text-bottom bg-foreground/60" animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
  );

  if (block.kind === "heading") return <p className="text-[14px] font-bold text-foreground mt-4 mb-1">{rendered}{cursor}</p>;
  if (block.kind === "bullet") return <div className="flex gap-2 mb-1"><span className="text-muted-foreground/50 mt-[3px] shrink-0">•</span><p className="text-[13px] leading-[1.7] text-foreground/80">{rendered}{cursor}</p></div>;
  return <p className="text-[14px] leading-[1.7] text-foreground/85 mb-2">{rendered}{cursor}</p>;
}

/* ------------------------------------------------------------------ */
/*  AI message                                                         */
/* ------------------------------------------------------------------ */

function AIMessage({ blocks, onAllDone }: { blocks: ContentBlock[]; onAllDone?: () => void }) {
  const [activeBlock, setActiveBlock] = useState(0);
  const [done, setDone] = useState(false);

  const handleComplete = useCallback(() => {
    const next = activeBlock + 1;
    if (next < blocks.length) {
      setTimeout(() => setActiveBlock(next), 60);
    } else {
      setDone(true);
      onAllDone?.();
    }
  }, [activeBlock, blocks.length, onAllDone]);

  return (
    <div>
      {blocks.map((block, i) => (
        <TypingBlock key={i} block={block} startTyping={i <= activeBlock} onComplete={i === activeBlock ? handleComplete : () => {}} />
      ))}
      {done && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-[11px] text-muted-foreground/30 mt-3">just now</motion.p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  User message                                                       */
/* ------------------------------------------------------------------ */

function UserMessage({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end mt-4 mb-4">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-foreground px-4 py-2.5">
        <p className="text-[14px] text-background leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Analyzing dots                                                     */
/* ------------------------------------------------------------------ */

function AnalyzingDots({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 py-3">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </div>
      <span className="text-[13px] text-muted-foreground/60">{text}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Suggested questions                                                */
/* ------------------------------------------------------------------ */

function SuggestedQuestions({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-4 space-y-2"
    >
      {SUGGESTED_QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="block w-full text-left rounded-xl border border-border/50 px-4 py-2.5 text-[13px] text-foreground/80 active:bg-muted/40 transition-colors"
        >
          {q}
        </button>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Analysis Page                                                      */
/* ------------------------------------------------------------------ */

export function AnalysisPage({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", blocks: INITIAL_BLOCKS, showScore: true },
  ]);
  const [initialDone, setInitialDone] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [analyzing, setAnalyzing] = useState(true);
  const [scoreOut, setScoreOut] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pendingResponse, setPendingResponse] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnalyzing(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
      });
    }
  }, [messages, analyzing, pendingResponse, showSuggestions]);

  // Observe score ring
  useEffect(() => {
    const el = scoreRef.current;
    const container = scrollRef.current;
    if (!el || !container) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScoreOut(!entry.isIntersecting),
      { root: container, threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [analyzing]);

  const sendQuestion = useCallback((q: string) => {
    if (pendingResponse) return;
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setPendingResponse(true);

    const responseBlocks = FOLLOWUP_RESPONSES[q] || FOLLOWUP_RESPONSES.default;
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", blocks: responseBlocks }]);
      setPendingResponse(false);
    }, 1200);
  }, [pendingResponse]);

  const handleSend = () => {
    const q = inputValue.trim();
    if (!q) return;
    setInputValue("");
    sendQuestion(q);
  };

  const handleInitialDone = useCallback(() => {
    setInitialDone(true);
    setShowSuggestions(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background"
    >
      <div className="mx-auto flex h-full max-w-[430px] flex-col">
        <StatusBar />
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted/60 transition-colors">
              <ChevronLeft size={20} className="text-foreground" />
            </button>
            <p className="text-[17px] font-bold text-foreground">Portfolio Analysis</p>
          </div>
          <button onClick={() => setHistoryOpen(true)} className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted/60 transition-colors">
            <MoreVertical size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar relative">
          <StickyScoreBar visible={scoreOut && !analyzing} />

          <div className="px-5 py-5">
            {analyzing && (
              <div className="flex flex-col items-center justify-center py-20">
                {/* Pulsing ring */}
                <div className="relative flex items-center justify-center h-20 w-20 mb-5">
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-foreground/20"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border-2 border-foreground/30"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={24} strokeWidth={1.8} className="text-foreground" />
                  </motion.div>
                </div>
                <p className="text-[15px] font-semibold text-foreground mb-1">Analyzing your portfolio</p>
                <p className="text-[13px] text-muted-foreground">Reviewing holdings, risk, and performance</p>
              </div>
            )}

            {!analyzing && messages.map((msg, mi) => (
              <div key={mi}>
                {msg.role === "user" && msg.text && <UserMessage text={msg.text} />}
                {msg.role === "ai" && (
                  <div className={cn(mi > 0 && "mt-2")}>
                    {msg.showScore && (
                      <div ref={scoreRef}>
                        <ScoreRing />
                      </div>
                    )}
                    {msg.blocks && (
                      <AIMessage
                        blocks={msg.blocks}
                        onAllDone={mi === 0 ? handleInitialDone : undefined}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Suggested questions after initial analysis */}
            {showSuggestions && !pendingResponse && (
              <SuggestedQuestions onSelect={sendQuestion} />
            )}

            {pendingResponse && <AnalyzingDots text="Thinking..." />}
          </div>
        </div>

        {/* Input + disclaimer */}
        <div className="border-t border-border/40 bg-background">
          <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your portfolio..."
              disabled={!initialDone}
              className="flex-1 bg-muted/40 rounded-xl px-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!initialDone || !inputValue.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground disabled:opacity-30 active:opacity-80 transition-opacity"
            >
              <Send size={16} className="text-background" />
            </button>
          </div>
          <p className="px-5 pb-3 text-[11px] text-muted-foreground/40 text-center">
            AI can be inaccurate. Verify independently.
          </p>
        </div>

        {/* History bottom sheet */}
        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8 max-w-[430px] mx-auto">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-[17px] font-bold">Past Analyses</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              {PAST_SESSIONS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className="relative flex items-center justify-center h-10 w-10 shrink-0">
                    <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${s.score} ${100 - s.score}`} />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-foreground">{s.score}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-foreground">{s.date}</p>
                    <p className="text-[12px] text-muted-foreground">{s.summary}</p>
                  </div>
                  <ChevronLeft size={16} className="text-muted-foreground/30 rotate-180 shrink-0" />
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <HomeIndicator />
      </div>
    </motion.div>
  );
}
