"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Clock,
  ChevronRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

/* ------------------------------------------------------------------ */
/*  Notification types & data                                          */
/* ------------------------------------------------------------------ */

type AlertType = "price_above" | "price_below" | "percent_up" | "percent_down" | "target_hit" | "stop_loss";

interface Notification {
  id: string;
  type: AlertType;
  symbol: string;
  name: string;
  message: string;
  detail: string;
  time: string;
  read: boolean;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "percent_up",
    symbol: "NVDA",
    name: "NVIDIA Corp",
    message: "NVDA is up +5.2% today",
    detail: "Price moved from 875.30 to 920.82. Your alert for +5% daily move was triggered.",
    time: "2m ago",
    read: false,
  },
  {
    id: "n2",
    type: "price_above",
    symbol: "AAPL",
    name: "Apple Inc",
    message: "AAPL crossed above 195.00",
    detail: "Current price: 196.42. Your price alert for above 195.00 was triggered.",
    time: "18m ago",
    read: false,
  },
  {
    id: "n3",
    type: "stop_loss",
    symbol: "TSLA",
    name: "Tesla Inc",
    message: "TSLA hit your stop-loss at 165.00",
    detail: "Price dropped to 164.38. Consider reviewing your position or placing a sell order.",
    time: "45m ago",
    read: false,
  },
  {
    id: "n4",
    type: "percent_down",
    symbol: "META",
    name: "Meta Platforms",
    message: "META is down -5.8% today",
    detail: "Price declined from 512.60 to 482.87. Your alert for -5% daily drop was triggered.",
    time: "1h ago",
    read: true,
  },
  {
    id: "n5",
    type: "target_hit",
    symbol: "MSFT",
    name: "Microsoft Corp",
    message: "MSFT reached your target of 430.00",
    detail: "Current price: 431.15. Your target price alert was triggered. Consider taking profits.",
    time: "2h ago",
    read: true,
  },
  {
    id: "n6",
    type: "price_below",
    symbol: "AMZN",
    name: "Amazon.com",
    message: "AMZN dropped below 178.00",
    detail: "Current price: 176.54. Your price alert for below 178.00 was triggered.",
    time: "3h ago",
    read: true,
  },
  {
    id: "n7",
    type: "percent_up",
    symbol: "AMD",
    name: "Advanced Micro Devices",
    message: "AMD is up +7.3% today",
    detail: "Price surged from 158.20 to 169.75 on strong earnings beat. Your +5% alert was triggered.",
    time: "4h ago",
    read: true,
  },
  {
    id: "n8",
    type: "percent_down",
    symbol: "GOOGL",
    name: "Alphabet Inc",
    message: "GOOGL is down -5.1% today",
    detail: "Price fell from 172.80 to 163.98 amid sector rotation. Your -5% alert was triggered.",
    time: "5h ago",
    read: true,
  },
  {
    id: "n9",
    type: "price_above",
    symbol: "JPM",
    name: "JPMorgan Chase",
    message: "JPM crossed above 200.00",
    detail: "Current price: 201.30. New all-time high. Your price alert for above 200.00 was triggered.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n10",
    type: "stop_loss",
    symbol: "NFLX",
    name: "Netflix Inc",
    message: "NFLX hit your stop-loss at 600.00",
    detail: "Price dropped to 597.25 after disappointing subscriber guidance. Review your position.",
    time: "Yesterday",
    read: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Icon + color helpers                                               */
/* ------------------------------------------------------------------ */

function alertMeta(type: AlertType) {
  switch (type) {
    case "price_above":
      return { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/15", ring: "ring-emerald-500/20" };
    case "price_below":
      return { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/15", ring: "ring-red-500/20" };
    case "percent_up":
      return { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/15", ring: "ring-emerald-500/20" };
    case "percent_down":
      return { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/15", ring: "ring-red-500/20" };
    case "target_hit":
      return { icon: Target, color: "text-violet-400", bg: "bg-violet-500/15", ring: "ring-violet-500/20" };
    case "stop_loss":
      return { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/15", ring: "ring-amber-500/20" };
  }
}

function alertLabel(type: AlertType) {
  switch (type) {
    case "price_above": return "Price Above";
    case "price_below": return "Price Below";
    case "percent_up": return "% Gain Alert";
    case "percent_down": return "% Drop Alert";
    case "target_hit": return "Target Hit";
    case "stop_loss": return "Stop-Loss";
  }
}

/* ------------------------------------------------------------------ */
/*  Notification Card                                                  */
/* ------------------------------------------------------------------ */

function NotificationCard({ notification, index }: { notification: Notification; index: number }) {
  const router = useRouter();
  const meta = alertMeta(notification.type);
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onClick={() => router.push(`/stocks/${notification.symbol}`)}
      className={cn(
        "flex gap-3 px-4 py-4 cursor-pointer transition-colors active:bg-muted/30",
        !notification.read && "bg-card/60"
      )}
    >
      {/* Icon */}
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", meta.bg)}>
        <Icon size={20} strokeWidth={1.8} className={meta.color} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-[12px] font-semibold uppercase tracking-wide", meta.color)}>
            {alertLabel(notification.type)}
          </span>
          <span className="text-[12px] text-muted-foreground/40">{notification.time}</span>
          {!notification.read && (
            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          )}
        </div>
        <p className={cn(
          "mt-1 text-[15px] font-semibold leading-snug",
          !notification.read ? "text-foreground" : "text-foreground/80"
        )}>
          {notification.message}
        </p>
        <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground/70">
          {notification.detail}
        </p>
      </div>

      <ChevronRight size={16} className="mt-1 shrink-0 text-muted-foreground/30" />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function NotificationsPage() {
  const router = useRouter();

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;
  const todayNotifs = NOTIFICATIONS.filter((n) => n.time !== "Yesterday");
  const yesterdayNotifs = NOTIFICATIONS.filter((n) => n.time === "Yesterday");

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-[14px] text-muted-foreground/60">
              {unreadCount} unread alert{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          <Settings size={20} strokeWidth={1.8} />
        </button>
      </header>

      {/* Content */}
      <main className="no-scrollbar flex-1 overflow-y-auto pb-8">
        {/* Today */}
        <div className="px-4 pt-3 pb-1.5">
          <div className="flex items-center gap-2">
            <Clock size={14} strokeWidth={2} className="text-muted-foreground/50" />
            <span className="text-[14px] font-semibold text-muted-foreground/60 uppercase tracking-wide">
              Today
            </span>
          </div>
        </div>
        <div className="divide-y divide-border/20">
          {todayNotifs.map((n, i) => (
            <NotificationCard key={n.id} notification={n} index={i} />
          ))}
        </div>

        {/* Yesterday */}
        {yesterdayNotifs.length > 0 && (
          <>
            <div className="px-4 pt-5 pb-1.5">
              <div className="flex items-center gap-2">
                <Clock size={14} strokeWidth={2} className="text-muted-foreground/50" />
                <span className="text-[14px] font-semibold text-muted-foreground/60 uppercase tracking-wide">
                  Yesterday
                </span>
              </div>
            </div>
            <div className="divide-y divide-border/20">
              {yesterdayNotifs.map((n, i) => (
                <NotificationCard key={n.id} notification={n} index={todayNotifs.length + i} />
              ))}
            </div>
          </>
        )}

        {/* Empty state hint */}
        <div className="mt-8 flex flex-col items-center gap-2 px-8 text-center">
          <p className="text-[14px] text-muted-foreground/40 leading-relaxed">
            Set price alerts from any stock page to get notified when your targets are hit.
          </p>
        </div>
      </main>

      <HomeIndicator />
    </div>
  );
}
