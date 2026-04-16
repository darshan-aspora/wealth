import type {
  HeatmapIndexDef,
  HeatmapIndexId,
  HeatmapStock,
  SectorDef,
  SectorId,
  SectorSlice,
  FilterDef,
} from "./types";

/* ================================================================== */
/*  Index definitions                                                   */
/* ================================================================== */

export const HEATMAP_INDICES: HeatmapIndexDef[] = [
  { id: "sp500", label: "S&P 500", shortLabel: "S&P 500" },
  { id: "nasdaq100", label: "NASDAQ 100", shortLabel: "NASDAQ 100" },
  { id: "dow30", label: "Dow Jones 30", shortLabel: "Dow 30" },
  { id: "russell2000", label: "Russell 2000", shortLabel: "Russell" },
];

export const SECTORS: Record<SectorId, SectorDef> = {
  tech: { id: "tech", label: "Technology", shortLabel: "Tech" },
  finance: { id: "finance", label: "Financials", shortLabel: "Finance" },
  health: { id: "health", label: "Health Care", shortLabel: "Health" },
  "consumer-disc": { id: "consumer-disc", label: "Consumer Discretionary", shortLabel: "Cons. Disc." },
  "consumer-stpl": { id: "consumer-stpl", label: "Consumer Staples", shortLabel: "Cons. Stpl." },
  "comm-svcs": { id: "comm-svcs", label: "Communication Services", shortLabel: "Comm." },
  industrials: { id: "industrials", label: "Industrials", shortLabel: "Indust." },
  energy: { id: "energy", label: "Energy", shortLabel: "Energy" },
  utilities: { id: "utilities", label: "Utilities", shortLabel: "Utils" },
  "real-estate": { id: "real-estate", label: "Real Estate", shortLabel: "RE" },
  materials: { id: "materials", label: "Materials", shortLabel: "Mat." },
};

/* ================================================================== */
/*  Demo watchlist                                                      */
/* ================================================================== */

export const HEATMAP_WATCHLIST: Set<string> = new Set([
  "AAPL",
  "NVDA",
  "TSLA",
  "AMZN",
  "GOOGL",
  "JPM",
  "MSFT",
]);

/* ================================================================== */
/*  Deterministic pseudo-random (so tile values stay stable)            */
/* ================================================================== */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pr(seed: string, salt: string): number {
  // returns a number in [0, 1)
  return (hash(seed + "|" + salt) % 1_000_000) / 1_000_000;
}

function prRange(seed: string, salt: string, min: number, max: number) {
  return min + pr(seed, salt) * (max - min);
}

function prSigned(seed: string, salt: string, absMax: number) {
  return (pr(seed, salt) * 2 - 1) * absMax;
}

/* ================================================================== */
/*  Core definitions — a seed list of real tickers with hand-picked     */
/*  weights, sectors, prices, headlines. Period returns are             */
/*  deterministically derived so lenses look coherent.                  */
/* ================================================================== */

interface SeedStock {
  symbol: string;
  name: string;
  sector: SectorId;
  price: number; // approximate
  chg1d: number; // hand-picked for visual character
  headline: string;
  earningsSoon?: boolean;
  newHigh52w?: boolean;
  newLow52w?: boolean;
  upgradeOrDowngrade?: boolean;
}

