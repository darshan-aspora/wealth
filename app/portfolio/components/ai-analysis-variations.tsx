"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Shield,
  Lightbulb,
  MessageCircle,
} from "lucide-react";

/* ================================================================== */
/*  Shared mock data                                                   */
/* ================================================================== */

const INSIGHTS = [
  {
    type: "risk" as const,
    title: "Tech concentration is high",
    body: "62% of your portfolio is in Technology. A sector downturn could hit hard. Consider spreading into Healthcare or Industrials.",
  },
  {
    type: "opportunity" as const,
    title: "SIP investments are underperforming",
    body: "Your lumpsum picks return 22.8% XIRR vs 12.6% for SIP. Your stock-picking instinct is strong — lean into it.",
  },
  {
    type: "alert" as const,
    title: "3 holdings are down over 10%",
    body: "Snap, PayPal, and Rivian have been declining steadily. Review if your original thesis still holds or cut losses early.",
  },
  {
    type: "positive" as const,
    title: "Beating the benchmark",
    body: "Your portfolio Est. XIRR of 18.4% is outperforming the S&P 500 by +3.6%. You're doing better than most.",
  },
];

const HEALTH_SCORE = 74;
const HEALTH_LABEL = "Good";

const QUICK_ACTIONS = [
  "Rebalance tech exposure",
  "Review losing positions",
  "Increase SIP allocation",
];

/* ================================================================== */
/*  VARIATION A — Conversational card                                  */
/*  Single paragraph AI summary, warm and human, with a "Tell me more" */
/*  button that opens the AI chat                                      */
/* ================================================================== */

function VariationA() {
  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} strokeWidth={2} className="text-foreground" />
          <p className="text-[15px] font-semibold text-foreground">AI Portfolio Review</p>
        </div>

        <p className="text-[14px] text-foreground/90 leading-relaxed mb-4">
          Your portfolio is up 6.2% overall, outpacing the S&P 500. But heads up — 62% sits in tech, and three of your picks are down over 10%. Your lumpsum bets are crushing your SIPs, so your instincts are sharp. Might be a good time to trim tech and spread the love.
        </p>

        <button className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground active:opacity-70 transition-opacity">
          <MessageCircle size={14} strokeWidth={2} />
          Ask me anything about your portfolio
          <ChevronRight size={14} />
        </button>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  VARIATION B — Insight cards                                        */
/*  Horizontally scrollable cards, each a bite-sized insight with      */
/*  icon + type badge                                                  */
/* ================================================================== */

