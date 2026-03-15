"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Share2, Heart, MoreHorizontal, BarChart3, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatPrice, formatChange, isGain, type TickerItem } from "@/components/ticker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
        "relative z-30 flex items-center justify-between px-5 py-2 transition-all duration-200",
        showCompact && "border-b border-border/50 bg-background/80 backdrop-blur-xl",
      )}
    >
      {/* Left: Back */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft size={20} strokeWidth={2} />
      </Button>

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
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-muted-foreground"
          onClick={onShare}
        >
          <Share2 size={18} strokeWidth={1.8} />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          onClick={onToggleWatchlist}
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
        </Button>

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground">
          <MoreHorizontal size={18} strokeWidth={1.8} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={onCompare}>
          <BarChart3 size={16} />
          Compare
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSetAlert}>
          <Bell size={16} />
          Set Alert
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSearch}>
          <Search size={16} />
          Search
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
