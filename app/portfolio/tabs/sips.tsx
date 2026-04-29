"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { X, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SipCard, type Sip as SharedSip } from "@/app/portfolio/components/shared-sip";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SipFilter = "All" | "Stocks" | "ETF" | "Global ETF" | "Collections";

interface Sip extends SharedSip {
  filter: Exclude<SipFilter, "All">;
  paused?: boolean;
}

export type { Sip };

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const ACTIVE_SIPS: Sip[] = [
  { id: 1,  name: "Alibaba Group Holding Limited", amount: 20,  frequency: "Weekly on Friday",        dueDate: new Date("2026-04-23"), filter: "Stocks"      },
  { id: 3,  name: "NVIDA Corporations",            amount: 50,  frequency: "Daily Monday to Friday",  dueDate: new Date("2026-04-24"), filter: "Stocks"      },
  { id: 6,  name: "Stable Compounders",             amount: 50,  frequency: "Daily Monday to Friday",  badge: "Collection", dueDate: new Date("2026-04-24"), filter: "Collections" },
  { id: 7,  name: "Super Micro Computer, Inc.",     amount: 15,  frequency: "Monthly on 12th",         dueDate: new Date("2026-04-27"), filter: "Stocks"      },
  { id: 8,  name: "Tesla, Inc.",                    amount: 50,  frequency: "Fortnightly on Friday",   dueDate: new Date("2026-04-30"), filter: "Stocks"      },
  { id: 10, name: "Alphabet Inc.",                  amount: 50,  frequency: "Fortnightly on Friday",   dueDate: new Date("2026-04-30"), filter: "Stocks"      },
  { id: 4,  name: "iShares MSCI ACWI ETF",         amount: 60,  frequency: "Weekly on Friday",        badge: "G.ETF",      dueDate: new Date("2026-05-01"), filter: "Global ETF"  },
  { id: 9,  name: "Apple Inc.",                     amount: 100, frequency: "Daily Monday to Friday",  dueDate: new Date("2026-05-05"), filter: "Stocks"      },
  { id: 2,  name: "Invesco QQQ Trust Series 1",    amount: 80,  frequency: "Monthly on 12th",         badge: "ETF",        dueDate: new Date("2026-05-12"), filter: "ETF"         },
  { id: 5,  name: "JP Morgan Chase & Co.",          amount: 80,  frequency: "Monthly on 12th",         dueDate: new Date("2026-05-12"), filter: "Stocks"      },
].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()) as Sip[];

const PAUSED_SIPS: Sip[] = [
  { id: 11, name: "Amazon.com, Inc.",  amount: 80, frequency: "Fortnightly on Friday", dueDate: new Date("2026-04-30"), filter: "Stocks", paused: true },
  { id: 12, name: "Walmart Inc.",      amount: 40, frequency: "Fortnightly on Friday", dueDate: new Date("2026-05-07"), filter: "Stocks", paused: true },
  { id: 13, name: "Freshworks Inc.",   amount: 50, frequency: "Monthly on 12th",       dueDate: new Date("2026-05-12"), filter: "Stocks", paused: true },
];

export const ALL_SIPS: Sip[] = [...ACTIVE_SIPS, ...PAUSED_SIPS];

const FILTERS: SipFilter[] = ["All", "Stocks", "ETF", "Global ETF", "Collections"];

const SUMMARY = {
  monthlyPlanned: 4182,
  remaining:      1557,
  upcomingDate:   "20th May",
};

/* ------------------------------------------------------------------ */
/*  Paused SIP card (Resume + Cancel — different from active actions) */
/* ------------------------------------------------------------------ */

