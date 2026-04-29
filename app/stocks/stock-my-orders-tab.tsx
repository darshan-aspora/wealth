"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderFilter = "active" | "completed" | "failed";
type OrderSide  = "B" | "S";

interface Order {
  id: string;
  side: OrderSide;
  symbol: string;
  ltp: number;
  filledQty: number;
  totalQty: number;
  unit?: string;       // "Lot" for options/futures, omit for shares
  orderType: "limit" | "market" | "sl";
  limitPrice?: number;
  slTrigger?: number;
  avgPrice?: number;   // completed orders
  failReason?: string; // failed orders
  filter: OrderFilter;
  time: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function buildOrders(symbol: string, ltp: number): Order[] {
  return [
    // ── Active ──
    { id: "a1", side: "B", symbol, ltp, filledQty: 0, totalQty: 5,  orderType: "limit",  limitPrice: ltp - 1.30, filter: "active",    time: "10:32 AM" },
    { id: "a2", side: "B", symbol, ltp, filledQty: 3, totalQty: 5,  orderType: "market",                         filter: "active",    time: "10:18 AM" },
    { id: "a3", side: "B", symbol, ltp, filledQty: 4, totalQty: 5,  orderType: "limit",  limitPrice: ltp - 1.30, filter: "active",    time: "10:05 AM" },
    { id: "a4", side: "B", symbol: `${symbol} 150 APR 27 Put`, ltp, filledQty: 0, totalQty: 2, unit: "Lot", orderType: "sl", slTrigger: 18, filter: "active", time: "9:47 AM" },
    // ── Completed ──
    { id: "c1", side: "B", symbol, ltp, filledQty: 10, totalQty: 10, orderType: "limit", limitPrice: ltp - 3.20, avgPrice: ltp - 3.30, filter: "completed", time: "Yesterday" },
    { id: "c2", side: "S", symbol, ltp, filledQty: 5,  totalQty: 5,  orderType: "market",                        avgPrice: ltp + 0.40, filter: "completed", time: "Yesterday" },
    { id: "c3", side: "B", symbol: `${symbol} 200 MAR Put`, ltp, filledQty: 3, totalQty: 3, unit: "Lot", orderType: "limit", limitPrice: 15.50, avgPrice: 15.40, filter: "completed", time: "Apr 20" },
    // ── Failed ──
    { id: "f1", side: "B", symbol, ltp, filledQty: 0, totalQty: 8, orderType: "limit",  limitPrice: ltp - 16.00, failReason: "Insufficient funds",    filter: "failed", time: "Apr 18" },
    { id: "f2", side: "S", symbol, ltp, filledQty: 0, totalQty: 3, orderType: "market",                          failReason: "Insufficient holdings", filter: "failed", time: "Apr 17" },
  ];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function orderDetail(order: Order): string {
  if (order.orderType === "limit" && order.limitPrice != null) {
    return `Limit at $${order.limitPrice.toFixed(2)}`;
  }
  if (order.orderType === "sl" && order.slTrigger != null) {
    return `SL Trigger $${order.slTrigger}`;
  }
  return "Market Price";
}

function qtyLabel(order: Order): string {
  const unit = order.unit ? ` ${order.unit}` : "";
  return `${order.filledQty} / ${order.totalQty}${unit}`;
}

// ─── Segmented Control ────────────────────────────────────────────────────────

function SegmentedControl({
  value,
  onChange,
}: {
  value: OrderFilter;
  onChange: (v: OrderFilter) => void;
}) {
  const tabs: { key: OrderFilter; label: string }[] = [
    { key: "active",    label: "Active"    },
    { key: "completed", label: "Completed" },
    { key: "failed",    label: "Failed"    },
  ];

  return (
    <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "relative flex-1 py-2.5 rounded-[8px] text-[14px] font-semibold transition-all duration-200",
            value === key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Side Badge ──────────────────────────────────────────────────────────────

function SideBadge({ side }: { side: OrderSide }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[4px] px-[5px] py-[2px] text-[11px] font-bold leading-none",
        side === "B"
          ? "bg-gain/15 text-gain"
          : "bg-loss/15 text-loss"
      )}
    >
      {side}
    </span>
  );
}

// ─── Order Card ──────────────────────────────────────────────────────────────

function OrderCard({
  order,
  filter,
  expanded,
  onToggle,
}: {
  order: Order;
  filter: OrderFilter;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-colors",
        expanded ? "border-border/60 bg-muted/20" : "border-border/40 bg-muted/10"
      )}
    >
      {/* Main row */}
      <button
        onClick={onToggle}
        className="w-full rounded-xl bg-background border border-border/40 px-4 py-3 flex items-center justify-between active:bg-muted/30 transition-colors"
      >
        {/* Left: side badge + symbol + LTP */}
        <div className="flex flex-col gap-1 items-start min-w-0">
          <div className="flex items-center gap-2">
            <SideBadge side={order.side} />
            <span className="text-[14px] font-bold text-foreground leading-snug truncate max-w-[180px]">
              {order.symbol}
            </span>
          </div>
          <span className="text-[12px] text-muted-foreground ml-[22px]">
            LTP: ${order.ltp.toFixed(2)}
          </span>
        </div>

