"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Trash2,
  Check,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
/*  Alert Row                                                          */
/* ------------------------------------------------------------------ */

function AlertRow({
  alert,
  symbol,
  onDelete,
}: {
  alert: PriceAlert;
  symbol: string;
  onDelete: () => void;
}) {
  const label =
    alert.mode === "price"
      ? `When ${symbol} reaches ${formatPrice(alert.value)}`
      : `When ${symbol} moves by ${alert.value > 0 ? "+" : ""}${alert.value}%`;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-muted-foreground/50">Set on {alert.setDate}</p>
        <p className="text-[15px] font-semibold text-foreground mt-0.5 leading-snug">{label}</p>
      </div>

      <Button
        variant="ghost"
        size="icon-xs"
        className="rounded-full text-muted-foreground active:bg-destructive/10 active:text-destructive"
        onClick={onDelete}
      >
        <Trash2 size={16} strokeWidth={1.8} />
      </Button>
    </div>
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  function handleAddPriceAlert() {
    if (!inputValue || Number(inputValue) <= 0) return;
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      mode: "price",
      value: Number(inputValue),
      setDate: "Mar 11",
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setInputValue("");
    setSheetOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }

  function deleteAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  const activeChips = new Set(
    alerts.filter((a) => a.mode === "percent").map((a) => a.value)
  );

  const canAdd = inputValue !== "" && Number(inputValue) > 0;

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </Button>
        <div className="flex-1" />
      </header>

      {/* Stock Hero */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-1">
        <TickerLogo ticker={ticker} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="text-[17px] font-bold text-foreground truncate">{ticker.name}</p>
            <span className="text-[13px] text-muted-foreground font-medium">{symbol}</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[17px] font-bold tabular-nums text-foreground">
              {formatPrice(ticker.price)}
            </span>
            <span
              className={cn(
                "text-[13px] font-medium tabular-nums",
                gain ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]"
              )}
            >
              {formatChange(ticker.change)} ({formatPercent(ticker.changePercent)})
            </span>
          </div>
        </div>
      </div>

      <main className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-4">
        {/* Quick % Alerts Card */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-[17px]">Quick Alert</CardTitle>
            <CardDescription>
              Notify when {symbol} moves by this % in a day
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-0">
            {/* Badge chips — intensity scales with % magnitude */}
            <div className="flex gap-1">
              {percentChips.map((v) => {
                const isActive = activeChips.has(v);
                const isPositive = v > 0;
                const absV = Math.abs(v);
                const intensity = absV <= 2.5 ? "low" : absV <= 5 ? "mid" : "high";

                const activeStyles = isPositive
                  ? {
                      low:  "bg-emerald-500/5 text-foreground border-emerald-500/10",
                      mid:  "bg-emerald-500/10 text-foreground border-emerald-500/15",
                      high: "bg-emerald-500/15 text-foreground border-emerald-500/20",
                    }[intensity]
                  : {
                      low:  "bg-red-500/5 text-foreground border-red-500/10",
                      mid:  "bg-red-500/10 text-foreground border-red-500/15",
                      high: "bg-red-500/15 text-foreground border-red-500/20",
                    }[intensity];

                return (
                  <Badge
                    key={v}
                    variant="outline"
                    onClick={() => togglePercentAlert(v)}
                    className={cn(
                      "flex-1 justify-center rounded-full px-1.5 py-2 cursor-pointer text-[12px] font-semibold tabular-nums transition-all border",
                      isActive
                        ? activeStyles
                        : "bg-muted/30 text-foreground/60 border-transparent"
                    )}
                  >
                    {v > 0 ? "+" : ""}{v}%
                  </Badge>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-3">
            <Button
              onClick={() => setSheetOpen(true)}
              className="w-full rounded-xl py-3 text-[15px] font-bold active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={2} className="mr-1.5" />
              Add Price Alert
            </Button>
          </CardFooter>
        </Card>

        {/* Active Alerts Card */}
        <Card className="mt-4">
          <CardHeader className="p-4 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[17px]">Active Alerts</CardTitle>
            {alerts.length > 0 && (
              <Badge variant="outline" className="rounded-full text-[13px] tabular-nums px-2.5">
                {alerts.length}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-4">
            {alerts.length > 0 ? (
              alerts.map((alert, i) => (
                <div key={alert.id}>
                  <AlertRow
                    alert={alert}
                    symbol={symbol}
                    onDelete={() => deleteAlert(alert.id)}
                  />
                  {i < alerts.length - 1 && (
                    <Separator className="bg-border/15" />
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-6 text-center">
                <Bell size={22} strokeWidth={1.5} className="text-muted-foreground/25 mb-1" />
                <p className="text-[15px] text-muted-foreground/35">
                  No alerts yet for {symbol}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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

      {/* Price Alert Bottom Sheet — shadcn Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-w-[430px] rounded-t-3xl border-t-0 px-5 pb-8"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="text-[20px] font-bold">Add Price Alert</SheetTitle>
            <SheetDescription className="text-[14px] text-muted-foreground/60">
              Get notified when {symbol} reaches this price
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-col items-center">
            <Input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={formatPrice(ticker.price)}
              autoFocus
              className="h-auto border-0 bg-transparent text-center text-[40px] font-bold tabular-nums text-foreground shadow-none ring-0 focus-visible:ring-0 placeholder:text-muted-foreground/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Separator className="w-48 my-2 bg-border/50" />
            <p className="text-center text-[13px] text-muted-foreground/40">
              Current: {formatPrice(ticker.price)}
            </p>
          </div>

          <SheetFooter className="mt-6">
            <Button
              onClick={handleAddPriceAlert}
              disabled={!canAdd}
              className="w-full rounded-2xl py-4 text-[16px] font-bold active:scale-[0.98]"
            >
              Add Alert
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <HomeIndicator />
    </div>
  );
}
