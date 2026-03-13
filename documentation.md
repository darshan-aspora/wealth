# US Equity — Project Documentation

## Overview

Mobile trading app prototype for US Equity, ETF, and Options trading. Design-first — no backend, no real data, no auth. Everything is mocked. Built for 390–430px mobile viewport, dark mode default.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.35 | App Router, `app/` directory |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^3.4.1 | Utility-first styling, mobile-first |
| shadcn/ui | New York style, zinc base | Component library (Sheet, Button, Badge, Checkbox, Switch, ScrollArea) |
| Framer Motion | ^12.34.5 | Transitions, micro-interactions, gestures |
| TradingView Lightweight Charts | ^5.1.0 | Candlestick, line, area, volume charts (mock data) |
| Lucide React | ^0.576.0 | Icons (ships with shadcn) |

### Supporting Libraries (auto-installed with shadcn)

- `class-variance-authority` ^0.7.1 — variant-based component styling
- `clsx` ^2.1.1 — conditional classnames
- `tailwind-merge` ^3.5.0 — merge Tailwind classes without conflicts
- `tailwindcss-animate` ^1.0.7 — animation utilities

---

## Project Structure

```
02-US-Equity/
├── app/
│   ├── page.tsx                    ← Directory — landing page with tabs (Pages / Components)
│   ├── layout.tsx                  ← Root layout: dark mode, DM Sans + JetBrains Mono, viewport meta
│   ├── global-error.tsx            ← Global error boundary (required by App Router)
│   ├── globals.css                 ← Tailwind base + CSS variables (light/dark) + custom utilities
│   ├── home/
│   │   └── page.tsx                ← Home screen — header with rotating search, bottom nav
│   ├── search/
│   │   └── page.tsx                ← Search page — active input, extended bar, back button
│   ├── explore-headers/
│   │   └── page.tsx                ← 5 header design variations
│   ├── explore-tickers/
│   │   └── page.tsx                ← 5 ticker component variations showcase
│   ├── market/
│   │   ├── page.tsx                ← Markets page — 4 tabs (US Markets, Global, News, India)
│   │   ├── data.ts                 ← All mock data + TypeScript interfaces for markets
│   │   └── components/
│   │       ├── market-table.tsx    ← Generic scrollable table with frozen first column
│   │       ├── sub-tabs.tsx        ← Pill-style sub-tab switcher with Framer Motion
│   │       ├── section-header.tsx  ← Section title + subtitle + optional action
│   │       ├── sparkline.tsx       ← Mini SVG sparkline for stock/ETF tables
│   │       ├── economic-overview.tsx ← Economic indicators list
│   │       ├── news-accordion.tsx  ← Expandable news accordion (Perplexity-style)
│   │       ├── stock-screener.tsx  ← Screener cards with criteria
│   │       ├── earnings-calendar.tsx ← Week nav + day strip + company list
│   │       ├── us-markets-tab.tsx  ← US Markets tab content
│   │       ├── global-markets-tab.tsx ← Global tab content
│   │       ├── news-tab.tsx        ← News tab content
│   │       └── india-tab.tsx       ← India tab content
│   └── watchlist/
│       └── page.tsx                ← Watchlist page — 4 tabs, stock sections, swipe actions
├── components/
│   ├── iphone-frame.tsx            ← StatusBar (theme toggle on tap) + HomeIndicator
│   ├── mobile-shell.tsx            ← Mobile frame (430px) + bottom tab bar with 5 tabs
│   ├── theme-provider.tsx          ← Dark/light theme context + toggleTheme hook
│   ├── ticker.tsx                  ← 5 ticker variations + EditSheet + mock data (27 tickers)
│   ├── ticker-visibility.tsx       ← Ticker show/hide context
│   ├── watchlist-context.tsx       ← Watchlist state context (sort, flags, deletes, collapse)
│   ├── watchlist-content.tsx       ← Watchlist body — collapsible sections, stock rows, swipe gestures
│   ├── movers-content.tsx          ← Movers tab — multi-line TradingView chart + top/bottom stock list
│   ├── ai-insights-content.tsx    ← AI Insights tab — 3-phase analysis (analyzing → typing → complete)
│   ├── sort-sheet.tsx              ← Sort bottom sheet (5 sort options)
│   ├── header-v1.tsx              ← Original header backup (V1 — close left, bell, profile right)
│   ├── stories-viewer.tsx         ← Instagram-style stories: StoryRing + StoriesViewer + 6 mock stories
│   └── ui/                         ← shadcn auto-generated components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── checkbox.tsx
│       ├── scroll-area.tsx
│       ├── sheet.tsx
│       └── switch.tsx
├── lib/
│   └── utils.ts                    ← cn() helper (clsx + tailwind-merge)
├── components.json                 ← shadcn/ui config
├── tailwind.config.ts              ← Tailwind config with custom colors, fonts, shadcn tokens
├── tsconfig.json                   ← TypeScript config with @/* alias
├── postcss.config.mjs              ← PostCSS config for Tailwind
├── next.config.mjs                 ← Next.js config (dev cache disabled to avoid stale builds)
├── package.json                    ← Dependencies & scripts
├── SKILL.md                        ← Frontend design skill reference
└── documentation.md                ← This file
```

