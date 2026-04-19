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
import { X, ChevronsRight, Check, Delete, Keyboard, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Switch } from "@/components/ui/switch";

// ─── Types ──────────────────────────────────────────────────────────
type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit" | "stop-loss";
type AmountMode = "dollars" | "shares";

const stock = { name: "Tesla Inc", symbol: "TSLA", price: 411.82, changePercent: 0.03 };
const available = 500.0;

// ─── Mock Stock Page Background ─────────────────────────────────────
function MockStockPage() {
  return (
    <div className="absolute inset-0 bg-background px-5 pt-14 opacity-30 blur-sm pointer-events-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[22px] font-bold text-foreground">{stock.symbol}</p>
          <p className="text-[14px] text-muted-foreground">{stock.name}</p>
        </div>
        <div className="text-right">
          <p className="text-[22px] font-bold tabular-nums text-foreground">{stock.price.toFixed(2)}</p>
          <p className="text-[13px] text-gain">+{stock.changePercent}%</p>
        </div>
      </div>
      {/* Mock chart */}
      <div className="h-[120px] rounded-xl bg-muted/30 mb-4 flex items-end px-3 pb-3 gap-1">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="flex-1 bg-gain/20 rounded-t" style={{ height: `${30 + Math.random() * 60}%` }} />
        ))}
      </div>
      {/* Mock metrics */}
      <div className="grid grid-cols-3 gap-3">
        {["Open", "High", "Low"].map((label) => (
          <div key={label} className="rounded-lg bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="text-[14px] font-semibold text-foreground tabular-nums">{(stock.price + (Math.random() - 0.5) * 5).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Swipe CTA (compact) ────────────────────────────────────────────
function SwipeCTA({ onComplete, side }: { onComplete: () => void; side: OrderSide }) {
  const isBuy = side === "buy";
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(280);
  const [completed, setCompleted] = useState(false);
  const dragX = useMotionValue(0);
  const thumbSize = 44;
  const maxDrag = trackWidth - thumbSize - 6;

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
    <div ref={trackRef} className={cn("relative h-[48px] rounded-full overflow-hidden", isBuy ? "bg-foreground" : "bg-loss")}>
      <motion.span className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-background pointer-events-none" style={{ opacity: textOpacity }}>
        Swipe to {isBuy ? "Buy" : "Sell"}
      </motion.span>
      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={cn("absolute inset-0 flex items-center justify-center rounded-full", isBuy ? "bg-foreground" : "bg-loss")}>
            <Check size={20} strokeWidth={2.5} className="text-background" />
          </motion.div>
        )}
      </AnimatePresence>
      {!completed && (
        <motion.div drag="x" dragConstraints={{ left: 0, right: maxDrag }} dragElastic={0.05} dragMomentum={false}
          onDragEnd={handleDragEnd} style={{ x: dragX }}
          className="absolute left-[3px] top-[2px] flex h-[44px] w-[44px] cursor-grab items-center justify-center rounded-full bg-background active:cursor-grabbing"
          whileTap={{ scale: 0.95 }}>
          <ChevronsRight size={18} strokeWidth={2} className="text-foreground" />
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function OrderFlowV13() {
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
      <StatusBar />
      <MockStockPage />

      {/* ─── Floating Panel ─────────────────────────────────────── */}
      <motion.div
        animate={{ y: showKeypad ? -100 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-30"
      >
        <div className={cn(
          "rounded-3xl border bg-card shadow-2xl p-5 transition-colors",
          insufficientFunds ? "border-loss/50 shadow-loss/10" : "border-border"
        )}>
          {/* Panel header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-bold text-foreground">{stock.symbol}</span>
              <span className="text-[14px] tabular-nums text-foreground">{livePrice.toFixed(2)}</span>
            </div>
            <button onClick={() => router.back()} className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Buy/Sell + Order type */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex h-8 rounded-full bg-muted p-0.5">
              <motion.div className={cn("absolute top-0.5 h-7 w-[40px] rounded-full", isBuy ? "bg-gain" : "bg-loss")} animate={{ left: isBuy ? 2 : 42 }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
              <button onClick={() => setSide("buy")} className={cn("relative z-10 w-[40px] text-[11px] font-bold", isBuy ? "text-white" : "text-muted-foreground")}>BUY</button>
              <button onClick={() => setSide("sell")} className={cn("relative z-10 w-[40px] text-[11px] font-bold", !isBuy ? "text-white" : "text-muted-foreground")}>SELL</button>
            </div>
            <div className="flex gap-1 flex-1">
              {(["market", "limit", "stop-loss"] as OrderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={cn(
                    "rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                    orderType === type ? "bg-foreground text-background" : "text-muted-foreground"
                  )}
                >
                  {orderTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between mb-1">
            <button onClick={() => { setActiveInput("amount"); setShowKeypad(true); }} className="flex-1">
              <span className={cn(
                "text-[24px] font-semibold tabular-nums",
                insufficientFunds ? "text-loss" : "text-foreground",
                activeInput === "amount" ? "opacity-100" : "opacity-60"
              )}>
                {amount || "0"}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-muted-foreground tabular-nums">
                {amountMode === "dollars" ? "USD" : "shares"}
              </span>
              <button onClick={() => setAmountMode(amountMode === "dollars" ? "shares" : "dollars")} className="text-muted-foreground">
                <ArrowUpDown size={13} />
              </button>
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground tabular-nums mb-3">
            Est. {estShares.toFixed(4)} shares &middot; Avail. {available.toFixed(2)}
          </p>

          {/* Limit price (conditional) */}
          <AnimatePresence>
            {orderType === "limit" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex items-center justify-between py-2 border-t border-border/40">
                  <span className="text-[13px] text-muted-foreground">Limit Price</span>
                  <button onClick={() => { setActiveInput("limitPrice"); setShowKeypad(true); }}>
                    <span className={cn("text-[16px] font-semibold tabular-nums", activeInput === "limitPrice" ? "text-foreground" : "text-foreground/50")}>
                      {limitPrice || livePrice.toFixed(2)}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stop-loss order price */}
          <AnimatePresence>
            {orderType === "stop-loss" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex items-center justify-between py-2 border-t border-border/40">
                  <span className="text-[13px] text-muted-foreground">Trigger Price</span>
                  <button onClick={() => { setActiveInput("stopPrice"); setShowKeypad(true); }}>
                    <span className={cn("text-[16px] font-semibold tabular-nums", activeInput === "stopPrice" ? "text-foreground" : "text-foreground/50")}>
                      {stopLossPrice || "0.00"}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stop Loss toggle (for market/limit) */}
          {orderType !== "stop-loss" && (
            <div className="flex items-center justify-between py-2 border-t border-border/40">
              <span className="text-[13px] text-muted-foreground">Stop Loss</span>
              <Switch checked={stopLossEnabled} onCheckedChange={setStopLossEnabled} />
            </div>
          )}
          <AnimatePresence>
            {stopLossEnabled && orderType !== "stop-loss" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-[12px] text-muted-foreground">Trigger Price</span>
                  <button onClick={() => { setActiveInput("stopPrice"); setShowKeypad(true); }}>
                    <span className={cn("text-[15px] font-semibold tabular-nums", activeInput === "stopPrice" ? "text-foreground" : "text-foreground/50")}>
                      {stopLossPrice || "0.00"}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insufficient funds */}
          {insufficientFunds && (
            <div className="flex items-center justify-between py-2 border-t border-border/40">
              <span className="text-[12px] font-medium text-loss">
                Need {(estCost - available).toFixed(2)} more
              </span>
              <button className="text-[12px] font-medium text-loss underline">Top up</button>
            </div>
          )}

          {/* CTA */}
          <div className="mt-3">
            {insufficientFunds ? (
              <button className="w-full rounded-full border border-loss/20 bg-loss/10 py-3 text-[14px] font-semibold text-loss">
                Add Funds
              </button>
            ) : (
              <SwipeCTA side={side} onComplete={() => setShowConfirmation(true)} />
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Keypad ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showKeypad && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="absolute bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-xl"
          >
            <div className="flex items-center justify-end px-4 pt-1.5">
              <button onClick={() => setShowKeypad(false)} className="p-1.5 text-muted-foreground">
                <Keyboard size={20} strokeWidth={1.8} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-0 px-2 pb-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((key) => (
                <button key={key} onClick={() => (key === "del" ? handleDelete() : handleKey(key))}
                  className="flex items-center justify-center h-[44px] text-[20px] font-medium text-foreground active:bg-muted/50 rounded-lg transition-colors">
                  {key === "del" ? <Delete size={18} strokeWidth={1.8} className="text-muted-foreground" /> : key}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-3xl border border-gain bg-card shadow-2xl p-6"
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gain/15"
              >
                <Check size={28} strokeWidth={2.5} className="text-gain" />
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 text-[18px] font-bold text-foreground">
                Order Placed
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 w-full space-y-2">
                <div className="flex justify-between"><span className="text-[13px] text-muted-foreground">Type</span><span className="text-[13px] font-medium text-foreground capitalize">{side} &middot; {orderTypeLabels[orderType]}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-muted-foreground">Amount</span><span className="text-[13px] font-medium text-foreground tabular-nums">{numAmount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-[13px] text-muted-foreground">Est. Shares</span><span className="text-[13px] font-medium text-foreground tabular-nums">{estShares.toFixed(4)}</span></div>
              </motion.div>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} onClick={() => router.back()}
                className="mt-6 w-full rounded-full bg-foreground py-3 text-[15px] font-semibold text-background">
                Done
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
