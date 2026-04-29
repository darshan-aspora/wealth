"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Clock, Plus, LogOut, ArrowRight, AlertTriangle, X, ChevronRight, Zap, BarChart2, Activity } from "lucide-react";
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
const mtmPrice    = 52_340;

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

function OpenStatusBadge({ status }: { status: OpenStatus; filledQty?: number; orderedQty?: number }) {
  if (status === "pending") {
    return (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[12px] font-semibold text-muted-foreground">
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
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Side badge                                                         */
/* ------------------------------------------------------------------ */

function SideBadge({ side }: { side: "B" | "S" }) {
  return (
    <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-md text-[14px] font-bold shrink-0 bg-muted text-foreground">
      {side}
    </span>
  );
}

function SideAvatar({ side }: { side: "B" | "S" }) {
  return (
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[14px] font-bold",
      side === "B" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
    )}>
      {side}
    </div>
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
        <span className="text-muted-foreground/60 text-[12px] mx-0.5">lot ×</span>
        <span className="font-semibold text-foreground">{p.filledQty || p.orderedQty}</span>
      </span>
    );
  }
  return <span className="font-semibold text-foreground">{fmtQty(p.filledQty || p.orderedQty)}</span>;
}

/* ------------------------------------------------------------------ */
/*  Expiry warning                                                     */
/* ------------------------------------------------------------------ */