---

## Pages Built

### 1. Directory (`app/page.tsx`) — Route: `/`

Landing page listing all available screens and component explorations.

- Two tabs: **Pages** and **Components**
- Animated tab switcher with Framer Motion `layoutId`
- Staggered card entrance animations
- Status badges ("v1", "5 variations")
- Links to all other pages

### 2. Home (`app/home/page.tsx`) — Route: `/home`

Main trading dashboard screen with watchlist and navigation.

- iPhone StatusBar (tappable for theme toggle)
- Header with back button, rotating search placeholder ("ETF", "Stocks", "Options", "News", "Advisory", "Services"), and filter button
- Bottom navigation bar: 5 tabs (Home, Explore, Trade, Portfolio, Options) with animated active indicator
- Placeholder content area for watchlist
- HomeIndicator at bottom

### 3. Search (`app/search/page.tsx`) — Route: `/search`

Full-screen search page opened by tapping the search bar on Home.

- iPhone StatusBar (tappable for theme toggle)
- Back button (ArrowLeft) in the same position as the Home header's X button
- Extended search bar spanning full remaining width (no bell/options icons)
- Auto-focused text input on mount
- Same rotating placeholder animation as Home but lighter (`text-muted-foreground/35`)
- Clear (X) button appears inside the search bar when text is entered
- HomeIndicator at bottom
- Content area reserved for future search results

### 4. Header Variations (`app/explore-headers/page.tsx`) — Route: `/explore-headers`

5 header design explorations, all with rotating search keyword animation:

1. **Clean Pill** — Rounded-full iOS-inspired search bar (Robinhood-like)
2. **Underline Minimal** — Editorial feel, bottom-border-only search (Zerodha-inspired)
3. **Glassmorphic** — Frosted glass with border glow (premium dark theme)
4. **Compact Dense** — Tight layout with Edit button (high-density Zerodha style)
5. **Bold Display** — Large search with ring accent (confident trading energy)

### 5. Ticker Variations (`app/explore-tickers/page.tsx`) — Route: `/explore-tickers`

5 ticker component variations, each self-contained with inline edit:

1. **Marquee Tape** — Auto-scrolling infinite loop, edit button pinned right
2. **Pill Strip** — Swipeable compact pills, edit pill at end
3. **Mini Cards** — Rich cards with price + change + intensity bar, edit card at end
4. **Dense Tape** — Two-line auto-scroll, edit label pinned left
5. **Gradient Glow** — Premium cards with gain/loss gradients, edit card at end

### 6. Markets (`app/market/page.tsx`) — Route: `/market`

Comprehensive markets page with 4 top-level tabs: US Markets, Global, News, India. Collapsible header on scroll, sticky tabs with Framer Motion animated indicator.

