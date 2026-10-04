/* The visit: an intro in the front garden, a guided tour bottom to top, and freedom to wander. */
const panel = $('#panel'), pBody = $('#pBody'), caption = $('#caption'), intro = $('#intro');
const narrow = () => W < 760;
let cur = -1, panelWanted = false, panelTimer = null, introOn = true;

/* ---------- memory: which stops you've seen (a convenience, never required) ---------- */
let seen = new Set();
try { seen = new Set(JSON.parse(localStorage.getItem('house-seen-3') || '[]')); } catch {}
const remember = id => { seen.add(id); try { localStorage.setItem('house-seen-3', JSON.stringify([...seen])); } catch {} };

/* ---------- sound: soft plucks, off with one tap ---------- */
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

/* ---------- framing a stop: stand square to it, far enough back that it fits beside the panel ---------- */
const NORMAL = { S: [0, 1, 0], N: [0, -1, Math.PI], E: [1, 0, -Math.PI / 2], W: [-1, 0, Math.PI / 2] };
function viewpoint(id, withPanel) {
  const t = TARGETS[id], [nx, nz, yaw] = NORMAL[t.face];
  const aw = withPanel && !narrow() ? W - 480 : W, ah = withPanel && narrow() ? VH * .4 : VH - 140;
  let dist = clamp(P * Math.max(t.w * 1.22 / aw, t.h * 1.3 / ah), t.minDist || 220, 1100);
  const px = nx ? t.line : t.along, pz = nx ? t.along : t.line;
  let x = px + nx * dist, z = pz + nz * dist;
  const r = t.room === 'attic' ? { x0: -950, x1: 300, z0: -1300, z1: -60 } : ROOMS[t.room];
  if (r) { x = clamp(x, r.x0 + 70, r.x1 - 70); z = clamp(z, r.z0 + 70, r.z1 - 70); }
  else z = Math.max(z, 1000);
  dist = Math.abs(nx ? x - px : z - pz);
  /* some things are best seen from a set spot, at an angle */
  if (t.at) { [x, z] = t.at; const dx = px - x, dz = pz - z; return { x, z, yaw: Math.atan2(dx, -dz), pitch: Math.atan2(t.up - EYE, Math.hypot(dx, dz)), pf: (t.lv || 0) * LH }; }
  const pf = (t.lv || 0) * LH;
  return { x, z, yaw, pitch: Math.atan2(t.up - EYE, dist), pf };
}
const frame = (id, done) => { const v = viewpoint(id, panelWanted); walkTo(v.x, v.z, v.yaw, v.pitch, done, v.pf); };

/* ---------- the panel ---------- */
let panelTick = null;
const idx = id => STOPS.findIndex(s => s.id === id);
function goTo(i, sub) {
  if (i < 0 || i >= STOPS.length) return;
  if (mode !== 'walk') return enterStop(i, sub);
  closePanel(true);
  cur = i; panelWanted = true; paintTour();
  frame(STOPS[i].id, () => openPanel(i, sub));
}
function openPanel(i, sub) {
  const s = STOPS[i];
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
  toys(s.id, true);
  chime([587.33, 783.99], .045);
  clearTimeout(autoT);
  if (autoplay) autoT = setTimeout(() => autoplay && goTo((cur + 1) % STOPS.length), 9000);
}
/* the toys: open the closet, slide the ladder, pour the latte, lift the trunk lid */
const toys = (id, on) => world.querySelectorAll('[data-play]').forEach(el => { if (el.dataset.play.split(' ').includes(id)) el.classList.toggle('on', on); });
function closePanel(keepWanted) {
  clearInterval(panelTick); panelTick = null;
  world.querySelectorAll('[data-play].on').forEach(el => { if (!['garage', 'basement'].includes(el.dataset.play)) el.classList.remove('on'); });
  panel.classList.remove('in');
  clearTimeout(panelTimer);
  panelTimer = setTimeout(() => { if (!panel.classList.contains('in')) panel.hidden = true; }, 350);
  if (!keepWanted) { panelWanted = false; paintTour(); }
}
const api = { frame: id => frame(id), fps: () => fps, seen: () => seen.size };
$('#pClose').onclick = () => closePanel();
pBody.addEventListener('pointerdown', () => setAuto(false));
$('#pNext').onclick = () => goTo((cur + 1) % STOPS.length);
$('#pPrev').onclick = () => goTo(cur - 1);
$('#nextBtn').onclick = () => goTo(nextUnseen());
const nextUnseen = () => {
  for (let k = 1; k <= STOPS.length; k++) { const j = (cur + k + STOPS.length) % STOPS.length; if (!seen.has(STOPS[j].id) || seen.size === STOPS.length) return j; }
  return 0;
};

