"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PORTFOLIO_SUMMARY } from "./portfolio-mock-data";

/* ------------------------------------------------------------------ */
/*  Benchmark data                                                     */
/* ------------------------------------------------------------------ */

const BENCHMARKS = [
  { name: "S&P 500", ticker: "SPX", xirr: 14.8 },
  { name: "Dow Jones", ticker: "DJI", xirr: 12.1 },
  { name: "NASDAQ", ticker: "IXIC", xirr: 17.6 },
] as const;

/* ------------------------------------------------------------------ */
/*  Widget                                                             */
/* ------------------------------------------------------------------ */

export function PortfolioVsBenchmark() {
  const [benchmarkIdx, setBenchmarkIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const benchmark = BENCHMARKS[benchmarkIdx];
  const portfolioXirr = PORTFOLIO_SUMMARY.xirr;
  const diff = portfolioXirr - benchmark.xirr;
  const beating = diff >= 0;

  return (
    <Card className="border-border/50 shadow-none overflow-hidden">
      <CardContent className="p-5">
        {/* Two columns — Portfolio vs Benchmark */}
        <div className="flex gap-3">
          {/* Portfolio */}
          <div className="flex-1">
            <p className="text-[12px] text-muted-foreground mb-1">Your Portfolio</p>
            <p className="text-[13px] text-muted-foreground/70 mb-2">Est. XIRR</p>
            <p className={cn(
              "text-[22px] font-bold tabular-nums leading-none",
              portfolioXirr >= 0 ? "text-gain" : "text-loss"
            )}>
              {portfolioXirr >= 0 ? "+" : ""}{portfolioXirr}%
            </p>
          </div>

          {/* Divider */}
          <div className="w-px bg-border/30 self-stretch" />

          {/* Benchmark */}
          <div className="flex-1">
            {/* Benchmark selector */}
            <div className="relative mb-1">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 active:opacity-70 transition-opacity"
              >
                <p className="text-[12px] text-muted-foreground">{benchmark.name}</p>
                <ChevronDown size={12} strokeWidth={2} className={cn(
                  "text-muted-foreground transition-transform",
                  dropdownOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-10 min-w-[140px] rounded-lg border border-border/60 bg-card shadow-lg py-1">
                  {BENCHMARKS.map((b, i) => (
                    <button
                      key={b.ticker}
                      onClick={() => { setBenchmarkIdx(i); setDropdownOpen(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-[13px] transition-colors",
                        i === benchmarkIdx
                          ? "text-foreground font-medium bg-muted/50"
                          : "text-muted-foreground hover:bg-muted/30"
                      )}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[13px] text-muted-foreground/70 mb-2">Est. XIRR</p>
            <p className="text-[26px] font-bold tabular-nums leading-none text-muted-foreground">
              {benchmark.xirr >= 0 ? "+" : ""}{benchmark.xirr}%
            </p>
          </div>
        </div>

        {/* Insight — full width */}
        <p className="text-[13px] font-medium mt-4 text-muted-foreground">
          {beating
            ? `Your portfolio has outperformed ${benchmark.name} by +${diff.toFixed(1)}%`
            : `Your portfolio is trailing ${benchmark.name} by ${Math.abs(diff).toFixed(1)}%`
          }
        </p>
      </CardContent>
    </Card>
  );
}
