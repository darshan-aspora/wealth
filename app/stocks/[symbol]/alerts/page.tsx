"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import {
  ALL_TICKERS,
  TickerLogo,
  formatPrice,
  formatPercent,
  formatChange,
  isGain,
  type TickerItem,
} from "@/components/ticker";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PriceAlert {
  id: string;
  mode: "price" | "percent";
  value: number;
  setDate: string;
}

/* ------------------------------------------------------------------ */
/*  Mock alerts                                                        */
/* ------------------------------------------------------------------ */

function getInitialAlerts(symbol: string): PriceAlert[] {
  const base: Record<string, PriceAlert[]> = {
    AAPL: [
      { id: "a1", mode: "percent", value: -2.5, setDate: "Mar 08" },
      { id: "a2", mode: "percent", value: -10, setDate: "Mar 05" },
      { id: "a3", mode: "percent", value: -5, setDate: "Mar 05" },
      { id: "a4", mode: "price", value: 195, setDate: "Mar 01" },
    ],
    NVDA: [
      { id: "a5", mode: "percent", value: 10, setDate: "Mar 10" },
      { id: "a6", mode: "percent", value: 5, setDate: "Mar 10" },
      { id: "a7", mode: "percent", value: -2.5, setDate: "Mar 08" },
      { id: "a8", mode: "percent", value: -10, setDate: "Mar 06" },
      { id: "a9", mode: "percent", value: -5, setDate: "Mar 06" },
    ],
    TSLA: [
      { id: "a10", mode: "price", value: 165, setDate: "Mar 09" },
      { id: "a11", mode: "percent", value: -5, setDate: "Mar 07" },
    ],
  };
  return base[symbol] || [];
}

/* ------------------------------------------------------------------ */
/*  Alert Row — delete only, no toggle                                 */
/* ------------------------------------------------------------------ */

