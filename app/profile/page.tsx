"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, ChevronRight, Wallet, UserCircle, Headphones,
  FileText, Gift, Landmark, GraduationCap, MessageSquare,
  ArrowLeftRight, BellRing, Twitter, Instagram, Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { cn } from "@/lib/utils";

// ── Menu section helper ───────────────────────────────────────────────

function MenuSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/50 overflow-hidden">
      {children}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  right,
  onClick,
}: {
  icon: typeof Wallet;
  label: string;
  right?: React.ReactNode;
  last?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors active:bg-muted/50"
    >
      <Icon size={20} strokeWidth={1.6} className="shrink-0 text-muted-foreground" />
      <span className="flex-1 text-[15px] font-medium text-foreground">{label}</span>
      {right ?? <ChevronRight size={16} className="text-muted-foreground/40" />}
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <div className="shrink-0">
        <StatusBar />
        <header className="flex items-center px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </Button>
        </header>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        {/* Profile card */}
        <div className="flex flex-col items-center gap-1.5 px-6 pt-2 pb-6">
          <div className="h-20 w-20 overflow-hidden rounded-full">
            <Image
              src="/profile_dp.png"
              alt="Profile"
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="mt-2 text-[20px] font-bold text-foreground">Shreeyash Salunke</h2>
          <p className="text-[14px] text-muted-foreground">shreeyash.salunke@aspora.com</p>
        </div>

        {/* Buying Power */}
        <div className="px-4 pb-4">
          <button className="flex w-full items-center gap-3.5 rounded-2xl border border-border/50 px-4 py-3.5 text-left transition-colors active:bg-muted/30">
            <Wallet size={20} strokeWidth={1.6} className="shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-[13px] text-muted-foreground">Buying Power</p>
              <p className="text-[18px] font-semibold tabular-nums text-foreground">12,485.50</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/40" />
          </button>
        </div>

        {/* Trader Mode Toggle */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3.5 rounded-2xl border border-border/50 px-4 py-3.5">
            <ArrowLeftRight size={20} strokeWidth={1.6} className="shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-[15px] font-medium text-foreground">Trader Mode</p>
              <p className="text-[12px] text-muted-foreground/60">Switch to advanced trading view</p>
            </div>
            <Switch />
          </div>
        </div>

        {/* Account & Support */}
        <div className="px-4 pb-3">
          <MenuSection>
            <MenuItem icon={UserCircle} label="Account Details" />
            <MenuItem icon={BellRing} label="Notification Settings" />
            <MenuItem icon={Headphones} label="Customer Support 24/7" />
            <MenuItem icon={FileText} label="Reports" />
            <MenuItem icon={Landmark} label="Bank Accounts" last />
          </MenuSection>
        </div>

        {/* Extras */}
        <div className="px-4 pb-3">
          <MenuSection>
            <MenuItem icon={Gift} label="Refer & Invite" />
            <MenuItem icon={GraduationCap} label="Level Up" />
            <MenuItem icon={MessageSquare} label="Give Us Feedback" last />
          </MenuSection>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-6 py-5">
          <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors active:bg-muted">
            <Twitter size={18} strokeWidth={1.6} />
          </a>
          <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors active:bg-muted">
            <Instagram size={18} strokeWidth={1.6} />
          </a>
          <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors active:bg-muted">
            <Youtube size={18} strokeWidth={1.6} />
          </a>
        </div>

        {/* Version */}
        <div className="py-6 text-center">
          <p className="text-[12px] text-muted-foreground/30">Aspora Wealth v1.0.0</p>
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
