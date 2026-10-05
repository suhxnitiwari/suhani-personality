/* The shell: floors with holes where the stairs come through, walls with their doorways and windows,
   the three spiral stairs, the turret, the bays, the roofs, and the grounds around it all. */
import * as THREE from 'three';
import { PAL, blk, piece, cyl, ball, cone, shape, run, collider, flowers, BLOOMS } from './kit.js';

const WT = 12;
/* a storey's floor is cut where a stair passes up through it or arrives at it, never where one starts */
const holesIn = lv => HELIXES.filter(h => lv * LH > h.pf0 && lv * LH <= h.pf0 + h.rise).map(HSQ);                                   // each room's half of a wall
const LV = lv => 'L' + lv;
export const WALL = { living: PAL.linen, library: PAL.forest, cafe: PAL.blush, halfbath: PAL.paper, stairs: PAL.ivory, kitchen: PAL.linen, movie: PAL.plum, laundry: PAL.paper,
  mudroom: PAL.linen, pantry: PAL.paper, garage: '#CFC6B6', sunroom: PAL.ivory, guest: PAL.sage, study: PAL.olive, hall: PAL.ivory, gbath: PAL.mint, landing: PAL.ivory,
  uphall: PAL.ivory, closet: PAL.shell, bedroom: PAL.shell, bath: PAL.mint, music: PAL.wine, attic: '#D9C6A8', nook: PAL.cream, gallery: PAL.shell };
export const FLOORC = { living: PAL.honey, library: PAL.honey, cafe: PAL.oak, halfbath: PAL.tile, stairs: PAL.honey, kitchen: PAL.oak, movie: '#6E4A55', laundry: PAL.tile,
  mudroom: '#B7A58A', pantry: PAL.oak, garage: '#B9B1A3', sunroom: PAL.oak, guest: PAL.plank, study: PAL.honey, hall: PAL.plank, gbath: PAL.tile, landing: PAL.honey,
  uphall: PAL.honey, closet: PAL.plank, bedroom: '#C9AA86', bath: PAL.tile, balcony: PAL.stone, music: PAL.walnutLt, attic: '#9C7A57', gallery: PAL.plank, nook: PAL.plank };
const EXT = PAL.limestone, TRIM = PAL.ivory, ROOF = PAL.slate;

/* which rooms enclose a point on a storey (the garden and the balcony are outdoors) */
const enclosed = (lv, x, z) => Object.values(ROOMS).some(r => r.lv === lv && !r.open && !r.special && inRect(r, x, z)) || BAYS.some(b => b.lv === lv && inRect(b, x, z))
  || (lv === 2 && (inRect(MAIN, x, z) || inRect(WING, x, z))) || (lv === 1 && Math.hypot(x - TUR.x, z - TUR.z) < TUR.ro - 10);
/* which way a wall looks from outside, from the inward normal of the room it bounds */
const outward = n => n[1] > 0 ? 'N' : n[1] < 0 ? 'S' : n[0] > 0 ? 'W' : 'E';
const faceKey = n => n[0] > 0 ? 'px' : n[0] < 0 ? 'nx' : n[1] > 0 ? 'pz' : 'nz';
const backKey = n => faceKey([-n[0], -n[1]]);

