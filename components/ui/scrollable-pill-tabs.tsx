"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface ScrollablePillTab {
  id: string;
  label: string;
}

interface ScrollablePillTabsProps {
  items: ScrollablePillTab[];
  activeId: string;
  onChange: (id: string) => void;
  layoutId?: string;
  className?: string;
  scrollerClassName?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  inactiveItemClassName?: string;
  activePillClassName?: string;
}

export function ScrollablePillTabs({
  items,
  activeId,
  onChange,
  layoutId = "scrollable-pill-tabs",
  className,
  scrollerClassName,
  itemClassName,
  activeItemClassName,
  inactiveItemClassName,
  activePillClassName,
}: ScrollablePillTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !activeRef.current) return;
    const container = scrollRef.current;
    const el = activeRef.current;
    const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
    container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeId]);

  return (
    <div className={className}>
      <div ref={scrollRef} className={cn("no-scrollbar overflow-x-auto", scrollerClassName)}>
        <div className="flex w-max min-w-full items-center gap-1.5">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                ref={isActive ? activeRef : undefined}
                onClick={() => onChange(item.id)}
                className={cn(
                  "relative shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[14px] font-medium tracking-[-0.14px] transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                  isActive ? activeItemClassName : inactiveItemClassName,
                  itemClassName,
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId={layoutId}
                    className={cn("absolute inset-0 rounded-md bg-muted", activePillClassName)}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
