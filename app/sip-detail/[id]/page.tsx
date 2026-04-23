"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { X, Check, Clock, ChevronDown, Pencil, Pause, SkipForward, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { ALL_SIPS, type Sip } from "@/app/portfolio/tabs/sips";
import { fmtDue, type SipFrequency } from "@/app/portfolio/components/shared-sip";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

/* ------------------------------------------------------------------ */
/*  Mock collection holdings                                           */
/* ------------------------------------------------------------------ */

const COLLECTION_HOLDINGS: Record<string, { symbol: string; name: string; weight: number }[]> = {
  "Stable Compounders": [
    { symbol: "MSFT", name: "Microsoft",       weight: 25 },
    { symbol: "AAPL", name: "Apple",           weight: 20 },
    { symbol: "JNJ",  name: "J&J",             weight: 18 },
    { symbol: "PG",   name: "Procter & Gamble", weight: 17 },
    { symbol: "KO",   name: "Coca-Cola",        weight: 20 },
  ],
};

/* ------------------------------------------------------------------ */
/*  Installment generation                                             */
/* ------------------------------------------------------------------ */

interface Installment {
  index: number;
  date: Date;
  done: boolean;
  shares: number;
  amount: number;
}

function generateInstallments(sip: Sip): Installment[] {
  const results: Installment[] = [];
  const freq = sip.frequency;

  function stepBack(d: Date): Date {
    const r = new Date(d);
    if (freq.includes("Daily"))         r.setDate(r.getDate() - 1);
    else if (freq.includes("Weekly"))   r.setDate(r.getDate() - 7);
    else if (freq.includes("Fortnight")) r.setDate(r.getDate() - 14);
    else                                r.setMonth(r.getMonth() - 1);
    return r;
  }

  const past: Date[] = [];
  let cur = stepBack(new Date(sip.dueDate));
  while (past.length < 5 && cur >= new Date("2025-01-01")) {
    past.unshift(new Date(cur));
    cur = stepBack(cur);
  }

  past.forEach((date, i) => {
    const basePrice = 350 + Math.sin(i * 1.3) * 40;
    const shares = parseFloat((sip.amount / basePrice).toFixed(4));
    results.push({ index: i + 1, date, done: true, shares, amount: sip.amount });
  });

  results.push({
    index: results.length + 1,
    date: sip.dueDate,
    done: false,
    shares: parseFloat((sip.amount / 390).toFixed(4)),
    amount: sip.amount,
  });

  return results;
}

/* ------------------------------------------------------------------ */
/*  Modify sheet                                                       */
/* ------------------------------------------------------------------ */

