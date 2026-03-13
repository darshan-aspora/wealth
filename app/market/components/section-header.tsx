"use client";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <span className="text-[17px] font-bold text-foreground">{title}</span>
        {action && (
          <button
            onClick={action.onClick}
            className="text-[13px] font-medium text-muted-foreground transition-colors active:text-foreground"
          >
            {action.label}
          </button>
        )}
      </div>
      {subtitle && (
        <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function SectionDivider() {
  return <div className="my-5 h-2 bg-muted/30" />;
}
