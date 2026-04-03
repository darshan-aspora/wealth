"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AnalysisPage } from "./analysis-page";

export function AnalyzeButton() {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = borderRef.current;
    if (!el) return;
    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.005;
      const pos = ((Math.sin(t) + 1) / 2) * 100;
      el.style.backgroundPosition = `${pos}% 50%`;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <div
        ref={borderRef}
        onClick={() => setShowAnalysis(true)}
        className="rounded-xl p-[1.5px] cursor-pointer active:scale-[0.98] transition-transform"
        style={{
          background: "linear-gradient(90deg, hsl(var(--muted)), hsl(var(--foreground)), hsl(var(--muted)), hsl(var(--foreground)), hsl(var(--muted)))",
          backgroundSize: "300% 100%",
        }}
      >
        <div className="flex items-center justify-center gap-2.5 rounded-[10px] bg-background py-3.5 px-5">
          <Sparkles size={16} strokeWidth={2} className="text-foreground" />
          <span className="text-[14px] font-semibold text-foreground">Analyze Portfolio</span>
        </div>
      </div>

      <AnimatePresence>
        {showAnalysis && (
          <AnalysisPage onClose={() => setShowAnalysis(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
