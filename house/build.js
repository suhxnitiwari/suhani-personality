/* The Suhani House: people at the front, the stairs tucked behind, her wing over the garage, a glass sunroom in the garden.
   Every room has one physical hero, and the stops live in objects, not posters. */
const G = {};
const TARGETS = {};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, '');
const target = (id, room, face, line, along, up, w, h, extra = {}) => TARGETS[id] = { room, face, line, along, up, w, h, lv: ROOMS[room] ? ROOMS[room].lv : 0, ...extra };
const tag = (el, id, sub) => { const n = el.g || el; n.setAttribute('data-stop', id); if (sub != null) n.setAttribute('data-sub', sub); return el; };
const play = (el, ...ids) => { (el.g || el).setAttribute('data-play', ids.join(' ')); return el; };

const WORDS = [['Core', 'Intense'], ['As a friend', 'Loyal'], ['As a leader', 'Protective'], ['In love', 'Devoted'], ['At work', 'Driven'], ['Morally', 'Principled'],
  ['Socially', 'Magnetic'], ['Creatively', 'Expressive'], ['Superpower', 'Empathy'], ['Spirit', 'Faithful'], ['Dream', 'Impact'], ['Archetype', 'Guardian']];
const SWATCHES = [
  ['Wine', '#2A0F1E', 'Strong spirit: DISC Dominance and Enneagram 8, the protector'], ['Rose', '#E0567F', 'Soft heart: Love is her #1 VIA strength'],
  ['Hot pink', '#FF4F9A', 'The Creator: Creative & Expressive at 91.7%'], ['Petal', '#FF9DBB', 'Kindness #4: warmth in every highlight'],
  ['Blush', '#FBE9EE', 'Kindness #4 and Relator #1: the softness her people see'], ['Clifton blue', '#2B7DE0', 'Relationship Building: 4 of her top 5 CliftonStrengths'],
  ['Communication orange', '#F08A24', 'Influencing: her #5 strength, the one orange stripe'], ['Gifts red', '#F2434A', 'Receiving Gifts, her #1 love language'],
  ['Consul teal', '#4F93B3', '16Personalities: ESFJ is a Sentinel']
];
const SPIRIT = [
  ['Protective', 'Takes charge when a group drifts or someone gets treated badly.', 'Enneagram 8 · DISC Dominance'],
  ['Driven', 'Sets high standards and delivers on them, every time.', 'Achievement 100% · Diligence top 10%'],
  ['Principled', 'Honest, fair, and true to her word.', 'VIA Honesty #2 · Morality 20/20'],
  ['Brave', 'Says the thing other people are only thinking.', 'VIA Bravery #6 · Assertiveness 18/20'],
  ['Organized', "Loves structure, a plan, and knowing what's expected. Orderly to the core.", 'Orderliness 19/20 · Dutifulness 19/20'],
  ['A leader', 'Leads by knowing people, not by running systems.', 'VIA Leadership #7']
];
const HEART = [
  ['Loyal', "Once you're in, she's in for good. She'll defend you in rooms you're not in.", 'CliftonStrengths #1 Relator'],
  ['Empathic', 'Reads a room, and the people in it, instantly.', 'CliftonStrengths #2 Empathy'],
  ['Devoted', "Love is her top strength. For her it's something she does, not just something she feels.", 'VIA #1 Love · #4 Kindness'],
  ['Supportive', 'The advice-giver and biggest cheerleader in every room.', 'CliftonStrengths Developer'],
  ['Faithful', 'Grounded in meaning, faith, and tradition.', 'VIA Spirituality #3 · Tradition 67%'],
  ['Artistic', 'Creative in how she makes and expresses things. Art is how she talks.', 'Creative 91.7% · Artistic 17/20']
];
const VALUES = [['Achievement', '100%'], ['Security & stability', '100%'], ['Her people', '83%'], ['Truth & fairness', 'Honesty #2'], ['Independence', '83%'], ['Faith & meaning', 'Spirituality #3'], ['Making an impact', '75%']];

for (const id in ROOMS) G[id] = group(world, 0, 0, 0, 0, `room r-${id} lv${ROOMS[id].lv}`);
for (const h of HELIXES) G[h.id] = group(world, 0, 0, 0, 0, `room r-${h.id}`);
G.ext = group(world, 0, 0, 0, 0, 'room r-ext');
G.roof = group(world, 0, 0, 0, 0, 'room r-roof');
G.hingeL = document.createElement('div'); G.hingeL.className = 'grp hinge-l'; G.ext.appendChild(G.hingeL);
G.hingeR = document.createElement('div'); G.hingeR.className = 'grp hinge-r'; G.ext.appendChild(G.hingeR);

/* ---------- shells: floors with holes where the stairs come through, ceilings, walls ---------- */
const THEME = { living: 'w-plaster', library: 'w-forest', cafe: 'w-blush', halfbath: 'w-paper', stairs: 'w-core', kitchen: 'w-plaster', movie: 'w-plum', laundry: 'w-plaster', mudroom: 'w-plaster',
  pantry: 'w-plaster', garage: 'w-garage', sunroom: 'w-glass', guest: 'w-sage', study: 'w-olive', hall: 'w-core', gbath: 'w-bath', landing: 'w-core', uphall: 'w-core', closet: 'w-blush', bedroom: 'w-shell', bath: 'w-bath' };
const FLOOR = { living: 'f-herring', library: 'f-herring', cafe: 'f-oak', halfbath: 'f-oak', stairs: 'f-herring', kitchen: 'f-oak', movie: 'f-carpet', laundry: 'f-oak', mudroom: 'f-oak', pantry: 'f-oak',
  garage: 'f-garage', sunroom: 'f-oak', guest: 'f-plank', study: 'f-herring', hall: 'f-plank', gbath: 'f-bathtile', landing: 'f-herring', uphall: 'f-herring', closet: 'f-oak', bedroom: 'f-plank', bath: 'f-bathtile' };
const CEIL = { library: 'c-forest', study: 'c-olive', garage: 'c-plain', movie: 'c-plum', closet: 'c-floral' };
const SHADE = { n: 0, s: .06, w: .03, e: .09 };
const pieces = (g, r, y, holes, cls, rx) => { for (const p of rectMinus(r, holes)) plane(g, p.x1 - p.x0, p.z1 - p.z0, (p.x0 + p.x1) / 2, y, (p.z0 + p.z1) / 2, 0, rx, cls); };
const ceilHoles = lv => HELIXES.filter(h => h.pf0 <= lv * LH && h.pf0 + h.rise > lv * LH).map(HSQ);
for (const id in ROOMS) {
  const r = ROOMS[id];
  if (r.special || r.open) continue;
  const g = G[id], fy = lvY(r.lv), tall = r.tall || H;
  pieces(g, r, fy, holesAt(r.lv), 'floor ' + FLOOR[id], 90);
  if (r.glass) { for (const s of sidesOf(r)) wall(g, s, 'w-glass', { lv: r.lv }); continue; }
  pieces(g, r, fy - tall, r.tall ? [] : ceilHoles(r.lv), 'ceil ' + (CEIL[id] || 'c-ivory'), -90);
  for (const s of sidesOf(r)) {
    /* the stair hall wraps round the half bath: its walls stop where the half bath's begin */
    if (id === 'stairs' && s.k === 's') { wall(g, { ...s, len: 420 }, THEME[id], { shade: SHADE.s, lv: 0 }); continue; }
    if (id === 'stairs' && s.k === 'w') { wall(g, { ...s, A: [-400, -1060], len: 440 }, THEME[id], { shade: SHADE.w, lv: 0 }); continue; }
    wall(g, s, THEME[id], { shade: SHADE[s.k], lv: r.lv, tall });
  }
}
for (const d of DOORS) if (!d.manual) jambs(G[d.a === 'out' || d.a === 'garden' ? d.b : d.a] || G.ext, d, 'jamb-w');
/* the outside faces of the half bath, seen from the stair hall */
plane(G.stairs, 260, H, -112, -H / 2, -930, 90, 0, 'wall w-core');
plane(G.stairs, 280, H, -260, -H / 2, -1068, 180, 0, 'wall w-core');
/* ---------- a small kit of furniture ---------- */
const pool = (g, x, z, size, base = 0, cls = 'warm') => plane(g, size, size, x, -base - 1.5, z, 0, 90, 'pool ' + cls);
const tableLamp = (g, x, z, base, lift = 60) => {
  box(g, { x, z, w: 18, d: 18, h: 30, lift, base, cls: 'm-ceramic', solid: false });
  box(g, { x, z, w: 46, d: 46, h: 34, lift: lift + 30, base, cls: 'm-shade', solid: false });
  pool(g, x, z, 300, base);
};
const floorLamp = (g, x, z, base, h = 270) => {
  box(g, { x, z, w: 24, d: 24, h: 5, base, cls: 'm-brass', solid: false });
  box(g, { x, z, w: 5, d: 5, h, base, cls: 'm-brass', solid: false });
  box(g, { x, z, w: 64, d: 64, h: 50, lift: h - 26, base, cls: 'm-shade', solid: false });
  pool(g, x, z, 420, base);
};
const pendant = (g, x, z, base, drop = 110, cls = 'm-opal') => {
  box(g, { x, z, w: 3, d: 3, h: drop, lift: H - drop, base, cls: 'm-cord', solid: false, faces: 'f' });
  box(g, { x, z, w: 40, d: 40, h: 34, lift: H - drop - 34, base, cls, solid: false });
  plane(g, 36, 36, x, -base - (H - drop - 35), z, 0, -90, 'bulb');
};
const chandelier = (g, x, z, base, size = 120) => {
  plane(g, size * 1.4, size * 1.4, x, -base - H + 1, z, 0, -90, 'medallion');
  box(g, { x, z, w: 3, d: 3, h: 70, lift: H - 70, base, cls: 'm-cord', solid: false, faces: 'f' });
  box(g, { x, z, w: size, d: size, h: 16, lift: H - 110, base, cls: 'm-brass round', solid: false });
  for (const ry of [0, 60, 120]) plane(g, size * 1.1, 60, x, -base - (H - 100), z, ry, 0, 'candles');
  pool(g, x, z, size * 6, base);
};
const sconce = (g, face, line, along, up, lv) => { mount(g, face, line, along, up, 30, 46, 'sconce', '', T + 3, lv); };
const pic = (g, face, line, along, up, w, h, cls, html, lv) => mount(g, face, line, along, up, w, h, 'pic ' + cls, html, T + 4, lv);
const flowers = (g, x, z, base, lift, kind = 'rose', s = 1) => {
  box(g, { x, z, w: 20 * s, d: 20 * s, h: 30 * s, lift, base, cls: 'm-vase', solid: false });
  for (const ry of [0, 70]) plane(g, 90 * s, 100 * s, x, -base - lift - 30 * s - 44 * s, z, ry, 0, 'bouquet ' + kind);
};
const plant = (g, x, z, base, s = 1, pot = 'm-terracotta') => {
  box(g, { x, z, w: 50 * s, d: 50 * s, h: 54 * s, base, cls: pot });
  for (const ry of [0, 60, 120]) plane(g, 140 * s, 160 * s, x, -base - 54 * s - 76 * s, z, ry, 0, 'leaves');
};
const rug = (g, w, d, x, z, base, pal) => { const p = plane(g, w, d, x, -base - 1, z, 0, 90, 'rug'); p.style.backgroundImage = wool(w, d, pal); return p; };
/* sofas and chairs face the way ry turns them: 0 faces south, -90 faces west, 180 north */
function sofa(g, { x, z, ry = 0, w = 300, base = 0, cls = 'm-cream', curve = true }) {
  const grp = group(g, x, -base, z, ry, 'sofa');
  box(grp, { x: 0, z: 0, w, d: 100, h: 40, cls, solid: false });
  box(grp, { x: 0, z: 4, w: w - 40, d: 86, h: 16, lift: 40, cls, solid: false });
  box(grp, { x: 0, z: -40, w, d: 26, h: 104, cls: cls + (curve ? ' curve' : ''), solid: false });
  for (const sx of [-1, 1]) box(grp, { x: sx * (w / 2 - 12), z: 0, w: 24, d: 100, h: 66, cls, solid: false });
  solidRect(x, z, Math.abs(ry) % 180 ? 100 : w, Math.abs(ry) % 180 ? w : 100, 0, base);
  return grp;
}
function chair(g, { x, z, ry = 0, base = 0, cls = 'm-olive', w = 100 }) {
  const grp = group(g, x, -base, z, ry, 'chair');
  box(grp, { x: 0, z: 0, w, d: 96, h: 40, cls, solid: false });
  box(grp, { x: 0, z: -38, w, d: 20, h: 96, cls: cls + ' curve', solid: false });
  for (const sx of [-1, 1]) box(grp, { x: sx * (w / 2 - 9), z: 0, w: 18, d: 96, h: 62, cls, solid: false });
  solidRect(x, z, w, 96, 0, base);
  return grp;
}
const sideTable = (g, x, z, base, cls = 'm-walnut round', h = 56) => box(g, { x, z, w: 50, d: 50, h, base, cls });
const books = (n, seed) => { const r = rng(seed); let s = ''; const C = ['#713C3B', '#394837', '#51382D', '#7B8060', '#B97979', '#E8DDC8', '#3E4A6B', '#8E4B47', '#5A404D', '#B08D57']; for (let i = 0; i < n; i++) { s += `<i style="--c:${C[(r() * C.length) | 0]};--h:${(62 + r() * 30) | 0}%;--w:${(8 + r() * 9) | 0}px"></i>`; if (r() > .9) s += '<b class="lay"></b>'; } return s; };
const shelfRows = (rows, per, seed, extra = {}) => Array.from({ length: rows }, (_, i) => `<div class="shelf-row">${extra[i] || books(per, seed + i * 7)}</div>`).join('');
const objs = (k, seed) => { const r = rng(seed); return Array.from({ length: k }, () => ['<b class="o vase"></b>', '<b class="o bowl"></b>', '<b class="o ph"></b>', '<b class="o stack"></b>', '<b class="o candle"></b>'][(r() * 5) | 0]).join(''); };
function drapes(g, face, line, along, w, lv, cls = 'olive') {
  mount(g, face, line, along, H - 22, w + 120, 8, 'rod', '', T + 16, lv);
  for (const sx of [-1, 1]) mount(g, face, line, along + sx * (w / 2 + 30), H / 2 - 18, 74, H - 36, 'drape ' + cls, '', T + 10, lv);
  mount(g, face, line, along, H / 2 - 20, w + 10, H - 40, 'sheer', '', T + 7, lv);
}
const win = (g, face, line, along, up, w, h, kind, lv) => mount(g, face, line, along, up, w, h, 'win ' + kind, '<i></i><i></i><b></b>', T + 2, lv);
/* a chandelier that can hang from any ceiling height */
const crystal = (g, x, z, top, drop, size = 140, base = 0) => {
  box(g, { x, z, w: 3, d: 3, h: drop, lift: top - drop, base, cls: 'm-cord', solid: false, faces: 'f' });
  for (const [k, s] of [[0, 1], [1, .72], [2, .45]]) box(g, { x, z, w: size * s, d: size * s, h: 40, lift: top - drop - 40 - k * 34, base, cls: 'm-crystal round', solid: false, faces: 'fblr' });
  plane(g, size * 1.6, size * 1.6, x, -(base + top - drop - 60), z, 0, 0, 'glow-ball two');
  pool(g, x, z, size * 6, base);
};
const windowSeat = (g, b, base, cls = 'm-linen') => {
  const back = b.z0 < -1000, along = b.x1 - b.x0;
  if (b.x0 >= 1300) { box(g, { x: b.x1 - 40, z: (b.z0 + b.z1) / 2, w: b.z1 - b.z0 - 20, d: 70, h: 46, ry: -90, base, cls: 'm-walnut' }); return; }
  box(g, { x: (b.x0 + b.x1) / 2, z: back ? b.z0 + 40 : b.z1 - 40, w: along - 30, d: 66, h: 46, base, cls: 'm-walnut' });
  box(g, { x: (b.x0 + b.x1) / 2, z: back ? b.z0 + 40 : b.z1 - 40, w: along - 40, d: 62, h: 14, lift: 46, base, cls, solid: false });
};
const lowCase = (g, x, z, w, h, ry, base, seed, extra = {}) => box(g, { x, z, w, d: 50, h, ry, base, cls: 'm-walnut', front: `<div class="case lit">${shelfRows(Math.max(2, Math.round(h / 75)), Math.round(w / 12), seed, extra)}</div>` });

