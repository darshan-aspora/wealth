"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
  PanInfo,
} from "framer-motion";
import {
  X,
  ChevronsRight,
  Check,
  Delete,
  ArrowUpDown,
  Plus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Switch } from "@/components/ui/switch";

// ─── Types ──────────────────────────────────────────────────────────
type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit" | "stop-loss";
type AmountMode = "dollars" | "shares";

const stock = { name: "Tesla Inc", symbol: "TSLA", price: 411.82, changePercent: 0.03 };
const available = 500.0;

// ─── Sparkline Mock ─────────────────────────────────────────────────
const sparklinePoints = Array.from({ length: 40 }, (_, i) => {
  const base = 410 + Math.sin(i * 0.4) * 2 + Math.random() * 1.5;
  return base;
});
const sparkMin = Math.min(...sparklinePoints);
const sparkMax = Math.max(...sparklinePoints);
const sparkPath = sparklinePoints
  .map((p, i) => {
    const x = (i / (sparklinePoints.length - 1)) * 200;
    const y = 50 - ((p - sparkMin) / (sparkMax - sparkMin)) * 45;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  })
  .join(" ");

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
      className={cn("relative h-[54px] rounded-full overflow-hidden", isBuy ? "bg-foreground" : "bg-loss")}
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
            className={cn("absolute inset-0 flex items-center justify-center rounded-full", isBuy ? "bg-foreground" : "bg-loss")}
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

