"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  GripVertical, Plus, X,
  Globe, TrendingUp, Newspaper, Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketItem {
  id: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  isCustom?: boolean;
}

const DEFAULT_MARKETS: MarketItem[] = [
  { id: "us", label: "US Markets", icon: TrendingUp, enabled: true },
  { id: "global", label: "Global", icon: Globe, enabled: true },
  { id: "news", label: "News", icon: Newspaper, enabled: true },
  { id: "india", label: "India", icon: Flag, enabled: true },
  { id: "uae", label: "UAE", icon: Flag, enabled: true },
  { id: "uk", label: "UK", icon: Flag, enabled: true },
];

interface CustomMarketForm {
  name: string;
  indices: string;
  sectors: string;
}

function MarketRow({
  item,
  onToggle,
  onRemove,
}: {
  item: MarketItem;
  onToggle: () => void;
  onRemove?: () => void;
}) {
  return (
    <Reorder.Item
      value={item}
      className="flex items-center gap-2 border-b border-border/30 bg-card px-4 py-3.5 last:border-b-0"
      dragListener={true}
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.3)", zIndex: 50 }}
    >
      {/* Drag handle */}
      <GripVertical size={18} strokeWidth={1.5} className="flex-shrink-0 cursor-grab text-muted-foreground/40 active:cursor-grabbing" />

      {/* Icon */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
        <item.icon size={18} strokeWidth={1.7} className="text-foreground" />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-foreground">{item.label}</p>
        {item.isCustom && (
          <p className="text-[11px] text-muted-foreground">Custom market</p>
        )}
      </div>

      {/* Remove (custom only) */}
      {item.isCustom && onRemove && (
        <button
          onClick={onRemove}
          className="mr-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-loss/15 transition-colors active:bg-loss/25"
        >
          <X size={14} className="text-loss" />
        </button>
      )}

      {/* Toggle */}
      <button
        onClick={onToggle}
        className={cn(
          "relative h-[28px] w-[48px] flex-shrink-0 rounded-full transition-colors duration-200",
          item.enabled ? "bg-gain" : "bg-muted"
        )}
      >
        <div
          className={cn(
            "absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform duration-200",
            item.enabled ? "translate-x-[23px]" : "translate-x-[3px]"
          )}
        />
      </button>
    </Reorder.Item>
  );
}

export function SettingsTab() {
  const [markets, setMarkets] = useState<MarketItem[]>(DEFAULT_MARKETS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<CustomMarketForm>({ name: "", indices: "", sectors: "" });

  const toggleMarket = useCallback((id: string) => {
    setMarkets((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  }, []);

  const removeMarket = useCallback((id: string) => {
    setMarkets((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const createMarket = () => {
    if (!form.name.trim()) return;
    const newMarket: MarketItem = {
      id: `custom-${Date.now()}`,
      label: form.name.trim(),
      icon: Globe,
      enabled: true,
      isCustom: true,
    };
    setMarkets((prev) => [...prev, newMarket]);
    setForm({ name: "", indices: "", sectors: "" });
    setShowCreateForm(false);
  };

  const enabledCount = markets.filter((m) => m.enabled).length;

  return (
    <div className="pb-8">
      {/* Manage Markets */}
      <div className="px-5 pt-5">
        <h2 className="mb-0.5 text-[18px] font-bold tracking-tight">Manage Markets</h2>
        <p className="mb-4 text-[14px] text-muted-foreground">
          Drag to reorder, toggle to show or hide. {enabledCount} of {markets.length} visible.
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
                onToggle={() => toggleMarket(item.id)}
                onRemove={item.isCustom ? () => removeMarket(item.id) : undefined}
              />
            ))}
          </Reorder.Group>
        </div>

        <p className="mt-2 text-[12px] text-muted-foreground/50">
          Tab order matches the list above. First enabled tab is the default.
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
                <div className="px-4 pt-4 pb-3">
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Market Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. My Tech Watchlist"
                    className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none"
                  />
                </div>

                {/* Indices */}
                <div className="border-t border-border/30 px-4 pt-3 pb-3">
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Indices to Track
                  </label>
                  <input
                    type="text"
                    value={form.indices}
                    onChange={(e) => setForm((p) => ({ ...p, indices: e.target.value }))}
                    placeholder="e.g. NASDAQ, S&P 500, FTSE 100"
                    className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none"
                  />
                </div>

                {/* Sectors */}
                <div className="border-t border-border/30 px-4 pt-3 pb-3">
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Sectors
                  </label>
                  <input
                    type="text"
                    value={form.sectors}
                    onChange={(e) => setForm((p) => ({ ...p, sectors: e.target.value }))}
                    placeholder="e.g. Technology, Healthcare, Energy"
                    className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-border/30 px-4 py-3.5">
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
