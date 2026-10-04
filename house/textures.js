/* Every surface in the house is painted here, as vector art: murals, block prints, parquet, rugs, painted risers.
   Pink is the personality. Green is the intelligence. Cream is the canvas. Brown is the grounding. Gold is the jewelry. */
const C = {
  ivory: '#F5EFE3', cream: '#E8DDC8', paper: '#F3EBDD', walnut: '#51382D', walnutDk: '#3B271F', walnutLt: '#6B4A39',
  olive: '#7B8060', sage: '#9AA383', forest: '#394837', rose: '#B97979', blush: '#EBC5C7', shell: '#F1DEDB', clay: '#C99B98',
  oxblood: '#713C3B', plum: '#5A404D', plumLt: '#684552', brass: '#B08D57', brassLt: '#D4B47A', ochre: '#C8913A', marigold: '#D99A2B',
  burgundy: '#7A2E3A', indigo: '#3E4A6B', terracotta: '#B8664A', bougain: '#A84D72'
};
const svgURL = s => `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}")`;
const svg = (w, h, body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ${extra}>${body}</svg>`;
/* a small seeded random, so the murals paint the same way every visit */
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const f1 = n => n.toFixed(1);

/* ---------- motifs ---------- */
const leaf = (x, y, len, ang, col, vein = true) => {
  const w = len * .34;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})"><path d="M0 0 C${f1(w)} ${f1(-len * .3)} ${f1(w * .8)} ${f1(-len * .8)} 0 ${f1(-len)} C${f1(-w * .8)} ${f1(-len * .8)} ${f1(-w)} ${f1(-len * .3)} 0 0Z" fill="${col}"/>${vein ? `<path d="M0 0 L0 ${f1(-len * .92)}" stroke="rgba(255,255,255,.28)" stroke-width="${f1(len * .03)}"/>` : ''}</g>`;
};
const peony = (x, y, r, base, light, deep) => {
  let s = '';
  for (let ring = 0; ring < 3; ring++) {
    const n = 7 - ring, rr = r * (1 - ring * .27), col = [deep, base, light][ring];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 360 + ring * 23;
      s += `<ellipse cx="0" cy="${f1(-rr * .45)}" rx="${f1(rr * .42)}" ry="${f1(rr * .5)}" fill="${col}" transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(a)})" opacity="${ring ? .95 : .85}"/>`;
    }
  }
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .16)}" fill="${C.ochre}" opacity=".8"/>`;
};
const rose = (x, y, r, base, light) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${base}"/><path d="M${f1(x - r * .6)} ${f1(y)} a${f1(r * .6)} ${f1(r * .55)} 0 1 1 ${f1(r * 1.1)} ${f1(r * .1)} a${f1(r * .4)} ${f1(r * .35)} 0 1 1 ${f1(-r * .7)} ${f1(-r * .1)}" fill="none" stroke="${light}" stroke-width="${f1(r * .16)}" stroke-linecap="round"/>`;
const jasmine = (x, y, r) => {
  let s = '';
  for (let i = 0; i < 5; i++) s += `<ellipse cx="0" cy="${f1(-r * .55)}" rx="${f1(r * .28)}" ry="${f1(r * .55)}" fill="#FBF7EE" transform="translate(${f1(x)} ${f1(y)}) rotate(${i * 72})"/>`;
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .14)}" fill="${C.ochre}"/>`;
};
const marigold = (x, y, r) => {
  let s = `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${C.marigold}"/>`;
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; s += `<circle cx="${f1(x + Math.cos(a) * r * .78)}" cy="${f1(y + Math.sin(a) * r * .78)}" r="${f1(r * .32)}" fill="${i % 2 ? '#E2A93F' : C.ochre}"/>`; }
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .42)}" fill="#B5762A"/>`;
};
const bougain = (x, y, r, col = C.bougain) => {
  let s = '';
  for (let i = 0; i < 3; i++) s += `<path d="M0 0 C${f1(r * .6)} ${f1(-r * .2)} ${f1(r * .5)} ${f1(-r)} 0 ${f1(-r * .9)} C${f1(-r * .5)} ${f1(-r)} ${f1(-r * .6)} ${f1(-r * .2)} 0 0Z" fill="${col}" opacity=".92" transform="translate(${f1(x)} ${f1(y)}) rotate(${i * 120})"/>`;
  return s + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .12)}" fill="#F3E3B0"/>`;
};
const magnolia = (x, y, r) => {
  let s = '';
  for (let i = 0; i < 5; i++) s += `<ellipse cx="0" cy="${f1(-r * .6)}" rx="${f1(r * .3)}" ry="${f1(r * .7)}" fill="${i % 2 ? '#F6E6E3' : '#EDCDCB'}" transform="translate(${f1(x)} ${f1(y)}) rotate(${-50 + i * 25})"/>`;
  return s;
};
const bird = (x, y, s, col) => `<path transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s)})" d="M0 0 C6 -6 14 -6 18 -2 L26 -6 L22 0 C20 6 10 8 2 4 L-6 6 Z" fill="${col}"/>`;

