"use client";

import { Plus, GitCompareArrows, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  onAddStock: () => void;
  onQuickStart: (symbols: string[]) => void;
}

const SUGGESTED_PAIRS: { label: string; symbols: string[]; caption: string }[] = [
  { label: "AAPL vs NVDA", symbols: ["AAPL", "NVDA"], caption: "Cash machine vs AI growth story" },
  { label: "TSLA vs RIVN", symbols: ["TSLA", "RIVN"], caption: "Scaled profitability vs burn-to-scale" },
  { label: "GOOGL vs META", symbols: ["GOOGL", "META"], caption: "Diversified ads vs concentrated ads" },
];

export function EmptyState({ onAddStock, onQuickStart }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 pt-10 pb-12">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <GitCompareArrows size={24} strokeWidth={1.75} className="text-foreground" />
      </div>

      <h1 className="text-center text-[22px] font-bold leading-tight text-foreground max-w-[300px]">
        Pick two or three stocks you&rsquo;re deciding between.
      </h1>
      <p className="mt-3 text-center text-[15px] leading-relaxed text-muted-foreground max-w-[320px]">
        Compare tells you where they actually differ — not just the numbers, the story behind them.
      </p>

      <button
        type="button"
        onClick={onAddStock}
        className="mt-7 flex items-center gap-2 rounded-2xl bg-foreground px-6 py-3.5 text-background active:scale-[0.97] transition-transform"
      >
        <Plus size={17} strokeWidth={2.5} />
        <span className="text-[15px] font-bold">Add your first stock</span>
      </button>

      <div className="mt-10 w-full max-w-[380px]">
        <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/60 pb-2">
          Or try
        </p>
        {SUGGESTED_PAIRS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onQuickStart(p.symbols)}
            className="w-full flex items-center gap-3 py-4 text-left border-b border-border/25 active:bg-muted/40 transition-colors"
          >
            <div className="flex-1">
              <p className="text-[16px] font-bold text-foreground">{p.label}</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">{p.caption}</p>
            </div>
            <ArrowRight size={16} strokeWidth={2.25} className="text-muted-foreground/60" />
          </button>
        ))}
      </div>
    </div>
  );
}
