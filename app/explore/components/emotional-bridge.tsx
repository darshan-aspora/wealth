"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, DollarSign, Clock } from "lucide-react";

const cards = [
  {
    icon: TrendingUp,
    title: "Beat Inflation",
    stat: "+22.4%",
    statLabel: "S&P 500 (1Y)",
    body: "Savings give you 3\u20134%. Inflation takes 5\u20136%. Investing closes the gap.",
  },
  {
    icon: DollarSign,
    title: "Start From $1",
    stat: "$1",
    statLabel: "Minimum investment",
    body: "Own Apple, NVIDIA, or the S&P 500 with fractional shares.",
  },
  {
    icon: Clock,
    title: "Time Is Your Edge",
    stat: "$113K",
    statLabel: "$50/mo for 30 years",
    body: "The best time to invest was 10 years ago. The second best is now.",
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

export function EmotionalBridge() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Auto-scroll carousel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let current = 0;
    const cardWidth = 240 + 12; // w-[240px] + gap-3

    const interval = setInterval(() => {
      current = (current + 1) % cards.length;
      el.scrollTo({ left: current * cardWidth, behavior: "smooth" });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-muted py-8">
      <div ref={sectionRef} className="px-4">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl font-bold text-foreground text-center"
          >
            Make your money work for you
          </motion.h2>

          <motion.div
            ref={scrollRef}
            variants={fadeUp}
            className="flex gap-3 overflow-x-auto no-scrollbar mt-6 -mx-1 px-1 snap-x snap-mandatory"
          >
            {cards.map((card) => (
              <div
                key={card.title}
                className="shrink-0 w-[240px] snap-start border border-border rounded-xl bg-background p-4"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mt-3">
                  {card.title}
                </h3>
                <p className="font-mono text-2xl font-bold text-gain mt-2">
                  {card.stat}
                </p>
                <p className="text-muted-foreground text-xs">{card.statLabel}</p>
                <p className="text-muted-foreground text-sm mt-3">
                  {card.body}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
