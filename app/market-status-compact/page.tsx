"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import {
  getBrowserTz,
  marketStates,
  regionOptions,
} from "@/components/market-status-widget-v2";
import { compactDirections } from "@/components/market-status-compact";

export default function MarketStatusCompactPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeDir, setActiveDir] = useState(compactDirections[0].id);
  const [regionId, setRegionId] = useState("auto");
  const [browserTz, setBrowserTz] = useState<string>("America/New_York");

  useEffect(() => {
    setBrowserTz(getBrowserTz());
  }, []);

  const region = regionOptions.find((r) => r.id === regionId) ?? regionOptions[0];
  const userTz = region.tz ?? browserTz;

  const current =
    compactDirections.find((d) => d.id === activeDir) ?? compactDirections[0];
  const Component = current.Component;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-[430px] pb-16">
        {/* Header + Tabs (sticky) */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/40">
          <div className="flex items-center gap-2 px-5 pt-6 pb-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} strokeWidth={2.25} />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] font-bold tracking-tight text-foreground truncate">
                Market Status · Compact
              </h1>
              <p className="text-[12px] text-muted-foreground truncate">
                {compactDirections.length} directions · {marketStates.length} states ·{" "}
                <span className="font-mono">{userTz}</span>
              </p>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 active:scale-95 transition-transform"
            >
              {theme === "dark" ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
            </button>
          </div>

          {/* Direction tabs */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 px-4 pb-3">
              {compactDirections.map((dir) => {
                const isActive = dir.id === activeDir;
                const [prefix, ...rest] = dir.label.split(" — ");
                const sublabel = rest.join(" — ");
                return (
                  <button
                    key={dir.id}
                    onClick={() => setActiveDir(dir.id)}
                    className={cn(
                      "relative shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors whitespace-nowrap",
                      isActive ? "text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="msc-tab-pill"
                        className="absolute inset-0 rounded-full bg-foreground"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">
                      {prefix}
                      <span
                        className={cn(
                          "ml-1.5 text-[11px] font-medium",
                          isActive ? "text-background/60" : "text-muted-foreground/60"
                        )}
                      >
                        {sublabel}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region selector */}
          <div className="overflow-x-auto no-scrollbar border-t border-border/30">
            <div className="flex items-center gap-1.5 px-4 py-2.5">
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70 mr-1">
                Region
              </span>
              {regionOptions.map((r) => {
                const isActive = r.id === regionId;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRegionId(r.id)}
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors active:scale-[0.96] whitespace-nowrap",
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Direction header */}
        <div className="px-5 pt-6 pb-2">
          <p className="text-[13px] text-muted-foreground leading-snug">
            {current.tagline}
          </p>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground/70">
            Target height: <span className="font-mono">{current.approxHeight}</span>
          </p>
        </div>

        {/* All states for the active direction */}
        <div className="px-5 pt-4 space-y-4">
          {marketStates.map((state, stateIdx) => (
            <div key={state.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 px-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                  {String(stateIdx + 1).padStart(2, "0")} · {state.name}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground/40">
                  {state.id}
                </span>
              </div>
              <Component state={state} userTz={userTz} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
