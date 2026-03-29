"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";

const versions = [
  {
    title: "V1 — Glass Premium",
    description: "Card-based, glassmorphism, gradient mesh background",
    href: "/order-flow/v1",
  },
  {
    title: "V2 — Minimal Flat",
    description: "No cards, divider-based, generous whitespace",
    href: "/order-flow/v2",
  },
  {
    title: "V3 — Clean Card",
    description: "Custom keyboard, stop-loss, market depth, charges breakdown",
    href: "/order-flow/v3",
  },
];

export default function OrderFlowIndex() {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <StatusBar />

      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">Order Flow</h1>
          <p className="text-[13px] text-muted-foreground">Stock order placement — design explorations</p>
        </div>
      </div>

      <div className="flex-1 px-5 pt-2 space-y-3">
        {versions.map((v, i) => (
          <motion.div
            key={v.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link
              href={v.href}
              className="group flex items-center justify-between rounded-xl border border-border/60 bg-card px-5 py-3.5 transition-colors hover:border-border hover:bg-card/80 active:scale-[0.98]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground">{v.title}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug">{v.description}</p>
              </div>
              <ChevronRight
                size={16}
                className="text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 ml-3 shrink-0"
              />
            </Link>
          </motion.div>
        ))}
      </div>

      <HomeIndicator />
    </div>
  );
}
