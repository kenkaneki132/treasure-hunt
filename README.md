# 🏴‍☠️ Treasure Hunt

A timed betting game with a treasure-hunt theme. Press **Start**, pick up to **6 numbers** on the treasure map and choose a **chip** before the 15-second timer runs out. Five treasures are hidden; any hit pays **bet × (hits + 1)**, and no hits loses the bet.

**Play:** https://kenkaneki132.github.io/treasure-hunt/

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/build-Vite-646CFF?logo=vite&logoColor=white)
![Tests](https://img.shields.io/badge/tests-33%20passing-success)

Originally built during my front-end internship at **Pragmatic Play** (Jan–Jun 2023) with React, using reusable components and real-time state across a dynamic 48-cell board. This version keeps the original rules exactly; only the appearance changed.

## What it looks like

- **The board is a treasure map**: parchment with burnt, torn edges, an island with mountains, palms, a dotted trail and a compass rose. The 48 numbers sit on the map as dig spots.
- **Picking a number** paints a red-ink X with a burst of sand. Clicking it again removes the pick with a puff of dust.
- **Once 6 numbers are picked the board closes** (the original 6-pick limit, now visible): every free number greys out and can't be clicked, and a ribbon explains why. Removing a pick reopens it.
- **The reveal** pops the treasure chests open one by one, gold glowing on the numbers you hit with coins flying out. Missed picks turn into empty dug holes. A win rains coins across the screen; a loss shakes the map.
- **Sand-clock timer** turns red and ticks for the last five seconds.
- **Bets panel** with gold chips (1, 5, 10, 20, 25), your six picks, the bet and the reward for every possible number of hits. The **captain's log** tracks rounds, wins, win rate, best win and recent rounds.
- **Sound effects** are synthesized in the browser (no audio files) and can be muted; the choice is remembered.
- Works on phones (the map switches to 6 columns), with keyboard focus styles, screen-reader labels and a `prefers-reduced-motion` mode that turns every animation off.

## How to play

1. **Start** opens a 15-second betting window.
2. Pick up to 6 numbers and choose a chip (1, 5, 10, 20, 25). Your bet is `chip × picks`.
3. **UNDO** reverts your last action. **REPEAT** restores last round's picks and chip.
4. When the timer ends, 5 treasures are revealed. Any hit pays `bet × (hits + 1)`; no hits loses the bet.
5. **Next round** keeps your balance; **New game** resets it to 10,000. Play money only.

## Run it on a new machine

Requirements: **Node.js 18 or newer** (CI uses Node 22) and npm.

```bash
git clone https://github.com/kenkaneki132/treasure-hunt.git
cd treasure-hunt
npm install
npm run dev        # http://localhost:5173
npm test           # 33 tests (Vitest + Testing Library)
npm run build      # production build in build/
npm run preview    # serve the production build locally
```

No environment variables, API keys or backend are needed. The fonts (Pirata One, Rubik) load from Google Fonts; without a network connection the game falls back to system fonts and still works.

## Deploy

- **GitHub Pages (automatic):** `.github/workflows/deploy-pages.yml` tests and builds every push and pull request, and on `main` publishes `build/` to the `gh-pages` branch, which Pages serves (*Settings → Pages → Deploy from a branch: gh-pages*). No setup needed.
- **Manual:** `npm run deploy` publishes `build/` with `gh-pages`.
- Any static host works: upload `build/`. Routing uses `HashRouter`, so deep links never 404.

## Architecture

```
src/game/engine.js            pure rules: drawTreasures, settle, reducer, isLocked, payoutTable (no React, no timers)
src/game/fx.js                WebAudio sound effects + reduced-motion check (no-ops when audio is unavailable)
src/Components/Game.jsx       useReducer(engine), one interval per round, sound cues, coin shower
src/Components/TreasureMap.jsx  the map, 48 dig spots, click bursts, lock ribbon, start veil
src/Components/StatusBar.jsx  sand-clock timer, picks left, round result
src/Components/BetSlip.jsx    balance, chips, picks, bet, reward table, UNDO/REPEAT
src/Components/Logbook.jsx    stats, recent rounds, new game
src/Components/MapArt.jsx     island, trail and compass (SVG)
src/Components/Icons.jsx      chest, coins, skull and UI icons (SVG, so they look the same on every device)
```

The engine is a pure reducer (`START`, `TICK`, `TOGGLE`, `CHIP`, `UNDO`, `REPEAT`, `REVEAL`, `NEXT_ROUND`, `NEW_GAME`). Randomness is injected (`REVEAL` carries the treasures), so every rule is unit-testable and the UI tests can seed the draw.

## Tests

- `src/game/engine.test.js` (25): unique treasure draws, the payout rule, the 6-pick limit, balance limits, void rounds, a payout applied exactly once, immutable undo, repeat and next round, `isLocked`, and the reward table.
- `src/Components/Game.test.jsx` (8): a full round with fake timers (pick → chip → countdown → reveal → settle); UNDO; **the board closes after 6 picks and reopens when one is removed**; the reveal waits for the full 15 seconds; muting sound persists; every timer is cleared on unmount; routing from the start page.

GitHub Actions runs the tests on every push and pull request, then deploys `main` to Pages.

## Changelog

### Treasure-map redesign (appearance only, rules unchanged)
- New board: a parchment treasure map instead of a plain numbered grid, with SVG art in place of emoji.
- Click effects (ink X, sand and dust bursts), treasure-chest reveal animation, hit glow and coin bursts, a win coin shower and a shake on a loss.
- The board visibly closes once 6 numbers are picked (free numbers disabled and greyed, a ribbon explains why).
- Bets panel with a reward table, captain's log with win rate and best win, how-to-play popover, sound effects you can mute.
- New start screen; responsive phone layout; reduced-motion support.

### Bug fixes (portfolio-upgrade)

| Bug in the original | Fix |
|---|---|
| Treasures were drawn **with replacement**, so a round could have fewer than 5 | Fisher–Yates draw of 5 unique cells |
| `Results`/`Bets` called `setState` **during render** (render loops and warnings) | All state lives in one reducer |
| Payout was applied in an effect that re-ran when the bet changed, so it could **apply twice** | Settled exactly once in `REVEAL` |
| Balance could go **negative**; empty rounds took no stake but still counted | Picks and chips limited by balance; empty rounds are void |
| Countdown interval mutated a captured variable and was **never cleared** | One interval per round, cleaned up on unmount |
| UNDO used `.pop()` on state arrays (mutation) | Immutable snapshot stack |
| `<body>` rendered inside `#root` (invalid HTML) | `<main>` |
| `BrowserRouter` deep links **404 on GitHub Pages refresh** | `HashRouter` |
| Create React App (deprecated), and the only test failed | Vite + Vitest |