function VariationB() {
  const iconMap = {
    risk: <AlertTriangle size={15} className="text-amber-500" />,
    opportunity: <Lightbulb size={15} className="text-blue-400" />,
    alert: <AlertTriangle size={15} className="text-loss" />,
    positive: <TrendingUp size={15} className="text-gain" />,
  };
  const bgMap = {
    risk: "bg-amber-500/8",
    opportunity: "bg-blue-500/8",
    alert: "bg-loss/8",
    positive: "bg-gain/8",
  };

  return (
    <Card className="border-border/50 shadow-none overflow-hidden">
      <CardContent className="p-5 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} strokeWidth={2} className="text-foreground" />
          <p className="text-[15px] font-semibold text-foreground">AI Insights</p>
          <span className="ml-auto text-[12px] text-muted-foreground">{INSIGHTS.length} new</span>
        </div>
      </CardContent>

      {/* Scrollable insight cards */}
      <div className="overflow-x-auto no-scrollbar pb-5">
        <div className="flex gap-3 px-5">
          {INSIGHTS.map((insight, i) => (
            <div
              key={i}
              className={cn(
                "shrink-0 w-[260px] rounded-xl p-4",
                bgMap[insight.type]
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {iconMap[insight.type]}
                <p className="text-[13px] font-semibold text-foreground">{insight.title}</p>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{insight.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  VARIATION C — Health score + bullet insights                       */
/*  Big score on left, stacked insight bullets on right                */
/* ================================================================== */

function VariationC() {
  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} strokeWidth={2} className="text-foreground" />
          <p className="text-[15px] font-semibold text-foreground">Portfolio Health</p>
        </div>

        <div className="flex gap-5 mb-4">
          {/* Score */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative flex items-center justify-center h-20 w-20">
              <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  strokeDasharray={`${HEALTH_SCORE} ${100 - HEALTH_SCORE}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-bold text-foreground leading-none">{HEALTH_SCORE}</span>
                <span className="text-[10px] text-muted-foreground">{HEALTH_LABEL}</span>
              </div>
            </div>
          </div>

          {/* Insights list */}
          <div className="flex-1 space-y-2.5">
            {INSIGHTS.slice(0, 3).map((insight, i) => (
              <div key={i} className="flex gap-2">
                <span className="inline-flex h-[6px] w-[6px] rounded-full bg-foreground/40 mt-[7px] shrink-0" />
                <p className="text-[12px] text-muted-foreground leading-snug">{insight.title}</p>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-muted/50 py-2.5 text-[13px] font-medium text-muted-foreground active:opacity-70 transition-opacity">
          View full analysis
          <ChevronRight size={14} />
        </button>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  VARIATION D — Stacked list with actions                            */
/*  Each insight is a row with icon, text, and a suggested action      */
/* ================================================================== */

function VariationD() {
  const iconMap = {
    risk: <Shield size={16} className="text-amber-500" />,
    opportunity: <Lightbulb size={16} className="text-blue-400" />,
    alert: <AlertTriangle size={16} className="text-loss" />,
    positive: <TrendingUp size={16} className="text-gain" />,
  };

  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} strokeWidth={2} className="text-foreground" />
          <p className="text-[15px] font-semibold text-foreground">AI Analysis</p>
        </div>
        <p className="text-[13px] text-muted-foreground mb-4">
          4 things worth your attention right now
        </p>

        <div className="space-y-0">
          {INSIGHTS.map((insight, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 py-3",
                i > 0 && "border-t border-border/30"
              )}
            >
              <div className="mt-0.5 shrink-0">{iconMap[insight.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground mb-0.5">{insight.title}</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{insight.body}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground/40 mt-0.5 shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  VARIATION E — Summary + quick actions                              */
/*  Short AI summary on top, then tappable action pills                */
/* ================================================================== */

function VariationE() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} strokeWidth={2} className="text-foreground" />
          <p className="text-[15px] font-semibold text-foreground">AI Portfolio Review</p>
          <span className="ml-auto text-[11px] text-muted-foreground">Updated 2h ago</span>
        </div>

        {/* Summary */}
        <p className="text-[14px] text-foreground/90 leading-relaxed mb-1">
          Portfolio is healthy at +6.2% but heavily tilted towards tech. Three positions need a second look.
        </p>

        {expanded && (
          <div className="space-y-3 mt-3 mb-1">
            {INSIGHTS.map((insight, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="inline-flex h-[6px] w-[6px] rounded-full bg-foreground/30 mt-[7px] shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-foreground">{insight.title}</p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{insight.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[13px] font-medium text-muted-foreground mb-4 active:opacity-70"
        >
          {expanded ? "Show less" : "Read full analysis"}
        </button>

        {/* Quick action pills */}
        <div className="border-t border-border/30 pt-3.5">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2.5">Suggested actions</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                className="rounded-full border border-border/60 px-3.5 py-1.5 text-[12px] font-medium text-foreground active:bg-muted/50 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Export all variations                                               */
/* ------------------------------------------------------------------ */

export const AI_ANALYSIS_VARIATIONS = [
  { name: "A — Conversational", component: VariationA },
  { name: "B — Scrollable Insight Cards", component: VariationB },
  { name: "C — Health Score + Bullets", component: VariationC },
  { name: "D — Stacked List with Actions", component: VariationD },
  { name: "E — Summary + Quick Actions", component: VariationE },
];
