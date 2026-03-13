"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { EARNINGS_DAYS, EARNINGS_COMPANIES } from "../data";

export function EarningsCalendar() {
  const [weekLabel, setWeekLabel] = useState("This Week");
  const [activeDate, setActiveDate] = useState(EARNINGS_DAYS[2].date); // Wed

  const companies = EARNINGS_COMPANIES[activeDate] || [];

  const switchWeek = (dir: number) => {
    if (dir > 0) setWeekLabel("Next Week");
    else setWeekLabel("This Week");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <Calendar size={20} className="text-foreground" />
          <span className="text-[15px] font-bold text-foreground">
            Earnings Calendar
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
        {EARNINGS_DAYS.map((d) => (
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

      {/* Company List */}
      <div>
        {companies.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-muted-foreground/50">
            No earnings reports on this day
          </div>
        ) : (
          companies.map((c) => (
            <div
              key={c.symbol}
              className="flex items-center border-b border-border/20 px-4 py-3 last:border-b-0"
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-bold text-white",
                  c.logoColor
                )}
              >
                {c.symbol.slice(0, 2)}
              </div>
              <div className="ml-3 flex-1">
                <div className="text-[14px] font-semibold text-foreground">
                  {c.name}
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {c.symbol}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                  {c.epsEstimate}
                </div>
                <div className="text-[10px] font-medium text-muted-foreground">
                  {c.timing === "BMO" ? "Before Open" : "After Close"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/30 px-4 py-2.5 text-[10px] text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">
            {EARNINGS_DAYS.reduce((s, d) => s + d.count, 0)}
          </span>{" "}
          total this week
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
            BMO
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            AMC
          </div>
        </div>
      </div>
    </div>
  );
}
