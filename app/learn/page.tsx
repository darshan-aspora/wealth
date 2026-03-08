"use client";

import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Header } from "@/components/header";
import { TickerMarquee } from "@/components/ticker";
import { BottomNavV2 } from "@/components/bottom-nav";
import { BookOpen } from "lucide-react";

export default function LearnPage() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <Header />
      <TickerMarquee />

      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
          <BookOpen size={28} strokeWidth={1.5} className="text-muted-foreground" />
        </div>
        <h1 className="text-[20px] font-semibold text-foreground">Learn</h1>
        <p className="text-center text-[15px] text-muted-foreground">
          Courses, guides, and tutorials — coming soon.
        </p>
      </main>

      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}
