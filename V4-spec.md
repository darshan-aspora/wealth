# Aspora Wealth — Explore Page Specification

## Purpose

This document is the complete specification for the Aspora Wealth explore/landing page. It is intended to be consumed by a developer (or Claude Code) to produce a single-page, responsive web build. Every section below describes exact content, layout structure, interaction behavior, color usage, typography, and component design.

**This is the final draft.** It represents the synthesized, best-of-all-worlds direction for the explore page.

---

## Global Design System

### Brand Language

The visual identity is modern, premium fintech. It achieves a balance between high-contrast minimalism and vibrant, futuristic expression. The foundation is trust and clarity — clean white backgrounds, intuitive UI layouts, bold sans-serif typography. To differentiate from sterile banking interfaces, the brand injects energetic personality through iridescent, 3D-rendered iconography and atmospheric, richly colored card graphics. The copy is direct and empowering: "Built for lives that cross borders."

**Do not generate, render, or embed any images.** All image placements described below should be built as placeholder containers — gray rectangles or squares.

All motion is subtle and purposeful. 

---

## Page Structure

The page lives inside the mobile app shell (StatusBar, TickerMarquee, Header, BottomNavV2, HomeIndicator) within a `max-w-[430px]` container. Content scrolls vertically within the shell. Ten sections (Section 2: Market Pulse was removed since the header already contains a live TickerMarquee). The Sticky Bottom Bar was also removed since BottomNavV2 serves navigation.

All sections follow the app's theme system (light mode default, dark mode via StatusBar tap toggle). No hardcoded dark wrappers — all colors use shadcn design tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-muted`, `border-border`, `text-gain`, `text-loss`, `bg-primary`, `text-primary-foreground`).

---

## SECTION 1: Hero — The Statement

**Background:** `bg-background` (follows theme).
**Layout:** Centered content with `pt-5 pb-6` padding. Compact — designed so the product showcase tabs are visible below the fold.

### Content

**Aspora Logo** — inline SVG mark, `fill="currentColor"` (theme-responsive). Sized at 44×18px. Fades in first with `mb-5` spacing below.

**Main headline** (comes first, directly after logo) — `text-[26px] leading-[1.15] font-bold tracking-tight text-foreground`, centered, line break after "platform.":
```
One platform.
Infinite possibilities.
```

**Product categories** — single line below headline, sentence case, not uppercase, center-aligned:
- `text-[13px] tracking-wide text-muted-foreground mt-3 text-center` — "Stocks · ETFs · Options · Advisory Baskets · 1-Click Algo Strategies"

**Video placeholder** — full-width, `aspect-video`, `rounded-2xl`, `bg-muted`, `mt-5`, `cursor-pointer`. Contains a centered play button (40px circle with triangle) and "Explore what's possible" caption.

**CTA (20px below video, single full-width button):**
- "Create Free Account" — `bg-foreground text-background`, 46px height, `rounded-xl`, `font-semibold`, full-width.

### Design Notes

Compact hero section — tightened spacing so product showcase tabs peek above the fold, encouraging scroll. Single-line product categories in sentence case for a cleaner, less shouty feel. Primary CTA uses `bg-foreground` (inverts with theme) for maximum contrast.

**Sticky "Open Free Account"** — When the hero CTA buttons scroll out of the viewport, a floating button appears at the bottom of the scroll area (above BottomNavV2). Uses `IntersectionObserver` on the `#hero-cta` element. The container uses `pointer-events-none` so page content scrolls through behind it. Button is `bg-foreground text-background`, 44px height, `rounded-full`, full-width with `shadow-lg` — floating style with no background bar. Disappears when the hero CTAs scroll back into view.

---

## ~~SECTION 2: Live Market Pulse~~ (REMOVED)

This section was removed from the page. The live ticker functionality is already provided by the `TickerMarquee` component in the app shell header, making a duplicate ticker section redundant.

---

## SECTION 3: Product Showcase — Real Products, Real Data

**Background:** `bg-background` (follows theme).
**Layout:** Sticky tab bar at top + vertical card stack below.

### Tab Navigation

