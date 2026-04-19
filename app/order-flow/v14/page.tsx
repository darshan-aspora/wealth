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
import { X, ChevronsRight, Check, Delete, Keyboard, ArrowUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Switch } from "@/components/ui/switch";

// ─── Types ──────────────────────────────────────────────────────────
type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit" | "stop-loss";
type AmountMode = "dollars" | "shares";

const stock = { name: "Tesla Inc", symbol: "TSLA", price: 411.82, changePercent: 0.03 };
const available = 500.0;

// ─── Swipe CTA (Spatial/elevated) ───────────────────────────────────
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
    <div ref={trackRef} className={cn("relative h-[54px] rounded-2xl overflow-hidden shadow-xl", isBuy ? "bg-foreground" : "bg-loss")}>
      <motion.span className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-background pointer-events-none" style={{ opacity: textOpacity }}>
        Swipe to {isBuy ? "Buy" : "Sell"} {stock.symbol}
      </motion.span>
      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={cn("absolute inset-0 flex items-center justify-center rounded-2xl", isBuy ? "bg-foreground" : "bg-loss")}>
            <Check size={24} strokeWidth={2.5} className="text-background" />
          </motion.div>
        )}
      </AnimatePresence>
      {!completed && (
        <motion.div drag="x" dragConstraints={{ left: 0, right: maxDrag }} dragElastic={0.05} dragMomentum={false}
          onDragEnd={handleDragEnd} style={{ x: dragX }}
          className="absolute left-1 top-[2px] flex h-[50px] w-[50px] cursor-grab items-center justify-center rounded-xl bg-background shadow-md active:cursor-grabbing"
          whileTap={{ scale: 0.95 }}>
          <ChevronsRight size={22} strokeWidth={2} className="text-foreground" />
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function OrderFlowV14() {
  const router = useRouter();
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [amountMode, setAmountMode] = useState<AmountMode>("dollars");
  const [amount, setAmount] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeInput, setActiveInput] = useState<"amount" | "limitPrice" | "stopPrice">("amount");
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

  // Keypad
  const getActiveValue = () => {
    if (activeInput === "amount") return amount;
    if (activeInput === "limitPrice") return limitPrice;
    if (activeInput === "stopPrice") return stopLossPrice;
    return "";
  };
  const setActiveValue = (val: string) => {
    if (activeInput === "amount") setAmount(val);
    else if (activeInput === "limitPrice") setLimitPrice(val);
    else if (activeInput === "stopPrice") setStopLossPrice(val);
  };
  const handleKey = (key: string) => {
    const cur = getActiveValue();
    if (key === "." && cur.includes(".")) return;
    if (cur === "0" && key !== ".") setActiveValue(key);
    else setActiveValue(cur + key);
  };
  const handleDelete = () => setActiveValue(getActiveValue().slice(0, -1));

  const orderTypeLabels: Record<OrderType, string> = { market: "Market", limit: "Limit", "stop-loss": "Stop Loss" };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted/20 via-background to-background pointer-events-none" />

      <div className="relative z-10 flex flex-1 flex-col">
        <StatusBar />

        {/* ─── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2">
          <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-muted">
            <X size={20} strokeWidth={2} />
          </button>
          <span className="text-[15px] font-semibold text-foreground">{stock.symbol}</span>
          <div className="w-9" />
        </div>

        {/* ─── Layer 1: Stock Context (recessed) ────────────────── */}
        <div className="px-6 pt-1 scale-[0.97] origin-top opacity-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] text-muted-foreground">{stock.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[18px] font-bold tabular-nums text-foreground">{livePrice.toFixed(2)}</p>
              <p className={cn("text-[12px] tabular-nums font-medium", change >= 0 ? "text-gain" : "text-loss")}>
                {change >= 0 ? "+" : ""}{changePct}%
              </p>
            </div>
          </div>
          {/* Day range bar */}
          <div className="mt-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div className="h-full bg-foreground/20 rounded-full" style={{ width: "62%" }} />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>{(livePrice - 3.62).toFixed(2)}</span>
            <span>{(livePrice + 1.68).toFixed(2)}</span>
          </div>
        </div>

        {/* ─── Layer 2: Order Config (mid depth) ────────────────── */}
        <div className="px-5 mt-4">
          {/* Buy/Sell */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative flex h-10 rounded-xl bg-muted p-1">
              <motion.div
                className={cn("absolute top-1 h-8 rounded-lg shadow-md", isBuy ? "bg-gain" : "bg-loss")}
                animate={{ left: isBuy ? 4 : "calc(50% + 0px)", width: "calc(50% - 5px)" }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
              <button onClick={() => setSide("buy")} className={cn("relative z-10 px-8 text-[14px] font-semibold", isBuy ? "text-white" : "text-muted-foreground")}>Buy</button>
              <button onClick={() => setSide("sell")} className={cn("relative z-10 px-8 text-[14px] font-semibold", !isBuy ? "text-white" : "text-muted-foreground")}>Sell</button>
            </div>
          </div>

          {/* Order type segmented */}
          <div className="relative flex h-9 rounded-xl bg-muted p-1 mb-5">
            <motion.div
              className="absolute top-1 h-7 rounded-lg bg-background shadow-md"
              animate={{
                left: orderType === "market" ? 4 : orderType === "limit" ? "calc(33.33%)" : "calc(66.66%)",
                width: "calc(33.33% - 5px)",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
            {(["market", "limit", "stop-loss"] as OrderType[]).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={cn("relative z-10 flex-1 text-[13px] font-medium", orderType === type ? "text-foreground" : "text-muted-foreground")}
              >
                {orderTypeLabels[type]}
              </button>
            ))}
          </div>

          {/* Stop Loss toggle */}
          {orderType !== "stop-loss" && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] text-muted-foreground">Stop Loss</span>
              <Switch checked={stopLossEnabled} onCheckedChange={setStopLossEnabled} />
            </div>
          )}

          {/* Stop loss trigger price (elevated card when enabled) */}
          <AnimatePresence>
            {(orderType === "stop-loss" || stopLossEnabled) && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <button
                  onClick={() => { setActiveInput("stopPrice"); setShowKeypad(true); }}
                  className={cn(
                    "w-full rounded-xl bg-card shadow-md ring-1 ring-foreground/5 px-4 py-3 text-left transition-all",
                    activeInput === "stopPrice" && "scale-[1.02] shadow-lg ring-foreground/10"
                  )}
                >
                  <span className="text-[11px] font-medium text-muted-foreground">Trigger Price</span>
                  <p className={cn(
                    "text-[20px] font-semibold tabular-nums mt-0.5",
                    activeInput === "stopPrice" ? "text-foreground" : "text-foreground/50"
                  )}>
                    {stopLossPrice || "0.00"}
                  </p>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Limit price (elevated card) */}
          <AnimatePresence>
            {orderType === "limit" && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <button
                  onClick={() => { setActiveInput("limitPrice"); setShowKeypad(true); }}
                  className={cn(
                    "w-full rounded-xl bg-card shadow-md ring-1 ring-foreground/5 px-4 py-3 text-left transition-all",
                    activeInput === "limitPrice" && "scale-[1.02] shadow-lg ring-foreground/10"
                  )}
                >
                  <span className="text-[11px] font-medium text-muted-foreground">Limit Price</span>
                  <p className={cn(
                    "text-[20px] font-semibold tabular-nums mt-0.5",
                    activeInput === "limitPrice" ? "text-foreground" : "text-foreground/50"
                  )}>
                    {limitPrice || livePrice.toFixed(2)}
                  </p>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Charges + Available */}
          <div className="flex items-center justify-between text-[12px] text-muted-foreground/60 tabular-nums">
            <span>Charges 1.00</span>
            <span>Avail. {available.toFixed(2)}</span>
          </div>
        </div>

        {/* ─── Layer 3: Amount Card (elevated/forward) ──────────── */}
        <div className="px-3 mt-4 flex-1 flex flex-col justify-center">
          <motion.button
            onClick={() => { setActiveInput("amount"); setShowKeypad(true); }}
            animate={{
              scale: insufficientFunds ? 0.97 : activeInput === "amount" ? 1.02 : 1,
              boxShadow: insufficientFunds
                ? "0 4px 6px rgba(0,0,0,0.05)"
                : activeInput === "amount"
                  ? "0 20px 40px rgba(0,0,0,0.12)"
                  : "0 10px 25px rgba(0,0,0,0.08)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "w-full rounded-2xl bg-card ring-1 px-6 py-5 text-center transition-colors",
              insufficientFunds ? "ring-loss/30" : "ring-foreground/5"
            )}
          >
            <span className={cn(
              "text-[36px] font-bold tabular-nums leading-none transition-colors",
              insufficientFunds ? "text-loss" : "text-foreground"
            )}>
              {amount || "0"}
            </span>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="text-[13px] text-muted-foreground tabular-nums">
                {amountMode === "dollars" ? `Est. ${estShares.toFixed(4)} shares` : `Est. ${estCost.toFixed(2)}`}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setAmountMode(amountMode === "dollars" ? "shares" : "dollars"); }}
                className="flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5"
              >
                <ArrowUpDown size={10} className="text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground">{amountMode === "dollars" ? "USD" : "Shares"}</span>
              </button>
            </div>
            {insufficientFunds && (
              <p className="mt-2 text-[13px] font-medium text-loss">
                {(estCost - available).toFixed(2)} more needed
              </p>
            )}
          </motion.button>
        </div>

        {/* ─── Swipe CTA (elevated) ─────────────────────────────── */}
        <div className="px-3 pb-2 pt-3">
          {insufficientFunds ? (
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-loss/20 bg-loss/10 py-3.5 shadow-lg">
              <Plus size={16} className="text-loss" />
              <span className="text-[15px] font-semibold text-loss">Add Funds</span>
            </button>
          ) : (
            <SwipeCTA side={side} onComplete={() => setShowConfirmation(true)} />
          )}
        </div>

        {/* ─── Keypad (Layer 3 elevated) ────────────────────────── */}
        <AnimatePresence>
          {showKeypad && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="bg-card rounded-t-2xl shadow-xl border-t border-border/30"
            >
              <div className="flex items-center justify-end px-4 pt-1.5">
                <button onClick={() => setShowKeypad(false)} className="p-1.5 text-muted-foreground">
                  <Keyboard size={20} strokeWidth={1.8} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((key) => (
                  <button key={key} onClick={() => (key === "del" ? handleDelete() : handleKey(key))}
                    className="flex items-center justify-center h-[48px] text-[20px] font-medium text-foreground bg-muted shadow-sm rounded-xl active:bg-muted/80 transition-colors">
                    {key === "del" ? <Delete size={18} strokeWidth={1.8} className="text-muted-foreground" /> : key}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <HomeIndicator />
      </div>

      {/* ─── Confirmation ───────────────────────────────────────── */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background px-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-full rounded-2xl bg-card shadow-2xl ring-1 ring-foreground/5 p-6"
            >
              <div className="flex flex-col items-center">
                <div className={cn("flex h-16 w-16 items-center justify-center rounded-full", isBuy ? "bg-gain/15" : "bg-loss/15")}>
                  <Check size={30} strokeWidth={2.5} className={isBuy ? "text-gain" : "text-loss"} />
                </div>
                <p className="mt-4 text-[20px] font-bold text-foreground">Order Placed</p>
                <div className="mt-4 w-full space-y-2 border-t border-border/40 pt-4">
                  <div className="flex justify-between">
                    <span className="text-[13px] text-muted-foreground">Side</span>
                    <span className={cn("text-[13px] font-semibold capitalize", isBuy ? "text-gain" : "text-loss")}>{side}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-muted-foreground">Type</span>
                    <span className="text-[13px] font-medium text-foreground capitalize">{orderTypeLabels[orderType]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-muted-foreground">Amount</span>
                    <span className="text-[13px] font-medium text-foreground tabular-nums">{numAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-muted-foreground">Est. Shares</span>
                    <span className="text-[13px] font-medium text-foreground tabular-nums">{estShares.toFixed(4)}</span>
                  </div>
                </div>
                <button onClick={() => router.back()} className="mt-6 w-full rounded-2xl bg-foreground py-3.5 text-[15px] font-semibold text-background shadow-xl">
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