const SEED_STOCKS: SeedStock[] = [
  // Mega tech
  { symbol: "AAPL",  name: "Apple", sector: "tech", price: 232.1, chg1d:  1.2, headline: "Services hit record; Vision Pro pipeline widens", newHigh52w: true },
  { symbol: "MSFT",  name: "Microsoft", sector: "tech", price: 428.7, chg1d: -0.4, headline: "Azure AI revenue grows 42% year-over-year" },
  { symbol: "NVDA",  name: "Nvidia", sector: "tech", price: 892.4, chg1d:  2.8, headline: "Tops earnings; data-center demand re-accelerates", earningsSoon: true, newHigh52w: true, upgradeOrDowngrade: true },
  { symbol: "AMZN",  name: "Amazon", sector: "consumer-disc", price: 184.3, chg1d:  0.9, headline: "AWS margin expansion continues into Q4" },
  { symbol: "GOOGL", name: "Alphabet", sector: "comm-svcs", price: 168.9, chg1d: -1.1, headline: "Search ad pricing softens; cloud beats" },
  { symbol: "META",  name: "Meta Platforms", sector: "comm-svcs", price: 514.2, chg1d:  1.5, headline: "Reels monetization outpacing Stories" },
  { symbol: "TSLA",  name: "Tesla", sector: "consumer-disc", price: 241.6, chg1d: -2.3, headline: "Production guide trimmed on Berlin retool", earningsSoon: true },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "finance", price: 441.8, chg1d:  0.3, headline: "Cash pile hits record $277B" },
  { symbol: "AVGO",  name: "Broadcom", sector: "tech", price: 1692.0, chg1d:  1.8, headline: "AI silicon book-to-bill above 2.0" },
  { symbol: "LLY",   name: "Eli Lilly", sector: "health", price: 798.2, chg1d: -0.7, headline: "Mounjaro supply stabilizes; Europe launch on track" },
  { symbol: "JPM",   name: "JPMorgan", sector: "finance", price: 206.4, chg1d:  0.5, headline: "NII guide nudged up on deposit mix" },
  { symbol: "V",     name: "Visa", sector: "finance", price: 278.9, chg1d:  0.2, headline: "Cross-border volume reaches pre-pandemic strength" },
  { symbol: "UNH",   name: "UnitedHealth", sector: "health", price: 521.3, chg1d: -0.9, headline: "MLR prints inside guide; outlook intact" },
  { symbol: "MA",    name: "Mastercard", sector: "finance", price: 465.1, chg1d:  0.4, headline: "Travel spending re-accelerates in APAC" },
  { symbol: "XOM",   name: "Exxon Mobil", sector: "energy", price: 112.8, chg1d: -1.5, headline: "Permian unit costs down 6% y/y", newLow52w: true },
  { symbol: "HD",    name: "Home Depot", sector: "consumer-disc", price: 362.4, chg1d:  0.6, headline: "Pro-contractor spend firms ahead of spring" },
  { symbol: "PG",    name: "Procter & Gamble", sector: "consumer-stpl", price: 164.9, chg1d:  0.1, headline: "Pricing power moderating as expected" },
  { symbol: "COST",  name: "Costco", sector: "consumer-stpl", price: 892.7, chg1d:  0.8, headline: "Membership renewal rate holds near 93%", newHigh52w: true },
  { symbol: "JNJ",   name: "Johnson & Johnson", sector: "health", price: 156.1, chg1d: -0.3, headline: "Med-tech returning to low-teens growth" },
  { symbol: "ABBV",  name: "AbbVie", sector: "health", price: 189.4, chg1d:  1.1, headline: "Immunology pipeline read-through lifts sentiment" },
  { symbol: "CRM",   name: "Salesforce", sector: "tech", price: 298.6, chg1d: -1.8, headline: "Agentforce deal cycle lengthening slightly" },
  { symbol: "BAC",   name: "Bank of America", sector: "finance", price: 44.3, chg1d:  0.7, headline: "Trading desk revenue at decade high" },
  { symbol: "NFLX",  name: "Netflix", sector: "comm-svcs", price: 691.2, chg1d:  2.1, headline: "Ad-tier subs grow faster than models pencilled", earningsSoon: true, newHigh52w: true },
  { symbol: "AMD",   name: "AMD", sector: "tech", price: 158.4, chg1d:  3.2, headline: "MI300 order book extends through mid-year", upgradeOrDowngrade: true },
  { symbol: "KO",    name: "Coca-Cola", sector: "consumer-stpl", price: 63.8, chg1d: -0.2, headline: "Volume growth rebounds in Latin America" },
  { symbol: "WMT",   name: "Walmart", sector: "consumer-stpl", price: 91.4, chg1d:  0.5, headline: "Ad business crosses $3B run-rate" },
  { symbol: "PEP",   name: "PepsiCo", sector: "consumer-stpl", price: 161.2, chg1d:  0.0, headline: "Snacks slow, beverages accelerate" },
  { symbol: "MRK",   name: "Merck", sector: "health", price: 126.5, chg1d: -0.8, headline: "Keytruda indication expansion on track" },
  { symbol: "CVX",   name: "Chevron", sector: "energy", price: 159.8, chg1d: -1.2, headline: "Tengiz expansion milestones hit" },
  { symbol: "ADBE",  name: "Adobe", sector: "tech", price: 482.7, chg1d: -0.6, headline: "Firefly adoption quietly compounding" },
  { symbol: "QCOM",  name: "Qualcomm", sector: "tech", price: 172.3, chg1d:  1.3, headline: "Handset channel inventory normalized" },
  { symbol: "INTC",  name: "Intel", sector: "tech", price: 34.2, chg1d: -2.7, headline: "Foundry lane delay pressures 2025 outlook", newLow52w: true, upgradeOrDowngrade: true },
  { symbol: "INTU",  name: "Intuit", sector: "tech", price: 625.4, chg1d:  0.4, headline: "Credit Karma re-accelerates" },
  { symbol: "AMAT",  name: "Applied Materials", sector: "tech", price: 218.6, chg1d:  2.4, headline: "China front-end demand better than feared" },
  { symbol: "PYPL",  name: "PayPal", sector: "finance", price: 72.1, chg1d: -0.8, headline: "Braintree margin pass-through improving" },
  { symbol: "BKNG",  name: "Booking.com", sector: "consumer-disc", price: 4128.0, chg1d:  0.6, headline: "Room nights exit March well above 2019" },
  { symbol: "MU",    name: "Micron", sector: "tech", price: 119.8, chg1d:  1.9, headline: "HBM sold out through calendar 2025" },
  { symbol: "ISRG",  name: "Intuitive Surgical", sector: "health", price: 453.2, chg1d:  0.3, headline: "Ion procedure volumes inflect" },
  { symbol: "LRCX",  name: "Lam Research", sector: "tech", price: 942.1, chg1d:  2.0, headline: "NAND upgrade spend returning" },
  { symbol: "PANW",  name: "Palo Alto Networks", sector: "tech", price: 342.5, chg1d: -1.2, headline: "Platformization narrative hits speed bumps" },
  { symbol: "CSCO",  name: "Cisco", sector: "tech", price: 58.2, chg1d:  0.1, headline: "Splunk integration tracking ahead of plan" },
  { symbol: "ORCL",  name: "Oracle", sector: "tech", price: 147.6, chg1d:  1.1, headline: "OCI bookings visibility through FY26" },
  { symbol: "IBM",   name: "IBM", sector: "tech", price: 223.9, chg1d:  0.8, headline: "Red Hat consulting pipeline strong" },
  { symbol: "NOW",   name: "ServiceNow", sector: "tech", price: 886.4, chg1d:  1.4, headline: "Net-new ACV beat internal targets", newHigh52w: true },
  { symbol: "UBER",  name: "Uber", sector: "industrials", price: 76.8, chg1d:  0.9, headline: "Delivery margins crossing long-term targets" },
  { symbol: "DIS",   name: "Disney", sector: "comm-svcs", price: 112.4, chg1d: -0.4, headline: "Streaming profitability quarter milestone" },
  { symbol: "MCD",   name: "McDonald's", sector: "consumer-disc", price: 288.1, chg1d:  0.2, headline: "Value menu traffic recovery continues" },
  { symbol: "SBUX",  name: "Starbucks", sector: "consumer-disc", price: 94.7, chg1d: -1.4, headline: "China same-store sales still soft", earningsSoon: true },
  { symbol: "NKE",   name: "Nike", sector: "consumer-disc", price: 78.3, chg1d: -1.9, headline: "Wholesale reset pressures Q4 top line", newLow52w: true },
  { symbol: "GS",    name: "Goldman Sachs", sector: "finance", price: 467.2, chg1d:  0.8, headline: "IB activity pipeline builds into Q2" },
  { symbol: "MS",    name: "Morgan Stanley", sector: "finance", price: 102.5, chg1d:  0.6, headline: "Wealth management NNM ahead of plan" },
  { symbol: "BA",    name: "Boeing", sector: "industrials", price: 174.3, chg1d: -2.1, headline: "737 MAX monthly deliveries slip again" },
  { symbol: "CAT",   name: "Caterpillar", sector: "industrials", price: 342.8, chg1d:  1.0, headline: "Energy & Transportation backlog at record" },
  { symbol: "GE",    name: "GE Aerospace", sector: "industrials", price: 168.9, chg1d:  1.6, headline: "Services revenue outpaces equipment" },
  { symbol: "RTX",   name: "RTX Corp", sector: "industrials", price: 114.2, chg1d:  0.3, headline: "GTF repair capacity ramping" },
  { symbol: "HON",   name: "Honeywell", sector: "industrials", price: 205.8, chg1d: -0.2, headline: "Aerospace aftermarket gaining share" },
  { symbol: "UPS",   name: "UPS", sector: "industrials", price: 138.6, chg1d: -0.9, headline: "Network rebalancing charges linger" },
  { symbol: "FDX",   name: "FedEx", sector: "industrials", price: 275.4, chg1d:  0.7, headline: "Express margins inflect as expected" },
  { symbol: "LIN",   name: "Linde", sector: "materials", price: 458.3, chg1d:  0.5, headline: "Clean hydrogen backlog at $7B" },
  { symbol: "APD",   name: "Air Products", sector: "materials", price: 265.1, chg1d:  0.2, headline: "NEOM project milestones on track" },
  { symbol: "NEE",   name: "NextEra Energy", sector: "utilities", price: 78.5, chg1d:  0.4, headline: "Renewables backlog hits 22 GW" },
  { symbol: "DUK",   name: "Duke Energy", sector: "utilities", price: 112.1, chg1d: -0.1, headline: "Rate case outcomes steady" },
  { symbol: "SO",    name: "Southern Company", sector: "utilities", price: 84.2, chg1d:  0.0, headline: "Vogtle Unit 4 commercial operations" },
  { symbol: "AMT",   name: "American Tower", sector: "real-estate", price: 218.7, chg1d: -0.5, headline: "Carrier capex trends stabilize" },
  { symbol: "PLD",   name: "Prologis", sector: "real-estate", price: 119.4, chg1d: -0.3, headline: "Logistics demand normalizing post-restock" },
  { symbol: "EQIX",  name: "Equinix", sector: "real-estate", price: 854.6, chg1d:  0.7, headline: "AI tenant mix growing in deal flow" },
  { symbol: "COP",   name: "ConocoPhillips", sector: "energy", price: 111.5, chg1d: -1.3, headline: "Willow project pace matches plan" },
  { symbol: "SLB",   name: "SLB", sector: "energy", price: 46.8, chg1d: -1.6, headline: "International services demand mixed" },
];

