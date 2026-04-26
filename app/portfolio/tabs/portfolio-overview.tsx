"use client";

import { useRouter } from "next/navigation";
import { PortfolioSummary } from "../components/portfolio-summary";
import { PortfolioPerformance } from "../components/portfolio-performance";
import { PositionsSummary } from "../components/positions-summary";
import { RealisedPnl } from "../components/realised-pnl";
import { BuyingPower } from "../components/buying-power";
import { AssetClassPerformance } from "../components/asset-class-performance";
import { PnlCalendar } from "../components/pnl-calendar";
import { TopMovers } from "../components/top-movers";
import { MarketCapBreakdown } from "../components/market-cap-breakdown";
import { SectorAllocation } from "../components/sector-allocation";
import { ActiveSips } from "../components/active-sips";

export function PortfolioOverview({ empty }: { empty?: boolean }) {
  const router = useRouter();
  if (empty) {
    return (
      <div className="pb-24 px-5 pt-4">
        {/* Ghost summary card */}
        <div className="rounded-3xl border border-border/40 bg-background overflow-hidden mb-4">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[12px] text-muted-foreground mb-1">Portfolio Value</p>
                <p className="text-[32px] font-bold text-foreground/15 tabular-nums leading-none">$0.00</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-muted-foreground mb-1">Today</p>
                <p className="text-[18px] font-bold text-foreground/15">+$0.00</p>
              </div>
            </div>
            {/* Ghost chart */}
            <div className="relative h-[72px]">
              <svg viewBox="0 0 300 60" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="ghostGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 40 Q50 38 100 40 Q150 42 200 40 Q250 38 300 40 L300 60 L0 60 Z" fill="url(#ghostGrad)" className="text-foreground" />
                <path d="M0 40 Q50 38 100 40 Q150 42 200 40 Q250 38 300 40" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground/20" strokeDasharray="4 3" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[12px] font-medium text-muted-foreground/60">Invest to see your growth chart</p>
              </div>
            </div>
          </div>
          {/* Ghost stat pills */}
          <div className="grid grid-cols-3 divide-x divide-border/30 border-t border-border/30">
            {[{ label: "Invested", val: "$0" }, { label: "Returns", val: "0.00%" }, { label: "XIRR", val: "–" }].map((s) => (
              <div key={s.label} className="px-3 py-3 text-center">
                <p className="text-[15px] font-bold text-foreground/15 tabular-nums">{s.val}</p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Start with */}
        <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Start with</p>
        <div className="space-y-2">
          {[
            { label: "US Stocks", sub: "Apple, Tesla, NVIDIA & more", href: "/home-v3" },
            { label: "ETFs", sub: "S&P 500, QQQ, sector funds", href: "/home-v3" },
            { label: "Global ETFs", sub: "Europe, Asia & emerging markets", href: "/home-v3" },
          ].map((item) => (
            <button key={item.label} onClick={() => router.push(item.href)} className="w-full flex items-center justify-between rounded-2xl border border-border/40 bg-background px-4 py-4 active:bg-muted/30 transition-colors">
              <div className="text-left">
                <p className="text-[14px] font-semibold text-foreground">{item.label}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
              <span className="text-muted-foreground/40 text-lg">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-5 pb-24">
      <PortfolioSummary />
      <PortfolioPerformance />
      <PositionsSummary />
      <RealisedPnl />
      <BuyingPower />
      <AssetClassPerformance />
      <PnlCalendar />
      <TopMovers />
      <MarketCapBreakdown />
      <SectorAllocation />
      <ActiveSips />
    </div>
  );
}
