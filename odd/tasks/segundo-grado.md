# Feature: second grade (2do) and more fun for everyone

## Objective
Programitos was built for 1st grade. Make it usable with 2nd grade too, and more fun for both, without changing
what 1st grade already knows (48 levels, blocks, saved progress).

## Why
- 2nd graders find the 1st-grade levels too easy, and in class they "do not look for efficient solutions" and
  "the `if` arrives suddenly and as text" (class notes 2026-09-27). So: reward short programs and introduce the
  conditional as one pictographic block that is really needed.
- In real 1st-grade classes the favourites were racing and the dress-up shop; kids get bored when the guided part ends.

## Scope and constraints
- Static HTML/CSS/JS, no runtime dependencies, no build. Runs on classroom PCs without GPU: no background animation,
  no animated filter/box-shadow (see header of style.css). Min viewport 1024x600; also works at 1366x768 and 1920x1080.
- Two kids per computer, one keyboard (Tito left, Lula right) + mouse/touch. Little or no reading; voice may be muted,
  so everything must be understandable from pictures.
- UI copy and code comments: Spanish, matching the existing project (voseo). Commits: English conventional commits,
  no AI attribution.
- 1st-grade progress (`programitos-v2` in localStorage) must survive untouched. 2nd grade uses `programitos-v2-g2`.
- Nobody loses: no eliminations, no ranking between pairs.
- Push and deploy are NOT authorized yet (classes use the live site).
- RDD is off (global, user decision). TDD: not configured; ordinary functional checks.
- Delivery: `exception-ok` (repo has no PR flow), work-unit commits on `feat/segundo-grado`. Forecast ~1500 lines.

## Design

### Engine (T1)
`public/js/engine.js`, pure (no DOM), loadable from browser (`window.Engine`) and node. It owns flatten/interpretation:
a generator per player that yields events (step, move, bump, box, star, cond, pad, home, fail) evaluated lazily so
conditionals see the live world. `game.js` only animates events. `tools/check-levels.mjs` (node, no deps) plays every
level of both grades with a stored solution and asserts the win, max blocks, and that predict levels have a right answer.

### Grades (T1)
Start screen gets two small pills `1°` / `2°` (remembered in localStorage; `?grado=1|2` forces and remembers).
1°: exactly today's flow. 2°: after joining goes straight to the map. Worlds, levels, stickers, themes, tutorials
and saves are per grade. 1st-grade levels keep their order and indexes.

### New blocks, 2nd grade only (T2)
- `until` 🔁🏠 "repetir hasta la casita": same C block as repeat, header shows 🏠 instead of − n +. Checked before
  each iteration; more than 20 iterations fails with reason `loop` (dizzy robot).
- `c` 👀⭐🧺 "si hay estrella, recoger": one atomic block, fits inside repeat bodies.
- `g` 👀👻🔦 "si hay fantasma, alumbrar": one atomic block.
- Surprise boxes 🎁 (map char `?`): open when stepped on. `boxes:'star'` → star or nothing; `boxes:'ghost'` → star or
  ghost. Leaving a lit-less ghost fails with reason `ghost`.
- Moving house: level lists candidate positions `houses:{A:[[x,y]..],B:[..]}`, drawn dashed; when the run starts the
  house jumps between them and lands on one.
- Variants are picked adversarially: if the current programs fail on some variant, one of those is played; otherwise
  random. So a right program always wins and a hard-coded one does not win by luck.
- Keys: Tito T until, G si-estrella, V si-fantasma, Z/X − and + of the last repeat. Lula P until, L si-estrella,
  K si-fantasma, `,`/`.` − and +. (− and + also for 1st grade.)

### 2nd-grade worlds, 6 levels each (T3)
1 🎡 El parque — repeat recap, short programs. 2 🏙️ La ciudad — 3-block bodies, doors, bug fixing, predict.
3 🌙 La noche — repetir hasta 🏠, moving house. 4 🏰 El castillo — si estrella, boxes. 5 👻 La mansión — si fantasma,
both conditions. 6 🌋 El volcán — everything together, coop doors.
Gem 💎: every level has `par:{A,B}` (blocks of the stored solution). Winning with both programs ≤ par shows 💎 next to
the stars (extra prize, never a penalty; the 3 stars do not depend on it).

### Fun for everyone (T4, T5)
- 🏁 Carrera (both grades, button on map): game screen with a 9x5 board, two mirrored lanes split by water, generated
  randomly with growing difficulty, 5 rounds. Each kid runs their own program with their own ▶, no countdown, no waiting.
  Error: robot goes back to start, program stays. First home +2 🪙, second +1 🪙, then next round. Ends with two cups.
- 🪙 coins per character: level win gives coins equal to stars (first time) or 1 (replay), +1 for 💎.
- 👕 Ropero (split screen, each kid dresses their own character): ~20 emoji items, slots head/face/hand/trail, prices 3–15,
  shown everywhere the character is drawn; trail draws while walking.

### Less friction (T6)
- Countdown 3-2-1 only on the first run of a level; retries show a short "¡YA!".
- Hint 💡 in "need all stars" levels must go through the stars (today it ignores them).
- After 3 fails on a level the fail card shows ⏭️ (skip); the next level opens, no stars given.
- Map must fit/scroll at 1024x600 with 8 worlds.
- Teacher panel: 1°/2° switch, updated help (blocks, keys, race, wardrobe). README updated. Cache version bump.

## Tasks
- [ ] T1 Pure engine + level checker + grade selection (delegated)
- [ ] T2 New blocks, boxes, moving house (delegated)
- [ ] T3 36 second-grade levels, gem (delegated)
- [ ] T4 Race mode (delegated)
- [ ] T5 Coins and wardrobe (delegated)
- [ ] T6 Friction fixes, teacher panel, README, cache bump (delegated)
- [ ] T7 Parent verification in a real browser, both grades, screenshots

## Checks
`node tools/check-levels.mjs` passes; browser script plays every 2nd-grade level and 1st-grade smoke with no console errors.

## Progress / evidence
(none yet)
