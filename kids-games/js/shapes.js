'use strict';
/* 🔷 צורות וצבעים – גוררים צורה לצל שלה, וכדורים לדלי בצבע שלהם */
const SHAPES = (() => {
  const star = (() => { let p = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 20 : 46; p += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(1) + ',' + (54 + r * Math.sin(a)).toFixed(1); } return p + 'Z'; })();
  const hex = (() => { let p = ''; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, r = 44; p += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1); } return p + 'Z'; })();
  return {
    circle: { n: 'עיגול', d: 'M50,8 A42,42 0 1,1 49.9,8 Z' },
    square: { n: 'ריבוע', d: 'M20,10 H80 Q90,10 90,20 V80 Q90,90 80,90 H20 Q10,90 10,80 V20 Q10,10 20,10 Z' },
    triangle: { n: 'משולש', d: 'M50,8 L94,88 H6 Z' },
    star: { n: 'כוכב', d: star },
    heart: { n: 'לב', d: 'M50,90 C20,68 5,52 5,32 C5,17 17,7 30,7 C40,7 46,13 50,21 C54,13 60,7 70,7 C83,7 95,17 95,32 C95,52 80,68 50,90 Z' },
    rhombus: { n: 'מעוין', d: 'M50,4 L93,50 L50,96 L7,50 Z' },
    hexagon: { n: 'משושה', d: hex }
  };
})();
function shapeSVG(k, fill, face = true) {
  const sh = SHAPES[k];
  const f = face ? `<g fill="#3b2f4a"><circle cx="40" cy="48" r="4.5"/><circle cx="60" cy="48" r="4.5"/></g>
    <circle cx="41.5" cy="46.5" r="1.5" fill="#fff"/><circle cx="61.5" cy="46.5" r="1.5" fill="#fff"/>
    <path d="M42,59 Q50,66 58,59" stroke="#3b2f4a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="33" cy="58" r="4" fill="#fff" opacity=".35"/><circle cx="67" cy="58" r="4" fill="#fff" opacity=".35"/>` : '';
  return `<svg viewBox="0 0 100 100"><path d="${sh.d}" fill="${fill}" stroke="rgba(0,0,0,.18)" stroke-width="4" stroke-linejoin="round"/>
    <path d="${sh.d}" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="3" stroke-linejoin="round" transform="translate(50 50) scale(.82) translate(-50 -50)"/>${f}</svg>`;
}

