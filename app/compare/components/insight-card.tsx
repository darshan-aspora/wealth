"use client";

import { Sparkles } from "lucide-react";

interface InsightCardProps {
  insight: string;
}

export function InsightCard({ insight }: InsightCardProps) {
  if (!insight) return null;

  return (
    <div className="mx-5 mt-6 rounded-3xl bg-muted p-5">
      <div className="flex items-center gap-2">
        <Sparkles size={14} strokeWidth={2.2} className="text-muted-foreground" />
        <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Where they actually differ
        </span>
      </div>
      <p className="mt-3 text-[16px] font-medium leading-relaxed text-foreground">
        {insight}
      </p>
    </div>
  );
}
