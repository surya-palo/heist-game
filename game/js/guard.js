// A patrolling guard: walks its waypoints, looks where it walks, and
// raises the alarm while the thief is inside its vision cone with a clear
// line of sight. When it sees the thief it stops and stares — the fair
// "caught moment" is the alarm meter climbing while you break away.

import { angleDiff, dist, hasLineOfSight, inCone } from './geom.js';

export const GUARD_RANGE = 155;
export const GUARD_HALF_ANGLE = 0.56;
export const GUARD_DETECT_RATE = 45; // alarm points per second while seen

export class Guard {
  constructor(spec) {
    this.waypoints = spec.waypoints;
    this.speed = spec.speed;
    this.x = spec.waypoints[0].x;
    this.y = spec.waypoints[0].y;
    this.target = 1;
    this.facing = 0;
    this.alert = false;
    this.seesPlayer = false;
    this.pause = 0;
  }

  reset() {
    this.x = this.waypoints[0].x;
    this.y = this.waypoints[0].y;
    this.target = 1;
    this.alert = false;
    this.seesPlayer = false;
    this.pause = 0;
  }

  update(dt, player, walls, smoke, sneaking) {
    // Can this guard see the thief right now?
    const hidden = smoke.some((s) => dist(player.x, player.y, s.x, s.y) < 58);
    const seen = !hidden &&
      inCone(this.x, this.y, this.facing, GUARD_RANGE, GUARD_HALF_ANGLE, player.x, player.y) &&
      hasLineOfSight(this.x, this.y, player.x, player.y, walls);
    this.seesPlayer = seen;
    this.alert = seen;

    if (seen) {
      // Stop and stare at the thief.
      this.facing = Math.atan2(player.y - this.y, player.x - this.x);
      return GUARD_DETECT_RATE * (sneaking ? 0.5 : 1);
    }

    // Patrol: walk to the current waypoint, pause, turn around.
    if (this.pause > 0) {
      this.pause -= dt;
      return 0;
    }
    const wp = this.waypoints[this.target];
    const d = dist(this.x, this.y, wp.x, wp.y);
    const step = this.speed * dt;
    const want = Math.atan2(wp.y - this.y, wp.x - this.x);
    // Turn smoothly toward the walking direction.
    let diff = want - this.facing;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.facing += diff * Math.min(1, dt * 8);
    if (d <= step) {
      this.x = wp.x;
      this.y = wp.y;
      this.target = (this.target + 1) % this.waypoints.length;
      this.pause = 0.7;
    } else {
      this.x += ((wp.x - this.x) / d) * step;
      this.y += ((wp.y - this.y) / d) * step;
    }
    return 0;
  }
}
