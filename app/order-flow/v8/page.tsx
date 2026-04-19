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
  ArrowUpDown,
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

// ─── Gradient Background ────────────────────────────────────────────
function GradientBackground({ side }: { side: OrderSide }) {
  const isBuy = side === "buy";
  return (
    <motion.div
      className="absolute inset-0 transition-all duration-700"
      animate={{
        background: isBuy
          ? "linear-gradient(135deg, #064e3b 0%, #0f766e 30%, #155e75 60%, #1e3a5f 100%)"
          : "linear-gradient(135deg, #7f1d1d 0%, #991b1b 30%, #9a3412 60%, #78350f 100%)",
      }}
      style={{
        backgroundSize: "400% 400%",
        animation: "gradientShift 8s ease infinite",
      }}
    />
  );
}

// ─── Swipe CTA (Glass variant) ──────────────────────────────────────
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
      if (!disabled && info.offset.x > maxDrag * 0.6) {
        animate(dragX, maxDrag, { type: "spring", stiffness: 400, damping: 30 });
        setCompleted(true);
        onComplete();
      } else {
        animate(dragX, 0, { type: "spring", stiffness: 400, damping: 30 });
      }
    },
    [maxDrag, dragX, onComplete, disabled]
  );

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-[54px] rounded-full overflow-hidden backdrop-blur-lg",
        disabled ? "bg-white/5" : "bg-white/15 border border-white/20"
      )}
    >
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-white/90 pointer-events-none"
        style={{ opacity: textOpacity }}
      >
        {disabled ? "Add Funds" : `Swipe to ${isBuy ? "Buy" : "Sell"} ${stock.symbol}`}
      </motion.span>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-lg"
          >
            <Check size={24} strokeWidth={2.5} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {!completed && !disabled && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: maxDrag }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          className="absolute left-1 top-[2px] flex h-[50px] w-[50px] cursor-grab items-center justify-center rounded-full bg-white/90 active:cursor-grabbing"
          whileTap={{ scale: 0.95 }}
        >
          <ChevronsRight size={22} strokeWidth={2} className="text-emerald-900" />
        </motion.div>
      )}
    </div>
  );
}

