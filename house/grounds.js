/* The grounds: a front lawn and a flagstone walk, the street, her trees, and the secret garden behind,
   walled in hedge, with roses, a fountain, a swing, and the path out to the glass sunroom. */
import * as THREE from 'three';
import { PAL, blk, piece, cyl, ball, cone, shape, run, collider, flowers, BLOOMS } from './kit.js';

const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const O = 'out';

/* low-poly trees: a trunk and a crown of soft lumps, sage or blossom */
export function tree(x, z, s = 1, kind = 'leaf') {
  cyl(O, x, 0, z, 14 * s, 20 * s, 260 * s, PAL.walnutLt, { seg: 7, collide: true });
  const cols = kind === 'blossom' ? ['#E7C3C1', '#EBC5C7', '#F1DEDB', '#D9A9A6'] : kind === 'olive' ? ['#8E9A6C', '#9AA383', '#7B8060'] : ['#6F7A50', '#7B8659', '#5E6846', '#8C9868'];
  for (let i = 0; i < 6; i++) {
    const a = rnd() * Math.PI * 2, r = (40 + rnd() * 60) * s;
    ball(O, x + Math.cos(a) * r, (280 + rnd() * 110) * s, z + Math.sin(a) * r, (80 + rnd() * 40) * s, cols[i % cols.length], { detail: 1 });
  }
  ball(O, x, 400 * s, z, 105 * s, cols[0], { detail: 1 });
}
export function bush(x, z, r = 50, c = PAL.leaf, flowers) {
  ball(O, x, r * .7, z, r, c, { detail: 1, sy: .8, collide: true });
  if (flowers) for (let i = 0; i < 7; i++) { const a = rnd() * Math.PI * 2, e = rnd() * .9 + .2; ball(O, x + Math.cos(a) * r * .8, r * (.5 + e * .6), z + Math.sin(a) * r * .8, r * .17, flowers[i % flowers.length], { detail: 0 }); }
}
function hedge(x0, x1, z0, z1, h = 170) {
  blk(O, x0, x1, 0, h, z0, z1, PAL.moss, { round: 18, jitter: .05 });
  collider(x0, x1, 0, h, z0, z1, O, { cam: false });
}
function lamp(x, z) {
  cyl(O, x, 0, z, 6, 8, 240, PAL.charcoal, { seg: 6, collide: true });
  blk(O, x - 16, x + 16, 240, 290, z - 16, z + 16, PAL.warm, { kind: 'glow', collide: false });
  cone(O, x, 290, z, 26, 26, PAL.charcoal, { seg: 4, ry: Math.PI / 4 });
}
const stone = (x, z, w, d) => blk(O, x - w / 2, x + w / 2, -2, 2, z - d / 2, z + d / 2, PAL.stone, { round: 1, collide: false, jitter: .06 });

