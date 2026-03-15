"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Heart, Rocket, Wrench, MessageCircle, Lightbulb, Map, ChevronUp, ChevronDown, Send, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// ─── Aspora Logo (inline SVG) ────────────────────────────────────────

function AsporaLogo({ size = 44, className = "" }: { size?: number; className?: string }) {
  const h = Math.round(size * (18 / 44));
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 202 82"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M95.4665 82H0C44.4529 56.4364 135.365 6.92627 155.33 0H202C189.563 24.6994 184.114 57.7199 199.815 82H127.658C130.54 66.3937 151.244 27.4827 176.738 5.88415H172.923C155.98 12.9343 116.416 50.6952 95.4665 82Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── Interactive sub-components ──────────────────────────────────────

function VoteRow({
  name,
  desc,
  initialVotes,
  onInteract,
}: {
  name: string;
  desc: string;
  initialVotes: number;
  onInteract: () => void;
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);

  const handleVote = (dir: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    onInteract();
    if (userVote === dir) {
      setVotes((v) => v - dir);
      setUserVote(0);
    } else {
      setVotes((v) => v - userVote + dir);
      setUserVote(dir);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/8 px-3 py-2.5">
      {/* Vote buttons */}
      <div className="flex flex-col items-center gap-0.5">
        <button
          onClick={(e) => handleVote(1, e)}
          className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors active:scale-90"
          style={{ background: userVote === 1 ? "rgba(34,197,94,0.2)" : "transparent" }}
        >
          <ChevronUp
            size={16}
            strokeWidth={2.5}
            style={{ color: userVote === 1 ? "#22c55e" : "rgba(255,255,255,0.35)" }}
          />
        </button>
        <span
          className="text-[13px] font-bold tabular-nums"
          style={{ color: userVote === 1 ? "#22c55e" : userVote === -1 ? "#ef4444" : "rgba(255,255,255,0.7)" }}
        >
          {votes}
        </span>
        <button
          onClick={(e) => handleVote(-1, e)}
          className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors active:scale-90"
          style={{ background: userVote === -1 ? "rgba(239,68,68,0.2)" : "transparent" }}
        >
          <ChevronDown
            size={16}
            strokeWidth={2.5}
            style={{ color: userVote === -1 ? "#ef4444" : "rgba(255,255,255,0.35)" }}
          />
        </button>
      </div>
      {/* Feature info */}
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold text-white">{name}</div>
        <div className="text-[12px] text-white/40">{desc}</div>
      </div>
    </div>
  );
}

function FeedbackInput({
  placeholder,
  onInteract,
}: {
  placeholder: string;
  onInteract: () => void;
}) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value.trim()) {
      setSubmitted(true);
      setValue("");
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 px-5 py-3"
      >
        <div className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="text-[14px] font-medium text-emerald-400">Thanks! We&apos;ll review this.</span>
      </motion.div>
    );
  }

  return (
    <div
      className="flex items-end gap-2 rounded-2xl bg-white/8 p-2"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={onInteract}
        placeholder={placeholder}
        rows={2}
        className="flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] leading-relaxed text-white outline-none placeholder:text-white/30"
        style={{ scrollbarWidth: "none" }}
      />
      <button
        onClick={handleSubmit}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-colors active:scale-90"
        style={{
          background: value.trim() ? "rgba(124,90,245,0.8)" : "rgba(255,255,255,0.1)",
        }}
      >
        <Send
          size={14}
          strokeWidth={2}
          style={{ color: value.trim() ? "#fff" : "rgba(255,255,255,0.3)" }}
        />
      </button>
    </div>
  );
}

function ViewAllButton({ onNavigate }: { onNavigate: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onNavigate();
      }}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 text-[14px] font-semibold text-white/80 transition-colors active:bg-white/15"
    >
      <ExternalLink size={14} strokeWidth={2} />
      View full details
    </button>
  );
}

// ─── Story data ──────────────────────────────────────────────────────

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  timestamp: string;
  renderContent: (ctx: { onInteract: () => void; onNavigate: () => void }) => React.ReactNode;
}

