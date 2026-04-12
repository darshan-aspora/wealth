"use client";

import { Target } from "lucide-react";

/**
 * Options Under $10 V1 — Compact Table Rows
 * Dense rows with contract name, price, change%, IV, volume.
 * Call/put color coding on the left edge. Terminal-inspired, clean modern styling.
 */

interface CheapOption {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  iv: number;
  volume: string;
  expiry: string;
  kind: "Call" | "Put";
}

const cheapOptions: CheapOption[] = [
  { symbol: "AAPL 230C", name: "AAPL Mar 21 230 Call", price: 4.85, changePct: 17.43, iv: 28.4, volume: "12.4K", expiry: "Mar 21", kind: "Call" },
  { symbol: "AAPL 220P", name: "AAPL Mar 21 220 Put", price: 2.18, changePct: -19.85, iv: 26.8, volume: "9.8K", expiry: "Mar 21", kind: "Put" },
  { symbol: "AAPL 235C", name: "AAPL Apr 4 235 Call", price: 6.12, changePct: 18.15, iv: 30.1, volume: "8.2K", expiry: "Apr 4", kind: "Call" },
  { symbol: "AAPL 215P", name: "AAPL Apr 4 215 Put", price: 3.45, changePct: -15.23, iv: 29.5, volume: "5.6K", expiry: "Apr 4", kind: "Put" },
  { symbol: "AAPL 240C", name: "AAPL Apr 18 240 Call", price: 7.84, changePct: 16.67, iv: 31.2, volume: "6.4K", expiry: "Apr 18", kind: "Call" },
  { symbol: "NVDA 140C", name: "NVDA Apr 4 140 Call", price: 6.42, changePct: 39.87, iv: 51.3, volume: "24.1K", expiry: "Apr 4", kind: "Call" },
  { symbol: "SPY 600P", name: "SPY Mar 21 600 Put", price: 3.18, changePct: -12.88, iv: 15.2, volume: "45.8K", expiry: "Mar 21", kind: "Put" },
  { symbol: "QQQ 525C", name: "QQQ Mar 28 525 Call", price: 8.42, changePct: 15.84, iv: 18.4, volume: "32.5K", expiry: "Mar 28", kind: "Call" },
  { symbol: "QQQ 515P", name: "QQQ Mar 28 515 Put", price: 5.68, changePct: -12.62, iv: 17.8, volume: "28.1K", expiry: "Mar 28", kind: "Put" },
];

export function OptionsUnderTenV1() {
  return (
    <div className="px-5">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Target size={14} className="text-muted-foreground/50" />
        <h3 className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground/50">
          Options Under 10
        </h3>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40">
          <span className="min-w-0 flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Contract
          </span>
          <span className="w-[52px] text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Price
          </span>
          <span className="w-[56px] text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Change
          </span>
          <span className="w-[40px] text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground/40">
            IV
          </span>
          <span className="w-[48px] text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Vol
          </span>
        </div>
        {/* Rows */}
        {cheapOptions.map((opt, idx) => {
          const isUp = opt.changePct >= 0;
          return (
            <div
              key={opt.symbol}
              className={`flex items-center gap-2 px-4 py-2.5 ${
                idx < cheapOptions.length - 1 ? "border-b border-border/20" : ""
              }`}
            >
              {/* Call/Put indicator dot */}
              <div
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  opt.kind === "Call" ? "bg-gain" : "bg-loss"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground leading-tight">
                  {opt.symbol}
                </p>
                <p className="text-[11px] text-muted-foreground/40 leading-tight">
                  {opt.expiry}
                </p>
              </div>
              <span className="w-[52px] text-right text-[14px] font-semibold tabular-nums text-foreground">
                {opt.price.toFixed(2)}
              </span>
              <span
                className={`w-[56px] text-right text-[13px] font-medium tabular-nums ${
                  isUp ? "text-gain" : "text-loss"
                }`}
              >
                {isUp ? "+" : ""}{opt.changePct.toFixed(1)}%
              </span>
              <span className="w-[40px] text-right text-[13px] tabular-nums text-muted-foreground/60">
                {opt.iv}%
              </span>
              <span className="w-[48px] text-right text-[13px] tabular-nums text-muted-foreground/60">
                {opt.volume}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
