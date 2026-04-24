"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, ChevronDown, Info, ChevronRight, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { buildChain, formatExpiryShort, getExpiryGroups, hashStr, seeded, STOCK_PRICES } from "@/lib/options-chain";

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const ROW_H    = 52;
const STRIKE_W = 72;
const ATM_PILL_H = 22; // pill height for offset calc

function barWidths(strikeIdx: number, totalRows: number): { red: number; green: number } {
  const rand = seeded(strikeIdx * 137 + 42);
  const t = strikeIdx / Math.max(1, totalRows - 1); // 0 = top row (low strike), 1 = bottom row (high strike)
  const r = Math.round(3 + t * 13 + (rand() - 0.5) * 4);
  const g = Math.round(3 + (1 - t) * 13 + (rand() - 0.5) * 4);
  return { red: Math.max(3, Math.min(16, r)), green: Math.max(3, Math.min(16, g)) };
}

// Columns from center outward: LTP (innermost) → Gamma (outermost)
const SIDE_COLS = [
  { key: "ltp",   label: "LTP",   w: 88  },
  { key: "iv",    label: "IV",    w: 62  },
  { key: "delta", label: "Delta", w: 58  },
  { key: "theta", label: "Theta", w: 56  },
  { key: "vega",  label: "Vega",  w: 52  },
  { key: "gamma", label: "Gamma", w: 70  },
] as const;

const SIDE_W = SIDE_COLS.reduce((s, c) => s + c.w, 0);

/* ------------------------------------------------------------------ */
/*  Cell renderers                                                     */
/* ------------------------------------------------------------------ */

function LtpCell({ ltp, pct, right }: { ltp: number; pct: number; right?: boolean }) {
  const pos = pct >= 0;
  return (
    <div className={cn("flex flex-col", right ? "items-end" : "items-start")}>
      <span className="text-[12px] font-semibold tabular-nums leading-tight" style={{ color: "#737373" }}>${ltp.toFixed(2)}</span>
      <span className={cn("text-[10px] tabular-nums leading-tight", pos ? "text-gain" : "text-loss")}>
        {pos ? "+" : ""}{pct.toFixed(2)}%
      </span>
    </div>
  );
}

function Num({ val, right }: { val: string | number; right?: boolean }) {
  return (
    <span className={cn(
      "text-[12px] tabular-nums whitespace-nowrap block",
      right ? "text-right" : "text-left",
    )}
    style={{ color: "#737373" }}>
      {val}
    </span>
  );
}

function callCell(key: string, row: GreekRow) {
  const c = row.call;
  if (key === "ltp")   return <LtpCell ltp={c.ltp} pct={c.ltpChgPct} right />;
  if (key === "iv")    return <Num val={`${(c.iv * 100).toFixed(0)}%`} right />;
  if (key === "delta") return <Num val={c.delta.toFixed(2)} right />;
  if (key === "theta") return <Num val={c.theta} right />;
  if (key === "vega")  return <Num val={c.vega}  right />;
  if (key === "gamma") return <Num val={c.gamma.toFixed(4)} right />;
}

