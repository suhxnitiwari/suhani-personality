/* The visit: her house as a dollhouse you tour yourself. From outside it opens like a real dollhouse, whichever side
   faces you swinging away; tap a room and you step inside at eye level. Three.js draws it; everything else is here. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { COLS, Grid, materials, bake, rayBox, PAL } from './kit.js';
import { buildShell } from './shell.js';
import { buildGrounds } from './grounds.js';
import { furnish } from './furnish.js';

const $ = s => document.querySelector(s);
const clampN = THREE.MathUtils.clamp;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(pointer: coarse)').matches;
const narrow = () => innerWidth < 760;

/* ---------- renderer, sky, light ---------- */
const canvas = $('#view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
let pixelRatio = Math.min(devicePixelRatio, touch ? 1.75 : 2);
renderer.setPixelRatio(pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#EAD7C2', 7000, 22000);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
scene.environmentIntensity = .32;

/* a golden-hour dome: blue overhead, peach at the horizon */
{
  const geo = new THREE.SphereGeometry(30000, 32, 16), col = [], c = new THREE.Color();
  const stops = [[-1, '#7E8A5E'], [-.02, '#E9D9BF'], [.03, '#F4C9AE'], [.12, '#EFD7C4'], [.4, '#C9D3D9'], [1, '#8FB0CC']];
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 30000;
    let k = 0; while (k < stops.length - 2 && y > stops[k + 1][0]) k++;
    const [y0, c0] = stops[k], [y1, c1] = stops[k + 1], t = clampN((y - y0) / (y1 - y0), 0, 1);
    c.set(c0).lerp(new THREE.Color(c1), t); col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -1; scene.add(sky);
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(900, 32), new THREE.MeshBasicMaterial({ color: '#FFF1D6', fog: false, transparent: true, opacity: .9 }));
  sunDisc.position.set(-15000, 4200, 9000); sunDisc.lookAt(0, 0, 0); scene.add(sunDisc);
}
scene.add(new THREE.HemisphereLight('#FFF0DC', '#CDBB9E', 1.15));
const sun = new THREE.DirectionalLight('#FFE0B5', 2.4);
const SUN = new THREE.Vector3(-1500, 2300, 1000).normalize();
sun.castShadow = true;
sun.shadow.mapSize.set(touch ? 2048 : 4096, touch ? 2048 : 4096);
Object.assign(sun.shadow.camera, { left: -3000, right: 3000, top: 3000, bottom: -3000, near: 100, far: 12000 });
sun.shadow.bias = -.0006; sun.shadow.normalBias = 6;
sun.target.position.set(-200, 0, -900); sun.position.copy(SUN).multiplyScalar(5000).add(sun.target.position);
scene.add(sun, sun.target);

/* ---------- build the house ---------- */
const groups = {};
for (const k of ['L0', 'L1', 'L2', 'roof', 'out']) { groups[k] = new THREE.Group(); groups[k].name = k; scene.add(groups[k]); }
buildShell();
buildGrounds();
const stopMeta = furnish();
const triangles = bake(groups, materials(), scene);
const grid = new Grid(COLS);
const shown = {};                       // layer name -> visible
for (const k in groups) shown[k] = true;

/* the front door: a forest-green leaf on a hinge that swings in when you come near */
const doorPivot = new THREE.Group();
{
  doorPivot.position.set(-1150, 0, -6);
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(200, 336, 10), new THREE.MeshStandardMaterial({ color: PAL.forest, roughness: .6 }));
  leaf.position.set(100, 168, 0); leaf.castShadow = true; doorPivot.add(leaf);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(7, 10, 8), new THREE.MeshStandardMaterial({ color: PAL.brassLt, metalness: .8, roughness: .3 }));
  knob.position.set(176, 160, 9); doorPivot.add(knob);
  for (const y of [70, 250]) { const p = new THREE.Mesh(new THREE.BoxGeometry(150, 110, 4), new THREE.MeshStandardMaterial({ color: '#2E3B2C', roughness: .7 })); p.position.set(100, y + 10, 6); doorPivot.add(p); }
  /* the wreath, hung on the leaf so it swings in with the door */
  const wreath = new THREE.Mesh(new THREE.TorusGeometry(32, 8, 6, 20), new THREE.MeshStandardMaterial({ color: PAL.moss, roughness: .9 }));
  wreath.scale.z = .6; wreath.position.set(100, 236, 13); wreath.castShadow = true; doorPivot.add(wreath);
  for (let k = 0; k < 9; k++) {
    const a = k / 9 * Math.PI * 2, b = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 6), new THREE.MeshStandardMaterial({ color: k % 3 ? PAL.blush : PAL.ivory, roughness: .8 }));
    b.position.set(100 + Math.cos(a) * 32, 236 + Math.sin(a) * 32, 19); doorPivot.add(b);
  }
  (groups['L0:S'] || groups.L0).add(doorPivot);
}
const doorCol = { x0: -1150, x1: -950, y0: 0, y1: 336, z0: -14, z1: 2, layer: 'L0:S', cam: false, off: false };
COLS.push(doorCol);
const grid2 = new Grid([doorCol]);
let doorOpen = 0;

/* ---------- you: a pair of eyes and a little room to turn round in ---------- */
const P = { x: -1050, y: 0, z: 700, vx: 0, vz: 0, vy: 0, grounded: true };
const R = 30, HEIGHT = 186, STEP = 38, G = 2600, WALK = 250, RUN = 460, TOUR = 270, EYEH = 160;

function nearCols(x0, x1, z0, z1) { const s = grid.near(x0, x1, z0, z1); for (const c of grid2.near(x0, x1, z0, z1)) s.add(c); return s; }
function push(x, z, y, step = STEP) {
  for (let it = 0; it < 3; it++) {
    for (const c of nearCols(x - R - 2, x + R + 2, z - R - 2, z + R + 2)) {
      if (c.off || c.y1 <= y + step || c.y0 >= y + HEIGHT) continue;
      const px = Math.max(c.x0, Math.min(x, c.x1)), pz = Math.max(c.z0, Math.min(z, c.z1)), dx = x - px, dz = z - pz, d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      if (d2 > 1e-6) { const d = Math.sqrt(d2); x = px + dx / d * R; z = pz + dz / d * R; }
      else {
        const pen = [[x - c.x0 + R, -1, 0], [c.x1 - x + R, 1, 0], [z - c.z0 + R, 0, -1], [c.z1 - z + R, 0, 1]].sort((a, b) => a[0] - b[0])[0];
        x += pen[1] * pen[0]; z += pen[2] * pen[0];
      }
    }
  }
  return [clampN(x, -6000, 6000), clampN(z, -6000, 6000)];
}
function groundAt(x, z, y, step = STEP) {
  let g = 0;
  const r = R * .55;
  for (const c of nearCols(x - r, x + r, z - r, z + r)) {
    if (c.off || c.y1 > y + step + .5 || c.y1 <= g) continue;
    if (x + r < c.x0 || x - r > c.x1 || z + r < c.z0 || z - r > c.z1) continue;
    g = c.y1;
  }
  return g;
}

