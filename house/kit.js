/* The kit: every piece of the house is a soft block, painted with a colour per vertex and merged into a handful of meshes,
   so a whole storey costs the GPU one draw call. Everything solid also leaves a box behind for the player to bump into. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* her palette: wine and brass, olive and cream, walnut for grounding. No hot pink anywhere in the house */
export const PAL = {
  ivory: '#F5EFE3', cream: '#E8DDC8', paper: '#F3EBDD', linen: '#E9DFCC', stone: '#DCCFB6', limestone: '#E6DCC8',
  walnut: '#51382D', walnutDk: '#3B271F', walnutLt: '#6B4A39', oak: '#B98B5E', honey: '#A8774F', plank: '#C29A6B',
  olive: '#7B8060', sage: '#9AA383', forest: '#394837', moss: '#5E6846', leaf: '#6F7A50', lawn: '#8C9868', lawnDk: '#7B8659',
  rose: '#B97979', blush: '#EBC5C7', shell: '#F1DEDB', clay: '#C99B98', oxblood: '#713C3B', wine: '#6B2C3A', plum: '#5A404D',
  brass: '#B08D57', brassLt: '#D4B47A', ochre: '#C8913A', marigold: '#D99A2B', indigo: '#3E4A6B', terracotta: '#B8664A',
  slate: '#4A4F48', charcoal: '#2E2A28', tile: '#E6E0D4', mint: '#CFDCD3', glass: '#CFE3E6', warm: '#FFE2A8', white: '#FBF7EF'
};
const C = new THREE.Color();
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

const BUCKETS = new Map();           // layer|kind -> geometries
export const COLS = [];              // colliders: axis-aligned boxes
export const LAYERS = ['L0', 'L1', 'L2', 'roof', 'out'];

/* paint a geometry: one colour, or one per box face (+x -x +y -y +z -z), with a whisper of hand-made variation */
function paint(geo, color, faces, jitter = .035) {
  const n = geo.attributes.position.count, arr = new Float32Array(n * 3);
  const j = 1 + (rnd() - .5) * 2 * jitter;
  const set = (i, c) => { C.set(c); arr[i * 3] = C.r * j; arr[i * 3 + 1] = C.g * j; arr[i * 3 + 2] = C.b * j; };
  if (faces && geo.groups.length === 6) {
    const order = ['px', 'nx', 'py', 'ny', 'pz', 'nz'], idx = geo.index;
    geo.groups.forEach((g, k) => { const c = faces[order[k]] || color; for (let i = g.start; i < g.start + g.count; i++) set(idx ? idx.getX(i) : i, c); });
  } else for (let i = 0; i < n; i++) set(i, color);
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}
function bank(layer, kind, geo) {
  if (geo.index) geo = geo.toNonIndexed();
  for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'color'].includes(k)) geo.deleteAttribute(k);
  geo.clearGroups();
  const key = layer + '|' + kind;
  if (!BUCKETS.has(key)) BUCKETS.set(key, []);
  BUCKETS.get(key).push(geo);
}
export function collider(x0, x1, y0, y1, z0, z1, layer, o = {}) {
  const c = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), y0: Math.min(y0, y1), y1: Math.max(y0, y1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), layer, cam: o.cam !== false, off: false };
  COLS.push(c);
  return c;
}

