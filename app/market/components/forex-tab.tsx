"use client";

import { ScrollableTableWidget, type STWColumn } from "@/components/scrollable-table-widget";
import { ChangeCell } from "./market-table";

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

// ---- Mock data: Currency Pairs ----
const FOREX_DATA: ForexRow[] = [
  // Major
  { pair: "EUR/USD", fullName: "Euro / US Dollar", last: "1.0842", change: "+0.0023", changePct: "+0.21%", dayRange: "1.0812 — 1.0868", spread: "0.6", isUp: true, category: "Major" },
  { pair: "GBP/USD", fullName: "British Pound / US Dollar", last: "1.2714", change: "+0.0041", changePct: "+0.32%", dayRange: "1.2668 — 1.2739", spread: "0.9", isUp: true, category: "Major" },
  { pair: "USD/JPY", fullName: "US Dollar / Japanese Yen", last: "149.82", change: "-0.34", changePct: "-0.23%", dayRange: "149.41 — 150.24", spread: "0.8", isUp: false, category: "Major" },
  { pair: "USD/CHF", fullName: "US Dollar / Swiss Franc", last: "0.8821", change: "-0.0018", changePct: "-0.20%", dayRange: "0.8798 — 0.8856", spread: "1.2", isUp: false, category: "Major" },
  { pair: "AUD/USD", fullName: "Australian Dollar / US Dollar", last: "0.6542", change: "+0.0015", changePct: "+0.23%", dayRange: "0.6518 — 0.6561", spread: "0.8", isUp: true, category: "Major" },
  { pair: "USD/CAD", fullName: "US Dollar / Canadian Dollar", last: "1.3612", change: "+0.0028", changePct: "+0.21%", dayRange: "1.3574 — 1.3648", spread: "1.0", isUp: true, category: "Major" },
  { pair: "NZD/USD", fullName: "New Zealand Dollar / US Dollar", last: "0.6048", change: "-0.0012", changePct: "-0.20%", dayRange: "0.6031 — 0.6072", spread: "1.2", isUp: false, category: "Major" },
  // Minor
  { pair: "EUR/GBP", fullName: "Euro / British Pound", last: "0.8527", change: "-0.0012", changePct: "-0.14%", dayRange: "0.8511 — 0.8548", spread: "1.1", isUp: false, category: "Minor" },
  { pair: "EUR/JPY", fullName: "Euro / Japanese Yen", last: "162.41", change: "+0.18", changePct: "+0.11%", dayRange: "161.92 — 162.78", spread: "1.4", isUp: true, category: "Minor" },
  { pair: "GBP/JPY", fullName: "British Pound / Japanese Yen", last: "190.42", change: "+0.52", changePct: "+0.27%", dayRange: "189.64 — 190.88", spread: "1.8", isUp: true, category: "Minor" },
  { pair: "AUD/NZD", fullName: "Australian Dollar / NZ Dollar", last: "1.0824", change: "-0.0008", changePct: "-0.07%", dayRange: "1.0801 — 1.0852", spread: "2.1", isUp: false, category: "Minor" },
  { pair: "EUR/AUD", fullName: "Euro / Australian Dollar", last: "1.6573", change: "+0.0034", changePct: "+0.21%", dayRange: "1.6521 — 1.6612", spread: "1.6", isUp: true, category: "Minor" },
  { pair: "EUR/CHF", fullName: "Euro / Swiss Franc", last: "0.9612", change: "+0.0008", changePct: "+0.08%", dayRange: "0.9594 — 0.9638", spread: "1.3", isUp: true, category: "Minor" },
  { pair: "GBP/AUD", fullName: "British Pound / Australian Dollar", last: "1.9432", change: "+0.0062", changePct: "+0.32%", dayRange: "1.9348 — 1.9478", spread: "2.4", isUp: true, category: "Minor" },
  { pair: "CAD/JPY", fullName: "Canadian Dollar / Japanese Yen", last: "110.08", change: "-0.14", changePct: "-0.13%", dayRange: "109.82 — 110.34", spread: "1.6", isUp: false, category: "Minor" },
  { pair: "AUD/JPY", fullName: "Australian Dollar / Japanese Yen", last: "98.02", change: "+0.12", changePct: "+0.12%", dayRange: "97.68 — 98.24", spread: "1.5", isUp: true, category: "Minor" },
  { pair: "NZD/JPY", fullName: "New Zealand Dollar / Japanese Yen", last: "90.64", change: "-0.08", changePct: "-0.09%", dayRange: "90.32 — 90.92", spread: "1.8", isUp: false, category: "Minor" },
  // Exotic
  { pair: "USD/TRY", fullName: "US Dollar / Turkish Lira", last: "32.418", change: "+0.082", changePct: "+0.25%", dayRange: "32.312 — 32.481", spread: "12.0", isUp: true, category: "Exotic" },
  { pair: "USD/ZAR", fullName: "US Dollar / South African Rand", last: "18.724", change: "-0.048", changePct: "-0.26%", dayRange: "18.642 — 18.812", spread: "8.5", isUp: false, category: "Exotic" },
  { pair: "USD/INR", fullName: "US Dollar / Indian Rupee", last: "83.142", change: "+0.024", changePct: "+0.03%", dayRange: "83.084 — 83.198", spread: "3.2", isUp: true, category: "Exotic" },
  { pair: "USD/MXN", fullName: "US Dollar / Mexican Peso", last: "17.124", change: "-0.042", changePct: "-0.24%", dayRange: "17.068 — 17.198", spread: "4.8", isUp: false, category: "Exotic" },
  { pair: "USD/SGD", fullName: "US Dollar / Singapore Dollar", last: "1.3418", change: "+0.0012", changePct: "+0.09%", dayRange: "1.3398 — 1.3442", spread: "2.4", isUp: true, category: "Exotic" },
  { pair: "USD/HKD", fullName: "US Dollar / Hong Kong Dollar", last: "7.8124", change: "+0.0008", changePct: "+0.01%", dayRange: "7.8108 — 7.8148", spread: "1.8", isUp: true, category: "Exotic" },
  { pair: "USD/THB", fullName: "US Dollar / Thai Baht", last: "35.482", change: "-0.064", changePct: "-0.18%", dayRange: "35.392 — 35.564", spread: "6.2", isUp: false, category: "Exotic" },
  { pair: "USD/PLN", fullName: "US Dollar / Polish Zloty", last: "3.9842", change: "+0.0118", changePct: "+0.30%", dayRange: "3.9692 — 3.9912", spread: "5.4", isUp: true, category: "Exotic" },
  { pair: "USD/BRL", fullName: "US Dollar / Brazilian Real", last: "4.9724", change: "+0.0186", changePct: "+0.38%", dayRange: "4.9482 — 4.9812", spread: "7.8", isUp: true, category: "Exotic" },
  { pair: "USD/AED", fullName: "US Dollar / UAE Dirham", last: "3.6725", change: "+0.0001", changePct: "+0.00%", dayRange: "3.6722 — 3.6728", spread: "1.0", isUp: true, category: "Exotic" },
];