registerGame({
  id: 'shapes', name: 'צורות וצבעים', emoji: '🔷', color: '#4cc9f0', say: 'צורות וצבעים! גררי כל צורה למקום שלה',
  mount(root, s) {
    const ROUNDS = [['shape', 3], ['color', 3], ['shape', 4], ['color', 3], ['shape', 5], ['color', 4]];
    root.innerHTML = `<div class="sh"><div class="sh-dots">${ROUNDS.map(() => '<i></i>').join('')}</div>
      <div class="sh-board"></div><div class="sh-tray"></div></div>`;
    const board = $('.sh-board', root), tray = $('.sh-tray', root);
    let r = 0, left = 0;

    function roundDone() {
      $$('.sh-dots i', root)[r].classList.add('on');
      s.later(() => {
        const c = center(board); FX.confetti(c.x, c.y, 40); Sound.chime();
        Voice.say(pick(['כל הכבוד!', 'מעולה!', 'יופי!', 'איזה יופי!']));
        Stars.add(c.x, c.y, 1);
      }, 500);
      s.later(() => { r++; if (r < ROUNDS.length) start(); else celebrate({ emoji: '🌈', title: 'את אלופה של צורות וצבעים!', again: () => { r = 0; $$('.sh-dots i', root).forEach(i => i.classList.remove('on')); start(); } }); }, 2000);
    }

    function shapeRound(n) {
      const keys = shuffle(Object.keys(SHAPES)).slice(0, n);
      const cols = shuffle(COLORS).slice(0, n);
      board.innerHTML = ''; tray.innerHTML = ''; left = n;
      keys.forEach((k, i) => {
        const sil = el('div', 'sil', `<svg viewBox="0 0 100 100"><path d="${SHAPES[k].d}" fill="rgba(59,47,74,.10)" stroke="rgba(59,47,74,.35)" stroke-width="4" stroke-dasharray="9 7" stroke-linejoin="round"/></svg>`);
        sil.dataset.k = k; board.appendChild(sil);
      });
      shuffle(keys).forEach((k, i) => {
        const col = cols[keys.indexOf(k)];
        const p = el('div', 'piece', shapeSVG(k, col.c)); p.style.setProperty('--i', i); p.dataset.k = k;
        tray.appendChild(p);
        draggable(p, {
          onTap: () => { Voice.say(SHAPES[k].n); p.classList.remove('bounce'); void p.offsetWidth; p.classList.add('bounce'); },
          onDrop: (x, y) => {
            const target = $$('.sil', board).find(e => !e.dataset.done && hit(e, x, y, 30));
            if (!target) return false;
            if (target.dataset.k !== k) { Sound.wrong(); target.classList.remove('shake'); void target.offsetWidth; target.classList.add('shake'); return false; }
            target.dataset.done = 1; target.innerHTML = shapeSVG(k, col.c); target.classList.add('ok');
            p.remove(); Sound.ding(left); Voice.say(SHAPES[k].n);
            const c = center(target); FX.burst(c.x, c.y, ['✨', '⭐'], 8, 30);
            if (--left === 0) roundDone();
            return true;
          }
        });
      });
    }

    function bucketSVG(c) {
      return `<svg viewBox="0 0 120 110"><ellipse cx="60" cy="20" rx="52" ry="12" fill="${c}" opacity=".55"/>
        <path d="M8,20 L20,100 Q60,112 100,100 L112,20 Q60,34 8,20Z" fill="${c}" stroke="rgba(0,0,0,.15)" stroke-width="3"/>
        <ellipse cx="60" cy="20" rx="52" ry="12" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3"/>
        <ellipse cx="60" cy="22" rx="46" ry="8" fill="rgba(0,0,0,.18)"/>
        <path d="M22,36 L30,90" stroke="rgba(255,255,255,.45)" stroke-width="6" stroke-linecap="round"/>
        <circle cx="48" cy="58" r="5" fill="#3b2f4a"/><circle cx="72" cy="58" r="5" fill="#3b2f4a"/>
        <circle cx="49.5" cy="56.5" r="1.7" fill="#fff"/><circle cx="73.5" cy="56.5" r="1.7" fill="#fff"/>
        <path d="M50,70 Q60,79 70,70" stroke="#3b2f4a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
    }

    function colorRound(n) {
      const cols = shuffle(COLORS).slice(0, n);
      board.innerHTML = ''; tray.innerHTML = '';
      const per = n > 3 ? 2 : 2, items = shuffle(cols.flatMap(c => Array(per).fill(c)));
      left = items.length;
      items.forEach((c, i) => {
        const b = el('div', 'ball'); b.style.setProperty('--c', c.c); b.style.setProperty('--i', i); b.style.position = 'relative';
        b.innerHTML = `<span class="bf">${pick(['🙂', '😊', '😄', '😺', '🌟'])}</span>`;
        board.appendChild(b);
        draggable(b, {
          onTap: () => { Voice.say(c.n); },
          onDrop: (x, y) => {
            const bk = $$('.bucket', tray).find(e => hit(e, x, y, 26));
            if (!bk) return false;
            if (bk.dataset.c !== c.c) { Sound.wrong(); bk.classList.remove('shake'); void bk.offsetWidth; bk.classList.add('shake'); return false; }
            b.remove(); bk.classList.remove('ok'); void bk.offsetWidth; bk.classList.add('ok');
            Sound.ding(items.length - left); Voice.say(c.n);
            const cc = center(bk); FX.burst(cc.x, cc.y - 30, ['✨', '💖'], 7, 28);
            if (--left === 0) roundDone();
            return true;
          }
        });
      });
      cols.forEach(c => { const bk = el('div', 'bucket', bucketSVG(c.c)); bk.dataset.c = c.c; tray.appendChild(bk); });
    }

    function start() {
      const [type, n] = ROUNDS[r];
      if (type === 'shape') shapeRound(n); else colorRound(n);
      if (r === 1) s.later(() => Voice.say('עכשיו גררי כל כדור לדלי בצבע שלו'), 300);
    }
    start();
  }
});
