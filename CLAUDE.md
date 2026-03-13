# Glyph — Multiplayer Word Duel

## Tech Stack
- Next.js 15 (App Router) + React 19
- Convex (database, real-time, auth, scheduled functions)
- Tailwind CSS 4
- Framer Motion for animations
- pnpm

## Development
- `pnpm dev` runs both Convex and Next.js
- Convex functions are in `convex/` — mutations, queries, scheduled functions
- Schema changes require `npx convex dev` to regenerate types

## Conventions
- Push to main, Vercel auto-deploys
- Dark-mode-first design, warm gold accent (#D4A574)
- Anonymous sessions via localStorage UUID, optional Convex Auth
- All word validation and feedback calculation happens server-side in Convex
- Never expose secretWord to the client
- Mobile-first responsive design (min tap target 44px)

## Key Files
- `convex/schema.ts` — all table definitions
- `convex/games.ts` — core game logic
- `convex/duels.ts` — duel mode logic
- `src/lib/words.json` — 5-letter dictionary
- `src/lib/feedback.ts` — client-side feedback display helpers
