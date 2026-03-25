"use client";

import { cn } from "@/lib/utils";
import { Receipt, Scissors } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TAX_LOTS, TAX_SUMMARY, type TaxLot } from "./portfolio-mock-data";

function TaxLotRow({ lot }: { lot: TaxLot }) {
  const isShort = lot.type === "short-term";

  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] font-semibold text-foreground">
            {lot.label}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {lot.sublabel}
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-[16px] font-bold tabular-nums",
              lot.gains >= 0 ? "text-gain" : "text-loss"
            )}
          >
            {lot.gains >= 0 ? "+" : ""}
            {lot.gains.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {lot.positions} position{lot.positions !== 1 ? "s" : ""} ·{" "}
            {lot.holdingPeriod}
          </p>
        </div>
      </div>

      {/* Visual bar */}
      <div className="mt-2 h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            isShort ? "bg-amber-500/60" : "bg-emerald-500/60"
          )}
          style={{
            width: `${(lot.gains / TAX_SUMMARY.totalUnrealized) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export function TaxLotAwareness() {
  return (
    <Card className="border-border/50 shadow-none">
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center gap-2">
          <Receipt size={18} className="text-foreground" />
          <CardTitle className="text-[15px]">Tax Lot Breakdown</CardTitle>
        </div>
        <CardDescription>Unrealized gains by holding period</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {/* Summary row */}
        <Card className="shadow-none bg-muted/20 border-border/30 mb-3">
          <CardContent className="p-3 flex gap-4">
            <div className="flex-1">
              <p className="text-[12px] text-muted-foreground">
                Total Unrealized
              </p>
              <p className="text-[16px] font-bold tabular-nums text-gain">
                +
                {TAX_SUMMARY.totalUnrealized.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-muted-foreground">Est. Tax</p>
              <p className="text-[16px] font-bold tabular-nums text-foreground">
                {TAX_SUMMARY.estimatedTax.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tax lots */}
        {TAX_LOTS.map((lot, i) => (
          <div key={lot.type}>
            {i > 0 && <Separator className="bg-border/30" />}
            <TaxLotRow lot={lot} />
          </div>
        ))}

        {/* Tax-loss harvesting hint */}
        {TAX_SUMMARY.harvestable > 0 && (
          <>
            <Separator className="mt-3 mb-3 bg-border/30" />
            <Card className="shadow-none bg-amber-500/8 border-amber-500/20">
              <CardContent className="p-3 flex items-center gap-2">
                <Scissors size={16} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-foreground">
                    Tax-loss harvesting opportunity
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {TAX_SUMMARY.harvestablePositions} positions with{" "}
                    {TAX_SUMMARY.harvestable.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    in harvestable losses
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}
