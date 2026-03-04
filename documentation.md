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
│   └── explore-tickers/
│       └── page.tsx                ← 5 ticker component variations showcase
├── components/
│   ├── iphone-frame.tsx            ← StatusBar (theme toggle on tap) + HomeIndicator
│   ├── mobile-shell.tsx            ← Mobile frame (430px) + bottom tab bar with 5 tabs
│   ├── theme-provider.tsx          ← Dark/light theme context + toggleTheme hook
│   ├── ticker.tsx                  ← 5 ticker variations + EditSheet + mock data (20 stocks)
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

---

## Components Built

### `StatusBar` + `HomeIndicator` — `components/iphone-frame.tsx`

iPhone chrome for realistic mobile framing.

- **StatusBar**: Time (9:41), dynamic island, signal/WiFi/battery icons. Tapping toggles dark/light theme via `useTheme()`.
- **HomeIndicator**: Bottom swipe bar (Face ID gesture area).

### `Header` — `components/header.tsx`

Home screen search header.

- Layout: `[X Close] [Search Bar (pill)] [Bell w/ badge] [Options menu]`
- **Rotating placeholder**: Cycles through "ETF", "Stocks", "Options", "News", "Advisory", "Baskets", "Strategies" with upward slide animation
- Search bar is clickable — navigates to `/search` page
- Exports `searchSuffixes` array and `useRotatingSuffix()` hook for reuse by search page

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
  - Grouped by category (Indices / Watchlist) with sticky headers
  - Colored logo avatars for each stock
  - Two-line rows: bold symbol + lighter company name
  - Price + % change on the right
  - Select all / Deselect all per group
  - Save button
- **`TickerLogo`** — Colored circle avatar with 1-2 char abbreviation
- **`useTickerState()`** — Hook managing selected ticker list + filtered data
- **Mock data**: 20 stocks across 2 categories:
  - **Indices** (3): SPX, NDX, DJI
  - **Watchlist** (17): AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, JPM, V, UNH, JNJ, WMT, AVGO, COST, NFLX, AMD, INTC
- **Helpers**: `formatPrice()`, `formatChange()`, `formatPercent()`, `isGain()`

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
