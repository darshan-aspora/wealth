"use client";

import { useRouter } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Action {
  label: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Step {
  label: string;
  description: string;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actions?: Action[];
  features?: FeatureCard[];
  steps?: Step[];
  statsPreview?: { label: string; value: string }[];
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actions,
  features,
  steps,
  statsPreview,
  children,
}: EmptyStateProps) {
  const router = useRouter();
  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="flex flex-col items-center px-6 pt-10 pb-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Icon size={26} strokeWidth={1.5} className="text-muted-foreground" />
        </div>
        <p className="text-[20px] font-bold text-foreground tracking-tight mb-2">{title}</p>
        <p className="text-[14px] text-muted-foreground leading-relaxed max-w-[280px]">{subtitle}</p>
      </div>

      {/* Stats preview (ghost) */}
      {statsPreview && (
        <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
          {statsPreview.map((s, i) => (
            <div key={i} className="rounded-2xl border border-border/40 bg-muted/30 px-3 py-3 text-center">
              <p className="text-[17px] font-bold text-foreground/20 tabular-nums">{s.value}</p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Feature cards */}
      {features && features.length > 0 && (
        <div className="px-5 mb-5">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">What you&apos;ll unlock</p>
          <div className="space-y-2.5">
            {features.map((f, i) => {
              const FIcon = f.icon;
              return (
                <div key={i} className="flex items-start gap-3 rounded-2xl border border-border/40 bg-background px-4 py-3.5">
                  <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <FIcon size={15} className="text-foreground" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-foreground leading-snug">{f.title}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How it works steps */}
      {steps && steps.length > 0 && (
        <div className="px-5 mb-5">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">How it works</p>
          <div className="space-y-0 rounded-2xl border border-border/40 bg-background overflow-hidden divide-y divide-border/40">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-background">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground leading-snug">{s.label}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extra slot */}
      {children && <div className="px-5 mb-5">{children}</div>}

      {/* CTAs */}
      {actions && actions.length > 0 && (
        <div className="px-5 flex flex-col gap-2.5">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => { if (a.href) router.push(a.href); a.onClick?.(); }}
              className={cn(
                "w-full rounded-2xl py-4 text-[15px] font-bold transition-opacity active:opacity-75",
                a.primary
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-foreground bg-background"
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
