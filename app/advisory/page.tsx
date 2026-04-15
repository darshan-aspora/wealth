"use client";

import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { HeaderV3 } from "@/components/header";
import { TickerMarquee } from "@/components/ticker";
import { BottomNavV2 } from "@/components/bottom-nav";

export default function AdvisoryPage() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <HeaderV3 />
      <TickerMarquee />

      <main className="no-scrollbar flex-1 overflow-y-auto">
        <div className="flex h-full items-center justify-center px-6">
          <p className="text-[15px] text-muted-foreground/50">Advisory</p>
        </div>
      </main>

      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}
