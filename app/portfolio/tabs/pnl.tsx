"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { OrderCard, addOrders, type CompletedOrder } from "@/app/portfolio/components/shared-order";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RangePreset = "1M" | "3M" | "Current FY" | "Custom";

interface DateVal { year: number; month: number; day: number }

interface PnlOrder {
  orderId: string;
  symbol: string;
  companyName: string;
  side: "B" | "S";
  qty: number;
  lots?: number;
  expiry?: string;
  optionType?: "CALL" | "PUT";
  tag?: "ETF";
  buyPrice: number;
  sellPrice: number;
  avgExecutedPrice: number;
  pnl: number;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

interface RangeData {
  orders: PnlOrder[];
  charges: { total: number; brokerage: number; regulatory: number; secFee: number; finraFee: number; exchangeFee: number; opraFee: number };
}

const RANGE_DATA: Record<RangePreset, RangeData> = {
  "1M": {
    orders: [
      { orderId: "PNL1M001", symbol: "TSLA", companyName: "Tesla Inc",    side: "S", qty: 10, buyPrice: 244, sellPrice: 222, avgExecutedPrice: 222, pnl: -220 },
      { orderId: "PNL1M002", symbol: "SPY",  companyName: "SPDR S&P 500", side: "B", qty: 20, tag: "ETF", buyPrice: 100, sellPrice: 120, avgExecutedPrice: 120, pnl: 400 },
    ],
    charges: { total: 10, brokerage: 7, regulatory: 3, secFee: 0.80, finraFee: 0.50, exchangeFee: 1.20, opraFee: 0.50 },
  },
  "3M": {
    orders: [
      { orderId: "PNL3M001", symbol: "AAPL", companyName: "Apple Inc",    side: "S", qty: 15, buyPrice: 178, sellPrice: 195, avgExecutedPrice: 195, pnl: 255  },
      { orderId: "PNL3M002", symbol: "NVDA", companyName: "NVIDIA Corp",  side: "B", qty: 5,  buyPrice: 820, sellPrice: 870, avgExecutedPrice: 870, pnl: 250  },
      { orderId: "PNL3M003", symbol: "TSLA", companyName: "Tesla Inc",    side: "S", qty: 10, buyPrice: 244, sellPrice: 222, avgExecutedPrice: 222, pnl: -220 },
      { orderId: "PNL3M004", symbol: "SPY",  companyName: "SPDR S&P 500", side: "B", qty: 20, tag: "ETF", buyPrice: 100, sellPrice: 120, avgExecutedPrice: 120, pnl: 400 },
    ],
    charges: { total: 28, brokerage: 20, regulatory: 8, secFee: 2.20, finraFee: 1.80, exchangeFee: 2.80, opraFee: 1.20 },
  },
  "Current FY": {
    orders: [
      { orderId: "PNLFY001", symbol: "AAPL", companyName: "Apple Inc",      side: "S", qty: 15, buyPrice: 178, sellPrice: 195, avgExecutedPrice: 195, pnl: 255  },
      { orderId: "PNLFY002", symbol: "NVDA", companyName: "NVIDIA Corp",    side: "B", qty: 5,  buyPrice: 820, sellPrice: 870, avgExecutedPrice: 870, pnl: 250  },
      { orderId: "PNLFY003", symbol: "TSLA", companyName: "Tesla Inc",      side: "S", qty: 10, buyPrice: 244, sellPrice: 222, avgExecutedPrice: 222, pnl: -220 },
      { orderId: "PNLFY004", symbol: "SPY",  companyName: "SPDR S&P 500",   side: "B", qty: 20, tag: "ETF",  buyPrice: 100, sellPrice: 120, avgExecutedPrice: 120, pnl: 400 },
      { orderId: "PNLFY005", symbol: "QQQ",  companyName: "Invesco QQQ",    side: "S", qty: 8,  tag: "ETF",  buyPrice: 380, sellPrice: 412, avgExecutedPrice: 412, pnl: 256 },
      { orderId: "PNLFY006", symbol: "META", companyName: "Meta Platforms", side: "S", qty: 3,  expiry: "350 APR 12", optionType: "CALL", lots: 3, buyPrice: 310, sellPrice: 290, avgExecutedPrice: 290, pnl: -60 },
      { orderId: "PNLFY007", symbol: "AMD",  companyName: "AMD Inc",        side: "B", qty: 12, buyPrice: 145, sellPrice: 162, avgExecutedPrice: 162, pnl: 204 },
    ],
    charges: { total: 62, brokerage: 44, regulatory: 18, secFee: 5.10, finraFee: 3.90, exchangeFee: 6.20, opraFee: 2.80 },
  },
  "Custom": {
    orders: [
      { orderId: "PNLCU001", symbol: "TSLA", companyName: "Tesla Inc",    side: "S", qty: 10, buyPrice: 244, sellPrice: 222, avgExecutedPrice: 222, pnl: -220 },
      { orderId: "PNLCU002", symbol: "SPY",  companyName: "SPDR S&P 500", side: "B", qty: 20, tag: "ETF", buyPrice: 100, sellPrice: 120, avgExecutedPrice: 120, pnl: 400 },
    ],
    charges: { total: 10, brokerage: 7, regulatory: 3, secFee: 0.80, finraFee: 0.50, exchangeFee: 1.20, opraFee: 0.50 },
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfWeek(year: number, month: number) {
  // 0=Sun…6=Sat → convert to Mon-first (0=Mon…6=Sun)
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

function fmtDate(d: DateVal) {
  return `${MONTH_NAMES[d.month].slice(0, 3)} ${d.day}, ${d.year}`;
}

function dateToNum(d: DateVal) { return d.year * 10000 + d.month * 100 + d.day; }

function presetRange(preset: RangePreset): { from: DateVal; to: DateVal } {
  const today = new Date();
  const to: DateVal = { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  if (preset === "1M") {
    const f = new Date(today); f.setMonth(f.getMonth() - 1);
    return { from: { year: f.getFullYear(), month: f.getMonth(), day: f.getDate() }, to };
  }
  if (preset === "3M") {
    const f = new Date(today); f.setMonth(f.getMonth() - 3);
    return { from: { year: f.getFullYear(), month: f.getMonth(), day: f.getDate() }, to };
  }
  // Current FY: Apr 1 of current or previous year
  const fyStart = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return { from: { year: fyStart, month: 3, day: 1 }, to };
}

/* ------------------------------------------------------------------ */
/*  Calendar                                                           */
/* ------------------------------------------------------------------ */

function Calendar({
  year, month, from, to,
  onSelectDay, onPrevMonth, onNextMonth,
}: {
  year: number; month: number;
  from: DateVal | null; to: DateVal | null;
  onSelectDay: (d: DateVal) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const total = daysInMonth(year, month);
  const startOffset = firstDayOfWeek(year, month);
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const fromNum = from ? dateToNum(from) : null;
  const toNum   = to   ? dateToNum(to)   : null;

  function cellNum(day: number) { return year * 10000 + month * 100 + day; }

  function isStart(day: number) { return fromNum !== null && cellNum(day) === fromNum; }
  function isEnd(day: number)   { return toNum   !== null && cellNum(day) === toNum;   }
  function inRange(day: number) {
    if (!fromNum || !toNum) return false;
    const n = cellNum(day);
    return n > Math.min(fromNum, toNum) && n < Math.max(fromNum, toNum);
  }

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrevMonth} className="p-1.5 rounded-full active:bg-muted/50">
          <ChevronLeft size={18} className="text-foreground" />
        </button>
        <p className="text-[16px] font-bold text-foreground">{MONTH_NAMES[month]} {year}</p>
        <button onClick={onNextMonth} className="p-1.5 rounded-full active:bg-muted/50">
          <ChevronRight size={18} className="text-foreground" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((l) => (
          <p key={l} className="text-[12px] text-muted-foreground text-center font-normal py-1">{l}</p>
        ))}
      </div>

      {/* Day grid */}
      {rows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7 mb-1">
          {row.map((day, ci) => {
            if (!day) return <div key={ci} />;
            const start = isStart(day);
            const end   = isEnd(day);
            const range = inRange(day);
            const active = start || end;
            return (
              <button
                key={ci}
                onClick={() => onSelectDay({ year, month, day })}
                className={cn(
                  "relative h-10 flex items-center justify-center text-[16px] font-medium transition-colors",
                  range && "bg-muted/60",
                  start && "rounded-l-full",
                  end   && "rounded-r-full",
                  (start && end) && "rounded-full",
                )}
              >
                <span className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-full",
                  active ? "bg-foreground text-background font-bold" : "text-foreground",
                )}>
                  {day}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Date Range Picker Drawer                                           */
/* ------------------------------------------------------------------ */

function DateRangeDrawer({
  open, onClose, from, to, onConfirm,
}: {
  open: boolean; onClose: () => void;
  from: DateVal | null; to: DateVal | null;
  onConfirm: (from: DateVal, to: DateVal) => void;
}) {
  const today = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [localFrom, setLocalFrom] = useState<DateVal | null>(from);
  const [localTo,   setLocalTo]   = useState<DateVal | null>(to);
  const [selecting, setSelecting] = useState<"from" | "to">("from");

  function handleDay(d: DateVal) {
    if (selecting === "from") {
      setLocalFrom(d);
      setLocalTo(null);
      setSelecting("to");
    } else {
      if (localFrom && dateToNum(d) < dateToNum(localFrom)) {
        setLocalTo(localFrom);
        setLocalFrom(d);
      } else {
        setLocalTo(d);
      }
      setSelecting("from");
    }
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[92dvh] flex flex-col inset-x-0 mx-auto max-w-[430px]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header: close top-right, title left, subtitle below */}
        <div className="px-5 pt-2 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-foreground leading-tight">Date Range</p>
              <p className="text-[14px] text-muted-foreground mt-1">Select a custom date range for your P&amp;L</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1 -mr-1 -mt-0.5 active:bg-muted/50 shrink-0">
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pt-4 pb-2">
          {/* From / To inputs */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setSelecting("from")}
              className={cn(
                "flex-1 rounded-xl border px-4 py-3 text-left transition-colors",
                selecting === "from" ? "border-foreground" : "border-border/50"
              )}
            >
              <p className="text-[12px] text-muted-foreground mb-0.5">From</p>
              <p className={cn("text-[16px] font-semibold", selecting === "from" ? "text-foreground" : "text-muted-foreground")}>
                {localFrom ? fmtDate(localFrom) : "—"}
              </p>
            </button>
            <button
              onClick={() => setSelecting("to")}
              className={cn(
                "flex-1 rounded-xl border px-4 py-3 text-left transition-colors",
                selecting === "to" ? "border-foreground" : "border-border/50"
              )}
            >
              <p className="text-[12px] text-muted-foreground mb-0.5">To</p>
              <p className={cn("text-[16px] font-semibold", selecting === "to" ? "text-foreground" : "text-muted-foreground")}>
                {localTo ? fmtDate(localTo) : "—"}
              </p>
            </button>
          </div>

          <Calendar
            year={calYear} month={calMonth}
            from={localFrom} to={localTo}
            onSelectDay={handleDay}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </div>

        {/* CTA */}
        <div className="shrink-0 px-5 pb-6 pt-3 border-t border-border/40">
          <button
            disabled={!localFrom || !localTo}
            onClick={() => localFrom && localTo && onConfirm(localFrom, localTo)}
            className="w-full rounded-2xl bg-foreground py-4 text-[16px] font-bold text-background disabled:opacity-40 active:opacity-75 transition-opacity"
          >
            Apply
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  P&L Summary card                                                   */
/* ------------------------------------------------------------------ */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
      className={cn("transition-transform duration-200 text-muted-foreground shrink-0", open ? "rotate-180" : "")}>
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SummaryCard({ from, to, onOpenPicker, data }: {
  from: DateVal; to: DateVal; onOpenPicker: () => void; data: RangeData;
}) {
  const [regOpen, setRegOpen] = useState(false);
  const { orders, charges: CHARGES } = data;
  const realisedPnl = orders.reduce((s, o) => s + o.pnl, 0);
  const netPnl = realisedPnl - CHARGES.total;

  return (
    <div className="rounded-2xl bg-white border border-border/50 overflow-hidden mb-5">
      {/* Realised P&L */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[16px] text-muted-foreground mb-2">Realised P&L</p>
        <div className="flex items-center justify-between">
          <button
            onClick={onOpenPicker}
            className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 active:opacity-60"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-muted-foreground shrink-0">
              <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M1 6h14" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5 1v2M11 1v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className="text-[14px] font-normal text-muted-foreground">
              {fmtDate(from)} to {fmtDate(to)}
            </span>
          </button>
          <p className={cn(
            "text-[24px] font-bold tabular-nums",
            realisedPnl >= 0 ? "text-emerald-500" : "text-red-500"
          )}>
            {realisedPnl >= 0 ? "+" : ""}{realisedPnl}
          </p>
        </div>
      </div>

      <div className="h-px bg-border/40 mx-4" />

      {/* Charges */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[16px] text-muted-foreground">Charges &amp; Fees</p>
          <p className="text-[16px] font-semibold text-foreground">${CHARGES.total}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[14px] text-muted-foreground/70">Aspora Brokerage</p>
          <p className="text-[14px] text-muted-foreground">${CHARGES.brokerage}</p>
        </div>
        {/* Regulatory Fees accordion */}
        <div>
          <button
            onClick={() => setRegOpen((v) => !v)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-1.5">
              <p className="text-[14px] text-muted-foreground/70">Regulatory Fees</p>
              <Chevron open={regOpen} />
            </div>
            <p className="text-[14px] text-muted-foreground">${CHARGES.regulatory}</p>
          </button>
          {regOpen && (
            <div className="mt-2 pl-3 space-y-1.5 border-t border-border/30 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-muted-foreground/60">SEC Fee</p>
                <p className="text-[14px] text-muted-foreground">${CHARGES.secFee.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-muted-foreground/60">FINRA Fee</p>
                <p className="text-[14px] text-muted-foreground">${CHARGES.finraFee.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-muted-foreground/60">Exchange Fees</p>
                <p className="text-[14px] text-muted-foreground">${CHARGES.exchangeFee.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-muted-foreground/60">OPRA Fee</p>
                <p className="text-[14px] text-muted-foreground">${CHARGES.opraFee.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-border/40 mx-4" />

      {/* Net Realised P&L */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-[16px] text-muted-foreground">Net Realised P&L</p>
        <p className="text-[16px] font-bold text-foreground">${netPnl}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Map PnlOrder → CompletedOrder for shared OrderCard                */
/* ------------------------------------------------------------------ */

function toCompletedOrder(o: PnlOrder): CompletedOrder {
  return {
    kind:             "completed",
    symbol:           o.symbol,
    companyName:      o.companyName,
    expiry:           o.expiry,
    optionType:       o.optionType,
    tag:              o.tag,
    side:             o.side,
    filledQty:        o.qty,
    totalQty:         o.qty,
    lots:             o.lots,
    priceType:        "market",
    price:            o.avgExecutedPrice,
    avgExecutedPrice: o.avgExecutedPrice,
    investedAmount:   o.buyPrice * o.qty,
    charges:          0,
    brokerage:        0,
    regulatoryFee:    0,
    secFee:           0,
    finraFee:         0,
    exchangeFee:      0,
    opraFee:          0,
    orderId:          o.orderId,
    time:             "",
    executedAt:       "",
  };
}

// Register all unique P&L orders so the detail page can look them up
const allPnlOrders = Object.values(RANGE_DATA).flatMap((d) => d.orders.map(toCompletedOrder));
addOrders(allPnlOrders);

/* ------------------------------------------------------------------ */
/*  Main tab                                                           */
/* ------------------------------------------------------------------ */

export function PnlTab({ empty }: { empty?: boolean }) {
  const today = new Date();
  const todayVal: DateVal = { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthAgoVal: DateVal = { year: monthAgo.getFullYear(), month: monthAgo.getMonth(), day: monthAgo.getDate() };

  const [preset, setPreset]       = useState<RangePreset>("Custom");
  const [from,   setFrom]         = useState<DateVal>(monthAgoVal);
  const [to,     setTo]           = useState<DateVal>(todayVal);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (empty) {
    return (
      <div className="pb-24">
        {/* Range tabs ghost */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex gap-2">
            {["1M", "3M", "Current FY", "Custom"].map((p, i) => (
              <div key={p} className={cn(
                "flex-1 py-2.5 rounded-xl text-[14px] font-semibold text-center",
                i === 0 ? "bg-foreground/10 text-foreground/30" : "border border-border/30 text-muted-foreground/30"
              )}>
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Ghost chart area */}
        <div className="mx-5 mb-4 rounded-3xl border border-border/40 bg-background overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <p className="text-[13px] text-muted-foreground mb-0.5">Total P&L</p>
            <p className="text-[32px] font-bold text-foreground/15 tabular-nums leading-none">$0.00</p>
          </div>
          {/* Ghost chart */}
          <div className="px-5 pb-5">
            <div className="relative h-[100px]">
              <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
                {/* Axis */}
                <line x1="0" y1="79" x2="300" y2="79" stroke="currentColor" strokeWidth="0.5" className="text-border/40" />
                <line x1="0" y1="0" x2="0" y2="79" stroke="currentColor" strokeWidth="0.5" className="text-border/40" />
                {/* Flat zero line (dashed) */}
                <line x1="0" y1="40" x2="300" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" className="text-foreground/15" />
                {/* Ghost bars */}
                {[0, 50, 100, 150, 200, 250].map((x) => (
                  <rect key={x} x={x + 5} y={35} width={40} height={5} rx="2" className="fill-muted" />
                ))}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[12px] font-medium text-muted-foreground/60">Trade to see your P&L chart</p>
              </div>
            </div>
          </div>
          {/* Ghost metrics row */}
          <div className="grid grid-cols-3 divide-x divide-border/30 border-t border-border/30">
            {[{ l: "Realized", v: "$0.00" }, { l: "Unrealized", v: "$0.00" }, { l: "Today", v: "$0.00" }].map((m) => (
              <div key={m.l} className="px-3 py-3 text-center">
                <p className="text-[14px] font-bold text-foreground/15 tabular-nums">{m.v}</p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">{m.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ghost calendar row */}
        <div className="mx-5 mb-5 rounded-2xl border border-border/40 bg-background px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-semibold text-muted-foreground/50">P&L Calendar</p>
            <CalendarDays size={14} className="text-muted-foreground/30" />
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-md bg-muted/40" />
            ))}
          </div>
        </div>

        <div className="px-5">
          <button className="w-full rounded-2xl bg-foreground py-4 text-[15px] font-bold text-background active:opacity-75 transition-opacity">
            Start Trading
          </button>
        </div>
      </div>
    );
  }

  const PRESETS: RangePreset[] = ["1M", "3M", "Current FY", "Custom"];

  function applyPreset(p: RangePreset) {
    setPreset(p);
    if (p !== "Custom") {
      const r = presetRange(p);
      setFrom(r.from);
      setTo(r.to);
    } else {
      setPickerOpen(true);
    }
  }

  return (
    <div className="pb-24">
      {/* ── Range selector ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-colors",
                preset === p
                  ? "bg-foreground text-background"
                  : "border border-border/50 text-muted-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {/* Summary card */}
        <SummaryCard from={from} to={to} onOpenPicker={() => setPickerOpen(true)} data={RANGE_DATA[preset]} />

        {/* Orders list */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[16px] font-bold text-foreground">{RANGE_DATA[preset].orders.length} Orders</p>
          <button className="flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5">
            <span className="text-[14px] font-semibold text-muted-foreground">Value</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground">
              <path d="M6 2v8M3 7l3 3 3-3M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40">
          {RANGE_DATA[preset].orders.map((o) => <OrderCard key={o.symbol} order={toCompletedOrder(o)} />)}
        </div>
      </div>

      {/* Date range picker drawer */}
      <DateRangeDrawer
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        from={from}
        to={to}
        onConfirm={(f, t) => {
          setFrom(f);
          setTo(t);
          setPreset("Custom");
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
