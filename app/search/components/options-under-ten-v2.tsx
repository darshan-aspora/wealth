"use client";

/**
 * Options Under $10 V2 — Horizontal Scroll Cards
 * Each card highlights one option: price prominent, expiry badge,
 * call/put indicator, IV + volume below. Breaks from vertical list pattern.
 */

interface CheapOption {
  symbol: string;
  underlying: string;
  strike: string;
  price: number;
  changePct: number;
  iv: number;
  volume: string;
  expiry: string;
  kind: "Call" | "Put";
}

const cheapOptions: CheapOption[] = [
  { symbol: "AAPL 230C", underlying: "AAPL", strike: "230", price: 4.85, changePct: 17.43, iv: 28.4, volume: "12.4K", expiry: "Mar 21", kind: "Call" },
  { symbol: "AAPL 220P", underlying: "AAPL", strike: "220", price: 2.18, changePct: -19.85, iv: 26.8, volume: "9.8K", expiry: "Mar 21", kind: "Put" },
  { symbol: "NVDA 140C", underlying: "NVDA", strike: "140", price: 6.42, changePct: 39.87, iv: 51.3, volume: "24.1K", expiry: "Apr 4", kind: "Call" },
  { symbol: "SPY 600P", underlying: "SPY", strike: "600", price: 3.18, changePct: -12.88, iv: 15.2, volume: "45.8K", expiry: "Mar 21", kind: "Put" },
  { symbol: "AAPL 235C", underlying: "AAPL", strike: "235", price: 6.12, changePct: 18.15, iv: 30.1, volume: "8.2K", expiry: "Apr 4", kind: "Call" },
  { symbol: "QQQ 525C", underlying: "QQQ", strike: "525", price: 8.42, changePct: 15.84, iv: 18.4, volume: "32.5K", expiry: "Mar 28", kind: "Call" },
  { symbol: "QQQ 515P", underlying: "QQQ", strike: "515", price: 5.68, changePct: -12.62, iv: 17.8, volume: "28.1K", expiry: "Mar 28", kind: "Put" },
  { symbol: "AAPL 215P", underlying: "AAPL", strike: "215", price: 3.45, changePct: -15.23, iv: 29.5, volume: "5.6K", expiry: "Apr 4", kind: "Put" },
];

export function OptionsUnderTenV2() {
  return (
    <div>
      <h3 className="text-[16px] font-bold text-foreground mb-3 px-5">
        Options Under 10
      </h3>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
        {cheapOptions.map((opt) => {
          const isUp = opt.changePct >= 0;
          const isCall = opt.kind === "Call";
          return (
            <button
              key={opt.symbol}
              className="flex w-[155px] shrink-0 flex-col rounded-2xl border border-border/40 bg-card/60 p-3.5 text-left active:scale-[0.97] transition-transform"
            >
              {/* Header: underlying + call/put badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[15px] font-bold text-foreground">
                  {opt.underlying}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[13px] font-bold ${
                    isCall
                      ? "bg-gain/12 text-gain"
                      : "bg-loss/12 text-loss"
                  }`}
                >
                  {opt.kind}
                </span>
              </div>

              {/* Strike + Expiry */}
              <p className="text-[12px] text-muted-foreground/50 leading-tight">
                {opt.strike} · {opt.expiry}
              </p>

              {/* Price + Change */}
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-[18px] font-bold tabular-nums text-foreground">
                  {opt.price.toFixed(2)}
                </span>
                <span
                  className={`text-[12px] font-semibold tabular-nums ${
                    isUp ? "text-gain" : "text-loss"
                  }`}
                >
                  {isUp ? "+" : ""}{opt.changePct.toFixed(1)}%
                </span>
              </div>

              {/* IV + Vol */}
              <div className="mt-2.5 flex gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/35">IV</p>
                  <p className="text-[13px] font-medium tabular-nums text-muted-foreground/70">{opt.iv}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/35">Vol</p>
                  <p className="text-[13px] font-medium tabular-nums text-muted-foreground/70">{opt.volume}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
