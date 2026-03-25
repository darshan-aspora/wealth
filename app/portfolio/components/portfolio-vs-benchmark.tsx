"use client";

import { cn } from "@/lib/utils";
import { Target } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BENCHMARK_DATA, type BenchmarkMetric } from "./portfolio-mock-data";

function MetricRow({ metric }: { metric: BenchmarkMetric }) {
  const portfolioBetter =
    metric.label === "Max Drawdown" || metric.label === "Volatility"
      ? metric.portfolio <= metric.benchmark
      : metric.portfolio >= metric.benchmark;

  const delta = metric.portfolio - metric.benchmark;
  const showDelta = metric.label !== "Alpha";

  // Bar widths — scale both relative to the larger value
  const maxVal = Math.max(
    Math.abs(metric.portfolio),
    Math.abs(metric.benchmark)
  );
  const portfolioWidth =
    maxVal > 0 ? (Math.abs(metric.portfolio) / maxVal) * 100 : 0;
  const benchmarkWidth =
    maxVal > 0 ? (Math.abs(metric.benchmark) / maxVal) * 100 : 0;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] text-muted-foreground">{metric.label}</p>
        {showDelta && delta !== 0 && (
          <Badge
            variant="secondary"
            className={cn(
              "text-[12px] tabular-nums border-transparent",
              portfolioBetter
                ? "bg-gain/12 text-gain"
                : "bg-loss/12 text-loss"
            )}
          >
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(2)}
            {metric.unit}
          </Badge>
        )}
      </div>

      {/* Dual bars */}
      <div className="space-y-1.5">
        {/* Portfolio bar */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground/60 w-[28px] shrink-0">
            You
          </span>
          <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${portfolioWidth}%` }}
            />
          </div>
          <span className="text-[13px] font-semibold tabular-nums text-foreground w-[52px] text-right">
            {metric.portfolio}
            {metric.unit}
          </span>
        </div>

        {/* Benchmark bar */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground/60 w-[28px] shrink-0">
            S&P
          </span>
          <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-muted-foreground/40"
              style={{ width: `${benchmarkWidth}%` }}
            />
          </div>
          <span className="text-[13px] font-medium tabular-nums text-muted-foreground w-[52px] text-right">
            {metric.benchmark === 0
              ? "—"
              : `${metric.benchmark}${metric.unit}`}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PortfolioVsBenchmark() {
  const { benchmarkName, period, metrics } = BENCHMARK_DATA;

  const returnMetric = metrics.find((m) => m.label === "Return");
  const beating = returnMetric
    ? returnMetric.portfolio >= returnMetric.benchmark
    : true;

  return (
    <Card className="border-border/50 shadow-none">
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-foreground" />
            <CardTitle className="text-[15px]">vs {benchmarkName}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-[12px]">
            {period}
          </Badge>
        </div>
        {/* Headline verdict */}
        <p
          className={cn(
            "text-[13px] font-medium",
            beating ? "text-gain" : "text-loss"
          )}
        >
          {beating
            ? `Beating the market by +${((returnMetric?.portfolio ?? 0) - (returnMetric?.benchmark ?? 0)).toFixed(1)}%`
            : `Trailing the market by ${((returnMetric?.benchmark ?? 0) - (returnMetric?.portfolio ?? 0)).toFixed(1)}%`}
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {metrics.map((metric, i) => (
          <div key={metric.label}>
            {i > 0 && <Separator className="bg-border/30" />}
            <MetricRow metric={metric} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
