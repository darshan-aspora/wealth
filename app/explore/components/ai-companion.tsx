"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MessageCircle, Brain, Gauge, Calculator } from "lucide-react";

const rotatingWords = [
  "Analysis",
  "Investing",
  "Trading",
  "Research",
  "Insights",
  "Portfolios",
];

const capabilities = [
  {
    icon: MessageCircle,
    title: "Ask Anything",
    body: "Navigate your portfolio with natural language. No menus, no tabs.",
  },
  {
    icon: Brain,
    title: "Instant Market Briefs",
    body: "Earnings, catalysts, and market moves \u2014 summarized, not just listed.",
  },
  {
    icon: Gauge,
    title: "The Aspora Score",
    body: "One score per stock. Fundamentals, momentum, and valuation \u2014 fully transparent.",
  },
  {
    icon: Calculator,
    title: "Simulate Before You Trade",
    body: "Run what-if scenarios on your real portfolio before committing a dollar.",
  },
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
    transition: { staggerChildren: 0.15 },
  },
};

export function AiCompanion() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-background py-8">
      <div ref={sectionRef} className="px-5">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="border border-border rounded-xl overflow-hidden bg-background"
        >
          {/* ── Top section — headline + screenshot ── */}
          <div className="bg-muted p-5">
            <motion.div variants={fadeUp}>
              <p className="text-muted-foreground text-xs font-medium mb-2">Meet Arya</p>
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                AI-Powered{" "}
                <span className="inline-block relative h-[1.2em] w-[140px] align-bottom overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={rotatingWords[wordIndex]}
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute left-0 text-primary"
                    >
                      {rotatingWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h2>
              <p className="text-muted-foreground text-[15px] mt-1">
                The future of investing.
              </p>
            </motion.div>

            {/* Video placeholder */}
            <motion.div variants={fadeUp} className="mt-5">
              <div className="w-full bg-background rounded-xl overflow-hidden aspect-video flex items-center justify-center cursor-pointer">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-foreground ml-0.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-muted-foreground text-xs">See Arya in action</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Bottom section — capabilities ── */}
          <div className="p-5">
            <div className="space-y-5">
              {capabilities.map((cap) => (
                <motion.div key={cap.title} variants={fadeUp}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <cap.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-semibold text-foreground">
                        {cap.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {cap.body}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