/* =============================== GROUND FLOOR · people at the front, the stairs tucked behind =============================== */

/* ---------- the living room: the heart. one big room: a fire, a conversation, a table for everyone ---------- */
{
  const g = G.living;
  /* the hero: a plaster chimney breast with a fire, walnut built-ins either side full of her people */
  box(g, { x: -1648, z: -400, w: 380, d: 100, h: H, ry: 90, cls: 'm-plaster', front: '<i class="firebox"><b></b></i><i class="mantel"></i>' });
  mount(g, 'E', -1598, -400, 330, 150, 150, 'mirror-round', '', 2);
  flowers(g, -1612, -510, 0, 182, 'rose', .8);
  for (const z of [-470, -330]) box(g, { x: -1612, z, w: 14, d: 14, h: 40, lift: 182, cls: 'm-candle', solid: false });
  pool(g, -1520, -400, 560, 0, 'fire');
  for (const [z, seed, half] of [[-695, 3, 0], [-105, 9, 1]]) {
    tag(box(g, { x: -1672, z, w: 190, d: 56, h: H, ry: 90, cls: 'm-walnut', front: `<div class="case lit">${shelfRows(5, 5, seed, { 1: `<span class="fr">${PHOTOS.slice(half * 3, half * 3 + 2).map(p => `<img src="../${p.src}" alt="">`).join('')}</span>`, 3: objs(2, seed) + books(3, seed + 1) })}</div>` }), 'circle');
  }
  target('circle', 'living', 'E', -1644, -400, 230, 640, 420, { minDist: 520 });
  for (const z of [-575, -225]) sconce(g, 'E', -1598, z, 300, 0);
  /* the conversation: a curved cream sofa facing the fire, olive club chairs, one dusty-rose chair */
  const conv = group(g, 0, 0, 0, 0, 'conversation');
  sofa(conv, { x: -1120, z: -400, ry: -90, w: 360, cls: 'm-cream' });
  chair(conv, { x: -1430, z: -700, ry: 0, cls: 'm-olive' });
  chair(conv, { x: -1430, z: -95, ry: 180, cls: 'm-olive' });
  chair(conv, { x: -1270, z: -95, ry: 180, cls: 'm-rose', w: 90 });
  box(conv, { x: -1132, z: -560, w: 70, d: 22, h: 50, lift: 56, ry: -84, cls: 'm-cushion m-floral', solid: false });
  box(conv, { x: -1132, z: -240, w: 70, d: 22, h: 50, lift: 56, ry: -96, cls: 'm-cushion m-blush', solid: false });
  plane(conv, 110, 90, -1080, -60, -260, 90, 0, 'throw');
  tag(conv, 'both');
  target('both', 'living', 'W', -1060, -400, 120, 640, 360, { minDist: 560 });
  rug(g, 680, 640, -1350, -400, 0);
  const game = group(g, 0, 0, 0, 0, 'game');
  box(game, { x: -1360, z: -400, w: 180, d: 180, h: 40, cls: 'm-ottoman round' });
  box(game, { x: -1360, z: -400, w: 110, d: 76, h: 4, lift: 40, ry: 10, cls: 'm-tray', solid: false });
  plane(game, 80, 50, -1360, -45, -390, 20, 90, 'cards-spread');
  for (const [x, z] of [[-1310, -460], [-1410, -340]]) box(game, { x, z, w: 18, d: 18, h: 16, lift: 40, cls: 'm-cup round', solid: false, top: '<i class="latte-art"></i>' });
  tag(game, 'match');
  target('match', 'living', 'S', -310, -1360, 50, 260, 180, { minDist: 320 });
  for (const z of [-620, -180]) { sideTable(g, -1120, z, 0); tableLamp(g, -1120, z, 0, 56); }
  box(g, { x: -1120, z: -180, w: 40, d: 30, h: 24, lift: 56, cls: 'm-romcoms', solid: false });
  /* one dark botanical wall, beside the arch to the library */
  mount(g, 'S', -800, -1515, H / 2, 370, H, 'paper-morris', '', T + 1);
  /* both bays: window seats with drapes */
  for (const b of BAYS.filter(b => b.room === 'living')) { windowSeat(g, b, 0); drapes(g, 'N', 0, (b.x0 + b.x1) / 2, 280, 0, 'olive'); }
  plant(g, -1000, -60, 0, .9);
  chandelier(g, -1350, -400, 0, 120);
  /* the dining end: an oval table for everyone, a gift at one place */
  box(g, { x: -120, z: -400, w: 320, d: 170, h: 10, lift: 72, cls: 'm-walnut oval', solid: false });
  box(g, { x: -120, z: -400, w: 40, d: 40, h: 72, cls: 'm-walnut-dk', solid: false });
  solidRect(-120, -400, 320, 170);
  for (const [x, z, ry] of [[-220, -300, 0], [-20, -300, 0], [-220, -500, 180], [-20, -500, 180], [-320, -400, -90], [80, -400, 90]]) {
    const c = group(g, x, 0, z, ry, 'dchair');
    box(c, { x: 0, z: 0, w: 60, d: 60, h: 46, cls: 'm-rose', solid: false });
    box(c, { x: 0, z: 26, w: 60, d: 10, h: 66, lift: 46, cls: 'm-rose curve', solid: false });
  }
  tag(box(g, { x: -120, z: -410, w: 60, d: 60, h: 46, lift: 82, ry: 14, cls: 'm-gift', solid: false, front: '<i class="rib v"></i>', top: '<i class="rib v"></i><i class="rib h"></i>' }), 'gift');
  plane(g, 50, 26, -120, -(82 + 46 + 11), -410, 14, 0, 'bow', '<i></i><i></i>');
  target('gift', 'living', 'S', -330, -120, 110, 280, 170, { minDist: 300 });
  for (const x of [-200, -40]) box(g, { x, z: -385, w: 10, d: 10, h: 34, lift: 82, cls: 'm-candle', solid: false });
  flowers(g, -60, -420, 0, 82, 'rose2', .7);
  crystal(g, -120, -400, H, 110, 130);
  box(g, { x: -40, z: -34, w: 300, d: 60, h: 84, ry: 180, cls: 'm-walnut', front: '<i class="drawers"></i>' });
  flowers(g, 40, -36, 0, 84, 'hyd', .7);
  for (const x of [-250, 150]) win(g, 'N', 0, x, 240, 120, 230, 'shutter', 0);
  pic(g, 'N', 0, -40, 290, 140, 110, 'art a2', '', 0);
}

/* ---------- the library: curiosity. books floor to ceiling, a rolling ladder, the spiral up to her study ---------- */
{
  const g = G.library;
  const reports = `<span class="reports">${RECEIPTS.map(r => `<em>${r.tab}</em>`).join('')}</span>`;
  tag(box(g, { x: -1672, z: -1300, w: 400, d: 56, h: H, ry: 90, cls: 'm-walnut', front: `<div class="case lit tall">${shelfRows(7, 26, 5, { 3: reports + books(6, 12) })}</div>` }), 'receipts');
  target('receipts', 'library', 'E', -1644, -1300, 230, 420, 420);
  const lad = plane(g, 64, 446, -1612, -221, -1300, 90, 0, 'ladder');
  lad.style.transform += ' rotateX(8deg)';
  play(lad, 'receipts');
  box(g, { x: -978, z: -1400, w: 200, d: 56, h: H, ry: -90, cls: 'm-walnut', front: `<div class="case lit tall">${shelfRows(7, 13, 17)}</div>` });
  box(g, { x: -1000, z: -900, w: 160, d: 50, h: 300, ry: -90, cls: 'm-walnut', front: `<div class="case lit">${shelfRows(4, 10, 23)}</div>` });
  windowSeat(g, BAYS.find(b => b.room === 'library'), 0, 'm-olive');
  chair(g, { x: -1360, z: -1180, ry: 90, cls: 'm-leather', w: 96 });
  chair(g, { x: -1110, z: -1180, ry: -90, cls: 'm-leather', w: 96 });
  box(g, { x: -1235, z: -1180, w: 70, d: 70, h: 56, cls: 'm-walnut round' });
  tag(box(g, { x: -1235, z: -1170, w: 60, d: 6, h: 80, lift: 56, ry: 0, cls: 'm-plate', solid: false, front: '<svg viewBox="0 0 100 90"><path d="M50 12c-18-1-32 11-32 27 0 9 5 14 5 21 0 8 6 12 14 12h4v8h18v-10c10-2 20-10 23-21 2-7-1-13-4-17C74 20 64 12 50 12Z"/><path d="M34 32c6 0 7 6 13 6M30 46c8-2 10 4 17 2M52 26c4 6 12 4 14 10M56 44c6-2 10 3 14 1" class="d"/></svg>' }), 'brain');
  target('brain', 'library', 'S', -1167, -1235, 100, 200, 150, { minDist: 260 });
  box(g, { x: -1080, z: -1000, w: 46, d: 46, h: 50, cls: 'm-walnut round', solid: false });
  box(g, { x: -1080, z: -1000, w: 44, d: 44, h: 44, lift: 50, cls: 'm-globe round', solid: false });
  floorLamp(g, -1300, -1420, 0, 250);
  rug(g, 420, 340, -1235, -1180, 0, ['#E7D7BE', '#8E4B47', '#394837', '#A0522D', '#5A404D']);
  pendant(g, -1235, -1180, 0, 100, 'm-brass-dome');
}

/* ---------- the coffee bar: next to the books. espresso, a wall of mugs, a café table in the bay ---------- */
{
  const g = G.cafe;
  const cs = group(g, 0, 0, 0, 0, 'coffee');
  box(cs, { x: -855, z: -835, w: 170, d: 66, h: 90, ry: 180, cls: 'm-walnut', front: '<i class="drawers"></i>' });
  box(cs, { x: -855, z: -838, w: 176, d: 72, h: 8, lift: 90, cls: 'm-marble rose', solid: false });
  box(cs, { x: -880, z: -840, w: 70, d: 56, h: 72, lift: 98, ry: 180, cls: 'm-espresso', solid: false, front: '<i class="gauge"></i><i class="group"></i>' });
  box(cs, { x: -815, z: -840, w: 16, d: 16, h: 40, lift: 98, cls: 'm-vanilla', solid: false });
  box(cs, { x: -790, z: -840, w: 22, d: 22, h: 42, lift: 98, cls: 'm-milk', solid: false });
  for (const [x, z] of [[-850, -812], [-830, -806]]) box(cs, { x, z, w: 18, d: 18, h: 18, lift: 98, cls: 'm-cup round', solid: false, top: '<i class="latte-art"></i>' });
  box(cs, { x: -900, z: -830, w: 20, d: 20, h: 20, lift: 98, cls: 'm-cup round latte', solid: false, top: '<i class="latte-art"></i>' });
  plane(cs, 30, 40, -850, -142, -812, 0, 0, 'steam');
  mount(cs, 'N', -800, -855, 200, 176, 110, 'marble-splash', '', T + 1);
  tag(cs, 'mood'); play(cs, 'mood');
  target('mood', 'cafe', 'N', -800, -855, 150, 260, 240, { minDist: 300 });
  /* the mug wall: every one a different person's */
  box(g, { x: -500, z: -835, w: 170, d: 66, h: 90, ry: 180, cls: 'm-walnut', front: '<i class="drawers"></i>' });
  box(g, { x: -500, z: -838, w: 176, d: 72, h: 8, lift: 90, cls: 'm-marble rose', solid: false });
  for (const up of [170, 230, 290, 350]) mount(g, 'N', -800, -500, up, 170, 50, 'cup-shelf', '<i></i><i></i><i></i><i></i><i></i>', T + 16);
  box(g, { x: -540, z: -840, w: 30, d: 30, h: 40, lift: 98, cls: 'm-beans', solid: false });
  /* the café table in the garden bay */
  const b = BAYS.find(b => b.room === 'cafe');
  box(g, { x: -680, z: -1590, w: 16, d: 16, h: 72, cls: 'm-iron', solid: false });
  box(g, { x: -680, z: -1590, w: 110, d: 110, h: 6, lift: 72, cls: 'm-marble round' });
  for (const x of [-790, -570]) box(g, { x, z: -1590, w: 50, d: 50, h: 46, cls: 'm-rose round' });
  box(g, { x: -660, z: -1600, w: 18, d: 18, h: 16, lift: 78, cls: 'm-cup round', solid: false, top: '<i class="latte-art"></i>' });
  flowers(g, -700, -1585, 0, 78, 'rose', .5);
  drapes(g, 'S', -1500, -680, 380, 0, 'rose');
  plant(g, -900, -1450, 0, .9);
  pendant(g, -680, -1150, 0, 130, 'm-pleat');
  pic(g, 'W', -400, -1350, 270, 120, 150, 'art a3', '', 0);
}