/* one wall along a room's side: doorways from the plan, windows wherever it looks outside */
function side(layer, s, lv, y0, tall, inner, o = {}) {
  const ops = [];
  for (const [a, b, d] of openingsOn(s, lv)) ops.push({ a, b, y0: 0, y1: d.bay ? tall : d.dh || DH, bay: d.bay });
  const out = t => { const p = [s.A[0] + s.u[0] * t - s.n[0] * 40, s.A[1] + s.u[1] * t - s.n[1] * 40]; return !enclosed(lv, p[0], p[1]); };
  const pt = t => [s.A[0] + s.u[0] * t, s.A[1] + s.u[1] * t];
  if (o.windows !== false) {
    /* each room picks its own kind of window: arched, round, tall, small, or plain */
    const step = o.step || 300, margin = o.margin ?? 70, style = o.style || (() => ({}));
    const k = Math.max(1, Math.floor((s.len - 2 * margin) / step + 1e-6)), t0 = (s.len - (k - 1) * step) / 2;
    for (let i = 0; i < k; i++) {
      const t = t0 + i * step, st = style(i, k, pt(t)) || {}, kind = st.kind || 'rect', half = (st.w || o.winW || 120) / 2, a = t - half, b = t + half;
      if (a < Math.min(margin, 20) - 1 || b > s.len - Math.min(margin, 20) + 1 || ops.some(p => b > p.a - 50 && a < p.b + 50) || !out(t)) continue;
      const sill = st.sill ?? o.sill ?? 120;
      ops.push({ a, b, y0: sill, y1: Math.min(tall - 40, kind === 'round' ? sill + half * 2 : st.head ?? o.head ?? 350), win: true, kind,
        shutters: o.shutters !== false && (kind === 'rect' || kind === 'tall'), box: kind !== 'round' && kind !== 'small' });
    }
  }
  ops.sort((p, q) => p.a - q.a);
  const extLayer = layer + ':' + outward(s.n);
  const seg = (t0, t1, h0, h1, ext) => {
    const [ax, az] = pt(t0), [bx, bz] = pt(t1), nx = s.n[0] * WT, nz = s.n[1] * WT;
    const faces = { [faceKey(s.n)]: inner, [backKey(s.n)]: ext ? EXT : inner, py: TRIM, ny: TRIM };
    const sideC = ext ? EXT : inner;
    for (const k of ['px', 'nx', 'pz', 'nz']) if (!faces[k]) faces[k] = sideC;
    blk(ext ? extLayer : layer, Math.min(ax, bx, ax + nx, bx + nx), Math.max(ax, bx, ax + nx, bx + nx), y0 + h0, y0 + h1, Math.min(az, bz, az + nz, bz + nz), Math.max(az, bz, az + nz, bz + nz), inner, { faces, jitter: 0 });
  };
  let c = 0;
  for (const p of ops) {
    if (p.a > c) seg(c, p.a, 0, tall, out((c + p.a) / 2));
    const ext = out((p.a + p.b) / 2);
    if (p.y0 > 0) seg(p.a, p.b, 0, p.y0, ext);
    if (p.y1 < tall) seg(p.a, p.b, p.y1, tall, ext);
    if (p.win) {
      window_(extLayer, pt(p.a), pt(p.b), s.n, y0 + p.y0, y0 + p.y1, p);
      const w = p.b - p.a, r = w / 2 - 1, L = ext ? extLayer : layer, outC = ext ? EXT : inner;
      if (p.kind === 'arch') spandrel(L, s, p.a, w, y0 + p.y1 - r - 12, r + 12, r, false, outC, inner);
      if (p.kind === 'round') { spandrel(L, s, p.a, w, y0 + p.y0 + w / 2, w / 2, r, false, outC, inner); spandrel(L, s, p.a, w, y0 + p.y0 + w / 2, w / 2, r, true, outC, inner); }
    }
    else if (!p.bay && p.y1 < tall) { const [ax, az] = pt(p.a), [bx, bz] = pt(p.b); trimAround(layer, ax, az, bx, bz, s.n, y0, y0 + p.y1); }
    c = Math.max(c, p.b);
  }
  if (c < s.len) seg(c, s.len, 0, tall, out((c + s.len) / 2));
}
/* the solid wall left in the top of an arched window, or round a round one: the opening's corners with a curve cut out.
   Built in the wall's own frame (along it, up, into it), outside half in the facade colour, inside half in the room's */
