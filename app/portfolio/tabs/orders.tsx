"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";
import {
  type OpenOrder, type CompletedOrder, type FailedOrder, type Order,
  OrderCard, registerOrders,
} from "@/app/portfolio/components/shared-order";
import { EmptyState } from "../components/empty-state";

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

export function OrdersTab({ empty }: { empty?: boolean }) {
  const [activeTab, setActiveTab] = useState<OrderTab>("open");

  if (empty) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No orders yet"
        subtitle="You haven't placed any orders. Explore stocks and ETFs to make your first trade."
        actions={[
          { label: "Explore & Trade", href: "/home-v3", primary: true },
        ]}
      />
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
          <button className="text-[16px] font-semibold text-muted-foreground active:opacity-60">Cancel all</button>
        )}
      </div>

      {/* List — each item manages its own drawer */}
      <div className="divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40">
        {orders.map((o, i) => <OrderCard key={i} order={o} />)}
      </div>
    </div>
  );
}
