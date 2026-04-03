"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

// ---- Types ----
interface DividendDay {
  day: string;
  date: number;
  count: number;
}

interface DividendEvent {
  symbol: string;
  name: string;
  logoColor: string;
  dividendAmount: number;
  yield: number;
  frequency: "Quarterly" | "Monthly" | "Semi-Annual" | "Annual";
  payDate: string;
}

// ---- Mock Data ----
const DIVIDEND_DAYS: DividendDay[] = [
  { day: "MON", date: 17, count: 8 },
  { day: "TUE", date: 18, count: 14 },
  { day: "WED", date: 19, count: 22 },
  { day: "THU", date: 20, count: 11 },
  { day: "FRI", date: 21, count: 6 },
];

const DIVIDEND_EVENTS: Record<number, DividendEvent[]> = {
  17: [
    { symbol: "KO", name: "Coca-Cola", logoColor: "bg-red-600", dividendAmount: 0.485, yield: 3.12, frequency: "Quarterly", payDate: "Apr 1" },
    { symbol: "JNJ", name: "Johnson & Johnson", logoColor: "bg-red-500", dividendAmount: 1.24, yield: 3.08, frequency: "Quarterly", payDate: "Apr 8" },
    { symbol: "O", name: "Realty Income", logoColor: "bg-blue-700", dividendAmount: 0.263, yield: 5.42, frequency: "Monthly", payDate: "Apr 15" },
  ],
  18: [
    { symbol: "PG", name: "Procter & Gamble", logoColor: "bg-blue-600", dividendAmount: 1.006, yield: 2.38, frequency: "Quarterly", payDate: "Apr 15" },
    { symbol: "XOM", name: "ExxonMobil", logoColor: "bg-red-700", dividendAmount: 0.95, yield: 3.45, frequency: "Quarterly", payDate: "Apr 10" },
    { symbol: "ABBV", name: "AbbVie", logoColor: "bg-indigo-600", dividendAmount: 1.55, yield: 3.72, frequency: "Quarterly", payDate: "Apr 15" },
    { symbol: "MAIN", name: "Main Street Capital", logoColor: "bg-emerald-600", dividendAmount: 0.235, yield: 6.18, frequency: "Monthly", payDate: "Apr 15" },
  ],
  19: [
    { symbol: "MO", name: "Altria Group", logoColor: "bg-amber-700", dividendAmount: 1.02, yield: 8.41, frequency: "Quarterly", payDate: "Apr 30" },
    { symbol: "T", name: "AT&T", logoColor: "bg-sky-600", dividendAmount: 0.278, yield: 6.52, frequency: "Quarterly", payDate: "May 1" },
    { symbol: "VZ", name: "Verizon", logoColor: "bg-red-600", dividendAmount: 0.665, yield: 6.78, frequency: "Quarterly", payDate: "May 1" },
    { symbol: "STAG", name: "STAG Industrial", logoColor: "bg-slate-600", dividendAmount: 0.123, yield: 4.12, frequency: "Monthly", payDate: "Apr 15" },
  ],
  20: [
    { symbol: "PEP", name: "PepsiCo", logoColor: "bg-blue-600", dividendAmount: 1.355, yield: 2.72, frequency: "Quarterly", payDate: "Apr 30" },
    { symbol: "HD", name: "Home Depot", logoColor: "bg-orange-600", dividendAmount: 2.25, yield: 2.48, frequency: "Quarterly", payDate: "Apr 17" },
  ],
  21: [
    { symbol: "MSFT", name: "Microsoft", logoColor: "bg-blue-500", dividendAmount: 0.83, yield: 0.72, frequency: "Quarterly", payDate: "May 8" },
    { symbol: "AVGO", name: "Broadcom", logoColor: "bg-red-600", dividendAmount: 5.25, yield: 1.24, frequency: "Quarterly", payDate: "Apr 30" },
  ],
};

export function DividendCalendar() {
  const [weekLabel, setWeekLabel] = useState("This Week");
  const [activeDate, setActiveDate] = useState(DIVIDEND_DAYS[2].date); // Wed

  const events = DIVIDEND_EVENTS[activeDate] || [];

  const switchWeek = (dir: number) => {
    if (dir > 0) setWeekLabel("Next Week");
    else setWeekLabel("This Week");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Coins size={20} className="text-foreground" />
          <span className="text-[15px] font-bold text-foreground">
            Dividend Calendar
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => switchWeek(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 text-muted-foreground active:bg-muted"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 text-[12px] font-semibold text-foreground">
            {weekLabel}
          </span>
          <button
            onClick={() => switchWeek(1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 text-muted-foreground active:bg-muted"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day Strip */}
      <div className="flex border-t border-b border-border/30">
        {DIVIDEND_DAYS.map((d) => (
          <button
            key={d.date}
            onClick={() => setActiveDate(d.date)}
            className={cn(
              "flex flex-1 flex-col items-center py-2.5 transition-colors",
              activeDate === d.date
                ? "bg-foreground"
                : "bg-transparent"
            )}
          >
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide",
                activeDate === d.date
                  ? "text-background/70"
                  : "text-muted-foreground"
              )}
            >
              {d.day}
            </span>
            <span
              className={cn(
                "mt-0.5 text-[12px] font-bold",
                activeDate === d.date
                  ? "text-background"
                  : "text-foreground"
              )}
            >
              {d.date}
            </span>
            <span
              className={cn(
                "text-[9px]",
                activeDate === d.date
                  ? "text-background/60"
                  : "text-muted-foreground/60"
              )}
            >
              {d.count}
            </span>
          </button>
        ))}
      </div>

      {/* Event List */}
      <div>
        {events.length === 0 ? (
          <div className="px-5 py-6 text-center text-[13px] text-muted-foreground/50">
            No ex-dividend dates on this day
          </div>
        ) : (
          events.map((e) => (
            <div
              key={e.symbol}
              className="flex items-center border-b border-border/20 px-5 py-3 last:border-b-0"
            >
              <div className="h-9 w-9 shrink-0 rounded-[10px] bg-muted" />
              <div className="ml-3 flex-1">
                <div className="text-[14px] font-semibold text-foreground">
                  {e.name}
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {e.symbol}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[13px] font-semibold tabular-nums text-foreground">
                    {e.dividendAmount.toFixed(3)}
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums text-gain">
                    {e.yield.toFixed(2)}%
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Pay: {e.payDate} · {e.frequency}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/30 px-5 py-2.5 text-[10px] text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">
            {DIVIDEND_DAYS.reduce((s, d) => s + d.count, 0)}
          </span>{" "}
          ex-div dates this week
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gain" />
            Quarterly
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
            Monthly
          </div>
        </div>
      </div>
    </div>
  );
}
