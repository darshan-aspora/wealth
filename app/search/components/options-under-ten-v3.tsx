"use client";

import { Target } from "lucide-react";

/**
 * Options Under $10 V3 — Stacked Cards with Left Accent Border
 * Full-width cards with a colored left border (green=call, red=put).
 * Contract name, price + change inline, metric pills row (IV, Vol, OI).
 */

interface CheapOption {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  iv: number;
  volume: string;
  oi: string;
  expiry: string;
  kind: "Call" | "Put";
}

const cheapOptions: CheapOption[] = [
  { symbol: "AAPL 230C", name: "AAPL Mar 21 230 Call", price: 4.85, changePct: 17.43, iv: 28.4, volume: "12.4K", oi: "84.2K", expiry: "Mar 21", kind: "Call" },
  { symbol: "AAPL 220P", name: "AAPL Mar 21 220 Put", price: 2.18, changePct: -19.85, iv: 26.8, volume: "9.8K", oi: "62.1K", expiry: "Mar 21", kind: "Put" },
  { symbol: "NVDA 140C", name: "NVDA Apr 4 140 Call", price: 6.42, changePct: 39.87, iv: 51.3, volume: "24.1K", oi: "112K", expiry: "Apr 4", kind: "Call" },
  { symbol: "SPY 600P", name: "SPY Mar 21 600 Put", price: 3.18, changePct: -12.88, iv: 15.2, volume: "45.8K", oi: "210K", expiry: "Mar 21", kind: "Put" },
  { symbol: "QQQ 525C", name: "QQQ Mar 28 525 Call", price: 8.42, changePct: 15.84, iv: 18.4, volume: "32.5K", oi: "156K", expiry: "Mar 28", kind: "Call" },
  { symbol: "QQQ 515P", name: "QQQ Mar 28 515 Put", price: 5.68, changePct: -12.62, iv: 17.8, volume: "28.1K", oi: "142K", expiry: "Mar 28", kind: "Put" },
];

export function OptionsUnderTenV3() {
  return (
    <div className="px-5">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Target size={14} className="text-muted-foreground/50" />
        <h3 className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground/50">
          Options Under 10
        </h3>
      </div>
      <div className="space-y-2.5">
        {cheapOptions.map((opt) => {
          const isUp = opt.changePct >= 0;
          const isCall = opt.kind === "Call";
          return (
            <button
              key={opt.symbol}
              className={`relative flex w-full flex-col rounded-2xl border border-border/40 bg-card/60 p-4 pl-5 text-left active:scale-[0.98] transition-transform overflow-hidden`}
            >
              {/* Left accent border */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                  isCall ? "bg-gain" : "bg-loss"
                }`}
              />

              {/* Row 1: Contract + Price */}
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-foreground leading-tight">
                      {opt.symbol}
                    </p>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        isCall ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                      }`}
                    >
                      {opt.kind}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground/45 mt-0.5">
                    Exp {opt.expiry}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[17px] font-bold tabular-nums text-foreground">
                    {opt.price.toFixed(2)}
                  </p>
                  <p
                    className={`text-[13px] font-semibold tabular-nums ${
                      isUp ? "text-gain" : "text-loss"
                    }`}
                  >
                    {isUp ? "+" : ""}{opt.changePct.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Row 2: Metric pills */}
              <div className="mt-2.5 flex gap-2">
                <span className="rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  IV <span className="text-foreground/70">{opt.iv}%</span>
                </span>
                <span className="rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  Vol <span className="text-foreground/70">{opt.volume}</span>
                </span>
                <span className="rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  OI <span className="text-foreground/70">{opt.oi}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
