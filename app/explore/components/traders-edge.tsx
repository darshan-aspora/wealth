"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SunMoon, Layers, Cpu, Tag, Zap, BarChart3 } from "lucide-react";

const edges = [
  { icon: SunMoon, title: "Extended Hours", body: "Trade pre-market 4AM \u2014 post-market 8PM ET." },
  { icon: Layers, title: "Advanced Orders", body: "Bracket, trailing stop, OCO \u2014 from day one." },
  { icon: Cpu, title: "Algo Trading", body: "Institutional algorithms from $20/mo flat." },
  { icon: Tag, title: "Transparent Pricing", body: "No hidden spreads. No PFOF. $0.0015/share." },
  { icon: Zap, title: "Instant Funding", body: "Instant credit up to $5K while transfers settle." },
  { icon: BarChart3, title: "TradingView Charts", body: "Professional charting, natively integrated." },
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

export function TradersEdge() {
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
          {/* Card with header + video + features */}
          <motion.div
            variants={fadeUp}
            className="border border-border rounded-xl overflow-hidden bg-background mt-0"
          >
            {/* Top section — title + video */}
            <div className="bg-muted p-5">
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                Built for Traders.<br />Loved by Investors.
              </h2>

              {/* Video placeholder */}
              <div className="mt-5 rounded-xl overflow-hidden bg-background aspect-video flex items-center justify-center cursor-pointer">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-foreground ml-0.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-muted-foreground text-xs">See the platform in action</span>
                </div>
              </div>
            </div>

            {/* Bottom section — features */}
            <div className="p-4 space-y-4">
              {edges.map((edge) => (
                <div key={edge.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <edge.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">{edge.title}</p>
                    <p className="text-muted-foreground text-sm">{edge.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
