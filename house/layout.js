/* The plan of the house: rooms, doorways, stairs and the stops, in world units (roughly a centimetre).
   x runs east, z runs south toward the street. Heights are measured up from the ground floor. */
const H = 440, LH = 480, EYE = 215, DH = 300, T = 8;        // room height, storey height, eye, door height, half wall
const ATTIC = 2 * LH, EAVE = ATTIC + 200, RIDGE = EAVE + 720;   // two full storeys, then an attic under a steep roof
const RAD = Math.PI / 180;
const lerp = (a, b, t) => a + (b - a) * t;
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

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
  { dir: 'h', x: -1500, z: -1900, w: 160, dh: 320, french: true, lv: 0, a: 'garden', b: 'sunroom', sides: { garden: 1, sunroom: -1 } },
  { id: 'gate', dir: 'v', x: -1700, z: -2850, w: 200, lv: 0, a: 'out', b: 'garden', open: true },
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

/* the attic's boards, and the walkway round her closet's two-storey void */
const GALLERY = [{ x0: 300, x1: 1300, z0: -1500, z1: -1300 }, { x0: 300, x1: 500, z0: -1300, z1: -300 }, { x0: 1100, x1: 1300, z0: -1300, z1: -300 }];
const ATTICFLOOR = [{ x0: -1700, x1: 300, z0: -800, z1: -110 }, { x0: -950, x1: 300, z0: -1340, z1: -800 }, { x0: -780, x1: -170, z0: -110, z1: -20 }];

const inRect = (r, x, z) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
const inFoot = (x, z) => FOOT.some(r => inRect(r, x, z));
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
  /* the garden is big, with the sunroom in it: two waypoints that keep the way round the glass */
  addRN('garden', -600, -1720, 0); addRN('garden', -600, -2850, 0);
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
      if (d.sides && d.sides[id] != null) return d.sides[id];
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
  for (let v = t; v != null; v = prev[v] ? prev[v][0] : null) { pts.unshift([NODES[v].x, NODES[v].z, NODES[v].pf]); if (prev[v] && prev[v][1]) doors.push(prev[v][1]); if (v === s) break; }
  return { pts, doors };
}

/* ---------- the stops: where each one lives. face is the way it looks (S looks south, so it hangs on a north wall); up is from its floor ---------- */
const TARGETS = {};
const target = (id, room, face, line, along, up, w, h, extra = {}) => TARGETS[id] = { room, face, line, along, up, w, h, lv: ROOMS[room] ? ROOMS[room].lv : 0, ...extra };
target('circle', 'living', 'E', -1644, -400, 230, 640, 420, { minDist: 520 });
target('both', 'living', 'W', -1060, -400, 120, 640, 360, { minDist: 560 });
target('match', 'living', 'S', -310, -1360, 50, 260, 180, { minDist: 320 });
target('gift', 'living', 'S', -330, -120, 110, 280, 170, { minDist: 300 });
target('receipts', 'library', 'E', -1644, -1300, 230, 420, 420);
target('brain', 'library', 'S', -1167, -1235, 100, 200, 150, { minDist: 260 });
target('mood', 'cafe', 'N', -800, -855, 150, 260, 240, { minDist: 300 });
target('heart', 'kitchen', 'S', -980, 1210, 200, 180, 400, { minDist: 340 });
target('ask', 'kitchen', 'W', 1300, -650, 90, 260, 170, { minDist: 300 });
target('icks', 'movie', 'S', -1447, 900, 80, 340, 160, { minDist: 320 });
target('built', 'study', 'S', -1300, -1180, 170, 340, 240, { minDist: 340 });
target('thrive', 'study', 'W', -950, -1350, 260, 260, 200);
target('rip', 'study', 'E', -1700, -1300, 260, 300, 240);
target('spirit', 'study', 'N', -800, -1180, 260, 420, 240);
target('values', 'study', 'S', -1500, -1585, 262, 170, 220, { at: [-1290, -1150] });
target('words', 'closet', 'N', -300, 1050, 230, 180, 360, { minDist: 320 });
target('pattern', 'nook', 'E', 160, 70, 60, 140, 100, { minDist: 90 });
target('quiz', 'attic', 'S', -485, -300, 90, 320, 180, { minDist: 300 });
target('photos', 'attic', 'S', -1105, 0, 80, 260, 160, { minDist: 300 });
target('door', 'out', 'S', 0, -1050, 240, 520, 460, { lv: 0 });
target('palette', 'sunroom', 'S', -2565, -1320, 100, 320, 180, { minDist: 300 });
target('beat', 'garden', 'S', -2380, -150, 170, 320, 340, { minDist: 420 });
/* a stop's spot in the world: [x, y, z] of its centre, and the way it faces as a unit vector */
const FACEV = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] };
const stopSpot = id => {
  const t = TARGETS[id], [nx, nz] = FACEV[t.face], lvh = (t.lv || 0) * LH;
  const x = nx ? t.line : t.along, z = nx ? t.along : t.line;
  return { x, y: lvh + t.up, z, nx, nz, floor: lvh };
};
