"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, CalendarDays, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColorAxis } from "./types";
import { formatColorValue } from "./treemap";

export interface HeatmapTileProps {
  id: string;
  label: string;
  w: number; // width percentage 0-100
  h: number; // height percentage 0-100
  x: number;
  y: number;
  color: string;
  value: number;
  colorAxis: ColorAxis;
  dim?: boolean;
  highlight?: boolean;
  isDark: boolean;
  inWatchlist?: boolean;
  showWatchlistRing?: boolean;
  showBadges?: boolean;
  badges?: {
    earningsSoon?: boolean;
    newHigh52w?: boolean;
    newLow52w?: boolean;
    volumeSpike?: boolean;
    upgradeOrDowngrade?: boolean;
  };
  onClick?: () => void;
}

export function HeatmapTile({
  id,
  label,
  w,
  h,
  x,
  y,
  color,
  value,
  colorAxis,
  dim,
  highlight,
  isDark,
  inWatchlist,
  showWatchlistRing,
  showBadges,
  badges,
  onClick,
}: HeatmapTileProps) {
  // Rough pixel footprint — the container is 430x∞; we approximate to decide label density
  const approxPxW = (w / 100) * 400;
  const approxPxH = (h / 100) * 500;
  const showLabel = approxPxW > 28 && approxPxH > 24;
  const showValue = approxPxW > 42 && approxPxH > 32;
  const isLarge = approxPxW > 65 && approxPxH > 50;
  const showBadgeBar = showBadges && approxPxW > 48 && approxPxH > 40;

  const renderedBadges: { Icon: typeof Zap; key: string; title: string }[] = [];
  if (badges?.earningsSoon) renderedBadges.push({ Icon: CalendarDays, key: "earn", title: "Earnings soon" });
  if (badges?.volumeSpike) renderedBadges.push({ Icon: Zap, key: "vol", title: "Unusual volume" });
  if (badges?.newHigh52w) renderedBadges.push({ Icon: ChevronUp, key: "hi", title: "52-week high" });
  if (badges?.newLow52w) renderedBadges.push({ Icon: ChevronDown, key: "lo", title: "52-week low" });
  if (badges?.upgradeOrDowngrade) renderedBadges.push({ Icon: TrendingUp, key: "up", title: "Analyst action" });

  return (
    <motion.button
      onClick={onClick}
      aria-label={`${label} ${formatColorValue(value, colorAxis)}`}
      className={cn(
        "absolute p-[1px] transition-opacity duration-200",
        dim ? "opacity-25" : "opacity-100",
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
      }}
    >
      <div
        className={cn(
          "relative flex h-full w-full flex-col items-center justify-center overflow-hidden",
          showWatchlistRing && inWatchlist && "ring-2 ring-inset ring-foreground",
          highlight && "ring-2 ring-inset ring-foreground",
        )}
        style={{ backgroundColor: color }}
      >
        {/* Highlight pulse */}
        <AnimatePresence>
          {highlight && (
            <motion.div
              initial={{ opacity: 0.9, scale: 1 }}
              animate={{ opacity: 0, scale: 1.05 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute inset-0 bg-foreground/20"
            />
          )}
        </AnimatePresence>

        {/* Watchlist corner star */}
        {showWatchlistRing && inWatchlist && approxPxW > 34 && (
          <span
            className={cn(
              "absolute left-[3px] top-[3px] h-[6px] w-[6px] rounded-full",
              isDark ? "bg-white" : "bg-black",
            )}
            aria-hidden
          />
        )}

        {/* Badges top-right */}
        {showBadgeBar && renderedBadges.length > 0 && (
          <div className="absolute right-[3px] top-[3px] flex items-center gap-[2px]">
            {renderedBadges.slice(0, 2).map(({ Icon, key, title }) => (
              <span
                key={key}
                title={title}
                className={cn(
                  "flex h-[14px] w-[14px] items-center justify-center rounded-[3px]",
                  isDark ? "bg-black/30" : "bg-white/60",
                )}
              >
                <Icon
                  size={9}
                  strokeWidth={2.5}
                  className={cn(isDark ? "text-white/90" : "text-black/70")}
                />
              </span>
            ))}
          </div>
        )}

        {/* Label + value stack */}
        {showLabel && (
          <span
            className={cn(
              "font-bold leading-none text-center px-1",
              isDark ? "text-white" : "text-black/85",
            )}
            style={{ fontSize: isLarge ? 13 : 10 }}
          >
            {label}
          </span>
        )}
        {showValue && id !== "Others" && (
          <span
            className={cn(
              "mt-0.5 leading-none tabular-nums",
              isDark ? "text-white/85" : "text-black/55",
            )}
            style={{ fontSize: isLarge ? 11 : 9 }}
          >
            {formatColorValue(value, colorAxis)}
          </span>
        )}
      </div>
    </motion.button>
  );
}

// Silence unused import warnings for icons we pick from dynamically
void TrendingUp;
void TrendingDown;