/* Deterministically extend each seed stock into a full HeatmapStock */
function deriveStock(seed: SeedStock, weight: number): HeatmapStock {
  const s = seed.symbol;
  const mc = prRange(s, "mc", 40, 3500); // billion
  const v = Math.max(0.05, prRange(s, "v", 0.2, 95)); // today volume (M)
  const avgV = Math.max(0.05, prRange(s, "avgV", 0.4, 90));
  const vol = prRange(s, "vol", 12, 55);
  const rsi = prRange(s, "rsi", 18, 82);
  // Period returns — somewhat correlated with chg1d but with noise
  const drift = prSigned(s, "drift", 14);
  const noise = (salt: string, amp: number) => prSigned(s, salt, amp);
  const chg1w = seed.chg1d * 1.4 + noise("w", 3.2);
  const chg1m = drift + noise("m", 5);
  const chg3m = drift * 1.6 + noise("3m", 8);
  const chg6m = drift * 1.9 + noise("6m", 9);
  const chgYtd = drift * 2.1 + noise("ytd", 10);
  const chg1y = drift * 3 + noise("1y", 22);
  // Sector-relative strength — stock 1M minus rough sector 1M (we'll refine later)
  const relStrength = noise("rs", 8);
  // Intraday pieces — derive as fractions of chg1d plus noise
  const chg1h = seed.chg1d * 0.22 + noise("1h", 0.6);
  const chg4h = seed.chg1d * 0.55 + noise("4h", 1.1);
  const preMarket = noise("pre", 1.4);
  const postMarket = noise("post", 1.3);
  const gap = noise("gap", 1.6);
  return {
    symbol: seed.symbol,
    name: seed.name,
    sector: seed.sector,
    price: seed.price,
    marketCap: mc,
    weight,
    chg1h,
    chg4h,
    preMarket,
    postMarket,
    gap,
    chg1d: seed.chg1d,
    chg1w,
    chg1m,
    chg3m,
    chg6m,
    chgYtd,
    chg1y,
    volume: v,
    volume1w: v * prRange(s, "v1w", 4.2, 6.0),
    volume1m: v * prRange(s, "v1m", 16, 24),
    avgVolume30d: avgV,
    high52w: seed.price * (1 + prRange(s, "hi", 0.03, 0.35)),
    low52w: seed.price * (1 - prRange(s, "lo", 0.05, 0.45)),
    volatility: vol,
    rsi,
    relStrength,
    earningsSoon: seed.earningsSoon ?? false,
    newHigh52w: seed.newHigh52w ?? false,
    newLow52w: seed.newLow52w ?? false,
    upgradeOrDowngrade: seed.upgradeOrDowngrade ?? false,
    headline: seed.headline,
  };
}

