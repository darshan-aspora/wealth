"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const pricingItems = [
  { label: "US Stock trades", value: "$0.0015/share", note: "Min $1 per order" },
  { label: "ETF trades", value: "$0.0015/share", note: "Min $1 per order" },
  { label: "Options contracts", value: "$0.20/contract", note: "Plus regulatory fees" },
  { label: "Advisory baskets", value: "0.50%/year", note: "No lock-in. Withdraw anytime." },
  { label: "Algo strategies", value: "From $20/mo", note: "Flat fee. No profit share." },
  { label: "Account opening", value: "Free", note: null },
  { label: "Deposits & withdrawals", value: "Free", note: null },
  { label: "Real-time data", value: "Free", note: null },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

export function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section className="bg-background py-8">
      <div ref={sectionRef} className="px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            className="border border-border rounded-xl overflow-hidden bg-background"
          >
            {/* Top section */}
            <div className="bg-muted p-5">
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                Transparent Pricing
              </h2>
              <p className="text-muted-foreground text-[15px] mt-1">
                No hidden fees. No surprises. Ever.
              </p>
            </div>

            {/* Pricing table */}
            <div className="p-4">
              <div className="divide-y divide-border">
                {pricingItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-[15px] text-foreground">{item.label}</p>
                      {item.note && (
                        <p className="text-muted-foreground text-xs mt-0.5">{item.note}</p>
                      )}
                    </div>
                    <p className={`font-mono text-[15px] font-semibold shrink-0 ml-4 ${item.value === "Free" ? "text-gain" : "text-foreground"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