function spandrel(layer, s, a, w, yBase, h, r, down, outC, inC) {
  const sh = new THREE.Shape(), d = down ? -1 : 1;
  sh.moveTo(0, 0); sh.lineTo(0, d * h); sh.lineTo(w, d * h); sh.lineTo(w, 0);
  sh.absarc(w / 2, 0, r, 0, d * Math.PI, down);
  sh.closePath();
  for (const [d0, d1, c] of [[0, WT / 2, outC], [WT / 2, WT, inC]]) {
    const g = new THREE.ExtrudeGeometry(sh, { depth: d1 - d0, bevelEnabled: false, curveSegments: 14 });
    g.applyMatrix4(new THREE.Matrix4().set(s.u[0], 0, s.n[0], s.A[0] + s.u[0] * a + s.n[0] * d0, 0, 1, 0, yBase, s.u[1], 0, s.n[1], s.A[1] + s.u[1] * a + s.n[1] * d0, 0, 0, 0, 1));
    shape(layer, g, c, { jitter: 0 });
  }
}
/* a ring of walnut round an arch or a round window, on the outside face */
function ringTrim(layer, [ax, az], [bx, bz], n, cy, r, half) {
  const g = new THREE.TorusGeometry(r + 4, 4, 5, 20, half ? Math.PI : Math.PI * 2);
  const u = [(bx - ax) / Math.hypot(bx - ax, bz - az), (bz - az) / Math.hypot(bx - ax, bz - az)];
  g.applyMatrix4(new THREE.Matrix4().set(u[0], 0, n[0], (ax + bx) / 2 - n[0] * 3, 0, 1, 0, cy, u[1], 0, n[1], (az + bz) / 2 - n[1] * 3, 0, 0, 0, 1));
  shape(layer, g, PAL.walnutLt, { jitter: 0 });
}
/* a window: a pane of glass in a walnut frame, with a sill. Arched and round ones get a ring of trim; tall ones a transom */
function window_(layer, [ax, az], [bx, bz], n, y0, y1, p = {}) {
  const kind = p.kind || 'rect', w = Math.hypot(bx - ax, bz - az), r = w / 2 - 1;
  if (kind === 'arch') ringTrim(layer, [ax, az], [bx, bz], n, y1 - r - 12, r, true);
  if (kind === 'round') ringTrim(layer, [ax, az], [bx, bz], n, y0 + w / 2, r, false);
  if (/:[SN]$/.test(layer) && y0 < 2 * LH && p.box !== false) {
    windowBox(layer, Math.min(ax, bx), Math.max(ax, bx), az, -n[1], y0);
    /* louvred shutters in forest green, either side */
    if (p.shutters) for (const [x0, x1] of [[Math.min(ax, bx) - 44, Math.min(ax, bx) - 6], [Math.max(ax, bx) + 6, Math.max(ax, bx) + 44]]) {
      const z0 = az - n[1] * 2, z1 = az - n[1] * 8, lo = Math.min(z0, z1), hi = Math.max(z0, z1);
      blk(layer, x0, x1, y0 - 6, y1 + 6, lo, hi, PAL.forest, { collide: false });
      for (let y = y0 + 14; y < y1 - 6; y += 18) blk(layer, x0 + 5, x1 - 5, y, y + 4, lo - (n[1] > 0 ? 1.5 : 0), hi + (n[1] < 0 ? 1.5 : 0), '#2E3B2C', { collide: false });
    }
  }
  const mx = (ax + bx) / 2, mz = (az + bz) / 2, along = Math.abs(bx - ax) > 1;
  const cx = mx + n[0] * WT / 2, cz = mz + n[1] * WT / 2;
  /* glazing bars: a cross for most, a transom high up on tall ones, one for the spring of an arch */
  const bars = kind === 'tall' ? [y0 + (y1 - y0) * .72] : kind === 'arch' ? [y1 - r - 12] : kind === 'round' ? [y0 + w / 2] : [(y0 + y1) / 2];
  const sillOn = kind !== 'round';
  if (along) {
    blk(layer, Math.min(ax, bx), Math.max(ax, bx), y0, y1, cz - 2, cz + 2, PAL.glass, { kind: 'glass', cam: false });
    blk(layer, mx - 3, mx + 3, y0, y1, cz - 4, cz + 4, PAL.walnut, { collide: false });
    for (const y of bars) blk(layer, Math.min(ax, bx), Math.max(ax, bx), y - 3, y + 3, cz - 4, cz + 4, PAL.walnut, { collide: false });
    if (sillOn) blk(layer, Math.min(ax, bx) - 8, Math.max(ax, bx) + 8, y0 - 8, y0, cz - 14, cz + 14, TRIM, { collide: false });
  } else {
    blk(layer, cx - 2, cx + 2, y0, y1, Math.min(az, bz), Math.max(az, bz), PAL.glass, { kind: 'glass', cam: false });
    blk(layer, cx - 4, cx + 4, y0, y1, mz - 3, mz + 3, PAL.walnut, { collide: false });
    for (const y of bars) blk(layer, cx - 4, cx + 4, y - 3, y + 3, Math.min(az, bz), Math.max(az, bz), PAL.walnut, { collide: false });
    if (sillOn) blk(layer, cx - 14, cx + 14, y0 - 8, y0, Math.min(az, bz) - 8, Math.max(az, bz) + 8, TRIM, { collide: false });
  }
}
/* a window box under a front or garden window, spilling flowers */
function windowBox(layer, x0, x1, z, out, sill) {
  const zf = z + out * 2, zb = z + out * 34, lo = Math.min(zf, zb), hi = Math.max(zf, zb);
  blk(layer, x0 - 6, x1 + 6, sill - 44, sill - 14, lo, hi, PAL.forest, { collide: false });
  blk(layer, x0 - 2, x1 + 2, sill - 16, sill - 12, lo + 2, hi - 2, '#6E5A44', { collide: false });
  flowers(layer, (x0 + x1) / 2, sill - 14, (lo + hi) / 2, x1 - x0, 22, Math.round((x1 - x0) / 9), out > 0 ? BLOOMS.front : BLOOMS.wine, 30);
}
/* a walnut casing round a doorway: a thin frame standing just proud of the wall's face, never inside it, so no two surfaces fight */
function trimAround(layer, ax, az, bx, bz, n, y0, y1) {
  const along = Math.abs(bx - ax) > 1, a = along ? Math.min(ax, bx) : Math.min(az, bz), b = along ? Math.max(ax, bx) : Math.max(az, bz);
  const line = along ? az : ax, nn = along ? n[1] : n[0], f0 = line + nn * (WT + .6), f1 = line + nn * (WT + 4);
  const L = Math.min(f0, f1), R = Math.max(f0, f1), o = { collide: false, jitter: 0 };
  for (const [p0, p1] of [[a - 12, a], [b, b + 12]]) along ? blk(layer, p0, p1, y0, y1 + 12, L, R, PAL.walnutLt, o) : blk(layer, L, R, y0, y1 + 12, p0, p1, PAL.walnutLt, o);
  along ? blk(layer, a - 12, b + 12, y1, y1 + 12, L, R, PAL.walnutLt, o) : blk(layer, L, R, y1, y1 + 12, a - 12, b + 12, PAL.walnutLt, o);
}
/* a floor slab, with holes cut for the stairs, edged in trim */
function slab(layer, r, top, thick, color, holes = []) {
  for (const p of rectMinus(r, holes)) blk(layer, p.x0, p.x1, top - thick, top, p.z0, p.z1, color, { faces: { py: color, ny: PAL.white, px: TRIM, nx: TRIM, pz: TRIM, nz: TRIM }, jitter: .02 });
}
/* a baseboard round the room, so the floor meets the wall like a real one */
function baseboards(layer, r, lv, y0) {
  for (const s of sidesOf(r)) {
    let c = 0;
    const cuts = openingsOn(s, lv);
    const put = (t0, t1) => {
      if (t1 - t0 < 4) return;
      const ax = s.A[0] + s.u[0] * t0, az = s.A[1] + s.u[1] * t0, bx = s.A[0] + s.u[0] * t1, bz = s.A[1] + s.u[1] * t1;
      const nx = s.n[0] * (WT + 4), nz = s.n[1] * (WT + 4);
      blk(layer, Math.min(ax, bx, ax + nx, bx + nx), Math.max(ax, bx, ax + nx, bx + nx), y0, y0 + 22, Math.min(az, bz, az + nz, bz + nz), Math.max(az, bz, az + nz, bz + nz), PAL.ivory, { collide: false, jitter: 0 });
    };
    for (const [a, b] of cuts) { put(c, a); c = b; }
    put(c, s.len);
  }
}

