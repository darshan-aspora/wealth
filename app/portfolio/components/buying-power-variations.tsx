"use client";

import { useState } from "react";
import { DollarSign, Coins, Clock, Plus } from "lucide-react";
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
const PENDING_COUNT = 2;
const PENDING_TOTAL = 7_500.0;

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2 });

/* ------------------------------------------------------------------ */
/*  Shared: Add Funds Sheet                                            */
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
          <Label htmlFor="bp-amount" className="text-[13px]">
            Amount
          </Label>
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

/* ================================================================== */
/*  VARIATION A — Inline compact                                       */
/*  Amount on left, two pill buttons on right, pending as a subtle     */
/*  footer line                                                        */
/* ================================================================== */

function VariationA() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { buyingPower } = PORTFOLIO_SUMMARY;

  return (
    <>
      <Card className="border-border/50 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left: label + amount */}
            <div>
              <p className="text-[13px] text-muted-foreground mb-0.5">Buying Power</p>
              <p className="text-[24px] font-bold tabular-nums leading-none">
                {fmt(buyingPower)}
              </p>
            </div>

            {/* Right: two buttons stacked tight */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setSheetOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-gain/10 px-3.5 py-1.5 active:scale-95 transition-transform"
              >
                <Plus size={13} strokeWidth={2.5} className="text-gain" />
                <span className="text-[13px] font-semibold text-gain">USD</span>
              </button>
              <button
                onClick={() => setSheetOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3.5 py-1.5 active:scale-95 transition-transform"
              >
                <Plus size={13} strokeWidth={2.5} className="text-blue-400" />
                <span className="text-[13px] font-semibold text-blue-400">USDT</span>
              </button>
            </div>
          </div>

          {/* Pending line */}
          <div className="flex items-center gap-1.5 mt-3.5 pt-3 border-t border-border/40">
            <span className="inline-flex h-[6px] w-[6px] rounded-full bg-amber-500 animate-pulse" />
            <p className="text-[13px] text-muted-foreground">
              {PENDING_COUNT} payments in progress
            </p>
            <p className="ml-auto text-[13px] font-semibold tabular-nums text-amber-500">
              +{fmt(PENDING_TOTAL)}
            </p>
          </div>
        </CardContent>
      </Card>
      <FundsSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

/* ================================================================== */
/*  VARIATION B — Big number hero                                      */
/*  Centered amount, buttons below as equal-width row, pending as      */
/*  a small amber badge beneath                                        */
/* ================================================================== */

function VariationB() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { buyingPower } = PORTFOLIO_SUMMARY;

  return (
    <>
      <Card className="border-border/50 shadow-none">
        <CardContent className="p-5">
          {/* Centered hero */}
          <div className="text-center mb-5">
            <p className="text-[13px] text-muted-foreground mb-1">Buying Power</p>
            <p className="text-[32px] font-bold tabular-nums leading-none tracking-tight">
              {fmt(buyingPower)}
            </p>
          </div>

          {/* Two buttons */}
          <div className="flex gap-2.5 mb-4">
            <button
              onClick={() => setSheetOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gain/10 py-3 active:scale-[0.97] transition-transform"
            >
              <DollarSign size={16} strokeWidth={2.2} className="text-gain" />
              <span className="text-[15px] font-semibold text-gain">Add USD</span>
            </button>
            <button
              onClick={() => setSheetOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 py-3 active:scale-[0.97] transition-transform"
            >
              <Coins size={16} strokeWidth={2} className="text-blue-400" />
              <div className="flex flex-col items-start">
                <span className="text-[15px] font-semibold text-blue-400 leading-tight">Add USDT</span>
                <span className="text-[10px] text-blue-400/60 leading-tight">stablecoins</span>
              </div>
            </button>
          </div>

          {/* Pending badge — centered */}
          <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-500/8 py-2">
            <Clock size={13} strokeWidth={2} className="text-amber-500" />
            <p className="text-[13px] text-amber-500 font-medium">
              {PENDING_COUNT} payments in progress · <span className="font-semibold tabular-nums">+{fmt(PENDING_TOTAL)}</span>
            </p>
          </div>
        </CardContent>
      </Card>
      <FundsSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

/* ================================================================== */
/*  VARIATION C — Split card                                           */
/*  Top half: amount + pending inline. Bottom half: two action tiles   */
/*  separated by a divider                                             */
/* ================================================================== */

function VariationC() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { buyingPower } = PORTFOLIO_SUMMARY;

  return (
    <>
      <Card className="border-border/50 shadow-none overflow-hidden">
        {/* Top section */}
        <div className="px-5 pt-5 pb-4">
          <p className="text-[13px] text-muted-foreground mb-1">Buying Power</p>
          <div className="flex items-end justify-between">
            <p className="text-[28px] font-bold tabular-nums leading-none">
              {fmt(buyingPower)}
            </p>
            <div className="flex items-center gap-1.5 bg-amber-500/10 rounded-full px-2.5 py-1">
              <span className="inline-flex h-[5px] w-[5px] rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[12px] font-medium text-amber-500">
                +{fmt(PENDING_TOTAL)} incoming
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Bottom section — action tiles */}
        <div className="flex">
          <button
            onClick={() => setSheetOpen(true)}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 active:bg-muted/50 transition-colors border-r border-border/50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gain/12">
              <DollarSign size={14} strokeWidth={2.2} className="text-gain" />
            </div>
            <span className="text-[15px] font-semibold text-foreground">Add USD</span>
          </button>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 active:bg-muted/50 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/12">
              <Coins size={14} strokeWidth={2} className="text-blue-400" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[15px] font-semibold text-foreground leading-tight">Add USDT</span>
              <span className="text-[10px] text-muted-foreground leading-tight">stablecoins</span>
            </div>
          </button>
        </div>
      </Card>
      <FundsSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

/* ================================================================== */
/*  VARIATION D — Minimal row                                          */
/*  Single-row: label, amount, then a "+USD / +USDT" inline.           */
/*  Pending as a full-width subtle bar below the card                  */
/* ================================================================== */

function VariationD() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { buyingPower } = PORTFOLIO_SUMMARY;

  return (
    <>
      <div className="space-y-2">
        <Card className="border-border/50 shadow-none">
          <CardContent className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                  Buying Power
                </p>
                <p className="text-[22px] font-bold tabular-nums leading-none">
                  {fmt(buyingPower)}
                </p>
              </div>

              {/* Inline pill buttons */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSheetOpen(true)}
                  className="rounded-lg bg-gain/10 px-3 py-2 active:scale-95 transition-transform"
                >
                  <span className="text-[13px] font-bold text-gain">+ USD</span>
                </button>
                <button
                  onClick={() => setSheetOpen(true)}
                  className="rounded-lg bg-blue-500/10 px-3 py-2 active:scale-95 transition-transform flex flex-col items-center"
                >
                  <span className="text-[13px] font-bold text-blue-400 leading-tight">+ USDT</span>
                  <span className="text-[9px] text-blue-400/50 leading-tight">stablecoin</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending bar — outside card, lighter feel */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/[0.06] border border-amber-500/15">
          <span className="inline-flex h-[5px] w-[5px] rounded-full bg-amber-500 animate-pulse" />
          <p className="text-[12px] text-amber-500/80 font-medium">
            {PENDING_COUNT} payments in progress
          </p>
          <p className="ml-auto text-[12px] font-semibold tabular-nums text-amber-500">
            +{fmt(PENDING_TOTAL)}
          </p>
        </div>
      </div>
      <FundsSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

/* ================================================================== */
/*  VARIATION E — Stacked clean                                        */
/*  Amount top-left, pending right-aligned on same line as label,      */
/*  two full-width rounded buttons stacked                             */
/* ================================================================== */

function VariationE() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { buyingPower } = PORTFOLIO_SUMMARY;

  return (
    <>
      <Card className="border-border/50 shadow-none">
        <CardContent className="p-5">
          {/* Top row */}
          <div className="flex items-start justify-between mb-1">
            <p className="text-[13px] text-muted-foreground">Buying Power</p>
            <div className="flex items-center gap-1.5">
              <Clock size={12} strokeWidth={2} className="text-amber-500" />
              <p className="text-[12px] text-amber-500 font-medium">
                {PENDING_COUNT} incoming · <span className="tabular-nums font-semibold">+{fmt(PENDING_TOTAL)}</span>
              </p>
            </div>
          </div>

          {/* Amount */}
          <p className="text-[28px] font-bold tabular-nums leading-none mb-5">
            {fmt(buyingPower)}
          </p>

          {/* Buttons — full width, stacked */}
          <div className="space-y-2">
            <button
              onClick={() => setSheetOpen(true)}
              className="w-full flex items-center gap-3 rounded-xl bg-gain/8 border border-gain/15 px-4 py-3 active:scale-[0.98] transition-transform"
            >
              <DollarSign size={18} strokeWidth={2} className="text-gain" />
              <span className="text-[15px] font-semibold text-gain">Add USD</span>
            </button>
            <button
              onClick={() => setSheetOpen(true)}
              className="w-full flex items-center gap-3 rounded-xl bg-blue-500/8 border border-blue-500/15 px-4 py-3 active:scale-[0.98] transition-transform"
            >
              <Coins size={18} strokeWidth={2} className="text-blue-400" />
              <span className="text-[15px] font-semibold text-blue-400">Add USDT</span>
              <span className="text-[11px] text-blue-400/50 ml-0.5">stablecoins</span>
            </button>
          </div>
        </CardContent>
      </Card>
      <FundsSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Export all variations                                               */
/* ------------------------------------------------------------------ */

export const BUYING_POWER_VARIATIONS = [
  { name: "A — Inline Compact", component: VariationA },
  { name: "B — Big Number Hero", component: VariationB },
  { name: "C — Split Card", component: VariationC },
  { name: "D — Minimal Row", component: VariationD },
  { name: "E — Stacked Clean", component: VariationE },
];
