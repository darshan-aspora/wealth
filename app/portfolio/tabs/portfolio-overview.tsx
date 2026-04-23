"use client";

import { LayoutDashboard } from "lucide-react";
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
import { EmptyState } from "../components/empty-state";

export function PortfolioOverview({ empty }: { empty?: boolean }) {
  if (empty) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="Your portfolio is empty"
        subtitle="Start investing to see your portfolio overview, performance charts, and insights here."
        actions={[
          { label: "Explore Stocks", href: "/home-v3", primary: true },
          { label: "Explore ETFs", href: "/home-v3" },
        ]}
      />
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
