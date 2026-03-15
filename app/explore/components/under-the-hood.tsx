"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   ACCORDION DATA
   ═══════════════════════════════════════════════════════════ */

const accordionItems = [
  {
    title: "Clearing & Custody",
    body: "Your US equities are held in individual accounts (fully disclosed) at Alpaca Securities LLC, a registered broker-dealer and member of FINRA/SIPC. Not pooled. Not omnibus. Your name. Your assets.",
  },
  {
    title: "Regulatory Framework",
    body: "Aspora operates under FinCEN registration (US), DFSA sandbox and SCA Category 5 (UAE), and FCA Appointed Representative via WealthKernel (UK). Advisory services provided by Atom Prive, regulated by DIFC/SCA.",
  },
  {
    title: "Data & Charting",
    body: "Real-time market data via institutional-grade feeds. TradingView professional charting natively integrated. Algo strategies powered by Tradetron with full trade-by-trade transparency.",
  },
  {
    title: "Security & Privacy",
    body: "256-bit encryption. UAE data residency compliant. PII redacted before any AI processing. Full audit trail on every transaction. SOC2 practices.",
  },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function UnderTheHood() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section className="bg-background py-12">
      <div className="px-5">
          {/* ──── Header ──── */}
          <h2 className="text-2xl font-bold text-foreground text-center">
            Under the Hood
          </h2>

          {/* ──── Accordion ──── */}
          <div className="mt-12">
            {accordionItems.map((item, index) => {
              const isOpen = openItems.has(index);
              return (
                <div key={item.title} className="border-b border-border">
                  <button
                    onClick={() => toggleItem(index)}
                    className="flex justify-between items-center py-5 w-full cursor-pointer text-left"
                  >
                    <span className="text-lg font-medium text-foreground">
                      {item.title}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-300 shrink-0 ml-4",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      isOpen
                        ? "max-h-40 opacity-100"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="text-muted-foreground text-sm pb-5">
                      {item.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
      </div>
    </section>
  );
}
