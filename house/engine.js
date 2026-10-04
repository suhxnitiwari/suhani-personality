/* The engine: a first-person camera made of CSS transforms. No WebGL, no libraries.
   World units are CSS pixels. x runs east, z runs south (toward the street), y runs down.
   Heights you stand at are kept as "feet" (pf), measured up from the ground floor. */
const $ = s => document.querySelector(s);
const H = 440, LH = 480, EYE = 215, DH = 300, T = 8;        // room height, storey height, eye, door height, half wall
const ATTIC = 2 * LH, EAVE = ATTIC + 200, RIDGE = EAVE + 720;   // two full storeys, then an attic under a steep roof
const RAD = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const lvY = lv => -lv * LH;                                   // the y of a storey's floor
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

const scene = $('#scene'), camEl = $('#cam'), world = $('#world'), sky = $('#sky');

/* ---------- building blocks ---------- */
const place = (n, x, y, z, ry = 0, rx = 0, rz = 0) => {
  n.style.transform = `translate3d(${x}px,${y}px,${z}px)` + (ry ? ` rotateY(${ry}deg)` : '') + (rx ? ` rotateX(${rx}deg)` : '') + (rz ? ` rotateZ(${rz}deg)` : '');
};
/* a flat rectangle centred on (x, y, z); ry turns it about the vertical, rx tips it (90 = a floor facing up) */
function plane(parent, w, h, x, y, z, ry = 0, rx = 0, cls = '', html = '', rz = 0) {
  const d = document.createElement('div');
  d.className = 'pl ' + cls;
  d.style.width = w + 'px'; d.style.height = h + 'px';
  d.style.marginLeft = -w / 2 + 'px'; d.style.marginTop = -h / 2 + 'px';
  place(d, x, y, z, ry, rx, rz);
  if (html) d.innerHTML = html;
  parent.appendChild(d);
  return d;
}
function group(parent, x = 0, y = 0, z = 0, ry = 0, cls = '') {
  const g = document.createElement('div');
  g.className = 'grp ' + cls;
  place(g, x, y, z, ry);
  parent.appendChild(g);
  return g;
}
/* furniture: a box standing on a floor (base = that floor's height), w along x, d along z, h tall, turned by ry */
const SOLIDS = [];
function box(parent, { x, z, w, d, h, lift = 0, base = 0, ry = 0, cls = '', solid = true, front = '', top = '', faces = 'tfblr' }) {
  const g = group(parent, x, -base, z, ry, 'box'), cy = -(lift + h / 2);
  const f = { g };
  if (faces.includes('t')) f.top = plane(g, w, d, 0, -(lift + h), 0, 0, 90, 'bx top ' + cls, top);
  if (faces.includes('f')) f.front = plane(g, w, h, 0, cy, d / 2, 0, 0, 'bx front ' + cls, front);
  if (faces.includes('b')) f.back = plane(g, w, h, 0, cy, -d / 2, 180, 0, 'bx back ' + cls);
  if (faces.includes('r')) f.right = plane(g, d, h, w / 2, cy, 0, 90, 0, 'bx side ' + cls);
  if (faces.includes('l')) f.left = plane(g, d, h, -w / 2, cy, 0, -90, 0, 'bx side ' + cls);
  if (solid && lift < 150) solidRect(x, z, w, d, ry, base);
  return f;
}
function solidRect(x, z, w, d, ry = 0, base = 0) {
  const q = Math.round(ry / 90) % 2 !== 0, hw = (q ? d : w) / 2, hd = (q ? w : d) / 2;
  SOLIDS.push({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd, hb: base, ht: base + 200 });
}

