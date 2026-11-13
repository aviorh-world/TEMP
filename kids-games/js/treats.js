'use strict';
/* 🍦🍕 מכינים ואוכלים – גלידה או פיצה, ובסוף חיה חמודה אוכלת ועושה גרפס */
function animalSVG(type) {
  const A = { bear: ['#c08552', '#f5dcc0', '#8a5a33'], cat: ['#ffb35c', '#fff1de', '#e08a2c'], bunny: ['#f6f1f7', '#ffe3ee', '#ffadc9'], panda: ['#ffffff', '#ffffff', '#2b2b33'] }[type];
  const [b, l, e] = A;
  let ears = '';
  if (type === 'bear') ears = `<circle cx="80" cy="64" r="32" fill="${b}"/><circle cx="80" cy="64" r="17" fill="${l}"/><circle cx="220" cy="64" r="32" fill="${b}"/><circle cx="220" cy="64" r="17" fill="${l}"/>`;
  if (type === 'panda') ears = `<circle cx="82" cy="64" r="32" fill="${e}"/><circle cx="218" cy="64" r="32" fill="${e}"/>`;
  if (type === 'cat') ears = `<path d="M66,104 L78,24 L136,66Z" fill="${b}" stroke="${e}" stroke-width="3" stroke-linejoin="round"/><path d="M80,88 L86,46 L118,70Z" fill="#ffb3c8"/><path d="M234,104 L222,24 L164,66Z" fill="${b}" stroke="${e}" stroke-width="3" stroke-linejoin="round"/><path d="M220,88 L214,46 L182,70Z" fill="#ffb3c8"/>`;
  if (type === 'bunny') ears = `<ellipse cx="112" cy="40" rx="22" ry="62" transform="rotate(-10 112 40)" fill="${b}" stroke="#e8dcea" stroke-width="3"/><ellipse cx="112" cy="44" rx="11" ry="46" transform="rotate(-10 112 44)" fill="#ffc2d8"/><ellipse cx="188" cy="40" rx="22" ry="62" transform="rotate(10 188 40)" fill="${b}" stroke="#e8dcea" stroke-width="3"/><ellipse cx="188" cy="44" rx="11" ry="46" transform="rotate(10 188 44)" fill="#ffc2d8"/>`;
  const patches = type === 'panda' ? `<ellipse cx="112" cy="130" rx="24" ry="30" transform="rotate(25 112 130)" fill="${e}"/><ellipse cx="188" cy="130" rx="24" ry="30" transform="rotate(-25 188 130)" fill="${e}"/>` : '';
  const stripes = type === 'cat' ? `<path d="M150,50 V76 M130,54 L134,76 M170,54 L166,76" stroke="${e}" stroke-width="6" stroke-linecap="round"/>` : '';
  const whisk = type === 'cat' || type === 'bunny' ? `<g stroke="#8a7a8a" stroke-width="2.5" stroke-linecap="round"><path d="M100,168 L64,160 M100,176 L62,180 M200,168 L236,160 M200,176 L238,180"/></g>` : '';
  const nose = type === 'bunny' || type === 'cat' ? '#ff7aa8' : '#3b2a2a';
  const eyeC = type === 'panda' ? '#fff' : '#2b2133';
  return `<svg viewBox="0 0 300 330" xmlns="http://www.w3.org/2000/svg">
    ${ears}
    <g class="belly"><ellipse cx="150" cy="268" rx="108" ry="72" fill="${b}" stroke="rgba(0,0,0,.06)" stroke-width="3"/><ellipse cx="150" cy="276" rx="64" ry="48" fill="${l}"/></g>
    <circle cx="150" cy="138" r="90" fill="${b}" stroke="rgba(0,0,0,.06)" stroke-width="3"/>
    ${patches}${stripes}
    <g class="eo"><circle cx="114" cy="130" r="13" fill="${eyeC === '#fff' ? '#2b2133' : eyeC}"/><circle cx="118" cy="125" r="5" fill="#fff"/><circle cx="110" cy="135" r="2" fill="#fff"/>
      <circle cx="186" cy="130" r="13" fill="#2b2133"/><circle cx="190" cy="125" r="5" fill="#fff"/><circle cx="182" cy="135" r="2" fill="#fff"/></g>
    <g class="eh" stroke="${type === 'panda' ? '#fff' : '#2b2133'}" stroke-width="6" fill="none" stroke-linecap="round"><path d="M100,134 Q114,118 128,134"/><path d="M172,134 Q186,118 200,134"/></g>
    <ellipse cx="150" cy="176" rx="44" ry="31" fill="${l}" stroke="rgba(0,0,0,.05)" stroke-width="2"/>
    <ellipse cx="150" cy="158" rx="13" ry="9" fill="${nose}"/><ellipse cx="146" cy="155" rx="4" ry="2.5" fill="#fff" opacity=".6"/>
    <path class="mc" d="M131,178 Q140,190 150,178 Q160,190 169,178" stroke="#3b2a2a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <g class="mo"><ellipse cx="150" cy="188" rx="23" ry="21" fill="#5a1e2a"/><ellipse cx="150" cy="198" rx="14" ry="8" fill="#ff7aa8"/></g>
    ${whisk}
    <ellipse cx="94" cy="170" rx="15" ry="9" fill="#ff8fab" opacity=".5"/><ellipse cx="206" cy="170" rx="15" ry="9" fill="#ff8fab" opacity=".5"/>
    <path d="M108,218 L192,218 L150,256 Z" fill="#fff" stroke="#ff9ecf" stroke-width="3" stroke-linejoin="round"/><circle cx="138" cy="228" r="3" fill="#ff9ecf"/><circle cx="160" cy="226" r="3" fill="#ff9ecf"/><circle cx="150" cy="240" r="3" fill="#ff9ecf"/>
    <ellipse cx="92" cy="306" rx="28" ry="17" fill="${b}" stroke="rgba(0,0,0,.08)" stroke-width="3"/><ellipse cx="208" cy="306" rx="28" ry="17" fill="${b}" stroke="rgba(0,0,0,.08)" stroke-width="3"/>
  </svg>`;
}

