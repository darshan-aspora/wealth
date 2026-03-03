# US Equity — Project Documentation

## Overview

Mobile trading app prototype for US Equity, ETF, and Options trading. Design-first — no backend, no real data, no auth. Everything is mocked. Built for 390–430px mobile viewport in dark mode.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.35 | App Router, `app/` directory |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^3.4.1 | Utility-first styling, mobile-first |
| shadcn/ui | New York style, zinc base | Only component library (Sheet, Dialog, Tabs, Card, Button, etc.) |
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
│   ├── fonts/              ← Geist fonts (from scaffold, unused — we use Google Fonts)
│   ├── globals.css         ← Tailwind base + CSS variables (light/dark) + custom utilities
│   ├── layout.tsx          ← Root layout: dark mode, DM Sans + JetBrains Mono, viewport meta
│   └── page.tsx            ← Home page (empty placeholder, wrapped in MobileShell)
├── components/
│   ├── ui/                 ← shadcn auto-generated components (empty for now)
│   └── mobile-shell.tsx    ← Mobile frame (430px max-width) + bottom tab bar
├── lib/
│   └── utils.ts            ← `cn()` helper (clsx + tailwind-merge)
├── components.json         ← shadcn/ui config
├── tailwind.config.ts      ← Tailwind config with custom colors, fonts, shadcn tokens
├── tsconfig.json           ← TypeScript config with `@/*` alias
├── postcss.config.mjs      ← PostCSS config for Tailwind
├── next.config.mjs         ← Next.js config (default)
├── package.json            ← Dependencies & scripts
└── SKILL.md                ← Frontend design skill reference
```

### Planned Structure (not yet built)

```
app/
  explore/page.tsx          ← Discover / Market overview
  stock/[ticker]/page.tsx   ← Stock detail + chart
  trade/page.tsx            ← Order entry (buy/sell)
  portfolio/page.tsx        ← Holdings + P&L
  options/page.tsx          ← Options chain view

components/
  stock-card.tsx            ← Reusable stock row (ticker, price, change)
  chart-widget.tsx          ← TradingView Lightweight Charts wrapper
  bottom-sheet.tsx          ← Composed from shadcn Sheet
  order-form.tsx            ← Buy/Sell form
  pill-badge.tsx            ← Green/red change badges

lib/
  mock-data.ts              ← Static stock data, price histories, portfolio
  chart-config.ts           ← TradingView chart theme + options
```

---

## Configuration Details

### Fonts

Loaded via `next/font/google` in `app/layout.tsx`:

- **DM Sans** (400, 500, 600, 700) → `--font-sans` → `font-sans` utility — body text, labels, UI
- **JetBrains Mono** (400, 500, 600) → `--font-mono` → `font-mono` utility — prices, numbers, data

### Dark Theme (default)

Dark mode is forced via `<html class="dark">` in the root layout. The color system uses HSL CSS variables consumed through Tailwind tokens.

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

Added custom `gain` and `loss` colors to both CSS variables and Tailwind config:

```tsx
// In components:
<span className="text-gain">+2.34%</span>
<span className="text-loss">-1.12%</span>
<button className="bg-gain text-white">Buy</button>
<button className="bg-loss text-white">Sell</button>
```

---

## Components Built

### `MobileShell` — `components/mobile-shell.tsx`

The root mobile frame that wraps every page.

**What it does:**
- Constrains content to `max-w-[430px]` centered horizontally
- Sets `h-dvh` (dynamic viewport height) for full-screen mobile feel
- Renders a scrollable `<main>` area with hidden scrollbar (`.no-scrollbar`)
- Bottom padding (`pb-20`) to clear the fixed tab bar

**Bottom Tab Bar:**
- 5 tabs: Home, Explore, Trade, Portfolio, Options
- Icons from Lucide React (Home, Search, ArrowLeftRight, PieChart, LayoutGrid)
- Active tab detection via `usePathname()` — exact match for `/`, prefix match for others
- Animated active indicator using Framer Motion `layoutId` (spring animation)
- Glassmorphism effect: `bg-background/80 backdrop-blur-xl`
- Safe area padding: `pb-[env(safe-area-inset-bottom,8px)]`

### `cn()` — `lib/utils.ts`

Utility function combining `clsx` and `tailwind-merge` for conditional class composition.

---

## Global Styles — `app/globals.css`

- Full light + dark CSS variable sets (shadcn zinc base)
- Custom `--gain` and `--loss` variables for trading colors
- `--radius: 0.75rem` for consistent border radius
- Universal `border-border` applied to all elements
- Body: `bg-background text-foreground` with font smoothing and no tap highlight
- `.no-scrollbar` utility: hides scrollbar across Webkit, Firefox, and IE/Edge

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

## Design Rules (reference)

- Mobile-only: 390–430px width, no desktop breakpoints
- Dark mode default with zinc/slate palette
- Green for buy/gain, red for sell/loss
- Font scale: large → prices, medium → labels, small → metadata, minimum 12px
- Spacing: 16px card padding, 12–16px section gaps
- Bottom sheets over modals, tab bars over hamburger menus
- Real mock data: AAPL, TSLA, NVDA, SPY with realistic prices
