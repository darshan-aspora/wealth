"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Bell } from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { OptionsMenu } from "@/components/header";
import { Button } from "@/components/ui/button";

function StocksHeader() {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-5 py-3">
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft size={20} strokeWidth={2} />
      </Button>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-muted-foreground"
          onClick={() => router.push("/search")}
        >
          <Search size={20} strokeWidth={1.8} />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="relative rounded-full text-muted-foreground"
        >
          <Bell size={20} strokeWidth={1.8} />
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-background">
            3
          </span>
        </Button>

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