/* ---------- the stops: a small brass diamond floats over each, gold until you've opened it, sage after ---------- */
function clearSpot(x, z, floor, tx, tz) {
  const m = R + 22, free = (x, z) => { for (const c of grid.near(x - m, x + m, z - m, z + m)) { if (c.y1 <= floor + STEP || c.y0 >= floor + HEIGHT) continue; if (x + m > c.x0 && x - m < c.x1 && z + m > c.z0 && z - m < c.z1) return false; } return Math.abs(groundAt(x, z, floor) - floor) < 4; };
  if (free(x, z)) return [x, z];
  for (let r = 30; r < 400; r += 30) for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
    if (Math.hypot(px - tx, pz - tz) > 120 && areaAt(px, pz, floor) === areaAt(x, z, floor) && free(px, pz)) return [px, pz];
  }
  return [x, z];
}
for (const n of NODES) {
  if (HELIXES.some(h => h.id === n.area) || !ROOMS[n.area] && n.area !== 'out') continue;
  const [x, z] = clearSpot(n.x, n.z, n.pf, 1e9, 1e9);
  n.x = x; n.z = z;
}
const STOPI = Object.fromEntries(STOPS.map((s, i) => [s.id, i]));
const markerGeo = new THREE.OctahedronGeometry(16, 0);
const markerMat = new THREE.MeshStandardMaterial({ color: '#E2BE7A', emissive: '#B08D57', emissiveIntensity: .7, metalness: .6, roughness: .25 });
const seenMat = new THREE.MeshStandardMaterial({ color: '#B9C29E', emissive: '#7B8060', emissiveIntensity: .45, metalness: .3, roughness: .4 });
const stopsW = STOPS.map(s => {
  const t = TARGETS[s.id], sp = stopSpot(s.id), meta = stopMeta[s.id] || {};
  const layer = t.room === 'out' || t.room === 'garden' || t.room === 'sunroom' ? 'out' : 'L' + (t.lv || 0);
  const top = meta.top ?? Math.min(sp.y + t.h / 2, sp.floor + 330);
  const mk = new THREE.Mesh(markerGeo, markerMat);
  mk.position.set(sp.x + sp.nx * 40, top + 55, sp.z + sp.nz * 40); mk.scale.y = 1.5;
  groups[layer].add(mk);
  /* where you stand to look at it */
  const d = clampN((t.minDist || 260) * .8, 180, 400);
  let vx = sp.x + sp.nx * d, vz = sp.z + sp.nz * d;
  const r = t.room === 'attic' ? { x0: -950, x1: 300, z0: -1300, z1: -60 } : ROOMS[t.room];
  if (meta.at || t.at) [vx, vz] = meta.at || t.at;
  else if (r) { vx = clampN(vx, r.x0 + 70, r.x1 - 70); vz = clampN(vz, r.z0 + 70, r.z1 - 70); }
  if (!meta.at) [vx, vz] = clearSpot(vx, vz, sp.floor, sp.x, sp.z);
  const look = [sp.x, (meta.top ? Math.min(meta.top - 40, sp.y) : sp.y), sp.z];
  const hit = { x0: sp.x - Math.max(t.w, 60) / 2 - 20, x1: sp.x + Math.max(t.w, 60) / 2 + 20, y0: sp.floor, y1: top + 90, z0: sp.z - Math.max(t.w, 60) / 2 - 20, z1: sp.z + Math.max(t.w, 60) / 2 + 20 };
  if (sp.nx) { hit.x0 = sp.x - 60; hit.x1 = sp.x + 60; } else { hit.z0 = sp.z - 60; hit.z1 = sp.z + 60; }
  return { id: s.id, sp, t, mk, layer, stand: [vx, vz, sp.floor], look, hit, base: mk.position.y };
});
/* the pose that frames a stop: standing at its spot, looking at it */
function standPose(w) {
  const [x, z, pf] = w.stand, [lx, ly, lz] = w.look, ey = pf + EYEH;
  return { x, y: ey, z, yaw: Math.atan2(lx - x, -(lz - z)), pitch: clampN(Math.atan2(ly - ey, Math.hypot(lx - x, lz - z)), -.16, .1), pf };
}

/* ---------- the camera: a dollhouse orbit from outside, or your own eyes inside ---------- */
const camera = new THREE.PerspectiveCamera(60, 1, 10, 40000);
const fwd = (yaw, pitch) => [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
const HOUSE = [-150, 520, -600];
const orbit = { yaw: .22, pitch: -.13, r: 5200, want: 5200 };
let floorShown = 3;                     // 3: the whole house, roof on. 0-2: that storey and everything below it
const view = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, fov: 34 };
let planOn = false;                     // the floor plan: the dollhouse seen from straight above, one storey at a time
let mode = 'front', flight = null;               // front: the finished house from outside. doll: opened up. walk: inside
const look = { yaw: Math.PI, pitch: -.04 };          // where your eyes point when you're inside
const fitR = () => { const a = innerWidth / innerHeight;
  /* the floor plan fits the whole footprint, porch to closet, with a margin for the floor buttons */
  if (planOn) return Math.max(2900 / (2 * Math.tan(17 * Math.PI / 180)), 4100 / (2 * Math.tan(17 * Math.PI / 180) * a)) * 1.08;
  const wide = narrow() ? 1 : (innerWidth - 320) / innerWidth; return Math.max(4300 / (2 * Math.tan(17 * Math.PI / 180) * a * wide), 2600 / (2 * Math.tan(17 * Math.PI / 180))) * (floorShown < 3 ? .82 : 1); };
const dollPose = () => {
  const t = planOn ? [0, floorShown * LH, -320] : floorShown < 3 ? [HOUSE[0], floorShown * LH + 120, -500] : HOUSE, f = fwd(orbit.yaw, orbit.pitch);
  return { x: t[0] - f[0] * orbit.r, y: t[1] - f[1] * orbit.r, z: t[2] - f[2] * orbit.r, yaw: orbit.yaw, pitch: orbit.pitch, fov: 34 };
};
const walkPose = () => ({ x: P.x, y: P.y + EYEH, z: P.z, yaw: look.yaw, pitch: look.pitch, fov: narrow() ? 68 : 56 });
function fly(to, dur, done, onStep, o = {}) { flight = { from: { ...view }, to, dur: still ? .01 : dur, t: 0, done, onStep, ...o }; }
/* a few flights one after another, each picking up where the last left off */
function flySeq(steps, done) {
  const next = i => { if (i >= steps.length) return done && done(); const s = steps[i]; s.start && s.start(); fly(s.to, s.dur, () => next(i + 1), s.step, { lv: s.lv, noCull: s.noCull }); };
  next(0);
}
function stepFlight(dt) {
  const f = flight;
  f.t = Math.min(f.dur, f.t + dt);
  const k = f.t / f.dur, e = -(Math.cos(Math.PI * k) - 1) / 2;
  for (const p of ['x', 'y', 'z', 'pitch', 'fov']) view[p] = THREE.MathUtils.lerp(f.from[p], f.to[p] ?? f.from[p], e);
  view.yaw = f.from.yaw + Math.atan2(Math.sin(f.to.yaw - f.from.yaw), Math.cos(f.to.yaw - f.from.yaw)) * e;
  f.onStep && f.onStep(k);
  if (k >= 1) { flight = null; f.done && f.done(); }
}
/* the panel takes the right of the screen, so the view slides left to keep the stop in sight */
let offX = 0, offY = 0;
function placeCamera(dt) {
  camera.position.set(view.x, view.y, view.z);
  const f = fwd(view.yaw, view.pitch);
  camera.lookAt(view.x + f[0], view.y + f[1], view.z + f[2]);
  const panelIn = document.body.classList.contains('has-panel');
  const wantX = panelIn && !narrow() ? 235 : mode !== 'walk' && !narrow() && !planOn ? -150 : 0, wantY = panelIn && narrow() ? innerHeight * .22 : 0;
  const k = Math.min(1, dt * 5);
  offX += (wantX - offX) * k; offY += (wantY - offY) * k;
  if (Math.abs(offX) > .5 || Math.abs(offY) > .5) camera.setViewOffset(innerWidth, innerHeight, offX, offY, innerWidth, innerHeight); else camera.clearViewOffset();
  if (Math.abs(camera.fov - view.fov) > .01) camera.fov = view.fov;
  camera.updateProjectionMatrix();
}
const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); if (mode !== 'walk' && !flight) orbit.r = orbit.want = fitR(); };
addEventListener('resize', resize); resize();

