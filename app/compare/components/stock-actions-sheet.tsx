"use client";

import { useRouter } from "next/navigation";
import { DollarSign, Bell, FileText, Trash2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ALL_TICKERS } from "@/components/ticker";

interface StockActionsSheetProps {
  symbol: string | null;
  onOpenChange: (open: boolean) => void;
  onRemove: () => void;
  onSetAlert: () => void;
}

export function StockActionsSheet({ symbol, onOpenChange, onRemove, onSetAlert }: StockActionsSheetProps) {
  const router = useRouter();
  const ticker = symbol ? ALL_TICKERS.find((t) => t.symbol === symbol) : null;
  const gain = ticker ? ticker.changePercent >= 0 : false;

  if (!symbol) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" />
      </Sheet>
    );
  }

  return (
    <Sheet open={Boolean(symbol)} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-3xl border-t-0 px-5 pb-8 pt-5"
      >
        {/* Stock identity */}
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <div
            className={cn(
              "h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold text-white",
              ticker?.logoColor ?? "bg-muted",
            )}
          >
            {ticker?.logo ?? symbol.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-bold text-foreground">{symbol}</p>
            <p className="text-[13px] text-muted-foreground truncate">{ticker?.name ?? symbol}</p>
          </div>
          {ticker && (
            <div className="text-right">
              <p className="text-[17px] font-bold tabular-nums text-foreground">
                {ticker.price.toFixed(2)}
              </p>
              <p
                className={cn(
                  "text-[13px] font-semibold tabular-nums",
                  gain ? "text-[hsl(var(--gain))]" : "text-[hsl(var(--loss))]",
                )}
              >
                {gain ? "+" : ""}
                {ticker.changePercent.toFixed(2)}%
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2">
          <ActionRow
            icon={<DollarSign size={18} strokeWidth={2} />}
            label={`Buy ${symbol}`}
            onClick={() => {
              onOpenChange(false);
              router.push(`/order-flow/v2?symbol=${symbol}`);
            }}
          />
          <ActionRow
            icon={<Bell size={18} strokeWidth={2} />}
            label="Set price alert"
            onClick={() => {
              onSetAlert();
            }}
          />
          <ActionRow
            icon={<FileText size={18} strokeWidth={2} />}
            label="View stock details"
            onClick={() => {
              onOpenChange(false);
              router.push(`/stocks/${symbol}`);
            }}
          />
          <ActionRow
            icon={<Trash2 size={18} strokeWidth={2} />}
            label="Remove from compare"
            destructive
            onClick={() => {
              onRemove();
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ActionRow({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 py-4 text-left active:bg-muted/50 transition-colors rounded-xl px-2 -mx-2",
        destructive ? "text-[hsl(var(--loss))]" : "text-foreground",
      )}
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", destructive ? "bg-[hsl(var(--loss))]/10" : "bg-muted")}>
        {icon}
      </span>
      <span className="text-[16px] font-semibold">{label}</span>
    </button>
  );
}
