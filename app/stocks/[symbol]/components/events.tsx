"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  GitBranch,
  Users,
  Banknote,
  CalendarCheck,
} from "lucide-react";

interface EventsTabProps {
  symbol: string;
}

interface CorporateEvent {
  id: string;
  month: string;
  day: number;
  title: string;
  subtitle: string;
  type: "earnings" | "split" | "meeting" | "dividend" | "other";
}

interface EventGroup {
  label: string;
  events: CorporateEvent[];
}

const UPCOMING_EVENTS: EventGroup[] = [
  {
    label: "March 2026",
    events: [
      {
        id: "u1",
        month: "Mar",
        day: 18,
        title: "Next Earnings",
        subtitle: "Q1 2026 Earnings Call — Before Market Open",
        type: "earnings",
      },
      {
        id: "u2",
        month: "Mar",
        day: 24,
        title: "Ex-Dividend Date",
        subtitle: "Quarterly dividend of 0.25 per share",
        type: "dividend",
      },
    ],
  },
  {
    label: "April 2026",
    events: [
      {
        id: "u3",
        month: "Apr",
        day: 7,
        title: "Annual Shareholder Meeting",
        subtitle: "Virtual meeting — proxy voting open",
        type: "meeting",
      },
      {
        id: "u4",
        month: "Apr",
        day: 15,
        title: "Stock Split",
        subtitle: "4-for-1 forward stock split",
        type: "split",
      },
    ],
  },
];

const PAST_EVENTS: EventGroup[] = [
  {
    label: "Dec 2025",
    events: [
      {
        id: "p1",
        month: "Dec",
        day: 19,
        title: "Earnings Released",
        subtitle: "Q4 2025 — Beat estimates by 8.2%",
        type: "earnings",
      },
      {
        id: "p2",
        month: "Dec",
        day: 10,
        title: "Ex-Dividend Date",
        subtitle: "Quarterly dividend of 0.24 per share",
        type: "dividend",
      },
    ],
  },
  {
    label: "Sep 2025",
    events: [
      {
        id: "p3",
        month: "Sep",
        day: 22,
        title: "Earnings Released",
        subtitle: "Q3 2025 — Missed estimates by 1.1%",
        type: "earnings",
      },
      {
        id: "p4",
        month: "Sep",
        day: 8,
        title: "Special Shareholder Vote",
        subtitle: "Approved compensation restructuring",
        type: "meeting",
      },
    ],
  },
];

const EVENT_ICON: Record<CorporateEvent["type"], React.ReactNode> = {
  earnings: <BarChart3 size={15} />,
  split: <GitBranch size={15} />,
  meeting: <Users size={15} />,
  dividend: <Banknote size={15} />,
  other: <CalendarCheck size={15} />,
};

const tabs = ["Upcoming", "Past"] as const;
type Tab = (typeof tabs)[number];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function EventsTab({ symbol }: EventsTabProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Upcoming");

  const groups = activeTab === "Upcoming" ? UPCOMING_EVENTS : PAST_EVENTS;

  return (
    <div className="px-4 py-4">
      {/* Heading */}
      <h2 className="mb-4 text-[17px] font-bold text-foreground">
        Corporate Events
      </h2>

      {/* Toggle pills */}
      <div className="mb-5 flex rounded-xl bg-secondary/40 p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "relative flex-1 rounded-lg px-4 py-2 text-[15px] font-medium transition-colors",
              activeTab === tab ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="events-toggle"
                className="absolute inset-0 rounded-lg bg-secondary"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Event groups */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {groups.map((group) => (
          <div key={group.label}>
            {/* Month heading */}
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>

            <div className="space-y-3">
              {group.events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card/60 px-3.5 py-3.5"
                >
                  {/* Date badge */}
                  <div className="flex h-[50px] w-[50px] shrink-0 flex-col items-center justify-center rounded-xl border border-border/60 bg-secondary/50">
                    <span className="text-[11px] font-semibold uppercase leading-none tracking-wide text-muted-foreground">
                      {event.month}
                    </span>
                    <span className="mt-0.5 text-[19px] font-bold leading-none text-foreground">
                      {event.day}
                    </span>
                  </div>

                  {/* Event info */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground/60">
                        {EVENT_ICON[event.type]}
                      </span>
                      <p className="text-[15px] font-semibold text-foreground">
                        {event.title}
                      </p>
                    </div>
                    <p className="mt-1 text-[14px] leading-snug text-muted-foreground">
                      {event.subtitle}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