- **US Markets tab**: Major Indices table (6 rows × 9 columns), Sectors table (11 rows), Top 10 sub-tabs (Stocks / ETFs / Mutual Funds) each with scrollable table + sparklines, Economic Overview (10 macro indicators), Market Summary accordion (5 AI-curated news items), Stock Screener (5 screener cards), Earnings Calendar (week nav + company list)
- **Global tab**: Global Indices (6 region sub-tabs: Most Popular, Americas, Europe, Asia Pacific, Middle East, Africa), Commodities (5 category sub-tabs), Currencies (4 type sub-tabs incl. Crypto with Market Cap column), Global Market Summary accordion
- **News tab**: Standalone Market Summary accordion with expandable summaries, ticker tags, and source attribution
- **India tab**: Key Market Data (4 sub-tabs: Indices, Sectors, Currencies, Commodities), Top 10 Stocks table, Market Summary accordion, Economic Overview
- All tables use generic `MarketTable<T>` component with frozen first column, horizontal scroll, and configurable columns
- All mock data centralized in `app/market/data.ts` with full TypeScript interfaces

### 7. Watchlist (`app/watchlist/page.tsx`) — Route: `/watchlist`

Full watchlist screen with 4 top-level tabs and rich stock management.

- **Tabs**: Watchlist (default), AI Insights, Movers, News — horizontally scrollable, animated underline
- **Watchlist Tab** contains 3 collapsible sections:
  - **Indices** (SPX, NDX, DJI, RUT, VIX)
  - **US Stocks** (AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, JPM, V, UNH)
  - **Interested** (JNJ, WMT, AVGO, COST, NFLX, AMD, INTC)
- **Stock rows**: Logo avatar + Symbol/Name + Price + Change (red/green)
- **Swipe left** on any row reveals 3 actions: Flag (amber), Alert (blue), Delete (red)
- **Flag** adds a red dot indicator on the left side of the row
- **Delete** removes the stock with exit animation
- **Header 3-dot menu** shows: Sort, Edit, Create new section (only on watchlist page)
- **Sort bottom sheet** with 5 options: Symbol A–Z, % Change, Volume, Market Cap, Flag
- **Movers tab**: "Watchlist Movers" widget with TradingView multi-line chart comparing top 3 gainers (AMZN, META, AAPL) vs bottom 3 losers (AMD, INTC, TSLA) on a percentage scale, with dashed 0% baseline, stock list below with colored borders matching chart lines, dismiss (×) buttons
- **AI Insights tab**: AI-powered market analysis with 3 phases — analyzing animation (orbiting dots + cycling messages), typewriter text output with inline stock badges (colored gain/loss pills), and complete state with reanalyze button. Mock prose covers market overview, top movers analysis, sector commentary, and risk factors. Stock badges show symbol + % change inline within flowing text.
- Wrapped in `WatchlistProvider` context for cross-component state

---

## Components Built

### `StatusBar` + `HomeIndicator` — `components/iphone-frame.tsx`

iPhone chrome for realistic mobile framing.

- **StatusBar**: Time (9:41), dynamic island, signal/WiFi/battery icons. Tapping toggles dark/light theme via `useTheme()`.
- **HomeIndicator**: Bottom swipe bar (Face ID gesture area).

### `Header` — `components/header.tsx`

Home screen search header with stories integration.

- Layout: `[Story Ring / Profile] [Search Bar (pill)] [X Close]`
- **Story Ring**: Instagram-style segmented ring around profile avatar. Each segment = one story. Unread segments are gradient-colored (amber → red → purple), read segments are muted grey. Clicking opens the full-screen StoriesViewer.
- **Rotating placeholder**: Cycles through "ETF", "Stocks", "Options", "News", "Advisory", "Baskets", "Strategies" with upward slide animation
- Search bar is clickable — navigates to `/search` page
- Close button moved to rightmost position
- Exports `searchSuffixes` array and `useRotatingSuffix()` hook for reuse by search page
- **Props**: `onSortClick?: () => void` — when provided, options menu shows Sort/Edit/Create new section; when absent, shows default "Customise"

### `HeaderV1` (backup) — `components/header-v1.tsx`

Original header layout preserved as a backup for easy rollback.