// ─── Main Page ──────────────────────────────────────────────────────
export default function OrderFlowV9() {
  const router = useRouter();
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [amountMode, setAmountMode] = useState<AmountMode>("dollars");
  const [amount, setAmount] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [activeInput, setActiveInput] = useState<"amount" | "limitPrice" | "stopPrice">("amount");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sheetDetent, setSheetDetent] = useState<"half" | "full">("half");

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

  // Sheet drag
  const handleSheetDrag = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -30 && sheetDetent === "half") setSheetDetent("full");
    if (info.offset.y > 30 && sheetDetent === "full") setSheetDetent("half");
  };

  // Shake animation
  const [shakeKey, setShakeKey] = useState(0);

  const orderTypeLabels: Record<OrderType, string> = { market: "Market", limit: "Limit", "stop-loss": "Stop Loss" };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* ─── Background: Stock Context ──────────────────────────── */}
      <div className="px-5 pt-3 opacity-30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[20px] font-bold text-foreground">{stock.symbol}</p>
            <p className="text-[13px] text-muted-foreground">{stock.name}</p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-bold tabular-nums text-foreground">{livePrice.toFixed(2)}</p>
            <div className="flex items-center justify-end gap-1">
              {change >= 0 ? <TrendingUp size={13} className="text-gain" /> : <TrendingDown size={13} className="text-loss" />}
              <span className={cn("text-[13px] font-medium tabular-nums", change >= 0 ? "text-gain" : "text-loss")}>
                {change >= 0 ? "+" : ""}{changePct}%
              </span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="mt-3">
          <svg viewBox="0 0 200 55" className="w-full h-[70px]" preserveAspectRatio="none">
            <path d={sparkPath} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
          </svg>
        </div>

        <div className="mt-2 flex items-center justify-between text-[12px] text-muted-foreground tabular-nums">
          <span>Day Low: {(livePrice - 3.62).toFixed(2)}</span>
          <span>Day High: {(livePrice + 1.68).toFixed(2)}</span>
        </div>
      </div>

      {/* ─── Bottom Sheet ───────────────────────────────────────── */}
      <motion.div
        key={shakeKey}
        animate={shakeKey > 0 ? { x: [0, -6, 6, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="absolute bottom-0 left-0 right-0 z-20"
      >
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={handleSheetDrag}
          animate={{
            height: sheetDetent === "full" ? "85vh" : "52vh",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="rounded-t-3xl bg-background border-t border-border/50 shadow-[0_-4px_30px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-2 pb-3 cursor-grab active:cursor-grabbing">
            <div className="h-[4px] w-[36px] rounded-full bg-muted-foreground/30" />
          </div>

          {/* Sheet content (scrollable) */}
          <div className="flex-1 overflow-y-auto px-5">
            {/* Buy/Sell segmented */}
            <div className="relative flex h-10 rounded-xl bg-muted p-1 mb-4">
              <motion.div
                className={cn("absolute top-1 h-8 w-[calc(50%-4px)] rounded-lg shadow-sm", isBuy ? "bg-background" : "bg-background")}
                animate={{ left: isBuy ? 4 : "calc(50% + 0px)" }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
              <button onClick={() => setSide("buy")} className={cn("relative z-10 flex-1 text-[14px] font-semibold", isBuy ? "text-gain" : "text-muted-foreground")}>Buy</button>
              <button onClick={() => setSide("sell")} className={cn("relative z-10 flex-1 text-[14px] font-semibold", !isBuy ? "text-loss" : "text-muted-foreground")}>Sell</button>
            </div>

            {/* Order type segmented */}
            <div className="relative flex h-9 rounded-xl bg-muted p-1 mb-5">
              <motion.div
                className="absolute top-1 h-7 rounded-lg bg-background shadow-sm"
                animate={{
                  left: orderType === "market" ? 4 : orderType === "limit" ? "calc(33.33% + 0px)" : "calc(66.66% + 0px)",
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

            {/* Separator */}
            <div className="border-t border-border/40 mb-4" />

            {/* Amount row */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[14px] text-muted-foreground">Amount</span>
              <button
                onClick={() => setAmountMode(amountMode === "dollars" ? "shares" : "dollars")}
                className="flex items-center gap-1 text-[12px] text-muted-foreground active:text-foreground"
              >
                <ArrowUpDown size={11} />
                {amountMode === "dollars" ? "USD" : "Shares"}
              </button>
            </div>
            <button
              onClick={() => setActiveInput("amount")}
              className="w-full text-right"
            >
              <span className={cn(
                "text-[24px] font-semibold tabular-nums transition-opacity",
                activeInput === "amount" ? "text-foreground" : "text-foreground/60"
              )}>
                {amount || "0"}
              </span>
            </button>
            <p className="text-[12px] text-muted-foreground tabular-nums text-right mb-4">
              Est. {estShares.toFixed(4)} shares
            </p>

            {/* Limit price (conditional) */}
            <AnimatePresence>
              {orderType === "limit" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="border-t border-border/40 pt-4">
                    <span className="text-[14px] text-muted-foreground">Limit Price</span>
                    <button onClick={() => setActiveInput("limitPrice")} className="w-full text-right">
                      <span className={cn(
                        "text-[20px] font-semibold tabular-nums",
                        activeInput === "limitPrice" ? "text-foreground" : "text-foreground/60"
                      )}>
                        {limitPrice || livePrice.toFixed(2)}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stop Loss (conditional on full detent or always in stop-loss mode) */}
            {(sheetDetent === "full" || orderType === "stop-loss") && (
              <>
                <div className="border-t border-border/40 pt-4 mb-4">
                  {orderType === "stop-loss" ? (
                    <>
                      <span className="text-[14px] text-muted-foreground">Trigger Price</span>
                      <button onClick={() => setActiveInput("stopPrice")} className="w-full text-right">
                        <span className={cn(
                          "text-[20px] font-semibold tabular-nums",
                          activeInput === "stopPrice" ? "text-foreground" : "text-foreground/60"
                        )}>
                          {stopLossPrice || "0.00"}
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] text-foreground font-medium">Stop Loss</span>
                        <Switch
                          checked={stopLossEnabled}
                          onCheckedChange={setStopLossEnabled}
                        />
                      </div>
                      <AnimatePresence>
                        {stopLossEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <button onClick={() => setActiveInput("stopPrice")} className="w-full text-right mt-2">
                              <span className={cn(
                                "text-[18px] font-semibold tabular-nums",
                                activeInput === "stopPrice" ? "text-foreground" : "text-foreground/60"
                              )}>
                                {stopLossPrice || "0.00"}
                              </span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>

                {/* Charges + Available */}
                <div className="border-t border-border/40 pt-3 space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-[13px] text-muted-foreground">Charges</span>
                    <span className="text-[13px] tabular-nums text-foreground">1.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-muted-foreground">Available</span>
                    <span className="text-[13px] tabular-nums text-foreground">{available.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Insufficient funds */}
            {insufficientFunds && (
              <div className="mb-4">
                <p className="text-[13px] font-medium text-loss">Need {(estCost - available).toFixed(2)} more.</p>
              </div>
            )}
          </div>

          {/* ─── CTA + Keypad ─────────────────────────────────────── */}
          <div className="px-5 py-2 border-t border-border/30">
            {insufficientFunds ? (
              <button
                onClick={() => setShakeKey((k) => k + 1)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-loss/20 bg-loss/10 py-3.5"
              >
                <Plus size={16} className="text-loss" />
                <span className="text-[15px] font-semibold text-loss">Add Funds</span>
              </button>
            ) : (
              <SwipeCTA side={side} onComplete={() => setShowConfirmation(true)} />
            )}
          </div>

          {/* Keypad embedded in sheet */}
          <div className="grid grid-cols-3 gap-0 px-2 pb-1">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((key) => (
              <button
                key={key}
                onClick={() => (key === "del" ? handleDelete() : handleKey(key))}
                className="flex items-center justify-center h-[46px] text-[20px] font-medium text-foreground active:bg-muted/50 rounded-lg transition-colors"
              >
                {key === "del" ? <Delete size={20} strokeWidth={1.8} className="text-muted-foreground" /> : key}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <HomeIndicator />

      {/* ─── Confirmation Toast ─────────────────────────────────── */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-12 left-4 right-4 z-50 flex items-center gap-3 rounded-xl border-l-4 border-gain bg-card px-4 py-3 shadow-lg"
          >
            <Check size={18} className="text-gain shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-foreground">
                {isBuy ? "Bought" : "Sold"} {estShares.toFixed(4)} {stock.symbol} at {orderTypeLabels[orderType]}
              </p>
              <button onClick={() => router.back()} className="mt-0.5 text-[12px] text-muted-foreground underline">View</button>
            </div>
            <button onClick={() => setShowConfirmation(false)} className="text-muted-foreground">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
