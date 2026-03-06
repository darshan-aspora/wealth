"use client";

import { Wifi, Battery, Signal } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

// ─── iPhone Status Bar ───────────────────────────────────────────────
// Tap to toggle dark/light mode. Follows current theme (white/black).
export function StatusBar() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <div
      onClick={toggleTheme}
      className={cn(
        "relative flex cursor-pointer items-center justify-between px-6 pt-3 pb-1.5 select-none active:opacity-70 transition-all duration-200",
        isDark ? "bg-[#0f0f11]" : "bg-white"
      )}
    >
      {/* Time */}
      <span
        className={cn(
          "text-[17px] font-semibold leading-none",
          isDark ? "text-white" : "text-black"
        )}
      >
        9:41
      </span>

      {/* Dynamic Island */}
      <div className="absolute left-1/2 top-2 -translate-x-1/2">
        <div className="h-[28px] w-[100px] rounded-full bg-black" />
      </div>

      {/* Right cluster: signal, wifi, battery */}
      <div className="flex items-center gap-1.5">
        <Signal size={16} strokeWidth={2.2} className={isDark ? "text-white" : "text-black"} />
        <Wifi size={17} strokeWidth={2.2} className={isDark ? "text-white" : "text-black"} />
        <div className="relative flex items-center">
          <Battery size={24} strokeWidth={1.6} className={isDark ? "text-white" : "text-black"} />
        </div>
      </div>
    </div>
  );
}

// ─── iPhone Home Indicator ───────────────────────────────────────────
// The bottom swipe-bar found on Face ID iPhones
export function HomeIndicator() {
  return (
    <div className="flex items-center justify-center pb-2 pt-1">
      <div className="h-[5px] w-[134px] rounded-full bg-foreground/20" />
    </div>
  );
}
