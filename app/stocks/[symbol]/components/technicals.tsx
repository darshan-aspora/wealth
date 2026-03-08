"use client";

import { cn } from "@/lib/utils";
import { AIAnnotation } from "./ai-annotation";
import { TECHNICALS } from "./mock-data";
import { formatPrice } from "@/components/ticker";

interface TechnicalsProps {
  symbol: string;
}

export function Technicals({ symbol }: TechnicalsProps) {
  const data = TECHNICALS[symbol];
  if (!data) return null;

  const signalColor = {
    Bullish: "text-[hsl(var(--gain))]",
    Bearish: "text-[hsl(var(--loss))]",
    Neutral: "text-muted-foreground",
  }[data.signal];

  const dotColor = {
    Bullish: "bg-[hsl(var(--gain))]",
    Bearish: "bg-[hsl(var(--loss))]",
    Neutral: "bg-muted-foreground",
  }[data.signal];

  return (
    <div className="px-4 py-4">
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        Technical Analysis
      </h2>

      {/* Signal */}
      <div className="mb-5 flex items-center gap-2">
        <span className="text-[14px] text-muted-foreground">Signal:</span>
        <div className={cn("h-2.5 w-2.5 rounded-full", dotColor)} />
        <span className={cn("text-[17px] font-bold", signalColor)}>
          {data.signal}
        </span>
      </div>

      {/* MA Summary */}
      <SignalBar
        label="Moving Averages"
        buy={data.movingAverages.buy}
        sell={data.movingAverages.sell}
        neutral={data.movingAverages.neutral}
      />

      {/* Oscillator Summary */}
      <div className="mt-4">
        <SignalBar
          label="Oscillators"
          buy={data.oscillators.buy}
          sell={data.oscillators.sell}
          neutral={data.oscillators.neutral}
        />
      </div>

      {/* Key Levels */}
      <div className="mt-5">
        <p className="mb-3 text-[14px] font-medium text-foreground">Key Levels</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[hsl(var(--gain))]/20 bg-[hsl(var(--gain))]/[0.03] p-3">
            <p className="mb-1 text-[12px] uppercase tracking-wider text-muted-foreground">Support</p>
            {data.keyLevels.support.map((level) => (
              <p key={level} className="font-mono text-[15px] font-medium tabular-nums text-[hsl(var(--gain))]">
                ${formatPrice(level)}
              </p>
            ))}
          </div>
          <div className="rounded-xl border border-[hsl(var(--loss))]/20 bg-[hsl(var(--loss))]/[0.03] p-3">
            <p className="mb-1 text-[12px] uppercase tracking-wider text-muted-foreground">Resistance</p>
            {data.keyLevels.resistance.map((level) => (
              <p key={level} className="font-mono text-[15px] font-medium tabular-nums text-[hsl(var(--loss))]">
                ${formatPrice(level)}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="mt-4">
        <AIAnnotation size="md">{data.aiSummary}</AIAnnotation>
      </div>
    </div>
  );
}

function SignalBar({
  label,
  buy,
  sell,
  neutral,
}: {
  label: string;
  buy: number;
  sell: number;
  neutral: number;
}) {
  const total = buy + sell + neutral;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[14px] font-medium text-foreground">{label}</span>
        <div className="flex gap-3 text-[13px]">
          <span className="text-[hsl(var(--gain))]">{buy} Buy</span>
          <span className="text-muted-foreground">{neutral} Neutral</span>
          <span className="text-[hsl(var(--loss))]">{sell} Sell</span>
        </div>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full">
        <div
          className="bg-[hsl(var(--gain))]"
          style={{ width: `${(buy / total) * 100}%` }}
        />
        <div
          className="bg-muted-foreground/30"
          style={{ width: `${(neutral / total) * 100}%` }}
        />
        <div
          className="bg-[hsl(var(--loss))]"
          style={{ width: `${(sell / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