/* ---------- the plan: people at the front, the stairs tucked behind, her wing over the garage ---------- */
const WEAVE = ATTIC + 440, WRIDGE = WEAVE + 380;              // her wing rises higher, to hold a two-storey closet
const MAIN = { x0: -1700, x1: 300, z0: -1500, z1: 0 };
const WING = { x0: 300, x1: 1300, z0: -1500, z1: 900 };
const EAST = { x0: 1300, x1: 1700, z0: -350, z1: 150 };       // the pantry, and her bathroom above it
const BAYS = [
  { room: 'living', lv: 0, x0: -1550, x1: -1250, z0: 0, z1: 180 }, { room: 'living', lv: 0, x0: -850, x1: -550, z0: 0, z1: 180 },
  { room: 'guest', lv: 1, x0: -1550, x1: -1250, z0: 0, z1: 180 }, { room: 'guest', lv: 1, x0: -850, x1: -550, z0: 0, z1: 180 },
  { room: 'library', lv: 0, x0: -1450, x1: -1050, z0: -1680, z1: -1500 }, { room: 'study', lv: 1, x0: -1450, x1: -1050, z0: -1680, z1: -1500 },
  { room: 'music', lv: 2, x0: -1450, x1: -1050, z0: -1680, z1: -1500 },
  { room: 'cafe', lv: 0, x0: -880, x1: -480, z0: -1680, z1: -1500 },
  { room: 'kitchen', lv: 0, x0: 1300, x1: 1460, z0: -880, z1: -420 }
];
const TUR = { x: 150, z: 160, r: 150, ro: 162 };
const FOOT = [MAIN, WING, EAST, ...BAYS, { x0: 0, x1: 300, z0: 0, z1: 320 }];
const ROOMS = {
  living: { lv: 0, x0: -1700, x1: 300, z0: -800, z1: 0, name: 'The Living Room', sub: 'Who she makes room for' },
  library: { lv: 0, x0: -1700, x1: -950, z0: -1500, z1: -800, name: 'The Library', sub: 'Curiosity' },
  cafe: { lv: 0, x0: -950, x1: -400, z0: -1500, z1: -800, name: 'The Coffee Bar', sub: 'Next to the books' },
  halfbath: { lv: 0, x0: -400, x1: -120, z0: -1060, z1: -800, name: 'The Half Bath', sub: 'A little jewel box' },
  stairs: { lv: 0, x0: -400, x1: 300, z0: -1500, z1: -800, name: 'The Stair Hall', sub: 'Tucked away', nav: [[100, -900], [-200, -1250], [-120, -1415], [150, -1415]] },
  kitchen: { lv: 0, x0: 300, x1: 1300, z0: -1050, z1: -150, name: 'The Kitchen', sub: 'Care' },
  movie: { lv: 0, x0: 300, x1: 1300, z0: -1500, z1: -1050, name: 'The Movie Room', sub: 'Far from the books' },
  laundry: { lv: 0, x0: 300, x1: 800, z0: -150, z1: 200, name: 'The Laundry', sub: 'Clean slate' },
  mudroom: { lv: 0, x0: 800, x1: 1300, z0: -150, z1: 200, name: 'The Mudroom', sub: 'Coming home' },
  pantry: { lv: 0, x0: 1300, x1: 1700, z0: -350, z1: 150, name: 'The Pantry', sub: 'Stocked' },
  garage: { lv: 0, x0: 300, x1: 1300, z0: 200, z1: 900, name: 'The Garage', sub: 'Independence' },
  sunroom: { lv: 0, x0: -1640, x1: -760, z0: -2660, z1: -1900, name: 'The Sunroom', sub: 'Making things, with friends', glass: true },
  garden: { lv: 0, x0: -1700, x1: 1300, z0: -3150, z1: -1500, name: 'The Secret Garden', sub: 'Behind the house', open: true },
  guest: { lv: 1, x0: -1700, x1: -400, z0: -800, z1: 0, name: 'The Guest Room', sub: 'Two beds, for her people' },
  study: { lv: 1, x0: -1700, x1: -950, z0: -1500, z1: -800, name: 'The Study', sub: 'Ambition' },
  hall: { lv: 1, x0: -950, x1: -400, z0: -1100, z1: -800, name: 'The Back Hall', sub: 'Upstairs' },
  gbath: { lv: 1, x0: -950, x1: -400, z0: -1500, z1: -1100, name: 'The Guest Bath', sub: 'Fresh towels' },
  landing: { lv: 1, x0: -400, x1: 300, z0: -1500, z1: -800, name: 'The Landing', sub: 'Upstairs', nav: [[100, -900], [-250, -1200]] },
  uphall: { lv: 1, x0: -400, x1: 300, z0: -800, z1: 0, name: 'The Upstairs Hall', sub: 'Linen and light' },
  closet: { lv: 1, x0: 300, x1: 1300, z0: -1500, z1: -300, name: 'Her Closet', sub: 'Her happy place', tall: LH + H },
  bedroom: { lv: 1, x0: 300, x1: 1300, z0: -300, z1: 900, name: 'Her Bedroom', sub: 'Private softness' },
  bath: { lv: 1, x0: 1300, x1: 1700, z0: -350, z1: 150, name: 'Her Bathroom', sub: 'Ritual' },
  balcony: { lv: 1, x0: 1300, x1: 1700, z0: 150, z1: 650, name: 'Her Balcony', sub: 'Coffee, outside', open: true },
  nook: { lv: 1, x0: 0, x1: 300, z0: 10, z1: 310, name: 'The Reading Nook', sub: 'In the turret', special: true },
  music: { lv: 2, x0: -1700, x1: -950, z0: -1500, z1: -800, name: 'The Music Room', sub: 'Piano, drums, guitar, violin', special: true },
  attic: { lv: 2, x0: -1700, x1: 300, z0: -1500, z1: 0, name: 'The Attic', sub: 'The mess of her brain', special: true },
  gallery: { lv: 2, x0: 300, x1: 1300, z0: -1500, z1: -300, name: 'The Closet Gallery', sub: 'Shelves to the sky', special: true }
};
const FLOORS = ['Ground', 'Upstairs', 'Attic'];

