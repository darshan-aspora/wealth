"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import {
  X,
  ChevronsRight,
  Check,
  Delete,
  ArrowUpDown,
  Info,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

// ─── Types ──────────────────────────────────────────────────────────
type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit" | "stop-loss";
type AmountMode = "dollars" | "shares";
type FieldId = "amount" | "limitPrice" | "stopPrice" | null;

const stock = { name: "Tesla Inc", symbol: "TSLA", price: 411.82, changePercent: 0.03 };
const available = 500.0;

// ─── Swipe CTA ──────────────────────────────────────────────────────
function SwipeCTA({ onComplete, side, disabled }: { onComplete: () => void; side: OrderSide; disabled?: boolean }) {
  const isBuy = side === "buy";
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(320);
  const [completed, setCompleted] = useState(false);
  const dragX = useMotionValue(0);
  const thumbSize = 50;
  const maxDrag = trackWidth - thumbSize - 8;

  useEffect(() => {
    if (trackRef.current) setTrackWidth(trackRef.current.offsetWidth);
  }, []);

  const textOpacity = useTransform(dragX, [0, maxDrag * 0.35], [1, 0]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x > maxDrag * 0.6) {
        animate(dragX, maxDrag, { type: "spring", stiffness: 400, damping: 30 });
        setCompleted(true);
        onComplete();
      } else {
        animate(dragX, 0, { type: "spring", stiffness: 400, damping: 30 });
      }
    },
    [maxDrag, dragX, onComplete]
  );

  if (disabled) return null;

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-[54px] rounded-full overflow-hidden",
        isBuy ? "bg-foreground" : "bg-loss"
      )}
    >
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-background pointer-events-none"
        style={{ opacity: textOpacity }}
      >
        Swipe to {isBuy ? "Buy" : "Sell"} {stock.symbol}
      </motion.span>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full",
              isBuy ? "bg-foreground" : "bg-loss"
            )}
          >
            <Check size={24} strokeWidth={2.5} className="text-background" />
          </motion.div>
        )}
      </AnimatePresence>

      {!completed && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: maxDrag }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          className="absolute left-1 top-[2px] flex h-[50px] w-[50px] cursor-grab items-center justify-center rounded-full bg-background active:cursor-grabbing"
          whileTap={{ scale: 0.95 }}
        >
          <ChevronsRight size={22} strokeWidth={2} className="text-foreground" />
        </motion.div>
      )}
    </div>
  );
}