function ExpiryBadge({ days }: { days: number }) {
  const isToday = days === 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold",
      isToday
        ? "bg-foreground/10 text-foreground"
        : "bg-muted text-muted-foreground"
    )}>
      {isToday
        ? <AlertTriangle size={10} className="shrink-0" />
        : <Clock size={10} className="shrink-0" />
      }
      {isToday ? "Expiring today" : `${days}d left`}
    </span>
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
  const router = useRouter();
  const label = [p.symbol, p.expiry, p.type].filter(Boolean).join(" ");

  function goToDetail() {
    const qs = new URLSearchParams({
      side: p.side,
      pnl: String(p.pnl),
      avg: String(p.avgPrice),
      ltp: String(p.ltp),
      filled: String(p.filledQty),
      ordered: String(p.orderedQty),
      status: p.status,
    });
    if (p.expiry) qs.set("expiry", p.expiry);
    if (p.type) qs.set("type", p.type);
    if (p.lots !== undefined) qs.set("lots", String(p.lots));
    if (p.daysToExpiry !== undefined) qs.set("dte", String(p.daysToExpiry));
    router.push(`/position-detail/${encodeURIComponent(p.symbol)}?${qs.toString()}`);
  }
  const isPending = p.status === "pending";
  const showExpiry = p.daysToExpiry !== undefined && p.daysToExpiry <= 5;

  const qtyMeta = p.status === "partial_fill"
    ? `${fmtQty(p.filledQty)}/${fmtQty(p.orderedQty)}`
    : p.lots !== undefined
      ? `${p.lots} lot × ${p.filledQty || p.orderedQty}`
      : fmtQty(p.filledQty || p.orderedQty);

  return (
    <div>
      <button className="w-full text-left py-5 flex items-start gap-3 active:opacity-70 transition-opacity" onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="rounded bg-[#E3E3E3] px-1 py-0.5 text-[10px] font-bold text-foreground shrink-0">
              {p.side === "B" ? "BUY" : "SELL"}
            </span>
            <p className="text-[15px] font-bold text-foreground leading-tight">{label}</p>
            {p.tag && <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-bold text-muted-foreground">{p.tag}</span>}
            {p.status === "partial_fill" && <span className="text-[11px] font-semibold text-amber-600">Partial fill</span>}
            {isPending && <span className="text-[11px] font-semibold text-muted-foreground">Pending</span>}
          </div>
          <p className="text-[12px] text-muted-foreground tabular-nums">
            {qtyMeta}
            {!isPending && ` · Avg $${p.avgPrice} · LTP $${p.ltp}`}
          </p>
        </div>

        <div className="text-right shrink-0">
          {!isPending && (
            <p className={cn("text-[16px] font-bold tabular-nums leading-tight", p.pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
              {fmtPnl(p.pnl)}
            </p>
          )}
          {showExpiry && (
            <div className="mt-1">
              <ExpiryBadge days={p.daysToExpiry!} />
            </div>
          )}
        </div>
      </button>

      {expanded && !isPending && (
        <div className="border-t border-border/40 flex divide-x divide-border/40 -mx-0 mb-1">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[14px] font-semibold text-foreground active:bg-muted/30 transition-colors">
            <Plus size={13} />Add
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[14px] font-semibold text-foreground active:bg-muted/30 transition-colors">
            <LogOut size={13} />Exit
          </button>
          <button onClick={goToDetail} className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[14px] font-semibold text-foreground active:bg-muted/30 transition-colors">
            Details<ArrowRight size={13} />
          </button>
        </div>
      )}
      {expanded && isPending && (
        <div className="border-t border-border/40 flex divide-x divide-border/40 mb-1">
          <button className="flex-1 flex items-center justify-center py-3.5 text-[14px] font-semibold text-foreground active:bg-muted/30 transition-colors">Cancel order</button>
          <button onClick={goToDetail} className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[14px] font-semibold text-foreground active:bg-muted/30 transition-colors">Details<ArrowRight size={13} /></button>
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
      if (next.has(i)) { next.delete(i); } else { next.add(i); }
      return next;
    });

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[90dvh] flex flex-col inset-x-0 mx-auto max-w-[430px]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header: close top-right, title left, subtitle below */}
        <div className="px-5 pt-2 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-foreground leading-tight">Exit all positions</p>
              <p className="text-[14px] text-muted-foreground mt-1">Selected positions will be closed at market price</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1 -mr-1 -mt-0.5 active:bg-muted/50 shrink-0">
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Select all row */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0">
          <p className="text-[13px] text-muted-foreground">
            {selected.size} of {exitablePositions.length} selected
          </p>
          <button
            onClick={() => setSelected(
              selected.size === exitablePositions.length
                ? new Set()
                : new Set(exitablePositions.map((_, i) => i))
            )}
            className="text-[13px] font-semibold text-foreground active:opacity-60"
          >
            {selected.size === exitablePositions.length ? "Deselect all" : "Select all"}
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-5 space-y-2.5 pb-4">
          {exitablePositions.map((p, i) => {
            const label = [p.symbol, p.expiry, p.type].filter(Boolean).join(" ");
            const isChecked = selected.has(i);
            const isUp = p.pnl >= 0;

            const qtyMeta = p.lots !== undefined
              ? `${p.lots} lot × ${p.filledQty || p.orderedQty}`
              : p.status === "partial_fill"
                ? `${fmtQty(p.filledQty)}/${fmtQty(p.orderedQty)}`
                : fmtQty(p.filledQty || p.orderedQty);

            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={cn(
                  "w-full text-left rounded-2xl border px-4 py-4 flex items-center gap-3 transition-all active:scale-[0.99]",
                  isChecked ? "border-foreground bg-white" : "border-border/40 bg-white/60"
                )}
              >
                {/* Check circle */}
                <div className={cn(
                  "shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors",
                  isChecked ? "bg-foreground border-foreground" : "border-border/50 bg-transparent"
                )}>
                  {isChecked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="rounded bg-[#E3E3E3] px-1 py-0.5 text-[10px] font-bold text-foreground shrink-0">
                      {p.side === "B" ? "BUY" : "SELL"}
                    </span>
                    <p className="text-[15px] font-bold text-foreground leading-tight">{label}</p>
                  </div>
                  <p className="text-[12px] text-muted-foreground tabular-nums">
                    {qtyMeta} · Avg ${p.avgPrice} · LTP ${p.ltp}
                  </p>
                </div>

                {/* P&L */}
                <p className={cn("text-[15px] font-bold tabular-nums shrink-0", isUp ? "text-emerald-500" : "text-red-500")}>
                  {fmtPnl(p.pnl)}
                </p>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="shrink-0 px-5 pb-8 pt-3 border-t border-border/40">
          <button
            disabled={selected.size === 0}
            className="w-full rounded-2xl bg-foreground text-background py-4 text-[15px] font-bold active:opacity-80 transition-opacity disabled:opacity-30"
          >
            {selected.size === 0 ? "Select positions to exit" : `Exit ${selected.size} position${selected.size > 1 ? "s" : ""}`}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PositionsTab({ empty }: { empty?: boolean }) {
  const isGain = todayPnl >= 0;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [exitAllOpen, setExitAllOpen] = useState(false);

  if (empty) {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isMarketOpen = day >= 1 && day <= 5 && hour >= 9 && hour < 16;
    return (
      <div className="pb-24">
        {/* Empty state — ghost trading chart */}
        <div className="mx-5 mt-5 mb-4 rounded-2xl bg-sky-50/60 border border-sky-100 px-5 pt-5 pb-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-bold text-foreground">No open positions</p>
            <Activity size={28} className="text-sky-200" />
          </div>
          {/* Ghost candlestick bars */}
          <div className="flex items-end gap-[3px] h-12 mb-3">
            {[45, 70, 30, 85, 55, 40, 75, 35, 60, 80, 25, 65, 50, 90, 38].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm bg-sky-300/30" style={{ height: `${h}%` }} />
            ))}
          </div>
          <p className="text-[12px] text-muted-foreground">No active trades right now. Open a position to track it live.</p>
        </div>

        <div className="h-[45px]" />

        {/* Market status banner */}
        <div className={cn(
          "mx-5 mt-5 mb-5 rounded-2xl px-4 py-3 flex items-center gap-3",
          isMarketOpen ? "bg-emerald-50 border border-emerald-200/60" : "bg-muted/40 border border-border/40"
        )}>
          <div className={cn("w-2 h-2 rounded-full shrink-0", isMarketOpen ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40")} />
          <div>
            <p className={cn("text-[13px] font-bold", isMarketOpen ? "text-emerald-700" : "text-foreground")}>
              Market {isMarketOpen ? "Open" : "Closed"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isMarketOpen ? "NYSE & NASDAQ trading hours: 9:30 AM – 4:00 PM ET" : "Opens Mon–Fri, 9:30 AM – 4:00 PM ET"}
            </p>
          </div>
        </div>

        {/* Two type cards */}
        <div className="px-5 mb-5">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Position types</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => {}} className="rounded-2xl border border-border/40 bg-background px-4 py-5 text-left active:bg-muted/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Zap size={17} className="text-foreground" />
              </div>
              <p className="text-[14px] font-bold text-foreground mb-1">Intraday</p>
              <p className="text-[12px] text-muted-foreground leading-snug">Buy & sell within the same trading session</p>
            </button>
            <button onClick={() => {}} className="rounded-2xl border border-border/40 bg-background px-4 py-5 text-left active:bg-muted/30 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3">
                <BarChart2 size={17} className="text-foreground" />
              </div>
              <p className="text-[14px] font-bold text-foreground mb-1">Options</p>
              <p className="text-[12px] text-muted-foreground leading-snug">Covered calls & protective puts</p>
            </button>
          </div>
        </div>

        <div className="px-5">
          <button onClick={() => {}} className="w-full rounded-2xl bg-foreground py-4 text-[15px] font-bold text-background active:opacity-75 transition-opacity">
            Explore Markets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <ExitAllDrawer open={exitAllOpen} onClose={() => setExitAllOpen(false)} />

      {/* ── Today's P&L header ── */}
      <div className="bg-white border-b border-border/30 px-5 pt-5 pb-4">
        <div className="text-center">
          <p className="text-[14px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Today&apos;s P&L</p>
          <div className="flex items-baseline justify-center gap-2 flex-wrap">
            <span className={cn("text-[26px] font-bold tabular-nums leading-none", isGain ? "text-[#10B981]" : "text-red-500")}>
              {fmtPnl(todayPnl)}
            </span>
            <span className="flex items-center gap-0.5 text-[16px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#10B981]">
              {isGain ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {isGain ? "+" : ""}{todayPnlPct}%
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center rounded-xl bg-[#F8F9FA] divide-x divide-border/40">
          <div className="flex-1 px-3.5 py-2.5">
            <p className="text-[12px] text-muted-foreground mb-0.5">Realised P&L</p>
            <p className="text-[15px] font-semibold tabular-nums text-foreground">{fmtPnl(realisedPnl)}</p>
          </div>
          <div className="flex-1 px-3.5 py-2.5">
            <p className="text-[12px] text-muted-foreground mb-0.5">MTM Price</p>
            <p className="text-[15px] font-semibold tabular-nums text-foreground">${mtmPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ── Open positions ── */}
      <div className="px-5 mt-6 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[16px] font-semibold text-foreground">Open</p>
          <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[14px] font-bold text-foreground">{OPEN.length}</span>
        </div>
        <button
          onClick={() => setExitAllOpen(true)}
          className="rounded-xl border border-border/60 px-3.5 py-1.5 text-[13px] font-semibold text-foreground active:opacity-60 transition-opacity"
        >
          Exit all
        </button>
      </div>

      <div className="px-5 py-2 divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40">
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
        <p className="text-[16px] font-semibold text-foreground">Closed today</p>
        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[14px] font-bold text-foreground">{CLOSED.length}</span>
      </div>

      <div className="px-5 py-2 divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40">
        {CLOSED.map((p, i) => {
          const label = [p.symbol, p.expiry, p.type].filter(Boolean).join(" ");
          const isPartial = p.reason === "partial_close";
          const isWorthless = p.reason === "expired_worthless";
          return (
            <div key={i} className="py-5 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <p className="text-[15px] font-bold text-muted-foreground leading-tight">{label}</p>
                  {isPartial && (
                    <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {p.closedQty}/{p.totalQty} qty
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-muted-foreground tabular-nums">
                  Qty {fmtQty(p.closedQty)} · Avg ${p.entryPrice} · Exit{" "}
                  {isWorthless ? "Worthless" : `$${p.exitPrice}`}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className={cn("text-[16px] font-bold tabular-nums leading-tight", p.pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {fmtPnl(p.pnl)}
                </p>
                <div className="mt-1">
                  <CloseReasonBadge reason={p.reason} date={p.date} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