- Layout: `[X Close] [Search Bar (pill)] [Bell w/ badge] [Profile avatar]`
- Same rotating search placeholder, options menu, and bell notification as original

### `StoriesViewer` — `components/stories-viewer.tsx`

Instagram-style full-screen stories viewer with trading content.

- **StoryRing** component: SVG-based segmented circle with `stroke-dasharray` segments. Takes `totalStories`, `readCount`, `size`, `children`, and `onClick` props. Gradient ring for unread, muted for read.
- **StoriesViewer** component: Full-screen overlay with 6 stories. Features:
  - Progress bars at top (one per story, auto-advancing over 5 seconds)
  - Tap left 35% = go back, tap right 65% = go forward
  - Long press pauses auto-advance
  - Slide-in/out content transitions via Framer Motion
  - Close button (X) at top right
  - Story counter at bottom
  - `onStorySeen` callback to track read progress
- **6 Mock Stories**: Top Movers, IPO Alert, Sector Spotlight, Portfolio Recap, What's New, Market Outlook — each with unique gradient background, icon, and rich card content

### `WatchlistContent` — `components/watchlist-content.tsx`

Main body of the Watchlist tab.

- **Collapsible sections**: Section header with label + count + animated chevron
- **SwipeableRow**: Framer Motion `drag="x"` with `dragDirectionLock` for native-feel horizontal swipe
- **Actions**: Flag (toggles red dot), Alert (no-op), Delete (removes with exit animation)
- **Sorting**: `useMemo` applies sort from context to each section's stocks
- Reuses `TickerLogo`, `formatPrice`, `formatChange`, `formatPercent`, `isGain` from `ticker.tsx`

### `MoversContent` — `components/movers-content.tsx`

Movers tab content showing top gainers vs losers comparison.

- **Chart**: TradingView `lightweight-charts` v5.1.0 with 6 overlaid `LineSeries` (percentage change Y-axis, intraday time X-axis)
- **Stocks**: 3 gainers (AMZN, META, AAPL) + 3 losers (AMD, INTC, TSLA), each with a unique color
- **Baseline**: Dashed 0% line separating gainers from losers
- **Stock list**: Colored left border, TickerLogo, name/symbol, price, % badge, dismiss button
- **Data**: Seeded PRNG generates deterministic mock intraday walks biased toward each stock's final change%
- **Interactions**: Dismiss (×) removes a stock; chart re-renders with remaining stocks
- Reuses `TickerLogo`, `formatPrice`, `formatPercent`, `isGain` from `ticker.tsx`

### `AiInsightsContent` — `components/ai-insights-content.tsx`

AI analysis tab with three-phase experience.

- **Phase 1 — Analyzing**: Orbiting dots animation (3 dots, 120° apart) around a pulsing Sparkles icon, with cycling status messages ("Scanning N positions...", "Analyzing market signals...", "Correlating price movements..."). Runs for 3.5 seconds.
- **Phase 2 — Typing**: Typewriter effect rendering prose text character-by-character at ~22ms/char with variable speed (pauses at punctuation). Inline `StockBadge` components render atomically as the stream reaches them. Blinking cursor at the typing position. Auto-scrolls to keep latest text visible.
- **Phase 3 — Complete**: Cursor disappears, "Reanalyze" button fades in. Clicking it resets via `key={runKey}` remount pattern.
- **StockBadge**: Inline `motion.span` showing symbol + % change with `bg-gain/15` or `bg-loss/15` tint, spring pop-in animation.
- **Content**: Structured as a `Segment[]` array (text/stock/break types) covering market overview, top gainers, losers, sector commentary, and risk factors.
- Consumes `useWatchlist()` for stock count; references `ALL_TICKERS` for badge data.

### `SortSheet` — `components/sort-sheet.tsx`

Bottom sheet for sorting watchlist stocks.

- 5 sort options: Symbol A–Z, % Change, Volume, Market Cap, Flag
- Active sort shows checkmark; tapping active sort deselects
- Uses shadcn Sheet (side="bottom", rounded-t-2xl)

### `WatchlistProvider` / `useWatchlist()` — `components/watchlist-context.tsx`

