"use client";

import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SIPS = [
  { name: "Alibaba Group Holding Limited", type: null,   amount: 20,  schedule: "Weekly on Friday",       daysLeft: 1 },
  { name: "SPDR Gold Shares",              type: "ETF",  amount: 50,  schedule: "Daily Monday to Friday",  daysLeft: null },
  { name: "Vanguard S&P 500 ETF",          type: "ETF",  amount: 80,  schedule: "Monthly on 12th",         daysLeft: 5 },
  { name: "Super Micro Computer, Inc.",    type: null,   amount: 220, schedule: "Monthly on 12th",         daysLeft: 5 },
  { name: "Tesla, Inc.",                   type: null,   amount: 50,  schedule: "Biweekly on Friday",      daysLeft: 8 },
  { name: "Apple Inc.",                    type: null,   amount: 50,  schedule: "Daily Monday to Friday",  daysLeft: null },
  { name: "Invesco QQQ Trust Series 1",    type: null,   amount: 50,  schedule: "Biweekly on Friday",      daysLeft: 8 },
];

export function ActiveSips() {
  return (
    <Card className="border-border/50 shadow-none">
      <CardContent className="p-5">
        <p className="text-[17px] font-bold text-foreground">Active SIP ({SIPS.length})</p>
        <p className="text-[13px] text-muted-foreground mt-1 mb-4">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>

        <div className="space-y-3">
          {SIPS.map((sip, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3.5"
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[14px] font-bold text-foreground leading-tight">{sip.name}</p>
                  {sip.type && (
                    <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {sip.type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[12px] text-muted-foreground">
                  <span>${sip.amount}</span>
                  <span className="text-border">|</span>
                  <span>{sip.schedule}</span>
                  {sip.daysLeft != null && (
                    <>
                      <span className="text-border">|</span>
                      <span>{sip.daysLeft} Day Left</span>
                    </>
                  )}
                </div>
              </div>
              <ChevronDown size={18} strokeWidth={1.8} className="shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
