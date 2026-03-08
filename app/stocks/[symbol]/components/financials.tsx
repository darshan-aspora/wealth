"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AIAnnotation } from "./ai-annotation";
import { FINANCIALS } from "./mock-data";

interface FinancialsProps {
  symbol: string;
}

export function Financials({ symbol }: FinancialsProps) {
  const data = FINANCIALS[symbol];
  const [view, setView] = useState<"quarterly" | "annual">("quarterly");

  if (!data) {
    return (
      <div className="px-4 py-4">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          Financials
        </h2>
        <p className="text-[14px] italic text-muted-foreground">Financial data not yet available for this stock.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          Financials
        </h2>
        {/* Toggle */}
        <div className="flex rounded-lg bg-secondary/40 p-0.5">
          {(["quarterly", "annual"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "relative rounded-md px-3 py-1 text-[13px] font-medium transition-colors",
                view === v ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {view === v && (
                <motion.div
                  layoutId="financial-toggle"
                  className="absolute inset-0 rounded-md bg-secondary"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue bars */}
      <BarSection
        title="Revenue"
        values={data.revenue.values}
        periods={data.revenue.periods}
        unit="B"
      />

      {/* Net Income bars */}
      <div className="mt-5">
        <BarSection
          title="Net Income"
          values={data.netIncome.values}
          periods={data.netIncome.periods}
          unit="B"
        />
      </div>

      {/* AI Summary */}
      <div className="mt-4">
        <AIAnnotation size="md">{data.aiSummary}</AIAnnotation>
      </div>

      {/* Deep dive pills */}
      <div className="mt-4 flex gap-2">
        {["Income Statement", "Balance Sheet", "Cash Flow"].map((label) => (
          <button
            key={label}
            className="flex-1 rounded-xl border border-border/60 py-2.5 text-center text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BarSection({
  title,
  values,
  periods,
  unit,
}: {
  title: string;
  values: number[];
  periods: string[];
  unit: string;
}) {
  const maxVal = Math.max(...values);

  return (
    <div>
      <p className="mb-3 text-[14px] font-medium text-foreground">{title}</p>
      <div className="space-y-2.5">
        {values.map((val, i) => {
          const prevVal = values[i + 1]; // previous period
          const growing = prevVal !== undefined ? val >= prevVal : true;
          const barWidth = (val / maxVal) * 100;

          return (
            <div key={periods[i]} className="flex items-center gap-3">
              <span className="w-[52px] shrink-0 text-[13px] text-muted-foreground">
                {periods[i]}
              </span>
              <div className="flex-1">
                <motion.div
                  className={cn(
                    "h-6 rounded-r-md",
                    growing ? "bg-[hsl(var(--gain))]/25" : "bg-[hsl(var(--loss))]/25",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.08 }}
                />
              </div>
              <span className="w-[56px] shrink-0 text-right font-mono text-[14px] font-medium tabular-nums text-foreground">
                ${val}{unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
