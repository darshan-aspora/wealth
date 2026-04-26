"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SipCard, type Sip as SharedSip } from "@/app/portfolio/components/shared-sip";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SipFilter = "All" | "Stocks" | "ETF" | "Global ETF" | "Collections";

interface Sip extends SharedSip {
  filter: Exclude<SipFilter, "All">;
  paused?: boolean;
}

export type { Sip };

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const ACTIVE_SIPS: Sip[] = [
  { id: 1,  name: "Alibaba Group Holding Limited", amount: 20,  frequency: "Weekly on Friday",        dueDate: new Date("2026-04-23"), filter: "Stocks"      },
  { id: 3,  name: "NVIDA Corporations",            amount: 50,  frequency: "Daily Monday to Friday",  dueDate: new Date("2026-04-24"), filter: "Stocks"      },
  { id: 6,  name: "Stable Compounders",             amount: 50,  frequency: "Daily Monday to Friday",  badge: "Collection", dueDate: new Date("2026-04-24"), filter: "Collections" },
  { id: 7,  name: "Super Micro Computer, Inc.",     amount: 15,  frequency: "Monthly on 12th",         dueDate: new Date("2026-04-27"), filter: "Stocks"      },
  { id: 8,  name: "Tesla, Inc.",                    amount: 50,  frequency: "Fortnightly on Friday",   dueDate: new Date("2026-04-30"), filter: "Stocks"      },
  { id: 10, name: "Alphabet Inc.",                  amount: 50,  frequency: "Fortnightly on Friday",   dueDate: new Date("2026-04-30"), filter: "Stocks"      },
  { id: 4,  name: "iShares MSCI ACWI ETF",         amount: 60,  frequency: "Weekly on Friday",        badge: "G.ETF",      dueDate: new Date("2026-05-01"), filter: "Global ETF"  },
  { id: 9,  name: "Apple Inc.",                     amount: 100, frequency: "Daily Monday to Friday",  dueDate: new Date("2026-05-05"), filter: "Stocks"      },
  { id: 2,  name: "Invesco QQQ Trust Series 1",    amount: 80,  frequency: "Monthly on 12th",         badge: "ETF",        dueDate: new Date("2026-05-12"), filter: "ETF"         },
  { id: 5,  name: "JP Morgan Chase & Co.",          amount: 80,  frequency: "Monthly on 12th",         dueDate: new Date("2026-05-12"), filter: "Stocks"      },
].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()) as Sip[];

const PAUSED_SIPS: Sip[] = [
  { id: 11, name: "Amazon.com, Inc.",  amount: 80, frequency: "Fortnightly on Friday", dueDate: new Date("2026-04-30"), filter: "Stocks", paused: true },
  { id: 12, name: "Walmart Inc.",      amount: 40, frequency: "Fortnightly on Friday", dueDate: new Date("2026-05-07"), filter: "Stocks", paused: true },
  { id: 13, name: "Freshworks Inc.",   amount: 50, frequency: "Monthly on 12th",       dueDate: new Date("2026-05-12"), filter: "Stocks", paused: true },
];

export const ALL_SIPS: Sip[] = [...ACTIVE_SIPS, ...PAUSED_SIPS];

const FILTERS: SipFilter[] = ["All", "Stocks", "ETF", "Global ETF", "Collections"];

const SUMMARY = {
  monthlyPlanned: 4182,
  remaining:      1557,
  upcomingDate:   "20th May",
};

/* ------------------------------------------------------------------ */
/*  Paused SIP card (Resume + Cancel — different from active actions) */
/* ------------------------------------------------------------------ */

