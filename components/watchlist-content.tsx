"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useAnimation,
  type PanInfo,
} from "framer-motion";
import { ChevronDown, Flag, Bell, Trash2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type TickerItem,
  TickerLogo,
  formatPrice,
  formatChange,
  formatPercent,
  isGain,
} from "@/components/ticker";
import { useWatchlist } from "@/components/watchlist-context";

// ─── Total count for tab badge ──────────────────────────────────────────────

export function useWatchlistTotalCount() {
  const { sections, deletedSymbols, deletedSections } = useWatchlist();
  return useMemo(
    () =>
      sections
        .filter((s) => !deletedSections.has(s.id))
        .reduce(
          (sum, s) =>
            sum + s.stocks.filter((t) => !deletedSymbols.has(t.symbol)).length,
          0
        ),
    [sections, deletedSymbols, deletedSections]
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({
  label,
  isCollapsed,
  onToggle,
}: {
  label: string;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between px-4 py-3"
    >
      <span className="text-[15px] font-semibold text-muted-foreground">
        {label}
      </span>
      <motion.div
        animate={{ rotate: isCollapsed ? -90 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <ChevronDown size={18} className="text-muted-foreground/60" />
      </motion.div>
    </button>
  );
}

// ─── Swipeable Section Header ──────────────────────────────────────────────

const SECTION_ACTION_WIDTH = 64; // 1 button × 64px

function SwipeableSectionHeader({
  label,
  isCollapsed,
  onToggle,
  onDelete,
  isOpen,
  onOpen,
}: {
  label: string;
  isCollapsed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  isOpen: boolean;
  onOpen: () => void;
}) {
  const x = useMotionValue(0);
  const controls = useAnimation();

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -40) {
      onOpen();
      controls.start({
        x: -SECTION_ACTION_WIDTH,
        transition: { type: "spring", stiffness: 400, damping: 35 },
      });
    } else {
      controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 35 },
      });
    }
  };

  // Close when another row opens
  useEffect(() => {
    if (!isOpen) {
      controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 35 },
      });
    }
  }, [isOpen, controls]);

  return (
    <div className="relative overflow-hidden">
      {/* Delete button behind the header */}
      <div className="absolute bottom-0 right-0 top-0 flex items-stretch">
        <button
          onClick={onDelete}
          className="flex w-16 flex-col items-center justify-center gap-1 bg-red-500/90 text-white"
        >
          <Trash2 size={16} strokeWidth={1.8} />
          <span className="text-[11px] font-medium">Delete</span>
        </button>
      </div>

      {/* Draggable foreground */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -SECTION_ACTION_WIDTH, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-background"
      >
        <SectionHeader
          label={label}
          isCollapsed={isCollapsed}
          onToggle={onToggle}
        />
      </motion.div>
    </div>
  );
}

// ─── Stock Row (content only) ───────────────────────────────────────────────

function StockRow({
  ticker,
  isFlagged,
}: {
  ticker: TickerItem;
  isFlagged: boolean;
}) {
  const gain = isGain(ticker);

  return (
    <div className="relative flex items-center gap-3 px-4 py-3">
      {/* Flag bar — absolute left edge, same height as logo (40px) */}
      {isFlagged && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          className="absolute bottom-0 left-0 top-0 my-auto h-10 w-[3px] rounded-r-full bg-red-500"
        />
      )}

      {/* Logo */}
      <TickerLogo ticker={ticker} />

      {/* Name + Symbol */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
          {ticker.name}
        </p>
        <p className="mt-0.5 text-[14px] leading-tight text-muted-foreground">
          {ticker.symbol}
        </p>
      </div>

      {/* Price + Change */}
      <div className="shrink-0 text-right">
        <p className="font-mono text-[15px] font-semibold tabular-nums leading-tight text-foreground">
          {formatPrice(ticker.price)}
        </p>
        <p
          className={cn(
            "mt-0.5 text-[14px] font-medium tabular-nums leading-tight",
            gain ? "text-gain" : "text-loss"
          )}
        >
          {formatChange(ticker.change)} ({formatPercent(ticker.changePercent)})
        </p>
      </div>
    </div>
  );
}

// ─── Swipeable Row ──────────────────────────────────────────────────────────

const ACTION_WIDTH = 192; // 3 buttons × 64px