A horizontal row of 5 tabs, sticky at the top of the viewport when scrolled past. Each tab is an anchor link to its corresponding card below. **No badges** — clean tab labels only.

| Tab Label |
|-----------|
| Stocks |
| ETFs |
| Options |
| Advisory Baskets |
| Algo Strategies |

**Tab styling:**
- Inactive: `text-muted-foreground` text, no border.
- Active: `text-foreground` text, 2px solid `border-primary` bottom border.
- Tab bar background: `bg-background` with a subtle 1px `border-border` bottom line.
- On scroll, the active tab updates based on which card section is in view (Intersection Observer).
- Tapping a tab smooth-scrolls to that card.

### Card Design (shared structure)

Each product card is a full-width container with:
- Top: **Image placeholder area** (right-aligned on desktop in a two-column layout, full-width on mobile). This is where product-specific data widgets or visual elements go.
- Bottom (or left on desktop): **Text content area** with headline, body, feature pills, and CTA.
- Card has `--bg-primary` background, 1px `--border` border, 12px border-radius.
- 32px internal padding. 24px gap between cards.

---

#### CARD 1 — STOCKS: "Own a piece of the world's biggest companies"

**Label:** "Stocks" — plain text, `text-muted-foreground text-xs font-medium`.

**Headline:** "Own a piece of the world's biggest companies"

**Value Propositions** (bullet list below headline, `text-[15px] text-muted-foreground`):
- Fractional shares from $1
- 24×5 extended-hours trading
- Real-time prices, zero delay

**Category Pills** (horizontal scroll, toggleable):
- "Magnificent 7", "AI", "EV", "Energy"
- Active pill: `bg-foreground text-background border-foreground`
- Inactive pill: `border-border text-muted-foreground`
- Selecting a pill swaps the stock cards below to show stocks from that category

**Stock Cards** (horizontal scroll below pills, 6 cards per category):
- Uses the **TickerGlow gradient design** from `components/ticker.tsx`
- Each card: 140px wide, `rounded-2xl`, border colored by gain/loss (`border-gain/20` or `border-loss/20`)
- Gradient background overlay: `opacity-[0.04]`, `bg-gradient-to-br from-gain via-gain/50 to-transparent` (or loss variant)
- Content: symbol (bold), name (muted, truncated), price (mono), change % (gain/loss colored)

**CTA:** "Browse Stocks" — outlined button style (1px `border-primary` border, `text-primary` text, transparent background, fills on hover).

---

#### CARD 2 — ETFs: "One Tap. Entire Markets."

**Data Widget:**

A placeholder table labeled "Popular ETFs — Live Data" with 8 rows:

| ETF | Name | Price | 1Y Return | Category |
|-----|------|-------|-----------|----------|
| VOO | Vanguard S&P 500 | $532.40 | +22.4% | Index — Large Cap |
| QQQ | Invesco Nasdaq 100 | $498.20 | +31.2% | Index — Tech Heavy |
| VTI | Vanguard Total Market | $268.50 | +20.8% | Index — Total Market |
| SCHD | Schwab US Dividend | $82.30 | +8.6% | Dividend |
| ARKK | ARK Innovation | $52.40 | +18.4% | Thematic — Disruptive |
| ICLN | iShares Clean Energy | $14.80 | +6.2% | Thematic — Clean Energy |
| SOXX | iShares Semiconductor | $248.60 | +28.4% | Sector — Semiconductors |
| VWO | Vanguard Emerging Mkts | $44.20 | +12.1% | International — EM |

Table styling: no outer border, thin `--border` row separators, left-aligned text, returns colored. Font: caption size.

**Headline:** "One Tap. Entire Markets."

**Body:**
```
Why pick one stock when you can own 500? ETFs give you instant diversification across sectors, themes, and geographies. S&P 500. Nasdaq 100. Clean Energy. AI & Robotics. Emerging Markets. The world's best indices, accessible from $1.
```

**ETF Categories — Horizontal Scroll Chips:**
```
Index  ·  Sector  ·  Thematic  ·  Dividend  ·  International  ·  Bond  ·  Commodity
```
Chip styling: same as feature pills but with a subtle `--border` outline. Active chip: `--accent-primary` background, white text.

