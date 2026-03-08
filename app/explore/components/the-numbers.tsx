"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   STATS DATA
   ═══════════════════════════════════════════════════════════ */

const stats = [
  { value: "6,000+", label: "US Stocks" },
  { value: "2,000+", label: "ETFs" },
  { value: "24\u00d75", label: "Trading Hours" },
  { value: "$1", label: "Minimum Investment" },
  { value: "10+", label: "Algo Strategies" },
  { value: "$1.2B", label: "Advisory AUM" },
  { value: "$0.0015", label: "Per Share" },
  { value: "$0.20", label: "Per Options Contract" },
  { value: "800,000+", label: "Aspora Users" },
  { value: "$4B+", label: "Annual Volume" },
  { value: "3", label: "Regulatory Jurisdictions" },
  { value: "5 sec", label: "Funding Speed" },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function TheNumbers() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  return (
    <section className="bg-muted/50 py-12">
      <div
        ref={containerRef}
        className="px-4"
      >
        <div className="grid grid-cols-2 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              transition={{
                delay: index * 0.08,
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="text-center"
            >
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
