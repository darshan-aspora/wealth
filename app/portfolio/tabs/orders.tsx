"use client";

import { useState, useMemo } from "react";
import { Clock, SlidersHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type StatusFilter = "All" | "Open" | "Executed" | "Cancelled";
type AssetFilter = "All" | "Stocks" | "ETFs" | "Options";

const statusFilters: StatusFilter[] = ["All", "Open", "Executed", "Cancelled"];
const assetFilters: AssetFilter[] = ["All", "Stocks", "ETFs", "Options"];

const ordersData = [
  { symbol: "AMD", name: "Advanced Micro", type: "Buy", qty: 10, price: 165.00, status: "Executed", time: "10:32 AM", asset: "Stocks" },
  { symbol: "SOFI", name: "SoFi Technologies", type: "Buy", qty: 50, price: 8.45, status: "Executed", time: "10:15 AM", asset: "Stocks" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Sell", qty: 2, price: 232.80, status: "Open", time: "09:55 AM", asset: "Stocks" },
  { symbol: "PLTR", name: "Palantir Tech.", type: "Buy", qty: 25, price: 22.50, status: "Cancelled", time: "09:40 AM", asset: "Stocks" },
  { symbol: "NVDA", name: "NVIDIA Corp.", type: "Buy", qty: 3, price: 875.00, status: "Open", time: "09:30 AM", asset: "Stocks" },
  { symbol: "VOO", name: "Vanguard S&P 500", type: "Buy", qty: 5, price: 462.10, status: "Executed", time: "09:20 AM", asset: "ETFs" },
  { symbol: "QQQ", name: "Invesco QQQ", type: "Buy", qty: 8, price: 445.80, status: "Open", time: "09:15 AM", asset: "ETFs" },
  { symbol: "AAPL 195C", name: "AAPL Mar 28 Call", type: "Buy", qty: 3, price: 4.20, status: "Executed", time: "09:10 AM", asset: "Options" },
  { symbol: "SPY 510P", name: "SPY Apr 18 Put", type: "Buy", qty: 5, price: 3.80, status: "Cancelled", time: "09:05 AM", asset: "Options" },
];

export function OrdersTab() {
  const [status, setStatus] = useState<StatusFilter>("All");
  const [asset, setAsset] = useState<AssetFilter>("All");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = ordersData;
    if (status !== "All") list = list.filter((o) => o.status === status);
    if (asset !== "All") list = list.filter((o) => o.asset === asset);
    return list;
  }, [status, asset]);

  return (
    <div className="px-4 pb-6">
      {/* Filter row */}
      <div className="mb-4 flex items-center gap-2">
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setStatus(f)}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                status === f
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Filter icon → opens bottom sheet */}
        <button
          onClick={() => setSheetOpen(true)}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full p-2 transition-colors active:scale-95",
            asset !== "All"
              ? "bg-foreground text-background"
              : "border border-border/60 text-muted-foreground"
          )}
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Asset filter bottom sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-10">
          <SheetHeader className="mb-2">
            <SheetTitle className="text-[17px]">Filter by Type</SheetTitle>
          </SheetHeader>
          <div className="space-y-1">
            {assetFilters.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setAsset(f);
                  setSheetOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-medium transition-colors",
                  asset === f
                    ? "bg-muted/60 text-foreground"
                    : "text-muted-foreground hover:bg-muted/30"
                )}
              >
                {f}
                {asset === f && <Check size={18} className="text-gain" />}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="space-y-2">
        {filtered.map((o, i) => (
          <div
            key={`${o.symbol}-${i}`}
            className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-4 py-3.5"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-foreground">{o.symbol}</p>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase",
                    o.type === "Buy"
                      ? "bg-gain/15 text-gain"
                      : "bg-loss/15 text-loss"
                  )}
                >
                  {o.type}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground truncate">{o.name}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground/60">
                {o.qty} × {o.price.toFixed(2)} · {o.time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-semibold tabular-nums text-foreground">
                {(o.qty * o.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <span
                className={cn(
                  "text-[12px] font-medium",
                  o.status === "Executed"
                    ? "text-gain"
                    : o.status === "Open"
                    ? "text-amber-500"
                    : "text-muted-foreground"
                )}
              >
                {o.status === "Open" && <Clock size={11} className="mr-0.5 inline" />}
                {o.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-[15px] text-muted-foreground/50">No matching orders</p>
        </div>
      )}
    </div>
  );
}