        {/* Right: qty + order type / avg price / fail reason */}
        <div className="flex flex-col gap-1 items-end shrink-0 ml-3">
          <span className="text-[14px] font-bold text-foreground tabular-nums">
            {qtyLabel(order)}
          </span>

          {filter === "completed" && order.avgPrice != null ? (
            <span className="text-[12px] text-muted-foreground">
              Avg. ${order.avgPrice.toFixed(2)}
            </span>
          ) : filter === "failed" && order.failReason ? (
            <span className="text-[12px] text-loss">
              {order.failReason}
            </span>
          ) : (
            <span className="text-[12px] text-muted-foreground whitespace-nowrap">
              {orderDetail(order)}
            </span>
          )}
        </div>
      </button>

      {/* Expanded actions — active orders only */}
      <AnimatePresence initial={false}>
        {expanded && filter === "active" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5">
              <button className="text-[13px] font-medium text-foreground/70 active:opacity-50 transition-opacity">
                Cancel
              </button>
              <div className="h-4 w-px bg-border/40" />
              <span className="text-[12px] text-muted-foreground tabular-nums">
                {order.time}
              </span>
              <div className="h-4 w-px bg-border/40" />
              <button className="flex items-center gap-1 text-[13px] font-medium text-foreground active:opacity-50 transition-opacity">
                Modify
                <ArrowRight size={12} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Completed: show time + avg in footer */}
        {expanded && filter === "completed" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-[12px] text-muted-foreground">{order.time}</span>
              <span className="text-[12px] font-medium text-gain">Filled</span>
            </div>
          </motion.div>
        )}

        {/* Failed: show time + reason in footer */}
        {expanded && filter === "failed" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-[12px] text-muted-foreground">{order.time}</span>
              <span className="text-[12px] font-medium text-loss">Failed</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: OrderFilter }) {
  const msgs: Record<OrderFilter, string> = {
    active:    "No active orders right now.",
    completed: "No completed orders yet.",
    failed:    "No failed orders.",
  };
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
      <p className="text-[15px] font-semibold text-foreground/60">{msgs[filter]}</p>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function StockMyOrdersTab({ symbol, ltp }: { symbol: string; ltp: number }) {
  const [filter, setFilter] = useState<OrderFilter>("active");
  const [expandedId, setExpandedId] = useState<string | null>("a1");

  const orders = buildOrders(symbol, ltp).filter((o) => o.filter === filter);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="px-4 pt-5 pb-8 flex flex-col gap-5">
      {/* Description */}
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        Track all your buy and sell orders in one place.
      </p>

      {/* Segmented control */}
      <SegmentedControl value={filter} onChange={(v) => { setFilter(v); setExpandedId(null); }} />

      {/* Count row */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-muted-foreground">
            {orders.length} Order{orders.length !== 1 ? "s" : ""}
          </span>
          {filter === "active" && (
            <button className="text-[14px] font-medium text-muted-foreground active:opacity-50 transition-opacity">
              Cancel all
            </button>
          )}
        </div>
      )}

      {/* Order list */}
      {orders.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              filter={filter}
              expanded={expandedId === order.id}
              onToggle={() => toggle(order.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
