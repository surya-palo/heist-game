// All canvas drawing: the gallery floor, walls and cover, vision cones,
// the diamond, the getaway door, the thief and the smoke. Safe cover is
// warm wood and green, danger is yellow and red, loot glows gold —
// readable at a glance.

import { CAMERA_HALF_ANGLE, CAMERA_RANGE } from './camera.js';
import { GUARD_HALF_ANGLE, GUARD_RANGE } from './guard.js';

const LAMPS = [
  { x: 180, y: 140, r: 150 }, { x: 780, y: 140, r: 150 },
  { x: 480, y: 300, r: 170 }, { x: 180, y: 480, r: 150 }, { x: 780, y: 480, r: 150 },
];

function drawCone(ctx, x, y, facing, range, halfAngle, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawWall(ctx, w) {
  if (w.kind === 'wall') {
    ctx.fillStyle = '#2a3352';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#3a4670';
    ctx.fillRect(w.x, w.y, w.w, 3);
    return;
  }
  if (w.kind === 'plinth') {
    ctx.fillStyle = '#3d3a55';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#c9a94e';
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x + 3, w.y + 3, w.w - 6, w.h - 6);
    ctx.fillStyle = '#565072';
    ctx.fillRect(w.x + 8, w.y + 8, w.w - 16, w.h - 16);
    return;
  }
  if (w.kind === 'crate') {
    ctx.fillStyle = '#5a4632';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#7d6248';
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x + 2, w.y + 2, w.w - 4, w.h - 4);
    ctx.beginPath();
    ctx.moveTo(w.x, w.y);
    ctx.lineTo(w.x + w.w, w.y + w.h);
    ctx.moveTo(w.x + w.w, w.y);
    ctx.lineTo(w.x, w.y + w.h);
    ctx.stroke();
    return;
  }
  // plant
  ctx.fillStyle = '#2e4a2e';
  ctx.fillRect(w.x, w.y, w.w, w.h);
  ctx.fillStyle = '#3f6b3a';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(w.x + 10 + i * ((w.w - 20) / 4), w.y + w.h / 2, 9, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDiamond(ctx, x, y, t, taken) {
  // display case
  ctx.fillStyle = '#232c48';
  ctx.fillRect(x - 26, y - 18, 52, 36);
  ctx.strokeStyle = '#c9a94e';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 26, y - 18, 52, 36);
  if (taken) return;
  const pulse = 0.75 + 0.25 * Math.sin(t * 3);
  const glow = ctx.createRadialGradient(x, y - 6, 2, x, y - 6, 34);
  glow.addColorStop(0, `rgba(255, 220, 120, ${0.55 * pulse})`);
  glow.addColorStop(1, 'rgba(255, 220, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 34, y - 40, 68, 68);
  // the gem
  ctx.save();
  ctx.translate(x, y - 6);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#ffe27a';
  ctx.fillRect(-9, -9, 18, 18);
  ctx.fillStyle = '#fff6c9';
  ctx.fillRect(-9, -9, 9, 9);
  ctx.restore();
  ctx.fillStyle = '#ffe27a';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AURORA DIAMOND', x, y + 34);
}

function drawGuard(ctx, g, t) {
  drawCone(
    ctx, g.x, g.y, g.facing, GUARD_RANGE, GUARD_HALF_ANGLE,
    g.alert ? 'rgba(226, 59, 59, 0.30)' : 'rgba(245, 197, 66, 0.16)',
  );
  ctx.beginPath();
  ctx.arc(g.x, g.y, 12, 0, Math.PI * 2);
  ctx.fillStyle = g.alert ? '#a83232' : '#31405f';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = g.alert ? '#ff8a8a' : '#7d8db3';
  ctx.stroke();
  // facing tick
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  ctx.lineTo(g.x + Math.cos(g.facing) * 16, g.y + Math.sin(g.facing) * 16);
  ctx.strokeStyle = '#e8e4d8';
  ctx.stroke();
  if (g.alert) {
    ctx.fillStyle = '#ff5b5b';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', g.x, g.y - 20);
  }
}

function drawCamera(ctx, c) {
  drawCone(
    ctx, c.x, c.y, c.angle, CAMERA_RANGE, CAMERA_HALF_ANGLE,
    c.seesPlayer ? 'rgba(226, 59, 59, 0.30)' : 'rgba(255, 140, 60, 0.15)',
  );
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.angle);
  ctx.fillStyle = c.seesPlayer ? '#a83232' : '#4a4f63';
  ctx.fillRect(-4, -6, 18, 12);
  ctx.fillStyle = c.seesPlayer ? '#ff5b5b' : '#ff9a3c';
  ctx.beginPath();
  ctx.arc(15, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawScene(ctx, state, t) {
  const { level, player } = state;
  // floor
  ctx.fillStyle = '#10182c';
  ctx.fillRect(0, 0, 960, 600);
  ctx.strokeStyle = 'rgba(120, 140, 190, 0.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 960; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke();
  }
  for (let y = 0; y <= 600; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke();
  }
  // warm spotlight pools
  for (const lamp of LAMPS) {
    const g = ctx.createRadialGradient(lamp.x, lamp.y, 10, lamp.x, lamp.y, lamp.r);
    g.addColorStop(0, 'rgba(255, 214, 130, 0.10)');
    g.addColorStop(1, 'rgba(255, 214, 130, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(lamp.x - lamp.r, lamp.y - lamp.r, lamp.r * 2, lamp.r * 2);
  }

  // getaway door
  const e = level.exit;
  ctx.fillStyle = player.hasLoot ? '#1e5c34' : '#24382a';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = player.hasLoot ? '#4ade80' : '#5b7a63';
  ctx.lineWidth = 2;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = player.hasLoot ? '#7dff9e' : '#9fb8a6';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(e.label, e.x + e.w / 2, e.y + e.h + 14);

  drawDiamond(ctx, level.diamond.x, level.diamond.y, t, player.hasLoot);
  for (const w of level.walls) drawWall(ctx, w);
  for (const c of state.cameras) drawCamera(ctx, c);
  for (const g of state.guards) drawGuard(ctx, g, t);

  // smoke clouds
  for (const s of state.smoke) {
    const alpha = Math.min(0.55, s.t * 0.3);
    ctx.fillStyle = `rgba(180, 185, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(200, 204, 215, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(s.x - 18, s.y + 8, 26, 0, Math.PI * 2);
    ctx.arc(s.x + 20, s.y - 6, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  // the thief
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.beginPath();
  ctx.arc(0, 0, player.r, 0, Math.PI * 2);
  ctx.fillStyle = player.sneaking ? '#232c48' : '#1a1d29';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#f5c542';
  ctx.stroke();
  ctx.rotate(player.facing);
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(4, -6);
  ctx.lineTo(4, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  if (player.hasLoot) {
    ctx.fillStyle = '#ffe27a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💎', player.x, player.y - 20);
  }
  // lockpick progress ring
  if (player.picking) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, 20, -Math.PI / 2, -Math.PI / 2 + player.pickProgress * Math.PI * 2);
    ctx.strokeStyle = '#ffe27a';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // transient hint line
  if (state.message && state.messageT > 0) {
    ctx.fillStyle = 'rgba(10, 12, 22, 0.75)';
    ctx.fillRect(230, 556, 500, 30);
    ctx.fillStyle = '#ffe27a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, 480, 576);
  }

  // alarm vignette: the screen edges burn red as the alarm climbs
  if (state.alarm > 35) {
    const a = ((state.alarm - 35) / 65) * 0.35;
    const vg = ctx.createRadialGradient(480, 300, 220, 480, 300, 520);
    vg.addColorStop(0, 'rgba(226, 59, 59, 0)');
    vg.addColorStop(1, `rgba(226, 59, 59, ${a})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, 960, 600);
  }
}
