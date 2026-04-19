"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Suspense } from "react";

function ConfirmationContent() {
  const router = useRouter();
  const params = useSearchParams();

  const side = params.get("side") || "buy";
  const orderType = params.get("type") || "market";
  const amount = params.get("amount") || "0";
  const symbol = params.get("symbol") || "TSLA";
  const name = params.get("name") || "Tesla Inc";
  const shares = params.get("shares") || "0";
  const price = params.get("price") || "0";
  const total = params.get("total") || "0";
  const isBuy = side === "buy";

  const typeLabel = orderType === "market" ? "Market" : orderType === "limit" ? "Limit" : "Trigger";

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full",
            isBuy ? "bg-gain/15" : "bg-loss/15"
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.25 }}
          >
            <Check size={36} strokeWidth={2.5} className={isBuy ? "text-gain" : "text-loss"} />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6 text-[22px] font-bold text-foreground"
        >
          Order Placed
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-2 text-[15px] text-muted-foreground text-center"
        >
          Your {typeLabel.toLowerCase()} order to {isBuy ? "buy" : "sell"} {symbol} has been submitted
        </motion.p>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-8 w-full space-y-4 rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex justify-between">
            <span className="text-[14px] text-muted-foreground">Stock</span>
            <span className="text-[14px] font-medium text-foreground">{symbol} &middot; {name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14px] text-muted-foreground">Side</span>
            <span className={cn("text-[14px] font-semibold capitalize", isBuy ? "text-gain" : "text-loss")}>{side}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14px] text-muted-foreground">Order Type</span>
            <span className="text-[14px] font-medium text-foreground">{typeLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14px] text-muted-foreground">Amount</span>
            <span className="text-[14px] font-medium text-foreground tabular-nums">${amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14px] text-muted-foreground">Est. Shares</span>
            <span className="text-[14px] font-medium text-foreground tabular-nums">{shares}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14px] text-muted-foreground">Price</span>
            <span className="text-[14px] font-medium text-foreground tabular-nums">
              {orderType === "market" ? "At Market" : `$${price}`}
            </span>
          </div>

          <div className="border-t border-border pt-3 flex justify-between">
            <span className="text-[14px] text-muted-foreground">Total (incl. fees)</span>
            <span className="text-[14px] font-semibold text-foreground tabular-nums">${total}</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-4">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => router.push("/order-flow")}
          className="w-full rounded-full bg-foreground py-4 text-[16px] font-semibold text-background active:opacity-90 transition-opacity"
        >
          Done
        </motion.button>
      </div>

      <HomeIndicator />
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
