"use client";

import { useState, useMemo } from "react";
import {
  ChevronRight, ChevronLeft, ChevronDown, Search, X,
  FileText, TrendingUp, ShieldAlert, Receipt, Brain,
  Mail, Download, CalendarDays,
} from "lucide-react";
import { EmptyState } from "../components/empty-state";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface ReportItem {
  title: string;
  description: string;
}

interface SubSection {
  label: string;
  items: ReportItem[];
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
        items: [
          { title: "Monthly Statement",               description: "Full summary of activity each month" },
          { title: "Quarterly Statement",             description: "Three-month period overview" },
          { title: "Annual Statement",                description: "Full-year account ledger" },
          { title: "Custom Date-Range Statement",     description: "Define your own reporting window" },
          { title: "Consolidated Statement",          description: "Combined view across multiple accounts" },
        ],
      },
      {
        label: "Transaction Reports",
        items: [
          { title: "Full Transaction History",        description: "Every debit and credit on your account" },
          { title: "Deposits & Withdrawals",          description: "All fund movements in and out" },
          { title: "Cash Ledger Report",              description: "Day-by-day cash balance log" },
          { title: "Dividend Transactions",           description: "Dividends received across all holdings" },
          { title: "Interest Earned Report",          description: "Interest credited on cash & margin" },
          { title: "Corporate Action History",        description: "Splits, mergers, spinoffs & rights" },
        ],
      },
      {
        label: "Holdings Reports",
        items: [
          { title: "Current Holdings Report",         description: "Live snapshot of your portfolio" },
          { title: "Historical Holdings Report",      description: "Portfolio composition at any past date" },
          { title: "Holdings by Asset Class",         description: "Equity, ETF, options & cash breakdown" },
          { title: "Holdings by Sector",              description: "Allocation across market sectors" },
          { title: "Holdings by Geography",           description: "Country and region exposure" },
        ],
      },
      {
        label: "Orders & Trades",
        items: [
          { title: "Trade Confirmations",             description: "Per-trade execution details" },
          { title: "Order History Report",            description: "All open, completed & failed orders" },
          { title: "Filled vs Cancelled Orders",      description: "Execution success analysis" },
          { title: "Average Execution Price",         description: "Price quality per instrument" },
          { title: "Trade Settlement Report",         description: "Settlement status for all trades" },
        ],
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
        items: [
          { title: "Portfolio vs Benchmark",          description: "Returns compared to SPX, NDX & more" },
          { title: "Time Weighted Return (TWR)",      description: "Performance independent of cash flows" },
          { title: "Money Weighted Return (IRR)",     description: "Return adjusted for your cash flows" },
          { title: "Daily P&L Report",                description: "Day-by-day profit and loss log" },
          { title: "Monthly P&L Report",              description: "Month-over-month performance summary" },
          { title: "Annual Performance Report",       description: "Full-year returns and analysis" },
        ],
      },
      {
        label: "Gain / Loss",
        items: [
          { title: "Realized Gains Report",           description: "Closed position profit and loss" },
          { title: "Unrealized Gains Report",         description: "Open position floating P&L" },
          { title: "Tax Lot Report",                  description: "Per-lot cost basis and holding period" },
          { title: "FIFO / LIFO Gains Report",        description: "Gains under different accounting methods" },
          { title: "Wash Sale Report",                description: "Disallowed loss transactions flagged" },
        ],
      },
      {
        label: "Attribution",
        items: [
          { title: "Contribution by Asset",           description: "Which positions drove your return" },
          { title: "Contribution by Sector",          description: "Sector-level performance attribution" },
          { title: "Contribution by Strategy",        description: "Return by trading strategy or theme" },
          { title: "Contribution by Geography",       description: "Regional return attribution" },
        ],
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
        items: [
          { title: "Portfolio Volatility Report",     description: "Standard deviation of your returns" },
          { title: "Maximum Drawdown Report",         description: "Worst peak-to-trough decline" },
          { title: "Downside Risk Report",            description: "Below-target return analysis" },
          { title: "Value at Risk (VaR)",             description: "Potential loss at confidence levels" },
          { title: "Beta vs Market",                  description: "Portfolio sensitivity to market moves" },
          { title: "Correlation Matrix",              description: "How your holdings move together" },
        ],
      },
      {
        label: "Concentration Risk",
        items: [
          { title: "Position Concentration",          description: "Overweight positions flagged" },
          { title: "Sector Concentration",            description: "Heavy sector bets highlighted" },
          { title: "Top 10 Exposure Report",          description: "Your ten largest holdings by weight" },
          { title: "Single Stock Exposure",           description: "Idiosyncratic risk per position" },
          { title: "Country Exposure Risk",           description: "Geopolitical concentration flags" },
        ],
      },
      {
        label: "Scenario Analysis",
        items: [
          { title: "Market Crash Simulation",         description: "Portfolio impact of a 2008-style crash" },
          { title: "Interest Rate Change Impact",     description: "Sensitivity to rate hikes or cuts" },
          { title: "Inflation Impact Simulation",     description: "Real return under inflation scenarios" },
          { title: "Currency Fluctuation Simulation", description: "FX exposure stress test" },
        ],
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
        items: [
          { title: "Capital Gains Report",            description: "Total realized gains for the period" },
          { title: "Short vs Long Term Gains",        description: "Holding period tax categorization" },
          { title: "Dividend Tax Report",             description: "Qualified vs ordinary dividends" },
          { title: "Interest Tax Report",             description: "Taxable interest income earned" },
          { title: "Tax Lot Report",                  description: "Per-lot basis and holding period" },
        ],
      },
      {
        label: "Advanced Tax Tools",
        items: [
          { title: "Tax Loss Harvesting",             description: "Positions eligible for loss booking" },
          { title: "Tax Optimization Report",         description: "Strategies to reduce your tax bill" },
          { title: "Realized Gain Optimization",      description: "Lot selection for minimum tax impact" },
          { title: "Carry Forward Losses",            description: "Unused losses to offset future gains" },
        ],
      },
      {
        label: "Jurisdiction Specific",
        items: [
          { title: "Form 1099 Suite (US)",            description: "1099-B, DIV, INT, MISC for IRS filing" },
          { title: "Form 1042-S (Non-US)",            description: "US-sourced income withholding report" },
          { title: "Capital Gains Statement (India)", description: "STCG / LTCG per Indian tax rules" },
          { title: "Capital Gains Summary (UK)",      description: "CGT report for HMRC filing" },
          { title: "EU Tax Summary",                  description: "Aggregated report for EU jurisdictions" },
        ],
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
        items: [
          { title: "Emotional Trading Detection",     description: "Trades made during high-volatility spikes" },
          { title: "Panic Selling Report",            description: "Exits during market downturns flagged" },
          { title: "FOMO Trading Detection",          description: "Chasing momentum patterns identified" },
        ],
      },
      {
        label: "Habit Reports",
        items: [
          { title: "Investment Consistency",          description: "How regularly you invest over time" },
          { title: "Long Term Holding Behavior",      description: "Average holding periods by asset" },
          { title: "Portfolio Turnover Rate",         description: "How often you rotate your holdings" },
        ],
      },
    ],
  },
];

