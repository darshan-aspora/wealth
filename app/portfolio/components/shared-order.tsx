"use client";

import { useState } from "react";
import { X, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Types (exported for consumers)                                     */
/* ------------------------------------------------------------------ */

export type OrderSide = "B" | "S";
export type PriceType = "market" | "limit" | "sl_trigger" | "sl_limit" | "trigger";

export interface BaseOrder {
  symbol:         string;
  companyName:    string;
  category?:      string;
  expiry?:        string;
  optionType?:    "CALL" | "PUT";
  tag?:           "ETF";
  side:           OrderSide;
  filledQty:      number;
  totalQty:       number;
  lots?:          number;
  priceType:      PriceType;
  price:          number;
  investedAmount: number;
  charges:        number;
  brokerage:      number;
  regulatoryFee:  number;
  secFee:         number;
  finraFee:       number;
  exchangeFee:    number;
  opraFee:        number;
  orderId:        string;
  time:           string;
  executedAt:     string;
}

export interface OpenOrder      extends BaseOrder { kind: "open" }
export interface CompletedOrder extends BaseOrder { kind: "completed"; avgExecutedPrice: number; triggerPrice?: number }
export interface FailedOrder    extends BaseOrder { kind: "failed"; failReason: string; failDetail?: string }

export type Order = OpenOrder | CompletedOrder | FailedOrder;

/* ------------------------------------------------------------------ */
/*  Helpers (exported so orders.tsx can re-use)                        */
/* ------------------------------------------------------------------ */

export function fmtQty(n: number) {
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

export function priceTypeLabel(priceType: PriceType): string {
  switch (priceType) {
    case "market":     return "Market";
    case "limit":      return "Limit";
    case "sl_trigger": return "SL Trigger";
    case "sl_limit":   return "SL Limit";
    case "trigger":    return "Trigger";
  }
}

export function priceLabel(priceType: PriceType, price: number): string {
  switch (priceType) {
    case "market":     return "Market Price";
    case "limit":      return `Limit at $${price}`;
    case "sl_trigger": return `SL Trigger $${price}`;
    case "sl_limit":   return `SL Limit $${price}`;
    case "trigger":    return `Trigger at $${price}`;
  }
}

export function sideLabel(side: OrderSide) {
  return side === "B" ? "Buy" : "Sell";
}

/* ------------------------------------------------------------------ */
/*  Internal sub-components                                            */
/* ------------------------------------------------------------------ */

export function SideBadge({ side }: { side: OrderSide }) {
  return (
    <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-md text-[14px] font-bold shrink-0 bg-muted text-foreground">
      {side}
    </span>
  );
}

export function QtyRight({ order }: { order: Order }) {
  const filled   = fmtQty(order.filledQty);
  const total    = fmtQty(order.totalQty);
  const isLot    = order.lots !== undefined;
  const suffix   = isLot ? " Lot" : "";
  const complete = order.filledQty === order.totalQty || order.kind === "completed";
  return (
    <span className="text-[16px] font-bold text-foreground tabular-nums whitespace-nowrap">
      {complete ? `${total}${suffix}` : `${filled} / ${total}${suffix}`}
    </span>
  );
}

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
/*  Drawer                                                             */
/* ------------------------------------------------------------------ */

export function OrderDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  const [chargesExpanded, setChargesExpanded] = useState(false);
  const [regExpanded, setRegExpanded]         = useState(false);
  const label       = [order.symbol, order.expiry, order.optionType].filter(Boolean).join(" ");
  const isCompleted = order.kind === "completed";
  const isFailed    = order.kind === "failed";
  const isOpen      = order.kind === "open";
  const isLot       = order.lots !== undefined;

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[92dvh] flex flex-col inset-x-0 mx-auto max-w-[430px]">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 pt-2 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-foreground leading-tight">{order.companyName}</p>
              <p className="text-[14px] text-muted-foreground mt-1">{priceTypeLabel(order.priceType)} · {sideLabel(order.side)} · {order.time}</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1 -mr-1 -mt-0.5 active:bg-muted/50 shrink-0">
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5">
          <div className="flex items-center gap-2 pt-3 pb-1">
            <StatusBadge kind={order.kind} />
            <p className="text-[16px] font-semibold text-muted-foreground">{label}</p>
          </div>

          {isFailed && (
            <div className="mt-3 rounded-xl bg-red-50 px-3.5 py-3">
              <p className="text-[16px] font-bold text-red-500">{(order as FailedOrder).failReason}</p>
              {(order as FailedOrder).failDetail && (
                <p className="text-[14px] text-red-400 mt-0.5">{(order as FailedOrder).failDetail}</p>
              )}
            </div>
          )}

          <DetailRow
            label="Filled Quantity"
            value={isLot
              ? `${fmtQty(order.filledQty)} / ${fmtQty(order.totalQty)} Lot`
              : `${fmtQty(order.filledQty)} / ${fmtQty(order.totalQty)}`}
          />
          <Divider />

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
          {isCompleted && (
            <>
              <DetailRow
                label={order.side === "B" ? "Avg. Buy Price" : "Avg. Sell Price"}
                value={`$${(order as CompletedOrder).avgExecutedPrice}`}
              />
              <Divider />
            </>
          )}

          <DetailRow label="Invested Amount" value={`$${order.investedAmount.toFixed(2)}`} />
          <Divider />

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
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] text-muted-foreground">Aspora Brokerage</p>
                    <p className="text-[16px] text-muted-foreground tabular-nums">${order.brokerage.toFixed(2)}</p>
                  </div>
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

        <div className="shrink-0 px-5 pb-6 pt-3 border-t border-border/40">
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
/*  Self-contained card components (manage their own drawer state)     */
/* ------------------------------------------------------------------ */

export function OrderCard({ order }: { order: Order }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const label = [order.symbol, order.expiry, order.optionType].filter(Boolean).join(" ");

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        className="w-full text-left rounded-2xl border border-border/50 bg-white px-5 py-5 active:opacity-75 transition-opacity"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <SideBadge side={order.side} />
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <p className="text-[16px] font-bold text-foreground tracking-wide whitespace-nowrap">{label}</p>
              {order.tag && (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[12px] font-bold text-muted-foreground">{order.tag}</span>
              )}
            </div>
          </div>
          <QtyRight order={order} />
        </div>

        <div className={cn("flex items-center mt-2 pl-[30px]", order.kind === "failed" ? "justify-between" : "justify-end")}>
          {order.kind === "failed" && (
            <p className="text-[16px] font-semibold text-red-500">{(order as FailedOrder).failReason}</p>
          )}
          {order.kind === "completed" && (
            <p className="text-[16px] text-muted-foreground font-medium">
              {order.priceType === "market" ? "Market Price" : "Limit Price"}: ${(order as CompletedOrder).avgExecutedPrice}
            </p>
          )}
          {order.kind === "open" && (
            <p className="text-[16px] text-muted-foreground font-medium">{priceLabel(order.priceType, order.price)}</p>
          )}
        </div>
      </button>

      {drawerOpen && <OrderDrawer order={order} onClose={() => setDrawerOpen(false)} />}
    </>
  );
}
