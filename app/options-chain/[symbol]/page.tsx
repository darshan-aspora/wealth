"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, ChevronDown, Info, ChevronRight, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

/* ------------------------------------------------------------------ */
/*  Greeks generator                                                   */
/* ------------------------------------------------------------------ */

function seeded(seed: number) {
  let s = Math.abs(seed) % 2147483647 || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function hashStr(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface GreekRow {
  strike: number;
  call: { ltp: number; ltpChgPct: number; iv: number; delta: number; theta: number; vega: number; gamma: number };
  put:  { ltp: number; ltpChgPct: number; iv: number; delta: number; theta: number; vega: number; gamma: number };
}

function buildChain(currentPrice: number, seed: number): GreekRow[] {
  const rand = seeded(seed);
  const step = currentPrice > 500 ? 5 : currentPrice > 100 ? 2.5 : 1;
  const base = Math.round(currentPrice / step) * step;
  const rows: GreekRow[] = [];

  for (let i = -20; i <= 20; i++) {   // 41 strikes total
    const strike  = +(base + i * step).toFixed(1);
    const dist    = (strike - currentPrice) / currentPrice;
    const absDist = Math.abs(dist);
    const iv      = +(0.28 + absDist * 0.35 + rand() * 0.06).toFixed(2);
    const cDelta  = +Math.max(0.01, Math.min(0.99, 0.5 - dist * 3.5 + (rand() - 0.5) * 0.04)).toFixed(2);
    const pDelta  = +(cDelta - 1).toFixed(2);
    const gamma   = +(Math.max(0.0001, 0.0009 * Math.exp(-absDist * 22) + rand() * 0.00015)).toFixed(4);
    const vega    = Math.max(1, Math.round(14 * Math.exp(-absDist * 10) + rand() * 2));
    const theta   = -Math.max(1, Math.round(18 * Math.exp(-absDist * 9) + rand() * 3));
    const callIntr = Math.max(0, currentPrice - strike);
    const putIntr  = Math.max(0, strike - currentPrice);
    const tv       = currentPrice * 0.018 * Math.max(0.04, 1 - absDist * 3);

    rows.push({
      strike,
      call: { ltp: +(callIntr + tv + rand() * 0.3).toFixed(2), ltpChgPct: +((rand() - 0.45) * 7).toFixed(2), iv, delta: cDelta, theta, vega, gamma },
      put:  { ltp: +(putIntr  + tv * 0.75 + rand() * 0.25).toFixed(2), ltpChgPct: +((rand() - 0.45) * 5).toFixed(2), iv, delta: pDelta, theta, vega, gamma },
    });
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const STOCK_PRICES: Record<string, { price: number; pct: number }> = {
  NVIDIA:    { price: 924.80, pct:  3.2 },
  Apple:     { price: 198.50, pct:  2.9 },
  Microsoft: { price: 425.30, pct:  2.2 },
  Alphabet:  { price: 176.80, pct:  1.7 },
  Meta:      { price: 502.40, pct:  1.5 },
};

const EXPIRY_GROUPS = [
  { label: "Daily",   items: [{ date: "19 Mar 2026", tag: "0D" }, { date: "20 Mar 2026", tag: "1D" }, { date: "24 Mar 2026", tag: "3D" }] },
  { label: "Weekly",  items: [{ date: "26 Mar 2026", tag: "1W" }, { date: "2 Apr 2026",  tag: "2W" }, { date: "9 Apr 2026",  tag: "3W" }, { date: "16 Apr 2026", tag: "4W" }] },
  { label: "Monthly", items: [{ date: "17 Apr 2026", tag: "Apr" }, { date: "15 May 2026", tag: "May" }, { date: "19 Jun 2026", tag: "Jun" }, { date: "18 Sep 2026", tag: "Sep" }, { date: "18 Dec 2026", tag: "Dec" }] },
  { label: "LEAPS",   items: [{ date: "15 Jan 2027", tag: "Jan '27" }, { date: "21 Jan 2028", tag: "Jan '28" }] },
];

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const ROW_H    = 52;
const STRIKE_W = 72;
const ATM_PILL_H = 28; // pill height for offset calc

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

  const [expiry, setExpiry]           = useState(EXPIRY_GROUPS[0].items[0].date);
  const [expiryOpen, setExpiryOpen]   = useState(false);
  const [ltpOpen, setLtpOpen]         = useState(false);

  type TradeSelection = { strike: number; side: "call" | "put"; mode: "buy" | "sell"; ltp: number };
  const [selected, setSelected]       = useState<TradeSelection | null>(null);
  const [lots, setLots]               = useState(1);

  const handleRowTap = useCallback((strike: number, side: "call" | "put", ltp: number) => {
    setSelected((prev) => {
      if (prev && prev.strike === strike && prev.side === side) {
        if (prev.mode === "buy") return { ...prev, mode: "sell" };
        return null; // third tap = deselect
      }
      setLots(1);
      return { strike, side, mode: "buy", ltp };
    });
  }, []);

  const chain = useMemo(
    () => buildChain(currentPrice, hashStr(symbol + expiry)),
    [currentPrice, symbol, expiry],
  );

  // Single closest strike to current price = ATM
  const atmStrike = useMemo(() => {
    if (!chain.length) return null;
    return chain.reduce((closest, row) =>
      Math.abs(row.strike - currentPrice) < Math.abs(closest.strike - currentPrice) ? row : closest
    ).strike;
  }, [chain, currentPrice]);

  // Index of first row where strike > currentPrice (ATM divider goes before this)
  const atmDividerIdx = useMemo(
    () => chain.findIndex((r) => r.strike > currentPrice),
    [chain, currentPrice],
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
  }, [expiry, atmDividerY]);

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

  const expiryShort = expiry
    .replace(" 2026", "").replace(" 2027", " '27").replace(" 2028", " '28");

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
        <div className="flex-1 flex items-baseline gap-1.5 min-w-0">
          <p className="text-[17px] font-bold text-foreground">{symbol}</p>
          <p className="text-[15px] font-semibold tabular-nums text-foreground">{currentPrice.toFixed(2)}</p>
          <p className={cn("text-[13px] font-semibold tabular-nums", stock.pct >= 0 ? "text-gain" : "text-loss")}>
            {stock.pct >= 0 ? "+" : ""}{stock.pct.toFixed(2)}%
          </p>
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
        <div className="shrink-0 flex items-center justify-center py-1.5" style={{ width: STRIKE_W }}>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Strike ↕</span>
        </div>
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
              <div className="flex items-center gap-1.5 bg-foreground rounded-full px-4 py-1.5 shadow-lg">
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
                const isATM   = row.strike === atmStrike;
                const callITM = row.strike < currentPrice && !isATM;
                const callOTM = row.strike > currentPrice && !isATM;
                void (selected?.strike === row.strike && selected?.side === "call"); // selection shown via strike column badge
                return (
                  <div
                    key={row.strike}
                    onClick={() => handleRowTap(row.strike, "call", row.call.ltp)}
                    className={cn(
                      "flex items-center justify-end border-b border-border/20 cursor-pointer active:opacity-80",
                      isATM   && "bg-muted/60",
                      callITM && "bg-gain/[0.08]",
                      callOTM && "bg-amber-50/70",
                    )}
                    style={{ height: ROW_H, width: SIDE_W }}
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
                const isATM  = row.strike === atmStrike;
                const putITM = row.strike > currentPrice && !isATM;
                const putOTM = row.strike < currentPrice && !isATM;
                void (selected?.strike === row.strike && selected?.side === "put"); // selection shown via strike column badge
                return (
                  <div
                    key={row.strike}
                    onClick={() => handleRowTap(row.strike, "put", row.put.ltp)}
                    className={cn(
                      "flex items-center justify-start border-b border-border/20 cursor-pointer active:opacity-80",
                      isATM  && "bg-muted/60",
                      putITM && "bg-gain/[0.08]",
                      putOTM && "bg-amber-50/70",
                    )}
                    style={{ height: ROW_H, width: SIDE_W }}
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
            className="absolute top-0 bottom-0 bg-background border-l border-r border-border/25"
            style={{ left: "50%", transform: "translateX(-50%)", width: STRIKE_W, zIndex: 10 }}
          >
            {chain.map((row) => {
              const isATM = row.strike === atmStrike;
              const isRowSelected = selected?.strike === row.strike;
              const selSide = isRowSelected ? selected!.side : null;
              const selMode = isRowSelected ? selected!.mode : null;
              const modeColor = selMode === "buy" ? "bg-gain" : "bg-loss";
              return (
                <div
                  key={row.strike}
                  className={cn(
                    "relative flex flex-col items-center justify-center border-b border-border/20",
                    isATM ? "bg-foreground/[0.05]" : "bg-background",
                  )}
                  style={{ height: ROW_H }}
                >
                  {/* Call-side selection indicator — square pill at left border, vertically centered */}
                  {isRowSelected && selSide === "call" && (
                    <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center rounded-[5px] font-bold text-white z-20 shadow-md", modeColor)}
                      style={{ width: 22, height: 22, fontSize: 10 }}>
                      {selMode === "buy" ? "B" : "S"}
                    </div>
                  )}
                  {/* Put-side selection indicator — square pill at right border, vertically centered */}
                  {isRowSelected && selSide === "put" && (
                    <div className={cn("absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center rounded-[5px] font-bold text-white z-20 shadow-md", modeColor)}
                      style={{ width: 22, height: 22, fontSize: 10 }}>
                      {selMode === "buy" ? "B" : "S"}
                    </div>
                  )}
                  <span className={cn(
                    "text-[13px] font-semibold tabular-nums",
                    isATM ? "text-foreground" : "text-muted-foreground",
                  )}>
                    {row.strike.toFixed(1)}
                  </span>
                  <div className="flex gap-0.5 mt-1">
                    <div className="w-3 h-[2px] rounded-full bg-loss/60" />
                    <div className="w-3 h-[2px] rounded-full bg-gain/60" />
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
            {/* Row 1: option details + close */}
            <div className="flex items-center justify-between mb-2.5">
              <button
                onClick={() => router.push(`/options-chain/${encodeURIComponent(symbol)}`)}
                className="flex items-center gap-1 min-w-0"
              >
                <p className="text-[14px] font-bold text-foreground truncate">
                  {selected.strike.toFixed(1)} {selected.side === "call" ? "CE" : "PE"}
                  <span className="font-normal text-muted-foreground"> {expiryShort}</span>
                  <span className="font-normal text-border/80"> &nbsp;|&nbsp; </span>
                  <span className="font-normal text-muted-foreground">LTP ${selected.ltp.toFixed(2)}</span>
                </p>
                <ChevronRight size={15} strokeWidth={2.2} className="text-muted-foreground shrink-0" />
              </button>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full p-1.5 bg-muted/60 active:opacity-70 shrink-0 ml-2"
              >
                <X size={15} strokeWidth={2.5} className="text-foreground" />
              </button>
            </div>

            {/* Row 2: balance + margin */}
            <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Available</p>
                <p className="text-[14px] font-bold text-foreground tabular-nums">$12,450.00</p>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Req. Margin</p>
                <p className="text-[14px] font-bold text-foreground tabular-nums">
                  ${(selected.ltp * lots * 100).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Row 3: lots stepper + buy/sell button */}
            <div className="flex items-stretch gap-3" style={{ height: 48 }}>
              <div className="flex items-stretch rounded-xl border border-border/60 overflow-hidden shrink-0">
                <button
                  onClick={() => setLots((l) => Math.max(1, l - 1))}
                  className="flex items-center justify-center px-3 active:bg-muted/60 transition-colors"
                >
                  <Minus size={14} strokeWidth={2.5} className="text-foreground" />
                </button>
                <span className="flex items-center justify-center px-3 text-[15px] font-bold text-foreground tabular-nums min-w-[36px]">
                  {lots}
                </span>
                <button
                  onClick={() => setLots((l) => l + 1)}
                  className="flex items-center justify-center px-3 active:bg-muted/60 transition-colors"
                >
                  <Plus size={14} strokeWidth={2.5} className="text-foreground" />
                </button>
              </div>
              <button
                onClick={() => setSelected((prev) => prev ? { ...prev, mode: prev.mode === "buy" ? "sell" : "buy" } : null)}
                className={cn(
                  "flex-1 flex items-center justify-center rounded-xl text-[15px] font-bold text-white transition-colors active:opacity-90",
                  selected.mode === "buy" ? "bg-gain" : "bg-loss"
                )}
              >
                {selected.mode === "buy" ? "Buy" : "Sell"} · {lots} {lots === 1 ? "Lot" : "Lots"}
              </button>
            </div>
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
                {EXPIRY_GROUPS.map((group) => (
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