/* ---------- the half bath: a little jewel box off the living room ---------- */
{
  const g = G.halfbath;
  box(g, { x: -260, z: -1030, w: 70, d: 50, h: 80, cls: 'm-pedestal' });
  mount(g, 'S', -1060, -260, 250, 90, 110, 'mirror-arch', '', T + 3);
  sconce(g, 'S', -1060, -340, 280, 0); sconce(g, 'S', -1060, -180, 280, 0);
  flowers(g, -230, -1032, 0, 80, 'rose', .45);
  box(g, { x: -160, z: -1020, w: 56, d: 60, h: 40, cls: 'm-ceramic', solid: false });
}

/* ---------- the stair hall: a grand curving stair, and a door to what's underneath ---------- */
{
  const g = G.stairs, lg = G.landing;
  /* the basement: a door, and behind it a dark stair down. her foundations; she doesn't live down there */
  for (const [w, x, z, ry] of [[150, -190 - T, -1415, -90], [150, -190 + T, -1415, 90], [40, -370, -1340 + T, 0], [40, -370, -1340 - T, 180], [40, -210, -1340 + T, 0], [40, -210, -1340 - T, 180]]) plane(g, w, H, x, -H / 2, z, ry, 0, 'wall w-core');
  for (const z of [-1340 + T, -1340 - T]) plane(g, 120, H - 280, -290, -(280 + (H - 280) / 2), z, z > -1340 ? 0 : 180, 0, 'wall w-core');
  WALLS.push({ ax: -190, az: -1490, bx: -190, bz: -1340, hb: 0, ht: H }, { ax: -400, az: -1340, bx: -350, bz: -1340, hb: 0, ht: H }, { ax: -230, az: -1340, bx: -190, bz: -1340, hb: 0, ht: H });
  plane(g, 200, 150, -290, -1, -1415, 0, 90, 'floor f-herring');
  plane(g, 120, 270, -290, -135, -1450, 0, 0, 'stairwell', '<i></i><i></i><i></i><i></i><i></i><i></i>');
  const bd = group(g, -350, 0, -1340 + 4, 0, 'hinge basement');
  plane(bd, 120, 280, 60, -140, 4, 0, 0, 'door-leaf basement-door', '<i class="panel"></i><i class="knob"></i>');
  play(bd, 'basement');
  plane(bd, 120, 280, 60, -140, 0, 180, 0, 'door-leaf in');
  /* light: a lantern over the turn, art up the wall */
  for (const [x, z, a] of [[-398 + 12, -1250, 'a1']]) pic(g, 'E', -400, -1250, 240, 110, 140, 'art ' + a, '', 0);
  pic(lg, 'E', -400, -1300, 240, 110, 140, 'art a4', '', 1);
  win(lg, 'S', -1500, 100, 250, 130, 300, 'arch tall', 1);
  chair(lg, { x: -250, z: -1420, ry: 0, base: LH, cls: 'm-olive', w: 86 });
  plant(g, 240, -860, 0, .8);
  box(g, { x: -300, z: -1180, w: 60, d: 140, h: 44, cls: 'm-walnut' });
}

/* ---------- the kitchen: care. one olive wall, a tiny island, breakfast in the bay ---------- */
{
  const g = G.kitchen;
  /* the olive wall: sink, range under a plaster hood, glass-front cupboards, the fridge with her people on it */
  box(g, { x: 480, z: -1015, w: 300, d: 70, h: 90, cls: 'm-sage', front: '<i class="shaker"></i>' });
  box(g, { x: 480, z: -1012, w: 306, d: 76, h: 8, lift: 90, cls: 'm-marble', solid: false });
  box(g, { x: 480, z: -1020, w: 70, d: 44, h: 4, lift: 98, cls: 'm-sink', solid: false });
  box(g, { x: 480, z: -1040, w: 30, d: 20, h: 40, lift: 98, cls: 'm-brass', solid: false });
  box(g, { x: 800, z: -1015, w: 160, d: 70, h: 90, cls: 'm-range', front: '<i class="knobs"></i><i class="oven"></i>' });
  box(g, { x: 800, z: -1020, w: 180, d: 60, h: 130, lift: 260, cls: 'm-plaster', solid: false });
  box(g, { x: 975, z: -1015, w: 190, d: 70, h: 90, cls: 'm-sage', front: '<i class="shaker"></i>' });
  box(g, { x: 900, z: -1012, w: 350, d: 76, h: 8, lift: 90, cls: 'm-marble', solid: false });
  mount(g, 'S', -1050, 690, 160, 760, 140, 'zellige', '', T + 1);
  for (const x of [480, 975]) box(g, { x, z: -1030, w: x === 480 ? 300 : 190, d: 40, h: 120, lift: 310, cls: 'm-sage', solid: false, front: '<i class="glassfront"><b></b><b></b><b></b></i>' });
  tag(box(g, { x: 1210, z: -1015, w: 160, d: 70, h: 400, cls: 'm-panel', front: `<i class="seam"></i><i class="pull a"></i><i class="pull b"></i><span class="ledge"><img src="../photos/01-fridge.jpg" alt=""><i class="note n1"></i><i class="note n2"></i></span>` }), 'heart');
  target('heart', 'kitchen', 'S', -980, 1210, 200, 180, 400, { minDist: 340 });
  /* the tiny island: black base, butcher-block top, two stools */
  box(g, { x: 760, z: -620, w: 230, d: 100, h: 84, cls: 'm-ink', front: '<i class="shaker"></i>' });
  box(g, { x: 760, z: -620, w: 250, d: 116, h: 8, lift: 84, cls: 'm-butcher', solid: false });
  for (const x of [710, 810]) { box(g, { x, z: -530, w: 40, d: 40, h: 64, cls: 'm-iron', solid: false }); box(g, { x, z: -530, w: 44, d: 44, h: 6, lift: 64, cls: 'm-teak', solid: false }); }
  flowers(g, 790, -630, 0, 92, 'hyd', .5);
  for (const x of [700, 820]) pendant(g, x, -620, 0, 140, 'm-globe-glass');
  /* breakfast in the bay: a curved banquette, a round walnut table, the deck of questions */
  box(g, { x: 1420, z: -650, w: 400, d: 70, h: 46, ry: -90, cls: 'm-walnut' });
  box(g, { x: 1420, z: -650, w: 396, d: 66, h: 14, lift: 46, ry: -90, cls: 'm-floral', solid: false });
  box(g, { x: 1450, z: -650, w: 400, d: 16, h: 90, lift: 60, ry: -90, cls: 'm-floral curve', solid: false });
  box(g, { x: 1330, z: -650, w: 24, d: 24, h: 72, cls: 'm-walnut-dk', solid: false });
  box(g, { x: 1330, z: -650, w: 150, d: 150, h: 8, lift: 72, cls: 'm-walnut round' });
  tag(box(g, { x: 1320, z: -660, w: 46, d: 32, h: 12, lift: 80, ry: -12, cls: 'm-cards', solid: false, top: '<i class="cards-top">Ask her<small>anything</small></i>' }), 'ask');
  box(g, { x: 1350, z: -620, w: 18, d: 18, h: 16, lift: 80, cls: 'm-cup round', solid: false, top: '<i class="latte-art"></i>' });
  target('ask', 'kitchen', 'W', 1300, -650, 90, 260, 170, { minDist: 300 });
  pendant(g, 1340, -650, 0, 150, 'm-pleat');
  for (const [x, z] of [[1380, -880]]) plane(g, 140, 320, x, -160, z + 4, 0, 0, 'french-door two', '<i></i><i></i>');
  rug(g, 360, 260, 760, -560, 0, ['#EFE5D3', '#9AA383', '#B97979', '#A0522D', '#5E6846']);
}

/* ---------- the movie room: plum velvet, a deep sofa, no windows, as far from the books as it gets ---------- */
{
  const g = G.movie;
  mount(g, 'W', 1300, -1275, 240, 400, 230, 'cinema', '<i></i>', T + 3);
  for (const z of [-1520 + 30, -1030 - 30]) mount(g, 'W', 1300, z + (z < -1275 ? 70 : -70), H / 2, 90, H - 30, 'drape velvet', '', T + 10);
  sofa(g, { x: 640, z: -1275, ry: 90, w: 380, cls: 'm-velvet' });
  box(g, { x: 660, z: -1400, w: 70, d: 22, h: 50, lift: 56, ry: 96, cls: 'm-cushion m-blush', solid: false });
  plane(g, 120, 90, 620, -60, -1180, -90, 0, 'throw');
  box(g, { x: 880, z: -1275, w: 160, d: 110, h: 40, cls: 'm-ottoman round' });
  box(g, { x: 880, z: -1280, w: 40, d: 40, h: 30, lift: 40, cls: 'm-popcorn', solid: false });
  tag(box(g, { x: 900, z: -1472, w: 320, d: 50, h: 150, cls: 'm-walnut', front: `<div class="case lit"><div class="shelf-row"><span class="romcom-row">${['Pride &amp; Prejudice', 'Notting Hill', 'Crazy Rich Asians', 'Kuch Kuch Hota Hai', 'Pretty Woman', 'Mamma Mia'].map(t => `<em>${t}</em>`).join('')}</span></div><div class="shelf-row">${books(22, 41)}</div></div>` }), 'icks');
  target('icks', 'movie', 'S', -1447, 900, 80, 340, 160, { minDist: 320 });
  for (const z of [-1450, -1100]) sconce(g, 'E', 300, z, 280, 0);
  rug(g, 520, 360, 760, -1275, 0, ['#5A404D', '#7A2E3A', '#B08D57', '#3B271F', '#8E4B47']);
}

/* ---------- the laundry, the mudroom, the pantry: the house's quiet machinery ---------- */
{
  const l = G.laundry, m = G.mudroom, p = G.pantry;
  for (const x of [400, 520]) box(l, { x, z: -112, w: 110, d: 70, h: 100, cls: 'm-washer', front: '<i class="porthole"></i>' });
  box(l, { x: 460, z: -112, w: 240, d: 74, h: 6, lift: 100, cls: 'm-butcher', solid: false });
  mount(l, 'S', -150, 460, 260, 260, 60, 'cup-shelf', '<i></i><i></i><i></i>', T + 16);
  box(l, { x: 680, z: -112, w: 120, d: 70, h: 90, cls: 'm-sage', front: '<i class="shaker"></i>' });
  box(m, { x: 1195, z: 165, w: 190, d: 60, h: 46, ry: 180, cls: 'm-walnut' });
  mount(m, 'N', 200, 1195, 260, 200, 140, 'pegs', '<i class="coat a"></i><i class="coat b"></i><i class="scarf"></i><i class="tote"></i>', T + 12);
  box(m, { x: 1150, z: 120, w: 50, d: 40, h: 26, cls: 'm-boots', solid: false });
  pic(m, 'E', 800, -90, 260, 90, 110, 'art a1', '', 0);
  box(p, { x: 1672, z: -100, w: 480, d: 56, h: 380, ry: -90, cls: 'm-walnut', front: '<div class="jars-wall"><div class="jars"><i class="j1"></i><i class="j2"></i><i class="j3"></i><i class="tin"></i></div><div class="jars"><i class="pasta"></i><i class="oil"></i><i class="j1"></i><i class="tin r"></i></div><div class="jars"><i class="j3"></i><i class="j2"></i><i class="pasta"></i><i class="j1"></i></div></div>' });
  box(p, { x: 1500, z: -322, w: 360, d: 56, h: 380, cls: 'm-walnut', front: '<div class="jars-wall"><div class="jars"><i class="j2"></i><i class="tin"></i><i class="j1"></i></div><div class="jars"><i class="oil"></i><i class="pasta"></i><i class="j3"></i></div><div class="jars"><i class="j1"></i><i class="j2"></i><i class="tin r"></i></div></div>' });
  pendant(p, 1480, -60, 0, 90, 'm-opal');
}