**Feature Pills:**
- "Thematic ETFs — AI, EV, Dividends, more"
- "Perfect for SIPs — automate monthly"
- "Lower risk than individual stocks"

**Insight line** (caption size, `--text-secondary`, italic):
```
"80% of professional fund managers underperform the S&P 500 over 10 years. You can own the index from $1."
```

**CTA:** "Explore ETFs"

---

#### CARD 3 — OPTIONS: "Amplify. Protect. Strategize."

**Data Widget:**

A placeholder table labeled "Sample Options Chain — AAPL (Apple Inc.)":

| Expiry | Strike | Type | Bid | Ask | Volume | OI |
|--------|--------|------|-----|-----|--------|----|
| Mar 21 | $220 | Call | $6.40 | $6.55 | 12,840 | 45,200 |
| Mar 21 | $225 | Call | $3.80 | $3.95 | 18,620 | 62,100 |
| Mar 21 | $230 | Call | $1.90 | $2.05 | 24,300 | 78,400 |
| Mar 21 | $220 | Put | $2.10 | $2.25 | 8,400 | 32,600 |
| Mar 21 | $215 | Put | $0.85 | $0.95 | 6,200 | 28,100 |

Below the table, caption: "This is what you'll see inside the app. Real chains. Real data."

**Headline:** "Amplify. Protect. Strategize."

**Body:**
```
Options aren't just for Wall Street. They're for anyone who wants to do more with less — hedge your portfolio, generate income, or take a calculated position with limited downside. Levels 1 through 3. Clear risk explanations at every step. And an in-app learning path that takes you from "what is an option?" to placing your first covered call.
```

**Feature Pills:**
- "Levels 1-3 — grow at your pace"
- "In-app Options Academy — 7 chapters"
- "$0.20 per contract"

**Micro-learning card** (embedded, `--bg-surface`, 12px padding, 8px border-radius):
```
Quick Question: What's the max you can lose buying a call option?
→ Only what you paid for it. That's it. Learn more
```
"Learn more" in `--accent-primary`.

**CTA:** "Learn & Trade Options"

---

#### CARD 4 — ADVISORY BASKETS: "Your Fund Manager. Your Rules."

**Data Widget:**

Four small strategy cards in a 2×2 grid (stacked vertically on mobile):

| Basket | Strategy | Risk | 3Y Backtest | Max Drawdown | Min. |
|--------|----------|------|-------------|--------------|------|
| Steady Compounder | Large-cap quality + dividends | Conservative | +14.2% CAGR | -8.4% | $100 |
| Balanced Alpha | Multi-factor, sector-rotated | Moderate | +21.8% CAGR | -12.6% | $100 |
| High Conviction | Concentrated growth picks | Aggressive | +34.1% CAGR | -18.2% | $250 |
| Performance Plus | High-alpha, performance-fee only | Aggressive | +28.6% CAGR | -15.4% | $500 |

Each card: `--bg-surface` background, 12px padding, 8px border-radius. Risk label is a small colored badge (Conservative: `#22C55E`, Moderate: `#F59E0B`, Aggressive: `#EF4444`).

Caption below: "Past performance does not guarantee future returns. Backtested using Bloomberg data. Rebalanced quarterly."

**Headline:** "Your Fund Manager. Your Rules."

**Body:**
```
Not everyone wants to pick stocks. Our advisory baskets are built and managed by DIFC-regulated portfolio managers with $1.2 billion in assets. Conservative. Balanced. Aggressive. Performance-fee only. Choose a strategy. They handle the rest.
```

**How It Works — 3 Steps** (vertical list, each with a number circle):
1. "Choose your risk profile" → Conservative / Moderate / Aggressive
2. "Fund your advisory account" → From $100
3. "Sit back" → Auto-rebalanced. Full transparency. Withdraw anytime.

Number circle: 32px diameter, `--accent-primary` background, white text, centered number.

**Credibility bar** (horizontal row of pills):
```
DIFC Regulated  ·  Bloomberg-Powered  ·  $1.2B AUM  ·  Retail Endorsed
```
Pill styling: 1px `--border` outline, `--text-secondary` text.

**CTA:** "See All Baskets"

---

