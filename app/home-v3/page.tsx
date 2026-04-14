"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ExploreVersionProvider,
  useExploreVersion,
  type ExploreVersion,
} from "@/app/explore/explore-version-context";
import { ExploreFTUX } from "@/app/explore/versions/ftux";
import { ExploreFundedNotTraded, ExploreFooter } from "@/app/explore/versions/funded-not-traded";
import { ETFFundedNotTraded } from "@/app/explore/versions/etf-funded-not-traded";
import { GlobalETFFundedNotTraded } from "@/app/explore/versions/global-etf-funded-not-traded";
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

  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as ExploreTab | null;
  const activeTab = tabParam && ["equity", "etf", "global-etf", "options"].includes(tabParam) ? tabParam : "equity";

  const setActiveTab = (tab: ExploreTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "equity") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.replace(`/home-v3${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <>
      {/* Tabs — sticky on scroll */}
      <div className="sticky top-0 z-20 border-b border-border/40 bg-background">
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
          <div className="px-5">
            <ExploreFooter />
          </div>
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
      {activeTab === "global-etf" && <GlobalETFFundedNotTraded />}
      {activeTab === "options" && (
        <div className="flex items-center justify-center px-6 py-20">
          <p className="text-[16px] text-muted-foreground">Options — coming soon</p>
        </div>
      )}

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
      <Suspense>
        <ExploreContent />
      </Suspense>
    </ExploreVersionProvider>
  );
}