/* ---------- what's drawn: inside you see everything; outside, the walls facing you swing away like a dollhouse front ---------- */
const OUT = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
function applyVisibility() {
  const fl = flight && flight.lv != null ? flight : null, doll = mode === 'doll' || !!fl;
  const cx = view.x - HOUSE[0], cz = view.z - HOUSE[2], cl = Math.hypot(cx, cz) || 1;
  for (const k in groups) {
    let on = true;
    if (doll) {
      if (k === 'roof') on = !fl && floorShown === 3;
      else if (k[0] === 'L') {
        const lv = +k[1];
        on = lv <= (fl ? fl.lv : Math.min(floorShown, 2));
        const d = k.split(':')[1];
        if (on && d && !(fl && fl.noCull)) on = (OUT[d][0] * cx + OUT[d][1] * cz) / cl < .28;
      }
    }
    shown[k] = on;
    groups[k].visible = on;
  }
  doorPivot.visible = shown['L0:S'] !== false;
}

/* ---------- walking: on your own, or somewhere on purpose along the house's route graph ---------- */
const keys = new Set();
let stick = { x: 0, y: 0 }, auto = null;
function physics(dt) {
  const f = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - stick.y;
  const st = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0) + stick.x;
  const turn = (keys.has('arrowright') ? 1 : 0) - (keys.has('arrowleft') ? 1 : 0);
  if (turn) look.yaw += turn * 1.8 * dt;
  const sy = Math.sin(look.yaw), cy = Math.cos(look.yaw);
  let fx = sy * f + cy * st, fz = -cy * f + sy * st, mag = Math.hypot(fx, fz);
  const running = keys.has('shift') || Math.hypot(stick.x, stick.y) > .92;
  if (mag > .05) { auto = null; fx /= Math.max(1, mag); fz /= Math.max(1, mag); mag = Math.min(1, mag); }
  else if (auto) { [fx, fz] = steer(); mag = Math.hypot(fx, fz); }
  const speed = (auto ? TOUR : running ? RUN : WALK) * mag;
  P.vx += (fx * speed - P.vx) * Math.min(1, 5 * dt);
  P.vz += (fz * speed - P.vz) * Math.min(1, 5 * dt);
  /* in a stairwell you can always step up out onto the floor, so a step off the stair's edge never traps you */
  const step = inWell(P.x, P.z) ? HEIGHT - 10 : STEP;
  const [nx, nz] = push(P.x + P.vx * dt, P.z + P.vz * dt, P.y, step);
  P.x = nx; P.z = nz;
  const yPrev = P.y;
  P.vy -= G * dt; P.y += P.vy * dt;
  const g = groundAt(P.x, P.z, Math.max(yPrev, P.y), step);
  if (P.y <= g) { P.y = g; P.vy = 0; P.grounded = true; }
  else if (P.grounded && yPrev - g <= STEP + 2) { P.y = g; P.vy = 0; }
  else P.grounded = false;
  if (P.y < -400) Object.assign(P, { x: -1050, y: 0, z: 700, vy: 0 });
}
/* the route graph knows the doors and stairs; between two of its waypoints on the same floor,
   a fine grid finds the way round the furniture */
const inWell = (x, z) => HELIXES.some(h => Math.abs(x - h.cx) < h.r + R + 10 && Math.abs(z - h.cz) < h.r + R + 10);
const onStair = (x, z) => HELIXES.some(h => Math.hypot(x - h.cx, z - h.cz) < h.r + 30);
function freeAt(x, z, pf, r = R + 3) {
  for (const c of grid.near(x - r, x + r, z - r, z + r)) {
    if (c.off || c.y1 <= pf + STEP || c.y0 >= pf + HEIGHT) continue;
    const px = Math.max(c.x0, Math.min(x, c.x1)), pz = Math.max(c.z0, Math.min(z, c.z1));
    if ((x - px) ** 2 + (z - pz) ** 2 < r * r) return false;
  }
  return Math.abs(groundAt(x, z, pf) - pf) < 6;
}
const ROOMY = R + 26;                    // how much room a path leaves round the furniture, so you never brush past a lamp
function legClear(a, b, pf, r = ROOMY) {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 18));
  for (let i = 1; i < n; i++) if (!freeAt(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n, pf, r)) return false;
  return true;
}
function gridPath(a, b, pf, room = ROOMY) {
  const S = 14, pad = 480, x0 = Math.min(a[0], b[0]) - pad, z0 = Math.min(a[1], b[1]) - pad;
  const W = Math.ceil((Math.max(a[0], b[0]) + pad - x0) / S), H2 = Math.ceil((Math.max(a[1], b[1]) + pad - z0) / S);
  const cell = (x, z) => [Math.round((x - x0) / S), Math.round((z - z0) / S)], at = (i, k) => [x0 + i * S, z0 + k * S];
  const ok = new Map(), free = (i, k) => { const key = i * 4096 + k; if (!ok.has(key)) { const [x, z] = at(i, k); ok.set(key, i >= 0 && k >= 0 && i <= W && k <= H2 && freeAt(x, z, pf, room)); } return ok.get(key); };
  const [si, sk] = cell(a[0], a[1]), [ti, tk] = cell(b[0], b[1]);
  const open = [[0, si, sk]], g = new Map([[si * 4096 + sk, 0]]), from = new Map();
  let found = false, guard = 0;
  while (open.length && guard++ < 60000) {
    let bi = 0; for (let j = 1; j < open.length; j++) if (open[j][0] < open[bi][0]) bi = j;
    const [, i, k] = open.splice(bi, 1)[0];
    if (Math.abs(i - ti) <= 1 && Math.abs(k - tk) <= 1) { from.set(ti * 4096 + tk, i * 4096 + k); found = true; break; }
    for (const [di, dk] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const ni = i + di, nk = k + dk, key = ni * 4096 + nk;
      if (!free(ni, nk) && !(Math.abs(ni - si) <= 1 && Math.abs(nk - sk) <= 1)) continue;
      const ng = g.get(i * 4096 + k) + Math.hypot(di, dk);
      if (ng < (g.get(key) ?? Infinity)) { g.set(key, ng); from.set(key, i * 4096 + k); open.push([ng + Math.hypot(ti - ni, tk - nk), ni, nk]); }
    }
  }
  if (!found) return null;
  const pts = [];
  for (let key = ti * 4096 + tk; key != null && key !== si * 4096 + sk; key = from.get(key)) pts.unshift(at(Math.floor(key / 4096), key % 4096));
  /* pull the string tight: keep only the corners you can't see past */
  const out = [a]; let cur = a;
  for (let j = 0; j < pts.length; j++) if (!legClear(cur, pts[j + 1] || b, pf, room)) { out.push(pts[j]); cur = pts[j]; }
  out.push(b);
  return out.slice(1);
}
function plan(x, z, pf) {
  const { pts } = route(P.x, P.z, P.y, x, z, pf);
  const raw = [...pts, [x, z, pf]];
  const path = [];
  let prev = [P.x, P.z], prevPf = P.y;
  for (const p of raw) {
    const ppf = p[2] ?? prevPf, flat = Math.abs(ppf - prevPf) < 20 && !onStair(prev[0], prev[1]) && !onStair(p[0], p[1]);
    if (flat && !legClear(prev, p, ppf)) { const g = gridPath(prev, p, ppf) || gridPath(prev, p, ppf, R + 1); if (g) { path.push(...g.slice(0, -1)); } }
    path.push([p[0], p[1]]);
    prev = p; prevPf = ppf;
  }
  return path;
}
function walkTo(x, z, pf, done, face) {
  auto = { path: plan(x, z, pf), i: 0, done, face, stuck: 0, replans: 0, last: [P.x, P.z], pf, goal: [x, z] };
}
function steer() {
  const a = auto, [tx, tz] = a.path[a.i], dx = tx - P.x, dz = tz - P.z, d = Math.hypot(dx, dz), last = a.i === a.path.length - 1;
  if (d < (last ? 22 : 70)) {
    if (!last) { a.i++; return steer(); }
    auto = null;
    if (a.face) faceTo = a.face;
    a.done && a.done();
    return [0, 0];
  }
  const s = last ? Math.min(1, d / 90 + .25) : 1;
  return [dx / d * s, dz / d * s];
}
let faceTo = null;
function autoWatch(dt) {
  if (!auto) return;
  const a = auto;
  /* your eyes turn the way you're walking */
  /* your eyes lead a little ahead along the path, turning slowly, the way you'd look round a room you're walking into */
  const ahead = a.path[Math.min(a.i + (Math.hypot(a.path[a.i][0] - P.x, a.path[a.i][1] - P.z) < 160 ? 1 : 0), a.path.length - 1)];
  const left = Math.hypot(a.path[a.path.length - 1][0] - P.x, a.path[a.path.length - 1][1] - P.z);
  if (Math.hypot(ahead[0] - P.x, ahead[1] - P.z) > 40 && (left > 140 || !a.face)) { const want = Math.atan2(ahead[0] - P.x, -(ahead[1] - P.z)); look.yaw += Math.atan2(Math.sin(want - look.yaw), Math.cos(want - look.yaw)) * Math.min(1, dt * 1.5); }
  else if (a.face) { look.yaw += Math.atan2(Math.sin(a.face.yaw - look.yaw), Math.cos(a.face.yaw - look.yaw)) * Math.min(1, dt * 1.5); }
  look.pitch += ((left < 200 && a.face ? a.face.pitch : -.05) - look.pitch) * Math.min(1, dt * 1.5);
  /* if something's in the way, aim for the next waypoint instead; only in a real tangle, a soft fade (never a hop through a wall) */
  a.stuck += dt;
  if (Math.hypot(P.x - a.last[0], P.z - a.last[1]) > 30) { a.stuck = 0; a.last = [P.x, P.z]; }
  if (a.stuck > 1.4 && a.replans < 2) { a.path = plan(a.goal[0], a.goal[1], a.pf); a.i = 0; a.replans++; a.stuck = 0; }
  else if (a.stuck > 3) { const end = a.path[a.path.length - 1], done = a.done, face = a.face; auto = null; teleport({ x: end[0], z: end[1], pf: a.pf ?? P.y, yaw: face ? face.yaw : look.yaw, pitch: face ? face.pitch : look.pitch }, done); }
}
const blink = $('#blink');
function teleport(pose, then) {
  blink.classList.add('on');
  setTimeout(() => {
    Object.assign(P, { x: pose.x, z: pose.z, y: pose.pf, vx: 0, vz: 0, vy: 0, grounded: true });
    look.yaw = pose.yaw; look.pitch = pose.pitch;
    blink.classList.remove('on');
    then && then();
  }, still ? 0 : 260);
}

