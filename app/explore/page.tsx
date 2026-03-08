"use client";

import { useRef, useCallback, useState } from "react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Header } from "@/components/header";
import { TickerMarquee } from "@/components/ticker";
import { BottomNavV2 } from "@/components/bottom-nav";
import {
  ExploreVersionProvider,
  useExploreVersion,
  type ExploreVersion,
} from "./explore-version-context";
import { ExploreFTUX } from "./versions/ftux";
import { ExploreFundedNotTraded } from "./versions/funded-not-traded";
import { ETFFundedNotTraded } from "./versions/etf-funded-not-traded";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const versions: { id: ExploreVersion; label: string; description: string }[] = [
  { id: "ftux", label: "FTUX", description: "First Time User Experience" },
  { id: "not-funded", label: "Not Funded", description: "Signed up but not funded" },
  { id: "funded-not-traded", label: "Funded, Not Traded", description: "Funded but hasn't traded yet" },
];

type ExploreTab = "equity" | "etf" | "options" | "advisory";

const exploreTabs: { id: ExploreTab; label: string }[] = [
  { id: "equity", label: "Stocks" },
  { id: "etf", label: "ETF" },
  { id: "options", label: "Options" },
  { id: "advisory", label: "Baskets" },
];

function ExploreContent() {
  const {
    currentVersion,
    showVersionPicker,
    setShowVersionPicker,
    setCurrentVersion,
  } = useExploreVersion()!;

  const [activeTab, setActiveTab] = useState<ExploreTab>("equity");
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollThreshold = 8;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const st = el.scrollTop;
      const delta = st - lastScrollTop.current;

      if (delta > scrollThreshold && st > 60) {
        // scrolling down past 60px — hide header
        setHeaderHidden(true);
      } else if (delta < -scrollThreshold) {
        // scrolling up — show header
        setHeaderHidden(false);
      }

      lastScrollTop.current = st;
    },
    []
  );

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Collapsible header + ticker */}
      <div
        className={cn(
          "transition-all duration-200 ease-in-out overflow-hidden",
          headerHidden ? "max-h-0 opacity-0" : "max-h-[200px] opacity-100"
        )}
      >
        <Header />
        <TickerMarquee />
      </div>

      {/* Sticky overflowing tabs */}
      <div className="border-b border-border/40 bg-background">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-4">
            {exploreTabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative whitespace-nowrap py-2.5 text-[16px] font-semibold transition-colors",
                  i === 0 ? "pr-3" : "px-3",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className={cn(
                    "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                    i === 0 ? "left-0" : "left-3"
                  )} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="no-scrollbar flex-1 overflow-y-auto" onScroll={handleScroll}>
        {activeTab === "equity" && (
          <>
            {currentVersion === "ftux" && <ExploreFTUX />}
            {currentVersion === "not-funded" && (
              <div className="flex flex-1 items-center justify-center px-6 py-20">
                <p className="text-[16px] text-muted-foreground">Not Funded — coming soon</p>
              </div>
            )}
            {currentVersion === "funded-not-traded" && <ExploreFundedNotTraded />}
          </>
        )}
        {activeTab === "etf" && (
          <>
            {currentVersion === "ftux" && (
              <div className="flex flex-1 items-center justify-center px-6 py-20">
                <p className="text-[16px] text-muted-foreground">ETF FTUX — coming soon</p>
              </div>
            )}
            {currentVersion === "not-funded" && (
              <div className="flex flex-1 items-center justify-center px-6 py-20">
                <p className="text-[16px] text-muted-foreground">ETF Not Funded — coming soon</p>
              </div>
            )}
            {currentVersion === "funded-not-traded" && <ETFFundedNotTraded />}
          </>
        )}
        {activeTab === "options" && (
          <div className="flex flex-1 items-center justify-center px-6 py-20">
            <p className="text-[16px] text-muted-foreground">Options — coming soon</p>
          </div>
        )}
        {activeTab === "advisory" && (
          <div className="flex flex-1 items-center justify-center px-6 py-20">
            <p className="text-[16px] text-muted-foreground">Advisory Baskets — coming soon</p>
          </div>
        )}
      </main>

      <BottomNavV2 />
      <HomeIndicator />

      {/* Version Picker */}
      <Sheet open={showVersionPicker} onOpenChange={setShowVersionPicker}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-10">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-[17px]">Explore Versions</SheetTitle>
          </SheetHeader>

          <div className="space-y-1.5">
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setCurrentVersion(v.id);
                  setShowVersionPicker(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors",
                  currentVersion === v.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <div className="flex-1">
                  <p className="text-[16px] font-semibold">{v.label}</p>
                  <p className="text-[14px] text-muted-foreground">
                    {v.description}
                  </p>
                </div>
                {currentVersion === v.id && (
                  <Check size={20} className="text-foreground" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <ExploreVersionProvider>
      <ExploreContent />
    </ExploreVersionProvider>
  );
}