/* ---------- murals ---------- */
/* oversized botanical: branches grow up from the floor and split, flowers open at the tips, birds hide among them */
function mural(w, h, seed, mood = 'social') {
  const r = rng(seed), dreamy = mood === 'dreamy';
  const LEAF = dreamy ? [C.sage, '#B5BC9D', '#8E9675', '#A7AE8C'] : [C.olive, C.sage, '#5E6649', '#8A8F6A', C.forest];
  const BIG = dreamy ? [[C.blush, '#F7E7E5', '#D9A9A9'], ['#F3DADA', '#FBF0EE', '#E2B9B7']] : [[C.rose, C.blush, C.oxblood], ['#C98C8A', '#F0D3D2', '#8E4B47'], [C.clay, '#F2DAD6', C.burgundy]];
  let stems = '', leaves = '', blooms = '';
  const branch = (x, y, ang, len, depth) => {
    const a = ang * Math.PI / 180, bend = (r() - .5) * 0.6;
    const x2 = x + Math.sin(a) * len, y2 = y - Math.cos(a) * len;
    const cx = x + Math.sin(a + bend) * len * .55, cy = y - Math.cos(a + bend) * len * .55;
    stems += `<path d="M${f1(x)} ${f1(y)} Q${f1(cx)} ${f1(cy)} ${f1(x2)} ${f1(y2)}" fill="none" stroke="${dreamy ? '#9AA383' : '#6E7354'}" stroke-width="${f1(1.2 + depth * 1.3)}" stroke-linecap="round"/>`;
    const n = 3 + ((r() * 4) | 0);
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * x2, py = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * y2;
      const side = i % 2 ? 1 : -1, sz = (dreamy ? 26 : 30) + r() * (dreamy ? 26 : 30);
      leaves += leaf(px, py, sz, ang + side * (40 + r() * 30), LEAF[(r() * LEAF.length) | 0]);
      if (!dreamy && r() > .8) blooms += jasmine(px + side * 14, py - 8, 7 + r() * 3);
      if (dreamy && r() > .82) blooms += rose(px + side * 14, py - 6, 6, C.blush, '#FBF0EE');
    }
    if (depth > 0) {
      const kids = depth > 1 ? 2 + (r() > .6 ? 1 : 0) : 1 + (r() > .5 ? 1 : 0);
      for (let k = 0; k < kids; k++) branch(x2, y2, ang + (k - (kids - 1) / 2) * (32 + r() * 18) + (r() - .5) * 12, len * (.62 + r() * .14), depth - 1);
    }
    /* what opens at the tip */
    const pick = r(), [b0, b1, b2] = BIG[(r() * BIG.length) | 0];
    if (depth === 0 || pick > .7) {
      const fr = (dreamy ? 22 : 26) + r() * (depth ? 24 : 18);
      if (dreamy) blooms += pick > .45 ? magnolia(x2, y2, fr * 1.15) : peony(x2, y2, fr, b0, b1, b2);
      else if (pick > .55) blooms += peony(x2, y2, fr, b0, b1, b2);
      else if (pick > .3) { for (let m = 0; m < 3; m++) blooms += marigold(x2 + (r() - .5) * 30, y2 + (r() - .5) * 26, 9 + r() * 5); }
      else if (pick > .12) { for (let m = 0; m < 5; m++) blooms += bougain(x2 + (r() - .5) * 40, y2 + (r() - .5) * 34, 10 + r() * 4); }
      else blooms += rose(x2, y2, 12 + r() * 6, b0, b1);
    }
  };
  const trunks = Math.max(2, Math.round(w / (dreamy ? 300 : 210)));
  for (let i = 0; i < trunks; i++) {
    const x = (i + .5) * w / trunks + (r() - .5) * 60;
    branch(x, h + 6, (r() - .5) * 18, h * (dreamy ? .34 : .3) + r() * h * .06, dreamy ? 2 : 3);
  }
  /* a few sprays reaching in from the top, so the wall feels painted edge to edge */
  if (!dreamy) for (let i = 0; i < trunks - 1; i++) branch((i + 1) * w / trunks, -6, 180 + (r() - .5) * 40, h * .2, 1);
  for (let i = 0; i < (dreamy ? 2 : 4); i++) blooms += bird(w * (.1 + r() * .8), h * (.12 + r() * .4), 1 + r() * .5, [C.forest, C.oxblood, C.olive, C.walnut][i % 4]);
  const bg = dreamy ? '#F7EEEA' : C.paper;
  return svg(w, h, `<rect width="${w}" height="${h}" fill="${bg}"/><g ${dreamy ? 'opacity=".8"' : ''}>${stems}${leaves}${blooms}</g>`);
}
/* a Mughal flowering plant in a cusped arch niche: the façade and the rooftop wall */
function niche(w, h, bg = C.cream, frame = C.brassLt, flower = C.rose) {
  const ah = h * .3, cusp = [];
  for (let i = 0; i <= 6; i++) { const a = Math.PI + i * Math.PI / 6, rr = w / 2 - 8; cusp.push(`${f1(w / 2 + Math.cos(a) * rr)} ${f1(ah + 6 + Math.sin(a) * ah * .95)}`); }
  const arch = `M8 ${h - 6} L8 ${f1(ah + 6)} ` + cusp.map((p, i) => i ? `Q${f1(w / 2 + Math.cos(Math.PI + (i - .5) * Math.PI / 6) * (w / 2 - 22))} ${f1(ah + 6 + Math.sin(Math.PI + (i - .5) * Math.PI / 6) * ah * .7)} ${p}` : '').join(' ') + ` L${w - 8} ${h - 6} Z`;
  let plant = `<path d="M${w / 2} ${h - 14} L${w / 2} ${f1(ah + 40)}" stroke="${C.olive}" stroke-width="3"/>`;
  for (let i = 0; i < 6; i++) { const y = h - 40 - i * (h - ah - 70) / 6; plant += leaf(w / 2, y, 24, -55, C.olive) + leaf(w / 2, y, 24, 55, C.sage); if (i % 2) plant += rose(w / 2 - 22, y - 18, 8, flower, C.blush) + rose(w / 2 + 22, y - 18, 8, flower, C.blush); }
  plant += peony(w / 2, ah + 38, 18, flower, C.blush, C.oxblood);
  return svg(w, h, `<rect width="${w}" height="${h}" fill="${bg}"/><path d="${arch}" fill="rgba(0,0,0,.04)" stroke="${frame}" stroke-width="5"/>${plant}`);
}