React Context for watchlist state shared between Header and WatchlistContent.

- `sortSheetOpen` / `openSortSheet` / `closeSortSheet`
- `currentSort` / `setSort` (symbol, change, volume, marketCap, flag, null)
- `flaggedSymbols` / `toggleFlag`
- `deletedSymbols` / `deleteSymbol`
- `collapsedSections` / `toggleSection`

### `MobileShell` — `components/mobile-shell.tsx`

Root mobile frame wrapping pages with navigation.

- Constrains to `max-w-[430px]` centered, `h-dvh` height
- Scrollable `<main>` with hidden scrollbar
- **Bottom Tab Bar**: 5 tabs (Home, Explore, Trade, Portfolio, Options)
- Active tab detection via `usePathname()` with animated indicator (`layoutId`)
- Glassmorphism: `bg-background/80 backdrop-blur-xl`
- Safe area padding: `pb-[env(safe-area-inset-bottom,8px)]`

### `ThemeProvider` — `components/theme-provider.tsx`

React Context for theme state management.

- Provides `theme` ("dark" | "light") and `toggleTheme()` function
- Toggles `dark`/`light` class on `<html>` element
- Default: dark mode
- Wrapped at root in `app/layout.tsx`

### Ticker Components — `components/ticker.tsx`

5 exported ticker variations, each self-contained with own state:

| Export | Style | Edit Trigger |
|---|---|---|
| `TickerMarquee` | Auto-scrolling infinite tape | Settings icon pinned right |
| `TickerPills` | Scrollable compact pills | "Edit" pill at end of row |
| `TickerCards` | Cards with price, change, intensity bar | Dashed "Edit" card at end |
| `TickerDense` | Two-line auto-scroll tape | "TICKER" label + settings pinned left |
| `TickerGlow` | Gradient glow cards | Dashed "Edit" card matching style |

**Shared internals:**

- **`EditSheet`** — Bottom sheet for selecting tickers with:
  - Search input (filters by symbol or company name)
  - **Tabbed navigation**: Indices, Watchlist, Equities, ETFs, Options — animated pill tabs
  - Watchlist tab shows currently-selected items; other tabs show all items of that type
  - **Max 10 tickers** — "Save N of 10" button label; items dim when limit reached
  - **Unselect all** in header clears all selections
  - Per-tab Select all / Deselect all
  - Colored logo avatars, two-line rows (name + symbol:exchange), price + % change
- **`TickerLogo`** — Colored circle avatar with 1-2 char abbreviation
- **`useTickerState()`** — Hook managing selected ticker list + filtered data
- **Mock data**: 27 tickers with `type` field (`"Index" | "Equity" | "ETF" | "Option"`):
  - **Indices** (5): SPX, NDX, DJI, RUT, VIX
  - **Equities** (17): AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, JPM, V, UNH, JNJ, WMT, AVGO, COST, NFLX, AMD, INTC
  - **ETFs** (5): SPY, QQQ, VOO, IWM, GLD
- **Helpers** (all exported): `formatPrice()`, `formatChange()`, `formatPercent()`, `isGain()`, `TickerLogo`
- **Extended fields**: `volume`, `marketCap`, and `type` on each `TickerItem`

### `MarketTable<T>` — `app/market/components/market-table.tsx`

Generic reusable scrollable table used ~8 times across the Markets page.

- **`TableColumn<T>`** interface: `key`, `label`, `align`, `frozen?`, `minWidth?`, `render(row, index)`
- Frozen first column: `sticky left-0 z-[2] bg-card shadow-[2px_0_8px_rgba(0,0,0,0.12)]`
- Header: `bg-muted/30 text-[12px] font-semibold uppercase tracking-wider`
- Cells: `text-[13px] font-mono tabular-nums whitespace-nowrap`
- Helper components: `PctCell` (green/red percentage), `RangeCell` (low–high range), `ChangeCell` (signed change value)
- Optional `onRowClick` callback per row

### `SubTabs` — `app/market/components/sub-tabs.tsx`

Pill-style horizontal scrollable sub-tab switcher.

