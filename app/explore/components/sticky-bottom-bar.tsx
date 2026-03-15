"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function StickyBottomBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.04)] transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-5 sm:px-6">
        <span className="text-foreground font-semibold text-base">
          Aspora Wealth
        </span>
        <button className="bg-primary text-primary-foreground h-10 px-5 rounded-lg text-sm font-medium">
          Open Free Account
        </button>
      </div>
    </div>
  );
}
