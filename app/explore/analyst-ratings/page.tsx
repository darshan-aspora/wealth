"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpDown, Bookmark } from "lucide-react";
import { StatusBar, HomeIndicator } from "@/components/iphone-frame";
import { ConsensusBadge } from "@/app/explore/components/movers-atoms";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RatingTab = "strong-buy" | "buy" | "hold" | "sell";
type CapSize = "mega" | "large" | "mid" | "small";

interface AnalystStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  pe: number | null;
  color: string;
  revGrowth: number;
  profitGrowth: number;
  rating: string;
  buyCount: number;
  holdCount: number;
  sellCount: number;
  targetPrice: number;
  sector?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ratingTabs: { id: RatingTab; label: string }[] = [
  { id: "strong-buy", label: "Strong Buy" },
  { id: "buy", label: "Buy" },
  { id: "hold", label: "Hold" },
  { id: "sell", label: "Sell" },
];

const capOrder: CapSize[] = ["mega", "large", "mid", "small"];
const capLabels: Record<CapSize, string> = {
  mega: "Mega Cap",
  large: "Large Cap",
  mid: "Mid Cap",
  small: "Small Cap",
};

/* ------------------------------------------------------------------ */
/*  Mock data — 4 tabs x ~15 stocks                                    */
/* ------------------------------------------------------------------ */