/* ---------- tour dots, the four little floor plans, the stop list ---------- */
const dots = $('#dots'), stopList = $('#stopList'), map = $('#map');
dots.innerHTML = STOPS.map(() => '<i></i>').join('');
const roomName = id => ROOMS[id] ? ROOMS[id].name : 'The front garden';
stopList.innerHTML = STOPS.map((s, i) => `<li><button data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${strip(s.title)}<small>${roomName(TARGETS[s.id].room)}</small></button></li>`).join('');
stopList.querySelectorAll('button').forEach(b => b.onclick = () => { toggleMap(false); goTo(+b.dataset.i); });
const MO = L => [L * 3600, 0];
const spot = id => { const t = TARGETS[id], [nx, nz] = NORMAL[t.face], [ox2, oz2] = MO(t.lv || 0); return nx ? [t.line + nx * 80 + ox2, t.along + oz2] : [t.along + ox2, t.line + nz * 80 + oz2]; };
map.setAttribute('viewBox', '-2100 -2950 10900 4000');
map.innerHTML = [0, 1, 2].map(L => { const [a, b] = MO(L); return `<text class="m-floor" x="${a - 1960}" y="${b - 2780}">${FLOORS[L]}</text>`; }).join('') +
  Object.entries(ROOMS).filter(([id]) => id !== 'attic').map(([id, r]) => { const [a, b] = MO(r.lv); return `<g class="m-room${r.secret ? ' secret' : ''}" data-room="${id}" tabindex="0" role="button" aria-label="${r.name}"><rect x="${r.x0 + a}" y="${r.z0 + b}" width="${r.x1 - r.x0}" height="${r.z1 - r.z0}"/><text x="${(r.x0 + r.x1) / 2 + a}" y="${(r.z0 + r.z1) / 2 + b + 30}">${r.name.replace('The ', '').replace('Her ', '')}</text></g>`; }).join('') +
  STOPS.map((s, i) => { const [x, z] = spot(s.id); return `<circle class="m-stop" data-i="${i}" cx="${x}" cy="${z}" r="46"/>`; }).join('') +
  `<g id="mMe"><path d="M0 -110 L70 60 L0 28 L-70 60 Z"/></g>`;
const mMe = $('#mMe');
map.querySelectorAll('.m-room').forEach(g => {
  const go = () => { toggleMap(false); goTo(STOPS.findIndex(s => TARGETS[s.id].room === g.dataset.room)); };
  g.onclick = go; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
});
function paintTour() {
  [...dots.children].forEach((d, i) => { d.classList.toggle('seen', seen.has(STOPS[i].id)); d.classList.toggle('cur', i === cur); });
  map.querySelectorAll('.m-stop').forEach(c => c.classList.toggle('seen', seen.has(STOPS[+c.dataset.i].id)));
  stopList.querySelectorAll('button').forEach((b, i) => { b.classList.toggle('seen', seen.has(STOPS[i].id)); b.classList.toggle('cur', i === cur); });
  $('#mapCount').textContent = `${seen.size} of ${STOPS.length} stops`;
  $('#nextName').textContent = '· ' + strip(STOPS[nextUnseen()].title).split(/\. |\?/)[0].replace(/\.$/, '');
  document.body.classList.toggle('has-panel', panelWanted);
}
const mapPanel = $('#mapPanel'), mapBtn = $('#mapBtn');
function toggleMap(show = mapPanel.hidden) { mapPanel.hidden = !show; mapBtn.setAttribute('aria-expanded', show); }
mapBtn.onclick = () => toggleMap();

