"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  Bell,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type NotifIcon = "movers" | "price" | "stoploss" | "target" | "earnings";

interface StockBullet {
  symbol: string;
  name: string;
  logo: string;
  logoColor: string;
  change?: number;       // e.g. +5.2 or -5.8 — shows colored badge
  label?: string;        // e.g. "crossed 195.00" — shows as plain text when no change
}

interface Notification {
  id: string;
  icon: NotifIcon;
  title: string;
  bullets?: StockBullet[];
  time: string;
  read: boolean;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    icon: "movers",
    title: "3 watchlist stocks moved 5%+",
    bullets: [
      { symbol: "NVDA", name: "NVIDIA", logo: "NV", logoColor: "bg-emerald-700", change: 5.2 },
      { symbol: "META", name: "Meta Platforms", logo: "ME", logoColor: "bg-blue-600", change: -5.8 },
      { symbol: "GOOGL", name: "Alphabet", logo: "GO", logoColor: "bg-red-600", change: -5.1 },
    ],
    time: "2m",
    read: false,
  },
  {
    id: "n2",
    icon: "price",
    title: "2 price alerts triggered",
    bullets: [
      { symbol: "AAPL", name: "Apple", logo: "AA", logoColor: "bg-neutral-600", label: "crossed 195.00" },
      { symbol: "AMZN", name: "Amazon", logo: "AM", logoColor: "bg-amber-700", label: "below 178.00" },
    ],
    time: "18m",
    read: false,
  },
  {
    id: "n3",
    icon: "stoploss",
    title: "2 stop-losses hit",
    bullets: [
      { symbol: "TSLA", name: "Tesla", logo: "TS", logoColor: "bg-red-700", label: "stop at 165.00" },
      { symbol: "NFLX", name: "Netflix", logo: "NF", logoColor: "bg-rose-700", label: "stop at 600.00" },
    ],
    time: "45m",
    read: false,
  },
  {
    id: "n4",
    icon: "target",
    title: "MSFT reached target at 430.00",
    time: "2h",
    read: true,
  },
  {
    id: "n5",
    icon: "earnings",
    title: "AMD surged +7.3% on earnings beat",
    time: "4h",
    read: true,
  },
  {
    id: "n6",
    icon: "price",
    title: "JPM crossed above 200.00 — new ATH",
    time: "Yesterday",
    read: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Icon helper                                                        */
/* ------------------------------------------------------------------ */

function NotifIconEl({ type, read }: { type: NotifIcon; read: boolean }) {
  const base = cn(
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
    read ? "bg-muted/30" : "bg-foreground/[0.07]"
  );
  const iconClass = read ? "text-muted-foreground/40" : "text-foreground/50";
  const size = 17;
  const sw = 1.8;

  switch (type) {
    case "movers":
      return <div className={base}><TrendingUp size={size} strokeWidth={sw} className={iconClass} /></div>;
    case "price":
      return <div className={base}><Bell size={size} strokeWidth={sw} className={iconClass} /></div>;
    case "stoploss":
      return <div className={base}><AlertTriangle size={size} strokeWidth={sw} className={iconClass} /></div>;
    case "target":
      return <div className={base}><Target size={size} strokeWidth={sw} className={iconClass} /></div>;
    case "earnings":
      return <div className={base}><Zap size={size} strokeWidth={sw} className={iconClass} /></div>;
  }
}

/* ------------------------------------------------------------------ */
/*  Stock badge (borrowed from watchlist AI summary)                    */
/* ------------------------------------------------------------------ */

function StockBulletRow({ bullet, read }: { bullet: StockBullet; read: boolean }) {
  const router = useRouter();
  const gain = bullet.change !== undefined ? bullet.change >= 0 : null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/stocks/${bullet.symbol}`);
      }}
      className="flex items-center gap-2 cursor-pointer active:opacity-70"
    >
      <span className={cn(
        "text-[14px] font-medium",
        read ? "text-foreground/50" : "text-foreground/70"
      )}>
        {bullet.name}
      </span>

      {bullet.change !== undefined && (
        <span className={cn(
          "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
          gain ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
        )}>
          <span className="text-[10px]">{gain ? "↗" : "↘"}</span>
          {Math.abs(bullet.change).toFixed(1)}%
        </span>
      )}
      {bullet.label && (
        <span className="text-[13px] text-muted-foreground/50">{bullet.label}</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Notification Row                                                   */
/* ------------------------------------------------------------------ */

function NotificationRow({ notif, index }: { notif: Notification; index: number }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={() => {
        const symbol = notif.bullets?.[0]?.symbol;
        if (symbol) router.push(`/stocks/${symbol}`);
      }}
      className={cn(
        "flex gap-3 px-5 py-5 cursor-pointer active:bg-muted/20 transition-colors",
        !notif.read && "bg-foreground/[0.02]"
      )}
    >
      {/* Icon — vertically centered with first line of title */}
      <div className="flex h-[22px] items-center pt-px">
        <NotifIconEl type={notif.icon} read={notif.read} />
      </div>

      <div className="min-w-0 flex-1">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <p className={cn(
            "flex-1 text-[15px] leading-[22px]",
            !notif.read ? "font-semibold text-foreground" : "font-medium text-foreground/55"
          )}>
            {notif.title}
          </p>
          <span className="shrink-0 text-[12px] text-muted-foreground/35 tabular-nums">
            {notif.time}
          </span>
          {!notif.read && (
            <div className="h-2 w-2 shrink-0 rounded-full bg-foreground/50" />
          )}
        </div>

        {/* Stock bullet rows */}
        {notif.bullets && notif.bullets.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {notif.bullets.map((b) => (
              <StockBulletRow key={b.symbol} bullet={b} read={notif.read} />
            ))}
          </div>
        )}
      </div>
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
      <header className="flex items-center gap-3 px-5 py-3 border-b border-border/20">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </Button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold text-foreground">Notifications</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground"
        >
          <Settings size={19} strokeWidth={1.8} />
        </Button>
      </header>

      {/* Content */}
      <main className="no-scrollbar flex-1 overflow-y-auto pb-8">
        {/* Today */}
        {todayNotifs.length > 0 && (
          <>
            <div className="px-5 pt-4 pb-1">
              <span className="text-[12px] font-semibold text-muted-foreground/40 uppercase tracking-wider">
                Today
              </span>
            </div>
            <div className="divide-y divide-border/15">
              {todayNotifs.map((n, i) => (
                <NotificationRow key={n.id} notif={n} index={i} />
              ))}
            </div>
          </>
        )}

        {/* Yesterday */}
        {yesterdayNotifs.length > 0 && (
          <>
            <div className="px-5 pt-5 pb-1">
              <span className="text-[12px] font-semibold text-muted-foreground/40 uppercase tracking-wider">
                Yesterday
              </span>
            </div>
            <div className="divide-y divide-border/15">
              {yesterdayNotifs.map((n, i) => (
                <NotificationRow key={n.id} notif={n} index={todayNotifs.length + i} />
              ))}
            </div>
          </>
        )}

        {/* Footer hint */}
        <div className="mt-8 flex flex-col items-center gap-1.5 px-8 text-center">
          <Bell size={15} className="text-muted-foreground/20" />
          <p className="text-[13px] text-muted-foreground/30 leading-relaxed">
            Set alerts from any stock page to get notified here.
          </p>
        </div>
      </main>

      <HomeIndicator />
    </div>
  );
}