/* ---------- the garage: two arches, her car, storage done properly ---------- */
{
  const g = G.garage;
  const car = group(g, 600, 0, 560, 180, 'car');
  box(car, { x: 0, z: 0, w: 200, d: 410, h: 58, lift: 24, cls: 'm-car', solid: false });
  box(car, { x: 0, z: -140, w: 196, d: 120, h: 28, lift: 82, cls: 'm-car', solid: false });
  for (const sx of [-50, 50]) box(car, { x: sx, z: 40, w: 70, d: 66, h: 42, lift: 82, cls: 'm-seat', solid: false });
  plane(car, 186, 56, 0, -112, -60, 0, -30, 'windshield');
  for (const [x, z] of [[-101, -130], [101, -130], [-101, 140], [101, 140]]) plane(car, 62, 62, x, -31, z, x < 0 ? -90 : 90, 0, 'wheel');
  solidRect(600, 560, 210, 420);
  /* a storage closet in the corner, shelves down one wall, a workbench by the side door */
  for (const [w, x, z, ry] of [[240, 1080 - T, 320, -90], [220, 1190, 440 + T, 0]]) plane(g, w, H, x, -H / 2, z, ry, 0, 'wall w-garage');
  WALLS.push({ ax: 1080, az: 200, bx: 1080, bz: 440, hb: 0, ht: H }, { ax: 1080, az: 440, bx: 1300, bz: 440, hb: 0, ht: H });
  mount(g, 'W', 1080, 320, 150, 110, 290, 'storage-door', '<i></i>', T + 2);
  box(g, { x: 1272, z: 780, w: 220, d: 56, h: 380, ry: -90, cls: 'm-walnut', front: '<i class="tools"></i>' });
  box(g, { x: 330, z: 370, w: 260, d: 60, h: 90, ry: 90, cls: 'm-walnut', front: '<i class="drawers"></i>' });
  mount(g, 'E', 300, 370, 230, 240, 120, 'pegboard', '<i></i>', T + 2);
  box(g, { x: 900, z: 760, w: 110, d: 60, h: 70, cls: 'm-trunkcase' });
  pendant(g, 800, 560, 0, 80, 'm-lantern');
}

/* =============================== UPSTAIRS · her people, her ambition, her rooms =============================== */
const B1 = LH;

/* ---------- the guest room: two queen beds, two closets, both bay windows ---------- */
{
  const g = G.guest;
  box(g, { x: -1672, z: -620, w: 300, d: 56, h: 380, ry: 90, base: B1, cls: 'm-sage', front: '<i class="wardrobe-doors"></i>' });
  box(g, { x: -428, z: -650, w: 260, d: 56, h: 380, ry: -90, base: B1, cls: 'm-sage', front: '<i class="wardrobe-doors"></i>' });
  for (const x of [-1250, -850]) {
    box(g, { x, z: -788, w: 230, d: 20, h: 150, base: B1, cls: 'm-upholster curve' });
    box(g, { x, z: -640, w: 220, d: 300, h: 48, base: B1, cls: 'm-walnut' });
    box(g, { x, z: -620, w: 224, d: 260, h: 26, lift: 48, base: B1, cls: 'm-quilt sage', solid: false });
    for (const dx of [-55, 55]) box(g, { x: x + dx, z: -760, w: 96, d: 44, h: 22, lift: 74, base: B1, cls: 'm-cushion m-linen', solid: false });
  }
  box(g, { x: -1050, z: -770, w: 70, d: 56, h: 60, base: B1, cls: 'm-walnut' }); tableLamp(g, -1050, -770, B1, 60);
  box(g, { x: -1050, z: -420, w: 160, d: 50, h: 44, base: B1, cls: 'm-walnut' });
  box(g, { x: -1050, z: -420, w: 90, d: 50, h: 56, lift: 44, base: B1, cls: 'm-suitcase', solid: false });
  for (const b of BAYS.filter(b => b.room === 'guest')) { windowSeat(g, b, B1, 'm-blush'); drapes(g, 'N', 0, (b.x0 + b.x1) / 2, 280, 1, 'rose'); }
  win(g, 'E', -1700, -300, 240, 120, 220, 'shutter', 1);
  flowers(g, -1050, -770, B1, 60, 'hyd', .5);
  rug(g, 520, 340, -1050, -480, B1, ['#EFE5D3', '#9AA383', '#B97979', '#A0522D', '#5E6846']);
  crystal(g, -1050, -420, H, 90, 90, B1);
}

/* ---------- the study: ambition. above the books, the spiral climbing through ---------- */
{
  const g = G.study;
  windowSeat(g, BAYS.find(b => b.room === 'study'), B1, 'm-blush');
  box(g, { x: -1180, z: -1260, w: 320, d: 140, h: 10, lift: 74, base: B1, cls: 'm-walnut', solid: false });
  for (const [dx, dz] of [[-145, -55], [145, -55], [-145, 55], [145, 55]]) box(g, { x: -1180 + dx, z: -1260 + dz, w: 12, d: 12, h: 74, base: B1, cls: 'm-walnut-dk', solid: false });
  solidRect(-1180, -1260, 320, 140, 0, B1);
  tag(box(g, { x: -1180, z: -1305, w: 220, d: 10, h: 130, lift: 96, base: B1, cls: 'm-monitor', solid: false, front: `<div class="screen"><p><i>// she built this</i></p><p><b>const</b> her = {</p><p>&nbsp; frameworks: <em>0</em>,</p><p>&nbsp; creative: <em>91.7</em>,</p><p>&nbsp; finished: <em>false</em></p><p>};</p></div>` }), 'built');
  box(g, { x: -1290, z: -1230, w: 70, d: 50, h: 5, lift: 84, ry: 10, base: B1, cls: 'm-sketchbook', solid: false, top: '<i class="sketch"></i>' });
  box(g, { x: -1060, z: -1240, w: 18, d: 18, h: 16, lift: 84, base: B1, cls: 'm-cup round', solid: false, top: '<i class="latte-art"></i>' });
  box(g, { x: -1180, z: -1150, w: 80, d: 76, h: 46, base: B1, cls: 'm-leather' });
  box(g, { x: -1180, z: -1116, w: 80, d: 12, h: 60, lift: 46, base: B1, cls: 'm-leather curve', solid: false });
  target('built', 'study', 'S', -1300, -1180, 170, 340, 240, { minDist: 340 });
  tag(mount(g, 'W', -950, -1350, 260, 260, 200, 'worldmap', ['Austin', 'New York', 'London', 'Barcelona', 'Singapore', 'India'].map((c, i) => `<i class="pin p${i}"><b>${c}</b></i>`).join(''), T + 3, 1), 'thrive');
  target('thrive', 'study', 'W', -950, -1350, 260, 260, 200);
  tag(mount(g, 'E', -1700, -1300, 260, 300, 240, 'linen', `<p class="rj-h">Offers she turned down</p>` + TOMBS.slice(0, 6).map(([j], i) => `<div class="letter l${i}"><small>Offer</small><b>${j}</b><i>Declined</i></div>`).join(''), T + 3, 1), 'rip');
  target('rip', 'study', 'E', -1700, -1300, 260, 300, 240);
  tag(mount(g, 'N', -800, -1180, 260, 420, 240, 'gallery', `<div class="frames">` + SPIRIT.map(([t, , ev], i) => `<button class="frame post" data-stop="spirit" data-sub="${i}"><span class="art a${i}"></span><span class="lbl"><b>${t}</b><small>${ev}</small></span></button>`).join('') + `</div>`, T + 3, 1), 'spirit');
  target('spirit', 'study', 'N', -800, -1180, 260, 420, 240);
  tag(mount(g, 'S', -1500, -1585, 262, 170, 220, 'sampler post', `<small>what she lives by</small><ol>${VALUES.map(([v, s]) => `<li><span>${v}</span><em>${s}</em></li>`).join('')}</ol>`, T + 3, 1), 'values');
  target('values', 'study', 'S', -1500, -1585, 262, 170, 220, { at: [-1290, -1150] });
  floorLamp(g, -1020, -1440, B1, 250);
  rug(g, 460, 340, -1180, -1220, B1, ['#E7D7BE', '#7B8060', '#B97979', '#A0522D', '#394837']);
  pendant(g, -1180, -1260, B1, 120, 'm-brass-dome');
}

/* ---------- the back hall, the guest bath, the upstairs hall ---------- */
{
  const h = G.hall, b = G.gbath, u = G.uphall;
  box(h, { x: -680, z: -830, w: 200, d: 50, h: 76, ry: 180, base: B1, cls: 'm-walnut' });
  tableLamp(h, -740, -830, B1, 76); flowers(h, -620, -830, B1, 76, 'rose', .5);
  pic(h, 'S', -1100, -530, 260, 100, 130, 'art a4', '', 1);
  rug(h, 420, 140, -680, -950, B1, ['#E7D7BE', '#B97979', '#7B8060', '#A0522D', '#5A404D']);
  box(b, { x: -600, z: -1440, w: 300, d: 110, h: 60, base: B1, cls: 'm-tub' });
  box(b, { x: -600, z: -1440, w: 270, d: 86, h: 4, lift: 56, base: B1, cls: 'm-water', solid: false });
  box(b, { x: -922, z: -1300, w: 200, d: 56, h: 86, ry: 90, base: B1, cls: 'm-sage', front: '<i class="drawers"></i>' });
  mount(b, 'E', -950, -1300, 250, 110, 130, 'mirror-arch', '', T + 3, 1);
  win(b, 'S', -1500, -680, 290, 140, 160, 'frost', 1);
  plant(b, -460, -1150, B1, .7);
  box(u, { x: 200, z: -770, w: 160, d: 56, h: 300, base: B1, cls: 'm-ivory', front: '<i class="wardrobe-doors"></i>' });
  box(u, { x: -250, z: -40, w: 200, d: 50, h: 44, ry: 180, base: B1, cls: 'm-walnut' });
  for (const x of [-250, 150]) win(u, 'N', 0, x, 240, 120, 230, 'shutter', 1);
  pic(u, 'E', -400, -680, 260, 100, 130, 'art a2', '', 1);
  rug(u, 160, 600, -80, -380, B1, ['#E7D7BE', '#B97979', '#7B8060', '#A0522D', '#5A404D']);
}

/* ---------- her closet: her happy place. two storeys, a chandelier, a chaise, shelves to the sky ---------- */
{
  const g = G.closet, top = ROOMS.closet.tall;
  const cases = (x, z, w, ry, kind) => box(g, { x, z, w, d: 56, h: 400, ry, base: B1, cls: 'm-cream', front: kind === 'hang'
    ? `<div class="boutique"><i class="rail"></i>${['silk', 'lehenga', 'linen', 'blazer'].map(c => `<i class="dress ${c}"></i>`).join('')}<div class="shoes"><i></i><i></i><i></i><i></i></div><i class="glassdoor"></i></div>`
    : '<div class="glasscase"><i class="bag a"></i><i class="bag b"></i><i class="bag c"></i><i class="shelf"></i><i class="heels"></i></div>' });
  for (const [x, kind] of [[420, 'case'], [640, 'hang'], [860, 'case']]) play(cases(x, -1472, 210, 0, kind), 'words');
  for (const [z, kind] of [[-1350, 'hang'], [-1120, 'case'], [-890, 'hang'], [-660, 'case'], [-430, 'hang']]) play(cases(328, z, 220, 90, kind), 'words');
  for (const [z, kind, w] of [[-1060, 'case', 220], [-600, 'hang', 180], [-420, 'case', 120]]) play(cases(1272, z, w, -90, kind), 'words');
  win(g, 'W', 1300, -800, 400, 180, 520, 'arch tall', 1);
  drapes(g, 'W', 1300, -800, 180, 1, 'rose');
  /* the sitting place under the chandelier: a cream chaise with a sheepskin, a marble block, a curved chair */
  const chaise = group(g, 640, -B1, -620, 0, 'chaise');
  box(chaise, { x: 0, z: 0, w: 260, d: 90, h: 40, cls: 'm-cream', solid: false });
  box(chaise, { x: -110, z: 0, w: 50, d: 90, h: 90, cls: 'm-cream curve', solid: false });
  plane(chaise, 140, 80, 20, -42, 0, 0, 90, 'sheepskin');
  solidRect(640, -620, 260, 90, 0, B1);
  box(g, { x: 640, z: -780, w: 150, d: 110, h: 50, base: B1, cls: 'm-marble' });
  box(g, { x: 620, z: -790, w: 60, d: 44, h: 14, lift: 50, base: B1, cls: 'm-bookstack', solid: false });
  chair(g, { x: 640, z: -930, ry: 0, base: B1, cls: 'm-upholster', w: 90 });
  rug(g, 520, 520, 660, -760, B1, ['#F3EBDD', '#EBC5C7', '#E7D7BE', '#C99B98', '#B08D57']);
  crystal(g, 680, -780, top, 380, 170, B1);
  /* the long mirror, with her words tucked into the frame */
  tag(mount(g, 'N', -300, 1050, 230, 150, 360, 'longmirror', WORDS.slice(0, 6).map(([k], i) => `<span class="tuck n${i}">${k}</span>`).join(''), T + 3, 1), 'words');
  target('words', 'closet', 'N', -300, 1050, 230, 180, 360, { minDist: 320 });
  flowers(g, 600, -800, B1, 64, 'rose', .55);
}

