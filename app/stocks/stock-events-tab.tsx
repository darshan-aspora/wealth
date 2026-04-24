"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { CalendarPlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type EventFilter = "upcoming" | "past";

interface CorpEvent {
  id: string;
  year: number;
  month: number; // 0-indexed
  day: number;
  type: string;
  subtype: string;
  isPast: boolean;
}

// ─── Mock Event Data ──────────────────────────────────────────────────────────

const EVENTS_BY_SYMBOL: Record<string, CorpEvent[]> = {
  AAPL: [
    { id: "aapl-e1", year: 2026, month: 3, day: 10, type: "Next Earnings",       subtype: "Q2 FY26 Earnings",       isPast: false },
    { id: "aapl-e2", year: 2026, month: 3, day: 10, type: "Ex-Dividend Date",    subtype: "Quarterly Dividend",     isPast: false },
    { id: "aapl-e3", year: 2026, month: 4, day: 22, type: "Shareholder Meeting", subtype: "Annual General Meeting", isPast: false },
    { id: "aapl-e4", year: 2026, month: 6, day: 5,  type: "Earnings",            subtype: "Q3 FY26 Earnings",       isPast: false },
    { id: "aapl-e5", year: 2026, month: 6, day: 18, type: "Ex-Dividend Date",    subtype: "Quarterly Dividend",     isPast: false },
    { id: "aapl-p1", year: 2026, month: 0, day: 30, type: "Earnings",            subtype: "Q1 FY26 Earnings",       isPast: true  },
    { id: "aapl-p2", year: 2025, month: 10, day: 7, type: "Earnings",            subtype: "Q4 FY25 Earnings",       isPast: true  },
    { id: "aapl-p3", year: 2025, month: 9,  day: 2, type: "Shareholder Meeting", subtype: "Annual General Meeting", isPast: true  },
  ],
  NVDA: [
    { id: "nvda-e1", year: 2026, month: 4, day: 28, type: "Next Earnings",       subtype: "Q1 FY27 Earnings",       isPast: false },
    { id: "nvda-e2", year: 2026, month: 5, day: 3,  type: "Shareholder Meeting", subtype: "Annual General Meeting", isPast: false },
    { id: "nvda-e3", year: 2026, month: 7, day: 27, type: "Earnings",            subtype: "Q2 FY27 Earnings",       isPast: false },
    { id: "nvda-p1", year: 2026, month: 1, day: 26, type: "Earnings",            subtype: "Q4 FY26 Earnings",       isPast: true  },
    { id: "nvda-p2", year: 2025, month: 10, day: 20, type: "Earnings",           subtype: "Q3 FY26 Earnings",       isPast: true  },
  ],
  INTC: [
    { id: "intc-e1", year: 2026, month: 3, day: 24, type: "Next Earnings",       subtype: "Q1 FY26 Earnings",       isPast: false },
    { id: "intc-e2", year: 2026, month: 4, day: 15, type: "Ex-Dividend Date",    subtype: "Quarterly Dividend",     isPast: false },
    { id: "intc-e3", year: 2026, month: 6, day: 24, type: "Earnings",            subtype: "Q2 FY26 Earnings",       isPast: false },
    { id: "intc-p1", year: 2026, month: 0, day: 23, type: "Earnings",            subtype: "Q4 FY25 Earnings",       isPast: true  },
  ],
  SNAP: [
    { id: "snap-e1", year: 2026, month: 3, day: 29, type: "Next Earnings",       subtype: "Q1 FY26 Earnings",       isPast: false },
    { id: "snap-e2", year: 2026, month: 6, day: 22, type: "Earnings",            subtype: "Q2 FY26 Earnings",       isPast: false },
    { id: "snap-p1", year: 2026, month: 0, day: 28, type: "Earnings",            subtype: "Q4 FY25 Earnings",       isPast: true  },
  ],
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS  = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function getEventsForSymbol(symbol: string) {
  return EVENTS_BY_SYMBOL[symbol] ?? EVENTS_BY_SYMBOL["AAPL"];
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({ year, month, highlightDay }: { year: number; month: number; highlightDay: number }) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full">
      <p className="text-[13px] font-semibold text-foreground mb-3 text-center">
        {MONTH_NAMES[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-y-1">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-[11px] font-medium text-muted-foreground text-center pb-1">
            {d}
          </span>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center">
            {day != null ? (
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-medium transition-colors",
                  day === highlightDay
                    ? "bg-foreground text-background font-semibold"
                    : "text-foreground"
                )}
              >
                {day}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="fixed bottom-24 left-4 right-4 z-[70] max-w-[398px] mx-auto pointer-events-none"
        >
          <div className="rounded-2xl bg-foreground text-background px-4 py-3.5 shadow-2xl flex items-center gap-3">
            {/* Check circle */}
            <div className="shrink-0 w-[22px] h-[22px] rounded-full bg-background/20 flex items-center justify-center">
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[13px] font-medium leading-snug">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Calendar Bottom Sheet ────────────────────────────────────────────────────

function CalendarSheet({
  event,
  symbol,
  onClose,
  onSave,
}: {
  event: CorpEvent;
  symbol: string;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 max-w-[430px] mx-auto"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto rounded-t-[24px] bg-background pb-8 shadow-xl"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-[36px] rounded-full bg-muted-foreground/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <p className="text-[17px] font-bold text-foreground">Add Event to Calendar</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Event info card */}
        <div className="mx-5 mb-5 rounded-2xl bg-muted/40 border border-border/40 p-4 flex items-center gap-3.5">
          {/* Date badge */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-background border border-border/50 px-3 py-2.5 shrink-0 min-w-[54px]">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {MONTH_SHORT[event.month]}
            </span>
            <span className="text-[24px] font-bold text-foreground leading-none mt-0.5">
              {String(event.day).padStart(2, "0")}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">{event.year}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-foreground leading-snug">{event.type}</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">{event.subtype}</p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                {symbol}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                All Day
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/30 mx-5 mb-5" />

        {/* CTAs */}
        <div className="px-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border-2 border-border/50 text-[15px] font-semibold text-foreground active:scale-[0.98] transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-3.5 rounded-2xl bg-foreground text-background text-[15px] font-semibold active:scale-[0.98] transition-transform"
          >
            Save
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Event Row ────────────────────────────────────────────────────────────────

function EventRow({
  event,
  onAddToCalendar,
}: {
  event: CorpEvent;
  onAddToCalendar: (e: CorpEvent) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Date box */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 px-2.5 py-2 shrink-0 w-[48px]">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wide leading-none">
          {MONTH_SHORT[event.month]}
        </span>
        <span className="text-[16px] font-bold text-foreground leading-tight mt-0.5">
          {String(event.day).padStart(2, "0")}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-foreground leading-snug">{event.type}</p>
        <p className="text-[13px] text-muted-foreground mt-0.5">{event.subtype}</p>
      </div>

      {/* Add to Calendar — upcoming only */}
      {!event.isPast && (
        <button
          onClick={() => onAddToCalendar(event)}
          className="flex items-center gap-1.5 rounded-[6px] border border-border/40 px-2.5 py-1.5 shrink-0 active:bg-muted/40 transition-colors"
        >
          <CalendarPlus size={14} strokeWidth={1.8} className="text-foreground/70" />
          <span className="text-[12px] text-foreground whitespace-nowrap">Add to Calendar</span>
        </button>
      )}
    </div>
  );
}

// ─── Month Group ──────────────────────────────────────────────────────────────

function MonthGroup({
  monthLabel,
  events,
  onAddToCalendar,
}: {
  monthLabel: string;
  events: CorpEvent[];
  onAddToCalendar: (e: CorpEvent) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[16px] font-semibold text-foreground/60 tracking-tight">{monthLabel}</p>
      <div className="flex flex-col gap-4">
        {events.map((ev) => (
          <EventRow key={ev.id} event={ev} onAddToCalendar={onAddToCalendar} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function StockEventsTab({ symbol }: { symbol: string }) {
  const [filter, setFilter] = useState<EventFilter>("upcoming");
  const [calendarEvent, setCalendarEvent] = useState<CorpEvent | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const handleSave = useCallback(() => {
    setCalendarEvent(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3200);
  }, []);

  const allEvents = getEventsForSymbol(symbol);

  const grouped = useMemo(() => {
    const filtered = allEvents.filter((e) =>
      filter === "upcoming" ? !e.isPast : e.isPast
    );
    filtered.sort((a, b) => {
      const da = new Date(a.year, a.month, a.day).getTime();
      const db = new Date(b.year, b.month, b.day).getTime();
      return filter === "upcoming" ? da - db : db - da;
    });
    const map = new Map<string, CorpEvent[]>();
    for (const ev of filtered) {
      const key = `${MONTH_NAMES[ev.month]} ${ev.year}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [allEvents, filter]);

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-[20px] font-bold text-foreground tracking-tight">Corporate Events</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Track key company events like earnings, dividends, and announcements.
          Stay updated on events that can impact the stock price.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-5 pb-5">
        {(["upcoming", "past"] as EventFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "h-9 rounded-full px-3.5 text-[14px] transition-colors border capitalize",
              filter === f
                ? "border-foreground text-foreground font-medium"
                : "border-border/50 text-muted-foreground"
            )}
          >
            {f === "upcoming" ? "Upcoming Events" : "Past Events"}
          </button>
        ))}
      </div>

      {/* Events grouped by month */}
      <div className="px-5 flex flex-col gap-8">
        {grouped.size === 0 ? (
          <p className="text-[14px] text-muted-foreground py-8 text-center">No events found.</p>
        ) : (
          Array.from(grouped.entries()).map(([label, events]) => (
            <MonthGroup
              key={label}
              monthLabel={label}
              events={events}
              onAddToCalendar={setCalendarEvent}
            />
          ))
        )}
      </div>

      {/* Calendar bottom sheet */}
      <AnimatePresence>
        {calendarEvent && (
          <CalendarSheet
            event={calendarEvent}
            symbol={symbol}
            onClose={() => setCalendarEvent(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <Toast
        message="Event has been added to your Google Calendar"
        visible={toastVisible}
      />
    </div>
  );
}
