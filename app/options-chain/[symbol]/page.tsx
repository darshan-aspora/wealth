"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, ChevronDown, Info, ChevronRight, Minus, Plus, ShieldCheck, Zap, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { buildChain, formatExpiryShort, getExpiryGroups, hashStr, STOCK_PRICES, type GreekRow } from "@/lib/options-chain";

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const ROW_H    = 52;
const STRIKE_W = 72;
const ATM_PILL_H = 22; // pill height for offset calc


function formatOI(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

// Columns from center outward: LTP (innermost) → Gamma (outermost)
const SIDE_COLS = [
  { key: "ltp",   label: "LTP",   w: 88  },
  { key: "oi",    label: "OI",    w: 68  },
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
  if (key === "oi")    return <Num val={formatOI(c.oi)} right />;
  if (key === "iv")    return <Num val={`${(c.iv * 100).toFixed(0)}%`} right />;
  if (key === "delta") return <Num val={c.delta.toFixed(2)} right />;
  if (key === "theta") return <Num val={c.theta} right />;
  if (key === "vega")  return <Num val={c.vega}  right />;
  if (key === "gamma") return <Num val={c.gamma.toFixed(4)} right />;
}

function putCell(key: string, row: GreekRow) {
  const p = row.put;
  if (key === "ltp")   return <LtpCell ltp={p.ltp} pct={p.ltpChgPct} />;
  if (key === "oi")    return <Num val={formatOI(p.oi)} />;
  if (key === "iv")    return <Num val={`${(p.iv * 100).toFixed(0)}%`} />;
  if (key === "delta") return <Num val={p.delta.toFixed(2)} />;
  if (key === "theta") return <Num val={p.theta} />;
  if (key === "vega")  return <Num val={p.vega}  />;
  if (key === "gamma") return <Num val={p.gamma.toFixed(4)} />;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Basket payoff helpers                                              */
/* ------------------------------------------------------------------ */

type BasketLegData = { strike: number; side: "call" | "put"; mode: "buy" | "sell"; ltp: number; bid: number; ask: number; lots: number };

function legPnl(leg: BasketLegData, price: number): number {
  const mult = leg.lots * 100;
  const entryPrice = leg.mode === "buy" ? leg.ask : leg.bid;
  const premium = entryPrice * mult;
  if (leg.mode === "buy") {
    if (leg.side === "call") return Math.max(-premium, (price - leg.strike - entryPrice) * mult);
    return Math.max(-premium, (leg.strike - entryPrice - price) * mult);
  } else {
    if (leg.side === "call") return Math.min(premium, -(price - leg.strike - entryPrice) * mult);
    return Math.min(premium, -(leg.strike - entryPrice - price) * mult);
  }
}

function MiniPayoffGraph({ legs, stockPrice }: { legs: BasketLegData[]; stockPrice: number }) {
  const halfRange = stockPrice * 0.2;
  const minP = stockPrice - halfRange;
  const maxP = stockPrice + halfRange;
  const N = 40;
  const points = Array.from({ length: N }, (_, i) => {
    const price = minP + (i / (N - 1)) * (maxP - minP);
    return legs.reduce((s, l) => s + legPnl(l, price), 0);
  });
  const maxPnl = Math.max(...points);
  const minPnl = Math.min(...points);
  const range = Math.max(Math.abs(maxPnl), Math.abs(minPnl)) * 1.1 || 1;
  const W = 44; const H = 28;
  const toX = (i: number) => (i / (N - 1)) * W;
  const toY = (v: number) => H / 2 - (v / range) * (H / 2);
  const polyPts = points.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const zeroY = toY(0);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <clipPath id="mini-profit"><rect x="0" y="0" width={W} height={zeroY} /></clipPath>
        <clipPath id="mini-loss"><rect x="0" y={zeroY} width={W} height={H - zeroY} /></clipPath>
      </defs>
      <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke="#d1d5db" strokeWidth="0.8" strokeDasharray="2 2" />
      <polyline points={polyPts} fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#mini-profit)" />
      <polyline points={polyPts} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#mini-loss)" />
    </svg>
  );
}

function BasketPayoffChart({ legs, stockPrice, compact, onExpand }: {
  legs: BasketLegData[];
  stockPrice: number;
  compact?: boolean;
  onExpand?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const halfRange = stockPrice * 0.2;
  const minP = stockPrice - halfRange;
  const maxP = stockPrice + halfRange;
  const priceRange = maxP - minP;
  const N = 80;

  const points = Array.from({ length: N }, (_, i) => {
    const price = minP + (i / (N - 1)) * priceRange;
    return { price, pnl: legs.reduce((s, l) => s + legPnl(l, price), 0) };
  });

  const maxPnl = Math.max(...points.map(p => p.pnl));
  const minPnl = Math.min(...points.map(p => p.pnl));
  const pnlRange = Math.max(Math.abs(maxPnl), Math.abs(minPnl)) * 1.1 || 1;

  const SVG_W = 300;
  const SVG_H = compact ? 56 : 180;
  const toX = (p: number) => ((p - minP) / priceRange) * SVG_W;
  const toY = (pnl: number) => {
    const mid = SVG_H / 2;
    return mid - (pnl / pnlRange) * mid;
  };

  const polyPts = points.map(pt => `${toX(pt.price).toFixed(1)},${toY(pt.pnl).toFixed(1)}`).join(" ");

  const defaultFrac = (stockPrice - minP) / priceRange;
  const [sliderFrac, setSliderFrac] = useState(defaultFrac);
  const sliderPrice = minP + sliderFrac * priceRange;
  const sliderPnl = legs.reduce((s, l) => s + legPnl(l, sliderPrice), 0);
  const isProfit = sliderPnl >= 0;
  const sliderX = sliderFrac * SVG_W;
  const sliderY = toY(sliderPnl);

  const handlePointerMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSliderFrac(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  };

  const zeroLineY = toY(0);

  return (
    <div
      className={cn("rounded-xl overflow-hidden bg-muted/30 border border-border/40", compact && "cursor-pointer active:opacity-75")}
      onClick={compact ? onExpand : undefined}
    >
      {!compact && (
        <div className="px-4 pt-3 pb-1 flex items-start justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Expected P&L at expiry</p>
            <p className={cn("text-[22px] font-bold leading-none tabular-nums", isProfit ? "text-gain" : "text-loss")}>
              {isProfit ? "+" : ""}${Math.abs(sliderPnl).toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground mb-0.5">Max Profit</p>
            <p className="text-[13px] font-semibold text-gain tabular-nums">+${Math.abs(maxPnl).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-muted-foreground mt-1 mb-0.5">Max Loss</p>
            <p className="text-[13px] font-semibold text-loss tabular-nums">−${Math.abs(minPnl).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="relative touch-none select-none"
        style={{ height: compact ? 56 : SVG_H + 8 }}
        onPointerDown={compact ? undefined : (e) => { isDragging.current = true; handlePointerMove(e.clientX); (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={compact ? undefined : (e) => { if (isDragging.current) handlePointerMove(e.clientX); }}
        onPointerUp={compact ? undefined : () => { isDragging.current = false; }}
        onPointerCancel={compact ? undefined : () => { isDragging.current = false; }}
      >
        <svg width="100%" height={compact ? 56 : SVG_H} viewBox={`0 0 ${SVG_W} ${compact ? 56 : SVG_H}`} preserveAspectRatio="none" overflow="visible">
          <defs>
            <clipPath id="basket-clip-loss"><rect x="0" y={zeroLineY} width={SVG_W} height={(compact ? 56 : SVG_H) - zeroLineY} /></clipPath>
            <clipPath id="basket-clip-profit"><rect x="0" y="0" width={SVG_W} height={zeroLineY} /></clipPath>
          </defs>
          <line x1="0" y1={zeroLineY} x2={SVG_W} y2={zeroLineY} stroke="#d1d5db" strokeWidth="1" strokeDasharray="4 3" />
          <polyline points={polyPts} fill="none" stroke="#ef4444" strokeWidth={compact ? 2 : 2.5} strokeLinecap="round" strokeLinejoin="round" clipPath="url(#basket-clip-loss)" />
          <polyline points={polyPts} fill="none" stroke="#22c55e" strokeWidth={compact ? 2 : 2.5} strokeLinecap="round" strokeLinejoin="round" clipPath="url(#basket-clip-profit)" />
          {!compact && <line x1={sliderX} y1="0" x2={sliderX} y2={SVG_H} stroke={isProfit ? "#22c55e" : "#ef4444"} strokeWidth="1.5" opacity="0.7" />}
        </svg>
        {!compact && (
          <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{ left: `${sliderFrac * 100}%`, top: sliderY, width: 12, height: 12, backgroundColor: isProfit ? "#22c55e" : "#ef4444" }} />
        )}
      </div>
      {compact && (
        <p className="text-center text-[10px] text-muted-foreground pb-1.5">Tap to view payoff</p>
      )}
    </div>
  );
}

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

  type OptionsLevel = 1 | 2;
  type TradeSelection = { strike: number; side: "call" | "put"; mode: "buy" | "sell"; ltp: number; bid: number; ask: number };
  type BasketLeg = TradeSelection & { lots: number; id: number };

  const [level, setLevel]             = useState<OptionsLevel | null>(null);
  const [levelOpen, setLevelOpen]     = useState(true);
  const [selected, setSelected]       = useState<TradeSelection | null>(null);
  const [lots, setLots]               = useState(1);
  const [basket, setBasket]           = useState<BasketLeg[]>([]);
  const basketIdRef                   = useRef(0);
  const [payoffOpen, setPayoffOpen]   = useState(false);
  const [chargesOpen, setChargesOpen] = useState(false);
  const [regFeesOpen, setRegFeesOpen] = useState(false);

  const handleRowTap = useCallback((strike: number, side: "call" | "put", ltp: number, bid: number, ask: number) => {
    setSelected((prev) => {
      if (prev && prev.strike === strike && prev.side === side) return null;
      setLots(1);
      const defaultMode = level === 2 ? "buy" : "sell";
      return { strike, side, mode: defaultMode, ltp, bid, ask };
    });
  }, [level]);

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
  const expiryTag = expiryGroups.flatMap(g => g.items).find(i => i.date === expiry)?.tag ?? "";

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
          onClick={() => setLevelOpen(true)}
          className="flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-[13px] font-semibold text-foreground active:opacity-70 shrink-0"
        >
          {level ? `L${level}` : "Level"} <ChevronDown size={13} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => setExpiryOpen(true)}
          className="flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-[13px] font-semibold text-foreground active:opacity-70 shrink-0"
        >
          <span className="text-muted-foreground font-normal">Expiry</span> {expiryShort} <span className="text-muted-foreground font-normal">({expiryTag})</span> <ChevronDown size={13} strokeWidth={2.5} />
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

          {/* OI bars — anchored at strike cell edges, grow outward */}
          {(() => {
            const maxCallOI = Math.max(...chain.map(r => r.call.oi));
            const maxPutOI  = Math.max(...chain.map(r => r.put.oi));
            const strikeRight = `calc(50% + ${STRIKE_W / 2}px)`;
            return chain.map((row, rowIdx) => {
              const redPct   = (row.put.oi  / maxPutOI)  * 100;
              const greenPct = (row.call.oi / maxCallOI) * 100;
              return (
                <div key={`oi-${row.strike}`} className="pointer-events-none" style={{ position: "absolute", top: rowIdx * ROW_H + ROW_H - 3, left: 0, right: 0, height: 3, zIndex: 1 }}>
                  {/* Red — container spans app-left → strike-left; bar right-aligned so it touches the strike */}
                  <div className="absolute top-0 bottom-0 flex justify-end" style={{ left: 0, right: `calc(50% + ${STRIKE_W / 2}px)` }}>
                    <div className="h-full bg-loss/50" style={{ width: `${redPct}%`, borderRadius: "3px 0 0 3px" }} />
                  </div>
                  {/* Green — container spans strike-right → app-right; bar left-aligned so it touches the strike */}
                  <div className="absolute top-0 bottom-0 flex justify-start" style={{ left: strikeRight, right: 0 }}>
                    <div className="h-full bg-gain/50" style={{ width: `${greenPct}%`, borderRadius: "0 3px 3px 0" }} />
                  </div>
                </div>
              );
            });
          })()}

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
                  : isATM ? "bg-muted" : callITM ? "bg-gain/[0.08]" : callOTM ? "bg-amber-50/70" : "";
                return (
                  <div
                    key={row.strike}
                    onClick={() => handleRowTap(row.strike, "call", row.call.ltp, row.call.bid, row.call.ask)}
                    className={cn(
                      "flex items-center justify-end border-b border-border/40 cursor-pointer active:opacity-75",
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
                  : isATM ? "bg-muted" : putITM ? "bg-gain/[0.08]" : putOTM ? "bg-amber-50/70" : "";
                return (
                  <div
                    key={row.strike}
                    onClick={() => handleRowTap(row.strike, "put", row.put.ltp, row.put.bid, row.put.ask)}
                    className={cn(
                      "flex items-center justify-start border-b border-border/40 cursor-pointer active:opacity-75",
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
            {chain.map((row) => {
              const isATM         = row.strike === atmStrike;
              const isRowSelected = selected?.strike === row.strike;
              return (
                <div
                  key={row.strike}
                  className={cn(
                    "relative flex flex-col items-center justify-center border-b border-border/40",
                    isATM && !isRowSelected ? "bg-muted" : "bg-background",
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
                  {isATM ? (
                    <span
                      className="text-[13px] font-semibold tabular-nums text-foreground"
                      style={{
                        border: "1.5px solid rgba(0,0,0,0.2)",
                        background: "rgba(0,0,0,0.04)",
                        borderRadius: 4,
                        padding: "2px 6px",
                      }}
                    >
                      {row.strike.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-[13px] font-semibold tabular-nums text-muted-foreground">
                      {row.strike.toFixed(1)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── Legend + contract info (hidden when trade footer is open) ── */}
      {!selected && basket.length === 0 && (
        <div className="shrink-0 border-t border-border/40 bg-background">
          {/* Row 1: ITM / ATM / OTM legend */}
          <div className="flex items-center justify-center gap-4 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gain/50" />
              <span className="text-[11px] text-muted-foreground"><span className="font-semibold text-foreground">ITM</span> In The Money</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-muted border border-border/60" />
              <span className="text-[11px] text-muted-foreground"><span className="font-semibold text-foreground">ATM</span> At The Money</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-300" />
              <span className="text-[11px] text-muted-foreground"><span className="font-semibold text-foreground">OTM</span> Out of Money</span>
            </div>
          </div>
          {/* Row 2: contract info */}
          <div className="flex items-center justify-around px-4 pb-3 border-t border-border/20">
            <div className="text-center pt-2">
              <p className="text-[10px] text-muted-foreground mb-0.5">Lot Size</p>
              <p className="text-[12px] font-semibold text-foreground">1 Lot = 100</p>
            </div>
            <div className="w-px h-7 bg-border/40" />
            <div className="text-center pt-2">
              <p className="text-[10px] text-muted-foreground mb-0.5">Buy Price</p>
              <p className="text-[12px] font-semibold text-foreground">Premium × 100</p>
            </div>
            <div className="w-px h-7 bg-border/40" />
            <div className="text-center pt-2">
              <p className="text-[10px] text-muted-foreground mb-0.5">Sell Margin</p>
              <p className="text-[12px] font-semibold text-foreground">~$1,240 / Lot</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Level 2 basket (shown above footer when basket has legs) ── */}
      <AnimatePresence>
        {level === 2 && basket.length > 0 && !selected && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 35 }}
            className="shrink-0 border-t border-border/40 bg-background px-4 pt-3 pb-8"
          >
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[13px] font-bold text-foreground">Basket · {basket.length} {basket.length === 1 ? "Leg" : "Legs"}</p>
              <button onClick={() => setBasket([])} className="text-[11px] text-muted-foreground active:opacity-60">Clear all</button>
            </div>
            {/* Legs */}
            <div className="flex flex-col gap-1.5 mb-3">
              {basket.map((leg) => (
                <div key={leg.id} className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2.5">
                  <span className={cn(
                    "text-[10px] font-bold rounded-md px-1.5 py-0.5 uppercase shrink-0",
                    leg.mode === "buy" ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
                  )}>{leg.mode}</span>
                  <p className="flex-1 text-[13px] font-semibold text-foreground tabular-nums">
                    {leg.strike.toFixed(1)} {leg.side === "call" ? "CE" : "PE"}
                    <span className="font-normal text-muted-foreground"> · {leg.lots} {leg.lots === 1 ? "lot" : "lots"}</span>
                  </p>
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {leg.mode === "sell" ? `Margin $${(leg.bid * leg.lots * 100 * 3.2).toFixed(0)}` : `$${leg.ask.toFixed(2)}`}
                  </span>
                  <button onClick={() => setBasket((b) => b.filter((l) => l.id !== leg.id))} className="ml-1 active:opacity-60">
                    <Trash2 size={13} className="text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>

            {/* Payoff + Available + Margin — single row */}
            {(() => {
              const available   = 12450;
              const totalMargin = basket.reduce((s, leg) =>
                leg.mode === "sell" ? s + leg.bid * leg.lots * 100 * 3.2 : s + leg.ask * leg.lots * 100, 0);
              const brokerage    = +(totalMargin * 0.05 / 100).toFixed(2);
              const secFee       = +(totalMargin * 0.02 / 100).toFixed(2);
              const finraFee     = +(totalMargin * 0.015 / 100).toFixed(2);
              const exchangeFees = +(totalMargin * 0.02 / 100).toFixed(2);
              const opraFee      = +(totalMargin * 0.01 / 100).toFixed(2);
              const regFees      = +(secFee + finraFee + exchangeFees + opraFee).toFixed(2);
              const totalCharges = +(brokerage + regFees).toFixed(2);
              const fmt = (v: number) => `$${v.toFixed(2)}`;
              return (
                <>
                  {/* Single row: Payoff square | Available | Margin Required */}
                  <div className="flex gap-2 mb-3">
                    {/* Payoff mini square */}
                    <button
                      onClick={() => setPayoffOpen(true)}
                      className="w-[72px] shrink-0 rounded-xl bg-muted/50 border border-border/40 flex flex-col items-center justify-center gap-1 py-2 active:opacity-70"
                    >
                      <MiniPayoffGraph legs={basket} stockPrice={currentPrice} />
                      <p className="text-[9px] text-muted-foreground leading-none">Payoff</p>
                    </button>
                    <div className="flex-1 rounded-xl bg-muted/50 px-3 py-2.5">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Available</p>
                      <p className="text-[14px] font-bold text-foreground tabular-nums">${available.toLocaleString()}</p>
                    </div>
                    <div className={cn("flex-1 rounded-xl px-3 py-2.5", totalMargin > available ? "bg-loss/10" : "bg-muted/50")}>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Req. Margin</p>
                      <p className={cn("text-[13px] font-bold tabular-nums", totalMargin > available ? "text-loss" : "text-foreground")}>
                        ${Math.round(totalMargin).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Charges — collapsed by default */}
                  <div className="rounded-xl bg-muted/40 overflow-hidden mb-3">
                    {/* Total charges row — toggles expansion */}
                    <button
                      onClick={() => setChargesOpen(v => !v)}
                      className="w-full flex items-center justify-between px-3 pt-3 pb-2.5 bg-background active:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Charges &amp; Fees</span>
                        <ChevronDown size={11} className={cn("text-muted-foreground transition-transform", chargesOpen && "rotate-180")} />
                      </div>
                      <span className="text-[13px] font-bold text-foreground tabular-nums">{fmt(totalCharges)}</span>
                    </button>

                    {chargesOpen && (
                      <div className="px-3 pb-2.5 space-y-0">
                        {/* Aspora Brokerage */}
                        <div className="flex items-center justify-between py-2 border-t border-border/30">
                          <span className="text-[13px] text-muted-foreground">Aspora Brokerage</span>
                          <span className="text-[13px] text-foreground tabular-nums">{fmt(brokerage)}</span>
                        </div>

                        {/* Regulatory Fees — collapsed by default */}
                        <div className="border-t border-border/30">
                          <button
                            onClick={() => setRegFeesOpen(v => !v)}
                            className="w-full flex items-center justify-between py-2 active:opacity-70"
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-[13px] text-muted-foreground">Regulatory Fees</span>
                              <ChevronDown size={11} className={cn("text-muted-foreground transition-transform", regFeesOpen && "rotate-180")} />
                            </div>
                            <span className="text-[13px] text-foreground tabular-nums">{fmt(regFees)}</span>
                          </button>
                          {regFeesOpen && [
                            { label: "SEC Fee",       val: secFee },
                            { label: "FINRA Fee",     val: finraFee },
                            { label: "Exchange Fees", val: exchangeFees },
                            { label: "OPRA Fee",      val: opraFee },
                          ].map(({ label, val }) => (
                            <div key={label} className="flex items-center justify-between py-1.5 pl-3">
                              <span className="text-[12px] text-muted-foreground/70">{label}</span>
                              <span className="text-[12px] text-muted-foreground tabular-nums">{fmt(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

            <button className="w-full flex items-center justify-center rounded-xl bg-foreground text-background text-[15px] font-bold py-3.5 active:opacity-85">
              Review Strategy
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Payoff full sheet ── */}
      <AnimatePresence>
        {payoffOpen && basket.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-40"
              onClick={() => setPayoffOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-background overflow-hidden"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <div className="flex items-center justify-between px-5 pb-2">
                <p className="text-[18px] font-bold text-foreground">Payoff · {basket.length} {basket.length === 1 ? "Leg" : "Legs"}</p>
                <button onClick={() => setPayoffOpen(false)} className="rounded-full p-1.5 bg-muted/60 active:opacity-70">
                  <X size={14} strokeWidth={2.5} className="text-foreground" />
                </button>
              </div>
              <div className="px-4 pb-8">
                <BasketPayoffChart legs={basket} stockPrice={currentPrice} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
            <div className="flex items-center justify-between mb-3">
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
                  <span className="font-normal text-muted-foreground">LTP ${selected.ltp.toFixed(2)} · {selected.mode === "buy" ? "Ask" : "Bid"} ${(selected.mode === "buy" ? selected.ask : selected.bid).toFixed(2)}</span>
                </p>
                <ChevronRight size={14} strokeWidth={2.2} className="text-muted-foreground shrink-0 ml-0.5" />
              </button>
              <button onClick={() => setSelected(null)} className="rounded-full p-1.5 bg-muted/60 active:opacity-70 shrink-0 ml-2">
                <X size={14} strokeWidth={2.5} className="text-foreground" />
              </button>
            </div>

            {(() => {
              const available = 12450;
              const activePrice = selected.mode === "buy" ? selected.ask : selected.bid;
              const reqMargin = activePrice * lots * 100;
              const insufficient = reqMargin > available;
              return (
                <>
                  {level === 2 ? (
                    <>
                      {/* Row 1: Premium/Margin (left) + Buy/Sell pills (right) */}
                      {(() => {
                        const isSell = selected.mode === "sell";
                        const displayAmt = isSell
                          ? (activePrice * lots * 100 * 3.2).toLocaleString("en-US", { minimumFractionDigits: 0 })
                          : (activePrice * lots * 100).toLocaleString("en-US", { minimumFractionDigits: 0 });
                        return (
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-1">
                            {isSell ? "Margin" : "Premium"}
                          </span>
                          <span className="text-[20px] font-bold text-foreground tabular-nums leading-none">${displayAmt}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(["buy", "sell"] as const).map((m) => (
                            <button key={m}
                              onClick={() => setSelected((s) => s ? { ...s, mode: m } : s)}
                              className={cn(
                                "px-5 py-2 rounded-full text-[13px] font-bold transition-colors",
                                selected.mode === m
                                  ? m === "buy" ? "bg-gain text-white" : "bg-loss text-white"
                                  : "bg-muted/60 text-muted-foreground"
                              )}
                            >
                              {m === "buy" ? "Buy" : "Sell"}
                            </button>
                          ))}
                        </div>
                      </div>
                        );
                      })()}

                      {/* Row 2: Lots stepper + Add Leg */}
                      <div className="flex items-stretch gap-2" style={{ height: 46 }}>
                        <div className="flex items-stretch rounded-xl border border-border/60 overflow-hidden shrink-0">
                          <button onClick={() => setLots((l) => Math.max(1, l - 1))} className="flex items-center justify-center px-3 active:bg-muted/60 transition-colors">
                            <Minus size={14} strokeWidth={2.5} className="text-foreground" />
                          </button>
                          <span className="flex items-center justify-center px-2 text-[15px] font-bold text-foreground tabular-nums min-w-[28px]">{lots}</span>
                          <button onClick={() => setLots((l) => l + 1)} className="flex items-center justify-center px-3 active:bg-muted/60 transition-colors">
                            <Plus size={14} strokeWidth={2.5} className="text-foreground" />
                          </button>
                        </div>
                        <button
                          disabled={insufficient}
                          onClick={() => {
                            if (insufficient) return;
                            setBasket((b) => [...b, { ...selected, lots, id: ++basketIdRef.current }]);
                            setSelected(null);
                          }}
                          className={cn(
                            "flex-1 flex items-center justify-center rounded-xl text-[14px] font-bold transition-colors",
                            insufficient
                              ? "bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
                              : selected.mode === "buy"
                                ? "bg-gain text-white active:opacity-85"
                                : "bg-loss text-white active:opacity-85"
                          )}
                        >
                          + Add Leg
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                  <div className="flex gap-2.5 mb-3">
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

                  <div className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5 mb-3">
                    <Info size={13} className="text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {selected.side === "call"
                        ? "Covered calls require you to own shares of this stock."
                        : "Cash-secured puts require sufficient cash to buy the shares if assigned."}
                    </p>
                  </div>

                  <div className="flex items-stretch gap-2.5" style={{ height: 50 }}>
                    <div className="flex items-stretch rounded-xl border border-border/60 overflow-hidden shrink-0">
                      <button onClick={() => setLots((l) => Math.max(1, l - 1))} className="flex items-center justify-center px-3 active:bg-muted/60 transition-colors">
                        <Minus size={14} strokeWidth={2.5} className="text-foreground" />
                      </button>
                      <span className="flex items-center justify-center px-2 text-[15px] font-bold text-foreground tabular-nums min-w-[30px]">{lots}</span>
                      <button onClick={() => setLots((l) => l + 1)} className="flex items-center justify-center px-3 active:bg-muted/60 transition-colors">
                        <Plus size={14} strokeWidth={2.5} className="text-foreground" />
                      </button>
                    </div>

                      <button
                        disabled={insufficient}
                        className={cn(
                          "flex-1 flex items-center justify-center rounded-xl text-[15px] font-bold transition-colors border border-border/60",
                          insufficient ? "text-muted-foreground/40 cursor-not-allowed" : "text-foreground bg-transparent active:bg-muted/40"
                        )}
                      >
                        {selected.side === "call" ? "Sell Covered Call" : "Sell Cash-Secured Put"} · {lots} {lots === 1 ? "Lot" : "Lots"}
                      </button>
                    </div>
                    </>
                  )}
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
              <p className="px-5 pt-2 pb-3 text-[20px] font-bold text-foreground">Options Expiry</p>
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

      {/* ── Level selector sheet ── */}
      <AnimatePresence>
        {levelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-40"
              onClick={() => { if (level) setLevelOpen(false); }}
            />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-background px-4 pt-3 pb-10"
            >
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[20px] font-bold text-foreground">Options Level</p>
                {level && (
                  <button onClick={() => setLevelOpen(false)} className="rounded-full p-1.5 active:bg-muted/50">
                    <X size={18} className="text-foreground" />
                  </button>
                )}
              </div>
              <p className="text-[13px] text-muted-foreground mb-5 leading-snug">Choose your approved options level to see the right strategies for you.</p>

              <div className="flex flex-col gap-3">
                {/* Level 1 */}
                <button
                  onClick={() => { setLevel(1); setLevelOpen(false); setBasket([]); }}
                  className={cn(
                    "w-full text-left rounded-2xl border-2 p-4 transition-colors active:opacity-80",
                    level === 1 ? "border-foreground bg-foreground/5" : "border-border/50 bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <ShieldCheck size={18} className="text-foreground" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-foreground">Level 1 — Conservative</p>
                      <p className="text-[11px] text-muted-foreground">Covered Calls · Cash-Secured Puts</p>
                    </div>
                    {level === 1 && <div className="ml-auto w-4 h-4 rounded-full bg-foreground shrink-0" />}
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Income-generating strategies backed by stock or cash. Lowest risk, suitable for retirement accounts.
                  </p>
                </button>

                {/* Level 2 */}
                <button
                  onClick={() => { setLevel(2); setLevelOpen(false); setBasket([]); }}
                  className={cn(
                    "w-full text-left rounded-2xl border-2 p-4 transition-colors active:opacity-80",
                    level === 2 ? "border-foreground bg-foreground/5" : "border-border/50 bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Zap size={18} className="text-foreground" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-foreground">Level 2 — Standard</p>
                      <p className="text-[11px] text-muted-foreground">Long Calls · Long Puts · Spreads · Straddles</p>
                    </div>
                    {level === 2 && <div className="ml-auto w-4 h-4 rounded-full bg-foreground shrink-0" />}
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Buy calls and puts directionally, or combine multiple legs into spreads and straddles. Risk limited to premium paid.
                  </p>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <HomeIndicator />
    </div>
  );
}
