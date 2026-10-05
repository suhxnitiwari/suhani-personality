/* What opens at each stop. Every line is hers, from the main site; the house only gives it a place to live. */
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const on = (root, sel, ev, fn) => root.querySelectorAll(sel).forEach((n, i) => n.addEventListener(ev, e => fn(n, i, e)));

const MEETS = [
  ['Extraversion 85 × Orderliness 19/20', 'The Planner', "She doesn't just want everyone together. She's already made the reservation."],
  ['Empathy #2 × Assertiveness 18/20', 'The Defender', "She'll put up with something aimed at her longer than something aimed at someone she loves."],
  ['Creative 91.7% × Tradition 67%', 'The Modern Traditionalist', "She'll redesign the family recipe card, and keep the recipe exactly the same."],
  ['Achievement 100% × Relator #1', 'The Loyal Striver', 'She wants to win, and she wants her people at the table when she does.'],
  ['Honesty #2 × Kindness #4', 'The Kind Critic', "She'll tell you it's not working, then stay and help you fix it."],
  ['Dominance × Love #1', 'The Protector', 'Decisive for the people she loves, before they have to ask.']
];
const VALUE_WHY = [
  'Competence and results. She loves setting a goal and seeing it through.',
  "Structure, consistency, and a solid plan. This is when she's at her best.",
  'Benevolence toward the people closest to her. She cares about her people more than about "humanity" in general.',
  "She tells the truth and stands up for what's right.",
  'Self-direction. She does her best work with room to lead.',
  'A sense of purpose bigger than herself, rooted in faith and tradition.',
  'Leaving a mark on the world and on the people around her.'
];
const LL_SHARE = [['Physical Touch', 7], ['Words of Affirmation', 23], ['Receiving Gifts', 27], ['Quality Time', 23], ['Acts of Service', 20]];

