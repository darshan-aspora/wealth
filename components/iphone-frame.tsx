"use client";

import { Wifi, Battery, Signal } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

// ─── iPhone Status Bar ───────────────────────────────────────────────
// Tap to toggle dark/light mode
export function StatusBar() {
  const { toggleTheme } = useTheme();

  return (
    <div
      onClick={toggleTheme}
      className="relative flex cursor-pointer items-center justify-between px-6 pt-3 pb-1.5 select-none active:opacity-70 transition-opacity"
    >
      {/* Time */}
      <span className="text-[17px] font-semibold leading-none text-foreground">
        9:41
      </span>

      {/* Dynamic Island */}
      <div className="absolute left-1/2 top-2 -translate-x-1/2">
        <div className="h-[28px] w-[100px] rounded-full bg-black" />
      </div>

      {/* Right cluster: signal, wifi, battery */}
      <div className="flex items-center gap-1.5">
        <Signal size={16} strokeWidth={2.2} className="text-foreground" />
        <Wifi size={17} strokeWidth={2.2} className="text-foreground" />
        <div className="relative flex items-center">
          <Battery size={24} strokeWidth={1.6} className="text-foreground" />
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