/* ---------- view modes, like a 3D listing: walk through it, see it as a dollhouse, read the plan ---------- */
let mode = 'walk', autoplay = false, autoT = null, floorShown = 2;
const orbit = { yaw: 0, pitch: -.12, r: 4000 };
const HC = () => mode === 'plan' ? [0, -floorShown * LH, -1100] : [100, -650, -600];
const fitR = () => mode === 'plan' ? P * Math.max(3800 / (narrow() ? W : W - 300), 4200 / (VH - 180)) : P * Math.max(5600 / (narrow() ? W : W - 300), 3600 / (VH - 160));
const modeBtns = [...document.querySelectorAll('.modes button')], floorBtns = [...document.querySelectorAll('.floors button')];
function setFloor(f) {
  floorShown = f;
  floorBtns.forEach(b => b.setAttribute('aria-pressed', +b.dataset.f === f));
  if (mode === 'plan') orbit.r = fitR();
  cull();
}
floorBtns.forEach(b => b.onclick = () => setFloor(+b.dataset.f));
function paintMode() {
  modeBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.m === mode));
  document.body.classList.toggle('overhead', mode !== 'walk');
  document.body.classList.toggle('plan', mode === 'plan');
}
function setMode(m) {
  if (introOn) { endIntro(); openDoor('front'); }
  if (m === 'walk') { if (mode !== 'walk') enterStop(cur >= 0 ? cur : 1); return; }
  const from = mode;
  closePanel(); toggleMap(false);
  mode = m; paintMode();
  if (m === 'plan') { if (from === 'walk') floorShown = clamp(Math.round(cam.pf / LH), 0, 2); orbit.pitch = -1.5; orbit.yaw = 0; }
  else { floorShown = 2; orbit.pitch = -.03; orbit.yaw = from === 'walk' ? clamp(wrap(cam.yaw), -.5, .5) : 0; }
  setFloor(floorShown);
  orbit.r = fitR();
  const [tx, ty, tz] = HC();
  fly(orbitPose(tx, ty, tz, orbit.yaw, orbit.pitch, orbit.r), from === 'walk' ? 2 : 1.2);
}
/* drop from above straight into a stop, the way a listing tour flies you into a room */
function enterStop(i, sub) {
  if (i < 0) return;
  const s = STOPS[i];
  openDoor('front');
  cur = i; panelWanted = true; paintTour();
  const v = viewpoint(s.id, true);
  let landed = false;
  fly({ x: v.x, y: -(v.pf + EYE), z: v.z, yaw: v.yaw, pitch: v.pitch }, mode === 'walk' ? .8 : 2.2, () => { cam.pf = v.pf; openPanel(i, sub); }, k => {
    if (!landed && k > .78) { landed = true; mode = 'walk'; cam.pf = v.pf; paintMode(); cull(); }
  });
}
modeBtns.forEach(b => b.onclick = () => { setAuto(false); setMode(b.dataset.m); });

/* play: a hands-free tour that moves on every nine seconds, until you touch anything */
const playBtn = $('#playBtn');
function setAuto(on) {
  if (autoplay === on) return;
  autoplay = on; clearTimeout(autoT);
  playBtn.setAttribute('aria-pressed', on);
  playBtn.querySelector('span').textContent = on ? 'Pause' : 'Play tour';
  if (on) { const n = cur < 0 || cur >= STOPS.length - 1 ? 0 : cur + 1; if (mode !== 'walk') enterStop(n); else goTo(n); }
}
playBtn.onclick = e => { e.stopPropagation(); if (introOn) endIntro(); setAuto(!autoplay); };