/* ================================================================== */
/*  Per-index weight fixtures                                           */
/* ================================================================== */

// S&P 500 top ~60 (by weight). Values approximate.
const SP500_WEIGHTS: Record<string, number> = {
  AAPL: 7.1, MSFT: 6.8, NVDA: 6.2, AMZN: 3.8, GOOGL: 3.6, META: 2.8, TSLA: 2.1,
  "BRK.B": 1.9, AVGO: 1.7, LLY: 1.6, JPM: 1.4, V: 1.3, UNH: 1.2, MA: 1.1,
  XOM: 1.0, HD: 0.9, PG: 0.9, COST: 0.8, JNJ: 0.8, ABBV: 0.7, CRM: 0.7,
  BAC: 0.6, NFLX: 0.6, AMD: 0.6, KO: 0.5, WMT: 1.1, PEP: 0.6, MRK: 0.7,
  CVX: 0.6, ADBE: 0.5, QCOM: 0.5, INTC: 0.3, INTU: 0.5, AMAT: 0.4, PYPL: 0.2,
  BKNG: 0.4, MU: 0.3, ISRG: 0.4, ORCL: 0.7, IBM: 0.4, NOW: 0.5,
  UBER: 0.4, DIS: 0.4, MCD: 0.5, SBUX: 0.3, NKE: 0.3, GS: 0.4, MS: 0.4,
  BA: 0.3, CAT: 0.4, GE: 0.4, RTX: 0.4, HON: 0.4, UPS: 0.3, FDX: 0.2,
  LIN: 0.4, APD: 0.2, NEE: 0.3, DUK: 0.2, SO: 0.2, AMT: 0.2, PLD: 0.2,
  EQIX: 0.2, COP: 0.3, SLB: 0.2, CSCO: 0.4, LRCX: 0.3, PANW: 0.2,
};

