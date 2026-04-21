"use client";

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

export function PortfolioOverview() {
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
