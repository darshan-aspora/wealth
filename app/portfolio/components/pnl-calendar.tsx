"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PNL_CALENDAR, type DayPnL } from "./portfolio-mock-data";
import { OrderCard, addOrders, type CompletedOrder } from "./shared-order";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTH_NAMES_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_NAMES_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MonthStats {
  pnl: number;
  trades: number;
  greenDays: number;
  redDays: number;
  winRate: number;
  days: DayPnL[];
}

interface AllTimeStats {
  pnl: number;
  trades: number;
  greenDays: number;
  redDays: number;
  winRate: number;
  bestDay: number;
  worstDay: number;
  avgPerDay: number;
}

type PeriodSelection =
  | { type: "day";     label: string; pnl: number; trades: number; dayData: DayPnL }
  | { type: "month";   label: string; pnl: number; trades: number; stats: MonthStats }
  | { type: "alltime"; label: string; pnl: number; stats: AllTimeStats };

/* ------------------------------------------------------------------ */
/*  Mock order data (shared across all sheet types)                    */
/* ------------------------------------------------------------------ */

const MOCK_COMPLETED_ORDERS: CompletedOrder[] = [
  {
    kind: "completed", symbol: "TSLA", companyName: "Tesla Inc", side: "S",
    filledQty: 10, totalQty: 10, priceType: "market", price: 222,
    avgExecutedPrice: 222, investedAmount: 2440, charges: 0, brokerage: 0,
    regulatoryFee: 0, secFee: 0, finraFee: 0, exchangeFee: 0, opraFee: 0,
    orderId: "CAL001", time: "", executedAt: "", pnl: -220,
  },
  {
    kind: "completed", symbol: "SPY", companyName: "SPDR S&P 500", side: "B", tag: "ETF",
    filledQty: 20, totalQty: 20, priceType: "market", price: 120,
    avgExecutedPrice: 120, investedAmount: 2000, charges: 0, brokerage: 0,
    regulatoryFee: 0, secFee: 0, finraFee: 0, exchangeFee: 0, opraFee: 0,
    orderId: "CAL002", time: "", executedAt: "", pnl: 400,
  },
];
addOrders(MOCK_COMPLETED_ORDERS);

const MOCK_CHARGES = {
  brokerage: 7,
  regulatory: [
    { label: "SEC Fee",       amount: 0.80 },
    { label: "FINRA Fee",     amount: 0.50 },
    { label: "Exchange Fees", amount: 1.20 },
    { label: "OPRA Fee",      amount: 0.50 },
  ],
};

const CHARGES_TOTAL = MOCK_CHARGES.brokerage + MOCK_CHARGES.regulatory.reduce((s, r) => s + r.amount, 0);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPnL(value: number): string {
  const abs = Math.abs(Math.round(value));
  return `${value >= 0 ? "+" : "-"}${abs.toLocaleString("en-US")}`;
}

function PnlValue({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("font-bold", value >= 0 ? "text-gain" : "text-loss", className)}>
      {formatPnL(value)}
    </span>
  );
}

function computeMonthStats(days: DayPnL[]): MonthStats {
  const trading = days.filter((d) => d.isTrading);
  const pnl = trading.reduce((s, d) => s + d.pnl, 0);
  const trades = trading.reduce((s, d) => s + d.trades, 0);
  const greenDays = trading.filter((d) => d.pnl >= 0).length;
  const redDays = trading.filter((d) => d.pnl < 0).length;
  const winRate = trading.length > 0 ? Math.round((greenDays / trading.length) * 100) : 0;
  return { pnl, trades, greenDays, redDays, winRate, days };
}

/* ------------------------------------------------------------------ */
/*  Stat row (reused in sheet header area)                             */
/* ------------------------------------------------------------------ */