// NASDAQ 100: subset of above that trades on NASDAQ (or in the tech mix).
const NASDAQ100_WEIGHTS: Record<string, number> = {
  AAPL: 11.2, MSFT: 10.5, NVDA: 9.8, AMZN: 5.8, META: 4.8, GOOGL: 4.2,
  AVGO: 3.5, TSLA: 3.2, COST: 2.4, NFLX: 2.1, AMD: 1.9, ADBE: 1.7,
  CRM: 1.5, QCOM: 1.4, INTC: 1.2, INTU: 1.1, AMAT: 1.0, PYPL: 0.9,
  BKNG: 0.8, MU: 0.7, ISRG: 0.7, LRCX: 0.6, PANW: 0.5, CSCO: 1.6,
  ORCL: 1.8, SBUX: 0.6, NOW: 1.0, PEP: 2.0,
};

// Dow 30: equal(ish) weights with slight price-weighting skew
const DOW30_WEIGHTS: Record<string, number> = {
  AAPL: 4.6, MSFT: 5.8, NVDA: 6.0, JPM: 5.4, V: 4.2, UNH: 4.8, HD: 5.0,
  JNJ: 2.8, PG: 3.4, MCD: 4.2, MRK: 3.0, CVX: 3.6, WMT: 3.8, IBM: 4.2,
  DIS: 2.6, CSCO: 1.8, KO: 1.6, NKE: 2.1, BA: 4.4, CAT: 5.4, GS: 6.2,
  MS: 2.4, HON: 4.0, AMGN: 3.8, CRM: 5.6, BAC: 1.6, TRV: 3.4, VZ: 1.8,
  MMM: 2.2, WBA: 0.8,
};