const TREAT_HUNGRY = ['יאמי! אני כל כך רעב!', 'וואו, זה נראה טעים!', 'תני לי ביס!'];
registerGame({
  lines: [...TREAT_HUNGRY, 'תות', 'שוקולד', 'וניל', 'מנטה', 'אוכמניות', 'מנגו', 'בננה', 'מסטיק', 'זיתים', 'פטריות', 'סלמי', 'תירס', 'פלפל', 'עגבניות', 'אננס', 'בזיליקום',
    'וואו, זה מספיק גבוה!', 'קודם כדור גלידה!', 'רוטב עגבניות', 'גבינה!', 'אופים בתנור!', 'דינג! הפיצה מוכנה!', 'מי יאכל?', 'אממממ...', 'אופס! סליחה! היה טעים מאוד!', 'היה טעים!'],
  id: 'treats', name: 'גלידה ופיצה', emoji: '🍦', color: '#ff9ec4', say: 'מה נכין היום? גלידה או פיצה?',
  mount(root, s) {
    const hash = i => { const x = Math.sin(i * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); };

    function chooser() {
      root.innerHTML = `<div class="picker"><h3>מה נכין? 😋</h3><div class="opts">
        <button class="opt" data-k="ice" style="--c:#ff9ec4;--i:0"><span class="oe">🍦</span>גלידה</button>
        <button class="opt" data-k="pizza" style="--c:#ffb347;--i:1"><span class="oe">🍕</span>פיצה</button></div></div>`;
      $$('.opt', root).forEach(b => b.onclick = () => { Sound.pop(); b.dataset.k === 'ice' ? ice() : pizza(); });
    }

    function shell(cls) {
      root.innerHTML = `<div class="tr ${cls}"><div class="tr-stage"></div><div class="tr-tray"><div class="tr-row r1"></div><div class="tr-row r2"></div></div></div>`;
      return { stage: $('.tr-stage', root), r1: $('.r1', root), r2: $('.r2', root) };
    }
    function btn(row, html, c, fn, cls = '') {
      const b = el('button', 'tb ' + cls, html); b.style.setProperty('--c', c);
      b.onclick = () => { Sound.init(); fn(b); }; row.appendChild(b); return b;
    }
    const bump = b => { b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce'); };

    /* ---------- גלידה ---------- */
    function ice() {
      const { stage, r1, r2 } = shell('');
      const st = { cont: 'cone', scoops: [], spr: false, cherry: false, syrup: false, extras: [] };
      const FLAV = [['#ff9ec4', '🍓', 'תות'], ['#8a5233', '🍫', 'שוקולד'], ['#fff3d6', '🤍', 'וניל'], ['#9ff0c8', '🌿', 'מנטה'], ['#b69cff', '🫐', 'אוכמניות'], ['#ffb347', '🥭', 'מנגו'], ['#fff07a', '🍌', 'בננה'], ['#7fd8ff', '🍬', 'מסטיק']];
      const SPR = ['#ff4d8d', '#ffd23f', '#4cc9f0', '#2ec27e', '#9b5de5', '#fff'];
      function render(drop = -1) {
        const n = st.scoops.length;
        stage.innerHTML = `<div class="ic"><div class="ic-stack">${st.scoops.map((c, i) => {
          let inner = '';
          if (st.spr) for (let k = 0; k < 9; k++) inner += `<i class="spr" style="left:${12 + hash(i * 17 + k) * 70}%;top:${8 + hash(i * 29 + k * 3) * 55}%;background:${SPR[k % SPR.length]};transform:rotate(${hash(i + k * 7) * 180}deg)"></i>`;
          if (i === n - 1 && st.syrup) inner = '<div class="syrup"></div>' + inner;
          if (i === n - 1) inner += st.extras.map((e, k) => `<span class="extra" style="left:${[8, 62, 35, 75, 0][k % 5]}%;top:${[-10, -6, -30, 30, 30][k % 5]}%">${e}</span>`).join('');
          return `<div class="scoop${i === drop ? ' drop' : ''}" style="--sc:${c}">${inner}</div>`;
        }).join('')}${st.cherry && n ? '<div class="cherry">🍒</div>' : ''}</div><div class="${st.cont}"></div></div>`;
        feedBtn.classList.toggle('hide', !n);
      }
      FLAV.forEach(([c, e, name]) => btn(r1, `<span>${e}</span>`, c, b => {
        if (st.scoops.length >= 5) { Sound.boing(); Voice.say('וואו, זה מספיק גבוה!'); return; }
        st.scoops.push(c); render(st.scoops.length - 1); Sound.pop(); Voice.say(name); bump(b);
      }, 'tub'));
      const needScoop = () => { if (!st.scoops.length) { Sound.wrong(); Voice.say('קודם כדור גלידה!'); return true; } };
      btn(r2, '🍦', '#e7a04f', () => { st.cont = 'cone'; render(); Sound.tap(); });
      btn(r2, '🥣', '#ff5d9e', () => { st.cont = 'cup'; render(); Sound.tap(); });
      btn(r2, '🌈', '#9b5de5', b => { if (needScoop()) return; st.spr = true; render(); Sound.sparkle(); bump(b); });
      btn(r2, '🍯', '#8a5233', b => { if (needScoop()) return; st.syrup = true; render(); Sound.munch(); bump(b); });
      btn(r2, '🍒', '#ff4d4d', b => { if (needScoop()) return; st.cherry = true; render(); Sound.ding(5); bump(b); });
      ['🍪', '🍓', '⭐', '🍬', '🫐'].forEach(e => btn(r2, e, '#ffc300', b => { if (needScoop()) return; if (st.extras.length < 5) st.extras.push(e); render(); Sound.pop(); bump(b); }));
      const feedBtn = btn(r2, '😋 להאכיל', '#1f8a4f', () => feed(stage.innerHTML, 'ice'), 'big hide');
      render();
    }

    /* ---------- פיצה ---------- */
    function pizza() {
      const { stage, r1, r2 } = shell('pizza');
      const st = { sauce: false, cheese: false, baked: false, tops: [] };
      let newFrom = 1e9;
      const blob = (() => { let p = ''; for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, r = 116 + Math.sin(i * 2.3) * 7; p += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1); } return p + 'Z'; })();
      const TOP = {
        olive: ['זיתים', '<circle r="10" fill="#2b2b2b"/><circle r="4" fill="#6b5040"/>'],
        mush: ['פטריות', '<path d="M-13,2 Q-13,-13 0,-13 Q13,-13 13,2 Z" fill="#eadcc8" stroke="#b39a80" stroke-width="2"/><rect x="-4.5" y="1" width="9" height="11" rx="3" fill="#f6eee2" stroke="#b39a80" stroke-width="2"/>'],
        salami: ['סלמי', '<circle r="16" fill="#c0392b"/><circle cx="-5" cy="-4" r="2.6" fill="#f08a7e"/><circle cx="6" cy="2" r="2.2" fill="#f08a7e"/><circle cx="-2" cy="8" r="2" fill="#f08a7e"/>'],
        corn: ['תירס', '<circle cx="-6" r="5" fill="#ffd23f"/><circle cx="5" cy="-3" r="5" fill="#ffd23f"/><circle cx="2" cy="7" r="5" fill="#ffc300"/>'],
        pepper: ['פלפל', '<path d="M-11,5 A12,12 0 1,1 11,5" fill="none" stroke="#2ecc71" stroke-width="6" stroke-linecap="round"/>'],
        tomato: ['עגבניות', '<circle r="14" fill="#ff5a4f"/><circle r="9" fill="#ff8a7a"/><circle cx="-3" cy="-2" r="2" fill="#ffe9a8"/><circle cx="3" cy="3" r="2" fill="#ffe9a8"/>'],
        pine: ['אננס', '<path d="M-10,8 L0,-11 L10,8Z" fill="#ffe36e" stroke="#e6c240" stroke-width="2" stroke-linejoin="round"/>'],
        basil: ['בזיליקום', '<ellipse rx="11" ry="5.5" fill="#3fae49"/><path d="M-10,0 H10" stroke="#2a8a35" stroke-width="1.5"/>']
      };
      function render() {
        const spots = st.baked ? [[-40, -30], [30, 50], [60, -20], [-60, 40], [10, -70], [-10, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#d98c2b" opacity=".55"/>`).join('') : '';
        stage.innerHTML = `<svg class="pz" viewBox="-160 -160 320 320">
          <circle r="150" fill="${st.baked ? '#d8913f' : '#e9b670'}"/><circle r="146" fill="none" stroke="${st.baked ? '#b8722a' : '#cf9a55'}" stroke-width="6"/>
          <circle r="132" fill="#f8dfa8"/>
          <g class="sauce" style="transform:scale(${st.sauce ? 1 : 0})"><circle r="126" fill="#d63a2a"/><circle r="120" fill="none" stroke="#b02a1c" stroke-width="4" stroke-dasharray="18 14"/></g>
          ${st.cheese ? `<path d="${blob}" fill="${st.baked ? '#ffc93a' : '#ffe680'}" class="${st.cheeseNew ? 'add' : ''}" style="transform-box:fill-box;transform-origin:center"/>${spots}` : ''}
          ${st.tops.map((t, i) => `<g transform="translate(${t.x} ${t.y}) rotate(${t.r})"><g class="${i >= newFrom ? 'add' : ''}" style="animation-delay:${(i - newFrom) * .06}s">${TOP[t.k][1]}</g></g>`).join('')}
          ${st.baked ? '<g opacity=".7"><path d="M-30,-150 q10,-20 0,-40 q-10,-20 0,-40" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M30,-150 q10,-20 0,-40 q-10,-20 0,-40" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/></g>' : ''}
        </svg>`;
        st.cheeseNew = false; newFrom = 1e9;
        feedBtn.classList.toggle('hide', !(st.sauce || st.cheese || st.tops.length));
      }
      btn(r1, '🥫', '#d63a2a', b => { st.sauce = true; render(); Sound.whoosh(); Voice.say('רוטב עגבניות'); bump(b); });
      btn(r1, '🧀', '#ffc300', b => { st.cheese = true; st.cheeseNew = true; render(); Sound.pop(); Voice.say('גבינה!'); bump(b); });
      btn(r1, '🔥', '#ff8c1a', () => {
        if (st.baked) { Sound.tap(); return; }
        const o = el('div', 'oven', '<span>🔥</span>'); stage.appendChild(o); Sound.whoosh(); Voice.say('אופים בתנור!');
        s.later(() => { o.remove(); st.baked = true; render(); Sound.ding(7); Sound.ding(12); Voice.say('דינג! הפיצה מוכנה!'); const c = center(stage); FX.burst(c.x, c.y, ['✨', '⭐'], 10, 34); }, 2200);
      });
      Object.entries(TOP).forEach(([k, [name, g]]) => btn(r2, `<svg viewBox="-20 -20 40 40" width="70%">${g}</svg>`, '#ffb347', b => {
        if (st.tops.length > 60) { Sound.boing(); return; }
        newFrom = st.tops.length;
        for (let i = 0; i < 5; i++) {
          let x, y, tries = 0;
          do { const a = rand(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 98; x = Math.cos(a) * r; y = Math.sin(a) * r; tries++; }
          while (tries < 12 && st.tops.some(t => Math.hypot(t.x - x, t.y - y) < 22));
          st.tops.push({ k, x: +x.toFixed(1), y: +y.toFixed(1), r: randi(0, 359) });
        }
        render(); Sound.pop(); Voice.say(name); bump(b);
      }));
      const feedBtn = btn(r1, '😋 להאכיל', '#1f8a4f', () => feed(stage.innerHTML, 'pizza'), 'big hide');
      render();
    }

    /* ---------- האכלה + גרפס ---------- */
    function feed(foodHTML, kind) {
      Sound.chime();
      const f = el('div', 'feed');
      f.innerHTML = `<div class="picker" style="background:transparent"><h3>מי יאכל? 🍽️</h3><div class="opts">
        ${[['bear', '🐻'], ['cat', '🐱'], ['bunny', '🐰'], ['panda', '🐼']].map(([k, e], i) => `<button class="opt" data-k="${k}" style="--c:#ffb347;--i:${i}"><span class="oe">${e}</span></button>`).join('')}</div></div>`;
      $('.tr', root).appendChild(f);
      Voice.say('מי יאכל?');
      $$('.opt', f).forEach(b => b.onclick = () => { Sound.pop(); eat(b.dataset.k); });

      function eat(type) {
        f.innerHTML = `<div class="animal">${animalSVG(type)}</div><div class="table"><div class="plate"><div class="food">${foodHTML}</div><div class="tapme">👆</div></div></div>`;
        const an = $('.animal', f), plate = $('.plate', f), food = $('.food', f);
        food.style.transition = 'transform .3s';
        const sty = el('style'); sty.textContent = '.feed .food .ic{font-size:clamp(5px,.8vh,8px)}.feed .food .pz{width:min(30vmin,22vh)}';
        f.appendChild(sty);
        Voice.say(pick(TREAT_HUNGRY));
        let bites = 0, busy = false;
        plate.onclick = () => {
          if (busy || bites >= 4) return;
          busy = true; bites++;
          const tap = $('.tapme', f); if (tap) tap.remove();
          plate.classList.add('bite'); an.classList.add('open');
          s.later(() => {
            an.classList.remove('open'); an.classList.remove('chomp'); void an.offsetWidth; an.classList.add('chomp');
            Sound.munch(); plate.classList.remove('bite');
            food.style.transform = `scale(${1 - bites * .24})`;
            const c = center(plate); FX.burst(c.x, c.y - 60, kind === 'ice' ? ['💗', '🤍', '✨'] : ['🟡', '🧀', '✨'], 7, 24);
            busy = false;
            if (bites >= 4) { food.style.opacity = 0; done(); }
          }, 330);
        };
        function done() {
          s.later(() => { an.classList.add('full'); Voice.say('אממממ...'); }, 600);
          s.later(() => {
            an.classList.add('open', 'burping', 'happy'); Sound.burp();
            const bp = el('div', 'burp', 'בּוּרְרְרְפּ!'); f.appendChild(bp);
            const c = center(an); FX.burst(c.x, c.y - 40, ['💨', '🫧', '💖'], 10, 40);
          }, 1700);
          s.later(() => { an.classList.remove('open'); Voice.say('אופס! סליחה! היה טעים מאוד!'); FX.burst(center(an).x, center(an).y, ['💖', '😋', '⭐'], 12, 36); }, 2800);
          s.later(() => celebrate({ emoji: '😋', title: 'היה טעים!', stars: 2, again: chooser }), 4800);
        }
      }
    }
    chooser();
  }
});
