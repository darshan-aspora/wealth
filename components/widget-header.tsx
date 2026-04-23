"use client";

import { type ReactNode, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface WHTab {
  id: string;
  label: string;
}

export interface WHFlipper {
  label: string;
  icon: ReactNode;
  onFlip: () => void;
}

export interface WidgetHeaderProps {
  title: string;
  description?: string;
  flipper?: WHFlipper;
  tabs?: WHTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  tabDescription?: { title: string; body: ReactNode };
  pillLayoutId?: string;
  children?: ReactNode;
  className?: string;
}

export function WidgetHeader({
  title,
  description,
  flipper,
  tabs,
  activeTab,
  onTabChange,
  tabDescription,
  pillLayoutId = "wh-pill",
  children,
  className,
}: WidgetHeaderProps) {
  const [showInfo, setShowInfo] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollTabToCenter = useCallback((el: HTMLButtonElement) => {
    requestAnimationFrame(() => {
      const container = tabsRef.current;
      if (!container) return;
      const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
    });
  }, []);

  return (
    <div className={className}>
      {/* ── Title row ── */}
      <div className={cn("flex items-center justify-between", description ? "mb-1" : "mb-3.5")}>
        <h2 className="text-[18px] font-bold tracking-tight">{title}</h2>
        {flipper && (
          <button
            onClick={flipper.onFlip}
            className="flex items-center gap-1.5 overflow-hidden rounded-full border border-border/60 bg-background px-3 py-1.5 text-[13px] font-semibold text-foreground active:opacity-70 transition-opacity"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={flipper.label}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {flipper.label}
              </motion.span>
            </AnimatePresence>
            {flipper.icon}
          </button>
        )}
      </div>

      {description && (
        <p className="mb-3.5 text-[13px] text-muted-foreground leading-snug">{description}</p>
      )}

      {/* ── Tab pills ── */}
      {tabs && tabs.length > 0 && (
        <div ref={tabsRef} className="-mx-5 mb-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 px-5 py-0.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    if (isActive && tabDescription) {
                      setShowInfo((v) => !v);
                    } else {
                      setShowInfo(false);
                      onTabChange?.(tab.id);
                      scrollTabToCenter(e.currentTarget);
                    }
                  }}
                  className={cn(
                    "relative flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[14px] font-semibold transition-colors duration-200",
                    isActive ? "text-background" : "text-muted-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId={pillLayoutId}
                      className="absolute inset-0 rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    {tab.label}
                    {isActive && tabDescription && (
                      <Info size={14} strokeWidth={2} className="text-background" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Content (table, heatmap, etc.) ── */}
      {children}

      {/* ── Info Sheet ── */}
      <Sheet open={showInfo} onOpenChange={setShowInfo}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85dvh] flex flex-col p-0" hideClose>
          <div className="flex-1 overflow-y-auto px-5 pt-6">
            <div className="flex flex-col items-center mb-5">
              <div className="h-[100px] w-[100px] rounded-2xl bg-muted mb-4" />
              <h3 className="text-[20px] font-bold text-foreground text-center">
                {tabDescription?.title}
              </h3>
            </div>
            <div className="mb-4">
              {tabDescription?.body}
            </div>
          </div>
          <div className="sticky bottom-0 px-5 pt-3 pb-10 bg-background border-t border-border/40">
            <button
              onClick={() => setShowInfo(false)}
              className="w-full rounded-full bg-foreground py-3.5 text-[15px] font-semibold text-background active:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
