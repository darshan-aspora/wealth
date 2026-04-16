import type { ColorAxis, HeatmapStock, SectorSlice, SizeAxis } from "./types";

/* ================================================================== */
/*  Squarified treemap layout                                           */
/* ================================================================== */

export interface HeatTile {
  x: number;
  y: number;
  w: number;
  h: number;
  id: string;
  value: number; // color axis value
  size: number; // size axis value (post-normalization)
}

export interface TreemapInput {
  id: string;
  size: number;
  value: number;
}

export function treemapLayout(
  items: TreemapInput[],
  W: number,
  H: number,
): HeatTile[] {
  if (!items.length) return [];

  const sorted = [...items].sort((a, b) => b.size - a.size);
  const totalSize = sorted.reduce((s, i) => s + i.size, 0);
  const totalArea = W * H;
  const areas = sorted.map((i) => (i.size / totalSize) * totalArea);
  const rects: HeatTile[] = [];

  function worst(cellAreas: number[], side: number): number {
    const total = cellAreas.reduce((s, a) => s + a, 0);
    const rowOther = total / side;
    let max = 0;
    for (const a of cellAreas) {
      const cellSide = a / rowOther;
      const r = Math.max(rowOther / cellSide, cellSide / rowOther);
      if (r > max) max = r;
    }
    return max;
  }

  function process(idxs: number[], bx: number, by: number, bw: number, bh: number) {
    if (!idxs.length) return;
    if (idxs.length === 1) {
      const i = idxs[0];
      rects.push({
        x: bx, y: by, w: bw, h: bh,
        id: sorted[i].id, value: sorted[i].value, size: sorted[i].size,
      });
      return;
    }
    const isWide = bw >= bh;
    const side = isWide ? bh : bw;
    let bestEnd = 0;
    let rowAreas: number[] = [];
    let bestWorst = Infinity;

    for (let i = 0; i < idxs.length; i++) {
      const test = [...rowAreas, areas[idxs[i]]];
      const w = worst(test, side);
      if (w <= bestWorst) {
        bestWorst = w;
        bestEnd = i;
        rowAreas = test;
      } else break;
    }

    const rowTotal = rowAreas.reduce((s, a) => s + a, 0);

    if (isWide) {
      const rw = rowTotal / bh;
      let py = by;
      for (let i = 0; i <= bestEnd; i++) {
        const ch = areas[idxs[i]] / rw;
        rects.push({
          x: bx, y: py, w: rw, h: ch,
          id: sorted[idxs[i]].id,
          value: sorted[idxs[i]].value,
          size: sorted[idxs[i]].size,
        });
        py += ch;
      }
      process(idxs.slice(bestEnd + 1), bx + rw, by, bw - rw, bh);
    } else {
      const rh = rowTotal / bw;
      let px = bx;
      for (let i = 0; i <= bestEnd; i++) {
        const cw = areas[idxs[i]] / rh;
        rects.push({
          x: px, y: by, w: cw, h: rh,
          id: sorted[idxs[i]].id,
          value: sorted[idxs[i]].value,
          size: sorted[idxs[i]].size,
        });
        px += cw;
      }
      process(idxs.slice(bestEnd + 1), bx, by + rh, bw, bh - rh);
    }
  }

  process(sorted.map((_, i) => i), 0, 0, W, H);
  return rects;
}

/* ================================================================== */
/*  Axis extractors                                                     */
/* ================================================================== */

export function getSizeValue(stock: HeatmapStock | SectorSlice, axis: SizeAxis): number {
  const price = "price" in stock ? stock.price : 1;
  switch (axis) {
    case "marketCap":
      // Use the index weight — proportional to market cap within this index
      return Math.max(0.05, stock.weight);
    case "volume1d":
      return Math.max(0.01, stock.volume);
    case "volume1w":
      return Math.max(0.01, stock.volume1w);
    case "volume1m":
      return Math.max(0.01, stock.volume1m);
    case "turnover1d":
      return Math.max(0.01, price * stock.volume);
    case "turnover1w":
      return Math.max(0.01, price * stock.volume1w);
    case "turnover1m":
      return Math.max(0.01, price * stock.volume1m);
    case "mono":
      return 1;
  }
}

