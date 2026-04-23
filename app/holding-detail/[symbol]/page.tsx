"use client";

import { useParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { HOLDINGS, type Holding, type Transaction } from "@/app/portfolio/tabs/holdings";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtQty = (n: number) =>
  n % 1 === 0 ? String(n) : n.toFixed(5).replace(/\.?0+$/, "");

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border/25 last:border-0">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className={cn("text-[14px] font-semibold text-foreground tabular-nums", valueClass)}>{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-6 mb-2">{children}</p>;
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl bg-white px-4", className)}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Transaction timeline                                               */
/* ------------------------------------------------------------------ */

function TransactionTimeline({ transactions, currentPrice, currentQty }: {
  transactions: Transaction[];
  currentPrice: number;
  currentQty: number;
}) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let running = 0;

  return (
    <div className="divide-y divide-border/30">
      {sorted.map((tx, i) => {
        const isBuy = tx.side === "buy";
        running = parseFloat((running + (isBuy ? tx.qty : -tx.qty)).toFixed(8));
        const unrealised = isBuy ? (currentPrice - tx.price) * tx.qty : null;
        const unrealisedPct = isBuy ? ((currentPrice - tx.price) / tx.price) * 100 : null;

        return (
          <div key={i} className="flex items-center justify-between gap-3 py-3.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {isBuy ? "Buy" : "Sell"}
                </span>
                <span className="text-muted-foreground/30 text-[10px]">·</span>
                <p className="text-[13px] font-semibold text-foreground">{tx.date}</p>
              </div>
              <p className="text-[12px] text-muted-foreground">
                {fmtQty(tx.qty)} shares @ ${tx.price.toFixed(2)} · {fmtQty(running)} held after
              </p>
            </div>

            <div className="text-right shrink-0">
              {isBuy && unrealised !== null && unrealisedPct !== null ? (
                <>
                  <p className="text-[13px] font-semibold tabular-nums text-foreground">
                    {unrealisedPct >= 0 ? "+" : ""}{unrealisedPct.toFixed(2)}%
                  </p>
                  <p className="text-[12px] tabular-nums text-muted-foreground">
                    {unrealised >= 0 ? "+" : ""}${fmtMoney(Math.abs(unrealised))}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[13px] font-semibold tabular-nums text-foreground">
                    ${fmtMoney(tx.price * tx.qty)}
                  </p>
                  <p className="text-[12px] text-muted-foreground">Proceeds</p>
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Current holding row */}
      <div className="flex items-center justify-between gap-3 pt-3.5 pb-1">
        <div>
          <p className="text-[13px] font-semibold text-foreground">Holding today</p>
          <p className="text-[12px] text-muted-foreground">{fmtQty(currentQty)} shares</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-semibold text-foreground tabular-nums">${currentPrice.toFixed(2)}</p>
          <p className="text-[12px] text-muted-foreground">Current price</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HoldingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const name   = decodeURIComponent(params.symbol as string);

  const holding: Holding | undefined = HOLDINGS.find((h) => h.name === name);

  if (!holding) {
    return (
      <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col items-center justify-center bg-[#f0f0f5]">
        <p className="text-muted-foreground">Holding not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-foreground font-semibold">Go back</button>
      </div>
    );
  }

  const invested     = holding.qty * holding.avgPrice;
  const currentValue = holding.currentValue;
  const pnl          = holding.pnl;
  const isGain       = pnl >= 0;
  const todayPnl     = currentValue * (holding.dayChangePct / 100);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col bg-[#f0f0f5] overflow-hidden">
      <StatusBar />

      {/* ── Nav bar ── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.back()} className="rounded-full p-2 active:opacity-60">
          <X size={16} strokeWidth={2.5} className="text-foreground" />
        </button>
        <p className="text-[15px] font-bold text-foreground truncate mx-2 flex-1 text-center">Holding Detail</p>
        <div className="w-9" />
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">

        {/* ── Hero card ── */}
        <Card className="pt-5 pb-4 mb-1">
          {/* Name + value */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <p className="text-[18px] font-bold text-foreground leading-tight">{holding.name}</p>
              {holding.tag && (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground shrink-0">
                  {holding.tag}
                </span>
              )}
            </div>
            <p className="text-[22px] font-bold text-foreground tabular-nums shrink-0">${fmtMoney(currentValue)}</p>
          </div>

          {/* Category + P&L subtitle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-muted-foreground">{holding.category}</p>
            <p className="text-[13px] font-semibold tabular-nums text-muted-foreground">
              {isGain ? "+" : ""}${fmtMoney(Math.abs(pnl))} ({holding.pnlPct >= 0 ? "+" : ""}{holding.pnlPct.toFixed(1)}%)
            </p>
          </div>

          {/* Stat bar: Qty | Avg | LTP | Invested */}
          <div className="flex rounded-xl bg-muted/40 overflow-hidden">
            <div className="flex-1 px-3 py-2.5 border-r border-border/20">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Qty</p>
              <p className="text-[14px] font-bold text-foreground tabular-nums">{fmtQty(holding.qty)}</p>
            </div>
            <div className="flex-1 px-3 py-2.5 border-r border-border/20">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Avg</p>
              <p className="text-[14px] font-bold text-foreground tabular-nums">${holding.avgPrice.toFixed(2)}</p>
            </div>
            <div className="flex-1 px-3 py-2.5 border-r border-border/20">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">LTP</p>
              <p className="text-[14px] font-bold text-foreground tabular-nums">${holding.currentPrice.toFixed(2)}</p>
            </div>
            <div className="flex-1 px-3 py-2.5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Invested</p>
              <p className="text-[14px] font-bold text-foreground tabular-nums">${fmtMoney(invested)}</p>
            </div>
          </div>
        </Card>

        {/* ── Performance ── */}
        <SectionLabel>Performance</SectionLabel>
        <Card>
          <InfoRow
            label="Today's Change"
            value={`${todayPnl >= 0 ? "+" : ""}$${fmtMoney(Math.abs(todayPnl))} (${holding.dayChangePct >= 0 ? "+" : ""}${holding.dayChangePct.toFixed(2)}%)`}
          />
          <InfoRow
            label="Est. XIRR"
            value={`${holding.xirr >= 0 ? "+" : ""}${holding.xirr.toFixed(1)}%`}
          />
        </Card>

        {/* ── Transaction timeline ── */}
        <SectionLabel>Purchase Journey · {holding.transactions.length} {holding.transactions.length === 1 ? "Order" : "Orders"}</SectionLabel>
        <Card className="px-4">
          <TransactionTimeline transactions={holding.transactions} currentPrice={holding.currentPrice} currentQty={holding.qty} />
        </Card>

        <div className="h-2" />
      </div>

      {/* ── Sticky footer CTAs ── */}
      <div className="shrink-0 px-5 pt-4 pb-8 bg-white border-t border-border/40">
        <div className="flex gap-3 mb-4">
          <button className="flex-1 rounded-2xl border border-border/60 py-4 text-[15px] font-bold text-foreground active:opacity-70">
            Sell
          </button>
          <button className="flex-1 rounded-2xl bg-foreground py-4 text-[15px] font-bold text-background active:opacity-75">
            Buy More
          </button>
        </div>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => router.push("/home-v3/portfolio?tab=Orders")}
            className="text-[13px] text-muted-foreground underline underline-offset-2 active:opacity-50"
          >
            View Orders
          </button>
          <div className="w-px h-3 bg-border" />
          <button className="text-[13px] text-muted-foreground underline underline-offset-2 active:opacity-50">
            Set Alert
          </button>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
