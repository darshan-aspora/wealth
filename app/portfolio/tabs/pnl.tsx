"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RangePreset = "1M" | "3M" | "Current FY" | "Custom";

interface DateVal { year: number; month: number; day: number }

interface PnlOrder {
  symbol: string;
  qty: number;
  buyPrice: number;
  sellPrice: number;
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
      { symbol: "TSLA", qty: 10, buyPrice: 244, sellPrice: 222, pnl: -220 },
      { symbol: "SPY",  qty: 20, buyPrice: 100, sellPrice: 120, pnl: 400  },
    ],
    charges: { total: 10, brokerage: 7, regulatory: 3, secFee: 0.80, finraFee: 0.50, exchangeFee: 1.20, opraFee: 0.50 },
  },
  "3M": {
    orders: [
      { symbol: "AAPL", qty: 15, buyPrice: 178, sellPrice: 195, pnl: 255   },
      { symbol: "NVDA", qty: 5,  buyPrice: 820, sellPrice: 870, pnl: 250   },
      { symbol: "TSLA", qty: 10, buyPrice: 244, sellPrice: 222, pnl: -220  },
      { symbol: "SPY",  qty: 20, buyPrice: 100, sellPrice: 120, pnl: 400   },
    ],
    charges: { total: 28, brokerage: 20, regulatory: 8, secFee: 2.20, finraFee: 1.80, exchangeFee: 2.80, opraFee: 1.20 },
  },
  "Current FY": {
    orders: [
      { symbol: "AAPL", qty: 15, buyPrice: 178, sellPrice: 195, pnl: 255   },
      { symbol: "NVDA", qty: 5,  buyPrice: 820, sellPrice: 870, pnl: 250   },
      { symbol: "TSLA", qty: 10, buyPrice: 244, sellPrice: 222, pnl: -220  },
      { symbol: "SPY",  qty: 20, buyPrice: 100, sellPrice: 120, pnl: 400   },
      { symbol: "QQQ",  qty: 8,  buyPrice: 380, sellPrice: 412, pnl: 256   },
      { symbol: "META", qty: 3,  buyPrice: 310, sellPrice: 290, pnl: -60   },
      { symbol: "AMD",  qty: 12, buyPrice: 145, sellPrice: 162, pnl: 204   },
    ],
    charges: { total: 62, brokerage: 44, regulatory: 18, secFee: 5.10, finraFee: 3.90, exchangeFee: 6.20, opraFee: 2.80 },
  },
  "Custom": {
    orders: [
      { symbol: "TSLA", qty: 10, buyPrice: 244, sellPrice: 222, pnl: -220 },
      { symbol: "SPY",  qty: 20, buyPrice: 100, sellPrice: 120, pnl: 400  },
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
  year, month, from, to, selecting,
  onSelectDay, onPrevMonth, onNextMonth,
}: {
  year: number; month: number;
  from: DateVal | null; to: DateVal | null;
  selecting: "from" | "to";
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
        <p className="text-[14px] font-bold text-foreground">{MONTH_NAMES[month]} {year}</p>
        <button onClick={onNextMonth} className="p-1.5 rounded-full active:bg-muted/50">
          <ChevronRight size={18} className="text-foreground" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((l) => (
          <p key={l} className="text-[11px] text-muted-foreground text-center font-semibold py-1">{l}</p>
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
                  "relative h-10 flex items-center justify-center text-[13px] font-medium transition-colors",
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
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[92dvh] flex flex-col">
        <div className="px-5 pt-5 pb-4 shrink-0">
          <p className="text-[18px] font-extrabold text-foreground mb-4">Date Range</p>

          {/* From / To inputs */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setSelecting("from")}
              className={cn(
                "flex-1 rounded-xl border px-4 py-3 text-[13px] font-semibold text-left transition-colors",
                selecting === "from" ? "border-foreground text-foreground" : "border-border/50 text-muted-foreground"
              )}
            >
              {localFrom ? fmtDate(localFrom) : "Start date"}
            </button>
            <button
              onClick={() => setSelecting("to")}
              className={cn(
                "flex-1 rounded-xl border px-4 py-3 text-[13px] font-semibold text-left transition-colors",
                selecting === "to" ? "border-foreground text-foreground" : "border-border/50 text-muted-foreground"
              )}
            >
              {localTo ? fmtDate(localTo) : "End date"}
            </button>
          </div>

          <Calendar
            year={calYear} month={calMonth}
            from={localFrom} to={localTo}
            selecting={selecting}
            onSelectDay={handleDay}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </div>

        <div className="px-5 pb-8 pt-2 shrink-0">
          <button
            disabled={!localFrom || !localTo}
            onClick={() => localFrom && localTo && onConfirm(localFrom, localTo)}
            className="w-full rounded-2xl bg-foreground py-4 text-[14px] font-bold text-background disabled:opacity-40 active:opacity-75 transition-opacity"
          >
            Confirm
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
        <p className="text-[13px] text-muted-foreground mb-2">Realised P&L</p>
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
            <span className="text-[12px] font-semibold text-muted-foreground">
              {fmtDate(from)} to {fmtDate(to)}
            </span>
          </button>
          <p className={cn(
            "text-[20px] font-extrabold tabular-nums",
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
          <p className="text-[13px] text-muted-foreground">Charges &amp; Fees</p>
          <p className="text-[13px] font-semibold text-foreground">${CHARGES.total}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground/70">Aspora Brokerage</p>
          <p className="text-[12px] text-muted-foreground">${CHARGES.brokerage}</p>
        </div>
        {/* Regulatory Fees accordion */}
        <div>
          <button
            onClick={() => setRegOpen((v) => !v)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-1.5">
              <p className="text-[12px] text-muted-foreground/70">Regulatory Fees</p>
              <Chevron open={regOpen} />
            </div>
            <p className="text-[12px] text-muted-foreground">${CHARGES.regulatory}</p>
          </button>
          {regOpen && (
            <div className="mt-2 pl-3 space-y-1.5 border-t border-border/30 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground/60">SEC Fee</p>
                <p className="text-[12px] text-muted-foreground">${CHARGES.secFee.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground/60">FINRA Fee</p>
                <p className="text-[12px] text-muted-foreground">${CHARGES.finraFee.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground/60">Exchange Fees</p>
                <p className="text-[12px] text-muted-foreground">${CHARGES.exchangeFee.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-muted-foreground/60">OPRA Fee</p>
                <p className="text-[12px] text-muted-foreground">${CHARGES.opraFee.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-border/40 mx-4" />

      {/* Net Realised P&L */}
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">Net Realised P&L</p>
        <p className="text-[13px] font-bold text-foreground">${netPnl}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Order rows                                                         */
/* ------------------------------------------------------------------ */

function OrderRow({ order }: { order: PnlOrder }) {
  return (
    <div className="rounded-2xl bg-white border border-border/50 px-4 py-3.5 flex items-center justify-between">
      <div>
        <p className="text-[14px] font-bold text-foreground mb-1">{order.symbol}</p>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M4 8h8M4 5h5M4 11h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span>{order.qty}</span>
          <span className="text-muted-foreground/40">|</span>
          <span>${order.buyPrice} → ${order.sellPrice}</span>
        </div>
      </div>
      <p className={cn(
        "text-[14px] font-bold tabular-nums",
        order.pnl >= 0 ? "text-emerald-500" : "text-red-500"
      )}>
        {order.pnl >= 0 ? "+" : ""}{order.pnl}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main tab                                                           */
/* ------------------------------------------------------------------ */

export function PnlTab() {
  const today = new Date();
  const todayVal: DateVal = { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthAgoVal: DateVal = { year: monthAgo.getFullYear(), month: monthAgo.getMonth(), day: monthAgo.getDate() };

  const [preset, setPreset]       = useState<RangePreset>("Custom");
  const [from,   setFrom]         = useState<DateVal>(monthAgoVal);
  const [to,     setTo]           = useState<DateVal>(todayVal);
  const [pickerOpen, setPickerOpen] = useState(false);

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
                "flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-colors",
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
          <p className="text-[14px] font-bold text-foreground">{RANGE_DATA[preset].orders.length} Orders</p>
          <button className="flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5">
            <span className="text-[12px] font-semibold text-muted-foreground">Value</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground">
              <path d="M6 2v8M3 7l3 3 3-3M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="space-y-2.5">
          {RANGE_DATA[preset].orders.map((o) => <OrderRow key={o.symbol} order={o} />)}
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
