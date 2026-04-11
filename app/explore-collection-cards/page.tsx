"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

interface Collection {
  name: string;
  description: string;
  return1y: number;
  stocks: number;
  minAmount: number;
  weighting: "Equal" | "Market Cap" | "Custom";
  type: "Stocks" | "ETFs" | "Mixed";
}

const sample: Collection[] = [
  { name: "Tech Giants", description: "High-growth silicon leaders dominating the global digital infrastructure and AI sector.", return1y: 4.2, stocks: 15, minAmount: 1234, weighting: "Market Cap", type: "Stocks" },
  { name: "AI & Robotics", description: "Top AI, automation & chip companies driving the next wave of computing.", return1y: 12.8, stocks: 10, minAmount: 500, weighting: "Equal", type: "Stocks" },
  { name: "Global ETF Pack", description: "Broad exposure across US, Europe, and emerging markets through top ETFs.", return1y: 8.1, stocks: 8, minAmount: 250, weighting: "Custom", type: "ETFs" },
  { name: "Nano Cap Winners", description: "Small companies with outsized returns. High risk, high reward micro-cap picks.", return1y: 34.2, stocks: 12, minAmount: 200, weighting: "Equal", type: "Stocks" },
];

function MetaPills({ c }: { c: Collection }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{c.stocks} {c.type}</span>
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{c.weighting === "Equal" ? "Equi Weighted" : c.weighting === "Market Cap" ? "Market Cap Weighted" : "Custom Weights"}</span>
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground tabular-nums">Min {c.minAmount.toLocaleString()}</span>
    </div>
  );
}


/* ── V1: Vertical card, stacked layout ── */
function V1({ c }: { c: Collection }) {
  return (
    <button className="w-full rounded-2xl border border-border/60 p-5 text-left active:scale-[0.98] transition-transform">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-xl bg-muted-foreground/20" />
        <h3 className="text-[16px] font-bold text-foreground">{c.name}</h3>
      </div>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">{c.description}</p>
      <MetaPills c={c} />
    </button>
  );
}

/* ── V2: Horizontal scroll card (wide, compact) ── */
function V2({ c }: { c: Collection }) {
  return (
    <button className="flex shrink-0 w-[280px] flex-col justify-between rounded-2xl border border-border/60 p-4 text-left active:scale-[0.98] transition-transform" style={{ height: 200 }}>
      <div>
        <div className="mb-2">
          <div className="h-9 w-9 rounded-lg bg-muted-foreground/20" />
        </div>
        <h3 className="text-[16px] font-bold text-foreground mb-1">{c.name}</h3>
        <p className="text-[13px] text-muted-foreground leading-snug line-clamp-2">{c.description}</p>
      </div>
      <MetaPills c={c} />
    </button>
  );
}

/* ── V3: Minimal list row ── */
function V3({ c }: { c: Collection }) {
  return (
    <button className="flex w-full items-center gap-4 py-4 text-left active:opacity-70 transition-opacity border-b border-border/30 last:border-b-0">
      <div className="h-12 w-12 shrink-0 rounded-xl bg-muted-foreground/20" />
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-bold text-foreground mb-0.5">{c.name}</h3>
        <p className="text-[13px] text-muted-foreground line-clamp-1 mb-1.5">{c.description}</p>
        <MetaPills c={c} />
      </div>
    </button>
  );
}

