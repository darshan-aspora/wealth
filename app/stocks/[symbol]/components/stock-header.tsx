"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Share2, Heart, MoreHorizontal, BarChart3, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatPrice, formatChange, isGain, type TickerItem } from "@/components/ticker";

interface StockHeaderProps {
  ticker: TickerItem;
  scrollProgress: number; // 0 = top, 1 = fully scrolled past hero
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
  onShare: () => void;
  onCompare: () => void;
  onSetAlert: () => void;
}

export function StockHeader({
  ticker,
  scrollProgress,
  isWatchlisted,
  onToggleWatchlist,
  onShare,
  onCompare,
  onSetAlert,
}: StockHeaderProps) {
  const router = useRouter();
  const showCompact = scrollProgress > 0.5;
  const gain = isGain(ticker);

  return (
    <header
      className={cn(
        "relative z-30 flex items-center justify-between px-4 py-2 transition-all duration-200",
        showCompact && "border-b border-border/50 bg-background/80 backdrop-blur-xl",
      )}
    >
      {/* Left: Back */}
      <button
        onClick={() => router.back()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
      >
        <ArrowLeft size={20} strokeWidth={2} />
      </button>

      {/* Center: Compact price (shown on scroll) */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2"
        initial={false}
        animate={{ opacity: showCompact ? 1 : 0, y: showCompact ? 0 : -8 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-[15px] font-semibold text-foreground">
          {ticker.symbol}
        </span>
        <span className="font-mono text-[15px] font-semibold tabular-nums text-foreground">
          ${formatPrice(ticker.price)}
        </span>
        <span
          className={cn(
            "font-mono text-[13px] font-medium tabular-nums",
            gain ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]",
          )}
        >
          {formatChange(ticker.change)}
        </span>
      </motion.div>

      {/* Right: Actions */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onShare}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
        >
          <Share2 size={18} strokeWidth={1.8} />
        </button>

        <button
          onClick={onToggleWatchlist}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors active:bg-muted/40"
        >
          <Heart
            size={18}
            strokeWidth={1.8}
            className={cn(
              isWatchlisted
                ? "fill-[hsl(var(--loss))] text-[hsl(var(--loss))]"
                : "text-muted-foreground",
            )}
          />
        </button>

        <HeaderOptionsMenu
          onCompare={onCompare}
          onSetAlert={onSetAlert}
          onSearch={() => router.push("/search")}
        />
      </div>
    </header>
  );
}

function HeaderOptionsMenu({
  onCompare,
  onSetAlert,
  onSearch,
}: {
  onCompare: () => void;
  onSetAlert: () => void;
  onSearch: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
      >
        <MoreHorizontal size={18} strokeWidth={1.8} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg"
        >
          {[
            { label: "Compare", icon: BarChart3, action: () => { onCompare(); setOpen(false); } },
            { label: "Set Alert", icon: Bell, action: () => { onSetAlert(); setOpen(false); } },
            { label: "Search", icon: Search, action: () => { onSearch(); setOpen(false); } },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] text-foreground transition-colors hover:bg-muted/40 active:bg-muted/60"
            >
              <item.icon size={16} className="text-muted-foreground" />
              {item.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