const stocksByRating: Record<RatingTab, AnalystStock[]> = {
  "strong-buy": [
    { symbol: "NVDA", name: "NVIDIA", price: 892.45, changePercent: 3.97, volume: "52M", marketCap: "2.2T", pe: 65.4, color: "#76B900", revGrowth: 122.4, profitGrowth: 581.2, rating: "Strong Buy", buyCount: 38, holdCount: 3, sellCount: 1, targetPrice: 1050.0 },
    { symbol: "AMZN", name: "Amazon", price: 186.42, changePercent: 2.18, volume: "46M", marketCap: "1.9T", pe: 58.2, color: "#FF9900", revGrowth: 12.5, profitGrowth: 37.8, rating: "Strong Buy", buyCount: 44, holdCount: 3, sellCount: 1, targetPrice: 225.0 },
    { symbol: "META", name: "Meta Platforms", price: 523.80, changePercent: 1.65, volume: "28M", marketCap: "1.3T", pe: 34.8, color: "#0668E1", revGrowth: 24.7, profitGrowth: 69.3, rating: "Strong Buy", buyCount: 36, holdCount: 3, sellCount: 1, targetPrice: 610.0 },
    { symbol: "LLY", name: "Eli Lilly", price: 782.35, changePercent: 0.92, volume: "3.2M", marketCap: "742B", pe: 112.6, color: "#D42B2B", revGrowth: 19.6, profitGrowth: 28.4, rating: "Strong Buy", buyCount: 25, holdCount: 2, sellCount: 1, targetPrice: 920.0 },
    { symbol: "AVGO", name: "Broadcom", price: 1320.60, changePercent: 2.44, volume: "5.1M", marketCap: "614B", pe: 38.2, color: "#CC0000", revGrowth: 34.2, profitGrowth: 44.1, rating: "Strong Buy", buyCount: 27, holdCount: 2, sellCount: 1, targetPrice: 1580.0 },
    { symbol: "CRM", name: "Salesforce", price: 272.40, changePercent: 1.33, volume: "6.8M", marketCap: "264B", pe: 46.1, color: "#00A1E0", revGrowth: 11.2, profitGrowth: 52.6, rating: "Strong Buy", buyCount: 32, holdCount: 4, sellCount: 1, targetPrice: 330.0 },
    { symbol: "CRWD", name: "CrowdStrike", price: 312.80, changePercent: 4.20, volume: "4.5M", marketCap: "75B", pe: null, color: "#F0293E", revGrowth: 35.8, profitGrowth: 124.5, rating: "Strong Buy", buyCount: 35, holdCount: 5, sellCount: 1, targetPrice: 380.0 },
    { symbol: "UBER", name: "Uber", price: 71.40, changePercent: 1.90, volume: "18M", marketCap: "148B", pe: 72.3, color: "#000000", revGrowth: 15.3, profitGrowth: 218.4, rating: "Strong Buy", buyCount: 30, holdCount: 8, sellCount: 1, targetPrice: 88.0 },
    { symbol: "NOW", name: "ServiceNow", price: 782.50, changePercent: 0.78, volume: "1.9M", marketCap: "161B", pe: 98.4, color: "#81B5A1", revGrowth: 25.1, profitGrowth: 38.7, rating: "Strong Buy", buyCount: 28, holdCount: 3, sellCount: 0, targetPrice: 920.0 },
    { symbol: "PANW", name: "Palo Alto Networks", price: 318.70, changePercent: 2.12, volume: "3.4M", marketCap: "106B", pe: 48.2, color: "#FA582D", revGrowth: 19.8, profitGrowth: 62.4, rating: "Strong Buy", buyCount: 34, holdCount: 4, sellCount: 1, targetPrice: 390.0 },
    { symbol: "ADBE", name: "Adobe", price: 524.60, changePercent: -0.34, volume: "3.1M", marketCap: "232B", pe: 44.8, color: "#FF0000", revGrowth: 10.4, profitGrowth: 15.2, rating: "Strong Buy", buyCount: 22, holdCount: 5, sellCount: 1, targetPrice: 620.0 },
    { symbol: "NFLX", name: "Netflix", price: 628.40, changePercent: 1.56, volume: "5.8M", marketCap: "272B", pe: 42.6, color: "#E50914", revGrowth: 14.8, profitGrowth: 54.3, rating: "Strong Buy", buyCount: 26, holdCount: 6, sellCount: 2, targetPrice: 750.0 },
    { symbol: "ISRG", name: "Intuitive Surgical", price: 412.80, changePercent: 0.45, volume: "2.1M", marketCap: "148B", pe: 72.4, color: "#005EB8", revGrowth: 16.2, profitGrowth: 28.6, rating: "Strong Buy", buyCount: 18, holdCount: 2, sellCount: 0, targetPrice: 490.0 },
    { symbol: "ABNB", name: "Airbnb", price: 156.73, changePercent: 1.82, volume: "8.4M", marketCap: "101B", pe: 38.4, color: "#FF5A5F", revGrowth: 17.6, profitGrowth: 22.1, rating: "Strong Buy", buyCount: 20, holdCount: 12, sellCount: 2, targetPrice: 195.0 },
    { symbol: "MELI", name: "MercadoLibre", price: 1648.20, changePercent: 2.68, volume: "0.8M", marketCap: "83B", pe: 62.8, color: "#FFE600", revGrowth: 37.4, profitGrowth: 82.6, rating: "Strong Buy", buyCount: 16, holdCount: 2, sellCount: 0, targetPrice: 2000.0 },
  ],
  buy: [
    { symbol: "MSFT", name: "Microsoft", price: 428.15, changePercent: 1.14, volume: "22M", marketCap: "3.2T", pe: 36.8, color: "#00A4EF", revGrowth: 15.2, profitGrowth: 20.4, rating: "Buy", buyCount: 35, holdCount: 8, sellCount: 1, targetPrice: 480.0 },
    { symbol: "AAPL", name: "Apple", price: 198.36, changePercent: 0.87, volume: "39M", marketCap: "3.0T", pe: 30.2, color: "#555555", revGrowth: 2.1, profitGrowth: 10.8, rating: "Buy", buyCount: 30, holdCount: 8, sellCount: 2, targetPrice: 220.0 },
    { symbol: "GOOGL", name: "Alphabet", price: 152.67, changePercent: -0.42, volume: "33M", marketCap: "1.9T", pe: 24.6, color: "#4285F4", revGrowth: 13.5, profitGrowth: 31.2, rating: "Buy", buyCount: 33, holdCount: 7, sellCount: 2, targetPrice: 175.0 },
    { symbol: "V", name: "Visa", price: 285.60, changePercent: 0.34, volume: "7.1M", marketCap: "588B", pe: 31.4, color: "#1A1F71", revGrowth: 10.6, profitGrowth: 17.2, rating: "Buy", buyCount: 28, holdCount: 5, sellCount: 1, targetPrice: 320.0 },
    { symbol: "UNH", name: "UnitedHealth", price: 524.30, changePercent: -0.68, volume: "4.3M", marketCap: "484B", pe: 22.8, color: "#002677", revGrowth: 14.1, profitGrowth: 11.5, rating: "Buy", buyCount: 22, holdCount: 5, sellCount: 1, targetPrice: 590.0 },
    { symbol: "JPM", name: "JPMorgan Chase", price: 198.73, changePercent: 0.52, volume: "9.4M", marketCap: "572B", pe: 11.8, color: "#003A6E", revGrowth: 8.2, profitGrowth: 12.4, rating: "Buy", buyCount: 18, holdCount: 10, sellCount: 1, targetPrice: 230.0 },
    { symbol: "MA", name: "Mastercard", price: 458.90, changePercent: 0.22, volume: "3.2M", marketCap: "432B", pe: 34.6, color: "#EB001B", revGrowth: 12.4, profitGrowth: 18.6, rating: "Buy", buyCount: 26, holdCount: 6, sellCount: 1, targetPrice: 520.0 },
    { symbol: "HD", name: "Home Depot", price: 362.40, changePercent: -0.16, volume: "4.8M", marketCap: "361B", pe: 24.2, color: "#F96302", revGrowth: 3.2, profitGrowth: 5.8, rating: "Buy", buyCount: 20, holdCount: 8, sellCount: 2, targetPrice: 410.0 },
    { symbol: "COST", name: "Costco", price: 724.80, changePercent: 0.64, volume: "2.4M", marketCap: "322B", pe: 48.6, color: "#E31837", revGrowth: 9.4, profitGrowth: 18.2, rating: "Buy", buyCount: 22, holdCount: 6, sellCount: 2, targetPrice: 830.0 },
    { symbol: "PLTR", name: "Palantir", price: 24.85, changePercent: 5.42, volume: "62M", marketCap: "54B", pe: null, color: "#101010", revGrowth: 20.8, profitGrowth: 156.4, rating: "Buy", buyCount: 8, holdCount: 6, sellCount: 2, targetPrice: 30.0 },
    { symbol: "DDOG", name: "Datadog", price: 124.60, changePercent: 2.18, volume: "5.2M", marketCap: "40B", pe: null, color: "#632CA6", revGrowth: 26.3, profitGrowth: 84.2, rating: "Buy", buyCount: 28, holdCount: 6, sellCount: 1, targetPrice: 155.0 },
    { symbol: "COIN", name: "Coinbase", price: 178.42, changePercent: 4.86, volume: "12M", marketCap: "42B", pe: 24.8, color: "#0052FF", revGrowth: 44.2, profitGrowth: 312.8, rating: "Buy", buyCount: 14, holdCount: 8, sellCount: 3, targetPrice: 210.0 },
    { symbol: "SHOP", name: "Shopify", price: 78.35, changePercent: 3.22, volume: "14M", marketCap: "99B", pe: null, color: "#96BF48", revGrowth: 23.6, profitGrowth: 142.4, rating: "Buy", buyCount: 22, holdCount: 10, sellCount: 1, targetPrice: 95.0 },
    { symbol: "MARA", name: "Marathon Digital", price: 18.92, changePercent: 6.84, volume: "38M", marketCap: "5.4B", pe: null, color: "#4A90D9", revGrowth: 228.4, profitGrowth: 412.6, rating: "Buy", buyCount: 5, holdCount: 3, sellCount: 1, targetPrice: 25.0 },
    { symbol: "SMCI", name: "Super Micro", price: 28.73, changePercent: 8.42, volume: "42M", marketCap: "16B", pe: 12.4, color: "#00539B", revGrowth: 110.4, profitGrowth: 87.6, rating: "Buy", buyCount: 6, holdCount: 3, sellCount: 1, targetPrice: 38.0 },
  ],
  hold: [
    { symbol: "KO", name: "Coca-Cola", price: 62.45, changePercent: 0.18, volume: "12M", marketCap: "270B", pe: 24.6, color: "#F40000", revGrowth: 2.4, profitGrowth: 5.2, rating: "Hold", buyCount: 8, holdCount: 14, sellCount: 2, targetPrice: 64.0 },
    { symbol: "PEP", name: "PepsiCo", price: 172.30, changePercent: -0.24, volume: "5.6M", marketCap: "237B", pe: 26.8, color: "#004B93", revGrowth: 1.8, profitGrowth: 3.4, rating: "Hold", buyCount: 7, holdCount: 13, sellCount: 2, targetPrice: 178.0 },
    { symbol: "PG", name: "Procter & Gamble", price: 168.90, changePercent: 0.12, volume: "6.8M", marketCap: "398B", pe: 28.4, color: "#003DA5", revGrowth: 3.2, profitGrowth: 4.8, rating: "Hold", buyCount: 6, holdCount: 14, sellCount: 2, targetPrice: 172.0 },
    { symbol: "VZ", name: "Verizon", price: 42.15, changePercent: -0.36, volume: "15M", marketCap: "177B", pe: 8.8, color: "#CD040B", revGrowth: -1.2, profitGrowth: -8.4, rating: "Hold", buyCount: 6, holdCount: 18, sellCount: 2, targetPrice: 44.0 },
    { symbol: "IBM", name: "IBM", price: 188.72, changePercent: 0.46, volume: "4.2M", marketCap: "172B", pe: 22.4, color: "#054ADA", revGrowth: 3.6, profitGrowth: 12.8, rating: "Hold", buyCount: 5, holdCount: 12, sellCount: 3, targetPrice: 192.0 },
    { symbol: "SQ", name: "Block Inc", price: 72.18, changePercent: -1.24, volume: "9.6M", marketCap: "44B", pe: null, color: "#3E4348", revGrowth: 8.4, profitGrowth: -14.2, rating: "Hold", buyCount: 10, holdCount: 14, sellCount: 4, targetPrice: 78.0 },
    { symbol: "SNAP", name: "Snap Inc", price: 11.24, changePercent: -3.42, volume: "45M", marketCap: "18B", pe: null, color: "#EAAB00", revGrowth: 5.2, profitGrowth: -62.4, rating: "Hold", buyCount: 5, holdCount: 18, sellCount: 8, targetPrice: 12.0 },
    { symbol: "RIVN", name: "Rivian", price: 15.63, changePercent: -2.68, volume: "39M", marketCap: "16B", pe: null, color: "#2D6A4F", revGrowth: 167.2, profitGrowth: -42.8, rating: "Hold", buyCount: 7, holdCount: 12, sellCount: 6, targetPrice: 16.5 },
    { symbol: "ROKU", name: "Roku", price: 62.40, changePercent: -1.86, volume: "8.2M", marketCap: "9B", pe: null, color: "#662D91", revGrowth: 11.4, profitGrowth: -34.6, rating: "Hold", buyCount: 6, holdCount: 14, sellCount: 5, targetPrice: 65.0 },
    { symbol: "HOOD", name: "Robinhood", price: 18.45, changePercent: -0.82, volume: "22M", marketCap: "16B", pe: null, color: "#00C805", revGrowth: 29.4, profitGrowth: -18.2, rating: "Hold", buyCount: 5, holdCount: 10, sellCount: 4, targetPrice: 20.0 },
    { symbol: "IONQ", name: "IonQ", price: 12.45, changePercent: 8.64, volume: "18M", marketCap: "2.6B", pe: null, color: "#5C2D91", revGrowth: 98.4, profitGrowth: -124.6, rating: "Hold", buyCount: 3, holdCount: 5, sellCount: 2, targetPrice: 13.0 },
    { symbol: "T", name: "AT&T", price: 17.82, changePercent: 0.22, volume: "28M", marketCap: "128B", pe: 7.2, color: "#009FDB", revGrowth: -2.4, profitGrowth: -18.6, rating: "Hold", buyCount: 8, holdCount: 16, sellCount: 4, targetPrice: 19.0 },
    { symbol: "WBD", name: "Warner Bros Discovery", price: 8.42, changePercent: -1.64, volume: "24M", marketCap: "20B", pe: null, color: "#004EBF", revGrowth: -3.8, profitGrowth: -82.4, rating: "Hold", buyCount: 4, holdCount: 12, sellCount: 6, targetPrice: 9.0 },
    { symbol: "PARA", name: "Paramount Global", price: 12.86, changePercent: -2.42, volume: "16M", marketCap: "8.4B", pe: null, color: "#0068C9", revGrowth: -5.6, profitGrowth: -94.2, rating: "Hold", buyCount: 2, holdCount: 10, sellCount: 6, targetPrice: 13.5 },
    { symbol: "F", name: "Ford Motor", price: 12.24, changePercent: -0.48, volume: "42M", marketCap: "49B", pe: 6.8, color: "#003478", revGrowth: 4.2, profitGrowth: -22.4, rating: "Hold", buyCount: 6, holdCount: 12, sellCount: 4, targetPrice: 13.0 },
  ],
  sell: [
    { symbol: "TSLA", name: "Tesla", price: 178.24, changePercent: -6.48, volume: "112M", marketCap: "568B", pe: 48.2, color: "#CC0000", revGrowth: 8.2, profitGrowth: -24.6, rating: "Sell", buyCount: 12, holdCount: 14, sellCount: 14, targetPrice: 152.0 },
    { symbol: "NKLA", name: "Nikola", price: 0.87, changePercent: -12.12, volume: "32M", marketCap: "418M", pe: null, color: "#2563EB", revGrowth: -42.8, profitGrowth: -186.4, rating: "Sell", buyCount: 0, holdCount: 2, sellCount: 6, targetPrice: 0.50 },
    { symbol: "BYND", name: "Beyond Meat", price: 7.82, changePercent: -8.24, volume: "4.8M", marketCap: "501M", pe: null, color: "#00A14B", revGrowth: -18.4, profitGrowth: -142.6, rating: "Sell", buyCount: 1, holdCount: 4, sellCount: 9, targetPrice: 5.50 },
    { symbol: "LYFT", name: "Lyft", price: 14.82, changePercent: -5.54, volume: "18M", marketCap: "5.8B", pe: null, color: "#FF00BF", revGrowth: 3.4, profitGrowth: -68.2, rating: "Sell", buyCount: 3, holdCount: 8, sellCount: 12, targetPrice: 11.0 },
    { symbol: "SPCE", name: "Virgin Galactic", price: 2.45, changePercent: -15.52, volume: "14M", marketCap: "684M", pe: null, color: "#1A1A2E", revGrowth: -84.6, profitGrowth: -224.8, rating: "Sell", buyCount: 0, holdCount: 3, sellCount: 8, targetPrice: 1.50 },
    { symbol: "WKHS", name: "Workhorse Group", price: 1.23, changePercent: -20.65, volume: "12M", marketCap: "118M", pe: null, color: "#4CAF50", revGrowth: -62.4, profitGrowth: -312.6, rating: "Sell", buyCount: 0, holdCount: 2, sellCount: 5, targetPrice: 0.80 },
    { symbol: "BILL", name: "BILL Holdings", price: 58.20, changePercent: -3.20, volume: "3.8M", marketCap: "6.2B", pe: null, color: "#00C4B4", revGrowth: -4.2, profitGrowth: -78.4, rating: "Sell", buyCount: 4, holdCount: 6, sellCount: 10, targetPrice: 48.0 },
    { symbol: "LCID", name: "Lucid Group", price: 3.42, changePercent: -9.26, volume: "28M", marketCap: "7.8B", pe: null, color: "#171717", revGrowth: 32.4, profitGrowth: -142.6, rating: "Sell", buyCount: 1, holdCount: 4, sellCount: 8, targetPrice: 2.50 },
    { symbol: "CVNA", name: "Carvana", price: 52.40, changePercent: -4.82, volume: "16M", marketCap: "10B", pe: null, color: "#00AEF0", revGrowth: -12.6, profitGrowth: -94.2, rating: "Sell", buyCount: 3, holdCount: 5, sellCount: 10, targetPrice: 38.0 },
    { symbol: "DASH", name: "DoorDash", price: 108.60, changePercent: -2.14, volume: "6.4M", marketCap: "42B", pe: null, color: "#FF3008", revGrowth: 22.4, profitGrowth: -46.8, rating: "Sell", buyCount: 8, holdCount: 10, sellCount: 14, targetPrice: 85.0 },
    { symbol: "OPEN", name: "Opendoor", price: 2.86, changePercent: -11.34, volume: "22M", marketCap: "1.8B", pe: null, color: "#5849FF", revGrowth: -38.4, profitGrowth: -182.4, rating: "Sell", buyCount: 1, holdCount: 3, sellCount: 8, targetPrice: 2.0 },
    { symbol: "WISH", name: "ContextLogic", price: 4.18, changePercent: -7.68, volume: "8.2M", marketCap: "316M", pe: null, color: "#2FB7EC", revGrowth: -52.6, profitGrowth: -264.2, rating: "Sell", buyCount: 0, holdCount: 1, sellCount: 6, targetPrice: 2.50 },
    { symbol: "AFRM", name: "Affirm", price: 34.60, changePercent: -5.46, volume: "12M", marketCap: "10B", pe: null, color: "#4A4AF4", revGrowth: 18.2, profitGrowth: -86.4, rating: "Sell", buyCount: 4, holdCount: 6, sellCount: 12, targetPrice: 25.0 },
    { symbol: "UPST", name: "Upstart", price: 28.40, changePercent: -8.92, volume: "9.6M", marketCap: "2.4B", pe: null, color: "#6C47FF", revGrowth: -22.6, profitGrowth: -128.4, rating: "Sell", buyCount: 2, holdCount: 4, sellCount: 8, targetPrice: 20.0 },
    { symbol: "PTON", name: "Peloton", price: 4.86, changePercent: -6.72, volume: "16M", marketCap: "1.7B", pe: null, color: "#232323", revGrowth: -16.8, profitGrowth: -112.4, rating: "Sell", buyCount: 1, holdCount: 5, sellCount: 10, targetPrice: 3.50 },
  ],
};

