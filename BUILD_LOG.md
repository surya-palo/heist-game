# BUILD_LOG — The Gilded Vault (heist game)

## What was built
An original top-down 2D stealth heist game in a museum gallery, written from
scratch in plain HTML/CSS/JavaScript (ES modules, no libraries, no network).
The thief crosses a room past patrolling guards with vision cones and sweeping
security cameras, cracks the Aurora Diamond's display case (hold E), and
reaches the getaway door before the alarm meter hits 100%.

Features:
- 3 galleries with distinct layouts, rising guard/camera counts (levels.js)
- Guard patrols with smooth turning, stop-and-stare detection, red cones + "!"
  when alerted (guard.js)
- Sweeping cameras with learnable rhythms (camera.js)
- Tools at a cost: 3 smoke pellets per gallery (Q or click to lob), and a
  1.8s lockpick channel that needs you to stay still (player.js)
- Sneak mode (Shift): slower, halves the detection rate
- Alarm meter that climbs while seen and drains while hidden; caught at 100%
- Score: loot value + time bonus vs par + stealth bonus
- Procedural WebAudio effects (audio.js) — no audio files
- HUD with alarm meter, loot, smoke, timer, score (hud.js)
- Screenshot staging via `?shot=cover|alarm|loot|win` (real renders of the
  game's own code, posed scenes)

## How to play
Serve `game/` with any static HTTP server and open `game/index.html` in
desktop Chrome. WASD/arrows move, Shift sneaks, E cracks the case, Q throws
smoke, R restarts the gallery.

## Play-test (headless Chromium via Playwright, 22 Nov 2026 ~21:45 WIB)
All checks passed, 0 JS errors (script: ~/workspace/make-fun/work/pw/heist-test.mjs):
- Start button -> status "playing"
- Hold D 1s -> player x 90 -> 255 (movement + wall collision work)
- Stand by the case, hold E 2.2s -> hasLoot true (lockpick channel works)
- Reach exit with loot -> status "clear" (level-clear + bonuses work)
- Alarm at 99, standing in a guard cone -> status "caught"
- 4 screenshots captured (1280x800 JPEG, ~45-48 KB each, under the 256 KiB
  cap): 01-cover (room, thief, guard cones, camera cone, diamond, alarm
  meter in one frame), 02-alarm (red cone + "!", alarm 68%), 03-loot
  (diamond secured, getaway door lit), 04-getaway (win banner)
- main.ts run twice with MAKEFUN_OUTPUT_DIR -> byte-identical /output
  (deterministic); dossier.json 292,096 bytes (< 1.5 MiB cap)

Fix after first play-test: the "hold E" hint at the display case never
showed (its condition required E already held and progress exactly 0);
now the case prompts "Hold E to crack the display case." on approach.
Loot screenshot staging moved off the crate it overlapped.
