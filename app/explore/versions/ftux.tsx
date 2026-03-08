"use client";

import { Hero } from "../components/hero";
import { ProductShowcase } from "../components/product-showcase";
import { AiCompanion } from "../components/ai-companion";
import { LearningJourney } from "../components/learning-journey";
import { EmotionalBridge } from "../components/emotional-bridge";
import { TradersEdge } from "../components/traders-edge";
import { Pricing } from "../components/pricing";
import { UnderTheHood } from "../components/under-the-hood";
import { TheClose } from "../components/the-close";
import { StickyOpenAccount } from "../components/sticky-open-account";

export function ExploreFTUX() {
  return (
    <>
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
    </>
  );
}