/* doors: h doors sit in a wall that runs along x (constant z); v doors in a wall along z. bay: the wall opens into a bay window */
const DOORS = [
  { id: 'front', dir: 'h', x: -1050, z: 0, w: 200, dh: 340, lv: 0, a: 'out', b: 'living' },
  { dir: 'h', x: -1220, z: -800, w: 220, dh: 360, arch: true, lv: 0, a: 'living', b: 'library' },
  { dir: 'h', x: -680, z: -800, w: 180, dh: 340, arch: true, lv: 0, a: 'living', b: 'cafe' },
  { dir: 'h', x: -265, z: -800, w: 110, dh: 280, lv: 0, a: 'living', b: 'halfbath' },
  { dir: 'h', x: -30, z: -800, w: 180, dh: 340, lv: 0, a: 'living', b: 'stairs' },
  { dir: 'v', x: 300, z: -450, w: 440, dh: 380, arch: true, lv: 0, a: 'living', b: 'kitchen' },
  { dir: 'v', x: -950, z: -1150, w: 280, dh: 360, arch: true, lv: 0, a: 'library', b: 'cafe' },
  { dir: 'h', x: -1590, z: -1500, w: 160, dh: 320, french: true, lv: 0, a: 'garden', b: 'library' },
  { dir: 'v', x: -400, z: -1150, w: 160, lv: 0, a: 'cafe', b: 'stairs' },
  { dir: 'v', x: 300, z: -950, w: 160, lv: 0, a: 'stairs', b: 'kitchen' },
  { dir: 'v', x: 300, z: -1430, w: 120, lv: 0, a: 'stairs', b: 'movie' },
  { dir: 'h', x: 1050, z: -150, w: 160, lv: 0, a: 'kitchen', b: 'mudroom' },
  { dir: 'v', x: 800, z: 25, w: 160, lv: 0, a: 'laundry', b: 'mudroom' },
  { id: 'garagedoor', dir: 'h', x: 900, z: 200, w: 160, lv: 0, a: 'mudroom', b: 'garage' },
  { dir: 'v', x: 1300, z: -250, w: 140, lv: 0, a: 'kitchen', b: 'pantry' },
  { dir: 'v', x: 1300, z: 30, w: 140, lv: 0, a: 'mudroom', b: 'pantry' },
  { dir: 'v', x: 1300, z: 560, w: 160, lv: 0, a: 'garage', b: 'out' },
  { dir: 'v', x: 300, z: 600, w: 140, dh: 300, lv: 0, a: 'out', b: 'garage' },
  { dir: 'h', x: 1380, z: -880, w: 140, dh: 320, french: true, lv: 0, a: 'kitchen', b: 'out', manual: true },
  { dir: 'h', x: -1500, z: -1900, w: 160, dh: 320, french: true, lv: 0, a: 'garden', b: 'sunroom' },
  { id: 'gate', dir: 'v', x: -1700, z: -2200, w: 200, lv: 0, a: 'out', b: 'garden', open: true },
  { bay: true, dir: 'h', x: -1400, z: 0, w: 300, dh: H, lv: 0, a: 'out', b: 'living' },
  { bay: true, dir: 'h', x: -700, z: 0, w: 300, dh: H, lv: 0, a: 'out', b: 'living' },
  { bay: true, dir: 'h', x: -1250, z: -1500, w: 400, dh: H, lv: 0, a: 'garden', b: 'library' },
  { bay: true, dir: 'h', x: -680, z: -1500, w: 400, dh: H, lv: 0, a: 'garden', b: 'cafe' },
  { bay: true, dir: 'v', x: 1300, z: -650, w: 460, dh: H, lv: 0, a: 'kitchen', b: 'out' },
  { dir: 'v', x: -400, z: -400, w: 180, lv: 1, a: 'guest', b: 'uphall' },
  { dir: 'v', x: -400, z: -950, w: 160, lv: 1, a: 'hall', b: 'landing' },
  { dir: 'v', x: -950, z: -950, w: 180, lv: 1, a: 'study', b: 'hall' },
  { dir: 'h', x: -680, z: -1100, w: 160, lv: 1, a: 'gbath', b: 'hall' },
  { dir: 'h', x: -30, z: -800, w: 200, dh: 340, arch: true, lv: 1, a: 'landing', b: 'uphall' },
  { dir: 'v', x: 300, z: -150, w: 180, lv: 1, a: 'uphall', b: 'bedroom' },
  { dir: 'h', x: 600, z: -300, w: 260, dh: 360, arch: true, lv: 1, a: 'closet', b: 'bedroom' },
  { dir: 'v', x: 1300, z: -100, w: 180, lv: 1, a: 'bedroom', b: 'bath' },
  { dir: 'v', x: 1300, z: 400, w: 200, dh: 340, french: true, lv: 1, a: 'bedroom', b: 'balcony' },
  { dir: 'v', x: 300, z: 160, w: 140, dh: 300, arch: true, lv: 1, a: 'nook', b: 'bedroom' },
  { bay: true, dir: 'h', x: -1400, z: 0, w: 300, dh: H, lv: 1, a: 'out', b: 'guest' },
  { bay: true, dir: 'h', x: -700, z: 0, w: 300, dh: H, lv: 1, a: 'out', b: 'guest' },
  { bay: true, dir: 'h', x: -1250, z: -1500, w: 400, dh: H, lv: 1, a: 'garden', b: 'study' },
  { dir: 'h', x: -1300, z: -800, w: 200, dh: 300, lv: 2, a: 'music', b: 'attic', manual: true }
];

