"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const stages = [
  {
    title: "The First Step",
    badge: "Beginner",
    body: "Buy your first stock. Understand orders. Build confidence.",
    videos: [
      { title: "What is a stock?", duration: "3 min" },
      { title: "Market vs Limit orders", duration: "4 min" },
      { title: "Buy your first stock in 60s", duration: "2 min" },
    ],
  },
  {
    title: "The Confident Investor",
    badge: "Active",
    body: "Diversify with ETFs. Start a SIP. Read sectors and indices.",
    videos: [
      { title: "What is an ETF?", duration: "3 min" },
      { title: "SIP vs lump sum", duration: "4 min" },
      { title: "How to read earnings", duration: "5 min" },
    ],
  },
  {
    title: "The Strategic Investor",
    badge: "Strategic",
    body: "Read charts. Spot patterns. Make your first swing trade.",
    videos: [
      { title: "Reading a stock chart", duration: "5 min" },
      { title: "Support & resistance", duration: "4 min" },
      { title: "Volume: the hidden signal", duration: "3 min" },
    ],
  },
  {
    title: "The Options Explorer",
    badge: "Options",
    body: "Calls, puts, covered calls. Trade options with confidence.",
    videos: [
      { title: "Options 101: Calls", duration: "3 min" },
      { title: "Options 102: Puts", duration: "4 min" },
      { title: "Covered calls for income", duration: "5 min" },
    ],
  },
  {
    title: "Power Mode",
    badge: "Power",
    body: "Algo strategies. Advanced orders. Extended-hours trading.",
    videos: [
      { title: "How algo trading works", duration: "4 min" },
      { title: "Bracket & OCO orders", duration: "5 min" },
      { title: "From investor to trader", duration: "6 min" },
    ],
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
    transition: { staggerChildren: 0.12 },
  },
};

export function LearningJourney() {
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
          {/* Section header */}
          <motion.h2
            variants={fadeUp}
            className="text-2xl font-bold text-foreground text-center"
          >
            Level Up
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-center mt-3"
          >
            Every great trader started as a curious investor. Here&apos;s the path.
          </motion.p>

          {/* Horizontally scrollable chapter cards */}
          <motion.div
            variants={fadeUp}
            className="flex gap-3 overflow-x-auto no-scrollbar mt-6 -mx-1 px-1"
          >
            {stages.map((stage, i) => (
              <div
                key={stage.title}
                className="shrink-0 w-[280px] border border-border rounded-xl overflow-hidden bg-background"
              >
                {/* Card header */}
                <div className="bg-muted p-4">
                  <span className="text-muted-foreground text-xs font-medium">
                    Chapter {i + 1}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-1">
                    {stage.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {stage.body}
                  </p>
                </div>

                {/* Videos list */}
                <div className="p-4 space-y-3">
                  {stage.videos.map((v) => (
                    <div key={v.title} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-foreground ml-0.5">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground text-sm font-medium leading-snug">{v.title}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{v.duration}</p>
                      </div>
                    </div>
                  ))}

                  {/* View more */}
                  <button className="text-primary text-sm font-medium w-full text-center pt-1">
                    View more
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
