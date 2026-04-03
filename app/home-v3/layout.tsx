"use client";

import { useRouter, usePathname } from "next/navigation";
import { useRef, useCallback, useState, createContext, useContext } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  X, Bell, Globe, BarChart3, Bookmark,
  PieChart, FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { TickerMarquee } from "@/components/ticker";
import { SearchPlaceholder } from "@/components/header";

// ── Scroll context so child pages can react to header state ──────────
const HeaderHiddenContext = createContext(false);
export function useHeaderHidden() { return useContext(HeaderHiddenContext); }

// ── Bottom Nav (route links) ──────────────────────────────────────────

const bottomTabs = [
  { label: "Explore", icon: Globe, href: "/home-v3" },
  { label: "Market", icon: BarChart3, href: "/home-v3/market" },
  { label: "Watchlist", icon: Bookmark, href: "/home-v3/watchlist" },
  { label: "Portfolio", icon: PieChart, href: "/home-v3/portfolio" },
  { label: "Advisory", icon: FlaskConical, href: "/home-v3/advisory" },
];

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="relative border-t border-border/50 bg-background/80 backdrop-blur-xl overflow-visible z-10">
      <div className="flex items-center justify-around px-2 pb-0 pt-2">
        {bottomTabs.map((tab) => {
          const isActive =
            tab.href === "/home-v3"
              ? pathname === "/home-v3"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1.5 text-[13px] font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bnav-v3-pill"
                  className="absolute -top-[11px] inset-x-0 mx-auto h-[3px] w-6 rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
              >
                <tab.icon size={24} strokeWidth={1.6} />
              </motion.div>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ── Shared Layout ─────────────────────────────────────────────────────

export default function HomeV3Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollThreshold = 8;

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const st = e.currentTarget.scrollTop;
    const delta = st - lastScrollTop.current;

    if (delta > scrollThreshold && st > 60) {
      setHeaderHidden(true);
    } else if (delta < -scrollThreshold) {
      setHeaderHidden(false);
    }

    lastScrollTop.current = st;
  }, []);

  return (
    <HeaderHiddenContext.Provider value={headerHidden}>
      <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
        <StatusBar />

        {/* ── Collapsible Header + Ticker ────────────────────────────── */}
        <div
          className={cn(
            "transition-all duration-200 ease-in-out overflow-hidden",
            headerHidden ? "max-h-0 opacity-0" : "max-h-[200px] opacity-100"
          )}
        >
          <header className="flex items-center gap-1.5 pl-3 pr-3 py-3">
            <button
              onClick={() => router.push("/")}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted/50"
            >
              <X size={20} strokeWidth={2} />
            </button>

            <div
              onClick={() => router.push("/search")}
              className="relative mx-1 flex h-12 min-w-0 flex-1 cursor-pointer items-center rounded-full bg-muted/50 px-4"
            >
              <div className="min-w-0 flex-1 overflow-hidden text-[16px] text-muted-foreground">
                <SearchPlaceholder />
              </div>
            </div>

            <button
              onClick={() => router.push("/notifications")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted/50"
            >
              <Bell size={20} strokeWidth={1.8} />
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:scale-95 transition-transform ml-1"
            >
              <div className="h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src="/profile_dp.png"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
            </button>
          </header>

          <TickerMarquee />
        </div>

        {/* ── Page Content ────────────────────────────────────────────── */}
        <main className="no-scrollbar flex-1 overflow-y-auto" onScroll={handleScroll}>
          {children}
        </main>

        {/* ── Bottom Nav ──────────────────────────────────────────────── */}
        <BottomNav />
        <HomeIndicator />
      </div>
    </HeaderHiddenContext.Provider>
  );
}
