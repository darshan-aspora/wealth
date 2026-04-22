"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Clock, Plus, LogOut, ArrowRight, AlertTriangle, X, ChevronRight } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type OpenStatus =
  | "open"           // fully filled, active
  | "partial_fill"   // partially filled — some qty pending
  | "pending";       // placed, zero fills yet

type CloseReason =
  | "manual"
  | "partial_close"    // only some qty closed, rest still open
  | "expired"
  | "expired_worthless"
  | "stop_loss"
  | "target_hit"
  | "squared_off";

interface OpenPosition {
  symbol: string;
  expiry?: string;
  type?: "CALL" | "PUT";
  tag?: "ETF";
  side: "B" | "S";
  lots?: number;
  orderedQty: number;    // total qty ordered
  filledQty: number;     // qty actually filled (< orderedQty if partial)
  avgPrice: number;
  ltp: number;
  ltpChangePct: number;
  pnl: number;
  status: OpenStatus;
  daysToExpiry?: number;
}

interface ClosedPosition {
  symbol: string;
  expiry?: string;
  type?: "CALL" | "PUT";
  closedQty: number;
  totalQty: number;      // original position size (> closedQty if partial close)
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  reason: CloseReason;
  date?: string;         // e.g. "March 29"
}

/* ------------------------------------------------------------------ */
/*  Mock data — one example per scenario                               */
/* ------------------------------------------------------------------ */

const OPEN: OpenPosition[] = [
  // 1. Fully open, near expiry (2 days)
  { symbol: "AAPL", expiry: "19 APR 27", type: "CALL", side: "B", lots: 1, orderedQty: 25, filledQty: 25, avgPrice: 2.30,   ltp: 5.85,   ltpChangePct: 154.3, pnl:  1_065, status: "open",         daysToExpiry: 2 },
  // 2. Fully open, expiring today
  { symbol: "TSLA", expiry: "22 APR 26", type: "PUT",  side: "S", lots: 1, orderedQty: 20, filledQty: 20, avgPrice: 10.54,  ltp: 10.80,  ltpChangePct:   3.0, pnl:    400, status: "open",         daysToExpiry: 0 },
  // 3. Partially filled — 15 of 25 lots filled
  { symbol: "META",                                     side: "S",          orderedQty: 25, filledQty: 15, avgPrice: 264,    ltp: 293,    ltpChangePct:  12.0, pnl: 175_000, status: "partial_fill"                  },
  // 4. Pending — no fills yet
  { symbol: "QQQ",  tag: "ETF",                         side: "B",          orderedQty: 50, filledQty: 0,  avgPrice: 390.20, ltp: 409.75, ltpChangePct:   5.0, pnl:      0,  status: "pending"                       },
  // 5. Fully open, normal
  { symbol: "NVDA",                                     side: "B",          orderedQty: 10, filledQty: 10, avgPrice: 820.50, ltp: 875.20, ltpChangePct:   2.1, pnl:    547, status: "open"                          },
];

const CLOSED: ClosedPosition[] = [
  // 1. Manually closed
  { symbol: "AAPL", expiry: "19 APR 27", type: "CALL", closedQty: 50,      totalQty: 50,      entryPrice: 244, exitPrice: 264, pnl:  1_000, reason: "manual"           },
  // 2. Partially closed — closed 20 of 50
  { symbol: "META",                                     closedQty: 20,      totalQty: 50,      entryPrice: 244, exitPrice: 278, pnl:    680, reason: "partial_close"    },
  // 3. Stop loss triggered
  { symbol: "TSLA", expiry: "27 APR 12", type: "PUT",  closedQty: 20,      totalQty: 20,      entryPrice: 244, exitPrice: 218, pnl: -1_000, reason: "stop_loss"        },
  // 4. Target hit
  { symbol: "NVDA",                                     closedQty: 10,      totalQty: 10,      entryPrice: 820, exitPrice: 920, pnl:  1_000, reason: "target_hit"       },
  // 5. Expired (options, still had value)
  { symbol: "SPY",  expiry: "12 APR 26", type: "CALL", closedQty: 5,       totalQty: 5,       entryPrice: 510, exitPrice: 528, pnl:    450, reason: "expired", date: "April 12" },
  // 6. Expired worthless
  { symbol: "QQQ",  expiry: "15 APR 26", type: "PUT",  closedQty: 3,       totalQty: 3,       entryPrice: 12,  exitPrice: 0,   pnl:   -360, reason: "expired_worthless" },
  // 7. Squared off by broker
  { symbol: "NDX",                                      closedQty: 50,      totalQty: 50,      entryPrice: 244, exitPrice: 238, pnl:   -300, reason: "squared_off"      },
];

