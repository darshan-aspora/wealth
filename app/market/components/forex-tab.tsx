"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketTable, ChangeCell, type TableColumn } from "./market-table";
import { SectionHeader } from "./section-header";

// ---- Types ----
interface ForexRow {
  pair: string;
  fullName: string;
  last: string;
  change: string;
  changePct: string;
  dayRange: string;
  spread: string;
  isUp: boolean;
  category: string;
}

interface CentralBankRow {
  bank: string;
  currency: string;
  rate: string;
  lastChange: string;
  nextMeeting: string;
}

// ---- Filter pills ----
const FILTERS = ["Most Popular", "Major", "Minor", "Exotic"] as const;
type ForexFilter = (typeof FILTERS)[number];

// ---- Mock data: Currency Pairs ----
const FOREX_DATA: ForexRow[] = [
  // Major
  { pair: "EUR/USD", fullName: "Euro / US Dollar", last: "1.0842", change: "+0.0023", changePct: "+0.21%", dayRange: "1.0812 — 1.0868", spread: "0.6", isUp: true, category: "Major" },
  { pair: "GBP/USD", fullName: "British Pound / US Dollar", last: "1.2714", change: "+0.0041", changePct: "+0.32%", dayRange: "1.2668 — 1.2739", spread: "0.9", isUp: true, category: "Major" },
  { pair: "USD/JPY", fullName: "US Dollar / Japanese Yen", last: "149.82", change: "-0.34", changePct: "-0.23%", dayRange: "149.41 — 150.24", spread: "0.8", isUp: false, category: "Major" },
  { pair: "USD/CHF", fullName: "US Dollar / Swiss Franc", last: "0.8821", change: "-0.0018", changePct: "-0.20%", dayRange: "0.8798 — 0.8856", spread: "1.2", isUp: false, category: "Major" },
  { pair: "AUD/USD", fullName: "Australian Dollar / US Dollar", last: "0.6542", change: "+0.0015", changePct: "+0.23%", dayRange: "0.6518 — 0.6561", spread: "0.8", isUp: true, category: "Major" },
  { pair: "USD/CAD", fullName: "US Dollar / Canadian Dollar", last: "1.3612", change: "+0.0028", changePct: "+0.21%", dayRange: "1.3574 — 1.3648", spread: "1.0", isUp: true, category: "Major" },
  // Minor
  { pair: "EUR/GBP", fullName: "Euro / British Pound", last: "0.8527", change: "-0.0012", changePct: "-0.14%", dayRange: "0.8511 — 0.8548", spread: "1.1", isUp: false, category: "Minor" },
  { pair: "EUR/JPY", fullName: "Euro / Japanese Yen", last: "162.41", change: "+0.18", changePct: "+0.11%", dayRange: "161.92 — 162.78", spread: "1.4", isUp: true, category: "Minor" },
  { pair: "GBP/JPY", fullName: "British Pound / Japanese Yen", last: "190.42", change: "+0.52", changePct: "+0.27%", dayRange: "189.64 — 190.88", spread: "1.8", isUp: true, category: "Minor" },
  { pair: "AUD/NZD", fullName: "Australian Dollar / NZ Dollar", last: "1.0824", change: "-0.0008", changePct: "-0.07%", dayRange: "1.0801 — 1.0852", spread: "2.1", isUp: false, category: "Minor" },
  { pair: "EUR/AUD", fullName: "Euro / Australian Dollar", last: "1.6573", change: "+0.0034", changePct: "+0.21%", dayRange: "1.6521 — 1.6612", spread: "1.6", isUp: true, category: "Minor" },
  // Exotic
  { pair: "USD/TRY", fullName: "US Dollar / Turkish Lira", last: "32.418", change: "+0.082", changePct: "+0.25%", dayRange: "32.312 — 32.481", spread: "12.0", isUp: true, category: "Exotic" },
  { pair: "USD/ZAR", fullName: "US Dollar / South African Rand", last: "18.724", change: "-0.048", changePct: "-0.26%", dayRange: "18.642 — 18.812", spread: "8.5", isUp: false, category: "Exotic" },
  { pair: "USD/INR", fullName: "US Dollar / Indian Rupee", last: "83.142", change: "+0.024", changePct: "+0.03%", dayRange: "83.084 — 83.198", spread: "3.2", isUp: true, category: "Exotic" },
];

