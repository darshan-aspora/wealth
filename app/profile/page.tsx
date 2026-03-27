"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

const menuItems = [
  "Account Settings",
  "Bank & Payments",
  "Documents",
  "Tax Centre",
  "Referrals",
  "Help & Support",
];

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background">
      <StatusBar />

      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </Button>
        <h1 className="text-[19px] font-bold text-foreground">Profile</h1>
      </header>

      {/* Profile card */}
      <div className="flex flex-col items-center gap-2 px-6 py-8">
        <div className="h-20 w-20 overflow-hidden rounded-full">
          <Image
            src="/profile_dp.png"
            alt="Profile"
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>
        <h2 className="mt-2 text-[20px] font-bold text-foreground">John Smith</h2>
        <p className="text-[15px] text-muted-foreground">john.smith@email.com</p>
      </div>

      {/* Menu items */}
      <div className="flex-1 px-4">
        <div className="rounded-2xl border border-border/50 overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={item}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors active:bg-muted/50"
              style={i < menuItems.length - 1 ? { borderBottom: "1px solid hsl(var(--border) / 0.3)" } : undefined}
            >
              <span className="text-[16px] font-medium text-foreground">{item}</span>
              <ChevronRight size={18} className="text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </div>

      <HomeIndicator />
    </div>
  );
}