/* an axis-aligned block by its extents. o: faces, kind (solid | glass | glow | metal), collide, cam (does it stop the camera) */
export function blk(layer, x0, x1, y0, y1, z0, z1, color, o = {}) {
  const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0), d = Math.abs(z1 - z0);
  if (w < .5 || h < .5 || d < .5) return null;
  const geo = o.round ? new RoundedBoxGeometry(w, h, d, 2, Math.min(o.round, w / 2.2, h / 2.2, d / 2.2)) : new THREE.BoxGeometry(w, h, d);
  paint(geo, color, o.round ? null : o.faces, o.jitter);
  geo.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  bank(layer, o.kind || 'solid', geo);
  return o.collide === false ? null : collider(x0, x1, y0, y1, z0, z1, layer, o);
}
/* a block by its centre and size, turned about the vertical. Turned blocks only collide when told to (as their upright box) */
export function piece(layer, x, y, z, w, h, d, color, o = {}) {
  const geo = o.round ? new RoundedBoxGeometry(w, h, d, 2, Math.min(o.round, w / 2.2, h / 2.2, d / 2.2)) : new THREE.BoxGeometry(w, h, d);
  paint(geo, color, o.round ? null : o.faces, o.jitter);
  if (o.rx) geo.rotateX(o.rx);
  if (o.rz) geo.rotateZ(o.rz);
  if (o.ry) geo.rotateY(o.ry);
  geo.translate(x, y + h / 2, z);
  bank(layer, o.kind || 'solid', geo);
  if (o.collide) {
    const q = Math.abs(Math.sin(o.ry || 0)) > .7, hw = (q ? d : w) / 2, hd = (q ? w : d) / 2;
    return collider(x - hw, x + hw, y, y + h, z - hd, z + hd, layer, { cam: false, ...o });
  }
  return null;
}
/* soft round things: columns, pots, lamp globes, tree crowns */
export function cyl(layer, x, y, z, rTop, rBot, h, color, o = {}) {
  const geo = new THREE.CylinderGeometry(rTop, rBot, h, o.seg || 12, 1, !!o.open);
  paint(geo, color, null, o.jitter);
  if (o.rx) geo.rotateX(o.rx);
  if (o.rz) geo.rotateZ(o.rz);
  if (o.ry) geo.rotateY(o.ry);
  geo.translate(x, y + (o.rx || o.rz ? 0 : h / 2), z);
  bank(layer, o.kind || 'solid', geo);
  if (o.collide) { const r = Math.max(rTop, rBot) * .85; collider(x - r, x + r, y, y + h, z - r, z + r, layer, { cam: false, ...o }); }
}
export function ball(layer, x, y, z, r, color, o = {}) {
  const geo = o.detail === 's' ? new THREE.SphereGeometry(r, 14, 10) : new THREE.IcosahedronGeometry(r, o.detail ?? 1);
  paint(geo, color, null, o.jitter ?? .06);
  if (o.sy || o.sx || o.sz) geo.scale(o.sx || 1, o.sy || 1, o.sz || 1);
  geo.translate(x, y, z);
  bank(layer, o.kind || 'solid', geo);
  if (o.collide) collider(x - r, x + r, y - r * (o.sy || 1), y + r * (o.sy || 1), z - r, z + r, layer, { cam: false });
}
export function cone(layer, x, y, z, r, h, color, o = {}) {
  const geo = new THREE.ConeGeometry(r, h, o.seg || 8);
  paint(geo, color, null, o.jitter);
  if (o.ry) geo.rotateY(o.ry);
  geo.translate(x, y + h / 2, z);
  bank(layer, o.kind || 'solid', geo);
}
/* any custom geometry, already placed */
export function shape(layer, geo, color, o = {}) { paint(geo, color, null, o.jitter); bank(layer, o.kind || 'solid', geo); }
/* a thin wall-like run from (ax, az) to (bx, bz), for things that aren't square to the house. Collides as a row of posts */
export function run(layer, ax, az, bx, bz, y0, y1, t, color, o = {}) {
  const L = Math.hypot(bx - ax, bz - az), a = Math.atan2(bz - az, bx - ax);
  const geo = new THREE.BoxGeometry(L, y1 - y0, t);
  paint(geo, color, null, o.jitter);
  geo.rotateY(-a);
  geo.translate((ax + bx) / 2, (y0 + y1) / 2, (az + bz) / 2);
  bank(layer, o.kind || 'solid', geo);
  if (o.collide !== false) {
    const n = Math.max(1, Math.ceil(L / 24));
    for (let i = 0; i <= n; i++) { const x = ax + (bx - ax) * i / n, z = az + (bz - az) * i / n; collider(x - 12, x + 12, y0, y1, z - 12, z + 12, layer, { cam: o.cam !== false }); }
  }
}

/* ---------- materials, and turning the buckets into meshes ---------- */
export function materials() {
  return {
    solid: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .86, metalness: 0 }),
    metal: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .32, metalness: .65 }),
    glass: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .08, metalness: .1, transparent: true, opacity: .32, depthWrite: false }),
    glow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })
  };
}
export function bake(groups, mats, scene) {
  let tris = 0;
  for (const [key, geos] of BUCKETS) {
    const [layer, kind] = key.split('|');
    const geo = mergeGeometries(geos, false);
    geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, mats[kind]);
    m.castShadow = kind === 'solid' || kind === 'metal';
    m.receiveShadow = kind !== 'glow';
    if (kind === 'glass') m.renderOrder = 2;
    if (!groups[layer]) { groups[layer] = new THREE.Group(); groups[layer].name = layer; scene.add(groups[layer]); }
    groups[layer].add(m);
    tris += geo.attributes.position.count / 3;
    geos.forEach(g => g.dispose());
  }
  BUCKETS.clear();
  return tris;
}

/* ---------- picking and the camera's line of sight: a ray against the boxes ---------- */
export function rayBox(o, d, b, tMax) {
  let t0 = 0, t1 = tMax, axis = -1, sign = 0;
  for (const [k, lo, hi] of [[0, b.x0, b.x1], [1, b.y0, b.y1], [2, b.z0, b.z1]]) {
    if (Math.abs(d[k]) < 1e-9) { if (o[k] < lo || o[k] > hi) return null; continue; }
    let a = (lo - o[k]) / d[k], c = (hi - o[k]) / d[k], s = -1;
    if (a > c) { [a, c] = [c, a]; s = 1; }
    if (a > t0) { t0 = a; axis = k; sign = s; }
    if (c < t1) t1 = c;
    if (t0 > t1) return null;
  }
  return { t: t0, axis, sign };
}

/* a spatial hash so the player only checks the boxes near them */
export class Grid {
  constructor(cols, cell = 240) {
    this.cell = cell; this.map = new Map();
    for (const c of cols) for (let i = Math.floor(c.x0 / cell); i <= Math.floor(c.x1 / cell); i++) for (let k = Math.floor(c.z0 / cell); k <= Math.floor(c.z1 / cell); k++) {
      const key = i * 4096 + k;
      if (!this.map.has(key)) this.map.set(key, []);
      this.map.get(key).push(c);
    }
  }
  near(x0, x1, z0, z1) {
    const out = new Set(), s = this.cell;
    for (let i = Math.floor(x0 / s); i <= Math.floor(x1 / s); i++) for (let k = Math.floor(z0 / s); k <= Math.floor(z1 / s); k++) { const a = this.map.get(i * 4096 + k); if (a) for (const c of a) out.add(c); }
    return out;
  }
}
