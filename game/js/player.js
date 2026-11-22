// The thief: movement, sneaking, smoke pellets and the lockpick channel.
// Movement is axis-separated so the player slides along walls instead of
// sticking to them.

import { circleHitsRect } from './geom.js';

export const WALK_SPEED = 165;
export const SNEAK_SPEED = 95;
export const PLAYER_RADIUS = 11;
export const PICK_SECONDS = 1.8;
export const SMOKE_PER_LEVEL = 3;

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = PLAYER_RADIUS;
    this.facing = -Math.PI / 2;
    this.sneaking = false;
    this.moving = false;
    this.hasLoot = false;
    this.smokeLeft = SMOKE_PER_LEVEL;
    this.pickProgress = 0;
    this.picking = false;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.hasLoot = false;
    this.smokeLeft = SMOKE_PER_LEVEL;
    this.pickProgress = 0;
    this.picking = false;
    this.facing = -Math.PI / 2;
  }

  // dx, dy are a unit-ish direction; walls block the move.
  move(dx, dy, dt, walls) {
    this.moving = dx !== 0 || dy !== 0;
    if (!this.moving) return;
    const speed = this.sneaking ? SNEAK_SPEED : WALK_SPEED;
    const len = Math.hypot(dx, dy) || 1;
    const vx = (dx / len) * speed * dt;
    const vy = (dy / len) * speed * dt;
    this.facing = Math.atan2(vy, vx);
    const nx = this.x + vx;
    if (!walls.some((w) => circleHitsRect(nx, this.y, this.r, w))) this.x = nx;
    const ny = this.y + vy;
    if (!walls.some((w) => circleHitsRect(this.x, ny, this.r, w))) this.y = ny;
    this.x = Math.max(14, Math.min(946, this.x));
    this.y = Math.max(14, Math.min(586, this.y));
  }

  // Holding E near the case cracks it; progress decays when you let go.
  workPick(nearCase, holding, dt) {
    if (nearCase && holding && !this.hasLoot) {
      this.picking = true;
      this.pickProgress += dt / PICK_SECONDS;
      if (this.pickProgress >= 1) {
        this.pickProgress = 1;
        this.hasLoot = true;
        this.picking = false;
        return 'cracked';
      }
    } else {
      this.picking = false;
      this.pickProgress = Math.max(0, this.pickProgress - dt / 0.6);
    }
    return null;
  }
}
