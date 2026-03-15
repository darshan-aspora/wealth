"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Rocket,
  Wrench,
  MessageCircle,
  Lightbulb,
  Map,
  ChevronUp,
  ChevronDown,
  Send,
  Check,
  Users,
  Calendar,
  Mail,
  HelpCircle,
} from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { AsporaLogo } from "@/components/stories-viewer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// ─── Tab config ──────────────────────────────────────────────────────

const TABS = [
  { id: "live", label: "What's Live", icon: <Rocket size={13} strokeWidth={2} /> },
  { id: "workshop", label: "Workshop", icon: <Wrench size={13} strokeWidth={2} /> },
  { id: "feedback", label: "Feedback", icon: <MessageCircle size={13} strokeWidth={2} /> },
  { id: "vote", label: "Vote", icon: <Lightbulb size={13} strokeWidth={2} /> },
  { id: "roadmap", label: "Roadmap", icon: <Map size={13} strokeWidth={2} /> },
  { id: "research", label: "Research", icon: <Users size={13} strokeWidth={2} /> },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Reusable sub-components ─────────────────────────────────────────

function VoteRow({
  name,
  desc,
  initialVotes,
}: {
  name: string;
  desc: string;
  initialVotes: number;
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);

  const handleVote = (dir: 1 | -1) => {
    if (userVote === dir) {
      setVotes((v) => v - dir);
      setUserVote(0);
    } else {
      setVotes((v) => v - userVote + dir);
      setUserVote(dir);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-secondary/50 px-5 py-3">
      <div className="flex flex-col items-center gap-0.5">
        <button
          onClick={() => handleVote(1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-all active:scale-90"
          style={{ background: userVote === 1 ? "hsl(var(--gain) / 0.15)" : "transparent" }}
        >
          <ChevronUp
            size={18}
            strokeWidth={2.5}
            style={{ color: userVote === 1 ? "hsl(var(--gain))" : "hsl(var(--muted-foreground) / 0.4)" }}
          />
        </button>
        <span
          className="text-[14px] font-bold tabular-nums"
          style={{
            color:
              userVote === 1
                ? "hsl(var(--gain))"
                : userVote === -1
                ? "hsl(var(--loss))"
                : "hsl(var(--foreground))",
          }}
        >
          {votes}
        </span>
        <button
          onClick={() => handleVote(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-all active:scale-90"
          style={{ background: userVote === -1 ? "hsl(var(--loss) / 0.15)" : "transparent" }}
        >
          <ChevronDown
            size={18}
            strokeWidth={2.5}
            style={{ color: userVote === -1 ? "hsl(var(--loss))" : "hsl(var(--muted-foreground) / 0.4)" }}
          />
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold text-foreground">{name}</div>
        <div className="text-[13px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function FeedbackBox({ placeholder }: { placeholder: string }) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 rounded-2xl px-5 py-3"
        style={{ background: "hsl(var(--gain) / 0.08)", border: "1px solid hsl(var(--gain) / 0.15)" }}
      >
        <Check size={16} style={{ color: "hsl(var(--gain))" }} strokeWidth={2} />
        <span className="text-[14px] font-medium" style={{ color: "hsl(var(--gain))" }}>
          Thanks! We&apos;ll review your feedback.
        </span>
      </motion.div>
    );
  }

  return (
    <div
      className="flex items-end gap-2 rounded-2xl p-2.5"
      style={{ background: "hsl(var(--secondary) / 0.5)", border: "1px solid hsl(var(--border) / 0.5)" }}
    >
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
        style={{ scrollbarWidth: "none" }}
      />
      <button
        onClick={() => { if (value.trim()) setSubmitted(true); }}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors active:scale-90"
        style={{
          background: value.trim() ? "#7c5af5" : "hsl(var(--secondary))",
        }}
      >
        <Send size={15} strokeWidth={2} style={{ color: value.trim() ? "#fff" : "hsl(var(--muted-foreground) / 0.4)" }} />
      </button>
    </div>
  );
}

function SectionTitle({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-xl"
        style={{ background: `${color}15` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <h2 className="text-[18px] font-bold text-foreground">{label}</h2>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>("live");
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Section refs
  const sectionRefs = useRef<Record<TabId, HTMLElement | null>>({
    live: null,
    workshop: null,
    feedback: null,
    vote: null,
    roadmap: null,
    research: null,
  });

  // Scroll to section on tab tap
  const scrollToSection = useCallback((id: TabId) => {
    const el = sectionRefs.current[id];
    const container = scrollRef.current;
    if (!el || !container) return;

    // Account for sticky tab bar height (~48px)
    const tabBarHeight = 52;
    const offset = el.offsetTop - tabBarHeight;
    container.scrollTo({ top: offset, behavior: "smooth" });
    setActiveTab(id);
  }, []);

  // IntersectionObserver to highlight active tab on scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("data-section") as TabId;
          if (id) setActiveTab(id);
        }
      },
      {
        root: container,
        rootMargin: "-56px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Scroll active tab into view in tab bar
  useEffect(() => {
    const tabBar = tabBarRef.current;
    if (!tabBar) return;
    const activeEl = tabBar.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col bg-background">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/30 px-5 pb-3 pt-2">
        <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground" onClick={() => router.back()}>
          <ArrowLeft size={20} strokeWidth={1.8} />
        </Button>
        <div className="flex items-center gap-2">
          <AsporaLogo size={28} className="text-foreground" />
          <span className="text-[17px] font-bold text-foreground">Build With Us</span>
        </div>
      </div>

      {/* Sticky anchor tab bar */}
      <div
        ref={tabBarRef}
        className="flex gap-1 overflow-x-auto border-b border-border/20 bg-background px-3 py-2"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => scrollToSection(tab.id)}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all active:scale-95"
            style={{
              background: activeTab === tab.id ? "hsl(var(--foreground) / 0.08)" : "transparent",
              color: activeTab === tab.id ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground) / 0.55)",
              border: activeTab === tab.id ? "1px solid hsl(var(--border) / 0.5)" : "1px solid transparent",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="px-5 py-5 space-y-8">

          {/* ── Hero ──────────────────────────────────────────── */}
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #7c5af5 0%, #5b3fd4 100%)",
                boxShadow: "0 4px 20px rgba(124,90,245,0.3)",
              }}
            >
              <AsporaLogo size={32} className="text-white" />
            </div>
            <h1 className="text-[24px] font-bold text-foreground">
              We&apos;re building Aspora <span className="text-muted-foreground">with you.</span>
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              Every feature exists because a user asked for it.
              This is your space to shape what Aspora becomes.
            </p>
          </motion.div>

          {/* ── What's Live ───────────────────────────────────── */}
          <section
            ref={(el) => { sectionRefs.current.live = el; }}
            data-section="live"
          >
            <SectionTitle icon={<Rocket size={16} strokeWidth={1.8} />} label="What's Live" color="#22c55e" />
            <div className="space-y-2">
              {[
                { name: "US Stock Trading", detail: "500+ stocks, real-time quotes, instant execution" },
                { name: "Watchlists", detail: "Custom sections, swipe actions, sort by 5 criteria, flag & alert" },
                { name: "Smart Search", detail: "Stocks, ETFs, options, indices — rotating placeholder with instant results" },
                { name: "Market Overview", detail: "US markets, global indices, commodities, currencies, economic indicators, earnings calendar" },
                { name: "AI Assistant (ARIA)", detail: "Context-aware market chat, page-specific suggestions, streaming responses" },
                { name: "Stock Deep Dives", detail: "TradingView charts, key metrics, events, revenue breakdown, analyst targets" },
                { name: "Explore & FTUX", detail: "Onboarding flow, product showcase, feature deep-dives" },
                { name: "Portfolio Tracking", detail: "Holdings overview, P&L, sector allocation" },
              ].map((feat) => (
                <div key={feat.name} className="flex items-start gap-3 rounded-2xl bg-secondary/40 px-5 py-3">
                  <div className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "hsl(var(--gain) / 0.15)" }}>
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: "hsl(var(--gain))" }} />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-foreground">{feat.name}</div>
                    <div className="text-[13px] text-muted-foreground">{feat.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Work in Progress ───────────────────────────────── */}
          <section
            ref={(el) => { sectionRefs.current.workshop = el; }}
            data-section="workshop"
          >
            <SectionTitle icon={<Wrench size={16} strokeWidth={1.8} />} label="In the Workshop" color="#f59e0b" />
            <div className="space-y-3">
              {[
                { name: "Options Trading", progress: 75, status: "Beta soon", detail: "Calls & puts on 500+ stocks. Strategy builder, real-time Greeks, P&L visualization." },
                { name: "Portfolio Analytics", progress: 60, status: "In progress", detail: "Sector exposure, risk metrics, correlation analysis, benchmark comparison." },
                { name: "Advisory Baskets", progress: 45, status: "In progress", detail: "Curated stock baskets by theme. Auto-rebalancing, CAGR tracking, one-click invest." },
                { name: "Price Alerts", progress: 30, status: "Early stage", detail: "Custom price triggers, % change alerts, volume spike notifications." },
                { name: "Advanced Charting", progress: 20, status: "Design phase", detail: "Candlestick patterns, 30+ indicators, drawing tools, multi-timeframe." },
                { name: "Recurring Investments", progress: 15, status: "Planning", detail: "Set weekly/monthly auto-invest schedules for any stock or basket." },
              ].map((feat) => (
                <div key={feat.name} className="rounded-2xl bg-secondary/40 px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold text-foreground">{feat.name}</span>
                    <span
                      className="rounded-lg px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: "hsl(42 90% 55% / 0.12)", color: "hsl(42 90% 55%)" }}
                    >
                      {feat.status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] text-muted-foreground">{feat.detail}</p>
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${feat.progress}%`,
                        background: "linear-gradient(90deg, #f59e0b, #f97316)",
                      }}
                    />
                  </div>
                  <div className="mt-1 text-right text-[11px] text-muted-foreground/50">{feat.progress}%</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Community Feedback ─────────────────────────────── */}
          <section
            ref={(el) => { sectionRefs.current.feedback = el; }}
            data-section="feedback"
          >
            <SectionTitle icon={<MessageCircle size={16} strokeWidth={1.8} />} label="Community Feedback" color="#8b5cf6" />
            <div className="space-y-3">
              {[
                { quote: "The watchlist swipe actions feel native. More of this.", user: "Power User", action: "Expanding gestures across the app" },
                { quote: "Need better charting. Candlestick + indicators.", user: "Day Trader", action: "Advanced charts shipping in v2.1" },
                { quote: "Love ARIA but want it to analyse my portfolio directly.", user: "Investor", action: "Portfolio analysis mode in progress" },
                { quote: "The explore page onboarding is slick. More interactive walkthroughs.", user: "New User", action: "Expanding guided tours to other sections" },
                { quote: "Need fractional shares. Can't afford full shares of AMZN/GOOGL.", user: "Student Investor", action: "Fractional shares on the roadmap for Q3" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-secondary/40 px-5 py-3.5">
                  <p className="text-[14px] font-medium leading-snug text-foreground/85">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <p className="mt-1.5 text-[12px] font-semibold" style={{ color: "#8b5cf6" }}>— {item.user}</p>
                  <div className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(139,92,246,0.08)" }}>
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#8b5cf6" }} />
                    <span className="text-[12px] text-muted-foreground">{item.action}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[14px] font-medium text-foreground">What should we improve?</p>
              <FeedbackBox placeholder="Tell us what's working and what's not..." />
            </div>
          </section>

          {/* ── Vote on Features ───────────────────────────────── */}
          <section
            ref={(el) => { sectionRefs.current.vote = el; }}
            data-section="vote"
          >
            <SectionTitle icon={<Lightbulb size={16} strokeWidth={1.8} />} label="Vote on Features" color="#06b6d4" />
            <p className="mb-3 text-[14px] text-muted-foreground">
              Upvote or downvote. Top picks ship first. Your vote directly shapes the roadmap.
            </p>
            <div className="space-y-2">
              {[
                { name: "Social Trading", desc: "Follow & copy top traders' portfolios", votes: 342 },
                { name: "Fractional Shares", desc: "Buy any stock starting from 1", votes: 289 },
                { name: "Paper Trading", desc: "Practice strategies with virtual money", votes: 256 },
                { name: "Sector Heatmaps", desc: "Visual treemap of market sectors", votes: 198 },
                { name: "IPO Subscriptions", desc: "Apply for upcoming IPOs in-app", votes: 167 },
                { name: "Limit Orders", desc: "Set buy/sell triggers at target prices", votes: 145 },
                { name: "Multi-Leg Options", desc: "Spreads, strangles, iron condors", votes: 132 },
                { name: "Crypto Trading", desc: "BTC, ETH, and top-50 by market cap", votes: 118 },
                { name: "Dark Pool Data", desc: "Institutional flow & block trades", votes: 97 },
                { name: "API Access", desc: "Programmatic trading for power users", votes: 84 },
              ].map((feat) => (
                <VoteRow key={feat.name} name={feat.name} desc={feat.desc} initialVotes={feat.votes} />
              ))}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[14px] font-medium text-foreground">Have a different idea?</p>
              <FeedbackBox placeholder="Suggest a feature you'd love to see..." />
            </div>
          </section>

          {/* ── Roadmap ───────────────────────────────────────── */}
          <section
            ref={(el) => { sectionRefs.current.roadmap = el; }}
            data-section="roadmap"
          >
            <SectionTitle icon={<Map size={16} strokeWidth={1.8} />} label="Roadmap" color="#818cf8" />
            <div className="relative ml-3 border-l-2 border-border pl-5">
              {[
                { quarter: "Now", items: [
                  { name: "Options beta", done: false },
                  { name: "Portfolio analytics", done: false },
                  { name: "Community page", done: true },
                ], active: true },
                { quarter: "Q2 2026", items: [
                  { name: "Social trading" },
                  { name: "Advanced charting" },
                  { name: "Price alerts" },
                  { name: "Limit orders" },
                ], active: false },
                { quarter: "Q3 2026", items: [
                  { name: "Fractional shares" },
                  { name: "IPO subscriptions" },
                  { name: "Paper trading" },
                ], active: false },
                { quarter: "Q4 2026", items: [
                  { name: "Multi-leg options" },
                  { name: "Sector heatmaps" },
                  { name: "Recurring investments" },
                ], active: false },
                { quarter: "2027+", items: [
                  { name: "API for power users" },
                  { name: "Community strategies" },
                  { name: "Dark pool data" },
                ], active: false },
              ].map((phase, i) => (
                <div key={phase.quarter} className={`relative pb-6 ${i === 4 ? "pb-0" : ""}`}>
                  <div
                    className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2"
                    style={{
                      borderColor: phase.active ? "#818cf8" : "hsl(var(--border))",
                      background: phase.active ? "#818cf8" : "transparent",
                    }}
                  />
                  <div
                    className="text-[13px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: phase.active ? "#818cf8" : "hsl(var(--muted-foreground) / 0.5)" }}
                  >
                    {phase.quarter}
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {phase.items.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        {"done" in item && item.done ? (
                          <Check size={14} strokeWidth={2.5} style={{ color: "hsl(var(--gain))" }} />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                        )}
                        <span
                          className="text-[14px]"
                          style={{
                            color: "done" in item && item.done ? "hsl(var(--gain))" : "hsl(var(--foreground) / 0.7)",
                            textDecoration: "done" in item && item.done ? "line-through" : "none",
                          }}
                        >
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── User Research ──────────────────────────────────── */}
          <section
            ref={(el) => { sectionRefs.current.research = el; }}
            data-section="research"
          >
            <SectionTitle icon={<Users size={16} strokeWidth={1.8} />} label="User Research" color="#ec4899" />

            {/* Participation card */}
            <div
              className="rounded-2xl px-5 py-5"
              style={{
                background: "linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(139,92,246,0.06) 100%)",
                border: "1px solid hsl(var(--border) / 0.4)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: "rgba(236,72,153,0.12)" }}
                >
                  <Users size={20} strokeWidth={1.8} style={{ color: "#ec4899" }} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-foreground">Join our research program</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                    Help shape Aspora by participating in user interviews, beta tests, and design reviews. Your insights directly drive what we build next.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {[
                  { label: "30-min video calls", detail: "Share your trading workflow & pain points" },
                  { label: "Beta access", detail: "Test new features before anyone else" },
                  { label: "Design reviews", detail: "Give feedback on upcoming screens & flows" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "#ec4899" }} />
                    <div>
                      <span className="text-[14px] font-semibold text-foreground">{item.label}</span>
                      <span className="text-[14px] text-muted-foreground"> — {item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white transition-all active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
                  boxShadow: "0 4px 16px rgba(236,72,153,0.25)",
                }}
              >
                <Calendar size={16} strokeWidth={2} />
                Book a Research Call
              </button>
            </div>

            {/* Questions & Help card */}
            <div
              className="mt-4 rounded-2xl px-5 py-5"
              style={{
                background: "hsl(var(--secondary) / 0.5)",
                border: "1px solid hsl(var(--border) / 0.4)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: "rgba(99,102,241,0.12)" }}
                >
                  <HelpCircle size={20} strokeWidth={1.8} style={{ color: "#6366f1" }} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-foreground">Questions or doubts?</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                    We&apos;re here to help. Reach out directly or schedule a quick call — no bots, real humans from the Aspora team.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2.5">
                <button
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition-all active:scale-[0.98]"
                  style={{
                    background: "hsl(var(--foreground) / 0.06)",
                    border: "1px solid hsl(var(--border) / 0.5)",
                    color: "hsl(var(--foreground))",
                  }}
                >
                  <Mail size={15} strokeWidth={2} />
                  Email Us
                </button>
                <button
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold text-white transition-all active:scale-[0.98]"
                  style={{
                    background: "#6366f1",
                    boxShadow: "0 2px 10px rgba(99,102,241,0.25)",
                  }}
                >
                  <Calendar size={15} strokeWidth={2} />
                  Schedule Call
                </button>
              </div>
            </div>
          </section>

          {/* ── Closing ───────────────────────────────────────── */}
          <section className="pb-6">
            <div className="rounded-2xl bg-secondary/40 px-5 py-5 text-center">
              <AsporaLogo size={40} className="mx-auto mb-3 text-foreground/60" />
              <p className="text-[18px] font-bold text-foreground">
                Building Aspora Wealth.
              </p>
              <p className="text-[18px] font-bold text-muted-foreground">Together.</p>
              <p className="mt-3 text-[13px] text-muted-foreground/60">
                Every vote, every suggestion, every piece of feedback — it all matters.
              </p>
            </div>
          </section>

        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
