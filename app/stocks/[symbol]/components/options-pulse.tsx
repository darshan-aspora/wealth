"use client";

import { cn } from "@/lib/utils";
import { AIAnnotation } from "./ai-annotation";
import { OPTIONS_PULSE } from "./mock-data";

interface OptionsPulseProps {
  symbol: string;
}

export function OptionsPulse({ symbol }: OptionsPulseProps) {
  const data = OPTIONS_PULSE[symbol];
  if (!data) {
    return (
      <div className="px-4 py-4">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          Options Pulse
        </h2>
        <p className="text-[14px] italic text-muted-foreground">Options data not available for this stock.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        Options Pulse
      </h2>

      {/* IV and Put/Call metrics */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <MetricBox label="IV Rank" value={`${data.ivRank}`} />
        <MetricBox label="Implied Vol" value={`${data.iv}%`} />
        <MetricBox label="Put/Call" value={data.putCallRatio.toFixed(2)} />
      </div>

      <AIAnnotation size="md">{data.ivAnnotation}</AIAnnotation>
      <div className="mt-1">
        <AIAnnotation size="md">{data.sentimentAnnotation}</AIAnnotation>
      </div>

      {/* Most Active Contracts */}
      <div className="mt-5">
        <p className="mb-3 text-[14px] font-medium text-foreground">Most Active</p>
        <div className="space-y-2">
          {data.mostActive.map((contract, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-border/40 bg-card px-3 py-2.5"
            >
              <div>
                <p className="text-[14px] font-medium text-foreground">
                  <span
                    className={cn(
                      "mr-1.5 rounded px-1.5 py-0.5 text-[12px] font-semibold",
                      contract.type === "Call"
                        ? "bg-[hsl(var(--gain))]/10 text-[hsl(var(--gain))]"
                        : "bg-[hsl(var(--loss))]/10 text-[hsl(var(--loss))]",
                    )}
                  >
                    {contract.type}
                  </span>
                  ${contract.strike} · {contract.expiry}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[14px] font-medium tabular-nums text-foreground">
                  ${contract.lastPrice.toFixed(2)}
                </p>
                <p className="font-mono text-[12px] tabular-nums text-muted-foreground">
                  Vol {(contract.volume / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-3 text-center">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-[18px] font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
