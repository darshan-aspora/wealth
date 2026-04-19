"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, GitCompareArrows, X, GripVertical, Plus, Check } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  onAddStock: () => void;
  onQuickStart: (symbols: string[]) => void;
}

interface StockEntry {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const STOCK_LIST: StockEntry[] = [
  { symbol: "AAPL", name: "Apple", price: 232.1, change: 1.2 },
  { symbol: "MSFT", name: "Microsoft", price: 428.7, change: -0.4 },
  { symbol: "NVDA", name: "NVIDIA", price: 892.4, change: 2.8 },
  { symbol: "AMZN", name: "Amazon", price: 184.3, change: 0.9 },
  { symbol: "GOOGL", name: "Alphabet", price: 168.9, change: -1.1 },
  { symbol: "META", name: "Meta Platforms", price: 514.2, change: 1.5 },
  { symbol: "TSLA", name: "Tesla", price: 241.6, change: -2.3 },
  { symbol: "BRK.B", name: "Berkshire Hathaway", price: 441.8, change: 0.3 },
  { symbol: "AVGO", name: "Broadcom", price: 1692.0, change: 1.8 },
  { symbol: "LLY", name: "Eli Lilly", price: 798.2, change: -0.7 },
  { symbol: "JPM", name: "JPMorgan", price: 206.4, change: 0.5 },
  { symbol: "V", name: "Visa", price: 278.9, change: 0.2 },
  { symbol: "UNH", name: "UnitedHealth", price: 521.3, change: -0.9 },
  { symbol: "MA", name: "Mastercard", price: 465.1, change: 0.4 },
  { symbol: "XOM", name: "Exxon Mobil", price: 112.8, change: -1.5 },
  { symbol: "HD", name: "Home Depot", price: 362.4, change: 0.6 },
  { symbol: "PG", name: "Procter & Gamble", price: 164.9, change: 0.1 },
  { symbol: "COST", name: "Costco", price: 892.7, change: 0.8 },
  { symbol: "JNJ", name: "Johnson & Johnson", price: 156.1, change: -0.3 },
  { symbol: "ABBV", name: "AbbVie", price: 189.4, change: 1.1 },
  { symbol: "CRM", name: "Salesforce", price: 298.6, change: -1.8 },
  { symbol: "BAC", name: "Bank of America", price: 44.3, change: 0.7 },
  { symbol: "NFLX", name: "Netflix", price: 691.2, change: 2.1 },
  { symbol: "AMD", name: "AMD", price: 158.4, change: 3.2 },
  { symbol: "KO", name: "Coca-Cola", price: 63.8, change: -0.2 },
  { symbol: "WMT", name: "Walmart", price: 91.4, change: 0.5 },
  { symbol: "PEP", name: "PepsiCo", price: 161.2, change: 0.0 },
  { symbol: "MRK", name: "Merck", price: 126.5, change: -0.8 },
  { symbol: "ADBE", name: "Adobe", price: 482.7, change: -0.6 },
  { symbol: "INTC", name: "Intel", price: 34.2, change: -2.7 },
  { symbol: "PLTR", name: "Palantir", price: 24.8, change: 4.2 },
  { symbol: "COIN", name: "Coinbase", price: 228.4, change: 3.1 },
  { symbol: "RIVN", name: "Rivian", price: 12.7, change: -3.4 },
  { symbol: "NKE", name: "Nike", price: 78.3, change: -1.9 },
  { symbol: "DIS", name: "Disney", price: 112.4, change: -0.4 },
  { symbol: "BA", name: "Boeing", price: 174.3, change: -2.1 },
  { symbol: "GS", name: "Goldman Sachs", price: 467.2, change: 0.8 },
  { symbol: "CAT", name: "Caterpillar", price: 342.8, change: 1.0 },
  { symbol: "SBUX", name: "Starbucks", price: 94.7, change: -1.4 },
  { symbol: "UBER", name: "Uber", price: 76.8, change: 0.9 },
];

export function EmptyState({ onQuickStart }: EmptyStateProps) {
  const [orderedSymbols, setOrderedSymbols] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(orderedSymbols), [orderedSymbols]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return STOCK_LIST.slice(0, 12);
    const q = query.trim().toLowerCase();
    return STOCK_LIST.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q),
    ).slice(0, 20);
  }, [query]);

  const toggle = (symbol: string) => {
    setOrderedSymbols((prev) => {
      if (prev.includes(symbol)) return prev.filter((s) => s !== symbol);
      return [...prev, symbol];
    });
  };

  const stockBySymbol = useMemo(() => {
    const m = new Map<string, StockEntry>();
    for (const s of STOCK_LIST) m.set(s.symbol, s);
    return m;
  }, []);

  const selectedStocks = orderedSymbols
    .map((sym) => stockBySymbol.get(sym))
    .filter((s): s is StockEntry => s !== undefined);

  return (
    <div className="flex flex-col h-full">
      {/* ── TOP CHROME: search bar + dropdown (sits above body) ── */}
      <div className="shrink-0 relative z-50">
        {/* Search bar */}
        <div className={cn("px-4 -mt-px pb-3 bg-background", searchOpen && "border-b border-border/20")}>
          <div className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3.5 py-2.5">
            <Search size={16} strokeWidth={2.2} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!searchOpen) setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search and add"
              className="flex-1 min-w-0 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
            />
            {searchOpen && (
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                  inputRef.current?.blur();
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
              >
                <X size={14} strokeWidth={2.2} />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown results — floats over body, doesn't push content */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              key="dropdown"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 top-full bg-background rounded-b-2xl shadow-lg overflow-hidden"
            >
              <div className="max-h-[50vh] overflow-y-auto">
                {searchResults.map((s) => {
                  const isSelected = selectedSet.has(s.symbol);
                  return (
                    <button
                      key={s.symbol}
                      onClick={() => toggle(s.symbol)}
                      className="flex w-full items-center gap-3 px-4 h-[64px] text-left active:bg-muted"
                    >
                      <div className="h-8 w-8 shrink-0 rounded-full bg-muted-foreground/25" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-foreground truncate">{s.name}</p>
                        <p className="text-[12px] text-muted-foreground leading-tight">{s.symbol}</p>
                      </div>
                      <div className="text-right shrink-0 mr-2">
                        <p className="text-[14px] font-semibold tabular-nums text-foreground">{s.price.toFixed(2)}</p>
                        <p className={cn("text-[12px] font-semibold tabular-nums", s.change >= 0 ? "text-gain" : "text-loss")}>
                          {s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}%
                        </p>
                      </div>
                      {isSelected ? (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground">
                          <Check size={14} strokeWidth={2.5} className="text-background" />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60">
                          <Plus size={14} strokeWidth={2.2} className="text-muted-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── DARK OVERLAY between top chrome and body when search is open ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-40 bg-black/50"
            style={{ top: 0 }}
            onClick={() => { setSearchOpen(false); setQuery(""); inputRef.current?.blur(); }}
          />
        )}
      </AnimatePresence>

      {/* ── BODY: illustration + selected stocks ── */}
      <div className="flex-1 min-h-0 overflow-y-auto relative z-30">
        {/* Illustration + prompt */}
        {orderedSymbols.length < 2 && selectedStocks.length === 0 && (
          <div className="flex flex-col items-center px-6 pt-12 pb-8">
            <div className="h-20 w-20 rounded-3xl bg-muted mb-5" />
            <p className="text-[20px] font-bold text-foreground text-center leading-snug">
              Pick two or more to see
              <br />
              how they stack up
            </p>
            <p className="text-[14px] text-muted-foreground text-center mt-2 max-w-[300px]">
              Not just the numbers. The story behind them.
            </p>
          </div>
        )}

        {/* Selected stocks — draggable */}
        {selectedStocks.length > 0 && (
          <Reorder.Group
            axis="y"
            values={orderedSymbols}
            onReorder={setOrderedSymbols}
            className="list-none"
          >
            {selectedStocks.map((stock) => (
              <Reorder.Item
                key={stock.symbol}
                value={stock.symbol}
                className="flex w-full items-center gap-2 px-4 py-3 bg-background cursor-grab active:cursor-grabbing"
                whileDrag={{ scale: 1.02, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
              >
                <GripVertical size={16} strokeWidth={1.8} className="shrink-0 text-muted-foreground/40 touch-none" />
                <div className="h-8 w-8 shrink-0 rounded-full bg-muted-foreground/25" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-foreground truncate">{stock.name}</p>
                  <p className="text-[12px] text-muted-foreground leading-tight">{stock.symbol}</p>
                </div>
                <div className="text-right shrink-0 mr-2">
                  <p className="text-[14px] font-semibold tabular-nums text-foreground">{stock.price.toFixed(2)}</p>
                  <p className={cn("text-[12px] font-semibold tabular-nums", stock.change >= 0 ? "text-gain" : "text-loss")}>
                    {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                  </p>
                </div>
                <button
                  onClick={() => toggle(stock.symbol)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted active:scale-95 transition-transform"
                >
                  <X size={14} strokeWidth={2.2} className="text-muted-foreground" />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* ── STICKY COMPARE BUTTON ── */}
      {orderedSymbols.length >= 2 && (
        <div className="shrink-0 border-t border-border/40 bg-background px-4 py-3 relative z-30">
          <button
            onClick={() => onQuickStart(orderedSymbols)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-[15px] font-semibold text-background active:scale-[0.99] transition-transform"
          >
            <GitCompareArrows size={17} strokeWidth={2.2} />
            Compare {orderedSymbols.length} stocks
          </button>
        </div>
      )}
    </div>
  );
}
