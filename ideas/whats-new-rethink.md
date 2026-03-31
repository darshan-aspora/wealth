# Rethinking "What's New" — Community-First, Not Stories

**Date:** March 30, 2026

## The Problem with Stories

Stories are borrowed from social media. They're passive, disposable, and one-directional. For a new brokerage trying to build community and trust, they communicate the wrong thing: "we're talking at you." They also age badly — after you've seen them, they're dead weight.

What we actually need from this surface:
1. **Community signal** — "we listen, you shape this product"
2. **Feature communication** — announce launches without feeling like a changelog
3. **Engagement** — not vanity engagement, but things that make the user feel invested in Aspora's direction
4. **Freshness** — the header area should feel alive every time you open the app

---

## Direction A: The Town Square

A single, rotating card in the header that cycles through three types of content. Not a carousel — one card at a time, contextual to what matters right now.

### Card Types

**1. "You Asked, We Built"**
When a feature ships, don't announce it like a corporate changelog. Frame it as a response to the community. The card shows: who asked for it (anonymized or quoted), how many people upvoted it, and a single tap to try it.

> *"287 of you asked for price alerts. They're here."*
> [Try it]

This flips the script — feature launches feel like the community winning, not the company shipping.

**2. "What Should We Build Next?"**
A lightweight poll. Two or three options. One tap to vote. Shows live vote counts. Changes weekly. The user sees their vote reflected instantly, and the next time that feature ships, they get the "You Asked, We Built" card referencing the poll.

> *This week: What matters more to you?*
> [ ] Options chain visualization
> [ ] Earnings calendar with alerts
> [ ] Sector heatmap
> *1,247 votes so far*

This is real engagement — it costs the user one tap, gives them ownership, and gives you a direct feedback signal.

**3. "From the Team"**
A short, warm, human message. Not a PR announcement. Something the founder or a team member would actually say. Could be a milestone ("We crossed 10k users this week"), a behind-the-scenes moment ("We spent 3 weeks on how the buy button feels"), or a genuine ask ("What's the one thing that would make you recommend Aspora to a friend?").

The tone follows design principle 1b — smart friend, not corporate announcement.

### How It Lives in the UI

- The "What's New" text under "US Stocks" becomes the entry point
- Tapping it reveals a single card (not a horizontal scroll of story circles)
- The card has a subtle type indicator: a small icon or label (community / feature / team)
- Card auto-collapses after interaction or can be dismissed
- New content gets a subtle dot indicator on "What's New"

---

## Direction B: The Pulse

Instead of a reveal panel, "What's New" opens a compact feed — 3-4 items max, newest first. Think of it as the app's heartbeat. Each item is a single line with an action.

### Item Types

**Feature Drop**
`[rocket icon] Price Alerts are live — try it`
Tapping navigates to the feature. Clean, direct.

**Community Vote**
`[poll icon] Help us decide: Dark mode charts or light? — vote`
Inline vote with two buttons. Result shows after voting.

**Milestone**
`[flag icon] 5,000 users this week. Thank you.`
No action needed. Just human warmth.

**Open Question**
`[message icon] What's one thing we're missing? — tell us`
Opens a simple text input sheet. Responses go to an internal queue.

### Why This Works
- It's scannable — you can consume it in 2 seconds
- It's fresh — 3-4 items that change regularly feel alive
- It doesn't hijack the screen — it's compact and dismissible
- Each item type serves a different goal (announce, engage, connect, listen)

---

## Direction C: The Bulletin Board

The reveal panel becomes a pinned, structured space with sections. Not a feed — a curated board.

### Sections

**Shipping Now**
One feature, prominently shown. Name, one-line description, and a CTA. Changes when something new ships.

**Community Radar**
An active poll or question. Always one live at a time. Shows participation count. Results visible after voting.

**The Roadmap**
3-4 upcoming features listed as short text. No dates, no promises — just "what we're working on." Users can tap a heart/upvote to signal what they care about. This is incredibly powerful for prioritization and makes users feel heard.

**A Word from Us**
A rotating quote, thought, or note from the team. Informal. Could be funny, could be sincere. Changes weekly.

### Why This Works
- It gives "What's New" real structure and purpose
- The roadmap section alone is a retention hook — people come back to check progress
- It's community-first by design — two of four sections are participatory
- It turns the header reveal into a destination, not a notification

---

## Direction D: The Single Thread

The most minimal approach. "What's New" reveals exactly one thing at a time. One card. One message. One action. When you're done with it, it's gone, and the next one appears.

Think of it like a queue:
- Monday: "Options trading is live. Explore it."
- Wednesday: "Quick poll: What should we build next?"
- Friday: "This week: 12,000 trades placed. Here's what moved."

### Why This Works
- Zero cognitive load
- Creates a habit — "let me check what Aspora has today"
- Every message gets 100% attention because there's no competition
- Feels personal, like a message from a friend, not a notification center
- The scarcity makes each card feel important

---

## Recommendation

**Direction A (The Town Square)** is the strongest for where Aspora is right now.

Reasoning:
- The three card types (You Asked We Built / Community Vote / From the Team) map directly to the three goals: feature communication, engagement, and community building
- It's simple to implement — one card at a time, three templates
- It scales — as the community grows, the votes carry more weight, the "You Asked" cards reference bigger numbers, and the team messages feel more meaningful
- It follows design principle 1c (Play for the User) — every interaction genuinely helps or involves the user
- It avoids the "notification fatigue" of a feed
- The single-card approach follows principle 2b (Breathe Easy) — one thing, well-presented, not a wall of announcements

**Start with just the Community Vote card.** Before you have features to announce, the vote alone does the heavy lifting: it signals "we're listening," creates engagement, and gives you real product signal. Ship the other card types as you start launching features.

---

## Implementation Notes

- The reveal animation should feel like a drawer, not a popup — content slides down and pushes the page, maintaining spatial continuity
- Cards should have a consistent size (~120px height) so the layout shift is predictable
- A small dot on "What's New" text indicates unread/new content
- After interacting with a card (voting, tapping CTA), it should acknowledge gracefully (checkmark, thank you micro-animation) and auto-collapse after a beat
- Vote data can be mocked for now but design the card to look real — show vote counts, percentages, a progress bar
- Keep the "What's New" chevron — it's good affordance
