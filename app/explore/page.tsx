"use client";

import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Header } from "@/components/header";
import { TickerMarquee } from "@/components/ticker";
import { BottomNavV2 } from "@/components/bottom-nav";
import { Hero } from "./components/hero";
import { ProductShowcase } from "./components/product-showcase";
import { AiCompanion } from "./components/ai-companion";
import { LearningJourney } from "./components/learning-journey";
import { EmotionalBridge } from "./components/emotional-bridge";
import { TradersEdge } from "./components/traders-edge";
import { Pricing } from "./components/pricing";
import { UnderTheHood } from "./components/under-the-hood";
import { TheClose } from "./components/the-close";
import { StickyOpenAccount } from "./components/sticky-open-account";

export default function ExplorePage() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <TickerMarquee />
      <Header />

      <main className="no-scrollbar flex-1 overflow-y-auto">
        <Hero />
        <ProductShowcase />
        <AiCompanion />
        <LearningJourney />
        <EmotionalBridge />
        <TradersEdge />
        <Pricing />
        <UnderTheHood />
        <TheClose />
        <StickyOpenAccount />
      </main>

      <BottomNavV2 />
      <HomeIndicator />
    </div>
  );
}