// Russell 2000 — use a separate small-cap set; here we'll synthesize smaller names.
const RUSSELL_SYMBOLS = [
  "PLTR", "SOFI", "RIVN", "MARA", "COIN", "HOOD", "IONQ", "SMCI",
  "ARM", "SNOW", "DDOG", "NET", "CRWD", "ZS", "MDB", "OKTA",
  "RBLX", "U", "DKNG", "PENN", "BABA", "NIO", "LCID", "RIDE",
  "GME", "AMC", "BB", "NOK", "F", "GM", "CCL", "NCLH",
  "DAL", "UAL", "AAL", "LUV", "HLT", "MAR", "YELP", "PINS",
];

// Build a hand-shaped Russell sub-list: reuse a few from seed; synthesize tails.
const RUSSELL_SEEDS: SeedStock[] = [
  { symbol: "PLTR", name: "Palantir", sector: "tech", price: 24.8, chg1d: 4.2, headline: "Commercial US bookings up 64% y/y", newHigh52w: true },
  { symbol: "SOFI", name: "SoFi", sector: "finance", price: 8.3, chg1d: -1.9, headline: "Student loan originations climbing" },
  { symbol: "RIVN", name: "Rivian", sector: "consumer-disc", price: 12.7, chg1d: -3.4, headline: "Production guide on track but thin", newLow52w: true },
  { symbol: "MARA", name: "Marathon Digital", sector: "tech", price: 19.2, chg1d: 5.8, headline: "Hash rate climbs post-halving" },
  { symbol: "COIN", name: "Coinbase", sector: "finance", price: 228.4, chg1d: 3.1, headline: "Staking product mix recovers", newHigh52w: true },
  { symbol: "HOOD", name: "Robinhood", sector: "finance", price: 18.9, chg1d: 2.4, headline: "Crypto take-rate stabilizes" },
  { symbol: "IONQ", name: "IonQ", sector: "tech", price: 8.4, chg1d: 6.8, headline: "DARPA contract extended", upgradeOrDowngrade: true },
  { symbol: "SMCI", name: "Super Micro", sector: "tech", price: 712.3, chg1d: -4.1, headline: "Filing delay overhang clears" },
  { symbol: "ARM",  name: "Arm Holdings", sector: "tech", price: 132.4, chg1d: 2.8, headline: "Automotive royalties climbing" },
  { symbol: "SNOW", name: "Snowflake", sector: "tech", price: 156.3, chg1d: 1.4, headline: "AI tool attach surprises positively" },
  { symbol: "DDOG", name: "Datadog", sector: "tech", price: 122.8, chg1d: 1.0, headline: "LLM observability flywheel spinning" },
  { symbol: "NET",  name: "Cloudflare", sector: "tech", price: 97.6, chg1d: 0.5, headline: "Workers AI mindshare rising" },
  { symbol: "CRWD", name: "CrowdStrike", sector: "tech", price: 342.8, chg1d: -2.2, headline: "Attach rates expanding" },
  { symbol: "ZS",   name: "Zscaler", sector: "tech", price: 196.5, chg1d: -1.1, headline: "Data protection module traction" },
  { symbol: "MDB",  name: "MongoDB", sector: "tech", price: 278.4, chg1d: 0.2, headline: "Atlas consumption steadies" },
  { symbol: "OKTA", name: "Okta", sector: "tech", price: 87.9, chg1d: -0.8, headline: "Large-deal cycle lengthens" },
  { symbol: "RBLX", name: "Roblox", sector: "comm-svcs", price: 42.1, chg1d: 1.6, headline: "DAU growth reaccelerates on international" },
  { symbol: "U",    name: "Unity Software", sector: "tech", price: 22.3, chg1d: -2.6, headline: "Reset year narrative continues" },
  { symbol: "DKNG", name: "DraftKings", sector: "consumer-disc", price: 42.6, chg1d: 0.9, headline: "iCasino take-rate improving" },
  { symbol: "PENN", name: "Penn Entertainment", sector: "consumer-disc", price: 18.9, chg1d: -0.5, headline: "ESPN Bet app engagement beats" },
  { symbol: "BABA", name: "Alibaba ADR", sector: "consumer-disc", price: 76.4, chg1d: 1.2, headline: "Cloud reorganization underway" },
  { symbol: "NIO",  name: "NIO", sector: "consumer-disc", price: 5.2, chg1d: -3.8, headline: "Onvo brand launch approaching", newLow52w: true },
  { symbol: "LCID", name: "Lucid Group", sector: "consumer-disc", price: 2.8, chg1d: -5.1, headline: "Saudi PIF support reiterated", newLow52w: true },
  { symbol: "CCL",  name: "Carnival", sector: "consumer-disc", price: 16.8, chg1d: 1.5, headline: "Booking curve ahead of last year" },
  { symbol: "NCLH", name: "Norwegian Cruise", sector: "consumer-disc", price: 18.4, chg1d: 1.1, headline: "Caribbean premium routes sell out" },
  { symbol: "DAL",  name: "Delta Airlines", sector: "industrials", price: 48.2, chg1d: 0.8, headline: "Premium revenue mix expanding" },
  { symbol: "UAL",  name: "United Airlines", sector: "industrials", price: 52.6, chg1d: 1.3, headline: "Load factors at record" },
  { symbol: "AAL",  name: "American Airlines", sector: "industrials", price: 13.9, chg1d: -1.7, headline: "Capacity discipline tested" },
  { symbol: "LUV",  name: "Southwest", sector: "industrials", price: 27.8, chg1d: -0.9, headline: "Network redesign progresses" },
  { symbol: "F",    name: "Ford", sector: "consumer-disc", price: 10.8, chg1d: -1.4, headline: "Ford Pro services the bright spot" },
  { symbol: "GM",   name: "General Motors", sector: "consumer-disc", price: 48.6, chg1d: 0.6, headline: "Buyback pace steady" },
  { symbol: "GME",  name: "GameStop", sector: "consumer-disc", price: 12.8, chg1d: 8.2, headline: "Retail reset continues", upgradeOrDowngrade: true },
  { symbol: "AMC",  name: "AMC Theatres", sector: "comm-svcs", price: 4.2, chg1d: 3.4, headline: "Summer slate starting to work" },
  { symbol: "PINS", name: "Pinterest", sector: "comm-svcs", price: 34.6, chg1d: 1.8, headline: "Amazon ads partnership scaling" },
  { symbol: "YELP", name: "Yelp", sector: "comm-svcs", price: 38.2, chg1d: 0.4, headline: "Services ad mix keeps compounding" },
  { symbol: "HLT",  name: "Hilton", sector: "consumer-disc", price: 221.4, chg1d: 0.7, headline: "RevPAR recovery to continue" },
  { symbol: "MAR",  name: "Marriott", sector: "consumer-disc", price: 252.8, chg1d: 0.5, headline: "Owned/leased margins tick up" },
];

