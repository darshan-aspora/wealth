# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A mobile trading app prototype for US Equity, ETF, and Options trading — brand name **Aspora Wealth**. Priority is visual polish and interaction fidelity — no backend, no real data. Inspired by Robinhood simplicity + Groww/Zerodha info density.

## Commands

- `npm run dev` — start dev server (Turbopack)
- `npm run dev:webpack` — start dev server (webpack, slower)
- `npm run dev:clean` — nuke `.next` cache and restart dev
- `npm run build` — production build (**do NOT run while dev server is active** — it will crash the Turbopack process)
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check without emitting (safe to run alongside dev server)
- `npx shadcn@latest add <component>` — add new shadcn/ui components (new-york style, neutral base)

No test framework is configured.

## Tech Stack

- **Next.js 14** (App Router, `app/` directory), TypeScript, Tailwind CSS
- **shadcn/ui** — the ONLY component library (installed in `components/ui/`)
- **TradingView Lightweight Charts** (`lightweight-charts`) — all charting with mock/static data
- **Framer Motion** — transitions, micro-interactions, gestures
- **Lucide React** — icons
- Fonts: Inter (sans via `--font-sans`) loaded via `next/font/google` in `app/layout.tsx`. **Inter is the only font** — do not use `font-mono` anywhere (see Design Rules).
- Path alias: `@/*` maps to project root (e.g., `@/components/ui/button`)

## Architecture

- **All pages are `"use client"`** — every page uses interactivity (Framer Motion, context, state). New pages must include the `"use client"` directive.
- **Mobile-first layout**: every page wraps content in `max-w-[430px] mx-auto` container
- **Root layout** (`app/layout.tsx`) wraps the app in `ThemeProvider` → `TickerVisibilityProvider` → `AIProvider`
  - `ThemeProvider` (`components/theme-provider.tsx`): custom class-based dark/light toggle via React context, NOT next-themes
  - `TickerVisibilityProvider` (`components/ticker-visibility.tsx`): controls global ticker tape visibility (show/hide from any page)
  - `AIProvider` (`contexts/ai-context.tsx`): manages AI chat overlay state, conversations, and mock streaming responses
- **AI subsystem**: `components/ai-overlay.tsx` is the chat overlay component (not currently mounted — import and add to layout if needed). `components/ai/` contains the overlay's internal components (header, body, input bar, message bubbles, welcome screen, buddy, history panel). Mock data lives in `lib/ai-responses.ts` and `lib/ai-suggestions.ts`.
- **Theme toggle**: tapping the iPhone `StatusBar` component toggles dark/light mode — this must be present on every page using the status bar
- **Directory page** (`app/page.tsx`): index of all screens/components with tabbed navigation
- **Shared components** in `components/`: `bottom-nav.tsx`, `header.tsx`, `mobile-shell.tsx`, `ticker.tsx`, `stories-viewer.tsx`, `iphone-frame.tsx` (StatusBar + HomeIndicator), and context providers (`watchlist-context.tsx`, `ticker-visibility.tsx`)
- **Custom semantic colors** in Tailwind: `gain`/`loss` for green/red (use `text-gain`, `text-loss`, `bg-gain`, `bg-loss`), plus standard shadcn HSL variables (`background`, `foreground`, `card`, `muted`, etc.) defined in `app/globals.css`
- **Custom Tailwind animations** defined in `tailwind.config.ts`: `animate-slide-up-in`, `animate-marquee`, `animate-marquee-fast` — use these for sheet entrances and ticker tapes
- **Dark mode** via `class` strategy in Tailwind (`darkMode: ["class"]`), toggled by adding/removing `.dark` on `<html>`
- **Webpack cache disabled** in dev (`next.config.mjs`) to avoid Next.js 14.2.x stale cache bugs
- **`lib/` directory**: `utils.ts` (cn helper), `ai-responses.ts` and `ai-suggestions.ts` (mock AI data)

## Page Structure

Each page under `app/` is self-contained with colocated components (e.g., `app/market/components/`, `app/portfolio/tabs/`). Run `ls app/` to see all routes. Some pages have variant explorations in subdirectories (e.g., `app/explore/versions/`). The root page (`app/page.tsx`) is a directory/index of all screens.

## Design Rules

- **No `$` signs** before prices anywhere — display raw numbers (e.g., `892.4` not `$892.4`)
- **Large font sizes** — minimum: body/tab labels `text-[15px]`, headings `text-[17px]+`, placeholders `text-[14px]`. When in doubt, go bigger.
- **No `font-mono`** — use Inter (default sans) for everything including prices, numbers, and financial data. Use `tabular-nums` font-feature for alignment if needed, but never switch to a monospace font family.
- Bold aesthetic, avoid generic/safe design. Dark mode trading app context.
- Lead with insight, not raw data — tell the user *why* they should care about a number (see `design_principles.md`)
- Warm, slightly cheeky brand voice — smart friend who knows money, not a Bloomberg terminal
- Simple on the surface, serious underneath — show essentials first, depth one level deeper
- Reference `SKILL.md` for detailed frontend design guidance and `design_principles.md` for full design philosophy

## Workflow

- Build one screen at a time as described by the user — do NOT scaffold the full app upfront
- Each screen is a self-contained page with colocated components
- All data is mocked — no API routes, auth, or database logic
- After building or modifying any page/component, **update `documentation.md`** at the project root to reflect current state
