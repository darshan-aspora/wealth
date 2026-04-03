"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { X, ArrowUpDown, Info, ChevronsRight, RefreshCw, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ─── Types ──────────────────────────────────────────────────────────
type OrderCategory = "delivery" | "intraday" | "paylater" | "cover";
type OrderType = "market" | "limit" | "gtc";
type OrderSide = "buy" | "sell";

const categories: { key: OrderCategory; label: string }[] = [
  { key: "delivery", label: "Delivery" },
  { key: "intraday", label: "Intraday" },
  { key: "paylater", label: "Pay Later" },
  { key: "cover", label: "Cover" },
];

const stock = { name: "Tesla Inc", symbol: "TSLA", price: 411.82, changePercent: 0.03 };
const available = 500.0;
const fee = 1.0;

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
        "relative h-[58px] rounded-full overflow-hidden",
        isBuy ? "bg-foreground" : "bg-loss"
      )}
    >
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-[16px] font-medium text-background pointer-events-none"
        style={{ opacity: textOpacity }}
      >
        {isBuy ? "Swipe to Buy" : "Swipe to Sell"}
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
          className="absolute left-1 top-1 flex h-[50px] w-[50px] cursor-grab items-center justify-center rounded-full bg-background active:cursor-grabbing"
          whileTap={{ scale: 0.95 }}
        >
          <ChevronsRight size={22} strokeWidth={2} className="text-foreground" />
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function OrderFlowV2() {
  const [side, setSide] = useState<OrderSide>("buy");
  const [category, setCategory] = useState<OrderCategory>("delivery");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [amount, setAmount] = useState("10");
  const [limitPrice, setLimitPrice] = useState("411.30");
  const [triggerPrice, setTriggerPrice] = useState("411.30");
  const [stopLoss, setStopLoss] = useState(false);
  const [trailingStopLoss, setTrailingStopLoss] = useState(false);
  const [, setSwiped] = useState(false);
  const [amountMode, setAmountMode] = useState<"dollars" | "shares">("dollars");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [gtcPriceMode, setGtcPriceMode] = useState<"market" | "limit">("market");
  const [gtcLimitPrice, setGtcLimitPrice] = useState("411.30");
  const isBuy = side === "buy";

  const parsedAmount = parseFloat(amount) || 0;

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* ─── Header + Tabs ───────────────────────────────────────── */}
      <div className="relative z-10 bg-background">
        <header className="flex items-center justify-between px-5 py-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors">
            <X size={20} strokeWidth={2} />
          </button>

          <div className="flex flex-col items-start flex-1 ml-3">
            <span className="text-[17px] font-semibold text-foreground leading-tight">
              {stock.name}
            </span>
            <span className="text-[14px] text-muted-foreground leading-tight">
              {stock.price.toFixed(2)}{" "}
              <span className="text-gain">+{stock.changePercent.toFixed(2)}%</span>
            </span>
          </div>

          <div className="flex items-center rounded-full bg-muted p-0.5">
            <button
              onClick={() => { setSide("buy"); setSwiped(false); }}
              className={cn(
                "relative rounded-full px-3.5 py-1 text-[13px] font-semibold transition-colors",
                isBuy ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Buy
            </button>
            <button
              onClick={() => { setSide("sell"); setSwiped(false); }}
              className={cn(
                "relative rounded-full px-3.5 py-1 text-[13px] font-semibold transition-colors",
                !isBuy ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Sell
            </button>
          </div>
        </header>

        <div className="flex border-b border-border px-5">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={cn(
                "relative px-4 py-2.5 text-[14px] font-medium transition-colors whitespace-nowrap",
                category === cat.key ? "text-foreground" : "text-muted-foreground/40"
              )}
            >
              {cat.label}
              {category === cat.key && (
                <motion.div
                  layoutId="v2-order-category"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content ────────────────────────────────────────────── */}
      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pt-6 pb-[165px]">
        {/* Amount */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setAmountMode(amountMode === "dollars" ? "shares" : "dollars")}
            className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
          >
            <span className="text-[15px] text-muted-foreground">
              {amountMode === "dollars" ? (isBuy ? "Buy Amount" : "Sell Amount") : (isBuy ? "Buy Quantity" : "Sell Quantity")}
            </span>
            <ArrowUpDown size={14} strokeWidth={1.8} className="text-muted-foreground/50" />
          </button>
          <div className="flex items-baseline justify-end">
            {amountMode === "dollars" && (
              <span className="text-[18px] text-muted-foreground/50 mr-1">$</span>
            )}
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="bg-transparent text-[20px] font-semibold text-foreground tabular-nums outline-none text-right"
              style={{ width: `${Math.max(amount.length, 1)}ch` }}
            />
          </div>
        </div>

        <Separator />

        {/* Order Type */}
        <Tabs value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
          <div className="flex items-center justify-between mt-6">
            <span className="text-[15px] text-muted-foreground">Order Type</span>
            <TabsList>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="limit">Limit</TabsTrigger>
              <TabsTrigger value="gtc">GTC</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="market" className="mt-0" />

          <TabsContent value="limit" className="mt-6">
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-muted-foreground">Limit Price</span>
              <div className="flex items-baseline justify-end">
                <span className="text-[18px] text-muted-foreground/50 mr-1">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="bg-transparent text-[20px] font-semibold text-foreground tabular-nums outline-none text-right"
                  style={{ width: `${Math.max(limitPrice.length, 1)}ch` }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gtc" className="mt-6">
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-muted-foreground">Trigger Price</span>
              <div className="flex items-baseline justify-end">
                <span className="text-[18px] text-muted-foreground/50 mr-1">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="bg-transparent text-[20px] font-semibold text-foreground tabular-nums outline-none text-right"
                  style={{ width: `${Math.max(triggerPrice.length, 1)}ch` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setGtcPriceMode(gtcPriceMode === "market" ? "limit" : "market")}
                className="flex items-center gap-1.5 active:opacity-70 transition-opacity min-w-[130px]"
              >
                <span className="text-[15px] text-muted-foreground">
                  {gtcPriceMode === "market" ? "Market Price" : "Limit Price"}
                </span>
                <ArrowUpDown size={14} strokeWidth={1.8} className="text-muted-foreground/50" />
              </button>
              {gtcPriceMode === "market" ? (
                <span className="text-[15px] text-muted-foreground">At Market</span>
              ) : (
                <div className="flex items-baseline justify-end">
                  <span className="text-[18px] text-muted-foreground/50 mr-1">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={gtcLimitPrice}
                    onChange={(e) => setGtcLimitPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                    className="bg-transparent text-[20px] font-semibold text-foreground tabular-nums outline-none text-right"
                    style={{ width: `${Math.max(gtcLimitPrice.length, 1)}ch` }}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="mt-6" />

        {/* Advanced */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-5 mx-auto flex items-center gap-1.5 text-[14px] font-medium text-muted-foreground active:opacity-70 transition-opacity"
        >
          Advanced
          <motion.div
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} strokeWidth={2} />
          </motion.div>
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-5 flex items-center gap-3">
                <Checkbox
                  checked={stopLoss}
                  onCheckedChange={(v) => setStopLoss(v === true)}
                />
                <span className="text-[15px] font-medium text-foreground flex-1">Stop-Loss</span>
                <Info size={16} strokeWidth={1.8} className="text-muted-foreground/50" />
              </div>

              <Separator className="my-4" />

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={trailingStopLoss}
                  onCheckedChange={(v) => setTrailingStopLoss(v === true)}
                />
                <span className="text-[15px] font-medium text-foreground flex-1">Trailing Stop-Loss</span>
                <Info size={16} strokeWidth={1.8} className="text-muted-foreground/50" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Bottom Bar ─────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Separator />
        <div className="bg-background px-5 pt-3 pb-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] text-muted-foreground">
              Amount{" "}
              <span className="font-semibold text-foreground">
                {parsedAmount.toFixed(0)}
              </span>
              <span className="text-muted-foreground/50"> + {fee.toFixed(2)}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] text-muted-foreground">
                Avail.{" "}
                <span className="font-semibold text-foreground">
                  {available.toFixed(2)}
                </span>
              </span>
              <RefreshCw size={13} strokeWidth={1.8} className="text-muted-foreground/50" />
            </div>
          </div>

          <SwipeCTA side={side} onComplete={() => setSwiped(true)} />

          <HomeIndicator />
        </div>
      </div>
    </div>
  );
}