/* ---------- spiral stairs: books to ambition to music, the grand stair, and her closet's ---------- */
const HELIXES = [
  { id: 'spiral', cx: -1555, cz: -945, r: 140, pf0: 0, rise: 2 * LH, spin: 4 * Math.PI, a0: 0, rooms: ['library', 'study', 'music'] },
  { id: 'grand', cx: 60, cz: -1180, r: 150, pf0: 0, rise: LH, spin: 3.5 * Math.PI, a0: Math.PI / 2, rooms: ['stairs', 'landing'] },
  { id: 'closetstair', cx: 1080, cz: -1250, r: 110, pf0: LH, rise: LH, spin: 3.5 * Math.PI, a0: Math.PI, rooms: ['closet', 'gallery'] }
];
const HSQ = h => ({ x0: h.cx - h.r, x1: h.cx + h.r, z0: h.cz - h.r, z1: h.cz + h.r });
const turnOf = (h, x, z) => (((h.a0 - Math.atan2(z - h.cz, x - h.cx)) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
const helixPt = (h, u, rr) => { const a = h.a0 - u; return [h.cx + Math.cos(a) * rr, h.cz + Math.sin(a) * rr]; };
/* which holes a storey's floor has: wherever a stair passes through or arrives */
const holesAt = lv => HELIXES.filter(h => lv * LH >= h.pf0 && lv * LH <= h.pf0 + h.rise).map(HSQ);
/* a rectangle with holes cut out, as a few smaller rectangles */
function rectMinus(r, holes) {
  let out = [r];
  for (const o of holes) {
    const next = [];
    for (const a of out) {
      if (o.x1 <= a.x0 || o.x0 >= a.x1 || o.z1 <= a.z0 || o.z0 >= a.z1) { next.push(a); continue; }
      if (o.z0 > a.z0) next.push({ x0: a.x0, x1: a.x1, z0: a.z0, z1: o.z0 });
      if (o.z1 < a.z1) next.push({ x0: a.x0, x1: a.x1, z0: o.z1, z1: a.z1 });
      const z0 = Math.max(a.z0, o.z0), z1 = Math.min(a.z1, o.z1);
      if (o.x0 > a.x0) next.push({ x0: a.x0, x1: o.x0, z0, z1 });
      if (o.x1 < a.x1) next.push({ x0: o.x1, x1: a.x1, z0, z1 });
    }
    out = next;
  }
  return out;
}

/* ---------- where you can stand ---------- */
const SURF = [];
const surf = (x0, x1, z0, z1, h, area) => SURF.push({ x0, x1, z0, z1, h: typeof h === 'number' ? () => h : h, area });
SURF.push({ x0: -8000, x1: 8000, z0: -8000, z1: 8000, h: () => 0, area: 'out', outside: true });
const GALLERY = [{ x0: 300, x1: 1300, z0: -1500, z1: -1300 }, { x0: 300, x1: 500, z0: -1300, z1: -300 }, { x0: 1100, x1: 1300, z0: -1300, z1: -300 }];
const ATTICFLOOR = [{ x0: -1700, x1: 300, z0: -800, z1: -110 }, { x0: -950, x1: 300, z0: -1340, z1: -800 }, { x0: -780, x1: -170, z0: -110, z1: -20 }];
for (const id in ROOMS) {
  const r = ROOMS[id];
  if (r.special || (r.open && !r.lv)) continue;
  for (const p of rectMinus(r, holesAt(r.lv))) surf(p.x0, p.x1, p.z0, p.z1, r.lv * LH, id);
}
for (const b of BAYS) surf(b.x0, b.x1, b.z0, b.z1, b.lv * LH, b.room);
for (const p of rectMinus(ROOMS.music, holesAt(2))) surf(p.x0, p.x1, p.z0, p.z1, ATTIC, 'music');
for (const g of GALLERY) for (const p of rectMinus(g, holesAt(2))) surf(p.x0, p.x1, p.z0, p.z1, ATTIC, 'gallery');
for (const a of ATTICFLOOR) for (const p of rectMinus(a, [ROOMS.music])) surf(p.x0, p.x1, p.z0, p.z1, ATTIC, 'attic');
surf(30, 270, 40, 280, LH, 'nook');
for (const h of HELIXES) {
  for (let k = 0; k * 2 * Math.PI <= h.spin + .01; k++) SURF.push({ ...HSQ(h), area: h.id, h: (x, z) => {
    const d = Math.hypot(x - h.cx, z - h.cz), u = turnOf(h, x, z) + 2 * Math.PI * k;
    return d > 26 && d < h.r - 6 && u <= h.spin + .05 ? h.pf0 + Math.min(u, h.spin) / h.spin * h.rise : -9999;
  } });
}
const inRect = (r, x, z) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
const inFoot = (x, z) => FOOT.some(r => inRect(r, x, z));
function heightAt(x, z, pf, reach = 70) {
  let best = null, bd = reach;
  for (const s of SURF) {
    if (!inRect(s, x, z)) continue;
    if (s.outside && inFoot(x, z)) continue;
    const h = s.h(x, z), d = Math.abs(h - pf);
    if (d <= bd) { bd = d; best = h; }
  }
  return best;
}
/* which area you're in: a room on your storey, a stair you're climbing, the garden, or the street */
function areaAt(x, z, pf) {
  for (const h of HELIXES) if (inRect(HSQ(h), x, z) && pf > h.pf0 + 25 && pf < h.pf0 + h.rise - 25 && Math.hypot(x - h.cx, z - h.cz) < h.r) return h.id;
  const lv = clamp(Math.round(pf / LH), 0, 2);
  if (lv === 1 && Math.hypot(x - TUR.x, z - TUR.z) < TUR.ro) return 'nook';
  if (lv === 2) {
    if (inRect(ROOMS.music, x, z) || BAYS.some(b => b.lv === 2 && inRect(b, x, z))) return 'music';
    if (inRect(MAIN, x, z)) return 'attic';
    if (inRect(ROOMS.gallery, x, z)) return 'gallery';
  }
  for (const id in ROOMS) if (ROOMS[id].lv === lv && !ROOMS[id].special && inRect(ROOMS[id], x, z)) return id;
  for (const b of BAYS) if (b.lv === lv && inRect(b, x, z)) return b.room;
  return 'out';
}

/* ---------- walls ---------- */
/* the four inside walls of a rectangle: where each starts (on your left as you face it), which way it runs, which way it faces */
function sidesOf(r) {
  return [
    { k: 'n', ry: 0, A: [r.x0, r.z0], u: [1, 0], n: [0, 1], len: r.x1 - r.x0 },
    { k: 's', ry: 180, A: [r.x1, r.z1], u: [-1, 0], n: [0, -1], len: r.x1 - r.x0 },
    { k: 'w', ry: 90, A: [r.x0, r.z1], u: [0, -1], n: [1, 0], len: r.z1 - r.z0 },
    { k: 'e', ry: -90, A: [r.x1, r.z0], u: [0, 1], n: [-1, 0], len: r.z1 - r.z0 }
  ];
}
function openingsOn(s, lv) {
  const out = [];
  for (const d of DOORS) {
    if (d.lv !== lv) continue;
    const onLine = s.u[0] ? d.dir === 'h' && d.z === s.A[1] : d.dir === 'v' && d.x === s.A[0];
    if (!onLine) continue;
    const t = (d.x - s.A[0]) * s.u[0] + (d.z - s.A[1]) * s.u[1];
    if (t > 0 && t < s.len) out.push([t - d.w / 2, t + d.w / 2, d]);
  }
  return out.sort((a, b) => a[0] - b[0]);
}
/* one wall with its doorways cut out. lv: the storey it stands on. tall: its height. band: what it blocks */
const WALLS = [];
function wall(parent, s, cls, { offset = T, shade = 0, lv = 0, tall = H, band } = {}) {
  const cuts = openingsOn(s, lv), pieces = [], yb = lvY(lv);
  let c = 0;
  for (const [a, b, d] of cuts) { if (a > c) pieces.push([c, a, null]); pieces.push([a, b, d]); c = b; }
  if (c < s.len) pieces.push([c, s.len, null]);
  for (const [a, b, d] of pieces) {
    const t = (a + b) / 2, dh = d ? d.dh || DH : 0, hh = tall - dh;
    if (hh < 2) continue;
    const x = s.A[0] + s.u[0] * t + s.n[0] * offset, z = s.A[1] + s.u[1] * t + s.n[1] * offset;
    const p = plane(parent, b - a, hh, x, yb - dh - hh / 2, z, s.ry, 0, 'wall ' + cls);
    p.style.setProperty('--bx', -a + 'px');
    p.style.setProperty('--by', '0px');
    p.style.setProperty('--shade', shade);
    p.style.setProperty('--wh', tall + 'px');
    if (d && d.arch) archFill(parent, s, a, b, d, cls, offset, yb, shade);
    if (!d) WALLS.push({ ax: s.A[0] + s.u[0] * a, az: s.A[1] + s.u[1] * a, bx: s.A[0] + s.u[0] * b, bz: s.A[1] + s.u[1] * b, ...(band || { hb: lv * LH, ht: lv * LH + tall }) });
  }
}
/* the spandrels of a cusped Indian arch, in the top of a wide doorway */
function archFill(parent, s, a, b, d, cls, offset, yb, shade) {
  const w = b - a, ah = 120, t = (a + b) / 2;
  const x = s.A[0] + s.u[0] * t + s.n[0] * offset, z = s.A[1] + s.u[1] * t + s.n[1] * offset;
  const p = plane(parent, w, ah, x, yb - (d.dh - ah / 2), z, s.ry, 0, 'wall arch ' + cls);
  const k = 7, pts = [];
  for (let i = 0; i <= k; i++) {
    const ang = Math.PI - i * Math.PI / k, rx = w / 2 - 6, ry = ah - 8;
    pts.push([w / 2 + Math.cos(ang) * rx, ah - Math.sin(ang) * ry]);
  }
  let path = `M0 0 H${w} V${ah} H${pts[pts.length - 1][0].toFixed(1)}`;
  for (let i = pts.length - 2; i >= 0; i--) {
    const [px, py] = pts[i], [qx, qy] = pts[i + 1], mx = (px + qx) / 2, my = (py + qy) / 2, dx = qx - px, dy = qy - py, L = Math.hypot(dx, dy);
    path += ` Q${(mx + dy / L * 14).toFixed(1)} ${(my - dx / L * 14).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)}`;
  }
  path += ` H0 Z`;
  p.style.clipPath = `path('${path}')`;
  p.style.setProperty('--bx', -a + 'px'); p.style.setProperty('--by', -(d.dh - ah) + 'px');
  p.style.setProperty('--shade', shade); p.style.setProperty('--wh', H + 'px');
}
function jambs(parent, d, cls) {
  if (d.bay || d.overlook || d.open) return;
  const yb = lvY(d.lv), dh = d.dh || DH;
  if (d.dir === 'h') {
    plane(parent, 2 * T, dh, d.x - d.w / 2, yb - dh / 2, d.z, 90, 0, 'jamb ' + cls);
    plane(parent, 2 * T, dh, d.x + d.w / 2, yb - dh / 2, d.z, -90, 0, 'jamb ' + cls);
    plane(parent, d.w, 2 * T, d.x, yb - dh, d.z, 0, -90, 'jamb top ' + cls);
  } else {
    plane(parent, 2 * T, dh, d.x, yb - dh / 2, d.z - d.w / 2, 0, 0, 'jamb ' + cls);
    plane(parent, 2 * T, dh, d.x, yb - dh / 2, d.z + d.w / 2, 180, 0, 'jamb ' + cls);
    plane(parent, 2 * T, d.w, d.x, yb - dh, d.z, 90, -90, 'jamb top ' + cls);
  }
}
/* hang something flat on a wall. face is the way it looks: S looks south (so it hangs on a north wall). up is from that storey's floor */
const FACE = { S: [0, 0, 1], N: [180, 0, -1], E: [90, 1, 0], W: [-90, -1, 0] };
function mount(parent, face, line, along, up, w, h, cls, html, off = T + 3, lv = 0) {
  const [ry, nx, nz] = FACE[face];
  const x = nx ? line + nx * off : along, z = nx ? along : line + nz * off;
  return plane(parent, w, h, x, lvY(lv) - up, z, ry, 0, cls, html);
}

/* ---------- camera ---------- */
const cam = { x: 0, y: -EYE, z: 3000, yaw: 0, pitch: .06, pf: 0 };
let W = innerWidth, VH = innerHeight, P = 800, ox = W / 2, oy = VH / 2, oxT = ox, oyT = oy;
const layout = () => { W = innerWidth; VH = innerHeight; P = Math.sqrt(W * VH) / 2 / Math.tan(37 * RAD); scene.style.perspective = P + 'px'; };
let lastT = '';
function render() {
  const t = `translateZ(${P.toFixed(1)}px) rotateX(${cam.pitch.toFixed(4)}rad) rotateY(${cam.yaw.toFixed(4)}rad) translate3d(${(-cam.x).toFixed(1)}px,${(-cam.y).toFixed(1)}px,${(-cam.z).toFixed(1)}px)`;
  const o = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`;
  if (t + o === lastT) return;
  lastT = t + o;
  camEl.style.transform = t;
  scene.style.perspectiveOrigin = o;
  camEl.style.left = ox + 'px'; camEl.style.top = oy + 'px';
  sky.style.setProperty('--sx', (-cam.yaw * P).toFixed(0) + 'px');
  sky.style.setProperty('--sy', (cam.pitch * P).toFixed(0) + 'px');
  sky.style.setProperty('--hz', (oy + P * Math.tan(cam.pitch)).toFixed(0) + 'px');
}
const rotY = (a, [x, y, z]) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
const rotX = (b, [x, y, z]) => [x, y * Math.cos(b) - z * Math.sin(b), y * Math.sin(b) + z * Math.cos(b)];
const rayDir = (cx, cy) => rotY(-cam.yaw, rotX(-cam.pitch, [cx - ox, cy - oy, -P]));
/* where the ray through a pixel meets the level floor at height pf (our own picking, the browser's gets lost at a distance) */
function floorAt(cx, cy, pf = cam.pf) {
  const d = rayDir(cx, cy), t = (-pf - cam.y) / d[1];
  if (!(t > 0) || !isFinite(t)) return null;
  return [cam.x + d[0] * t, cam.z + d[2] * t];
}

/* ---------- collisions ---------- */
const R = 40;
const closed = new Set(['front']);
function doorBlocks() {
  const out = [];
  if (closed.has('front')) out.push({ ax: -1150, az: 0, bx: -950, bz: 0, hb: 0, ht: 340 });
  return out;
}
const blocks = (s, pf) => pf + 30 > s.hb && pf < s.ht - 60;
function collide(x, z, pf = cam.pf) {
  const segs = WALLS.concat(doorBlocks());
  for (let it = 0; it < 3; it++) {
    for (const s of segs) {
      if (!blocks(s, pf)) continue;
      const dx = s.bx - s.ax, dz = s.bz - s.az, L = dx * dx + dz * dz;
      const t = clamp(((x - s.ax) * dx + (z - s.az) * dz) / L, 0, 1);
      const px = s.ax + dx * t, pz = s.az + dz * t, ex = x - px, ez = z - pz, e = Math.hypot(ex, ez);
      if (e < R + T && e > 1e-6) { x = px + ex / e * (R + T); z = pz + ez / e * (R + T); }
    }
    for (const b of SOLIDS) {
      if (!blocks(b, pf)) continue;
      const px = clamp(x, b.x0, b.x1), pz = clamp(z, b.z0, b.z1), ex = x - px, ez = z - pz, e = Math.hypot(ex, ez);
      if (e < R && e > 1e-6) { x = px + ex / e * R; z = pz + ez / e * R; }
    }
  }
  return [clamp(x, -3500, 3500), clamp(z, -3000, 3500)];
}
/* take a step: slide along walls, then find the floor; refuse steps that would drop you off an edge */
function stepTo(nx, nz) {
  const [x, z] = collide(nx, nz);
  const h = heightAt(x, z, cam.pf);
  if (h == null) return false;
  cam.x = x; cam.z = z; cam.pf = h; cam.y = -(h + EYE);
  return true;
}

/* ---------- walking somewhere on purpose: a graph of places you can stand, and the best way between them ---------- */
const NODES = [], EDGES = [];
const node = (x, z, pf, area) => (NODES.push({ x, z, pf, area, i: NODES.length }), NODES.length - 1);
const edge = (a, b, door) => EDGES.push([a, b, door]);
{
  /* a node or two in every room, one each side of every doorway, and the stairs a step at a time */
  const RN = {};
  /* nodes in one open room all see each other; rooms with a stair in the middle keep to their own paths */
  const addRN = (id, x, z, pf, link = true) => {
    const n = node(x, z, pf, id);
    if (link && !(ROOMS[id] && ROOMS[id].nav)) for (const m of RN[id] || []) edge(m, n);
    (RN[id] = RN[id] || []).push(n);
    return n;
  };
  for (const id in ROOMS) {
    const r = ROOMS[id];
    if (r.special) continue;
    const pts = r.nav || [[(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2]];
    let prev = null;
    for (const [x, z] of pts) { const n = addRN(id, x, z, r.lv * LH, false); if (prev != null) edge(prev, n); prev = n; }
  }
  addRN('nook', 150, 160, LH);
  addRN('music', -1250, -1150, ATTIC);
  const am = addRN('attic', -400, -650, ATTIC), aw = addRN('attic', -1300, -500, ATTIC); edge(am, aw);
  const g1 = addRN('gallery', 700, -1400, ATTIC), g2 = addRN('gallery', 400, -900, ATTIC), g3 = addRN('gallery', 1200, -900, ATTIC);
  edge(g1, g2); edge(g1, g3);
  const nearestRN = (id, x, z) => (RN[id] || []).reduce((b, n) => b == null || Math.hypot(NODES[n].x - x, NODES[n].z - z) < Math.hypot(NODES[b].x - x, NODES[b].z - z) ? n : b, null);
  for (const h of HELIXES) {
    const steps = Math.round(h.spin / (Math.PI / 4)), rr = h.r * .58;
    let prev = null;
    for (let k = 0; k <= steps; k++) {
      const u = k / steps * h.spin, [x, z] = helixPt(h, u, rr), n = node(x, z, h.pf0 + u / h.spin * h.rise, h.id);
      if (prev != null) edge(prev, n);
      prev = n;
      /* where a storey meets the stair, a step off it */
      const pf = h.pf0 + u / h.spin * h.rise, lv = Math.round(pf / LH);
      if (Math.abs(pf - lv * LH) < 1) {
        const room = h.rooms.find(id => ROOMS[id].lv === lv), [ex, ez] = helixPt(h, u, h.r + 45), m = nearestRN(room, ex, ez), e = addRN(room, ex, ez, pf);
        edge(n, e); if (m != null) edge(e, m);
      }
    }
  }
  /* every doorway: a node a step inside each side */
  const centre = id => id === 'out' ? null : ROOMS[id];
  for (const d of DOORS) {
    if (d.bay) continue;
    const L = d.lv, side = id => {
      const r = centre(id), o = centre(id === d.a ? d.b : d.a);
      if (!r && o) return -Math.sign(d.dir === 'h' ? (o.z0 + o.z1) / 2 - d.z : (o.x0 + o.x1) / 2 - d.x) || 1;
      return Math.sign(d.dir === 'h' ? (r.z0 + r.z1) / 2 - d.z : (r.x0 + r.x1) / 2 - d.x) || 1;
    };
    const at = (id, s) => d.dir === 'h' ? [d.x, d.z + s * 120] : [d.x + s * 120, d.z];
    const ends = [d.a, d.b].map(id => {
      const [x, z] = at(id, side(id)), n = node(x, z, L * LH, id), m = nearestRN(id, x, z);
      if (m != null) edge(n, m);
      return n;
    });
    edge(ends[0], ends[1], d.id);
  }
  /* the street reaches the garden gate the long way round */
  const street = NODES.findIndex(n => n.area === 'out' && n.z > 0), gateOut = NODES.find(n => n.area === 'out' && n.x < -1700);
  edge(street, node(-2000, 500, 0, 'out')); edge(NODES.length - 1, gateOut.i);
  /* and the terrace, the side porch and the front walk are all one outdoors */
  const outs = NODES.filter(n => n.area === 'out');
  for (let i = 1; i < outs.length; i++) edge(outs[i - 1].i, outs[i].i);
}
function route(sx, sz, spf, tx, tz, tpf) {
  const sa = areaAt(sx, sz, spf), ta = areaAt(tx, tz, tpf);
  const near = (x, z, pf, area) => {
    let best = -1, bd = Infinity;
    for (const n of NODES) { if (n.area !== area) continue; const d = Math.hypot(n.x - x, n.z - z) + Math.abs(n.pf - pf) * 3; if (d < bd) { bd = d; best = n.i; } }
    return best;
  };
  const s = near(sx, sz, spf, sa), t = near(tx, tz, tpf, ta);
  if (s < 0 || t < 0 || sa === ta && !HELIXES.some(h => h.id === sa) && !ROOMS[sa]?.nav) return { pts: [], doors: [] };
  const dist = NODES.map(() => Infinity), prev = NODES.map(() => null), done = new Set();
  dist[s] = 0;
  while (true) {
    let u = -1, ud = Infinity;
    for (let i = 0; i < NODES.length; i++) if (!done.has(i) && dist[i] < ud) { ud = dist[i]; u = i; }
    if (u < 0 || u === t) break;
    done.add(u);
    for (const [a, b, door] of EDGES) {
      const v = a === u ? b : b === u ? a : -1;
      if (v < 0) continue;
      const w = Math.hypot(NODES[u].x - NODES[v].x, NODES[u].z - NODES[v].z) + Math.abs(NODES[u].pf - NODES[v].pf);
      if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = [u, door]; }
    }
  }
  const pts = [], doors = [];
  for (let v = t; v != null; v = prev[v] ? prev[v][0] : null) { pts.unshift([NODES[v].x, NODES[v].z]); if (prev[v] && prev[v][1]) doors.push(prev[v][1]); if (v === s) break; }
  return { pts, doors };
}

let walk = null;
function walkTo(x, z, yaw, pitch, done, pf = cam.pf) {
  const { pts, doors } = route(cam.x, cam.z, cam.pf, x, z, pf);
  doors.forEach(id => openDoor(id));
  const path = [[cam.x, cam.z], ...pts, [x, z]];
  /* sample the path finely so the feet follow every step of the stairs */
  const S = [[cam.x, cam.z, cam.pf, 0]];
  let h = cam.pf, L = 0;
  for (let i = 1; i < path.length; i++) {
    const [ax, az] = path[i - 1], [bx, bz] = path[i], seg = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(seg / 12));
    for (let k = 1; k <= n; k++) {
      const px = lerp(ax, bx, k / n), pz = lerp(az, bz, k / n), hh = heightAt(px, pz, h, 90);
      if (hh != null) h = hh;
      L += seg / n; S.push([px, pz, h, L]);
    }
  }
  walk = { S, total: L, dur: still ? .01 : clamp(L / 720, .25, 6), t: 0, yaw, pitch: pitch ?? 0, done };
  flight = null;
}
const sampleAt = (w, d) => {
  const S = w.S; let lo = 0, hi = S.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (S[m][3] < d) lo = m; else hi = m; }
  const a = S[lo], b = S[hi], k = clamp((d - a[3]) / ((b[3] - a[3]) || 1), 0, 1);
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
};
function stepWalk(dt) {
  const w = walk;
  w.t = Math.min(w.dur, w.t + dt);
  const k = w.t / w.dur, e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2, d = e * w.total;
  [cam.x, cam.z, cam.pf] = sampleAt(w, d);
  cam.y = -(cam.pf + EYE);
  const left = w.total - d;
  let yaw = w.yaw, pitch = w.pitch;
  if (left > 280 || yaw == null) {
    const [ax, az, ah] = sampleAt(w, d + 240);
    if (Math.hypot(ax - cam.x, az - cam.z) > 20) yaw = Math.atan2(ax - cam.x, -(az - cam.z));
    else if (yaw == null) yaw = cam.yaw;
    if (left > 280) pitch = clamp(Math.atan2(ah - cam.pf, 240) * .7, -.45, .45);
  }
  const r = still ? 1 : 1 - Math.exp(-dt * 5.5);
  cam.yaw += wrap(yaw - cam.yaw) * r;
  cam.pitch += (pitch - cam.pitch) * r;
  if (w.t >= w.dur && Math.abs(wrap(yaw - cam.yaw)) < .004 && Math.abs(pitch - cam.pitch) < .004) {
    cam.yaw = yaw; cam.pitch = pitch;
    walk = null;
    w.done && w.done();
  }
}

/* ---------- flying: into the dollhouse view and back down ---------- */
let flight = null;
const forward = (yaw, pitch) => [Math.cos(pitch) * Math.sin(yaw), -Math.sin(pitch), -Math.cos(pitch) * Math.cos(yaw)];
const orbitPose = (tx, ty, tz, yaw, pitch, r) => { const f = forward(yaw, pitch); return { x: tx - f[0] * r, y: ty - f[1] * r, z: tz - f[2] * r, yaw, pitch }; };
function fly(to, dur, done, onStep) { walk = null; flight = { from: { ...cam }, to, dur: still ? .01 : dur, t: 0, done, onStep }; }
function stepFly(dt) {
  const f = flight;
  f.t = Math.min(f.dur, f.t + dt);
  const k = f.t / f.dur, e = k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
  for (const p of ['x', 'y', 'z', 'pitch']) cam[p] = lerp(f.from[p], f.to[p], e);
  cam.yaw = f.from.yaw + wrap(f.to.yaw - f.from.yaw) * e;
  f.onStep && f.onStep(k);
  if (k >= 1) { flight = null; f.done && f.done(); }
}

/* ---------- doors that open: the front door, and the bookshelf ---------- */
const LEAVES = {};
function openDoor(id) {
  if (!id || !closed.has(id)) return;
  closed.delete(id);
  const l = LEAVES[id];
  if (l) l.el.style.transform = l.open;
  window.chime && chime([523.25, 659.25, 783.99]);
}
