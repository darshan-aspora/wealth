"use client";

import {
  Cpu,
  Banknote,
  Zap,
  Brain,
  Leaf,
  Pill,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Collections V2 — Full-Width List Rows
 * Stacked rows with icon in a colored circle, collection name, description, and arrow.
 * Clean, info-dense vertical layout.
 */

interface Collection {
  name: string;
  description: string;
  count: number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

const collections: Collection[] = [
  {
    name: "Tech Giants",
    description: "FAANG + Big Tech leaders",
    count: 12,
    icon: Cpu,
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
  },
  {
    name: "Dividend Kings",
    description: "50+ years of dividend growth",
    count: 8,
    icon: Banknote,
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  {
    name: "EV Revolution",
    description: "Electric vehicle ecosystem",
    count: 15,
    icon: Zap,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  {
    name: "AI & Robotics",
    description: "Artificial intelligence leaders",
    count: 18,
    icon: Brain,
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
  },
  {
    name: "Clean Energy",
    description: "Solar, wind & green energy",
    count: 10,
    icon: Leaf,
    iconBg: "bg-green-500/15",
    iconColor: "text-green-400",
  },
  {
    name: "Biotech Breakers",
    description: "High-growth pharma & biotech",
    count: 14,
    icon: Pill,
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-400",
  },
];

export function CollectionsV2() {
  return (
    <div className="px-5">
      <div className="flex items-center gap-2 mb-2 px-1">
        <h3 className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground/50">
          Collections
        </h3>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
        {collections.map((col, idx) => {
          const Icon = col.icon;
          return (
            <button
              key={col.name}
              className={`flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-muted/30 transition-colors ${
                idx < collections.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${col.iconBg}`}
              >
                <Icon size={18} strokeWidth={1.8} className={col.iconColor} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-foreground leading-tight">
                  {col.name}
                </p>
                <p className="text-[13px] text-muted-foreground/50 leading-tight mt-0.5">
                  {col.description}
                </p>
              </div>
              <span className="shrink-0 text-[13px] font-medium text-muted-foreground/40 tabular-nums mr-1">
                {col.count}
              </span>
              <ChevronRight size={16} className="shrink-0 text-muted-foreground/30" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