const stories: Story[] = [
  // ── 1. Why Aspora ──────────────────────────────────────────────────
  {
    id: "why-aspora",
    title: "Aspora",
    subtitle: "Our story",
    icon: <Heart size={18} />,
    gradient: "from-[#1a1a2e] to-[#16213e]",
    timestamp: "Today",
    renderContent: ({ onNavigate }) => (
      <div className="flex flex-col items-center gap-6 px-2 text-center">
        <AsporaLogo size={56} className="text-white/80" />
        <div className="text-[34px] font-bold leading-tight tracking-tight text-white">
          We&apos;re not building <span className="italic text-amber-400">for</span> you.
          <br />
          We&apos;re building <span className="italic text-amber-400">with</span> you.
        </div>
        <div className="h-px w-16 bg-white/20" />
        <p className="text-[15px] leading-relaxed text-white/55">
          Aspora is a new kind of wealth platform — designed by power users, for power users.
          We&apos;re early. We&apos;re imperfect. And that&apos;s the point.
        </p>
        <div className="rounded-2xl bg-white/8 px-5 py-3">
          <p className="text-[14px] font-medium text-white/45">
            Every feature ships because someone like you asked for it.
          </p>
        </div>
        <ViewAllButton onNavigate={onNavigate} />
      </div>
    ),
  },

  // ── 2. What's Live ─────────────────────────────────────────────────
  {
    id: "whats-live",
    title: "Aspora",
    subtitle: "What's live",
    icon: <Rocket size={18} />,
    gradient: "from-emerald-900 to-emerald-950",
    timestamp: "Today",
    renderContent: ({ onNavigate }) => (
      <div className="flex flex-col gap-2.5 px-1">
        <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-emerald-400/80">
          Shipped & ready
        </p>
        {[
          { name: "US Stock Trading", detail: "500+ stocks, real-time quotes" },
          { name: "Watchlists", detail: "Custom sections, swipe actions, sort" },
          { name: "Smart Search", detail: "Stocks, ETFs, options, indices" },
          { name: "Market Overview", detail: "US, Global, sectors, earnings" },
          { name: "AI Assistant", detail: "ARIA — context-aware market chat" },
          { name: "Stock Deep Dives", detail: "Charts, metrics, events, revenue" },
        ].map((feat) => (
          <div key={feat.name} className="flex items-start gap-3 rounded-2xl bg-white/8 px-5 py-2.5">
            <div className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-white">{feat.name}</div>
              <div className="text-[12px] text-white/40">{feat.detail}</div>
            </div>
          </div>
        ))}
        <ViewAllButton onNavigate={onNavigate} />
      </div>
    ),
  },

  // ── 3. Work in Progress ────────────────────────────────────────────
  {
    id: "wip",
    title: "Aspora",
    subtitle: "In the workshop",
    icon: <Wrench size={18} />,
    gradient: "from-amber-900 to-orange-950",
    timestamp: "Today",
    renderContent: ({ onNavigate }) => (
      <div className="flex flex-col gap-3.5 px-1">
        <p className="mb-0.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-amber-400/80">
          Currently building
        </p>
        {[
          { name: "Options Trading", progress: 75, status: "Beta soon" },
          { name: "Portfolio Analytics", progress: 60, status: "In progress" },
          { name: "Advisory Baskets", progress: 45, status: "In progress" },
          { name: "Price Alerts", progress: 30, status: "Early stage" },
        ].map((feat) => (
          <div key={feat.name} className="rounded-2xl bg-white/8 px-5 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-white">{feat.name}</span>
              <span className="rounded-lg bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                {feat.status}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                style={{ width: `${feat.progress}%` }}
              />
            </div>
          </div>
        ))}
        <p className="text-center text-[12px] text-white/35">
          Shipping fast. Shipping rough. Shipping together.
        </p>
        <ViewAllButton onNavigate={onNavigate} />
      </div>
    ),
  },

  // ── 4. Community Feedback + Text Input ─────────────────────────────
  {
    id: "feedback",
    title: "Aspora",
    subtitle: "We hear you",
    icon: <MessageCircle size={18} />,
    gradient: "from-violet-900 to-purple-950",
    timestamp: "Today",
    renderContent: ({ onInteract, onNavigate }) => (
      <div className="flex flex-col gap-3 px-1">
        <p className="mb-0.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-violet-400/80">
          From our community
        </p>
        {[
          {
            quote: "The watchlist swipe actions feel native. More of this.",
            user: "Power User",
            action: "Expanding gestures across the app",
          },
          {
            quote: "Need better charting. Candlestick + indicators.",
            user: "Day Trader",
            action: "Advanced charts shipping in v2.1",
          },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl bg-white/8 px-5 py-3">
            <p className="text-[14px] font-medium leading-snug text-white/85">
              &ldquo;{item.quote}&rdquo;
            </p>
            <p className="mt-1 text-[11px] font-semibold text-violet-400/60">— {item.user}</p>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-violet-500/10 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <span className="text-[12px] text-white/45">{item.action}</span>
            </div>
          </div>
        ))}

        {/* Open text feedback */}
        <p className="mt-1 text-[13px] font-medium text-white/60">What should we improve?</p>
        <FeedbackInput placeholder="Tell us what you think..." onInteract={onInteract} />
        <ViewAllButton onNavigate={onNavigate} />
      </div>
    ),
  },

  // ── 5. Feature Voting (upvote / downvote) ──────────────────────────
  {
    id: "vote",
    title: "Aspora",
    subtitle: "You decide",
    icon: <Lightbulb size={18} />,
    gradient: "from-cyan-900 to-blue-950",
    timestamp: "Today",
    renderContent: ({ onInteract, onNavigate }) => (
      <div className="flex flex-col gap-2 px-1">
        <p className="text-[18px] font-bold text-white">
          What should we build next?
        </p>
        <p className="mb-2 text-[13px] text-white/45">
          Upvote or downvote. Top picks ship first.
        </p>
        {[
          { name: "Social Trading", desc: "Follow & copy top traders", votes: 342 },
          { name: "Fractional Shares", desc: "Buy any stock from 1", votes: 289 },
          { name: "Paper Trading", desc: "Practice with virtual money", votes: 256 },
          { name: "Sector Heatmaps", desc: "Visual market overview", votes: 198 },
        ].map((feat) => (
          <VoteRow
            key={feat.name}
            name={feat.name}
            desc={feat.desc}
            initialVotes={feat.votes}
            onInteract={onInteract}
          />
        ))}

        {/* Suggest your own */}
        <p className="mt-1.5 text-[13px] font-medium text-white/60">Have a different idea?</p>
        <FeedbackInput placeholder="Suggest a feature..." onInteract={onInteract} />
        <ViewAllButton onNavigate={onNavigate} />
      </div>
    ),
  },

  // ── 6. The Road Ahead ──────────────────────────────────────────────
  {
    id: "roadmap",
    title: "Aspora",
    subtitle: "The road ahead",
    icon: <Map size={18} />,
    gradient: "from-[#0f172a] to-[#1e1b4b]",
    timestamp: "Today",
    renderContent: ({ onNavigate }) => (
      <div className="flex flex-col gap-4 px-1">
        <div className="relative ml-3 border-l-2 border-white/15 pl-5">
          {[
            { quarter: "Now", items: ["Options beta", "Portfolio analytics"], active: true },
            { quarter: "Q2 2026", items: ["Social trading", "Advanced charting", "Price alerts"], active: false },
            { quarter: "Q3 2026", items: ["Fractional shares", "IPO subscriptions"], active: false },
            { quarter: "Beyond", items: ["API for power users", "Community strategies"], active: false },
          ].map((phase, i) => (
            <div key={phase.quarter} className={`relative pb-5 ${i === 3 ? "pb-0" : ""}`}>
              <div
                className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2"
                style={{
                  borderColor: phase.active ? "#818cf8" : "rgba(255,255,255,0.2)",
                  background: phase.active ? "#818cf8" : "transparent",
                }}
              />
              <div
                className="text-[13px] font-bold uppercase tracking-[0.08em]"
                style={{ color: phase.active ? "#818cf8" : "rgba(255,255,255,0.4)" }}
              >
                {phase.quarter}
              </div>
              <div className="mt-1.5 space-y-1">
                {phase.items.map((item) => (
                  <div key={item} className="text-[14px] text-white/65">{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white/8 px-5 py-4 text-center">
          <AsporaLogo size={36} className="mx-auto mb-2 text-white/60" />
          <p className="text-[16px] font-bold leading-snug text-white">
            Building Aspora Wealth.
            <br />
            <span className="text-white/45">Together.</span>
          </p>
        </div>
        <ViewAllButton onNavigate={onNavigate} />
      </div>
    ),
  },
];

// ─── Story Ring SVG ──────────────────────────────────────────────────

interface StoryRingProps {
  totalStories: number;
  readCount: number;
  size?: number;
  children: React.ReactNode;
  onClick?: () => void;
}

export function StoryRing({ totalStories, readCount, size = 42, children, onClick }: StoryRingProps) {
  const strokeWidth = 2;
  const gapDeg = 12; // degrees of gap between each dash
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const segmentDeg = (360 - gapDeg * totalStories) / totalStories;

  const segments = Array.from({ length: totalStories }, (_, i) => {
    const startDeg = i * (segmentDeg + gapDeg) - 90;
    const segLen = (segmentDeg / 360) * circumference;
    const offset = ((startDeg + 90) / 360) * circumference;
    const isRead = i < readCount;
    return { segLen, offset, isRead, index: i };
  });

  return (
    <button
      onClick={onClick}
      className="relative flex shrink-0 items-center justify-center transition-transform active:scale-95"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        {segments.map((seg) => (
          <circle
            key={seg.index}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={seg.isRead ? "hsl(var(--muted-foreground) / 0.25)" : "hsl(var(--foreground))"}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={`${seg.segLen} ${circumference - seg.segLen}`}
            strokeDashoffset={-seg.offset}
            className="transition-all duration-300"
          />
        ))}
      </svg>
      <div className="relative z-10 overflow-hidden rounded-full" style={{ width: size - 8, height: size - 8 }}>
        {children}
      </div>
    </button>
  );
}

// ─── Stories Viewer (full-screen) ────────────────────────────────────

const STORY_DURATION = 8000; // 8s — more reading + interaction time

interface StoriesViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  onStorySeen?: (index: number) => void;
}

export function StoriesViewer({ isOpen, onClose, initialIndex = 0, onStorySeen }: StoriesViewerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const story = stories[currentIndex];

  const pauseTimer = useCallback(() => {
    setPaused(true);
    elapsedRef.current += Date.now() - startTimeRef.current;
  }, []);

  const resumeTimer = useCallback(() => {
    setPaused(false);
  }, []);

  // When user interacts with vote/input, pause auto-advance for a while
  const handleInteract = useCallback(() => {
    pauseTimer();
    // Resume after 4s of no further interaction
    const id = setTimeout(resumeTimer, 4000);
    return () => clearTimeout(id);
  }, [pauseTimer, resumeTimer]);

  const handleNavigate = useCallback(() => {
    onClose();
    router.push("/community");
  }, [onClose, router]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(initialIndex);
    setProgress(0);
    elapsedRef.current = 0;
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (isOpen) onStorySeen?.(currentIndex);
  }, [isOpen, currentIndex, onStorySeen]);

  useEffect(() => {
    if (!isOpen || paused) return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = elapsedRef.current + (Date.now() - startTimeRef.current);
      const p = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(p);
      if (p >= 1) {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setProgress(0);
          elapsedRef.current = 0;
          startTimeRef.current = Date.now();
        } else {
          onClose();
        }
      }
    }, 30);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isOpen, currentIndex, paused, onClose]);

  useEffect(() => {
    setProgress(0);
    elapsedRef.current = 0;
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      elapsedRef.current = 0;
    } else {
      onClose();
    }
  }, [currentIndex, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
    setProgress(0);
    elapsedRef.current = 0;
  }, [currentIndex]);

  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Don't navigate if the click target is an interactive element
      const target = e.target as HTMLElement;
      if (target.closest("button, textarea, input, a, [role=button]")) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const xPos = e.clientX - rect.left;
      if (xPos < rect.width * 0.35) goPrev();
      else goNext();
    },
    [goNext, goPrev]
  );

  // ─── Swipe gesture handlers ────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    pauseTimer();
  }, [pauseTimer]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    resumeTimer();
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Only register horizontal swipes (not vertical scroll)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40 && dt < 500) {
      if (dx < 0) goNext();  // swipe left → next
      else goPrev();          // swipe right → prev
    }
  }, [resumeTimer, goNext, goPrev]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="relative h-full w-full max-w-[430px] overflow-hidden"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-b ${story.gradient}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

            {/* Progress bars */}
            <div className="absolute left-0 right-0 top-0 z-30 flex gap-1 px-3 pt-3">
              {stories.map((_, i) => (
                <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{
                      width: i < currentIndex ? "100%" : i === currentIndex ? `${progress * 100}%` : "0%",
                      transition: "width 0.05s linear",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-5 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                  <AsporaLogo size={20} className="text-black" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-white">{story.title}</div>
                  <div className="text-[12px] text-white/50">{story.timestamp}</div>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="relative z-40 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Story content — handles tap & swipe */}
            <div
              className="relative z-20 flex h-full flex-col overflow-y-auto px-5 pb-14 pt-[88px]"
              style={{ scrollbarWidth: "none" }}
              onClick={handleTap}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Spacer pushes content to center for short stories */}
              <div className="flex-1 min-h-4" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white">
                      {story.icon}
                    </div>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">{story.subtitle}</span>
                  </div>
                  {story.renderContent({ onInteract: handleInteract, onNavigate: handleNavigate })}
                </motion.div>
              </AnimatePresence>
              <div className="flex-1 min-h-4" />
            </div>

            {/* Bottom counter */}
            <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center">
              <div className="text-[11px] text-white/25">
                {currentIndex + 1} / {stories.length}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Exports ─────────────────────────────────────────────────────────

export { AsporaLogo };
export const TOTAL_STORIES = stories.length;
