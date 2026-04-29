"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { X, Plus, LogOut, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/25 last:border-0">
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
/*  Page inner (uses useSearchParams — must be wrapped in Suspense)    */
/* ------------------------------------------------------------------ */

function PositionDetailInner() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const symbol = decodeURIComponent(params.symbol as string);
  const expiry = searchParams.get("expiry") ?? undefined;
  const type   = searchParams.get("type") as "CALL" | "PUT" | null ?? undefined;
  const side   = (searchParams.get("side") ?? "B") as "B" | "S";
  const pnl    = parseFloat(searchParams.get("pnl") ?? "0");
  const avgPrice  = parseFloat(searchParams.get("avg") ?? "0");
  const ltp       = parseFloat(searchParams.get("ltp") ?? "0");
  const filledQty = parseFloat(searchParams.get("filled") ?? "0");
  const orderedQty = parseFloat(searchParams.get("ordered") ?? "0");
  const lots       = searchParams.get("lots") ? parseFloat(searchParams.get("lots")!) : undefined;
  const daysToExpiry = searchParams.get("dte") ? parseInt(searchParams.get("dte")!) : undefined;
  const status = (searchParams.get("status") ?? "open") as "open" | "partial_fill" | "pending";

  const label = [symbol, expiry, type].filter(Boolean).join(" ");
  const isUp = pnl >= 0;
  const isPartial = status === "partial_fill";
  const isPending = status === "pending";
  const isExpiring = daysToExpiry !== undefined && daysToExpiry <= 5;

  const fmtPnl = (n: number) =>
    (n >= 0 ? "+" : "−") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0 });

  const qtyDisplay = lots !== undefined
    ? `${lots} lot × ${filledQty || orderedQty}`
    : isPartial
      ? `${filledQty} / ${orderedQty}`
      : String(filledQty || orderedQty);

  const ltpChangePct = avgPrice > 0 ? ((ltp - avgPrice) / avgPrice) * 100 : 0;

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col bg-[#f0f0f5] overflow-hidden">
      <StatusBar />

      {/* Nav */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.back()} className="rounded-full p-2 active:opacity-60">
          <X size={16} strokeWidth={2.5} className="text-foreground" />
        </button>
        <p className="text-[15px] font-bold text-foreground">Position Details</p>
        <div className="w-9" />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">

        {/* Hero card */}
        <Card className="pt-5 pb-4 mb-1">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-2 flex-wrap">
              <span className="rounded bg-[#E3E3E3] px-1 py-0.5 text-[10px] font-bold text-foreground shrink-0 mt-1">
                {side === "B" ? "BUY" : "SELL"}
              </span>
              <p className="text-[17px] font-bold text-foreground leading-tight">{label}</p>
            </div>
            {/* Status chip */}
            <span className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
              isPartial ? "bg-amber-50 text-amber-600"
              : isPending ? "bg-muted text-muted-foreground"
              : isExpiring && daysToExpiry === 0 ? "bg-foreground/10 text-foreground"
              : "bg-muted text-muted-foreground"
            )}>
              {isPartial ? "Partial fill"
                : isPending ? "Pending"
                : isExpiring && daysToExpiry === 0 ? "Expiring today"
                : isExpiring ? `${daysToExpiry}d to expiry`
                : "Open"}
            </span>
          </div>

          {/* Stat bar */}
          <div className="flex rounded-xl bg-muted/40 overflow-hidden">
            <div className="flex-1 px-3 py-2.5 border-r border-border/20">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Qty</p>
              <p className="text-[14px] font-bold text-foreground tabular-nums">{qtyDisplay}</p>
            </div>
            <div className="flex-1 px-3 py-2.5 border-r border-border/20">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Avg</p>
              <p className="text-[14px] font-bold text-foreground tabular-nums">${avgPrice}</p>
            </div>
            <div className="flex-1 px-3 py-2.5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">LTP</p>
              <p className="text-[14px] font-bold text-foreground tabular-nums">${ltp}</p>
            </div>
          </div>
        </Card>

        {/* P&L section */}
        <SectionLabel>P&amp;L</SectionLabel>
        <Card>
          <InfoRow
            label="Unrealised P&L"
            value={fmtPnl(pnl)}
            valueClass={isUp ? "text-emerald-500" : "text-red-500"}
          />
          <InfoRow
            label="LTP Change"
            value={`${ltpChangePct >= 0 ? "+" : ""}${ltpChangePct.toFixed(2)}%`}
            valueClass={ltpChangePct >= 0 ? "text-emerald-500" : "text-red-500"}
          />
          <InfoRow label="Avg Entry" value={`$${avgPrice}`} />
          <InfoRow label="Current LTP" value={`$${ltp}`} />
        </Card>

        {/* Expiry warning */}
        {isExpiring && (
          <>
            <SectionLabel>Warning</SectionLabel>
            <Card className="px-4 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className={cn("shrink-0 mt-0.5", daysToExpiry === 0 ? "text-red-500" : "text-amber-500")} />
                <p className="text-[13px] text-foreground leading-snug">
                  {daysToExpiry === 0
                    ? "This position expires today. Exit or it will be settled automatically."
                    : `This position expires in ${daysToExpiry} day${daysToExpiry > 1 ? "s" : ""}. Review before expiry.`}
                </p>
              </div>
            </Card>
          </>
        )}

        <div className="h-2" />
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 px-5 pt-4 pb-8 bg-white border-t border-border/40">
        {!isPending ? (
          <div className="flex gap-3 mb-4">
            <button className="flex-1 rounded-2xl border border-border/60 py-4 text-[15px] font-bold text-foreground active:opacity-70 flex items-center justify-center gap-2">
              <Plus size={16} strokeWidth={2.5} />
              Add
            </button>
            <button className="flex-1 rounded-2xl bg-foreground py-4 text-[15px] font-bold text-background active:opacity-75 flex items-center justify-center gap-2">
              <LogOut size={16} strokeWidth={2.5} />
              Exit Position
            </button>
          </div>
        ) : (
          <div className="flex gap-3 mb-4">
            <button className="w-full rounded-2xl border border-border/60 py-4 text-[15px] font-bold text-foreground active:opacity-70">
              Cancel Order
            </button>
          </div>
        )}
        <div className="flex items-center justify-center gap-6">
          <button className="text-[13px] text-muted-foreground underline underline-offset-2 active:opacity-50">
            Contact Us
          </button>
          <div className="w-px h-3 bg-border" />
          <button className="text-[13px] text-muted-foreground underline underline-offset-2 active:opacity-50">
            FAQs
          </button>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}

export default function PositionDetailPage() {
  return (
    <Suspense>
      <PositionDetailInner />
    </Suspense>
  );
}