const RANGES = ["1D", "1M", "3M", "6M", "1Y", "Custom"] as const;
type Range = typeof RANGES[number];

/* ------------------------------------------------------------------ */
/*  Inline calendar for reports drawer                                  */
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
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 rounded-full active:bg-muted/50">
          <ChevronLeft size={16} className="text-foreground" />
        </button>
        <p className="text-[16px] font-bold text-foreground">{CAL_MONTHS[cm]} {cy}</p>
        <button onClick={nextMonth} className="p-1.5 rounded-full active:bg-muted/50">
          <ChevronRight size={16} className="text-foreground" />
        </button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {CAL_DAYS.map(l => (
          <p key={l} className="text-[12px] text-muted-foreground text-center font-semibold py-0.5">{l}</p>
        ))}
      </div>
      {/* Days */}
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
      {/* Selecting indicator */}
      <p className="text-[12px] text-muted-foreground text-center mt-3">
        {selecting === "from" ? "Select start date" : "Select end date"}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Report request drawer                                              */
/* ------------------------------------------------------------------ */

function ReportDrawer({ item, onClose }: { item: ReportItem; onClose: () => void }) {
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
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header: close top-right, title left, subtitle below */}
        <div className="px-5 pt-2 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-foreground leading-tight">{item.title}</p>
              <p className="text-[14px] text-muted-foreground mt-1">{item.description}</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1 -mr-1 -mt-0.5 active:bg-muted/50 shrink-0">
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6">

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
                {/* From / To summary pills */}
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

        {/* CTAs */}
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