/* ---------- the panels: the stops, their words and their little games ---------- */
const panel = $('#panel'), pBody = $('#pBody');
let cur = -1, panelTick = null, panelTimer = null, autoplay = false, autoT = null;
let seen = new Set();
try { seen = new Set(JSON.parse(localStorage.getItem('house-seen-3') || '[]')); } catch {}
const remember = id => { seen.add(id); try { localStorage.setItem('house-seen-3', JSON.stringify([...seen])); } catch {} paintMarkers(); };
let audio = null, soundOn = true;
try { soundOn = localStorage.getItem('house-sound') !== 'off'; } catch {}
window.chime = (notes, vol = .07) => {
  if (!soundOn) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audio.currentTime;
    notes.forEach((f, i) => {
      const o = audio.createOscillator(), g = audio.createGain(), t = t0 + i * .09;
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + 1.1);
      o.connect(g).connect(audio.destination); o.start(t); o.stop(t + 1.2);
    });
  } catch {}
};
const soundBtn = $('#soundBtn');
const paintSound = () => { soundBtn.setAttribute('aria-pressed', soundOn); soundBtn.classList.toggle('off', !soundOn); };
soundBtn.onclick = () => { soundOn = !soundOn; try { localStorage.setItem('house-sound', soundOn ? 'on' : 'off'); } catch {} paintSound(); };
paintSound();

const api = { frame: () => {}, fps: () => fps, seen: () => seen.size };
window.HOUSE_STATS = () => ({ blocks: COLS.length, triangles: Math.round(triangles) });
function openPanel(i, sub) {
  const s = STOPS[i];
  cur = i;
  clearInterval(panelTick);
  $('#pKicker').textContent = `${i + 1} / ${STOPS.length} · ${s.kicker}`;
  $('#pTitle').innerHTML = s.title;
  pBody.innerHTML = s.build(sub);
  pBody.scrollTop = 0;
  $('#pNext').textContent = (s.next || 'Next stop') + ' →';
  $('#pPrev').hidden = i === 0;
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('in'));
  panelTick = s.init ? s.init(pBody, sub, api) : null;
  remember(s.id); paintTour();
  document.body.classList.add('has-panel');
  chime([587.33, 783.99], .045);
  clearTimeout(autoT);
  if (autoplay) autoT = setTimeout(() => autoplay && goTo((cur + 1) % STOPS.length), 9000);
}
function closePanel() {
  clearInterval(panelTick); panelTick = null;
  panel.classList.remove('in');
  document.body.classList.remove('has-panel');
  clearTimeout(panelTimer);
  panelTimer = setTimeout(() => { if (!panel.classList.contains('in')) panel.hidden = true; }, 350);
}
let welcomed = false, exploring = false;
const isOpen = () => !panel.hidden && panel.classList.contains('in');
/* go to a stop: from the dollhouse, swoop in; inside, walk if it's near and blink if it's across the house */
function goTo(i, sub) {
  if (i < 0 || i >= STOPS.length) return;
  start();
  const w = stopsW[i], pose = standPose(w);
  closePanel(); toggleMap(false); cur = i; paintTour();
  if (w.id === 'door' || w.t.lv === 0) openFront();
  const open = () => openPanel(i, sub);
  const arrive = () => { open(); if (w.id === 'door' && !welcomed) { welcomed = true; setTimeout(() => caption('Welcome in', 'Take your shoes off.', 4200), 500); } };
  if (mode !== 'walk') return swoopIn(pose, arrive);
  if (Math.round(pose.pf / LH) !== walkLv() || Math.hypot(pose.x - P.x, pose.z - P.z) > 1400) { auto = null; return teleport(pose, arrive); }
  walkTo(pose.x, pose.z, pose.pf, arrive, pose);
}
$('#pClose').onclick = () => closePanel();
pBody.addEventListener('pointerdown', () => setAuto(false));
$('#pNext').onclick = () => goTo((cur + 1) % STOPS.length);
$('#pPrev').onclick = () => goTo(cur - 1);
$('#nextBtn').onclick = () => { setAuto(false); goTo(nextUnseen()); };
const nextUnseen = () => { for (let k = 1; k <= STOPS.length; k++) { const j = (cur + k + STOPS.length) % STOPS.length; if (!seen.has(STOPS[j].id) || seen.size === STOPS.length) return j; } return 0; };
const playBtn = $('#playBtn');
function setAuto(on) {
  if (autoplay === on) return;
  autoplay = on; clearTimeout(autoT);
  playBtn.setAttribute('aria-pressed', on);
  playBtn.querySelector('span').textContent = on ? 'Pause' : 'Play tour';
  if (on) goTo(cur < 0 || cur >= STOPS.length - 1 ? 0 : cur + 1);
}
playBtn.onclick = e => { e.stopPropagation(); setAuto(!autoplay); };

