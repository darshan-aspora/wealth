// ─── Stock Detail Mock Data ──────────────────────────────────────────────────
// Centralized mock data for all stock detail page components.
// Uses seeded randomness for deterministic, consistent data per symbol.

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

export function hashSymbol(symbol: string): number {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) {
    h = (h * 31 + symbol.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ─── AI One-Liners ──────────────────────────────────────────────────────────

export const AI_ONE_LINERS: Record<string, string> = {
  AAPL: "Trading near 3-month highs after strong Mac and Services revenue beat expectations.",
  MSFT: "Pulling back slightly as cloud growth moderates — Azure still growing 29% YoY.",
  GOOGL: "Steady gains on strong Search ad revenue and YouTube momentum.",
  AMZN: "Rallying on AWS re-acceleration and improving retail margins.",
  NVDA: "Under pressure as chip sector sells off on tariff concerns despite record data center revenue.",
  META: "Surging on Reels monetization progress and cost discipline paying off.",
  TSLA: "Volatile session — deliveries beat but margin compression concerns linger.",
  AMD: "Dipping with broader semis — MI300 AI chip demand remains strong in enterprise.",
  JPM: "Steady as rising NII offsets normalization in trading revenue.",
  NFLX: "Near all-time highs — ad tier subscriber growth exceeding expectations.",
  AVGO: "Consolidating after VMware integration boosts recurring revenue mix.",
  COST: "Grinding higher on membership renewal rates at record 93.4%.",
  QQQ: "Momentum remains driven by mega-cap tech earnings and AI leadership across the NASDAQ-100.",
  SPY: "Broad market exposure is holding near highs as earnings breadth and macro resilience support sentiment.",
  IWM: "Small-cap participation is improving, though rate sensitivity still makes this one more volatile than large-cap beta.",
  GLD: "Safe-haven demand and central bank buying continue to support gold-backed ETF inflows.",
  VTI: "Ultra-low-cost total-market exposure keeps VTI a core allocation for long-term US equity investors.",
};

// ─── AI Briefings ───────────────────────────────────────────────────────────

export interface AIBriefing {
  summary: string;
  bullCase: { target: number; thesis: string };
  bearCase: { target: number; thesis: string };
  wildCard: { label: string; thesis: string };
  sources: string;
}

export const AI_BRIEFINGS: Record<string, AIBriefing> = {
  AAPL: {
    summary: "Apple continues to dominate the premium smartphone market with 35% global revenue share. The Services segment ($24B/quarter) is now its fastest-growing unit, with 44% gross margins vs 37% for hardware. iPhone 16 cycle is tracking ahead of iPhone 15, and the installed base of 2.2B active devices creates a recurring revenue flywheel that's still underappreciated by the market.",
    bullCase: { target: 275, thesis: "Services hits $100B run rate by 2027; Apple Intelligence drives an iPhone upgrade supercycle." },
    bearCase: { target: 185, thesis: "China competition intensifies; EU regulation forces App Store fee cuts, compressing Services margins." },
    wildCard: { label: "Apple Car", thesis: "Project Titan pivots to robotaxi partnership — could unlock $50B TAM if executed." },
    sources: "10-K filing, Q1 2026 earnings call, IDC smartphone data",
  },
  NVDA: {
    summary: "NVIDIA is the undisputed leader in AI accelerators, commanding 80%+ market share in data center GPUs. Revenue grew 94% YoY to $35B last quarter, driven by Blackwell architecture demand from hyperscalers. The company's CUDA software moat makes switching costs extremely high, and the AI infrastructure buildout is still in early innings with <5% of data center GPUs upgraded for AI workloads.",
    bullCase: { target: 180, thesis: "Blackwell demand exceeds supply through 2027; software licensing adds high-margin recurring revenue." },
    bearCase: { target: 85, thesis: "Custom silicon from Google (TPU), Amazon (Trainium), and AMD erodes GPU monopoly." },
    wildCard: { label: "AI Regulation", thesis: "US export controls expand to more countries — could lose 15% of data center revenue overnight." },
    sources: "10-K filing, GTC 2026 keynote, SemiAnalysis estimates",
  },
  MSFT: {
    summary: "Microsoft's cloud-first strategy is paying off — Azure grew 29% and now represents 40% of total revenue. Copilot AI features are driving Office 365 ARPU expansion, with enterprise adoption at 40% of Fortune 500. The LinkedIn and Gaming segments provide diversification, and the company's $75B free cash flow enables aggressive capital returns.",
    bullCase: { target: 510, thesis: "Copilot becomes a must-have, driving 15%+ ARPU uplift across Office 365's 400M+ seats." },
    bearCase: { target: 350, thesis: "Azure growth decelerates to low-20s% as enterprises optimize cloud spending." },
    wildCard: { label: "Activision Synergies", thesis: "Gaming segment could surprise with mobile monetization — $20B revenue potential by 2027." },
    sources: "10-K filing, Q2 2026 earnings call, Gartner cloud data",
  },
  AMZN: {
    summary: "Amazon is executing a rare double act: AWS re-accelerated to 19% growth while retail margins expanded to a record 6.2%. The advertising business ($14B/quarter) is now the fastest-growing segment. Prime membership renewals hit 97%, and same-day delivery coverage expanded to 90% of US metros. The company is in the best shape it's been in years.",
    bullCase: { target: 260, thesis: "AWS margins expand to 35%+ as AI workloads drive premium pricing; ad business hits $70B run rate." },
    bearCase: { target: 165, thesis: "Retail margins peak as delivery cost inflation returns; AWS faces pricing pressure from Azure." },
    wildCard: { label: "Healthcare", thesis: "Amazon Clinic + One Medical integration could disrupt primary care — $30B opportunity." },
    sources: "10-K filing, Q1 2026 earnings call, eMarketer ad data",
  },
  GOOGL: {
    summary: "Alphabet's core Search business continues to defy disruption fears, growing 14% YoY as AI Overviews actually increase ad engagement. YouTube surpassed $40B annual revenue, and Google Cloud hit profitability. The company's AI infrastructure investments are massive ($12B/quarter capex) but positioning it for the next decade of computing.",
    bullCase: { target: 220, thesis: "Gemini AI strengthens Search moat; Waymo rideshare hits 1M rides/week, proving autonomous viability." },
    bearCase: { target: 145, thesis: "DOJ antitrust remedies force structural changes to Search distribution deals." },
    wildCard: { label: "Waymo Spinoff", thesis: "IPO or spinoff could unlock $100B+ in value currently buried in Other Bets." },
    sources: "10-K filing, Q1 2026 earnings call, Waymo operational data",
  },
  META: {
    summary: "Meta's efficiency era is delivering results — operating margins expanded to 41% while Reels monetization closed the gap with Feed. Family of Apps daily users hit 3.3B, and WhatsApp Business is emerging as a meaningful revenue contributor. Reality Labs losses narrowed to $3.2B/quarter as Quest 3 sales exceeded expectations.",
    bullCase: { target: 720, thesis: "Reels fully monetized + WhatsApp payments creates $15B new revenue; Reality Labs breakeven by 2028." },
    bearCase: { target: 480, thesis: "TikTok ban reversal + teen engagement decline erodes Instagram growth." },
    wildCard: { label: "AI Personas", thesis: "Meta AI characters could become the next social platform — 500M weekly users already." },
    sources: "10-K filing, Q1 2026 earnings call, Sensor Tower data",
  },
  TSLA: {
    summary: "Tesla delivered 1.95M vehicles last year, up 8% YoY, but margins compressed to 17.6% as price cuts took hold. The Energy business is the bright spot — revenue doubled to $12B and margins are expanding. FSD (Supervised) adoption reached 40% of the fleet, and the Robotaxi unveil generated massive interest, though commercial launch timelines remain uncertain.",
    bullCase: { target: 350, thesis: "Robotaxi launches in 3 cities by year-end; Energy business hits $30B revenue by 2027." },
    bearCase: { target: 140, thesis: "Auto margins compress further to 14%; FSD fails to reach unsupervised capability." },
    wildCard: { label: "Optimus Robot", thesis: "If humanoid robots work, the TAM dwarfs autos — but it's 5+ years from meaningful revenue." },
    sources: "10-K filing, Q4 2025 earnings call, EV sales tracker",
  },
  AMD: {
    summary: "AMD's MI300 AI accelerator is gaining real traction, with $6.5B in data center GPU revenue last year. The EPYC server CPU business continues to take share from Intel (now at 33% of server market), and the Ryzen AI PC chips are well-positioned for the on-device AI wave. Xilinx integration is boosting embedded segment margins.",
    bullCase: { target: 165, thesis: "MI300X wins major cloud contracts; EPYC reaches 40% server share by 2027." },
    bearCase: { target: 85, thesis: "NVIDIA's CUDA moat proves too strong; MI350 delayed or underperforms." },
    wildCard: { label: "Intel Acquisition", thesis: "AMD acquiring Intel's foundry assets would reshape the semiconductor industry." },
    sources: "10-K filing, CES 2026 keynote, Mercury Research data",
  },
};

// ─── Financial Data ─────────────────────────────────────────────────────────

export interface FinancialData {
  revenue: { values: number[]; periods: string[] };
  netIncome: { values: number[]; periods: string[] };
  grossProfit: { values: number[]; periods: string[] };
  operatingIncome: { values: number[]; periods: string[] };
  aiSummary: string;
}

export const FINANCIALS: Record<string, FinancialData> = {
  AAPL: {
    revenue: { values: [124.3, 94.8, 85.8, 119.6], periods: ["Q1 '26", "Q4 '25", "Q3 '25", "Q2 '25"] },
    netIncome: { values: [36.3, 24.8, 21.4, 33.7], periods: ["Q1 '26", "Q4 '25", "Q3 '25", "Q2 '25"] },
    grossProfit: { values: [58.2, 43.9, 39.7, 54.9], periods: ["Q1 '26", "Q4 '25", "Q3 '25", "Q2 '25"] },
    operatingIncome: { values: [42.1, 29.7, 25.3, 39.2], periods: ["Q1 '26", "Q4 '25", "Q3 '25", "Q2 '25"] },
    aiSummary: "Revenue grew 4% YoY while net margins expanded to 29.2% — Apple's most profitable quarter ever.",
  },
  NVDA: {
    revenue: { values: [39.3, 35.1, 30.0, 26.0], periods: ["Q4 '26", "Q3 '26", "Q2 '26", "Q1 '26"] },
    netIncome: { values: [22.1, 19.3, 16.6, 14.9], periods: ["Q4 '26", "Q3 '26", "Q2 '26", "Q1 '26"] },
    grossProfit: { values: [29.5, 25.9, 22.5, 19.5], periods: ["Q4 '26", "Q3 '26", "Q2 '26", "Q1 '26"] },
    operatingIncome: { values: [24.8, 21.4, 18.2, 16.1], periods: ["Q4 '26", "Q3 '26", "Q2 '26", "Q1 '26"] },
    aiSummary: "Revenue surged 51% YoY with expanding margins — data center alone grew 87%.",
  },
  MSFT: {
    revenue: { values: [69.6, 65.6, 64.7, 62.0], periods: ["Q2 '26", "Q1 '26", "Q4 '25", "Q3 '25"] },
    netIncome: { values: [24.1, 22.6, 22.0, 21.9], periods: ["Q2 '26", "Q1 '26", "Q4 '25", "Q3 '25"] },
    grossProfit: { values: [48.7, 45.8, 45.0, 43.1], periods: ["Q2 '26", "Q1 '26", "Q4 '25", "Q3 '25"] },
    operatingIncome: { values: [30.6, 28.5, 27.9, 27.0], periods: ["Q2 '26", "Q1 '26", "Q4 '25", "Q3 '25"] },
    aiSummary: "Steady 15% revenue growth powered by Azure and Copilot adoption — margins holding at 34.6%.",
  },
  AMZN: {
    revenue: { values: [187.8, 170.0, 158.9, 148.8], periods: ["Q4 '25", "Q3 '25", "Q2 '25", "Q1 '25"] },
    netIncome: { values: [20.0, 15.3, 13.5, 10.4], periods: ["Q4 '25", "Q3 '25", "Q2 '25", "Q1 '25"] },
    grossProfit: { values: [92.4, 82.8, 76.1, 69.6], periods: ["Q4 '25", "Q3 '25", "Q2 '25", "Q1 '25"] },
    operatingIncome: { values: [21.2, 17.4, 14.7, 10.5], periods: ["Q4 '25", "Q3 '25", "Q2 '25", "Q1 '25"] },
    aiSummary: "Revenue grew 12% YoY with operating margins nearly doubling — the efficiency story is real.",
  },
};

// ─── Key Metrics ────────────────────────────────────────────────────────────

export interface KeyMetric {
  label: string;
  value: string;
  annotation?: string;
}

export interface StockMetrics {
  primary: KeyMetric[];
  secondary: KeyMetric[];
}

export const KEY_METRICS: Record<string, StockMetrics> = {
  AAPL: {
    primary: [
      { label: "Market Cap", value: "$3.52T", annotation: "Largest company by market cap" },
      { label: "P/E Ratio", value: "35.2x", annotation: "Above sector avg of 28x" },
      { label: "EPS (TTM)", value: "$6.42", annotation: "+12% vs last year" },
      { label: "Dividend Yield", value: "0.44%", annotation: "$1.00/year per share" },
      { label: "Revenue (TTM)", value: "$424.5B", annotation: "+5% YoY growth" },
      { label: "Profit Margin", value: "26.3%", annotation: "Expanding — best in 5 years" },
    ],
    secondary: [
      { label: "Beta", value: "1.24" },
      { label: "Volume", value: "52.3M" },
      { label: "Avg Vol (30D)", value: "48.1M" },
      { label: "Open", value: "$225.38" },
      { label: "Prev Close", value: "$225.38" },
      { label: "52W High", value: "$237.49" },
      { label: "52W Low", value: "$164.08" },
    ],
  },
  NVDA: {
    primary: [
      { label: "Market Cap", value: "$3.24T", annotation: "2nd largest US company" },
      { label: "P/E Ratio", value: "37.4x", annotation: "Premium but growing into it" },
      { label: "EPS (TTM)", value: "$3.53", annotation: "+128% vs last year" },
      { label: "Dividend Yield", value: "0.02%", annotation: "Token dividend — growth focused" },
      { label: "Revenue (TTM)", value: "$130.5B", annotation: "+94% YoY — hypergrowth" },
      { label: "Profit Margin", value: "55.7%", annotation: "Best-in-class for semis" },
    ],
    secondary: [
      { label: "Beta", value: "1.68" },
      { label: "Volume", value: "68.5M" },
      { label: "Avg Vol (30D)", value: "62.1M" },
      { label: "Open", value: "$134.20" },
      { label: "Prev Close", value: "$135.09" },
      { label: "52W High", value: "$153.13" },
      { label: "52W Low", value: "$47.32" },
    ],
  },
  MSFT: {
    primary: [
      { label: "Market Cap", value: "$3.21T", annotation: "3rd largest US company" },
      { label: "P/E Ratio", value: "34.8x", annotation: "In line with 5Y average" },
      { label: "EPS (TTM)", value: "$12.41", annotation: "+18% vs last year" },
      { label: "Dividend Yield", value: "0.72%", annotation: "$3.12/year — 20 yrs of growth" },
      { label: "Revenue (TTM)", value: "$261.8B", annotation: "+16% YoY growth" },
      { label: "Profit Margin", value: "35.6%", annotation: "Consistently expanding" },
    ],
    secondary: [
      { label: "Beta", value: "0.89" },
      { label: "Volume", value: "23.2M" },
      { label: "Avg Vol (30D)", value: "21.4M" },
      { label: "Open", value: "$434.10" },
      { label: "Prev Close", value: "$435.05" },
      { label: "52W High", value: "$468.35" },
      { label: "52W Low", value: "$362.90" },
    ],
  },
  QQQ: {
    primary: [
      { label: "Today's Range", value: "501.20 - 524.50", annotation: "Intraday +1.5% vol surge" },
      { label: "Today's Volume", value: "42.1M", annotation: "+13% up vs 3M average" },
      { label: "1 Year Range", value: "420.80 - 524.50", annotation: "Approaching yearly high" },
      { label: "Net Asset Value", value: "521.66", annotation: "+19% YoY growth" },
      { label: "3 Year Range", value: "259.80 - 524.50", annotation: "Recovery from 2022 lows" },
      { label: "Weighted Avg P/E", value: "22.5x" },
      { label: "Dividend Yield", value: "0.48%", annotation: "Low yield reflects growth tilt" },
      { label: "Dividend Frequency", value: "Quarterly" },
    ],
    secondary: [
      { label: "AUM", value: "267.1B" },
      { label: "Expense Ratio", value: "0.20%" },
      { label: "Avg Vol (30D)", value: "41.2M" },
      { label: "52W High", value: "524.50" },
      { label: "52W Low", value: "420.80" },
      { label: "Inception", value: "1999" },
    ],
  },
  SPY: {
    primary: [
      { label: "AUM", value: "$503.2B", annotation: "Largest ETF globally by assets" },
      { label: "Expense Ratio", value: "0.0945%", annotation: "Efficient core S&P 500 exposure" },
      { label: "NAV", value: "$522.94", annotation: "Tight tracking to benchmark" },
      { label: "Dividend Yield", value: "1.28%", annotation: "Quarterly distribution profile" },
      { label: "1Y Return", value: "+24.6%", annotation: "Broad large-cap US equity exposure" },
      { label: "Issuer", value: "State Street", annotation: "Institutional benchmark favorite" },
    ],
    secondary: [
      { label: "Category", value: "Large Blend" },
      { label: "Exchange", value: "NYSE Arca" },
      { label: "Avg Vol (30D)", value: "72.4M" },
      { label: "52W High", value: "$542.10" },
      { label: "52W Low", value: "$410.38" },
      { label: "Inception", value: "1993" },
    ],
  },
  IWM: {
    primary: [
      { label: "AUM", value: "$72.8B", annotation: "Most-followed small-cap ETF" },
      { label: "Expense Ratio", value: "0.19%", annotation: "Priced above mega-beta ETFs" },
      { label: "NAV", value: "$206.10", annotation: "Small-cap exposure with broader swings" },
      { label: "Dividend Yield", value: "1.52%", annotation: "Yield supported by diversified holdings" },
      { label: "1Y Return", value: "+12.9%", annotation: "Sensitive to domestic growth expectations" },
      { label: "Issuer", value: "BlackRock", annotation: "Tracks Russell 2000 Index" },
    ],
    secondary: [
      { label: "Category", value: "Small Blend" },
      { label: "Exchange", value: "NYSE Arca" },
      { label: "Avg Vol (30D)", value: "28.7M" },
      { label: "52W High", value: "$226.53" },
      { label: "52W Low", value: "$163.69" },
      { label: "Inception", value: "2000" },
    ],
  },
  GLD: {
    primary: [
      { label: "AUM", value: "$71.3B", annotation: "Largest gold-backed ETF" },
      { label: "Expense Ratio", value: "0.40%", annotation: "Commodity exposure comes at a premium" },
      { label: "NAV", value: "$236.72", annotation: "Backed by allocated physical bullion" },
      { label: "Dividend Yield", value: "0.00%", annotation: "Commodity ETF with no yield" },
      { label: "1Y Return", value: "+14.6%", annotation: "Tracks spot gold performance" },
      { label: "Issuer", value: "State Street", annotation: "Safe-haven allocation vehicle" },
    ],
    secondary: [
      { label: "Category", value: "Commodities" },
      { label: "Exchange", value: "NYSE Arca" },
      { label: "Avg Vol (30D)", value: "8.4M" },
      { label: "52W High", value: "$252.43" },
      { label: "52W Low", value: "$172.63" },
      { label: "Inception", value: "2004" },
    ],
  },
  VTI: {
    primary: [
      { label: "AUM", value: "$428.6B", annotation: "Total-market allocation at scale" },
      { label: "Expense Ratio", value: "0.03%", annotation: "Ultra-low-cost beta exposure" },
      { label: "NAV", value: "$241.76", annotation: "Tracks CRSP US Total Market Index" },
      { label: "Dividend Yield", value: "1.41%", annotation: "Balanced income + growth profile" },
      { label: "1Y Return", value: "+23.4%", annotation: "Broad US market participation" },
      { label: "Issuer", value: "Vanguard", annotation: "Core long-term allocation vehicle" },
    ],
    secondary: [
      { label: "Category", value: "Large Blend" },
      { label: "Exchange", value: "NYSE Arca" },
      { label: "Avg Vol (30D)", value: "3.8M" },
      { label: "52W High", value: "$254.82" },
      { label: "52W Low", value: "$193.40" },
      { label: "Inception", value: "2001" },
    ],
  },
};

// ─── Performance Data ───────────────────────────────────────────────────────

export interface PerformanceData {
  todayRange: { low: number; high: number; current: number };
  weekRange: { low: number; high: number; current: number };
  returns: { period: string; value: number }[];
  benchmark: { label: string; stockReturn: number; benchReturn: number; period: string };
  rangeAnnotation: string;
}

export const PERFORMANCE: Record<string, PerformanceData> = {
  AAPL: {
    todayRange: { low: 225.10, high: 229.88, current: 228.52 },
    weekRange: { low: 164.08, high: 237.49, current: 228.52 },
    returns: [
      { period: "1W", value: 2.1 }, { period: "1M", value: 5.4 }, { period: "3M", value: 12.8 },
      { period: "6M", value: 18.2 }, { period: "1Y", value: 32.1 }, { period: "5Y", value: 198.5 },
    ],
    benchmark: { label: "S&P 500", stockReturn: 32.1, benchReturn: 18.4, period: "1Y" },
    rangeAnnotation: "Trading in the upper 88% of its 52-week range",
  },
  NVDA: {
    todayRange: { low: 128.40, high: 135.90, current: 131.88 },
    weekRange: { low: 47.32, high: 153.13, current: 131.88 },
    returns: [
      { period: "1W", value: -4.2 }, { period: "1M", value: -8.1 }, { period: "3M", value: 15.4 },
      { period: "6M", value: 42.6 }, { period: "1Y", value: 178.3 }, { period: "5Y", value: 2840.0 },
    ],
    benchmark: { label: "S&P 500", stockReturn: 178.3, benchReturn: 18.4, period: "1Y" },
    rangeAnnotation: "Trading 14% below its 52-week high — potential pullback entry",
  },
  MSFT: {
    todayRange: { low: 429.50, high: 435.20, current: 432.18 },
    weekRange: { low: 362.90, high: 468.35, current: 432.18 },
    returns: [
      { period: "1W", value: -1.2 }, { period: "1M", value: 3.8 }, { period: "3M", value: 8.2 },
      { period: "6M", value: 12.4 }, { period: "1Y", value: 24.6 }, { period: "5Y", value: 142.3 },
    ],
    benchmark: { label: "S&P 500", stockReturn: 24.6, benchReturn: 18.4, period: "1Y" },
    rangeAnnotation: "Mid-range — consolidating after a strong 2025",
  },
  QQQ: {
    todayRange: { low: 558.12, high: 564.90, current: 562.58 },
    weekRange: { low: 351.40, high: 503.52, current: 562.58 },
    returns: [
      { period: "1W", value: 1.8 }, { period: "1M", value: 4.9 }, { period: "3M", value: 11.6 },
      { period: "6M", value: 19.7 }, { period: "1Y", value: 32.1 }, { period: "5Y", value: 126.4 },
    ],
    benchmark: { label: "NASDAQ 100", stockReturn: 32.1, benchReturn: 29.4, period: "1Y" },
    rangeAnnotation: "Trading above its prior 52-week band after a strong breakout in mega-cap tech.",
  },
  SPY: {
    todayRange: { low: 519.80, high: 525.60, current: 523.18 },
    weekRange: { low: 410.38, high: 542.10, current: 523.18 },
    returns: [
      { period: "1W", value: 1.3 }, { period: "1M", value: 3.7 }, { period: "3M", value: 8.4 },
      { period: "6M", value: 14.5 }, { period: "1Y", value: 24.6 }, { period: "5Y", value: 88.1 },
    ],
    benchmark: { label: "S&P 500", stockReturn: 24.6, benchReturn: 24.4, period: "1Y" },
    rangeAnnotation: "Still near the upper end of its yearly range with broad market participation intact.",
  },
  IWM: {
    todayRange: { low: 203.90, high: 208.10, current: 206.34 },
    weekRange: { low: 163.69, high: 226.53, current: 206.34 },
    returns: [
      { period: "1W", value: -0.8 }, { period: "1M", value: 2.1 }, { period: "3M", value: 5.2 },
      { period: "6M", value: 9.4 }, { period: "1Y", value: 12.9 }, { period: "5Y", value: 54.6 },
    ],
    benchmark: { label: "Russell 2000", stockReturn: 12.9, benchReturn: 11.8, period: "1Y" },
    rangeAnnotation: "Small-cap momentum is improving, but the fund still trades below last cycle highs.",
  },
  GLD: {
    todayRange: { low: 234.90, high: 237.60, current: 236.84 },
    weekRange: { low: 172.63, high: 252.43, current: 236.84 },
    returns: [
      { period: "1W", value: 0.9 }, { period: "1M", value: 2.7 }, { period: "3M", value: 6.4 },
      { period: "6M", value: 10.8 }, { period: "1Y", value: 14.6 }, { period: "5Y", value: 58.3 },
    ],
    benchmark: { label: "Spot Gold", stockReturn: 14.6, benchReturn: 13.9, period: "1Y" },
    rangeAnnotation: "Gold remains firm near highs as macro hedging demand and central-bank buying stay supportive.",
  },
  VTI: {
    todayRange: { low: 239.80, high: 242.40, current: 241.93 },
    weekRange: { low: 193.40, high: 254.82, current: 241.93 },
    returns: [
      { period: "1W", value: 1.1 }, { period: "1M", value: 3.5 }, { period: "3M", value: 7.8 },
      { period: "6M", value: 13.6 }, { period: "1Y", value: 23.4 }, { period: "5Y", value: 84.5 },
    ],
    benchmark: { label: "US Total Market", stockReturn: 23.4, benchReturn: 22.8, period: "1Y" },
    rangeAnnotation: "A steady core-beta profile with price still comfortably above its long-term trend.",
  },
};

// ─── Analyst Ratings ────────────────────────────────────────────────────────

export interface AnalystData {
  ratings: { strongBuy: number; buy: number; hold: number; sell: number; strongSell: number };
  priceTarget: { low: number; avg: number; high: number; current: number };
  annotation: string;
  recentCalls: { firm: string; direction: "upgrade" | "downgrade" | "maintain"; rating: string; target: number; date: string }[];
}

export const ANALYST_RATINGS: Record<string, AnalystData> = {
  AAPL: {
    ratings: { strongBuy: 12, buy: 8, hold: 14, sell: 3, strongSell: 1 },
    priceTarget: { low: 190, avg: 248, high: 310, current: 228.52 },
    annotation: "9% upside to consensus target — moderate buy sentiment",
    recentCalls: [
      { firm: "Morgan Stanley", direction: "upgrade", rating: "Overweight", target: 260, date: "Mar 5" },
      { firm: "Barclays", direction: "maintain", rating: "Equal Weight", target: 240, date: "Mar 1" },
      { firm: "JP Morgan", direction: "upgrade", rating: "Overweight", target: 255, date: "Feb 28" },
    ],
  },
  NVDA: {
    ratings: { strongBuy: 22, buy: 14, hold: 6, sell: 1, strongSell: 0 },
    priceTarget: { low: 100, avg: 165, high: 220, current: 131.88 },
    annotation: "25% upside to consensus — strong conviction across Wall Street",
    recentCalls: [
      { firm: "Goldman Sachs", direction: "maintain", rating: "Buy", target: 200, date: "Mar 6" },
      { firm: "Bank of America", direction: "upgrade", rating: "Buy", target: 185, date: "Mar 3" },
      { firm: "UBS", direction: "maintain", rating: "Buy", target: 175, date: "Feb 27" },
    ],
  },
  MSFT: {
    ratings: { strongBuy: 18, buy: 12, hold: 8, sell: 2, strongSell: 0 },
    priceTarget: { low: 380, avg: 490, high: 550, current: 432.18 },
    annotation: "13% upside to consensus — steady buy conviction",
    recentCalls: [
      { firm: "Wedbush", direction: "upgrade", rating: "Outperform", target: 525, date: "Mar 4" },
      { firm: "Citi", direction: "maintain", rating: "Buy", target: 500, date: "Mar 2" },
      { firm: "Bernstein", direction: "maintain", rating: "Market Perform", target: 450, date: "Feb 26" },
    ],
  },
  QQQ: {
    ratings: { strongBuy: 14, buy: 11, hold: 7, sell: 1, strongSell: 0 },
    priceTarget: { low: 500, avg: 590, high: 640, current: 562.58 },
    annotation: "Analyst sentiment stays constructive as megacap earnings continue to anchor the basket.",
    recentCalls: [
      { firm: "Goldman Sachs", direction: "maintain", rating: "Buy", target: 610, date: "Mar 6" },
      { firm: "Morgan Stanley", direction: "upgrade", rating: "Overweight", target: 625, date: "Mar 3" },
      { firm: "UBS", direction: "maintain", rating: "Neutral", target: 575, date: "Feb 27" },
    ],
  },
  SPY: {
    ratings: { strongBuy: 10, buy: 13, hold: 9, sell: 1, strongSell: 0 },
    priceTarget: { low: 490, avg: 548, high: 590, current: 523.18 },
    annotation: "Consensus remains constructive on broad US equities with earnings breadth still healthy.",
    recentCalls: [
      { firm: "JP Morgan", direction: "maintain", rating: "Overweight", target: 560, date: "Mar 5" },
      { firm: "Citi", direction: "upgrade", rating: "Buy", target: 570, date: "Mar 1" },
      { firm: "Barclays", direction: "maintain", rating: "Equal Weight", target: 535, date: "Feb 25" },
    ],
  },
  IWM: {
    ratings: { strongBuy: 7, buy: 10, hold: 12, sell: 3, strongSell: 1 },
    priceTarget: { low: 188, avg: 222, high: 246, current: 206.34 },
    annotation: "Street opinion is more mixed here, reflecting higher sensitivity to rates and domestic growth.",
    recentCalls: [
      { firm: "Wells Fargo", direction: "upgrade", rating: "Overweight", target: 230, date: "Mar 4" },
      { firm: "BofA", direction: "maintain", rating: "Neutral", target: 218, date: "Mar 2" },
      { firm: "Jefferies", direction: "downgrade", rating: "Hold", target: 205, date: "Feb 26" },
    ],
  },
  GLD: {
    ratings: { strongBuy: 9, buy: 8, hold: 10, sell: 2, strongSell: 0 },
    priceTarget: { low: 220, avg: 248, high: 270, current: 236.84 },
    annotation: "Analysts see steady upside if macro uncertainty and reserve diversification trends continue.",
    recentCalls: [
      { firm: "Macquarie", direction: "upgrade", rating: "Outperform", target: 258, date: "Mar 5" },
      { firm: "HSBC", direction: "maintain", rating: "Buy", target: 250, date: "Mar 1" },
      { firm: "Deutsche Bank", direction: "maintain", rating: "Hold", target: 240, date: "Feb 24" },
    ],
  },
  VTI: {
    ratings: { strongBuy: 11, buy: 12, hold: 8, sell: 1, strongSell: 0 },
    priceTarget: { low: 225, avg: 255, high: 278, current: 241.93 },
    annotation: "Consensus favors VTI as a long-duration core allocation with low-fee total-market exposure.",
    recentCalls: [
      { firm: "Morningstar", direction: "maintain", rating: "Gold", target: 260, date: "Mar 6" },
      { firm: "CFRA", direction: "upgrade", rating: "Buy", target: 258, date: "Mar 2" },
      { firm: "Argus", direction: "maintain", rating: "Accumulate", target: 250, date: "Feb 28" },
    ],
  },
};

// ─── Ownership Data ─────────────────────────────────────────────────────────

export interface OwnershipData {
  breakdown: { institutions: number; insiders: number; retail: number };
  topHolders: { name: string; percent: number; change: number }[];
  insiderActivity: { name: string; action: string; amount: string; date: string; annotation: string }[];
}

export const OWNERSHIP: Record<string, OwnershipData> = {
  AAPL: {
    breakdown: { institutions: 61.2, insiders: 0.1, retail: 38.7 },
    topHolders: [
      { name: "Vanguard Group", percent: 8.8, change: 0.1 },
      { name: "BlackRock", percent: 7.3, change: -0.2 },
      { name: "Berkshire Hathaway", percent: 5.6, change: -0.8 },
    ],
    insiderActivity: [
      { name: "Tim Cook", action: "Sold", amount: "$42M", date: "Feb 14", annotation: "Routine quarterly sale per 10b5-1 plan — has sold same amount each quarter for 3 years." },
    ],
  },
  NVDA: {
    breakdown: { institutions: 68.4, insiders: 3.8, retail: 27.8 },
    topHolders: [
      { name: "Vanguard Group", percent: 8.2, change: 0.3 },
      { name: "BlackRock", percent: 7.1, change: 0.1 },
      { name: "FMR (Fidelity)", percent: 5.4, change: 0.5 },
    ],
    insiderActivity: [
      { name: "Jensen Huang", action: "Sold", amount: "$168M", date: "Jan 22", annotation: "Part of pre-scheduled 10b5-1 plan — selling at regular intervals since 2023." },
    ],
  },
};

// ─── Technical Analysis ─────────────────────────────────────────────────────

export interface TechnicalData {
  signal: "Bullish" | "Bearish" | "Neutral";
  movingAverages: { buy: number; sell: number; neutral: number };
  oscillators: { buy: number; sell: number; neutral: number };
  keyLevels: { support: number[]; resistance: number[] };
  aiSummary: string;
}

export const TECHNICALS: Record<string, TechnicalData> = {
  AAPL: {
    signal: "Bullish",
    movingAverages: { buy: 9, sell: 2, neutral: 1 },
    oscillators: { buy: 4, sell: 1, neutral: 6 },
    keyLevels: { support: [222.40, 218.60], resistance: [231.20, 237.50] },
    aiSummary: "Price is above all major moving averages with RSI at 62 — room to run before overbought territory at 70.",
  },
  NVDA: {
    signal: "Bearish",
    movingAverages: { buy: 3, sell: 7, neutral: 2 },
    oscillators: { buy: 2, sell: 5, neutral: 4 },
    keyLevels: { support: [125.80, 118.50], resistance: [138.40, 145.20] },
    aiSummary: "Below 50-day MA with weakening momentum — RSI at 38 suggests oversold conditions may create a bounce opportunity.",
  },
  MSFT: {
    signal: "Neutral",
    movingAverages: { buy: 6, sell: 4, neutral: 2 },
    oscillators: { buy: 3, sell: 3, neutral: 5 },
    keyLevels: { support: [425.10, 418.30], resistance: [440.80, 452.50] },
    aiSummary: "Consolidating in a tight range — MACD is flat and volume is below average. Waiting for a catalyst to break direction.",
  },
};

// ─── News & Events ──────────────────────────────────────────────────────────

export interface NewsItem {
  headline: string;
  source: string;
  timeAgo: string;
  readTime: string;
  aiImpact: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface EventItem {
  type: "earnings" | "dividend" | "conference" | "split";
  title: string;
  date: string;
  daysAway: number;
}

export interface NewsEventsData {
  events: EventItem[];
  news: NewsItem[];
}

export const NEWS_EVENTS: Record<string, NewsEventsData> = {
  AAPL: {
    events: [
      { type: "earnings", title: "Q2 2026 Earnings", date: "Apr 24", daysAway: 47 },
      { type: "dividend", title: "Ex-Dividend Date", date: "Mar 14", daysAway: 6 },
      { type: "conference", title: "WWDC 2026", date: "Jun 9", daysAway: 93 },
    ],
    news: [
      { headline: "Apple's Mac sales surge 20% in Q1 on M4 chip demand", source: "Reuters", timeAgo: "2h", readTime: "3 min", aiImpact: "Positive for hardware margins — M4 chips have higher ASPs and better yields.", sentiment: "positive" },
      { headline: "Regulatory scrutiny on App Store fees intensifies in EU", source: "WSJ", timeAgo: "5h", readTime: "4 min", aiImpact: "Watch for policy shift — could impact Services revenue by 3-5% in EU market.", sentiment: "negative" },
      { headline: "Apple Intelligence features driving record iPhone 16 demand in China", source: "Bloomberg", timeAgo: "8h", readTime: "3 min", aiImpact: "Strong signal for Q2 guidance — China was the key risk factor last quarter.", sentiment: "positive" },
      { headline: "Berkshire reduces Apple stake by 2% in Q4 filing", source: "CNBC", timeAgo: "1d", readTime: "2 min", aiImpact: "Continuation of portfolio rebalancing — Apple remains Berkshire's largest equity position at $84B.", sentiment: "neutral" },
    ],
  },
  NVDA: {
    events: [
      { type: "earnings", title: "Q1 2027 Earnings", date: "May 28", daysAway: 81 },
      { type: "conference", title: "GTC 2026", date: "Mar 17", daysAway: 9 },
    ],
    news: [
      { headline: "NVIDIA unveils next-gen Rubin architecture at GTC preview", source: "The Verge", timeAgo: "1h", readTime: "5 min", aiImpact: "Forward-looking positive — Rubin could extend GPU leadership through 2028.", sentiment: "positive" },
      { headline: "US considers expanding chip export controls to Middle East", source: "Reuters", timeAgo: "4h", readTime: "3 min", aiImpact: "Potential $2-4B revenue headwind if Middle East restrictions materialize.", sentiment: "negative" },
      { headline: "Microsoft commits $80B to AI data centers in 2026", source: "Bloomberg", timeAgo: "12h", readTime: "4 min", aiImpact: "Directly bullish — Microsoft is NVIDIA's largest customer by revenue.", sentiment: "positive" },
    ],
  },
};

// ─── Market Depth ───────────────────────────────────────────────────────────

export interface DepthLevel {
  price: number;
  size: number;
}

export interface MarketDepthData {
  bids: DepthLevel[];
  asks: DepthLevel[];
  spread: number;
  spreadPercent: number;
  annotation: string;
}

export function generateMarketDepth(currentPrice: number, symbol: string): MarketDepthData {
  const rand = seededRandom(hashSymbol(symbol) + 999);
  const bids: DepthLevel[] = [];
  const asks: DepthLevel[] = [];

  for (let i = 0; i < 5; i++) {
    bids.push({
      price: +(currentPrice - (i + 1) * 0.02 * (1 + rand())).toFixed(2),
      size: Math.round((rand() * 8000 + 2000)),
    });
    asks.push({
      price: +(currentPrice + (i + 1) * 0.02 * (1 + rand())).toFixed(2),
      size: Math.round((rand() * 8000 + 2000)),
    });
  }

  const spread = +(asks[0].price - bids[0].price).toFixed(2);
  const spreadPercent = +((spread / currentPrice) * 100).toFixed(4);
  const annotation = spread < 0.05
    ? "Tight spread — highly liquid, safe for market orders"
    : spread < 0.20
    ? "Normal spread — adequate liquidity for retail orders"
    : "Wide spread — consider using limit orders to avoid slippage";

  return { bids, asks, spread, spreadPercent, annotation };
}

// ─── ETF Holdings ───────────────────────────────────────────────────────────

export interface ETFHolding {
  symbol: string;
  name: string;
  weight: number;
}

export const ETF_HOLDINGS: Record<string, { count: number; top: ETFHolding[]; aiSuggestion: string }> = {
  AAPL: {
    count: 284,
    top: [
      { symbol: "QQQ", name: "Invesco QQQ Trust", weight: 8.9 },
      { symbol: "SPY", name: "SPDR S&P 500 ETF", weight: 7.1 },
      { symbol: "VTI", name: "Vanguard Total Market", weight: 6.2 },
    ],
    aiSuggestion: "Prefer diversification? QQQ has the highest AAPL weighting with strong tech exposure.",
  },
  NVDA: {
    count: 196,
    top: [
      { symbol: "QQQ", name: "Invesco QQQ Trust", weight: 7.8 },
      { symbol: "SMH", name: "VanEck Semiconductor", weight: 19.4 },
      { symbol: "SPY", name: "SPDR S&P 500 ETF", weight: 6.4 },
    ],
    aiSuggestion: "Want semiconductor exposure without single-stock risk? SMH holds 19.4% NVDA plus 24 other chip stocks.",
  },
  MSFT: {
    count: 312,
    top: [
      { symbol: "SPY", name: "SPDR S&P 500 ETF", weight: 7.2 },
      { symbol: "QQQ", name: "Invesco QQQ Trust", weight: 8.4 },
      { symbol: "VGT", name: "Vanguard Info Tech", weight: 14.8 },
    ],
    aiSuggestion: "VGT offers concentrated tech exposure with 14.8% MSFT weighting — great for sector conviction.",
  },
};

// ─── Options Data ───────────────────────────────────────────────────────────

export interface OptionsPulseData {
  ivRank: number;
  iv: number;
  putCallRatio: number;
  ivAnnotation: string;
  sentimentAnnotation: string;
  mostActive: { strike: number; type: "Call" | "Put"; expiry: string; volume: number; lastPrice: number }[];
}

export interface OptionsChainRow {
  strike: number;
  call: { last: number; change: number; volume: number; oi: number; bid: number; ask: number; delta: number; gamma: number; vega: number; theta: number; iv: number };
  put: { last: number; change: number; volume: number; oi: number; bid: number; ask: number; delta: number; gamma: number; vega: number; theta: number; iv: number };
}

export const OPTIONS_PULSE: Record<string, OptionsPulseData> = {
  AAPL: {
    ivRank: 42,
    iv: 28.3,
    putCallRatio: 0.72,
    ivAnnotation: "Moderately priced options — IV is near its 6-month average",
    sentimentAnnotation: "Slightly bullish sentiment — more call buying than puts",
    mostActive: [
      { strike: 230, type: "Call", expiry: "Mar 21", volume: 12400, lastPrice: 4.85 },
      { strike: 225, type: "Put", expiry: "Mar 21", volume: 8200, lastPrice: 2.15 },
      { strike: 240, type: "Call", expiry: "Apr 18", volume: 6800, lastPrice: 3.20 },
    ],
  },
  NVDA: {
    ivRank: 68,
    iv: 52.1,
    putCallRatio: 0.85,
    ivAnnotation: "Elevated IV — options are expensive ahead of GTC conference",
    sentimentAnnotation: "Near-neutral sentiment — hedging activity elevated",
    mostActive: [
      { strike: 135, type: "Call", expiry: "Mar 21", volume: 28400, lastPrice: 5.40 },
      { strike: 125, type: "Put", expiry: "Mar 21", volume: 18200, lastPrice: 3.80 },
      { strike: 150, type: "Call", expiry: "Apr 18", volume: 15600, lastPrice: 4.10 },
    ],
  },
};

export function generateOptionsChain(currentPrice: number, symbol: string): OptionsChainRow[] {
  const rand = seededRandom(hashSymbol(symbol) + 777);
  const strikeStep = currentPrice > 500 ? 5 : currentPrice > 100 ? 2.5 : 1;
  const baseStrike = Math.round(currentPrice / strikeStep) * strikeStep;
  const rows: OptionsChainRow[] = [];

  for (let i = -8; i <= 8; i++) {
    const strike = baseStrike + i * strikeStep;
    const signedDist = (strike - currentPrice) / currentPrice;
    const absDist = Math.abs(signedDist);
    const baseVol = Math.max(500, Math.round(15000 * (1 - absDist * 5) * (0.5 + rand())));
    const baseOI = Math.round(baseVol * (2 + rand() * 6));
    const callIntrinsic = Math.max(0, currentPrice - strike);
    const putIntrinsic = Math.max(0, strike - currentPrice);
    const timeValue = currentPrice * 0.02 * (1 + rand()) * Math.max(0.1, 1 - absDist * 3);

    // Greeks — realistic approximations
    const callDelta = +Math.min(0.99, Math.max(0.01, 0.5 - signedDist / 0.25 + (rand() - 0.5) * 0.04)).toFixed(2);
    const putDelta = +(callDelta - 1).toFixed(2);
    const gamma = +Math.max(0.001, 0.045 * Math.exp(-Math.pow(signedDist * 15, 2)) + rand() * 0.003).toFixed(3);
    const vega = +Math.max(0.01, 0.28 * Math.exp(-Math.pow(signedDist * 10, 2)) + rand() * 0.02).toFixed(2);
    const theta = +(-(0.12 * Math.exp(-Math.pow(signedDist * 10, 2)) + 0.02 + rand() * 0.01)).toFixed(2);
    const callIV = +(25 + 20 * Math.pow(absDist * 8, 1.5) + rand() * 4).toFixed(1);
    const putIV = +(callIV + (rand() - 0.3) * 2).toFixed(1);

    rows.push({
      strike,
      call: {
        last: +(callIntrinsic + timeValue).toFixed(2),
        change: +((rand() - 0.4) * 3).toFixed(2),
        volume: baseVol + Math.round(rand() * 3000),
        oi: baseOI + Math.round(rand() * 5000),
        bid: +(callIntrinsic + timeValue * 0.95).toFixed(2),
        ask: +(callIntrinsic + timeValue * 1.05).toFixed(2),
        delta: callDelta,
        gamma,
        vega,
        theta,
        iv: callIV,
      },
      put: {
        last: +(putIntrinsic + timeValue * 0.8).toFixed(2),
        change: +((rand() - 0.5) * 2.5).toFixed(2),
        volume: Math.round(baseVol * 0.7 + rand() * 2000),
        oi: Math.round(baseOI * 0.8 + rand() * 4000),
        bid: +(putIntrinsic + timeValue * 0.75).toFixed(2),
        ask: +(putIntrinsic + timeValue * 0.85).toFixed(2),
        delta: putDelta,
        gamma,
        vega,
        theta: +(theta - rand() * 0.02).toFixed(2),
        iv: putIV,
      },
    });
  }
  return rows;
}

// ─── Similar Stocks ─────────────────────────────────────────────────────────

export const SIMILAR_STOCKS: Record<string, string[]> = {
  AAPL: ["MSFT", "GOOGL", "AMZN", "META", "NFLX"],
  NVDA: ["AMD", "AVGO", "INTC", "MSFT", "GOOGL"],
  MSFT: ["AAPL", "GOOGL", "AMZN", "META", "NFLX"],
  AMZN: ["GOOGL", "META", "MSFT", "NFLX", "WMT"],
  GOOGL: ["META", "MSFT", "AMZN", "AAPL", "NFLX"],
  META: ["GOOGL", "NFLX", "AAPL", "MSFT", "AMZN"],
  TSLA: ["NVDA", "AMD", "AAPL", "AMZN", "GOOGL"],
  AMD: ["NVDA", "INTC", "AVGO", "MSFT", "GOOGL"],
  QQQ: ["SPY", "VTI", "VOO", "IWM", "GLD"],
  SPY: ["VOO", "VTI", "QQQ", "IWM", "GLD"],
  IWM: ["SPY", "QQQ", "VTI", "VOO", "GLD"],
  GLD: ["SPY", "QQQ", "VTI", "VOO", "IWM"],
  VTI: ["SPY", "VOO", "QQQ", "IWM", "GLD"],
};

// ─── Chart Data Generation ──────────────────────────────────────────────────

export type ChartTimeframe = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "ALL";

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function generateChartData(
  symbol: string,
  timeframe: ChartTimeframe,
  currentPrice: number,
  changePercent: number,
): CandleData[] {
  const seed = hashSymbol(symbol) + timeframe.charCodeAt(0) * 100;
  const rand = seededRandom(seed);

  const configs: Record<ChartTimeframe, { bars: number; interval: number; volatility: number }> = {
    "1D": { bars: 78, interval: 5 * 60, volatility: 0.001 },
    "1W": { bars: 39, interval: 60 * 60, volatility: 0.003 },
    "1M": { bars: 22, interval: 24 * 60 * 60, volatility: 0.008 },
    "3M": { bars: 65, interval: 24 * 60 * 60, volatility: 0.012 },
    "6M": { bars: 130, interval: 24 * 60 * 60, volatility: 0.015 },
    "1Y": { bars: 252, interval: 24 * 60 * 60, volatility: 0.018 },
    "5Y": { bars: 260, interval: 7 * 24 * 60 * 60, volatility: 0.025 },
    "ALL": { bars: 300, interval: 30 * 24 * 60 * 60, volatility: 0.03 },
  };

  const { bars, interval, volatility } = configs[timeframe];
  const baseTimestamp = 1772803800; // arbitrary fixed time
  const totalChange = changePercent / 100;
  const startPrice = currentPrice / (1 + totalChange * (timeframe === "1D" ? 1 : 0.3));

  const data: CandleData[] = [];
  let price = startPrice;

  for (let i = 0; i < bars; i++) {
    const drift = (totalChange / bars) * (0.5 + rand());
    const noise = (rand() - 0.5) * 2 * volatility * price;
    const open = price;
    const change = drift * price + noise;
    const close = Math.max(open * 0.9, open + change);
    const high = Math.max(open, close) * (1 + rand() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - rand() * volatility * 0.5);
    const volume = Math.round((rand() * 0.6 + 0.7) * 50000000 / bars);

    data.push({
      time: baseTimestamp + i * interval,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });

    price = close;
  }

  // Ensure last bar closes at current price
  if (data.length > 0) {
    data[data.length - 1].close = currentPrice;
    data[data.length - 1].high = Math.max(data[data.length - 1].high, currentPrice);
    data[data.length - 1].low = Math.min(data[data.length - 1].low, currentPrice);
  }

  return data;
}

// ─── Position Data (for demo) ───────────────────────────────────────────────

export interface PositionData {
  shares: number;
  avgCost: number;
  marketValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  todayPnL: number;
}

export const POSITIONS: Record<string, PositionData> = {
  AAPL: { shares: 12, avgCost: 186.40, marketValue: 2742.24, totalReturn: 505.44, totalReturnPercent: 22.6, todayPnL: 37.68 },
  NVDA: { shares: 25, avgCost: 98.20, marketValue: 3297.00, totalReturn: 842.00, totalReturnPercent: 34.3, todayPnL: -80.25 },
  QQQ: { shares: 22.83, avgCost: 486.60, marketValue: 12842.50, totalReturn: 1734.10, totalReturnPercent: 15.61, todayPnL: 2.51 },
  SPY: { shares: 18.01, avgCost: 463.62, marketValue: 9421.80, totalReturn: 1073.96, totalReturnPercent: 12.87, todayPnL: 43.22 },
  IWM: { shares: 20.29, avgCost: 213.58, marketValue: 4187.24, totalReturn: -145.71, totalReturnPercent: -3.36, todayPnL: -38.35 },
  GLD: { shares: 15.05, avgCost: 218.04, marketValue: 3564.94, totalReturn: 283.34, totalReturnPercent: 8.63, todayPnL: 16.86 },
  VTI: { shares: 44.94, avgCost: 213.80, marketValue: 10872.60, totalReturn: 1264.11, totalReturnPercent: 13.16, todayPnL: 77.30 },
};

// ─── ETF Directory ──────────────────────────────────────────────────────────
// Known ETF metadata for the detail page. Any symbol not listed here gets
// plausible seeded values via the generator functions below.

export interface ETFDirectoryEntry {
  name: string;
  issuer: string;
  indexTracked: string;
  inceptionYear: number;
  holdings: number;
  expenseRatio: number;   // percent, e.g. 0.20
  dividendYield: number;  // percent, e.g. 1.28
  dividendFrequency: string;
  aum: number;            // billions
  exchange: string;
  category: string;
  logoColor: string;
  logoAbbr: string;
  price: number;
  change: number;
  changePercent: number;
}

export const ETF_DIRECTORY: Record<string, ETFDirectoryEntry> = {
  QQQ: { name: "Invesco QQQ Trust", issuer: "Invesco", indexTracked: "NASDAQ 100 Index", inceptionYear: 1999, holdings: 104, expenseRatio: 0.20, dividendYield: 0.48, dividendFrequency: "Quarterly", aum: 267.1, exchange: "NASDAQ", category: "Large Growth", logoColor: "bg-teal-600", logoAbbr: "QQ", price: 521.87, change: 3.12, changePercent: 0.60 },
  SPY: { name: "SPDR S&P 500 ETF Trust", issuer: "State Street SSGA", indexTracked: "S&P 500 Index", inceptionYear: 1993, holdings: 503, expenseRatio: 0.09, dividendYield: 1.28, dividendFrequency: "Quarterly", aum: 503.2, exchange: "NYSE", category: "Large Blend", logoColor: "bg-blue-600", logoAbbr: "SP", price: 524.42, change: 2.84, changePercent: 0.54 },
  IWM: { name: "iShares Russell 2000 ETF", issuer: "BlackRock", indexTracked: "Russell 2000 Index", inceptionYear: 2000, holdings: 2000, expenseRatio: 0.19, dividendYield: 1.52, dividendFrequency: "Quarterly", aum: 72.8, exchange: "NYSE", category: "Small Blend", logoColor: "bg-purple-600", logoAbbr: "IW", price: 198.34, change: -1.22, changePercent: -0.61 },
  GLD: { name: "SPDR Gold Shares", issuer: "State Street SSGA", indexTracked: "Gold Spot Price", inceptionYear: 2004, holdings: 1, expenseRatio: 0.40, dividendYield: 0.00, dividendFrequency: "N/A", aum: 71.3, exchange: "NYSE", category: "Commodities", logoColor: "bg-yellow-600", logoAbbr: "GL", price: 214.56, change: 1.87, changePercent: 0.88 },
  VTI: { name: "Vanguard Total Stock Market ETF", issuer: "Vanguard", indexTracked: "CRSP US Total Market Index", inceptionYear: 2001, holdings: 3700, expenseRatio: 0.03, dividendYield: 1.41, dividendFrequency: "Quarterly", aum: 428.6, exchange: "NYSE", category: "Large Blend", logoColor: "bg-red-600", logoAbbr: "VT", price: 252.18, change: 1.44, changePercent: 0.57 },
  VOO: { name: "Vanguard S&P 500 ETF", issuer: "Vanguard", indexTracked: "S&P 500 Index", inceptionYear: 2010, holdings: 503, expenseRatio: 0.03, dividendYield: 1.30, dividendFrequency: "Quarterly", aum: 492.0, exchange: "NYSE", category: "Large Blend", logoColor: "bg-red-700", logoAbbr: "VO", price: 481.22, change: 2.14, changePercent: 0.45 },
  ARKK: { name: "ARK Innovation ETF", issuer: "ARK Invest", indexTracked: "Actively Managed", inceptionYear: 2014, holdings: 35, expenseRatio: 0.75, dividendYield: 0.00, dividendFrequency: "N/A", aum: 8.4, exchange: "NYSE", category: "Mid Growth", logoColor: "bg-orange-600", logoAbbr: "AK", price: 48.32, change: -0.54, changePercent: -1.11 },
  XLK: { name: "Technology Select Sector SPDR Fund", issuer: "State Street SSGA", indexTracked: "Technology Select Sector Index", inceptionYear: 1998, holdings: 67, expenseRatio: 0.09, dividendYield: 0.68, dividendFrequency: "Quarterly", aum: 68.3, exchange: "NYSE", category: "Technology", logoColor: "bg-sky-600", logoAbbr: "XK", price: 198.45, change: 1.22, changePercent: 0.62 },
  XLF: { name: "Financial Select Sector SPDR Fund", issuer: "State Street SSGA", indexTracked: "Financial Select Sector Index", inceptionYear: 1998, holdings: 72, expenseRatio: 0.09, dividendYield: 1.72, dividendFrequency: "Quarterly", aum: 44.8, exchange: "NYSE", category: "Financials", logoColor: "bg-emerald-700", logoAbbr: "XF", price: 47.82, change: 0.38, changePercent: 0.80 },
  XLE: { name: "Energy Select Sector SPDR Fund", issuer: "State Street SSGA", indexTracked: "Energy Select Sector Index", inceptionYear: 1998, holdings: 23, expenseRatio: 0.09, dividendYield: 3.28, dividendFrequency: "Quarterly", aum: 38.2, exchange: "NYSE", category: "Energy", logoColor: "bg-amber-700", logoAbbr: "XE", price: 91.47, change: -0.62, changePercent: -0.67 },
  XLV: { name: "Health Care Select Sector SPDR Fund", issuer: "State Street SSGA", indexTracked: "Health Care Select Sector Index", inceptionYear: 1998, holdings: 64, expenseRatio: 0.09, dividendYield: 1.48, dividendFrequency: "Quarterly", aum: 41.6, exchange: "NYSE", category: "Health Care", logoColor: "bg-pink-600", logoAbbr: "XV", price: 144.58, change: 0.91, changePercent: 0.63 },
  SMH: { name: "VanEck Semiconductor ETF", issuer: "VanEck", indexTracked: "MVIS US Listed Semiconductor 25 Index", inceptionYear: 2000, holdings: 26, expenseRatio: 0.35, dividendYield: 0.62, dividendFrequency: "Quarterly", aum: 22.4, exchange: "NASDAQ", category: "Technology", logoColor: "bg-violet-600", logoAbbr: "SM", price: 224.18, change: 2.84, changePercent: 1.28 },
  SOXX: { name: "iShares Semiconductor ETF", issuer: "BlackRock", indexTracked: "ICE Semiconductor Index", inceptionYear: 2001, holdings: 32, expenseRatio: 0.35, dividendYield: 0.58, dividendFrequency: "Quarterly", aum: 12.8, exchange: "NASDAQ", category: "Technology", logoColor: "bg-indigo-600", logoAbbr: "SO", price: 208.94, change: 2.44, changePercent: 1.18 },
  VGT: { name: "Vanguard Information Technology ETF", issuer: "Vanguard", indexTracked: "MSCI US Investable Market IT Index", inceptionYear: 2004, holdings: 316, expenseRatio: 0.10, dividendYield: 0.54, dividendFrequency: "Quarterly", aum: 72.1, exchange: "NYSE", category: "Technology", logoColor: "bg-red-600", logoAbbr: "VG", price: 564.82, change: 3.28, changePercent: 0.58 },
  SCHD: { name: "Schwab US Dividend Equity ETF", issuer: "Charles Schwab", indexTracked: "Dow Jones US Dividend 100 Index", inceptionYear: 2011, holdings: 100, expenseRatio: 0.06, dividendYield: 3.64, dividendFrequency: "Quarterly", aum: 58.4, exchange: "NYSE", category: "Large Value", logoColor: "bg-blue-700", logoAbbr: "SD", price: 28.14, change: 0.18, changePercent: 0.64 },
  BND: { name: "Vanguard Total Bond Market ETF", issuer: "Vanguard", indexTracked: "Bloomberg US Aggregate Float Adjusted Index", inceptionYear: 2007, holdings: 10000, expenseRatio: 0.03, dividendYield: 4.18, dividendFrequency: "Monthly", aum: 118.2, exchange: "NASDAQ", category: "Bonds", logoColor: "bg-slate-600", logoAbbr: "BN", price: 73.84, change: -0.12, changePercent: -0.16 },
  HYG: { name: "iShares iBoxx High Yield Corporate Bond ETF", issuer: "BlackRock", indexTracked: "Markit iBoxx USD Liquid High Yield Index", inceptionYear: 2007, holdings: 1200, expenseRatio: 0.49, dividendYield: 6.42, dividendFrequency: "Monthly", aum: 14.8, exchange: "NYSE", category: "High Yield Bonds", logoColor: "bg-purple-700", logoAbbr: "HY", price: 78.42, change: 0.14, changePercent: 0.18 },
  TLT: { name: "iShares 20+ Year Treasury Bond ETF", issuer: "BlackRock", indexTracked: "ICE US Treasury 20+ Year Index", inceptionYear: 2002, holdings: 40, expenseRatio: 0.15, dividendYield: 4.58, dividendFrequency: "Monthly", aum: 42.6, exchange: "NASDAQ", category: "Government Bonds", logoColor: "bg-gray-600", logoAbbr: "TL", price: 87.14, change: -0.44, changePercent: -0.50 },
  IAU: { name: "iShares Gold Trust", issuer: "BlackRock", indexTracked: "Gold Spot Price", inceptionYear: 2005, holdings: 1, expenseRatio: 0.25, dividendYield: 0.00, dividendFrequency: "N/A", aum: 32.4, exchange: "NYSE", category: "Commodities", logoColor: "bg-yellow-500", logoAbbr: "IA", price: 42.84, change: 0.38, changePercent: 0.89 },
  SLV: { name: "iShares Silver Trust", issuer: "BlackRock", indexTracked: "Silver Spot Price", inceptionYear: 2006, holdings: 1, expenseRatio: 0.50, dividendYield: 0.00, dividendFrequency: "N/A", aum: 12.2, exchange: "NYSE", category: "Commodities", logoColor: "bg-zinc-500", logoAbbr: "SL", price: 28.44, change: 0.22, changePercent: 0.78 },
  DIA: { name: "SPDR Dow Jones Industrial Average ETF Trust", issuer: "State Street SSGA", indexTracked: "Dow Jones Industrial Average", inceptionYear: 1998, holdings: 30, expenseRatio: 0.16, dividendYield: 1.68, dividendFrequency: "Quarterly", aum: 34.8, exchange: "NYSE", category: "Large Blend", logoColor: "bg-blue-800", logoAbbr: "DI", price: 418.22, change: 1.84, changePercent: 0.44 },
  IEMG: { name: "iShares Core MSCI Emerging Markets ETF", issuer: "BlackRock", indexTracked: "MSCI Emerging Markets Investable Market Index", inceptionYear: 2012, holdings: 2800, expenseRatio: 0.09, dividendYield: 2.84, dividendFrequency: "Semi-Annual", aum: 72.4, exchange: "NYSE", category: "Diversified Emerging Mkts", logoColor: "bg-emerald-600", logoAbbr: "IE", price: 52.44, change: 0.28, changePercent: 0.54 },
  EEM: { name: "iShares MSCI Emerging Markets ETF", issuer: "BlackRock", indexTracked: "MSCI Emerging Markets Index", inceptionYear: 2003, holdings: 1200, expenseRatio: 0.70, dividendYield: 2.42, dividendFrequency: "Semi-Annual", aum: 20.8, exchange: "NYSE", category: "Diversified Emerging Mkts", logoColor: "bg-teal-700", logoAbbr: "EM", price: 42.18, change: 0.22, changePercent: 0.52 },
};

// ─── ETF Seeded Generators ──────────────────────────────────────────────────
// Used as fallback when a symbol isn't in the hardcoded Records above.

function generateETFDirectoryEntry(symbol: string): ETFDirectoryEntry {
  const r = seededRandom(hashSymbol(symbol) + 1);
  const issuers = ["Vanguard", "BlackRock", "State Street SSGA", "Invesco", "VanEck", "Charles Schwab", "Fidelity"];
  const categories = ["Large Blend", "Large Growth", "Large Value", "Technology", "Financials", "Health Care", "Small Blend"];
  const exchanges = ["NYSE", "NASDAQ", "NYSE"];
  const colors = ["bg-blue-600", "bg-teal-600", "bg-purple-600", "bg-red-600", "bg-emerald-600", "bg-orange-600", "bg-violet-600"];
  const price = +(50 + r() * 450).toFixed(2);
  const changePct = +((r() - 0.45) * 3).toFixed(2);
  return {
    name: `${symbol} Index Fund`,
    issuer: issuers[Math.floor(r() * issuers.length)],
    indexTracked: `${symbol} Composite Index`,
    inceptionYear: 2000 + Math.floor(r() * 20),
    holdings: Math.round(100 + r() * 900),
    expenseRatio: +(0.03 + r() * 0.5).toFixed(2),
    dividendYield: +(r() * 3).toFixed(2),
    dividendFrequency: r() > 0.5 ? "Quarterly" : "Monthly",
    aum: +(1 + r() * 50).toFixed(1),
    exchange: exchanges[Math.floor(r() * exchanges.length)],
    category: categories[Math.floor(r() * categories.length)],
    logoColor: colors[Math.floor(r() * colors.length)],
    logoAbbr: symbol.slice(0, 2),
    price,
    change: +(price * changePct / 100).toFixed(2),
    changePercent: changePct,
  };
}

export function getETFInfo(symbol: string): ETFDirectoryEntry {
  return ETF_DIRECTORY[symbol] ?? generateETFDirectoryEntry(symbol);
}

function generateETFKeyMetrics(symbol: string, entry: ETFDirectoryEntry): StockMetrics {
  const r = seededRandom(hashSymbol(symbol) + 2);
  const aumStr = entry.aum >= 100 ? `$${entry.aum.toFixed(0)}B` : `$${entry.aum.toFixed(1)}B`;
  const oneYReturn = +((r() * 30 + 5) * (r() > 0.3 ? 1 : -1)).toFixed(1);
  const high52 = +(entry.price * (1 + r() * 0.25)).toFixed(2);
  const low52 = +(entry.price * (0.65 + r() * 0.2)).toFixed(2);
  return {
    primary: [
      { label: "AUM", value: aumStr, annotation: `${entry.category} exposure` },
      { label: "Expense Ratio", value: `${entry.expenseRatio.toFixed(2)}%`, annotation: "Annual management fee" },
      { label: "NAV", value: `$${entry.price.toFixed(2)}`, annotation: "Net asset value per share" },
      { label: "Dividend Yield", value: `${entry.dividendYield.toFixed(2)}%`, annotation: `${entry.dividendFrequency} distribution` },
      { label: "1Y Return", value: `${oneYReturn >= 0 ? "+" : ""}${oneYReturn.toFixed(1)}%`, annotation: "Total return including dividends" },
      { label: "Issuer", value: entry.issuer, annotation: `Since ${entry.inceptionYear}` },
    ],
    secondary: [
      { label: "Category", value: entry.category },
      { label: "Exchange", value: entry.exchange },
      { label: "Avg Vol (30D)", value: `${(r() * 20 + 1).toFixed(1)}M` },
      { label: "52W High", value: `$${high52}` },
      { label: "52W Low", value: `$${low52}` },
      { label: "Inception", value: `${entry.inceptionYear}` },
    ],
  };
}

function generateETFPerformance(symbol: string, entry: ETFDirectoryEntry): PerformanceData {
  const r = seededRandom(hashSymbol(symbol) + 3);
  const p = entry.price;
  const todayLow = +(p * (0.990 + r() * 0.005)).toFixed(2);
  const todayHigh = +(p * (1.005 + r() * 0.010)).toFixed(2);
  const low52 = +(p * (0.65 + r() * 0.20)).toFixed(2);
  const high52 = +(p * (1.05 + r() * 0.25)).toFixed(2);
  return {
    todayRange: { low: todayLow, high: todayHigh, current: p },
    weekRange: { low: low52, high: high52, current: p },
    returns: [
      { period: "1W", value: +((r() - 0.4) * 4).toFixed(1) },
      { period: "1M", value: +((r() - 0.3) * 8).toFixed(1) },
      { period: "3M", value: +((r() - 0.25) * 15).toFixed(1) },
      { period: "6M", value: +((r() - 0.2) * 22).toFixed(1) },
      { period: "1Y", value: +((r() * 30 + 5) * (r() > 0.25 ? 1 : -1)).toFixed(1) },
      { period: "5Y", value: +((r() * 80 + 20) * (r() > 0.2 ? 1 : -1)).toFixed(1) },
    ],
    benchmark: { label: "S&P 500", stockReturn: +((r() * 30).toFixed(1)), benchReturn: 18.4, period: "1Y" },
    rangeAnnotation: `Trading ${p > (low52 + high52) / 2 ? "above" : "below"} its mid-year range`,
  };
}

function generateETFAnalystRatings(symbol: string, entry: ETFDirectoryEntry): AnalystData {
  const r = seededRandom(hashSymbol(symbol) + 4);
  const total = 20 + Math.round(r() * 15);
  const strongBuy = Math.round(total * (0.2 + r() * 0.3));
  const buy = Math.round(total * (0.15 + r() * 0.25));
  const hold = Math.round(total * (0.1 + r() * 0.2));
  const sell = Math.round(total * r() * 0.1);
  const strongSell = Math.round(total * r() * 0.05);
  const current = entry.price;
  const avg = +(current * (1.05 + r() * 0.15)).toFixed(0);
  const low = +(current * (0.85 + r() * 0.1)).toFixed(0);
  const high = +(current * (1.15 + r() * 0.2)).toFixed(0);
  const upsidePct = Math.round((+avg - current) / current * 100);
  const firms = ["Goldman Sachs", "Morgan Stanley", "JP Morgan", "Bank of America", "Citi", "UBS", "Barclays", "Wells Fargo", "Jefferies", "Morningstar"];
  const directions = (["upgrade", "maintain", "maintain"] as const);
  const ratings = ["Buy", "Overweight", "Neutral", "Outperform", "Accumulate"];
  const months = ["Jan", "Feb", "Mar", "Apr"];
  return {
    ratings: { strongBuy, buy, hold, sell, strongSell },
    priceTarget: { low: +low, avg: +avg, high: +high, current },
    annotation: `${upsidePct}% upside to consensus — ${strongBuy + buy > hold + sell ? "constructive" : "mixed"} analyst sentiment`,
    recentCalls: [0, 1, 2].map((i) => ({
      firm: firms[Math.floor(r() * firms.length)],
      direction: directions[Math.floor(r() * directions.length)],
      rating: ratings[Math.floor(r() * ratings.length)],
      target: +(+avg * (0.9 + r() * 0.2)).toFixed(0),
      date: `${months[Math.floor(r() * months.length)]} ${Math.floor(r() * 28) + 1}`,
    })),
  };
}

function generateETFAIOneLiner(symbol: string, entry: ETFDirectoryEntry): string {
  const templates = [
    `${entry.name} offers ${entry.category.toLowerCase()} exposure with a ${entry.expenseRatio.toFixed(2)}% expense ratio.`,
    `${entry.issuer}'s ${symbol} tracks the ${entry.indexTracked} across ${entry.holdings.toLocaleString()} holdings.`,
    `Low-cost ${entry.category.toLowerCase()} beta via ${symbol} — ${entry.dividendYield > 0 ? `${entry.dividendYield.toFixed(2)}% yield` : "growth-focused, no yield"} from ${entry.issuer}.`,
    `${symbol} provides diversified access to ${entry.category.toLowerCase()} at ${entry.expenseRatio.toFixed(2)}% annual cost.`,
  ];
  const r = seededRandom(hashSymbol(symbol) + 5);
  return templates[Math.floor(r() * templates.length)];
}

function generateETFBriefing(symbol: string, entry: ETFDirectoryEntry): AIBriefing {
  const r = seededRandom(hashSymbol(symbol) + 6);
  const upTarget = +(entry.price * (1.15 + r() * 0.2)).toFixed(0);
  const downTarget = +(entry.price * (0.75 + r() * 0.1)).toFixed(0);
  return {
    summary: `${entry.name} (${symbol}) is a ${entry.category.toLowerCase()} ETF managed by ${entry.issuer}, tracking the ${entry.indexTracked} since ${entry.inceptionYear}. With $${entry.aum.toFixed(0)}B in AUM and a ${entry.expenseRatio.toFixed(2)}% expense ratio, it offers cost-effective exposure to ${entry.holdings.toLocaleString()} holdings. ${entry.dividendYield > 1 ? `The fund distributes a ${entry.dividendYield.toFixed(2)}% yield on a ${entry.dividendFrequency.toLowerCase()} basis, making it attractive for income investors alongside growth participation.` : `The low dividend yield reflects a growth tilt in the underlying holdings.`}`,
    bullCase: { target: +upTarget, thesis: `Continued sector strength and macro tailwinds push ${symbol} to new highs; inflows from institutional allocations accelerate.` },
    bearCase: { target: +downTarget, thesis: `Rate sensitivity or sector rotation away from ${entry.category.toLowerCase()} leads to meaningful outflows and NAV compression.` },
    wildCard: { label: "Macro Shift", thesis: `A sudden regime change in interest rates or sector leadership could reprice the entire basket significantly.` },
    sources: `${entry.issuer} fund prospectus, ETF.com data, Morningstar category analysis`,
  };
}

function generateETFSimilar(symbol: string): string[] {
  const etfPool = Object.keys(ETF_DIRECTORY).filter((s) => s !== symbol);
  const r = seededRandom(hashSymbol(symbol) + 7);
  const picked: string[] = [];
  const shuffled = [...etfPool].sort(() => r() - 0.5);
  for (const s of shuffled) {
    if (picked.length >= 5) break;
    picked.push(s);
  }
  return picked;
}

function generatePosition(symbol: string, price: number): PositionData {
  const r = seededRandom(hashSymbol(symbol) + 8);
  const shares = +(5 + r() * 50).toFixed(2);
  const costBasis = +(price * (0.70 + r() * 0.25)).toFixed(2);
  const marketValue = +(shares * price).toFixed(2);
  const totalReturn = +(marketValue - shares * costBasis).toFixed(2);
  const totalReturnPercent = +((totalReturn / (shares * costBasis)) * 100).toFixed(2);
  const todayPnL = +(shares * price * (r() - 0.45) * 0.015).toFixed(2);
  return { shares, avgCost: costBasis, marketValue, totalReturn, totalReturnPercent, todayPnL };
}

function generateOwnership(symbol: string): OwnershipData {
  const r = seededRandom(hashSymbol(symbol) + 9);
  const institutions = +(50 + r() * 35).toFixed(1);
  const insiders = +(r() * 5).toFixed(1);
  const retail = +(100 - +institutions - +insiders).toFixed(1);
  const holders = ["Vanguard Group", "BlackRock", "State Street", "Fidelity", "JP Morgan", "T. Rowe Price"];
  return {
    breakdown: { institutions: +institutions, insiders: +insiders, retail: +retail },
    topHolders: [
      { name: holders[Math.floor(r() * holders.length)], percent: +(5 + r() * 5).toFixed(1), change: +((r() - 0.5) * 0.5).toFixed(1) },
      { name: holders[Math.floor(r() * holders.length)], percent: +(3 + r() * 4).toFixed(1), change: +((r() - 0.5) * 0.5).toFixed(1) },
      { name: holders[Math.floor(r() * holders.length)], percent: +(2 + r() * 3).toFixed(1), change: +((r() - 0.5) * 0.5).toFixed(1) },
    ],
    insiderActivity: [],
  };
}

function generateOptionsPulse(symbol: string, price: number): OptionsPulseData {
  const r = seededRandom(hashSymbol(symbol) + 10);
  const ivRank = Math.round(20 + r() * 60);
  const iv = +(15 + r() * 40).toFixed(1);
  const putCallRatio = +(0.5 + r() * 0.8).toFixed(2);
  const strikeStep = price > 500 ? 5 : price > 100 ? 2.5 : 1;
  const base = Math.round(price / strikeStep) * strikeStep;
  const expiries = ["Mar 21", "Apr 18", "May 16"];
  return {
    ivRank,
    iv,
    putCallRatio,
    ivAnnotation: ivRank > 60 ? "Elevated IV — options are expensive relative to historical norms" : ivRank < 30 ? "Compressed IV — options are cheap, favorable for buying premium" : "Moderately priced options — IV near its historical average",
    sentimentAnnotation: putCallRatio < 0.7 ? "Bullish sentiment — call buying dominates" : putCallRatio > 1.0 ? "Bearish/hedging activity elevated" : "Balanced put/call activity",
    mostActive: [
      { strike: base + strikeStep, type: "Call", expiry: expiries[0], volume: Math.round(5000 + r() * 20000), lastPrice: +(price * 0.008 + r() * price * 0.01).toFixed(2) },
      { strike: base - strikeStep, type: "Put", expiry: expiries[0], volume: Math.round(3000 + r() * 15000), lastPrice: +(price * 0.006 + r() * price * 0.008).toFixed(2) },
      { strike: base + strikeStep * 2, type: "Call", expiry: expiries[1], volume: Math.round(2000 + r() * 10000), lastPrice: +(price * 0.005 + r() * price * 0.007).toFixed(2) },
    ],
  };
}

// ─── Getter Functions ────────────────────────────────────────────────────────
// Each getter returns known data from the Record or generates plausible data.

export function getAIOneLiner(symbol: string): string {
  if (AI_ONE_LINERS[symbol]) return AI_ONE_LINERS[symbol];
  const entry = getETFInfo(symbol);
  return generateETFAIOneLiner(symbol, entry);
}

export function getAIBriefing(symbol: string): AIBriefing | null {
  if (AI_BRIEFINGS[symbol]) return AI_BRIEFINGS[symbol];
  const entry = ETF_DIRECTORY[symbol] ?? generateETFDirectoryEntry(symbol);
  return generateETFBriefing(symbol, entry);
}

export function getKeyMetrics(symbol: string): StockMetrics | null {
  if (KEY_METRICS[symbol]) return KEY_METRICS[symbol];
  const entry = getETFInfo(symbol);
  return generateETFKeyMetrics(symbol, entry);
}

export function getPerformance(symbol: string): PerformanceData | null {
  if (PERFORMANCE[symbol]) return PERFORMANCE[symbol];
  const entry = getETFInfo(symbol);
  return generateETFPerformance(symbol, entry);
}

export function getAnalystRatings(symbol: string): AnalystData | null {
  if (ANALYST_RATINGS[symbol]) return ANALYST_RATINGS[symbol];
  const entry = getETFInfo(symbol);
  return generateETFAnalystRatings(symbol, entry);
}

export function getSimilarStocks(symbol: string): string[] {
  if (SIMILAR_STOCKS[symbol]) return SIMILAR_STOCKS[symbol];
  return generateETFSimilar(symbol);
}

export function getPosition(symbol: string): PositionData | null {
  if (POSITIONS[symbol]) return POSITIONS[symbol];
  const entry = getETFInfo(symbol);
  return generatePosition(symbol, entry.price);
}

export function getOwnership(symbol: string): OwnershipData | null {
  if (OWNERSHIP[symbol]) return OWNERSHIP[symbol];
  return generateOwnership(symbol);
}

export function getOptionsPulse(symbol: string, price?: number): OptionsPulseData | null {
  if (OPTIONS_PULSE[symbol]) return OPTIONS_PULSE[symbol];
  const p = price ?? getETFInfo(symbol).price;
  return generateOptionsPulse(symbol, p);
}
