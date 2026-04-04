"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { WatchlistContent } from "@/app/watchlist/watchlist-full";

export default function HomeV3Watchlist() {
  const router = useRouter();

  return (
    <>
      <WatchlistContent />
      {/* Spacer so content doesn't hide behind the FAB */}
      <div className="h-16" />
      {/* Floating add button — positioned via portal-like absolute in layout's main */}
      <div className="sticky bottom-0 pointer-events-none z-20 -mt-16">
        <div className="flex justify-end px-5 pb-4 pointer-events-none">
          <button
            onClick={() => router.push("/search")}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-90"
          >
            <Plus size={22} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}