// ---- STW columns ----
const forexColumns: STWColumn[] = [
  { header: "Pair", align: "left" },
  { header: "Last Price", align: "right", minWidth: 80 },
  { header: "Change", align: "right", minWidth: 80 },
  { header: "Change %", align: "right", minWidth: 80 },
  { header: "Day Range", align: "right", minWidth: 140 },
  { header: "Spread", align: "right", minWidth: 70 },
];

function forexRows(data: ForexRow[]): React.ReactNode[][] {
  return data.map((r) => [
    <span key="pair" className="text-[14px] font-semibold text-foreground whitespace-normal leading-tight">{r.pair}</span>,
    <span key="last" className="text-[14px] tabular-nums font-medium text-foreground">{r.last}</span>,
    <ChangeCell key="chg" value={r.change} isUp={r.isUp} />,
    <ChangeCell key="pct" value={r.changePct} isUp={r.isUp} />,
    <span key="range" className="text-[14px] tabular-nums font-medium text-muted-foreground">{r.dayRange}</span>,
    <span key="spread" className="text-[14px] tabular-nums font-medium text-muted-foreground">{r.spread}</span>,
  ]);
}

// ---- Component ----
export function ForexTab() {
  return (
    <div className="pb-8">
      <div className="px-5 pt-5">
        <ScrollableTableWidget
          title="Currency Pairs"
          description="Real-time forex rates across major, minor & exotic pairs"
          pillLayoutId="forex-pill"
          columns={forexColumns}
          rows={forexRows(FOREX_DATA)}
          visibleDataCols={2}
          scrollableMinWidth={450}
          rowHeight="h-[58px]"
          footer={{ label: "View All Pairs" }}
        />
      </div>
    </div>
  );
}
