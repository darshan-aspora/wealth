"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { INVESTMENT_STYLES, type InvestmentStyle } from "./portfolio-mock-data";

function StyleCard({
  data,
  isBetter,
}: {
  data: InvestmentStyle;
  isBetter: boolean;
}) {
  return (
    <Card
      className={cn(
        "shadow-none border-border/40",
        isBetter && "border-t-2 border-t-gain"
      )}
    >
      <CardContent className="p-4">
        <p className="text-[14px] font-semibold text-foreground mb-3">
          {data.label}
        </p>

        <div className="space-y-3">
          <div>
            <p className="text-[12px] text-muted-foreground">Invested</p>
            <p className="text-[15px] font-semibold tabular-nums text-foreground">
              {data.invested.toLocaleString("en-US", {
                minimumFractionDigits: 0,
              })}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">Current</p>
            <p className="text-[15px] font-semibold tabular-nums text-foreground">
              {data.current.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">XIRR</p>
            <p
              className={cn(
                "text-[15px] font-semibold tabular-nums",
                data.xirr >= 0 ? "text-gain" : "text-loss"
              )}
            >
              {data.xirr >= 0 ? "+" : ""}
              {data.xirr}%
            </p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">1D Change</p>
            <p
              className={cn(
                "text-[15px] font-semibold tabular-nums",
                data.dayChange >= 0 ? "text-gain" : "text-loss"
              )}
            >
              {data.dayChange >= 0 ? "+" : ""}
              {data.dayChange}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LumpsumVsSip() {
  const { lumpsum, sip } = INVESTMENT_STYLES;
  const lumpsumBetter = lumpsum.xirr >= sip.xirr;

  return (
    <Card className="border-border/50 shadow-none">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-[15px]">Investment Style</CardTitle>
        <CardDescription>
          How your one-time vs recurring investments compare
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <StyleCard data={lumpsum} isBetter={lumpsumBetter} />
          <StyleCard data={sip} isBetter={!lumpsumBetter} />
        </div>
      </CardContent>
    </Card>
  );
}
