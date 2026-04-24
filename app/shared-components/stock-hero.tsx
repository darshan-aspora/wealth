"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, CandlestickChart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TickerLogo, formatPrice, formatChange, formatPercent, isGain, type TickerItem } from "@/components/ticker";
import { StockChart } from "./stock-chart";
import { AIAnnotation } from "./ai-annotation";
import { getAIOneLiner, generateChartData, type ChartTimeframe } from "./mock-data";

const TIMEFRAMES: ChartTimeframe[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y", "ALL"];

interface StockHeroProps {
  ticker: TickerItem;
}

export function StockHero({ ticker }: StockHeroProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>("1D");
  const [chartType, setChartType] = useState<"line" | "candle">("line");
  const [showVolume, setShowVolume] = useState(false);

  const gain = isGain(ticker);
  const oneLiner = getAIOneLiner(ticker.symbol);

  const chartData = useMemo(
    () => generateChartData(ticker.symbol, timeframe, ticker.price, ticker.changePercent),
    [ticker.symbol, timeframe, ticker.price, ticker.changePercent],
  );

  return (
    <div className="px-5 pb-3 pt-1">
      {/* Identity */}
      <div className="flex items-center gap-3 mb-3">
        <TickerLogo ticker={ticker} size="md" />
        <div className="min-w-0 flex-1">
          <h1 className="text-[18px] font-semibold leading-tight text-foreground">
            {ticker.name}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[14px] text-muted-foreground">
              {ticker.symbol}
            </span>
            {ticker.exchange && (
              <span className="rounded-full bg-secondary/50 px-2 py-0.5 text-[12px] text-muted-foreground">
                {ticker.exchange}
              </span>
            )}
            <span className="rounded-full bg-secondary/50 px-2 py-0.5 text-[12px] text-muted-foreground">
              {ticker.type}
            </span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="mb-2">
        <div className="flex items-baseline gap-3">
          <span className="text-[36px] font-bold tabular-nums leading-none text-foreground">
            ${formatPrice(ticker.price)}
          </span>
          <span
            className={cn(
              "text-[17px] font-semibold tabular-nums",
              gain ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]",
            )}
          >
            {formatChange(ticker.change)} ({formatPercent(ticker.changePercent)})
          </span>
        </div>
      </div>

      {/* AI One-Liner */}
      <div className="mb-4">
        <AIAnnotation size="md">{oneLiner}</AIAnnotation>
      </div>

      {/* Chart */}
      <div className="mb-3 -mx-5">
        <StockChart
          data={chartData}
          chartType={chartType}
          showVolume={showVolume}
          isGain={gain}
        />
      </div>

      {/* Timeframe Bar + Chart Controls */}
      <div className="flex items-center justify-between">
        {/* Timeframes */}
        <div className="no-scrollbar flex gap-0.5 overflow-x-auto">
          {TIMEFRAMES.map((tf) => {
            const active = tf === timeframe;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "relative rounded-md px-2.5 py-1.5 text-[14px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {tf}
                {active && (
                  <motion.div
                    layoutId="timeframe-pill"
                    className="absolute inset-0 rounded-md bg-secondary/60"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Chart type toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setChartType("line")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              chartType === "line" ? "bg-secondary/60 text-foreground" : "text-muted-foreground",
            )}
          >
            <LineChart size={16} />
          </button>
          <button
            onClick={() => setChartType("candle")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              chartType === "candle" ? "bg-secondary/60 text-foreground" : "text-muted-foreground",
            )}
          >
            <CandlestickChart size={16} />
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={cn(
              "rounded-md p-1.5 text-[12px] font-medium transition-colors",
              showVolume ? "bg-secondary/60 text-foreground" : "text-muted-foreground",
            )}
          >
            <BarChart3 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
