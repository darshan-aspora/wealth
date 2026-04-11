"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Shield, MessageCircle, Vote, ChevronRight,
  Mail, Phone, CalendarClock, HelpCircle, FlaskConical, Sparkles,
  Users, Activity, ExternalLink, Lock, Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

/* ══════════════════════════════════════════════════════════════════════ */
/*  APPROACH A — "Two Worlds" (footer section)                          */
/* ══════════════════════════════════════════════════════════════════════ */

function ApproachA() {
  return (
    <div className="space-y-6">
      {/* Separator */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-px bg-border/60" />
        <span className="text-[12px] font-semibold text-muted-foreground/40 uppercase tracking-widest">Aspora</span>
        <div className="flex-1 h-px bg-border/60" />
      </div>

      {/* Your Money is Safe */}
      <div>
        <h3 className="text-[17px] font-bold text-foreground mb-3">Your Money is Safe</h3>
        <div className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">
          <button className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-muted/50 transition-colors">
            <Shield size={20} strokeWidth={1.8} className="shrink-0 text-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground">How your money is protected</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">SIPC insured, segregated accounts, Alpaca brokerage</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-muted-foreground/40" />
          </button>
          <button className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-muted/50 transition-colors">
            <Landmark size={20} strokeWidth={1.8} className="shrink-0 text-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground">Transparent pricing</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">Every fee, explained. No surprises</p>
            </div>
            <ExternalLink size={14} className="shrink-0 text-muted-foreground/40" />
          </button>
          <button className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-muted/50 transition-colors">
            <Activity size={20} strokeWidth={1.8} className="shrink-0 text-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground">System status</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">All systems operational</p>
            </div>
            <span className="shrink-0 h-2 w-2 rounded-full bg-gain" />
          </button>
        </div>
      </div>

      {/* Talk to Us */}
      <div>
        <h3 className="text-[17px] font-bold text-foreground mb-3">Talk to Us</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: MessageCircle, label: "Chat with Support", sub: "Instant" },
            { icon: Mail, label: "Write to Varun", sub: "CEO, usually 48h" },
            { icon: CalendarClock, label: "Schedule a Call", sub: "Pick a time" },
            { icon: HelpCircle, label: "Help Center", sub: "Search answers" },
          ].map((item) => (
            <button key={item.label} className="flex flex-col items-start rounded-2xl border border-border/60 p-4 text-left active:scale-[0.98] transition-transform">
              <item.icon size={20} strokeWidth={1.8} className="text-foreground mb-2.5" />
              <p className="text-[14px] font-semibold text-foreground">{item.label}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{item.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Shape Aspora */}
      <div>
        <h3 className="text-[17px] font-bold text-foreground mb-3">Shape Aspora</h3>
        <div className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">
          <button className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-muted/50 transition-colors">
            <Vote size={20} strokeWidth={1.8} className="shrink-0 text-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground">Vote on features</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">3 features are neck and neck. Your vote decides</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-muted-foreground/40" />
          </button>
          <div className="flex w-full items-center justify-between gap-3.5 px-4 py-3.5">
            <div className="flex items-center gap-3.5">
              <FlaskConical size={20} strokeWidth={1.8} className="shrink-0 text-foreground" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Aspora Labs</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Try experimental features early</p>
              </div>
            </div>
            <div className="h-6 w-11 rounded-full bg-muted relative">
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-muted-foreground/50 transition-all" />
            </div>
          </div>
          <button className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-muted/50 transition-colors">
            <Users size={20} strokeWidth={1.8} className="shrink-0 text-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-foreground">Design with Us</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">Join sessions, review prototypes, earn badges</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-muted-foreground/40" />
          </button>
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-foreground" />
              <p className="text-[13px] font-semibold text-foreground">Built because you asked</p>
            </div>
            <p className="text-[13px] text-muted-foreground">Collections widget shipped last week. 847 of you voted for it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  APPROACH C — "Hub + Spokes" (single card)                           */
/* ══════════════════════════════════════════════════════════════════════ */

function ApproachC() {
  const [activeTab, setActiveTab] = useState<"money" | "talk" | "shape">("money");

  return (
    <div className="space-y-6">
      {/* The single HQ card on explore */}
      <div>
        <p className="text-[12px] text-muted-foreground mb-3 italic">This card sits at the bottom of explore ↓</p>
        <button className="w-full rounded-2xl border border-border/60 p-5 text-left active:scale-[0.98] transition-transform">
          <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">Beyond Investing</p>
          <h3 className="text-[18px] font-bold text-foreground mb-1.5">The humans behind your money</h3>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">See how we protect your money, talk to us directly, or help shape what we build next.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Shield size={16} strokeWidth={1.8} className="text-foreground" />
              </div>
              <span className="text-[13px] font-medium text-muted-foreground">Safety</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <MessageCircle size={16} strokeWidth={1.8} className="text-foreground" />
              </div>
              <span className="text-[13px] font-medium text-muted-foreground">Talk to Us</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Vote size={16} strokeWidth={1.8} className="text-foreground" />
              </div>
              <span className="text-[13px] font-medium text-muted-foreground">Shape</span>
            </div>
          </div>
        </button>
      </div>

      {/* Separator — what the HQ page looks like */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border/60" />
        <span className="text-[12px] text-muted-foreground/40 italic">Tap opens this page ↓</span>
        <div className="flex-1 h-px bg-border/60" />
      </div>

      {/* HQ page preview */}
      <div>
        <h2 className="text-[22px] font-bold text-foreground mb-1">Aspora HQ</h2>
        <p className="text-[14px] text-muted-foreground mb-5">Where trust, support, and your voice live.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {([
            { id: "money" as const, label: "Your Money" },
            { id: "talk" as const, label: "Talk to Us" },
            { id: "shape" as const, label: "Shape Aspora" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full px-3.5 py-2 text-[14px] font-semibold transition-colors",
                activeTab === tab.id ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "money" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border/60 p-5">
              <div className="flex items-center gap-3 mb-3">
                <Lock size={20} strokeWidth={1.8} className="text-foreground" />
                <h4 className="text-[15px] font-bold text-foreground">How your money is protected</h4>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Brokerage", value: "Alpaca Securities LLC", sub: "FINRA & SEC registered" },
                  { label: "Insurance", value: "SIPC up to 500,000", sub: "Your securities are protected" },
                  { label: "Account type", value: "Segregated", sub: "Your money is never mixed with ours" },
                  { label: "Encryption", value: "256-bit AES", sub: "Bank-level security on every transaction" },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between">
                    <div>
                      <p className="text-[14px] font-semibold text-foreground">{row.label}</p>
                      <p className="text-[12px] text-muted-foreground">{row.sub}</p>
                    </div>
                    <p className="text-[14px] text-foreground text-right">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button className="rounded-2xl border border-border/60 p-4 text-left active:scale-[0.98] transition-transform">
                <Landmark size={18} strokeWidth={1.8} className="text-foreground mb-2" />
                <p className="text-[14px] font-semibold text-foreground">Pricing</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">Every fee, explained</p>
              </button>
              <button className="rounded-2xl border border-border/60 p-4 text-left active:scale-[0.98] transition-transform">
                <Activity size={18} strokeWidth={1.8} className="text-foreground mb-2" />
                <p className="text-[14px] font-semibold text-foreground">System Status</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-gain" />
                  <p className="text-[12px] text-muted-foreground">All operational</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === "talk" && (
          <div className="space-y-3">
            {/* Varun card */}
            <div className="rounded-2xl border border-border/60 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-muted-foreground/25" />
                <div>
                  <p className="text-[16px] font-bold text-foreground">Varun Sridhar</p>
                  <p className="text-[13px] text-muted-foreground">CEO, Aspora Wealth</p>
                </div>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
                {`"I read every message personally. If something's broken, confusing, or just not right — I want to hear it from you. No filter."`}
              </p>
              <button className="w-full rounded-full bg-foreground py-3 text-[15px] font-semibold text-background active:opacity-90 transition-opacity">
                Write to Varun
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { icon: MessageCircle, label: "Chat with Support", sub: "Instant replies, 24/7" },
                { icon: Phone, label: "Call Us", sub: "Mon-Fri, 9am-6pm ET" },
                { icon: CalendarClock, label: "Schedule a Call", sub: "We'll call you at your time" },
                { icon: HelpCircle, label: "Help Center", sub: "Searchable guides and FAQs" },
              ].map((item) => (
                <button key={item.label} className="flex items-center gap-3.5 rounded-2xl border border-border/60 px-4 py-3.5 text-left active:bg-muted/50 transition-colors">
                  <item.icon size={20} strokeWidth={1.8} className="shrink-0 text-foreground" />
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-foreground">{item.label}</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-muted-foreground/40" />
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "shape" && (
          <div className="space-y-3">
            {/* Vote */}
            <button className="w-full rounded-2xl border border-border/60 p-5 text-left active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3 mb-2">
                <Vote size={20} strokeWidth={1.8} className="text-foreground" />
                <h4 className="text-[15px] font-bold text-foreground">Vote on Features</h4>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">3 features are neck and neck right now. Your vote tips the scale.</p>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-foreground">1,247 votes this week</span>
                <ChevronRight size={14} className="text-muted-foreground/40" />
              </div>
            </button>

            {/* Labs */}
            <div className="rounded-2xl border border-border/60 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FlaskConical size={20} strokeWidth={1.8} className="text-foreground" />
                  <h4 className="text-[15px] font-bold text-foreground">Aspora Labs</h4>
                </div>
                <div className="h-6 w-11 rounded-full bg-muted relative">
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-muted-foreground/50 transition-all" />
                </div>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed">Try experimental features before anyone else. Things might break. That&apos;s the point.</p>
            </div>

            {/* Design with Us */}
            <button className="w-full rounded-2xl border border-border/60 p-5 text-left active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3 mb-2">
                <Users size={20} strokeWidth={1.8} className="text-foreground" />
                <h4 className="text-[15px] font-bold text-foreground">Design with Us</h4>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">Join live sessions, review prototypes, and earn an Early Bird badge.</p>
              <span className="rounded-full bg-muted px-3 py-1 text-[12px] font-semibold text-muted-foreground">Next session: Thursday 5pm</span>
            </button>

            {/* Built because you asked */}
            <div className="rounded-2xl bg-muted p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-foreground" />
                <p className="text-[14px] font-bold text-foreground">Built because you asked</p>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed">Collections widget shipped last week. 847 of you voted for it.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  Page                                                                */
/* ══════════════════════════════════════════════════════════════════════ */

export default function TrustExplore() {
  const [active, setActive] = useState<"a" | "c">("a");

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors">
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">Trust & Co-Creation</h1>
          <p className="text-[13px] text-muted-foreground">2 structure approaches</p>
        </div>
      </div>

      {/* Approach picker */}
      <div className="border-b border-border/40">
        <div className="flex gap-0 px-5">
          {([
            { id: "a" as const, label: "A — Two Worlds" },
            { id: "c" as const, label: "C — Hub + Spokes" },
          ]).map((v) => (
            <button
              key={v.id}
              onClick={() => setActive(v.id)}
              className={cn(
                "relative px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors",
                active === v.id ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              {v.label}
              {active === v.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pt-6 pb-10">
          {active === "a" ? <ApproachA /> : <ApproachC />}
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
