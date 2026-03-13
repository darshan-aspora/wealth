export type AISourcePage =
  | { type: "explore-stocks" }
  | { type: "explore-etf" }
  | { type: "explore-options" }
  | { type: "explore-baskets" }
  | { type: "stock-detail"; symbol: string; name: string }
  | { type: "watchlist"; topGainer?: string }
  | { type: "portfolio" }
  | { type: "markets" }
  | { type: "home" };

export function getSourceLabel(source: AISourcePage): string {
  switch (source.type) {
    case "explore-stocks": return "Explore · Stocks";
    case "explore-etf": return "Explore · ETF";
    case "explore-options": return "Explore · Options";
    case "explore-baskets": return "Explore · Baskets";
    case "stock-detail": return source.symbol;
    case "watchlist": return "Watchlist";
    case "portfolio": return "Portfolio";
    case "markets": return "Markets";
    case "home": return "Home";
  }
}

export function getSuggestions(source: AISourcePage): string[] {
  switch (source.type) {
    case "explore-stocks":
      return [
        "What are the top performing sectors this week?",
        "Which stocks are showing breakout patterns?",
        "Compare growth vs value performance right now",
        "What's driving the tech rally?",
      ];
    case "explore-etf":
      return [
        "Which ETF has the best risk-adjusted returns?",
        "How do sector ETFs compare this month?",
        "QQQ vs SPY — which is stronger?",
        "Best ETFs for dividend income right now?",
      ];
    case "explore-options":
      return [
        "What options strategies work in this market?",
        "Which stocks have unusually high IV right now?",
        "Explain the current put/call ratio",
        "Any unusual options activity today?",
      ];
    case "explore-baskets":
      return [
        "Which basket matches a moderate risk profile?",
        "How do the CAGR returns compare across baskets?",
        "Am I overweight in tech with these baskets?",
        "What's the minimum to start with a basket?",
      ];
    case "stock-detail": {
      const s = source.symbol;
      const n = source.name;
      return [
        `Is ${s} fairly valued right now?`,
        `What are the main risks for ${n} in Q2?`,
        `How does ${s} compare to its peers?`,
        `What's the options market saying about ${s}?`,
      ];
    }
    case "watchlist":
      return [
        source.topGainer
          ? `Why is ${source.topGainer} up today?`
          : "Which watchlist stocks are breaking out?",
        "What's the overall sentiment of my watchlist?",
        "Which stocks should I be concerned about?",
        "Any upcoming catalysts for my watchlist?",
      ];
    case "portfolio":
      return [
        "Is my portfolio well diversified?",
        "Which positions are underperforming?",
        "What's my current sector exposure?",
        "When should I consider rebalancing?",
      ];
    case "markets":
      return [
        "What's causing today's market volatility?",
        "Which movers have the strongest momentum?",
        "Is this a sector rotation or broad selloff?",
        "What sectors are leading the market today?",
      ];
    case "home":
      return [
        "What's the market doing today?",
        "Any major earnings announcements this week?",
        "Which sectors are most active right now?",
        "What should I be watching closely?",
      ];
  }
}
