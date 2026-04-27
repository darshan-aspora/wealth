export interface GreekRow {
  strike: number;
  call: { ltp: number; ltpChgPct: number; oi: number; iv: number; delta: number; theta: number; vega: number; gamma: number };
  put: { ltp: number; ltpChgPct: number; oi: number; iv: number; delta: number; theta: number; vega: number; gamma: number };
}

export interface ExpiryGroupItem {
  date: string;
  tag: string;
}

export interface ExpiryGroup {
  label: string;
  items: ExpiryGroupItem[];
}

export function seeded(seed: number) {
  let s = Math.abs(seed) % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function hashStr(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function buildChain(currentPrice: number, seed: number): GreekRow[] {
  const rand = seeded(seed);
  const step = currentPrice > 500 ? 5 : currentPrice > 100 ? 2.5 : 1;
  const base = Math.round(currentPrice / step) * step;
  const rows: GreekRow[] = [];

  for (let i = -20; i <= 20; i++) {
    const strike = +(base + i * step).toFixed(1);
    const dist = (strike - currentPrice) / currentPrice;
    const absDist = Math.abs(dist);
    const iv = +(0.28 + absDist * 0.35 + rand() * 0.06).toFixed(2);
    const cDelta = +Math.max(0.01, Math.min(0.99, 0.5 - dist * 3.5 + (rand() - 0.5) * 0.04)).toFixed(2);
    const pDelta = +(cDelta - 1).toFixed(2);
    const gamma = +(Math.max(0.0001, 0.0009 * Math.exp(-absDist * 22) + rand() * 0.00015)).toFixed(4);
    const vega = Math.max(1, Math.round(14 * Math.exp(-absDist * 10) + rand() * 2));
    const theta = -Math.max(1, Math.round(18 * Math.exp(-absDist * 9) + rand() * 3));
    const callIntr = Math.max(0, currentPrice - strike);
    const putIntr = Math.max(0, strike - currentPrice);
    const tv = currentPrice * 0.018 * Math.max(0.04, 1 - absDist * 3);

    const oiBase = Math.round(80000 * Math.exp(-absDist * 18) + rand() * 15000);
    const callOI = Math.max(500, Math.round(oiBase * (0.8 + rand() * 0.4)));
    const putOI  = Math.max(500, Math.round(oiBase * (0.8 + rand() * 0.4)));
    rows.push({
      strike,
      call: { ltp: +(callIntr + tv + rand() * 0.3).toFixed(2), ltpChgPct: +((rand() - 0.45) * 7).toFixed(2), oi: callOI, iv, delta: cDelta, theta, vega, gamma },
      put: { ltp: +(putIntr + tv * 0.75 + rand() * 0.25).toFixed(2), ltpChgPct: +((rand() - 0.45) * 5).toFixed(2), oi: putOI, iv, delta: pDelta, theta, vega, gamma },
    });
  }

  return rows;
}

export const STOCK_PRICES: Record<string, { price: number; pct: number }> = {
  NVIDIA: { price: 924.8, pct: 3.2 },
  Apple: { price: 198.5, pct: 2.9 },
  Microsoft: { price: 425.3, pct: 2.2 },
  Alphabet: { price: 176.8, pct: 1.7 },
  Meta: { price: 502.4, pct: 1.5 },
};

export const EXPIRY_GROUPS_ETF: ExpiryGroup[] = [
  { label: "Daily", items: [{ date: "24 Apr 2026", tag: "0D" }, { date: "25 Apr 2026", tag: "1D" }, { date: "28 Apr 2026", tag: "2D" }] },
  { label: "Weekly", items: [{ date: "1 May 2026", tag: "1W" }, { date: "8 May 2026", tag: "2W" }, { date: "15 May 2026", tag: "3W" }, { date: "22 May 2026", tag: "4W" }] },
  { label: "Monthly", items: [{ date: "29 May 2026", tag: "May" }, { date: "26 Jun 2026", tag: "Jun" }, { date: "31 Jul 2026", tag: "Jul" }, { date: "28 Aug 2026", tag: "Aug" }] },
  { label: "Quarterly", items: [{ date: "25 Sep 2026", tag: "Sep Q" }, { date: "25 Dec 2026", tag: "Dec Q" }, { date: "26 Mar 2027", tag: "Mar Q" }] },
  { label: "Yearly", items: [{ date: "25 Dec 2026", tag: "2026" }, { date: "31 Dec 2027", tag: "2027" }, { date: "31 Dec 2028", tag: "2028" }] },
];

export const EXPIRY_GROUPS_STOCK: ExpiryGroup[] = [
  { label: "Weekly", items: [{ date: "1 May 2026", tag: "1W" }, { date: "8 May 2026", tag: "2W" }, { date: "15 May 2026", tag: "3W" }, { date: "22 May 2026", tag: "4W" }] },
  { label: "Monthly", items: [{ date: "29 May 2026", tag: "May" }, { date: "26 Jun 2026", tag: "Jun" }, { date: "31 Jul 2026", tag: "Jul" }, { date: "28 Aug 2026", tag: "Aug" }, { date: "25 Sep 2026", tag: "Sep" }, { date: "25 Dec 2026", tag: "Dec" }] },
  { label: "Yearly (LEAPS)", items: [{ date: "15 Jan 2027", tag: "Jan '27" }, { date: "21 Jan 2028", tag: "Jan '28 ✦" }, { date: "20 Jan 2032", tag: "Jan '32 ✦" }] },
];

export const ETF_INDEX_SYMBOLS = new Set([
  "SPY", "QQQ", "IWM", "DIA", "GLD", "SLV", "USO", "TLT", "HYG", "EEM",
  "VXX", "UVXY", "SQQQ", "TQQQ", "SPXL", "SPXS", "ACWI", "EFA", "VTI",
  "SPX", "NDX", "RUT", "VIX", "DJIA",
  "S&P 500", "NASDAQ 100",
  "SPDR S&P 500", "Invesco QQQ", "iShares Russell",
  "iShares MSCI ACWI ETF", "Invesco QQQ Trust Series 1",
]);

export function getExpiryGroups(symbol: string) {
  return ETF_INDEX_SYMBOLS.has(symbol) ? EXPIRY_GROUPS_ETF : EXPIRY_GROUPS_STOCK;
}

export function formatExpiryShort(expiry: string) {
  return expiry.replace(" 2026", "").replace(" 2027", " '27").replace(" 2028", " '28");
}
