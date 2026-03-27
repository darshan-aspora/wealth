"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Sparkles, Users, Rocket, MessageCircle, FlaskConical, Gift, ChevronUp, ChevronDown, Send, ExternalLink } from "lucide-react";
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

export const stories: Story[] = [
  // ── 1. Advisory Baskets ─────────────────────────────────────────────
  {
    id: "baskets",
    title: "Advisory Baskets",
    subtitle: "Curated by experts",
    icon: <Sparkles size={18} />,
    gradient: "from-amber-900 to-orange-950",
    timestamp: "",
    renderContent: ({ onNavigate }) => (
      <div className="flex flex-col items-center gap-8 px-2 text-center">
        <div className="text-[32px] font-bold leading-[1.1] tracking-tight text-white">
          Invest like<br />the <span className="text-amber-400">experts.</span>
        </div>
        <div className="h-px w-12 bg-white/15" />
        <div className="flex items-baseline gap-1">
          <span className="text-[48px] font-bold tracking-tight text-amber-400">18%+</span>
          <span className="text-[15px] text-white/40">avg returns</span>
        </div>
        <p className="text-[15px] leading-relaxed text-white/45">
          4 curated baskets. SEBI-registered advisors.<br />Diversified. Rebalanced. Aligned to you.
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(); }}
          className="rounded-full bg-white/10 px-8 py-3 text-[15px] font-semibold text-white transition-colors active:bg-white/20"
        >
          Explore Baskets
        </button>
      </div>
    ),
  },

  // ── 2. Research Group ───────────────────────────────────────────────
  {
    id: "research",
    title: "Research Group",
    subtitle: "Join the conversation",
    icon: <Users size={18} />,
    gradient: "from-violet-900 to-purple-950",
    timestamp: "",
    renderContent: ({ onNavigate }) => (
      <div className="flex flex-col items-center gap-8 px-2 text-center">
        <div className="text-[32px] font-bold leading-[1.1] tracking-tight text-white">
          2,400+ traders.<br /><span className="text-violet-400">One conversation.</span>
        </div>
        <div className="h-px w-12 bg-white/15" />
        <div className="w-full rounded-2xl bg-white/8 px-5 py-4 text-left">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-[12px] font-semibold text-orange-400/80">Trending now</span>
          </div>
          <p className="mt-2 text-[16px] font-medium leading-snug text-white/85">
            &ldquo;NVDA earnings — what&apos;s your play?&rdquo;
          </p>
          <p className="mt-1 text-[13px] text-white/35">84 replies</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(); }}
          className="rounded-full bg-white/10 px-8 py-3 text-[15px] font-semibold text-white transition-colors active:bg-white/20"
        >
          Join the Group
        </button>
      </div>
    ),
  },

  // ── 3. Options Trading ──────────────────────────────────────────────
  {
    id: "options-launch",
    title: "Options Trading",
    subtitle: "Now live",
    icon: <Rocket size={18} />,
    gradient: "from-emerald-900 to-emerald-950",
    timestamp: "",
    renderContent: () => (
      <div className="flex flex-col items-center gap-8 px-2 text-center">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <div className="absolute h-3 w-3 rounded-full bg-emerald-400 animate-ping opacity-40" />
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[13px] font-semibold text-emerald-400">Live</span>
        </div>
        <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
          Options<br />are <span className="text-emerald-400">here.</span>
        </div>
        <div className="h-px w-12 bg-white/15" />
        <p className="text-[17px] leading-relaxed text-white/50">
          Calls. Puts. Spreads.<br />One clean interface.
        </p>
      </div>
    ),
  },

  // ── 4. Community ────────────────────────────────────────────────────
  {
    id: "community",
    title: "Community",
    subtitle: "Share your ideas",
    icon: <MessageCircle size={18} />,
    gradient: "from-[#1a1a2e] to-[#16213e]",
    timestamp: "",
    renderContent: ({ onInteract }) => (
      <div className="flex flex-col items-center gap-8 px-2 text-center">
        <div className="text-[24px] font-medium italic leading-snug text-white/90">
          &ldquo;The watchlist swipe actions<br />feel native. More of this.&rdquo;
        </div>
        <p className="text-[14px] font-semibold text-blue-400/60">— Power User</p>
        <div className="h-px w-12 bg-white/15" />
        <p className="text-[14px] text-white/40">What should we build next?</p>
        <div className="w-full">
          <FeedbackInput placeholder="Share your take..." onInteract={onInteract} />
        </div>
      </div>
    ),
  },

  // ── 5. What's Next — Pipeline ──────────────────────────────────────
  {
    id: "pipeline",
    title: "What's Next",
    subtitle: "On our roadmap",
    icon: <FlaskConical size={18} />,
    gradient: "from-cyan-900 to-blue-950",
    timestamp: "",
    renderContent: ({ onInteract }) => (
      <div className="flex flex-col gap-5 px-1">
        <div className="text-center text-[28px] font-bold leading-[1.1] tracking-tight text-white">
          You decide<br />what ships <span className="text-cyan-400">next.</span>
        </div>
        <div className="mx-auto h-px w-12 bg-white/15" />
        {[
          { name: "Social Trading", desc: "Follow & copy top traders", votes: 342 },
          { name: "Fractional Shares", desc: "Buy any stock from 1", votes: 289 },
          { name: "Paper Trading", desc: "Practice with virtual money", votes: 256 },
        ].map((feat) => (
          <VoteRow
            key={feat.name}
            name={feat.name}
            desc={feat.desc}
            initialVotes={feat.votes}
            onInteract={onInteract}
          />
        ))}
      </div>
    ),
  },

  // ── 6. Invite Friends ──────────────────────────────────────────────
  {
    id: "referral",
    title: "Invite Friends",
    subtitle: "Earn rewards",
    icon: <Gift size={18} />,
    gradient: "from-[#0f172a] to-[#1e1b4b]",
    timestamp: "",
    renderContent: () => (
      <div className="flex flex-col items-center gap-8 px-2 text-center">
        <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">
          Give 100.<br /><span className="text-indigo-400">Get 100.</span>
        </div>
        <div className="h-px w-12 bg-white/15" />
        <p className="text-[16px] leading-relaxed text-white/45">
          Invite a friend. When they fund their account,<br />you both earn 100 in trading credits.
        </p>
        <div className="rounded-2xl bg-indigo-500/15 px-8 py-4">
          <p className="text-[11px] font-medium uppercase tracking-widest text-indigo-400/60">Your code</p>
          <p className="mt-1 text-[20px] font-bold tracking-wide text-indigo-300">ASPORA-2026</p>
        </div>
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
