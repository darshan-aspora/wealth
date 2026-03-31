"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AIAnnotation } from "./ai-annotation";

// ─── Revenue Mock Data ──────────────────────────────────────────────────────

interface RevenueYearlyData {
  revenue: { values: number[]; periods: string[] };
  revenueQuarterly: { values: number[]; periods: string[] };
  cagr: number;
  lastYearGrowth: number;
  segments: {
    business: { label: string; percent: number; color: string }[];
    products: { label: string; percent: number; color: string }[];
  };
  netIncome: { values: number[]; periods: string[] };
  netIncomeQuarterly: { values: number[]; periods: string[] };
  netProfitMargin: { yearly: number; yoyChange: number };
  netIncomeYearly: { value: number; yoyChange: number };
  aiSummary: string;
}

const REVENUE_DATA: Record<string, RevenueYearlyData> = {
  AAPL: {
    revenue: { values: [424.5, 394.3, 383.3, 365.8, 394.3], periods: ["2025", "2024", "2023", "2022", "2021"] },
    revenueQuarterly: { values: [124.3, 94.8, 85.8, 119.6], periods: ["Q1 '26", "Q4 '25", "Q3 '25", "Q2 '25"] },
    cagr: 7.8,
    lastYearGrowth: 7.7,
    segments: {
      business: [
        { label: "iPhone", percent: 52, color: "hsl(210, 90%, 60%)" },
        { label: "Services", percent: 24, color: "hsl(150, 70%, 50%)" },
        { label: "Mac", percent: 10, color: "hsl(35, 90%, 55%)" },
        { label: "iPad & Wearables", percent: 14, color: "hsl(270, 60%, 60%)" },
      ],
      products: [
        { label: "Hardware", percent: 76, color: "hsl(210, 90%, 60%)" },
        { label: "Services", percent: 24, color: "hsl(150, 70%, 50%)" },
      ],
    },
    netIncome: { values: [115.7, 100.9, 97.0, 94.7, 94.7], periods: ["2025", "2024", "2023", "2022", "2021"] },
    netIncomeQuarterly: { values: [36.3, 24.8, 21.4, 33.7], periods: ["Q1 '26", "Q4 '25", "Q3 '25", "Q2 '25"] },
    netProfitMargin: { yearly: 27.3, yoyChange: 1.8 },
    netIncomeYearly: { value: 115.7, yoyChange: 14.7 },
    aiSummary: "Services revenue hit a record 24% of total, with 44% gross margins fueling margin expansion despite slower iPhone unit growth.",
  },
  NVDA: {
    revenue: { values: [130.5, 60.9, 27.0, 27.0, 26.9], periods: ["2025", "2024", "2023", "2022", "2021"] },
    revenueQuarterly: { values: [39.3, 35.1, 30.0, 26.0], periods: ["Q4 '26", "Q3 '26", "Q2 '26", "Q1 '26"] },
    cagr: 48.6,
    lastYearGrowth: 114.2,
    segments: {
      business: [
        { label: "Data Center", percent: 83, color: "hsl(150, 70%, 50%)" },
        { label: "Gaming", percent: 10, color: "hsl(210, 90%, 60%)" },
        { label: "Pro Visualization", percent: 4, color: "hsl(35, 90%, 55%)" },
        { label: "Automotive & Others", percent: 3, color: "hsl(270, 60%, 60%)" },
      ],
      products: [
        { label: "GPUs", percent: 91, color: "hsl(150, 70%, 50%)" },
        { label: "Software & Licensing", percent: 9, color: "hsl(210, 90%, 60%)" },
      ],
    },
    netIncome: { values: [72.9, 29.8, 4.4, 9.8, 9.7], periods: ["2025", "2024", "2023", "2022", "2021"] },
    netIncomeQuarterly: { values: [22.1, 19.3, 16.6, 14.9], periods: ["Q4 '26", "Q3 '26", "Q2 '26", "Q1 '26"] },
    netProfitMargin: { yearly: 55.9, yoyChange: 7.0 },
    netIncomeYearly: { value: 72.9, yoyChange: 144.6 },
    aiSummary: "Data Center revenue now 83% of total — AI infrastructure demand is transforming NVIDIA from a gaming company to an AI platform.",
  },
  MSFT: {
    revenue: { values: [261.8, 227.6, 211.9, 198.3, 168.1], periods: ["2025", "2024", "2023", "2022", "2021"] },
    revenueQuarterly: { values: [69.6, 65.6, 64.7, 62.0], periods: ["Q2 '26", "Q1 '26", "Q4 '25", "Q3 '25"] },
    cagr: 11.7,
    lastYearGrowth: 15.0,
    segments: {
      business: [
        { label: "Intelligent Cloud", percent: 43, color: "hsl(210, 90%, 60%)" },
        { label: "Productivity & Business", percent: 33, color: "hsl(150, 70%, 50%)" },
        { label: "More Personal Computing", percent: 24, color: "hsl(35, 90%, 55%)" },
      ],
      products: [
        { label: "Cloud & Services", percent: 76, color: "hsl(210, 90%, 60%)" },
        { label: "Devices & Licensing", percent: 24, color: "hsl(35, 90%, 55%)" },
      ],
    },
    netIncome: { values: [90.5, 72.4, 72.4, 72.7, 61.3], periods: ["2025", "2024", "2023", "2022", "2021"] },
    netIncomeQuarterly: { values: [24.1, 22.6, 22.0, 21.9], periods: ["Q2 '26", "Q1 '26", "Q4 '25", "Q3 '25"] },
    netProfitMargin: { yearly: 34.6, yoyChange: 2.8 },
    netIncomeYearly: { value: 90.5, yoyChange: 25.0 },
    aiSummary: "Azure + Copilot driving 15% top-line growth with expanding margins — the cloud transition is compounding.",
  },
  TSLA: {
    revenue: { values: [97.7, 96.8, 81.5, 81.5, 53.8], periods: ["2025", "2024", "2023", "2022", "2021"] },
    revenueQuarterly: { values: [25.7, 25.2, 23.4, 23.3], periods: ["Q4 '25", "Q3 '25", "Q2 '25", "Q1 '25"] },
    cagr: 16.1,
    lastYearGrowth: 0.9,
    segments: {
      business: [
        { label: "Automotive", percent: 78, color: "hsl(210, 90%, 60%)" },
        { label: "Energy & Storage", percent: 12, color: "hsl(150, 70%, 50%)" },
        { label: "Services & Others", percent: 10, color: "hsl(35, 90%, 55%)" },
      ],
      products: [
        { label: "Vehicles", percent: 78, color: "hsl(210, 90%, 60%)" },
        { label: "Energy Products", percent: 12, color: "hsl(150, 70%, 50%)" },
        { label: "Services", percent: 10, color: "hsl(35, 90%, 55%)" },
      ],
    },
    netIncome: { values: [7.9, 15.0, 7.9, 12.6, 5.5], periods: ["2025", "2024", "2023", "2022", "2021"] },
    netIncomeQuarterly: { values: [2.3, 2.2, 1.8, 1.6], periods: ["Q4 '25", "Q3 '25", "Q2 '25", "Q1 '25"] },
    netProfitMargin: { yearly: 8.1, yoyChange: -7.4 },
    netIncomeYearly: { value: 7.9, yoyChange: -47.3 },
    aiSummary: "Revenue nearly flat YoY but Energy segment doubled — the margin story is shifting from autos to energy and software.",
  },
};

