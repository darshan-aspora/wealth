"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAnnotationProps {
  children: string;
  className?: string;
  size?: "sm" | "md";
}

export function AIAnnotation({ children, className, size = "sm" }: AIAnnotationProps) {
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 italic text-muted-foreground/70",
        size === "sm" ? "text-[13px] leading-snug" : "text-[14px] leading-relaxed",
        className,
      )}
    >
      <Sparkles
        size={size === "sm" ? 12 : 14}
        className="mt-0.5 shrink-0 text-muted-foreground/40"
      />
      <span>{children}</span>
    </p>
  );
}