function PausedSipCard({ sip }: { sip: Sip }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/sip-detail/${sip.id}`)}
      className="w-full text-left px-5 py-4 active:opacity-70 transition-opacity"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <p className="text-[16px] font-bold text-foreground leading-tight">{sip.name}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-foreground">${sip.amount}</span>
            <span className="text-muted-foreground/40 text-[14px]">|</span>
            <span className="text-[14px] text-muted-foreground">{sip.frequency}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main tab                                                           */
/* ------------------------------------------------------------------ */

export function SipsTab({ empty }: { empty?: boolean }) {
  const [filter, setFilter] = useState<SipFilter>("All");
  const amounts = ["$25", "$50", "$100", "$250"];
  const freqs = ["Daily", "Weekly", "Monthly"];
  const [selectedAmt, setSelectedAmt] = useState(amounts[1]);
  const [selectedFreq, setSelectedFreq] = useState(freqs[1]);

  if (empty) {
    const amtVal = parseInt(selectedAmt.replace("$", ""));
    const multiplier = selectedFreq === "Daily" ? 252 : selectedFreq === "Weekly" ? 52 : 12;
    const projected1y = Math.round(amtVal * multiplier * 1.10);
    const projected3y = Math.round(amtVal * multiplier * 3 * 1.28);
    const bars = [
      { label: "Now", val: 0 },
      { label: "6M", val: Math.round(amtVal * multiplier * 0.5 * 1.05) },
      { label: "1Y", val: projected1y },
      { label: "2Y", val: Math.round(amtVal * multiplier * 2 * 1.18) },
      { label: "3Y", val: projected3y },
    ];
    const maxVal = bars[bars.length - 1].val || 1;
    return (
      <div className="pb-24">
        {/* Header */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[22px] font-bold text-foreground mb-1">Set up a SIP</p>
          <p className="text-[14px] text-muted-foreground">Invest a fixed amount automatically and watch it compound.</p>
        </div>

        {/* Mini SIP configurator */}
        <div className="mx-5 mt-4 mb-4 rounded-3xl border border-border/40 bg-background px-5 py-5">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Amount per {selectedFreq.toLowerCase().replace("ly", "").replace("month", "month")}</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {amounts.map((a) => (
              <button
                key={a}
                onClick={() => setSelectedAmt(a)}
                className={cn(
                  "py-3 rounded-xl text-[14px] font-bold transition-colors",
                  selectedAmt === a ? "bg-foreground text-background" : "border border-border/50 text-foreground"
                )}
              >
                {a}
              </button>
            ))}
          </div>
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Frequency</p>
          <div className="flex gap-2 mb-5">
            {freqs.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFreq(f)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors",
                  selectedFreq === f ? "bg-foreground text-background" : "border border-border/50 text-muted-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Growth bars */}
          <div className="flex items-end gap-2 h-20 mb-2">
            {bars.map((b, i) => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn("w-full rounded-t-lg transition-all duration-300", i === 0 ? "bg-muted/40" : i === bars.length - 1 ? "bg-foreground" : "bg-foreground/30")}
                  style={{ height: i === 0 ? "4px" : `${Math.max(8, (b.val / maxVal) * 72)}px` }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {bars.map((b) => (
              <div key={b.label} className="flex-1 text-center">
                <p className="text-[10px] text-muted-foreground">{b.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/40 flex justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">1-year projection</p>
              <p className="text-[16px] font-bold text-foreground tabular-nums">${projected1y.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground mb-0.5">3-year projection</p>
              <p className="text-[16px] font-bold text-foreground tabular-nums">${projected3y.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-2">Projections assume ~10% annual return. Not a guarantee.</p>
        </div>

        <div className="px-5">
          <button className="w-full rounded-2xl bg-foreground py-4 text-[15px] font-bold text-background active:opacity-75 transition-opacity">
            Create a SIP
          </button>
        </div>
      </div>
    );
  }

  const filteredActive = filter === "All"
    ? ACTIVE_SIPS
    : ACTIVE_SIPS.filter((s) => s.filter === filter);

  const filteredPaused = filter === "All"
    ? PAUSED_SIPS
    : PAUSED_SIPS.filter((s) => s.filter === filter);

  return (
    <div className="pb-24">

      {/* ── Filter chips ── */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap shrink-0 transition-colors",
                filter === f
                  ? "bg-foreground text-background"
                  : "border border-border/50 text-muted-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary card ── */}
      <div className="mx-5 mb-4 rounded-2xl border border-border/50 bg-white px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] text-muted-foreground mb-0.5">Monthly Planned</p>
            <p className="text-[20px] font-bold text-foreground">${SUMMARY.monthlyPlanned.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[12px] text-muted-foreground mb-0.5">Remaining</p>
            <p className="text-[20px] font-bold text-foreground">${SUMMARY.remaining.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-muted-foreground mb-0.5">Upcoming on</p>
            <p className="text-[20px] font-bold text-foreground">{SUMMARY.upcomingDate}</p>
          </div>
        </div>
      </div>

      {/* ── Active SIPs ── */}
      {filteredActive.length > 0 && (
        <div className="px-5 mb-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[16px] text-foreground">Active SIP ({filteredActive.length})</p>
            <p className="text-[13px] font-normal text-muted-foreground">Due Date</p>
          </div>
        </div>
      )}
      {filteredActive.length > 0 && (
        <div className="divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40 mb-6">
          {filteredActive.map((s) => <SipCard key={s.id} sip={s} />)}
        </div>
      )}

      {/* ── Paused SIPs ── */}
      {filteredPaused.length > 0 && (
        <div className="px-5 mb-2">
          <p className="text-[16px] text-foreground">Paused SIP</p>
        </div>
      )}
      {filteredPaused.length > 0 && (
        <div className="divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40">
          {filteredPaused.map((s) => <PausedSipCard key={s.id} sip={s} />)}
        </div>
      )}

    </div>
  );
}
