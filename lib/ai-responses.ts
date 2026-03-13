import type { AISourcePage } from "./ai-suggestions";

// Badge syntax: [[SYMBOL:PRICE:CHANGE]] renders as inline colored chip
// Use positive numbers for gains (e.g., +1.2%), negative for losses (e.g., -0.8%)

const stockResponses: Record<string, string> = {
  valued: `Based on current fundamentals, the stock is trading at a forward P/E of 26x — slightly above its 5-year average of 22x. The premium is justified by strong revenue growth of ~8% YoY and expanding margins. The 52-week high signals near-term resistance, but the bull case remains intact if guidance holds. Consider trimming near resistance and adding on dips toward the 200-day MA.`,

  risks: `Key risks to watch: (1) Macro headwinds — rising yields compress growth multiples. (2) Competitive pressure from emerging players gaining market share. (3) FX headwinds given ~40% international revenue exposure. (4) Regulatory scrutiny in EU and US markets. The bear case targets ~15% downside, while the bull case anticipates a breakout above current highs on strong earnings beat.`,

  compare: `Relative to peers, the stock trades at a modest premium on a P/E basis, but at a discount on EV/EBITDA. Free cash flow generation is best-in-class, and the balance sheet is significantly stronger than competitors. The stock has outperformed the sector ETF [[XLK:210.40:+0.8%]] by ~12% over the past year, suggesting the premium valuation is warranted.`,

  options: `The options market is pricing in ~4.2% implied move for the next earnings event. IV rank is at 68th percentile — elevated but not extreme. Put/call ratio is 0.82, slightly bearish. Unusual activity: large call sweeps were detected at the 195 and 200 strike for the next expiry, suggesting institutional positioning for upside. Implied volatility crush is expected post-earnings.`,
};

const marketResponses: Record<string, string> = {
  volatility: `Today's volatility is driven by a triple catalyst: (1) hotter-than-expected CPI print at 3.4% vs 3.1% expected [[VIX:19.8:+2.1]], (2) Fed officials signaling a higher-for-longer stance, and (3) tech earnings misses from two major names. The S&P 500 [[SPY:512.30:-0.9%]] is testing the 50-day MA. Bond yields [[TLT:95.2:-0.6%]] spiking are adding to equity pressure — watch for support at the 200-day.`,

  momentum: `The strongest momentum plays today: large-caps with earnings beats are seeing sustained follow-through. The QQQ [[QQQ:438.60:+1.1%]] is leading, driven by AI/cloud tailwinds. Breadth is mixed — advancers/decliners at 1.3:1. High-momentum names are concentrated in Technology and Industrials. The weakest momentum is in REITs and Utilities given the rate environment.`,

  rotation: `This looks like a classic sector rotation rather than a broad selloff. Defensive sectors (Utilities [[XLU:68.4:+0.9%]], Healthcare [[XLV:142.8:+0.6%]]) are catching inflows while growth names pull back. The Russell 2000 [[IWM:205.3:-0.4%]] is underperforming large caps, consistent with risk-off rotation. Historically, rotations of this type last 2-4 weeks before the trend reasserts.`,

  sectors: `Today's sector leadership: Energy [[XLE:88.4:+1.8%]] is surging on crude oil strength. Financials [[XLF:40.2:+1.1%]] are benefiting from yield curve steepening. Technology [[XLK:210.4:-0.6%]] is the laggard — profit-taking after a strong run. Healthcare is defensive bid-up. The overall theme is "value over growth" as rates stay elevated.`,
};

const watchlistResponses: Record<string, string> = {
  gainer: `The move is driven by a combination of factors: (1) Analyst upgrade from Neutral to Buy with a revised price target of +18% upside, (2) positive channel checks suggesting better-than-expected demand, and (3) short squeeze dynamics — short interest is ~12% of float. The stock has broken above key technical resistance. Near-term target aligns with the 52-week high. Momentum is strong but RSI is at 72 — slightly overbought.`,

  sentiment: `Overall watchlist sentiment is cautiously bullish. 60% of your names are outperforming the S&P 500 [[SPY:512.30:+0.4%]] over the past month. Top performers are in Tech and Energy. Three names are showing bearish divergences on technicals. The AI-driven names are seeing unusually high options activity. Macro risk remains the key headwind — watch Fed commentary this week.`,

  breakout: `Two names on your watchlist are approaching technical breakout levels: one is testing all-time highs with volume 40% above average — a strong confirmation signal. Another is breaking out of a 6-week consolidation pattern with improving breadth. Breakouts with volume above the 20-day average have historically resulted in ~8% follow-through over the next 3 weeks in similar setups.`,

  catalysts: `Upcoming catalysts for your watchlist: Earnings season kicks off in 2 weeks — 4 of your holdings report. One name has an investor day next Thursday. Two names go ex-dividend this week. Macro events to watch: FOMC minutes release Wednesday, CPI data Thursday. Options expiry Friday could amplify moves in high-IV names.`,
};

