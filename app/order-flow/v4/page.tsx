"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { X, ChevronsUpDown, Info, ChevronsRight, RefreshCw, Check, ChevronDown, Delete, Keyboard, Zap, Repeat, Target, TrendingDown, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// ─── Types ──────────────────────────────────────────────────────────
type OrderCategory = "delivery" | "intraday" | "paylater" | "cover";
type OrderSide = "buy" | "sell";
type OrderType = "market" | "sip" | "limit" | "trailing-stop" | "stop" | "stop-limit";

const orderTypes: { key: OrderType; label: string; description: string; icon: typeof Zap }[] = [
  { key: "market", label: "Market Order", description: "Buy or sell immediately at best available price", icon: Zap },
  { key: "sip", label: "SIP", description: "Invest a fixed amount at regular intervals", icon: Repeat },
  { key: "limit", label: "Limit Order", description: "Set your price — executes only at that price or better", icon: Target },
  { key: "trailing-stop", label: "Trailing Stop Order", description: "Stop price trails the market by a set amount", icon: TrendingDown },
  { key: "stop", label: "Stop Order", description: "Triggers a market order when price hits your target", icon: ShieldAlert },
  { key: "stop-limit", label: "Stop Limit Order", description: "Triggers a limit order when price hits your target", icon: ShieldCheck },
];

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
  useTransform(dragX, [0, maxDrag], ["58px", `${trackWidth}px`]);

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

// ─── Field IDs ──────────────────────────────────────────────────────
type FieldId = "amount" | null;

// ─── Market Depth ───────────────────────────────────────────────────
const depthData = [
  { bidQty: 0, bid: 0, offer: 640.20, offerQty: 16881 },
  { bidQty: 0, bid: 0, offer: 0, offerQty: 0 },
  { bidQty: 0, bid: 0, offer: 0, offerQty: 0 },
  { bidQty: 0, bid: 0, offer: 0, offerQty: 0 },
  { bidQty: 0, bid: 0, offer: 0, offerQty: 0 },
];

