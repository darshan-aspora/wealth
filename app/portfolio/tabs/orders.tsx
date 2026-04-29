"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle, ArrowRight, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  type OpenOrder, type CompletedOrder, type FailedOrder, type Order,
  OrderCard, registerOrders, fmtQty, priceLabel,
} from "@/app/portfolio/components/shared-order";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type OrderTab = "open" | "completed" | "failed";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const OPEN_ORDERS: OpenOrder[] = [
  { kind: "open", symbol: "AAPL", companyName: "Apple Inc",   category: "#MegaCap",  expiry: "230 APR 27", optionType: "CALL", side: "B", filledQty: 0,    totalQty: 1,  lots: 1,  priceType: "limit",      price: 12.3,  investedAmount: 30,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123456", time: "10:32 AM", executedAt: "10:02:34", placedAt: "10:32:00", orderSource: "direct" },
  { kind: "open", symbol: "TSLA", companyName: "Tesla Inc",   category: "#MegaCap",                                             side: "S", filledQty: 2.45, totalQty: 15,           priceType: "market",     price: 220,   investedAmount: 50,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123457", time: "10:15 AM", executedAt: "10:15:22", placedAt: "10:15:00", orderSource: "sip" },
  { kind: "open", symbol: "NVDA", companyName: "NVIDIA Corp", category: "#Growth",                                               side: "B", filledQty: 6,    totalQty: 12,           priceType: "limit",      price: 870,   investedAmount: 870, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123458", time: "09:55 AM", executedAt: "09:55:10", placedAt: "09:55:00", orderSource: "collection" },
  { kind: "open", symbol: "QQQ",  companyName: "Invesco QQQ", category: "#Index",    tag: "ETF",                                 side: "B", filledQty: 3,    totalQty: 15,           priceType: "limit",      price: 390,   investedAmount: 390, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123459", time: "09:40 AM", executedAt: "09:40:00", placedAt: "09:40:00", orderSource: "direct" },
  { kind: "open", symbol: "VOO",  companyName: "Vanguard S&P",category: "#Index",    tag: "ETF",                                 side: "B", filledQty: 0,    totalQty: 50,           priceType: "limit",      price: 240,   investedAmount: 240, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123460", time: "09:30 AM", executedAt: "09:30:00" },
  { kind: "open", symbol: "AMD",  companyName: "AMD Inc",     category: "#Option",   expiry: "150 APR 27", optionType: "PUT",   side: "S", filledQty: 0,    totalQty: 2,  lots: 2,  priceType: "sl_trigger", price: 18,    investedAmount: 18,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123461", time: "09:20 AM", executedAt: "09:20:00" },
  { kind: "open", symbol: "GLD",  companyName: "SPDR Gold",   category: "#Commodity",tag: "ETF",                                 side: "B", filledQty: 0,    totalQty: 15,           priceType: "market",     price: 318,   investedAmount: 318, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123462", time: "09:10 AM", executedAt: "09:10:00" },
  { kind: "open", symbol: "SPY",  companyName: "SPDR S&P 500",category: "#Index",                                                side: "B", filledQty: 8,    totalQty: 20,           priceType: "trigger",    price: 510,   investedAmount: 510, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123463", time: "09:05 AM", executedAt: "09:05:00" },
];

const COMPLETED_ORDERS: CompletedOrder[] = [
  { kind: "completed", symbol: "AAPL", companyName: "Apple Inc",    category: "#MegaCap",  expiry: "230 APR 27", optionType: "CALL", side: "B", filledQty: 1,  totalQty: 1,  lots: 1,  priceType: "market", price: 112,   avgExecutedPrice: 112,   investedAmount: 30,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223401", time: "10:32 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "TSLA", companyName: "Tesla Inc",    category: "#MegaCap",                                            side: "S", filledQty: 5,  totalQty: 5,            priceType: "market", price: 312,   avgExecutedPrice: 312,   investedAmount: 50,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223402", time: "10:15 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "SPY",  companyName: "SPDR S&P 500", category: "#Index",                                              side: "B", filledQty: 15, totalQty: 15,           priceType: "limit",  price: 600,   avgExecutedPrice: 598,   investedAmount: 600, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223403", time: "10:02 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "META", companyName: "Meta Platforms",category: "#Option",  expiry: "350 APR 12", optionType: "CALL", side: "B", filledQty: 5,  totalQty: 5,  lots: 5,  priceType: "market", price: 21.68, avgExecutedPrice: 21.68, investedAmount: 300, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223404", time: "09:48 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "QQQ",  companyName: "Invesco QQQ",  category: "#Index",                                              side: "S", filledQty: 3,  totalQty: 3,            priceType: "market", price: 410,   avgExecutedPrice: 410,   investedAmount: 410, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223405", time: "09:35 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "VOO",  companyName: "Vanguard S&P", category: "#Index",    tag: "ETF",                               side: "B", filledQty: 16, totalQty: 16,           priceType: "limit",  price: 245,   avgExecutedPrice: 244.8, investedAmount: 244, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223406", time: "09:20 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "AMD",  companyName: "AMD Inc",      category: "#Option",   expiry: "150 APR 27", optionType: "PUT",  side: "B", filledQty: 4,  totalQty: 4,  lots: 4,  priceType: "market", price: 18,    avgExecutedPrice: 18,    investedAmount: 18,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223407", time: "09:05 AM", executedAt: "10:02:34" },
];

const FAILED_ORDERS: FailedOrder[] = [
  { kind: "failed", symbol: "AAPL", companyName: "Apple Inc",    category: "#MegaCap",  expiry: "230 APR 27", optionType: "CALL", side: "S", filledQty: 0,  totalQty: 1,  lots: 1,  priceType: "trigger",    price: 12.3, investedAmount: 30,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323501", time: "10:32 AM", executedAt: "10:02:34", failReason: "Rejected" },
  { kind: "failed", symbol: "TSLA", companyName: "Tesla Inc",    category: "#MegaCap",                                             side: "S", filledQty: 2,  totalQty: 15,           priceType: "market",     price: 220,  investedAmount: 50,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323502", time: "10:15 AM", executedAt: "10:02:34", failReason: "Cancelled by you" },
  { kind: "failed", symbol: "NVDA", companyName: "NVIDIA Corp",  category: "#Growth",                                               side: "B", filledQty: 12, totalQty: 12,           priceType: "limit",      price: 870,  investedAmount: 870, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323503", time: "09:55 AM", executedAt: "10:02:34", failReason: "Rejected" },
  { kind: "failed", symbol: "QQQ",  companyName: "Invesco QQQ",  category: "#Index",    tag: "ETF",                                 side: "B", filledQty: 0,  totalQty: 15,           priceType: "trigger",    price: 390,  investedAmount: 390, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323504", time: "09:40 AM", executedAt: "10:02:34", failReason: "Margin not met" },
  { kind: "failed", symbol: "VOO",  companyName: "Vanguard S&P", category: "#Index",    tag: "ETF",                                 side: "B", filledQty: 0,  totalQty: 50,           priceType: "trigger",    price: 240,  investedAmount: 240, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323505", time: "09:30 AM", executedAt: "10:02:34", failReason: "Cancelled by System" },
  { kind: "failed", symbol: "AMD",  companyName: "AMD Inc",      category: "#Option",   expiry: "150 APR 27", optionType: "PUT",   side: "S", filledQty: 0,  totalQty: 2,  lots: 2,  priceType: "sl_trigger", price: 18,   investedAmount: 18,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323506", time: "09:20 AM", executedAt: "10:02:34", failReason: "Expired" },
  { kind: "failed", symbol: "GLD",  companyName: "SPDR Gold",    category: "#Commodity",tag: "ETF",                                 side: "B", filledQty: 0,  totalQty: 15,           priceType: "market",     price: 318,  investedAmount: 318, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323507", time: "09:10 AM", executedAt: "10:02:34", failReason: "Invalid Price Hike" },
  { kind: "failed", symbol: "TSLA", companyName: "Tesla Inc",    category: "#MegaCap",                                              side: "S", filledQty: 0,  totalQty: 15,           priceType: "limit",      price: 410,  investedAmount: 50,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323508", time: "09:05 AM", executedAt: "10:02:34", failReason: "Insufficient buying power", failDetail: "Required margin is 415 but buying power is 400" },
];

/* ------------------------------------------------------------------ */
/*  Tab                                                                */
/* ------------------------------------------------------------------ */

const TABS: { id: OrderTab; label: string }[] = [
  { id: "open",      label: "Open"      },
  { id: "completed", label: "Completed" },
  { id: "failed",    label: "Failed"    },
];

// Register all orders globally so the detail page can look them up by ID
registerOrders([...OPEN_ORDERS, ...COMPLETED_ORDERS, ...FAILED_ORDERS]);

/* ------------------------------------------------------------------ */
/*  Cancel all drawer                                                  */
/* ------------------------------------------------------------------ */

function CancelAllDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(OPEN_ORDERS.map((_, i) => i))
  );

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) { next.delete(i); } else { next.add(i); }
      return next;
    });

  const allSelected = selected.size === OPEN_ORDERS.length;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[90dvh] flex flex-col inset-x-0 mx-auto max-w-[430px]">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 pt-2 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-foreground leading-tight">Cancel orders</p>
              <p className="text-[14px] text-muted-foreground mt-1">Selected orders will be cancelled immediately</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1 -mr-1 -mt-0.5 active:bg-muted/50 shrink-0">
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0">
          <p className="text-[13px] text-muted-foreground">
            {selected.size} of {OPEN_ORDERS.length} selected
          </p>
          <button
            onClick={() => setSelected(allSelected ? new Set() : new Set(OPEN_ORDERS.map((_, i) => i)))}
            className="text-[13px] font-semibold text-foreground active:opacity-60"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 space-y-2.5 pb-4">
          {OPEN_ORDERS.map((o, i) => {
            const isChecked = selected.has(i);
            const label = [o.symbol, o.expiry, o.optionType ? o.optionType[0] + o.optionType.slice(1).toLowerCase() : undefined].filter(Boolean).join(" ");
            const isPartial = o.filledQty > 0 && o.filledQty < o.totalQty;
            const qtyMeta = o.lots !== undefined
              ? `${fmtQty(o.lots)} lot × ${fmtQty(o.totalQty)}`
              : isPartial
                ? `${fmtQty(o.filledQty)} / ${fmtQty(o.totalQty)}`
                : fmtQty(o.totalQty);

            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={cn(
                  "w-full text-left rounded-2xl border px-4 py-4 flex items-center gap-3 transition-all active:scale-[0.99]",
                  isChecked ? "border-foreground bg-white" : "border-border/40 bg-white/60"
                )}
              >
                <div className={cn(
                  "shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors",
                  isChecked ? "bg-foreground border-foreground" : "border-border/50 bg-transparent"
                )}>
                  {isChecked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="rounded bg-[#E3E3E3] px-1 py-0.5 text-[10px] font-bold text-foreground shrink-0">
                      {o.side === "B" ? "BUY" : "SELL"}
                    </span>
                    <p className="text-[15px] font-bold text-foreground leading-tight">{label}</p>
                    {o.tag && (
                      <span className="rounded bg-[#E3E3E3] px-1 py-0.5 text-[10px] font-bold text-foreground">{o.tag}</span>
                    )}
                    {isPartial && (
                      <span className="text-[11px] font-semibold text-amber-600">Partial fill</span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground tabular-nums">
                    {qtyMeta} · {priceLabel(o.priceType, o.price)}
                  </p>
                </div>

                <p className="text-[14px] font-semibold text-foreground tabular-nums shrink-0">
                  ${o.investedAmount.toLocaleString("en-US")}
                </p>
              </button>
            );
          })}
        </div>

        <div className="shrink-0 px-5 pb-8 pt-3 border-t border-border/40">
          <button
            disabled={selected.size === 0}
            className="w-full rounded-2xl bg-foreground text-background py-4 text-[15px] font-bold active:opacity-80 transition-opacity disabled:opacity-30"
          >
            {selected.size === 0 ? "Select orders to cancel" : `Cancel ${selected.size} order${selected.size > 1 ? "s" : ""}`}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function OrdersTab({ empty }: { empty?: boolean }) {
  const [activeTab, setActiveTab] = useState<OrderTab>("open");
  const [cancelAllOpen, setCancelAllOpen] = useState(false);
  const router = useRouter();

  if (empty) {
    const lifecycle = [
      {
        icon: Clock,
        label: "Open",
        desc: "Waiting to be filled — limit or trigger orders sit here until the market hits your price.",
        color: "text-amber-500",
        bg: "bg-amber-50",
      },
      {
        icon: CheckCircle,
        label: "Completed",
        desc: "Trade went through. You'll see the exact price, quantity, and time of execution.",
        color: "text-gain",
        bg: "bg-gain/10",
      },
      {
        icon: XCircle,
        label: "Failed",
        desc: "Order was rejected, cancelled, or expired. The reason is always shown so you know what happened.",
        color: "text-loss",
        bg: "bg-loss/10",
      },
    ];

    return (
      <div className="pb-24 px-5 pt-5">
        <p className="text-[22px] font-bold text-foreground mb-1">No orders yet</p>
        <p className="text-[14px] text-muted-foreground mb-6">
          The moment you place a trade, it shows up here — live, with full details.
        </p>

        {/* Lifecycle */}
        <div className="rounded-3xl border border-border/40 bg-background overflow-hidden mb-4">
          {lifecycle.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className={cn("px-4 py-4", i < lifecycle.length - 1 && "border-b border-border/40")}>
                <div className="flex items-start gap-3">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", step.bg)}>
                    <Icon size={15} className={step.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-foreground mb-0.5">{step.label}</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                  {i < lifecycle.length - 1 && (
                    <ArrowRight size={14} className="text-border shrink-0 mt-2 rotate-90 self-end" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/home-v3")}
          className="w-full rounded-2xl bg-foreground py-4 text-[15px] font-bold text-background active:opacity-75 transition-opacity"
        >
          Place your first trade
        </button>
      </div>
    );
  }

  const orders: Order[] =
    activeTab === "open"      ? OPEN_ORDERS :
    activeTab === "completed" ? COMPLETED_ORDERS :
                                FAILED_ORDERS;

  return (
    <div className="pb-24">
      {/* Tab switcher */}
      <div className="px-5 pt-4 pb-5">
        <div className="flex rounded-2xl bg-[#EEEEF3] p-1 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-[16px] font-semibold transition-colors",
                activeTab === tab.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count + cancel all */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <p className="text-[16px] font-semibold text-muted-foreground">{orders.length} Orders</p>
        {activeTab === "open" && (
          <button
            onClick={() => setCancelAllOpen(true)}
            className="rounded-xl border border-border/60 px-3.5 py-1.5 text-[13px] font-semibold text-foreground active:opacity-60 transition-opacity"
          >
            Cancel all
          </button>
        )}
      </div>

      {/* List — each item manages its own drawer */}
      <div className="py-2 divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40">
        {orders.map((o, i) => <OrderCard key={i} order={o} />)}
      </div>

      <CancelAllDrawer open={cancelAllOpen} onClose={() => setCancelAllOpen(false)} />
    </div>
  );
}
