"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PNL_CALENDAR, type DayPnL } from "./portfolio-mock-data";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPnL(value: number): string {
  const abs = Math.abs(Math.round(value));
  return `${value >= 0 ? "+" : "-"}${abs.toLocaleString("en-US")}`;
}

function PnlValue({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        "font-bold",
        value >= 0 ? "text-gain" : "text-loss",
        className
      )}
    >
      {formatPnL(value)}
    </span>
  );
}

/** Neutral background with subtle opacity based on magnitude */
function pnlBgClass(pnl: number): string {
  if (pnl >= 0) return "bg-foreground/[0.04]";
  return "bg-foreground/[0.04]";
}

/* ------------------------------------------------------------------ */
/*  P&L Stats row (P&L, Total Trades, Win Rate)                        */
/* ------------------------------------------------------------------ */

function PnlStats({ days }: { days: DayPnL[] }) {
  const trading = days.filter((d) => d.isTrading);
  const totalPnl = trading.reduce((s, d) => s + d.pnl, 0);
  const totalTrades = trading.reduce((s, d) => s + d.trades, 0);
  const greenDays = trading.filter((d) => d.pnl >= 0).length;
  const winRate = trading.length > 0 ? Math.round((greenDays / trading.length) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <p className="text-[12px] text-muted-foreground mb-0.5">P&L</p>
        <PnlValue value={totalPnl} className="text-[18px] leading-tight" />
      </div>
      <div>
        <p className="text-[12px] text-muted-foreground mb-0.5">Trades</p>
        <span className="text-[18px] font-bold text-foreground">{totalTrades}</span>
      </div>
      <div>
        <p className="text-[12px] text-muted-foreground mb-0.5">Win Rate</p>
        <span className="text-[18px] font-bold text-foreground">{winRate}%</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Day cell                                                           */
/* ------------------------------------------------------------------ */

function DayCell({ day, isToday }: { day: DayPnL; isToday: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg p-1.5 flex flex-col items-center justify-center min-h-[68px]",
        day.isTrading ? pnlBgClass(day.pnl) : "bg-muted/10",
        isToday && "ring-1.5 ring-foreground/50"
      )}
    >
      <span className="text-[14px] font-semibold text-foreground/80 mb-0.5">
        {day.date}
      </span>

      {day.isTrading ? (
        <>
          <PnlValue value={day.pnl} className="text-[13px] leading-tight" />
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {day.trades} trade{day.trades !== 1 ? "s" : ""}
          </span>
        </>
      ) : (
        <span className="text-[13px] text-muted-foreground">—</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navigation header (reusable)                                       */
/* ------------------------------------------------------------------ */

function NavHeader({
  label,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={!canPrev}
        className="h-8 w-8"
      >
        <ChevronLeft size={18} />
      </Button>
      <span className="text-[15px] font-semibold text-foreground">{label}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!canNext}
        className="h-8 w-8"
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Month grid view                                                    */
/* ------------------------------------------------------------------ */

function MonthGrid({
  monthKey,
  year,
  monthIndex,
  isCurrentMonth,
}: {
  monthKey: string;
  year: number;
  monthIndex: number;
  isCurrentMonth: boolean;
}) {
  const monthData = PNL_CALENDAR[monthKey];
  if (!monthData) return null;

  const gridCells: (DayPnL | null)[] = [];
  const leadingBlanks = monthData.firstWeekday >= 5 ? 0 : monthData.firstWeekday;
  for (let i = 0; i < leadingBlanks; i++) gridCells.push(null);

  for (const day of monthData.days) {
    const dow = new Date(year, monthIndex, day.date).getDay();
    if (dow >= 1 && dow <= 5) gridCells.push(day);
  }

  const today = new Date();
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  return (
    <>
      <div className="grid grid-cols-5 gap-1.5 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-semibold text-muted-foreground tracking-wider py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {gridCells.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} className="min-h-[68px]" />;
          return <DayCell key={cell.date} day={cell} isToday={cell.date === todayDate} />;
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Week view (with navigation)                                        */
/* ------------------------------------------------------------------ */

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function formatShortDate(d: Date): string {
  return `${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function WeekView() {
  const [weekOffset, setWeekOffset] = useState(0);

  const currentMonday = useMemo(() => {
    const mon = getMonday(new Date());
    mon.setDate(mon.getDate() + weekOffset * 7);
    return mon;
  }, [weekOffset]);

  const friday = useMemo(() => {
    const f = new Date(currentMonday);
    f.setDate(f.getDate() + 4);
    return f;
  }, [currentMonday]);

  const weekLabel = `${formatShortDate(currentMonday)} – ${formatShortDate(friday)}`;

  // Get the days for this week
  const weekDays = useMemo(() => {
    const days: DayPnL[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(currentMonday);
      d.setDate(d.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthData = PNL_CALENDAR[key];
      if (monthData) {
        const dayData = monthData.days.find((dd) => dd.date === d.getDate());
        if (dayData) {
          days.push(dayData);
          continue;
        }
      }
      days.push({ date: d.getDate(), pnl: 0, trades: 0, isTrading: false });
    }
    return days;
  }, [currentMonday]);

  const todayDate = new Date().getDate();
  const isCurrentWeek = weekOffset === 0;

  // Limit how far back (oldest data is Jan 2024)
  const earliestMonday = getMonday(new Date(2024, 0, 1));
  const canPrev = currentMonday > earliestMonday;
  const canNext = weekOffset < 0;

  return (
    <div className="space-y-3">
      <NavHeader
        label={weekLabel}
        onPrev={() => setWeekOffset((p) => p - 1)}
        onNext={() => setWeekOffset((p) => p + 1)}
        canPrev={canPrev}
        canNext={canNext}
      />

      <PnlStats days={weekDays} />

      <div className="grid grid-cols-5 gap-1.5 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-semibold text-muted-foreground tracking-wider py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {weekDays.map((day, i) => (
          <DayCell key={i} day={day} isToday={isCurrentWeek && day.date === todayDate} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Year view (with navigation)                                        */
/* ------------------------------------------------------------------ */

function YearView() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const isCurrentYear = year === currentYear;
  const currentMonth = isCurrentYear ? new Date().getMonth() : 11;

  const monthlyData = useMemo(() => {
    const data = [];
    const monthCount = isCurrentYear ? currentMonth + 1 : 12;
    for (let m = 0; m < monthCount; m++) {
      const key = `${year}-${String(m + 1).padStart(2, "0")}`;
      const monthData = PNL_CALENDAR[key];
      if (monthData) {
        const trading = monthData.days.filter((d) => d.isTrading);
        data.push({
          month: m,
          pnl: trading.reduce((s, d) => s + d.pnl, 0),
          trades: trading.reduce((s, d) => s + d.trades, 0),
        });
      } else {
        data.push({ month: m, pnl: 0, trades: 0 });
      }
    }
    return data;
  }, [year, isCurrentYear, currentMonth]);

  // Collect all days for PnlStats
  const yearDays = useMemo(() => {
    const days: DayPnL[] = [];
    const monthCount = isCurrentYear ? currentMonth + 1 : 12;
    for (let m = 0; m < monthCount; m++) {
      const key = `${year}-${String(m + 1).padStart(2, "0")}`;
      const monthData = PNL_CALENDAR[key];
      if (monthData) days.push(...monthData.days);
    }
    return days;
  }, [year, isCurrentYear, currentMonth]);

  const canPrev = year > 2024;
  const canNext = year < currentYear;

  return (
    <div className="space-y-3">
      <NavHeader
        label={isCurrentYear ? `${year} YTD` : `${year}`}
        onPrev={() => setYear((y) => y - 1)}
        onNext={() => setYear((y) => y + 1)}
        canPrev={canPrev}
        canNext={canNext}
      />

      <PnlStats days={yearDays} />

      <div className="grid grid-cols-3 gap-2">
        {monthlyData.map((m) => {
          const hasData = m.trades > 0;
          return (
            <div
              key={m.month}
              className={cn(
                "rounded-lg p-3 flex flex-col items-center justify-center min-h-[72px]",
                hasData ? "bg-foreground/[0.04]" : "bg-muted/10"
              )}
            >
              <span className="text-[13px] font-semibold text-foreground/80 mb-0.5">
                {MONTH_NAMES_SHORT[m.month]}
              </span>
              {hasData ? (
                <>
                  <PnlValue value={m.pnl} className="text-[14px] leading-tight" />
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {m.trades} trades
                  </span>
                </>
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
/*  All Time view                                                      */
/* ------------------------------------------------------------------ */

function AllTimeView() {
  let totalPnl = 0;
  let totalTrades = 0;
  let greenDays = 0;
  let redDays = 0;
  let bestDay = 0;
  let worstDay = 0;

  for (const data of Object.values(PNL_CALENDAR)) {
    for (const d of data.days) {
      if (!d.isTrading) continue;
      totalPnl += d.pnl;
      totalTrades += d.trades;
      if (d.pnl >= 0) greenDays++;
      else redDays++;
      if (d.pnl > bestDay) bestDay = d.pnl;
      if (d.pnl < worstDay) worstDay = d.pnl;
    }
  }

  const winRate = greenDays + redDays > 0
    ? Math.round((greenDays / (greenDays + redDays)) * 100)
    : 0;

  const stats = [
    { label: "Total P&L", value: totalPnl, isPnl: true },
    { label: "Total Trades", value: totalTrades, isPnl: false },
    { label: "Green Days", value: greenDays, isPnl: false },
    { label: "Red Days", value: redDays, isPnl: false },
    { label: "Win Rate", value: winRate, isPnl: false, suffix: "%" },
    { label: "Best Day", value: bestDay, isPnl: true },
    { label: "Worst Day", value: worstDay, isPnl: true },
    { label: "Avg / Day", value: totalPnl / (greenDays + redDays || 1), isPnl: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((s) => (
        <Card key={s.label} className="shadow-none border-border/30">
          <CardContent className="p-3">
            <p className="text-[12px] text-muted-foreground mb-0.5">
              {s.label}
            </p>
            {s.isPnl ? (
              <PnlValue value={s.value} className="text-[17px]" />
            ) : (
              <span className="text-[17px] font-bold text-foreground">
                {Math.round(s.value).toLocaleString("en-US")}
                {s.suffix || ""}
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

  // monthOffset: 0 = current month (Mar 2026), -1 = Feb 2026, etc.
  const targetDate = useMemo(() => {
    const d = new Date(2026, 2, 1); // March 2026
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const year = targetDate.getFullYear();
  const monthIndex = targetDate.getMonth();
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const monthLabel = `${MONTH_NAMES_FULL[monthIndex]} ${year}`;

  const isCurrentMonth = monthOffset === 0;

  const monthDays = useMemo(() => {
    const monthData = PNL_CALENDAR[monthKey];
    return monthData?.days ?? [];
  }, [monthKey]);

  // Can go back to Jan 2024, can't go forward past current month
  const canPrev = !(year === 2024 && monthIndex === 0);
  const canNext = monthOffset < 0;

  return (
    <Card className="border-border/50 shadow-none">
      <CardHeader className="p-5 pb-3 space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-foreground" />
          <CardTitle className="text-[15px]">P&L Calendar</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-0">
        <Tabs defaultValue="month" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="week" className="flex-1">Week</TabsTrigger>
            <TabsTrigger value="month" className="flex-1">Month</TabsTrigger>
            <TabsTrigger value="year" className="flex-1">Year</TabsTrigger>
            <TabsTrigger value="all" className="flex-1">All time</TabsTrigger>
          </TabsList>

          {/* ── Week ── */}
          <TabsContent value="week" className="space-y-4 mt-0">
            <WeekView />
          </TabsContent>

          {/* ── Month ── */}
          <TabsContent value="month" className="space-y-4 mt-0">
            <NavHeader
              label={monthLabel}
              onPrev={() => setMonthOffset((p) => p - 1)}
              onNext={() => setMonthOffset((p) => p + 1)}
              canPrev={canPrev}
              canNext={canNext}
            />

            <PnlStats days={monthDays} />

            <MonthGrid
              monthKey={monthKey}
              year={year}
              monthIndex={monthIndex}
              isCurrentMonth={isCurrentMonth}
            />
          </TabsContent>

          {/* ── Year ── */}
          <TabsContent value="year" className="space-y-4 mt-0">
            <YearView />
          </TabsContent>

          {/* ── All time ── */}
          <TabsContent value="all" className="space-y-4 mt-0">
            <AllTimeView />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