// ─── Toggle Component ───────────────────────────────────────────────────────

function PillToggle({
  options,
  selected,
  onSelect,
  layoutId,
}: {
  options: readonly string[];
  selected: string;
  onSelect: (v: string) => void;
  layoutId: string;
}) {
  return (
    <div className="flex rounded-lg bg-secondary/40 p-0.5">
      {options.map((v) => (
        <button
          key={v}
          onClick={() => onSelect(v)}
          className={cn(
            "relative rounded-md px-3 py-1 text-[15px] font-medium transition-colors",
            selected === v ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {selected === v && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-md bg-secondary"
              style={{ zIndex: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          {v}
        </button>
      ))}
    </div>
  );
}

// ─── Animated Bar Chart ─────────────────────────────────────────────────────

function RevenueBarChart({
  values,
  periods,
  unit = "B",
  animationKey,
}: {
  values: number[];
  periods: string[];
  unit?: string;
  animationKey: string;
}) {
  const maxVal = Math.max(...values);

  return (
    <div className="space-y-3">
      {values.map((val, i) => {
        const prevVal = values[i + 1];
        const growing = prevVal !== undefined ? val >= prevVal : true;
        const barWidth = (val / maxVal) * 100;

        return (
          <div key={`${animationKey}-${periods[i]}`} className="flex items-center gap-3">
            <span className="w-[56px] shrink-0 text-[15px] text-muted-foreground">
              {periods[i]}
            </span>
            <div className="flex-1">
              <motion.div
                className={cn(
                  "h-7 rounded-r-md",
                  growing ? "bg-[hsl(var(--gain))]/25" : "bg-[hsl(var(--loss))]/25",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: i * 0.08,
                }}
              />
            </div>
            <span className="w-[60px] shrink-0 text-right text-[15px] font-medium tabular-nums text-foreground">
              {val}{unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut / Segment Ring ───────────────────────────────────────────────────

function DonutChart({
  segments,
  size = 120,
}: {
  segments: { label: string; percent: number; color: string }[];
  size?: number;
}) {
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {segments.map((seg, i) => {
        const offset = circumference * (1 - cumulativePercent / 100);
        const segLength = circumference * (seg.percent / 100);
        cumulativePercent += seg.percent;

        return (
          <motion.circle
            key={seg.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segLength} ${circumference - segLength}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.12, duration: 0.4 }}
          />
        );
      })}
    </svg>
  );
}

function SegmentBreakdown({
  title,
  segments,
}: {
  title: string;
  segments: { label: string; percent: number; color: string }[];
}) {
  return (
    <div className="flex items-center gap-5">
      <DonutChart segments={segments} size={110} />
      <div className="flex-1 space-y-2">
        <p className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="flex-1 text-[15px] text-foreground">{seg.label}</span>
            <span className="text-[15px] font-medium tabular-nums text-muted-foreground">
              {seg.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats Row ──────────────────────────────────────────────────────────────

function StatsCard({
  items,
}: {
  items: { label: string; value: string; positive?: boolean }[];
}) {
  return (
    <div className="flex gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex-1 rounded-xl border border-border/60 px-5 py-3"
        >
          <p className="text-[13px] text-muted-foreground">{item.label}</p>
          <p
            className={cn(
              "mt-1 text-[19px] font-semibold tabular-nums",
              item.positive === true
                ? "text-gain"
                : item.positive === false
                ? "text-loss"
                : "text-foreground",
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Profit Table Row ───────────────────────────────────────────────────────

function ProfitMetricRow({
  label,
  value,
  yoyChange,
}: {
  label: string;
  value: string;
  yoyChange: number;
}) {
  const isPositive = yoyChange >= 0;
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-b-0">
      <span className="text-[15px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[15px] font-medium tabular-nums text-foreground">
          {value}
        </span>
        <span
          className={cn(
            "text-[14px] tabular-nums",
            isPositive ? "text-gain" : "text-loss",
          )}
        >
          {isPositive ? "+" : ""}
          {yoyChange.toFixed(1)}% Y/Y
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function RevenueTab({ symbol }: { symbol: string }) {
  const data = REVENUE_DATA[symbol] || REVENUE_DATA["AAPL"];
  const [revenueView, setRevenueView] = useState<string>("Yearly");
  const [profitView, setProfitView] = useState<string>("Yearly");

  const revenueValues = revenueView === "Yearly" ? data.revenue.values : data.revenueQuarterly.values;
  const revenuePeriods = revenueView === "Yearly" ? data.revenue.periods : data.revenueQuarterly.periods;
  const profitValues = profitView === "Yearly" ? data.netIncome.values : data.netIncomeQuarterly.values;
  const profitPeriods = profitView === "Yearly" ? data.netIncome.periods : data.netIncomeQuarterly.periods;

  return (
    <div className="divide-y divide-border/40">
      {/* Revenue Section */}
      <div className="px-5 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-foreground">Revenue</h2>
          <PillToggle
            options={["Yearly", "Quarterly"] as const}
            selected={revenueView}
            onSelect={setRevenueView}
            layoutId="revenue-toggle"
          />
        </div>
        <RevenueBarChart
          values={revenueValues}
          periods={revenuePeriods}
          unit="B"
          animationKey={`rev-${revenueView}`}
        />
      </div>

      {/* CAGR & Growth Stats */}
      <div className="px-5 py-5">
        <StatsCard
          items={[
            {
              label: "5Y CAGR",
              value: `${data.cagr}%`,
              positive: data.cagr > 0,
            },
            {
              label: "Last Year Growth",
              value: `${data.lastYearGrowth > 0 ? "+" : ""}${data.lastYearGrowth}%`,
              positive: data.lastYearGrowth > 0,
            },
          ]}
        />
      </div>

      {/* Segment Break-Up */}
      <div className="px-5 py-5">
        <h2 className="mb-5 text-[17px] font-semibold text-foreground">Segment Break-Up</h2>
        <div className="space-y-6">
          <SegmentBreakdown title="By Business" segments={data.segments.business} />
          <SegmentBreakdown title="By Products" segments={data.segments.products} />
        </div>
      </div>

      {/* Profits Section */}
      <div className="px-5 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-foreground">Profits</h2>
          <PillToggle
            options={["Yearly", "Quarterly"] as const}
            selected={profitView}
            onSelect={setProfitView}
            layoutId="profit-toggle"
          />
        </div>
        <RevenueBarChart
          values={profitValues}
          periods={profitPeriods}
          unit="B"
          animationKey={`profit-${profitView}`}
        />

        {/* Profit metrics */}
        <div className="mt-5">
          <ProfitMetricRow
            label="Net Income"
            value={`${data.netIncomeYearly.value}B`}
            yoyChange={data.netIncomeYearly.yoyChange}
          />
          <ProfitMetricRow
            label="Net Profit Margin"
            value={`${data.netProfitMargin.yearly}%`}
            yoyChange={data.netProfitMargin.yoyChange}
          />
        </div>
      </div>

      {/* AI Summary */}
      <div className="px-5 py-5">
        <AIAnnotation size="md">{data.aiSummary}</AIAnnotation>
      </div>
    </div>
  );
}