function PausedSipCard({ sip }: { sip: Sip }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/sip-detail/${sip.id}`)}
      className="w-full text-left px-5 py-4 active:opacity-70 transition-opacity"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <p className="text-[16px] font-bold text-foreground leading-tight">{sip.name}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-foreground">${sip.amount}</span>
            <span className="text-muted-foreground/40 text-[14px]">|</span>
            <span className="text-[14px] text-muted-foreground">{sip.frequency}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main tab                                                           */
/* ------------------------------------------------------------------ */

type InstrumentCategory = "Stocks" | "ETF" | "Collections";

const PICKER_INSTRUMENTS: Record<InstrumentCategory, { ticker: string; name: string; price: string; change: string; up: boolean }[]> = {
  Stocks: [
    { ticker: "AAPL",  name: "Apple Inc.",               price: "$198.50", change: "+2.9%",  up: true  },
    { ticker: "TSLA",  name: "Tesla, Inc.",               price: "$248.30", change: "-1.4%",  up: false },
    { ticker: "NVDA",  name: "NVIDIA Corporation",        price: "$924.80", change: "+3.2%",  up: true  },
    { ticker: "MSFT",  name: "Microsoft Corporation",     price: "$425.30", change: "+2.2%",  up: true  },
    { ticker: "GOOGL", name: "Alphabet Inc.",              price: "$176.80", change: "+1.7%",  up: true  },
    { ticker: "META",  name: "Meta Platforms, Inc.",       price: "$502.40", change: "+1.5%",  up: true  },
    { ticker: "AMZN",  name: "Amazon.com, Inc.",           price: "$178.40", change: "+0.9%",  up: true  },
    { ticker: "NFLX",  name: "Netflix, Inc.",              price: "$580.00", change: "-0.6%",  up: false },
  ],
  ETF: [
    { ticker: "SPY",  name: "SPDR S&P 500 ETF Trust",    price: "$510.20", change: "+1.1%",  up: true  },
    { ticker: "QQQ",  name: "Invesco QQQ Trust",          price: "$390.60", change: "+1.8%",  up: true  },
    { ticker: "VTI",  name: "Vanguard Total Stock Mkt",   price: "$240.10", change: "+0.9%",  up: true  },
    { ticker: "VOO",  name: "Vanguard S&P 500 ETF",       price: "$244.80", change: "+1.0%",  up: true  },
    { ticker: "GLD",  name: "SPDR Gold Shares",           price: "$318.50", change: "+0.4%",  up: true  },
    { ticker: "ACWI", name: "iShares MSCI ACWI ETF",      price: "$102.30", change: "+0.7%",  up: true  },
    { ticker: "IWM",  name: "iShares Russell 2000 ETF",   price: "$198.40", change: "-0.3%",  up: false },
    { ticker: "TLT",  name: "iShares 20+ Year Treasury",  price: "$92.60",  change: "+0.2%",  up: true  },
  ],
  Collections: [
    { ticker: "TECH",  name: "Tech Giants",               price: "12 stocks", change: "3 ETFs",  up: true },
    { ticker: "STBL",  name: "Stable Compounders",         price: "8 stocks",  change: "2 ETFs",  up: true },
    { ticker: "GRWTH", name: "Global Growth",              price: "15 stocks", change: "4 ETFs",  up: true },
    { ticker: "DIVD",  name: "Dividend Kings",             price: "10 stocks", change: "1 ETF",   up: true },
    { ticker: "CNSM",  name: "Consumer Brands",            price: "9 stocks",  change: "2 ETFs",  up: true },
    { ticker: "HLTH",  name: "Healthcare Leaders",         price: "11 stocks", change: "3 ETFs",  up: true },
    { ticker: "CLMT",  name: "Climate & Clean Energy",     price: "13 stocks", change: "5 ETFs",  up: true },
    { ticker: "FINC",  name: "Financial Services",         price: "10 stocks", change: "2 ETFs",  up: true },
  ],
};

export function SipsTab({ empty }: { empty?: boolean }) {
  const [filter, setFilter] = useState<SipFilter>("All");
  const amounts = ["$25", "$50", "$100", "$250"];
  const freqs = ["Daily", "Weekly", "Monthly"];
  const [selectedAmt, setSelectedAmt] = useState(amounts[1]);
  const [selectedFreq, setSelectedFreq] = useState(freqs[1]);
  const [instrumentSheetOpen, setInstrumentSheetOpen] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<InstrumentCategory>("Stocks");

  if (empty) {
    const amtVal = parseInt(selectedAmt.replace("$", ""));
    const multiplier = selectedFreq === "Daily" ? 252 : selectedFreq === "Weekly" ? 52 : 12;
    const projected1y = Math.round(amtVal * multiplier * 1.10);
    const projected3y = Math.round(amtVal * multiplier * 3 * 1.28);
    const bars = [
      { label: "Now", val: 0 },
      { label: "6M", val: Math.round(amtVal * multiplier * 0.5 * 1.05) },
      { label: "1Y", val: projected1y },
      { label: "2Y", val: Math.round(amtVal * multiplier * 2 * 1.18) },
      { label: "3Y", val: projected3y },
    ];
    const maxVal = bars[bars.length - 1].val || 1;
    return (
      <>
      <div className="pb-24">
        {/* Header */}
        <div className="px-5 pt-5 pb-2">
          {/* Empty state — compounding growth bars */}
          <div className="rounded-2xl bg-amber-50/60 border border-amber-100 px-4 pt-4 pb-4 mb-5">
            <div className="flex items-center gap-1.5 mb-4">
              <RefreshCw size={12} className="text-amber-500" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">No SIPs running</p>
            </div>
            {/* Compounding bars */}
            <div className="flex items-end gap-2 h-14 mb-2">
              {[
                { h: 12, label: "Now" },
                { h: 32, label: "6M" },
                { h: 52, label: "1Y" },
                { h: 72, label: "2Y" },
                { h: 100, label: "3Y" },
              ].map(({ h, label }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-amber-300/40"
                    style={{ height: `${(h / 100) * 56}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {["Now", "6M", "1Y", "2Y", "3Y"].map((l) => (
                <p key={l} className="flex-1 text-center text-[10px] text-amber-500/70 font-semibold">{l}</p>
              ))}
            </div>
            <p className="text-[12px] text-muted-foreground mt-3 leading-snug">Set up a SIP to start compounding your wealth automatically.</p>
          </div>

          <div className="h-[45px]" />
          <p className="text-[22px] font-bold text-foreground mb-1">Set up a SIP</p>
          <p className="text-[14px] text-muted-foreground">Invest a fixed amount automatically and watch it compound.</p>
        </div>

        {/* Mini SIP configurator */}
        <div className="mx-5 mt-4 mb-4 rounded-3xl border border-border/40 bg-background px-5 py-5">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Amount per {selectedFreq.toLowerCase().replace("ly", "").replace("month", "month")}</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {amounts.map((a) => (
              <button
                key={a}
                onClick={() => setSelectedAmt(a)}
                className={cn(
                  "py-3 rounded-xl text-[14px] font-bold transition-colors",
                  selectedAmt === a ? "bg-foreground text-background" : "border border-border/50 text-foreground"
                )}
              >
                {a}
              </button>
            ))}
          </div>
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Frequency</p>
          <div className="flex gap-2 mb-5">
            {freqs.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFreq(f)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors",
                  selectedFreq === f ? "bg-foreground text-background" : "border border-border/50 text-muted-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Growth bars */}
          <div className="flex items-end gap-2 h-20 mb-2">
            {bars.map((b, i) => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn("w-full rounded-t-lg transition-all duration-300", i === 0 ? "bg-muted/40" : i === bars.length - 1 ? "bg-foreground" : "bg-foreground/30")}
                  style={{ height: i === 0 ? "4px" : `${Math.max(8, (b.val / maxVal) * 72)}px` }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {bars.map((b) => (
              <div key={b.label} className="flex-1 text-center">
                <p className="text-[10px] text-muted-foreground">{b.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/40 flex justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">1-year projection</p>
              <p className="text-[16px] font-bold text-foreground tabular-nums">${projected1y.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground mb-0.5">3-year projection</p>
              <p className="text-[16px] font-bold text-foreground tabular-nums">${projected3y.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-2">Projections assume ~10% annual return. Not a guarantee.</p>
        </div>

        <div className="px-5">
          <button
            onClick={() => setInstrumentSheetOpen(true)}
            className="w-full rounded-2xl bg-foreground py-4 text-[15px] font-bold text-background active:opacity-75 transition-opacity"
          >
            Create a SIP
          </button>
        </div>
      </div>

      {/* Instrument picker bottom sheet */}
      <AnimatePresence>
        {instrumentSheetOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setInstrumentSheetOpen(false)}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] z-50 rounded-t-3xl bg-background pt-5"
              style={{ maxHeight: "80vh", display: "flex", flexDirection: "column" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 mb-1">
                <p className="text-[18px] font-bold text-foreground">Pick your favourite instrument</p>
                <button onClick={() => setInstrumentSheetOpen(false)} className="rounded-full p-1.5 -mr-1 active:bg-muted/60 transition-colors">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
              <p className="text-[13px] text-muted-foreground px-5 mb-4">
                {selectedFreq} · {selectedAmt} per {selectedFreq === "Daily" ? "day" : selectedFreq === "Weekly" ? "week" : "month"}
              </p>

              {/* Category tabs */}
              <div className="px-5 mb-3">
                <div className="flex rounded-2xl bg-[#EEEEF3] p-1 gap-1">
                  {(["Stocks", "ETF", "Collections"] as InstrumentCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setPickerCategory(cat)}
                      className={cn(
                        "flex-1 rounded-xl py-2 text-[13px] font-semibold transition-colors",
                        pickerCategory === cat ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instrument list */}
              <div className="overflow-y-auto flex-1 pb-10">
                <div className="divide-y divide-border/40 border-t border-border/40">
                  {PICKER_INSTRUMENTS[pickerCategory].map((inst) => (
                    <button
                      key={inst.ticker}
                      onClick={() => setInstrumentSheetOpen(false)}
                      className="w-full flex items-center gap-3 px-5 py-4 active:bg-muted/30 transition-colors text-left"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-bold text-foreground">{inst.ticker.slice(0, 2)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-foreground leading-tight truncate">{inst.name}</p>
                        <p className="text-[12px] text-muted-foreground">{inst.ticker}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-semibold text-foreground">{inst.price}</p>
                        <p className={cn("text-[14px] font-semibold", pickerCategory === "Collections" ? "text-foreground" : inst.up ? "text-gain" : "text-loss")}>{inst.change}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </>
    );
  }

  const filteredActive = filter === "All"
    ? ACTIVE_SIPS
    : ACTIVE_SIPS.filter((s) => s.filter === filter);

  const filteredPaused = filter === "All"
    ? PAUSED_SIPS
    : PAUSED_SIPS.filter((s) => s.filter === filter);

  return (
    <div className="pb-24">

      {/* ── Filter chips ── */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap shrink-0 transition-colors",
                filter === f
                  ? "bg-foreground text-background"
                  : "border border-border/50 text-muted-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary card ── */}
      <div className="mx-5 mb-4 rounded-2xl border border-border/50 bg-white px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] text-muted-foreground mb-0.5">Monthly Planned</p>
            <p className="text-[20px] font-bold text-foreground">${SUMMARY.monthlyPlanned.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[12px] text-muted-foreground mb-0.5">Remaining</p>
            <p className="text-[20px] font-bold text-foreground">${SUMMARY.remaining.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-muted-foreground mb-0.5">Upcoming on</p>
            <p className="text-[20px] font-bold text-foreground">{SUMMARY.upcomingDate}</p>
          </div>
        </div>
      </div>

      {/* ── Active SIPs ── */}
      {filteredActive.length > 0 && (
        <div className="px-5 mb-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[16px] text-foreground">Active SIP ({filteredActive.length})</p>
            <p className="text-[13px] font-normal text-muted-foreground">Due Date</p>
          </div>
        </div>
      )}
      {filteredActive.length > 0 && (
        <div className="divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40 mb-6">
          {filteredActive.map((s) => <SipCard key={s.id} sip={s} />)}
        </div>
      )}

      {/* ── Paused SIPs ── */}
      {filteredPaused.length > 0 && (
        <div className="px-5 mb-2">
          <p className="text-[16px] text-foreground">Paused SIP</p>
        </div>
      )}
      {filteredPaused.length > 0 && (
        <div className="divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40">
          {filteredPaused.map((s) => <PausedSipCard key={s.id} sip={s} />)}
        </div>
      )}

    </div>
  );
}