/* ---------- her bedroom: a perfect rectangle. a canopy bed, the great arched window, the turret nook ---------- */
{
  const g = G.bedroom;
  mount(g, 'S', -300, 1020, H / 2, 470, H, 'paper-block', '', T + 1, 1);
  const bx = 1020, bz = -100;
  box(g, { x: bx, z: -288, w: 360, d: 22, h: 200, base: B1, cls: 'm-upholster curve' });
  box(g, { x: bx, z: bz, w: 360, d: 380, h: 46, base: B1, cls: 'm-walnut' });
  box(g, { x: bx, z: bz + 10, w: 350, d: 370, h: 30, lift: 46, base: B1, cls: 'm-linen', solid: false });
  box(g, { x: bx, z: bz + 60, w: 364, d: 260, h: 8, lift: 76, base: B1, cls: 'm-quilt', solid: false });
  for (const [dx, c, big] of [[-80, 'm-linen', 1], [80, 'm-linen', 1], [-30, 'm-floral', 0], [40, 'm-blush', 0]]) box(g, { x: bx + dx, z: -240 + (big ? 0 : 26), w: big ? 130 : 64, d: big ? 54 : 20, h: big ? 24 : 46, lift: 76, base: B1, cls: 'm-cushion ' + c, solid: false });
  for (const [dx, dz] of [[-175, -185], [175, -185], [-175, 185], [175, 185]]) box(g, { x: bx + dx, z: bz + dz, w: 8, d: 8, h: 380, base: B1, cls: 'm-walnut-dk', solid: false });
  plane(g, 360, 380, bx, -B1 - 380, bz, 0, 90, 'canopy top');
  for (const dx of [-180, 180]) plane(g, 380, 300, bx + dx, -B1 - 230, bz, 90, 0, 'canopy side');
  for (const x of [800, 1240]) { box(g, { x, z: -250, w: 64, d: 70, h: 66, base: B1, cls: 'm-walnut' }); tableLamp(g, x, -250, B1, 66); }
  win(g, 'N', 900, 800, 250, 520, 400, 'palladian', 1);
  box(g, { x: 800, z: 860, w: 560, d: 70, h: 46, base: B1, cls: 'm-walnut' });
  box(g, { x: 800, z: 860, w: 550, d: 66, h: 14, lift: 46, base: B1, cls: 'm-blush', solid: false });
  chair(g, { x: 450, z: 700, ry: 150, base: B1, cls: 'm-floral', w: 90 });
  floorLamp(g, 360, 820, B1, 250);
  box(g, { x: 330, z: 560, w: 180, d: 60, h: 76, ry: 90, base: B1, cls: 'm-walnut' });
  mount(g, 'E', 300, 560, 240, 110, 140, 'mirror-arch', '', T + 3, 1);
  box(g, { x: 400, z: 560, w: 50, d: 50, h: 44, base: B1, cls: 'm-pouf round' });
  drapes(g, 'W', 1300, 400, 200, 1, 'rose');
  win(g, 'W', 1300, 720, 240, 140, 230, 'shutter', 1);
  rug(g, 640, 560, 900, 250, B1, ['#F1E4DC', '#C99B98', '#8E9A6C', '#B97979', '#8E4B47']);
  chandelier(g, 900, 250, B1, 90);
}

/* ---------- the reading nook in the turret: a window seat all the way round, a lamp, her journal ---------- */
{
  const g = G.nook;
  const OCT = k => { const a = (k * 45 + 22.5) * RAD; return [TUR.x + Math.cos(a) * TUR.ro, TUR.z + Math.sin(a) * TUR.ro]; };
  for (let k = 0; k < 8; k++) {
    const [ax, az] = OCT(k), [bx, bz] = OCT(k + 1), mx = (ax + bx) / 2, mz = (az + bz) / 2, len = Math.hypot(bx - ax, bz - az), ry = -Math.atan2(bz - az, bx - ax) / RAD;
    const nx = TUR.x - mx, nz = TUR.z - mz, nl = Math.hypot(nx, nz), ix = mx + nx / nl * 6, iz = mz + nz / nl * 6;
    if (Math.abs(mx - 300) < 20 && Math.abs(mz - 160) < 40) continue;
    plane(g, len, H, ix, -B1 - H / 2, iz, ry, 0, 'wall w-shell two');
    WALLS.push({ ax, az, bx, bz, hb: B1, ht: B1 + H });
    if (k % 2 === 0) plane(g, 50, 160, mx + nx / nl * 3, -(B1 + 250), mz + nz / nl * 3, ry, 0, 'win slit-in two');
  }
  const oct = 'polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)';
  const fl = plane(g, 300, 300, TUR.x, -B1, TUR.z, 0, 90, 'floor f-plank'); fl.style.clipPath = oct;
  const cl = plane(g, 300, 300, TUR.x, -B1 - H, TUR.z, 0, -90, 'ceil c-floral'); cl.style.clipPath = oct;
  box(g, { x: 60, z: 160, w: 220, d: 70, h: 44, ry: 90, base: B1, cls: 'm-walnut' });
  box(g, { x: 60, z: 160, w: 216, d: 66, h: 14, lift: 44, ry: 90, base: B1, cls: 'm-blush', solid: false });
  box(g, { x: 150, z: 60, w: 50, d: 50, h: 56, base: B1, cls: 'm-walnut round' });
  tableLamp(g, 150, 60, B1, 56);
  tag(box(g, { x: 140, z: 70, w: 40, d: 30, h: 8, lift: 56, base: B1, cls: 'm-journal', solid: false, top: '<i class="pages">the pattern</i>' }), 'pattern');
  target('pattern', 'nook', 'E', 160, 70, 60, 140, 100, { minDist: 90 });
  plane(g, 120, 60, 90, -B1 - 60, 160, 90, 90, 'throw');
}

/* ---------- her bathroom, beside the balcony: a freestanding tub, a window to the morning ---------- */
{
  const g = G.bath;
  box(g, { x: 1520, z: -60, w: 110, d: 240, h: 70, base: B1, cls: 'm-tub' });
  box(g, { x: 1520, z: -60, w: 86, d: 210, h: 4, lift: 66, base: B1, cls: 'm-water', solid: false });
  box(g, { x: 1520, z: 70, w: 8, d: 8, h: 100, base: B1, cls: 'm-brass', solid: false });
  box(g, { x: 1450, z: -322, w: 220, d: 56, h: 86, base: B1, cls: 'm-sage', front: '<i class="drawers"></i>' });
  mount(g, 'S', -350, 1450, 250, 110, 140, 'mirror-arch', '', T + 3, 1);
  for (const x of [1370, 1530]) sconce(g, 'S', -350, x, 280, 1);
  plane(g, 140, 300, 1630, -B1 - 150, -210, 90, 0, 'shower-glass two');
  win(g, 'W', 1700, -100, 260, 140, 260, 'arch', 1);
  plant(g, 1640, 100, B1, .7);
  for (const x of [1600, 1620]) box(g, { x, z: 120, w: 12, d: 12, h: 24, base: B1, cls: 'm-candle', solid: false });
  pendant(g, 1500, -100, B1, 90, 'm-opal');
}

/* ---------- her balcony, over the side porch: two chairs, a café table, jasmine on the iron ---------- */
{
  const g = G.balcony;
  plane(g, 400, 500, 1500, -B1, 400, 0, 90, 'floor f-deck');
  plane(g, 400, 500, 1500, -B1 + 14, 400, 0, -90, 'soffit');
  for (const [w, x, z, ry] of [[500, 1700, 400, 90], [400, 1500, 650, 0]]) plane(g, w, 100, x, -B1 - 50, z, ry, 0, 'iron two');
  WALLS.push({ ax: 1700, az: 150, bx: 1700, bz: 650, hb: B1, ht: B1 + 110 }, { ax: 1300, az: 650, bx: 1700, bz: 650, hb: B1, ht: B1 + 110 });
  box(g, { x: 1560, z: 400, w: 70, d: 70, h: 64, base: B1, cls: 'm-iron round' });
  for (const z of [310, 490]) box(g, { x: 1560, z, w: 48, d: 48, h: 44, base: B1, cls: 'm-iron round' });
  box(g, { x: 1560, z: 400, w: 18, d: 18, h: 14, lift: 64, base: B1, cls: 'm-cup round', solid: false, top: '<i class="latte-art"></i>' });
  for (const z of [200, 600]) plant(g, 1650, z, B1, .7);
  plane(g, 500, 120, 1702, -B1 - 70, 400, 90, 0, 'jasmine-vine');
}

/* =============================== THE SPIRAL STAIRS =============================== */
const STYLE = { spiral: 'walnut', grand: 'grand', closetstair: 'white' };
for (const h of HELIXES) {
  const g = G[h.id], n = Math.round(h.spin / (Math.PI / 9)), du = h.spin / n, rm = (h.r + 26) / 2, w = h.r - 30;
  for (let k = 0; k < n; k++) {
    const u = (k + .5) * du, [x, z] = helixPt(h, u, rm), y = h.pf0 + (k + 1) * h.rise / n, a = h.a0 - u;
    plane(g, w, rm * du * 1.25, x, -y, z, -a / RAD, 90, 'tread ' + STYLE[h.id]);
    if (k % 3 === 0) { const [bx, bz] = helixPt(h, u, h.r - 8); plane(g, 5, 96, bx, -y - 48, bz, -a / RAD + 90, 0, 'baluster two ' + STYLE[h.id]); }
  }
  box(g, { x: h.cx, z: h.cz, w: 26, d: 26, h: h.rise + 110, base: h.pf0, cls: h.id === 'closetstair' ? 'm-ivory round' : 'm-brass round', solid: false });
  SOLIDS.push({ x0: h.cx - 24, x1: h.cx + 24, z0: h.cz - 24, z1: h.cz + 24, hb: h.pf0, ht: h.pf0 + h.rise + 200 });
}
/* balustrades round the stairwells where you arrive, and along the closet gallery */
const rail = (g, ax, az, bx, bz, pf, cls = 'banister flat') => {
  const len = Math.hypot(bx - ax, bz - az), ry = -Math.atan2(bz - az, bx - ax) / RAD;
  plane(g, len, 100, (ax + bx) / 2, -pf - 50, (az + bz) / 2, ry, 0, cls + ' two');
  WALLS.push({ ax, az, bx, bz, hb: pf, ht: pf + 110 });
};
{
  const q = HSQ(HELIXES[1]);
  rail(G.landing, q.x0, q.z0, q.x1, q.z0, LH); rail(G.landing, q.x1, q.z0, q.x1, q.z1, LH); rail(G.landing, q.x0, q.z1, q.x1, q.z1, LH);
  const s = HSQ(HELIXES[0]);
  rail(G.study, s.x0, s.z0, s.x1, s.z0, LH); rail(G.music, s.x0, s.z0, s.x1, s.z0, ATTIC);
  const c = HSQ(HELIXES[2]);
  rail(G.gallery, c.x0, c.z0, c.x0, c.z1, ATTIC, 'banister white'); rail(G.gallery, c.x0, c.z1, c.x1, c.z1, ATTIC, 'banister white'); rail(G.gallery, c.x1, c.z0, c.x1, c.z1, ATTIC, 'banister white');
}

/* =============================== THE CLOSET GALLERY: shelves to the sky =============================== */
{
  const g = G.gallery, A = ATTIC;
  for (const s of GALLERY) for (const p of rectMinus(s, holesAt(2))) {
    plane(g, p.x1 - p.x0, p.z1 - p.z0, (p.x0 + p.x1) / 2, -A, (p.z0 + p.z1) / 2, 0, 90, 'floor f-oak');
    plane(g, p.x1 - p.x0, p.z1 - p.z0, (p.x0 + p.x1) / 2, -A + 10, (p.z0 + p.z1) / 2, 0, -90, 'soffit cream');
  }
  rail(g, 500, -1300, 970, -1300, A, 'banister white'); rail(g, 500, -1300, 500, -300, A, 'banister white'); rail(g, 1100, -1140, 1100, -300, A, 'banister white');
  const shelves = (x, z, w, ry) => box(g, { x, z, w, d: 50, h: 380, ry, base: A, cls: 'm-cream', front: '<div class="folded"><i></i><i></i><i></i><i></i></div>' });
  for (const x of [420, 640, 860]) shelves(x, -1475, 210, 0);
  for (const z of [-1350, -1120, -890, -660, -430]) shelves(325, z, 220, 90);
  for (const z of [-1060, -480]) shelves(1275, z, 220, -90);
}

/* a skylight set into the roof, seen from outside or from inside */
function skylight(g, x, z, front, inside) {
  const th = Math.atan(720 / 790) / RAD, y = ROOFH(z) + (inside ? -6 : 3);
  const p = plane(g, 150, 130, x, -y, z, 0, 0, inside ? 'skylight-in' : 'skylight');
  p.style.transform = `translate3d(${x}px,${-y}px,${z}px) ` + (inside ? `rotateX(${front ? -(90 + th) : -(90 - th)}deg)` : front ? `rotateX(${90 - th}deg)` : `rotateY(180deg) rotateX(${90 - th}deg)`);
}