/* ---------- spiral stairs: wedge treads round a brass pole, a railing with gaps where each storey meets it ---------- */
function spiral(h, tread = PAL.walnut) {
  const N = Math.round(h.spin / (Math.PI / 12)), du = h.spin / N;
  const exits = [];
  for (let lv = 0; lv <= 2; lv++) { const pf = lv * LH; if (pf >= h.pf0 && pf <= h.pf0 + h.rise) exits.push((pf - h.pf0) / h.rise * h.spin); }
  for (let k = 0; k < N; k++) {
    const u = (k + .5) * du, top = h.pf0 + (k + 1) / N * h.rise, a = h.a0 - u, layer = LV(Math.min(2, Math.floor((top - 1) / LH)));
    const len = h.r - 18, cx = h.cx + Math.cos(a) * (18 + len / 2), cz = h.cz + Math.sin(a) * (18 + len / 2);
    piece(layer, cx, top - 12, cz, len, 12, h.r * du * 1.18, k % 2 ? tread : PAL.walnutLt, { ry: -a, jitter: .02 });
    for (let rr = 34; rr < h.r - 8; rr += 26) { const x = h.cx + Math.cos(a) * rr, z = h.cz + Math.sin(a) * rr; collider(x - 15, x + 15, top - 16, top, z - 15, z + 15, layer, { cam: false }); }
    /* balusters, except where you step on or off */
    const nearExit = exits.some(e => Math.abs(e - u) < .7);
    if (!nearExit && k % 2 === 0) {
      const bx = h.cx + Math.cos(a) * (h.r - 6), bz = h.cz + Math.sin(a) * (h.r - 6);
      cyl(layer, bx, top, bz, 2.5, 2.5, 100, PAL.brass, { seg: 6, kind: 'metal' });
      collider(bx - 10, bx + 10, top, top + 110, bz - 10, bz + 10, layer, { cam: false });
    }
  }
  /* the handrail, a brass ribbon following the outer edge */
  const pts = [];
  for (let k = 0; k <= N * 2; k++) { const u = k / (N * 2) * h.spin, a = h.a0 - u; pts.push(new THREE.Vector3(h.cx + Math.cos(a) * (h.r - 6), h.pf0 + u / h.spin * h.rise + 104, h.cz + Math.sin(a) * (h.r - 6))); }
  const segs = [];
  let cur = [];
  pts.forEach((p, i) => { const u = i / (N * 2) * h.spin; if (exits.some(e => Math.abs(e - u) < .7)) { if (cur.length > 2) segs.push(cur); cur = []; } else cur.push(p); });
  if (cur.length > 2) segs.push(cur);
  for (const s of segs) {
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(s), s.length * 2, 3.5, 6, false);
    shape(LV(Math.min(2, Math.floor((s[0].y - 104) / LH))), geo, PAL.brass, { kind: 'metal' });
  }
  for (let lv = Math.floor(h.pf0 / LH); lv * LH < h.pf0 + h.rise; lv++) {
    cyl(LV(lv), h.cx, lv * LH, h.cz, 14, 14, LH + (lv * LH + LH > h.pf0 + h.rise ? 110 : 0), PAL.brass, { kind: 'metal', collide: true });
  }
  ball(LV(Math.floor((h.pf0 + h.rise) / LH)), h.cx, h.pf0 + h.rise + 118, h.cz, 18, PAL.brassLt, { kind: 'metal', detail: 's' });
}

/* ---------- the turret: an octagon on the front corner, the reading nook at the top, a witch's-hat roof ---------- */
function turret() {
  const { x, z, ro } = TUR, R = ro, pts = [];
  for (let k = 0; k < 8; k++) { const a = (k + .5) * Math.PI / 4; pts.push([x + Math.cos(a) * R, z + Math.sin(a) * R]); }
  for (let k = 0; k < 8; k++) {
    const [ax, az] = pts[k], [bx, bz] = pts[(k + 7) % 8];
    const mid = Math.atan2((az + bz) / 2 - z, (ax + bx) / 2 - x), east = Math.abs(mid) < .3;
    run('L0', ax, az, bx, bz, 0, LH, 18, EXT);
    if (!east) {
      run('L1', ax, az, bx, bz, LH, LH + 120, 18, EXT);
      run('L1', ax, az, bx, bz, LH + 340, LH + H, 18, EXT, { collide: false });
      run('L1', ax, az, bx, bz, LH + 120, LH + 340, 6, PAL.glass, { kind: 'glass', cam: false });
    } else run('L1', ax, az, bx, bz, LH + 320, LH + H, 18, EXT, { collide: false });
    const mx = x + Math.cos(mid) * (R + 2), mz = z + Math.sin(mid) * (R + 2);
    if (!east) { piece('L0', mx, 130, mz, 70, 190, 6, PAL.glass, { ry: -mid + Math.PI / 2, kind: 'glow', collide: false }); }
  }
  cyl('L1', x, LH - 40, z, R, R, 40, FLOORC.nook, { seg: 8, ry: Math.PI / 8 });
  collider(x - R, x + R, LH - 40, LH, z - R, z + R, 'L1', { cam: false });
  cyl('roof', x, LH + H, z, R + 24, R + 24, 24, TRIM, { seg: 8, ry: Math.PI / 8 });
  cone('roof', x, LH + H + 24, z, R + 40, 560, ROOF, { seg: 8, ry: Math.PI / 8 });
  ball('roof', x, LH + H + 600, z, 12, PAL.brassLt, { kind: 'metal' });
}