/* ================================================================== */
/*  Build per-index stock arrays                                        */
/* ================================================================== */

function buildStocksForIndex(weights: Record<string, number>, seeds: SeedStock[]): HeatmapStock[] {
  return seeds
    .filter((s) => weights[s.symbol] !== undefined)
    .map((s) => deriveStock(s, weights[s.symbol]));
}

// For Dow 30, some symbols aren't in SEED_STOCKS (AMGN, TRV, VZ, MMM, WBA). Add minimal seeds.
const EXTRA_DOW_SEEDS: SeedStock[] = [
  { symbol: "AMGN", name: "Amgen", sector: "health", price: 312.4, chg1d: 0.4, headline: "Obesity data read-through cleaner than feared" },
  { symbol: "TRV",  name: "Travelers", sector: "finance", price: 223.1, chg1d: 0.3, headline: "Loss ratios stable amid inflation" },
  { symbol: "VZ",   name: "Verizon", sector: "comm-svcs", price: 41.2, chg1d: -0.2, headline: "Wireless postpaid net adds inflect" },
  { symbol: "MMM",  name: "3M", sector: "industrials", price: 118.3, chg1d: -0.6, headline: "Solventum spinoff synergies underway" },
  { symbol: "WBA",  name: "Walgreens Boots", sector: "consumer-stpl", price: 9.2, chg1d: -3.2, headline: "Store closures continue", newLow52w: true },
];

const DOW_SEEDS = [...SEED_STOCKS, ...EXTRA_DOW_SEEDS];

