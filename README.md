# Housebets

A sportsbook prototype with live and upcoming matches across football, tennis, basketball and cricket. Browse matches, build a bet slip, place single bets, and track your bets. It uses invented sample data and a sample balance, so there is no real player data and no real money.

Built with [Arc Studio](https://studio.arc.io)

## Features

- Home, Live, Football and Bets pages, plus a full markets page for every match
- Live scores, match timers and odds that update as you watch
- Home, Draw and Away odds on compact match cards, with tabs for other markets such as double chance, total goals and both teams to score
- Bet slip for single bets only (no multis, boosts or free bets), with potential returns and warnings for suspended markets or moved prices
- My bets with open and settled bets and cash out
- Follow teams and competitions, and search teams, players, competitions and markets
- Responsive layout: sidebars on desktop, bottom navigation and an expandable bet slip on phones
- Royal Emerald theme

## Tech stack

- React, TypeScript, Vite
- Tailwind CSS
- Framer Motion, Lucide icons, Sonner toasts

## Development

Prerequisites: [Bun](https://bun.sh)

```bash
bun install
bun run dev
```

The app runs at http://localhost:5173.

### Other commands

```bash
bun run check       # lint and typecheck
bun run typecheck   # TypeScript only
```

### Environment variables

None.
