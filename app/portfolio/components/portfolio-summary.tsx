"use client";

import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PORTFOLIO_SUMMARY, PERIOD_RETURNS } from "./portfolio-mock-data";

export function PortfolioSummary() {
  const { currentValue, investedAmount, dayChange, dayChangePct, xirr } =
    PORTFOLIO_SUMMARY;

  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        <p className="text-[13px] text-muted-foreground">Current Value</p>
        <p className="mt-0.5 text-[32px] font-bold tabular-nums tracking-tight text-foreground leading-tight">
          {currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>

        {/* Day change */}
        <div className="mt-2.5 flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-gain/12 text-gain border-transparent gap-1 px-2 py-1"
          >
            <ArrowUpRight size={14} />
            <span className="text-[14px] font-semibold tabular-nums">
              {dayChange.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[13px] font-medium tabular-nums">
              ({dayChangePct > 0 ? "+" : ""}
              {dayChangePct}%)
            </span>
          </Badge>
          <span className="text-[13px] text-muted-foreground">Today</span>
        </div>

        {/* Invested + XIRR row */}
        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-[12px] text-muted-foreground">Invested</p>
            <p className="text-[16px] font-semibold tabular-nums text-foreground">
              {investedAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">XIRR</p>
            <p className="text-[16px] font-semibold tabular-nums text-gain">
              {xirr}%
            </p>
          </div>
        </div>

        {/* Period returns */}
        <Separator className="mt-4 mb-4 bg-border/30" />
        <div className="grid grid-cols-4 gap-2">
          {PERIOD_RETURNS.map((r) => (
            <div key={r.period} className="text-center">
              <p className="text-[12px] text-muted-foreground mb-1">
                {r.period}
              </p>
              <p
                className={cn(
                  "text-[15px] font-semibold tabular-nums",
                  r.value >= 0 ? "text-gain" : "text-loss"
                )}
              >
                {r.value >= 0 ? "+" : ""}
                {r.value}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
