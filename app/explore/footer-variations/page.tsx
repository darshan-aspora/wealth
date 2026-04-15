"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import {
  ExploreFooterV1,
  ExploreFooterV2,
  ExploreFooterV3,
  ExploreFooterV4,
  ExploreFooterV5,
} from "../components/footer-variations";

const VARIATIONS = [
  {
    id: "v1",
    name: "V1 — Editorial",
    blurb: "Magazine back-page. Left-aligned hero, numbered index rows, outlined contact cards.",
    Component: ExploreFooterV1,
  },
  {
    id: "v2",
    name: "V2 — Tactile Cards",
    blurb: "Soft gradient backdrop, elevated cards with accent stripes, chip-style trust badges.",
    Component: ExploreFooterV2,
  },
  {
    id: "v3",
    name: "V3 — Swiss Grid",
    blurb: "Monochrome, hairline rules, strict 12-column grid. Calm and architectural.",
    Component: ExploreFooterV3,
  },
  {
    id: "v4",
    name: "V4 — Inverted Hero",
    blurb: "Dark premium hero block up top, clean light rows below, ribbon-divided contacts.",
    Component: ExploreFooterV4,
  },
  {
    id: "v5",
    name: "V5 — Warm Conversational",
    blurb: "Pill-heavy, hero CTA emphasized, voice feels like a friend. Rounded everywhere.",
    Component: ExploreFooterV5,
  },
];

export default function FooterVariationsPage() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Header */}
      <div className="border-b border-border/40 px-5 pt-3 pb-4 bg-background">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Explore
        </Link>
        <h1 className="mt-2 text-[22px] font-bold text-foreground tracking-tight">
          Footer Variations
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground leading-snug">
          Same structure — five visual directions. Scroll to compare.
        </p>
      </div>

      <main className="no-scrollbar flex-1 overflow-y-auto">
        {VARIATIONS.map(({ id, name, blurb, Component }) => (
          <section key={id} className="border-b border-border/40">
            {/* Label strip */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-5 py-3">
              <p className="text-[13px] font-bold text-foreground">{name}</p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">{blurb}</p>
            </div>

            {/* Variation — rendered in the same px-5 context used on /explore */}
            <div className="px-5 pt-2 pb-6">
              <Component />
            </div>
          </section>
        ))}

        <HomeIndicator />
      </main>
    </div>
  );
}
