"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SipCard, type Sip } from "./shared-sip";

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
            <SipCard key={sip.id} sip={sip} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
