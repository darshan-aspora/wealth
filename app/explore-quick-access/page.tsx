"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, GitCompareArrows, ListFilter, GraduationCap, ChevronRight, Brain, BarChart3, Newspaper, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

const items: { label: string; icon: LucideIcon; comingSoon?: boolean; desc?: string }[] = [
  { label: "My Watchlist", icon: Bookmark, desc: "Your saved stocks" },
  { label: "Compare Stocks", icon: GitCompareArrows, desc: "Side-by-side analysis" },
  { label: "Portfolio Analysis", icon: Brain, desc: "AI-powered insights" },
  { label: "Market Summary", icon: BarChart3, desc: "Daily performance recap" },
  { label: "News", icon: Newspaper, desc: "Market & stock news" },
  { label: "Screener", icon: ListFilter, comingSoon: true, desc: "Filter by metrics" },
  { label: "Level Up", icon: GraduationCap, desc: "Learn as you invest" },
];

/* V1 — 2-col grid, bordered cards (current) */
function V1() {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className="relative flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3.5 text-left active:scale-[0.98] transition-transform">
              <Icon size={20} strokeWidth={1.8} className="shrink-0 text-foreground" />
              <span className="text-[14px] font-semibold text-foreground">{item.label}</span>
              {item.comingSoon && <span className="absolute top-2 right-2.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Soon</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* V2 — Multi-row wrapping pills */
function V2() {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access</h2>
      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex flex-col gap-2.5 px-5" style={{ width: "max-content" }}>
          {/* Row 1: My Watchlist, Compare Stocks, Level Up, News */}
          <div className="flex gap-2.5">
            {(["My Watchlist", "Compare Stocks", "Level Up"] as const).map((label) => {
              const item = items.find((i) => i.label === label)!;
              const Icon = item.icon;
              return (
                <button key={item.label} className="relative flex shrink-0 items-center gap-2.5 rounded-full border border-border/60 px-4 py-2.5 active:scale-[0.97] transition-transform">
                  <Icon size={18} strokeWidth={1.8} className="text-foreground" />
                  <span className="text-[14px] font-semibold text-foreground whitespace-nowrap">{item.label}</span>
                  {item.comingSoon && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">Soon</span>}
                </button>
              );
            })}
          </div>
          {/* Row 2: Portfolio Analysis, Market Summary, Screener */}
          <div className="flex gap-2.5">
            {(["Portfolio Analysis", "Market Summary", "News"] as const).map((label) => {
              const item = items.find((i) => i.label === label)!;
              const Icon = item.icon;
              return (
                <button key={item.label} className="relative flex shrink-0 items-center gap-2.5 rounded-full border border-border/60 px-4 py-2.5 active:scale-[0.97] transition-transform">
                  <Icon size={18} strokeWidth={1.8} className="text-foreground" />
                  <span className="text-[14px] font-semibold text-foreground whitespace-nowrap">{item.label}</span>
                  {item.comingSoon && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">Soon</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* V3 — Vertical list with chevrons */
function V3() {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access</h2>
      <div className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-muted/50 transition-colors">
              <Icon size={20} strokeWidth={1.8} className="shrink-0 text-foreground" />
              <span className="flex-1 text-[14px] font-semibold text-foreground">{item.label}</span>
              {item.comingSoon ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Soon</span>
              ) : (
                <ChevronRight size={16} className="text-muted-foreground/40" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* V4 — Icon-top grid cards with descriptions */
function V4() {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className="relative flex flex-col items-start rounded-2xl border border-border/60 p-4 text-left active:scale-[0.98] transition-transform">
              <Icon size={22} strokeWidth={1.8} className="text-foreground mb-3" />
              <span className="text-[14px] font-semibold text-foreground">{item.label}</span>
              <span className="text-[12px] text-muted-foreground mt-0.5">{item.desc}</span>
              {item.comingSoon && <span className="absolute top-3 right-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Soon</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* V5 — Filled cards, no border */
function V5() {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className="relative flex items-center gap-3 rounded-2xl bg-muted px-4 py-3.5 text-left active:scale-[0.98] transition-transform">
              <Icon size={20} strokeWidth={1.8} className="shrink-0 text-foreground" />
              <span className="text-[14px] font-semibold text-foreground">{item.label}</span>
              {item.comingSoon && <span className="absolute top-2 right-2.5 rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Soon</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* V6 — Icon in circle + label, compact grid */
function V6() {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access</h2>
      <div className="grid grid-cols-4 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className="relative flex flex-col items-center gap-2 active:scale-[0.95] transition-transform">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Icon size={22} strokeWidth={1.8} className="text-foreground" />
              </div>
              <span className="text-[12px] font-semibold text-foreground text-center leading-tight">{item.label}</span>
              {item.comingSoon && <span className="absolute -top-1 -right-1 rounded-full bg-foreground px-1.5 py-0.5 text-[8px] font-bold text-background">Soon</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* V7 — Horizontal scroll cards with icon-top and description */
function V7() {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access</h2>
      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex gap-2.5 px-5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="relative flex shrink-0 flex-col items-start rounded-2xl border border-border/60 p-4 w-[140px] text-left active:scale-[0.98] transition-transform">
                <Icon size={22} strokeWidth={1.8} className="text-foreground mb-2.5" />
                <span className="text-[14px] font-semibold text-foreground">{item.label}</span>
                <span className="text-[12px] text-muted-foreground mt-0.5">{item.desc}</span>
                {item.comingSoon && <span className="absolute top-3 right-3 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">Soon</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* V8 — Full-width stacked, icon left, description right */
function V8() {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access</h2>
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className="flex w-full items-center gap-4 rounded-2xl bg-muted px-4 py-3.5 text-left active:scale-[0.99] transition-transform">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background">
                <Icon size={20} strokeWidth={1.8} className="text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[14px] font-semibold text-foreground">{item.label}</span>
                <p className="text-[12px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              {item.comingSoon ? (
                <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Soon</span>
              ) : (
                <ChevronRight size={16} className="shrink-0 text-muted-foreground/40" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* V9 — No title, single row of icon pills, minimal */
function V9() {
  return (
    <div className="-mx-5 overflow-x-auto no-scrollbar">
      <div className="flex gap-3 px-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className="relative flex shrink-0 flex-col items-center gap-1.5 active:opacity-70 transition-opacity">
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", item.comingSoon ? "bg-muted/50" : "bg-muted")}>
                <Icon size={24} strokeWidth={1.8} className={cn(item.comingSoon ? "text-muted-foreground/40" : "text-foreground")} />
              </div>
              <span className={cn("text-[11px] font-semibold text-center leading-tight", item.comingSoon ? "text-muted-foreground/40" : "text-foreground")}>{item.label}</span>
              {item.comingSoon && <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-1.5 py-px text-[8px] font-bold text-background whitespace-nowrap">Soon</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* V10 — 2-col, icon-top centered, filled bg, no border */
function V10() {
  return (
    <div>
      <h2 className="text-[18px] font-bold tracking-tight mb-3.5">Quick Access</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className="relative flex flex-col items-center justify-center rounded-2xl bg-muted py-5 px-3 text-center active:scale-[0.98] transition-transform">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-background mb-2.5">
                <Icon size={20} strokeWidth={1.8} className="text-foreground" />
              </div>
              <span className="text-[14px] font-semibold text-foreground">{item.label}</span>
              <span className="text-[12px] text-muted-foreground mt-0.5">{item.desc}</span>
              {item.comingSoon && <span className="absolute top-2.5 right-2.5 rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Soon</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const variations = [
  { name: "V1 — 2-Col Grid, Bordered", component: V1 },
  { name: "V2 — Horizontal Scroll Pills", component: V2 },
  { name: "V3 — Vertical List with Chevrons", component: V3 },
  { name: "V4 — Icon-Top Grid with Desc", component: V4 },
  { name: "V5 — Filled Cards, No Border", component: V5 },
  { name: "V6 — Compact 4-Col Icon Grid", component: V6 },
  { name: "V7 — Horizontal Scroll Cards", component: V7 },
  { name: "V8 — Full-Width Stacked", component: V8 },
  { name: "V9 — Minimal Icon Row, No Title", component: V9 },
  { name: "V10 — 2-Col Centered, Filled", component: V10 },
];

export default function QuickAccessExplore() {
  const [active, setActive] = useState(0);

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors">
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">Quick Access</h1>
          <p className="text-[13px] text-muted-foreground">10 layout variations</p>
        </div>
      </div>

      {/* Version picker */}
      <div className="-mx-0 overflow-x-auto no-scrollbar border-b border-border/40">
        <div className="flex gap-0 px-5">
          {variations.map((v, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                active === i ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              V{i + 1}
              {active === i && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-5 pt-6 pb-10">
          <p className="text-[13px] text-muted-foreground mb-5">{variations[active].name}</p>
          {(() => {
            const Comp = variations[active].component;
            return <Comp />;
          })()}
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