#### CARD 5 — ALGO STRATEGIES: "The Smartest Way to Trade"

**Data Widget:**

Six strategy cards in a vertical list (scrollable horizontally on mobile, 2-column on desktop):

| Strategy | Type | Market | 1Y Backtest | Drawdown | Fee | Users |
|----------|------|--------|-------------|----------|-----|-------|
| Momentum Capture | Long/Short Equity | US Large Cap | +22.4% | -6.1% | $25/mo | 342 |
| Volatility Harvest | Options Premium | S&P 500 | +18.8% | -4.8% | $30/mo | 218 |
| Trend Follower | Directional Equity | US Multi-Cap | +16.2% | -9.4% | $20/mo | 456 |
| Mean Reversion | Statistical Arb | US Mid-Cap | +14.6% | -5.2% | $20/mo | 189 |
| Dividend Capture | Income Strategy | US Dividend | +11.4% | -3.8% | $20/mo | 624 |
| Earnings Momentum | Event-Driven | US Large Cap | +26.1% | -11.2% | $30/mo | 156 |

Each card: `--bg-surface` background, shows strategy name + type tag (small pill), backtest return (large, `--positive`), drawdown, fee, user count as social proof, and an "[Activate]" button placeholder.

Caption: "Backtested performance. Past results do not guarantee future returns."

**Headline:** "The Smartest Way to Trade"

**Body:**
```
What if your trades were executed by algorithms designed by quantitative experts — strategies that monitor markets 24/5, hedge automatically, and follow rules without emotion? Choose from 10+ curated strategies. Flat fee. No performance cut. Activate with one tap. Deactivate anytime.
```

**Feature Pills:**
- "10+ hedged strategies"
- "Flat fee from $20 — no profit sharing"
- "1-tap activate/deactivate"

**Differentiator line** (section headline size, `--text-primary`, centered, bold):
```
Algo trading used to cost $500K minimum. Now it costs $20.
```

**CTA:** "Explore All Strategies"

---

## SECTION 4: AI Companion — Meet Arya

