"use client";

import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Types (exported)                                                   */
/* ------------------------------------------------------------------ */

export type SipFrequency = "Daily Monday to Friday" | "Weekly on Friday" | "Fortnightly on Friday" | "Monthly on 12th";
export type SipBadge = "ETF" | "G.ETF" | "Collection";

export interface Sip {
  id: number;
  name: string;
  amount: number;
  frequency: SipFrequency | string;
  badge?: SipBadge;
  dueDate: Date;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function fmtDue(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

/* ------------------------------------------------------------------ */
/*  Badge chip                                                         */
/* ------------------------------------------------------------------ */

export function SipBadgeChip({ badge }: { badge: SipBadge }) {
  return (
    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[12px] font-bold text-muted-foreground shrink-0">
      {badge}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SIP card — navigates to full detail page                          */
/* ------------------------------------------------------------------ */

export function SipCard({ sip }: { sip: Sip }) {
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
            {sip.badge && <SipBadgeChip badge={sip.badge} />}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-foreground">${sip.amount}</span>
            <span className="text-muted-foreground/40 text-[14px]">|</span>
            <span className="text-[14px] text-muted-foreground">{sip.frequency}</span>
          </div>
        </div>
        <span className="text-[13px] font-semibold text-muted-foreground shrink-0 mt-0.5">{fmtDue(sip.dueDate)}</span>
      </div>
    </button>
  );
}