export const heatmapStocksByIndex: Record<HeatmapIndexId, HeatmapStock[]> = {
  sp500: buildStocksForIndex(SP500_WEIGHTS, SEED_STOCKS),
  nasdaq100: buildStocksForIndex(NASDAQ100_WEIGHTS, SEED_STOCKS),
  dow30: buildStocksForIndex(DOW30_WEIGHTS, DOW_SEEDS),
  russell2000: buildStocksForIndex(
    Object.fromEntries(RUSSELL_SEEDS.map((s, i) => [s.symbol, 3 - i * 0.05])),
    RUSSELL_SEEDS,
  ),
};

/* Rough stock counts for sanity */
void RUSSELL_SYMBOLS; // kept for future enrichment

/* ================================================================== */
/*  Sector aggregates (derived from per-index stocks)                   */
/* ================================================================== */

function weightedAvg(xs: { w: number; v: number }[]): number {
  const totalW = xs.reduce((s, x) => s + x.w, 0);
  if (totalW === 0) return 0;
  return xs.reduce((s, x) => s + x.w * x.v, 0) / totalW;
}

function aggregateSectorSlices(stocks: HeatmapStock[]): SectorSlice[] {
  const bySector = new Map<SectorId, HeatmapStock[]>();
  for (const st of stocks) {
    const arr = bySector.get(st.sector) ?? [];
    arr.push(st);
    bySector.set(st.sector, arr);
  }
  const slices: SectorSlice[] = [];
  bySector.forEach((list, id) => {
    const pairs = (f: (s: HeatmapStock) => number) => list.map((s) => ({ w: s.weight, v: f(s) }));
    slices.push({
      id,
      label: SECTORS[id].label,
      weight: list.reduce((s, x) => s + x.weight, 0),
      chg1h: weightedAvg(pairs((s) => s.chg1h)),
      chg4h: weightedAvg(pairs((s) => s.chg4h)),
      preMarket: weightedAvg(pairs((s) => s.preMarket)),
      postMarket: weightedAvg(pairs((s) => s.postMarket)),
      gap: weightedAvg(pairs((s) => s.gap)),
      chg1d: weightedAvg(pairs((s) => s.chg1d)),
      chg1w: weightedAvg(pairs((s) => s.chg1w)),
      chg1m: weightedAvg(pairs((s) => s.chg1m)),
      chg3m: weightedAvg(pairs((s) => s.chg3m)),
      chg6m: weightedAvg(pairs((s) => s.chg6m)),
      chgYtd: weightedAvg(pairs((s) => s.chgYtd)),
      chg1y: weightedAvg(pairs((s) => s.chg1y)),
      avgVolume30d: list.reduce((s, x) => s + x.avgVolume30d, 0),
      volume: list.reduce((s, x) => s + x.volume, 0),
      volume1w: list.reduce((s, x) => s + x.volume1w, 0),
      volume1m: list.reduce((s, x) => s + x.volume1m, 0),
      volatility: weightedAvg(pairs((s) => s.volatility)),
      rsi: weightedAvg(pairs((s) => s.rsi)),
      relStrength: weightedAvg(pairs((s) => s.relStrength)),
      marketCap: list.reduce((s, x) => s + x.marketCap, 0),
    });
  });
  return slices.sort((a, b) => b.weight - a.weight);
}

export const heatmapSectorsByIndex: Record<HeatmapIndexId, SectorSlice[]> = {
  sp500: aggregateSectorSlices(heatmapStocksByIndex.sp500),
  nasdaq100: aggregateSectorSlices(heatmapStocksByIndex.nasdaq100),
  dow30: aggregateSectorSlices(heatmapStocksByIndex.dow30),
  russell2000: aggregateSectorSlices(heatmapStocksByIndex.russell2000),
};

/* ================================================================== */
/*  Filter chip definitions                                             */
/* ================================================================== */

export const FILTERS: FilterDef[] = [
  { id: "gainers", label: "Winners", hint: "Today's biggest gainers" },
  { id: "losers", label: "Falling knives", hint: "Down 1%+ today" },
  { id: "volume-spike", label: "Busy phones", hint: "Volume > 1.5× avg" },
  { id: "watchlist", label: "Your stuff", hint: "Stocks you're tracking" },
  { id: "near-high-52w", label: "Near 52W high", hint: "Within 3% of high" },
  { id: "near-low-52w", label: "Near 52W low", hint: "Within 5% of low" },
  { id: "earnings-soon", label: "Earnings soon", hint: "This week" },
];
