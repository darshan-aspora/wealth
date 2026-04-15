"use client";

import { useState, useCallback } from "react";
import { Reorder } from "framer-motion";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketItem {
  id: string;
  label: string;
  isCustom?: boolean;
}

const DEFAULT_MARKETS: MarketItem[] = [
  { id: "us", label: "US" },
  { id: "global", label: "Global" },
  { id: "vix", label: "VIX" },
  { id: "india", label: "India" },
  { id: "uk", label: "UK" },
  { id: "news", label: "News" },
  { id: "crypto", label: "Crypto" },
  { id: "commodity", label: "Commodity" },
  { id: "forex", label: "Forex" },
  { id: "uae", label: "UAE" },
];

function MarketRow({
  item,
  onRemove,
}: {
  item: MarketItem;
  onRemove?: () => void;
}) {
  return (
    <Reorder.Item
      value={item}
      className="flex items-center gap-3 -mx-5 px-5 py-3.5 bg-background"
      dragListener={true}
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.3)", zIndex: 50 }}
    >
      {/* Drag handle (left side) */}
      <GripVertical size={18} strokeWidth={1.5} className="flex-shrink-0 cursor-grab text-muted-foreground/40 active:cursor-grabbing" />

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-foreground">{item.label}</p>
        {item.isCustom && (
          <p className="text-[11px] text-muted-foreground">Custom market</p>
        )}
      </div>

      {/* Remove (custom only) */}
      {item.isCustom && onRemove && (
        <Button variant="ghost" size="icon-xs" className="rounded-full bg-loss/15 text-loss hover:bg-loss/25" onClick={onRemove}>
          <X size={14} />
        </Button>
      )}
    </Reorder.Item>
  );
}

export function SettingsTab() {
  const [markets, setMarkets] = useState<MarketItem[]>(DEFAULT_MARKETS);

  const removeMarket = useCallback((id: string) => {
    setMarkets((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <div className="pb-8">
      {/* Manage Markets */}
      <div className="px-5 pt-5">
        <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">Manage Markets</h2>
        <p className="mb-4 text-[14px] text-muted-foreground">
          Drag to reorder your market tabs.
        </p>

        <Reorder.Group
          axis="y"
          values={markets}
          onReorder={setMarkets}
        >
          {markets.map((item) => (
            <MarketRow
              key={item.id}
              item={item}
              onRemove={item.isCustom ? () => removeMarket(item.id) : undefined}
            />
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
}
