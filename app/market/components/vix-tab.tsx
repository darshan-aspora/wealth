"use client";

import { ScrollableTableWidget, type STWColumn } from "@/components/scrollable-table-widget";
import { PctCell, AlertButton } from "./market-table";

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

// ---- Level text ----
const levelColor: Record<VixRow["level"], string> = {
  Low: "text-gain",
  Moderate: "text-amber-500",
  Elevated: "text-orange-500",
  High: "text-loss",
  Extreme: "text-red-600",
};

// ---- STW columns ----
const vixColumns: STWColumn[] = [
  { header: "Index", align: "left" },
  { header: "Level", align: "right", minWidth: 80 },
  { header: "Sentiment", align: "right", minWidth: 80 },
  { header: "Today", align: "right", minWidth: 80 },
  { header: "5 Days", align: "right", minWidth: 80 },
  { header: "1 Month", align: "right", minWidth: 80 },
  { header: "YTD", align: "right", minWidth: 80 },
  { header: "1 Year", align: "right", minWidth: 80 },
  { header: "Set Alert", align: "center", minWidth: 70 },
];

function vixRows(): React.ReactNode[][] {
  return VIX_DATA.map((r) => [
    <div key="name">
      <div className="text-[14px] font-semibold text-foreground whitespace-normal leading-tight">{r.name}</div>
      <div className="text-[12px] text-muted-foreground">{r.country}</div>
    </div>,
    <span key="last" className="text-[14px] tabular-nums font-medium text-foreground">{r.last.toFixed(2)}</span>,
    <span key="level" className={`text-[14px] font-medium ${levelColor[r.level]}`}>{r.level}</span>,
    <PctCell key="today" value={r.today} />,
    <PctCell key="5d" value={r.fiveDays} />,
    <PctCell key="1m" value={r.oneMonth} />,
    <PctCell key="ytd" value={r.ytd} />,
    <PctCell key="1y" value={r.oneYear} />,
    <AlertButton key="alert" />,
  ]);
}

// ---- Component ----
export function VixTab() {
  return (
    <div className="pb-8">
      <div className="px-5 pt-5">
        <ScrollableTableWidget
          title="Volatility Indices"
          description="Fear gauges across global markets"
          pillLayoutId="vix-pill"
          columns={vixColumns}
          rows={vixRows()}
          visibleDataCols={2}
          rowHeight="h-[58px]"
          footer={{ label: "View All Indices" }}
        />
      </div>
    </div>
  );
}
