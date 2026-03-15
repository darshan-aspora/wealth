"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

interface MyOrdersTabProps {
  symbol: string;
}

type OrderStatus = "pending" | "executed" | "cancelled";
type OrderType = "Market" | "Limit" | "Recurring";
type OrderSide = "Buy" | "Sell";

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  type: OrderType;
  side: OrderSide;
  amount: number;
  qtyFilled: number;
  qtyTotal: number;
  avgPrice: number;
  limitPriceDiff?: string;
  recurringLabel?: string;
  nextPayment?: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    date: "10 Feb 2026, 10:32 AM",
    status: "pending",
    type: "Market",
    side: "Buy",
    amount: 411.23,
    qtyFilled: 0,
    qtyTotal: 0.21,
    avgPrice: 410.5,
  },
  {
    id: "2",
    date: "08 Feb 2026, 3:15 PM",
    status: "executed",
    type: "Market",
    side: "Sell",
    amount: 825.6,
    qtyFilled: 0.42,
    qtyTotal: 0.42,
    avgPrice: 412.8,
  },
  {
    id: "3",
    date: "05 Feb 2026, 9:45 AM",
    status: "executed",
    type: "Limit",
    side: "Buy",
    amount: 205.75,
    qtyFilled: 0.5,
    qtyTotal: 0.5,
    avgPrice: 411.5,
    limitPriceDiff: "+1.50%",
  },
  {
    id: "4",
    date: "01 Feb 2026, 12:00 PM",
    status: "pending",
    type: "Recurring",
    side: "Buy",
    amount: 100.0,
    qtyFilled: 0,
    qtyTotal: 0.24,
    avgPrice: 410.5,
    recurringLabel: "Monthly Investment",
    nextPayment: "May 04",
  },
  {
    id: "5",
    date: "28 Jan 2026, 2:20 PM",
    status: "cancelled",
    type: "Limit",
    side: "Buy",
    amount: 300.0,
    qtyFilled: 0,
    qtyTotal: 0.73,
    avgPrice: 410.0,
    limitPriceDiff: "-0.80%",
  },
];

type FilterKey = "all" | "open" | "executed" | "cancelled";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "executed", label: "Executed" },
  { key: "cancelled", label: "Cancelled" },
];

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: typeof Clock; color: string; bg: string }
> = {
  pending: {
    label: "PENDING",
    icon: Clock,
    color: "text-muted-foreground",
    bg: "bg-secondary/60",
  },
  executed: {
    label: "EXECUTED",
    icon: CheckCircle2,
    color: "text-[hsl(var(--gain))]",
    bg: "bg-[hsl(var(--gain))]/10",
  },
  cancelled: {
    label: "CANCELLED",
    icon: XCircle,
    color: "text-[hsl(var(--loss))]",
    bg: "bg-[hsl(var(--loss))]/10",
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function MyOrdersTab({ symbol }: MyOrdersTabProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "open") return order.status === "pending";
    return order.status === activeFilter;
  });

  return (
    <div className="px-5 py-4">
      {/* Heading */}
      <h2 className="mb-4 text-[18px] font-semibold text-foreground">
        My Orders
      </h2>

      {/* Filter pills */}
      <div className="mb-5 flex gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-[15px] font-medium transition-colors",
              activeFilter === filter.key
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {activeFilter === filter.key && (
              <motion.div
                layoutId="orders-filter-pill"
                className="absolute inset-0 rounded-full bg-secondary"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {filter.label}
          </button>
        ))}
      </div>

      {/* Order cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 && (
          <p className="py-8 text-center text-[15px] text-muted-foreground">
            No orders found.
          </p>
        )}
        {filteredOrders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <OrderCard order={order} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="rounded-xl border border-border/40 bg-card p-4">
      {/* Top row: date + status badge */}
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[14px] text-muted-foreground">{order.date}</span>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1",
            status.bg
          )}
        >
          <StatusIcon size={13} className={status.color} />
          <span className={cn("text-[12px] font-semibold tracking-wide", status.color)}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Order type + side */}
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[15px] font-medium text-muted-foreground">
          {order.type}
        </span>
        <span className="text-[15px] text-muted-foreground/50">•</span>
        <span
          className={cn(
            "text-[15px] font-medium",
            order.side === "Buy"
              ? "text-[hsl(var(--gain))]"
              : "text-[hsl(var(--loss))]"
          )}
        >
          {order.side}
        </span>
        {order.limitPriceDiff && (
          <span className="ml-1 text-[14px] text-muted-foreground">
            ({order.limitPriceDiff})
          </span>
        )}
      </div>

      {/* Amount */}
      <p className="mb-1.5 text-[20px] font-bold tabular-nums text-foreground">
        {order.amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>

      {/* Details line */}
      <p className="text-[14px] text-muted-foreground">
        Qty. {order.qtyFilled}/{order.qtyTotal} Shares{"  "}Avg. Price{" "}
        {order.avgPrice.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>

      {/* Recurring info */}
      {order.recurringLabel && (
        <p className="mt-2 text-[14px] text-muted-foreground">
          {order.recurringLabel}
          {order.nextPayment && (
            <span className="ml-2 font-medium text-foreground">
              Next Payment {order.nextPayment}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