/* ------------------------------------------------------------------ */
/*  Columns definition                                                 */
/* ------------------------------------------------------------------ */

const columns = [
  { header: "Stock", align: "left" as const },
  { header: "Upside", align: "right" as const, minWidth: 72 },
  { header: "Consensus", align: "center" as const, minWidth: 120 },
  { header: "Price ($)", align: "right" as const, minWidth: 80 },
  { header: "Target", align: "right" as const, minWidth: 80 },
  { header: "1Y Change", align: "right" as const, minWidth: 80 },
  { header: "Avg Vol", align: "right" as const, minWidth: 68 },
  { header: "Mkt Cap", align: "right" as const, minWidth: 72 },
  { header: "Sector", align: "right" as const, minWidth: 64 },
  { header: "Watchlist", align: "center" as const, minWidth: 80 },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AnalystRatingsPage() {
  const router = useRouter();
  const [ratingTab, setRatingTab] = useState<RatingTab>("strong-buy");
  const [capSize, setCapSize] = useState<CapSize>("mega");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const cycleCapSize = () =>
    setCapSize((p) => capOrder[(capOrder.indexOf(p) + 1) % capOrder.length]);

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => {
      const n = new Set(p);
      if (n.has(sym)) n.delete(sym);
      else n.add(sym);
      return n;
    });

  const stocks = stocksByRating[ratingTab];

  /* ── Table infrastructure (frozen col + scrollable) ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [frozenW, setFrozenW] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const minFrozenWidth = 120;
  const scrollableMinWidth = 640;
  const visibleDataCols = 2;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrolled(el.scrollLeft > 0);
  }, []);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const table = tableRef.current;
    if (!container || !table) return;
    const ths = table.querySelectorAll("thead th");
    if (ths.length < visibleDataCols) return;
    let visibleSum = 0;
    for (let i = 0; i < visibleDataCols; i++) {
      visibleSum += ths[i].getBoundingClientRect().width;
    }
    const containerW = container.getBoundingClientRect().width;
    setFrozenW(Math.max(minFrozenWidth, containerW - visibleSum));
  }, []);

  useEffect(() => {
    measure();
  }, [measure, ratingTab, capSize]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  const alignCls = (align?: "left" | "center" | "right") =>
    align === "left" ? "text-left" : align === "center" ? "text-center" : "text-right";

  const frozenCol = columns[0];
  const scrollCols = columns.slice(1);

  /* ── Build rows ── */
  const rows = stocks.map((stock) => {
    const upside = +((stock.targetPrice / stock.price - 1) * 100).toFixed(1);
    return [
    /* Frozen: stock name + logo placeholder */
    <div key="name" className="flex items-center gap-2.5">
      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
      <p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">
        {stock.name}
      </p>
    </div>,
    /* Upside */
    <span key="upside" className={cn("whitespace-nowrap tabular-nums text-[14px] font-semibold", upside >= 0 ? "text-gain" : "text-loss")}>
      {upside >= 0 ? "+" : ""}{upside.toFixed(1)}%
    </span>,
    /* Consensus badge */
    <div key="consensus" className="flex justify-center">
      <ConsensusBadge buy={stock.buyCount} hold={stock.holdCount} sell={stock.sellCount} />
    </div>,
    /* Price */
    <span key="price" className="whitespace-nowrap tabular-nums text-[14px] text-foreground">
      {stock.price.toFixed(2)}
    </span>,
    /* Target */
    <span key="target" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
      {stock.targetPrice.toFixed(2)}
    </span>,
    /* 1Y Change */
    <span key="1y" className={cn("whitespace-nowrap tabular-nums text-[14px] font-semibold", stock.changePercent >= 0 ? "text-gain" : "text-loss")}>
      {stock.changePercent >= 0 ? "+" : ""}{(stock.changePercent * 4.2).toFixed(1)}%
    </span>,
    /* Avg Vol */
    <span key="avgvol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
      {stock.volume ?? "—"}
    </span>,
    /* Mkt Cap */
    <span key="mcap" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">
      {stock.marketCap}
    </span>,
    /* Sector */
    <span key="sector" className="whitespace-nowrap text-[14px] text-muted-foreground">
      {stock.sector ?? "Tech"}
    </span>,
    /* Watchlist */
    <div key="watch" className="flex justify-center">
      <button
        onClick={() => toggleBookmark(stock.symbol)}
        className="transition-transform active:scale-90"
      >
        <Bookmark
          size={20}
          strokeWidth={1.8}
          className={cn(
            "transition-colors",
            bookmarks.has(stock.symbol)
              ? "fill-foreground text-foreground"
              : "text-muted-foreground/50"
          )}
        />
      </button>
    </div>,
  ];
  });

  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-background text-foreground">
      <StatusBar />

      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 shrink-0">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-[17px] font-bold tracking-tight text-foreground ml-1">
          Analyst Ratings
        </h1>
        {/* Cap size flipper */}
        <button
          onClick={cycleCapSize}
          className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[13px] font-semibold text-foreground active:scale-[0.97] transition-transform"
        >
          <span className="leading-none">{capLabels[capSize]}</span>
          <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />
        </button>
      </header>

      {/* Sticky tabs */}
      <div className="shrink-0 border-b border-border/40 bg-background">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5">
            {ratingTabs.map((tab, i) => {
              const active = ratingTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRatingTab(tab.id)}
                  className={cn(
                    "relative whitespace-nowrap py-1.5 text-[14px] font-semibold transition-colors",
                    i === 0 ? "pr-3" : "px-3",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                  {active && (
                    <motion.span
                      layoutId="analyst-ratings-tab-underline"
                      className={cn(
                        "absolute bottom-0 right-3 h-[2px] rounded-full bg-foreground",
                        i === 0 ? "left-0" : "left-3"
                      )}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <main className="no-scrollbar flex-1 overflow-y-auto">
        <div ref={containerRef} className="pt-1 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${ratingTab}-${capSize}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              {/* Frozen first column */}
              <div
                className={cn(
                  "shrink-0 border-r transition-colors duration-200",
                  isScrolled ? "border-border/40" : "border-transparent"
                )}
                style={{ width: frozenW ?? minFrozenWidth }}
              >
                <div
                  className={cn(
                    "h-[40px] flex items-center pl-5 pr-3 text-[14px] font-medium text-muted-foreground",
                    alignCls(frozenCol?.align)
                  )}
                >
                  {frozenCol?.header}
                </div>
                {rows.map((row, i) => (
                  <div key={i} className="h-[64px] flex items-center pl-5 pr-3">
                    {row[0]}
                  </div>
                ))}
              </div>

              {/* Scrollable columns */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-x-auto no-scrollbar min-w-0"
              >
                <table ref={tableRef} style={{ minWidth: scrollableMinWidth }}>
                  <thead>
                    <tr className="h-[40px]">
                      {scrollCols.map((col, i) => (
                        <th
                          key={i}
                          className={cn(
                            "text-[14px] font-medium text-muted-foreground whitespace-nowrap px-3",
                            alignCls(col.align)
                          )}
                          style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                        >
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="h-[64px]">
                        {row.slice(1).map((cell, colIdx) => (
                          <td
                            key={colIdx}
                            className={cn(
                              "px-3 whitespace-nowrap",
                              alignCls(scrollCols[colIdx]?.align)
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {stocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-[16px] font-semibold text-foreground mb-1">No stocks found</p>
            <p className="text-[13px] text-muted-foreground max-w-[260px]">
              Try a different rating tab or cap size.
            </p>
          </div>
        )}

        <HomeIndicator />
      </main>
    </div>
  );
}
