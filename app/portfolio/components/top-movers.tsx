"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TOP_GAINERS, TOP_LOSERS, type PortfolioMover } from "./portfolio-mock-data";

function MoverRow({ mover }: { mover: PortfolioMover }) {
  const displaySymbol = mover.symbol.slice(0, 2);

  return (
    <div className="flex items-center gap-3 py-3">
      {/* Logo */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white",
          mover.logoColor
        )}
      >
        {displaySymbol}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold text-foreground truncate">
            {mover.symbol}
          </p>
          <p className="text-[15px] font-semibold tabular-nums text-foreground ml-2">
            {mover.ltp.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[13px] text-muted-foreground truncate">
            {mover.name}
          </p>
          <p
            className={cn(
              "text-[14px] font-semibold tabular-nums ml-2",
              mover.pnlPct >= 0 ? "text-gain" : "text-loss"
            )}
          >
            {mover.pnlPct >= 0 ? "+" : ""}
            {mover.pnlPct}%
          </p>
        </div>
      </div>
    </div>
  );
}

export function TopGainers() {
  return (
    <Card className="border-border/50 shadow-none">
      <CardHeader className="p-5 pb-1">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-gain" />
          <CardTitle className="text-[15px]">Top Gainers</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {TOP_GAINERS.map((m, i) => (
          <div key={m.symbol}>
            {i > 0 && <Separator className="bg-border/30" />}
            <MoverRow mover={m} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TopLosers() {
  return (
    <Card className="border-border/50 shadow-none">
      <CardHeader className="p-5 pb-1">
        <div className="flex items-center gap-2">
          <TrendingDown size={18} className="text-loss" />
          <CardTitle className="text-[15px]">Top Losers</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {TOP_LOSERS.map((m, i) => (
          <div key={m.symbol}>
            {i > 0 && <Separator className="bg-border/30" />}
            <MoverRow mover={m} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
