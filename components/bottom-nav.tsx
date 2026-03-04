"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BarChart3,
  Briefcase,
  Sparkles,
  Rocket,
  Compass,
  ClipboardList,
  PieChart,
  MoreHorizontal,
  Bookmark,
  FileText,
  LayoutGrid,
  BookOpen,
  ChevronRight,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  V1 — Home · Market · Portfolio · Advisory · Autopilot             */
/* ------------------------------------------------------------------ */

const v1Tabs = [
  { label: "Home", icon: Home, href: "/home" },
  { label: "Market", icon: BarChart3, href: "/market" },
  { label: "Portfolio", icon: Briefcase, href: "/portfolio" },
  { label: "Advisory", icon: Sparkles, href: "/advisory" },
  { label: "Autopilot", icon: Rocket, href: "/autopilot" },
];

/* ------------------------------------------------------------------ */
/*  V2 — Explore · Market · Orders · Portfolio · More                 */
/* ------------------------------------------------------------------ */

const v2Tabs = [
  { label: "Explore", icon: Compass, href: "/explore" },
  { label: "Market", icon: BarChart3, href: "/market" },
  { label: "Watchlist", icon: Bookmark, href: "/watchlist" },
  { label: "Orders", icon: ClipboardList, href: "/orders" },
  { label: "Portfolio", icon: PieChart, href: "/portfolio" },
];

/* ------------------------------------------------------------------ */
/*  More sheet grid items                                             */
/* ------------------------------------------------------------------ */

const moreItems: { label: string; icon: LucideIcon }[] = [
  { label: "Advisory Baskets", icon: LayoutGrid },
  { label: "1-Click Algo Strategies", icon: Rocket },
  { label: "Learn", icon: BookOpen },
  { label: "Reports", icon: FileText },
];

/* ------------------------------------------------------------------ */
/*  Shared tab bar renderer                                           */
/* ------------------------------------------------------------------ */

function TabBar({
  tabs,
  layoutId,
  moreSheet,
}: {
  tabs: typeof v1Tabs;
  layoutId: string;
  moreSheet?: boolean;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,8px)] pt-2.5">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== "/" && pathname.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex min-w-0 flex-col items-center gap-1 px-1.5 py-1.5 text-[12px] font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId={layoutId}
                    className="absolute -top-2.5 h-0.5 w-6 rounded-full bg-foreground"
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

          {moreSheet && (
            <button
              onClick={() => setMoreOpen(true)}
              className="relative flex min-w-0 flex-col items-center gap-1 px-1.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors"
            >
              <MoreHorizontal size={24} strokeWidth={1.6} />
              <span>More</span>
            </button>
          )}
        </div>
      </nav>

      {moreSheet && (
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-10">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-[17px]">More</SheetTitle>
            </SheetHeader>

            {/* Funds card */}
            <button className="mb-5 flex w-full items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3.5 text-left transition-colors hover:bg-card/80 active:scale-[0.98]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                <Wallet size={22} strokeWidth={1.6} className="text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-muted-foreground">Available funds</p>
                <p className="text-[18px] font-semibold font-mono tabular-nums text-foreground">
                  $12,485.50
                </p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground/50" />
            </button>

            <div className="grid grid-cols-4 gap-y-5 gap-x-2">
              {moreItems.map((item) => (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                    <item.icon size={22} strokeWidth={1.6} />
                  </div>
                  <span className="text-[13px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported variants                                                 */
/* ------------------------------------------------------------------ */

export function BottomNavV1() {
  return <TabBar tabs={v1Tabs} layoutId="bnav-v1" />;
}

export function BottomNavV2() {
  return <TabBar tabs={v2Tabs} layoutId="bnav-v2" moreSheet />;
}
