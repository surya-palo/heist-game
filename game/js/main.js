// The Gilded Vault — entry point. Owns the game state machine, the loop,
// input and the alarm. Guards and cameras report how fast the alarm climbs;
// this module drains it, catches the thief at 100, and scores the getaway.

import { getLevel, LEVELS } from './levels.js';
import { Player } from './player.js';
import { Guard } from './guard.js';
import { SecurityCamera } from './camera.js';
import { SoundBank } from './audio.js';
import { drawScene } from './render.js';
import { dist } from './geom.js';
import {
  hideBanner, hideTitle, setLevelName, showBanner, showTitle, updateHUD,
} from './hud.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const sounds = new SoundBank();
const keys = new Set();

const ALARM_DECAY = 8; // points per second while unseen
const ALARM_SPOTTED_AT = 60; // sting once when the meter crosses this

const state = {
  status: 'title', // title | playing | caught | clear | win
  levelIndex: 0,
  level: getLevel(0),
  player: new Player(90, 510),
  guards: [],
  cameras: [],
  smoke: [],
  alarm: 0,
  maxAlarm: 0,
  score: 0,
  time: 0,
  levelTime: 0,
  message: '',
  messageT: 0,
  spottedSting: false,
  staged: false, // ?shot= freezes the alarm so screenshots hold still
};

function loadLevel(index) {
  state.levelIndex = index;
  state.level = getLevel(index);
  state.player.reset(state.level.playerStart.x, state.level.playerStart.y);
  state.guards = state.level.guards.map((g) => new Guard(g));
  state.cameras = state.level.cameras.map((c) => new SecurityCamera(c));
  state.smoke = [];
  state.alarm = 0;
  state.maxAlarm = 0;
  state.levelTime = 0;
  state.spottedSting = false;
  state.message = '';
  setLevelName(`${index + 1}. ${state.level.name}`);
}

function say(text, seconds = 2.5) {
  state.message = text;
  state.messageT = seconds;
}

function throwSmoke(x, y) {
  if (state.player.smokeLeft <= 0) {
    say('No smoke pellets left!');
    return;
  }
  state.player.smokeLeft -= 1;
  state.smoke.push({ x, y, t: 4 });
  sounds.smoke();
  say('Smoke out — move!');
}

function startGame() {
  sounds.ensure();
  state.score = 0;
  state.time = 0;
  loadLevel(0);
  state.status = 'playing';
  hideTitle();
  hideBanner();
  say('Reach the diamond case — hold E to crack it.');
}

function nextLevel() {
  if (state.levelIndex + 1 >= LEVELS.length) {
    finishRun();
    return;
  }
  loadLevel(state.levelIndex + 1);
  state.status = 'playing';
  hideBanner();
  say(`${state.level.name} — tighter patrols.`);
}

function finishRun() {
  state.status = 'win';
  sounds.win();
  showBanner(
    'CLEAN GETAWAY!',
    `All three galleries cleared. Final score: ${state.score.toLocaleString('en-US')}. ` +
      'The Aurora Diamond and its friends are yours — the museum never saw a thing.',
    'Play again',
    startGame,
  );
}

function catchPlayer() {
  state.status = 'caught';
  sounds.caught();
  showBanner(
    'CAUGHT!',
    'The alarm hit 100% and security swarmed the gallery. Watch the cones, ' +
      'sneak past the sweeps, and use smoke when a guard turns your way.',
    'Retry gallery',
    () => {
      loadLevel(state.levelIndex);
      state.status = 'playing';
      hideBanner();
    },
  );
}

function clearLevel() {
  const timeBonus = Math.max(0, Math.round(state.level.par - state.levelTime)) * 200;
  const stealthBonus = Math.round(100 - state.maxAlarm) * 25;
  state.score += timeBonus + stealthBonus;
  sounds.levelClear();
  state.status = 'clear';
  const last = state.levelIndex + 1 >= LEVELS.length;
  showBanner(
    last ? 'VAULT EMPTIED!' : 'GALLERY CLEARED!',
    `Diamond secured. Time bonus +${timeBonus.toLocaleString('en-US')}, ` +
      `stealth bonus +${stealthBonus.toLocaleString('en-US')}. ` +
      `Score: ${state.score.toLocaleString('en-US')}.`,
    last ? 'See the getaway' : 'Next gallery',
    nextLevel,
  );
}

