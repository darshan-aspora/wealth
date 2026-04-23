"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, ChevronDown, Info, ArrowUpDown, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { generateOptionsChain } from "@/app/stocks/[symbol]/components/mock-data";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const STOCK_PRICES: Record<string, { price: number; change: number; pct: number }> = {
  NVIDIA:    { price: 924.80, change: 29.20, pct: 3.2  },
  Apple:     { price: 198.50, change:  5.60, pct: 2.9  },
  Microsoft: { price: 425.30, change:  9.10, pct: 2.2  },
  Alphabet:  { price: 176.80, change:  2.96, pct: 1.7  },
  Meta:      { price: 502.40, change:  7.54, pct: 1.5  },
};

const EXPIRY_GROUPS = [
  { label: "Daily",   dates: ["Mar 19 (0D)", "Mar 20 (1D)"] },
  { label: "Weekly",  dates: ["Mar 21", "Mar 28", "Apr 4"] },
  { label: "Monthly", dates: ["Apr 18", "May 16", "Jun 20", "Sep 19"] },
  { label: "LEAPS",   dates: ["Jan 2026", "Jan 2027", "Jan 2028"] },
];

const ALL_EXPIRIES = EXPIRY_GROUPS.flatMap((g) => g.dates);

const LTP_EXPLAINER = "LTP (Last Traded Price) is the price at which the most recent transaction for an options contract was executed. It reflects the actual last deal made in the market, and may differ from the current bid/ask.";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtVol(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OptionsChainPage() {
  const params  = useParams();
  const router  = useRouter();
  const symbol  = decodeURIComponent(params.symbol as string);

  const stock        = STOCK_PRICES[symbol] ?? { price: 200, change: 0, pct: 0 };
  const currentPrice = stock.price;

  const [expiry, setExpiry]       = useState(ALL_EXPIRIES[0]);
  const [expiryOpen, setExpiryOpen] = useState(false);
  const [ltpOpen, setLtpOpen]     = useState(false);

  const chain = useMemo(
    () => generateOptionsChain(currentPrice, symbol + expiry),
    [currentPrice, symbol, expiry],
  );

  /* Scroll ATM row into view on mount */
  const atmRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    atmRef.current?.scrollIntoView({ block: "center" });
  }, [expiry]);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* ── Header ── */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border/40">
        <button
          onClick={() => router.back()}
          className="rounded-full p-1.5 active:bg-muted/50 shrink-0"
        >
          <X size={18} className="text-foreground" strokeWidth={2} />
        </button>

        <div className="flex-1 flex items-baseline gap-1.5 min-w-0">
          <p className="text-[17px] font-bold text-foreground">{symbol}</p>
          <p className="text-[15px] font-semibold text-foreground tabular-nums">{currentPrice.toFixed(2)}</p>
          <p className={cn("text-[13px] font-semibold tabular-nums", stock.pct >= 0 ? "text-gain" : "text-loss")}>
            {stock.pct >= 0 ? "+" : ""}{stock.pct.toFixed(2)}%
          </p>
        </div>

        {/* Expiry dropdown pill */}
        <button
          onClick={() => setExpiryOpen(true)}
          className="flex items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-1.5 text-[13px] font-semibold text-foreground active:opacity-70 shrink-0"
        >
          {expiry}
          <ChevronDown size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Section labels: CALL | What is LTP? | PUT ── */}
      <div className="shrink-0 grid grid-cols-[1fr_auto_1fr] border-b border-border/40">
        <div className="text-center py-2">
          <span className="text-[12px] font-bold text-gain tracking-wider">CALL</span>
        </div>
        <button
          onClick={() => setLtpOpen(true)}
          className="flex items-center gap-1 px-3 py-2 text-[11px] font-medium text-muted-foreground active:opacity-60"
        >
          What is LTP? <Info size={12} strokeWidth={2} />
        </button>
        <div className="text-center py-2">
          <span className="text-[12px] font-bold text-loss tracking-wider">PUT</span>
        </div>
      </div>

      {/* ── Column headers: OI | LTP | Strike ↕ | LTP | OI ── */}
      <div className="shrink-0 grid grid-cols-[72px_72px_1fr_72px_72px] border-b border-border/40 bg-background">
        <div className="text-right pr-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">OI</span>
        </div>
        <div className="text-right pr-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">LTP</span>
        </div>
        <div className="text-center py-2 flex items-center justify-center gap-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Strike</span>
          <ArrowUpDown size={10} strokeWidth={2.5} className="text-muted-foreground" />
        </div>
        <div className="text-left pl-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">LTP</span>
        </div>
        <div className="text-left pl-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">OI</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {chain.map((row, idx) => {
          const isATM   = Math.abs(row.strike - currentPrice) / currentPrice < 0.01;
          const callITM = row.strike < currentPrice && !isATM;
          const putITM  = row.strike > currentPrice && !isATM;

          /* Insert ATM divider before first OTM call row */
          const prevRow   = chain[idx - 1];
          const showDivider =
            prevRow &&
            prevRow.strike <= currentPrice &&
            row.strike > currentPrice;

          return (
            <div key={row.strike}>
              {/* ATM price divider */}
              {showDivider && (
                <div className="flex items-center justify-center py-1.5 bg-foreground">
                  <span className="text-[12px] font-bold text-background tabular-nums">
                    {currentPrice.toFixed(2)}&nbsp;
                    <span className={stock.pct >= 0 ? "text-gain" : "text-loss"}>
                      {stock.pct >= 0 ? "+" : ""}{stock.pct.toFixed(2)}%
                    </span>
                  </span>
                </div>
              )}

              <div
                ref={isATM ? atmRef : undefined}
                className={cn(
                  "grid grid-cols-[72px_72px_1fr_72px_72px] border-b border-border/20",
                  callITM && "bg-gain/[0.07]",
                  putITM  && "bg-[#FFF9E6]",
                  isATM   && "bg-foreground/[0.05]",
                )}
              >
                {/* OI (call) */}
                <div className="text-right pr-3 py-3">
                  <span className="text-[13px] tabular-nums text-foreground/80">{fmtVol(row.call.oi)}</span>
                </div>
                {/* LTP (call) */}
                <div className="text-right pr-3 py-3">
                  <span className="text-[13px] font-semibold tabular-nums text-foreground">
                    ${row.call.last.toFixed(2)}
                  </span>
                </div>
                {/* Strike */}
                <div className="text-center py-3">
                  <span className={cn(
                    "text-[13px] font-semibold tabular-nums",
                    isATM ? "text-foreground" : "text-muted-foreground",
                  )}>
                    {row.strike.toFixed(1)}
                  </span>
                </div>
                {/* LTP (put) */}
                <div className="text-left pl-3 py-3">
                  <span className="text-[13px] font-semibold tabular-nums text-foreground">
                    ${row.put.last.toFixed(2)}
                  </span>
                </div>
                {/* OI (put) */}
                <div className="text-left pl-3 py-3">
                  <span className="text-[13px] tabular-nums text-foreground/80">{fmtVol(row.put.oi)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Legend ── */}
        <div className="flex items-center justify-center gap-4 px-5 py-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gain/40" />
            <span className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">ITM</span> (In The Money)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-foreground" />
            <span className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">ATM</span> (At The Money)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#FFF9E6] border border-border/40" />
            <span className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">OTM</span> (Out of The Money)
            </span>
          </div>
        </div>
      </div>

      {/* ── Expiry picker sheet ── */}
      <AnimatePresence>
        {expiryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-40"
              onClick={() => setExpiryOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-background pb-8"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <p className="px-5 pb-3 text-[17px] font-bold text-foreground">Select Expiry</p>
              <div className="overflow-y-auto max-h-[60vh] no-scrollbar">
                {EXPIRY_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {group.label}
                    </p>
                    {group.dates.map((d) => (
                      <button
                        key={d}
                        onClick={() => { setExpiry(d); setExpiryOpen(false); }}
                        className="w-full flex items-center justify-between px-5 py-3 border-t border-border/30 active:bg-muted/40"
                      >
                        <span className="text-[15px] font-medium text-foreground">{d}</span>
                        {d === expiry && <Check size={16} strokeWidth={2.5} className="text-foreground" />}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── LTP info sheet ── */}
      <AnimatePresence>
        {ltpOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-40"
              onClick={() => setLtpOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
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
              <p className="text-[15px] text-muted-foreground leading-relaxed">{LTP_EXPLAINER}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <HomeIndicator />
    </div>
  );
}
