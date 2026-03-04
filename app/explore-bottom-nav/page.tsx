"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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
/*  Tab definitions                                                   */
/* ------------------------------------------------------------------ */

const v1Tabs = [
  { label: "Home", icon: Home, id: "home" },
  { label: "Market", icon: BarChart3, id: "market" },
  { label: "Portfolio", icon: Briefcase, id: "portfolio" },
  { label: "Advisory", icon: Sparkles, id: "advisory" },
  { label: "Autopilot", icon: Rocket, id: "autopilot" },
];

const v2Tabs = [
  { label: "Explore", icon: Compass, id: "explore" },
  { label: "Market", icon: BarChart3, id: "market" },
  { label: "Watchlist", icon: Bookmark, id: "watchlist" },
  { label: "Orders", icon: ClipboardList, id: "orders" },
  { label: "Portfolio", icon: PieChart, id: "portfolio" },
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
/*  V1 preview — standard tabs                                        */
/* ------------------------------------------------------------------ */

function NavPreviewV1() {
  const [active, setActive] = useState("home");

  return (
    <nav className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 pb-2 pt-2">
        {v1Tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1.5 text-[13px] font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bnav-v1-preview"
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
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  V2 preview — tabs + More sheet                                    */
/* ------------------------------------------------------------------ */

function NavPreviewV2() {
  const [active, setActive] = useState("explore");
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 pb-2 pt-2">
          {v2Tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-1.5 text-[13px] font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bnav-v2-preview"
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
              </button>
            );
          })}

          <button
            onClick={() => setMoreOpen(true)}
            className="relative flex flex-col items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors"
          >
            <MoreHorizontal size={24} strokeWidth={1.6} />
            <span>More</span>
          </button>
        </div>
      </nav>

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
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Variations config                                                 */
/* ------------------------------------------------------------------ */

const variations = [
  {
    id: 1,
    label: "Set A",
    sublabel: "Home · Market · Portfolio · Advisory · Autopilot",
    component: NavPreviewV1,
  },
  {
    id: 2,
    label: "Set B",
    sublabel: "Explore · Market · Orders · Portfolio · More",
    component: NavPreviewV2,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ExploreBottomNav() {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* Page header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-5">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[19px] font-semibold text-foreground">
            Bottom Nav
          </h1>
          <p className="text-[14px] text-muted-foreground">
            2 variations — tab bar, icons, indicators
          </p>
        </div>
      </div>

      <div className="mx-5 h-px bg-border/60" />

      {/* Variations */}
      <div className="flex-1 space-y-6 px-5 pt-5 pb-10">
        {variations.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
          >
            {/* Label */}
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-[13px] font-mono font-semibold text-muted-foreground/50 tabular-nums">
                {String(v.id).padStart(2, "0")}
              </span>
              <span className="text-[15px] font-semibold text-foreground/80">
                {v.label}
              </span>
              <span className="text-[13px] text-muted-foreground/40">
                {v.sublabel}
              </span>
            </div>

            {/* Nav preview */}
            <div className="overflow-hidden rounded-xl border border-border/50 bg-card/40">
              <v.component />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
