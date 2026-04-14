"use client";

import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { QuickAccessV3Showcase } from "@/components/quick-access-v3";

export default function QuickAccessV3Page() {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      <StatusBar />

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-border/40">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold tracking-tight text-foreground flex items-center gap-2">
            Quick Access 3.0
            <Zap size={16} className="text-foreground/60" fill="currentColor" />
          </h1>
          <p className="text-[12px] text-muted-foreground">
            3 tools + living AI row · 5 text-flipping variations
          </p>
        </div>
      </div>

      {/* Showcase */}
      <div className="flex-1 px-5 pt-6 pb-16">
        <QuickAccessV3Showcase />
      </div>

      <HomeIndicator />
    </div>
  );
}
