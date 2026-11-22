// Small geometry helpers shared by guards, cameras and the player:
// angles, cone tests and line-of-sight against rectangular obstacles.

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// Smallest absolute difference between two angles, in radians.
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

// Is point (px,py) inside the cone from (ox,oy) facing `facing`,
// with range and half-angle? Cone test only — line of sight is separate.
export function inCone(ox, oy, facing, range, halfAngle, px, py) {
  const d = dist(ox, oy, px, py);
  if (d > range) return false;
  const toTarget = Math.atan2(py - oy, px - ox);
  return angleDiff(toTarget, facing) <= halfAngle;
}

function segmentHitsSegment(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d1 = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
  const d2 = (x2 - x1) * (y4 - y1) - (y2 - y1) * (x4 - x1);
  const d3 = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
  const d4 = (x4 - x3) * (y2 - y3) - (y4 - y3) * (x2 - x3);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  if (pointInRect(x1, y1, r) || pointInRect(x2, y2, r)) return true;
  const corners = [
    [r.x, r.y, r.x + r.w, r.y],
    [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
    [r.x + r.w, r.y + r.h, r.x, r.y + r.h],
    [r.x, r.y + r.h, r.x, r.y],
  ];
  return corners.some(([ax, ay, bx, by]) =>
    segmentHitsSegment(x1, y1, x2, y2, ax, ay, bx, by));
}

// True when nothing in `walls` blocks the straight line from (x1,y1) to (x2,y2).
export function hasLineOfSight(x1, y1, x2, y2, walls) {
  return !walls.some((w) => segmentHitsRect(x1, y1, x2, y2, w));
}

// Circle-vs-rectangle overlap, used for movement collision.
export function circleHitsRect(cx, cy, radius, r) {
  const nx = clamp(cx, r.x, r.x + r.w);
  const ny = clamp(cy, r.y, r.y + r.h);
  return dist(cx, cy, nx, ny) < radius;
}