/* =============================== THE MUSIC ROOM: above the study, under the roof =============================== */
const ROOFH = z => z > -750 ? EAVE + (40 - z) * (720 / 790) : EAVE + (z + 1540) * (720 / 790);   // the roof's height above any point
{
  const g = G.music, A = ATTIC;
  for (const p of rectMinus(ROOMS.music, holesAt(2))) plane(g, p.x1 - p.x0, p.z1 - p.z0, (p.x0 + p.x1) / 2, -A, (p.z0 + p.z1) / 2, 0, 90, 'floor f-herring');
  /* the partitions: one runs under the slope, cut to the roof's line */
  const ep = plane(g, 700, H, -950, -A - H / 2, -1150, 90, 0, 'wall w-plaster two');
  ep.style.clipPath = 'polygon(0 0, 68% 0, 100% 46%, 100% 100%, 0 100%)';
  WALLS.push({ ax: -950, az: -1500, bx: -950, bz: -800, hb: A, ht: A + H });
  for (const [x0, x1] of [[-1700, -1400], [-1200, -950]]) { plane(g, x1 - x0, H, (x0 + x1) / 2, -A - H / 2, -800, 0, 0, 'wall w-plaster two'); WALLS.push({ ax: x0, az: -800, bx: x1, bz: -800, hb: A, ht: A + H }); }
  plane(g, 200, H - 300, -1300, -A - 300 - (H - 300) / 2, -800, 0, 0, 'wall w-plaster two');
  /* the bay rises up through the roof here: a flat ceiling over it, and the cheeks where it meets the slope */
  plane(g, 400, 224, -1250, -(A + H), -1388, 0, -90, 'ceil c-ivory');
  const c1 = plane(g, 264, 240, -1450 + 2, -(EAVE + 120), -1408, 90, 0, 'wall w-plaster two'); c1.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%)';
  const c2 = plane(g, 264, 240, -1050 - 2, -(EAVE + 120), -1408, -90, 0, 'wall w-plaster two'); c2.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';
  windowSeat(g, BAYS.find(b => b.room === 'music'), A, 'm-floral');
  /* a black baby grand, a drum kit, a guitar on its stand, a violin on the wall */
  const pg = group(g, -1230, -A, -1010, 0, 'piano');
  const lid = plane(pg, 150, 190, 0, -96, 0, 0, 90, 'piano-top');
  for (const [w, x, z, ry] of [[150, 0, 95, 0], [190, -75, 0, -90], [190, 75, 0, 90], [150, 0, -95, 180]]) plane(pg, w, 30, x, -82, z, ry, 0, 'piano-side');
  for (const [x, z] of [[-60, 80], [60, 80], [0, -80]]) box(pg, { x, z, w: 10, d: 10, h: 68, cls: 'm-ink', solid: false });
  box(pg, { x: 0, z: 104, w: 150, d: 14, h: 6, lift: 74, cls: 'm-keys', solid: false });
  const lp = plane(pg, 150, 170, 0, -150, -10, 0, 0, 'piano-lid two'); lp.style.transform += ' rotateX(-35deg)';
  box(g, { x: -1230, z: -880, w: 90, d: 36, h: 46, base: A, cls: 'm-ink' });
  solidRect(-1230, -1010, 150, 190, 0, A);
  const dk = group(g, -1080, -A, -1390, 0, 'drums');
  box(dk, { x: 0, z: 0, w: 80, d: 50, h: 80, cls: 'm-drum round', solid: false });
  for (const [x, z, s, l] of [[-60, 40, 36, 70], [60, 40, 36, 70], [-30, -10, 30, 82], [30, -10, 30, 82]]) box(dk, { x, z, w: s, d: s, h: 22, lift: l, cls: 'm-drum round', solid: false });
  for (const [x, z] of [[-90, -30], [90, -20]]) { box(dk, { x, z, w: 4, d: 4, h: 130, cls: 'm-brass', solid: false }); plane(dk, 60, 60, x, -132, z, 0, 90, 'cymbal two'); }
  solidRect(-1080, -1390, 200, 120, 0, A);
  const gt = plane(g, 60, 150, -1640, -A - 80, -1250, 70, 0, 'guitar two'); gt.style.transform += ' rotateX(-10deg)';
  mount(g, 'W', -950, -1050, 240, 40, 110, 'violin', '', T + 3, 2);
  rug(g, 440, 360, -1250, -1150, A, ['#E7D7BE', '#7A2E3A', '#B08D57', '#394837', '#5A404D']);
  floorLamp(g, -1600, -880, A, 230);
}

/* =============================== THE ATTIC: the mess of her brain, full of sun =============================== */
{
  const g = G.attic, A = ATTIC, run = 790, rise = RIDGE - EAVE, th = Math.atan(rise / run) / RAD, L = Math.hypot(run, rise);
  for (const p of rectMinus(MAIN, [ROOMS.music])) plane(g, p.x1 - p.x0, p.z1 - p.z0, (p.x0 + p.x1) / 2, -A, (p.z0 + p.z1) / 2, 0, 90, 'floor f-boards');
  plane(g, 650, 120, -475, -A, -60, 0, 90, 'floor f-boards');
  /* the underside of the roof, cut where the glass gable and the music room's bay push through */
  const inside = (x0, x1, front, clip) => {
    const p = plane(g, x1 - x0, L, (x0 + x1) / 2, -(EAVE + RIDGE) / 2, front ? -355 : -1145, 0, 0, 'roof-inside');
    p.style.transform = `translate3d(${(x0 + x1) / 2}px,${-(EAVE + RIDGE) / 2}px,${front ? -355 : -1145}px) rotateX(${front ? -(90 + th) : -(90 - th)}deg)`;
    if (clip) p.style.clipPath = clip;
  };
  inside(-1700, -800, true); inside(-800, -150, true, 'polygon(0 100%, 100% 100%, 100% 20.8%, 50% 66%, 0 20.8%)'); inside(-150, 300, true);
  inside(-1700, -1450, false); inside(-1450, -1050, false, 'polygon(0 0, 100% 0, 100% 66.6%, 0 66.6%)'); inside(-1050, 300, false);
  for (const [x0, x1] of [[-1700, -800], [-150, 300]]) plane(g, x1 - x0, EAVE - A, (x0 + x1) / 2, -(A + EAVE) / 2, -T, 180, 0, 'knee');
  for (const [x0, x1] of [[-1700, -1450], [-1050, 300]]) plane(g, x1 - x0, EAVE - A, (x0 + x1) / 2, -(A + EAVE) / 2, -1500 + T, 0, 0, 'knee');
  for (const [x, ry] of [[-1700 + T, 90], [300 - T, -90]]) {
    const ge = plane(g, 1500, RIDGE - A, x, -(A + RIDGE) / 2, -750, ry, 0, 'gable-in');
    const k = ((RIDGE - EAVE) / (RIDGE - A) * 100).toFixed(1);
    ge.style.clipPath = `polygon(0 100%, 0 ${k}%, 50% 0, 100% ${k}%, 100% 100%)`;
  }
  /* the glass gable's dormer, from inside: its two roof slopes and its cheeks */
  for (const [x, rz, clip] of [[-637.5, -45, 'polygon(0 69.7%, 100% 0, 100% 100%, 0 100%)'], [-312.5, 45, 'polygon(0 0, 100% 69.7%, 100% 100%, 0 100%)']]) {
    const p = plane(g, 459.6, 511, x, -1472.5 + 4, -225.5, 0, 0, 'roof-inside two');
    p.style.transform = `translate3d(${x}px,${-1472.5 + 4}px,-225.5px) rotateZ(${rz}deg) rotateX(90deg)`;
    p.style.clipPath = clip;
  }
  for (const x of [-750, -400, -50]) skylight(g, x, -1050, false, true);
  for (const x of [-1300, 100]) skylight(g, x, -450, true, true);
  for (const [x, z, rx, w] of [[-475, -260, 58, 560], [-475, -330, 66, 420], [-750, -1020, -50, 170], [-50, -1020, -50, 170]]) plane(g, w, 520, x, -(A + 260), z, 0, rx, 'sunbeam two');
  /* the mess: projects in progress and abandoned, a desk in the light, a trunk of photographs */
  box(g, { x: -475, z: -70, w: 300, d: 80, h: 74, base: A, cls: 'm-walnut' });
  box(g, { x: -520, z: -70, w: 60, d: 46, h: 20, lift: 74, base: A, cls: 'm-typewriter', solid: false });
  box(g, { x: -475, z: -160, w: 60, d: 56, h: 44, base: A, cls: 'm-leather' });
  const pj = group(g, 0, 0, 0, 0, 'projects');
  box(pj, { x: -300, z: -560, w: 300, d: 150, h: 72, base: A, cls: 'm-walnut' });
  for (const [x, z, r, c] of [[-380, -560, 10, 'sk'], [-260, -530, -14, 'wf'], [-220, -600, 20, 'pal']]) plane(pj, 80, 60, x, -A - 73, z, 0, 90, 'paper ' + c, '', r);
  box(pj, { x: -330, z: -600, w: 70, d: 50, h: 18, lift: 72, base: A, cls: 'm-cards', solid: false, top: '<i class="cards-top">What would<br>she do?</i>' });
  box(pj, { x: -200, z: -580, w: 50, d: 70, h: 28, lift: 72, base: A, ry: 10, cls: 'm-ideas', solid: false, top: '<i class="ideas">IDEAS</i>' });
  tag(pj, 'quiz');
  target('quiz', 'attic', 'S', -485, -300, 90, 320, 180, { minDist: 300 });
  const tr = box(g, { x: 0, z: -1150, w: 160, d: 90, h: 70, base: A, cls: 'm-trunk-chest', top: `<div class="photos-in">${PHOTOS.slice(0, 5).map(p => `<img src="../${p.src}" alt="">`).join('')}</div>` });
  tag(tr, 'photos'); play(tr, 'photos');
  target('photos', 'attic', 'S', -1105, 0, 80, 260, 160, { minDist: 300 });
  for (const [x, z, lbl] of [[150, -1250, 'Dallas'], [210, -1150, 'Austin'], [160, -1050, 'India']]) box(g, { x, z, w: 90, d: 70, h: 56, base: A, cls: 'm-archive', front: `<i class="lbl">${lbl}</i>` });
  box(g, { x: -400, z: -1310, w: 1000, d: 50, h: 120, base: A, cls: 'm-walnut', front: `<div class="case low">${shelfRows(2, 80, 61)}</div>` });
  for (const [x, z, ry] of [[-850, -1180, 8], [-780, -1200, -6], [-120, -400, 4], [-1500, -300, -8], [-1400, -260, 6]]) plane(g, 110, 140, x, -A - 70, z, ry, 0, 'sketch-board');
  for (const [x, z, c] of [[-1300, -450, 'm-blush'], [-1200, -380, 'm-olive'], [-1380, -360, 'm-floral']]) box(g, { x, z, w: 80, d: 80, h: 22, base: A, cls: 'm-cushion ' + c, solid: false });
  const easel = plane(g, 120, 170, -650, -A - 150, -1000, 20, 0, 'easel'); easel.style.transform += ' rotateX(-8deg)';
  const easel2 = plane(g, 120, 170, -1000, -A - 150, -500, -30, 0, 'easel'); easel2.style.transform += ' rotateX(-8deg)';
  box(g, { x: -1100, z: -650, w: 120, d: 70, h: 90, base: A, cls: 'm-dressform', solid: false });
  plane(g, 1600, 30, -700, -A - 600, -750, 0, 0, 'fairy');
  box(g, { x: -1450, z: -600, w: 24, d: 1000, h: 24, lift: 520, base: A, cls: 'm-walnut-dk', solid: false });
  for (let x = -1500; x <= 250; x += 350) box(g, { x, z: -750, w: 20, d: 1100, h: 20, lift: RIDGE - A - 260, base: A, cls: 'm-walnut-dk', solid: false });
}