function AlertRow({
  alert,
  symbol,
  onDelete,
  index,
}: {
  alert: PriceAlert;
  symbol: string;
  onDelete: () => void;
  index: number;
}) {
  const label =
    alert.mode === "price"
      ? `When ${symbol} reaches ${formatPrice(alert.value)}`
      : `When ${symbol} moves by ${alert.value > 0 ? "+" : ""}${alert.value}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden" }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="flex items-center gap-3 px-5 py-3"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-muted-foreground/50">Set on {alert.setDate}</p>
        <p className="text-[15px] font-semibold text-foreground mt-0.5 leading-snug">{label}</p>
      </div>

      <button
        onClick={onDelete}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground/40 transition-colors active:bg-red-500/10 active:text-red-400"
      >
        <Trash2 size={16} strokeWidth={1.8} />
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom Alert Bottom Sheet                                          */
/* ------------------------------------------------------------------ */

function PriceAlertSheet({
  symbol,
  currentPrice,
  onClose,
  onAdd,
}: {
  symbol: string;
  currentPrice: number;
  onClose: () => void;
  onAdd: (alert: PriceAlert) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const canAdd = inputValue !== "" && Number(inputValue) > 0;

  function handleAdd() {
    if (!canAdd) return;
    onAdd({
      id: `alert-${Date.now()}`,
      mode: "price",
      value: Number(inputValue),
      setDate: "Mar 11",
    });
    onClose();
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50"
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        style={{ bottom: 0, left: "50%", translateX: "-50%" }}
        className="fixed z-50 w-full max-w-[430px] rounded-t-3xl bg-card"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 pt-2">
          <h2 className="text-[20px] font-bold text-foreground">Add Price Alert</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/40 text-muted-foreground active:bg-muted/60"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Input */}
        <div className="px-5 pb-5">
          <p className="text-[14px] text-muted-foreground/60 mb-5">
            Get notified when {symbol} reaches this price
          </p>
          <div
            className="flex items-center justify-center cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={formatPrice(currentPrice)}
              autoFocus
              className="w-full bg-transparent text-center font-mono text-[40px] font-bold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <div className="mx-auto w-48 h-px bg-border/50 mt-1 mb-2" />
          <p className="text-center text-[13px] text-muted-foreground/40">
            Current: {formatPrice(currentPrice)}
          </p>
        </div>

        {/* Add Button */}
        <div className="px-5 pb-8">
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={cn(
              "flex w-full items-center justify-center rounded-2xl py-4 text-[16px] font-bold transition-all",
              canAdd
                ? "bg-foreground text-background active:scale-[0.98]"
                : "bg-muted/20 text-muted-foreground/25 cursor-not-allowed"
            )}
          >
            Add Alert
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function SetAlertPage() {
  const router = useRouter();
  const params = useParams();
  const symbol = (params.symbol as string)?.toUpperCase() || "AAPL";

  const ticker: TickerItem = ALL_TICKERS.find((t) => t.symbol === symbol) || {
    symbol,
    name: symbol,
    price: 100,
    change: 0,
    changePercent: 0,
    category: "watchlist",
    type: "Equity",
    logo: symbol.slice(0, 2),
    logoColor: "bg-neutral-600",
    exchange: "NASDAQ",
  };

  const gain = isGain(ticker);
  const percentChips = [-10, -5, -2.5, +2.5, +5, +10];

  const [alerts, setAlerts] = useState<PriceAlert[]>(() => getInitialAlerts(symbol));
  const [showCustomSheet, setShowCustomSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  function togglePercentAlert(value: number) {
    const existing = alerts.find((a) => a.mode === "percent" && a.value === value);
    if (existing) {
      setAlerts((prev) => prev.filter((a) => a.id !== existing.id));
    } else {
      const newAlert: PriceAlert = {
        id: `alert-${Date.now()}`,
        mode: "percent",
        value,
        setDate: "Mar 11",
      };
      setAlerts((prev) => [newAlert, ...prev]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  }

  function addAlert(alert: PriceAlert) {
    setAlerts((prev) => [alert, ...prev]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }

  function deleteAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  const activeChips = new Set(
    alerts.filter((a) => a.mode === "percent").map((a) => a.value)
  );

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div className="flex-1" />
        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          <Bell size={20} strokeWidth={1.8} />
        </button>
      </header>

      {/* Stock Hero — logo, full name, price, delta */}
      <div className="flex items-center gap-3.5 px-5 pb-6 pt-1">
        <TickerLogo ticker={ticker} />
        <div>
          <p className="text-[18px] font-bold text-foreground">{ticker.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[16px] font-semibold tabular-nums text-foreground/80">
              {formatPrice(ticker.price)}
            </span>
            <span
              className={cn(
                "font-mono text-[14px] font-semibold tabular-nums",
                gain ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]"
              )}
            >
              {formatChange(ticker.change)} ({formatPercent(ticker.changePercent)})
            </span>
          </div>
        </div>
      </div>

      <main className="no-scrollbar flex-1 overflow-y-auto">
        {/* ── Quick % Alerts ── */}
        <div className="px-5 mb-5">
          <p className="text-[17px] font-bold text-foreground mb-1">
            Quick Alert
          </p>
          <p className="text-[13px] text-muted-foreground/50 mb-3">
            Notify when {symbol} moves by this % in a day
          </p>

          {/* Pills row */}
          <div className="flex gap-1.5 mb-2.5">
            {percentChips.map((v) => {
              const isActive = activeChips.has(v);
              const isPositive = v > 0;
              return (
                <button
                  key={v}
                  onClick={() => togglePercentAlert(v)}
                  className={cn(
                    "flex-1 rounded-full py-2 text-center text-[13px] font-semibold font-mono tabular-nums transition-all relative",
                    isActive
                      ? isPositive
                        ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                        : "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                      : "bg-muted/30 text-foreground/60"
                  )}
                >
                  {v > 0 ? "+" : ""}{v}%
                </button>
              );
            })}
          </div>

          {/* Gradient spectrum bar */}
          <div
            className="h-1.5 rounded-full"
            style={{
              background: "linear-gradient(to right, #ef4444, #f87171, #fca5a5, #d1d5db, #6ee7b7, #34d399, #10b981)",
            }}
          />

          {/* Add Price Alert button */}
          <button
            onClick={() => setShowCustomSheet(true)}
            className="flex w-full items-center justify-center gap-2 mt-3 rounded-xl border border-border/40 py-3 text-[15px] font-semibold text-muted-foreground transition-colors active:bg-muted/30"
          >
            Add Price Alert
          </button>
        </div>

        {/* ── Active Alerts ── */}
        <div className="px-5 pb-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-foreground">Active Alerts</h2>
            {alerts.length > 0 && (
              <span className="text-[13px] text-muted-foreground/40 font-mono tabular-nums">
                {alerts.length}
              </span>
            )}
          </div>
        </div>

        {alerts.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {alerts.map((alert, i) => (
              <div key={alert.id}>
                <AlertRow
                  alert={alert}
                  symbol={symbol}
                  onDelete={() => deleteAlert(alert.id)}
                  index={i}
                />
                {i < alerts.length - 1 && (
                  <div className="mx-5 border-t border-border/15" />
                )}
              </div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-8 py-8 text-center">
            <Bell size={22} strokeWidth={1.5} className="text-muted-foreground/25 mb-1" />
            <p className="text-[15px] text-muted-foreground/35">
              No alerts yet for {symbol}
            </p>
          </div>
        )}

        <div className="h-8" />
      </main>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 shadow-lg"
          >
            <Check size={16} strokeWidth={2.5} className="text-white" />
            <span className="text-[14px] font-semibold text-white">Alert added</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Alert Bottom Sheet */}
      <AnimatePresence>
        {showCustomSheet && (
          <PriceAlertSheet
            symbol={symbol}
            currentPrice={ticker.price}
            onClose={() => setShowCustomSheet(false)}
            onAdd={addAlert}
          />
        )}
      </AnimatePresence>

      <HomeIndicator />
    </div>
  );
}
