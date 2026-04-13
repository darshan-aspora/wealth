"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ETFCardVariantsShowcase } from "@/components/etf-card-variants";

export default function ETFCardsPreviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </Link>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-foreground">
              ETF Card Variants
            </h1>
            <p className="text-[14px] text-muted-foreground">
              5 layout explorations
            </p>
          </div>
        </div>

        {/* Showcase */}
        <div className="px-5">
          <ETFCardVariantsShowcase />
        </div>
      </div>
    </div>
  );
}
