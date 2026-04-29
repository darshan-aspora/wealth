"use client";

import { useState } from "react";
import {
  ChevronRight, ChevronLeft, ChevronDown, X,
  FileText, TrendingUp, ShieldAlert, Receipt, Brain,
  Mail, Download, CalendarDays,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface SubSection {
  label: string;
  description: string;
  includes: string[];
}

type CategoryId = "core" | "performance" | "risk" | "tax" | "behavioral";

interface Category {
  id: CategoryId;
  label: string;
  icon: React.ReactNode;
  subSections: SubSection[];
}

const CATEGORIES: Category[] = [
  {
    id: "core",
    label: "Account",
    icon: <FileText size={16} />,
    subSections: [
      {
        label: "Account Statements",
        description: "Full account activity summaries across all periods",
        includes: ["Monthly Statement", "Quarterly Statement", "Annual Statement", "Custom Date-Range Statement", "Consolidated Statement"],
      },
      {
        label: "Transaction Reports",
        description: "Every debit, credit, and fund movement on your account",
        includes: ["Full Transaction History", "Deposits & Withdrawals", "Cash Ledger Report", "Dividend Transactions", "Interest Earned Report", "Corporate Action History"],
      },
      {
        label: "Holdings Reports",
        description: "Snapshot and historical breakdown of your portfolio holdings",
        includes: ["Current Holdings Report", "Historical Holdings Report", "Holdings by Asset Class", "Holdings by Sector", "Holdings by Geography"],
      },
      {
        label: "Orders & Trades",
        description: "Execution details and order history across all instruments",
        includes: ["Trade Confirmations", "Order History Report", "Filled vs Cancelled Orders", "Average Execution Price", "Trade Settlement Report"],
      },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    icon: <TrendingUp size={16} />,
    subSections: [
      {
        label: "Returns",
        description: "Portfolio return analysis across different time horizons",
        includes: ["Portfolio vs Benchmark", "Time Weighted Return (TWR)", "Money Weighted Return (IRR)", "Daily P&L Report", "Monthly P&L Report", "Annual Performance Report"],
      },
      {
        label: "Gain / Loss",
        description: "Realized and unrealized P&L with tax lot detail",
        includes: ["Realized Gains Report", "Unrealized Gains Report", "Tax Lot Report", "FIFO / LIFO Gains Report", "Wash Sale Report"],
      },
      {
        label: "Attribution",
        description: "Break down what drove your returns by asset, sector and strategy",
        includes: ["Contribution by Asset", "Contribution by Sector", "Contribution by Strategy", "Contribution by Geography"],
      },
    ],
  },
  {
    id: "risk",
    label: "Risk",
    icon: <ShieldAlert size={16} />,
    subSections: [
      {
        label: "Portfolio Risk",
        description: "Volatility, drawdown, VaR and sensitivity metrics",
        includes: ["Portfolio Volatility Report", "Maximum Drawdown Report", "Downside Risk Report", "Value at Risk (VaR)", "Beta vs Market", "Correlation Matrix"],
      },
      {
        label: "Concentration Risk",
        description: "Overweight positions and heavy sector or country bets",
        includes: ["Position Concentration", "Sector Concentration", "Top 10 Exposure Report", "Single Stock Exposure", "Country Exposure Risk"],
      },
      {
        label: "Scenario Analysis",
        description: "Stress test your portfolio against historical and hypothetical events",
        includes: ["Market Crash Simulation", "Interest Rate Change Impact", "Inflation Impact Simulation", "Currency Fluctuation Simulation"],
      },
    ],
  },
  {
    id: "tax",
    label: "Tax",
    icon: <Receipt size={16} />,
    subSections: [
      {
        label: "Core Tax Reports",
        description: "Capital gains, dividends, and interest income for filing",
        includes: ["Capital Gains Report", "Short vs Long Term Gains", "Dividend Tax Report", "Interest Tax Report", "Tax Lot Report"],
      },
      {
        label: "Advanced Tax Tools",
        description: "Harvesting opportunities and optimization strategies",
        includes: ["Tax Loss Harvesting", "Tax Optimization Report", "Realized Gain Optimization", "Carry Forward Losses"],
      },
      {
        label: "Jurisdiction Specific",
        description: "Country-specific tax forms and filing summaries",
        includes: ["Form 1099 Suite (US)", "Form 1042-S (Non-US)", "Capital Gains Statement (India)", "Capital Gains Summary (UK)", "EU Tax Summary"],
      },
    ],
  },
  {
    id: "behavioral",
    label: "Behavioral",
    icon: <Brain size={16} />,
    subSections: [
      {
        label: "Investor Psychology",
        description: "Detect emotional trading patterns and behavioral biases",
        includes: ["Emotional Trading Detection", "Panic Selling Report", "FOMO Trading Detection"],
      },
      {
        label: "Habit Reports",
        description: "Track consistency, holding behavior and portfolio turnover",
        includes: ["Investment Consistency", "Long Term Holding Behavior", "Portfolio Turnover Rate"],
      },
    ],
  },
];

const RANGES = ["1D", "1M", "3M", "6M", "1Y", "Custom"] as const;
type Range = typeof RANGES[number];

/* ------------------------------------------------------------------ */
/*  Inline calendar                                                    */
/* ------------------------------------------------------------------ */

interface CalDateVal { year: number; month: number; day: number }

const CAL_MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const CAL_DAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

function calDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function calFirstDow(y: number, m: number) { return (new Date(y, m, 1).getDay() + 6) % 7; }
function calToNum(d: CalDateVal) { return d.year * 10000 + d.month * 100 + d.day; }
function calFmt(d: CalDateVal) { return `${CAL_MONTHS[d.month].slice(0,3)} ${d.day}, ${d.year}`; }

function InlineCalendar({
  from, to, selecting, onSelect,
}: {
  from: CalDateVal | null; to: CalDateVal | null;
  selecting: "from" | "to";
  onSelect: (d: CalDateVal) => void;
}) {
  const today = new Date();
  const [cy, setCy] = useState(today.getFullYear());
  const [cm, setCm] = useState(today.getMonth());

  const total = calDaysInMonth(cy, cm);
  const offset = calFirstDow(cy, cm);
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const fromNum = from ? calToNum(from) : null;
  const toNum   = to   ? calToNum(to)   : null;
  const cellNum = (d: number) => cy * 10000 + cm * 100 + d;

  function prevMonth() { if (cm === 0) { setCm(11); setCy(y => y - 1); } else setCm(m => m - 1); }
  function nextMonth() { if (cm === 11) { setCm(0); setCy(y => y + 1); } else setCm(m => m + 1); }

  return (
    <div className="mt-3 rounded-2xl border border-border/50 bg-white px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 rounded-full active:bg-muted/50">
          <ChevronLeft size={16} className="text-foreground" />
        </button>
        <p className="text-[16px] font-bold text-foreground">{CAL_MONTHS[cm]} {cy}</p>
        <button onClick={nextMonth} className="p-1.5 rounded-full active:bg-muted/50">
          <ChevronRight size={16} className="text-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {CAL_DAYS.map(l => (
          <p key={l} className="text-[12px] text-muted-foreground text-center font-semibold py-0.5">{l}</p>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7">
          {row.map((day, ci) => {
            if (!day) return <div key={ci} />;
            const n = cellNum(day);
            const isFrom = fromNum !== null && n === fromNum;
            const isTo   = toNum   !== null && n === toNum;
            const inRange = fromNum && toNum && n > Math.min(fromNum, toNum) && n < Math.max(fromNum, toNum);
            const active = isFrom || isTo;
            return (
              <button
                key={ci}
                onClick={() => onSelect({ year: cy, month: cm, day })}
                className={cn(
                  "relative h-9 flex items-center justify-center",
                  inRange && "bg-muted/50",
                  isFrom && "rounded-l-full",
                  isTo   && "rounded-r-full",
                  (isFrom && isTo) && "rounded-full",
                )}
              >
                <span className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full text-[14px] font-medium",
                  active ? "bg-foreground text-background font-bold" : "text-foreground",
                )}>
                  {day}
                </span>
              </button>
            );
          })}
        </div>
      ))}
      <p className="text-[12px] text-muted-foreground text-center mt-3">
        {selecting === "from" ? "Select start date" : "Select end date"}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Report drawer                                                      */