layout();
/* Matterport-style rings on the floor: one at every stop, one each side of every doorway */
for (const s of STOPS) {
  const t = TARGETS[s.id], v = viewpoint(s.id, false);
  plane(G[t.room] || G.ext, 90, 90, v.x, -v.pf - 2.5, v.z, 0, 90, 'hotspot stop-ring', '<i></i>').dataset.stop = s.id;
}
for (const d of DOORS) {
  if (d.id === 'front') continue;
  for (const sg of [-1, 1]) {
    const x = d.dir === 'v' ? d.x + sg * 140 : d.x, z = d.dir === 'h' ? d.z + sg * 140 : d.z, pf = d.lv * LH, a = areaAt(x, z, pf);
    const g = a === 'core' ? G.core[d.lv] : G[a];
    if (g) plane(g, 70, 70, x, -pf - 2.5, z, 0, 90, 'hotspot', '<i></i>').dataset.walk = `${x},${z},${pf}`;
  }
}
/* the ring under your pointer, so you can see where a tap will take you */
function moveCursor(e, hot) {
  const onFloor = mode === 'walk' && !hot && e.target.closest && e.target.closest('.floor,.rug,.pool,.lawn,.path,.landing,.tread');
  const p = onFloor && floorAt(e.clientX, e.clientY);
  if (!p || heightAt(p[0], p[1], cam.pf, 40) == null) { cursorEl.classList.remove('on'); return; }
  cursorEl.style.transform = `translate3d(${p[0].toFixed(0)}px,${(-cam.pf - 4).toFixed(0)}px,${p[1].toFixed(0)}px) rotateX(90deg)`;
  cursorEl.classList.add('on');
}
scene.addEventListener('pointerleave', () => cursorEl.classList.remove('on'));

/* which room is under the pointer from outside: our own ray, into the house's box, then the storey it lands on */
function pick(cx, cy) {
  const d = rayDir(cx, cy), o = [cam.x, cam.y, cam.z];
  if (mode === 'plan') {
    const p = floorAt(cx, cy, floorShown * LH);
    if (!p) return null;
    const a = areaAt(p[0], p[1], floorShown * LH);
    return a === 'out' ? null : a;
  }
  const lo = [-1700, -RIDGE, -3150], hi = [1950, 0, 900];
  let t0 = 0, t1 = Infinity;
  for (let k = 0; k < 3; k++) {
    if (Math.abs(d[k]) < 1e-9) { if (o[k] < lo[k] || o[k] > hi[k]) return null; continue; }
    let a = (lo[k] - o[k]) / d[k], b = (hi[k] - o[k]) / d[k];
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a); t1 = Math.min(t1, b);
  }
  if (t0 > t1) { const p = floorAt(cx, cy, 0); return p && Math.hypot(p[0] + 400, p[1] - 600) < 700 ? 'out' : null; }
  /* march in until the ray is inside the house (the L leaves empty corners in its box) */
  const n = Math.hypot(...d);
  for (let t = t0 + 60 / n; t < t1; t += 60 / n) {
    const x = o[0] + d[0] * t, y = o[1] + d[1] * t, z = o[2] + d[2] * t;
    if (!inFoot(x, z) && !inRect(ROOMS.garden, x, z) && !inRect(ROOMS.balcony, x, z)) continue;
    const L = clamp(Math.floor(-y / LH), 0, 2), a = areaAt(x, z, L * LH);
    if (a === 'out') continue;
    return HELIXES.some(h => h.id === a) ? null : a;
  }
  return null;
}

/* ---------- looking, walking, tapping ---------- */
const keys = new Set();
const typing = e => /input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable;
addEventListener('keydown', e => {
  if (introOn) { if (e.key === 'Enter') knock(); return; }
  setAuto(false);
  if (e.key === 'Escape') { if (!mapPanel.hidden) toggleMap(false); else if (mode !== 'walk') setMode('walk'); else closePanel(); return; }
  if (mode !== 'walk' || typing(e) || e.metaKey || e.ctrlKey) return;
  const k = e.key.toLowerCase();
  if (k === 'n') { goTo(nextUnseen()); return; }
  if (k === 'm') { toggleMap(); return; }
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
    if (panel.contains(document.activeElement) && k.startsWith('arrow')) return;
    keys.add(k); if (k !== 'shift') { walk = null; if (!panel.hidden && /^[wasd]$|arrowup|arrowdown/.test(k)) closePanel(); }
    e.preventDefault();
  }
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());

