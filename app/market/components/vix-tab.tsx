"use client";

import { MarketTable, PctCell, AlertButton, type TableColumn } from "./market-table";
import { SectionHeader } from "./section-header";

// ---- Types ----
interface VixRow {
  name: string;
  country: string;
  last: number;
  today: number;
  fiveDays: number;
  oneMonth: number;
  ytd: number;
  oneYear: number;
  level: "Low" | "Moderate" | "Elevated" | "High" | "Extreme";
}

// ---- Mock data ----
const VIX_DATA: VixRow[] = [
  { name: "CBOE VIX", country: "US", last: 14.82, today: -3.12, fiveDays: -5.41, oneMonth: -12.34, ytd: -8.21, oneYear: -18.42, level: "Low" },
  { name: "VIX9D (9-Day)", country: "US", last: 12.41, today: -4.28, fiveDays: -6.12, oneMonth: -14.82, ytd: -9.64, oneYear: -21.34, level: "Low" },
  { name: "VIX3M (3-Month)", country: "US", last: 16.24, today: -1.84, fiveDays: -3.92, oneMonth: -8.14, ytd: -5.48, oneYear: -14.62, level: "Low" },
  { name: "VIX6M (6-Month)", country: "US", last: 17.92, today: -1.12, fiveDays: -2.84, oneMonth: -6.42, ytd: -4.12, oneYear: -11.28, level: "Moderate" },
  { name: "VIX1Y (1-Year)", country: "US", last: 18.64, today: -0.82, fiveDays: -2.14, oneMonth: -5.18, ytd: -3.24, oneYear: -9.82, level: "Moderate" },
  { name: "VVIX (VIX of VIX)", country: "US", last: 82.41, today: -2.64, fiveDays: -4.82, oneMonth: -9.24, ytd: -6.14, oneYear: -15.42, level: "Moderate" },
  { name: "SKEW Index", country: "US", last: 138.42, today: +0.84, fiveDays: +1.42, oneMonth: +2.84, ytd: +4.12, oneYear: +6.28, level: "Moderate" },
  { name: "Euro Stoxx 50 VI (VSTOXX)", country: "Europe", last: 16.18, today: -2.42, fiveDays: -4.14, oneMonth: -9.82, ytd: -6.84, oneYear: -16.12, level: "Low" },
  { name: "VFTSE", country: "UK", last: 14.24, today: -1.92, fiveDays: -3.84, oneMonth: -8.62, ytd: -5.92, oneYear: -14.28, level: "Low" },
  { name: "VDAX-NEW", country: "Germany", last: 15.82, today: -2.14, fiveDays: -4.42, oneMonth: -10.14, ytd: -7.12, oneYear: -16.84, level: "Low" },
  { name: "India VIX", country: "India", last: 13.42, today: -4.82, fiveDays: -8.14, oneMonth: -18.42, ytd: -12.64, oneYear: -24.18, level: "Low" },
  { name: "Nikkei VI", country: "Japan", last: 19.84, today: +1.42, fiveDays: +2.84, oneMonth: -3.14, ytd: +1.82, oneYear: -8.42, level: "Moderate" },
  { name: "HSI Volatility", country: "Hong Kong", last: 21.42, today: +2.14, fiveDays: +4.82, oneMonth: +1.24, ytd: +6.14, oneYear: -4.82, level: "Elevated" },
  { name: "KOSPI 200 VI", country: "South Korea", last: 17.24, today: -1.42, fiveDays: -2.84, oneMonth: -6.82, ytd: -3.84, oneYear: -12.14, level: "Moderate" },
  { name: "S&P/ASX 200 VIX", country: "Australia", last: 13.82, today: -2.84, fiveDays: -5.12, oneMonth: -11.42, ytd: -7.84, oneYear: -19.24, level: "Low" },
  { name: "CBOE China ETF VI", country: "China", last: 28.14, today: +3.42, fiveDays: +6.84, oneMonth: +8.12, ytd: +12.42, oneYear: +4.84, level: "Elevated" },
  { name: "Taiwan VIX", country: "Taiwan", last: 16.84, today: -1.24, fiveDays: -3.42, oneMonth: -7.84, ytd: -4.82, oneYear: -13.42, level: "Low" },
  { name: "Canada VIX (VIXC)", country: "Canada", last: 15.12, today: -2.14, fiveDays: -4.24, oneMonth: -9.42, ytd: -6.12, oneYear: -15.84, level: "Low" },
  { name: "Brazil VIX (VXEWZ)", country: "Brazil", last: 24.82, today: +1.84, fiveDays: +3.42, oneMonth: +2.14, ytd: +8.42, oneYear: +2.14, level: "Elevated" },
  { name: "OVX (Crude Oil VIX)", country: "Global", last: 32.14, today: +2.42, fiveDays: +5.84, oneMonth: +4.12, ytd: +14.82, oneYear: +8.42, level: "High" },
  { name: "GVZ (Gold VIX)", country: "Global", last: 15.42, today: -1.84, fiveDays: -3.14, oneMonth: -7.42, ytd: -4.62, oneYear: -12.84, level: "Low" },
  { name: "MOVE Index (Bond VIX)", country: "US", last: 98.42, today: -0.84, fiveDays: -2.14, oneMonth: -5.82, ytd: -3.42, oneYear: -8.14, level: "Moderate" },
];