/* ------------------------------------------------------------------ */

function ReportDrawer({ sub, onClose }: { sub: SubSection; onClose: () => void }) {
  const [range, setRange]         = useState<Range>("6M");
  const [calFrom, setCalFrom]     = useState<CalDateVal | null>(null);
  const [calTo,   setCalTo]       = useState<CalDateVal | null>(null);
  const [selecting, setSelecting] = useState<"from" | "to">("from");

  function handleCalSelect(d: CalDateVal) {
    if (selecting === "from") {
      setCalFrom(d);
      setCalTo(null);
      setSelecting("to");
    } else {
      if (calFrom && calToNum(d) < calToNum(calFrom)) {
        setCalTo(calFrom);
        setCalFrom(d);
      } else {
        setCalTo(d);
      }
      setSelecting("from");
    }
  }

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[90dvh] flex flex-col inset-x-0 mx-auto max-w-[430px]">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 pt-2 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-foreground leading-tight">{sub.label}</p>
              <p className="text-[14px] text-muted-foreground mt-1">{sub.description}</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1 -mr-1 -mt-0.5 active:bg-muted/50 shrink-0">
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6">

          {/* Included reports */}
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Included in this report</p>
            <div className="flex flex-wrap gap-2">
              {sub.includes.map((name, i) => (
                <span key={i} className="rounded-lg bg-muted/60 border border-border/40 px-3 py-1.5 text-[13px] font-medium text-foreground">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={14} className="text-muted-foreground" />
              <p className="text-[16px] font-bold text-foreground">Select Time Range</p>
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[14px] font-semibold transition-colors whitespace-nowrap shrink-0",
                    range === r ? "bg-foreground text-background" : "border border-border/60 text-muted-foreground"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            {range === "Custom" && (
              <div className="mt-3">
                <div className="flex gap-2 mb-1">
                  <button
                    onClick={() => setSelecting("from")}
                    className={cn(
                      "flex-1 rounded-xl border px-3 py-2.5 text-left transition-colors",
                      selecting === "from" ? "border-foreground" : "border-border/50"
                    )}
                  >
                    <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">From</p>
                    <p className="text-[16px] font-semibold text-foreground">
                      {calFrom ? calFmt(calFrom) : "—"}
                    </p>
                  </button>
                  <button
                    onClick={() => setSelecting("to")}
                    className={cn(
                      "flex-1 rounded-xl border px-3 py-2.5 text-left transition-colors",
                      selecting === "to" ? "border-foreground" : "border-border/50"
                    )}
                  >
                    <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">To</p>
                    <p className="text-[16px] font-semibold text-foreground">
                      {calTo ? calFmt(calTo) : "—"}
                    </p>
                  </button>
                </div>
                <InlineCalendar
                  from={calFrom} to={calTo}
                  selecting={selecting}
                  onSelect={handleCalSelect}
                />
              </div>
            )}
          </div>

        </div>

        <div className="shrink-0 px-5 pb-6 pt-3 border-t border-border/40 flex gap-3">
          <button
            disabled={range === "Custom" && !(calFrom && calTo)}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-border/60 py-4 text-[16px] font-bold text-foreground active:opacity-70 transition-opacity disabled:opacity-30"
          >
            <Mail size={17} />
            Email
          </button>
          <button
            disabled={range === "Custom" && !(calFrom && calTo)}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-[16px] font-bold text-background active:opacity-75 transition-opacity disabled:opacity-30"
          >
            <Download size={17} />
            Download PDF
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Category accordion                                                 */
/* ------------------------------------------------------------------ */

function CategoryAccordion({ cat, onSelectSub }: { cat: Category; onSelectSub: (sub: SubSection) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border/50 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-4 active:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-foreground">{cat.icon}</span>
          <p className="text-[17px] font-bold text-foreground">{cat.label}</p>
          <span className="text-[13px] font-semibold text-muted-foreground bg-muted/60 rounded-full px-1.5 py-0.5">
            {cat.subSections.length}
          </span>
        </div>
        <ChevronDown size={16} className={cn("text-muted-foreground transition-transform shrink-0", open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="divide-y divide-border/40 border-t border-border/40">
          {cat.subSections.map((sub, i) => (
            <button
              key={i}
              onClick={() => onSelectSub(sub)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-semibold text-foreground leading-snug">{sub.label}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">
                  {sub.includes.length} reports included
                </p>
              </div>
              <ChevronRight size={15} className="text-muted-foreground/40 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab                                                                */
/* ------------------------------------------------------------------ */

export function ReportsTab({ empty }: { empty?: boolean }) {
  const [selectedSub, setSelectedSub] = useState<SubSection | null>(null);
  const router = useRouter();

  if (empty) {
    const SIZE = 80;   // icon circle diameter
    const R    = 108;  // orbit radius
    const CX   = 160;  // container center x
    const CY   = 160;  // container center y
    const W    = CX * 2;
    const H    = CY * 2;

    return (
      <div className="pb-24 pt-8 flex flex-col items-center px-5">
        {/* Circular arrangement */}
        <div className="select-none mb-7" style={{ width: W, height: H, position: "relative" }}>
          {CATEGORIES.map((cat, i) => {
            const angleDeg = -90 + i * (360 / CATEGORIES.length);
            const angleRad = (angleDeg * Math.PI) / 180;
            const left = CX + R * Math.cos(angleRad) - SIZE / 2;
            const top  = CY + R * Math.sin(angleRad) - SIZE / 2;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-center bg-white absolute"
                style={{
                  width: SIZE,
                  height: SIZE,
                  left,
                  top,
                  borderRadius: "50%",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 6px 28px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <span style={{ transform: "scale(1.4)", display: "flex", color: "rgba(0,0,0,0.65)" }}>
                  {cat.icon}
                </span>
              </div>
            );
          })}
        </div>

        {/* Category name pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <span key={cat.id} className="px-3 py-1 rounded-full bg-muted text-[12px] font-semibold text-muted-foreground">
              {cat.label}
            </span>
          ))}
        </div>

        {/* Message + CTA */}
        <p className="text-[16px] font-bold text-foreground mb-1 text-center">No reports available yet</p>
        <p className="text-[13px] text-muted-foreground text-center mb-6 leading-relaxed">
          Tax, performance and account reports are generated once you start investing.
        </p>
        <button
          onClick={() => router.push("/home-v3")}
          className="w-full rounded-2xl bg-foreground py-4 text-[15px] font-bold text-background active:opacity-75 transition-opacity"
        >
          Start Investing
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="px-5 pt-4 space-y-3">
        <p className="text-[14px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Categories</p>
        {CATEGORIES.map((cat) => (
          <CategoryAccordion key={cat.id} cat={cat} onSelectSub={setSelectedSub} />
        ))}
      </div>

      {selectedSub && (
        <ReportDrawer sub={selectedSub} onClose={() => setSelectedSub(null)} />
      )}
    </div>
  );
}
