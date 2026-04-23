"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const MTM = 320.00;
const DAILY_CHANGE = 1_055.00;

const fmt = (n: number) =>
  `${n >= 0 ? "+" : "-"}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export function PositionsSummary() {
  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[15px] font-bold text-foreground">Open Positions</p>
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">Live MTM and intraday change on your active trades.</p>
          </div>
          <ChevronRight size={18} strokeWidth={1.8} className="text-muted-foreground" />
        </div>

        <div className="flex gap-8">
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">MTM</p>
            <p className="text-[17px] font-semibold tabular-nums text-gain">{fmt(MTM)}</p>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Daily Change</p>
            <p className="text-[17px] font-semibold tabular-nums text-gain">{fmt(DAILY_CHANGE)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
