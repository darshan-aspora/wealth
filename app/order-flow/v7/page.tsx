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
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

// ─── Types ──────────────────────────────────────────────────────────
type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit" | "stop" | "stop-limit";
type Validity = "day" | "gtc";

const stock = { name: "Tesla Inc", symbol: "TSLA", price: 411.82, changePercent: 0.03 };
const available = 500.0;
const fee = 0.03;

const depthData = [
  { bidQty: 1250, bid: 411.78, ask: 411.84, askQty: 890 },
  { bidQty: 3400, bid: 411.75, ask: 411.87, askQty: 2100 },
  { bidQty: 780, bid: 411.70, ask: 411.92, askQty: 4500 },
  { bidQty: 5600, bid: 411.65, ask: 411.95, askQty: 1800 },
  { bidQty: 2200, bid: 411.60, ask: 412.00, askQty: 3200 },
];

const maxDepthQty = Math.max(...depthData.flatMap((r) => [r.bidQty, r.askQty]));

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
        "relative h-[52px] overflow-hidden rounded-md",
        disabled ? "opacity-50" : "",
        isBuy ? "bg-foreground" : "bg-loss"
      )}
    >
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-background pointer-events-none"
        style={{ opacity: textOpacity }}
      >
        {disabled ? "Insufficient Funds" : `Swipe to ${isBuy ? "Buy" : "Sell"} ${stock.symbol}`}
      </motion.span>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("absolute inset-0 flex items-center justify-center", isBuy ? "bg-foreground" : "bg-loss")}
          >
            <Check size={22} strokeWidth={2.5} className="text-background" />
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
          className="absolute left-1 top-[1px] flex h-[50px] w-[50px] cursor-grab items-center justify-center rounded-md bg-background active:cursor-grabbing"
          whileTap={{ scale: 0.95 }}
        >
          <ChevronsRight size={20} strokeWidth={2} className="text-foreground" />
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function OrderFlowV7() {
  const router = useRouter();
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [validity, setValidity] = useState<Validity>("day");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showValidityDropdown, setShowValidityDropdown] = useState(false);

  // Fields
  const [qty, setQty] = useState("0.024");
  const [amount, setAmount] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [stopLimitPrice, setStopLimitPrice] = useState("");

  // Toggles
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [trailingEnabled, setTrailingEnabled] = useState(false);
  const [trailingAmount, setTrailingAmount] = useState("");
  const [takeProfitEnabled, setTakeProfitEnabled] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState("");

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
  const numQty = parseFloat(qty) || 0;
  const estCost = numAmount || numQty * livePrice;
  const insufficientFunds = estCost > available;

  // Sync qty/amount
  const handleAmountChange = (val: string) => {
    setAmount(val);
    const n = parseFloat(val) || 0;
    if (livePrice > 0) setQty((n / livePrice).toFixed(4));
  };
  const handleQtyChange = (val: string) => {
    setQty(val);
    const n = parseFloat(val) || 0;
    setAmount((n * livePrice).toFixed(2));
  };

  const change = livePrice - stock.price;
  const changePct = ((change / stock.price) * 100).toFixed(2);

  const orderTypeLabels: Record<OrderType, string> = {
    market: "Market",
    limit: "Limit",
    stop: "Stop",
    "stop-limit": "Stop Limit",
  };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center text-muted-foreground active:bg-muted transition-colors"
        >
          <X size={18} strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-foreground">{stock.symbol}</span>
          <span className="text-[13px] text-muted-foreground">{stock.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold tabular-nums text-foreground">{livePrice.toFixed(2)}</span>
          <span className={cn("text-[12px] tabular-nums font-medium", change >= 0 ? "text-gain" : "text-loss")}>
            {change >= 0 ? "+" : ""}{changePct}%
          </span>
        </div>
      </div>

      {/* ─── Buy/Sell full-width ────────────────────────────────── */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setSide("buy")}
          className={cn(
            "flex-1 py-2.5 text-[14px] font-bold text-center transition-colors border-b-2",
            isBuy ? "text-gain border-gain" : "text-muted-foreground border-transparent"
          )}
        >
          BUY
        </button>
        <button
          onClick={() => setSide("sell")}
          className={cn(
            "flex-1 py-2.5 text-[14px] font-bold text-center transition-colors border-b-2",
            !isBuy ? "text-loss border-loss" : "text-muted-foreground border-transparent"
          )}
        >
          SELL
        </button>
      </div>

      {/* ─── Content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* Order Type + Validity row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="flex-1">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Order Type</span>
            <div className="relative mt-0.5">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-1 text-[14px] font-medium text-foreground"
              >
                {orderTypeLabels[orderType]}
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              <AnimatePresence>
                {showTypeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-30 top-7 left-0 bg-card border border-border shadow-lg py-1 min-w-[140px]"
                  >
                    {(Object.keys(orderTypeLabels) as OrderType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => { setOrderType(type); setShowTypeDropdown(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-[13px] transition-colors",
                          orderType === type ? "text-foreground bg-muted/50 font-medium" : "text-muted-foreground hover:bg-muted/30"
                        )}
                      >
                        {orderTypeLabels[type]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Validity</span>
            <div className="relative mt-0.5">
              <button
                onClick={() => setShowValidityDropdown(!showValidityDropdown)}
                className="flex items-center gap-1 text-[14px] font-medium text-foreground"
              >
                {validity === "day" ? "Day" : "GTC"}
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              <AnimatePresence>
                {showValidityDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-30 top-7 left-0 bg-card border border-border shadow-lg py-1 min-w-[100px]"
                  >
                    {(["day", "gtc"] as Validity[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => { setValidity(v); setShowValidityDropdown(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-[13px] transition-colors",
                          validity === v ? "text-foreground bg-muted/50 font-medium" : "text-muted-foreground hover:bg-muted/30"
                        )}
                      >
                        {v === "day" ? "Day" : "GTC"}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Qty + Amount row */}
        <div className="flex items-start gap-3 px-4 py-3 border-b border-border">
          <div className="flex-1">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Quantity</span>
            <input
              type="text"
              inputMode="decimal"
              value={qty}
              onChange={(e) => handleQtyChange(e.target.value)}
              className="mt-0.5 block w-full border-b border-border/60 bg-transparent text-[16px] font-semibold text-foreground tabular-nums outline-none focus:border-foreground pb-1 transition-colors"
            />
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Amount</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="mt-0.5 block w-full border-b border-border/60 bg-transparent text-[16px] font-semibold text-foreground tabular-nums outline-none focus:border-foreground pb-1 transition-colors"
            />
          </div>
        </div>

        {/* Limit / Stop price rows (conditional) */}
        <AnimatePresence>
          {(orderType === "limit" || orderType === "stop-limit") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-border"
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex-1">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    {orderType === "limit" ? "Limit Price" : "Stop Price"}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={orderType === "limit" ? limitPrice : stopPrice}
                    onChange={(e) => orderType === "limit" ? setLimitPrice(e.target.value) : setStopPrice(e.target.value)}
                    placeholder={livePrice.toFixed(2)}
                    className="mt-0.5 block w-full border-b border-border/60 bg-transparent text-[16px] font-semibold text-foreground tabular-nums outline-none focus:border-foreground pb-1 placeholder:text-muted-foreground/30 transition-colors"
                  />
                </div>
                {orderType === "stop-limit" && (
                  <div className="flex-1">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Limit Price</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={stopLimitPrice}
                      onChange={(e) => setStopLimitPrice(e.target.value)}
                      placeholder={livePrice.toFixed(2)}
                      className="mt-0.5 block w-full border-b border-border/60 bg-transparent text-[16px] font-semibold text-foreground tabular-nums outline-none focus:border-foreground pb-1 placeholder:text-muted-foreground/30 transition-colors"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {orderType === "stop" && (
          <div className="flex items-start gap-3 px-4 py-3 border-b border-border">
            <div className="flex-1">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Stop Price</span>
              <input
                type="text"
                inputMode="decimal"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                placeholder={livePrice.toFixed(2)}
                className="mt-0.5 block w-full border-b border-border/60 bg-transparent text-[16px] font-semibold text-foreground tabular-nums outline-none focus:border-foreground pb-1 placeholder:text-muted-foreground/30 transition-colors"
              />
            </div>
            <div className="flex-1" />
          </div>
        )}

        {/* ─── Market Depth (always visible) ────────────────────── */}
        <div className="px-4 py-3 border-b border-border">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Market Depth</span>
          <div className="mt-2">
            <div className="flex text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              <span className="w-1/4 text-left">Bid Qty</span>
              <span className="w-1/4 text-right">Bid</span>
              <span className="w-1/4 text-right">Ask</span>
              <span className="w-1/4 text-right">Ask Qty</span>
            </div>
            {depthData.map((row, i) => (
              <div key={i} className="relative flex items-center py-1.5 text-[13px] tabular-nums">
                {/* Bid background bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gain/5"
                  style={{ width: `${(row.bidQty / maxDepthQty) * 50}%` }}
                />
                {/* Ask background bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-loss/5"
                  style={{ width: `${(row.askQty / maxDepthQty) * 50}%` }}
                />
                <span className="relative w-1/4 text-left text-foreground">{row.bidQty.toLocaleString()}</span>
                <span className="relative w-1/4 text-right text-gain">{row.bid.toFixed(2)}</span>
                <span className="relative w-1/4 text-right text-loss">{row.ask.toFixed(2)}</span>
                <span className="relative w-1/4 text-right text-foreground">{row.askQty.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Add-on Toggles ───────────────────────────────────── */}
        <div className="px-4 py-3 border-b border-border space-y-3">
          {/* Stop Loss */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-foreground font-medium">Stop Loss</span>
              <button
                onClick={() => setStopLossEnabled(!stopLossEnabled)}
                className={cn(
                  "text-[12px] font-medium px-2 py-0.5 transition-colors",
                  stopLossEnabled ? "text-foreground bg-muted" : "text-muted-foreground"
                )}
              >
                {stopLossEnabled ? "ON" : "OFF"}
              </button>
            </div>
            <AnimatePresence>
              {stopLossEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    placeholder="Trigger price"
                    className="mt-2 block w-1/2 border-b border-border/60 bg-transparent text-[14px] font-medium text-foreground tabular-nums outline-none focus:border-foreground pb-1 placeholder:text-muted-foreground/30 transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trailing Stop */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-foreground font-medium">Trailing Stop</span>
              <button
                onClick={() => setTrailingEnabled(!trailingEnabled)}
                className={cn(
                  "text-[12px] font-medium px-2 py-0.5 transition-colors",
                  trailingEnabled ? "text-foreground bg-muted" : "text-muted-foreground"
                )}
              >
                {trailingEnabled ? "ON" : "OFF"}
              </button>
            </div>
            <AnimatePresence>
              {trailingEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    value={trailingAmount}
                    onChange={(e) => setTrailingAmount(e.target.value)}
                    placeholder="Trail amount"
                    className="mt-2 block w-1/2 border-b border-border/60 bg-transparent text-[14px] font-medium text-foreground tabular-nums outline-none focus:border-foreground pb-1 placeholder:text-muted-foreground/30 transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Take Profit */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-foreground font-medium">Take Profit</span>
              <button
                onClick={() => setTakeProfitEnabled(!takeProfitEnabled)}
                className={cn(
                  "text-[12px] font-medium px-2 py-0.5 transition-colors",
                  takeProfitEnabled ? "text-foreground bg-muted" : "text-muted-foreground"
                )}
              >
                {takeProfitEnabled ? "ON" : "OFF"}
              </button>
            </div>
            <AnimatePresence>
              {takeProfitEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    placeholder="Target price"
                    className="mt-2 block w-1/2 border-b border-border/60 bg-transparent text-[14px] font-medium text-foreground tabular-nums outline-none focus:border-foreground pb-1 placeholder:text-muted-foreground/30 transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Charges + Buying Power (always visible) ──────────── */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Charges</span>
            <span className="text-[13px] tabular-nums text-foreground">{fee.toFixed(2)} (SEC + FINRA)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Buying Power</span>
            <span className="text-[13px] tabular-nums text-foreground">{available.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Required</span>
            <span className={cn("text-[13px] tabular-nums font-medium", insufficientFunds ? "text-loss" : "text-foreground")}>
              {estCost.toFixed(2)}
            </span>
          </div>
          {insufficientFunds && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between"
            >
              <span className="text-[12px] text-loss font-medium">
                Short {(estCost - available).toFixed(2)}
              </span>
              <button className="text-[12px] text-loss font-medium underline">Add funds</button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ─── Bottom CTA ─────────────────────────────────────────── */}
      <div className="px-4 py-2 border-t border-border">
        <SwipeCTA
          side={side}
          disabled={insufficientFunds}
          onComplete={() => setShowConfirmation(true)}
        />
      </div>

      <HomeIndicator />

      {/* ─── Confirmation Toast ─────────────────────────────────── */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-12 left-4 right-4 z-50 flex items-center gap-3 rounded-md border-l-4 border-gain bg-card px-4 py-3 shadow-lg"
          >
            <Check size={18} className="text-gain shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-foreground">
                Order placed: {isBuy ? "Buy" : "Sell"} {numQty.toFixed(4)} {stock.symbol} at {orderTypeLabels[orderType]}
              </p>
              <button
                onClick={() => router.back()}
                className="mt-0.5 text-[12px] text-muted-foreground underline"
              >
                View in Orders
              </button>
            </div>
            <button
              onClick={() => setShowConfirmation(false)}
              className="text-muted-foreground"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
