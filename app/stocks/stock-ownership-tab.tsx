"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── SVG Helpers ──────────────────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startDeg: number, endDeg: number
): string {
  const oS = polarToCartesian(cx, cy, outerR, startDeg);
  const oE = polarToCartesian(cx, cy, outerR, endDeg);
  const iE = polarToCartesian(cx, cy, innerR, endDeg);
  const iS = polarToCartesian(cx, cy, innerR, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(3);
  return (
    `M${f(oS.x)} ${f(oS.y)} ` +
    `A${outerR} ${outerR} 0 ${large} 1 ${f(oE.x)} ${f(oE.y)} ` +
    `L${f(iE.x)} ${f(iE.y)} ` +
    `A${innerR} ${innerR} 0 ${large} 0 ${f(iS.x)} ${f(iS.y)}Z`
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface OwnershipRow {
  key:   string;
  label: string;
  color: string;
  /** [2026, 2025, 2024, yoy%] */
  vals:  [number, number, number, number];
}

const OWNERSHIP_ROWS: OwnershipRow[] = [
  { key: "institutional", label: "Institutional",     color: "#334155", vals: [55.8, 54.8, 50.2, -0.3] },
  { key: "mutual_funds",  label: "Mutual Funds (MF)", color: "#6d28d9", vals: [32.3, 30.3, 28.3,  1.2] },
  { key: "insiders",      label: "Insiders",          color: "#e11d48", vals: [15.2, 14.2, 16.4,  0.6] },
  { key: "companies",     label: "Companies",         color: "#d97706", vals: [12.8, 11.8, 10.2,  1.0] },
  { key: "etfs",          label: "ETFs",              color: "#0891b2", vals: [ 8.6,  9.6, 10.2, -1.2] },
];

const COL_HEADERS = ["2026", "2025", "2024", "YoY% 25-26"] as const;

interface InsiderTx {
  id:     string;
  name:   string;
  role:   string;
  date:   string;
  action: string;
  amount: string;
  notes:  string;
}

const INSIDER_TXS: InsiderTx[] = [
  {
    id: "tx1", name: "Tim Cook", role: "CEO", date: "Jan 08",
    action: "Exercised options & sold", amount: "$63M",
    notes: "Part of a scheduled 10b5-1 plan — proceeds used for tax obligations per SEC Form 4 disclosure.",
  },
  {
    id: "tx2", name: "Luca Maestri", role: "CFO", date: "Jan 15",
    action: "Sold", amount: "$18M",
    notes: "Routine annual sale under pre-scheduled plan consistent with similar transactions over the past 3 years.",
  },
  {
    id: "tx3", name: "Jeff Williams", role: "COO", date: "Feb 03",
    action: "Sold", amount: "$12.4M",
    notes: "Vested RSU conversion and immediate sale — standard executive compensation event per proxy filing.",
  },
  {
    id: "tx4", name: "Katherine Adams", role: "General Counsel", date: "Feb 18",
    action: "Sold", amount: "$8.2M",
    notes: "Pre-planned 10b5-1 disposal consistent with prior-year activity; no discretionary trading per company policy.",
  },
  {
    id: "tx5", name: "Chris Kondo", role: "Principal Accounting Officer", date: "Mar 05",
    action: "Exercised options & sold", amount: "$3.1M",
    notes: "Option exercise at expiry under approved equity plan — standard annual liquidity event per SEC Form 4.",
  },
];

interface Holder { name: string; pct: string; }

const TOP_SHAREHOLDERS: Holder[] = [
  { name: "Vanguard Group",           pct: "8.42%" },
  { name: "BlackRock Inc.",           pct: "6.79%" },
  { name: "Berkshire Hathaway",       pct: "5.83%" },
  { name: "Fidelity Management",      pct: "4.12%" },
  { name: "State Street Corp.",       pct: "3.91%" },
  { name: "Geode Capital Mgmt",       pct: "2.14%" },
  { name: "T. Rowe Price",            pct: "1.83%" },
  { name: "JPMorgan Chase & Co.",     pct: "1.42%" },
];

const TOP_ETF_HOLDERS: Holder[] = [
  { name: "Vanguard Total Stock Mkt",    pct: "3.91%" },
  { name: "Invesco QQQ Trust",           pct: "3.14%" },
  { name: "iShares Core S&P 500 ETF",    pct: "2.86%" },
  { name: "SPDR S&P 500 ETF Trust",      pct: "2.62%" },
  { name: "Vanguard Growth ETF",         pct: "1.98%" },
  { name: "iShares Russell 1000 Growth", pct: "1.74%" },
  { name: "Invesco NASDAQ 100 ETF",      pct: "1.52%" },
  { name: "Schwab US Large-Cap Growth",  pct: "1.28%" },
];

const TOP_MF_HOLDERS: Holder[] = [
  { name: "Vanguard Index Funds",           pct: "3.62%" },
  { name: "Fidelity Concord Street Trust",  pct: "2.94%" },
  { name: "Growth Fund Of America",         pct: "2.43%" },
  { name: "Vanguard Institutional Index",   pct: "2.18%" },
  { name: "Vanguard World Fund",            pct: "1.87%" },
  { name: "JPMorgan Trust II",              pct: "1.42%" },
  { name: "TIAA-CREF Funds",               pct: "1.21%" },
  { name: "New Perspective Fund",           pct: "0.98%" },
];

// ─── Donut Chart ──────────────────────────────────────────────────────────────
// Uses motion.g with animate={{ x, y }} so Framer Motion applies SVG-native
// translate() — avoids the jerk caused by CSS transform-box defaulting to
// the viewport origin instead of the element's own bounding box.

function DonutChart({
  selectedKey,
  onSelect,
}: {
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const CX = 90, CY = 90, OUTER_R = 76, INNER_R = 52, GAP = 1.5;
  const total = OWNERSHIP_ROWS.reduce((s, r) => s + r.vals[0], 0);

  let cumAngle = 0;
  const segments = OWNERSHIP_ROWS.map((row) => {
    const sweep    = (row.vals[0] / total) * 360;
    const startDeg = cumAngle + GAP / 2;
    const endDeg   = cumAngle + sweep - GAP / 2;
    cumAngle += sweep;
    const midDeg = (startDeg + endDeg) / 2;
    const midRad = ((midDeg - 90) * Math.PI) / 180;
    return {
      ...row, startDeg, endDeg,
      tx: +(Math.cos(midRad) * 8).toFixed(3),
      ty: +(Math.sin(midRad) * 8).toFixed(3),
    };
  });

  const selected = OWNERSHIP_ROWS.find((r) => r.key === selectedKey) ?? OWNERSHIP_ROWS[2];

  return (
    <div className="relative mx-auto" style={{ width: 180, height: 180 }}>
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        overflow="visible"
        aria-label="Ownership breakdown chart"
      >
        {segments.map((seg) => {
          const active = seg.key === selectedKey;
          return (
            <motion.g
              key={seg.key}
              onClick={() => onSelect(seg.key)}
              animate={{ x: active ? seg.tx : 0, y: active ? seg.ty : 0 }}
              transition={{ type: "spring", stiffness: 480, damping: 32, mass: 0.7 }}
              style={{ cursor: "pointer" }}
            >
              <path
                d={describeArc(CX, CY, OUTER_R, INNER_R, seg.startDeg, seg.endDeg)}
                fill={seg.color}
                style={{
                  opacity: active ? 1 : 0.52,
                  transition: "opacity 0.18s ease",
                }}
              />
            </motion.g>
          );
        })}
      </svg>

      {/* Center text — absolute overlay so it stays perfectly centred */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.span
          key={selectedKey + "-pct"}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
          className="text-[22px] font-bold tabular-nums leading-none"
          style={{ color: selected.color }}
        >
          {selected.vals[0]}%
        </motion.span>
        <motion.span
          key={selectedKey + "-label"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, delay: 0.05 }}
          className="mt-1.5 text-[12px] text-muted-foreground text-center px-6 leading-tight"
        >
          {selected.label}
        </motion.span>
      </div>
    </div>
  );
}

// ─── Ownership Table ──────────────────────────────────────────────────────────

function OwnershipTable({
  selectedKey,
  onSelect,
}: {
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/40">
      <div className="flex">
        {/* Fixed category column */}
        <div className="w-[140px] shrink-0 border-r border-border/40">
          <div className="bg-muted/60 px-3 py-2.5 border-b border-border/40">
            <span className="text-[12px] font-medium text-muted-foreground opacity-70">Category</span>
          </div>
          {OWNERSHIP_ROWS.map((row) => (
            <button
              key={row.key}
              onClick={() => onSelect(row.key)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-[11px] border-b border-border/25 last:border-0 text-left transition-colors",
                selectedKey === row.key ? "bg-muted/50" : "bg-background active:bg-muted/30"
              )}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
              <span className="text-[13px] text-foreground leading-snug">{row.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable year + YoY columns */}
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex min-w-max">
            {COL_HEADERS.map((header, colIdx) => {
              const isYoy = colIdx === 3;
              return (
                <div key={header} className="w-[78px] shrink-0">
                  <div className="bg-muted/60 px-2 py-2.5 border-b border-border/40">
                    <span className="text-[12px] font-medium text-muted-foreground opacity-70 whitespace-nowrap">
                      {header}
                    </span>
                  </div>
                  {OWNERSHIP_ROWS.map((row) => {
                    const val   = row.vals[colIdx];
                    const isPos = val >= 0;
                    return (
                      <div
                        key={row.key}
                        className={cn(
                          "px-2 py-[11px] border-b border-border/25 last:border-0 transition-colors",
                          selectedKey === row.key ? "bg-muted/50" : "bg-background"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[13px] tabular-nums",
                            isYoy
                              ? isPos ? "font-semibold text-gain" : "font-semibold text-loss"
                              : "font-medium text-foreground"
                          )}
                        >
                          {isYoy && isPos ? "+" : ""}
                          {val}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Insider Activity ─────────────────────────────────────────────────────────

function InsiderActivity() {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <h3 className="text-[20px] font-bold text-foreground tracking-tight">Insider Activity</h3>
        <span className="text-[15px] text-muted-foreground/60">(90 days)</span>
      </div>
      <p className="text-[13px] text-muted-foreground mb-4">
        Recent buys &amp; sells by company executives
      </p>

      {/* Fixed-height scrollable list */}
      <div className="h-[272px] overflow-y-auto no-scrollbar">
        <div className="flex flex-col divide-y divide-border/40">
          {INSIDER_TXS.map((tx) => (
            <div key={tx.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-baseline gap-1.5 flex-1 min-w-0 pr-3">
                  <span className="text-[15px] font-semibold text-foreground shrink-0">{tx.name}</span>
                  <span className="text-[12px] text-muted-foreground truncate">({tx.role})</span>
                </div>
                <span className="shrink-0 text-[14px] font-medium text-muted-foreground/70">
                  {tx.date}
                </span>
              </div>
              <p className="text-[15px] text-foreground mb-1.5">
                {tx.action} <span className="font-bold">{tx.amount}</span>
              </p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{tx.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Top Holders Table ────────────────────────────────────────────────────────

function HoldersTable({
  title,
  subtitle,
  holders,
}: {
  title:    string;
  subtitle: string;
  holders:  Holder[];
}) {
  return (
    <div>
      <h3 className="text-[20px] font-bold text-foreground tracking-tight">{title}</h3>
      <p className="mt-1 mb-5 text-[13px] text-muted-foreground">{subtitle}</p>
      <div className="w-full overflow-hidden rounded-xl border border-border/40">
        <div className="flex bg-muted/50 border-b border-border/40">
          <div className="flex-1 px-3 py-2.5">
            <span className="text-[13px] font-semibold text-muted-foreground/70">Holder</span>
          </div>
          <div className="w-[90px] shrink-0 px-3 py-2.5 text-right">
            <span className="text-[13px] font-semibold text-muted-foreground/70">Holding %</span>
          </div>
        </div>
        {holders.map((h, i) => (
          <div key={i} className="flex items-center border-b border-border/20 last:border-0">
            <div className="flex-1 min-w-0 px-3 py-3.5">
              <span className="text-[14px] text-foreground">{h.name}</span>
            </div>
            <div className="w-[90px] shrink-0 px-3 py-3.5 text-right">
              <span className="text-[14px] font-medium tabular-nums text-foreground">{h.pct}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function StockOwnershipTab({ symbol }: { symbol: string }) {
  const [selectedKey, setSelectedKey] = useState("insiders");

  return (
    <div className="pb-8 flex flex-col gap-8">
      {/* Page header */}
      <div className="px-5 pt-5">
        <h2 className="text-[20px] font-bold text-foreground tracking-tight">
          Ownership Overview
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Understand who owns {symbol} shares and how the ownership is distributed.
        </p>
      </div>

      {/* Donut + table */}
      <div className="px-5 flex flex-col gap-5">
        <DonutChart selectedKey={selectedKey} onSelect={setSelectedKey} />
        <OwnershipTable selectedKey={selectedKey} onSelect={setSelectedKey} />
      </div>

      <div className="px-5">
        <InsiderActivity />
      </div>

      <div className="px-5">
        <HoldersTable
          title="Top Shareholders"
          subtitle="Largest individual & institutional owners"
          holders={TOP_SHAREHOLDERS}
        />
      </div>

      <div className="px-5">
        <HoldersTable
          title="Top ETF Holders"
          subtitle="ETFs with highest exposure to this stock"
          holders={TOP_ETF_HOLDERS}
        />
      </div>

      <div className="px-5">
        <HoldersTable
          title="Top Mutual Fund Holders"
          subtitle="Mutual funds with highest exposure to this stock"
          holders={TOP_MF_HOLDERS}
        />
      </div>
    </div>
  );
}