export function getColorValue(stock: HeatmapStock | SectorSlice, axis: ColorAxis): number {
  switch (axis) {
    case "chg1h": return stock.chg1h;
    case "chg4h": return stock.chg4h;
    case "chg1d": return stock.chg1d;
    case "perfW": return stock.chg1w;
    case "perfM": return stock.chg1m;
    case "perf3M": return stock.chg3m;
    case "perf6M": return stock.chg6m;
    case "perfYTD": return stock.chgYtd;
    case "perfY": return stock.chg1y;
    case "preMarket": return stock.preMarket;
    case "postMarket": return stock.postMarket;
    case "relVolume":
      // ratio minus 1 — negative when below avg, positive when above
      return stock.volume / Math.max(0.01, stock.avgVolume30d) - 1;
    case "volatilityD":
      // Center around 25% — higher volatility reads "hot" (red side)
      return stock.volatility - 25;
    case "gap": return stock.gap;
  }
}

/** Axis-appropriate label for a value, used in tiles & the legend */
export function formatColorValue(v: number, axis: ColorAxis): string {
  switch (axis) {
    case "relVolume":
      return `${(v + 1).toFixed(1)}×`;
    case "volatilityD":
      return `${(v + 25).toFixed(0)}%`;
    default:
      return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
  }
}

/** What label describes the color axis in the legend */
export function colorAxisLabel(axis: ColorAxis): string {
  switch (axis) {
    case "chg1h": return "Change 1h, %";
    case "chg4h": return "Change 4h, %";
    case "chg1d": return "Change D, %";
    case "perfW": return "Performance W, %";
    case "perfM": return "Performance M, %";
    case "perf3M": return "Performance 3M, %";
    case "perf6M": return "Performance 6M, %";
    case "perfYTD": return "Performance YTD, %";
    case "perfY": return "Performance Y, %";
    case "preMarket": return "Pre-market Change, %";
    case "postMarket": return "Post-market Change, %";
    case "relVolume": return "Relative Volume";
    case "volatilityD": return "Volatility D, %";
    case "gap": return "Gap, %";
  }
}

export function sizeAxisLabel(axis: SizeAxis): string {
  switch (axis) {
    case "marketCap": return "Market cap";
    case "volume1d": return "Volume 1D";
    case "volume1w": return "Volume 1W";
    case "volume1m": return "Volume 1M";
    case "turnover1d": return "Price × Volume 1D";
    case "turnover1w": return "Price × Volume 1W";
    case "turnover1m": return "Price × Volume 1M";
    case "mono": return "Mono size";
  }
}

/** Scale for the color axis, used for the legend and the mapping */
export function colorScaleForAxis(axis: ColorAxis): { min: number; max: number; neutral: number } {
  switch (axis) {
    case "chg1h": return { min: -1, max: 1, neutral: 0 };
    case "chg4h": return { min: -2, max: 2, neutral: 0 };
    case "chg1d": return { min: -3, max: 3, neutral: 0 };
    case "perfW": return { min: -6, max: 6, neutral: 0 };
    case "perfM": return { min: -10, max: 10, neutral: 0 };
    case "perf3M": return { min: -15, max: 15, neutral: 0 };
    case "perf6M": return { min: -20, max: 20, neutral: 0 };
    case "perfYTD": return { min: -25, max: 25, neutral: 0 };
    case "perfY": return { min: -40, max: 40, neutral: 0 };
    case "preMarket": return { min: -2, max: 2, neutral: 0 };
    case "postMarket": return { min: -2, max: 2, neutral: 0 };
    case "relVolume": return { min: -1, max: 2, neutral: 0 };
    case "volatilityD": return { min: -20, max: 20, neutral: 0 };
    case "gap": return { min: -3, max: 3, neutral: 0 };
  }
}

/* ================================================================== */
/*  Color palette — 9 steps from deep red → neutral → deep green        */
/* ================================================================== */

const DARK_PALETTE = [
  "#4e2424",
  "#482626",
  "#422828",
  "#3d2a2a",
  "#2a2a2e",
  "#2a4436",
  "#223f30",
  "#1e3d2d",
  "#1a3a2a",
];

const LIGHT_PALETTE = [
  "#e4bcbc",
  "#eac8c8",
  "#f0d4d4",
  "#f5e0e0",
  "#ececee",
  "#e4f5ec",
  "#d9f0e3",
  "#cfeadb",
  "#c1e6d0",
];

/** Map a value on the given axis to a palette color */
export function heatColor(value: number, axis: ColorAxis, isDark: boolean): string {
  const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;
  const { min, max } = colorScaleForAxis(axis);
  // Clamp to [min, max], map to [0..1], then to palette index
  const range = max - min;
  if (range === 0) return palette[4];
  const t = Math.max(0, Math.min(1, (value - min) / range));
  const idx = Math.round(t * (palette.length - 1));
  return palette[idx];
}