function ReportRow({ item, onTap }: { item: ReportItem; onTap: () => void }) {
  return (
    <button onClick={onTap} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-semibold text-foreground leading-snug">{item.title}</p>
        <p className="text-[14px] text-muted-foreground mt-0.5 leading-snug">{item.description}</p>
      </div>
      <ChevronRight size={15} className="text-muted-foreground/40 shrink-0" />
    </button>
  );
}

function SubSectionAccordion({ sub, onSelectReport }: { sub: SubSection; onSelectReport: (item: ReportItem) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 active:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <p className="text-[16px] font-bold text-foreground">{sub.label}</p>
          <span className="text-[14px] font-semibold text-muted-foreground bg-muted/60 rounded-full px-1.5 py-0.5">
            {sub.items.length}
          </span>
        </div>
        <ChevronDown size={15} className={cn("text-muted-foreground transition-transform shrink-0", open ? "rotate-180" : "")} />
      </button>
      {open && (
        <div className="divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40">
          {sub.items.map((item, i) => <ReportRow key={i} item={item} onTap={() => onSelectReport(item)} />)}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Search results                                                     */
/* ------------------------------------------------------------------ */

function SearchResults({ query, onSelectReport }: { query: string; onSelectReport: (item: ReportItem) => void }) {
  const results = useMemo(() => {
    const q = query.toLowerCase();
    const out: { item: ReportItem; category: string; subSection: string }[] = [];
    for (const cat of CATEGORIES) {
      for (const sub of cat.subSections) {
        for (const item of sub.items) {
          if (item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
            out.push({ item, category: cat.label, subSection: sub.label });
          }
        }
      }
    }
    return out;
  }, [query]);

  if (results.length === 0) {
    return <p className="text-center text-[16px] text-muted-foreground py-10">No reports match &ldquo;{query}&rdquo;</p>;
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-white overflow-hidden divide-y divide-border/40">
      {results.map(({ item, category, subSection }, i) => (
        <button key={i} onClick={() => onSelectReport(item)} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-muted/30 transition-colors">
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-foreground leading-snug">{item.title}</p>
            <p className="text-[14px] text-muted-foreground/60 mt-0.5">{category} · {subSection}</p>
          </div>
          <ChevronRight size={15} className="text-muted-foreground/40 shrink-0" />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab                                                                */
/* ------------------------------------------------------------------ */

export function ReportsTab({ empty }: { empty?: boolean }) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("core");

  if (empty) {
    return (
      <EmptyState
        icon={FileText}
        title="No reports available"
        subtitle="Reports like tax statements, P&L summaries, and contract notes will appear here once you start trading."
        actions={[
          { label: "Start Investing", href: "/home-v3", primary: true },
        ]}
      />
    );
  }
  const [query, setQuery]                   = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const selectedCategory = CATEGORIES.find((c) => c.id === activeCategory)!;
  const isSearching = query.trim().length > 0;

  return (
    <div className="pb-24">

      {/* Search bar */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-center gap-2.5 rounded-2xl bg-muted/50 border border-border/40 px-3.5 py-2.5">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports…"
            className="flex-1 bg-transparent text-[16px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query.length > 0 && (
            <button onClick={() => setQuery("")} className="shrink-0 active:opacity-60">
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {!isSearching && (
        <>
          <div className="px-5">

            {/* Category chips + reports */}
            <div>
              <p className="text-[14px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Categories</p>

              {/* Chips */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[16px] font-semibold whitespace-nowrap transition-colors shrink-0",
                        isActive ? "bg-foreground text-background" : "bg-muted/50 border border-border/40 text-foreground"
                      )}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Sub-sections for active category */}
              <div className="divide-y divide-border/40 border-t border-border/40 border-b border-b-border/40">
                {selectedCategory.subSections.map((sub, i) => (
                  <SubSectionAccordion key={i} sub={sub} onSelectReport={setSelectedReport} />
                ))}
              </div>
            </div>

          </div>
        </>
      )}

      {/* Search results */}
      {isSearching && (
        <div className="px-5">
          <SearchResults query={query} onSelectReport={setSelectedReport} />
        </div>
      )}

      {/* Report request drawer */}
      {selectedReport && (
        <ReportDrawer item={selectedReport} onClose={() => setSelectedReport(null)} />
      )}

    </div>
  );
}
