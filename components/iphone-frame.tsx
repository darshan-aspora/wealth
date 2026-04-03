"use client";

/* eslint-disable @next/next/no-img-element */
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

// ─── iPhone Status Bar ───────────────────────────────────────────────
// Tap to toggle dark/light mode. Uses actual iOS status bar SVG asset.
export function StatusBar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      onClick={toggleTheme}
      className={cn(
        "cursor-pointer select-none active:opacity-70 transition-all duration-200",
        "bg-background"
      )}
    >
      <img
        src="/status-bar.svg"
        alt=""
        className={cn(
          "w-full h-auto transition-[filter] duration-200",
          isDark && "invert"
        )}
        draggable={false}
      />
    </div>
  );
}

// ─── iPhone Home Indicator ───────────────────────────────────────────
export function HomeIndicator() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <img
      src="/home-indicator.svg"
      alt=""
      className={cn(
        "w-full h-auto transition-[filter] duration-200",
        isDark && "invert"
      )}
      draggable={false}
    />
  );
}