const todayPnl    = 3_750;
const todayPnlPct = 3.0;
const realisedPnl = 1_750;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmtPnl = (n: number) =>
  (n >= 0 ? "+" : "−") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0 });

const fmtQty = (n: number) =>
  n % 1 === 0 ? String(n) : n.toFixed(5).replace(/\.?0+$/, "");

/* ------------------------------------------------------------------ */
/*  Status badge for open positions                                    */
/* ------------------------------------------------------------------ */

function OpenStatusBadge({ status, filledQty, orderedQty }: { status: OpenStatus; filledQty: number; orderedQty: number }) {
  if (status === "pending") {
    return (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
        Pending
      </span>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Close reason badge                                                 */
/* ------------------------------------------------------------------ */

function CloseReasonBadge({ reason, date }: { reason: CloseReason; date?: string }) {
  const configs: Record<CloseReason, { label: string }> = {
    manual:            { label: "Closed" },
    partial_close:     { label: "Partial close" },
    expired:           { label: date ? `Expired · ${date}` : "Expired" },
    expired_worthless: { label: "Expired worthless" },
    stop_loss:         { label: "Stop loss" },
    target_hit:        { label: "Target hit" },
    squared_off:       { label: "Squared off" },
  };
  const { label } = configs[reason];
  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Side badge                                                         */
/* ------------------------------------------------------------------ */

function SideBadge({ side }: { side: "B" | "S" }) {
  return (
    <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-md text-[11px] font-bold shrink-0 bg-muted text-foreground">
      {side}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Qty display                                                        */
/* ------------------------------------------------------------------ */

function QtyDisplay({ p }: { p: OpenPosition }) {
  if (p.lots !== undefined) {
    return (
      <span className="flex items-center gap-0.5">
        <span className="font-semibold text-foreground">{p.lots}</span>
        <span className="text-muted-foreground/60 text-[10px] mx-0.5">lot ×</span>
        <span className="font-semibold text-foreground">{p.filledQty || p.orderedQty}</span>
      </span>
    );
  }
  return <span className="font-semibold text-foreground">{fmtQty(p.filledQty || p.orderedQty)}</span>;
}

/* ------------------------------------------------------------------ */
/*  Expiry warning                                                     */
/* ------------------------------------------------------------------ */

function ExpiryBanner({ days }: { days: number }) {
  const isToday = days === 0;
  return (
    <div className={cn(
      "flex items-center gap-1.5 border-b px-4 py-2",
      isToday
        ? "bg-foreground/5 border-foreground/10"
        : "bg-muted/60 border-border/40"
    )}>
      {isToday
        ? <AlertTriangle size={12} className="text-foreground shrink-0" />
        : <Clock size={12} className="text-muted-foreground shrink-0" />
      }
      <p className={cn("text-[12px] font-semibold", isToday ? "text-foreground" : "text-muted-foreground")}>
        {isToday ? "Expiring today" : `${days} day${days !== 1 ? "s" : ""} left for expiry`}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Open position card                                                 */
/* ------------------------------------------------------------------ */

function OpenCard({ p, expanded, onToggle }: {
  p: OpenPosition;
  expanded: boolean;
  onToggle: () => void;
}) {
  const label = [p.symbol, p.expiry, p.type].filter(Boolean).join(" ");
  const isPending = p.status === "pending";
  const showExpiry = p.daysToExpiry !== undefined && p.daysToExpiry <= 5;

  return (
    <div className={cn(
      "rounded-2xl border bg-white overflow-hidden transition-shadow",
      expanded ? "border-foreground/20 shadow-md" : "border-border/50"
    )}>
      {/* Expiry warning */}
      {showExpiry && <ExpiryBanner days={p.daysToExpiry!} />}

      {/* Tappable card body */}
      <button className="w-full text-left px-4 py-3.5 active:bg-muted/20 transition-colors" onClick={onToggle}>
        {/* Row 1: S/B badge + label left-aligned */}
        <div className="flex items-center gap-2 mb-2.5">
          <SideBadge side={p.side} />
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[14px] font-extrabold text-foreground tracking-wide">{label}</p>
            {p.tag && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{p.tag}</span>
            )}
            <OpenStatusBadge status={p.status} filledQty={p.filledQty} orderedQty={p.orderedQty} />
          </div>
        </div>

        {/* Row 2: labeled columns + P&L */}
        <div className="flex items-center justify-between gap-2 text-[12px]">
          <div className="flex items-center gap-3">
            {/* Qty — show filled/ordered if partial */}
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Qty</span>
              {p.status === "partial_fill" ? (
                <span className="font-semibold text-foreground">{fmtQty(p.filledQty)}
                  <span className="text-muted-foreground font-normal">/{fmtQty(p.orderedQty)}</span>
                </span>
              ) : (
                <QtyDisplay p={p} />
              )}
            </div>
            <div className="w-px h-6 bg-border/50" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Avg</span>
              <span className="font-semibold text-foreground">
                {isPending ? <span className="text-muted-foreground">—</span> : `$${p.avgPrice}`}
              </span>
            </div>
            <div className="w-px h-6 bg-border/50" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">LTP</span>
              <span className="font-semibold text-foreground">${p.ltp}</span>
            </div>
          </div>

          {/* P&L — hidden for pending */}
          {isPending ? (
            <span className="text-[12px] text-muted-foreground font-medium">Awaiting fill</span>
          ) : (
            <p className="text-[15px] font-extrabold tabular-nums shrink-0 text-foreground">
              {fmtPnl(p.pnl)}
            </p>
          )}
        </div>
      </button>

      {/* Expanded actions */}
      {expanded && !isPending && (
        <div className="border-t border-border/40 flex divide-x divide-border/40">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-foreground active:bg-muted/30 transition-colors">
            <Plus size={14} />
            Add
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-foreground active:bg-muted/30 transition-colors">
            <LogOut size={14} />
            Exit position
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-foreground active:bg-muted/30 transition-colors">
            Details
            <ArrowRight size={14} />
          </button>
        </div>
      )}
      {expanded && isPending && (
        <div className="border-t border-border/40 flex divide-x divide-border/40">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-foreground active:bg-muted/30 transition-colors">
            Cancel order
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-foreground active:bg-muted/30 transition-colors">
            Details
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Exit All drawer                                                    */
/* ------------------------------------------------------------------ */

function ExitAllDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const exitablePositions = OPEN.filter((p) => p.status !== "pending");
  const [selected, setSelected] = useState<Set<number>>(() => new Set(exitablePositions.map((_, i) => i)));

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-6 pb-4 shrink-0">
          <button onClick={onClose} className="rounded-full p-1 -ml-1 active:bg-muted/50">
            <X size={20} className="text-foreground" />
          </button>
        </div>
        <div className="px-5 pb-4 shrink-0">
          <p className="text-[22px] font-extrabold text-foreground">Exit all positions</p>
          <p className="text-[13px] text-muted-foreground mt-1">All selected positions will be closed at market price</p>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-5 space-y-3 pb-4">
          {exitablePositions.map((p, i) => {
            const label = [p.symbol, p.expiry, p.type].filter(Boolean).join(" ");
            const isChecked = selected.has(i);
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-3 text-left active:opacity-70"
              >
                {/* Checkbox */}
                <div className={cn(
                  "shrink-0 w-5 h-5 rounded flex items-center justify-center border-2 transition-colors",
                  isChecked ? "bg-foreground border-foreground" : "border-border bg-white"
                )}>
                  {isChecked && (
                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                      <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Card — same layout as OpenCard */}
                <div className="flex-1 rounded-2xl border border-border/50 bg-white px-4 py-3.5">
                  {/* Row 1: S/B badge + label */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <SideBadge side={p.side} />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[14px] font-extrabold text-foreground tracking-wide">{label}</p>
                      {p.tag && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{p.tag}</span>
                      )}
                    </div>
                  </div>
                  {/* Row 2: Qty | Avg | LTP + P&L */}
                  <div className="flex items-center justify-between gap-2 text-[12px]">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Qty</span>
                        <QtyDisplay p={p} />
                      </div>
                      <div className="w-px h-6 bg-border/50" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Avg</span>
                        <span className="font-semibold text-foreground">${p.avgPrice}</span>
                      </div>
                      <div className="w-px h-6 bg-border/50" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">LTP</span>
                        <span className="font-semibold text-foreground">${p.ltp}</span>
                      </div>
                    </div>
                    <p className="text-[15px] font-extrabold tabular-nums shrink-0 text-foreground">
                      {fmtPnl(p.pnl)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="shrink-0 px-5 pb-8 pt-3">
          <button
            disabled={selected.size === 0}
            className="w-full flex items-center justify-between bg-foreground text-background rounded-2xl px-5 py-4 active:opacity-80 transition-opacity disabled:opacity-40"
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <ChevronRight size={18} className="text-background" />
            </div>
            <span className="text-[16px] font-bold">
              {selected.size === 0 ? "Select positions to exit" : `Swipe to Exit ${selected.size > 0 ? `${selected.size} ` : ""}All`}
            </span>
            <div className="w-9" />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PositionsTab() {
  const isGain = todayPnl >= 0;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [exitAllOpen, setExitAllOpen] = useState(false);

  return (
    <div className="pb-24">
      <ExitAllDrawer open={exitAllOpen} onClose={() => setExitAllOpen(false)} />

      {/* ── Today's P&L header ── */}
      <div className="bg-white border-b border-border/30 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Today&apos;s P&L</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={cn("text-[30px] font-extrabold tabular-nums leading-none", isGain ? "text-[#10B981]" : "text-red-500")}>
                {fmtPnl(todayPnl)}
              </span>
              <span className="flex items-center gap-0.5 text-[14px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#10B981]">
                {isGain ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {isGain ? "+" : ""}{todayPnlPct}%
              </span>
            </div>
          </div>
          <button
            onClick={() => setExitAllOpen(true)}
            className="shrink-0 mt-1 rounded-2xl bg-foreground px-4 py-2.5 text-[13px] font-bold text-background active:opacity-75 transition-opacity"
          >
            Exit all
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F8F9FA] px-3.5 py-2.5">
          <p className="text-[12px] text-muted-foreground font-medium">Realised P&L</p>
          <p className="text-[13px] font-bold tabular-nums text-foreground">{fmtPnl(realisedPnl)}</p>
        </div>
      </div>

      {/* ── Open positions ── */}
      <div className="px-5 mt-6 mb-3 flex items-center gap-2">
        <p className="text-[13px] font-semibold text-foreground">Open</p>
        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-bold text-foreground">{OPEN.length}</span>
      </div>

      <div className="px-5 space-y-2.5">
        {OPEN.map((p, i) => (
          <OpenCard
            key={i}
            p={p}
            expanded={expandedIndex === i}
            onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
          />
        ))}
      </div>

      {/* ── Closed today ── */}
      <div className="px-5 mt-8 mb-3 flex items-center gap-2">
        <p className="text-[13px] font-semibold text-foreground">Closed today</p>
        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-bold text-foreground">{CLOSED.length}</span>
      </div>

      <div className="px-5 space-y-2.5">
        {CLOSED.map((p, i) => {
          const label = [p.symbol, p.expiry, p.type].filter(Boolean).join(" ");
          const isPartial = p.reason === "partial_close";
          const isWorthless = p.reason === "expired_worthless";
          return (
            <div key={i} className="rounded-2xl border border-border/40 bg-[#FAFAFA] px-4 py-3.5">
              {/* Row 1: label + reason badge */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <p className="text-[14px] font-bold text-muted-foreground tracking-wide">{label}</p>
                  {isPartial && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {p.closedQty}/{p.totalQty} qty
                    </span>
                  )}
                </div>
                <CloseReasonBadge reason={p.reason} date={p.date} />
              </div>

              {/* Row 2: Qty | Avg | Exit + P&L */}
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Qty</span>
                    <span className="font-semibold text-muted-foreground">{fmtQty(p.closedQty)}</span>
                  </div>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Avg</span>
                    <span className="font-semibold text-muted-foreground">${p.entryPrice}</span>
                  </div>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">Exit</span>
                    <span className="font-semibold text-muted-foreground">
                      {isWorthless ? <span className="text-muted-foreground/50">Worthless</span> : `$${p.exitPrice}`}
                    </span>
                  </div>
                </div>
                <p className="text-[15px] font-bold tabular-nums shrink-0 text-foreground">
                  {fmtPnl(p.pnl)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