/* tour dots, the floor plan, the list of stops */
const dots = $('#dots'), stopList = $('#stopList'), map = $('#map');
dots.innerHTML = STOPS.map(() => '<i></i>').join('');
const roomName = id => ROOMS[id] ? ROOMS[id].name : 'The front garden';
stopList.innerHTML = STOPS.map((s, i) => `<li><button data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${strip(s.title)}<small>${roomName(TARGETS[s.id].room)}</small></button></li>`).join('');
stopList.querySelectorAll('button').forEach(b => b.onclick = () => goTo(+b.dataset.i));
const MO = L => [L * 3600, 0];
map.setAttribute('viewBox', '-2100 -2950 10900 4000');
map.innerHTML = [0, 1, 2].map(L => { const [a, b] = MO(L); return `<text class="m-floor" x="${a - 1960}" y="${b - 2780}">${FLOORS[L]}</text>`; }).join('') +
  Object.entries(ROOMS).filter(([id]) => id !== 'attic').map(([id, r]) => { const [a, b] = MO(r.lv); return `<g class="m-room" data-room="${id}" tabindex="0" role="button" aria-label="${r.name}"><rect x="${r.x0 + a}" y="${r.z0 + b}" width="${r.x1 - r.x0}" height="${r.z1 - r.z0}"/><text x="${(r.x0 + r.x1) / 2 + a}" y="${(r.z0 + r.z1) / 2 + b + 30}">${r.name.replace('The ', '').replace('Her ', '')}</text></g>`; }).join('') +
  stopsW.map((w, i) => { const [a, b] = MO(w.t.lv || 0); return `<circle class="m-stop" data-i="${i}" cx="${w.sp.x + a}" cy="${w.sp.z + b}" r="46"/>`; }).join('') +
  `<g id="mMe"><path d="M0 -110 L70 60 L0 28 L-70 60 Z"/></g>`;
const mMe = $('#mMe');
map.querySelectorAll('.m-room').forEach(g => {
  const go = () => enterRoom(g.dataset.room);
  g.onclick = go; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
});
function paintTour() {
  [...dots.children].forEach((d, i) => { d.classList.toggle('seen', seen.has(STOPS[i].id)); d.classList.toggle('cur', i === cur); });
  map.querySelectorAll('.m-stop').forEach(c => c.classList.toggle('seen', seen.has(STOPS[+c.dataset.i].id)));
  stopList.querySelectorAll('button').forEach((b, i) => { b.classList.toggle('seen', seen.has(STOPS[i].id)); b.classList.toggle('cur', i === cur); });
  $('#mapCount').textContent = `${seen.size} of ${STOPS.length} stops`;
  $('#nextName').textContent = '· ' + strip(STOPS[nextUnseen()].title).split(/\. |\?/)[0].replace(/\.$/, '');
  $('#found').textContent = `${seen.size}/${STOPS.length}`;
}
function paintMarkers() { for (const w of stopsW) w.mk.material = seen.has(w.id) ? seenMat : markerMat; }
const mapPanel = $('#mapPanel'), mapBtn = $('#mapBtn');
function toggleMap(show = mapPanel.hidden) { mapPanel.hidden = !show; mapBtn.setAttribute('aria-expanded', show); }
mapBtn.onclick = () => toggleMap();
paintTour(); paintMarkers();

/* ---------- modes: the dollhouse from outside, the walk-through inside ---------- */
const modeBtns = [...document.querySelectorAll('.modes button')], floorBtns = [...document.querySelectorAll('#levels button')];
const walkLv = () => clampN(Math.floor((P.y + 40) / LH), 0, 2);
function paintMode() {
  modeBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.m === (planOn ? 'plan' : mode)));
  paintLevels(true);
  document.body.classList.toggle('overhead', mode !== 'walk');
  document.body.classList.toggle('planview', planOn);
  document.body.dataset.mode = mode;
  $('#hint .h-over').textContent = mode === 'front' ? 'Drag to walk round it · tap the house to open it up' : 'Drag to turn · scroll to zoom · tap a room to step inside';
}
/* the dollhouse, or with a storey given, the floor plan: that storey from straight above, north up */
function toDoll(lvPlan) {
  const wantPlan = lvPlan != null;
  if (mode === 'doll' && !flight && planOn === wantPlan && (!wantPlan || floorShown === lvPlan)) return;
  start(); closePanel(); toggleMap(false); auto = null; setAuto(false);
  const outside = mode !== 'walk' || ['out', 'garden'].includes(areaAt(P.x, P.z, P.y)), lv = clampN(Math.round(P.y / LH), 0, 2);
  if (wantPlan) floorShown = lvPlan; else if (planOn) floorShown = 3;
  mode = 'doll'; planOn = wantPlan; paintMode();
  orbit.yaw = wantPlan ? 0 : view.yaw; orbit.pitch = wantPlan ? -1.45 : -.36; orbit.r = orbit.want = fitR();
  /* rise straight up out of the room, the storeys above lifted away, then drift back to see the whole house */
  const steps = outside ? [] : [{ to: { ...view, y: P.y + 1150, pitch: -1.2, fov: 40 }, dur: wantPlan ? 1.4 : 2.2, lv, noCull: true }];
  steps.push({ to: dollPose(), dur: wantPlan ? 1.6 : 2.6 });
  flySeq(steps);
}
const planLv = () => mode === 'walk' ? walkLv() : floorShown < 3 ? floorShown : 0;
/* back outside to the finished house, walls and roof on, seen from the front walk */
function toFront() {
  if (mode === 'front' && !flight) return;
  start(); closePanel(); toggleMap(false); auto = null; setAuto(false);
  const back = () => { mode = 'front'; planOn = false; floorShown = 3; paintMode(); orbit.yaw = .22; orbit.pitch = -.13; orbit.r = orbit.want = fitR(); fly(dollPose(), 3); };
  /* from inside, you walk back out through the front door and down the path before stepping back to look at it */
  if (mode === 'walk' && !['out', 'garden'].includes(areaAt(P.x, P.z, P.y))) { openFront(); walkTo(-1050, 900, 0, back); return; }
  back();
}
/* into the house, the way a person arrives: the house closes back up, you come down to the front walk at eye level,
   and walk up the path and in through the front door, then on through the house to wherever you were going */
