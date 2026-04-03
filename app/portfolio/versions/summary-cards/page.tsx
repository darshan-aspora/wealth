"use client";

import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { VARIATIONS } from "../../components/portfolio-summary-variations";

export default function SummaryCardVariations() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pt-4 pb-2">
          <h1 className="text-[20px] font-bold text-foreground">Portfolio Card — Variations</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Pick a layout. All use Inter only.</p>
        </div>

        <div className="space-y-6 px-5 pb-10">
          {VARIATIONS.map(({ name, component: Comp }) => (
            <div key={name}>
              <p className="text-[13px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{name}</p>
              <Comp />
            </div>
          ))}
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}
