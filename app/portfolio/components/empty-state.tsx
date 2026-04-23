"use client";

import { useRouter } from "next/navigation";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actions?: { label: string; href?: string; onClick?: () => void; primary?: boolean }[];
}

export function EmptyState({ icon: Icon, title, subtitle, actions }: EmptyStateProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
        <Icon size={28} strokeWidth={1.5} className="text-muted-foreground" />
      </div>
      <p className="text-[18px] font-bold text-foreground mb-2">{title}</p>
      <p className="text-[14px] text-muted-foreground leading-relaxed mb-8">{subtitle}</p>
      {actions && actions.length > 0 && (
        <div className="flex flex-col gap-3 w-full max-w-[260px]">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => { if (a.href) router.push(a.href); a.onClick?.(); }}
              className={
                a.primary
                  ? "w-full rounded-2xl bg-foreground py-3.5 text-[15px] font-bold text-background active:opacity-75"
                  : "w-full rounded-2xl border border-border/60 py-3.5 text-[15px] font-semibold text-foreground active:opacity-70"
              }
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