let drag = null;
scene.addEventListener('pointerdown', e => {
  if (introOn || e.button > 0) return;
  setAuto(false);
  drag = { x: e.clientX, y: e.clientY, moved: 0, target: e.target, id: e.pointerId };
  scene.setPointerCapture(e.pointerId);
});
scene.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) {
    const hot = mode === 'walk' ? e.target.closest && e.target.closest('[data-stop],.hotspot') : pick(e.clientX, e.clientY);
    scene.classList.toggle('hot', !!hot);
    moveCursor(e, hot);
    return;
  }
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
  if (drag.moved < 6) return;
  scene.classList.add('dragging');
  cursorEl.classList.remove('on');
  if (mode !== 'walk') {
    if (flight) return;
    orbit.yaw -= dx * .005;
    if (mode === 'doll') orbit.pitch = clamp(orbit.pitch - dy * .004, -1.2, -.05);
    return;
  }
  walk = null;
  const k = 1.15 / P;
  cam.yaw -= dx * k; cam.pitch = clamp(cam.pitch + dy * k, -.8, .8);
});
const endDrag = e => {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag; drag = null; scene.classList.remove('dragging');
  if (d.moved >= 6 || e.type === 'pointercancel') return;
  if (mode !== 'walk') {
    if (flight) return;
    const id = pick(e.clientX, e.clientY);
    if (id === 'out') return enterStop(0);
    if (id) return enterStop(STOPS.findIndex(s => TARGETS[s.id].room === id));
    return;
  }
  const toy = d.target.closest && d.target.closest('[data-play]');
  if (toy && !toy.closest('[data-stop]')) {
    toy.classList.toggle('on'); chime(toy.classList.contains('on') ? [523.25, 659.25] : [659.25, 523.25], .05);
    if (toy.dataset.play === 'basement' && toy.classList.contains('on')) showCaption('The basement', 'What shaped her. It stays down here.', 4200);
    return;
  }
  const spot = d.target.closest && d.target.closest('[data-walk]');
  if (spot) { const [x, z, pf] = spot.dataset.walk.split(',').map(Number); closePanel(); return walkTo(x, z, null, 0, null, pf); }
  const hit = d.target.closest && d.target.closest('[data-stop]');
  if (hit) { const sub = hit.dataset.sub; goTo(idx(hit.dataset.stop), sub != null ? +sub : undefined); return; }
  const p = floorAt(e.clientX, e.clientY);
  if (!p) return;
  let [x, z] = p;
  const far = Math.hypot(x - cam.x, z - cam.z);
  if (far > 1800) { x = cam.x + (x - cam.x) / far * 1800; z = cam.z + (z - cam.z) / far * 1800; }
  [x, z] = collide(x, z);
  if (heightAt(x, z, cam.pf, 40) == null) return;
  closePanel();
  ripple(e.clientX, e.clientY);
  walkTo(x, z, null, 0);
};
scene.addEventListener('pointerup', endDrag);
scene.addEventListener('pointercancel', endDrag);
scene.addEventListener('wheel', e => {
  if (introOn) return;
  e.preventDefault();
  if (mode !== 'walk') { const f = fitR(); orbit.r = clamp(orbit.r * Math.exp(e.deltaY * .0012), f * .4, f * 1.8); return; }
  walk = null;
  const s = clamp(-e.deltaY, -120, 120) * 1.4;
  stepTo(cam.x + Math.sin(cam.yaw) * s, cam.z - Math.cos(cam.yaw) * s);
}, { passive: false });
const ripple = (x, y) => { const r = document.createElement('i'); r.className = 'ripple'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.append(r); setTimeout(() => r.remove(), 700); };