/* ---------- roofs: a steep gable over the main house, a taller one over her wing ---------- */
function gableRoof(x0, x1, z0, z1, eave, ridge, alongX, over = 70) {
  const run_ = (alongX ? z1 - z0 : x1 - x0) / 2, rise = ridge - eave, s = rise / run_;
  const len = alongX ? x1 - x0 + over * 2 : z1 - z0 + over * 2;
  const L = Math.hypot(run_ + over, rise + over * s), th = Math.atan2(rise + over * s, run_ + over);
  for (const sg of [-1, 1]) {
    const geo = new THREE.BoxGeometry(alongX ? len : L, 26, alongX ? L : len);
    const midRun = (run_ - over) / 2, midY = ridge - (rise + over * s) / 2 + 13;
    if (alongX) { geo.rotateX(sg * th); geo.translate((x0 + x1) / 2, midY, (z0 + z1) / 2 + sg * (midRun + over)); }
    else { geo.rotateZ(-sg * th); geo.translate((x0 + x1) / 2 + sg * (midRun + over), midY, (z0 + z1) / 2); }
    shape('roof', geo, ROOF, { jitter: .02 });
  }
  /* ridge cap and the gable ends */
  alongX ? blk('roof', x0 - over, x1 + over, ridge + 8, ridge + 26, (z0 + z1) / 2 - 14, (z0 + z1) / 2 + 14, PAL.charcoal, { collide: false })
    : blk('roof', (x0 + x1) / 2 - 14, (x0 + x1) / 2 + 14, ridge + 8, ridge + 26, z0 - over, z1 + over, PAL.charcoal, { collide: false });
  for (const end of alongX ? [x0, x1] : [z0, z1]) {
    const sh = new THREE.Shape(), a = alongX ? z0 : x0, b = alongX ? z1 : x1;
    const f = alongX ? -1 : 1;
    sh.moveTo(f * a, eave); sh.lineTo(f * b, eave); sh.lineTo(f * (a + b) / 2, ridge); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 20, bevelEnabled: false });
    if (alongX) { geo.rotateY(Math.PI / 2); geo.translate(end - (end === x0 ? 0 : 20), 0, 0); }
    else geo.translate(0, 0, end - (end === z0 ? 0 : 20));
    shape('roof', geo, EXT, { jitter: 0 });
    /* a round attic window in each gable */
    const cy = eave + (ridge - eave) * .38;
    alongX ? cyl('roof', end + (end === x0 ? -3 : 3), cy, (z0 + z1) / 2, 46, 46, 8, PAL.warm, { rz: Math.PI / 2, kind: 'glow', seg: 16 })
      : cyl('roof', (x0 + x1) / 2, cy, end + (end === z0 ? -3 : 3), 46, 46, 8, PAL.warm, { rx: Math.PI / 2, kind: 'glow', seg: 16 });
  }
}

/* the windows, room by room: so the house reads as rooms with lives, not a grid of identical rectangles */
const windowStyle = (id, s) => (i, k, [x]) => {
  const front = s.k === 's';
  switch (id) {
    case 'guest': return front && x > -1150 && x < -950 ? { kind: 'round', w: 130, sill: 200 } : { kind: 'arch', w: 116, sill: 90, head: 390 };
    case 'uphall': return { kind: 'arch', w: 108, sill: 100, head: 390 };
    case 'bedroom': return front ? (i === Math.floor(k / 2) ? { kind: 'arch', w: 230, sill: 46, head: 420 } : { kind: 'tall', w: 82, sill: 70, head: 380 }) : { kind: 'tall', w: 96, sill: 60, head: 390 };
    case 'closet': return { kind: 'arch', w: 92, sill: 160, head: 820 };
    case 'kitchen': case 'living': return { kind: 'tall', w: 120, sill: 40, head: 392 };
    case 'laundry': case 'mudroom': case 'pantry': case 'gbath': case 'halfbath': case 'garage': return { kind: 'small', w: 84, sill: 220, head: 304 };
    case 'movie': return { kind: 'small', w: 96, sill: 236, head: 332 };
    case 'bath': return { kind: 'round', w: 112, sill: 196 };
    case 'library': case 'study': case 'cafe': case 'stairs': case 'landing': case 'hall': return { kind: 'arch', w: 108, sill: 110, head: 396 };
  }
  return {};
};

