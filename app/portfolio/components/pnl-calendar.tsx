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
import { PNL_CALENDAR, PNL_MONTHLY_GOAL, type DayPnL } from "./portfolio-mock-data";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const TODAY = 24; // March 24, 2026

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
        "font-bold tabular-nums",
        value >= 0 ? "text-gain" : "text-loss",
        className
      )}
    >
      {formatPnL(value)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary cards                                                      */
/* ------------------------------------------------------------------ */

function SummaryCards({ totalPnL, goal }: { totalPnL: number; goal: number }) {
  const goalProgress = Math.min((Math.abs(totalPnL) / goal) * 100, 100);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="shadow-none bg-card border-border/30">
        <CardContent className="p-3.5">
          <p className="text-[12px] text-muted-foreground mb-1">Total P&L</p>
          <PnlValue value={totalPnL} className="text-[22px] leading-tight" />
        </CardContent>
      </Card>
      <Card className="shadow-none bg-card border-border/30">
        <CardContent className="p-3.5">
          <p className="text-[12px] text-muted-foreground mb-1">Monthly goal</p>
          <div className="h-2 rounded-full bg-muted/40 overflow-hidden mb-1.5 mt-2">
            <div
              className="h-full rounded-full bg-gain transition-all"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span
              className={cn(
                "text-[12px] font-medium tabular-nums",
                totalPnL >= 0 ? "text-gain" : "text-loss"
              )}
            >
              {Math.abs(Math.round(totalPnL)).toLocaleString("en-US")}
            </span>
            <span className="text-[12px] text-muted-foreground tabular-nums">
              {goal.toLocaleString("en-US")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Day cell                                                           */
/* ------------------------------------------------------------------ */

/** Map P&L value to a pastel background color with intensity based on magnitude.
 *  Small gains/losses → very light pastel, large → deeper pastel.
 *  Green spectrum: hsl(145, 40-60%, 85-35%)
 *  Red spectrum:   hsl(0, 40-60%, 85-35%)
 */
function pnlBgStyle(pnl: number): React.CSSProperties {
  const abs = Math.abs(pnl);
  // Clamp intensity: 0 at 0, 1 at ~300+
  const t = Math.min(abs / 300, 1);
  const hue = pnl >= 0 ? 145 : 0;
  // Saturation: 30% (faint) → 55% (rich pastel)
  const sat = 30 + t * 25;
  // Lightness: 88% (very light) → 28% (deep pastel)
  const light = 88 - t * 60;
  // Opacity ramp so small values are subtle
  const alpha = 0.35 + t * 0.65;
  return { backgroundColor: `hsla(${hue}, ${sat}%, ${light}%, ${alpha})` };
}

function DayCell({ day, isToday }: { day: DayPnL; isToday: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg p-1.5 flex flex-col items-center justify-center min-h-[68px]",
        !day.isTrading && "bg-muted/20",
        isToday && "ring-1.5 ring-foreground/50"
      )}
      style={day.isTrading ? pnlBgStyle(day.pnl) : undefined}
    >
      <span className="text-[14px] font-semibold text-foreground/80 tabular-nums mb-0.5">
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
/*  Month grid view                                                    */
/* ------------------------------------------------------------------ */

function MonthGrid({
  monthKey,
  monthIndex,
  isCurrentMonth,
}: {
  monthKey: string;
  monthIndex: number;
  isCurrentMonth: boolean;
}) {
  const monthData = PNL_CALENDAR[monthKey];
  if (!monthData) return null;

  // Build 5-column grid cells (Mon-Fri only)
  const gridCells: (DayPnL | null)[] = [];

  // firstWeekday: 0=Mon..4=Fri, 5=Sat, 6=Sun
  // If the 1st falls on a weekend, 0 leading blanks (first Mon is day 2 or 3)
  const leadingBlanks = monthData.firstWeekday >= 5 ? 0 : monthData.firstWeekday;
  for (let i = 0; i < leadingBlanks; i++) gridCells.push(null);

  for (const day of monthData.days) {
    const dow = new Date(2026, monthIndex, day.date).getDay();
    if (dow >= 1 && dow <= 5) gridCells.push(day);
  }

  return (
    <>
      {/* Weekday headers */}
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

      {/* Calendar grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {gridCells.map((cell, i) => {
          if (!cell) {
            return <div key={`blank-${i}`} className="min-h-[68px]" />;
          }
          const isToday = isCurrentMonth && cell.date === TODAY;
          return <DayCell key={cell.date} day={cell} isToday={isToday} />;
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Week view                                                          */
/* ------------------------------------------------------------------ */

function WeekView() {
  // Show current week (Mar 23-27, 2026 = Mon-Fri around today Mar 24)
  const monthData = PNL_CALENDAR["2026-03"];
  if (!monthData) return null;

  // Current week: Mon Mar 23 to Fri Mar 27
  const weekDays = monthData.days.filter((d) => {
    const dow = new Date(2026, 2, d.date).getDay();
    return d.date >= 23 && d.date <= 27 && dow >= 1 && dow <= 5;
  });

  const weekTotal = weekDays.reduce((s, d) => s + d.pnl, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-muted-foreground">Mar 23 – Mar 27</p>
        <PnlValue value={weekTotal} className="text-[16px]" />
      </div>

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
        {weekDays.map((day) => (
          <DayCell key={day.date} day={day} isToday={day.date === TODAY} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Year view                                                          */
/* ------------------------------------------------------------------ */

function YearView() {
  // Show monthly P&L summaries for available months + mock rest of year
  const monthlyData = [
    { month: 0, pnl: 1842, trades: 34 },
    { month: 1, pnl: -620, trades: 28 },
    { month: 2, pnl: 0, trades: 0 }, // will be computed from actual data
    { month: 3, pnl: 0, trades: 0 },
    { month: 4, pnl: 0, trades: 0 },
    { month: 5, pnl: 0, trades: 0 },
    { month: 6, pnl: 0, trades: 0 },
    { month: 7, pnl: 0, trades: 0 },
    { month: 8, pnl: 0, trades: 0 },
    { month: 9, pnl: 0, trades: 0 },
    { month: 10, pnl: 0, trades: 0 },
    { month: 11, pnl: 0, trades: 0 },
  ];

  // Compute actual months from data
  for (const [key, data] of Object.entries(PNL_CALENDAR)) {
    const [, monthStr] = key.split("-");
    const mi = parseInt(monthStr, 10) - 1;
    const trading = data.days.filter((d) => d.isTrading);
    monthlyData[mi] = {
      month: mi,
      pnl: trading.reduce((s, d) => s + d.pnl, 0),
      trades: trading.reduce((s, d) => s + d.trades, 0),
    };
  }

  const ytd = monthlyData.reduce((s, m) => s + m.pnl, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-muted-foreground">2026 YTD</p>
        <PnlValue value={ytd} className="text-[16px]" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {monthlyData.map((m) => {
          const hasData = m.trades > 0;

          return (
            <div
              key={m.month}
              className={cn(
                "rounded-lg p-3 flex flex-col items-center justify-center min-h-[72px]",
                !hasData && "bg-muted/10"
              )}
              style={hasData ? pnlBgStyle(m.pnl / 5) : undefined}
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
  // Aggregate all available data
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
              <span className="text-[17px] font-bold tabular-nums text-foreground">
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

  const monthKey = monthOffset === 0 ? "2026-03" : "2026-02";
  const monthData = PNL_CALENDAR[monthKey];
  const monthIndex = monthOffset === 0 ? 2 : 1;

  const monthLabel = `${MONTH_NAMES_FULL[monthIndex]} 2026`;

  const totalPnL = useMemo(() => {
    if (!monthData) return 0;
    return monthData.days
      .filter((d) => d.isTrading)
      .reduce((sum, d) => sum + d.pnl, 0);
  }, [monthData]);

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
            <SummaryCards totalPnL={totalPnL} goal={PNL_MONTHLY_GOAL} />
            <WeekView />
          </TabsContent>

          {/* ── Month ── */}
          <TabsContent value="month" className="space-y-4 mt-0">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setMonthOffset((p) => Math.max(p - 1, -1))}
                disabled={monthOffset <= -1}
              >
                <ChevronLeft size={18} />
              </Button>
              <span className="text-[16px] font-semibold text-foreground">
                {monthLabel}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setMonthOffset((p) => Math.min(p + 1, 0))}
                disabled={monthOffset >= 0}
              >
                <ChevronRight size={18} />
              </Button>
            </div>

            <SummaryCards totalPnL={totalPnL} goal={PNL_MONTHLY_GOAL} />

            <MonthGrid
              monthKey={monthKey}
              monthIndex={monthIndex}
              isCurrentMonth={monthOffset === 0}
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