function SwipeableRow({
  ticker,
  isFlagged,
  onFlag,
  onDelete,
  isOpen,
  onOpen,
}: {
  ticker: TickerItem;
  isFlagged: boolean;
  onFlag: () => void;
  onDelete: () => void;
  isOpen: boolean;
  onOpen: () => void;
}) {
  const x = useMotionValue(0);
  const controls = useAnimation();

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) {
      onOpen();
      controls.start({
        x: -ACTION_WIDTH,
        transition: { type: "spring", stiffness: 400, damping: 35 },
      });
    } else {
      controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 35 },
      });
    }
  };

  const close = () => {
    controls.start({
      x: 0,
      transition: { type: "spring", stiffness: 400, damping: 35 },
    });
  };

  // Close when another row opens
  useEffect(() => {
    if (!isOpen) {
      controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 35 },
      });
    }
  }, [isOpen, controls]);

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons behind the row */}
      <div className="absolute bottom-0 right-0 top-0 flex items-stretch">
        <button
          onClick={() => {
            onFlag();
            close();
          }}
          className="flex w-16 flex-col items-center justify-center gap-1 border-r border-border/40 bg-muted/40 text-muted-foreground"
        >
          <Flag size={16} strokeWidth={1.8} />
          <span className="text-[11px] font-medium">Flag</span>
        </button>
        <button
          onClick={close}
          className="flex w-16 flex-col items-center justify-center gap-1 border-r border-border/40 bg-muted/40 text-muted-foreground"
        >
          <Bell size={16} strokeWidth={1.8} />
          <span className="text-[11px] font-medium">Alert</span>
        </button>
        <button
          onClick={() => {
            onDelete();
          }}
          className="flex w-16 flex-col items-center justify-center gap-1 bg-muted/40 text-muted-foreground"
        >
          <Trash2 size={16} strokeWidth={1.8} />
          <span className="text-[11px] font-medium">Delete</span>
        </button>
      </div>

      {/* Draggable foreground */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-background"
      >
        <StockRow ticker={ticker} isFlagged={isFlagged} />
      </motion.div>
    </div>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────

export function WatchlistContent() {
  const {
    sections,
    currentSort,
    flaggedSymbols,
    toggleFlag,
    deletedSymbols,
    deleteSymbol,
    deletedSections,
    deleteSection,
    collapsedSections,
    toggleSection,
  } = useWatchlist();
  const router = useRouter();

  // Track which row is swiped open (only one at a time)
  const [openRow, setOpenRow] = useState<string | null>(null);

  const sortedSections = useMemo(() => {
    return sections
      .filter((s) => !deletedSections.has(s.id))
      .map((section) => ({
        ...section,
        stocks: [...section.stocks]
          .filter((s) => !deletedSymbols.has(s.symbol))
          .sort((a, b) => {
            switch (currentSort) {
              case "symbol":
                return a.symbol.localeCompare(b.symbol);
              case "change":
                return Math.abs(b.changePercent) - Math.abs(a.changePercent);
              case "volume":
                return (b.volume ?? 0) - (a.volume ?? 0);
              case "marketCap":
                return (b.marketCap ?? 0) - (a.marketCap ?? 0);
              case "flag": {
                const af = flaggedSymbols.has(a.symbol) ? 0 : 1;
                const bf = flaggedSymbols.has(b.symbol) ? 0 : 1;
                return af - bf;
              }
              default:
                return 0;
            }
          }),
      }));
  }, [sections, currentSort, deletedSymbols, deletedSections, flaggedSymbols]);

  return (
    <div className="pb-4">
      <AnimatePresence initial={false}>
      {sortedSections.map((section) => {
        const isCollapsed = collapsedSections.has(section.id);

        return (
          <motion.div
            key={section.id}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.25 } }}
            className="overflow-hidden"
          >
            <SwipeableSectionHeader
              label={section.label}
              isCollapsed={isCollapsed}
              onToggle={() => toggleSection(section.id)}
              onDelete={() => deleteSection(section.id)}
              isOpen={openRow === `section-${section.id}`}
              onOpen={() => setOpenRow(`section-${section.id}`)}
            />

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="overflow-hidden"
                >
                  <AnimatePresence initial={false}>
                    {section.stocks.map((stock) => (
                      <motion.div
                        key={stock.symbol}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: { duration: 0.2 },
                        }}
                        className="overflow-hidden"
                      >
                        <SwipeableRow
                          ticker={stock}
                          isFlagged={flaggedSymbols.has(stock.symbol)}
                          onFlag={() => toggleFlag(stock.symbol)}
                          onDelete={() => deleteSymbol(stock.symbol)}
                          isOpen={openRow === stock.symbol}
                          onOpen={() => setOpenRow(stock.symbol)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Section divider */}
            <div className="mx-4 h-px bg-border/30" />
          </motion.div>
        );
      })}
      </AnimatePresence>

      {/* Add button */}
      <button
        onClick={() => router.push("/search")}
        className="mx-4 mt-3 flex w-[calc(100%-32px)] items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-3 text-[15px] font-medium text-muted-foreground transition-colors active:bg-muted/40"
      >
        <Bookmark size={18} strokeWidth={2} />
        Add
      </button>
    </div>
  );
}