function swoopIn(pose, done) {
  auto = null;
  /* from the opened-up dollhouse, you drop straight down into the room you picked, the storeys above lifted away */
  if (mode === 'doll' && pose && !['out', 'garden'].includes(areaAt(pose.x, pose.z, pose.pf))) {
    const lv = clampN(Math.round(pose.pf / LH), 0, 2), b = 450, fov = walkPose().fov;
    const eye = { x: pose.x, y: pose.pf + EYEH, z: pose.z, yaw: pose.yaw, pitch: pose.pitch, fov };
    const over = { ...eye, x: pose.x - Math.sin(pose.yaw) * b, z: pose.z + Math.cos(pose.yaw) * b, y: pose.pf + 1150, pitch: -1.2, fov: 40 };
    const land = () => {
      mode = 'walk'; floorShown = 3; Object.assign(P, { x: pose.x, z: pose.z, y: pose.pf, vx: 0, vz: 0, vy: 0 });
      look.yaw = pose.yaw; look.pitch = pose.pitch; paintMode(); done && done();
    };
    return flySeq([{ to: over, dur: 2, lv, noCull: true }, { to: eye, dur: 1.6, lv, noCull: true }], land);
  }
  if (mode === 'doll') { mode = 'front'; floorShown = 3; paintMode(); }
  const street = { x: -1050, y: EYEH, z: 1180, yaw: 0, pitch: -.03, fov: walkPose().fov };
  const land = () => {
    mode = 'walk'; Object.assign(P, { x: street.x, z: street.z, y: 0, vx: 0, vz: 0, vy: 0 }); look.yaw = 0; look.pitch = -.03; paintMode();
    if (pose) walkTo(pose.x, pose.z, pose.pf, done, pose); else done && done();
  };
  fly(street, 3.4, land);
}
function enterRoom(id) {
  const i = exploring ? -1 : STOPS.findIndex(s => TARGETS[s.id].room === id);
  if (i >= 0) return goTo(i);
  const r = ROOMS[id]; if (!r) return;
  start(); toggleMap(false); closePanel();
  const pose = roomPose(id);
  if (mode !== 'walk') return swoopIn(pose);
  /* another floor, or the far side of the house: blink there, the way the stops do, rather than a long walk */
  if (r.lv !== walkLv() || Math.hypot(pose.x - P.x, pose.z - P.z) > 1400) { auto = null; return teleport(pose, () => caption(r.sub, r.name)); }
  walkTo(pose.x, pose.z, pose.pf);
}
/* rooms whose length isn't the best view: the attic wraps round the music room, so you arrive at its open east end */
const ARRIVE_AT = { attic: { x: 150, z: -450, yaw: -Math.PI / 2 } };
function roomPose(id) {
  const r = ROOMS[id], a = ARRIVE_AT[id];
  if (a) { const [x, z] = clearSpot(a.x, a.z, r.lv * LH, 1e9, 1e9); return { x, z, pf: r.lv * LH, y: r.lv * LH + EYEH, yaw: a.yaw, pitch: -.08 }; }
  /* stand near one end and look down the room's length, so you arrive seeing the whole of it, not a wall */
  const alongX = r.x1 - r.x0 > r.z1 - r.z0;
  let x = alongX ? r.x0 + (r.x1 - r.x0) * .18 : (r.x0 + r.x1) / 2, z = alongX ? (r.z0 + r.z1) / 2 : r.z0 + (r.z1 - r.z0) * .18;
  [x, z] = clearSpot(x, z, r.lv * LH, 1e9, 1e9);
  return { x, z, pf: r.lv * LH, y: r.lv * LH + EYEH, yaw: alongX ? Math.PI / 2 : Math.PI, pitch: -.08 };
}
function setFloor(f) {
  floorShown = f; paintMode();
  if (mode !== 'doll') return toDoll();
  orbit.pitch = f < 3 ? -.72 : -.36; orbit.r = orbit.want = fitR();
  fly(dollPose(), .9);
}
modeBtns.forEach(b => b.onclick = () => { setAuto(false); const m = b.dataset.m; if (m === 'doll') toDoll(); else if (m === 'plan') toDoll(planLv()); else if (m === 'front') toFront(); else if (mode !== 'walk') goTo(cur >= 0 ? cur : 1); });
/* the floors, like a lift's buttons: inside they take you straight to that storey; from above they show it */
const ARRIVE = ['living', 'uphall', 'attic'];         // upstairs, the hall: the landing's arrival spot is the stairwell's edge
function goFloor(f) {
  if (f > 2 || f === walkLv() && !auto) return;
  auto = null; closePanel();
  const id = ARRIVE[f];
  teleport(roomPose(id), () => caption(ROOMS[id].sub, ROOMS[id].name));
}
floorBtns.forEach(b => b.onclick = () => {
  setAuto(false); const f = +b.dataset.f;
  if (mode === 'walk') goFloor(f);
  else if (planOn) f < 3 ? toDoll(f) : toDoll();
  else setFloor(f);
});
let levelsKey = '';
function paintLevels(force) {
  const on = mode === 'walk' ? walkLv() : floorShown, key = mode + planOn + on;
  if (key === levelsKey && !force) return;
  levelsKey = key;
  floorBtns.forEach(b => b.setAttribute('aria-pressed', +b.dataset.f === on));
}
/* the floor plan's labels: every room on the storey you're looking down on, tap one to drop into it */
const planLabels = $('#planLabels');
planLabels.innerHTML = Object.entries(ROOMS).map(([id, r]) => `<button data-room="${id}" data-lv="${r.lv}">${r.name.replace(/^(The|Her) /, '')}</button>`).join('');
const planBtns = [...planLabels.children], pv = new THREE.Vector3();
planBtns.forEach(b => {
  b.onclick = () => enterRoom(b.dataset.room);
  b.onpointerenter = () => { hoverRoom = b.dataset.room; };
  b.onpointerleave = () => { hoverRoom = null; };
});
function placeLabels() {
  const on = planOn && !flight;
  planLabels.classList.toggle('on', on);
  if (!on) return;
  for (const b of planBtns) {
    const r = ROOMS[b.dataset.room];
    if (r.lv !== floorShown) { b.hidden = true; continue; }
    const c = LABEL_AT[b.dataset.room] || [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2];
    /* on a phone, a room drawn narrower than its name keeps quiet (it's still a tap away), so small rooms don't pile up */
    pv.set(r.x0, r.lv * LH + 10, c[1]).project(camera); const left = pv.x;
    pv.set(r.x1, r.lv * LH + 10, c[1]).project(camera); const wide = (pv.x - left) / 2 * innerWidth;
    pv.set(c[0], r.lv * LH + 10, c[1]).project(camera);
    b.hidden = false;
    if (!b._w) b._w = b.offsetWidth;
    if (narrow() && b._w > wide - 6 && !LABEL_AT[b.dataset.room]) { b.hidden = true; continue; }
    b.style.transform = `translate(${((pv.x + 1) / 2 * innerWidth).toFixed(1)}px, ${((1 - pv.y) / 2 * innerHeight).toFixed(1)}px) translate(-50%, -50%)`;
  }
}
/* the attic room wraps round the music room, so its name sits in the open part */
const LABEL_AT = { attic: [-300, -400] };
/* the room under your pointer from above: its floor washed in ivory, its walls traced in brass */
const hlMat = new THREE.MeshBasicMaterial({ color: PAL.ivory, transparent: true, opacity: .4, depthTest: false, depthWrite: false });
const hlEdge = new THREE.MeshBasicMaterial({ color: PAL.brass, depthTest: false, depthWrite: false });
const hlPlane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
const hl = new THREE.Group(), hlFill = new THREE.Mesh(hlPlane, hlMat), hlSides = [0, 1, 2, 3].map(() => new THREE.Mesh(hlPlane, hlEdge));
hl.add(hlFill, ...hlSides); hl.children.forEach(m => { m.renderOrder = 20; }); hl.visible = false; scene.add(hl);
function paintHighlight(t) {
  const r = mode === 'doll' && !flight && hoverRoom ? ROOMS[hoverRoom] : null;
  hl.visible = !!r;
  if (!r) return;
  const w = r.x1 - r.x0, d = r.z1 - r.z0, e = 16, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
  hl.position.set(0, r.lv * LH + 6, 0);
  hlFill.position.set(cx, 0, cz); hlFill.scale.set(w, 1, d);
  [[cx, r.z0, w, e], [cx, r.z1, w, e], [r.x0, cz, e, d], [r.x1, cz, e, d]].forEach(([x, z, sx, sz], i) => { hlSides[i].position.set(x, 1, z); hlSides[i].scale.set(sx, 1, sz); });
  hlMat.opacity = still ? .4 : .34 + Math.sin(t * 3) * .1;
}

