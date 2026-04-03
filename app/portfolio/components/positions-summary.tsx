"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data — open Options & Futures positions                       */
/* ------------------------------------------------------------------ */

const POSITIONS = [
  { symbol: "AAPL 195C", type: "Call", expiry: "Apr 18", qty: 3, avg: 4.20, ltp: 5.85, pnl: 495.00 },
  { symbol: "SPY 510P",  type: "Put",  expiry: "Apr 25", qty: 5, avg: 3.80, ltp: 2.90, pnl: -450.00 },
  { symbol: "TSLA 260C", type: "Call", expiry: "May 2",  qty: 2, avg: 8.40, ltp: 11.20, pnl: 560.00 },
  { symbol: "QQQ 480P",  type: "Put",  expiry: "Apr 11", qty: 4, avg: 2.10, ltp: 1.45, pnl: -260.00 },
];

const totalPnl = POSITIONS.reduce((s, p) => s + p.pnl, 0);
const totalMarketValue = POSITIONS.reduce((s, p) => s + p.ltp * p.qty * 100, 0);
const calls = POSITIONS.filter((p) => p.type === "Call");
const puts = POSITIONS.filter((p) => p.type === "Put");
const callsPnl = calls.reduce((s, p) => s + p.pnl, 0);
const putsPnl = puts.reduce((s, p) => s + p.pnl, 0);

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2 });
const fmtS = (n: number) => `${n >= 0 ? "+" : ""}${fmt(n)}`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PositionsSummary() {
  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[15px] font-semibold text-foreground">Open Positions</p>
          <ChevronRight size={18} strokeWidth={1.8} className="text-muted-foreground" />
        </div>

        {/* Metrics — stacked rows like portfolio summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-muted-foreground">Market Value</span>
            <span className="text-[16px] font-semibold tabular-nums text-foreground">
              {totalMarketValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-muted-foreground">P&L</span>
            <div className="text-right">
              <span className={cn(
                "text-[16px] font-semibold tabular-nums",
                totalPnl >= 0 ? "text-gain" : "text-loss"
              )}>
                {fmtS(totalPnl)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-border/30 pt-3">
            <div>
              <span className="text-[14px] text-muted-foreground">Positions</span>
              <p className="text-[16px] font-semibold tabular-nums text-foreground">{POSITIONS.length}</p>
            </div>
            <div>
              <span className="text-[14px] text-muted-foreground">Calls ({calls.length})</span>
              <p className={cn("text-[16px] font-semibold tabular-nums", callsPnl >= 0 ? "text-gain" : "text-loss")}>{fmtS(callsPnl)}</p>
            </div>
            <div>
              <span className="text-[14px] text-muted-foreground">Puts ({puts.length})</span>
              <p className={cn("text-[16px] font-semibold tabular-nums", putsPnl >= 0 ? "text-gain" : "text-loss")}>{fmtS(putsPnl)}</p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