function putCell(key: string, row: GreekRow) {
  const p = row.put;
  if (key === "ltp")   return <LtpCell ltp={p.ltp} pct={p.ltpChgPct} />;
  if (key === "iv")    return <Num val={`${(p.iv * 100).toFixed(0)}%`} />;
  if (key === "delta") return <Num val={p.delta.toFixed(2)} />;
  if (key === "theta") return <Num val={p.theta} />;
  if (key === "vega")  return <Num val={p.vega}  />;
  if (key === "gamma") return <Num val={p.gamma.toFixed(4)} />;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OptionsChainPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = decodeURIComponent(params.symbol as string);

  const stock        = STOCK_PRICES[symbol] ?? { price: 200, pct: 0 };
  const currentPrice = stock.price;

  const expiryGroups = getExpiryGroups(symbol);
  const [expiry, setExpiry]           = useState(expiryGroups[0].items[0].date);
  const [expiryOpen, setExpiryOpen]   = useState(false);
  const [ltpOpen, setLtpOpen]         = useState(false);
  const [sortAsc, setSortAsc]         = useState(true);

  type TradeSelection = { strike: number; side: "call" | "put"; mode: "buy" | "sell"; ltp: number };
  const [selected, setSelected]       = useState<TradeSelection | null>(null);
  const [lots, setLots]               = useState(1);

  const handleRowTap = useCallback((strike: number, side: "call" | "put", ltp: number) => {
    setSelected((prev) => {
      if (prev && prev.strike === strike && prev.side === side) return null; // tap same = deselect
      setLots(1);
      return { strike, side, mode: "buy", ltp };
    });
  }, []);

  const baseChain = useMemo(
    () => buildChain(currentPrice, hashStr(symbol + expiry)),
    [currentPrice, symbol, expiry],
  );
  const chain = useMemo(
    () => sortAsc ? baseChain : [...baseChain].reverse(),
    [baseChain, sortAsc],
  );

  // Single closest strike to current price = ATM
  const atmStrike = useMemo(() => {
    if (!chain.length) return null;
    return chain.reduce((closest, row) =>
      Math.abs(row.strike - currentPrice) < Math.abs(closest.strike - currentPrice) ? row : closest
    ).strike;
  }, [chain, currentPrice]);

  // Index of the ATM boundary row — first row crossing past currentPrice in whichever sort direction
  const atmDividerIdx = useMemo(
    () => sortAsc
      ? chain.findIndex((r) => r.strike > currentPrice)
      : chain.findIndex((r) => r.strike < currentPrice),
    [chain, currentPrice, sortAsc],
  );

  // Y-position (in px) of the ATM divider line from top of scroll content
  const atmDividerY = atmDividerIdx * ROW_H;

  /* ── Vertical scroll: center ATM on load ── */
  const vScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = vScrollRef.current;
    if (!el) return;
    // Center the ATM pill in the viewport
    const targetScrollTop = atmDividerY - el.clientHeight / 2 + ATM_PILL_H / 2;
    el.scrollTop = Math.max(0, targetScrollTop);
  }, [expiry, sortAsc, atmDividerY]);

  /* ── Mirrored horizontal scroll ── */
  // Left panel: cols ordered [Gamma…LTP] (outermost→inner), starts scrolled far-right (LTP visible)
  // Right panel: cols ordered [LTP…Gamma] (inner→outermost), starts scrolled far-left (LTP visible)
  // Mirror: right.scrollLeft = rightMax - left.scrollLeft
  const leftRef    = useRef<HTMLDivElement>(null);
  const rightRef   = useRef<HTMLDivElement>(null);
  const leftHdrRef = useRef<HTMLDivElement>(null);
  const rightHdrRef= useRef<HTMLDivElement>(null);
  const syncing    = useRef(false);

  const syncFrom = useCallback((src: "left" | "right") => {
    if (syncing.current) return;
    syncing.current = true;
    const l = leftRef.current, r = rightRef.current;
    const lh = leftHdrRef.current, rh = rightHdrRef.current;
    if (!l || !r) { syncing.current = false; return; }
    const lMax = l.scrollWidth - l.clientWidth;
    const rMax = r.scrollWidth - r.clientWidth;
    if (src === "left") {
      const s = l.scrollLeft;
      r.scrollLeft  = rMax - s;
      if (lh) lh.scrollLeft = s;
      if (rh) rh.scrollLeft = rMax - s;
    } else {
      const s = r.scrollLeft;
      l.scrollLeft  = lMax - s;
      if (lh) lh.scrollLeft = lMax - s;
      if (rh) rh.scrollLeft = s;
    }
    syncing.current = false;
  }, []);

  // Init left at far-right so LTP is closest to strike
  useEffect(() => {
    const l = leftRef.current, lh = leftHdrRef.current;
    if (l)  { l.scrollLeft  = l.scrollWidth;  }
    if (lh) { lh.scrollLeft = lh.scrollWidth; }
  }, [chain]);

  const expiryShort = formatExpiryShort(expiry);

  // Total content height (no dedicated ATM row — pill overlays the border)
  const totalH = chain.length * ROW_H;

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* ── Header ── */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border/40">
        <button onClick={() => router.back()} className="rounded-full p-1.5 active:bg-muted/50 shrink-0">
          <X size={18} strokeWidth={2.2} className="text-foreground" />
        </button>
        <div className="flex-1 flex flex-col min-w-0">
          <p className="text-[17px] font-bold text-foreground leading-tight">{symbol}</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-[13px] font-semibold tabular-nums text-foreground">{currentPrice.toFixed(2)}</p>
            <p className={cn("text-[12px] font-semibold tabular-nums", stock.pct >= 0 ? "text-gain" : "text-loss")}>
              {stock.pct >= 0 ? "+" : ""}{stock.pct.toFixed(2)}%
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpiryOpen(true)}
          className="flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-[13px] font-semibold text-foreground active:opacity-70 shrink-0"
        >
          {expiryShort} <ChevronDown size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── CALL / LTP? / PUT ── */}
      <div className="shrink-0 flex border-b border-border/40">
        <div className="flex-1 flex items-center justify-center py-2">
          <span className="text-[12px] font-bold text-gain tracking-wider">CALL</span>
        </div>
        <button
          onClick={() => setLtpOpen(true)}
          className="shrink-0 flex items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted-foreground active:opacity-60"
          style={{ width: STRIKE_W }}
        >
          <Info size={11} strokeWidth={2} />
          <span className="whitespace-nowrap">LTP?</span>
        </button>
        <div className="flex-1 flex items-center justify-center py-2">
          <span className="text-[12px] font-bold text-loss tracking-wider">PUT</span>
        </div>
      </div>

      {/* ── Column headers ── */}
      <div className="shrink-0 flex border-b border-border/40 bg-background">
        {/* Left headers: outermost (Gamma) → innermost (LTP) */}
        <div ref={leftHdrRef} className="overflow-x-hidden no-scrollbar flex" style={{ flex: 1, minWidth: 0 }}>
          <div className="flex ml-auto" style={{ width: SIDE_W }}>
            {[...SIDE_COLS].reverse().map((col) => (
              <div key={col.key} className="flex items-center justify-end px-2 py-1.5 shrink-0" style={{ width: col.w }}>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{col.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Strike header */}
        <button
          onClick={() => setSortAsc((v) => !v)}
          className="shrink-0 flex items-center justify-center gap-0.5 py-1.5 active:opacity-60"
          style={{ width: STRIKE_W }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Strike</span>
          <span className="text-[10px] text-muted-foreground">{sortAsc ? " ↑" : " ↓"}</span>
        </button>
        {/* Right headers: innermost (LTP) → outermost (Gamma) */}
        <div ref={rightHdrRef} className="overflow-x-hidden no-scrollbar flex" style={{ flex: 1, minWidth: 0 }}>
          <div className="flex" style={{ width: SIDE_W }}>
            {SIDE_COLS.map((col) => (
              <div key={col.key} className="flex items-center justify-start px-2 py-1.5 shrink-0" style={{ width: col.w }}>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{col.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table body ── */}
      <div ref={vScrollRef} className="flex-1 overflow-y-auto no-scrollbar relative">
        <div style={{ height: totalH, position: "relative" }}>

          {/* ATM dark line behind the pill */}
          {atmDividerIdx >= 0 && (
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{ top: atmDividerY - 1, height: 2, background: "hsl(var(--foreground) / 0.18)", zIndex: 18 }}
            />
          )}

          {/* ATM floating pill — absolutely overlays the border between last ITM and first OTM row */}
          {atmDividerIdx >= 0 && (
            <div
              className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
              style={{ top: atmDividerY - ATM_PILL_H / 2, height: ATM_PILL_H, zIndex: 20 }}
            >
              <div className="flex items-center gap-1.5 bg-foreground rounded-full px-3.5 py-[5px] shadow-lg">
                <span className="text-[12px] font-bold text-background tabular-nums">{currentPrice.toFixed(2)}</span>
                <span className={cn("text-[11px] font-semibold tabular-nums", stock.pct >= 0 ? "text-gain" : "text-loss")}>
                  {stock.pct >= 0 ? "+" : ""}{stock.pct.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {/* Left scroll panel (calls) */}
          <div
            ref={leftRef}
            onScroll={() => syncFrom("left")}
            className="absolute top-0 bottom-0 overflow-x-auto overflow-y-hidden no-scrollbar"
            style={{ left: 0, right: `calc(50% + ${STRIKE_W / 2}px)` }}
          >
            <div style={{ width: SIDE_W, height: totalH }}>
              {chain.map((row) => {
                const isATM        = row.strike === atmStrike;
                const callITM      = row.strike < currentPrice && !isATM;
                const callOTM      = row.strike > currentPrice && !isATM;
                const isCallSelected = selected?.strike === row.strike && selected?.side === "call";
                const rowBg = isCallSelected
                  ? ""
                  : isATM ? "bg-muted/60" : callITM ? "bg-gain/[0.08]" : callOTM ? "bg-amber-50/70" : "";
                return (
                  <div
                    key={row.strike}
                    onClick={() => handleRowTap(row.strike, "call", row.call.ltp)}
                    className={cn(
                      "flex items-center justify-end border-b border-border/20 cursor-pointer active:opacity-75",
                      rowBg,
                    )}
                    style={{
                      height: ROW_H,
                      width: SIDE_W,
                      ...(isCallSelected ? {
                        background: "white",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)",
                        zIndex: 5,
                        position: "relative",
                      } : {}),
                    }}
                  >
                    {[...SIDE_COLS].reverse().map((col) => (
                      <div key={col.key} className={cn("flex items-center justify-end shrink-0", col.key === "ltp" ? "pr-6" : "pr-2")} style={{ width: col.w }}>
                        {callCell(col.key, row)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right scroll panel (puts) */}
          <div
            ref={rightRef}
            onScroll={() => syncFrom("right")}
            className="absolute top-0 bottom-0 overflow-x-auto overflow-y-hidden no-scrollbar"
            style={{ left: `calc(50% + ${STRIKE_W / 2}px)`, right: 0 }}
          >
            <div style={{ width: SIDE_W, height: totalH }}>
              {chain.map((row) => {
                const isATM       = row.strike === atmStrike;
                const putITM      = row.strike > currentPrice && !isATM;
                const putOTM      = row.strike < currentPrice && !isATM;
                const isPutSelected = selected?.strike === row.strike && selected?.side === "put";
                const rowBg = isPutSelected
                  ? ""
                  : isATM ? "bg-muted/60" : putITM ? "bg-gain/[0.08]" : putOTM ? "bg-amber-50/70" : "";
                return (
                  <div
                    key={row.strike}
                    onClick={() => handleRowTap(row.strike, "put", row.put.ltp)}
                    className={cn(
                      "flex items-center justify-start border-b border-border/20 cursor-pointer active:opacity-75",
                      rowBg,
                    )}
                    style={{
                      height: ROW_H,
                      width: SIDE_W,
                      ...(isPutSelected ? {
                        background: "white",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)",
                        zIndex: 5,
                        position: "relative",
                      } : {}),
                    }}
                  >
                    {SIDE_COLS.map((col) => (
                      <div key={col.key} className={cn("flex items-center justify-start shrink-0", col.key === "ltp" ? "pl-6" : "pl-2")} style={{ width: col.w }}>
                        {putCell(col.key, row)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center strike column — always on top, no scroll */}
          <div
            className="absolute top-0 bottom-0 bg-background"
            style={{ left: "50%", transform: "translateX(-50%)", width: STRIKE_W, zIndex: 10 }}
          >
            {chain.map((row, rowIdx) => {
              const isATM         = row.strike === atmStrike;
              const isRowSelected = selected?.strike === row.strike;
              const { red: redW, green: greenW } = barWidths(rowIdx, chain.length);
              return (
                <div
                  key={row.strike}
                  className={cn(
                    "relative flex flex-col items-center justify-center border-b border-border/20",
                    isATM && !isRowSelected ? "bg-foreground/[0.05]" : "bg-background",
                  )}
                  style={{
                    height: ROW_H,
                    ...(isRowSelected ? {
                      background: "white",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)",
                      zIndex: 15,
                      position: "relative",
                    } : {}),
                  }}
                >
                  <span className={cn(
                    "text-[13px] font-semibold tabular-nums",
                    isATM ? "text-foreground" : "text-muted-foreground",
                  )}>
                    {row.strike.toFixed(1)}
                  </span>
                  <div className="flex gap-0.5 mt-1 items-center">
                    <div className="h-[2px] rounded-full bg-loss/60" style={{ width: redW }} />
                    <div className="h-[2px] rounded-full bg-gain/60" style={{ width: greenW }} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── Legend (hidden when trade footer is open) ── */}
      {!selected && <div className="shrink-0 flex items-center justify-center gap-4 px-4 py-3 border-t border-border/40 bg-background">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gain/50" />
          <span className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">ITM</span> (In The Money)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-foreground" />
          <span className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">ATM</span> (At The Money)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <span className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">OTM</span> (Out of The Money)
          </span>
        </div>
      </div>}

      {/* ── Trade footer ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 35 }}
            className="shrink-0 border-t border-border/40 bg-background px-4 pt-4 pb-8"
          >
            {/* Row 1: option identity + close */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    strike: selected.strike.toFixed(1),
                    side: selected.side,
                    expiry,
                    ltp: selected.ltp.toFixed(2),
                  });
                  router.push(`/options-chain/${encodeURIComponent(symbol)}/leg?${params.toString()}`);
                }}
                className="flex items-center gap-1 min-w-0"
              >
                <p className="text-[14px] font-bold text-foreground truncate">
                  {selected.strike.toFixed(1)}&nbsp;{selected.side === "call" ? "CE" : "PE"}
                  <span className="font-normal text-muted-foreground"> · {expiryShort}</span>
                  <span className="text-border/60"> &ensp;|&ensp;</span>
                  <span className="font-normal text-muted-foreground">LTP ${selected.ltp.toFixed(2)}</span>
                </p>
                <ChevronRight size={14} strokeWidth={2.2} className="text-muted-foreground shrink-0 ml-0.5" />
              </button>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full p-1.5 bg-muted/60 active:opacity-70 shrink-0 ml-2"
              >
                <X size={14} strokeWidth={2.5} className="text-foreground" />
              </button>
            </div>

            {/* Row 2: info pills */}
            {(() => {
              const available = 12450;
              const reqMargin = selected.ltp * lots * 100;
              const insufficient = reqMargin > available;
              return (
                <>
                  <div className="flex gap-2.5 mb-4">
                    <div className="flex-1 rounded-xl bg-muted/40 px-3.5 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 mb-0.5">Available</p>
                      <p className="text-[14px] font-bold text-foreground tabular-nums">${available.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className={cn("flex-1 rounded-xl px-3.5 py-2.5", insufficient ? "bg-loss/10" : "bg-muted/40")}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 mb-0.5">Req. Margin</p>
                      <p className={cn("text-[14px] font-bold tabular-nums", insufficient ? "text-loss" : "text-foreground")}>
                        ${reqMargin.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Row 3: lots stepper + Sell + Buy */}
                  <div className="flex items-stretch gap-2.5" style={{ height: 50 }}>
                    {/* Lots stepper */}
                    <div className="flex items-stretch rounded-xl border border-border/60 overflow-hidden shrink-0">
                      <button
                        onClick={() => setLots((l) => Math.max(1, l - 1))}
                        className="flex items-center justify-center px-3 active:bg-muted/60 transition-colors"
                      >
                        <Minus size={14} strokeWidth={2.5} className="text-foreground" />
                      </button>
                      <span className="flex items-center justify-center px-2 text-[15px] font-bold text-foreground tabular-nums min-w-[30px]">
                        {lots}
                      </span>
                      <button
                        onClick={() => setLots((l) => l + 1)}
                        className="flex items-center justify-center px-3 active:bg-muted/60 transition-colors"
                      >
                        <Plus size={14} strokeWidth={2.5} className="text-foreground" />
                      </button>
                    </div>

                    {/* Sell button */}
                    <button
                      disabled={insufficient}
                      onClick={() => !insufficient && setSelected((prev) => prev ? { ...prev, mode: "sell" } : null)}
                      className={cn(
                        "flex-1 flex items-center justify-center rounded-xl text-[15px] font-bold transition-colors border",
                        insufficient
                          ? "border-border/40 text-muted-foreground/40 bg-transparent cursor-not-allowed"
                          : "border-loss text-loss bg-transparent active:opacity-70"
                      )}
                    >
                      Sell · {lots} {lots === 1 ? "Lot" : "Lots"}
                    </button>

                    {/* Buy button */}
                    <button
                      disabled={insufficient}
                      onClick={() => !insufficient && setSelected((prev) => prev ? { ...prev, mode: "buy" } : null)}
                      className={cn(
                        "flex-1 flex items-center justify-center rounded-xl text-[15px] font-bold transition-colors border",
                        insufficient
                          ? "border-border/40 text-muted-foreground/40 bg-transparent cursor-not-allowed"
                          : "border-gain text-gain bg-transparent active:opacity-70"
                      )}
                    >
                      Buy · {lots} {lots === 1 ? "Lot" : "Lots"}
                    </button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expiry sheet ── */}
      <AnimatePresence>
        {expiryOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-40" onClick={() => setExpiryOpen(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-background"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <p className="px-5 pt-2 pb-3 text-[20px] font-bold text-foreground">Expiry</p>
              <div className="overflow-y-auto no-scrollbar" style={{ maxHeight: "72vh" }}>
                {expiryGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-5 pt-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      {group.label}
                    </p>
                    <div className="px-4 flex flex-col gap-1.5 pb-1">
                      {group.items.map((item) => {
                        const active = item.date === expiry;
                        return (
                          <button
                            key={item.date}
                            onClick={() => { setExpiry(item.date); setExpiryOpen(false); }}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors active:opacity-80",
                              active ? "bg-foreground" : "bg-muted/40"
                            )}
                          >
                            <span className={cn("text-[15px] font-medium", active ? "text-background" : "text-foreground")}>
                              {item.date}
                            </span>
                            <span className={cn(
                              "text-[13px] font-semibold px-2.5 py-0.5 rounded-lg",
                              active ? "bg-white/20 text-background" : "bg-background text-muted-foreground"
                            )}>
                              {item.tag}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="h-8" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── LTP info sheet ── */}
      <AnimatePresence>
        {ltpOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-40" onClick={() => setLtpOpen(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-background px-5 pb-8 pt-4"
            >
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <div className="flex items-start justify-between mb-3">
                <p className="text-[18px] font-bold text-foreground">What is LTP?</p>
                <button onClick={() => setLtpOpen(false)} className="rounded-full p-1 active:bg-muted/50">
                  <X size={18} className="text-foreground" />
                </button>
              </div>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                LTP (Last Traded Price) is the price at which the most recent transaction for an options
                contract was executed. It reflects the actual last deal made in the market, and may differ
                from the current bid/ask spread.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <HomeIndicator />
    </div>
  );
}