/* ---------- the prompt: walk up to a marker inside, or point at a room from outside ---------- */
const prompt = $('#prompt');
let near = null, hoverRoom = null, hoverHouse = false;
function nearest() {
  let best = null, bd = 340;
  for (const w of stopsW) {
    if (Math.abs(P.y - w.sp.floor) > 150) continue;
    const d = Math.min(Math.hypot(P.x - w.sp.x, P.z - w.sp.z), Math.hypot(P.x - w.stand[0], P.z - w.stand[1]) + 40);
    if (d < bd) { bd = d; best = w; }
  }
  return best;
}
function paintPrompt() {
  let key = null, title = '', kicker = '';
  if (mode === 'front' && !flight && hoverHouse) { key = 'house'; title = 'The Suhani House'; kicker = 'Tap to open it up like a dollhouse'; }
  else if (mode === 'doll' && !flight && hoverRoom) { key = 'room:' + hoverRoom; const r = ROOMS[hoverRoom]; title = r.name; kicker = r.sub + ' · tap to step inside'; }
  else if (mode === 'walk' && !flight && !isOpen() && !auto && !exploring) { const n = nearest(); if (n) { key = n.id; const s = STOPS[STOPI[n.id]]; title = s.title; kicker = s.kicker; } }
  if (key === near) return;
  near = key;
  if (!key) { prompt.classList.remove('on'); return; }
  prompt.querySelector('b').innerHTML = title;
  prompt.querySelector('small').textContent = kicker;
  prompt.classList.toggle('room', key.startsWith('room:'));
  prompt.classList.add('on');
}
const use = () => { if (!near) return; if (near === 'house') return toDoll(); if (near.startsWith('room:')) return enterRoom(near.slice(5)); const w = stopsW[STOPI[near]], p = standPose(w); faceTo = p; openPanel(STOPI[near]); };
prompt.onclick = () => use();

/* ---------- the front door swings in when you come close ---------- */
function openFront() { doorCol.off = true; }
function doorTick(dt) {
  if (Math.hypot(P.x + 1050, P.z - 20) < 380) doorCol.off = true;
  const want = doorCol.off ? 1 : 0;
  if (want && doorOpen < .02 && started) chime([523.25, 659.25, 783.99], .05);
  doorOpen += (want - doorOpen) * Math.min(1, dt * 3);
  doorPivot.rotation.y = doorOpen * 1.4;
}

/* ---------- input: keys, mouse, touch ---------- */
let started = false;
const typing = e => /input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable;
addEventListener('keydown', e => {
  if (!started) { if (e.key === 'Enter') { e.preventDefault(); knock(); } return; }
  if (e.key === 'Escape') { if (!mapPanel.hidden) toggleMap(false); else if (isOpen()) closePanel(); else if (mode === 'walk') toDoll(); return; }
  if (typing(e) || e.metaKey || e.ctrlKey) return;
  const k = e.key.toLowerCase();
  if (k === 'm') { toggleMap(); return; }
  if (k === 'n') { goTo(nextUnseen()); return; }
  if (mode !== 'walk') return;
  if ((k === 'e' || k === 'enter') && near && !isOpen()) { use(); e.preventDefault(); return; }
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
    if (panel.contains(document.activeElement) && k.startsWith('arrow')) return;
    keys.add(k); setAuto(false);
    if (k !== 'shift' && isOpen() && /^[wasd]$|arrowup|arrowdown/.test(k)) closePanel();
    e.preventDefault();
  }
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());

const pointers = new Map();
let drag = null, pinch = null;
canvas.addEventListener('pointerdown', e => {
  if (!started) return;
  setAuto(false);
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), r: orbit.want }; drag = null; return; }
  drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId };
});
canvas.addEventListener('pointermove', e => {
  if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()], f = fitR(); orbit.want = clampN(pinch.r * pinch.d / Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)), f * .35, f * 1.6); return; }
  if (!drag || drag.id !== e.pointerId) { hover(e); return; }
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
  if (drag.moved < 6) return;
  canvas.classList.add('dragging');
  if (mode !== 'walk') { if (flight) return; orbit.yaw -= dx * .005; orbit.pitch = clampN(orbit.pitch - dy * .004, mode === 'front' ? -.7 : -1.45, mode === 'front' ? -.03 : -.06); return; }
  auto = null;
  const k = 1.2 / (innerHeight / (2 * Math.tan(camera.fov * Math.PI / 360)));
  look.yaw -= dx * k; look.pitch = clampN(look.pitch + dy * k, -1.1, 1.1);
});
const endPointer = e => {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (!drag || drag.id !== e.pointerId) return;
  const d = drag; drag = null; canvas.classList.remove('dragging');
  if (d.moved < 6 && e.type === 'pointerup') tap(e.clientX, e.clientY);
};
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('wheel', e => {
  if (!started) return;
  e.preventDefault();
  if (mode !== 'walk') { const f = fitR(); orbit.want = clampN(orbit.want * Math.exp(e.deltaY * .0011), f * .35, f * 1.6); return; }
  auto = null;
  const s = clampN(-e.deltaY, -120, 120) * 1.6, [nx, nz] = push(P.x + Math.sin(look.yaw) * s, P.z - Math.cos(look.yaw) * s, P.y);
  P.x = nx; P.z = nz;
}, { passive: false });

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function rayFrom(cx, cy) { ndc.set(cx / innerWidth * 2 - 1, -cy / innerHeight * 2 + 1); ray.setFromCamera(ndc, camera); return [[ray.ray.origin.x, ray.ray.origin.y, ray.ray.origin.z], [ray.ray.direction.x, ray.ray.direction.y, ray.ray.direction.z]]; }
function pickStop(o, d, maxT) {
  let best = null, bt = maxT;
  for (const w of stopsW) {
    if (!shown[w.layer] || exploring) continue;
    const m = w.mk.position, s = mode === 'doll' ? 70 : 40, mb = { x0: m.x - s, x1: m.x + s, y0: m.y - s, y1: m.y + s, z0: m.z - s, z1: m.z + s };
    for (const b of mode !== 'walk' ? (w.mk.visible ? [mb] : []) : [w.hit]) { const h = rayBox(o, d, b, bt); if (h && h.t < bt) { bt = h.t; best = w; } }
  }
  return best;
}
function pickSolid(o, d) {
  let best = null, bt = 40000;
  for (const c of COLS) {
    if (c.off || !shown[c.layer]) continue;
    const h = rayBox(o, d, c, bt);
    if (h && h.t < bt) { bt = h.t; best = { c, h }; }
  }
  if (!best) { if (d[1] < 0) { const t = -o[1] / d[1]; if (t < 40000) return { x: o[0] + d[0] * t, y: 0, z: o[2] + d[2] * t, t, floor: true }; } return null; }
  return { x: o[0] + d[0] * bt, y: o[1] + d[1] * bt, z: o[2] + d[2] * bt, t: bt, floor: best.h.axis === 1 && best.h.sign === -1 };
}
/* from outside, which room is under the pointer: where the ray first meets the house, then that storey's plan */
function roomUnder(cx, cy) {
  const [o, d] = rayFrom(cx, cy), hit = pickSolid(o, d);
  if (!hit) return null;
  const lv = clampN(Math.floor((hit.y + 30) / LH), 0, 2), a = areaAt(hit.x, hit.z, lv * LH);
  return ROOMS[a] && a !== 'garden' ? a : a === 'garden' ? 'garden' : null;
}
let hoverT = 0;
function hover(e) {
  if (touch || !started) return;
  const now = performance.now(); if (now - hoverT < 50) return; hoverT = now;
  const [o, d] = rayFrom(e.clientX, e.clientY), f = pickSolid(o, d), s = pickStop(o, d, f ? f.t + 1 : 40000);
  hoverRoom = mode === 'doll' && !s ? roomUnder(e.clientX, e.clientY) : null;
  hoverHouse = mode === 'front' && !!f && (inFoot(f.x, f.z) || f.y > 40) && Math.hypot(f.x + 200, f.z + 300) < 2600;
  canvas.classList.toggle('hot', !!s || !!hoverRoom || hoverHouse);
}
function tap(cx, cy) {
  const [o, d] = rayFrom(cx, cy), f = pickSolid(o, d), s = pickStop(o, d, f ? f.t + 1 : 40000);
  if (s) return goTo(STOPI[s.id]);
  if (mode === 'front') { if (f && (inFoot(f.x, f.z) || f.y > 40) && Math.hypot(f.x + 200, f.z + 300) < 2600) toDoll(); return; }
  if (mode === 'doll') { const r = roomUnder(cx, cy); if (r) enterRoom(r); return; }
  if (f && f.floor && Math.abs(f.y - P.y) < 260) {
    if (isOpen()) closePanel();
    ripple(cx, cy);
    walkTo(f.x, f.z, f.y);
  }
}
const ripple = (x, y) => { const r = document.createElement('i'); r.className = 'ripple'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.append(r); setTimeout(() => r.remove(), 700); };