- Framer Motion `layoutId` for animated active pill background
- Active: `bg-foreground text-background rounded-full`
- Inactive: `bg-muted/40 text-muted-foreground rounded-full`

### `NewsAccordion` — `app/market/components/news-accordion.tsx`

Perplexity Finance-style expandable news accordion.

- Framer Motion `AnimatePresence` for smooth expand/collapse
- Ticker tags: clickable pills linking to `/stocks/{symbol}`
- Source logos: colored circles with single character + source names
- First item expanded by default
- Props: `title`, `subtitle`, `items: NewsItem[]`, `sourceCount`

### `EarningsCalendar` — `app/market/components/earnings-calendar.tsx`

Self-contained earnings calendar widget.

- Week navigation (prev/next arrows), day strip (Mon–Fri)
- Active day: `bg-foreground text-background rounded-xl`
- Company rows: colored logo + name/ticker + EPS estimate + BMO/AMC badge

### shadcn/ui Components — `components/ui/`

Installed via `npx shadcn@latest add`:

- `sheet.tsx` — Bottom/side sheets (used by ticker edit)
- `button.tsx` — Button variants
- `badge.tsx` — Status badges
- `checkbox.tsx` — Checkboxes
- `scroll-area.tsx` — Custom scroll containers
- `switch.tsx` — Toggle switches

### `cn()` — `lib/utils.ts`

Utility combining `clsx` + `tailwind-merge` for conditional class composition.

---

## Configuration Details

### Fonts

Loaded via `next/font/google` in `app/layout.tsx`:

- **DM Sans** (400, 500, 600, 700) → `--font-sans` → `font-sans` utility — body text, labels, UI
- **JetBrains Mono** (400, 500, 600) → `--font-mono` → `font-mono` utility — prices, numbers, data

### Dark Theme (default)

Dark mode is forced via `<html class="dark">` in the root layout. Light mode is toggled by tapping the StatusBar. The color system uses HSL CSS variables consumed through Tailwind tokens.

**Key dark mode values:**

| Token | HSL Value | Usage |
|---|---|---|
| `--background` | `240 6% 6%` | Page background — near-black with slight blue |
| `--card` | `240 5% 9%` | Card/surface background |
| `--foreground` | `0 0% 96%` | Primary text — off-white |
| `--muted-foreground` | `240 5% 55%` | Secondary/quiet text |
| `--border` | `240 4% 14%` | Borders and dividers |
| `--secondary` | `240 4% 14%` | Secondary surfaces |
| `--gain` | `142 71% 45%` | Green — buy actions, positive P&L |
| `--loss` | `0 72% 51%` | Red — sell actions, negative P&L |

Use in Tailwind as: `text-gain`, `text-loss`, `bg-card`, `text-muted-foreground`, etc.

### Trading Color Tokens

```tsx
// In components:
<span className="text-gain">+2.34%</span>
<span className="text-loss">-1.12%</span>
<button className="bg-gain text-white">Buy</button>
<button className="bg-loss text-white">Sell</button>
```

---

## Conventions

- **StatusBar tap = theme toggle**: Present on every page using the StatusBar component
- **Each ticker variation is self-contained**: Own state, own edit sheet — no provider/context needed. Just `<TickerMarquee />`.
- **No backend**: All data is mocked inline in components
- **Mobile-only**: 390–430px width, no desktop breakpoints
- **Workflow**: Build one screen at a time, iterate, then move on

---

## Scripts

```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # ESLint
```

---

## Environment

- **Node.js**: v20.20.0 (installed via nvm)
- **npm**: 10.8.2
- **Platform**: macOS (darwin, arm64)

---

## Design Rules

- Mobile-only: 390–430px width, no desktop breakpoints
- Dark mode default with zinc/slate palette
- Green for buy/gain, red for sell/loss
- Font scale: large → prices, medium → labels, small → metadata, minimum 11px
- Spacing: 16px card padding, 12–16px section gaps
- Bottom sheets over modals, tab bars over hamburger menus
- Real mock data: realistic ticker symbols and prices
- No "AI slop" aesthetics — bold, confident, distinctive design
