"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
  ExploreVersionProvider,
  useExploreVersion,
  type ExploreVersion,
} from "@/app/explore/explore-version-context";
import { ExploreFTUX } from "@/app/explore/versions/ftux";
import { ExploreFundedNotTraded } from "@/app/explore/versions/funded-not-traded";
import { ETFFundedNotTraded } from "@/app/explore/versions/etf-funded-not-traded";
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

type ExploreTab = "equity" | "etf" | "global-etf" | "options";

const exploreTabs: { id: ExploreTab; label: string }[] = [
  { id: "equity", label: "Stocks" },
  { id: "etf", label: "ETFs" },
  { id: "global-etf", label: "Global ETFs" },
  { id: "options", label: "Options" },
];

function ExploreContent() {
  const {
    currentVersion,
    showVersionPicker,
    setShowVersionPicker,
    setCurrentVersion,
  } = useExploreVersion()!;

  const [activeTab, setActiveTab] = useState<ExploreTab>("equity");
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  return (
    <>
      {/* Tabs */}
      <div className="border-b border-border/40 bg-background">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5">
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
                  <motion.span
                    layoutId="v3-explore-tab-underline"
                    className={cn(
                      "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                      i === 0 ? "left-0" : "left-3"
                    )}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* What's New banner */}
      <div className="px-5 pt-4 pb-2">
        <button
          onClick={() => setWhatsNewOpen((p) => !p)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-muted/50 py-2.5 active:bg-muted/70 transition-colors"
        >
          <span className="text-[14px] font-medium text-muted-foreground">What&apos;s New</span>
          <ChevronRight size={14} strokeWidth={2} className="text-muted-foreground/40" />
        </button>
      </div>

      {/* What's New expanded area */}
      <AnimatePresence initial={false}>
        {whatsNewOpen && (
          <motion.div
            key="whats-new-space"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden bg-muted/20"
          >
            <div className="px-5 py-6">
              <p className="text-[13px] text-muted-foreground/50">What&apos;s New content goes here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {activeTab === "equity" && (
        <>
          {currentVersion === "ftux" && <ExploreFTUX />}
          {currentVersion === "not-funded" && (
            <div className="flex items-center justify-center px-6 py-20">
              <p className="text-[16px] text-muted-foreground">Not Funded — coming soon</p>
            </div>
          )}
          {currentVersion === "funded-not-traded" && <ExploreFundedNotTraded />}
        </>
      )}
      {activeTab === "etf" && (
        <>
          {currentVersion === "ftux" && (
            <div className="flex items-center justify-center px-6 py-20">
              <p className="text-[16px] text-muted-foreground">ETF FTUX — coming soon</p>
            </div>
          )}
          {currentVersion === "not-funded" && (
            <div className="flex items-center justify-center px-6 py-20">
              <p className="text-[16px] text-muted-foreground">ETF Not Funded — coming soon</p>
            </div>
          )}
          {currentVersion === "funded-not-traded" && <ETFFundedNotTraded />}
        </>
      )}
      {activeTab === "global-etf" && (
        <div className="flex items-center justify-center px-6 py-20">
          <p className="text-[16px] text-muted-foreground">Global ETFs — coming soon</p>
        </div>
      )}
      {activeTab === "options" && (
        <div className="flex items-center justify-center px-6 py-20">
          <p className="text-[16px] text-muted-foreground">Options — coming soon</p>
        </div>
      )}

      {/* From the Team */}
      <div className="px-8 py-10 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/30 mb-5">From the Team</p>
        <p className="text-[17px] font-light leading-[1.7] text-foreground/80">
          We obsess over every pixel, every interaction, every second of your time. This app is built for you — and we&apos;d love to hear how we can make it better.
        </p>
        <div className="flex flex-col items-center gap-2.5 mt-7">
          <button className="w-full max-w-[240px] rounded-full bg-foreground py-2.5 text-[13px] font-medium text-background transition-colors active:opacity-80">
            Submit Feedback
          </button>
          <button className="w-full max-w-[240px] rounded-full border border-border/50 py-2.5 text-[13px] font-medium text-foreground transition-colors active:bg-muted/50">
            Participate in Research
          </button>
        </div>
      </div>

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
                  "flex w-full items-center gap-3 rounded-xl px-5 py-3.5 text-left transition-colors",
                  currentVersion === v.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <div className="flex-1">
                  <p className="text-[16px] font-semibold">{v.label}</p>
                  <p className="text-[14px] text-muted-foreground">{v.description}</p>
                </div>
                {currentVersion === v.id && <Check size={20} className="text-foreground" />}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default function HomeV3Explore() {
  return (
    <ExploreVersionProvider>
      <ExploreContent />
    </ExploreVersionProvider>
  );
}
