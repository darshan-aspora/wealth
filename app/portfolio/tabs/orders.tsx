"use client";

import { useState } from "react";
import { X, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type OrderTab  = "open" | "completed" | "failed";
type OrderSide = "B" | "S";
type PriceType = "market" | "limit" | "sl_trigger" | "sl_limit" | "trigger";

interface BaseOrder {
  symbol:      string;
  companyName: string;
  category?:   string;       // e.g. "#MegaCap", "#Option"
  expiry?:     string;
  optionType?: "CALL" | "PUT";
  tag?:        "ETF";
  side:        OrderSide;
  filledQty:   number;
  totalQty:    number;
  lots?:       number;
  priceType:   PriceType;
  price:       number;
  investedAmount: number;
  charges:      number;
  brokerage:    number;
  regulatoryFee: number;
  secFee:       number;
  finraFee:     number;
  exchangeFee:  number;
  opraFee:      number;
  orderId:     string;
  time:        string;
  executedAt:  string;
}

interface OpenOrder extends BaseOrder      { kind: "open" }
interface CompletedOrder extends BaseOrder { kind: "completed"; avgExecutedPrice: number; triggerPrice?: number }
interface FailedOrder extends BaseOrder    { kind: "failed"; failReason: string; failDetail?: string }

type Order = OpenOrder | CompletedOrder | FailedOrder;

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const OPEN_ORDERS: OpenOrder[] = [
  { kind: "open", symbol: "AAPL", companyName: "Apple Inc",  category: "#MegaCap",  expiry: "230 APR 27", optionType: "CALL", side: "B", filledQty: 0,    totalQty: 1,  lots: 1,  priceType: "limit",      price: 12.3,  investedAmount: 30,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123456", time: "10:32 AM", executedAt: "10:02:34" },
  { kind: "open", symbol: "TSLA", companyName: "Tesla Inc",  category: "#MegaCap",                                             side: "S", filledQty: 2.45, totalQty: 15,           priceType: "market",     price: 220,   investedAmount: 50,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123457", time: "10:15 AM", executedAt: "10:15:22" },
  { kind: "open", symbol: "NVDA", companyName: "NVIDIA Corp",category: "#Growth",                                               side: "B", filledQty: 6,    totalQty: 12,           priceType: "limit",      price: 870,   investedAmount: 870, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123458", time: "09:55 AM", executedAt: "09:55:10" },
  { kind: "open", symbol: "QQQ",  companyName: "Invesco QQQ",category: "#Index",    tag: "ETF",                                 side: "B", filledQty: 3,    totalQty: 15,           priceType: "limit",      price: 390,   investedAmount: 390, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123459", time: "09:40 AM", executedAt: "09:40:00" },
  { kind: "open", symbol: "VOO",  companyName: "Vanguard S&P",category: "#Index",   tag: "ETF",                                 side: "B", filledQty: 0,    totalQty: 50,           priceType: "limit",      price: 240,   investedAmount: 240, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123460", time: "09:30 AM", executedAt: "09:30:00" },
  { kind: "open", symbol: "AMD",  companyName: "AMD Inc",    category: "#Option",   expiry: "150 APR 27", optionType: "PUT",   side: "S", filledQty: 0,    totalQty: 2,  lots: 2,  priceType: "sl_trigger", price: 18,    investedAmount: 18,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123461", time: "09:20 AM", executedAt: "09:20:00" },
  { kind: "open", symbol: "GLD",  companyName: "SPDR Gold",  category: "#Commodity",tag: "ETF",                                 side: "B", filledQty: 0,    totalQty: 15,           priceType: "market",     price: 318,   investedAmount: 318, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123462", time: "09:10 AM", executedAt: "09:10:00" },
  { kind: "open", symbol: "SPY",  companyName: "SPDR S&P 500",category: "#Index",                                               side: "B", filledQty: 8,    totalQty: 20,           priceType: "trigger",    price: 510,   investedAmount: 510, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD123463", time: "09:05 AM", executedAt: "09:05:00" },
];

const COMPLETED_ORDERS: CompletedOrder[] = [
  { kind: "completed", symbol: "AAPL", companyName: "Apple Inc",   category: "#MegaCap",  expiry: "230 APR 27", optionType: "CALL", side: "B", filledQty: 1,  totalQty: 1,  lots: 1,  priceType: "market", price: 112,  avgExecutedPrice: 112,  investedAmount: 30,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223401", time: "10:32 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "TSLA", companyName: "Tesla Inc",   category: "#MegaCap",                                            side: "S", filledQty: 5,  totalQty: 5,            priceType: "market", price: 312,  avgExecutedPrice: 312,  investedAmount: 50,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223402", time: "10:15 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "SPY",  companyName: "SPDR S&P 500",category: "#Index",                                              side: "B", filledQty: 15, totalQty: 15,           priceType: "limit",  price: 600,  avgExecutedPrice: 598,  investedAmount: 600, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223403", time: "10:02 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "META", companyName: "Meta Platforms",category: "#Option", expiry: "350 APR 12", optionType: "CALL", side: "B", filledQty: 5,  totalQty: 5,  lots: 5,  priceType: "market", price: 21.68,avgExecutedPrice: 21.68, investedAmount: 300, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223404", time: "09:48 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "QQQ",  companyName: "Invesco QQQ", category: "#Index",                                              side: "S", filledQty: 3,  totalQty: 3,            priceType: "market", price: 410,  avgExecutedPrice: 410,  investedAmount: 410, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223405", time: "09:35 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "VOO",  companyName: "Vanguard S&P",category: "#Index",    tag: "ETF",                               side: "B", filledQty: 16, totalQty: 16,           priceType: "limit",  price: 245,  avgExecutedPrice: 244.8, investedAmount: 244, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223406", time: "09:20 AM", executedAt: "10:02:34" },
  { kind: "completed", symbol: "AMD",  companyName: "AMD Inc",     category: "#Option",   expiry: "150 APR 27", optionType: "PUT",  side: "B", filledQty: 4,  totalQty: 4,  lots: 4,  priceType: "market", price: 18,   avgExecutedPrice: 18,   investedAmount: 18,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD223407", time: "09:05 AM", executedAt: "10:02:34" },
];

const FAILED_ORDERS: FailedOrder[] = [
  { kind: "failed", symbol: "AAPL", companyName: "Apple Inc",   category: "#MegaCap",  expiry: "230 APR 27", optionType: "CALL", side: "S", filledQty: 0,  totalQty: 1,  lots: 1,  priceType: "trigger",    price: 12.3, investedAmount: 30,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323501", time: "10:32 AM", executedAt: "10:02:34", failReason: "Rejected" },
  { kind: "failed", symbol: "TSLA", companyName: "Tesla Inc",   category: "#MegaCap",                                             side: "S", filledQty: 2,  totalQty: 15,           priceType: "market",     price: 220,  investedAmount: 50,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323502", time: "10:15 AM", executedAt: "10:02:34", failReason: "Cancelled by you" },
  { kind: "failed", symbol: "NVDA", companyName: "NVIDIA Corp", category: "#Growth",                                               side: "B", filledQty: 12, totalQty: 12,           priceType: "limit",      price: 870,  investedAmount: 870, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323503", time: "09:55 AM", executedAt: "10:02:34", failReason: "Rejected" },
  { kind: "failed", symbol: "QQQ",  companyName: "Invesco QQQ", category: "#Index",    tag: "ETF",                                 side: "B", filledQty: 0,  totalQty: 15,           priceType: "trigger",    price: 390,  investedAmount: 390, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323504", time: "09:40 AM", executedAt: "10:02:34", failReason: "Margin not met" },
  { kind: "failed", symbol: "VOO",  companyName: "Vanguard S&P",category: "#Index",    tag: "ETF",                                 side: "B", filledQty: 0,  totalQty: 50,           priceType: "trigger",    price: 240,  investedAmount: 240, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323505", time: "09:30 AM", executedAt: "10:02:34", failReason: "Cancelled by System" },
  { kind: "failed", symbol: "AMD",  companyName: "AMD Inc",     category: "#Option",   expiry: "150 APR 27", optionType: "PUT",   side: "S", filledQty: 0,  totalQty: 2,  lots: 2,  priceType: "sl_trigger", price: 18,   investedAmount: 18,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323506", time: "09:20 AM", executedAt: "10:02:34", failReason: "Expired" },
  { kind: "failed", symbol: "GLD",  companyName: "SPDR Gold",   category: "#Commodity",tag: "ETF",                                 side: "B", filledQty: 0,  totalQty: 15,           priceType: "market",     price: 318,  investedAmount: 318, charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323507", time: "09:10 AM", executedAt: "10:02:34", failReason: "Invalid Price Hike" },
  { kind: "failed", symbol: "TSLA", companyName: "Tesla Inc",   category: "#MegaCap",                                              side: "S", filledQty: 0,  totalQty: 15,           priceType: "limit",      price: 410,  investedAmount: 50,  charges: 0.70, brokerage: 0.05, regulatoryFee: 0.65, secFee: 0.20, finraFee: 0.15, exchangeFee: 0.20, opraFee: 0.10, orderId: "ORD323508", time: "09:05 AM", executedAt: "10:02:34", failReason: "Insufficient buying power", failDetail: "Required margin is 415 but buying power is 400" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtQty(n: number) {
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

function priceTypeLabel(priceType: PriceType): string {
  switch (priceType) {
    case "market":     return "Market";
    case "limit":      return "Limit";
    case "sl_trigger": return "SL Trigger";
    case "sl_limit":   return "SL Limit";
    case "trigger":    return "Trigger";
  }
}

function priceLabel(priceType: PriceType, price: number): string {
  switch (priceType) {
    case "market":     return "Market Price";
    case "limit":      return `Limit at $${price}`;
    case "sl_trigger": return `SL Trigger $${price}`;
    case "sl_limit":   return `SL Limit $${price}`;
    case "trigger":    return `Trigger at $${price}`;
  }
}

function sideLabel(side: OrderSide) {
  return side === "B" ? "Buy" : "Sell";
}

/* ------------------------------------------------------------------ */
/*  Shared sub-components                                              */
/* ------------------------------------------------------------------ */

function SideBadge({ side }: { side: OrderSide }) {
  return (
    <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-md text-[14px] font-bold shrink-0 bg-muted text-foreground">
      {side}
    </span>
  );
}

function QtyRight({ order }: { order: Order }) {
  const filled = fmtQty(order.filledQty);
  const total  = fmtQty(order.totalQty);
  const isLot  = order.lots !== undefined;
  const suffix = isLot ? " Lot" : "";
  const complete = order.filledQty === order.totalQty || order.kind === "completed";

  return (
    <span className="text-[16px] font-bold text-foreground tabular-nums whitespace-nowrap">
      {complete ? `${total}${suffix}` : `${filled} / ${total}${suffix}`}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Drawer detail row                                                  */
/* ------------------------------------------------------------------ */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn("text-muted-foreground transition-transform", open ? "rotate-180" : "")}>
      <path d="M2 4.5L6 8L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DetailRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <p className="text-[16px] text-muted-foreground">{label}</p>
      <p className={cn("text-[16px] font-semibold text-foreground tabular-nums", valueClass)}>{value}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-border/40" />;
}

/* ------------------------------------------------------------------ */
/*  Status badge for drawer header                                     */
/* ------------------------------------------------------------------ */

function StatusBadge({ kind }: { kind: Order["kind"] }) {
  if (kind === "completed") return (
    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[14px] font-bold text-emerald-600 uppercase tracking-wide">Completed</span>
  );
  if (kind === "failed") return (
    <span className="rounded-md bg-red-50 px-2 py-0.5 text-[14px] font-bold text-red-500 uppercase tracking-wide">Failed</span>
  );
  return (
    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[14px] font-bold text-amber-600 uppercase tracking-wide">Open</span>
  );
}

/* ------------------------------------------------------------------ */
/*  Order detail drawer                                                */
/* ------------------------------------------------------------------ */

function OrderDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  const [chargesExpanded, setChargesExpanded] = useState(false);
  const [regExpanded, setRegExpanded] = useState(false);
  const label = [order.symbol, order.expiry, order.optionType].filter(Boolean).join(" ");
  const isCompleted = order.kind === "completed";
  const isFailed    = order.kind === "failed";
  const isOpen      = order.kind === "open";
  const isLot       = order.lots !== undefined;

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-[20px] font-bold text-foreground mb-5">{order.companyName}</p>
              <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                {order.category && (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 font-semibold text-muted-foreground text-[14px]">{order.category}</span>
                )}
                <span>{priceTypeLabel(order.priceType)} · {sideLabel(order.side)} · {order.time}</span>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between self-stretch shrink-0">
              <button onClick={onClose} className="rounded-full p-1 -mr-1 active:bg-muted/50">
                <X size={20} className="text-foreground" />
              </button>
              <StatusBadge kind={order.kind} />
            </div>
          </div>

          {/* Instrument label */}
          <p className="text-[16px] font-semibold text-muted-foreground">{label}</p>

          {/* Failed reason banner */}
          {isFailed && (
            <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-3">
              <p className="text-[16px] font-bold text-red-500">{(order as FailedOrder).failReason}</p>
              {(order as FailedOrder).failDetail && (
                <p className="text-[14px] text-red-400 mt-0.5">{(order as FailedOrder).failDetail}</p>
              )}
            </div>
          )}
        </div>

        <div className="h-px bg-border/40 shrink-0" />

        {/* Details */}
        <div className="overflow-y-auto flex-1 px-5">
          {/* Filled Quantity */}
          <DetailRow
            label="Filled Quantity"
            value={isLot
              ? `${fmtQty(order.filledQty)} / ${fmtQty(order.totalQty)} Lot`
              : `${fmtQty(order.filledQty)} / ${fmtQty(order.totalQty)}`}
          />
          <Divider />

          {/* Price type specific rows */}
          {order.priceType === "limit" && (
            <>
              <DetailRow label="Limit Price" value={`$${order.price}`} />
              <Divider />
            </>
          )}
          {(order.priceType === "sl_trigger" || order.priceType === "trigger") && (
            <>
              <DetailRow label="Trigger Price" value={`$${order.price}`} />
              <Divider />
            </>
          )}
          {isCompleted && (order as CompletedOrder).triggerPrice && (
            <>
              <DetailRow label="Trigger Price" value={`$${(order as CompletedOrder).triggerPrice}`} />
              <Divider />
            </>
          )}

          {/* Avg executed price for completed */}
          {isCompleted && (
            <>
              <DetailRow
                label={order.side === "B" ? "Avg. Buy Price" : "Avg. Sell Price"}
                value={`$${(order as CompletedOrder).avgExecutedPrice}`}
              />
              <Divider />
            </>
          )}

          {/* Invested / order amount */}
          <DetailRow label="Invested Amount" value={`$${order.investedAmount.toFixed(2)}`} />
          <Divider />

          {/* Executed at */}
          {(isCompleted || isOpen) && (
            <>
              <DetailRow label="Order Placed At" value={order.executedAt} />
              <Divider />
            </>
          )}
          {isCompleted && (
            <>
              <DetailRow label="Order Executed At" value={order.executedAt} />
              <Divider />
            </>
          )}
          {isFailed && (
            <>
              <DetailRow label="Order Executed At" value={order.executedAt} />
              <Divider />
            </>
          )}

          {/* Order ID */}
          <div className="flex items-center justify-between py-2.5">
            <p className="text-[16px] text-muted-foreground">Order ID</p>
            <button
              className="flex items-center gap-1.5 active:opacity-60"
              onClick={() => navigator.clipboard?.writeText(order.orderId)}
            >
              <p className="text-[16px] font-semibold text-foreground tabular-nums">#{order.orderId}</p>
              <Copy size={12} className="text-muted-foreground" />
            </button>
          </div>
          <Divider />

          {/* Charges & Fees — only for completed orders */}
          {isCompleted && <>
          <Divider />
          <div className="py-2.5">
            <button
              onClick={() => { setChargesExpanded((v) => !v); setRegExpanded(false); }}
              className="w-full flex items-center justify-between active:opacity-60"
            >
              <div className="flex items-center gap-1.5">
                <p className="text-[16px] text-muted-foreground">Charges &amp; Fees</p>
                <Chevron open={chargesExpanded} />
              </div>
              <p className="text-[16px] font-semibold text-foreground tabular-nums">${order.charges.toFixed(2)}</p>
            </button>

            {chargesExpanded && (
              <div className="mt-2.5 space-y-2.5 border-t border-border/40 pt-2.5">
                {/* Aspora Brokerage */}
                <div className="flex items-center justify-between">
                  <p className="text-[16px] text-muted-foreground">Aspora Brokerage</p>
                  <p className="text-[16px] text-muted-foreground tabular-nums">${order.brokerage.toFixed(2)}</p>
                </div>

                {/* Regulatory Fees — inner accordion */}
                <div>
                  <button
                    onClick={() => setRegExpanded((v) => !v)}
                    className="w-full flex items-center justify-between active:opacity-60"
                  >
                    <div className="flex items-center gap-1.5">
                      <p className="text-[16px] text-muted-foreground">Regulatory Fees</p>
                      <Chevron open={regExpanded} />
                    </div>
                    <p className="text-[16px] text-muted-foreground tabular-nums">${order.regulatoryFee.toFixed(2)}</p>
                  </button>
                  {regExpanded && (
                    <div className="mt-2 space-y-2 border-t border-border/40 pt-2">
                      {[
                        { label: "SEC Fee",       value: order.secFee },
                        { label: "FINRA Fee",     value: order.finraFee },
                        { label: "Exchange Fees", value: order.exchangeFee },
                        { label: "OPRA Fee",      value: order.opraFee },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <p className="text-[14px] text-muted-foreground/70">{label}</p>
                          <p className="text-[14px] text-muted-foreground tabular-nums">${value.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          </>}

          <div className="h-4" />
        </div>

        {/* CTA */}
        <div className="shrink-0 px-5 pb-8 pt-3 border-t border-border/40">
          {isOpen ? (
            <div className="flex gap-3">
              <button className="flex-1 rounded-2xl border border-border/60 py-4 text-[16px] font-bold text-foreground active:opacity-70">
                Cancel Order
              </button>
              <button className="flex-1 rounded-2xl bg-foreground py-4 text-[16px] font-bold text-background active:opacity-75">
                Modify
              </button>
            </div>
          ) : isFailed ? (
            <button className="w-full rounded-2xl bg-foreground py-4 text-[16px] font-bold text-background active:opacity-75">
              Retry
            </button>
          ) : (
            <button className="w-full rounded-2xl border border-border/60 py-4 text-[16px] font-bold text-foreground active:opacity-70">
              Repeat Order
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Card components                                                    */
/* ------------------------------------------------------------------ */

function OpenOrderCard({ order, onTap }: { order: OpenOrder; onTap: () => void }) {
  const label = [order.symbol, order.expiry, order.optionType].filter(Boolean).join(" ");
  return (
    <button onClick={onTap} className="w-full text-left rounded-2xl border border-border/50 bg-white px-5 py-5 active:opacity-75 transition-opacity">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <SideBadge side={order.side} />
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <p className="text-[16px] font-bold text-foreground tracking-wide whitespace-nowrap">{label}</p>
            {order.tag && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[12px] font-bold text-muted-foreground">{order.tag}</span>}
          </div>
        </div>
        <QtyRight order={order} />
      </div>
      <div className="flex items-center justify-between mt-2 pl-[30px]">
        <p className="text-[16px] text-muted-foreground font-medium">LTP: ${order.price}</p>
        <p className="text-[16px] text-muted-foreground font-medium">{priceLabel(order.priceType, order.price)}</p>
      </div>
    </button>
  );
}

function CompletedOrderCard({ order, onTap }: { order: CompletedOrder; onTap: () => void }) {
  const label = [order.symbol, order.expiry, order.optionType].filter(Boolean).join(" ");
  return (
    <button onClick={onTap} className="w-full text-left rounded-2xl border border-border/50 bg-white px-5 py-5 active:opacity-75 transition-opacity">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <SideBadge side={order.side} />
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <p className="text-[16px] font-bold text-foreground tracking-wide whitespace-nowrap">{label}</p>
            {order.tag && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[12px] font-bold text-muted-foreground">{order.tag}</span>}
          </div>
        </div>
        <QtyRight order={order} />
      </div>
      <div className="flex items-center justify-end mt-2 pl-[30px]">
        <p className="text-[16px] text-muted-foreground font-medium">
          {order.priceType === "market" ? "Market Price" : "Limit Price"}: ${order.avgExecutedPrice}
        </p>
      </div>
    </button>
  );
}

function FailedOrderCard({ order, onTap }: { order: FailedOrder; onTap: () => void }) {
  const label = [order.symbol, order.expiry, order.optionType].filter(Boolean).join(" ");
  return (
    <button onClick={onTap} className="w-full text-left rounded-2xl border border-border/50 bg-white px-5 py-5 active:opacity-75 transition-opacity">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <SideBadge side={order.side} />
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <p className="text-[16px] font-bold text-foreground tracking-wide whitespace-nowrap">{label}</p>
            {order.tag && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[12px] font-bold text-muted-foreground">{order.tag}</span>}
          </div>
        </div>
        <QtyRight order={order} />
      </div>
      <div className="flex items-center justify-between mt-2 pl-[30px]">
        <p className="text-[16px] font-semibold text-red-500">{order.failReason}</p>
        <p className="text-[16px] text-muted-foreground font-medium">{priceLabel(order.priceType, order.price)}</p>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab                                                                */
/* ------------------------------------------------------------------ */

const TABS: { id: OrderTab; label: string }[] = [
  { id: "open",      label: "Open"      },
  { id: "completed", label: "Completed" },
  { id: "failed",    label: "Failed"    },
];

export function OrdersTab() {
  const [activeTab, setActiveTab]     = useState<OrderTab>("open");
  const [selectedOrder, setSelected]  = useState<Order | null>(null);

  const showCancelAll = activeTab === "open";
  const orders = activeTab === "open" ? OPEN_ORDERS : activeTab === "completed" ? COMPLETED_ORDERS : FAILED_ORDERS;

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
        {showCancelAll && (
          <button className="text-[16px] font-semibold text-muted-foreground active:opacity-60">Cancel all</button>
        )}
      </div>

      {/* Cards */}
      <div className="px-5 space-y-2.5">
        {activeTab === "open"      && OPEN_ORDERS.map((o, i)      => <OpenOrderCard      key={i} order={o} onTap={() => setSelected(o)} />)}
        {activeTab === "completed" && COMPLETED_ORDERS.map((o, i) => <CompletedOrderCard key={i} order={o} onTap={() => setSelected(o)} />)}
        {activeTab === "failed"    && FAILED_ORDERS.map((o, i)    => <FailedOrderCard    key={i} order={o} onTap={() => setSelected(o)} />)}
      </div>

      {/* Detail drawer */}
      {selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelected(null)} />}
    </div>
  );
}