const etfResponses: Record<string, string> = {
  "risk-adjusted": `On a Sharpe ratio basis, [[SCHD:78.20:+0.3%]] leads dividend ETFs with a 3-year Sharpe of 0.92. For pure equity growth, [[QQQ:438.60:+1.1%]] has the highest absolute returns but higher volatility (Sharpe 0.74). [[VTI:232.4:+0.5%]] offers the best diversification-adjusted return for a core holding. If prioritizing risk-adjusted returns, a blended SCHD + VTI position outperforms on a rolling 3-year basis.`,

  compare: `This month: Sector ETFs showing strength are Energy [[XLE:88.4:+1.8%]], Financials [[XLF:40.2:+1.1%]], and Industrials [[XLI:118.6:+0.9%]]. Underperforming: Technology [[XLK:210.4:-0.6%]], Communication Services [[XLC:82.1:-0.4%]], Real Estate [[XLRE:38.2:-0.8%]]. The rotation is consistent with a rising rate environment. Defensive names (XLV, XLP) are outperforming on a risk-adjusted basis.`,

  correlation: `QQQ [[QQQ:438.6:+1.1%]] and SPY [[SPY:512.3:+0.4%]] have a 90-day correlation of 0.94 — highly correlated, so holding both provides minimal diversification. QQQ has higher beta (1.18 vs SPY) and tilts heavily toward mega-cap tech (~55% in top 10 holdings). For genuine diversification, add small-cap [[IWM:205.3:-0.4%]] or international [[VEA:48.2:+0.2%]] exposure to reduce correlation below 0.7.`,

  dividend: `Top dividend ETFs for income: [[SCHD:78.2:+0.3%]] (3.8% yield, quality dividend growth focus), [[VYM:115.4:+0.5%]] (3.1% yield, broad dividend coverage), [[DVY:118.6:+0.2%]] (4.2% yield, higher income but more sector concentration). For tax-efficient income, SCHD is preferred in taxable accounts — qualified dividends dominate. DVY provides the highest current yield but lower dividend growth rate (4% vs 8% for SCHD).`,
};

const portfolioResponses: Record<string, string> = {
  diversified: `Your portfolio shows moderate concentration risk — top 3 holdings represent ~42% of total value, which is above the recommended 25-30% threshold for a well-diversified portfolio. Sector breakdown skews heavily toward Technology (38%) vs S&P 500's 29%. To improve diversification, consider reducing tech exposure and adding Healthcare or Industrials. Geographic diversification is limited — adding international exposure (20-25% of portfolio) would reduce US-specific risk.`,

  underperform: `Positions underperforming vs their respective benchmarks over the last 3 months: energy names are lagging the XLE ETF by 4-6%, suggesting company-specific headwinds beyond macro. Small-cap positions are broadly underperforming vs IWM in this high-rate environment. Consider reviewing thesis for positions that have underperformed for more than 2 consecutive quarters without a clear recovery catalyst.`,

  exposure: `Current sector exposure: Technology 38% (overweight vs S&P 29%), Consumer Discretionary 18% (overweight), Energy 12% (in-line), Financials 10% (underweight), Healthcare 8% (underweight). The overweight in cyclicals increases portfolio beta to approximately 1.22, meaning your portfolio amplifies both gains and losses relative to the market. In a risk-off scenario, this positioning would likely underperform a market-weight allocation.`,

  rebalance: `Rebalancing signals: Your Technology allocation has drifted 9% above target due to outperformance — a trim would lock in gains and realign risk. Two positions have grown beyond their intended weight. Rule of thumb: rebalance when any position exceeds ±5% of target weight, or quarterly. Given current market conditions, a gradual rebalance (trimming over 2-3 weeks) is preferred over a single large trade to avoid adverse market impact.`,
};