**Background:** `--bg-dark` (#0A0A0A).
**Layout:** Two columns on desktop (text left, visual right). Single column on mobile.

This section introduces the AI layer that makes Aspora fundamentally different from every other trading platform. The AI companion is called **Arya**. The philosophy: "AI is not a feature — it is the product." If a human has to do cognitive work that a machine can do better, Aspora has failed.

### Content — Left Column

**Section headline** (`--text-on-dark`):
```
Your AI Companion. Always On.
```

**Subtext** (`--text-muted-on-dark`, body size):
```
Meet Arya — the intelligence layer that makes every screen smarter. Not a chatbot bolted on. An AI woven into every corner of the platform.
```

**Four capability blocks**, stacked vertically with 24px gap. Each block has:
- A small icon placeholder (48px × 48px, labeled)
- A headline (card headline size, `--text-on-dark`)
- A 2-line description (`--text-muted-on-dark`, body size)

**Block 1: Conversational Navigation**
Icon placeholder: "Icon: Chat Bubble"
Headline: "Ask Anything. Go Anywhere."
```
"Show my holdings." "What moved today?" "Open the TSLA chart." Navigate your entire portfolio with natural language. No menus. No tabs. Just say it.
```

**Block 2: Market Intelligence**
Icon placeholder: "Icon: Brain/Signal"
Headline: "Understand Markets in Seconds."
```
Summarize today's market in 5 bullets. Explain why a stock gapped. Get earnings call highlights and upcoming catalysts — all interpreted, not just listed.
```

**Block 3: AI Analysis & Scoring**
Icon placeholder: "Icon: Score/Meter"
Headline: "The Aspora Score."
```
Every stock gets a proprietary intelligence score — combining fundamental quality, institutional conviction, momentum, and valuation. Transparent drivers. No black boxes. See why a score is what it is.
```

**Block 4: What-If Simulator**
Icon placeholder: "Icon: Calculator"
Headline: "Simulate Before You Trade."
```
"If the price drops 5%, what happens to my P&L?" "What's the impact of a stop-loss at $180?" Run scenarios on your actual portfolio before committing a single dollar.
```

### Content — Right Column (Desktop) / Below (Mobile)

A large placeholder container (400px × 500px on desktop, full-width × 300px on mobile) labeled:
```
"App Screenshot: Arya AI Chat Interface"
```

### Compliance Notice

Below both columns, in caption size, `--text-muted-on-dark`:
```
Arya provides analysis and information only — never personalized investment advice. All outputs include timestamps, sources, and "not investment advice" disclosures. Your data is encrypted and PII is redacted before any AI processing.
```

### Design Notes

This section should feel like a moment of elevated technology within the page. The dark background creates a distinct break from the white product showcase above. The four capability blocks are the core selling points — they communicate that this isn't a generic chatbot but a deeply integrated intelligence layer. The placeholder on the right is where an actual app screenshot of the Arya interface would go.

---

## SECTION 5: The Learning Journey — Level Up

**Background:** `--bg-primary` (#FFFFFF).
**Layout:** Centered, with a vertical progression path.

### Header

**Section headline:**
```
Level Up
```

**Subtext** (`--text-secondary`):
```
Every great trader started as a curious investor. Here's the path.
```

### Progression Path

A vertical line (2px wide, `--border`) running down the center (desktop) or left side (mobile) connecting 5 stage nodes. Each node is a circle (40px diameter, `--accent-primary` fill, white number inside) with content extending to the side.

---

**Stage 1: "The First Step"**
Badge pill: `Beginner Investor` (small, `--bg-surface`, `--text-secondary`)

Body:
```
Buy your first stock or ETF. Learn what a share is. Understand market vs limit orders.
```

Unlocks: Portfolio tracking, price alerts

Learning Modules (3 items, each a small horizontal card — icon placeholder 40×40, title, duration):
- "What is a stock and why does it have value?" — 3 min read
- "Market order vs Limit order — the one mistake beginners make" — 4 min read
- "Buy Your First Stock in 60 Seconds" — video walkthrough

---

**Stage 2: "The Confident Investor"**
Badge pill: `Active Investor`

Body:
```
Build a diversified portfolio. Start a recurring SIP. Understand sectors and indices.
```

Unlocks: Watchlist customization, AI company summaries

Learning Modules:
- "What is an ETF and why does everyone love them?" — 3 min read
- "SIP vs lump sum — which is better?" — 4 min read
- "How to read an earnings report without falling asleep" — video
- Masterclass: "Building Your First Portfolio" — 20 min

---

**Stage 3: "The Strategic Investor"**
Badge pill: `Strategic Investor`

Body:
```
Read charts. Understand technical indicators. Make your first swing trade.
```

Unlocks: TradingView advanced charts, screener access

Learning Modules:
- "The beginner's guide to reading a stock chart" — 5 min read
- "Support, resistance, and why stocks bounce" — 4 min read
- "Volume — the hidden signal most investors ignore" — 3 min read
- "Technical Analysis: What the Charts Are Telling You" — video

---

**Stage 4: "The Options Explorer"**
Badge pill: `Options Trader`

Body:
```
Understand calls and puts. Learn covered calls. Make your first options trade.
```

Unlocks: Options trading (Level 1), options chain view

Learning Modules:
- "Options 101: What is a call option?" — 3 min read
- "Options 102: Understanding puts and protection" — 4 min read
- "Options 103: Covered calls — your first income strategy" — 5 min read
- "Options 104: Spreads and risk management" — 6 min read
- "Options Decoded: From Zero to Your First Trade" — 7 chapters, 30 min

---

**Stage 5: "Power Mode"**
Badge pill: `Power Trader`

Body:
```
Activate algo strategies. Use advanced orders (bracket, trailing stop-loss, OCO). Trade extended hours.
```

Unlocks: Full algo marketplace, advanced order types, overnight trading

Learning Modules:
- "How algorithmic trading works — and why it's not scary" — 4 min read
- "Advanced order types: bracket, OCO, GTT" — 5 min read
- "Algo Trading — Simpler Than You Think" — video
- Masterclass: "From Investor to Trader" — 45 min

---

**Below the path, centered, body text, `--text-secondary`:**
```
Every milestone comes with short lessons, real examples, and practice scenarios. This isn't a quiz — it's a craft you're learning.
```

**CTA:** "Start the Journey" — primary button style, centered.

---

## SECTION 6: The Emotional Bridge — Why Invest?

**Background:** `--bg-surface` (#F5F5F7).
**Layout:** Section header + 3 vertical cards (stacked on mobile, 3-column on desktop).

This section addresses the psychological gap. Most remittance users are savers, not investors. This section reframes investing as the natural next step — for the user who's scrolled through all the capability above and thinks "but is investing even for me?"

### Header

**Section headline:**
```
You work hard for your money. Shouldn't it work hard for you?
```

### Cards

Each card: `--bg-primary` background, 1px `--border` border, 12px border-radius, 32px padding.

---

**Card 1: "The Inflation Truth"**

Icon placeholder (48×48): "Icon: Melting Ice Cube"

Body:
```
Your savings account gives you 3-4%. Inflation takes 5-6%. Every year, your money buys less.
```

**Data table:**

| | Savings Account | S&P 500 (VOO) | Nasdaq 100 (QQQ) |
|--|----------------|---------------|-------------------|
| 1 Year | +3.5% | +22.4% | +31.2% |
| 5 Years | +18.9% | +82.6% | +124.8% |
| 10 Years | +41.2% | +192.4% | +348.6% |

Caption: "Compounded returns. Past performance does not guarantee future results."

**Micro-CTA:** "See how $100/month grows →" in `--accent-primary`.

---

**Card 2: "The $1 Start"**

Icon placeholder (48×48): "Icon: Coin Multiplying"

Body:
```
You don't need a lump sum. Fractional shares mean you can own any company for any amount.
```

**Data table — "What $10 buys you today":**

| $10 invested in | You'd own | Share price |
|-----------------|-----------|-------------|
| Apple (AAPL) | 0.0446 shares | $224.32 |
| NVIDIA (NVDA) | 0.0112 shares | $891.04 |
| Amazon (AMZN) | 0.0536 shares | $186.40 |
| S&P 500 ETF (VOO) | 0.0188 shares | $532.40 |
| Tesla (TSLA) | 0.0560 shares | $178.50 |

Caption: "Fractional shares. Start from $1. No minimum portfolio size."

**Micro-CTA:** "Start with $10 →"

---

**Card 3: "The Time Advantage"**

Icon placeholder (48×48): "Icon: Clock with Growth Curve"

Body:
```
The best time to invest was 10 years ago. The second best time is now.
```

**Data table — Compound growth:**

| Monthly SIP | 10 Years | 20 Years | 30 Years |
|-------------|----------|----------|----------|
| $50/month | ~$10,200 | ~$38,400 | ~$113,000 |
| $200/month | ~$40,800 | ~$153,600 | ~$452,000 |
| $500/month | ~$102,000 | ~$384,000 | ~$1,130,000 |

Caption: "Based on historical S&P 500 average annual return of ~10%. Past performance does not guarantee future results."

**Micro-CTA:** "Start a recurring investment →"

---

## SECTION 7: The Trader's Edge

**Background:** `--bg-primary` (#FFFFFF).
**Layout:** Section header + vertical stack of 6 edge cards.

### Header

**Section headline:**
```
Built for Traders. Loved by Investors.
```

### Edge Cards

Each edge card: full-width, `--bg-primary` background, 1px `--border` bottom border only (not a boxed card — more like a list item). 24px vertical padding. Icon placeholder (48×48) on the left, text on the right.

**Edge 1: "Extended Hours That Actually Work"**
Icon placeholder: "Icon: Moon/Sun"
```
Pre-market from 4:00 AM ET. Post-market till 8:00 PM ET. Overnight trading via Blue Ocean ATS. React to earnings, not the next morning.
```

**Edge 2: "Advanced Order Types — Day One"**
Icon placeholder: "Icon: Layers"
```
Market. Limit. Bracket. Trailing Stop-Loss. OCO. GTT. Not hidden in a menu. Not locked behind a tier. Available from your first trade.
```

**Edge 3: "Algo Strategies You Can Actually Afford"**
Icon placeholder: "Icon: Algorithm"
```
Institutional-quality algorithms for $20-30 flat fee. No 2-and-20. No AUM cut. Activate or deactivate with a single tap.
```

**Edge 4: "Flat, Transparent Pricing"**
Icon placeholder: "Icon: Price Tag"
```
No hidden spreads. No payment for order flow (PFOF). Published pricing, in-app, anytime. $0.0015/share. $0.20/options contract. That's it.
```

**Edge 5: "Fund in Seconds, Not Days"**
Icon placeholder: "Icon: Lightning Bolt"
```
Instant credit up to $5,000 while your transfer settles. Stablecoin funding for same-day deployment. Or use Aspora Remittance — the fastest way to move money internationally and invest it.
```

**Edge 6: "TradingView Charts. Natively."**
Icon placeholder: "Icon: Chart"
```
Professional-grade charting. Indicators. Drawing tools. Not a WebView embed — a native integration. The same charts institutional traders use, inside your mobile app.
```

---

## SECTION 8: Market Intelligence — Live Dashboard

**Background:** `--bg-dark` (#0A0A0A).
**Layout:** Section header + 4 widget blocks in a 2×2 grid (desktop), stacked vertically (mobile).

This section brings the trading platform into the page itself. It's a mini-dashboard that makes the page feel alive — every visit shows different data.

### Header

**Section headline** (`--text-on-dark`):
```
Your Market Dashboard — Live
```

**Subtext** (`--text-muted-on-dark`):
```
This isn't a brochure. This is your market. Right now.
```

### Widget 1: Sector Heatmap

A treemap-style grid of 11 rectangles, sized proportionally to sector weight. Each rectangle shows sector name, weight %, and daily change. Colors: `--positive` tinted background for up, `--negative` tinted background for down (use 10% opacity fills, not solid).

| Sector | Weight | Today |
|--------|--------|-------|
| Technology | 32.4% | +0.8% |
| Healthcare | 12.1% | +0.3% |
| Financials | 13.2% | +0.5% |
| Consumer Discretionary | 10.4% | -0.2% |
| Communication Services | 8.8% | +1.1% |
| Industrials | 8.6% | +0.2% |
| Consumer Staples | 5.8% | -0.1% |
| Energy | 3.6% | -0.8% |
| Utilities | 2.5% | +0.1% |
| Real Estate | 2.3% | -0.4% |
| Materials | 2.1% | +0.3% |

### Widget 2: Top Movers Today

Three sub-sections side by side (desktop) or stacked (mobile):

**Gainers:**
| Stock | Price | Change |
|-------|-------|--------|
| SMCI | $892.40 | +8.4% |
| PLTR | $24.80 | +5.6% |
| NVDA | $891.04 | +3.2% |

**Losers:**
| Stock | Price | Change |
|-------|-------|--------|
| PFE | $26.20 | -4.1% |
| BA | $178.40 | -3.2% |
| TSLA | $178.50 | -2.1% |

**Most Active:**
| Stock | Volume | Price |
|-------|--------|-------|
| NVDA | 48.2M | $891.04 |
| TSLA | 32.6M | $178.50 |
| AAPL | 28.4M | $224.32 |

Text in `--text-on-dark`. Changes colored by `--positive` / `--negative`. Each sub-section has a small header in `--text-muted-on-dark`.

### Widget 3: Analyst Spotlight

Header: "What Wall Street is saying today" (`--text-muted-on-dark`, caption).

| Stock | Analyst | Rating | Target | Change |
|-------|---------|--------|--------|--------|
| NVDA | Morgan Stanley | Strong Buy | $1,000 | ↑ from $880 |
| AMZN | Barclays | Outperform | $220 | ↑ from $200 |
| AAPL | JP Morgan | Overweight | $250 | — |
| GOOG | BofA | Buy | $200 | ↑ from $185 |
| PFE | Goldman Sachs | Hold | $28 | ↓ from $32 |

Caption: "Analyst ratings are informational, not investment advice. See full ratings in-app."

### Widget 4: Trending Collections

A horizontal scroll row of 6 collection cards. Each card: `--border-dark` border, 12px border-radius, 16px padding, 200px min-width.

| Collection | Stocks | 1M Return |
|-----------|--------|-----------|
| AI & Machine Learning | NVDA, MSFT, GOOG, PLTR, SNOW | +6.2% |
| Electric Vehicles | TSLA, RIVN, LI, NIO, LCID | -1.4% |
| Healthcare Innovation | LLY, UNH, ABBV, JNJ, MRK | +2.8% |
| Dividend Kings | JNJ, KO, PG, PEP, MMM | +1.2% |
| Infrastructure Boom | CAT, DE, VMC, MLM, URI | +3.4% |
| Magnificent 7 | AAPL, MSFT, GOOG, AMZN, NVDA, META, TSLA | +4.8% |

Caption: "Each collection is an in-app watchlist. Tap to explore, or invest in the theme via advisory baskets."

---

## SECTION 9: Under the Hood

**Background:** `--bg-primary` (#FFFFFF).
**Layout:** Section header + 4 accordion rows, max-width 800px centered.

For the user who's read everything and thinks: "OK but who actually runs this?" — the IBKR user, the finance professional, the person who reads fine print.

### Header

**Section headline:**
```
Under the Hood
```

### Accordion Rows

Each row: full-width, 1px `--border` bottom border, 20px vertical padding. Clickable header row with a `+` / `−` toggle icon on the right (16px, `--text-secondary`). Body is hidden by default, revealed on click with a 300ms max-height transition.

**Row 1: "Clearing & Custody"**
```
Your US equities are held in individual accounts (fully disclosed) at Alpaca Securities LLC, a registered broker-dealer and member of FINRA/SIPC. Not pooled. Not omnibus. Your name. Your assets.
```

**Row 2: "Regulatory Framework"**
```
Aspora operates under FinCEN registration (US), DFSA sandbox and SCA Category 5 (UAE), and FCA Appointed Representative via WealthKernel (UK). Advisory services provided by Atom Prive, regulated by DIFC/SCA.
```

**Row 3: "Data & Charting"**
```
Real-time market data via institutional-grade feeds. TradingView professional charting natively integrated. Algo strategies powered by Tradetron with full trade-by-trade transparency.
```

**Row 4: "Security & Privacy"**
```
256-bit encryption. UAE data residency compliant. PII redacted before any AI processing. Full audit trail on every transaction. SOC2 practices.
```

---

## SECTION 10: The Numbers

**Background:** `--bg-dark` (#0A0A0A).
**Layout:** Full-width. Large stat numbers in a 3-column grid (desktop), 2-column (tablet), single column (mobile).

A single, elegant section. Large numbers. Minimal text. The numbers speak.

### Stats

Each stat: large number (`--text-on-dark`, stat number font size), label below (caption, `--text-muted-on-dark`). Staggered fade-in on scroll.

| Value | Label |
|-------|-------|
| 6,000+ | US Stocks |
| 2,000+ | ETFs |
| 24×5 | Trading Hours |
| $1 | Minimum Investment |
| 10+ | Algo Strategies |
| $1.2B | Advisory AUM |
| $0.0015 | Per Share |
| $0.20 | Per Options Contract |
| 800,000+ | Aspora Users |
| $4B+ | Annual Volume |
| 3 | Regulatory Jurisdictions |
| 5 sec | Funding Speed |

No CTAs. No copy. Just facts.

---

## SECTION 11: The Close

**Background:** `--bg-dark` (#0A0A0A), full viewport height (100vh), centered.
**Layout:** Centered text block.

**Headline** (hero headline size, `--text-on-dark`):
```
Stop browsing. Start building.
```

**Subtext** (body size, `--text-muted-on-dark`, 16px below):
```
Free account. $1 minimum. 5 minutes to your first trade.
```

**Primary CTA** (32px below, large — 56px height, 32px horizontal padding):
"Open Your Account" — `--accent-primary` background, white text.

**Secondary** (16px below, caption, `--text-muted-on-dark`):
"Still deciding? Start with the Learning Hub."

---

## ~~STICKY BOTTOM BAR~~ (REMOVED)

The sticky bottom bar was removed. The page now uses the app's `BottomNavV2` component (Explore, Market, Watchlist, Portfolio, Advisory + More sheet) which provides persistent navigation across all pages.

---