// ---- Level badge ----
function LevelBadge({ level }: { level: VixRow["level"] }) {
  const colors: Record<VixRow["level"], string> = {
    Low: "bg-gain/15 text-gain",
    Moderate: "bg-amber-500/15 text-amber-500",
    Elevated: "bg-orange-500/15 text-orange-500",
    High: "bg-loss/15 text-loss",
    Extreme: "bg-red-600/15 text-red-600",
  };

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${colors[level]}`}>
      {level}
    </span>
  );
}

// ---- Table columns ----
const vixColumns: TableColumn<VixRow>[] = [
  {
    key: "name",
    label: "Index",
    align: "left",
    frozen: true,
    width: 180,
    render: (r) => (
      <div>
        <div className="text-[14px] font-semibold text-foreground whitespace-normal leading-tight">{r.name}</div>
        <div className="text-[12px] text-muted-foreground">{r.country}</div>
      </div>
    ),
  },
  {
    key: "last",
    label: "Level",
    align: "right",
    render: (r) => <span className="font-mono tabular-nums font-semibold text-foreground">{r.last.toFixed(2)}</span>,
  },
  {
    key: "sentiment",
    label: "Sentiment",
    align: "right",
    render: (r) => <LevelBadge level={r.level} />,
  },
  {
    key: "today",
    label: "Today",
    align: "right",
    render: (r) => <PctCell value={r.today} />,
  },
  {
    key: "5d",
    label: "5 Days",
    align: "right",
    render: (r) => <PctCell value={r.fiveDays} />,
  },
  {
    key: "1m",
    label: "1 Month",
    align: "right",
    render: (r) => <PctCell value={r.oneMonth} />,
  },
  {
    key: "ytd",
    label: "YTD",
    align: "right",
    render: (r) => <PctCell value={r.ytd} />,
  },
  {
    key: "1y",
    label: "1 Year",
    align: "right",
    render: (r) => <PctCell value={r.oneYear} />,
  },
  { key: "alert", label: "Set Alert", align: "center", render: () => <AlertButton /> },
];

// ---- Component ----
export function VixTab() {
  return (
    <div className="pb-8">
      <div className="px-5 pt-5">
        <SectionHeader
          title="Volatility Indices"
          subtitle="Fear gauges across global markets"
        />
        <MarketTable columns={vixColumns} data={VIX_DATA} />
      </div>
    </div>
  );
}