// ─── Keypad (Translucent) ───────────────────────────────────────────
function GlassKeypad({
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
      className="backdrop-blur-lg bg-black/30 border-t border-white/10"
    >
      <div className="flex items-center justify-end px-4 pt-1.5">
        <button onClick={onDismiss} className="p-1.5 text-white/50 active:text-white/80">
          <Keyboard size={20} strokeWidth={1.8} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-0 px-2 pb-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((key) => (
          <button
            key={key}
            onClick={() => (key === "del" ? onDelete() : onKey(key))}
            className="flex items-center justify-center h-[48px] text-[22px] font-medium text-white active:bg-white/10 rounded-xl transition-colors"
          >
            {key === "del" ? (
              <Delete size={20} strokeWidth={1.8} className="text-white/50" />
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
  const numAmount = parseFloat(amount) || 0;
  const estShares = amountMode === "dollars" ? numAmount / stock.price : numAmount;
  const estCost = amountMode === "dollars" ? numAmount : numAmount * stock.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center px-8"
      style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e293b 50%, #0f172a 100%)" }}
    >
      {/* Glass checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-lg border border-white/20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
        >
          <Check size={36} strokeWidth={2.5} className="text-white" />
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-[22px] font-bold text-white"
      >
        Order Placed
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 w-full space-y-3 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-5"
      >
        <div className="flex justify-between">
          <span className="text-[14px] text-white/50">Type</span>
          <span className="text-[14px] font-medium text-white capitalize">
            {side} &middot; {orderType === "stop-loss" ? "Stop Loss" : orderType}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[14px] text-white/50">Amount</span>
          <span className="text-[14px] font-medium text-white tabular-nums">
            {amountMode === "dollars" ? numAmount.toFixed(2) : `${numAmount} shares`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[14px] text-white/50">Est. Shares</span>
          <span className="text-[14px] font-medium text-white tabular-nums">{estShares.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[14px] text-white/50">Est. Cost</span>
          <span className="text-[14px] font-medium text-white tabular-nums">{estCost.toFixed(2)}</span>
        </div>
        {orderType === "limit" && limitPrice && (
          <div className="flex justify-between">
            <span className="text-[14px] text-white/50">Limit Price</span>
            <span className="text-[14px] font-medium text-white tabular-nums">{limitPrice}</span>
          </div>
        )}
        {orderType === "stop-loss" && stopPrice && (
          <div className="flex justify-between">
            <span className="text-[14px] text-white/50">Stop Price</span>
            <span className="text-[14px] font-medium text-white tabular-nums">{stopPrice}</span>
          </div>
        )}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        onClick={onDone}
        className="mt-8 w-full rounded-full bg-white/20 backdrop-blur py-3.5 text-[16px] font-semibold text-white active:bg-white/30 transition-colors"
      >
        Done
      </motion.button>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function OrderFlowV8() {
  const router = useRouter();
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [amountMode, setAmountMode] = useState<AmountMode>("dollars");
  const [activeField, setActiveField] = useState<FieldId>("amount");
  const [showKeypad, setShowKeypad] = useState(false);

  const [amount, setAmount] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);

  // Live price
  const [livePrice, setLivePrice] = useState(stock.price);
  useEffect(() => {
    const iv = setInterval(() => {
      setLivePrice((p) => Math.round((p + (Math.random() - 0.5) * 0.4) * 100) / 100);
    }, 1500);
    return () => clearInterval(iv);
  }, []);

  const isBuy = side === "buy";
  const change = livePrice - stock.price;
  const changePct = ((change / stock.price) * 100).toFixed(2);
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
    const cur = getActiveValue();
    if (key === "." && cur.includes(".")) return;
    if (cur === "0" && key !== ".") setActiveValue(key);
    else setActiveValue(cur + key);
  };
  const handleDelete = () => setActiveValue(getActiveValue().slice(0, -1));

  const orderTypeLabels: Record<OrderType, string> = {
    market: "Market",
    limit: "Limit",
    "stop-loss": "Stop Loss",
  };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden">
      {/* CSS for gradient animation */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <GradientBackground side={side} />

      <div className="relative z-10 flex flex-1 flex-col">
        <StatusBar />

        {/* ─── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 active:bg-white/10 transition-colors"
          >
            <X size={20} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-white">{stock.symbol}</span>
            <span className="text-[15px] font-medium tabular-nums text-white">{livePrice.toFixed(2)}</span>
            <span className={cn("text-[13px] font-medium tabular-nums", change >= 0 ? "text-emerald-300" : "text-rose-300")}>
              {change >= 0 ? "+" : ""}{changePct}%
            </span>
          </div>

          {/* Buy/Sell toggle - glass */}
          <div className="relative flex h-8 rounded-full bg-white/10 backdrop-blur p-0.5">
            <motion.div
              className="absolute top-0.5 h-7 w-[46px] rounded-full bg-white/20 backdrop-blur"
              animate={{ left: isBuy ? 2 : 48 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
            <button onClick={() => setSide("buy")} className={cn("relative z-10 w-[46px] text-[12px] font-bold", isBuy ? "text-white" : "text-white/40")}>BUY</button>
            <button onClick={() => setSide("sell")} className={cn("relative z-10 w-[46px] text-[12px] font-bold", !isBuy ? "text-white" : "text-white/40")}>SELL</button>
          </div>
        </div>

        {/* ─── Glass Card ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-6">
            {/* Order type tabs */}
            <div className="flex items-center gap-0 mb-6">
              {(["market", "limit", "stop-loss"] as OrderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setOrderType(type);
                    if (type === "limit") { setActiveField("limitPrice"); setShowKeypad(true); }
                    else if (type === "stop-loss") { setActiveField("stopPrice"); setShowKeypad(true); }
                    else setActiveField("amount");
                  }}
                  className="relative px-3 pb-2"
                >
                  <span className={cn(
                    "text-[14px] font-medium transition-colors",
                    orderType === type ? "text-white font-semibold" : "text-white/40"
                  )}>
                    {orderTypeLabels[type]}
                  </span>
                  {orderType === type && (
                    <motion.div
                      layoutId="gradient-order-tab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Amount display */}
            <button
              onClick={() => { setActiveField("amount"); setShowKeypad(true); }}
              className="w-full flex flex-col items-center"
            >
              <span className={cn(
                "text-[36px] font-bold tabular-nums leading-none transition-colors",
                insufficientFunds ? "text-amber-300" : "text-white",
                activeField === "amount" ? "opacity-100" : "opacity-60"
              )}>
                {amount || "0"}
              </span>
              <span className="mt-1.5 text-[13px] text-white/50 tabular-nums">
                {amountMode === "dollars"
                  ? `Est. ${estShares.toFixed(4)} shares`
                  : `Est. ${estCost.toFixed(2)}`}
              </span>
            </button>

            {/* Toggle */}
            <div className="flex justify-center mt-3">
              <button
                onClick={() => setAmountMode(amountMode === "dollars" ? "shares" : "dollars")}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/70 active:bg-white/20 transition-colors"
              >
                <ArrowUpDown size={11} className="text-white/50" />
                {amountMode === "dollars" ? "USD" : "Shares"}
              </button>
            </div>

            {/* Limit price (conditional) */}
            <AnimatePresence>
              {orderType === "limit" && (
                <motion.button
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  onClick={() => { setActiveField("limitPrice"); setShowKeypad(true); }}
                  className="w-full flex flex-col items-center overflow-hidden border-t border-white/10 pt-4"
                >
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 mb-1">Limit Price</span>
                  <span className={cn(
                    "text-[24px] font-semibold tabular-nums transition-opacity",
                    activeField === "limitPrice" ? "text-white" : "text-white/40"
                  )}>
                    {limitPrice || "0.00"}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Stop price (conditional) */}
            <AnimatePresence>
              {orderType === "stop-loss" && (
                <motion.button
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  onClick={() => { setActiveField("stopPrice"); setShowKeypad(true); }}
                  className="w-full flex flex-col items-center overflow-hidden border-t border-white/10 pt-4"
                >
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 mb-1">Trigger Price</span>
                  <span className={cn(
                    "text-[24px] font-semibold tabular-nums transition-opacity",
                    activeField === "stopPrice" ? "text-white" : "text-white/40"
                  )}>
                    {stopPrice || "0.00"}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Insufficient funds */}
            <AnimatePresence>
              {insufficientFunds && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-center text-[13px] text-amber-300 font-medium"
                >
                  {(estCost - available).toFixed(2)} more needed
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Charges + Available */}
          <div className="mt-4 flex items-center justify-between w-full px-2">
            <span className="text-[12px] text-white/40 tabular-nums">Charges 1.00</span>
            <span className="text-[12px] text-white/40 tabular-nums">Avail. {available.toFixed(2)}</span>
          </div>
        </div>

        {/* ─── Swipe CTA ────────────────────────────────────────── */}
        <div className="px-5 pb-2">
          <SwipeCTA
            side={side}
            disabled={insufficientFunds}
            onComplete={() => setShowConfirmation(true)}
          />
        </div>

        {/* ─── Keypad ───────────────────────────────────────────── */}
        <AnimatePresence>
          {showKeypad && (
            <GlassKeypad
              onKey={handleKey}
              onDelete={handleDelete}
              onDismiss={() => setShowKeypad(false)}
            />
          )}
        </AnimatePresence>

        <HomeIndicator />
      </div>

      {/* ─── Confirmation ───────────────────────────────────────── */}
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