// ─── Confirmation Screen ────────────────────────────────────────────
function ConfirmationScreen({
  side,
  orderType,
  amount,
  amountMode,
  limitPrice,
  stopPrice,
  onDone,
}: {
  side: OrderSide;
  orderType: OrderType;
  amount: string;
  amountMode: AmountMode;
  limitPrice: string;
  stopPrice: string;
  onDone: () => void;
}) {
  const isBuy = side === "buy";
  const numAmount = parseFloat(amount) || 0;
  const estShares = amountMode === "dollars" ? numAmount / stock.price : numAmount;
  const estCost = amountMode === "dollars" ? numAmount : numAmount * stock.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background px-8"
    >
      {/* Checkmark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-6 w-full space-y-3 rounded-2xl border border-border/50 bg-card p-5"
      >
        <div className="flex justify-between">
          <span className="text-[14px] text-muted-foreground">Type</span>
          <span className="text-[14px] font-medium text-foreground capitalize">
            {side} &middot; {orderType === "stop-loss" ? "Stop Loss" : orderType}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[14px] text-muted-foreground">Amount</span>
          <span className="text-[14px] font-medium text-foreground tabular-nums">
            {amountMode === "dollars" ? `${numAmount.toFixed(2)}` : `${numAmount} shares`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[14px] text-muted-foreground">Est. Shares</span>
          <span className="text-[14px] font-medium text-foreground tabular-nums">
            {estShares.toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[14px] text-muted-foreground">Est. Cost</span>
          <span className="text-[14px] font-medium text-foreground tabular-nums">
            {estCost.toFixed(2)}
          </span>
        </div>
        {orderType === "limit" && limitPrice && (
          <div className="flex justify-between">
            <span className="text-[14px] text-muted-foreground">Limit Price</span>
            <span className="text-[14px] font-medium text-foreground tabular-nums">{limitPrice}</span>
          </div>
        )}
        {orderType === "stop-loss" && stopPrice && (
          <div className="flex justify-between">
            <span className="text-[14px] text-muted-foreground">Stop Price</span>
            <span className="text-[14px] font-medium text-foreground tabular-nums">{stopPrice}</span>
          </div>
        )}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onDone}
        className="mt-8 w-full rounded-full bg-foreground py-3.5 text-[16px] font-semibold text-background active:opacity-90 transition-opacity"
      >
        Done
      </motion.button>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function OrderFlowV5() {
  const router = useRouter();
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [amountMode, setAmountMode] = useState<AmountMode>("dollars");
  const [activeField, setActiveField] = useState<FieldId>("amount");

  // Field values
  const [amount, setAmount] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);

  // Live price simulation
  const [livePrice, setLivePrice] = useState(stock.price);
  useEffect(() => {
    const iv = setInterval(() => {
      setLivePrice((p) => {
        const delta = (Math.random() - 0.5) * 0.4;
        return Math.round((p + delta) * 100) / 100;
      });
    }, 1500);
    return () => clearInterval(iv);
  }, []);

  const change = livePrice - stock.price;
  const changePct = ((change / stock.price) * 100).toFixed(2);

  // Amount math
  const numAmount = parseFloat(amount) || 0;
  const estShares = amountMode === "dollars" ? numAmount / livePrice : numAmount;
  const estCost = amountMode === "dollars" ? numAmount : numAmount * livePrice;
  const insufficientFunds = estCost > available;

  // Keypad routing
  const getActiveValue = () => {
    if (activeField === "amount") return amount;
    if (activeField === "limitPrice") return limitPrice;
    if (activeField === "stopPrice") return stopPrice;
    return "";
  };

  const setActiveValue = (val: string) => {
    if (activeField === "amount") setAmount(val);
    else if (activeField === "limitPrice") setLimitPrice(val);
    else if (activeField === "stopPrice") setStopPrice(val);
  };

  const handleKey = (key: string) => {
    const current = getActiveValue();
    if (key === "." && current.includes(".")) return;
    if (current === "0" && key !== ".") {
      setActiveValue(key);
    } else {
      setActiveValue(current + key);
    }
  };

  const handleDelete = () => {
    const current = getActiveValue();
    setActiveValue(current.slice(0, -1));
  };

  const isBuy = side === "buy";

  const orderTypeLabels: Record<OrderType, string> = {
    market: "Market",
    limit: "Limit",
    "stop-loss": "Stop Loss",
  };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-foreground">{stock.symbol}</span>
          <span className="text-[15px] font-medium tabular-nums text-foreground">{livePrice.toFixed(2)}</span>
          <span className={cn("text-[13px] font-medium tabular-nums", change >= 0 ? "text-gain" : "text-loss")}>
            {change >= 0 ? "+" : ""}{changePct}%
          </span>
        </div>

        {/* Buy/Sell pill */}
        <div className="relative flex h-8 rounded-full bg-muted/60 p-0.5">
          <motion.div
            layoutId="calc-side-pill"
            className={cn(
              "absolute top-0.5 h-7 w-[46px] rounded-full",
              isBuy ? "bg-gain" : "bg-loss"
            )}
            animate={{ left: isBuy ? 2 : 48 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
          <button
            onClick={() => setSide("buy")}
            className={cn("relative z-10 w-[46px] text-[12px] font-bold", isBuy ? "text-white" : "text-muted-foreground")}
          >
            BUY
          </button>
          <button
            onClick={() => setSide("sell")}
            className={cn("relative z-10 w-[46px] text-[12px] font-bold", !isBuy ? "text-white" : "text-muted-foreground")}
          >
            SELL
          </button>
        </div>
      </div>

      {/* ─── Order Type Tabs ────────────────────────────────────── */}
      <div className="flex items-center gap-0 px-4 border-b border-border/40">
        {(["market", "limit", "stop-loss"] as OrderType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              setOrderType(type);
              if (type === "market") setActiveField("amount");
              else if (type === "limit") setActiveField("limitPrice");
              else setActiveField("stopPrice");
            }}
            className="relative px-3 pb-2.5 pt-2"
          >
            <span
              className={cn(
                "text-[14px] font-medium transition-colors",
                orderType === type ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {orderTypeLabels[type]}
            </span>
            {orderType === type && (
              <motion.div
                layoutId="calc-order-tab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ─── Display Zone ───────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {/* Main amount display */}
        <button
          onClick={() => setActiveField("amount")}
          className="flex flex-col items-center"
        >
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-[48px] font-bold tabular-nums leading-none transition-colors duration-300",
                insufficientFunds ? "text-loss" : "text-foreground",
                activeField === "amount" && "opacity-100",
                activeField !== "amount" && "opacity-50"
              )}
            >
              {amount || "0"}
            </span>
            {activeField === "amount" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                className="h-[40px] w-[2px] bg-foreground"
              />
            )}
          </div>
          <span className="mt-1 text-[13px] text-muted-foreground tabular-nums">
            {amountMode === "dollars"
              ? `Est. ${estShares.toFixed(4)} shares`
              : `Est. ${estCost.toFixed(2)}`}
          </span>
        </button>

        {/* USD/Shares toggle */}
        <button
          onClick={() => setAmountMode(amountMode === "dollars" ? "shares" : "dollars")}
          className="mt-3 flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 active:bg-muted transition-colors"
        >
          <ArrowUpDown size={12} className="text-muted-foreground" />
          <span className="text-[12px] font-medium text-muted-foreground">
            {amountMode === "dollars" ? "USD" : "Shares"}
          </span>
        </button>

        {/* Limit price field (conditional) */}
        <AnimatePresence>
          {orderType === "limit" && (
            <motion.button
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              onClick={() => setActiveField("limitPrice")}
              className="flex flex-col items-center overflow-hidden"
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Limit Price
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-[28px] font-semibold tabular-nums transition-opacity",
                    activeField === "limitPrice" ? "text-foreground" : "text-muted-foreground/60"
                  )}
                >
                  {limitPrice || "0.00"}
                </span>
                {activeField === "limitPrice" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                    className="h-[24px] w-[2px] bg-foreground"
                  />
                )}
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Stop price field (conditional) */}
        <AnimatePresence>
          {orderType === "stop-loss" && (
            <motion.button
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              onClick={() => setActiveField("stopPrice")}
              className="flex flex-col items-center overflow-hidden"
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Trigger Price
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-[28px] font-semibold tabular-nums transition-opacity",
                    activeField === "stopPrice" ? "text-foreground" : "text-muted-foreground/60"
                  )}
                >
                  {stopPrice || "0.00"}
                </span>
                {activeField === "stopPrice" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                    className="h-[24px] w-[2px] bg-foreground"
                  />
                )}
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Insufficient funds warning */}
        <AnimatePresence>
          {insufficientFunds && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-loss/10 px-3 py-2"
            >
              <Info size={14} className="text-loss shrink-0" />
              <span className="text-[13px] font-medium text-loss">
                Exceeds buying power by {(estCost - available).toFixed(2)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Available balance */}
        <div className="mt-3 text-[12px] text-muted-foreground/60 tabular-nums">
          Available: {available.toFixed(2)}
        </div>
      </div>

      {/* ─── Bottom: CTA + Keypad ───────────────────────────────── */}
      <div className="border-t border-border/30 bg-muted/30">
        {/* CTA or Add Funds */}
        <div className="px-4 pt-3 pb-1">
          {insufficientFunds ? (
            <button className="flex w-full items-center justify-center gap-2 rounded-full border border-loss/20 bg-loss/10 py-3.5 active:opacity-80 transition-opacity">
              <Plus size={16} className="text-loss" />
              <span className="text-[15px] font-semibold text-loss">Add Funds</span>
            </button>
          ) : (
            <SwipeCTA
              side={side}
              onComplete={() => setShowConfirmation(true)}
            />
          )}
        </div>

        {/* Keypad — always visible */}
        <div className="grid grid-cols-3 gap-0 px-2 pb-2 pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((key) => (
            <button
              key={key}
              onClick={() => (key === "del" ? handleDelete() : handleKey(key))}
              className="flex items-center justify-center h-[52px] text-[22px] font-medium text-foreground active:bg-muted/50 rounded-lg transition-colors"
            >
              {key === "del" ? (
                <Delete size={22} strokeWidth={1.8} className="text-muted-foreground" />
              ) : (
                key
              )}
            </button>
          ))}
        </div>
      </div>

      <HomeIndicator />

      {/* ─── Confirmation Overlay ───────────────────────────────── */}
      <AnimatePresence>
        {showConfirmation && (
          <ConfirmationScreen
            side={side}
            orderType={orderType}
            amount={amount}
            amountMode={amountMode}
            limitPrice={limitPrice}
            stopPrice={stopPrice}
            onDone={() => router.back()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
