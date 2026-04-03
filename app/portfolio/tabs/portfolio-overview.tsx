"use client";

import { PortfolioSummary } from "../components/portfolio-summary";
import { PositionsSummary } from "../components/positions-summary";
import { BuyingPower } from "../components/buying-power";
import { PortfolioVsBenchmark } from "../components/portfolio-vs-benchmark";
import { TopMovers } from "../components/top-movers";
import { AssetClassPerformance } from "../components/asset-class-performance";
import { MarketCapBreakdown } from "../components/market-cap-breakdown";
import { SectorAllocation } from "../components/sector-allocation";
import { InvestmentStyleBreakdown } from "../components/investment-style-breakdown";
import { InvestmentTypeBreakdown } from "../components/investment-type-breakdown";
import { TaxLotAwareness } from "../components/tax-lot-awareness";
import { PnlCalendar } from "../components/pnl-calendar";

export function PortfolioOverview() {
  return (
    <div className="space-y-4 px-5 pb-6">
      <PortfolioSummary />
      <PositionsSummary />
      <BuyingPower />
      <PortfolioVsBenchmark />
      <AssetClassPerformance />
      <InvestmentStyleBreakdown />
      <InvestmentTypeBreakdown />
      <TopMovers />
      <PnlCalendar />
      <TaxLotAwareness />
      <MarketCapBreakdown />
      <SectorAllocation />
    </div>
  );
}
