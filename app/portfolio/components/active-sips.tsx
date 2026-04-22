"use client";

import { Card, CardContent } from "@/components/ui/card";

type SipBadge = "ETF" | "G.ETF" | "Collection";

interface Sip {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  badge?: SipBadge;
  dueDate: Date;
}

function fmtDue(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

const ACTIVE_SIPS: Sip[] = [
  { id: 1,  name: "Alibaba Group Holding Limited", amount: 20,  frequency: "Weekly on Friday",       dueDate: new Date("2026-04-23") },
  { id: 3,  name: "NVIDA Corporations",            amount: 50,  frequency: "Daily Monday to Friday",  dueDate: new Date("2026-04-24") },
  { id: 6,  name: "Stable Compounders",            amount: 50,  frequency: "Daily Monday to Friday",  badge: "Collection", dueDate: new Date("2026-04-24") },
  { id: 7,  name: "Super Micro Computer, Inc.",    amount: 15,  frequency: "Monthly on 12th",         dueDate: new Date("2026-04-27") },
  { id: 8,  name: "Tesla, Inc.",                   amount: 50,  frequency: "Fortnightly on Friday",   dueDate: new Date("2026-04-30") },
  { id: 10, name: "Alphabet Inc.",                 amount: 50,  frequency: "Fortnightly on Friday",   dueDate: new Date("2026-04-30") },
  { id: 4,  name: "iShares MSCI ACWI ETF",        amount: 60,  frequency: "Weekly on Friday",        badge: "G.ETF", dueDate: new Date("2026-05-01") },
  { id: 9,  name: "Apple Inc.",                    amount: 100, frequency: "Daily Monday to Friday",  dueDate: new Date("2026-05-05") },
  { id: 2,  name: "Invesco QQQ Trust Series 1",   amount: 80,  frequency: "Monthly on 12th",         badge: "ETF", dueDate: new Date("2026-05-12") },
  { id: 5,  name: "JP Morgan Chase & Co.",         amount: 80,  frequency: "Monthly on 12th",         dueDate: new Date("2026-05-12") },
];

export function ActiveSips() {
  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        <p className="text-[17px] font-bold text-foreground">Active SIP ({ACTIVE_SIPS.length})</p>
        <p className="text-[13px] text-muted-foreground mt-1 mb-4">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>

        <div className="flex flex-col gap-3">
          {ACTIVE_SIPS.map((sip) => (
            <div
              key={sip.id}
              className="rounded-2xl border border-border/50 bg-white overflow-hidden"
            >
              <div className="px-5 pt-5 pb-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <p className="text-[16px] font-bold text-foreground leading-tight">{sip.name}</p>
                      {sip.badge && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[12px] font-bold text-muted-foreground shrink-0">
                          {sip.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] text-muted-foreground">${sip.amount}</span>
                      <span className="text-muted-foreground/40 text-[14px]">|</span>
                      <span className="text-[14px] text-muted-foreground">{sip.frequency}</span>
                    </div>
                  </div>
                  <span className="text-[13px] text-muted-foreground shrink-0 mt-0.5">{fmtDue(sip.dueDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
