"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Sparkles, MessageCircle, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

/* ══════════════════════════════════════════════════════════════════════ */
/*  CONCEPT A — "The Fold"                                              */
/*  Editorial disruption. Magazine-feel. Type-first. Generous space.     */
/* ══════════════════════════════════════════════════════════════════════ */

function ConceptA() {
  return (
    <div className="relative mt-4">
      {/* Subtle warm wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.03] to-transparent rounded-t-[32px]" />

      <div className="relative px-6 pt-12 pb-10">
        {/* Large editorial headline — centered */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[28px] font-bold text-foreground leading-[1.15] tracking-tight text-center"
        >
          We answer to you
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-[15px] text-muted-foreground mt-3 leading-relaxed text-center"
        >
          Built around how you invest.<br />Tell us how to make it better.
        </motion.p>

        {/* Three large tappable blocks */}
        <div className="mt-8 space-y-3">
          {[
            { title: "Vote on what we build", sub: "1,247 votes this week", accent: true },
            { title: "Share your feedback", sub: "What works, what doesn\u2019t" },
            { title: "Join a research session", sub: "Help us understand you better" },
          ].map((item, i) => (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i + 0.3, duration: 0.4 }}
              className="flex w-full items-center justify-between rounded-2xl bg-background border border-border/50 px-5 py-4 text-left active:scale-[0.98] transition-transform"
            >
              <div>
                <p className={cn("text-[16px] font-semibold", item.accent ? "text-foreground" : "text-foreground/80")}>{item.title}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground/30" />
            </motion.button>
          ))}
        </div>

        {/* Divider — a thin decorative line */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-[11px] font-medium text-muted-foreground/30 uppercase tracking-[0.2em]">Need a human?</span>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {/* Contact — horizontal icons with labels + TAT */}
        <div className="flex items-center justify-around">
          {[
            { icon: MessageCircle, label: "Chat", tat: "Instant" },
            { icon: Phone, label: "Schedule a Call", tat: "Pick a time" },
            { icon: Mail, label: "Write to CEO", tat: "Usually 48h" },
          ].map((item) => (
            <button key={item.label} className="flex flex-col items-center gap-2 active:scale-95 transition-transform flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <item.icon size={20} strokeWidth={1.8} className="text-foreground" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-foreground leading-tight">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.tat}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Trust — same size as operational */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gain" />
            <span className="text-[12px] text-muted-foreground/40">All systems operational</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground/40">
            <span>SIPC insured</span>
            <span>·</span>
            <span>Segregated accounts</span>
            <span>·</span>
            <span>Alpaca Securities</span>
            <span>·</span>
            <span>256-bit encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  CONCEPT B — "The Signal"                                            */
/*  One living, breathing card. Cycles through states.                   */
/* ══════════════════════════════════════════════════════════════════════ */

const signalStates = [
  {
    eyebrow: "Co-create",
    headline: "Dark mode charts",
    detail: "312 votes and climbing",
    cta: "Cast your vote",
    gradient: "from-violet-500/8 via-transparent to-indigo-500/5",
  },
  {
    eyebrow: "Talk to us",
    headline: "~2 min reply time",
    detail: "Support is online right now",
    cta: "Start a chat",
    gradient: "from-emerald-500/8 via-transparent to-teal-500/5",
  },
  {
    eyebrow: "Your money",
    headline: "Protected & encrypted",
    detail: "SIPC insured, segregated accounts",
    cta: "See how it works",
    gradient: "from-amber-500/8 via-transparent to-orange-500/5",
  },
];

function ConceptB() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % signalStates.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const s = signalStates[idx];

  return (
    <div className="px-5 py-6">
      <button
        onClick={() => setIdx((i) => (i + 1) % signalStates.length)}
        className="relative w-full overflow-hidden rounded-3xl p-6 text-left active:scale-[0.99] transition-transform"
        style={{ minHeight: 180 }}
      >
        {/* Animated background */}
        <AnimatePresence mode="sync">
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={cn("absolute inset-0 bg-gradient-to-br", s.gradient)}
          />
        </AnimatePresence>

        {/* Rotating border glow */}
        <div className="absolute inset-0 rounded-3xl border border-border/40" />
        <motion.div
          className="absolute inset-[-1px] rounded-3xl pointer-events-none"
          style={{
            background: "conic-gradient(from 0deg, transparent 70%, hsl(var(--foreground) / 0.1) 80%, transparent 90%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Content */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 mb-3">{s.eyebrow}</p>
              <h3 className="text-[22px] font-bold text-foreground leading-tight mb-1">{s.headline}</h3>
              <p className="text-[14px] text-muted-foreground mb-5">{s.detail}</p>
              <span className="text-[14px] font-semibold text-foreground">{s.cta} →</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="absolute bottom-5 right-6 flex items-center gap-1.5">
          {signalStates.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === idx ? "w-5 bg-foreground/60" : "w-1.5 bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  CONCEPT C — "The Handshake"                                         */
/*  Reciprocal. Two zones. Voting is tangible. Trust is ambient.         */
/* ══════════════════════════════════════════════════════════════════════ */

const voteFeatures = [
  { label: "Dark mode charts", votes: 312 },
  { label: "Fractional options", votes: 287 },
  { label: "Social portfolios", votes: 241 },
];

function ConceptC() {
  return (
    <div className="mt-4">
      {/* Zone 1 — Your voice */}
      <div className="relative -mx-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.04] to-foreground/[0.01]" />
        <div className="relative px-6 pt-8 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">Your voice</p>
          <h3 className="text-[20px] font-bold text-foreground mb-5">What should we build next?</h3>

          {/* Vote cards — stacked, tappable */}
          <div className="space-y-2">
            {voteFeatures.map((f, i) => (
              <motion.button
                key={f.label}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="flex w-full items-center justify-between rounded-xl bg-background/80 backdrop-blur-sm border border-border/30 px-4 py-3 active:scale-[0.98] transition-transform"
              >
                <span className="text-[15px] font-medium text-foreground">{f.label}</span>
                <span className="text-[13px] font-bold text-muted-foreground tabular-nums">{f.votes}</span>
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 text-[14px]">
            <button className="font-medium text-muted-foreground active:text-foreground transition-colors">Feedback</button>
            <span className="text-border/60">·</span>
            <button className="font-medium text-muted-foreground active:text-foreground transition-colors">Research</button>
          </div>
        </div>
      </div>

      {/* Zone 2 — We&apos;re here */}
      <div className="px-6 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40 mb-4">We&apos;re here</p>
        <div className="flex gap-3">
          {[
            { icon: MessageCircle, label: "Chat", sub: "Instant" },
            { icon: Phone, label: "Call", sub: "Mon–Fri" },
            { icon: Mail, label: "CEO", sub: "48h reply" },
          ].map((item) => (
            <button key={item.label} className="flex-1 flex flex-col items-center gap-2 rounded-2xl border border-border/40 py-4 active:scale-[0.97] transition-transform">
              <item.icon size={22} strokeWidth={1.6} className="text-foreground" />
              <div className="text-center">
                <p className="text-[14px] font-semibold text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trust marquee */}
      <div className="-mx-5 overflow-hidden py-3">
        <motion.div
          className="flex whitespace-nowrap gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex items-center gap-8 text-[11px] text-muted-foreground/25 font-medium tracking-wide">
              <span>SIPC INSURED</span>
              <span>SEGREGATED ACCOUNTS</span>
              <span>ALPACA SECURITIES</span>
              <span>256-BIT ENCRYPTION</span>
              <span className="flex items-center gap-1.5">ALL SYSTEMS GO <span className="h-1.5 w-1.5 rounded-full bg-gain" /></span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  CONCEPT D — "The Whisper"                                           */
/*  Radical minimalism. Negative space IS the design.                    */
/* ══════════════════════════════════════════════════════════════════════ */

function ConceptD() {
  return (
    <div className="flex flex-col items-center px-6 pt-20 pb-12">
      {/* One deliberate mark */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-8 h-[2px] bg-foreground/20 mb-10 origin-left"
      />

      {/* Actions — stacked, centered, breathing room */}
      <div className="flex flex-col items-center gap-6">
        <button className="text-[16px] font-semibold text-foreground active:opacity-60 transition-opacity">
          Vote on what we build →
        </button>
        <button className="text-[15px] font-medium text-muted-foreground active:text-foreground transition-colors">
          Share feedback
        </button>
        <button className="text-[15px] font-medium text-muted-foreground active:text-foreground transition-colors">
          Join research
        </button>
      </div>

      <div className="w-px h-8 bg-border/30 my-6" />

      <div className="flex items-center gap-5 text-[15px] font-medium text-muted-foreground">
        <button className="active:text-foreground transition-colors">Chat</button>
        <button className="active:text-foreground transition-colors">Call</button>
        <button className="active:text-foreground transition-colors">CEO</button>
      </div>

      <div className="w-px h-8 bg-border/30 my-6" />

      <div className="flex items-center gap-1.5 mb-1">
        <span className="h-1.5 w-1.5 rounded-full bg-gain" />
        <span className="text-[12px] text-muted-foreground/30">Operational</span>
      </div>
      <p className="text-[11px] text-muted-foreground/20 text-center">
        SIPC insured · Segregated · Encrypted
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  CONCEPT E — "The Campfire"                                          */
/*  Community warmth. User voice leads. Social proof.                    */
/* ══════════════════════════════════════════════════════════════════════ */

const userQuotes = [
  { text: "I switched from Robinhood because Aspora actually explains things.", initials: "AK" },
  { text: "First app where I understood what P/E ratio means.", initials: "SR" },
  { text: "The collections feature saved me hours of research.", initials: "JM" },
];

function ConceptE() {
  const [qi, setQi] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setQi((i) => (i + 1) % userQuotes.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const q = userQuotes[qi];

  return (
    <div className="mt-4">
      {/* Quote card */}
      <div className="mx-5 rounded-3xl bg-foreground/[0.03] border border-border/30 px-6 py-8">
        <div className="flex items-center gap-3 mb-5">
          <Sparkles size={14} className="text-muted-foreground/40" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40">From the community</span>
        </div>

        <div className="min-h-[80px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={qi}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[18px] font-light text-foreground leading-[1.6] italic">
                &ldquo;{q.text}&rdquo;
              </p>
              <div className="flex items-center gap-2.5 mt-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                  {q.initials}
                </div>
                <span className="text-[12px] text-muted-foreground/50">Aspora member</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex gap-1.5 mt-5">
          {userQuotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setQi(i)}
              className={cn("h-1 rounded-full transition-all duration-300", i === qi ? "w-4 bg-foreground/40" : "w-1 bg-muted-foreground/15")}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-[14px] font-semibold text-foreground mb-3">Join them</p>
        <div className="flex gap-2">
          {["Vote", "Feedback", "Research"].map((label) => (
            <button key={label} className="flex-1 rounded-xl bg-muted py-2.5 text-[14px] font-medium text-foreground text-center active:scale-[0.97] transition-transform">
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact + trust */}
      <div className="px-6 pt-5 pb-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[13px] text-muted-foreground">We&apos;re here when you need us</p>
        </div>
        <div className="flex gap-3">
          {[
            { icon: MessageCircle, label: "Chat" },
            { icon: Phone, label: "Call" },
            { icon: Mail, label: "CEO" },
          ].map((item) => (
            <button key={item.label} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border/40 py-3 active:bg-muted/50 transition-colors">
              <item.icon size={16} strokeWidth={1.8} className="text-muted-foreground" />
              <span className="text-[14px] font-medium text-foreground">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-6">
          <span className="h-1.5 w-1.5 rounded-full bg-gain" />
          <span className="text-[11px] text-muted-foreground/25">SIPC insured · Segregated · All systems go</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  Page                                                                */
/* ══════════════════════════════════════════════════════════════════════ */

const concepts = [
  { id: "a", name: "A — The Fold", component: ConceptA },
  { id: "b", name: "B — The Signal", component: ConceptB },
  { id: "c", name: "C — The Handshake", component: ConceptC },
  { id: "d", name: "D — The Whisper", component: ConceptD },
  { id: "e", name: "E — The Campfire", component: ConceptE },
];

export default function FooterExplore() {
  const [active, setActive] = useState(0);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors">
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">Explore Footer</h1>
          <p className="text-[13px] text-muted-foreground">5 creative concepts</p>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar border-b border-border/40">
        <div className="flex gap-0 px-5">
          {concepts.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                active === i ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              {c.id.toUpperCase()}
              {active === i && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <p className="px-5 pt-5 text-[13px] text-muted-foreground mb-0">{concepts[active].name}</p>
        {(() => { const Comp = concepts[active].component; return <Comp />; })()}
      </div>

      <HomeIndicator />
    </div>
  );
}
