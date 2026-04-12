"use client";

import {
  Cpu,
  Banknote,
  Zap,
  Brain,
  Leaf,
  Pill,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Collections V3 — 2×3 Grid Tiles
 * Compact square-ish tiles in a grid. Centered icon, collection name below,
 * faint stock count. Colorful icon backgrounds.
 */

interface Collection {
  name: string;
  count: number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

const collections: Collection[] = [
  { name: "Tech Giants", count: 12, icon: Cpu, iconBg: "bg-blue-500/12", iconColor: "text-blue-400" },
  { name: "Dividend Kings", count: 8, icon: Banknote, iconBg: "bg-emerald-500/12", iconColor: "text-emerald-400" },
  { name: "EV Revolution", count: 15, icon: Zap, iconBg: "bg-amber-500/12", iconColor: "text-amber-400" },
  { name: "AI & Robotics", count: 18, icon: Brain, iconBg: "bg-purple-500/12", iconColor: "text-purple-400" },
  { name: "Clean Energy", count: 10, icon: Leaf, iconBg: "bg-green-500/12", iconColor: "text-green-400" },
  { name: "Biotech", count: 14, icon: Pill, iconBg: "bg-rose-500/12", iconColor: "text-rose-400" },
];

export function CollectionsV3() {
  return (
    <div className="px-5">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground/50">
          Collections
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {collections.map((col) => {
          const Icon = col.icon;
          return (
            <button
              key={col.name}
              className="flex flex-col items-center rounded-2xl border border-border/40 bg-card/60 px-2 py-4 text-center active:scale-[0.95] transition-transform"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${col.iconBg} mb-2.5`}
              >
                <Icon size={20} strokeWidth={1.8} className={col.iconColor} />
              </div>
              <p className="text-[13px] font-semibold text-foreground leading-tight">
                {col.name}
              </p>
              <p className="text-[11px] text-muted-foreground/40 mt-1 tabular-nums">
                {col.count} stocks
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