export function buildShell() {
  /* floors and walls, storey by storey */
  for (const id in ROOMS) {
    const r = ROOMS[id];
    if (r.special || id === 'garden') continue;
    const lv = r.lv, y0 = lv * LH, layer = LV(lv);
    if (id === 'balcony') {
      slab(layer, r, y0, 40, FLOORC.balcony);
      for (const s of sidesOf(r)) if (s.k !== 'w' && s.k !== 'n') balustrade(layer, s, y0);
      for (const [px, pz] of [[1690, 640], [1310, 640], [1690, 160]]) cyl('L0', px, 0, pz, 16, 18, y0 - 40, TRIM, { collide: true });
      continue;
    }
    if (id === 'sunroom') { sunroom(r); continue; }
    slab(layer, r, y0 + (lv ? 0 : 1), lv ? 40 : 22, FLOORC[id] || PAL.oak, holesIn(lv));
    for (const s of sidesOf(r)) side(layer, s, lv, y0, r.tall || H, WALL[id] || PAL.linen, { windows: !(id === 'garage' && s.k === 's'), style: windowStyle(id, s), step: id === 'bedroom' && s.k === 's' ? 260 : id === 'closet' ? 240 : undefined });
    baseboards(layer, r, lv, y0);
  }
  /* the bays: little glass rooms pushed out of the walls */
  for (const b of BAYS) {
    const lv = b.lv, y0 = lv * LH, layer = LV(lv), room = ROOMS[b.room];
    slab(layer, b, y0 + (lv ? 0 : 1), lv ? 40 : 22, FLOORC[b.room] || PAL.oak);
    for (const s of sidesOf(b)) {
      const onHouse = s.u[0] ? (s.A[1] === room.z0 || s.A[1] === room.z1) : (s.A[0] === room.x0 || s.A[0] === room.x1);
      if (onHouse) continue;
      side(layer, s, lv, y0, lv === 2 ? 300 : H, WALL[b.room] || PAL.linen, { step: s.len > 250 ? (s.len - 40) / Math.round((s.len - 40) / 125) : s.len, winW: s.len > 250 ? 104 : s.len - 64, margin: s.len > 250 ? 20 : 32, sill: 70, head: lv === 2 ? 250 : 400, shutters: false });
    }
    const above = BAYS.some(o => o.lv === lv + 1 && o.x0 === b.x0 && o.z0 === b.z0);
    if (!above) {
      const top = y0 + (lv === 2 ? 300 : H);
      const n = b.z1 > 0 ? 1 : b.z0 < -1500 ? -1 : 0, face = LV(lv) + ':' + (n > 0 ? 'S' : n < 0 ? 'N' : 'E');
      blk(face, b.x0 - 14, b.x1 + 14, top, top + 26, b.z0 - 14, b.z1 + 14, TRIM, { collide: false });
      if (n) bayRoof(b, top + 26, n, face);
      else blk(face, b.x0 - 6, b.x1 + 6, top + 26, top + 60, b.z0 - 6, b.z1 + 6, ROOF, { collide: false });
    }
  }
  /* the attic: boards over the main house, knee walls under the eaves, the music room boxed in at the west end */
  const A = ATTIC;
  for (const p of ATTICFLOOR) for (const q of rectMinus(p, [ROOMS.music])) slab('L2', q, A, 40, FLOORC.attic);
  slab('L2', ROOMS.music, A, 40, FLOORC.music, holesIn(2));
  for (const s of sidesOf(ROOMS.music)) side('L2', s, 2, A, s.k === 's' ? 300 : 200, WALL.music, { head: 180, sill: 60, step: 260 });
  for (const s of sidesOf(MAIN)) if (s.k === 'n' || s.k === 's') {
    const segs = s.k === 'n' ? [[-950, 300]] : [[-1700, 300]];
    for (const [a, b] of segs) blk('L2:' + s.k.toUpperCase(), a, b, A, EAVE, s.A[1] + (s.k === 'n' ? 0 : -WT), s.A[1] + (s.k === 'n' ? WT : 0), WALL.attic, { faces: { [s.k === 'n' ? 'nz' : 'pz']: EXT, py: TRIM } });
  } else blk('L2:' + s.k.toUpperCase(), s.A[0] + (s.k === 'w' ? 0 : -WT), s.A[0] + (s.k === 'w' ? WT : 0), A, EAVE, -1500, 0, WALL.attic, { faces: { [s.k === 'w' ? 'nx' : 'px']: EXT, py: TRIM } });
  /* her wing above the closet: a gallery walkway round a two-storey void, under its own tall roof */
  for (const g of GALLERY) slab('L2', g, A, 40, FLOORC.gallery, holesIn(2));
  blk('L2', 300, 1300, A - 40, A, -300, 900, FLOORC.gallery, { faces: { ny: PAL.white } });
  /* her closet's own walls already rise the full two storeys; the attic storey's walls only go above her bedroom */
  for (const s of sidesOf({ x0: 300, x1: 1300, z0: -300, z1: 900 })) side('L2', s, 2, A, WEAVE - A, WALL.gallery, { step: 360, style: () => ({ kind: 'round', w: s.k === 's' ? 170 : 120, sill: 140 }) });
  galleryRail();
  /* the east wing: pantry and her bathroom under a little gable */
  gableRoof(EAST.x0, EAST.x1 + 20, EAST.z0, EAST.z1, LH + H, LH + H + 230, true, 40);
  blk('roof', EAST.x0, EAST.x1, LH + H, LH + H + 4, EAST.z0, EAST.z1, TRIM, { collide: false });
  /* the roofs, a chimney, the turret */
  gableRoof(MAIN.x0, MAIN.x1, MAIN.z0, MAIN.z1, EAVE, RIDGE, true);
  gableRoof(WING.x0, WING.x1, WING.z0, WING.z1, WEAVE, WRIDGE, false);
  blk('roof', -1520, -1380, A, RIDGE + 120, -560, -420, PAL.oxblood, { collide: false });
  blk('roof', -1534, -1366, RIDGE + 120, RIDGE + 140, -574, -406, PAL.charcoal, { collide: false });
  turret();
  /* the stairs */
  spiral(HELIXES[0], PAL.walnut); spiral(HELIXES[1], PAL.walnutDk); spiral(HELIXES[2], PAL.ivory);
  /* a plinth all round the base, and a cornice under each eave */
  for (const r of [MAIN, WING, EAST]) for (const s of sidesOf(r)) {
    const ax = s.A[0], az = s.A[1], bx = ax + s.u[0] * s.len, bz = az + s.u[1] * s.len, nx = -s.n[0] * 10, nz = -s.n[1] * 10;
    blk('out', Math.min(ax, bx, ax + nx), Math.max(ax, bx, ax + nx), 0, 26, Math.min(az, bz, az + nz), Math.max(az, bz, az + nz), PAL.stone, { collide: false });
  }
  /* the front porch: a little portico, two ivory columns and a pediment, brass lanterns, a stone step */
  const PO = 'L0:S';
  blk(PO, -1230, -870, 0, 14, 0, 190, PAL.stone, { collide: false });
  for (const px of [-1205, -895]) { cyl(PO, px, 14, 160, 16, 16, 12, TRIM, { seg: 14 }); cyl(PO, px, 26, 160, 12, 14, 324, TRIM, { seg: 14, collide: true }); cyl(PO, px, 350, 160, 17, 13, 14, TRIM, { seg: 14 }); }
  blk(PO, -1232, -868, 364, 392, 0, 186, TRIM, { collide: false });
  { const sh = new THREE.Shape(); sh.moveTo(-1250, 392); sh.lineTo(-850, 392); sh.lineTo(-1050, 500); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 200, bevelEnabled: false }); g.translate(0, 0, -6); shape(PO, g, TRIM, { jitter: 0 });
    for (const sg of [-1, 1]) { const r = new THREE.BoxGeometry(Math.hypot(206, 112) + 10, 10, 216); r.rotateZ(-sg * Math.atan2(108, 200)); r.translate(-1050 + sg * 101, 448, 94); shape(PO, r, ROOF); }
    cyl(PO, -1050, 430, 195, 26, 26, 3, PAL.brassLt, { rx: Math.PI / 2, seg: 20, kind: 'glow' }); }
  for (const px of [-1170, -930]) { cyl('L0', px, 200, 18, 10, 10, 30, PAL.walnutDk, {}); ball('L0', px, 240, 18, 13, PAL.warm, { kind: 'glow', detail: 's' }); }
  { const w = new THREE.TorusGeometry(32, 9, 6, 20); w.translate(-1050, 236, 8); shape(PO, w, PAL.moss); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; ball(PO, -1050 + Math.cos(a) * 32, 236 + Math.sin(a) * 32, 16, 5, k % 3 ? PAL.blush : PAL.ivory, { detail: 0 }); } }
  /* two dormers on the front of the main roof, warm light in their windows */
  for (const x of [-1400, -700]) {
    const z0 = -400, z1 = -170, yb = EAVE + 60, yt = RIDGE - (750 + z1) * (RIDGE - EAVE) / 750 + 150;
    blk('roof', x - 85, x + 85, yb, yt, z0, z1, EXT, { collide: false, faces: { pz: EXT } });
    blk('roof', x - 52, x + 52, yt - 190, yt - 30, z1, z1 + 3, PAL.warm, { kind: 'glow', collide: false });
    blk('roof', x - 3, x + 3, yt - 190, yt - 30, z1 + 3, z1 + 6, PAL.walnut, { collide: false });
    blk('roof', x - 52, x + 52, yt - 112, yt - 106, z1 + 3, z1 + 6, PAL.walnut, { collide: false });
    blk('roof', x - 62, x + 62, yt - 200, yt - 190, z1, z1 + 14, TRIM, { collide: false });
    for (const sg of [-1, 1]) { const g = new THREE.BoxGeometry(Math.hypot(100, 70) + 8, 12, z1 - z0 + 30); g.rotateZ(-sg * Math.atan2(70, 100)); g.translate(x + sg * 48, yt + 34, (z0 + z1) / 2 + 12); shape('roof', g, ROOF); }
    const sh = new THREE.Shape(); sh.moveTo(x - 85, yt); sh.lineTo(x + 85, yt); sh.lineTo(x, yt + 66); sh.closePath();
    const gg = new THREE.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false }); gg.translate(0, 0, z1 - 8); shape('roof', gg, TRIM, { jitter: 0 });
  }
  /* stone quoins up every outside corner of the house */
  for (const [x, z, sx, sz] of [[-1700, 0, -1, 1], [1300, 900, 1, 1], [300, 900, -1, 1], [-1700, -1500, -1, -1], [1300, -1500, 1, -1]]) {
    const top = z === 900 || x === 1300 ? WEAVE : EAVE;
    for (let y = 30, i = 0; y < top - 40; y += 64, i++) { const L = i % 2 ? 70 : 44; blk(sz > 0 ? 'L0:S' : 'L0:N', x - (sx < 0 ? 4 : L), x + (sx < 0 ? L : 4), y, y + 54, z - (sz > 0 ? 6 : -2), z + (sz > 0 ? 4 : 2), PAL.stone, { collide: false }); blk(sx < 0 ? 'L0:W' : 'L0:E', x - (sx < 0 ? 4 : 2), x + (sx < 0 ? 2 : 4), y, y + 54, z - (sz > 0 ? (i % 2 ? 44 : 70) : 4), z + (sz > 0 ? 4 : (i % 2 ? 44 : 70)), PAL.stone, { collide: false }); }
  }
  /* climbing roses up the front, never everywhere, always somewhere */
  for (const [x, top] of [[-1640, 760], [-160, 820], [360, 1060]]) {
    for (let y = 20; y < top; y += 26) { const wob = Math.sin(y / 60) * 18; ball('L0:S', x + wob, y, 6, 15, y % 52 ? PAL.leaf : PAL.moss, { detail: 0 }); if (y % 3 === 0 || y % 78 === 20) ball('L0:S', x + wob + 10, y + 8, 12, 6, y % 4 ? PAL.blush : PAL.rose, { detail: 0 }); }
    for (let k = 0; k < 10; k++) ball('L0:S', x + Math.sin(k * 2.3) * 35, top - 30 + Math.cos(k * 1.7) * 25, 8, 12, k % 2 ? PAL.leaf : PAL.blush, { detail: 0 });
  }
}

