"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = ["Pages", "Components"] as const;
type Tab = (typeof tabs)[number];

const pages = [
  {
    title: "Home",
    description: "Watchlist, header, and bottom navigation",
    href: "/home",
    status: "v1",
  },
];

const components = [
  {
    title: "Header Design",
    description: "Search bar, navigation, and customisation controls",
    href: "/explore-headers",
    status: "5 variations",
  },
  {
    title: "Ticker",
    description: "Market tickers — marquee, pills, cards, dense, glow",
    href: "/explore-tickers",
    status: "5 variations",
  },
  {
    title: "Bottom Nav",
    description: "Tab bar — icon, label, active indicator",
    href: "/explore-bottom-nav",
    status: "2 variations",
  },
];

const items: Record<Tab, typeof pages> = {
  Pages: pages,
  Components: components,
};

function DirectoryCard({
  item,
  index,
}: {
  item: (typeof pages)[number];
  index: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={item.href}
        className="group flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3.5 transition-colors hover:border-border hover:bg-card/80 active:scale-[0.98]"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-foreground">
            {item.title}
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug">
            {item.description}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <span className="text-[11px] font-medium text-muted-foreground/70">
            {item.status}
          </span>
          <ChevronRight
            size={16}
            className="text-muted-foreground/50 transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </Link>
    </motion.div>
  );
}

export default function Directory() {
  const [activeTab, setActiveTab] = useState<Tab>("Pages");

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      {/* Title area */}
      <div className="px-5 pt-14 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[22px] font-bold tracking-tight text-foreground"
        >
          US Equity
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mt-1 text-[13px] text-muted-foreground"
        >
          Component directory — design explorations
        </motion.p>
      </div>

      {/* Tabs */}
      <div className="px-5 pb-4">
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              )}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="directory-tab"
                  className="absolute inset-0 rounded-lg bg-secondary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-border/60" />

      {/* Links */}
      <div className="flex-1 px-5 pt-4 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {items[activeTab].map((item, i) => (
              <DirectoryCard key={item.href} item={item} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-6">
        <p className="text-[11px] text-muted-foreground/40 text-center">
          Prototype — design iterations
        </p>
      </div>
    </div>
  );
}