/* ---------- repeating papers ---------- */
const tile = (w, h, body, bg) => svgURL(svg(w, h, `<rect width="${w}" height="${h}" fill="${bg}"/>${body}`));
const TEX = {
  /* a tiny floral, like a vintage textile: the dining nook */
  smallFloral: tile(84, 84, rose(20, 22, 6, C.rose, C.blush) + leaf(14, 30, 10, -60, C.olive, false) + leaf(26, 30, 10, 60, C.olive, false) + `<circle cx="33" cy="16" r="2.4" fill="${C.burgundy}"/>`
    + rose(62, 64, 6, C.rose, C.blush) + leaf(56, 72, 10, -60, C.olive, false) + leaf(68, 72, 10, 60, C.olive, false) + `<circle cx="74" cy="58" r="2.4" fill="${C.ochre}"/>`, '#F1E8DA'),
  /* Indian block print: little butis on a cream ground, indigo and burgundy details: the memory room */
  blockPrint: tile(72, 72, [[18, 20], [54, 56]].map(([x, y]) => `<path d="M${x} ${y + 12} L${x} ${y - 2}" stroke="${C.olive}" stroke-width="1.6"/>` + leaf(x, y + 8, 9, -55, C.olive, false) + leaf(x, y + 8, 9, 55, C.olive, false) + rose(x, y - 4, 5, C.rose, C.blush) + `<circle cx="${x}" cy="${y - 4}" r="1.4" fill="${C.indigo}"/>`).join('')
    + `<circle cx="54" cy="18" r="1.8" fill="${C.burgundy}"/><circle cx="18" cy="56" r="1.8" fill="${C.indigo}"/>`, '#F2E8D6'),
  /* paisley damask, tone on tone: the dressing room (no stripes, ever) */
  buta: tile(120, 150, [[30, 40, 0], [90, 115, 180]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 22 C-20 18 -22 -8 -6 -18 C6 -26 20 -18 14 -4 C10 6 4 4 6 -4" fill="none" stroke="#D8A9AB" stroke-width="3"/><path d="M-4 14 C-14 10 -14 -4 -4 -10" fill="none" stroke="#D8A9AB" stroke-width="1.5"/><circle cx="-2" cy="2" r="2.5" fill="#D8A9AB"/></g>`).join(''), '#EBD2D0'),
  /* plum ink on plum paper: stars, moons, constellations. only the lamps reveal it */
  stars: tile(240, 240, (() => {
    const r = rng(7); let s = '';
    const star = (x, y, k) => `<path d="M${x} ${y - k} L${x + k * .28} ${y - k * .28} L${x + k} ${y} L${x + k * .28} ${y + k * .28} L${x} ${y + k} L${x - k * .28} ${y + k * .28} L${x - k} ${y} L${x - k * .28} ${y - k * .28}Z" fill="#6E5262"/>`;
    const pts = [];
    for (let i = 0; i < 16; i++) { const x = 10 + r() * 220, y = 10 + r() * 220; pts.push([x, y]); s += i % 3 ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.6" fill="#6E5262"/>` : star(f1(x), f1(y), 5 + r() * 3); }
    s += `<path d="M${pts.slice(0, 5).map(p => p.map(f1).join(' ')).join(' L')}" fill="none" stroke="#654a5a" stroke-width=".8"/>`;
    s += `<path d="M180 40 a14 14 0 1 0 10 24 a11 11 0 1 1 -10 -24Z" fill="#6E5262"/>`;
    return s;
  })(), C.plum),
  /* graph paper: barely there from far away, a grid up close: the studio */
  grid: `linear-gradient(rgba(123,128,96,.32) 1px, transparent 1px) 0 0 / 28px 28px, linear-gradient(90deg, rgba(123,128,96,.32) 1px, transparent 1px) 0 0 / 28px 28px`,
  /* floors */
  herringbone: tile(80, 120, (() => {
    let s = ''; const cols = ['#4A3128', '#55382D', '#4E342A', '#5B3D31', '#523629'];
    for (let row = -1; row < 4; row++) {
      const y = row * 30;
      s += `<polygon points="0,${y} 40,${y + 20} 40,${y + 50} 0,${y + 30}" fill="${cols[(row + 5) % 5]}" stroke="#2E1E17" stroke-width=".9"/>`;
      s += `<polygon points="40,${y + 20} 80,${y} 80,${y + 30} 40,${y + 50}" fill="${cols[(row + 7) % 5]}" stroke="#2E1E17" stroke-width=".9"/>`;
    }
    return s;
  })(), '#51382D'),
  basket: tile(96, 96, (() => {
    let s = ''; const c = ['#33221B', '#3B271F', '#2E1E18'];
    for (let bx = 0; bx < 2; bx++) for (let by = 0; by < 2; by++) {
      const x0 = bx * 48, y0 = by * 48, hor = (bx + by) % 2 === 0;
      for (let i = 0; i < 3; i++) s += hor ? `<rect x="${x0}" y="${y0 + i * 16}" width="48" height="16" fill="${c[(i + bx) % 3]}" stroke="#20140F" stroke-width="1"/>` : `<rect x="${x0 + i * 16}" y="${y0}" width="16" height="48" fill="${c[(i + by) % 3]}" stroke="#20140F" stroke-width="1"/>`;
    }
    return s;
  })(), C.walnutDk),
  versailles: tile(160, 160, `<rect x="4" y="4" width="152" height="152" fill="none" stroke="#3B271F" stroke-width="8"/><path d="M8 8 L152 152 M152 8 L8 152 M80 8 L8 80 L80 152 L152 80 Z" stroke="#3B271F" stroke-width="5" fill="none"/><path d="M8 8 L152 152 M152 8 L8 152" stroke="#6B4A39" stroke-width="1"/>`, '#5B3D31'),
  checker: tile(120, 120, `<rect width="60" height="60" fill="#E9DFCC"/><rect x="60" y="60" width="60" height="60" fill="#E9DFCC"/><rect x="60" width="60" height="60" fill="#5A3D30"/><rect y="60" width="60" height="60" fill="#5A3D30"/><path d="M62 10 Q80 22 92 8 T118 30 M4 70 Q22 84 40 72 T58 100" stroke="rgba(255,240,220,.18)" fill="none"/><path d="M6 12 Q26 24 40 8" stroke="rgba(120,90,60,.15)" fill="none"/>`, '#E9DFCC'),
  terracotta: tile(180, 180, (() => {
    const r = rng(3); let s = ''; const cols = ['#B8664A', '#C27455', '#A85A40', '#CC8463', '#B06048', '#D09070'];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s += `<rect x="${i * 45 + 1}" y="${j * 45 + 1}" width="43" height="43" rx="2" fill="${cols[(r() * cols.length) | 0]}"/>`;
    return s;
  })(), '#E8D7C2'),
  /* lime plaster and limewash: colour that moves */
  plaster: svgURL(svg(240, 240, `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .22 0"/></filter><rect width="240" height="240" filter="url(#n)"/>`)),
  plasterDk: svgURL(svg(240, 240, `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".01" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .3 0"/></filter><rect width="240" height="240" filter="url(#n)"/>`)),
  /* a little floral for the dressing-room ceiling, which nobody notices until they look up */
  ceilFloral: tile(70, 70, rose(18, 18, 4.5, C.rose, C.blush) + leaf(14, 24, 7, -60, C.sage, false) + rose(52, 52, 4.5, C.clay, C.blush) + leaf(56, 58, 7, 60, C.sage, false), '#F4E4E1')
};
/* painted stair risers: marigold, then jasmine, then bougainvillea. the house blooms as you climb */
function riser(scheme) {
  const w = 300, h = 40;
  let s = `<rect width="${w}" height="${h}" fill="${C.ivory}"/><path d="M20 ${h / 2} C70 4 100 36 150 ${h / 2} S230 4 280 ${h / 2}" stroke="${C.olive}" stroke-width="1.6" fill="none"/>`;
  for (const x of [60, 100, 200, 240]) s += leaf(x, h / 2 + 2, 10, x < 150 ? -70 : 70, C.olive, false);
  const flower = { marigold: (x, y, r) => marigold(x, y, r), jasmine: (x, y, r) => jasmine(x, y, r + 2), bougain: (x, y, r) => bougain(x, y, r + 3) }[scheme];
  s += flower(150, h / 2, 10) + flower(36, h / 2, 6) + flower(264, h / 2, 6) + flower(110, 12, 4) + flower(190, 28, 4);
  return svgURL(svg(w, h, s));
}
/* a faded Persian rug: dusty rose, rust, cream, olive */
function persian(w, h) {
  const b = 26;
  let s = `<rect width="${w}" height="${h}" fill="#8E4B47"/><rect x="${b / 2}" y="${b / 2}" width="${w - b}" height="${h - b}" fill="none" stroke="#E7D7BE" stroke-width="${b * .6}"/>`;
  s += `<rect x="${b * 1.3}" y="${b * 1.3}" width="${w - b * 2.6}" height="${h - b * 2.6}" fill="#B07A6E"/>`;
  for (let i = 0; i < (w - b * 2) / 22; i++) s += `<circle cx="${b + 11 + i * 22}" cy="${b / 2}" r="4" fill="${C.olive}"/><circle cx="${b + 11 + i * 22}" cy="${h - b / 2}" r="4" fill="${C.olive}"/>`;
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) * .26;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${R * 1.25}" ry="${R * .95}" fill="#E7D7BE"/><ellipse cx="${cx}" cy="${cy}" rx="${R * .95}" ry="${R * .68}" fill="${C.olive}"/><ellipse cx="${cx}" cy="${cy}" rx="${R * .6}" ry="${R * .42}" fill="#C99B98"/>` + rose(cx, cy, R * .22, '#8E4B47', '#E7D7BE');
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; s += `<circle cx="${f1(cx + Math.cos(a) * R * 1.1)}" cy="${f1(cy + Math.sin(a) * R * .82)}" r="${f1(R * .09)}" fill="#8E4B47"/>`; }
  for (const [x, y] of [[b * 2, b * 2], [w - b * 2, b * 2], [b * 2, h - b * 2], [w - b * 2, h - b * 2]]) s += `<circle cx="${x}" cy="${y}" r="${R * .35}" fill="#E7D7BE" opacity=".8"/><circle cx="${x}" cy="${y}" r="${R * .18}" fill="${C.olive}"/>`;
  for (let i = 0; i < 40; i++) s += `<circle cx="${(i * 97) % w}" cy="${(i * 53) % h}" r="${2 + (i % 3)}" fill="#E7D7BE" opacity=".25"/>`;
  return svgURL(svg(w, h, `<g opacity=".92">${s}</g>`));
}
/* a hand-woven dhurrie for the drawing room */
function dhurrie(w, h) {
  let s = `<rect width="${w}" height="${h}" fill="${C.cream}"/><rect x="14" y="14" width="${w - 28}" height="${h - 28}" fill="none" stroke="${C.rose}" stroke-width="10"/>`;
  for (let x = 60; x < w - 40; x += 80) for (let y = 60; y < h - 40; y += 80) s += `<path d="M${x} ${y - 22} L${x + 22} ${y} L${x} ${y + 22} L${x - 22} ${y} Z" fill="${(x + y) % 160 ? C.blush : C.olive}" opacity=".85"/><path d="M${x} ${y - 9} L${x + 9} ${y} L${x} ${y + 9} L${x - 9} ${y} Z" fill="${C.oxblood}"/>`;
  return svgURL(svg(w, h, s));
}

/* tile textures become CSS variables; the big one-off paintings are handed to the rooms that hang them */
for (const k in TEX) document.documentElement.style.setProperty('--tx-' + k, TEX[k]);
for (const k of ['marigold', 'jasmine', 'bougain']) document.documentElement.style.setProperty('--riser-' + k, riser(k));
document.documentElement.style.setProperty('--niche', svgURL(niche(200, 270, '#EFE5D3', C.brassLt, C.rose)));

/* ---------- the grown-up dollhouse: papers and materials used sparingly ---------- */
/* a dark botanical wallpaper, William Morris by way of Jaipur: one wall in the living room, nowhere else */
TEX.morris = tile(180, 180, (() => {
  const r = rng(21); let s = '';
  s += `<path d="M0 150 C40 120 50 70 90 60 S150 20 180 30" stroke="#8E9A6C" stroke-width="3" fill="none"/><path d="M0 60 C30 40 60 50 90 90 S140 160 180 150" stroke="#6F7A50" stroke-width="2.5" fill="none"/>`;
  for (let i = 0; i < 14; i++) s += leaf(r() * 180, r() * 180, 16 + r() * 18, r() * 360, ['#6F7A50', '#8E9A6C', '#5E6846', '#9AA383'][i % 4], false);
  s += peony(90, 60, 20, '#B97979', '#E7C3C1', '#8E4B47') + peony(30, 150, 15, '#C99B98', '#F0D9D6', '#8E4B47') + rose(150, 140, 9, '#D9A9A9', '#F3E3E2') + jasmine(140, 40, 7) + jasmine(40, 90, 6) + marigold(110, 160, 7);
  return s;
})(), '#2F3A2C');
/* hand-made zellige: cream, glossy, never quite even */
TEX.zellige = tile(120, 60, (() => { const r = rng(5); let s = ''; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const l = 88 + r() * 8; s += `<rect x="${i * 30 + 1}" y="${j * 30 + 1}" width="28" height="28" rx="2" fill="hsl(38,40%,${l}%)"/><rect x="${i * 30 + 4}" y="${j * 30 + 4}" width="${8 + r() * 10}" height="3" rx="1.5" fill="rgba(255,255,255,.6)"/>`; } return s; })(), '#D9CBB0');
/* a marble mosaic for the bath */
TEX.mosaic = tile(48, 48, (() => { let s = ''; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s += `<rect x="${i * 12 + .5}" y="${j * 12 + .5}" width="11" height="11" fill="${(i + j) % 5 ? '#F1EBE2' : '#C99B98'}"/>`; return s; })(), '#D8CFC2');
/* limestone and chocolate-burgundy checkerboard for the hall and kitchen */
TEX.checker2 = tile(110, 110, `<rect width="55" height="55" fill="#E9DFCC"/><rect x="55" y="55" width="55" height="55" fill="#E9DFCC"/><rect x="55" width="55" height="55" fill="#4E2E2A"/><rect y="55" width="55" height="55" fill="#4E2E2A"/><path d="M60 8 Q80 20 92 6 T108 26" stroke="rgba(255,235,220,.16)" fill="none"/><path d="M4 66 Q20 80 38 70" stroke="rgba(120,90,60,.14)" fill="none"/>`, '#E9DFCC');
/* old wide attic boards */
TEX.boards = tile(220, 300, (() => { const r = rng(9); let s = ''; for (let i = 0; i < 2; i++) s += `<rect x="${i * 110}" width="108" height="300" fill="hsl(25,${28 + r() * 8}%,${38 + r() * 8}%)"/><circle cx="${i * 110 + 30 + r() * 50}" cy="${40 + r() * 200}" r="3" fill="rgba(0,0,0,.25)"/>`; return s; })(), '#2E1E18');
/* flagstone for the drive and the terraces: no grids anywhere */
TEX.flag = tile(200, 200, (() => { const r = rng(13); let s = ''; const pts = [[0, 0, 90, 70], [92, 0, 108, 60], [0, 72, 60, 70], [62, 62, 80, 80], [144, 62, 56, 90], [0, 144, 100, 56], [102, 144, 98, 56]]; for (const [x, y, w, h] of pts) s += `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" rx="10" fill="hsl(36,${18 + r() * 8}%,${70 + r() * 8}%)"/>`; return s; })(), '#9C8F78');
TEX.gravel = tile(60, 60, (() => { const r = rng(3); let s = ''; for (let i = 0; i < 40; i++) s += `<circle cx="${r() * 60}" cy="${r() * 60}" r="${1 + r() * 1.6}" fill="hsl(35,${15 + r() * 10}%,${62 + r() * 18}%)"/>`; return s; })(), '#CDBFA5');
/* a dark slate roof and a cut-limestone base */
TEX.slate = tile(80, 60, `<rect width="80" height="60" fill="#3E4440"/><path d="M0 30 H80 M0 60 H80" stroke="#2C302D" stroke-width="3"/><path d="M20 0 V30 M60 0 V30 M0 30 V60 M40 30 V60" stroke="#2C302D" stroke-width="2"/><rect x="2" y="2" width="16" height="3" fill="rgba(255,255,255,.06)"/>`, '#3E4440');
TEX.stone = tile(160, 80, `<rect width="160" height="80" fill="#E3D6BE"/><path d="M0 40 H160 M0 80 H160 M60 0 V40 M130 0 V40 M20 40 V80 M100 40 V80" stroke="#C9B898" stroke-width="2"/>`, '#E3D6BE');
for (const k of ['morris', 'zellige', 'mosaic', 'checker2', 'boards', 'flag', 'gravel', 'slate', 'stone']) document.documentElement.style.setProperty('--tx-' + k, TEX[k]);
/* a vintage wool rug in any palette */
function wool(w, h, p = ['#E7D7BE', '#B97979', '#7B8060', '#A0522D', '#7A2E3A']) {
  const [cream, rose, olive, rust, wine] = p, b = 22;
  let s = `<rect width="${w}" height="${h}" fill="${cream}"/><rect x="${b / 2}" y="${b / 2}" width="${w - b}" height="${h - b}" fill="none" stroke="${rust}" stroke-width="${b * .5}" opacity=".75"/><rect x="${b * 1.4}" y="${b * 1.4}" width="${w - b * 2.8}" height="${h - b * 2.8}" fill="none" stroke="${olive}" stroke-width="4"/>`;
  const r = rng(w + h);
  for (let x = b * 2.4; x < w - b * 2; x += 46) for (let y = b * 2.4; y < h - b * 2; y += 46) s += `<path d="M${x} ${y - 10} L${x + 10} ${y} L${x} ${y + 10} L${x - 10} ${y} Z" fill="${[rose, olive, rose, wine][(r() * 4) | 0]}" opacity="${.45 + r() * .3}"/>`;
  s += `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w * .2}" ry="${h * .18}" fill="${rose}" opacity=".55"/>` + rose_(w / 2, h / 2, Math.min(w, h) * .06, wine, cream);
  return svgURL(svg(w, h, `<g opacity=".93">${s}</g>`));
}
function rose_(x, y, r, a, b) { return rose(x, y, r, a, b); }
/* loose flowers: garden roses, hydrangea, stems and leaves, never circles on a stick */
function bouquet(seed = 1, kind = 'rose') {
  const r = rng(seed), w = 140, h = 160; let s = '';
  for (let i = 0; i < 9; i++) { const x = 70 + (r() - .5) * 70, y = 70 + r() * 40; s += `<path d="M70 160 Q${(70 + x) / 2} ${(160 + y) / 2 + 10} ${x} ${y}" stroke="#6F7A50" stroke-width="2" fill="none"/>`; s += leaf(x + (r() - .5) * 20, y + 10 + r() * 30, 14 + r() * 10, (r() - .5) * 140, ['#6F7A50', '#8E9A6C', '#5E6846'][i % 3], false); }
  for (let i = 0; i < 7; i++) { const x = 70 + (r() - .5) * 80, y = 30 + r() * 60, c = kind === 'hydrangea' ? ['#D8C4D6', '#E9D6DC', '#C9B6CE'][i % 3] : ['#E7C3C1', '#B97979', '#F3E3E2', '#C99B98'][i % 4];
    s += kind === 'hydrangea' ? `<circle cx="${x}" cy="${y}" r="${12 + r() * 6}" fill="${c}"/>` + Array.from({ length: 6 }, (_, k) => `<circle cx="${(x + Math.cos(k) * 8).toFixed(1)}" cy="${(y + Math.sin(k) * 8).toFixed(1)}" r="3" fill="rgba(255,255,255,.45)"/>`).join('') : peony(x, y, 10 + r() * 5, c, '#FBF0EE', '#8E4B47'); }
  return svgURL(svg(w, h, s));
}
document.documentElement.style.setProperty('--bq-rose', bouquet(4, 'rose'));
document.documentElement.style.setProperty('--bq-hyd', bouquet(8, 'hydrangea'));
document.documentElement.style.setProperty('--bq-rose2', bouquet(11, 'rose'));
