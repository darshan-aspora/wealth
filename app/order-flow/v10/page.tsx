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
import { X, ChevronsRight, Check, Delete, ArrowUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

// ─── Types ──────────────────────────────────────────────────────────
type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit" | "stop-loss" | "stop-limit" | "trailing";
type AmountMode = "dollars" | "shares";
type FieldId = "amount" | "limitPrice" | "stopPrice" | null;

const stock = { name: "Tesla Inc", symbol: "TSLA", price: 411.82, changePercent: 0.03 };
const available = 500.0;

const orderTypes: { key: OrderType; label: string }[] = [
  { key: "market", label: "Market" },
  { key: "limit", label: "Limit" },
  { key: "stop-loss", label: "Stop Loss" },
  { key: "stop-limit", label: "Stop Limit" },
  { key: "trailing", label: "Trailing" },
];

// ─── Swipe CTA ──────────────────────────────────────────────────────
function SwipeCTA({ onComplete, side, disabled }: { onComplete: () => void; side: OrderSide; disabled?: boolean }) {
  const isBuy = side === "buy";
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(320);
  const [completed, setCompleted] = useState(false);
  const dragX = useMotionValue(0);
  const thumbSize = 48;
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
      <button className="flex w-full items-center justify-center gap-2 rounded-full bg-loss/20 py-3 transition-opacity active:opacity-80">
        <Plus size={15} className="text-loss" />
        <span className="text-[14px] font-semibold text-loss">Add Funds</span>
      </button>
    );
  }

  return (
    <div ref={trackRef} className={cn("relative h-[50px] rounded-full overflow-hidden", isBuy ? "bg-foreground" : "bg-loss")}>
      <motion.span className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-background pointer-events-none" style={{ opacity: textOpacity }}>
        Swipe to {isBuy ? "Buy" : "Sell"} {stock.symbol}
      </motion.span>
      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={cn("absolute inset-0 flex items-center justify-center rounded-full", isBuy ? "bg-foreground" : "bg-loss")}>
            <Check size={22} strokeWidth={2.5} className="text-background" />
          </motion.div>
        )}
      </AnimatePresence>
      {!completed && (
        <motion.div
          drag="x" dragConstraints={{ left: 0, right: maxDrag }} dragElastic={0.05} dragMomentum={false}
          onDragEnd={handleDragEnd} style={{ x: dragX }}
          className="absolute left-1 top-[1px] flex h-[48px] w-[48px] cursor-grab items-center justify-center rounded-full bg-background active:cursor-grabbing"
          whileTap={{ scale: 0.95 }}
        >
          <ChevronsRight size={20} strokeWidth={2} className="text-foreground" />
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function OrderFlowV10() {
  const router = useRouter();
  const pillsRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [amountMode, setAmountMode] = useState<AmountMode>("dollars");
  const [activeField, setActiveField] = useState<FieldId>("amount");

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

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-muted">
          <X size={20} strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-foreground">{stock.symbol}</span>
          <span className="text-[15px] tabular-nums text-foreground">{livePrice.toFixed(2)}</span>
          <span className={cn("text-[13px] tabular-nums font-medium", change >= 0 ? "text-gain" : "text-loss")}>
            {change >= 0 ? "+" : ""}{changePct}%
          </span>
        </div>
        <div className="relative flex h-8 rounded-full bg-muted/60 p-0.5">
          <motion.div className={cn("absolute top-0.5 h-7 w-[46px] rounded-full", isBuy ? "bg-gain" : "bg-loss")} animate={{ left: isBuy ? 2 : 48 }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
          <button onClick={() => setSide("buy")} className={cn("relative z-10 w-[46px] text-[12px] font-bold", isBuy ? "text-white" : "text-muted-foreground")}>BUY</button>
          <button onClick={() => setSide("sell")} className={cn("relative z-10 w-[46px] text-[12px] font-bold", !isBuy ? "text-white" : "text-muted-foreground")}>SELL</button>
        </div>
      </div>

      {/* ═══════ TOP PANE (scrollable config) ═══════ */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-3">
        {/* Order type pills — horizontal scroll */}
        <div ref={pillsRef} className="flex gap-2 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory -mx-1 px-1">
          {orderTypes.map((ot) => (
            <button
              key={ot.key}
              onClick={() => setOrderType(ot.key)}
              className={cn(
                "shrink-0 snap-start rounded-full px-4 py-2 text-[13px] font-medium transition-colors border",
                orderType === ot.key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/30"
              )}
            >
              {ot.label}
            </button>
          ))}
        </div>

        {/* Amount display */}
        <div className="flex flex-col items-center py-4">
          <button onClick={() => setActiveField("amount")} className="flex flex-col items-center">
            <span className={cn(
              "text-[32px] font-bold tabular-nums leading-none transition-colors",
              insufficientFunds ? "text-loss" : "text-foreground",
              activeField === "amount" ? "ring-2 ring-foreground/10 rounded-lg px-3 py-1" : ""
            )}>
              {amount || "0"}
            </span>
            <span className="mt-1.5 text-[12px] text-muted-foreground tabular-nums">
              {amountMode === "dollars" ? `Est. ${estShares.toFixed(4)} shares` : `Est. ${estCost.toFixed(2)}`}
            </span>
          </button>
          <button
            onClick={() => setAmountMode(amountMode === "dollars" ? "shares" : "dollars")}
            className="mt-2 flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1 active:bg-muted"
          >
            <ArrowUpDown size={11} className="text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">{amountMode === "dollars" ? "USD" : "Shares"}</span>
          </button>
        </div>

        {/* Limit price (conditional) */}
        <AnimatePresence>
          {(orderType === "limit" || orderType === "stop-limit") && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="border-t border-border/40 py-3 flex items-center justify-between">
                <span className="text-[13px] text-muted-foreground">Limit Price</span>
                <button onClick={() => setActiveField("limitPrice")} className={cn(
                  "text-[18px] font-semibold tabular-nums px-2 py-0.5 rounded-md transition-all",
                  activeField === "limitPrice" ? "text-foreground ring-2 ring-foreground/10" : "text-foreground/60"
                )}>
                  {limitPrice || livePrice.toFixed(2)}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stop price (conditional) */}
        <AnimatePresence>
          {(orderType === "stop-loss" || orderType === "stop-limit" || orderType === "trailing") && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="border-t border-border/40 py-3 flex items-center justify-between">
                <span className="text-[13px] text-muted-foreground">
                  {orderType === "trailing" ? "Trail Amount" : "Stop Price"}
                </span>
                <button onClick={() => setActiveField("stopPrice")} className={cn(
                  "text-[18px] font-semibold tabular-nums px-2 py-0.5 rounded-md transition-all",
                  activeField === "stopPrice" ? "text-foreground ring-2 ring-foreground/10" : "text-foreground/60"
                )}>
                  {stopPrice || "0.00"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charges + Available */}
        <div className="border-t border-border/40 pt-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-[12px] text-muted-foreground">Charges</span>
            <span className="text-[12px] tabular-nums text-foreground">1.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[12px] text-muted-foreground">Available</span>
            <span className="text-[12px] tabular-nums text-foreground">{available.toFixed(2)}</span>
          </div>
          {insufficientFunds && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-loss/10 px-3 py-2">
              <p className="text-[13px] font-medium text-loss">
                You need {(estCost - available).toFixed(2)} more to place this order.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══════ FIXED BOTTOM PANE ═══════ */}
      <div className="border-t-2 border-foreground/10 bg-muted/30">
        {/* Swipe CTA */}
        <div className="px-4 pt-2 pb-1">
          <SwipeCTA side={side} disabled={insufficientFunds} onComplete={() => setShowConfirmation(true)} />
        </div>

        {/* Keypad always visible */}
        <div className="grid grid-cols-3 gap-0 px-2 pb-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((key) => (
            <button
              key={key}
              onClick={() => (key === "del" ? handleDelete() : handleKey(key))}
              className="flex items-center justify-center h-[48px] text-[20px] font-medium text-foreground active:bg-muted/50 rounded-lg transition-colors"
            >
              {key === "del" ? <Delete size={20} strokeWidth={1.8} className="text-muted-foreground" /> : key}
            </button>
          ))}
        </div>
      </div>

      <HomeIndicator />

      {/* ─── Confirmation ───────────────────────────────────────── */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex flex-col bg-background">
            {/* Top pane — confirmation */}
            <div className="flex-1 flex flex-col items-center justify-center px-8">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className={cn("flex h-16 w-16 items-center justify-center rounded-full", isBuy ? "bg-gain/15" : "bg-loss/15")}
              >
                <Check size={30} strokeWidth={2.5} className={isBuy ? "text-gain" : "text-loss"} />
              </motion.div>
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 text-[20px] font-bold text-foreground">
                Order Placed
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-4 w-full space-y-2 rounded-xl border border-border/50 bg-card p-4">
                <div className="flex justify-between"><span className="text-[13px] text-muted-foreground">Type</span><span className="text-[13px] font-medium text-foreground capitalize">{side} &middot; {orderType}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-muted-foreground">Amount</span><span className="text-[13px] font-medium text-foreground tabular-nums">{numAmount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-muted-foreground">Est. Shares</span><span className="text-[13px] font-medium text-foreground tabular-nums">{estShares.toFixed(4)}</span></div>
              </motion.div>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} onClick={() => router.back()} className="mt-6 w-full rounded-full bg-foreground py-3 text-[15px] font-semibold text-background">
                Done
              </motion.button>
            </div>
            {/* Bottom pane — faded keypad */}
            <div className="border-t-2 border-foreground/10 bg-muted/30 opacity-30 pointer-events-none">
              <div className="px-4 pt-2 pb-1"><div className="h-[50px] rounded-full bg-foreground/20" /></div>
              <div className="grid grid-cols-3 gap-0 px-2 pb-1">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", ""].map((key, i) => (
                  <div key={i} className="flex items-center justify-center h-[48px] text-[20px] text-muted-foreground">{key}</div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
