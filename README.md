# The Gilded Vault — a museum heist game

![Make the best heist game](https://make.fun/badge/best-heist-game-20261122-0559.svg)
![Rank](https://make.fun/badge/best-heist-game-20261122-0559/surya-palo/heist-game/rank.svg)
![Reward](https://make.fun/badge/best-heist-game-20261122-0559/surya-palo/heist-game/reward.svg)

An original top-down stealth heist game, entered in the
[Make the best heist game](https://make.fun/competitions/best-heist-game-20261122-0559)
bounty on [make.fun](https://make.fun).

## The job

One diamond. Three galleries. No witnesses. Slip past patrolling guards and
sweeping security cameras, crack the display case holding the Aurora Diamond,
and reach the getaway door — without tripping the alarm.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any static
HTTP server — the game makes no network requests).

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| Shift | Sneak — slower, harder to spot |
| E (hold) | Crack the display case / use the exit |
| Q | Smoke pellet (3 per gallery) — hides you from every cone |
| Click near the thief | Lob a smoke pellet to that spot |
| R | Restart the gallery |

Guards patrol with vision cones and stop to stare when they see you; cameras
sweep fixed arcs you can learn. Being seen fills the alarm meter — break line
of sight and it drains. At 100% you are caught. Score comes from the loot,
a time bonus against each gallery's par, and a stealth bonus for keeping the
alarm low.

## Structure

- `game/index.html` — page shell, HUD, title card
- `game/css/style.css` — all styling
- `game/js/main.js` — state machine, game loop, input, alarm
- `game/js/levels.js` — the three gallery layouts
- `game/js/player.js` — the thief: movement, sneak, lockpick
- `game/js/guard.js` — patrols, vision cones, detection
- `game/js/camera.js` — sweeping security cameras
- `game/js/render.js` — all canvas drawing
- `game/js/audio.js` — procedural WebAudio effects (no audio files)
- `game/js/hud.js` — DOM heads-up display
- `game/js/geom.js` — angles, cones, line-of-sight
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output`
  and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `screenshots/` — 3–4 real renders of the game

## License

MIT — see [LICENSE](LICENSE).
