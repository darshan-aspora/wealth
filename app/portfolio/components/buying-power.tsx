"use client";

import { useState } from "react";
import { Wallet, Plus, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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

function FundsSheet({
  open,
  onOpenChange,
  mode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "deposit" | "withdraw";
}) {
  const [amount, setAmount] = useState("");

  const title = mode === "deposit" ? "Add Funds" : "Withdraw Funds";
  const buttonLabel =
    mode === "deposit" ? "Confirm Deposit" : "Confirm Withdrawal";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-[17px] font-bold">{title}</SheetTitle>
        </SheetHeader>

        {/* Amount input */}
        <div className="mb-4 space-y-2">
          <Label htmlFor="amount" className="text-[13px]">
            Amount
          </Label>
          <Input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-12 text-[20px] font-semibold tabular-nums"
          />
        </div>

        {/* Quick amounts */}
        <div className="mb-6 space-y-2">
          <Label className="text-[13px]">Quick select</Label>
          <div className="flex gap-2">
            {QUICK_AMOUNTS.map((q) => {
              const formatted = q.toLocaleString("en-US");
              return (
                <Button
                  key={q}
                  variant={amount === formatted ? "default" : "outline"}
                  size="sm"
                  className="flex-1 tabular-nums"
                  onClick={() => setAmount(formatted)}
                >
                  {formatted}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Confirm */}
        <Button
          className={cn(
            "w-full h-12 text-[16px] font-semibold",
            mode === "deposit" && "bg-gain text-white hover:bg-gain/90"
          )}
          size="lg"
        >
          {buttonLabel}
        </Button>
      </SheetContent>
    </Sheet>
  );
}

export function BuyingPower() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const { buyingPower } = PORTFOLIO_SUMMARY;

  return (
    <>
      <Card className="border-border/50 shadow-none">
        <CardContent className="p-5">
          {/* Header row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/12">
              <Wallet size={22} strokeWidth={1.6} className="text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-muted-foreground">Buying Power</p>
              <p className="text-[20px] font-bold tabular-nums text-foreground leading-tight">
                {buyingPower.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setDepositOpen(true)}
              className="flex-1 bg-gain text-white hover:bg-gain/90 gap-2"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Funds
            </Button>
            <Button
              variant="outline"
              onClick={() => setWithdrawOpen(true)}
              className="flex-1 gap-2"
            >
              <ArrowUpRight size={16} strokeWidth={2} />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <FundsSheet
        open={depositOpen}
        onOpenChange={setDepositOpen}
        mode="deposit"
      />
      <FundsSheet
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        mode="withdraw"
      />
    </>
  );
}
