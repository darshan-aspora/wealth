"use client";

import { useState } from "react";
import { Copy, Landmark, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FilterTab = "All" | "Trades" | "Deposits" | "Withdrawn" | "Dividends" | "Margins" | "Interest";

type TxStatus = "executed" | "success" | "pending" | "failed";

interface TradeDetail {
  kind: "trade";
  side: "Buy" | "Sell";
  instrument: string;
  isOption?: boolean;
  quantity: number;
  limitPrice: number;
  total: number;
  executedAt: string;
  orderId: string;
  charges: number;
  brokerage: number;
  regulatoryFee: number;
  secFee: number;
  finraFee: number;
  exchangeFee: number;
  opraFee: number;
  cashImpact: number;
}

interface DepositDetail {
  kind: "deposit";
  depositAmount: number;
  source: string;
  processedAt: string;
  transactionId: string;
  charges?: number;
  brokerage?: number;
  regulatoryFee?: number;
  cashImpact?: number;
  message?: string;
}

interface WithdrawalDetail {
  kind: "withdrawal";
  amount: number;
  source: string;
  processedAt: string;
  transactionId: string;
  charges?: number;
  brokerage?: number;
  regulatoryFee?: number;
  cashImpact?: number;
  message?: string;
}

interface DividendDetail {
  kind: "dividend";
  company: string;
  ticker: string;
  amount: number;
  perShare: number;
  sharesHeld: number;
  taxWithheld: number;
  netCredited: number;
}

interface MarginDetail {
  kind: "margin";
  subKind: "adjustment" | "released";
  instrument?: string;
  description: string;
  marginBefore?: number;
  marginAfter?: number;
  change?: number;
  netMargin?: number;
  contracts?: number;
  amountCredited?: number;
  cashImpact?: number;
}

interface InterestDetail {
  kind: "interest";
  subKind: "credited" | "charged";
  description: string;
  period: string;
  contracts?: number;
  instrument?: string;
  amountCredited: number;
  cashImpact: number;
}

type TxDetail = TradeDetail | DepositDetail | WithdrawalDetail | DividendDetail | MarginDetail | InterestDetail;

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  filter: Exclude<FilterTab, "All">;
  status: TxStatus;
  detail: TxDetail;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const cashAvailable = 8_200;
const marginUsed    = 12_300;
const totalBuying   = cashAvailable + marginUsed;

const HISTORY: Transaction[] = [
  {
    id: 1, date: "Apr 15, 2026 · 11:42 AM", description: "Bought NVDA (10 shares)", amount: -9_800,
    filter: "Trades", status: "executed",
    detail: { kind: "trade", side: "Buy", instrument: "Nvidia Corporations", quantity: 10, limitPrice: 80, total: 9_725, executedAt: "10:02:34", orderId: "ORD123456", charges: 80, brokerage: 75, regulatoryFee: 5, secFee: 0.80, finraFee: 0.50, exchangeFee: 1.20, opraFee: 0.50, cashImpact: -9_800 },
  },
  {
    id: 2, date: "Apr 15, 2026 · 11:30 AM", description: "Deposit Received", amount: 10_000,
    filter: "Deposits", status: "success",
    detail: { kind: "deposit", depositAmount: 10_000, source: "Bank Transfer", processedAt: "10:02:34", transactionId: "DEP202801", charges: 50, brokerage: 40, regulatoryFee: 10, cashImpact: 9_950 },
  },
  {
    id: 3, date: "Apr 15, 2026 · 10:55 AM", description: "Sold 2 SPY Call Contracts", amount: 1_200,
    filter: "Trades", status: "executed",
    detail: { kind: "trade", side: "Sell", instrument: "SPY Apr 18 500 Call", isOption: true, quantity: 10, limitPrice: 80, total: 9_725, executedAt: "10:02:34", orderId: "ORD123456", charges: 3.2, brokerage: 3.2, regulatoryFee: 12, secFee: 0.80, finraFee: 0.50, exchangeFee: 1.20, opraFee: 0.50, cashImpact: 1_196.8 },
  },
  {
    id: 4, date: "Apr 15, 2026 · 10:10 AM", description: "Dividend Credited (AAPL)", amount: 120,
    filter: "Dividends", status: "executed",
    detail: { kind: "dividend", company: "Apple Inc.", ticker: "AAPL", amount: 120, perShare: 0.34, sharesHeld: 500, taxWithheld: 19, netCredited: 102 },
  },
  {
    id: 5, date: "Apr 14, 2026 · 3:45 PM", description: "Sold TSLA (5 shares)", amount: 4_200,
    filter: "Trades", status: "executed",
    detail: { kind: "trade", side: "Sell", instrument: "Tesla Inc.", quantity: 5, limitPrice: 860, total: 4_280, executedAt: "10:02:34", orderId: "ORD123457", charges: 80, brokerage: 75, regulatoryFee: 5, secFee: 0.80, finraFee: 0.50, exchangeFee: 1.20, opraFee: 0.50, cashImpact: 4_200 },
  },
  {
    id: 6, date: "Apr 14, 2026 · 2:20 PM", description: "Bought AAPL (15 shares)", amount: -2_700,
    filter: "Trades", status: "executed",
    detail: { kind: "trade", side: "Buy", instrument: "Apple Inc.", quantity: 15, limitPrice: 178, total: 2_670, executedAt: "10:02:34", orderId: "ORD123458", charges: 80, brokerage: 75, regulatoryFee: 5, secFee: 0.80, finraFee: 0.50, exchangeFee: 1.20, opraFee: 0.50, cashImpact: -2_750 },
  },
  {
    id: 7, date: "Apr 14, 2026 · 1:05 PM", description: "Options Requirement Adjusted", amount: -1_500,
    filter: "Margins", status: "executed",
    detail: { kind: "margin", subKind: "adjustment", description: "Increased volatility in SPY options", marginBefore: 3_500, marginAfter: 5_000, change: -1_500, netMargin: 1_500 },
  },
  {
    id: 8, date: "Apr 14, 2026 · 11:40 AM", description: "Margin Released", amount: 2_000,
    filter: "Margins", status: "executed",
    detail: { kind: "margin", subKind: "released", instrument: "SPY 500 Call · Apr 18 '26", description: "Interest on margin, margin released and funds available", contracts: 2, amountCredited: 230, cashImpact: 1_200 },
  },
  {
    id: 9, date: "Apr 14, 2026 · 10:15 AM", description: "Deposit Initiated (Pending)", amount: 5_000,
    filter: "Deposits", status: "pending",
    detail: { kind: "deposit", depositAmount: 10_000, source: "Bank Transfer", processedAt: "10:02:34", transactionId: "DEP202802", message: "Your bank transfer has been initiated and is currently being processed. We are waiting for confirmation from your bank before adding the funds to your account." },
  },
  {
    id: 10, date: "Apr 13, 2026 · 4:00 PM", description: "Interest Charged (Margin)", amount: -45,
    filter: "Interest", status: "executed",
    detail: { kind: "interest", subKind: "charged", description: "Interest charged on your margin balance at an annual rate of 8.5%, charged for the period.", period: "Apr 1 2026 to Apr 30 2026", amountCredited: -45, cashImpact: -45 },
  },
  {
    id: 11, date: "Apr 13, 2026 · 2:30 PM", description: "Withdrawal Processed", amount: -3_000,
    filter: "Withdrawn", status: "success",
    detail: { kind: "withdrawal", amount: 3_000, source: "Bank Transfer", processedAt: "10:02:34", transactionId: "WTH202801", charges: 0, cashImpact: -3_000 },
  },
  {
    id: 12, date: "Apr 13, 2026 · 11:00 AM", description: "Withdrawal Failed", amount: -10_000,
    filter: "Withdrawn", status: "failed",
    detail: { kind: "withdrawal", amount: 10_000, source: "Bank Transfer", processedAt: "10:02:34", transactionId: "WTH202802", message: "Your request to withdraw $10,000.00 from your account on 06/01/2026 at 14:20 failed due to a technical issue. Please try to withdraw again." },
  },
  {
    id: 13, date: "Apr 12, 2026 · 10:00 AM", description: "Deposit Failed", amount: 10_000,
    filter: "Deposits", status: "failed",
    detail: { kind: "deposit", depositAmount: 10_000, source: "Bank Transfer", processedAt: "10:02:34", transactionId: "DEP202803", message: "Your request to add $10,000.00 to your account on 06/01/2026 at 14:20 failed due to a technical issue. If the amount was deducted, it will be credited to your ledger within 72 hours. In case of failure, please try again in a bit." },
  },
  {
    id: 14, date: "Apr 12, 2026 · 9:00 AM", description: "Interest Credited", amount: 18,
    filter: "Interest", status: "executed",
    detail: { kind: "interest", subKind: "credited", description: "Interest earned on your uninvested cash balance at an annual rate of 3.5%, credited for the period.", period: "Apr 1 2026 to Apr 30 2026", amountCredited: 16.40, cashImpact: 18.40 },
  },
  {
    id: 15, date: "Apr 11, 2026 · 3:00 PM", description: "Dividend Credited (TSLA)", amount: 85,
    filter: "Dividends", status: "executed",
    detail: { kind: "dividend", company: "Tesla Inc.", ticker: "TSLA", amount: 85, perShare: 0.17, sharesHeld: 500, taxWithheld: 12, netCredited: 73 },
  },
];

const FILTERS: FilterTab[] = ["All", "Trades", "Deposits", "Withdrawn", "Dividends", "Margins", "Interest"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtAmt(n: number) {
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
  return (n >= 0 ? "+ $" : "- $") + abs;
}

function fmtPos(n: number) {
  return "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: TxStatus }) {
  const configs = {
    executed: { label: "Executed", cls: "bg-emerald-50 text-emerald-600" },
    success:  { label: "Success",  cls: "bg-emerald-50 text-emerald-600" },
    pending:  { label: "Pending",  cls: "bg-amber-50 text-amber-600"    },
    failed:   { label: "Failed",   cls: "bg-red-50 text-red-500"        },
  };
  const { label, cls } = configs[status];
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide", cls)}>{label}</span>
  );
}

/* ------------------------------------------------------------------ */
/*  Drawer detail row                                                  */
/* ------------------------------------------------------------------ */

function DRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className={cn("text-[13px] font-semibold text-foreground tabular-nums", valueClass)}>{value}</p>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <button
        className="flex items-center gap-1.5 active:opacity-60"
        onClick={() => navigator.clipboard?.writeText(value)}
      >
        <p className="text-[13px] font-semibold text-foreground tabular-nums">#{value}</p>
        <Copy size={12} className="text-muted-foreground shrink-0" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chevron                                                            */
/* ------------------------------------------------------------------ */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12" fill="none"
      className={cn("transition-transform duration-200 text-muted-foreground shrink-0", open ? "rotate-180" : "")}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Charges accordion (trade)                                          */
/* ------------------------------------------------------------------ */

function ChargesAccordion({ d }: { d: TradeDetail }) {
  const [chargesOpen, setChargesOpen] = useState(false);
  const [regOpen,     setRegOpen]     = useState(false);

  return (
    <div className="border-b border-border/40 last:border-0">
      {/* Charges & Fees row */}
      <button
        onClick={() => setChargesOpen((v) => !v)}
        className="flex items-center justify-between w-full py-2.5"
      >
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] text-muted-foreground">Charges &amp; Fees</p>
          <Chevron open={chargesOpen} />
        </div>
        <p className="text-[13px] font-semibold text-foreground tabular-nums">${d.charges}</p>
      </button>

      {chargesOpen && (
        <div className="pb-1">
          {/* Aspora Brokerage */}
          <div className="flex items-center justify-between py-2 pl-3">
            <p className="text-[13px] text-muted-foreground">Aspora Brokerage</p>
            <p className="text-[13px] font-semibold text-foreground tabular-nums">${d.brokerage}</p>
          </div>

          {/* Regulatory Fees row */}
          <button
            onClick={() => setRegOpen((v) => !v)}
            className="flex items-center justify-between w-full py-2 pl-3"
          >
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] text-muted-foreground">Regulatory Fees</p>
              <Chevron open={regOpen} />
            </div>
            <p className="text-[13px] font-semibold text-foreground tabular-nums">${d.regulatoryFee}</p>
          </button>

          {regOpen && (
            <>
              <div className="h-px bg-border/30 mx-3 mb-2" />
              <div className="flex items-center justify-between py-1.5 pl-6">
                <p className="text-[13px] text-muted-foreground">SEC Fee</p>
                <p className="text-[13px] font-semibold text-foreground tabular-nums">${d.secFee.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-6">
                <p className="text-[13px] text-muted-foreground">FINRA Fee</p>
                <p className="text-[13px] font-semibold text-foreground tabular-nums">${d.finraFee.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-6">
                <p className="text-[13px] text-muted-foreground">Exchange Fees</p>
                <p className="text-[13px] font-semibold text-foreground tabular-nums">${d.exchangeFee.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-6 mb-1">
                <p className="text-[13px] text-muted-foreground">OPRA Fee</p>
                <p className="text-[13px] font-semibold text-foreground tabular-nums">${d.opraFee.toFixed(2)}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Drawer content per type                                            */
/* ------------------------------------------------------------------ */

function DrawerBody({ tx }: { tx: Transaction }) {
  const d = tx.detail;

  if (d.kind === "trade") {
    return (
      <>
        <DRow label="Quantity"          value={String(d.quantity)} />
        <DRow label="Limit Price"       value={`$${d.limitPrice}`} />
        <DRow label="Total"             value={`$${d.total.toLocaleString()}`} />
        <DRow label="Order Executed At" value={d.executedAt} />
        <CopyRow label="Order ID" value={d.orderId} />
        <ChargesAccordion d={d} />
        <div className="mt-3 rounded-xl bg-muted/50 px-4 py-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-muted-foreground">{d.side === "Buy" ? "Cash Used" : "Cash Added"}</p>
          <p className={cn("text-[15px] font-extrabold tabular-nums", d.side === "Buy" ? "text-red-500" : "text-[#10B981]")}>
            {d.side === "Buy" ? `- $${Math.abs(d.cashImpact).toLocaleString()}` : `+ $${Math.abs(d.cashImpact).toLocaleString()}`}
          </p>
        </div>
      </>
    );
  }

  if (d.kind === "deposit") {
    return (
      <>
        {d.message && (
          <div className={cn("rounded-xl px-3.5 py-3 mb-3 text-[13px] font-medium leading-relaxed",
            tx.status === "failed" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
          )}>
            {d.message}
          </div>
        )}
        <DRow label="Amount"         value={`$${d.depositAmount.toLocaleString()}`} />
        <DRow label="Source"         value={d.source} />
        <DRow label={tx.status === "pending" ? "Attempted At" : "Processed At"} value={d.processedAt} />
        <CopyRow label="Transaction ID" value={d.transactionId} />
        {d.charges !== undefined && <DRow label="Charges & Fees" value={`$${d.charges}`} />}
        {d.brokerage !== undefined && <DRow label="Aspora Brokerage" value={`$${d.brokerage}`} />}
        {d.regulatoryFee !== undefined && <DRow label="Regulatory Fees" value={`$${d.regulatoryFee}`} />}
        {d.cashImpact !== undefined && (
          <div className="mt-3 rounded-xl bg-muted/50 px-4 py-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-muted-foreground">Cash Added</p>
            <p className="text-[15px] font-extrabold tabular-nums text-[#10B981]">+ ${d.cashImpact.toLocaleString()}</p>
          </div>
        )}
      </>
    );
  }

  if (d.kind === "withdrawal") {
    return (
      <>
        {d.message && (
          <div className="rounded-xl bg-red-50 px-3.5 py-3 mb-3 text-[13px] font-medium text-red-600 leading-relaxed">
            {d.message}
          </div>
        )}
        <DRow label="Amount"         value={`$${d.amount.toLocaleString()}`} />
        <DRow label="Source"         value={d.source} />
        <DRow label={tx.status === "success" ? "Processed At" : "Attempted At"} value={d.processedAt} />
        <CopyRow label="Transaction ID" value={d.transactionId} />
        {d.charges !== undefined && d.charges > 0 && <DRow label="Charges & Fees" value={`$${d.charges}`} />}
        {d.cashImpact !== undefined && (
          <div className="mt-3 rounded-xl bg-muted/50 px-4 py-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-muted-foreground">Cash Deducted</p>
            <p className="text-[15px] font-extrabold tabular-nums text-red-500">- ${Math.abs(d.cashImpact).toLocaleString()}</p>
          </div>
        )}
      </>
    );
  }

  if (d.kind === "dividend") {
    return (
      <>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-[11px] font-bold text-muted-foreground">{d.ticker[0]}</div>
          <p className="text-[14px] font-semibold text-foreground">{d.company}</p>
        </div>
        <DRow label="Amount"           value={`$${d.amount}`} />
        <DRow label="Dividend per share" value={`$${d.perShare}`} />
        <DRow label="Shares Held"      value={String(d.sharesHeld)} />
        <DRow label="Tax Withheld"     value={`$${d.taxWithheld}`} valueClass="text-red-500" />
        <div className="mt-3 rounded-xl bg-muted/50 px-4 py-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-muted-foreground">Net Credited Cash</p>
          <p className="text-[15px] font-extrabold tabular-nums text-[#10B981]">+ ${d.netCredited}</p>
        </div>
      </>
    );
  }

  if (d.kind === "margin") {
    if (d.subKind === "adjustment") {
      return (
        <>
          <p className="text-[13px] text-muted-foreground mb-4">{d.description}</p>
          <DRow label="Margin Required" value={`$${d.marginBefore?.toLocaleString()} → $${d.marginAfter?.toLocaleString()}`} />
          <DRow label="Change"          value={`- $${Math.abs(d.change!).toLocaleString()}`} valueClass="text-red-500" />
          <DRow label="Net Margin"      value={`$${d.netMargin?.toLocaleString()}`} />
        </>
      );
    }
    return (
      <>
        {d.instrument && <p className="text-[13px] font-semibold text-foreground mb-1">{d.instrument}</p>}
        <p className="text-[13px] text-muted-foreground mb-4">{d.description}</p>
        <DRow label="Contract"        value={String(d.contracts)} />
        <DRow label="Amount Credited" value={`$${d.amountCredited}`} />
        {d.cashImpact !== undefined && (
          <div className="mt-3 rounded-xl bg-muted/50 px-4 py-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-muted-foreground">Cash Added</p>
            <p className="text-[15px] font-extrabold tabular-nums text-[#10B981]">+ ${d.cashImpact.toLocaleString()}</p>
          </div>
        )}
      </>
    );
  }

  if (d.kind === "interest") {
    return (
      <>
        <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">{d.description}</p>
        <DRow label="Period"          value={d.period} />
        {d.contracts !== undefined && <DRow label="Contract" value={String(d.contracts)} />}
        <DRow label="Amount Credited" value={`$${Math.abs(d.amountCredited).toFixed(2)}`} />
        <div className="mt-3 rounded-xl bg-muted/50 px-4 py-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-muted-foreground">{d.subKind === "credited" ? "Cash Added" : "Cash Deducted"}</p>
          <p className={cn("text-[15px] font-extrabold tabular-nums", d.subKind === "credited" ? "text-[#10B981]" : "text-red-500")}>
            {d.subKind === "credited" ? "+ " : "- "}${Math.abs(d.cashImpact).toFixed(2)}
          </p>
        </div>
      </>
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Transaction drawer                                                 */
/* ------------------------------------------------------------------ */

function TxDrawer({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const d = tx.detail;

  const titleMap: Record<TxDetail["kind"], string> = {
    trade:      d.kind === "trade" ? `${d.side === "Buy" ? "Bought" : "Sold"} · ${d.instrument}` : "",
    deposit:    "Cash Deposit",
    withdrawal: "Cash Withdraw",
    dividend:   "Dividend Received",
    margin:     d.kind === "margin" ? (d.subKind === "adjustment" ? "Options Requirement Adjustment" : "Margin Released") : "",
    interest:   d.kind === "interest" ? (d.subKind === "credited" ? "Interest Credited" : "Interest Charged") : "",
  };

  const title = titleMap[d.kind];
  const dateShort = tx.date.split(" · ")[0];

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-extrabold text-foreground leading-snug">{title}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={tx.status} />
                <p className="text-[12px] text-muted-foreground">{dateShort}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-1 -mr-1 active:bg-muted/50 shrink-0 mt-0.5">
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        <div className="h-px bg-border/40 shrink-0" />

        <div className="overflow-y-auto flex-1 px-5 py-4">
          <DrawerBody tx={tx} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Main tab                                                           */
/* ------------------------------------------------------------------ */

export function BuyingPowerTab() {
  const [filter, setFilter]         = useState<FilterTab>("All");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = filter === "All" ? HISTORY : HISTORY.filter((h) => h.filter === filter);

  const cashPct   = (cashAvailable / totalBuying) * 100;
  const marginPct = (marginUsed    / totalBuying) * 100;

  return (
    <div className="pb-24">

      {/* ── Hero ── */}
      <div className="px-5 pt-6 pb-6 flex flex-col items-center text-center">
        <p className="text-[13px] text-muted-foreground font-medium mb-2">Available to trade</p>
        <p className="text-[42px] font-extrabold text-foreground leading-none mb-4">
          ${totalBuying.toLocaleString("en-US")}
        </p>
        <div className="rounded-full bg-emerald-50 px-4 py-1.5 mb-6">
          <p className="text-[12px] font-semibold text-emerald-600">Earning 3.5% APY · 3x more than savings</p>
        </div>

        <div className="flex gap-3 w-full">
          <button className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-white py-3.5 text-[14px] font-bold text-foreground active:opacity-70 transition-opacity">
            <Landmark size={16} />
            Withdraw
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-[14px] font-bold text-background active:opacity-75 transition-opacity">
            + Deposit
          </button>
        </div>
      </div>

      {/* ── Cash / Margin card ── */}
      <div className="mx-5 mb-8 rounded-2xl border border-border/50 bg-white px-4 py-4">
        <div className="flex rounded-full overflow-hidden h-2 mb-4 gap-0.5">
          <div className="rounded-l-full bg-foreground/80" style={{ width: `${cashPct}%` }} />
          <div className="rounded-r-full bg-muted"         style={{ width: `${marginPct}%` }} />
        </div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] text-muted-foreground font-medium mb-0.5">Cash Available</p>
            <p className="text-[17px] font-extrabold text-foreground">{fmtPos(cashAvailable)}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Settled funds</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-muted-foreground font-medium mb-0.5">Margin Used</p>
            <p className="text-[17px] font-extrabold text-foreground">{fmtPos(marginUsed)}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Borrowed amount</p>
          </div>
        </div>
      </div>

      {/* ── History ── */}
      <div className="px-5">
        <p className="text-[17px] font-bold text-foreground mb-4">History</p>

        {/* Filter tabs — scrollable */}
        <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors shrink-0",
                filter === f ? "bg-foreground text-background" : "border border-border/50 text-muted-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        <div className="space-y-2.5">
          {filtered.map((tx) => (
            <button
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="w-full text-left rounded-2xl border border-border/50 bg-white px-4 py-3.5 active:opacity-75 transition-opacity"
            >
              <p className="text-[11px] text-muted-foreground mb-1">{tx.date}</p>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-foreground">{tx.description}</p>
                <p className={cn(
                  "text-[14px] font-bold tabular-nums whitespace-nowrap shrink-0",
                  tx.amount >= 0 ? "text-[#10B981]" : "text-red-500"
                )}>
                  {fmtAmt(tx.amount)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Transaction detail drawer */}
      {selectedTx && <TxDrawer tx={selectedTx} onClose={() => setSelectedTx(null)} />}

    </div>
  );
}
