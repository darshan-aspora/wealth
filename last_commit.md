# Changes Since Last Commit (519bca6 — Explore v1)

## Summary
UI tweaks to the Explore page, plus extensive (but unsuccessful) attempts to fix a critical Radix UI infinite re-render bug that made the entire app unresponsive.

---

## 1. Hero Text Layout — `app/explore/components/hero.tsx`
- Moved "Advisory Baskets · 1-Click Algo Strategies" to a second line with `<br />`
- Fixed TypeScript error: added tuple type assertion on `ease` array

## 2. Learning Journey — `app/explore/components/learning-journey.tsx`
- Removed "The First Step" (beginner) chapter — too basic/childish
- Made "The Confident Investor" the new Chapter 1 with intermediate content (earnings reports, P/E ratios, sector rotation)
- Fixed card alignment: added `flex flex-col` to card, `flex-1` to header, `mt-auto` to videos list so "View more" buttons align

## 3. Emotional Bridge Typography — `app/explore/components/emotional-bridge.tsx`
- Improved heading: `text-[28px] leading-[1.15] tracking-tight`, center-aligned, split into two lines ("Make your money" / "work for you")

## 4. Explore Page — `app/explore/page.tsx`
- Swapped order: `<Header />` now renders before `<TickerMarquee />` (was the reverse)

## 5. StatusBar Simplification — `components/iphone-frame.tsx`
- Removed `useTickerVisibility` dependency and `forceDark` logic
- StatusBar now always follows theme (no more forced dark when ticker is visible)
- Simplified all className bindings from conditional `forceDark ? "text-white" : "text-foreground"` to just `"text-foreground"`

## 6. Ticker Major Refactor — `components/ticker.tsx` (LARGEST CHANGE)
### Why
The `useLivePrices` hook re-rendered TickerMarquee every 1.5s. This caused Radix `SheetTrigger asChild` + `compose-refs` to trigger an infinite setState loop ("Maximum update depth exceeded").

### What changed
- **Removed `SheetTrigger`** usage entirely from `EditSheet`
- Changed `EditSheet` props from `{selected, onSave, trigger}` to `{selected, onSave, open, onOpenChange}`
- Each variation (TickerMarquee, TickerPills, TickerCards, TickerDense, TickerGlow, EditButton) now manages its own `editOpen` state
- Added **conditional rendering**: `{editOpen && <EditSheet ... />}` to prevent Sheet from existing in DOM when closed
- **Added `useLivePrices` hook** inline — simulates live price nudges every 1.5s
- **TickerMarquee restyled**: changed from auto-scrolling infinite marquee (dark `bg-[#0f0f11]`) to user-scrollable static tape with theme-aware colors (`bg-muted/30`, `text-foreground`)

## 7. Radix Sheet Conditional Rendering Guards (Bug Fix Attempt)
Applied `if (!open) return null` or `{open && <Sheet>}` guards to ALL Sheet components:
- **`components/bottom-nav.tsx`**: `{moreSheet && moreOpen && (` + added `relative z-50` to nav
- **`components/sort-sheet.tsx`**: `if (!sortSheetOpen) return null;`
- **`components/edit-sheet.tsx`**: `if (!editSheetOpen) return null;`
- **`components/movers-content.tsx`**: `if (!open) return null;` on AddStockSheet + fixed `Time` type cast + removed unused `Check` import
- **`app/explore-bottom-nav/page.tsx`**: `{moreOpen && <Sheet>...</Sheet>}`

## 8. Next.js Config — `next.config.mjs`
- Removed webpack `cache: false` config that conflicted with Turbopack (`--turbo` flag)
- Config is now just `const nextConfig = {};`

## 9. Claude Settings — `.claude/settings.local.json`
- Added several bash command permissions (build, curl checks)

---

## Bug Status
The "Maximum update depth exceeded" error from `@radix-ui/react-presence` / `@radix-ui/react-compose-refs` was **NOT resolved** despite all the above changes. The app remained unresponsive. Potential next steps:
- Downgrade `@radix-ui/react-dialog` to a pre-bug version
- Replace shadcn Sheet with a custom bottom-sheet implementation