// ---- Mock data: Central Bank Rates ----
const CENTRAL_BANK_DATA: CentralBankRow[] = [
  { bank: "Fed", currency: "USD", rate: "5.50%", lastChange: "+25 bps (Jul 2023)", nextMeeting: "Mar 19, 2026" },
  { bank: "ECB", currency: "EUR", rate: "4.50%", lastChange: "+25 bps (Sep 2023)", nextMeeting: "Apr 11, 2026" },
  { bank: "BoE", currency: "GBP", rate: "5.25%", lastChange: "+25 bps (Aug 2023)", nextMeeting: "Mar 20, 2026" },
  { bank: "BoJ", currency: "JPY", rate: "0.10%", lastChange: "+10 bps (Mar 2024)", nextMeeting: "Apr 25, 2026" },
  { bank: "RBA", currency: "AUD", rate: "4.35%", lastChange: "+25 bps (Nov 2023)", nextMeeting: "Apr 01, 2026" },
  { bank: "BoC", currency: "CAD", rate: "5.00%", lastChange: "+25 bps (Jul 2023)", nextMeeting: "Apr 16, 2026" },
];

// ---- Table columns: Currency Pairs ----
const forexColumns: TableColumn<ForexRow>[] = [
  {
    key: "pair", label: "Pair", align: "left", frozen: true, minWidth: 150,
    render: (r) => (
      <div>
        <div className="text-[14px] font-semibold text-foreground">{r.pair}</div>
        <div className="text-[12px] text-muted-foreground">{r.fullName}</div>
      </div>
    ),
  },
  {
    key: "last", label: "Last Price", align: "right",
    render: (r) => <span className="font-mono tabular-nums font-semibold text-foreground">{r.last}</span>,
  },
  {
    key: "change", label: "Change", align: "right",
    render: (r) => <ChangeCell value={r.change} isUp={r.isUp} />,
  },
  {
    key: "changePct", label: "Change %", align: "right",
    render: (r) => <ChangeCell value={r.changePct} isUp={r.isUp} />,
  },
  {
    key: "dayRange", label: "Day Range", align: "right",
    render: (r) => <span className="text-[12px] font-mono tabular-nums text-muted-foreground">{r.dayRange}</span>,
  },
  {
    key: "spread", label: "Spread", align: "right",
    render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.spread}</span>,
  },
];

// ---- Table columns: Central Bank Rates ----
const centralBankColumns: TableColumn<CentralBankRow>[] = [
  {
    key: "bank", label: "Bank", align: "left", frozen: true, minWidth: 100,
    render: (r) => <span className="text-[14px] font-semibold text-foreground">{r.bank}</span>,
  },
  {
    key: "currency", label: "Currency", align: "right",
    render: (r) => <span className="font-mono tabular-nums text-muted-foreground">{r.currency}</span>,
  },
  {
    key: "rate", label: "Current Rate", align: "right",
    render: (r) => <span className="font-mono tabular-nums font-semibold text-foreground">{r.rate}</span>,
  },
  {
    key: "lastChange", label: "Last Change", align: "right", minWidth: 160,
    render: (r) => <span className="text-[12px] text-muted-foreground">{r.lastChange}</span>,
  },
  {
    key: "nextMeeting", label: "Next Meeting", align: "right", minWidth: 120,
    render: (r) => <span className="text-[12px] text-muted-foreground">{r.nextMeeting}</span>,
  },
];

// ---- Component ----
export function ForexTab() {
  const [filter, setFilter] = useState<ForexFilter>("Most Popular");

  const filteredData =
    filter === "Most Popular"
      ? FOREX_DATA
      : FOREX_DATA.filter((r) => r.category === filter);

  return (
    <div className="pb-8">
      {/* Currency Pairs */}
      <div className="px-5 pt-5">
        <SectionHeader
          title="Currency Pairs"
          subtitle="Real-time forex rates across major, minor & exotic pairs"
        />
        <div className="mb-3 -mx-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5 py-0.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                  filter === f
                    ? "bg-foreground text-background"
                    : "border border-border/60 text-muted-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`forex-${filter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MarketTable columns={forexColumns} data={filteredData} />
          </motion.div>
        </AnimatePresence>
        <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          View All Pairs
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="h-6" />

      {/* Central Bank Rates */}
      <div className="px-5">
        <SectionHeader
          title="Central Bank Rates"
          subtitle="Policy rates from major central banks"
        />
        <MarketTable columns={centralBankColumns} data={CENTRAL_BANK_DATA} />
        <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted/40">
          View All Rates
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