/* =============================== OUTSIDE · composed from the street =============================== */
function extWall(g, A, u, n, ry, len, lv, tall, cls) { wall(g, { k: 'x', ry, A, u, n, len }, 'w-ext ' + cls + (lv ? '' : ' plinth'), { lv, tall, offset: T, band: { hb: lv * LH, ht: lv * LH + tall } }); }
const band = (g, x0, x1, z, y0, y1, ry, cls = 'face') => plane(g, Math.abs(x1 - x0), y1 - y0, (x0 + x1) / 2, -(y0 + y1) / 2, z, ry, 0, 'wall w-ext ' + cls);
const bandZ = (g, z0, z1, x, y0, y1, ry, cls = 'side') => plane(g, Math.abs(z1 - z0), y1 - y0, x, -(y0 + y1) / 2, (z0 + z1) / 2, ry, 0, 'wall w-ext ' + cls);
const extWin = (g, face, line, along, up, w, h, kind) => mount(g, face, line, along, up, w, h, 'win ' + kind + ' ext glow', '<i></i><i></i><b></b>', T + 3);
{
  const g = G.ext, hl = G.hingeL, hr = G.hingeR;
  const big = (w, h, x, z, cls) => { const p = plane(g, w / 10, h / 10, x, 2, z, 0, 90, cls); p.style.transform += ' scale(10)'; return p; };
  big(9000, 5000, -200, 2600, 'lawn'); big(3000, 4500, -3200, -1300, 'lawn'); big(3200, 4500, 3200, -1300, 'lawn'); big(9000, 2000, -200, -4150, 'lawn');
  plane(g, 1000, 1000, 800, -1, 1400, 0, 90, 'drive');
  /* the main house: its face swings open like a dollhouse */
  for (const lv of [0, 1]) {
    extWall(hl, [-1700, 0], [1, 0], [0, 1], 0, 2000, lv, LH, 'face');
    extWall(g, [-1700, -1500], [0, 1], [-1, 0], -90, 1500, lv, LH, 'side');
    extWall(g, [300, -1500], [-1, 0], [0, -1], 180, 2000, lv, LH, 'back');
  }
  for (const [x0, x1] of [[-1700, -800], [-150, 300]]) band(hl, x0, x1, T + 2, ATTIC, EAVE, 0, 'face');
  bandZ(g, -1500, 0, -1700 - T, ATTIC, EAVE, -90);
  for (const [x0, x1] of [[-1700, -1450], [-1050, 300]]) band(g, x0, x1, -1500 - T, ATTIC, EAVE, 180, 'back');
  for (const [x, ry] of [[-1700 - T, -90], [300 + T, 90]]) { const ge = plane(g, 1580, RIDGE - EAVE, x, -(EAVE + RIDGE) / 2, -750, ry, 0, 'wall w-ext gable-out'); ge.style.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)'; }
  extWin(g, 'W', -1700, -750, ATTIC + 380, 220, 280, 'arch big');
  /* her wing: taller, to hold the two-storey closet; its face swings open too */
  for (const lv of [0, 1]) {
    extWall(hr, [300, 900], [1, 0], [0, 1], 0, 1000, lv, LH, 'face');
    extWall(g, [1300, 900], [0, -1], [1, 0], 90, 750, lv, LH, 'side');
    extWall(g, [1300, -350], [0, -1], [1, 0], 90, 1150, lv, LH, 'side');
    extWall(g, [1300, -1500], [-1, 0], [0, -1], 180, 1000, lv, LH, 'back');
    extWall(g, [300, 0], [0, 1], [-1, 0], -90, 900, lv, LH, 'side');
  }
  band(hr, 300, 1300, 900 + T, ATTIC, WEAVE, 0, 'face');
  bandZ(g, -1500, 900, 1300 + T, ATTIC, WEAVE, 90);
  band(g, 300, 1300, -1500 - T, ATTIC, WEAVE, 180, 'back');
  bandZ(g, 0, 900, 300 - T, ATTIC, WEAVE, -90);
  /* the pantry, with her bathroom above: a little two-storey block with a flat lead roof */
  for (const lv of [0, 1]) {
    extWall(g, [1700, 150], [0, -1], [1, 0], 90, 500, lv, LH, 'side');
    extWall(g, [1700, -350], [-1, 0], [0, -1], 180, 400, lv, LH, 'back');
    extWall(g, [1300, 150], [1, 0], [0, 1], 0, 400, lv, LH, 'side');
  }
  box(G.roof, { x: 1500, z: -100, w: 440, d: 540, h: 26, base: ATTIC, cls: 'm-lead', solid: false });
  box(G.roof, { x: 1500, z: -100, w: 420, d: 520, h: 30, base: ATTIC + 26, cls: 'm-limestone', solid: false, faces: 'fblr' });
  extWin(g, 'W', 1700, -100, LH + 260, 140, 260, 'arch');
  /* the side porch under her balcony */
  for (const [x, z] of [[1685, 640], [1685, 165], [1315, 640]]) box(g, { x, z, w: 26, d: 26, h: LH - 14, cls: 'm-column' });
  plane(g, 400, 500, 1500, -1, 400, 0, 90, 'floor f-deck');
  plane(g, 400, 16, 1500, -LH + 8, 650 + 2, 0, 0, 'fascia');
  plane(g, 500, 16, 1700 + 2, -LH + 8, 400, 90, 0, 'fascia');
  /* the bay windows: two storeys at the front, a three-storey tower at the back, one breakfast bay to the east */
  for (const b of BAYS) {
    const lv = b.lv, y0 = lv * LH, sh = lv === 2 ? H : LH, front = b.z0 === 0, back = b.z1 === -1500, east = b.x0 === 1300;
    const eg = front ? hl : g, ig = G[b.room], cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, w = b.x1 - b.x0, d = b.z1 - b.z0;
    plane(ig, w, d, cx, -y0, cz, 0, 90, 'floor ' + (FLOOR[b.room] || 'f-herring'));
    plane(ig, w, d, cx, -y0 - H, cz, 0, -90, 'ceil c-ivory');
    const iw = THEME[b.room] || 'w-plaster';
    if (east) {
      bandZ(eg, b.z0, b.z1, b.x1 + T, y0, y0 + sh, 90);
      plane(ig, d, H, b.x1 - T, -y0 - H / 2, cz, -90, 0, 'wall ' + iw);
      win(ig, 'W', b.x1, cz, 230, 300, 260, 'bay', lv); extWin(eg, 'E', b.x1, cz, 230, 300, 260, 'bay');
      for (const [z, ry, s] of [[b.z0, 180, -1], [b.z1, 0, 1]]) {
        if (z === b.z0) { band(eg, b.x0, b.x0 + 10, z - T, y0, y0 + sh, 180, 'side'); band(eg, b.x1 - 10, b.x1, z - T, y0, y0 + sh, 180, 'side'); band(eg, b.x0, b.x1, z - T, y0 + 320, y0 + sh, 180, 'side'); plane(ig, w, H - 320, cx, -y0 - 320 - (H - 320) / 2, z + T, 0, 0, 'wall ' + iw); continue; }
        band(eg, b.x0, b.x1, z + T, y0, y0 + sh, 0, 'side'); plane(ig, w, H, cx, -y0 - H / 2, z - T, 180, 0, 'wall ' + iw);
      }
      WALLS.push({ ax: b.x1, az: b.z0, bx: b.x1, bz: b.z1, hb: y0, ht: y0 + sh }, { ax: b.x0, az: b.z1, bx: b.x1, bz: b.z1, hb: y0, ht: y0 + sh });
      const rf = plane(G.roof, d + 60, 200, b.x1 - 70, -(y0 + sh + 40), cz, 0, 0, 'lead-roof');
      rf.style.transform = `translate3d(${b.x1 - 70}px,${-(y0 + sh + 40)}px,${cz}px) rotateY(90deg) rotateX(${90 - 28}deg)`;
      continue;
    }
    const oz = front ? b.z1 : b.z0, sgn = front ? 1 : -1;
    band(eg, b.x0, b.x1, oz + sgn * T, y0, y0 + sh, front ? 0 : 180, front ? 'face' : 'back');
    for (const [x, ry] of [[b.x0 - T, -90], [b.x1 + T, 90]]) bandZ(eg, b.z0, b.z1, x, y0, y0 + sh, ry, front ? 'face' : 'side');
    plane(ig, w, H, cx, -y0 - H / 2, oz - sgn * T, front ? 180 : 0, 0, 'wall ' + iw);
    for (const [x, ry] of [[b.x0 + T, 90], [b.x1 - T, -90]]) plane(ig, d, H, x, -y0 - H / 2, cz, ry, 0, 'wall ' + iw);
    win(ig, front ? 'N' : 'S', oz, cx, 230, w - 80, 260, 'bay', lv);
    extWin(eg, front ? 'S' : 'N', oz, cx, 230 + y0, w - 80, 260, 'bay');
    for (const [x, f] of [[b.x0, 'W'], [b.x1, 'E']]) extWin(eg, f, x, cz, 230 + y0, 100, 240, 'bay');
    WALLS.push({ ax: b.x0, az: oz, bx: b.x1, bz: oz, hb: y0, ht: y0 + sh }, { ax: b.x0, az: b.z0, bx: b.x0, bz: b.z1, hb: y0, ht: y0 + sh }, { ax: b.x1, az: b.z0, bx: b.x1, bz: b.z1, hb: y0, ht: y0 + sh });
    const topLv = BAYS.filter(o => o.x0 === b.x0 && o.z0 === b.z0).reduce((m, o) => Math.max(m, o.lv), 0);
    if (lv === topLv) {
      const yt = y0 + sh, rf = plane(G.roof, w + 50, 230, cx, -(yt + 50), cz + sgn * 10, 0, 0, 'lead-roof');
      rf.style.transform = `translate3d(${cx}px,${-(yt + 50)}px,${cz + sgn * 10}px) ${front ? '' : 'rotateY(180deg) '}rotateX(${90 - 26}deg)`;
    }
  }
  /* the front door: olive, a stone surround, two lanterns, a tiny brass plaque; a rounded step */
  const fr = group(G.living, -1150, 0, 0, 0, 'hinge front');
  plane(fr, 200, 340, 100, -170, 4, 0, 0, 'door-leaf olive', '<i class="panel"></i><i class="panel"></i><i class="knob"></i>').setAttribute('data-stop', 'door');
  plane(fr, 200, 340, 100, -170, -4, 180, 0, 'door-leaf in', '<i class="knob"></i>');
  LEAVES.front = { el: fr, open: 'translate3d(-1150px,0px,0px) rotateY(100deg)' };
  target('door', 'out', 'S', 0, -1050, 240, 520, 460, { lv: 0 });
  mount(hl, 'S', 0, -1050, 175, 280, 370, 'door-surround', '', T + 3);
  for (const x of [-1210, -890]) mount(hl, 'S', 0, x, 250, 30, 54, 'lantern-b', '', T + 6);
  mount(hl, 'S', 0, -925, 160, 40, 26, 'plaque', 'ST', T + 6);
  box(hl, { x: -1050, z: 60, w: 300, d: 120, h: 14, cls: 'm-limestone round', solid: false });
  for (const lv of [0, 1]) for (const x of [-250, 150]) extWin(hl, 'S', 0, x, lv * LH + 240, 120, 230, 'shutter');
  mount(hl, 'S', 0, -1050, LH + 250, 110, 300, 'win arch tall ext glow', '<i></i><i></i><b></b>', T + 3);
  win(G.guest, 'N', 0, -1050, 250, 110, 300, 'arch tall', 1);
  /* the garage: two carriage doors in stone arches; above them, her great arched window */
  for (const x of [550, 1050]) { mount(hr, 'S', 900, x, 175, 380, 360, 'stone-arch', '', T + 2); play(mount(hr, 'S', 900, x, 165, 330, 330, 'carriage', '<i></i><i></i>', T + 4), 'garage'); }
  for (const x of [320, 800, 1280]) mount(hr, 'S', 900, x, 280, 30, 54, 'lantern-b', '', T + 6);
  extWin(hr, 'S', 900, 800, LH + 250, 520, 400, 'palladian');
  extWin(g, 'E', 1300, -800, LH + 400, 180, 520, 'arch tall');
  extWin(g, 'E', 1300, 720, LH + 240, 140, 230, 'shutter');
  mount(g, 'W', 300, 600, 160, 140, 300, 'side-door', '', T + 3);
  plane(g, 180, 110, 180, -55, 520, 15, 0, 'bicycle');
  /* windows on the garden side */
  extWin(g, 'N', -1500, -680, LH + 290, 140, 160, 'frost');
  extWin(g, 'N', -1500, 100, LH + 250, 130, 300, 'arch tall');
  extWin(g, 'W', -1700, -300, LH + 240, 120, 220, 'shutter');
  mount(g, 'N', -1500, -1590, 160, 160, 320, 'french-ext', '<i></i><i></i>', T + 3);
  mount(g, 'N', -880, 1380, 160, 140, 320, 'french-ext', '<i></i><i></i>', T + 3);
  /* ivy and roses: never everywhere, always somewhere */
  for (const [gg, face, line, along, up, w, h] of [[hl, 'S', 0, -1660, 420, 120, 700], [hl, 'S', 0, -400, 320, 110, 420], [hr, 'S', 900, 330, 300, 90, 560], [g, 'W', -1700, -1300, 300, 200, 560], [g, 'E', 1300, -1200, 360, 160, 700]]) mount(gg, face, line, along, up, w, h, 'ivy', '', T + 8);
  mount(hl, 'S', 0, -1050, 440, 420, 120, 'roses-climb', '', T + 12);
  /* the turret: limestone, slit windows, a dark cone that climbs higher than the house */
  const OCT = k => { const a = (k * 45 + 22.5) * RAD; return [TUR.x + Math.cos(a) * TUR.ro, TUR.z + Math.sin(a) * TUR.ro]; };
  const tt = ATTIC + H + 60;
  for (let k = 0; k < 8; k++) {
    const [ax, az] = OCT(k), [bx, bz] = OCT(k + 1), mx = (ax + bx) / 2, mz = (az + bz) / 2, len = Math.hypot(bx - ax, bz - az), ry = -Math.atan2(bz - az, bx - ax) / RAD + 180;
    plane(g, len, tt, mx, -tt / 2, mz, ry, 0, 'wall w-ext turret-face');
    if (k % 2 === 0) plane(g, 40, 150, mx + (mx - TUR.x) * .05, -(LH + 250), mz + (mz - TUR.z) * .05, ry, 0, 'slit');
    if (k % 2 === 1) plane(g, 40, 120, mx + (mx - TUR.x) * .05, -(ATTIC + 230), mz + (mz - TUR.z) * .05, ry, 0, 'slit');
    WALLS.push({ ax, az, bx, bz, hb: 0, ht: LH });
  }
  const coneH = 720;
  for (let k = 0; k < 8; k++) {
    const [ax, az] = OCT(k), [bx, bz] = OCT(k + 1), mx = (ax + bx) / 2, mz = (az + bz) / 2, len = Math.hypot(bx - ax, bz - az) + 10;
    const ap = Math.hypot(mx - TUR.x, mz - TUR.z), slant = Math.hypot(ap, coneH), tilt = Math.atan2(coneH, ap) / RAD, ry = -Math.atan2(bz - az, bx - ax) / RAD + 180;
    const p = plane(G.roof, len, slant, (mx + TUR.x) / 2, -(tt + coneH / 2), (mz + TUR.z) / 2, 0, 0, 'cone');
    p.style.transform = `translate3d(${((mx + TUR.x) / 2).toFixed(1)}px,${(-(tt + coneH / 2)).toFixed(1)}px,${((mz + TUR.z) / 2).toFixed(1)}px) rotateY(${ry}deg) rotateX(${90 - tilt}deg)`;
    p.style.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)';
  }
  box(G.roof, { x: TUR.x, z: TUR.z, w: 10, d: 10, h: 80, base: tt + coneH - 10, cls: 'm-brass', solid: false });
}

