"use client";

import { useState } from "react";
import { ArrowUpDown, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Reusable table primitives (matching AllocationTable style)         */
/* ------------------------------------------------------------------ */

interface ColDef {
  label: string;
  align?: "left" | "right";
  minWidth?: number;
}

function OptionsTable({
  cols,
  rows,
}: {
  cols: ColDef[];
  rows: React.ReactNode[][];
}) {
  const [first, ...rest] = cols;
  return (
    <div className="overflow-x-auto no-scrollbar -mx-0">
      <table className="w-full text-sm border-collapse" style={{ minWidth: 460 }}>
        <thead>
          <tr className="text-muted-foreground text-[11px] uppercase tracking-wider">
            <th className="text-left py-2.5 pl-5 pr-2 font-medium sticky left-0 bg-card z-10 whitespace-nowrap">
              {first.label}
            </th>
            {rest.map((col, i) => (
              <th
                key={i}
                className={cn(
                  "py-2.5 px-2 font-medium whitespace-nowrap",
                  col.align === "left" ? "text-left" : "text-right",
                  i === rest.length - 1 && "pr-5"
                )}
                style={col.minWidth ? { minWidth: col.minWidth } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-border/30">
              <td className="py-3.5 pl-5 pr-2 sticky left-0 bg-card z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-[3px] h-8 rounded-full shrink-0 bg-neutral-800" />
                  {row[0]}
                </div>
              </td>
              {row.slice(1).map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "py-3.5 px-2 whitespace-nowrap",
                    (cols[ci + 1]?.align ?? "right") === "right" ? "text-right" : "text-left",
                    ci === row.length - 2 && "pr-5"
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared UI atoms                                                    */
/* ------------------------------------------------------------------ */

function PctBadge({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span className={cn("text-[13px] font-semibold tabular-nums", pos ? "text-gain" : "text-loss")}>
      {pos ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

function Cell({ top, bottom }: { top: string; bottom?: string }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-foreground leading-tight whitespace-nowrap">{top}</p>
      {bottom && <p className="text-[11px] text-muted-foreground leading-tight">{bottom}</p>}
    </div>
  );
}

function NumCell({ value }: { value: string }) {
  return <span className="text-[13px] tabular-nums text-foreground">{value}</span>;
}

function FlipperBtn() {
  return (
    <button className="flex items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-1.5 text-[13px] font-semibold text-foreground active:opacity-70 transition-opacity">
      Mega-Cap <ArrowUpDown size={12} strokeWidth={2} />
    </button>
  );
}

function WidgetCard({
  title,
  flipper,
  children,
}: {
  title: string;
  flipper?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-5 rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        <p className="text-[17px] font-bold text-foreground">{title}</p>
        {flipper && <FlipperBtn />}
      </div>
      {children}
    </div>
  );
}

function TabRow<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly T[];
  active: T;
  onChange: (t: T) => void;
}) {
  return (
    <div className="overflow-x-auto no-scrollbar px-5 pb-1 pt-3">
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold border transition-colors",
              active === t
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border/60"
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectorChips<T extends string>({
  chips,
  active,
  onChange,
}: {
  chips: readonly T[];
  active: T;
  onChange: (c: T) => void;
}) {
  return (
    <div className="overflow-x-auto no-scrollbar px-5 pb-1 pt-3">
      <div className="flex gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => onChange(chip)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold border transition-colors",
              active === chip
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border/60"
            )}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const FILTER_CHIPS = ["All", "Stocks", "Indices", "ETFs", "Global"] as const;
type FilterChip = (typeof FILTER_CHIPS)[number];

const TOP_CHAINS = [
  { symbol: "NVIDIA",    price: 924.80, change: 3.2 },
  { symbol: "Apple",     price: 188.50, change: 2.9 },
  { symbol: "Microsoft", price: 425.30, change: 1.2 },
  { symbol: "Alphabet",  price: 519.80, change: 1.7 },
  { symbol: "Meta",      price: 502.40, change: 13.0 },
];

const POPULAR_TABS = ["Daily Expiry", "Weekly", "Monthly", "Quarterly"] as const;
type PopularTab = (typeof POPULAR_TABS)[number];
type PopularRow = { index: string; option: string; underlying: string; oi: string };
const POPULAR_DATA: Record<PopularTab, PopularRow[]> = {
  "Daily Expiry": [
    { index: "NASDAQ 100", option: "Apr 20 18000 CALL", underlying: "17,995",    oi: "1.2M" },
    { index: "SPY",        option: "Apr 20 5200 PUT",   underlying: "5,195.25",  oi: "899K" },
    { index: "QQQ",        option: "Apr 20 40000 CALL", underlying: "39,990.30", oi: "750K" },
    { index: "IWM",        option: "Apr 20 2200 PUT",   underlying: "2190.50",   oi: "620K" },
    { index: "EXP",        option: "May 25 30 CALL",    underlying: "29.50",     oi: "290K" },
    { index: "OPT",        option: "May 15 25 PUT",     underlying: "24.15",     oi: "190K" },
    { index: "XLE",        option: "Jun 10 60 CALL",    underlying: "59.00",     oi: "250K" },
  ],
  Weekly: [
    { index: "SPY",        option: "Apr 26 5200 PUT",   underlying: "5,195.25",  oi: "1.1M" },
    { index: "QQQ",        option: "Apr 26 420 CALL",   underlying: "419.80",    oi: "890K" },
    { index: "NASDAQ 100", option: "Apr 26 18200 CALL", underlying: "18,190.10", oi: "760K" },
    { index: "IWM",        option: "Apr 26 200 PUT",    underlying: "199.40",    oi: "540K" },
    { index: "VIX",        option: "Apr 26 18 CALL",    underlying: "17.90",     oi: "420K" },
  ],
  Monthly: [
    { index: "SPY",        option: "May 17 5300 CALL",  underlying: "5,195.25",  oi: "2.1M" },
    { index: "QQQ",        option: "May 17 450 CALL",   underlying: "419.80",    oi: "1.8M" },
    { index: "NASDAQ 100", option: "May 17 19000 CALL", underlying: "18,190.10", oi: "1.4M" },
    { index: "IWM",        option: "May 17 210 CALL",   underlying: "199.40",    oi: "980K" },
    { index: "GLD",        option: "May 17 240 CALL",   underlying: "238.90",    oi: "720K" },
  ],
  Quarterly: [
    { index: "SPY",        option: "Jun 20 5500 CALL",  underlying: "5,195.25",  oi: "3.2M" },
    { index: "QQQ",        option: "Jun 20 480 CALL",   underlying: "419.80",    oi: "2.6M" },
    { index: "NASDAQ 100", option: "Jun 20 20000 CALL", underlying: "18,190.10", oi: "2.1M" },
    { index: "IWM",        option: "Jun 20 220 CALL",   underlying: "199.40",    oi: "1.5M" },
    { index: "XLF",        option: "Jun 20 45 CALL",    underlying: "44.20",     oi: "1.1M" },
  ],
};

type Under10Row = { index: string; strike: string; price: string; change: number };
const UNDER_10: Under10Row[] = [
  { index: "TSLA", strike: "Apr 19 200 CALL", price: "$6.80", change: 12.4 },
  { index: "AAPL", strike: "Apr 19 230 CALL", price: "$4.85", change: 17.4 },
  { index: "AMD",  strike: "Apr 18 180 CALL", price: "$3.20", change:  9.6 },
];

const SECTOR_CHIPS = ["FinTech", "Clean Energy", "Biotech", "EV", "Automobile"] as const;
type SectorChip = (typeof SECTOR_CHIPS)[number];
type SectorRow = { index: string; option: string; oi: string; vol: string };
const SECTORIAL: Record<SectorChip, SectorRow[]> = {
  FinTech: [
    { index: "Vanguard Energy",     option: "Apr 20 4700 CALL", oi: "15,894", vol: "1,429" },
    { index: "SPDR Materials",      option: "Apr 20 665 PUT",   oi: "670.33", vol: "8,648" },
    { index: "Invesco Technology",  option: "Apr 20 598 PUT",   oi: "503.20", vol: "8,648" },
    { index: "iShares Biotech",     option: "Apr 20 472 CALL",  oi: "250.05", vol: "7,264" },
    { index: "Global X Robotics",   option: "Apr 20 665 PUT",   oi: "498.50", vol: "3,501" },
    { index: "Vanguard Healthcare", option: "Apr 20 4700 CALL", oi: "524.15", vol: "2,209" },
    { index: "Energy Select",       option: "Jul 15 550 CALL",  oi: "549.00", vol: "2,809" },
  ],
  "Clean Energy": [
    { index: "iShares Clean Energy", option: "Apr 20 18 CALL",  oi: "42,300", vol: "8,120" },
    { index: "Invesco Solar",        option: "Apr 20 65 PUT",   oi: "28,440", vol: "5,340" },
    { index: "First Trust",          option: "May 15 38 CALL",  oi: "19,280", vol: "3,810" },
  ],
  Biotech: [
    { index: "iShares Biotech",  option: "Apr 20 130 CALL", oi: "38,200", vol: "7,620" },
    { index: "SPDR Biotech",     option: "Apr 20 90 PUT",   oi: "24,900", vol: "4,980" },
    { index: "Invesco Dynamic",  option: "May 15 42 CALL",  oi: "16,400", vol: "3,280" },
  ],
  EV: [
    { index: "Global X EV",          option: "Apr 20 28 CALL", oi: "52,400", vol: "9,820" },
    { index: "iShares Self-Driving", option: "Apr 20 34 PUT",  oi: "31,200", vol: "6,240" },
    { index: "Simplify Volt",        option: "May 15 18 CALL", oi: "18,600", vol: "3,720" },
  ],
  Automobile: [
    { index: "SPDR Auto",         option: "Apr 20 72 CALL", oi: "29,800", vol: "5,960" },
    { index: "iShares Transport", option: "Apr 20 56 PUT",  oi: "22,400", vol: "4,480" },
    { index: "First Trust Auto",  option: "May 15 44 CALL", oi: "14,200", vol: "2,840" },
  ],
};

const FOCUS_TABS = ["Top Gainer", "Top Loser", "High OI", "High Change in OI"] as const;
type FocusTab = (typeof FOCUS_TABS)[number];
type FocusRow = { ticker: string; contract: string; openInt: string };
const IN_FOCUS: Record<FocusTab, FocusRow[]> = {
  "Top Gainer": [
    { ticker: "Vanguard",      contract: "Apr 20 4700 CALL", openInt: "15,894" },
    { ticker: "SPDR",          contract: "Apr 20 665 PUT",   openInt: "668.33" },
    { ticker: "Invesco",       contract: "Apr 20 598 PUT",   openInt: "599.20" },
    { ticker: "IWM",           contract: "Apr 20 472 CALL",  openInt: "249.05" },
    { ticker: "Expedia",       contract: "Apr 20 665 PUT",   openInt: "497.50" },
    { ticker: "Vanguard",      contract: "Apr 20 4700 CALL", openInt: "523.15" },
    { ticker: "Energy Select", contract: "Jul 15 550 CALL",  openInt: "548.00" },
  ],
  "Top Loser": [
    { ticker: "ARKK",  contract: "Apr 20 40 PUT",  openInt: "182,400" },
    { ticker: "SQQQ",  contract: "Apr 20 12 CALL", openInt: "142,600" },
    { ticker: "SPXS",  contract: "Apr 20 8 CALL",  openInt: "98,400"  },
    { ticker: "UVXY",  contract: "Apr 20 14 CALL", openInt: "76,300"  },
    { ticker: "TZA",   contract: "Apr 20 9 PUT",   openInt: "54,200"  },
  ],
  "High OI": [
    { ticker: "SPY",  contract: "Apr 20 5200 PUT",  openInt: "4,820,100" },
    { ticker: "QQQ",  contract: "Apr 20 420 CALL",  openInt: "3,640,800" },
    { ticker: "TSLA", contract: "Apr 20 200 CALL",  openInt: "2,480,300" },
    { ticker: "AAPL", contract: "Apr 20 180 PUT",   openInt: "2,210,500" },
    { ticker: "NVDA", contract: "Apr 20 900 CALL",  openInt: "1,840,230" },
  ],
  "High Change in OI": [
    { ticker: "AMD",   contract: "Apr 20 170 CALL", openInt: "1,420,800" },
    { ticker: "MSFT",  contract: "Apr 20 420 CALL", openInt: "1,630,800" },
    { ticker: "GOOGL", contract: "Apr 20 175 PUT",  openInt: "980,600"   },
    { ticker: "AMZN",  contract: "Apr 20 185 CALL", openInt: "1,180,400" },
    { ticker: "NFLX",  contract: "Apr 20 640 CALL", openInt: "720,300"   },
  ],
};

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export function ExploreOptions() {
  const router = useRouter();
  const [filter, setFilter]       = useState<FilterChip>("All");
  const [popularTab, setPopularTab] = useState<PopularTab>("Daily Expiry");
  const [sector, setSector]       = useState<SectorChip>("FinTech");
  const [focusTab, setFocusTab]   = useState<FocusTab>("Top Gainer");

  return (
    <div className="space-y-5 pb-8">

      {/* ── Learn Options Banner ── */}
      <div className="mx-5 rounded-2xl bg-[#1C1C1E] overflow-hidden">
        <div className="flex justify-center pt-6 pb-2">
          <div className="flex gap-1 items-end opacity-25">
            {[28, 44, 36, 56, 40, 64, 48].map((h, i) => (
              <div key={i} className="w-5 rounded-t-sm bg-white" style={{ height: h }} />
            ))}
          </div>
        </div>
        <div className="px-5 pb-5">
          <p className="text-[18px] font-bold text-white text-center">Learn Options</p>
          <p className="text-[13px] text-white/50 text-center mt-1 mb-4">Simplest chapter designed for you</p>
          <div className="flex flex-col gap-2">
            <button className="w-full flex items-center justify-between rounded-xl bg-white/10 px-4 py-3.5 active:opacity-75 transition-opacity">
              <p className="text-[14px] font-semibold text-white">I&apos;m first time option trader</p>
              <span className="text-white/60 text-[18px] leading-none">→</span>
            </button>
            <button className="w-full flex items-center justify-between rounded-xl bg-white/10 px-4 py-3.5 active:opacity-75 transition-opacity">
              <p className="text-[14px] font-semibold text-white">I know options, teach me US options</p>
              <span className="text-white/60 text-[18px] leading-none">→</span>
            </button>
          </div>
          <p className="text-[12px] text-white/40 text-center mt-3">
            You will learn to <span className="text-white/60 font-semibold">place order in 3 mins</span>
          </p>
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="overflow-x-auto no-scrollbar px-5">
        <div className="flex gap-2">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setFilter(chip)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors",
                filter === chip ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              )}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Option Chains ── */}
      <WidgetCard title="Top Option Chains" flipper>
        <div className="pb-2">
          {TOP_CHAINS.map((item, i) => (
            <div
              key={item.symbol}
              className={cn(
                "flex items-center gap-3 px-5 py-3.5",
                i < TOP_CHAINS.length - 1 && "border-b border-border/30"
              )}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-foreground">{item.symbol}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[13px] text-muted-foreground tabular-nums">${item.price.toFixed(2)}</p>
                  <PctBadge value={item.change} />
                </div>
              </div>
              {/* Chain link CTA */}
              <button
                onClick={() => router.push(`/options-chain/${encodeURIComponent(item.symbol)}`)}
                className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center active:bg-muted/50 transition-colors shrink-0"
              >
                <Link2 size={15} strokeWidth={1.8} className="text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </WidgetCard>

      {/* ── Popular ── */}
      <WidgetCard title="Popular" flipper>
        <TabRow tabs={POPULAR_TABS} active={popularTab} onChange={setPopularTab} />
        <OptionsTable
          cols={[
            { label: "Index" },
            { label: "Option",      align: "right", minWidth: 150 },
            { label: "Underlying",  align: "right", minWidth: 90  },
            { label: "OI",         align: "right", minWidth: 60  },
          ]}
          rows={POPULAR_DATA[popularTab].map((r) => [
            <Cell key="i" top={r.index} />,
            <NumCell key="o" value={r.option} />,
            <NumCell key="u" value={r.underlying} />,
            <NumCell key="oi" value={r.oi} />,
          ])}
        />
      </WidgetCard>

      {/* ── Top Options Under $10 ── */}
      <WidgetCard title="Top Options Under $10" flipper>
        <OptionsTable
          cols={[
            { label: "Index" },
            { label: "Strike",    align: "right", minWidth: 150 },
            { label: "Opt. Price", align: "right", minWidth: 90 },
          ]}
          rows={UNDER_10.map((r) => [
            <Cell key="i" top={r.index} />,
            <NumCell key="s" value={r.strike} />,
            <div key="p" className="text-right">
              <p className="text-[13px] font-semibold text-foreground tabular-nums">{r.price}</p>
              <PctBadge value={r.change} />
            </div>,
          ])}
        />
      </WidgetCard>

      {/* ── Sectorial ── */}
      <WidgetCard title="Sectorial" flipper>
        <SectorChips chips={SECTOR_CHIPS} active={sector} onChange={setSector} />
        <OptionsTable
          cols={[
            { label: "Index" },
            { label: "Option", align: "right", minWidth: 150 },
            { label: "OI",     align: "right", minWidth: 70  },
            { label: "Vol",    align: "right", minWidth: 60  },
          ]}
          rows={SECTORIAL[sector].map((r) => [
            <Cell key="i" top={r.index} />,
            <NumCell key="o" value={r.option} />,
            <NumCell key="oi" value={r.oi} />,
            <NumCell key="v" value={r.vol} />,
          ])}
        />
      </WidgetCard>

      {/* ── Options in Focus ── */}
      <WidgetCard title="Options in Focus" flipper>
        <TabRow tabs={FOCUS_TABS} active={focusTab} onChange={setFocusTab} />
        <OptionsTable
          cols={[
            { label: "Ticker" },
            { label: "Contract",  align: "right", minWidth: 150 },
            { label: "Open Int.", align: "right", minWidth: 80  },
          ]}
          rows={IN_FOCUS[focusTab].map((r) => [
            <Cell key="t" top={r.ticker} />,
            <NumCell key="c" value={r.contract} />,
            <NumCell key="oi" value={r.openInt} />,
          ])}
        />
      </WidgetCard>

    </div>
  );
}
