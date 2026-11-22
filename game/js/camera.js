// A wall-mounted security camera: sweeps its cone back and forth across
// a fixed arc. It never moves, so its rhythm is learnable — wait for the
// sweep to pass, then cross.

import { dist, hasLineOfSight, inCone } from './geom.js';

export const CAMERA_RANGE = 175;
export const CAMERA_HALF_ANGLE = 0.42;
export const CAMERA_DETECT_RATE = 55;

export class SecurityCamera {
  constructor(spec) {
    this.x = spec.x;
    this.y = spec.y;
    this.baseAngle = spec.baseAngle;
    this.sweep = spec.sweep;
    this.speed = spec.speed;
    this.phase = Math.random() * Math.PI * 2;
    this.angle = spec.baseAngle;
    this.seesPlayer = false;
  }

  reset() {
    this.seesPlayer = false;
  }

  update(dt, t, player, walls, smoke, sneaking) {
    this.angle = this.baseAngle + Math.sin(t * this.speed + this.phase) * this.sweep;
    const hidden = smoke.some((s) => dist(player.x, player.y, s.x, s.y) < 58);
    const seen = !hidden &&
      inCone(this.x, this.y, this.angle, CAMERA_RANGE, CAMERA_HALF_ANGLE, player.x, player.y) &&
      hasLineOfSight(this.x, this.y, player.x, player.y, walls);
    this.seesPlayer = seen;
    return seen ? CAMERA_DETECT_RATE * (sneaking ? 0.5 : 1) : 0;
  }
}