function MarketDepthPanel() {
  return (
    <div className="px-4">
      <div className="flex items-center justify-between text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
        <span className="w-1/4 text-left">Quantity</span>
        <span className="w-1/4 text-right">Bid</span>
        <span className="w-1/4 text-left pl-4">Offer</span>
        <span className="w-1/4 text-right">Quantity</span>
      </div>
      <Separator className="mb-1" />
      {depthData.map((row, i) => (
        <div key={i} className="flex items-center justify-between py-2 text-[14px] tabular-nums">
          <span className="w-1/4 text-left text-foreground">{row.bidQty}</span>
          <span className="w-1/4 text-right text-foreground">{row.bid.toFixed(2)}</span>
          <span className="w-1/4 text-left pl-4 text-foreground">{row.offer.toFixed(2)}</span>
          <span className={cn("w-1/4 text-right", row.offerQty > 0 ? "text-loss bg-loss/10 px-1 rounded" : "text-foreground")}>
            {row.offerQty}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Numeric Keyboard ───────────────────────────────────────────────
function NumericKeypad({
  onKey,
  onDelete,
  onDismiss,
}: {
  onKey: (key: string) => void;
  onDelete: () => void;
  onDismiss: () => void;
}) {
  const [keypadTab, setKeypadTab] = useState<"keyboard" | "depth">("keyboard");

  return (
    <div className="bg-muted/50">
      {/* Tabs + dismiss */}
      <div className="flex items-center justify-between px-4 pt-2 border-b border-border">
        <div className="flex gap-0">
          <button
            onClick={() => setKeypadTab("keyboard")}
            className={cn(
              "relative px-3 pb-2 pt-1.5 text-[14px] font-medium transition-colors",
              keypadTab === "keyboard" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Keyboard
            {keypadTab === "keyboard" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
            )}
          </button>
          <button
            onClick={() => setKeypadTab("depth")}
            className={cn(
              "relative px-3 pb-2 pt-1.5 text-[14px] font-medium transition-colors",
              keypadTab === "depth" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Market Depth
            {keypadTab === "depth" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
            )}
          </button>
        </div>
        <button onClick={onDismiss} className="p-1.5 text-muted-foreground active:opacity-70">
          <Keyboard size={20} strokeWidth={1.8} />
        </button>
      </div>

      <div className="h-[220px]">
        {keypadTab === "keyboard" ? (
          <div className="grid grid-cols-3 gap-0 px-2 py-2">
            {["1","2","3","4","5","6","7","8","9",".","0","del"].map((key) => (
              <button
                key={key}
                onClick={() => key === "del" ? onDelete() : onKey(key)}
                className="flex items-center justify-center h-[52px] text-[22px] font-medium text-foreground active:bg-muted rounded-lg transition-colors"
              >
                {key === "del" ? <Delete size={22} strokeWidth={1.8} className="text-muted-foreground" /> : key}
              </button>
            ))}
          </div>
        ) : (
          <div className="py-2 overflow-y-auto h-full">
            <MarketDepthPanel />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function OrderFlowV4() {
  const router = useRouter();
  const [side, setSide] = useState<OrderSide>("buy");
  const [category, setCategory] = useState<OrderCategory>("delivery");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [orderTypeSheet, setOrderTypeSheet] = useState(false);
  const [amount, setAmount] = useState("10");
  const [, setSwiped] = useState(false);
  const [amountMode, setAmountMode] = useState<"dollars" | "shares">("dollars");
  const [footerSheet, setFooterSheet] = useState<"charges" | "buying-power" | null>(null);
  const [activeField, setActiveField] = useState<FieldId>(null);
  const [showCategoryTabs, setShowCategoryTabs] = useState(false);
  const [livePrice, setLivePrice] = useState(stock.price);
  const [liveChange, setLiveChange] = useState(stock.changePercent);
  const isBuy = side === "buy";

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const delta = (Math.random() - 0.48) * 0.15;
        return Math.round((prev + delta) * 100) / 100;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLiveChange(Math.round(((livePrice - stock.price) / stock.price) * 10000) / 100 + stock.changePercent);
  }, [livePrice]);

  const parsedAmount = parseFloat(amount) || 0;
  const dollarAmount = amountMode === "dollars" ? parsedAmount : parsedAmount * livePrice;
  const insufficientFunds = (dollarAmount + fee) > available;

  const handleKey = (key: string) => {
    if (!activeField) return;
    if (key === "." && amount.includes(".")) return;
    setAmount(amount + key);
  };

  const handleDelete = () => {
    if (!activeField) return;
    setAmount(amount.slice(0, -1));
  };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* ─── Header + Tabs ───────────────────────────────────────── */}
      <div className="relative z-10 bg-background">
        <header className="flex items-center justify-between px-5 py-3">
          <button onClick={() => router.push("/order-flow")} className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors">
            <X size={20} strokeWidth={2} />
          </button>

          <button
            onClick={() => setShowCategoryTabs(!showCategoryTabs)}
            className="flex flex-col items-start flex-1 ml-3 active:opacity-70 transition-opacity"
          >
            <span className="text-[17px] font-semibold text-foreground leading-tight">
              {stock.name}
            </span>
            <span className="text-[14px] text-muted-foreground leading-tight">
              {livePrice.toFixed(2)}{" "}
              <span className={liveChange >= 0 ? "text-gain" : "text-loss"}>
                {liveChange >= 0 ? "+" : ""}{liveChange.toFixed(2)}%
              </span>
            </span>
          </button>

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

        <AnimatePresence>
          {showCategoryTabs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
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
                        layoutId="order-category"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Content ────────────────────────────────────────────── */}
      <main
        className="no-scrollbar flex-1 overflow-y-auto px-5 pt-4 pb-4"
        onClick={() => { if (activeField) setActiveField(null); }}
      >
        {/* Amount */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (amountMode === "dollars") {
                const qty = (parseFloat(amount) || 0) / stock.price;
                setAmount(qty > 0 ? qty.toFixed(2) : "0");
                setAmountMode("shares");
              } else {
                const dollars = (parseFloat(amount) || 0) * stock.price;
                setAmount(dollars > 0 ? dollars.toFixed(2) : "0");
                setAmountMode("dollars");
              }
            }}
            className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
          >
            <span className="text-[15px] text-muted-foreground">
              {amountMode === "dollars" ? (isBuy ? "Buy Amount" : "Sell Amount") : (isBuy ? "Buy Quantity" : "Sell Quantity")}
            </span>
            <ChevronsUpDown size={14} strokeWidth={1.8} className="text-muted-foreground/50" />
          </button>
          <div className="flex flex-col items-end">
            <button onClick={(e) => { e.stopPropagation(); setActiveField("amount"); }} className="flex items-baseline justify-end active:opacity-70">
              {amountMode === "dollars" && (
                <span className="text-[18px] text-muted-foreground/50 mr-1">$</span>
              )}
              <span className="text-[20px] font-semibold tabular-nums text-foreground">
                {amount || "0"}
              </span>
              {activeField === "amount" && <span className="w-[2px] h-[22px] bg-foreground ml-0.5 animate-pulse" />}
            </button>
            {parseFloat(amount) > 0 && (
              <span className="text-[13px] tabular-nums text-muted-foreground/50 mt-0.5">
                {amountMode === "dollars"
                  ? `Est. ${(parseFloat(amount) / livePrice).toFixed(4)} shares`
                  : `Est. $${(parseFloat(amount) * livePrice).toFixed(2)}`}
              </span>
            )}
          </div>
        </div>

      </main>

      {/* ─── Bottom Bar + Keyboard ────────────────────────────── */}
      <div className="flex flex-col mt-auto z-10 bg-background">
        {/* Insufficient funds warning */}
        <AnimatePresence>
          {insufficientFunds && dollarAmount > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 py-2.5 bg-loss/10 border-b border-loss/20 flex items-center gap-2">
                <Info size={15} strokeWidth={2} className="text-loss shrink-0" />
                <span className="text-[13px] text-loss">
                  Insufficient buying power. You need <span className="font-semibold">{((dollarAmount + fee) - available).toFixed(2)}</span> more.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Order Type Button */}
        <div className="flex justify-center py-2.5">
          <button
            onClick={() => setOrderTypeSheet(true)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 active:scale-[0.97] transition-all"
          >
            <span className="text-[14px] font-medium text-foreground">
              {orderTypes.find((t) => t.key === orderType)?.label}
            </span>
            <ChevronDown size={15} strokeWidth={2} className="text-muted-foreground" />
          </button>
        </div>

        <Separator />
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setFooterSheet("charges")}
              className="text-[14px] text-muted-foreground active:opacity-70 transition-opacity"
            >
              Amount{" "}
              <span className="font-semibold text-foreground">
                {dollarAmount.toFixed(2)}
              </span>
              <span className="text-muted-foreground/50 underline underline-offset-2 decoration-dashed"> + {fee.toFixed(2)} Charges</span>
            </button>
            <button
              onClick={() => setFooterSheet("buying-power")}
              className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
            >
              <span className="text-[14px] text-muted-foreground">
                Avail.{" "}
                <span className={cn("font-semibold underline underline-offset-2 decoration-dashed", insufficientFunds && dollarAmount > 0 ? "text-loss" : "text-foreground")}>
                  {available.toFixed(2)}
                </span>
              </span>
              <RefreshCw size={13} strokeWidth={1.8} className="text-muted-foreground/50" />
            </button>
          </div>

          {insufficientFunds && dollarAmount > 0 ? (
            <button
              onClick={() => setFooterSheet("buying-power")}
              className="w-full h-[58px] rounded-full bg-foreground text-background text-[16px] font-semibold active:opacity-90 transition-opacity"
            >
              Add Funds
            </button>
          ) : (
            <SwipeCTA side={side} onComplete={() => setSwiped(true)} />
          )}
        </div>

        {/* Numeric Keyboard */}
        <AnimatePresence>
          {activeField && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <NumericKeypad
                onKey={handleKey}
                onDelete={handleDelete}
                onDismiss={() => setActiveField(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <HomeIndicator />
      </div>

      {/* ─── Charges & Buying Power Sheet ────────────────────── */}
      <Sheet open={footerSheet !== null} onOpenChange={(open) => { if (!open) setFooterSheet(null); }}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-10 h-[420px]">
          {/* Tabs */}
          <div className="flex gap-0 border-b border-border mb-5">
            <button
              onClick={() => setFooterSheet("charges")}
              className={cn(
                "relative px-4 py-2.5 text-[14px] font-medium transition-colors",
                footerSheet === "charges" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Charges
              {footerSheet === "charges" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
            </button>
            <button
              onClick={() => setFooterSheet("buying-power")}
              className={cn(
                "relative px-4 py-2.5 text-[14px] font-medium transition-colors",
                footerSheet === "buying-power" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Buying Power
              {footerSheet === "buying-power" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
            </button>
          </div>

          {footerSheet === "charges" && (
            <div>
              {/* Statutory */}
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">Regulatory Fees</span>
              <p className="text-[12px] text-muted-foreground/40 mb-2">(Govt. & Exchange fees)</p>
              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between"><span className="text-[14px] text-foreground">SEC Fee</span><span className="text-[14px] text-foreground">0.01</span></div>
                <div className="flex justify-between"><span className="text-[14px] text-foreground">FINRA TAF</span><span className="text-[14px] text-foreground">0.01</span></div>
                <div className="flex justify-between"><span className="text-[14px] text-foreground">Exchange Fee</span><span className="text-[14px] text-foreground">0.00</span></div>
                <div className="flex justify-between"><span className="text-[14px] text-foreground">Withholding Tax</span><span className="text-[14px] text-foreground">0.00</span></div>
              </div>

              <Separator className="mb-4" />

              {/* Broker */}
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50 mb-2 block">Aspora Charges</span>
              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between"><span className="text-[14px] text-foreground">Brokerage</span><span className="text-[14px] text-foreground">0.00</span></div>
              </div>

              <Separator className="mb-4" />

              <div className="flex justify-between">
                <span className="text-[15px] font-semibold text-foreground">Total Charges</span>
                <span className="text-[15px] font-semibold text-foreground">{fee.toFixed(2)}</span>
              </div>
            </div>
          )}

          {footerSheet === "buying-power" && (
            <div>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between">
                  <span className="text-[14px] text-muted-foreground">Required Amount</span>
                  <span className="text-[14px] font-semibold text-foreground">{(dollarAmount + fee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-muted-foreground">Available Balance</span>
                  <span className="text-[14px] font-semibold text-foreground">{available.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-[14px] text-muted-foreground">Remaining After Trade</span>
                  <span className={cn("text-[14px] font-semibold", (available - dollarAmount - fee) >= 0 ? "text-gain" : "text-loss")}>
                    {(available - dollarAmount - fee).toFixed(2)}
                  </span>
                </div>
              </div>

              <button className="w-full rounded-lg border border-border py-3 text-[15px] font-semibold text-foreground active:bg-muted transition-colors">
                Add Funds
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── Order Type Sheet ────────────────────────────────── */}
      <Sheet open={orderTypeSheet} onOpenChange={setOrderTypeSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-10" hideClose>
          <div className="flex items-center gap-3 pt-1 pb-4">
            <button
              onClick={() => setOrderTypeSheet(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h3 className="text-[17px] font-semibold text-foreground">Select Order Type</h3>
          </div>
          <div className="space-y-1">
            {orderTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.key}
                  onClick={() => { setOrderType(type.key); setOrderTypeSheet(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors text-left",
                    orderType === type.key ? "bg-muted" : "active:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    orderType === type.key ? "bg-foreground/10" : "bg-muted"
                  )}>
                    <Icon size={18} strokeWidth={1.8} className="text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-[15px]", orderType === type.key ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                      {type.label}
                    </p>
                    <p className="text-[13px] text-muted-foreground leading-snug mt-0.5">{type.description}</p>
                  </div>
                  {orderType === type.key && (
                    <Check size={18} strokeWidth={2.5} className="text-foreground shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
