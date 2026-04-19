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
  Keyboard,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

// ─── Types ──────────────────────────────────────────────────────────
type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit" | "stop-loss";
type AmountMode = "dollars" | "shares";

const stock = { name: "Tesla Inc", symbol: "TSLA", price: 411.82, changePercent: 0.03 };
const available = 500.0;

// ─── Swipe CTA ──────────────────────────────────────────────────────
function SwipeCTA({ onComplete, side }: { onComplete: () => void; side: OrderSide }) {
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

// ─── Numeric Keypad ─────────────────────────────────────────────────
function NumericKeypad({
  onKey,
  onDelete,
  onDismiss,
}: {
  onKey: (key: string) => void;
  onDelete: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className="bg-muted/50 border-t border-border/40"
    >
      <div className="flex items-center justify-end px-4 pt-1.5">
        <button onClick={onDismiss} className="p-1.5 text-muted-foreground active:opacity-70">
          <Keyboard size={20} strokeWidth={1.8} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-0 px-2 pb-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((key) => (
          <button
            key={key}
            onClick={() => (key === "del" ? onDelete() : onKey(key))}
            className="flex items-center justify-center h-[48px] text-[20px] font-medium text-foreground active:bg-muted/50 rounded-lg transition-colors"
          >
            {key === "del" ? (
              <Delete size={20} strokeWidth={1.8} className="text-muted-foreground" />
            ) : (
              key
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Confirmation Screen ────────────────────────────────────────────
function ConfirmationScreen({
  side,
  orderType,
  amount,
  amountMode,
  onDone,
}: {
  side: OrderSide;
  orderType: OrderType;
  amount: string;
  amountMode: AmountMode;
  onDone: () => void;
}) {
  const isBuy = side === "buy";
  const numAmount = parseFloat(amount) || 0;
  const estShares = amountMode === "dollars" ? numAmount / stock.price : numAmount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background px-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
        className={cn("flex h-20 w-20 items-center justify-center rounded-full", isBuy ? "bg-gain/15" : "bg-loss/15")}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
        >
          <Check size={36} strokeWidth={2.5} className={isBuy ? "text-gain" : "text-loss"} />
        </motion.div>
      </motion.div>

      {/* Chat-style confirmation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 max-w-[300px] rounded-2xl rounded-bl-md bg-muted px-4 py-3"
      >
        <p className="text-[15px] text-foreground leading-relaxed">
          Done! Your <span className="font-semibold">{orderType}</span> order to{" "}
          <span className={cn("font-semibold", isBuy ? "text-gain" : "text-loss")}>
            {isBuy ? "buy" : "sell"}
          </span>{" "}
          {amountMode === "dollars" ? `${numAmount.toFixed(2)} worth of` : `${numAmount} shares of`}{" "}
          <span className="font-semibold">{stock.symbol}</span> has been placed.{" "}
          Estimated {estShares.toFixed(4)} shares at market price.
        </p>
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
export default function OrderFlowV6() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [amountMode, setAmountMode] = useState<AmountMode>("dollars");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [addStopLoss, setAddStopLoss] = useState<boolean | null>(null);
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeInput, setActiveInput] = useState<"amount" | "limitPrice" | "stopPrice">("amount");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isBuy = side === "buy";

  // Live price
  const [livePrice, setLivePrice] = useState(stock.price);
  useEffect(() => {
    const iv = setInterval(() => {
      setLivePrice((p) => Math.round((p + (Math.random() - 0.5) * 0.4) * 100) / 100);
    }, 1500);
    return () => clearInterval(iv);
  }, []);

  const numAmount = parseFloat(amount) || 0;
  const estShares = amountMode === "dollars" ? numAmount / livePrice : numAmount;
  const estCost = amountMode === "dollars" ? numAmount : numAmount * livePrice;
  const insufficientFunds = estCost > available && amount.length > 0;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [orderType, amount, addStopLoss, limitPrice, stopPrice, insufficientFunds]);

  // Keypad handlers
  const getActiveValue = () => {
    if (activeInput === "amount") return amount;
    if (activeInput === "limitPrice") return limitPrice;
    if (activeInput === "stopPrice") return stopPrice;
    return "";
  };
  const setActiveValue = (val: string) => {
    if (activeInput === "amount") setAmount(val);
    else if (activeInput === "limitPrice") setLimitPrice(val);
    else if (activeInput === "stopPrice") setStopPrice(val);
  };
  const handleKey = (key: string) => {
    const cur = getActiveValue();
    if (key === "." && cur.includes(".")) return;
    if (cur === "0" && key !== ".") setActiveValue(key);
    else setActiveValue(cur + key);
  };
  const handleDelete = () => setActiveValue(getActiveValue().slice(0, -1));

  // Determine if summary is ready
  const isSummaryReady = (() => {
    if (!orderType || !amount) return false;
    if (orderType === "limit" && !limitPrice) return false;
    if (orderType === "stop-loss" && !stopPrice) return false;
    return true;
  })();

  const change = livePrice - stock.price;
  const changePct = ((change / stock.price) * 100).toFixed(2);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
        >
          <X size={20} strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-foreground">{stock.symbol}</span>
          <span className="text-[15px] tabular-nums text-foreground">{livePrice.toFixed(2)}</span>
          <span className={cn("text-[13px] tabular-nums font-medium", change >= 0 ? "text-gain" : "text-loss")}>
            {change >= 0 ? "+" : ""}{changePct}%
          </span>
        </div>
        {/* Buy/Sell toggle */}
        <div className="relative flex h-8 rounded-full bg-muted/60 p-0.5">
          <motion.div
            layoutId="conv-side-pill"
            className={cn("absolute top-0.5 h-7 w-[46px] rounded-full", isBuy ? "bg-gain" : "bg-loss")}
            animate={{ left: isBuy ? 2 : 48 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
          <button onClick={() => setSide("buy")} className={cn("relative z-10 w-[46px] text-[12px] font-bold", isBuy ? "text-white" : "text-muted-foreground")}>BUY</button>
          <button onClick={() => setSide("sell")} className={cn("relative z-10 w-[46px] text-[12px] font-bold", !isBuy ? "text-white" : "text-muted-foreground")}>SELL</button>
        </div>
      </div>

      {/* ─── Chat Area ──────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Step 1: Order type question */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[280px]"
        >
          <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
            <p className="text-[15px] text-foreground leading-relaxed">
              What type of order would you like to place for <span className="font-semibold">{stock.symbol}</span>?
            </p>
          </div>
          <div className="mt-2 flex gap-2">
            {(["market", "limit", "stop-loss"] as OrderType[]).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  orderType === type
                    ? "bg-foreground text-background"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {type === "stop-loss" ? "Stop Loss" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* User response: selected order type */}
        <AnimatePresence>
          {orderType && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-end"
            >
              <div className="rounded-2xl rounded-br-md bg-foreground px-4 py-2.5">
                <span className="text-[14px] font-medium text-background capitalize">
                  {orderType === "stop-loss" ? "Stop Loss" : orderType}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Limit price question (if limit) */}
        <AnimatePresence>
          {orderType === "limit" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-[280px]"
            >
              <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                <p className="text-[15px] text-foreground leading-relaxed">
                  What&apos;s your limit price? Current price is{" "}
                  <span className="font-semibold tabular-nums">{livePrice.toFixed(2)}</span>.
                </p>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => {
                    setActiveInput("limitPrice");
                    setShowKeypad(true);
                  }}
                  className="rounded-2xl rounded-br-md bg-foreground/5 border border-foreground/10 px-4 py-2.5 min-w-[100px] text-right"
                >
                  <span className="text-[20px] font-semibold tabular-nums text-foreground">
                    {limitPrice || "0.00"}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2b: Stop price question (if stop-loss) */}
        <AnimatePresence>
          {orderType === "stop-loss" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-[280px]"
            >
              <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                <p className="text-[15px] text-foreground leading-relaxed">
                  At what price should the stop loss trigger? Current price is{" "}
                  <span className="font-semibold tabular-nums">{livePrice.toFixed(2)}</span>.
                </p>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => {
                    setActiveInput("stopPrice");
                    setShowKeypad(true);
                  }}
                  className="rounded-2xl rounded-br-md bg-foreground/5 border border-foreground/10 px-4 py-2.5 min-w-[100px] text-right"
                >
                  <span className="text-[20px] font-semibold tabular-nums text-foreground">
                    {stopPrice || "0.00"}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Amount question */}
        <AnimatePresence>
          {orderType && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="max-w-[280px]"
            >
              <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                <p className="text-[15px] text-foreground leading-relaxed">
                  How much would you like to {isBuy ? "buy" : "sell"}?
                </p>
              </div>
              <div className="mt-2 flex items-end gap-2">
                <button
                  onClick={() => {
                    setActiveInput("amount");
                    setShowKeypad(true);
                  }}
                  className="rounded-2xl rounded-br-md bg-foreground/5 border border-foreground/10 px-4 py-2.5 min-w-[120px] text-right"
                >
                  <span className="text-[24px] font-semibold tabular-nums text-foreground">
                    {amount || "0"}
                  </span>
                  <span className="ml-1 text-[13px] text-muted-foreground">
                    {amountMode === "dollars" ? "USD" : "shares"}
                  </span>
                </button>
                <button
                  onClick={() => setAmountMode(amountMode === "dollars" ? "shares" : "dollars")}
                  className="flex items-center gap-1 rounded-full bg-muted/50 px-2 py-1 mb-1 active:bg-muted"
                >
                  <ArrowUpDown size={11} className="text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {amountMode === "dollars" ? "shares" : "USD"}
                  </span>
                </button>
              </div>
              {amount && (
                <p className="mt-1 text-[12px] text-muted-foreground tabular-nums ml-1">
                  Est. {estShares.toFixed(4)} shares &middot; {estCost.toFixed(2)} total
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stop loss offer for market/limit orders */}
        <AnimatePresence>
          {orderType && orderType !== "stop-loss" && amount.length > 0 && addStopLoss === null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="max-w-[280px]"
            >
              <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                <p className="text-[15px] text-foreground leading-relaxed">
                  Want to add a stop loss to protect your position?
                </p>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setAddStopLoss(true)}
                  className="rounded-full px-4 py-1.5 text-[13px] font-medium bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setAddStopLoss(false)}
                  className="rounded-full px-4 py-1.5 text-[13px] font-medium bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
                >
                  No thanks
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stop loss price input (if user said yes) */}
        <AnimatePresence>
          {addStopLoss === true && orderType !== "stop-loss" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[280px]"
            >
              <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                <p className="text-[15px] text-foreground leading-relaxed">
                  What stop loss trigger price?
                </p>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => {
                    setActiveInput("stopPrice");
                    setShowKeypad(true);
                  }}
                  className="rounded-2xl rounded-br-md bg-foreground/5 border border-foreground/10 px-4 py-2.5 min-w-[100px] text-right"
                >
                  <span className="text-[20px] font-semibold tabular-nums text-foreground">
                    {stopPrice || "0.00"}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insufficient funds warning */}
        <AnimatePresence>
          {insufficientFunds && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[280px]"
            >
              <div className="rounded-2xl rounded-bl-md border border-loss/20 bg-loss/10 px-4 py-3">
                <p className="text-[14px] text-loss leading-relaxed">
                  Hmm, you need <span className="font-semibold tabular-nums">{(estCost - available).toFixed(2)}</span> more
                  in your account for this order.
                </p>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="flex items-center gap-1.5 rounded-full border border-loss/20 bg-loss/10 px-3.5 py-1.5">
                  <Plus size={13} className="text-loss" />
                  <span className="text-[13px] font-medium text-loss">Add Funds</span>
                </button>
                <button
                  onClick={() => {
                    setAmount("");
                    setActiveInput("amount");
                    setShowKeypad(true);
                  }}
                  className="rounded-full bg-muted/60 px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground"
                >
                  Adjust Amount
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary card */}
        <AnimatePresence>
          {isSummaryReady && !insufficientFunds && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-[300px]"
            >
              <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                <p className="text-[15px] font-medium text-foreground mb-3">
                  Ready to go! Here&apos;s your order:
                </p>
                <div className="space-y-2 border-t border-border/40 pt-3">
                  <div className="flex justify-between">
                    <span className="text-[13px] text-muted-foreground">Side</span>
                    <span className={cn("text-[13px] font-semibold capitalize", isBuy ? "text-gain" : "text-loss")}>{side}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-muted-foreground">Type</span>
                    <span className="text-[13px] font-medium text-foreground capitalize">
                      {orderType === "stop-loss" ? "Stop Loss" : orderType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-muted-foreground">Amount</span>
                    <span className="text-[13px] font-medium text-foreground tabular-nums">
                      {amountMode === "dollars" ? `${numAmount.toFixed(2)}` : `${numAmount} shares`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-muted-foreground">Est. Shares</span>
                    <span className="text-[13px] font-medium text-foreground tabular-nums">{estShares.toFixed(4)}</span>
                  </div>
                  {orderType === "limit" && limitPrice && (
                    <div className="flex justify-between">
                      <span className="text-[13px] text-muted-foreground">Limit Price</span>
                      <span className="text-[13px] font-medium text-foreground tabular-nums">{limitPrice}</span>
                    </div>
                  )}
                  {(orderType === "stop-loss" || addStopLoss) && stopPrice && (
                    <div className="flex justify-between">
                      <span className="text-[13px] text-muted-foreground">Stop Price</span>
                      <span className="text-[13px] font-medium text-foreground tabular-nums">{stopPrice}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border/40 pt-2">
                    <span className="text-[13px] text-muted-foreground">Available</span>
                    <span className="text-[13px] font-medium text-foreground tabular-nums">{available.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom: Swipe CTA ──────────────────────────────────── */}
      {isSummaryReady && !insufficientFunds && !showKeypad && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-2 pt-2 border-t border-border/30"
        >
          <SwipeCTA side={side} onComplete={() => setShowConfirmation(true)} />
        </motion.div>
      )}

      {/* ─── Keypad ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showKeypad && (
          <NumericKeypad
            onKey={handleKey}
            onDelete={handleDelete}
            onDismiss={() => setShowKeypad(false)}
          />
        )}
      </AnimatePresence>

      <HomeIndicator />

      {/* ─── Confirmation ───────────────────────────────────────── */}
      <AnimatePresence>
        {showConfirmation && (
          <ConfirmationScreen
            side={side}
            orderType={orderType!}
            amount={amount}
            amountMode={amountMode}
            onDone={() => router.back()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
