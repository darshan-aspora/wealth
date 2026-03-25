"use client";

import { PortfolioSummary } from "../components/portfolio-summary";
import { BuyingPower } from "../components/buying-power";
import { TopGainers, TopLosers } from "../components/top-movers";
import { AssetClassPerformance } from "../components/asset-class-performance";
import { LumpsumVsSip } from "../components/lumpsum-vs-sip";
import { PortfolioVsBenchmark } from "../components/portfolio-vs-benchmark";
import { TaxLotAwareness } from "../components/tax-lot-awareness";
import { PnlCalendar } from "../components/pnl-calendar";

export function PortfolioOverview() {
  return (
    <div className="space-y-4 px-5 pb-6">
      <PortfolioSummary />
      <BuyingPower />
      <TopGainers />
      <TopLosers />
      <AssetClassPerformance />
      <LumpsumVsSip />
      <PortfolioVsBenchmark />
      <TaxLotAwareness />
      <PnlCalendar />
    </div>
  );
}