/* ---------- which rooms to draw: your storey (and the next, on the stairs) ---------- */
/* the moment a walk begins, load what's ahead */
const walkTo0 = walkTo;
walkTo = (...args) => { walkTo0(...args); cull(); };
let roomNow = null, capTimer = null;
const ADJ = {};
for (const d of DOORS) { (ADJ[d.a] = ADJ[d.a] || []).push(d.b); (ADJ[d.b] = ADJ[d.b] || []).push(d.a); }
/* rooms that share a space: the two-storey closet and its gallery, the attic and the music room */
const ALSO = { closet: ['gallery'], gallery: ['closet'], attic: ['music'], music: ['attic', 'study'], study: ['library'], library: ['study'], stairs: ['landing'], landing: ['stairs'], bedroom: ['nook', 'balcony'], balcony: ['bedroom'], sunroom: ['garden'], garden: ['sunroom'] };
const show = (g, on) => { const v = on ? '' : 'none'; if (g.style.display !== v) g.style.display = v; };
function cull() {
  if (mode !== 'walk') {
    for (const id in ROOMS) show(G[id], ROOMS[id].lv <= floorShown);
    for (const h of HELIXES) show(G[h.id], true);
    show(G.ext, true); show(G.roof, false);
    roomNow = null;
    return;
  }
  const area = areaAt(cam.x, cam.z, cam.pf), lv = clamp(Math.round(cam.pf / LH), 0, 2), onStairs = HELIXES.some(h => h.id === area);
  /* draw only what you could see from here: your room, the rooms next door, and the stair you're on */
  const want = new Set();
  const outside = area === 'out' || area === 'garden' || area === 'sunroom';
  if (outside) {
    if (cam.z < -1500) ['garden', 'sunroom', 'library', 'cafe', 'kitchen'].forEach(id => want.add(id));
    else { want.add('living'); if (cam.x > 1300 && cam.z < 0) want.add('kitchen'); if (cam.x > 1300 && cam.z > 0) { want.add('garage'); want.add('balcony'); } }
  } else if (onStairs) {
    const h = HELIXES.find(h => h.id === area);
    h.rooms.forEach(id => { if (Math.abs(cam.pf - ROOMS[id].lv * LH) < LH * .9) { want.add(id); (ADJ[id] || []).forEach(r => want.add(r)); } });
  } else {
    want.add(area); (ADJ[area] || []).forEach(r => want.add(r));
  }
  /* load ahead: every room along the way you're walking, and where you'll arrive, before you get there */
  const path = walk ? walk.S : flight && flight.to && mode === 'walk' ? [[flight.to.x, flight.to.z, -flight.to.y - EYE]] : [];
  for (let i = 0; i < path.length; i += 6) { const a = areaAt(path[i][0], path[i][1], path[i][2]); if (ROOMS[a]) want.add(a); }
  if (path.length) { const e = path[path.length - 1], a = areaAt(e[0], e[1], e[2]); if (ROOMS[a]) { want.add(a); (ADJ[a] || []).forEach(r => want.add(r)); } }
  for (const id of [...want]) for (const r of ALSO[id] || []) want.add(r);
  for (const id in ROOMS) show(G[id], want.has(id));
  for (const h of HELIXES) show(G[h.id], h.rooms.some(id => want.has(id)));
  const nearOut = outside || [...want].some(id => (ADJ[id] || []).includes('out') || (ADJ[id] || []).includes('garden'));
  show(G.ext, nearOut);
  show(G.roof, outside || area === 'balcony');
  const room = onStairs ? null : area;
  if (room !== roomNow) {
    roomNow = room;
    if (!introOn && ROOMS[room]) showCaption(ROOMS[room].sub, ROOMS[room].name);
  }
}
function showCaption(k, t, ms = 2600) {
  caption.querySelector('.cap-k').textContent = k;
  caption.querySelector('.cap-t').textContent = t;
  caption.classList.add('on'); clearTimeout(capTimer);
  capTimer = setTimeout(() => caption.classList.remove('on'), ms);
}

