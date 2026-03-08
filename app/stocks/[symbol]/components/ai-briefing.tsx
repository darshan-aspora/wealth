"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Zap, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_BRIEFINGS } from "./mock-data";

interface AIBriefingProps {
  symbol: string;
}

export function AIBriefingSection({ symbol }: AIBriefingProps) {
  const briefing = AI_BRIEFINGS[symbol];
  const [expanded, setExpanded] = useState(false);

  if (!briefing) {
    return (
      <Section title="AI Briefing">
        <p className="text-[15px] text-muted-foreground italic">
          AI briefing not yet available for this stock.
        </p>
      </Section>
    );
  }

  return (
    <Section title="AI Briefing">
      {/* Summary */}
      <div className="mb-4">
        <div className={cn("relative", !expanded && "max-h-[4.5rem] overflow-hidden")}>
          <p className="text-[15px] leading-relaxed text-foreground/90">
            {briefing.summary}
          </p>
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 flex items-center gap-1 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? "Show less" : "Read full briefing"}
          <ChevronDown
            size={14}
            className={cn("transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>

      {/* Bull / Bear / Wild Card Triptych */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {/* Bull Case */}
        <CaseCard
          type="bull"
          target={briefing.bullCase.target}
          thesis={briefing.bullCase.thesis}

        />
        {/* Bear Case */}
        <CaseCard
          type="bear"
          target={briefing.bearCase.target}
          thesis={briefing.bearCase.thesis}

        />
        {/* Wild Card */}
        <CaseCard
          type="wild"
          label={briefing.wildCard.label}
          thesis={briefing.wildCard.thesis}
        />
      </div>

      {/* Sources */}
      <p className="mt-3 text-[12px] text-muted-foreground/40">
        Sources: {briefing.sources}
      </p>
    </Section>
  );
}

function CaseCard({
  type,
  target,
  thesis,
  label,
}: {
  type: "bull" | "bear" | "wild";
  target?: number;
  thesis: string;
  label?: string;
}) {
  const config = {
    bull: {
      title: "Bull Case",
      icon: TrendingUp,
      borderColor: "border-[hsl(var(--gain))]/30",
      bgColor: "bg-[hsl(var(--gain))]/[0.04]",
      iconColor: "text-[hsl(var(--gain))]",
      priceColor: "text-[hsl(var(--gain))]",
    },
    bear: {
      title: "Bear Case",
      icon: TrendingDown,
      borderColor: "border-[hsl(var(--loss))]/30",
      bgColor: "bg-[hsl(var(--loss))]/[0.04]",
      iconColor: "text-[hsl(var(--loss))]",
      priceColor: "text-[hsl(var(--loss))]",
    },
    wild: {
      title: "Wild Card",
      icon: Zap,
      borderColor: "border-amber-500/30",
      bgColor: "bg-amber-500/[0.04]",
      iconColor: "text-amber-500",
      priceColor: "text-amber-500",
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "min-w-[150px] flex-1 rounded-xl border p-3",
        config.borderColor,
        config.bgColor,
      )}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <Icon size={14} className={config.iconColor} />
        <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          {config.title}
        </span>
      </div>
      {target !== undefined && (
        <p className={cn("mb-1.5 font-mono text-[18px] font-bold tabular-nums", config.priceColor)}>
          ${target}
        </p>
      )}
      {label && (
        <p className={cn("mb-1.5 text-[15px] font-semibold", config.iconColor)}>
          {label}
        </p>
      )}
      <p className="text-[13px] leading-snug text-muted-foreground">
        {thesis}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={14} className="text-muted-foreground/40" />
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
