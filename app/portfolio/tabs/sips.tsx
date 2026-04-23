"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SipCard, type Sip as SharedSip } from "@/app/portfolio/components/shared-sip";
import { EmptyState } from "../components/empty-state";

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

  if (empty) {
    return (
      <EmptyState
        icon={RefreshCw}
        title="No active SIPs"
        subtitle="Set up a Systematic Investment Plan to invest automatically in stocks, ETFs, or collections."
        actions={[
          { label: "Create a SIP", href: "/home-v3", primary: true },
          { label: "Explore Stocks & ETFs", href: "/home-v3" },
        ]}
      />
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