/* ---------- the loop ---------- */
let last = performance.now(), fps = 60, frames = 0, fpsT = last, cullT = 0;
function loop(now) {
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  if (++frames, now - fpsT > 1000) { fps = Math.round(frames * 1000 / (now - fpsT)); frames = 0; fpsT = now; }
  if (introOn) { cam.z += (2700 - cam.z) * (1 - Math.exp(-dt * .18)); cam.yaw = Math.sin(now / 5200) * .05; cam.pitch = .14; }
  else if (flight) stepFly(dt);
  else if (mode !== 'walk') { const [tx, ty, tz] = HC(); Object.assign(cam, orbitPose(tx, ty, tz, orbit.yaw, orbit.pitch, orbit.r)); }
  else if (walk) stepWalk(dt);
  else if (keys.size) {
    const run = keys.has('shift') ? 1.8 : 1, sp = 520 * run * dt;
    const f = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
    const st = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0);
    cam.yaw += ((keys.has('arrowright') ? 1 : 0) - (keys.has('arrowleft') ? 1 : 0)) * 1.9 * dt;
    const s = Math.sin(cam.yaw), c = Math.cos(cam.yaw);
    if (cam.z > -10 && cam.z < 90 && Math.abs(cam.x + 1050) < 110 && cam.pf < 10) openDoor('front');
    stepTo(cam.x + (s * f + c * st) * sp, cam.z + (-c * f + s * st) * sp);
  }
  if (mode === 'doll' && !drag && !flight && !still) orbit.yaw = Math.sin(now / 9000) * .12;   // a gentle sway, like a listing turntable
  oxT = panelWanted && !narrow() ? (W - 470) / 2 : mode !== 'walk' && !narrow() ? W / 2 + 145 : W / 2;
  oyT = panelWanted && narrow() ? VH * .22 : mode !== 'walk' && narrow() ? VH * .58 : VH / 2;
  const r = still ? 1 : 1 - Math.exp(-dt * 5);
  ox += (oxT - ox) * r; oy += (oyT - oy) * r;
  render();
  if (now - cullT > (walk || flight || keys.size ? 60 : 200)) { cullT = now; cull(); }
  const [mx, mz] = MO(clamp(Math.round(cam.pf / LH), 0, 2));
  mMe.setAttribute('transform', `translate(${(cam.x + mx).toFixed(0)} ${(cam.z + mz).toFixed(0)}) rotate(${(cam.yaw / RAD).toFixed(1)})`);
  requestAnimationFrame(loop);
}

/* ---------- the intro: the front garden, golden hour ---------- */
const type = (el, text, ms = 36) => new Promise(res => {
  if (still) { el.textContent = text; return res(); }
  let i = 0; const t = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(t); res(); } }, ms);
});
async function runIntro() {
  await new Promise(r => setTimeout(r, still ? 0 : 500));
  await type($('#slug'), 'Austin, Texas · golden hour');
  intro.classList.add('t1');
  await new Promise(r => setTimeout(r, still ? 0 : 900));
  intro.classList.add('t2');
}
function endIntro() {
  if (!introOn) return;
  introOn = false;
  intro.classList.add('gone');
  document.body.classList.add('live');
  setTimeout(() => intro.remove(), 900);
}
function knock() { if (!introOn) return; endIntro(); chime([392, 392], .09); setTimeout(() => goTo(0), 350); }
$('#knock').onclick = knock;
$('#tourBtn').onclick = () => { endIntro(); openDoor('front'); setMode('doll'); };
$('#skip').onclick = () => {
  endIntro(); openDoor('front');
  Object.assign(cam, { x: -1050, z: -120, yaw: 0, pitch: 0, pf: 0, y: -EYE });
  goTo(idx('both'));
};

/* ---------- start ---------- */
world.querySelectorAll('button').forEach(b => b.tabIndex = -1);
layout(); ox = oxT = W / 2; oy = oyT = VH / 2;
addEventListener('resize', layout);
paintTour();
cull();
requestAnimationFrame(loop);
runIntro();
