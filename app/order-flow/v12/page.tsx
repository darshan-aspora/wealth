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
import { ChevronsRight, Check, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

// ─── Types ──────────────────────────────────────────────────────────
type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit" | "stop";
type AmountMode = "dollars" | "shares";
type FieldId = "amount" | "limitPrice" | "stopPrice" | null;

const stock = { name: "Tesla Inc", symbol: "TSLA", price: 411.82 };
const available = 500.0;

// ─── Swipe CTA (Brutalist) ──────────────────────────────────────────
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

  if (disabled) {
    return (
      <div className="flex h-[54px] items-center justify-center border-2 border-loss bg-loss/20 rounded-none">
        <span className="text-[14px] font-bold uppercase tracking-wider text-loss">INSUFFICIENT</span>
      </div>
    );
  }

  return (
    <div ref={trackRef} className={cn("relative h-[54px] overflow-hidden rounded-none border-2", isBuy ? "bg-foreground border-foreground" : "bg-loss border-loss")}>
      <motion.span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold uppercase tracking-[0.15em] text-background pointer-events-none" style={{ opacity: textOpacity }}>
        Swipe to {isBuy ? "Buy" : "Sell"} {stock.symbol}
      </motion.span>
      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={cn("absolute inset-0 flex items-center justify-center", isBuy ? "bg-foreground" : "bg-loss")}>
            <Check size={22} strokeWidth={3} className="text-background" />
          </motion.div>
        )}
      </AnimatePresence>
      {!completed && (
        <motion.div drag="x" dragConstraints={{ left: 0, right: maxDrag }} dragElastic={0.05} dragMomentum={false}
          onDragEnd={handleDragEnd} style={{ x: dragX }}
          className="absolute left-1 top-[2px] flex h-[50px] w-[50px] cursor-grab items-center justify-center rounded-none bg-background border border-foreground/20 active:cursor-grabbing"
          whileTap={{ scale: 0.95 }}>
          <ChevronsRight size={20} strokeWidth={2.5} className="text-foreground" />
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function OrderFlowV12() {
  const router = useRouter();
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [amountMode, setAmountMode] = useState<AmountMode>("dollars");
  const [activeField, setActiveField] = useState<FieldId>("amount");

  const [amount, setAmount] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [stopLossChecked, setStopLossChecked] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState("");

  const [showKeypad, setShowKeypad] = useState(false);
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
  const numAmount = parseFloat(amount) || 0;
  const estShares = amountMode === "dollars" ? numAmount / livePrice : numAmount;
  const estCost = amountMode === "dollars" ? numAmount : numAmount * livePrice;
  const insufficientFunds = estCost > available;

  // Keypad
  const getActiveValue = () => {
    if (activeField === "amount") return amount;
    if (activeField === "limitPrice") return limitPrice;
    if (activeField === "stopPrice") return stopLossChecked ? stopLossPrice : stopPrice;
    return "";
  };
  const setActiveValue = (val: string) => {
    if (activeField === "amount") setAmount(val);
    else if (activeField === "limitPrice") setLimitPrice(val);
    else if (activeField === "stopPrice") {
      if (orderType === "stop") setStopPrice(val);
      else setStopLossPrice(val);
    }
  };
  const handleKey = (key: string) => {
    const cur = getActiveValue();
    if (key === "." && cur.includes(".")) return;
    if (cur === "0" && key !== ".") setActiveValue(key);
    else setActiveValue(cur + key);
  };
  const handleDelete = () => setActiveValue(getActiveValue().slice(0, -1));

  const orderTypeLabels: Record<OrderType, string> = { market: "MARKET", limit: "LIMIT", stop: "STOP" };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-foreground">
        <button onClick={() => router.back()} className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground active:text-foreground transition-colors border-2 border-foreground/30 px-2 py-1 rounded-none">
          CLOSE
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-bold text-foreground">{stock.symbol}</span>
          <span className="text-[14px] font-bold tabular-nums text-foreground">{livePrice.toFixed(2)}</span>
        </div>
        <div className="flex">
          <button
            onClick={() => setSide("buy")}
            className={cn("px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider border-2 rounded-none transition-colors",
              isBuy ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-foreground/30"
            )}
          >
            BUY
          </button>
          <button
            onClick={() => setSide("sell")}
            className={cn("px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider border-2 border-l-0 rounded-none transition-colors",
              !isBuy ? "bg-loss text-white border-loss" : "bg-transparent text-muted-foreground border-foreground/30"
            )}
          >
            SELL
          </button>
        </div>
      </div>

      {/* ─── Content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* Order Type */}
        <div className="px-4 py-3 border-b-2 border-foreground/10">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">ORDER TYPE</span>
          <div className="flex mt-2">
            {(["market", "limit", "stop"] as OrderType[]).map((type, i) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={cn(
                  "flex-1 py-2.5 text-[13px] font-bold uppercase tracking-wider border-2 rounded-none transition-colors",
                  i > 0 && "border-l-0",
                  orderType === type ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border-foreground"
                )}
              >
                {orderTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="px-4 py-3 border-b-2 border-foreground/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">AMOUNT</span>
            <button
              onClick={() => setAmountMode(amountMode === "dollars" ? "shares" : "dollars")}
              className="flex items-center gap-1 border-2 border-foreground/30 rounded-none px-2 py-0.5"
            >
              <ArrowUpDown size={11} className="text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {amountMode === "dollars" ? "USD" : "QTY"}
              </span>
            </button>
          </div>
          <button
            onClick={() => { setActiveField("amount"); setShowKeypad(true); }}
            className="w-full text-left"
          >
            <span className={cn(
              "text-[32px] font-bold tabular-nums leading-none",
              insufficientFunds ? "text-loss" : "text-foreground",
              activeField === "amount" && "underline decoration-2 underline-offset-4"
            )}>
              {amount || "0"}
            </span>
          </button>
          <p className="mt-1 text-[12px] font-bold uppercase tracking-wider text-muted-foreground tabular-nums">
            = {estShares.toFixed(4)} SHARES
          </p>
        </div>

        {/* Limit / Stop price (conditional) */}
        <AnimatePresence>
          {orderType === "limit" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-b-2 border-foreground/10">
              <div className="px-4 py-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">LIMIT PRICE</span>
                <button onClick={() => { setActiveField("limitPrice"); setShowKeypad(true); }} className="w-full text-left mt-1">
                  <span className={cn(
                    "text-[24px] font-bold tabular-nums",
                    activeField === "limitPrice" && "underline decoration-2 underline-offset-4"
                  )}>
                    {limitPrice || livePrice.toFixed(2)}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {orderType === "stop" && (
          <div className="px-4 py-3 border-b-2 border-foreground/10">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">STOP PRICE</span>
            <button onClick={() => { setActiveField("stopPrice"); setShowKeypad(true); }} className="w-full text-left mt-1">
              <span className={cn(
                "text-[24px] font-bold tabular-nums",
                activeField === "stopPrice" && "underline decoration-2 underline-offset-4"
              )}>
                {stopPrice || "0.00"}
              </span>
            </button>
          </div>
        )}

        {/* Stop Loss add-on (for market/limit) */}
        {orderType !== "stop" && (
          <div className="px-4 py-3 border-b-2 border-foreground/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">STOP LOSS</span>
              <button
                onClick={() => setStopLossChecked(!stopLossChecked)}
                className={cn(
                  "flex h-5 w-5 items-center justify-center border-2 rounded-none transition-colors",
                  stopLossChecked ? "bg-foreground border-foreground" : "border-foreground/50"
                )}
              >
                {stopLossChecked && <Check size={13} strokeWidth={3} className="text-background" />}
              </button>
            </div>
            <AnimatePresence>
              {stopLossChecked && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <button onClick={() => { setActiveField("stopPrice"); setShowKeypad(true); }} className="w-full text-left mt-2">
                    <span className={cn(
                      "text-[20px] font-bold tabular-nums",
                      activeField === "stopPrice" && "underline decoration-2 underline-offset-4"
                    )}>
                      {stopLossPrice || "0.00"}
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Charges + Required */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">CHARGES</span>
            <span className="text-[13px] font-bold tabular-nums text-foreground">1.00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">AVAILABLE</span>
            <span className="text-[13px] font-bold tabular-nums text-foreground">{available.toFixed(2)}</span>
          </div>
          <div className={cn(
            "flex items-center justify-between",
            insufficientFunds && "bg-loss text-white px-2 py-1 -mx-2"
          )}>
            <span className={cn("text-[11px] font-bold uppercase tracking-[0.15em]", insufficientFunds ? "text-white" : "text-muted-foreground")}>REQUIRED</span>
            <span className={cn("text-[13px] font-bold tabular-nums", insufficientFunds ? "text-white" : "text-foreground")}>
              {estCost.toFixed(2)}
              {insufficientFunds && <span className="ml-2">— SHORT {(estCost - available).toFixed(2)}</span>}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Swipe CTA ──────────────────────────────────────────── */}
      <div className="px-4 py-2 border-t-2 border-foreground/10">
        <SwipeCTA side={side} disabled={insufficientFunds} onComplete={() => setShowConfirmation(true)} />
      </div>

      {/* ─── Keypad ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showKeypad && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="bg-card border-t-2 border-foreground/10"
          >
            <div className="flex items-center justify-end px-4 pt-1">
              <button onClick={() => setShowKeypad(false)} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-2 border-foreground/20 rounded-none px-2 py-0.5">
                DONE
              </button>
            </div>
            <div className="grid grid-cols-3 gap-0 px-2 pb-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((key) => (
                <button key={key} onClick={() => (key === "del" ? handleDelete() : handleKey(key))}
                  className="flex items-center justify-center h-[48px] text-[22px] font-bold text-foreground active:bg-muted rounded-none border border-foreground/5 transition-colors">
                  {key === "del" ? (
                    <span className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground">DEL</span>
                  ) : key}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HomeIndicator />

      {/* ─── Confirmation ───────────────────────────────────────── */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background px-6">
            <p className="text-[28px] font-bold uppercase tracking-wide text-foreground text-center">ORDER PLACED</p>
            <div className="mt-8 w-full space-y-3">
              <div className="flex justify-between border-b-2 border-foreground/10 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">SIDE</span>
                <span className="text-[13px] font-bold uppercase text-foreground">{side}</span>
              </div>
              <div className="flex justify-between border-b-2 border-foreground/10 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">TYPE</span>
                <span className="text-[13px] font-bold uppercase text-foreground">{orderType}</span>
              </div>
              <div className="flex justify-between border-b-2 border-foreground/10 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">AMOUNT</span>
                <span className="text-[13px] font-bold tabular-nums text-foreground">{numAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b-2 border-foreground/10 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">EST. SHARES</span>
                <span className="text-[13px] font-bold tabular-nums text-foreground">{estShares.toFixed(4)}</span>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="mt-10 w-full py-3.5 bg-foreground text-background text-[14px] font-bold uppercase tracking-wider rounded-none border-2 border-foreground active:opacity-90"
            >
              DONE
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