const exploreStocksResponses: Record<string, string> = {
  sectors: `This week's top performing sectors: Energy (+3.2%) on crude strength [[XLE:88.4:+1.8%]], Industrials (+2.1%) on infrastructure spend, and Materials (+1.8%) on China reopening optimism. Technology (-0.6%) [[XLK:210.4:-0.6%]] is the only major laggard, facing multiple compression from elevated yields. The breadth within Energy is unusually strong — even small caps are participating, which typically confirms sector-level momentum.`,

  breakout: `Current technical breakouts to watch: Several large-cap tech names are testing all-time highs with volume confirmation. In Energy, two integrated majors are breaking out of 8-week bases — classic bullish setup. Mid-cap Industrials are showing the strongest relative strength vs the S&P 500 [[SPY:512.3:+0.4%]]. For breakout trading, look for stocks with 52-week high proximity + above-average volume + improving earnings revisions.`,

  "growth vs value": `Growth has underperformed Value by 4.2% over the past 3 months, largely driven by the rate environment — growth stocks are longer-duration assets that suffer when yields rise. The Russell 1000 Growth [[IWF:318.4:-0.3%]] vs Value [[IWD:170.8:+0.6%]] spread is at its widest in 6 months. Historical precedent suggests the gap closes when the 10-year yield peaks. Watch for a reversal signal if CPI cools or Fed pivots language.`,

  tech: `The tech rally is being driven by three intersecting themes: (1) AI infrastructure capex — hyperscalers are increasing spend dramatically, lifting semiconductors and data center names. (2) Cloud re-acceleration — enterprise software is seeing improving bookings after a 12-month digestion period. (3) Multiple re-rating — with rate hike cycle near its end, growth multiples are recovering. The rally has breadth — it's not just mega-cap. Small-cap semis [[SOXX:228.6:+1.4%]] are participating.`,
};

function matchKeyword(message: string, responses: Record<string, string>): string | null {
  const lower = message.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (lower.includes(key)) return response;
  }
  return null;
}

const defaultResponses = [
  `That's a great question. Based on current market conditions, the data suggests a nuanced picture. The S&P 500 [[SPY:512.30:+0.4%]] is showing resilience above key support levels, though breadth has been narrowing. I'd recommend focusing on high-quality names with strong free cash flow and pricing power in this environment. Macro uncertainty remains elevated — position sizing and diversification are key.`,
  `Looking at the current data, there are some interesting signals worth tracking. Market internals are mixed — large-caps are outperforming small-caps, which is typical late-cycle behavior. The VIX [[VIX:19.8:+2.1]] is elevated but not at panic levels. For individual stock selection, focus on earnings revision trends and relative strength vs the benchmark.`,
  `Based on recent price action and fundamental data, the setup here warrants careful analysis. Key levels to watch are near-term support and resistance. Technically, the 50-day and 200-day MAs are converging, which often precedes a significant move in either direction. Volume patterns will be the key tell — watch for distribution days (down days on heavy volume) as an early warning signal.`,
];

export function generateAIResponse(userMessage: string, source: AISourcePage): string {
  // Try source-specific matching first
  let response: string | null = null;

  if (source.type === "stock-detail") {
    response = matchKeyword(userMessage, stockResponses);
  } else if (source.type === "markets") {
    response = matchKeyword(userMessage, marketResponses);
  } else if (source.type === "watchlist") {
    response = matchKeyword(userMessage, watchlistResponses);
  } else if (source.type === "explore-etf") {
    response = matchKeyword(userMessage, etfResponses);
  } else if (source.type === "portfolio") {
    response = matchKeyword(userMessage, portfolioResponses);
  } else if (source.type === "explore-stocks") {
    response = matchKeyword(userMessage, exploreStocksResponses);
  }

  // Cross-topic fallback matching
  if (!response) {
    response =
      matchKeyword(userMessage, stockResponses) ||
      matchKeyword(userMessage, marketResponses) ||
      matchKeyword(userMessage, etfResponses) ||
      matchKeyword(userMessage, portfolioResponses) ||
      matchKeyword(userMessage, exploreStocksResponses);
  }

  // Default random response
  if (!response) {
    response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  // If stock detail, inject symbol into response
  if (source.type === "stock-detail") {
    return response.replace(/\bthe stock\b/gi, source.symbol);
  }

  return response;
}
