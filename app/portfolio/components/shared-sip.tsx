"use client";

import { useState } from "react";
import { Pencil, Pause, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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
/*  SIP detail drawer                                                  */
/* ------------------------------------------------------------------ */

function SipDrawer({ sip, onClose }: { sip: Sip; onClose: () => void }) {
  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[92dvh] flex flex-col inset-x-0 mx-auto max-w-[430px]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[18px] font-bold text-foreground leading-tight">{sip.name}</p>
                {sip.badge && <SipBadgeChip badge={sip.badge} />}
              </div>
              <p className="text-[14px] text-muted-foreground mt-1">Active SIP</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1 -mr-1 -mt-0.5 active:bg-muted/50 shrink-0">
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-0">
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <p className="text-[16px] text-muted-foreground">SIP Amount</p>
            <p className="text-[16px] font-semibold text-foreground tabular-nums">${sip.amount}</p>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <p className="text-[16px] text-muted-foreground">Frequency</p>
            <p className="text-[16px] font-semibold text-foreground">{sip.frequency}</p>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <p className="text-[16px] text-muted-foreground">Next Due</p>
            <p className="text-[16px] font-semibold text-foreground tabular-nums">{fmtDue(sip.dueDate)}</p>
          </div>
          <div className="flex items-center justify-between py-3">
            <p className="text-[16px] text-muted-foreground">Status</p>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[14px] font-bold text-emerald-600 uppercase tracking-wide">Active</span>
          </div>
        </div>

        {/* Actions CTA */}
        <div className="shrink-0 px-5 pb-6 pt-3 border-t border-border/40">
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-border/60 py-4 text-[16px] font-bold text-foreground active:opacity-70">
              <Pencil size={16} />
              Edit
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-border/60 py-4 text-[16px] font-bold text-foreground active:opacity-70">
              <Pause size={16} />
              Pause
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-border/60 py-4 text-[16px] font-bold text-red-500 active:opacity-70">
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Self-contained SIP card (manages its own drawer state)            */
/* ------------------------------------------------------------------ */

export function SipCard({ sip, showActions = false }: { sip: Sip; showActions?: boolean }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-border/50 bg-white overflow-hidden">
        <button
          onClick={() => showActions ? setAccordionOpen((v) => !v) : setDrawerOpen(true)}
          className="w-full text-left px-5 pt-5 pb-5 active:opacity-70 transition-opacity"
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

        {showActions && accordionOpen && (
          <div className="border-t border-border/40 flex divide-x divide-border/40">
            <button
              onClick={() => setAccordionOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 py-4 text-[13px] font-semibold text-foreground active:bg-muted/30 transition-colors"
            >
              <Pencil size={13} />
              Edit
            </button>
            <button
              onClick={() => setAccordionOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 py-4 text-[13px] font-semibold text-foreground active:bg-muted/30 transition-colors"
            >
              <Pause size={13} />
              Pause
            </button>
            <button
              onClick={() => setAccordionOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 py-4 text-[13px] font-semibold text-red-500 active:bg-muted/30 transition-colors"
            >
              <X size={13} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {drawerOpen && <SipDrawer sip={sip} onClose={() => setDrawerOpen(false)} />}
    </>
  );
}
