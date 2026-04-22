"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { X, ChevronsUpDown, Info, ChevronsRight, Check, ChevronDown, Delete, Keyboard, TrendingDown, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";


// ─── Types ──────────────────────────────────────────────────────────
type OrderType = "market" | "limit";
type OrderSide = "buy" | "sell";


const stock = { name: "Tesla Inc", symbol: "TSLA", price: 411.82, changePercent: 0.03 };
const available = 500.0;
const fee = 1.0;

function formatCompact(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `$${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}K`;
  }
  return `$${n.toFixed(0)}`;
}

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

  // Crossfade: chevron fades out, check fades in around the 60% mark
  const threshold = maxDrag * 0.6;
  const chevronOpacity = useTransform(dragX, [threshold - 20, threshold + 20], [1, 0]);
  const checkOpacity = useTransform(dragX, [threshold - 20, threshold + 20], [0, 1]);
  const checkScale = useTransform(dragX, [threshold - 20, threshold + 20], [0.5, 1]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x > maxDrag * 0.6) {
        animate(dragX, maxDrag, { type: "spring", stiffness: 400, damping: 30 });
        setCompleted(true);
        setTimeout(() => onComplete(), 400);
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

      <motion.div
        drag={completed ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
        className={cn(
          "absolute left-1 top-1 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-background",
          !completed && "cursor-grab active:cursor-grabbing"
        )}
        whileTap={completed ? undefined : { scale: 0.95 }}
      >
        {/* Chevron — fades out at 60% */}
        <motion.div className="absolute" style={{ opacity: chevronOpacity }}>
          <ChevronsRight size={22} strokeWidth={2} className="text-foreground" />
        </motion.div>
        {/* Check — fades in at 60% */}
        <motion.div className="absolute" style={{ opacity: checkOpacity, scale: checkScale }}>
          <Check size={22} strokeWidth={2.5} className="text-foreground" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Field IDs ──────────────────────────────────────────────────────
type FieldId = "amount" | "limitPrice" | "triggerPrice" | "gtcLimitPrice" | "slTriggerPrice" | null;

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
  hideTabs,
}: {
  onKey: (key: string) => void;
  onDelete: () => void;
  onDismiss: () => void;
  hideTabs?: boolean;
}) {
  const [keypadTab, setKeypadTab] = useState<"keyboard" | "depth">("keyboard");
  const showDepth = !hideTabs && keypadTab === "depth";

  return (
    <div className="bg-muted/50">
      {!hideTabs && (
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
      )}

      <div className="h-[220px]">
        {showDepth ? (
          <div className="py-2 overflow-y-auto h-full">
            <MarketDepthPanel />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

// ─── Stop-Loss educative bottom sheet (carousel) ────────────────────
interface HelpSlide {
  title: string;
  body: string;
  visual: React.ReactNode;
}

function StopLossHelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const slides: HelpSlide[] = [
    {
      title: "Sell when it drops to your limit",
      body: "A stop-loss auto-sells your position the moment price hits your trigger — no watching, no second-guessing.",
      visual: (
        <div className="flex h-64 w-full items-center justify-center gap-5 bg-muted/30 p-6">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-2xl border border-border/60 bg-background px-5 py-3 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Market</div>
              <div className="text-[22px] font-bold tabular-nums text-foreground">$400</div>
            </div>
            <ShieldCheck size={18} strokeWidth={2.2} className="text-muted-foreground/50" />
          </div>
          <TrendingDown size={32} strokeWidth={2.5} className="text-loss" />
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-2xl border-2 border-loss bg-loss/10 px-5 py-3 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-loss">Stop −2%</div>
              <div className="text-[22px] font-bold tabular-nums text-loss">$392</div>
            </div>
            <span className="text-[11px] font-semibold text-loss">Sell triggers</span>
          </div>
        </div>
      ),
    },
    {
      title: "How tight, how loose?",
      body: "Tight stops cap losses faster but trigger on normal swings. Loose stops let winners breathe but cost more when wrong.",
      visual: (
        <div className="flex h-64 w-full items-end justify-center gap-10 bg-muted/30 p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-36 w-10 flex-col justify-end rounded-full bg-muted">
              <div className="h-1/6 rounded-full bg-loss" />
            </div>
            <div className="text-center">
              <div className="text-[13px] font-semibold text-foreground">Tight</div>
              <div className="text-[11px] text-muted-foreground">−2%</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-36 w-10 flex-col justify-end rounded-full bg-muted">
              <div className="h-3/5 rounded-full bg-loss" />
            </div>
            <div className="text-center">
              <div className="text-[13px] font-semibold text-foreground">Loose</div>
              <div className="text-[11px] text-muted-foreground">−10%</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Fills at market, not at trigger",
      body: "Once triggered, a stop becomes a market sell. In fast or gapping moves, the fill can land below your trigger price.",
      visual: (
        <div className="flex h-64 w-full flex-col items-center justify-center gap-3 bg-muted/30 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/15">
            <AlertTriangle size={32} strokeWidth={2.5} className="text-yellow-600" />
          </div>
          <div className="text-center">
            <div className="text-[13px] font-semibold text-foreground">Gap risk</div>
            <div className="mt-1 text-[11px] text-muted-foreground">Overnight news can jump past your stop.</div>
          </div>
        </div>
      ),
    },
  ];

  const isLast = step === slides.length - 1;
  const current = slides[step];

  useEffect(() => {
    if (!open || isLast) return;
    const timer = setTimeout(() => {
      setDirection(1);
      setStep((s) => s + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [open, step, isLast]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sl-help-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/60"
            onClick={onClose}
          />
          <motion.div
            key="sl-help-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="fixed inset-x-0 bottom-0 z-[90] mx-auto w-full max-w-[430px] overflow-hidden rounded-t-3xl bg-background pb-6 shadow-xl"
          >
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                >
                  {current.visual}
                  <div className="px-5">
                    <h2 className="mt-5 text-center text-[22px] font-bold tracking-tight text-foreground">
                      {current.title}
                    </h2>
                    <p className="mt-2 text-center text-[15px] leading-snug text-muted-foreground">
                      {current.body}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-5 flex justify-center gap-1.5">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === step ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/25",
                  )}
                />
              ))}
            </div>

            <div className="mt-5 px-5">
              <button
                onClick={onClose}
                className={cn(
                  "h-12 w-full rounded-full text-[15px] font-semibold transition-transform active:scale-[0.98]",
                  isLast
                    ? "bg-foreground text-background"
                    : "text-muted-foreground active:bg-muted/40",
                )}
              >
                {isLast ? "Done" : "Skip"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function OrderFlowV17() {
  const router = useRouter();
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [amount, setAmount] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [triggerPrice, setTriggerPrice] = useState("411.30");
  const [stopLoss, setStopLoss] = useState(false);
  const [slSheetOpen, setSlSheetOpen] = useState(false);
  const [slTriggerPrice, setSlTriggerPrice] = useState("");
  const [amountMode, setAmountMode] = useState<"dollars" | "shares">("dollars");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [triggerEnabled, setTriggerEnabled] = useState(false);
  const [limitSheetOpen, setLimitSheetOpen] = useState(false);
  const [gtcLimitPrice, setGtcLimitPrice] = useState("411.30");
  const [gtcValidity, setGtcValidity] = useState("Day");
  const [validitySheetOpen, setValiditySheetOpen] = useState(false);
  const [infoSheet, setInfoSheet] = useState<"sl" | null>(null);
  const [footerSheet, setFooterSheet] = useState<"charges" | "buying-power" | null>(null);
  const [activeField, setActiveField] = useState<FieldId>(null);
  const [scrolled, setScrolled] = useState(false);
  const [livePrice, setLivePrice] = useState(stock.price);
  const [liveChange, setLiveChange] = useState(stock.changePercent);
  const isBuy = side === "buy";

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const delta = (Math.random() - 0.48) * 0.3;
        return Math.round((prev + delta) * 100) / 100;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLiveChange(Math.round(((livePrice - stock.price) / stock.price) * 10000) / 100 + stock.changePercent);
  }, [livePrice]);

  useEffect(() => {
    if (limitSheetOpen) setActiveField("limitPrice");
    else setActiveField((prev) => (prev === "limitPrice" ? null : prev));
  }, [limitSheetOpen]);

  useEffect(() => {
    if (slSheetOpen) setActiveField("slTriggerPrice");
    else setActiveField((prev) => (prev === "slTriggerPrice" ? null : prev));
  }, [slSheetOpen]);

  const parsedAmount = parseFloat(amount) || 0;
  const dollarAmount = amountMode === "dollars" ? parsedAmount : parsedAmount * livePrice;
  const insufficientFunds = (dollarAmount + fee) > available;
  const hasAdvancedSettings = stopLoss || triggerEnabled;
  const estShares = dollarAmount / livePrice;

  const goToConfirmation = () => {
    const params = new URLSearchParams({
      side,
      type: triggerEnabled ? "gtc" : orderType,
      amount: dollarAmount.toFixed(2),
      symbol: stock.symbol,
      name: stock.name,
      shares: estShares.toFixed(4),
      price: triggerEnabled ? triggerPrice : orderType === "limit" ? limitPrice : livePrice.toFixed(2),
      total: (dollarAmount + fee).toFixed(2),
      fees: fee.toFixed(2),
    });
    router.push(`/order-flow/v17/confirmation?${params.toString()}`);
  };

  const getFieldValue = (id: FieldId) => {
    switch (id) {
      case "amount": return amount;
      case "limitPrice": return limitPrice;
      case "triggerPrice": return triggerPrice;
      case "gtcLimitPrice": return gtcLimitPrice;
      case "slTriggerPrice": return slTriggerPrice;
      default: return "";
    }
  };

  const setFieldValue = (id: FieldId, val: string) => {
    switch (id) {
      case "amount": setAmount(val); break;
      case "limitPrice": setLimitPrice(val); break;
      case "triggerPrice": setTriggerPrice(val); break;
      case "gtcLimitPrice": setGtcLimitPrice(val); break;
      case "slTriggerPrice": setSlTriggerPrice(val); break;
    }
  };

  const handleKey = (key: string) => {
    if (!activeField) return;
    const current = getFieldValue(activeField);
    if (key === "." && current.includes(".")) return;
    setFieldValue(activeField, current + key);
  };

  const handleDelete = () => {
    if (!activeField) return;
    const current = getFieldValue(activeField);
    setFieldValue(activeField, current.slice(0, -1));
  };

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* ─── Header + Tabs ───────────────────────────────────────── */}
      <div className={cn("relative z-10 bg-background transition-colors", scrolled && "border-b border-border")}>
        <header className="flex items-center justify-between pl-3 pr-4 py-3">
          <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors">
            <X size={20} strokeWidth={2} />
          </button>

          <div className="flex flex-col items-start flex-1 ml-3">
            <span className="text-[17px] font-semibold text-foreground leading-tight">
              {stock.name}
            </span>
            <span className="text-[14px] text-muted-foreground leading-tight tabular-nums">
              {livePrice.toFixed(2)}{" "}
              <span className={liveChange >= 0 ? "text-gain" : "text-loss"}>
                {liveChange >= 0 ? "+" : ""}{liveChange.toFixed(2)}%
              </span>
            </span>
          </div>

          <button
            onClick={() => setSide(isBuy ? "sell" : "buy")}
            className="flex items-center gap-1.5 active:opacity-80 transition-opacity"
          >
            <span className="text-[15px] font-semibold text-foreground">
              {isBuy ? "Buy" : "Sell"}
            </span>
            <ChevronsUpDown size={14} strokeWidth={1.8} className="text-foreground" />
          </button>
        </header>
      </div>

      {/* ─── Content ────────────────────────────────────────────── */}
      <main
        className="no-scrollbar flex-1 overflow-y-auto px-5 pt-4 pb-4"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}
        onClick={() => { if (activeField) setActiveField(null); }}
      >
        {/* Amount Section */}
        <div className="flex flex-col items-center py-4">
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
            className="mb-2 flex items-center gap-1.5 active:opacity-70 transition-opacity"
          >
            <span className="text-[15px] text-muted-foreground">
              {amountMode === "dollars" ? "Amount" : "Quantity"}
            </span>
            <ChevronsUpDown size={14} strokeWidth={1.8} className="text-muted-foreground" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setActiveField("amount"); }}
            className="flex items-start active:opacity-70"
          >
            {amountMode === "dollars" && (
              <span className="text-[42px] font-bold text-foreground mr-0.5 leading-none">$</span>
            )}
            <span className={cn("text-[42px] font-bold tabular-nums leading-none", activeField === "amount" ? "text-foreground" : "text-foreground")}>
              {amount || "0"}
            </span>
            {activeField === "amount" && <span className="w-[2px] h-[36px] bg-foreground ml-1 animate-pulse" />}
          </button>

          {parseFloat(amount) > 0 && (
            <span className="mt-3 text-[14px] tabular-nums text-muted-foreground">
              {amountMode === "dollars"
                ? `Est. ${(parseFloat(amount) / livePrice).toFixed(4)} shares`
                : `Est. $${(parseFloat(amount) * livePrice).toFixed(2)}`}
            </span>
          )}

        </div>

        {/* Order Type Card with Tabs */}
        <Card className="mt-3 overflow-hidden shadow-none">
          {/* Sliding Tabs — flush at top, edge to edge */}
          <div className="relative flex h-11 bg-muted p-1 rounded-b-xl">
            <motion.div
              className="absolute top-1 h-9 rounded-lg bg-background shadow-sm"
              animate={{
                left: orderType === "market" ? 4 : "calc(50%)",
                width: "calc(50% - 5px)",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
            {(["market", "limit"] as OrderType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setOrderType(type);
                  setActiveField(null);
                  if (type === "limit") setLimitSheetOpen(true);
                }}
                className={cn(
                  "relative z-10 flex-1 text-[14px] font-medium transition-colors",
                  orderType === type ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Fields — inside same card */}
          <div className="px-4 pb-4">
            <AnimatePresence mode="wait">
              {/* ── Market Fields ────────────────────────────────────── */}
              {orderType === "market" && (
                <motion.div
                  key="market-fields"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="pt-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] text-muted-foreground">{isBuy ? "Buy Price" : "Sell Price"}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderType("limit");
                        setLimitSheetOpen(true);
                      }}
                      className="text-[15px] tabular-nums text-muted-foreground/50 active:opacity-70 transition-opacity"
                    >
                      ${livePrice.toFixed(2)}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Limit Fields ─────────────────────────────────────── */}
              {orderType === "limit" && (
                <motion.div
                  key="limit-fields"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="pt-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[15px] text-muted-foreground">Limit Price</span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[13px] tabular-nums text-muted-foreground">Bid <span className="text-foreground font-medium">{(livePrice - 0.04).toFixed(2)}</span></span>
                        <span className="text-[13px] tabular-nums text-muted-foreground">Ask <span className="text-foreground font-medium">{(livePrice + 0.02).toFixed(2)}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <button onClick={(e) => { e.stopPropagation(); setLimitSheetOpen(true); }} className="flex items-baseline justify-end active:opacity-70">
                        <span className="text-[15px] text-muted-foreground/50 mr-0.5">$</span>
                        <span className="text-[18px] font-semibold text-foreground tabular-nums">
                          {limitPrice || "0"}
                        </span>
                      </button>
                      {parseFloat(limitPrice) > 0 && (
                        <span className="text-[13px] tabular-nums font-medium mt-0.5 text-muted-foreground">
                          {parseFloat(limitPrice) >= livePrice ? "+" : ""}
                          {(((parseFloat(limitPrice) - livePrice) / livePrice) * 100).toFixed(2)}% from market
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </Card>

        {/* Advanced */}
        <div className="mt-6 flex items-center justify-center">
          {showAdvanced && hasAdvancedSettings ? (
            <button
              onClick={() => {
                setStopLoss(false);
                setSlTriggerPrice("");
                setTriggerEnabled(false);
                setTriggerPrice("411.30");
                setGtcLimitPrice("411.30");
                setGtcValidity("Day");
                setShowAdvanced(false);
              }}
              className="flex items-center justify-center gap-1.5 active:opacity-70 transition-opacity"
            >
              <span className="text-[14px] font-medium text-muted-foreground">Advanced</span>
              <div className="rotate-180">
                <ChevronDown size={18} strokeWidth={2} className="text-muted-foreground" />
              </div>
            </button>
          ) : (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-center gap-1.5 w-full active:opacity-70 transition-opacity"
            >
              <span className="text-[14px] font-medium text-muted-foreground">Advanced</span>
              <motion.div
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={18} strokeWidth={2} className="text-muted-foreground" />
              </motion.div>
            </button>
          )}
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Card className="mt-5 p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const next = !stopLoss;
                        setStopLoss(next);
                        if (next) setSlSheetOpen(true);
                      }}
                      className="flex items-center gap-3 flex-1 active:opacity-70 transition-opacity"
                    >
                      <Checkbox className="h-5 w-5 !rounded-[4px] pointer-events-none"
                        checked={stopLoss}
                        tabIndex={-1}
                      />
                      <span className="text-[15px] font-semibold text-foreground flex-1 text-left">Stop-Loss</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setInfoSheet("sl"); }} className="p-1 active:opacity-70">
                      <Info size={16} strokeWidth={1.8} className="text-muted-foreground/50" />
                    </button>
                  </div>

                  {stopLoss && (
                    <button
                      onClick={() => setSlSheetOpen(true)}
                      className="mt-4 flex w-full items-center justify-between active:opacity-70 transition-opacity"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-[15px] text-muted-foreground">Trigger</span>
                        <span className="text-[13px] text-muted-foreground/50 mt-0.5 tabular-nums">
                          Est. Loss: ${(
                            parseFloat(slTriggerPrice) > 0
                              ? ((livePrice - parseFloat(slTriggerPrice)) / livePrice) * dollarAmount
                              : 0
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-baseline">
                          <span className="text-[15px] text-muted-foreground/50 mr-0.5">$</span>
                          <span className="text-[20px] font-semibold text-foreground tabular-nums">
                            {slTriggerPrice || "0"}
                          </span>
                        </div>
                        <span className="text-[13px] text-muted-foreground/50 mt-0.5 tabular-nums">
                          {parseFloat(slTriggerPrice) > 0
                            ? `${(((parseFloat(slTriggerPrice) - livePrice) / livePrice) * 100).toFixed(2)}% from market`
                            : "—"}
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Trigger section hidden — not in MVP 1
                  <Separator className="my-4 -mx-4 w-auto" />

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const next = !triggerEnabled;
                        setTriggerEnabled(next);
                        if (next) setActiveField("triggerPrice");
                        else if (activeField === "triggerPrice" || activeField === "gtcLimitPrice") setActiveField(null);
                      }}
                      className="flex items-center gap-3 flex-1 active:opacity-70 transition-opacity"
                    >
                      <Checkbox className="h-5 w-5 !rounded-[4px] pointer-events-none"
                        checked={triggerEnabled}
                        tabIndex={-1}
                      />
                      <span className="text-[15px] font-semibold text-foreground flex-1 text-left">Trigger</span>
                    </button>
                  </div>

                  {triggerEnabled && (
                    <div className="mt-4 space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-[15px] text-muted-foreground">Trigger Price</span>
                        <div className="flex flex-col items-end">
                          <button onClick={(e) => { e.stopPropagation(); setActiveField("triggerPrice"); }} className="flex items-baseline justify-end active:opacity-70">
                            <span className="text-[15px] text-muted-foreground/50 mr-0.5">$</span>
                            <span className="text-[18px] font-semibold text-foreground tabular-nums">
                              {triggerPrice || "0"}
                            </span>
                            {activeField === "triggerPrice" && <span className="w-[2px] h-[20px] bg-foreground ml-0.5 animate-pulse" />}
                          </button>
                          {parseFloat(triggerPrice) > 0 && (
                            <span className="text-[13px] tabular-nums font-medium mt-0.5 text-muted-foreground">
                              {parseFloat(triggerPrice) >= livePrice ? "+" : ""}
                              {(((parseFloat(triggerPrice) - livePrice) / livePrice) * 100).toFixed(2)}% from market
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[15px] text-muted-foreground">On Trigger</span>
                        <button
                          onClick={() => setGtcPriceMode(gtcPriceMode === "market" ? "limit" : "market")}
                          className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
                        >
                          <span className="text-[15px] font-semibold text-foreground">
                            {gtcPriceMode === "market" ? "Market Price" : "Limit Price"}
                          </span>
                          <ChevronsUpDown size={14} strokeWidth={1.8} className="text-foreground" />
                        </button>
                      </div>

                      <AnimatePresence>
                        {gtcPriceMode === "limit" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[15px] text-muted-foreground">Limit Price</span>
                              <button onClick={(e) => { e.stopPropagation(); setActiveField("gtcLimitPrice"); }} className="flex items-baseline justify-end active:opacity-70">
                                <span className="text-[15px] text-muted-foreground/50 mr-0.5">$</span>
                                <span className="text-[18px] font-semibold text-foreground tabular-nums">
                                  {gtcLimitPrice || "0"}
                                </span>
                                {activeField === "gtcLimitPrice" && <span className="w-[2px] h-[20px] bg-foreground ml-0.5 animate-pulse" />}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center justify-between">
                        <span className="text-[15px] text-muted-foreground">Validity</span>
                        <button
                          onClick={() => setValiditySheetOpen(true)}
                          className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
                        >
                          <span className="text-[15px] font-semibold text-foreground">{gtcValidity}</span>
                          <ChevronsUpDown size={14} strokeWidth={1.8} className="text-foreground" />
                        </button>
                      </div>
                    </div>
                  )}
                  */}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
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
                <span className="text-[13px] text-loss tabular-nums">
                  Insufficient buying power. You need <span className="font-semibold">{((dollarAmount + fee) - available).toFixed(2)}</span> more.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator />
        <div className="px-5 pt-4 pb-4">
          <div className="mb-4 flex w-full items-start justify-between">
            <button
              onClick={() => setFooterSheet("charges")}
              className="flex flex-col items-start active:opacity-70 transition-opacity"
            >
              <span className="text-[15px] font-semibold tabular-nums text-foreground leading-tight">
                Total ${(dollarAmount + fee).toFixed(2)}
              </span>
              <span className="text-[13px] tabular-nums text-muted-foreground underline underline-offset-2 decoration-dashed decoration-1 decoration-muted-foreground/30 leading-tight mt-0.5">
                incl. govt./taxes $0.10 + brokerage $0.50
              </span>
            </button>

            <button
              onClick={() => setFooterSheet("buying-power")}
              className="flex flex-col items-end active:opacity-70 transition-opacity"
            >
              <span className="text-[13px] text-muted-foreground leading-tight">
                Balance
              </span>
              <span className="text-[15px] font-semibold tabular-nums text-foreground underline underline-offset-2 decoration-dashed decoration-1 decoration-muted-foreground/30 leading-tight mt-0.5">
                {formatCompact(available)}
              </span>
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
            <SwipeCTA side={side} onComplete={() => goToConfirmation()} />
          )}
        </div>

        {/* Numeric Keyboard */}
        <AnimatePresence>
          {activeField && !limitSheetOpen && !slSheetOpen && (
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

      {/* ─── Limit Price Sheet ────────────────────────────────── */}
      <Sheet open={limitSheetOpen} onOpenChange={setLimitSheetOpen}>
        <SheetContent
          side="bottom"
          className="p-0 rounded-t-2xl mx-auto max-w-[430px] flex flex-col"
          hideClose
        >
          <SheetHeader className="flex flex-row items-center justify-between px-4 py-2 space-y-0">
            <button
              onClick={() => setLimitSheetOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
            >
              <X size={20} strokeWidth={2} />
            </button>
            <SheetTitle className="sr-only">Limit Price</SheetTitle>
            <div className="w-9" />
          </SheetHeader>

          {/* Big price display */}
          <div className="flex flex-col items-center pb-6">
            <span className="text-[15px] text-muted-foreground mb-2">Limit Price</span>
            <button
              onClick={() => setActiveField("limitPrice")}
              className="flex items-start active:opacity-70"
            >
              <span className={cn(
                "text-[42px] font-bold mr-0.5 leading-none",
                !limitPrice || parseFloat(limitPrice) === 0
                  ? "text-muted-foreground/40"
                  : "text-foreground"
              )}>
                $
              </span>
              <span className={cn(
                "text-[42px] font-bold tabular-nums leading-none",
                !limitPrice || parseFloat(limitPrice) === 0
                  ? "text-muted-foreground/40"
                  : "text-foreground"
              )}>
                {limitPrice && parseFloat(limitPrice) > 0 ? limitPrice : livePrice.toFixed(2)}
              </span>
              {activeField === "limitPrice" && (
                <span className="w-[2px] h-[36px] bg-foreground ml-1 animate-pulse" />
              )}
            </button>

            <span
              className={cn(
                "mt-3 text-[13px] tabular-nums font-medium",
                parseFloat(limitPrice) > 0 ? "text-muted-foreground" : "invisible"
              )}
              aria-hidden={!(parseFloat(limitPrice) > 0)}
            >
              {parseFloat(limitPrice) > 0
                ? `${parseFloat(limitPrice) >= livePrice ? "+" : ""}${(((parseFloat(limitPrice) - livePrice) / livePrice) * 100).toFixed(2)}% from market`
                : "+0.00% from market"}
            </span>

            <div className="mt-2 flex items-center gap-4 text-[13px] tabular-nums text-muted-foreground">
              <span>Bid <span className="text-foreground font-medium">{(livePrice - 0.04).toFixed(2)}</span></span>
              <span>Ask <span className="text-foreground font-medium">{(livePrice + 0.02).toFixed(2)}</span></span>
            </div>
          </div>

          {/* Preset pills */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-2 px-5">
              {(isBuy ? [-0.5, -0.75, -1, -1.25, -1.5] : [0.5, 0.75, 1, 1.25, 1.5]).map((pct) => (
                <button
                  key={pct}
                  onClick={() => setLimitPrice((livePrice * (1 + pct / 100)).toFixed(2))}
                  className="flex-shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium tabular-nums bg-muted text-foreground active:bg-muted/70"
                >
                  {pct > 0 ? "+" : ""}{pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="px-5 pt-3">
            <button
              onClick={() => setLimitSheetOpen(false)}
              disabled={!limitPrice || parseFloat(limitPrice) === 0}
              className={cn(
                "w-full h-[52px] rounded-full text-[16px] font-semibold transition-opacity",
                !limitPrice || parseFloat(limitPrice) === 0
                  ? "bg-muted text-muted-foreground"
                  : "bg-foreground text-background active:opacity-90"
              )}
            >
              Save
            </button>
          </div>

          {/* Keypad */}
          <NumericKeypad
            onKey={handleKey}
            onDelete={handleDelete}
            onDismiss={() => setLimitSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* ─── Stop-Loss Sheet ──────────────────────────────────── */}
      <Sheet
        open={slSheetOpen}
        onOpenChange={(open) => {
          setSlSheetOpen(open);
          if (!open && (!slTriggerPrice || parseFloat(slTriggerPrice) === 0)) {
            setStopLoss(false);
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="p-0 rounded-t-2xl mx-auto max-w-[430px] flex flex-col"
          hideClose
        >
          <SheetHeader className="flex flex-row items-center justify-between px-4 py-2 space-y-0">
            <button
              onClick={() => setSlSheetOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
            >
              <X size={20} strokeWidth={2} />
            </button>
            <SheetTitle className="sr-only">Stop-Loss</SheetTitle>
            <div className="w-9" />
          </SheetHeader>

          {/* Big price display */}
          <div className="flex flex-col items-center pb-6">
            <span className="text-[15px] text-muted-foreground mb-2">Stop-Loss Price</span>
            <button
              onClick={() => setActiveField("slTriggerPrice")}
              className="flex items-start active:opacity-70"
            >
              <span className={cn(
                "text-[42px] font-bold mr-0.5 leading-none",
                !slTriggerPrice || parseFloat(slTriggerPrice) === 0
                  ? "text-muted-foreground/40"
                  : "text-foreground"
              )}>
                $
              </span>
              <span className={cn(
                "text-[42px] font-bold tabular-nums leading-none",
                !slTriggerPrice || parseFloat(slTriggerPrice) === 0
                  ? "text-muted-foreground/40"
                  : "text-foreground"
              )}>
                {slTriggerPrice && parseFloat(slTriggerPrice) > 0 ? slTriggerPrice : livePrice.toFixed(2)}
              </span>
              {activeField === "slTriggerPrice" && (
                <span className="w-[2px] h-[36px] bg-foreground ml-1 animate-pulse" />
              )}
            </button>

            <span
              className={cn(
                "mt-3 text-[13px] tabular-nums font-medium",
                parseFloat(slTriggerPrice) > 0 ? "text-muted-foreground" : "invisible"
              )}
              aria-hidden={!(parseFloat(slTriggerPrice) > 0)}
            >
              {parseFloat(slTriggerPrice) > 0
                ? `${(((parseFloat(slTriggerPrice) - livePrice) / livePrice) * 100).toFixed(2)}% from market`
                : "+0.00% from market"}
            </span>

            <span
              className={cn(
                "mt-1 text-[13px] tabular-nums",
                parseFloat(slTriggerPrice) > 0 ? "text-muted-foreground" : "invisible"
              )}
              aria-hidden={!(parseFloat(slTriggerPrice) > 0)}
            >
              Est. Loss: ${(
                parseFloat(slTriggerPrice) > 0
                  ? ((livePrice - parseFloat(slTriggerPrice)) / livePrice) * dollarAmount
                  : 0
              ).toFixed(2)}
            </span>
          </div>

          {/* Preset pills — always negative (below market) */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-2 px-5">
              {[-15, -10, -7.5, -5, -2.5].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setSlTriggerPrice((livePrice * (1 + pct / 100)).toFixed(2))}
                  className="flex-shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium tabular-nums bg-muted text-foreground active:bg-muted/70"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="px-5 pt-3">
            <button
              onClick={() => setSlSheetOpen(false)}
              disabled={!slTriggerPrice || parseFloat(slTriggerPrice) === 0}
              className={cn(
                "w-full h-[52px] rounded-full text-[16px] font-semibold transition-opacity",
                !slTriggerPrice || parseFloat(slTriggerPrice) === 0
                  ? "bg-muted text-muted-foreground"
                  : "bg-foreground text-background active:opacity-90"
              )}
            >
              Save
            </button>
          </div>

          {/* Keypad */}
          <NumericKeypad
            onKey={handleKey}
            onDelete={handleDelete}
            onDismiss={() => setSlSheetOpen(false)}
            hideTabs
          />
        </SheetContent>
      </Sheet>

      {/* ─── Charges Sheet ────────────────────────────────────── */}
      <Sheet open={footerSheet === "charges"} onOpenChange={(open) => { if (!open) setFooterSheet(null); }}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-10 mx-auto max-w-[430px]" hideClose>

          <p className="text-center text-[17px] font-semibold text-foreground mb-6">Charges Breakdown</p>

          {/* Order Value */}
          <div className="flex justify-between items-center pb-5">
            <span className="text-[16px] font-semibold text-foreground">Order Value</span>
            <span className="text-[16px] font-semibold text-foreground tabular-nums">${dollarAmount.toFixed(2)}</span>
          </div>

          <div className="border-t border-dashed border-border mb-5" />

          {/* Govt. & Regulatory Fees */}
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3 block">Govt. & Regulatory Fees</span>
          <div className="space-y-3 mb-5">
            <div className="flex justify-between"><span className="text-[15px] text-foreground">VAT</span><span className="text-[15px] text-foreground tabular-nums">$0.05</span></div>
            <div className="flex justify-between"><span className="text-[15px] text-foreground">OPRA</span><span className="text-[15px] text-foreground tabular-nums">$0.03</span></div>
            <div className="flex justify-between"><span className="text-[15px] text-foreground">FINRA Fee</span><span className="text-[15px] text-foreground tabular-nums">$0.02</span></div>
          </div>

          <div className="border-t border-dashed border-border mb-5" />

          {/* Brokerage Fees */}
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3 block">Brokerage Fees</span>
          <div className="space-y-3 mb-5">
            <div className="flex justify-between"><span className="text-[15px] text-foreground">Aspora Fee</span><span className="text-[15px] text-foreground tabular-nums">$0.50</span></div>
          </div>

          <div className="border-t border-dashed border-border mb-5" />

          {/* Totals */}
          <div className="flex justify-between mb-6">
            <span className="text-[16px] font-bold text-foreground">Total Payable</span>
            <span className="text-[16px] font-bold text-foreground tabular-nums">${(dollarAmount + 1.05).toFixed(2)}</span>
          </div>

          <SwipeCTA side={side} onComplete={() => { setFooterSheet(null); goToConfirmation(); }} />
        </SheetContent>
      </Sheet>

      {/* ─── Buying Power Sheet ───────────────────────────────── */}
      <Sheet open={footerSheet === "buying-power"} onOpenChange={(open) => { if (!open) setFooterSheet(null); }}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-10 mx-auto max-w-[430px]">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-[17px]">Buying Power</SheetTitle>
          </SheetHeader>

          <div className="space-y-3 mb-5">
            <div className="flex justify-between">
              <span className="text-[14px] text-muted-foreground">Required Amount</span>
              <span className="text-[14px] font-semibold text-foreground tabular-nums">{(dollarAmount + fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[14px] text-muted-foreground">Available Balance</span>
                <button className="text-[13px] font-medium text-muted-foreground underline underline-offset-2 active:text-foreground transition-colors text-left mt-0.5">
                  Add Funds
                </button>
              </div>
              <span className="text-[14px] font-semibold text-foreground tabular-nums">{available.toFixed(2)}</span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-[14px] text-muted-foreground">Remaining After Trade</span>
              <span className={cn("text-[14px] font-semibold tabular-nums", (available - dollarAmount - fee) >= 0 ? "text-gain" : "text-loss")}>
                {(available - dollarAmount - fee).toFixed(2)}
              </span>
            </div>
          </div>

          {insufficientFunds && dollarAmount > 0 ? (
            <button className="w-full h-[58px] rounded-full bg-foreground text-background text-[16px] font-semibold active:opacity-90 transition-opacity">
              Add Funds
            </button>
          ) : (
            <SwipeCTA side={side} onComplete={() => { setFooterSheet(null); goToConfirmation(); }} />
          )}
        </SheetContent>
      </Sheet>

      {/* ─── Stop-Loss Help Sheet ──────────────────────────────── */}
      <StopLossHelpSheet
        open={infoSheet === "sl"}
        onClose={() => setInfoSheet(null)}
      />

      {/* ─── Validity Sheet ───────────────────────────────────── */}
      <Sheet open={validitySheetOpen} onOpenChange={setValiditySheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-10 mx-auto max-w-[430px]">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-[17px]">Validity</SheetTitle>
          </SheetHeader>

          <div className="space-y-1">
            {["Day", "Week", "15 Days", "One Month"].map((option) => (
              <button
                key={option}
                onClick={() => {
                  setGtcValidity(option);
                  setValiditySheetOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-3 text-[15px] transition-colors",
                  gtcValidity === option
                    ? "bg-muted font-semibold text-foreground"
                    : "text-foreground active:bg-muted/50"
                )}
              >
                {option}
                {gtcValidity === option && (
                  <Check size={18} strokeWidth={2.5} className="text-foreground" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