/* ---------- the roofs: a steep main gable with a glass gable to the street, her wing's taller cross-gable ---------- */
{
  const g = G.roof, run = 790, rise = RIDGE - EAVE, L = Math.hypot(run, rise), th = Math.atan(rise / run) / RAD;
  const slope = (x0, x1, front, clip) => {
    const p = plane(g, x1 - x0, L, (x0 + x1) / 2, -(EAVE + RIDGE) / 2, front ? -355 : -1145, 0, 0, 'slate');
    p.style.transform = `translate3d(${(x0 + x1) / 2}px,${-(EAVE + RIDGE) / 2}px,${front ? -355 : -1145}px) ${front ? '' : 'rotateY(180deg) '}rotateX(${90 - th}deg)`;
    if (clip) p.style.clipPath = clip;
  };
  slope(-1750, -800, true); slope(-800, -150, true, 'polygon(0 0, 100% 0, 100% 79.2%, 50% 34%, 0 79.2%)'); slope(-150, 350, true);
  /* seen from behind, the back slope runs the other way: its pieces are mirrored */
  slope(-1750, -1450, false); slope(-1450, -1050, false, 'polygon(0 0, 100% 0, 100% 66.6%, 0 66.6%)'); slope(-1050, 350, false);
  for (const [x, rz, clip] of [[-637.5, -45, 'polygon(0 69.7%, 100% 0, 100% 100%, 0 100%)'], [-312.5, 45, 'polygon(0 0, 100% 69.7%, 100% 100%, 0 100%)']]) {
    const p = plane(g, 459.6 + 30, 511, x, -1472.5, -225.5, 0, 0, 'slate two');
    p.style.transform = `translate3d(${x}px,-1472.5px,-225.5px) rotateZ(${rz}deg) rotateX(90deg)`;
    p.style.clipPath = clip;
  }
  const gg = plane(G.hingeL, 650, 675, -475, -1297.5, T + 2, 0, 0, 'glass-gable two', '<i></i><i></i><i></i><b></b>');
  gg.style.clipPath = 'polygon(0 100%, 0 48.1%, 50% 0, 100% 48.1%, 100% 100%)';
  const ch1 = plane(G.hingeL, 125, 114, -800, -1253, -62.5, -90, 0, 'wall w-ext two'); ch1.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%)';
  const ch2 = plane(G.hingeL, 125, 114, -150, -1253, -62.5, 90, 0, 'wall w-ext two'); ch2.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';
  for (const x of [-750, -400, -50]) skylight(g, x, -1050, false, false);
  for (const x of [-1300, 100]) skylight(g, x, -450, true, false);
  for (const [x, z] of [[-1640, -400], [-200, -1150]]) box(g, { x, z, w: 90, d: 120, h: 460, base: ROOFH(z) - 70, cls: 'm-limestone chimney', solid: false });
  /* her wing's cross-gable */
  const run2 = 500, rise2 = WRIDGE - WEAVE, L2 = Math.hypot(run2, rise2), th2 = Math.atan(rise2 / run2) / RAD;
  for (const sx of [-1, 1]) {
    const p = plane(g, L2, 2480, 800 + sx * run2 / 2, -(WEAVE + rise2 / 2), -300, 0, 0, 'slate');
    p.style.transform = `translate3d(${800 + sx * run2 / 2}px,${-(WEAVE + rise2 / 2)}px,-300px) rotateZ(${sx * th2}deg) rotateX(90deg)`;
  }
  const gf = plane(G.hingeR, 1000, rise2, 800, -(WEAVE + rise2 / 2), 900 + T, 0, 0, 'wall w-ext gable-out', '<i class="oculus"></i>'); gf.style.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)';
  const gb = plane(g, 1000, rise2, 800, -(WEAVE + rise2 / 2), -1500 - T, 180, 0, 'wall w-ext gable-out'); gb.style.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)';
}

/* =============================== THE SUNROOM: making things, with friends =============================== */
{
  const g = G.sunroom, cx = -1200, cz = -2280, base = H, ph = 300, w = 880, d = 760;
  box(g, { x: cx, z: cz, w: w + 20, d: d + 20, h: 22, lift: H, cls: 'm-iron', solid: false, faces: 'fblr' });
  /* a hipped glass roof: every slope the same pitch, a short ridge running east-west */
  const run = d / 2, sl = Math.hypot(run, ph), tilt = Math.atan2(ph, run) / RAD, k = ((w - d) / 2 / w * 100);
  for (const [pw, ry, ox2, oz2, clip] of [[w, 0, 0, run / 2, null], [w, 180, 0, -run / 2, null], [d, 90, w / 2 - run / 2, 0, 'polygon(0 100%, 50% 0, 100% 100%)'], [d, -90, -(w / 2 - run / 2), 0, 'polygon(0 100%, 50% 0, 100% 100%)']]) {
    const p = plane(g, pw, sl, cx + ox2, -(base + 22 + ph / 2), cz + oz2, 0, 0, 'glass-roof');
    p.style.transform = `translate3d(${(cx + ox2).toFixed(1)}px,${-(base + 22 + ph / 2)}px,${(cz + oz2).toFixed(1)}px) rotateY(${ry}deg) rotateX(${(90 - tilt).toFixed(2)}deg)`;
    p.style.clipPath = clip || `polygon(0 100%, ${k.toFixed(1)}% 0, ${(100 - k).toFixed(1)}% 0, 100% 100%)`;
  }
  box(g, { x: cx, z: cz, w: 40, d: 40, h: 60, lift: H + 22 + ph - 6, cls: 'm-lantern', solid: false });
  /* board games: a sofa and two chairs round a low table, Clue mid-game */
  sofa(g, { x: cx, z: -2160, ry: 180, w: 300, cls: 'm-linen' });
  chair(g, { x: -1430, z: -2340, ry: 90, cls: 'm-olive', w: 90 });
  chair(g, { x: -970, z: -2340, ry: -90, cls: 'm-rose', w: 90 });
  box(g, { x: cx, z: -2340, w: 220, d: 140, h: 40, cls: 'm-walnut' });
  plane(g, 120, 120, cx - 30, -41, -2340, 10, 90, 'gameboard');
  for (const [x, z] of [[-1120, -2300], [-1110, -2380]]) box(g, { x, z, w: 18, d: 18, h: 16, lift: 40, cls: 'm-cup round', solid: false, top: '<i class="latte-art"></i>' });
  /* making: an easel at the light, a long table of paints */
  const easel = plane(g, 130, 180, -880, -150, -2560, -30, 0, 'easel canvas'); easel.style.transform += ' rotateX(-8deg)';
  const pal = group(g, 0, 0, 0, 0, 'paints');
  box(pal, { x: -1320, z: -2600, w: 420, d: 70, h: 80, cls: 'm-walnut' });
  box(pal, { x: -1300, z: -2590, w: 90, d: 60, h: 3, lift: 80, ry: -8, cls: 'm-palette', solid: false, top: `<div class="palette-top">${SWATCHES.map(([, c]) => `<i style="--c:${c}"></i>`).join('')}</div>` });
  box(pal, { x: -1440, z: -2600, w: 70, d: 30, h: 50, lift: 80, cls: 'm-jarsbox', solid: false, front: '<div class="jars paint"><i></i><i></i><i></i><i></i></div>' });
  box(pal, { x: -1180, z: -2600, w: 40, d: 20, h: 70, lift: 80, cls: 'm-brushes', solid: false });
  tag(pal, 'palette');
  target('palette', 'sunroom', 'S', -2565, -1320, 100, 320, 180, { minDist: 300 });
  for (const [x, z, s] of [[-1590, -2610, 1.2], [-810, -2610, 1], [-1590, -1960, 1], [-810, -1960, 1.1]]) plant(g, x, z, 0, s);
  rug(g, 520, 380, cx, -2300, 0, ['#EFE5D3', '#9AA383', '#EBC5C7', '#B08D57', '#7B8060']);
  pendant(g, cx, -2340, 0, 160, 'm-lantern');
}

/* =============================== THE GARDENS: little scenes, not a lawn =============================== */
{
  const g = G.garden, ge = G.ext;
  for (const [ax, az, bx, bz, ry] of [[-1700, -3150, 1300, -3150, 0], [1300, -3150, 1300, -1500, -90], [-1700, -3150, -1700, -2300, 90], [-1700, -2100, -1700, -1500, 90]]) {
    const len = Math.hypot(bx - ax, bz - az);
    plane(g, len, 220, (ax + bx) / 2, -110, (az + bz) / 2, ry, 0, 'gardenwall two');
    WALLS.push({ ax, az, bx, bz, hb: 0, ht: 230 });
  }
  plane(g, 200, 260, -1700, -130, -2200, 90, 0, 'gate-iron two');
  plane(g, 3000, 1650, -200, -1, -2325, 0, 90, 'garden-floor');
  /* the rose arch and a bench beneath it: her heart lives out here */
  const arch = group(g, 0, 0, 0, 0, 'rose-arch');
  for (const sx of [-1, 1]) box(arch, { x: -150 + sx * 110, z: -2380, w: 12, d: 12, h: 300, cls: 'm-iron', solid: false });
  plane(arch, 260, 160, -150, -300, -2380, 0, 0, 'arch-roses two');
  for (const sx of [-1, 1]) plane(arch, 120, 300, -150 + sx * 110, -150, -2376, 0, 0, 'roses-climb two');
  box(arch, { x: -150, z: -2420, w: 200, d: 50, h: 44, cls: 'm-teak' });
  tag(arch, 'beat');
  target('beat', 'garden', 'S', -2380, -150, 170, 320, 340, { minDist: 420 });
  /* the fountain */
  box(g, { x: -150, z: -1980, w: 140, d: 140, h: 50, cls: 'm-limestone round' });
  box(g, { x: -150, z: -1980, w: 30, d: 30, h: 60, lift: 50, cls: 'm-limestone', solid: false });
  box(g, { x: -150, z: -1980, w: 90, d: 90, h: 10, lift: 110, cls: 'm-limestone round', solid: false, top: '<i class="water"></i>' });
  /* chairs facing a ribbon of fire along a low wall at the very back */
  box(g, { x: 820, z: -3090, w: 720, d: 40, h: 70, cls: 'm-limestone' });
  plane(g, 680, 50, 820, -95, -3090, 0, 0, 'flames two');
  for (const x of [640, 760, 880, 1000]) chair(g, { x, z: -2930, ry: 180, cls: 'm-linen', w: 80 });
  for (const [x, z, k] of [[-1550, -3000, 'hyd'], [-900, -3050, 'hyd'], [1150, -2300, 'rose'], [1150, -1900, 'hyd'], [-500, -3050, 'rose'], [300, -3050, 'hyd'], [-650, -1650, 'rose'], [300, -1650, 'hyd']]) for (const ry of [0, 70]) plane(g, 200, 140, x, -70, z, ry, 0, 'bush ' + k);
  for (const [x, w] of [[-700, 900], [400, 700]]) plane(g, w, 160, x, -150, -3146, 0, 0, 'jasmine-vine');
  for (const [x, z] of [[500, -2300], [-500, -2700]]) {
    box(g, { x, z, w: 28, d: 28, h: 360, cls: 'm-trunk', solid: false });
    for (const ry of [0, 60, 120]) plane(g, 420, 380, x, -520, z, ry, 0, 'blossom');
  }
  for (let i = 0; i < 5; i++) plane(g, 110, 80, -1590 + Math.sin(i) * 30, -1.5, -1560 - i * 80, i * 7, 90, 'stepstone');
  /* the terrace off the breakfast bay: a pergola, a long table, a rain curtain on its far edge */
  plane(ge, 460, 700, 1710, -1.5, -730, 0, 90, 'floor f-deck');
  for (const [x, z] of [[1500, -1060], [1920, -1060], [1500, -400], [1920, -400]]) box(ge, { x, z, w: 18, d: 18, h: 330, cls: 'm-walnut', solid: false });
  for (const x of [1500, 1920]) box(ge, { x, z: -730, w: 14, d: 680, h: 14, lift: 330, cls: 'm-walnut', solid: false });
  for (let i = 0; i < 6; i++) box(ge, { x: 1710, z: -1040 + i * 125, w: 440, d: 10, h: 10, lift: 344, cls: 'm-walnut', solid: false });
  for (const z of [-950, -730, -510]) plane(ge, 420, 30, 1710, -320, z, 0, 0, 'fairy');
  box(ge, { x: 1710, z: -730, w: 100, d: 380, h: 70, cls: 'm-teak' });
  for (const z of [-850, -730, -610]) for (const x of [1620, 1800]) box(ge, { x, z, w: 50, d: 50, h: 44, cls: 'm-wicker round' });
  flowers(ge, 1710, -730, 0, 70, 'rose', .7);
  plane(ge, 680, 330, 1935, -165, -730, -90, 0, 'rain two');
  box(ge, { x: 1935, z: -730, w: 40, d: 700, h: 8, cls: 'm-limestone', solid: false, top: '<i class="water"></i>' });
  /* the front garden: a winding stone path, layered beds, a flowering arch, a bench, a birdbath */
  for (let i = 0; i < 9; i++) { const t = i / 8, x = -1050 + Math.sin(t * Math.PI * 1.2) * 180, z = 260 + t * 1500; plane(ge, 110, 80, x, -1.5, z, t * 30, 90, 'stepstone'); }
  const fa = group(ge, 0, 0, 0, 0, 'front-arch');
  for (const sx of [-1, 1]) box(fa, { x: -1010 + sx * 120, z: 640, w: 10, d: 10, h: 320, cls: 'm-iron', solid: false });
  plane(fa, 280, 180, -1010, -320, 640, 0, 0, 'arch-roses two');
  for (const [x, z, k, s] of [[-1600, 380, 'hyd', 1.2], [-1300, 330, 'rose', 1], [-750, 330, 'hyd', 1], [-450, 380, 'rose', 1], [-120, 330, 'hyd', .9], [-1550, 700, 'rose', 1], [-500, 900, 'hyd', 1]]) for (const ry of [0, 70]) plane(ge, 220 * s, 150 * s, x, -75 * s, z, ry, 0, 'bush ' + k);
  plane(ge, 1650, 60, -850, -2, 280, 0, 90, 'boxwood-edge');
  box(ge, { x: -1400, z: 1000, w: 200, d: 60, h: 44, cls: 'm-teak' });
  box(ge, { x: -650, z: 640, w: 60, d: 60, h: 90, cls: 'm-limestone', solid: false });
  box(ge, { x: -650, z: 640, w: 120, d: 120, h: 12, lift: 90, cls: 'm-limestone round', solid: false, top: '<i class="water"></i>' });
  for (const [x, z, s] of [[-1500, 1150, 1.1], [100, 1300, 1]]) {
    box(ge, { x, z, w: 26 * s, d: 26 * s, h: 340 * s, cls: 'm-trunk', solid: false });
    for (const ry of [0, 60, 120]) plane(ge, 460 * s, 400 * s, x, -(340 * s + 150 * s), z, ry, 0, 'blossom');
  }
}

/* the room names painted on the floors, for the floor plan */
for (const id in ROOMS) {
  const r = ROOMS[id];
  if (id === 'nook' || id === 'halfbath') continue;
  const rr = id === 'attic' ? { x0: -950, x1: 300, z0: -1300, z1: -100 } : r;
  plane(G[id], rr.x1 - rr.x0, rr.z1 - rr.z0, (rr.x0 + rr.x1) / 2, lvY(r.lv) - 3, (rr.z0 + rr.z1) / 2, 0, 90, 'floor-label', `<b>${r.name.replace('The ', '').replace('Her ', '')}</b>`);
}
const cursorEl = plane(world, 100, 100, 0, -4, 0, 0, 90, 'cursor-ring', '<i></i>');
