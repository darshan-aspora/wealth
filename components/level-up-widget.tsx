"use client";

import { useState } from "react";
import {
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  Gem,
  Brain,
  Layers,
  Rocket,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StoriesViewer, type Story } from "@/components/stories-viewer";

type StockLevelUpTab = "strategies" | "insights";

interface LevelUpCard {
  id: string;
  title: string;
  hook: string;
  gradient: string;
  story: Story;
}

const stockLevelUpTabs: { id: StockLevelUpTab; label: string }[] = [
  { id: "strategies", label: "Strategies" },
  { id: "insights", label: "Insights" },
];

const stockLevelUpData: Record<StockLevelUpTab, LevelUpCard[]> = {
  strategies: [
    {
      id: "pe-trick", title: "What P/E Actually Tells You",
      hook: "It\u2019s not just \u201ccheap vs expensive.\u201d One number, decoded.",
      gradient: "from-zinc-600 to-zinc-900",
      story: { id: "s-pe", title: "P/E Decoded", subtitle: "Strategy", icon: <TrendingUp size={18} />, gradient: "from-zinc-800 to-zinc-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">P/E <span className="text-zinc-300">decoded.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <p className="text-[48px] font-bold text-white/80">25x</p>
            <p className="text-[16px] leading-relaxed text-white/50">A P/E of 25 means you pay 25 for every 1 of earnings. But high P/E isn&apos;t always bad &mdash; it can mean the market expects growth. Low P/E isn&apos;t always good &mdash; it can mean the market expects decline.</p>
            <div className="w-full rounded-2xl bg-white/8 px-4 py-3 text-left">
              <p className="text-[15px] font-semibold text-white">The one-liner</p>
              <p className="text-[13px] text-white/40">Compare P/E to the sector average, not the market. A tech stock at 30x and a bank at 30x are very different stories.</p>
            </div>
          </div>
        ),
      },
    },
    {
      id: "earnings-check", title: "The 10-Second Earnings Check",
      hook: "Revenue, EPS, guidance. Three numbers. That\u2019s it.",
      gradient: "from-neutral-600 to-neutral-900",
      story: { id: "s-earnings", title: "Earnings in 10s", subtitle: "Strategy", icon: <BarChart3 size={18} />, gradient: "from-neutral-800 to-neutral-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">3 numbers. <span className="text-neutral-300">10 seconds.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <div className="w-full space-y-2.5">
              {[
                { num: "1", label: "Revenue", desc: "Did the company sell more than expected? Top-line growth = demand." },
                { num: "2", label: "EPS", desc: "Earnings per share \u2014 beat or miss? This moves the stock after hours." },
                { num: "3", label: "Guidance", desc: "What management expects next quarter. This matters more than the beat." },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3 text-left">
                  <span className="text-[20px] font-bold text-white/60">{item.num}</span>
                  <div><p className="text-[15px] font-semibold text-white">{item.label}</p><p className="text-[13px] text-white/40">{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    },
    {
      id: "dca-power", title: "DCA: The Lazy Genius Move",
      hook: "Same amount, same day, every month. Why it beats timing.",
      gradient: "from-stone-600 to-stone-900",
      story: { id: "s-dca", title: "DCA Power", subtitle: "Strategy", icon: <Target size={18} />, gradient: "from-stone-800 to-stone-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">The lazy <span className="text-stone-300">genius</span> move.</div>
            <div className="h-px w-12 bg-white/15" />
            <p className="text-[16px] leading-relaxed text-white/50">Dollar-cost averaging means investing a fixed amount at regular intervals. You buy more shares when prices are low, fewer when they&apos;re high.</p>
            <div className="w-full rounded-2xl bg-white/8 px-4 py-3 text-left">
              <p className="text-[15px] font-semibold text-white">The math</p>
              <p className="text-[13px] text-white/40">500/month into the S&P 500 since 2014 &rarr; you&apos;d have invested 60,000 and it would be worth ~112,000. No timing required.</p>
            </div>
          </div>
        ),
      },
    },
    {
      id: "sell-winner", title: "When to Sell a Winner",
      hook: "The hardest decision in investing. Here\u2019s a framework.",
      gradient: "from-gray-600 to-gray-900",
      story: { id: "s-sell", title: "Selling Winners", subtitle: "Strategy", icon: <Zap size={18} />, gradient: "from-gray-800 to-gray-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">When to <span className="text-gray-300">let go.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <div className="w-full space-y-2.5">
              {[
                { label: "The thesis broke", desc: "You bought for a reason. If that reason no longer holds, sell." },
                { label: "It\u2019s now 40%+ of your portfolio", desc: "Concentration risk. Take some off the table." },
                { label: "You need the money", desc: "Investing has a purpose. If the purpose arrived, it\u2019s not \u201cselling early.\u201d" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/8 px-4 py-3 text-left">
                  <p className="text-[15px] font-semibold text-white">{item.label}</p>
                  <p className="text-[13px] text-white/40">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    },
    {
      id: "covered-call", title: "Covered Calls in 30 Seconds",
      hook: "Own the stock. Sell the upside. Collect the premium.",
      gradient: "from-zinc-500 to-zinc-900",
      story: { id: "s-cc", title: "Covered Calls", subtitle: "Strategy", icon: <Gem size={18} />, gradient: "from-zinc-800 to-zinc-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">Income from <span className="text-zinc-300">stocks you own.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <div className="w-full space-y-2.5">
              {[
                { num: "1", desc: "You own 100 shares of AAPL at 185" },
                { num: "2", desc: "You sell a call at 195 strike, expiring in 30 days" },
                { num: "3", desc: "You collect ~3.50 per share = 350 premium, instantly" },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3 text-left">
                  <span className="text-[20px] font-bold text-white/60">{item.num}</span>
                  <p className="text-[14px] text-white/50">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-[14px] text-white/30">If AAPL stays below 195, you keep the shares + the premium. If it goes above, you sell at 195 + keep the premium. Win-win.</p>
          </div>
        ),
      },
    },
  ],
  insights: [
    {
      id: "time-vs-timing", title: "Why Time Beats Timing",
      hook: "Miss the 10 best days in 20 years and your returns get cut in half.",
      gradient: "from-neutral-500 to-neutral-900",
      story: { id: "i-time", title: "Time > Timing", subtitle: "Insight", icon: <TrendingUp size={18} />, gradient: "from-neutral-800 to-neutral-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">Time <span className="text-neutral-300">always</span> wins.</div>
            <div className="h-px w-12 bg-white/15" />
            <div className="flex gap-6">
              <div><p className="text-[28px] font-bold text-white/80">9.8%</p><p className="text-[12px] text-white/40">Stayed invested</p></div>
              <div><p className="text-[28px] font-bold text-white/40">5.6%</p><p className="text-[12px] text-white/40">Missed 10 best days</p></div>
            </div>
            <p className="text-[16px] leading-relaxed text-white/50">S&P 500 over 20 years. The 10 best days often come right after the worst. If you panicked and sold, you missed the recovery. Staying invested is the strategy.</p>
          </div>
        ),
      },
    },
    {
      id: "compounding", title: "The Power of Compounding",
      hook: "1,000 growing at 10% becomes 17,449 in 30 years. No extra effort.",
      gradient: "from-stone-500 to-stone-900",
      story: { id: "i-compound", title: "Compounding", subtitle: "Insight", icon: <Rocket size={18} />, gradient: "from-stone-800 to-stone-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">The 8th <span className="text-stone-300">wonder.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <div className="flex gap-4">
              <div><p className="text-[24px] font-bold text-white/80">1,000</p><p className="text-[12px] text-white/40">Year 0</p></div>
              <div><p className="text-[24px] font-bold text-white/80">6,727</p><p className="text-[12px] text-white/40">Year 20</p></div>
              <div><p className="text-[24px] font-bold text-white/80">17,449</p><p className="text-[12px] text-white/40">Year 30</p></div>
            </div>
            <p className="text-[16px] leading-relaxed text-white/50">That last 10 years added more than the first 20. Compounding is exponential &mdash; the longer you stay, the harder your money works.</p>
          </div>
        ),
      },
    },
    {
      id: "good-news-drop", title: "Why Stocks Drop on Good News",
      hook: "\u201cBeat earnings by 20%\u201d \u2014 stock drops 8%. Here\u2019s why.",
      gradient: "from-gray-500 to-gray-900",
      story: { id: "i-drop", title: "Good News, Bad Price", subtitle: "Insight", icon: <BarChart3 size={18} />, gradient: "from-gray-800 to-gray-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">Buy the <span className="text-gray-300">rumor.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <p className="text-[16px] leading-relaxed text-white/50">Markets are forward-looking. By the time earnings drop, the stock already moved on expectations. A &ldquo;beat&rdquo; that was already priced in is actually a non-event.</p>
            <div className="w-full space-y-2.5">
              {[
                { label: "Priced in", desc: "Stock ran up 15% into earnings. The beat was expected." },
                { label: "Sell the news", desc: "Traders who bought the rumor take profits on the event." },
                { label: "Guidance matters more", desc: "The beat was great. But management lowered next quarter." },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/8 px-4 py-3 text-left">
                  <p className="text-[15px] font-semibold text-white">{item.label}</p>
                  <p className="text-[13px] text-white/40">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    },
    {
      id: "loss-aversion", title: "Why Losses Hurt 2x More",
      hook: "Losing 100 feels worse than gaining 100 feels good. Your brain is wired this way.",
      gradient: "from-zinc-500 to-zinc-900",
      story: { id: "i-loss", title: "Loss Aversion", subtitle: "Insight", icon: <Brain size={18} />, gradient: "from-zinc-800 to-zinc-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">Your brain <span className="text-zinc-300">lies.</span></div>
            <div className="h-px w-12 bg-white/15" />
            <div className="flex gap-6">
              <div><p className="text-[28px] font-bold text-white/80">+100</p><p className="text-[12px] text-white/40">Feels good</p></div>
              <div><p className="text-[28px] font-bold text-white/80">-100</p><p className="text-[12px] text-white/40">Feels 2x worse</p></div>
            </div>
            <p className="text-[16px] leading-relaxed text-white/50">This is loss aversion. It makes you hold losers too long (hoping to break even) and sell winners too early (locking in the good feeling). Knowing this is half the battle.</p>
          </div>
        ),
      },
    },
    {
      id: "diversification-myth", title: "Diversification \u2260 Owning 50 Stocks",
      hook: "You can hold 50 tech stocks and still be wildly concentrated.",
      gradient: "from-neutral-600 to-neutral-900",
      story: { id: "i-div", title: "Real Diversification", subtitle: "Insight", icon: <Layers size={18} />, gradient: "from-neutral-800 to-neutral-950", timestamp: "",
        renderContent: () => (
          <div className="flex flex-col items-center gap-8 px-2 text-center">
            <div className="text-[36px] font-bold leading-[1.05] tracking-tight text-white">50 stocks. <span className="text-neutral-300">Zero</span> diversification.</div>
            <div className="h-px w-12 bg-white/15" />
            <p className="text-[16px] leading-relaxed text-white/50">Diversification isn&apos;t about counting holdings. It&apos;s about owning things that don&apos;t move together. 50 tech stocks all drop when rates rise.</p>
            <div className="w-full rounded-2xl bg-white/8 px-4 py-3 text-left">
              <p className="text-[15px] font-semibold text-white">Real diversification</p>
              <p className="text-[13px] text-white/40">Different sectors, different geographies, different asset classes (stocks, bonds, commodities). When one zigs, the other zags.</p>
            </div>
          </div>
        ),
      },
    },
  ],
};

function LevelUpCarousel({ cards }: { cards: LevelUpCard[] }) {
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  return (
    <>
      <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
        <div className="flex gap-3" style={{ width: "max-content" }}>
          {cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => { setStoryIndex(i); setStoryOpen(true); }}
              className="relative flex w-[200px] flex-shrink-0 flex-col justify-between overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.97]"
              style={{ height: 240 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${card.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="relative z-10 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Play size={16} fill="white" className="text-white ml-0.5" />
                </div>
              </div>
              <div className="relative z-10 p-3.5">
                <p className="text-[17px] font-bold leading-tight text-white mb-1.5">{card.title}</p>
                <p className="text-[12px] leading-snug text-white/50 line-clamp-2">{card.hook}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <StoriesViewer
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        initialIndex={storyIndex}
      />
    </>
  );
}

export function LevelUpWidget() {
  const [activeTab, setActiveTab] = useState<StockLevelUpTab>("strategies");

  return (
    <div>
      <h2 className="mb-2.5 text-[18px] font-bold tracking-tight">
        Level Up
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {stockLevelUpTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              activeTab === tab.id
                ? "bg-foreground text-background"
                : "border border-border/60 text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <LevelUpCarousel cards={stockLevelUpData[activeTab]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
