"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

import { RecentWidget } from "@/app/search/components/recent-v1";
import { PopularWidget } from "@/app/search/components/popular-v3";
import { CollectionsWidget } from "@/app/search/components/collections-v1";
import { OptionsUnderTenV2 } from "@/app/search/components/options-under-ten-v2";

export default function ExploreSearchWidgets() {
  const router = useRouter();

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Header */}
      <header className="flex items-center gap-2 px-3 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <h1 className="text-[17px] font-semibold text-foreground">
          Search Empty State
        </h1>
      </header>

      {/* All four widgets stacked */}
      <main className="no-scrollbar flex-1 space-y-10 overflow-y-auto pt-2 pb-8">
        <RecentWidget />
        <PopularWidget />
        <CollectionsWidget />
        <OptionsUnderTenV2 />
      </main>

      <HomeIndicator />
    </div>
  );
}