function ModifySheet({ sip, onClose }: { sip: Sip; onClose: () => void }) {
  const [amount, setAmount] = useState(String(sip.amount));
  const [freq, setFreq] = useState(sip.frequency);

  const FREQS: (SipFrequency | string)[] = [
    "Daily Monday to Friday",
    "Weekly on Friday",
    "Fortnightly on Friday",
    "Monthly on 12th",
  ];

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[85dvh] flex flex-col inset-x-0 mx-auto max-w-[430px]">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pt-2 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-[18px] font-bold text-foreground">Modify SIP</p>
            <button onClick={onClose} className="rounded-full p-1 active:bg-muted/50">
              <X size={20} className="text-foreground" />
            </button>
          </div>
          <p className="text-[14px] text-muted-foreground mt-0.5">{sip.name}</p>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          <div>
            <p className="text-[13px] text-muted-foreground mb-1.5">SIP Amount</p>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 px-4 py-3">
              <span className="text-[16px] font-semibold text-muted-foreground">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-[18px] font-bold text-foreground outline-none tabular-nums"
              />
            </div>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1.5">Frequency</p>
            <div className="space-y-2">
              {FREQS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFreq(f)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-colors",
                    freq === f ? "border-foreground bg-foreground/5" : "border-border/50"
                  )}
                >
                  <span className={cn("text-[15px] font-medium", freq === f ? "text-foreground" : "text-muted-foreground")}>{f}</span>
                  {freq === f && <Check size={15} strokeWidth={2.5} className="text-foreground shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="shrink-0 px-5 pb-6 pt-3 border-t border-border/40">
          <button className="w-full rounded-2xl bg-foreground py-4 text-[16px] font-bold text-background active:opacity-75">
            Save Changes
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const sip = ALL_SIPS.find((s) => s.id === id);
  const [modifyOpen, setModifyOpen] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  if (!sip) {
    return (
      <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col items-center justify-center bg-[#f0f0f5]">
        <p className="text-muted-foreground">SIP not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-foreground font-semibold">Go back</button>
      </div>
    );
  }

  const installments = generateInstallments(sip);
  const done = installments.filter((i) => i.done);
  const upcoming = installments.find((i) => !i.done);
  const collectionHoldings = sip.badge === "Collection" ? (COLLECTION_HOLDINGS[sip.name] ?? []) : [];
  const visibleDone = historyExpanded ? done : done.slice(-2);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col bg-[#f0f0f5] overflow-hidden">
      <StatusBar />

      {/* Nav bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.back()} className="rounded-full p-2 active:opacity-60">
          <X size={16} strokeWidth={2.5} className="text-foreground" />
        </button>
        <p className="text-[15px] font-bold text-foreground truncate mx-2 flex-1 text-center">SIP Detail</p>
        <div className="w-9" />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-5">

        {/* Hero card */}
        <div className="rounded-2xl bg-white px-4 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-foreground leading-tight">{sip.name}</p>
              {sip.badge && (
                <span className="mt-1 inline-block rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                  {sip.badge}
                </span>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[22px] font-bold text-foreground tabular-nums">${sip.amount}</p>
              <p className="text-[13px] text-muted-foreground">per installment</p>
            </div>
          </div>

          {/* Stat bar */}
          <div className="flex rounded-xl bg-muted/40 overflow-hidden">
            <div className="flex-1 px-3 py-2.5 border-r border-border/20">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Status</p>
              <p className="text-[14px] font-bold text-foreground">
                {sip.paused ? "Paused" : "Active"}
              </p>
            </div>
            <div className="flex-1 px-3 py-2.5 border-r border-border/20">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Next Due</p>
              <p className="text-[14px] font-bold text-foreground tabular-nums">{fmtDue(sip.dueDate)}</p>
            </div>
            <div className="flex-1 px-3 py-2.5">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Installments</p>
              <p className="text-[14px] font-bold text-foreground tabular-nums">{done.length} done</p>
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div className="rounded-2xl bg-white px-4 py-3.5">
          <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wide font-semibold mb-0.5">Frequency</p>
          <p className="text-[15px] font-semibold text-foreground">{sip.frequency}</p>
        </div>

        {/* Collection breakdown */}
        {collectionHoldings.length > 0 && (
          <div className="rounded-2xl bg-white overflow-hidden">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 px-4 pt-4 pb-2">Collection Breakdown</p>
            <div className="divide-y divide-border/30">
              {collectionHoldings.map((h) => (
                <div key={h.symbol} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0">
                      {h.symbol[0]}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-foreground">{h.symbol}</p>
                      <p className="text-[12px] text-muted-foreground">{h.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-semibold text-foreground">{h.weight}%</p>
                    <p className="text-[12px] text-muted-foreground">${((sip.amount * h.weight) / 100).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Installment history */}
        <div className="rounded-2xl bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
              Installments · {done.length} done
            </p>
            {done.length > 2 && (
              <button
                onClick={() => setHistoryExpanded((v) => !v)}
                className="flex items-center gap-0.5 text-[13px] font-semibold text-foreground active:opacity-60"
              >
                {historyExpanded ? "Show less" : `View all ${done.length}`}
                <ChevronDown size={13} className={cn("transition-transform", historyExpanded && "rotate-180")} />
              </button>
            )}
          </div>

          <div className="divide-y divide-border/30">
            {visibleDone.map((inst) => (
              <div key={inst.index} className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={2.5} className="text-foreground" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">{ordinal(inst.index)} installment</p>
                    <p className="text-[12px] text-muted-foreground">{fmtDate(inst.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold text-foreground tabular-nums">${inst.amount}</p>
                  <p className="text-[12px] text-muted-foreground tabular-nums">{inst.shares} shares</p>
                </div>
              </div>
            ))}

            {upcoming && (
              <div className="flex items-center justify-between px-4 py-3.5 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center shrink-0">
                    <Clock size={10} strokeWidth={2} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">{ordinal(upcoming.index)} installment</p>
                    <p className="text-[12px] text-muted-foreground">Due {fmtDate(upcoming.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold text-foreground tabular-nums">${upcoming.amount}</p>
                  <p className="text-[12px] text-muted-foreground tabular-nums">~{upcoming.shares} shares</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* Footer CTAs */}
      <div className="shrink-0 px-5 pt-4 pb-8 bg-white border-t border-border/40">
        <div className="flex gap-2">
          <button
            onClick={() => setModifyOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border/60 py-4 text-[14px] font-bold text-foreground active:opacity-70"
          >
            <Pencil size={14} />
            Modify
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border/60 py-4 text-[14px] font-bold text-foreground active:opacity-70">
            <SkipForward size={14} />
            Skip
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border/60 py-4 text-[14px] font-bold text-foreground active:opacity-70">
            <Pause size={14} />
            Pause
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border/60 py-4 text-[14px] font-bold text-red-500 active:opacity-70">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <HomeIndicator />

      {modifyOpen && <ModifySheet sip={sip} onClose={() => setModifyOpen(false)} />}
    </div>
  );
}