function update(dt) {
  if (state.status !== 'playing') return;
  state.time += dt;
  state.levelTime += dt;
  if (state.messageT > 0) state.messageT -= dt;

  // --- movement ---
  let dx = 0;
  let dy = 0;
  if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
  if (keys.has('arrowright') || keys.has('d')) dx += 1;
  if (keys.has('arrowup') || keys.has('w')) dy -= 1;
  if (keys.has('arrowdown') || keys.has('s')) dy += 1;
  state.player.sneaking = keys.has('shift');
  state.player.move(dx, dy, dt, state.level.walls);

  // --- smoke ---
  for (const s of state.smoke) s.t -= dt;
  state.smoke = state.smoke.filter((s) => s.t > 0);

  // --- lockpick ---
  const d = state.level.diamond;
  const nearCase = dist(state.player.x, state.player.y, d.x, d.y) < 46;
  const result = state.player.workPick(nearCase, keys.has('e'), dt);
  if (result === 'cracked') {
    state.score += state.level.lootValue;
    sounds.crack();
    sounds.pickup();
    say(`Case cracked! Diamond secured — reach the ${state.level.exit.label} door.`, 3.5);
  } else if (nearCase && !state.player.hasLoot) {
    // Prompt the player at the case: the old condition only fired while E
    // was already held and progress was exactly 0, so the hint never showed.
    if (keys.has('e')) {
      say('Cracking the case — hold E, stay still…');
    } else if (state.player.pickProgress === 0) {
      say('Hold E to crack the display case.');
    }
  }

  // --- exit ---
  const ex = state.level.exit;
  const atExit = state.player.x > ex.x && state.player.x < ex.x + ex.w &&
    state.player.y > ex.y - 8 && state.player.y < ex.y + ex.h + 8;
  if (atExit) {
    if (state.player.hasLoot) {
      clearLevel();
      return;
    }
    if (keys.has('e')) say('The door is open — but the diamond is still in its case!');
  }

  // --- detection: guards and cameras feed the alarm ---
  let rise = 0;
  for (const g of state.guards) {
    rise += g.update(dt, state.player, state.level.walls, state.smoke, state.player.sneaking);
  }
  for (const c of state.cameras) {
    rise += c.update(dt, state.time, state.player, state.level.walls, state.smoke, state.player.sneaking);
  }
  if (!state.staged) {
    if (rise > 0) {
      state.alarm = Math.min(100, state.alarm + rise * dt);
      if (state.alarm >= ALARM_SPOTTED_AT && !state.spottedSting) {
        state.spottedSting = true;
        sounds.spotted();
        say('SPOTTED! Break line of sight — now!');
      }
    } else {
      state.alarm = Math.max(0, state.alarm - ALARM_DECAY * dt);
      if (state.alarm < ALARM_SPOTTED_AT - 10) state.spottedSting = false;
    }
    state.maxAlarm = Math.max(state.maxAlarm, state.alarm);
    if (state.alarm >= 100) {
      catchPlayer();
      return;
    }
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  drawScene(ctx, state, now / 1000);
  updateHUD(state);
  requestAnimationFrame(loop);
}

// --- input ---
window.addEventListener('keydown', (ev) => {
  const k = ev.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) ev.preventDefault();
  keys.add(k);
  if (k === 'q' && state.status === 'playing') {
    throwSmoke(state.player.x, state.player.y);
  }
  if (k === 'r' && (state.status === 'playing' || state.status === 'caught')) {
    loadLevel(state.levelIndex);
    state.status = 'playing';
    hideBanner();
  }
  if (k === 'enter' && state.status === 'title') startGame();
});
window.addEventListener('keyup', (ev) => keys.delete(ev.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());

// Mouse: click near the thief to lob a smoke pellet there.
canvas.addEventListener('click', (ev) => {
  if (state.status !== 'playing') return;
  const rect = canvas.getBoundingClientRect();
  const x = ((ev.clientX - rect.left) / rect.width) * 960;
  const y = ((ev.clientY - rect.top) / rect.height) * 600;
  if (dist(x, y, state.player.x, state.player.y) <= 240) throwSmoke(x, y);
});

document.getElementById('start-btn').addEventListener('click', startGame);

// --- screenshot staging (?shot=cover|alarm|loot|win) ---
// Real renders of the game's own code, with the scene posed so one frame
// shows the room, the thief, the cones, the cameras, the loot and the alarm.
function applyShotStaging() {
  const shot = new URLSearchParams(window.location.search).get('shot');
  if (!shot) return;
  state.staged = true;
  hideTitle();
  hideBanner();
  loadLevel(0);
  state.status = 'playing';
  if (shot === 'cover') {
    state.player.x = 480;
    state.player.y = 400;
    state.alarm = 18;
    state.time = 14;
    state.levelTime = 14;
    say('The Marble Hall — stay out of the cones.');
  } else if (shot === 'alarm') {
    state.player.x = 400;
    state.player.y = 130;
    state.alarm = 68;
    state.time = 2;
    say('SPOTTED! Break line of sight — now!');
  } else if (shot === 'loot') {
    state.player.hasLoot = true;
    state.player.x = 640;
    state.player.y = 300;
    state.score = 50000;
    state.alarm = 30;
    state.time = 48;
    state.levelTime = 48;
    say('Diamond secured — reach the GETAWAY door.');
  } else if (shot === 'win') {
    state.score = 245000;
    state.status = 'win';
    showBanner(
      'CLEAN GETAWAY!',
      'All three galleries cleared. Final score: 245,000. ' +
        'The Aurora Diamond and its friends are yours — the museum never saw a thing.',
      'Play again',
      startGame,
    );
  }
}

loadLevel(0);
applyShotStaging();
if (state.status === 'title') showTitle();
requestAnimationFrame(loop);

// Exposed for automated play-tests.
window.__heist = { state, startGame, loadLevel };
