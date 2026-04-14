"use client";

import Link from "next/link";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { HeroWidgetV2Showcase } from "@/components/hero-widget-v2";

export default function HeroWidgetV2Page() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-[430px] pb-16">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/40">
          <div className="flex items-center gap-2 px-5 pt-6 pb-4">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} strokeWidth={2.25} />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] font-bold tracking-tight text-foreground truncate">
                Hero Widget v2
              </h1>
              <p className="text-[12px] text-muted-foreground">
                3 states · 12 variations
              </p>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 active:scale-95 transition-transform"
            >
              {theme === "dark" ? (
                <Sun size={17} strokeWidth={2} />
              ) : (
                <Moon size={17} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Showcase */}
        <div className="px-5 pt-6">
          <HeroWidgetV2Showcase />
        </div>
      </div>
    </div>
  );
}