export function buildGrounds() {
  /* the lawn, a little rumpled, and the street out front */
  const lawn = new THREE.CircleGeometry(14000, 48); lawn.rotateX(-Math.PI / 2); lawn.translate(0, -8, -400);
  shape(O, lawn, PAL.lawn, { jitter: 0 });
  for (let i = 0; i < 40; i++) { const g = new THREE.CircleGeometry(300 + rnd() * 700, 7); g.rotateX(-Math.PI / 2); g.translate((rnd() - .5) * 9000, -5 + i * .04, (rnd() - .5) * 8000 - 600); shape(O, g, rnd() > .5 ? '#86925F' : '#919C6B', { jitter: .02 }); }
  blk(O, -9000, 9000, -2, 0, 1760, 2160, '#5E5650', { collide: false, jitter: 0 });
  for (let x = -8800; x < 9000; x += 420) blk(O, x, x + 200, 0, 1, 1955, 1965, PAL.cream, { collide: false });
  blk(O, -9000, 9000, -2, 8, 1600, 1760, PAL.stone, { collide: false });
  blk(O, -9000, 9000, -2, 14, 1752, 1768, PAL.ivory, { collide: false });
  /* the front walk, in flagstones, and the drive to the carriage doors */
  for (let z = 120; z < 1600; z += 78) { const w = 150 + (z % 3) * 10; stone(-1050 + Math.sin(z) * 8, z + 30, w, 62); }
  blk(O, 420, 1180, -2, 1, 900, 1600, '#C9BCA4', { collide: false, jitter: 0 });
  for (let z = 940; z < 1600; z += 90) blk(O, 420, 1180, 1, 2, z, z + 4, '#B9AC94', { collide: false });
  /* the hedge line and flower beds along the front */
  for (const [a, b] of [[-1700, -1580], [-520, -40]]) {
    blk(O, a, b, 0, 70, 196, 260, PAL.moss, { round: 14 });
    for (let x = a + 30; x < b - 10; x += 60) ball(O, x, 74, 228, 13, ['#E7C3C1', PAL.rose, '#F1DEDB', PAL.ivory][(x / 60 | 0) % 4], { detail: 0 });
  }
  for (const [x, z] of [[-1700, 360], [-300, 340], [-2400, 900], [2000, 600], [2300, -800], [-2500, -900]]) tree(x, z, 1 + rnd() * .25, x < -1000 && z > 0 ? 'blossom' : 'leaf');
  tree(-2200, 1200, 1.15, 'blossom'); tree(2400, 1250, 1.1, 'olive'); tree(-3200, 300, 1.3); tree(3000, -200, 1.2, 'olive');
  for (const x of [-1240, -860]) { cyl(O, x, 0, 230, 30, 22, 46, PAL.ivory, { collide: true, seg: 14 }); ball(O, x, 62, 230, 26, PAL.leaf, { detail: 1, sy: .6 }); flowers(O, x, 50, 230, 54, 54, 34, BLOOMS.front, 34); }
  lamp(-1250, 1560); lamp(-850, 1560); lamp(300, 1560); lamp(1300, 1560);
  /* a mailbox by the walk, brass flag up */
  cyl(O, -1250, 0, 1500, 5, 5, 110, PAL.walnut, {}); blk(O, -1275, -1225, 110, 150, 1480, 1530, PAL.forest, { round: 8 }); blk(O, -1222, -1218, 120, 150, 1505, 1515, PAL.oxblood, { collide: false });
  /* the side porch path round to the garden gate */
  for (let z = 400; z > -2850; z -= 85) stone(-1850 - Math.sin(z / 300) * 30, z, 90, 60);
  for (let x = -1850; x < -1700; x += 80) stone(x, -2850, 70, 90);

  /* ---------- the secret garden ---------- */
  const g = ROOMS.garden;
  hedge(g.x0 - 60, g.x0, g.z0, -2950); hedge(g.x0 - 60, g.x0, -2750, -1500);
  hedge(g.x0 - 60, g.x1 + 60, g.z0 - 60, g.z0);
  hedge(g.x1, g.x1 + 60, g.z0, -1500);
  /* the gate: a brass arch with jasmine */
  const gx = g.x0 - 30;
  for (const z of [-2950, -2750]) cyl(O, gx, 0, z, 9, 9, 250, PAL.brass, { kind: 'metal', collide: true });
  const arch = new THREE.TorusGeometry(100, 6, 6, 20, Math.PI); arch.rotateY(Math.PI / 2); arch.translate(gx, 250, -2850); shape(O, arch, PAL.brass, { kind: 'metal' });
  for (let i = 0; i < 14; i++) { const a = i / 13 * Math.PI; ball(O, gx + (rnd() - .5) * 20, 250 + Math.sin(a) * 100, -2850 + Math.cos(a) * 100, 14, i % 3 ? PAL.leaf : PAL.white, { detail: 0 }); }
  /* paths: stepping stones from the library doors to the sunroom, and round the lawn to the rose arch */
  for (let z = -1560; z > -1880; z -= 70) stone(-1560 + Math.sin(z) * 10, z, 80, 54);
  for (let x = -1400; x < -150; x += 72) stone(x, -2000 - Math.sin(x / 260) * 120, 66, 66);
  for (let z = -2050; z > -2340; z -= 70) stone(-150, z, 70, 56);
  /* the fountain: a round stone basin, a tiered bowl, water */
  cyl(O, 500, 0, -2350, 190, 200, 60, PAL.stone, { seg: 16, collide: true });
  cyl(O, 500, 60, -2350, 170, 170, 4, '#9CC4C4', { seg: 16, kind: 'glass' });
  cyl(O, 500, 0, -2350, 26, 30, 200, PAL.stone, { seg: 10 });
  cyl(O, 500, 170, -2350, 90, 50, 30, PAL.stone, { seg: 14 });
  cyl(O, 500, 196, -2350, 82, 82, 4, '#BFDCDA', { seg: 14, kind: 'glass' });
  ball(O, 500, 230, -2350, 22, PAL.stone, { detail: 1 });
  /* rose beds and borders */
  for (let x = -1550; x < 1200; x += 150) { if (x > -300 && x < 0) continue; bush(x, -3020, 54, PAL.leaf, [PAL.rose, '#E7C3C1', PAL.ivory]); }
  for (const z of [-3040, -1760]) bush(-1560, z, 46, PAL.moss, [PAL.ivory, PAL.blush]);
  for (let z = -2950; z < -1600; z += 160) bush(1170, z, 52, PAL.leaf, [PAL.oxblood, PAL.rose, PAL.blush]);
  for (const [x, z] of [[200, -2000], [800, -2000], [200, -2700], [800, -2700]]) bush(x, z, 60, PAL.leaf, ['#E7C3C1', PAL.rose]);
  /* a big old tree with a swing, and a bench under it */
  tree(900, -2850, 1.45, 'leaf');
  for (const dx of [-60, 60]) cyl(O, 760 + dx, 120, -2700, 1.5, 1.5, 380, PAL.cream, { seg: 4 });
  blk(O, 680, 840, 116, 128, -2722, -2678, PAL.walnut, { collide: false });
  piece(O, -900, 0, -2880, 260, 46, 70, PAL.walnut, { round: 6, collide: true });
  piece(O, -900, 46, -2905, 260, 70, 12, PAL.walnut, { round: 4 });
  for (const dx of [-110, 110]) blk(O, -900 + dx - 8, -900 + dx + 8, 0, 46, -2905, -2860, PAL.charcoal, { collide: false });
  lamp(-300, -2600); lamp(1000, -1700); lamp(-1300, -2900);

  /* ---------- flowers, everywhere they'd really be ---------- */
  /* the front beds, in front of the low hedges, either side of the door */
  for (const [a, b] of [[-1690, -1130], [-970, -60]]) flowers(O, (a + b) / 2, 0, 300, b - a, 64, Math.round((b - a) / 5), BLOOMS.front, 40, true);
  /* borders down both sides of the front walk, roses one side and lavender-ish the other */
  for (const [x, cols] of [[-1180, BLOOMS.front], [-920, BLOOMS.cool]]) flowers(O, x, 0, 960, 46, 1240, 260, cols, 34, true);
  /* the side of the house, and the beds either side of the drive */
  flowers(O, -1760, 0, -700, 60, 1300, 220, BLOOMS.cool, 40, true);
  flowers(O, 1760, 0, -100, 60, 500, 90, BLOOMS.sun, 36, true);
  for (const x of [360, 1240]) flowers(O, x, 0, 1250, 90, 640, 120, BLOOMS.sun, 32, true);
  /* the secret garden: a ring round the fountain, beds along the paths, wildflowers in the lawn */
  for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; flowers(O, 500 + Math.cos(a) * 240, 0, -2350 + Math.sin(a) * 240, 40, 40, 4, BLOOMS.front, 30, true); }
  flowers(O, -500, 0, -1745, 1700, 80, 260, BLOOMS.front, 38, true);
  flowers(O, 200, 0, -3020, 2400, 70, 300, BLOOMS.wine, 34, true);
  for (const [x, z, cols] of [[150, -2650, BLOOMS.sun], [850, -2050, BLOOMS.cool], [-450, -2250, BLOOMS.front], [1000, -2600, BLOOMS.front], [-200, -2850, BLOOMS.cool]]) flowers(O, x, 0, z, 260, 200, 70, cols, 30, true);
  /* a wheelbarrow of marigolds by the sunroom */
  blk(O, -700, -600, 30, 80, -2760, -2700, PAL.terracotta, { round: 8 });
  for (let i = 0; i < 6; i++) ball(O, -680 + i * 14, 88, -2730 + (i % 2) * 14, 13, PAL.marigold, { detail: 0 });
}
