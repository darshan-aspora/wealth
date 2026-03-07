"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Bell } from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { OptionsMenu } from "@/components/header";

function StocksHeader() {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <button
        onClick={() => router.back()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
      >
        <ArrowLeft size={20} strokeWidth={2} />
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={() => router.push("/search")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
        >
          <Search size={20} strokeWidth={1.8} />
        </button>

        <button className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          <Bell size={20} strokeWidth={1.8} />
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-background">
            3
          </span>
        </button>

        <OptionsMenu />
      </div>
    </header>
  );
}

export default function StocksPage() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />
      <StocksHeader />

      <main className="no-scrollbar flex-1 overflow-y-auto">
        {/* Stocks content goes here */}
      </main>

      <HomeIndicator />
    </div>
  );
}