/* the touch thumbstick, for walking inside */
const stickEl = $('#stick'), nub = stickEl.querySelector('i');
let stickId = null, stickO = null;
stickEl.addEventListener('pointerdown', e => { stickId = e.pointerId; stickEl.setPointerCapture(e.pointerId); const r = stickEl.getBoundingClientRect(); stickO = [r.left + r.width / 2, r.top + r.height / 2]; moveStick(e); setAuto(false); auto = null; if (isOpen()) closePanel(); });
const moveStick = e => { if (e.pointerId !== stickId) return; let dx = (e.clientX - stickO[0]) / 50, dy = (e.clientY - stickO[1]) / 50; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } stick = { x: dx, y: dy }; nub.style.transform = `translate(${dx * 34}px, ${dy * 34}px)`; };
stickEl.addEventListener('pointermove', moveStick);
const endStick = e => { if (e.pointerId !== stickId) return; stickId = null; stick = { x: 0, y: 0 }; nub.style.transform = ''; };
stickEl.addEventListener('pointerup', endStick); stickEl.addEventListener('pointercancel', endStick);

/* ---------- captions, and the intro: the dollhouse turning slowly at golden hour ---------- */
const capEl = $('#caption');
let capT = null, areaNow = null;
function caption(k, t, ms = 2600) { capEl.querySelector('.cap-k').textContent = k; capEl.querySelector('.cap-t').textContent = t; capEl.classList.add('on'); clearTimeout(capT); capT = setTimeout(() => capEl.classList.remove('on'), ms); }
function roomCaption() {
  if (mode !== 'walk' || flight) return;
  const a = areaAt(P.x, P.z, P.y);
  if (a === areaNow) return;
  areaNow = a;
  if (ROOMS[a]) caption(ROOMS[a].sub, ROOMS[a].name);
}
const intro = $('#intro');
function start() {
  if (started) return;
  started = true;
  intro.classList.add('gone'); document.body.classList.add('live');
  setTimeout(() => intro.remove(), 900);
  if (touch) { const help = $('#help'); help.classList.add('on'); setTimeout(() => help.classList.remove('on'), 7000); }
}
function knock() { start(); chime([392, 392], .09); setTimeout(() => goTo(0), 300); }
$('#knock').onclick = knock;
/* just explore: the stops, panels and tour step aside, and you're left inside the front door to wander */
const exploreBtn = $('#exploreBtn');
function setExplore(on) {
  exploring = on; exploreBtn.setAttribute('aria-pressed', on); document.body.classList.toggle('explore', on);
  if (!on) return;
  start(); setAuto(false); closePanel(); toggleMap(false); openFront();
  if (mode !== 'walk') swoopIn({ x: -1050, z: -170, pf: 0, y: EYEH, yaw: 0, pitch: -.04 }, () => caption('Who she makes room for', 'The Living Room'));
}
exploreBtn.onclick = () => setExplore(!exploring);
$('#exploreIntro').onclick = () => setExplore(true);
$('#tourBtn').onclick = () => { start(); toDoll(); };
$('#skip').onclick = () => { start(); openFront(); goTo(STOPI.circle); };
{
  const slug = $('#slug'), text = 'Austin, Texas · golden hour';
  let i = 0;
  if (still) { slug.textContent = text; intro.classList.add('t1', 't2'); }
  else { const t = setInterval(() => { slug.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(t); intro.classList.add('t1'); setTimeout(() => intro.classList.add('t2'), 700); } }, 36); }
}

/* ---------- the loop ---------- */
let last = performance.now(), fps = 60, frames = 0, fpsT = last, slowFor = 0, tClock = 0;
orbit.r = orbit.want = fitR();
Object.assign(view, dollPose());
paintMode();
const loop = now => {
  requestAnimationFrame(loop);
  const dt = Math.min(.05, (now - last) / 1000); last = now; tClock += dt;
  if (++frames, now - fpsT > 1000) {
    fps = Math.round(frames * 1000 / (now - fpsT)); frames = 0; fpsT = now;
    /* if the device is struggling, draw at a lower resolution rather than stutter */
    slowFor = fps < 38 ? slowFor + 1 : 0;
    if (slowFor >= 4 && pixelRatio > Math.min(devicePixelRatio, 1.5)) { pixelRatio = Math.max(Math.min(devicePixelRatio, 1.5), pixelRatio - .25); renderer.setPixelRatio(pixelRatio); resize(); slowFor = 0; }
  }
  if (!started) orbit.yaw = .22 + Math.sin(now / 9000) * .18;
  if (mode === 'walk' && !flight) {
    for (let s = 0, n = Math.ceil(dt / (1 / 120)); s < n; s++) physics(dt / n);
    autoWatch(dt);
    if (faceTo && !auto) {
      const dy = Math.atan2(Math.sin(faceTo.yaw - look.yaw), Math.cos(faceTo.yaw - look.yaw)), k = Math.min(1, dt * 2.2);
      look.yaw += dy * k; look.pitch += (faceTo.pitch - look.pitch) * k;
      if (Math.abs(dy) < .005 && Math.abs(faceTo.pitch - look.pitch) < .005) faceTo = null;
    }
    Object.assign(view, walkPose());
  }
  if (flight) stepFlight(dt);
  else if (mode !== 'walk') {
    if (started && !drag && !still) orbit.yaw += 0;
    orbit.r += (orbit.want - orbit.r) * Math.min(1, dt * 6);
    Object.assign(view, dollPose());
  }
  doorTick(dt);
  if (planOn && mode !== 'doll') { planOn = false; paintMode(); }
  applyVisibility();
  roomCaption();
  placeCamera(dt);
  paintPrompt();
  paintLevels();
  placeLabels();
  paintHighlight(tClock);
  /* the haze starts just past the house wherever the camera is, so a tall phone's high floor plan stays crisp */
  scene.fog.near = Math.max(7000, Math.hypot(view.x - HOUSE[0], view.y - HOUSE[1], view.z - HOUSE[2]) - 1000); scene.fog.far = scene.fog.near + 15000;
  /* the markers bob and turn, a little larger from outside so you can find them */
  const ms = mode === 'doll' && !flight ? 2.4 : .8;
  /* markers only from outside, and only for the stops you haven't opened yet: inside, a stop offers itself as you walk up */
  for (const w of stopsW) { w.mk.visible = mode === 'doll' && !flight && !seen.has(w.id) && !exploring; w.mk.position.y = w.base + (still ? 0 : Math.sin(tClock * 2 + w.base) * 8) + (ms > 1 ? 40 : 0); w.mk.rotation.y = still ? 0 : tClock * 1.4; w.mk.scale.set(ms, ms * 1.5, ms); }
  mMe.setAttribute('transform', `translate(${(P.x + MO(clampN(Math.floor((P.y + 40) / LH), 0, 2))[0]).toFixed(0)} ${P.z.toFixed(0)}) rotate(${(look.yaw * 180 / Math.PI).toFixed(1)})`);
  renderer.render(scene, camera);
};
renderer.compile(scene, camera);
requestAnimationFrame(loop);
window.__house = { P, look, orbit, view, renderer, scene, goTo, toDoll, setFloor, enterRoom, stopsW, COLS, start, get mode() { return mode; } };