function bayRoof(b, y, n, layer) {
  const w = b.x1 - b.x0 + 28, d = b.z1 - b.z0 + 14, geo = new THREE.BoxGeometry(w, 18, d + 20);
  geo.rotateX(n * .35); geo.translate((b.x0 + b.x1) / 2, y + 26, (b.z0 + b.z1) / 2 + n * 10);
  shape(layer, geo, ROOF);
}
function balustrade(layer, s, y0) {
  const ax = s.A[0], az = s.A[1], bx = ax + s.u[0] * s.len, bz = az + s.u[1] * s.len;
  run(layer, ax, az, bx, bz, y0 + 100, y0 + 112, 14, TRIM);
  run(layer, ax, az, bx, bz, y0, y0 + 100, 4, TRIM, { collide: true, cam: false });
  for (let t = 0; t <= s.len; t += 40) cyl(layer, ax + s.u[0] * t, y0, az + s.u[1] * t, 4, 5, 100, TRIM, { seg: 6 });
}
function galleryRail() {
  const y = ATTIC, inner = [[500, -1300, 1100, -1300], [500, -1300, 500, -300], [1100, -1300, 1100, -300]];
  for (const [ax, az, bx, bz] of inner) {
    run('L2', ax, az, bx, bz, y + 96, y + 108, 10, PAL.brass, { kind: 'metal' });
    run('L2', ax, az, bx, bz, y, y + 96, 3, PAL.brass, { kind: 'metal', cam: false });
  }
}
function sunroom(r) {
  slab('L0', r, 1, 22, FLOORC.sunroom);
  const y1 = 400;
  for (const s of sidesOf(r)) {
    const cuts = openingsOn(s, 0);
    const ax = s.A[0], az = s.A[1];
    for (let t = 0; t <= s.len; t += s.len / Math.round(s.len / 110)) { const x = ax + s.u[0] * t, z = az + s.u[1] * t; blk('L0', x - 6, x + 6, 0, y1, z - 6, z + 6, PAL.walnut, { cam: false }); }
    let c = 0;
    const pane = (t0, t1) => { if (t1 - t0 < 2) return; const x0 = ax + s.u[0] * t0, z0 = az + s.u[1] * t0, x1 = ax + s.u[0] * t1, z1 = az + s.u[1] * t1; blk('L0', Math.min(x0, x1) - 2, Math.max(x0, x1) + 2, 20, y1, Math.min(z0, z1) - 2, Math.max(z0, z1) + 2, PAL.glass, { kind: 'glass', cam: false }); blk('L0', Math.min(x0, x1) - 5, Math.max(x0, x1) + 5, 0, 20, Math.min(z0, z1) - 5, Math.max(z0, z1) + 5, PAL.walnut, { cam: false }); };
    for (const [a, b] of cuts) { pane(c, a); c = b; }
    pane(c, s.len);
    blk('L0', Math.min(ax, ax + s.u[0] * s.len) - 8, Math.max(ax, ax + s.u[0] * s.len) + 8, y1, y1 + 16, Math.min(az, az + s.u[1] * s.len) - 8, Math.max(az, az + s.u[1] * s.len) + 8, PAL.walnut, { collide: false });
  }
  /* a pitched glass roof on walnut rafters */
  const cz = (r.z0 + r.z1) / 2, half = (r.z1 - r.z0) / 2, L = Math.hypot(half, 220), th = Math.atan2(220, half);
  for (const sg of [-1, 1]) {
    const geo = new THREE.BoxGeometry(r.x1 - r.x0 + 20, 4, L);
    geo.rotateX(sg * th); geo.translate((r.x0 + r.x1) / 2, y1 + 16 + 110, cz + sg * half / 2);
    shape('L0', geo, PAL.glass, { kind: 'glass' });
    for (let x = r.x0; x <= r.x1; x += 110) { const g2 = new THREE.BoxGeometry(8, 10, L); g2.rotateX(sg * th); g2.translate(x, y1 + 16 + 112, cz + sg * half / 2); shape('L0', g2, PAL.walnut); }
  }
  blk('L0', r.x0 - 10, r.x1 + 10, y1 + 232, y1 + 244, cz - 8, cz + 8, PAL.walnut, { collide: false });
}