/* ── V4: Card with top color band + stats grid ── */
function V4({ c }: { c: Collection }) {
  return (
    <button className="w-full overflow-hidden rounded-2xl border border-border/60 text-left active:scale-[0.98] transition-transform">
      <div className="h-2 bg-muted-foreground/15" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-[16px] font-bold text-foreground">{c.name}</h3>
          <ChevronRight size={16} className="text-muted-foreground/40 mt-1" />
        </div>
        <p className="text-[13px] text-muted-foreground leading-snug mb-4">{c.description}</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground/50 mb-0.5">{c.type}</p>
            <p className="text-[15px] font-bold text-foreground tabular-nums">{c.stocks}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground/50 mb-0.5">Allocation</p>
            <p className="text-[13px] font-semibold text-foreground">{c.weighting === "Equal" ? "Equi Weighted" : c.weighting === "Market Cap" ? "Mkt Cap Weighted" : "Custom Weights"}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground/50 mb-0.5">Min Amount</p>
            <p className="text-[15px] font-bold text-foreground tabular-nums">{c.minAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ── V5: Compact filled card, no border ── */
function V5({ c }: { c: Collection }) {
  return (
    <button className="w-full rounded-2xl bg-muted p-5 text-left active:scale-[0.98] transition-transform">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-muted-foreground/20" />
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-foreground">{c.name}</h3>
          <p className="text-[13px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{c.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <MetaPills c={c} />
        <ChevronRight size={16} className="text-muted-foreground/40 shrink-0" />
      </div>
    </button>
  );
}

/* ── V6: Tall vertical card, horizontal scroll ── */
function V6({ c }: { c: Collection }) {
  return (
    <button className="flex shrink-0 w-[180px] flex-col rounded-2xl border border-border/60 overflow-hidden text-left active:scale-[0.98] transition-transform" style={{ height: 260 }}>
      <div className="h-[80px] bg-muted-foreground/10 flex items-center justify-center">
        <div className="h-12 w-12 rounded-xl bg-muted-foreground/25" />
      </div>
      <div className="flex-1 flex flex-col justify-between p-4">
        <div>
          <h3 className="text-[15px] font-bold text-foreground mb-1">{c.name}</h3>
          <p className="text-[12px] text-muted-foreground leading-snug line-clamp-3">{c.description}</p>
        </div>
        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{c.stocks} {c.type}</span>
            <span className="text-[11px] text-muted-foreground">{c.weighting === "Equal" ? "Equi Wtd" : c.weighting === "Market Cap" ? "Mkt Cap" : "Custom"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Min</span>
            <span className="text-[12px] font-semibold text-foreground tabular-nums">{c.minAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ── V7: Slim vertical card with accent top, horizontal scroll ── */
function V7({ c }: { c: Collection }) {
  return (
    <button className="flex shrink-0 w-[200px] flex-col rounded-2xl bg-muted overflow-hidden text-left active:scale-[0.98] transition-transform" style={{ height: 220 }}>
      <div className="flex-1 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-muted-foreground/20" />
            <h3 className="text-[15px] font-bold text-foreground leading-tight">{c.name}</h3>
          </div>
          <p className="text-[12px] text-muted-foreground leading-snug line-clamp-3">{c.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-3">
          <span className="rounded-full bg-background px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{c.stocks} {c.type}</span>
          <span className="rounded-full bg-background px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{c.weighting === "Equal" ? "Equi Weighted" : c.weighting === "Market Cap" ? "Market Cap Weighted" : "Custom Weights"}</span>
          <span className="rounded-full bg-background px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground tabular-nums">Min {c.minAmount.toLocaleString()}</span>
        </div>
      </div>
    </button>
  );
}

const variations = [
  { name: "V1 — Vertical Card, Stacked", carousel: false, render: (c: Collection) => <V1 c={c} /> },
  { name: "V2 — Wide Horizontal Carousel", carousel: true, render: (c: Collection) => <V2 c={c} /> },
  { name: "V3 — Minimal List Row", carousel: false, render: (c: Collection) => <V3 c={c} /> },
  { name: "V4 — Card with Stats Grid", carousel: false, render: (c: Collection) => <V4 c={c} /> },
  { name: "V5 — Filled Card, No Border", carousel: false, render: (c: Collection) => <V5 c={c} /> },
  { name: "V6 — Tall Card Carousel", carousel: true, render: (c: Collection) => <V6 c={c} /> },
  { name: "V7 — Filled Card Carousel", carousel: true, render: (c: Collection) => <V7 c={c} /> },
];

export default function CollectionCardsExplore() {
  const [active, setActive] = useState(0);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors">
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">Collection Cards</h1>
          <p className="text-[13px] text-muted-foreground">7 layout variations</p>
        </div>
      </div>

      {/* Version picker */}
      <div className="overflow-x-auto no-scrollbar border-b border-border/40">
        <div className="flex gap-0 px-5">
          {variations.map((v, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                active === i ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              V{i + 1}
              {active === i && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pt-6 pb-10">
          <p className="text-[13px] text-muted-foreground mb-5">{variations[active].name}</p>

          {variations[active].carousel ? (
            <div className="-mx-5 overflow-x-auto no-scrollbar">
              <div className="flex gap-3 px-5" style={{ width: "max-content" }}>
                {sample.map((c) => <div key={c.name}>{variations[active].render(c)}</div>)}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sample.map((c) => (
                <div key={c.name}>{variations[active].render(c)}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
