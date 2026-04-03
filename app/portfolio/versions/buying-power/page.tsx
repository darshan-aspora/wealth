"use client";

import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { BUYING_POWER_VARIATIONS } from "../../components/buying-power-variations";

export default function BuyingPowerVariations() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pt-4 pb-2">
          <h1 className="text-[20px] font-bold text-foreground">Buying Power — Variations</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Pick a layout direction.</p>
        </div>

        <div className="space-y-8 px-5 pb-10">
          {BUYING_POWER_VARIATIONS.map(({ name, component: Comp }) => (
            <div key={name}>
              <p className="text-[13px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{name}</p>
              <Comp />
            </div>
          ))}
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}