function StatGrid({ items }: { items: { label: string; value: string; colored?: boolean; isGain?: boolean }[] }) {
  return (
    <div className={cn("grid gap-3 mb-4", items.length <= 3 ? "grid-cols-3" : "grid-cols-2")}>
      {items.map((s) => (
        <div key={s.label} className="rounded-xl bg-muted/30 px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground mb-0.5">{s.label}</p>
          <p className={cn(
            "text-[15px] font-bold",
            s.colored ? (s.isGain ? "text-gain" : "text-loss") : "text-foreground"
          )}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  P&L breakdown card (shared across sheet types)                     */
/* ------------------------------------------------------------------ */

function PnlBreakdownCard({ realisedPnl, dateLabel }: { realisedPnl: number; dateLabel: string }) {
  const [realisedExpanded, setRealisedExpanded] = useState(false);
  const [regulatoryExpanded, setRegulatoryExpanded] = useState(false);

  const regulatoryTotal = MOCK_CHARGES.regulatory.reduce((s, r) => s + r.amount, 0);
  const chargesTotal = MOCK_CHARGES.brokerage + regulatoryTotal;
  const netPnl = realisedPnl - chargesTotal;
  const isGain = realisedPnl >= 0;
  const isNetGain = netPnl >= 0;

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Net Realised P&L — always visible */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-foreground">Net Realised P&L</span>
          <span className="text-[11px] text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5">{dateLabel}</span>
        </div>
        <span className={cn("text-[16px] font-bold", isNetGain ? "text-gain" : "text-loss")}>{formatPnL(netPnl)}</span>
      </div>

      <div className="h-px bg-border/30 mx-4" />

      {/* Realised P&L — collapsible */}
      <button
        onClick={() => setRealisedExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 active:bg-muted/30 transition-colors"
      >
        <span className="text-[13px] text-muted-foreground">Realised P&L</span>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[13px] font-semibold", isGain ? "text-gain" : "text-loss")}>{formatPnL(realisedPnl)}</span>
          <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-200", realisedExpanded && "rotate-180")} />
        </div>
      </button>

      {realisedExpanded && (
        <div className="border-t border-border/30">
          {/* Gross P&L + Total Charges */}
          <div className="px-4 pt-3 pb-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-[13px] text-muted-foreground">Gross P&L</span>
              <span className={cn("text-[13px] font-medium", isGain ? "text-gain" : "text-loss")}>{formatPnL(realisedPnl + chargesTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-muted-foreground">Total Charges</span>
              <span className="text-[13px] font-medium text-foreground">-${chargesTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="h-px bg-border/30 mx-4" />

          {/* Charges & Fees */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[13px] text-muted-foreground">Charges & Fees</span>
            <span className="text-[13px] font-medium text-foreground">${chargesTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between px-4 pb-2.5">
            <span className="text-[13px] text-muted-foreground pl-3">Aspora Brokerage</span>
            <span className="text-[13px] text-muted-foreground">${MOCK_CHARGES.brokerage.toFixed(2)}</span>
          </div>

          {/* Regulatory Fees */}
          <button
            onClick={() => setRegulatoryExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 pb-3 active:opacity-70 transition-opacity"
          >
            <div className="flex items-center gap-1 pl-3">
              <span className="text-[13px] text-muted-foreground">Regulatory Fees</span>
              <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-200", regulatoryExpanded && "rotate-180")} />
            </div>
            <span className="text-[13px] text-muted-foreground">${regulatoryTotal.toFixed(2)}</span>
          </button>

          {regulatoryExpanded && (
            <div className="mx-4 mb-3 rounded-lg bg-muted/30 overflow-hidden divide-y divide-border/30">
              {MOCK_CHARGES.regulatory.map((r) => (
                <div key={r.label} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[12px] text-muted-foreground">{r.label}</span>
                  <span className="text-[12px] text-muted-foreground">${r.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Unified period detail sheet                                        */
/* ------------------------------------------------------------------ */

function PeriodDetailSheet({ selection, onClose }: { selection: PeriodSelection; onClose: () => void }) {
  const isGain = selection.pnl >= 0;

  const title = selection.label;
  const subtitle =
    selection.type === "day"
      ? `${formatPnL(selection.pnl - CHARGES_TOTAL)} net · ${selection.trades} order${selection.trades !== 1 ? "s" : ""}`
      : selection.type === "month"
      ? `${formatPnL(selection.pnl - CHARGES_TOTAL)} net · ${selection.stats.trades} trades`
      : `${formatPnL(selection.pnl - CHARGES_TOTAL)} net lifetime P&L`;

  return (
    <Sheet open onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[92dvh] flex flex-col inset-x-0 mx-auto max-w-[430px]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-foreground leading-tight">{title}</p>
              <p className={cn("text-[14px] font-medium mt-1", isGain ? "text-gain" : "text-loss")}>{subtitle}</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1 -mr-1 -mt-0.5 active:bg-muted/50 shrink-0">
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">

          {/* ── DAY view ── */}
          {selection.type === "day" && (
            <>
              <p className="text-[14px] font-semibold text-foreground">Top Orders</p>
              <div className="divide-y divide-border/40 border border-border/40 rounded-2xl overflow-hidden">
                {MOCK_COMPLETED_ORDERS.map((o) => <OrderCard key={o.orderId} order={o} />)}
              </div>
              <PnlBreakdownCard realisedPnl={selection.pnl} dateLabel={selection.label} />
            </>
          )}

          {/* ── MONTH view ── */}
          {selection.type === "month" && (() => {
            const { stats } = selection;
            return (
              <>
                <StatGrid items={[
                  { label: "Win Rate",   value: `${stats.winRate}%` },
                  { label: "Green Days", value: `${stats.greenDays}`, colored: true, isGain: true },
                  { label: "Red Days",   value: `${stats.redDays}`,  colored: true, isGain: false },
                  { label: "Avg / Day",  value: formatPnL(stats.pnl / (stats.greenDays + stats.redDays || 1)), colored: true, isGain },
                ]} />
                <p className="text-[14px] font-semibold text-foreground">Top Orders</p>
                <div className="divide-y divide-border/40 border border-border/40 rounded-2xl overflow-hidden">
                  {MOCK_COMPLETED_ORDERS.map((o) => <OrderCard key={o.orderId} order={o} />)}
                </div>
                <PnlBreakdownCard realisedPnl={selection.pnl} dateLabel={selection.label} />
              </>
            );
          })()}

          {/* ── ALL TIME view ── */}
          {selection.type === "alltime" && (() => {
            const { stats } = selection;
            return (
              <>
                <StatGrid items={[
                  { label: "Total P&L",   value: formatPnL(stats.pnl),       colored: true, isGain },
                  { label: "Total Trades",value: `${stats.trades}` },
                  { label: "Win Rate",    value: `${stats.winRate}%` },
                  { label: "Green Days",  value: `${stats.greenDays}`,  colored: true, isGain: true },
                  { label: "Red Days",    value: `${stats.redDays}`,    colored: true, isGain: false },
                  { label: "Avg / Day",   value: formatPnL(stats.avgPerDay), colored: true, isGain },
                  { label: "Best Day",    value: formatPnL(stats.bestDay),   colored: true, isGain: true },
                  { label: "Worst Day",   value: formatPnL(stats.worstDay),  colored: true, isGain: false },
                ]} />
                <p className="text-[14px] font-semibold text-foreground">Recent Orders</p>
                <div className="divide-y divide-border/40 border border-border/40 rounded-2xl overflow-hidden">
                  {MOCK_COMPLETED_ORDERS.map((o) => <OrderCard key={o.orderId} order={o} />)}
                </div>
                <PnlBreakdownCard realisedPnl={stats.pnl} dateLabel="All Time" />
              </>
            );
          })()}

        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  P&L Stats bar                                                      */
/* ------------------------------------------------------------------ */

function PnlStats({ days }: { days: DayPnL[] }) {
  const trading = days.filter((d) => d.isTrading);
  const totalPnl = trading.reduce((s, d) => s + d.pnl, 0);
  const totalTrades = trading.reduce((s, d) => s + d.trades, 0);
  const greenDays = trading.filter((d) => d.pnl >= 0).length;
  const winRate = trading.length > 0 ? Math.round((greenDays / trading.length) * 100) : 0;
  const charges = totalTrades * 0.70;
  const netRealisedPnl = totalPnl - charges;

  const items = [
    { label: "Gross P&L", node: <PnlValue value={totalPnl} className="text-[15px] leading-tight" /> },
    { label: "Net P&L",   node: <PnlValue value={netRealisedPnl} className="text-[15px] leading-tight" /> },
    { label: "Trades",           node: <span className="text-[15px] font-bold text-foreground">{totalTrades}</span> },
    { label: "Win Rate",         node: <span className="text-[15px] font-bold text-foreground">{winRate}%</span> },
  ];

  return (
    <div className="flex divide-x divide-border/40 rounded-xl bg-muted/30 overflow-hidden">
      {items.map(({ label, node }) => (
        <div key={label} className="flex-1 flex flex-col items-center py-2.5 px-1 gap-0.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">{label}</p>
          {node}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Day cell                                                           */
/* ------------------------------------------------------------------ */

function DayCell({ day, isToday, onTap }: { day: DayPnL; isToday: boolean; onTap?: (day: DayPnL) => void }) {
  return (
    <div
      onClick={() => day.isTrading && onTap?.(day)}
      className={cn(
        "aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5",
        day.isTrading ? "bg-foreground/[0.04]" : "bg-muted/10",
        day.isTrading && "cursor-pointer active:scale-95 transition-transform",
        isToday && "ring-1 ring-foreground/50"
      )}
    >
      <span className="text-[12px] font-semibold text-foreground/80 leading-none">{day.date}</span>
      {day.isTrading ? (
        <PnlValue value={day.pnl - CHARGES_TOTAL} className="text-[11px] leading-none" />
      ) : (
        <span className="text-[11px] text-muted-foreground leading-none">—</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NavHeader                                                          */
/* ------------------------------------------------------------------ */

function NavHeader({ label, onPrev, onNext, canPrev, canNext }: { label: string; onPrev: () => void; onNext: () => void; canPrev: boolean; canNext: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={onPrev} disabled={!canPrev} className="h-8 w-8"><ChevronLeft size={18} /></Button>
      <span className="text-[15px] font-semibold text-foreground">{label}</span>
      <Button variant="ghost" size="icon" onClick={onNext} disabled={!canNext} className="h-8 w-8"><ChevronRight size={18} /></Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Month grid                                                         */
/* ------------------------------------------------------------------ */

function MonthGrid({ monthKey, isCurrentMonth, onDayTap }: {
  monthKey: string; year: number; monthIndex: number; isCurrentMonth: boolean; onDayTap: (day: DayPnL) => void;
}) {
  const monthData = PNL_CALENDAR[monthKey];
  if (!monthData) return null;

  const gridCells: (DayPnL | null)[] = [];
  // firstWeekday is Mon-based (0=Mon, 6=Sun)
  for (let i = 0; i < monthData.firstWeekday; i++) gridCells.push(null);
  for (const day of monthData.days) {
    gridCells.push(day);
  }

  const todayDate = isCurrentMonth ? new Date().getDate() : -1;

  return (
    <>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground tracking-wider py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {gridCells.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} className="min-h-[68px]" />;
          return <DayCell key={cell.date} day={cell} isToday={cell.date === todayDate} onTap={onDayTap} />;
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Week view                                                          */
/* ------------------------------------------------------------------ */

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return date;
}

function WeekView({ onDayTap }: { onDayTap: (day: DayPnL, date: Date) => void }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const currentMonday = useMemo(() => {
    const mon = getMonday(new Date());
    mon.setDate(mon.getDate() + weekOffset * 7);
    return mon;
  }, [weekOffset]);

  const sunday = useMemo(() => {
    const s = new Date(currentMonday);
    s.setDate(s.getDate() + 6);
    return s;
  }, [currentMonday]);

  const weekLabel = `${MONTH_NAMES_SHORT[currentMonday.getMonth()]} ${currentMonday.getDate()} – ${MONTH_NAMES_SHORT[sunday.getMonth()]} ${sunday.getDate()}`;

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentMonday);
      d.setDate(d.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthData = PNL_CALENDAR[key];
      const dayData = monthData?.days.find((dd) => dd.date === d.getDate());
      return { dayPnl: dayData ?? { date: d.getDate(), pnl: 0, trades: 0, isTrading: false }, date: d };
    });
  }, [currentMonday]);

  const todayDate = new Date().getDate();
  const isCurrentWeek = weekOffset === 0;
  const canPrev = currentMonday > getMonday(new Date(2024, 0, 1));
  const canNext = weekOffset < 0;

  return (
    <div className="space-y-3">
      <NavHeader label={weekLabel} onPrev={() => setWeekOffset((p) => p - 1)} onNext={() => setWeekOffset((p) => p + 1)} canPrev={canPrev} canNext={canNext} />
      <PnlStats days={weekDays.map((w) => w.dayPnl)} />
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground tracking-wider py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(({ dayPnl, date }, i) => (
          <DayCell key={i} day={dayPnl} isToday={isCurrentWeek && dayPnl.date === todayDate} onTap={() => onDayTap(dayPnl, date)} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Year view                                                          */
/* ------------------------------------------------------------------ */

function YearView({ onMonthTap }: { onMonthTap: (monthIndex: number, year: number, stats: MonthStats) => void }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const isCurrentYear = year === currentYear;
  const currentMonth = isCurrentYear ? new Date().getMonth() : 11;

  const monthlyData = useMemo(() => {
    const count = isCurrentYear ? currentMonth + 1 : 12;
    return Array.from({ length: count }, (_, m) => {
      const key = `${year}-${String(m + 1).padStart(2, "0")}`;
      const monthData = PNL_CALENDAR[key];
      const days = monthData?.days ?? [];
      return { month: m, stats: computeMonthStats(days) };
    });
  }, [year, isCurrentYear, currentMonth]);

  const yearDays = useMemo(() => monthlyData.flatMap((m) => m.stats.days), [monthlyData]);

  return (
    <div className="space-y-3">
      <NavHeader label={isCurrentYear ? `${year} YTD` : `${year}`} onPrev={() => setYear((y) => y - 1)} onNext={() => setYear((y) => y + 1)} canPrev={year > 2024} canNext={year < currentYear} />
      <PnlStats days={yearDays} />
      <div className="grid grid-cols-3 gap-2">
        {monthlyData.map(({ month, stats }) => {
          const hasData = stats.trades > 0;
          return (
            <div
              key={month}
              onClick={() => hasData && onMonthTap(month, year, stats)}
              className={cn(
                "rounded-lg p-3 flex flex-col items-center justify-center min-h-[72px]",
                hasData ? "bg-foreground/[0.04] cursor-pointer active:scale-95 transition-transform" : "bg-muted/10"
              )}
            >
              <span className="text-[13px] font-semibold text-foreground/80 mb-0.5">{MONTH_NAMES_SHORT[month]}</span>
              {hasData ? (
                <PnlValue value={stats.pnl - CHARGES_TOTAL} className="text-[14px] leading-tight" />
              ) : (
                <span className="text-[12px] text-muted-foreground">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  All time view                                                      */
/* ------------------------------------------------------------------ */

function AllTimeView({ onTap }: { onTap: (stats: AllTimeStats) => void }) {
  let totalPnl = 0, totalTrades = 0, greenDays = 0, redDays = 0, bestDay = 0, worstDay = 0;

  for (const data of Object.values(PNL_CALENDAR)) {
    for (const d of data.days) {
      if (!d.isTrading) continue;
      totalPnl += d.pnl;
      totalTrades += d.trades;
      if (d.pnl >= 0) greenDays++; else redDays++;
      if (d.pnl > bestDay) bestDay = d.pnl;
      if (d.pnl < worstDay) worstDay = d.pnl;
    }
  }

  const winRate = greenDays + redDays > 0 ? Math.round((greenDays / (greenDays + redDays)) * 100) : 0;
  const avgPerDay = totalPnl / (greenDays + redDays || 1);

  const stats: AllTimeStats = { pnl: totalPnl, trades: totalTrades, greenDays, redDays, winRate, bestDay, worstDay, avgPerDay };

  const cards = [
    { label: "Total P&L",    value: totalPnl,  isPnl: true },
    { label: "Total Trades", value: totalTrades, isPnl: false },
    { label: "Green Days",   value: greenDays,  isPnl: false },
    { label: "Red Days",     value: redDays,    isPnl: false },
    { label: "Win Rate",     value: winRate,    isPnl: false, suffix: "%" },
    { label: "Best Day",     value: bestDay,    isPnl: true },
    { label: "Worst Day",    value: worstDay,   isPnl: true },
    { label: "Avg / Day",    value: avgPerDay,  isPnl: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map((s) => (
        <Card
          key={s.label}
          className="shadow-none border-border/30 cursor-pointer active:scale-95 transition-transform"
          onClick={() => onTap(stats)}
        >
          <CardContent className="p-3">
            <p className="text-[12px] text-muted-foreground mb-0.5">{s.label}</p>
            {s.isPnl ? (
              <PnlValue value={s.value} className="text-[17px]" />
            ) : (
              <span className="text-[17px] font-bold text-foreground">
                {Math.round(s.value).toLocaleString("en-US")}{s.suffix ?? ""}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function PnlCalendar() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selection, setSelection] = useState<PeriodSelection | null>(null);

  const targetDate = useMemo(() => {
    const d = new Date(2026, 2, 1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const year = targetDate.getFullYear();
  const monthIndex = targetDate.getMonth();
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const monthLabel = `${MONTH_NAMES_FULL[monthIndex]} ${year}`;
  const isCurrentMonth = monthOffset === 0;

  const monthDays = useMemo(() => PNL_CALENDAR[monthKey]?.days ?? [], [monthKey]);

  const canPrev = !(year === 2024 && monthIndex === 0);
  const canNext = monthOffset < 0;

  // Month-view day tap
  const handleMonthDayTap = (day: DayPnL) => {
    setSelection({ type: "day", label: `${MONTH_NAMES_SHORT[monthIndex]} ${day.date}, ${year}`, pnl: day.pnl, trades: day.trades, dayData: day });
  };

  // Week-view day tap
  const handleWeekDayTap = (day: DayPnL, date: Date) => {
    const label = `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    setSelection({ type: "day", label, pnl: day.pnl, trades: day.trades, dayData: day });
  };

  // Year-view month tap
  const handleMonthTap = (mIndex: number, yr: number, stats: MonthStats) => {
    setSelection({ type: "month", label: `${MONTH_NAMES_FULL[mIndex]} ${yr}`, pnl: stats.pnl, trades: stats.trades, stats });
  };

  // All-time stat tap
  const handleAllTimeTap = (stats: AllTimeStats) => {
    setSelection({ type: "alltime", label: "All Time", pnl: stats.pnl, stats });
  };

  return (
    <Card className="border-border/50 shadow-none">
      <CardHeader className="p-5 pb-3 space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-foreground" />
          <CardTitle className="text-[15px]">P&L Calendar</CardTitle>
        </div>
        <p className="text-[12px] text-muted-foreground leading-snug">Daily profit and loss at a glance — tap any day to see your trades.</p>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-0">
        <Tabs defaultValue="month" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="week"  className="flex-1">Week</TabsTrigger>
            <TabsTrigger value="month" className="flex-1">Month</TabsTrigger>
            <TabsTrigger value="year"  className="flex-1">Year</TabsTrigger>
            <TabsTrigger value="all"   className="flex-1">All time</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-4 mt-0">
            <WeekView onDayTap={handleWeekDayTap} />
          </TabsContent>

          <TabsContent value="month" className="space-y-4 mt-0">
            <NavHeader label={monthLabel} onPrev={() => setMonthOffset((p) => p - 1)} onNext={() => setMonthOffset((p) => p + 1)} canPrev={canPrev} canNext={canNext} />
            <PnlStats days={monthDays} />
            <MonthGrid monthKey={monthKey} year={year} monthIndex={monthIndex} isCurrentMonth={isCurrentMonth} onDayTap={handleMonthDayTap} />
          </TabsContent>

          <TabsContent value="year" className="space-y-4 mt-0">
            <YearView onMonthTap={handleMonthTap} />
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-0">
            <AllTimeView onTap={handleAllTimeTap} />
          </TabsContent>
        </Tabs>
      </CardContent>

      {selection && (
        <PeriodDetailSheet selection={selection} onClose={() => setSelection(null)} />
      )}
    </Card>
  );
}
