"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { GripVertical, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MarketItem {
  id: string;
  label: string;
  isCustom?: boolean;
}

const DEFAULT_MARKETS: MarketItem[] = [
  { id: "us", label: "US" },
  { id: "global", label: "Global" },
  { id: "india", label: "India" },
  { id: "uk", label: "UK" },
  { id: "news", label: "News" },
  { id: "crypto", label: "Crypto" },
  { id: "commodity", label: "Commodity" },
  { id: "forex", label: "Forex" },
  { id: "uae", label: "UAE" },
];

interface CustomMarketForm {
  name: string;
  indices: string;
  sectors: string;
}

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
      className="flex items-center gap-3 border-b border-border/30 bg-card px-5 py-3.5 last:border-b-0"
      dragListener={true}
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.3)", zIndex: 50 }}
    >
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

      {/* Drag handle (right side) */}
      <GripVertical size={18} strokeWidth={1.5} className="flex-shrink-0 cursor-grab text-muted-foreground/40 active:cursor-grabbing" />
    </Reorder.Item>
  );
}

export function SettingsTab() {
  const [markets, setMarkets] = useState<MarketItem[]>(DEFAULT_MARKETS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<CustomMarketForm>({ name: "", indices: "", sectors: "" });

  const removeMarket = useCallback((id: string) => {
    setMarkets((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const createMarket = () => {
    if (!form.name.trim()) return;
    const newMarket: MarketItem = {
      id: `custom-${Date.now()}`,
      label: form.name.trim(),
      isCustom: true,
    };
    setMarkets((prev) => [...prev, newMarket]);
    setForm({ name: "", indices: "", sectors: "" });
    setShowCreateForm(false);
  };

  return (
    <div className="pb-8">
      {/* Manage Markets */}
      <div className="px-5 pt-5">
        <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">Manage Markets</h2>
        <p className="mb-4 text-[14px] text-muted-foreground">
          Drag to reorder your market tabs.
        </p>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <Reorder.Group
            axis="y"
            values={markets}
            onReorder={setMarkets}
            className="overflow-hidden"
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

        <p className="mt-2 text-[12px] text-muted-foreground/50">
          Tab order matches the list above.
        </p>
      </div>

      {/* Create My Market */}
      <div className="mt-6 px-5">
        <div className="mb-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold tracking-tight">Create My Market</h2>
            <p className="mt-0.5 text-[14px] text-muted-foreground">
              Build a custom market tab with your own data
            </p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {!showCreateForm ? (
            <motion.button
              key="create-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-card py-4 text-[15px] font-semibold text-muted-foreground transition-colors active:bg-muted/30"
            >
              <Plus size={18} />
              New Custom Market
            </motion.button>
          ) : (
            <motion.div
              key="create-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                {/* Market Name */}
                <div className="px-5 pt-4 pb-3">
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Market Name
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. My Tech Watchlist"
                    className="rounded-xl border-border/60 bg-background px-3.5 py-2.5 text-[15px] font-medium placeholder:text-muted-foreground/40 focus:border-foreground/30"
                  />
                </div>

                {/* Indices */}
                <div className="border-t border-border/30 px-5 pt-3 pb-3">
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Indices to Track
                  </label>
                  <Input
                    value={form.indices}
                    onChange={(e) => setForm((p) => ({ ...p, indices: e.target.value }))}
                    placeholder="e.g. NASDAQ, S&P 500, FTSE 100"
                    className="rounded-xl border-border/60 bg-background px-3.5 py-2.5 text-[15px] font-medium placeholder:text-muted-foreground/40 focus:border-foreground/30"
                  />
                </div>

                {/* Sectors */}
                <div className="border-t border-border/30 px-5 pt-3 pb-3">
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Sectors
                  </label>
                  <Input
                    value={form.sectors}
                    onChange={(e) => setForm((p) => ({ ...p, sectors: e.target.value }))}
                    placeholder="e.g. Technology, Healthcare, Energy"
                    className="rounded-xl border-border/60 bg-background px-3.5 py-2.5 text-[15px] font-medium placeholder:text-muted-foreground/40 focus:border-foreground/30"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-border/30 px-5 py-3.5">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setForm({ name: "", indices: "", sectors: "" });
                    }}
                    className="flex-1 rounded-xl border border-border/60 py-2.5 text-[14px] font-semibold text-muted-foreground transition-colors active:bg-muted/30"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createMarket}
                    disabled={!form.name.trim()}
                    className={cn(
                      "flex-1 rounded-xl py-2.5 text-[14px] font-semibold transition-colors",
                      form.name.trim()
                        ? "bg-foreground text-background active:opacity-80"
                        : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                    )}
                  >
                    Create Market
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
