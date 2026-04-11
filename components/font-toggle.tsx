"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Type } from "lucide-react";
import { cn } from "@/lib/utils";

type FontFamily = "inter" | "haffer";

const FontContext = createContext<{
  font: FontFamily;
  toggle: () => void;
}>({ font: "inter", toggle: () => {} });

export function useFontToggle() {
  return useContext(FontContext);
}

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFont] = useState<FontFamily>("inter");

  useEffect(() => {
    const html = document.documentElement;
    if (font === "haffer") {
      html.classList.add("font-haffer");
      html.classList.remove("font-inter");
    } else {
      html.classList.add("font-inter");
      html.classList.remove("font-haffer");
    }
  }, [font]);

  const toggle = useCallback(() => {
    setFont((f) => (f === "inter" ? "haffer" : "inter"));
  }, []);

  return (
    <FontContext.Provider value={{ font, toggle }}>
      {children}
    </FontContext.Provider>
  );
}

export function FontToggleButton() {
  const { font, toggle } = useFontToggle();

  return (
    <button
      onClick={toggle}
      className={cn(
        "fixed bottom-24 right-4 z-[9999] flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 shadow-lg active:scale-95 transition-all"
      )}
    >
      <Type size={15} strokeWidth={2} className="text-foreground" />
      <span className="text-[13px] font-semibold text-foreground">
        {font === "inter" ? "Inter" : "Haffer"}
      </span>
    </button>
  );
}
