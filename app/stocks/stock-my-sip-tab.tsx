"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type SipFilter = "active" | "paused" | "deleted";

interface SipOrder {
  id: string;
  symbol: string;
  frequency: string;
  amount: number;
  nextLabel: string;
  progress: number; // 0–1 for the ring indicator
  filter: SipFilter;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function buildSips(symbol: string): SipOrder[] {
  return [
    // ── Active ──
    {
      id: "s1", symbol, filter: "active",
      frequency: "Daily Monday to Friday",
      amount: 50, nextLabel: "Today",       progress: 1.0,
    },
    {
      id: "s2", symbol, filter: "active",
      frequency: "Weekly on Monday",
      amount: 100, nextLabel: "2 Days Left", progress: 0.57,
    },
    {
      id: "s3", symbol, filter: "active",
      frequency: "Monthly on 10th",
      amount: 200, nextLabel: "20 Days Left", progress: 0.33,
    },
    // ── Paused ──
    {
      id: "p1", symbol, filter: "paused",
      frequency: "Weekly on Friday",
      amount: 75, nextLabel: "Paused",       progress: 0.4,
    },
    {
      id: "p2", symbol, filter: "paused",
      frequency: "Monthly on 1st",
      amount: 150, nextLabel: "Paused",      progress: 0.1,
    },
    // ── Deleted ──
    {
      id: "d1", symbol, filter: "deleted",
      frequency: "Daily Monday to Friday",
      amount: 25, nextLabel: "Deleted",      progress: 0.0,
    },
  ];
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({
  progress,
  size = 34,
  strokeWidth = 3,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * Math.min(1, Math.max(0, progress));
  const gap = circumference - filled;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
      className="shrink-0"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.12}
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      {progress > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.85}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
        />
      )}
    </svg>
  );
}

// ─── Segmented Control ────────────────────────────────────────────────────────

function SegmentedControl({
  value,
  onChange,
}: {
  value: SipFilter;
  onChange: (v: SipFilter) => void;
}) {
  const tabs: { key: SipFilter; label: string }[] = [
    { key: "active",  label: "Active"  },
    { key: "paused",  label: "Paused"  },
    { key: "deleted", label: "Deleted" },
  ];

  return (
    <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "relative flex-1 py-2.5 rounded-[8px] text-[14px] font-semibold transition-all duration-200",
            value === key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── SIP Card ────────────────────────────────────────────────────────────────

function SipCard({
  sip,
  filter,
}: {
  sip: SipOrder;
  filter: SipFilter;
}) {
  const isDeleted = filter === "deleted";
  const isPaused  = filter === "paused";

  return (
    <div
      className={cn(
        "w-full rounded-xl border bg-background px-4 py-3 flex items-center justify-between",
        isDeleted ? "border-border/30 opacity-50" : "border-border/40"
      )}
    >
      {/* Left: ring + symbol + frequency */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          isPaused ? "text-muted-foreground/40" : "text-foreground"
        )}>
          <ProgressRing progress={sip.progress} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[14px] font-bold text-foreground leading-snug truncate">
            {sip.symbol}
          </span>
          <span className="text-[12px] text-muted-foreground truncate max-w-[160px]">
            {sip.frequency}
          </span>
        </div>
      </div>

      {/* Right: amount + next label */}
      <div className="flex flex-col gap-0.5 items-end shrink-0 ml-3">
        <span className="text-[14px] font-bold text-foreground tabular-nums">
          ${sip.amount}
        </span>
        <span className={cn(
          "text-[12px] tabular-nums",
          sip.nextLabel === "Today"
            ? "text-gain font-medium"
            : isDeleted || isPaused
            ? "text-muted-foreground"
            : "text-muted-foreground"
        )}>
          {sip.nextLabel}
        </span>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: SipFilter }) {
  const msgs: Record<SipFilter, string> = {
    active:  "No active SIPs right now.",
    paused:  "No paused SIPs.",
    deleted: "No deleted SIPs.",
  };
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <p className="text-[15px] font-semibold text-foreground/50">{msgs[filter]}</p>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function StockMySipTab({ symbol }: { symbol: string }) {
  const [filter, setFilter] = useState<SipFilter>("active");

  const allSips = buildSips(symbol);
  const sips = allSips.filter((s) => s.filter === filter);

  const countLabel: Record<SipFilter, string> = {
    active:  `${sips.length} Active SIP${sips.length !== 1 ? "s" : ""}`,
    paused:  `${sips.length} Paused SIP${sips.length !== 1 ? "s" : ""}`,
    deleted: `${sips.length} Deleted SIP${sips.length !== 1 ? "s" : ""}`,
  };

  return (
    <div className="px-4 pt-5 pb-8 flex flex-col gap-5">
      {/* Description */}
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        Manage and track all your {symbol} SIP orders effortlessly.
      </p>

      {/* Segmented control */}
      <SegmentedControl value={filter} onChange={setFilter} />

      {/* Count row */}
      {sips.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-muted-foreground">
            {countLabel[filter]}
          </span>
          <button className="flex items-center gap-1 text-[14px] font-medium text-muted-foreground active:opacity-50 transition-opacity">
            Upcoming
            <ChevronDown size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* SIP list */}
      {sips.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="flex flex-col gap-3">
          {sips.map((sip) => (
            <SipCard key={sip.id} sip={sip} filter={filter} />
          ))}
        </div>
      )}
    </div>
  );
}
