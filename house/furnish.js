/* The furniture, room by room, and the 22 stops: each one an object you can walk up to,
   not a poster. Furniture faces +z in its own frame; ry turns it. */
import * as THREE from 'three';
import { PAL, blk, piece, cyl, ball, cone, shape, run, collider, flowers, vase, BLOOMS } from './kit.js';

const rnd = (() => { let s = 23; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const pick = a => a[(rnd() * a.length) | 0];
const L = lv => 'L' + lv;
const Y = lv => lv * LH;
const BOOKS = [PAL.oxblood, PAL.forest, PAL.walnut, PAL.olive, PAL.rose, PAL.cream, PAL.indigo, PAL.wine, PAL.plum, PAL.brass, PAL.sage, PAL.ivory];
const GLOW = '#FFE6BC';
/* a local frame: (lx, lz) in the furniture's own coordinates to world x, z */
const F = (x, z, ry) => (lx, lz) => [x + lx * Math.cos(ry) + lz * Math.sin(ry), z - lx * Math.sin(ry) + lz * Math.cos(ry)];
const lighten = (c, k = .18) => '#' + new THREE.Color(c).lerp(new THREE.Color('#FFFFFF'), k).getHexString();
const darken = (c, k = .25) => '#' + new THREE.Color(c).lerp(new THREE.Color('#000000'), k).getHexString();

/* ---------- the furniture kit ---------- */
function sofa(l, y, x, z, ry, c, w = 260) {
  const f = F(x, z, ry), at = (lx, lz) => f(lx, lz);
  piece_(l, ...xz(at(0, 4)), y + 12, w, 32, 84, c, { ry, round: 8, collide: true });
  piece_(l, ...xz(at(0, 12)), y + 44, w - 46, 14, 66, lighten(c, .12), { ry, round: 6 });
  piece_(l, ...xz(at(0, -32)), y + 12, w, 84, 22, c, { ry, round: 8, collide: true });
  for (const s of [-1, 1]) piece_(l, ...xz(at(s * (w / 2 - 12), 4)), y + 12, 24, 56, 86, c, { ry, round: 9 });
  for (const s of [-1, 1]) piece_(l, ...xz(at(s * (w / 2 - 50), -14)), y + 52, 44, 40, 14, s < 0 ? PAL.brass : PAL.ivory, { ry: ry + s * .15, round: 6 });
}
function armchair(l, y, x, z, ry, c) { sofa(l, y, x, z, ry, c, 110); }
function chair(l, y, x, z, ry, c = PAL.walnut, seat = PAL.cream) {
  const f = F(x, z, ry);
  piece_(l, ...xz(f(0, 0)), y + 42, 52, 10, 50, seat, { ry, round: 4, collide: true });
  piece_(l, ...xz(f(0, -23)), y + 52, 50, 58, 6, c, { ry, round: 3 });
  for (const [a, b] of [[-22, -20], [22, -20], [-22, 20], [22, 20]]) piece_(l, ...xz(f(a, b)), y, 5, 42, 5, c, { ry });
}
function table(l, y, x, z, w, d, h, c = PAL.walnut, top) {
  blk(l, x - w / 2, x + w / 2, y + h - 7, y + h, z - d / 2, z + d / 2, top || c, { round: 2 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) blk(l, x + sx * (w / 2 - 12) - 3.5, x + sx * (w / 2 - 12) + 3.5, y, y + h - 7, z + sz * (d / 2 - 12) - 3.5, z + sz * (d / 2 - 12) + 3.5, c, { collide: false });
}
function roundTable(l, y, x, z, r, h, c = PAL.walnut, top) {
  cyl(l, x, y + h - 6, z, r, r, 6, top || c, { seg: 18 });
  collider(x - r * .8, x + r * .8, y + h - 6, y + h, z - r * .8, z + r * .8, l, { cam: false });
  cyl(l, x, y, z, 5, 7, h - 6, c, { seg: 8 });
  cyl(l, x, y, z, r * .45, r * .5, 4, c, { seg: 12 });
}
function bed(l, y, x, z, ry, w, len, cover, head = PAL.walnut) {
  const f = F(x, z, ry);
  piece_(l, ...xz(f(0, 0)), y + 8, w, 30, len, PAL.walnut, { ry, round: 4, collide: true });
  piece_(l, ...xz(f(0, 0)), y + 38, w - 10, 22, len - 10, PAL.white, { ry, round: 8 });
  piece_(l, ...xz(f(0, len * .17)), y + 58, w - 4, 8, len * .64, cover, { ry, round: 4 });
  for (const s of [-1, 1]) piece_(l, ...xz(f(s * w / 4.4, -len / 2 + 30)), y + 58, w / 2.6, 16, 38, PAL.ivory, { ry, round: 7 });
  piece_(l, ...xz(f(0, -len / 2 - 6)), y, w + 12, 150, 14, head, { ry, round: 6, collide: true });
}
function shelf(l, y, x, z, ry, w, h, d, o = {}) {
  const f = F(x, z, ry), c = o.c || PAL.walnut;
  piece_(l, ...xz(f(0, -d / 2 + 3)), y, w, h, 6, o.back || darken(c, .1), { ry });
  for (const s of [-1, 1]) piece_(l, ...xz(f(s * (w / 2 - 4), 0)), y, 8, h, d, c, { ry });
  piece_(l, ...xz(f(0, 0)), y + h - 8, w, 8, d, c, { ry });
  const rows = o.rows || Math.max(2, Math.floor(h / 78));
  for (let k = 0; k < rows; k++) {
    const sy = y + k * (h - 8) / rows;
    piece_(l, ...xz(f(0, 0)), sy, w - 8, 6, d, c, { ry });
    if (o.fill === false) continue;
    let lx = -w / 2 + 12;
    const rowH = (h - 8) / rows - 14;
    while (lx < w / 2 - 20) {
      const bw = 7 + rnd() * 9;
      if (rnd() > .9) { lx += 18; continue; }
      if (o.objs && rnd() > .82) { ball(l, ...xyz(f(lx + 10, 0), sy + 18), 11, pick([PAL.brass, PAL.ivory, PAL.rose, PAL.sage]), { detail: 1 }); lx += 26; continue; }
      const bh = Math.min(rowH, 40 + rnd() * 26);
      piece_(l, ...xz(f(lx + bw / 2, 2)), sy + 6, bw - 1, bh, d * .72, pick(o.palette || BOOKS), { ry, jitter: .08 });
      lx += bw;
    }
  }
  const [ax, az] = f(0, 0), q = Math.abs(Math.sin(ry)) > .7, hw = (q ? d : w) / 2, hd = (q ? w : d) / 2;
  collider(ax - hw, ax + hw, y, y + h, az - hd, az + hd, l, { cam: false });
}
/* something flat hung on a wall. face as in the plan: S looks south, so it hangs on a north wall at z = line */
function onWall(l, face, line, along, cy, w, h, depth = 6) {
  const o = 12;
  if (face === 'S') return { x0: along - w / 2, x1: along + w / 2, y0: cy - h / 2, y1: cy + h / 2, z0: line + o, z1: line + o + depth, n: [0, 1] };
  if (face === 'N') return { x0: along - w / 2, x1: along + w / 2, y0: cy - h / 2, y1: cy + h / 2, z0: line - o - depth, z1: line - o, n: [0, -1] };
  if (face === 'E') return { x0: line + o, x1: line + o + depth, y0: cy - h / 2, y1: cy + h / 2, z0: along - w / 2, z1: along + w / 2, n: [1, 0] };
  return { x0: line - o - depth, x1: line - o, y0: cy - h / 2, y1: cy + h / 2, z0: along - w / 2, z1: along + w / 2, n: [-1, 0] };
}
function frame(l, face, line, along, cy, w, h, fc = PAL.brass, inner = PAL.cream, paint) {
  const b = onWall(l, face, line, along, cy, w, h, 6);
  blk(l, b.x0, b.x1, b.y0, b.y1, b.z0, b.z1, fc, { collide: false, kind: fc === PAL.brass ? 'metal' : 'solid' });
  const i = inset(b, 9, 2);
  blk(l, i.x0, i.x1, i.y0, i.y1, i.z0, i.z1, inner, { collide: false });
  if (paint) paint(i);
  return b;
}
/* a box shrunk inside another by m on the wall plane, pushed out by p toward the room */
function inset(b, m, p) {
  const r = { ...b, y0: b.y0 + m, y1: b.y1 - m };
  if (b.n[0]) { r.z0 += m; r.z1 -= m; if (b.n[0] > 0) { r.x0 = b.x1; r.x1 = b.x1 + p; } else { r.x1 = b.x0; r.x0 = b.x0 - p; } }
  else { r.x0 += m; r.x1 -= m; if (b.n[1] > 0) { r.z0 = b.z1; r.z1 = b.z1 + p; } else { r.z1 = b.z0; r.z0 = b.z0 - p; } }
  return r;
}
/* dabs of colour on a flat thing: u, v in 0..1 across it */
function dab(l, i, u, v, w, h, c, p = 1.5) {
  const along = !i.n[0], A0 = along ? i.x0 : i.z0, A1 = along ? i.x1 : i.z1, a = A0 + (A1 - A0) * u, y = i.y0 + (i.y1 - i.y0) * v;
  const lo = i.n[0] > 0 || i.n[1] > 0 ? (along ? i.z1 : i.x1) : (along ? i.z0 - p : i.x0 - p), hi = lo + p;
  along ? blk(l, a - w / 2, a + w / 2, y - h / 2, y + h / 2, lo, hi, c, { collide: false }) : blk(l, lo, hi, y - h / 2, y + h / 2, a - w / 2, a + w / 2, c, { collide: false });
}
function rug(l, y, x, z, w, d, c, border = PAL.cream, motif) {
  blk(l, x - w / 2, x + w / 2, y, y + 2, z - d / 2, z + d / 2, border, { collide: false, jitter: 0 });
  blk(l, x - w / 2 + 18, x + w / 2 - 18, y + 2, y + 3, z - d / 2 + 18, z + d / 2 - 18, c, { collide: false, jitter: 0 });
  if (motif) blk(l, x - w / 5, x + w / 5, y + 3, y + 4, z - d / 6, z + d / 6, motif, { collide: false, jitter: 0 });
}
function plant(l, y, x, z, s = 1, pot = PAL.terracotta, kind) {
  cyl(l, x, y, z, 22 * s, 16 * s, 38 * s, pot, { seg: 10, collide: true });
  if (kind === 'tall') { collider(x - 44 * s, x + 44 * s, y, y + 210 * s, z - 44 * s, z + 44 * s, l, { cam: false }); cyl(l, x, y + 38 * s, z, 3, 4, 90 * s, PAL.walnutLt, { seg: 5 }); for (let i = 0; i < 5; i++) ball(l, x + (rnd() - .5) * 50 * s, y + (120 + rnd() * 60) * s, z + (rnd() - .5) * 50 * s, (28 + rnd() * 10) * s, pick([PAL.leaf, PAL.moss, PAL.sage]), { detail: 1 }); return; }
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; ball(l, x + Math.cos(a) * 14 * s, y + (52 + rnd() * 20) * s, z + Math.sin(a) * 14 * s, (18 + rnd() * 8) * s, pick([PAL.leaf, PAL.moss, '#8E9A6C']), { detail: 1, sy: 1.3 }); }
}
function floorLamp(l, y, x, z) {
  cyl(l, x, y, z, 16, 18, 4, PAL.brass, { kind: 'metal' });
  cyl(l, x, y, z, 2.5, 2.5, 150, PAL.brass, { kind: 'metal' });
  collider(x - 26, x + 26, y, y + 182, z - 26, z + 26, l, { cam: false });
  cyl(l, x, y + 146, z, 16, 26, 34, GLOW, { kind: 'glow', seg: 12 });
}
function tableLamp(l, y, x, z) {
  ball(l, x, y + 14, z, 13, PAL.cream, { detail: 1 });
  cyl(l, x, y + 26, z, 2, 2, 16, PAL.brass, { kind: 'metal' });
  cyl(l, x, y + 40, z, 12, 18, 22, GLOW, { kind: 'glow', seg: 10 });
}
/* a proper chandelier: a brass stem from a ceiling rose, two tiers of arms, real candles with warm flames, crystal drops */
const FLAME = '#FFC46B';
function chandelier(l, x, z, ceil, r = 80) {
  const drop = 60 + r * .7, cy = ceil - drop;
  cyl(l, x, ceil - 8, z, r * .22, r * .16, 8, PAL.brass, { kind: 'metal', seg: 12 });
  cyl(l, x, cy, z, 2.2, 2.2, drop, PAL.brass, { kind: 'metal', seg: 6 });
  ball(l, x, cy, z, r * .15, PAL.brass, { kind: 'metal', detail: 's' });
  for (const [tr, ty, n] of [[r, 0, 10], [r * .58, r * .34, 6]]) {
    const ring = new THREE.TorusGeometry(tr, 2.6, 6, 32); ring.rotateX(Math.PI / 2); ring.translate(x, cy + ty, z); shape(l, ring, PAL.brass, { kind: 'metal' });
    for (let k = 0; k < n; k++) {
      const a = (k + (ty ? .5 : 0)) / n * Math.PI * 2, cx = x + Math.cos(a) * tr, cz = z + Math.sin(a) * tr;
      piece(l, x + Math.cos(a) * tr / 2, cy + ty - 1.5, z + Math.sin(a) * tr / 2, tr, 3, 3, PAL.brass, { ry: -a, kind: 'metal' });
      cyl(l, cx, cy + ty, cz, 6, 4, 3, PAL.brass, { kind: 'metal', seg: 8 });
      cyl(l, cx, cy + ty + 3, cz, 3.2, 3.2, 18, PAL.ivory, { seg: 6 });
      cone(l, cx, cy + ty + 21, cz, 2.6, 8, FLAME, { kind: 'glow', seg: 5 });
      const da = a + Math.PI / n;
      ball(l, x + Math.cos(da) * tr, cy + ty - 10, z + Math.sin(da) * tr, 3.4, '#F3EEE6', { kind: 'glass', detail: 0 });
      ball(l, x + Math.cos(da) * tr, cy + ty - 20, z + Math.sin(da) * tr, 4.4, '#F3EEE6', { kind: 'glass', detail: 0 });
    }
  }
  ball(l, x, cy - r * .3, z, r * .08, '#F3EEE6', { kind: 'glass', detail: 0, sy: 1.6 });
}
function giftBox(l, x, y, z, s, c, ribbon) {
  blk(l, x - s / 2, x + s / 2, y, y + s * .8, z - s / 2, z + s / 2, c, { collide: false });
  blk(l, x - 3, x + 3, y, y + s * .8 + 1, z - s / 2 - 1, z + s / 2 + 1, ribbon, { collide: false });
  blk(l, x - s / 2 - 1, x + s / 2 + 1, y, y + s * .8 + 1, z - 3, z + 3, ribbon, { collide: false });
  ball(l, x, y + s * .8 + 5, z, 6, ribbon, { detail: 0, sy: .6 });
}
function heartShape(l, x, y, z, s, c, ry = 0, kind = 'solid') {
  const sh = new THREE.Shape();
  sh.moveTo(0, -1); sh.bezierCurveTo(-.3, -.6, -1.05, -.25, -1.05, .32); sh.bezierCurveTo(-1.05, .85, -.35, 1.05, 0, .55);
  sh.bezierCurveTo(.35, 1.05, 1.05, .85, 1.05, .32); sh.bezierCurveTo(1.05, -.25, .3, -.6, 0, -1);
  const g = new THREE.ExtrudeGeometry(sh, { depth: .35, bevelEnabled: true, bevelSize: .12, bevelThickness: .12, bevelSegments: 2, curveSegments: 8 });
  g.translate(0, 0, -.17); g.scale(s, s, s); g.rotateY(ry); g.translate(x, y, z);
  shape(l, g, c, { kind });
}
const xz = p => p;          // readability: a pair already in x, z order
const xyz = (p, y) => [p[0], y, p[1]];

/* piece() takes (layer, x, y, z, ...). The kit calls above pass [x, z] pairs, so adapt them here */
function piece_(l, x, z, y, w, h, d, c, o) { return piece(l, x, y, z, w, h, d, c, o); }

/* ---------- the rooms ---------- */
export function furnish() {
  const META = {};
  const P = (l, xzPair, y, w, h, d, c, o) => piece_(l, xzPair[0], xzPair[1], y, w, h, d, c, o);
  void P;

  /* ===== the living room: her people at the front of the house ===== */
  {
    const l = 'L0', y = 0;
    rug(l, y, -1060, -400, 620, 440, PAL.wine, PAL.cream, PAL.blush);
    /* stop: both/and, the conversation: two sofas facing each other over a low table */
    sofa(l, y, -1250, -400, Math.PI / 2, PAL.cream);
    sofa(l, y, -870, -400, -Math.PI / 2, PAL.forest);
    table(l, y, -1060, -400, 170, 100, 42, PAL.walnut);
    giftBox(l, -1090, 42, -420, 26, PAL.ivory, PAL.brass);
    vase(l, -1030, 42, -390, 1.1, BLOOMS.front);
    META.both = { top: 140, at: [-1060, -110] };
    /* stop: would you two click? a round tufted ottoman with a game on it */
    cyl(l, -1430, y, -230, 52, 48, 42, PAL.blush, { seg: 16, collide: true });
    cyl(l, -1430, 42, -230, 30, 30, 3, PAL.cream, { seg: 4, ry: Math.PI / 4 });
    for (let i = 0; i < 4; i++) ball(l, -1440 + (i % 2) * 18, 50, -240 + (i >> 1) * 18, 5, i % 2 ? PAL.wine : PAL.forest, { detail: 0 });
    META.match = { top: 90, at: [-1430, -40] };
    /* stop: small circle, deep roots: the built-ins on the west wall, photographs among the books */
    for (const z of [-620, -400, -180]) shelf(l, y, -1664, z, Math.PI / 2, 210, 400, 44, { c: PAL.ivory, back: PAL.wine, objs: true });
    for (const [z, h] of [[-660, 150], [-450, 200], [-230, 160]]) frame(l, 'E', -1700, z, h + 30, 50, 60, PAL.brass, pick([PAL.shell, PAL.sage, PAL.cream]));
    META.circle = { top: 410 };
    /* stop: speak her language, the dining table set for six, gifts waiting */
    rug(l, y, -120, -330, 420, 300, PAL.forest, PAL.cream);
    table(l, y, -120, -330, 280, 130, 76, PAL.walnut);
    for (const dx of [-90, 0, 90]) { chair(l, y, -120 + dx, -420, 0, PAL.walnut, PAL.wine); chair(l, y, -120 + dx, -240, Math.PI, PAL.walnut, PAL.wine); }
    giftBox(l, -180, 76, -340, 34, PAL.wine, PAL.brassLt); giftBox(l, -130, 76, -310, 24, PAL.cream, PAL.wine); giftBox(l, -70, 76, -345, 28, PAL.sage, PAL.ivory);
    cyl(l, -30, 76, -320, 7, 5, 26, PAL.ivory, {}); ball(l, -30, 108, -320, 14, PAL.rose, { detail: 1 });
    chandelier(l, -120, -330, 440, 95);
    chandelier(l, -1060, -400, 440, 115);
    vase(l, -120, 76, -330, 1.5, BLOOMS.wine);
    META.gift = { top: 210 };
    /* the hearth on the north wall, a mirror above it */
    blk(l, -1060, -820, 0, 150, -812, -772, PAL.stone, { faces: { py: PAL.walnut } });
    blk(l, -1000, -880, 0, 96, -790, -770, PAL.charcoal, { collide: false });
    blk(l, -980, -900, 6, 40, -791, -775, '#FFB867', { kind: 'glow', collide: false });
    blk(l, -1076, -804, 150, 162, -816, -762, PAL.walnut, { collide: false });
    frame(l, 'S', -800, -940, 270, 150, 130, PAL.brass, '#DDE4E2');
    for (const x of [-1040, -840]) { cyl(l, x, 162, -790, 4, 4, 22, PAL.ivory, {}); cone(l, x, 184, -790, 3, 9, FLAME, { kind: 'glow', seg: 5 }); }
    blk('out', -1130, -970, 0, 3, 14, 84, '#C9A36B', { collide: false, jitter: 0 });
    blk(l, -1250, -1150, 0, 6, -96, -40, PAL.walnut, { collide: false });
    for (const [x, c] of [[-1236, PAL.ivory], [-1206, PAL.wine], [-1176, PAL.charcoal]]) for (const dx of [0, 13]) blk(l, x + dx, x + dx + 11, 6, 16, -88, -52, c, { round: 4, collide: false });
    META.door = { at: [-1050, 620], top: 430 };
    plant(l, y, -1640, -60, 1.2, PAL.ivory, 'tall'); plant(l, y, 230, -60, 1.1, PAL.terracotta, 'tall'); plant(l, y, -500, -760, 1, PAL.ivory);
    floorLamp(l, y, -1290, -620); floorLamp(l, y, -830, -180);
    /* window seats in the two front bays */
    for (const b of BAYS.filter(b => b.room === 'living')) { blk(l, b.x0 + 14, b.x1 - 14, 0, 46, b.z1 - 70, b.z1 - 14, PAL.walnut); blk(l, b.x0 + 16, b.x1 - 16, 46, 60, b.z1 - 68, b.z1 - 16, PAL.sage, { round: 5 }); for (const dx of [-80, 80]) piece(l, (b.x0 + b.x1) / 2 + dx, 60, b.z1 - 48, 40, 34, 12, dx < 0 ? PAL.blush : PAL.cream, { round: 5 }); }
    frame(l, 'S', -800, -440, 220, 180, 120, PAL.walnut, PAL.cream, i => { dab(l, i, .3, .5, 40, 60, PAL.sage); dab(l, i, .6, .4, 60, 30, PAL.rose); dab(l, i, .7, .7, 20, 20, PAL.brass); });
  }

  /* ===== the library: curiosity ===== */
  {
    const l = 'L0', y = 0;
    rug(l, y, -1235, -1200, 440, 360, PAL.oxblood, PAL.cream, PAL.brass);
    /* stop: ten lenses, none of them is her: ten report binders on the west wall, each a different test */
    shelf(l, y, -1664, -1300, Math.PI / 2, 380, 400, 44, { c: PAL.walnut, back: PAL.walnutDk, rows: 5 });
    const tens = [PAL.indigo, PAL.oxblood, PAL.forest, PAL.ochre, PAL.plum, PAL.olive, PAL.rose, PAL.walnutLt, PAL.sage, PAL.wine];
    tens.forEach((c, i) => blk(l, -1676, -1650, 168, 226, -1460 + i * 32, -1434 + i * 32, c, { collide: false }));
    tens.forEach((c, i) => blk(l, -1650, -1649, 200, 214, -1456 + i * 32, -1438 + i * 32, PAL.ivory, { collide: false }));
    META.receipts = { top: 410 };
    /* stop: pick her brain, plate VII, under a glass cloche on a stone column */
    cyl(l, -1235, y, -1167, 36, 42, 92, PAL.stone, { seg: 10, collide: true });
    cyl(l, -1235, 92, -1167, 44, 44, 6, PAL.walnut, { seg: 14 });
    for (const [dx, dy, dz, r] of [[-10, 18, 0, 20], [10, 20, 2, 19], [0, 30, -6, 17], [-14, 10, -8, 13], [14, 10, -8, 12], [0, 8, 10, 15]]) ball(l, -1235 + dx, 98 + dy, -1167 + dz, r, PAL.clay, { detail: 1, jitter: .08 });
    ball(l, -1235, 128, -1167, 44, '#F3EEE6', { kind: 'glass', detail: 's', sy: 1.25 });
    META.brain = { top: 190 };
    vase(l, -1100, 40, -1640, 1, BLOOMS.cool);
    chandelier(l, -1235, -1060, 440, 85);
    /* shelves on the north wall either side of the bay, and on the east wall */
    shelf(l, y, -1010, -1468, 0, 100, 420, 44, { rows: 5 });
    shelf(l, y, -984, -1400, -Math.PI / 2, 170, 420, 44, { rows: 5 });
    armchair(l, y, -1340, -1390, Math.PI, PAL.oxblood); armchair(l, y, -1130, -1390, Math.PI, PAL.olive);
    floorLamp(l, y, -1235, -1440);
    blk(l, -1440, -1060, 0, 40, -1660, -1600, PAL.walnut); blk(l, -1436, -1064, 40, 54, -1656, -1604, PAL.forest, { round: 5 });
    /* a library ladder leaning on the east shelves, a globe */
    piece(l, -1010, 0, -1300, 40, 380, 8, PAL.walnutLt, { rx: -.2 });
    cyl(l, -1060, 0, -900, 26, 30, 70, PAL.walnut, { seg: 8 }); ball(l, -1060, 104, -900, 32, '#B9C8B0', { detail: 1 });
  }

  /* ===== the coffee bar: next to the books ===== */
  {
    const l = 'L0', y = 0;
    /* stop: the mood meter, the espresso machine on the counter by the door */
    blk(l, -940, -620, 0, 92, -812, -752, PAL.forest, { faces: { py: PAL.ivory } });
    blk(l, -944, -616, 92, 98, -814, -748, PAL.ivory);
    blk(l, -900, -810, 98, 168, -800, -766, PAL.brass, { kind: 'metal', round: 6 });
    blk(l, -896, -814, 168, 176, -796, -770, PAL.charcoal, { collide: false });
    for (const x of [-880, -830]) { cyl(l, x, 106, -760, 4, 4, 24, PAL.charcoal, { rx: Math.PI / 2 }); }
    cyl(l, -855, 98, -775, 10, 8, 14, PAL.ivory, {}); cyl(l, -790, 98, -778, 10, 8, 14, PAL.wine, {});
    for (const [x, c] of [[-720, PAL.walnut], [-680, PAL.ochre], [-650, PAL.ivory]]) cyl(l, x, 98, -790, 14, 14, 30, c, {});
    META.mood = { top: 230 };
    for (const [x, z] of [[-760, -1150], [-560, -1000]]) vase(l, x, 76, z, .6, BLOOMS.front);
    /* a menu board, a pastry case, two little tables */
    frame(l, 'W', -400, -1380, 260, 200, 140, PAL.walnut, PAL.charcoal, i => { for (let k = 0; k < 5; k++) dab(l, i, .5, .2 + k * .15, 120 - k * 10, 4, PAL.cream); });
    blk(l, -940, -760, 0, 92, -1488, -1428, PAL.walnut, { faces: { py: PAL.ivory } });
    blk(l, -930, -770, 92, 130, -1484, -1432, PAL.glass, { kind: 'glass' });
    for (let k = 0; k < 6; k++) ball(l, -910 + k * 26, 104, -1458, 10, pick([PAL.ochre, PAL.rose, PAL.cream, PAL.walnutLt]), { detail: 0, sy: .6 });
    for (const [x, z] of [[-760, -1150], [-560, -1000]]) { roundTable(l, y, x, z, 40, 76, PAL.charcoal, PAL.ivory); chair(l, y, x - 62, z, Math.PI / 2, PAL.charcoal, PAL.blush); chair(l, y, x + 62, z, -Math.PI / 2, PAL.charcoal, PAL.blush); cyl(l, x, 76, z, 6, 5, 10, PAL.ivory, {}); }
    chandelier(l, -700, -1080, 440, 80);
    plant(l, y, -460, -860, 1, PAL.ivory); plant(l, y, -900, -1300, .9);
    for (const b of BAYS.filter(b => b.room === 'cafe')) { blk(l, b.x0 + 14, b.x1 - 14, 0, 46, b.z0 + 14, b.z0 + 70, PAL.walnut); blk(l, b.x0 + 16, b.x1 - 16, 46, 60, b.z0 + 16, b.z0 + 68, PAL.blush, { round: 5 }); }
  }

  /* ===== the half bath, the stair hall ===== */
  {
    const l = 'L0';
    cyl(l, -340, 0, -1030, 12, 16, 80, PAL.ivory, { collide: true }); cyl(l, -340, 80, -1030, 30, 22, 14, PAL.ivory, { seg: 14 });
    frame(l, 'S', -1060, -340, 170, 70, 90, PAL.brass, '#DDE4E2');
    blk(l, -190, -130, 0, 44, -1048, -980, PAL.ivory, { round: 10 }); blk(l, -186, -134, 44, 100, -1048, -1030, PAL.ivory, { round: 6 });
    plant(l, 0, -380, -830, .7);
    rug(l, 0, 60, -1180, 460, 460, PAL.forest, PAL.cream, PAL.brass);
    blk(l, -388, -348, 0, 84, -1460, -1300, PAL.walnut, { faces: { py: PAL.ivory } });
    cyl(l, -368, 84, -1380, 12, 9, 36, PAL.ivory, {}); for (let k = 0; k < 4; k++) ball(l, -368 + (k - 1.5) * 8, 130, -1380 + (k % 2) * 8, 10, k % 2 ? PAL.blush : PAL.ivory, { detail: 0 });
    frame(l, 'E', -400, -1380, 240, 140, 180, PAL.walnut, PAL.sage, i => { dab(l, i, .5, .5, 60, 90, PAL.cream); });
    plant(l, 0, 250, -860, 1.1, PAL.ivory, 'tall');
  }

  /* ===== the kitchen: care ===== */
  {
    const l = 'L0', y = 0;
    /* stop: what her people know, the fridge, covered in photographs and notes */
    blk(l, 1144, 1282, 0, 232, -1038, -956, PAL.sage, { round: 10 });
    blk(l, 1144, 1282, 150, 153, -957, -955, darken(PAL.sage, .15), { collide: false });
    for (const yy of [190, 110]) blk(l, 1160, 1166, yy - 30, yy + 10, -956, -948, PAL.brass, { collide: false, kind: 'metal' });
    for (let k = 0; k < 9; k++) blk(l, 1178 + (k % 3) * 30, 1202 + (k % 3) * 30, 90 + (k / 3 | 0) * 40, 118 + (k / 3 | 0) * 40, -956, -955, pick([PAL.cream, PAL.blush, PAL.ivory, PAL.shell, '#D8E0D0']), { collide: false });
    META.heart = { top: 300 };
    /* counters along the north wall, a range with a hood, open shelves */
    blk(l, 312, 1130, 0, 90, -1038, -976, PAL.cream, { faces: { py: PAL.ivory } });
    blk(l, 312, 1130, 90, 96, -1040, -972, PAL.ivory);
    blk(l, 700, 820, 96, 104, -1030, -982, PAL.charcoal, { collide: false });
    blk(l, 690, 830, 280, 360, -1038, -980, PAL.brass, { kind: 'metal', collide: false });
    for (const x of [420, 940]) blk(l, x - 100, x + 100, 250, 256, -1038, -1004, PAL.walnut, { collide: false });
    for (let k = 0; k < 6; k++) cyl(l, 340 + k * 34 + (k > 2 ? 520 : 0), 256, -1022, 10, 10, 26 + (k % 2) * 10, pick([PAL.ivory, PAL.sage, PAL.rose, PAL.walnutLt]), {});
    /* the island, marble-topped, with three stools */
    blk(l, 600, 1000, 0, 92, -680, -540, PAL.forest, { faces: { py: PAL.white } });
    blk(l, 594, 1006, 92, 98, -686, -534, PAL.white);
    for (const x of [680, 800, 920]) { cyl(l, x, 0, -480, 3, 3, 70, PAL.brass, { kind: 'metal' }); cyl(l, x, 70, -480, 20, 20, 8, PAL.walnut, { seg: 12, collide: true }); }
    vase(l, 900, 98, -610, 1.3, BLOOMS.sun);
    ball(l, 740, 112, -610, 26, PAL.ivory, { detail: 1, sy: .5 }); for (let k = 0; k < 5; k++) ball(l, 730 + k * 6, 120, -615 + (k % 2) * 8, 8, k % 2 ? PAL.marigold : '#9AA34A', { detail: 0 });
    chandelier(l, 800, -610, 440, 100);
    /* stop: ask her personality, the breakfast table in the bay window, a deck of cards on it */
    roundTable(l, y, 1370, -650, 62, 76, PAL.walnut, PAL.ivory);
    blk(l, 1420, 1448, 0, 46, -860, -440, PAL.walnut); blk(l, 1418, 1448, 46, 58, -858, -442, PAL.sage, { round: 5 });
    chair(l, y, 1280, -650, Math.PI / 2, PAL.walnut, PAL.blush);
    blk(l, 1352, 1388, 76, 84, -664, -640, PAL.wine, { collide: false }); blk(l, 1340, 1370, 76, 80, -630, -612, PAL.ivory, { collide: false });
    META.ask = { top: 170 };
    plant(l, y, 360, -200, 1, PAL.ivory, 'tall');
    rug(l, y, 800, -400, 300, 160, PAL.rose, PAL.cream);
  }

  /* ===== the movie room: far from the books ===== */
  {
    const l = 'L0', y = 0;
    /* stop: ick or green flag? the rom-com shelf on the north wall */
    shelf(l, y, 900, -1468, 0, 340, 170, 40, { c: PAL.walnut, back: PAL.plum, rows: 2, palette: [PAL.rose, PAL.blush, PAL.wine, PAL.ivory, PAL.clay, PAL.shell, PAL.oxblood] });
    META.icks = { top: 250, at: [1150, -1330] };
    blk(l, 1272, 1288, 110, 330, -1440, -1110, PAL.charcoal, { collide: false });
    blk(l, 1270, 1272, 120, 320, -1430, -1120, '#4A3C46', { kind: 'glow', collide: false });
    sofa(l, y, 680, -1250, Math.PI / 2, PAL.cream, 200);
    table(l, y, 860, -1250, 80, 120, 40, PAL.walnut);
    cyl(l, 860, 40, -1280, 14, 10, 28, PAL.wine, {}); for (let k = 0; k < 6; k++) ball(l, 854 + (k % 3) * 6, 70, -1284 + (k >> 1) * 4, 6, PAL.ivory, { detail: 0 });
    rug(l, y, 860, -1250, 420, 300, PAL.plum, PAL.blush);
    for (const z of [-1110]) floorLamp(l, y, 620, z);
    frame(l, 'S', -1500, 500, 260, 120, 170, PAL.brass, PAL.wine, i => { dab(l, i, .5, .6, 60, 60, PAL.blush); dab(l, i, .5, .25, 70, 10, PAL.cream); });
  }

  /* ===== laundry, mudroom, pantry, garage ===== */
  {
    const l = 'L0';
    for (const x of [360, 470]) { blk(l, x - 50, x + 50, 0, 96, -138, -50, PAL.ivory, { round: 6 }); cyl(l, x, 50, -49, 30, 30, 3, '#C5D3D6', { rx: Math.PI / 2, kind: 'glass' }); }
    blk(l, 580, 790, 0, 90, -138, -80, PAL.walnut, { faces: { py: PAL.cream } });
    cyl(l, 640, 90, -110, 24, 20, 30, PAL.cream, { seg: 10 });
    blk(l, 1140, 1288, 0, 46, -138, -90, PAL.walnut); blk(l, 1142, 1286, 46, 56, -136, -92, PAL.olive, { round: 4 });
    for (const [z, c] of [[1170, PAL.wine], [1220, PAL.cream], [1260, PAL.olive]]) blk(l, z - 18, z + 18, 120, 230, -140, -126, c, { collide: false, round: 6 });
    blk(l, 1150, 1180, 0, 40, -80, -50, PAL.walnutDk, { collide: false }); blk(l, 1190, 1220, 0, 40, -80, -50, PAL.walnutDk, { collide: false });
    cyl(l, 1260, 0, 170, 16, 16, 60, PAL.brass, { kind: 'metal' });
    rug(l, 0, 1050, 40, 220, 140, PAL.olive, PAL.cream);
    for (let k = 0; k < 4; k++) { blk(l, 1640, 1688, 60 + k * 90, 66 + k * 90, -330, 130, PAL.walnut); for (let j = 0; j < 9; j++) cyl(l, 1664, 66 + k * 90, -310 + j * 50, 12, 12, 30, pick([PAL.ivory, PAL.ochre, PAL.terracotta, PAL.sage, PAL.walnutLt]), {}); }
    collider(1640, 1688, 0, 400, -330, 130, l, { cam: false });
    for (let k = 0; k < 3; k++) { blk(l, 1320, 1600, 60 + k * 90, 66 + k * 90, -338, -296, PAL.walnut); for (let j = 0; j < 6; j++) blk(l, 1340 + j * 44, 1372 + j * 44, 66 + k * 90, 96 + k * 90, -334, -306, pick([PAL.cream, PAL.walnutLt, PAL.ochre]), { round: 4, collide: false }); }
    collider(1320, 1600, 0, 330, -338, -296, l, { cam: false });
    /* the garage: her car, olive with a cream roof, a bicycle, a workbench */
    car(l, 560, 560, PAL.olive, PAL.cream);
    car(l, 1040, 560, PAL.wine, PAL.ivory);
    blk(l, 1200, 1288, 0, 90, 230, 420, PAL.walnut, { faces: { py: PAL.walnutLt } });
    for (let k = 0; k < 4; k++) blk(l, 1284, 1288, 140 + (k % 2) * 30, 200 + (k % 2) * 30, 250 + k * 40, 260 + k * 40, PAL.charcoal, { collide: false });
    bicycle(l, 350, 330);
    blk('L0:S', 500, 1100, 0, 300, 900, 908, PAL.walnut, { collide: false }); blk('L0:S', 798, 802, 0, 300, 908, 910, PAL.walnutDk, { collide: false });
    for (const x of [560, 680, 920, 1040]) blk('L0:S', x - 40, x + 40, 160, 260, 908, 910, PAL.glass, { kind: 'glass', collide: false });
  }

  /* ===== the sunroom: making things, with friends ===== */
  {
    const l = 'L0', y = 0;
    /* stop: why her site looks like this, the paint table under the glass */
    table(l, y, -1320, -2585, 320, 90, 80, PAL.walnut, PAL.cream);
    [PAL.wine, PAL.rose, PAL.blush, PAL.brass, PAL.forest, PAL.sage, PAL.cream].forEach((c, i) => { cyl(l, -1450 + i * 40, 80, -2595, 13, 13, 22, PAL.white, {}); cyl(l, -1450 + i * 40, 102, -2595, 11, 11, 2, c, {}); });
    piece(l, -1200, 80, -2575, 90, 4, 60, PAL.white, { ry: .2 }); for (let k = 0; k < 5; k++) ball(l, -1220 + k * 10, 86, -2575, 5, [PAL.wine, PAL.rose, PAL.brass, PAL.sage, PAL.blush][k], { detail: 0, sy: .3 });
    META.palette = { top: 200 };
    /* an easel with a painting under way, a round worktable for friends */
    for (const dx of [-30, 30]) piece(l, -1000 + dx, 0, -2400, 6, 220, 6, PAL.walnutLt, { rz: dx > 0 ? -.12 : .12 });
    piece(l, -1000, 90, -2396, 120, 100, 6, PAL.white, {});
    for (const [u, v, c] of [[-20, 120, PAL.rose], [20, 150, PAL.sage], [0, 110, PAL.brass]]) ball(l, -1000 + u, v, -2391, 14, c, { detail: 0, sz: .2 });
    roundTable(l, y, -1050, -2150, 80, 74, PAL.walnut, PAL.ivory);
    vase(l, -1050, 74, -2150, 1.3, BLOOMS.sun, PAL.terracotta);
    for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2; chair(l, y, -1050 + Math.cos(a) * 120, -2150 + Math.sin(a) * 120, -a - Math.PI / 2, PAL.ochre, PAL.cream); }
    for (const [x, z] of [[-1600, -2620], [-800, -2620], [-1600, -1950], [-800, -1950]]) plant(l, y, x, z, 1.3, PAL.terracotta, 'tall');
    rug(l, y, -1100, -2280, 520, 420, PAL.sage, PAL.cream, PAL.blush);
    chandelier(l, -1050, -2150, 410, 80);
  }

  /* ===== the secret garden ===== */
  {
    const l = 'out';
    /* stop: open her heart, a low bed of garden roses at the end of the stepping stones */
    cyl(l, -150, 0, -2400, 120, 124, 16, PAL.stone, { seg: 16, collide: true });
    cyl(l, -150, 16, -2400, 110, 110, 2, '#6E5A44', { seg: 16 });
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, r = k % 2 ? 72 : 40; ball(l, -150 + Math.cos(a) * r, 50, -2400 + Math.sin(a) * r, 30, k % 2 ? PAL.leaf : PAL.moss, { detail: 1, sy: .8 }); }
    for (let k = 0; k < 16; k++) { const a = rnd() * Math.PI * 2, r = 20 + rnd() * 70; ball(l, -150 + Math.cos(a) * r, 66 + rnd() * 16, -2400 + Math.sin(a) * r, 8, pick([PAL.rose, PAL.blush, PAL.oxblood, PAL.shell]), { detail: 0 }); }
    META.beat = { top: 110, at: [-150, -2080] };
  }

  /* ===== upstairs: the guest room, two beds for her people ===== */
  {
    const l = 'L1', y = Y(1);
    for (const x of [-1420, -760]) { bed(l, y, x, -660, 0, 170, 230, x < -1000 ? PAL.sage : PAL.blush); blk(l, x + 100, x + 150, y, y + 58, -790, -740, PAL.walnut); tableLamp(l, y + 58, x + 125, -765); }
    rug(l, y, -1090, -420, 700, 300, PAL.olive, PAL.cream, PAL.blush);
    chandelier(l, -1090, -420, y + H, 90);
    blk(l, -1688, -1640, y, y + 100, -380, -180, PAL.walnut, { faces: { py: PAL.walnutLt } });
    vase(l, -1664, y + 100, -230, .9, BLOOMS.front);
    frame(l, 'E', -1700, -280, y + 200, 120, 100, PAL.brass, '#DDE4E2');
    for (const b of BAYS.filter(b => b.room === 'guest')) { blk(l, b.x0 + 14, b.x1 - 14, y, y + 46, b.z1 - 70, b.z1 - 14, PAL.walnut); blk(l, b.x0 + 16, b.x1 - 16, y + 46, y + 60, b.z1 - 68, b.z1 - 16, PAL.cream, { round: 5 }); }
    plant(l, y, -460, -60, 1, PAL.ivory, 'tall');
  }

  /* ===== the study: ambition ===== */
  {
    const l = 'L1', y = Y(1);
    rug(l, y, -1230, -1200, 460, 420, PAL.forest, PAL.cream, PAL.brass);
    chandelier(l, -1230, -1150, y + H, 85);
    /* stop: she built this, the desk with the screen she built it on */
    table(l, y, -1180, -1330, 260, 96, 76, PAL.walnut);
    blk(l, -1250, -1110, y + 76, y + 82, -1366, -1340, PAL.charcoal, { collide: false });
    blk(l, -1240, -1120, y + 98, y + 180, -1362, -1356, PAL.charcoal, { collide: false });
    blk(l, -1234, -1126, y + 104, y + 174, -1356, -1355, '#E9E2D2', { kind: 'glow', collide: false });
    cyl(l, -1180, y + 76, -1360, 4, 4, 24, PAL.charcoal, {});
    blk(l, -1220, -1150, y + 76, y + 80, -1318, -1294, PAL.ivory, { collide: false });
    tableLamp(l, y + 76, -1080, -1350); cyl(l, -1280, y + 76, -1330, 8, 7, 18, PAL.wine, {});
    chair(l, y, -1180, -1240, Math.PI, PAL.walnut, PAL.oxblood);
    vase(l, -1290, y + 76, -1350, .7, BLOOMS.cool);
    META.built = { top: Y(1) + 250 };
    /* stop: where she'd thrive, the world map on the east wall */
    frame(l, 'W', -950, -1350, y + 260, 260, 190, PAL.walnut, '#DCE3DE', i => { for (const [u, v, w, h] of [[.22, .62, 50, 40], [.28, .32, 30, 50], [.5, .66, 40, 36], [.52, .35, 30, 60], [.75, .6, 70, 40], [.82, .3, 30, 24]]) dab(l, i, u, v, w, h, PAL.sage); dab(l, i, .52, .62, 10, 10, PAL.wine, 2.5); });
    META.thrive = { top: Y(1) + 380 };
    /* stop: absolutely not, the linen pinboard on the west wall */
    frame(l, 'E', -1700, -1300, y + 260, 300, 230, PAL.walnut, PAL.linen, i => { for (let k = 0; k < 9; k++) dab(l, i, .15 + (k % 3) * .35, .2 + (k / 3 | 0) * .3, 50, 36, pick([PAL.ivory, PAL.blush, PAL.cream, PAL.shell]), 2); for (let k = 0; k < 9; k++) dab(l, i, .15 + (k % 3) * .35, .29 + (k / 3 | 0) * .3, 6, 6, PAL.oxblood, 3); });
    META.rip = { top: Y(1) + 400 };
    /* stop: born to lead, built to protect: the gallery wall on the south side */
    frame(l, 'N', -800, -1300, y + 280, 100, 130, PAL.brass, PAL.wine);
    frame(l, 'N', -800, -1180, y + 300, 110, 90, PAL.brass, PAL.forest);
    frame(l, 'N', -800, -1060, y + 270, 90, 120, PAL.brass, PAL.cream, i => dab(l, i, .5, .5, 40, 50, PAL.rose));
    frame(l, 'N', -800, -1180, y + 210, 80, 50, PAL.brass, PAL.ochre);
    META.spirit = { top: Y(1) + 380 };
    /* stop: values, in order, a stitched sampler on the north wall */
    frame(l, 'S', -1500, -1585, y + 262, 150, 200, PAL.walnut, PAL.ivory, i => { for (let k = 0; k < 7; k++) dab(l, i, .5, .85 - k * .11, 90 - k * 6, 6, [PAL.wine, PAL.rose, PAL.forest, PAL.olive, PAL.brass, PAL.plum, PAL.sage][k], 1.5); });
    META.values = { top: Y(1) + 400 };
    shelf(l, y, -1010, -1468, 0, 100, 400, 44, { rows: 5 });
    armchair(l, y, -1350, -1080, 0, PAL.olive);
    floorLamp(l, y, -1450, -1140);
    for (const b of BAYS.filter(b => b.room === 'study')) { blk(l, b.x0 + 14, b.x1 - 14, y, y + 46, b.z0 + 14, b.z0 + 70, PAL.walnut); blk(l, b.x0 + 16, b.x1 - 16, y + 46, y + 60, b.z0 + 16, b.z0 + 68, PAL.olive, { round: 5 }); }
  }

  /* ===== the back hall, the guest bath, the landing, the upstairs hall ===== */
  {
    const l = 'L1', y = Y(1);
    rug(l, y, -675, -950, 480, 140, PAL.wine, PAL.cream);
    frame(l, 'S', -1100, -560, y + 230, 90, 120, PAL.brass, PAL.sage);
    blk(l, -940, -700, y, y + 70, -1488, -1380, PAL.ivory, { round: 22 }); blk(l, -930, -710, y + 50, y + 66, -1478, -1390, '#CFE0E0', { collide: false });
    for (const [dx, dz] of [[-930, -1480], [-710, -1480], [-930, -1388], [-710, -1388]]) ball(l, dx, y + 6, dz, 8, PAL.brass, { kind: 'metal', detail: 0 });
    blk(l, -540, -412, y, y + 86, -1300, -1160, PAL.forest, { faces: { py: PAL.white } }); frame(l, 'W', -400, -1230, y + 200, 100, 110, PAL.brass, '#DDE4E2');
    for (const [z, c] of [[-1440, PAL.blush], [-1410, PAL.cream]]) blk(l, -560, -520, y + 80, y + 140, z - 12, z + 12, c, { collide: false });
    rug(l, y, -100, -950, 300, 180, PAL.forest, PAL.cream);
    chandelier(l, -100, -900, y + H, 70);
    blk(l, -388, -340, y, y + 46, -1450, -1250, PAL.walnut); blk(l, -386, -342, y + 46, y + 58, -1448, -1252, PAL.blush, { round: 4 });
    plant(l, y, 240, -1440, 1, PAL.ivory, 'tall');
    rug(l, y, -50, -400, 160, 600, PAL.oxblood, PAL.cream);
    blk(l, -388, -320, y, y + 220, -760, -620, PAL.ivory, { round: 3 });
    for (let k = 0; k < 4; k++) blk(l, -384, -324, y + 30 + k * 46, y + 60 + k * 46, -754, -626, pick([PAL.cream, PAL.blush, PAL.white, PAL.sage]), { collide: false, round: 6 });
    frame(l, 'W', 300, -500, y + 230, 120, 160, PAL.walnut, PAL.cream, i => { dab(l, i, .5, .5, 50, 80, PAL.olive); });
  }

  /* ===== her closet: her happy place, two storeys of it ===== */
  {
    const l = 'L1', y = Y(1);
    /* stop: in one word each, the long mirror on the south wall */
    blk(l, 960, 1140, y, y + 380, -326, -312, PAL.brass, { kind: 'metal' });
    blk(l, 972, 1128, y + 12, y + 368, -327, -326, '#EEF2F1', { kind: 'glow', collide: false });
    META.words = { top: Y(1) + 420 };
    /* hanging rails down the west wall, a rainbow of her palette */
    for (const z0 of [-1460, -1000]) {
      cyl(l, 350, y + 200, z0 + 200, 2, 2, 400, PAL.brass, { rx: Math.PI / 2, kind: 'metal' });
      for (let k = 0; k < 18; k++) { const c = pick([PAL.wine, PAL.cream, PAL.blush, PAL.ivory, PAL.olive, PAL.plum, PAL.walnut, PAL.charcoal, PAL.rose, PAL.shell]); blk(l, 326, 374, y + 60 + rnd() * 40, y + 196, z0 + 14 + k * 21, z0 + 30 + k * 21, c, { collide: false, round: 3 }); }
      collider(320, 380, y, y + 200, z0, z0 + 400, l, { cam: false });
      cyl(l, 350, y + 340, z0 + 200, 2, 2, 400, PAL.brass, { rx: Math.PI / 2, kind: 'metal' });
      for (let k = 0; k < 18; k++) blk(l, 330, 370, y + 250 + rnd() * 30, y + 336, z0 + 14 + k * 21, z0 + 30 + k * 21, pick([PAL.cream, PAL.wine, PAL.ivory, PAL.blush, PAL.sage]), { collide: false, round: 3 });
    }
    /* shoes and bags up the north wall, shelves to the sky */
    for (let k = 0; k < 10; k++) {
      blk(l, 320, 940, y + 40 + k * 86, y + 46 + k * 86, -1488, -1440, PAL.ivory);
      for (let j = 0; j < 10; j++) { const x = 350 + j * 58; if (k % 2) blk(l, x, x + 40, y + 46 + k * 86, y + 80 + k * 86, -1480, -1450, pick([PAL.wine, PAL.cream, PAL.walnut, PAL.blush, PAL.olive, PAL.brass]), { collide: false, round: 6 }); else { blk(l, x, x + 18, y + 46 + k * 86, y + 60 + k * 86, -1476, -1452, pick([PAL.ivory, PAL.charcoal, PAL.rose, PAL.brass]), { collide: false, round: 4 }); blk(l, x + 20, x + 38, y + 46 + k * 86, y + 60 + k * 86, -1476, -1452, pick([PAL.ivory, PAL.charcoal, PAL.rose]), { collide: false, round: 4 }); } }
    }
    collider(320, 940, y, y + 900, -1488, -1440, l, { cam: false });
    for (let k = 0; k < 9; k++) { blk(l, 1240, 1288, y + 60 + k * 96, y + 66 + k * 96, -1090, -360, PAL.ivory); for (let j = 0; j < 7; j++) cyl(l, 1264, y + 66 + k * 96, -1060 + j * 100, 22, 22, 40, pick([PAL.blush, PAL.cream, PAL.shell, PAL.wine, PAL.ivory]), { seg: 12 }); }
    collider(1240, 1288, y, y + 900, -1090, -360, l, { cam: false });
    /* the jewellery island, glass-topped, with a blush ottoman and a crystal chandelier above */
    blk(l, 560, 820, y, y + 90, -980, -840, PAL.walnut, { faces: { py: PAL.ivory } });
    vase(l, 790, y + 104, -950, 1, BLOOMS.front);
    blk(l, 570, 810, y + 90, y + 104, -970, -850, PAL.glass, { kind: 'glass' });
    for (let k = 0; k < 8; k++) ball(l, 590 + k * 28, y + 94, -910 + (k % 2) * 20, 5, k % 2 ? PAL.brassLt : PAL.white, { kind: 'metal', detail: 0 });
    cyl(l, 690, y, -760, 40, 40, 44, PAL.blush, { seg: 14, collide: true });
    chandelier(l, 690, -900, y + 900, 150);
    rug(l, y, 690, -900, 520, 600, PAL.shell, PAL.cream, PAL.blush);
  }

  /* ===== her bedroom: private softness ===== */
  {
    const l = 'L1', y = Y(1);
    bed(l, y, 800, 770, Math.PI, 220, 240, PAL.blush, PAL.cream);
    for (const [dx, dz] of [[-118, 650], [118, 650], [-118, 886], [118, 886]]) cyl(l, 800 + dx, y, dz, 4, 4, 360, PAL.brass, { kind: 'metal' });
    for (const [x0, x1, z0, z1] of [[680, 920, 646, 652], [680, 920, 884, 890], [680, 686, 646, 890], [914, 920, 646, 890]]) blk(l, x0, x1, y + 356, y + 362, z0, z1, PAL.brass, { kind: 'metal', collide: false });
    for (const dx of [-118, 118]) blk(l, 800 + dx - 2, 800 + dx + 2, y + 120, y + 356, 860, 888, PAL.ivory, { collide: false });
    for (const dx of [-170, 170]) { blk(l, 800 + dx - 28, 800 + dx + 28, y, y + 56, 830, 886, PAL.walnut); tableLamp(l, y + 56, 800 + dx, 858); }
    rug(l, y, 800, 560, 520, 380, PAL.wine, PAL.cream, PAL.blush);
    chandelier(l, 800, 420, y + H, 105);
    blk(l, 312, 362, y, y + 76, 480, 700, PAL.ivory, { faces: { py: PAL.walnutLt } });
    vase(l, 337, y + 76, 670, .9, BLOOMS.front);
    frame(l, 'E', 300, 590, y + 190, 110, 140, PAL.brass, '#E6ECEB');
    for (let k = 0; k < 4; k++) cyl(l, 334, y + 76, 520 + k * 40, 6, 6, 18, pick([PAL.rose, PAL.brass, PAL.ivory, PAL.wine]), {});
    armchair(l, y, 1160, 760, -Math.PI * .75, PAL.sage); floorLamp(l, y, 1240, 860);
    plant(l, y, 1240, 0, 1, PAL.ivory, 'tall');
    frame(l, 'S', -300, 900, y + 230, 220, 140, PAL.walnut, PAL.cream, i => { dab(l, i, .3, .5, 50, 60, PAL.rose); dab(l, i, .65, .45, 70, 50, PAL.sage); });
  }

  /* ===== her bathroom, her balcony ===== */
  {
    const l = 'L1', y = Y(1);
    blk(l, 1560, 1688, y + 14, y + 74, -300, -60, PAL.ivory, { round: 24 });
    blk(l, 1574, 1674, y + 56, y + 70, -290, -70, '#CFE0E0', { collide: false });
    for (const [x, z] of [[1570, -290], [1676, -290], [1570, -70], [1676, -70]]) ball(l, x, y + 8, z, 8, PAL.brass, { kind: 'metal', detail: 0 });
    blk(l, 1320, 1520, y, y + 86, -338, -276, PAL.sage, { faces: { py: PAL.white } });
    vase(l, 1490, y + 86, -306, .8, BLOOMS.front);
    for (const x of [1370, 1470]) frame(l, 'S', -350, x, y + 200, 70, 90, PAL.brass, '#DDE4E2');
    plant(l, y, 1660, 110, 1, PAL.ivory, 'tall');
    rug(l, y, 1500, -100, 200, 140, PAL.blush, PAL.cream);
    chandelier(l, 1460, -100, y + H, 55);
    const b = 'L1';
    roundTable(b, y, 1500, 420, 44, 72, PAL.charcoal, PAL.ivory);
    for (const a of [0, Math.PI]) chair(b, y, 1500 + Math.cos(a) * 80, 420, a === 0 ? -Math.PI / 2 : Math.PI / 2, PAL.charcoal, PAL.olive);
    cyl(b, 1500, y + 72, 410, 7, 6, 12, PAL.ivory, {});
    for (const [x, z] of [[1650, 200], [1650, 600], [1350, 600]]) { cyl(b, x, y, z, 26, 20, 40, PAL.terracotta, { collide: true }); flowers(b, x, y + 38, z, 44, 44, 26, BLOOMS.front, 34); }
    for (const [x0, x1, z0, z1] of [[1340, 1660, 628, 646]]) { blk(b, x0, x1, y, y + 30, z0, z1, PAL.forest, { collide: false }); flowers(b, (x0 + x1) / 2, y + 30, (z0 + z1) / 2, x1 - x0, 14, 50, BLOOMS.wine, 28); }
  }

  /* ===== the reading nook, in the turret ===== */
  {
    const l = 'L1', y = Y(1);
    armchair(l, y, 110, 220, Math.PI * .8, PAL.wine);
    /* stop: the pattern, her journal open on the little table */
    roundTable(l, y, 160, 80, 34, 54, PAL.walnut, PAL.ivory);
    blk(l, 140, 180, y + 54, y + 58, 70, 96, PAL.oxblood, { collide: false }); blk(l, 144, 178, y + 58, y + 59, 72, 94, PAL.ivory, { collide: false });
    META.pattern = { top: Y(1) + 120 };
    floorLamp(l, y, 60, 120);
    for (const [x, z] of [[230, 260], [70, 280]]) cyl(l, x, y, z, 26, 26, 22, pick([PAL.blush, PAL.sage, PAL.cream]), { seg: 10 });
  }

  /* ===== the attic: the music room, the mess of her brain, the closet gallery ===== */
  {
    const l = 'L2', y = Y(2);
    rug(l, y, -1250, -1150, 460, 420, PAL.forest, PAL.cream, PAL.wine);
    chandelier(l, -1250, -1100, y + 360, 80);
    grandPiano(l, -1150, y, -1260);
    drums(l, -1440, y, -1340);
    guitar(l, -1010, y, -980, PAL.ochre);
    violin(l, -1060, y, -1440);
    cyl(l, -1300, y, -1000, 3, 3, 120, PAL.charcoal, {}); piece(l, -1300, y + 120, -1000, 60, 40, 3, PAL.charcoal, { rx: -.4 });
    frame(l, 'W', -950, -1150, y + 130, 120, 80, PAL.brass, PAL.cream, i => { for (let k = 0; k < 5; k++) dab(l, i, .5, .2 + k * .15, 90, 2, PAL.charcoal); });
    /* stop: what would she do? the project table, papers everywhere */
    table(l, y, -300, -520, 320, 120, 80, PAL.walnutLt, PAL.cream);
    for (let k = 0; k < 7; k++) piece(l, -420 + k * 38, y + 80, -520 + (rnd() - .5) * 60, 30, 1.5, 40, pick([PAL.white, PAL.ivory, PAL.blush, PAL.cream]), { ry: (rnd() - .5) * .8 });
    blk(l, -250, -180, y + 80, y + 84, -560, -510, PAL.charcoal, { collide: false }); piece(l, -215, y + 84, -562, 70, 46, 2, PAL.charcoal, { rx: -.25 });
    tableLamp(l, y + 80, -430, -560);
    chair(l, y, -300, -440, Math.PI, PAL.walnut, PAL.sage);
    META.quiz = { top: Y(2) + 180 };
    /* stop: life in frames, the open trunk */
    blk(l, -80, 80, y, y + 70, -1150, -1060, PAL.walnut, { faces: { py: PAL.oxblood } });
    for (const x of [-80, 80]) blk(l, x - 4, x + 4, y, y + 72, -1150, -1060, PAL.brass, { kind: 'metal', collide: false });
    piece(l, 0, y + 70, -1170, 160, 80, 8, PAL.walnut, { rx: -.35 });
    for (let k = 0; k < 5; k++) piece(l, -55 + k * 27, y + 70, -1105 + (k % 2) * 10, 24, 30, 3, pick([PAL.ivory, PAL.white]), { rx: -.6 + k * .05 });
    META.photos = { top: Y(2) + 160 };
    /* boxes, a dress form, an old armchair, a chandelier rescued from somewhere */
    chandelier(l, -500, -450, y + 330, 75);
    for (const [x, z, s] of [[-1600, -300, 70], [-1530, -260, 50], [-1620, -200, 60], [-1580, -280, 40]]) blk(l, x - s / 2, x + s / 2, y + (s === 40 ? 70 : 0), y + (s === 40 ? 110 : s), z - s / 2, z + s / 2, s === 40 ? PAL.cream : '#C7A77E', { round: 3 });
    cyl(l, -900, y, -200, 3, 3, 100, PAL.walnut, {}); ball(l, -900, y + 130, -200, 24, PAL.cream, { detail: 1, sy: 1.4 }); ball(l, -900, y + 172, -200, 7, PAL.walnut, { detail: 0 });
    armchair(l, y, -700, -300, Math.PI * .2, PAL.ochre);
    rug(l, y, -500, -450, 440, 300, PAL.rose, PAL.cream, PAL.wine);
    floorLamp(l, y, 200, -900);
    shelf(l, y, 120, -1300, 0, 240, 180, 40, { rows: 2 });
    /* the gallery shelves: hat boxes up under the wing roof */
    for (let k = 0; k < 2; k++) for (let j = 0; j < 8; j++) cyl(l, 560 + j * 70, y + 30 + k * 120, -1460, 26, 26, 50, pick([PAL.blush, PAL.cream, PAL.wine, PAL.ivory, PAL.sage]), { seg: 12 });
  }

  return META;
}

