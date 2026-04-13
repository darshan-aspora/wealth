"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { AddFundsHeroV1 } from "@/components/add-funds-hero-v1";
import { AddFundsHeroV2 } from "@/components/add-funds-hero-v2";
import { AddFundsHeroV3 } from "@/components/add-funds-hero-v3";
import { AddFundsHeroV4 } from "@/components/add-funds-hero-v4";

const versions = [
  {
    name: "V1 — Editorial",
    note: "Magazine cover. Oversized 00, rotated label, print-spread hierarchy.",
    component: AddFundsHeroV1,
  },
  {
    name: "V2 — Duet",
    note: "Two tiles, two worlds. Linen-paper USD vs iridescent stablecoin.",
    component: AddFundsHeroV2,
  },
  {
    name: "V3 — Aperture",
    note: "Cinematic. A breathing lens of light. Deposit as opening a shutter.",
    component: AddFundsHeroV3,
  },
  {
    name: "V4 — Totem",
    note: "3D coin stack. Flips between rails. Minted, tactile, playful.",
    component: AddFundsHeroV4,
  },
];

export default function AddFundsExplore() {
  const [active, setActive] = useState(0);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">
            Add Funds Hero
          </h1>
          <p className="text-[13px] text-muted-foreground">
            KYC complete · 4 versions
          </p>
        </div>
      </div>

      {/* Version picker */}
      <div className="overflow-x-auto no-scrollbar border-b border-border/40">
        <div className="flex gap-0 px-5">
          {versions.map((v, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors",
                active === i
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
            >
              V{i + 1}
              {active === i && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        <div className="px-5 pt-4">
          <p className="text-[14px] font-semibold text-foreground">
            {versions[active].name}
          </p>
          <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
            {versions[active].note}
          </p>
        </div>

        {(() => {
          const Comp = versions[active].component;
          return <Comp />;
        })()}

        {/* Mock content below to show in-feed context */}
        <div className="px-5 pt-6 space-y-4">
          <div className="h-[60px] rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">
              Popular Stocks widget below
            </span>
          </div>
          <div className="h-[60px] rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">
              Quick Access widget below
            </span>
          </div>
          <div className="h-[200px] rounded-2xl bg-muted/50 flex items-center justify-center">
            <span className="text-[13px] text-muted-foreground/40">
              What&apos;s Moving widget below
            </span>
          </div>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
