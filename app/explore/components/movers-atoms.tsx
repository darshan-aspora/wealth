"use client";

/**
 * Tiny UI atoms shared between the What's Moving widget and the
 * `/explore/whats-moving` power-user page.
 */

export function RangeBar({
  low,
  high,
  current,
}: {
  low: number;
  high: number;
  current: number;
}) {
  const range = high - low || 1;
  const pct = Math.max(0, Math.min(100, ((current - low) / range) * 100));

  return (
    <div className="flex items-center gap-1.5 w-full">
      <span className="text-[14px] tabular-nums text-muted-foreground whitespace-nowrap leading-none">
        {low.toFixed(0)}
      </span>
      <div className="relative flex-1 h-[3px] rounded-full bg-muted">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[12px] w-[2px] bg-foreground"
          style={{ left: `${pct}%` }}
        />
      </div>
      <span className="text-[14px] tabular-nums text-muted-foreground whitespace-nowrap leading-none">
        {high.toFixed(0)}
      </span>
    </div>
  );
}

export function ConsensusBadge({
  buy,
  hold,
  sell,
}: {
  buy: number;
  hold: number;
  sell: number;
}) {
  const total = buy + hold + sell;
  const buyPct = (buy / total) * 100;
  const holdPct = (hold / total) * 100;

  return (
    <div className="flex w-[100px] flex-col items-center gap-1">
      <div className="flex h-[5px] w-full overflow-hidden rounded-full">
        <div className="bg-emerald-500" style={{ width: `${buyPct}%` }} />
        <div className="bg-muted-foreground/40" style={{ width: `${holdPct}%` }} />
        {sell > 0 && <div className="flex-1 bg-red-500" />}
      </div>
      <div className="flex gap-2.5 tabular-nums text-[10px] tabular-nums">
        <span className="text-emerald-500">{buy}</span>
        <span className="text-muted-foreground">{hold}</span>
        <span className="text-red-500">{sell}</span>
      </div>
    </div>
  );
}
