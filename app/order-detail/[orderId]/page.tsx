"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { X, Copy, ChevronDown, CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import {
  type Order,
  type FailedOrder,
  type CompletedOrder,
  fmtQty,
  priceTypeLabel,
  sideLabel,
  ALL_ORDERS,
} from "@/app/portfolio/components/shared-order";

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function InfoRow({ label, value, valueClass, mono }: { label: string; value: string; valueClass?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border/25 last:border-0">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className={cn("text-[14px] font-semibold text-foreground", mono && "tabular-nums", valueClass)}>{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-6 mb-2">{children}</p>;
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl bg-white px-4", className)}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

type ExecutionStatus = "placed" | "partial" | "executed" | "failed" | "cancelled";

function deriveStatus(order: Order): ExecutionStatus {
  if (order.kind === "failed") {
    const reason = (order as FailedOrder).failReason?.toLowerCase() ?? "";
    return reason.includes("cancel") ? "cancelled" : "failed";
  }
  if (order.kind === "completed") return "executed";
  if (order.filledQty > 0 && order.filledQty < order.totalQty) return "partial";
  return "placed";
}

const STATUS_META: Record<ExecutionStatus, { label: string; color: string; bg: string; desc: string }> = {
  placed:    { label: "Placed",             color: "text-amber-600",  bg: "bg-amber-50",   desc: "Order submitted and awaiting execution." },
  partial:   { label: "Partially Executed", color: "text-blue-600",   bg: "bg-blue-50",    desc: "Some quantity has been filled. Remaining is still active." },
  executed:  { label: "Executed",           color: "text-gain",       bg: "bg-gain/10",    desc: "Order has been fully executed at the exchange." },
  failed:    { label: "Failed",             color: "text-loss",       bg: "bg-loss/10",    desc: "Order could not be processed by the exchange." },
  cancelled: { label: "Cancelled",          color: "text-muted-foreground", bg: "bg-muted", desc: "Order was cancelled before execution." },
};

const SOURCE_LABEL: Record<string, string> = {
  direct:     "Direct",
  sip:        "SIP (Scheduled)",
  collection: "Collection",
};

/* ------------------------------------------------------------------ */
/*  Timeline                                                           */
/* ------------------------------------------------------------------ */

function Timeline({ order, status }: { order: Order; status: ExecutionStatus }) {
  const steps: { label: string; time?: string; done: boolean; active?: boolean }[] = [
    { label: "Order Placed",   time: order.placedAt ?? order.time, done: true },
    { label: "Order Received", time: order.executedAt,             done: status !== "placed" },
    ...(status === "partial" ? [{ label: "Partially Filled", time: order.executedAt, done: true, active: true }] : []),
    { label: status === "executed" ? "Fully Executed" : status === "failed" ? "Order Failed" : status === "cancelled" ? "Order Cancelled" : "Awaiting Fill",
      time: (status === "executed" || status === "failed" || status === "cancelled") ? order.executedAt : undefined,
      done: status === "executed" || status === "failed" || status === "cancelled",
      active: status === "placed" || status === "partial",
    },
  ];

  return (
    <div className="py-1">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          {/* Spine */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-3",
              step.done ? "bg-foreground/15" : step.active ? "border-2 border-border" : "bg-muted"
            )}>
              {step.done
                ? <CheckCircle2 size={12} strokeWidth={2.5} className="text-foreground/60" />
                : step.active
                ? <Clock size={10} strokeWidth={2.5} className="text-muted-foreground" />
                : <Circle size={10} strokeWidth={2} className="text-muted-foreground/40" />}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px flex-1 my-1 min-h-[16px] bg-border/40" />
            )}
          </div>
          {/* Content */}
          <div className="pb-4 flex-1 pt-3">
            <p className={cn("text-[13px] font-semibold leading-tight", step.done ? "text-foreground" : "text-muted-foreground/60")}>{step.label}</p>
            {step.time && <p className="text-[12px] text-muted-foreground mt-0.5 tabular-nums">{step.time}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OrderDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const orderId = params.orderId as string;

  const order = ALL_ORDERS.find((o) => o.orderId === orderId);
  const [copied, setCopied]           = useState(false);
  const [chargesOpen, setChargesOpen] = useState(false);
  const [regOpen, setRegOpen]         = useState(false);

  if (!order) {
    return (
      <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col items-center justify-center bg-[#f0f0f5]">
        <p className="text-muted-foreground">Order not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-foreground font-semibold">Go back</button>
      </div>
    );
  }

  const label       = [order.symbol, order.expiry, order.optionType].filter(Boolean).join(" ");
  const isCompleted = order.kind === "completed";
  const isFailed    = order.kind === "failed";
  const isOpen      = order.kind === "open";
  const isLot       = order.lots !== undefined;
  const status      = deriveStatus(order);
  const meta        = STATUS_META[status];
  const isPartial   = status === "partial";

  const qtyLabel = isLot
    ? `${fmtQty(order.filledQty)} / ${fmtQty(order.totalQty)} Lot`
    : `${fmtQty(order.filledQty)} / ${fmtQty(order.totalQty)} Shares`;

  const copyId = () => {
    navigator.clipboard?.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col bg-[#f0f0f5] overflow-hidden">
      <StatusBar />

      {/* ── Nav bar ── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.back()} className="rounded-full p-2 active:opacity-60">
          <X size={16} strokeWidth={2.5} className="text-foreground" />
        </button>
        <p className="text-[15px] font-bold text-foreground">Order Details</p>
        <div className="w-9" />
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">

        {/* ── Instrument hero ── */}
        <Card className="pt-5 pb-4 mb-1">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-[15px] bg-muted text-foreground">
                {order.side}
              </div>
              <div>
                <p className="text-[17px] font-bold text-foreground leading-tight">{label}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{order.companyName}</p>
              </div>
            </div>
            {/* Status chip */}
            <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold bg-muted text-muted-foreground">
              {meta.label}
            </span>
          </div>

          {/* Key stats row */}
          <div className="flex gap-0 rounded-xl bg-muted/40 overflow-hidden">
            <div className="flex-1 px-3 py-2.5 border-r border-border/20">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Amount</p>
              <p className="text-[15px] font-bold text-foreground tabular-nums">${order.investedAmount.toFixed(2)}</p>
            </div>
            <div className="flex-1 px-3 py-2.5 border-r border-border/20">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Qty</p>
              <p className="text-[15px] font-bold text-foreground tabular-nums">{qtyLabel}</p>
            </div>
            <div className="flex-1 px-3 py-2.5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Side</p>
              <p className="text-[15px] font-bold text-foreground tabular-nums">{sideLabel(order.side)}</p>
            </div>
          </div>

          {/* Reason */}
          <div className="mt-3 rounded-xl bg-muted/40 px-3 py-2.5">
            <p className="text-[13px] font-medium text-foreground leading-snug">
              {isFailed
                ? ((order as FailedOrder).failDetail ?? (order as FailedOrder).failReason)
                : meta.desc}
            </p>
          </div>
        </Card>

        {/* ── Order Info ── */}
        <SectionLabel>Order Info</SectionLabel>
        <Card>
          <InfoRow label="Order Type"   value={priceTypeLabel(order.priceType)} />
          {order.priceType !== "market" && (
            <InfoRow label={order.priceType === "limit" ? "Limit Price" : "Trigger Price"} value={`$${order.price}`} mono />
          )}
          {isCompleted && (
            <InfoRow
              label={order.side === "B" ? "Avg. Buy Price" : "Avg. Sell Price"}
              value={`$${(order as CompletedOrder).avgExecutedPrice}`}
              mono
            />
          )}
          <InfoRow label="Source"   value={SOURCE_LABEL[order.orderSource ?? "direct"]} />
          <div className="flex items-center justify-between py-3.5 border-b border-border/25">
            <p className="text-[13px] text-muted-foreground">Order ID</p>
            <button onClick={copyId} className="flex items-center gap-1.5 active:opacity-60">
              <p className="text-[14px] font-semibold text-foreground tabular-nums">{order.orderId}</p>
              <Copy size={11} className={cn("transition-colors", copied ? "text-gain" : "text-muted-foreground")} />
            </button>
          </div>
          <InfoRow label="Date & Time" value={`Apr 23, 2026 · ${order.time}`} />
        </Card>

        {/* ── Timeline ── */}
        <SectionLabel>Track</SectionLabel>
        <Card className="px-4 py-2">
          <Timeline order={order} status={status} />
        </Card>

        {/* ── Charges & Fees ── */}
        <SectionLabel>Charges &amp; Fees</SectionLabel>
        <Card className="px-0 overflow-hidden">
          <button
            onClick={() => { setChargesOpen((v) => !v); if (chargesOpen) setRegOpen(false); }}
            className="w-full flex items-center justify-between px-4 py-3.5 active:bg-muted/30 transition-colors border-b border-border/25"
          >
            <div className="flex items-center gap-1.5">
              <p className="text-[14px] font-semibold text-foreground">Total Charges</p>
              <ChevronDown size={14} strokeWidth={2.5} className={cn("text-muted-foreground transition-transform", chargesOpen && "rotate-180")} />
            </div>
            <p className="text-[14px] font-semibold text-foreground tabular-nums">${order.charges.toFixed(2)}</p>
          </button>

          {chargesOpen && (
            <div className="bg-muted/10">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                <p className="text-[13px] text-muted-foreground">Aspora Brokerage</p>
                <p className="text-[13px] tabular-nums text-muted-foreground">${order.brokerage.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setRegOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 active:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <p className="text-[13px] text-muted-foreground">Regulatory Fees</p>
                  <ChevronDown size={12} strokeWidth={2.5} className={cn("text-muted-foreground transition-transform", regOpen && "rotate-180")} />
                </div>
                <p className="text-[13px] tabular-nums text-muted-foreground">${order.regulatoryFee.toFixed(2)}</p>
              </button>
              {regOpen && (
                <div className="border-t border-border/20 bg-muted/20">
                  {[
                    { label: "SEC Fee",       value: order.secFee },
                    { label: "FINRA Fee",     value: order.finraFee },
                    { label: "Exchange Fees", value: order.exchangeFee },
                    { label: "OPRA Fee",      value: order.opraFee },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-6 py-2.5 border-b border-border/15 last:border-0">
                      <p className="text-[12px] text-muted-foreground/70">{label}</p>
                      <p className="text-[12px] tabular-nums text-muted-foreground">${value.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        <div className="h-2" />
      </div>

      {/* ── Sticky footer ── */}
      <div className="shrink-0 px-5 pt-4 pb-8 bg-white border-t border-border/40">
        <div className="flex gap-3 mb-4">
          {isOpen ? (
            <>
              <button className="flex-1 rounded-2xl border border-border/60 py-4 text-[15px] font-bold text-foreground active:opacity-70">
                Cancel
              </button>
              <button className="flex-1 rounded-2xl bg-foreground py-4 text-[15px] font-bold text-background active:opacity-75">
                Modify
              </button>
            </>
          ) : isFailed ? (
            <button className="w-full rounded-2xl bg-foreground py-4 text-[15px] font-bold text-background active:opacity-75">
              Retry Order
            </button>
          ) : (
            <button className="w-full rounded-2xl border border-border/60 py-4 text-[15px] font-bold text-foreground active:opacity-70">
              Repeat Order
            </button>
          )}
        </div>
        <div className="flex items-center justify-center gap-6">
          <button className="text-[13px] text-muted-foreground underline underline-offset-2 active:opacity-50">
            Contact Us
          </button>
          <div className="w-px h-3 bg-border" />
          <button className="text-[13px] text-muted-foreground underline underline-offset-2 active:opacity-50">
            FAQs
          </button>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