/* ---------- a few showpieces ---------- */
function car(l, x, z, body, roof) {
  blk(l, x - 110, x + 110, 34, 104, z - 230, z + 230, body, { round: 30 });
  blk(l, x - 96, x + 96, 104, 170, z - 110, z + 90, roof, { round: 26 });
  blk(l, x - 92, x + 92, 112, 160, z + 88, z + 96, PAL.glass, { kind: 'glass', collide: false });
  blk(l, x - 92, x + 92, 112, 160, z - 116, z - 108, PAL.glass, { kind: 'glass', collide: false });
  for (const sx of [-1, 1]) blk(l, x + sx * 98 - 2, x + sx * 98 + 2, 112, 160, z - 100, z + 80, PAL.glass, { kind: 'glass', collide: false });
  for (const [dx, dz] of [[-100, -140], [100, -140], [-100, 150], [100, 150]]) { cyl(l, x + dx, 38, z + dz, 38, 38, 26, PAL.charcoal, { rz: Math.PI / 2, seg: 14 }); cyl(l, x + dx * 1.13, 38, z + dz, 18, 18, 2, PAL.brassLt, { rz: Math.PI / 2, seg: 10, kind: 'metal' }); }
  for (const sx of [-1, 1]) { ball(l, x + sx * 70, 80, z + 228, 14, GLOW, { kind: 'glow', detail: 's' }); ball(l, x + sx * 80, 80, z - 228, 9, PAL.oxblood, { detail: 0 }); }
  blk(l, x - 112, x + 112, 40, 50, z + 228, z + 236, PAL.brass, { kind: 'metal', collide: false });
}
/* her bicycle: a soft pink step-through, a wicker basket on the front, a cream saddle and a brass bell */
function bicycle(l, x, z) {
  const PINK = '#E3A9B2';
  for (const dz of [-75, 75]) { const w = new THREE.TorusGeometry(40, 3.2, 6, 20); w.rotateY(Math.PI / 2); w.translate(x, 42, z + dz); shape(l, w, PAL.charcoal); cyl(l, x, 42, z + dz, 3, 3, 8, PAL.brassLt, { rz: Math.PI / 2, seg: 8, kind: 'metal' }); }
  const tube = (pts, r = 3.4) => shape(l, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([py, pz]) => new THREE.Vector3(x, py, z + pz))), 16, r, 6, false), PINK);
  tube([[42, -75], [52, -40], [48, -5], [60, 30], [96, 52]]);     // the low, swooping step-through tube
  tube([[42, 0], [92, -22]]); tube([[42, -75], [92, -26]]); tube([[42, 75], [96, 56], [118, 50]]);
  blk(l, x - 9, x + 9, 94, 100, z - 34, z - 12, PAL.cream, { round: 4, collide: false });
  blk(l, x - 26, x + 26, 118, 122, z + 46, z + 52, PAL.charcoal, { collide: false });
  blk(l, x - 22, x + 22, 92, 124, z + 60, z + 98, '#C9A36B', { round: 5, collide: false });
  for (let k = 0; k < 3; k++) ball(l, x - 10 + k * 10, 128, z + 78, 7, [PAL.blush, PAL.ivory, PAL.rose][k], { detail: 0 });
  ball(l, x + 18, 124, z + 50, 4, PAL.brassLt, { kind: 'metal', detail: 0 });
  collider(x - 20, x + 20, 0, 110, z - 115, z + 115, l, { cam: false });
}
function grandPiano(l, x, y, z) {
  const sh = new THREE.Shape(); sh.moveTo(-75, -100); sh.lineTo(75, -100); sh.lineTo(75, 40); sh.bezierCurveTo(75, 110, 10, 100, -10, 140); sh.bezierCurveTo(-30, 170, -75, 160, -75, 110); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 34, bevelEnabled: false }); g.rotateX(Math.PI / 2); g.translate(x, y + 92, z); shape(l, g, PAL.charcoal);
  const lid = new THREE.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: false }); lid.rotateX(Math.PI / 2); lid.rotateZ(-.5); lid.translate(x + 30, y + 160, z); shape(l, lid, PAL.charcoal);
  collider(x - 75, x + 75, y + 58, y + 92, z - 140, z + 100, l, { cam: false });
  blk(l, x - 72, x + 72, y + 76, y + 82, z - 120, z - 100, PAL.white, { collide: false });
  for (let k = 0; k < 14; k++) blk(l, x - 66 + k * 10, x - 62 + k * 10, y + 82, y + 85, z - 118, z - 108, PAL.charcoal, { collide: false });
  for (const [dx, dz] of [[-62, -88], [62, -88], [-50, 120]]) cyl(l, x + dx, y, z + dz, 6, 7, 58, PAL.charcoal, {});
  blk(l, x - 50, x + 50, y + 44, y + 54, z - 176, z - 140, PAL.charcoal, { round: 3 });
}
function drums(l, x, y, z) {
  cyl(l, x, y + 40, z, 40, 40, 36, PAL.wine, { rx: Math.PI / 2, seg: 16, collide: true });
  cyl(l, x - 60, y, z + 40, 2, 2, 60, PAL.charcoal, {}); cyl(l, x - 60, y + 60, z + 40, 24, 24, 14, PAL.ivory, { seg: 14 });
  cyl(l, x + 50, y, z + 30, 2, 2, 74, PAL.charcoal, {}); cyl(l, x + 50, y + 74, z + 30, 20, 20, 16, PAL.wine, { seg: 14 });
  for (const [dx, h, r] of [[-80, 120, 34], [80, 130, 30]]) { cyl(l, x + dx, y, z - 10, 1.5, 1.5, h, PAL.charcoal, {}); cyl(l, x + dx, y + h, z - 10, r, r * .3, 3, PAL.brassLt, { seg: 16, kind: 'metal' }); }
  cyl(l, x, y, z + 90, 18, 18, 44, PAL.charcoal, { seg: 10 });
}
function guitar(l, x, y, z, c) {
  ball(l, x, y + 40, z, 24, c, { detail: 1, sz: .35 }); ball(l, x, y + 74, z, 18, c, { detail: 1, sz: .35 });
  blk(l, x - 3, x + 3, y + 84, y + 160, z - 3, z + 3, PAL.walnut, { collide: false }); blk(l, x - 6, x + 6, y + 160, y + 178, z - 3, z + 3, PAL.walnutDk, { collide: false });
  cyl(l, x, y + 58, z + 8, 6, 6, 1, PAL.charcoal, { rx: Math.PI / 2, seg: 10 });
}
function violin(l, x, y, z) {
  cyl(l, x, y, z, 2, 2, 90, PAL.brass, { kind: 'metal' });
  ball(l, x, y + 110, z, 14, PAL.oxblood, { detail: 1, sz: .3 }); ball(l, x, y + 132, z, 11, PAL.oxblood, { detail: 1, sz: .3 });
  blk(l, x - 2, x + 2, y + 140, y + 180, z - 2, z + 2, PAL.walnutDk, { collide: false });
}
