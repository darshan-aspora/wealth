"use client";

import { useState } from "react";
import {
  ChevronRight,
  DollarSign,
  Coins,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PORTFOLIO_SUMMARY } from "./portfolio-mock-data";

const QUICK_AMOUNTS = [500, 1_000, 5_000, 10_000];
const PENDING_COUNT = 2;
const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2 });

/* ------------------------------------------------------------------ */
/*  Add Funds Sheet                                                    */
/* ------------------------------------------------------------------ */

function FundsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [amount, setAmount] = useState("");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-[17px] font-bold">Add Funds</SheetTitle>
        </SheetHeader>
        <div className="mb-4 space-y-2">
          <Label htmlFor="bp-amount" className="text-[13px]">Amount</Label>
          <Input
            id="bp-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-12 text-[20px] font-semibold tabular-nums"
          />
        </div>
        <div className="mb-6 space-y-2">
          <Label className="text-[13px]">Quick select</Label>
          <div className="flex gap-2">
            {QUICK_AMOUNTS.map((q) => {
              const f = q.toLocaleString("en-US");
              return (
                <Button
                  key={q}
                  variant={amount === f ? "default" : "outline"}
                  size="sm"
                  className="flex-1 tabular-nums"
                  onClick={() => setAmount(f)}
                >
                  {f}
                </Button>
              );
            })}
          </div>
        </div>
        <Button
          className="w-full h-12 text-[16px] font-semibold bg-gain text-white hover:bg-gain/90"
          size="lg"
        >
          Confirm Deposit
        </Button>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Buying Power Widget                                                */
/* ------------------------------------------------------------------ */

export function BuyingPower() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { buyingPower } = PORTFOLIO_SUMMARY;

  return (
    <>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        {/* Top row — Buying Power + amount + chevron */}
        <button className="w-full flex items-center justify-between px-4 py-4 active:bg-muted/30 transition-colors">
          <div className="text-left">
            <p className="text-[13px] text-muted-foreground text-left">Buying Power</p>
            <p className="text-[22px] font-bold tabular-nums leading-tight text-foreground">
              {fmt(buyingPower)}
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Earning 3.5% APY · 3x more than savings</p>
          </div>
          <ChevronRight size={20} strokeWidth={1.8} className="text-muted-foreground" />
        </button>

        {/* Divider */}
        <div className="h-px bg-border/40" />

        {/* Bottom section — 3 action buttons */}
        <div className="px-4 pt-2.5 pb-2">
          <div className="flex">
            <button
              onClick={() => setSheetOpen(true)}
              className="flex-1 flex flex-col items-center gap-2 py-2 active:opacity-70 transition-opacity"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60">
                <DollarSign size={19} strokeWidth={1.8} className="text-muted-foreground" />
              </div>
              <span className="text-[13px] font-medium text-foreground">Add USD</span>
            </button>

            <button
              onClick={() => setSheetOpen(true)}
              className="flex-1 flex flex-col items-center gap-2 py-2 active:opacity-70 transition-opacity"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60">
                <Coins size={19} strokeWidth={1.8} className="text-muted-foreground" />
              </div>
              <span className="text-[13px] font-medium text-foreground">Add USDT</span>
            </button>

            <button
              className="flex-1 flex flex-col items-center gap-2 py-2 active:opacity-70 transition-opacity"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60">
                <ArrowUpRight size={19} strokeWidth={1.8} className="text-muted-foreground" />
              </div>
              <span className="text-[13px] font-medium text-foreground">Withdraw</span>
            </button>
          </div>

          {/* Pending payments line */}
          <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-border/30">
            <span className="inline-flex h-[5px] w-[5px] rounded-full bg-amber-500 animate-pulse" />
            <p className="text-[13px] text-muted-foreground">
              {PENDING_COUNT} payments in progress
            </p>
          </div>
        </div>
      </div>

      <FundsSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
