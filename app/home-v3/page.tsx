"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ExploreVersionProvider,
  useExploreVersion,
} from "@/app/explore/explore-version-context";
import { ExploreFTUX } from "@/app/explore/versions/ftux";
import { ExploreFundedNotTraded, ExploreFooter } from "@/app/explore/versions/funded-not-traded";
import { ETFFundedNotTraded } from "@/app/explore/versions/etf-funded-not-traded";
import { GlobalETFFundedNotTraded } from "@/app/explore/versions/global-etf-funded-not-traded";
import { cn } from "@/lib/utils";

type ExploreTab = "equity" | "etf" | "global-etf" | "options";

const exploreTabs: { id: ExploreTab; label: string }[] = [
  { id: "equity", label: "Stocks" },
  { id: "etf", label: "ETFs" },
  { id: "global-etf", label: "Global ETFs" },
  { id: "options", label: "Options" },
];

function ExploreContent() {
  const { currentVersion } = useExploreVersion()!;

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
