// Level layouts for The Gilded Vault. Each gallery is one room the thief
// crosses: walls and cover block movement and sight, guards patrol waypoints,
// cameras sweep fixed arcs, the diamond sits in a display case, and the
// getaway door is the way out. Coordinates are canvas pixels (960 x 600).

export const LEVELS = [
  {
    name: 'The Marble Hall',
    par: 90,
    lootValue: 50000,
    playerStart: { x: 90, y: 510 },
    exit: { x: 60, y: 30, w: 70, h: 26, label: 'GETAWAY' },
    diamond: { x: 830, y: 120 },
    walls: [
      // outer frame (thin, keeps the room readable)
      { x: 0, y: 0, w: 960, h: 12, kind: 'wall' },
      { x: 0, y: 588, w: 960, h: 12, kind: 'wall' },
      { x: 0, y: 0, w: 12, h: 600, kind: 'wall' },
      { x: 948, y: 0, w: 12, h: 600, kind: 'wall' },
      // central display blocks — the two routes run either side of them
      { x: 330, y: 210, w: 120, h: 60, kind: 'plinth' },
      { x: 520, y: 330, w: 120, h: 60, kind: 'plinth' },
      { x: 700, y: 210, w: 60, h: 60, kind: 'crate' },
      { x: 180, y: 330, w: 60, h: 60, kind: 'crate' },
      { x: 430, y: 470, w: 100, h: 44, kind: 'plant' },
    ],
    guards: [
      { waypoints: [{ x: 300, y: 130 }, { x: 620, y: 130 }], speed: 62 },
      { waypoints: [{ x: 700, y: 480 }, { x: 300, y: 480 }], speed: 70 },
    ],
    cameras: [
      { x: 480, y: 18, baseAngle: Math.PI / 2, sweep: 0.7, speed: 0.55 },
    ],
  },
  {
    name: 'The East Wing',
    par: 110,
    lootValue: 75000,
    playerStart: { x: 90, y: 300 },
    exit: { x: 60, y: 540, w: 70, h: 26, label: 'GETAWAY' },
    diamond: { x: 850, y: 300 },
    walls: [
      { x: 0, y: 0, w: 960, h: 12, kind: 'wall' },
      { x: 0, y: 588, w: 960, h: 12, kind: 'wall' },
      { x: 0, y: 0, w: 12, h: 600, kind: 'wall' },
      { x: 948, y: 0, w: 12, h: 600, kind: 'wall' },
      // a cross of display cases: north, middle and south lanes
      { x: 280, y: 120, w: 90, h: 90, kind: 'plinth' },
      { x: 280, y: 390, w: 90, h: 90, kind: 'plinth' },
      { x: 560, y: 120, w: 90, h: 90, kind: 'plinth' },
      { x: 560, y: 390, w: 90, h: 90, kind: 'plinth' },
      { x: 420, y: 265, w: 120, h: 70, kind: 'crate' },
      { x: 700, y: 500, w: 80, h: 50, kind: 'plant' },
    ],
    guards: [
      { waypoints: [{ x: 200, y: 90 }, { x: 760, y: 90 }], speed: 75 },
      { waypoints: [{ x: 760, y: 510 }, { x: 200, y: 510 }], speed: 75 },
      { waypoints: [{ x: 480, y: 180 }, { x: 480, y: 420 }], speed: 58 },
    ],
    cameras: [
      { x: 20, y: 18, baseAngle: Math.PI / 2, sweep: 0.8, speed: 0.7 },
      { x: 940, y: 582, baseAngle: -Math.PI / 2, sweep: 0.8, speed: 0.6 },
    ],
  },
  {
    name: 'The Vault Floor',
    par: 130,
    lootValue: 120000,
    playerStart: { x: 480, y: 540 },
    exit: { x: 830, y: 30, w: 70, h: 26, label: 'GETAWAY' },
    diamond: { x: 480, y: 110 },
    walls: [
      { x: 0, y: 0, w: 960, h: 12, kind: 'wall' },
      { x: 0, y: 588, w: 960, h: 12, kind: 'wall' },
      { x: 0, y: 0, w: 12, h: 600, kind: 'wall' },
      { x: 948, y: 0, w: 12, h: 600, kind: 'wall' },
      // vault antechamber: tight lanes, one guard ring around the diamond
      { x: 180, y: 180, w: 140, h: 50, kind: 'plinth' },
      { x: 640, y: 180, w: 140, h: 50, kind: 'plinth' },
      { x: 180, y: 380, w: 140, h: 50, kind: 'plinth' },
      { x: 640, y: 380, w: 140, h: 50, kind: 'plinth' },
      { x: 430, y: 270, w: 100, h: 60, kind: 'crate' },
      { x: 120, y: 300, w: 50, h: 50, kind: 'plant' },
      { x: 790, y: 300, w: 50, h: 50, kind: 'plant' },
    ],
    guards: [
      { waypoints: [{ x: 250, y: 120 }, { x: 710, y: 120 }], speed: 85 },
      { waypoints: [{ x: 710, y: 480 }, { x: 250, y: 480 }], speed: 85 },
      { waypoints: [{ x: 150, y: 300 }, { x: 360, y: 300 }], speed: 66 },
      { waypoints: [{ x: 810, y: 300 }, { x: 600, y: 300 }], speed: 66 },
    ],
    cameras: [
      { x: 480, y: 18, baseAngle: Math.PI / 2, sweep: 0.9, speed: 0.8 },
      { x: 20, y: 300, baseAngle: 0, sweep: 0.7, speed: 0.65 },
    ],
  },
];

export function getLevel(index) {
  return LEVELS[Math.min(index, LEVELS.length - 1)];
}