const STOPS = [
  {
    id: 'door', kicker: 'The front door', title: 'Suhani', next: 'Come in',
    build: () => `<p class="lede big">Soft heart. <em>Strong spirit.</em></p>
      <p class="rotator" id="heroLine">${HERO_LINES[0]}</p>
      <div class="chips">${['ESFJ-T · Consul', 'Enneagram 8w7', 'DISC: Dominance', 'Holland ASE · The Creator', 'Archetype: Guardian'].map(c => `<span>${c}</span>`).join('')}</div>
      <p class="note">Ten personality tests, one person. Every room in this house holds a different side of her, and every number on the walls comes from her results.</p>`,
    init: root => { let i = 0; const el = root.querySelector('#heroLine'); return setInterval(() => { el.classList.remove('in'); void el.offsetWidth; el.textContent = HERO_LINES[i = (i + 1) % HERO_LINES.length]; el.classList.add('in'); }, 2600); }
  },
  {
    id: 'circle', kicker: 'The living room · the built-ins', title: 'Small circle. <em>Deep roots.</em>',
    build: () => `<p class="lede">The few who get the full version. Tap a ring, and keep tapping.</p>
      <div class="ring-pick">${['Inner', 'Middle', 'Outer'].map((r, i) => `<button class="${i ? '' : 'on'}" data-r="${i}"><i class="rp${i}"></i>${r}</button>`).join('')}</div>
      <div class="ring-say" id="cSay"></div>`,
    init: root => {
      const k = [0, 0, 0], say = root.querySelector('#cSay');
      const show = r => { const c = CIRCLE[r][k[r] % CIRCLE[r].length]; say.innerHTML = `<small>${c[3]}</small><h3>${c[1]}</h3><p>${c[2]}</p><p class="note">${c[5]}</p>`; };
      on(root, '.ring-pick button', 'click', n => { const r = +n.dataset.r; root.querySelectorAll('.ring-pick button').forEach(b => b.classList.toggle('on', b === n)); k[r]++; show(r); });
      show(0);
    }
  },
  {
    id: 'both', kicker: 'The living room · the conversation', title: 'Not either/or. <em>Both/and.</em>',
    build: () => `<p class="lede">Most tests flatten people into one box. Hers pull in opposite directions. Drag to see how both are true.</p>
      <div class="both"><div class="both-words"><b id="bL"></b><b id="bR"></b></div>
      <input type="range" id="bRange" min="0" max="100" value="50" aria-label="Lean toward one side">
      <p class="both-say" id="bSay"></p><p class="src" id="bSrc"></p>
      <div class="row"><button class="pill ghost sm" id="bPrev">←</button><span class="count" id="bCount"></span><button class="pill ghost sm" id="bNext">→</button></div></div>`,
    init: root => {
      let i = 0;
      const L = root.querySelector('#bL'), Rr = root.querySelector('#bR'), r = root.querySelector('#bRange'), say = root.querySelector('#bSay');
      const paint = () => {
        const [, , lw, rw, both] = CONTRAS[i], t = r.value / 100;
        L.style.opacity = .3 + (1 - t) * .7; L.style.transform = `scale(${.75 + (1 - t) * .35})`;
        Rr.style.opacity = .3 + t * .7; Rr.style.transform = `scale(${.75 + t * .35})`;
        say.innerHTML = t < .34 ? lw : t > .66 ? rw : both;
      };
      const show = k => { i = (k + CONTRAS.length) % CONTRAS.length; const [l, rr, , , , src] = CONTRAS[i]; L.textContent = l; Rr.textContent = rr; root.querySelector('#bSrc').textContent = src; root.querySelector('#bCount').textContent = `${i + 1} / ${CONTRAS.length}`; r.value = 50; paint(); };
      r.oninput = paint;
      root.querySelector('#bPrev').onclick = () => show(i - 1);
      root.querySelector('#bNext').onclick = () => show(i + 1);
      show(0);
    }
  },
  {
    id: 'match', kicker: 'The living room · a game on the ottoman', title: 'Would you two <em>click?</em>',
    build: () => `<p class="lede">Pick your personality type and love language. No fake percentages: just where you'd click, where you'd clash, and what to know.</p>
      <div class="mbti">${PAIRS.map(([a, an, b, bn], i) => `<div data-i="${i}"><button data-v="${a}">${a}<small>${an}</small></button><button data-v="${b}">${b}<small>${bn}</small></button></div>`).join('')}</div>
      <div class="opts" id="myLL">${MY_LL.map(([n]) => `<button>${n}</button>`).join('')}</div><div id="mOut"></div>`,
    init: root => {
      const pick = { type: [null, null, null, null], ll: null };
      const score = () => {
        const chosen = pick.type.filter(Boolean);
        const click = chosen.map(v => LETTER[v][0]), clash = chosen.map(v => LETTER[v][1]).filter(Boolean);
        const need = [...chosen.map(v => LETTER[v][2]).filter(Boolean), 'She decides fast and protects hard. It is care, not control.'];
        const appreciate = pick.ll !== null ? [MY_LL[pick.ll][1]] : ['Pick your love language to see this.'];
        if (pick.type[3] === 'J') appreciate.push('That you show up on time, with a plan.');
        if (pick.type[2] === 'F') appreciate.push('That you notice how people feel.');
        const block = (t, items) => `<div><h4>${t}</h4><ul>${items.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
        root.querySelector('#mOut').innerHTML = `<p class="verdict sm">${pick.type.map(v => v || '_').join('')} + ESFJ</p>` + block("Where you'd click", click.length ? click : ['Pick your letters to see this.']) + block("Where you'd clash", clash.length ? clash : ['Honestly? Not much.']) + block("What she'd appreciate", appreciate) + block("What you'd need to understand", need);
      };
      root.querySelectorAll('.mbti div').forEach(pair => pair.querySelectorAll('button').forEach(b => b.onclick = () => {
        pair.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); pick.type[+pair.dataset.i] = b.dataset.v; score();
      }));
      on(root, '#myLL button', 'click', (n, i) => { root.querySelectorAll('#myLL button').forEach(x => x.classList.toggle('on', x === n)); pick.ll = i; score(); });
    }
  },
  {
    id: 'gift', kicker: 'The living room · the dining table', title: 'Speak her <em>language.</em>',
    build: () => `<p class="lede">Guess her #1 love language, then unwrap the gift.</p>
      <div class="opts guess" id="gOpts">${shuffle(LANGS.map(([n], i) => [n, i])).map(([n, i]) => `<button data-i="${i}">${n}</button>`).join('')}</div>
      <div id="gOut" hidden></div>`,
    init: root => on(root, '#gOpts button', 'click', n => {
      const g = +n.dataset.i, out = root.querySelector('#gOut');
      root.querySelector('#gOpts').hidden = true; out.hidden = false;
      out.innerHTML = `<p class="verdict">${g === 0 ? 'You guessed right.' : `You guessed ${LANGS[g][0]}. Close, but no.`}</p>
        <div class="bars">${LL_SHARE.map(([n, v]) => `<p class="${n === 'Receiving Gifts' ? 'hot' : ''}"><span>${n}</span><i style="--v:${v * 3.2}%"></i><em>${v}%</em></p>`).join('')}</div>
        <p class="lede"><b>${LANGS[0][0]}.</b> ${LANGS[0][1]}</p>
        <p class="note">Love, to her, is tangible. Gifts, words, time, and acts all land within 7 points of each other (20–27%). Physical touch, at 7%, is the real outlier.</p>`;
      window.chime && chime([523.25, 659.25, 783.99, 1046.5], .09);
    })
  },
  {
    id: 'receipts', kicker: 'The library · the ten reports', title: 'Ten lenses. <em>None of them is her.</em>',
    build: () => `<p class="lede">Each test sees one slice of a person. None is the whole person, and they don't all deserve the same weight. Pick a report.</p>
      <div class="tabs">${RECEIPTS.map((r, i) => `<button class="${i ? '' : 'on'}">${r.tab}</button>`).join('')}</div><div id="rOut"></div>`,
    init: root => {
      const KIND = { S: 'Strength', M: 'Motivator', C: 'Career fit' };
      const show = i => {
        const r = RECEIPTS[i], lens = LENS[r.tab];
        root.querySelectorAll('.tabs button').forEach((b, j) => b.classList.toggle('on', i === j));
        root.querySelector('#rOut').innerHTML = `<h3>${r.title}</h3><p class="note">${r.note}</p>` +
          (lens ? `<div class="lens"><p><small>This lens sees</small>${lens[0]}</p><p><small>Research support</small>${SUPPORT[lens[1]]}</p><p><small>Best used for</small>${lens[2]}</p></div>` : '') +
          (r.groups || []).map(([g, rows]) => `<h4>${g}</h4><div class="bars">${rows.map(([n, v, max]) => `<p><span>${n}</span><i style="--v:${v / max * 100}%"></i><em>${max === 100 ? v + '%' : v + '/' + max}</em></p>`).join('')}</div>`).join('') +
          (r.list ? `<h4>${r.listTitle || 'From the report'}</h4><ol class="rlist">${r.list.map(([k, t]) => `<li><small>${KIND[k] || '#' + k}</small>${t}</li>`).join('')}</ol>` : '') +
          (r.quotes ? `<h4>In her words</h4>${r.quotes.map(([k, q]) => `<blockquote><small>${k}</small>“${q}”</blockquote>`).join('')}` : '');
      };
      on(root, '.tabs button', 'click', (n, i) => show(i));
      show(0);
    }
  },
  {
    id: 'brain', kicker: 'The library · plate VII', title: 'Pick her <em>brain.</em>',
    build: () => `<p class="lede">Seven regions, seven sides of her, each one backed by her results. Tap a region to open it.</p>
      <div class="parts">${BRAIN.map((q, i) => `<button class="part${i ? '' : ' on'}"><small>${q.name}</small><b>${q.title}</b><span>${q.line}</span><span class="chips sm">${q.chips.map(c => `<i>${c}</i>`).join('')}</span><em>${q.thoughts.map(t => `“${t}”`).join(' ')}</em></button>`).join('')}</div>
      <p class="note">A metaphor, not neuroscience. Each part is a side of her that more than one test agrees on.</p>`,
    init: root => on(root, '.part', 'click', n => root.querySelectorAll('.part').forEach(x => x.classList.toggle('on', x === n)))
  },
  {
    id: 'mood', kicker: 'The coffee bar · the espresso machine', title: 'The mood meter',
    build: () => `<div class="gauge"><div class="g-bar"><i id="mBar"></i></div><b id="mPct">50%</b></div>
      <p class="reaction" id="mSay">Waiting to see what you do. Pick something below and see how she'd react.</p><p class="src" id="mWhy"></p>
      <h4>How to make her day</h4><div class="opts" id="mGood">${DELIGHT.map(([t]) => `<button>${t}</button>`).join('')}</div>
      <h4>How to annoy her</h4><div class="opts bad" id="mBad">${ANNOY.map(([t]) => `<button>${t}</button>`).join('')}</div>
      <h4>Build a scenario</h4><p class="note">Same behavior, different outcome. Pick one from each column.</p>
      <div class="scn">${[['what', 'What happened'], ['how', 'How they handled it'], ['next', 'What came next']].map(([k, t]) => `<div><small>${t}</small>${SCN[k].map((o, i) => `<button data-k="${k}" data-i="${i}">${o[0]}</button>`).join('')}</div>`).join('')}</div>
      <div class="answer" id="scnOut" hidden></div>`,
    init: root => {
      let mood = 50;
      const set = (d, [, react, why]) => {
        mood = clamp(mood + d, 0, 100);
        root.querySelector('#mBar').style.width = mood + '%'; root.querySelector('#mPct').textContent = mood + '%';
        root.querySelector('#mSay').textContent = react; root.querySelector('#mWhy').textContent = why;
        window.chime && chime(d > 0 ? [659.25, 783.99] : [329.63, 311.13], .07);
      };
      on(root, '#mGood button', 'click', (n, i) => set(15, DELIGHT[i]));
      on(root, '#mBad button', 'click', (n, i) => set(-15, ANNOY[i]));
      const pick = { what: null, how: null, next: null };
      on(root, '.scn button', 'click', b => {
        const k = b.dataset.k; pick[k] = +b.dataset.i;
        root.querySelectorAll(`.scn button[data-k="${k}"]`).forEach(x => x.classList.toggle('on', x === b));
        if (Object.values(pick).some(v => v === null)) return;
        const [, value, ev, noun] = SCN.what[pick.what], score = SCN.how[pick.how][1] + SCN.next[pick.next][1];
        const v = score >= 3 ? ['Totally fine.', 'Honesty plus a fix is exactly what she respects. She might even trust them more.']
          : score >= 0 ? ["She's okay, but she noticed.", 'The repair counted. The first move still registered.']
          : score >= -2 ? ['Polite on the outside. Trust dipped.', "She won't make a scene, but she'll plan around them next time."]
          : ['That one is going on the record.', `It isn't really the ${noun}. It's everything after it.`];
        const out = root.querySelector('#scnOut'); out.hidden = false;
        out.innerHTML = `<h3>${v[0]}</h3><p>${v[1]}</p><p class="src">Triggered value: ${value} · ${ev}</p>`;
      });
    }
  },
  {
    id: 'heart', kicker: 'The kitchen · the fridge', title: 'What her people know',
    build: () => `<figure class="photo"><img src="../../photos/01-fridge.jpg" alt="Suhani's fridge, covered in photos and notes"><figcaption>the fridge of a loved eldest sister</figcaption></figure>
      <p class="lede">Behind the boss energy is someone who remembers what makes each person special and loves wholeheartedly.</p>
      <div class="traits soft">${HEART.map(([t, d, ev], i) => `<div class="trait on"><small>0${i + 1}</small><b>${t}</b><span>${d}</span><em>${ev}</em></div>`).join('')}</div>`
  },
  {
    id: 'ask', kicker: 'The breakfast bay · the card deck', title: 'Ask her <em>personality.</em>',
    build: () => `<p class="lede">Pick a question. Every answer is built from her results, and cites them.</p>
      <div class="answer" id="aOut"></div><h4>Ask something else</h4><div class="opts qs">${ASK.map(([q]) => `<button>${q}</button>`).join('')}</div>`,
    init: root => {
      const show = i => {
        const [q, a, cites] = ASK[i];
        root.querySelectorAll('.qs button').forEach((b, j) => b.classList.toggle('on', i === j));
        root.querySelector('#aOut').innerHTML = `<h3>${q}</h3><p>${a}</p><div class="chips sm">${cites.map(c => `<span>${c}</span>`).join('')}</div>`;
      };
      on(root, '.qs button', 'click', (n, i) => show(i));
      show(1);
    }
  },
  {
    id: 'icks', kicker: 'The movie room · the rom-com shelf', title: 'Ick or <em>green flag?</em>',
    build: () => `<p class="lede">Call it. Ick, or green flag?</p><div id="deck"></div>`,
    init: root => {
      const deck = shuffle([
        ...ICKS.map(([who, what, why, instead], i) => ({ t: what, ick: true, head: who, body: `${why} <b>Instead:</b> ${instead}`, value: 'Crosses: ' + ICK_VALUES[i] })),
        ...DELIGHT.slice(0, 6).map(([t, react, why]) => ({ t: t + '.', ick: false, head: 'Green flag', body: `${react} ${why}`, value: 'Makes her day' }))
      ]);
      let i = 0, right = 0;
      const el = root.querySelector('#deck');
      const deal = () => {
        if (i >= deck.length) { el.innerHTML = `<p class="verdict">${right} / ${deck.length}</p><p class="lede">You read her ${right >= 15 ? 'perfectly' : right >= 11 ? 'pretty well' : 'about as well as a one-word texter'}.</p>`; return; }
        const c = deck[i];
        el.innerHTML = `<div class="ick-card"><small>${i + 1} / ${deck.length}</small><p>${c.t}</p></div><div class="row"><button class="pill ick" data-v="1">✕ Ick</button><button class="pill green" data-v="0">Green flag ✓</button></div><div class="qwhy" hidden></div>`;
        on(el, '.row button', 'click', n => {
          if (el.querySelector('.row.done')) return;
          el.querySelector('.row').classList.add('done');
          const ok = (n.dataset.v === '1') === c.ick; if (ok) right++;
          const w = el.querySelector('.qwhy'); w.hidden = false;
          w.innerHTML = `<p><b>${ok ? 'Yes.' : 'Nope.'} ${c.ick ? 'Ick' : 'Green flag'}: ${c.head}.</b> ${c.body}</p><p class="src">${c.value}</p><button class="pill sm">Next card →</button>`;
          w.querySelector('button').onclick = () => { i++; deal(); };
        });
      };
      deal();
    }
  },
  {
    id: 'palette', kicker: 'The sunroom · the paint table', title: 'Why her site looks like <em>this.</em>',
    build: () => `<p class="lede">Every colour on her portrait site comes from her results. The house dresses in her real-life palette instead: ivory, walnut, olive and dusty rose.</p>
      <div class="sw">${SWATCHES.map(([n, c, why]) => `<p><i style="--c:${c}"></i><b>${n}</b><span>${why}</span></p>`).join('')}</div>
      <p class="note">Type: Playfair Display for her drama, DM Sans for her clarity, and a monospace for the receipts.</p>`
  },
  {
    id: 'beat', kicker: 'The secret garden · under the roses', title: 'Open her <em>heart.</em>',
    build: () => `<p class="lede">Four chambers and two arteries, each one a part of how she loves.</p>
      <div class="parts">${HEARTPARTS.map((q, i) => `<button class="part${i ? '' : ' on'}"><small>${q.name}</small><b>${q.title}</b><span>${q.line}</span><span class="chips sm">${q.chips.map(c => `<i>${c}</i>`).join('')}</span><em>${q.thoughts.map(t => `“${t}”`).join(' ')}</em></button>`).join('')}</div>
      <p class="note">A metaphor, not neuroscience. Each part is a side of her that more than one test agrees on.</p>`,
    init: root => on(root, '.part', 'click', n => root.querySelectorAll('.part').forEach(x => x.classList.toggle('on', x === n)))
  },
  {
    id: 'built', kicker: 'The study · the desk', title: 'She built <em>this.</em>',
    build: () => `<p class="lede">Every test in this house is self-report. This one isn't. The house itself is the last piece of evidence: no WebGL, no 3D library, no framework. Every wall, every painted riser, every peony on the mural is code.</p>
      <div class="stats">
        <p><b id="sNodes">–</b><span>pieces of house</span></p><p><b>0</b><span>dependencies</span></p>
        <p><b id="sFps">–</b><span>frames a second</span></p><p><b id="sSeen">–</b><span>stops you've seen</span></p>
        <p><b id="sTime">–</b><span>time you've spent here</span></p><p><b>11</b><span>rooms</span></p></div>
`,
    init: (root, sub, api) => {
      const tick = () => {
        root.querySelector('#sNodes').textContent = world.querySelectorAll('.pl').length;
        root.querySelector('#sFps').textContent = api.fps();
        root.querySelector('#sSeen').textContent = `${api.seen()} of ${STOPS.length}`;
        const s = Math.round(performance.now() / 1000);
        root.querySelector('#sTime').textContent = s < 60 ? s + 's' : `${s / 60 | 0}m ${s % 60}s`;
      };
      tick();
      return setInterval(tick, 500);
    }
  },
  {
    id: 'spirit', kicker: 'The study · the gallery wall', title: 'Born to lead. <em>Built to protect.</em>',
    build: sub => `<p class="lede">Outspoken, driven, and quick to stand up. When something is unfair or someone she loves is threatened, the protector comes out.</p>
      <div class="traits">${SPIRIT.map(([t, d, ev], i) => `<button class="trait${i === (sub ?? 0) ? ' on' : ''}"><small>0${i + 1}</small><b>${t}</b><span>${d}</span><em>${ev}</em></button>`).join('')}</div>`,
    init: root => on(root, '.trait', 'click', n => { root.querySelectorAll('.trait').forEach(x => x.classList.toggle('on', x === n)); })
  },
  {
    id: 'values', kicker: 'The study · the sampler', title: 'Values, in order',
    build: () => `<ol class="values">${VALUES.map(([v, s], i) => `<li><b>${v}</b><em>${s}</em><span>${VALUE_WHY[i]}</span></li>`).join('')}</ol>
      <h4>When her values collide</h4><div class="dilemmas">${DILEMMAS.map(([a, as, b, bs, scene, verdict]) => `<button class="dilemma"><span class="vs">${a} <small>${as}</small> <i>vs</i> ${b} <small>${bs}</small></span><span class="scene">${scene}</span><span class="verdict">${verdict}</span></button>`).join('')}</div>`,
    init: root => on(root, '.dilemma', 'click', n => n.classList.toggle('on'))
  },
  {
    id: 'rip', kicker: 'The study · the linen board', title: 'Absolutely <em>not.</em>',
    build: () => `<p class="lede">Real jobs people take in 2026 that she'd likely quit on day one, based on how her results read. Tap an offer to bring her back to life.</p>
      <div class="tombs">${TOMBS.map(([job, death, why, revive, match]) => `<button class="tomb"><small>Offer declined</small><b>${job}</b><span class="d">${death}</span><span class="r"><i>Revived.</i> ${revive}<em>${why} · ${match}</em></span></button>`).join('')}</div>`,
    init: root => on(root, '.tomb', 'click', n => n.classList.toggle('on'))
  },
  {
    id: 'thrive', kicker: 'The study · the world map', title: "Where she'd <em>thrive.</em>",
    build: () => `<p class="lede">Not job titles: the conditions where her personality does its best work. Her Holland code is ASE, three types side by side on the hexagon, which makes her profile unusually consistent.</p>
      <div class="riasec">${RIASEC.map(([l, n], i) => `<button class="${TOP3.includes(l) ? 'top' : ''}${i === 2 ? ' on' : ''}" data-i="${i}"><b>${l}</b><small>${n}</small></button>`).join('')}</div>
      <p class="ri-say" id="riSay"></p>
      <h4>Five places that have it all</h4>
      <div class="envs">${ENVS.map(([t, f, ev, need, roles], i) => `<details${i ? '' : ' open'}><summary><b>${t}</b><small>${f}</small></summary><p>${need}</p><p class="src">${ev}</p><p class="roles">${roles}</p></details>`).join('')}</div>`,
    init: root => {
      const show = i => { const [l, n, v, dim, d] = RIASEC[i]; root.querySelector('#riSay').innerHTML = `<b>${l} · ${n} · ${v}%</b> ${dim}. ${d}`; };
      on(root, '.riasec button', 'click', n => { root.querySelectorAll('.riasec button').forEach(b => b.classList.toggle('on', b === n)); show(+n.dataset.i); });
      show(2);
    }
  },
  {
    id: 'pattern', kicker: 'The reading nook · her journal', title: 'A creative traditionalist who leads through people',
    build: () => `<p class="lede">Ten different assessments, one person. Five qualities keep showing up. And one trait tells you a little; two together tell you what she actually does.</p>
      <button class="combo" id="combo">${COMBOS[1]}</button>
      <div class="meets">${MEETS.map(([x, t, d]) => `<div><small>${x}</small><b>${t}</b><span>${d}</span></div>`).join('')}</div>`,
    init: root => { let i = 1; const c = root.querySelector('#combo'); c.onclick = () => { c.innerHTML = COMBOS[i = (i + 1) % COMBOS.length]; }; }
  },
  {
    id: 'words', kicker: 'Her closet · the long mirror', title: 'In one word each',
    build: () => `<p class="lede">If you had to describe her. Guess first, then tap to flip.</p>
      <div class="words">${WORDS.map(([k, w]) => `<button class="word"><small>${k}</small><b>${w}</b></button>`).join('')}</div>
      <button class="pill ghost sm" id="flipAll">Flip them all</button>`,
    init: root => {
      on(root, '.word', 'click', n => n.classList.toggle('on'));
      root.querySelector('#flipAll').onclick = () => root.querySelectorAll('.word').forEach(w => w.classList.add('on'));
    }
  },
  {
    id: 'quiz', kicker: 'The attic · the project table', title: 'What would <em>she do?</em>',
    build: () => `<p class="lede">Ten situations. Every option is something she might do. Only one is what she would do first.</p><div id="qz"></div>`,
    init: root => {
      let q = 0, right = 0;
      const box = root.querySelector('#qz');
      const ask = () => {
        if (q >= QUIZ.length) {
          box.innerHTML = `<p class="verdict">${right} / ${QUIZ.length}</p><p class="lede">${right >= 8 ? "You know her. You're probably in the inner circle." : right >= 5 ? 'Solid. You would survive a group project with her.' : 'Read the rest of the house, then try again.'}</p><button class="pill sm" id="qAgain">Play again</button>`;
          box.querySelector('#qAgain').onclick = () => { q = right = 0; ask(); };
          return;
        }
        const [s, opts, ans, why] = QUIZ[q];
        const order = shuffle(opts.map((o, i) => [o, i]));
        box.innerHTML = `<p class="qn">Question ${q + 1} of ${QUIZ.length}</p><h3>${s}</h3><div class="opts quiz">${order.map(([o, i]) => `<button data-i="${i}">${o}</button>`).join('')}</div><div class="qwhy" hidden></div>`;
        on(box, '.quiz button', 'click', n => {
          if (box.querySelector('.quiz.done')) return;
          const ok = +n.dataset.i === ans; if (ok) right++;
          box.querySelector('.quiz').classList.add('done');
          box.querySelectorAll('.quiz button').forEach(b => { b.disabled = true; if (+b.dataset.i === ans) b.classList.add('right'); });
          if (!ok) n.classList.add('wrong');
          const w = box.querySelector('.qwhy'); w.hidden = false;
          w.innerHTML = `<p><b>${ok ? 'Right.' : 'Not quite.'}</b> ${why}</p><p class="src">${QUIZ_EVIDENCE[q]}</p><button class="pill sm">${q + 1 < QUIZ.length ? 'Next question →' : 'See your score'}</button>`;
          w.querySelector('button').onclick = () => { q++; ask(); };
          window.chime && chime(ok ? [783.99, 1046.5] : [311.13], .07);
        });
      };
      ask();
    }
  },
  {
    id: 'photos', kicker: 'The attic · the open trunk', title: 'Life in <em>frames.</em>', next: 'Back to the door',
    build: sub => `<figure class="photo big"><img id="phImg" src="../../${PHOTOS[sub ?? 0].src}" alt=""><figcaption id="phCap">${esc(PHOTOS[sub ?? 0].cap)}</figcaption></figure>
      <div class="row"><button class="pill ghost sm" id="phPrev">←</button><span class="count" id="phN"></span><button class="pill ghost sm" id="phNext">→</button></div>
      <div class="thumbs">${PHOTOS.map(p => `<button><img src="../../${p.src}" alt="${esc(p.cap)}" loading="lazy"></button>`).join('')}</div>`,
    init: (root, sub, api) => {
      let i = sub ?? 0;
      const show = (k, move) => {
        i = (k + PHOTOS.length) % PHOTOS.length;
        root.querySelector('#phImg').src = '../../' + PHOTOS[i].src; root.querySelector('#phCap').textContent = PHOTOS[i].cap;
        root.querySelector('#phN').textContent = `${i + 1} / ${PHOTOS.length}`;
        root.querySelectorAll('.thumbs button').forEach((b, j) => b.classList.toggle('on', i === j));
        
      };
      root.querySelector('#phPrev').onclick = () => show(i - 1, true);
      root.querySelector('#phNext').onclick = () => show(i + 1, true);
      on(root, '.thumbs button', 'click', (n, j) => show(j, true));
      show(i, false);
    }
  }
];
