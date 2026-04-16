import type { StockCompareData } from "./metrics";
import { formatPct } from "./metrics";

/**
 * Hand-authored insights for common pairs — the "Where they actually differ" card.
 * Falls back to a templated insight when a pair isn't in the map.
 */

const pairKey = (symbols: string[]) => [...symbols].sort().join("|");

const AUTHORED: Record<string, string> = {
  [pairKey(["AAPL", "NVDA"])]:
    "NVDA is growing revenue 3× faster than AAPL, but trades at a similar P/E — the market sees AAPL as a cash-flow machine and NVDA as priced for AI dominance holding up.",
  [pairKey(["AAPL", "MSFT"])]:
    "Both sit near 35× earnings, but MSFT is growing revenue 3× faster. If you're paying the same price, you're paying for different things — AAPL's durability vs MSFT's momentum.",
  [pairKey(["MSFT", "NVDA"])]:
    "NVDA is growing 3–4× faster, but MSFT is the customer — every Azure AI deployment runs on NVDA chips. Owning both isn't diversification; it's two angles on the same bet.",
  [pairKey(["AAPL", "MSFT", "NVDA"])]:
    "NVDA is the growth story, MSFT the scaled operator, AAPL the cash machine. They trade at similar multiples but for very different reasons — pick the story you believe in.",
  [pairKey(["NVDA", "AMD"])]:
    "AMD is the cheaper way to bet on AI chips — it trades at a lower P/E and has room to take share. NVDA is the proven winner. You're paying for certainty vs upside.",
  [pairKey(["GOOGL", "META"])]:
    "Both are ad businesses, but GOOGL is more diversified (Search + Cloud + YouTube) while META is still 97% ads. GOOGL trades cheaper on that diversification.",
  [pairKey(["TSLA", "RIVN"])]:
    "TSLA is profitable and scaling; RIVN is burning cash to get there. One is a story about execution, the other is a bet on survival-plus-execution.",
  [pairKey(["AMZN", "WMT"])]:
    "WMT is winning the retail race AMZN used to dominate — groceries and same-day delivery. AMZN's moat shifted to AWS and ads, which is why they trade at very different multiples.",
};

/**
 * Fallback: generate a data-driven insight from returns and valuation.
 */
function templatedInsight(data: StockCompareData[]): string {
  if (data.length < 2) {
    return "Add another stock to see where they actually differ.";
  }

  // Find the 1Y return leader and laggard
  const with1Y = data.filter((d) => d.return1Y != null);
  if (with1Y.length < 2) {
    return `Comparing ${data.map((d) => d.symbol).join(" · ")}. Scroll to see where the numbers diverge.`;
  }

  const sorted = [...with1Y].sort((a, b) => (b.return1Y ?? 0) - (a.return1Y ?? 0));
  const winner = sorted[0];
  const loser = sorted[sorted.length - 1];

  if (winner.symbol === loser.symbol) {
    return `Over the past year, all three moved in lockstep. Look to valuation and margin to tell them apart.`;
  }

  const winReturn = winner.return1Y ?? 0;
  const loseReturn = loser.return1Y ?? 0;
  const spread = winReturn - loseReturn;

  if (spread < 5) {
    return `${winner.symbol} and ${loser.symbol} have tracked within ${spread.toFixed(0)}% of each other over the past year. Differences live in valuation and margin, not performance.`;
  }

  return `Over the past year, ${winner.symbol} returned ${formatPct(winReturn)} while ${loser.symbol} returned ${formatPct(loseReturn)} — a ${spread.toFixed(0)} point spread. The divergence is usually the story.`;
}

export function getInsight(data: StockCompareData[]): string {
  if (data.length === 0) return "";
  const key = pairKey(data.map((d) => d.symbol));
  if (AUTHORED[key]) return AUTHORED[key];
  return templatedInsight(data);
}

/**
 * Suggest a smart default name for a compare list.
 */
export function suggestedName(symbols: string[]): string {
  if (symbols.length === 0) return "Untitled";
  if (symbols.length === 1) return symbols[0];

  // Shared-sector detection via authored groups
  const SECTOR_GROUPS: Record<string, string[]> = {
    "Semis": ["NVDA", "AMD", "AVGO", "INTC"],
    "Big Tech": ["AAPL", "MSFT", "GOOGL", "AMZN", "META"],
    "EVs": ["TSLA", "RIVN", "LCID", "NIO", "LI", "XPEV"],
    "Banks": ["JPM", "V"],
    "Streaming": ["NFLX"],
  };

  for (const [name, members] of Object.entries(SECTOR_GROUPS)) {
    const set = new Set(members);
    if (symbols.every((s) => set.has(s))) {
      return `${name} (${symbols.length})`;
    }
  }

  if (symbols.length === 2) return `${symbols[0]} vs ${symbols[1]}`;
  return `${symbols[0]} and ${symbols.length - 1} others`;
}
