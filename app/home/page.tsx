"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  Home,
  BarChart3,
  ArrowLeftRight,
  PieChart,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

// ─── Rotating search placeholder ─────────────────────────────────────
const searchSuffixes = [
  "ETF",
  "Stocks",
  "Options",
  "News",
  "Advisory",
  "Services",
];

function useRotatingSuffix(interval = 2200) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % searchSuffixes.length);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);
  return searchSuffixes[index];
}

function SearchPlaceholder() {
  const suffix = useRotatingSuffix();
  return (
    <span className="flex items-center">
      <span>Search</span>
      <span className="relative ml-[5px] inline-flex h-5 w-[72px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={suffix}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="absolute left-0 top-0"
          >
            {suffix}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

// ─── Header V1: Clean Pill ───────────────────────────────────────────
function Header() {
  return (
    <header className="flex items-center gap-2.5 px-4 py-3">
      <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        <ChevronLeft size={22} strokeWidth={2} />
      </button>

      <div className="relative flex h-10 flex-1 items-center rounded-full bg-muted/50 px-3.5">
        <Search size={16} className="shrink-0 text-muted-foreground/60" />
        <div className="ml-2 text-[14px] text-muted-foreground/60">
          <SearchPlaceholder />
        </div>
      </div>

      <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
        <SlidersHorizontal size={18} strokeWidth={1.8} />
      </button>
    </header>
  );
}

// ─── Bottom Navigation ───────────────────────────────────────────────
const navTabs = [
  { label: "Home", icon: Home, href: "/home" },
  { label: "Explore", icon: BarChart3, href: "/explore" },
  { label: "Trade", icon: ArrowLeftRight, href: "/trade" },
  { label: "Portfolio", icon: PieChart, href: "/portfolio" },
  { label: "Options", icon: LayoutGrid, href: "/options" },
];

function BottomNav() {
  const activeHref = "/home";

  return (
    <nav className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,8px)] pt-2">
        {navTabs.map((tab) => {
          const isActive = tab.href === activeHref;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="home-tab-indicator"
                  className="absolute -top-2 h-0.5 w-5 rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Home Page ───────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      {/* iPhone Status Bar */}
      <StatusBar />

      {/* Header */}
      <Header />

      {/* Content area */}
      <main className="no-scrollbar flex-1 overflow-y-auto">
        <div className="flex h-full items-center justify-center px-6">
          <div className="text-center">
            <p className="text-[13px] text-muted-foreground/50">
              Watchlist content goes here
            </p>
          </div>
        </div>
      </main>

      {/* Bottom navigation */}
      <BottomNav />

      {/* iPhone Home Indicator */}
      <HomeIndicator />
    </div>
  );
}
