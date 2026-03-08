"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AIAnnotation } from "./ai-annotation";
import { OWNERSHIP } from "./mock-data";

interface OwnershipProps {
  symbol: string;
}

export function Ownership({ symbol }: OwnershipProps) {
  const data = OWNERSHIP[symbol];
  if (!data) return null;

  return (
    <div className="px-4 py-4">
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        Ownership
      </h2>

      {/* Stacked bar */}
      <div className="mb-3">
        <div className="flex h-3 overflow-hidden rounded-full">
          <div
            className="bg-blue-500"
            style={{ width: `${data.breakdown.institutions}%` }}
          />
          <div
            className="bg-amber-500"
            style={{ width: `${data.breakdown.insiders}%` }}
          />
          <div
            className="bg-muted-foreground/30"
            style={{ width: `${data.breakdown.retail}%` }}
          />
        </div>
        <div className="mt-2 flex gap-4">
          <Legend color="bg-blue-500" label="Institutions" value={data.breakdown.institutions} />
          <Legend color="bg-amber-500" label="Insiders" value={data.breakdown.insiders} />
          <Legend color="bg-muted-foreground/30" label="Retail" value={data.breakdown.retail} />
        </div>
      </div>

      {/* Top Holders */}
      <div className="mt-5">
        <p className="mb-3 text-[14px] font-medium text-foreground">Top Holders</p>
        <div className="space-y-3">
          {data.topHolders.map((holder) => {
            const positive = holder.change > 0;
            const flat = holder.change === 0;
            return (
              <div key={holder.name} className="flex items-center justify-between">
                <span className="text-[15px] text-foreground">{holder.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[14px] tabular-nums text-foreground">
                    {holder.percent}%
                  </span>
                  {!flat && (
                    <span
                      className={cn(
                        "flex items-center gap-0.5 font-mono text-[13px] tabular-nums",
                        positive ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]",
                      )}
                    >
                      {positive ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {positive ? "+" : ""}{holder.change}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insider Activity */}
      {data.insiderActivity.length > 0 && (
        <div className="mt-5">
          <p className="mb-3 text-[14px] font-medium text-foreground">
            Insider Activity <span className="text-muted-foreground">(90 days)</span>
          </p>
          {data.insiderActivity.map((activity, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[15px] font-medium text-foreground">{activity.name}</span>
                <span className="text-[13px] text-muted-foreground">{activity.date}</span>
              </div>
              <p className="mb-2 text-[14px] text-muted-foreground">
                {activity.action}{" "}
                <span className="font-semibold text-foreground">{activity.amount}</span>
              </p>
              <AIAnnotation>{activity.annotation}</AIAnnotation>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
      <span className="text-[13px] text-muted-foreground">
        {label} {value}%
      </span>
    </div>
  );
}
